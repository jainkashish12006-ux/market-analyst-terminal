import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "./ThemeContext";

// More detailed region shapes and marker positions
const REGION_MARKERS = [
  { id: "us",  name: "North America", x: 175, y: 160, symbols: ["AAPL","MSFT","NVDA","GOOGL","AMZN","TSLA","META","JPM","V"] },
  { id: "sa",  name: "South America", x: 250, y: 280, symbols: ["BRK"] },
  { id: "eu",  name: "Europe",        x: 460, y: 142, symbols: ["EURUSD"] },
  { id: "af",  name: "Africa",        x: 462, y: 230, symbols: ["GOLD"] },
  { id: "me",  name: "Middle East",   x: 530, y: 192, symbols: ["XOM","WTI"] },
  { id: "ru",  name: "Russia",        x: 580, y: 118, symbols: [] },
  { id: "cn",  name: "Asia Pacific",  x: 680, y: 175, symbols: ["BTC","ETH"] },
  { id: "au",  name: "Australia",     x: 718, y: 295, symbols: [] },
];

const CONNECTIONS = [
  { from: "us", to: "eu" },
  { from: "us", to: "cn" },
  { from: "eu", to: "cn" },
  { from: "eu", to: "me" },
  { from: "cn", to: "au" },
  { from: "us", to: "sa" },
];

// Realistic country shapes as SVG path data (viewBox 0 0 920 420)
// Extracted from simplified high-res equirectangular world map
const LAND_SHAPES = [
  // North America (US/Canada/Mexico)
  { d: "M 103,79 C 103,79 104,74 107,72 C 109,70 120,68 120,68 C 120,68 125,64 128,64 C 130,64 135,62 135,62 C 135,62 143,62 145,64 C 147,66 150,68 152,69 C 154,71 161,73 166,74 C 170,75 174,78 178,79 C 182,80 188,78 191,78 C 195,78 200,81 202,83 C 205,86 208,89 211,92 C 215,95 218,97 220,99 C 223,101 228,103 234,103 C 240,103 246,101 250,102 C 255,103 259,106 261,109 C 263,112 268,118 270,123 C 272,127 274,136 274,138 C 274,141 276,146 276,151 C 276,155 272,165 269,168 C 266,171 262,176 259,180 C 256,183 254,188 250,192 C 247,195 242,198 238,200 C 235,203 226,206 221,207 C 217,208 212,207 207,205 C 203,204 196,203 192,201 C 188,200 183,198 181,196 C 178,194 175,191 170,188 C 166,184 159,181 156,180 C 153,178 147,175 143,173 C 140,171 133,168 130,166 C 127,163 123,161 118,157 C 114,154 110,150 106,145 C 103,141 99,136 96,132 C 93,127 90,121 88,116 C 85,112 85,107 85,103 C 85,99 87,90 90,87 C 94,84 97,80 103,79 Z", region: "us" },
  // Greenland
  { d: "M 307,24 C 307,24 316,22 319,22 C 322,22 340,18 344,19 C 347,20 358,26 361,28 C 364,30 367,31 364,35 C 362,39 356,47 353,49 C 349,52 344,55 340,54 C 336,53 328,52 325,51 C 321,49 313,44 310,41 C 307,38 307,35 307,32 C 307,28 307,24 307,24 Z", region: null },
  // South America
  { d: "M 233,212 C 233,212 242,210 245,210 C 248,210 256,211 261,213 C 265,214 274,218 280,222 C 285,225 292,230 295,235 C 298,239 303,245 306,248 C 308,252 313,261 313,264 C 313,268 316,275 316,278 C 316,281 315,291 313,294 C 312,298 309,307 308,310 C 306,314 301,326 298,328 C 295,331 292,339 289,343 C 286,346 280,351 275,354 C 271,357 265,361 261,364 C 256,366 254,360 250,357 C 247,354 241,349 238,349 C 234,349 229,347 225,343 C 221,340 216,334 214,331 C 211,327 207,321 206,317 C 205,313 203,306 203,303 C 203,299 200,290 200,287 C 200,283 203,277 203,273 C 203,269 205,263 205,259 C 205,255 208,248 211,245 C 213,241 217,235 218,231 C 220,227 225,220 228,217 C 230,214 233,212 233,212 Z", region: "sa" },
  // Europe
  { d: "M 425,75 C 425,75 435,74 440,73 C 445,71 454,72 458,74 C 462,75 470,75 475,75 C 479,75 486,76 490,78 C 494,80 500,81 506,82 C 511,83 516,84 521,85 C 526,87 530,90 535,93 C 540,95 545,99 548,103 C 551,107 555,113 555,118 C 555,122 552,128 550,132 C 548,136 543,140 539,141 C 536,143 528,145 525,145 C 521,145 512,146 508,146 C 504,146 497,146 494,146 C 490,146 480,146 476,146 C 472,146 461,145 457,144 C 454,142 449,140 445,138 C 441,135 436,134 433,131 C 429,129 423,124 420,121 C 418,118 415,111 414,107 C 414,103 416,98 418,94 C 420,90 422,81 425,75 Z", region: "eu" },
  // UK / Ireland
  { d: "M 419,89 C 419,89 424,88 427,87 C 430,86 433,86 433,90 C 433,93 430,96 427,99 C 425,102 423,105 419,105 C 416,105 410,103 408,101 C 406,99 406,97 406,94 C 406,91 411,88 415,88 C 415,88 419,89 419,89 Z", region: "eu" },
  // Africa
  { d: "M 416,162 C 416,162 422,160 426,159 C 430,157 441,157 445,157 C 449,157 458,157 463,157 C 468,157 477,156 483,156 C 488,156 500,156 504,157 C 509,158 518,161 523,164 C 528,167 537,171 540,175 C 544,179 554,188 557,192 C 560,196 564,204 564,208 C 564,213 564,222 562,226 C 561,230 556,239 555,243 C 553,248 548,256 545,260 C 542,264 537,273 535,277 C 532,282 525,291 522,295 C 519,300 511,308 506,311 C 502,314 494,319 491,320 C 487,322 478,321 475,320 C 471,319 462,318 459,316 C 455,313 446,307 443,303 C 440,299 432,291 429,286 C 426,281 422,274 420,270 C 418,266 414,258 413,253 C 412,248 409,240 409,235 C 409,230 407,220 408,215 C 409,210 411,202 411,198 C 412,193 410,183 408,179 C 406,174 405,170 407,167 C 410,165 416,162 416,162 Z", region: "af" },
  // Middle East
  { d: "M 529,157 C 529,157 536,155 540,154 C 545,153 552,154 556,155 C 561,156 569,156 574,158 C 578,160 584,162 588,164 C 592,166 597,171 600,174 C 603,178 607,185 607,189 C 607,193 607,203 603,206 C 599,209 589,211 585,212 C 581,213 570,212 566,211 C 562,210 558,206 555,203 C 552,200 545,195 542,191 C 539,187 532,180 530,176 C 528,171 526,163 526,159 C 526,155 529,157 529,157 Z", region: "me" },
  // Russia/Siberia
  { d: "M 533,59 C 533,59 548,56 555,55 C 561,54 586,52 595,53 C 603,54 624,56 632,57 C 640,59 663,60 671,62 C 679,64 703,66 710,67 C 718,69 735,71 742,73 C 749,76 764,79 770,81 C 777,84 791,89 797,93 C 802,96 805,102 805,106 C 805,111 802,118 798,121 C 794,124 783,126 779,126 C 774,126 756,122 751,120 C 746,118 726,114 719,114 C 712,114 690,111 681,111 C 673,111 654,111 646,110 C 638,109 618,106 612,105 C 605,103 585,99 579,97 C 572,95 558,90 552,88 C 546,86 534,80 529,78 C 524,76 517,73 514,70 C 511,67 523,61 533,59 Z", region: "ru" },
  // India / South Asia
  { d: "M 606,145 C 606,145 613,142 618,141 C 623,140 634,142 638,145 C 643,148 650,154 654,158 C 658,162 663,171 665,176 C 667,181 671,192 670,197 C 669,202 665,213 661,217 C 658,221 650,229 646,231 C 641,234 629,235 625,233 C 620,231 610,225 607,221 C 603,217 598,206 597,202 C 596,197 593,186 594,181 C 594,176 598,165 601,161 C 604,157 606,145 606,145 Z", region: "cn" },
  // East Asia
  { d: "M 686,117 C 686,117 694,115 699,115 C 704,115 715,116 720,118 C 725,120 735,124 740,127 C 745,130 754,136 757,140 C 761,145 768,154 770,160 C 772,165 777,178 775,183 C 773,188 765,200 760,203 C 755,206 743,205 738,203 C 733,200 720,193 717,189 C 713,185 704,174 702,170 C 699,165 690,154 688,150 C 685,145 677,133 677,129 C 677,124 686,117 686,117 Z", region: "cn" },
  // Japan
  { d: "M 788,127 C 788,127 794,124 797,124 C 800,124 810,128 812,132 C 815,136 820,146 818,150 C 816,154 810,163 806,164 C 803,165 794,166 791,163 C 788,160 782,151 780,147 C 778,143 784,132 788,127 Z", region: "cn" },
  // Southeast Asia
  { d: "M 716,198 C 716,198 724,195 728,195 C 732,195 739,195 744,198 C 748,200 757,206 760,210 C 763,214 767,222 767,226 C 767,230 762,240 758,242 C 754,245 744,247 740,246 C 735,244 725,238 722,235 C 718,231 710,218 709,214 C 708,209 716,198 716,198 Z", region: "cn" },
  // Australia
  { d: "M 711,269 C 711,269 722,263 728,262 C 734,260 748,258 755,258 C 762,258 777,260 783,263 C 790,266 805,274 810,279 C 815,284 824,296 827,302 C 829,308 831,320 830,326 C 828,332 821,343 816,347 C 810,351 794,357 788,358 C 782,359 766,358 760,356 C 754,354 737,345 733,341 C 728,336 714,321 712,316 C 710,310 706,298 707,292 C 708,286 711,269 711,269 Z", region: "au" },
  // New Zealand
  { d: "M 845,322 C 845,322 849,319 852,319 C 855,319 862,323 864,326 C 867,330 871,338 870,342 C 869,346 864,353 860,354 C 857,355 850,354 847,352 C 844,349 840,342 840,338 C 840,334 845,322 845,322 Z", region: "au" },
  // Indonesia / Papua
  { d: "M 732,246 C 732,246 743,243 748,243 C 753,244 767,247 772,250 C 777,253 791,258 795,262 C 799,266 805,274 804,278 C 803,282 795,286 791,286 C 786,286 770,282 766,280 C 761,277 748,270 744,267 C 739,263 728,255 727,251 C 726,247 732,246 732,246 Z", region: "cn" }
];

// Latitude/longitude grid lines
const GRID_LINES = {
  lat: [-60,-30,0,30,60],
  lon: [-150,-120,-90,-60,-30,0,30,60,90,120,150],
};

// Convert lat/lon to SVG x/y (equirectangular)
function latLonToXY(lat, lon, W = 920, H = 420) {
  const x = ((lon + 180) / 360) * W;
  const y = ((90 - lat) / 180) * H;
  return { x, y };
}

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

      <div style={{ display: "flex" }}>
        {/* Map */}
        <div style={{ flex: 1, position: "relative" }}>
          <svg ref={svgRef} viewBox="0 0 920 420" style={{ width: "100%", height: "auto", display: "block" }}
            preserveAspectRatio="xMidYMid meet">
            <defs>
              <radialGradient id="oceanGrad" cx="50%" cy="50%" r="70%">
                <stop offset="0%" stopColor={isDeep ? "#0a1628" : "#d4eaf5"} />
                <stop offset="100%" stopColor={oceanFill} />
              </radialGradient>
              <filter id="glow" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
              <filter id="softGlow">
                <feGaussianBlur stdDeviation="6" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Ocean */}
            <rect width="920" height="420" fill={`url(#oceanGrad)`} />

            {/* Graticule (lat/lon grid) */}
            {GRID_LINES.lat.map(lat => {
              const { y } = latLonToXY(lat, 0);
              return <line key={`lat${lat}`} x1="0" y1={y} x2="920" y2={y} stroke={gridColor} strokeWidth="0.6" />;
            })}
            {GRID_LINES.lon.map(lon => {
              const { x } = latLonToXY(0, lon);
              return <line key={`lon${lon}`} x1={x} y1="0" x2={x} y2="420" stroke={gridColor} strokeWidth="0.6" />;
            })}

            {/* Tropic lines */}
            {[{ lat: 23.5, color: isDeep ? "rgba(0,229,255,0.12)" : "rgba(79,121,66,0.15)" },
              { lat: -23.5, color: isDeep ? "rgba(0,229,255,0.08)" : "rgba(79,121,66,0.1)" },
              { lat: 0, color: isDeep ? "rgba(0,229,255,0.18)" : "rgba(79,121,66,0.2)" }].map(({ lat, color }) => {
              const { y } = latLonToXY(lat, 0);
              return <line key={`trop${lat}`} x1="0" y1={y} x2="920" y2={y} stroke={color} strokeWidth="1" strokeDasharray={lat !== 0 ? "4,8" : undefined} />;
            })}

            {/* Land masses */}
            {LAND_SHAPES.map((shape, i) => {
              const region = REGION_MARKERS.find(r => r.id === shape.region);
              const hoveredRegion = hovered && REGION_MARKERS.find(r => r.id === hovered);
              const isHov = hoveredRegion && shape.region === hovered;
              const hasData = region && region.symbols.some(s => symMap[s]);

              let fill = isHov
                ? (isDeep ? "#253d66" : "#b0cca8")
                : hasData
                  ? (isDeep ? "#1e3058" : "#c0d4b8")
                  : landFill;

              return (
                <path key={i} d={shape.d} fill={fill} stroke={landStroke} strokeWidth="0.7"
                  style={{ cursor: region ? "pointer" : "default",
                    transition: "fill 0.25s", filter: isHov ? "brightness(1.2)" : "none" }}
                  onMouseEnter={() => region && setHovered(region.id)}
                  onMouseLeave={() => setHovered(null)}
                />
              );
            })}

            {/* Data flow connections */}
            {CONNECTIONS.map((conn, i) => {
              const src = REGION_MARKERS.find(r => r.id === conn.from);
              const dst = REGION_MARKERS.find(r => r.id === conn.to);
              if (!src || !dst) return null;

              // Generate a slight bezier arc
              const cx = (src.x + dst.x) / 2;
              const cy = (src.y + dst.y) / 2 - 40; // curve upwards
              const d = `M ${src.x},${src.y} Q ${cx},${cy} ${dst.x},${dst.y}`;

              const isHov = hovered === src.id || hovered === dst.id;

              return (
                <g key={`conn-${i}`}>
                   <path d={d} fill="none" stroke={isDeep ? "#3B82F633" : "#4F794233"} strokeWidth="1.5" />
                   <motion.path
                     d={d} fill="none"
                     stroke={isDeep ? "#3B82F6" : "#4F7942"}
                     strokeWidth={isHov ? 2.5 : 1.5}
                     strokeDasharray="4 8"
                     initial={{ strokeDashoffset: 120 }}
                     animate={{ strokeDashoffset: 0 }}
                     transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                     style={{ filter: isHov ? "drop-shadow(0 0 4px rgba(59,130,246,0.8))" : "none" }}
                   />
                </g>
              );
            })}

            {/* Region markers */}
            {REGION_MARKERS.map(region => {
              const stocks = region.symbols.map(s => symMap[s]).filter(Boolean);
              if (!stocks.length) return null;
              const avgChange = stocks.reduce((a, s) => a + s.change, 0) / stocks.length;
              const isUp = avgChange >= 0;
              const color = isUp ? t.green : t.red;
              const isHov = hovered === region.id;

              return (
                <g key={region.id} style={{ cursor: "pointer" }}
                  onMouseEnter={() => setHovered(region.id)}
                  onMouseLeave={() => setHovered(null)}>
                  {/* Animated pulse ring */}
                  {isHov && (
                    <>
                      <circle cx={region.x} cy={region.y} r={24} fill={`${color}08`} stroke={`${color}25`} strokeWidth={0.8} />
                      <circle cx={region.x} cy={region.y} r={18} fill={`${color}12`} stroke={`${color}35`} strokeWidth={0.8} />
                    </>
                  )}
                  {/* Glow base */}
                  <circle cx={region.x} cy={region.y} r={10} fill={`${color}25`}
                    style={{ filter: `blur(4px)` }} />
                  {/* Core dot */}
                  <circle cx={region.x} cy={region.y} r={6} fill={color}
                    style={{ filter: `drop-shadow(0 0 6px ${color})` }} />
                  <circle cx={region.x} cy={region.y} r={2.5} fill="#fff" opacity={0.9} />

                  {/* Label pill */}
                  <rect x={region.x + 10} y={region.y - 13} width={86} height={26} rx={8}
                    fill={isDeep ? "rgba(7,11,20,0.9)" : "rgba(255,255,255,0.92)"}
                    stroke={`${color}45`} strokeWidth={0.8}
                    style={{ filter: isHov ? `drop-shadow(0 2px 8px ${color}40)` : "none" }} />
                  <text x={region.x + 18} y={region.y - 3} fontSize={8.5} fontWeight={800}
                    fill={color} fontFamily="JetBrains Mono, monospace">
                    {region.symbols.slice(0, 2).join("·")}
                  </text>
                  <text x={region.x + 18} y={region.y + 9} fontSize={7.5}
                    fill={isDeep ? "#8899bb" : "#5a7050"} fontFamily="JetBrains Mono, monospace">
                    {avgChange >= 0 ? "▲" : "▼"}{Math.abs(avgChange * 100).toFixed(1)}%
                    {stocks.length > 1 ? ` +${stocks.length - 1}` : ""}
                  </text>

                  {/* Connector line */}
                  <line x1={region.x + 6} y1={region.y} x2={region.x + 10} y2={region.y}
                    stroke={`${color}60`} strokeWidth={0.8} />
                </g>
              );
            })}

            {/* Hover tooltip popup */}
            <AnimatePresence>
              {hovered && (() => {
                const region = REGION_MARKERS.find(r => r.id === hovered);
                if (!region) return null;
                const stocks = region.symbols.map(s => symMap[s]).filter(Boolean);
                if (!stocks.length) return null;
                // Position tooltip - keep inside viewBox
                const tx = Math.min(region.x + 20, 680);
                const ty = Math.max(region.y - 80, 10);
                return (
                  <g key="tooltip">
                    <rect x={tx} y={ty} width={150} height={20 + stocks.length * 18} rx={8}
                      fill={isDeep ? "rgba(7,11,20,0.96)" : "rgba(255,255,255,0.97)"}
                      stroke={`${t.accent}40`} strokeWidth={0.8}
                      style={{ filter: "drop-shadow(0 4px 16px rgba(0,0,0,0.4))" }} />
                    <text x={tx + 10} y={ty + 14} fontSize={9} fontWeight={800}
                      fill={t.accent} fontFamily="JetBrains Mono, monospace">{region.name}</text>
                    {stocks.slice(0, 5).map((s, i) => {
                      const up = s.change >= 0;
                      return (
                        <g key={s.symbol}>
                          <text x={tx + 10} y={ty + 26 + i * 18} fontSize={8.5}
                            fill={isDeep ? "#8899bb" : "#5a7050"} fontFamily="JetBrains Mono, monospace">
                            {s.symbol}
                          </text>
                          <text x={tx + 80} y={ty + 26 + i * 18} fontSize={8.5}
                            fill={up ? t.green : t.red} fontFamily="JetBrains Mono, monospace" fontWeight={700}>
                            {up ? "▲" : "▼"}{Math.abs(s.change * 100).toFixed(2)}%
                          </text>
                          <text x={tx + 118} y={ty + 26 + i * 18} fontSize={8}
                            fill={isDeep ? "#3a4a6b" : "#a0b490"} fontFamily="JetBrains Mono, monospace">
                            ${s.price > 100 ? s.price.toFixed(0) : s.price.toFixed(2)}
                          </text>
                        </g>
                      );
                    })}
                  </g>
                );
              })()}
            </AnimatePresence>
          </svg>
        </div>

        {/* Right panel */}
        <div style={{ width: 200, padding: "14px 16px", borderLeft: `1px solid ${t.border}`,
          display: "flex", flexDirection: "column", gap: 12 }}>
          <div>
            <div style={{ fontFamily: t.fontMono, fontSize: 22, fontWeight: 800, color: t.text }}>
              {Object.values(symMap).filter(d => d.change !== 0).length}
            </div>
            <div style={{ fontSize: 11, color: t.textSub, fontFamily: t.fontDisplay }}>
              Active instruments
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {REGION_MARKERS.filter(r => r.symbols.length).map(region => {
              const stocks = region.symbols.map(s => symMap[s]).filter(Boolean);
              if (!stocks.length) return null;
              const avgChg = stocks.reduce((a, d) => a + d.change, 0) / stocks.length;
              const color = avgChg >= 0 ? t.green : t.red;
              const barWidth = 50 + avgChg * 4000;

              return (
                <div key={region.id}
                  onMouseEnter={() => setHovered(region.id)}
                  onMouseLeave={() => setHovered(null)}
                  style={{ cursor: "pointer" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                    <span style={{ fontSize: 10, color: hovered === region.id ? t.accent : t.textSub,
                      fontFamily: t.fontDisplay, transition: "color 0.2s" }}>{region.name}</span>
                    <span style={{ fontSize: 10, color, fontFamily: t.fontMono,
                      fontWeight: 700 }}>
                      {(avgChg * 100).toFixed(2)}%
                    </span>
                  </div>
                  <div style={{ height: 3, background: t.glass, borderRadius: 2 }}>
                    <motion.div
                      animate={{ width: `${Math.max(2, Math.min(barWidth, 98))}%` }}
                      transition={{ duration: 0.5 }}
                      style={{ height: "100%", background: color, borderRadius: 2 }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div style={{ marginTop: "auto", borderTop: `1px solid ${t.border}`, paddingTop: 10 }}>
            <div style={{ fontSize: 9, color: t.textDim, fontFamily: t.fontDisplay, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.08em" }}>Legend</div>
            {[[t.green, "Net gains"],[ t.red, "Net losses"]].map(([c, l]) => (
              <div key={l} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 5 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: c,
                  boxShadow: `0 0 6px ${c}` }} />
                <span style={{ fontSize: 10, color: t.textSub, fontFamily: t.fontDisplay }}>{l}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
