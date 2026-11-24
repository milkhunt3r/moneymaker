/* Empire of Coins © 2026 milkhunt3r. All rights reserved. */
/* =====================================================================
   ⏱️ GAME CLOCK + OFFLINE EARNINGS
   The game runs one game second (gameTick + freeTick) for every REAL second that passed, measured with Date.now().
   Browsers slow down timers in background tabs (Chrome: about once a minute), so when the clock wakes up
   it catches up all the missed seconds at once: a hidden tab earns the same as a visible one.
   If more than 5 minutes passed (game closed, computer asleep), the game pays OFFLINE EARNINGS instead:
     · up to 8 hours count; income runs at 50% (businesses, special businesses, gold mines, rent)
     · timers run at full speed: contracts on their way, express offers, free bet chips, VIP chips,
       property sale locks and the gold cooldown
     · nothing random happens while away (no taxes, crashes, breakdowns or market moves)
   While a tax payment is waiting (the game is paused) the time is not counted, as before.
   ===================================================================== */
const CATCHUP_MAX = 300, OFFLINE_CAP = 8 * 3600, OFFLINE_RATE = 0.5;
function awayText(sec) {
  const h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60);
  return h ? `${h}h ${m}m` : m ? `${m}m` : `${Math.floor(sec)}s`;
}
function applyOffline(seconds) {
  const away = Math.floor(Math.min(seconds, OFFLINE_CAP)), eff = away * OFFLINE_RATE, rows = [];
  let total = 0;
  // businesses and special businesses: average of the last minute you played
  const hist = state.passiveHist || [];
  const rate = hist.length ? hist.reduce((a, b) => a + b, 0) / hist.length : Math.max(0, state.lastIncome || 0);
  const biz = Math.floor(rate * eff);
  if (biz > 0) { rows.push(["💼 Businesses", biz]); total += biz; }
  // gold mines: limited by the gold that is left
  let gold = 0;
  const perMine = MINE_INCOME * (1 + LAW_IMMIGRATION * lawCount("immigration"));
  for (const m of state.special.mines) { const p = Math.min(m.capacity - m.mined, perMine * eff); m.mined += p; gold += p; }
  gold = Math.floor(gold * legacyIncomeMult());
  if (gold > 0) { rows.push(["⛏️ Gold mines", gold]); total += gold; }
  // real estate rent
  let rent = 0;
  for (const p of inv.properties) {
    let t = eff;
    if (t >= p.rentIn) { const n = 1 + Math.floor((t - p.rentIn) / RE_RENT_EVERY); rent += n * p.value * RE_RENT_RATE; p.rentIn = RE_RENT_EVERY - ((t - p.rentIn) % RE_RENT_EVERY) || RE_RENT_EVERY; }
    else p.rentIn -= t;
    p.rentIn = Math.max(1, Math.round(p.rentIn));
    if (p.lock > 0) p.lock = Math.max(1, p.lock - away);   // unlocks on the next game second
  }
  rent = Math.floor(rent);
  if (rent > 0) { rows.push(["🏠 Rent", rent]); total += rent; investRecord("re", 0, rent); }
  if (inv.goldCooldown > 0) inv.goldCooldown = Math.max(0, inv.goldCooldown - away);
  // logistics: contracts keep travelling (they arrive and pay on the next game second)
  let arriving = 0;
  for (const key in FLEETS) for (const v of fleetList(key)) {
    if (v.contract) { v.contract.left = Math.max(1, v.contract.left - away); if (v.contract.left === 1) arriving++; }
    if (v.offers) v.offers.forEach(o => { if (o.express) o.express = Math.max(1, o.express - away); });
  }
  // free bet chips and VIP chips
  let chips = 0;
  const addChips = (have, timer, gap, cap = FREE_CHIP_MAX) => {   // -> [new count, new timer]
    if (have >= cap) return [have, gap];
    if (away < timer) return [have, timer - away];
    const n = 1 + Math.floor((away - timer) / gap), got = Math.min(n, cap - have);
    chips += got;
    return [have + got, have + got >= cap ? gap : gap - ((away - timer) % gap)];
  };
  if (!isPaused()) {
    const gap = freeChipMinutes() * 60;
    for (const c of freeUnlocked()) {
      const [n, t] = addChips(state.freeChips[c.value] || 0, Math.min(state.freeTimers[c.value] || gap, gap), gap, freeCap(c.value));
      state.freeChips[c.value] = n; state.freeTimers[c.value] = Math.max(1, t);
    }
    if (state.legacy.vip > 0) {
      const gapV = vipMinutes() * 60;
      const [n, t] = addChips(state.freeChips[VIP_CHIP] || 0, Math.min(state.vip.timer || gapV, gapV), gapV, freeCap(VIP_CHIP));
      state.freeChips[VIP_CHIP] = n; state.vip.timer = Math.max(1, t);
    }
  }
  // 🔬 Science: scientists keep arriving, space missions keep launching, at most ONE breakthrough while away
  const S = state.science;
  let nobelAway = false;
  if (S) for (const u of [S.uni, S.uni2]) if (u && u.scientists < UNI_MAX) {
    if (away >= u.timer) {
      const n = 1 + Math.floor((away - u.timer) / UNI_EVERY);
      u.scientists = Math.min(UNI_MAX, u.scientists + n);
      u.timer = UNI_EVERY - ((away - u.timer) % UNI_EVERY);
    } else u.timer -= away;
    u.timer = Math.max(1, Math.round(u.timer));
  }
  if (S && S.space) {
    let t = away, got = 0, launched = 0, failed = 0;
    while (t >= S.space.timer) { t -= S.space.timer; S.space.timer = spaceEvery(); const m = launchMission(); got += m.reward; launched++; if (!m.reward) failed++; }
    S.space.timer = Math.max(1, Math.round(S.space.timer - t));
    if (launched) { rows.push([`🚀 Space missions (${launched}${failed ? `, ${failed} failed` : ""})`, got]); total += got; }
  }
  if (S && S.lab && !S.lab.pending) {
    const p = 1 - Math.pow(1 - 1 / labOdds(), away);
    if ((S.lab.since || 0) + away >= labOdds() || secureRandomInt(1e6) < p * 1e6) nobelAway = true;
    else S.lab.since = (S.lab.since || 0) + away;
  }
  state.money += total;
  state.stats.offlineEarned = (state.stats.offlineEarned || 0) + total;
  if (nobelAway) {   // shown after the "while you were away" pop-up is closed
    const field = secureRandomInt(NOBEL_FIELDS.length);
    S.lab.pending = { field, find: secureRandomInt(NOBEL_FIELDS[field].finds.length) };
    S.lab.since = 0;
  }
  updateCounter();
  if (seconds < CATCHUP_MAX || (!total && !arriving && !chips && !nobelAway)) { if (nobelAway) showNobel(); return; }
  showModal(`<img class="awayLogo" src="assets/logo/logo-banner.webp" alt="Empire of Coins">
    <h2>${ico("offline", "h")}While you were away</h2>
    <p>You were gone for <b>${awayText(seconds)}</b>${seconds > OFFLINE_CAP ? ` (up to ${OFFLINE_CAP / 3600} hours count)` : ""}.
      Your empire kept working at ${OFFLINE_RATE * 100}% speed:</p>
    ${rows.length ? `<table class="wikiTable">${rows.map(([k, v]) => `<tr><td>${k}</td><td style="text-align:right"><b class="income">+${fmt(v)}</b></td></tr>`).join("")}
      <tr><td><b>Total</b></td><td style="text-align:right"><b class="income">+${fmt(total)}</b></td></tr></table>` : ""}
    ${arriving ? `<p>🚚 ${arriving} contract${arriving === 1 ? "" : "s"} arrived and will pay out now.</p>` : ""}
    ${chips ? `<p>🎁 ${chips} free bet chip${chips === 1 ? "" : "s"} collected.</p>` : ""}
    ${nobelAway ? `<p>🏅 Your Research lab made a scientific breakthrough!</p>` : ""}
    <p class="muted">Tip: while the game is open (even in a background tab) it earns at full speed.</p>
    <button class="btn big" data-modal="close">💰 Collect</button>`);
  $("modalBox").classList.add("gold");
  if (typeof showTip === "function") showTip("offline");
}

function gameClock() {
  const now = Date.now();
  if (sci().lab && sci().lab.pending && $("modal").hidden) showNobel();   // a Nobel Prize is waiting to be accepted
  if (isPaused()) { state.lastTick = now; return; }   // a tax payment is waiting: time is not counted
  const due = Math.floor((now - state.lastTick) / 1000);
  if (due <= 0) return;
  if (due > CATCHUP_MAX) {   // asleep or closed for a long time: offline earnings
    applyOffline((now - state.lastTick) / 1000);
    state.lastTick = now; save(); flushSave();   // write right away so the same offline time can't be paid twice
    return;
  }
  catchingUp = due > 1;
  try {
    for (let i = 0; i < due; i++) {
      gameTick(); freeTick();
      state.lastTick += 1000;
      if (isPaused()) { state.lastTick = now; break; }
    }
  } finally { catchingUp = false; }
  save();
}
// Start: pay what was missed since the last save, then run the clock 4 times a second (each run does whole seconds)
if (typeof state.lastTick !== "number" || state.lastTick > Date.now()) state.lastTick = Date.now();
if (!state.gameOver && Date.now() - state.lastTick > CATCHUP_MAX * 1000) {
  applyOffline((Date.now() - state.lastTick) / 1000);
  state.lastTick = Date.now(); save(); flushSave();
}
setInterval(gameClock, 250);

// ✋ a save edited outside the game was refused (💾 STORAGE in js/01-core.js): tell the player once
if (saveTamper) setTimeout(() => showModal(`<h2>⚠️ Your save couldn't be loaded</h2>
  <p>The saved game in this browser was changed outside the game, so it was not loaded.</p>
  <p>${saveTamper.backup ? "Your last automatic backup was loaded instead." : "A new game was started. If you play with a Google account, sign in (👤 Profile) to get your ☁️ cloud save back."}</p>
  <div class="row" style="justify-content:center"><button class="btn big" data-modal="close">OK</button></div>`), 1500);

// Start
updateCounter();
updateDebt();
render();
renderCasino();
updateCasinoLevel();
updateInvestLevel();
renderProperties();
updateInvestLive();
renderCosmetics(); applyCosmetics();
renderTankers(); updateAgentButton(); updateLogiLevel();
showView(state.view === "shop" ? "pet" : ["casino", "invest", "pet", "logistics", "achievements", "wiki", "art", "games", "profile"].includes(state.view) ? state.view : "income");
if (state.gameOver) showGameOver(state.taxDebts[0] || { amount: 0 });
else if (state.pendingTaxId !== null) {
  const d = state.taxDebts.find(x => x.id === state.pendingTaxId);
  if (d) showPaymentPopup(d); else state.pendingTaxId = null;
}
