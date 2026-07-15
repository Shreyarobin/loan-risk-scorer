import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ShieldCheck, FileSearch, MessagesSquare, Scale, ArrowRight, GitBranch } from "lucide-react";
import SignalStrip from "../components/SignalStrip";
import Button from "../components/Button";
import Card from "../components/Card";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

function Reveal({ children, className = "" }) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      variants={fadeUp}
    >
      {children}
    </motion.div>
  );
}

export default function Landing() {
  return (
    <div className="bg-ink text-paper min-h-screen">
      {/* Nav */}
      <header className="sticky top-0 z-40 backdrop-blur bg-ink/80 border-b border-line">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <SignalStrip size="small" className="h-4" />
            <span className="font-display text-lg tracking-tight">Ledgergate</span>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm text-ink-muted">
            <a href="#platform" className="hover:text-paper transition-colors">Platform</a>
            <a href="#how" className="hover:text-paper transition-colors">How it works</a>
            <a href="#trust" className="hover:text-paper transition-colors">Trust &amp; compliance</a>
          </nav>
          <div className="flex items-center gap-3">
            <Link to="/sign-in" className="text-sm text-ink-muted hover:text-paper transition-colors px-2">
              Sign in
            </Link>
            <Link to="/sign-up">
              <Button size="sm">Get started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-20 pb-28 md:pt-28 md:pb-36">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="font-mono text-xs tracking-widest text-signal uppercase mb-6"
            >
              Credit risk, explained
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="font-display text-4xl md:text-6xl leading-[1.08] tracking-tight text-paper"
            >
              Every decision,
              <br />
              down to the reason.
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.7 }}
              className="mt-6 text-lg text-ink-muted max-w-md leading-relaxed"
            >
              Ledgergate scores loan applications, shows exactly which factors moved the
              number, and writes the explanation a regulator — or an applicant — can
              actually read.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.7 }}
              className="mt-9 flex items-center gap-4"
            >
              <Link to="/sign-up">
                <Button size="lg">
                  Start scoring <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
              <a href="#how" className="text-sm text-ink-muted hover:text-paper transition-colors">
                See how it works
              </a>
            </motion.div>
          </div>

          {/* Signature hero device: signal strip resolving into a score + explanation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            <div className="rounded-card border border-line bg-ink-2 p-7 shadow-panel">
              <div className="flex items-center justify-between mb-6">
                <span className="font-mono text-xs text-ink-muted">APPLICATION #4471</span>
                <span className="font-mono text-xs text-signal">LOW RISK · 0.19</span>
              </div>
              <SignalStrip className="mb-7" />
              <motion.p
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 1.1, duration: 0.8 }}
                className="text-sm text-paper/90 leading-relaxed border-t border-line pt-5"
              >
                Approved. Primarily supported by a stable checking history and a
                modest requested amount relative to income. Loan duration contributed
                a smaller, positive effect.
              </motion.p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Feature grid */}
      <section id="platform" className="max-w-6xl mx-auto px-6 py-24 border-t border-line">
        <Reveal className="max-w-lg mb-16">
          <p className="font-mono text-xs tracking-widest text-signal uppercase mb-4">Platform</p>
          <h2 className="font-display text-3xl md:text-4xl text-paper leading-tight">
            One score. Four ways to trust it.
          </h2>
        </Reveal>

        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className="grid md:grid-cols-2 gap-6"
        >
          {[
            {
              icon: ShieldCheck,
              title: "Calibrated risk scoring",
              body: "A gradient-boosted model trained on historical outcomes, calibrated so a 0.7 genuinely means a 70% likelihood — not just a higher number.",
            },
            {
              icon: GitBranch,
              title: "Factor-level attribution",
              body: "Every score ships with the specific factors that moved it, ranked by impact — no opaque single number without a reason attached.",
            },
            {
              icon: FileSearch,
              title: "Document intelligence",
              body: "Extracts income, employer, and loan purpose directly from unstructured applicant text, feeding straight into the risk model.",
            },
            {
              icon: MessagesSquare,
              title: "Policy assistant",
              body: "Ask a compliance question and get an answer grounded in the actual regulation text, with the source cited — not a guess.",
            },
          ].map(({ icon: Icon, title, body }) => (
            <motion.div key={title} variants={fadeUp}>
              <div className="rounded-card border border-line bg-ink-2 p-7 h-full hover:border-ink-muted transition-colors duration-300 group">
                <Icon className="w-5 h-5 text-signal mb-5" strokeWidth={1.75} />
                <h3 className="font-display text-xl text-paper mb-2.5">{title}</h3>
                <p className="text-sm text-ink-muted leading-relaxed">{body}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* How it works */}
      <section id="how" className="max-w-6xl mx-auto px-6 py-24 border-t border-line">
        <Reveal className="max-w-lg mb-16">
          <p className="font-mono text-xs tracking-widest text-signal uppercase mb-4">Process</p>
          <h2 className="font-display text-3xl md:text-4xl text-paper leading-tight">
            From application to answer.
          </h2>
        </Reveal>

        <div className="space-y-0">
          {[
            { step: "Submit", body: "Applicant details come in as structured fields or free-text documents." },
            { step: "Score", body: "The model returns a calibrated probability in real time." },
            { step: "Explain", body: "Factor attributions and a plain-language explanation are generated together." },
            { step: "Review", body: "A compliance officer reviews the memo before any decision is final." },
          ].map((row, i) => (
            <Reveal key={row.step}>
              <div className="flex items-center gap-8 py-7 border-b border-line group">
                <span className="font-mono text-sm text-ink-muted w-6">{String(i + 1).padStart(2, "0")}</span>
                <span className="font-display text-xl text-paper w-32 shrink-0">{row.step}</span>
                <span className="text-sm text-ink-muted leading-relaxed">{row.body}</span>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Trust section */}
      <section id="trust" className="max-w-6xl mx-auto px-6 py-24 border-t border-line">
        <div className="grid md:grid-cols-2 gap-16 items-start">
          <Reveal>
            <p className="font-mono text-xs tracking-widest text-signal uppercase mb-4">Trust &amp; compliance</p>
            <h2 className="font-display text-3xl md:text-4xl text-paper leading-tight mb-6">
              Built to be audited, not just used.
            </h2>
            <p className="text-ink-muted leading-relaxed max-w-md">
              Fairness metrics are computed automatically across demographic proxies,
              every explanation traces back to a real factor, and every policy answer
              cites its source. Nothing here is a black box by default.
            </p>
          </Reveal>
          <Reveal>
            <Card className="p-7">
              <div className="flex items-center gap-3 mb-5">
                <Scale className="w-5 h-5 text-signal" strokeWidth={1.75} />
                <span className="font-mono text-xs text-ink-muted uppercase">Fairness audit, live</span>
              </div>
              <div className="space-y-4">
                {[
                  { group: "25–60", value: 78 },
                  { group: "Under 25", value: 65 },
                  { group: "Over 60", value: 80 },
                ].map((row) => (
                  <div key={row.group}>
                    <div className="flex justify-between text-xs font-mono text-ink-muted mb-1.5">
                      <span>{row.group}</span>
                      <span>{row.value}%</span>
                    </div>
                    <div className="h-1.5 bg-ink-3 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${row.value}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.9, ease: "easeOut" }}
                        className="h-full bg-signal rounded-full"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </Reveal>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-6 py-28 border-t border-line text-center">
        <Reveal>
          <h2 className="font-display text-3xl md:text-5xl text-paper leading-tight mb-8 max-w-2xl mx-auto">
            Start reading your risk model instead of trusting it blindly.
          </h2>
          <div className="flex items-center justify-center gap-4">
            <Link to="/sign-up">
              <Button size="lg">Create an account</Button>
            </Link>
            <Link to="/sign-in">
              <Button size="lg" variant="secondary">Sign in</Button>
            </Link>
          </div>
        </Reveal>
      </section>

      <footer className="border-t border-line">
        <div className="max-w-6xl mx-auto px-6 py-8 flex items-center justify-between text-xs text-ink-muted">
          <div className="flex items-center gap-2">
            <SignalStrip size="small" className="h-3" />
            <span>Ledgergate</span>
          </div>
          <span>Built for demonstration purposes.</span>
        </div>
      </footer>
    </div>
  );
}
