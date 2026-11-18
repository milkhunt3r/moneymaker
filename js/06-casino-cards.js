/* =====================================================================
   BLACKJACK
   Rules: 6-deck shoe, dealer stands on soft 17, blackjack pays 3:2,
   double on any first two cards, one split per seat (split aces get one card each),
   dealer checks for blackjack when showing an Ace or a 10. Play 1 to 3 seats.
   ===================================================================== */
const BJ_DECKS = 6;
const SUITS = ["♠", "♥", "♦", "♣"];
const RANKS = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];

function makeBjTable(id, title, emoji, min, max, chips) {
  return { id, title, emoji, min, max, chips, chip: chips[0],
           shoe: [], phase: "betting", hands: [], dealer: [], active: -1, busy: false,
           lastBets: [0, 0, 0], message: "" };
}
const BJ_TABLES = {
  bjLow:  makeBjTable("bjLow",  "Blackjack: Classic table", "🃏", 500, 50000, [500, 1000, 5000, 10000, 25000, 50000]),
  bjHigh: makeBjTable("bjHigh", "Blackjack: High rollers",  "♠️", 50000, 5000000, [50000, 100000, 250000, 500000, 1000000, 5000000]),
  bjSuper: makeBjTable("bjSuper", "Blackjack: Super high rollers", "💎♠️", 10000000, 500000000, [10000000, 25000000, 50000000, 100000000, 250000000, 500000000]),
};
let bj = null;   // the blackjack table you are looking at

/* 🔒 A hand in play is SAVED (cards, shoe, decisions): a reload puts you back at the same table with the same cards,
   so refreshing can't undo a bad hand. (Only a very old save with no hand stored gets its bet back.) */
const CARD_ROUND_KEYS = ["phase", "hands", "dealer", "active", "shoe", "deck", "cards", "held", "board", "street", "insurance", "insAsked",
  "drawQueue", "freeUsed", "lastBets", "message", "result", "jackpotWon", "dealerHand"];
let cardResume = null;   // { kind, id }: the table whose hand was restored, resumed once every script has loaded
function restoreRound(kind, tables, saved, id) {
  const r = saved.round;
  if (!(saved.inPlay > 0)) { freeReturn(id, "inPlay"); return false; }
  if (!r || !r.phase || r.phase === "betting") { refundTo(id, Math.max(0, saved.inPlay - freeReturn(id, "inPlay"))); return false; }
  const t = tables[id];
  CARD_ROUND_KEYS.forEach(k => { if (k in r) t[k] = r[k]; });
  t.busy = false;
  const unfresh = (list) => (list || []).forEach(c => { if (c) c.fresh = false; });
  unfresh(t.dealer); unfresh(t.cards); unfresh(t.board); (t.hands || []).forEach(h => unfresh(h.cards));
  cardResume = { kind, id };
  return true;
}
if (!state.bj) state.bj = {};
for (const id in BJ_TABLES) {
  const saved = state.bj[id] || {};
  const kept = restoreRound("bj", BJ_TABLES, saved, id);
  state.bj[id] = { bets: saved.bets || [0, 0, 0], inPlay: kept ? saved.inPlay : 0, round: kept ? BJ_TABLES[id] : null };
}
const seatBets = (t) => state.bj[t.id].bets;

// ----- Cards -----
function newShoe() {
  const shoe = [];
  for (let d = 0; d < BJ_DECKS; d++) for (const s of SUITS) for (const r of RANKS) shoe.push({ r, s });
  for (let i = shoe.length - 1; i > 0; i--) {            // Fisher-Yates shuffle with crypto randomness
    const j = secureRandomInt(i + 1);
    [shoe[i], shoe[j]] = [shoe[j], shoe[i]];
  }
  return shoe;
}
function draw(t) {
  if (t.shoe.length < 52 * BJ_DECKS * 0.25) {
    if (t.shoe.length > 0) t.message = "🔀 New shoe shuffled.";   // not on the very first deal
    t.shoe = newShoe();
  }
  const c = t.shoe.pop();
  c.fresh = true;   // animate it the first time it is drawn
  return c;
}
const cardValue = (c) => c.r === "A" ? 11 : ["J", "Q", "K", "10"].includes(c.r) ? 10 : Number(c.r);

function handValue(cards) {
  let total = 0, aces = 0;
  for (const c of cards) { total += cardValue(c); if (c.r === "A") aces++; }
  while (total > 21 && aces > 0) { total -= 10; aces--; }
  return { total, soft: aces > 0 };
}
const isBlackjack = (h) => h.cards.length === 2 && handValue(h.cards).total === 21 && !h.fromSplit;

// ----- Round flow -----
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
const bjDelay = () => (window.BJ_FAST ? 0 : 380);

async function bjDeal() {
  const t = bj;
  const bets = seatBets(t);
  if (bets.every(b => b === 0)) return bjMsg("Click a seat to place a bet first.");
  t.busy = true;
  t.phase = "dealing";
  t.lastBets = [...bets];
  t.message = "";
  state.bj[t.id].inPlay = bets.reduce((a, b) => a + b, 0);   // free chips included; on a reload they go back as free chips
  freeStart(t.id);
  t.hands = [];
  bets.forEach((b, seat) => { if (b > 0) t.hands.push({ seat, bet: b, cards: [], done: false, result: null }); });
  if (bets.some(b => b >= 500000000)) state.stats.bj500 = true;
  countPlay("blackjack", t.hands.length);   // one game per seat with a bet (splits don't add games)
  state.bj[t.id].bets = [0, 0, 0];
  t.dealer = []; t.insurance = 0; t.insAsked = false;
  state.bj[t.id].round = t;   // 🔒 the hand is saved with the game
  save();
  await bjFinishDeal(t);
}
// Deals the cards still missing (all of them for a new hand, the rest after a reload), then insurance and the blackjack peek
async function bjFinishDeal(t) {
  t.busy = true; t.phase = "dealing";
  // two rounds of cards: each hand, then the dealer (2nd dealer card face down)
  for (let round = 0; round < 2; round++) {
    for (const h of t.hands) if (h.cards.length <= round) { h.cards.push(draw(t)); renderBlackjack(); await sleep(bjDelay()); }
    if (t.dealer.length <= round) { const c = draw(t); if (round === 1) c.hidden = true; t.dealer.push(c); renderBlackjack(); await sleep(bjDelay()); }
  }

  // Dealer shows an Ace: offer insurance before checking for blackjack
  const up = t.dealer[0];
  if (up.r === "A" && !t.insAsked) {
    t.phase = "insurance";
    t.busy = false;
    renderBlackjack();
    const take = await new Promise(resolve => { t.insuranceResolve = resolve; });
    t.insuranceResolve = null;
    t.busy = true; t.insAsked = true;
    if (take) {
      const cost = insuranceCost(t);
      payFrom(t.id, cost);
      state.bj[t.id].inPlay += cost;
      t.insurance = cost;
    }
    updateCounter(); save();
  }

  // Dealer peeks for blackjack when showing an Ace or a 10
  if (cardValue(up) >= 10 && handValue(t.dealer).total === 21) {
    t.dealer[1].hidden = false;
    t.message = "Dealer has blackjack!";
    t.hands.forEach(h => h.done = true);
    await bjSettle(t);
    return;
  }

  t.hands.forEach(h => { if (handValue(h.cards).total === 21) h.done = true; });  // blackjacks stand
  t.phase = "playing";
  t.busy = false;
  bjNextHand(t);
}

// Insurance costs half of all your bets and pays 2:1 if the dealer has blackjack
const insuranceCost = (t) => t.hands.reduce((a, h) => a + h.bet, 0) / 2;
const bjCanSurrender = (t) => {
  const h = t.hands[t.active];
  return h && h.cards.length === 2 && !h.fromSplit;
};

// Move to the next hand that still needs a decision, or let the dealer play
function bjNextHand(t) {
  t.active = t.hands.findIndex(h => !h.done);
  if (t.active === -1) { bjDealerPlays(t); return; }
  renderBlackjack();
}

function bjCanDouble(t) {
  const h = t.hands[t.active];
  return h && h.cards.length === 2 && !h.splitAces && purse(t.id) >= h.bet;
}
function bjCanSplit(t) {
  const h = t.hands[t.active];
  if (!h || h.cards.length !== 2 || h.fromSplit) return false;
  const handsInSeat = t.hands.filter(x => x.seat === h.seat).length;
  return handsInSeat === 1 && cardValue(h.cards[0]) === cardValue(h.cards[1]) && purse(t.id) >= h.bet;
}

async function bjAction(action) {
  const t = bj;
  if (t.phase !== "playing" || t.busy) return;
  const h = t.hands[t.active];
  if (!h) return;
  t.busy = true;

  if (action === "hit") {
    h.cards.push(draw(t));
    if (handValue(h.cards).total >= 21) h.done = true;
  }
  if (action === "stand") h.done = true;
  if (action === "surrender" && bjCanSurrender(t)) { h.surrendered = true; h.done = true; }
  if (action === "double" && bjCanDouble(t)) {
    payFrom(t.id, h.bet);
    state.bj[t.id].inPlay += h.bet;
    h.bet *= 2;
    h.doubled = true;
    h.cards.push(draw(t));
    h.done = true;
  }
  if (action === "split" && bjCanSplit(t)) {
    payFrom(t.id, h.bet);
    state.bj[t.id].inPlay += h.bet;
    const second = { seat: h.seat, bet: h.bet, cards: [h.cards.pop()], done: false, result: null, fromSplit: true };
    h.fromSplit = true;
    t.hands.splice(t.active + 1, 0, second);
    renderBlackjack(); await sleep(bjDelay());
    h.cards.push(draw(t)); renderBlackjack(); await sleep(bjDelay());
    second.cards.push(draw(t));
    if (h.cards[0].r === "A") {           // split aces: one card each, then stand
      h.splitAces = second.splitAces = true;
      h.done = second.done = true;
    }
    if (handValue(h.cards).total === 21) h.done = true;
    if (handValue(second.cards).total === 21) second.done = true;
  }

  updateCounter(); save();
  renderBlackjack();
  await sleep(bjDelay() / 2);
  t.busy = false;
  if (h.done) bjNextHand(t); else renderBlackjack();
}

async function bjDealerPlays(t) {
  t.phase = "dealer";
  t.busy = true;
  t.active = -1;
  t.dealer[1].hidden = false;
  t.dealer[1].fresh = true;
  renderBlackjack(); await sleep(bjDelay() * 1.5);

  // The dealer only draws if at least one hand is still in the game
  const someoneAlive = t.hands.some(h => handValue(h.cards).total <= 21 && !isBlackjack(h) && !h.surrendered);
  if (someoneAlive) {
    while (handValue(t.dealer).total < 17) {            // stands on all 17s, including soft 17
      t.dealer.push(draw(t)); renderBlackjack(); await sleep(bjDelay() * 1.5);
    }
  }
  await bjSettle(t);
}

// Pay out every hand: returns bet + winnings
function bjPayout(hand, dealerCards) {
  const p = handValue(hand.cards).total, d = handValue(dealerCards).total;
  const dealerBJ = dealerCards.length === 2 && d === 21;
  if (hand.surrendered) return { result: "Surrendered", back: hand.bet / 2 };   // half the bet back
  if (p > 21) return { result: "Bust", back: 0 };
  if (isBlackjack(hand) && !dealerBJ) return { result: "Blackjack!", back: hand.bet * 2.5 };
  if (dealerBJ && !isBlackjack(hand)) return { result: "Lose", back: 0 };
  if (isBlackjack(hand) && dealerBJ) return { result: "Push", back: hand.bet };
  if (d > 21 || p > d) return { result: "Win", back: hand.bet * 2 };
  if (p === d) return { result: "Push", back: hand.bet };
  return { result: "Lose", back: 0 };
}

async function bjSettle(t) {
  let wagered = 0, back = 0, lost = 0;
  for (const h of t.hands) {
    const r = bjPayout(h, t.dealer);
    if (r.back > h.bet) state.stats.bjWins = (state.stats.bjWins || 0) + 1;
    h.result = r.result; h.back = r.back;
    wagered += h.bet; back += r.back;
    if (r.back < h.bet) lost += h.bet - r.back;    // lost part (a surrender loses half)
  }

  // Insurance: pays 2:1 (you get 3x the insurance back) if the dealer has blackjack
  let insuranceText = "";
  if (t.insurance > 0) {
    const dealerBJ = t.dealer.length === 2 && handValue(t.dealer).total === 21;
    wagered += t.insurance;
    if (dealerBJ) { back += t.insurance * 3; insuranceText = `🛡️ Insurance paid ${fmt(t.insurance * 2)}!`; }
    else { lost += t.insurance; insuranceText = `🛡️ Insurance lost (${fmt(t.insurance)}).`; }
    t.insurance = 0;
  }
  const cashback = lost * cashbackRate();     // level cashback on lost hands
  state.casinoChips += back + cashback;
  casinoRecord(wagered, back + cashback);
  state.bj[t.id].inPlay = 0; state.bj[t.id].round = null;
  freeDone(t.id);
  const levelsGained = addXp(wagered);         // XP = bet × game multiplier (doubles and splits count)

  const net = back - wagered;
  t.message = (t.message ? t.message + " " : "") + (insuranceText ? insuranceText + " " : "") +
    (net > 0 ? `You won ${fmt(net)}!` : net < 0 ? `You lost ${fmt(-net)}.` : "Your money back (push).") +
    (cashback > 0 ? ` Cashback +${cashback.toLocaleString(undefined, { maximumFractionDigits: 1 })}.` : "") +
    (levelsGained > 0 ? ` 🎉 Level up! Now level ${levelInfo(state.casinoXp).level}.` : "");
  t.phase = "betting";
  t.busy = false;
  updateCounter(); save();
  renderBlackjack();
}

// ▶ after a reload: carry on exactly where the hand stopped
function bjResume(t) {
  if (t.phase === "dealing" || t.phase === "insurance") return bjFinishDeal(t);
  if (t.phase === "dealer") return bjDealerPlays(t);
  // playing: a split that was still being dealt gets its missing card
  for (const h of t.hands) if (h.fromSplit && h.cards.length < 2) {
    h.cards.push(draw(t));
    if (h.cards[0].r === "A") { h.splitAces = true; h.done = true; }
    if (handValue(h.cards).total === 21) h.done = true;
  }
  t.phase = "playing"; t.busy = false;
  bjNextHand(t);
}
function bjMsg(text) { if (bj) { bj.message = text; renderBlackjack(); } }

// ----- Drawing the table -----
/* 🃏 Card pictures (assets/cards/): one picture per card, e.g. "Qh.webp", plus "joker.webp" and "back.webp".
   The picture is the card's background; the card's name is kept for screen readers. */
const SUIT_FILE = { "♠": "s", "♥": "h", "♦": "d", "♣": "c" };
const SUIT_NAME = { "♠": "spades", "♥": "hearts", "♦": "diamonds", "♣": "clubs" };
const RANK_NAME = { A: "Ace", J: "Jack", Q: "Queen", K: "King" };
// the deck in use: the equipped 🃏 Cards cosmetic, or the default fox deck
const DECK_DIRS = { snakeCards: "cards-snake", wowCards: "cards-wow", rainCards: "cards-rain", aheadCards: "cards-ahead", royalCards: "cards-royal", emperorCards: "cards-emperor" };
function deckDir() {
  const on = state.cosmetics && state.cosmetics.on || {};
  const id = Object.keys(DECK_DIRS).find(k => on[k]);
  return "assets/" + (id ? DECK_DIRS[id] : "cards");
}
const cardSrc = (c) => `${deckDir()}/${c.joker ? "joker" : c.r + SUIT_FILE[c.s]}.webp`;
const cardName = (c) => c.joker ? "Joker" : `${RANK_NAME[c.r] || c.r} of ${SUIT_NAME[c.s]}`;
function cardFace(c, extraCls = "", extraAttr = "") {
  return `<div class="pcard face ${extraCls}" ${extraAttr} role="img" aria-label="${cardName(c)}" style="background-image:url('${cardSrc(c)}')"></div>`;
}
// load every card picture once, so cards appear instantly when dealt
setTimeout(() => {
  const all = ["joker", "back"];
  for (const s of Object.values(SUIT_FILE)) for (const r of ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"]) all.push(r + s);
  all.forEach(n => { const im = new Image(); im.src = `${deckDir()}/${n}.webp`; });
}, 1500);
function applyDeck() {   // card backs follow the deck; preload the new deck's pictures
  // full address: a relative path inside a CSS variable would be read from the css/ folder
  document.documentElement.style.setProperty("--card-back", `url("${new URL(deckDir() + "/back.webp", document.baseURI).href}")`);
}
function cardHtml(c) {
  if (c.hidden) return `<div class="pcard back ${c.fresh ? "deal" : ""}" role="img" aria-label="Face-down card"></div>`;
  return cardFace(c, c.fresh ? "deal" : "");
}
function totalHtml(cards, fromSplit = false) {
  const visible = cards.filter(c => !c.hidden);
  if (!visible.length) return "";
  const v = handValue(visible);
  const label = v.soft && v.total < 21 ? `${v.total - 10} / ${v.total}` : v.total;
  const bjack = !fromSplit && cards.length === 2 && v.total === 21 && !cards.some(c => c.hidden);
  return `<span class="bjTotal">${bjack ? "Blackjack" : label}</span>`;
}

function renderBlackjack() {
  const t = bj;
  const betting = t.phase === "betting";
  const bets = seatBets(t);

  const seats = [0, 1, 2].map(seat => {
    const hands = t.hands.map((h, i) => ({ h, i })).filter(x => x.h.seat === seat);
    let inner = "";
    if (betting && (bets[seat] > 0 || hands.length === 0)) {
      // betting view: show the chip on the seat (or an empty spot)
      inner = bets[seat] > 0 ? chipMark(bets[seat]) + `<div class="muted">${fmt(bets[seat])}</div>`
                             : `<div class="muted" style="margin-top:30px">Click to bet</div>`;
      if (hands.length && bets[seat] === 0) inner = "";
    }
    if (!(betting && bets[seat] > 0)) {
      inner += hands.map(({ h, i }) => {
        const resCls = !h.result ? "" : h.back > h.bet ? "win" : h.back > 0 ? "push" : "lose";
        return `<div class="bjHand ${i === t.active ? "active" : ""}">
                  <div class="cardsRow">${h.cards.map(cardHtml).join("")}</div>
                  ${totalHtml(h.cards, h.fromSplit)}
                  <div class="muted">Bet ${fmt(h.bet)}${h.doubled ? " (doubled)" : ""}</div>
                  ${h.result ? `<div class="bjResult ${resCls}">${h.result}${h.back > h.bet ? " +" + fmt(h.back - h.bet) : ""}</div>` : ""}
                </div>`;
      }).join("");
      if (betting && hands.length === 0 && bets[seat] === 0) inner = `<div class="muted" style="margin-top:30px">Click to bet</div>`;
    }
    return `<div class="bjSeat ${betting ? "" : "locked"}" data-seat="${seat}">
              <div class="seatName">Seat ${seat + 1}</div>${inner}</div>`;
  }).join("");

  const total = bets.reduce((a, b) => a + b, 0);
  const lastTotal = t.lastBets.reduce((a, b) => a + b, 0);
  let actions;
  if (betting) {
    actions = `
      <button class="btn" data-bj="deal" ${total === 0 ? "disabled" : ""}>🃏 Deal (bet ${fmt(total)})</button>
      <button class="btn ghost" data-bj="clear" ${total === 0 ? "disabled" : ""}>Clear bets</button>
      <button class="btn ghost" data-bj="rebet" ${lastTotal === 0 ? "disabled" : ""}>↺ Repeat last bets</button>`;
  } else if (t.phase === "insurance") {
    const cost = insuranceCost(t);
    actions = `
      <span class="muted" style="align-self:center">Dealer shows an Ace. Insurance pays 2:1 if the dealer has blackjack.</span>
      <button class="btn" data-bj="insYes" ${purse(t.id) >= cost ? "" : "disabled"}>🛡️ Take insurance (${fmt(cost)})</button>
      <button class="btn ghost" data-bj="insNo">No insurance</button>`;
  } else {
    const playing = t.phase === "playing" && !t.busy;
    actions = `
      <button class="btn" data-bj="hit" ${playing ? "" : "disabled"}>Hit</button>
      <button class="btn" data-bj="stand" ${playing ? "" : "disabled"}>Stand</button>
      <button class="btn ghost" data-bj="double" ${playing && bjCanDouble(t) ? "" : "disabled"}>Double</button>
      <button class="btn ghost" data-bj="split" ${playing && bjCanSplit(t) ? "" : "disabled"}>Split</button>
      <button class="btn ghost" data-bj="surrender" ${playing && bjCanSurrender(t) ? "" : "disabled"}>🏳️ Surrender</button>`;
  }

  $("casinoGame").innerHTML = `
    <div class="card">
      <div class="row"><div><h2 style="margin:0">${casIco(currentGame)}${t.title}</h2>
        <div class="muted">Limits per hand: ${fmt(t.min)} – ${fmt(t.max)} · Blackjack pays 3:2 · Dealer stands on 17</div></div>
        <button class="btn ghost small" data-back="1" ${betting ? "" : "disabled"}>← All games</button></div>

      <div class="bjFelt">
        <div class="bjDealer">
          <div class="bjLabel">Dealer</div>
          <div class="cardsRow">${t.dealer.map(cardHtml).join("")}</div>
          ${totalHtml(t.dealer)}
        </div>
        <div class="bjSeats">${seats}</div>
      </div>

      <div class="chipsRow">
        <span class="muted">Chip:</span>
        ${t.chips.map(v => `<button class="chip ${v === t.chip && !t.chipFree ? "selected" : ""}" data-bjchip="${v}"
             style="background:${CHIP_COLORS[v].bg}; color:${CHIP_COLORS[v].text}">${chipLabel(v)}</button>`).join("")}
        <span class="muted">Click a seat to add the chip. Play up to 3 seats.</span>
      </div>
      ${freeChipRow(t, t.chipFree)}
      <div class="bjActions">${actions}</div>
      <div id="casinoMsg" class="${/won|money back/.test(t.message) ? "income" : "flash"}" style="margin-top:10px; text-align:center">${t.message}</div>
      <div class="muted" style="margin-top:6px; text-align:center">Double on any first two cards · Split once per seat (split aces get one card) · Surrender a first-two-card hand for half your bet back · Insurance pays 2:1 when the dealer shows an Ace</div>
    </div>`;

  // cards only animate the first time they appear
  t.dealer.forEach(c => c.fresh = false);
  t.hands.forEach(h => h.cards.forEach(c => c.fresh = false));
}

// ----- Clicks on the blackjack table -----
$("casinoGame").addEventListener("click", (e) => {
  if (!BJ_TABLES[currentGame] || isPaused()) return;
  const t = bj;

  const chip = e.target.closest("[data-bjchip]");
  if (chip) { t.chip = Number(chip.dataset.bjchip); t.chipFree = false; renderBlackjack(); return; }
  const fchip = e.target.closest("[data-freechip]");
  if (fchip) { t.chip = Number(fchip.dataset.freechip); t.chipFree = true; renderBlackjack(); return; }

  const seat = e.target.closest("[data-seat]");
  if (seat && t.phase === "betting" && !t.busy) {
    const i = Number(seat.dataset.seat);
    const bets = seatBets(t);
    if (bets.every(b => b === 0)) { t.hands = []; t.dealer = []; }   // clear the last round from the table
    if (bets[i] + t.chip > t.max) return bjMsg("Table limit: max " + fmt(t.max) + " per hand.");
    if (t.chipFree) {
      if (!freeTake(t.id, t.chip)) { t.chipFree = false; renderBlackjack(); return bjMsg("No free chips of that kind left."); }
    } else {
      if (purse(t.id) < t.chip) return bjMsg(`Not enough ${purseName(t.id)}.`);
      payFrom(t.id, t.chip);
    }
    bets[i] += t.chip;
    t.message = "";
    updateCounter(); renderBlackjack(); save();
    return;
  }

  const btn = e.target.closest("[data-bj]");
  if (!btn || btn.disabled) return;
  const a = btn.dataset.bj;
  if (a === "deal") bjDeal();
  if (a === "clear") {
    const bets = seatBets(t);
    refundTo(t.id, bets.reduce((x, y) => x + y, 0) - freeReturn(t.id));
    state.bj[t.id].bets = [0, 0, 0];
    updateCounter(); renderBlackjack(); save();
  }
  if (a === "rebet") {
    const need = t.lastBets.reduce((x, y) => x + y, 0);
    const bets = seatBets(t);
    if (t.lastBets.some((b, i) => bets[i] + b > t.max)) return bjMsg("Table limit: max " + fmt(t.max) + " per hand.");
    if (purse(t.id) < need) return bjMsg(`Not enough ${purseName(t.id)} to repeat (` + fmt(need) + " needed).");
    payFrom(t.id, need);
    t.lastBets.forEach((b, i) => bets[i] += b);
    t.hands = []; t.dealer = []; t.message = "";
    updateCounter(); renderBlackjack(); save();
  }
  if (["hit", "stand", "double", "split", "surrender"].includes(a)) bjAction(a);
  if ((a === "insYes" || a === "insNo") && t.insuranceResolve) t.insuranceResolve(a === "insYes");
});

/* =====================================================================
   VIDEO POKER: Jacks or Better with one joker (53 cards)
   You get 5 cards, choose which to hold, then draw new cards for the rest.
   The joker is wild: it becomes whatever card makes the best hand.
   Paytable (total paid back for a bet of 1). With perfect play it returns about 97.3%,
   about 98.1% including the jackpot (checked with an exact optimal-strategy solver).
   JACKPOT = 50 x the table's max bet. Royal Flush wins 100% of it, any Straight Flush
   (incl. a wild royal) wins 20%. Your share is your bet / max bet, paid on top of the normal win.
   ===================================================================== */
// Hand categories, weakest to strongest
const VP_HANDS = [
  { name: "Nothing",          pays: 0 },
  { name: "Jacks or Better",  pays: 1 },
  { name: "Two Pair",         pays: 1 },
  { name: "Three of a Kind",  pays: 2 },
  { name: "Straight",         pays: 3 },
  { name: "Flush",            pays: 4 },
  { name: "Full House",       pays: 5 },
  { name: "Four of a Kind",   pays: 15 },
  { name: "Straight Flush",   pays: 40,  jackpot: 0.2 },
  { name: "Wild Royal Flush", pays: 80,  jackpot: 0.2 },
  { name: "Five of a Kind",   pays: 100 },
  { name: "Royal Flush",      pays: 250, jackpot: 1 },
];
const VP_JACKPOT_X = 50;
const VP_RANK = { "2": 0, "3": 1, "4": 2, "5": 3, "6": 4, "7": 5, "8": 6, "9": 7, "10": 8, "J": 9, "Q": 10, "K": 11, "A": 12 };

// Scores 5 cards given as rank numbers (0 = 2 ... 12 = Ace) and suit numbers. Returns a VP_HANDS index.
function vpEval5(r, s) {
  const cnt = new Array(13).fill(0);
  r.forEach(x => cnt[x]++);
  const flush = s.every(x => x === s[0]);
  let mx = 0, pairs = 0, trips = false, hiPair = false;
  for (let i = 0; i < 13; i++) {
    if (cnt[i] > mx) mx = cnt[i];
    if (cnt[i] === 2) { pairs++; if (i >= 9) hiPair = true; }
    if (cnt[i] === 3) trips = true;
  }
  if (mx === 5) return 10;
  let straight = false, royal = false;
  if (mx === 1) {
    const lo = cnt.findIndex(x => x), hi = 12 - [...cnt].reverse().findIndex(x => x);
    if (hi - lo === 4) straight = true;
    if (cnt[12] && cnt[0] && cnt[1] && cnt[2] && cnt[3]) straight = true;   // A-2-3-4-5
    if (lo === 8 && hi === 12) royal = true;
  }
  if (straight && flush) return royal ? 11 : 8;
  if (mx === 4) return 7;
  if (trips && pairs) return 6;
  if (flush) return 5;
  if (straight) return 4;
  if (trips) return 3;
  if (pairs === 2) return 2;
  if (hiPair) return 1;
  return 0;
}
// Best hand for 5 cards ({ r, s } or { joker: true }). The joker tries all 52 cards.
function vpScore(cards) {
  const r = [], s = [];
  let j = -1;
  cards.forEach((c, i) => {
    if (c.joker) { j = i; r.push(0); s.push(0); }
    else { r.push(VP_RANK[c.r]); s.push(SUITS.indexOf(c.s)); }
  });
  if (j < 0) return vpEval5(r, s);
  let best = 0;
  for (let x = 0; x < 52; x++) {
    r[j] = x >> 2; s[j] = x & 3;
    let v = vpEval5(r, s);
    if (v === 11) v = 9;   // a royal with the joker is a wild royal
    if (v > best) best = v;
  }
  return best;
}

function makeVpTable(id, title, emoji, min, max, chips) {
  return { id, title, emoji, min, max, chips, jackpot: VP_JACKPOT_X * max,
           phase: "betting", deck: [], cards: [], held: [false, false, false, false, false],
           result: null, busy: false, message: "", jackpotWon: false };
}
const VP_TABLES = {
  vpLow:   makeVpTable("vpLow",   "Video Poker: Classic table", "🎴", 500, 50000, [500, 1000, 5000, 10000, 25000, 50000]),
  vpHigh:  makeVpTable("vpHigh",  "Video Poker: High rollers",  "🎴💎", 50000, 5000000, [50000, 100000, 250000, 500000, 1000000, 5000000]),
  vpSuper: makeVpTable("vpSuper", "Video Poker: Super high rollers", "🎴💎💎", 10000000, 500000000, [10000000, 25000000, 50000000, 100000000, 250000000, 500000000]),
};
let vp = null;   // the video poker table you are looking at

// The bet you set is remembered. A hand in play is saved and restored on a reload (see restoreRound).
if (!state.vp) state.vp = {};
for (const id in VP_TABLES) {
  const saved = state.vp[id] || {};
  const kept = restoreRound("vp", VP_TABLES, saved, id);
  state.vp[id] = { bet: saved.bet || 0, lastBet: saved.lastBet || 0, inPlay: kept ? saved.inPlay : 0, round: kept ? VP_TABLES[id] : null };
}
const vpBet = (t) => state.vp[t.id].bet;
const vpJackpotShare = (t, bet) => t.jackpot * bet / t.max;   // what a 100% jackpot pays for this bet

function vpDeck() {
  const deck = [{ joker: true }];
  for (const s of SUITS) for (const r of RANKS) deck.push({ r, s });
  for (let i = deck.length - 1; i > 0; i--) { const j = secureRandomInt(i + 1); [deck[i], deck[j]] = [deck[j], deck[i]]; }
  return deck;
}
const vpDelay = () => (window.VP_FAST ? 0 : 110);

async function vpDeal() {
  const t = vp, bet = vpBet(t);
  if (bet < t.min || bet > t.max) return vpMsg(`Bet must be between ${fmt(t.min)} and ${fmt(t.max)}.`);
  const freePart = freePlacedSum(t.id);   // free chips in the bet are already off your inventory
  if (purse(t.id) < bet - freePart) return vpMsg(`Not enough ${purseName(t.id)}.`);
  payFrom(t.id, bet - freePart);
  freeStart(t.id);
  t.freeUsed = freePart;
  state.vp[t.id].inPlay = bet;
  if (bet >= 500000000) state.stats.vp500 = true;
  countPlay("vp");
  state.vp[t.id].lastBet = bet;
  t.deck = vpDeck();
  t.cards = [];
  t.held = [false, false, false, false, false];
  t.result = null; t.message = ""; t.jackpotWon = false;
  t.phase = "holding"; t.busy = true;
  state.vp[t.id].round = t;   // 🔒 the hand is saved with the game
  updateCounter(); save();
  await vpFinishDeal(t);
}
async function vpFinishDeal(t) {   // deals the cards still missing (all 5, or the rest after a reload)
  t.phase = "holding"; t.busy = true;
  while (t.cards.length < 5) { const c = t.deck.pop(); c.fresh = true; t.cards.push(c); renderVideoPoker(); await sleep(vpDelay()); }
  t.busy = false;
  renderVideoPoker();
}

async function vpDraw() {
  const t = vp;
  t.busy = true; t.phase = "drawing";
  // the new cards are taken from the deck all at once and saved, so a reload can't change them
  t.drawQueue = {};
  for (let i = 0; i < 5; i++) if (!t.held[i]) { const c = t.deck.pop(); c.fresh = true; t.drawQueue[i] = c; }
  save();
  for (const i of Object.keys(t.drawQueue)) {
    t.cards[i] = t.drawQueue[i]; delete t.drawQueue[i];
    renderVideoPoker(); await sleep(vpDelay());
  }
  vpSettle(t);
}
function vpSettle(t) {
  Object.keys(t.drawQueue || {}).forEach(i => { t.cards[i] = t.drawQueue[i]; });   // after a reload: cards not shown yet
  t.drawQueue = null;
  const bet = state.vp[t.id].inPlay;
  const cat = vpScore(t.cards), hand = VP_HANDS[cat];
  const back = bet * hand.pays;
  const jackpot = hand.jackpot ? Math.floor(vpJackpotShare(t, bet) * hand.jackpot) : 0;
  const lost = Math.max(0, bet - back);
  const cashback = lost * cashbackRate();
  state.casinoChips += back + jackpot + cashback;
  casinoRecord(bet, back + jackpot + cashback);
  state.vp[t.id].inPlay = 0; state.vp[t.id].round = null;
  freeDone(t.id);
  state.vp[t.id].bet = Math.max(0, state.vp[t.id].bet - (t.freeUsed || 0));   // the free chips were used: they leave the bet
  t.freeUsed = 0;
  const levelsGained = addXp(bet);   // XP = bet × game multiplier

  t.result = cat;
  t.jackpotWon = jackpot > 0;
  if (jackpot > 0) state.stats.vpJackpot = true;
  if (cat === 11) state.stats.royal = true;
  if (cat === 7) state.stats.quads = (state.stats.quads || 0) + 1;
  const net = back + jackpot - bet;
  t.message = (cat ? hand.name + "! " : "") +
    (jackpot ? `💰 JACKPOT +${fmt(jackpot)}! ` : "") +
    (net > 0 ? `You won ${fmt(net)}!` : net < 0 ? `You lost ${fmt(-net)}.` : "Your bet back.") +
    (cashback > 0 ? ` Cashback +${cashback.toLocaleString(undefined, { maximumFractionDigits: 1 })}.` : "") +
    (levelsGained > 0 ? ` 🎉 Level up! Now level ${levelInfo(state.casinoXp).level}.` : "");
  if (jackpot) showNotice(`💰 Video poker JACKPOT: +${fmt(jackpot)}!`);
  t.phase = "betting"; t.busy = false;
  updateCounter(); save();
  renderVideoPoker();
}

// Counts games played per casino game (for achievements)
function countPlay(game, n = 1) {
  if (!state.stats.played) state.stats.played = {};
  state.stats.played[game] = (state.stats.played[game] || 0) + n;
}

function vpResume(t) {
  if (t.phase === "drawing") return vpSettle(t);
  return vpFinishDeal(t);
}
function vpMsg(text) { if (vp) { vp.message = text; renderVideoPoker(); } }

function vpCardHtml(c, delay) {
  const anim = c.fresh ? ` deal" style="animation-delay:${delay}ms` : "";
  if (!c.fresh) return cardFace(c);
  return `<div class="pcard face deal" style="animation-delay:${delay}ms; background-image:url('${cardSrc(c)}')" role="img" aria-label="${cardName(c)}"></div>`;
}

function renderVideoPoker() {
  const t = vp, bet = vpBet(t);
  const betting = t.phase === "betting";
  const shownBet = betting ? bet : state.vp[t.id].inPlay;
  const share = vpJackpotShare(t, shownBet);
  const nowCat = t.phase === "holding" && !t.busy ? vpScore(t.cards) : null;

  // paytable, strongest first
  const rows = VP_HANDS.map((h, i) => ({ h, i })).filter(x => x.i > 0).reverse().map(({ h, i }) => `
    <tr class="${t.result === i ? "hit" : nowCat === i ? "now" : ""}">
      <td>${h.name}</td><td>${h.pays}×</td><td>${fmt(shownBet * h.pays)}</td>
      <td class="jp">${h.jackpot ? `+${fmt(Math.floor(share * h.jackpot))} (${h.jackpot * 100}% jackpot)` : ""}</td></tr>`).join("");

  let slots = "";
  for (let i = 0; i < 5; i++) {
    const c = t.cards[i];
    const canHold = t.phase === "holding" && !t.busy;
    const inner = c ? vpCardHtml(c, 0) : `<div class="pcard back"></div>`;
    slots += `<div class="vpSlot ${canHold ? "canHold" : ""} ${t.held[i] && c ? "held" : ""}" data-vphold="${i}">
                ${inner}<div class="holdTag">${t.held[i] && c ? "HELD" : ""}</div></div>`;
  }

  // Betting circle in the middle, decisions on both sides, main action below (like Sky Climb)
  let table;
  if (betting) {
    table = `
      <button class="decision" data-vp="clear" ${bet && !t.busy ? "" : "disabled"}>✖ Clear<small>bet</small></button>
      <div class="betCircle">${bet ? chipMark(bet) + `<b>${fmt(bet)}</b>` : `<span>Place your bet<br>with the chips below</span>`}</div>
      <button class="decision" data-vp="max" ${bet < t.max ? "" : "disabled"}>⬆ Max bet<small>${fmt(t.max)}</small></button>
      <button class="decision main" data-vp="deal" ${bet >= t.min && !t.busy ? "" : "disabled"}>🎴 Deal</button>`;
  } else {
    const can = t.phase === "holding" && !t.busy;
    table = `
      <button class="decision" data-vp="holdNone" ${can && t.held.some(x => x) ? "" : "disabled"}>✖ Release<small>all cards</small></button>
      <div class="betCircle live">${chipMark(shownBet)}<b>${fmt(shownBet)}</b><span>in play</span></div>
      <button class="decision" data-vp="holdAll" ${can && !t.held.every(x => x) ? "" : "disabled"}>✋ Hold<small>all cards</small></button>
      <button class="decision main" data-vp="draw" ${can ? "" : "disabled"}>🔄 Draw</button>`;
  }

  $("casinoGame").innerHTML = `
    <div class="card">
      <div class="row"><div><h2 style="margin:0">${casIco(currentGame)}${t.title}</h2>
        <div class="muted">Jacks or Better with 1 joker (53 cards) · Bets ${fmt(t.min)} – ${fmt(t.max)}</div></div>
        <button class="btn ghost small" data-back="1" ${betting && !t.busy ? "" : "disabled"}>← All games</button></div>

      <div class="vpJackpot ${t.jackpotWon ? "won" : ""}">
        <div class="sub">💰 JACKPOT</div>
        <div class="amt">${coins(t.jackpot)}</div>
        <div class="sub">Royal Flush wins 100% · any Straight Flush wins 20% · paid on top of the normal win.
          ${shownBet ? `Your bet of ${fmt(shownBet)} wins ${pct(shownBet / t.max)} of it${shownBet < t.max ? " (bet the max to win all of it)" : ""}.` : "Your share = your bet ÷ max bet."}</div>
      </div>

      <div class="vpPayHead"><b>📋 Payouts</b>
        <button class="btn ghost small" data-vp="togglePay">${state.vpPayHidden ? "▸ Show" : "▾ Minimize"}</button></div>
      ${state.vpPayHidden
        ? `<div class="muted">Royal Flush ${VP_HANDS[11].pays}× + jackpot · … · Jacks or Better ${VP_HANDS[1].pays}×</div>`
        : `<table class="vpPay"><tbody>${rows}</tbody></table>`}

      <div class="bjFelt">
        <div class="vpCards">${slots}</div>
        <div class="vpHandName">${t.result !== null ? (t.result ? "🎉 " + VP_HANDS[t.result].name : "No win") : nowCat ? "You have: " + VP_HANDS[nowCat].name : ""}</div>
        <div class="climbTable vpTable">${table}</div>
      </div>

      ${!betting ? `<div class="muted" style="text-align:center; margin-top:12px">Click the cards you want to keep, then draw.</div>` : `<div class="chipsRow">
        <span class="muted">Bet:</span>
        ${t.chips.map(v => `<button class="chip" data-vpchip="${v}"
             style="background:${CHIP_COLORS[v].bg}; color:${CHIP_COLORS[v].text}">${chipLabel(v)}</button>`).join("")}
        <span class="muted">Click chips to add to your bet (${fmt(t.min)} – ${fmt(t.max)}).</span>
      </div>${freeChipRow(t, false)}`}
      <div id="casinoMsg" class="${/won|back|JACKPOT/.test(t.message) ? "income" : "flash"}" style="margin-top:10px; text-align:center">${t.message}</div>
      <div class="muted" style="margin-top:6px; text-align:center">The joker is wild and becomes the best card for your hand · "1×" means you get your bet back · Returns about 98% with perfect play</div>
    </div>`;
  t.cards.forEach(c => { if (c) c.fresh = false; });
}

$("casinoGame").addEventListener("click", (e) => {
  if (!VP_TABLES[currentGame] || isPaused()) return;
  const t = vp;
  const slot = e.target.closest("[data-vphold]");
  if (slot && t.phase === "holding" && !t.busy) {
    const i = Number(slot.dataset.vphold);
    t.held[i] = !t.held[i];
    renderVideoPoker();
    return;
  }
  const fchip = e.target.closest("[data-freechip]");
  if (fchip && t.phase === "betting" && !t.busy) {
    const v = Number(fchip.dataset.freechip), cur = state.vp[t.id];
    if (cur.bet + v > t.max) return vpMsg("Maximum bet is " + fmt(t.max) + ".");
    if (!freeTake(t.id, v)) return vpMsg("No free chips of that kind left.");
    cur.bet += v; t.message = "";
    renderVideoPoker(); save();
    return;
  }
  const chip = e.target.closest("[data-vpchip]");
  if (chip && t.phase === "betting" && !t.busy) {
    const v = Number(chip.dataset.vpchip), cur = state.vp[t.id];
    if (cur.bet + v > t.max) return vpMsg("Maximum bet is " + fmt(t.max) + ".");
    cur.bet += v; t.message = "";
    renderVideoPoker(); save();
    return;
  }
  const btn = e.target.closest("[data-vp]");
  if (!btn || btn.disabled) return;
  const a = btn.dataset.vp;
  if (a === "deal" && !t.busy) vpDeal();
  if (a === "draw" && t.phase === "holding" && !t.busy) vpDraw();
  if (a === "max") { state.vp[t.id].bet = t.max; t.message = ""; renderVideoPoker(); save(); }
  if (a === "clear") { freeReturn(t.id); state.vp[t.id].bet = 0; t.message = ""; renderVideoPoker(); save(); }
  if ((a === "holdAll" || a === "holdNone") && t.phase === "holding" && !t.busy) { t.held = t.held.map(() => a === "holdAll"); renderVideoPoker(); }
  if (a === "togglePay") { state.vpPayHidden = !state.vpPayHidden; renderVideoPoker(); save(); }
});

/* =====================================================================
   ULTIMATE TEXAS HOLD'EM (standard casino rules, one 52-card deck per round)
   Bets per seat: Ante + an equal Blind, optional Trips. Up to 2 seats.
   Before the flop: check or raise 3x/4x the ante. After the flop: check or raise 2x.
   After the river: raise 1x or fold. You can raise only once per hand.
   Showdown (best 5 of 7 cards):
     Play pays 1:1 if you beat the dealer.
     Ante pays 1:1 if you win, but pushes if the dealer has less than a pair.
     Blind pays by the table below when you win with a straight or better, otherwise pushes on a win.
     A tie pushes Ante, Blind and Play. Folding loses Ante and Blind.
     Trips pays on your own hand whatever the dealer has (even if you fold).
   ===================================================================== */
const PK_NAMES = ["High Card", "Pair", "Two Pair", "Three of a Kind", "Straight", "Flush", "Full House", "Four of a Kind", "Straight Flush", "Royal Flush"];
const UTH_BLIND_PAYS = { 9: 500, 8: 50, 7: 10, 6: 3, 5: 1.5, 4: 1 };       // X to 1
const UTH_TRIPS_PAYS = { 9: 50, 8: 40, 7: 30, 6: 9, 5: 7, 4: 4, 3: 3 };    // X to 1
const PK_VAL = { "2": 2, "3": 3, "4": 4, "5": 5, "6": 6, "7": 7, "8": 8, "9": 9, "10": 10, "J": 11, "Q": 12, "K": 13, "A": 14 };

// Score of exactly 5 cards: higher is better. Category = Math.floor(score / 15^5)
function pkScore5(cards) {
  const v = cards.map(c => PK_VAL[c.r]).sort((a, b) => b - a);
  const flush = cards.every(c => c.s === cards[0].s);
  const counts = {};
  v.forEach(x => counts[x] = (counts[x] || 0) + 1);
  const groups = Object.entries(counts).map(([val, n]) => [Number(val), n]).sort((a, b) => b[1] - a[1] || b[0] - a[0]);
  const unique = groups.length === 5;
  let straightTop = 0;
  if (unique && v[0] - v[4] === 4) straightTop = v[0];
  if (unique && v[0] === 14 && v[1] === 5) straightTop = 5;   // A-2-3-4-5
  let cat, tie;
  if (straightTop && flush) { cat = straightTop === 14 ? 9 : 8; tie = [straightTop]; }
  else if (groups[0][1] === 4) { cat = 7; tie = groups.map(g => g[0]); }
  else if (groups[0][1] === 3 && groups[1][1] === 2) { cat = 6; tie = groups.map(g => g[0]); }
  else if (flush) { cat = 5; tie = v; }
  else if (straightTop) { cat = 4; tie = [straightTop]; }
  else if (groups[0][1] === 3) { cat = 3; tie = groups.map(g => g[0]); }
  else if (groups[0][1] === 2 && groups[1][1] === 2) { cat = 2; tie = groups.map(g => g[0]); }
  else if (groups[0][1] === 2) { cat = 1; tie = groups.map(g => g[0]); }
  else { cat = 0; tie = v; }
  let score = cat;
  for (let i = 0; i < 5; i++) score = score * 15 + (tie[i] || 0);
  return score;
}
// Best 5 of 7 cards
function pkBest(cards) {
  let best = -1;
  for (let a = 0; a < 7; a++) for (let b = a + 1; b < 7; b++) {
    const five = cards.filter((_, i) => i !== a && i !== b);
    const sc = pkScore5(five);
    if (sc > best) best = sc;
  }
  return best;
}
const pkCat = (score) => Math.floor(score / 759375);   // 15^5

function makeUthTable(id, title, emoji, min, max, chips) {
  return { id, title, emoji, min, max, chips, chip: chips[0],
           phase: "betting", deck: [], dealer: [], board: [], hands: [], active: -1, busy: false, message: "",
           lastBets: null };
}
const UTH_TABLES = {
  uthLow:   makeUthTable("uthLow",   "Ultimate Texas Hold'em: Classic table", "🤠", 500, 50000, [500, 1000, 5000, 10000, 25000, 50000]),
  uthHigh:  makeUthTable("uthHigh",  "Ultimate Texas Hold'em: High rollers",  "🤠💎", 50000, 5000000, [50000, 100000, 250000, 500000, 1000000, 5000000]),
  uthSuper: makeUthTable("uthSuper", "Ultimate Texas Hold'em: Super high rollers", "🤠💎💎", 10000000, 500000000, [10000000, 25000000, 50000000, 100000000, 250000000, 500000000]),
};
let uth = null;

// Bets on the spots are saved. A hand in play is saved and restored on a reload (see restoreRound).
if (!state.uth) state.uth = {};
for (const id in UTH_TABLES) {
  const saved = state.uth[id] || {};
  const kept = restoreRound("uth", UTH_TABLES, saved, id);
  state.uth[id] = { seats: saved.seats || [{ ante: 0, trips: 0 }, { ante: 0, trips: 0 }], inPlay: kept ? saved.inPlay : 0, round: kept ? UTH_TABLES[id] : null };
}
const uthSeats = (t) => state.uth[t.id].seats;
const uthDelay = () => (window.UTH_FAST ? 0 : 320);
const uthCost = (seats) => seats.reduce((a, s) => a + s.ante * 2 + s.trips, 0);   // ante + equal blind + trips

function uthNewDeck() {
  const deck = [];
  for (const s of SUITS) for (const r of RANKS) deck.push({ r, s });
  for (let i = deck.length - 1; i > 0; i--) { const j = secureRandomInt(i + 1); [deck[i], deck[j]] = [deck[j], deck[i]]; }
  return deck;
}
const uthDraw = (t) => { const c = t.deck.pop(); c.fresh = true; return c; };

async function uthDeal() {
  const t = uth, seats = uthSeats(t);
  if (!seats.some(s => s.ante > 0)) return uthMsg("Put an Ante on at least one seat.");
  if (seats.some(s => s.ante > 0 && s.ante < t.min)) return uthMsg("Minimum ante is " + fmt(t.min) + ".");
  if (vipOn(t.id)) {
    const reserve = seats.reduce((a, s) => a + s.ante * 4, 0);   // a 4x raise on every seat
    if (state.vip.coins < reserve)
      return uthMsg(`With VIP coins you also need enough left for the biggest raise (4× ante): ${fmt(reserve)} needed, you have ${fmt(state.vip.coins)}.`);
  }
  t.busy = true; t.phase = "dealing"; t.message = "";
  t.lastBets = seats.map(s => ({ ...s }));
  state.uth[t.id].inPlay = uthCost(seats);   // free chips included; on a reload they go back as free chips
  freeStart(t.id);
  countPlay("uth", seats.filter(s => s.ante > 0).length);   // one game per seat with a bet
  t.hands = [];
  seats.forEach((s, seat) => {
    if (s.ante > 0) t.hands.push({ seat, ante: s.ante, blind: s.ante, trips: s.trips, play: 0, cards: [], folded: false, decided: false });
    if (s.ante >= 500000000) state.stats.uth500 = true;
  });
  state.uth[t.id].seats = [{ ante: 0, trips: 0 }, { ante: 0, trips: 0 }];
  t.deck = uthNewDeck(); t.dealer = []; t.board = [];
  state.uth[t.id].round = t;   // 🔒 the hand is saved with the game
  save();
  await uthFinishDeal(t);
}
async function uthFinishDeal(t) {   // deals the cards still missing (all of them, or the rest after a reload)
  t.busy = true; t.phase = "dealing";
  for (let round = 0; round < 2; round++) {
    for (const h of t.hands) if (h.cards.length <= round) { h.cards.push(uthDraw(t)); renderUth(); await sleep(uthDelay()); }
    if (t.dealer.length <= round) { const d = uthDraw(t); d.hidden = true; t.dealer.push(d); renderUth(); await sleep(uthDelay()); }
  }
  t.street = "pre";
  t.busy = false; t.phase = "playing";
  uthNext();
}

// Find the next hand that still has to decide on this street, or move to the next street
async function uthNext() {
  const t = uth;
  const i = t.hands.findIndex(h => !h.folded && h.play === 0 && !h.decided);
  if (i >= 0) { t.active = i; renderUth(); return; }
  t.active = -1; t.busy = true;
  t.hands.forEach(h => h.decided = false);
  if (t.street === "pre") {
    for (let k = 0; k < 3; k++) { t.board.push(uthDraw(t)); renderUth(); await sleep(uthDelay()); }
    t.street = "flop";
  } else if (t.street === "flop") {
    for (let k = 0; k < 2; k++) { t.board.push(uthDraw(t)); renderUth(); await sleep(uthDelay()); }
    t.street = "river";
  } else {
    return uthShowdown();
  }
  t.busy = false;
  uthNext();
}

// Raise options for the hand that is deciding
const uthRaises = (t) => t.street === "pre" ? [4, 3] : t.street === "flop" ? [2] : [1];

function uthAction(a) {
  const t = uth, h = t.hands[t.active];
  if (!h || t.busy) return;
  if (a.startsWith("raise")) {
    const x = Number(a.slice(5)), cost = h.ante * x;
    if (!uthRaises(t).includes(x)) return;
    if (purse(t.id) < cost) return uthMsg(`Not enough ${purseName(t.id)} to raise ` + fmt(cost) + ".");
    payFrom(t.id, cost);
    state.uth[t.id].inPlay += cost;
    h.play = cost;
  } else if (a === "fold") {
    if (t.street !== "river") return;
    h.folded = true;
  }
  h.decided = true;
  t.message = "";
  updateCounter(); save();
  uthNext();
}

async function uthShowdown() {
  const t = uth;
  t.dealer.forEach(c => { c.hidden = false; c.fresh = true; });
  renderUth(); await sleep(uthDelay());
  const dScore = pkBest([...t.dealer, ...t.board]);
  const qualifies = pkCat(dScore) >= 1;
  t.dealerHand = PK_NAMES[pkCat(dScore)];
  let wagered = 0, back = 0, cashback = 0;
  for (const h of t.hands) {
    const pScore = pkBest([...h.cards, ...t.board]), cat = pkCat(pScore);
    if (cat === 9) state.stats.royal = true;
    if (cat === 7) state.stats.quads = (state.stats.quads || 0) + 1;
    h.handName = PK_NAMES[cat];
    const bet = h.ante + h.blind + h.play + h.trips;
    let ret = 0;
    h.spots = {};
    if (h.folded) {
      h.outcome = "Folded"; h.spots.ante = h.spots.blind = "lose";
    } else if (pScore > dScore) {
      h.outcome = "Win";
      const ranks = h.cards.map(c => c.r).sort().join("");
      if (ranks === "67") state.stats.sixSeven = true;   // won holding a 6 and a 7
      ret += h.play * 2;                                        h.spots.play = "win";
      if (qualifies) { ret += h.ante * 2; h.spots.ante = "win"; } else { ret += h.ante; h.spots.ante = "push"; }
      if (UTH_BLIND_PAYS[cat]) { ret += h.blind * (1 + UTH_BLIND_PAYS[cat]); h.spots.blind = "win"; } else { ret += h.blind; h.spots.blind = "push"; }
    } else if (pScore === dScore) {
      h.outcome = "Tie";
      ret += h.ante + h.blind + h.play; h.spots.ante = h.spots.blind = h.spots.play = "push";
    } else {
      h.outcome = "Lose";
      h.spots.play = h.spots.blind = "lose";
      if (qualifies) h.spots.ante = "lose"; else { ret += h.ante; h.spots.ante = "push"; }
    }
    if (h.trips > 0) {
      if (UTH_TRIPS_PAYS[cat]) { ret += h.trips * (1 + UTH_TRIPS_PAYS[cat]); h.spots.trips = "win"; } else h.spots.trips = "lose";
    }
    h.back = ret; h.bet = bet;
    const lost = Math.max(0, bet - ret);
    cashback += lost * cashbackRate();
    wagered += bet; back += ret;
  }
  state.casinoChips += back + cashback;
  casinoRecord(wagered, back + cashback);
  state.uth[t.id].inPlay = 0; state.uth[t.id].round = null;
  freeDone(t.id);
  const levelsGained = addXp(wagered);   // XP = bet × game multiplier (raises and Trips count)
  const net = back - wagered;
  t.message = `Dealer has ${t.dealerHand}${qualifies ? "" : " (doesn't qualify, so Antes push)"}. ` +
    (net > 0 ? `You won ${fmt(net)}!` : net < 0 ? `You lost ${fmt(-net)}.` : "You broke even.") +
    (cashback > 0 ? ` Cashback +${cashback.toLocaleString(undefined, { maximumFractionDigits: 1 })}.` : "") +
    (levelsGained > 0 ? ` 🎉 Level up! Now level ${levelInfo(state.casinoXp).level}.` : "");
  t.phase = "betting"; t.street = null; t.busy = false; t.active = -1;
  updateCounter(); save();
  renderUth();
}

// ▶ after a reload: finish a board that was being dealt, then carry on with the next decision (or the showdown)
function uthResume(t) {
  if (t.phase === "dealing") return uthFinishDeal(t);
  if (t.street === "pre" && t.board.length > 0) { while (t.board.length < 3) t.board.push(uthDraw(t)); t.street = "flop"; }
  if (t.street === "flop" && t.board.length > 3) { while (t.board.length < 5) t.board.push(uthDraw(t)); t.street = "river"; }
  t.phase = "playing"; t.busy = false;
  uthNext();
}
function uthMsg(text) { if (uth) { uth.message = text; renderUth(); } }
// Take the finished round off the table (when you clear or start placing new bets)
function uthClearTable(t) { t.hands = []; t.dealer = []; t.board = []; t.dealerHand = ""; }

function renderUth() {
  const t = uth, betting = t.phase === "betting";
  const seats = uthSeats(t);
  const freshRound = betting && t.hands.length === 0;   // nothing dealt yet (or the last round was cleared)
  const showCards = !freshRound;
  const slotCard = `<div class="pcard slot"></div>`;
  const cardsOf = (arr, n) => { let h = arr.map(cardHtml).join(""); for (let i = arr.length; i < n; i++) h += slotCard; return h; };

  const spot = (label, amount, opts = {}) => `
    <div class="uthSpot ${amount ? "has" : ""} ${opts.click ? "click" : ""} ${opts.res || ""}" ${opts.click ? `data-uthspot="${opts.click}"` : ""}>
      ${amount ? chipMark(amount) : ""}<b>${label}</b><span>${amount ? fmt(amount) : opts.hint || ""}</span></div>`;

  const seatHtml = [0, 1].map(seat => {
    const h = t.hands.find(x => x.seat === seat);
    if (betting && (freshRound || !h)) {
      const s = seats[seat];
      return `<div class="uthSeat">
        <div class="muted">Seat ${seat + 1}${s.ante ? "" : " · empty"}</div>
        <div class="cardsRow">${slotCard}${slotCard}</div>
        <div class="uthSpots">
          ${spot("Ante", s.ante, { click: seat + "-ante", hint: "click" })}
          ${spot("Blind", s.ante, { hint: "= ante" })}
          ${spot("Trips", s.trips, { click: seat + "-trips", hint: "optional" })}
        </div></div>`;
    }
    if (!h) return `<div class="uthSeat folded"><div class="muted">Seat ${seat + 1} · not playing</div>
        <div class="cardsRow">${slotCard}${slotCard}</div></div>`;   // seat left empty this round
    const i = t.hands.indexOf(h);
    const done = betting;
    const resCls = !done ? "" : h.back > h.bet ? "win" : h.back === h.bet ? "push" : "lose";
    const sp = h.spots || {};
    return `<div class="uthSeat ${i === t.active ? "active" : ""} ${h.folded ? "folded" : ""}">
      <div class="muted">Seat ${seat + 1}${i === t.active ? " · your move" : ""}</div>
      <div class="cardsRow">${h.cards.map(cardHtml).join("")}</div>
      <div class="uthHandName">${done ? h.handName : t.board.length >= 3 && !h.folded ? PK_NAMES[pkCat(uthPartial(h, t))] : ""}</div>
      <div class="uthSpots">
        ${spot("Ante", h.ante, { res: sp.ante })}${spot("Blind", h.blind, { res: sp.blind })}
        ${spot("Play", h.play, { res: sp.play, hint: h.folded ? "folded" : "—" })}${h.trips ? spot("Trips", h.trips, { res: sp.trips }) : ""}
      </div>
      ${done ? `<div class="uthResult ${resCls}">${h.outcome}${h.back > h.bet ? " · +" + fmt(h.back - h.bet) : h.back < h.bet ? " · −" + fmt(h.bet - h.back) : ""}</div>` : ""}
    </div>`;
  }).join("");

  let actions = "";
  const total = uthCost(seats);
  if (betting) {
    const last = t.lastBets ? uthCost(t.lastBets) : 0;
    actions = `
      <button class="btn" data-uth="deal" ${seats.some(s => s.ante >= t.min) && !t.busy ? "" : "disabled"}>🤠 Deal (bet ${fmt(total)})</button>
      <button class="btn ghost" data-uth="clear" ${total || t.hands.length ? "" : "disabled"}>Clear bets</button>
      <button class="btn ghost" data-uth="rebet" ${last ? "" : "disabled"}>↺ Repeat last bets${last ? " (" + fmt(last) + ")" : ""}</button>`;
  } else if (t.active >= 0 && !t.busy) {
    const h = t.hands[t.active];
    const raises = uthRaises(t).map(x => `<button class="btn" data-uth="raise${x}" ${purse(t.id) >= h.ante * x ? "" : "disabled"}>Raise ${x}× (${fmt(h.ante * x)})</button>`).join("");
    const passive = t.street === "river"
      ? `<button class="btn ghost" data-uth="fold">🏳️ Fold</button>`
      : `<button class="btn ghost" data-uth="check">Check</button>`;
    const where = t.street === "pre" ? "Before the flop" : t.street === "flop" ? "After the flop" : "After the river";
    actions = `<span class="muted" style="align-self:center">Seat ${h.seat + 1} · ${where}:</span>${raises}${passive}`;
  } else {
    actions = `<span class="muted" style="align-self:center">Dealing...</span>`;
  }

  const dealerName = betting && showCards && t.dealerHand ? t.dealerHand : "";
  $("casinoGame").innerHTML = `
    <div class="card">
      <div class="row"><div><h2 style="margin:0">${casIco(currentGame)}${t.title}</h2>
        <div class="muted">Ante ${fmt(t.min)} – ${fmt(t.max)} per seat · Blind = Ante · Trips optional (up to ${fmt(t.max)}) · Play 1 or 2 seats</div></div>
        <button class="btn ghost small" data-back="1" ${betting && !t.busy ? "" : "disabled"}>← All games</button></div>

      <div class="vpPayHead"><b>📋 Payouts</b>
        <button class="btn ghost small" data-uth="togglePay">${state.uthPayHidden ? "▸ Show" : "▾ Minimize"}</button></div>
      ${state.uthPayHidden ? `<div class="muted">Blind: Royal 500:1 … Straight 1:1 · Trips: Royal 50:1 … Three of a Kind 3:1</div>` : `
      <div class="uthPayInfo">
        <div><b>Blind</b> (when you win)<table>${[9, 8, 7, 6, 5, 4].map(c => `<tr><td>${PK_NAMES[c]}</td><td>${UTH_BLIND_PAYS[c] === 1.5 ? "3:2" : UTH_BLIND_PAYS[c] + ":1"}</td></tr>`).join("")}
          <tr><td>Lower hands</td><td>push</td></tr></table></div>
        <div><b>Trips</b> (your hand, win or lose)<table>${[9, 8, 7, 6, 5, 4, 3].map(c => `<tr><td>${PK_NAMES[c]}</td><td>${UTH_TRIPS_PAYS[c]}:1</td></tr>`).join("")}</table></div>
      </div>`}

      <div class="bjFelt">
        <div class="uthRow">
          <div class="bjLabel">Dealer</div>
          <div class="cardsRow">${showCards ? cardsOf(t.dealer, 2) : slotCard + slotCard}</div>
          <div class="uthHandName">${dealerName}</div>
        </div>
        <div class="uthRow uthBoard">
          <div class="bjLabel">Board</div>
          <div class="cardsRow">${showCards ? cardsOf(t.board, 5) : slotCard.repeat(5)}</div>
        </div>
        <div class="uthSeats">${seatHtml}</div>
      </div>

      ${betting ? `<div class="chipsRow">
        <span class="muted">Chip:</span>
        ${t.chips.map(v => `<button class="chip ${v === t.chip && !t.chipFree ? "selected" : ""}" data-uthchip="${v}"
             style="background:${CHIP_COLORS[v].bg}; color:${CHIP_COLORS[v].text}">${chipLabel(v)}</button>`).join("")}
        <span class="muted">Click Ante or Trips on a seat to add the chip. The Blind matches the Ante.</span>
      </div>${freeChipRow(t, t.chipFree)}` : ""}
      <div class="bjActions">${actions}</div>
      <div id="casinoMsg" class="${/won|broke even/.test(t.message) ? "income" : "flash"}" style="margin-top:10px; text-align:center">${t.message}</div>
      <div class="muted" style="margin-top:6px; text-align:center">Raise 3× or 4× before the flop, 2× after the flop, or 1× after the river (once per hand) · The dealer needs a pair to qualify, otherwise Antes push · Best 5 of 7 cards</div>
    </div>`;
  t.dealer.forEach(c => c.fresh = false); t.board.forEach(c => c.fresh = false);
  t.hands.forEach(h => h.cards.forEach(c => c.fresh = false));
}
// Your best hand so far (2 cards + visible board), shown under your cards
function uthPartial(h, t) {
  const cards = [...h.cards, ...t.board];
  if (cards.length === 7) return pkBest(cards);
  let best = -1;   // 5 or 6 cards: best 5 of them
  const n = cards.length;
  for (let skip = 0; skip < (n === 6 ? 6 : 1); skip++) {
    const five = n === 6 ? cards.filter((_, i) => i !== skip) : cards;
    best = Math.max(best, pkScore5(five));
  }
  return best;
}

$("casinoGame").addEventListener("click", (e) => {
  if (!UTH_TABLES[currentGame] || isPaused()) return;
  const t = uth;
  const chip = e.target.closest("[data-uthchip]");
  if (chip) { t.chip = Number(chip.dataset.uthchip); t.chipFree = false; renderUth(); return; }
  const fchip = e.target.closest("[data-freechip]");
  if (fchip) { t.chip = Number(fchip.dataset.freechip); t.chipFree = true; renderUth(); return; }
  const sp = e.target.closest("[data-uthspot]");
  if (sp && t.phase === "betting" && !t.busy) {
    const [seatStr, kind] = sp.dataset.uthspot.split("-");
    const s = uthSeats(t)[Number(seatStr)], v = t.chip;
    const free = t.chipFree;
    if (kind === "ante") {
      if (s.ante + v > t.max) return uthMsg("Table limit: max ante " + fmt(t.max) + ".");
      if (free) {   // a free Ante needs 2 chips: one for the Ante and one for the Blind
        if (!freeTake(t.id, v, 2)) return uthMsg("A free Ante needs 2 free chips (Ante + Blind).");
      } else {
        if (purse(t.id) < v * 2) return uthMsg(`Not enough ${purseName(t.id)} (Ante + Blind = ` + fmt(v * 2) + ").");
        payFrom(t.id, v * 2);
      }
      s.ante += v;
    } else {
      if (!s.ante) return uthMsg("Put an Ante on this seat first.");
      if (s.trips + v > t.max) return uthMsg("Table limit: max Trips " + fmt(t.max) + ".");
      if (free) { if (!freeTake(t.id, v)) return uthMsg("No free chips of that kind left."); }
      else { if (purse(t.id) < v) return uthMsg(`Not enough ${purseName(t.id)}.`); payFrom(t.id, v); }
      s.trips += v;
    }
    t.message = "";
    uthClearTable(t);
    updateCounter(); renderUth(); save();
    return;
  }
  const btn = e.target.closest("[data-uth]");
  if (!btn || btn.disabled) return;
  const a = btn.dataset.uth;
  if (a === "togglePay") { state.uthPayHidden = !state.uthPayHidden; renderUth(); save(); return; }
  if (a === "deal" && t.phase === "betting" && !t.busy) uthDeal();
  if (a === "clear" && t.phase === "betting") {
    refundTo(t.id, uthCost(uthSeats(t)) - freeReturn(t.id));
    state.uth[t.id].seats = [{ ante: 0, trips: 0 }, { ante: 0, trips: 0 }];
    uthClearTable(t);
    t.message = ""; updateCounter(); renderUth(); save();
  }
  if (a === "rebet" && t.phase === "betting" && t.lastBets) {
    const seats = uthSeats(t), need = uthCost(t.lastBets);
    if (t.lastBets.some((b, i) => seats[i].ante + b.ante > t.max || seats[i].trips + b.trips > t.max)) return uthMsg("That would go over the table limit.");
    if (purse(t.id) < need) return uthMsg(`Not enough ${purseName(t.id)} to repeat (` + fmt(need) + " needed).");
    payFrom(t.id, need);
    t.lastBets.forEach((b, i) => { seats[i].ante += b.ante; seats[i].trips += b.trips; });
    uthClearTable(t);
    t.message = ""; updateCounter(); renderUth(); save();
  }
  if (t.phase === "playing" && (a.startsWith("raise") || a === "check" || a === "fold")) uthAction(a);
});

// ▶ a hand that was saved in the middle of play: reopen its table and carry on (runs after every script has loaded)
document.addEventListener("DOMContentLoaded", () => {
  if (!cardResume) return;
  const { kind, id } = cardResume; cardResume = null;
  currentGame = id;
  const names = { bj: "Blackjack", vp: "Video Poker", uth: "Ultimate Texas Hold'em" };
  if (kind === "bj") { bj = BJ_TABLES[id]; bjResume(bj); }
  if (kind === "vp") { vp = VP_TABLES[id]; vpResume(vp); }
  if (kind === "uth") { uth = UTH_TABLES[id]; uthResume(uth); }
  showNotice(`🃏 Your ${names[kind]} hand is still in play: it's waiting for you in the 🎰 Casino.`);
});
