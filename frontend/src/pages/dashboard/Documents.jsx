import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Card from "../../components/Card";
import Button from "../../components/Button";

const API_BASE = "http://127.0.0.1:8000";

export default function Documents() {
  const [text, setText] = useState(
    "I work at Infosys and earn $4500 per month, requesting a loan of $12000 for home renovation over 36 months."
  );
  const [fields, setFields] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleExtract(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/applications/documents/extract`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const data = await res.json();
      setFields(data.extracted_fields);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h1 className="font-display text-2xl text-ink900 mb-1">Documents</h1>
      <p className="text-sm text-slate mb-8">
        Paste free-text applicant statements to extract structured fields.
      </p>

      <div className="grid lg:grid-cols-2 gap-6 items-start">
        <Card light className="p-6">
          <form onSubmit={handleExtract}>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={8}
              className="w-full bg-white border border-line-light rounded-card px-3.5 py-3 text-sm text-ink900 focus-visible:border-signal resize-none"
            />
            <Button type="submit" disabled={loading} className="mt-4">
              {loading ? "Extracting…" : "Extract fields"}
            </Button>
          </form>
        </Card>

        <AnimatePresence>
          {fields && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
              <Card light className="p-6">
                <p className="font-mono text-xs text-slate uppercase mb-4">Extracted fields</p>
                <div className="space-y-3">
                  {fields.map((f, i) => (
                    <div key={i} className="flex items-center justify-between text-sm">
                      <span className="font-mono text-xs text-signal-dim bg-signal/10 px-2 py-1 rounded">
                        {f.type}
                      </span>
                      <span className="text-ink900">{f.value}</span>
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
