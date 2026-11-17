/* =====================================================================
   LOGISTICS: tankers and semi-trucks share one "fleet" system.
   A free vehicle gets 4 contract offers (different routes, random time in the route's range).
   Pick one, it travels, and the whole contract is paid on arrival.
   Contract profit = route rate (bcoin per second) x transit time x random 0.95-1.05.
   Tankers: 75 scoin, 10 slots, pay back in about 3 hours.
   Trucks: 150,000, 15 slots, pay back in about 1.5 hours.
   ===================================================================== */
const FLEETS = {
  tanker: {
    label: "Tanker", icon: "🚢", pic: "tanker", box: "tankers", countEl: "logiCount", price: 75000000, slots: 10, road: false,
    names: ["Aurora", "Coral", "Neptune", "Atlas", "Borealis", "Odyssey", "Titan", "Meridian", "Horizon", "Nautilus"],
    emptyText: "Aframax crude oil tanker",
    routes: [
      { from: "Sullom Voe 🇬🇧", to: "Rotterdam 🇳🇱",        min: 15, max: 20, rate: 6500 },
      { from: "Ceyhan 🇹🇷",     to: "Augusta / Trieste 🇮🇹", min: 15, max: 25, rate: 6700 },
      { from: "Arzew 🇩🇿",      to: "Fos-sur-Mer 🇫🇷",      min: 10, max: 15, rate: 6000 },
      { from: "Cayo Arcas 🇲🇽", to: "Houston 🇺🇸",          min: 10, max: 20, rate: 6200 },
      { from: "Houston 🇺🇸",    to: "Rotterdam 🇳🇱",        min: 75, max: 85, rate: 9000, long: true },
      { from: "Kikeh 🇲🇾",      to: "Singapore 🇸🇬",        min: 10, max: 20, rate: 6200 },
      { from: "Kozmino 🇷🇺",    to: "Ulsan 🇰🇷",            min: 10, max: 15, rate: 6000 },
      { from: "Primorsk 🇷🇺",   to: "Wilhelmshaven 🇩🇪",    min: 25, max: 35, rate: 7200 },
      { from: "Mina Al Fahal 🇴🇲", to: "Melaka 🇲🇾",       min: 55, max: 65, rate: 8500, long: true },
    ],
  },
  plane: {
    label: "Plane", icon: "✈️", pic: "plane", box: "planes", countEl: "planeCount", price: 250000000, slots: 5, sky: true,
    names: ["Falcon", "Condor", "Albatross", "Pelican", "Osprey"],
    emptyText: "Wide-body cargo plane",
    unlock: { tankers: 3 },
    // rate = 30,000 + 1,000 x average minutes  →  about 34,600 / sec on average (≈125 scoin / hour)
    routes: [
      { from: "Hong Kong 🇭🇰",  to: "Anchorage 🇺🇸",  min: 6, max: 7, rate: 36500 },
      { from: "Leipzig 🇩🇪",    to: "Dubai 🇦🇪",      min: 4, max: 5, rate: 34500 },
      { from: "Memphis 🇺🇸",    to: "Louisville 🇺🇸", min: 2, max: 3, rate: 32500 },
      { from: "Liège 🇧🇪",      to: "Istanbul 🇹🇷",   min: 3, max: 4, rate: 33500 },
      { from: "Shanghai 🇨🇳",   to: "Incheon 🇰🇷",    min: 2, max: 3, rate: 32500 },
      { from: "Doha 🇶🇦",       to: "Frankfurt 🇩🇪",  min: 5, max: 6, rate: 35500 },
      { from: "Singapore 🇸🇬",  to: "Tokyo 🇯🇵",      min: 5, max: 6, rate: 35500 },
      { from: "Miami 🇺🇸",      to: "Bogotá 🇨🇴",     min: 3, max: 4, rate: 33500 },
      { from: "Anchorage 🇺🇸",  to: "Chicago 🇺🇸",    min: 4, max: 5, rate: 34500 },
      { from: "Amsterdam 🇳🇱",  to: "New York 🇺🇸",   min: 7, max: 8, rate: 37500, long: true },
    ],
  },
  truck: {
    label: "Truck", icon: "🚛", pic: "truck", box: "trucks", countEl: "truckCount", price: 150000, slots: 15, road: true,
    names: Array.from({ length: 15 }, (_, i) => "Truck " + (i + 1)),
    emptyText: "Semi-truck",
    // rate = 22 + 0.5 x average minutes, so longer routes pay a little more per second
    routes: [
      // one road route on every continent; same trip lengths and pay as before
      { from: "Chicago 🇺🇸",      to: "New York 🇺🇸",     min: 12, max: 13, rate: 28.3 },
      { from: "Sydney 🇦🇺",       to: "Melbourne 🇦🇺",    min: 10, max: 11, rate: 27.3 },
      { from: "Madrid 🇪🇸",       to: "Milan 🇮🇹",        min: 15, max: 17, rate: 30 },
      { from: "Bangkok 🇹🇭",      to: "Kuala Lumpur 🇲🇾", min: 18, max: 20, rate: 31.5 },
      { from: "Los Angeles 🇺🇸",  to: "Denver 🇺🇸",       min: 18, max: 20, rate: 31.5 },
      { from: "Beijing 🇨🇳",      to: "Shanghai 🇨🇳",     min: 12, max: 13, rate: 28.3 },
      { from: "Toronto 🇨🇦",      to: "Montreal 🇨🇦",     min: 6,  max: 7,  rate: 25.3 },
      { from: "Johannesburg 🇿🇦", to: "Cape Town 🇿🇦",    min: 13, max: 15, rate: 29 },
      { from: "São Paulo 🇧🇷",    to: "Buenos Aires 🇦🇷", min: 20, max: 22, rate: 32.5 },
      { from: "Delhi 🇮🇳",        to: "Mumbai 🇮🇳",       min: 12, max: 13, rate: 28.3 },
    ],
  },
};
// 🎨 painted logistics icons (assets/icons/ico-lg-*.webp); F.icon (emoji) stays for plain-text notices
const lgIco = (n, cls = "") => ico("lg-" + n, cls);
const fIco = (key, cls = "") => lgIco(FLEETS[key].pic, cls);
if (!state.logistics) state.logistics = { tankers: [], earned: 0 };
const logi = state.logistics;
if (!logi.trucks) logi.trucks = [];
if (!logi.planes) logi.planes = [];
const fleetList = (key) => key === "tanker" ? logi.tankers : key === "plane" ? logi.planes : logi.trucks;
const fleetUnlocked = (key) => !FLEETS[key].unlock || (logi.tankers.length >= FLEETS[key].unlock.tankers);

// ⚡ Express (planes only): 40% chance that one of the 4 offers is express:
// 40% shorter, 25% more per second, and it disappears after 30 seconds.
const EXPRESS_CHANCE = 40, EXPRESS_SECONDS = 30, EXPRESS_TIME = 0.6, EXPRESS_RATE = 1.25;
function makeExpress(o) {
  const seconds = Math.max(60, Math.round(o.seconds * EXPRESS_TIME));
  return { ...o, seconds, profit: Math.round(o.profit / o.seconds * EXPRESS_RATE * seconds), express: EXPRESS_SECONDS };
}
function planeOffers() {
  const offers = makeContracts("plane");
  if (secureRandomInt(100) < EXPRESS_CHANCE) { const k = secureRandomInt(4); offers[k] = makeExpress(offers[k]); }
  return offers;
}
const newOffers = (key) => key === "plane" ? planeOffers() : makeContracts(key);

// Truck breakdowns
const TRUCK_BREAKDOWN_CHANCE = 100, TRUCK_REPAIR_MIN = 500, TRUCK_REPAIR_MAX = 5000;

// Logistics agent (one switch for trucks, one for tankers): picks a random contract after 5 s for a 2% fee
// Agent rules; the 🏬 Logistics Center can make them cheaper (1%), smarter (best contract) and faster (3 s)
const agentDelay = () => centerHas("fast") ? 3 : 5;
const agentFee = () => centerHas("fee") ? 0.01 : 0.02;
if (logi.truckAgent === undefined) logi.truckAgent = false;
if (logi.tankerAgent === undefined) logi.tankerAgent = false;
/* ----- 🚚 LOGISTICS LEVEL: XP when a contract is delivered = contract minutes × fleet rate.
   Trucks 1 XP/min, tankers 3 XP/min, cargo planes 6 XP/min.
   Unlocks the Logistics agents: trucks at level 5, tankers at 25, planes at 50. ----- */
const LOGI_XP_RATE = { truck: 1, tanker: 3, plane: 6 };
const AGENT_LEVEL = { truck: 5, tanker: 25, plane: 50 };
// older saves: about 10 XP for every contract already delivered
if (typeof state.logiXp !== "number") state.logiXp = (logi.contracts || 0) * 10;
const logiLevel = () => levelInfo(state.logiXp, LOGI_XP).level;
const agentUnlocked = (key) => logiLevel() >= AGENT_LEVEL[key];
function addLogiXp(key, seconds) {
  const before = logiLevel();
  state.logiXp += Math.max(1, Math.round(seconds / 60 * LOGI_XP_RATE[key]));
  const after = logiLevel();
  updateLogiLevel();
  if (after > before) {
    const box = $("logiLevel");
    box.classList.remove("levelUp"); void box.offsetWidth; box.classList.add("levelUp");
    const unlocked = Object.keys(AGENT_LEVEL).filter(k => AGENT_LEVEL[k] > before && AGENT_LEVEL[k] <= after);
    showAlert(`🚚 Logistics level ${after}!`,
      unlocked.length ? `Unlocked: 🤖 Logistics agent for ${unlocked.map(k => FLEETS[k].label.toLowerCase() + "s").join(", ")}.` : "Keep delivering to unlock more.", "good");
    updateAgentButton();
  }
}
function updateLogiLevel() {
  const info = levelInfo(state.logiXp, LOGI_XP);
  $("logiLevelNum").textContent = info.level;
  $("logiLevelText").textContent = info.level + (info.max ? " (MAX)" : "");
  $("logiXpFill").style.width = info.max ? "100%" : (100 * info.into / info.need) + "%";
  $("logiXpText").textContent = info.max ? "Max level reached!"
    : fmtNum(info.into) + " / " + fmtNum(info.need) + " XP to level " + (info.level + 1);
  const next = Object.keys(AGENT_LEVEL).find(k => info.level < AGENT_LEVEL[k]);
  $("logiPerkText").innerHTML = (next ? `${lgIco("agent")}${FLEETS[next].label} agent unlocks at level ${AGENT_LEVEL[next]}` : `${lgIco("agent")}All agents unlocked`);
}
const agentOn = (key) => !!logi[key + "Agent"] && agentUnlocked(key);
function agentTick(key) {
  if (!agentOn(key)) return false;
  let picked = false;
  for (const v of fleetList(key)) {
    if (v.contract || !v.offers) continue;
    v.wait = (v.wait || 0) + 1;
    if (v.wait < agentDelay()) {
      const el = $("agent-" + v.id);
      if (el) el.innerHTML = `${lgIco("agent")}Agent picks a contract in ${agentDelay() - v.wait}s`;
      continue;
    }
    // random contract, or (Smart agents) the one that pays the most per second
    const o = centerHas("best")
      ? v.offers.reduce((best, x) => (x.profit / x.seconds > best.profit / best.seconds ? x : best))
      : v.offers[secureRandomInt(v.offers.length)];
    const fee = Math.round(contractPayout(key, o.profit) * agentFee());
    if (state.money < fee) {
      const el = $("agent-" + v.id);
      if (el) el.innerHTML = `${lgIco("agent")}Agent is waiting: needs ${fmt(fee)} for the fee`;
      continue;
    }
    state.money -= fee;
    v.contract = { route: o.route, seconds: o.seconds, profit: o.profit, left: o.seconds };
    v.offers = null; v.wait = 0;
    const r = FLEETS[key].routes[o.route];
    showNotice(`🤖 Agent sent ${v.name} to ${r.to.replace(/ \S+$/, "")} (fee ${fmt(fee)})`);
    picked = true;
  }
  return picked;
}
function updateAgentButton() {
  for (const key of ["truck", "tanker", "plane"]) {
    const b = $(key + "Agent");
    const open = agentUnlocked(key);
    b.disabled = !open;
    b.innerHTML = open ? `${lgIco("agent")}Logistics agent: ` + (agentOn(key) ? "ON" : "OFF") : `${ico("lock", "lockS")}Agent: Logistics level ${AGENT_LEVEL[key]}`;
    b.classList.toggle("on", agentOn(key));
  }
}
for (const key of ["truck", "tanker", "plane"]) {
  $(key + "Agent").addEventListener("click", () => {
    if (!agentUnlocked(key)) return;
    logi[key + "Agent"] = !agentOn(key);
    fleetList(key).forEach(v => { v.wait = 0; });   // everyone waiting gets a fresh 5 seconds
    updateAgentButton(); renderFleet(key); save();
  });
}

// 4 different routes with random transit times and profits
function makeContracts(key = "tanker") {
  const routes = FLEETS[key].routes;
  const idx = routes.map((_, i) => i);
  for (let i = idx.length - 1; i > 0; i--) { const j = secureRandomInt(i + 1); [idx[i], idx[j]] = [idx[j], idx[i]]; }
  return idx.slice(0, 4).map(r => {
    const route = routes[r];
    const seconds = (route.min * 60) + secureRandomInt((route.max - route.min) * 60 + 1);   // random time in the range
    const profit = Math.round(route.rate * seconds * (0.95 + secureRandomInt(101) / 1000));    // ±5%
    // ⭐ Global Empire picked twice: every contract takes half the time for the same pay
    let secs = state.legacy.empire >= 2 ? Math.round(seconds / 2) : seconds;
    if (key === "tanker" && state.science && state.science.satellite) secs = Math.round(secs * SAT_TANKER_SPEED);   // 🛰️ 10% faster, same pay
    return { route: r, seconds: secs, profit };
  });
}
const ROUTES = FLEETS.tanker.routes;   // (kept for older code and tests)

const clockLong = (sec) => sec >= 3600
  ? Math.floor(sec / 3600) + "h " + String(Math.floor((sec % 3600) / 60)).padStart(2, "0") + "m"
  : Math.floor(sec / 60) + ":" + String(sec % 60).padStart(2, "0");

// Runs every second: moves every vehicle, pays arrivals. Returns money paid this second.
function logisticsTick() {
  let paid = 0;
  for (const key in FLEETS) {
    const F = FLEETS[key];
    let arrived = false;
    for (const v of fleetList(key)) {
      if (!v.contract) continue;
      v.contract.left--;
      if (v.contract.left <= 0) {
        const pay = contractPayout(key, v.contract.profit);   // trucks get the warehouse bonus
        paid += pay;
        logi.earned += pay;
        logi.contracts = (logi.contracts || 0) + 1;
        addLogiXp(key, v.contract.seconds);
        const r = F.routes[v.contract.route];
        showNotice(`${F.icon} ${v.name} arrived in ${r.to.replace(/ \S+$/, "")}: +${fmt(pay)}!`);
        v.city = cityName(r.to);   // parked here on the world map
        v.contract = null;
        v.wait = 0;
        arrived = true;
        // Trucks: 1 in 100 chance to break down after a delivery. Repair costs 500 – 5,000.
        if (key === "truck" && secureRandomInt(TRUCK_BREAKDOWN_CHANCE) === 0) {
          v.broken = { cost: TRUCK_REPAIR_MIN + secureRandomInt(TRUCK_REPAIR_MAX - TRUCK_REPAIR_MIN + 1) };
          v.offers = null;
          if (typeof refreshUnlocks === "function") refreshUnlocks(false);
          if (state.science && state.science.satellite) showNotice(`🔧 ${v.name} broke down. 🛰️ The satellite will repair it in 5 seconds.`);
          else showAlert(`🔧 ${v.name} broke down!`, `It needs repairs before it can take new contracts. Repair cost: <b style="display:inline">${fmt(v.broken.cost)}</b> (🚢 Logistics).`);
        } else {
          v.offers = newOffers(key);
        }
      } else {
        updateVehicleLive(v);
      }
    }
    if (key === "plane") {
      for (const v of fleetList(key)) {
        if (v.contract || !v.offers) continue;
        v.offers.forEach((o, k) => {
          if (!o.express) return;
          o.express--;
          if (o.express <= 0) {   // express offer expired: replace it with a normal one on a different route
            const used = v.offers.map(x => x.route);
            const fresh = makeContracts("plane").find(x => !used.includes(x.route)) || makeContracts("plane")[0];
            v.offers[k] = fresh; arrived = true;
          } else {
            const el = $(`exp-${v.id}-${k}`);
            if (el) el.textContent = `EXPRESS · ${o.express}s left`;
          }
        });
      }
    }
    if (agentTick(key)) { arrived = true; updateCounter(); }
    if (arrived) renderFleet(key);
  }
  if (paid > 0) state.money += paid;
  $("logiEarned").textContent = fmt(logi.earned);
  $("logiContracts").textContent = (logi.contracts || 0).toLocaleString();
  // repair buttons light up as soon as you can afford them
  document.querySelectorAll("[data-repair]").forEach(b => {
    const v = logi.trucks.find(x => x.id === Number(b.dataset.repair));
    if (v && v.broken) b.disabled = state.money < v.broken.cost;
  });
  return paid;
}

function updateVehicleLive(v) {
  const c = v.contract;
  const done = 1 - c.left / c.seconds;
  const ship = $("ship-" + v.id), wake = $("wake-" + v.id), left = $("left-" + v.id);
  if (ship) ship.style.left = (6 + done * 88) + "%";
  if (wake) wake.style.width = (6 + done * 88) + "%";
  if (left) left.textContent = clockLong(c.left) + " left";
}

function renderFleet(key) {
  const F = FLEETS[key], list = fleetList(key);
  $(F.countEl).textContent = list.length + " / " + F.slots;
  $("logiEarned").textContent = fmt(logi.earned);
  $("logiContracts").textContent = (logi.contracts || 0).toLocaleString();
  let html = `<div class="tankerGrid">`;
  list.forEach(v => {
    if (v.contract) {
      const r = F.routes[v.contract.route], c = v.contract;
      const done = 1 - c.left / c.seconds;
      html += `<div class="tanker sailing">
        <div class="row"><b>${fIco(key)}${v.name}</b><span class="income">+${fmt(contractPayout(key, c.profit))} on arrival</span></div>
        <div class="muted">${r.from} → ${r.to}</div>
        <div class="sea ${F.road ? "road" : F.sky ? "sky" : ""}"><div class="wake" id="wake-${v.id}" style="width:${6 + done * 88}%"></div>
          <span class="port" style="left:6px">${lgIco(F.road ? "depot" : F.sky ? "airport" : "port", "lgPort")}</span><span class="port" style="right:6px">${lgIco("finish", "lgPort")}</span>
          <span class="ship lgShip" id="ship-${v.id}" style="left:${6 + done * 88}%">${fIco(key, "lgVeh")}</span></div>
        <div class="row muted"><span>Transit ${clockLong(c.seconds)}</span><span id="left-${v.id}">${clockLong(c.left)} left</span></div>
      </div>`;
    } else if (v.broken) {
      html += `<div class="tanker broken">
        <div class="row"><b>${fIco(key)}${v.name}</b><span style="color:#ff8a8a; font-weight:800">BROKEN DOWN</span></div>
        <div class="brokeIcon">${lgIco("broken", "lgBroke")}</div>
        <div class="muted" style="text-align:center">This truck needs repairs before it can take new contracts.</div>
        <div style="text-align:center; margin-top:10px">
          <button class="btn" data-repair="${v.id}" ${state.money < v.broken.cost ? "disabled" : ""}>${lgIco("repair")}Repair for ${fmt(v.broken.cost)}</button></div>
      </div>`;
    } else {
      html += `<div class="tanker">
        <div class="row"><b>${fIco(key)}${v.name}</b><span class="muted">${F.road ? "at the depot" : F.sky ? "at the airport" : "in port"} · choose a contract</span></div>
        <div class="offers">${v.offers.map((o, k) => {
          const r = F.routes[o.route];
          return `<button class="offer ${o.express ? "express" : ""}" data-fleet="${key}" data-vehicle="${v.id}" data-offer="${k}">
            ${o.express ? `<span class="exp">${lgIco("express")}<span id="exp-${v.id}-${k}">EXPRESS · ${o.express}s left</span></span>` : ""}
            <b class="route">${r.from} → ${r.to}</b>
            ${lgIco("profit")}Total profit: <b>${fmt(contractPayout(key, o.profit))}</b>${contractBonus(key) ? ` <span class="long">+${+(contractBonus(key) * 100).toFixed(1)}%</span>` : ""}<br>
            ${lgIco("time")}Transit time: <b>${clockLong(o.seconds)}</b><br>
            <span class="muted">≈ ${fmt(o.profit / o.seconds)} / sec</span>${r.long ? ` <span class="long">LONG HAUL</span>` : ""}
          </button>`;
        }).join("")}</div>
        ${agentOn(key) ? `<div class="agentNote" id="agent-${v.id}">${lgIco("agent")}Agent picks a contract in ${Math.max(0, agentDelay() - (v.wait || 0))}s</div>` : ""}
      </div>`;
    }
  });
  if (list.length < F.slots && !fleetUnlocked(key)) {
    html += `<div class="tanker emptySlot" style="opacity:0.7">
      <div>${ico("lock", "lockS")}${fIco(key, "lgSlot")}</div>
      <b>Locked</b><div class="muted" style="margin:4px 0 10px">Unlocks when you own ${F.unlock.tankers} oil tankers (you have ${logi.tankers.length})</div>
      <span class="muted">${coins(F.price)} each</span>
    </div>`;
  } else if (list.length < F.slots) {
    html += `<div class="tanker emptySlot">
      <div>${fIco(key, "lgSlot")}</div>
      <b>Empty slot</b><div class="muted" style="margin:4px 0 10px">${F.emptyText}</div>
      <button class="btn" data-buy-fleet="${key}" data-cost="${F.price}" ${state.money < F.price ? "disabled" : ""}>Buy for ${coins(F.price)}</button>
    </div>`;
  }
  $(F.box).innerHTML = html + `</div>`;
}
function renderTankers() { renderFleet("tanker"); renderFleet("truck"); renderFleet("plane"); }

function fleetClick(e) {
  if (isPaused()) return;
  const buy = e.target.closest("[data-buy-fleet]");
  if (buy) {
    const key = buy.dataset.buyFleet, F = FLEETS[key], list = fleetList(key);
    if (list.length >= F.slots || state.money < F.price || !fleetUnlocked(key)) return;
    state.money -= F.price;
    const v = { id: state.nextId++, name: F.names[list.length % F.names.length], contract: null, offers: newOffers(key), wait: 0 };
    list.push(v);
    showNotice(`${F.icon} Bought ${v.name}! Choose its first contract.`);
    updateCounter(); renderFleet(key); if (key === "tanker") renderFleet("plane"); render(); save();
    return;
  }
  const repair = e.target.closest("[data-repair]");
  if (repair) {
    const v = logi.trucks.find(x => x.id === Number(repair.dataset.repair));
    if (!v || !v.broken || state.money < v.broken.cost) return;
    state.money -= v.broken.cost;
    showNotice(`🔧 ${v.name} repaired for ${fmt(v.broken.cost)}. It's ready for contracts.`);
    v.broken = null;
    v.offers = makeContracts("truck");
    v.wait = 0;
    updateCounter(); renderFleet("truck"); save(); refreshUnlocks(false);
    return;
  }
  const offer = e.target.closest("[data-offer]");
  if (offer) {
    const key = offer.dataset.fleet;
    const v = fleetList(key).find(x => x.id === Number(offer.dataset.vehicle));
    if (!v || v.contract) return;
    const o = v.offers[Number(offer.dataset.offer)];
    v.contract = { route: o.route, seconds: o.seconds, profit: o.profit, left: o.seconds };
    v.offers = null; v.wait = 0;
    renderFleet(key); save();
  }
}
$("tankers").addEventListener("click", fleetClick);
$("trucks").addEventListener("click", fleetClick);
$("planes").addEventListener("click", fleetClick);
