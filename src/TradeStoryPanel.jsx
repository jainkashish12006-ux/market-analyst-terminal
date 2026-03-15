import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, TrendingUp, TrendingDown, BookOpen, ShieldCheck, BarChart2, Zap } from "lucide-react";
import { useTheme } from "./ThemeContext";
import { AnimatedPrice, Sparkline, AnalystGauge } from "./MicroComponents";
import { COMPANIES } from "./useDataStream";

const STORIES = {
  AAPL: ["Earnings beat consensus EPS by $0.18 — strongest Q in 3 years", "Vision Pro shipments up 22% QoQ, beating analyst expectations", "EU App Store compliance may pressure Services revenue ~4%"],
  MSFT: ["Azure AI revenue surged 38% YoY, driven by Copilot enterprise adoption", "Activision integration costs slightly compressed operating margin", "GitHub Copilot reaches 2.2M paid subscribers — fastest ARR ramp ever"],
  NVDA: ["H200 GPU backlog extends to 18 months — supply severely constrained", "Data center revenue hit $22.6B — exceeded consensus by $3.2B", "China export restrictions may remove ~$4B in annual revenue"],
  DEFAULT: (sym) => [`${sym} shows elevated institutional activity vs 30-day avg`, `Options flow suggests smart money positioning ahead of catalyst`, `Volume surge detected — 2.4× average daily turnover`],
};

function CountdownBar({ side, price, theme: t, onDone, onCancel }) {
  const [pct, setPct] = useState(0);
  const [done, setDone] = useState(false);
  const start = useRef(Date.now());
  const DUR = 5000;

  useEffect(() => {
    const iv = setInterval(() => {
      const p = Math.min((Date.now() - start.current) / DUR, 1);
      setPct(p);
      if (p >= 1) { clearInterval(iv); setDone(true); onDone?.(); }
    }, 40);
    return () => clearInterval(iv);
  }, []);

  const color = side === "buy" ? t.green : t.amber;
  const secs = Math.ceil((1 - pct) * 5);

  return (
    <div style={{ background: `${color}12`, border: `1px solid ${color}40`, borderRadius: 12, padding: "14px 16px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
        <span style={{ fontFamily: t.fontMono, fontSize: 11, color, fontWeight: 700 }}>
          {done ? "✓ ORDER SENT" : `${side.toUpperCase()} @ $${price?.toFixed(2)} — ${secs}s`}
        </span>
        {!done && (
          <button onClick={onCancel} style={{ background: `${t.red}15`, border: `1px solid ${t.red}40`,
            borderRadius: 6, padding: "3px 10px", cursor: "pointer",
            color: t.red, fontSize: 11, fontWeight: 700, fontFamily: t.fontDisplay }}>
            ✕ Cancel
          </button>
        )}
      </div>
      <div style={{ height: 4, background: t.glass, borderRadius: 2, overflow: "hidden" }}>
        <motion.div animate={{ width: `${pct * 100}%` }} transition={{ duration: 0.05 }}
          style={{ height: "100%", background: done ? t.green : color, borderRadius: 2 }} />
      </div>
    </div>
  );
}

function SlideToConfirm({ side, theme: t, onConfirm }) {
  const [pos, setPos] = useState(0);
  const [done, setDone] = useState(false);
  const track = useRef(null);
  const dragging = useRef(false);
  const color = side === "buy" ? t.green : t.amber;

  const onDown = () => { dragging.current = true; };
  const onMove = (e) => {
    if (!dragging.current || !track.current) return;
    const r = track.current.getBoundingClientRect();
    setPos(Math.max(0, Math.min((e.clientX - r.left - 20) / (r.width - 40), 1)));
  };
  const onUp = () => {
    if (pos > 0.87) { setDone(true); onConfirm(); }
    else setPos(0);
    dragging.current = false;
  };

  return (
    <div style={{ background: `${color}10`, border: `1px solid ${color}30`, borderRadius: 12, padding: "14px 16px" }}>
      <div style={{ fontSize: 11, color: t.textSub, fontFamily: t.fontDisplay, textAlign: "center", marginBottom: 10 }}>
        ⚡ Large order — slide to confirm {side.toUpperCase()}
      </div>
      <div ref={track} onMouseMove={onMove} onMouseUp={onUp} onMouseLeave={onUp}
        style={{ height: 40, background: t.glass, borderRadius: 20, position: "relative",
          overflow: "hidden", userSelect: "none", border: `1px solid ${color}30` }}>
        <div style={{ position: "absolute", inset: 0, background: `${color}20`, width: `${pos * 100}%`, borderRadius: 20 }} />
        <motion.div onMouseDown={onDown}
          style={{ position: "absolute", top: 4, left: `calc(${pos * (100 - 24)}% )`, width: 32, height: 32,
            borderRadius: 16, background: done ? t.green : color, cursor: "grab",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: `0 2px 10px ${color}60` }}>
          <span style={{ fontSize: 14 }}>{done ? "✓" : "→"}</span>
        </motion.div>
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 11, color: `${color}70`, fontFamily: t.fontDisplay, fontWeight: 600, pointerEvents: "none" }}>
          {done ? "Confirmed" : "Slide →"}
        </div>
      </div>
    </div>
  );
}

export function TradeStoryPanel({ symbol, data, open, onClose }) {
  const { theme: t } = useTheme();
  const [risk, setRisk] = useState("500");
  const [side, setSide] = useState("buy");
  const [exec, setExec] = useState(false);
  const [large, setLarge] = useState(false);
  const [done, setDone] = useState(false);

  const stories = STORIES[symbol] || STORIES.DEFAULT(symbol || "STOCK");
  const price = data?.price || 0;
  const stopLoss = price - (parseFloat(risk) || 0);
  const shares = price > 0 ? ((parseFloat(risk) || 0) / price).toFixed(3) : "—";
  const isUp = (data?.change || 0) >= 0;
  const color = isUp ? t.green : t.red;
  const buy = 38 + Math.floor((symbol?.charCodeAt(0) || 65) % 20);
  const sell = 10 + Math.floor((symbol?.charCodeAt(1) || 65) % 15);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.45 }} exit={{ opacity: 0 }}
            onClick={onClose}
            style={{ position: "fixed", inset: 0, zIndex: 500, background: "#000" }} />
          <motion.div
            initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
            transition={{ type: "spring", mass: 1, stiffness: 170, damping: 26 }}
            style={{ position: "fixed", top: 0, right: 0, bottom: 0, zIndex: 501,
              width: 400, background: t.surface, backdropFilter: "blur(20px)",
              boxShadow: `-8px 0 48px rgba(0,0,0,0.4), 0 0 0 1px ${t.borderAccent}`,
              display: "flex", flexDirection: "column", overflow: "hidden" }}>

            {/* Header */}
            <div style={{ padding: "18px 20px", borderBottom: `1px solid ${t.border}`,
              background: t.glass, backdropFilter: "blur(10px)", position: "sticky", top: 0, zIndex: 1 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <div style={{ fontFamily: t.fontMono, fontSize: 22, fontWeight: 800, color: t.accent }}>{symbol}</div>
                  <div style={{ fontSize: 11, color: t.textSub, fontFamily: t.fontDisplay }}>{COMPANIES[symbol] || symbol} · One-Click Deep Dive</div>
                </div>
                <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: t.textSub }}>
                  <X size={18} />
                </button>
              </div>
            </div>

            <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px", display: "flex", flexDirection: "column", gap: 14 }}>
              {/* Price + chart */}
              <div style={{ background: t.glass, backdropFilter: t.glassBlur, borderRadius: 12,
                padding: "14px", border: `1px solid ${t.border}`, boxShadow: t.shadow }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <AnimatedPrice value={price} decimals={2} size={24} bold />
                  <span style={{ fontFamily: t.fontMono, fontSize: 12, color, display: "flex", alignItems: "center", gap: 4 }}>
                    {isUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                    {((data?.change || 0) * 100).toFixed(3)}%
                  </span>
                </div>
                <Sparkline data={data?.h60 || data?.history || [price]} color={color}
                  width={340} height={52} area smooth={t.name === "calm"} />
              </div>

              {/* AI Digest */}
              <div style={{ background: t.glass, backdropFilter: t.glassBlur, borderRadius: 12,
                padding: "14px", border: `1px solid ${t.border}`, boxShadow: t.shadow }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 12 }}>
                  <BookOpen size={13} color={t.accent} />
                  <span style={{ fontSize: 10, fontWeight: 700, color: t.textSub, fontFamily: t.fontDisplay,
                    textTransform: "uppercase", letterSpacing: "0.08em" }}>24H AI Digest</span>
                  <span style={{ fontSize: 9, background: `${t.accent}20`, color: t.accent, padding: "1px 6px",
                    borderRadius: 6, fontFamily: t.fontMono }}>AI</span>
                </div>
                {stories.map((s, i) => (
                  <div key={i} style={{ display: "flex", gap: 10, marginBottom: 10, alignItems: "flex-start" }}>
                    <div style={{ width: 18, height: 18, borderRadius: "50%", background: `${t.accent}20`,
                      display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
                      <span style={{ fontSize: 9, fontWeight: 800, color: t.accent, fontFamily: t.fontMono }}>{i+1}</span>
                    </div>
                    <span style={{ fontSize: 12, color: t.text, fontFamily: t.name === "calm" ? t.fontSerif : t.fontDisplay,
                      lineHeight: 1.55 }}>{s}</span>
                  </div>
                ))}
              </div>

              {/* Analyst Compass */}
              <div style={{ background: t.glass, backdropFilter: t.glassBlur, borderRadius: 12,
                padding: "14px", border: `1px solid ${t.border}`, boxShadow: t.shadow }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                  <BarChart2 size={13} color={t.accent} />
                  <span style={{ fontSize: 10, fontWeight: 700, color: t.textSub, fontFamily: t.fontDisplay,
                    textTransform: "uppercase", letterSpacing: "0.08em" }}>Confidence Score</span>
                </div>
                <AnalystGauge buy={buy} hold={100-buy-sell} sell={sell} />
                <div style={{ display: "flex", gap: 12, marginTop: 4 }}>
                  {[["BUY", buy, t.green],["HOLD", 100-buy-sell, t.amber],["SELL", sell, t.red]].map(([l,v,c]) => (
                    <div key={l} style={{ flex: 1, textAlign: "center", background: `${c}12`,
                      borderRadius: 8, padding: "6px 4px", border: `1px solid ${c}30` }}>
                      <div style={{ fontFamily: t.fontMono, fontSize: 14, fontWeight: 800, color: c }}>{v}%</div>
                      <div style={{ fontSize: 9, color: t.textSub, fontFamily: t.fontDisplay }}>{l}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Risk Calculator */}
              <div style={{ background: t.glass, backdropFilter: t.glassBlur, borderRadius: 12,
                padding: "14px", border: `1px solid ${t.border}`, boxShadow: t.shadow }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 12 }}>
                  <ShieldCheck size={13} color={t.accent} />
                  <span style={{ fontSize: 10, fontWeight: 700, color: t.textSub, fontFamily: t.fontDisplay,
                    textTransform: "uppercase", letterSpacing: "0.08em" }}>Auto Risk Calculator</span>
                </div>
                <div style={{ fontSize: 11, color: t.textSub, fontFamily: t.fontDisplay, marginBottom: 8 }}>
                  Amount at risk ($) → auto-calculates shares & stop-loss
                </div>
                <input type="number" value={risk} onChange={e => setRisk(e.target.value)}
                  placeholder="500"
                  style={{ width: "100%", padding: "10px 12px", borderRadius: 9, background: t.glass,
                    border: `1px solid ${t.border}`, color: t.text, fontFamily: t.fontMono,
                    fontSize: 14, outline: "none", marginBottom: 10 }} />
                {price > 0 && parseFloat(risk) > 0 && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 12px",
                      background: `${t.green}10`, borderRadius: 8, border: `1px solid ${t.green}25` }}>
                      <span style={{ fontSize: 11, color: t.textSub, fontFamily: t.fontDisplay }}>Shares you get</span>
                      <span style={{ fontFamily: t.fontMono, fontSize: 11, color: t.green }}>{shares}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 12px",
                      background: `${t.red}10`, borderRadius: 8, border: `1px solid ${t.red}25` }}>
                      <span style={{ fontSize: 11, color: t.textSub, fontFamily: t.fontDisplay }}>⛔ Stop-Loss @ </span>
                      <span style={{ fontFamily: t.fontMono, fontSize: 11, color: t.red }}>
                        ${stopLoss.toFixed(2)}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Trade buttons / execution */}
              {!exec && !large && !done && (
                <div style={{ display: "flex", gap: 10 }}>
                  {["buy","sell"].map(s => {
                    const c = s === "buy" ? t.green : t.amber;
                    return (
                      <button key={s} onClick={() => {
                        setSide(s);
                        if (parseFloat(risk) > 5000) setLarge(true);
                        else setExec(true);
                      }} style={{ flex: 1, padding: "13px", borderRadius: 11, cursor: "pointer",
                        border: `1px solid ${c}40`, background: `${c}18`,
                        color: c, fontFamily: t.fontDisplay, fontWeight: 800, fontSize: 13,
                        transition: "all 0.2s" }}>
                        {s === "buy" ? "▲ BUY" : "▼ SELL"}
                      </button>
                    );
                  })}
                </div>
              )}
              {large && !exec && !done && (
                <SlideToConfirm side={side} theme={t} onConfirm={() => { setLarge(false); setExec(true); }} />
              )}
              {exec && !done && (
                <CountdownBar side={side} price={price} theme={t}
                  onDone={() => setDone(true)}
                  onCancel={() => { setExec(false); setDone(false); }} />
              )}
              {done && (
                <div style={{ background: `${t.green}15`, border: `1px solid ${t.green}40`,
                  borderRadius: 12, padding: 16, textAlign: "center",
                  color: t.green, fontFamily: t.fontDisplay, fontSize: 13, fontWeight: 700 }}>
                  ✓ Order Executed Successfully
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
