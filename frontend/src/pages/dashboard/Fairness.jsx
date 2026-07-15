import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Card from "../../components/Card";

const API_BASE = "http://127.0.0.1:8000";

export default function Fairness() {
  const [report, setReport] = useState(null);

  useEffect(() => {
    fetch(`${API_BASE}/fairness-report`)
      .then((r) => r.json())
      .then(setReport)
      .catch(() => {});
  }, []);

  return (
    <div>
      <h1 className="font-display text-2xl text-ink900 mb-1">Fairness audit</h1>
      <p className="text-sm text-slate mb-8">
        Disparate-impact analysis across age groups, computed against the live model.
      </p>

      {!report ? (
        <p className="text-sm text-slate">Loading report…</p>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          <Card light className="p-6">
            <p className="font-mono text-xs text-slate uppercase mb-4">High-risk flag rate by group</p>
            <div className="space-y-4">
              {Object.entries(report.group_stats.pct_flagged_high_risk).map(([group, value]) => (
                <div key={group}>
                  <div className="flex justify-between text-xs font-mono text-slate mb-1.5">
                    <span>{group}</span>
                    <span>{(value * 100).toFixed(1)}%</span>
                  </div>
                  <div className="h-1.5 bg-line-light rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${value * 100}%` }}
                      transition={{ duration: 0.8 }}
                      className="h-full bg-alert rounded-full"
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card light className="p-6">
            <p className="font-mono text-xs text-slate uppercase mb-4">Disparate impact ratio</p>
            <div className="space-y-4 mb-5">
              {Object.entries(report.disparate_impact_ratio).map(([group, value]) => (
                <div key={group} className="flex items-center justify-between text-sm">
                  <span className="text-slate">{group}</span>
                  <span
                    className={`font-mono ${value < report.threshold_used ? "text-alert" : "text-signal-dim"}`}
                  >
                    {value.toFixed(3)}
                  </span>
                </div>
              ))}
            </div>
            <p className="text-xs text-slate leading-relaxed border-t border-line-light pt-4">
              {report.note}
            </p>
          </Card>
        </div>
      )}
    </div>
  );
}
