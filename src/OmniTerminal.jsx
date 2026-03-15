import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ThemeProvider, useTheme } from "./ThemeContext";
import { AuthProvider, useAuth } from "./AuthContext";

// ── Background Ambient Orbs ──
function AmbientBackground() {
  const { theme: t } = useTheme();
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 0 }}>
      <motion.div
        animate={{ scale: [1, 1.15, 1], opacity: [0.15, 0.25, 0.15], x: [0, 50, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
        style={{
          position: "absolute", top: "-10%", left: "-10%", width: "50vw", height: "50vw",
          background: `radial-gradient(circle, ${t.accent}40 0%, transparent 60%)`,
          filter: "blur(80px)"
        }}
      />
      <motion.div
        animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1], y: [0, -40, 0] }}
        transition={{ duration: 22, repeat: Infinity, ease: "linear", delay: 2 }}
        style={{
          position: "absolute", bottom: "-20%", right: "-10%", width: "60vw", height: "60vw",
          background: `radial-gradient(circle, ${t.green}30 0%, transparent 60%)`,
          filter: "blur(100px)"
        }}
      />
      <motion.div
        animate={{ opacity: [0.05, 0.15, 0.05] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        style={{
          position: "absolute", top: "30%", left: "30%", width: "40vw", height: "40vw",
          background: `radial-gradient(circle, ${t.amber}20 0%, transparent 50%)`,
          filter: "blur(60px)"
        }}
      />
    </div>
  );
}

// ── TopBar component ──
import { useDataStream } from "./useDataStream";
import { TickerTape } from "./TickerTape";
import { Sidebar } from "./Sidebar";
import { CommandPalette } from "./CommandPalette";
import { TradeStoryPanel } from "./TradeStoryPanel";
import { NewsPanel } from "./NewsPanel";
import { AIBot } from "./AIBot";
import { AuthModal } from "./AuthModal";
import { DashboardPage } from "./DashboardPage";
import { PerformancePage } from "./PerformancePage";
import { ReachPage, ScannerPage, AlertsPage } from "./SecondaryPages";
import { DocsPage } from "./DocsPage";
import { SettingsPage } from "./SettingsPage";
import { HelpPage } from "./HelpPage";
import { PreferencesPage } from "./PreferencesPage";
import { Footer } from "./footer";
import { EKGLine } from "./MicroComponents";
import {LandingPage}  from "./LandingPage";
import {
  Newspaper, Bot, Search, Bell, BellOff,
  Sun, Moon, ChevronRight, Wifi, WifiOff, ArrowLeft
} from "lucide-react";

const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600;700&family=Inter:wght@300;400;500;600;700&family=Syne:wght@400;600;700;800&family=Playfair+Display:ital,wght@0,400;0,600;1,400&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  ::-webkit-scrollbar { width: 3px; height: 3px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: rgba(100,116,139,0.25); border-radius: 2px; }
  ::-webkit-scrollbar-thumb:hover { background: rgba(100,116,139,0.45); }
  @keyframes dotPulse    { 0%,100%{opacity:1;transform:scale(1)}   50%{opacity:0.3;transform:scale(0.65)} }
  @keyframes critPulse   { 0%,100%{opacity:1}                       50%{opacity:0.35} }
  @keyframes spin        { to { transform: rotate(360deg); } }
`;

const PAGE_LABELS = {
  dashboard: "Dashboard", performance: "Performance", reach: "Global Reach",
  funnel: "Scanner", alerts: "Alerts", preferences: "Preferences",
  docs: "Document Vault", help: "Help & Info", settings: "Settings",
};
const NEEDS_FOOTER = new Set(["docs","settings","help","preferences","performance"]);

function StressBanner({ onSwitch, onDismiss }) {
  const { theme: t } = useTheme();
  return (
    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      style={{ background: `${t.amber}12`, borderBottom: `1px solid ${t.amber}30`,
        padding: "6px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
      <span style={{ fontSize: 11, color: t.amber, fontFamily: t.fontUI }}>
        ⚡ Market volatility elevated — Calm Mode recommended
      </span>
      <div style={{ display: "flex", gap: 6 }}>
        <button onClick={onSwitch} style={{ background: `${t.amber}18`, border: `1px solid ${t.amber}45`,
          borderRadius: 6, padding: "3px 10px", cursor: "pointer", color: t.amber,
          fontSize: 10, fontWeight: 700, fontFamily: t.fontUI }}>Switch</button>
        <button onClick={onDismiss} style={{ background: "none", border: "none", cursor: "pointer",
          color: t.textSub, fontSize: 10, fontFamily: t.fontUI }}>Dismiss</button>
      </div>
    </motion.div>
  );
}

function TopBar({ navPage, onNews, alertsMuted, anomalyCount, onBack }) {
  const { theme: t, mode, toggle } = useTheme();
  const { user } = useAuth();
  const crumbs = ["Market", PAGE_LABELS[navPage] || "Overview"];

  return (
    <div style={{
      height: 52, flexShrink: 0, padding: "0 20px", display: "flex", alignItems: "center", justifyContent: "space-between",
      background: t.glass, backdropFilter: t.glassBlur, borderBottom: `1px solid ${t.border}`, zIndex: 50
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <button onClick={onBack} style={{
          background: "none", border: "none", cursor: "pointer",
          color: t.textDim, padding: "6px", display: "flex", alignItems: "center", borderRadius: 6,
          transition: "color 0.2s"
        }}
          title="Back to home"
          onMouseEnter={e => e.currentTarget.style.color = t.textSub}
          onMouseLeave={e => e.currentTarget.style.color = t.textDim}>
          <ArrowLeft size={16} />
        </button>
        <div style={{ width: 1, height: 16, background: t.border }} />
        {crumbs.map((c, i) => (
          <span key={c} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{
              fontSize: 13, fontFamily: t.fontUI,
              color: i === crumbs.length - 1 ? t.text : t.textDim,
              fontWeight: i === crumbs.length - 1 ? 600 : 500
            }}>{c}</span>
            {i < crumbs.length - 1 && <ChevronRight size={12} color={t.textDim} />}
          </span>
        ))}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <button onClick={onNews} style={{
          width: 36, height: 36, borderRadius: 8, border: "none",
          background: "transparent", cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          position: "relative", color: t.textSub, transition: "background 0.2s"
        }}
        onMouseEnter={e => e.currentTarget.style.background = t.name === "deepSea" ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"}
        onMouseLeave={e => e.currentTarget.style.background = "transparent"}
        >
          {alertsMuted ? <BellOff size={16} color={t.amber} /> : <Bell size={16} />}
          {anomalyCount > 0 && !alertsMuted && (
            <div style={{
              position: "absolute", top: 6, right: 6, width: 8, height: 8,
              borderRadius: "50%", background: t.red, boxShadow: `0 0 8px ${t.red}`
            }} />
          )}
        </button>
      </div>
    </div>
  );
}

function StatusBar({ health, connected, alertsMuted, signalCount }) {
  const { theme: t } = useTheme();
  const isGood = (health.lag || 0) < 200 && connected;
  return (
    <div style={{ height: 32, flexShrink: 0, padding: "0 18px",
      display: "flex", alignItems: "center", justifyContent: "space-between",
      background: t.glass, backdropFilter: t.glassBlur, borderTop: `1px solid ${t.border}` }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          {connected ? <Wifi size={9} color={t.green} /> : <WifiOff size={9} color={t.red} />}
          <span style={{ fontSize: 8, fontFamily: t.fontMono, fontWeight: 700,
            color: connected ? t.green : t.red }}>{connected ? "LIVE" : "OFFLINE"}</span>
        </div>
        <EKGLine lag={health.lag || 0} connected={connected} width={160} />
      </div>
      <div style={{ display: "flex", gap: 18, alignItems: "center" }}>
        {[["LAT",`${health.latency?.toFixed(0)||0}ms`,(health.latency||0)<25],
          ["LAG",`${health.lag?.toFixed(0)||0}ms`,(health.lag||0)<200],
          ["SIG",`${signalCount}`,true],
          ["UP",`${health.uptime||0}s`,true]].map(([l,v,ok]) => (
          <div key={l} style={{ display: "flex", gap: 4, alignItems: "center" }}>
            <span style={{ fontSize: 8, color: t.textDim, fontFamily: t.fontUI, letterSpacing: "0.06em" }}>{l}</span>
            <span style={{ fontFamily: t.fontMono, fontSize: 8, fontWeight: 600,
              color: ok ? t.green : t.amber }}>{v}</span>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        {alertsMuted && <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <BellOff size={9} color={t.amber} />
          <span style={{ fontSize: 8, color: t.amber, fontFamily: t.fontMono }}>MUTED</span>
        </div>}
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <div style={{ width: 5, height: 5, borderRadius: "50%",
            background: isGood ? t.green : t.amber,
            boxShadow: `0 0 5px ${isGood ? t.green : t.amber}`,
            animation: "dotPulse 2.5s infinite" }} />
          <span style={{ fontSize: 8, fontFamily: t.fontMono, color: t.textDim }}>
            {isGood ? "ALL SYSTEMS NOMINAL" : "HIGH LAG"}
          </span>
        </div>
      </div>
    </div>
  );
}

function ToastStack({ toasts, onDismiss }) {
  const { theme: t } = useTheme();
  return (
    <div style={{ position: "fixed", bottom: 44, right: 80, zIndex: 600,
      display: "flex", flexDirection: "column", gap: 6, maxWidth: 290 }}>
      <AnimatePresence>
        {toasts.map(toast => (
          <motion.div key={toast.id}
            initial={{ opacity: 0, x: 50, scale: 0.97 }} animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 50, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 280, damping: 26 }}
            style={{ background: t.glass, backdropFilter: t.glassBlur,
              border: `1px solid ${t.amber}35`, borderLeft: `3px solid ${t.amber}`,
              borderRadius: 10, padding: "10px 13px", boxShadow: t.shadowFloat,
              display: "flex", gap: 9, alignItems: "flex-start" }}>
            <span style={{ fontSize: 11, color: t.text, flex: 1, lineHeight: 1.5, fontFamily: t.fontUI }}>
              {toast.message}
            </span>
            {toast.action && (
              <button onClick={toast.action.fn} style={{ fontSize: 10, color: t.accent, background: "none",
                border: "none", cursor: "pointer", fontFamily: t.fontUI, fontWeight: 700,
                whiteSpace: "nowrap", padding: 0, marginTop: 1 }}>
                {toast.action.label} →
              </button>
            )}
            <button onClick={() => onDismiss(toast.id)}
              style={{ background: "none", border: "none", cursor: "pointer",
                color: t.textDim, fontSize: 13, lineHeight: 1, padding: 0 }}>×</button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

function FAB({ onBot, onNews, onMute, alertsMuted, newsAlerts }) {
  const { theme: t } = useTheme();
  return (
    <div style={{ position: "fixed", bottom: 46, right: 16, zIndex: 700,
      display: "flex", flexDirection: "column", gap: 7 }}>
      <button onClick={onBot} title="AI Assistant"
        style={{ width: 40, height: 40, borderRadius: "50%", border: "none", cursor: "pointer",
          background: `linear-gradient(135deg, ${t.accent}, ${t.green})`,
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: `0 4px 16px ${t.accentGlow}` }}>
        <Bot size={16} color="#000" />
      </button>
      <button onClick={onNews} title="News"
        style={{ width: 40, height: 40, borderRadius: "50%", border: `1px solid ${t.border}`,
          cursor: "pointer", background: t.glass, backdropFilter: t.glassBlur,
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: t.shadowCard, position: "relative" }}>
        <Newspaper size={15} color={t.accent} />
        {newsAlerts > 0 && !alertsMuted && (
          <div style={{ position: "absolute", top: -1, right: -1, width: 13, height: 13,
            borderRadius: "50%", background: t.red,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 7, fontWeight: 800, color: "#fff", fontFamily: t.fontMono }}>{newsAlerts}</div>
        )}
      </button>
      <button onClick={onMute} title={alertsMuted ? "Unmute" : "Mute alerts"}
        style={{ width: 40, height: 40, borderRadius: "50%",
          border: `1px solid ${alertsMuted ? t.amber + "50" : t.border}`,
          cursor: "pointer",
          background: alertsMuted ? `${t.amber}14` : t.glass,
          backdropFilter: t.glassBlur,
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: t.shadowCard }}>
        {alertsMuted ? <BellOff size={14} color={t.amber} /> : <Bell size={14} color={t.textSub} />}
      </button>
    </div>
  );
}

// ── Terminal app (after landing) ──────────────────────────────────────────────
function TerminalApp({ onBack }) {
  const { theme: t, mode, toggle, fading } = useTheme();
  const { user } = useAuth();
  const { signals, anomalies, symMap, health, connected, stressAlert } = useDataStream();

  const [navPage, setNavPage] = useState("dashboard");
  const [focusMode, setFocusMode] = useState(false);
  const [cmdOpen, setCmdOpen] = useState(false);
  const [selectedSym, setSelectedSym] = useState(null);
  const [newsOpen, setNewsOpen] = useState(false);
  const [botOpen, setBotOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [stressDismissed, setStressD] = useState(false);
  const [alertsMuted, setAlertsMuted] = useState(false);
  const [toasts, setToasts] = useState([]);
  const lastAnoRef = useRef(null);
  const timerMap = useRef({});

  useEffect(() => {
    const fn = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") { e.preventDefault(); setCmdOpen(p => !p); }
      if (e.key === "Escape") { setCmdOpen(false); setSelectedSym(null); setNewsOpen(false); setBotOpen(false); }
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, []);

  useEffect(() => {
    if (!anomalies.length || alertsMuted) return;
    const a = anomalies[0];
    if (a.id === lastAnoRef.current) return;
    lastAnoRef.current = a.id;
    if (a.stdDev > 2.5) {
      const id = crypto.randomUUID();
      setToasts(p => [...p.slice(-2), {
        id,
        message: `Unusual move in ${a.sector} — ${a.symbol} at ${a.stdDev.toFixed(1)}σ`,
        action: { label: "View", fn: () => { setSelectedSym(a.symbol); dismissToast(id); } },
      }]);
      timerMap.current[id] = setTimeout(() => dismissToast(id), 6000);
    }
  }, [anomalies, alertsMuted]);

  useEffect(() => { if (alertsMuted) setToasts([]); }, [alertsMuted]);
  useEffect(() => { if (!stressAlert) setStressD(false); }, [stressAlert]);

  const dismissToast = useCallback((id) => {
    clearTimeout(timerMap.current[id]);
    setToasts(p => p.filter(t => t.id !== id));
  }, []);

  const handleCommand = (cmd) => {
    if (cmd === "/focus") setFocusMode(f => !f);
    if (cmd === "/news") setNewsOpen(true);
    if (cmd === "/risk") setNavPage("preferences");
    if (cmd === "/anomalies") setNavPage("alerts");
  };

  const showStress = stressAlert && !stressDismissed && mode === "deepSea" && !alertsMuted;

  const renderPage = () => {
    switch (navPage) {
      case "performance":  return <PerformancePage symMap={symMap} />;
      case "reach":        return <ReachPage symMap={symMap} onSymbolSelect={setSelectedSym} />;
      case "funnel":       return <ScannerPage symMap={symMap} signals={signals} onSymbolSelect={setSelectedSym} />;
      case "alerts":       return <AlertsPage anomalies={anomalies} connected={connected} health={health} symMap={symMap} onSymbolSelect={setSelectedSym} />;
      case "docs":         return <DocsPage />;
      case "settings":     return <SettingsPage />;
      case "help":         return <HelpPage />;
      case "preferences":  return <PreferencesPage symMap={symMap} />;
      default: return (
        <DashboardPage symMap={symMap} signals={signals} anomalies={anomalies}
          health={health} connected={connected}
          onSymbolSelect={setSelectedSym} focusMode={focusMode} />
      );
    }
  };

  return (
    <div style={{ display: "flex", height: "100vh", background: t.bg, color: t.text,
      fontFamily: t.fontUI, overflow: "hidden",
      transition: "background 0.3s ease, color 0.3s ease" }}>

      <AnimatePresence>
        {fading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{ position: "fixed", inset: 0, zIndex: 9999, background: t.bg, pointerEvents: "none" }} />
        )}
      </AnimatePresence>

      <Sidebar active={navPage} setActive={setNavPage}
        alertCount={alertsMuted ? 0 : anomalies.length}
        focusMode={focusMode} setFocusMode={setFocusMode}
        onAuthClick={() => setAuthOpen(true)}
        onCmdK={() => setCmdOpen(true)} />

      <div style={{
        flex: 1, minWidth: 0, display: "flex", flexDirection: "column",
        background: t.bgSurface, position: "relative"
      }}>
        <AmbientBackground />
        
        {/* Banner overlays (zIndex above ambient) */}
        <TickerTape symMap={symMap} />
        <AnimatePresence>
          {showStress && <StressBanner onSwitch={() => { toggle(); setStressD(true); }} onDismiss={() => setStressD(true)} />}
        </AnimatePresence>
        <TopBar navPage={navPage} onNews={() => setNewsOpen(true)}
          alertsMuted={alertsMuted} anomalyCount={anomalies.length}
          onBack={onBack} />
        <div style={{ flex: 1, overflowY: "auto", overflowX: "hidden", padding: "16px 20px 20px" }}>
          <AnimatePresence mode="wait">
            <motion.div key={navPage}
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ type: "spring", mass: 1, stiffness: 180, damping: 26 }}>
              {renderPage()}
            </motion.div>
          </AnimatePresence>
          {NEEDS_FOOTER.has(navPage) && <Footer />}
        </div>
        <StatusBar health={health} connected={connected} alertsMuted={alertsMuted} signalCount={signals.length} />
      </div>

      <CommandPalette open={cmdOpen} onClose={() => setCmdOpen(false)}
        onSymbol={s => { setSelectedSym(s); setCmdOpen(false); }} onCommand={handleCommand} />
      <TradeStoryPanel symbol={selectedSym} data={selectedSym ? symMap[selectedSym] : null}
        open={!!selectedSym} onClose={() => setSelectedSym(null)} />
      <NewsPanel open={newsOpen} onClose={() => setNewsOpen(false)} symMap={symMap} />
      <AIBot open={botOpen} onClose={() => setBotOpen(false)} />
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
      <FAB onBot={() => setBotOpen(p => !p)} onNews={() => setNewsOpen(true)}
        onMute={() => setAlertsMuted(m => !m)}
        alertsMuted={alertsMuted} newsAlerts={anomalies.filter(a => a.stdDev > 2.5).length} />
      {!alertsMuted && <ToastStack toasts={toasts} onDismiss={dismissToast} />}
    </div>
  );
}

// ── Root with landing/terminal routing ───────────────────────────────────────
function AppInner() {
  const [view, setView] = useState("landing"); // "landing" | "terminal"

  return (
    <AnimatePresence mode="wait">
      {view === "landing" ? (
        <motion.div key="landing"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.35 }}>
          <LandingPage onEnter={() => setView("terminal")} />
        </motion.div>
      ) : (
        <motion.div key="terminal" style={{ height: "100vh" }}
          initial={{ opacity: 0, scale: 1.02 }} animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35 }}>
          <TerminalApp onBack={() => setView("landing")} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function OmniTerminal() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <style>{GLOBAL_CSS}</style>
        <AppInner />
      </AuthProvider>
    </ThemeProvider>
  );
}