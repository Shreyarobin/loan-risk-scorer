import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Card from "../../components/Card";
import Button from "../../components/Button";

const API_BASE = "http://127.0.0.1:8000";

// German Credit dataset category codes, mapped to plain-language labels.
// The API still receives the raw code (e.g. "A11") — the UI only ever shows the label.
const OPTIONS = {
  checking_status: [
    { value: "A11", label: "Checking balance under 0 DM" },
    { value: "A12", label: "Checking balance 0–200 DM" },
    { value: "A13", label: "Checking balance 200 DM or more" },
    { value: "A14", label: "No checking account" },
  ],
  credit_history: [
    { value: "A30", label: "No credits taken / all paid duly" },
    { value: "A31", label: "All credits at this bank paid duly" },
    { value: "A32", label: "Existing credits paid duly so far" },
    { value: "A33", label: "Past delay in payments" },
    { value: "A34", label: "Critical account / other existing credits" },
  ],
  purpose: [
    { value: "A40", label: "Car (new)" },
    { value: "A41", label: "Car (used)" },
    { value: "A42", label: "Furniture or equipment" },
    { value: "A43", label: "Radio or television" },
    { value: "A44", label: "Domestic appliances" },
    { value: "A45", label: "Repairs" },
    { value: "A46", label: "Education" },
    { value: "A48", label: "Retraining" },
    { value: "A49", label: "Business" },
    { value: "A410", label: "Other" },
  ],
  savings_status: [
    { value: "A61", label: "Savings under 100 DM" },
    { value: "A62", label: "Savings 100–500 DM" },
    { value: "A63", label: "Savings 500–1000 DM" },
    { value: "A64", label: "Savings 1000 DM or more" },
    { value: "A65", label: "No savings account / unknown" },
  ],
  employment: [
    { value: "A71", label: "Unemployed" },
    { value: "A72", label: "Employed under 1 year" },
    { value: "A73", label: "Employed 1–4 years" },
    { value: "A74", label: "Employed 4–7 years" },
    { value: "A75", label: "Employed 7+ years" },
  ],
  personal_status: [
    { value: "A91", label: "Male, divorced or separated" },
    { value: "A92", label: "Female, divorced, separated, or married" },
    { value: "A93", label: "Male, single" },
    { value: "A94", label: "Male, married or widowed" },
    { value: "A95", label: "Female, single" },
  ],
  other_parties: [
    { value: "A101", label: "None" },
    { value: "A102", label: "Co-applicant" },
    { value: "A103", label: "Guarantor" },
  ],
  property: [
    { value: "A121", label: "Real estate" },
    { value: "A122", label: "Building society savings / life insurance" },
    { value: "A123", label: "Car or other property" },
    { value: "A124", label: "No property / unknown" },
  ],
  other_payment_plans: [
    { value: "A141", label: "Other bank" },
    { value: "A142", label: "Stores" },
    { value: "A143", label: "None" },
  ],
  housing: [
    { value: "A151", label: "Rents" },
    { value: "A152", label: "Owns" },
    { value: "A153", label: "Lives for free" },
  ],
  job: [
    { value: "A171", label: "Unemployed / unskilled, non-resident" },
    { value: "A172", label: "Unskilled, resident" },
    { value: "A173", label: "Skilled employee or official" },
    { value: "A174", label: "Management / self-employed / highly qualified" },
  ],
  telephone: [
    { value: "A191", label: "No registered phone" },
    { value: "A192", label: "Registered under applicant's name" },
  ],
  foreign_worker: [
    { value: "A201", label: "Yes" },
    { value: "A202", label: "No" },
  ],
};

const FIELDS = [
  { name: "checking_status", label: "Checking account status" },
  { name: "duration", label: "Loan duration (months)", type: "number", placeholder: "24" },
  { name: "credit_history", label: "Credit history" },
  { name: "purpose", label: "Purpose" },
  { name: "credit_amount", label: "Credit amount", type: "number", placeholder: "3500" },
  { name: "savings_status", label: "Savings status" },
  { name: "employment", label: "Employment" },
  { name: "installment_rate", label: "Installment rate (% of income)", type: "number", placeholder: "3" },
  { name: "personal_status", label: "Personal status" },
  { name: "other_parties", label: "Other debtors / guarantors" },
  { name: "residence_since", label: "Years at current residence", type: "number", placeholder: "2" },
  { name: "property", label: "Property" },
  { name: "age", label: "Age", type: "number", placeholder: "32" },
  { name: "other_payment_plans", label: "Other payment plans" },
  { name: "housing", label: "Housing" },
  { name: "existing_credits", label: "Number of existing credits", type: "number", placeholder: "1" },
  { name: "job", label: "Job" },
  { name: "num_dependents", label: "Number of dependents", type: "number", placeholder: "1" },
  { name: "telephone", label: "Registered telephone" },
  { name: "foreign_worker", label: "Foreign worker" },
];

const DEFAULTS = Object.fromEntries(
  FIELDS.map((f) => [f.name, f.type === "number" ? f.placeholder : OPTIONS[f.name][0].value])
);

export default function ScoreApplicant() {
  const [form, setForm] = useState(DEFAULTS);
  const [result, setResult] = useState(null);
  const [narrative, setNarrative] = useState(null);
  const [loading, setLoading] = useState(false);
  const [narrativeLoading, setNarrativeLoading] = useState(false);
  const [error, setError] = useState(null);

  function updateField(name, value) {
    setForm((f) => ({ ...f, [name]: value }));
  }

  function toPayload() {
    const payload = { ...form };
    FIELDS.forEach((f) => {
      if (f.type === "number") payload[f.name] = Number(payload[f.name]);
    });
    return payload;
  }

  async function handleScore(e) {
    e.preventDefault();
    setError(null);
    setResult(null);
    setNarrative(null);
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/score/explanation`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(toPayload()),
      });
      if (!res.ok) throw new Error(`Request failed (${res.status})`);
      setResult(await res.json());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleNarrative() {
    setNarrativeLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/score/narrative`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(toPayload()),
      });
      if (!res.ok) throw new Error(`Request failed (${res.status})`);
      const data = await res.json();
      setNarrative(data.narrative_explanation);
    } catch (err) {
      setError(err.message);
    } finally {
      setNarrativeLoading(false);
    }
  }

  return (
    <div>
      <h1 className="font-display text-2xl text-ink900 mb-1">Score applicant</h1>
      <p className="text-sm text-slate mb-8">
        Submit applicant details to get a calibrated risk score with factor attribution.
      </p>

      <div className="grid lg:grid-cols-[1fr_380px] gap-6 items-start">
        <Card light className="p-6">
          <form onSubmit={handleScore} className="grid sm:grid-cols-2 gap-4">
            {FIELDS.map((f) => (
              <div key={f.name}>
                <label className="block text-xs font-mono text-slate mb-1.5">{f.label}</label>
                {f.type === "number" ? (
                  <input
                    type="number"
                    value={form[f.name]}
                    onChange={(e) => updateField(f.name, e.target.value)}
                    className="w-full bg-white border border-line-light rounded-card px-3 py-2 text-sm text-ink900 focus-visible:border-signal"
                  />
                ) : (
                  <select
                    value={form[f.name]}
                    onChange={(e) => updateField(f.name, e.target.value)}
                    className="w-full bg-white border border-line-light rounded-card px-3 py-2 text-sm text-ink900 focus-visible:border-signal"
                  >
                    {OPTIONS[f.name].map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            ))}
            <div className="sm:col-span-2 pt-2">
              <Button type="submit" disabled={loading}>
                {loading ? "Scoring…" : "Get risk score"}
              </Button>
            </div>
          </form>
        </Card>

        <div className="space-y-4 lg:sticky lg:top-4">
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="p-4 rounded-card bg-alert/10 text-alert text-sm"
              >
                {error}
              </motion.div>
            )}

            {result && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <Card light className="p-6">
                  <p className="font-mono text-xs text-slate uppercase mb-2">Risk probability</p>
                  <p className="font-display text-4xl text-ink900 mb-1">
                    {result.risk_probability.toFixed(2)}
                  </p>
                  <span
                    className={`inline-block text-xs font-mono px-2.5 py-1 rounded-full mb-5 ${
                      result.risk_label === "low_risk"
                        ? "bg-signal/10 text-signal-dim"
                        : "bg-alert/10 text-alert"
                    }`}
                  >
                    {result.risk_label}
                  </span>

                  <p className="font-mono text-xs text-slate uppercase mb-3">Top factors</p>
                  <div className="space-y-2 mb-5">
                    {result.top_factors.slice(0, 5).map((f) => (
                      <div key={f.feature} className="flex items-center justify-between text-sm">
                        <span className="text-slate truncate pr-2">{f.feature}</span>
                        <span className={f.shap_value > 0 ? "text-alert font-mono" : "text-signal-dim font-mono"}>
                          {f.shap_value > 0 ? "+" : ""}
                          {f.shap_value.toFixed(3)}
                        </span>
                      </div>
                    ))}
                  </div>

                  <Button
                    variant="secondary"
                    className="w-full !text-ink900 !border-line-light"
                    onClick={handleNarrative}
                    disabled={narrativeLoading}
                  >
                    {narrativeLoading ? "Writing explanation…" : "Generate plain-English explanation"}
                  </Button>
                </Card>
              </motion.div>
            )}

            {narrative && (
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
                <Card light className="p-6">
                  <p className="font-mono text-xs text-slate uppercase mb-3">Narrative explanation</p>
                  <p className="text-sm text-ink900 leading-relaxed">{narrative}</p>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}