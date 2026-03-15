import { motion, AnimatePresence } from "framer-motion";
import { Radio, AlertTriangle, Activity, Eye, EyeOff, Moon, Sun, ChevronRight, Zap, BarChart2, Newspaper, ShieldCheck } from "lucide-react";
import { useTheme } from "./ThemeContext";

const NAV_ITEMS = [
  { id: "signals", icon: Radio, label: "Signals" },
  { id: "anomalies", icon: AlertTriangle, label: "Anomalies" },
  { id: "health", icon: Activity, label: "Health" },
  { id: "news", icon: Newspaper, label: "News" },
  { id: "risk", icon: ShieldCheck, label: "Risk" },
];

export function NavigationRail({ activePanel, setActivePanel, anomalyCount, criticalCount, connected }) {
  const { theme } = useTheme();

  const getStatus = (id) => {
    if (id === "anomalies") return criticalCount > 0 ? "critical" : anomalyCount > 0 ? "active" : "normal";
    if (id === "health") return connected ? "normal" : "critical";
    return "normal";
  };

  const dotColor = (s) => s === "critical" ? theme.danger : s === "active" ? theme.warn : "transparent";

  return (
    <div style={{
      width: 56, background: theme.railBg,
      borderRight: `1px solid ${theme.border}`,
      display: "flex", flexDirection: "column",
      alignItems: "center", paddingTop: 16, gap: 4,
      backdropFilter: "blur(12px)",
      flexShrink: 0,
    }}>
      {/* Logo mark */}
      <div style={{
        width: 32, height: 32, borderRadius: 9, marginBottom: 12,
        background: `linear-gradient(135deg, ${theme.accent}, ${theme.accentSecondary})`,
        display: "flex", alignItems: "center", justifyContent: "center",
        boxShadow: `0 0 12px ${theme.accentGlow}`,
      }}>
        <BarChart2 size={14} color="#0a0f1e" />
      </div>

      {NAV_ITEMS.map(item => {
        const isActive = activePanel === item.id;
        const Icon = item.icon;
        const status = getStatus(item.id);
        return (
          <button key={item.id} onClick={() => setActivePanel(item.id)} title={item.label}
            style={{
              width: 40, height: 40, borderRadius: 10, border: "none", cursor: "pointer",
              background: isActive ? `${theme.accent}18` : "transparent",
              display: "flex", alignItems: "center", justifyContent: "center",
              position: "relative", transition: "all 0.2s",
              boxShadow: isActive ? `0 0 0 1px ${theme.accent}40` : "none",
            }}>
            <Icon size={16} color={isActive ? theme.accent : theme.textMuted} />
            {status !== "normal" && (
              <div style={{
                position: "absolute", top: 6, right: 6, width: 6, height: 6,
                borderRadius: "50%", background: dotColor(status),
                animation: status === "critical" ? "dot-pulse 1.2s infinite" : "none",
                boxShadow: `0 0 6px ${dotColor(status)}`,
              }} />
            )}
          </button>
        );
      })}
    </div>
  );
}

export function TopCommandBar({
  activeTab, setActiveTab, focusMode, setFocusMode,
  anomalyCount, criticalCount, batchMode, stressAlert, onStressAccept,
  onCmdK, connected,
}) {
  const { theme, mode, toggleMode, transitioning } = useTheme();

  const tabStatus = (i) => {
    if (i === 0) return criticalCount > 0 ? "critical" : anomalyCount > 5 ? "active" : "normal";
    if (i === 1) return criticalCount > 0 ? "critical" : anomalyCount > 0 ? "active" : "normal";
    if (i === 2) return connected ? "normal" : "critical";
    return "normal";
  };

  const tabs = [
    { label: "Market Watch", status: tabStatus(0) },
    { label: "Anomaly Tracker", status: tabStatus(1), badge: anomalyCount },
    { label: "System Health", status: tabStatus(2) },
  ];

  const statusColors = { normal: theme.accentSecondary, active: theme.warn, critical: theme.danger };
  const statusLabels = { normal: "Normal", active: "Active", critical: "Critical" };

  return (
    <div style={{
      background: theme.navBg,
      borderBottom: `1px solid ${theme.border}`,
      backdropFilter: "blur(14px)",
      position: "sticky", top: 0, zIndex: 200,
    }}>
      {/* Stress alert banner */}
      <AnimatePresence>
        {stressAlert && (
          <motion.div
            initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            style={{
              background: `${theme.warn}18`, borderBottom: `1px solid ${theme.warn}40`,
              padding: "7px 20px", display: "flex", alignItems: "center", justifyContent: "space-between",
            }}>
            <span style={{ fontSize: 12, color: theme.warn, fontFamily: theme.fontUI }}>
              ⚡ Market is highly volatile. Switch to Calm Mode?
            </span>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={onStressAccept} style={{
                background: `${theme.warn}22`, border: `1px solid ${theme.warn}60`,
                borderRadius: 6, padding: "3px 12px", cursor: "pointer",
                color: theme.warn, fontSize: 11, fontWeight: 700, fontFamily: theme.fontUI,
              }}>
                Switch
              </button>
              <button onClick={onStressAccept} style={{
                background: "none", border: "none", cursor: "pointer",
                color: theme.textMuted, fontSize: 11, fontFamily: theme.fontUI,
              }}>
                Dismiss
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Breadcrumb */}
      <div style={{ padding: "6px 20px 0", display: "flex", alignItems: "center", gap: 5 }}>
        {["Market", "Global Equity", tabs[activeTab].label].map((c, i, arr) => (
          <span key={c} style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <span style={{ fontSize: 10, color: i === arr.length - 1 ? theme.textMuted : theme.textDim,
              fontFamily: theme.fontUI, cursor: i < arr.length - 1 ? "pointer" : "default" }}>{c}</span>
            {i < arr.length - 1 && <ChevronRight size={9} color={theme.textDim} />}
          </span>
        ))}
      </div>

      {/* Main row */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "6px 20px 0",
      }}>
        {/* Title */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{
            fontFamily: theme.fontUI, fontSize: 14, fontWeight: 800,
            letterSpacing: "0.1em", color: theme.text, textTransform: "uppercase",
          }}>
            Omni-Terminal
          </span>
          <span style={{ fontSize: 9, color: theme.textDim, fontFamily: theme.fontData,
            border: `1px solid ${theme.border}`, borderRadius: 4, padding: "2px 6px",
          }}>v3.0</span>
          {batchMode && (
            <span style={{ fontSize: 10, color: theme.warn, fontFamily: theme.fontData,
              background: `${theme.warn}18`, padding: "2px 8px", borderRadius: 10,
              border: `1px solid ${theme.warn}40`, animation: "none" }}>
              BATCH MODE
            </span>
          )}
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 2 }}>
          {tabs.map((tab, i) => {
            const isActive = activeTab === i;
            const sc = statusColors[tab.status];
            return (
              <button key={i} onClick={() => setActiveTab(i)} style={{
                background: isActive ? `${theme.accent}10` : "transparent",
                border: "none", borderBottom: `2px solid ${isActive ? theme.accent : "transparent"}`,
                padding: "10px 16px 8px", cursor: "pointer",
                display: "flex", alignItems: "center", gap: 6, transition: "all 0.2s",
              }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: isActive ? theme.text : theme.textMuted,
                  fontFamily: theme.fontUI }}>
                  {tab.label}
                </span>
                <span style={{
                  fontSize: 9, fontWeight: 800, color: sc, background: `${sc}18`,
                  padding: "2px 6px", borderRadius: 8,
                  fontFamily: theme.fontData, border: `1px solid ${sc}40`,
                  animation: tab.status === "critical" ? "criticalPulse 1.5s infinite" : "none",
                }}>
                  {statusLabels[tab.status]}{tab.badge ? ` ·${tab.badge}` : ""}
                </span>
              </button>
            );
          })}
        </div>

        {/* Controls */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button onClick={onCmdK} style={{
            background: theme.inputBg, border: `1px solid ${theme.border}`,
            borderRadius: 7, padding: "5px 10px",
            display: "flex", alignItems: "center", gap: 6, cursor: "pointer",
            color: theme.textMuted, fontSize: 11, fontFamily: theme.fontUI,
          }}>
            <span>⌘K</span>
            <span>Search</span>
          </button>

          <button onClick={() => setFocusMode(f => !f)} style={{
            background: focusMode ? `${theme.accent}18` : theme.inputBg,
            border: `1px solid ${focusMode ? theme.accent + "50" : theme.border}`,
            borderRadius: 7, padding: "5px 10px",
            display: "flex", alignItems: "center", gap: 6, cursor: "pointer",
            color: focusMode ? theme.accent : theme.textMuted, fontSize: 11, fontFamily: theme.fontUI,
            transition: "all 0.2s",
          }}>
            {focusMode ? <Eye size={12}/> : <EyeOff size={12}/>}
            {focusMode ? "Exit Focus" : "Focus Mode"}
          </button>

          <button onClick={toggleMode} style={{
            background: theme.inputBg, border: `1px solid ${theme.border}`,
            borderRadius: 7, padding: "5px 10px",
            display: "flex", alignItems: "center", gap: 6, cursor: "pointer",
            color: theme.accent, fontSize: 11, fontFamily: theme.fontUI,
            transition: "all 0.2s", opacity: transitioning ? 0.5 : 1,
          }}>
            {mode === "deepSea" ? <Sun size={12}/> : <Moon size={12}/>}
            {mode === "deepSea" ? "Calm" : "Deep Sea"}
          </button>
        </div>
      </div>
    </div>
  );
}
