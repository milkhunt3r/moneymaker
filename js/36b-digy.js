/* Empire of Coins © 2026 milkhunt3r. All rights reserved. */
/* =====================================================================
   🤖 DIGY, the mining robot pet (the digging logic is in js/23-minigames.js: digyAdvance).
   · Bought from the 🗿 Kragg (Space Logistics) once they are 😊 Friendly: 💎 50 diamonds + 🔴 10 rubies from your 🏦 vault.
   · Lives at the top of the ⛏️ Gold Mine Dig page: his charging dock on the left, his digging spot on the right.
   · His battery is your mine energy: when it's full he wakes up, walks to his spot and digs for 30 seconds
     (3 energy), comes out dirty with a haul for your vault, cleans himself and goes back to charge.
   · Active / Resting switch and renaming on the 🐾 Pets page.
   ===================================================================== */
const DIGY_V = "3";   // bump when a Digy picture changes (browser cache)
const DIGY_PRICE = { diamond: 50, ruby: 10 }, DIGY_LV = 3;   // 😊 Friendly with the Kragg
const DIGY_FRAMES = ["idle-1", "idle-2", "walk-1", "walk-2", "walk-3", "walk-4", "dig-start", "dig-1", "dig-2", "dig-deep", "emerge", "dirty",
  "clean-1", "clean-2", "clean-3", "charge-low-1", "charge-low-2", "charge-mid", "charge-full", "wake", "happy", "petted", "annoyed"];
const digySrc = (f) => `assets/digy/digy-${f}.webp?v=${DIGY_V}`;
const digyOn = () => digyOwned() && !state.digy.off;
// 🖼️ the painted icons: the in-game pet icon, and the mine's own ore / energy / vault pictures
const digyIco = () => `<img class="digyPetIco" src="assets/icons/tab-pet.webp" alt="">`;
const digyOres = (list) => Object.keys(list).map(k => `<span class="digyOre">${oreIcon(k)}<b>${list[k]}</b></span>`).join("");
const digyHaulHtml = () => `<span class="digyOres">${digyOres(DIGY_HAUL)}</span>`;
if (digyOwned()) { const D = state.digy; D.hauls = D.hauls || 0; D.ores = D.ores || {}; }

/* ----- 🗿 the offer in the Kragg panel (Space Logistics) ----- */
function digyOfferHtml(k) {
  if (k !== "rock" || digyOwned()) return "";
  const L = spLevel("rock"), V = (state.mine && state.mine.vault) || {};
  const can = Object.keys(DIGY_PRICE).every(o => (V[o] || 0) >= DIGY_PRICE[o]);
  return `<div class="pipOffer ${L >= DIGY_LV ? "" : "locked"}"><img src="${digySrc("idle-2")}" alt="">
    <div><b>${digyIco()}<span>A digging robot for your mine</span></b>
      <div data-noi18n>${L >= DIGY_LV ? (LANG === "es" ? `Los Kragg han construido un pequeño robot minero, <b>Digy</b>. Cuando la energía de tu mina ${mnIco("energy")} está llena, excava por ti y lleva un botín de mineral a tu cámara ${mnIco("vault")}.`
          : `The Kragg built a little mining robot, <b>Digy</b>. When your mine energy ${mnIco("energy")} is full, he digs for you and brings a haul of ore to your vault ${mnIco("vault")}.`)
        : (LANG === "es" ? `Hazte <b>😊 amigo</b> de los Kragg y puede que te vendan uno de sus pequeños robots mineros.` : `Become <b>😊 Friendly</b> with the Kragg and they may sell you one of their little mining robots.`)}</div>
      ${L >= DIGY_LV ? `<button class="btn" data-digy="buy" ${can ? "" : "disabled"}>${digyIco()}<span>Get Digy</span> · <span class="digyOres">${digyOres(DIGY_PRICE)}</span></button>
        ${can ? "" : `<div class="muted digyHave">${mnIco("vault")}<span class="digyOres">${Object.keys(DIGY_PRICE).map(o => `<span class="digyOre">${oreIcon(o)}<b>${V[o] || 0} / ${DIGY_PRICE[o]}</b></span>`).join("")}</span></div>`}` : ""}</div></div>`;
}
function digyBuy() {
  if (digyOwned() || typeof spLevel !== "function" || spLevel("rock") < DIGY_LV || !state.mine) return;
  const V = state.mine.vault || {};
  if (!Object.keys(DIGY_PRICE).every(o => (V[o] || 0) >= DIGY_PRICE[o])) return;
  for (const o in DIGY_PRICE) V[o] -= DIGY_PRICE[o];
  state.digy = { owned: true, name: "Digy", at: Date.now(), hauls: 0, ores: {}, seen: Date.now(), pets: 0 };
  save();
  showModal(`<div style="text-align:center"><img src="${digySrc("charge-full")}" alt="" style="width:180px;height:180px;object-fit:contain">
    <h2>${digyIco()}<span>Digy joined you!</span></h2>
    <p data-noi18n>${LANG === "es" ? `Ha instalado su base de carga arriba en la página de ⛏️ Excavación en la mina de oro. Cada vez que la energía de la mina está llena, usa ${mnIco("energy")} 3 de energía, excava durante 30 segundos y lleva este botín a tu cámara ${mnIco("vault")}:`
      : `He set up his charging dock at the top of the ⛏️ Gold Mine Dig page. Every time your mine energy is full, he uses ${mnIco("energy")} 3 energy, digs for 30 seconds and brings this haul to your vault ${mnIco("vault")}:`}</p>
    <div class="digyHaulBox">${digyHaulHtml()}</div>
    <p class="muted">He never digs while you're in a run, and he keeps working while the game is closed (up to 24 hours).</p>
    <div class="row" style="justify-content:center;gap:10px"><button class="btn big" data-digy="visit">⛏️ Go and see him</button><button class="btn ghost" data-modal="close">Later</button></div></div>`);
  if (typeof renderSpace === "function" && state.view === "logistics") renderSpace();
}

/* ----- 🔋 status (his battery is your mine energy) ----- */
function digyFullIn() {   // ms until the energy is full again
  const M = state.mine, max = energyMax();
  if (!M.regenAt || M.energy >= max) return 0;
  return Math.max(0, M.regenAt - Date.now()) + (max - M.energy - 1) * regenMs();
}
const digyBattery = () => Math.max(0, Math.min(100, Math.round(100 * state.mine.energy / energyMax())));
function digyStatus() {
  const es = LANG === "es", M = state.mine, D = state.digy, now = Date.now();
  if (D.off) return es ? "💤 <b>Descansando.</b> Apagado: no excava." : "💤 <b>Resting.</b> Turned off: he doesn't dig.";
  if (D.dig) return es ? `⛏️ <b>Excavando</b> · listo en <b>${clockMs(D.dig.end - now)}</b>` : `⛏️ <b>Digging</b> · done in <b>${clockMs(D.dig.end - now)}</b>`;
  if (M.run || M.pending) return es ? `⏸️ <b>Esperando.</b> Estás jugando en la mina: excavará cuando termines.` : `⏸️ <b>Waiting.</b> You're playing the mine: he digs once you're done.`;
  const pct = digyBattery(), full = digyFullIn();
  return es ? `🔋 <b>Cargando ${pct}%</b>${full ? ` · excava cuando la energía esté llena, en <b>${clockMs(full)}</b>` : ""}`
    : `🔋 <b>Charging ${pct}%</b>${full ? ` · digs when your energy is full, in <b>${clockMs(full)}</b>` : ""}`;
}
// one line on the 🎮 Mini-games hub card
function digyHubLine() {
  if (!digyOwned()) return "";
  const D = state.digy, es = LANG === "es", now = Date.now();
  const t = D.off ? (es ? "descansando" : "resting") : D.dig ? (es ? `⛏️ excavando ${clockMs(D.dig.end - now)}` : `⛏️ digging ${clockMs(D.dig.end - now)}`)
    : (es ? `🔋 cargando ${digyBattery()}%` : `🔋 charging ${digyBattery()}%`);
  return `<div class="gameStatus digyHub" data-noi18n>${digyIco()}${digyName()}: <span id="digyHubT">${t}</span></div>`;
}

/* ----- 🎬 his corner on the Gold Mine Dig page ----- */
const DIGY_DOCK = 3, DIGY_HOLE = 60, DIGY_OUT = 42;   // left edge of the sprite, in % of the stage
const DG = { built: false, frame: "", x: -1, flip: null, react: null, streak: 0, lastPet: 0 };
DIGY_FRAMES.forEach(f => { const im = new Image(); im.src = digySrc(f); });
const lerp = (a, b, k) => a + (b - a) * Math.max(0, Math.min(1, k));
// what he does right now: { f: frame, x: %, flip, dock: show the empty dock, hole, dirt }
function digyPose(now) {
  const base = digyBasePose(now), R = DG.react;
  if (R && now < R.until) return { ...base, f: R.f, flip: false, dock: 1, hole: base.hole || !!state.digy.dig };   // ❤️ / 😤 a reaction on top of whatever he's doing (off the dock / out of his hole)
  DG.react = null;
  return base;
}
function digyBasePose(now) {
  const D = state.digy, walk = () => "walk-" + (1 + Math.floor(now / 160) % 4), alt = () => (Math.floor(now / 230) % 2 ? "dig-2" : "dig-1");
  if (D.dig) {
    const e = now - D.dig.start;
    if (e < 1200) return { f: "charge-full", x: DIGY_DOCK };                                       // ⚡ full battery
    if (e < 2400) return { f: "wake", x: DIGY_DOCK, dock: 1 };                                       // 🙌 hops off and stretches
    if (e < 5000) return { f: walk(), x: lerp(DIGY_DOCK, DIGY_HOLE, (e - 2400) / 2600), dock: 1 };   // 🚶 walks to his spot
    if (e < 6500) return { f: "dig-start", x: DIGY_HOLE, dock: 1 };
    if (e < 12000) return { f: alt(), x: DIGY_HOLE, dock: 1, dirt: 1 };
    if (e < 24000) return { f: "dig-deep", x: DIGY_HOLE, dock: 1, dirt: 1 };
    if (e < 28000) return { f: alt(), x: DIGY_HOLE, dock: 1, dirt: 1 };
    return { f: "emerge", x: DIGY_HOLE, dock: 1, dirt: 1 };                                          // 🎉 out with the haul
  }
  const a = now - (D.lastHaul || 0);
  if (!D.off && a >= 0 && a < 9500) {
    if (a < 2000) return { f: "dirty", x: DIGY_OUT, dock: 1, hole: 1, dirt: 1 };
    if (a < 4000) return { f: Math.floor(now / 180) % 2 ? "clean-2" : "clean-1", x: DIGY_OUT, dock: 1, hole: 1, dirt: 1 };
    if (a < 5300) return { f: "clean-3", x: DIGY_OUT, dock: 1, hole: 1, dirt: 1 };
    if (a < 6800) return { f: "happy", x: DIGY_OUT, dock: 1, hole: 1, dirt: 1 };                             // 🎉 ta-da, all clean
    return { f: walk(), x: lerp(DIGY_OUT, DIGY_DOCK, (a - 6800) / 2700), flip: true, dock: 1, hole: 1 };   // 🚶 back to charge
  }
  const p = digyBattery();
  if (p >= 100) return { f: "charge-full", x: DIGY_DOCK };
  if (p >= 40) return { f: "charge-mid", x: DIGY_DOCK };
  return { f: Math.floor(now / 700) % 2 ? "charge-low-2" : "charge-low-1", x: DIGY_DOCK };   // 🔴 low battery blinks
}
function renderDigyCorner() {
  const el = $("digyCorner"); if (!el) return;
  el.hidden = !digyOn() || !!(state.mine && state.mine.run);
  if (el.hidden) { DG.built = false; el.innerHTML = ""; return; }
  if (!DG.built || !el.firstChild) {
    el.innerHTML = `<div class="card digyCard"><div class="digyHead"><h3 data-noi18n>${digyIco()}${digyName()}</h3><span class="digyStatus" id="digyStatus" data-noi18n></span></div>
      <div class="digyStage" id="digyStage">
        <img class="digyProp digyDock" src="assets/digy/digy-dock.webp?v=${DIGY_V}" alt="" style="left:${DIGY_DOCK}%">
        <img class="digyProp digyHole" src="assets/digy/digy-hole.webp?v=${DIGY_V}" alt="" style="left:${DIGY_HOLE}%">
        <img class="digyProp digyDirt" src="assets/digy/digy-dirt.webp?v=${DIGY_V}" alt="">
        <img class="digySprite" id="digySprite" alt="${digyName()}" draggable="false" title="${digyName()}"></div></div>`;
    DG.built = true; DG.frame = ""; DG.x = -1; DG.flip = null;
  }
  digyTick(true);
}
function digyTick(force) {
  if (!digyOwned()) return;
  const el = $("digyCorner");
  if (!el || el.hidden || !el.firstChild || (!force && (state.view !== "games" || state.gamePage !== "mine" || document.hidden))) return;
  const now = Date.now(), p = digyPose(now), sp = $("digySprite"), st = $("digyStage");
  if (!sp || !st) return;
  if (p.f !== DG.frame) { sp.src = digySrc(p.f); DG.frame = p.f; }
  if (p.x !== DG.x) { sp.style.left = p.x + "%"; DG.x = p.x; }
  if (!!p.flip !== DG.flip) { sp.classList.toggle("flip", !!p.flip); DG.flip = !!p.flip; }
  sp.classList.toggle("charging", /^charge/.test(p.f));
  st.classList.toggle("showDock", !!p.dock); st.classList.toggle("showHole", !!p.hole); st.classList.toggle("showDirt", !!p.dirt);
  const s = $("digyStatus"), h = digyStatus(); if (s && s.dataset.h !== h) { s.dataset.h = h; s.innerHTML = h; }
}
setInterval(() => digyTick(false), 120);

// every second: let him work (also when you're on another page), and keep the mine page and the hub up to date
setInterval(() => {
  if (!digyOwned()) return;
  const wasDig = !!state.digy.dig, wasE = state.mine.energy;
  digyAdvance(Date.now());
  digyAwayNotice();
  const changed = wasDig !== !!state.digy.dig || wasE !== state.mine.energy;
  if (state.view === "games") {
    if (changed && !state.mine.run && (state.gamePage === "mine" || !state.gamePage)) renderGames();
    const l = $("digyLeft"); if (l && state.digy.dig) l.textContent = clockMs(state.digy.dig.end - Date.now());
    const hub = $("digyHubT"); if (hub && !changed) { const n = digyHubLine().match(/<span id="digyHubT">(.*)<\/span>/); if (n && hub.innerHTML !== n[1]) hub.innerHTML = n[1]; }
  }
}, 1000);
// 🌙 what he did while the game was closed (told once)
function digyAwayNotice() {
  const D = state.digy; if (!D || !D.awayHauls) return;
  const n = D.awayHauls; D.awayHauls = 0; save();
  showNotice(LANG === "es" ? `🐾 Mientras no estabas, ${digyName()} excavó ${n} ${n === 1 ? "vez" : "veces"} y llevó ${n === 1 ? "su botín" : "sus botines"} a tu 🏦 cámara.`
    : `🐾 While you were away, ${digyName()} dug ${n} time${n === 1 ? "" : "s"} and brought ${n === 1 ? "his haul" : "the hauls"} to your 🏦 vault.`);
}

/* ----- ❤️ petting him (😤 poking him while he digs makes him grumpy) ----- */
function digyPoke() {
  if (!digyOn() || (typeof isPaused === "function" && isPaused())) return;
  const D = state.digy, now = Date.now();
  if (DG.react && now < DG.react.until - 600) return;   // let the reaction play for a moment
  if (D.dig && now - D.dig.start >= 5000) { DG.react = { f: "annoyed", until: now + 1600 }; D.pokes = (D.pokes || 0) + 1; DG.streak = 0; }
  else {
    DG.streak = now - DG.lastPet < 2500 ? DG.streak + 1 : 1; DG.lastPet = now;
    DG.react = { f: DG.streak >= 5 ? "happy" : "petted", until: now + (DG.streak >= 5 ? 1500 : 1300) };   // 5 pets in a row: he jumps for joy
    if (DG.streak >= 5) DG.streak = 0;
    D.pets = (D.pets || 0) + 1;
  }
  save(); digyTick(true);
}

/* ----- 🔘 clicks ----- */
document.addEventListener("click", (e) => {
  if (e.target.closest("#digySprite")) return digyPoke();
  const b = e.target.closest("[data-digy]"); if (!b) return;
  const k = b.dataset.digy;
  if (k === "buy") digyBuy();
  if (k === "visit") { hideModal(); openGame("mine"); }
  if (k === "toggle" && digyOwned()) {
    const D = state.digy; D.off = !D.off; D.seen = Date.now(); D.fullAt = null;
    if (D.off && D.dig) { D.dig = null; digyHaul(Date.now()); }   // switched off mid-dig: he finishes the haul at once (the energy is already spent)
    save(); if (state.view === "games") renderGames();
    if (typeof renderPetPage === "function") renderPetPage();
  }
});
document.addEventListener("change", (e) => {
  if (e.target.id !== "digyName" || !digyOwned()) return;
  const n = petCleanName(e.target.value);
  state.digy.name = n || "Digy"; e.target.value = state.digy.name; DG.built = false; save();
});
// his corner sits above the mine page: draw it whenever the mine page is drawn
const digyRenderMineOrig = renderMine;
renderMine = function () { digyRenderMineOrig(); renderDigyCorner(); };
if (digyOwned()) { digyAdvance(Date.now()); setTimeout(digyAwayNotice, 1500); }
