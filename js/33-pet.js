/* =====================================================================
   🐾 PET (found in the 🏴‍☠️ pirate loot box of Nebula Strike level 4, only one).
   Lives on the 💰 Income page next to the coin and runs the ⚡ energy drink for you:
   - when the energy drink is ready (and you have the money) it drinks it,
   - while the drink is active it taps the coin at the max speed (10 clicks / sec, shared with your own clicks),
   - during the drink's cooldown it sleeps, and wakes up 10 seconds before the next drink is ready.
   Its taps count as clicks (also for the click achievements). Click the pet to pet it.
   It only acts while the Income page is on screen. Settings → 🐾 Pet: show / hide and rename.
   ===================================================================== */
if (state.pet && state.pet.owned) {
  state.pet.name = typeof state.pet.name === "string" && state.pet.name.trim() ? state.pet.name.slice(0, 16) : "Mochi";
  state.pet.pets = state.pet.pets || 0; state.pet.taps = state.pet.taps || 0;
}
// 🎁 a pet won in a loot box stays a secret (no pet, no achievement) until the chest is opened.
// Nothing can still be opening after a reload, so a leftover "pending" is revealed at start-up.
function petReveal() { if (state.pet && state.pet.pending) { delete state.pet.pending; save(); } }
if (state.pet && state.pet.pending) delete state.pet.pending;
const petOwned = () => !!(state.pet && state.pet.owned && !state.pet.pending);
const PET_WAKE_BEFORE = 10;          // wakes up this many seconds before the drink is ready
const PET_TAP_MS = 100;
const PET_SLAP_MS = 650;
const PET_SLEEP_PET_MS = 1700;       // peek (0.4 s) → tail and wings wiggle (0.7 s) → content smile (0.6 s)             // one visible paw slap (the 10 clicks / sec keep running underneath)
const PET_V = "2";                   // bump when a pet picture changes (browser cache)              // one tap every 0.1 s = 10 clicks / sec
// where the feet are in each frame (part of the picture height), so every pose stands on the same line
const PET_FOOT = { "idle-1": 0.982, "idle-2": 0.982, "tap-1": 0.985, "tap-2": 0.984, "drink-1": 0.982, "drink-2": 0.982, "happy-1": 0.98, "happy-2": 0.874,
  "sleep-1": 0.869, "sleep-2": 0.868, "wake": 0.985, "walk-1": 0.909, "walk-2": 0.906, "walk-3": 0.909, "walk-4": 0.892,
  "sleep-pet-1": 0.868, "sleep-pet-2": 0.869, "sleep-pet-3": 0.868 };
Object.keys(PET_FOOT).forEach(k => { const im = new Image(); im.src = `assets/pet/${k}.webp?v=${PET_V}`; });   // preload

const P_ = { mode: "idle", x: -1, tx: 0, face: -1, t: 0, until: 0, frame: "", flip: false, next: null, raf: 0, last: 0,
  tapAcc: 0, tapOn: false, petStreak: 0, petLast: 0, layout: null, layoutAt: 0, zAt: 0, jump: 0, blinkAt: 0 };
let petEl = null, petImg = null, petLayer = null;

function petBuild() {
  if (petLayer || !$("game")) return;
  petLayer = document.createElement("div"); petLayer.id = "petLayer";
  petLayer.innerHTML = `<div id="pet" role="button" tabindex="0" data-noi18n><img alt="" draggable="false"></div>`;
  $("game").appendChild(petLayer);
  petEl = $("pet"); petImg = petEl.querySelector("img");
  petEl.addEventListener("click", petPet);
  petEl.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); petPet(); } });
}
const petSize = () => (isPhone() ? 92 : 185);
// coin and page sizes (re-measured twice a second)
function petLayout(now) {
  if (P_.layout && now - P_.layoutAt < 500) return P_.layout;
  const g = $("game").getBoundingClientRect(), c = $("coin").getBoundingClientRect(), s = petSize();
  const tapX = c.right - g.left - 18 + 0.3 * s;
  P_.layout = { s, floor: c.bottom - g.top - 2, tapX, minX: tapX, maxX: Math.max(tapX, g.width - s * 0.45 - 8), coin: c };
  P_.layoutAt = now;
  return P_.layout;
}
function petShow(frame, flip, dy = 0) {
  const L = P_.layout, s = L.s;
  if (frame !== P_.frame) { petImg.src = `assets/pet/${frame}.webp?v=${PET_V}`; P_.frame = frame; }
  const y = L.floor - s * PET_FOOT[frame] + dy;
  petEl.style.width = petEl.style.height = s + "px";
  petEl.style.transform = `translate(${Math.round(P_.x - s / 2)}px, ${Math.round(y)}px)`;
  petImg.style.transform = flip ? "scaleX(-1)" : "";
}
function petFloat(text, cls, x, y) {
  const el = document.createElement("span"); el.className = "petFloat " + cls; el.textContent = text;
  el.style.left = x + "px"; el.style.top = y + "px"; petLayer.appendChild(el);
  el.animate([{ transform: "translate(-50%, 0) scale(0.7)", opacity: 0 }, { transform: "translate(-50%, -14px) scale(1)", opacity: 1, offset: 0.2 },
    { transform: `translate(calc(-50% + ${(Math.random() - 0.5) * 30}px), -60px) scale(1.1)`, opacity: 0 }], { duration: cls === "z" ? 2200 : 1100, easing: "ease-out" })
    .onfinish = () => el.remove();
}

/* ----- what the pet should be doing right now ----- */
function petWant() {
  if (energyActive()) return "tap";
  if (state.energyCooldown > PET_WAKE_BEFORE) return "sleep";
  if (state.energyCooldown > 0) return "awake";
  return state.money >= ENERGY_PRICE && !isPaused() ? "drink" : "awake";
}
function petSet(mode, ms = 0) { P_.mode = mode; P_.t = 0; P_.until = ms; }
function petWalkTo(x, then) { P_.tx = x; P_.next = then; petSet("walk"); }

// the pet buys the ⚡ energy drink itself (the same booster as the button)
function petDrinkNow() {
  if (energyActive() || state.energyCooldown > 0 || state.money < ENERGY_PRICE || isPaused()) return false;
  state.money -= ENERGY_PRICE; state.energyLeft = ENERGY_SECONDS;
  state.stats.boostEnergy = (state.stats.boostEnergy || 0) + 1;
  updateCounter(); updateEnergy(); save();
  return true;
}
// one tap on the coin (same rules as your click, and the same 10-per-second limit)
function petTap() {
  if (isPaused() || !canClick(performance.now())) return;
  const v = clickValue();
  state.money += v; clickedThisSecond += v;
  state.stats.clicks++; state.pet.taps++;
  updateCounter(); save();
  P_.tapSum = (P_.tapSum || 0) + v;   // shown all at once on the next visible slap
}
// one visible slap: the coin dips once and a single "+…" shows everything earned since the last slap
function petSlap() {
  const c = P_.layout.coin, coin = $("coin"), sum = P_.tapSum || 0; P_.tapSum = 0;
  coin.animate([{ scale: "1" }, { scale: "0.93", offset: 0.35 }, { scale: "1" }], { duration: 320, easing: "ease-out" });
  if (sum > 0) {
    showPlus(c.left + c.width * (0.45 + Math.random() * 0.2), c.top + c.height * 0.2);
    const el = plusPool[(plusNext + plusPool.length - 1) % plusPool.length]; if (el) el.textContent = "+" + fmt(sum);
  }
}
function petPet() {
  if (!petOwned()) return;
  const now = performance.now();
  P_.petStreak = now - P_.petLast < 2500 ? P_.petStreak + 1 : 1; P_.petLast = now;
  state.pet.pets++; save();
  const s = P_.layout ? P_.layout.s : 150, y = P_.layout ? P_.layout.floor - s * 0.9 : 0;
  petFloat(P_.petStreak >= 5 ? "💖" : "❤️", "heart", P_.x + (Math.random() - 0.5) * s * 0.4, y);
  // 😴 petted while asleep: it peeks with one eye, wiggles its tail and wings, then smiles and sleeps on
  if (P_.mode === "sleep") P_.sleepPet = P_.sleepPet && now - P_.sleepPet < PET_SLEEP_PET_MS ? now - 400 : now;
  // tapping and sleeping go on (it just enjoys it); otherwise it shows how happy it is
  if (P_.mode === "idle" || P_.mode === "walk" || P_.mode === "happy") {
    if (P_.petStreak >= 5) { P_.petStreak = 0; P_.jump = 1; petSet("happy", 1300); }
    else petSet("happy", 1200);
  }
}

/* ----- one animation frame ----- */
function petStep(now) {
  P_.raf = 0;
  if (!petActive()) return;
  const dt = Math.min(0.1, (now - (P_.last || now)) / 1000); P_.last = now;
  const L = petLayout(now);
  if (P_.x < 0) P_.x = (L.minX + L.maxX) / 2 + 20;
  P_.t += dt * 1000;
  const want = petWant();
  const timed = P_.until && P_.t < P_.until;

  // switch modes when the current one is free to change
  if (!timed && P_.mode !== "walk") {
    if (want === "tap" && P_.mode !== "tap") { if (Math.abs(P_.x - L.tapX) > 4) petWalkTo(L.tapX, "tap"); else petSet("tap"); }
    else if (want === "sleep" && P_.mode !== "sleep") {   // 💤 walks a little away from the coin first, then curls up
      const bed = Math.min(L.maxX, L.tapX + L.s * 0.9);
      if (Math.abs(P_.x - bed) > 20) petWalkTo(bed, "sleep"); else petSet("sleep");
    }
    else if (want !== "sleep" && P_.mode === "sleep") petSet("wake", 1700);
    else if (want === "drink" && P_.mode !== "drink" && P_.mode !== "drink2") petSet("drink", 1400);
    else if (P_.mode === "drink") { petDrinkNow(); petSet("drink2", 900); }
    else if (P_.mode === "drink2" || P_.mode === "wake" || P_.mode === "happy" || (P_.mode === "tap" && want !== "tap")) { P_.jump = 0; petSet("idle", 2500 + Math.random() * 3000); }
    else if (P_.mode === "idle" && want === "awake") {
      const x = L.minX + 30 + Math.random() * Math.max(0, L.maxX - L.minX - 30);
      if (Math.abs(x - P_.x) > 30) petWalkTo(x, "idle"); else petSet("idle", 2000 + Math.random() * 2500);
    }
  }
  // draw
  switch (P_.mode) {
    case "walk": {
      const d = P_.tx - P_.x, step = 75 * dt * (isPhone() ? 0.7 : 1);
      if (Math.abs(d) <= step) { P_.x = P_.tx; petSet(P_.next || "idle", P_.next === "idle" ? 2000 + Math.random() * 3000 : 0); }
      else { P_.x += Math.sign(d) * step; P_.face = Math.sign(d); }
      petShow(`walk-${1 + Math.floor(now / 130) % 4}`, P_.face < 0);
      break;
    }
    case "tap": {
      P_.face = -1;
      P_.tapAcc += dt * 1000;
      while (P_.tapAcc >= PET_TAP_MS) { P_.tapAcc -= PET_TAP_MS; petTap(); P_.tapOn = true; }
      // a slow, smooth slap: paws up and a little lift (65%), then down onto the coin (35%)
      P_.slapT = (P_.slapT || 0) + dt * 1000;
      if (P_.slapT >= PET_SLAP_MS) P_.slapT -= PET_SLAP_MS;
      const k = P_.slapT / PET_SLAP_MS, up = k < 0.65;
      if (!up && !P_.slapped) { P_.slapped = true; petSlap(); }
      if (up) P_.slapped = false;
      const lift = up ? -Math.sin(k / 0.65 * Math.PI / 2) * P_.layout.s * 0.05 : 0;
      petShow(up ? "tap-1" : "tap-2", true, lift);
      break;
    }
    case "sleep": {
      const breath = Math.sin(now / 700), pe = P_.sleepPet ? now - P_.sleepPet : Infinity;
      if (pe < PET_SLEEP_PET_MS) petShow(pe < 400 ? "sleep-pet-1" : pe < 1100 ? (Math.floor((pe - 400) / 175) % 2 ? "sleep-pet-1" : "sleep-pet-2") : "sleep-pet-3", P_.face < 0);
      else petShow(breath > 0 ? "sleep-2" : "sleep-1", P_.face < 0);
      petImg.style.transform = `${P_.face < 0 ? "scaleX(-1) " : ""}scale(${1 + breath * 0.015})`;
      if (now - P_.zAt > 1400) { P_.zAt = now; petFloat("z", "z", P_.x + (P_.face < 0 ? -1 : 1) * L.s * 0.25, L.floor - L.s * 0.55); }
      break;
    }
    case "wake": petShow("wake", P_.face < 0); break;
    case "drink": petShow("drink-1", P_.face < 0); break;
    case "drink2": petShow("drink-2", P_.face < 0, -Math.abs(Math.sin(P_.t / 120)) * 6); break;
    case "happy": petShow(P_.jump ? "happy-2" : "happy-1", P_.face < 0, P_.jump ? -Math.sin(Math.min(1, P_.t / 600) * Math.PI) * L.s * 0.35 : 0); break;
    default: {   // idle: sits and blinks now and then
      if (now > P_.blinkAt + 3500 + Math.random() * 2000) P_.blinkAt = now;
      petShow(now - P_.blinkAt < 180 ? "idle-2" : "idle-1", P_.face < 0);
    }
  }
  P_.raf = requestAnimationFrame(petStep);
}
const petActive = () => petOwned() && !state.pet.hidden && state.view === "income" && !document.hidden && $("mainMenu").hidden;
// start / stop with the page (checked twice a second)
function petSync() {
  petBuild(); if (!petLayer) return;
  const on = petActive();
  petLayer.hidden = !on;
  if (petEl && petOwned()) { petEl.title = state.pet.name; petEl.setAttribute("aria-label", "Pet " + state.pet.name); }
  if (on && !P_.raf) { P_.last = 0; P_.layout = null; P_.raf = requestAnimationFrame(petStep); }
  if (!on && P_.raf) { cancelAnimationFrame(P_.raf); P_.raf = 0; }
}
setInterval(petSync, 500);
window.addEventListener("resize", () => { P_.layout = null; });
petSync();

/* ----- ⚙️ Settings → 🐾 Pet ----- */
const petCleanName = (v) => String(v || "").replace(/[<>"'`&]/g, "").trim().slice(0, 16);
function petSettingsHtml() {
  if (!petOwned()) return "";
  return `<div class="orSec">🐾 Pet</div>
    <div class="orRow petSetRow"><img class="petSetPic" src="assets/pet/pet-portrait.webp" alt=""><span class="grow">Show on the Income page</span>
      <span class="orSwitch ${state.pet.hidden ? "" : "on"}" data-pet="show" role="switch" tabindex="0"></span></div>
    <div class="orRow slider"><span class="grow">Name</span><input class="petNameInput" id="petName" maxlength="16" value="${petCleanName(state.pet.name)}" aria-label="Pet name" data-noi18n></div>`;
}
document.addEventListener("click", (e) => {
  const b = e.target.closest("[data-pet=show]"); if (!b || !petOwned()) return;
  state.pet.hidden = !state.pet.hidden; b.classList.toggle("on", !state.pet.hidden); save(); petSync();
});
document.addEventListener("change", (e) => {
  if (e.target.id !== "petName" || !petOwned()) return;
  const n = petCleanName(e.target.value);
  state.pet.name = n || "Mochi"; e.target.value = state.pet.name; save(); petSync();
});
