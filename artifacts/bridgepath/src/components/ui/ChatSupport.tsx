import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Bot, Loader2, ExternalLink } from "lucide-react";

const TERRACOTTA = "#C04020";
const INK = "#1E1511";

type Message = { from: "bot" | "user"; text: string };

const WELCOME_MSGS: Message[] = [
  {
    from: "bot",
    text: "👋 Hi! I'm the Bridgepath Africa AI assistant. Ask me anything about finding jobs, posting a role, our HR services, or how the platform works.",
  },
];

const QUICK_OPTIONS = [
  "How do I post a job?",
  "How does AI CV Review work?",
  "Which countries do you operate in?",
  "What HR services do you offer?",
];

export function ChatSupport() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>(WELCOME_MSGS);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasUnread, setHasUnread] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const historyForApi = messages
    .filter((m) => m.from !== "bot" || messages.indexOf(m) > 0)
    .map((m) => ({ role: m.from === "user" ? "user" : "assistant" as const, content: m.text }))
    .slice(-6);

  useEffect(() => {
    if (open) {
      setHasUnread(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;
    const userMsg: Message = { from: "user", text: text.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text.trim(),
          history: historyForApi,
        }),
      });
      const data = await res.json();
      const reply = data.reply || "I'm having trouble right now. Please email support@bridgepathnetwork.com.";
      setMessages((prev) => [...prev, { from: "bot", text: reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          from: "bot",
          text: "I'm offline right now. Please email us at support@bridgepathnetwork.com and we'll reply within a few hours.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) sendMessage(input.trim());
  };

  const showQuickOptions = messages.length <= 2 && !isLoading;

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.92 }}
            transition={{ type: "spring", stiffness: 340, damping: 28 }}
            className="fixed bottom-[88px] right-5 z-50 w-[340px] rounded-2xl shadow-2xl overflow-hidden flex flex-col"
            style={{ border: "1px solid rgba(0,0,0,0.10)", backgroundColor: "#fff", maxHeight: "min(520px, calc(100vh - 120px))" }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 shrink-0" style={{ backgroundColor: INK }}>
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: TERRACOTTA }}>
                  <Bot className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="text-white text-sm font-bold leading-none">Bridgepath AI</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <span className="h-1.5 w-1.5 rounded-full animate-pulse" style={{ backgroundColor: "#4ade80" }} />
                    <span className="text-[11px]" style={{ color: "#4ade80" }}>Online</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <a href="mailto:support@bridgepathnetwork.com" title="Email support"
                  className="text-gray-400 hover:text-white transition-colors p-1">
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
                <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-white transition-colors p-1" aria-label="Close chat">
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2.5" style={{ backgroundColor: "#f9fafb", minHeight: 0 }}>
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.from === "user" ? "justify-end" : "justify-start"}`}>
                  {msg.from === "bot" && (
                    <div className="h-6 w-6 rounded-full flex items-center justify-center shrink-0 mr-2 mt-0.5" style={{ backgroundColor: TERRACOTTA }}>
                      <Bot className="h-3 w-3 text-white" />
                    </div>
                  )}
                  <div
                    className="max-w-[78%] px-3.5 py-2.5 text-sm leading-relaxed"
                    style={
                      msg.from === "user"
                        ? { backgroundColor: TERRACOTTA, color: "white", borderRadius: "18px 18px 4px 18px" }
                        : { backgroundColor: "white", color: "#1f2937", border: "1px solid #e5e7eb", borderRadius: "4px 18px 18px 18px", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }
                    }
                  >
                    {msg.text}
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start items-end gap-2">
                  <div className="h-6 w-6 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: TERRACOTTA }}>
                    <Bot className="h-3 w-3 text-white" />
                  </div>
                  <div className="px-4 py-3 rounded-2xl bg-white border border-gray-100 flex gap-1.5 items-center" style={{ borderRadius: "4px 18px 18px 18px" }}>
                    {[0, 1, 2].map((i) => (
                      <span key={i} className="h-2 w-2 rounded-full bg-gray-300 animate-bounce"
                        style={{ animationDelay: `${i * 0.15}s`, animationDuration: "0.9s" }} />
                    ))}
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick options */}
            {showQuickOptions && (
              <div className="px-3 py-2 flex flex-wrap gap-1.5 shrink-0" style={{ backgroundColor: "#f9fafb", borderTop: "1px solid #e5e7eb" }}>
                {QUICK_OPTIONS.map((opt) => (
                  <button key={opt} onClick={() => sendMessage(opt)}
                    className="text-xs px-2.5 py-1.5 rounded-full border bg-white text-gray-600 hover:text-white transition-all hover:shadow-sm"
                    style={{ borderColor: TERRACOTTA + "40" }}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = TERRACOTTA; e.currentTarget.style.color = "white"; e.currentTarget.style.borderColor = TERRACOTTA; }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "white"; e.currentTarget.style.color = "#4b5563"; e.currentTarget.style.borderColor = TERRACOTTA + "40"; }}>
                    {opt}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <form onSubmit={handleSubmit} className="flex items-center gap-2 p-3 shrink-0"
              style={{ borderTop: "1px solid #e5e7eb", backgroundColor: "white" }}>
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask anything…"
                disabled={isLoading}
                className="flex-1 text-sm px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:border-transparent disabled:opacity-60 bg-gray-50"
                style={{ "--tw-ring-color": TERRACOTTA + "40" } as any}
                maxLength={800}
              />
              <button type="submit" disabled={!input.trim() || isLoading}
                className="h-9 w-9 rounded-xl flex items-center justify-center text-white disabled:opacity-40 transition-all hover:opacity-90 shrink-0"
                style={{ backgroundColor: TERRACOTTA }}>
                {isLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FAB */}
      <motion.button
        onClick={() => setOpen(!open)}
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.94 }}
        className="fixed bottom-6 right-5 z-50 h-14 w-14 rounded-full shadow-xl flex items-center justify-center transition-all"
        style={{ backgroundColor: open ? INK : TERRACOTTA, boxShadow: `0 4px 24px rgba(192,64,32,0.45)` }}
        aria-label="Chat support"
      >
        <AnimatePresence mode="wait">
          {open ? (
            <motion.div key="close" initial={{ rotate: -80, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 80, opacity: 0 }} transition={{ duration: 0.18 }}>
              <X className="h-6 w-6 text-white" />
            </motion.div>
          ) : (
            <motion.div key="open" initial={{ rotate: 80, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -80, opacity: 0 }} transition={{ duration: 0.18 }}>
              <MessageCircle className="h-6 w-6 text-white" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Unread badge */}
        {!open && hasUnread && (
          <motion.span
            initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 400, damping: 15 }}
            className="absolute -top-1 -right-1 h-4 w-4 rounded-full text-[9px] font-bold text-white flex items-center justify-center"
            style={{ backgroundColor: "#ef4444" }}>
            1
          </motion.span>
        )}
      </motion.button>
    </>
  );
}
