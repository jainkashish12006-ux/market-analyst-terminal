import { createContext, useContext, useState, useCallback, useEffect } from "react";

export const THEMES = {
  deepSea: {
    name: "deepSea",
    label: "Dark",

    // ── Backgrounds ──────────────────────────────────────────────────────
    bg: "#020617",              // Deepest midnight blue
    bgCard: "#0F172A",          // Slate blue for cards
    bgSidebar: "#020617",       // Matching background
    bgSurface: "#0A0F1F",       // Panel surfaces
    bgInput: "rgba(255,255,255,0.04)",

    // ── Premium Glassmorphism ────────────────────────────────────────────
    glass: "rgba(255, 255, 255, 0.65)",    // Opaque glass
    glassBorder: "rgba(255, 255, 255, 0.5)",
    glassBlur: "blur(28px)",
    glassStrong: "rgba(255, 255, 255, 0.85)",
    glassMid: "rgba(255, 255, 255, 0.75)",

    // ── Typography ────────────────────────────────────────────────────────
    text: "#EDEDED",            // High contrast white
    textSub: "#A1A1AA",         // Muted gray
    textDim: "#71717A",         // Dimmer gray
    textMuted: "#52525B",

    // ── Borders ──────────────────────────────────────────────────────────
    border: "rgba(255,255,255,0.1)", // Crisp subtle line
    borderAccent: "rgba(255,255,255,0.2)",
    borderHover: "rgba(255,255,255,0.15)",

    // ── Accent palette ───────────────────────────────────────────────────
    accent: "#3B82F6",          // Vibrant blue
    accentDim: "rgba(59, 130, 246, 0.1)",
    accentGlow: "transparent",
    accentGlowStrong: "transparent",
    green: "#10B981",           // Emerald green (Tailwind style)
    greenGlow: "transparent",
    amber: "#F59E0B",           // Amber
    amberGlow: "transparent",
    red: "#EF4444",             // Red
    redGlow: "transparent",

    // ── Fonts ─────────────────────────────────────────────────────────────
    fontMono: "'IBM Plex Mono', 'JetBrains Mono', monospace",
    fontUI: "'Inter', sans-serif",
    fontDisplay: "'Inter', sans-serif",
    fontSerif: "'Playfair Display', serif",

    // ── Shadows ──────────────────────────────────────────────────────────
    shadow: "0 1px 3px rgba(0,0,0,0.4)",
    shadowCard: "none",
    shadowGlow: "none",
    shadowFloat: "0 4px 12px rgba(0,0,0,0.6)",

    // ── Nav ───────────────────────────────────────────────────────────────
    navBg: "#020617",
    tickerBg: "#020617",

    // ── Misc ─────────────────────────────────────────────────────────────
    cardRadius: 8,              // Sleeker edges
    surface: "#1E293B",
    bgSecondary: "#0F172A",
  },

  calm: {
    name: "calm",
    label: "Light",

    // ── Backgrounds ──────────────────────────────────────────────────────
    bg: "#FAFAFA",
    bgCard: "#FFFFFF",
    bgSidebar: "#F4F4F5",
    bgSurface: "#FFFFFF",
    bgInput: "rgba(0,0,0,0.04)",

    // ── Solid Colors (Replacing Glassmorphism) ────────────────────────────
    glass: "#FFFFFF",
    glassBorder: "rgba(0,0,0,0.08)",
    glassBlur: "none",
    glassStrong: "#FFFFFF",
    glassMid: "#FAFAFA",

    // ── Typography ────────────────────────────────────────────────────────
    text: "#09090B",
    textSub: "#71717A",
    textDim: "#A1A1AA",
    textMuted: "#D4D4D8",

    // ── Borders ──────────────────────────────────────────────────────────
    border: "rgba(0,0,0,0.08)",
    borderAccent: "rgba(0,0,0,0.15)",
    borderHover: "rgba(0,0,0,0.12)",

    // ── Accent palette ───────────────────────────────────────────────────
    accent: "#2563EB",          // Deep blue for light theme
    accentDim: "rgba(37, 99, 235, 0.08)",
    accentGlow: "transparent",
    accentGlowStrong: "transparent",
    green: "#10B981",
    greenGlow: "transparent",
    amber: "#F59E0B",
    amberGlow: "transparent",
    red: "#EF4444",
    redGlow: "transparent",

    // ── Fonts ─────────────────────────────────────────────────────────────
    fontMono: "'IBM Plex Mono', 'JetBrains Mono', monospace",
    fontUI: "'Inter', sans-serif",
    fontDisplay: "'Inter', sans-serif",
    fontSerif: "'Playfair Display', serif",

    // ── Shadows ──────────────────────────────────────────────────────────
    shadow: "0 1px 2px rgba(0,0,0,0.05)",
    shadowCard: "none",
    shadowGlow: "none",
    shadowFloat: "0 4px 12px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.04)",

    // ── Nav ───────────────────────────────────────────────────────────────
    navBg: "#F4F4F5",
    tickerBg: "#FAFAFA",

    // ── Misc ─────────────────────────────────────────────────────────────
    cardRadius: 6,
    surface: "#FFFFFF",
    bgSecondary: "#F4F4F5",
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
