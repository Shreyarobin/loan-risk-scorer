from fastapi import FastAPI
from pydantic import BaseModel
import joblib
import json
import pandas as pd
import numpy as np
from transformers import pipeline, AutoTokenizer, AutoModelForTokenClassification

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