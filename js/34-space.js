/* =====================================================================
   🌌 SPACE LOGISTICS (🚢 Logistics → 🌌 Space). Release 1: the star map, exploring and friendship.
   - Opens with the 🚀 Space Mission Center (1 ship). More ships: 🛸 Orbital Space Station +1, 🌕 Moon Base +2, 🔴 Mars Base +2.
     The secret buildings show as "a hidden building" until you build them.
   - Our solar system sits in the middle; 6 alien systems around it (3 more "out of range" for a later update).
     The 3 near ones can be explored from the start; each far one is revealed by its neighbour once you are Acquainted.
   - 1️⃣ Explore: a ship flies there and back (real time, keeps going while the game is closed) and meets the race.
   - 2️⃣ Gifts: every race has one request at a time (money, ore from the vault, DNA samples, paintings or stardust).
     Its favourite kind gives more friendship. One gift per race can be on its way at a time.
     The ship comes back with the race's own goods (alien goods: trading opens in a later update).
   - Friendship: Contacted → Acquainted (300) → Friendly (1,000) → Trusted (2,500) → Allies (5,000).
     Each new level also sends a thank-you shipment of their goods.
   - A prestige keeps every race and your goods. Ships in flight are lost unless your Science buildings are kept.
   ===================================================================== */
const SP_RACES = {
  rock:     { name: "Kragg", title: "Rock-eaters", emoji: "🗿", pos: [31, 30], min: 6, wants: ["ore", "money"], good: "crystal",
              bio: "Huge, slow stone beings who chew asteroids for breakfast. They respect heavy, honest gifts." },
  bank:     { name: "Aurumites", title: "Bankers", emoji: "🧐", pos: [69, 30], min: 8, wants: ["money", "ore"], good: "vgold",
              bio: "Polite, gold-plated traders who count everything twice. Coins are the only language they fully trust." },
  stardust: { name: "Glimmerkin", title: "Star-chasers", emoji: "🧚", pos: [50, 81], min: 10, wants: ["dust", "art"], good: "core",
              bio: "Tiny shimmering beings who ride the solar winds and collect starlight in jars." },
  bio:      { name: "Vynari", title: "Bio-collectors", emoji: "🐙", pos: [12, 56], min: 14, via: "rock", wants: ["dna", "ore"], good: "silk",
              bio: "One giant jungle mind that wants to collect every form of life in the galaxy." },
  art:      { name: "Lumerians", title: "Art lovers", emoji: "🧞", pos: [28, 84], min: 16, via: "stardust", wants: ["art", "dust"], good: "pearl",
              bio: "Dreamy artists who see colours we can't imagine. They would trade a moon for a good painting." },
  pirate:   { name: "Void Corsairs", title: "Space pirates", emoji: "🦹", pos: [88, 56], min: 18, via: "bank", wants: ["money", "dust"], good: "chart",
              bio: "A rowdy pirate clan from a cursed red star. Pay them well and they might even call you friend." },
};
// 🔮 the 3 network races only want other races' goods (wants: "g:<good>"). Mystics and Machines are revealed by a Friendly neighbour;
//    the Ancients only listen once 3 races trust you (💛 Trusted). They ask for a mix of goods ("mix").
Object.assign(SP_RACES, {
  mystic:  { name: "Oracles of Vael", title: "Mystics", emoji: "🔮", pos: [13, 18], min: 25, via: "bio", viaLv: 3, wants: ["g:crystal", "g:pearl"], good: "shard",
             bio: "Ancient seers who read the future in crystals and sound. They only trade in things touched by other worlds." },
  machine: { name: "Cogitarium", title: "Machines", emoji: "🤖", pos: [87, 18], min: 30, via: "pirate", viaLv: 3, wants: ["g:vgold", "g:core"], good: "nano",
             bio: "A planet-sized thinking machine with millions of little helpers. It wants rare materials to build an even bigger brain." },
  ancient: { name: "First Ones", title: "Ancients", emoji: "👑", pos: [70, 82], min: 40, viaTrusted: 3, mix: true, wants: ["g:chart", "g:silk", "g:shard", "g:nano"], good: "relic",
             bio: "The oldest beings in the galaxy, sleeping in their golden ruins. Only the most trusted traders may visit them." },
});
const SP_FAR = {};
const SP_GOODS = {
  crystal: { name: "Star Crystals", emoji: "💠" }, vgold: { name: "Void Gold", emoji: "🪙" }, core: { name: "Nebula Cores", emoji: "🔮" },
  silk: { name: "Living Silk", emoji: "🧵" }, pearl: { name: "Echo Pearls", emoji: "🫧" }, chart: { name: "Pirate Charts", emoji: "🗺️" },
  shard: { name: "Time Shards", emoji: "⏳" }, nano: { name: "Nano Parts", emoji: "⚙️" }, relic: { name: "Ancient Relics", emoji: "🏺" },
};
// 🏅 alliance bonuses: [at 💛 Trusted, at 💖 Allies] (only while you keep that level). Used through alienBonus() in js/01-core.js.
const SP_BONUS = {
  rock:     { key: "ore",     val: [0.05, 0.1],  text: (v) => `+${v * 100}% ore value in the ⛏️ Gold Mine Dig` },
  bank:     { key: "income",  val: [0.02, 0.05], text: (v) => `+${v * 100}% income (businesses, special businesses and clicks)` },
  stardust: { key: "dust",    val: [0.1, 0.25],  text: (v) => `+${v * 100}% stardust in 🚀 Nebula Strike` },
  bio:      { key: "contract", val: [0.03, 0.06], text: (v) => `+${v * 100}% pay on every 🌍 Earth logistics contract` },
  art:      { key: "art",     val: [0.1, 0.25],  text: (v) => `+${v * 100}% 🏛️ Art Gallery income` },
  pirate:   { key: "mission", val: [0.05, 0.1],  text: (v) => `+${v * 100}% space mission rewards, and pirates leave your ships alone` },
  mystic:   { key: "route",   val: [0.1, 0.2],   text: (v) => `Trade routes ${v * 100}% faster` },
  machine:  { key: "ship",    val: [0, 1],       text: (v, i) => i ? "+1 spaceship" : "Gift and exploring trips 15% faster" },
  ancient:  { key: "market",  val: [0.1, 0.25],  text: (v) => `+${v * 100}% on every 🏪 Market price` },
};
function spAllyBonus(key) {
  let b = 0;
  for (const [k, B] of Object.entries(SP_BONUS)) {
    const L = spLevel(k);
    if (key === "giftSpeed" && k === "machine" && L >= 4) b += 0.15;
    if (B.key !== key || L < 4) continue;
    b += B.val[L >= 5 ? 1 : 0];
  }
  return b;
}
const SP_LEVELS = [
  { name: "Unknown", pts: 0, icon: "❔" }, { name: "Contacted", pts: 0, icon: "🤝" }, { name: "Acquainted", pts: 300, icon: "🙂" },
  { name: "Friendly", pts: 1000, icon: "😊" }, { name: "Trusted", pts: 2500, icon: "💛" }, { name: "Allies", pts: 5000, icon: "💖" },
];
const SP_KINDS = { money: "💰 Money", ore: "⛏️ Ore", dna: "🧬 DNA samples", art: "🖼️ Paintings", dust: "✨ Stardust" };
// 🎨 painted icons for the alien card (assets/space/sp-ico-*.webp, sp-kind-*.webp) and portraits (assets/space/aliens/)
const spI = (n, cls = "spI") => `<img class="${cls}" src="assets/space/sp-ico-${n}.webp" alt="">`;
const SP_LV_ICO = [null, "contacted", "acquainted", "friendly", "trusted", "allies"];
const spLvI = (L, cls) => L ? spI(SP_LV_ICO[L], cls) : "❔";
const SP_KIND_ICO = { money: "money", ore: "ore", art: "art", dust: "dust" };
const spKindI = (kind) => SP_KIND_ICO[kind] ? `<img class="spI" src="assets/space/sp-kind-${SP_KIND_ICO[kind]}.webp" alt="">` : SP_KINDS[kind].split(" ")[0];
const spPortrait = (k) => `assets/space/aliens/alien-${k}${spLevel(k) >= 4 ? "-happy" : ""}.webp`;
const SP_FAV_PTS = 200, SP_PTS = 120, SP_REQ_LIFE = 24 * 3600e3, SP_REROLL = 4 * 3600e3;
const SP_EXPLORE_SCI = 10;   // 🔬 scientists on board an exploring ship (they stay out there)
// 🆘 alien emergency: only starts while you play; send scientists in time for friendship, or lose some
const SP_SOS_SCI = 20, SP_SOS_TIME = 15 * 60e3, SP_SOS_WIN = 300, SP_SOS_LOSE = 200, SP_SOS_GAP = [40, 80];   // gap in minutes of play
const SP_SOS = {
  rock: "A quake is splitting their home asteroid apart!", bank: "Their central vault computer crashed and nobody can count anything!",
  stardust: "A solar storm is blowing their starlight jars away!", bio: "A strange blight is spreading through their jungle world!",
  art: "Their colour crystals went grey and they can't paint anymore!", pirate: "Their flagship reactor is overheating!",
};
// 🛣️ trade routes (from 😊 Friendly): a ship flies back and forth for good, bringing goods every trip (faster and fuller as friendship grows)
const SP_ROUTE_LV = 3, SP_ROUTE_GOODS = { 3: 8, 4: 10, 5: 12 }, SP_ROUTE_SPEED = { 3: 1, 4: 0.85, 5: 0.7 };
// 🏪 market: a unit is worth (0.025 × the race's distance in minutes) minutes of your business income; prices move every 30 minutes
const SP_PRICE_MIN = 0.025, SP_SLOT = 30 * 60e3;
const spSci2 = () => { try { return typeof sciPool === "function" ? sciPool() : 0; } catch (e) { return 0; } };
const SP_ORE_TIERS = [null, ["coal", "copper", "silver"], ["copper", "silver", "gold"], ["silver", "gold", "diamond"], ["gold", "diamond", "ruby"], ["diamond", "ruby"]];
const SP_ORE_BASE = { coal: 20, copper: 15, silver: 10, gold: 6, diamond: 4, ruby: 2 };

if (!state.space) state.space = {};
const SP = state.space;
SP.races = SP.races || {}; SP.goods = SP.goods || {}; SP.trips = SP.trips || []; SP.stats = SP.stats || { explored: 0, gifts: 0, goods: 0 };
SP.nextId = SP.nextId || 1;
Object.keys(SP_RACES).forEach(k => { SP.races[k] = SP.races[k] || { found: false, pts: 0 }; });
let spSel = SP.sel || "sol";

const spSci = () => state.science || {};
// 🚀 ship slots come from the space buildings
const SP_SLOTS = [["space", 1, "🚀 Space Mission Center"], ["station", 1, "🛸 Orbital Space Station"], ["moon", 2, "🌕 Moon Base"], ["mars", 2, "🔴 Mars Base"]];
const spShips = () => { const n = SP_SLOTS.reduce((a, [k, n]) => a + (spSci()[k] ? n : 0), 0); return n ? n + spAllyBonus("ship") : 0; };
const spFree = () => Math.max(0, spShips() - SP.trips.length);
const spRouteOf = (k) => SP.trips.find(tr => tr.to === k && tr.k === "route");
const spRouteMs = (k) => spMs(k) * SP_ROUTE_SPEED[Math.max(SP_ROUTE_LV, spLevel(k))] * (1 - spAllyBonus("route"));
const spOpen = () => !!(SP.unlocked || spSci().space);
const spLevel = (k) => { const r = SP.races[k]; if (!r.found) return 0; let L = 1; SP_LEVELS.forEach((l, i) => { if (i >= 2 && r.pts >= l.pts) L = i; }); return L; };
const spTrustedCount = () => Object.keys(SP_RACES).filter(k => spLevel(k) >= 4).length;
const spVisible = (k) => { const R = SP_RACES[k];
  if (R.viaTrusted) return spTrustedCount() >= R.viaTrusted;
  return !R.via || spLevel(R.via) >= (R.viaLv || 2); };
const spTripTo = (k, kind) => SP.trips.find(tr => tr.to === k && (!kind || tr.k === kind));
const spMs = (k) => SP_RACES[k].min * 60e3;   // one way
const spClock = (ms) => { const s = Math.max(0, Math.ceil(ms / 1000)), h = Math.floor(s / 3600), m = Math.floor(s % 3600 / 60);
  return h ? `${h}:${String(m).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}` : `${m}:${String(s % 60).padStart(2, "0")}`; };
const spGI = (g, cls = "spGi") => `<img class="${cls}" src="assets/space/good-${g}.webp" alt="${SP_GOODS[g].emoji}">`;   // painted good icon
const spGood = (g, n) => `${spGI(g)} ${n != null ? `<b>${n}</b> ` : ""}${SP_GOODS[g].name}`;

/* ----- 🎁 what can be asked for: only kinds you can already get somewhere ----- */
const spKindOpen = {
  money: () => true,
  ore: () => !!(state.mine && ((state.mine.runs || 0) > 0 || Object.values(state.mine.vault || {}).some(n => n > 0))),
  dna: () => !!(state.genetics && state.genetics.unlocked),
  art: () => !!(state.art && state.art.unlocked),
  dust: () => !!(state.shooter && state.shooter.unlocked),
};
const spKindName = (kind) => kind.startsWith("g:") ? `${spGI(kind.slice(2))} ${SP_GOODS[kind.slice(2)].name}`
  : kind === "dna" && !spKindOpen.dna() ? "❓ Something you haven't discovered yet" : `${spKindI(kind)} ${SP_KINDS[kind].replace(/^\S+ /, "")}`;
const spOpenKind = (w) => w.startsWith("g:") || spKindOpen[w]();
function spRound(n) { if (n < 100) return Math.round(n); const p = Math.pow(10, Math.floor(Math.log10(n)) - 1); return Math.round(n / p) * p; }
function spMakeReq(k, skip) {
  const R = SP_RACES[k], L = Math.max(1, spLevel(k));
  if (R.mix) {   // 👑 a mix of 2 goods
    const two = R.wants.slice().sort(() => Math.random() - 0.5).slice(0, 2), q = { kind: "goods", fav: true, until: Date.now() + SP_REQ_LIFE, goods: {} };
    two.forEach(w => { q.goods[w.slice(2)] = 10 + 6 * L; });
    SP.races[k].req = spSpecial(k, q); return;
  }
  let opts = R.wants.filter(w => spOpenKind(w) && w !== skip);
  if (!opts.length) opts = R.wants.filter(w => spOpenKind(w));
  if (!opts.length) opts = ["money"];
  const pick = opts.length > 1 ? (Math.random() < 0.65 ? opts[0] : opts[1]) : opts[0];
  if (pick.startsWith("g:")) { SP.races[k].req = spSpecial(k, { kind: "goods", fav: pick === R.wants[0], until: Date.now() + SP_REQ_LIFE, goods: { [pick.slice(2)]: 12 + 8 * L } }); return; }
  const kind = pick;
  const q = { kind, fav: kind === R.wants[0], until: Date.now() + SP_REQ_LIFE };
  if (kind === "money") q.amount = Math.max(1e6, spRound(mineBase() * 60 * (20 + 10 * L)));   // 30–70 minutes of business income
  if (kind === "dust") q.amount = 600 + 300 * L;
  if (kind === "dna") q.amount = 8 + Math.floor(Math.random() * 3);   // 8–10 samples, you choose which
  if (kind === "art") q.amount = 3 + Math.floor(Math.random() * 2);   // 3–4 paintings, you choose which
  if (kind === "ore") {
    const tier = SP_ORE_TIERS[L].slice().sort(() => Math.random() - 0.5).slice(0, 2);
    q.ore = {}; tier.forEach(o => { q.ore[o] = Math.max(1, Math.round(SP_ORE_BASE[o] * (1 + 0.25 * (L - 1)) * (0.8 + Math.random() * 0.4))); });
  }
  SP.races[k].req = spSpecial(k, q);
}
// ⭐ special request (event): 15% of new requests ask for 50% more within 12 hours, for 2.5× friendship and extra goods.
//    Let it run out and the race is offended (−100 friendship).
const SP_SPECIAL = { chance: 0.15, life: 12 * 3600e3, mult: 1.5, pts: 2.5, offend: 100 };
function spSpecial(k, q) {
  if (!SP.races[k].gifts || Math.random() >= SP_SPECIAL.chance) return q;
  q.special = true; q.until = Date.now() + SP_SPECIAL.life;
  if (q.amount && q.kind !== "dna" && q.kind !== "art") q.amount = spRound(q.amount * SP_SPECIAL.mult);
  if (q.kind === "dna") q.amount += 4; if (q.kind === "art") q.amount += 2;
  for (const m of [q.ore, q.goods]) if (m) for (const o in m) m[o] = Math.ceil(m[o] * SP_SPECIAL.mult);
  return q;
}
const spReqPts = (q) => Math.round((q.fav ? SP_FAV_PTS : SP_PTS) * (q.special ? SP_SPECIAL.pts : 1));
const spReqText = (q) => q.kind === "money" ? `${spKindI("money")} <b>${fmt(q.amount)}</b>`
  : q.kind === "dust" ? `${spKindI("dust")} <b>${q.amount.toLocaleString()}</b> stardust`
  : q.kind === "dna" ? `🧬 <b>${q.amount}</b> DNA samples (you choose which)`
  : q.kind === "art" ? `${spKindI("art")} <b>${q.amount}</b> paintings (you choose which)`
  : q.kind === "goods" ? Object.entries(q.goods).map(([g, n]) => `${spGI(g)} <b>${n}</b> ${SP_GOODS[g].name}`).join(" + ")
  : Object.entries(q.ore).map(([o, n]) => `${typeof oreIcon === "function" ? oreIcon(o) : ""} <b>${n}</b> ${ORES[o].name}`).join(" + ");
function spCanPay(q) {
  if (q.kind === "money") return state.money >= q.amount;
  if (q.kind === "dust") return ((state.shooter || {}).dust || 0) >= q.amount;
  if (q.kind === "ore") return Object.entries(q.ore).every(([o, n]) => ((state.mine.vault || {})[o] || 0) >= n);
  if (q.kind === "dna") return Object.values(state.genetics.dna || {}).reduce((a, b) => a + b, 0) >= q.amount;
  if (q.kind === "art") return (state.art.items || []).length >= q.amount;
  if (q.kind === "goods") return Object.entries(q.goods).every(([g, n]) => (SP.goods[g] || 0) >= n);
  return false;
}
const spReturnGoods = (L) => 2 + L;

/* ----- ☄️ events on the way (rolled when a ship leaves; they happen halfway out) -----
   ☄️ asteroid field: the trip takes longer · 🛸 lost ship: you rescue it (+100 friendship with a race you know, gifts and exploring only)
   🏴‍☠️ pirates: pay a toll (10 min of income) or run for it (50%: they take the cargo). No pirates once the Void Corsairs are 💛 Trusted.
   If you don't answer within a minute (or the game was closed), your captain runs for it. */
const SP_EV = { rocks: 0.1, pirates: 0.08, lost: 0.06, routeMult: 0.5, toll: 10, answer: 60e3, delay: 0.3, rescue: 100 };
function spRollEvent(tr) {
  const m = tr.k === "route" ? SP_EV.routeMult : 1, x = Math.random(), at = tr.t0 + (tr.t1 - tr.t0) * (0.35 + Math.random() * 0.3);
  if (x < SP_EV.rocks * m) return { type: "rocks", at };
  if (x < (SP_EV.rocks + SP_EV.pirates) * m && tr.to !== "pirate" && spLevel("pirate") < 4) return { type: "pirates", at };
  if (tr.k !== "route" && x > 1 - SP_EV.lost) return { type: "lost", at };
  return null;
}
let spAsk = null;   // the pirate question on screen
function spEventStep(tr, now, msgs = []) {
  const e = tr.ev, R = SP_RACES[tr.to];
  if (!e || e.done || now < e.at) return false;
  if (e.type === "rocks") {
    const d = Math.round((tr.t1 - tr.t0) * SP_EV.delay);
    if (now < tr.t1) tr.t1 += d; tr.t2 += d; e.done = true;
    msgs.push(`☄️ Your ship to the ${R.name} flew into an asteroid field: ${Math.round(d / 60e3)} min late.`);
  } else if (e.type === "lost") {
    const known = Object.keys(SP_RACES).filter(k => SP.races[k].found), k = known[Math.floor(Math.random() * known.length)];
    e.done = true;
    if (k) { SP.races[k].pts += SP_EV.rescue; SP.stats.rescues = (SP.stats.rescues || 0) + 1;
      msgs.push(`🛸 Your ship found a lost ship of the ${SP_RACES[k].name} and towed it home: +${SP_EV.rescue} friendship.`); }
  } else if (e.type === "pirates") {
    const live = now - e.at < 5000 && !document.hidden && !isPaused() && $("modal").hidden && !spAsk;
    if (!e.asked && live) { e.asked = now; spAskPirates(tr); return false; }
    if (e.asked && now - e.asked < SP_EV.answer && spAsk && spAsk.id === tr.id) return false;   // still waiting for your answer
    spPiratesRun(tr, msgs);
  }
  return true;
}
const spToll = () => Math.max(1e6, spRound(mineBase() * 60 * SP_EV.toll));
function spAskPirates(tr) {
  spAsk = { id: tr.id, toll: spToll() };
  showModal(`<h2>🏴‍☠️ Pirates!</h2><p>Space pirates stopped your ship on its way to the <b>${SP_RACES[tr.to].name}</b>.</p>
    <p>💰 Pay them <b>${fmt(spAsk.toll)}</b> to pass, or 🚀 run for it: a 50% chance they take your cargo${tr.k === "explore" ? " (exploring ships carry nothing worth taking)" : ""}.</p>
    <div class="row" style="justify-content:center;gap:10px"><button class="btn big" data-spp="pay" ${state.money >= spAsk.toll ? "" : "disabled"}>💰 Pay ${fmt(spAsk.toll)}</button>
    <button class="btn big dangerBtn" data-spp="run">🚀 Run for it</button></div><p class="muted">No answer in 1 minute: your captain runs for it.</p>`);
}
function spPiratesRun(tr, msgs) {
  tr.ev.done = true; spAsk = null; if (!$("modal").hidden && $("modalBox").querySelector("[data-spp]")) hideModal();
  const R = SP_RACES[tr.to];
  if (tr.k !== "explore" && Math.random() < 0.5) { tr.lost = true; SP.stats.robbed = (SP.stats.robbed || 0) + 1;
    msgs.push(`🏴‍☠️ Pirates caught your ship to the ${R.name} and took the cargo!`); }
  else msgs.push(`🚀 Your ship to the ${R.name} escaped the pirates!`);
}
$("modal").addEventListener("click", (e) => {
  const b = e.target.closest("[data-spp]"); if (!b || !spAsk) return;
  const tr = SP.trips.find(x => x.id === spAsk.id), msgs = [];
  if (tr && b.dataset.spp === "pay" && state.money >= spAsk.toll) {
    state.money -= spAsk.toll; tr.ev.done = true; SP.stats.tolls = (SP.stats.tolls || 0) + 1; spAsk = null; hideModal(); updateCounter();
    msgs.push(`💰 You paid the pirates. Your ship flies on to the ${SP_RACES[tr.to].name}.`);
  } else if (tr && b.dataset.spp === "run") spPiratesRun(tr, msgs);
  else { spAsk = null; hideModal(); }
  msgs.forEach(m => showNotice(m)); save(); if (spShown()) renderSpace();
});

/* ----- 🚀 trips ----- */
function spLaunch(k, kind, cargo) {
  const now = Date.now(), ms = spMs(k) * (1 - spAllyBonus("giftSpeed"));
  const tr = { id: SP.nextId++, k: kind, to: k, t0: now, t1: now + ms, t2: now + 2 * ms, cargo };
  tr.ev = spRollEvent(tr);
  SP.trips.push(tr);
  save(); renderSpace();
}
function spExplore(k) {
  if (isPaused() || !spFree() || SP.races[k].found || !spVisible(k) || spTripTo(k) || spSci2() < SP_EXPLORE_SCI) return;
  spendScientists(SP_EXPLORE_SCI);
  spLaunch(k, "explore");
  showNotice(`🚀 A ship is on its way to explore an unknown system (${SP_RACES[k].min} min there, ${SP_RACES[k].min} min back).`);
}
function spRouteStart(k) {
  if (isPaused() || !spFree() || spLevel(k) < SP_ROUTE_LV || spRouteOf(k)) return;
  const now = Date.now(), ms = spRouteMs(k);
  const tr = { id: SP.nextId++, k: "route", to: k, t0: now, t1: now + ms, t2: now + 2 * ms, got: 0, loops: 0 };
  tr.ev = spRollEvent(tr); SP.trips.push(tr);
  SP.stats.routes = (SP.stats.routes || 0) + 1;
  showNotice(`🛣️ Trade route to the ${SP_RACES[k].name} is open! One ship now flies there and back for good.`);
  save(); renderSpace();
}
// pay the request (DNA and paintings use what you picked) and send it
function spSendGift(k, pick) {
  const r = SP.races[k], q = r.req;
  if (isPaused() || !q || !spFree() || spTripTo(k, "gift") || !spCanPay(q)) return false;
  let what = spReqText(q);
  if (q.kind === "money") state.money -= q.amount;
  if (q.kind === "dust") state.shooter.dust -= q.amount;
  if (q.kind === "ore") Object.entries(q.ore).forEach(([o, n]) => { state.mine.vault[o] -= n; });
  if (q.kind === "goods") Object.entries(q.goods).forEach(([g, n]) => { SP.goods[g] -= n; });
  if (q.kind === "dna") {
    pick = pick && !Array.isArray(pick) ? pick : {};
    const tot = Object.values(pick).reduce((a, b) => a + b, 0);
    if (tot !== q.amount || Object.entries(pick).some(([n, c]) => (state.genetics.dna[n] || 0) < c)) return false;
    Object.entries(pick).forEach(([n, c]) => { state.genetics.dna[n] -= c; });
  }
  if (q.kind === "art") {
    const ids = new Set(Array.isArray(pick) ? pick : []);
    if (ids.size !== q.amount) return false;
    const items = state.art.items.filter(it => ids.has(it.id));
    if (items.length !== q.amount) return false;
    state.art.items = state.art.items.filter(it => !ids.has(it.id));
    items.forEach(it => { if (typeof artImgs === "object") delete artImgs[it.id]; if (typeof artImgDel === "function") artImgDel(it.id); });
    // 🖼️ a painting given to the aliens counts as sold (Art Gallery achievements)
    state.art.sold = (state.art.sold || 0) + q.amount; state.stats.artSold = (state.stats.artSold || 0) + q.amount;
  }
  r.req = null;
  spLaunch(k, "gift", { kind: q.kind, fav: q.fav, pts: spReqPts(q), special: !!q.special, text: what });
  updateCounter();
  showNotice(`🎁 Gift on its way to the ${SP_RACES[k].name} (${SP_RACES[k].min} min).`);
  return true;
}
// ⏱️ arrivals and returns (also catches up on everything that happened while the game was closed)
function spProcess() {
  const now = Date.now(), msgs = [];
  let changed = false;
  for (const tr of SP.trips) {
    const R = SP_RACES[tr.to], r = SP.races[tr.to];
    if (spEventStep(tr, now, msgs)) changed = true;
    if (tr.k === "route") {   // 🛣️ loops on its own (catches up on every trip made while the game was closed)
      if (!tr.arrived && now >= tr.t1) tr.arrived = true;
      let n = 0;
      while (now >= tr.t2 && n < 500) {
        n++; changed = true;
        const got = tr.lost ? 0 : SP_ROUTE_GOODS[Math.max(SP_ROUTE_LV, spLevel(tr.to))];
        SP.goods[R.good] = (SP.goods[R.good] || 0) + got; SP.stats.goods += got; tr.got = (tr.got || 0) + got; tr.loops = (tr.loops || 0) + 1;
        SP.stats.routeTrips = (SP.stats.routeTrips || 0) + 1;
        if (typeof addLogiXp === "function") addLogiXp("ship", (tr.t2 - tr.t0) / 1000);
        if (tr.stop || SP.trips.length > spShips()) { tr.done = true; msgs.push(`🛣️ The trade route to the ${R.name} has stopped. Your ship is home.`); break; }
        const ms = spRouteMs(tr.to); tr.t0 = tr.t2; tr.t1 = tr.t0 + ms; tr.t2 = tr.t0 + 2 * ms; tr.arrived = now >= tr.t1;
        tr.lost = false; tr.ev = spRollEvent(tr); spEventStep(tr, now);
      }
      continue;
    }
    if (!tr.arrived && now >= tr.t1) {
      tr.arrived = true; changed = true;
      if (tr.k === "explore" && !r.found) {
        r.found = true; r.foundAt = now; SP.stats.explored++;
        tr.goods = 3; spMakeReq(tr.to);
        msgs.push(`👽 First contact! Your ship met the <b>${R.name}</b> (${R.title}). See 🚢 Logistics → 🌌 Space.`);
      } else if (tr.k === "gift" && tr.lost) {   // 🏴‍☠️ robbed on the way
        spMakeReq(tr.to);
        msgs.push(`🏴‍☠️ Pirates stole your gift for the ${R.name}. They will ask for something new.`);
      } else if (tr.k === "gift") {
        const before = spLevel(tr.to), pts = tr.cargo.pts || (tr.cargo.fav ? SP_FAV_PTS : SP_PTS);
        r.pts += pts; r.gifts = (r.gifts || 0) + 1; SP.stats.gifts++;
        if (tr.cargo.special) SP.stats.specials = (SP.stats.specials || 0) + 1;
        const after = spLevel(tr.to);
        tr.goods = spReturnGoods(after) + (after > before ? 5 * after : 0) + (tr.cargo.special ? 5 * after : 0);
        spMakeReq(tr.to);
        if (after > before) msgs.push(`${SP_LEVELS[after].icon} The <b>${R.name}</b> are now <b>${SP_LEVELS[after].name}</b>! They load a thank-you gift on your ship.`);
        else msgs.push(`🎁 The <b>${R.name}</b> loved your gift: +${pts} friendship.`);
        // a far system's location is shared once you are Acquainted
        if (Object.entries(SP_RACES).some(([k2, x]) => !SP.races[k2].found && (x.via === tr.to && before < (x.viaLv || 2) && after >= (x.viaLv || 2) || x.viaTrusted && before < 4 && after >= 4 && spTrustedCount() === x.viaTrusted)))
          msgs.push(`📡 The ${R.name} told you where to find a new system. Send a ship to explore it!`);
      }
    }
    if (tr.arrived && now >= tr.t2) {
      tr.done = true; changed = true;
      if (tr.k !== "explore" && typeof addLogiXp === "function") addLogiXp("ship", (tr.t2 - tr.t0) / 1000);   // 🚚 Logistics XP for gift trips
      if (tr.goods) { SP.goods[R.good] = (SP.goods[R.good] || 0) + tr.goods; SP.stats.goods += tr.goods; }
      msgs.push(`🚀 Your ship is back from the ${R.name}${tr.goods ? ` with ${SP_GOODS[R.good].emoji} ${tr.goods} ${SP_GOODS[R.good].name}` : ""}.`);
    }
  }
  if (changed) SP.trips = SP.trips.filter(tr => !tr.done);
  // 📜 requests change every 24 hours (not while a gift is on its way)
  for (const k of Object.keys(SP_RACES)) {
    const r = SP.races[k];
    if (r.found && !spTripTo(k, "gift") && (!r.req || now > r.req.until)) {
      if (r.req && r.req.special) { r.pts = Math.max(0, r.pts - SP_SPECIAL.offend); SP.stats.offended = (SP.stats.offended || 0) + 1;
        msgs.push(`😠 The ${SP_RACES[k].name} are offended: nobody brought their special request. −${SP_SPECIAL.offend} friendship.`); }
      spMakeReq(k, r.req && r.req.kind); changed = true;
    }
  }
  if (msgs.length > 3) showNotice(`🌌 Space: ${msgs.length} updates while you were away. See 🚢 Logistics → 🌌 Space.`);
  else msgs.forEach(m => showNotice(m));
  if (changed) { save(); if (spShown()) renderSpace(); }
}

/* ----- 🖼️ page ----- */
const spPageOn = () => state.logiPage === "space" || state.logiPage === "market";
const spShown = () => state.view === "logistics" && spPageOn() && !$("logisticsView").hidden;
// 🛰️ flight paths are gentle curves bending away from the middle; a ship flies from the edge of Home to the edge of the system
const spAsp = () => { const m = document.querySelector(".spMap"); return m && m.clientHeight ? m.clientWidth / m.clientHeight : 16 / 9; };
function spCurve(k) {
  const [x, y] = SP_RACES[k].pos, A = [50, 50], dx = (x - 50) * 16, dy = (y - 50) * 9, len = Math.hypot(dx, dy) || 1;
  const bend = 0.16 * len * (x < 50 ? 1 : -1), mx = (50 + x) / 2, my = (50 + y) / 2;
  return { a: A, c: [mx + (-dy / len) * bend / 16, my + (dx / len) * bend / 9], b: [x, y] };
}
function spBez(C, t) {
  const u = 1 - t, P = (i) => u * u * C.a[i] + 2 * u * t * C.c[i] + t * t * C.b[i], D = (i) => 2 * u * (C.c[i] - C.a[i]) + 2 * t * (C.b[i] - C.c[i]);
  return { x: P(0), y: P(1), dx: D(0), dy: D(1) };
}
function spShipPos(tr, now) {
  const out = now < tr.t1, p = Math.max(0, Math.min(1, out ? (now - tr.t0) / (tr.t1 - tr.t0) : (now - tr.t1) / (tr.t2 - tr.t1)));
  const t = 0.07 + 0.86 * (out ? p : 1 - p), B = spBez(spCurve(tr.to), t);
  let ang = Math.atan2(B.dy, B.dx * spAsp()) * 180 / Math.PI; if (!out) ang += 180;
  if (ang > 180) ang -= 360;
  return { x: B.x, y: B.y, ang, op: Math.max(0.15, Math.min(1, p / 0.05, (1 - p) / 0.05)) };
}
const spShipCss = (s) => `left:${s.x}%;top:${s.y}%;opacity:${s.op};transform:translate(-50%,-50%) rotate(${s.ang}deg)${Math.abs(s.ang) > 90 ? " scaleY(-1)" : ""}`;
function spMapHtml() {
  const now = Date.now(), V = (q) => `${(q[0] * 1.6).toFixed(2)} ${(q[1] * 0.9).toFixed(2)}`;
  const lines = Object.entries(SP_RACES).filter(([k]) => spVisible(k)).map(([k]) => {
    const C = spCurve(k), d = `M${V(C.a)} Q${V(C.c)} ${V(C.b)}`, cls = spRouteOf(k) ? "route" : spTripTo(k) ? "busy" : SP.races[k].found ? "known" : "";
    return (cls === "route" || cls === "busy" ? `<path d="${d}" class="glow ${cls}"/>` : "") + `<path d="${d}" class="${cls}"/>`; }).join("");
  const nodes = Object.entries(SP_RACES).map(([k, R]) => {
    const r = SP.races[k], vis = spVisible(k), L = spLevel(k);
    const img = r.found ? `sys-${k}` : "sys-unknown";
    const lbl = r.found ? `${R.name}<small>${spLvI(L, "spI tiny")} ${SP_LEVELS[L].name}</small>` : vis ? `Unknown signal<small>❓ Explore</small>` : `<small>🔒 Uncharted</small>`;
    return `<button class="spNode ${r.found ? "found" : vis ? "fog" : "hidden"} ${spSel === k ? "sel" : ""}" data-sp="${k}" style="left:${R.pos[0]}%;top:${R.pos[1]}%">
      <img src="assets/space/${img}.webp" alt="" draggable="false"><span class="spLbl">${lbl}</span>${SP.sos && SP.sos.k === k ? `<i class="spSosPin">🆘</i>` : ""}${r.found && r.req && spFree() && !spTripTo(k, "gift") && spCanPay(r.req) ? `<i class="spPing">🎁</i>` : ""}</button>`; }).join("");
  const ships = SP.trips.map(tr => `<img class="spShip ${tr.k}" data-trip="${tr.id}" src="assets/space/ship-explorer.webp" alt="" draggable="false" style="${spShipCss(spShipPos(tr, now))}">`).join("");
  return `<div class="spMap" id="spMap"><div class="spWorld" id="spWorld"><svg viewBox="0 0 160 90" preserveAspectRatio="none">${lines}</svg>
    <button class="spNode sol ${spSel === "sol" ? "sel" : ""}" data-sp="sol" style="left:50%;top:50%"><span class="spHalo"></span><img src="assets/space/sys-sol.webp" alt="" draggable="false"><span class="spLbl">Home<small>🌍 Solar System</small></span></button>
    ${nodes}${ships}</div>
    <div class="spZoom"><button data-spz="in" title="Zoom in">+</button><button data-spz="out" title="Zoom out">−</button><button data-spz="reset" title="Whole map">⤢</button></div></div>`;
}
/* ----- 🔍 zoom and pan: buttons, mouse wheel, drag, and two-finger pinch on phones ----- */
const spZ = { z: 1, x: 0, y: 0 }, SP_ZMAX = 3;
function spZoomApply() {
  const m = $("spMap"), w = $("spWorld"); if (!m || !w) return;
  const W = m.clientWidth, H = m.clientHeight;
  spZ.z = Math.max(1, Math.min(SP_ZMAX, spZ.z));
  spZ.x = Math.min(0, Math.max(W * (1 - spZ.z), spZ.x)); spZ.y = Math.min(0, Math.max(H * (1 - spZ.z), spZ.y));
  w.style.transform = `translate(${spZ.x}px, ${spZ.y}px) scale(${spZ.z})`;
  w.style.setProperty("--iz", 1 / Math.sqrt(spZ.z));
  m.classList.toggle("zoomed", spZ.z > 1.01);
}
function spZoomAt(f, cx, cy) {   // cx, cy: point in the map (px) that stays put
  const z2 = Math.max(1, Math.min(SP_ZMAX, spZ.z * f)), k = z2 / spZ.z;
  spZ.x = cx - (cx - spZ.x) * k; spZ.y = cy - (cy - spZ.y) * k; spZ.z = z2; spZoomApply();
}
document.addEventListener("click", (e) => {
  const b = e.target.closest("[data-spz]"); if (!b) return;
  const m = $("spMap"); if (!m) return;
  if (b.dataset.spz === "reset") { spZ.z = 1; spZ.x = 0; spZ.y = 0; spZoomApply(); return; }
  spZoomAt(b.dataset.spz === "in" ? 1.5 : 1 / 1.5, m.clientWidth / 2, m.clientHeight / 2);
});
document.addEventListener("wheel", (e) => {
  const m = e.target.closest && e.target.closest("#spMap"); if (!m) return;
  e.preventDefault();
  const r = m.getBoundingClientRect();
  spZoomAt(e.deltaY < 0 ? 1.2 : 1 / 1.2, e.clientX - r.left, e.clientY - r.top);
}, { passive: false });
let spDrag = null; const spPtrs = new Map();
document.addEventListener("pointerdown", (e) => {
  const m = e.target.closest && e.target.closest("#spMap"); if (!m || e.target.closest(".spZoom")) return;
  spPtrs.set(e.pointerId, { x: e.clientX, y: e.clientY });
  spDrag = { x: e.clientX, y: e.clientY, ox: spZ.x, oy: spZ.y, moved: false, pinch: spPtrs.size === 2 ? { d: spPinchD(), z: spZ.z } : null };
});
const spPinchD = () => { const [a, b] = [...spPtrs.values()]; return a && b ? Math.hypot(a.x - b.x, a.y - b.y) : 0; };
document.addEventListener("pointermove", (e) => {
  if (!spDrag || !spPtrs.has(e.pointerId)) return;
  spPtrs.set(e.pointerId, { x: e.clientX, y: e.clientY });
  const m = $("spMap"); if (!m) return;
  if (spDrag.pinch && spPtrs.size === 2) {
    const r = m.getBoundingClientRect(), [a, b] = [...spPtrs.values()];
    spZoomAt(spDrag.pinch.z * spPinchD() / spDrag.pinch.d / spZ.z, (a.x + b.x) / 2 - r.left, (a.y + b.y) / 2 - r.top);
    spDrag.moved = true; return;
  }
  const dx = e.clientX - spDrag.x, dy = e.clientY - spDrag.y;
  if (!spDrag.moved && Math.hypot(dx, dy) < 6) return;
  if (spZ.z <= 1.01) return;   // nothing to pan at full view
  spDrag.moved = true; m.classList.add("dragging");
  spZ.x = spDrag.ox + dx; spZ.y = spDrag.oy + dy; spZoomApply();
});
document.addEventListener("pointerup", (e) => {
  spPtrs.delete(e.pointerId);
  if (!spDrag) return;
  if (spDrag.moved) { const stop = (ev) => { ev.stopPropagation(); ev.preventDefault(); }; document.addEventListener("click", stop, { capture: true, once: true }); setTimeout(() => document.removeEventListener("click", stop, { capture: true }), 50); }
  if (!spPtrs.size) { spDrag = null; const m = $("spMap"); if (m) m.classList.remove("dragging"); }
});
document.addEventListener("pointercancel", (e) => { spPtrs.delete(e.pointerId); if (!spPtrs.size) spDrag = null; });
window.addEventListener("resize", () => spZoomApply());
function spTripLine(tr) {
  const R = SP_RACES[tr.to], now = Date.now();
  const what = tr.k === "explore" ? (SP.races[tr.to].found ? `Exploring: ${R.name}` : "Exploring an unknown system") : tr.k === "route" ? `🛣️ Trade route: ${R.name}` : `🎁 Gift for the ${R.name}`;
  const st = now < tr.t1 ? `arrives in <b data-spt="${tr.t1}">${spClock(tr.t1 - now)}</b>` : `coming home, back in <b data-spt="${tr.t2}">${spClock(tr.t2 - now)}</b>`;
  return `<div class="spTrip">🚀 ${what} · ${st}${tr.lost ? " · 🏴‍☠️ cargo stolen" : ""}</div>`;
}
function spPanelHtml() {
  if (spSel === "sol") {
    const ships = spShips(), slots = SP_SLOTS.map(([k, n, name]) => {
      const has = !!spSci()[k], secret = k !== "space" && !has;
      return `<li>${has ? "✅" : "🔒"} ${secret ? "A hidden building" : name}: <b>+${n}</b> ship${n > 1 ? "s" : ""}</li>`; }).join("")
      + (spAllyBonus("ship") ? `<li>✅ 🤖 Cogitarium (💖 Allies): <b>+1</b> ship</li>` : "");
    return `<h3>🌍 Home: the Solar System</h3>
      <p>Your spaceport. Pick a system on the map to explore it or send gifts. Ships keep flying while the game is closed.</p>
      <div class="spStats"><span>🚀 Ships: <b>${SP.trips.length} / ${ships}</b> busy</span><span>👽 Races met: <b>${Object.values(SP.races).filter(r => r.found).length} / ${Object.keys(SP_RACES).length}</b></span><span>🎁 Gifts delivered: <b>${SP.stats.gifts}</b></span></div>
      ${ships ? "" : `<p class="spWarn">⚠️ You have no ships right now. Build the 🚀 Space Mission Center (💰 Income → 🔬 Science) to get your first one back.</p>`}
      <ul class="spSlots">${slots}</ul>
      ${spBonusList() ? `<h4>🏅 Your alliance bonuses</h4><ul class="spSlots">${spBonusList()}</ul>` : ""}
      ${SP.trips.length ? `<h4>Ships in flight</h4>${SP.trips.map(spTripLine).join("")}` : ""}`;
  }
  const R = SP_RACES[spSel], r = SP.races[spSel], L = spLevel(spSel), trip = spTripTo(spSel, r.found ? "gift" : null);
  if (!spVisible(spSel)) return R.viaTrusted ? `<h3>🔒 Uncharted system</h3><p>Only the most trusted traders may visit this system. Become <b>💛 Trusted</b> with <b>${R.viaTrusted}</b> races (you have ${spTrustedCount()}).</p>`
    : `<h3>🔒 Uncharted system</h3><p>Your scanners can't find this system yet. Become <b>${R.viaLv === 3 ? "😊 Friendly" : "Acquainted"}</b> with ${SP.races[R.via].found ? `the <b>${SP_RACES[R.via].name}</b>` : "a nearby race"} and they will tell you where it is.</p>`;
  if (!r.found) return `<h3 class="spH">${spI("explore", "spI big")} Unknown signal</h3>
    <p>Something is out there. Send a ship to explore it: <b>${R.min} min</b> there and <b>${R.min} min</b> back.</p>
    ${trip ? spTripLine(trip) : `<button class="btn big" data-spx="explore" ${spFree() && spSci2() >= SP_EXPLORE_SCI ? "" : "disabled"}>${spI("explore", "spI btnI")}Explore · 🔬 ${SP_EXPLORE_SCI} scientists</button>
      ${!spFree() ? `<div class="muted">All your ships are busy.</div>` : spSci2() < SP_EXPLORE_SCI ? `<div class="muted">You need ${SP_EXPLORE_SCI} scientists (you have ${spSci2()}).</div>` : ""}`}`;
  const next = SP_LEVELS[L + 1], pct = next ? Math.min(100, (r.pts - SP_LEVELS[L].pts) / (next.pts - SP_LEVELS[L].pts) * 100) : 100;
  const q = r.req, can = q && spCanPay(q);
  const rerollLeft = (r.rerollAt || 0) - Date.now();
  return `<div class="spCardHead"><div class="spCardSys" style="background-image:url(assets/space/sys-${spSel}.webp)"></div>
      <img class="spPortrait" src="${spPortrait(spSel)}" alt="${R.emoji}">
      <div class="spHeadTxt"><h3>${R.name} <span class="muted">· ${R.title}</span></h3>
        <div class="spLvBadge">${spLvI(L, "spI")}<b>${SP_LEVELS[L].name}</b></div>
        <p class="spBio">${R.bio}</p></div></div>
    <div class="spFriend"><span class="muted">${next ? `${r.pts.toLocaleString()} / ${next.pts.toLocaleString()} friendship to ${next.name}` : `${r.pts.toLocaleString()} friendship · best friends!`}</span>
      <div class="xpBar"><div class="xpFill" style="width:${pct}%"></div></div></div>
    <div class="spInfo">${R.mix ? `<div class="spRow">${spI("fav")}<span><b>Wants a mix of:</b> ${R.wants.map(spKindName).join(", ")} <span class="muted">(+${SP_FAV_PTS} friendship)</span></span></div>`
      : `<div class="spRow">${spI("fav")}<span><b>Favourite:</b> ${spKindName(R.wants[0])} <span class="muted">(+${SP_FAV_PTS} friendship)</span></span></div>
      <div class="spRow">${spI("likes")}<span><b>Also likes:</b> ${spKindName(R.wants[1])} <span class="muted">(+${SP_PTS})</span></span></div>`}
      <div class="spRow">${spI("sendback")}<span><b>They send back:</b> ${spGood(R.good)} <span class="muted">(${spReturnGoods(L)} per gift, more when you level up)</span></span></div>
      <div class="spRow">${spI("distance")}<span><b>Distance:</b> ${R.min} min each way</span></div></div>
    ${trip ? spTripLine(trip) : q ? `<div class="spReq ${q.special ? "special" : ""}">${q.special ? `<div class="spSpecial spRow">${spI("special")}<span>Special request! Bring it in time for extra friendship and goods, or they will be offended (−${SP_SPECIAL.offend}).</span></div>` : ""}<div class="spRow">${spI("request")}<span><b>Their request:</b> ${spReqText(q)}</span></div>
        <div class="muted">+${spReqPts(q)} friendship${q.fav ? " (their favourite!)" : ""} · ${q.special ? "time left" : "a new request in"} <span data-spt="${q.until}">${spClock(q.until - Date.now())}</span></div>
        <div class="spBtns"><button class="btn big" data-spx="gift" ${can && spFree() ? "" : "disabled"}>${spI("gift", "spI btnI")}Send gift</button>
          <button class="btn ghost" data-spx="reroll" ${rerollLeft > 0 ? "disabled" : ""}>${spI("reroll", "spI btnI")}Ask for something else${rerollLeft > 0 ? ` (${spClock(rerollLeft)})` : ""}</button></div>
        ${!spFree() ? `<div class="muted">All your ships are busy.</div>` : !can ? `<div class="muted">You don't have enough for this gift yet.</div>` : ""}</div>` : ""}
    ${spRouteHtml(spSel)}${spBonusHtml(spSel)}`;
}
function spBonusHtml(k) {
  const B = SP_BONUS[k], L = spLevel(k);
  return `<div class="spBonus"><div class="spRow">${spI("bonus")}<b>Alliance bonus</b></div>
    <div class="spRow ${L >= 4 ? "on" : ""}">${L >= 4 ? "✅" : "🔒"} ${spI("trusted")}<span>Trusted: ${B.text(B.val[0], 0)}</span></div>
    <div class="spRow ${L >= 5 ? "on" : ""}">${L >= 5 ? "✅" : "🔒"} ${spI("allies")}<span>Allies: ${B.text(B.val[1], 1)}${k === "machine" ? " (and trips stay 15% faster)" : ""}</span></div></div>`;
}
function spBonusList() {
  return Object.keys(SP_BONUS).filter(k => spLevel(k) >= 4).map(k => { const B = SP_BONUS[k], i = spLevel(k) >= 5 ? 1 : 0;
    return `<li>${SP_RACES[k].emoji} ${SP_RACES[k].name}: ${B.text(B.val[i], i)}${k === "machine" && i ? " · trips 15% faster" : ""}</li>`; }).join("");
}
function spRouteHtml(k) {
  const R = SP_RACES[k], L = spLevel(k), rt = spRouteOf(k);
  if (L < SP_ROUTE_LV) return `<div class="spRoute locked spRow">${spI("route")}<span><b>Trade route:</b> opens when you are <b>😊 Friendly</b> with the ${R.name}.</span></div>`;
  const goods = SP_ROUTE_GOODS[L], mins = Math.round(spRouteMs(k) * 2 / 60e3);
  if (rt) return `<div class="spRoute on"><div class="spRow">${spI("route")}<span><b>Trade route open</b> · ${spGI(R.good)} <b>${goods}</b> ${SP_GOODS[R.good].name} every trip (${mins} min round trip)</span></div>
    ${spTripLine(rt)}<div class="muted">Trips so far: ${rt.loops || 0} · goods brought home: ${(rt.got || 0).toLocaleString()}</div>
    <div class="spBtns">${rt.stop ? `<span class="muted">⏹️ Stops when the ship gets home.</span> <button class="btn ghost small" data-spx="rgo">▶ Keep it running</button>` : `<button class="btn ghost" data-spx="rstop">⏹️ Stop the route</button>`}</div></div>`;
  return `<div class="spRoute"><div class="spRow">${spI("route")}<span><b>Trade route:</b> one ship flies to the ${R.name} and back <b>for good</b>, bringing ${spGI(R.good)} <b>${goods}</b> ${SP_GOODS[R.good].name} every trip (${mins} min round trip). It keeps going while the game is closed.</span></div>
    <div class="muted">More goods and faster trips at 💛 Trusted and 💖 Allies.</div>
    <div class="spBtns"><button class="btn big" data-spx="route" ${spFree() ? "" : "disabled"}>${spI("route", "spI btnI")}Open trade route</button></div>${spFree() ? "" : `<div class="muted">All your ships are busy.</div>`}</div>`;
}
function spGoodsHtml() {
  const have = Object.keys(SP_GOODS).filter(g => SP.goods[g]);
  return `<h3>📦 Alien goods</h3>${have.length ? `<div class="spGoods">${have.map(g => `<span>${spGood(g, SP.goods[g])}</span>`).join("")}</div>`
    : `<p class="muted">Nothing yet. Races send their goods back with your ships.</p>`}
    <p class="muted">🏪 Sell them in 🌌 Space → Market, or give them to the races that want them (🔮 the Mystics, 🤖 the Machines and 👑 the Ancients).</p>`;
}
// 🎒 everything you can give (and the alien goods you got), refreshed every second
function spResHtml() {
  const it = (ic, n, tip) => `<span class="spRes" title="${tip}">${ic} <b>${n}</b></span>`;
  const earth = [it("🔬", spSci2().toLocaleString(), "Scientists")];
  if (spKindOpen.ore()) ORE_KEYS.forEach(o => earth.push(it(oreIcon(o), (state.mine.vault || {})[o] || 0, ORES[o].name)));
  if (spKindOpen.dna()) earth.push(it("🧬", Object.values(state.genetics.dna || {}).reduce((a, b) => a + b, 0), "DNA samples"));
  if (spKindOpen.art()) earth.push(it("🖼️", (state.art.items || []).length, "Paintings"));
  if (spKindOpen.dust()) earth.push(it("✨", (state.shooter.dust || 0).toLocaleString(), "Stardust"));
  const goods = Object.keys(SP_GOODS).filter(g => SP.goods[g]);
  return `<div class="spResRow"><span class="spResLbl">Money:</span>${it("💰", fmt(state.money), "Money")}</div>
    <div class="spResRow"><span class="spResLbl">Earth resources:</span>${earth.join("")}</div>
    <div class="spResRow"><span class="spResLbl">Space resources:</span>${goods.length ? goods.map(g => it(spGI(g), SP.goods[g].toLocaleString(), SP_GOODS[g].name)).join("") : `<span class="muted">none yet</span>`}</div>`;
}
/* ----- 🆘 alien emergency ----- */
const spSosOn = () => !!SP.sos;
function spSosStart() {
  const found = Object.keys(SP_RACES).filter(k => SP.races[k].found);
  if (!found.length) return;
  const k = found[Math.floor(Math.random() * found.length)];
  SP.sos = { k, until: Date.now() + SP_SOS_TIME };
  showAlert(`🆘 The ${SP_RACES[k].name} need help!`, `${SP_SOS[k]} Send ${SP_SOS_SCI} 🔬 scientists within ${SP_SOS_TIME / 60e3} minutes (🚢 Logistics → 🌌 Space).`);
  save(); spRefreshWarn(); if (spShown()) renderSpace();
}
function spSosHelp() {
  const e = SP.sos;
  if (!e || isPaused() || spSci2() < SP_SOS_SCI) return;
  spendScientists(SP_SOS_SCI);
  const r = SP.races[e.k], before = spLevel(e.k);
  r.pts += SP_SOS_WIN; SP.sos = null; SP.stats.sosWon = (SP.stats.sosWon || 0) + 1;
  SP.nextSos = Date.now() + spSosGap();
  const after = spLevel(e.k);
  showNotice(`🆘 Your scientists saved the day! The ${SP_RACES[e.k].name} are grateful: +${SP_SOS_WIN} friendship.`);
  if (after > before) showNotice(`${SP_LEVELS[after].icon} The <b>${SP_RACES[e.k].name}</b> are now <b>${SP_LEVELS[after].name}</b>!`);
  updateCounter(); save(); spRefreshWarn(); if (spShown()) renderSpace();
}
const spSosGap = () => (SP_SOS_GAP[0] + Math.random() * (SP_SOS_GAP[1] - SP_SOS_GAP[0])) * 60e3;
// every second: count down, fail when time runs out (also while the game was closed), and maybe start one (only while you play)
let spPlayMs = 0;
function spSosTick() {
  const now = Date.now();
  if (SP.sos && now >= SP.sos.until) {
    const k = SP.sos.k, r = SP.races[k];
    r.pts = Math.max(0, r.pts - SP_SOS_LOSE); SP.sos = null; SP.stats.sosLost = (SP.stats.sosLost || 0) + 1;
    showAlert(`💔 Too late for the ${SP_RACES[k].name}`, `Nobody came to help. They lost ${SP_SOS_LOSE} friendship with you.`);
    SP.playLeft = spSosGap(); save(); spRefreshWarn(); if (spShown()) renderSpace();
    return;
  }
  if (SP.sos || document.hidden || isPaused() || !spSci().space) return;
  if (!Object.values(SP.races).some(r => r.found)) return;
  if (SP.playLeft == null) SP.playLeft = spSosGap();
  SP.playLeft -= 1000;   // minutes of play, not real time
  if (SP.playLeft <= 0) { SP.playLeft = null; spSosStart(); }
}
function spSosHtml() {
  const e = SP.sos; if (!e) return "";
  const R = SP_RACES[e.k], can = spSci2() >= SP_SOS_SCI;
  return `<div class="card spSos"><div><h3>🆘 The ${R.name} need help!</h3><p>${SP_SOS[e.k]}</p>
    <p>Send <b>${SP_SOS_SCI} 🔬 scientists</b> before the time runs out: <b>+${SP_SOS_WIN}</b> friendship. If nobody comes, they lose <b>${SP_SOS_LOSE}</b> friendship with you.</p></div>
    <div class="spSosSide"><div class="spSosTime">⏱️ <b data-spt="${e.until}">${spClock(e.until - Date.now())}</b></div>
      <button class="btn big dangerBtn" data-spx="sos" ${can ? "" : "disabled"}>🔬 Send ${SP_SOS_SCI} scientists</button>
      ${can ? "" : `<div class="muted">You have ${spSci2()} scientists.</div>`}</div></div>`;
}
// ❗ red warnings: on the 🚢 Logistics tab (see refreshUnlocks) and on the 🌌 Space page button
function spRefreshWarn() {
  const sb = document.querySelector('[data-logipage="space"]');
  if (sb) { const html = (spOpen() ? "" : '<img class="ico lockS" src="assets/icons/ico-lock.webp" alt="">') + '<img class="ico" src="assets/icons/ico-lg-space.webp" alt="">Space' + (SP.sos ? ' <span class="tabWarn" title="Alien emergency">!</span>' : "");
    if (sb.innerHTML !== html) sb.innerHTML = html; }
}
/* ----- 🏪 MARKET: sell alien goods. Each good's price moves every 30 minutes (the same for everyone at the same time). ----- */
const SP_GOOD_RACE = Object.fromEntries(Object.entries(SP_RACES).map(([k, R]) => [R.good, k]));
const spSlot = (t = Date.now()) => Math.floor(t / SP_SLOT);
function spMult(g, slot) {
  const i = Object.keys(SP_GOODS).indexOf(g) + 1;
  const h = Math.sin(slot * 12.9898 + i * 78.233) * 43758.5453, noise = h - Math.floor(h);
  return Math.max(0.45, 1 + 0.3 * Math.sin(slot * 0.9 + i * 2.1) + 0.18 * Math.sin(slot * 0.37 + i * 5.3) + 0.24 * (noise - 0.5));
}
const spBase = (g) => mineBase() * 60 * SP_PRICE_MIN * SP_RACES[SP_GOOD_RACE[g]].min;
const spPrice = (g, slot = spSlot()) => Math.max(1, Math.round(spBase(g) * spMult(g, slot) * (1 + spAllyBonus("market"))));
let spQty = {};
function spSell(g, all) {
  const have = SP.goods[g] || 0, n = all ? have : Math.min(have, Math.max(1, Math.floor(spQty[g] || 1)));
  if (isPaused() || !n) return;
  const pay = n * spPrice(g);
  SP.goods[g] -= n; state.money += pay; clickedThisSecond += pay;   // counts as income (taxes)
  SP.stats.sold = (SP.stats.sold || 0) + n; SP.stats.soldMoney = (SP.stats.soldMoney || 0) + pay;
  showNotice(`🏪 Sold ${SP_GOODS[g].emoji} ${n} ${SP_GOODS[g].name} for ${fmt(pay)}.`);
  updateCounter(); save(); renderSpace();
}
function spSpark(g) {
  const now = spSlot(), pts = Array.from({ length: 13 }, (_, i) => spMult(g, now - 12 + i)), mx = Math.max(...pts), mn = Math.min(...pts);
  const xy = pts.map((v, i) => `${(i * 100 / 12).toFixed(1)},${(26 - (v - mn) / Math.max(0.01, mx - mn) * 22).toFixed(1)}`).join(" ");
  return `<svg class="spSpark" viewBox="0 0 100 28" preserveAspectRatio="none"><polyline points="${xy}"/></svg>`;
}
function spMarketHtml() {
  const next = (spSlot() + 1) * SP_SLOT;
  const rows = Object.keys(SP_GOODS).map(g => {
    const R = SP_RACES[SP_GOOD_RACE[g]], known = SP.races[SP_GOOD_RACE[g]].found, have = SP.goods[g] || 0;
    if (!known && !have) return `<tr class="spMkLocked"><td>❓ Unknown goods</td><td colspan="5" class="muted">Meet more alien races to trade their goods.</td></tr>`;
    const p = spPrice(g), prev = spPrice(g, spSlot() - 1), ch = (p - prev) / prev * 100;
    const q = Math.min(have, Math.max(1, Math.floor(spQty[g] || 1)));
    return `<tr><td>${spGI(g)} <b>${SP_GOODS[g].name}</b><div class="muted">from the ${R.name}</div></td><td><b>${have.toLocaleString()}</b></td>
      <td><b>${fmt(p)}</b><div class="${ch >= 0 ? "up" : "down"}">${ch >= 0 ? "▲" : "▼"} ${Math.abs(ch).toFixed(0)}%</div></td><td>${spSpark(g)}</td>
      <td class="spMkSell"><input type="number" min="1" max="${have}" value="${q}" data-spq="${g}" ${have ? "" : "disabled"}>
        <button class="btn small" data-spx="sell" data-g="${g}" ${have ? "" : "disabled"}>Sell</button>
        <button class="btn ghost small" data-spx="sellall" data-g="${g}" ${have ? "" : "disabled"}>Sell all${have ? ` (${fmt(have * p)})` : ""}</button></td></tr>`;
  }).join("");
  return `<div class="card spResBar" id="spResBar">${spResHtml()}</div>
    <div class="card"><div class="row"><h2 style="margin:0"><img class="ico h" src="assets/icons/ico-lg-market.webp" alt="">Alien market</h2><span class="muted">⏱️ Prices change in <b data-spt="${next}">${spClock(next - Date.now())}</b></span></div>
    <p class="muted">Sell the goods your ships bring home. Prices move every 30 minutes: sell when they are high. The further away a race lives, the more its goods are worth.</p>
    <div class="spMkWrap"><table class="spMarket"><thead><tr><th>Good</th><th>You have</th><th>Price each</th><th>Last 6 hours</th><th></th></tr></thead><tbody>${rows}</tbody></table></div>
    <div class="spStats"><span>📦 Sold: <b>${(SP.stats.sold || 0).toLocaleString()}</b></span><span>💰 Earned: <b>${fmt(SP.stats.soldMoney || 0)}</b></span></div></div>`;
}
document.addEventListener("input", (e) => { const el = e.target.closest("[data-spq]"); if (el) spQty[el.dataset.spq] = Number(el.value) || 1; });
function renderSpace() {
  const box = $("spaceView");
  if (!box || !spShown()) return;
  if (!spOpen()) { box.innerHTML = `<div class="card" style="text-align:center"><h2>🔒 🌌 Space</h2><p>Explore the galaxy, meet alien races and trade with them.</p>
    <p><b>Opens when you build the 🚀 Space Mission Center</b> (💰 Income → 🔬 Science).</p></div>`; return; }
  if (state.logiPage === "market") { box.innerHTML = spSosHtml() + spMarketHtml(); return; }
  box.innerHTML = `${spSosHtml()}<div class="card spResBar" id="spResBar">${spResHtml()}</div><div class="card spMapCard"><div class="row"><h2 style="margin:0">🌌 Star map</h2><span class="muted">🚀 ${spFree()} of ${spShips()} ship${spShips() === 1 ? "" : "s"} free</span></div>${spMapHtml()}</div>
    <div class="card spPanel">${spPanelHtml()}</div><div class="card">${spGoodsHtml()}</div>`;
  spZoomApply();
}
// every second: move the ships and count down (no full rebuild)
let spLastSlot = spSlot();
function spAnimate() {
  if (!spShown()) return;
  if (state.logiPage === "market" && spSlot() !== spLastSlot) { spLastSlot = spSlot(); renderSpace(); }
  const now = Date.now(), bar = $("spResBar");
  if (bar) { const h = spResHtml(); if (bar.dataset.h !== h) { bar.innerHTML = h; bar.dataset.h = h; } }
  for (const tr of SP.trips) {
    const el = document.querySelector(`.spShip[data-trip="${tr.id}"]`); if (!el) continue;
    el.style.cssText = spShipCss(spShipPos(tr, now));
  }
  document.querySelectorAll("#spaceView [data-spt]").forEach(el => { el.textContent = spClock(Number(el.dataset.spt) - now); });
}

/* ----- 🎁 picking DNA samples or paintings ----- */
let spPick = null;
function spOpenGift(k) {
  const q = SP.races[k].req;
  if (!q || !spCanPay(q) || !spFree()) return;
  if (q.kind !== "dna" && q.kind !== "art") {
    showModal(`<h2>🎁 Gift for the ${SP_RACES[k].name}</h2><p>Send ${spReqText(q)}?</p>
      <p class="muted">Your ship flies ${SP_RACES[k].min} min there and ${SP_RACES[k].min} min back, and brings their goods home.</p>
      <div class="row" style="justify-content:center;gap:10px"><button class="btn big" data-spg="send">🚀 Send</button><button class="btn ghost" data-modal="close">Cancel</button></div>`);
    spPick = { k, kind: q.kind }; return;
  }
  spPick = { k, kind: q.kind, need: q.amount, sel: q.kind === "dna" ? {} : [] };
  spRenderPick();
}
function spRenderPick() {
  const P = spPick, R = SP_RACES[P.k];
  const got = P.kind === "dna" ? Object.values(P.sel).reduce((a, b) => a + b, 0) : P.sel.length;
  let body;
  if (P.kind === "dna") {
    const G2 = state.genetics, list = G2.known.filter(n => (G2.dna[n] || 0) > 0);
    body = `<button class="btn ghost small" data-spauto="1" style="margin-bottom:8px">✨ Pick for me</button><div class="spPickList">${list.map(n => { const c = P.sel[n] || 0;
      return `<div class="spPickRow"><span>${typeof gEm === "function" ? gEm(n, "sm") : ""} ${n} <span class="muted">(${G2.dna[n]})</span></span>
        <span><button class="btn ghost small" data-spd="${n}" data-d="-1" ${c ? "" : "disabled"}>−</button> <b>${c}</b>
        <button class="btn ghost small" data-spd="${n}" data-d="1" ${c < G2.dna[n] && got < P.need ? "" : "disabled"}>+</button></span></div>`; }).join("")}</div>`;
  } else {
    body = `<div class="spArtGrid">${state.art.items.map(it => `<button class="spArt ${P.sel.includes(it.id) ? "on" : ""}" data-spa="${it.id}">
      <img src="${typeof artImgOf === "function" ? artImgOf(it) : ""}" alt=""><small>${fmt(it.value)}</small></button>`).join("")}</div>`;
  }
  showModal(`<h2>🎁 Gift for the ${R.name}</h2>
    <p>Choose <b>${P.need}</b> ${P.kind === "dna" ? "DNA samples" : "paintings"} to send: <b>${got} / ${P.need}</b> chosen.</p>
    ${P.kind === "art" ? `<p class="muted">Paintings you give away leave your collection (they count as sold for 🏆 achievements).</p>` : `<p class="muted">Samples refill over time in the Gene Splicer.</p>`}
    ${body}
    <div class="row" style="justify-content:center;gap:10px;margin-top:10px"><button class="btn big" data-spg="send" ${got === P.need ? "" : "disabled"}>🚀 Send</button><button class="btn ghost" data-modal="close">Cancel</button></div>`);
  $("modalBox").classList.add("wide");
}
$("modal").addEventListener("click", (e) => {
  if (!spPick) return;
  const d = e.target.closest("[data-spd]");
  if (d) { const n = d.dataset.spd; spPick.sel[n] = Math.max(0, (spPick.sel[n] || 0) + Number(d.dataset.d)); if (!spPick.sel[n]) delete spPick.sel[n]; return spRenderPick(); }
  if (e.target.closest("[data-spauto]")) {   // 🧬 take from the fullest samples first
    const dna = state.genetics.dna, sel = spPick.sel = {};
    let left = spPick.need;
    while (left > 0) {
      const n = state.genetics.known.filter(x => (dna[x] || 0) - (sel[x] || 0) > 0).sort((a, b) => ((dna[b] || 0) - (sel[b] || 0)) - ((dna[a] || 0) - (sel[a] || 0)))[0];
      if (!n) break; sel[n] = (sel[n] || 0) + 1; left--;
    }
    return spRenderPick();
  }
  const a = e.target.closest("[data-spa]");
  if (a) { const id = Number(a.dataset.spa), s = spPick.sel;
    if (s.includes(id)) s.splice(s.indexOf(id), 1); else if (s.length < spPick.need) s.push(id);
    return spRenderPick(); }
  if (e.target.closest('[data-spg="send"]')) {
    const P = spPick; spPick = null;
    if (spSendGift(P.k, P.sel)) hideModal(); else { hideModal(); showNotice("❌ The gift couldn't be sent."); }
  }
  if (e.target.closest('[data-modal="close"]')) spPick = null;
});

/* ----- 🔘 clicks ----- */
document.addEventListener("click", (e) => {
  const tab = e.target.closest("[data-logipage]");
  if (tab) { state.logiPage = tab.dataset.logipage; spApplyPage(); save(); return; }
  if (!e.target.closest("#spaceView")) return;
  const node = e.target.closest("[data-sp]");
  if (node) { spSel = SP.sel = node.dataset.sp; renderSpace(); return; }
  const x = e.target.closest("[data-spx]");
  if (!x || isPaused()) return;
  if (x.dataset.spx === "explore") spExplore(spSel);
  if (x.dataset.spx === "sos") spSosHelp();
  if (x.dataset.spx === "route") spRouteStart(spSel);
  if (x.dataset.spx === "rstop" || x.dataset.spx === "rgo") { const rt = spRouteOf(spSel); if (rt) { rt.stop = x.dataset.spx === "rstop"; save(); renderSpace(); } }
  if (x.dataset.spx === "sell" || x.dataset.spx === "sellall") spSell(x.dataset.g, x.dataset.spx === "sellall");
  if (x.dataset.spx === "gift") spOpenGift(spSel);
  if (x.dataset.spx === "reroll") {
    const r = SP.races[spSel];
    if (!r || !r.req || (r.rerollAt || 0) > Date.now()) return;
    r.rerollAt = Date.now() + SP_REROLL; spMakeReq(spSel, r.req.kind); save(); renderSpace();
  }
});

/* ----- 🌍 / 🌌 the two Logistics pages ----- */
function spApplyPage() {
  const space = spPageOn();
  $("logisticsView").classList.toggle("spaceMode", space);
  $("spaceView").hidden = !space;
  document.querySelectorAll("[data-logipage]").forEach(b => b.classList.toggle("active", b.dataset.logipage === (space ? state.logiPage : "earth")));
  spRefreshWarn();
  if (space) renderSpace();
}
(function spSetup() {
  const view = $("logisticsView");
  if (!$("logiTabs")) {   // left-side page menu (like Investing): everything after the lock card moves into the main column
    const layout = document.createElement("div"); layout.className = "subLayout"; layout.id = "logiLayout";
    layout.innerHTML = `<nav class="subNav" id="logiTabs"><button class="subTab" data-logipage="earth"><img class="ico" src="assets/icons/ico-lg-earth.webp" alt="">Earth</button><button class="subTab" data-logipage="space"><img class="ico" src="assets/icons/ico-lg-space.webp" alt="">Space</button><button class="subTab subSub" data-logipage="market"><img class="ico" src="assets/icons/ico-lg-market.webp" alt="">Market</button></nav><div class="subMain" id="logiMain"></div>`;
    const main = layout.querySelector("#logiMain");
    [...view.children].filter(el => !el.classList.contains("debtBanner") && el.id !== "logiLocked").forEach(el => main.appendChild(el));
    const sv = document.createElement("div"); sv.id = "spaceView"; sv.hidden = true; main.appendChild(sv);
    view.appendChild(layout);
  }
  spApplyPage();
})();
// showView() renders the page when Logistics opens
const spShowViewOrig = showView;
showView = function (v) { spShowViewOrig(v); if (v === "logistics") spApplyPage(); };
setInterval(() => {
  if (spSci().space && !SP.unlocked) { SP.unlocked = true; save(); showNotice("🌌 New in 🚢 Logistics: <b>Space</b>! Explore the galaxy and meet alien races."); spApplyPage(); }
  spProcess(); spSosTick(); spAnimate();
}, 1000);
spProcess();
