/* =====================================================================
   🎮 MINI-GAMES: a hub tab with one card per game.
   - 🖼️ Art Gallery (js/18-art.js) opens from here (state.gamePage = "art").
   - ⛏️ Gold Mine Dig (below)              (state.gamePage = "mine").
   ===================================================================== */
if (!state.mine) state.mine = {};
const M = state.mine;
if (typeof M.energy !== "number") M.energy = 5;
M.runs = M.runs || 0; M.best = M.best || 0; M.earned = M.earned || 0; M.ores = M.ores || {};
M.vault = M.vault || {};   // 🏦 ore you kept instead of selling (used to pay for upgrades)
M.up = M.up || {};         // ⬆️ upgrade levels

/* ---------------------------------------------------------------------
   ⛏️ GOLD MINE DIG (test version, no upgrades yet)
   Unlock: buy your first gold mine (it stays unlocked even when the mine runs dry).
   A run costs 1 ⚡ energy (max 5, +1 every 20 minutes, also while away).
   Turn-based digging on a random 15 × 64 map: every step burns lamp oil
   (walking 0.25, dirt 1, each hit on stone 1.25, each hit on granite 1.5).
   Ore is worth SECONDS of your income (avg business income of the last minute, at least 500 / sec):
   the deeper, the better. Back at the surface you sell everything. If the lamp runs out
   underground you are rescued and keep only half. 🔥 A gold rush in your real mines doubles ore value.
   --------------------------------------------------------------------- */
const MINE_W = 15, MINE_H = 64, MINE_START_X = 7;
const MINE_ENERGY_MAX = 5, MINE_REGEN_MS = 20 * 60 * 1000;
const MINE_LAMP = 100, MINE_BAG = 25, MINE_RESCUE_KEEP = 0.5, MINE_MIN_BASE = 500;
const MINE_COST = { walk: 0.25, dirt: 1, stone: 1.25, granite: 1.5 };
// tile types: 0 empty, 1 dirt, 2 stone (2 hits), 3 granite (3 hits), 4 bedrock (unbreakable)
const TILE_HITS = [0, 1, 2, 3, Infinity];
const ORES = {
  coal:    { name: "Coal",    emoji: "⚫", sec: 8,   color: "#2b2b2b", shine: "#6b6b6b" },
  copper:  { name: "Copper",  emoji: "🟠", sec: 20,  color: "#c4652c", shine: "#ffb27a" },
  silver:  { name: "Silver",  emoji: "⚪", sec: 45,  color: "#c9d1db", shine: "#ffffff" },
  gold:    { name: "Gold",    emoji: "🟡", sec: 100, color: "#f2b705", shine: "#fff1a6" },
  diamond: { name: "Diamond", emoji: "💎", sec: 250, color: "#5ee7ff", shine: "#e8fdff" },
};
const ORE_KEYS = Object.keys(ORES);

/* ----- ⬆️ UPGRADES: each level costs money AND ore from your 🏦 vault ----- */
const MINE_UPS = {
  lamp: { icon: "🪔", name: "Bigger lamp", max: 5, eff: (l) => `${MINE_LAMP + 25 * l} lamp oil`,
    costs: [[5e6, { coal: 10 }], [25e6, { copper: 10 }], [125e6, { silver: 8 }], [600e6, { gold: 8 }], [3e9, { diamond: 3 }]] },
  bag: { icon: "🎒", name: "Bigger bag", max: 4, eff: (l) => `holds ${MINE_BAG + 10 * l} ore`,
    costs: [[5e6, { coal: 8 }], [25e6, { copper: 8 }], [125e6, { silver: 6 }], [600e6, { gold: 6 }]] },
  pick: { icon: "⛏️", name: "Better pickaxe", max: 3,
    eff: (l) => ["stone 2 hits · granite 3 hits", "stone 1 hit · granite 3 hits", "stone 1 hit · granite 2 hits", "stone 1 · granite 2 · −25% oil per dig"][l],
    costs: [[15e6, { copper: 15 }], [150e6, { silver: 10 }], [1.5e9, { gold: 6 }]] },
  boots: { icon: "🥾", name: "Mining boots", max: 2, eff: (l) => `walking costs ${[0.25, 0.15, 0.1][l]} oil`,
    costs: [[10e6, { coal: 12 }], [250e6, { silver: 6 }]] },
  appraiser: { icon: "💰", name: "Ore appraiser", max: 5, eff: (l) => l ? `+${l * 10}% ore value` : "normal ore value",
    costs: [[20e6, { copper: 5 }], [100e6, { silver: 5 }], [500e6, { gold: 5 }], [2.5e9, { diamond: 2 }], [12.5e9, { diamond: 5 }]] },
  tank: { icon: "⚡", name: "Energy tank", max: 2, eff: (l) => `up to ${MINE_ENERGY_MAX + l} energy`,
    costs: [[200e6, { silver: 10 }], [2e9, { diamond: 3 }]] },
  recharge: { icon: "⏱️", name: "Fast recharge", max: 2, eff: (l) => `+1 energy every ${[20, 15, 10][l]} min`,
    costs: [[300e6, { gold: 8 }], [3e9, { diamond: 4 }]] },
  insurance: { icon: "🆘", name: "Rescue insurance", max: 2, eff: (l) => `rescue keeps ${[50, 65, 80][l]}% of your ore`,
    costs: [[30e6, { copper: 10 }], [300e6, { silver: 8 }]] },
};
const upLv = (k) => Math.min(M.up[k] || 0, MINE_UPS[k].max);
const energyMax = () => MINE_ENERGY_MAX + upLv("tank");
const regenMs = () => [20, 15, 10][upLv("recharge")] * 60 * 1000;
const rescueKeep = () => [0.5, 0.65, 0.8][upLv("insurance")];
const mineLampMax = () => MINE_LAMP + 25 * upLv("lamp");
const mineBagMax = () => MINE_BAG + 10 * upLv("bag");
const tileHits = (t) => t === 2 ? (upLv("pick") >= 1 ? 1 : 2) : t === 3 ? (upLv("pick") >= 2 ? 2 : 3) : TILE_HITS[t];
const digCost = (t) => (t === 1 ? MINE_COST.dirt : t === 2 ? MINE_COST.stone : MINE_COST.granite) * (upLv("pick") >= 3 ? 0.75 : 1);
const walkCost = () => [0.25, 0.15, 0.1][upLv("boots")];
const sellMult = () => 1 + 0.1 * upLv("appraiser");
const oreValue = (k, rush = false) => Math.round(ORES[k].sec * mineBase() * sellMult() * (rush ? 2 : 1));
function upCost(k) { const l = upLv(k); return l >= MINE_UPS[k].max ? null : MINE_UPS[k].costs[l]; }
function canBuyUp(k) {
  const c = upCost(k); if (!c) return false;
  return state.money >= c[0] && Object.keys(c[1]).every(o => (M.vault[o] || 0) >= c[1][o]);
}
function buyUp(k) {
  if (!canBuyUp(k) || M.run) return;
  const [money, ores] = upCost(k);
  state.money -= money;
  for (const o in ores) M.vault[o] -= ores[o];
  M.up[k] = upLv(k) + 1;
  if (k === "recharge" && M.regenAt) M.regenAt = Math.min(M.regenAt, Date.now() + regenMs());   // the running timer speeds up too
  showNotice(`${MINE_UPS[k].icon} ${MINE_UPS[k].name} level ${M.up[k]}: ${MINE_UPS[k].eff(M.up[k])}!`);
  save(); updateCounter(); renderMine();
}
// 🏦 the vault line (under the energy): how much of each ore you have
const vaultLine = (cls = "") => `<div class="mineVault ${cls}">${ORE_KEYS.map(k =>
  `<span title="${ORES[k].name}">${ORES[k].emoji} <b>${M.vault[k] || 0}</b></span>`).join("")}</div>`;

const mineUnlocked = () => (state.stats.minesBought || 0) > 0 || (state.special.mines || []).length > 0;
// value of one "second" of ore: your average business income over the last minute (no gold mines), at least 500
function mineBase() {
  const h = state.passiveHist || [];
  const avg = h.length ? h.reduce((a, b) => a + b, 0) / h.length : 0;
  return Math.max(MINE_MIN_BASE, Math.round(avg));
}
const mineRush = () => (state.special.goldRush || 0) > 0;

// ⚡ energy refills on real time, also while the game is closed
function mineEnergy() {
  const now = Date.now();
  if (M.energy >= energyMax()) { M.regenAt = null; return M.energy; }
  if (!M.regenAt) M.regenAt = now + regenMs();
  while (M.energy < energyMax() && now >= M.regenAt) { M.energy++; M.regenAt += regenMs(); }
  if (M.energy >= energyMax()) M.regenAt = null;
  return M.energy;
}
const clockMs = (ms) => { const s = Math.max(0, Math.ceil(ms / 1000)); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`; };

// ----- map -----
function mineRand() { return secureRandomInt(1e9) / 1e9; }
function newMineMap() {
  const tile = [], ore = [], hits = [];
  for (let y = 0; y < MINE_H; y++) for (let x = 0; x < MINE_W; x++) {
    const d = y - 1;   // depth below the grass
    let t = 1, o = null;
    if (y === 0) t = 0;                                       // surface
    else if (y === MINE_H - 1) t = 4;                         // bottom: bedrock
    else {
      const r = mineRand();
      const stone = Math.min(0.78, Math.max(0, (d - 3) / 28));
      const granite = Math.min(0.4, Math.max(0, (d - 24) / 55));
      const bedrock = d > 10 ? Math.min(0.09, (d - 10) / 380) : 0;
      if (d > 3 && r < 0.035) t = 0;                          // small caves
      else if (r < 0.035 + bedrock) t = 4;
      else { const r2 = mineRand(); t = r2 < stone * granite ? 3 : r2 < stone ? 2 : 1; }
      if (t >= 1 && t <= 3 && mineRand() < 0.075 + d * 0.0016) {
        const w = { coal: Math.max(0, 1 - d / 38), copper: d >= 6 ? Math.max(0, 1 - Math.abs(d - 20) / 18) : 0,
                    silver: d >= 15 ? Math.max(0, 1 - Math.abs(d - 34) / 20) : 0, gold: d >= 26 ? Math.min(1, (d - 24) / 20) : 0,
                    diamond: d >= 40 ? Math.min(0.55, (d - 38) / 40) : 0 };
        const sum = ORE_KEYS.reduce((a, k) => a + w[k], 0);
        let pick = mineRand() * sum;
        for (const k of ORE_KEYS) { pick -= w[k]; if (pick <= 0) { o = k; break; } }
      }
    }
    if (y >= 1 && y <= 3 && Math.abs(x - MINE_START_X) <= 1 && t === 4) t = 1;   // no bedrock right under the start
    tile.push(t); ore.push(o); hits.push(0);
  }
  return { tile, ore, hits, x: MINE_START_X, y: 0, face: 1, lamp: mineLampMax(), lampMax: mineLampMax(), bag: [], deepest: 0, msg: "", seen: [] };
}
const mIdx = (x, y) => y * MINE_W + x;

// ----- run flow -----
function mineStart() {
  if (M.run || M.pending || !mineUnlocked() || mineEnergy() < 1) return;
  if (M.energy >= energyMax()) M.regenAt = Date.now() + regenMs();
  M.energy--;
  M.run = newMineMap();
  M.run.msg = "Dig down with the arrow keys (or the buttons). Come back up before your lamp runs out!";
  save(); renderMine();
}
// value of a bag of ore if sold right now (🔥 a gold rush doubles it)
const bagValue = (bag) => bag.reduce((a, k) => a + oreValue(k, mineRush()), 0);
const oreCounts = (bag) => { const c = {}; bag.forEach(k => c[k] = (c[k] || 0) + 1); return c; };
const oreList = (bag) => { const c = oreCounts(bag); return ORE_KEYS.filter(k => c[k]).map(k => `${ORES[k].emoji} ${ORES[k].name} ×${c[k]}`).join(" · "); };
// End of a run: the ore waits in M.pending until you choose 💰 Sell or 🏦 Keep in the vault
function mineFinish(rescued) {
  const R = M.run; if (!R) return;
  let bag = R.bag.slice();
  if (rescued) {   // 🆘 the rescue team saves 50% (65% / 80% with insurance), spread evenly, starting with the most valuable piece
    const f = rescueKeep();
    bag.sort((x, y) => ORES[y].sec - ORES[x].sec);
    bag = bag.filter((_, i) => Math.ceil((i + 1) * f) > Math.ceil(i * f));
  }
  const record = R.deepest > M.best;
  // 🏆 achievement flags
  if (rescued) M.rescued = true;
  else if (R.deepest > 0) {
    if (R.bag.length >= mineBagMax()) M.fullBag = true;   // came back up with a completely full bag
    if (R.lamp < 3) M.closeCall = true;                    // made it out with less than 3 oil
  }
  M.runs++; M.best = Math.max(M.best, R.deepest);
  bag.forEach(k => M.ores[k] = (M.ores[k] || 0) + 1);
  M.run = null;
  if (bag.length) M.pending = { bag, rescued, deepest: R.deepest, record, lost: R.bag.length - bag.length };
  else showNotice(rescued ? "🆘 Rescued! You had no ore with you." : `⛏️ Run over: no ore this time. Deepest point ${R.deepest * 2} m.`);
  save(); renderMine();
  if (M.pending) showMinePending();
}
function showMinePending() {
  const P = M.pending; if (!P) return;
  const value = bagValue(P.bag);
  showModal(`<h2>${P.rescued ? "🆘 Rescued!" : "⛏️ Run complete!"}</h2>
    ${P.rescued ? `<p>Your lamp ran out underground. The rescue team brought you up with <b>${Math.round(rescueKeep() * 100)}%</b> of your ore (${P.lost} lost).</p>` : ""}
    <p>${oreList(P.bag)}</p>
    <p>Deepest point: <b>${P.deepest * 2} m</b>${P.record ? " · 🏆 new record!" : ""}</p>
    <div class="moneyRow" style="justify-content:center; margin-top:10px">
      <button class="btn big" data-minep="sell">💰 Sell for ${fmt(value)}${mineRush() ? " 🔥" : ""}</button>
      <button class="btn big ghost" data-minep="store">🏦 Keep in the vault</button></div>
    <p class="muted">Ore in the vault pays for ⬆️ upgrades. You can also sell it later (without the 🔥 gold rush bonus).</p>`);
  $("modalBox").classList.add("gold");
}
$("modalBox").addEventListener("click", (e) => {
  const b = e.target.closest("[data-minep]"); if (!b || !M.pending) return;
  const bag = M.pending.bag;
  if (b.dataset.minep === "sell") {
    const value = bagValue(bag);
    state.money += value; M.earned += value; clickedThisSecond += value;   // counts as income (taxes)
    showNotice(`💰 Sold your ore for ${fmt(value)}!`);
  } else {
    bag.forEach(k => M.vault[k] = (M.vault[k] || 0) + 1);
    showNotice(`🏦 ${bag.length} ore stored in your vault.`);
  }
  M.pending = null; hideModal(); save(); updateCounter(); renderMine();
});
// 💰 sell ore from the vault (normal value, no gold rush bonus)
function showVaultSell() {
  const have = ORE_KEYS.filter(k => (M.vault[k] || 0) > 0);
  const total = have.reduce((a, k) => a + M.vault[k] * oreValue(k), 0);
  showModal(`<h2>🏦 Sell ore from your vault</h2>
    ${have.length ? `<div class="vaultSell">${have.map(k => `<div class="row"><span>${ORES[k].emoji} ${ORES[k].name} ×${M.vault[k]} <span class="muted">(${fmt(oreValue(k))} each)</span></span>
        <button class="btn small" data-vsell="${k}">Sell for ${fmt(M.vault[k] * oreValue(k))}</button></div>`).join("")}</div>
      <button class="btn big" data-vsell="all">💰 Sell everything for ${fmt(total)}</button>` : `<p>Your vault is empty.</p>`}
    <button class="btn ghost" data-modal="close">Close</button>`);
}
$("modalBox").addEventListener("click", (e) => {
  const b = e.target.closest("[data-vsell]"); if (!b) return;
  const keys = b.dataset.vsell === "all" ? ORE_KEYS : [b.dataset.vsell];
  let value = 0;
  keys.forEach(k => { value += (M.vault[k] || 0) * oreValue(k); M.vault[k] = 0; });
  if (!value) return;
  state.money += value; M.earned += value; clickedThisSecond += value;
  showNotice(`💰 Sold vault ore for ${fmt(value)}!`);
  save(); updateCounter(); renderMine();
  if (ORE_KEYS.some(k => M.vault[k] > 0)) showVaultSell(); else hideModal();
});

// one step in direction (dx, dy): walk into an empty tile, or hit a solid one
function mineStep(dx, dy) {
  const R = M.run; if (!R || isPaused()) return;
  if (dx) R.face = dx;
  const nx = R.x + dx, ny = R.y + dy;
  if (nx < 0 || nx >= MINE_W || ny < 0 || ny >= MINE_H) return;
  if (ny === 0 && dy === 0 && R.y === 0) { R.x = nx; R.msg = ""; return mineDraw(); }   // walking on the surface is free
  const i = mIdx(nx, ny), t = R.tile[i];
  if (t === 4) { R.msg = "🪨 Bedrock: too hard to dig. Find another way."; return mineDraw(); }
  if (t === 0) {
    R.x = nx; R.y = ny; R.lamp -= ny === 0 ? 0 : walkCost();
  } else {
    if (R.ore[i] && R.bag.length >= mineBagMax()) { R.msg = "🎒 Your bag is full! Head back up."; return mineDraw(); }
    R.lamp -= digCost(t);
    R.hits[i]++;
    if (R.hits[i] >= tileHits(t)) {
      R.tile[i] = 0;
      if (R.ore[i]) { R.bag.push(R.ore[i]); R.msg = `${ORES[R.ore[i]].emoji} +1 ${ORES[R.ore[i]].name}!`; R.ore[i] = null; }
      else R.msg = "";
      R.x = nx; R.y = ny;
    } else R.msg = "";
  }
  R.deepest = Math.max(R.deepest, R.y);
  if (R.lamp <= 0) { R.lamp = 0; mineDraw(); return mineFinish(R.y > 0); }
  mineDraw(); mineHud();
}

// ----- drawing -----
const TS = 32, VIEW_ROWS = 14;
const tileRand = (i, k) => { let h = (i * 374761393 + k * 668265263) | 0; h = (h ^ (h >>> 13)) * 1274126177; return ((h ^ (h >>> 16)) >>> 0) / 4294967295; };
function mineDraw() {
  const cv = $("mineCanvas"), R = M.run; if (!cv) return;
  const ctx = cv.getContext("2d"), W = MINE_W * TS, H = VIEW_ROWS * TS;
  if (!R) { ctx.clearRect(0, 0, W, H); return; }
  // camera: keep the miner in the upper middle, surface visible near the top
  const camY = Math.max(-2 * TS, Math.min((MINE_H - VIEW_ROWS) * TS, R.y * TS - 5 * TS));
  // sky
  const sky = ctx.createLinearGradient(0, -camY - 3 * TS, 0, -camY + TS);
  sky.addColorStop(0, "#3a2c78"); sky.addColorStop(1, "#f09a5a");
  ctx.fillStyle = sky; ctx.fillRect(0, 0, W, H);
  for (let ty = Math.max(0, Math.floor(camY / TS)); ty < Math.min(MINE_H, Math.ceil((camY + H) / TS) + 1); ty++) {
    for (let tx = 0; tx < MINE_W; tx++) {
      const i = mIdx(tx, ty), t = R.tile[i], px = tx * TS, py = ty * TS - camY;
      if (ty === 0) continue;
      const depth = ty / MINE_H;
      if (t === 0) {   // dug tunnel / cave
        ctx.fillStyle = `rgb(${46 - depth * 20},${30 - depth * 12},${22 - depth * 8})`; ctx.fillRect(px, py, TS, TS);
        continue;
      }
      const base = t === 1 ? [139 - depth * 50, 94 - depth * 40, 56 - depth * 25] : t === 2 ? [118, 112, 108] : t === 3 ? [88, 84, 96] : [40, 38, 46];
      ctx.fillStyle = `rgb(${base.map(Math.round).join(",")})`; ctx.fillRect(px, py, TS, TS);
      // texture specks
      for (let k = 0; k < 5; k++) {
        const sx = tileRand(i, k) * (TS - 4), sy = tileRand(i, k + 9) * (TS - 4);
        ctx.fillStyle = k % 2 ? "rgba(0,0,0,0.18)" : "rgba(255,255,255,0.10)";
        ctx.fillRect(px + sx, py + sy, 3, 3);
      }
      if (t === 4) { ctx.strokeStyle = "rgba(0,0,0,0.5)"; ctx.lineWidth = 2; ctx.strokeRect(px + 3, py + 3, TS - 6, TS - 6); }
      ctx.strokeStyle = "rgba(0,0,0,0.25)"; ctx.lineWidth = 1; ctx.strokeRect(px + 0.5, py + 0.5, TS - 1, TS - 1);
      if (R.ore[i]) {   // ore nuggets
        const o = ORES[R.ore[i]];
        for (let k = 0; k < 3; k++) {
          const cx = px + 8 + tileRand(i, k + 20) * (TS - 16), cy = py + 8 + tileRand(i, k + 30) * (TS - 16), r = 4 + tileRand(i, k + 40) * 3;
          ctx.fillStyle = o.color; ctx.beginPath();
          if (R.ore[i] === "diamond") { ctx.moveTo(cx, cy - r - 1); ctx.lineTo(cx + r, cy); ctx.lineTo(cx, cy + r + 1); ctx.lineTo(cx - r, cy); }
          else ctx.arc(cx, cy, r, 0, Math.PI * 2);
          ctx.fill(); ctx.fillStyle = o.shine; ctx.fillRect(cx - 1.5, cy - 2.5, 2, 2);
        }
      }
      if (R.hits[i] > 0) {   // cracks
        ctx.strokeStyle = "rgba(0,0,0,0.65)"; ctx.lineWidth = 2; ctx.beginPath();
        for (let k = 0; k < R.hits[i] * 2; k++) {
          const a = tileRand(i, k + 50) * Math.PI * 2, cx = px + TS / 2, cy = py + TS / 2;
          ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(a) * TS * 0.45, cy + Math.sin(a) * TS * 0.45);
        }
        ctx.stroke();
      }
    }
  }
  // grass line + entrance
  const gy = TS - camY;
  if (gy > -8 && gy < H) {
    ctx.fillStyle = "#4caf50"; ctx.fillRect(0, gy - 4, W, 6);
    ctx.fillStyle = "#7b4a1e"; ctx.fillRect(MINE_START_X * TS - 6, gy - 30, 6, 26); ctx.fillRect(MINE_START_X * TS + TS, gy - 30, 6, 26);
    ctx.fillRect(MINE_START_X * TS - 8, gy - 34, TS + 16, 6);
    ctx.font = "16px system-ui"; ctx.fillText("⛏️", MINE_START_X * TS + 8, gy - 38);
  }
  // darkness: the lamp lights a circle around the miner (smaller as the oil runs out)
  const mx = R.x * TS + TS / 2, my = R.y * TS - camY + TS / 2;
  if (R.y > 0 || camY > 0) {
    const rad = TS * (2.3 + 2.2 * Math.min(1, R.lamp / MINE_LAMP));
    const g = ctx.createRadialGradient(mx, my, rad * 0.35, mx, my, rad);
    g.addColorStop(0, "rgba(5,4,10,0)"); g.addColorStop(1, "rgba(5,4,10,0.94)");
    ctx.save(); ctx.beginPath(); ctx.rect(0, Math.max(0, gy), W, H); ctx.clip();
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); ctx.restore();
  }
  // miner (placeholder): a mole with a hard hat and lamp
  ctx.save(); ctx.translate(mx, my); ctx.scale(R.face, 1);
  ctx.fillStyle = "#6b4a3a"; ctx.beginPath(); ctx.ellipse(0, 4, 11, 10, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#ff9fb0"; ctx.beginPath(); ctx.arc(10, 5, 3.5, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#111"; ctx.beginPath(); ctx.arc(5, 1, 1.8, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#ffd34d"; ctx.beginPath(); ctx.arc(0, -4, 10, Math.PI, 0); ctx.fill(); ctx.fillRect(-11, -5, 22, 3);
  ctx.fillStyle = "#fff6c0"; ctx.beginPath(); ctx.arc(6, -9, 3, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

function mineHud() {
  const R = M.run, hud = $("mineHud"); if (!hud || !R) return;
  const lampMax = R.lampMax || MINE_LAMP, lampPct = Math.max(0, R.lamp / lampMax * 100);
  const back = R.y * walkCost();   // oil needed to walk back up an open shaft
  const counts = {}; R.bag.forEach(k => counts[k] = (counts[k] || 0) + 1);
  hud.innerHTML = `
    <div class="mineStat"><span>🪔 Lamp</span><b>${Math.ceil(R.lamp)} / ${lampMax}</b></div>
    <div class="mineBar"><div style="width:${lampPct}%;background:${lampPct < 25 ? "#ff6b6b" : lampPct < 50 ? "#ffb347" : "#ffd34d"}"></div></div>
    ${R.y > 0 && R.lamp < back + 6 ? `<div class="mineWarn">⚠️ Head back up! About ${Math.ceil(back)} oil to get out.</div>` : ""}
    <div class="mineStat"><span>📏 Depth</span><b>${R.y * 2} m</b></div>
    <div class="mineStat"><span>🏆 Deepest</span><b>${R.deepest * 2} m</b></div>
    <div class="mineStat"><span>🎒 Bag</span><b>${R.bag.length} / ${mineBagMax()}</b></div>
    <div class="mineOres">${ORE_KEYS.filter(k => counts[k]).map(k => `<span>${ORES[k].emoji} ${counts[k]}</span>`).join("") || `<span class="muted">empty</span>`}</div>
    <div class="mineStat"><span>💰 Worth</span><b>${fmt(bagValue(R.bag))}</b></div>
    ${mineRush() ? `<div class="mineRush">🔥 Gold rush: ore ×2!</div>` : ""}
    <div class="mineMsg">${R.msg || "&nbsp;"}</div>
    ${R.y === 0
      ? `<button class="btn big" data-mine="end">⛏️ End run</button>`
      : `<button class="btn ghost small" data-mine="quit" title="You keep only part of your ore">🆘 Call the rescue team (keep ${Math.round(rescueKeep() * 100)}%)</button>`}`;
}

function renderMine() {
  const v = $("mineView"); if (!v) return;
  const e = mineEnergy();
  if (!M.run) {
    v.innerHTML = `<button class="btn ghost small gamesBack" data-games-back>← 🎮 Mini-games</button>
      <div class="card mineIntro">
        <h2>⛏️ Gold Mine Dig</h2>
        <p>Dig down into your gold mine and grab as much ore as your bag can hold. The deeper you go, the better the ore,
          but every step burns lamp oil. Back at the surface, sell your ore or keep it in your 🏦 vault to pay for upgrades. If the lamp runs out underground, the rescue team saves ${Math.round(rescueKeep() * 100)}% of your ore.</p>
        <div class="mineOreRow">${ORE_KEYS.map(k => `<span>${ORES[k].emoji} ${ORES[k].name}: <b>${fmt(oreValue(k))}</b></span>`).join("")}</div>
        <p class="muted">Ore is worth seconds of your income (${ORES.coal.sec}–${ORES.diamond.sec} sec each, based on your business income over the last minute). 🔥 A gold rush in your mines doubles it.</p>
        <div class="mineEnergy">${"⚡".repeat(e)}${"<span class='off'>⚡</span>".repeat(Math.max(0, energyMax() - e))}
          <span class="muted">${e < energyMax() && M.regenAt ? `+1 in <b id="mineRegen">${clockMs(M.regenAt - Date.now())}</b>` : "full"}</span></div>
        ${vaultLine()}
        <div class="moneyRow" style="justify-content:center">
          ${M.pending ? `<button class="btn big" data-mine="pending">🎒 Ore from your last run: sell or keep</button>`
            : `<button class="btn big" data-mine="start" ${e >= 1 ? "" : "disabled"}>⛏️ Start a run (⚡ 1)</button>`}
          <button class="btn ghost" data-mine="vault" ${ORE_KEYS.some(k => M.vault[k] > 0) ? "" : "disabled"}>💰 Sell vault ore</button></div>
        <p class="muted">Runs: ${M.runs} · Deepest ever: ${M.best * 2} m · Earned: ${fmt(M.earned)}</p>
      </div>
      <div class="card mineUps">
        <h3>⬆️ Upgrades</h3>
        <p class="muted">Each level costs money and ore from your 🏦 vault. Keep ore after a run to save up for them.</p>
        <div class="mineUpGrid">${Object.keys(MINE_UPS).map(k => {
          const U = MINE_UPS[k], l = upLv(k), c = upCost(k);
          return `<div class="mineUp ${c ? "" : "maxed"}">
            <div class="mineUpHead"><span class="mineUpIcon">${U.icon}</span><b>${U.name}</b><span class="mineUpLv">Lv ${l}/${U.max}</span></div>
            <div class="mineUpEff">Now: ${U.eff(l)}</div>
            ${c ? `<div class="mineUpEff next">Next: ${U.eff(l + 1)}</div>
              <div class="mineUpCost"><span class="${state.money >= c[0] ? "" : "short"}">${fmt(c[0])}</span>
                ${Object.keys(c[1]).map(o => `<span class="${(M.vault[o] || 0) >= c[1][o] ? "" : "short"}">${ORES[o].emoji} ${M.vault[o] || 0}/${c[1][o]}</span>`).join("")}</div>
              <button class="btn small" data-mup="${k}" ${canBuyUp(k) ? "" : "disabled"}>⬆️ Upgrade</button>`
            : `<div class="mineUpEff next">✅ Max level</div>`}
          </div>`;
        }).join("")}</div>
      </div>`;
    return;
  }
  v.innerHTML = `<button class="btn ghost small gamesBack" data-games-back>← 🎮 Mini-games</button>
    <div class="mineLayout">
      <div class="mineStage">
        <canvas id="mineCanvas" width="${MINE_W * TS}" height="${VIEW_ROWS * TS}"></canvas>
        <div class="minePad">
          <button data-dir="up" aria-label="Up">▲</button>
          <button data-dir="left" aria-label="Left">◀</button><button data-dir="down" aria-label="Down">▼</button><button data-dir="right" aria-label="Right">▶</button>
        </div>
      </div>
      <div class="card mineSide" id="mineHud"></div>
    </div>`;
  mineDraw(); mineHud();
}

// ----- input -----
const DIRS = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };
const KEYS = { ArrowUp: "up", ArrowDown: "down", ArrowLeft: "left", ArrowRight: "right", w: "up", s: "down", a: "left", d: "right", W: "up", S: "down", A: "left", D: "right" };
let mineLastStep = 0;
const minePlaying = () => state.view === "games" && state.gamePage === "mine" && M.run && $("modal").hidden && $("mainMenu").hidden;
function mineTry(dir) {
  const now = performance.now();
  if (now - mineLastStep < 110) return;   // one step every 0.11 s, even when a key is held
  mineLastStep = now;
  mineStep(...DIRS[dir]);
}
document.addEventListener("keydown", (e) => {
  if (!minePlaying() || !KEYS[e.key] || e.target.closest("input, textarea, select")) return;
  e.preventDefault(); mineTry(KEYS[e.key]);
});
let padTimer = null;
$("mineView").addEventListener("pointerdown", (e) => {
  const b = e.target.closest("[data-dir]"); if (!b || !M.run) return;
  e.preventDefault(); mineLastStep = 0; mineTry(b.dataset.dir);
  clearInterval(padTimer); padTimer = setInterval(() => mineTry(b.dataset.dir), 140);
});
["pointerup", "pointerleave", "pointercancel"].forEach(ev => $("mineView").addEventListener(ev, () => clearInterval(padTimer)));
$("mineView").addEventListener("click", (e) => {
  const b = e.target.closest("[data-mine]"); if (!b) return;
  if (b.dataset.mine === "start") mineStart();
  if (b.dataset.mine === "end" && M.run && M.run.y === 0) mineFinish(false);
  if (b.dataset.mine === "quit" && M.run && M.run.y > 0) mineFinish(true);
  if (b.dataset.mine === "pending") showMinePending();
  if (b.dataset.mine === "vault") showVaultSell();
});
$("mineView").addEventListener("click", (e) => { const b = e.target.closest("[data-mup]"); if (b) buyUp(b.dataset.mup); });

/* ---------------------------------------------------------------------
   🎮 HUB
   --------------------------------------------------------------------- */
function renderGames() {
  updateArtTab();
  const page = state.gamePage;
  $("gamesHub").hidden = !!page; $("mineView").hidden = page !== "mine";
  if (page === "mine") return renderMine();
  const art = state.art.unlocked, mine = mineUnlocked(), e = mineEnergy();
  $("gamesHub").innerHTML = `<h2 class="gamesTitle">🎮 Mini-games</h2>
    <p class="muted">Unlock mini-games with your buildings and achievements, then play them to earn extra money.</p>
    <div class="gamesGrid">
      <div class="card gameCard">
        <div class="gameIcon">🖼️</div><h3>Art Gallery</h3>
        <p class="muted">Copy paintings as closely as you can. Sell them or keep them in your collection.</p>
        <div class="gameStatus">${art ? `🖼️ ${(state.art.items || []).length} paintings in your collection` : `🔒 ${artGalleryReady() ? `Open it for ${fmt(ART_UNLOCK)}` : "Unlocks with the 💵 Millionaire achievement"}`}</div>
        <button class="btn" data-game="art">${art ? "▶ Play" : "View"}</button>
      </div>
      <div class="card gameCard ${mine ? "" : "locked"}">
        <div class="gameIcon">⛏️</div><h3>Gold Mine Dig</h3>
        <p class="muted">Dig deep for coal, copper, silver, gold and diamonds before your lamp runs out.</p>
        <div class="gameStatus">${mine ? `${"⚡".repeat(e)}${"<span class='off'>⚡</span>".repeat(Math.max(0, energyMax() - e))}${M.run ? " · ⛏️ run in progress" : ""}` : "🔒 Buy your first ⛏️ gold mine (💰 Income → ⭐ Special)"}</div>
        ${mine ? vaultLine("small") : ""}
        <button class="btn" data-game="mine" ${mine ? "" : "disabled"}>${M.run ? "▶ Continue" : "▶ Play"}</button>
      </div>
      <div class="card gameCard soon"><div class="gameIcon">❔</div><h3>More coming soon</h3>
        <p class="muted">New mini-games will unlock with other buildings.</p></div>
    </div>`;
}
function openGame(page) {
  state.gamePage = page || null;
  showView("games");
}
$("gamesHub").addEventListener("click", (e) => {
  const b = e.target.closest("[data-game]"); if (!b || b.disabled) return;
  openGame(b.dataset.game);
});
document.addEventListener("click", (e) => { if (e.target.closest("[data-games-back]")) openGame(null); });

// keep the energy timer and the tab lock up to date
setInterval(() => {
  if (state.view !== "games") return;
  const before = M.energy; mineEnergy();
  if (M.energy !== before) { save(); if (!M.run || !state.gamePage) renderGames(); }
  const r = $("mineRegen"); if (r && M.regenAt) r.textContent = clockMs(M.regenAt - Date.now());
}, 1000);
updateArtTab();
if (state.view === "art" || state.view === "games") showView("games");   // old saves: the Art Gallery tab became 🎮 Mini-games
