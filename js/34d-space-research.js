/* Empire of Coins © 2026 milkhunt3r. All rights reserved. */
/* =====================================================================
   🔬 SPACE RESEARCH & CRAFTING (loaded after js/34c-space-politics.js) · 🚢 Logistics → 🌌 Space → 🔬 Research
   · 5 research lines with 3 levels each. A level costs 🔬 scientists, money and space resources
     (10/20/30 scientists, 250k/500k/750k scoin, ~100/200/300 goods). Later levels need crafted resources.
   · 🛠️ Crafting (after the first Space crafting level): 2 + 2 alien goods → 1 crafted resource,
     in batches of 25/50/75/100 (and 150 from Space crafting level 3). One batch at a time, 60/45/30 seconds a unit. Keeps going while the game is closed.
   · 🏗️ Outposts: a base in a system you are 😊 Friendly with. It makes that race's goods on its own (no ship).
   ===================================================================== */
const SP_CRAFT = {
  prism: { name: "Resonance Prisms", emoji: "🔷", from: ["crystal", "pearl"] },
  alloy: { name: "Voidsteel Ingots", emoji: "🔩", from: ["core", "vgold"] },
  sail:  { name: "Star Sails", emoji: "⛵", from: ["chart", "silk"] },
  chip:  { name: "Chrono Chips", emoji: "💾", from: ["shard", "nano"] },
};
const SP_CRAFT_EACH = 2, SP_CRAFT_SIZES = [25, 50, 75, 100], SP_CRAFT_BIG = 150, SP_CRAFT_SEC = [0, 60, 45, 30];
const spCraftSizes = () => spRL("craft") >= 3 ? SP_CRAFT_SIZES.concat(SP_CRAFT_BIG) : SP_CRAFT_SIZES;   // 🛠️ level 3 adds batches of 150
const SP_OUTPOST_RATE = 20, SP_OUTPOST_LV = 3, SP_OUTPOST_SCI = 10, SP_OUTPOST_MONEY = GCOIN;   // goods an hour · needs 😊 Friendly · building one costs 1 gcoin + 10 scientists
const SP_R_SCI = [10, 20, 30], SP_R_MONEY = [250e3, 500e3, 750e3].map(n => n * SCOIN);
const SP_RESEARCH = {
  craft:   { name: "Space crafting", icon: "🛠️", lv: ["Unlocks crafting: 60 s per unit", "Crafting: 45 s per unit", "Crafting: 30 s per unit, and batches of 150"],
             cost: [{ crystal: 50, vgold: 50 }, { pearl: 100, core: 100 }, { c_prism: 150, c_alloy: 150 }] },
  ships:   { name: "Extra ship slots", icon: "🚀", lv: ["+1 ship", "+1 ship (2 in total)", "+1 ship (3 in total)"],
             cost: [{ vgold: 50, silk: 50 }, { chart: 100, crystal: 100 }, { c_sail: 150, c_chip: 150 }] },
  cargo:   { name: "Cargo holds", icon: "📦", lv: ["+10 goods on every trip", "+10 goods on every trip (+20 in total)", "+15 goods on every trip (+35 in total)"],
             cost: [{ silk: 50, pearl: 50 }, { core: 100, chart: 100 }, { c_sail: 150, c_prism: 150 }] },
  engine:  { name: "Ship engines", icon: "🔥", lv: ["−5% trip time", "−5% trip time (−10% in total)", "−10% trip time (−20% in total)"],
             cost: [{ crystal: 50, chart: 50 }, { c_chip: 100, c_alloy: 100 }, { c_chip: 150, c_prism: 150 }] },
  outpost: { name: "Outposts", icon: "🏗️", lv: ["+1 outpost", "+1 outpost (2 in total)", "+1 outpost (3 in total)"],
             cost: [{ c_prism: 50, c_alloy: 50 }, { c_sail: 100, c_chip: 100 }, { c_alloy: 150, c_sail: 150 }] },
};
SP.crafted = SP.crafted || {};
SP.outposts = SP.outposts || {};
if (SP.craft === undefined) SP.craft = null;

// a cost key is an alien good ("crystal") or a crafted resource ("c_prism")
const spHave = (key) => key.startsWith("c_") ? SP.crafted[key.slice(2)] || 0 : SP.goods[key] || 0;
const spCI = (c, cls = "spGi") => `<img class="${cls}" src="assets/space/good-c-${c}.webp" alt="${SP_CRAFT[c].emoji}">`;   // painted crafted icon
const spRI = (k, cls = "spResImg") => `<img class="${cls}" src="assets/space/sp-res-${k}.webp" alt="${SP_RESEARCH[k].icon}" onerror="this.replaceWith(document.createTextNode(this.alt))">`;
const spCostIco = (key) => key.startsWith("c_") ? spCI(key.slice(2)) : spGI(key);
const spCostLbl = (key) => key.startsWith("c_") ? SP_CRAFT[key.slice(2)].name : SP_GOODS[key].name;
function spResCost(k) { const L = spRL(k), D = SP_RESEARCH[k]; if (L >= 3) return null; return { sci: SP_R_SCI[L], money: (D.money || SP_R_MONEY)[L], goods: D.cost[L] }; }
const spResCan = (c) => c && spSci2() >= c.sci && state.money >= c.money && Object.entries(c.goods).every(([g, n]) => spHave(g) >= n);
function spResearch(k) {
  const c = spResCost(k);
  if (isPaused() || !spResCan(c)) return;
  spendScientists(c.sci); state.money -= c.money;
  Object.entries(c.goods).forEach(([g, n]) => { if (g.startsWith("c_")) SP.crafted[g.slice(2)] -= n; else SP.goods[g] -= n; });
  SP.research[k] = spRL(k) + 1;
  SP.stats.research = (SP.stats.research || 0) + 1;
  showNotice(`🔬 Research done: ${SP_RESEARCH[k].icon} <b>${SP_RESEARCH[k].name} ${spRL(k)}</b> · ${SP_RESEARCH[k].lv[spRL(k) - 1]}.`);
  updateCounter(); save(); renderSpace();
}

/* ----- 🛠️ crafting ----- */
const spCraftSec = () => SP_CRAFT_SEC[spRL("craft")];
const spCraftCan = (c, n) => spRL("craft") > 0 && !SP.craft && SP_CRAFT[c].from.every(g => (SP.goods[g] || 0) >= n * SP_CRAFT_EACH);
function spCraftStart(c, n) {
  if (isPaused() || !spCraftSizes().includes(n) || !spCraftCan(c, n)) return;
  SP_CRAFT[c].from.forEach(g => { SP.goods[g] -= n * SP_CRAFT_EACH; });
  const now = Date.now();
  SP.craft = { c, n, t0: now, t1: now + n * spCraftSec() * 1000 };
  save(); renderSpace();
}
function spCraftCancel() {
  const J = SP.craft; if (!J) return;
  SP_CRAFT[J.c].from.forEach(g => { SP.goods[g] = (SP.goods[g] || 0) + J.n * SP_CRAFT_EACH; });
  SP.craft = null;
  showNotice("🛠️ Crafting cancelled. Your goods are back.");
  save(); renderSpace();
}

/* ----- 🏗️ outposts ----- */
const spOutpostCount = () => Object.keys(SP.outposts).length;
const spOutpostFree = () => spRL("outpost") - spOutpostCount();
function spOutpostBuild(k) {
  if (isPaused() || SP.outposts[k] || spOutpostFree() <= 0 || spLevel(k) < SP_OUTPOST_LV) return;
  if (state.money < SP_OUTPOST_MONEY || spSci2() < SP_OUTPOST_SCI) return showNotice(`❌ An outpost costs ${fmt(SP_OUTPOST_MONEY)} and ${SP_OUTPOST_SCI} 🔬 scientists.`);
  state.money -= SP_OUTPOST_MONEY; spendScientists(SP_OUTPOST_SCI); updateCounter();
  SP.outposts[k] = { t: Date.now(), got: 0 };
  showNotice(`🏗️ Outpost built at the ${SP_RACES[k].name}! It makes ${SP_OUTPOST_RATE} ${SP_GOODS[SP_RACES[k].good].name} an hour.`);
  save(); renderSpace();
}
function spOutpostClose(k) { if (!SP.outposts[k]) return; delete SP.outposts[k]; hideModal(); save(); renderSpace(); }
function spOutpostHtml(k) {
  if (!spRL("outpost")) return "";
  const R = SP_RACES[k], o = SP.outposts[k], G = SP_GOODS[R.good];
  if (o) return `<div class="spRoute on"><div class="spRow">${spRI("outpost", "spI")}<span><b>Outpost</b> · makes ${spGI(R.good)} <b>${SP_OUTPOST_RATE}</b> ${G.name} an hour, even while the game is closed.</span></div>
    <div class="muted">Goods made so far: ${(o.got || 0).toLocaleString()}</div>
    <div class="spBtns"><button class="btn ghost small" data-spo="close">Close the outpost</button></div></div>`;
  if (spLevel(k) < SP_OUTPOST_LV) return `<div class="spRoute locked spRow">${spRI("outpost", "spI")}<span><b>Outpost:</b> you can build one here when you are <b>😊 Friendly</b> with the ${R.name}.</span></div>`;
  return `<div class="spRoute"><div class="spRow">${spRI("outpost", "spI")}<span><b>Outpost:</b> a base in this system that makes ${spGI(R.good)} <b>${SP_OUTPOST_RATE}</b> ${G.name} an hour, no ship needed. One per system.</span></div>
    <div class="spBtns"><button class="btn" data-spo="build" ${spOutpostFree() > 0 && state.money >= SP_OUTPOST_MONEY && spSci2() >= SP_OUTPOST_SCI ? "" : "disabled"}>${spRI("outpost", "spI btnI")}Build outpost · ${fmt(SP_OUTPOST_MONEY)} + 🔬 ${SP_OUTPOST_SCI}</button></div>
    <div class="muted">Outposts: ${spOutpostCount()} / ${spRL("outpost")} built${spOutpostFree() > 0 ? "" : " · research more 🏗️ Outposts or close one to build here"}.</div></div>`;
}

// every second (from spProcess): finish crafting and let the outposts work. Returns true when the page should redraw.
function spResTick(now, msgs) {
  let changed = false;
  const J = SP.craft;
  if (J && now >= J.t1) {
    SP.crafted[J.c] = (SP.crafted[J.c] || 0) + J.n; SP.craft = null; changed = true; SP.alert = SP.alert || {}; SP.alert.craft = true;
    SP.stats.crafted = (SP.stats.crafted || 0) + J.n;
    msgs.push(`🛠️ Crafting done: ${SP_CRAFT[J.c].emoji} ${J.n} ${SP_CRAFT[J.c].name}.`);
  }
  for (const [k, o] of Object.entries(SP.outposts)) {
    const n = Math.floor((now - o.t) / 3600e3 * SP_OUTPOST_RATE);
    if (n <= 0) continue;
    o.t += n * 3600e3 / SP_OUTPOST_RATE; o.got = (o.got || 0) + n;
    const g = SP_RACES[k].good; SP.goods[g] = (SP.goods[g] || 0) + n; SP.stats.goods += n; changed = true;
  }
  return changed;
}

/* ----- 🖼️ the Research page ----- */
function spResearchHtml() {
  const now = Date.now();
  const rows = Object.entries(SP_RESEARCH).map(([k, D]) => {
    const L = spRL(k), c = spResCost(k);
    const pips = [0, 1, 2].map(i => `<span class="spPip ${i < L ? "on" : ""}" title="${D.lv[i]}">${i + 1}</span>`).join("");
    const costHtml = c ? `<div class="spResCost">
        <span class="spNeed ${spSci2() >= c.sci ? "ok" : ""}">🔬 <b>${c.sci}</b> scientists <small>(${spSci2()})</small></span>
        <span class="spNeed ${state.money >= c.money ? "ok" : ""}">💰 <b>${fmt(c.money)}</b></span>
        ${Object.entries(c.goods).map(([g, n]) => `<span class="spNeed ${spHave(g) >= n ? "ok" : ""}">${spCostIco(g)} <b>${n}</b> ${spCostLbl(g)} <small>(${spHave(g).toLocaleString()})</small></span>`).join("")}</div>` : "";
    return `<div class="spResLine ${L >= 3 ? "maxed" : ""}"><div class="spResHead"><span class="spResIco">${spRI(k)}</span><div><b>${D.name}</b><div class="spPips">${pips}</div></div></div>
      <div class="spResBody">${L ? `<div class="muted">✅ Now: ${D.lv[L - 1]}</div>` : ""}
        ${c ? `<div><b>Level ${L + 1}:</b> ${D.lv[L]}</div>${costHtml}` : `<div><b>⭐ Fully researched</b></div>`}</div>
      ${c ? `<button class="btn" data-spr="${k}" ${spResCan(c) ? "" : "disabled"}>🔬 Research level ${L + 1}</button>` : ""}</div>`;
  }).join("");
  let craft;
  if (!spRL("craft")) craft = `<p class="muted">🔒 Research <b>🛠️ Space crafting</b> to unlock crafting.</p>`;
  else if (SP.craft) {
    const J = SP.craft, pct = Math.min(100, (now - J.t0) / (J.t1 - J.t0) * 100);
    craft = `<div class="spCraftJob"><div class="spCraftHead">${spCI(J.c, "spCraftBig")}<span>Crafting <b>${J.n}</b> ${SP_CRAFT[J.c].name} · ready in <b data-spt="${J.t1}">${spClock(J.t1 - now)}</b></span></div>
      <div class="xpBar"><div class="xpFill" id="spCraftFill" style="width:${pct}%"></div></div>
      <div class="spBtns"><button class="btn ghost small" data-spk="cancel">✖ Cancel (get your goods back)</button></div></div>`;
  } else craft = "";
  const recipes = spRL("craft") ? Object.entries(SP_CRAFT).map(([c, C]) => `<div class="spRecipe">
      <div class="spRecipeMix">${C.from.map(g => `<span class="spNeed ${(SP.goods[g] || 0) >= SP_CRAFT_SIZES[0] * SP_CRAFT_EACH ? "ok" : ""}">${spGI(g)} <b>${SP_CRAFT_EACH}</b> ${SP_GOODS[g].name} <small>(${(SP.goods[g] || 0).toLocaleString()})</small></span>`).join(" + ")}
        <span class="spArrow">→</span><span class="spCraftOut">${spCI(c)} <b>1</b> ${C.name} <small>(${(SP.crafted[c] || 0).toLocaleString()})</small></span></div>
      <div class="spCraftBtns">${spCraftSizes().map(n => `<button class="btn small" data-spk="${c}" data-n="${n}" ${spCraftCan(c, n) ? "" : "disabled"} title="${spClock(n * spCraftSec() * 1000)}">×${n}</button>`).join("")}${spRL("craft") >= 3 ? "" : `<button class="btn small" disabled title="Space crafting level 3">🔒×${SP_CRAFT_BIG}</button>`}</div></div>`).join("") : "";
  return `<div class="card spResBar" id="spResBar">${spResHtml()}</div>
    <div class="card"><h2 style="margin-top:0"><img class="ico h" src="assets/icons/ico-lg-research.webp" alt="">Space research</h2>
      <p class="muted">Each level costs 🔬 scientists, money and space resources. The last levels need resources you craft yourself.</p>
      <div class="spResList">${rows}</div></div>
    <div class="card"><h2 style="margin-top:0">${spRI("craft", "ico h")}Crafting</h2>
      ${spRL("craft") ? `<p class="muted">Mix ${SP_CRAFT_EACH} + ${SP_CRAFT_EACH} alien goods into 1 crafted resource, in batches of 25, 50, 75 or 100. One batch at a time: ${spCraftSec()} seconds a unit. It keeps going while the game is closed.</p>` : ""}
      ${craft}${recipes}</div>
    ${spRL("outpost") ? `<div class="card"><h2 style="margin-top:0">${spRI("outpost", "ico h")}Outposts (${spOutpostCount()} / ${spRL("outpost")})</h2>
      <p class="muted">Pick a system on the 🌌 star map you are 😊 Friendly with and build an outpost there (${fmt(SP_OUTPOST_MONEY)} + ${SP_OUTPOST_SCI} 🔬 scientists). Each one makes ${SP_OUTPOST_RATE} of that race's goods an hour.</p>
      ${spOutpostCount() ? `<ul class="spSlots">${Object.entries(SP.outposts).map(([k, o]) => `<li>${SP_RACES[k].emoji} ${SP_RACES[k].name}: ${spGI(SP_RACES[k].good)} ${SP_OUTPOST_RATE} ${SP_GOODS[SP_RACES[k].good].name} an hour · ${(o.got || 0).toLocaleString()} made</li>`).join("")}</ul>` : `<p class="muted">No outposts yet.</p>`}</div>` : ""}`;
}
// keep the crafting bar moving without rebuilding the page
setInterval(() => {
  const f = document.getElementById("spCraftFill"), J = SP.craft;
  if (f && J) f.style.width = Math.min(100, (Date.now() - J.t0) / (J.t1 - J.t0) * 100) + "%";
}, 1000);

document.addEventListener("click", (e) => {
  if (!e.target.closest("#spaceView") || isPaused()) return;
  const r = e.target.closest("[data-spr]"); if (r) return spResearch(r.dataset.spr);
  const k = e.target.closest("[data-spk]");
  if (k) return k.dataset.spk === "cancel" ? spCraftCancel() : spCraftStart(k.dataset.spk, Number(k.dataset.n));
  const o = e.target.closest("[data-spo]");
  if (o && o.dataset.spo === "build") spOutpostBuild(spSel);
  if (o && o.dataset.spo === "close") showModal(`<h2>Close this outpost?</h2><p>It stops making goods. You can build a new one in another system (that costs ${fmt(SP_OUTPOST_MONEY)} and ${SP_OUTPOST_SCI} 🔬 scientists again).</p>
    <div class="row" style="justify-content:center;gap:10px"><button class="btn ghost" data-modal="close">Keep it</button><button class="btn dangerBtn" data-spo2="${spSel}">Close it</button></div>`);
});
$("modal").addEventListener("click", (e) => { const b = e.target.closest("[data-spo2]"); if (b) spOutpostClose(b.dataset.spo2); });

