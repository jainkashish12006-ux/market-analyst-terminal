import { createContext, useContext, useState, useCallback, useEffect } from "react";

export const THEMES = {
  deepSea: {
    name: "deepSea", // "Midnight Aurora" concept
    label: "Dark",

    // ── Backgrounds ──────────────────────────────────────────────────────
    bg: "#04050E",              // Deepest violet-infused black
    bgCard: "#0B0F19",          // Rich dark card
    bgSidebar: "#070A13",       // Deep sidebar
    bgSurface: "#0E1424",       // Panel surfaces with slight lift
    bgInput: "rgba(255, 255, 255, 0.03)",

    // ── Premium Glassmorphism ────────────────────────────────────────────
    glass: "rgba(11, 15, 25, 0.65)",    
    glassBorder: "rgba(255, 255, 255, 0.08)", // Softer edge
    glassBlur: "blur(32px)",            // Deep blur for premium feel
    glassStrong: "rgba(11, 15, 25, 0.85)",
    glassMid: "rgba(11, 15, 25, 0.75)",

    // ── Typography ────────────────────────────────────────────────────────
    text: "#F8FAFC",            // Brilliant white
    textSub: "#94A3B8",         // Cool, legible gray
    textDim: "#64748B",         // Deeper gray
    textMuted: "#475569",

    // ── Borders ──────────────────────────────────────────────────────────
    border: "rgba(255, 255, 255, 0.06)", // Extremely subtle structure lines
    borderAccent: "rgba(0, 240, 255, 0.3)", // Cyber cyan accent line
    borderHover: "rgba(255, 255, 255, 0.12)",

    // ── Accent palette ───────────────────────────────────────────────────
    accent: "#00F0FF",          // Neon Cyan
    accentDim: "rgba(0, 240, 255, 0.12)",
    accentGlow: "0 0 12px rgba(0, 240, 255, 0.4)",
    accentGlowStrong: "0 0 24px rgba(0, 240, 255, 0.6)",
    
    green: "#10B981",           // Vibrant Emerald
    greenGlow: "0 0 12px rgba(16, 185, 129, 0.4)",
    
    amber: "#F59E0B",           // Bright Amber
    amberGlow: "0 0 12px rgba(245, 158, 11, 0.4)",
    
    red: "#F43F5E",             // Vibrant Rose/Red
    redGlow: "0 0 12px rgba(244, 63, 94, 0.4)",

    // ── Fonts ─────────────────────────────────────────────────────────────
    fontMono: "'JetBrains Mono', 'IBM Plex Mono', monospace",
    fontUI: "'Inter', sans-serif",
    fontDisplay: "'Outfit', 'Inter', sans-serif",
    fontSerif: "'Playfair Display', serif",

    // ── Shadows ──────────────────────────────────────────────────────────
    shadow: "0 4px 24px rgba(0, 0, 0, 0.4)",
    shadowCard: "0 8px 32px rgba(0, 0, 0, 0.5)",
    shadowGlow: "0 0 40px rgba(0, 240, 255, 0.15)", // Ambient glow
    shadowFloat: "0 12px 48px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255,255,255,0.05)",

    // ── Nav ───────────────────────────────────────────────────────────────
    navBg: "rgba(4, 5, 14, 0.8)",
    tickerBg: "#04050E",

    // ── Misc ─────────────────────────────────────────────────────────────
    cardRadius: 12,             // Modern rounded corners
    surface: "#111827",
    bgSecondary: "#0B0F19",
  },

  calm: {
    name: "calm", // "Pearl" concept
    label: "Light",

    // ── Backgrounds ──────────────────────────────────────────────────────
    bg: "#F4F6F8",              // Cool, crisp gray
    bgCard: "#FFFFFF",
    bgSidebar: "#F8FAFC",
    bgSurface: "#FFFFFF",
    bgInput: "rgba(0, 0, 0, 0.03)",

    // ── Solid Colors (Replacing Glassmorphism) ────────────────────────────
    glass: "rgba(255, 255, 255, 0.8)",
    glassBorder: "rgba(0, 0, 0, 0.06)",
    glassBlur: "blur(24px)",
    glassStrong: "rgba(255, 255, 255, 0.95)",
    glassMid: "rgba(255, 255, 255, 0.85)",

    // ── Typography ────────────────────────────────────────────────────────
    text: "#0F172A",
    textSub: "#475569",
    textDim: "#94A3B8",
    textMuted: "#CBD5E1",

    // ── Borders ──────────────────────────────────────────────────────────
    border: "rgba(0, 0, 0, 0.06)", // Soft dividing lines
    borderAccent: "rgba(37, 99, 235, 0.2)",
    borderHover: "rgba(0, 0, 0, 0.12)",

    // ── Accent palette ───────────────────────────────────────────────────
    accent: "#2563EB",          // Royal blue
    accentDim: "rgba(37, 99, 235, 0.08)",
    accentGlow: "0 4px 14px rgba(37, 99, 235, 0.3)",
    accentGlowStrong: "0 8px 24px rgba(37, 99, 235, 0.4)",
    
    green: "#059669",           // Deeper emerald for readability
    greenGlow: "0 4px 12px rgba(5, 150, 105, 0.2)",
    
    amber: "#D97706",
    amberGlow: "0 4px 12px rgba(217, 119, 6, 0.2)",
    
    red: "#E11D48",             // Rose
    redGlow: "0 4px 12px rgba(225, 29, 72, 0.2)",

    // ── Fonts ─────────────────────────────────────────────────────────────
    fontMono: "'JetBrains Mono', 'IBM Plex Mono', monospace",
    fontUI: "'Inter', sans-serif",
    fontDisplay: "'Outfit', 'Inter', sans-serif",
    fontSerif: "'Playfair Display', serif",

    // ── Shadows ──────────────────────────────────────────────────────────
    shadow: "0 2px 8px rgba(15, 23, 42, 0.04)",
    shadowCard: "0 8px 24px rgba(15, 23, 42, 0.06)",
    shadowGlow: "0 8px 32px rgba(37, 99, 235, 0.1)",
    shadowFloat: "0 16px 48px rgba(15, 23, 42, 0.08), 0 0 0 1px rgba(0,0,0,0.02)",

    // ── Nav ───────────────────────────────────────────────────────────────
    navBg: "rgba(248, 250, 252, 0.9)",
    tickerBg: "#F4F6F8",

    // ── Misc ─────────────────────────────────────────────────────────────
    cardRadius: 10,
    surface: "#FFFFFF",
    bgSecondary: "#F8FAFC",
  },
};

const Ctx = createContext(null);

export function ThemeProvider({ children }) {
  const [mode, setMode] = useState("deepSea");
  const [fading, setFading] = useState(false);
  const theme = THEMES[mode];

  const toggle = useCallback(() => {
    setFading(true);
    setTimeout(() => {
      setMode(m => m === "deepSea" ? "calm" : "deepSea");
      setFading(false);
    }, 200);
  }, []);

  useEffect(() => {
    // Inject global styles for the app background, fonts, default transitions over .45s, scrollbar, etc.
    const styleTagId = "theme-global-styles";
    let styleTag = document.getElementById(styleTagId);

    if (!styleTag) {
      styleTag = document.createElement("style");
      styleTag.id = styleTagId;
      document.head.appendChild(styleTag);
    }

    const rawCSS = `
      * { box-sizing: border-box; }
      body {
        margin: 0; padding: 0;
        background-color: ${theme.bg};
        color: ${theme.text};
        font-family: ${theme.fontUI};
        transition: background-color 0.45s ease, color 0.45s ease;
      }
      div, span, button, p {
        transition: background 0.45s ease, color 0.45s ease, border-color 0.45s ease, box-shadow 0.45s ease;
      }
      a { text-decoration: none; color: inherit; }
    `;
    styleTag.innerHTML = rawCSS;
  }, [theme]); // Re-run effect when theme changes

  return (
    <Ctx.Provider value={{ theme: theme, mode, toggle, fading }}>
      {children}
    </Ctx.Provider>
  );
}

export const useTheme = () => useContext(Ctx);
