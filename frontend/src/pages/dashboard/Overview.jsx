import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import Card from "../../components/Card";

const stats = [
  { label: "Applications scored", value: "1,248", delta: "+12% this week" },
  { label: "Approval rate", value: "68%", delta: "+3pt vs last month" },
  { label: "Avg. narrative latency", value: "24s", delta: "on CPU inference" },
  { label: "Fairness ratio, min group", value: "0.85", delta: "above 0.80 threshold" },
];

const recent = [
  { id: "4471", risk: 0.19, label: "low_risk" },
  { id: "4470", risk: 0.82, label: "high_risk" },
  { id: "4469", risk: 0.44, label: "low_risk" },
  { id: "4468", risk: 0.91, label: "high_risk" },
];

export default function Overview() {
  return (
    <div>
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <h1 className="font-display text-2xl text-ink900 mb-1">Overview</h1>
        <p className="text-sm text-slate mb-8">A snapshot of scoring activity across your workspace.</p>
      </motion.div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06, duration: 0.4 }}
          >
            <Card light className="p-5">
              <p className="font-mono text-xs text-slate uppercase tracking-wide mb-2">{s.label}</p>
              <p className="font-display text-3xl text-ink900 mb-1">{s.value}</p>
              <p className="text-xs text-signal-dim">{s.delta}</p>
            </Card>
          </motion.div>
        ))}
      </div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <Card light className="p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display text-lg text-ink900">Recent applications</h2>
            <Link to="/dashboard/score" className="text-sm text-signal-dim flex items-center gap-1 hover:underline">
              Score a new one <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="divide-y divide-line-light">
            {recent.map((r) => (
              <div key={r.id} className="flex items-center justify-between py-3.5">
                <span className="font-mono text-sm text-slate">Application #{r.id}</span>
                <div className="flex items-center gap-4">
                  <span className="font-mono text-sm text-ink900">{r.risk.toFixed(2)}</span>
                  <span
                    className={`text-xs font-mono px-2.5 py-1 rounded-full ${
                      r.label === "low_risk"
                        ? "bg-signal/10 text-signal-dim"
                        : "bg-alert/10 text-alert"
                    }`}
                  >
                    {r.label}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
