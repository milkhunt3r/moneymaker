/* Empire of Coins © 2026 milkhunt3r. All rights reserved. */
/* =====================================================================
   🐾🎨 PIP, the painter pet (an alien mouse from the Lumerians).
   - Adopt him in 🌌 Space Logistics → Lumerians, once you are 😊 Friendly, for 10 paintings from your collection.
   - He lives at the top of the 🖼️ Art Gallery page, next to his easel.
   - Every 15 minutes: 14 min asleep, then 1 min painting a 🟡 Normal painting (85–95% match, worth match% of 100M).
   - The painting goes to your 🖼️ collection; if it's full, it is sold right away. Both count for 🏆 achievements.
   - He keeps painting while the game is closed (up to 24 hours of paintings are caught up).
   - Click him: while asleep he enjoys it; while painting he gets a bit annoyed.
   ===================================================================== */
const PIP_CYCLE = 15 * 60e3, PIP_PAINT = 60e3, PIP_TIER = "hard", PIP_COST = 10, PIP_LV = 3, PIP_CATCHUP = 96;
const PIP_V = "3";   // bump when a Pip picture changes (browser cache)
const PIP_FRAMES = ["paint-1", "paint-2", "paint-3", "paint-4", "tada", "sleep-1", "sleep-2", "sleeppet-1", "sleeppet-2", "sleeppet-3", "annoyed-1", "annoyed-2", "annoyed-3", "walk-1", "walk-2", "walk-3", "walk-4"];
const PIP_WALK = 1400;   // ms to walk between his corner and the easel (same as the CSS transition of .pipSprite)
const pipSrc = (f) => `assets/pip/pip-${f}.webp?v=${PIP_V}`;
const pipOwned = () => !!(state.pip && state.pip.owned);
const pipName = () => (typeof petCleanName === "function" ? petCleanName(state.pip && state.pip.name) : "") || "Pip";
if (state.pip && state.pip.owned) {
  const p = state.pip;
  p.done = p.done || 0; p.painted = p.painted || 0; p.kept = p.kept || 0; p.sold = p.sold || 0; p.earned = p.earned || 0; p.pets = p.pets || 0; p.pokes = p.pokes || 0;
  if (!p.start) p.start = Date.now();
  if (!p.base) p.base = 1 + secureRandomInt(2 ** 30);
}

/* ----- 🖌️ the paintings (painting number k is fully decided by its seed, so the easel and the result always match) ----- */
const pipSeed = (k) => ((state.pip.base + k * 7919) % (2 ** 31 - 2)) + 1;
const pipScore = (seed) => Math.round((85 + artRng(seed ^ 0x5bd1e995)() * 10) * 10) / 10;   // 85.0–95.0%
const pipCopyCache = {};
function pipCopyCanvas(seed, score) {   // the original with a few small smudges: Pip is good, not perfect
  if (pipCopyCache[seed]) return pipCopyCache[seed];
  const c = document.createElement("canvas"); c.width = 160; c.height = 120;
  const g = c.getContext("2d");
  g.drawImage(artCanvasOf(PIP_TIER, seed, 160), 0, 0);
  const R = artRng(seed ^ 0x2545f491), n = Math.round((100 - score) * 3);
  for (let i = 0; i < n; i++) {
    const x = R() * 160, y = R() * 120, px = g.getImageData(Math.min(159, Math.max(0, x + (R() - 0.5) * 16)) | 0, Math.min(119, Math.max(0, y + (R() - 0.5) * 16)) | 0, 1, 1).data;
    g.fillStyle = `rgb(${px[0]},${px[1]},${px[2]})`;
    g.beginPath(); g.ellipse(x, y, 2 + R() * 5, 1.5 + R() * 3, R() * Math.PI, 0, Math.PI * 2); g.fill();
  }
  const keys = Object.keys(pipCopyCache); if (keys.length > 6) delete pipCopyCache[keys[0]];
  return (pipCopyCache[seed] = c);
}

/* ----- ⏱️ the 15-minute cycle ----- */
function pipPhase(now = Date.now()) {   // -> { k: painting being worked on, painting: bool, t: ms into the cycle, next: when painting k is done }
  if (state.pip.off) now = state.pip.off;   // 💤 resting (🐾 Pets page): his clock stands still
  const p = state.pip, since = Math.max(0, now - p.start), k = Math.floor(since / PIP_CYCLE) + 1, t = since % PIP_CYCLE;
  return { k, t, painting: t >= PIP_CYCLE - PIP_PAINT, next: p.start + k * PIP_CYCLE };
}
function pipFinish(k, quiet) {
  const p = state.pip, a = state.art, seed = pipSeed(k), score = pipScore(seed), value = Math.floor(ART_TIERS[PIP_TIER].value * score / 100);
  const best = state.stats.artBest || (state.stats.artBest = {});
  best[PIP_TIER] = Math.max(best[PIP_TIER] || 0, score);
  p.painted++; p.last = { seed, score };
  let kept = false;
  if (a.items.length < a.slots && !p.sellAll) {   // 💵 "Always sell" (🐾 Pets page) skips the collection
    const item = { id: state.nextId++, tier: PIP_TIER, seed, score, value, img: pipCopyCanvas(seed, score).toDataURL("image/jpeg", 0.7), at: Date.now(), by: "pip" };
    a.items.unshift(item); if (typeof artStoreImg === "function") artStoreImg(item);
    p.kept++; kept = true;
  } else {
    state.money += value; clickedThisSecond += value;
    a.sold = (a.sold || 0) + 1; state.stats.artSold = (state.stats.artSold || 0) + 1;
    p.sold++; p.earned += value;
  }
  if (!quiet) showNotice(kept ? `🎨 ${pipName()} finished a painting (${score.toFixed(1)}% match, worth ${fmt(value)}). It's in your 🖼️ collection.`
    : p.sellAll ? `🎨 ${pipName()} finished a painting (${score.toFixed(1)}%) and sold it for ${fmt(value)}.`
    : `🎨 ${pipName()} finished a painting (${score.toFixed(1)}%). Your collection is full, so he sold it for ${fmt(value)}.`);
  return { kept, value };
}
function pipProcess(quiet) {
  if (!pipOwned()) return 0;
  const p = state.pip, ph = pipPhase(), doneNow = ph.k - 1;
  if (doneNow <= p.done) return 0;
  if (doneNow - p.done > PIP_CATCHUP) p.done = doneNow - PIP_CATCHUP;
  const many = doneNow - p.done > 1 || quiet;
  let n = 0, kept = 0, sold = 0, money = 0;
  while (p.done < doneNow) { p.done++; const r = pipFinish(p.done, many); n++; if (r.kept) kept++; else { sold++; money += r.value; } }
  if (many && n) showNotice(`🎨 While you were away, ${pipName()} painted ${n} painting${n > 1 ? "s" : ""}: ${kept} went to your 🖼️ collection${sold ? `, ${sold} sold for ${fmt(money)}` : ""}.`);
  if (!many) pipUI.tadaUntil = Date.now() + 2600;
  updateCounter(); save();
  if (state.view === "games" && state.gamePage === "art" && typeof renderArtCollection === "function" && !$("artCollection").hidden) renderArtCollection();
  return n;
}

/* ----- 🌌 adopting him (Lumerians panel in Space Logistics) ----- */
function pipOfferHtml(k) {
  if (k !== "art" || pipOwned()) return "";
  const L = spLevel("art"), have = (state.art.items || []).length;
  return `<div class="pipOffer ${L >= PIP_LV ? "" : "locked"}"><img src="${pipSrc("tada")}" alt="">
    <div><b>🐾 A painter wants to join you</b>
      <div>${L >= PIP_LV ? `Pip, a young Lumerian painter, would love to live with you and paint for you. The Lumerians ask <b>${PIP_COST} paintings</b> in return.`
        : `Become <b>😊 Friendly</b> with the Lumerians and one of their painters may want to come and live with you.`}</div>
      ${L >= PIP_LV ? `<button class="btn" data-pip="adopt" ${have >= PIP_COST ? "" : "disabled"}>🎨 Adopt Pip · 🖼️ ${PIP_COST} paintings</button>
        ${have < PIP_COST ? `<div class="muted">You have ${have} painting${have === 1 ? "" : "s"} in your collection.</div>` : ""}` : ""}</div></div>`;
}
function pipAdopt(ids) {
  if (pipOwned() || spLevel("art") < PIP_LV || !Array.isArray(ids) || ids.length !== PIP_COST) return false;
  const set = new Set(ids), items = state.art.items.filter(it => set.has(it.id));
  if (items.length !== PIP_COST) return false;
  state.art.items = state.art.items.filter(it => !set.has(it.id));
  items.forEach(it => { if (typeof artImgs === "object") delete artImgs[it.id]; if (typeof artImgDel === "function") artImgDel(it.id); });
  state.art.sold = (state.art.sold || 0) + PIP_COST; state.stats.artSold = (state.stats.artSold || 0) + PIP_COST;
  state.pip = { owned: true, name: "Pip", at: Date.now(), start: Date.now(), base: 1 + secureRandomInt(2 ** 30), done: 0, painted: 0, kept: 0, sold: 0, earned: 0, pets: 0, pokes: 0 };
  save();
  showModal(`<div style="text-align:center"><img src="${pipSrc("tada")}" alt="" style="width:180px;height:180px;object-fit:contain">
    <h2>🐾 Pip joined you!</h2>
    <p>He set up his easel at the top of the 🖼️ Art Gallery page. Every 15 minutes he paints a 🟡 Normal painting for your collection (he naps in between).</p>
    <div class="row" style="justify-content:center;gap:10px"><button class="btn big" data-pip="visit">🎮 Go and see him</button><button class="btn ghost" data-modal="close">Later</button></div></div>`);
  if (typeof renderSpace === "function" && state.view === "logistics") renderSpace();
  return true;
}

/* ----- 🎨 his corner on the Art Gallery page ----- */
const pipUI = { anim: null, animAt: 0, tadaUntil: 0, lastFrame: "", lastSeed: 0, lastDrawn: -1, built: false };
PIP_FRAMES.forEach(f => { const im = new Image(); im.src = pipSrc(f); });
const PIP_PATCH = (() => {   // the order the canvas gets painted in: 12 × 9 patches, roughly top to bottom
  const L = []; for (let y = 0; y < 9; y++) for (let x = 0; x < 12; x++) L.push([x, y, y + Math.random() * 3]);
  return L.sort((a, b) => a[2] - b[2]);
})();
// 🎨 his corner sits at the top of the 🖼️ Art Gallery page (under its header)
function pipCornerVisible() { const el = $("pipCorner"); return !!el && !el.hidden && state.view === "games" && state.gamePage === "art" && !document.hidden; }
function renderPipCorner() {
  const el = $("pipCorner"); if (!el) return;
  el.hidden = !pipOwned() || state.gamePage !== "art" || !state.art.unlocked || !!state.pip.off;   // only on the Art Gallery page; 💤 resting: not in his corner
  if (el.hidden) return;
  if (!pipUI.built) {
    el.innerHTML = `<div class="card pipCard"><div class="pipStage">
        <div class="pipEasel"><img src="assets/pip/pip-easel.webp?v=${PIP_V}" alt=""><canvas id="pipCanvas" width="160" height="120"></canvas></div>
        <button class="pipSprite" id="pipSprite" aria-label="Pip" data-noi18n><img alt="" draggable="false"></button></div>
      <div class="pipInfo"><h3 id="pipTitle" data-noi18n></h3><div id="pipStatus"></div><div class="pipNums" id="pipNums"></div>
        <div class="muted pipHint">Click him to pet him (he doesn't like it while he's painting!).</div></div></div>`;
    pipUI.built = true; pipUI.lastFrame = ""; pipUI.lastDrawn = -1; pipUI.pos = null; pipUI.walk = null;
  }
  pipTick(true);
}
function pipFrame(now, ph) {
  const A = pipUI.anim;
  if (A && now < A.until) { const f = A.frames[Math.min(A.frames.length - 1, Math.floor((now - A.at) / A.step))]; return f; }
  pipUI.anim = null;
  if (now < pipUI.tadaUntil) return "tada";
  if (ph.painting) return ["paint-1", "paint-2", "paint-3", "paint-2", "paint-1", "paint-4"][Math.floor(now / 380) % 6];
  return Math.floor(now / 1400) % 2 ? "sleep-2" : "sleep-1";
}
function pipDrawEasel(ph, now) {
  const cv = $("pipCanvas"); if (!cv) return;
  const g = cv.getContext("2d"), p = state.pip;
  let seed = 0, frac = 1;
  if (ph.painting) { seed = pipSeed(ph.k); frac = Math.min(1, (ph.t - (PIP_CYCLE - PIP_PAINT)) / PIP_PAINT); }
  else if (p.last) seed = p.last.seed;
  const key = seed ? Math.floor(frac * PIP_PATCH.length) + seed * 1000 : -2;
  if (key === pipUI.lastDrawn) return;
  pipUI.lastDrawn = key;
  g.fillStyle = "#fcfcfa"; g.fillRect(0, 0, 160, 120);
  if (!seed) return;
  const src = pipCopyCanvas(seed, pipScore(seed)), n = Math.floor(frac * PIP_PATCH.length);
  if (n >= PIP_PATCH.length) { g.drawImage(src, 0, 0); return; }
  const w = 160 / 12, h = 120 / 9;
  for (let i = 0; i < n; i++) { const [x, y] = PIP_PATCH[i]; g.drawImage(src, x * w - 1, y * h - 1, w + 2, h + 2, x * w - 1, y * h - 1, w + 2, h + 2); }
}
function pipTick(force) {
  if (!pipOwned() || (!force && !pipCornerVisible())) return;
  if (pipPhase().k - 1 > state.pip.done) pipProcess(false);   // a painting just finished: hand it in now, so "ta-da!" shows before he walks off
  const now = Date.now(), ph = pipPhase(now), p = state.pip;
  let f = pipFrame(now, ph);
  const img = document.querySelector("#pipSprite img"), sp = $("pipSprite");
  // 🚶 awake: he walks up to the easel; asleep: he walks back to his corner (walk frames face right; flipped to go back)
  const want = /^sleep/.test(f) ? "corner" : "easel";
  if (sp && (!pipUI.pos || now - (pipUI.seen || 0) > 3000)) {   // first look (or back after a while): just be there
    pipUI.pos = want; pipUI.walk = null; sp.classList.add("noAnim"); requestAnimationFrame(() => sp.classList.remove("noAnim"));
  }
  pipUI.seen = now;
  if (want !== pipUI.pos && !pipUI.walk) pipUI.walk = { to: want, until: now + PIP_WALK };
  let flip = null;
  if (pipUI.walk) {
    if (now >= pipUI.walk.until) { pipUI.pos = pipUI.walk.to; pipUI.walk = null; }
    else { f = "walk-" + (1 + Math.floor(now / 170) % 4); flip = pipUI.walk.to === "corner"; }
  }
  if (img && f !== pipUI.lastFrame) { img.src = pipSrc(f); pipUI.lastFrame = f; }
  if (img) { const tf = flip === null ? "" : flip ? "translateX(-19%) scaleX(-1)" : "translateX(-14%)"; if (img.style.transform !== tf) img.style.transform = tf; }
  const at = (pipUI.walk ? pipUI.walk.to : pipUI.pos) === "easel";
  if (sp && sp.classList.contains("atEasel") !== at) sp.classList.toggle("atEasel", at);
  pipDrawEasel(ph, now);
  const t = $("pipTitle"), tn = pipName(); if (t && t.dataset.n !== tn) { t.dataset.n = tn; t.innerHTML = `<img class="petNameIco" src="assets/icons/tab-pet.webp" alt="" style="width:1.2em;height:1.2em;object-fit:contain;vertical-align:-0.22em;margin-right:6px;display:inline-block">${escapeHtml(tn)}`; }
  const s = $("pipStatus");
  if (s) s.innerHTML = ph.painting ? `${pi("painting", "🎨")} <b>Painting…</b> done in <b>${clockMs(ph.next - now)}</b>`
    : `${pi("sleep", "😴")} <b>Asleep.</b> Next painting starts in <b>${clockMs(ph.next - PIP_PAINT - now)}</b>`;
  const n = $("pipNums");
  if (n) n.innerHTML = `<span>${pi("paintings", "🖼️")} Painted: <b>${p.painted.toLocaleString()}</b></span>${p.last ? `<span>${pi("match", "⭐")} Last: <b>${p.last.score.toFixed(1)}%</b></span>` : ""}<span>${pi("sold", "💰")} Auto-sold: <b>${p.sold.toLocaleString()}</b></span>`;
}
setInterval(() => pipTick(false), 120);
setInterval(() => { if (pipOwned()) pipProcess(false); }, 1000);
function pipPoke() {
  if (!pipOwned() || isPaused()) return;
  const now = Date.now(), ph = pipPhase(now), p = state.pip;
  if (pipUI.anim && now < pipUI.anim.until) return;
  if (ph.painting) { pipUI.anim = { frames: ["annoyed-2", "annoyed-3", "annoyed-1"], at: now, step: 600, until: now + 1800 }; p.pokes++; }
  else { pipUI.anim = { frames: ["sleeppet-1", "sleeppet-2", "sleeppet-3"], at: now, step: 600, until: now + 1800 }; p.pets++; }
  pipUI.tadaUntil = 0; save(); pipTick(true);
}

/* ----- 🔘 clicks and the name field (🐾 Pet page) ----- */
document.addEventListener("click", (e) => {
  if (e.target.closest("#pipSprite")) return pipPoke();
  const b = e.target.closest("[data-pip]"); if (!b) return;
  if (b.dataset.pip === "adopt") {
    if (pipOwned() || spLevel("art") < PIP_LV || state.art.items.length < PIP_COST || typeof spRenderPick !== "function") return;
    spPick = { k: "art", kind: "art", need: PIP_COST, sel: [], pip: true }; spRenderPick();
  }
  if (b.dataset.pip === "visit") { hideModal(); openGame("art"); }
  // 🐾 Pets page: Active / Resting (resting pauses the painting clock: the time off is added to his start) and Always sell
  if (b.dataset.pip === "toggle" && pipOwned()) {
    const p = state.pip;
    if (p.off) { p.start += Math.max(0, Date.now() - p.off); delete p.off; } else p.off = Date.now();
    pipUI.pos = null; save(); renderPipCorner(); if (typeof renderPetPage === "function") renderPetPage();
  }
  if (b.dataset.pip === "sell" && pipOwned()) { state.pip.sellAll = !state.pip.sellAll; save(); if (typeof renderPetPage === "function") renderPetPage(); }
});
document.addEventListener("change", (e) => {
  if (e.target.id !== "pipName" || !pipOwned()) return;
  const n = petCleanName(e.target.value);
  state.pip.name = n || "Pip"; e.target.value = state.pip.name; save();
});
// draw the corner whenever the mini-games are drawn (it shows only on the Art Gallery page)
const pipRenderGamesOrig = renderGames;
renderGames = function () { pipRenderGamesOrig(); renderPipCorner(); };
const pipRenderArtOrig = renderArt;
renderArt = function () { pipRenderArtOrig(); renderPipCorner(); };   // 🖼️ the Art Gallery page is drawn on its own
document.addEventListener("visibilitychange", () => { if (!document.hidden && pipOwned()) pipProcess(false); });
if (pipOwned()) pipProcess(true);
if (state.view === "games" && state.gamePage === "art") renderPipCorner();   // the page opened straight on the Art Gallery
