import { motion } from "framer-motion";
import { useTheme } from "./ThemeContext";
import { WorldMap } from "./WorldMap";
import  SecondaryPanels  from "./SecondaryPanels";
import { MarketWatchPanel } from "./MarketWatchPanel";

// ─── REACH PAGE ───────────────────────────────────────────────────────────────
export function ReachPage({ symMap, onSymbolSelect }) {
  const { theme: t } = useTheme();

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, height: "100%" }}>
      <div style={{
        background: t.glass, backdropFilter: t.glassBlur,
        borderRadius: t.cardRadius, border: `1px solid ${t.border}`,
        padding: "24px", boxShadow: t.shadow,
      }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: t.text, fontFamily: t.fontUI, marginBottom: 8 }}>
          Global Reach Map
        </div>
        <div style={{ fontSize: 13, color: t.textSub, fontFamily: t.fontUI, marginBottom: 24 }}>
          Live geographic distribution of active users and node latency.
        </div>
        <div style={{ height: 400 }}>
          <WorldMap symMap={symMap} onSymbolSelect={onSymbolSelect} />
        </div>
      </div>
    </div>
  );
}

// ─── SCANNER PAGE ─────────────────────────────────────────────────────────────
export function ScannerPage({ symMap, signals, onSymbolSelect }) {
  const { theme: t } = useTheme();

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, height: "100%" }}>
      <div style={{
        background: t.glass, backdropFilter: t.glassBlur,
        borderRadius: t.cardRadius, border: `1px solid ${t.border}`,
        padding: "24px", boxShadow: t.shadow,
        flex: 1, minHeight: 0, overflowY: "hidden", display: "flex", flexDirection: "column"
      }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: t.text, fontFamily: t.fontUI, marginBottom: 8, flexShrink: 0 }}>
          Market Scanner & Signals
        </div>
        <div style={{ fontSize: 13, color: t.textSub, fontFamily: t.fontUI, marginBottom: 24, flexShrink: 0 }}>
          Real-time feed of market data, customized watchlists, and algorithmic signals.
        </div>
        <div style={{ flex: 1, minHeight: 0, display: "flex", justifyContent: "center" }}>
          <div style={{ width: "100%", maxWidth: 600, height: "100%" }}>
            <MarketWatchPanel symMap={symMap} signals={signals} onSymbolSelect={onSymbolSelect} />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── ALERTS PAGE ──────────────────────────────────────────────────────────────
export function AlertsPage({ anomalies, connected, onSymbolSelect }) {
  const { theme: t } = useTheme();

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, height: "100%" }}>
      <div style={{
        background: t.glass, backdropFilter: t.glassBlur,
        borderRadius: t.cardRadius, border: `1px solid ${t.border}`,
        padding: "24px", boxShadow: t.shadow,
        flex: 1, minHeight: 0, overflowY: "hidden", display: "flex", flexDirection: "column"
      }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: t.text, fontFamily: t.fontUI, marginBottom: 8, flexShrink: 0 }}>
          System Alerts & Anomalies
        </div>
        <div style={{ fontSize: 13, color: t.textSub, fontFamily: t.fontUI, marginBottom: 24, flexShrink: 0 }}>
          High standard deviation moves, systemic warnings, and health tracking.
        </div>
        <div style={{ flex: 1, minHeight: 0, overflowY: "hidden" }}>
          <SecondaryPanels anomalies={anomalies} connected={connected} onSymbolSelect={onSymbolSelect} />
        </div>
      </div>
    </div>
  );
}
