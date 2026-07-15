import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import SignalStrip from "../components/SignalStrip";
import Button from "../components/Button";

export default function SignIn() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    // No auth backend wired yet — this is a UI-complete placeholder.
    // Replace with a real POST to your auth endpoint when it exists.
    navigate("/dashboard");
  }

  return (
    <div className="min-h-screen bg-ink flex">
      <div className="hidden md:flex w-1/2 items-center justify-center border-r border-line p-16">
        <div>
          <SignalStrip className="mb-8" />
          <p className="font-display text-2xl text-paper leading-snug max-w-sm">
            "Approved. Primarily supported by stable checking history and modest
            requested amount."
          </p>
          <p className="mt-4 text-sm text-ink-muted font-mono">— generated explanation, application #4471</p>
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

          <h1 className="font-display text-2xl text-paper mb-1">Welcome back</h1>
          <p className="text-sm text-ink-muted mb-8">Sign in to your workspace.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-mono text-ink-muted mb-1.5" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-ink-2 border border-line rounded-card px-3.5 py-2.5 text-sm text-paper focus-visible:border-signal"
                placeholder="••••••••"
              />
            </div>
            <Button type="submit" className="w-full mt-2">Sign in</Button>
          </form>

          <p className="mt-8 text-sm text-ink-muted">
            Don't have an account?{" "}
            <Link to="/sign-up" className="text-signal hover:underline">
              Create one
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
