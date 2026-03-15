import { useState, useRef, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Search, TrendingUp, TrendingDown, ArrowUpRight, X, BarChart2 } from "lucide-react";
import { useTheme } from "./ThemeContext";
import { COMPANIES, SECTORS, BASE } from "./useDataStream";

const PERIODS = [
  { id: "1m", label: "1 Month", months: 1 },
  { id: "5m", label: "5 Months", months: 5 },
  { id: "1y", label: "1 Year", months: 12 },
];

// Generate realistic historical price series
function genHistory(basePrice, months) {
  const days = months * 22;
  const prices = [basePrice];
  for (let i = 1; i < days; i++) {
    const trend = (Math.random() - 0.47) * 0.012;
    const noise = (Math.random() - 0.5) * 0.018;
    prices.push(Math.max(prices[prices.length - 1] * (1 + trend + noise), basePrice * 0.4));
  }
  return prices;
}

// Canvas chart component
function StockChart({ symbol, history, currentPrice, theme: t, height = 100 }) {
  const canvasRef = useRef(null);
  const isUp = currentPrice >= history[0];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !history.length) return;
    const ctx = canvas.getContext("2d");
    const W = canvas.offsetWidth * devicePixelRatio;
    const H = height * devicePixelRatio;
    canvas.width = W; canvas.height = H;
    ctx.scale(devicePixelRatio, devicePixelRatio);
    const w = canvas.offsetWidth;
    const h = height;
    ctx.clearRect(0, 0, w, h);

    const min = Math.min(...history) * 0.995;
    const max = Math.max(...history) * 1.005;
    const rng = max - min;

    const pts = history.map((v, i) => ({
      x: (i / (history.length - 1)) * w,
      y: h - ((v - min) / rng) * (h - 16) - 6,
    }));

    const color = isUp ? t.green : t.red;

    // Gradient fill
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, color + "35");
    grad.addColorStop(1, color + "00");
    ctx.beginPath();
    ctx.moveTo(0, h);
    ctx.lineTo(pts[0].x, pts[0].y);
    for (let i = 1; i < pts.length; i++) {
      const cpx = (pts[i-1].x + pts[i].x) / 2;
      ctx.bezierCurveTo(cpx, pts[i-1].y, cpx, pts[i].y, pts[i].x, pts[i].y);
    }
    ctx.lineTo(pts[pts.length-1].x, h);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();

    // Stroke
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.lineJoin = "round";
    ctx.shadowBlur = t.name === "deepSea" ? 8 : 2;
    ctx.shadowColor = color;
    ctx.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < pts.length; i++) {
      const cpx = (pts[i-1].x + pts[i].x) / 2;
      ctx.bezierCurveTo(cpx, pts[i-1].y, cpx, pts[i].y, pts[i].x, pts[i].y);
    }
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Current price dot
    const last = pts[pts.length - 1];
    ctx.beginPath();
    ctx.arc(last.x, last.y, 4, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.shadowBlur = 10; ctx.shadowColor = color;
    ctx.fill();
    ctx.shadowBlur = 0;

    // Zero baseline
    ctx.strokeStyle = t.border;
    ctx.lineWidth = 0.5;
    ctx.setLineDash([3, 5]);
    const baseY = h - ((history[0] - min) / rng) * (h - 16) - 6;
    ctx.beginPath(); ctx.moveTo(0, baseY); ctx.lineTo(w, baseY); ctx.stroke();
    ctx.setLineDash([]);
  }, [history, t, height, isUp]);

  return <canvas ref={canvasRef} style={{ width: "100%", height, display: "block" }} />;
}

// Summary stat
function PerfStat({ label, value, color, sub }) {
  const { theme: t } = useTheme();
  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ fontFamily: t.fontMono, fontSize: 16, fontWeight: 800, color: color || t.text }}>{value}</div>
      <div style={{ fontSize: 10, color: t.textSub, fontFamily: t.fontDisplay, marginTop: 1 }}>{label}</div>
      {sub && <div style={{ fontSize: 9, color: t.textDim, fontFamily: t.fontMono }}>{sub}</div>}
    </div>
  );
}

export function PerformancePage({ symMap }) {
  const { theme: t } = useTheme();
  const [period, setPeriod] = useState("1y");
  const [search, setSearch] = useState("");
  const [featured, setFeatured] = useState("AAPL");

  const months = PERIODS.find(p => p.id === period)?.months || 12;

  // Generate once per symbol+period
  const histories = useMemo(() => {
    return Object.fromEntries(
      Object.keys(symMap).map(sym => [sym, genHistory(BASE[sym] || symMap[sym]?.basePrice || 100, months)])
    );
  }, [period, symMap]);

  const symbols = Object.keys(symMap).filter(s =>
    !search || s.toLowerCase().includes(search.toLowerCase()) || (COMPANIES[s] || "").toLowerCase().includes(search.toLowerCase())
  );

  const totalReturn = useMemo(() => {
    const vals = Object.entries(histories).map(([sym, hist]) => {
      const start = hist[0], end = hist[hist.length - 1];
      return (end - start) / start;
    });
    return vals.reduce((a, v) => a + v, 0) / vals.length;
  }, [histories]);

  const bestSym = useMemo(() => {
    return Object.entries(histories).sort((a, b) => {
      const retA = (a[1][a[1].length-1] - a[1][0]) / a[1][0];
      const retB = (b[1][b[1].length-1] - b[1][0]) / b[1][0];
      return retB - retA;
    })[0]?.[0];
  }, [histories]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h2 style={{ fontFamily: t.fontDisplay, fontSize: 20, fontWeight: 800, color: t.text, marginBottom: 4 }}>
            Portfolio Performance
          </h2>
          <p style={{ fontSize: 12, color: t.textSub, fontFamily: t.fontDisplay }}>
            Historical return analysis across all tracked instruments
          </p>
        </div>
        {/* Period picker */}
        <div style={{ display: "flex", gap: 4, background: t.glass, backdropFilter: t.glassBlur,
          borderRadius: 10, padding: 3, border: `1px solid ${t.border}`, boxShadow: t.shadow }}>
          {PERIODS.map(p => (
            <button key={p.id} onClick={() => setPeriod(p.id)}
              style={{ padding: "6px 16px", borderRadius: 8, border: "none", cursor: "pointer",
                background: period === p.id ? t.accent : "transparent",
                color: period === p.id ? "#000" : t.textSub,
                fontFamily: t.fontDisplay, fontSize: 12, fontWeight: 700, transition: "all 0.2s" }}>
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Summary cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
        {[
          { label: "Portfolio Return", value: `${totalReturn >= 0 ? "+" : ""}${(totalReturn * 100).toFixed(2)}%`, color: totalReturn >= 0 ? t.green : t.red },
          { label: "Best Performer", value: bestSym || "—", color: t.accent, sub: "this period" },
          { label: "Instruments", value: Object.keys(symMap).length, color: t.text },
          { label: "Period", value: PERIODS.find(p => p.id === period)?.label, color: t.textSub },
        ].map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            style={{ background: t.glass, backdropFilter: t.glassBlur,
              borderRadius: t.cardRadius, border: `1px solid ${t.border}`,
              padding: "16px", boxShadow: t.shadow }}>
            <PerfStat {...s} />
          </motion.div>
        ))}
      </div>

      {/* Featured chart */}
      <motion.div
        layout
        style={{ background: t.glass, backdropFilter: t.glassBlur,
          borderRadius: t.cardRadius, border: `1px solid ${t.border}`,
          padding: "16px", boxShadow: t.shadow }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
              <span style={{ fontFamily: t.fontMono, fontSize: 18, fontWeight: 800, color: t.accent }}>{featured}</span>
              <span style={{ fontFamily: t.fontDisplay, fontSize: 12, color: t.textSub }}>{COMPANIES[featured]}</span>
              <span style={{ fontFamily: t.fontDisplay, fontSize: 11, color: t.textSub }}>{SECTORS[featured]}</span>
            </div>
            {histories[featured] && (() => {
              const hist = histories[featured];
              const ret = (hist[hist.length-1] - hist[0]) / hist[0];
              const isUp = ret >= 0;
              return (
                <div style={{ display: "flex", gap: 12, marginTop: 4 }}>
                  <span style={{ fontFamily: t.fontMono, fontSize: 13, fontWeight: 700,
                    color: isUp ? t.green : t.red }}>
                    {isUp ? "▲" : "▼"} {Math.abs(ret * 100).toFixed(2)}% this period
                  </span>
                  <span style={{ fontFamily: t.fontMono, fontSize: 12, color: t.textSub }}>
                    ${hist[0].toFixed(2)} → ${hist[hist.length-1].toFixed(2)}
                  </span>
                </div>
              );
            })()}
          </div>
          <div style={{ display: "flex", gap: 4 }}>
            {Object.keys(symMap).slice(0, 6).map(sym => (
              <button key={sym} onClick={() => setFeatured(sym)}
                style={{ padding: "4px 10px", borderRadius: 7, border: `1px solid ${featured === sym ? t.accent + "50" : t.border}`,
                  background: featured === sym ? `${t.accent}18` : t.glass, backdropFilter: "blur(4px)",
                  color: featured === sym ? t.accent : t.textSub,
                  fontFamily: t.fontMono, fontSize: 10, fontWeight: 700, cursor: "pointer", transition: "all 0.15s" }}>
                {sym}
              </button>
            ))}
          </div>
        </div>
        {histories[featured] && (
          <StockChart
            symbol={featured}
            history={histories[featured]}
            currentPrice={symMap[featured]?.price || BASE[featured]}
            theme={t}
            height={160}
          />
        )}
      </motion.div>

      {/* Search + grid */}
      <div style={{ position: "relative" }}>
        <Search size={13} color={t.textSub} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} />
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search stocks by name or symbol…"
          style={{ width: "100%", padding: "10px 12px 10px 34px", borderRadius: 10,
            background: t.glass, backdropFilter: t.glassBlur,
            border: `1px solid ${t.border}`, color: t.text,
            fontFamily: t.fontDisplay, fontSize: 13, outline: "none" }} />
        {search && (
          <button onClick={() => setSearch("")}
            style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)",
              background: "none", border: "none", cursor: "pointer", color: t.textSub }}>
            <X size={13} />
          </button>
        )}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12 }}>
        {symbols.map((sym, i) => {
          const hist = histories[sym];
          if (!hist) return null;
          const start = hist[0], end = hist[hist.length - 1];
          const ret = (end - start) / start;
          const isUp = ret >= 0;
          const color = isUp ? t.green : t.red;
          return (
            <motion.div key={sym}
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.025 }}
              onClick={() => setFeatured(sym)}
              style={{ background: featured === sym ? `${t.accent}06` : t.glass, backdropFilter: t.glassBlur,
                borderRadius: t.cardRadius, border: `1px solid ${featured === sym ? t.accent + "50" : t.border}`,
                padding: "14px", boxShadow: t.shadow, cursor: "pointer",
                transition: "border-color 0.2s" }}>

              {/* Header */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                    <span style={{ fontFamily: t.fontMono, fontSize: 13, fontWeight: 800, color: t.text }}>{sym}</span>
                    <span style={{ fontSize: 9, color: t.textSub, background: t.glass,
                      border: `1px solid ${t.border}`, padding: "1px 6px", borderRadius: 5,
                      fontFamily: t.fontDisplay }}>{SECTORS[sym]}</span>
                  </div>
                  <div style={{ fontSize: 10, color: t.textDim, fontFamily: t.fontDisplay, marginTop: 2 }}>
                    {COMPANIES[sym]}
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontFamily: t.fontMono, fontSize: 14, fontWeight: 800, color }}>
                    {isUp ? "+" : ""}{(ret * 100).toFixed(2)}%
                  </div>
                  <div style={{ fontSize: 9, color: t.textDim, fontFamily: t.fontMono }}>
                    ${start.toFixed(0)} → ${end.toFixed(0)}
                  </div>
                </div>
              </div>

              {/* Chart */}
              <StockChart symbol={sym} history={hist} currentPrice={end} theme={t} height={70} />

              {/* Stats row */}
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
                <div style={{ fontSize: 10, color: t.textDim, fontFamily: t.fontMono }}>
                  High: ${Math.max(...hist).toFixed(0)}
                </div>
                <div style={{ fontSize: 10, color: t.textDim, fontFamily: t.fontMono }}>
                  Low: ${Math.min(...hist).toFixed(0)}
                </div>
                <div style={{ fontSize: 10, color: t.textDim, fontFamily: t.fontMono }}>
                  Vol: {((symMap[sym]?.volume || 0) / 1e6).toFixed(1)}M
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {symbols.length === 0 && (
        <div style={{ textAlign: "center", padding: "60px 0" }}>
          <BarChart2 size={36} color={t.textDim} style={{ margin: "0 auto 12px" }} />
          <div style={{ color: t.textSub, fontFamily: t.fontDisplay, fontSize: 14 }}>No matching stocks</div>
        </div>
      )}
    </div>
  );
}
