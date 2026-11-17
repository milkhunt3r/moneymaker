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
M.lifts = M.lifts || 0;    // 🛗 single-use mine lifts you own (bought before a run)
M.chests = M.chests || 0; M.jackpots = M.jackpots || 0;

/* ---------------------------------------------------------------------
   ⛏️ GOLD MINE DIG (test version, no upgrades yet)
   Unlock: buy your first gold mine (it stays unlocked even when the mine runs dry).
   A run costs 1 ⚡ energy (max 5, +1 every 20 minutes, also while away).
   Turn-based digging on a random 25 × 127 map (250 m deep, see 🗺️ MAP below): every step burns lamp oil
   (walking 0.25, dirt 1, each hit on stone 1.25, each hit on granite 1.5).
   Ore is worth SECONDS of your income (avg business income of the last minute, at least 500 / sec):
   the deeper, the better. Back at the surface you sell everything. If the lamp runs out
   underground you are rescued and keep only half. 🔥 A gold rush in your real mines doubles ore value.
   --------------------------------------------------------------------- */
/* ----- 🗺️ MAP: 25 wide, rows 0..126 (2 m each → the deepest diggable row is 250 m) -----
   Layers:   0–100 m  the old mine (dirt, stone, granite)
           100–170 m  🌋 lava zone: dark basalt, lava pools and hidden lava pockets
           170–250 m  💠 crystal caves: more caves, rubies, chests
   Below 150 m it is hot: the lamp burns 25% faster (🧯 Heat suit Lv 2 removes it).
   Treasure chests (1–2 per map) sit below 130 m. */
const MINE_W = 25, MINE_H = 127, MINE_START_X = 12, VIEW_COLS = 15;
const ROW_LAVA = 50, ROW_HEAT = 75, ROW_CHEST = 65, ROW_CRYSTAL = 85;   // 100 m, 150 m, 130 m, 170 m
const MINE_LIFT_SEC = 60, MINE_LIFT_MAX = 5;          // 🛗 a lift costs 60 sec of income, hold up to 5
const CHEST_SLOTS = 5;                                 // a chest takes 5 bag slots
const MINE_DEEP_ORE = 0.07;                           // chance of ore in a tile below 100 m (0.15–0.17 just above)
const LAVA_FLOW = 6;                                   // a lava pocket releases up to 6 tiles of flowing lava
const MINE_ENERGY_MAX = 5, MINE_REGEN_MS = 20 * 60 * 1000;
const MINE_LAMP = 100, MINE_BAG = 25, MINE_RESCUE_KEEP = 0.5, MINE_MIN_BASE = 500;
const MINE_COST = { walk: 0.25, dirt: 1, stone: 1.25, granite: 1.5 };
// tile types: 0 empty, 1 dirt, 2 stone (2 hits), 3 granite (3 hits), 4 bedrock (unbreakable),
//             5 lava (can't enter), 6 hot rock: a hidden lava pocket (digs like stone, red cracks warn you)
const TILE_HITS = [0, 1, 2, 3, Infinity, Infinity, 2];
const ORES = {
  coal:    { name: "Coal",    emoji: "⚫", sec: 8,   color: "#2b2b2b", shine: "#6b6b6b" },
  copper:  { name: "Copper",  emoji: "🟠", sec: 20,  color: "#c4652c", shine: "#ffb27a" },
  silver:  { name: "Silver",  emoji: "⚪", sec: 45,  color: "#c9d1db", shine: "#ffffff" },
  gold:    { name: "Gold",    emoji: "🟡", sec: 100, color: "#f2b705", shine: "#fff1a6" },
  diamond: { name: "Diamond", emoji: "💎", sec: 250, color: "#5ee7ff", shine: "#e8fdff" },
  ruby:    { name: "Ruby",    emoji: "🔴", sec: 500, color: "#e0115f", shine: "#ffc2d6" },
};
const ORE_KEYS = Object.keys(ORES);
// the ore art as a small inline icon (used everywhere ore is listed: vault, values, costs, bag, pop-ups, wiki)
const oreIcon = (k) => `<img class="oreIcon" src="assets/mine/ore-${k}.webp" alt="${ORES[k].name}" title="${ORES[k].name}">`;

/* ----- ⬆️ UPGRADES: each level costs money AND ore from your 🏦 vault ----- */
const MINE_UPS = {
  lamp: { icon: "🪔", name: "Bigger lamp", max: 7, eff: (l) => `${MINE_LAMP + 25 * l} lamp oil`,
    costs: [[5e6, { coal: 10 }], [25e6, { copper: 10 }], [125e6, { silver: 8 }], [600e6, { gold: 8 }], [3e9, { diamond: 3 }],
            [10e9, { ruby: 4 }], [30e9, { ruby: 10 }]] },
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
  heat: { icon: "🧯", name: "Heat suit", max: 2,
    eff: (l) => ["no protection", "survive one lava touch per run", "survive one lava touch · no extra lamp burn below 150 m"][l],
    costs: [[1e9, { diamond: 4 }], [8e9, { ruby: 6 }]] },
};
const upLv = (k) => Math.min(M.up[k] || 0, MINE_UPS[k].max);
const energyMax = () => MINE_ENERGY_MAX + upLv("tank");
const regenMs = () => [20, 15, 10][upLv("recharge")] * 60 * 1000;
const rescueKeep = () => [0.5, 0.65, 0.8][upLv("insurance")];
const mineLampMax = () => MINE_LAMP + 25 * upLv("lamp");
const mineBagMax = () => MINE_BAG + 10 * upLv("bag");
const tileHits = (t) => t === 2 || t === 6 ? (upLv("pick") >= 1 ? 1 : 2) : t === 3 ? (upLv("pick") >= 2 ? 2 : 3) : TILE_HITS[t];
// 🔥 below 150 m the lamp burns 25% faster (Heat suit Lv 2 removes it)
const heatMult = (y) => (y >= ROW_HEAT && upLv("heat") < 2 ? 1.25 : 1);
// 🪨 deep rock is harder: basalt (100–170 m) and crystal rock (170 m+) take more oil to dig
const MINE_HARD = [1, 1.5, 2];
const rockMult = (y) => MINE_HARD[y >= ROW_CRYSTAL ? 2 : y >= ROW_LAVA ? 1 : 0];
const digCost = (t, y = 0) => (t === 1 ? MINE_COST.dirt : t === 2 || t === 6 ? MINE_COST.stone : MINE_COST.granite) * (upLv("pick") >= 3 ? 0.75 : 1) * heatMult(y) * rockMult(y);
const walkCost = (y = 0) => [0.25, 0.15, 0.1][upLv("boots")] * heatMult(y);
// oil needed to walk straight back up from row y (an open shaft)
const climbCost = (y) => { let c = 0; for (let r = 1; r <= y; r++) c += walkCost(r); return c; };
const liftPrice = () => Math.round(MINE_LIFT_SEC * mineBase());
const lavaKeep = () => rescueKeep() * 0.6;   // 🌋 burned by lava: the emergency rescue saves less (30 / 39 / 48%)
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
  `<span title="${ORES[k].name}">${oreIcon(k)} <b>${M.vault[k] || 0}</b></span>`).join("")}</div>`;

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
      const granite = Math.min(y >= ROW_LAVA ? 0.5 : 0.4, Math.max(0, (d - 24) / 55));
      const bedrock = d > 10 ? Math.min(0.09, (d - 10) / 380) : 0;
      const caves = d <= 3 ? 0 : y >= ROW_CRYSTAL ? 0.07 : 0.035;   // no caves in the top rows (and no stray bedrock there either)
      const pocket = y >= ROW_CRYSTAL ? 0.015 : y >= ROW_LAVA ? 0.02 : 0;   // 🌋 hidden lava pockets
      if (r < caves) t = 0;                                   // small caves
      else if (r < caves + bedrock) t = 4;
      else if (r < caves + bedrock + pocket) t = 6;
      else { const r2 = mineRand(); t = r2 < stone * granite ? 3 : r2 < stone ? 2 : 1; }
      // ore is rarer below 100 m (it is worth much more down there)
      if (t >= 1 && t <= 3 && mineRand() < (y >= ROW_LAVA ? MINE_DEEP_ORE : 0.075 + d * 0.0016)) {
        const m = y * 2;   // metres
        const w = y < ROW_LAVA
          ? { coal: Math.max(0, 1 - d / 38), copper: d >= 6 ? Math.max(0, 1 - Math.abs(d - 20) / 18) : 0,
              silver: d >= 15 ? Math.max(0, 1 - Math.abs(d - 34) / 20) : 0, gold: d >= 26 ? Math.min(1, (d - 24) / 20) : 0,
              diamond: d >= 40 ? Math.min(0.55, (d - 38) / 40) : 0, ruby: 0 }
          : { coal: 0, copper: 0, silver: Math.max(0, 0.35 - (m - 100) / 100), gold: Math.max(0.45, 1 - (m - 100) / 200),
              diamond: Math.min(0.85, 0.55 + (m - 100) / 300), ruby: m >= 150 ? Math.min(0.7, 0.15 + (m - 150) / 150) : 0 };
        const sum = ORE_KEYS.reduce((a, k) => a + w[k], 0);
        let pick = mineRand() * sum;
        for (const k of ORE_KEYS) { pick -= w[k]; if (pick <= 0) { o = k; break; } }
      }
    }
    if (y >= 1 && y <= 3 && Math.abs(x - MINE_START_X) <= 1 && t === 4) t = 1;   // no bedrock right under the start
    tile.push(t); ore.push(o); hits.push(0);
  }
  // 🌋 lava pools (1–3 tiles wide) from 100 m down: walls you have to dig around
  for (let y = ROW_LAVA; y < MINE_H - 1; y++) {
    const n = (y >= ROW_CRYSTAL ? 0.25 : 0.45) + mineRand() * 0.5;   // pools per row (on average)
    for (let k = 0; k < Math.floor(n + mineRand()); k++) {
      const x0 = Math.floor(mineRand() * MINE_W), len = 1 + Math.floor(mineRand() * 3);
      for (let x = x0; x < Math.min(MINE_W, x0 + len); x++) { const i = mIdx(x, y); tile[i] = 5; ore[i] = null; }
    }
  }
  // 📦 1–2 treasure chests below 130 m, sealed in granite
  const chests = 1 + (mineRand() < 0.5 ? 1 : 0);
  for (let c = 0, tries = 0; c < chests && tries < 500; tries++) {
    const x = Math.floor(mineRand() * MINE_W), y = ROW_CHEST + Math.floor(mineRand() * (MINE_H - 1 - ROW_CHEST)), i = mIdx(x, y);
    if (tile[i] === 4 || tile[i] === 5 || ore[i] === "chest") continue;
    const open = [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => { const nx = x + dx, ny = y + dy;
      return nx >= 0 && nx < MINE_W && ny > 0 && ny < MINE_H - 1 && tile[mIdx(nx, ny)] !== 4 && tile[mIdx(nx, ny)] !== 5; });
    if (!open) continue;
    tile[i] = 3; ore[i] = "chest"; c++;
  }
  return { w: MINE_W, tile, ore, hits, x: MINE_START_X, y: 0, face: 1, lamp: mineLampMax(), lampMax: mineLampMax(), bag: [], chests: 0,
           flows: [], suitUsed: false, deepest: 0, msg: "", seen: [] };
}
const mIdx = (x, y) => y * MINE_W + x;
// a run started on the old, smaller map: finish it safely (you keep all the ore you had)
if (M.run && M.run.w !== MINE_W) {
  const old = M.run; M.run = null; M.runs++; M.best = Math.max(M.best, old.deepest || 0);
  (old.bag || []).forEach(k => M.ores[k] = (M.ores[k] || 0) + 1);
  if ((old.bag || []).length && !M.pending) M.pending = { bag: old.bag.slice(), rescued: false, deepest: old.deepest || 0, record: false, lost: 0 };
}

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
const oreList = (bag) => { const c = oreCounts(bag); return ORE_KEYS.filter(k => c[k]).map(k => `${oreIcon(k)} ${ORES[k].name} ×${c[k]}`).join(" · "); };
// End of a run: the ore waits in M.pending until you choose 💰 Sell or 🏦 Keep in the vault
function mineFinish(rescued, lava = false) {
  const R = M.run; if (!R) return;
  let bag = R.bag.slice();
  if (rescued) {   // 🆘 the rescue team saves 50% (65% / 80% with insurance), spread evenly, starting with the most valuable piece
    const f = lava ? lavaKeep() : rescueKeep();   // 🌋 burned by lava: less
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
  // 📦 chests come up only if you made it out yourself (the rescue team leaves them behind); prizes are rolled now
  const chests = rescued ? [] : Array.from({ length: R.chests || 0 }, rollChest);
  const lostChests = rescued ? (R.chests || 0) : 0;
  if (bag.length || chests.length || lostChests) M.pending = { bag, rescued, lava, deepest: R.deepest, record, lost: R.bag.length - bag.length, chests, lostChests, opened: 0 };
  else showNotice(rescued ? (lava ? "🌋 Burned by lava! The rescue team brought you up. You had no ore with you." : "🆘 Rescued! You had no ore with you.")
    : `⛏️ Run over: no ore this time. Deepest point ${R.deepest * 2} m.`);
  save(); renderMine();
  if (M.pending) showMinePending();
}
/* ----- 📦 TREASURE CHESTS -----
   Prizes are seconds of your income (same base as ore), rolled in 10-second steps:
     Small ~80%  2–5 min · Good 15.5%  5–15 min · Big 4.5%  50–60 min
     💎 Jackpot 1 in 5,000: 50,000 scoin, or 8 hours of income if that is more */
const CHEST_TIERS = [
  { id: "big",   name: "Big prize",   icon: "💰", p: 0.045, min: 3000, max: 3600 },
  { id: "good",  name: "Good prize",  icon: "💵", p: 0.155, min: 300,  max: 900 },
  { id: "small", name: "Small prize", icon: "🪙", p: 1,     min: 120,  max: 300 },
];
const CHEST_JACKPOT_ODDS = 5000, CHEST_JACKPOT_MIN = 50000 * 1e6, CHEST_JACKPOT_SEC = 8 * 3600;
function rollChest() {
  const base = mineBase();
  if (secureRandomInt(CHEST_JACKPOT_ODDS) === 0)
    return { tier: "jackpot", name: "JACKPOT", icon: "💎", amount: Math.max(CHEST_JACKPOT_MIN, CHEST_JACKPOT_SEC * base) };
  let r = secureRandomInt(1e6) / 1e6, T = CHEST_TIERS[CHEST_TIERS.length - 1];
  for (const t of CHEST_TIERS) { if (r < t.p) { T = t; break; } r -= t.p; }
  const sec = T.min + 10 * secureRandomInt((T.max - T.min) / 10 + 1);
  return { tier: T.id, name: T.name, icon: T.icon, sec, amount: Math.round(sec * base) };
}
// 📦 chest art: closed (ornate) in the pop-up, open with coins and gems, or the 💎 jackpot chest; preloaded so the swap is instant
const CHEST_ART = { closed: "assets/mine/chest-closed.webp", open: "assets/mine/chest-open.webp", jackpot: "assets/mine/chest-jackpot.webp" };
Object.values(CHEST_ART).forEach(src => { const im = new Image(); im.src = src; });
const chestArt = (kind = "closed") => `<img class="chestArt ${kind}" src="${CHEST_ART[kind]}" alt="${kind === "closed" ? "Treasure chest" : "Open treasure chest"}">`;
const CHEST_MINE_IMG = new Image(); CHEST_MINE_IMG.onload = () => { if (M.run) mineDraw(); }; CHEST_MINE_IMG.src = "assets/mine/chest-mine.webp";
function showMinePending() {
  const P = M.pending; if (!P) return;
  const chests = P.chests || [];
  if ((P.opened || 0) < chests.length) {   // open the chests one by one before the ore
    const n = P.opened || 0;
    showModal(`<h2>📦 Treasure chest${chests.length > 1 ? ` ${n + 1} of ${chests.length}` : ""}!</h2>
      <p>You carried it all the way up. What's inside?</p>
      <div class="chestStage" id="chestStage">${chestArt("closed")}</div>
      <div class="moneyRow" style="justify-content:center"><button class="btn big" data-minep="chest">🗝️ Open the chest</button></div>`);
    $("modalBox").classList.add("gold");
    return;
  }
  if (!P.bag.length) { M.pending = null; save(); hideModal(); renderMine(); return; }
  const value = bagValue(P.bag);
  showModal(`<h2>${P.lava ? "🌋 Burned by lava!" : P.rescued ? "🆘 Rescued!" : "⛏️ Run complete!"}</h2>
    ${P.rescued ? `<p>${P.lava ? "The lava caught you. The emergency rescue" : "Your lamp ran out underground. The rescue team"} brought you up with <b>${Math.round((P.lava ? lavaKeep() : rescueKeep()) * 100)}%</b> of your ore (${P.lost} lost).</p>` : ""}
    ${P.lostChests ? `<p>📦 ${P.lostChests} treasure chest${P.lostChests > 1 ? "s were" : " was"} left behind underground.</p>` : ""}
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
  if (b.dataset.minep === "chest") return openChest(b);
  if (b.dataset.minep === "chestNext") return showMinePending();
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
function openChest(btn) {
  const P = M.pending, n = P.opened || 0, C = P.chests[n]; if (!C || btn.disabled) return;
  btn.disabled = true;
  // the money is paid right away (counts as income for taxes), then the lid shakes and opens
  P.opened = n + 1; M.chests++; if (C.tier === "jackpot") M.jackpots++;
  state.money += C.amount; M.earned += C.amount; clickedThisSecond += C.amount;
  save(); updateCounter();
  const st = $("chestStage"); if (st) st.classList.add("shake");
  setTimeout(() => {
    if (!M.pending || $("modal").hidden) return;
    const more = P.opened < P.chests.length;
    $("modalBox").innerHTML = `<h2>${C.tier === "jackpot" ? "💎💎💎 JACKPOT! 💎💎💎" : `${C.icon} ${C.name}!`}</h2>
      <div class="chestStage ${C.tier}">${chestArt(C.tier === "jackpot" ? "jackpot" : "open")}<div class="chestPrize">+${fmt(C.amount)}</div></div>
      <p class="muted">${C.tier === "jackpot" ? "1 in 5,000! Your miners will talk about this for years." : `${Math.floor(C.sec / 60)} min ${C.sec % 60 ? `${C.sec % 60} sec ` : ""}of your income.`}</p>
      <div class="moneyRow" style="justify-content:center"><button class="btn big" data-minep="chestNext">${more ? "📦 Next chest" : P.bag.length ? "⛏️ Continue to your ore" : "✅ Collect"}</button></div>`;
  }, 1100);
}
// 🛗 buy a single-use lift before a run (it takes you straight back to the surface)
function buyLift() {
  if (M.run || M.lifts >= MINE_LIFT_MAX || state.money < liftPrice()) return;
  state.money -= liftPrice(); M.lifts++;
  showNotice(`🛗 Mine lift bought! You have ${M.lifts}.`);
  save(); updateCounter(); renderMine();
}
function useLift() {
  const R = M.run; if (!R || R.y === 0 || M.lifts < 1) return;
  M.lifts--; M.liftsUsed = (M.liftsUsed || 0) + 1; R.x = LIFT_X; R.y = 0; R.flows = []; minerPose = "stand";
  R.msg = "🛗 The lift brought you back to the surface!";
  save(); mineDraw(); mineHud();
}

// 💰 sell ore from the vault (normal value, no gold rush bonus)
// 💰 sell ore from the vault: pick how many of each ore (slider, − / +, Max), see the total, then sell
const upgradeNeed = (k) => Object.keys(MINE_UPS).reduce((a, u) => { const c = upCost(u); return a + (c && c[1][k] ? c[1][k] : 0); }, 0);
function showVaultSell() {
  const have = ORE_KEYS.filter(k => (M.vault[k] || 0) > 0);
  if (!have.length) { showModal(`<h2>🏦 Sell ore from your vault</h2><p>Your vault is empty.</p><button class="btn ghost" data-modal="close">Close</button>`); return; }
  showModal(`<h2>🏦 Sell ore from your vault</h2>
    <p class="muted">Choose how much of each ore to sell. Ore you keep pays for ⬆️ upgrades.</p>
    <div class="vaultSell">${have.map(k => { const need = upgradeNeed(k);
      return `<div class="vsRow" data-ore="${k}">
        <div class="vsHead">${oreIcon(k)} <b>${ORES[k].name}</b> <span class="muted">${M.vault[k]} in vault · ${fmt(oreValue(k))} each</span>
          ${need ? `<span class="vsNeed" title="Your next upgrade levels need this much ${ORES[k].name}">⬆️ next upgrades need ${need}</span>` : ""}</div>
        <div class="vsCtrl">
          <button class="btn small ghost" data-vs="minus" aria-label="Less">−</button>
          <input type="range" min="0" max="${M.vault[k]}" value="0" step="1" data-vsrange="${k}">
          <button class="btn small ghost" data-vs="plus" aria-label="More">+</button>
          <button class="btn small ghost" data-vs="max">Max</button>
          <span class="vsCount"><b data-vscount="${k}">0</b> = <span data-vsval="${k}">0</span></span>
        </div></div>`; }).join("")}</div>
    <div class="moneyRow" style="justify-content:center">
      <button class="btn ghost small" data-vs="allmax">Select everything</button>
      <button class="btn ghost small" data-vs="clear">Clear</button></div>
    <button class="btn big" data-vsell="go" disabled>💰 Sell for 0</button>
    <button class="btn ghost" data-modal="close">Close</button>`);
}
function vaultSellUpdate() {
  let total = 0, n = 0;
  document.querySelectorAll("#modalBox [data-vsrange]").forEach(r => {
    const k = r.dataset.vsrange, q = +r.value, v = q * oreValue(k); total += v; n += q;
    const c = document.querySelector(`#modalBox [data-vscount="${k}"]`), vv = document.querySelector(`#modalBox [data-vsval="${k}"]`);
    if (c) c.textContent = q; if (vv) vv.textContent = fmt(v);
  });
  const go = document.querySelector("#modalBox [data-vsell=go]");
  if (go) { go.disabled = !n; go.textContent = n ? `💰 Sell ${n} ore for ${fmt(total)}` : "💰 Sell for 0"; }
}
$("modalBox").addEventListener("input", (e) => { if (e.target.closest("[data-vsrange]")) vaultSellUpdate(); });
$("modalBox").addEventListener("click", (e) => {
  const c = e.target.closest("[data-vs]");
  if (c) {
    const all = [...document.querySelectorAll("#modalBox [data-vsrange]")];
    if (c.dataset.vs === "allmax") all.forEach(r => r.value = r.max);
    else if (c.dataset.vs === "clear") all.forEach(r => r.value = 0);
    else {
      const r = c.closest(".vsRow").querySelector("[data-vsrange]");
      if (c.dataset.vs === "minus") r.value = Math.max(0, +r.value - 1);
      if (c.dataset.vs === "plus") r.value = Math.min(+r.max, +r.value + 1);
      if (c.dataset.vs === "max") r.value = r.max;
    }
    return vaultSellUpdate();
  }
  const b = e.target.closest("[data-vsell]"); if (!b || b.disabled) return;
  let value = 0, n = 0;
  document.querySelectorAll("#modalBox [data-vsrange]").forEach(r => {
    const k = r.dataset.vsrange, q = Math.min(+r.value, M.vault[k] || 0);   // never more than you have
    if (q > 0) { value += q * oreValue(k); n += q; M.vault[k] -= q; }
  });
  if (!value) return;
  state.money += value; M.earned += value; clickedThisSecond += value;   // counts as income (taxes)
  showNotice(`💰 Sold ${n} vault ore for ${fmt(value)}!`);
  save(); updateCounter(); renderMine();
  if (ORE_KEYS.some(k => M.vault[k] > 0)) showVaultSell(); else hideModal();
});

// bag slots used: 1 per ore, 5 per chest
const bagUsed = (R) => R.bag.length + CHEST_SLOTS * (R.chests || 0);
// one step in direction (dx, dy): walk into an empty tile, or hit a solid one
function mineStep(dx, dy) {
  const R = M.run; if (!R || isPaused()) return;
  if (dx) R.face = dx;
  const nx = R.x + dx, ny = R.y + dy;
  if (nx < 0 || nx >= MINE_W || ny < 0 || ny >= MINE_H) return;
  if (ny === 0 && dy === 0 && R.y === 0) { R.x = nx; R.msg = ""; minerPose = "stand"; return mineDraw(); }   // walking on the surface is free
  const i = mIdx(nx, ny), t = R.tile[i];
  if (t === 4) { R.msg = "🪨 Bedrock: too hard to dig. Find another way."; return mineDraw(); }
  if (t === 5) { R.msg = "🌋 Lava! Far too hot to cross. Find another way."; return mineDraw(); }
  if (t === 0) {
    R.x = nx; R.y = ny; R.lamp -= ny === 0 ? 0 : walkCost(ny);
    if (dy < 0 && ny > 0) setMinerPose("climb", 400); else minerPose = "stand";
  } else {
    setMinerPose(dy > 0 ? "dig-down" : "dig-side");
    const o = R.ore[i];
    if (o === "chest" && bagUsed(R) + CHEST_SLOTS > mineBagMax()) { R.msg = `🎒 No room for the chest: it needs ${CHEST_SLOTS} free bag slots.`; return mineDraw(); }
    if (o && o !== "chest" && bagUsed(R) >= mineBagMax()) { R.msg = "🎒 Your bag is full! Head back up."; return mineDraw(); }
    R.lamp -= digCost(t, ny);
    R.hits[i]++;
    if (R.hits[i] >= tileHits(t)) {
      if (t === 6) {   // 🌋 a hidden lava pocket bursts: the lava starts flowing from that tile
        R.tile[i] = 5; R.flows.push({ cells: [i], left: LAVA_FLOW, wait: 1 });   // you get one free move before it flows
        R.msg = "🌋 A lava pocket burst open! The lava flows down and sideways: get away, go UP!";
      } else {
        R.tile[i] = 0;
        if (o === "chest") { R.chests = (R.chests || 0) + 1; R.msg = `📦 A treasure chest! Carry it to the surface to open it.`; }
        else if (o) R.msg = `${oreIcon(o)} +1 ${ORES[o].name}!`;
        else R.msg = "";
        if (o && o !== "chest") R.bag.push(o);
        R.ore[i] = null;
        R.x = nx; R.y = ny;
      }
    } else R.msg = "";
  }
  R.deepest = Math.max(R.deepest, R.y);
  if (lavaFlow()) return;   // burned
  if (R.lamp <= 0) { R.lamp = 0; mineDraw(); return mineFinish(R.y > 0); }
  mineDraw(); mineHud();
}
// 🌋 flowing lava: every step, each lava flow grows by one tile into an open space (down first, then sideways, never up)
function lavaFlow() {
  const R = M.run;
  for (const F of R.flows || []) {
    if (F.left <= 0) continue;
    if (F.wait > 0) { F.wait--; continue; }
    let spot = null;
    for (const c of F.cells.slice().reverse()) {   // the newest edge first
      const x = c % MINE_W, y = Math.floor(c / MINE_W);
      const opts = [[0, 1], ...(mineRand() < 0.5 ? [[-1, 0], [1, 0]] : [[1, 0], [-1, 0]])];
      for (const [dx, dy] of opts) {
        const nx = x + dx, ny = y + dy;
        if (nx < 0 || nx >= MINE_W || ny < 1 || ny >= MINE_H - 1) continue;
        if (R.tile[mIdx(nx, ny)] === 0) { spot = mIdx(nx, ny); break; }
      }
      if (spot !== null) break;
    }
    if (spot === null) { F.left = 0; continue; }   // nowhere to go: it cools down
    R.tile[spot] = 5; F.cells.push(spot); F.left--;
    if (spot === mIdx(R.x, R.y)) {   // 🔥 the lava reached the miner
      if (upLv("heat") >= 1 && !R.suitUsed) {
        R.suitUsed = true; R.tile[spot] = 0; F.cells.pop(); F.left = 0;
        R.msg = "🧯 Your heat suit saved you! The lava cooled down (once per run).";
      } else {
        R.msg = "🌋 The lava got you!"; mineDraw();
        mineFinish(true, true); return true;
      }
    }
  }
  return false;
}

// ----- drawing -----
/* 🦫 miner art (assets/mine/*.webp, 256×256, all facing right, same scale): the pose follows what you just did.
   Digging poses show for a moment after a hit, climbing while you move up, standing otherwise. */
const MINER_IMG = {};
["stand", "dig-down", "dig-side", "climb"].forEach(k => {
  const im = new Image(); im.onload = () => { if (M.run) mineDraw(); }; im.src = `assets/mine/miner-${k}.webp`; MINER_IMG[k] = im;
});
/* 🪨 rock textures (assets/mine/tile-*.webp, 128×128, seamless): one texture spans 4×4 tiles and is anchored to the
   mine itself (not the screen), so neighbouring tiles join into one continuous rock face as the camera moves. */
const ROCK_IMG = {}, ROCK_PAT = {};
["dirt", "stone", "granite", "basalt", "hardbasalt", "bedrock", "crystal", "hardcrystal", "hotrock", "lava", "tunnel"].forEach(k => {
  const im = new Image(); im.onload = () => { if (M.run) mineDraw(); }; im.src = `assets/mine/tile-${k}.webp`; ROCK_IMG[k] = im;
});
function rockPattern(ctx, k) {
  const im = ROCK_IMG[k]; if (!im || !im.complete || !im.naturalWidth) return null;
  if (!ROCK_PAT[k] || ROCK_PAT[k].ctx !== ctx) ROCK_PAT[k] = { ctx, pat: ctx.createPattern(im, "repeat") };
  return ROCK_PAT[k].pat;
}
const ROCK_TINT = [null, "rgba(38,12,10,0.55)", "rgba(60,40,140,0.45)"];   // 🌋 lava zone: dark volcanic soil · 💠 crystal caves: violet
// which texture a tile uses: bedrock everywhere; in the 🌋 lava zone stone → basalt and granite → hard basalt (no tint)
function rockTex(t, zone) {
  if (t === 4) return ["bedrock", false];
  if (t === 6) return ["hotrock", false];                                   // 🌋 hidden lava pocket (any depth)
  if (zone === 2 && t === 2) return ["crystal", false];                     // 💠 crystal caves
  if (zone === 2 && t === 3) return ["hardcrystal", false];
  if (zone === 1 && (t === 2 || t === 6)) return ["basalt", false];
  if (zone === 1 && t === 3) return ["hardbasalt", false];
  return [t === 1 ? "dirt" : t === 3 ? "granite" : "stone", true];
}
// 💎 ore art (assets/mine/ore-*.webp, 96×96): a cluster in rock, drawn on top of the tile
const ORE_IMG = {};
ORE_KEYS.forEach(k => { const im = new Image(); im.onload = () => { if (M.run) mineDraw(); }; im.src = `assets/mine/ore-${k}.webp`; ORE_IMG[k] = im; });
// 🌄 surface art: sunset background (its grass top sits at 300 px of 362), the mine entrance and the lift headframe
const SURF_IMG = {};
["surface-bg", "entrance", "lift"].forEach(k => { const im = new Image(); im.onload = () => { if (M.run) mineDraw(); }; im.src = `assets/mine/${k}.webp`; SURF_IMG[k] = im; });
const imgOk = (im) => im && im.complete && im.naturalWidth;
const SURF_SCALE = 0.8, SURF_GRASS = 300;            // background drawn at 80%; y of its grass top
const LIFT_X = MINE_START_X + 4;                      // 🛗 the lift shaft, 4 tiles right of the entrance
let minerPose = "stand", minerPoseTimer = null;
function setMinerPose(pose, ms = 260) {
  minerPose = pose; clearTimeout(minerPoseTimer);
  minerPoseTimer = setTimeout(() => { minerPose = "stand"; if (M.run) mineDraw(); }, ms);
}
const TS = 32, VIEW_ROWS = 14;
const tileRand = (i, k) => { let h = (i * 374761393 + k * 668265263) | 0; h = (h ^ (h >>> 13)) * 1274126177; return ((h ^ (h >>> 16)) >>> 0) / 4294967295; };
function mineDraw() {
  const cv = $("mineCanvas"), R = M.run; if (!cv) return;
  const ctx = cv.getContext("2d"), W = VIEW_COLS * TS, H = VIEW_ROWS * TS;
  if (!R) { ctx.clearRect(0, 0, W, H); return; }
  // camera: keep the miner in the upper middle (surface visible near the top) and centred sideways
  const camY = Math.max(-2 * TS, Math.min((MINE_H - VIEW_ROWS) * TS, R.y * TS - 5 * TS));
  const camX = Math.max(0, Math.min((MINE_W - VIEW_COLS) * TS, R.x * TS - Math.floor(VIEW_COLS / 2) * TS));
  // sky
  const sky = ctx.createLinearGradient(0, -camY - 3 * TS, 0, -camY + TS);
  sky.addColorStop(0, "#3a2c78"); sky.addColorStop(1, "#f09a5a");
  ctx.fillStyle = sky; ctx.fillRect(0, 0, W, H);
  const gy = TS - camY;   // the ground line (top of row 1)
  if (imgOk(SURF_IMG["surface-bg"]) && gy > 0) {   // 🌄 sunset hills, moving a bit slower than the mine (parallax)
    const bw = 1086 * SURF_SCALE, bh = 362 * SURF_SCALE;
    ctx.drawImage(SURF_IMG["surface-bg"], -camX * 0.6, gy - SURF_GRASS * SURF_SCALE - 4, bw, bh);
  }
  const y0 = Math.max(0, Math.floor(camY / TS)), y1 = Math.min(MINE_H, Math.ceil((camY + H) / TS) + 1);
  const x0 = Math.floor(camX / TS), x1 = Math.min(MINE_W, x0 + VIEW_COLS + 1);
  const glow = [];   // things that shine through the dark: lava, hot rock cracks, chests
  for (let ty = y0; ty < y1; ty++) {
    for (let tx = x0; tx < x1; tx++) {
      const i = mIdx(tx, ty), t = R.tile[i], px = tx * TS - camX, py = ty * TS - camY;
      if (ty === 0) continue;
      const depth = Math.min(1, ty / 64), zone = ty >= ROW_CRYSTAL ? 2 : ty >= ROW_LAVA ? 1 : 0;
      if (t === 0) {   // dug tunnel / cave: dark earth, shaded per layer so it reads as the back wall
        const tp = rockPattern(ctx, "tunnel");
        if (tp) {
          tp.setTransform(new DOMMatrix([1, 0, 0, 1, -camX, -camY]));
          ctx.fillStyle = tp; ctx.fillRect(px, py, TS, TS);
          ctx.fillStyle = zone === 2 ? "rgba(28,14,60,0.5)" : zone === 1 ? "rgba(36,6,4,0.45)" : `rgba(0,0,0,${(0.15 + depth * 0.25).toFixed(3)})`;
          ctx.fillRect(px, py, TS, TS);
        } else {
          ctx.fillStyle = zone === 2 ? "rgb(20,16,34)" : zone === 1 ? "rgb(30,14,12)" : `rgb(${46 - depth * 20},${30 - depth * 12},${22 - depth * 8})`;
          ctx.fillRect(px, py, TS, TS);
        }
        continue;
      }
      if (t === 5) { glow.push([px, py, "lava", i]); continue; }
      const [texKey, tinted] = rockTex(t, zone), pat = rockPattern(ctx, texKey);
      if (pat) {   // textured rock, darker the deeper you go, tinted in the deep layers
        pat.setTransform(new DOMMatrix([1, 0, 0, 1, -camX, -camY]));
        ctx.fillStyle = pat; ctx.fillRect(px, py, TS, TS);
        if (zone === 0 && depth > 0 && t !== 4) { ctx.fillStyle = `rgba(10,6,4,${(depth * 0.35).toFixed(3)})`; ctx.fillRect(px, py, TS, TS); }
        if (tinted && ROCK_TINT[zone]) { ctx.fillStyle = ROCK_TINT[zone]; ctx.fillRect(px, py, TS, TS); }
        if (zone === 2 && tinted) for (let k = 0; k < 2; k++) {   // crystal sparkles on the plain rock
          ctx.fillStyle = "rgba(170,220,255,0.6)"; ctx.fillRect(px + 3 + tileRand(i, k) * (TS - 7), py + 3 + tileRand(i, k + 9) * (TS - 7), 2, 2); }
      } else {
      let base = t === 1 ? [139 - depth * 50, 94 - depth * 40, 56 - depth * 25] : t === 2 || t === 6 ? [118, 112, 108] : t === 3 ? [88, 84, 96] : [40, 38, 46];
      if (zone === 1 && t !== 4) base = t === 1 ? [86, 52, 40] : t === 3 ? [58, 46, 50] : [78, 64, 62];       // 🌋 basalt, reddish
      if (zone === 2 && t !== 4) base = t === 1 ? [62, 54, 92] : t === 3 ? [52, 50, 86] : [76, 72, 110];      // 💠 crystal caves, violet
      ctx.fillStyle = `rgb(${base.map(Math.round).join(",")})`; ctx.fillRect(px, py, TS, TS);
      // texture specks
      for (let k = 0; k < 5; k++) {
        const sx = tileRand(i, k) * (TS - 4), sy = tileRand(i, k + 9) * (TS - 4);
        ctx.fillStyle = k % 2 ? "rgba(0,0,0,0.18)" : zone === 2 && k === 0 ? "rgba(170,220,255,0.45)" : "rgba(255,255,255,0.10)";
        ctx.fillRect(px + sx, py + sy, 3, 3);
      }
      }
      if (t === 4) {   // 🪨 bedrock: much darker, with a thick black frame, so it clearly reads as "can't dig"
        ctx.fillStyle = "rgba(0,0,0,0.5)"; ctx.fillRect(px, py, TS, TS);
        ctx.strokeStyle = "#000"; ctx.lineWidth = 4; ctx.strokeRect(px + 2, py + 2, TS - 4, TS - 4);
        ctx.strokeStyle = "rgba(150,150,170,0.22)"; ctx.lineWidth = 1; ctx.strokeRect(px + 4.5, py + 4.5, TS - 9, TS - 9);
      }
      ctx.strokeStyle = pat ? "rgba(0,0,0,0.16)" : "rgba(0,0,0,0.25)"; ctx.lineWidth = 1; ctx.strokeRect(px + 0.5, py + 0.5, TS - 1, TS - 1);
      if (t === 6) glow.push([px, py, "hot", i]);
      if (R.ore[i] === "chest") glow.push([px, py, "chest", i]);
      else if (R.ore[i] && ORE_IMG[R.ore[i]] && ORE_IMG[R.ore[i]].complete && ORE_IMG[R.ore[i]].naturalWidth) {   // ore art
        const im = ORE_IMG[R.ore[i]], D = TS - 2;
        ctx.imageSmoothingQuality = "high"; ctx.drawImage(im, px + (TS - D) / 2, py + (TS - D) / 2, D, D);
      }
      else if (R.ore[i]) {   // ore nuggets (until the art loads)
        const o = ORES[R.ore[i]];
        for (let k = 0; k < 3; k++) {
          const cx = px + 8 + tileRand(i, k + 20) * (TS - 16), cy = py + 8 + tileRand(i, k + 30) * (TS - 16), r = 4 + tileRand(i, k + 40) * 3;
          ctx.fillStyle = o.color; ctx.beginPath();
          if (R.ore[i] === "diamond" || R.ore[i] === "ruby") { ctx.moveTo(cx, cy - r - 1); ctx.lineTo(cx + r, cy); ctx.lineTo(cx, cy + r + 1); ctx.lineTo(cx - r, cy); }
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
  // grass + entrance + lift
  if (gy > -8 && gy < H && imgOk(SURF_IMG["surface-bg"])) {
    // the grass strip from the background, fixed to the mine, over the top of the first row
    const bg = SURF_IMG["surface-bg"], sy = 292, sh = 38, dh = sh * SURF_SCALE;
    const sg = ctx.createLinearGradient(0, gy, 0, gy + 12);   // soft shadow where the grass meets the soil
    sg.addColorStop(0, "rgba(20,10,4,0.55)"); sg.addColorStop(1, "rgba(20,10,4,0)");
    ctx.fillStyle = sg; ctx.fillRect(0, gy, W, 12);
    ctx.drawImage(bg, 0, sy, 1086, sh, -camX, gy + 3 - dh, 1086 * SURF_SCALE, dh);   // grass sits ON the ground, ending at the ground line
    if (imgOk(SURF_IMG.entrance)) {   // ⛏️ mine entrance, with a dark tunnel inside the arch
      const D = 96, ex = MINE_START_X * TS - camX + TS / 2 - D / 2, ey = gy + 6 - D;
      ctx.fillStyle = "#120c08"; ctx.beginPath();
      ctx.moveTo(ex + D * 0.35, ey + D); ctx.lineTo(ex + D * 0.35, ey + D * 0.58);
      ctx.quadraticCurveTo(ex + D * 0.5, ey + D * 0.44, ex + D * 0.65, ey + D * 0.58); ctx.lineTo(ex + D * 0.65, ey + D); ctx.fill();
      ctx.drawImage(SURF_IMG.entrance, ex, ey, D, D);
    }
    if (imgOk(SURF_IMG.lift)) {   // 🛗 lift headframe
      const D = 84, lx = LIFT_X * TS - camX + TS / 2 - D / 2;
      ctx.drawImage(SURF_IMG.lift, lx, gy + 4 - D, D, D);
    }
  } else if (gy > -8 && gy < H) {
    const ex = MINE_START_X * TS - camX;
    ctx.fillStyle = "#4caf50"; ctx.fillRect(0, gy - 4, W, 6);
    ctx.fillStyle = "#7b4a1e"; ctx.fillRect(ex - 6, gy - 30, 6, 26); ctx.fillRect(ex + TS, gy - 30, 6, 26);
    ctx.fillRect(ex - 8, gy - 34, TS + 16, 6);
    ctx.font = "16px system-ui"; ctx.fillText("⛏️", ex + 8, gy - 38);
  }
  // darkness: the lamp lights a circle around the miner (smaller as the oil runs out)
  const mx = R.x * TS - camX + TS / 2, my = R.y * TS - camY + TS / 2;
  if (R.y > 0 || camY > 0) {
    const rad = TS * (2.3 + 2.2 * Math.min(1, R.lamp / MINE_LAMP));
    const g = ctx.createRadialGradient(mx, my, rad * 0.35, mx, my, rad);
    g.addColorStop(0, "rgba(5,4,10,0)"); g.addColorStop(1, "rgba(5,4,10,0.94)");
    ctx.save(); ctx.beginPath(); ctx.rect(0, Math.max(0, gy + 3), W, H); ctx.clip();
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); ctx.restore();
  }
  // 🌋 lava, hot rock and chests glow through the dark, so you always see the danger (and the treasure) coming
  const pulse = 0.5 + 0.5 * Math.sin(performance.now() / 300);
  for (const [px, py, kind, i] of glow) {
    const dist = Math.hypot(px + TS / 2 - mx, py + TS / 2 - my) / TS;
    const glowPat = kind === "lava" ? rockPattern(ctx, "lava") : kind === "hot" ? rockPattern(ctx, "hotrock") : null;
    if (glowPat) glowPat.setTransform(new DOMMatrix([1, 0, 0, 1, -camX, -camY]));
    if (kind === "lava" && glowPat) {   // painted lava, always bright
      ctx.fillStyle = glowPat; ctx.fillRect(px, py, TS, TS);
    } else if (kind === "hot" && glowPat && dist < 6) {   // the hot rock shows through the dark, fading with distance
      ctx.save(); ctx.globalAlpha = Math.max(0.3, 1 - dist / 6);
      ctx.fillStyle = glowPat; ctx.fillRect(px, py, TS, TS);
      const hg = ctx.createRadialGradient(px + TS / 2, py + TS / 2, 2, px + TS / 2, py + TS / 2, TS * 0.62);
      hg.addColorStop(0, "rgba(255,120,40,0.35)"); hg.addColorStop(1, "rgba(255,60,10,0)");
      ctx.fillStyle = hg; ctx.fillRect(px, py, TS, TS);
      ctx.restore();
    } else if (kind === "lava") {
      const lg = ctx.createLinearGradient(px, py, px, py + TS);
      lg.addColorStop(0, "#ffb02e"); lg.addColorStop(1, "#d6300f");
      ctx.fillStyle = lg; ctx.fillRect(px, py, TS, TS);
      ctx.fillStyle = "rgba(255,240,150,0.55)";
      for (let k = 0; k < 3; k++) ctx.fillRect(px + 3 + tileRand(i, k + 60) * (TS - 9), py + 3 + tileRand(i, k + 70) * (TS - 9), 4, 3);
    } else if (kind === "hot" && dist < 6) {   // red glowing cracks: a lava pocket hides behind
      ctx.save(); ctx.globalAlpha = Math.max(0.25, 1 - dist / 6);
      const hg = ctx.createRadialGradient(px + TS / 2, py + TS / 2, 2, px + TS / 2, py + TS / 2, TS * 0.62);   // inner heat glow
      hg.addColorStop(0, "rgba(255,120,40,0.75)"); hg.addColorStop(1, "rgba(255,60,10,0)");
      ctx.fillStyle = hg; ctx.fillRect(px, py, TS, TS);
      ctx.strokeStyle = "#ffb13a"; ctx.lineWidth = 2.5; ctx.beginPath();
      for (let k = 0; k < 4; k++) { const a = tileRand(i, k + 80) * Math.PI * 2, cx = px + TS / 2, cy = py + TS / 2;
        ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(a) * TS * 0.42, cy + Math.sin(a) * TS * 0.42); }
      ctx.stroke(); ctx.restore();
    } else if (kind === "chest") {
      if (dist < 4.5 && CHEST_MINE_IMG.complete && CHEST_MINE_IMG.naturalWidth) {   // in the lamp light: the old chest in the rock
        ctx.imageSmoothingQuality = "high"; ctx.drawImage(CHEST_MINE_IMG, px + 1, py + 1, TS - 2, TS - 2);
      } else if (dist < 4.5) {
        ctx.fillStyle = "#8a4b22"; ctx.fillRect(px + 6, py + 12, TS - 12, TS - 17);
        ctx.fillStyle = "#a85a28"; ctx.fillRect(px + 6, py + 7, TS - 12, 7);
        ctx.fillStyle = "#e3b341"; ctx.fillRect(px + 6, py + 14, TS - 12, 3); ctx.fillRect(px + TS / 2 - 2, py + 7, 4, TS - 12);
      } else if (dist < 9) {   // further away: a faint golden glint
        ctx.save(); ctx.globalAlpha = 0.25 + 0.35 * pulse; ctx.fillStyle = "#ffe27a";
        ctx.beginPath(); ctx.arc(px + TS / 2, py + TS / 2, 3, 0, Math.PI * 2); ctx.fill(); ctx.restore();
      }
    }
  }
  // 🦫 the miner: art if it has loaded (feet on the bottom of the tile, a bit taller than one tile), else the simple drawing
  const img = MINER_IMG[R.y === 0 && minerPose === "climb" ? "stand" : minerPose];
  if (img && img.complete && img.naturalWidth) {
    const D = TS * 1.6;
    ctx.save(); ctx.translate(mx, my + TS / 2 + 1); ctx.scale(R.face, 1);
    ctx.imageSmoothingQuality = "high"; ctx.drawImage(img, -D / 2, -D, D, D);
    ctx.restore();
    return;
  }
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
  const back = climbCost(R.y);   // oil needed to walk back up an open shaft
  const layer = R.y >= ROW_CRYSTAL ? "💠 Crystal caves" : R.y >= ROW_LAVA ? "🌋 Lava zone" : R.y > 0 ? "⛏️ Mine" : "🌄 Surface";
  const counts = {}; R.bag.forEach(k => counts[k] = (counts[k] || 0) + 1);
  hud.innerHTML = `
    <div class="mineStat"><span>🪔 Lamp</span><b>${Math.ceil(R.lamp)} / ${lampMax}</b></div>
    <div class="mineBar"><div style="width:${lampPct}%;background:${lampPct < 25 ? "#ff6b6b" : lampPct < 50 ? "#ffb347" : "#ffd34d"}"></div></div>
    ${R.y > 0 && R.lamp < back + 6 ? `<div class="mineWarn">⚠️ Head back up! About ${Math.ceil(back)} oil to get out.${M.lifts ? " Or take the 🛗 lift." : ""}</div>` : ""}
    <div class="mineStat"><span>📏 Depth</span><b>${R.y * 2} m</b></div>
    <div class="mineStat"><span>🗺️ Layer</span><b>${layer}</b></div>
    ${heatMult(R.y) > 1 ? `<div class="mineHeat">🔥 Heat: the lamp burns 25% faster</div>` : ""}
    ${upLv("heat") >= 1 ? `<div class="mineStat"><span>🧯 Heat suit</span><b>${R.suitUsed ? "used" : "ready"}</b></div>` : ""}
    <div class="mineStat"><span>🏆 Deepest</span><b>${R.deepest * 2} m</b></div>
    <div class="mineStat"><span>🎒 Bag</span><b>${bagUsed(R)} / ${mineBagMax()}</b></div>
    <div class="mineOres">${ORE_KEYS.filter(k => counts[k]).map(k => `<span>${oreIcon(k)} ${counts[k]}</span>`).join("")}${R.chests ? `<span>📦 ${R.chests}</span>` : ""}${!R.bag.length && !R.chests ? `<span class="muted">empty</span>` : ""}</div>
    <div class="mineStat"><span>💰 Worth</span><b>${fmt(bagValue(R.bag))}</b></div>
    ${mineRush() ? `<div class="mineRush">🔥 Gold rush: ore ×2!</div>` : ""}
    <div class="mineMsg">${R.msg || "&nbsp;"}</div>
    ${R.y === 0
      ? `<button class="btn big" data-mine="end">⛏️ End run</button>`
      : `${M.lifts ? `<button class="btn small" data-mine="lift" title="Back to the surface with everything you carry">🛗 Take the lift up (${M.lifts} left)</button>` : ""}
         <button class="btn ghost small" data-mine="quit" title="You keep only part of your ore${R.chests ? " and lose the chests" : ""}">🆘 Call the rescue team (keep ${Math.round(rescueKeep() * 100)}%)</button>`}`;
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
        <p class="muted">🌋 Below <b>100 m</b>: lava pools block the way and rocks with glowing red cracks hide lava pockets that flow when you break them (lava never flows up). Getting caught saves only ${Math.round(lavaKeep() * 100)}% of your ore.
          🔥 Below <b>150 m</b> the heat burns your lamp 25% faster, and 🔴 rubies appear.
          📦 Below <b>130 m</b> are 1–2 treasure chests (${CHEST_SLOTS} bag slots each): bring them up yourself to open them. The rescue team leaves them behind.</p>
        <div class="mineOreRow">${ORE_KEYS.map(k => `<span>${oreIcon(k)} ${ORES[k].name}: <b>${fmt(oreValue(k))}</b></span>`).join("")}</div>
        <p class="muted">Ore is worth seconds of your income (${ORES.coal.sec}–${ORES.ruby.sec} sec each, based on your business income over the last minute). 🔥 A gold rush in your mines doubles it.</p>
        <div class="mineEnergy">${"⚡".repeat(e)}${"<span class='off'>⚡</span>".repeat(Math.max(0, energyMax() - e))}
          <span class="muted">${e < energyMax() && M.regenAt ? `+1 in <b id="mineRegen">${clockMs(M.regenAt - Date.now())}</b>` : "full"}</span></div>
        ${vaultLine()}
        <div class="moneyRow" style="justify-content:center">
          ${M.pending ? `<button class="btn big" data-mine="pending">🎒 Ore from your last run: sell or keep</button>`
            : `<button class="btn big" data-mine="start" ${e >= 1 ? "" : "disabled"}>⛏️ Start a run (⚡ 1)</button>`}
          <button class="btn ghost" data-mine="vault" ${ORE_KEYS.some(k => M.vault[k] > 0) ? "" : "disabled"}>💰 Sell vault ore</button></div>
        <p class="muted">Runs: ${M.runs} · Deepest ever: ${M.best * 2} m · Chests opened: ${M.chests} · Earned: ${fmt(M.earned)}</p>
      </div>
      <div class="card mineUps">
        <h3>⬆️ Upgrades</h3>
        <div class="mineLiftBox">
          <img class="mineLiftIcon" src="assets/mine/lift.webp" alt="Mine lift">
          <div class="mineLiftText"><b>Mine lift</b> <span class="mineLiftHave">${M.lifts} / ${MINE_LIFT_MAX}</span>
            <div class="muted">Single use. Takes you straight back to the surface with everything you carry, chests included.</div></div>
          <button class="btn" data-mine="buylift" ${M.lifts < MINE_LIFT_MAX && state.money >= liftPrice() ? "" : "disabled"}>${M.lifts >= MINE_LIFT_MAX ? "✅ Full" : `🛗 Buy a lift · ${fmt(liftPrice())}`}</button>
        </div>
        <p class="muted">Each level costs money and ore from your 🏦 vault. Keep ore after a run to save up for them.</p>
        <div class="mineUpGrid">${Object.keys(MINE_UPS).map(k => {
          const U = MINE_UPS[k], l = upLv(k), c = upCost(k);
          return `<div class="mineUp ${c ? "" : "maxed"}">
            <div class="mineUpHead"><span class="mineUpIcon">${U.icon}</span><b>${U.name}</b><span class="mineUpLv">Lv ${l}/${U.max}</span></div>
            <div class="mineUpEff">Now: ${U.eff(l)}</div>
            ${c ? `<div class="mineUpEff next">Next: ${U.eff(l + 1)}</div>
              <div class="mineUpCost"><span class="${state.money >= c[0] ? "" : "short"}">${fmt(c[0])}</span>
                ${Object.keys(c[1]).map(o => `<span class="${(M.vault[o] || 0) >= c[1][o] ? "" : "short"}">${oreIcon(o)} ${M.vault[o] || 0}/${c[1][o]}</span>`).join("")}</div>
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
        <canvas id="mineCanvas" width="${VIEW_COLS * TS}" height="${VIEW_ROWS * TS}"></canvas>
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
  if (b.dataset.mine === "buylift") buyLift();
  if (b.dataset.mine === "lift") useLift();
});
$("mineView").addEventListener("click", (e) => { const b = e.target.closest("[data-mup]"); if (b) buyUp(b.dataset.mup); });

/* ---------------------------------------------------------------------
   🎮 HUB
   --------------------------------------------------------------------- */
function renderGames() {
  updateArtTab();
  const page = state.gamePage;
  $("gamesHub").hidden = !!page; $("mineView").hidden = page !== "mine";
  const gv = $("geneView"); if (gv) gv.hidden = page !== "gene";
  if (page === "mine") return renderMine();
  if (page === "gene" && typeof renderGene === "function") return renderGene();
  const art = state.art.unlocked, mine = mineUnlocked(), e = mineEnergy();
  $("gamesHub").innerHTML = `<h2 class="gamesTitle">🎮 Mini-games</h2>
    <p class="muted">Unlock mini-games with your buildings and achievements, then play them to earn extra money.</p>
    <div class="gamesGrid">
      <div class="card gameCard">
        <img class="gameIcon gameIconImg" src="assets/icons/ico-artgallery.webp" alt=""><h3>Art Gallery</h3>
        <p class="muted">Copy paintings as closely as you can. Sell them or keep them in your collection.</p>
        <div class="gameStatus">${art ? `🖼️ ${(state.art.items || []).length} paintings in your collection` : `🔒 ${artGalleryReady() ? `Open it for ${fmt(ART_UNLOCK)}` : "Unlocks with the 💵 Millionaire achievement"}`}</div>
        <button class="btn" data-game="art">${art ? "▶ Play" : "View"}</button>
      </div>
      <div class="card gameCard ${mine ? "" : "locked"}">
        <img class="gameIcon gameIconImg" src="assets/mine/entrance.webp" alt=""><h3>Gold Mine Dig</h3>
        <p class="muted">Dig 250 m deep for coal, copper, silver, gold, diamonds, rubies and treasure chests before your lamp runs out.</p>
        <div class="gameStatus">${mine ? `${"⚡".repeat(e)}${"<span class='off'>⚡</span>".repeat(Math.max(0, energyMax() - e))}${M.run ? " · ⛏️ run in progress" : ""}` : "🔒 Buy your first ⛏️ gold mine (💰 Income → ⭐ Special)"}</div>
        ${mine ? vaultLine("small") : ""}
        <button class="btn" data-game="mine" ${mine ? "" : "disabled"}>${M.run ? "▶ Continue" : "▶ Play"}</button>
      </div>
      ${typeof G !== "undefined" && (G.unlocked || secrets2Open()) ? `<div class="card gameCard secretCard ${G.unlocked ? "" : "locked"}">
        <img class="gameIcon gameIconImg" src="assets/icons/ico-sci-gene.webp" alt=""><h3>Gene Splicer <span class="secretTag">🌌🌌</span></h3>
        <p class="muted">Splice DNA samples into new species: from frogs and dolphins to dinosaurs, dragons and the kraken.</p>
        <div class="gameStatus">${G.unlocked ? `🧬 ${geneFound()} / ${GENE_TOTAL} species` : "🔒 Buy the 🧬 Genetics Laboratory (💰 Income → 🔬 Science)"}</div>
        <button class="btn" data-game="gene" ${G.unlocked ? "" : "disabled"}>▶ Play</button>
      </div>` : ""}
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
