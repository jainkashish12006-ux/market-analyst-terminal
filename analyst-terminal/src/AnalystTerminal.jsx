import { useState, useEffect, useRef, useCallback } from "react";

// ─── CONSTANTS ──────────────────────────────────────────────────────────────
const SYMBOLS = [
  { sym: "AAPL", name: "Apple Inc.", price: 189.45 },
  { sym: "MSFT", name: "Microsoft", price: 415.2 },
  { sym: "NVDA", name: "NVIDIA Corp", price: 878.3 },
  { sym: "GOOGL", name: "Alphabet", price: 174.15 },
  { sym: "AMZN", name: "Amazon", price: 201.8 },
  { sym: "META", name: "Meta Platforms", price: 545.6 },
  { sym: "TSLA", name: "Tesla", price: 248.4 },
  { sym: "JPM", name: "JPMorgan", price: 221.35 },
  { sym: "V", name: "Visa Inc.", price: 293.8 },
  { sym: "WMT", name: "Walmart", price: 68.9 },
  { sym: "JNJ", name: "J&J", price: 147.6 },
  { sym: "BRK.B", name: "Berkshire", price: 412.1 },
];

const SECTORS = [
  { sym: "TECH", chg: 1.2 }, { sym: "HLTH", chg: -0.4 },
  { sym: "FINC", chg: 0.8 }, { sym: "ENRG", chg: -1.1 },
  { sym: "CONS", chg: 0.3 }, { sym: "INDU", chg: -0.2 },
  { sym: "UTIL", chg: 0.5 }, { sym: "MATL", chg: -0.7 },
  { sym: "RLST", chg: 1.4 }, { sym: "TELC", chg: -0.3 },
  { sym: "SEMI", chg: 2.1 }, { sym: "BANK", chg: 0.6 },
  { sym: "DISC", chg: 0.9 }, { sym: "STPL", chg: -0.5 },
];

const SIGNAL_TEMPLATES = [
  { type: "vol",  icon: "▲", label: "Volume Surge",        color: "#1E6BFF", desc: (s) => `${s} trading at 2.8× average daily volume` },
  { type: "trnd", icon: "↗", label: "Trend Continuation",  color: "#00C8FF", desc: (s) => `${s} momentum confirms upside bias` },
  { type: "rev",  icon: "↺", label: "Reversal Pattern",    color: "#00D68A", desc: (s) => `${s} doji formation near key resistance` },
  { type: "warn", icon: "!",  label: "Volatility Rising",   color: "#F5A623", desc: (s) => `${s} IV expanding — event risk elevated` },
  { type: "corr", icon: "×", label: "Correlation Break",   color: "#F0506E", desc: (s) => `${s} decoupling from sector index` },
];

const EVENT_TEMPLATES = [
  { color: "#1E6BFF", text: (s) => `${s} breaks above 50-day moving average` },
  { color: "#00D68A", text: (s) => `Block trade: ${s} +${Math.floor(rand(50,200))}K shares` },
  { color: "#F5A623", text: (s) => `${s} options flow: unusual call activity` },
  { color: "#F0506E", text: (s) => `${s} down-tick on high volume` },
  { color: "#00C8FF", text: (s) => `${s} crosses VWAP — momentum shift` },
  { color: "#8892A4", text: () => `Fed minutes released — rate commentary` },
  { color: "#00D68A", text: (s) => `${s} analyst upgrade: target raised` },
];

// ─── HELPERS ────────────────────────────────────────────────────────────────
function rand(min, max) { return min + Math.random() * (max - min); }
function fmt(v, d = 2) { return Number(v).toFixed(d); }
function fmtVol(v) {
  return v > 1e9 ? (v / 1e9).toFixed(2) + "B" : v > 1e6 ? (v / 1e6).toFixed(1) + "M" : (v / 1e3).toFixed(0) + "K";
}
function genSpark(base) {
  return Array.from({ length: 30 }, () => base * (1 + (Math.random() - 0.5) * 0.04));
}
function nowTime() {
  const n = new Date();
  return [n.getHours(), n.getMinutes(), n.getSeconds()].map(x => x.toString().padStart(2, "0")).join(":");
}
function nowHM() {
  const n = new Date();
  return [n.getHours(), n.getMinutes()].map(x => x.toString().padStart(2, "0")).join(":");
}

// ─── INIT DATA ───────────────────────────────────────────────────────────────
function initPrices() {
  return SYMBOLS.map(s => ({
    ...s,
    open: s.price,
    high: s.price,
    low: s.price,
    chg: 0,
    flash: null,
    sparkData: genSpark(s.price),
  }));
}

// ─── CHART ───────────────────────────────────────────────────────────────────
function PriceChart({ data, color }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || data.length < 2) return;
    const dpr = window.devicePixelRatio || 1;
    const W = canvas.offsetWidth;
    const H = canvas.offsetHeight;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    const ctx = canvas.getContext("2d");
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, W, H);

    const pad = { top: 10, right: 54, bottom: 22, left: 6 };
    const cW = W - pad.left - pad.right;
    const cH = H - pad.top - pad.bottom;
    const min = Math.min(...data) * 0.999;
    const max = Math.max(...data) * 1.001;
    const range = max - min || 1;
    const gx = (i) => pad.left + (i / (data.length - 1)) * cW;
    const gy = (v) => pad.top + cH - ((v - min) / range) * cH;

    // Grid
    ctx.strokeStyle = "rgba(255,255,255,0.03)";
    ctx.lineWidth = 1;
    for (let i = 0; i <= 5; i++) {
      const y = pad.top + (i / 5) * cH;
      ctx.beginPath(); ctx.moveTo(pad.left, y); ctx.lineTo(W - pad.right, y); ctx.stroke();
      ctx.fillStyle = "rgba(136,146,164,0.55)";
      ctx.font = "9px 'DM Mono', monospace";
      ctx.textAlign = "left";
      ctx.fillText(fmt(max - (i / 5) * range), W - pad.right + 4, y + 3);
    }

    // VWAP
    const vwap = data.reduce((a, b) => a + b, 0) / data.length;
    const vy = gy(vwap);
    ctx.strokeStyle = "rgba(0,200,255,0.25)";
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.beginPath(); ctx.moveTo(pad.left, vy); ctx.lineTo(W - pad.right, vy); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = "rgba(0,200,255,0.6)";
    ctx.font = "8px 'DM Mono', monospace";
    ctx.fillText("VWAP", W - pad.right + 4, vy + 3);

    // Fill
    const grad = ctx.createLinearGradient(0, pad.top, 0, H - pad.bottom);
    grad.addColorStop(0, color === "green" ? "rgba(0,214,138,0.22)" : "rgba(240,80,110,0.18)");
    grad.addColorStop(1, "rgba(0,0,0,0)");
    ctx.beginPath();
    ctx.moveTo(gx(0), gy(data[0]));
    data.forEach((v, i) => ctx.lineTo(gx(i), gy(v)));
    ctx.lineTo(gx(data.length - 1), H - pad.bottom);
    ctx.lineTo(gx(0), H - pad.bottom);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();

    // Line
    const lineColor = color === "green" ? "#00D68A" : "#F0506E";
    ctx.beginPath();
    ctx.moveTo(gx(0), gy(data[0]));
    data.forEach((v, i) => ctx.lineTo(gx(i), gy(v)));
    ctx.strokeStyle = lineColor;
    ctx.lineWidth = 1.5;
    ctx.shadowColor = lineColor;
    ctx.shadowBlur = 5;
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Dot
    const lx = gx(data.length - 1), ly = gy(data[data.length - 1]);
    ctx.beginPath(); ctx.arc(lx, ly, 3, 0, Math.PI * 2);
    ctx.fillStyle = lineColor;
    ctx.shadowColor = lineColor; ctx.shadowBlur = 10; ctx.fill(); ctx.shadowBlur = 0;

    // X labels
    ctx.fillStyle = "rgba(136,146,164,0.45)";
    ctx.font = "9px 'DM Mono', monospace";
    ctx.textAlign = "center";
    [0, 1, 2, 3, 4, 5, 6].forEach(i => {
      const idx = Math.floor(i * (data.length - 1) / 6);
      const hrs = 9 + Math.floor(idx / 10);
      const min = (idx % 10) * 6;
      ctx.fillText(`${hrs}:${min.toString().padStart(2,"0")}`, gx(idx), H - 5);
    });
  }, [data, color]);

  return <canvas ref={canvasRef} style={{ display: "block", width: "100%", height: "100%" }} />;
}

// ─── SPARKLINE ───────────────────────────────────────────────────────────────
function Sparkline({ data, up }) {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || data.length < 2) return;
    const dpr = window.devicePixelRatio || 1;
    const W = canvas.offsetWidth || 60;
    const H = canvas.offsetHeight || 20;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    const ctx = canvas.getContext("2d");
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, W, H);
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    const gx = (i) => (i / (data.length - 1)) * W;
    const gy = (v) => H - 2 - ((v - min) / range) * (H - 4);
    ctx.beginPath();
    data.forEach((v, i) => i === 0 ? ctx.moveTo(gx(i), gy(v)) : ctx.lineTo(gx(i), gy(v)));
    ctx.strokeStyle = up ? "#00D68A" : "#F0506E";
    ctx.lineWidth = 1.2;
    ctx.stroke();
  }, [data, up]);
  return <canvas ref={canvasRef} style={{ display: "block", width: "60px", height: "22px" }} />;
}

// ─── STYLES (injected once) ──────────────────────────────────────────────────
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=Syne:wght@400;500;600;700;800&display=swap');
*{box-sizing:border-box;margin:0;padding:0}
.at-root{
  background:#07090F;color:#E2E8F0;font-family:'DM Mono',monospace;font-size:12px;
  height:100vh;width:100%;overflow:hidden;display:flex;flex-direction:column;position:relative;
}
.at-root::before{
  content:'';position:fixed;inset:0;
  background-image:linear-gradient(rgba(30,107,255,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(30,107,255,0.03) 1px,transparent 1px);
  background-size:40px 40px;pointer-events:none;z-index:0;
}
.at-root::after{
  content:'';position:fixed;top:-200px;right:-200px;width:600px;height:600px;
  background:radial-gradient(circle,rgba(30,107,255,0.05) 0%,transparent 70%);pointer-events:none;z-index:0;
}
.at-layer{position:relative;z-index:1;display:flex;flex-direction:column;height:100%}

/* NAV */
.at-nav{
  height:48px;background:rgba(7,9,15,0.97);border-bottom:1px solid rgba(255,255,255,0.06);
  display:flex;align-items:center;padding:0 20px;gap:20px;flex-shrink:0;backdrop-filter:blur(20px);
}
.at-logo{font-family:'Syne',sans-serif;font-weight:800;font-size:14px;letter-spacing:0.1em;display:flex;align-items:center;gap:8px}
.at-logo-dot{width:7px;height:7px;border-radius:50%;background:#1E6BFF;box-shadow:0 0 8px #1E6BFF;animation:pulse-dot 2s ease-in-out infinite}
@keyframes pulse-dot{0%,100%{opacity:1;box-shadow:0 0 8px #1E6BFF}50%{opacity:0.6;box-shadow:0 0 18px #1E6BFF}}
.at-divider{width:1px;height:20px;background:rgba(255,255,255,0.06)}
.at-status{display:flex;align-items:center;gap:6px;font-size:11px;color:#8892A4;letter-spacing:0.04em}
.at-sdot{width:5px;height:5px;border-radius:50%;background:#00D68A;box-shadow:0 0 6px #00D68A;animation:pulse-dot 1.5s ease-in-out infinite}
.at-clock{font-size:12px;color:#8892A4;font-feature-settings:'tnum';letter-spacing:0.02em;margin-left:auto}
.at-search{position:relative;display:flex;align-items:center}
.at-search input{
  background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.06);border-radius:6px;
  color:#E2E8F0;font-family:'DM Mono',monospace;font-size:11px;padding:5px 10px 5px 28px;
  width:140px;outline:none;transition:border-color 0.2s,background 0.2s;letter-spacing:0.04em;
}
.at-search input:focus{border-color:rgba(30,107,255,0.4);background:rgba(30,107,255,0.06)}
.at-search input::placeholder{color:#4A5568}
.at-search-icon{position:absolute;left:8px;opacity:0.4;pointer-events:none}

/* TICKER */
.at-ticker{height:32px;background:rgba(13,17,32,0.9);border-bottom:1px solid rgba(255,255,255,0.06);overflow:hidden;flex-shrink:0;position:relative}
.at-ticker::before,.at-ticker::after{content:'';position:absolute;top:0;bottom:0;width:60px;z-index:2;pointer-events:none}
.at-ticker::before{left:0;background:linear-gradient(90deg,rgba(13,17,32,0.95),transparent)}
.at-ticker::after{right:0;background:linear-gradient(-90deg,rgba(13,17,32,0.95),transparent)}
.at-tick-track{display:flex;align-items:center;height:100%;animation:tick-scroll 60s linear infinite;white-space:nowrap}
@keyframes tick-scroll{from{transform:translateX(0)}to{transform:translateX(-50%)}}
.at-tick-item{display:inline-flex;align-items:center;gap:8px;padding:0 18px;border-right:1px solid rgba(255,255,255,0.05);height:100%;font-size:11px;letter-spacing:0.03em}
.at-tick-sym{color:#E2E8F0;font-weight:500}
.at-tick-price{color:#8892A4;font-feature-settings:'tnum'}
.at-tick-up{color:#00D68A}.at-tick-dn{color:#F0506E}

/* MAIN GRID */
.at-main{
  flex:1;display:grid;
  grid-template-columns:256px 1fr 236px;
  grid-template-rows:1fr 168px;
  gap:1px;background:rgba(255,255,255,0.04);overflow:hidden;min-height:0;
}
.at-panel{background:rgba(13,17,32,0.85);backdrop-filter:blur(24px);position:relative;overflow:hidden;display:flex;flex-direction:column}
.at-ph{display:flex;align-items:center;justify-content:space-between;padding:9px 14px 8px;border-bottom:1px solid rgba(255,255,255,0.05);flex-shrink:0}
.at-ptitle{font-family:'Syne',sans-serif;font-size:10px;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;color:#8892A4}
.at-badge{font-size:9px;letter-spacing:0.06em;padding:2px 6px;border-radius:3px;text-transform:uppercase}
.at-badge-blue{background:rgba(30,107,255,0.15);color:#1E6BFF}
.at-badge-green{background:rgba(0,214,138,0.12);color:#00D68A}
.at-badge-amber{background:rgba(245,166,35,0.12);color:#F5A623}

/* MARKET LIST */
.at-mlist{flex:1;overflow-y:auto;scrollbar-width:none}
.at-mlist::-webkit-scrollbar{display:none}
.at-mi{display:grid;grid-template-columns:52px 1fr auto auto;align-items:center;gap:5px;padding:7px 12px;cursor:pointer;transition:background 0.18s;border-bottom:1px solid rgba(255,255,255,0.02);border-left:2px solid transparent}
.at-mi:hover{background:rgba(30,107,255,0.05)}
.at-mi.active{background:rgba(30,107,255,0.08);border-left-color:#1E6BFF}
.at-mi-sym{font-weight:500;font-size:12px;color:#E2E8F0}
.at-mi-name{font-size:10px;color:#4A5568;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.at-mi-price{font-size:12px;color:#E2E8F0;font-feature-settings:'tnum';text-align:right;transition:color 0.4s}
.at-mi-chg{font-size:10px;font-feature-settings:'tnum';text-align:right;padding:2px 5px;border-radius:3px;min-width:48px}
.at-mi-chg.up{color:#00D68A;background:rgba(0,214,138,0.08)}.at-mi-chg.dn{color:#F0506E;background:rgba(240,80,110,0.08)}
.at-mi-spark{grid-column:3/5;padding:2px 0 4px;display:flex;justify-content:flex-end}
@keyframes flash-g{0%,100%{background:transparent}40%{background:rgba(0,214,138,0.09)}}
@keyframes flash-r{0%,100%{background:transparent}40%{background:rgba(240,80,110,0.09)}}
.flash-g{animation:flash-g 0.6s ease}
.flash-r{animation:flash-r 0.6s ease}

/* CHART */
.at-chart-header-info{display:flex;align-items:baseline;gap:10px;flex:1;min-width:0}
.at-chart-sym{font-family:'Syne',sans-serif;font-size:10px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;color:#8892A4}
.at-chart-price{font-family:'Syne',sans-serif;font-size:22px;font-weight:700;letter-spacing:-0.02em;font-feature-settings:'tnum';transition:color 0.3s}
.at-chart-chg{font-size:12px;font-feature-settings:'tnum'}
.at-chart-chg.up{color:#00D68A}.at-chart-chg.dn{color:#F0506E}
.at-tfs{display:flex;gap:2px;margin-left:auto}
.at-tf{font-family:'DM Mono',monospace;font-size:10px;padding:3px 8px;border-radius:4px;border:1px solid transparent;background:transparent;color:#8892A4;cursor:pointer;transition:all 0.18s;letter-spacing:0.04em}
.at-tf:hover{color:#E2E8F0;border-color:rgba(255,255,255,0.06)}
.at-tf.active{background:rgba(30,107,255,0.15);color:#1E6BFF;border-color:rgba(30,107,255,0.3)}
.at-ohlc{display:flex;gap:14px;padding:4px 14px 7px;border-bottom:1px solid rgba(255,255,255,0.05);flex-shrink:0;flex-wrap:wrap}
.at-ohlc-item{display:flex;gap:4px;align-items:baseline}
.at-ohlc-l{font-size:9px;color:#4A5568;letter-spacing:0.06em}
.at-ohlc-v{font-size:10px;color:#8892A4;font-feature-settings:'tnum'}
.at-chart-wrap{flex:1;position:relative;padding:4px 12px 8px;min-height:0;cursor:crosshair}

/* SIGNALS */
.at-slist{flex:1;overflow-y:auto;padding:6px;display:flex;flex-direction:column;gap:5px;scrollbar-width:none}
.at-slist::-webkit-scrollbar{display:none}
.at-sig{background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.06);border-radius:6px;padding:8px 10px;transition:all 0.25s;animation:slide-in 0.35s ease}
@keyframes slide-in{from{opacity:0;transform:translateX(10px)}to{opacity:1;transform:translateX(0)}}
.at-sig:hover{border-color:rgba(30,107,255,0.22);background:rgba(30,107,255,0.05)}
.at-sig.alert-sig{border-color:rgba(245,166,35,0.3);background:rgba(245,166,35,0.04)}
.at-sig-h{display:flex;align-items:center;gap:6px;margin-bottom:3px}
.at-sig-icon{width:16px;height:16px;border-radius:3px;display:flex;align-items:center;justify-content:center;font-size:9px;flex-shrink:0}
.at-sig-title{font-size:11px;color:#E2E8F0;font-weight:500;flex:1}
.at-sig-time{font-size:9px;color:#4A5568;letter-spacing:0.02em}
.at-sig-desc{font-size:10px;color:#8892A4;line-height:1.5}
.at-sig-meta{display:flex;align-items:center;gap:6px;margin-top:4px}
.at-sig-sym{font-size:9px;color:#1E6BFF;background:rgba(30,107,255,0.15);padding:1px 5px;border-radius:2px;letter-spacing:0.04em}
.at-sig-prob{font-size:9px;color:#4A5568}
.at-sig-bar{flex:1;height:2px;background:rgba(255,255,255,0.06);border-radius:1px;overflow:hidden}
.at-sig-fill{height:100%;border-radius:1px;transition:width 0.5s ease}

/* HEATMAP / VOLUME */
.at-bot-panel{display:flex;flex-direction:row}
.at-hm-section{flex:1;display:flex;flex-direction:column}
.at-hm-section+.at-hm-section{border-left:1px solid rgba(255,255,255,0.05)}
.at-hm-title{font-family:'Syne',sans-serif;font-size:10px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;color:#8892A4;padding:7px 12px 5px;border-bottom:1px solid rgba(255,255,255,0.05)}
.at-hm-grid{display:grid;grid-template-columns:repeat(7,1fr);gap:3px;padding:7px 10px;flex:1}
.at-hm-cell{border-radius:3px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1px;cursor:pointer;transition:filter 0.2s;padding:3px 2px}
.at-hm-cell:hover{filter:brightness(1.35)}
.at-hm-sym{font-size:8px;font-weight:500;color:rgba(255,255,255,0.9);letter-spacing:0.02em}
.at-hm-val{font-size:8px;color:rgba(255,255,255,0.7);font-feature-settings:'tnum'}
.at-vol-section{flex:1;padding:6px 12px 8px;display:flex;flex-direction:column;gap:4px;overflow-y:auto;scrollbar-width:none}
.at-vol-row{display:grid;grid-template-columns:40px 1fr 50px;align-items:center;gap:6px}
.at-vol-sym{font-size:10px;color:#8892A4}
.at-vol-bg{background:rgba(255,255,255,0.04);border-radius:2px;height:5px;overflow:hidden}
.at-vol-fill{height:100%;border-radius:2px;background:linear-gradient(90deg,#1E6BFF,#00C8FF);transition:width 0.7s ease}
.at-vol-val{font-size:9px;color:#8892A4;text-align:right;font-feature-settings:'tnum'}

/* EVENTS */
.at-ev-list{flex:1;overflow-y:auto;padding:5px 8px;display:flex;flex-direction:column;gap:0;scrollbar-width:none}
.at-ev-list::-webkit-scrollbar{display:none}
.at-ev{display:flex;gap:7px;padding:5px 0;border-bottom:1px solid rgba(255,255,255,0.02);animation:slide-in 0.3s ease}
.at-ev-time{font-size:9px;color:#4A5568;width:36px;flex-shrink:0;padding-top:1px;font-feature-settings:'tnum'}
.at-ev-dot{width:5px;height:5px;border-radius:50%;flex-shrink:0;margin-top:4px}
.at-ev-text{font-size:10px;color:#8892A4;line-height:1.4;flex:1}

/* ALERT */
.at-alert{
  position:fixed;top:90px;left:50%;transform:translateX(-50%);
  background:rgba(13,17,32,0.97);border:1px solid rgba(245,166,35,0.4);border-radius:8px;
  padding:10px 16px;display:flex;align-items:center;gap:10px;z-index:999;
  backdrop-filter:blur(20px);box-shadow:0 0 30px rgba(245,166,35,0.1);
  transition:opacity 0.3s,transform 0.3s;pointer-events:none;
}
.at-alert.hidden{opacity:0;transform:translateX(-50%) translateY(-8px)}
.at-alert.visible{opacity:1;transform:translateX(-50%) translateY(0)}
.at-alert-icon{color:#F5A623;font-size:16px}
.at-alert-title{font-size:12px;color:#E2E8F0;letter-spacing:0.02em}
.at-alert-sub{font-size:10px;color:#8892A4;margin-top:1px}
`;

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────
export default function AnalystTerminal() {
  const [prices, setPrices] = useState(initPrices);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [chartData, setChartData] = useState(() => {
    const base = SYMBOLS[0].price;
    return Array.from({ length: 100 }, () => base * (1 + (Math.random() - 0.5) * 0.05));
  });
  const [sectors, setSectors] = useState(SECTORS.map(s => ({ ...s })));
  const [volData, setVolData] = useState(SYMBOLS.slice(0, 8).map(s => ({ sym: s.sym, vol: rand(20, 80) })));
  const [signals, setSignals] = useState([]);
  const [events, setEvents] = useState([]);
  const [clock, setClock] = useState(nowTime());
  const [tf, setTf] = useState("5D");
  const [alert, setAlert] = useState({ visible: false, title: "", sub: "" });
  const [flashMap, setFlashMap] = useState({});

  const tickCount = useRef(0);
  const alertTimer = useRef(null);
  const styleInjected = useRef(false);

  // Inject CSS once
  useEffect(() => {
    if (styleInjected.current) return;
    styleInjected.current = true;
    const el = document.createElement("style");
    el.textContent = CSS;
    document.head.appendChild(el);
  }, []);

  // Show alert
  const showAlert = useCallback((title, sub) => {
    setAlert({ visible: true, title, sub });
    clearTimeout(alertTimer.current);
    alertTimer.current = setTimeout(() => setAlert(a => ({ ...a, visible: false })), 4000);
  }, []);

  // Add signal
  const addSignal = useCallback((tIdx, sIdx) => {
    const t = SIGNAL_TEMPLATES[tIdx];
    const sym = SYMBOLS[sIdx].sym;
    setSignals(prev => [{ ...t, sym, time: nowTime(), id: Date.now() + Math.random(), desc: t.desc(sym) }, ...prev].slice(0, 12));
  }, []);

  // Add event
  const addEvent = useCallback(() => {
    const t = EVENT_TEMPLATES[Math.floor(Math.random() * EVENT_TEMPLATES.length)];
    const s = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)].sym;
    setEvents(prev => [{ color: t.color, text: t.text(s), time: nowHM(), id: Date.now() + Math.random() }, ...prev].slice(0, 15));
  }, []);

  // Tick engine
  useEffect(() => {
    // Seed initial signals & events
    addSignal(0, 2); addSignal(3, 6); addSignal(1, 0);
    for (let i = 0; i < 5; i++) addEvent();

    const interval = setInterval(() => {
      tickCount.current++;
      const tc = tickCount.current;

      setPrices(prev => {
        const next = prev.map(p => {
          const vol = 0.0007 + Math.random() * 0.001;
          const spike = Math.random() < 0.004;
          const move = spike ? (Math.random() - 0.5) * 0.04 : (Math.random() - 0.5) * vol * 2;
          const newPrice = Math.max(p.price * (1 + move), 0.01);
          const newChg = ((newPrice - p.open) / p.open) * 100;
          const newSpark = [...p.sparkData.slice(-29), newPrice];
          return { ...p, price: newPrice, high: Math.max(p.high, newPrice), low: Math.min(p.low, newPrice), chg: newChg, sparkData: newSpark, flash: Math.abs(move) > 0.002 ? (move > 0 ? "g" : "r") : null };
        });
        return next;
      });

      // Flash map
      setFlashMap(prev => {
        const next = { ...prev };
        SYMBOLS.forEach((_, i) => { if (Math.random() < 0.15) next[SYMBOLS[i].sym] = Math.random() > 0.5 ? "g" : "r"; else delete next[SYMBOLS[i].sym]; });
        return next;
      });

      // Chart data
      setChartData(prev => {
        const last = prev[prev.length - 1];
        const move = (Math.random() - 0.5) * 0.002;
        return [...prev.slice(-199), last * (1 + move)];
      });

      // Sector drift
      if (tc % 5 === 0) {
        setSectors(prev => prev.map(s => ({ ...s, chg: Math.max(-3, Math.min(3, s.chg + (Math.random() - 0.5) * 0.15)) })));
      }

      // Volume
      if (tc % 3 === 0) {
        setVolData(prev => prev.map(v => ({ ...v, vol: v.vol + rand(0.2, 1.5) })));
      }

      // Signals
      if (tc % 18 === 0) addSignal(Math.floor(Math.random() * SIGNAL_TEMPLATES.length), Math.floor(Math.random() * SYMBOLS.length));

      // Events
      if (tc % 8 === 0) addEvent();

      // Alerts
      if (tc % 60 === 0 && Math.random() < 0.5) {
        const s = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
        const msgs = [
          ["Unusual Market Activity Detected", `Volume spike on ${s.sym} — ${rand(2,4).toFixed(1)}× avg`],
          ["Volatility Alert", `${s.sym} IV expanding rapidly above threshold`],
          ["Cross-Asset Signal", "Sector rotation detected — TECH → FINC flow"],
        ];
        const m = msgs[Math.floor(Math.random() * msgs.length)];
        showAlert(m[0], m[1]);
      }

      setClock(nowTime());
    }, 1200);

    return () => clearInterval(interval);
  }, [addSignal, addEvent, showAlert]);

  // Select symbol → rebuild chart
  const handleSelect = (i) => {
    setSelectedIdx(i);
    const base = prices[i].price;
    const seed = Array.from({ length: 100 }, () => base * (1 + (Math.random() - 0.5) * 0.06));
    seed.push(base);
    setChartData(seed);
  };

  const selected = prices[selectedIdx];
  const chartColor = selected.chg >= 0 ? "green" : "red";
  const volMax = Math.max(...volData.map(v => v.vol));

  return (
    <div className="at-root">
      <div className="at-layer">

        {/* NAV */}
        <nav className="at-nav">
          <div className="at-logo">
            <div className="at-logo-dot" />
            ANALYST TERMINAL
          </div>
          <div className="at-divider" />
          <div className="at-status">
            <div className="at-sdot" />
            NYSE · MARKET OPEN
          </div>
          <div className="at-divider" />
          <div className="at-status">
            <span style={{ color: "#F5A623" }}>SESSION</span>&nbsp;·&nbsp;
            <span>V. SURGE DETECTED</span>
          </div>
          <div className="at-clock">{clock}</div>
          <div className="at-search">
            <svg className="at-search-icon" width="12" height="12" viewBox="0 0 16 16" fill="none">
              <circle cx="7" cy="7" r="5" stroke="white" strokeWidth="1.5" />
              <path d="M11 11L14 14" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <input type="text" placeholder="Search ticker..." />
          </div>
        </nav>

        {/* TICKER */}
        <div className="at-ticker">
          <div className="at-tick-track">
            {[...prices, ...prices].map((p, i) => (
              <div className="at-tick-item" key={i}>
                <span className="at-tick-sym">{p.sym}</span>
                <span className="at-tick-price">{fmt(p.price)}</span>
                <span className={p.chg >= 0 ? "at-tick-up" : "at-tick-dn"}>
                  {p.chg >= 0 ? "+" : ""}{fmt(p.chg, 2)}%
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* MAIN GRID */}
        <div className="at-main">

          {/* MARKET WATCH */}
          <div className="at-panel">
            <div className="at-ph">
              <span className="at-ptitle">Market Watch</span>
              <span className="at-badge at-badge-blue">LIVE</span>
            </div>
            <div className="at-mlist">
              {prices.map((p, i) => (
                <div
                  key={p.sym}
                  className={`at-mi ${i === selectedIdx ? "active" : ""} ${flashMap[p.sym] === "g" ? "flash-g" : flashMap[p.sym] === "r" ? "flash-r" : ""}`}
                  onClick={() => handleSelect(i)}
                >
                  <div>
                    <div className="at-mi-sym">{p.sym}</div>
                    <div className="at-mi-name">{p.name}</div>
                  </div>
                  <div />
                  <div className="at-mi-price" style={{ color: p.chg >= 0 ? "#00D68A" : "#F0506E" }}>{fmt(p.price)}</div>
                  <div className={`at-mi-chg ${p.chg >= 0 ? "up" : "dn"}`}>
                    {p.chg >= 0 ? "+" : ""}{fmt(p.chg, 2)}%
                  </div>
                  <div className="at-mi-spark">
                    <Sparkline data={p.sparkData} up={p.chg >= 0} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CHART */}
          <div className="at-panel">
            <div className="at-ph">
              <div className="at-chart-header-info">
                <span className="at-chart-sym">{selected.sym} — {selected.name.toUpperCase()}</span>
                <span className="at-chart-price" style={{ color: selected.chg >= 0 ? "#00D68A" : "#F0506E" }}>
                  {fmt(selected.price)}
                </span>
                <span className={`at-chart-chg ${selected.chg >= 0 ? "up" : "dn"}`}>
                  {selected.chg >= 0 ? "+" : ""}{fmt(selected.chg, 2)}%
                </span>
              </div>
              <div className="at-tfs">
                {["1D", "5D", "1M", "3M"].map(t => (
                  <button key={t} className={`at-tf ${tf === t ? "active" : ""}`} onClick={() => setTf(t)}>{t}</button>
                ))}
              </div>
            </div>
            <div className="at-ohlc">
              {[["O", fmt(selected.open)], ["H", fmt(selected.high)], ["L", fmt(selected.low)], ["C", fmt(selected.price)], ["VOL", fmtVol(selected.price * 45e4)]].map(([l, v]) => (
                <div className="at-ohlc-item" key={l}>
                  <span className="at-ohlc-l">{l}</span>
                  <span className="at-ohlc-v">{v}</span>
                </div>
              ))}
              <div className="at-ohlc-item" style={{ marginLeft: "auto" }}>
                <span className="at-ohlc-l">VWAP</span>
                <span className="at-ohlc-v" style={{ color: "#00C8FF" }}>{fmt(chartData.reduce((a, b) => a + b, 0) / chartData.length)}</span>
              </div>
            </div>
            <div className="at-chart-wrap">
              <PriceChart data={chartData} color={chartColor} />
            </div>
          </div>

          {/* SIGNALS */}
          <div className="at-panel">
            <div className="at-ph">
              <span className="at-ptitle">Signal System</span>
              <span className="at-badge at-badge-amber">{Math.min(signals.length, 9)} ACTIVE</span>
            </div>
            <div className="at-slist">
              {signals.map(sig => (
                <div key={sig.id} className={`at-sig ${sig.type === "warn" ? "alert-sig" : ""}`}>
                  <div className="at-sig-h">
                    <div className="at-sig-icon" style={{ background: sig.color + "22", color: sig.color }}>{sig.icon}</div>
                    <div className="at-sig-title">{sig.label}</div>
                    <div className="at-sig-time">{sig.time}</div>
                  </div>
                  <div className="at-sig-desc">{sig.desc}</div>
                  <div className="at-sig-meta">
                    <div className="at-sig-sym">{sig.sym}</div>
                    <div className="at-sig-bar">
                      <div className="at-sig-fill" style={{ width: sig.prob + "%", background: sig.color }} />
                    </div>
                    <div className="at-sig-prob">{sig.prob}%</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* BOTTOM: HEATMAP + VOLUME */}
          <div className="at-panel at-bot-panel">
            <div className="at-hm-section">
              <div className="at-hm-title">Sector Heatmap</div>
              <div className="at-hm-grid">
                {sectors.map(s => {
                  const pct = Math.min(Math.abs(s.chg) / 2, 1);
                  const bg = s.chg >= 0
                    ? `rgba(0,214,138,${0.12 + pct * 0.35})`
                    : `rgba(240,80,110,${0.12 + pct * 0.35})`;
                  return (
                    <div key={s.sym} className="at-hm-cell" style={{ background: bg }}>
                      <div className="at-hm-sym">{s.sym}</div>
                      <div className="at-hm-val">{s.chg >= 0 ? "+" : ""}{fmt(s.chg, 1)}%</div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="at-hm-section">
              <div className="at-hm-title">Volume Monitor</div>
              <div className="at-vol-section">
                {volData.map(v => (
                  <div key={v.sym} className="at-vol-row">
                    <div className="at-vol-sym">{v.sym}</div>
                    <div className="at-vol-bg">
                      <div className="at-vol-fill" style={{ width: (v.vol / volMax * 100) + "%" }} />
                    </div>
                    <div className="at-vol-val">{fmt(v.vol, 1)}M</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* EVENTS */}
          <div className="at-panel">
            <div className="at-ph">
              <span className="at-ptitle">Event Stream</span>
              <span className="at-badge at-badge-green">REAL-TIME</span>
            </div>
            <div className="at-ev-list">
              {events.map(ev => (
                <div key={ev.id} className="at-ev">
                  <div className="at-ev-time">{ev.time}</div>
                  <div className="at-ev-dot" style={{ background: ev.color, boxShadow: `0 0 5px ${ev.color}66` }} />
                  <div className="at-ev-text">{ev.text}</div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* ALERT */}
      <div className={`at-alert ${alert.visible ? "visible" : "hidden"}`}>
        <div className="at-alert-icon">⚠</div>
        <div>
          <div className="at-alert-title">{alert.title}</div>
          <div className="at-alert-sub">{alert.sub}</div>
        </div>
      </div>
    </div>
  );
}
