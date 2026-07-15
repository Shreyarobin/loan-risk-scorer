from fastapi import FastAPI
from pydantic import BaseModel
import joblib
import json
import pandas as pd
import numpy as np
import torch
from transformers import pipeline, AutoTokenizer, AutoModelForTokenClassification, AutoModelForCausalLM
from sentence_transformers import SentenceTransformer
import psycopg2
from groq import Groq
import os
from dotenv import load_dotenv
from peft import PeftModel
from agent import build_agent_graph

load_dotenv()

app = FastAPI(title="Loan Risk Scorer")

# Load the model and schema once, when the server starts
model = joblib.load("../../models/risk_model.pkl")
shap_explainer = joblib.load("../../models/shap_explainer.pkl")

with open("../../models/fairness_report.json") as f:
    fairness_report = json.load(f)

with open("../../models/feature_schema.json") as f:
    schema = json.load(f)

expected_columns = schema["columns"]

# Load the fine-tuned NER model for document extraction
ner_tokenizer = AutoTokenizer.from_pretrained("../../models/ner_model")
ner_model = AutoModelForTokenClassification.from_pretrained("../../models/ner_model")
document_ner = pipeline(
    "ner",
    model=ner_model,
    tokenizer=ner_tokenizer,
    aggregation_strategy="max"
)

# Load the embedding model for the RAG policy assistant
embedding_model = SentenceTransformer("all-MiniLM-L6-v2")

# Groq client for answer generation
groq_client = Groq(api_key=os.environ.get("GROQ_API_KEY"))

# Load the fine-tuned explanation narrator (QLoRA adapter on Qwen2.5-3B)
print("Loading base model for explanation narrator (this takes a minute)...")
narrator_tokenizer = AutoTokenizer.from_pretrained("../../models/explanation_adapter")
narrator_base_model = AutoModelForCausalLM.from_pretrained(
    "Qwen/Qwen2.5-3B-Instruct",
    torch_dtype=torch.float32,
    device_map="cpu"
)
narrator_model = PeftModel.from_pretrained(narrator_base_model, "../../models/explanation_adapter")
print("Narrator model loaded.")

# Build the LangGraph agent (orchestrates score -> explain -> policy -> memo -> approval gate)
loan_agent = build_agent_graph()


def get_db_connection():
    return psycopg2.connect(
        host="localhost",
        port=5432,
        dbname="pms_platform",
        user="pms_admin",
        password="localdevpassword"
    )


def clean_entities(results, text, min_confidence=0.6):
    cleaned = []
    for r in sorted(results, key=lambda x: x["start"]):
        if r["score"] < min_confidence:
            continue
        cleaned.append(r)

    merged = []
    for r in cleaned:
        if merged and merged[-1]["entity_group"] == r["entity_group"] and r["start"] - merged[-1]["end"] <= 1:
            merged[-1]["end"] = r["end"]
            merged[-1]["word"] = text[merged[-1]["start"]:r["end"]]
        else:
            merged.append(dict(r))

    return [{"type": m["entity_group"], "value": m["word"].strip(" .,")} for m in merged]


def generate_answer(question: str, chunks: list[str]) -> str:
    context = "\n\n---\n\n".join(chunks)
    prompt = f"""You are a compliance assistant for a loan origination platform. Answer the question using ONLY the policy context below. If the context doesn't fully answer the question, say so clearly. Keep the answer concise and cite which part of the context supports your answer.

Policy context:
{context}

Question: {question}

Answer:"""

    response = groq_client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.2,
        max_tokens=400
    )
    return response.choices[0].message.content


def generate_narrative(top_factors: list, decision: str) -> str:
    instruction = "You are a compliance assistant. Given the loan decision and top contributing factors below, write a clear, professional explanation for the applicant."

    shap_input = {
        "decision": decision,
        "top_factors": [
            {"feature": f["feature"], "description": f"{'higher' if f['shap_value'] > 0 else 'lower'} {f['feature'].replace('_', ' ')}"}
            for f in top_factors[:3]
        ]
    }
    input_text = json.dumps(shap_input, indent=2)

    prompt = f"""### Instruction:
{instruction}

### Input:
{input_text}

### Response:
"""

    inputs = narrator_tokenizer(prompt, return_tensors="pt")
    outputs = narrator_model.generate(
        **inputs,
        max_new_tokens=80,
        temperature=0.3,
        do_sample=True,
        pad_token_id=narrator_tokenizer.eos_token_id,
        eos_token_id=narrator_tokenizer.eos_token_id,
        repetition_penalty=1.3
    )
    generated_text = narrator_tokenizer.decode(outputs[0], skip_special_tokens=True)
    response = generated_text.split("### Response:")[-1].strip()

    # cut off anything after the model starts echoing prompt structure back
    # (any '#' sequence is always template leakage, never legitimate explanation text)
    if "#" in response:
        response = response.split("#")[0].strip()

    return response


class ApplicantRaw(BaseModel):
    checking_status: str
    duration: int
    credit_history: str
    purpose: str
    credit_amount: int
    savings_status: str
    employment: str
    installment_rate: int
    personal_status: str
    other_parties: str
    residence_since: int
    property: str
    age: int
    other_payment_plans: str
    housing: str
    existing_credits: int
    job: str
    num_dependents: int
    telephone: str
    foreign_worker: str


class DocumentText(BaseModel):
    text: str


class PolicyQuestion(BaseModel):
    question: str


@app.get("/")
def root():
    return {"message": "Loan Risk Scorer API is running"}


@app.post("/score")
def score_applicant(applicant: ApplicantRaw):
    raw_df = pd.DataFrame([applicant.model_dump()])
    encoded = pd.get_dummies(raw_df)
    encoded = encoded.reindex(columns=expected_columns, fill_value=0)

    probability = model.predict_proba(encoded)[0][1]

    return {
        "risk_probability": round(float(probability), 4),
        "risk_label": "high_risk" if probability >= 0.5 else "low_risk"
    }


@app.post("/score/explanation")
def explain_applicant(applicant: ApplicantRaw):
    raw_df = pd.DataFrame([applicant.model_dump()])
    encoded = pd.get_dummies(raw_df)
    encoded = encoded.reindex(columns=expected_columns, fill_value=0)

    probability = model.predict_proba(encoded)[0][1]
    shap_values = shap_explainer.shap_values(encoded)

    explanation = sorted(
        [
            {"feature": col, "value": encoded.iloc[0][col].item(), "shap_value": round(float(val), 4)}
            for col, val in zip(encoded.columns, shap_values[0])
        ],
        key=lambda x: abs(x["shap_value"]),
        reverse=True
    )[:10]

    return {
        "risk_probability": round(float(probability), 4),
        "risk_label": "high_risk" if probability >= 0.5 else "low_risk",
        "top_factors": explanation
    }


@app.post("/score/narrative")
def narrative_explanation(applicant: ApplicantRaw):
    raw_df = pd.DataFrame([applicant.model_dump()])
    encoded = pd.get_dummies(raw_df)
    encoded = encoded.reindex(columns=expected_columns, fill_value=0)

    probability = model.predict_proba(encoded)[0][1]
    risk_label = "high_risk" if probability >= 0.5 else "low_risk"
    decision = "denied" if risk_label == "high_risk" else "approved"

    shap_values = shap_explainer.shap_values(encoded)
    top_factors = sorted(
        [
            {"feature": col, "shap_value": round(float(val), 4)}
            for col, val in zip(encoded.columns, shap_values[0])
        ],
        key=lambda x: abs(x["shap_value"]),
        reverse=True
    )[:5]

    narrative = generate_narrative(top_factors, decision)

    return {
        "risk_probability": round(float(probability), 4),
        "risk_label": risk_label,
        "narrative_explanation": narrative
    }


@app.get("/fairness-report")
def get_fairness_report():
    return fairness_report


@app.post("/applications/documents/extract")
def extract_document_fields(document: DocumentText):
    raw_results = document_ner(document.text)
    extracted = clean_entities(raw_results, document.text)

    return {
        "original_text": document.text,
        "extracted_fields": extracted
    }


@app.post("/policy-assistant/ask")
def ask_policy_assistant(query: PolicyQuestion):
    query_embedding = embedding_model.encode(query.question).tolist()

    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute(
        """
        SELECT source, chunk_text, embedding <-> %s::vector AS distance
        FROM loan_risk_policy_chunks
        ORDER BY distance
        LIMIT 3;
        """,
        (query_embedding,)
    )
    results = cur.fetchall()
    cur.close()
    conn.close()

    retrieved_chunks = [
        {"source": source, "text": chunk, "relevance_distance": round(float(distance), 4)}
        for source, chunk, distance in results
    ]

    answer = generate_answer(query.question, [c["text"] for c in retrieved_chunks])

    return {
        "question": query.question,
        "answer": answer,
        "retrieved_chunks": retrieved_chunks
    }


@app.post("/applications/analyze")
def analyze_application(applicant: ApplicantRaw):
    result = loan_agent.invoke({"applicant_data": applicant.model_dump()})

    return {
        "risk_probability": result["risk_probability"],
        "risk_label": result["risk_label"],
        "memo": result["memo"],
        "approval_status": result["approval_status"]
    }