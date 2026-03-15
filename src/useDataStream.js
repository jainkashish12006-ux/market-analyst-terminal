import { useState, useEffect, useRef, useCallback } from "react";

export const SYMBOLS = ["AAPL","MSFT","NVDA","GOOGL","AMZN","TSLA","META","JPM","V","XOM","BTC","ETH","GOLD","WTI","EURUSD","BRK"];
export const SECTORS = { AAPL:"Tech",MSFT:"Tech",NVDA:"Tech",GOOGL:"Tech",META:"Tech",AMZN:"Consumer",TSLA:"Auto",JPM:"Finance",V:"Finance",BRK:"Finance",XOM:"Energy",WTI:"Energy",BTC:"Crypto",ETH:"Crypto",EURUSD:"FX",GOLD:"Commodities" };
export const COMPANIES = { AAPL:"Apple Inc.",MSFT:"Microsoft",NVDA:"NVIDIA",GOOGL:"Alphabet",AMZN:"Amazon",TSLA:"Tesla",META:"Meta",JPM:"JPMorgan",V:"Visa",XOM:"ExxonMobil",BTC:"Bitcoin",ETH:"Ethereum",GOLD:"Gold",WTI:"Crude Oil",EURUSD:"EUR/USD",BRK:"Berkshire" };
export const BASE = { AAPL:189.5,MSFT:415.2,NVDA:875.4,GOOGL:178.9,AMZN:198.7,TSLA:248.6,META:520.3,JPM:198.4,V:275.8,XOM:118.3,BTC:67400,ETH:3520,GOLD:2318,WTI:82.4,EURUSD:1.0842,BRK:374.5 };

const FLUSH_MS = 100;
const MAX_BUF = 50;
const VOL_WINDOW = 60000;

function simWS(onMsg) {
  let on = true;
  const px = { ...BASE };
  const iv = setInterval(() => {
    if (!on) return;
    const burst = Math.random() < 0.04 ? 5 + Math.floor(Math.random() * 10) : 1;
    for (let i = 0; i < burst; i++) {
      const sym = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
      const drift = (Math.random() - 0.495) * 0.009;
      px[sym] *= (1 + drift);
      const chg = (px[sym] - BASE[sym]) / BASE[sym];
      onMsg({ id: `${sym}-${Date.now()}-${Math.random().toString(36).slice(2)}`, ts: Date.now(), symbol: sym, price: px[sym], basePrice: BASE[sym], change: chg, volume: Math.floor(Math.random() * 2e6) + 5e4, sector: SECTORS[sym], stdDev: Math.abs(chg / 0.018), anomaly: Math.abs(chg / 0.018) > 2 });
    }
  }, 110);
  return { close: () => { on = false; clearInterval(iv); } };
}

export function useDataStream() {
  const buf = useRef([]);
  const t0 = useRef(Date.now());
  const dropped = useRef(0);
  const lastFlush = useRef(Date.now());
  const volHistory = useRef({});

  const [signals, setSignals] = useState([]);
  const [anomalies, setAnomalies] = useState([]);
  const [symMap, setSymMap] = useState(() => Object.fromEntries(SYMBOLS.map(s => [s, { symbol:s, price:BASE[s], basePrice:BASE[s], change:0, volume:0, sector:SECTORS[s], history:[BASE[s]], h60:Array(60).fill(BASE[s]), stdDev:0, anomaly:false, pulsing:false }])));
  const [health, setHealth] = useState({ latency:12, throughput:0, dropped:0, uptime:0, lag:0, batch:false, connected:false });
  const [stressAlert, setStressAlert] = useState(false);
  const [connected, setConnected] = useState(false);

  const flush = useCallback(() => {
    const b = buf.current;
    if (!b.length) return;
    const now = Date.now();
    const lag = now - lastFlush.current;
    lastFlush.current = now;
    const overflow = b.length > MAX_BUF;
    dropped.current += Math.max(0, b.length - MAX_BUF);
    const items = overflow ? b.slice(-MAX_BUF) : [...b];
    buf.current = [];
    setSignals(p => [...items, ...p].slice(0, 300));
    setAnomalies(p => { const a = items.filter(x => x.anomaly); return a.length ? [...a, ...p].slice(0, 80) : p; });
    setSymMap(p => {
      const n = { ...p };
      items.forEach(sig => {
        const ex = n[sig.symbol] || {};
        const vh = volHistory.current[sig.symbol] || [];
        vh.push({ ts: sig.ts, chg: Math.abs(sig.change) });
        volHistory.current[sig.symbol] = vh.filter(v => now - v.ts < VOL_WINDOW);
        n[sig.symbol] = { ...sig, history: [...(ex.history || [sig.price]), sig.price].slice(-40), h60: [...(ex.h60 || []), sig.price].slice(-60), pulsing: sig.anomaly };
      });
      return n;
    });
    setHealth({ latency: 6 + Math.random() * 16, throughput: items.length * (1000 / FLUSH_MS), dropped: dropped.current, uptime: Math.floor((now - t0.current) / 1000), lag: Math.max(0, lag - FLUSH_MS), batch: overflow, connected: true });
    const avgVol = Object.values(volHistory.current).map(a => a.reduce((s, v) => s + v.chg, 0) / Math.max(a.length, 1)).reduce((s, v) => s + v, 0) / SYMBOLS.length;
    setStressAlert(avgVol > 0.04);
  }, []);

  useEffect(() => {
    setConnected(true);
    const ws = simWS(m => buf.current.push(m));
    const iv = setInterval(flush, FLUSH_MS);
    return () => { ws.close(); clearInterval(iv); setConnected(false); };
  }, [flush]);

  return { signals, anomalies, symMap, health, connected, stressAlert };
}
