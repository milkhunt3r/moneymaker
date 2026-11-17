/* =====================================================================
   📡 LIVE CRYPTO MARKET: real prices (1 USD = 1 bcoin) for Bitcoin, Ethereum and Solana.
   Data: Binance public market stream (no API key needed); Coinbase public feed as a backup.
   Fee per trade: 2%, −0.1% every 10 Investor levels, free at level 99.
   Investor XP per trade: log10(amount) − 2 (1,000 → 1 XP ... 1 gcoin → 10 XP), at most once a minute.
   ===================================================================== */
const CRYPTOS = [
  { sym: "BTC", name: "Bitcoin",  icon: "₿", binance: "BTCUSDT", coinbase: "BTC-USD" },
  { sym: "ETH", name: "Ethereum", icon: "Ξ", binance: "ETHUSDT", coinbase: "ETH-USD" },
  { sym: "SOL", name: "Solana",   icon: "◎", binance: "SOLUSDT", coinbase: "SOL-USD" },
];
const CRYPTO_MIN = 1000, CRYPTO_XP_GAP = 60000, CRYPTO_STALE = 30000;
if (!inv.crypto) inv.crypto = {};
for (const c of CRYPTOS) if (!inv.crypto[c.sym]) inv.crypto[c.sym] = { qty: 0, cost: 0, last: 0 };
if (!inv.stats.crypto) inv.stats.crypto = { in: 0, out: 0 };
// Candle time frames: the line chart always uses 1 minute; candlesticks can use any of these
const TIMEFRAMES = [
  { id: "1m", ms: 60000, label: "1 min", long: "1-minute" }, { id: "5m", ms: 300000, label: "5 min", long: "5-minute" },
  { id: "15m", ms: 900000, label: "15 min", long: "15-minute" }, { id: "4h", ms: 14400000, label: "4 hours", long: "4-hour" },
];
const live = {};   // sym -> { price, open, at, tf: { "1m": [{ t, o, h, l, c, v }], ... } }  (v = volume in USD; not saved)
for (const c of CRYPTOS) live[c.sym] = { price: inv.crypto[c.sym].last || 0, open: 0, at: 0, tf: Object.fromEntries(TIMEFRAMES.map(f => [f.id, []])) };
const CANDLES_KEEP = 90;
// Adds or updates a candle (Binance sends whole candles; for Coinbase we build them from trades)
function putCandle(sym, t, o, h, l, c, v, add, tf = "1m") {
  const list = live[sym].tf[tf];
  let k = list.length && list[list.length - 1].t === t ? list[list.length - 1] : null;
  if (!k) {
    if (list.length && t < list[list.length - 1].t) return;
    k = { t, o, h, l, c, v: 0 };
    list.push(k);
    if (list.length > CANDLES_KEEP) list.shift();
  }
  if (add) { k.h = Math.max(k.h, h); k.l = Math.min(k.l, l); k.c = c; k.v += v; }
  else { k.o = o; k.h = h; k.l = l; k.c = c; k.v = v; }
}
let cryptoSource = "", cryptoWs = null, cryptoTries = 0;

function cryptoFee() {
  const L = investLevel();
  return L >= 99 ? 0 : Math.max(0, 0.02 - 0.001 * Math.floor(L / 10));
}
const cryptoLive = (sym) => live[sym].price > 0 && Date.now() - live[sym].at < CRYPTO_STALE;
const cryptoPrice = (sym) => live[sym].price || inv.crypto[sym].last || 0;
/* ----- Positions: every trade is its own position. Long earns when the price rises, Short when it falls.
   Leverage ×1/×20/×50 multiplies the profit and loss. The fee is taken from the money you put in and from what you get back.
   Liquidation: when a position's value reaches 0 (price moved 1/leverage against it), it closes and the money put in is lost. ----- */
const LEVERAGES = [1, 20, 50];
if (!Array.isArray(inv.positions)) inv.positions = [];
if (!Array.isArray(inv.tradeLog)) inv.tradeLog = [];
// older saves: coins you owned become ×1 Long positions with the same value
for (const c of CRYPTOS) {
  const h = inv.crypto[c.sym];
  if (h.qty > 0) {
    inv.positions.push({ id: state.nextId++, sym: c.sym, side: "long", lev: 1, paid: h.cost, margin: h.cost, entry: h.cost / h.qty, qty: h.qty, at: Date.now() });
    h.qty = 0; h.cost = 0;
  }
}
const posPnl = (p, price = cryptoPrice(p.sym)) => p.qty * (price - p.entry) * (p.side === "long" ? 1 : -1);
const posValue = (p, price) => Math.max(0, p.margin + posPnl(p, price));
const liqPrice = (p) => p.side === "long" ? p.entry * (1 - 1 / p.lev) : p.entry * (1 + 1 / p.lev);
const cryptoValue = (sym) => inv.positions.filter(p => p.sym === sym).reduce((a, p) => a + posValue(p), 0);
function cryptoTotal() { return inv.positions.reduce((a, p) => a + posValue(p), 0); }
function logTrade(entry) { inv.tradeLog.unshift(entry); if (inv.tradeLog.length > 15) inv.tradeLog.length = 15; }
// Called on every live price: closes positions whose value hit 0
function checkLiquidations(sym, price) {
  const hit = inv.positions.filter(p => p.sym === sym && p.lev > 1 && (p.side === "long" ? price <= liqPrice(p) : price >= liqPrice(p))
                                     || p.sym === sym && p.lev === 1 && p.side === "short" && price >= liqPrice(p));
  if (!hit.length) return;
  for (const p of hit) {
    inv.positions = inv.positions.filter(x => x !== p);
    logTrade({ sym, side: p.side, lev: p.lev, entry: p.entry, exit: price, result: -p.paid, liq: true, at: Date.now(), opened: p.at });
    showAlert(`💥 Liquidated: ${sym} ${p.side === "long" ? "Long" : "Short"} ×${p.lev}`, `The price reached ${priceText(price)}. You lost the ${fmt(p.paid)} you put in.`);
  }
  save();
}

function onPrice(sym, price, open) {
  if (!(price > 0)) return;
  const L = live[sym];
  L.price = price; L.at = Date.now();
  if (open > 0) L.open = open;
  inv.crypto[sym].last = price;
  checkLiquidations(sym, price);
}
// Binance first; if it doesn't deliver within 8 seconds (blocked or down), Coinbase
function connectCrypto(source = "binance") {
  try { if (cryptoWs) cryptoWs.close(); } catch (e) {}
  cryptoSource = source;
  let got = false;
  let ws;
  try {
    if (source === "binance") {
      const streams = CRYPTOS.flatMap(c => [c.binance.toLowerCase() + "@miniTicker", ...TIMEFRAMES.map(f => c.binance.toLowerCase() + "@kline_" + f.id)]);
      ws = new WebSocket("wss://data-stream.binance.vision/stream?streams=" + streams.join("/"));
      ws.onmessage = (e) => {
        const d = (JSON.parse(e.data) || {}).data;
        const c = d && CRYPTOS.find(x => x.binance === d.s);
        if (!c) return;
        got = true; cryptoTries = 0;
        if (d.e === "kline") { const k = d.k; if (live[c.sym].tf[k.i]) putCandle(c.sym, k.t, +k.o, +k.h, +k.l, +k.c, +k.q, false, k.i); }
        else onPrice(c.sym, +d.c, +d.o);
      };
    } else {
      ws = new WebSocket("wss://ws-feed.exchange.coinbase.com");
      ws.onopen = () => ws.send(JSON.stringify({ type: "subscribe", product_ids: CRYPTOS.map(c => c.coinbase), channels: ["ticker"] }));
      ws.onmessage = (e) => {
        const d = JSON.parse(e.data);
        const c = d && d.type === "ticker" && CRYPTOS.find(x => x.coinbase === d.product_id);
        if (c) {
          got = true; cryptoTries = 0; onPrice(c.sym, +d.price, +d.open_24h);
          const p = +d.price, now = Date.now();
          for (const f of TIMEFRAMES) putCandle(c.sym, Math.floor(now / f.ms) * f.ms, p, p, p, p, p * (+d.last_size || 0), true, f.id);
        }
      };
    }
  } catch (e) { ws = null; }
  cryptoWs = ws;
  const retry = () => {
    if (cryptoWs !== ws) return;
    cryptoTries++;
    // switch source when one doesn't work; wait longer after repeated failures
    setTimeout(() => connectCrypto(got ? source : (source === "binance" ? "coinbase" : "binance")), Math.min(30000, 2000 * cryptoTries));
  };
  if (!ws) return retry();
  ws.onclose = retry;
  ws.onerror = () => { try { ws.close(); } catch (e) {} };
  setTimeout(() => { if (!got && cryptoWs === ws) { try { ws.close(); } catch (e) {} } }, 8000);
}
// Start every chart with the last 90 real candles of each time frame (if Binance's REST API is reachable)
async function seedCryptoHistory() {
  for (const c of CRYPTOS) for (const f of TIMEFRAMES) {
    try {
      const r = await fetch(`https://data-api.binance.vision/api/v3/klines?symbol=${c.binance}&interval=${f.id}&limit=${CANDLES_KEEP}`);
      const rows = await r.json();
      if (Array.isArray(rows) && rows.length)
        live[c.sym].tf[f.id] = rows.map(k => ({ t: k[0], o: +k[1], h: +k[2], l: +k[3], c: +k[4], v: +k[7] })).slice(-CANDLES_KEEP);
    } catch (e) {}
  }
  drawCryptoCharts();
}

function cryptoXp(amount) {
  if (Date.now() - (inv.cryptoXpAt || 0) < CRYPTO_XP_GAP) return 0;
  const xp = Math.max(1, Math.floor(Math.log10(amount)) - 2);
  inv.cryptoXpAt = Date.now();
  addInvestXp(xp);
  return xp;
}
function cryptoMsg(sym, text, good) {
  const el = $("cmsg-" + sym);
  if (el) { el.textContent = text; el.className = good ? "income" : "flash"; }
}
const tradeSel = {};   // sym -> { side, lev }  chosen in the trade panel
for (const c of CRYPTOS) tradeSel[c.sym] = { side: "long", lev: 1 };
function openPosition(sym) {
  if (isPaused()) return;
  if (!cryptoLive(sym)) return cryptoMsg(sym, "No live price right now: trading is paused.");
  const amount = Math.floor(Number($("cbuy-" + sym).value) || 0);
  if (amount < CRYPTO_MIN) return cryptoMsg(sym, "Minimum trade is " + fmt(CRYPTO_MIN) + ".");
  if (amount > state.money) return cryptoMsg(sym, "Not enough money.");
  const { side, lev } = tradeSel[sym], price = live[sym].price;
  const fee = amount * cryptoFee(), margin = amount - fee;
  const p = { id: state.nextId++, sym, side, lev, paid: amount, margin, entry: price, qty: margin * lev / price, at: Date.now() };
  state.money -= amount;
  inv.positions.push(p);
  investRecord("crypto", amount, 0);
  const xp = cryptoXp(amount);
  $("cbuy-" + sym).value = "";
  cryptoMsg(sym, `Opened ${side === "long" ? "Long" : "Short"} ×${lev} at ${priceText(price)} (fee ${fmt(fee)})${xp ? ` · +${xp} XP` : ""}.`, true);
  updateCounter(); updateInvestLive(); save(); renderCryptoNumbers();
}
function closePosition(id) {
  if (isPaused()) return;
  const p = inv.positions.find(x => x.id === id);
  if (!p) return;
  if (!cryptoLive(p.sym)) return cryptoMsg(p.sym, "No live price right now: trading is paused.");
  const price = live[p.sym].price, value = posValue(p, price);
  const fee = value * cryptoFee(), got = value - fee;
  inv.positions = inv.positions.filter(x => x !== p);
  state.money += got;
  investRecord("crypto", 0, got);
  const xp = value >= CRYPTO_MIN ? cryptoXp(value) : 0;
  const result = got - p.paid;
  if (result > 0) state.stats.profitTrades = (state.stats.profitTrades || 0) + 1;   // for achievements
  logTrade({ sym: p.sym, side: p.side, lev: p.lev, entry: p.entry, exit: price, result, at: Date.now(), opened: p.at });
  cryptoMsg(p.sym, `Closed ${p.side === "long" ? "Long" : "Short"} ×${p.lev} for ${fmt(got)} (fee ${fmt(fee)}) · ${result >= 0 ? "profit +" : "loss −"}${fmt(Math.abs(result))}${xp ? ` · +${xp} XP` : ""}.`, result >= 0);
  updateCounter(); updateInvestLive(); save(); renderCryptoNumbers();
}
function ago(ms) {
  const s = Math.max(0, Math.floor(ms / 1000)), d = Math.floor(s / 86400), h = Math.floor(s % 86400 / 3600), m = Math.floor(s % 3600 / 60);
  return d ? `${d}d ${h}h` : h ? `${h}h ${m}m` : `${m}m ${String(s % 60).padStart(2, "0")}s`;
}
const sideTag = (side, lev) => `<span class="sideTag ${side}">${side === "long" ? "▲ Long" : "▼ Short"} ×${lev}</span>`;

/* ----- Crypto chart: line or candlesticks, with volume bars underneath. Hover for details. ----- */
const CC = { W: 800, H: 440, L: 8, R: 78, T: 14, PB: 326, VT: 342, VB: 428 };   // price area T..PB, volume area VT..VB
// Moving averages you can switch on (average close of the last N candles of the time frame shown)
const MAS = [{ n: 5, color: "#ffd34d" }, { n: 10, color: "#4fc3f7" }, { n: 20, color: "#ba68c8" }, { n: 50, color: "#ff8a65" }];
if (!Array.isArray(state.cryptoMA)) state.cryptoMA = [];
function movingAvg(ks, n) {
  const out = []; let sum = 0;
  ks.forEach((k, i) => { sum += k.c; if (i >= n) sum -= ks[i - n].c; out.push(i >= n - 1 ? sum / n : null); });
  return out;
}
const shortVol = (v) => v >= 1e9 ? (v / 1e9).toFixed(2) + "B" : v >= 1e6 ? (v / 1e6).toFixed(2) + "M" : v >= 1e3 ? (v / 1e3).toFixed(1) + "k" : v.toFixed(0);
function drawCryptoCharts() { for (const c of CRYPTOS) drawCryptoChart(c.sym); }
function drawCryptoChart(sym) {
  const mode = state.cryptoChart === "candles" ? "candles" : "line";
  const tf = TIMEFRAMES.find(f => f.id === (mode === "candles" ? state.cryptoTf : "1m")) || TIMEFRAMES[0];
  const box = $("cchart-" + sym), ks = live[sym].tf[tf.id];
  if (!box) return;
  if (ks.length < 2) { box.innerHTML = `<div class="muted" style="padding:24px; text-align:center">📈 Waiting for ${tf.long} candles…</div>`; return; }
  let lo = Math.min(...ks.map(k => k.l)), hi = Math.max(...ks.map(k => k.h));
  if (hi - lo < hi * 1e-5) { lo -= hi * 1e-4; hi += hi * 1e-4; }
  const pad = (hi - lo) * 0.06; lo -= pad; hi += pad;
  const vmax = Math.max(...ks.map(k => k.v), 1);
  const n = ks.length, step = (CC.W - CC.L - CC.R) / n;
  const X = (i) => CC.L + step * (i + 0.5);
  const Y = (p) => CC.T + (CC.PB - CC.T) * (1 - (p - lo) / (hi - lo));
  const V = (v) => CC.VB - (CC.VB - CC.VT) * (v / vmax);
  const dec = hi >= 1000 ? 0 : 2;
  let g = "";
  for (let i = 0; i <= 4; i++) {
    const p = lo + (hi - lo) * i / 4;
    g += `<line x1="${CC.L}" x2="${CC.W - CC.R}" y1="${Y(p)}" y2="${Y(p)}" stroke="#fff" stroke-opacity="0.07"/>
          <text x="${CC.W - CC.R + 6}" y="${Y(p) + 5}" fill="#a5a5bd" font-size="13">${p.toLocaleString(undefined, { maximumFractionDigits: dec })}</text>`;
  }
  g += `<text x="${CC.W - CC.R + 6}" y="${CC.VT + 14}" fill="#a5a5bd" font-size="12">Vol</text>
        <text x="${CC.W - CC.R + 6}" y="${CC.VT + 30}" fill="#a5a5bd" font-size="12">${shortVol(vmax)}</text>
        <line x1="${CC.L}" x2="${CC.W - CC.R}" y1="${CC.VB}" y2="${CC.VB}" stroke="#fff" stroke-opacity="0.12"/>`;
  let vol = "", body = "";
  ks.forEach((k, i) => {
    const up = k.c >= k.o, col = up ? "#26a69a" : "#ef5350", w = Math.max(1, step * 0.7);
    vol += `<rect x="${X(i) - w / 2}" y="${V(k.v)}" width="${w}" height="${CC.VB - V(k.v)}" fill="${col}" opacity="0.45"/>`;
    if (mode === "candles") {
      const top = Y(Math.max(k.o, k.c)), bot = Y(Math.min(k.o, k.c));
      body += `<line x1="${X(i)}" x2="${X(i)}" y1="${Y(k.h)}" y2="${Y(k.l)}" stroke="${col}" stroke-width="1.2"/>
               <rect x="${X(i) - w / 2}" y="${top}" width="${w}" height="${Math.max(1, bot - top)}" fill="${col}"/>`;
    }
  });
  const first = ks[0].o, last = ks[n - 1].c, upAll = last >= first, lineCol = upAll ? "#5be08f" : "#ff6b6b";
  if (mode === "line") {
    const pts = ks.map((k, i) => `${X(i)},${Y(k.c)}`).join(" ");
    body = `<polygon points="${X(0)},${CC.PB} ${pts} ${X(n - 1)},${CC.PB}" fill="${lineCol}" opacity="0.12"/>
            <polyline points="${pts}" fill="none" stroke="${lineCol}" stroke-width="2"/>`;
  }
  // moving averages
  const maNow = [];
  for (const m of MAS) {
    if (!state.cryptoMA.includes(m.n)) continue;
    const vals = movingAvg(ks, m.n);
    const pts = vals.map((v, i) => v === null ? null : `${X(i)},${Y(v)}`).filter(Boolean);
    if (pts.length > 1) body += `<polyline points="${pts.join(" ")}" fill="none" stroke="${m.color}" stroke-width="1.8" opacity="0.95"/>`;
    const lastV = vals[vals.length - 1];
    maNow.push(`<span style="color:${m.color}">MA${m.n} ${lastV === null ? `(needs ${m.n} min)` : priceText(lastV)}</span>`);
  }
  body += `<line x1="${CC.L}" x2="${CC.W - CC.R}" y1="${Y(last)}" y2="${Y(last)}" stroke="${lineCol}" stroke-opacity="0.5" stroke-dasharray="4 4"/>`;
  const chg = (last / first - 1) * 100;
  const span = n * tf.ms / 60000, spanText = span >= 2880 ? Math.round(span / 1440) + " days" : span >= 120 ? Math.round(span / 60) + " h" : span + " min";
  box.innerHTML = `<div class="chartHead"><span>${mode === "candles" ? "Candlesticks" : "Line"} · ${tf.long} · last ${spanText} · volume in bcoin</span>
      <span style="color:${lineCol}; font-weight:700">${priceText(last)} (${chg >= 0 ? "+" : ""}${chg.toFixed(2)}%)</span></div>
    ${maNow.length ? `<div class="maLegend">${maNow.join("")}</div>` : ""}
    <svg class="cryptoSvg" viewBox="0 0 ${CC.W} ${CC.H}" preserveAspectRatio="none">${g}${vol}${body}
      <line class="xh" x1="0" x2="0" y1="${CC.T}" y2="${CC.VB}" stroke="#fff" stroke-opacity="0.35" visibility="hidden"/></svg>
    <div class="chartTip" hidden></div>`;
  const svg = box.querySelector("svg"), tip = box.querySelector(".chartTip"), xh = box.querySelector(".xh");
  svg.onmousemove = (e) => {
    const r = svg.getBoundingClientRect();
    const i = Math.max(0, Math.min(n - 1, Math.floor(((e.clientX - r.left) / r.width * CC.W - CC.L) / step)));
    const k = ks[i];
    xh.setAttribute("x1", X(i)); xh.setAttribute("x2", X(i)); xh.setAttribute("visibility", "visible");
    const time = tf.ms >= 14400000 ? new Date(k.t).toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })
                                   : new Date(k.t).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    tip.hidden = false;
    const maTip = MAS.filter(m => state.cryptoMA.includes(m.n)).map(m => { const v = movingAvg(ks, m.n)[i]; return v === null ? "" : `<br><span style="color:${m.color}">MA${m.n} ${priceText(v)}</span>`; }).join("");
    tip.innerHTML = `<b>${time}</b><br>O ${priceText(k.o)} · H ${priceText(k.h)}<br>L ${priceText(k.l)} · C ${priceText(k.c)}<br>Vol ${shortVol(k.v)}${maTip}`;
    tip.style.left = Math.min(r.width - 170, Math.max(0, X(i) / CC.W * r.width - 80)) + "px";
  };
  svg.onmouseleave = () => { tip.hidden = true; xh.setAttribute("visibility", "hidden"); };
}
const priceText = (p) => p.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function renderCrypto() {
  $("cryptoList").innerHTML = CRYPTOS.map(c => `
    <div class="cryptoRow">
      <div class="row" style="justify-content:flex-start; gap:18px; flex-wrap:wrap">
        <div class="cryptoName"><span class="cryptoIcon">${c.icon}</span><div><b>${c.name}</b><div class="muted">${c.sym}</div></div></div>
        <div><div class="muted">Live price</div><div class="bigValue" id="cprice-${c.sym}">–</div></div>
        <div><div class="muted">24h</div><div class="bigValue" id="cchg-${c.sym}">–</div></div>
        <div><div class="muted">Open positions</div><div class="bigValue" id="cqty-${c.sym}">0</div></div>
        <div><div class="muted">Worth</div><div class="bigValue" id="cval-${c.sym}">0</div></div>
        <div><div class="muted">Open profit / loss</div><div class="bigValue" id="cpl-${c.sym}">–</div></div>
      </div>
      <div class="chartTools" data-ctools="${c.sym}"></div>
      <div class="chartBox" id="cchart-${c.sym}"><div class="muted" style="padding:24px; text-align:center">📈 The chart appears as live prices come in…</div></div>
      <div class="tradePanel">
        <div class="segGroup">
          <button class="seg long" data-tside="${c.sym}" data-side="long">▲ Long</button><button class="seg short" data-tside="${c.sym}" data-side="short">▼ Short</button></div>
        <div class="segGroup">${LEVERAGES.map(l => `<button class="seg" data-tlev="${c.sym}" data-lev="${l}">×${l}</button>`).join("")}</div>
        <input id="cbuy-${c.sym}" type="number" min="${CRYPTO_MIN}" placeholder="Amount (min 1,000)">
        <button class="btn ghost small" data-cpct="${c.sym}" data-pct="0.05">5%</button>
        <button class="btn ghost small" data-cpct="${c.sym}" data-pct="0.1">10%</button>
        <button class="btn ghost small" data-cpct="${c.sym}" data-pct="0.25">25%</button>
        <button class="btn ghost small" data-cpct="${c.sym}" data-pct="0.5">50%</button>
        <button class="btn ghost small" data-cpct="${c.sym}" data-pct="0.75">75%</button>
        <button class="btn ghost small" data-cpct="${c.sym}" data-pct="1">All</button>
        <button class="btn" data-copen="${c.sym}" id="copen-${c.sym}">Open</button>
      </div>
      <div class="muted" id="cprev-${c.sym}"></div>
      <div id="cmsg-${c.sym}" class="muted"></div>
      <div id="cpos-${c.sym}"></div>
    </div>`).join("");
  if (typeof updateChartTools === "function") updateChartTools();
  updateTradePanels();
  renderCryptoNumbers();
}
function updateTradePanels() {
  for (const c of CRYPTOS) {
    const t = tradeSel[c.sym];
    document.querySelectorAll(`[data-tside="${c.sym}"]`).forEach(b => b.classList.toggle("on", b.dataset.side === t.side));
    document.querySelectorAll(`[data-tlev="${c.sym}"]`).forEach(b => b.classList.toggle("on", Number(b.dataset.lev) === t.lev));
    const btn = $("copen-" + c.sym);
    if (btn) { btn.textContent = `Open ${t.side === "long" ? "Long" : "Short"} ×${t.lev}`; btn.className = "btn " + (t.side === "long" ? "longBtn" : "shortBtn"); }
  }
}
function renderCryptoNumbers() {
  const anyLive = CRYPTOS.some(c => cryptoLive(c.sym));
  const st = $("cryptoStatus");
  st.textContent = anyLive ? `● Live (${cryptoSource === "binance" ? "Binance" : "Coinbase"})` : "● Connecting… trading paused";
  st.classList.toggle("on", anyLive);
  const f = cryptoFee();
  $("cryptoFeeText").textContent = `Trading fee: ${(f * 100).toFixed(1)}% when you open and when you close` +
    (f > 0 ? ` (Investor level ${investLevel()}; next −0.1% at level ${investLevel() >= 90 ? 99 : (Math.floor(investLevel() / 10) + 1) * 10})` : " (Investor level 99: free!)");
  for (const c of CRYPTOS) {
    const L = live[c.sym];
    if (!$("cprice-" + c.sym)) return;
    const price = cryptoPrice(c.sym);
    $("cprice-" + c.sym).textContent = L.price ? priceText(L.price) + (cryptoLive(c.sym) ? "" : " ⏸") : "–";
    const chg = L.open ? (L.price / L.open - 1) * 100 : null;
    $("cchg-" + c.sym).textContent = chg === null ? "–" : (chg >= 0 ? "+" : "") + chg.toFixed(2) + "%";
    $("cchg-" + c.sym).className = "bigValue " + (chg > 0 ? "up" : chg < 0 ? "down" : "");
    const mine = inv.positions.filter(p => p.sym === c.sym);
    $("cqty-" + c.sym).textContent = mine.length;
    $("cval-" + c.sym).textContent = fmt(cryptoValue(c.sym));
    const pl = mine.length ? mine.reduce((a, p) => a + posValue(p) - p.paid, 0) : null;
    $("cpl-" + c.sym).textContent = pl === null ? "–" : (pl >= 0 ? "+" : "−") + fmt(Math.abs(pl));
    $("cpl-" + c.sym).className = "bigValue " + (pl > 0 ? "up" : pl < 0 ? "down" : "");
    // preview of the trade you're about to open
    const t = tradeSel[c.sym], amt = Number($("cbuy-" + c.sym).value) || 0;
    if (price && amt >= CRYPTO_MIN) {
      const m = amt * (1 - f), liq = t.side === "long" ? price * (1 - 1 / t.lev) : price * (1 + 1 / t.lev);
      $("cprev-" + c.sym).textContent = `Position size ${fmt(m * t.lev)} · fee ${fmt(amt * f)}` +
        (t.lev > 1 || t.side === "short" ? ` · liquidated at ${priceText(liq)} (${(100 / t.lev).toFixed(0)}% ${t.side === "long" ? "drop" : "rise"})` : " · no liquidation");
    } else $("cprev-" + c.sym).textContent = "";
    // open positions and recent closed trades
    const log = inv.tradeLog.filter(x => x.sym === c.sym).slice(0, 5);
    $("cpos-" + c.sym).innerHTML = (mine.length ? `<table class="posTable"><thead><tr><th>Position</th><th>Size</th><th>Entry</th><th>Now</th><th>Profit / loss</th><th>Liquidation</th><th>Open for</th><th></th></tr></thead><tbody>` +
      mine.map(p => {
        const val = posValue(p, price), res = val - p.paid, pct = res / p.paid * 100;
        const liq = p.lev === 1 && p.side === "long" ? "–" : priceText(liqPrice(p));
        return `<tr><td>${sideTag(p.side, p.lev)}</td><td>${fmt(p.qty * p.entry)}</td><td>${priceText(p.entry)}</td><td>${priceText(price)}</td>
          <td class="${res >= 0 ? "up" : "down"}"><b>${res >= 0 ? "+" : "−"}${fmt(Math.abs(res))}</b> (${pct >= 0 ? "+" : ""}${pct.toFixed(1)}%)</td>
          <td>${liq}</td><td>${ago(Date.now() - p.at)}</td>
          <td><button class="btn ghost small" data-cclose="${p.id}">Close</button></td></tr>`;
      }).join("") + `</tbody></table>` : "") +
      (log.length ? `<div class="tradeLog"><span class="muted">Recent trades:</span> ${log.map(x =>
        `<span class="${x.result >= 0 ? "up" : "down"}">${sideTag(x.side, x.lev)} ${priceText(x.entry)} → ${priceText(x.exit)}
          <b>${x.liq ? ivIco("crash") + "liquidated " : ""}${x.result >= 0 ? "+" : "−"}${fmt(Math.abs(x.result))}</b> <small class="muted">(${ago(x.at - x.opened)})</small></span>`).join("")}</div>` : "");
  }
}
// every second: numbers; every 5 seconds: one chart point (keeps the last ~20 minutes)
let cryptoTicks = 0;
setInterval(() => {
  cryptoTicks++;
  if ($("investView").hidden || $("livePane").hidden) return;
  renderCryptoNumbers();
  if (cryptoTicks % 2 === 0) drawCryptoCharts();
}, 1000);

$("cryptoList").addEventListener("click", (e) => {
  const pct = e.target.closest("[data-cpct]");
  if (pct) { $("cbuy-" + pct.dataset.cpct).value = Math.floor(state.money * Number(pct.dataset.pct)); renderCryptoNumbers(); return; }
  const sd = e.target.closest("[data-tside]");
  if (sd) { tradeSel[sd.dataset.tside].side = sd.dataset.side; updateTradePanels(); renderCryptoNumbers(); return; }
  const lv = e.target.closest("[data-tlev]");
  if (lv) { tradeSel[lv.dataset.tlev].lev = Number(lv.dataset.lev); updateTradePanels(); renderCryptoNumbers(); return; }
  const op = e.target.closest("[data-copen]");
  if (op) return openPosition(op.dataset.copen);
  const cl = e.target.closest("[data-cclose]");
  if (cl) return closePosition(Number(cl.dataset.cclose));
});
$("cryptoList").addEventListener("input", () => renderCryptoNumbers());
// Investing tab: switch between the classic investments and Live trading (remembered)
// 📡 Live trading unlocks at Investor level 20 (players with open positions can always reach them)
const LIVE_LEVEL = 20;
const liveOpen = () => levelInfo(inv.xp, INVEST_XP).level >= LIVE_LEVEL || (inv.positions || []).length > 0;
function showInvestPage(p) {
  state.investPage = p === "live" ? "live" : "invest";
  const lockedLive = state.investPage === "live" && !liveOpen();
  $("investPane").hidden = state.investPage !== "invest";
  $("livePane").hidden = state.investPage !== "live" || lockedLive;
  $("liveLocked").hidden = !lockedLive;
  if (lockedLive) {
    const L = levelInfo(inv.xp, INVEST_XP).level;
    $("liveLocked").innerHTML = `<h2>${ico("lock", "lockS")}${ivIco("live", "h")}Live trading</h2>
      <p>Trade real Bitcoin, Ethereum and Solana prices with Long / Short positions and up to ×50 leverage.</p>
      <p><b>Unlocks at ${ivIco("invest")}Investor level ${LIVE_LEVEL}</b> (you are level ${L}).</p>
      <div class="xpBar" style="max-width:360px;margin:8px auto"><div class="xpFill" style="width:${Math.min(100, L / LIVE_LEVEL * 100)}%"></div></div>`;
  }
  const liveBtn = document.querySelector('[data-isub="live"]');
  const liveHtml = (liveOpen() ? "" : ico("lock", "lockS")) + ivIco("live") + "Live trading";
  if (liveBtn && liveBtn.dataset.html !== liveHtml) { liveBtn.innerHTML = liveHtml; liveBtn.dataset.html = liveHtml; }
  if (lockedLive) return document.querySelectorAll("[data-isub]").forEach(b => b.classList.toggle("active", b.dataset.isub === "live"));
  document.querySelectorAll("[data-isub]").forEach(b => b.classList.toggle("active", b.dataset.isub === state.investPage));
  if (state.investPage === "live") { renderCryptoNumbers(); drawCryptoCharts(); }
}
if (!TIMEFRAMES.some(f => f.id === state.cryptoTf)) state.cryptoTf = "1m";
// Chart toolbar above every chart (all three stay in sync): Line/Candles · time frame (candles only) · moving averages
function chartToolsHtml() {
  const mode = state.cryptoChart === "candles" ? "candles" : "line";
  const seg = (attr, val, label, on) => `<button class="seg ${on ? "on" : ""}" data-${attr}="${val}">${label}</button>`;
  return `<div class="segGroup">${seg("cmode", "line", "📈 Line", mode === "line")}${seg("cmode", "candles", "🕯️ Candles", mode === "candles")}</div>` +
    (mode === "candles" ? `<div class="segGroup">${TIMEFRAMES.map(f => seg("tf", f.id, f.id, state.cryptoTf === f.id)).join("")}</div>` : "") +
    `<div class="segGroup maGroup">${MAS.map(m => {
      const on = state.cryptoMA.includes(m.n);
      return `<button class="seg ma ${on ? "on" : ""}" data-ma="${m.n}" title="${m.n}-candle moving average"
        style="--ma:${m.color}">MA${m.n}</button>`;
    }).join("")}</div>`;
}
function updateChartTools() {
  const html = chartToolsHtml();
  document.querySelectorAll("[data-ctools]").forEach(el => el.innerHTML = html);
}
$("cryptoList").addEventListener("click", (e) => {
  const m = e.target.closest("[data-cmode]"), t = e.target.closest("[data-tf]"), a = e.target.closest("[data-ma]");
  if (!m && !t && !a) return;
  if (m) state.cryptoChart = m.dataset.cmode;
  if (t) state.cryptoTf = t.dataset.tf;
  if (a) { const n = Number(a.dataset.ma); state.cryptoMA = state.cryptoMA.includes(n) ? state.cryptoMA.filter(x => x !== n) : [...state.cryptoMA, n]; }
  updateChartTools(); drawCryptoCharts(); save();
});
updateChartTools();
$("investNav").addEventListener("click", (e) => {
  const b = e.target.closest("[data-isub]");
  if (b) { showInvestPage(b.dataset.isub); save(); }
});
showInvestPage(state.investPage);
var cryptoReady = true;   // investCurrent("crypto") can run before this block during start-up
renderCrypto();
seedCryptoHistory();
connectCrypto("binance");
