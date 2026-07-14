from fastapi import FastAPI
from pydantic import BaseModel
import joblib
import json
import pandas as pd

app = FastAPI(title="Loan Risk Scorer")

# Load the model and schema once, when the server starts
model = joblib.load("../../models/risk_model.pkl")

with open("../../models/feature_schema.json") as f:
    schema = json.load(f)

expected_columns = schema["columns"]


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


@app.get("/")
def root():
    return {"message": "Loan Risk Scorer API is running"}


@app.post("/score")
def score_applicant(applicant: ApplicantRaw):
    # Turn the single applicant into a one-row dataframe
    raw_df = pd.DataFrame([applicant.model_dump()])

    # One-hot encode it the same way training data was encoded
    encoded = pd.get_dummies(raw_df)

    # Make sure it has exactly the same columns as training data,
    # in the same order — fill missing ones with 0
    encoded = encoded.reindex(columns=expected_columns, fill_value=0)

    probability = model.predict_proba(encoded)[0][1]

    return {
        "risk_probability": round(float(probability), 4),
        "risk_label": "high_risk" if probability >= 0.5 else "low_risk"
    }