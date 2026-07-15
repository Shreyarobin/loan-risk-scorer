# Loan Risk Scorer

An AI-powered loan risk assessment platform combining classical ML, explainability, fine-tuned NLP models, retrieval-augmented generation, and agent orchestration — built end-to-end as a demonstration of production-shaped ML/GenAI engineering, with a full product frontend on top.

**Status: Phases 0–5 complete (of 6 planned), plus a working frontend. Core system is live, demoable, and wired end to end.**

---

## What this project does

Given a loan applicant's information, the system:
1. Predicts a calibrated probability of default using a trained XGBoost model
2. Explains *why* using SHAP feature attributions
3. Audits the model for fairness across demographic proxies (age)
4. Extracts structured fields (income, employer, loan purpose) from free-text application documents using a fine-tuned NER model
5. Answers policy/compliance questions using retrieval-augmented generation over real regulatory text (CFPB Regulation B)
6. Generates a natural-language, compliance-style explanation of any decision using a QLoRA fine-tuned LLM
7. Orchestrates all of the above through a LangGraph agent that produces a full risk memo, held behind a human-approval gate
8. Presents all of this through a branded web application — landing page, auth flow, and a working dashboard

---

## Architecture

**Training happens in Google Colab** (free GPU access for fine-tuning) — model artifacts are pushed to this repo.
**Serving happens in a local FastAPI backend** (VS Code) — the API only ever loads pre-trained artifacts, it never trains anything itself.
**The agent orchestrates the API** — LangGraph calls the backend's own endpoints in sequence rather than duplicating any logic.
**The frontend consumes the API** — a React/Vite app that talks to the FastAPI backend over HTTP, with CORS explicitly enabled for local development.

```
Colab (training) --push artifacts--> GitHub repo --pull--> FastAPI (serving)
                                                                 ▲
                                                    LangGraph agent (calls own endpoints)
                                                                 ▲
                                                     React/Vite frontend (dashboard)
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
| Agent orchestration | LangGraph (stateful multi-step graph, human-approval gate) |
| Backend | FastAPI, served with CORS enabled for the frontend |
| Frontend | React + Vite, Tailwind CSS v3, Framer Motion, React Router, lucide-react |
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
│       ├── main.py                     # FastAPI app — all endpoints, CORS config
│       └── agent.py                    # LangGraph state, nodes, and graph definition
├── frontend/                           # React + Vite dashboard
│   ├── tailwind.config.js              # custom design tokens (colors, fonts)
│   └── src/
│       ├── App.jsx                     # route definitions
│       ├── pages/                      # Landing, SignIn, SignUp
│       ├── pages/dashboard/            # Overview, ScoreApplicant, Documents, PolicyAssistant, Fairness
│       ├── layouts/DashboardLayout.jsx # sidebar navigation shell
│       └── components/                 # Button, Card, SignalStrip (signature motif)
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
| POST | `/applications/analyze` | Full agent run: score → explain → policy check → memo, pending human approval |

Interactive docs available at `/docs` once the server is running.

---

## Frontend

A branded, animated web application built on top of the API:

- **Landing page** — hero built around a signature "signal strip" motif (animated ledger ticks resolving into a score and explanation), feature grid, process walkthrough, live fairness-bar preview, CTA
- **Sign in / Sign up** — UI-complete; not yet wired to a real auth backend
- **Dashboard** — sidebar navigation with five pages:
  - *Overview* — summary stats (currently illustrative placeholders)
  - *Score applicant* — full form with human-readable dropdowns (mapped to the dataset's underlying category codes), wired to `/score/explanation` and `/score/narrative`
  - *Documents* — free-text extraction, wired to `/applications/documents/extract`
  - *Policy assistant* — chat interface, wired to `/policy-assistant/ask`
  - *Fairness audit* — live charts, wired to `/fairness-report`

Design tokens (colors, type pairing, the signal-strip signature element) are defined in `frontend/tailwind.config.js`.

---

## Datasets used

All public, no credentialed/gated access required:
- **German Credit Data** (UCI ML Repository) — tabular risk model training
- **CFPB Regulation B** (consumerfinance.gov) — policy corpus for the RAG assistant
- Synthetic data generated for NER training (loan description templates) and LLM fine-tuning (SHAP-to-explanation pairs), following standard practice for tasks with no existing labeled public dataset

---

## Running locally

**Prerequisites:** Python 3.11, Node.js, Docker (for PostgreSQL + pgvector), Git LFS, a free Groq API key

### Backend
```powershell
git clone https://github.com/Shreyarobin/loan-risk-scorer.git
cd loan-risk-scorer

git lfs install
git lfs pull

py -3.11 -m venv .venv
.venv\Scripts\Activate.ps1

pip install fastapi uvicorn scikit-learn xgboost joblib pandas shap sentence-transformers psycopg2-binary groq python-dotenv peft torch transformers langgraph langchain-core requests

docker run --name loan-risk-postgres -e POSTGRES_PASSWORD=devpassword -e POSTGRES_DB=loan_risk -p 5432:5432 -d pgvector/pgvector:pg16

echo "GROQ_API_KEY=your_key_here" > .env

cd backend\app
uvicorn main:app --reload
```
Visit `http://127.0.0.1:8000/docs` to test endpoints interactively.

**Note:** the fine-tuned narrator model (Qwen2.5-3B) runs on CPU locally, so `/score/narrative` and `/applications/analyze` responses take 15–60+ seconds. Expected — production deployment would use a GPU.

### Frontend
```powershell
cd frontend
npm install
npm install -D tailwindcss@3 postcss autoprefixer   # Tailwind v4 breaks this config — pin to v3
npm run dev
```
Visit `http://localhost:5173`. The backend must be running with CORS enabled (already configured in `main.py` for `http://localhost:5173`) for the dashboard pages to reach the API.

---

## Project roadmap

- [x] **Phase 0** — Baseline XGBoost risk model, calibrated, cross-validated (AUC ≈ 0.79)
- [x] **Phase 1** — SHAP explainability + age-group fairness audit
- [x] **Phase 2** — Fine-tuned NER model for document field extraction
- [x] **Phase 3** — RAG policy assistant (pgvector + Groq-based generation)
- [x] **Phase 4** — QLoRA fine-tuning of a compliance-explanation narrator (Qwen2.5-3B)
- [x] **Phase 5** — LangGraph agent orchestration (scoring + RAG + narrator tools, human-approval gate)
- [x] **Frontend** — Landing page, auth UI, and a dashboard wired to the live API
- [ ] **Phase 6** — RAGAS evaluation of the RAG assistant, hallucination checks, real authentication, live overview stats

---

## Notes on scope

This is a portfolio/learning project built to demonstrate a full ML + GenAI pipeline, not a production lending system. The tabular model is trained on the public German Credit dataset (1,000 rows), fine-tuning datasets are synthetically generated, the fairness audit uses a proxy attribute (age) rather than legally protected classes not present in the source data, and the frontend's authentication is UI-only. All architectural choices (Colab for training, FastAPI for serving, LangGraph for orchestration, Git LFS for large artifacts) are documented in the notebooks and commit history for full reproducibility.
