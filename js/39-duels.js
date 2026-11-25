/* Empire of Coins © 2026 milkhunt3r. All rights reserved. */
/* =====================================================================
   ⚔️ ONLINE CASINO: duels against friends (🎰 Casino → ⚔️ Online casino on the left).
   · ✊✋✌️ Rock Paper Scissors and 🎲 Dice Battle (2 dice each, higher total wins the round). Best of 3; a tie is played again.
   · Challenge a friend who is 🟢 online, with a bet of your choice (both must have it). The winner gets both bets minus a 2% fee
     (so a win pays +96% of the bet, a loss costs the bet: friends can't pass money around for free).
   · The database is the referee (docs/supabase-duels.sql): picks stay secret until both chose, it rolls the dice,
     runs the 15-second timers (no pick = a random one) and decides the winner. Leaving for 30 s = losing.
   · Money: nothing is taken at the start. When the duel ends, each player collects their result once
     (duel_settle): +bet for the winner, −bet for the loser (never below 0 money).
   ===================================================================== */
const DU_WIN = 0.96;   // the winner gets both bets minus a 2% fee: +96% of the bet (docs/supabase-duels.sql, duel_settle)
const duWinAmt = (bet) => Math.floor(bet * DU_WIN);
const DU_PICKS = ["rock", "paper", "scissors"];
const DU_GAMES = {
  rps: { name: "Rock Paper Scissors", ico: "assets/duel/ico-rps.webp", bg: "assets/duel/bg-arena.webp",
    rules: "Best of 3. Rock beats scissors, scissors beat paper, paper beats rock. A tie is played again." },
  dice: { name: "Dice Battle", ico: "assets/duel/ico-dice.webp", bg: "assets/duel/bg-table.webp",
    rules: "Best of 3. Both roll 2 dice: the higher total wins the round. A tie is rolled again." },
};
if (!state.duels || typeof state.duels !== "object") state.duels = {};
["rps", "dice"].forEach(g => { state.duels[g] = state.duels[g] || { w: 0, l: 0 }; });
state.duels.won = state.duels.won || 0; state.duels.lost = state.duels.lost || 0;
const DU = { game: "rps", bet: "", cur: null, out: null, invites: {}, shownInvite: null, busy: false, err: "",
  res: null, lastLog: 0, ticking: false, pendAt: 0, final: null };
const duOn = () => typeof profSignedIn === "function" && profSignedIn() && prof.row && prof.friendsOn !== false;
const duRpc = async (fn, args) => { const { data, error } = await cloud.sb.rpc(fn, args || {}); if (error) throw error; return data; };
function duErr(e) {
  const m = (e && e.message) || "";
  const map = { not_friends: "You can only challenge your friends.", offline: "Your friend isn't online right now.",
    no_money: "You don't have enough money for this bet.", opp_no_money: "Your friend doesn't have enough money for this bet.",
    busy: "You already have a challenge or a duel going.", opp_busy: "Your friend is already in a duel.", bad_bet: "Choose a bet of at least 1.",
    expired: "This challenge has expired.", gone: "This challenge isn't open any more." };
  for (const k in map) if (m.includes(k)) return map[k];
  if (e && (e.code === "PGRST202" || e.code === "42883" || e.code === "42P01")) return "The online casino isn't switched on yet. Please try again later.";
  return "Something went wrong. Please try again.";
}
const duPerson = (v) => ({ nick: v.opp_nick || "?", avatar: v.opp_avatar || "" });
const duHand = (pick, flip) => DU_PICKS.includes(pick) ? `<img class="duHand ${flip ? "flip" : ""}" src="assets/duel/hand-${pick}.webp" alt="">` : `<div class="duHand ${flip ? "flip" : ""} wait">${pick === "?" ? "✔️" : "❔"}</div>`;
const duDice = (roll) => { const r = roll && /^\d,\d$/.test(roll) ? roll.split(",") : null;
  return r ? r.map(n => `<img class="duDie" src="assets/duel/die-${n}.webp" alt="${n}">`).join("") : `<div class="duDie wait">❔</div><div class="duDie wait">❔</div>`; };
const duSum = (roll) => roll ? roll.split(",").reduce((s, n) => s + Number(n), 0) : 0;

/* ----- 🔄 talking to the referee ----- */
async function duPending() {
  if (!duOn() || DU.busy) return;
  DU.pendAt = Date.now();
  let list;
  try { list = await duRpc("duel_pending"); DU.err = DU.err && DU.err.includes("switched on") ? "" : DU.err; }
  catch (e) { if (/switched on/.test(duErr(e))) DU.off = true; return; }
  DU.off = false;
  const me = cloud.user.id;
  DU.out = null; const inv = {};
  for (const v of list || []) {
    if (v.status === "done" && !v.settled) duSettle(v);
    else if (v.status === "invited" && v.me === "b") inv[v.id] = v;
    else if (v.status === "invited") DU.out = v;
    else if (v.status === "active" && (!DU.cur || DU.cur.id !== v.id)) duStart(v);
  }
  DU.invites = inv;
  duShowInvite();
  if (duVisible()) renderDuels();
}
function duStart(v) {   // a duel begins (you accepted, or your friend accepted your challenge)
  DU.cur = v; DU.out = null; DU.final = null; DU.lastLog = (v.log || []).length; DU.res = null;
  if (state.view !== "casino" || state.casinoPage !== "online") {
    showNotice(`⚔️ Your duel with ${duPerson(v).nick} has started!`);
    state.casinoPage = "online"; showView("casino");
  }
  duLoop();
}
async function duLoop() {   // once a second during a duel: "still here" + timers + the latest state
  if (DU.ticking) return;
  DU.ticking = true;
  while (DU.cur && DU.cur.status === "active") {
    try { duUpdate(await duRpc("duel_tick", { p_id: DU.cur.id })); } catch (e) { console.warn("Duel tick failed:", e); }
    await new Promise(r => setTimeout(r, 1000));
  }
  DU.ticking = false;
}
function duUpdate(v) {
  if (!v || !DU.cur || v.id !== DU.cur.id) return;
  const n = (v.log || []).length;
  if (n > DU.lastLog) { DU.res = { e: v.log[n - 1], until: Date.now() + 3000 }; DU.lastLog = n; }
  DU.cur = v;
  if (v.status === "done") { DU.final = v; duSettle(v); }
  else if (v.status !== "active") { DU.cur = null; }
  if (duVisible()) renderDuels();
}
async function duSettle(v) {   // collect your result once
  if (v.settled || DU["settling" + v.id]) return;
  DU["settling" + v.id] = true;
  try {
    const amt = await duRpc("duel_settle", { p_id: v.id });
    if (typeof amt === "number") {
      const g = state.duels[v.game] || (state.duels[v.game] = { w: 0, l: 0 });
      if (amt > 0) { state.money += amt; g.w++; state.duels.won += amt; }
      else { const lose = Math.min(-amt, Math.max(0, state.money)); state.money -= lose; g.l++; state.duels.lost += lose; }
      v.settled = true; updateCounter(); save(); flushSave();
      if (!DU.final || DU.final.id !== v.id) showNotice(amt > 0 ? `⚔️ You won your ${DU_GAMES[v.game].name} duel against ${duPerson(v).nick}: +${fmt(amt)}!` : `⚔️ You lost your ${DU_GAMES[v.game].name} duel against ${duPerson(v).nick}: −${fmt(-amt)}.`);
      if (typeof checkAchievements === "function") checkAchievements();
    }
  } catch (e) { console.warn("Duel settle failed:", e); }
  DU["settling" + v.id] = false;
  if (duVisible()) renderDuels();
}
async function duDo(fn, args, after) {
  if (DU.busy) return;
  DU.busy = true; DU.err = ""; if (duVisible()) renderDuels();
  try { const r = await duRpc(fn, args); if (after) after(r); }
  catch (e) { console.warn("Duel:", e); DU.err = duErr(e); }
  DU.busy = false;
  if (duVisible()) renderDuels();
}
function duChallenge(oppId) {
  const bet = Math.floor(Number(DU.bet));
  if (!(bet >= 1)) { DU.err = "Choose a bet of at least 1."; return renderDuels(); }
  if (bet > state.money) { DU.err = "You don't have enough money for this bet."; return renderDuels(); }
  if (typeof profPushStats === "function") profPushStats();   // the referee checks the money on your profile
  duDo("duel_invite", { p_opp: oppId, p_game: DU.game, p_bet: bet }, () => { setTimeout(duPending, 300); });
}

/* ----- 📨 a challenge for you (pop-up anywhere in the game) ----- */
function duShowInvite() {
  const ids = Object.keys(DU.invites);
  if (DU.shownInvite && !DU.invites[DU.shownInvite]) {   // it expired or was cancelled
    if (!$("modal").hidden && $("modalBox").querySelector("[data-du-inv]")) hideModal();
    DU.shownInvite = null;
  }
  if (DU.shownInvite || !ids.length || DU.cur || !$("modal").hidden) return;
  const v = DU.invites[ids[0]], p = duPerson(v), g = DU_GAMES[v.game], can = state.money >= v.bet;
  DU.shownInvite = String(v.id);
  showModal(`<div class="duInvite" data-du-inv="${v.id}"><img class="duInvIco" src="${g.ico}" alt="">
    <h2>⚔️ You've been challenged!</h2>
    <div class="duInvWho">${profAvatarImg(p.avatar, "frAv")}<b data-noi18n>${escapeHtml(p.nick)}</b></div>
    <p>challenges you to <b>${g.name}</b> for <b>${fmt(v.bet)}</b>.</p>
    <p class="muted">${g.rules} The winner takes both bets minus a 2% fee.</p>
    <p>🏆 Win: <b>+${fmt(duWinAmt(v.bet))}</b> · 💸 Lose: <b>−${fmt(v.bet)}</b></p>
    ${can ? "" : `<p class="profErr">You need ${fmt(v.bet)} to accept (you have ${fmt(state.money)}).</p>`}
    <p class="muted">Expires in <b id="duInvT">${Math.ceil(v.secs_left || 0)}</b> s</p>
    <div class="row" style="justify-content:center;gap:10px"><button class="btn ghost" data-du="decline" data-id="${v.id}">Decline</button>
      <button class="btn big" data-du="accept" data-id="${v.id}" ${can ? "" : "disabled"}>⚔️ Accept</button></div></div>`);
  const until = Date.now() + (v.secs_left || 0) * 1000;
  const t = setInterval(() => { const el = $("duInvT"); if (!el) return clearInterval(t); const s = Math.max(0, Math.ceil((until - Date.now()) / 1000)); el.textContent = s;
    if (!s) { clearInterval(t); hideModal(); DU.shownInvite = null; } }, 500);
}

/* ----- 🖼️ the page ----- */
const duVisible = () => state.view === "casino" && state.casinoPage === "online" && !document.hidden;
function duFriendsHtml() {
  if (typeof fr === "undefined") return "";
  if (!fr.loaded && !fr.loading) frLoad(true);
  const list = fr.rows.filter(r => r.status === "accepted").map(r => fr.people[frOther(r)]).filter(Boolean)
    .sort((a, b) => (frOnline(b) - frOnline(a)) || String(a.nickname).localeCompare(String(b.nickname)));
  if (!list.length) return `<p class="muted">You have no friends to challenge yet. Add some in 👤 Profile → 👥 Friends.</p>`;
  return `<div class="frList">${list.map(p => `<div class="frRow ${frOnline(p) ? "" : "off"}"><span class="frWho">${profAvatarImg(p.avatar, "frAv")}${frDot(p)}<span class="frName" data-noi18n>${escapeHtml(p.nickname)}</span>
      ${"money" in p ? `<span class="frMini">${profCoinImg(p.coin, "duCoinS")} ${fmt(Number(p.money) || 0)}</span>` : ""}</span>
    <span class="frBtns">${frOnline(p) ? `<button class="btn small" data-du="challenge" data-id="${p.user_id}" ${DU.busy || DU.out ? "disabled" : ""}><img class="ico" src="assets/duel/ico-duel.webp" alt="">Challenge</button>` : `<span class="muted">Offline</span>`}</span></div>`).join("")}</div>`;
}
function duOddsHtml() {   // what this bet wins or loses
  const b = Math.floor(Number(DU.bet));
  return b >= 1 ? `🏆 Win: <b>+${fmt(duWinAmt(b))}</b> · 💸 Lose: <b>−${fmt(b)}</b>` : "";
}
function duLobbyHtml() {
  const st = state.duels, typed = DU.bet;   // the box keeps DU.bet up to date (input event)
  const games = Object.entries(DU_GAMES).map(([k, g]) => `<button class="duGame ${DU.game === k ? "on" : ""}" data-du="game" data-g="${k}"><img src="${g.ico}" alt=""><b>${g.name}</b><span>${g.rules}</span>
    <span class="duRec">🏆 ${st[k].w} · ❌ ${st[k].l}</span></button>`).join("");
  return `<div class="card"><h3 style="margin-top:0">1. Choose a game</h3><div class="duGames">${games}</div></div>
    <div class="card"><h3 style="margin-top:0">2. Your bet</h3>
      <div class="moneyRow"><input id="duBet" type="number" min="1" placeholder="Amount" value="${escapeHtml(typed || "")}" aria-label="Bet">
        <button class="btn ghost small" data-du="pct" data-p="0.01">1%</button><button class="btn ghost small" data-du="pct" data-p="0.1">10%</button>
        <button class="btn ghost small" data-du="pct" data-p="0.25">25%</button><button class="btn ghost small" data-du="pct" data-p="0.5">50%</button></div>
      <div class="muted">You have ${fmt(state.money)}. Your friend must have at least the same. The winner takes both bets minus a 2% fee.</div>
      <div class="duOdds" id="duOdds">${duOddsHtml()}</div></div>
    ${DU.out ? `<div class="card duWait"><img src="${DU_GAMES[DU.out.game].ico}" alt=""><div><b>⏳ Waiting for <span data-noi18n>${escapeHtml(duPerson(DU.out).nick)}</span> to accept…</b>
        <div class="muted">${DU_GAMES[DU.out.game].name} · bet ${fmt(DU.out.bet)} · expires in <span data-du-t="${Date.now() + (DU.out.secs_left || 0) * 1000}">${Math.ceil(DU.out.secs_left || 0)}</span> s</div></div>
        <button class="btn ghost small" data-du="cancel" data-id="${DU.out.id}">Cancel</button></div>` : ""}
    <div class="card"><h3 style="margin-top:0">3. Challenge a friend</h3>${duFriendsHtml()}</div>
    <div class="card duStats"><span>✊ Rock Paper Scissors: <b>${st.rps.w}</b> won · <b>${st.rps.l}</b> lost</span><span>🎲 Dice Battle: <b>${st.dice.w}</b> won · <b>${st.dice.l}</b> lost</span>
      <span>💰 Won <b>${fmt(st.won)}</b> · lost <b>${fmt(st.lost)}</b></span></div>`;
}
function duMatchHtml(v) {
  const g = DU_GAMES[v.game], p = duPerson(v), me = prof.row || {}, now = Date.now();
  const showing = DU.res && now < DU.res.until ? DU.res.e : null, fin = v.status === "done";
  const last = fin ? (v.log || [])[(v.log || []).length - 1] : showing;
  const mine = last ? last[v.me] : v.my_pick, theirs = last ? last[v.me === "a" ? "b" : "a"] : (v.opp_moved ? "?" : null);
  let say;
  if (fin) say = v.won ? `🏆 You won the duel! +${fmt(duWinAmt(v.bet))}` : `💸 You lost the duel. −${fmt(v.bet)}`;
  else if (showing) say = !showing.w ? (v.game === "rps" ? "🤝 Draw! Play again." : "🤝 Same total! Roll again.") : showing.w === v.me ? "✅ You win this round!" : "❌ They win this round.";
  else if (v.my_pick) say = `⏳ Waiting for <span data-noi18n>${escapeHtml(p.nick)}</span>…`;
  else say = v.game === "rps" ? "Pick your hand!" : "Roll your dice!";
  const tk = v.id + ":" + v.round + ":" + v.status;   // the end of this round's timer, fixed once (so the page only changes when something happens)
  if (DU.tKey !== tk) { DU.tKey = tk; DU.tEnd = now + (v.secs_left || 0) * 1000; }
  const left = fin || showing ? "" : `<span class="duTimer">⏱️ <b data-du-t="${DU.tEnd}"></b></span>`;
  const stage = v.game === "rps"
    ? `<div class="duSide">${duHand(mine)}</div><div class="duVs">VS</div><div class="duSide">${duHand(theirs, true)}</div>`
    : `<div class="duSide duDice">${duDice(mine)}${mine && /,/.test(mine) ? `<b class="duSum">${duSum(mine)}</b>` : ""}</div><div class="duVs">VS</div>
       <div class="duSide duDice">${duDice(theirs !== "?" ? theirs : null)}${theirs && /,/.test(theirs) ? `<b class="duSum">${duSum(theirs)}</b>` : theirs === "?" ? `<b class="duSum">✔️</b>` : ""}</div>`;
  const controls = fin
    ? `<div class="duEnd">${v.reason === "left" ? `<p>${v.won ? "Your friend left the duel." : "You were away for too long."}</p>` : v.reason === "resign" ? `<p>${v.won ? "Your friend gave up." : "You gave up."}</p>` : ""}
        <button class="btn big" data-du="back">⚔️ Back to the online casino</button></div>`
    : v.game === "rps"
      ? `<div class="duPicks">${DU_PICKS.map(k => `<button class="duPick ${v.my_pick === k ? "on" : ""}" data-du="pick" data-k="${k}" ${v.my_pick || showing || DU.busy ? "disabled" : ""}><img src="assets/duel/hand-${k}.webp" alt=""><span>${k[0].toUpperCase() + k.slice(1)}</span></button>`).join("")}</div>`
      : `<div class="duPicks"><button class="btn big duRoll" data-du="roll" ${v.my_pick || showing || DU.busy ? "disabled" : ""}>🎲 Roll</button></div>`;
  return `<div class="card duMatch ${v.game}" style="background-image:url('${g.bg}')">
    <div class="duTop"><div class="duPl">${profAvatarImg(me.avatar, "frAv")}<b data-noi18n>${escapeHtml(me.nickname || "You")}</b><span class="duScore">${v.my_score}</span></div>
      <div class="duMid"><b>${g.name}</b><span>Round ${v.round} · Bet ${fmt(v.bet)}</span>${left}</div>
      <div class="duPl r"><span class="duScore">${v.opp_score}</span><b data-noi18n>${escapeHtml(p.nick)}</b>${profAvatarImg(p.avatar, "frAv")}</div></div>
    <div class="duStage">${stage}</div>
    <div class="duSay ${fin ? (v.won ? "win" : "lose") : ""}">${say}</div>
    ${controls}
    ${fin ? "" : `<button class="btn ghost small duGiveUp" data-du="resign">Give up</button>`}</div>`;
}
function renderDuels() {
  const box = $("onlineCasino"); if (!box) return;
  const typing = document.activeElement && document.activeElement.id === "duBet";
  let body;
  if (typeof cloud !== "object" || !cloud.sb || !cloud.user) body = `<div class="card"><p>Sign in with Google and create your profile to play against your friends.</p><button class="btn" data-du="signin"><span class="gIcon">G</span>Sign in with Google</button></div>`;
  else if (!prof.row) body = `<div class="card"><p>Create your profile first (👤 Profile: choose a nickname). Then add friends and challenge them.</p><button class="btn" data-du="profile">👤 Open my profile</button></div>`;
  else if (prof.friendsOn === false || DU.off) body = `<div class="card"><p>The online casino isn't switched on yet. Please try again later.</p></div>`;
  else if (DU.final) body = duMatchHtml(DU.final);
  else if (DU.cur) body = duMatchHtml(DU.cur);
  else { if (typing) return; body = duLobbyHtml(); }
  const html = `<div class="card duHead"><img src="assets/duel/ico-duel.webp" alt=""><div><h2 style="margin:0">Online casino</h2>
      <div class="muted">Play against your friends. The winner takes both bets minus a 2% fee.</div></div></div>
    ${DU.err ? `<div class="card profErr">❌ ${DU.err}</div>` : ""}${body}`;
  if (html === DU.html && box.firstChild) return;   // nothing changed: don't redraw (keeps the dice and hands from popping again)
  DU.html = html; box.innerHTML = html;
  box.querySelectorAll("[data-du-t]").forEach(el => { el.textContent = Math.max(0, Math.ceil((Number(el.dataset.duT) - Date.now()) / 1000)); });
}
// ⏱️ the countdowns on the page tick by themselves
setInterval(() => { document.querySelectorAll("[data-du-t]").forEach(el => { const s = Math.max(0, Math.ceil((Number(el.dataset.duT) - Date.now()) / 1000)); if (el.textContent !== String(s)) el.textContent = s; });
  if (DU.res && Date.now() >= DU.res.until && duVisible()) { DU.res = null; renderDuels(); } }, 250);

/* ----- 🔘 clicks ----- */
document.addEventListener("click", (e) => {
  const b = e.target.closest("[data-du]"); if (!b) return;
  const inPage = $("onlineCasino") && $("onlineCasino").contains(b), inModal = $("modalBox").contains(b);
  if (!inPage && !inModal) return;
  const k = b.dataset.du, id = Number(b.dataset.id);
  if (k === "signin" && typeof cloudSignIn === "function") cloudSignIn();
  if (k === "profile") showView("profile");
  if (k === "game") { DU.game = b.dataset.g; renderDuels(); }
  if (k === "pct") { DU.bet = String(Math.max(1, Math.floor(state.money * Number(b.dataset.p)))); DU.err = ""; renderDuels(); }
  if (k === "challenge") duChallenge(b.dataset.id);
  if (k === "cancel") duDo("duel_cancel", { p_id: id }, () => { DU.out = null; });
  if (k === "accept" || k === "decline") {
    const inv = DU.invites[id]; hideModal(); DU.shownInvite = null; delete DU.invites[id];
    if (k === "accept" && inv && state.money < inv.bet) return;
    duDo("duel_respond", { p_id: id, p_accept: k === "accept" }, (v) => { if (v && v.status === "active") duStart(v); });
  }
  if (k === "pick" && DU.cur) duDo("duel_move", { p_id: DU.cur.id, p_pick: b.dataset.k }, duUpdate);
  if (k === "roll" && DU.cur) duDo("duel_move", { p_id: DU.cur.id, p_pick: "roll" }, duUpdate);
  if (k === "resign" && DU.cur) showModal(`<h2>Give up?</h2><p>Your friend wins the duel and your bet of <b>${fmt(DU.cur.bet)}</b>.</p>
    <div class="row" style="justify-content:center;gap:10px"><button class="btn ghost" data-modal="close">Keep playing</button><button class="btn dangerBtn" data-du="resignYes">Give up</button></div>`);
  if (k === "resignYes" && DU.cur) { hideModal(); duDo("duel_cancel", { p_id: DU.cur.id }, duUpdate); }
  if (k === "back") { DU.final = null; DU.cur = null; DU.res = null; duPending(); renderDuels(); }
});
document.addEventListener("input", (e) => { if (e.target.id === "duBet") { DU.bet = e.target.value; if (DU.err) { DU.err = ""; } const o = $("duOdds"); if (o) o.innerHTML = duOddsHtml(); } });

/* ----- 🎰 the page switch on the left of the Casino ----- */
function duApplyPage() {
  const online = state.casinoPage === "online";
  $("casinoView").classList.toggle("onlineMode", online);
  $("onlineCasino").hidden = !online;
  document.querySelectorAll("[data-caspage]").forEach(b => b.classList.toggle("active", b.dataset.caspage === (online ? "online" : "casino")));
  if (online) { renderDuels(); duPending(); }
}
(function duSetup() {
  const view = $("casinoView");
  if ($("casTabs")) return;
  const layout = document.createElement("div"); layout.className = "subLayout"; layout.id = "casLayout";
  layout.innerHTML = `<nav class="subNav" id="casTabs"><button class="subTab" data-caspage="casino"><img class="ico" src="assets/icons/ico-ui-casino.webp" alt="">Casino</button>
    <button class="subTab" data-caspage="online"><img class="ico" src="assets/duel/ico-duel.webp" alt="">Online casino</button></nav><div class="subMain" id="casMain"></div>`;
  const main = layout.querySelector("#casMain");
  [...view.children].filter(el => !el.classList.contains("debtBanner")).forEach(el => main.appendChild(el));
  const oc = document.createElement("div"); oc.id = "onlineCasino"; oc.hidden = true; main.appendChild(oc);
  view.appendChild(layout);
  layout.querySelector("#casTabs").addEventListener("click", (e) => {
    const t = e.target.closest("[data-caspage]"); if (!t) return;
    state.casinoPage = t.dataset.caspage; save(); duApplyPage();
  });
  duApplyPage();
})();
const duShowViewOrig = showView;
showView = function (v) { duShowViewOrig(v); if (v === "casino") duApplyPage(); };

/* ----- ⏱️ checking for challenges and results ----- */
setInterval(() => {
  if (document.hidden || !duOn() || DU.cur) return;
  const every = DU.out || duVisible() ? 2500 : 6000;   // faster while waiting for an answer or looking at the page
  if (Date.now() - DU.pendAt >= every - 100) duPending();
}, 1000);
