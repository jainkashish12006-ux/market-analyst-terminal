import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, TrendingUp, TrendingDown, AlertTriangle, BookOpen, ShieldCheck, BarChart2 } from "lucide-react";
import { useTheme } from "./ThemeContext";
import { AnimatedPrice, Sparkline, AnalystCompass } from "./MicroComponents";

const NEWS_TEMPLATES = {
  AAPL: [
    { event: "Apple Vision Pro sales surpassed Q2 forecast by 18%", impact: "Short-term revenue beat boosts EPS estimates", sentiment: "Bullish" },
    { event: "Supply chain disruption in Taiwan fab reduces iPhone 16 output", impact: "Q3 shipment guidance cut by 4–6M units", sentiment: "Cautious" },
    { event: "EU Digital Markets Act compliance deadline approaching", impact: "App Store fee reductions may reduce Services revenue", sentiment: "Neutral" },
  ],
  MSFT: [
    { event: "Azure AI workloads grew 36% YoY in enterprise segment", impact: "Cloud margins expanded 220bps ahead of consensus", sentiment: "Bullish" },
    { event: "Activision integration costs higher than expected", impact: "Operating leverage slightly compressed this quarter", sentiment: "Neutral" },
    { event: "Copilot enterprise penetration reaches 28% of O365 seats", impact: "ARPU lift from AI adds ~$8B annualized revenue run-rate", sentiment: "Bullish" },
  ],
};

const GENERIC_NEWS = (sym) => [
  { event: `${sym} reports quarterly earnings, beats EPS by $0.12`, impact: "Positive surprise drives institutional inflows", sentiment: "Bullish" },
  { event: `Macro headwinds from Fed rate pause affect ${sym} valuation`, impact: "Multiple compression risk in growth sectors", sentiment: "Cautious" },
  { event: `Options market shows elevated implied volatility for ${sym}`, impact: "Traders hedging ahead of macro data releases", sentiment: "Neutral" },
];

function getSentimentColor(s, theme) {
  if (s === "Bullish") return theme.accentSecondary;
  if (s === "Cautious") return theme.warn;
  return theme.textMuted;
}

// 5-second undo countdown
function TradeExecution({ side, price, theme, onComplete, onCancel }) {
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);
  const startRef = useRef(Date.now());
  const DURATION = 5000;

  useEffect(() => {
    const t = setInterval(() => {
      const elapsed = Date.now() - startRef.current;
      const p = Math.min(elapsed / DURATION, 1);
      setProgress(p);
      if (p >= 1) { clearInterval(t); setDone(true); onComplete(); }
    }, 50);
    return () => clearInterval(t);
  }, [onComplete]);

  const color = side === "buy" ? theme.accentSecondary : theme.warn;
  const seconds = Math.ceil((1 - progress) * 5);

  return (
    <div style={{
      background: `${color}12`, border: `1px solid ${color}40`,
      borderRadius: 12, padding: "16px 18px",
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
        <span style={{ fontFamily: theme.fontData, fontSize: 12, color, fontWeight: 700 }}>
          {done ? "✓ ORDER SENT" : `${side.toUpperCase()} ORDER — ${seconds}s to cancel`}
        </span>
        {!done && (
          <button onClick={onCancel} style={{
            background: `${theme.danger}18`, border: `1px solid ${theme.danger}50`,
            borderRadius: 7, padding: "4px 12px", cursor: "pointer",
            color: theme.danger, fontSize: 11, fontWeight: 700, fontFamily: theme.fontUI,
          }}>
            ✕ Cancel
          </button>
        )}
      </div>
      <div style={{ height: 4, background: theme.border, borderRadius: 2, overflow: "hidden" }}>
        <motion.div
          animate={{ width: `${progress * 100}%` }}
          transition={{ duration: 0.05 }}
          style={{ height: "100%", background: done ? theme.accentSecondary : color, borderRadius: 2 }}
        />
      </div>
      {!done && (
        <div style={{ fontSize: 11, color: theme.textMuted, fontFamily: theme.fontUI, marginTop: 8 }}>
          @ {price?.toFixed(2)} · Executing in {seconds}s
        </div>
      )}
    </div>
  );
}

// Slide-to-confirm (smart friction for large orders)
function SlideToConfirm({ side, theme, onConfirm }) {
  const [slid, setSlid] = useState(0);
  const [confirmed, setConfirmed] = useState(false);
  const trackRef = useRef(null);
  const dragging = useRef(false);

  const handleMouseDown = () => { dragging.current = true; };
  const handleMouseMove = (e) => {
    if (!dragging.current || !trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    const raw = (e.clientX - rect.left - 20) / (rect.width - 40);
    setSlid(Math.max(0, Math.min(raw, 1)));
  };
  const handleMouseUp = () => {
    if (slid > 0.88) { setConfirmed(true); onConfirm(); }
    else setSlid(0);
    dragging.current = false;
  };

  const color = side === "buy" ? theme.accentSecondary : theme.warn;

  return (
    <div style={{
      background: `${color}10`, border: `1px solid ${color}30`,
      borderRadius: 12, padding: "14px 16px",
    }}>
      <div style={{ fontSize: 11, color: theme.textMuted, fontFamily: theme.fontUI, marginBottom: 10, textAlign: "center" }}>
        ⚡ Large order detected — slide to confirm {side.toUpperCase()}
      </div>
      <div
        ref={trackRef}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{
          height: 40, background: theme.bgSurface, borderRadius: 20,
          position: "relative", overflow: "hidden", cursor: "pointer",
          border: `1px solid ${color}30`,
          userSelect: "none",
        }}>
        <div style={{
          position: "absolute", inset: 0, borderRadius: 20,
          background: `${color}20`, width: `${slid * 100}%`, transition: "none",
        }} />
        <div style={{ position: "absolute", top: 0, bottom: 0, left: `${slid * (100 - 20)}%`,
          width: 36, display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "grab" }}>
          <motion.div
            onMouseDown={handleMouseDown}
            whileHover={{ scale: 1.05 }}
            style={{
              width: 32, height: 32, borderRadius: 16, background: confirmed ? theme.accentSecondary : color,
              display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 2px 8px ${color}60`,
            }}>
            <span style={{ fontSize: 14 }}>{confirmed ? "✓" : "→"}</span>
          </motion.div>
        </div>
        <div style={{
          position: "absolute", inset: 0, display: "flex", alignItems: "center",
          justifyContent: "center", fontSize: 11, color: `${color}70`,
          fontFamily: theme.fontUI, fontWeight: 600, pointerEvents: "none",
        }}>
          {confirmed ? "Confirmed" : "Slide to confirm →"}
        </div>
      </div>
    </div>
  );
}

export function TradeStoryDrawer({ symbol, symbolData, open, onClose }) {
  const { theme } = useTheme();
  const [amountAtRisk, setAmountAtRisk] = useState("100");
  const [tradeSide, setTradeSide] = useState("buy");
  const [executing, setExecuting] = useState(false);
  const [executed, setExecuted] = useState(false);
  const [isLargeOrder, setIsLargeOrder] = useState(false);

  const news = NEWS_TEMPLATES[symbol] || GENERIC_NEWS(symbol);
  const data = symbolData || {};
  const price = data.price || 0;
  const stopLossPrice = price - (parseFloat(amountAtRisk) || 0);
  const stopLossPct = price > 0 ? ((parseFloat(amountAtRisk) || 0) / price * 100).toFixed(2) : 0;
  const analystBuy = 40 + Math.floor(Math.random() * 25);
  const analystSell = 10 + Math.floor(Math.random() * 15);
  const analystHold = 100 - analystBuy - analystSell;
  const isUp = (data.change || 0) >= 0;
  const isCalm = theme.name === "calm";

  const handleTrade = () => {
    if (parseFloat(amountAtRisk) > 5000) setIsLargeOrder(true);
    else { setExecuting(true); setExecuted(false); }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }}
            onClick={onClose}
            style={{ position: "fixed", inset: 0, zIndex: 400, background: "#000" }}
          />
          <motion.div
            initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
            transition={{ type: "spring", mass: 1, tension: 170, damping: 26 }}
            style={{
              position: "fixed", top: 0, right: 0, bottom: 0, zIndex: 401,
              width: 400, background: theme.bgCard,
              boxShadow: `-8px 0 48px rgba(0,0,0,0.35)`,
              overflowY: "auto", display: "flex", flexDirection: "column",
            }}>

            {/* Header */}
            <div style={{
              padding: "18px 20px", borderBottom: `1px solid ${theme.border}`,
              display: "flex", alignItems: "center", justifyContent: "space-between",
              background: theme.bgGlass, backdropFilter: "blur(8px)",
              position: "sticky", top: 0, zIndex: 1,
            }}>
              <div>
                <div style={{ fontFamily: theme.fontData, fontSize: 20, fontWeight: 700, color: theme.accent }}>{symbol}</div>
                <div style={{ fontSize: 11, color: theme.textMuted, fontFamily: theme.fontUI }}>{data.sector} · One-Click Deep Dive</div>
              </div>
              <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: theme.textMuted }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ flex: 1, padding: "18px 20px", display: "flex", flexDirection: "column", gap: 20 }}>
              {/* Price + Sparkline */}
              <div style={{
                background: theme.bgSurface, borderRadius: 12,
                padding: "14px 16px", border: `1px solid ${theme.border}`,
                boxShadow: theme.shadowCard,
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <AnimatedPrice value={price} decimals={2} size={26} bold />
                  <span style={{ fontFamily: theme.fontData, fontSize: 12,
                    color: isUp ? theme.accentSecondary : theme.warn,
                    display: "flex", alignItems: "center", gap: 4 }}>
                    {isUp ? <TrendingUp size={12}/> : <TrendingDown size={12}/>}
                    {((data.change || 0) * 100).toFixed(3)}%
                  </span>
                </div>
                <Sparkline
                  data={data.history60 || data.history || [price]}
                  color={isUp ? theme.accentSecondary : theme.warn}
                  width={340} height={56}
                  area smooth={isCalm}
                />
              </div>

              {/* The "Why" — AI News Digest */}
              <div style={{ background: theme.bgSurface, borderRadius: 12, padding: "14px 16px",
                border: `1px solid ${theme.border}`, boxShadow: theme.shadowCard }}>
                <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 12 }}>
                  <BookOpen size={13} color={theme.accent} />
                  <span style={{ fontFamily: theme.fontUI, fontSize: 11, fontWeight: 700, color: theme.textMuted,
                    textTransform: "uppercase", letterSpacing: "0.08em" }}>
                    24H AI Digest
                  </span>
                </div>
                {news.map((item, i) => (
                  <div key={i} style={{
                    marginBottom: 12, paddingLeft: 12,
                    borderLeft: `2px solid ${getSentimentColor(item.sentiment, theme)}`,
                  }}>
                    <div style={{ fontSize: isCalm ? 13 : 12, color: theme.text,
                      fontFamily: isCalm ? theme.fontNews : theme.fontUI, lineHeight: 1.5, marginBottom: 3 }}>
                      {item.event}
                    </div>
                    <div style={{ fontSize: 11, color: theme.textMuted, fontFamily: theme.fontUI, marginBottom: 2 }}>
                      Impact: {item.impact}
                    </div>
                    <span style={{ fontSize: 10, fontWeight: 700, color: getSentimentColor(item.sentiment, theme),
                      fontFamily: theme.fontData, textTransform: "uppercase" }}>
                      {item.sentiment}
                    </span>
                  </div>
                ))}
              </div>

              {/* The Sentiment — Analyst Compass */}
              <div style={{ background: theme.bgSurface, borderRadius: 12, padding: "14px 16px",
                border: `1px solid ${theme.border}`, boxShadow: theme.shadowCard }}>
                <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 8 }}>
                  <BarChart2 size={13} color={theme.accent} />
                  <span style={{ fontFamily: theme.fontUI, fontSize: 11, fontWeight: 700, color: theme.textMuted,
                    textTransform: "uppercase", letterSpacing: "0.08em" }}>
                    Analyst Compass
                  </span>
                </div>
                <AnalystCompass buy={analystBuy} hold={analystHold} sell={analystSell} />
              </div>

              {/* The Risk — Stop Loss Input */}
              <div style={{ background: theme.bgSurface, borderRadius: 12, padding: "14px 16px",
                border: `1px solid ${theme.border}`, boxShadow: theme.shadowCard }}>
                <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 12 }}>
                  <ShieldCheck size={13} color={theme.accent} />
                  <span style={{ fontFamily: theme.fontUI, fontSize: 11, fontWeight: 700, color: theme.textMuted,
                    textTransform: "uppercase", letterSpacing: "0.08em" }}>
                    Risk-First Input
                  </span>
                </div>
                <div style={{ fontSize: 11, color: theme.textMuted, fontFamily: theme.fontUI, marginBottom: 8 }}>
                  Amount at Risk ($) — Auto-calculates Stop-Loss
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                  <input
                    type="number"
                    value={amountAtRisk}
                    onChange={e => setAmountAtRisk(e.target.value)}
                    style={{
                      flex: 1, background: theme.inputBg, border: `1px solid ${theme.border}`,
                      borderRadius: 8, padding: "8px 12px", color: theme.text,
                      fontFamily: theme.fontData, fontSize: 14, outline: "none",
                    }}
                    placeholder="100"
                  />
                  <span style={{ fontSize: 11, color: theme.textMuted, fontFamily: theme.fontUI }}>USD</span>
                </div>
                {price > 0 && parseFloat(amountAtRisk) > 0 && (
                  <div style={{
                    background: `${theme.danger}12`, border: `1px solid ${theme.danger}30`,
                    borderRadius: 8, padding: "8px 12px", fontSize: 11, fontFamily: theme.fontData,
                  }}>
                    <span style={{ color: theme.danger }}>⛔ Stop-Loss: </span>
                    <span style={{ color: theme.text }}>${stopLossPrice.toFixed(2)} </span>
                    <span style={{ color: theme.textMuted }}>({stopLossPct}% below entry)</span>
                  </div>
                )}
              </div>

              {/* Trade Buttons */}
              {!executing && !isLargeOrder && (
                <div style={{ display: "flex", gap: 10 }}>
                  {["buy", "sell"].map(side => (
                    <button key={side} onClick={() => { setTradeSide(side); handleTrade(); }}
                      style={{
                        flex: 1, padding: "12px", borderRadius: 10, cursor: "pointer",
                        fontFamily: theme.fontUI, fontWeight: 700, fontSize: 13,
                        border: "none", transition: "all 0.2s",
                        background: side === "buy" ? `${theme.accentSecondary}22` : `${theme.warn}22`,
                        color: side === "buy" ? theme.accentSecondary : theme.warn,
                        borderLeft: `3px solid ${side === "buy" ? theme.accentSecondary : theme.warn}`,
                      }}>
                      {side === "buy" ? "▲ BUY" : "▼ SELL"}
                    </button>
                  ))}
                </div>
              )}

              {isLargeOrder && !executed && (
                <SlideToConfirm
                  side={tradeSide}
                  theme={theme}
                  onConfirm={() => { setIsLargeOrder(false); setExecuting(true); }}
                />
              )}

              {executing && !executed && (
                <TradeExecution
                  side={tradeSide}
                  price={price}
                  theme={theme}
                  onComplete={() => setExecuted(true)}
                  onCancel={() => { setExecuting(false); setExecuted(false); }}
                />
              )}

              {executed && (
                <div style={{
                  background: `${theme.accentSecondary}15`, border: `1px solid ${theme.accentSecondary}40`,
                  borderRadius: 12, padding: 16, textAlign: "center",
                  fontFamily: theme.fontUI, color: theme.accentSecondary, fontSize: 13, fontWeight: 700,
                }}>
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
