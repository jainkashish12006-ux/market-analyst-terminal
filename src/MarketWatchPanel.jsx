import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp, TrendingDown, Zap, Radio } from "lucide-react";
import { useTheme } from "./ThemeContext";
import { AnimatedPrice, Sparkline, RippleCard } from "./MicroComponents";

const CROSS_ASSET_RIPPLE = {
  XOM:   ["AMZN","TSLA"],
  WTI:   ["AMZN","TSLA","EURUSD"],
  BTC:   ["ETH","META","NVDA"],
  ETH:   ["BTC","META"],
  EURUSD:["XOM","WTI","GOLD"],
  GOLD:  ["XOM","JPM"],
};

function computeRipples(symMap) {
  const rippled = new Set();
  Object.entries(symMap).forEach(([sym, data]) => {
    if (data.stdDev > 2 && CROSS_ASSET_RIPPLE[sym]) {
      CROSS_ASSET_RIPPLE[sym].forEach(r => rippled.add(r));
    }
  });
  return rippled;
}

function WatchlistCard({ symbol, data, onSelect, ripple, batchMode }) {
  const { theme } = useTheme();
  const isUp = data.change >= 0;
  const isCalm = theme.name === "calm";
  const color = isUp ? theme.accentSecondary : theme.warn;

  return (
    <RippleCard ripple={ripple} theme={theme} style={{
      borderRadius: 12, padding: "14px", cursor: "pointer",
      background: theme.bgCard, border: `1px solid ${theme.border}`,
      boxShadow: `0 4px 12px rgba(0,0,0,0.1)`,
      transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
      position: "relative", overflow: "hidden",
    }}>
      <motion.div
        whileHover={{ y: -4, scale: 1.02, boxShadow: `0 12px 24px rgba(0,0,0,0.2)` }}
        onClick={() => onSelect(symbol)}
        style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {data.pulsing && (
          <motion.div 
            animate={{ scale: [1, 1.4, 1], opacity: [0.8, 1, 0.8] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            style={{
              position: "absolute", top: 10, right: 10, width: 8, height: 8,
              borderRadius: "50%", background: theme.warn,
              boxShadow: `0 0 10px ${theme.warn}`,
            }} />
        )}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontFamily: theme.fontData, fontSize: 12, fontWeight: 800,
            color: theme.text, letterSpacing: "0.08em" }}>{symbol}</span>
          <span style={{ fontSize: 9, color: theme.textDim, fontFamily: theme.fontUI, textTransform: "uppercase" }}>{data.sector}</span>
        </div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
          <AnimatedPrice value={data.price} decimals={2} size={18} bold />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 4 }}>
          <span style={{ fontFamily: theme.fontData, fontSize: 11, color, fontWeight: 700,
            display: "flex", alignItems: "center", gap: 3, background: `${color}15`, padding: "2px 6px", borderRadius: 4 }}>
            {isUp ? <TrendingUp size={10}/> : <TrendingDown size={10}/>}
            {(data.change * 100).toFixed(2)}%
          </span>
          <Sparkline
            data={data.history}
            color={color}
            width={60} height={22}
            area smooth={isCalm}
          />
        </div>
      </motion.div>
    </RippleCard>
  );
}

function SignalRow({ signal, onSelect, index }) {
  const { theme } = useTheme();
  const isUp = signal.change >= 0;
  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2, delay: index < 6 ? index * 0.03 : 0 }}
      onClick={() => onSelect(signal.symbol)}
      style={{
        display: "grid", gridTemplateColumns: "80px 1.5fr 1fr 1fr 1fr",
        padding: "12px 16px", borderBottom: `1px solid ${theme.border}`,
        alignItems: "center", gap: 12, cursor: "pointer", transition: "all 0.15s",
      }}
      whileHover={{ background: `${theme.accent}08`, x: 4 }}
    >
      <span style={{ fontFamily: theme.fontData, fontSize: 12, color: theme.text,
        letterSpacing: "0.06em", fontWeight: 800 }}>{signal.symbol}</span>
      <span style={{ fontSize: 11, color: theme.textDim, fontFamily: theme.fontUI,
        whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{signal.sector}</span>
      <div style={{ padding: "4px 8px", background: theme.bgSurface, borderRadius: 6, width: "fit-content" }}>
        <AnimatedPrice value={signal.price} decimals={2} size={12} bold />
      </div>
      <span style={{ fontFamily: theme.fontData, fontSize: 11,
        color: isUp ? theme.accentSecondary : theme.warn,
        fontWeight: 700,
        display: "flex", alignItems: "center", gap: 4 }}>
        {isUp ? <TrendingUp size={11}/> : <TrendingDown size={11}/>}
        {(signal.change * 100).toFixed(3)}%
      </span>
      <span style={{ fontFamily: theme.fontData, fontSize: 11, color: theme.textDim, fontWeight: 600 }}>
        {Math.floor(signal.volume / 1000)}K
      </span>
    </motion.div>
  );
}

export function MarketWatchPanel({ signals, symMap, batchMode, onSymbolSelect, focusMode }) {
  const { theme } = useTheme();
  const rippled = useMemo(() => computeRipples(symMap), [symMap]);

  const sortedSymbols = Object.entries(symMap)
    .sort((a, b) => Math.abs(b[1].change) - Math.abs(a[1].change));

  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: focusMode ? "1fr" : "minmax(0, 1fr) 340px",
      gap: 16, height: "100%",
    }}>
      {/* Main watchlist grid */}
      <div style={{ display: "flex", flexDirection: "column", gap: 14, minWidth: 0 }}>
  
        {/* Signal feed */}
        <div style={{
          background: theme.glass, backdropFilter: theme.glassBlur,
          borderRadius: 14, overflow: "hidden",
          border: `1px solid ${theme.border}`,
          boxShadow: theme.shadow,
          flex: 1,
        }}>
          <div style={{
            padding: "11px 14px", borderBottom: `1px solid ${theme.border}`,
            display: "flex", alignItems: "center", justifyContent: "space-between",
            background: theme.bgGlass,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
              <Radio size={13} color={theme.accent} />
              <span style={{ fontFamily: theme.fontUI, fontSize: 11, fontWeight: 700,
                color: theme.textMuted, textTransform: "uppercase", letterSpacing: "0.07em" }}>
                Live Signal Feed
              </span>
            </div>
            <span style={{ fontFamily: theme.fontData, fontSize: 10, color: theme.textDim }}>
              {signals.length} signals
            </span>
          </div>
          {/* Column headers */}
          <div style={{ display: "grid", gridTemplateColumns: "80px 1.5fr 1fr 1fr 1fr",
            padding: "8px 16px", borderBottom: `1px solid ${theme.border}`, gap: 12 }}>
            {["SYMBOL","SECTOR","PRICE","CHANGE","VOL"].map(h => (
              <span key={h} style={{ fontSize: 9, color: theme.textDim, fontFamily: theme.fontData,
                textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700 }}>{h}</span>
            ))}
          </div>
          <div style={{ overflowY: "auto", maxHeight: focusMode ? "60vh" : 320 }}>
            <AnimatePresence initial={false}>
              {signals.slice(0, 60).map((s, i) => (
                <SignalRow key={s.id} signal={s} onSelect={onSymbolSelect} index={i} />
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Side panel */}
      {!focusMode && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {/* Sector heatmap */}
          <div style={{
            background: theme.glass, backdropFilter: theme.glassBlur, borderRadius: 14,
            border: `1px solid ${theme.border}`, boxShadow: theme.shadow,
            overflow: "hidden",
          }}>
            <div style={{ padding: "11px 14px", borderBottom: `1px solid ${theme.border}`, background: theme.bgGlass }}>
              <span style={{ fontFamily: theme.fontUI, fontSize: 11, fontWeight: 700,
                color: theme.textMuted, textTransform: "uppercase", letterSpacing: "0.07em" }}>
                Sector Heatmap
              </span>
            </div>
            <div style={{ padding: 12, display: "flex", flexDirection: "column", gap: 9 }}>
              {["Tech","Finance","Energy","Crypto","FX","Consumer","Auto","Commodities"].map(sector => {
                const items = Object.values(symMap).filter(d => d.sector === sector);
                const avg = items.length
                  ? items.reduce((a, d) => a + d.change, 0) / items.length
                  : 0;
                const intensity = Math.min(Math.abs(avg) * 20, 1);
                const color = avg >= 0 ? theme.accentSecondary : theme.warn;
                return (
                  <div key={sector} style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <span style={{ width: 72, fontSize: 10, color: theme.textMuted, fontFamily: theme.fontUI,
                      flexShrink: 0 }}>{sector}</span>
                    <div style={{ flex: 1, height: 20, background: theme.bgSurface, borderRadius: 4, overflow: "hidden", position: "relative" }}>
                      <motion.div
                        animate={{ width: `${Math.max(5, Math.min(95, 50 + avg * 1000))}%` }}
                        transition={{ duration: 0.6, type: "spring", stiffness: 100 }}
                        style={{
                          height: "100%", background: `${color}40`,
                          borderRight: `2px solid ${color}`,
                          borderRadius: 4,
                        }}
                      />
                      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 8, color: theme.textSub, opacity: 0.5, pointerEvents: "none", fontWeight: 700 }}>
                        {avg >= 0.001 ? "BULLISH" : avg <= -0.001 ? "BEARISH" : "NEUTRAL"}
                      </div>
                    </div>
                    <span style={{ fontFamily: theme.fontData, fontSize: 10, color, width: 52, textAlign: "right" }}>
                      {(avg * 100).toFixed(2)}%
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Cross-asset ripple legend */}
          {rippled.size > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              style={{
                background: `${theme.warn}10`, borderRadius: 12,
                border: `1px solid ${theme.warn}35`, padding: 14,
                boxShadow: theme.shadowCard,
              }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: theme.warn,
                fontFamily: theme.fontUI, marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
                <Zap size={12} /> Cross-Asset Ripple Active
              </div>
              <div style={{ fontSize: 11, color: theme.textMuted, fontFamily: theme.fontUI, lineHeight: 1.5 }}>
                Amber glow on cards = correlated impact detected from a sector signal.
              </div>
              <div style={{ marginTop: 8, display: "flex", flexWrap: "wrap", gap: 5 }}>
                {[...rippled].map(sym => (
                  <span key={sym} style={{ fontFamily: theme.fontData, fontSize: 10,
                    color: theme.warn, background: `${theme.warn}15`,
                    padding: "2px 7px", borderRadius: 6 }}>{sym}</span>
                ))}
              </div>
            </motion.div>
          )}
        </motion.div>
      )}
    </div>
  );
}
