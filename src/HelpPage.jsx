import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, ChevronDown, ChevronRight, BookOpen, Zap,
  TrendingUp, Shield, Bell, Globe, Command, BarChart2,
  PlayCircle, Star, HelpCircle, MessageCircle, ExternalLink,
  CheckCircle, ArrowRight, Keyboard
} from "lucide-react";
import { useTheme } from "./ThemeContext";

const CATEGORIES = [
  {
    id: "gettingStarted", label: "Getting Started", icon: PlayCircle,
    articles: [
      { id: "gs1", title: "Your first trade — step by step", time: "3 min read", tags: ["beginner"],
        content: "Click any stock card on the Dashboard to open the Trade Story panel. Review the AI digest, analyst confidence gauge, and enter your amount at risk. The terminal auto-calculates shares and stop-loss. Click BUY or SELL — a 5-second countdown gives you time to cancel before execution." },
      { id: "gs2", title: "Understanding the ticker tape", time: "1 min read", tags: ["beginner"],
        content: "The scrolling bar at the top shows live price changes for all tracked instruments. Green arrows (▲) indicate gains, amber (▼) indicate losses. Prices update every 100ms via the data buffer system." },
      { id: "gs3", title: "Deep Sea vs Calm Mode — when to use each", time: "2 min read", tags: ["beginner", "ux"],
        content: "Deep Sea Mode is optimised for high-density data scanning — neon accents against dark navy let you spot changes instantly. Calm Mode uses warm bone tones and serif fonts to lower cognitive stress during volatile sessions. Switch via the sidebar or ⚡ stress banner that appears automatically." },
    ],
  },
  {
    id: "trading", label: "Trading Features", icon: TrendingUp,
    articles: [
      { id: "t1", title: "The Trade Story panel explained", time: "4 min read", tags: ["intermediate"],
        content: "Click any ticker to open the Trade Story drawer. It shows: (1) AI Digest — 3 bullet points summarising the latest 24h news; (2) Analyst Compass — a semicircle gauge showing Buy/Hold/Sell consensus; (3) Risk Calculator — enter your $ at risk and the terminal shows exact shares and stop-loss price." },
      { id: "t2", title: "5-second undo window", time: "1 min read", tags: ["beginner", "safety"],
        content: "Every order execution shows a 5-second countdown bar. Click 'Cancel' any time before it completes to abort the trade. This prevents fat-finger errors and panic trades. For orders above $5,000, the confirm button is replaced by a slide-to-confirm gesture." },
      { id: "t3", title: "Slide-to-confirm for large orders", time: "2 min read", tags: ["safety"],
        content: "When placing an order that exceeds $5,000 at risk, the BUY/SELL buttons are replaced by a horizontal slider. Drag right to confirm. This physical gesture prevents accidental executions and gives your brain a 'breathe' moment before committing capital." },
      { id: "t4", title: "Stop-loss auto-calculation", time: "2 min read", tags: ["risk"],
        content: "In the Risk Calculator, type your maximum dollar loss (e.g. $100). The terminal calculates: shares = $risk ÷ price, stop-loss = current price − $risk. A red line marker is shown on the chart at the stop-loss level. This risk-first approach reframes position sizing around capital preservation." },
    ],
  },
  {
    id: "navigation", label: "Navigation & Search", icon: Command,
    articles: [
      { id: "n1", title: "Command Palette (Ctrl+K)", time: "1 min read", tags: ["power-user"],
        content: "Press Ctrl+K (or ⌘K on Mac) to open the Command Palette from anywhere. Type a ticker symbol (e.g. AAPL) to instantly open its Trade Story. Type /focus to toggle Focus Mode, /news for Market Intelligence, /risk for Risk Panel, /anomalies for Anomaly Tracker. Hit Enter to select the first result." },
      { id: "n2", title: "Focus Mode — reducing information overload", time: "2 min read", tags: ["ux"],
        content: "Click 'Focus Mode' in the sidebar or top bar to collapse secondary panels and show only the most critical data. Useful during fast-moving market events when you need to act quickly without distractions. Use the button again to exit." },
      { id: "n3", title: "Sidebar navigation guide", time: "2 min read", tags: ["beginner"],
        content: "Dashboard: overview with charts, map, and watchlist. Performance: your portfolio P&L graphs by stock and timeframe. Reach: global market map. Alerts: anomaly tracker. Preferences: custom stock alerts. Docs: document vault. Help: this page. Settings: terminal configuration." },
    ],
  },
  {
    id: "alerts", label: "Alerts & Signals", icon: Bell,
    articles: [
      { id: "a1", title: "How Anomaly Tracker works", time: "3 min read", tags: ["intermediate"],
        content: "The system calculates rolling standard deviation for each instrument every 100ms. When a price move exceeds 2σ (two standard deviations), it appears in the Anomaly Tracker. At 2.5σ a toast notification appears. At 3.5σ it's marked 'Critical' with a red left-border. You can stop toast popups using the bell button in the notification bar." },
      { id: "a2", title: "Cross-asset ripple effect", time: "2 min read", tags: ["intermediate"],
        content: "When a commodity or macro instrument triggers an anomaly (e.g. Crude Oil WTI spikes), related stock cards get an amber glow border — the Ripple Effect. This bridges the cognitive gap between global events and your portfolio exposure. Oil → Airlines, BTC → Tech, EUR/USD → Commodities." },
      { id: "a3", title: "Setting custom stock alerts (Preferences)", time: "3 min read", tags: ["intermediate"],
        content: "Go to Preferences to create custom alerts for specific stocks. Set price thresholds, percentage change triggers, and volume spikes. Choose delivery: in-app toast, email, or SMS. Each alert can be muted individually without disabling all notifications." },
    ],
  },
  {
    id: "data", label: "Data & Performance", icon: BarChart2,
    articles: [
      { id: "d1", title: "Understanding the EKG pulse line", time: "1 min read", tags: ["technical"],
        content: "The thin animated line at the bottom of the screen is your System EKG. A healthy heartbeat-style wave means data is fresh and streaming normally. If the line flattens (flatline), your internet or server connection has been lost. An amber pulse means data lag exceeds 200ms — trade prices may be slightly stale." },
      { id: "d2", title: "Buffer & Batch Mode explained", time: "2 min read", tags: ["technical"],
        content: "Incoming market data is buffered in memory (not re-rendered) every 100ms, then flushed to the UI. During high-volume bursts (50+ messages), the system enters Batch Mode — it skips flash animations to maintain 60fps performance. You'll see 'BATCH MODE' in the top bar during these periods." },
      { id: "d3", title: "Performance page — reading your charts", time: "3 min read", tags: ["beginner"],
        content: "The Performance page shows each stock you've interacted with as a separate chart. Toggle between 1 Month, 5 Month, and 1 Year views. The search bar filters by ticker. Each chart shows the price curve, your entry point (if traded), and current P&L. The summary card at top shows your total portfolio return." },
    ],
  },
];

const TAG_COLORS = {
  beginner: "#4caf50",
  intermediate: "#2196f3",
  "power-user": "#ab47bc",
  technical: "#ff7043",
  ux: "#00bcd4",
  safety: "#ff9800",
  risk: "#f44336",
};

export function HelpPage() {
  const { theme: t } = useTheme();
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState({ gs1: true });
  const [activeCategory, setActiveCategory] = useState("all");

  const allArticles = CATEGORIES.flatMap(c => c.articles.map(a => ({ ...a, category: c.id, categoryLabel: c.label })));
  const filtered = allArticles.filter(a => {
    const matchCat = activeCategory === "all" || a.category === activeCategory;
    const matchSearch = !search || a.title.toLowerCase().includes(search.toLowerCase()) || a.tags.some(tg => tg.includes(search.toLowerCase()));
    return matchCat && matchSearch;
  });

  const toggleOpen = (id) => setOpen(prev => ({ ...prev, [id]: !prev[id] }));

  return (
    <div style={{
      margin: "40px auto",
      maxWidth: 1000,
      padding: "30px",
      background: t.glassStrong,
      backdropFilter: t.glassBlur,
      borderRadius: t.cardRadius * 2,
      border: `1px solid ${t.border}`,
      boxShadow: t.shadowFloat,
      display: "flex", gap: 30,
    }}>
      {/* Sidebar */}
      <div style={{ width: 220, flexShrink: 0, display: "flex", flexDirection: "column", gap: 8 }}>
        <div style={{ fontFamily: t.fontDisplay, fontSize: 10, fontWeight: 700, color: t.textDim,
          textTransform: "uppercase", letterSpacing: "0.1em", padding: "0 4px", marginBottom: 4 }}>
          Categories
        </div>
        <button onClick={() => setActiveCategory("all")}
          style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 12px", borderRadius: 9,
            border: "none", cursor: "pointer", textAlign: "left",
            background: activeCategory === "all" ? `${t.accent}18` : "transparent",
            borderLeft: `3px solid ${activeCategory === "all" ? t.accent : "transparent"}`,
            color: activeCategory === "all" ? t.accent : t.textSub,
            fontFamily: t.fontDisplay, fontSize: 12, fontWeight: activeCategory === "all" ? 700 : 400,
            transition: "all 0.15s" }}>
          <BookOpen size={14} />
          All Articles
          <span style={{ marginLeft: "auto", fontSize: 10, color: t.textDim }}>{allArticles.length}</span>
        </button>
        {CATEGORIES.map(cat => {
          const Icon = cat.icon;
          const isActive = activeCategory === cat.id;
          return (
            <button key={cat.id} onClick={() => setActiveCategory(cat.id)}
              style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 12px", borderRadius: 9,
                border: "none", cursor: "pointer", textAlign: "left",
                background: isActive ? `${t.accent}18` : "transparent",
                borderLeft: `3px solid ${isActive ? t.accent : "transparent"}`,
                color: isActive ? t.accent : t.textSub,
                fontFamily: t.fontDisplay, fontSize: 12, fontWeight: isActive ? 700 : 400,
                transition: "all 0.15s" }}>
              <Icon size={14} />
              {cat.label}
              <span style={{ marginLeft: "auto", fontSize: 10, color: t.textDim }}>{cat.articles.length}</span>
            </button>
          );
        })}

        {/* Keyboard shortcuts box */}
        <div style={{ marginTop: 16, background: t.glass, backdropFilter: "blur(8px)",
          borderRadius: 10, border: `1px solid ${t.border}`, padding: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
            <Keyboard size={12} color={t.accent} />
            <span style={{ fontSize: 11, fontWeight: 700, color: t.text, fontFamily: t.fontDisplay }}>Shortcuts</span>
          </div>
          {[["⌘K", "Command Palette"],["Esc", "Close panels"],["?", "This page"]].map(([key, label]) => (
            <div key={key} style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ fontSize: 10, fontFamily: t.fontMono, color: t.accent,
                background: `${t.accent}15`, padding: "2px 6px", borderRadius: 5 }}>{key}</span>
              <span style={{ fontSize: 10, color: t.textSub, fontFamily: t.fontDisplay }}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Main content */}
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 14 }}>
        {/* Header */}
        <div>
          <h2 style={{ fontFamily: t.fontDisplay, fontSize: 20, fontWeight: 800, color: t.text, marginBottom: 4 }}>
            Help & Documentation
          </h2>
          <p style={{ fontSize: 12, color: t.textSub, fontFamily: t.fontDisplay }}>
            {allArticles.length} articles covering all terminal features
          </p>
        </div>

        {/* Search */}
        <div style={{ position: "relative" }}>
          <Search size={14} color={t.textSub} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search help articles…"
            style={{ width: "100%", padding: "11px 12px 11px 36px", borderRadius: 11,
              background: t.glass, backdropFilter: "blur(8px)",
              border: `1px solid ${t.border}`, color: t.text,
              fontFamily: t.fontDisplay, fontSize: 13, outline: "none" }} />
        </div>

        {/* Articles */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {filtered.length === 0 ? (
            <div style={{ textAlign: "center", padding: "50px 0" }}>
              <HelpCircle size={36} color={t.textDim} style={{ margin: "0 auto 12px" }} />
              <div style={{ color: t.textSub, fontFamily: t.fontDisplay, fontSize: 14 }}>No articles match "{search}"</div>
            </div>
          ) : filtered.map((article, i) => {
            const isOpen = open[article.id];
            return (
              <motion.div key={article.id}
                initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                style={{ background: t.glass, backdropFilter: "blur(12px)",
                  borderRadius: 12, border: `1px solid ${t.border}`,
                  overflow: "hidden", boxShadow: t.shadow }}>
                <button onClick={() => toggleOpen(article.id)}
                  style={{ width: "100%", padding: "14px 16px", background: "none", border: "none",
                    cursor: "pointer", display: "flex", alignItems: "center", gap: 12, textAlign: "left" }}>
                  <div style={{ width: 28, height: 28, borderRadius: 8, background: `${t.accent}15`,
                    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <BookOpen size={13} color={t.accent} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: t.text, fontFamily: t.fontDisplay, marginBottom: 3 }}>
                      {article.title}
                    </div>
                    <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                      <span style={{ fontSize: 10, color: t.textDim, fontFamily: t.fontDisplay }}>{article.time}</span>
                      <span style={{ fontSize: 9, color: t.textDim }}>·</span>
                      <span style={{ fontSize: 10, color: t.textSub, fontFamily: t.fontDisplay }}>{article.categoryLabel}</span>
                      {article.tags.map(tag => (
                        <span key={tag} style={{ fontSize: 9, color: TAG_COLORS[tag] || t.textSub,
                          background: `${TAG_COLORS[tag] || t.textSub}15`,
                          padding: "1px 6px", borderRadius: 5, fontFamily: t.fontDisplay }}>
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                    <ChevronDown size={16} color={t.textSub} />
                  </motion.div>
                </button>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.22 }}>
                      <div style={{ padding: "0 16px 16px 56px", fontSize: 13, color: t.textSub,
                        fontFamily: t.name === "calm" ? t.fontSerif : t.fontDisplay,
                        lineHeight: 1.7, borderTop: `1px solid ${t.border}`, paddingTop: 12 }}>
                        {article.content}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>

        {/* Contact support */}
        <div style={{ background: `linear-gradient(135deg, ${t.accent}10, ${t.green}08)`,
          border: `1px solid ${t.accent}30`, borderRadius: 14, padding: "18px 20px",
          display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontFamily: t.fontDisplay, fontSize: 13, fontWeight: 700, color: t.text, marginBottom: 3 }}>
              Can't find what you need?
            </div>
            <div style={{ fontSize: 12, color: t.textSub, fontFamily: t.fontDisplay }}>
              Chat with the AI assistant or contact our support team
            </div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button style={{ padding: "8px 14px", borderRadius: 9, border: `1px solid ${t.accent}40`,
              background: `${t.accent}15`, color: t.accent, fontFamily: t.fontDisplay, fontSize: 12,
              fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
              <MessageCircle size={12} /> AI Chat
            </button>
            <button style={{ padding: "8px 14px", borderRadius: 9, border: `1px solid ${t.border}`,
              background: t.glass, color: t.textSub, fontFamily: t.fontDisplay, fontSize: 12,
              cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
              <ExternalLink size={12} /> Support
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
