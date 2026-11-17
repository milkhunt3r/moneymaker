/* =====================================================================
   🧬 GENE CASCADE: the slot screen (the maths is in js/26-slot-engine.js)
   Two tables (High rollers and Super high rollers limits). 🔒 Unlocks after the 1st prestige at Gambler level 40. A whole paid spin, free spins included, is decided at once and its
   win saved before anything is shown: leaving or reloading pays the same win straight away.
   ===================================================================== */
const GC_TABLES = {
  gcHigh:  { id: "gcHigh",  title: "Gene Cascade: High rollers",       chips: [50000, 100000, 250000, 500000, 1000000, 5000000] },
  gcSuper: { id: "gcSuper", title: "Gene Cascade: Super high rollers", chips: [10000000, 25000000, 50000000, 100000000, 250000000, 500000000] },
};
for (const id in GC_TABLES) { const t = GC_TABLES[id]; t.min = t.chips[0]; t.max = t.chips[t.chips.length - 1]; }
if (!state.gc) state.gc = {};
if (state.gc.gcLow) {   // the Classic table was removed: pay a spin that was still running there
  if (state.gc.gcLow.pending) state.casinoChips += state.gc.gcLow.pending.win;
  delete state.gc.gcLow;
}
const GC_LEVEL = 40;
const gcUnlocked = () => ((state.legacy && state.legacy.count) || 0) >= 1 && levelInfo(state.casinoXp).level >= GC_LEVEL;
const gcLockText = () => { const pc = (state.legacy && state.legacy.count) || 0, lv = levelInfo(state.casinoXp).level;
  return `Unlocks after your 1st prestige and at Gambler level ${GC_LEVEL} (${pc >= 1 ? "prestige ✓" : "no prestige yet"} · you are level ${lv})`; };
for (const id in GC_TABLES) state.gc[id] = Object.assign({ bet: GC_TABLES[id].min, pending: null }, state.gc[id] || {});
let gcView = null;   // what the screen shows: { grid, hits, win cells, banner … } while a spin plays
let gcBusy = false, gcSkip = false;
const gcPic = (s) => s === SL_SCAT ? "assets/gene/gx-dna.webp" : `assets/gene/${SL_SYMBOLS[s].pic}.webp`;
const gcRand = () => secureRandomInt(1 << 30) / (1 << 30);
const gcWait = (ms) => new Promise(r => setTimeout(r, gcSkip ? 0 : ms * (state.gcFast ? 0.45 : 1)));

// pay a finished spin (also used after a reload)
function gcSettle(id, away = false) {
  const p = state.gc[id].pending; if (!p) return;
  const lost = Math.max(0, p.bet - p.win), cashback = lost * cashbackRate();
  state.casinoChips += p.win + cashback;
  casinoRecord(p.bet, p.win + cashback);
  const levels = addXp(p.bet);
  if (p.mult >= 100) state.stats.gc100 = true;
  state.gc[id].pending = null; state.gc[id].last = { bet: p.bet, win: p.win, mult: p.mult, free: p.free };
  if (away && p.win > 0) showNotice(`🧬 Your Gene Cascade spin finished: you won ${fmt(p.win)}${p.free ? ` (with ${p.free} free spins)` : ""}.`);
  updateCounter(); save();
  return { cashback, levels };
}

let gcBuyArm = 0;   // 🛒 the Buy button needs a second tap within 4 seconds
async function gcSpin(buy = false) {
  const t = GC_TABLES[currentGame], st = state.gc[t.id];
  if (gcBusy || st.pending || !gcUnlocked()) return;
  const bet = st.bet, cost = buy ? bet * SL_BUY : bet;
  if (bet < t.min || bet > t.max) return gcMsg(`Bets here are ${fmt(t.min)} – ${fmt(t.max)}.`);
  if (state.casinoChips < cost) return gcMsg(`Not enough chips${buy ? ` to buy the bonus (${fmt(cost)})` : ""}. Add money to the casino first.`);
  state.casinoChips -= cost;
  const round = buy ? slBuyRound(gcRand) : slRound(gcRand);
  const win = Math.floor(round.total * bet);
  st.pending = { bet: cost, stake: bet, buy, win, mult: round.total, free: round.award };   // 🔒 saved before anything is shown
  if (buy) state.stats.gcBuys = (state.stats.gcBuys || 0) + 1;
  countPlay("gc");
  updateCounter(); save();
  gcBusy = true; gcSkip = false;
  const id = t.id;
  let shown = 0;   // running win shown on screen (× bet)
  const play = async (spin, hitsBefore, label) => {
    let hits = hitsBefore.slice();
    for (const step of spin.steps) {
      if (currentGame !== id) return false;
      gcView = { grid: step.grid, hits, drop: new Set(step.drop), wins: null, label, shown, bet };
      renderGeneCascade(); await gcWait(step === spin.steps[0] ? 380 : 300);
      if (!step.wins.length) break;
      gcView.wins = new Set(step.wins.flatMap(w => w.cells)); gcView.drop = new Set();
      gcView.lines = step.wins.map(w => ({ sym: w.sym, size: w.size, base: w.base, mult: w.mult, pay: w.pay }));
      shown += step.pay; gcView.shown = Math.min(SL_CAP, shown);
      renderGeneCascade(); await gcWait(650);
      gcView.popping = true; hits = step.hits.slice(); gcView.hits = hits;
      renderGeneCascade(); await gcWait(260);
      gcView.popping = false;
    }
    return hits;
  };
  // base spin (a bought bonus starts straight with the free spins)
  let ok = round.base ? await play(round.base, new Array(SL_CELLS).fill(0), "") : [];
  if (ok !== false && round.bonus.length) {
    const first = round.base ? round.base.free : SL_FREE[round.scat];
    if (!round.base) gcView = { grid: (gcView && gcView.grid) || st.idle, hits: new Array(SL_CELLS).fill(0), drop: new Set(), label: "", shown: 0, bet };
    gcView = { ...gcView, banner: round.base ? `🧪 ${round.base.scat} DNA vials! ${first} FREE SPINS` : `🛒 Bonus bought: ${round.scat} DNA vials! ${first} FREE SPINS`, wins: null, lines: null };
    renderGeneCascade(); await gcWait(1600);
    let hits = new Array(SL_CELLS).fill(0), given = first;
    for (let i = 0; i < round.bonus.length && ok !== false; i++) {
      const s = round.bonus[i];
      ok = await play(s, hits, `Free spin ${i + 1} of ${given}`);
      if (ok === false) break;
      hits = ok;
      if (s.free) { given += s.free; gcView = { ...gcView, banner: `🧪 +${s.free} FREE SPINS`, wins: null, lines: null }; renderGeneCascade(); await gcWait(1200); gcView.banner = null; }
    }
    if (round.capped && ok !== false) { gcView = { ...gcView, banner: `🏆 MAX WIN ${SL_CAP.toLocaleString()}×!` }; renderGeneCascade(); await gcWait(1600); }
  }
  // finished (or the player left: pay at once)
  const away = currentGame !== id;
  const r = gcSettle(id, away);
  gcBusy = false; gcSkip = false;
  if (!away) {
    const m = round.total;
    gcView = { ...(gcView || {}), wins: null, lines: null, popping: false, shown: m, done: true, drop: new Set(),
      banner: m >= 100 ? `💥 MEGA WIN ${fmt(win)}!` : m >= 20 ? `🎉 BIG WIN ${fmt(win)}!` : null };
    const shownView = gcView;
    if (shownView.banner) setTimeout(() => { if (gcView === shownView && !gcBusy) { gcView.banner = null; if (currentGame === id) renderGeneCascade(); } }, 2500);
    st.msg = (buy ? `🛒 Bought bonus (${fmt(cost)}): it paid ${fmt(win)} (${+m.toFixed(2)}× your bet, ${round.award} free spins), ${win >= cost ? `+${fmt(win - cost)}` : `−${fmt(cost - win)}`} overall.` +
        (r.cashback > 0 ? ` Cashback +${r.cashback.toLocaleString(undefined, { maximumFractionDigits: 1 })}.` : "") + (r.levels > 0 ? ` 🎉 Level up! Now level ${levelInfo(state.casinoXp).level}.` : "") : "") + (buy ? "" : win > 0 ? `You won ${fmt(win)} (${+m.toFixed(2)}× your bet)${round.award ? ` with ${round.award} free spins` : ""}.` +
      (r.cashback > 0 ? ` Cashback +${r.cashback.toLocaleString(undefined, { maximumFractionDigits: 1 })}.` : "") +
      (r.levels > 0 ? ` 🎉 Level up! Now level ${levelInfo(state.casinoXp).level}.` : "")
      : `No win this time.${r.cashback > 0 ? ` Cashback +${r.cashback.toLocaleString(undefined, { maximumFractionDigits: 1 })}.` : ""}${r.levels > 0 ? ` 🎉 Level up! Now level ${levelInfo(state.casinoXp).level}.` : ""}`);
    renderGeneCascade();
  }
}
function gcMsg(text) { const st = state.gc[currentGame]; if (st) { st.msg = text; renderGeneCascade(); } }

function renderGeneCascade() {
  const t = GC_TABLES[currentGame]; if (!t) return;
  const st = state.gc[t.id], v = gcView && gcView.bet !== undefined ? gcView : null;
  const grid = v ? v.grid : (st.idle || (st.idle = Array.from({ length: SL_CELLS }, (_, i) => (i * 5 + ((i / 7) | 0) * 3) % 7)));
  const hits = v ? v.hits : new Array(SL_CELLS).fill(0);
  const cells = grid.map((s, k) => {
    const h = hits[k], m = slMult(h);
    const cls = [s === SL_SCAT ? "scat" : "", v && v.drop && v.drop.has(k) ? "drop" : "", v && v.wins && v.wins.has(k) ? (v.popping ? "pop" : "win") : "",
      h ? "marked" : "", m ? "spot" : ""].join(" ");
    return `<div class="gcCell ${cls}" style="--col:${k % SL_N}; --row:${(k / SL_N) | 0}">${m ? `<b class="gcMult m${Math.min(7, Math.log2(m))}">×${m}</b>` : ""}<img src="${gcPic(s)}" alt=""></div>`;
  }).join("");
  const bet = v ? v.bet : st.bet;
  const shownWin = v ? Math.floor(Math.min(SL_CAP, v.shown) * bet) : (st.last ? st.last.win : 0);
  const lines = v && v.lines ? v.lines.map(l => `<span><img src="${gcPic(l.sym)}" alt=""> ×${l.size}: ${+l.base.toFixed(2)}×${l.mult ? ` × <b class="gcMultTxt">${l.mult}</b>` : ""} = <b>${fmt(Math.floor(l.pay * bet))}</b></span>`).join("") : "";
  const busy = gcBusy || !!st.pending;
  const buyCost = st.bet * SL_BUY, armed = gcBuyArm > Date.now();
  const payRows = SL_SYMBOLS.map((s, i) => `<tr><td><img class="gcPayImg" src="${gcPic(i)}" alt="">${s.name}</td>${[5, 6, 8, 10, 12, 15].map(n => `<td>${+SL_PAY[i][n].toFixed(2)}×</td>`).join("")}</tr>`).join("");
  $("casinoGame").innerHTML = `
    <div class="card gcCard">
      <div class="row"><div><h2 style="margin:0">${casIco(t.id)}${t.title}</h2>
        <div class="muted">Clusters of 5+ touching specimens pay · Bet ${fmt(t.min)} – ${fmt(t.max)} per spin · Max win ${SL_CAP.toLocaleString()}× your bet</div></div>
        <button class="btn ghost small" data-back="1" ${busy ? "disabled" : ""}>← All games</button></div>
      <div class="gcTop">
        <span class="gcLabel">${v && v.label ? `🧪 ${v.label}` : "&nbsp;"}</span>
        <span class="gcWin">Win: <b>${fmt(shownWin)}</b></span>
      </div>
      <div class="gcBoard">
        <div class="gcGrid ${v && v.label ? "bonus" : ""}">${cells}</div>
        ${v && v.banner ? `<div class="gcBanner">${v.banner}</div>` : ""}
      </div>
      <div class="gcLines">${lines || "&nbsp;"}</div>
      <div class="gcActions">
        ${busy ? `<span></span><button class="gcSkipBtn" data-gc="skip">⏩ Skip to the result</button><span></span>`
          : `<div class="gcSide left"><button class="gcBtn gcBuyBtn ${armed ? "armed" : ""}" data-gc="buy" ${state.casinoChips >= buyCost ? "" : "disabled"}
               title="Start the free spins at once for ${SL_BUY}× your bet"><b>${armed ? "Tap again to buy" : "Buy free spins"}</b><small>${fmt(buyCost)} · ${SL_BUY}× bet</small></button></div>
             <button class="gcBtn gcSpinBtn" data-gc="spin" ${state.casinoChips >= st.bet ? "" : "disabled"}><b>SPIN</b><small>${fmt(st.bet)}</small></button>
             <div class="gcSide right"><label class="gcFast"><input type="checkbox" data-gc="fast" ${state.gcFast ? "checked" : ""}> Fast play</label></div>`}
      </div>
      <div class="chipsRow gcChips"><span class="muted">Bet:</span>
        ${t.chips.map(c => `<button class="chip ${c === st.bet ? "selected" : ""}" data-gcbet="${c}" ${busy ? "disabled" : ""}
          style="background:${CHIP_COLORS[c].bg}; color:${CHIP_COLORS[c].text}">${chipLabel(c)}</button>`).join("")}</div>
      <div id="casinoMsg" class="${/won|\+\d/.test(st.msg || "") ? "income" : "flash"}" style="margin-top:8px; text-align:center">${busy ? "" : st.msg || ""}</div>
      <details class="gcRules"><summary>📋 Paytable and rules</summary>
        <p class="muted">Pays are × your bet for a cluster of that many touching specimens (up, down, left or right; not diagonal). Sizes in between pay in between.</p>
        <table class="wikiTable gcPay"><tr><th>Specimen</th>${[5, 6, 8, 10, 12, "15+"].map(n => `<th>${n}</th>`).join("")}</tr>${payRows}</table>
        <ul class="muted">
          <li>Winning specimens pop, the rest fall down and new ones drop in. That can win again in the same spin.</li>
          <li>🔬 <b>Lab spots</b>: a square where a winner popped is marked. The next win popping there makes it ×2, then ×4, ×8 … up to ×128. All spots inside one cluster are <b>added</b> and multiply that cluster's pay.</li>
          <li>Spots reset after every paid spin, but in free spins they stay for the whole bonus.</li>
          <li>${gx("dna")} <b>DNA vials</b>: 3 / 4 / 5 / 6 / 7 vials on the grid when the spin ends give 10 / 12 / 15 / 20 / 30 free spins (more can be won during the bonus).</li>
          <li>🛒 <b>Buy free spins</b> for ${SL_BUY}× your bet: the bonus starts at once (3 vials or more, mostly 10 free spins). A bought bonus also returns about 99%, but it swings a lot: half of them pay less than 15× the bet.</li>
          <li>About 99% return. A spin can win at most ${SL_CAP.toLocaleString()}× your bet.</li>
        </ul></details>
    </div>`;
}

$("casinoGame").addEventListener("click", (e) => {
  if (!GC_TABLES[currentGame] || isPaused()) return;
  const st = state.gc[currentGame];
  const b = e.target.closest("[data-gcbet]");
  if (b && !gcBusy && !st.pending) { st.bet = Number(b.dataset.gcbet); st.msg = ""; renderGeneCascade(); save(); return; }
  const a = e.target.closest("[data-gc]");
  if (!a) return;
  if (a.dataset.gc === "spin" && !a.disabled) { gcBuyArm = 0; gcView = null; st.msg = ""; gcSpin(); }
  if (a.dataset.gc === "buy" && !a.disabled) {
    if (gcBuyArm > Date.now()) { gcBuyArm = 0; gcView = null; st.msg = ""; gcSpin(true); }
    else { gcBuyArm = Date.now() + 4000; renderGeneCascade(); setTimeout(() => { if (gcBuyArm && gcBuyArm <= Date.now() && GC_TABLES[currentGame] && !gcBusy) renderGeneCascade(); }, 4100); }
  }
  if (a.dataset.gc === "skip") gcSkip = true;
});
$("casinoGame").addEventListener("change", (e) => {
  if (!GC_TABLES[currentGame] || !e.target.matches("[data-gc=fast]")) return;
  state.gcFast = e.target.checked; save();
});

// 🔒 a spin that was playing when the page closed: pay it now
document.addEventListener("DOMContentLoaded", () => { for (const id in GC_TABLES) if (state.gc[id].pending) gcSettle(id, true); });
