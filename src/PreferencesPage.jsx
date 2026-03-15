import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell, BellOff, Plus, Trash2, TrendingUp, TrendingDown,
  Zap, AlertTriangle, Volume2, VolumeX, Check, X,
  ChevronDown, Sliders, Activity, Target
} from "lucide-react";
import { useTheme } from "./ThemeContext";
import { SYMBOLS, COMPANIES } from "./useDataStream";

const ALERT_TYPES = [
  { id: "price_above", label: "Price above", icon: TrendingUp, color: "#00e676", prefix: ">" },
  { id: "price_below", label: "Price below", icon: TrendingDown, color: "#ff1744", prefix: "<" },
  { id: "pct_gain", label: "% gain in session", icon: Zap, color: "#00E5FF", prefix: "↑" },
  { id: "pct_drop", label: "% drop in session", icon: AlertTriangle, color: "#ffb300", prefix: "↓" },
  { id: "volume_spike", label: "Volume spike (×)", icon: Activity, color: "#ab47bc", prefix: "×" },
];

const DEFAULT_ALERTS = [
  { id: 1, symbol: "AAPL", type: "price_above", value: "200", enabled: true, notify: ["app", "email"] },
  { id: 2, symbol: "NVDA", type: "pct_gain", value: "3", enabled: true, notify: ["app"] },
  { id: 3, symbol: "BTC", type: "pct_drop", value: "5", enabled: false, notify: ["app", "sms"] },
  { id: 4, symbol: "TSLA", type: "price_below", value: "230", enabled: true, notify: ["app"] },
];

const NOTIFY_OPTS = [
  { id: "app", label: "In-App", icon: Bell },
  { id: "email", label: "Email", icon: Activity },
  { id: "sms", label: "SMS", icon: Volume2 },
];

function AlertCard({ alert, onToggle, onDelete, onEdit }) {
  const { theme: t } = useTheme();
  const type = ALERT_TYPES.find(a => a.id === alert.type);
  const isEnabled = alert.enabled;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95, height: 0 }}
      style={{
        background: t.glass, backdropFilter: "blur(12px)",
        borderRadius: 14, border: `1px solid ${isEnabled ? (type?.color + "35" || t.border) : t.border}`,
        padding: "14px 16px", boxShadow: t.shadow,
        opacity: isEnabled ? 1 : 0.55, transition: "opacity 0.25s, border-color 0.25s",
        position: "relative", overflow: "hidden",
      }}>
      {/* Left accent bar */}
      {isEnabled && (
        <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 3,
          background: type?.color || t.accent, borderRadius: "3px 0 0 3px" }} />
      )}

      <div style={{ display: "flex", alignItems: "center", gap: 12, paddingLeft: isEnabled ? 6 : 0 }}>
        {/* Symbol badge */}
        <div style={{ width: 40, height: 40, borderRadius: 11, flexShrink: 0,
          background: `${type?.color || t.accent}15`,
          border: `1px solid ${type?.color || t.accent}30`,
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          <span style={{ fontFamily: t.fontMono, fontSize: 10, fontWeight: 800, color: type?.color || t.accent }}>
            {alert.symbol.slice(0, 3)}
          </span>
          <span style={{ fontSize: 8, color: type?.color || t.accent, opacity: 0.7 }}>{type?.prefix}</span>
        </div>

        {/* Details */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <span style={{ fontFamily: t.fontMono, fontSize: 13, fontWeight: 800, color: t.text }}>
              {alert.symbol}
            </span>
            <span style={{ fontSize: 10, color: type?.color || t.accent,
              background: `${type?.color || t.accent}15`, padding: "1px 7px",
              borderRadius: 6, fontFamily: t.fontDisplay, fontWeight: 700 }}>
              {type?.label}
            </span>
            <span style={{ fontFamily: t.fontMono, fontSize: 13, fontWeight: 800, color: type?.color || t.accent }}>
              {type?.prefix}{alert.value}{alert.type.includes("pct") ? "%" : alert.type === "volume_spike" ? "×" : ""}
            </span>
          </div>
          <div style={{ display: "flex", gap: 5 }}>
            {alert.notify.map(n => {
              const opt = NOTIFY_OPTS.find(o => o.id === n);
              if (!opt) return null;
              const Icon = opt.icon;
              return (
                <span key={n} style={{ fontSize: 9, color: t.textSub,
                  background: t.glass, border: `1px solid ${t.border}`,
                  padding: "2px 7px", borderRadius: 6,
                  display: "flex", alignItems: "center", gap: 3, fontFamily: t.fontDisplay }}>
                  <Icon size={8} /> {opt.label}
                </span>
              );
            })}
          </div>
        </div>

        {/* Controls */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {/* Toggle */}
          <div onClick={() => onToggle(alert.id)}
            style={{ width: 40, height: 22, borderRadius: 11, cursor: "pointer",
              background: isEnabled ? (type?.color || t.accent) : t.textDim,
              position: "relative", transition: "background 0.25s", flexShrink: 0 }}>
            <div style={{ position: "absolute", top: 3, left: isEnabled ? 21 : 3,
              width: 16, height: 16, borderRadius: "50%", background: "#fff",
              transition: "left 0.25s", boxShadow: "0 1px 4px rgba(0,0,0,0.3)" }} />
          </div>
          <button onClick={() => onDelete(alert.id)}
            style={{ width: 28, height: 28, borderRadius: 8, border: `1px solid ${t.border}`,
              background: t.glass, cursor: "pointer", display: "flex", alignItems: "center",
              justifyContent: "center", color: t.textSub, transition: "all 0.15s" }}>
            <Trash2 size={12} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function NewAlertForm({ onAdd, onCancel }) {
  const { theme: t } = useTheme();
  const [sym, setSym] = useState("AAPL");
  const [type, setType] = useState("price_above");
  const [value, setValue] = useState("");
  const [notify, setNotify] = useState(["app"]);

  const toggleNotify = (id) => {
    setNotify(prev => prev.includes(id) ? prev.filter(n => n !== id) : [...prev, id]);
  };

  const submit = () => {
    if (!value) return;
    onAdd({ id: Date.now(), symbol: sym, type, value, enabled: true, notify });
    onCancel();
  };

  const inp = {
    padding: "9px 11px", borderRadius: 9, background: t.glass, backdropFilter: "blur(8px)",
    border: `1px solid ${t.border}`, color: t.text, fontFamily: t.fontDisplay,
    fontSize: 12, outline: "none",
  };

  const selStyle = { ...inp, cursor: "pointer", appearance: "none" };

  return (
    <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
      style={{ background: t.glass, backdropFilter: "blur(16px)",
        borderRadius: 14, border: `1px solid ${t.accent}40`,
        boxShadow: `0 0 0 4px ${t.accent}08, ${t.shadow}`,
        padding: "18px 20px" }}>
      <div style={{ fontFamily: t.fontDisplay, fontSize: 13, fontWeight: 800, color: t.text, marginBottom: 14,
        display: "flex", alignItems: "center", gap: 8 }}>
        <Target size={15} color={t.accent} />
        New Alert
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 120px", gap: 10, marginBottom: 14 }}>
        {/* Symbol */}
        <div>
          <div style={{ fontSize: 10, color: t.textSub, fontFamily: t.fontDisplay, marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.07em" }}>Symbol</div>
          <select value={sym} onChange={e => setSym(e.target.value)} style={{ ...selStyle, width: "100%" }}>
            {SYMBOLS.map(s => <option key={s} value={s} style={{ background: t.bgSecondary }}>{s} — {COMPANIES[s]}</option>)}
          </select>
        </div>

        {/* Alert type */}
        <div>
          <div style={{ fontSize: 10, color: t.textSub, fontFamily: t.fontDisplay, marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.07em" }}>Trigger</div>
          <select value={type} onChange={e => setType(e.target.value)} style={{ ...selStyle, width: "100%" }}>
            {ALERT_TYPES.map(a => <option key={a.id} value={a.id} style={{ background: t.bgSecondary }}>{a.label}</option>)}
          </select>
        </div>

        {/* Value */}
        <div>
          <div style={{ fontSize: 10, color: t.textSub, fontFamily: t.fontDisplay, marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.07em" }}>
            {type.includes("pct") ? "Percent %" : type === "volume_spike" ? "Multiplier" : "Price $"}
          </div>
          <input type="number" value={value} onChange={e => setValue(e.target.value)}
            placeholder={type.includes("pct") ? "5" : type === "volume_spike" ? "2" : "200"}
            style={{ ...inp, width: "100%" }} />
        </div>
      </div>

      {/* Notify channels */}
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 10, color: t.textSub, fontFamily: t.fontDisplay, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.07em" }}>Notify via</div>
        <div style={{ display: "flex", gap: 8 }}>
          {NOTIFY_OPTS.map(opt => {
            const Icon = opt.icon;
            const isOn = notify.includes(opt.id);
            return (
              <button key={opt.id} onClick={() => toggleNotify(opt.id)}
                style={{ padding: "7px 14px", borderRadius: 9, cursor: "pointer",
                  border: `1px solid ${isOn ? t.accent + "60" : t.border}`,
                  background: isOn ? `${t.accent}18` : t.glass,
                  color: isOn ? t.accent : t.textSub,
                  fontFamily: t.fontDisplay, fontSize: 11, fontWeight: isOn ? 700 : 400,
                  display: "flex", alignItems: "center", gap: 5, transition: "all 0.15s" }}>
                <Icon size={11} />
                {opt.label}
                {isOn && <Check size={9} />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={submit}
          style={{ flex: 1, padding: "10px", borderRadius: 10, border: "none", cursor: "pointer",
            background: `linear-gradient(135deg, ${t.accent}, ${t.green})`,
            color: "#000", fontFamily: t.fontDisplay, fontSize: 12, fontWeight: 800,
            display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
          <Bell size={13} /> Create Alert
        </button>
        <button onClick={onCancel}
          style={{ padding: "10px 16px", borderRadius: 10, border: `1px solid ${t.border}`,
            background: t.glass, color: t.textSub, fontFamily: t.fontDisplay, fontSize: 12,
            cursor: "pointer" }}>
          Cancel
        </button>
      </div>
    </motion.div>
  );
}

export function PreferencesPage({ symMap }) {
  const { theme: t } = useTheme();
  const [alerts, setAlerts] = useState(DEFAULT_ALERTS);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [allMuted, setAllMuted] = useState(false);

  const filtered = alerts.filter(a =>
    !search || a.symbol.toLowerCase().includes(search.toLowerCase())
  );

  const toggle = (id) => setAlerts(prev => prev.map(a => a.id === id ? { ...a, enabled: !a.enabled } : a));
  const del = (id) => setAlerts(prev => prev.filter(a => a.id !== id));
  const add = (alert) => setAlerts(prev => [alert, ...prev]);
  const muteAll = () => {
    setAllMuted(m => !m);
    setAlerts(prev => prev.map(a => ({ ...a, enabled: allMuted })));
  };

  const enabledCount = alerts.filter(a => a.enabled).length;

  return (
    <div style={{
      margin: "40px auto",
      maxWidth: 780,
      padding: "30px 40px",
      background: t.glassStrong,
      backdropFilter: t.glassBlur,
      borderRadius: t.cardRadius * 2,
      border: `1px solid ${t.border}`,
      boxShadow: t.shadowFloat,
      display: "flex", flexDirection: "column", gap: 24,
    }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h2 style={{ fontFamily: t.fontDisplay, fontSize: 20, fontWeight: 800, color: t.text, marginBottom: 4 }}>
            Alert Preferences
          </h2>
          <p style={{ fontSize: 12, color: t.textSub, fontFamily: t.fontDisplay }}>
            {enabledCount} active · {alerts.length - enabledCount} muted · customise per stock
          </p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {/* Mute all */}
          <button onClick={muteAll}
            style={{ padding: "8px 14px", borderRadius: 9,
              border: `1px solid ${allMuted ? t.amber + "50" : t.border}`,
              background: allMuted ? `${t.amber}15` : t.glass,
              color: allMuted ? t.amber : t.textSub,
              fontFamily: t.fontDisplay, fontSize: 12, fontWeight: 700,
              cursor: "pointer", display: "flex", alignItems: "center", gap: 6, transition: "all 0.2s" }}>
            {allMuted ? <BellOff size={13} /> : <Bell size={13} />}
            {allMuted ? "Unmute All" : "Mute All"}
          </button>
          <button onClick={() => setShowForm(f => !f)}
            style={{ padding: "8px 16px", borderRadius: 9, border: "none", cursor: "pointer",
              background: showForm ? t.glass : `linear-gradient(135deg, ${t.accent}, ${t.green})`,
              color: showForm ? t.textSub : "#000",
              border: showForm ? `1px solid ${t.border}` : "none",
              fontFamily: t.fontDisplay, fontSize: 12, fontWeight: 800,
              display: "flex", alignItems: "center", gap: 6, transition: "all 0.2s" }}>
            {showForm ? <X size={13} /> : <Plus size={13} />}
            {showForm ? "Cancel" : "New Alert"}
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 8 }}>
        {ALERT_TYPES.map(type => {
          const count = alerts.filter(a => a.type === type.id).length;
          const Icon = type.icon;
          return (
            <div key={type.id} style={{ background: t.glass, backdropFilter: "blur(8px)",
              borderRadius: 10, border: `1px solid ${type.color}25`,
              padding: "10px 12px", textAlign: "center" }}>
              <Icon size={14} color={type.color} style={{ margin: "0 auto 6px" }} />
              <div style={{ fontFamily: t.fontMono, fontSize: 16, fontWeight: 800, color: type.color }}>{count}</div>
              <div style={{ fontSize: 9, color: t.textSub, fontFamily: t.fontDisplay, marginTop: 1 }}>{type.label.split(" ").slice(0, 2).join(" ")}</div>
            </div>
          );
        })}
      </div>

      {/* New alert form */}
      <AnimatePresence>
        {showForm && <NewAlertForm onAdd={add} onCancel={() => setShowForm(false)} />}
      </AnimatePresence>

      {/* Search */}
      <div style={{ position: "relative" }}>
        <Sliders size={13} color={t.textSub} style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)" }} />
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Filter by symbol…"
          style={{ width: "100%", padding: "9px 11px 9px 32px", borderRadius: 9,
            background: t.glass, backdropFilter: "blur(8px)",
            border: `1px solid ${t.border}`, color: t.text,
            fontFamily: t.fontDisplay, fontSize: 12, outline: "none" }} />
      </div>

      {/* Alert cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <AnimatePresence>
          {filtered.map(alert => (
            <AlertCard key={alert.id} alert={alert} onToggle={toggle} onDelete={del} />
          ))}
        </AnimatePresence>

        {filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: "50px 0" }}>
            <BellOff size={32} color={t.textDim} style={{ margin: "0 auto 12px" }} />
            <div style={{ color: t.textSub, fontFamily: t.fontDisplay, fontSize: 14 }}>
              {search ? `No alerts for "${search}"` : "No alerts yet — create one above"}
            </div>
          </div>
        )}
      </div>

      {/* Info card */}
      <div style={{ background: `${t.accent}08`, border: `1px solid ${t.accent}20`,
        borderRadius: 12, padding: "14px 16px", display: "flex", gap: 12, alignItems: "flex-start" }}>
        <AlertTriangle size={14} color={t.accent} style={{ marginTop: 1, flexShrink: 0 }} />
        <div style={{ fontSize: 12, color: t.textSub, fontFamily: t.fontDisplay, lineHeight: 1.6 }}>
          <strong style={{ color: t.text }}>Pro tip:</strong> Use the "Mute All" button to pause all notifications during off-hours without deleting your alerts. Each alert can be toggled individually, and you can stop toast pop-ups from the bell icon in the notification bar.
        </div>
      </div>
    </div>
  );
}
