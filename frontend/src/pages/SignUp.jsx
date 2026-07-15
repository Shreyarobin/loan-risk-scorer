import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import SignalStrip from "../components/SignalStrip";
import Button from "../components/Button";

export default function SignUp() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });

  function handleSubmit(e) {
    e.preventDefault();
    // Placeholder — wire to a real registration endpoint when the backend has one.
    navigate("/dashboard");
  }

  return (
    <div className="min-h-screen bg-ink flex">
      <div className="hidden md:flex w-1/2 items-center justify-center border-r border-line p-16">
        <div>
          <SignalStrip className="mb-8" />
          <p className="font-display text-2xl text-paper leading-snug max-w-sm">
            Every score ships with the reasons behind it — ranked, cited, and
            ready for review.
          </p>
        </div>
      </div>

      <div className="w-full md:w-1/2 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-sm"
        >
          <Link to="/" className="inline-flex items-center gap-2 mb-10">
            <SignalStrip size="small" className="h-4" />
            <span className="font-display text-lg text-paper">Ledgergate</span>
          </Link>

          <h1 className="font-display text-2xl text-paper mb-1">Create your workspace</h1>
          <p className="text-sm text-ink-muted mb-8">Start scoring applications in minutes.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-mono text-ink-muted mb-1.5" htmlFor="name">
                Full name
              </label>
              <input
                id="name"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full bg-ink-2 border border-line rounded-card px-3.5 py-2.5 text-sm text-paper focus-visible:border-signal"
                placeholder="Shreya Robin"
              />
            </div>
            <div>
              <label className="block text-xs font-mono text-ink-muted mb-1.5" htmlFor="email">
                Work email
              </label>
              <input
                id="email"
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full bg-ink-2 border border-line rounded-card px-3.5 py-2.5 text-sm text-paper focus-visible:border-signal"
                placeholder="you@company.com"
              />
            </div>
            <div>
              <label className="block text-xs font-mono text-ink-muted mb-1.5" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full bg-ink-2 border border-line rounded-card px-3.5 py-2.5 text-sm text-paper focus-visible:border-signal"
                placeholder="••••••••"
              />
            </div>
            <Button type="submit" className="w-full mt-2">Create account</Button>
          </form>

          <p className="mt-8 text-sm text-ink-muted">
            Already have an account?{" "}
            <Link to="/sign-in" className="text-signal hover:underline">
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
