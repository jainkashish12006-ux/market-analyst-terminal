import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence, useMotionValue, useSpring } from "framer-motion";
import { TrendingUp, TrendingDown, ArrowRight, Zap, Shield, Activity, Globe, ChevronDown, Play } from "lucide-react";

// ── Simulated live tickers ────────────────────────────────────────────────────
const TICKERS = [
  { sym: "AAPL", name: "Apple", base: 189.5 },
  { sym: "NVDA", name: "NVIDIA", base: 875.4 },
  { sym: "MSFT", name: "Microsoft", base: 415.2 },
  { sym: "TSLA", name: "Tesla", base: 248.6 },
  { sym: "BTC",  name: "Bitcoin", base: 67400 },
  { sym: "GOOGL",name: "Alphabet", base: 178.9 },
];

function useLivePrices() {
  const [prices, setPrices] = useState(() =>
    Object.fromEntries(TICKERS.map(t => [t.sym, { price: t.base, change: 0, prev: t.base }]))
  );
  useEffect(() => {
    const iv = setInterval(() => {
      setPrices(prev => {
        const next = { ...prev };
        TICKERS.forEach(t => {
          const drift = (Math.random() - 0.492) * 0.008;
          const newPrice = prev[t.sym].price * (1 + drift);
          const change = (newPrice - t.base) / t.base;
          next[t.sym] = { price: newPrice, change, prev: prev[t.sym].price };
        });
        return next;
      });
    }, 900);
    return () => clearInterval(iv);
  }, []);
  return prices;
}

// ── Minimalist Button ─────────────────────────────────────────────────────────
function PrimaryButton({ children, onClick, style = {} }) {
  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.98 }}
      whileHover={{ scale: 1.02 }}
      style={{
        padding: "12px 24px",
        borderRadius: 8,
        background: "linear-gradient(135deg, #3B82F6, #1D4ED8)",
        color: "#FFFFFF",
        border: "none",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        gap: 8,
        fontFamily: "'Inter', sans-serif",
        fontSize: 14,
        fontWeight: 600,
        boxShadow: "0 4px 14px rgba(59, 130, 246, 0.4)",
        ...style
      }}>
      {children}
    </motion.button>
  );
}

function SecondaryButton({ children, onClick, style = {} }) {
  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.98 }}
      whileHover={{ backgroundColor: "rgba(255,255,255,0.08)" }}
      style={{
        padding: "12px 24px",
        borderRadius: 6,
        background: "transparent",
        color: "#EDEDED",
        border: "1px solid rgba(255,255,255,0.2)",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        gap: 8,
        fontFamily: "'Inter', sans-serif",
        fontSize: 14,
        fontWeight: 500,
        transition: "background 0.2s",
        ...style
      }}>
      {children}
    </motion.button>
  );
}

// ── Animated number ───────────────────────────────────────────────────────────
function FlashNumber({ value, decimals = 2, prevValue }) {
  const [flash, setFlash] = useState(null);
  useEffect(() => {
    if (prevValue === undefined || prevValue === value) return;
    setFlash(value > prevValue ? "up" : "down");
    const t = setTimeout(() => setFlash(null), 400);
    return () => clearTimeout(t);
  }, [value, prevValue]);

  const color = flash === "up" ? "#10B981" : flash === "down" ? "#EF4444" : "#EDEDED";
  return (
    <span style={{
      fontFamily: "'IBM Plex Mono', monospace",
      color, transition: "color 400ms ease",
      fontWeight: 500,
    }}>
      {value > 100 ? value.toFixed(decimals) : value.toFixed(4)}
    </span>
  );
}

// ── Mini sparkline SVG ────────────────────────────────────────────────────────
function MiniSpark({ history, color, w = 60, h = 24 }) {
  if (history.length < 2) return null;
  const min = Math.min(...history), max = Math.max(...history), rng = max - min || 1;
  const pts = history.map((v, i) => `${(i / (history.length - 1)) * w},${h - ((v - min) / rng) * h}`).join(" ");
  return (
    <svg width={w} height={h} style={{ overflow: "visible" }}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth={1.5} strokeLinejoin="round" />
      <circle cx={(history.length - 1) / (history.length - 1) * w} cy={h - ((history[history.length - 1] - min) / rng) * h} r={2.5} fill={color} />
    </svg>
  );
}

// ── Live ticker card ──────────────────────────────────────────────────────────
function TickerCard({ sym, name, data }) {
  const [history, setHistory] = useState([data.price]);
  useEffect(() => {
    setHistory(h => [...h.slice(-20), data.price]);
  }, [data.price]);

  const up = data.change >= 0;
  const color = up ? "#10B981" : "#EF4444";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        background: "#0A0A0A",
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: 6,
        padding: "16px 18px",
        display: "flex", flexDirection: "column", gap: 10,
        minWidth: 160,
      }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, fontWeight: 600,
            color: "#EDEDED", letterSpacing: "0.02em" }}>
            {sym}
          </div>
          <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: "#71717A", marginTop: 2 }}>
            {name}
          </div>
        </div>
        <div style={{
          fontSize: 10, fontFamily: "'IBM Plex Mono', monospace", fontWeight: 500,
          color: color,
          background: up ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)",
          padding: "3px 6px", borderRadius: 4,
          display: "flex", alignItems: "center", gap: 3,
        }}>
          {up ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
          {(Math.abs(data.change) * 100).toFixed(2)}%
        </div>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginTop: 4 }}>
        <div style={{ fontSize: 16, fontWeight: 500 }}>
          <FlashNumber value={data.price} decimals={data.price > 100 ? 2 : 4} prevValue={data.prev} />
        </div>
        <MiniSpark history={history} color={color} />
      </div>
    </motion.div>
  );
}

// ── Feature card ──────────────────────────────────────────────────────────────
function FeatureCard({ icon: Icon, title, desc, delay }) {
  const [hov, setHov] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.4 }}
      onHoverStart={() => setHov(true)}
      onHoverEnd={() => setHov(false)}
      style={{
        background: hov ? "#111111" : "#0A0A0A",
        border: `1px solid ${hov ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.08)"}`,
        borderRadius: 8,
        padding: "24px",
        cursor: "default",
        transition: "all 0.2s ease",
      }}>
      <div style={{
        width: 40, height: 40, borderRadius: 6,
        background: "rgba(255,255,255,0.05)",
        border: `1px solid rgba(255,255,255,0.1)`,
        display: "flex", alignItems: "center", justifyContent: "center",
        marginBottom: 16,
      }}>
        <Icon size={18} color="#EDEDED" />
      </div>
      <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 15, fontWeight: 600,
        color: "#EDEDED", marginBottom: 8 }}>
        {title}
      </div>
      <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: "#A1A1AA",
        lineHeight: 1.6 }}>
        {desc}
      </div>
    </motion.div>
  );
}

// ── Stats counter ─────────────────────────────────────────────────────────────
function CountUp({ target, suffix = "", decimals = 0 }) {
  const [val, setVal] = useState(0);
  const [inView, setInView] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setInView(true); }, { threshold: 0.3 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const step = target / 60;
    const iv = setInterval(() => {
      start = Math.min(start + step, target);
      setVal(start);
      if (start >= target) clearInterval(iv);
    }, 16);
    return () => clearInterval(iv);
  }, [inView, target]);

  return (
    <span ref={ref} style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
      {decimals > 0 ? val.toFixed(decimals) : Math.round(val).toLocaleString()}{suffix}
    </span>
  );
}

// ── GLOBAL STYLES ─────────────────────────────────────────────────────────────
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=Inter:wght@400;500;600;700&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html { scroll-behavior: smooth; }
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: #000; }
  ::-webkit-scrollbar-thumb { background: #333; border-radius: 2px; }
`;

// ── LANDING PAGE ──────────────────────────────────────────────────────────────
export const LandingPage = ({ onEnter }) => {
  const prices = useLivePrices();
  const [scrolled, setScrolled] = useState(false);
  const heroRef = useRef(null);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const NAV_LINKS = ["Features", "Markets", "Pricing", "Docs"];

  return (
    <div style={{
      minHeight: "100vh",
      background: "radial-gradient(ellipse at top, #0f172a 0%, #020617 100%)",
      color: "#F8FAFC",
      fontFamily: "'Inter', sans-serif",
      overflowX: "hidden",
      position: "relative",
    }}>
      <style>{CSS}</style>

      {/* Animated Deep Blue Glow Orbs Behind Content */}
      <motion.div
        animate={{ opacity: [0.3, 0.6, 0.3], scale: [1, 1.1, 1], rotate: [0, 90, 0] }}
        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        style={{
          position: "absolute", top: "10%", left: "40%", width: "60vw", height: "60vw",
          background: "radial-gradient(circle, rgba(59,130,246,0.15) 0%, transparent 60%)",
          transform: "translate(-50%, -50%)", pointerEvents: "none", filter: "blur(60px)", zIndex: 0
        }}
      />

      {/* ── STICKY NAV ── */}
      <motion.nav
        animate={{ background: scrolled ? "rgba(0,0,0,0.8)" : "rgba(0,0,0,0)" }}
        transition={{ duration: 0.2 }}
        style={{
          position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
          backdropFilter: scrolled ? "blur(12px)" : "none",
          borderBottom: scrolled ? "1px solid rgba(255,255,255,0.1)" : "1px solid transparent",
          height: 56,
          display: "flex", alignItems: "center",
          padding: "0 max(24px, calc((100vw - 1160px) / 2))",
          transition: "border-color 0.2s",
        }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginRight: "auto" }}>
          <div style={{
            width: 24, height: 24, borderRadius: 4,
            background: "#EDEDED",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Zap size={14} color="#000" />
          </div>
          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, fontWeight: 700,
            letterSpacing: "0.02em", color: "#EDEDED" }}>
            OMNI
          </span>
        </div>

        {/* Links */}
        <div style={{ display: "flex", gap: 32, alignItems: "center" }}>
          {NAV_LINKS.map(l => (
            <a key={l} href="#" style={{
              fontFamily: "'Inter', sans-serif", fontSize: 13, fontWeight: 500,
              color: "#A1A1AA", textDecoration: "none",
              transition: "color 0.2s",
            }}
            onMouseEnter={e => e.target.style.color = "#EDEDED"}
            onMouseLeave={e => e.target.style.color = "#A1A1AA"}>
              {l}
            </a>
          ))}
          <PrimaryButton onClick={onEnter} style={{ padding: "8px 16px", fontSize: 12 }}>
            Launch Terminal
          </PrimaryButton>
        </div>
      </motion.nav>

      {/* ── HERO ── */}
      <section ref={heroRef} style={{
        minHeight: "100vh",
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        padding: "80px 24px 60px",
        position: "relative",
      }}>
        {/* Subtle dot matrix background */}
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          backgroundImage: "radial-gradient(rgba(255,255,255,0.1) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
          maskImage: "radial-gradient(ellipse 70% 50% at 50% 50%, black 0%, transparent 100%)",
          WebkitMaskImage: "radial-gradient(ellipse 70% 50% at 50% 50%, black 0%, transparent 100%)",
        }} />

        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 100, padding: "6px 14px",
            marginBottom: 32,
            zIndex: 1,
          }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#10B981" }} />
          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: "#EDEDED",
            fontWeight: 500, letterSpacing: "0.02em" }}>
            Terminal v2.0 is live
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: "clamp(40px, 6vw, 72px)",
            fontWeight: 700, lineHeight: 1.05,
            textAlign: "center",
            letterSpacing: "-0.03em",
            maxWidth: 800,
            marginBottom: 20,
            zIndex: 1,
          }}>
          Professional market intelligence.
          <br/>
          Zero compromises.
        </motion.h1>

        {/* Subhead */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: "clamp(16px, 2vw, 20px)",
            fontWeight: 400,
            color: "#A1A1AA",
            textAlign: "center",
            maxWidth: 580,
            lineHeight: 1.6,
            marginBottom: 44,
            zIndex: 1,
          }}>
          Trade with unparalleled precision. The terminal built by and for professionals who demand speed, clarity, and powerful abstractions over market noise.
        </motion.p>

        {/* CTA pair */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          style={{ display: "flex", gap: 16, alignItems: "center", marginBottom: 72, zIndex: 1 }}>
          <PrimaryButton onClick={onEnter}>
            Open Terminal <ArrowRight size={15} />
          </PrimaryButton>
          <SecondaryButton>
            <Play size={13} />
            Watch demo
          </SecondaryButton>
        </motion.div>

        {/* Live ticker grid */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 12,
            width: "100%",
            maxWidth: 640,
            zIndex: 1,
          }}>
          {TICKERS.slice(0, 6).map((t, i) => (
            <TickerCard key={t.sym} sym={t.sym} name={t.name} data={prices[t.sym] || { price: t.base, change: 0, prev: t.base }} />
          ))}
        </motion.div>
      </section>

      {/* ── STATS STRIP ── */}
      <section style={{
        borderTop: "1px solid rgba(255,255,255,0.1)",
        borderBottom: "1px solid rgba(255,255,255,0.1)",
        background: "#050505",
        padding: "40px max(24px, calc((100vw - 1160px) / 2))",
      }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 0,
          maxWidth: 1160, margin: "0 auto",
        }}>
          {[
            { val: 2400000, suf: "+", label: "Trades analysed daily", dec: 0 },
            { val: 99.99, suf: "%", label: "Uptime SLA", dec: 2 },
            { val: 16, suf: " markets", label: "Live assets tracked", dec: 0 },
            { val: 32, suf: "ms", label: "Average latency", dec: 0 },
          ].map((s, i) => (
             <div key={i} style={{
              textAlign: "center", padding: "0 24px",
              borderRight: i < 3 ? "1px solid rgba(255,255,255,0.1)" : "none",
            }}>
              <div style={{ fontSize: "clamp(24px, 4vw, 36px)", fontWeight: 600, color: "#EDEDED",
                marginBottom: 6 }}>
                <CountUp target={s.val} suffix={s.suf} decimals={s.dec} />
              </div>
              <div style={{ fontSize: 13, color: "#71717A",
                fontFamily: "'Inter', sans-serif", fontWeight: 400 }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section style={{
        padding: "100px max(24px, calc((100vw - 1160px) / 2))",
        background: "#000000",
      }}>
        <div style={{ maxWidth: 1160, margin: "0 auto" }}>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            style={{ textAlign: "center", marginBottom: 64 }}>
            <h2 style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: "clamp(28px, 4vw, 40px)",
              fontWeight: 700, letterSpacing: "-0.02em",
              color: "#EDEDED", lineHeight: 1.12, maxWidth: 600, margin: "0 auto",
            }}>
              Designed for the decisions that matter
            </h2>
            <p style={{ marginTop: 16, fontSize: 16, color: "#A1A1AA", maxWidth: 500, margin: "16px auto 0" }}>
              Every feature is meticulously crafted to eliminate noise and present actionable data with absolute clarity.
            </p>
          </motion.div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
            {[
              { icon: Zap, title: "Trade Story Panel",
                desc: "Select a ticker for an AI-powered digest, analyst compass, and automatic stop-loss calculation based on defined risk profiles.", delay: 0 },
              { icon: Shield, title: "5-Second Grace Window",
                desc: "Orders grant a 5-second slide-to-cancel grace period. Built-in prevention against fat-finger execution errors.", delay: 0.1 },
              { icon: Activity, title: "Stress-Adaptive UI",
                desc: "During severe volatility spikes, the terminal reduces visual noise to mitigate cognitive load when clarity matters most.", delay: 0.2 },
              { icon: Globe, title: "Market Correlation",
                desc: "Visualize ripple effects across asset classes instantly, bridging global macroeconomic events and portfolio exposure.", delay: 0.3 },
              { icon: TrendingUp, title: "Risk-First Sizing",
                desc: "Enter dollars at risk to automatically calculate optimal position size and set strict stop-loss boundaries.", delay: 0.4 },
              { icon: Zap, title: "Command Palette",
                desc: "Hit ⌘K to instantly reconfigure layouts, query assets, and jump between tools without taking your hands off the keyboard.", delay: 0.5 },
            ].map((f, i) => (
              <FeatureCard key={i} {...f} />
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA SECTION ── */}
      <section style={{
        padding: "100px max(24px, calc((100vw - 1160px) / 2))",
        background: "#000",
        borderTop: "1px solid rgba(255,255,255,0.1)",
      }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          style={{
            maxWidth: 600, margin: "0 auto", textAlign: "center",
          }}>
          <h2 style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: "clamp(30px, 5vw, 48px)",
            fontWeight: 700, letterSpacing: "-0.02em",
            color: "#EDEDED", lineHeight: 1.1, marginBottom: 20,
          }}>
            Ready to trade with clarity?
          </h2>
          <p style={{
            fontFamily: "'Inter', sans-serif", fontSize: 16, fontWeight: 400,
            color: "#A1A1AA", marginBottom: 32, lineHeight: 1.6,
          }}>
            Skip the complex setup. Open the terminal and access professional-grade market intelligence instantly in your browser.
          </p>
          <PrimaryButton onClick={onEnter} style={{ margin: "0 auto", padding: "14px 32px", fontSize: 15 }}>
            Launch Terminal <ArrowRight size={16} />
          </PrimaryButton>
        </motion.div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{
        borderTop: "1px solid rgba(255,255,255,0.1)",
        padding: "32px max(24px, calc((100vw - 1160px) / 2))",
        display: "flex", justifyContent: "space-between", alignItems: "center",
        flexWrap: "wrap", gap: 16,
        background: "#000",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 20, height: 20, borderRadius: 4,
            background: "#EDEDED",
            display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Zap size={12} color="#000" />
          </div>
          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 12,
            color: "#71717A", fontWeight: 500, letterSpacing: "0.02em" }}>
            OMNI TERMINAL © 2026
          </span>
        </div>
        <div style={{ display: "flex", gap: 28 }}>
          {["Privacy", "Terms", "Status", "API"].map(l => (
            <a key={l} href="#" style={{
              fontFamily: "'Inter', sans-serif", fontSize: 13,
              color: "#71717A", textDecoration: "none",
              transition: "color 0.2s",
            }}
            onMouseEnter={e => e.target.style.color = "#EDEDED"}
            onMouseLeave={e => e.target.style.color = "#71717A"}>
              {l}
            </a>
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#10B981" }} />
          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 12,
            color: "#71717A" }}>
            All systems nominal
          </span>
        </div>
      </footer>
    </div>
  );
}
