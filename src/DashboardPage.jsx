import { useState, useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "./ThemeContext";
import { AnimatedPrice, Sparkline, EKGLine } from "./MicroComponents";
import { WorldMap } from "./WorldMap";
import { COMPANIES, SECTORS } from "./useDataStream";

// ─── LUMINOUS PRICE CHART (Canvas) ───────────────────────────────────────────
function PriceChart({ data, color, height = 200 }) {
  const { theme: t } = useTheme();
  const ref = useRef(null);
  const isDeep = t.name === "deepSea";

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas || !data || data.length < 2) return;
    const dpr = devicePixelRatio || 1;
    const W = canvas.offsetWidth;
    const H = height;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    const ctx = canvas.getContext("2d");
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, W, H);

    const min = Math.min(...data);
    const max = Math.max(...data);
    const rng = max - min || 1;
    const pad = { top: 12, bottom: 20, left: 8, right: 8 };
    const cW = W - pad.left - pad.right;
    const cH = H - pad.top - pad.bottom;

    const px = (i) => pad.left + (i / (data.length - 1)) * cW;
    const py = (v) => pad.top + cH - ((v - min) / rng) * cH;

    // ── Subtle grid ───────────────────────────────────────────────────────
    ctx.strokeStyle = t.border;
    ctx.lineWidth = 0.5;
    [0.25, 0.5, 0.75].forEach(frac => {
      const y = pad.top + cH * (1 - frac);
      ctx.beginPath(); ctx.moveTo(pad.left, y); ctx.lineTo(W - pad.right, y); ctx.stroke();
      const val = min + rng * frac;
      ctx.fillStyle = t.textDim;
      ctx.font = `${8 * dpr / dpr}px IBM Plex Mono, JetBrains Mono, monospace`;
      ctx.fillText(val > 100 ? val.toFixed(0) : val.toFixed(2), pad.left + 2, y - 3);
    });

    // ── Gradient area fill ───────────────────────────────────────────────
    const areaGrad = ctx.createLinearGradient(0, pad.top, 0, H);
    if (isDeep) {
      areaGrad.addColorStop(0, color + "33");   // 20% opacity
      areaGrad.addColorStop(0.6, color + "0d");
      areaGrad.addColorStop(1, color + "00");
    } else {
      areaGrad.addColorStop(0, color + "22");
      areaGrad.addColorStop(1, color + "00");
    }

    // Build smooth bezier path
    ctx.beginPath();
    ctx.moveTo(px(0), H);
    ctx.lineTo(px(0), py(data[0]));
    for (let i = 1; i < data.length; i++) {
      const cpx = (px(i - 1) + px(i)) / 2;
      ctx.bezierCurveTo(cpx, py(data[i - 1]), cpx, py(data[i]), px(i), py(data[i]));
    }
    ctx.lineTo(px(data.length - 1), H);
    ctx.closePath();
    ctx.fillStyle = areaGrad;
    ctx.fill();

    // ── Luminous line ─────────────────────────────────────────────────────
    ctx.beginPath();
    ctx.moveTo(px(0), py(data[0]));
    for (let i = 1; i < data.length; i++) {
      const cpx = (px(i - 1) + px(i)) / 2;
      ctx.bezierCurveTo(cpx, py(data[i - 1]), cpx, py(data[i]), px(i), py(data[i]));
    }
    ctx.strokeStyle = color;
    ctx.lineWidth = isDeep ? 1.8 : 1.5;
    ctx.lineJoin = "round";
    if (isDeep) {
      ctx.shadowBlur = 12;
      ctx.shadowColor = color;
    }
    ctx.stroke();
    ctx.shadowBlur = 0;

    // ── End dot with glow ─────────────────────────────────────────────────
    const lx = px(data.length - 1), ly = py(data[data.length - 1]);
    if (isDeep) {
      ctx.beginPath();
      ctx.arc(lx, ly, 6, 0, Math.PI * 2);
      ctx.fillStyle = color + "30";
      ctx.fill();
    }
    ctx.beginPath();
    ctx.arc(lx, ly, 3.5, 0, Math.PI * 2);
    ctx.fillStyle = color;
    if (isDeep) { ctx.shadowBlur = 14; ctx.shadowColor = color; }
    ctx.fill();
    ctx.shadowBlur = 0;
  }, [data, color, t, height]);

  return (
    <canvas
      ref={ref}
      style={{ width: "100%", height, display: "block" }}
    />
  );
}

// ─── SLIM STAT ROW ────────────────────────────────────────────────────────────
function StatRow({ label, value, delta }) {
  const { theme: t } = useTheme();
  const isPos = delta >= 0;
  const [hov, setHov] = useState(false);

  return (
    <motion.div
      onHoverStart={() => setHov(true)}
      onHoverEnd={() => setHov(false)}
      style={{
        flex: 1, padding: "12px 16px",
        borderRight: `1px solid ${t.border}`,
        cursor: "default",
        transition: "background 0.2s",
        background: hov
          ? (t.name === "deepSea" ? `rgba(0,229,255,0.04)` : `rgba(79,121,66,0.04)`)
          : "transparent",
        position: "relative", overflow: "hidden",
      }}>
      {/* Hover micro-glow */}
      {hov && t.name === "deepSea" && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          style={{
            position: "absolute", bottom: 0, left: 0, right: 0, height: 1,
            background: `linear-gradient(90deg, transparent, ${t.accent}60, transparent)`,
          }} />
      )}
      <div style={{ fontSize: 10, color: t.textSub, fontFamily: t.fontUI,
        textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>
        {label}
      </div>
      <div style={{ fontFamily: t.fontMono, fontSize: 18, fontWeight: 700, color: t.text, lineHeight: 1 }}>
        {value}
      </div>
      <div style={{ marginTop: 5, fontSize: 10, fontFamily: t.fontMono,
        color: isPos ? t.green : t.red, display: "flex", alignItems: "center", gap: 3 }}>
        {isPos ? "▲" : "▼"} {Math.abs(delta).toFixed(2)}%
        <span style={{ color: t.textDim, fontFamily: t.fontUI, fontSize: 9, marginLeft: 2 }}>vs last mo</span>
      </div>
    </motion.div>
  );
}

// ─── WATCH ROW ────────────────────────────────────────────────────────────────
function WatchRow({ sym, data, onSelect }) {
  const { theme: t } = useTheme();
  const up = data.change >= 0;
  const color = up ? t.green : t.red;
  const [hov, setHov] = useState(false);

  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      onClick={() => onSelect(sym)}
      style={{
        display: "flex", alignItems: "center", gap: 10,
        padding: "9px 12px",
        borderBottom: `1px solid ${t.border}`,
        cursor: "pointer",
        background: hov
          ? (t.name === "deepSea" ? "rgba(255,255,255,0.025)" : "rgba(0,0,0,0.025)")
          : "transparent",
        transition: "background 0.15s",
      }}>
      {/* Symbol badge */}
      <div style={{
        width: 32, height: 32, borderRadius: 8, flexShrink: 0,
        background: `${color}12`,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontFamily: t.fontMono, fontSize: 8, fontWeight: 800, color,
        letterSpacing: "0.04em",
      }}>
        {sym.slice(0, 4)}
      </div>

      {/* Name */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: t.fontMono, fontSize: 11, fontWeight: 700, color: t.text }}>{sym}</div>
        <div style={{ fontSize: 9, color: t.textDim, fontFamily: t.fontUI,
          whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", marginTop: 1 }}>
          {COMPANIES[sym]}
        </div>
      </div>

      {/* Sparkline */}
      <Sparkline data={data.history} color={color} width={44} height={16} />

      {/* Price + delta */}
      <div style={{ textAlign: "right", minWidth: 68 }}>
        <AnimatedPrice value={data.price} decimals={data.price > 100 ? 2 : 4} size={11} bold />
        <div style={{ fontFamily: t.fontMono, fontSize: 9, color, marginTop: 2 }}>
          {up ? "+" : ""}{(data.change * 100).toFixed(2)}%
        </div>
      </div>

      {/* Anomaly dot */}
      {data.pulsing && (
        <div style={{
          width: 5, height: 5, borderRadius: "50%", flexShrink: 0,
          background: t.amber, boxShadow: `0 0 6px ${t.amber}`,
          animation: "dotPulse 1.4s infinite",
        }} />
      )}
    </div>
  );
}

// ─── MARKET MOOD GAUGE ────────────────────────────────────────────────────────
function MarketMoodGauge({ value = 65 }) {
  const { theme: t } = useTheme();
  // 0-100 gauge. <=40 Bearish, 40-60 Neutral, >=60 Bullish
  const isBull = value >= 60;
  const isBear = value <= 40;
  const color = isBull ? t.green : isBear ? t.red : t.amber;
  const label = isBull ? "Bullish" : isBear ? "Bearish" : "Neutral";
  
  // SVG Arc calc (half circle)
  const r = 50; const cx = 60; const cy = 60;
  const rad = (val) => Math.PI + (val / 100) * Math.PI; // map 0-100 to 180-360 deg
  
  return (
    <div style={{ flex: 1, padding: "16px", borderRight: `1px solid ${t.border}`, display: "flex", flexDirection: "column", alignItems: "center", position: "relative" }}>
      <div style={{ fontSize: 10, color: t.textSub, fontFamily: t.fontUI, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>Market Mood</div>
      <svg width={120} height={70}>
        {/* BG track */}
        <path d={`M 10 60 A 50 50 0 0 1 110 60`} fill="none" stroke={t.border} strokeWidth={8} strokeLinecap="round" />
        {/* Value track */}
        <motion.path 
          d={`M 10 60 A 50 50 0 0 1 110 60`} fill="none" stroke={color} strokeWidth={8} strokeLinecap="round"
          strokeDasharray="157"
          initial={{ strokeDashoffset: 157 }}
          animate={{ strokeDashoffset: 157 - (157 * value) / 100 }}
          transition={{ duration: 1.5, type: "spring", bounce: 0.1 }}
          style={{ filter: t.name === "deepSea" ? `drop-shadow(0 0 8px ${color}80)` : "none" }}
        />
        {/* Needle */}
        <motion.line 
          x1={cx} y1={cy} 
          x2={cx + (r - 10) * Math.cos(rad(value))} 
          y2={cy + (r - 10) * Math.sin(rad(value))}
          stroke={t.text} strokeWidth={2} strokeLinecap="round"
          initial={{ rotate: -90, transformOrigin: `${cx}px ${cy}px` }}
          animate={{ rotate: 0 }}
          transition={{ duration: 1.5, type: "spring" }}
        />
        <circle cx={cx} cy={cy} r={4} fill={t.text} />
      </svg>
      <div style={{ marginTop: -8, textAlign: "center" }}>
        <div style={{ fontFamily: t.fontMono, fontSize: 24, fontWeight: 800, color: t.text }}>{value}</div>
        <div style={{ fontSize: 10, color, fontFamily: t.fontUI, fontWeight: 700 }}>{label}</div>
      </div>
    </div>
  );
}

// ─── OPTIONS GREEKS ──────────────────────────────────────────────────────────
function OptionsGreeks() {
  const { theme: t } = useTheme();
  const greeks = [
    { label: "Delta", val: 0.65, color: t.accent },
    { label: "Gamma", val: 0.12, color: t.amber },
    { label: "Theta", val: -0.45, color: t.red },
    { label: "Vega", val: 0.28, color: t.green }
  ];

  return (
    <div style={{ flex: 1.5, padding: "16px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
      <div style={{ fontSize: 10, color: t.textSub, fontFamily: t.fontUI, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>Options Greeks (SPY)</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {greeks.map(g => (
          <div key={g.label} style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ width: 40, fontSize: 10, fontFamily: t.fontUI, color: t.textDim }}>{g.label}</span>
            <div style={{ flex: 1, height: 4, background: t.border, borderRadius: 2, overflow: "hidden" }}>
              <motion.div 
                initial={{ width: 0 }} animate={{ width: `${Math.abs(g.val) * 100}%` }}
                transition={{ duration: 1, delay: 0.2 }}
                style={{ height: "100%", background: g.color }} 
              />
            </div>
            <span style={{ width: 35, textAlign: "right", fontSize: 10, fontFamily: t.fontMono, color: t.text }}>{g.val}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── SECTOR STRIP ─────────────────────────────────────────────────────────────
function SectorStrip({ symMap }) {
  const { theme: t } = useTheme();
  const sectors = ["Tech","Finance","Energy","Crypto","FX","Consumer","Auto","Commodities"];
  return (
    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
      {sectors.map(sector => {
        const items = Object.values(symMap).filter(d => d.sector === sector);
        const avg = items.length ? items.reduce((a, d) => a + d.change, 0) / items.length : 0;
        const isUp = avg >= 0;
        const color = isUp ? t.green : t.red;
        const intensity = Math.min(Math.abs(avg) * 2500, 1);
        return (
          <div key={sector} style={{
            padding: "5px 9px", borderRadius: 7,
            background: `${color}${Math.floor(intensity * 35 + 8).toString(16).padStart(2, "0")}`,
            border: `1px solid ${color}${Math.floor(intensity * 40 + 12).toString(16).padStart(2, "0")}`,
          }}>
            <div style={{ fontSize: 8, fontWeight: 800, color: t.textSub,
              fontFamily: t.fontUI, letterSpacing: "0.06em", textTransform: "uppercase" }}>
              {sector}
            </div>
            <div style={{ fontFamily: t.fontMono, fontSize: 11, fontWeight: 700, color, marginTop: 1 }}>
              {isUp ? "+" : ""}{(avg * 100).toFixed(2)}%
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── FOCUS MODE: CLEAN HERO VIEW ──────────────────────────────────────────────
function FocusView({ symMap, signals, health, connected, onSymbolSelect }) {
  const { theme: t } = useTheme();
  const topMovers = Object.entries(symMap)
    .sort((a, b) => Math.abs(b[1].change) - Math.abs(a[1].change))
    .slice(0, 6);

  const topSym = topMovers[0]?.[0] || "AAPL";
  const featured = symMap[topSym] || {};

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {/* Hero chart */}
      <div style={{
        background: t.glass, backdropFilter: t.glassBlur,
        borderRadius: t.cardRadius, border: `1px solid ${t.border}`,
        padding: "18px 20px", boxShadow: t.shadow,
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
          <div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
              <span style={{ fontFamily: t.fontMono, fontSize: 16, fontWeight: 800, color: t.accent }}>{topSym}</span>
              <AnimatedPrice value={featured.price} decimals={2} size={26} bold />
              <span style={{ fontFamily: t.fontMono, fontSize: 12,
                color: (featured.change || 0) >= 0 ? t.green : t.red }}>
                {(featured.change || 0) >= 0 ? "+" : ""}{((featured.change || 0) * 100).toFixed(2)}%
              </span>
            </div>
            <div style={{ fontSize: 11, color: t.textSub, fontFamily: t.fontUI, marginTop: 4 }}>
              {COMPANIES[topSym]} · Focus Mode — top mover
            </div>
          </div>
          <div style={{ fontFamily: t.fontMono, fontSize: 11, color: t.textDim }}>
            {connected ? <span style={{ color: t.green }}>● LIVE</span> : "○ OFFLINE"}
          </div>
        </div>
        <PriceChart
          data={featured.h60 || featured.history || [featured.price || 100]}
          color={(featured.change || 0) >= 0 ? t.green : t.red}
          height={220}
        />
      </div>

      {/* Compact movers */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
        {topMovers.slice(1).map(([sym, data]) => {
          const up = data.change >= 0;
          const color = up ? t.green : t.red;
          return (
            <div key={sym} onClick={() => onSymbolSelect(sym)}
              style={{
                background: t.glass, backdropFilter: t.glassBlur,
                borderRadius: t.cardRadius, border: `1px solid ${t.border}`,
                padding: "12px 14px", cursor: "pointer", boxShadow: t.shadow,
              }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontFamily: t.fontMono, fontSize: 11, fontWeight: 700, color: t.textSub }}>{sym}</span>
                <span style={{ fontFamily: t.fontMono, fontSize: 10, color }}>
                  {up ? "+" : ""}{(data.change * 100).toFixed(2)}%
                </span>
              </div>
              <AnimatedPrice value={data.price} decimals={2} size={13} bold />
              <div style={{ marginTop: 6 }}>
                <Sparkline data={data.history} color={color} width={100} height={20} area />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── MAIN DASHBOARD ───────────────────────────────────────────────────────────
export function DashboardPage({ symMap, signals, anomalies, health, connected, onSymbolSelect, focusMode }) {
  const { theme: t, mode } = useTheme();
  const isDeep = mode === "deepSea";
  const [chartPeriod, setChartPeriod] = useState("1D");

  // Pick the top mover for featured chart
  const [featuredSym, setFeaturedSym] = useState(null);
  const topSym = useMemo(() =>
    Object.entries(symMap).sort((a, b) => Math.abs(b[1].change) - Math.abs(a[1].change))[0]?.[0] || "AAPL",
    [symMap]
  );
  const sym = featuredSym || topSym;
  const featured = symMap[sym] || { price: 0, change: 0, history: [], h60: [], volume: 0 };
  const isUp = featured.change >= 0;
  const chartColor = isUp ? t.green : t.red;

  const platforms = [
    { label: "Desktop", value: 60, color: t.accent },
    { label: "Mobile", value: 25, color: t.amber },
    { label: "Tablet", value: 15, color: t.textSub },
  ];

  // Focus mode: clean, minimal
  if (focusMode) return <FocusView symMap={symMap} signals={signals} health={health} connected={connected} onSymbolSelect={onSymbolSelect} />;

  return (
    <div style={{ display: "flex", gap: 16 }}>

      {/* ── LEFT COLUMN ── */}
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 12 }}>

        {/* Slim stat row */}
        <div style={{
          background: t.glass, backdropFilter: t.glassBlur,
          borderRadius: t.cardRadius, border: `1px solid ${t.border}`,
          display: "flex", overflow: "hidden", boxShadow: t.shadow,
        }}>
          {[
            { label: "Total Reach", value: `${(38471 + signals.length * 8).toLocaleString()}`, delta: 4.72 },
            { label: "First-Time Visits", value: "19,836", delta: 7.35 },
            { label: "Repeat Viewers", value: "11,204", delta: -0.86 },
            { label: "Avg Engagement", value: "5m 18s", delta: -4.31 },
          ].map((s, i, arr) => (
            <div key={s.label} style={{ flex: 1, borderRight: i < arr.length - 1 ? `1px solid ${t.border}` : "none" }}>
              <StatRow {...s} />
            </div>
          ))}
        </div>

        {/* Featured price chart */}
        <div style={{
          background: t.glass, backdropFilter: t.glassBlur,
          borderRadius: t.cardRadius, border: `1px solid ${t.border}`,
          padding: "16px 18px", boxShadow: t.shadow,
        }}>
          {/* Chart header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
            <div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 4 }}>
                <span style={{ fontFamily: t.fontUI, fontSize: 12, color: t.textSub }}>{sym}</span>
                <span style={{ fontFamily: t.fontUI, fontSize: 11, color: t.textDim }}>—</span>
                <span style={{ fontFamily: t.fontUI, fontSize: 12, color: t.textSub }}>{COMPANIES[sym]}</span>
              </div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
                <AnimatedPrice value={featured.price} decimals={featured.price > 100 ? 2 : 4} size={24} bold />
                <span style={{
                  fontFamily: t.fontMono, fontSize: 12,
                  color: chartColor,
                  background: `${chartColor}12`, padding: "2px 8px", borderRadius: 6,
                }}>
                  {isUp ? "+" : ""}{(featured.change * 100).toFixed(2)}%
                </span>
              </div>
              {featured.price > 0 && (
                <div style={{ fontFamily: t.fontMono, fontSize: 9, color: t.textDim, marginTop: 5,
                  display: "flex", gap: 10 }}>
                  <span>O {(featured.price * 0.9982).toFixed(featured.price > 100 ? 2 : 4)}</span>
                  <span>H {(featured.price * 1.0038).toFixed(featured.price > 100 ? 2 : 4)}</span>
                  <span>L {(featured.price * 0.9958).toFixed(featured.price > 100 ? 2 : 4)}</span>
                  <span>C {featured.price.toFixed(featured.price > 100 ? 2 : 4)}</span>
                  <span>VOL {((featured.volume || 0) / 1e6).toFixed(1)}M</span>
                </div>
              )}
            </div>
            {/* Period + symbol switchers */}
            <div style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "flex-end" }}>
              <div style={{ display: "flex", gap: 3 }}>
                {["1D","5D","1M","3M"].map(p => (
                  <button key={p} onClick={() => setChartPeriod(p)}
                    style={{
                      padding: "3px 9px", borderRadius: 6,
                      border: `1px solid ${chartPeriod === p ? chartColor + "60" : t.border}`,
                      background: chartPeriod === p ? `${chartColor}14` : "transparent",
                      color: chartPeriod === p ? chartColor : t.textDim,
                      fontFamily: t.fontMono, fontSize: 9, fontWeight: 700,
                      cursor: "pointer", transition: "all 0.15s",
                    }}>
                    {p}
                  </button>
                ))}
              </div>
              <div style={{ display: "flex", gap: 3, flexWrap: "wrap", justifyContent: "flex-end", maxWidth: 200 }}>
                {Object.keys(symMap).slice(0, 6).map(s => (
                  <button key={s} onClick={() => setFeaturedSym(s)}
                    style={{
                      padding: "2px 7px", borderRadius: 5,
                      border: `1px solid ${sym === s ? t.accent + "50" : t.border}`,
                      background: sym === s ? t.accentDim : "transparent",
                      color: sym === s ? t.accent : t.textDim,
                      fontFamily: t.fontMono, fontSize: 8, fontWeight: 700,
                      cursor: "pointer", transition: "all 0.15s",
                    }}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* The luminous chart */}
          <PriceChart
            data={featured.h60 || featured.history || [featured.price || 100]}
            color={chartColor}
            height={190}
          />
        </div>

        {/* Dash row: Mood + Greeks */}
        <div style={{
          background: t.glass, backdropFilter: t.glassBlur,
          borderRadius: t.cardRadius, border: `1px solid ${t.border}`,
          display: "flex", boxShadow: t.shadow,
        }}>
          <MarketMoodGauge value={68} />
          <OptionsGreeks />
        </div>

        {/* World map */}
        <WorldMap symMap={symMap} onSymbolSelect={onSymbolSelect} />

        {/* Bottom row: 3 charts */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
          {/* Bar chart */}
          <BarChartCard t={t} />
          {/* Donut */}
          <DonutCard t={t} platforms={platforms} />
          {/* Heatmap */}
          <HeatmapCard t={t} />
        </div>
      </div>

      {/* ── RIGHT COLUMN ── */}
      <div style={{ width: 256, flexShrink: 0, display: "flex", flexDirection: "column", gap: 12 }}>

        {/* Sector strip */}
        <div style={{
          background: t.glass, backdropFilter: t.glassBlur,
          borderRadius: t.cardRadius, border: `1px solid ${t.border}`,
          padding: "13px 14px", boxShadow: t.shadow,
        }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: t.textSub, fontFamily: t.fontUI,
            textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>
            Sector Heatmap
          </div>
          <SectorStrip symMap={symMap} />
        </div>

        {/* Market Watch */}
        <div style={{
          background: t.glass, backdropFilter: t.glassBlur,
          borderRadius: t.cardRadius, border: `1px solid ${t.border}`,
          flex: 1, boxShadow: t.shadow,
          display: "flex", flexDirection: "column", overflow: "hidden",
        }}>
          <div style={{
            padding: "11px 12px 10px",
            borderBottom: `1px solid ${t.border}`,
            display: "flex", justifyContent: "space-between", alignItems: "center",
            flexShrink: 0,
          }}>
            <span style={{ fontFamily: t.fontUI, fontSize: 11, fontWeight: 700, color: t.text,
              letterSpacing: "0.03em" }}>Market Watch</span>
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <div style={{ width: 5, height: 5, borderRadius: "50%", background: t.green,
                boxShadow: `0 0 6px ${t.green}`, animation: "dotPulse 2s infinite" }} />
              <span style={{ fontSize: 9, fontFamily: t.fontMono, color: t.green, fontWeight: 700 }}>LIVE</span>
            </div>
          </div>
          <div style={{ overflowY: "auto", flex: 1 }}>
            {Object.entries(symMap).slice(0, 14).map(([s, d]) => (
              <WatchRow key={s} sym={s} data={d} onSelect={onSymbolSelect} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── SUB-CHART COMPONENTS ─────────────────────────────────────────────────────
function BarChartCard({ t }) {
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul"];
  // Stable values so they don't re-randomise on every render
  const bars = useMemo(() => months.map(() => ({
    direct: 4000 + Math.random() * 8000,
    organic: 2000 + Math.random() * 5000,
  })), []);

  return (
    <div style={{
      background: t.glass, backdropFilter: t.glassBlur,
      borderRadius: t.cardRadius, border: `1px solid ${t.border}`,
      padding: "14px", boxShadow: t.shadow,
    }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: t.text, fontFamily: t.fontUI, marginBottom: 4 }}>
        Direct vs Organic
      </div>
      <div style={{ fontSize: 9, color: t.textDim, fontFamily: t.fontUI, marginBottom: 12 }}>Annual view</div>
      <svg width="100%" height={110} viewBox="0 0 280 110" preserveAspectRatio="xMidYMid meet">
        {bars.map((b, i) => {
          const x = 8 + i * 38;
          const maxH = 80;
          const dh = (b.direct / 15000) * maxH;
          const oh = (b.organic / 15000) * maxH;
          return (
            <g key={months[i]}>
              <rect x={x} y={90 - dh} width={13} height={dh} fill={t.accent} opacity={0.85} rx={2}
                style={{ filter: t.name === "deepSea" ? `drop-shadow(0 0 4px ${t.accent}60)` : "none" }} />
              <rect x={x + 15} y={90 - oh} width={13} height={oh} fill={t.green} opacity={0.7} rx={2} />
              <text x={x + 10} y={102} fill={t.textDim} fontSize={7.5} textAnchor="middle"
                fontFamily="IBM Plex Mono, monospace">{months[i]}</text>
            </g>
          );
        })}
        {[0,5,10,15].map(v => (
          <text key={v} x={2} y={92 - (v / 15) * 80} fill={t.textDim} fontSize={7}
            fontFamily="IBM Plex Mono, monospace">{v === 0 ? "0" : `${v}K`}</text>
        ))}
      </svg>
      <div style={{ display: "flex", gap: 12, marginTop: 4 }}>
        {[[t.accent,"Direct"],[t.green,"Organic"]].map(([c,l]) => (
          <div key={l} style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <div style={{ width: 7, height: 7, borderRadius: "50%", background: c }} />
            <span style={{ fontSize: 9, color: t.textSub, fontFamily: t.fontUI }}>{l}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function DonutCard({ t, platforms }) {
  const total = platforms.reduce((s, d) => s + d.value, 0);
  let cumul = 0;
  const R = 42, cx = 60, cy = 60;
  return (
    <div style={{
      background: t.glass, backdropFilter: t.glassBlur,
      borderRadius: t.cardRadius, border: `1px solid ${t.border}`,
      padding: "14px", boxShadow: t.shadow,
    }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: t.text, fontFamily: t.fontUI, marginBottom: 4 }}>
        Users by Platform
      </div>
      <div style={{ fontSize: 9, color: t.textDim, fontFamily: t.fontUI, marginBottom: 10 }}>Session share</div>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <svg width={120} height={120}>
          {platforms.map((d, i) => {
            const sa = (cumul / total) * 2 * Math.PI - Math.PI / 2;
            cumul += d.value;
            const ea = (cumul / total) * 2 * Math.PI - Math.PI / 2;
            const x1 = cx + R * Math.cos(sa), y1 = cy + R * Math.sin(sa);
            const x2 = cx + R * Math.cos(ea), y2 = cy + R * Math.sin(ea);
            return (
              <path key={i} d={`M ${cx} ${cy} L ${x1} ${y1} A ${R} ${R} 0 ${d.value / total > 0.5 ? 1 : 0} 1 ${x2} ${y2} Z`}
                fill={d.color} stroke={t.bgCard || t.bg} strokeWidth={2.5}
                style={{ filter: t.name === "deepSea" ? `drop-shadow(0 0 4px ${d.color}50)` : "none" }} />
            );
          })}
          <circle cx={cx} cy={cy} r={24} fill={t.bgCard || t.bg} />
          <text x={cx} y={cy+1} textAnchor="middle" dominantBaseline="middle"
            fill={t.textSub} fontSize={9} fontFamily="IBM Plex Mono, monospace">100%</text>
        </svg>
        <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
          {platforms.map(d => (
            <div key={d.label} style={{ display: "flex", alignItems: "center", gap: 7 }}>
              <div style={{ width: 7, height: 7, borderRadius: "50%", background: d.color }} />
              <span style={{ fontSize: 10, color: t.textSub, fontFamily: t.fontUI }}>{d.label}</span>
              <span style={{ fontFamily: t.fontMono, fontSize: 10, color: t.text, marginLeft: "auto" }}>{d.value}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function HeatmapCard({ t }) {
  const hours = ["6a","7a","8a","9a","10a","11a","12p","1p"];
  const days = ["S","M","T","W","T","F","S"];
  const data = useMemo(() => hours.map(() => days.map(() => Math.random())), []);
  return (
    <div style={{
      background: t.glass, backdropFilter: t.glassBlur,
      borderRadius: t.cardRadius, border: `1px solid ${t.border}`,
      padding: "14px", boxShadow: t.shadow,
    }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: t.text, fontFamily: t.fontUI, marginBottom: 4 }}>
        Activity Heatmap
      </div>
      <div style={{ fontSize: 9, color: t.textDim, fontFamily: t.fontUI, marginBottom: 10 }}>Trading intensity</div>
      <div style={{ display: "grid", gridTemplateColumns: "22px repeat(7,1fr)", gap: 2.5 }}>
        <div />
        {days.map(d => <div key={d} style={{ fontSize: 7.5, color: t.textDim, fontFamily: t.fontUI, textAlign: "center" }}>{d}</div>)}
        {hours.map((h, hi) => (
          <>
            <div key={h} style={{ fontSize: 7.5, color: t.textDim, fontFamily: t.fontUI, display: "flex", alignItems: "center" }}>{h}</div>
            {days.map((d, di) => {
              const v = data[hi][di];
              const c = v > 0.66 ? t.accent : v > 0.33 ? t.green : t.textDim;
              return (
                <div key={`${hi}${di}`}
                  style={{ height: 13, borderRadius: 2.5,
                    background: `${c}${Math.floor(v * 180 + 28).toString(16).padStart(2,"0")}`,
                    border: `1px solid ${c}15` }} />
              );
            })}
          </>
        ))}
      </div>
    </div>
  );
}
