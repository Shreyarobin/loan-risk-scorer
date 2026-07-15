import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send } from "lucide-react";
import Card from "../../components/Card";

const API_BASE = "http://127.0.0.1:8000";

export default function PolicyAssistant() {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function handleAsk(e) {
    e.preventDefault();
    if (!question.trim() || loading) return;

    const userMessage = { role: "user", text: question };
    setMessages((m) => [...m, userMessage]);
    setQuestion("");
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/policy-assistant/ask`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: userMessage.text }),
      });
      const data = await res.json();
      setMessages((m) => [
        ...m,
        { role: "assistant", text: data.answer, sources: data.retrieved_chunks },
      ]);
    } catch {
      setMessages((m) => [...m, { role: "assistant", text: "Something went wrong reaching the assistant.", error: true }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <h1 className="font-display text-2xl text-ink900 mb-1">Policy assistant</h1>
      <p className="text-sm text-slate mb-6">
        Ask a lending-compliance question. Answers are grounded in the actual regulation text.
      </p>

      <Card light className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {messages.length === 0 && (
            <p className="text-sm text-slate italic">
              Try: "What must a lender disclose when denying a loan application?"
            </p>
          )}
          <AnimatePresence>
            {messages.map((m, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[75%] rounded-card px-4 py-3 text-sm leading-relaxed ${
                    m.role === "user"
                      ? "bg-ink text-paper"
                      : "bg-paper border border-line-light text-ink900"
                  }`}
                >
                  {m.text}
                  {m.sources && (
                    <div className="mt-3 pt-3 border-t border-line-light space-y-1">
                      {m.sources.map((s, j) => (
                        <p key={j} className="font-mono text-[11px] text-slate">
                          {s.source} · relevance {s.relevance_distance.toFixed(3)}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {loading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-1.5 pl-1">
              {[0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ repeat: Infinity, duration: 1, delay: i * 0.15 }}
                  className="w-1.5 h-1.5 rounded-full bg-slate"
                />
              ))}
            </motion.div>
          )}
          <div ref={bottomRef} />
        </div>

        <form onSubmit={handleAsk} className="border-t border-line-light p-4 flex gap-3">
          <input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask a compliance question…"
            className="flex-1 bg-white border border-line-light rounded-card px-4 py-2.5 text-sm text-ink900 focus-visible:border-signal"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-10 h-10 shrink-0 rounded-card bg-ink text-paper flex items-center justify-center hover:bg-ink-2 transition-colors disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </Card>
    </div>
  );
}
