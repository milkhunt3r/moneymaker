/* Empire of Coins © 2026 milkhunt3r. All rights reserved. */
/* =====================================================================
   🧬 GENE CASCADE: the maths (no screen code, so it can also be simulated outside the game)
   Our own cluster slot: 7×7 grid, clusters of 5+ touching specimens (up/down/left/right) pay,
   winners pop, the rest fall down and new ones drop in (tumbles).
   🔬 Lab spots: a square where a winning specimen popped is marked; every later win popping there
   doubles its multiplier ×2 → ×4 … ×128. Spots inside one cluster are ADDED, then multiply that cluster's pay.
   Base game: spots reset after each paid spin. Free spins: spots stay for the whole bonus.
   🧪 DNA vials (scatters): 3–7 on the final grid → 10/12/15/20/30 free spins (also during the bonus).
   Biggest win of one spin (bonus included): 5,000× the bet.
   Tuned by simulation (32 million spins) to about 99% return, with small wins more often and the bonus
   more often than the original game it is inspired by.
   ===================================================================== */
const SL_N = 7, SL_CELLS = SL_N * SL_N, SL_SCAT = 7, SL_CAP = 5000;
// 7 specimens, most valuable first: shape of the pay table for clusters of 5, 10 and 15+ (× bet, before SL_TUNE.scale); sizes in between are filled in smoothly
const SL_SYMBOLS = [
  { name: "Elder dragon", pic: "elder-dragon", p: [1, 5, 150] },
  { name: "Phoenix",      pic: "phoenix",      p: [0.75, 4, 100] },
  { name: "Unicorn",      pic: "unicorn",      p: [0.5, 3, 60] },
  { name: "Kraken",       pic: "kraken",       p: [0.4, 2, 40] },
  { name: "Frog",         pic: "frog",         p: [0.3, 1.5, 30] },
  { name: "Butterfly",    pic: "butterfly",    p: [0.25, 1.25, 25] },
  { name: "Mushroom",     pic: "mushroom",     p: [0.2, 1, 20] },
];
const SL_FREE = { 3: 10, 4: 12, 5: 15, 6: 20, 7: 30 };
// tuning (see the header): how often each specimen drops in (base game / free spins) and a pay scale
// Simulated over 32 million paid spins: return ≈ 99.2% (base game ≈ 49.6%, free spins ≈ 49.5%), a win on ≈ 41% of spins,
// free spins about once every 100 spins, an average bonus pays ≈ 50× the bet (median ≈ 15.5×).
const SL_TUNE = {
  base:  { w: [6, 8, 10, 12, 15, 17, 19], scat: 0.74 },
  bonus: { w: [5.137, 6.705, 8.706, 10.706, 14.569, 18.294, 22.02], scat: 0.5 },   // free spins: cheaper specimens land a bit more, so spots grow
  scale: 1.95,
};
// full pay table: SL_PAY[symbol][size] for sizes 5..15 (15 = 15 or more)
const SL_PAY = [];
function slBuildPay() {
  SL_SYMBOLS.forEach((s, i) => {
    const t = [], [a, b, c] = s.p;
    for (let n = 5; n <= 15; n++) t[n] = n <= 10 ? a * Math.pow(b / a, (n - 5) / 5) : b * Math.pow(c / b, (n - 10) / 5);
    SL_PAY[i] = t.map(v => Math.round(v * SL_TUNE.scale * 100) / 100);
  });
}
slBuildPay();
const slMult = (hits) => (hits >= 2 ? Math.min(128, Math.pow(2, hits - 1)) : 0);   // 1 hit = marked, 2 = ×2, 3 = ×4 …

function slPick(rand, mode) {
  const t = SL_TUNE[mode], tot = t.w.reduce((a, b) => a + b, 0) + t.scat;
  let x = rand() * tot;
  for (let i = 0; i < t.w.length; i++) { if ((x -= t.w[i]) < 0) return i; }
  return SL_SCAT;
}
// find every cluster of 5+ (scatters never form clusters)
function slClusters(g) {
  const seen = new Uint8Array(SL_CELLS), out = [];
  for (let i = 0; i < SL_CELLS; i++) {
    if (seen[i] || g[i] === SL_SCAT) continue;
    const s = g[i], cells = [], stack = [i]; seen[i] = 1;
    while (stack.length) {
      const k = stack.pop(); cells.push(k);
      const r = (k / SL_N) | 0, c = k % SL_N;
      for (const n of [r > 0 ? k - SL_N : -1, r < SL_N - 1 ? k + SL_N : -1, c > 0 ? k - 1 : -1, c < SL_N - 1 ? k + 1 : -1])
        if (n >= 0 && !seen[n] && g[n] === s) { seen[n] = 1; stack.push(n); }
    }
    if (cells.length >= 5) out.push({ sym: s, cells: cells.sort((a, b) => a - b) });
  }
  return out;
}
/* One paid spin (or one free spin). hits = the lab spots (array of 49 counts), changed in place.
   Returns the steps to animate: [{ grid, wins:[{sym,cells,size,base,mult,pay}], hits:[...after], drop:[cells that are new] }] */
function slSpin(rand, mode, hits) {
  let g = Array.from({ length: SL_CELLS }, () => slPick(rand, mode));
  const steps = []; let total = 0, drop = g.map((_, i) => i);
  for (let guard = 0; guard < 60; guard++) {
    const cl = slClusters(g);
    const wins = cl.map(({ sym, cells }) => {
      const size = cells.length, base = SL_PAY[sym][Math.min(15, size)];
      const mult = cells.reduce((a, k) => a + slMult(hits[k]), 0);
      return { sym, cells, size, base, mult, pay: base * (mult || 1) };
    });
    wins.forEach(w => w.cells.forEach(k => hits[k]++));   // spots update after paying
    const pay = wins.reduce((a, w) => a + w.pay, 0); total += pay;
    steps.push({ grid: g.slice(), wins, pay, hits: hits.slice(), drop });
    if (!wins.length) break;
    // pop, fall, refill
    const gone = new Set(wins.flatMap(w => w.cells)), ng = new Array(SL_CELLS); drop = [];
    for (let c = 0; c < SL_N; c++) {
      const keep = [];
      for (let r = SL_N - 1; r >= 0; r--) { const k = r * SL_N + c; if (!gone.has(k)) keep.push(g[k]); }
      for (let r = SL_N - 1, j = 0; r >= 0; r--, j++) {
        const k = r * SL_N + c;
        if (j < keep.length) ng[k] = keep[j]; else { ng[k] = slPick(rand, mode); drop.push(k); }
      }
    }
    g = ng;
  }
  const scat = g.filter(x => x === SL_SCAT).length;
  return { steps, total, scat, free: SL_FREE[Math.min(7, scat)] || 0 };
}
/* A whole paid spin: the base spin, then every free spin it gives (spots kept), capped at 5,000× the bet.
   Everything is decided here, before anything is shown (refresh-safe). Amounts are in "× bet". */
function slRound(rand) {
  const base = slSpin(rand, "base", new Array(SL_CELLS).fill(0));
  const round = { base, bonus: [], award: base.free, total: base.total, capped: false };
  if (base.free) slBonus(rand, base.free, round);
  return round;
}
function slBonus(rand, free, round) {   // play the free spins (lab spots kept), adding to round
  const hits = new Array(SL_CELLS).fill(0);
  let left = free;
  while (left > 0 && !round.capped) {
    left--;
    const s = slSpin(rand, "bonus", hits);
    if (s.free) { left += s.free; round.award += s.free; }
    round.bonus.push(s); round.total += s.total;
    if (round.total >= SL_CAP) { round.total = SL_CAP; round.capped = true; }
  }
}
/* 🛒 Bonus buy: pay SL_BUY × the bet to start free spins at once. The number of DNA vials follows how often they
   trigger by themselves (simulated: 3 vials 89.7%, 4: 9.5%, 5: 0.74%, 6: 0.04%, 7: 0.01%).
   Price set by simulation so a bought bonus also returns about 99%. */
const SL_BUY_SCAT = [[3, 0.8966], [4, 0.0955], [5, 0.0074], [6, 0.0004], [7, 0.0001]];
const SL_BUY = 50.5;   // a bought bonus pays ≈ 49.9× on average (2.4 million simulated) → ≈ 98.9% return
function slBuyRound(rand) {
  let x = rand() * SL_BUY_SCAT.reduce((a, b) => a + b[1], 0), scat = 3;
  for (const [k, w] of SL_BUY_SCAT) { if ((x -= w) < 0) { scat = k; break; } }
  const round = { base: null, bought: true, scat, bonus: [], award: SL_FREE[scat], total: 0, capped: false };
  slBonus(rand, SL_FREE[scat], round);
  return round;
}
if (typeof module !== "undefined") module.exports = { slBuyRound, SL_BUY, slBuildPay, slRound, slSpin, SL_TUNE, SL_PAY, SL_SYMBOLS, SL_CAP };
