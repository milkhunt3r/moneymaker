/* Empire of Coins © 2026 milkhunt3r. All rights reserved. */
/* =====================================================================
   🌍 EARTH LOGISTICS LAYOUT (loaded after the space files: the left menu is built by then)
   · One slim bar (level, money, vehicles on the road, contracts) instead of the level card and the wallet card.
   · Trucks · Tankers · Planes tabs: one fleet at a time. Picking a tab also shows only that fleet on the world map.
   ===================================================================== */
const LG_TABS = [["truck", "Trucks", "lg-truck"], ["tanker", "Tankers", "lg-tanker"], ["plane", "Planes", "lg-plane"]];
(function lgSetup() {
  const main = $("logiMain") || $("logisticsView");
  const hud = document.createElement("div"); hud.id = "logiHud"; hud.className = "card ivHud lgHud";
  ($("satelliteCard") || $("mapCard")).before(hud);
  // the three fleet cards: their lists are #trucks, #tankers and #planes
  LG_TABS.forEach(([k]) => { const box = $(FLEETS[k].box), card = box && box.closest(".card"); if (card) { card.dataset.lgfleet = k; card.classList.add("lgFleetCard"); } });
  const first = main.querySelector('[data-lgfleet="truck"]');
  const tabs = document.createElement("div"); tabs.id = "lgTabs"; tabs.className = "lgTabs"; first.before(tabs);
})();
if (!LG_TABS.some(t => t[0] === state.logiFleet)) state.logiFleet = "truck";

const lgBusy = (k) => fleetList(k).filter(v => v.contract).length;
const lgIdle = (k) => fleetList(k).filter(v => !v.contract && !v.broken).length;
const lgBroken = (k) => fleetList(k).filter(v => v.broken).length;
function lgHudHtml() {
  const info = levelInfo(state.logiXp, LOGI_XP);
  return `<button class="casHudLv" data-levels="logistics" title="Logistics level · ${info.max ? "max level" : `${fmtNum(info.into)} / ${fmtNum(info.need)} XP`}">${ico("lg-level")}<span>Lv <b>${info.level}</b></span>
      <span class="casHudXp"><i style="width:${info.max ? 100 : 100 * info.into / info.need}%"></i></span></button>
    <span class="casHudMoney" title="Your money"><img class="coinSkinImg" src="${coinSkinSrc()}" alt=""><b>${fmt(state.money)}</b></span>
    ${LG_TABS.filter(([k]) => fleetList(k).length).map(([k, n, ic]) => `<span class="ivHold" title="${n} on the road / owned">${ico(ic)}<b>${lgBusy(k)} / ${fleetList(k).length}</b></span>`).join("")}
    <span class="ivHold" title="Contracts fulfilled">${ico("lg-contracts")}<b>${(logi.contracts || 0).toLocaleString()}</b></span>
    <span class="ivHold" title="Delivered (all time)">${ico("lg-crates")}<b>${fmt(logi.earned || 0)}</b></span>`;
}
function lgTabsHtml() {
  return LG_TABS.map(([k, n, ic]) => {
    const own = fleetList(k).length, idle = lgIdle(k), br = lgBroken(k), locked = !fleetUnlocked(k) && !own;
    const note = !own ? (locked ? "locked" : "none yet") : `${lgBusy(k)} on the road${idle ? ` · ${idle} waiting` : ""}${br ? ` · ${br} broken` : ""}`;
    return `<button class="lgTab ${state.logiFleet === k ? "on" : ""} ${idle || br ? "needs" : ""}" data-lgtab="${k}">${locked ? ico("lock", "lockS") : ""}${ico(ic)}<span><b>${n}</b> <small class="muted">${own} / ${FLEETS[k].slots}</small><small>${note}</small></span>
      ${br ? `<span class="tabWarn" title="Broken down">!</span>` : idle ? `<span class="tabWarn gold" title="Waiting for a contract">!</span>` : ""}</button>`; }).join("");
}
function lgApply() { document.querySelectorAll("[data-lgfleet]").forEach(c => { c.hidden = c.dataset.lgfleet !== state.logiFleet; }); }
function lgRefresh() {
  if ($("logisticsView").hidden) return;
  const h = $("logiHud"), x = lgHudHtml(); if (h.dataset.h !== x) { h.dataset.h = x; h.innerHTML = x; }
  const t = $("lgTabs"), y = lgTabsHtml(); if (t.dataset.h !== y) { t.dataset.h = y; t.innerHTML = y; }
}
$("lgTabs").addEventListener("click", (e) => {
  const b = e.target.closest("[data-lgtab]"); if (!b || isPaused()) return;
  state.logiFleet = b.dataset.lgtab;
  // 🗺️ the map follows: only this fleet's vehicles and cities (the map's own buttons can still add the others)
  state.mapShow = { truck: false, tanker: false, plane: false, [state.logiFleet]: true };
  if (typeof updateMapControls === "function") { updateMapControls(); renderMapVehicles(); }
  lgApply(); lgRefresh(); save();
});
lgApply(); lgRefresh();
setInterval(lgRefresh, 1000);
