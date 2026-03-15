import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Bot, User, Minimize2 } from "lucide-react";
import { useTheme } from "./ThemeContext";

const RESPONSES = {
  "aapl": "Apple (AAPL) is showing strong momentum. The latest earnings beat consensus by $0.18 EPS. Analyst consensus is 68% Buy. Risk-adjusted entry looks favorable above $187 support.",
  "nvda": "NVIDIA (NVDA) is in a strong uptrend driven by AI GPU demand. H200 backlog is 18 months. High conviction bullish — but already priced for perfection. Watch for profit-taking near $900.",
  "btc": "Bitcoin is consolidating near $67,400. ETF inflows remain strong. The halving event historically triggers 12-18 month bull cycles. Caution: volatility is elevated at 3.2σ above average.",
  "risk": "Your portfolio risk exposure looks elevated in Tech (42% concentration). Consider diversifying into Energy or Financials to reduce single-sector correlation. The Diversify button is highlighted for you.",
  "calm": "Calm Mode reduces visual noise by switching to a softer color palette and serif fonts. It's designed to lower cognitive stress during volatile market sessions. Try it from the sidebar!",
  "sell": "Before selling, check the Trade Story panel for any recent news catalysts. The 5-second undo window gives you time to reconsider. Remember: reacting to short-term moves is a common bias trap.",
  "volatile": "Current market volatility is elevated across multiple sectors. This is a good time to review your stop-losses and reduce position sizes if needed. Consider switching to Calm Mode.",
  "hello": "Hello! I'm your Omni Terminal AI assistant. Ask me about any stock symbol (e.g. 'AAPL'), risk management, how to use features, or just say 'volatile' to check market conditions.",
  "help": "I can help you with: stock analysis (type a ticker), risk guidance, feature explanations (try 'calm mode' or 'trade story'), and market conditions. What would you like to know?",
};

const getResponse = (msg) => {
  const lower = msg.toLowerCase();
  for (const [key, val] of Object.entries(RESPONSES)) {
    if (lower.includes(key)) return val;
  }
  return `I'm analyzing your query about "${msg}". For real-time data, check the watchlist or use Ctrl+K to search any symbol. I can also explain features, risk management, or market conditions — just ask!`;
};

export function AIBot({ open, onClose }) {
  const { theme: t } = useTheme();
  const [messages, setMessages] = useState([
    { role: "bot", text: "Hi! I'm your Omni Terminal AI. Ask me about any stock, risk management, or how to use any feature. Type 'help' to get started." }
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const endRef = useRef(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const send = () => {
    if (!input.trim()) return;
    const userMsg = input.trim();
    setInput("");
    setMessages(m => [...m, { role: "user", text: userMsg }]);
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      setMessages(m => [...m, { role: "bot", text: getResponse(userMsg) }]);
    }, 800 + Math.random() * 600);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: "spring", stiffness: 300, damping: 28 }}
          style={{ position: "fixed", bottom: 80, right: 24, zIndex: 800,
            width: 340, borderRadius: 16,
            background: t.surface, backdropFilter: "blur(20px)",
            border: `1px solid ${t.borderAccent}`,
            boxShadow: `0 16px 60px rgba(0,0,0,0.4), 0 0 0 1px ${t.accentGlow}`,
            overflow: "hidden" }}>

          {/* Header */}
          <div style={{ padding: "12px 16px", background: `linear-gradient(135deg, ${t.accent}18, ${t.green}10)`,
            borderBottom: `1px solid ${t.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 28, height: 28, borderRadius: "50%",
                background: `linear-gradient(135deg, ${t.accent}, ${t.green})`,
                display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Bot size={14} color="#000" />
              </div>
              <div>
                <div style={{ fontFamily: t.fontDisplay, fontSize: 12, fontWeight: 800, color: t.text }}>Omni AI</div>
                <div style={{ fontSize: 9, color: t.green, fontFamily: t.fontMono }}>● Online</div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              <button onClick={() => setMinimized(m => !m)}
                style={{ background: "none", border: "none", cursor: "pointer", color: t.textSub }}>
                <Minimize2 size={13} />
              </button>
              <button onClick={onClose}
                style={{ background: "none", border: "none", cursor: "pointer", color: t.textSub }}>
                <X size={14} />
              </button>
            </div>
          </div>

          {!minimized && (
            <>
              {/* Messages */}
              <div style={{ height: 260, overflowY: "auto", padding: "12px 14px", display: "flex", flexDirection: "column", gap: 10 }}>
                {messages.map((m, i) => {
                  const isBot = m.role === "bot";
                  return (
                    <motion.div key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                      style={{ display: "flex", gap: 8, justifyContent: isBot ? "flex-start" : "flex-end" }}>
                      {isBot && (
                        <div style={{ width: 22, height: 22, borderRadius: "50%", background: `${t.accent}30`,
                          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          <Bot size={11} color={t.accent} />
                        </div>
                      )}
                      <div style={{
                        maxWidth: "78%", padding: "8px 11px", borderRadius: isBot ? "4px 12px 12px 12px" : "12px 4px 12px 12px",
                        background: isBot ? t.glass : `${t.accent}22`,
                        border: `1px solid ${isBot ? t.border : t.accent + "40"}`,
                        fontSize: 12, color: t.text, fontFamily: t.fontDisplay, lineHeight: 1.5,
                      }}>
                        {m.text}
                      </div>
                      {!isBot && (
                        <div style={{ width: 22, height: 22, borderRadius: "50%", background: `${t.green}30`,
                          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          <User size={11} color={t.green} />
                        </div>
                      )}
                    </motion.div>
                  );
                })}
                {typing && (
                  <div style={{ display: "flex", gap: 8 }}>
                    <div style={{ width: 22, height: 22, borderRadius: "50%", background: `${t.accent}30`,
                      display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Bot size={11} color={t.accent} />
                    </div>
                    <div style={{ padding: "8px 14px", borderRadius: "4px 12px 12px 12px",
                      background: t.glass, border: `1px solid ${t.border}`,
                      display: "flex", gap: 4, alignItems: "center" }}>
                      {[0,1,2].map(i => (
                        <div key={i} style={{ width: 5, height: 5, borderRadius: "50%", background: t.textSub,
                          animation: `dotPulse 1.2s ${i * 0.2}s infinite` }} />
                      ))}
                    </div>
                  </div>
                )}
                <div ref={endRef} />
              </div>

              {/* Input */}
              <div style={{ padding: "10px 12px", borderTop: `1px solid ${t.border}`,
                display: "flex", gap: 8, alignItems: "center" }}>
                <input value={input} onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && send()}
                  placeholder="Ask about AAPL, risk, features…"
                  style={{ flex: 1, padding: "8px 10px", borderRadius: 9, background: t.glass,
                    border: `1px solid ${t.border}`, color: t.text, fontSize: 11,
                    fontFamily: t.fontDisplay, outline: "none" }} />
                <button onClick={send}
                  style={{ width: 30, height: 30, borderRadius: 9, border: "none", cursor: "pointer",
                    background: `linear-gradient(135deg, ${t.accent}, ${t.green})`,
                    display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Send size={12} color="#000" />
                </button>
              </div>
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
