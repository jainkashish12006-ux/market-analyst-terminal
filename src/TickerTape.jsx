import { useRef, useEffect } from "react";
import { useTheme } from "./ThemeContext";
import { COMPANIES } from "./useDataStream";

export function TickerTape({ symMap }) {
  const { theme: t } = useTheme();
  const ref = useRef(null);

  const symbols = Object.keys(symMap);
  // Duplicate for seamless loop
  const items = [...symbols, ...symbols];

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let pos = 0;
    const speed = 0.5;
    const raf = () => {
      pos -= speed;
      if (Math.abs(pos) >= el.scrollWidth / 2) pos = 0;
      el.style.transform = `translateX(${pos}px)`;
      id = requestAnimationFrame(raf);
    };
    let id = requestAnimationFrame(raf);
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <div style={{
      height: 34, overflow: "hidden", position: "relative",
      background: t.tickerBg, borderBottom: `1px solid ${t.border}`,
      display: "flex", alignItems: "center",
    }}>
      {/* Edge fades */}
      <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 60, zIndex: 2,
        background: `linear-gradient(90deg, ${t.bg}, transparent)`, pointerEvents: "none" }} />
      <div style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: 60, zIndex: 2,
        background: `linear-gradient(-90deg, ${t.bg}, transparent)`, pointerEvents: "none" }} />

      <div ref={ref} style={{ display: "flex", alignItems: "center", gap: 0, whiteSpace: "nowrap", willChange: "transform" }}>
        {items.map((sym, i) => {
          const d = symMap[sym];
          if (!d) return null;
          const up = d.change >= 0;
          const color = up ? t.green : t.red;
          return (
            <span key={`${sym}-${i}`} style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "0 20px" }}>
              <span style={{ fontFamily: t.fontMono, fontSize: 11, fontWeight: 700, color: t.textSub, letterSpacing: "0.06em" }}>{sym}</span>
              <span style={{ fontFamily: t.fontMono, fontSize: 11, color: t.text }}>
                {d.price > 100 ? d.price.toFixed(2) : d.price.toFixed(4)}
              </span>
              <span style={{ fontFamily: t.fontMono, fontSize: 10, color, fontWeight: 700 }}>
                {up ? "▲" : "▼"} {Math.abs(d.change * 100).toFixed(2)}%
              </span>
              <span style={{ width: 1, height: 14, background: t.border, marginLeft: 4 }} />
            </span>
          );
        })}
      </div>
    </div>
  );
}
