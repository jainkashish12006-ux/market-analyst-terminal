import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, CheckCircle, Activity, RefreshCw, Wifi, WifiOff, Shield } from "lucide-react";
import { useTheme } from "./ThemeContext";
import { AnimatedPrice, Sparkline, EKGPulse } from "./MicroComponents";

// ─── ANOMALY TRACKER ─────────────────────────────────────────────────────────
function AnomalyRow({ anomaly, onSelect }) {
  const { theme } = useTheme();
  const severity = anomaly.stdDev > 3.5 ? "critical" : anomaly.stdDev > 2.5 ? "high" : "medium";
  const color = severity === "critical" ? theme.danger : severity === "high" ? theme.warn : "#ffd666";
  const isUp = anomaly.change >= 0;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
      onClick={() => onSelect(anomaly.symbol)}
      style={{
        display: "grid", gridTemplateColumns: "72px 1fr 90px 70px 70px",
        padding: "8px 14px", gap: 8,
        borderBottom: `1px solid ${theme.border}`,
        borderLeft: `3px solid ${color}`,
        alignItems: "center", cursor: "pointer",
        transition: "background 0.15s",
      }}
      whileHover={{ background: theme.bgGlass }}>
      <span style={{ fontFamily: theme.fontData, fontSize: 11, fontWeight: 700, color: theme.text }}>{anomaly.symbol}</span>
      <span style={{ fontSize: 11, color: theme.textMuted, fontFamily: theme.fontUI, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{anomaly.sector}</span>
      <AnimatedPrice value={anomaly.price} decimals={2} />
      <span style={{ fontFamily: theme.fontData, fontSize: 11, color }}>
        {anomaly.stdDev.toFixed(1)}σ
      </span>
      <span style={{ fontSize: 9, color, background: `${color}18`, padding: "2px 6px",
        borderRadius: 4, fontWeight: 800, textTransform: "uppercase", fontFamily: theme.fontUI }}>
        {severity}
      </span>
    </motion.div>
  );
}

export function AnomalyTrackerPanel({ anomalies, onSymbolSelect, focusMode }) {
  const { theme } = useTheme();
  const critical = anomalies.filter(a => a.stdDev > 3.5).length;
  const high = anomalies.filter(a => a.stdDev > 2.5 && a.stdDev <= 3.5).length;
  const medium = anomalies.filter(a => a.stdDev >= 2 && a.stdDev <= 2.5).length;

  const sectorMap = anomalies.reduce((acc, a) => {
    acc[a.sector] = (acc[a.sector] || 0) + 1;
    return acc;
  }, {});

  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: focusMode ? "1fr" : "1fr 260px",
      gap: 14, height: "100%",
    }}>
      {/* Main anomaly feed */}
      <div style={{
        background: theme.glass, backdropFilter: theme.glassBlur,
        borderRadius: 14, overflow: "hidden",
        border: `1px solid ${theme.border}`,
        boxShadow: theme.shadow,
      }}>
        <div style={{
          padding: "11px 14px", borderBottom: `1px solid ${theme.border}`,
          display: "flex", alignItems: "center", justifyContent: "space-between",
          background: `${theme.warn}08`,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
            <AlertTriangle size={13} color={theme.warn} />
            <span style={{ fontFamily: theme.fontUI, fontSize: 11, fontWeight: 700,
              color: theme.textMuted, textTransform: "uppercase", letterSpacing: "0.07em" }}>
              Anomaly Tracker
            </span>
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            {[["2σ","medium","#ffd666"],["2.5σ","high",theme.warn],["3.5σ","critical",theme.danger]].map(([label,,c]) => (
              <span key={label} style={{ fontSize: 9, color: c, background: `${c}18`,
                padding: "2px 7px", borderRadius: 8, fontFamily: theme.fontData }}>
                {label}+
              </span>
            ))}
          </div>
        </div>

        {/* Column headers */}
        <div style={{ display: "grid", gridTemplateColumns: "72px 1fr 90px 70px 70px",
          padding: "5px 14px 5px 17px", borderBottom: `1px solid ${theme.border}`, gap: 8 }}>
          {["SYMBOL","SECTOR","PRICE","SIGMA","LEVEL"].map(h => (
            <span key={h} style={{ fontSize: 9, color: theme.textDim, fontFamily: theme.fontData,
              textTransform: "uppercase", letterSpacing: "0.1em" }}>{h}</span>
          ))}
        </div>

        <div style={{ overflowY: "auto", maxHeight: "calc(100vh - 300px)" }}>
          <AnimatePresence initial={false}>
            {anomalies.map(a => (
              <AnomalyRow key={a.id} anomaly={a} onSelect={onSymbolSelect} />
            ))}
          </AnimatePresence>
          {anomalies.length === 0 && (
            <div style={{ padding: 40, textAlign: "center" }}>
              <CheckCircle size={22} color={theme.accentSecondary} style={{ margin: "0 auto 10px" }} />
              <div style={{ fontSize: 13, color: theme.textMuted, fontFamily: theme.fontUI }}>All clear</div>
              <div style={{ fontSize: 11, color: theme.textDim, fontFamily: theme.fontUI, marginTop: 4 }}>No anomalies detected</div>
            </div>
          )}
        </div>
      </div>

      {/* Side stats */}
      {!focusMode && (
        <motion.div
          initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
          style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {/* Severity breakdown */}
          <div style={{ background: theme.glass, backdropFilter: theme.glassBlur, borderRadius: 14, padding: 16,
            border: `1px solid ${theme.border}`, boxShadow: theme.shadow }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: theme.textMuted,
              fontFamily: theme.fontUI, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 14 }}>
              Severity
            </div>
            {[
              { label: "Critical >3.5σ", color: theme.danger, count: critical },
              { label: "High >2.5σ", color: theme.warn, count: high },
              { label: "Medium >2σ", color: "#ffd666", count: medium },
            ].map(({ label, color, count }) => (
              <div key={label} style={{ marginBottom: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                  <span style={{ fontSize: 11, color: theme.textMuted, fontFamily: theme.fontUI }}>{label}</span>
                  <span style={{ fontFamily: theme.fontData, fontSize: 11, color }}>{count}</span>
                </div>
                <div style={{ height: 3, background: theme.bgSurface, borderRadius: 2 }}>
                  <motion.div
                    animate={{ width: `${anomalies.length ? (count / anomalies.length) * 100 : 0}%` }}
                    transition={{ duration: 0.4 }}
                    style={{ height: "100%", background: color, borderRadius: 2 }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Affected sectors */}
          <div style={{ background: theme.glass, backdropFilter: theme.glassBlur, borderRadius: 14, padding: 16,
            border: `1px solid ${theme.border}`, boxShadow: theme.shadow }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: theme.textMuted,
              fontFamily: theme.fontUI, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 12 }}>
              Affected Sectors
            </div>
            {Object.entries(sectorMap).sort((a,b)=>b[1]-a[1]).slice(0,6).map(([s,c]) => (
              <div key={s} style={{ display: "flex", justifyContent: "space-between",
                padding: "6px 0", borderBottom: `1px solid ${theme.border}` }}>
                <span style={{ fontSize: 11, color: theme.textMuted, fontFamily: theme.fontUI }}>{s}</span>
                <span style={{ fontFamily: theme.fontData, fontSize: 11, color: theme.warn }}>{c}</span>
              </div>
            ))}
            {Object.keys(sectorMap).length === 0 && (
              <div style={{ fontSize: 11, color: theme.textDim, textAlign: "center", padding: "8px 0", fontFamily: theme.fontUI }}>
                None
              </div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}

// ─── SYSTEM HEALTH ───────────────────────────────────────────────────────────
export function SystemHealthPanel({ health, connected, symbolMap }) {
  const { theme } = useTheme();

  const metrics = [
    { label: "Latency", value: `${health.latency?.toFixed(1)}ms`, ok: health.latency < 25 },
    { label: "Throughput", value: `${health.throughput?.toFixed(0)}/s`, ok: true },
    { label: "Lag", value: `${health.lag?.toFixed(0)}ms`, ok: (health.lag || 0) < 200 },
    { label: "Dropped", value: health.dropped || 0, ok: (health.dropped || 0) < 100 },
    { label: "Uptime", value: `${health.uptime}s`, ok: true },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {/* Connection status */}
      <div style={{
        background: theme.glass, backdropFilter: theme.glassBlur, borderRadius: 14, padding: 16,
        border: `1px solid ${theme.border}`, boxShadow: theme.shadow,
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {connected ? <Wifi size={16} color={theme.accentSecondary} /> : <WifiOff size={16} color={theme.danger} />}
          <div>
            <div style={{ fontFamily: theme.fontData, fontSize: 13, fontWeight: 700,
              color: connected ? theme.accentSecondary : theme.danger }}>
              {connected ? "STREAM CONNECTED" : "DISCONNECTED"}
            </div>
            <div style={{ fontSize: 11, color: theme.textMuted, fontFamily: theme.fontUI }}>
              WebSocket · Buffer flush 100ms · {health.batchMode ? "BATCH MODE ACTIVE" : "Normal Mode"}
            </div>
          </div>
        </div>
        <div style={{ width: 8, height: 8, borderRadius: "50%",
          background: connected ? theme.accentSecondary : theme.danger,
          boxShadow: connected ? `0 0 8px ${theme.accentSecondary}` : "none",
          animation: connected ? "dot-pulse 2s infinite" : "none",
        }} />
      </div>

      {/* Metric grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 10 }}>
        {metrics.map(m => (
          <div key={m.label} style={{
            background: theme.glass, backdropFilter: theme.glassBlur, borderRadius: 12, padding: "14px 12px",
            textAlign: "center", border: `1px solid ${theme.border}`,
            boxShadow: theme.shadow,
          }}>
            <div style={{ fontFamily: theme.fontData, fontSize: 20, fontWeight: 700,
              color: m.ok ? theme.accent : theme.warn, marginBottom: 4 }}>
              {m.value}
            </div>
            <div style={{ fontSize: 10, color: theme.textDim, fontFamily: theme.fontUI,
              textTransform: "uppercase", letterSpacing: "0.08em" }}>
              {m.label}
            </div>
          </div>
        ))}
      </div>

      {/* EKG + Pulse indicator */}
      <div style={{
        background: theme.glass, backdropFilter: theme.glassBlur, borderRadius: 14, padding: 16,
        border: `1px solid ${theme.border}`, boxShadow: theme.shadow,
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
            <Activity size={13} color={theme.accent} />
            <span style={{ fontFamily: theme.fontUI, fontSize: 11, fontWeight: 700,
              color: theme.textMuted, textTransform: "uppercase", letterSpacing: "0.07em" }}>
              System EKG
            </span>
          </div>
          <span style={{ fontFamily: theme.fontData, fontSize: 10, display: "flex", alignItems: "center", gap: 4,
            color: (health.lag || 0) > 200 ? theme.warn : theme.accentSecondary }}>
            {(health.lag || 0) > 200 ? <><AlertTriangle size={10} /> High Lag</> : "● Nominal"}
          </span>
        </div>
        <EKGPulse lag={health.lag || 0} connected={connected} />
      </div>

      {/* Symbol health grid */}
      <div style={{
        background: theme.glass, backdropFilter: theme.glassBlur, borderRadius: 14,
        border: `1px solid ${theme.border}`, boxShadow: theme.shadow, overflow: "hidden",
      }}>
        <div style={{ padding: "11px 14px", borderBottom: `1px solid ${theme.border}`, background: theme.bgGlass }}>
          <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
            <Shield size={13} color={theme.accent} />
            <span style={{ fontFamily: theme.fontUI, fontSize: 11, fontWeight: 700,
              color: theme.textMuted, textTransform: "uppercase", letterSpacing: "0.07em" }}>
              All Symbols
            </span>
          </div>
        </div>
        <div style={{ padding: 12, display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(150px,1fr))", gap: 8 }}>
          {Object.entries(symbolMap).map(([sym, data]) => {
            const isUp = data.change >= 0;
            const color = isUp ? theme.accentSecondary : theme.warn;
            return (
              <div key={sym} style={{
                background: theme.bgSurface, borderRadius: 9, padding: "10px 12px",
                border: `1px solid ${data.pulsing ? theme.warn + "60" : theme.border}`,
                animation: data.pulsing ? "borderPulse 1.5s infinite" : "none",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ fontFamily: theme.fontData, fontSize: 10, fontWeight: 700, color: theme.textMuted }}>{sym}</span>
                  <span style={{ fontFamily: theme.fontData, fontSize: 10, color }}>{(data.change * 100).toFixed(2)}%</span>
                </div>
                <Sparkline data={data.history} color={color} width={110} height={18} area />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function SecondaryPanels() {
  return <div>Secondary Panels</div>;
}
