import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, TrendingUp, TrendingDown, Bell, Newspaper, Zap, AlertTriangle } from "lucide-react";
import { useTheme } from "./ThemeContext";

const TEMPLATES = [
  { sym: "AAPL", type: "earnings", title: "Apple beats Q2 EPS by $0.18", body: "Revenue of $94.8B exceeded consensus. Services segment hit all-time high.", time: "2m ago", sentiment: 1 },
  { sym: "NVDA", type: "catalyst", title: "NVIDIA H200 demand surges ahead of AI buildout", body: "Hyperscaler orders push backlog to 18 months. Data center revenue likely to re-accelerate.", time: "5m ago", sentiment: 1 },
  { sym: "META", type: "risk", title: "EU regulator opens investigation into Meta AI", body: "GDPR compliance probe could result in €2B fine. Shares down 1.8% pre-market.", time: "11m ago", sentiment: -1 },
  { sym: "TSLA", type: "volume", title: "Tesla unusual options activity detected", body: "Block of 50K puts purchased at $230 strike — suggests hedge fund positioning.", time: "14m ago", sentiment: -1 },
  { sym: "JPM", type: "analyst", title: "Goldman upgrades JPMorgan to Strong Buy", body: "Target raised to $225. Net interest income expected to stay elevated into Q4.", time: "22m ago", sentiment: 1 },
  { sym: "BTC", type: "risk", title: "Bitcoin ETF sees $480M inflows in single day", body: "BlackRock and Fidelity ETFs dominating flow. Spot price approaches $68K resistance.", time: "28m ago", sentiment: 1 },
  { sym: "XOM", type: "catalyst", title: "ExxonMobil raises dividend by 4%", body: "Third consecutive annual hike. FCF yield now 6.2% — one of highest in sector.", time: "35m ago", sentiment: 1 },
  { sym: "MSFT", type: "earnings", title: "Microsoft Azure growth re-accelerates to 38%", body: "AI workloads driving incremental cloud demand. FY25 guidance raised across all segments.", time: "1h ago", sentiment: 1 },
];

const ALERTS_TEMPLATES = [
  { sym: "META", severity: "warning", msg: "META down 1.8% — near support at $510", ts: "just now" },
  { sym: "WTI", severity: "info", msg: "Crude Oil spike: +2.3% in 5 min — airline stocks may be impacted", ts: "3m ago" },
  { sym: "BTC", severity: "warning", msg: "Bitcoin volatility 3.2σ above 30-day average", ts: "7m ago" },
  { sym: "TSLA", severity: "critical", msg: "TSLA options flow: unusual $230 put buying detected", ts: "14m ago" },
  { sym: "NVDA", severity: "info", msg: "NVDA hitting new 52-week high — momentum continuing", ts: "18m ago" },
];

export function NewsPanel({ open, onClose, symMap }) {
  const { theme: t } = useTheme();
  const [tab, setTab] = useState("news");
  const [alerts, setAlerts] = useState(ALERTS_TEMPLATES);

  // Add dynamic alerts based on real anomalies
  useEffect(() => {
    const crashedSyms = Object.entries(symMap).filter(([,d]) => d.stdDev > 2.5 && d.change < 0);
    if (crashedSyms.length > 0) {
      const [sym, data] = crashedSyms[0];
      setAlerts(prev => {
        const exists = prev.find(a => a.sym === sym && a.severity === "critical");
        if (exists) return prev;
        return [{ sym, severity: "critical", msg: `${sym} dropping ${(data.change * 100).toFixed(2)}% — ${data.stdDev.toFixed(1)}σ deviation`, ts: "live" }, ...prev].slice(0, 8);
      });
    }
  }, [symMap]);

  const sentColor = (s) => s === 1 ? t.green : s === -1 ? t.red : t.amber;
  const sevColor = (s) => s === "critical" ? t.red : s === "warning" ? t.amber : t.accent;
  const typeLabel = { earnings: "EARNINGS", catalyst: "CATALYST", risk: "RISK", volume: "VOLUME", analyst: "ANALYST" };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }}
            onClick={onClose}
            style={{ position: "fixed", inset: 0, zIndex: 500, background: "#000" }} />
          <motion.div
            initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 280, damping: 30 }}
            style={{ position: "fixed", top: 0, right: 0, bottom: 0, zIndex: 501,
              width: 380, background: t.surface, backdropFilter: "blur(20px)",
              boxShadow: `-6px 0 40px rgba(0,0,0,0.4), 0 0 0 1px ${t.borderAccent}`,
              display: "flex", flexDirection: "column" }}>

            <div style={{ padding: "18px 20px 0", borderBottom: `1px solid ${t.border}` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Newspaper size={16} color={t.accent} />
                  <span style={{ fontFamily: t.fontDisplay, fontSize: 14, fontWeight: 800, color: t.text }}>Market Intelligence</span>
                </div>
                <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: t.textSub }}>
                  <X size={16} />
                </button>
              </div>
              <div style={{ display: "flex", gap: 2, marginBottom: -1 }}>
                {[["news","News Feed"],["alerts","Alerts"]].map(([id, label]) => (
                  <button key={id} onClick={() => setTab(id)} style={{
                    padding: "8px 16px", borderRadius: "8px 8px 0 0", border: "none", cursor: "pointer",
                    background: tab === id ? t.accentGlow : "transparent",
                    borderBottom: `2px solid ${tab === id ? t.accent : "transparent"}`,
                    color: tab === id ? t.text : t.textSub,
                    fontFamily: t.fontDisplay, fontSize: 12, fontWeight: 700, transition: "all 0.2s",
                  }}>{label}</button>
                ))}
              </div>
            </div>

            <div style={{ flex: 1, overflowY: "auto" }}>
              {tab === "news" && TEMPLATES.map((item, i) => {
                const sym = symMap[item.sym];
                return (
                  <motion.div key={i} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    style={{ padding: "14px 20px", borderBottom: `1px solid ${t.border}`,
                      borderLeft: `3px solid ${sentColor(item.sentiment)}` }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5, alignItems: "flex-start" }}>
                      <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                        <span style={{ fontFamily: t.fontMono, fontSize: 10, fontWeight: 700, color: t.accent }}>{item.sym}</span>
                        <span style={{ fontSize: 9, color: t.textSub, background: t.glass, padding: "1px 5px", borderRadius: 4,
                          fontFamily: t.fontDisplay, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                          {typeLabel[item.type]}
                        </span>
                      </div>
                      <span style={{ fontSize: 10, color: t.textDim, fontFamily: t.fontMono }}>{item.time}</span>
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: t.text, fontFamily: t.fontDisplay, marginBottom: 5, lineHeight: 1.4 }}>
                      {item.title}
                    </div>
                    <div style={{ fontSize: 11, color: t.textSub, fontFamily: t.name === "calm" ? t.fontSerif : t.fontDisplay,
                      lineHeight: 1.5 }}>{item.body}</div>
                    {sym && (
                      <div style={{ marginTop: 6, display: "flex", gap: 8 }}>
                        <span style={{ fontFamily: t.fontMono, fontSize: 10, color: t.textSub }}>
                          ${sym.price.toFixed(2)}
                        </span>
                        <span style={{ fontFamily: t.fontMono, fontSize: 10,
                          color: sym.change >= 0 ? t.green : t.red }}>
                          {sym.change >= 0 ? "▲" : "▼"} {Math.abs(sym.change * 100).toFixed(2)}%
                        </span>
                      </div>
                    )}
                  </motion.div>
                );
              })}

              {tab === "alerts" && alerts.map((a, i) => {
                const color = sevColor(a.severity);
                return (
                  <motion.div key={i} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    style={{ padding: "12px 20px", borderBottom: `1px solid ${t.border}`,
                      borderLeft: `3px solid ${color}`,
                      background: a.ts === "live" ? `${color}08` : "transparent" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                      <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                        <AlertTriangle size={11} color={color} />
                        <span style={{ fontFamily: t.fontMono, fontSize: 10, fontWeight: 700, color }}>{a.sym}</span>
                        {a.ts === "live" && (
                          <span style={{ fontSize: 8, background: `${t.red}20`, color: t.red, padding: "1px 5px",
                            borderRadius: 4, fontWeight: 800, fontFamily: t.fontDisplay, animation: "criticalPulse 1s infinite" }}>
                            LIVE
                          </span>
                        )}
                      </div>
                      <span style={{ fontSize: 10, color: t.textDim, fontFamily: t.fontMono }}>{a.ts}</span>
                    </div>
                    <div style={{ fontSize: 12, color: t.text, fontFamily: t.fontDisplay, lineHeight: 1.45 }}>{a.msg}</div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
