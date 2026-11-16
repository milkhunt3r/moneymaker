/* =====================================================================
   🔬 SCIENCE (Income tab → Science). Unlocks at Logistics 50, Investor 50 and Gambler 25.
   🎓 University (100 scoin): 1 scientist every 2 min, up to 50. Costs 5 / sec per empty scientist place
      (starts at −250 / sec); with all 50 scientists it earns +500 / sec.
   🧪 Research lab (500 scoin + 20 scientists from the University): every second a 1 in 7,200 chance of a scientific breakthrough,
      guaranteed after 7,200 seconds without one. A breakthrough pauses the game with a golden Nobel Prize pop-up
      and pays 1,000 scoin. Offline: at most one breakthrough while you were away.
   🚀 Space Mission Center (10,000 scoin + 50 scientists, after 2 breakthroughs): launches a mission every 20 minutes:
      2,000 – 5,000 scoin, or 0 if it fails (20% chance, 15% with the satellite).
   Scientists spent on buildings leave the University, which then trains new ones (and costs money again until it's full).
   🛰️ Satellite (Logistics, 500 scoin, after the Space Mission Center): space mission failure chance −5 points (15%),
      cargo plane contracts pay +5%, tanker contracts take 10% less time, broken trucks repair themselves for free after 5 seconds.
   A prestige resets Science (the Nobel Prize count stays in your statistics).
   ===================================================================== */
const SCI_REQ = { logistics: 50, investor: 50, gambler: 25 };
const UNI_PRICE = 1e8, UNI_MAX = 50, UNI_EVERY = 120, UNI_COST_PER_EMPTY = 5, UNI_FULL_INCOME = 500;
const LAB_PRICE = 5e8, LAB_ODDS = 7200, LAB_REWARD = 1e9;
const SPACE_PRICE = 1e10, SPACE_NEED = 2, SPACE_EVERY = 1200, SPACE_MIN = 2000, SPACE_MAX = 5000;
// 👩‍🔬 Scientists are a resource: building the lab / mission center takes them out of the University (it then trains new ones)
const LAB_SCI = 20, SPACE_SCI = 50, SPACE_FAIL = 0.20, SAT_FAIL_CUT = 0.05;
const SAT_PRICE = 5e8, SAT_PLANE_BONUS = 0.05, SAT_TANKER_SPEED = 0.9, SAT_REPAIR_SECONDS = 5;
if (!state.science) state.science = { uni: null, lab: null, space: null, satellite: false };
const sci = () => state.science;
const sciLevels = () => ({ logistics: logiLevel(), investor: levelInfo(inv.xp, INVEST_XP).level, gambler: levelInfo(state.casinoXp).level });
const scienceOpen = () => { const L = sciLevels(); return L.logistics >= SCI_REQ.logistics && L.investor >= SCI_REQ.investor && L.gambler >= SCI_REQ.gambler; };
/* 🌌 Secret Science (no info anywhere until the 1st prestige): a 2nd University and the Astronomy Research Center.
   Both Universities share one pool of scientists; buildings take scientists from the fullest one first. */
const secretsOpen = () => (state.legacy && state.legacy.count) >= 1;
const ASTRO_PRICE = 5e8, ASTRO_SCI = 20, ASTRO_TIME_CUT = 300;
const unis = () => [sci().uni, sci().uni2, sci().uni3].filter(Boolean);
/* 🌌🌌 Second-tier secrets (no info anywhere until the 2nd prestige): a 3rd University, the 🌕 Moon Base (after the 🛸 station)
   with its own deep space missions, and the 🧬 Genetics Laboratory (after the Moon Base): +30% on every space mission. */
const secrets2Open = () => (state.legacy && state.legacy.count) >= 2;
const MOON_PRICE = 1e11, MOON_SCI = 150, DEEP_EVERY = 1200, DEEP_FAIL = 0.20, DEEP_MIN = 50000, DEEP_MAX = 70000;   // scoin
const GENE_PRICE = 5e10, GENE_SCI = 75, GENE_BONUS = 0.30;
const spaceBonus = () => (sci().gene ? 1 + GENE_BONUS : 1);   // 🧬 +30% on 🚀 and 🌕 mission rewards
const sciPool = () => unis().reduce((a, u) => a + u.scientists, 0);
function spendScientists(n) {
  while (n > 0) {
    const u = unis().sort((a, b) => b.scientists - a.scientists)[0];
    const k = Math.min(n, u.scientists); u.scientists -= k; n -= k; u.timer = Math.min(u.timer, UNI_EVERY);
  }
}
const oneUniIncome = (u) => u.scientists >= UNI_MAX ? UNI_FULL_INCOME : -UNI_COST_PER_EMPTY * (UNI_MAX - u.scientists);
const uniIncome = () => unis().reduce((a, u) => a + oneUniIncome(u), 0);
// 20 minutes; −5 with the 🔭 Astronomy Research Center; −5 with the 🛸 Orbital Space Station
const spaceEvery = () => SPACE_EVERY - (sci().astro ? ASTRO_TIME_CUT : 0) - (sci().station ? STATION_TIME_CUT : 0);
const spaceMin = () => spaceEvery() / 60;
if (state.science.space && state.science.space.timer > SPACE_EVERY) state.science.space.timer = SPACE_EVERY;   // older saves: hourly timer
const STATION_PRICE = 5e10, STATION_SCI = 100, STATION_FAIL_CUT = 0.05, STATION_TIME_CUT = 300, STATION_LAB_ODDS = 3600;
// 20%; −5% with the 🛰️ satellite; −5% with the 🛸 Orbital Space Station
const spaceFail = () => SPACE_FAIL - (sci().satellite ? SAT_FAIL_CUT : 0) - (sci().station ? STATION_FAIL_CUT : 0);
// 🧪 1 in 7,200 per second (guaranteed after 2 hours); with the 🛸 station 1 in 3,600 (guaranteed after 1 hour)
const labOdds = () => sci().station ? STATION_LAB_ODDS : LAB_ODDS;

// ----- Nobel Prize texts: one field is chosen at random for each breakthrough -----
const NOBEL_FIELDS = [
  { name: "Physics", icon: "⚛️", finds: [
    "a way to keep quantum states stable at room temperature, opening the door to practical quantum computers",
    "how dark matter interacts with ordinary matter, solving one of the biggest mysteries of the universe",
    "a new particle that explains why time only moves forward"] },
  { name: "Chemistry", icon: "⚗️", finds: [
    "a catalyst that turns CO₂ from the air into clean fuel using only sunlight",
    "a new kind of chemical bond that makes unbreakable yet fully recyclable plastics possible",
    "a reaction that splits water into hydrogen at almost no energy cost"] },
  { name: "Medicine and Physiology", icon: "🩺", finds: [
    "a universal vaccine that protects against every strain of influenza",
    "a treatment that teaches the body's own cells to repair damaged hearts",
    "a simple blood test that detects over 50 diseases years before symptoms appear"] },
  { name: "Biology", icon: "🧬", finds: [
    "how some animals regenerate lost limbs, and how the same process can be switched on in other species",
    "the hidden language bacteria use to cooperate, changing how we fight infections",
    "how cells decide when to age, revealing the biological clock of life"] },
  { name: "Genetics", icon: "🧬", finds: [
    "a precise gene-editing method that safely fixes inherited diseases with a single treatment",
    "the genes that make some people naturally immune to most viruses",
    "how 'silent' DNA switches genes on and off, rewriting the textbooks on heredity"] },
  { name: "Molecular Biology", icon: "🔬", finds: [
    "the molecular motor cells use to repair their own DNA, and how to make it stronger",
    "how proteins fold in a microsecond, allowing new medicines to be designed in days",
    "a molecule that clears the damaged proteins behind many age-related diseases"] },
  { name: "Neuroscience", icon: "🧠", finds: [
    "how the brain stores memories, and how lost memories can be restored",
    "the brain circuit that creates consciousness",
    "a way to regrow damaged nerves, helping paralyzed patients walk again"] },
  { name: "Astronomy and Astrophysics", icon: "🔭", finds: [
    "clear signs of life in the atmosphere of a planet orbiting a nearby star",
    "what happens to information that falls into a black hole",
    "the first light ever emitted in the universe, revealing how the very first stars were born"] },
  { name: "Materials Science", icon: "🧲", finds: [
    "a superconductor that works at room temperature and normal pressure",
    "a self-healing material that repairs cracks in bridges and aircraft on its own",
    "a nanomaterial that stores ten times more energy than today's best batteries"] },
  { name: "Environmental Science", icon: "🌍", finds: [
    "a natural process that lets oceans absorb carbon ten times faster, slowing climate change",
    "how to restore dying coral reefs in just a few years",
    "a way to turn deserts green using microbes that pull water from the air"] },
];
function nobelHtml(p) {
  const f = NOBEL_FIELDS[p.field] || NOBEL_FIELDS[0];
  return `<div class="nobel"><div class="nobelMedal">🏅</div>
    <h2>Scientific breakthrough!</h2>
    <p>Congratulations! Your researchers have discovered <b>${f.finds[p.find] || f.finds[0]}</b>.</p>
    <p>This discovery will change the world, and you have won the <b>Nobel Prize in ${f.icon} ${f.name}</b>!</p>
    <div class="nobelReward">+${fmt(LAB_REWARD)}</div>
    <button class="btn big" data-nobel="ok">🏅 Accept the Nobel Prize</button></div>`;
}
function showNobel() {
  const p = sci().lab && sci().lab.pending;
  if (!p) return;
  showModal(nobelHtml(p));
  $("modalBox").classList.add("gold");
}
function breakthrough() {
  const lab = sci().lab;
  const field = secureRandomInt(NOBEL_FIELDS.length);
  lab.pending = { field, find: secureRandomInt(NOBEL_FIELDS[field].finds.length) };
  lab.since = 0;
  save(); flushSave();
  showNobel();
}
document.addEventListener("click", (e) => {
  if (!e.target.closest("[data-nobel]")) return;
  const lab = sci().lab;
  if (!lab || !lab.pending) { hideModal(); return; }
  lab.pending = null;
  lab.prizes = (lab.prizes || 0) + 1;
  state.stats.nobels = (state.stats.nobels || 0) + 1;
  state.money += LAB_REWARD;
  hideModal(); updateCounter(); render(); save(); flushSave();
  showNotice(`🏅 Nobel Prize accepted: +${fmt(LAB_REWARD)}!`);
});

const MISSION_NAMES = ["Artemis", "Odyssey", "Horizon", "Pioneer", "Voyager", "Aurora", "Kepler", "Polaris", "Zenith", "Orion", "Phoenix", "Nova"];
function launchMission() {
  const s = sci().space, n = (s.count = (s.count || 0) + 1);
  const name = `${MISSION_NAMES[secureRandomInt(MISSION_NAMES.length)]}-${n}`;
  const failed = secureRandomInt(1000) < Math.round(spaceFail() * 1000);
  const reward = failed ? 0 : Math.round((SPACE_MIN + secureRandomInt(SPACE_MAX - SPACE_MIN + 1)) * 1e6 * spaceBonus());
  s.log = [{ name, reward, at: Date.now() }, ...(s.log || [])].slice(0, 5);
  if (reward) state.stats.spaceOk = (state.stats.spaceOk || 0) + 1; else state.stats.spaceFail = (state.stats.spaceFail || 0) + 1;
  s.earned = (s.earned || 0) + reward;
  return { name, reward };
}

// 🌕 a deep space mission from the Moon Base: 20% fail, else 50,000 – 70,000 scoin (+30% with the 🧬 Genetics Laboratory)
const DEEP_NAMES = ["Selene", "Tranquility", "Copernicus", "Tycho", "Endeavour", "Eagle", "Luna", "Apollo", "Gagarin", "Shackleton"];
function launchDeep() {
  const m = sci().moon, n = (m.count = (m.count || 0) + 1);
  const name = `${DEEP_NAMES[secureRandomInt(DEEP_NAMES.length)]}-${n}`;
  const failed = secureRandomInt(1000) < Math.round(DEEP_FAIL * 1000);
  const reward = failed ? 0 : Math.round((DEEP_MIN + secureRandomInt(DEEP_MAX - DEEP_MIN + 1)) * 1e6 * spaceBonus());
  m.log = [{ name, reward, at: Date.now() }, ...(m.log || [])].slice(0, 5);
  if (reward) { m.ok = (m.ok || 0) + 1; state.stats.deepOk = (state.stats.deepOk || 0) + 1; } else state.stats.deepFail = (state.stats.deepFail || 0) + 1;
  m.earned = (m.earned || 0) + reward;
  return { name, reward };
}

// One game second of Science; returns its income per second (University)
function scienceTick() {
  const S = sci();
  for (const u of unis()) if (u.scientists < UNI_MAX && --u.timer <= 0) {
    u.scientists++; u.timer = UNI_EVERY;
    if (u.scientists === UNI_MAX) showNotice(`🎓 Your ${u === S.uni2 ? "2nd " : u === S.uni3 ? "3rd " : ""}University is full: ${UNI_MAX} scientists! It now earns +${fmt(UNI_FULL_INCOME)} / sec.`);
    if (u.scientists === UNI_MAX && state.view === "income") render();
  }
  if (S.lab && !S.lab.pending) {
    S.lab.since = (S.lab.since || 0) + 1;
    if (S.lab.since >= labOdds() || secureRandomInt(labOdds()) === 0) breakthrough();
  }
  if (S.space && --S.space.timer <= 0) {
    S.space.timer = spaceEvery();
    const m = launchMission();
    state.money += m.reward;
    if (m.reward) showNotice(`🚀 Mission ${m.name} succeeded: +${fmt(m.reward)}!`);
    else showAlert(`🚀 Mission ${m.name} failed`, `The rocket didn't make it. No reward this time; the next launch is in ${spaceMin()} minutes.`);
    if (state.view === "income") render();
  }
  if (S.moon && --S.moon.timer <= 0) {
    S.moon.timer = DEEP_EVERY;
    const m = launchDeep();
    state.money += m.reward;
    if (m.reward) showNotice(`🌕 Deep space mission ${m.name} succeeded: +${fmt(m.reward)}!`);
    else showAlert(`🌕 Deep space mission ${m.name} failed`, `The ship was lost in deep space. No reward this time; the next launch is in ${DEEP_EVERY / 60} minutes.`);
    if (state.view === "income") render();
  }
  // 🛰️ satellite: broken trucks repair themselves for free after 5 seconds
  if (S.satellite) for (const v of logi.trucks) {
    if (!v.broken) continue;
    if (v.broken.auto === undefined) v.broken.auto = SAT_REPAIR_SECONDS;
    if (--v.broken.auto <= 0) {
      v.broken = null; v.offers = makeContracts("truck"); v.wait = 0;
      showNotice(`🛰️ ${v.name} was repaired automatically.`);
      if (state.view === "logistics") renderFleet("truck");
    }
  }
  // live numbers on the Science page
  const set = (id, t) => { const el = $(id); if (el) el.textContent = t; };
  if (S.uni) {
    set("sci-uni-income", (uniIncome() >= 0 ? "+" : "") + fmt(uniIncome()) + " / sec");
    const ui = $("sci-uni-income"); if (ui) ui.classList.toggle("neg", uniIncome() < 0);
    set("sci-pool", sciPool());
    updateSciNeeds();
    [["", S.uni], ["2", S.uni2], ["3", S.uni3]].forEach(([k, u]) => {
      if (!u) return;
      set(`sci-uni${k}-count`, u.scientists);
      set(`sci-uni${k}-next`, u.scientists >= UNI_MAX ? "full" : "next in " + clock(u.timer));
      const bar = $(`sci-uni${k}-bar`); if (bar) bar.style.width = (u.scientists / UNI_MAX * 100) + "%";
    });
  }
  if (S.lab) set("sci-lab-next", "guaranteed within " + clock(Math.max(0, labOdds() - (S.lab.since || 0))));
  if (S.space) set("sci-space-next", clock(S.space.timer));
  if (S.moon) set("sci-moon-next", clock(S.moon.timer));
  return uniIncome();
}

// ----- Science page (Income → 🔬 Science) -----
// 💰 / 👩‍🔬 what a building needs, with ✅ / ❌ (updated every second by the science tick)
const sciNeed = (price, n) => `<div class="sciNeed" data-money="${price}" data-sci="${n}">
  <span data-k="m">💰 ${fmt(price)}</span><span data-k="s">👩‍🔬 <b>${sciPool()}</b> / ${n} scientists</span></div>`;
// buy button: enabled only when you have both the money AND the scientists (both Universities count together)
const sciBtn = (what, price, n, open = true) => `<button class="btn" data-sci="${what}" data-scibtn="${price},${n}" ${open ? "" : "data-locked"}
  ${open && state.money >= price && sciPool() >= n ? "" : "disabled"}>Buy</button>`;
function updateSciNeeds() {
  const pool = sciPool();
  document.querySelectorAll(".sciNeed").forEach(el => {
    const okM = state.money >= Number(el.dataset.money), okS = pool >= Number(el.dataset.sci);
    const m = el.querySelector('[data-k="m"]'), sc = el.querySelector('[data-k="s"]');
    m.classList.toggle("ok", okM); m.classList.toggle("short", !okM);
    sc.classList.toggle("ok", okS); sc.classList.toggle("short", !okS);
    const b = sc.querySelector("b"); if (b) b.textContent = pool;
  });
  document.querySelectorAll("[data-scibtn]").forEach(btn => {
    const [price, n] = btn.dataset.scibtn.split(",").map(Number);
    btn.disabled = btn.hasAttribute("data-locked") || state.money < price || pool < n;
  });
}
function renderScience() {
  const S = sci(), L = sciLevels();
  if (!scienceOpen()) {
    const row = (k, label) => `<div class="row"><span>${label}</span><b class="${L[k] >= SCI_REQ[k] ? "income" : ""}">${Math.min(L[k], SCI_REQ[k])} / ${SCI_REQ[k]} ${L[k] >= SCI_REQ[k] ? "✅" : ""}</b></div>`;
    return `<div class="card" style="text-align:center"><h3>🔒 🔬 Science</h3>
      <p class="muted">Build a University, make Nobel Prize-winning breakthroughs and launch space missions.</p></div>
      <div class="card"><h4 style="margin-top:0">Unlocks when you reach:</h4>
        ${row("logistics", "🚚 Logistics level")}${row("investor", "📈 Investor level")}${row("gambler", "🎲 Gambler level")}</div>`;
  }
  let html = "";
  // 🎓 University
  const uniRows = (k, u, label) => `<div class="row"><span>${label}👩‍🔬 Scientists: <b id="sci-uni${k}-count">${u.scientists}</b> / ${UNI_MAX}</span><span class="muted" id="sci-uni${k}-next"></span></div>
      <div class="xpBar"><div class="xpFill" id="sci-uni${k}-bar" style="width:${u.scientists / UNI_MAX * 100}%"></div></div>`;
  if (S.uni) {
    html += `<div class="card specialCard"><div class="row"><h3>🎓 University${S.uni3 ? " ×3" : S.uni2 ? " ×2" : ""}</h3><span class="income ${uniIncome() < 0 ? "neg" : ""}" id="sci-uni-income">${uniIncome() >= 0 ? "+" : ""}${fmt(uniIncome())} / sec</span></div>
      ${uniRows("", S.uni, S.uni2 ? "1st · " : "")}${S.uni2 ? uniRows("2", S.uni2, "2nd · ") : ""}${S.uni3 ? uniRows("3", S.uni3, "3rd · ") : ""}
      ${S.uni2 ? `<div class="muted">${S.uni3 ? "All three" : "Both"} Universities share one pool: <b id="sci-pool">${sciPool()}</b> scientists</div>` : ""}
      <div class="muted">1 new scientist every 2 minutes · −${UNI_COST_PER_EMPTY} / sec for each empty place · +${fmt(UNI_FULL_INCOME)} / sec when full</div></div>`;
    if (secretsOpen() && !S.uni2) html += `<div class="card specialCard secretCard"><div class="row"><div><h3>🎓 2nd University <span class="secretTag">🌌 new</span></h3>
        <div class="muted">A second University: trains its own scientists (1 every 2 minutes, up to ${UNI_MAX}) for the same shared pool. −${UNI_COST_PER_EMPTY} / sec per empty place, +${fmt(UNI_FULL_INCOME)} / sec when full.</div></div>
      <button class="btn" data-sci="uni2" data-cost="${UNI_PRICE}">Buy ${fmt(UNI_PRICE)}</button></div></div>`;
    if (secrets2Open() && S.uni2 && !S.uni3) html += `<div class="card specialCard secretCard"><div class="row"><div><h3>🎓 3rd University <span class="secretTag">🌌🌌 new</span></h3>
        <div class="muted">A third University for the same shared pool: up to ${UNI_MAX * 3} scientists in total. −${UNI_COST_PER_EMPTY} / sec per empty place, +${fmt(UNI_FULL_INCOME)} / sec when full.</div></div>
      <button class="btn" data-sci="uni3" data-cost="${UNI_PRICE}">Buy ${fmt(UNI_PRICE)}</button></div></div>`;
  } else {
    html += `<div class="card specialCard"><div class="row"><div><h3>🎓 University</h3>
        <div class="muted">Trains 1 scientist every 2 minutes, up to ${UNI_MAX}. Until it's full it costs ${UNI_COST_PER_EMPTY} / sec per empty place (−${fmt(UNI_COST_PER_EMPTY * UNI_MAX)} / sec at the start); with ${UNI_MAX} scientists it earns +${fmt(UNI_FULL_INCOME)} / sec.</div></div>
      <button class="btn" data-sci="uni" data-cost="${UNI_PRICE}">Buy ${fmt(UNI_PRICE)}</button></div></div>`;
  }
  // 🧪 Research lab
  if (S.lab) {
    html += `<div class="card specialCard"><div class="row"><h3>🧪 Research lab</h3>
        <span class="vialCount" title="Scientific breakthroughs (Nobel Prizes)">⚗️ × ${S.lab.prizes || 0}</span></div>
      <div class="muted">Every second: a 1 in ${labOdds().toLocaleString("en-US")} chance of a scientific breakthrough worth ${fmt(LAB_REWARD)}${S.station ? " (🛸 space station)" : ""} · <span id="sci-lab-next"></span></div></div>`;
  } else {
    html += `<div class="card specialCard"><div class="row"><div><h3>🧪 Research lab</h3>
        <div class="muted">Every second a 1 in ${labOdds().toLocaleString("en-US")} chance of a scientific breakthrough: a Nobel Prize and ${fmt(LAB_REWARD)}. Guaranteed at least every ${labOdds() / 3600 === 1 ? "hour" : labOdds() / 3600 + " hours"}.</div>
        ${sciNeed(LAB_PRICE, LAB_SCI)}</div>
      ${sciBtn("lab", LAB_PRICE, LAB_SCI)}</div></div>`;
  }
  // 🚀 Space Mission Center
  if (S.space) {
    const log = (S.space.log || []).map(m => `<div class="row"><span>🚀 ${m.name}</span><b class="${m.reward ? "income" : ""}">${m.reward ? "+" + fmt(m.reward) : "❌ failed"}</b></div>`).join("");
    html += `<div class="card specialCard"><div class="row"><h3>🚀 Space Mission Center</h3><span class="muted">next launch in <b id="sci-space-next">${clock(S.space.timer)}</b></span></div>
      <div class="muted">Every ${spaceMin()} minutes: ${fmt(SPACE_MIN * 1e6 * spaceBonus())} – ${fmt(SPACE_MAX * 1e6 * spaceBonus())}${sci().gene ? " (🧬 +30%)" : ""}, or nothing if the mission fails (${Math.round(spaceFail() * 100)}% chance)</div>
      ${S.satellite || S.astro || S.station ? `<div class="muted">Boosted by: ${[S.satellite && "🛰️ satellite (−5% fail)", S.astro && "🔭 Astronomy center (−5 min)", S.station && "🛸 space station (−5% fail, −5 min)"].filter(Boolean).join(" · ")}</div>` : ""}
      ${log ? `<h4>Last missions</h4>${log}` : ""}
      ${S.satellite ? "" : `<div class="muted">🛰️ A satellite is now available in 🚢 Logistics.</div>`}</div>`;
  } else {
    const unlocked = S.lab && (S.lab.prizes || 0) >= SPACE_NEED;
    html += `<div class="card specialCard" ${unlocked ? "" : `style="opacity:0.6"`}><div class="row"><div><h3>${unlocked ? "" : "🔒 "}🚀 Space Mission Center</h3>
        <div class="muted">Launches a space mission every ${spaceMin()} minutes: ${fmt(SPACE_MIN * 1e6)} – ${fmt(SPACE_MAX * 1e6)}, with a ${Math.round(SPACE_FAIL * 100)}% chance the mission fails. Unlocks a 🛰️ satellite in Logistics.</div>
        ${unlocked ? "" : `<div class="muted">Needs ${SPACE_NEED} breakthroughs in your Research lab${S.lab ? ` (you have ${S.lab.prizes || 0})` : ""}</div>`}
        ${sciNeed(SPACE_PRICE, SPACE_SCI)}</div>
      ${sciBtn("space", SPACE_PRICE, SPACE_SCI, !!unlocked)}</div></div>`;
  }
  // 🔭 Astronomy Research Center (secret: only after the 1st prestige)
  if (S.astro) {
    html += `<div class="card specialCard secretCard"><div class="row"><h3>🔭 Astronomy Research Center</h3><span class="secretTag">🌌</span></div>
      <div class="muted">Your astronomers plan the launch windows: space missions launch <b>${ASTRO_TIME_CUT / 60} minutes sooner</b> (now every ${spaceMin()} minutes).${S.space ? "" : " (Build the 🚀 Space Mission Center to use it.)"}</div></div>`;
  } else if (secretsOpen()) {
    html += `<div class="card specialCard secretCard"><div class="row"><div><h3>🔭 Astronomy Research Center <span class="secretTag">🌌 new</span></h3>
        <div class="muted">Space missions launch ${ASTRO_TIME_CUT / 60} minutes sooner (every ${spaceEvery() / 60 - ASTRO_TIME_CUT / 60} instead of ${spaceMin()} minutes).</div>
        ${sciNeed(ASTRO_PRICE, ASTRO_SCI)}</div>
      ${sciBtn("astro", ASTRO_PRICE, ASTRO_SCI)}</div></div>`;
  }
  // 🛸 Orbital Space Station (secret: only after the 1st prestige)
  const stationPerks = `space missions fail ${STATION_FAIL_CUT * 100}% less often and launch ${STATION_TIME_CUT / 60} minutes sooner; the 🧪 Research lab's odds become 1 in ${STATION_LAB_ODDS.toLocaleString("en-US")} (a breakthrough guaranteed within 1 hour)`;
  if (S.station) {
    html += `<div class="card specialCard secretCard"><div class="row"><h3>🛸 Orbital Space Station</h3><span class="secretTag">🌌</span></div>
      <div class="muted">In orbit: ${stationPerks}.</div></div>`;
  } else if (secretsOpen()) {
    html += `<div class="card specialCard secretCard"><div class="row"><div><h3>🛸 Orbital Space Station <span class="secretTag">🌌 new</span></h3>
        <div class="muted">${stationPerks[0].toUpperCase() + stationPerks.slice(1)}.</div>
        ${sciNeed(STATION_PRICE, STATION_SCI)}${S.uni2 ? "" : `<div class="muted">Needs both Universities full (2 × ${UNI_MAX})</div>`}</div>
      ${sciBtn("station", STATION_PRICE, STATION_SCI)}</div></div>`;
  }
  // 🌕 Moon Base (secret tier 2: after the 2nd prestige, needs the 🛸 station)
  if (S.moon) {
    const log = (S.moon.log || []).map(m => `<div class="row"><span>🌕 ${m.name}</span><b class="${m.reward ? "income" : ""}">${m.reward ? "+" + fmt(m.reward) : "❌ failed"}</b></div>`).join("");
    html += `<div class="card specialCard secretCard"><div class="row"><h3>🌕 Moon Base</h3><span class="muted">next deep space launch in <b id="sci-moon-next">${clock(S.moon.timer)}</b></span></div>
      <div class="muted">Every ${DEEP_EVERY / 60} minutes a deep space mission: ${fmt(DEEP_MIN * 1e6 * spaceBonus())} – ${fmt(DEEP_MAX * 1e6 * spaceBonus())}${S.gene ? " (🧬 +30%)" : ""}, or nothing if it fails (${Math.round(DEEP_FAIL * 100)}% chance) · successful: <b>${S.moon.ok || 0}</b></div>
      ${log ? `<h4>Last deep space missions</h4>${log}` : ""}</div>`;
  } else if (secrets2Open()) {
    html += `<div class="card specialCard secretCard" ${S.station ? "" : `style="opacity:0.6"`}><div class="row"><div><h3>${S.station ? "" : "🔒 "}🌕 Moon Base <span class="secretTag">🌌🌌 new</span></h3>
        <div class="muted">Launches a deep space mission every ${DEEP_EVERY / 60} minutes: ${fmt(DEEP_MIN * 1e6)} – ${fmt(DEEP_MAX * 1e6)}, with a ${Math.round(DEEP_FAIL * 100)}% chance the mission fails.</div>
        ${S.station ? "" : `<div class="muted">Needs the 🛸 Orbital Space Station</div>`}
        ${sciNeed(MOON_PRICE, MOON_SCI)}${S.uni3 ? "" : `<div class="muted">Needs ${MOON_SCI} scientists: all three Universities full (3 × ${UNI_MAX})</div>`}</div>
      ${sciBtn("moon", MOON_PRICE, MOON_SCI, !!S.station)}</div></div>`;
  }
  // 🧬 Genetics Laboratory (secret tier 2: after the Moon Base)
  if (S.gene) {
    html += `<div class="card specialCard secretCard"><div class="row"><h3>🧬 Genetics Laboratory</h3><span class="secretTag">🌌🌌</span></div>
      <div class="muted">Your geneticists keep the crews fit for longer flights: <b>+${GENE_BONUS * 100}%</b> on every 🚀 space mission and 🌕 deep space mission reward.</div></div>`;
  } else if (secrets2Open() && S.moon) {
    html += `<div class="card specialCard secretCard"><div class="row"><div><h3>🧬 Genetics Laboratory <span class="secretTag">🌌🌌 new</span></h3>
        <div class="muted">+${GENE_BONUS * 100}% on every 🚀 space mission and 🌕 deep space mission reward.</div>
        ${sciNeed(GENE_PRICE, GENE_SCI)}</div>
      ${sciBtn("gene", GENE_PRICE, GENE_SCI)}</div></div>`;
  }
  return html;
}
// Income page tabs: Businesses / Special / Science
$("shop").addEventListener("click", (e) => {
  const t = e.target.closest("[data-ipage]");
  if (!t) return;
  state.incomePage = t.dataset.ipage;
  render(); save();
  $("shop").scrollTop = 0;
});
$("shop").addEventListener("click", (e) => {
  const b = e.target.closest("[data-sci]");
  if (!b || isPaused() || !scienceOpen()) return;
  const S = sci(), what = b.dataset.sci;
  const buy = (price) => { if (state.money < price) return false; state.money -= price; return true; };
  if (what === "uni" && !S.uni && buy(UNI_PRICE)) { S.uni = { scientists: 0, timer: UNI_EVERY }; showNotice("🎓 University built! Your first scientist arrives in 2 minutes."); }
  else if (what === "uni2" && secretsOpen() && S.uni && !S.uni2 && buy(UNI_PRICE)) { S.uni2 = { scientists: 0, timer: UNI_EVERY }; showNotice("🎓 2nd University built! Its scientists join the same pool."); }
  else if (what === "astro" && secretsOpen() && !S.astro && sciPool() >= ASTRO_SCI && buy(ASTRO_PRICE)) {
    spendScientists(ASTRO_SCI); S.astro = { bought: true };
    if (S.space) S.space.timer = Math.min(S.space.timer, spaceEvery());
    showNotice(`🔭 Astronomy Research Center built! Space missions now launch every ${spaceMin()} minutes.`);
  }
  else if (what === "station" && secretsOpen() && !S.station && sciPool() >= STATION_SCI && buy(STATION_PRICE)) {
    spendScientists(STATION_SCI); S.station = { bought: true };
    if (S.space) S.space.timer = Math.min(S.space.timer, spaceEvery());
    if (S.lab && !S.lab.pending) S.lab.since = Math.floor((S.lab.since || 0) * STATION_LAB_ODDS / LAB_ODDS);   // same progress toward the guarantee, now on a 1-hour clock
    showNotice(`🛸 Orbital Space Station in orbit! Missions every ${spaceMin()} minutes with a ${Math.round(spaceFail() * 100)}% fail chance, and lab breakthroughs twice as likely.`);
  }
  else if (what === "uni3" && secrets2Open() && S.uni2 && !S.uni3 && buy(UNI_PRICE)) { S.uni3 = { scientists: 0, timer: UNI_EVERY }; showNotice("🎓 3rd University built! Up to 150 scientists in your shared pool."); }
  else if (what === "moon" && secrets2Open() && S.station && !S.moon && sciPool() >= MOON_SCI && buy(MOON_PRICE)) {
    spendScientists(MOON_SCI); S.moon = { timer: DEEP_EVERY, log: [], count: 0, ok: 0, earned: 0 };
    showNotice(`🌕 Moon Base established! The first deep space mission launches in ${DEEP_EVERY / 60} minutes.`);
  }
  else if (what === "gene" && secrets2Open() && S.moon && !S.gene && sciPool() >= GENE_SCI && buy(GENE_PRICE)) {
    spendScientists(GENE_SCI); S.gene = { bought: true };
    showNotice(`🧬 Genetics Laboratory opened! Space and deep space missions now pay +${GENE_BONUS * 100}%.`);
  }
  else if (what === "lab" && !S.lab && sciPool() >= LAB_SCI && buy(LAB_PRICE)) { spendScientists(LAB_SCI); S.lab = { since: 0, prizes: 0, pending: null }; showNotice("🧪 Research lab opened! Breakthroughs can happen any second now."); }
  else if (what === "space" && !S.space && S.lab && (S.lab.prizes || 0) >= SPACE_NEED && sciPool() >= SPACE_SCI && buy(SPACE_PRICE)) { spendScientists(SPACE_SCI); S.space = { timer: spaceEvery(), log: [], count: 0, earned: 0 }; showNotice(`🚀 Space Mission Center built! The first launch is in ${spaceMin()} minutes. A 🛰️ satellite is now available in Logistics.`); }
  else return;
  updateCounter(); render(); save();
});

// ----- 🛰️ Satellite card in Logistics -----
function renderSatellite() {
  const box = $("satelliteCard"), S = sci();
  if (!box) return;
  box.hidden = !S.space && !S.satellite;
  if (box.hidden) return;
  const perks = `<ul class="satPerks"><li>🚀 Space missions fail 5% less often (${Math.round((SPACE_FAIL - SAT_FAIL_CUT) * 100)}% instead of ${Math.round(SPACE_FAIL * 100)}%)</li>
    <li>✈️ Cargo plane contracts pay +5%</li><li>🛢️ Tanker contracts take 10% less time</li>
    <li>🔧 Broken trucks repair themselves for free after 5 seconds</li></ul>`;
  box.innerHTML = S.satellite
    ? `<div class="row"><h3>🛰️ Satellite <span class="muted">in orbit</span></h3><span class="income">active</span></div>${perks}`
    : `<div class="row"><div><h3>🛰️ Satellite</h3><div class="muted">Max 1 · works on its own, no agent needed · permanent bonuses:</div>${perks}</div>
        <button class="btn" data-satellite="buy" data-cost="${SAT_PRICE}" ${state.money >= SAT_PRICE ? "" : "disabled"}>Launch ${fmt(SAT_PRICE)}</button></div>`;
}
$("satelliteCard").addEventListener("click", (e) => {
  if (!e.target.closest("[data-satellite]") || isPaused()) return;
  const S = sci();
  if (!S.space || S.satellite || state.money < SAT_PRICE) return;
  state.money -= SAT_PRICE; S.satellite = true;
  updateCounter(); renderSatellite(); renderFleet("tanker"); renderFleet("plane"); save();
  showNotice("🛰️ Satellite launched! Its bonuses are active.");
});
renderSatellite();

/* ----- 🔒 Logistics unlocks when you buy your first 🚘 Car Salon (stays open after that;
   players who already own vehicles keep it). Live trading unlock labels are refreshed here too. ----- */
const logisticsOpen = () => !!state.logiUnlocked || ownedOf("salon") > 0 || ["trucks", "tankers", "planes"].some(k => (logi[k] || []).length > 0);
function refreshUnlocks(first) {
  const open = logisticsOpen();
  if (open && !state.logiUnlocked) {
    state.logiUnlocked = true; save();
    if (!first) showNotice("🚢 Logistics unlocked! Buy trucks and deliver contracts around the world.");
  }
  const tab = document.querySelector('.tab[data-view="logistics"]');
  // ⚠️ red warning on the tab while a truck is broken down and not repaired yet
  const broken = open && (logi.trucks || []).some(v => v.broken);
  const html = (open ? "" : ico("lock", "lockS")) + '<img class="tabIco" src="assets/icons/tab-logistics.webp" alt="">Logistics' + (broken ? ' <span class="tabWarn" title="A truck is broken down: repair it in 🚢 Logistics">!</span>' : "");
  if (tab && tab.innerHTML !== html) tab.innerHTML = html;
  $("logisticsView").classList.toggle("locked", !open);
  $("logiLocked").hidden = open;
  if (!open) $("logiLocked").innerHTML = `<h2>🔒 🚢 Logistics</h2>
    <p>Run trucks, oil tankers and cargo planes on contracts around the world.</p>
    <p><b>Unlocks when you buy your first 🚘 Car Salon</b> (💰 Income → 🏢 Businesses; it needs 3 car washes and 3 repair shops).</p>`;
  const liveBtn = document.querySelector('[data-isub="live"]');
  if (liveBtn) {
    const lbl = (liveOpen() ? "" : "🔒 ") + "📡 Live trading";
    if (liveBtn.textContent !== lbl) { liveBtn.textContent = lbl; if (state.view === "invest" && state.investPage === "live") showInvestPage("live"); }
  }
}
refreshUnlocks(true);
setInterval(() => refreshUnlocks(false), 1000);
