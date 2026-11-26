/* Empire of Coins © 2026 milkhunt3r. All rights reserved. */
/* =====================================================================
   INCOME: runs once per second for each company
   Order: Copycats pick a trait -> base -> Motivator, Friendship, Bully, Hard worker, Night owl
          -> Mentor -> Leader -> Lazy, Burnout, Gambler, Bully victims (these set income to 0)
          -> sum -> Accountant
   ===================================================================== */

// The trait a worker is acting as right now (a Copycat acts as whatever it copied)
function activeTrait(w) {
  return w.trait === "copycat" ? (w.copied || "normal") : w.trait;
}

function runCompany(company) {
  const result = { total: 0, perWorker: [], status: [], flash: "" };
  const workers = company.workers;

  // The company only works once the accountant and HR are chosen
  if (!staffReady(company) || workers.length === 0) return result;

  const tick = company.ticks = (company.ticks || 0) + 1;   // seconds this company has been running

  // picks a random co-worker that is not worker i (or -1 if there is none)
  const randomOther = (i, filter = () => true) => {
    const others = workers.map((_, j) => j).filter(j => j !== i && filter(workers[j]));
    return others.length ? randomItem(others) : -1;
  };

  // Copycats pick someone to copy (never another Copycat)
  workers.forEach((w, i) => {
    if (w.trait !== "copycat") { delete w.copied; return; }
    if (!w.copied || tick % COPYCAT_EVERY === 0) {
      const j = randomOther(i, other => other.trait !== "copycat");
      w.copied = j >= 0 ? workers[j].trait : null;
    }
  });

  const traits = workers.map(activeTrait);
  const status = workers.map(() => "");
  const friendCount = traits.filter(t => t === "friendship").length;
  const owlDay = Math.floor((tick - 1) / NIGHT_OWL_PHASE) % 2 === 0;  // true = double phase
  const goodPhase = company.hr === "schedule" ? 3 : 2;   // Schedule specialist makes the good phase ×3
  const legends = traits.filter(t => t === "legend").length;     // each Legend: +1 for every worker

  const earn = workers.map((w, i) => {
    const t = traits[i];
    let v = w.base + legends;
    if (company.hr === "motivator") v *= 1.15;
    if (t === "friendship") v *= 1 + 0.20 * friendCount;
    if (t === "bully") v *= 2;
    if (t === "hardworker") v *= 1 + HARD_WORKER_BONUS;
    if (t === "nightowl") { v *= owlDay ? goodPhase : 0.5; status[i] = owlDay ? "🦉 awake" : "🦉 sleepy"; }
    if (t === "morning")  { v *= owlDay ? goodPhase : 0.5; status[i] = owlDay ? "☀️ awake" : "☀️ sleepy"; }
    if (t === "mechanic") v *= 1 + 0.10 * state.companies.filter(c => c.typeId === "carwash").length;
    if (t === "overcharger") v *= 1.80;
    w.age = (w.age || 0) + 1;   // seconds this worker has worked
    if (t === "apprentice") {
      const skill = Math.min(2, 0.5 + 0.05 * Math.floor(w.age / 60));
      v *= skill;
      status[i] = "🎓 " + Math.round(skill * 100) + "%";
    }
    return v;
  });

  // Mentors double the lowest-earning co-worker
  traits.forEach((t, i) => {
    if (t !== "mentor") return;
    let lowest = -1;
    workers.forEach((_, j) => { if (j !== i && (lowest < 0 || earn[j] < earn[lowest])) lowest = j; });
    if (lowest >= 0) { earn[lowest] *= 2; status[lowest] = "🧑‍🏫 mentored"; }
  });

  // Concierges double the 2 best-paid co-workers (only the first 5 work, Copycats included)
  let onDuty = 0;
  traits.forEach((t, i) => {
    if (t !== "concierge") return;
    if (++onDuty > CONCIERGE_MAX) { if (status[i] === "") status[i] = "🛎️ off duty"; return; }
    const best = workers.map((_, j) => j).filter(j => j !== i)
      .sort((a, b) => earn[b] - earn[a]).slice(0, 2);
    best.forEach(j => { earn[j] *= 2; status[j] = "🛎️ served"; });
  });

  // Leaders double one random co-worker
  traits.forEach((t, i) => {
    if (t !== "leader") return;
    const j = randomOther(i);
    if (j >= 0) { earn[j] *= 2; status[j] = "⭐ boosted"; }
  });

  // Each Cleaner can stop one Lazy worker from slacking this second
  let cleanersFree = traits.filter(t => t === "cleaner").length;

  // Things that make a worker earn nothing
  workers.forEach((w, i) => {
    const t = traits[i];

    if (t === "lazy" && Math.random() < LAZY_CHANCE) {
      if (cleanersFree > 0) { cleanersFree--; status[i] = "🧹 kept busy"; }
      else { earn[i] = 0; status[i] = "😴 slacking"; }
    }

    if (t === "vip" && Math.random() < 1 / 30) { earn[i] *= 20; status[i] = "🧳 VIP tip!"; }

    if (t === "hardworker") {
      if (!w.burnout && Math.random() < BURNOUT_CHANCE) w.burnout = BURNOUT_SECONDS;
      if (w.burnout) { earn[i] = 0; status[i] = "🥵 burnt out"; w.burnout--; }
    } else {
      delete w.burnout;
    }

    if (t === "gambler" || t === "mastergambler") {
      const winChance = t === "mastergambler" ? 0.7 : 0.5;
      const icon = TRAITS[t].emoji;
      if (!w.luck || tick % GAMBLE_EVERY === 1) w.luck = Math.random() < winChance ? "win" : "lose";
      if (w.luck === "win") { earn[i] *= 2; status[i] = icon + " winning"; }
      else { earn[i] = 0; status[i] = icon + " losing"; }
    } else {
      delete w.luck;
    }

    if (t === "overcharger") {
      if (!w.complaint && Math.random() < 1 / 50) w.complaint = 15;
      if (w.complaint) { earn[i] = 0; status[i] = "😡 complaint"; w.complaint--; }
    } else {
      delete w.complaint;
    }

    if (t === "quickhands" && tick % 5 === 0) { earn[i] *= 2; status[i] = "✋ quick!"; }

    if (t === "scammer") {
      const r = Math.random();
      if (r < 0.2) { earn[i] *= 3; status[i] = "🤑 scammed!"; }
      else if (r < 0.3) { earn[i] *= -3; status[i] = "🚔 caught!"; }
    }
  });

  // Bullies stop one random co-worker from earning
  traits.forEach((t, i) => {
    if (t !== "bully") return;
    const j = randomOther(i);
    if (j >= 0) { earn[j] = 0; status[j] = "😢 bullied"; }
  });

  let total = earn.reduce((a, b) => a + b, 0);

  // Law firm: immigration lawyers boost car washes, business lawyers boost their current target
  if (company.typeId === "carwash") total *= 1 + LAW_IMMIGRATION * lawCount("immigration");
  total *= 1 + LAW_BUSINESS * businessLawyerTargets(company);

  // Car salons boost the car businesses
  if (company.typeId === "carwash" || company.typeId === "repair") {
    const salons = state.companies.filter(c => c.typeId === "salon").length;
    total *= 1 + 0.10 * salons;
  }
  if (company.typeId === "carwash") {
    const promoters = state.companies.filter(c => c.typeId === "salon")
      .reduce((a, c) => a + c.workers.filter(w => activeTrait(w) === "promoter").length, 0);
    total *= 1 + 0.02 * promoters;
  }

  // ----- Accountant -----
  const acc = company.accountant;
  if (acc === "numbers") total *= 1.15;

  if (acc === "criminal" && Math.random() < CRIMINAL_CHANCE) {
    total *= 2;
    result.flash = "🕵️ Criminal accounting: income doubled!";
  }

  if (acc === "embezzler") total *= 1 + EMBEZZLER_BONUS;

  if (acc === "gambler" && tick % GAMBLE_EVERY === 0) {
    if (Math.random() < 0.5) { total *= 2; result.flash = "🎰 The gamble paid off: income doubled!"; }
    else { result.flash = "🎰 Lost the bet: " + total.toFixed(1) + " gone!"; total = 0; }
  }

  // Remember the last 60 seconds of earnings (for the Embezzler)
  company.history = (company.history || []).concat(total).slice(-60);

  if (acc === "embezzler" && Math.random() < EMBEZZLER_CHANCE) {
    const stolen = EMBEZZLER_STEAL * company.history.reduce((a, b) => a + b, 0);
    total -= stolen;
    result.flash = "🦹 The embezzler stole " + fmt(stolen) + "!";
  }

  // Talent acquisition specialist: +5% when every worker spot is filled
  if (company.hr === "talent" && workers.length >= maxWorkers(company)) total *= 1.05;

  // Political influence doubles all business income
  if (state.influenceLeft > 0) total *= 2;

  result.total = total;
  result.perWorker = earn;
  result.status = status;
  return result;
}

/* =====================================================================
   DRAWING THE SHOP
   render() rebuilds the shop when something changes (buy, hire, fire).
   updateLive() only changes numbers, so buttons keep working while you click.
   ===================================================================== */
function render() {
  // Income has 3 pages: Businesses, Special businesses, Science (all are built; only the chosen one is shown,
  // so the live numbers of every page keep updating)
  const page = ["biz", "special", "science"].includes(state.incomePage) ? state.incomePage : "biz";
  const sciOpen = typeof scienceOpen === "function" && scienceOpen();
  const tabs = `<nav class="incomeTabs">
    <button class="incomeTab ${page === "biz" ? "active" : ""}" data-ipage="biz">${ico("business")}Businesses${bizNeedCount() ? ' <span class="tabWarn gold" title="A business has free worker slots">!</span>' : ""}</button>
    <button class="incomeTab ${page === "special" ? "active" : ""}" data-ipage="special">${ico("special")}Special</button>
    <button class="incomeTab ${page === "science" ? "active" : ""}" data-ipage="science">${sciOpen ? "" : ico("lock")}${ico("science")}Science</button></nav>`;
  // ⚠️ businesses that need you: a free worker slot, or no accountant / HR yet
  const needYou = state.companies.map((c, ci) => ({ c, ci })).filter(x => !staffReady(x.c) || x.c.workers.length < maxWorkers(x.c));
  let html = `<div ${page === "biz" ? "" : "hidden"} id="incBiz"><h2>🏢 Businesses</h2>${needYou.length ? `<button class="card bizNeed" data-action="jumpFree" data-company="${needYou[0].ci}">
    👷 <b>${needYou.length} ${needYou.length === 1 ? "business needs" : "businesses need"} staff</b> <span class="muted">· free worker slots earn nothing</span> <span class="bizNeedGo">Show ›</span></button>` : ""}`;

  // One owned company as a card
  const companyCard = (c, ci) => {
    let html = "";
    const t = typeOf(c);
    // Number them: Car Wash #1, #2, #3 (only when you can own more than one)
    const number = state.companies.slice(0, ci + 1).filter(x => x.typeId === c.typeId).length;
    const title = t.maxOwned > 1 ? `${t.name} #${number}` : t.name;
    // 📋 a running company is one compact row; tap it (or "Hire") to open workers and hiring
    if (staffReady(c) && !c.open) {
      const free = maxWorkers(c) - c.workers.length;
      return `<div class="card bizUnit compact ${free ? "needs" : ""}" id="c-card-${ci}">
        <div class="row"><h3>${bizIco(t.id)}${title}</h3><span class="income" id="c-income-${ci}">+0 / sec</span></div>
        <div class="bizUnitLine">${t.noStaff ? "" : `${staffIco(c.accountant, ACCOUNTANTS[c.accountant])}${staffIco(c.hr, HR_OPTIONS[c.hr])}`}
          <span class="bizSlots"><i style="width:${c.workers.length / maxWorkers(c) * 100}%"></i></span><span class="muted">${c.workers.length} / ${maxWorkers(c)} workers</span>
          ${c.workers.length ? "" : `<span class="bizHint">Hire workers to start earning</span>`}
          ${free ? `<button class="btn small" data-action="toggle" data-company="${ci}">👷 Hire · ${free} free</button>` : `<span class="bizFull">✅ Full</span><button class="btn ghost small" data-action="toggle" data-company="${ci}">▸ Details</button>`}</div></div>`;
    }
    html += `<div class="card bizUnit ${staffReady(c) ? "open" : "open setup"}" id="c-card-${ci}">
      <div class="row">
        <h3>${bizIco(t.id)}${title}</h3>
        <span class="row">
          <span class="income" id="c-income-${ci}">+0 / sec</span>
          ${staffReady(c)
            ? `<button class="btn ghost small" data-action="toggle" data-company="${ci}"
                 title="Hide">▴ Hide</button>`
            : ""}
        </span>
      </div>
      <div class="flash" id="c-flash-${ci}"></div>`;

    // Step 1: choose the accountant (not for small businesses without staff)
    if (!t.noStaff && !c.accountant) {
      html += `<h4>Hire your accountant</h4><div class="choices">`;
      for (const key in ACCOUNTANTS) {
        const a = ACCOUNTANTS[key];
        html += `<button class="choice" data-action="accountant" data-company="${ci}" data-pick="${key}">
                   <b>${staffIco(key, a, "staffI pick")}${a.name}</b><small>${a.desc}</small></button>`;
      }
      html += `</div></div>`;
      return html;
    }

    // Step 2: choose HR
    if (!t.noStaff && !c.hr) {
      html += `<div class="staff">${staffIco(c.accountant, ACCOUNTANTS[c.accountant])}Accountant: <b>${ACCOUNTANTS[c.accountant].name}</b></div>`;
      html += `<h4>Hire your HR manager</h4><div class="choices">`;
      for (const key in HR_OPTIONS) {
        const h = HR_OPTIONS[key];
        html += `<button class="choice" data-action="hr" data-company="${ci}" data-pick="${key}">
                   <b>${staffIco(key, h, "staffI pick")}${h.name}</b><small>${h.desc}</small></button>`;
      }
      html += `</div></div>`;
      return html;
    }

    // Step 3: the running company
    if (!t.noStaff) html += `<div class="staff">${staffIco(c.accountant, ACCOUNTANTS[c.accountant])}Accountant: <b>${ACCOUNTANTS[c.accountant].name}</b></div>
             <div class="staff">${staffIco(c.hr, HR_OPTIONS[c.hr])}HR: <b>${HR_OPTIONS[c.hr].name}</b></div>`;
    html += `<h4>Workers (${c.workers.length} / ${maxWorkers(c)})</h4>`;

    if (c.workers.length === 0) html += `<div class="muted">No workers yet. Hire someone to start earning!</div>`;

    c.workers.forEach((w, wi) => {
      const tr = TRAITS[w.trait];
      html += `<div class="worker" title="${tr.desc}">
                 <span class="name">${tr.emoji} ${w.name} <span class="muted">${tr.name}<span id="w-copy-${ci}-${wi}"></span> · base ${w.base}</span></span>
                 <span class="status" id="w-status-${ci}-${wi}"></span>
                 <span class="earn" id="w-earn-${ci}-${wi}">0</span>
                 <button class="btn ghost small" data-action="fire" data-company="${ci}" data-worker="${wi}">Fire</button>
               </div>`;
    });

    // Hiring
    if (c.workers.length < maxWorkers(c)) {
      // Candidates are always waiting while there is room
      if (!c.candidates) c.candidates = makeCandidates(c);
      const cost = hireCost(c);
      const refresh = refreshCost(c);
      html += `<h4>Choose who to hire (${cost === 0 ? "free" : fmt(cost) + " money"})</h4><div class="choices">`;
      c.candidates.forEach((cand, k) => {
        const tr = TRAITS[cand.trait];
        html += `<button class="choice" data-action="hire" data-company="${ci}" data-pick="${k}" data-cost="${cost}">
                   <b>${tr.emoji} ${cand.name}</b>
                   <span class="income">${cand.base} / sec</span><br>
                   <small><b>${tr.name}</b>: ${tr.desc}</small></button>`;
      });
      html += `</div><div style="margin-top:8px">
                 <button class="btn ghost small" data-action="refresh" data-company="${ci}" data-cost="${refresh}">
                   🔄 New options (${fmt(refresh)})</button></div>`;
    } else {
      html += `<div class="muted" style="margin-top:8px">The company is full.</div>`;
    }

    html += `</div>`;
    return html;
  };

  // ⭐ best value: the business you can buy now with the most worker income per coin
  const bizValue = (t) => (t.minIncome + t.maxIncome) / 2 * (t.maxEmployees - (t.noStaff ? 0 : 2)) / businessPrice(t);
  const buyable = BUSINESS_TYPES.filter(t => { const o = ownedOf(t.id); return o < t.maxOwned && o < allowedToOwn(t); });
  const best = buyable.length > 1 ? buyable.reduce((a, b) => bizValue(b) > bizValue(a) ? b : a) : null;
  // Businesses grouped by type: group header, your companies, then the buy card
  BUSINESS_TYPES.forEach(t => {
    const mine = state.companies.map((c, ci) => ({ c, ci })).filter(x => x.c.typeId === t.id);
    const owned = mine.length;

    if (owned > 0) {
      const collapsed = !!(state.groupCollapsed || {})[t.id];
      const workers = mine.reduce((a, x) => a + x.c.workers.length, 0);
      html += `<div class="card groupHead">
        <div class="row">
          <h3>${bizIco(t.id)}${t.name} <span class="muted">× ${owned}</span></h3>
          <span class="row">
            <span class="income" id="g-income-${t.id}">+0 / sec</span>
            <button class="btn ghost small" data-action="toggleGroup" data-type="${t.id}">${collapsed ? "▸ Show all" : "▾ Minimize all"}</button>
          </span>
        </div>
        <div class="muted">${owned} ${owned === 1 ? "business" : "businesses"} · ${workers} / ${mine.reduce((a, x) => a + maxWorkers(x.c), 0)} workers</div>
      </div>`;
      if (!collapsed) { html += `<div class="bizUnits">`; mine.forEach(x => { html += companyCard(x.c, x.ci); }); html += `</div>`; }
    }

    if (owned >= t.maxOwned) return;
    if (owned >= allowedToOwn(t)) {
      html += `<div class="card" style="opacity:0.6">
        <div class="row"><div><h3>${ico("lock", "lockS")}${bizIco(t.id)}${t.name}</h3>
          <div class="muted">Up to ${t.maxEmployees} employees · workers earn ${t.minIncome}–${t.maxIncome} / sec</div>
          <div class="muted">${t.unlockText(owned)}</div>
          <div class="muted">Owned: ${owned} / ${t.maxOwned}</div></div>
        <span class="muted">${fmt(businessPrice(t))}</span></div></div>`;
      return;
    }
    const maxN = bizMaxBuy(t);
    html += `<div class="card ${best === t ? "bestBuy" : ""}">
      ${best === t ? `<div class="bestTag" title="The most worker income for each coin you spend">⭐ Best value</div>` : ""}
      <div class="row">
        <div><h3>${bizIco(t.id)}${t.name}</h3>
          <div class="muted">${t.noStaff ? `${t.maxEmployees} workers · no accountant or HR` : `Up to ${t.maxEmployees} employees (incl. accountant &amp; HR)`} · workers earn ${t.minIncome}–${t.maxIncome} / sec</div>
          ${t.perk ? `<div class="muted">⭐ ${t.perk}</div>` : ""}
          <div class="muted">Owned: ${owned} / ${t.maxOwned}</div></div>
        <span class="buyBtns"><button class="btn" data-action="buy" data-type="${t.id}" data-cost="${businessPrice(t)}" data-buylbl="Buy ${fmt(businessPrice(t))}">Buy ${fmt(businessPrice(t))}</button>
          ${maxN.n > 1 ? `<button class="btn ghost small" data-action="buyMax" data-type="${t.id}">Max ×${maxN.n} · ${fmt(maxN.cost)}</button>` : ""}</span>
      </div></div>`;
  });

  html += `<div class="muted">More businesses coming soon...</div></div>`;
  html += `<div ${page === "special" ? "" : "hidden"} id="incSpecial">${renderSpecialBusinesses()}</div>`;
  html += `<div ${page === "science" ? "" : "hidden"} id="incScience"><h2>🔬 Science</h2>${typeof renderScience === "function" ? renderScience() : ""}</div>`;
  $("shop").innerHTML = tabs + html;
  updateAffordability();
}

// Grey out buttons you cannot afford (a Buy button says how much is missing)
function updateAffordability() {
  if (energyReady) updateEnergy();   // grey out the energy drink if you can't afford it
  document.querySelectorAll("[data-cost]").forEach(btn => {
    const cost = Number(btn.dataset.cost), no = state.money < cost;
    btn.disabled = no;
    if (btn.dataset.buylbl) { const t = no ? `Need ${fmt(cost - state.money)} more` : btn.dataset.buylbl; if (btn.dataset.shown !== t) { btn.dataset.shown = t; btn.textContent = t; } }
  });
  // the Max button appears / changes as your money grows
  document.querySelectorAll('[data-action="buyMax"]').forEach(btn => {
    const t = BUSINESS_TYPES.find(x => x.id === btn.dataset.type), m = t && bizMaxBuy(t);
    if (!m || m.n < 2) { btn.hidden = true; return; }
    btn.hidden = false; const lbl = `Max ×${m.n} · ${fmt(m.cost)}`; if (btn.dataset.shown !== lbl) { btn.dataset.shown = lbl; btn.textContent = lbl; }
  });
}
// how many of this business you can buy right now, and what they cost together
function bizMaxBuy(t) {
  let n = 0, cost = 0, owned = ownedOf(t.id);
  const cap = Math.min(t.maxOwned, allowedToOwn(t));
  while (owned + n < cap) { const p = t.price * Math.pow(t.priceMultiplier || 1, owned + n); if (cost + p > state.money) break; cost += p; n++; }
  return { n, cost };
}
// businesses that need you: a free worker slot, or no accountant / HR yet
const bizNeedCount = () => state.companies.filter(c => !staffReady(c) || c.workers.length < maxWorkers(c)).length;
function bizNeedTabs() {
  const n = bizNeedCount(), tab = document.querySelector('.tab[data-view="income"]');
  if (tab) { const has = !!tab.querySelector(".tabWarn"); if (n && !has) tab.insertAdjacentHTML("beforeend", ' <span class="tabWarn gold" title="A business has free worker slots">!</span>'); if (!n && has) tab.querySelector(".tabWarn").remove(); }
}
setInterval(bizNeedTabs, 1000);

let counterQueued = false;
function updateCounter() {   // batched: many calls in one frame (fast clicks, income) update the page once
  if (counterQueued) return;
  counterQueued = true;
  requestAnimationFrame(() => { counterQueued = false; updateCounterNow(); });
  if (document.hidden) setTimeout(() => { if (counterQueued) { counterQueued = false; updateCounterNow(); } }, 0);
}
// 🪙 Hovering your money shows it in every coin, in a steady box (a browser tooltip would blink as the money changes)
let counterTipOn = false;
function counterTipFill() {
  const tip = $("counterTip"); if (!tip) return;
  const m = Math.max(0, state.money), u = (d, n) => (Math.floor(m / d * 100) / 100).toLocaleString(undefined, { maximumFractionDigits: 2 });
  const rows = [["💎", "pcoin", PCOIN, "platinum"], ["🥇", "gcoin", GCOIN, "gold"], ["🥈", "scoin", SCOIN, "silver"], ["🥉", "bcoin", 1, "bronze"]]
    .filter(([, , d]) => d === 1 || m >= d / 1e3)
    .map(([e, n, d, name]) => `<div><span>${e}</span><b>${d === 1 ? Math.floor(m).toLocaleString() : u(d)}</b><span>${n}</span><small>${name}</small></div>`).join("");
  if (tip.dataset.h !== rows) { tip.dataset.h = rows; tip.innerHTML = rows; }
}
function updateCounterNow() {
  // Main counter: stays in bcoin until 100M, then switches to scoin (and gcoin at 1M scoin)
  const [num, unit] = splitCoins(state.money, 100 * SCOIN);
  $("counter").firstChild.nodeValue = num + " ";
  $("counter").querySelector("span").textContent = unit;
  if (counterTipOn) counterTipFill();   // the hover box with every coin (stays steady, no blinking)
  $("casinoMoney").textContent = fmt(state.money);
  updateVipBar();
  $("investMoney").textContent = fmt(state.money);
  $("logiMoney").textContent = fmt(state.money);
  updateAffordability();
}

/* =====================================================================
   SHOP BUTTONS (one listener for the whole shop)
   ===================================================================== */
$("shop").addEventListener("click", (event) => {
  const btn = event.target.closest("[data-action]");
  if (!btn || btn.disabled || isPaused()) return;

  const action = btn.dataset.action;
  const company = state.companies[btn.dataset.company];

  if (action === "buy") {
    const t = BUSINESS_TYPES.find(x => x.id === btn.dataset.type);
    const owned = state.companies.filter(c => c.typeId === t.id).length;
    const price = businessPrice(t);
    if (state.money < price || owned >= t.maxOwned) return;
    if (owned >= allowedToOwn(t)) return;
    state.money -= price;
    state.companies.push({ typeId: t.id, accountant: null, hr: null, workers: [], candidates: null });
  }
  if (action === "buyMax") {
    const t = BUSINESS_TYPES.find(x => x.id === btn.dataset.type), m = t && bizMaxBuy(t);
    if (!m || m.n < 1) return;
    for (let i = 0; i < m.n; i++) { state.money -= businessPrice(t); state.companies.push({ typeId: t.id, accountant: null, hr: null, workers: [], candidates: null }); }
    showNotice(`🏢 Bought ${m.n} × ${t.name} for ${fmt(m.cost)}.`);
  }
  if (action === "toggle") company.open = !company.open;
  if (action === "jumpFree") {   // open the first business that needs staff and scroll to it
    const ci = Number(btn.dataset.company), c = state.companies[ci];
    if (c) { c.open = true; state.groupCollapsed = state.groupCollapsed || {}; state.groupCollapsed[c.typeId] = false;
      render(); save(); setTimeout(() => { const el = $("c-card-" + ci); if (el) el.scrollIntoView({ block: "start", behavior: "smooth" }); }, 30); }
    return;
  }
  if (action === "buySpecial" && btn.dataset.special === "law") {
    if (state.special.law || state.money < LAW_PRICE) return;
    state.money -= LAW_PRICE;
    state.special.law = { attorneys: [], offer: null };
    showNotice("⚖️ Law Firm opened! Buy attorney slots to hire lawyers.");
  }
  if (action === "buySpecial" && btn.dataset.special === "warehouse") {
    if (warehouseCount() >= warehouseSlots() || state.money < WAREHOUSE_PRICE) return;
    state.money -= WAREHOUSE_PRICE;
    state.special.warehouses.push({ id: state.nextId++ });
    showNotice(`📦 Warehouse #${warehouseCount()} opened! Truck contracts now pay +${(WAREHOUSE_BONUS * 100 * warehouseCount()).toFixed(0)}%.`);
    if (typeof renderTankers === "function") renderTankers();
  }
  if (action === "buySpecial" && btn.dataset.special === "center") {
    if (state.special.center || centerLevel() < CENTER_LEVEL || state.money < CENTER_PRICE) return;
    state.money -= CENTER_PRICE;
    state.special.center = { upgrades: [], choosing: true };
    showNotice("🏬 Logistics Center opened! Choose its first upgrade.");
  }
  if (action === "centerPick") {
    const c = state.special.center;
    if (!c || !c.choosing || !CENTER_UPGRADES[btn.dataset.up]) return;
    c.upgrades.push(btn.dataset.up); c.choosing = false;
    showNotice(`🏬 ${CENTER_UPGRADES[btn.dataset.up].name}: active for all Logistics agents.`);
    if (typeof renderTankers === "function") renderTankers();
  }
  if (action === "centerBuy") {
    const c = state.special.center, up = btn.dataset.up;
    if (!c || c.choosing || !CENTER_UPGRADES[up] || c.upgrades.includes(up) || state.money < CENTER_UPGRADE_PRICE) return;
    state.money -= CENTER_UPGRADE_PRICE;
    c.upgrades.push(up);
    showNotice(`🏬 ${CENTER_UPGRADES[up].name}: active for all Logistics agents.`);
    if (typeof renderTankers === "function") renderTankers();
  }
  if (action === "buySpecial" && btn.dataset.special === "gallery") {
    if (state.special.gallery || paintingsOwned() < GALLERY_NEED || state.money < GALLERY_PRICE) return;
    state.money -= GALLERY_PRICE;
    state.special.gallery = { bought: true };
    showNotice(`🏛️ Art Gallery opened! +${fmt(GALLERY_PER_PAINTING)} / sec for each painting in your collection.`);
  }
  if (action === "buySpecial" && btn.dataset.special === "port") {
    if (state.special.port || tankersOwned() < 1 || state.money < PORT_PRICE) return;
    state.money -= PORT_PRICE;
    state.special.port = { bought: true };
    showNotice(`⚓ Trading Port opened! +${fmt(PORT_PER_TANKER)} / sec per tanker and tanker contracts pay +2.5%.`);
    if (typeof renderTankers === "function") renderTankers();
  }
  if (action === "buySpecial" && btn.dataset.special === "park") {
    if (state.special.parks.length >= hotelsOwned().length || state.money < PARK_PRICE) return;
    state.money -= PARK_PRICE;
    state.special.parks.push({ id: state.nextId++ });
    showNotice(`🎢 Amusement park #${state.special.parks.length} opened next to Hotel #${state.special.parks.length}!`);
  }
  if (action === "buySpecial" && btn.dataset.special === "recruit") {
    if (state.special.recruit || !recruitUnlocked() || state.money < RECRUIT_PRICE) return;
    state.money -= RECRUIT_PRICE;
    state.special.recruit = { bought: true };
    showNotice("🧑‍💼 Recruitment Agency opened! Set your 📝 Staffing plan, then 👥 Hire staff for every empty hotel and casino.");
  }
  if (action === "recruitPlan") return showRecruitPlan();
  if (action === "recruitAll") return showRecruitAll();
  if (action === "recruitHire") recruitHire();
  if (action === "toggleLaw") state.special.lawCollapsed = !state.special.lawCollapsed;
  if (action === "toggleAgency") state.special.agencyCollapsed = !state.special.agencyCollapsed;
  if (action === "lawSlot") {
    const law = state.special.law;
    if (!law || law.offer || law.attorneys.length >= LAW_MAX || state.money < lawSlotPrice()) return;
    state.money -= lawSlotPrice();
    law.offer = makeLawOffer();
  }
  if (action === "lawReplace") {
    const law = state.special.law, idx = Number(btn.dataset.idx);
    if (!law || law.offer || law.attorneys.length < LAW_MAX || !law.attorneys[idx] || state.money < LAW_REPLACE_PRICE) return;
    state.money -= LAW_REPLACE_PRICE;
    const fired = law.attorneys.splice(idx, 1)[0];
    law.replaceIdx = idx;              // the new attorney takes the same place
    law.offer = makeLawOffer();
    showNotice(`⚖️ Fired the ${ATTORNEYS[fired.type].name}. Choose a replacement.`);
  }
  if (action === "lawPick") {
    const law = state.special.law;
    if (!law || !law.offer) return;
    const type = law.offer[Number(btn.dataset.pick)];
    const a = { type, id: state.nextId++, target: -1, value: 0 };
    if (law.replaceIdx !== undefined && law.replaceIdx !== null) { law.attorneys.splice(law.replaceIdx, 0, a); law.replaceIdx = null; }
    else law.attorneys.push(a);
    law.offer = null;
    showNotice(`⚖️ Hired a ${ATTORNEYS[type].name}!`);
  }
  if (action === "buySpecial" && btn.dataset.special === "mine") {
    if (state.special.mines.length >= MINE_MAX || state.money < MINE_PRICE || goldProfit() < MINE_UNLOCK) return;
    state.money -= MINE_PRICE;
    // how much gold this mine holds: random 20M - 30M (rounded to 100k)
    const capacity = (MINE_CAP_MIN + secureRandomInt((MINE_CAP_MAX - MINE_CAP_MIN) / 100000 + 1) * 100000);
    state.special.mines.push({ id: state.nextId++, capacity, mined: 0 });
    state.stats.minesBought++;
    showNotice("⛏️ Gold mine bought! It holds " + coins(capacity) + " of gold.");
  }
  if (action === "buySpecial" && btn.dataset.special === "agency") {
    if (state.special.agency || state.money < AGENCY_PRICE || reProfit() < AGENCY_UNLOCK) return;
    state.money -= AGENCY_PRICE;
    state.special.agency = { agents: [], best: 0 };
    agencyHireAgents();
    showNotice("🏢 Real Estate Agency opened!");
  }
  if (action === "toggleGroup") {
    state.groupCollapsed = state.groupCollapsed || {};
    state.groupCollapsed[btn.dataset.type] = !state.groupCollapsed[btn.dataset.type];
  }
  if (action === "accountant") company.accountant = btn.dataset.pick;
  if (action === "hr") company.hr = btn.dataset.pick;
  if (action === "refresh") {
    const cost = refreshCost(company);
    if (state.money < cost) return;
    state.money -= cost;
    company.candidates = makeCandidates(company);
  }

  if (action === "hire") {
    const cost = hireCost(company);
    if (state.money < cost) return;
    const cand = company.candidates[btn.dataset.pick];
    if (cand.trait === "concierge" && conciergeCount(company) >= CONCIERGE_MAX) {
      showNotice("🛎️ This hotel already has " + CONCIERGE_MAX + " Concierges, the most allowed.");
      return;
    }
    state.money -= cost;
    company.workers.push(cand);
    company.candidates = null;
    if (company.workers.length >= maxWorkers(company)) company.open = false;   // full: fold it back to one row
  }

  if (action === "fire") company.workers.splice(Number(btn.dataset.worker), 1);

  save();
  updateCounter();
  render();
});

/* =====================================================================
   THE COIN
   ===================================================================== */
let recentClicks = [];

// Sliding window: keep only clicks from the last 1000 ms and count them
function canClick(now) {
  recentClicks = recentClicks.filter(t => now - t < 1000);
  if (recentClicks.length >= MAX_CLICKS_PER_SECOND) return false;
  recentClicks.push(now);
  return true;
}

// Floating "+1": a pool of reused elements in the #fx layer, animated with transform/opacity only
// (no new elements, no page layout: the graphics card moves them)
const plusPool = [];
let plusNext = 0;
function showPlus(x, y) {
  if (!plusPool.length) for (let i = 0; i < 14; i++) { const el = document.createElement("div"); el.className = "plus"; $("fx").appendChild(el); plusPool.push(el); }
  const el = plusPool[plusNext]; plusNext = (plusNext + 1) % plusPool.length;
  el.textContent = "+" + fmt(clickValue());
  el.style.color = energyActive() ? "#5be08f" : "";
  if (el.anim) el.anim.cancel();
  el.anim = el.animate([
    { transform: `translate(${x}px, ${y}px) translate(-50%, -50%)`, opacity: 1 },
    { transform: `translate(${x}px, ${y - 80}px) translate(-50%, -50%)`, opacity: 0 }],
    { duration: 800, easing: "ease-out", fill: "forwards" });
}

$("coin").addEventListener("click", (event) => {
  if (isPaused()) return;
  const coin = $("coin");
  if (!canClick(performance.now())) {
    // shake (only if not already shaking: no forced page re-layout on every extra click)
    if (!coin.shake || coin.shake.playState === "finished")
      coin.shake = coin.animate([{ translate: "0" }, { translate: "-6px" }, { translate: "6px" }, { translate: "0" }], { duration: 200 });
    const msg = "Max " + MAX_CLICKS_PER_SECOND + " clicks per second!";
    if ($("hint").textContent !== msg) $("hint").textContent = msg;
    return;
  }
  // clear the "too fast" warning, but keep tax messages on screen
  if ($("hint").textContent.startsWith("Max ")) $("hint").textContent = "";
  state.money += clickValue();
  clickedThisSecond += clickValue();   // counts toward taxable income
  state.stats.clicks++;
  updateCounter();
  save();

  const rect = coin.getBoundingClientRect();
  showPlus(event.clientX || rect.left + rect.width / 2, event.clientY || rect.top);
});

/* =====================================================================
   GAME LOOP: every second, companies pay out
   ===================================================================== */
/* =====================================================================
   TAX INSPECTION
   Each inspection makes a tax bill with its own 5-minute timer. Bills stack.
   When a timer runs out:
     - enough money  -> game pauses, pop-up asks you to confirm payment
     - not enough    -> bill +50% and 5 more minutes (only once)
     - still not enough after that -> if selling investments (20% fee) would cover it, the game pauses and offers
       that (🆘 emergency sale); otherwise game over
   ===================================================================== */
const isPaused = () => state.pendingTaxId !== null || state.gameOver || !!(state.science && state.science.lab && state.science.lab.pending);
const totalDebt = () => state.taxDebts.reduce((a, d) => a + d.amount, 0);

function startTaxInspection() {
  state.secondsSinceTax = 0;
  const earned = state.earnedHistory.reduce((a, b) => a + b, 0);
  const amount = Math.ceil(TAX_RATE * earned);
  if (amount <= 0) return;              // nothing earned, nothing to pay
  state.taxDebts.push({ id: state.nextId++, amount, timeLeft: TAX_TIME_TO_PAY, extended: false });
  showNotice("🧾 Tax inspection! You owe " + fmt(amount) + ". Pay within 5 minutes.");
}

function taxTick() {
  // Roll for a new inspection every second (they can stack)
  if (state.taxHoliday > 0) {   // 🛡️ after a prestige: no inspections for 10 minutes of play (the main menu doesn't count)
    if ($("mainMenu").hidden) state.taxHoliday--;
    state.secondsSinceTax = 0;
  }
  else {
    state.secondsSinceTax++;
    if (Math.random() < TAX_CHANCE || state.secondsSinceTax >= TAX_FORCED_AFTER) startTaxInspection();
  }

  state.taxDebts.forEach(d => { if (d.timeLeft > 0) d.timeLeft--; });

  // Handle bills whose time is up (one pop-up at a time)
  for (const d of state.taxDebts) {
    if (d.timeLeft > 0) continue;

    if (state.money >= d.amount) {
      state.pendingTaxId = d.id;      // pauses the game
      showPaymentPopup(d);
      return;
    }
    if (!d.extended) {
      d.amount = Math.ceil(d.amount * (1 + TAX_LATE_PENALTY));
      d.timeLeft = TAX_TIME_TO_PAY;
      d.extended = true;
      showNotice("⚠️ Not enough money! Tax bill raised to " + fmt(d.amount) + ". You have 5 more minutes.");
      continue;
    }
    if (typeof emergencyValue === "function" && state.money + emergencyValue() >= d.amount - 1) {
      state.pendingTaxId = d.id;      // pauses the game: sell investments to pay, or give up
      showPaymentPopup(d);
      return;
    }
    state.gameOver = true;
    showGameOver(d);
    return;
  }
}

/* ----- Red alert pop-up: shows for 8 seconds, click to close ----- */
function showAlert(title, text, kind = "") {
  const el = document.createElement("div");
  el.className = "alertPop " + kind;
  el.innerHTML = `<b>${title}</b>${text}<br><small>Click to close</small>`;
  el.addEventListener("click", () => el.remove());
  $("alerts").appendChild(el);
  setTimeout(() => el.remove(), 8000);
}

/* ----- Pop-up window ----- */
function showModal(html) {
  $("modalBox").classList.remove("gold", "wide", "about", "ornate");
  $("modalBox").innerHTML = html;
  $("modal").hidden = false;
}
function hideModal() { $("modal").hidden = true; $("modalBox").classList.remove("gold", "wide", "about", "ornate"); }

function showPaymentPopup(d) {
  if (state.money < d.amount) return showEmergencyPopup(d);   // final deadline and not enough money (also after a reload)
  showModal(`<h2>${ico("tax", "h")}Tax payment due</h2>
             <p>Time is up for your tax bill of <b>${fmt(d.amount)}</b>.</p>
             <p class="muted">The game is paused until you pay.</p>
             <button class="btn big" data-modal="pay">Pay ${fmt(d.amount)}</button>`);
}

// 🆘 final deadline, not enough money: sell investments with a 20% fee to pay the bill
function showEmergencyPopup(d) {
  const short = d.amount - Math.floor(state.money);
  const rows = emergencyAssets().map(a => `<tr><td>${a.label}</td><td>${fmt(a.value)}</td><td>${fmt(a.value * (1 - EMERGENCY_FEE))}</td></tr>`).join("");
  showModal(`<h2>${ico("tax", "h")}Final tax warning</h2>
             <p>Your tax bill of <b>${fmt(d.amount)}</b> is due and you only have <b>${fmt(Math.floor(state.money))}</b>: <b>${fmt(short)}</b> is missing.</p>
             <p>You can sell investments to cover it, with a <b>${EMERGENCY_FEE * 100}% fee</b>. Only what's needed is sold
               (Broker ETF, then ETF, then gold, then the cheapest properties; a property is sold whole).</p>
             <table class="wikiTable"><tr><th>Investment</th><th>Value</th><th>You get</th></tr>${rows}</table>
             <p class="muted">The game is paused until you choose. Live trading positions are not touched.</p>
             <button class="btn big" data-modal="emergency">Sell and pay ${fmt(d.amount)}</button>
             <button class="btn ghost" data-modal="giveup" style="margin-top:8px">Don't sell (game over)</button>`);
}

function showGameOver(d) {
  showModal(`<h2>💀 Game over</h2>
             <p>You couldn't pay your tax bill of <b>${fmt(d.amount)}</b>, even after the extension.</p>
             <p class="muted">The tax office took everything. Time to start again from zero.</p>
             <button class="btn big" data-modal="restart">Start over</button>`);
}

$("modal").addEventListener("click", (event) => {
  const action = event.target.closest("[data-modal]")?.dataset.modal;

  if (action === "pay") {
    const d = state.taxDebts.find(x => x.id === state.pendingTaxId);
    if (d) {
      state.money -= d.amount;
      taxRefund(d.amount);
      state.taxDebts = state.taxDebts.filter(x => x !== d);
      state.stats.taxPaid = (state.stats.taxPaid || 0) + 1;
    }
    state.pendingTaxId = null;        // resume the game
    hideModal();
    updateDebt();
    updateCounter();
    save();
  }

  if (action === "emergency") {
    const d = state.taxDebts.find(x => x.id === state.pendingTaxId);
    if (d) {
      const raised = emergencySell((d.amount - state.money) / (1 - EMERGENCY_FEE) + 1);
      if (state.money >= d.amount - 1) {   // (−1: rounding)
        state.money = Math.max(0, state.money - d.amount);
        taxRefund(d.amount);
        state.taxDebts = state.taxDebts.filter(x => x !== d);
        state.stats.taxPaid = (state.stats.taxPaid || 0) + 1;
        showNotice(`🆘 Sold investments for ${fmt(raised)} (after the 20% fee) and paid the tax bill of ${fmt(d.amount)}.`);
      } else { state.gameOver = true; showGameOver(d); save(); return; }
    }
    state.pendingTaxId = null;
    hideModal(); updateDebt(); updateCounter();
    if (typeof updateInvestLive === "function") updateInvestLive();
    if (typeof renderProperties === "function") renderProperties();
    save();
  }
  if (action === "giveup") {
    const d = state.taxDebts.find(x => x.id === state.pendingTaxId);
    state.pendingTaxId = null; state.gameOver = true; showGameOver(d || { amount: totalDebt() }); save();
  }

  if (action === "restart" || action === "confirmReset") {
    stopSaving = true;
    storage.clearGame();
    location.reload();
  }
  if (action === "close") hideModal();
});

/* ----- Short message under the coin ----- */
let noticeTimer = null;
function showNotice(text) {
  $("hint").textContent = text;
  clearTimeout(noticeTimer);
  noticeTimer = setTimeout(() => { $("hint").textContent = ""; }, 6000);
}

/* ----- Red debt button ----- */
const clock = (sec) => Math.floor(sec / 60) + ":" + String(sec % 60).padStart(2, "0");

function updateDebt() {
  const btn = $("debt");
  const banners = document.querySelectorAll(".debtBanner");
  if (state.taxDebts.length === 0) { btn.hidden = true; banners.forEach(b => b.hidden = true); return; }
  const soonest = Math.min(...state.taxDebts.map(d => d.timeLeft));
  const text = debtMsgUntil > Date.now() ? `${ico("tax")}${debtMsg}`
    : `${ico("tax")}TAX DEBT: ${fmt(totalDebt())} · ${clock(soonest)} left · click to pay`;
  banners.forEach(b => { b.hidden = false; if (b.innerHTML !== text) b.innerHTML = text; });

  // soonest deadline first
  const bills = [...state.taxDebts].sort((a, b) => a.timeLeft - b.timeLeft);
  btn.hidden = false;
  btn.classList.toggle("urgent", bills[0].timeLeft <= 60);
  btn.innerHTML = `${ico("tax")}TAX DEBT: ${fmt(totalDebt())}
    <small>Click to pay</small>
    ${bills.map(d => `<small>${fmt(d.amount)}${d.extended ? " (+50%, last chance!)" : ""} · ${clock(d.timeLeft)} left</small>`).join("")}`;
}

// Clicking pays as much as you can, starting with the bill closest to its deadline
// (the red button on Income, or the red banner at the top of every other tab)
let debtMsg = "", debtMsgUntil = 0;   // a short result shown on the banner after clicking it
function payTaxDebt() {
  if (isPaused()) return;
  const before = totalDebt();
  state.taxDebts.sort((a, b) => a.timeLeft - b.timeLeft);
  for (const d of state.taxDebts) {
    const pay = Math.min(Math.floor(state.money), d.amount);
    state.money -= pay;
    d.amount -= pay;
    if (pay > 0) taxRefund(pay);
  }
  state.stats.taxPaid = (state.stats.taxPaid || 0) + state.taxDebts.filter(d => d.amount <= 0).length;   // bills paid off
  state.taxDebts = state.taxDebts.filter(d => d.amount > 0);
  const paid = before - totalDebt();
  const msg = state.taxDebts.length && paid <= 0 ? `Not enough money: you have ${fmt(Math.floor(state.money))}, you owe ${fmt(totalDebt())}`
    : state.taxDebts.length ? `Paid ${fmt(paid)}. Still owed: ${fmt(totalDebt())}` : paid > 0 ? `Tax paid: ${fmt(paid)}. All bills are settled.` : "";
  if (msg) { showNotice("🧾 " + msg); debtMsg = msg; debtMsgUntil = Date.now() + 3000; }
  updateDebt();
  updateCounter();
  save();
}
$("debt").addEventListener("click", payTaxDebt);

let clickedThisSecond = 0;

const flashUntil = {};   // keeps each company message on screen for 3 seconds
const signed = (n) => Math.abs(n) >= SCOIN ? (n < 0 ? "" : "+") + fmt(n) : (n < 0 ? "" : "+") + n.toFixed(1);

// One game second. Called by the game clock (see GAME CLOCK), which runs it once for every real second that passed.
function gameTick() {
  if (isPaused()) return;   // no income and no timers while a pop-up is open
  let perSecond = 0;
  const now = Date.now();

  const groupIncome = {};
  state.companies.forEach((c, ci) => {
    const r = runCompany(c);
    perSecond += r.total;
    groupIncome[c.typeId] = (groupIncome[c.typeId] || 0) + r.total;
    companyIncomeNow[ci] = r.total;   // used by amusement parks

    const incomeEl = $("c-income-" + ci);
    if (incomeEl) { incomeEl.textContent = signed(r.total) + " / sec"; incomeEl.classList.toggle("neg", r.total < 0); }

    const flashEl = $("c-flash-" + ci);
    if (r.flash) flashUntil[ci] = now + 3000;
    if (flashEl) {
      if (r.flash) flashEl.textContent = r.flash;
      else if (!flashUntil[ci] || now > flashUntil[ci]) flashEl.textContent = "";
    }

    r.perWorker.forEach((amount, wi) => {
      const earnEl = $("w-earn-" + ci + "-" + wi);
      const statusEl = $("w-status-" + ci + "-" + wi);
      const copyEl = $("w-copy-" + ci + "-" + wi);
      if (earnEl) earnEl.textContent = amount.toFixed(1);
      if (statusEl) statusEl.textContent = r.status[wi];
      if (copyEl) {
        const w = c.workers[wi];
        copyEl.textContent = w.copied ? " as " + TRAITS[w.copied].emoji + " " + TRAITS[w.copied].name : "";
      }
    });
  });

  for (const typeId in groupIncome) {
    const el = $("g-income-" + typeId);
    if (el) { el.textContent = signed(groupIncome[typeId]) + " / sec"; el.classList.toggle("neg", groupIncome[typeId] < 0); }
  }

  // Special businesses
  const agencyIncome = agencyTick(), mineIncome = mineTick();
  perSecond += agencyIncome + mineIncome + lawTick() + parkTick() + portTick() + galleryTick() + (typeof scienceTick === "function" ? scienceTick() : 0);
  // for offline earnings: business income without gold mines (mines are counted on their own), last 60 seconds
  const passive = Math.max(0, perSecond - mineIncome) * legacyIncomeMult();
  (state.passiveHist = state.passiveHist || []).push(Math.round(passive));
  if (state.passiveHist.length > 60) state.passiveHist.shift();
  if (perSecond > 0) perSecond *= legacyIncomeMult();   // ⭐ Tycoon's Legacy: +25% per pick
  if (perSecond > state.stats.bestIncome) state.stats.bestIncome = perSecond;   // record for achievements

  state.money = Math.max(0, state.money + perSecond);

  clickedThisSecond += logisticsTick();   // tanker deliveries count as taxable income
  clickedThisSecond += investTick();   // real estate rent counts as taxable income

  // Remember what was earned this second, keep only the last 5 minutes
  state.earnedHistory.push(Math.max(0, perSecond) + clickedThisSecond);
  if (state.earnedHistory.length > TAX_LOOKBACK) state.earnedHistory.shift();
  clickedThisSecond = 0;

  taxTick();
  energyTick();
  updateDebt();
  $("perSecond").textContent = signed(perSecond) + " / sec";
  $("perSecond").classList.toggle("neg", perSecond < 0);
  state.lastIncome = perSecond;   // used by the magical pill
  updateCounter();
}

/* =====================================================================
   VIEWS: switch between Income and Casino (income keeps running either way)
   ===================================================================== */
function showView(view) {
  if (view === "art") { view = "games"; state.gamePage = "art"; }   // the Art Gallery now lives in 🎮 Mini-games
  // 📱 phone: empty the two biggest pages when leaving them (they are rebuilt when shown again) to keep the page light
  if (typeof isPhone === "function" && isPhone() && state.view !== view) {
    if (state.view === "achievements" && $("achList")) $("achList").innerHTML = "";
    if (state.view === "wiki" && $("wikiBody")) $("wikiBody").innerHTML = "";
  }
  state.view = view;
  $("incomeView").hidden = view !== "income";
  $("casinoView").hidden = view !== "casino";
  $("investView").hidden = view !== "invest";
  if (view === "shop") view = state.view = "pet";   // the old Shop page became the 🐾 Pet page
  $("petView").hidden = view !== "pet";
  if (view === "pet" && typeof renderPetPage === "function") renderPetPage();
  $("logisticsView").hidden = view !== "logistics";
  $("achievementsView").hidden = view !== "achievements";
  $("wikiView").hidden = view !== "wiki";
  if ($("profileView")) $("profileView").hidden = view !== "profile";
  if (view === "profile" && typeof renderProfile === "function") renderProfile();
  if ($("profileBtn")) $("profileBtn").classList.toggle("on", view === "profile");
  // 🎮 Mini-games: the hub, or one game page (state.gamePage: null = hub, "art", "mine")
  const gp = view === "games" ? (state.gamePage || null) : undefined;
  $("gamesView").hidden = view !== "games" || gp === "art";
  $("artView").hidden = gp !== "art";
  if (view === "logistics" && typeof renderSatellite === "function") renderSatellite();
  if (gp === "art" && typeof renderArt === "function") renderArt();
  if (view === "games" && gp !== "art" && typeof renderGames === "function") renderGames();
  if (view === "wiki" && typeof renderWiki === "function") renderWiki();
  if (view === "achievements" && typeof renderAchievements === "function") renderAchievements();
  document.querySelectorAll(".tab").forEach(t => t.classList.toggle("active", t.dataset.view === view));
  // 📱 phone: keep the selected tab visible in the scrollable bottom bar
  if (typeof isPhone === "function" && isPhone()) {
    const t = document.querySelector(`.tab[data-view="${view}"]`), bar = $("tabs");
    if (t && bar) bar.scrollTo({ left: t.offsetLeft - (bar.clientWidth - t.offsetWidth) / 2, behavior: "smooth" });
  }
  save();
}
$("tabs").addEventListener("click", (e) => {
  const tab = e.target.closest(".tab");
  if (tab) showView(tab.dataset.view);
});
document.querySelectorAll(".debtBanner").forEach(b => b.addEventListener("click", payTaxDebt));   // pay right here, no need to go to Income
document.body.insertAdjacentHTML("beforeend", `<div id="counterTip" hidden></div>`);   // outside the counter: it clips what it holds
$("counter").addEventListener("mouseenter", () => {
  counterTipOn = true; counterTipFill(); const t = $("counterTip"), r = $("counter").getBoundingClientRect();
  t.hidden = false; t.style.left = (r.left + r.width / 2) + "px"; t.style.top = (r.bottom + 4) + "px";
});
$("counter").addEventListener("mouseleave", () => { counterTipOn = false; $("counterTip").hidden = true; });
