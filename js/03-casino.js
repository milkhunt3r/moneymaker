/* =====================================================================
   CASINO WALLET: move money in and out as chips
   ===================================================================== */
if (typeof state.casinoChips !== "number") state.casinoChips = 0;

/* ----- 🎟️ VIP coins (Legacy bonus): a separate purse for the Super high roller tables.
   With "VIP mode" on at a table, every bet there is paid from VIP coins (and unplayed bets go back to them).
   Whatever a round pays out goes to normal casino chips. ----- */
if (!state.legacy) state.legacy = { count: 0, tycoon: 0, empire: 0, vip: 0, history: [] };
if (!state.vip) state.vip = { coins: 0, timer: 0 };
if (!state.vipMode) state.vipMode = {};
if (typeof state.plinkoVipInPlay !== "number") state.plinkoVipInPlay = 0;
const SUPER_TABLES = ["rouletteSuper", "bjSuper", "bacSuper", "gcSuper", "plinkoSuper", "vpSuper", "uthSuper"];
const vipOn = (id) => false;   // VIP coins are now 500 scoin free bet chips (see FREE BET CHIPS)

/* ----- 🎁 Free bet chips: chips you own, kept apart from casino chips. Placed on a table they are a normal bet;
   what the round pays goes to casino chips. Unplayed ones (cleared bets, reloads) go back to the inventory. ----- */
if (!state.freeChips) state.freeChips = {};      // chip value -> how many you have
if (!state.freeTimers) state.freeTimers = {};    // chip value -> seconds until the next one
if (!state.freeTable) state.freeTable = {};      // table id -> { placed: [values on the table], inPlay: [values in a round] }
const sumOf = (arr) => arr.reduce((a, b) => a + b, 0);
const freeTbl = (id) => state.freeTable[id] || (state.freeTable[id] = { placed: [], inPlay: [] });
const freePlacedSum = (id) => sumOf(freeTbl(id).placed);
function freeTake(id, value, n = 1) {             // take n chips from the inventory onto a table
  if ((state.freeChips[value] || 0) < n) return false;
  state.freeChips[value] -= n;
  for (let i = 0; i < n; i++) freeTbl(id).placed.push(value);
  return true;
}
function freeReturn(id, which = "placed") {       // give chips back to the inventory; returns their total
  const list = freeTbl(id)[which], total = sumOf(list);
  list.forEach(v => state.freeChips[v] = (state.freeChips[v] || 0) + 1);
  freeTbl(id)[which] = [];
  return total;
}
function freeStart(id) { const f = freeTbl(id); f.inPlay = f.placed; f.placed = []; return sumOf(f.inPlay); }
function freeDone(id, which = "inPlay") { freeTbl(id)[which] = []; }   // played: they are used up
const purse = (id) => vipOn(id) ? state.vip.coins : state.casinoChips;
const purseName = (id) => vipOn(id) ? "VIP coins" : "chips";
function payFrom(id, x) { if (vipOn(id)) state.vip.coins -= x; else state.casinoChips -= x; }
function refundTo(id, x) { if (vipOn(id)) state.vip.coins += x; else state.casinoChips += x; }

document.querySelectorAll("[data-pct]").forEach(btn => {
  btn.addEventListener("click", () => {
    $("buyAmount").value = Math.floor(state.money * Number(btn.dataset.pct));
  });
});

$("buyIn").addEventListener("click", () => {
  if (isPaused()) return;
  const amount = Math.floor(Number($("buyAmount").value));
  if (!(amount > 0)) return casinoMessage("Enter how much money to bring in.");
  if (amount > state.money) return casinoMessage("You don't have that much money.");
  state.money -= amount;
  state.casinoChips += amount;
  $("buyAmount").value = "";
  casinoMessage("");
  updateCounter(); save();
});

$("cashOut").addEventListener("click", () => {
  if (isPaused() || anyTableSpinning()) return;
  state.money += state.casinoChips;
  state.casinoChips = 0;
  updateCounter(); save();
});

function casinoMessage(text) {
  const el = $("casinoMsg");
  if (el) el.textContent = text;
}

/* =====================================================================
   CASINO GAMES
   To add a game later: add it to CASINO_GAMES and write its render function.
   ===================================================================== */
const CASINO_GAMES = [
  { id: "rouletteLow",  name: "Roulette: Classic table", emoji: "🎡", desc: "European roulette, bets from 500 to 50,000 per spot." },
  { id: "rouletteHigh", name: "Roulette: High rollers",  emoji: "💎", desc: "European roulette, bets from 50,000 to 5 scoin per spot." },
  { id: "bjLow",  name: "Blackjack: Classic table", emoji: "🃏", desc: "Play 1 to 3 hands against the dealer. Bets from 500 to 50,000 per hand." },
  { id: "bjHigh", name: "Blackjack: High rollers",  emoji: "♠️", desc: "Play 1 to 3 hands against the dealer. Bets from 50,000 to 5 scoin per hand." },
  { id: "rouletteSuper", name: "Roulette: Super high rollers", emoji: "💎💎", desc: "European roulette, bets from 10 to 500 scoin per spot." },
  { id: "bjSuper", name: "Blackjack: Super high rollers", emoji: "💎♠️", desc: "Play 1 to 3 hands against the dealer. Bets from 10 to 500 scoin per hand." },
  { id: "bacLow",   name: "Baccarat: Classic table", emoji: "🎴", desc: "Bet on Player, Banker or a Tie: the hand closest to 9 wins. Bets from 500 to 50,000 per spot." },
  { id: "bacHigh",  name: "Baccarat: High rollers",  emoji: "🎴", desc: "Bet on Player, Banker or a Tie: the hand closest to 9 wins. Bets from 50,000 to 5 scoin per spot." },
  { id: "bacSuper", name: "Baccarat: Super high rollers", emoji: "🎴", desc: "Bet on Player, Banker or a Tie: the hand closest to 9 wins. Bets from 10 to 500 scoin per spot." },
  { id: "vpLow",   name: "Video Poker: Classic table", emoji: "🎴", desc: "Jacks or Better with a joker (53 cards). Bets from 500 to 50,000. Jackpot 2.5 scoin." },
  { id: "vpHigh",  name: "Video Poker: High rollers",  emoji: "🎴💎", desc: "Jacks or Better with a joker (53 cards). Bets from 50,000 to 5 scoin. Jackpot 250 scoin." },
  { id: "vpSuper", name: "Video Poker: Super high rollers", emoji: "🎴💎💎", desc: "Jacks or Better with a joker (53 cards). Bets from 10 to 500 scoin. Jackpot 25 gcoin." },
  { id: "uthLow",   name: "Ultimate Texas Hold'em: Classic table", emoji: "🤠", desc: "Beat the dealer's poker hand. Play 1 or 2 seats. Ante 500 to 50,000 (+ equal Blind, optional Trips)." },
  { id: "uthHigh",  name: "Ultimate Texas Hold'em: High rollers",  emoji: "🤠💎", desc: "Beat the dealer's poker hand. Play 1 or 2 seats. Ante 50,000 to 5 scoin (+ equal Blind, optional Trips)." },
  { id: "uthSuper", name: "Ultimate Texas Hold'em: Super high rollers", emoji: "🤠💎💎", desc: "Beat the dealer's poker hand. Play 1 or 2 seats. Ante 10 to 500 scoin (+ equal Blind, optional Trips)." },
  { id: "plinkoSuper", name: "Plinko: Super high rollers", emoji: "💎🔻", desc: "Same pyramid, 0.3× to 250×, up to 20 balls. Bets from 10 to 500 scoin per ball." },
  { id: "plinko", name: "Plinko", emoji: "🔻", desc: "Drop up to 20 balls down a peg pyramid into multipliers from 0.3× to 250×. Bets 5,000 – 5 scoin per ball." },
  { id: "climb",  name: "Sky Climb", emoji: "🎈", desc: "Draw balls to climb a 20-step ladder up to 50,000×. Cash out before a red ball pops your balloon! Bets 10,000 – 500,000." },
  { id: "gcHigh",  name: "Gene Cascade: High rollers", emoji: "🧬", desc: "A 7×7 slot: clusters of 5+ touching specimens pay, then tumble. Lab spots grow ×2 … ×128. Bets 50,000 – 5 scoin per spin." },
  { id: "gcSuper", name: "Gene Cascade: Super high rollers", emoji: "🧬", desc: "A 7×7 slot: clusters of 5+ touching specimens pay, then tumble. Lab spots grow ×2 … ×128. Bets 10 – 500 scoin per spin." },
  { id: "climbHigh", name: "Sky Climb: High rollers", emoji: "🎈", desc: "Draw balls to climb a 20-step ladder up to 50,000×. Cash out before a red ball pops your balloon! Bets 5 – 500 scoin." },
];
// 🎨 a game's painted picture, with one 💎 high-roller badge for High rollers and two for Super high rollers
function casIco(id, cls = "biz") {
  id = id || "";
  const base = id.startsWith("roulette") ? "roulette" : id.startsWith("bj") ? "blackjack" : id.startsWith("bac") ? "baccarat" : id.startsWith("vp") ? "poker"
    : id.startsWith("uth") ? "holdem" : id.startsWith("plinko") ? "plinko" : id.startsWith("climb") ? "climb" : id.startsWith("gc") ? "slot" : "chips";
  const tier = /Super$/.test(id) ? 2 : /High$/.test(id) ? 1 : 0;
  return `<span class="casIco ${cls}">${ico("cas-" + base, cls)}${tier ? `<span class="casTier">${ico("cas-highroller").repeat(tier)}</span>` : ""}</span>`;
}
// Game groups in the casino lobby (games show in this order inside each group)
const CASINO_GROUPS = [
  { name: "Roulette games", ico: "roulette", games: ["rouletteLow", "rouletteHigh", "rouletteSuper"] },
  { name: "Card games", ico: "blackjack",     games: ["bjLow", "bjHigh", "bjSuper", "bacLow", "bacHigh", "bacSuper", "vpLow", "vpHigh", "vpSuper", "uthLow", "uthHigh", "uthSuper"] },
  { name: "Plinko",     ico: "plinko",     games: ["plinko", "plinkoSuper"] },
  { name: "Sky Climb",  ico: "climb",      games: ["climb", "climbHigh"] },
  { name: "Slot games", ico: "slot",       games: ["gcHigh", "gcSuper"] },
];
let currentGame = null;   // null = game list

/* =====================================================================
   GAMBLER LEVEL: XP = bcoin bet × the game's XP multiplier (longer rounds give more XP per bet).
     Curve: XP = 3.738 * level^6.728  →  level 10 ≈ 20 million, level 50 ≈ 1 trillion, level 99 ≈ 100 trillion
     Multipliers per table: see XP_TABLE_MULT (e.g. Roulette ×1 / ×2.5 / ×4, Blackjack ×2 / ×4 / ×8,
                  Video Poker ×1 / ×1.5 / ×2). 🔥 Hot Tables add +10 (+20 from Gambler level 50, +40 from level 75).
     Each level gives 0.1% cashback on lost bets (level 10 = 1%). Max level 99.
   INVESTOR LEVEL: XP for every minute you have money invested (4 / 8 / 16 XP per minute).
     Curve: XP = 0.147 * level^2.76  →  level 50 = 7,186 (about 13 h), level 99 = 47,345 (about 55 h)
   ===================================================================== */
const MAX_LEVEL = 99;

// LEVEL_XP[L] = total Gambler XP needed to reach level L (each step rounded to 3 digits)
const LEVEL_XP = [0, 0];
for (let L = 2; L <= MAX_LEVEL; L++) {
  const raw = 3.738 * (Math.pow(L, 6.728) - Math.pow(L - 1, 6.728));
  const p = Math.pow(10, Math.floor(Math.log10(raw)) - 2);
  LEVEL_XP[L] = LEVEL_XP[L - 1] + Math.round(raw / p) * p;
}
// INVEST_XP[L] = total Investor XP needed to reach level L
const INVEST_XP = [0, 0];
for (let L = 2; L <= MAX_LEVEL; L++) INVEST_XP[L] = Math.max(INVEST_XP[L - 1] + 1, Math.round(0.147 * Math.pow(L, 2.76)));

// LOGI_XP[L] = total Logistics XP to reach level L (smooth curve through these points)
//   level 5 ≈ 1 h, level 25 ≈ 8 h, level 50 ≈ 14 h, level 99 ≈ 50 h with a normally growing fleet
const LOGI_XP = [0, 0];
{
  const anchors = [[2, 8], [5, 100], [25, 3500], [50, 12000], [99, 145000]];
  for (let L = 2; L <= MAX_LEVEL; L++) {
    let i = 0;
    while (i < anchors.length - 2 && L > anchors[i + 1][0]) i++;
    const [a, xa] = anchors[i], [b, xb] = anchors[i + 1];
    const v = Math.round(Math.exp(Math.log(xa) + (Math.log(xb) - Math.log(xa)) * (Math.log(L) - Math.log(a)) / (Math.log(b) - Math.log(a))));
    LOGI_XP[L] = Math.max(LOGI_XP[L - 1] + 1, v);
  }
}

// Moves XP from one curve to another, keeping the same level and progress
function convertXp(xp, from, to) {
  xp = xp || 0;
  let L = 1;
  while (L < MAX_LEVEL && xp >= from[L + 1]) L++;
  if (L >= MAX_LEVEL) return to[MAX_LEVEL];
  const frac = (xp - from[L]) / (from[L + 1] - from[L]);
  return Math.floor(to[L] + frac * (to[L + 1] - to[L]));
}
// Save versions: 1 = both levels on the bcoin curve, 2 = both on the time curve, 3 = Gambler bcoin / Investor time
if ((state.xpVersion || 1) < 3) {
  if (state.xpVersion === 2) state.casinoXp = convertXp(state.casinoXp, INVEST_XP, LEVEL_XP);
  else if (state.invest) state.invest.xp = convertXp(state.invest.xp, LEVEL_XP, INVEST_XP);
  state.xpVersion = 3;
}

// XP multiplier for each casino game (by how long a round takes), ×2 more at Super high roller tables
const XP_GAME_MULT = { roulette: 2, bj: 4, bac: 4, vp: 1, uth: 5, plinko: 1, climb: 2, gc: 1 };
/* ----- 🔥 HOT TABLES: every 20 minutes, one game type gets a bonus on the XP multiplier of all its tables for 10 minutes (+10, +20 from Gambler level 50, +40 from 75),
   then 10 minutes with no bonus. The schedule follows the real clock (the same for everyone, and it keeps
   running while the game is closed); the hot game is picked at random and is never the same twice in a row. ----- */
// 🔥 Hot Tables: 10 minutes hot, 10 minutes cooldown. The bonus grows with your Gambler level: +10, +20 from level 50, +40 from level 75
const HOT_LEN = 10 * 60 * 1000;
const hotBonus = () => { const lv = levelInfo(state.casinoXp).level; return lv >= 75 ? 40 : lv >= 50 ? 20 : 10; };
const HOT_GAMES = [
  { id: "roulette", name: "🎡 Roulette" }, { id: "bj", name: "🃏 Blackjack" }, { id: "bac", name: "🎴 Baccarat" }, { id: "vp", name: "🎴 Video Poker" },
  { id: "uth", name: "🤠 Ultimate Texas Hold'em" }, { id: "plinko", name: "🔻 Plinko" }, { id: "climb", name: "🎈 Sky Climb" }, { id: "gc", name: "🧬 Gene Cascade" }];
function hotPick(cycle) {   // same answer for the same 30-minute cycle, on every device
  let h = Math.imul((cycle ^ 0x5bd1e995) >>> 0, 2654435761) >>> 0; h ^= h >>> 13; h = Math.imul(h, 1274126177) >>> 0; h ^= h >>> 16;
  return (h >>> 0) % HOT_GAMES.length;
}
// walk forward from 12 cycles back so the game never repeats twice in a row (the walk always agrees after a few steps)
function hotGameOf(cycle) {
  let g = hotPick(cycle - 12);
  for (let c = cycle - 11; c <= cycle; c++) { const r = hotPick(c); g = r === g ? (g + 1 + hotPick(c + 7919) % (HOT_GAMES.length - 1)) % HOT_GAMES.length : r; }
  return g;
}
function hotNow(t = Date.now()) {
  const slot = Math.floor(t / HOT_LEN), cycle = Math.floor(slot / 2), active = slot % 2 === 0;
  return { active, game: HOT_GAMES[hotGameOf(cycle)], next: HOT_GAMES[hotGameOf(cycle + 1)], left: HOT_LEN - (t % HOT_LEN) };
}
// XP multiplier per table (XP = bet × this). 🔥 Hot Tables add +10 / +20 / +40 (by Gambler level) to every table of the hot game.
const XP_TABLE_MULT = {
  rouletteLow: 1, rouletteHigh: 2.5, rouletteSuper: 4,
  bjLow: 2, bjHigh: 4, bjSuper: 8,
  bacLow: 2, bacHigh: 4, bacSuper: 8,
  vpLow: 1, vpHigh: 1.5, vpSuper: 2,
  uthLow: 5, uthHigh: 5, uthSuper: 10,
  plinko: 1, plinkoSuper: 2, climb: 2, climbHigh: 4,
  gcHigh: 2, gcSuper: 4,
};
function xpBase(id) {
  if (XP_TABLE_MULT[id] !== undefined) return XP_TABLE_MULT[id];
  const game = Object.keys(XP_GAME_MULT).find(k => id.startsWith(k));
  return (game ? XP_GAME_MULT[game] : 1) * (/Super/.test(id) ? 2 : 1);
}
function xpMult(id = currentGame || "") {
  const game = Object.keys(XP_GAME_MULT).find(k => id.startsWith(k)), h = hotNow();
  return xpBase(id) + (game && h.active && h.game.id === game ? hotBonus() : 0);
}
setTimeout(() => { renderHot(); setInterval(renderHot, 1000); }, 0);
let hotWasKey = "";
function renderHot() {
  const box = $("hotCard"); if (!box) return;
  const h = hotNow(), mm = clock(Math.ceil(h.left / 1000)), pct = (1 - h.left / HOT_LEN) * 100;
  box.className = "card hotCard " + (h.active ? "on" : "off");
  box.innerHTML = h.active
    ? `<div class="row"><b>${ico("ui-hot")}Hot Tables: ${h.game.name} · +${hotBonus()} XP multiplier</b><span class="hotTime">${mm} left</span></div>
       <div class="hotBar"><div style="width:${100 - pct}%"></div></div>
       <div class="muted">All ${h.game.name} tables get +${hotBonus()} on their XP multiplier right now (e.g. ×4 becomes ×${4 + hotBonus()}). Then a 10-minute break; next up: ${h.next.name}.</div>`
    : `<div class="row"><b>${ico("ui-hot")}Hot Tables cooling down</b><span class="hotTime">next in ${mm}</span></div>
       <div class="hotBar"><div style="width:${pct}%"></div></div>
       <div class="muted">Next hot game: <b>${h.next.name}</b> (+${hotBonus()} XP multiplier for 10 minutes on all its tables).</div>`;
  const key = h.active + h.game.id;
  if (key !== hotWasKey) {   // the bonus started or ended: refresh the game list
    if (hotWasKey && h.active) showNotice(`🔥 Hot Tables: ${h.game.name} gets +${hotBonus()} XP multiplier for 10 minutes!`);
    hotWasKey = key;
    if (state.view === "casino" && !currentGame && typeof renderCasino === "function") renderCasino();
  }
}
const CASHBACK_PER_LEVEL = 0.001;   // 0.1%

if (typeof state.casinoXp !== "number") state.casinoXp = 0;

function levelInfo(xp, curve = LEVEL_XP) {   // Gambler curve by default; pass INVEST_XP for the Investor level
  let level = 1;
  while (level < MAX_LEVEL && xp >= curve[level + 1]) level++;
  if (level >= MAX_LEVEL) return { level, into: 0, need: 0, max: true };
  return { level, into: xp - curve[level], need: curve[level + 1] - curve[level], max: false };
}
const cashbackRate = () => levelInfo(state.casinoXp).level * CASHBACK_PER_LEVEL + 0.05 * lawCount("criminal");
const pct = (r) => (r * 100).toLocaleString(undefined, { maximumFractionDigits: 1 }) + "%";

// All-time casino results: total bet and total paid back (wins, pushes, cashback)
if (!state.casinoStats) state.casinoStats = { wagered: 0, returned: 0 };
function casinoRecord(wagered, returned) {
  state.casinoStats.wagered += wagered;
  state.casinoStats.returned += returned;
  updateCasinoLevel();
}

function updateCasinoLevel() {
  const st = state.casinoStats || { wagered: 0, returned: 0 };
  const net = st.returned - st.wagered;
  const el = $("casinoAllTime");
  el.textContent = (net > 0 ? "+" : net < 0 ? "−" : "") + fmt(Math.abs(net));
  el.className = net > 0 ? "up" : net < 0 ? "down" : "";
  $("casinoAllTimeBet").textContent = st.wagered > 0 ? `· total bet ${fmt(st.wagered)}` : "";
  const info = levelInfo(state.casinoXp);
  $("levelNum").textContent = info.level;
  $("levelText").textContent = info.level + (info.max ? " (MAX)" : "");
  $("cashbackText").textContent = "Cashback " + pct(cashbackRate()) + " on lost bets";
  $("xpFill").style.width = info.max ? "100%" : (100 * info.into / info.need) + "%";
  $("xpText").textContent = info.max ? "Max level reached!"
    : fmtNum(info.into) + " / " + fmtNum(info.need) + " XP to level " + (info.level + 1);
}

// Adds XP for a bet (bet × the game's multiplier) and returns how many levels you gained
function addXp(amount) {
  const before = levelInfo(state.casinoXp).level;
  state.casinoXp += Math.round(amount * xpMult());
  const gained = levelInfo(state.casinoXp).level - before;
  updateCasinoLevel();
  if (gained > 0) {
    render();   // a new business may have unlocked
    const box = $("casinoLevel");
    box.classList.remove("levelUp"); void box.offsetWidth; box.classList.add("levelUp");
  }
  return gained;
}

function renderCasino() {
  // 📱 phone: the table sits below the lobby cards, so jump to it when a game is opened
  if (currentGame && currentGame !== renderCasino.shown && typeof isPhone === "function" && isPhone() && !$("casinoView").hidden)
    setTimeout(() => { const g = $("casinoGame"); if (g) window.scrollTo({ top: g.getBoundingClientRect().top + scrollY - 8, behavior: "smooth" }); }, 50);
  renderCasino.shown = currentGame;
  const box = $("casinoGame");
  setTimeout(() => { if (typeof updateVipBar === "function") updateVipBar(); }, 0);
  if (!currentGame) {
    // 🔒 locked games: Baccarat (Gambler level 20), Gene Cascade (1st prestige + Gambler level 40)
    const lockText = (id) => id.startsWith("bac") && typeof bacUnlocked === "function" && !bacUnlocked()
        ? `Unlocks at Gambler level ${BAC_LEVEL} (you are level ${levelInfo(state.casinoXp).level})`
      : id.startsWith("gc") && typeof gcUnlocked === "function" && !gcUnlocked() ? gcLockText() : "";
    const gameCard = (g) => lockText(g.id)
      ? `<button class="card gameCard locked" disabled>
         <h3>${casIco(g.id)}${g.name}</h3><div class="muted">${g.desc}</div>
         <div class="muted" style="margin-top:4px">${ico("lock", "lockS")}${lockText(g.id)}</div></button>`
      : `<button class="card gameCard" data-game="${g.id}">
         <h3>${casIco(g.id)}${g.name}</h3><div class="muted">${g.desc}</div>
         <div class="muted" style="color:#b388ff; margin-top:4px">✨ XP ×${xpMult(g.id)}${hotNow().active && g.id.startsWith(hotNow().game.id) ? ` <span class="hotTag">🔥 HOT</span>` : ""}</div></button>`;
    box.innerHTML = `<h2>Choose a game</h2>` + CASINO_GROUPS.map(group => `
      <div class="card gameGroup">
        <h2 style="margin:0 0 10px">${group.ico ? ico("cas-" + group.ico, "biz") : ""}${group.name}</h2>
        <div class="gameGrid">${group.games.map(id => gameCard(CASINO_GAMES.find(g => g.id === id))).join("")}</div>
      </div>`).join("") +
      `<div class="muted">More games coming soon...</div>`;
    return;
  }
  if (ROULETTE_TABLES[currentGame]) { roulette = ROULETTE_TABLES[currentGame]; renderRoulette(); }
  if (BJ_TABLES[currentGame]) { bj = BJ_TABLES[currentGame]; renderBlackjack(); }
  if (VP_TABLES[currentGame]) { vp = VP_TABLES[currentGame]; renderVideoPoker(); }
  if (UTH_TABLES[currentGame]) { uth = UTH_TABLES[currentGame]; renderUth(); }
  if (typeof BAC_TABLES !== "undefined" && BAC_TABLES[currentGame]) { bac = BAC_TABLES[currentGame]; renderBaccarat(); }
  if (CLIMBS[currentGame]) { climb = CLIMBS[currentGame]; renderClimb(); }
  if (typeof GC_TABLES !== "undefined" && GC_TABLES[currentGame]) { if (!gcBusy) gcView = null; renderGeneCascade(); }
  if (PLINKO_TABLES[currentGame]) {
    const cfg = PLINKO_TABLES[currentGame];
    if (!cfg.chips.includes(plinko.bet)) plinko.bet = cfg.chips[0];   // reset the bet when changing tables
    renderPlinko();
  }
}

$("casinoGame").addEventListener("click", (e) => {
  const card = e.target.closest("[data-game]");
  if (card) { currentGame = card.dataset.game; renderCasino(); }
  const back = e.target.closest("[data-back]");
  if (back && !roulette.spinning && !(bj && bj.phase !== "betting") && !(CLIMBS[currentGame] && climb.active) && !(PLINKO_TABLES[currentGame] && plinko.balls.length) && !(VP_TABLES[currentGame] && vp.phase !== "betting") && !(UTH_TABLES[currentGame] && uth.phase !== "betting") && !(typeof BAC_TABLES !== "undefined" && BAC_TABLES[currentGame] && bac.phase !== "betting") && !(typeof GC_TABLES !== "undefined" && GC_TABLES[currentGame] && gcBusy)) { currentGame = null; renderCasino(); }
});

/* =====================================================================
   ROULETTE (European: 0 and 1-36)
   ===================================================================== */
const WHEEL_ORDER = [0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10,
                     5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26];
const RED_NUMBERS = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];

const colorOf = (n) => n === 0 ? "green" : RED_NUMBERS.includes(n) ? "red" : "black";

// Every bet type: which numbers win, and the payout (35 means you win 35x your bet + keep your bet)
function betInfo(key) {
  if (key.startsWith("n")) { const n = Number(key.slice(1)); return { label: String(n), wins: x => x === n, pays: 35 }; }
  // Inside bets on several numbers, e.g. "x1-2" (split), "x1-2-4-5" (corner)
  if (key.startsWith("x")) {
    const nums = key.slice(1).split("-").map(Number);
    const types = { 2: ["Split", 17], 3: ["Street", 11], 4: ["Corner", 8], 6: ["Six line", 5] };
    let [name, pays] = types[nums.length];
    if (key === "x0-1-2-3") name = "First four";
    if (nums.length === 3 && nums.includes(0)) name = "Trio";   // 0-1-2 or 0-2-3: pays like a street
    return { label: name + " " + nums.join("-"), nums, wins: x => nums.includes(x), pays };
  }
  const all = {
    red:    { label: "Red",     wins: x => colorOf(x) === "red",   pays: 1 },
    black:  { label: "Black",   wins: x => colorOf(x) === "black", pays: 1 },
    odd:    { label: "Odd",     wins: x => x > 0 && x % 2 === 1,   pays: 1 },
    even:   { label: "Even",    wins: x => x > 0 && x % 2 === 0,   pays: 1 },
    low:    { label: "1–18",    wins: x => x >= 1 && x <= 18,      pays: 1 },
    high:   { label: "19–36",   wins: x => x >= 19,                pays: 1 },
    dozen1: { label: "1st 12",  wins: x => x >= 1 && x <= 12,      pays: 2 },
    dozen2: { label: "2nd 12",  wins: x => x >= 13 && x <= 24,     pays: 2 },
    dozen3: { label: "3rd 12",  wins: x => x >= 25,                pays: 2 },
    col1:   { label: "2 to 1",  wins: x => x > 0 && x % 3 === 1,   pays: 2 },  // bottom row: 1, 4, 7...
    col2:   { label: "2 to 1",  wins: x => x > 0 && x % 3 === 2,   pays: 2 },  // middle row: 2, 5, 8...
    col3:   { label: "2 to 1",  wins: x => x > 0 && x % 3 === 0,   pays: 2 },  // top row: 3, 6, 9...
  };
  return all[key];
}

// Each table has its own limits, chips, bets and history.
// min / max = the smallest and largest amount allowed on ONE betting spot.
function makeTable(id, title, emoji, min, max, chips) {
  return {
    id, title, emoji, min, max,
    chips,             // chip values you can pick at this table
    chip: chips[0],    // selected chip value
    bets: {},          // { betKey: amount } for the next spin (already taken from your chips)
    lastBets: {},      // to repeat the previous spin's bets
    spinning: false,
    rotation: 0,       // current wheel angle
    history: [],       // last results
    lastResult: null,
  };
}
const ROULETTE_TABLES = {
  rouletteLow:  makeTable("rouletteLow",  "Roulette: Classic table", "🎡", 500, 50000, [500, 1000, 5000, 10000, 25000, 50000]),
  rouletteHigh: makeTable("rouletteHigh", "Roulette: High rollers",  "💎", 50000, 5000000, [50000, 100000, 250000, 500000, 1000000, 5000000]),
  rouletteSuper: makeTable("rouletteSuper", "Roulette: Super high rollers", "💎💎", 10000000, 500000000, [10000000, 25000000, 50000000, 100000000, 250000000, 500000000]),
};
let roulette = ROULETTE_TABLES.rouletteLow;   // the table you are looking at
const anyTableSpinning = () => Object.values(ROULETTE_TABLES).some(t => t.spinning);

// Bets on the tables are saved, so a reload never loses chips
if (!state.rouletteBets || !state.rouletteBets.tables) {
  // old save had one table: give its chips back
  const old = state.rouletteBets || {};
  state.casinoChips = (state.casinoChips || 0) + Object.values(old).reduce((a, b) => a + b, 0);
  state.rouletteBets = { tables: {} };
}
for (const id in ROULETTE_TABLES) {
  ROULETTE_TABLES[id].bets = state.rouletteBets.tables[id] = state.rouletteBets.tables[id] || {};
}
const setBets = (table, bets) => { table.bets = state.rouletteBets.tables[table.id] = bets; };

const totalBets = (table = roulette) => Object.values(table.bets).reduce((a, b) => a + b, 0);
// Chip labels: up to 999k in bcoin ("250k"), from 1 scoin up in scoin ("10sc", "500sc")
const chipLabel = (v) => v >= 1e6 ? (Math.round(v / 1e6 * 100) / 100) + "sc" : shortNum(v);

// 1500 -> "1.5k", 5000000 -> "5M", 2500000000 -> "2.5B"
const shortNum = (v) => {
  const r = (x) => String(Math.round(x * 100) / 100);
  if (v >= 1e9) return r(v / 1e9) + "B";
  if (v >= 1e6) return r(v / 1e6) + "M";
  if (v >= 1e3) return r(v / 1e3) + "k";
  return r(v);
};

// Every chip value has its own color
const CHIP_COLORS = {
  100:    { bg: "#eceff1", text: "#263238" },   // white
  500:    { bg: "#8e24aa", text: "#fff" },      // purple
  1000:   { bg: "#00acc1", text: "#fff" },      // cyan
  5000:   { bg: "#fb8c00", text: "#fff" },      // orange
  10000:  { bg: "#1e88e5", text: "#fff" },      // blue
  1000000: { bg: "#2e7d32", text: "#fff" },     // green     (1 scoin)
  25000:  { bg: "#6d4c41", text: "#fff" },      // brown
  50000:  { bg: "#ec407a", text: "#fff" },      // pink
  100000: { bg: "#37474f", text: "#ffd34d" },   // dark grey, gold text
  250000: { bg: "#ffd700", text: "#3e2b00" },   // gold
  500000: { bg: "#7cb342", text: "#fff" },      // lime      (500k)
  5000000:   { bg: "#283593", text: "#fff" },    // indigo    (5 scoin)
  10000000:  { bg: "#00897b", text: "#fff" },    // teal      (10 scoin)
  25000000:  { bg: "#5e35b1", text: "#fff" },    // violet    (25 scoin)
  50000000:  { bg: "#c62828", text: "#fff" },    // crimson   (50 scoin)
  100000000: { bg: "#111111", text: "#ffd34d" }, // black/gold (100 scoin)
  250000000: { bg: "#ff6f00", text: "#fff" },    // amber     (250 scoin)
  500000000: { bg: "#cfd8dc", text: "#263238" }, // platinum  (500 scoin)
};
// A stack of bets shows the color of the biggest chip that fits in it
function chipColor(amount) {
  const values = Object.keys(CHIP_COLORS).map(Number).sort((a, b) => b - a);
  return CHIP_COLORS[values.find(v => v <= amount) || 100];
}
function chipMark(amount) {
  const c = chipColor(amount);
  return `<span class="chipMark" style="background:${c.bg}; color:${c.text}">${chipLabel(amount)}</span>`;
}
const insideKey = (...nums) => "x" + nums.sort((a, b) => a - b).join("-");

function renderRoulette() {

  const last = roulette.lastResult;
  const won = (key) => last !== null && !roulette.spinning && betInfo(key).wins(last);

  // A table cell: shows a chip instead of its text when you have a bet on it
  const cell = (key, text, cls = "", style = "", extra = "", attrs = "") => {
    const amount = roulette.bets[key];
    return `<div class="cell ${cls}${won(key) ? " winner" : ""}" data-bet="${key}" style="${style}" ${attrs}>
              ${amount ? chipMark(amount) : text}${extra}</div>`;
  };

  // A hot-spot on a line between numbers
  const spot = (pos, nums) => {
    const key = insideKey(...nums);
    const amount = roulette.bets[key];
    return `<div class="spot ${pos}${amount && won(key) ? " winner" : ""}" data-bet="${key}" data-nums="${nums.join(",")}"
                 title="${betInfo(key).label} · pays ${betInfo(key).pays}:1">${amount ? chipMark(amount) : ""}</div>`;
  };

  // Table: zero on the left, 3 rows of 12 numbers, column bets on the right
  // Zero: splits 0-3, 0-2, 0-1 on its right edge, the trios 0-2-3 and 0-1-2 where two rows meet it,
  // and the 0-1-2-3 corner at its bottom-right corner
  const zeroSpots =
    spot("right zsplit", [0, 3]).replace('class="spot', 'style="top:6%" class="spot') +
    spot("right zsplit", [0, 2]).replace('class="spot', 'style="top:40%" class="spot') +
    spot("right zsplit", [0, 1]).replace('class="spot', 'style="top:74%" class="spot') +
    spot("trio", [0, 2, 3]).replace('class="spot', 'style="top:calc(33.33% - 10px)" class="spot') +
    spot("trio", [0, 1, 2]).replace('class="spot', 'style="top:calc(66.67% - 10px)" class="spot') +
    spot("corner", [0, 1, 2, 3]);
  let table = cell("n0", "0", "green", "grid-row: 1 / span 3; grid-column: 1;", zeroSpots, 'data-n="0"');
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 12; col++) {
      const n = col * 3 + (3 - row);   // top row 3, 6, 9...  bottom row 1, 4, 7...
      let spots = "";
      const lastCol = col === 11;
      if (!lastCol) spots += spot("right", [n, n + 3]);                         // split →
      if (row < 2) {
        spots += spot("bottom", [n, n - 1]);                                    // split ↓
        if (!lastCol) spots += spot("corner", [n, n - 1, n + 3, n + 2]);        // corner
      } else {
        spots += spot("bottom", [n, n + 1, n + 2]);                             // street (bottom edge)
        if (!lastCol) spots += spot("corner", [n, n + 1, n + 2, n + 3, n + 4, n + 5]); // six line
      }
      table += cell("n" + n, n, colorOf(n), `grid-row: ${row + 1}; grid-column: ${col + 2};`, spots, `data-n="${n}"`);
    }
    table += cell("col" + (3 - row), "2:1", "", `grid-row: ${row + 1}; grid-column: 14;`);
  }
  ["dozen1", "dozen2", "dozen3"].forEach((k, i) =>
    table += cell(k, betInfo(k).label, "", `grid-row: 4; grid-column: ${2 + i * 4} / span 4;`));
  [["low", ""], ["even", ""], ["red", "red"], ["black", "black"], ["odd", ""], ["high", ""]].forEach(([k, cls], i) =>
    table += cell(k, betInfo(k).label, cls, `grid-row: 5; grid-column: ${2 + i * 2} / span 2;`));

  const hasLast = Object.keys(roulette.lastBets).length > 0;
  $("casinoGame").innerHTML = `
    <div class="card">
      <div class="row"><div><h2 style="margin:0">${casIco(currentGame)}${roulette.title}</h2>
        <div class="muted">Limits per spot: ${fmt(roulette.min)} – ${fmt(roulette.max)}</div></div>
        <button class="btn ghost small" data-back="1">← All games</button></div>

      <div class="rouletteTop" style="margin-top:14px">
        <div id="wheelWrap">
          <div id="wheel" style="transform: rotate(${roulette.rotation}deg)"></div>
          <div id="ball" style="transform:${ballTransform(...restingBall(roulette))}"></div>
        </div>
        <div id="result">
          <div id="resultNum" class="${last === null ? "" : colorOf(last)}">${last === null ? "?" : last}</div>
          <div id="resultText" class="muted">${roulette.spinning ? "Spinning..." : "Place your bets!"}</div>
          <div id="history">${roulette.history.map(n => `<span class="${colorOf(n)}">${n}</span>`).join("")}</div>
        </div>
      </div>

      <div class="chipsRow">
        <span class="muted">Chip:</span>
        ${roulette.chips.map(v => `<button class="chip ${v === roulette.chip && !roulette.chipFree ? "selected" : ""}" data-chip="${v}"
             style="background:${CHIP_COLORS[v].bg}; color:${CHIP_COLORS[v].text}">${chipLabel(v)}</button>`).join("")}
      </div>
      ${freeChipRow(roulette, roulette.chipFree)}

      <div id="tableWrap"><div id="table">${table}</div></div>

      <div class="moneyRow" style="margin-top:12px">
        <button class="btn" id="spin" ${roulette.spinning || totalBets() === 0 ? "disabled" : ""}>🎡 Spin (bet ${fmt(totalBets())})</button>
        <button class="btn ghost" id="clearBets" ${roulette.spinning ? "disabled" : ""}>Clear bets</button>
        <button class="btn ghost" id="rebet" ${roulette.spinning || !hasLast ? "disabled" : ""}>↺ Repeat last bets</button>
      </div>
      <div id="casinoMsg" class="flash" style="margin-top:8px"></div>
      <div class="muted" style="margin-top:6px">Click a number, or the line between numbers: between 2 = split, where 4 meet = corner, bottom edge = street, bottom corner = six line (next to 0: trios 0-1-2 / 0-2-3 where two rows meet the zero, and first four 0-1-2-3 at its bottom).</div>
      <div class="muted">Pays: number 35:1 · split 17:1 · street / trio 11:1 · corner / first four 8:1 · six line 5:1 · dozen / column 2:1 · red, black, odd, even, 1–18, 19–36 1:1 · when 0 comes up, only bets on 0 win</div>
    </div>`;
}

// Clicks inside the roulette
$("casinoGame").addEventListener("click", (e) => {
  if (!ROULETTE_TABLES[currentGame]) return;
  if (isPaused()) return;

  const chip = e.target.closest("[data-chip]");
  if (chip && !roulette.spinning) { roulette.chip = Number(chip.dataset.chip); roulette.chipFree = false; renderRoulette(); return; }
  const fchip = e.target.closest("[data-freechip]");
  if (fchip && !roulette.spinning) { roulette.chip = Number(fchip.dataset.freechip); roulette.chipFree = true; renderRoulette(); return; }

  const betCell = e.target.closest("[data-bet]");
  if (betCell && !roulette.spinning) {
    const free = roulette.chipFree;
    if (free && !(state.freeChips[roulette.chip] > 0)) { roulette.chipFree = false; renderRoulette(); return casinoMessage("No free chips of that kind left."); }
    if (!free && purse(roulette.id) < roulette.chip) return casinoMessage(`Not enough ${purseName(roulette.id)}.`);
    const key = betCell.dataset.bet;
    if ((roulette.bets[key] || 0) + roulette.chip > roulette.max)
      return casinoMessage("Table limit: max " + fmt(roulette.max) + " on one spot.");
    if (free) freeTake(roulette.id, roulette.chip); else payFrom(roulette.id, roulette.chip);
    roulette.bets[key] = (roulette.bets[key] || 0) + roulette.chip;
    roulette.lastResult = null;
    updateCounter(); renderRoulette(); save();
    return;
  }

  if (e.target.closest("#clearBets") && !roulette.spinning) {
    refundTo(roulette.id, totalBets() - freeReturn(roulette.id));   // give the chips back (free chips to your free chips)
    setBets(roulette, {});
    updateCounter(); renderRoulette(); save();
    return;
  }

  if (e.target.closest("#rebet") && !roulette.spinning) {
    const need = Object.values(roulette.lastBets).reduce((a, b) => a + b, 0);
    if (purse(roulette.id) < need) return casinoMessage(`Not enough ${purseName(roulette.id)} to repeat (` + fmt(need) + " needed).");
    for (const k in roulette.lastBets)
      if ((roulette.bets[k] || 0) + roulette.lastBets[k] > roulette.max)
        return casinoMessage("Table limit: max " + fmt(roulette.max) + " on one spot.");
    payFrom(roulette.id, need);
    for (const k in roulette.lastBets) roulette.bets[k] = (roulette.bets[k] || 0) + roulette.lastBets[k];
    roulette.lastResult = null;
    updateCounter(); renderRoulette(); save();
    return;
  }

  if (e.target.closest("#spin") && !roulette.spinning && totalBets() > 0) spinRoulette();
});

// Hovering a split / corner / street / six line lights up the numbers it covers
$("casinoGame").addEventListener("mouseover", (e) => {
  document.querySelectorAll(".cell.covered").forEach(c => c.classList.remove("covered"));
  const sp = e.target.closest(".spot");
  if (!sp) return;
  sp.dataset.nums.split(",").forEach(n => {
    const c = document.querySelector(`.cell[data-n="${n}"]`);
    if (c) c.classList.add("covered");
  });
});

/* ----- Ball animation -----
   The wheel turns clockwise and slows down. The ball runs the other way around the
   outer track, slows to a crawl (the tease), then drops and bounces into its pocket. */
const SPIN_MS = 7500;          // how long a spin lasts
const BALL_TRACK = 126;        // ball distance from the center while rolling in the rim's channel
const BALL_POCKET = 85;        // ball distance from the center once it lands (inside the pocket, below the number)
const BALL_TURNS = 8;          // laps the ball makes (relative to the wheel)
const DROP_AT = 0.72;          // when (0-1 of the spin) the ball starts falling in

// Angle of each pocket's middle on the wheel picture (0 = top, clockwise), in WHEEL_ORDER.
// The wheel is drawn exactly (assets/roulette-wheel.webp, 37 equal pockets), so every pocket is 360/37° apart.
const WHEEL_ANGLES = WHEEL_ORDER.map((_, i) => i * 360 / 37);
const pocketAngle = (n) => WHEEL_ANGLES[WHEEL_ORDER.indexOf(n)];

function ballTransform(angle, radius) {
  const rad = angle * Math.PI / 180;
  const x = 140 + radius * Math.sin(rad) - 7;
  const y = 140 - radius * Math.cos(rad) - 7;
  return `translate(${x}px, ${y}px)`;
}

// Where the ball sits when nothing is spinning
function restingBall(table) {
  if (table.lastResult === null) return [0, BALL_TRACK];
  return [table.rotation + pocketAngle(table.lastResult), BALL_POCKET];
}

// Bouncy landing (0 -> 1 with a few small bounces)
function bounce(t) {
  const n = 7.5625, d = 2.75;
  if (t < 1 / d) return n * t * t;
  if (t < 2 / d) return n * (t -= 1.5 / d) * t + 0.75;
  if (t < 2.5 / d) return n * (t -= 2.25 / d) * t + 0.9375;
  return n * (t -= 2.625 / d) * t + 0.984375;
}

function animateSpin(table, result, onDone) {
  const startWheel = table.rotation % 360;
  const endWheel = startWheel + 720;           // wheel makes 2 slowing turns
  const pocket = pocketAngle(result);
  const start = performance.now();

  function frame(now) {
    const p = Math.min(1, (now - start) / SPIN_MS);
    const wheelAngle = startWheel + 720 * (1 - Math.pow(1 - p, 2));

    // Ball position relative to the wheel: many laps that shrink to 0 at the pocket.
    // The cubic slow-down leaves the ball crawling past the last few numbers.
    let rel = pocket + BALL_TURNS * 360 * Math.pow(1 - p, 3);
    let radius = BALL_TRACK;
    if (p > DROP_AT) {
      const q = (p - DROP_AT) / (1 - DROP_AT);
      radius = BALL_TRACK - (BALL_TRACK - BALL_POCKET) * bounce(q);
      rel += Math.sin(q * Math.PI * 4) * 3 * (1 - q);   // little skips between pockets
    }

    const wheel = $("wheel"), ball = $("ball");
    if (wheel) wheel.style.transform = `rotate(${wheelAngle}deg)`;
    if (ball) ball.style.transform = ballTransform(wheelAngle + rel, radius);

    if (p < 1) requestAnimationFrame(frame);
  }
  table.rotation = endWheel;
  requestAnimationFrame(frame);
  setTimeout(onDone, SPIN_MS + 150);
}

// Money returned for the bets on a given result (bet back + winnings)
function roulettePayout(bets, result) {
  let back = 0;
  for (const key in bets) {
    const info = betInfo(key);
    if (info.wins(result)) back += bets[key] * (info.pays + 1);
  }
  return back;
}

// Random whole number from 0 to n-1 using the browser's cryptographic random generator
// (the same kind used for passwords and encryption). Every spin is independent:
// the wheel has no memory of earlier results.
function secureRandomInt(n) {
  if (!window.crypto || !window.crypto.getRandomValues) return Math.floor(Math.random() * n);
  const limit = Math.floor(0x100000000 / n) * n;   // throw away values that would make some numbers more likely
  const buf = new Uint32Array(1);
  do { window.crypto.getRandomValues(buf); } while (buf[0] >= limit);
  return buf[0] % n;
}

function spinRoulette() {
  const table = roulette;                            // the table being spun
  const result = secureRandomInt(37);                // 0 to 36, all equally likely
  table.spinning = true;
  table.lastBets = { ...table.bets };
  state.rouletteSpin = { id: table.id, result };   // 🔒 a reload mid-spin settles this same result
  save();
  renderRoulette();                    // draws the wheel at its current angle
  animateSpin(table, result, () => rouletteSettle(table, result));
}
function rouletteSettle(table, result, away = false) {
    state.rouletteSpin = null;
    const bet = totalBets(table);
    const back = roulettePayout(table.bets, result);

    // Cashback on every bet that lost (uses your level before this spin's XP)
    let lost = 0;
    for (const key in table.bets) if (!betInfo(key).wins(result)) lost += table.bets[key];
    const cashback = lost * cashbackRate();

    state.casinoChips += back + cashback;
    casinoRecord(bet, back + cashback);
    // achievements
    const keys = Object.keys(table.bets);
    if (keys.some(k => /^n\d+$/.test(k) && Number(k.slice(1)) === result)) state.stats.rouletteNumber = true;
    if (result === 0 && keys.length === 1 && keys[0] === "n0") state.stats.rouletteZeroOnly = true;
    countPlay("roulette");
    if ((table.bets.red || 0) >= 500000000 || (table.bets.black || 0) >= 500000000) state.stats.redBlack500 = true;
    const levelsGained = addXp(bet);      // XP = bet × game multiplier
    setBets(table, {});
    freeDone(table.id, "placed");          // free chips on the table were played
    table.spinning = false;
    table.lastResult = result;
    table.history = [result, ...table.history].slice(0, 12);
    updateCounter();
    if (currentGame === table.id) {
      renderRoulette();
      $("resultText").textContent = back > 0
        ? `You won ${fmt(back)}! (${back - bet >= 0 ? "+" : ""}${fmt(back - bet)})`
        : `You lost ${fmt(bet)}.`;
      if (cashback > 0) $("resultText").textContent += ` Cashback +${cashback.toLocaleString(undefined, { maximumFractionDigits: 1 })}.`;
      if (levelsGained > 0) $("resultText").textContent += ` 🎉 Level up! Now level ${levelInfo(state.casinoXp).level}.`;
      $("resultText").className = back > 0 ? "income" : "flash";
    }
    if (away) showNotice(`🎡 Your roulette spin finished: ${result}. ${back > 0 ? `You won ${fmt(back)}!` : `You lost ${fmt(bet)}.`}`);
    save();
}
// 🔒 a spin that was still turning when the page closed is settled with its own result (no free re-spin)
document.addEventListener("DOMContentLoaded", () => {
  const sp = state.rouletteSpin;
  if (sp && ROULETTE_TABLES[sp.id] && Object.keys(ROULETTE_TABLES[sp.id].bets || {}).length) rouletteSettle(ROULETTE_TABLES[sp.id], sp.result, true);
  else state.rouletteSpin = null;
});
