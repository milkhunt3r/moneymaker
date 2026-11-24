/* Empire of Coins © 2026 milkhunt3r. All rights reserved. */
/* =====================================================================
   🎴 BACCARAT (Punto Banco, standard casino rules, 8-deck shoe). Unlocks at Gambler level 20.
   Bet on which hand ends closer to 9: Player or Banker (or a Tie). Cards: A = 1, 2–9 face value, 10/J/Q/K = 0,
   a hand counts only its last digit (7 + 8 = 15 → 5). Nobody makes decisions: the third-card rules decide.
   Payouts (what you win on top of your bet):
     Player 1:1 · Banker 0.95:1 (5% commission) · Tie 8:1 (on a tie, Player and Banker bets push)
     Player Pair / Banker Pair 11:1 (that hand's first two cards are the same rank)
   Tables: same limits as Blackjack (500 – 50,000 · 50,000 – 5 scoin · 10 – 500 scoin per spot).
   🔒 A round is drawn all at once and saved before the cards are shown: a reload settles it with the same cards.
   ===================================================================== */
const BAC_LEVEL = 20, BAC_DECKS = 8;
const BAC_SPOTS = [
  { k: "pPair", name: "Player Pair", pays: 11, side: true },
  { k: "player", name: "Player", pays: 1 },
  { k: "tie", name: "Tie", pays: 8 },
  { k: "banker", name: "Banker", pays: 0.95 },
  { k: "bPair", name: "Banker Pair", pays: 11, side: true },
];
const bacEmpty = () => ({ pPair: 0, player: 0, tie: 0, banker: 0, bPair: 0 });
function makeBacTable(id, title, min, max, chips) {
  return { id, title, min, max, chips, chip: chips[0], chipFree: false, shoe: [], phase: "betting", busy: false,
           p: [], b: [], shown: 0, result: null, message: "", lastBets: null };
}
const BAC_TABLES = {
  bacLow:   makeBacTable("bacLow",   "Baccarat: Classic table", 500, 50000, [500, 1000, 5000, 10000, 25000, 50000]),
  bacHigh:  makeBacTable("bacHigh",  "Baccarat: High rollers",  50000, 5000000, [50000, 100000, 250000, 500000, 1000000, 5000000]),
  bacSuper: makeBacTable("bacSuper", "Baccarat: Super high rollers", 10000000, 500000000, [10000000, 25000000, 50000000, 100000000, 250000000, 500000000]),
};
let bac = null;
const bacUnlocked = () => levelInfo(state.casinoXp).level >= BAC_LEVEL;

if (!state.bac) state.bac = {};
if (!state.bacRoad) state.bacRoad = {};   // table id -> last results ("P", "B", "T")
for (const id in BAC_TABLES) {
  const s = state.bac[id] || {};
  state.bac[id] = { bets: Object.assign(bacEmpty(), s.bets || {}), inPlay: s.inPlay || 0, round: s.round || null, inBets: s.inBets || null };
}
const bacBets = (t) => state.bac[t.id].bets;
const bacTotal = (b) => Object.values(b).reduce((a, x) => a + x, 0);

// ----- cards -----
function bacShoe() {
  const shoe = [];
  for (let d = 0; d < BAC_DECKS; d++) for (const s of SUITS) for (const r of RANKS) shoe.push({ r, s });
  for (let i = shoe.length - 1; i > 0; i--) { const j = secureRandomInt(i + 1); [shoe[i], shoe[j]] = [shoe[j], shoe[i]]; }
  return shoe;
}
function bacDraw(t) {
  if (t.shoe.length < 52 * BAC_DECKS * 0.15) t.shoe = bacShoe();
  return { ...t.shoe.pop() };
}
const bacVal = (c) => (c.r === "A" ? 1 : ["10", "J", "Q", "K"].includes(c.r) ? 0 : Number(c.r));
const bacPts = (cards) => cards.reduce((a, c) => a + bacVal(c), 0) % 10;
// the whole round, following the standard third-card rules
function bacPlayRound(t) {
  const p = [bacDraw(t)], b = [bacDraw(t)];
  p.push(bacDraw(t)); b.push(bacDraw(t));
  const P = bacPts(p), B = bacPts(b);
  if (P < 8 && B < 8) {   // no natural 8 or 9
    let p3 = null;
    if (P <= 5) { p3 = bacDraw(t); p.push(p3); }
    const bt = B;
    let bankerDraws;
    if (!p3) bankerDraws = bt <= 5;
    else {
      const v = bacVal(p3);
      bankerDraws = bt <= 2 || (bt === 3 && v !== 8) || (bt === 4 && v >= 2 && v <= 7) || (bt === 5 && v >= 4 && v <= 7) || (bt === 6 && (v === 6 || v === 7));
    }
    if (bankerDraws) b.push(bacDraw(t));
  }
  return { p, b };
}
// the order the cards are shown: P1, B1, P2, B2, then the third cards
const bacOrder = (r) => [["p", 0], ["b", 0], ["p", 1], ["b", 1], ...(r.p[2] ? [["p", 2]] : []), ...(r.b[2] ? [["b", 2]] : [])];
const bacDelay = () => (window.BAC_FAST ? 0 : 420);

async function bacDeal() {
  const t = bac, bets = bacBets(t), main = bets.player + bets.banker + bets.tie;
  if (main < t.min) return bacMsg(`Put at least ${fmt(t.min)} on Player, Banker or Tie.`);
  if ((bets.pPair || bets.bPair) && !(bets.player || bets.banker || bets.tie)) return bacMsg("Pair bets need a Player, Banker or Tie bet too.");
  const total = bacTotal(bets);
  state.bac[t.id].inPlay = total;
  state.bac[t.id].inBets = { ...bets };
  t.freeUsed = freeStart(t.id);
  t.lastBets = { ...bets };
  state.bac[t.id].bets = bacEmpty();
  const r = bacPlayRound(t);
  state.bac[t.id].round = r;           // 🔒 saved before anything is shown
  t.p = []; t.b = []; t.result = null; t.message = ""; t.phase = "dealing"; t.busy = true;
  countPlay("bac");
  if (total >= 500000000) state.stats.bac500 = true;
  updateCounter(); save();
  for (const [side, i] of bacOrder(r)) {
    if (currentGame !== t.id) break;   // left the page: settle at once
    t[side].push({ ...r[side][i], fresh: true });
    renderBaccarat(); await new Promise(res => setTimeout(res, bacDelay()));
  }
  bacSettle(t);
}
function bacSettle(t, away = false) {
  const st = state.bac[t.id], r = st.round, bets = st.inBets || bacEmpty();
  if (!r) return;
  t.p = r.p.map(c => ({ ...c })); t.b = r.b.map(c => ({ ...c }));
  const P = bacPts(r.p), B = bacPts(r.b), win = P > B ? "P" : B > P ? "B" : "T";
  const pPair = r.p[0].r === r.p[1].r, bPair = r.b[0].r === r.b[1].r;
  let back = 0;
  if (win === "P") back += bets.player * 2;
  if (win === "B") back += bets.banker * 1.95;
  if (win === "T") back += bets.tie * 9 + bets.player + bets.banker;   // Player / Banker bets push on a tie
  if (pPair) back += bets.pPair * 12;
  if (bPair) back += bets.bPair * 12;
  back = Math.floor(back);
  const total = st.inPlay, lost = Math.max(0, total - back), cashback = lost * cashbackRate();
  state.casinoChips += back + cashback;
  casinoRecord(total, back + cashback);
  freeDone(t.id); t.freeUsed = 0;
  st.inPlay = 0; st.round = null; st.inBets = null;
  const road = state.bacRoad[t.id] = state.bacRoad[t.id] || [];
  road.push(win); if (road.length > 48) road.shift();
  const levelsGained = addXp(total);
  if (win === "T") state.stats.bacTie = (state.stats.bacTie || 0) + 1;
  t.result = { win, P, B, pPair, bPair };
  const net = back - total;
  // 🔥 streak of won hands (a hand is won when it pays back more than was bet; a push keeps the streak)
  if (net > 0) state.stats.bacStreak = (state.stats.bacStreak || 0) + 1;
  else if (net < 0) state.stats.bacStreak = 0;
  state.stats.bacBestStreak = Math.max(state.stats.bacBestStreak || 0, state.stats.bacStreak || 0);
  const who = win === "P" ? `Player wins ${P} to ${B}` : win === "B" ? `Banker wins ${B} to ${P}` : `Tie at ${P}`;
  t.message = `${who}${(r.p.length === 2 && P >= 8) || (r.b.length === 2 && B >= 8) ? " (natural)" : ""}. ` +
    (net > 0 ? `You won ${fmt(net)}!` : net < 0 ? `You lost ${fmt(-net)}.` : "You broke even.") +
    (cashback > 0 ? ` Cashback +${cashback.toLocaleString(undefined, { maximumFractionDigits: 1 })}.` : "") +
    (levelsGained > 0 ? ` 🎉 Level up! Now level ${levelInfo(state.casinoXp).level}.` : "");
  if (away) showNotice(`🎴 Your baccarat hand finished: ${who}. ${net > 0 ? `You won ${fmt(net)}!` : net < 0 ? `You lost ${fmt(-net)}.` : "You broke even."}`);
  t.phase = "betting"; t.busy = false;
  updateCounter(); save();
  if (currentGame === t.id) renderBaccarat();
}
function bacMsg(text) { if (bac) { bac.message = text; renderBaccarat(); } }

function renderBaccarat() {
  const t = bac, betting = t.phase === "betting", bets = betting ? bacBets(t) : (state.bac[t.id].inBets || bacEmpty());
  const slot = `<div class="pcard slot"></div>`;
  const hand = (cards) => cards.map(cardHtml).join("") + slot.repeat(Math.max(0, 2 - cards.length));
  const R = t.result;
  const ptsP = t.p.length ? bacPts(t.p) : "", ptsB = t.b.length ? bacPts(t.b) : "";
  const res = (k) => !betting || !R ? "" : k === "player" ? (R.win === "P" ? "win" : R.win === "T" ? "push" : "lose")
    : k === "banker" ? (R.win === "B" ? "win" : R.win === "T" ? "push" : "lose") : k === "tie" ? (R.win === "T" ? "win" : "lose")
    : k === "pPair" ? (R.pPair ? "win" : "lose") : (R.bPair ? "win" : "lose");
  const lastB = t.lastBets || bacEmpty();
  const showLast = betting && R && !bacTotal(bets);   // just finished: keep the last bets on the felt with their result
  const spots = BAC_SPOTS.map(s => { const amt = showLast ? lastB[s.k] : bets[s.k], was = showLast ? lastB[s.k] : 0;
    return `<div class="bacSpot ${s.k} ${s.side ? "side" : ""} ${amt ? "has" : ""} ${betting ? "click" : ""} ${was ? res(s.k) : ""}" ${betting ? `data-bacspot="${s.k}"` : ""}>
      ${amt ? chipMark(amt) : ""}<b>${s.name}</b><span>${amt ? fmt(amt) : s.pays === 0.95 ? "0.95:1" : s.pays + ":1"}</span></div>`; }).join("");
  const road = (state.bacRoad[t.id] || []).slice(-24).map(x => `<i class="bead ${x}">${x}</i>`).join("");
  const total = bacTotal(bacBets(t)), last = t.lastBets ? bacTotal(t.lastBets) : 0;
  $("casinoGame").innerHTML = `
    <div class="card">
      <div class="row"><div><h2 style="margin:0">${casIco(currentGame)}${t.title}</h2>
        <div class="muted">Bet on the hand that gets closest to 9 · ${fmt(t.min)} – ${fmt(t.max)} per spot · 8-deck shoe</div></div>
        <button class="btn ghost small" data-back="1" ${betting && !t.busy ? "" : "disabled"}>← All games</button></div>
      <div class="bacRoad"><span class="muted">Last results:</span>${road || `<span class="muted">none yet</span>`}</div>
      <div class="bjFelt bacFelt">
        <div class="bacHands">
          <div class="bacHand ${R && betting && R.win === "P" ? "won" : ""}"><div class="bjLabel">PLAYER</div><div class="cardsRow">${hand(t.p)}</div><div class="bacPts">${ptsP !== "" ? ptsP : ""}</div></div>
          <div class="bacHand ${R && betting && R.win === "B" ? "won" : ""}"><div class="bjLabel">BANKER</div><div class="cardsRow">${hand(t.b)}</div><div class="bacPts">${ptsB !== "" ? ptsB : ""}</div></div>
        </div>
        <div class="bacSpots">${spots}</div>
      </div>
      ${betting ? `<div class="chipsRow">
        <span class="muted">Chip:</span>
        ${t.chips.map(v => `<button class="chip ${v === t.chip && !t.chipFree ? "selected" : ""}" data-bacchip="${v}"
             style="background:${CHIP_COLORS[v].bg}; color:${CHIP_COLORS[v].text}">${chipLabel(v)}</button>`).join("")}
        <span class="muted">Pick a chip, then click a betting spot.</span>
      </div>${freeChipRow(t, t.chipFree)}` : ""}
      <div class="bjActions">${betting ? `
        <button class="btn" data-bac="deal" ${bacBets(t).player + bacBets(t).banker + bacBets(t).tie >= t.min && !t.busy ? "" : "disabled"}>🎴 Deal (bet ${fmt(total)})</button>
        <button class="btn ghost" data-bac="clear" ${total || t.result ? "" : "disabled"}>Clear bets</button>
        <button class="btn ghost" data-bac="rebet" ${last && !total ? "" : "disabled"}>↺ Repeat last bets${last ? " (" + fmt(last) + ")" : ""}</button>`
        : `<span class="muted" style="align-self:center">Dealing...</span>`}</div>
      <div id="casinoMsg" class="${/won|broke even/.test(t.message) ? "income" : "flash"}" style="margin-top:10px; text-align:center">${t.message}</div>
      <div class="muted" style="margin-top:6px; text-align:center">A = 1 · 10, J, Q, K = 0 · only the last digit counts · Banker wins pay 0.95:1 (5% commission) · On a Tie, Player and Banker bets are returned · The third card is drawn by the standard rules</div>
    </div>`;
  t.p.forEach(c => c.fresh = false); t.b.forEach(c => c.fresh = false);
}

$("casinoGame").addEventListener("click", (e) => {
  if (!BAC_TABLES[currentGame] || isPaused()) return;
  const t = bac;
  const chip = e.target.closest("[data-bacchip]");
  if (chip) { t.chip = Number(chip.dataset.bacchip); t.chipFree = false; renderBaccarat(); return; }
  const fchip = e.target.closest("[data-freechip]");
  if (fchip) { t.chip = Number(fchip.dataset.freechip); t.chipFree = true; renderBaccarat(); return; }
  const sp = e.target.closest("[data-bacspot]");
  if (sp && t.phase === "betting" && !t.busy) {
    const k = sp.dataset.bacspot, bets = bacBets(t), v = t.chip;
    if (bets[k] + v > t.max) return bacMsg("Table limit: " + fmt(t.max) + " per spot.");
    if (t.chipFree) { if (!freeTake(t.id, v)) return bacMsg("No free chips of that kind left."); }
    else { if (purse(t.id) < v) return bacMsg(`Not enough ${purseName(t.id)}.`); payFrom(t.id, v); }
    bets[k] += v; t.message = ""; t.result = null; t.p = []; t.b = [];
    updateCounter(); renderBaccarat(); save();
    return;
  }
  const btn = e.target.closest("[data-bac]");
  if (!btn || btn.disabled) return;
  const a = btn.dataset.bac;
  if (a === "deal" && t.phase === "betting" && !t.busy) bacDeal();
  if (a === "clear" && t.phase === "betting") {
    refundTo(t.id, bacTotal(bacBets(t)) - freeReturn(t.id));
    state.bac[t.id].bets = bacEmpty(); t.message = "";
    t.result = null; t.p = []; t.b = [];   // also empties the felt after a finished hand
    updateCounter(); renderBaccarat(); save();
  }
  if (a === "rebet" && t.phase === "betting" && t.lastBets) {
    const need = bacTotal(t.lastBets);
    const fr = freeRebet(t.id, need), rest = need - fr.covered;
    if (purse(t.id) < rest) { fr.undo(); return bacMsg(`Not enough ${purseName(t.id)} to repeat (${fmt(rest)} needed).`); }
    payFrom(t.id, rest); state.bac[t.id].bets = { ...t.lastBets };
    t.message = ""; t.result = null; t.p = []; t.b = []; updateCounter(); renderBaccarat(); save();
  }
});

// 🔒 a hand that was being dealt when the page closed: settle it now with its saved cards
document.addEventListener("DOMContentLoaded", () => {
  for (const id in BAC_TABLES) if (state.bac[id].round) bacSettle(BAC_TABLES[id], true);
});
