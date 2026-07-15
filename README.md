# Loan Risk Scorer

An AI-powered loan risk assessment platform combining classical ML, explainability, fine-tuned NLP models, and retrieval-augmented generation — built as an end-to-end demonstration of production-shaped ML/GenAI engineering.

**Status: Phases 0–4 complete (of 6 planned). Core system is live and functional.**

---

## What this project does

Given a loan applicant's information, the system:
1. Predicts a calibrated probability of default using a trained XGBoost model
2. Explains *why* using SHAP feature attributions
3. Audits the model for fairness across demographic proxies (age)
4. Extracts structured fields (income, employer, loan purpose) from free-text application documents using a fine-tuned NER model
5. Answers policy/compliance questions using retrieval-augmented generation over real regulatory text (CFPB Regulation B)
6. Generates a natural-language, compliance-style explanation of any decision using a QLoRA fine-tuned LLM

---

## Architecture

**Training happens in Google Colab** (free GPU access for fine-tuning) — model artifacts are pushed to this repo.
**Serving happens in a local FastAPI backend** (VS Code) — the API only ever loads pre-trained artifacts, it never trains anything itself.

```
Colab (training) --push artifacts--> GitHub repo --pull--> FastAPI (serving)
```

---

## Tech stack

| Layer | Technology |
|---|---|
| Tabular ML | XGBoost, scikit-learn (calibrated via isotonic regression) |
| Explainability | SHAP |
| Document NER | Fine-tuned DistilBERT (custom entity types: EMPLOYER, INCOME, LOAN_AMOUNT, PURPOSE, DURATION) |
| Embeddings | sentence-transformers (`all-MiniLM-L6-v2`) |
| Vector store | PostgreSQL + pgvector |
| RAG generation | Groq API (Llama 3.1 8B Instant) |
| Fine-tuned narrator | Qwen2.5-3B-Instruct + QLoRA (4-bit, PEFT/LoRA adapter) |
| Backend | FastAPI |
| Training environment | Google Colab (T4 GPU) |
| Version control for large files | Git LFS |

---

## Repo structure

```
loan-risk-scorer/
├── notebooks/                          # Colab notebooks (training/fine-tuning)
│   ├── 01_baseline_and_shap.ipynb      # Phase 0-1: XGBoost model, SHAP, fairness audit
│   ├── 03_document_ner.ipynb           # Phase 2: fine-tuned NER model
│   └── 04_llm_finetune_qlora.ipynb     # Phase 4: QLoRA fine-tuning of explanation narrator
├── models/                             # Trained artifacts (pulled by the backend)
│   ├── risk_model.pkl
│   ├── shap_explainer.pkl
│   ├── fairness_report.json
│   ├── feature_schema.json
│   ├── ner_model/                      # fine-tuned DistilBERT (tracked via Git LFS)
│   └── explanation_adapter/            # QLoRA LoRA adapter (Qwen2.5-3B)
├── backend/
│   └── app/
│       └── main.py                     # FastAPI app — all endpoints
├── scripts/
│   ├── extract_docs.py                 # HTML -> clean text for the policy corpus
│   └── build_embeddings.py             # chunk + embed + store in pgvector
├── docs/                                # Source policy documents (CFPB Reg B)
└── .env                                 # GROQ_API_KEY (not committed)
```

---

## API endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/score` | Calibrated risk probability for an applicant |
| POST | `/score/explanation` | Risk score + top SHAP feature attributions |
| POST | `/score/narrative` | Risk score + fine-tuned LLM natural-language explanation |
| GET | `/fairness-report` | Age-group fairness/disparate-impact audit |
| POST | `/applications/documents/extract` | Extract structured fields from free-text loan documents |
| POST | `/policy-assistant/ask` | RAG-grounded answer to a lending policy/compliance question |

Interactive docs available at `/docs` once the server is running.

---

## Datasets used

All public, no credentialed/gated access required:
- **German Credit Data** (UCI ML Repository) — tabular risk model training
- **CFPB Regulation B** (consumerfinance.gov) — policy corpus for the RAG assistant
- Synthetic data generated for NER training (loan description templates) and LLM fine-tuning (SHAP-to-explanation pairs), following standard practice for tasks with no existing labeled public dataset

---

## Running locally

**Prerequisites:** Python 3.11, Docker (for PostgreSQL + pgvector), a free Groq API key

```powershell
# clone
git clone https://github.com/Shreyarobin/loan-risk-scorer.git
cd loan-risk-scorer

# Git LFS (required for the NER model)
git lfs install
git lfs pull

# environment
py -3.11 -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r backend/requirements.txt   # or the individual installs listed below

# Postgres with pgvector (or reuse an existing container — see notes)
docker run --name loan-risk-postgres -e POSTGRES_PASSWORD=devpassword -e POSTGRES_DB=loan_risk -p 5432:5432 -d pgvector/pgvector:pg16

# .env
echo "GROQ_API_KEY=your_key_here" > .env

# run
cd backend/app
uvicorn main:app --reload
```

Visit `http://127.0.0.1:8000/docs` to test endpoints interactively.

**Note:** the fine-tuned narrator model (Qwen2.5-3B) runs on CPU locally, so `/score/narrative` responses take 15–40+ seconds. This is expected — production deployment would use a GPU.

---

## Project roadmap

- [x] **Phase 0** — Baseline XGBoost risk model, calibrated, cross-validated (AUC ≈ 0.79)
- [x] **Phase 1** — SHAP explainability + age-group fairness audit
- [x] **Phase 2** — Fine-tuned NER model for document field extraction
- [x] **Phase 3** — RAG policy assistant (pgvector + Groq-based generation)
- [x] **Phase 4** — QLoRA fine-tuning of a compliance-explanation narrator (Qwen2.5-3B)
- [ ] **Phase 5** — LangGraph agent orchestration (scoring + RAG + narrator tools, human-approval gate)
- [ ] **Phase 6** — React dashboard, RAGAS evaluation of the RAG assistant, hallucination checks

---

## Notes on scope

This is a portfolio/learning project built to demonstrate a full ML + GenAI pipeline, not a production lending system. The tabular model is trained on the public German Credit dataset (1,000 rows), fine-tuning datasets are synthetically generated, and the fairness audit uses a proxy attribute (age) rather than legally protected classes not present in the source data. All architectural choices (Colab for training, FastAPI for serving, Git LFS for large artifacts) are documented in the notebooks and commit history for full reproducibility.
