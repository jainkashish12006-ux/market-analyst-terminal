import { useState } from "react";
import { motion } from "framer-motion";
import {
  LayoutDashboard, TrendingUp, Globe, Filter, Bell,
  Settings2, FileText, HelpCircle, LogOut,
  Zap, Sun, Moon, Eye, EyeOff, User, Search
} from "lucide-react";
import { useTheme } from "./ThemeContext";
import { useAuth } from "./AuthContext";

// Crypto list for the mini sidebar footer ticker
const CRYPTO_TICKERS = ["BTC: 67,400", "ETH: 3,420", "SOL: 145.2", "DOGE: 0.16"];

const NAV_ITEMS = [
  { section: "DASHBOARDS" },
  { id: "dashboard",   icon: LayoutDashboard, label: "Overview" },
  { id: "performance", icon: TrendingUp,       label: "Performance" },
  { id: "reach",       icon: Globe,            label: "Global Reach" },
  { id: "funnel",      icon: Filter,           label: "Scanner" },
  { id: "alerts",      icon: Bell,             label: "Alerts" },
  { section: "SETTINGS" },
  { id: "preferences", icon: Settings2,        label: "Preferences" },
  { id: "settings",    icon: Settings2,        label: "Account Settings" },
  { section: "RESOURCES" },
  { id: "docs",        icon: FileText,         label: "Docs" },
  { id: "help",        icon: HelpCircle,       label: "Help Centre" },
];

function NavButton({ item, isActive, badge, onClick }) {
  const { theme: t } = useTheme();
  const [hovered, setHovered] = useState(false);
  const Icon = item.icon;

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: "100%", height: 38,
        borderRadius: 8,
        border: "none",
        cursor: "pointer",
        background: isActive
          ? `${t.accent}15`
          : hovered
            ? `${t.accent}05`
            : "transparent",
        display: "flex", alignItems: "center", gap: 12,
        padding: "0 14px",
        transition: "all 0.18s",
        position: "relative",
        marginBottom: 4,
      }}>
      {isActive && (
        <div style={{
          position: "absolute", left: -10, top: "50%", transform: "translateY(-50%)",
          width: 3, height: 18, borderRadius: 2,
          background: t.accent,
        }} />
      )}
      <Icon size={16} color={isActive ? t.accent : hovered ? t.textSub : t.textDim} />
      <span style={{ 
        fontFamily: t.fontUI, fontSize: 13, fontWeight: isActive ? 600 : 500,
        color: isActive ? t.text : hovered ? t.textSub : t.textDim,
      }}>
        {item.label}
      </span>
      {badge > 0 && (
        <div style={{
          marginLeft: "auto",
          background: t.accent,
          color: "#fff",
          fontSize: 10,
          fontFamily: t.fontUI,
          fontWeight: 700,
          padding: "2px 6px",
          borderRadius: 10,
        }}>
          {badge}
        </div>
      )}
    </button>
  );
}

export function Sidebar({ active, setActive, alertCount, focusMode, setFocusMode, onAuthClick, onCmdK }) {
  const { theme: t, mode, toggle } = useTheme();
  const { user, logout } = useAuth();
  
  if (focusMode) {
    return (
      <button onClick={() => setFocusMode(false)} style={{
        position: "fixed", top: 16, left: 16, zIndex: 1000,
        width: 40, height: 40, borderRadius: 10, background: t.glass, backdropFilter: t.glassBlur,
        border: `1px solid ${t.border}`, display: "flex", alignItems: "center", justifyContent: "center",
        cursor: "pointer", boxShadow: t.shadowFloat
      }}>
        <EyeOff size={16} color={t.textDim} />
      </button>
    );
  }

  return (
    <div style={{
      width: 250, flexShrink: 0, height: "100vh",
      borderRight: `1px solid ${t.border}`,
      backdropFilter: t.glassBlur,
      background: t.glassStrong,
      display: "flex", flexDirection: "column",
      paddingTop: 16,
      position: "relative",
      zIndex: 10,
    }}>
      {/* User Profile / Logo Header */}
      <div style={{ padding: "0 16px", marginBottom: 20, display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{
          width: 32, height: 32, borderRadius: 8,
          background: `linear-gradient(135deg, ${t.accent}, ${t.accentSecondary || '#4facfe'})`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontFamily: t.fontUI, fontSize: 12, fontWeight: 800, color: "#fff",
          flexShrink: 0,
        }}>
          {user ? user.avatar : <Zap size={15} color="#fff" />}
        </div>
        <div style={{ display: "flex", flexDirection: "column", minWidth: 0, overflow: "hidden" }}>
          <span style={{ fontFamily: t.fontUI, fontSize: 13, fontWeight: 700, color: t.text, whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden" }}>
            {user ? user.name : "Guest User"}
          </span>
          <span style={{ fontFamily: t.fontUI, fontSize: 11, color: t.textDim, whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden" }}>
            {user ? "Premium Member" : "OMNI Terminal"}
          </span>
        </div>
      </div>

      {/* Search Bar */}
      <div style={{ padding: "0 16px", marginBottom: 20 }}>
        <button
          onClick={onCmdK}
          style={{
            width: "100%", height: 38,
            background: t.name === "deepSea" ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)",
            border: `1px solid ${t.border}`, borderRadius: 8,
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "0 12px", cursor: "pointer", transition: "all 0.2s"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Search size={14} color={t.textDim} />
            <span style={{ fontFamily: t.fontUI, fontSize: 13, color: t.textDim }}>Search...</span>
          </div>
          <span style={{ fontFamily: t.fontMono, fontSize: 10, color: t.textDim, background: t.bg, border: `1px solid ${t.border}`, padding: "2px 6px", borderRadius: 4 }}>⌘K</span>
        </button>
      </div>

      {/* Nav items */}
      <div style={{
        flex: 1, overflowY: "auto", overflowX: "hidden",
        display: "flex", flexDirection: "column",
        padding: "0 16px",
      }}>
        {NAV_ITEMS.map((item, i) => {
          if (item.section) {
            return (
              <div key={`sec-${i}`} style={{
                fontSize: 10, fontWeight: 700, fontFamily: t.fontUI, color: t.textDim,
                letterSpacing: "0.05em", marginTop: i === 0 ? 0 : 16, marginBottom: 8, paddingLeft: 14
              }}>
                {item.section}
              </div>
            );
          }
          return (
            <NavButton
              key={item.id}
              item={item}
              isActive={active === item.id}
              badge={item.id === "alerts" ? alertCount : 0}
              onClick={() => setActive(item.id)}
            />
          );
        })}
      </div>

      {/* Footer Controls */}
      <div style={{
        padding: "16px",
        borderTop: `1px solid ${t.border}`,
        display: "flex", flexDirection: "column", gap: 12
      }}>
        <div style={{ display: "flex", gap: 8, justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={() => setFocusMode(true)}
              title="Focus Mode"
              style={{
                width: 32, height: 32, borderRadius: 8, border: "none", cursor: "pointer",
                background: "transparent",
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "background 0.18s", border: `1px solid ${t.border}`
              }}>
              <Eye size={14} color={t.textSub} />
            </button>
            <div
              onClick={toggle}
              style={{
                width: 54, height: 32, borderRadius: 16, cursor: "pointer",
                background: mode === "deepSea" ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)",
                border: `1px solid ${t.border}`, padding: 3,
                display: "flex", alignItems: "center", position: "relative"
              }}>
              <motion.div
                animate={{ x: mode === "deepSea" ? 2 : 24 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                style={{
                  width: 24, height: 24, borderRadius: 12,
                  background: t.accent, display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.2)"
                }}>
                {mode === "deepSea" ? <Moon size={12} color="#fff" /> : <Sun size={12} color="#fff" />}
              </motion.div>
            </div>
          </div>

          {/* Auth / Logout */}
          {user ? (
            <button
              onClick={logout}
              title="Log Out"
              style={{
                height: 32, padding: "0 10px", borderRadius: 8, cursor: "pointer",
                background: `${t.red}15`, color: t.red, border: `1px solid ${t.border}`,
                display: "flex", alignItems: "center", gap: 6, fontFamily: t.fontUI, fontSize: 11, fontWeight: 600
              }}>
              <LogOut size={12} />
            </button>
          ) : (
            <button
              onClick={onAuthClick}
              style={{
                height: 32, padding: "0 12px", borderRadius: 8, cursor: "pointer",
                background: t.accent, color: "#fff", border: "none",
                display: "flex", alignItems: "center", gap: 6, fontFamily: t.fontUI, fontSize: 11, fontWeight: 600
              }}>
              <User size={12} /> <span>Log In</span>
            </button>
          )}
        </div>

        {/* Live Crypto Marquee */}
        <div style={{
          overflow: "hidden", display: "flex", whiteSpace: "nowrap",
          border: `1px solid ${t.border}`, borderRadius: 6, padding: "6px 0",
          background: "rgba(0,0,0,0.2)"
        }}>
          <motion.div
            animate={{ x: ["0%", "-50%"] }}
            transition={{ ease: "linear", duration: 15, repeat: Infinity }}
            style={{ display: "flex", gap: 16, paddingLeft: 16 }}>
            {[...CRYPTO_TICKERS, ...CRYPTO_TICKERS].map((c, idx) => (
              <span key={idx} style={{ fontFamily: t.fontMono, fontSize: 10, color: t.textDim, fontWeight: 600 }}>
                {c.split(":")[0]}: <span style={{ color: t.green }}>{c.split(":")[1]}</span>
              </span>
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
