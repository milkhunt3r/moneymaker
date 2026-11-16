/* =====================================================================
   SPECIAL BUSINESSES
   🏢 Real estate agency: needs 100k all-time real estate profit, costs 1M, only one.
   - Selling a property gives +2% of its value.
   - No workers / HR / accountant. Instead: real estate agents. Every second each agent earns a random 0, 5, 10 or 15.
     Agents join as all-time real estate profit grows, each one needing a bigger step:
     1st at 100k, 2nd after +200k (300k), 3rd after +300k (600k), 4th at 1M, …
   ===================================================================== */
const AGENCY_PRICE = 1000000;
const AGENCY_UNLOCK = 100000;
const AGENCY_SALE_BONUS = 0.02;
const AGENCY_PER_AGENT = 100000;   // step size: agent N needs N × 100k more than agent N-1
// total profit needed for n agents: 100k × (1 + 2 + … + n) = 100k × n(n+1)/2
const agencyNeedFor = (n) => AGENCY_PER_AGENT * n * (n + 1) / 2;
const agentsForProfit = (p) => { let n = Math.floor((Math.sqrt(1 + 8 * Math.max(0, p) / AGENCY_PER_AGENT) - 1) / 2);
  while (agencyNeedFor(n + 1) <= p) n++; while (n > 0 && agencyNeedFor(n) > p) n--; return n; };
const AGENT_RATES = [0, 5, 10, 15];
const AGENCY_MAX_AGENTS = 100;     // safety cap: without it, huge real estate profits created thousands of agents and crashed the page
if (!state.special) state.special = { agency: null };
let agencyWasUnlocked = null;

// all-time real estate profit (same number as in the Investing tab)
function reProfit() {
  const st = state.invest && state.invest.stats && state.invest.stats.re;
  if (!st) return 0;
  return st.out + state.invest.properties.reduce((a, p) => a + p.value, 0) - st.in;
}

// Add agents as real estate profit grows (agents are never taken away)
function agencyHireAgents() {
  const ag = state.special.agency;
  if (!ag) return 0;
  const target = Math.min(AGENCY_MAX_AGENTS, agentsForProfit(reProfit()));
  if (ag.agents.length > AGENCY_MAX_AGENTS) ag.agents.length = AGENCY_MAX_AGENTS;   // fix saves from before the cap
  let added = 0;
  while (ag.agents.length < target) {
    ag.agents.push(0);           // the number is what the agent earned in the last second
    added++;
  }
  return added;
}

// Runs every second: returns the agency's income (doubled by political influence like other businesses)
function agencyTick() {
  const ag = state.special.agency;
  if (!ag) {
    // redraw the shop the moment the agency unlocks
    const unlocked = reProfit() >= AGENCY_UNLOCK;
    if (unlocked !== agencyWasUnlocked) { agencyWasUnlocked = unlocked; render(); }
    return 0;
  }
  const added = agencyHireAgents();
  if (added > 0) {
    showNotice(`🏢 ${added > 1 ? added + " new real estate agents" : "A new real estate agent"} joined!`);
    render();
  }
  // every agent rolls a new income each second
  ag.agents = ag.agents.map(() => AGENT_RATES[secureRandomInt(AGENT_RATES.length)]);
  let income = ag.agents.reduce((a, b) => a + b, 0);
  if (state.influenceLeft > 0) income *= 2;
  const el = $("agency-income");
  if (el) el.textContent = "+" + income.toFixed(1) + " / sec";
  ag.agents.forEach((r, i) => {
    const a = $("agent-" + i);
    if (a) { a.textContent = r + " / sec"; a.parentElement.classList.toggle("zero", r === 0); }
  });
  return income;
}

/* ----- ⛏️ Gold mine: needs 500k all-time gold profit, costs 5M, up to 2 at once.
   Each mine holds a random 20M - 30M of gold and pays a fixed 500 per second until it is empty.
   🔥 Gold rush: every second there is a 1 in 1000 chance per mine you own (2 mines: 1 in 500) of a gold rush,
   which doubles gold mine income for 10 seconds. No new rush can start while one is running. ----- */
const MINE_PRICE = 5000000;
const MINE_UNLOCK = 500000;
const MINE_MAX = 2;
const MINE_INCOME = 500;
const MINE_CAP_MIN = 20000000, MINE_CAP_MAX = 30000000;
const RUSH_SECONDS = 10, RUSH_ODDS = 1000;   // chance per second = mines owned / 1000
if (!state.special.mines) state.special.mines = [];
// mines bought before the change held 25M - 50M: cap them at the new maximum
state.special.mines.forEach(m => { if (m.capacity > MINE_CAP_MAX) m.capacity = Math.max(MINE_CAP_MAX, Math.min(m.capacity, m.mined + 100000)); });
if (typeof state.special.goldRush !== "number") state.special.goldRush = 0;

function goldProfit() {
  const st = state.invest && state.invest.stats && state.invest.stats.gold;
  if (!st) return 0;
  return st.out + (state.invest.gold || 0) - st.in;
}

let mineWasUnlocked = null;
function mineTick() {
  const unlocked = goldProfit() >= MINE_UNLOCK;
  if (unlocked !== mineWasUnlocked) { mineWasUnlocked = unlocked; render(); }

  let income = 0, emptied = false;
  const mines = state.special.mines;
  // 🔥 gold rush: roll only when no rush is running
  if (mines.length && state.special.goldRush <= 0 && secureRandomInt(RUSH_ODDS) < mines.length) {
    state.special.goldRush = RUSH_SECONDS;
    state.stats.goldRushes = (state.stats.goldRushes || 0) + 1;
    showNotice(`🔥 GOLD RUSH! Your gold mines pay double for the next ${RUSH_SECONDS} seconds!`);
  }
  const rush = state.special.goldRush > 0;
  if (rush) state.special.goldRush--;
  if (!mines.length) state.special.goldRush = 0;
  for (const m of mines) {
    let pay = MINE_INCOME * (rush ? 2 : 1)                       // gold rush doubles it
              * (state.influenceLeft > 0 ? 2 : 1)                 // political influence doubles it
              * (1 + LAW_IMMIGRATION * lawCount("immigration"));   // immigration lawyers: +25% each
    pay = Math.min(pay, m.capacity - m.mined);                    // the last bit of gold
    m.mined += pay;
    income += pay;
    if (m.mined >= m.capacity) emptied = true;
    const bar = $("mine-fill-" + m.id), txt = $("mine-text-" + m.id);
    if (bar) bar.style.width = (100 * m.mined / m.capacity) + "%";
    if (txt) txt.textContent = mineText(m);
    const inc = $("mine-income-" + m.id);
    if (inc) { inc.textContent = `+${fmt(pay)} / sec`; inc.classList.toggle("rushOn", rush); }
  }
  document.querySelectorAll(".rushBadge").forEach(el => {
    el.hidden = !rush;
    el.textContent = `🔥 Rush 2× · ${state.special.goldRush + 1}s`;
  });
  if (emptied) {
    state.special.mines = state.special.mines.filter(m => m.mined < m.capacity);
    showNotice("⛏️ A gold mine ran out of gold and closed. You can buy a new one.");
    render();
  }
  return income;
}

function mineText(m) {
  const left = m.capacity - m.mined;
  const secs = Math.ceil(left / MINE_INCOME);
  const h = Math.floor(secs / 3600), min = Math.floor((secs % 3600) / 60);
  return `Mined ${fmt(m.mined)} of ${fmt(m.capacity)} · ${fmt(left)} left (about ${h}h ${min}m)`;
}

function renderMines() {
  const mines = state.special.mines;
  const profit = goldProfit();
  let html = "";
  mines.forEach((m, i) => {
    html += `<div class="card specialCard">
      <div class="row"><h3>${bizIco("mine")}Gold Mine ${mines.length > 1 ? "#" + (i + 1) : ""} <span class="rushBadge" hidden></span></h3><span class="income" id="mine-income-${m.id}">+${MINE_INCOME} / sec</span></div>
      <div class="mineBar"><div class="mineFill" id="mine-fill-${m.id}" style="width:${100 * m.mined / m.capacity}%"></div></div>
      <div class="muted" id="mine-text-${m.id}">${mineText(m)}</div>
    </div>`;
  });
  if (mines.length < MINE_MAX) {
    const desc = `<div class="muted">Fixed income of ${MINE_INCOME} / sec · each mine holds a random ${fmt(MINE_CAP_MIN)} – ${fmt(MINE_CAP_MAX)} of gold, then closes</div>
                  <div class="muted">🔥 Gold rush: a 1 in ${RUSH_ODDS} chance every second per mine you own (2 mines: 1 in ${RUSH_ODDS / 2}) to double gold mine income for ${RUSH_SECONDS} seconds</div>
                  <div class="muted">Owned: ${mines.length} / ${MINE_MAX}</div>`;
    if (profit >= MINE_UNLOCK) {
      html += `<div class="card specialCard"><div class="row"><div><h3>${bizIco("mine")}Gold Mine</h3>${desc}</div>
        <button class="btn" data-action="buySpecial" data-special="mine" data-cost="${MINE_PRICE}">Buy ${fmt(MINE_PRICE)}</button></div></div>`;
    } else {
      html += `<div class="card specialCard" style="opacity:0.6"><div class="row"><div><h3>${ico("lock", "lockS")}${bizIco("mine")}Gold Mine</h3>${desc}
        <div class="muted">Unlocks at 500,000 all-time gold profit (now ${profit >= 0 ? "" : "−"}${fmt(Math.abs(profit))}, see 📈 Investing)</div></div>
        <span class="muted">${fmt(MINE_PRICE)}</span></div></div>`;
    }
  }
  return html;
}

/* ----- ⚖️ Law firm: no unlock, 500k, only one. Up to 10 attorney slots (50k each).
   Buying a slot offers 3 random attorneys: pick one (no refresh). Only one Employment lawyer. ----- */
const LAW_PRICE = 500000, LAW_SLOT_PRICE = 50000, LAW_MAX = 10;
const LAW_REPLACE_PRICE = 1000000;   // fire an attorney and pick a new one (only when all 10 slots are filled)
// Each new attorney slot costs 50k more: 50k, 100k, 150k ... 500k for the 10th
const lawSlotPrice = () => LAW_SLOT_PRICE * (((state.special.law && state.special.law.attorneys.length) || 0) + 1);
const ATTORNEYS = {
  criminal:    { name: "Criminal defense lawyer",     emoji: "🚔", desc: "+5% cashback on lost casino bets" },
  immigration: { name: "Immigration lawyer",          emoji: "🛂", desc: "Gold mines and car washes earn +25%" },
  divorce:     { name: "Divorce & family lawyer",     emoji: "💔", desc: "Earns 90–100 per second (changes every second)" },
  employment:  { name: "Employment lawyer",           emoji: "👷", desc: "+1 worker slot in every business (only one allowed)" },
  realestate:  { name: "Real estate lawyer",          emoji: "🏠", desc: "Real estate sales pay +2% more" },
  business:    { name: "Business lawyer",             emoji: "💼", desc: "+10% income for one random business, changes every 10 seconds" },
  debt:        { name: "Debt & financial lawyer",     emoji: "🧾", desc: "Get 25% of every tax payment back (up to 100% with 4 of them)" },
  civil:       { name: "Civil litigation lawyer",     emoji: "🏛️", desc: "Earns 70–100 per second (changes every second)" },
};

function lawCount(type) {
  const law = state.special && state.special.law;
  return law ? law.attorneys.filter(a => a.type === type).length : 0;
}

// 3 different attorney types; never a second Employment lawyer
function makeLawOffer() {
  const pool = Object.keys(ATTORNEYS).filter(t => !(t === "employment" && lawCount("employment") > 0));
  for (let i = pool.length - 1; i > 0; i--) { const j = secureRandomInt(i + 1); [pool[i], pool[j]] = [pool[j], pool[i]]; }
  return pool.slice(0, 3);
}

// How many business lawyers are boosting this company right now
function businessLawyerTargets(company) {
  const law = state.special && state.special.law;
  if (!law) return 0;
  const idx = state.companies.indexOf(company);
  return law.attorneys.filter(a => a.type === "business" && a.target === idx).length;
}

function taxRefund(paid) {
  const share = Math.min(1, 0.25 * lawCount("debt"));
  if (share <= 0) return;
  const back = paid * share;
  state.money += back;
  showNotice(`🧾 Your debt lawyer${lawCount("debt") > 1 ? "s" : ""} got ${fmt(back)} of your tax back!`);
}

let lawTicks = 0;
function lawTick() {
  const law = state.special.law;
  if (!law) return 0;
  lawTicks++;
  let income = 0;
  for (const a of law.attorneys) {
    if (a.type === "divorce") a.value = 90 + secureRandomInt(11);   // 90–100
    if (a.type === "civil")   a.value = 70 + secureRandomInt(31);   // 70–100
    if (a.type === "divorce" || a.type === "civil") income += a.value;
    if (a.type === "business" && (a.target < 0 || lawTicks % 10 === 0 || a.target >= state.companies.length)) {
      a.target = state.companies.length ? secureRandomInt(state.companies.length) : -1;
    }
    const el = $("law-live-" + a.id);
    if (el) el.textContent = lawLive(a);
  }
  if (state.influenceLeft > 0) income *= 2;     // political influence doubles business income
  const el = $("law-income");
  if (el) el.textContent = "+" + income.toFixed(1) + " / sec";
  return income;
}

// Name of a company for display, e.g. "Car Wash #2"
function companyName(idx) {
  const c = state.companies[idx];
  if (!c) return "no business yet";
  const t = typeOf(c);
  const n = state.companies.slice(0, idx + 1).filter(x => x.typeId === c.typeId).length;
  return `${t.emoji} ${t.name}${t.maxOwned > 1 ? " #" + n : ""}`;
}

function lawLive(a) {
  if (a.type === "divorce" || a.type === "civil") return a.value + " / sec";
  if (a.type === "business") return "Boosting " + companyName(a.target);
  return "";
}

function renderLawFirm() {
  const law = state.special.law;
  if (!law) {
    return `<div class="card specialCard"><div class="row">
      <div><h3>${bizIco("law")}Law Firm</h3>
        <div class="muted">No workers, HR or accountant: hire up to ${LAW_MAX} attorneys instead (slots cost 50k, then 100k, 150k…)</div>
        <div class="muted">8 kinds of lawyers: casino cashback, tax refunds, extra worker slots, steady income and more</div>
        <div class="muted">Owned: 0 / 1</div></div>
      <button class="btn" data-action="buySpecial" data-special="law" data-cost="${LAW_PRICE}">Buy ${fmt(LAW_PRICE)}</button>
    </div></div>`;
  }
  const income = law.attorneys.reduce((s, a) => s + ((a.type === "divorce" || a.type === "civil") ? a.value : 0), 0);
  let html = `<div class="card specialCard">
    <div class="row"><h3>${bizIco("law")}Law Firm</h3><span class="income" id="law-income">+${income.toFixed(1)} / sec</span></div>
    <div class="row"><h4>Attorneys (${law.attorneys.length} / ${LAW_MAX})</h4>
      <button class="btn ghost small" data-action="toggleLaw">${state.special.lawCollapsed ? "▸ Show" : "▾ Minimize"}</button></div>`;
  if (state.special.lawCollapsed) {
    // one-line summary: each lawyer type and how many you have
    const counts = {};
    law.attorneys.forEach(a => counts[a.type] = (counts[a.type] || 0) + 1);
    html += `<div class="muted">${Object.keys(counts).map(t => `${ATTORNEYS[t].emoji} ${ATTORNEYS[t].name} ×${counts[t]}`).join(" · ") || "No attorneys yet."}</div>`;
  } else {
  html += `<div class="lawSlots">`;
  const full = law.attorneys.length >= LAW_MAX && !law.offer;
  law.attorneys.forEach((a, idx) => {
    const at = ATTORNEYS[a.type];
    html += `<div class="lawSlot" title="${at.desc}"><b>${at.emoji} ${at.name}</b><br>
               <span class="muted">${at.desc}</span><br><span class="live" id="law-live-${a.id}">${lawLive(a)}</span>
               ${full ? `<br><button class="btn ghost small" data-action="lawReplace" data-idx="${idx}" data-cost="${LAW_REPLACE_PRICE}"
                 title="Fire this attorney and choose a new one from 3 offers">🔄 Replace (${fmt(LAW_REPLACE_PRICE)})</button>` : ""}</div>`;
  });
  if (law.replaceIdx !== undefined && law.replaceIdx !== null && law.offer) html += `<div class="lawSlot empty">Choosing a replacement…</div>`;
  for (let i = law.attorneys.length; i < LAW_MAX; i++) html += `<div class="lawSlot empty">Empty slot</div>`;
  html += `</div>`;
  }

  if (law.offer) {
    html += `<h4>Choose your new attorney</h4><div class="choices">` +
      law.offer.map((t, k) => `<button class="choice" data-action="lawPick" data-pick="${k}">
        <b>${ATTORNEYS[t].emoji} ${ATTORNEYS[t].name}</b><small>${ATTORNEYS[t].desc}</small></button>`).join("") + `</div>`;
  } else if (law.attorneys.length < LAW_MAX) {
    html += `<div style="margin-top:10px"><button class="btn" data-action="lawSlot" data-cost="${lawSlotPrice()}">Buy attorney slot (${fmt(lawSlotPrice())})</button>
             <span class="muted"> you'll choose 1 of 3 lawyers</span></div>`;
  } else {
    html += `<div class="muted" style="margin-top:8px">All attorney slots are filled. You can fire and replace any attorney for ${fmt(LAW_REPLACE_PRICE)}.</div>`;
  }
  return html + `</div>`;
}

/* ----- 🎢 Amusement park: one slot for every hotel you own. Park #1 pairs with Hotel #1, and so on.
   Each park earns 50% of its hotel's income. Costs 1.75M. No workers, HR or accountant. ----- */
const PARK_PRICE = 1750000;
const PARK_SHARE = 0.5;
if (!state.special.parks) state.special.parks = [];
var companyIncomeNow = [];   // each company's income in the last second (filled by the game loop)

// Your hotels in the order you bought them, as indexes into state.companies
function hotelsOwned() {
  return state.companies.map((c, i) => c.typeId === "hotel" ? i : -1).filter(i => i >= 0);
}

function parkTick() {
  const hotels = hotelsOwned();
  let total = 0;
  state.special.parks.forEach((p, k) => {
    const hotelIdx = hotels[k];
    const income = hotelIdx === undefined ? 0 : Math.max(0, companyIncomeNow[hotelIdx] || 0) * PARK_SHARE;
    total += income;
    const el = $("park-income-" + p.id);
    if (el) el.textContent = "+" + income.toFixed(1) + " / sec";
  });
  const tot = $("parks-total");
  if (tot) tot.textContent = "+" + total.toFixed(1) + " / sec";
  return total;
}

function renderParks() {
  const hotels = hotelsOwned(), parks = state.special.parks;
  let html = "";
  // all parks under one header that can be minimized (like business groups)
  const collapsed = parks.length > 0 && !!(state.groupCollapsed || {}).parks;
  if (parks.length) html += `<div class="card groupHead"><div class="row">
      <h3>${bizIco("park")}Amusement Parks <span class="muted">× ${parks.length}</span></h3>
      <span class="row"><span class="income" id="parks-total">+0.0 / sec</span>
        <button class="btn ghost small" data-action="toggleGroup" data-type="parks">${collapsed ? "▸ Show all" : "▾ Minimize all"}</button></span></div>
      ${collapsed ? `<div class="muted">${parks.length} park${parks.length === 1 ? "" : "s"} · ${parks.length} / ${hotels.length} hotel slots used</div>` : ""}</div>`;
  if (!collapsed) parks.forEach((p, k) => {
    html += `<div class="card specialCard"><div class="row">
      <div><h3>${bizIco("park")}Amusement Park #${k + 1}</h3>
        <div class="muted">Paired with 🏨 Hotel #${k + 1} · earns 50% of its income</div></div>
      <span class="income" id="park-income-${p.id}">+0.0 / sec</span></div></div>`;
  });
  if (parks.length < hotels.length) {
    html += `<div class="card specialCard"><div class="row">
      <div><h3>${bizIco("park")}Amusement Park #${parks.length + 1}</h3>
        <div class="muted">Pairs with 🏨 Hotel #${parks.length + 1} and earns 50% of its income · no workers, HR manager or accountant</div>
        <div class="muted">Owned: ${parks.length} / ${hotels.length} (one slot per hotel)</div></div>
      <button class="btn" data-action="buySpecial" data-special="park" data-cost="${PARK_PRICE}">Buy ${fmt(PARK_PRICE)}</button>
    </div></div>`;
  } else if (hotels.length === 0) {
    html += `<div class="card specialCard" style="opacity:0.6"><div class="row">
      <div><h3>${ico("lock", "lockS")}${bizIco("park")}Amusement Park</h3>
        <div class="muted">Each park pairs with one of your hotels and earns 50% of its income</div>
        <div class="muted">Unlocks when you buy a hotel: one park slot for every hotel</div></div>
      <span class="muted">${fmt(PARK_PRICE)}</span></div></div>`;
  }
  return html;
}

/* ----- 📦 Warehouse: 300k each, max 5. Each one adds +2% to truck contract payouts.
   One slot for every 3 trucks owned: 3 -> 1, 6 -> 2, 9 -> 3, 12 -> 4, 15 -> 5. ----- */
const WAREHOUSE_PRICE = 300000;
const WAREHOUSE_BONUS = 0.02;
const WAREHOUSE_UNLOCKS = [3, 6, 9, 12, 15];   // trucks needed for warehouse 1, 2, 3, 4, 5
if (!state.special.warehouses) state.special.warehouses = [];
const warehouseCount = () => (state.special && state.special.warehouses ? state.special.warehouses.length : 0);
const trucksOwned = () => (state.logistics && state.logistics.trucks ? state.logistics.trucks.length : 0);
const warehouseSlots = () => WAREHOUSE_UNLOCKS.filter(n => trucksOwned() >= n).length;

// Contract bonus: trucks +2% per warehouse, tankers +2.5% with the trading port
const contractBonus = (key) => key === "truck" ? WAREHOUSE_BONUS * warehouseCount()
  : key === "tanker" ? (state.special.port ? PORT_BONUS : 0)
  : key === "plane" && state.science && state.science.satellite ? SAT_PLANE_BONUS : 0;   // planes: only the 🛰️ satellite
// What a contract actually pays
function contractPayout(key, profit) {
  return Math.round(profit * (1 + contractBonus(key)));
}

/* ----- ⚓ Trading port: 25M, max 1, needs at least 1 oil tanker.
   Earns 350 / sec for every tanker you own and adds +2.5% to tanker contract payouts. ----- */
/* ----- 🏬 Logistics Center: 1.25 scoin, max 1, needs Logistics level 20. No workers, HR or accountant.
   When bought you choose 1 of 3 upgrades for every Logistics agent; the other two cost 1 scoin each. ----- */
const CENTER_PRICE = 1250000, CENTER_UPGRADE_PRICE = 1000000, CENTER_LEVEL = 20;
const CENTER_UPGRADES = {
  fee:  { icon: "💸", name: "Cheaper agents",   desc: "Logistics agent fee drops from 2% to 1%" },
  best: { icon: "🎯", name: "Smart agents",     desc: "Agents pick the most profitable contract (best pay per second) instead of a random one" },
  fast: { icon: "⚡", name: "Fast agents",      desc: "Agents pick a new contract after 3 seconds instead of 5" },
};
const centerHas = (up) => !!(state.special.center && state.special.center.upgrades.includes(up));
function centerLevel() { try { return logiLevel(); } catch (e) { return 0; } }   // logistics code loads later
function renderCenter() {
  const c = state.special.center, lvl = centerLevel();
  if (!c) {
    const desc = `<div class="muted">Upgrades every 🤖 Logistics agent: choose 1 of 3 when you buy it, add the other two later for ${fmt(CENTER_UPGRADE_PRICE)} each · no workers, HR manager or accountant · max 1</div>`;
    if (lvl >= CENTER_LEVEL) return `<div class="card specialCard"><div class="row"><div><h3>${bizIco("center")}Logistics Center</h3>${desc}</div>
        <button class="btn" data-action="buySpecial" data-special="center" data-cost="${CENTER_PRICE}">Buy ${fmt(CENTER_PRICE)}</button></div></div>`;
    return `<div class="card specialCard" style="opacity:0.6"><div class="row"><div><h3>${ico("lock", "lockS")}${bizIco("center")}Logistics Center</h3>${desc}
        <div class="muted">Unlocks at 🚚 Logistics level ${CENTER_LEVEL} (you are level ${lvl})</div></div>
      <span class="muted">${fmt(CENTER_PRICE)}</span></div></div>`;
  }
  let html = `<div class="card specialCard"><div class="row"><h3>${bizIco("center")}Logistics Center</h3>
    <span class="muted">${c.upgrades.length} / 3 upgrades</span></div>`;
  if (c.choosing) {
    html += `<h4>Choose the first upgrade</h4><div class="choices">` + Object.entries(CENTER_UPGRADES).map(([k, u]) =>
      `<button class="choice" data-action="centerPick" data-up="${k}"><b>${u.icon} ${u.name}</b><small>${u.desc}</small></button>`).join("") + `</div>`;
  } else {
    html += `<div class="lawSlots">` + Object.entries(CENTER_UPGRADES).map(([k, u]) => c.upgrades.includes(k)
      ? `<div class="lawSlot"><b>✅ ${u.icon} ${u.name}</b><br><span class="muted">${u.desc}</span></div>`
      : `<div class="lawSlot empty"><b>${u.icon} ${u.name}</b><br><span class="muted">${u.desc}</span><br>
          <button class="btn small" data-action="centerBuy" data-up="${k}" data-cost="${CENTER_UPGRADE_PRICE}">Buy ${fmt(CENTER_UPGRADE_PRICE)}</button></div>`).join("") + `</div>`;
  }
  return html + `</div>`;
}

/* ----- 🏛️ Art Gallery (special business): 50 scoin, max 1, needs 20 paintings in your Art Gallery collection.
   Earns 250 / sec for every painting in your collection, up to 10k / sec (40 paintings). No workers, HR or accountant. ----- */
const GALLERY_PRICE = 50000000, GALLERY_NEED = 20, GALLERY_PER_PAINTING = 250, GALLERY_MAX = 10000;
const paintingsOwned = () => (state.art && state.art.items ? state.art.items.length : 0);
const galleryIncome = () => Math.min(GALLERY_MAX, GALLERY_PER_PAINTING * paintingsOwned());
function galleryTick() {
  if (!state.special.gallery) return 0;
  const income = galleryIncome(), el = $("gallery-income");
  if (el) el.textContent = "+" + fmt(income) + " / sec";
  return income;
}

/* =====================================================================
   🧑‍💼 RECRUITMENT AGENCY (special business): 10 scoin, max 1, unlocks with 2 hotels and 2 casinos.
   No workers, HR or accountant. You save a staffing plan for each business type (accountant, HR and
   a trait for every worker place; "Random" rolls a trait like normal hiring). "Hire staff" fills every
   hotel and casino that has NO staff yet (no accountant, HR or workers) with that plan:
   1 scoin per business filled, each worker's pay per second is random in the normal range.
   Businesses that already have any staff are never touched. The plan is kept on prestige.
   ===================================================================== */
const RECRUIT_PRICE = 1e7, RECRUIT_FILL = 1e6, RECRUIT_NEED = { hotel: 2, casino: 2 };
const RECRUIT_TYPES = ["casino", "hotel"];
const recruitSlots = (typeId) => { const T = BUSINESS_TYPES.find(t => t.id === typeId); return T.maxEmployees - 2 + (lawCount("employment") > 0 ? 1 : 0); };
const recruitTraits = (typeId) => Object.keys(TRAITS).filter(k => k !== "normal" && k !== "legend" && (!TRAITS[k].onlyFor || TRAITS[k].onlyFor.includes(typeId)));
const recruitUnlocked = () => ownedOf("hotel") >= RECRUIT_NEED.hotel && ownedOf("casino") >= RECRUIT_NEED.casino;
const recruitTargets = () => state.companies.filter(c => RECRUIT_TYPES.includes(c.typeId) && !c.accountant && !c.hr && c.workers.length === 0);
function recruitPlan() {
  if (!state.recruitPlan) state.recruitPlan = {};
  RECRUIT_TYPES.forEach(id => {
    const p = state.recruitPlan[id] = state.recruitPlan[id] || { accountant: "numbers", hr: "motivator", traits: [] };
    while (p.traits.length < recruitSlots(id)) p.traits.push("random");
  });
  return state.recruitPlan;
}

function renderRecruit() {
  const desc = `<div class="muted">Fills every empty 🎰 casino and 🏨 hotel with your staffing plan: accountant, HR and a chosen trait for every worker · ${fmt(RECRUIT_FILL)} per business filled · pay per second stays random · 👥 Hire staff only fills businesses with no staff · 🔄 Apply to all brings every hotel and casino in line with the plan · max 1</div>`;
  if (state.special.recruit) {
    const n = recruitTargets().length;
    return `<div class="card specialCard"><div class="row"><h3>${bizIco("recruit")}Recruitment Agency</h3></div>${desc}
      <div class="muted" style="margin-top:6px">${n ? `<b>${n}</b> empty business${n === 1 ? "" : "es"} ready to staff · cost ${fmt(n * RECRUIT_FILL)}` : "No empty hotels or casinos right now."}</div>
      <div class="row" style="justify-content:flex-start; gap:8px; margin-top:8px">
        <button class="btn ghost" data-action="recruitPlan">📝 Staffing plan</button>
        <button class="btn" data-action="recruitHire" ${n ? `data-cost="${RECRUIT_FILL}"` : ""} ${n && state.money >= RECRUIT_FILL ? "" : "disabled"}>👥 Hire staff</button>
        <button class="btn ghost" data-action="recruitAll">🔄 Apply to all</button>
      </div></div>`;
  }
  if (recruitUnlocked()) {
    return `<div class="card specialCard"><div class="row"><div><h3>${bizIco("recruit")}Recruitment Agency</h3>${desc}</div>
      <button class="btn" data-action="buySpecial" data-special="recruit" data-cost="${RECRUIT_PRICE}">Buy ${fmt(RECRUIT_PRICE)}</button></div></div>`;
  }
  return `<div class="card specialCard" style="opacity:0.6"><div class="row"><div><h3>${ico("lock", "lockS")}${bizIco("recruit")}Recruitment Agency</h3>${desc}
      <div class="muted">Unlocks when you own ${RECRUIT_NEED.hotel} hotels (${ownedOf("hotel")}/${RECRUIT_NEED.hotel}) and ${RECRUIT_NEED.casino} casinos (${ownedOf("casino")}/${RECRUIT_NEED.casino})</div></div>
    <span class="muted">${fmt(RECRUIT_PRICE)}</span></div></div>`;
}

// 📝 The staffing plan pop-up: one column per business type
function showRecruitPlan(msg = "") {
  const plan = recruitPlan();
  const opt = (obj, sel) => Object.keys(obj).map(k => `<option value="${k}" ${k === sel ? "selected" : ""}>${obj[k].emoji} ${obj[k].name}</option>`).join("");
  const col = (id) => {
    const T = BUSINESS_TYPES.find(t => t.id === id), p = plan[id], n = recruitSlots(id);
    const traitOpts = (sel) => `<option value="random" ${sel === "random" ? "selected" : ""}>🎲 Random</option>` +
      recruitTraits(id).map(k => `<option value="${k}" ${k === sel ? "selected" : ""}>${TRAITS[k].emoji} ${TRAITS[k].name}</option>`).join("");
    return `<div class="recruitCol"><h3>${bizIco(T.id)}${T.name}</h3>
      <label>🧮 Accountant<select data-rp="${id}" data-field="accountant">${opt(ACCOUNTANTS, p.accountant)}</select></label>
      <label>💞 HR<select data-rp="${id}" data-field="hr">${opt(HR_OPTIONS, p.hr)}</select></label>
      ${p.traits.slice(0, n).map((tr, i) => `<label>👷 Worker ${i + 1}<select data-rp="${id}" data-field="trait" data-i="${i}">${traitOpts(tr)}</select></label>`).join("")}
      <div class="muted">${n + 2} places: accountant, HR and ${n} workers · pay ${T.minIncome}–${T.maxIncome} / sec each (random)</div></div>`;
  };
  showModal(`<h2>📝 Staffing plan</h2>
    <p class="muted">Choose the staff for every new hotel and casino. "🎲 Random" rolls a trait like normal hiring. Max ${CONCIERGE_MAX} 🛎️ Concierges per hotel.</p>
    <div class="recruitErr" id="recruitErr">${msg}</div>
    <div class="recruitCols">${RECRUIT_TYPES.map(col).join("")}</div>
    <button class="btn big" data-modal="close">✅ Save plan</button>`);
  $("modalBox").classList.add("wide");
}
$("modalBox").addEventListener("change", (e) => {
  const sel = e.target.closest("select[data-rp]"); if (!sel) return;
  const p = recruitPlan()[sel.dataset.rp], f = sel.dataset.field;
  if (f === "trait") {
    const i = Number(sel.dataset.i), old = p.traits[i];
    p.traits[i] = sel.value;
    if (sel.dataset.rp === "hotel" && p.traits.slice(0, recruitSlots("hotel")).filter(t => t === "concierge").length > CONCIERGE_MAX) {
      p.traits[i] = old; sel.value = old;
      $("recruitErr").textContent = `🛎️ A hotel can have at most ${CONCIERGE_MAX} Concierges.`;
      return;
    }
  } else p[f] = sel.value;
  $("recruitErr").textContent = "";
  save();
});

// 🔄 What applying the plan would change in one business:
// workers whose trait the plan asks for are kept (one per planned place), other workers fill the 🎲 Random places,
// workers that fit nowhere are replaced, missing places are hired. Accountant and HR are set to the plan.
function recruitDiff(c) {
  const p = recruitPlan()[c.typeId], n = maxWorkers(c);
  const want = p.traits.slice(0, n).filter(t => t !== "random"), randomPlaces = n - want.length;
  const pool = c.workers.slice(), keep = [], add = [];
  want.forEach(t => {
    const k = pool.findIndex(w => w.trait === t);
    if (k >= 0) keep.push(pool.splice(k, 1)[0]); else add.push(t);
  });
  const fillers = pool.splice(0, randomPlaces);   // any trait fits a Random place
  keep.push(...fillers);
  for (let i = fillers.length; i < randomPlaces; i++) add.push("random");
  const staff = c.accountant !== p.accountant || c.hr !== p.hr;
  return { keep, add, fired: pool, staff, changes: staff || add.length > 0 || pool.length > 0 };
}
function recruitAllTargets() {
  return state.companies.filter(c => RECRUIT_TYPES.includes(c.typeId)).map(c => ({ c, d: recruitDiff(c) })).filter(x => x.d.changes);
}
function showRecruitAll() {
  const list = recruitAllTargets(), n = list.length;
  if (!n) return showModal(`<h2>🔄 Apply staffing plan</h2><p>Every hotel and casino already matches your plan. Nothing to change.</p>
    <button class="btn" data-modal="close">OK</button>`);
  const afford = Math.min(n, Math.floor(state.money / RECRUIT_FILL));
  const hire = list.reduce((a, x) => a + x.d.add.length, 0), fire = list.reduce((a, x) => a + x.d.fired.length, 0);
  const legends = list.reduce((a, x) => a + x.d.fired.filter(w => w.trait === "legend").length, 0);
  const rows = list.map(({ c, d }) => {
    const T = typeOf(c), no = state.companies.filter(x => x.typeId === c.typeId).indexOf(c) + 1;
    const bits = [d.staff ? "accountant / HR" : "", d.add.length ? `hire ${d.add.length}` : "", d.fired.length ? `replace ${d.fired.length}` : ""].filter(Boolean).join(" · ");
    return `<li>${T.emoji} ${T.name} #${no}: ${bits}</li>`;
  }).join("");
  showModal(`<h2>🔄 Apply staffing plan to all</h2>
    <p><b>${n}</b> business${n === 1 ? "" : "es"} need${n === 1 ? "s" : ""} changes to match your plan. Total cost: <b>${fmt(n * RECRUIT_FILL)}</b> (${fmt(RECRUIT_FILL)} per business).</p>
    <ul style="text-align:left; max-height:30vh; overflow-y:auto">${rows}</ul>
    <p class="muted">${hire} worker${hire === 1 ? "" : "s"} hired${fire ? `, ${fire} replaced (workers whose trait isn't in the plan)` : ""}. Workers who fit the plan keep their pay; new workers get random pay.</p>
    ${legends ? `<p style="color:#ff8a8a"><b>⚠️ ${legends} 🏆 Legend${legends === 1 ? "" : "s"} would be replaced.</b> Set a slot to 🎲 Random or The Legend can't stay.</p>` : ""}
    ${afford < n ? `<p style="color:#ff8a8a">You can afford ${afford} of ${n}: the first ${afford} will be changed.</p>` : ""}
    <button class="btn big" data-recruit="all" ${afford ? "" : "disabled"}>✅ Apply for ${fmt(afford * RECRUIT_FILL)}</button>
    <button class="btn ghost" data-modal="close">Cancel</button>`);
}
function recruitApplyAll() {
  let done = 0;
  for (const { c } of recruitAllTargets()) {
    if (state.money < RECRUIT_FILL) break;
    const d = recruitDiff(c), p = recruitPlan()[c.typeId], T = typeOf(c);
    state.money -= RECRUIT_FILL;
    c.accountant = p.accountant; c.hr = p.hr; c.candidates = null;
    c.workers = d.keep;
    d.add.forEach(t => c.workers.push({ id: state.nextId++, name: randomItem(FIRST_NAMES), trait: t === "random" ? rollTrait(c) : t, base: randomInt(T.minIncome, T.maxIncome) }));
    done++;
  }
  if (done) showNotice(`🔄 Staffing plan applied to ${done} business${done === 1 ? "" : "es"} for ${fmt(done * RECRUIT_FILL)}.`);
  hideModal(); save(); updateCounter(); render();
}
$("modalBox").addEventListener("click", (e) => { if (e.target.closest('[data-recruit="all"]')) recruitApplyAll(); });

// 👥 Fill every empty hotel and casino with the plan (1 scoin each, as many as you can afford)
function recruitHire() {
  const plan = recruitPlan();
  let filled = 0, people = 0;
  for (const c of recruitTargets()) {
    if (state.money < RECRUIT_FILL) break;
    state.money -= RECRUIT_FILL;
    const p = plan[c.typeId], T = typeOf(c);
    c.accountant = p.accountant; c.hr = p.hr; c.candidates = null;
    for (let i = 0; i < maxWorkers(c); i++) {
      const want = p.traits[i] || "random";
      c.workers.push({ id: state.nextId++, name: randomItem(FIRST_NAMES), trait: want === "random" ? rollTrait(c) : want, base: randomInt(T.minIncome, T.maxIncome) });
    }
    filled++; people += c.workers.length + 2;
  }
  if (filled) {
    state.stats.recruitFilled = (state.stats.recruitFilled || 0) + filled;
    const left = recruitTargets().length;
    showNotice(`🧑‍💼 Staffed ${filled} business${filled === 1 ? "" : "es"} (${people} people) for ${fmt(filled * RECRUIT_FILL)}.${left ? ` ${left} still empty: not enough money.` : ""}`);
  }
}

function renderGalleryBiz() {
  const n = paintingsOwned();
  const desc = `<div class="muted">Shows your paintings to visitors: ${fmt(GALLERY_PER_PAINTING)} / sec for each painting in your 🖼️ Collection, up to ${fmt(GALLERY_MAX)} / sec (${GALLERY_MAX / GALLERY_PER_PAINTING} paintings) · no workers, HR manager or accountant · max 1</div>`;
  if (state.special.gallery) {
    return `<div class="card specialCard"><div class="row">
      <div><h3>${bizIco("gallery")}Art Gallery</h3><div class="muted">${fmt(GALLERY_PER_PAINTING)} / sec for each of your ${n} painting${n === 1 ? "" : "s"}${GALLERY_PER_PAINTING * n >= GALLERY_MAX ? " · maximum reached" : ` · max ${fmt(GALLERY_MAX)} / sec`}</div></div>
      <span class="income" id="gallery-income">+${fmt(galleryIncome())} / sec</span></div></div>`;
  }
  if (n >= GALLERY_NEED) {
    return `<div class="card specialCard"><div class="row"><div><h3>${bizIco("gallery")}Art Gallery</h3>${desc}
        <div class="muted">With your ${n} paintings: +${fmt(galleryIncome())} / sec</div></div>
      <button class="btn" data-action="buySpecial" data-special="gallery" data-cost="${GALLERY_PRICE}">Buy ${fmt(GALLERY_PRICE)}</button></div></div>`;
  }
  return `<div class="card specialCard" style="opacity:0.6"><div class="row"><div><h3>${ico("lock", "lockS")}${bizIco("gallery")}Art Gallery</h3>${desc}
      <div class="muted">Unlocks with ${GALLERY_NEED} paintings in your 🖼️ Art Gallery collection (you have ${n})</div></div>
    <span class="muted">${fmt(GALLERY_PRICE)}</span></div></div>`;
}

const PORT_PRICE = 25000000;
const PORT_PER_TANKER = 350;
const PORT_BONUS = 0.025;
const tankersOwned = () => (state.logistics && state.logistics.tankers ? state.logistics.tankers.length : 0);
function portTick() {
  if (!state.special.port) return 0;
  const income = PORT_PER_TANKER * tankersOwned();
  const el = $("port-income");
  if (el) el.textContent = "+" + fmt(income) + " / sec";
  return income;
}
function renderPort() {
  const n = tankersOwned();
  if (state.special.port) {
    return `<div class="card specialCard"><div class="row">
      <div><h3>${bizIco("port")}Trading Port</h3>
        <div class="muted">${fmt(PORT_PER_TANKER)} / sec for each of your ${n} oil tanker${n === 1 ? "" : "s"} · tanker contracts pay <b>+2.5%</b></div></div>
      <span class="income" id="port-income">+${fmt(PORT_PER_TANKER * n)} / sec</span></div></div>`;
  }
  const desc = `<div class="muted">Earns ${fmt(PORT_PER_TANKER)} / sec per oil tanker you own and +2.5% profit on every tanker contract · no workers, HR manager or accountant · max 1</div>`;
  if (n >= 1) {
    return `<div class="card specialCard"><div class="row"><div><h3>${bizIco("port")}Trading Port</h3>${desc}
        <div class="muted">With your ${n} tanker${n === 1 ? "" : "s"}: +${fmt(PORT_PER_TANKER * n)} / sec</div></div>
      <button class="btn" data-action="buySpecial" data-special="port" data-cost="${PORT_PRICE}">Buy ${fmt(PORT_PRICE)}</button></div></div>`;
  }
  return `<div class="card specialCard" style="opacity:0.6"><div class="row"><div><h3>${ico("lock", "lockS")}${bizIco("port")}Trading Port</h3>${desc}
      <div class="muted">Unlocks when you own an oil tanker (see 🚢 Logistics)</div></div>
    <span class="muted">${fmt(PORT_PRICE)}</span></div></div>`;
}

function renderWarehouses() {
  const owned = warehouseCount(), slots = warehouseSlots();
  let html = "";
  if (owned > 0) {
    html += `<div class="card specialCard"><div class="row">
      <div><h3>${bizIco("warehouse")}Warehouses × ${owned}</h3>
        <div class="muted">Truck contracts pay <b>+${(WAREHOUSE_BONUS * 100 * owned).toFixed(0)}%</b> (+2% per warehouse)</div></div>
      <span class="muted">${owned} / ${WAREHOUSE_UNLOCKS.length}</span></div></div>`;
  }
  if (owned < WAREHOUSE_UNLOCKS.length) {
    const next = WAREHOUSE_UNLOCKS[owned];
    const desc = `<div class="muted">+2% profit on every truck contract · no workers, HR manager or accountant</div>
                  <div class="muted">Owned: ${owned} / ${WAREHOUSE_UNLOCKS.length}</div>`;
    if (owned < slots) {
      html += `<div class="card specialCard"><div class="row"><div><h3>${bizIco("warehouse")}Warehouse #${owned + 1}</h3>${desc}</div>
        <button class="btn" data-action="buySpecial" data-special="warehouse" data-cost="${WAREHOUSE_PRICE}">Buy ${fmt(WAREHOUSE_PRICE)}</button></div></div>`;
    } else {
      html += `<div class="card specialCard" style="opacity:0.6"><div class="row"><div><h3>${ico("lock", "lockS")}${bizIco("warehouse")}Warehouse #${owned + 1}</h3>${desc}
        <div class="muted">Unlocks when you own ${next} semi-trucks (you have ${trucksOwned()}, see 🚢 Logistics)</div></div>
        <span class="muted">${fmt(WAREHOUSE_PRICE)}</span></div></div>`;
    }
  }
  return html;
}

// Special businesses, cheapest first
function renderSpecialBusinesses() {
  const list = [
    [WAREHOUSE_PRICE, renderWarehouses],   // 300k
    [LAW_PRICE, renderLawFirm],            // 500k
    [AGENCY_PRICE, renderAgency],          // 1M
    [CENTER_PRICE, renderCenter],          // 1.25M
    [PARK_PRICE, renderParks],             // 1.75M
    [MINE_PRICE, renderMines],             // 5M
    [PORT_PRICE, renderPort],              // 25M
    [GALLERY_PRICE, renderGalleryBiz],     // 50M
    [RECRUIT_PRICE, renderRecruit],        // 10 scoin
  ].sort((a, b) => a[0] - b[0]);
  return `<h2 class="specialHead">⭐ Special businesses</h2>` + list.map(([, fn]) => fn()).join("");
}

function renderAgency() {
  const ag = state.special.agency;
  const profit = reProfit();
  let html = "";

  if (ag) {
    const income = ag.agents.reduce((a, b) => a + b, 0);
    const next = agencyNeedFor(ag.agents.length + 1);
    const full = ag.agents.length >= AGENCY_MAX_AGENTS;
    html += `<div class="card specialCard">
      <div class="row"><h3>${bizIco("realestate")}Real Estate Agency</h3><span class="income" id="agency-income">+${income.toFixed(1)} / sec</span></div>
      <div class="muted">+2% bonus every time you sell a property · new agents at 100k, 300k, 600k, 1M… real estate profit (each step 100k bigger) · each agent earns 0, 5, 10 or 15 at random every second (7.5 / sec on average)</div>
      <div class="muted" style="margin-top:4px">${full ? "Your agency is full (max " + AGENCY_MAX_AGENTS + " agents)." :
        `Next agent at ${fmt(next)} real estate profit (now ${profit >= 0 ? "" : "−"}${fmt(Math.abs(profit))})`}</div>
      <div class="row"><h4>Agents (${ag.agents.length} / ${AGENCY_MAX_AGENTS})</h4>
        ${ag.agents.length ? `<button class="btn ghost small" data-action="toggleAgency">${state.special.agencyCollapsed ? "▸ Show" : "▾ Minimize"}</button>` : ""}</div>
      ${state.special.agencyCollapsed && ag.agents.length
        ? `<div class="muted">${ag.agents.length} agents · about ${fmt(ag.agents.length * 7.5)} / sec on average</div>`
        : ag.agents.length ? `<div class="agents">${ag.agents.map((r, i) =>
        `<div class="agent ${r === 0 ? "zero" : ""}">🧑‍💼 Agent ${i + 1}<br><b id="agent-${i}">${r} / sec</b></div>`).join("")}</div>`
        : `<div class="muted">No agents yet.</div>`}
    </div>`;
  } else if (profit >= AGENCY_UNLOCK) {
    html += `<div class="card specialCard"><div class="row">
      <div><h3>${bizIco("realestate")}Real Estate Agency</h3>
        <div class="muted">+2% when you sell real estate · each agent earns 0, 5, 10 or 15 at random every second</div>
        <div class="muted">Agents join at 100k, 300k, 600k, 1M… real estate profit (you'd start with ${agentsForProfit(profit)})</div>
        <div class="muted">Owned: 0 / 1</div></div>
      <button class="btn" data-action="buySpecial" data-special="agency" data-cost="${AGENCY_PRICE}">Buy ${fmt(AGENCY_PRICE)}</button>
    </div></div>`;
  } else {
    html += `<div class="card specialCard" style="opacity:0.6"><div class="row">
      <div><h3>${ico("lock", "lockS")}${bizIco("realestate")}Real Estate Agency</h3>
        <div class="muted">+2% when you sell real estate · each agent earns 0, 5, 10 or 15 at random every second</div>
        <div class="muted">Unlocks at 100,000 all-time real estate profit (now ${profit >= 0 ? "" : "−"}${fmt(Math.abs(profit))}, see 📈 Investing)</div>
        <div class="muted">Owned: 0 / 1</div></div>
      <span class="muted">${fmt(AGENCY_PRICE)}</span>
    </div></div>`;
  }
  return html;
}
