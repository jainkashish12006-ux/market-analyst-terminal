import { motion } from "framer-motion";
import { useTheme } from "./ThemeContext";
import { WorldMap } from "./WorldMap";
import  SecondaryPanels  from "./SecondaryPanels";
import { MarketWatchPanel } from "./MarketWatchPanel";

function NewsTicker() {
  const { theme: t } = useTheme();
  const news = [
    "FED INDICATES POTENTIAL RATE CUT IN Q3",
    "TECH SECTOR SHOWS UNUSUALLY HIGH VOLUMETRIC INFLOW",
    "OIL PRICES STABILIZE AMID MIDDLE EAST TENSIONS",
    "BITCOIN BREAKS CRITICAL RESISTANCE AT 68K",
    "NVIDIA REVEALS NEXT-GEN AI ARCHITECTURE",
    "YIELD CURVE SHOWS SIGNS OF GRADUAL UN-INVERSION",
    "GLOBAL LOGISTICS INDEX HITS 2-YEAR HIGH"
  ];

  return (
    <div style={{
      background: `${t.accent}12`, border: `1px solid ${t.accent}25`,
      borderRadius: 8, padding: "8px 16px", marginBottom: 16,
      overflow: "hidden", display: "flex", alignItems: "center", gap: 20
    }}>
      <div style={{
        fontSize: 9, fontWeight: 900, color: t.accent, fontFamily: t.fontUI,
        textTransform: "uppercase", letterSpacing: "0.1em", display: "flex", alignItems: "center", gap: 6,
        whiteSpace: "nowrap"
      }}>
        <div style={{ width: 6, height: 6, borderRadius: "50%", background: t.accent, animation: "dotPulse 1.5s infinite" }} />
        Global Intel
      </div>
      <div style={{ flex: 1, overflow: "hidden", position: "relative", height: 14 }}>
        <motion.div
          animate={{ x: ["100%", "-200%"] }}
          transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
          style={{ display: "flex", gap: 40, whiteSpace: "nowrap", position: "absolute" }}
        >
          {news.map((item, i) => (
            <span key={i} style={{ fontSize: 10, color: t.textSub, fontFamily: t.fontMono }}>
              {item}
            </span>
          ))}
        </motion.div>
      </div>
    </div>
  );
}

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
        <div style={{ height: "calc(100vh - 200px)", minHeight: 400 }}>
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
        <div style={{ fontSize: 13, color: t.textSub, fontFamily: t.fontUI, marginBottom: 16, flexShrink: 0 }}>
          Real-time feed of market data, customized watchlists, and algorithmic signals.
        </div>
        <NewsTicker />
        <div style={{ flex: 1, minHeight: 0, display: "flex", justifyContent: "center" }}>
          <div style={{ width: "100%", height: "100%" }}>
            <MarketWatchPanel symMap={symMap} signals={signals} onSymbolSelect={onSymbolSelect} />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── ALERTS PAGE ──────────────────────────────────────────────────────────────
export function AlertsPage({ anomalies, connected, health, symMap, onSymbolSelect }) {
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
        <div style={{ flex: 1, minHeight: 0, overflowY: "auto", paddingRight: 4 }}>
          <SecondaryPanels 
            anomalies={anomalies} 
            connected={connected} 
            health={health} 
            symbolMap={symMap} 
            onSymbolSelect={onSymbolSelect} 
          />
        </div>
      </div>
    </div>
  );
}
