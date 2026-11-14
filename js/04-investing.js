/* =====================================================================
   INVESTING
   Investor level: XP for every minute you have money invested (same level curve as the casino).
   ===================================================================== */
const RE_MIN = 50000;
const RE_LOCK = 1200;           // 20 minutes locked after buying
const RE_RENT_EVERY = 45;       // rent every 45 seconds...
const RE_RENT_RATE = 0.012;     // ...of 1.2% of the property's value (about +80% per hour after crashes)
const RE_CRASH_CHANCE = 1 / 21600;  // about one crash every 6 hours
const RE_CRASH_LOSS = 0.70;     // a crash wipes out 70% of every property's value

const ETF_MIN = 1000;
const ETF_EVERY = 10;           // the market moves every 10 seconds
const ETF_BASE_FEE = 0.10;      // 10% cash-out fee at level 1...
const ETF_FEE_PER_LEVEL = 0.001;// ...0.1% less for every level above 1

if (!state.invest) state.invest = { xp: 0, properties: [], etf: 0, etfTimer: ETF_EVERY, etfHistory: [] };
const inv = state.invest;

const investLevel = () => levelInfo(inv.xp, INVEST_XP).level;
const RE_LEVEL_BONUS = 0.001;   // +0.1% on property sales per Investor level
const etfFee = () => Math.max(0, ETF_BASE_FEE - ETF_FEE_PER_LEVEL * (investLevel() - 1));

// Shows a message in the card it belongs to (re / etf / gold / petf), or in the general line above
function investMessage(text, good, area) {
  const el = (area && $("msg-" + area)) || $("investMsg");
  el.textContent = text;
  el.className = (area ? "cardMsg " : "") + (good ? "income" : "flash");
}

function updateInvestLevel() {
  const info = levelInfo(inv.xp, INVEST_XP);
  $("investLevelNum").textContent = info.level;
  $("investLevelText").textContent = info.level + (info.max ? " (MAX)" : "");
  $("investFeeText").textContent = "ETF cash-out fee " + pct(etfFee()) + " · property sales +" + pct(RE_LEVEL_BONUS * investLevel());
  $("etfFeeInline").textContent = pct(etfFee());
  $("investXpFill").style.width = info.max ? "100%" : (100 * info.into / info.need) + "%";
  $("investXpText").textContent = info.max ? "Max level reached!"
    : fmtNum(info.into) + " / " + fmtNum(info.need) + " XP to level " + (info.level + 1);
}

function addInvestXp(amount) {
  const before = investLevel();
  inv.xp += amount;
  updateInvestLevel();
  if (investLevel() > before) {
    render();   // a new hotel may have unlocked
    const box = $("investLevel");
    box.classList.remove("levelUp"); void box.offsetWidth; box.classList.add("levelUp");
    investMessage("🎉 Investor level up! Now level " + investLevel() + ". ETF fee is now " + pct(etfFee()) + ".", true);
  }
}

// Read an amount box; returns a whole number or 0
const readAmount = (id) => Math.floor(Number($(id).value)) || 0;

// 25% / 50% / All buttons fill in an amount of your money
document.querySelectorAll("[data-invpct]").forEach(btn => {
  btn.addEventListener("click", () => {
    const box = { re: "reAmount", etf: "etfAmount", petf: "petfAmount", gold: "goldAmount" }[btn.dataset.invpct];
    let amount = Math.floor(state.money * Number(btn.dataset.pct));
    if (btn.dataset.invpct === "petf") amount = Math.min(amount, PETF_MAX);
    $(box).value = amount;
  });
});

/* ----- Info buttons: show / hide the explanation of each investment ----- */
if (!inv.infoOpen) inv.infoOpen = {};
function applyInfo() {
  document.querySelectorAll("[data-info]").forEach(btn => {
    const open = !!inv.infoOpen[btn.dataset.info];
    $("info-" + btn.dataset.info).hidden = !open;
    btn.classList.toggle("open", open);
    btn.textContent = open ? "ℹ️ Hide info" : "ℹ️ Info";
  });
}
document.querySelectorAll("[data-info]").forEach(btn => {
  btn.addEventListener("click", () => {
    inv.infoOpen[btn.dataset.info] = !inv.infoOpen[btn.dataset.info];
    applyInfo(); save();
  });
});
applyInfo();

/* ----- Real estate ----- */
$("reBuy").addEventListener("click", () => {
  if (isPaused()) return;
  const amount = readAmount("reAmount");
  if (amount < RE_MIN) return investMessage("Real estate needs at least " + fmt(RE_MIN) + ".", false, "re");
  if (amount > state.money) return investMessage("You don't have that much money.", false, "re");
  state.money -= amount;
  inv.properties.push({ id: state.nextId++, value: amount, lock: RE_LOCK, rentIn: RE_RENT_EVERY });
  investRecord("re", amount, 0);
  $("reAmount").value = "";
  investMessage("🏠 Bought a property for " + fmt(amount) + ".", true, "re");
  renderProperties(); updateCounter(); updateInvestLive(); save();
});

$("reList").addEventListener("click", (e) => {
  if (e.target.closest("[data-re-toggle]")) {
    inv.reCollapsed = !inv.reCollapsed;
    renderProperties(); save();
    return;
  }
  const btn = e.target.closest("[data-sell]");
  if (!btn || isPaused()) return;
  const p = inv.properties.find(x => x.id === Number(btn.dataset.sell));
  if (!p || p.lock > 0) return;
  state.money += p.value;
  investRecord("re", 0, p.value);
  inv.properties = inv.properties.filter(x => x !== p);
  state.stats.reSold = (state.stats.reSold || 0) + 1;
  let bonusText = "";
  if (state.special && state.special.agency) {
    const bonus = p.value * AGENCY_SALE_BONUS;
    state.money += bonus;
    investRecord("re", 0, bonus);          // counts toward real estate profit (and new agents)
    bonusText = ` 🏢 Agency bonus +${fmt(bonus)}.`;
  }
  // 📈 Investor level: +0.1% on every property sale per level
  const lvlBonus = p.value * RE_LEVEL_BONUS * investLevel();
  state.money += lvlBonus;
  investRecord("re", 0, lvlBonus);
  bonusText += ` 📈 Investor level +${fmt(lvlBonus)}.`;
  const reLawyers = lawCount("realestate");
  if (reLawyers > 0) {
    const bonus = p.value * 0.02 * reLawyers;
    state.money += bonus;
    investRecord("re", 0, bonus);
    bonusText += ` ⚖️ Real estate lawyer${reLawyers > 1 ? "s" : ""} +${fmt(bonus)}.`;
  }
  investMessage("Sold a property for " + fmt(p.value) + "." + bonusText, true, "re");
  renderProperties(); updateCounter(); updateInvestLive(); save();
});

// Summary line for all properties (shown at the top, and alone when minimized)
function reSummary() {
  const ps = inv.properties;
  const total = ps.reduce((a, p) => a + p.value, 0);
  const unlocked = ps.filter(p => p.lock <= 0).length;
  const nextRent = Math.min(...ps.map(p => p.rentIn));
  return `${ps.length} ${ps.length === 1 ? "property" : "properties"} · total value <b>${fmt(total)}</b> · ` +
         `next rent ${clock(nextRent)} (+${fmt(total * RE_RENT_RATE)}) · ${unlocked} / ${ps.length} can be sold`;
}

function renderProperties() {
  if (inv.properties.length === 0) { $("reList").innerHTML = `<div class="muted">You don't own any property yet.</div>`; return; }
  const collapsed = !!inv.reCollapsed;
  const head = `<div class="row" style="margin-bottom:6px">
      <span class="muted" id="re-summary">${reSummary()}</span>
      <button class="btn ghost small" data-re-toggle="1">${collapsed ? "▸ Show all" : "▾ Minimize all"}</button>
    </div>`;
  if (collapsed) { $("reList").innerHTML = head; return; }
  $("reList").innerHTML = head + inv.properties.map((p, i) => `
    <div class="property">
      <span class="grow">🏠 Property ${i + 1} · value <b id="re-value-${p.id}">${fmt(p.value)}</b></span>
      <span class="muted">rent in <span id="re-rent-${p.id}">${clock(p.rentIn)}</span></span>
      <button class="btn small" data-sell="${p.id}" id="re-sell-${p.id}" ${p.lock > 0 ? "disabled" : ""}>
        ${p.lock > 0 ? "🔒 " + clock(p.lock) : "Sell"}</button>
    </div>`).join("");
}

/* ----- ETF ----- */
$("etfBuy").addEventListener("click", () => {
  if (isPaused()) return;
  const amount = readAmount("etfAmount");
  if (amount < ETF_MIN) return investMessage("The ETF needs at least " + fmt(ETF_MIN) + " per investment.", false, "etf");
  if (amount > state.money) return investMessage("You don't have that much money.", false, "etf");
  state.money -= amount;
  inv.etf += amount;
  inv.etfInvested += amount;
  investRecord("etf", amount, 0);
  $("etfAmount").value = "";
  investMessage("📊 Invested " + fmt(amount) + " in the ETF.", true, "etf");
  updateCounter(); updateInvestLive(); save();
});

function cashOutEtf(amount) {
  if (isPaused()) return;
  amount = Math.min(amount, inv.etf);
  if (amount <= 0) return investMessage("Nothing to cash out.", false, "etf");
  const fee = amount * etfFee();
  inv.etfInvested *= 1 - amount / inv.etf;   // cashing out part also takes out that part of what you invested
  inv.etf -= amount;
  if (inv.etf < 0.5) { inv.etf = 0; inv.etfInvested = 0; }
  state.money += amount - fee;
  investRecord("etf", 0, amount - fee);
  $("etfSellAmount").value = "";
  investMessage(`Cashed out ${fmt(amount)} (fee ${fmt(fee)}): +${fmt(amount - fee)} to your money.`, true, "etf");
  updateCounter(); updateInvestLive(); save();
}
$("etfSell").addEventListener("click", () => cashOutEtf(readAmount("etfSellAmount")));
$("etfSellAll").addEventListener("click", () => cashOutEtf(inv.etf));
$("etfSellAmount").addEventListener("input", updateInvestLive);

/* ----- Broker ETF (needs a Brokerage Firm): no fee, one slot ----- */
if (typeof inv.petf !== "number") { inv.petf = 0; inv.petfTimer = ETF_EVERY; inv.petfHistory = []; }
// Gold: the safest, slowest investment (moves with the ETF every 10 seconds, no fee)
if (typeof inv.gold !== "number") { inv.gold = 0; inv.goldInvested = 0; inv.goldHistory = []; inv.goldPrices = [100]; }

function goldRoll() {
  const r = Math.random();
  if (r < 0.24) return 0.004;     // +0.4%
  if (r < 0.65) return 0.002;     // +0.2%
  return -0.0015;                 // −0.15%
}

$("goldBuy").addEventListener("click", () => {
  if (isPaused()) return;
  const amount = readAmount("goldAmount");
  if (amount < ETF_MIN) return investMessage("Gold needs at least " + fmt(ETF_MIN) + ".", false, "gold");
  if (amount > state.money) return investMessage("You don't have that much money.", false, "gold");
  state.money -= amount;
  inv.gold += amount;
  inv.goldInvested += amount;
  investRecord("gold", amount, 0);
  $("goldAmount").value = "";
  investMessage("🪙 Bought " + fmt(amount) + " of gold.", true, "gold");
  updateCounter(); updateInvestLive(); save();
});

const GOLD_SELL_COOLDOWN = 300;   // after selling gold, wait 5 minutes before selling again
if (typeof inv.goldCooldown !== "number") inv.goldCooldown = 0;

function cashOutGold(amount) {
  if (isPaused()) return;
  if (inv.goldCooldown > 0) return investMessage("⏳ You can sell gold again in " + clock(inv.goldCooldown) + ".", false, "gold");
  amount = Math.min(amount, inv.gold);
  if (amount <= 0) return investMessage("No gold to cash out.", false, "gold");
  inv.goldCooldown = GOLD_SELL_COOLDOWN;
  inv.goldInvested *= 1 - amount / inv.gold;
  inv.gold -= amount;
  if (inv.gold < 0.5) { inv.gold = 0; inv.goldInvested = 0; }
  state.money += amount;
  investRecord("gold", 0, amount);
  $("goldSellAmount").value = "";
  investMessage("🪙 Sold " + fmt(amount) + " of gold (no fee).", true, "gold");
  updateCounter(); updateInvestLive(); save();
}
$("goldSell").addEventListener("click", () => cashOutGold(readAmount("goldSellAmount")));
$("goldSellAll").addEventListener("click", () => cashOutGold(inv.gold));

// How much you put in (to show profit / loss). Old saves: count the current value as invested.
if (typeof inv.etfInvested !== "number") inv.etfInvested = inv.etf;
if (typeof inv.petfInvested !== "number") inv.petfInvested = inv.petf;
// Market price of each ETF (starts at 100) - it moves every 10 seconds even if you hold nothing
const CHART_POINTS = 120;   // 120 moves = the last 20 minutes
if (!inv.etfPrices)  inv.etfPrices  = [100];
if (!inv.petfPrices) inv.petfPrices = [100];
const hasBroker = () => state.companies.some(c => c.typeId === "broker");
const PETF_MAX = 10000000;   // you can put at most 10M into the Broker ETF

$("petfBuy").addEventListener("click", () => {
  if (isPaused() || !hasBroker()) return;
  if (inv.petf > 0) return investMessage("The Broker ETF has one slot. Cash out first to invest again.", false, "petf");
  const amount = readAmount("petfAmount");
  if (amount < ETF_MIN) return investMessage("The Broker ETF needs at least " + fmt(ETF_MIN) + ".", false, "petf");
  if (amount > PETF_MAX) return investMessage("The Broker ETF accepts at most " + fmt(PETF_MAX) + ".", false, "petf");
  if (amount > state.money) return investMessage("You don't have that much money.", false, "petf");
  state.money -= amount;
  inv.petf = amount;
  inv.petfInvested = amount;
  investRecord("petf", amount, 0);
  inv.petfTimer = ETF_EVERY;
  $("petfAmount").value = "";
  investMessage("🏦 Invested " + fmt(amount) + " in the Broker ETF.", true, "petf");
  updateCounter(); updateInvestLive(); save();
});

$("petfSell").addEventListener("click", () => {
  if (isPaused() || inv.petf <= 0) return;
  const amount = inv.petf;
  state.money += amount;
  investRecord("petf", 0, amount);
  inv.petf = 0;
  inv.petfInvested = 0;
  investMessage("🏦 Cashed out " + fmt(amount) + " from the Broker ETF (no fee).", true, "petf");
  updateCounter(); updateInvestLive(); save();
});

// One Broker ETF move: same odds, bigger wins
function petfRoll() {
  const r = Math.random();
  if (r < 0.10) return -0.04;
  if (r < 0.20) return 0.05;
  return Math.random() < 0.5 ? 0.02 : -0.01;
}

/* ----- Stock chart (SVG line chart with hover) ----- */
const CHART_W = 600, CHART_H = 190, PAD_L = 8, PAD_R = 52, PAD_T = 10, PAD_B = 18;

function chartGeometry(prices) {
  let min = Math.min(...prices), max = Math.max(...prices);
  if (max - min < 0.5) { min -= 0.25; max += 0.25; }
  const pad = (max - min) * 0.08;
  min -= pad; max += pad;
  const n = Math.max(prices.length - 1, 1);
  const x = (i) => PAD_L + (CHART_W - PAD_L - PAD_R) * (i / n);
  const y = (v) => PAD_T + (CHART_H - PAD_T - PAD_B) * (1 - (v - min) / (max - min));
  return { min, max, x, y };
}

function drawChart(id, prices, label) {
  const box = $(id);
  if (!box) return;
  const { min, max, x, y } = chartGeometry(prices);
  const first = prices[0], last = prices[prices.length - 1];
  const up = last >= first;
  const color = up ? "#5be08f" : "#ff6b6b";
  const change = (last / first - 1) * 100;

  const line = prices.map((v, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(" ");
  const area = `${line} L${x(prices.length - 1).toFixed(1)},${CHART_H - PAD_B} L${x(0).toFixed(1)},${CHART_H - PAD_B} Z`;

  // 4 recessive grid lines with price labels on the right
  let grid = "";
  for (let k = 0; k <= 3; k++) {
    const v = min + (max - min) * (k / 3);
    grid += `<line x1="${PAD_L}" x2="${CHART_W - PAD_R}" y1="${y(v)}" y2="${y(v)}" stroke="#ffffff" stroke-opacity="0.07"/>
             <text x="${CHART_W - PAD_R + 6}" y="${y(v) + 4}" fill="#8d8da3" font-size="11">${v.toFixed(1)}</text>`;
  }
  const gradId = id + "Grad";
  box.innerHTML = `
    <div class="chartHead"><span>${label || `Price · last ${Math.round((prices.length - 1) * ETF_EVERY / 60)} min`}</span>
      <span style="color:${color}; font-weight:700">${last.toFixed(2)} (${change >= 0 ? "+" : ""}${change.toFixed(2)}%)</span></div>
    <svg viewBox="0 0 ${CHART_W} ${CHART_H}" preserveAspectRatio="none" role="img" aria-label="ETF price chart">
      <defs><linearGradient id="${gradId}" x1="0" x2="0" y1="0" y2="1">
        <stop offset="0" stop-color="${color}" stop-opacity="0.28"/><stop offset="1" stop-color="${color}" stop-opacity="0"/>
      </linearGradient></defs>
      ${grid}
      <line x1="${PAD_L}" x2="${CHART_W - PAD_R}" y1="${y(first)}" y2="${y(first)}" stroke="#ffffff" stroke-opacity="0.25" stroke-dasharray="4 4"/>
      <path d="${area}" fill="url(#${gradId})"/>
      <path d="${line}" fill="none" stroke="${color}" stroke-width="2" vector-effect="non-scaling-stroke" stroke-linejoin="round"/>
      <circle cx="${x(prices.length - 1)}" cy="${y(last)}" r="4" fill="${color}" stroke="#15161f" stroke-width="2"/>
      <line class="cross" x1="0" x2="0" y1="${PAD_T}" y2="${CHART_H - PAD_B}" stroke="#ffffff" stroke-opacity="0.4" visibility="hidden"/>
      <circle class="crossDot" r="4" fill="${color}" stroke="#fff" stroke-width="1.5" visibility="hidden"/>
    </svg>
    <div class="chartTip" hidden></div>`;
  box.dataset.chart = id;
}

// Crosshair + tooltip on hover
function chartHover(id, getPrices) {
  const box = $(id);
  box.addEventListener("mousemove", (e) => {
    const svg = box.querySelector("svg");
    if (!svg) return;
    const prices = getPrices();
    const rect = svg.getBoundingClientRect();
    const sx = (e.clientX - rect.left) / rect.width * CHART_W;
    const { x, y } = chartGeometry(prices);
    const n = prices.length - 1;
    const i = Math.max(0, Math.min(n, Math.round((sx - PAD_L) / (CHART_W - PAD_L - PAD_R) * n)));
    const cross = svg.querySelector(".cross"), dot = svg.querySelector(".crossDot"), tip = box.querySelector(".chartTip");
    cross.setAttribute("x1", x(i)); cross.setAttribute("x2", x(i)); cross.setAttribute("visibility", "visible");
    dot.setAttribute("cx", x(i)); dot.setAttribute("cy", y(prices[i])); dot.setAttribute("visibility", "visible");
    const move = i > 0 ? (prices[i] / prices[i - 1] - 1) * 100 : 0;
    const ago = (n - i) * ETF_EVERY;
    tip.hidden = false;
    tip.innerHTML = `<b>${prices[i].toFixed(2)}</b> <span class="${move > 0 ? "up" : move < 0 ? "down" : ""}">${i > 0 ? (move > 0 ? "+" : "") + move.toFixed(1) + "%" : "start"}</span>
                     <span class="muted">· ${ago === 0 ? "now" : Math.floor(ago / 60) + "m " + (ago % 60) + "s ago"}</span>`;
    tip.style.left = (x(i) / CHART_W * rect.width + (rect.left - box.getBoundingClientRect().left)) + "px";
    tip.style.top = (y(prices[i]) / CHART_H * rect.height + (rect.top - box.getBoundingClientRect().top)) + "px";
  });
  box.addEventListener("mouseleave", () => {
    const svg = box.querySelector("svg");
    if (!svg) return;
    svg.querySelector(".cross").setAttribute("visibility", "hidden");
    svg.querySelector(".crossDot").setAttribute("visibility", "hidden");
    box.querySelector(".chartTip").hidden = true;
  });
}
chartHover("etfChart", () => inv.etfPrices);
chartHover("petfChart", () => inv.petfPrices);
chartHover("goldChart", () => inv.goldPrices);
drawChart("goldChart", inv.goldPrices);
drawChart("etfChart", inv.etfPrices);
drawChart("petfChart", inv.petfPrices);

// One market move: returns the % change
function etfRoll() {
  const r = Math.random();
  if (r < 0.10) return -0.04;
  if (r < 0.20) return 0.04;
  return Math.random() < 0.5 ? 0.015 : -0.01;
}

/* ----- Runs every second from the game loop. Returns rent paid (taxable). ----- */
// Investor XP: every minute with money invested (4 XP; 8 XP from 1 scoin; 16 XP from 100 scoin)
function investedTotal() { return ["re", "etf", "gold", "petf", "crypto"].reduce((a, k) => a + investCurrent(k), 0); }
function investXpPerMinute() {
  const v = investedTotal();
  return v >= 100 * SCOIN ? 16 : v >= SCOIN ? 8 : v >= 1000 ? 4 : 0;
}
function investTick() {
  inv.xpSec = (inv.xpSec || 0) + 1;
  if (inv.xpSec >= 60) { inv.xpSec = 0; const x = investXpPerMinute(); if (x) addInvestXp(x); }
  let rent = 0;
  let changed = false;

  // Real estate crash check
  if (inv.properties.length > 0 && Math.random() < RE_CRASH_CHANCE) {
    let lost = 0;
    inv.properties.forEach(p => { lost += p.value * RE_CRASH_LOSS; p.value *= 1 - RE_CRASH_LOSS; });
    investMessage("🏚️ REAL ESTATE CRASH! Your properties lost " + fmt(lost) + " (70%).", false, "re");
    state.stats.reCrash = true;
    showNotice("🏚️ Real estate crash! Properties lost 70% of their value.");
    changed = true;
  }

  inv.properties.forEach(p => {
    if (p.lock > 0) { p.lock--; if (p.lock === 0) changed = true; }
    p.rentIn--;
    if (p.rentIn <= 0) {
      const r = p.value * RE_RENT_RATE;
      rent += r;
      p.rentIn = RE_RENT_EVERY;
    }
  });
  if (rent > 0) { state.money += rent; investRecord("re", 0, rent); investMessage("🏠 Rent paid: +" + fmt(rent), true, "re"); }

  // ETF market move (the market always moves; your money follows it if invested)
  inv.etfTimer--;
  if (inv.etfTimer <= 0) {
    const move = etfRoll();
    inv.etf *= 1 + move;
    inv.etfHistory = [move, ...inv.etfHistory].slice(0, 15);
    inv.etfPrices = inv.etfPrices.concat(inv.etfPrices[inv.etfPrices.length - 1] * (1 + move)).slice(-CHART_POINTS - 1);
    inv.etfTimer = ETF_EVERY;
    drawChart("etfChart", inv.etfPrices);

    // Gold moves at the same time
    const g = goldRoll();
    inv.gold *= 1 + g;
    inv.goldHistory = [g, ...inv.goldHistory].slice(0, 15);
    inv.goldPrices = inv.goldPrices.concat(inv.goldPrices[inv.goldPrices.length - 1] * (1 + g)).slice(-CHART_POINTS - 1);
    drawChart("goldChart", inv.goldPrices);
  }

  if (inv.goldCooldown > 0) inv.goldCooldown--;

  // Broker ETF market move (runs once you own a Brokerage Firm)
  if (hasBroker()) {
    inv.petfTimer--;
    if (inv.petfTimer <= 0) {
      const move = petfRoll();
      inv.petf *= 1 + move;
      inv.petfHistory = [move, ...inv.petfHistory].slice(0, 15);
      inv.petfPrices = inv.petfPrices.concat(inv.petfPrices[inv.petfPrices.length - 1] * (1 + move)).slice(-CHART_POINTS - 1);
      inv.petfTimer = ETF_EVERY;
      drawChart("petfChart", inv.petfPrices);
    }
  }

  if (changed) renderProperties();
  updateInvestLive();
  return rent;
}

// Show "Invested" and "Profit / loss" (green when up, red when down)
function showPL(prefix, value, invested) {
  $(prefix + "Invested").textContent = fmt(invested);
  const el = $(prefix + "PL");
  if (invested <= 0) { el.textContent = "–"; el.className = "bigValue"; return; }
  const pl = value - invested;
  const p = pl / invested * 100;
  el.textContent = `${pl >= 0 ? "+" : "−"}${fmt(Math.abs(pl))} (${pl >= 0 ? "+" : "−"}${Math.abs(p).toFixed(1)}%)`;
  el.className = "bigValue " + (pl > 0 ? "up" : pl < 0 ? "down" : "");
}

// Update all the numbers on the investing page (no rebuilding, so buttons and inputs keep working)
/* ----- All-time profits per investment -----
   profit = everything you got back (sales, cash-outs after fees, rent) + what it is worth now - everything you put in */
function investCurrent(key) {
  if (key === "re") return inv.properties.reduce((a, p) => a + p.value, 0);
  if (key === "crypto") return cryptoReady ? cryptoTotal() : 0;
  return inv[key] || 0;
}
if (!inv.stats) {
  // start tracking now: what you already hold counts as money put in
  inv.stats = {};
  for (const k of ["re", "etf", "gold", "petf"]) inv.stats[k] = { in: investCurrent(k), out: 0 };
}
function investRecord(key, moneyIn, moneyOut) {
  inv.stats[key].in += moneyIn;
  inv.stats[key].out += moneyOut;
}
function updateInvestAllTime() {
  const parts = [["re", "🏠 Real estate"], ["etf", "📊 ETF"], ["gold", "🪙 Gold"], ["petf", "🏦 Broker ETF"], ["crypto", "📡 Crypto"]];
  let total = 0, html = "";
  for (const [k, label] of parts) {
    const st = inv.stats[k];
    if (!st) continue;
    if (k === "petf" && st.in === 0 && !hasBroker()) continue;   // hide until you have a Brokerage Firm
    if (k === "crypto" && st.in === 0) continue;                 // hide until your first crypto trade
    const profit = st.out + investCurrent(k) - st.in;
    total += profit;
    const cls = profit > 0.5 ? "up" : profit < -0.5 ? "down" : "";
    html += `<span>${label}: <b class="${cls}">${profit > 0.5 ? "+" : profit < -0.5 ? "−" : ""}${fmt(Math.abs(profit))}</b></span>`;
  }
  const tcls = total > 0.5 ? "up" : total < -0.5 ? "down" : "";
  $("investAllTime").innerHTML = `<span class="total">📊 All-time profits: <b class="${tcls}">${total > 0.5 ? "+" : total < -0.5 ? "−" : ""}${fmt(Math.abs(total))}</b></span>` + html;
}

function updateInvestLive() {
  updateInvestAllTime();
  const reTotal = inv.properties.reduce((a, p) => a + p.value, 0);
  $("reTotal").textContent = fmt(reTotal);
  $("etfTotal").textContent = fmt(inv.etf + inv.petf);

  // Broker ETF
  const broker = hasBroker();
  $("petfLocked").hidden = broker;
  $("petfBody").hidden = !broker;
  $("petfValue").textContent = fmt(inv.petf);
  showPL("petf", inv.petf, inv.petfInvested);

  // Gold
  $("goldTotal").textContent = fmt(inv.gold);
  const cool = inv.goldCooldown > 0;
  $("goldSell").disabled = cool;
  $("goldSellAll").disabled = cool;
  $("goldCooldown").textContent = cool ? "⏳ Next gold sale in " + clock(inv.goldCooldown) : "";
  $("goldValue").textContent = fmt(inv.gold);
  showPL("gold", inv.gold, inv.goldInvested);
  const gl = inv.goldHistory[0];
  $("goldLast").textContent = gl === undefined ? "–" : (gl > 0 ? "+" : "−") + (Math.abs(gl) * 100).toFixed(2) + "%";
  $("goldLast").className = "bigValue " + (gl > 0 ? "up" : gl < 0 ? "down" : "");
  $("petfTimer").textContent = inv.petfTimer + "s";
  $("petfBuyRow").hidden = inv.petf > 0;
  $("petfSellRow").hidden = inv.petf <= 0;
  const pl = inv.petfHistory[0];
  $("petfLast").textContent = pl === undefined ? "–" : (pl > 0 ? "+" : "") + Math.round(pl * 100) + "%";
  $("petfLast").className = "bigValue " + (pl > 0 ? "up" : pl < 0 ? "down" : "");
  $("petfHistory").innerHTML = inv.petfHistory.map(m =>
    `<span class="${m > 0 ? "up" : "down"}">${m > 0 ? "+" : ""}${Math.round(m * 100)}%</span>`).join("");
  $("investMoney").textContent = fmt(state.money);
  $("etfValue").textContent = fmt(inv.etf);
  showPL("etf", inv.etf, inv.etfInvested);
  const afterFee = inv.etf * (1 - etfFee()) - inv.etfInvested;
  $("etfPLFee").textContent = inv.etf > 0 ? `after ${pct(etfFee())} cash-out fee: ${afterFee >= 0 ? "+" : "−"}${fmt(Math.abs(afterFee))}` : "";
  $("etfTimer").textContent = inv.etfTimer + "s";

  const last = inv.etfHistory[0];
  $("etfLast").textContent = last === undefined ? "–" : (last > 0 ? "+" : "") + (last * 100) + "%";
  $("etfLast").className = "bigValue " + (last > 0 ? "up" : last < 0 ? "down" : "");
  $("etfHistory").innerHTML = inv.etfHistory.map(m =>
    `<span class="${m > 0 ? "up" : "down"}">${m > 0 ? "+" : ""}${m * 100}%</span>`).join("");

  const sell = Math.min(readAmount("etfSellAmount"), inv.etf);
  $("etfSellPreview").textContent = sell > 0 ? `You get ${fmt(sell * (1 - etfFee()))} after the ${pct(etfFee())} fee` : "";

  const sum = $("re-summary");
  if (sum && inv.properties.length) sum.innerHTML = reSummary();
  inv.properties.forEach(p => {
    const v = $("re-value-" + p.id), r = $("re-rent-" + p.id), b = $("re-sell-" + p.id);
    if (v) v.textContent = fmt(p.value);
    if (r) r.textContent = clock(p.rentIn);
    if (b) { b.disabled = p.lock > 0; b.textContent = p.lock > 0 ? "🔒 " + clock(p.lock) : "Sell"; }
  });
}
