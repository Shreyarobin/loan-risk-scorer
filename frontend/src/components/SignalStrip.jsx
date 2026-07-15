import { motion } from "framer-motion";

// A row of ledger-style ticks that stream in and settle — approve (signal green)
// or flag (alert coral) — representing individual factors resolving into a decision.
// This is the product's signature visual: risk isn't a black box, it's many small,
// legible signals you can see settle into place.
const PATTERN = [
  "signal", "signal", "alert", "signal", "signal", "signal",
  "alert", "signal", "signal", "signal", "alert", "signal",
  "signal", "signal", "signal", "alert", "signal", "signal",
];

export default function SignalStrip({ size = "default", className = "" }) {
  const barHeight = size === "small" ? "h-4" : "h-10 md:h-14";
  const gap = size === "small" ? "gap-[3px]" : "gap-1 md:gap-1.5";

  return (
    <div className={`flex items-end ${gap} ${className}`} aria-hidden="true">
      {PATTERN.map((kind, i) => (
        <motion.span
          key={i}
          initial={{ scaleY: 0, opacity: 0 }}
          animate={{ scaleY: 1, opacity: 1 }}
          transition={{
            delay: i * 0.045,
            duration: 0.5,
            ease: [0.22, 1, 0.36, 1],
          }}
          style={{ transformOrigin: "bottom" }}
          className={`w-[3px] md:w-1 ${barHeight} rounded-full ${
            kind === "signal" ? "bg-signal" : "bg-alert"
          } origin-bottom`}
        />
      ))}
    </div>
  );
}
