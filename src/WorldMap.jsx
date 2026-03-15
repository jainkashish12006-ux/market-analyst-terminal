import { useState, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "./ThemeContext";
import { ComposableMap, Geographies, Geography, Marker } from "react-simple-maps";

// World map TopoJSON URL
const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-50m.json";

// Regional markers with real Lat/Lng
const REGION_MARKERS = [
  { id: "us",  name: "North America", coordinates: [-100, 40], symbols: ["AAPL","MSFT","NVDA","GOOGL","AMZN","TSLA","META","JPM","V"] },
  { id: "sa",  name: "South America", coordinates: [-60, -15], symbols: ["BRK"] },
  { id: "eu",  name: "Europe",        coordinates: [15, 50],   symbols: ["EURUSD"] },
  { id: "af",  name: "Africa",        coordinates: [20, 0],    symbols: ["GOLD"] },
  { id: "me",  name: "Middle East",   coordinates: [45, 25],   symbols: ["XOM","WTI"] },
  { id: "cn",  name: "Asia Pacific",  coordinates: [105, 35],  symbols: ["BTC","ETH"] },
  { id: "au",  name: "Australia",     coordinates: [135, -25], symbols: [] },
  { id: "jp",  name: "Japan",         coordinates: [138, 36],  symbols: [] },
];

const CONNECTIONS = [
  { from: "us", to: "eu" },
  { from: "us", to: "cn" },
  { from: "eu", to: "me" },
  { from: "me", to: "cn" },
];

export function WorldMap({ symMap, onSymbolSelect }) {
  const { theme: t } = useTheme();
  const [hovered, setHovered] = useState(null);
  const svgRef = useRef(null);
  const isDeep = t.name === "deepSea";

  const landFill = isDeep ? "#1a2744" : "#c8d8c0";
  const landStroke = isDeep ? "#253660" : "#aabba2";
  const oceanFill = isDeep ? "#070f1f" : "#ddeef5";
  const gridColor = isDeep ? "rgba(0,229,255,0.06)" : "rgba(79,121,66,0.08)";
  const graticuleFill = isDeep ? "#0d1830" : "#e8f4ea";

  return (
    <div style={{ background: t.glass, backdropFilter: "blur(12px)",
      borderRadius: t.cardRadius, border: `1px solid ${t.border}`,
      overflow: "hidden", boxShadow: t.shadow }}>

      {/* Header */}
      <div style={{ padding: "13px 18px", borderBottom: `1px solid ${t.border}`,
        display: "flex", justifyContent: "space-between", alignItems: "center",
        background: isDeep ? "rgba(0,229,255,0.03)" : "rgba(79,121,66,0.03)" }}>
        <span style={{ fontFamily: t.fontDisplay, fontSize: 13, fontWeight: 700, color: t.text }}>
          Global Reach by Region
        </span>
        <span style={{ fontSize: 10, color: t.accent, fontFamily: t.fontMono, cursor: "pointer" }}>
          View Details →
        </span>
      </div>
      <div style={{ display: "flex", height: "420px", overflow: "hidden", position: "relative" }}>
        {/* Ocean Background Gradient */}
        <div style={{ position: "absolute", inset: 0, background: isDeep ? `radial-gradient(ellipse at center, #0a1628 0%, ${oceanFill} 100%)` : `radial-gradient(ellipse at center, #d4eaf5 0%, ${oceanFill} 100%)`, zIndex: 0 }} />
        
        {/* Map */}
        <div style={{ flex: 1, position: "relative", zIndex: 1 }}>
          <ComposableMap
            projection="geoEqualEarth"
            projectionConfig={{ scale: 450, center: [10, 20] }}
            style={{ width: "100%", height: "100%", display: "block" }}
          >
            {/* Base Countries */}
            <Geographies geography={geoUrl}>
              {({ geographies }) =>
                geographies.map((geo) => (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill={isDeep ? landFill : "#c0d4b8"}
                    stroke={landStroke}
                    strokeWidth={0.5}
                    style={{
                      default: { outline: "none" },
                      hover: { fill: isDeep ? "#253d66" : "#b0cca8", outline: "none", transition: "all 0.2s" },
                      pressed: { outline: "none" },
                    }}
                  />
                ))
              }
            </Geographies>

            {/* Region Markers */}
            {REGION_MARKERS.map((region) => {
              const stocks = region.symbols.map((s) => symMap[s]).filter(Boolean);
              if (!stocks.length) return null;

              const avgChange = stocks.reduce((a, s) => a + s.change, 0) / stocks.length;
              const isUp = avgChange >= 0;
              const color = isUp ? t.green : t.red;
              const isHov = hovered === region.id;

              return (
                <Marker
                  key={region.id}
                  coordinates={region.coordinates}
                  onMouseEnter={() => setHovered(region.id)}
                  onMouseLeave={() => setHovered(null)}
                >
                  <g style={{ cursor: "pointer" }}>
                    {isHov && (
                      <circle cx={0} cy={0} r={18} fill={`${color}12`} stroke={`${color}35`} strokeWidth={0.8} />
                    )}
                    <circle cx={0} cy={0} r={10} fill={`${color}25`} style={{ filter: "blur(4px)" }} />
                    <circle cx={0} cy={0} r={6} fill={color} style={{ filter: `drop-shadow(0 0 6px ${color})` }} />
                    <circle cx={0} cy={0} r={2.5} fill="#fff" opacity={0.9} />

                    {/* Label Pill */}
                    <rect x={10} y={-13} width={86} height={26} rx={8}
                      fill={isDeep ? "rgba(7,11,20,0.9)" : "rgba(255,255,255,0.92)"}
                      stroke={`${color}45`} strokeWidth={0.8}
                      style={{ filter: isHov ? `drop-shadow(0 2px 8px ${color}40)` : "none" }} />
                    <text x={18} y={-3} fontSize={8.5} fontWeight={800} fill={color} fontFamily="JetBrains Mono, monospace">
                      {region.symbols.slice(0, 2).join("·")}
                    </text>
                    <text x={18} y={9} fontSize={7.5} fill={isDeep ? "#8899bb" : "#5a7050"} fontFamily="JetBrains Mono, monospace">
                      {isUp ? "▲" : "▼"}{Math.abs(avgChange * 100).toFixed(1)}%
                      {stocks.length > 1 ? ` +${stocks.length - 1}` : ""}
                    </text>
                  </g>
                </Marker>
              );
            })}
          </ComposableMap>

          {/* Hover tooltip popup overlay */}
          <AnimatePresence>
            {hovered && (() => {
              const region = REGION_MARKERS.find(r => r.id === hovered);
              if (!region) return null;
              const stocks = region.symbols.map(s => symMap[s]).filter(Boolean);
              if (!stocks.length) return null;
              return (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 10 }}
                  style={{
                    position: "absolute",
                    top: "10%",
                    right: 20,
                    width: 160,
                    background: isDeep ? "rgba(7,11,20,0.95)" : "rgba(255,255,255,0.96)",
                    border: `1px solid ${t.accent}40`,
                    borderRadius: 8,
                    padding: 12,
                    boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
                    pointerEvents: "none",
                    zIndex: 10,
                  }}
                >
                  <div style={{ fontSize: 10, fontWeight: 800, color: t.accent, fontFamily: t.fontMono, marginBottom: 6 }}>
                    {region.name}
                  </div>
                  {stocks.slice(0, 5).map((s, i) => {
                    const up = s.change >= 0;
                    return (
                      <div key={s.symbol} style={{ display: "flex", justifyContent: "space-between", marginBottom: 4, fontFamily: t.fontMono, fontSize: 10 }}>
                        <span style={{ color: isDeep ? "#8899bb" : "#5a7050", fontWeight: 700 }}>{s.symbol}</span>
                        <span style={{ color: up ? t.green : t.red, fontWeight: 700 }}>{up ? "▲" : "▼"}{(s.change * 100).toFixed(2)}%</span>
                      </div>
                    );
                  })}
                </motion.div>
              );
            })()}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
