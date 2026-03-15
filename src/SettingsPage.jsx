import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Monitor, Bell, Shield, Palette, Database,
  Globe, Keyboard, Zap, ChevronRight, Check,
  Moon, Sun, Volume2, VolumeX, Eye, EyeOff,
  RefreshCw, Lock, Mail, Smartphone, Save
} from "lucide-react";
import { useTheme } from "./ThemeContext";
import { useAuth } from "./AuthContext";

function Toggle({ value, onChange, color }) {
  const { theme: t } = useTheme();
  const c = color || t.accent;
  return (
    <div onClick={() => onChange(!value)}
      style={{ width: 40, height: 22, borderRadius: 11, cursor: "pointer",
        background: value ? c : t.textDim,
        position: "relative", transition: "background 0.25s",
        flexShrink: 0 }}>
      <div style={{ position: "absolute", top: 3, left: value ? 21 : 3, width: 16, height: 16,
        borderRadius: "50%", background: "#fff",
        transition: "left 0.25s", boxShadow: "0 1px 4px rgba(0,0,0,0.3)" }} />
    </div>
  );
}

function SettingRow({ label, description, children }) {
  const { theme: t } = useTheme();
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "14px 0", borderBottom: `1px solid ${t.border}`, gap: 20 }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: t.text, fontFamily: t.fontDisplay, marginBottom: 2 }}>{label}</div>
        {description && <div style={{ fontSize: 11, color: t.textSub, fontFamily: t.fontDisplay }}>{description}</div>}
      </div>
      {children}
    </div>
  );
}

function Section({ title, icon: Icon, children }) {
  const { theme: t } = useTheme();
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      style={{ background: t.glass, backdropFilter: "blur(12px)",
        borderRadius: t.cardRadius, border: `1px solid ${t.border}`,
        boxShadow: t.shadow, overflow: "hidden" }}>
      <div style={{ padding: "14px 20px", borderBottom: `1px solid ${t.border}`,
        display: "flex", alignItems: "center", gap: 9,
        background: t.name === "deepSea" ? "rgba(0,229,255,0.04)" : "rgba(79,121,66,0.04)" }}>
        <div style={{ width: 28, height: 28, borderRadius: 8, background: `${t.accent}18`,
          display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon size={14} color={t.accent} />
        </div>
        <span style={{ fontFamily: t.fontDisplay, fontSize: 13, fontWeight: 800, color: t.text, letterSpacing: "0.03em" }}>{title}</span>
      </div>
      <div style={{ padding: "0 20px" }}>{children}</div>
    </motion.div>
  );
}

export function SettingsPage() {
  const { theme: t, mode, toggle } = useTheme();
  const { user } = useAuth();
  const [saved, setSaved] = useState(false);

  const [settings, setSettings] = useState({
    theme: mode,
    compactMode: false,
    animations: true,
    soundAlerts: false,
    desktopNotifications: true,
    emailDigest: true,
    smsAlerts: false,
    autoRefresh: true,
    refreshInterval: "5",
    defaultCurrency: "USD",
    timezone: "UTC-5",
    language: "en",
    twoFactor: false,
    sessionTimeout: "30",
    dataRetention: "90",
    showPnL: true,
    showVolume: true,
    showPercentage: true,
    chartStyle: "area",
    colorBlind: false,
    highContrast: false,
    fontSize: "medium",
  });

  const set = (key, val) => setSettings(s => ({ ...s, [key]: val }));

  const save = () => {
    setSaved(true);
    if (settings.theme !== mode) toggle();
    setTimeout(() => setSaved(false), 2000);
  };

  const inp = {
    padding: "7px 10px", borderRadius: 8, background: t.glass, backdropFilter: "blur(6px)",
    border: `1px solid ${t.border}`, color: t.text, fontFamily: t.fontDisplay,
    fontSize: 12, outline: "none", minWidth: 120,
  };

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
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
        <div>
          <h2 style={{ fontFamily: t.fontDisplay, fontSize: 20, fontWeight: 800, color: t.text, marginBottom: 4 }}>
            Settings
          </h2>
          <p style={{ fontSize: 12, color: t.textSub, fontFamily: t.fontDisplay }}>
            Customize your Omni Terminal experience
          </p>
        </div>
        <button onClick={save}
          style={{ padding: "9px 20px", borderRadius: 10, border: "none", cursor: "pointer",
            background: saved ? `${t.green}22` : `linear-gradient(135deg, ${t.accent}, ${t.green})`,
            color: saved ? t.green : "#000",
            fontFamily: t.fontDisplay, fontSize: 12, fontWeight: 800,
            display: "flex", alignItems: "center", gap: 7, transition: "all 0.3s",
            border: saved ? `1px solid ${t.green}40` : "none" }}>
          {saved ? <Check size={13} /> : <Save size={13} />}
          {saved ? "Saved!" : "Save Changes"}
        </button>
      </div>

      {/* Appearance */}
      <Section title="Appearance" icon={Palette}>
        <SettingRow label="Color Theme" description="Switch between Deep Sea (dark) and Calm (light) mode">
          <div style={{ display: "flex", gap: 8 }}>
            {[["deepSea","Deep Sea",Moon],["calm","Calm",Sun]].map(([val, label, Icon]) => (
              <button key={val} onClick={() => set("theme", val)}
                style={{ padding: "7px 14px", borderRadius: 9, cursor: "pointer",
                  border: `1px solid ${settings.theme === val ? t.accent + "60" : t.border}`,
                  background: settings.theme === val ? `${t.accent}18` : t.glass,
                  color: settings.theme === val ? t.accent : t.textSub,
                  fontFamily: t.fontDisplay, fontSize: 11, fontWeight: settings.theme === val ? 700 : 400,
                  display: "flex", alignItems: "center", gap: 5, transition: "all 0.15s" }}>
                <Icon size={11} /> {label}
              </button>
            ))}
          </div>
        </SettingRow>
        <SettingRow label="Compact Mode" description="Reduce spacing to fit more data on screen">
          <Toggle value={settings.compactMode} onChange={v => set("compactMode", v)} />
        </SettingRow>
        <SettingRow label="Animations" description="Enable panel transitions and motion effects">
          <Toggle value={settings.animations} onChange={v => set("animations", v)} />
        </SettingRow>
        <SettingRow label="Font Size" description="Base font size for the terminal">
          <select value={settings.fontSize} onChange={e => set("fontSize", e.target.value)} style={inp}>
            {["small","medium","large"].map(s => <option key={s} value={s} style={{ background: t.bgSecondary }}>{s.charAt(0).toUpperCase()+s.slice(1)}</option>)}
          </select>
        </SettingRow>
        <SettingRow label="Chart Style" description="Default chart rendering style">
          <select value={settings.chartStyle} onChange={e => set("chartStyle", e.target.value)} style={inp}>
            {[["area","Smooth Area"],["candles","Candlestick"],["line","Line"]].map(([v,l]) => (
              <option key={v} value={v} style={{ background: t.bgSecondary }}>{l}</option>
            ))}
          </select>
        </SettingRow>
        <SettingRow label="Colour-Blind Mode" description="Adjust palette for colour vision deficiencies">
          <Toggle value={settings.colorBlind} onChange={v => set("colorBlind", v)} color={t.amber} />
        </SettingRow>
      </Section>

      {/* Display */}
      <Section title="Data Display" icon={Monitor}>
        <SettingRow label="Show P&L" description="Display profit/loss values in watchlist">
          <Toggle value={settings.showPnL} onChange={v => set("showPnL", v)} />
        </SettingRow>
        <SettingRow label="Show Volume" description="Display trading volume alongside prices">
          <Toggle value={settings.showVolume} onChange={v => set("showVolume", v)} />
        </SettingRow>
        <SettingRow label="Show % Change" description="Show percentage change instead of absolute">
          <Toggle value={settings.showPercentage} onChange={v => set("showPercentage", v)} />
        </SettingRow>
        <SettingRow label="Default Currency" description="Base currency for all valuations">
          <select value={settings.defaultCurrency} onChange={e => set("defaultCurrency", e.target.value)} style={inp}>
            {["USD","EUR","GBP","JPY","INR"].map(c => <option key={c} value={c} style={{ background: t.bgSecondary }}>{c}</option>)}
          </select>
        </SettingRow>
        <SettingRow label="Timezone" description="Display timestamps in your local timezone">
          <select value={settings.timezone} onChange={e => set("timezone", e.target.value)} style={inp}>
            {["UTC-8","UTC-5","UTC+0","UTC+1","UTC+5:30","UTC+9"].map(z => <option key={z} value={z} style={{ background: t.bgSecondary }}>{z}</option>)}
          </select>
        </SettingRow>
        <SettingRow label="Auto Refresh" description="Automatically sync new data in background">
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            {settings.autoRefresh && (
              <select value={settings.refreshInterval} onChange={e => set("refreshInterval", e.target.value)} style={{ ...inp, minWidth: 80 }}>
                {[["1","1s"],["5","5s"],["15","15s"],["30","30s"]].map(([v,l]) => <option key={v} value={v} style={{ background: t.bgSecondary }}>{l}</option>)}
              </select>
            )}
            <Toggle value={settings.autoRefresh} onChange={v => set("autoRefresh", v)} />
          </div>
        </SettingRow>
      </Section>

      {/* Notifications */}
      <Section title="Notifications" icon={Bell}>
        <SettingRow label="Desktop Notifications" description="Browser push notifications for critical alerts">
          <Toggle value={settings.desktopNotifications} onChange={v => set("desktopNotifications", v)} />
        </SettingRow>
        <SettingRow label="Sound Alerts" description="Audio cue when significant market events occur">
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            {settings.soundAlerts ? <Volume2 size={14} color={t.accent} /> : <VolumeX size={14} color={t.textDim} />}
            <Toggle value={settings.soundAlerts} onChange={v => set("soundAlerts", v)} />
          </div>
        </SettingRow>
        <SettingRow label="Email Digest" description="Daily summary of portfolio performance via email">
          <Toggle value={settings.emailDigest} onChange={v => set("emailDigest", v)} />
        </SettingRow>
        <SettingRow label="SMS Alerts" description="Text message for critical price movements">
          <Toggle value={settings.smsAlerts} onChange={v => set("smsAlerts", v)} />
        </SettingRow>
      </Section>

      {/* Security */}
      <Section title="Security" icon={Shield}>
        <SettingRow label="Two-Factor Authentication" description="Add an extra layer of security to your account">
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            {settings.twoFactor && (
              <span style={{ fontSize: 10, color: t.green, fontFamily: t.fontMono,
                background: `${t.green}15`, padding: "2px 8px", borderRadius: 6, fontWeight: 700 }}>ACTIVE</span>
            )}
            <Toggle value={settings.twoFactor} onChange={v => set("twoFactor", v)} color={t.green} />
          </div>
        </SettingRow>
        <SettingRow label="Session Timeout" description="Automatically log out after inactivity">
          <select value={settings.sessionTimeout} onChange={e => set("sessionTimeout", e.target.value)} style={inp}>
            {[["15","15 min"],["30","30 min"],["60","1 hour"],["240","4 hours"]].map(([v,l]) => <option key={v} value={v} style={{ background: t.bgSecondary }}>{l}</option>)}
          </select>
        </SettingRow>
        <SettingRow label="Data Retention" description="How long to store your activity history">
          <select value={settings.dataRetention} onChange={e => set("dataRetention", e.target.value)} style={inp}>
            {[["30","30 days"],["90","90 days"],["180","6 months"],["365","1 year"]].map(([v,l]) => <option key={v} value={v} style={{ background: t.bgSecondary }}>{l}</option>)}
          </select>
        </SettingRow>
      </Section>

      {/* Account info */}
      {user && (
        <Section title="Account" icon={Globe}>
          <SettingRow label="Email" description="Your registered email address">
            <span style={{ fontFamily: t.fontMono, fontSize: 12, color: t.textSub }}>{user.email}</span>
          </SettingRow>
          <SettingRow label="Plan" description="Your current subscription tier">
            <span style={{ fontFamily: t.fontDisplay, fontSize: 11, fontWeight: 800, color: t.accent,
              background: `${t.accent}18`, padding: "3px 10px", borderRadius: 8, border: `1px solid ${t.accent}30` }}>
              {user.plan}
            </span>
          </SettingRow>
          <SettingRow label="Language" description="Interface display language">
            <select value={settings.language} onChange={e => set("language", e.target.value)} style={inp}>
              {[["en","English"],["es","Español"],["fr","Français"],["de","Deutsch"],["ja","日本語"]].map(([v,l]) => (
                <option key={v} value={v} style={{ background: t.bgSecondary }}>{l}</option>
              ))}
            </select>
          </SettingRow>
        </Section>
      )}
    </div>
  );
}
