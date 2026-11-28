/* Empire of Coins © 2026 milkhunt3r. All rights reserved. */
/* =====================================================================
   🌌 SPACE POLITICS & ECONOMY (loaded right after js/34-space.js)
   · ⚔️ RIVALRIES: 4 pairs of races dislike each other. Friendship you earn with one costs 30% of it with its rival.
     A rival never drops below 😊 Friendly because of this (or below the level it is at, if it isn't Friendly yet).
   · ❄️ UPKEEP: a race you have ever been 💛 Trusted with cools off after 24 h without a gift, a contract or a running
     trade route: −40 friendship an hour, never below 😊 Friendly. One gift (or keeping a route) warms them up again.
   · 📉 SUPPLY & DEMAND: selling a good floods the market: every unit sold lowers its price a little more.
     The market recovers by itself (half of the effect is gone after 3 hours).
   · 📜 CONTRACTS: a board of 3 jobs ("bring 20 Star Crystals and 12 Void Gold to the Lumerians within 3 h").
     Accept up to 2, deliver them with a ship before the deadline: money + friendship. Late: half pay, no friendship.
     Missing the deadline (or giving up) costs 50 friendship.
   ===================================================================== */
const SP_RIVALS = { bank: "pirate", pirate: "bank", rock: "art", art: "rock", stardust: "bio", bio: "stardust", mystic: "machine", machine: "mystic" };
const SP_RIVAL_CUT = 0.3, SP_FRIENDLY = 1000;
const SP_COOL = { after: 24 * 3600e3, perHour: 40, from: 2500 };
const SP_SAT = { k: 150, half: 3 * 3600e3 };
const SP_CON = { board: 3, maxActive: 2, offerLife: 6 * 3600e3, refill: 3600e3, pts: 150, fail: 50, payX: 2.5 };
SP.press = SP.press || {};
SP.con = SP.con || { offers: [], active: [], next: 0, done: 0, failed: 0, late: 0, earned: 0 };
Object.values(SP.races).forEach(r => { if (r.found) { r.best = Math.max(r.best || 0, r.pts); if (!r.warmAt) r.warmAt = Date.now(); } });

/* ----- 💞 friendship changes ----- */
// lowest a race can drop to from a penalty: Friendly, or the level it is at if it isn't Friendly yet
const spFloorPts = (k) => { const r = SP.races[k]; return r.pts >= SP_FRIENDLY ? SP_FRIENDLY : SP_LEVELS[spLevel(k)].pts; };
function spLosePts(k, n) { const r = SP.races[k], f = spFloorPts(k), before = r.pts; r.pts = Math.max(Math.min(f, r.pts), r.pts - n); return before - r.pts; }
function spWarm(k) { const r = SP.races[k]; r.warmAt = Date.now(); r.coolT = 0; r.best = Math.max(r.best || 0, r.pts); }
// friendship earned with k (gifts, contracts, rescues): the rival race gets jealous
function spRivalHit(k, pts, msgs) {
  const rk = SP_RIVALS[k]; if (!rk || !SP.races[rk].found || pts <= 0) return 0;
  const lost = spLosePts(rk, Math.round(pts * SP_RIVAL_CUT));
  if (lost && msgs) msgs.push(`😒 The ${SP_RACES[rk].name} didn't like you helping their rivals, the ${SP_RACES[k].name}: −${lost} friendship.`);
  return lost;
}
const spCooling = (k) => { const r = SP.races[k]; return r.found && (r.best || 0) >= SP_COOL.from && r.pts > SP_FRIENDLY && !spRouteOf(k) && spShips() > 0 && Date.now() - (r.warmAt || 0) > SP_COOL.after; };
function spCoolTick(now, msgs) {
  for (const k of Object.keys(SP_RACES)) {
    const r = SP.races[k]; if (!r.found) continue;
    r.best = Math.max(r.best || 0, r.pts);
    if (spRouteOf(k)) { r.warmAt = now; r.coolT = 0; continue; }   // a running trade route keeps them warm
    if (!spShips()) { r.warmAt = now; r.coolT = 0; continue; }     // 🔁 no ships (e.g. after a prestige reset, before the Science buildings are back): friendships wait, they don't cool
    if ((r.best || 0) < SP_COOL.from || r.pts <= SP_FRIENDLY) { r.coolT = 0; continue; }
    const start = Math.max((r.warmAt || now) + SP_COOL.after, r.coolT || 0);
    if (now <= start) continue;
    const dp = Math.floor((now - start) / 3600e3 * SP_COOL.perHour);
    if (dp <= 0) continue;
    const L0 = spLevel(k);
    r.pts = Math.max(SP_FRIENDLY, r.pts - dp);
    r.coolT = start + dp * 3600e3 / SP_COOL.perHour;
    if (spLevel(k) < L0) msgs.push(`❄️ The ${SP_RACES[k].name} feel forgotten and are now only <b>${SP_LEVELS[spLevel(k)].name}</b>. Send a gift or keep a trade route running.`);
  }
}

/* ----- 📉 supply & demand ----- */
const spPress = (g, now = Date.now()) => { const p = SP.press[g]; return p ? p.p * Math.pow(0.5, (now - p.t) / SP_SAT.half) : 0; };
const spSatMult = (g, extra = 0) => 1 / (1 + (spPress(g) + extra) / SP_SAT.k);
// what selling n units pays: every unit a little cheaper than the one before
function spSellValue(g, n) { const base = spPrice(g, spSlot(), true); let s = 0; const p0 = spPress(g); for (let i = 0; i < n; i++) s += base / (1 + (p0 + i) / SP_SAT.k); return Math.floor(s); }
function spFlood(g, n) { const now = Date.now(); SP.press[g] = { p: spPress(g, now) + n, t: now }; }

/* ----- 📜 contracts ----- */
function spConMake() {
  const now = Date.now(), found = Object.keys(SP_RACES).filter(k => SP.races[k].found);
  const targets = found.filter(k => spLevel(k) >= 2);
  if (!targets.length) return null;
  const to = targets[Math.floor(Math.random() * targets.length)];
  const pool = found.map(k => SP_RACES[k].good).filter(g => g !== SP_RACES[to].good);
  if (!pool.length) return null;
  const kinds = Math.min(pool.length, Math.random() < 0.5 ? 1 : 2), need = {};
  while (Object.keys(need).length < kinds) { const g = pool[Math.floor(Math.random() * pool.length)]; need[g] = 6 + Math.floor(Math.random() * 20); }
  const value = Object.entries(need).reduce((s, [g, n]) => s + n * spBase(g), 0);
  const hours = 2 + Math.floor(Math.random() * 3);
  return { id: SP.nextId++, to, need, pay: Math.max(1e6, spRound(value * SP_CON.payX * (1 + SP_RACES[to].min / 60))), pts: SP_CON.pts, hours, until: now + SP_CON.offerLife };
}
function spConTick(now, msgs) {
  const C = SP.con;
  C.offers = C.offers.filter(o => o.until > now && SP.races[o.to].found);
  if (C.offers.length < SP_CON.board && now >= (C.next || 0)) { const o = spConMake(); if (o) C.offers.push(o); if (C.offers.length >= SP_CON.board) C.next = 0; }
  for (const c of C.active) {
    if (!c.sent && now > c.deadline) {
      c.gone = true; C.failed++;
      const lost = spLosePts(c.to, SP_CON.fail);
      msgs.push(`📜 You missed the deadline of a contract for the ${SP_RACES[c.to].name}${lost ? `: −${lost} friendship` : ""}.`);
    }
  }
  C.active = C.active.filter(c => !c.gone);
  // 🔧 a sent contract whose ship already got there (or is gone) but was never paid: settle it now
  for (const c of [...C.active]) {
    if (!c.sent) continue;
    const tr = SP.trips.find(t => t.k === "contract" && t.cargo && t.cargo.cid === c.id);
    if (tr && !tr.arrived) continue;
    spConArrive(tr || { to: c.to, cargo: { cid: c.id }, t1: Math.min(now, c.deadline), lost: false }, msgs);
  }
}
const spConHave = (c) => Object.entries(c.need).every(([g, n]) => (SP.goods[g] || 0) >= n);
function spConAccept(id) {
  const C = SP.con, o = C.offers.find(x => x.id === id);
  if (!o || C.active.length >= SP_CON.maxActive || isPaused()) return;
  C.offers = C.offers.filter(x => x !== o);
  C.active.push({ ...o, deadline: Date.now() + o.hours * 3600e3 + spMs(o.to) });
  C.next = Date.now() + SP_CON.refill;
  save(); renderSpace();
}
function spConSend(id) {
  const C = SP.con, c = C.active.find(x => x.id === id);
  if (!c || c.sent || !spFree() || !spConHave(c) || isPaused()) return;
  Object.entries(c.need).forEach(([g, n]) => { SP.goods[g] -= n; });
  c.sent = true;
  spLaunch(c.to, "contract", { cid: c.id });
  showNotice(`📜 Contract cargo on its way to the ${SP_RACES[c.to].name} (${spMin(c.to)} min).`);
}
function spConDrop(id) {
  const C = SP.con, c = C.active.find(x => x.id === id);
  if (!c || c.sent) return;
  C.active = C.active.filter(x => x !== c); C.failed++;
  const lost = spLosePts(c.to, SP_CON.fail);
  showNotice(`📜 Contract cancelled${lost ? `: the ${SP_RACES[c.to].name} are disappointed (−${lost} friendship)` : ""}.`);
  save(); renderSpace();
}
// the cargo ship arrived (called from spProcess)
function spConArrive(tr, msgs) {
  const C = SP.con, c = C.active.find(x => x.id === tr.cargo.cid), R = SP_RACES[tr.to];
  if (!c) return;
  C.active = C.active.filter(x => x !== c);
  if (tr.lost) { C.failed++; msgs.push(`🏴‍☠️ Pirates stole the contract cargo for the ${R.name}. The contract is lost.`); return; }
  const late = tr.t1 > c.deadline, pay = late ? Math.floor(c.pay / 2) : c.pay;
  state.money += pay; clickedThisSecond += pay; C.earned += pay;
  if (late) { C.late++; msgs.push(`📜 Contract delivered late to the ${R.name}: half pay, ${fmt(pay)}.`); return; }
  C.done++;
  const before = spLevel(tr.to);
  SP.races[tr.to].pts += c.pts; spWarm(tr.to);
  msgs.push(`📜 Contract done! The ${R.name} paid ${fmt(pay)} and +${c.pts} friendship.`);
  if (spLevel(tr.to) > before) msgs.push(`${SP_LEVELS[spLevel(tr.to)].icon} The <b>${R.name}</b> are now <b>${SP_LEVELS[spLevel(tr.to)].name}</b>!`);
  spRivalHit(tr.to, c.pts, msgs);
  updateCounter();
}
const spNeedHtml = (need, sent) => Object.entries(need).map(([g, n]) => `<span class="spNeed ${sent || (SP.goods[g] || 0) >= n ? "ok" : ""}">${spGI(g)} <b>${n}</b> ${SP_GOODS[g].name}${sent ? "" : ` <small>(${(SP.goods[g] || 0).toLocaleString()})</small>`}</span>`).join("");
function spContractsHtml() {
  const C = SP.con, now = Date.now();
  const card = (c, active) => { const R = SP_RACES[c.to], sent = active && c.sent;
    const trip = sent && SP.trips.find(tr => tr.k === "contract" && tr.cargo && tr.cargo.cid === c.id);
    return `<div class="spCon ${active ? "active" : ""}"><img class="spConPic" src="${spPortrait(c.to)}" alt="">
      <div class="spConBody"><div class="spConTo"><b>${R.name}</b> <span class="muted">· ${R.title}</span></div>
        <div class="spConNeed">${spNeedHtml(c.need, sent)}</div>
        <div class="spConPay">💰 <b>${fmt(c.pay)}</b> · 💞 +${c.pts} friendship</div>
        <div class="muted">${active ? (sent ? (trip ? `${spI("deliver")} On its way · arrives in <b data-spt="${trip.t1}">${spClock(trip.t1 - now)}</b> · deadline in <b data-spt="${c.deadline}">${spClock(c.deadline - now)}</b>` : "🚀 Delivered") : `⏳ Deliver within <b data-spt="${c.deadline}">${spClock(c.deadline - now)}</b> (the ship needs ${spMin(c.to)} min to get there)`)
          : `⏱️ ${c.hours} h to deliver once accepted · offer ends in <b data-spt="${c.until}">${spClock(c.until - now)}</b>`}</div></div>
      <div class="spConBtns">${active ? (sent ? "" : `<button class="btn" data-spc="send" data-id="${c.id}" ${spFree() && spConHave(c) ? "" : "disabled"}>${spI("deliver", "spI btnI")}Deliver</button>
          <button class="btn ghost small" data-spc="drop" data-id="${c.id}">Give up</button>${!spConHave(c) ? `<div class="muted">Not enough goods yet.</div>` : !spFree() ? `<div class="muted">All ships are busy.</div>` : ""}`)
        : `<button class="btn" data-spc="take" data-id="${c.id}" ${C.active.length < SP_CON.maxActive ? "" : "disabled"}>${spI("accept", "spI btnI")}Accept</button>`}</div></div>`; };
  const nextIn = C.offers.length < SP_CON.board && C.next > now ? `<div class="muted">📜 A new contract arrives in <b data-spt="${C.next}">${spClock(C.next - now)}</b>.</div>` : "";
  return `<div class="card spResBar" id="spResBar">${spResHtml()}</div>
    <div class="card"><h2 style="margin-top:0"><img class="ico h" src="assets/icons/ico-lg-contracts.webp" alt="">Contracts board</h2>
      <p class="muted">Races pay well for goods from other worlds. Accept a contract (up to ${SP_CON.maxActive} at a time), then send a ship with the goods before the deadline: money and friendship. Late: half pay and no friendship. Missing the deadline or giving up: −${SP_CON.fail} friendship.</p>
      ${C.active.length ? `<h3 class="spH">${spI("accept")}Your contracts (${C.active.length}/${SP_CON.maxActive})</h3>${C.active.map(c => card(c, true)).join("")}` : ""}
      <h3>📋 Offers</h3>${C.offers.length ? C.offers.map(c => card(c, false)).join("") : `<p class="muted">${Object.values(SP.races).filter(r => r.found).length < 2 ? "Meet at least 2 races (and be Acquainted with one) to get contracts." : "No offers right now."}</p>`}${nextIn}
      <div class="spStats"><span>${spI("done")} Done: <b>${C.done}</b></span><span>${spI("late")} Late: <b>${C.late}</b></span><span>${spI("failed")} Failed: <b>${C.failed}</b></span><span>💰 Earned: <b>${fmt(C.earned)}</b></span></div></div>`;
}
document.addEventListener("click", (e) => {
  const b = e.target.closest("[data-spc]"); if (!b || !e.target.closest("#spaceView")) return;
  const id = Number(b.dataset.id);
  if (b.dataset.spc === "take") spConAccept(id);
  if (b.dataset.spc === "send") spConSend(id);
  if (b.dataset.spc === "drop") showModal(`<h2>Give up this contract?</h2><p>The ${SP_RACES[(SP.con.active.find(c => c.id === id) || {}).to || "rock"].name} will be disappointed: −${SP_CON.fail} friendship.</p>
    <div class="row" style="justify-content:center;gap:10px"><button class="btn ghost" data-modal="close">Keep it</button><button class="btn dangerBtn" data-spc2="drop" data-id="${id}">Give up</button></div>`);
});
$("modal").addEventListener("click", (e) => { const b = e.target.closest("[data-spc2]"); if (b) { hideModal(); spConDrop(Number(b.dataset.id)); } });

/* ----- 🪧 race panel lines ----- */
function spPoliticsHtml(k) {
  const r = SP.races[k], rk = SP_RIVALS[k], now = Date.now();
  const rival = rk ? `<div class="spRow">${spI("rivals")}<span><b>Rivals:</b> ${SP.races[rk].found ? `the ${SP_RACES[rk].name}` : "a race you haven't met yet"}. Friendship you earn here costs ${SP_RIVAL_CUT * 100}% of it with them (never below 😊 Friendly).</span></div>`
    : `<div class="spRow">🕊️<span><b>No rivals:</b> everyone respects the ${SP_RACES[k].name}.</span></div>`;
  let warm = "";
  if ((r.best || 0) >= SP_COOL.from && r.pts > SP_FRIENDLY) {
    if (spRouteOf(k)) warm = `<div class="spRow">🔥<span><b>Warm:</b> your trade route keeps them happy.</span></div>`;
    else if (spCooling(k)) warm = `<div class="spRow spCool">${spI("cooling")}<span><b>Cooling off:</b> −${SP_COOL.perHour} friendship an hour (never below 😊 Friendly). Send a gift or open a trade route.</span></div>`;
    else warm = `<div class="spRow">🔥<span><b>Warm:</b> they start to cool off in <b data-spt="${(r.warmAt || now) + SP_COOL.after}">${spClock((r.warmAt || now) + SP_COOL.after - now)}</b> without a gift, a contract or a trade route.</span></div>`;
  }
  return `<div class="spPolitics">${rival}${warm}</div>`;
}

/* ----- 🔁 BARTER (🌌 Space → Market): swap 2 of your goods for 1 good of a race that is 😊 Friendly or better.
   Any alien good can be given or taken, except 🏺 Ancient Relics (the First Ones don't trade them away). ----- */
const SP_BARTER_RATE = 2, SP_BARTER_NO = ["relic"];
const spBarter = { give: null, get: null, n: 10 };
const spBarterGive = () => Object.keys(SP_GOODS).filter(g => !SP_BARTER_NO.includes(g) && (SP.goods[g] || 0) >= SP_BARTER_RATE);
const spBarterGet = () => Object.keys(SP_GOODS).filter(g => !SP_BARTER_NO.includes(g) && spLevel(SP_GOOD_RACE[g]) >= 3);
function spBarterFix() {
  const gv = spBarterGive(), gt = spBarterGet();
  if (!gv.includes(spBarter.give)) spBarter.give = gv[0] || null;
  if (!gt.includes(spBarter.get) || spBarter.get === spBarter.give) spBarter.get = gt.find(g => g !== spBarter.give) || null;
  spBarter.n = Math.max(1, Math.floor(spBarter.n || 1));
}
const spBarterMax = () => spBarter.give ? Math.floor((SP.goods[spBarter.give] || 0) / SP_BARTER_RATE) : 0;
function spBarterDo() {
  spBarterFix();
  const { give, get } = spBarter, n = Math.min(spBarter.n, spBarterMax());
  if (isPaused() || !give || !get || give === get || n < 1) return;
  SP.goods[give] -= n * SP_BARTER_RATE; SP.goods[get] = (SP.goods[get] || 0) + n;
  SP.stats.bartered = (SP.stats.bartered || 0) + n;
  showNotice(`🔁 Traded ${SP_GOODS[give].emoji} ${n * SP_BARTER_RATE} ${SP_GOODS[give].name} for ${SP_GOODS[get].emoji} ${n} ${SP_GOODS[get].name} with the ${SP_RACES[SP_GOOD_RACE[get]].name}.`);
  save(); renderSpace();
}
function spBarterHtml() {
  spBarterFix();
  const gv = spBarterGive(), gt = spBarterGet(), { give, get } = spBarter, max = spBarterMax(), n = Math.min(spBarter.n, Math.max(1, max));
  const opt = (list, sel, skip) => list.filter(g => g !== skip).map(g => `<option value="${g}" ${g === sel ? "selected" : ""}>${SP_GOODS[g].name} (${(SP.goods[g] || 0).toLocaleString()})</option>`).join("");
  let body;
  if (!gt.length) body = `<p class="muted">🔒 Become <b>${lgxI("friendly")}Friendly</b> with a race to trade for its goods here.</p>`;
  else if (!gv.length) body = `<p class="muted">You need at least ${SP_BARTER_RATE} of an alien good to trade.</p>`;
  else body = `<div class="spBarter">
      <label><span class="muted">You give</span><select data-spb="give">${opt(gv, give)}</select></label>
      <span class="spArrow">→</span>
      <label><span class="muted">You get</span><select data-spb="get">${opt(gt, get, give)}</select></label>
      <label><span class="muted">How many to get</span><input type="number" min="1" max="${max}" value="${n}" data-spb="n"></label></div>
    ${give && get ? `<div class="spBarterSum"><span class="spNeed">${spGI(give)} <b>${(n * SP_BARTER_RATE).toLocaleString()}</b> ${SP_GOODS[give].name}</span><span class="spArrow">→</span>
      <span class="spNeed ok">${spGI(get)} <b>${n.toLocaleString()}</b> ${SP_GOODS[get].name}</span>
      <button class="btn" data-spb="go" ${max >= 1 && give !== get ? "" : "disabled"}>${lgxI("barter")}<span>Trade</span></button>
      <button class="btn ghost small" data-spb="max" ${max >= 1 ? "" : "disabled"}>Max (${max.toLocaleString()})</button></div>` : `<p class="muted">Pick two different goods.</p>`}`;
  return `<div class="card"><h2 style="margin-top:0">${lgxI("barter")}Trade with friendly races</h2>
    <p class="muted">Swap your alien goods: you give ${SP_BARTER_RATE}, you get 1. You can get the goods of any race that is 😊 Friendly or better with you. 🏺 Ancient Relics can't be traded here.</p>
    ${body}${SP.stats.bartered ? `<div class="spStats"><span>${lgxI("barter")}Goods received by trading: <b>${SP.stats.bartered.toLocaleString()}</b></span></div>` : ""}</div>`;
}
document.addEventListener("change", (e) => {
  const el = e.target.closest("[data-spb]"); if (!el || !e.target.closest("#spaceView")) return;
  const k = el.dataset.spb;
  if (k === "give" || k === "get") { spBarter[k] = el.value; renderSpace(); }
  if (k === "n") { spBarter.n = Number(el.value) || 1; renderSpace(); }
});
document.addEventListener("click", (e) => {
  const el = e.target.closest('[data-spb="go"], [data-spb="max"]'); if (!el || !e.target.closest("#spaceView")) return;
  if (el.dataset.spb === "max") { spBarter.n = Math.max(1, spBarterMax()); renderSpace(); } else spBarterDo();
});

// compact chips for the race panel: ⚔️ rival and 🔥/❄️ warmth (details in the "Relations & bonuses" tab)
function spPoliticsChips(k) {
  const r = SP.races[k], rk = SP_RIVALS[k], now = Date.now(); let out = "";
  if (rk) out += `<span class="spChip" title="Rivals: friendship you earn here costs ${SP_RIVAL_CUT * 100}% of it with them">${spI("rivals")}${SP.races[rk].found ? SP_RACES[rk].name : "?"}</span>`;
  if ((r.best || 0) >= SP_COOL.from && r.pts > SP_FRIENDLY) {
    if (spRouteOf(k)) out += `<span class="spChip warm" title="Your trade route keeps them happy">🔥 Warm</span>`;
    else if (spCooling(k)) out += `<span class="spChip cool" title="−${SP_COOL.perHour} friendship an hour (never below Friendly)">${spI("cooling")}Cooling off</span>`;
    else out += `<span class="spChip" title="They start to cool off without a gift, a contract or a trade route">🔥 <span data-spt="${(r.warmAt || now) + SP_COOL.after}">${spClock((r.warmAt || now) + SP_COOL.after - now)}</span></span>`;
  }
  return out;
}
