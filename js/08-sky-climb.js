/* Empire of Coins © 2026 milkhunt3r. All rights reserved. */
/* =====================================================================
   SKY CLIMB (our take on a ball-draw climbing game)
   28 balls: 19 green, 8 red, 1 gold. Balls are NOT put back during a round.
   Green: climb one step. Gold: climb one step + a shield that blocks the next red.
   Red: the balloon pops and you lose what is still riding (unless shielded).
   After each step: Cash out, Take half (once), or Draw again.
   Ladder tuned so perfect play pays back about 97.7%.
   ===================================================================== */
const CLIMB_LADDER = [0, 1, 1.4, 2, 3, 4.4, 6.6, 8, 9.5, 11.5, 14, 17, 21, 26, 34, 48, 80, 200, 1000, 5000, 50000];
const CLIMB_MIN = 10000, CLIMB_MAX = 500000;   // Classic table (the wiki lists every table)
// Tables: same game, different limits
const CLIMB_TABLES = {
  climb:     { title: "Sky Climb", min: 10000, max: 500000, chips: [10000, 25000, 50000, 100000, 250000, 500000] },
  climbHigh: { title: "Sky Climb: High rollers", min: 5000000, max: 500000000, chips: [5000000, 10000000, 50000000, 100000000, 250000000, 500000000] },
};
const climbFresh = (id) => ({ bet: 0, chip: CLIMB_TABLES[id].chips[0], active: false, busy: false, stake: 0, step: 0, shield: false,
                              balls: [], drawn: [], tookHalf: false, banked: 0, message: "", crashed: false, lastBet: 0, inPlay: 0 });

/* 🔒 A climb in progress is saved: after a reload you continue at the same step with the same balls left
   (the next ball is only drawn when you press Draw, so refreshing gains nothing). Very old saves get the stake back. */
if (!state.climbRounds) {   // older saves kept one table in climbRound / climbInPlay
  state.climbRounds = {};
  if (state.climbRound) state.climbRounds.climb = { ...state.climbRound, inPlay: state.climbInPlay || 0 };
}
delete state.climbRound; delete state.climbInPlay;
const CLIMBS = {};
let climbResumed = false;
for (const id in CLIMB_TABLES) {
  const c = Object.assign(climbFresh(id), state.climbRounds[id] || {}, { busy: false }, CLIMB_TABLES[id], { id });
  if (c.active && c.inPlay > 0) { c.drawn.forEach(d => d.fresh = false); climbResumed = true; }
  else { if (c.inPlay > 0) state.casinoChips += c.inPlay; c.inPlay = 0; c.active = false; }
  CLIMBS[id] = state.climbRounds[id] = c;   // saved with the game
}
if (climbResumed) setTimeout(() => showNotice("🎈 Your Sky Climb is still in the air: continue it in the 🎰 Casino."), 0);
let climb = CLIMBS.climb;

function climbMachine() {
  return [...Array(19).fill("g"), ...Array(8).fill("r"), "d"];
}
const climbValue = () => climb.stake * CLIMB_LADDER[climb.step];

async function climbStart() {
  if (climb.active || climb.busy) return;
  if (climb.bet < climb.min) return climbMsg("Minimum bet is " + fmt(climb.min) + ".");
  if (climb.bet > state.casinoChips) return climbMsg("Not enough chips. Add money to the casino first.");
  state.casinoChips -= climb.bet;
  casinoRecord(climb.bet, 0);
  countPlay("climb");
  Object.assign(climb, { active: true, stake: climb.bet, step: 0, shield: false, balls: climbMachine(),
                         drawn: [], tookHalf: false, banked: 0, message: "", crashed: false, lastBet: climb.bet });
  climb.inPlay = climb.stake;
  addXp(climb.bet);                 // XP = bet × game multiplier
  updateCounter(); save();
  await climbDraw();
}

async function climbDraw() {
  if (!climb.active || climb.busy) return;
  climb.busy = true;
  climb.message = "";
  renderClimb(true);                // shake the machine for suspense
  await sleep(window.BJ_FAST ? 0 : 900);

  const i = secureRandomInt(climb.balls.length);
  const ball = climb.balls.splice(i, 1)[0];
  const entry = { b: ball, fresh: true };
  climb.drawn.push(entry);

  if (ball === "r") {
    if (climb.shield) {
      climb.shield = false;
      entry.absorbed = true;
      climb.message = "🛡️ Your gold shield blocked the red ball! You're still flying.";
    } else {
      // Crash: lose what is still riding
      const lost = climb.stake;
      const cashback = lost * cashbackRate();
      state.casinoChips += cashback;
      casinoRecord(0, cashback);
      climb.crashed = true;
      climb.active = false;
      climb.inPlay = 0;
      climb.message = `💥 Red ball! Your balloon popped and you lost ${fmt(lost)}.` +
        (climb.banked ? ` You kept the ${fmt(climb.banked)} you banked.` : "") +
        (cashback > 0 ? ` Cashback +${cashback.toLocaleString(undefined, { maximumFractionDigits: 1 })}.` : "");
    }
  } else {
    climb.step++;
    if (ball === "d") { climb.shield = true; climb.message = "✨ Gold ball! You climbed and got a shield against the next red ball."; }
    if (climb.step === 20) { state.stats.climbTop = true; climb.busy = false; climbCashOut(true); return; }
  }
  climb.busy = false;
  updateCounter(); save();
  renderClimb();
}

function climbCashOut(top = false) {
  if (!climb.active || climb.busy || climb.step === 0) return;
  const win = climbValue();
  state.casinoChips += win;
  casinoRecord(0, win);
  climb.active = false;
  climb.inPlay = 0;
  const total = win + climb.banked;
  climb.message = (top ? "🏆 TOP OF THE SKY! " : "💰 Cashed out ") + fmt(win) + ` at ${CLIMB_LADDER[climb.step]}×.` +
    (climb.banked ? ` Total with banked half: ${fmt(total)}.` : "") +
    ` (${total - climb.lastBet >= 0 ? "+" : ""}${fmt(total - climb.lastBet)})`;
  updateCounter(); save(); renderClimb();
}

function climbTakeHalf() {
  if (!climb.active || climb.busy || climb.step === 0 || climb.tookHalf) return;
  const half = climbValue() / 2;
  state.casinoChips += half;
  casinoRecord(0, half);
  climb.banked += half;
  climb.stake /= 2;               // half keeps climbing
  climb.tookHalf = true;
  climb.inPlay = climb.stake;
  climb.message = `👐 Banked ${fmt(half)}. The other half keeps climbing.`;
  updateCounter(); save(); renderClimb();
}

function climbMsg(text) { climb.message = text; renderClimb(); }

function renderClimb(mixing = false) {
  const left = climb.balls.length ? climb.balls : climbMachine();
  const counts = { g: 0, r: 0, d: 0 };
  left.forEach(b => counts[b]++);
  const total = left.length;
  const up = ((counts.g + counts.d) / total * 100).toFixed(1);
  const red = (counts.r / total * 100).toFixed(1);

  const ladder = CLIMB_LADDER.slice(1).map((m, i) => {
    const step = i + 1;
    const cls = step === climb.step && (climb.active || !climb.crashed) && climb.step > 0 ? "current" : step < climb.step ? "passed" : "";
    const amount = (climb.active ? climb.stake : climb.bet || climb.min) * m;
    return `<div class="rung ${cls} ${step === 20 ? "top" : ""}"><span>${step}. ${m.toLocaleString()}×</span><span>${shortNum(Math.floor(amount))}</span></div>`;
  }).join("");

  // shuffle the display order of balls so the machine looks mixed
  const shown = left.map((b, i) => ({ b, k: (i * 7919) % 97 })).sort((a, b) => a.k - b.k);
  let center;
  if (climb.active) {
    center = `<div class="big">${fmt(climbValue())}</div>
              <div>Step ${climb.step} of 20 · ${CLIMB_LADDER[climb.step]}× on ${fmt(climb.stake)}${climb.banked ? ` · banked ${fmt(climb.banked)}` : ""}</div>`;
  } else {
    center = `<div class="big">🎈 Sky Climb</div><div>Place a bet and start climbing!</div>`;
  }

  // Betting circle in the middle, decisions on both sides, main action below
  let table;
  if (climb.active) {
    const can = !climb.busy && climb.step > 0;
    table = `
      <button class="decision" data-climb="cash" ${can ? "" : "disabled"}>💰 Cash out<small>${climb.step > 0 ? fmt(climbValue()) : "—"}</small></button>
      <div class="betCircle live">${chipMark(climb.stake)}<b>${fmt(climb.stake)}</b><span>riding</span></div>
      <button class="decision" data-climb="half" ${can && !climb.tookHalf ? "" : "disabled"}>👐 Take half<small>${climb.step > 0 && !climb.tookHalf ? fmt(climbValue() / 2) : climb.tookHalf ? "used" : "—"}</small></button>
      <button class="decision main" data-climb="draw" ${climb.busy ? "disabled" : ""}>🎈 Draw a ball</button>`;
  } else {
    table = `
      <button class="decision" data-climb="clear" ${climb.bet ? "" : "disabled"}>✖ Clear<small>bet</small></button>
      <div class="betCircle">${climb.bet ? chipMark(climb.bet) + `<b>${fmt(climb.bet)}</b>` : `<span>Place your bet<br>with the chips below</span>`}</div>
      <button class="decision" data-climb="rebet" ${climb.lastBet ? "" : "disabled"}>↺ Same bet<small>${climb.lastBet ? fmt(climb.lastBet) : "—"}</small></button>
      <button class="decision main" data-climb="start" ${climb.bet >= climb.min ? "" : "disabled"}>🚀 Start</button>`;
  }

  $("casinoGame").innerHTML = `
    <div class="card">
      <div class="row"><div><h2 style="margin:0">${casIco(climb.id)}${climb.title}</h2>
        <div class="muted">Bet ${fmt(climb.min)} – ${fmt(climb.max)} · 19 green, 8 red, 1 gold ball · balls are not put back</div></div>
        <button class="btn ghost small" data-back="1" ${climb.active ? "disabled" : ""}>← All games</button></div>
      <div class="climbWrap">
        <div class="climbSky ${climb.crashed && !climb.active ? "crash" : ""}">
          <div class="machine ${mixing ? "mixing" : ""}">${shown.map(x => `<div class="ball ${x.b}"></div>`).join("")}</div>
          <div class="balloonRow">${climb.drawn.map((x, i) => {
            const popped = x.b === "r" && !x.absorbed;   // the red one that ended the round
            return `<div class="balloon ${x.b} ${x.fresh ? "new" : ""} ${x.absorbed ? "absorbed" : ""} ${popped ? "popped" : ""}"
                      title="${x.b === "g" ? "Green: +1 step" : x.b === "d" ? "Gold: +1 step and a shield" : x.absorbed ? "Red, blocked by your shield" : "Red: popped!"}"></div>`;
          }).join("")}</div>
          <div class="climbInfo">
            ${center}
            ${climb.shield ? `<div style="margin-top:6px"><span class="shield">🛡️ Shield active</span></div>` : ""}
            <div class="odds"><span style="color:#b9f6ca">Next ball climbs: ${up}%</span><span style="color:#ffcdd2">Red: ${red}%${climb.shield ? " (blocked)" : ""}</span></div>
          </div>
          <div class="climbTable">${table}</div>
        </div>
        <div class="ladder">${ladder}</div>
      </div>
      ${climb.active ? "" : `<div class="chipsRow"><span class="muted">Bet:</span>
        ${climb.chips.map(v => `<button class="chip ${v === climb.chip ? "selected" : ""}" data-climbchip="${v}"
             style="background:${CHIP_COLORS[v].bg}; color:${CHIP_COLORS[v].text}">${chipLabel(v)}</button>`).join("")}
        <span class="muted">Click chips to add to your bet (max ${fmt(climb.max)}).</span></div>`}
      <div id="casinoMsg" class="${/Cashed|TOP|Banked|shield|Gold/.test(climb.message) ? "income" : "flash"}" style="margin-top:10px; text-align:center">${climb.message}</div>
      <div class="muted" style="margin-top:6px; text-align:center">Green climbs a step · Gold climbs and gives a shield that blocks one red · Red pops your balloon · Take half once to bank half and keep climbing with the rest</div>
    </div>`;
  climb.drawn.forEach(x => x.fresh = false);
}

$("casinoGame").addEventListener("click", (e) => {
  if (!CLIMBS[currentGame] || isPaused()) return;
  const chip = e.target.closest("[data-climbchip]");
  if (chip && !climb.active) {
    const v = Number(chip.dataset.climbchip);
    climb.chip = v;
    if (climb.bet + v > climb.max) return climbMsg("Maximum bet is " + fmt(climb.max) + ".");
    climb.bet += v; climb.message = ""; renderClimb(); return;
  }
  const btn = e.target.closest("[data-climb]");
  if (!btn || btn.disabled) return;
  const a = btn.dataset.climb;
  if (a === "start") climbStart();
  if (a === "draw") climbDraw();
  if (a === "cash") climbCashOut();
  if (a === "half") climbTakeHalf();
  if (a === "clear") { climb.bet = 0; renderClimb(); }
  if (a === "rebet") { climb.bet = climb.lastBet; renderClimb(); }
});
