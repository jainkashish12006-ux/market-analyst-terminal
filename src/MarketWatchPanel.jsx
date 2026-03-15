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

function computeRipples(symbolMap) {
  const rippled = new Set();
  Object.entries(symbolMap).forEach(([sym, data]) => {
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
      borderRadius: 12, padding: "13px 14px", cursor: "pointer",
      background: theme.bgCard, transition: "transform 0.2s, box-shadow 0.2s",
      position: "relative", overflow: "hidden",
    }}>
      <motion.div
        whileHover={{ y: -1 }}
        onClick={() => onSelect(symbol)}
        style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {data.pulsing && (
          <div style={{
            position: "absolute", top: 7, right: 7, width: 6, height: 6,
            borderRadius: "50%", background: theme.warn,
            animation: "dot-pulse 1.4s ease-in-out infinite",
            boxShadow: `0 0 8px ${theme.warn}`,
          }} />
        )}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontFamily: theme.fontData, fontSize: 11, fontWeight: 700,
            color: theme.textMuted, letterSpacing: "0.07em" }}>{symbol}</span>
          <span style={{ fontSize: 9, color: theme.textDim, fontFamily: theme.fontUI }}>{data.sector}</span>
        </div>
        <AnimatedPrice value={data.price} decimals={2} size={15} bold />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontFamily: theme.fontData, fontSize: 11, color,
            display: "flex", alignItems: "center", gap: 3 }}>
            {isUp ? <TrendingUp size={9}/> : <TrendingDown size={9}/>}
            {(data.change * 100).toFixed(2)}%
          </span>
          <Sparkline
            data={data.history}
            color={color}
            width={56} height={18}
            area smooth={isCalm}
          />
        </div>
        <div style={{ fontSize: 9, color: theme.textDim, fontFamily: theme.fontData }}>
          {(data.volume / 1000).toFixed(0)}K vol
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
      transition={{ duration: 0.15, delay: index < 6 ? index * 0.025 : 0 }}
      onClick={() => onSelect(signal.symbol)}
      style={{
        display: "grid", gridTemplateColumns: "72px 1fr 100px 80px 80px",
        padding: "7px 14px", borderBottom: `1px solid ${theme.border}`,
        alignItems: "center", gap: 8, cursor: "pointer", transition: "background 0.15s",
      }}
      whileHover={{ background: theme.bgGlass }}
    >
      <span style={{ fontFamily: theme.fontData, fontSize: 11, color: theme.textMuted,
        letterSpacing: "0.06em", fontWeight: 700 }}>{signal.symbol}</span>
      <span style={{ fontSize: 11, color: theme.textDim, fontFamily: theme.fontUI,
        whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{signal.sector}</span>
      <AnimatedPrice value={signal.price} decimals={2} />
      <span style={{ fontFamily: theme.fontData, fontSize: 11,
        color: isUp ? theme.accentSecondary : theme.warn,
        display: "flex", alignItems: "center", gap: 2 }}>
        {isUp ? <TrendingUp size={9}/> : <TrendingDown size={9}/>}
        {(signal.change * 100).toFixed(3)}%
      </span>
      <span style={{ fontFamily: theme.fontData, fontSize: 10, color: theme.textDim }}>
        {(signal.volume / 1000).toFixed(0)}K
      </span>
    </motion.div>
  );
}

export function MarketWatchPanel({ signals, symbolMap, batchMode, onSymbolSelect, focusMode }) {
  const { theme } = useTheme();
  const rippled = useMemo(() => computeRipples(symbolMap), [symbolMap]);

  const sortedSymbols = Object.entries(symbolMap)
    .sort((a, b) => Math.abs(b[1].change) - Math.abs(a[1].change));

  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: focusMode ? "1fr" : "1fr 320px",
      gap: 14, height: "100%",
    }}>
      {/* Main watchlist grid */}
      <div style={{ display: "flex", flexDirection: "column", gap: 14, minWidth: 0 }}>
        {/* Symbol grid */}
        {!focusMode && (
          <div style={{
            background: theme.glass, backdropFilter: theme.glassBlur,
            borderRadius: 14, overflow: "hidden",
            border: `1px solid ${theme.border}`,
            boxShadow: theme.shadow,
          }}>
            <div style={{
              padding: "11px 14px", borderBottom: `1px solid ${theme.border}`,
              display: "flex", alignItems: "center", justifyContent: "space-between",
              background: theme.bgGlass,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                <Zap size={13} color={theme.accent} />
                <span style={{ fontFamily: theme.fontUI, fontSize: 11, fontWeight: 700,
                  color: theme.textMuted, textTransform: "uppercase", letterSpacing: "0.07em" }}>
                  Live Watchlist
                </span>
              </div>
              <span style={{ fontFamily: theme.fontData, fontSize: 10, color: theme.textDim }}>
                Click any ticker to deep dive
              </span>
            </div>
            <div style={{
              padding: 12,
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
              gap: 9,
            }}>
              {sortedSymbols.map(([sym, data]) => (
                <WatchlistCard
                  key={sym}
                  symbol={sym}
                  data={data}
                  onSelect={onSymbolSelect}
                  ripple={rippled.has(sym)}
                  batchMode={batchMode}
                />
              ))}
            </div>
          </div>
        )}

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
          <div style={{ display: "grid", gridTemplateColumns: "72px 1fr 100px 80px 80px",
            padding: "5px 14px", borderBottom: `1px solid ${theme.border}`, gap: 8 }}>
            {["SYMBOL","SECTOR","PRICE","CHANGE","VOL"].map(h => (
              <span key={h} style={{ fontSize: 9, color: theme.textDim, fontFamily: theme.fontData,
                textTransform: "uppercase", letterSpacing: "0.1em" }}>{h}</span>
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
            <div style={{ padding: 12, display: "flex", flexDirection: "column", gap: 7 }}>
              {["Tech","Finance","Energy","Crypto","FX","Consumer"].map(sector => {
                const items = Object.values(symbolMap).filter(d => d.sector === sector);
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
                        animate={{ width: `${50 + avg * 2000}%` }}
                        transition={{ duration: 0.4 }}
                        style={{
                          height: "100%", background: `${color}${Math.floor(intensity * 80 + 20).toString(16).padStart(2,"0")}`,
                          borderRadius: 4, minWidth: "2%", maxWidth: "98%",
                        }}
                      />
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
