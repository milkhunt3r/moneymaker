/* Empire of Coins © 2026 milkhunt3r. All rights reserved. */
/* =====================================================================
   ⭐ PRESTIGE: at 1 / 5 / 10 / 20 gcoin in your main money (1st / 2nd / 3rd / 4th prestige) you can reset the game for a Legacy bonus.
   Every prestige gives a 10-minute tax holiday afterwards (no tax inspections), whatever bonus is chosen.
   Always kept: achievements, Gambler & Investor levels, cosmetics, statistics, Legacy, VIP coins.
   Choices: 4 prestiges, 4 picks in all, so every player ends with every bonus, in the order they choose:
     tycoon  (once)  +25% income (businesses, special businesses, clicks); keeps your Science buildings (not the satellite) on this and every later reset
     empire  (max 2) 1st: keep your trucks, tankers, cargo planes, warehouses, Trading Port and Logistics Center on every reset from now on (not the satellite)
                     2nd: all logistics contracts take half the time (same pay)
     vip     (once)  VIP coins: a 500 scoin chip every 10 min for the Super high roller tables, and every other free chip comes twice as fast
   ===================================================================== */
const PRESTIGE_STEPS = [1e12, 5e12, 10e12, 20e12];   // money needed for the 1st, 2nd, 3rd and 4th prestige (1 / 5 / 10 / 20 gcoin)
const PRESTIGE_MAX = PRESTIGE_STEPS.length;            // the 4th prestige finishes the game (you can keep playing)
const prestigeAt = () => PRESTIGE_STEPS[Math.min(state.legacy.count, PRESTIGE_MAX - 1)];
const canPrestige = () => state.legacy.count < PRESTIGE_MAX && state.money >= prestigeAt();
const TAX_HOLIDAY = 600;     // seconds without tax inspections after every prestige
const TYCOON_BONUS = 0.25;
if (!state.legacy) state.legacy = { count: 0, tycoon: 0, empire: 0, vip: 0, history: [] };
function legacyIncomeMult() { return (1 + TYCOON_BONUS * ((state.legacy && state.legacy.tycoon) || 0)) * (1 + alienBonus("income")); }   // 🧐 Aurumites alliance bonus too

const PRESTIGE_CHOICES = [
  { id: "tycoon", icon: "💼", name: "Tycoon's Legacy", max: 1, text: "+25% income from businesses, special businesses and clicks, forever. From this reset on, every reset keeps your 🔬 Science buildings (not the satellite).",
    now: () => `Income +${(state.legacy.tycoon + 1) * 25}% for good` },
  { id: "empire", icon: "🚢", name: "Global Empire", max: 2,
    text: () => state.legacy.empire
      ? "Level 2: every logistics contract takes half the time, for the same pay."
      : "Keep all your trucks, oil tankers and cargo planes, plus warehouses, Trading Port and Logistics Center, on this and every future reset (not the 🛰️ satellite).",
    now: () => { const n = (x, w) => `${x} ${w}${x === 1 ? "" : "s"}`; return state.legacy.empire ? "Your fleet is already kept on every reset" : `You'd keep ${n(logi.trucks.length, "truck")}, ${n(logi.tankers.length, "tanker")}, ${n(logi.planes.length, "plane")}`; } },
  { id: "vip", icon: "🎟️", name: "VIP Coins", max: 1,
    text: "A free 500 scoin bet chip every 10 minutes for the Super high roller tables, and all your other free bet chips come twice as fast. You can hold up to 200 chips of 500 scoin instead of 100. What they win goes to your casino chips. Your free bet chips are also kept on this and every future reset (without VIP Coins they go back to 0).",
    now: () => `Free chips: every ${fmtMin(freeChipBase())} min → every ${fmtMin(freeChipBase() / 2)} min` },
];

function showPrestigeOffer() {
  const n = state.legacy.count + 1;
  showModal(`<h2>⭐ You made it: ${fmt(prestigeAt())}!</h2>
    <p>You can <b>prestige</b>: start the game over and choose a permanent Legacy bonus.</p>
    <p><b style="color:#ffd34d">Prestige ${n} of ${PRESTIGE_MAX}</b>${n === PRESTIGE_MAX ? " · this is the final one: it finishes the game" : ""}</p>
    <p class="muted">Always kept: achievements, levels, cosmetics, statistics and your 🖼️ Art Gallery (unlock, slots and paintings)${state.legacy.count ? ` · Prestiges so far: ${state.legacy.count}` : ""}.
      After every prestige: 🛡️ no tax inspections for the first 10 minutes.</p>
    <div class="prestigeChoices">${PRESTIGE_CHOICES.map(c => {
      const maxed = c.max && state.legacy[c.id] >= c.max;
      const level = c.max ? ` <span class="muted">(${state.legacy[c.id] || 0}/${c.max})</span>` : "";
      const text = typeof c.text === "function" ? c.text() : c.text;
      return maxed
        ? `<button class="prestigeChoice" disabled style="opacity:0.45; cursor:default">
            <div class="big">${c.icon}</div><b>${c.name}${level}</b>${c.max === 1 ? "✅ Already picked: you have this bonus for good." : "✅ Fully upgraded: you can't pick this again."}</button>`
        : `<button class="prestigeChoice" data-prestige-pick="${c.id}">
            <div class="big">${c.icon}</div><b>${c.name}${level}</b>${text}<small>${c.now()}</small></button>`;
    }).join("")}</div>
    <button class="btn ghost" data-prestige="later">Not yet</button>`);
  $("modalBox").classList.add("gold");
}

function showPrestigeConfirm(id) {
  const c = PRESTIGE_CHOICES.find(x => x.id === id);
  let lost = id === "empire" || state.legacy.empire > 0
    ? "your money, businesses, workers, other special businesses and investments"
    : "your money, businesses, workers, special businesses, investments and logistics fleet";
  lost += id === "tycoon" || state.legacy.tycoon > 0 ? " (your 🔬 Science buildings are kept, the 🛰️ satellite is not)" : " and 🔬 Science";
  showModal(`<h2>${c.icon} ${c.name}</h2>
    <p>Are you sure? This <b>resets</b> ${lost}.</p>
    <p class="muted">Kept: achievements, levels, cosmetics, statistics, Legacy bonuses, free bet chips, Art Gallery unlock, slots and paintings.
      🛡️ No tax inspections for the first 10 minutes after the reset.</p>
    <p>This can't be undone.</p>
    ${state.legacy.count + 1 === PRESTIGE_MAX ? `<p style="color:#ffd34d"><b>This is your final prestige.</b> After it, no more resets are possible, but you can keep playing.</p>` : ""}
    <button class="btn big" data-prestige="confirm" data-choice="${id}">⭐ Prestige now</button>
    <button class="btn ghost" data-prestige="back">Back</button>`);
  $("modalBox").classList.add("gold");
}

function doPrestige(id) {
  if (!canPrestige()) return;
  const choice = PRESTIGE_CHOICES.find(c => c.id === id);
  if (!choice || (choice.max && state.legacy[id] >= choice.max)) return;
  const L = state.legacy;
  L.count++; L[id] = (L[id] || 0) + 1;
  L.history.push({ choice: id, at: Date.now() });
  const keep = {
    achievements: state.achievements, stats: state.stats, casinoXp: state.casinoXp, casinoStats: state.casinoStats,
    cosmetics: state.cosmetics, legacy: L, vip: state.vip, nextId: state.nextId, xpVersion: state.xpVersion, logiXp: state.logiXp, freeTimers: state.freeTimers,
    freeChips: L.vip > 0 ? state.freeChips : {},   // 🎁 free bet chips go back to 0 on a reset, unless 🎟️ VIP Coins was picked (this reset or before)
    vpPayHidden: state.vpPayHidden, uthPayHidden: state.uthPayHidden, view: "income",
    tips: state.tips,   // 💡 tips already seen and the guided start stay done
    profShowcase: state.profShowcase, profHideMoney: state.profHideMoney,   // 👤 profile showcase and "hide my money"
    // ⛏️ Gold Mine Dig: records, upgrades and the 🏦 vault stay (unsold ore from the last run goes into the vault; a run in progress is dropped)
    mine: state.mine ? { energy: state.mine.energy, regenAt: state.mine.regenAt, runs: state.mine.runs, best: state.mine.best, earned: state.mine.earned, ores: state.mine.ores,
      up: state.mine.up, rescued: state.mine.rescued, fullBag: state.mine.fullBag, closeCall: state.mine.closeCall,
      lifts: state.mine.lifts, liftsUsed: state.mine.liftsUsed, chests: state.mine.chests, jackpots: state.mine.jackpots, vault: (state.mine.pending ? state.mine.pending.bag : []).reduce((v, k) => (v[k] = (v[k] || 0) + 1, v), { ...(state.mine.vault || {}) }) } : undefined,
    genetics: state.genetics,   // 🧬 Gene Splicer: everything stays (species, DNA, hints)
    shooter: state.shooter,     // 🚀 Nebula Strike: levels, ships, upgrades and stardust stay
    pet: state.pet,             // 🐾 the pet from the pirate loot box stays
    pip: state.pip,             // 🐾 Pip the painter stays too
    digy: state.digy,           // 🤖 Digy the mining robot stays too
    taxHoliday: TAX_HOLIDAY,   // 🛡️ no tax inspections for the first 10 minutes
    recruitPlan: state.recruitPlan,   // 🧑‍💼 the Recruitment Agency's staffing plan (the building itself resets)
    // 🖼️ Art Gallery: stays unlocked and keeps its bought slots and all kept paintings
    art: state.art ? { unlocked: !!state.art.unlocked, slots: state.art.slots, slotBuys: state.art.slotBuys || 0, items: state.art.items || [], done: state.art.done, tier: state.art.tier || "medium", seed: 0, page: "studio", sold: state.art.sold || 0 } : undefined,
    invest: { xp: inv.xp, properties: [], etf: 0, etfTimer: ETF_EVERY, etfHistory: [] },
    // all-time logistics counters are statistics: always kept
    logistics: { tankers: [], trucks: [], planes: [], earned: logi.earned, contracts: logi.contracts || 0 },
  };
  // 💼 Tycoon's Legacy: from the reset it was picked on, every reset keeps the Science buildings (University, Research lab, Space Mission Center…), not the satellite
  if (L.tycoon > 0 && state.science) keep.science = { ...state.science, satellite: false };
  // 🌌 Space: nothing in space resets: races, friendship, goods, crafted items, research, fleet and contracts all stay.
  // Ships in flight finish their trip (trade routes stop after the loop they're on), and the friendship cool-off clock starts fresh.
  if (state.space) {
    const now = Date.now();
    keep.space = { ...state.space };
    Object.values(keep.space.races || {}).forEach(r => { if (r.found) { r.warmAt = now; r.coolT = 0; } });
  }
  if (L.empire > 0) {   // Global Empire keeps the fleet on every reset after it was picked
    keep.logistics = state.logistics;
    // 🚢 Global Empire level 2 just picked: offers on screen and deliveries under way get the half time right away
    if (id === "empire" && L.empire === 2) for (const list of [logi.trucks, logi.tankers, logi.planes]) for (const v of (list || [])) {
      (v.offers || []).forEach(o => { o.seconds = Math.max(1, Math.round(o.seconds / 2)); });
      if (v.contract) { v.contract.seconds = Math.max(1, Math.round(v.contract.seconds / 2)); v.contract.left = Math.max(1, Math.round(v.contract.left / 2)); }
    }
    keep.special = { agency: null, warehouses: state.special.warehouses, port: state.special.port, center: state.special.center };
  }
  stopSaving = true;
  const { progress, prefs } = splitState(keep);
  try { storage.saveGame(progress); } catch (e) {}
  storage.savePrefs({ ...storage.loadPrefs(), ...prefs });
  location.reload();
}

$("modal").addEventListener("click", (e) => {
  const pick = e.target.closest("[data-prestige-pick]");
  if (pick) return showPrestigeConfirm(pick.dataset.prestigePick);
  const btn = e.target.closest("[data-prestige]");
  if (!btn) return;
  const a = btn.dataset.prestige;
  if (a === "later") hideModal();
  if (a === "back") showPrestigeOffer();
  if (a === "confirm") doPrestige(btn.dataset.choice);
});
$("prestigeBtn").addEventListener("click", () => { if (!isPaused() && canPrestige()) showPrestigeOffer(); });

/* =====================================================================
   🎁 FREE BET CHIPS from the Gambler level (and 500 scoin chips from the VIP Coins prestige bonus).
   Each chip type has its own timer; you can hold up to 100 of each, then its timer stops.
   Timers: 20 min, 15 min from level 45, 10 min from level 85. Not usable in Plinko and Sky Climb.
   ===================================================================== */
const FREE_CHIP_TYPES = [
  { value: 10000, level: 5 }, { value: 50000, level: 15 }, { value: 100000, level: 25 }, { value: 1000000, level: 35 },
  { value: 10000000, level: 55 }, { value: 100000000, level: 65 }, { value: 250000000, level: 75 }, { value: 500000000, level: 99 },
];
const FREE_CHIP_MAX = 100;
// 🎟️ VIP Coins prestige bonus: the 500 scoin pile holds up to 200
const freeCap = (v) => v === VIP_CHIP && state.legacy && state.legacy.vip > 0 ? 200 : FREE_CHIP_MAX;
const VIP_CHIP = 500000000;
function freeChipBase() { const L = levelInfo(state.casinoXp).level; return L >= 85 ? 10 : L >= 45 ? 15 : 20; }
// ⭐ VIP Coins prestige bonus: every free chip twice as fast (20 / 15 / 10 min → 10 / 7.5 / 5 min)
function freeChipMinutes() { return freeChipBase() / (state.legacy.vip > 0 ? 2 : 1); }
const fmtMin = (m) => (Number.isInteger(m) ? m : m.toFixed(1));
function vipMinutes() { return 10; }   // VIP Coins: a 500 scoin chip every 10 min
const freeUnlocked = () => FREE_CHIP_TYPES.filter(c => levelInfo(state.casinoXp).level >= c.level);

// Old VIP coins (a balance) become 500 scoin free chips; any leftover goes to casino chips
if (state.vip && state.vip.coins > 0) {
  const n = Math.floor(state.vip.coins / VIP_CHIP);
  state.freeChips[VIP_CHIP] = Math.min(freeCap(VIP_CHIP), (state.freeChips[VIP_CHIP] || 0) + n);
  state.casinoChips += state.vip.coins - n * VIP_CHIP;
  state.vip.coins = 0;
}
if (state.plinkoVipInPlay > 0) { state.casinoChips += state.plinkoVipInPlay; state.plinkoVipInPlay = 0; }
state.vipMode = {};

function freeTick() {
  if (isPaused()) return;
  const gap = freeChipMinutes() * 60;
  for (const c of freeUnlocked()) {
    const v = c.value, have = state.freeChips[v] || 0;
    if (!state.freeTimers[v] || state.freeTimers[v] > gap) state.freeTimers[v] = gap;
    if (have >= freeCap(v)) { state.freeTimers[v] = gap; continue; }     // full: the timer waits
    if (--state.freeTimers[v] <= 0) { state.freeChips[v] = have + 1; state.freeTimers[v] = gap; showNotice(`🎁 Free ${chipLabel(v)} chip!`); }
  }
  if (state.legacy.vip > 0) {   // ⭐ VIP Coins prestige bonus
    const gapV = vipMinutes() * 60, have = state.freeChips[VIP_CHIP] || 0;
    if (!state.vip.timer || state.vip.timer > gapV) state.vip.timer = gapV;
    if (have >= freeCap(VIP_CHIP)) state.vip.timer = gapV;
    else if (--state.vip.timer <= 0) {
      state.freeChips[VIP_CHIP] = have + 1; state.vip.timer = gapV;
      showAlert("🎫 VIP: free 500 scoin chip!", "Use it as a free bet at the Super high roller tables.", "good");
    }
  }
  updateVipBar();
}
// (freeTick is run every game second by the game clock)

// The line under the Gambler level: every free chip you have, how many, and when the next one comes
var vipReady;   // set once everything below exists (updateCounter can run earlier during start-up)
function updateVipBar() {
  if (!vipReady) return;
  $("vipStat").hidden = true;
  $("vipBar").hidden = true;
  const L = levelInfo(state.casinoXp).level, gap = freeChipMinutes();
  const slots = FREE_CHIP_TYPES.map(c => {
    const open = L >= c.level, n = state.freeChips[c.value] || 0;
    return { value: c.value, open, n, vip: false,
      time: !open ? `Level ${c.level}` : n >= freeCap(c.value) ? "full" : clock(state.freeTimers[c.value] || gap * 60),
      tip: open ? `Free ${chipLabel(c.value)} bet chip: a new one every ${fmtMin(gap)} min${state.legacy.vip > 0 ? " (🎟️ VIP: twice as fast)" : ""}, even while the game is closed (max ${freeCap(c.value)}). Unlocked at Gambler level ${c.level}.`
                : `🔒 Unlocks at Gambler level ${c.level} (you are level ${L}). Then you get a free ${chipLabel(c.value)} bet chip every ${fmtMin(gap)} min.` };
  });
  const vip = state.legacy.vip > 0, nV = state.freeChips[VIP_CHIP] || 0;
  slots.push({ value: VIP_CHIP, open: vip, n: nV, vip: true,
    time: !vip ? "Prestige" : nV >= freeCap(VIP_CHIP) ? "full" : clock(state.vip.timer || vipMinutes() * 60),
    tip: vip ? `🎫 VIP chip from the ⭐ VIP Coins prestige bonus: a free 500 scoin bet chip every ${vipMinutes()} min. It goes into the same 500 scoin pile as the slot next to it (you have ${nV}, max ${freeCap(VIP_CHIP)}).`
             : "🔒 Unlocks when you choose ⭐ VIP Coins as a prestige bonus (from 1 gcoin): a free 500 scoin bet chip every 10 min, all free chips twice as fast, and room for 200 chips of 500 scoin." });
  // build the slots once, then only update their numbers (so the hover box doesn't flicker)
  const key = slots.map(x => x.open).join();
  if ($("freeChipsGrid").dataset.key !== key) {
    $("freeChipsGrid").dataset.key = key;
    $("freeChipsGrid").innerHTML = slots.map((x, i) => `
      <div class="freeSlot ${x.open ? "" : "locked"} ${x.vip ? "vip" : ""}" id="fslot-${i}">
        ${chipMark(x.value)}${x.open ? "" : `<span class="lock">🔒</span>`}${x.vip ? `<span class="vipTag">🎫</span>` : ""}
        <span class="ftime" id="ftime-${i}"></span><span class="fcount" id="fcount-${i}"></span></div>`).join("");
  }
  slots.forEach((x, i) => {
    $("fslot-" + i).dataset.tip = x.tip;
    $("fslot-" + i).classList.toggle("full", x.open && x.n >= freeCap(x.value));
    $("ftime-" + i).textContent = x.time;
    // 🎫 the VIP chip has no pile of its own: it adds to the 500 scoin pile shown next to it, so it shows an arrow, not a second count
    $("fcount-" + i).textContent = x.vip && x.open ? "→ 500sc" : `${x.n}/${freeCap(x.value)}`;
  });
}

// Row of free chips under a table's normal chips. Only chips that fit the table's limit are shown.
function freeChipRow(t, selectedFree) {
  const owned = Object.keys(state.freeChips).map(Number).filter(v => state.freeChips[v] > 0 && v <= t.max).sort((a, b) => a - b);
  if (!owned.length) return "";
  return `<div class="chipsRow freeRow"><span class="muted">🎁 Free:</span>
    ${owned.map(v => `<button class="chip free ${selectedFree && t.chip === v ? "selected" : ""}" data-freechip="${v}"
        style="background:${CHIP_COLORS[v].bg}; color:${CHIP_COLORS[v].text}">${chipLabel(v)}<i>×${state.freeChips[v]}</i></button>`).join("")}
    <span class="muted">Free bet chips: what the bet pays goes to your money.${freePlacedSum(t.id) ? ` On the table now: ${fmt(freePlacedSum(t.id))} free.` : ""}</span></div>`;
}
vipReady = true;

// Checked every second: show the button when the next prestige goal (1 / 5 / 10 / 20 gcoin) is reached
setInterval(() => {
  const ready = canPrestige();
  $("prestigeBtn").hidden = !ready;
  // after the final prestige: tell the player once that the game is finished
  if (state.legacy.count >= PRESTIGE_MAX && !state.legacy.finishedShown && !isPaused() && $("modal").hidden) {
    state.legacy.finishedShown = true;
    save();
    const picks = PRESTIGE_CHOICES.filter(c => state.legacy[c.id]).map(c => `${c.icon} ${c.name} ×${state.legacy[c.id]}`).join(" · ");
    showModal(`<h2>🏆 You finished the game!</h2>
      <p>That was your ${PRESTIGE_MAX}th and final prestige. No more resets are possible.</p>
      <p class="muted">Your Legacy: ${picks}</p>
      <p>You can keep playing as long as you like: collect the remaining achievements and enjoy your empire!</p>
      <button class="btn big" data-prestige="later">Keep playing</button>`);
    $("modalBox").classList.add("gold");
  }
  if (ready && !state.prestigeOffered && !isPaused() && $("modal").hidden) {
    state.prestigeOffered = true;
    save();
    showPrestigeOffer();
  }
}, 1000);

/* ----- 📋 Table of every level (Gambler and Investor use the same XP curve) ----- */
function showLevelTable(kind) {
  const gam = kind === "gambler", lg = kind === "logistics";
  const xp = gam ? state.casinoXp : lg ? state.logiXp : inv.xp;
  const curve = gam ? LEVEL_XP : lg ? LOGI_XP : INVEST_XP;
  const cur = levelInfo(xp, curve).level;
  const unlock = (L) => {
    const u = [];
    if (lg) for (const k in AGENT_LEVEL) if (AGENT_LEVEL[k] === L) u.push(`🤖 ${FLEETS[k].label} agent`);
    if (gam) {
      const fc = FREE_CHIP_TYPES.find(c => c.level === L);
      if (fc) u.push(`🎁 Free ${chipLabel(fc.value)} chip`);
      if (L === 45) u.push(`🎁 Free chips every ${fmtMin(freeChipMinutes())} min`);
      if (L === 85) u.push(`🎁 Free chips every ${fmtMin(freeChipMinutes())} min`);
    }
    if (gam && L >= 5 && (L - 5) % 10 === 0) u.push(`🎰 Casino #${(L - 5) / 10 + 1}`);
    if (kind === "investor" && L >= 5 && (L - 5) % 10 === 0) u.push(`🏨 Hotel #${(L - 5) / 10 + 1}`);
    if (kind === "investor" && L === 10) u.push("🏦 Brokerage Firm");
    return u.join(", ");
  };
  const perk = (L) => lg ? "" : gam ? `${(CASHBACK_PER_LEVEL * L * 100).toFixed(1)}% cashback`
                          : `${(Math.max(0, ETF_BASE_FEE - ETF_FEE_PER_LEVEL * (L - 1)) * 100).toFixed(1)}% ETF fee · +${(RE_LEVEL_BONUS * L * 100).toFixed(1)}% property sales`;
  let rows = "";
  for (let L = 1; L <= MAX_LEVEL; L++) {
    const step = L === 1 ? 0 : curve[L] - curve[L - 1];
    rows += `<tr class="${L === cur ? "now" : L < cur ? "done" : ""}" ${L === cur ? 'id="levelNow"' : ""}>
      <td>${L}</td><td>${fmtNum(curve[L])}</td><td>${L === 1 ? "—" : "+" + fmtNum(step)}</td>${lg ? "" : `<td>${perk(L)}</td>`}<td>${unlock(L)}</td></tr>`;
  }
  const next = cur < MAX_LEVEL ? `${fmtNum(curve[cur + 1] - xp)} XP to level ${cur + 1}` : "Max level reached!";
  showModal(`<h2>${gam ? "🎲 Gambler" : lg ? "🚚 Logistics" : "📈 Investor"} levels</h2>
    <p class="muted">${lg ? "XP when a contract is delivered: contract minutes × 1 (trucks), × 3 (tankers), × 6 (cargo planes)" : gam ? "XP = bcoin bet × the table's XP multiplier (from ×1 at Classic Roulette to ×10 at Super high roller Hold'em; see 📖 Wiki → Casino) · 🔥 Hot Tables add +10 (+20 from level 50, +40 from level 75)"
                           : "Every minute with money invested gives 4 XP, 8 XP from 1 scoin invested, 16 XP from 100 scoin"} ·
      You: level ${cur}, ${fmtNum(xp)} XP · ${next}</p>
    <div class="levelTableWrap"><table class="levelTable">
      <thead><tr><th>Level</th><th>Total XP</th><th>This level</th>${lg ? "" : `<th>${gam ? "Cashback" : "Perks"}</th>`}<th>Unlocks</th></tr></thead>
      <tbody>${rows}</tbody></table></div>
    <button class="btn" data-modal="close">Close</button>`);
  $("modalBox").classList.add("wide");
  const now = $("levelNow");
  if (now) now.scrollIntoView({ block: "center" });
}
document.addEventListener("click", (e) => {
  const b = e.target.closest("[data-levels]");
  if (b && !isPaused()) showLevelTable(b.dataset.levels);
});

/* ---------------------------------------------------------------------
   ⭐ LEGACY BADGE + PANEL: shows your prestige level and the bonuses you picked
   --------------------------------------------------------------------- */
function legacyBonuses() {
  const L = state.legacy;
  return [
    { icon: "💼", name: "Tycoon's Legacy", on: L.tycoon > 0, level: L.tycoon ? `×${L.tycoon}` : "",
      text: L.tycoon ? `+${L.tycoon * 25}% income from businesses, special businesses and clicks` : "Not picked yet: +25% income per pick" },
    { icon: "🚢", name: "Global Empire", on: L.empire > 0, level: `${L.empire || 0}/2`,
      text: L.empire >= 2 ? "Fleet, warehouses, Trading Port and Logistics Center kept on every reset · contracts take half the time"
        : L.empire ? "Fleet, warehouses, Trading Port and Logistics Center kept on every reset" : "Not picked yet: keep your logistics fleet on every reset" },
    { icon: "🎟️", name: "VIP Coins", on: L.vip > 0, level: `${L.vip || 0}/2`,
      text: L.vip ? `A free 500 scoin VIP chip every ${L.vip >= 2 ? 10 : 20} minutes for the Super high roller tables · up to 200 chips of 500 scoin` : "Not picked yet: free 500 scoin VIP chips" },
  ];
}
function updateLegacyBadge() {
  const b = $("legacyBadge"), L = state.legacy; if (!b) return;
  b.hidden = !(L.count > 0);
  if (b.hidden) return;
  const icons = legacyBonuses().filter(x => x.on).map(x => x.icon).join("");
  b.innerHTML = `${ico("prestige")}Prestige ${L.count}/${PRESTIGE_MAX} <span class="lgIcons">${icons}</span>`;
}
function showLegacy() {
  const L = state.legacy, done = L.count >= PRESTIGE_MAX;
  const NAMES = { tycoon: "💼 Tycoon's Legacy", empire: "🚢 Global Empire", vip: "🎟️ VIP Coins" };
  showModal(`<h2>${ico("prestige", "h")}Your Legacy</h2>
    <div class="legacySteps">${PRESTIGE_STEPS.map((v, i) => `<span class="${i < L.count ? "done" : ""}">${fmt(v)}</span>`).join("")}</div>
    <p>${done ? "🏆 All 4 prestiges done: you finished the game! You can keep playing." :
      `Prestige <b>${L.count} of ${PRESTIGE_MAX}</b> · next at <b>${fmt(prestigeAt())}</b> (you have ${fmt(state.money)})`}</p>
    <div class="legacyList">${legacyBonuses().map(x => `<div class="legacyRow ${x.on ? "" : "off"}"><span class="big">${x.icon}</span>
      <div><b>${x.name}</b> <span class="muted">${x.level}</span><div>${x.text}</div></div></div>`).join("")}</div>
    ${(L.history || []).length ? `<p class="muted">Your picks: ${L.history.map((h, i) => `${i + 1}. ${NAMES[h.choice] || h.choice}`).join(" · ")}</p>` : ""}
    <button class="btn" data-modal="close">Close</button>`);
  $("modalBox").classList.add("gold");
}
$("legacyBadge").addEventListener("click", () => { if (!isPaused()) showLegacy(); });
updateLegacyBadge();
