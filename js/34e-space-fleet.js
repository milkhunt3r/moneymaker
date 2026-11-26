/* Empire of Coins © 2026 milkhunt3r. All rights reserved. */
/* =====================================================================
   🛸 SPACE FLEET (loaded after js/34d-space-research.js)
   Three kinds of spaceships:
   · 🚀 Courier ships: the ships you always had (gifts, trade routes, contracts, exploring).
   · ✨ Stardust Harvesters (research 1/1/1 → up to 3): fly to the 🌫️ Stardust Drift (5 min there, 5 back), farm for 1 hour:
     5/6/7 stardust a minute (by research level). Pirates: 30% chance of one attack in the first 30 min of farming,
     50% chance of one in the last 30 min. An attack on a harvester with no escort takes all the stardust farmed so far.
   · 🛡️ Escort Frigates (research 1/2/2 → up to 5): escort a harvester (pirates are driven off, but each attack has a 3% chance
     to destroy the frigate, and then the stardust is lost too), or escort courier ships (pirates leave them alone).
     A destroyed frigate can be rebuilt for 10 gcoin.
   · 🌫️ Stardust Drift: a new area at the top of the star map. Explore it first (a courier ship, 5 min there and back).
   ===================================================================== */
const SP_DRIFT = { pos: [50, 13], min: 5, farm: 60 * 60e3, sci: 10 };
const SP_HARV_N = [0, 1, 2, 3], SP_HARV_RATE = [0, 5, 6, 7];
const SP_FRIG_N = [0, 1, 3, 5], SP_FRIG_PRICE = 10 * GCOIN, SP_FRIG_LOSE = 0.03;
const SP_RAID = [0.3, 0.5];   // chance of one pirate attack in the 1st / 2nd half hour of farming
Object.assign(SP_RESEARCH, {
  harvest: { name: "Stardust Harvesters", icon: "✨", money: [1, 5, 10].map(n => n * GCOIN),
             lv: ["+1 harvester · 5 stardust a minute", "+1 harvester (2 in total) · 6 stardust a minute each", "+1 harvester (3 in total) · 7 stardust a minute each"],
             cost: [{ crystal: 50, core: 50 }, { pearl: 100, silk: 100 }, { c_prism: 150, c_sail: 150 }] },
  frigate: { name: "Escort Frigates", icon: "🛡️", money: [1, 5, 10].map(n => n * GCOIN),
             lv: ["+1 frigate", "+2 frigates (3 in total)", "+2 frigates (5 in total)"],
             cost: [{ vgold: 50, chart: 50 }, { core: 100, chart: 100 }, { c_alloy: 150, c_chip: 150 }] },
});
SP_RESEARCH.ships.name = "Extra courier ships";
SP.drift = SP.drift || { found: false };
SP.harvest = SP.harvest || [];
SP.fleet = SP.fleet || { frigates: 0, lost: 0, escortOn: true };
SP.alert = SP.alert || {};   // 🔔 one-time tab alerts: harv (a harvester came home), craft (a crafting batch is done)
// research gives frigates: new ones arrive ready
function spFrigSync() { const cap = SP_FRIG_N[spRL("frigate")]; if ((SP.fleet.got || 0) < cap) { SP.fleet.frigates += cap - (SP.fleet.got || 0); SP.fleet.got = cap; } }
spFrigSync();
const spHarvMax = () => SP_HARV_N[spRL("harvest")];
const spHarvFree = () => Math.max(0, spHarvMax() - SP.harvest.length);
const spFrigBusy = () => SP.trips.filter(t => t.escort).length + SP.harvest.filter(h => h.escort).length;
const spFrigFree = () => Math.max(0, SP.fleet.frigates - spFrigBusy());
const spFrigCap = () => SP_FRIG_N[spRL("frigate")];
const spScouting = () => !!(SP.drift.scout);
const spSI = (n, cls = "spShipI") => `<img class="${cls}" src="assets/space/ship-${n}.webp" alt="" onerror="this.replaceWith(document.createTextNode('${{ courier: "🚀", harvester: "✨", frigate: "🛡️" }[n]}'))">`;

/* ----- 🔭 exploring the Drift (uses a courier ship) ----- */
function spDriftExplore() {
  if (isPaused() || SP.drift.found || spScouting() || !spFree() || spSci2() < SP_EXPLORE_SCI) return;
  spendScientists(SP_EXPLORE_SCI);
  const now = Date.now(), ms = SP_DRIFT.min * 60e3;
  SP.drift.scout = { t0: now, t1: now + ms, t2: now + 2 * ms };
  showNotice(`🚀 A courier ship is on its way to explore the strange signal (${SP_DRIFT.min} min there, ${SP_DRIFT.min} min back).`);
  save(); renderSpace();
}

/* ----- ✨ harvesting ----- */
function spHarvLaunch(escort) {
  if (isPaused() || !SP.drift.found || !spHarvFree()) return;
  if (escort && !spFrigFree()) escort = false;
  const now = Date.now(), go = SP_DRIFT.min * 60e3, f0 = now + go, half = SP_DRIFT.farm / 2;
  const raid = (i) => Math.random() < SP_RAID[i] ? { at: f0 + i * half + Math.random() * half, kill: Math.random() < SP_FRIG_LOSE } : null;
  SP.harvest.push({ id: SP.nextId++, t0: now, f0, f1: f0 + SP_DRIFT.farm, t2: f0 + SP_DRIFT.farm + go, rate: SP_HARV_RATE[spRL("harvest")], escort: !!escort, raids: [raid(0), raid(1)].filter(Boolean), lost: 0 });
  showNotice(`✨ A Stardust Harvester is on its way to the Stardust Drift${escort ? " with a 🛡️ frigate escort" : " (no escort: watch out for pirates!)"}.`);
  save(); renderSpace();
}
const spFarmed = (h, t) => Math.floor(h.rate * Math.max(0, Math.min(t, h.f1) - h.f0) / 60e3);
function spFrigBuild() {
  if (isPaused() || SP.fleet.frigates >= spFrigCap() || state.money < SP_FRIG_PRICE) return;
  state.money -= SP_FRIG_PRICE; SP.fleet.frigates++; SP.stats.frigBuilt = (SP.stats.frigBuilt || 0) + 1;
  showNotice("🛡️ A new Escort Frigate is ready.");
  updateCounter(); save(); renderSpace();
}

// every second (from spProcess): scouting, raids and harvesters coming home. Returns true when the page should redraw.
function spFleetTick(now, msgs) {
  let changed = false;
  spFrigSync();
  const sc = SP.drift.scout;
  if (sc && now >= sc.t2) {
    SP.drift.scout = null; SP.drift.found = true; SP.drift.foundAt = now; changed = true;
    msgs.push(`🌫️ Your courier ship found the <b>Stardust Drift</b>: a glittering cloud full of stardust, and full of pirates. ${spRL("harvest") ? "Send a ✨ Stardust Harvester to farm it!" : "Research ✨ Stardust Harvesters (🌌 Space → Research) to farm it."}`);
  }
  for (const h of SP.harvest) {
    for (const r of h.raids) {
      if (r.done || now < r.at) continue;
      r.done = true; changed = true; SP.stats.raids = (SP.stats.raids || 0) + 1;
      const stash = spFarmed(h, r.at) - h.lost;
      if (h.escort && !r.kill) { SP.stats.raidsWon = (SP.stats.raidsWon || 0) + 1; msgs.push(`🛡️ Pirates attacked your harvester in the Stardust Drift, but your frigate drove them off!`); continue; }
      h.lost += stash; SP.stats.dustLost = (SP.stats.dustLost || 0) + stash;
      if (h.escort) {
        h.escort = false; SP.fleet.frigates = Math.max(0, SP.fleet.frigates - 1); SP.fleet.lost++;
        msgs.push(`💥 Pirates destroyed your escort frigate in the Stardust Drift and took ✨ ${stash.toLocaleString()} stardust! Build a new frigate for ${fmt(SP_FRIG_PRICE)} (🌍 Home).`);
      } else msgs.push(`🏴‍☠️ Pirates raided your unprotected harvester in the Stardust Drift and took ✨ ${stash.toLocaleString()} stardust! It keeps farming.`);
    }
    if (now >= h.t2) {
      h.done = true; changed = true;
      const got = Math.max(0, spFarmed(h, h.f1) - h.lost);
      if (!state.shooter) state.shooter = {};
      state.shooter.dust = (state.shooter.dust || 0) + got;
      SP.stats.dustFarmed = (SP.stats.dustFarmed || 0) + got; SP.stats.harvests = (SP.stats.harvests || 0) + 1;
      SP.alert.harv = true;
      msgs.push(`✨ Your harvester is back from the Stardust Drift with <b>${got.toLocaleString()}</b> stardust${h.lost ? ` (pirates took ${h.lost.toLocaleString()})` : ""}.`);
    }
  }
  if (changed) SP.harvest = SP.harvest.filter(h => !h.done);
  return changed;
}

/* ----- 🛡️ courier escorts: pirates leave an escorted courier ship alone ----- */
function spEscortFor(tr) { if (SP.fleet.escortOn && spFrigFree() > 0) tr.escort = true; }

/* ----- 🗺️ map: the Drift node ----- */
function spDriftLine() {
  const vis = true, cls = SP.harvest.length || spScouting() ? "busy" : SP.drift.found ? "known" : "";
  const d = "M80 40 Q76 26 80 14";
  return vis ? (cls === "busy" ? `<path d="${d}" class="glow busy"/>` : "") + `<path d="${d}" class="${cls}"/>` : "";
}
function spDriftNode() {
  const f = SP.drift.found, n = SP.harvest.length;
  const lbl = f ? `Stardust Drift<small>${n ? `✨ ${n} harvesting` : "🏴‍☠️ Pirate space"}</small>` : `Unknown signal<small>❓ Explore</small>`;
  return `<button class="spNode ${f ? "found" : "fog"} spDrift ${spSel === "drift" ? "sel" : ""}" data-sp="drift" style="left:${SP_DRIFT.pos[0]}%;top:${SP_DRIFT.pos[1]}%">
    <img src="assets/space/${f ? "sys-drift" : "sys-unknown"}.webp" alt="" draggable="false" ${f ? `onerror="this.src='assets/space/sys-stardust.webp';this.classList.add('spDriftTmp')"` : ""}><span class="spLbl">${lbl}</span></button>`;
}

/* ----- 🪧 panels ----- */
function spHarvLine(h) {
  const now = Date.now();
  const st = now < h.f0 ? `flying there · farming starts in <b data-spt="${h.f0}">${spClock(h.f0 - now)}</b>`
    : now < h.f1 ? `farming · ✨ <b>${Math.max(0, spFarmed(h, now) - h.lost).toLocaleString()}</b> so far · done in <b data-spt="${h.f1}">${spClock(h.f1 - now)}</b>`
    : `coming home · back in <b data-spt="${h.t2}">${spClock(h.t2 - now)}</b> with ✨ <b>${Math.max(0, spFarmed(h, h.f1) - h.lost).toLocaleString()}</b>`;
  return `<div class="spTrip">${spSI("harvester")} Harvester${h.escort ? ` + ${spSI("frigate")} escort` : " · <span class=\"spWarnTxt\">no escort</span>"} · ${st}</div>`;
}
function spDriftPanel() {
  const now = Date.now();
  if (!SP.drift.found) {
    const sc = SP.drift.scout;
    return `<h3 class="spH">${spI("explore", "spI big")} Unknown signal</h3>
      <p>A strange glittering cloud at the edge of your scanners. Send a courier ship to explore it: <b>${SP_DRIFT.min} min</b> there and <b>${SP_DRIFT.min} min</b> back.</p>
      ${sc ? `<div class="spTrip">🚀 Exploring the signal · back in <b data-spt="${sc.t2}">${spClock(sc.t2 - now)}</b></div>`
        : `<button class="btn big" data-spf="explore" ${spFree() && spSci2() >= SP_EXPLORE_SCI ? "" : "disabled"}>${spI("explore", "spI btnI")}Explore · 🔬 ${SP_EXPLORE_SCI} scientists</button>
        ${!spFree() ? `<div class="muted">All your courier ships are busy.</div>` : spSci2() < SP_EXPLORE_SCI ? `<div class="muted">You need ${SP_EXPLORE_SCI} scientists (you have ${spSci2()}).</div>` : ""}`}`;
  }
  const L = spRL("harvest"), can = spHarvFree() > 0, fr = spFrigFree() > 0;
  return `<div class="spCardHead"><div class="spCardSys" style="background-image:url(assets/space/sys-drift.webp)"></div>
      <div class="spHeadTxt"><h3 class="spH"><img class="spI big" src="assets/space/sys-drift.webp" alt="">Stardust Drift <span class="muted">· Pirate space</span></h3>
        <p class="spBio">A glittering cloud of stardust left behind by dying stars. Harvesters can farm it, but wild pirates hunt here and nobody controls them, not even the Void Corsairs.</p></div></div>
    <div class="spInfo"><div class="spRow">${spI("distance")}<span><b>Distance:</b> ${SP_DRIFT.min} min each way · farming takes 1 hour</span></div>
      <div class="spRow">🏴‍☠️<span><b>Pirates:</b> ${SP_RAID[0] * 100}% chance of an attack in the first half hour of farming, ${SP_RAID[1] * 100}% in the second. Without an escort they take all the stardust farmed so far. A 🛡️ frigate drives them off, but has a ${SP_FRIG_LOSE * 100}% chance to be destroyed in each attack (and then the stardust is lost too).</span></div></div>
    ${SP.harvest.length ? `<h4>Harvesters at work</h4>${SP.harvest.map(spHarvLine).join("")}` : ""}
    ${L ? `<div class="spRoute ${can ? "" : "locked"}"><div class="spRow">${spSI("harvester")}<span><b>Stardust Harvesters:</b> ${SP.harvest.length} / ${spHarvMax()} out · each farms <b>${SP_HARV_RATE[L]}</b> stardust a minute (✨ ${(SP_HARV_RATE[L] * 60).toLocaleString()} an hour).</span></div>
        <div class="spBtns"><button class="btn big" data-spf="harv1" ${can && fr ? "" : "disabled"}>${spSI("frigate", "spShipI btnI")}Send with escort</button>
          <button class="btn ghost" data-spf="harv0" ${can ? "" : "disabled"}>${spSI("harvester", "spShipI btnI")}Send without escort</button></div>
        <div class="muted">${!can ? "All your harvesters are out." : !fr ? (SP.fleet.frigates ? "All your frigates are busy." : spFrigCap() ? `No frigates: build one for ${fmt(SP_FRIG_PRICE)} at 🌍 Home.` : "Research 🛡️ Escort Frigates (🌌 Space → Research) to protect your harvesters.") : `🛡️ Frigates free: ${spFrigFree()} / ${SP.fleet.frigates}`}</div></div>`
      : `<div class="spRoute locked spRow">${spSI("harvester")}<span>Research <b>✨ Stardust Harvesters</b> (🌌 Space → Research) to farm stardust here.</span></div>`}
    <div class="spStats"><span>✨ Farmed: <b>${(SP.stats.dustFarmed || 0).toLocaleString()}</b></span><span>🏴‍☠️ Attacks: <b>${SP.stats.raids || 0}</b></span><span>🛡️ Driven off: <b>${SP.stats.raidsWon || 0}</b></span><span>💥 Frigates lost: <b>${SP.fleet.lost || 0}</b></span></div>`;
}
// 🌍 Home panel: the whole fleet
function spFleetHtml() {
  const H = spHarvMax(), F = spFrigCap();
  if (!H && !F) return "";
  return `<h4>🛸 Fleet</h4><ul class="spSlots">
      <li>${spSI("courier")} Courier ships: <b>${spFree()} / ${spShips()}</b> free <span class="muted">(gifts, trade routes, contracts, exploring)</span></li>
      ${H ? `<li>${spSI("harvester")} Stardust Harvesters: <b>${spHarvFree()} / ${H}</b> free</li>` : ""}
      ${F ? `<li>${spSI("frigate")} Escort Frigates: <b>${spFrigFree()} / ${SP.fleet.frigates}</b> free${SP.fleet.frigates < F ? ` · ${F - SP.fleet.frigates} destroyed` : ""}</li>` : ""}</ul>
    ${F ? `<div class="spBtns">${SP.fleet.frigates < F ? `<button class="btn" data-spf="build" ${state.money >= SP_FRIG_PRICE ? "" : "disabled"}>${spSI("frigate", "spShipI btnI")}Build a frigate · ${fmt(SP_FRIG_PRICE)}</button>` : ""}
      <label class="spCheck"><input type="checkbox" data-spf="escort" ${SP.fleet.escortOn ? "checked" : ""}> 🛡️ Send a free frigate with every courier ship (pirates leave escorted ships alone)</label></div>` : ""}`;
}

document.addEventListener("click", (e) => {
  if (!e.target.closest("#spaceView") || isPaused()) return;
  const b = e.target.closest("[data-spf]"); if (!b) return;
  const k = b.dataset.spf;
  if (k === "explore") spDriftExplore();
  if (k === "harv1" || k === "harv0") spHarvLaunch(k === "harv1");
  if (k === "build") spFrigBuild();
});
document.addEventListener("change", (e) => {
  const b = e.target.closest('[data-spf="escort"]'); if (!b) return;
  SP.fleet.escortOn = b.checked; save();
});

/* ----- 🔔 tab alerts: what is worth a look on each Space page ----- */
function spTabAlerts() {
  const A = SP.alert, out = { space: [], contracts: [], research: [] };
  // seen: opening the page (or the Drift) clears the one-time alerts
  if (spShown() && state.logiPage === "research") A.craft = false;
  if (spShown() && state.logiPage === "space" && spSel === "drift") A.harv = false;
  if (A.harv && spHarvFree()) out.space.push("A harvester is back from the Stardust Drift");
  const C = SP.con || { active: [], offers: [] };
  if (C.active.some(c => !c.sent && spConHave(c)) && spFree()) out.contracts.push("A contract is ready to deliver");
  else if (C.active.length < SP_CON.maxActive && C.offers.some(spConHave)) out.contracts.push("You already have the goods for a contract offer");
  if (A.craft) out.research.push("Crafting is done");
  if (Object.keys(SP_RESEARCH).some(k => spResCan(spResCost(k)))) out.research.push("You can afford a research level");
  return out;
}
spProcess();   // catch up on everything that happened while the game was closed (needs all the space files)

/* ----- 🗺️ harvesters (and their escorts) flying to the Drift and farming there ----- */
const SP_DRIFT_CURVE = { a: [50, 50], c: [47.5, 31], b: [50, 13] };
function spHarvPos(h, now, lag = 0) {
  const t = now - lag;
  if (t >= h.f0 && t < h.f1) {   // farming: slow circles around the cloud
    const a = (t / 9000 + h.id) % (Math.PI * 2), x = 50 + Math.cos(a) * 7, y = 10 + Math.sin(a) * 4;
    return { x, y, ang: Math.sin(a) > 0 ? 180 : 0, op: 1 };
  }
  const out = t < h.f0, p = Math.max(0, Math.min(1, out ? (t - h.t0) / (h.f0 - h.t0) : (t - h.f1) / (h.t2 - h.f1)));
  const B = spBez(SP_DRIFT_CURVE, 0.1 + 0.8 * (out ? p : 1 - p));
  let ang = Math.atan2(B.dy, B.dx * spAsp()) * 180 / Math.PI; if (!out) ang += 180; if (ang > 180) ang -= 360;
  return { x: B.x, y: B.y, ang, op: Math.max(0.15, Math.min(1, p / 0.05, (1 - p) / 0.05)) };
}
const spScoutH = () => { const c = SP.drift.scout; return c ? { id: 0, t0: c.t0, f0: c.t1, f1: c.t1, t2: c.t2 } : null; };
const spHarvShipsHtml = (now) => (spScoutH() ? `<img class="spShip" data-harv="scout" src="assets/space/ship-explorer.webp" alt="" draggable="false" style="${spShipCss(spHarvPos(spScoutH(), now))}">` : "") + SP.harvest.map(h => `<img class="spShip harvester" data-harv="${h.id}" src="assets/space/ship-harvester.webp" alt="" draggable="false" style="${spShipCss(spHarvPos(h, now))}">`
  + (h.escort ? `<img class="spShip frigate" data-hesc="${h.id}" src="assets/space/ship-frigate.webp" alt="" draggable="false" style="${spShipCss(spHarvPos(h, now, 12e3))}">` : "")).join("");
function spHarvAnimate(now) {
  const sc = document.querySelector('.spShip[data-harv="scout"]'); if (sc && spScoutH()) sc.style.cssText = spShipCss(spHarvPos(spScoutH(), now));
  for (const h of SP.harvest) {
    const el = document.querySelector(`.spShip[data-harv="${h.id}"]`); if (el) el.style.cssText = spShipCss(spHarvPos(h, now));
    const es = document.querySelector(`.spShip[data-hesc="${h.id}"]`);
    if (es) { if (!h.escort) es.remove(); else es.style.cssText = spShipCss(spHarvPos(h, now, 12e3)); }
  }
}
