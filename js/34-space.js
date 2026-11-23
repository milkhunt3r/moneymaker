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
// 🔭 out of range for now (a later update)
const SP_FAR = { mystic: [13, 13], machine: [87, 13], ancient: [70, 82] };
const SP_GOODS = {
  crystal: { name: "Star Crystals", emoji: "💠" }, vgold: { name: "Void Gold", emoji: "🪙" }, core: { name: "Nebula Cores", emoji: "🔮" },
  silk: { name: "Living Silk", emoji: "🧵" }, pearl: { name: "Echo Pearls", emoji: "🫧" }, chart: { name: "Pirate Charts", emoji: "🗺️" },
};
const SP_LEVELS = [
  { name: "Unknown", pts: 0, icon: "❔" }, { name: "Contacted", pts: 0, icon: "🤝" }, { name: "Acquainted", pts: 300, icon: "🙂" },
  { name: "Friendly", pts: 1000, icon: "😊" }, { name: "Trusted", pts: 2500, icon: "💛" }, { name: "Allies", pts: 5000, icon: "💖" },
];
const SP_KINDS = { money: "💰 Money", ore: "⛏️ Ore", dna: "🧬 DNA samples", art: "🖼️ Paintings", dust: "✨ Stardust" };
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
const spShips = () => SP_SLOTS.reduce((a, [k, n]) => a + (spSci()[k] ? n : 0), 0);
const spFree = () => Math.max(0, spShips() - SP.trips.length);
const spRouteOf = (k) => SP.trips.find(tr => tr.to === k && tr.k === "route");
const spRouteMs = (k) => spMs(k) * SP_ROUTE_SPEED[Math.max(SP_ROUTE_LV, spLevel(k))];
const spOpen = () => !!(SP.unlocked || spSci().space);
const spLevel = (k) => { const r = SP.races[k]; if (!r.found) return 0; let L = 1; SP_LEVELS.forEach((l, i) => { if (i >= 2 && r.pts >= l.pts) L = i; }); return L; };
const spVisible = (k) => !SP_RACES[k].via || spLevel(SP_RACES[k].via) >= 2;
const spTripTo = (k, kind) => SP.trips.find(tr => tr.to === k && (!kind || tr.k === kind));
const spMs = (k) => SP_RACES[k].min * 60e3;   // one way
const spClock = (ms) => { const s = Math.max(0, Math.ceil(ms / 1000)), h = Math.floor(s / 3600), m = Math.floor(s % 3600 / 60);
  return h ? `${h}:${String(m).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}` : `${m}:${String(s % 60).padStart(2, "0")}`; };
const spGood = (g, n) => `${SP_GOODS[g].emoji} ${n != null ? `<b>${n}</b> ` : ""}${SP_GOODS[g].name}`;

/* ----- 🎁 what can be asked for: only kinds you can already get somewhere ----- */
const spKindOpen = {
  money: () => true,
  ore: () => !!(state.mine && ((state.mine.runs || 0) > 0 || Object.values(state.mine.vault || {}).some(n => n > 0))),
  dna: () => !!(state.genetics && state.genetics.unlocked),
  art: () => !!(state.art && state.art.unlocked),
  dust: () => !!(state.shooter && state.shooter.unlocked),
};
const spKindName = (kind) => kind === "dna" && !spKindOpen.dna() ? "❓ Something you haven't discovered yet" : SP_KINDS[kind];
function spRound(n) { if (n < 100) return Math.round(n); const p = Math.pow(10, Math.floor(Math.log10(n)) - 1); return Math.round(n / p) * p; }
function spMakeReq(k, skip) {
  const R = SP_RACES[k], L = Math.max(1, spLevel(k));
  let opts = R.wants.filter(w => spKindOpen[w]() && w !== skip);
  if (!opts.length) opts = R.wants.filter(w => spKindOpen[w]());
  if (!opts.length) opts = ["money"];
  const kind = opts.length > 1 ? (Math.random() < 0.65 ? opts[0] : opts[1]) : opts[0];
  const q = { kind, fav: kind === R.wants[0], until: Date.now() + SP_REQ_LIFE };
  if (kind === "money") q.amount = Math.max(1e6, spRound(mineBase() * 60 * (20 + 10 * L)));   // 30–70 minutes of business income
  if (kind === "dust") q.amount = 600 + 300 * L;
  if (kind === "dna") q.amount = 8 + Math.floor(Math.random() * 3);   // 8–10 samples, you choose which
  if (kind === "art") q.amount = 3 + Math.floor(Math.random() * 2);   // 3–4 paintings, you choose which
  if (kind === "ore") {
    const tier = SP_ORE_TIERS[L].slice().sort(() => Math.random() - 0.5).slice(0, 2);
    q.ore = {}; tier.forEach(o => { q.ore[o] = Math.max(1, Math.round(SP_ORE_BASE[o] * (1 + 0.25 * (L - 1)) * (0.8 + Math.random() * 0.4))); });
  }
  SP.races[k].req = q;
}
const spReqText = (q) => q.kind === "money" ? `💰 <b>${fmt(q.amount)}</b>`
  : q.kind === "dust" ? `✨ <b>${q.amount.toLocaleString()}</b> stardust`
  : q.kind === "dna" ? `🧬 <b>${q.amount}</b> DNA samples (you choose which)`
  : q.kind === "art" ? `🖼️ <b>${q.amount}</b> paintings (you choose which)`
  : Object.entries(q.ore).map(([o, n]) => `${typeof oreIcon === "function" ? oreIcon(o) : ""} <b>${n}</b> ${ORES[o].name}`).join(" + ");
function spCanPay(q) {
  if (q.kind === "money") return state.money >= q.amount;
  if (q.kind === "dust") return ((state.shooter || {}).dust || 0) >= q.amount;
  if (q.kind === "ore") return Object.entries(q.ore).every(([o, n]) => ((state.mine.vault || {})[o] || 0) >= n);
  if (q.kind === "dna") return Object.values(state.genetics.dna || {}).reduce((a, b) => a + b, 0) >= q.amount;
  if (q.kind === "art") return (state.art.items || []).length >= q.amount;
  return false;
}
const spReturnGoods = (L) => 2 + L;

/* ----- 🚀 trips ----- */
function spLaunch(k, kind, cargo) {
  const now = Date.now(), ms = spMs(k);
  SP.trips.push({ id: SP.nextId++, k: kind, to: k, t0: now, t1: now + ms, t2: now + 2 * ms, cargo });
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
  SP.trips.push({ id: SP.nextId++, k: "route", to: k, t0: now, t1: now + ms, t2: now + 2 * ms, got: 0, loops: 0 });
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
  spLaunch(k, "gift", { kind: q.kind, fav: q.fav, text: what });
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
    if (tr.k === "route") {   // 🛣️ loops on its own (catches up on every trip made while the game was closed)
      if (!tr.arrived && now >= tr.t1) tr.arrived = true;
      let n = 0;
      while (now >= tr.t2 && n < 500) {
        n++; changed = true;
        const got = SP_ROUTE_GOODS[Math.max(SP_ROUTE_LV, spLevel(tr.to))];
        SP.goods[R.good] = (SP.goods[R.good] || 0) + got; SP.stats.goods += got; tr.got = (tr.got || 0) + got; tr.loops = (tr.loops || 0) + 1;
        SP.stats.routeTrips = (SP.stats.routeTrips || 0) + 1;
        if (typeof addLogiXp === "function") addLogiXp("ship", (tr.t2 - tr.t0) / 1000);
        if (tr.stop || SP.trips.length > spShips()) { tr.done = true; msgs.push(`🛣️ The trade route to the ${R.name} has stopped. Your ship is home.`); break; }
        const ms = spRouteMs(tr.to); tr.t0 = tr.t2; tr.t1 = tr.t0 + ms; tr.t2 = tr.t0 + 2 * ms; tr.arrived = now >= tr.t1;
      }
      continue;
    }
    if (!tr.arrived && now >= tr.t1) {
      tr.arrived = true; changed = true;
      if (tr.k === "explore" && !r.found) {
        r.found = true; r.foundAt = now; SP.stats.explored++;
        tr.goods = 3; spMakeReq(tr.to);
        msgs.push(`👽 First contact! Your ship met the <b>${R.name}</b> (${R.title}). See 🚢 Logistics → 🌌 Space.`);
      } else if (tr.k === "gift") {
        const before = spLevel(tr.to);
        r.pts += tr.cargo.fav ? SP_FAV_PTS : SP_PTS; r.gifts = (r.gifts || 0) + 1; SP.stats.gifts++;
        const after = spLevel(tr.to);
        tr.goods = spReturnGoods(after) + (after > before ? 5 * after : 0);
        spMakeReq(tr.to);
        if (after > before) msgs.push(`${SP_LEVELS[after].icon} The <b>${R.name}</b> are now <b>${SP_LEVELS[after].name}</b>! They load a thank-you gift on your ship.`);
        else msgs.push(`🎁 The <b>${R.name}</b> loved your gift: +${tr.cargo.fav ? SP_FAV_PTS : SP_PTS} friendship.`);
        // a far system's location is shared once you are Acquainted
        if (before < 2 && after >= 2) Object.entries(SP_RACES).filter(([, x]) => x.via === tr.to).forEach(([, x]) =>
          msgs.push(`📡 The ${R.name} told you where to find a new system. Send a ship to explore it!`));
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
    if (r.found && !spTripTo(k, "gift") && (!r.req || now > r.req.until)) { spMakeReq(k, r.req && r.req.kind); changed = true; }
  }
  if (msgs.length > 3) showNotice(`🌌 Space: ${msgs.length} updates while you were away. See 🚢 Logistics → 🌌 Space.`);
  else msgs.forEach(m => showNotice(m));
  if (changed) { save(); if (spShown()) renderSpace(); }
}

/* ----- 🖼️ page ----- */
const spPageOn = () => state.logiPage === "space" || state.logiPage === "market";
const spShown = () => state.view === "logistics" && spPageOn() && !$("logisticsView").hidden;
function spShipPos(tr, now) {
  const [x, y] = SP_RACES[tr.to].pos;
  const out = now < tr.t1, p = out ? (now - tr.t0) / (tr.t1 - tr.t0) : Math.min(1, (now - tr.t1) / (tr.t2 - tr.t1));
  const a = out ? [50, 50] : [x, y], b = out ? [x, y] : [50, 50];
  const map = document.querySelector(".spMap"), asp = map && map.clientHeight ? map.clientWidth / map.clientHeight : 16 / 9;
  const ang = Math.atan2(b[1] - a[1], (b[0] - a[0]) * asp) * 180 / Math.PI;
  return { x: a[0] + (b[0] - a[0]) * Math.max(0, p), y: a[1] + (b[1] - a[1]) * Math.max(0, p), ang };
}
function spMapHtml() {
  const now = Date.now();
  const lines = Object.entries(SP_RACES).filter(([k]) => spVisible(k)).map(([k, R]) => {
    const busy = spTripTo(k);
    return `<line x1="80" y1="45" x2="${R.pos[0] * 1.6}" y2="${R.pos[1] * 0.9}" class="${spRouteOf(k) ? "route" : busy ? "busy" : SP.races[k].found ? "known" : ""}"/>`; }).join("");
  const nodes = Object.entries(SP_RACES).map(([k, R]) => {
    const r = SP.races[k], vis = spVisible(k), L = spLevel(k);
    const img = r.found ? `sys-${k}` : "sys-unknown";
    const lbl = r.found ? `${R.name}<small>${SP_LEVELS[L].icon} ${SP_LEVELS[L].name}</small>` : vis ? `Unknown signal<small>❓ Explore</small>` : `<small>🔒 Uncharted</small>`;
    return `<button class="spNode ${r.found ? "found" : vis ? "fog" : "hidden"} ${spSel === k ? "sel" : ""}" data-sp="${k}" style="left:${R.pos[0]}%;top:${R.pos[1]}%">
      <img src="assets/space/${img}.webp" alt=""><span class="spLbl">${lbl}</span>${SP.sos && SP.sos.k === k ? `<i class="spSosPin">🆘</i>` : ""}${r.found && r.req && spFree() && !spTripTo(k, "gift") && spCanPay(r.req) ? `<i class="spPing">🎁</i>` : ""}</button>`; }).join("");
  const far = Object.entries(SP_FAR).map(([k, p]) => `<div class="spNode far" style="left:${p[0]}%;top:${p[1]}%"><img src="assets/space/sys-unknown.webp" alt=""><span class="spLbl"><small>🔭 Out of range</small></span></div>`).join("");
  const ships = SP.trips.map(tr => { const s = spShipPos(tr, now);
    return `<img class="spShip" data-trip="${tr.id}" src="assets/space/ship-explorer.webp" alt="" style="left:${s.x}%;top:${s.y}%;transform:translate(-50%,-50%) rotate(${s.ang}deg)${Math.abs(s.ang) > 90 ? " scaleY(-1)" : ""}">`; }).join("");
  return `<div class="spMap"><svg viewBox="0 0 160 90" preserveAspectRatio="none">${lines}</svg>${far}
    <button class="spNode sol ${spSel === "sol" ? "sel" : ""}" data-sp="sol" style="left:50%;top:50%"><img src="assets/space/sys-sol.webp" alt=""><span class="spLbl">Home<small>🌍 Solar System</small></span></button>
    ${nodes}${ships}</div>`;
}
function spTripLine(tr) {
  const R = SP_RACES[tr.to], now = Date.now();
  const what = tr.k === "explore" ? (SP.races[tr.to].found ? `Exploring: ${R.name}` : "Exploring an unknown system") : tr.k === "route" ? `🛣️ Trade route: ${R.name}` : `🎁 Gift for the ${R.name}`;
  const st = now < tr.t1 ? `arrives in <b data-spt="${tr.t1}">${spClock(tr.t1 - now)}</b>` : `coming home, back in <b data-spt="${tr.t2}">${spClock(tr.t2 - now)}</b>`;
  return `<div class="spTrip">🚀 ${what} · ${st}</div>`;
}
function spPanelHtml() {
  if (spSel === "sol") {
    const ships = spShips(), slots = SP_SLOTS.map(([k, n, name]) => {
      const has = !!spSci()[k], secret = k !== "space" && !has;
      return `<li>${has ? "✅" : "🔒"} ${secret ? "A hidden building" : name}: <b>+${n}</b> ship${n > 1 ? "s" : ""}</li>`; }).join("");
    return `<h3>🌍 Home: the Solar System</h3>
      <p>Your spaceport. Pick a system on the map to explore it or send gifts. Ships keep flying while the game is closed.</p>
      <div class="spStats"><span>🚀 Ships: <b>${SP.trips.length} / ${ships}</b> busy</span><span>👽 Races met: <b>${Object.values(SP.races).filter(r => r.found).length} / ${Object.keys(SP_RACES).length}</b></span><span>🎁 Gifts delivered: <b>${SP.stats.gifts}</b></span></div>
      ${ships ? "" : `<p class="spWarn">⚠️ You have no ships right now. Build the 🚀 Space Mission Center (💰 Income → 🔬 Science) to get your first one back.</p>`}
      <ul class="spSlots">${slots}</ul>
      ${SP.trips.length ? `<h4>Ships in flight</h4>${SP.trips.map(spTripLine).join("")}` : ""}`;
  }
  const R = SP_RACES[spSel], r = SP.races[spSel], L = spLevel(spSel), trip = spTripTo(spSel, r.found ? "gift" : null);
  if (!spVisible(spSel)) return `<h3>🔒 Uncharted system</h3><p>Your scanners can't find this system yet. Become <b>Acquainted</b> with ${SP.races[R.via].found ? `the <b>${SP_RACES[R.via].name}</b>` : "a nearby race"} and they will tell you where it is.</p>`;
  if (!r.found) return `<h3>❓ Unknown signal</h3>
    <p>Something is out there. Send a ship to explore it: <b>${R.min} min</b> there and <b>${R.min} min</b> back.</p>
    ${trip ? spTripLine(trip) : `<button class="btn big" data-spx="explore" ${spFree() && spSci2() >= SP_EXPLORE_SCI ? "" : "disabled"}>🚀 Explore · 🔬 ${SP_EXPLORE_SCI} scientists</button>
      ${!spFree() ? `<div class="muted">All your ships are busy.</div>` : spSci2() < SP_EXPLORE_SCI ? `<div class="muted">You need ${SP_EXPLORE_SCI} scientists (you have ${spSci2()}).</div>` : ""}`}`;
  const next = SP_LEVELS[L + 1], pct = next ? Math.min(100, (r.pts - SP_LEVELS[L].pts) / (next.pts - SP_LEVELS[L].pts) * 100) : 100;
  const q = r.req, can = q && spCanPay(q);
  const rerollLeft = (r.rerollAt || 0) - Date.now();
  return `<div class="spRace"><div class="spFace">${R.emoji}</div><div>
      <h3>${R.name} <span class="muted">· ${R.title}</span></h3><p class="spBio">${R.bio}</p></div></div>
    <div class="spFriend"><b>${SP_LEVELS[L].icon} ${SP_LEVELS[L].name}</b> <span class="muted">${next ? `${r.pts.toLocaleString()} / ${next.pts.toLocaleString()} friendship to ${next.name}` : `${r.pts.toLocaleString()} friendship · best friends!`}</span>
      <div class="xpBar"><div class="xpFill" style="width:${pct}%"></div></div></div>
    <div class="spInfo"><div>❤️ <b>Favourite:</b> ${spKindName(R.wants[0])} <span class="muted">(+${SP_FAV_PTS} friendship)</span></div>
      <div>👍 <b>Also likes:</b> ${spKindName(R.wants[1])} <span class="muted">(+${SP_PTS})</span></div>
      <div>📦 <b>They send back:</b> ${spGood(R.good)} <span class="muted">(${spReturnGoods(L)} per gift, more when you level up)</span></div>
      <div>🛣️ <b>Distance:</b> ${R.min} min each way</div></div>
    ${trip ? spTripLine(trip) : q ? `<div class="spReq"><div><b>📜 Their request:</b> ${spReqText(q)}</div>
        <div class="muted">+${q.fav ? SP_FAV_PTS : SP_PTS} friendship${q.fav ? " (their favourite!)" : ""} · a new request in <span data-spt="${q.until}">${spClock(q.until - Date.now())}</span></div>
        <div class="spBtns"><button class="btn big" data-spx="gift" ${can && spFree() ? "" : "disabled"}>🎁 Send gift</button>
          <button class="btn ghost" data-spx="reroll" ${rerollLeft > 0 ? "disabled" : ""}>🔄 Ask for something else${rerollLeft > 0 ? ` (${spClock(rerollLeft)})` : ""}</button></div>
        ${!spFree() ? `<div class="muted">All your ships are busy.</div>` : !can ? `<div class="muted">You don't have enough for this gift yet.</div>` : ""}</div>` : ""}
    ${spRouteHtml(spSel)}`;
}
function spRouteHtml(k) {
  const R = SP_RACES[k], L = spLevel(k), rt = spRouteOf(k);
  if (L < SP_ROUTE_LV) return `<div class="spRoute locked">🛣️ <b>Trade route:</b> opens when you are <b>😊 Friendly</b> with the ${R.name}.</div>`;
  const goods = SP_ROUTE_GOODS[L], mins = Math.round(spRouteMs(k) * 2 / 60e3);
  if (rt) return `<div class="spRoute on"><div>🛣️ <b>Trade route open</b> · ${SP_GOODS[R.good].emoji} <b>${goods}</b> ${SP_GOODS[R.good].name} every trip (${mins} min round trip)</div>
    ${spTripLine(rt)}<div class="muted">Trips so far: ${rt.loops || 0} · goods brought home: ${(rt.got || 0).toLocaleString()}</div>
    <div class="spBtns">${rt.stop ? `<span class="muted">⏹️ Stops when the ship gets home.</span> <button class="btn ghost small" data-spx="rgo">▶ Keep it running</button>` : `<button class="btn ghost" data-spx="rstop">⏹️ Stop the route</button>`}</div></div>`;
  return `<div class="spRoute"><div>🛣️ <b>Trade route:</b> one ship flies to the ${R.name} and back <b>for good</b>, bringing ${SP_GOODS[R.good].emoji} <b>${goods}</b> ${SP_GOODS[R.good].name} every trip (${mins} min round trip). It keeps going while the game is closed.</div>
    <div class="muted">More goods and faster trips at 💛 Trusted and 💖 Allies.</div>
    <div class="spBtns"><button class="btn big" data-spx="route" ${spFree() ? "" : "disabled"}>🛣️ Open trade route</button></div>${spFree() ? "" : `<div class="muted">All your ships are busy.</div>`}</div>`;
}
function spGoodsHtml() {
  const have = Object.keys(SP_GOODS).filter(g => SP.goods[g]);
  return `<h3>📦 Alien goods</h3>${have.length ? `<div class="spGoods">${have.map(g => `<span>${spGood(g, SP.goods[g])}</span>`).join("")}</div>`
    : `<p class="muted">Nothing yet. Races send their goods back with your ships.</p>`}
    <p class="muted">🏪 Sell them in 🌌 Space → Market. 🔜 Coming soon: trading them with other races.</p>`;
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
    <div class="spResRow"><span class="spResLbl">Space resources (from aliens):</span>${goods.length ? goods.map(g => it(SP_GOODS[g].emoji, SP.goods[g].toLocaleString(), SP_GOODS[g].name)).join("") : `<span class="muted">none yet</span>`}</div>`;
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
  if (sb) { const html = (spOpen() ? "" : '<img class="ico lockS" src="assets/icons/ico-lock.webp" alt="">') + "🌌 Space" + (SP.sos ? ' <span class="tabWarn" title="Alien emergency">!</span>' : "");
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
const spPrice = (g, slot = spSlot()) => Math.max(1, Math.round(spBase(g) * spMult(g, slot)));
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
    return `<tr><td>${SP_GOODS[g].emoji} <b>${SP_GOODS[g].name}</b><div class="muted">from the ${R.name}</div></td><td><b>${have.toLocaleString()}</b></td>
      <td><b>${fmt(p)}</b><div class="${ch >= 0 ? "up" : "down"}">${ch >= 0 ? "▲" : "▼"} ${Math.abs(ch).toFixed(0)}%</div></td><td>${spSpark(g)}</td>
      <td class="spMkSell"><input type="number" min="1" max="${have}" value="${q}" data-spq="${g}" ${have ? "" : "disabled"}>
        <button class="btn small" data-spx="sell" data-g="${g}" ${have ? "" : "disabled"}>Sell</button>
        <button class="btn ghost small" data-spx="sellall" data-g="${g}" ${have ? "" : "disabled"}>Sell all${have ? ` (${fmt(have * p)})` : ""}</button></td></tr>`;
  }).join("");
  return `<div class="card spResBar" id="spResBar">${spResHtml()}</div>
    <div class="card"><div class="row"><h2 style="margin:0">🏪 Alien market</h2><span class="muted">⏱️ Prices change in <b data-spt="${next}">${spClock(next - Date.now())}</b></span></div>
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
    const s = spShipPos(tr, now);
    el.style.left = s.x + "%"; el.style.top = s.y + "%";
    el.style.transform = `translate(-50%,-50%) rotate(${s.ang}deg)${Math.abs(s.ang) > 90 ? " scaleY(-1)" : ""}`;
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
    layout.innerHTML = `<nav class="subNav" id="logiTabs"><button class="subTab" data-logipage="earth">🌍 Earth</button><button class="subTab" data-logipage="space">🌌 Space</button><button class="subTab subSub" data-logipage="market">🏪 Market</button></nav><div class="subMain" id="logiMain"></div>`;
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
