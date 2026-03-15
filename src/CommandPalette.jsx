import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, TrendingUp, AlertTriangle, Zap, Shield, Newspaper } from "lucide-react";
import { useTheme } from "./ThemeContext";
import { SYMBOLS, SECTORS, COMPANIES } from "./useDataStream";

const COMMANDS = [
  { id: "/risk", label: "Open Risk Panel", icon: Shield, desc: "View exposure & stop-losses" },
  { id: "/news", label: "Market Intelligence", icon: Newspaper, desc: "News & alerts feed" },
  { id: "/focus", label: "Toggle Focus Mode", icon: Zap, desc: "Reduce visual noise" },
  { id: "/anomalies", label: "Anomaly Tracker", icon: AlertTriangle, desc: "Active deviations" },
];

export function CommandPalette({ open, onClose, onSymbol, onCommand }) {
  const { theme: t } = useTheme();
  const [q, setQ] = useState("");
  const ref = useRef(null);

  useEffect(() => { if (open) { setQ(""); setTimeout(() => ref.current?.focus(), 40); } }, [open]);

  const symResults = SYMBOLS.filter(s =>
    s.toLowerCase().includes(q.toLowerCase()) || (COMPANIES[s] || "").toLowerCase().includes(q.toLowerCase())
  ).slice(0, 7);

  const cmdResults = q.startsWith("/") ? COMMANDS.filter(c => c.id.includes(q) || c.label.toLowerCase().includes(q.slice(1).toLowerCase())) : COMMANDS.slice(0, 2);

  const results = [
    ...symResults.map(s => ({ type: "symbol", id: s, label: s, desc: `${COMPANIES[s]} · ${SECTORS[s]}` })),
    ...cmdResults,
  ].slice(0, 10);

  const select = (item) => {
    if (item.type === "symbol") onSymbol(item.id);
    else onCommand(item.id);
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(0,0,0,0.55)", backdropFilter: "blur(6px)" }} />
          <motion.div
            initial={{ opacity: 0, y: -16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -16, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 380, damping: 32 }}
            style={{ position: "fixed", top: "16%", left: "50%", transform: "translateX(-50%)",
              zIndex: 1001, width: 520, maxWidth: "92vw",
              background: t.surface, backdropFilter: "blur(24px)",
              border: `1px solid ${t.borderAccent}`,
              borderRadius: 16, overflow: "hidden",
              boxShadow: `0 24px 80px rgba(0,0,0,0.5), 0 0 0 1px ${t.accentGlow}` }}>
            {/* Input */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 16px",
              borderBottom: `1px solid ${t.border}`, background: t.glass }}>
              <Search size={16} color={t.accent} />
              <input ref={ref} value={q} onChange={e => setQ(e.target.value)}
                placeholder="Search symbols or type /command…"
                style={{ flex: 1, background: "none", border: "none", outline: "none",
                  fontSize: 14, color: t.text, fontFamily: t.fontDisplay }}
                onKeyDown={e => {
                  if (e.key === "Escape") onClose();
                  if (e.key === "Enter" && results[0]) select(results[0]);
                }} />
              <span style={{ fontSize: 10, color: t.textDim, fontFamily: t.fontMono,
                border: `1px solid ${t.border}`, borderRadius: 5, padding: "2px 6px" }}>ESC</span>
            </div>

            {/* Results */}
            <div style={{ maxHeight: 340, overflowY: "auto" }}>
              {results.length === 0 ? (
                <div style={{ padding: 24, textAlign: "center", fontSize: 12, color: t.textSub, fontFamily: t.fontDisplay }}>
                  No results — try a ticker like "AAPL" or "/risk"
                </div>
              ) : results.map((item, i) => {
                const Icon = item.icon || TrendingUp;
                return (
                  <button key={item.id + i} onClick={() => select(item)}
                    style={{ width: "100%", background: "none", border: "none", cursor: "pointer",
                      padding: "10px 16px", display: "flex", alignItems: "center", gap: 12,
                      borderBottom: `1px solid ${t.border}`, transition: "background 0.12s" }}
                    onMouseEnter={e => e.currentTarget.style.background = t.glass}
                    onMouseLeave={e => e.currentTarget.style.background = "none"}>
                    <div style={{ width: 30, height: 30, borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center",
                      background: item.type === "symbol" ? `${t.accent}18` : `${t.amber}18` }}>
                      <Icon size={14} color={item.type === "symbol" ? t.accent : t.amber} />
                    </div>
                    <div style={{ flex: 1, textAlign: "left" }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: t.text, fontFamily: t.fontMono }}>{item.label}</div>
                      <div style={{ fontSize: 11, color: t.textSub, fontFamily: t.fontDisplay }}>{item.desc}</div>
                    </div>
                    {i === 0 && (
                      <span style={{ fontSize: 10, color: t.textDim, fontFamily: t.fontMono,
                        border: `1px solid ${t.border}`, borderRadius: 4, padding: "2px 5px" }}>↵</span>
                    )}
                  </button>
                );
              })}
            </div>

            <div style={{ padding: "8px 16px", borderTop: `1px solid ${t.border}`,
              display: "flex", gap: 14, alignItems: "center" }}>
              {[["↑↓","Navigate"],["↵","Select"],["/","Commands"]].map(([k,v]) => (
                <span key={k} style={{ fontSize: 10, color: t.textSub, fontFamily: t.fontDisplay,
                  display: "flex", gap: 5, alignItems: "center" }}>
                  <span style={{ fontFamily: t.fontMono, color: t.accent }}>{k}</span> {v}
                </span>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
