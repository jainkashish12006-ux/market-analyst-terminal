import { useState, useEffect, useRef } from "react";
import { useTheme } from "./ThemeContext";

export function AnimatedPrice({ value, decimals = 2, size = 13, bold }) {
  const { theme: t } = useTheme();
  const [flash, setFlash] = useState(null);
  const prev = useRef(value);
  useEffect(() => {
    if (prev.current !== value) {
      setFlash(value > prev.current ? "up" : "down");
      const id = setTimeout(() => setFlash(null), 300);
      prev.current = value;
      return () => clearTimeout(id);
    }
  }, [value]);
  const color = flash === "up" ? t.green : flash === "down" ? t.amber : t.text;
  return <span style={{ fontFamily: t.fontMono, fontSize: size, fontWeight: bold ? 700 : 400, color, transition: "color 300ms ease" }}>
    {value?.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}
  </span>;
}

export function Sparkline({ data, color, width = 64, height = 22, area, smooth }) {
  if (!data || data.length < 2) return <span style={{ display: "inline-block", width, height }} />;
  const min = Math.min(...data), max = Math.max(...data), rng = max - min || 1;
  const pts = data.map((v, i) => ({ x: (i / (data.length - 1)) * width, y: height - ((v - min) / rng) * (height - 3) - 1 }));
  const id_ = `sg-${(color || "").replace(/[^a-z0-9]/gi, "")}${width}`;

  if (smooth) {
    let d = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 1; i < pts.length; i++) {
      const cx = (pts[i - 1].x + pts[i].x) / 2;
      d += ` C ${cx} ${pts[i - 1].y} ${cx} ${pts[i].y} ${pts[i].x} ${pts[i].y}`;
    }
    const aPath = area ? `${d} L ${pts[pts.length - 1].x} ${height} L ${pts[0].x} ${height} Z` : null;
    return (
      <svg width={width} height={height} style={{ display: "inline-block", verticalAlign: "middle", overflow: "visible" }}>
        <defs><linearGradient id={id_} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0.02" />
        </linearGradient></defs>
        {area && <path d={aPath} fill={`url(#${id_})`} />}
        <path d={d} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    );
  }
  const pp = pts.map(p => `${p.x},${p.y}`).join(" ");
  const ap = area ? `${pts[0].x},${height} ${pp} ${pts[pts.length - 1].x},${height}` : null;
  return (
    <svg width={width} height={height} style={{ display: "inline-block", verticalAlign: "middle", overflow: "visible" }}>
      <defs><linearGradient id={id_} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor={color} stopOpacity="0.25" />
        <stop offset="100%" stopColor={color} stopOpacity="0" />
      </linearGradient></defs>
      {area && <polygon points={ap} fill={`url(#${id_})`} />}
      <polyline points={pp} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

export function EKGLine({ lag = 0, connected = true, width = 280 }) {
  const { theme: t } = useTheme();
  const canvasRef = useRef(null);
  const frameRef = useRef(null);
  const data = useRef(Array(120).fill(0.5));
  const tick = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const draw = () => {
      const W = canvas.width, H = canvas.height;
      ctx.clearRect(0, 0, W, H);
      if (!connected) {
        ctx.strokeStyle = t.textDim; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(0, H / 2); ctx.lineTo(W, H / 2); ctx.stroke();
        frameRef.current = requestAnimationFrame(draw); return;
      }
      tick.current += 0.06;
      const T = tick.current;
      const spike = Math.sin(T * 3.2) > 0.93;
      const v = spike ? 0.5 - Math.sin(T * 14) * 0.42 : 0.5 + Math.sin(T * 2.2) * 0.07 + (Math.random() - 0.5) * 0.03;
      data.current.push(v); data.current.shift();
      const color = lag > 200 ? t.amber : t.accent;
      ctx.strokeStyle = color; ctx.lineWidth = 1.2;
      ctx.shadowBlur = 5; ctx.shadowColor = color;
      ctx.beginPath();
      data.current.forEach((val, i) => {
        const x = (i / data.current.length) * W, y = val * H;
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      });
      ctx.stroke(); ctx.shadowBlur = 0;
      frameRef.current = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(frameRef.current);
  }, [connected, lag, t]);

  return <canvas ref={canvasRef} width={width} height={28} style={{ display: "block" }} />;
}

export function AnalystGauge({ buy = 45, hold = 30, sell = 25 }) {
  const { theme: t } = useTheme();
  const total = buy + hold + sell;
  const bp = buy / total, sp = sell / total;
  const cx = 80, cy = 70, r = 52;
  const arc = (s, e, clr) => {
    const sa = Math.PI + s * Math.PI, ea = Math.PI + e * Math.PI;
    const x1 = cx + r * Math.cos(sa), y1 = cy + r * Math.sin(sa);
    const x2 = cx + r * Math.cos(ea), y2 = cy + r * Math.sin(ea);
    return <path d={`M ${x1} ${y1} A ${r} ${r} 0 ${e - s > 0.5 ? 1 : 0} 1 ${x2} ${y2}`}
      fill="none" stroke={clr} strokeWidth={9} strokeLinecap="round"
      style={{ filter: `drop-shadow(0 0 4px ${clr}60)` }} />;
  };
  const needle = bp - sp;
  const na = Math.PI + needle * Math.PI;
  const nx = cx + 38 * Math.cos(na), ny = cy + 38 * Math.sin(na);
  return (
    <svg width={160} height={90}>
      {arc(0, bp, t.green)}
      {arc(bp, bp + (hold / total), t.amber)}
      {arc(bp + (hold / total), 1, t.red)}
      <line x1={cx} y1={cy} x2={nx} y2={ny} stroke={t.text} strokeWidth={2} strokeLinecap="round" />
      <circle cx={cx} cy={cy} r={4} fill={t.accent} />
      <text x={cx - 48} y={cy + 16} fontSize={8} fill={t.green} fontWeight={700}>BUY {buy}%</text>
      <text x={cx + 18} y={cy + 16} fontSize={8} fill={t.red}>SELL {sell}%</text>
    </svg>
  );
}

export function EKGPulse() {
  return <div>EKG Pulse</div>;
};

export function StatCard({ label, value, delta, good }) {
  const { theme: t } = useTheme();
  const isPos = delta >= 0;
  return (
    <div style={{
      background: t.glass, backdropFilter: "blur(12px)", border: `1px solid ${t.border}`,
      borderRadius: t.cardRadius, padding: "16px 18px", boxShadow: t.shadow
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
        <span style={{ fontSize: 11, color: t.textSub, fontFamily: t.fontDisplay, textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</span>
        <span style={{ fontSize: 10, color: t.textSub }}>···</span>
      </div>
      <div style={{ fontSize: 26, fontWeight: 800, fontFamily: t.fontMono, color: t.text, marginBottom: 4 }}>{value}</div>
      {delta !== undefined && (
        <div style={{ fontSize: 11, fontFamily: t.fontMono, color: isPos ? t.green : t.red, display: "flex", alignItems: "center", gap: 4 }}>
          {isPos ? "▲" : "▼"} {Math.abs(delta).toFixed(2)}% vs last month
        </div>
      )}
    </div>
  );
}

function RippleCard() {
  return <div>Ripple Card</div>;
}

export { RippleCard };
