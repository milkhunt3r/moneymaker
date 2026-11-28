/* Empire of Coins © 2026 milkhunt3r. All rights reserved. */
/* =====================================================================
   ⚔️ ONLINE CASINO: duels against friends (🎰 Casino → ⚔️ Online casino on the left).
   · ✊✋✌️ Rock Paper Scissors (best of 3) and 🎲 Dice Battle (each round both secretly pick 2–5 dice; any 1 scores 0; best of 3 or 5); a tie is played again.
   · 💰 Bluff Chest (hide the coin in 1 of 3 chests + an optional sparkle, then the other guesses; roles swap; first to 3 with equal hides) and 🏁 Race to 42 (push-your-luck dice, a 1 busts the turn).
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
    rules: "Each round, both pick 2 to 5 dice in secret and roll. Any 1 scores 0, otherwise the total counts. The higher score wins the round; a tie is rolled again. Best of 3." },
  chest: { name: "Bluff Chest", ico: "assets/duel/ico-chest.webp", bg: "assets/duel/bg-cave.webp",
    rules: "Take turns: one hides the coin in one of 3 chests and may put a sparkle on any chest (a tip or a trick), then the other guesses. Found: the guesser scores. Missed: the hider scores. First to 3, but both always hide equally often: a tie keeps going." },
  race: { name: "Race to 42", ico: "assets/duel/ico-race.webp", bg: "assets/duel/bg-race.webp",
    rules: "Take turns rolling a die as often as you dare, then Bank your points. Rolling a 1 loses this turn's points. First to 42 wins. The second to roll starts with 4 points." },
};
const DU_NEED = { rps: 2, dice: 2, chest: 3, race: 21 };
// 🏁 every race goes to 42 (a race started before the server update, or on an old server without "goal", goes to 21)
const duGoalOf = (v) => (v && Number(v.goal) === 42 ? 42 : 21);
// 🎲 Dice Battle: best of 3 or 5, chosen when you challenge; each round you pick 2–5 dice (a 1 scores 0)
const duBestOf = (v) => (v && Number(v.best) === 5 ? 5 : 3);
const DU_ZERO = { 2: 31, 3: 42, 4: 52, 5: 60 };   // % chance that n dice show at least one 1
const duDiceScore = (roll) => { const r = String(roll || "").split(",").map(Number); return r.includes(1) ? 0 : r.reduce((s, n) => s + n, 0); };
const duNeed = (v) => v.game === "chest" ? 3 : v.game === "dice" && duBestOf(v) === 5 ? 3 : 2;
const duName = (k, goal, best) => k === "race" && goal === 21 ? "Race to 21" : k === "dice" && best === 5 ? "Dice Battle (best of 5)" : DU_GAMES[k].name;
const duRules = (k, goal, best) => k === "race" && goal === 21 ? DU_GAMES.race.rules.replace("First to 42 wins. The second to roll starts with 4 points.", "First to 21 wins.")
  : k === "dice" && best === 5 ? DU_GAMES.dice.rules.replace("Best of 3.", "Best of 5.") : DU_GAMES[k].rules;
if (!state.duels || typeof state.duels !== "object") state.duels = {};
Object.keys(DU_GAMES).forEach(g => { state.duels[g] = state.duels[g] || { w: 0, l: 0 }; });
state.duels.won = state.duels.won || 0; state.duels.lost = state.duels.lost || 0;
const DU = { game: "rps", bet: "", cur: null, out: null, invites: {}, shownInvite: null, busy: false, err: "",
  best: state.duBest === 5 ? 5 : 3, diceN: [2, 3, 4, 5].includes(state.duDiceN) ? state.duDiceN : 3, shake: 0, myRollAt: 0, res: null, lastLog: 0, ticking: false, pendAt: 0, final: null };
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
  if (n > DU.lastLog) { DU.res = { e: v.log[n - 1], at: Date.now(), until: Date.now() + (v.game === "race" ? 1200 : v.game === "dice" ? 3400 : v.game === "chest" ? 3300 : 3000) }; DU.lastLog = n; }
  if (v.game === "dice" && v.my_pick && !(DU.cur && DU.cur.my_pick && DU.cur.round === v.round)) { DU.myRollAt = Date.now(); DU.myRollRound = v.round; }   // 🎲 your dice just landed
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
      if (!DU.final || DU.final.id !== v.id) showNotice(amt > 0 ? `⚔️ You won your ${duName(v.game, duGoalOf(v))} duel against ${duPerson(v).nick}: +${fmt(amt)}!` : `⚔️ You lost your ${duName(v.game, duGoalOf(v))} duel against ${duPerson(v).nick}: −${fmt(-amt)}.`);
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
  const args = { p_opp: oppId, p_game: DU.game, p_bet: bet };
  if (DU.game === "race") args.p_goal = 42;
  if (DU.game === "dice") args.p_best = DU.best;
  duDo("duel_invite", args, () => { setTimeout(duPending, 300); });
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
    <p>challenges you to <b>${duName(v.game, duGoalOf(v), duBestOf(v))}</b> for <b>${fmt(v.bet)}</b>.</p>
    <p class="muted">${duRules(v.game, duGoalOf(v), duBestOf(v))} The winner takes both bets minus a 2% fee.</p>
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
    .sort((a, b) => ((b.user_id === DU.pick) - (a.user_id === DU.pick)) || (frOnline(b) - frOnline(a)) || String(a.nickname).localeCompare(String(b.nickname)));   // ⚔️ the friend picked on the Friends page comes first
  if (!list.length) return `<p class="muted">You have no friends to challenge yet. Add some in 👤 Profile → 👥 Friends.</p>`;
  const picked = list.find(p => p.user_id === DU.pick);
  return `${picked ? `<p class="duPickHint" data-noi18n>${LANG === "es" ? `⚔️ Elige un juego y una apuesta arriba, y pulsa <b>Retar</b> junto a <b>${escapeHtml(picked.nickname)}</b>.` : `⚔️ Choose a game and a bet above, then press <b>Challenge</b> next to <b>${escapeHtml(picked.nickname)}</b>.`}</p>` : ""}<div class="frList">${list.map(p => `<div class="frRow ${frOnline(p) ? "" : "off"} ${p.user_id === DU.pick ? "pick" : ""}"><span class="frWho">${profAvatarImg(p.avatar, "frAv")}${frDot(p)}<span class="frName" data-noi18n>${escapeHtml(p.nickname)}</span>
      ${"money" in p ? `<span class="frMini">${profCoinImg(p.coin, "duCoinS")} ${fmt(Number(p.money) || 0)}</span>` : ""}</span>
    <span class="frBtns">${frOnline(p) ? `<button class="btn small" data-du="challenge" data-id="${p.user_id}" ${DU.busy || DU.out ? "disabled" : ""}><img class="ico" src="assets/duel/ico-duel.webp" alt="">Challenge</button>` : `<span class="muted">Offline</span>`}</span></div>`).join("")}</div>`;
}
function duOddsHtml() {   // what this bet wins or loses
  const b = Math.floor(Number(DU.bet));
  return b >= 1 ? `🏆 Win: <b>+${fmt(duWinAmt(b))}</b> · 💸 Lose: <b>−${fmt(b)}</b>` : "";
}
function duLobbyHtml() {
  const st = state.duels, typed = DU.bet;   // the box keeps DU.bet up to date (input event)
  const games = Object.entries(DU_GAMES).map(([k, g]) => `<button class="duGame ${DU.game === k ? "on" : ""}" data-du="game" data-g="${k}"><img src="${g.ico}" alt=""><b>${g.name}</b><span>${duRules(k, 42, k === "dice" ? DU.best : 3)}</span>
    <span class="duRec">🏆 ${st[k].w} · ❌ ${st[k].l}</span></button>`).join("");
  const best = DU.game === "dice" ? `<div class="duBestPick"><span>Match length:</span>${[3, 5].map(n =>
    `<button class="seg ${DU.best === n ? "on" : ""}" data-du="best" data-n="${n}">Best of ${n}</button>`).join("")}</div>` : "";
  return `<div class="card"><h3 style="margin-top:0">1. Choose a game</h3><div class="duGames">${games}</div>${best}</div>
    <div class="card"><h3 style="margin-top:0">2. Your bet</h3>
      <div class="moneyRow"><input id="duBet" type="number" min="1" placeholder="Amount" value="${escapeHtml(typed || "")}" aria-label="Bet">
        <button class="btn ghost small" data-du="pct" data-p="0.01">1%</button><button class="btn ghost small" data-du="pct" data-p="0.1">10%</button>
        <button class="btn ghost small" data-du="pct" data-p="0.25">25%</button><button class="btn ghost small" data-du="pct" data-p="0.5">50%</button></div>
      <div class="muted">You have ${fmt(state.money)}. Your friend must have at least the same. The winner takes both bets minus a 2% fee.</div>
      <div class="duOdds" id="duOdds">${duOddsHtml()}</div></div>
    ${DU.out ? `<div class="card duWait"><img src="${DU_GAMES[DU.out.game].ico}" alt=""><div><b>⏳ Waiting for <span data-noi18n>${escapeHtml(duPerson(DU.out).nick)}</span> to accept…</b>
        <div class="muted">${duName(DU.out.game, duGoalOf(DU.out), duBestOf(DU.out))} · bet ${fmt(DU.out.bet)} · expires in <span data-du-t="${Date.now() + (DU.out.secs_left || 0) * 1000}">${Math.ceil(DU.out.secs_left || 0)}</span> s</div></div>
        <button class="btn ghost small" data-du="cancel" data-id="${DU.out.id}">Cancel</button></div>` : ""}
    <div class="card"><h3 style="margin-top:0">3. Challenge a friend</h3>${duFriendsHtml()}</div>
    <div class="card duStats"><span>✊ Rock Paper Scissors: <b>${st.rps.w}</b> won · <b>${st.rps.l}</b> lost</span><span>🎲 Dice Battle: <b>${st.dice.w}</b> won · <b>${st.dice.l}</b> lost</span>
      <span>💰 Bluff Chest: <b>${st.chest.w}</b> won · <b>${st.chest.l}</b> lost</span><span>🏁 Race to 42: <b>${st.race.w}</b> won · <b>${st.race.l}</b> lost</span>
      <span>💰 Won <b>${fmt(st.won)}</b> · lost <b>${fmt(st.lost)}</b></span></div>`;
}
// 💰 Bluff Chest: odd rounds a hides and b guesses, even rounds the other way round (both always hide equally often).
// The hider hides the coin and may put a ✨ sparkle on any chest (a tip or a trick); then the guesser guesses.
const duChestRole = (v) => ((v.round % 2 === 1) === (v.me === "a") ? "hide" : "guess");
const duChestPick = (p) => { const [c, h] = String(p || "").split(","); return { coin: c || "", hint: h && h !== "0" ? h : "" }; };
const duSpark = () => `<i class="duSpark"></i>`;
function duChestSel(v) {   // your choice while hiding (reset every round)
  const key = v.id + ":" + v.round;
  if (!DU.chest || DU.chest.key !== key) DU.chest = { key, coin: "", hint: "" };
  return DU.chest;
}
function duChestStage(v, last, fin, showing) {
  const role = duChestRole(v), now = Date.now(), K = ["1", "2", "3"];
  const banner = fin || showing ? "" : `<div class="duRole ${role}"><img src="assets/duel/chest-${role === "hide" ? "gold" : "glass"}.webp" alt=""><span>${role === "hide" ? "You hide" : "You guess"}</span></div>`;
  if (last && (showing || fin)) {   // 🎉 the result: the guessed chest wobbles and opens, then the others show where the coin was
    const hider = last.r % 2 === 1 ? "a" : "b", guesser = hider === "a" ? "b" : "a", { coin, hint } = duChestPick(last[hider]), guess = last[guesser];
    const age = showing && DU.res ? now - DU.res.at : 1e9, fresh = age < 2600;
    const d = (ms) => `--d:${ms - age}ms`;
    return `<div class="duChests reveal">${K.map(k => {
      const open = `assets/duel/chest-${k === coin ? "coin" : "empty"}.webp`, at = k === guess ? 750 : 1500;
      const fx = k === guess ? (k === coin ? `<i class="duBurst" style="${d(at)}"></i>` : `<i class="duDust" style="${d(at)}"></i>`) : "";
      return `<div class="duChest ${k === guess ? "guess" : ""} ${k === coin ? "coin" : ""}">
        ${fresh ? `<img class="duShut${k === guess ? " wob" : ""}" style="${d(at)}" src="assets/duel/chest-closed.webp" alt=""><img class="duOpen" style="${d(at)}" src="${open}" alt="">` : `<img src="${open}" alt="">`}
        ${fresh ? fx : ""}${k === hint ? duSpark() : ""}${k === guess ? `<img class="duGlass" src="assets/duel/chest-glass.webp" alt="">` : ""}</div>`; }).join("")}</div>`;
  }
  if (role === "hide") {
    const mine = duChestPick(v.my_pick), sel = duChestSel(v), done = !!v.my_pick, c = done ? mine.coin : sel.coin, h = done ? mine.hint : sel.hint;
    return `${banner}<div class="duChests">${K.map(k => `<button class="duChest ${k === c ? "on" : ""}" data-du="ccoin" data-k="${k}" ${done || DU.busy || fin ? "disabled" : ""}>
      <img src="assets/duel/chest-closed.webp" alt="">${k === c ? `<img class="duMark" src="assets/duel/chest-gold.webp" alt="">` : ""}${k === h ? duSpark() : ""}</button>`).join("")}</div>`;
  }
  const ready = !!v.opp_moved, hint = ready && v.hint && v.hint !== "0" ? String(v.hint) : "";
  return `${banner}<div class="duChests ${ready ? "" : "waiting"}">${K.map(k => `<button class="duChest ${v.my_pick === k ? "on" : ""}" data-du="pick" data-k="${k}" ${!ready || v.my_pick || DU.busy || fin ? "disabled" : ""}>
    <img src="assets/duel/chest-closed.webp" alt="">${k === hint ? duSpark() : ""}${v.my_pick === k ? `<img class="duMark" src="assets/duel/chest-glass.webp" alt="">` : ""}</button>`).join("")}</div>`;
}
function duChestControls(v, showing) {
  if (showing || duChestRole(v) !== "hide" || v.my_pick) return "";
  const sel = duChestSel(v);
  if (!sel.coin) return "";
  return `<div class="duPicks"><button class="btn big duRoll" data-du="chide" ${DU.busy ? "disabled" : ""}><img class="ico" src="assets/duel/chest-gold.webp" alt=""><span>Hide the coin</span></button>
    <button class="btn ghost" data-du="creset">Start over</button></div>`;
}
function duChestSay(v, showing) {
  const p = duPerson(v), who = `<span data-noi18n>${escapeHtml(p.nick)}</span>`;
  if (showing) { const hider = showing.r % 2 === 1 ? "a" : "b", found = duChestPick(showing[hider]).coin === showing[hider === "a" ? "b" : "a"];
    return found ? (hider === v.me ? "🔍 They found your coin!" : "🎉 You found the coin!") : (hider === v.me ? "😏 They missed: your coin stays hidden!" : "💨 Empty! The coin was elsewhere."); }
  if (duChestRole(v) === "hide") {
    if (v.my_pick) return `⏳ ${who} is guessing…`;
    return duChestSel(v).coin ? `<div>✨ Add a sparkle? (optional)</div><div class="duTip">Tap any chest to put a sparkle on it: the right one or a trick. Then press Hide the coin.</div>` : "🙈 Hide your coin: pick a chest!";
  }
  if (!v.opp_moved) return `⏳ ${who} is hiding the coin…`;
  if (v.my_pick) return null;
  return v.hint && v.hint !== "0" ? `<div>🔍 Find the coin!</div><div class="duTip">${who} put a sparkle on a chest. A tip or a trick?</div>` : "🔍 Find the coin: pick a chest!";
}
function duChestHide() {
  const v = DU.cur; if (!v || v.game !== "chest" || v.my_pick) return;
  const sel = duChestSel(v); if (!sel.coin) return;
  duDo("duel_move", { p_id: v.id, p_pick: `${sel.coin},${sel.hint || 0}` }, duUpdate);
}
// 🏁 Race to 42: totals are the scores, st = {turn, tp}
// the finished turns, from the log: [{who, dice: [..], kind: "bank" / "bust" / "win", pts}]
function duRaceTurns(log) {
  const out = []; let cur = null;
  for (const e of log || []) {
    if (e.start) { out.push({ who: e.who, dice: [], kind: "start", pts: e.start }); continue; }   // ⚖️ the second to roll starts with 4 points
    if (!cur || cur.who !== e.who) cur = { who: e.who, dice: [] };
    if (e.roll) cur.dice.push(e.roll);
    if (e.bust) { out.push({ ...cur, kind: "bust", pts: e.lost || 0 }); cur = null; }
    else if (e.win) { out.push({ ...cur, kind: "win" }); cur = null; }
    else if ("bank" in e) { out.push({ ...cur, kind: "bank", pts: e.bank }); cur = null; }
  }
  return out;
}
function duRaceHtml(v, fin) {
  const p = duPerson(v), me = prof.row || {}, st = v.st || {}, mine = st.turn === v.me, ev = (v.log || [])[(v.log || []).length - 1];
  const goal = duGoalOf(v), tp = st.tp || 0, now = Date.now();
  // ✨ a fresh event animates once; a redraw in the middle carries on where it was (negative delay)
  const age = DU.res && DU.res.e === ev && DU.res.at ? now - DU.res.at : 1e9, fresh = age < 900;
  const fx = (cls) => fresh ? ` ${cls}" style="animation-delay:-${age}ms` : "";
  const pct = (n) => Math.min(100, n / goal * 100);
  const lane = (who, total, name, av) => {
    const turn = !fin && st.turn === who && tp > 0, bust = fresh && ev && ev.bust && ev.who === who;
    return `<div class="duLane${bust ? fx("bust") : ""}">
      ${turn ? `<div class="duGhostBar" style="left:${pct(total)}%;width:${pct(total + tp) - pct(total)}%"></div>
        <div class="duRunner ghost" style="left:calc(${pct(total + tp)}% - 22px)"><img class="duGhostIco" src="assets/duel/race-ghost.webp" alt=""></div>` : ""}
      <div class="duRunner" style="left:calc(${pct(total)}% - 22px)">${profAvatarImg(av, "frAv")}</div>
      <span class="duLaneName" data-noi18n>${escapeHtml(name)}</span><b class="duLaneTot">${total}${turn ? `<small>+${tp}</small>` : ""}</b><img class="duFlag" src="assets/duel/race-flag.webp" alt=""></div>`;
  };
  const mineName = me.nickname || "You", oppSide = v.me === "a" ? "b" : "a";
  let pic = "", say;
  if (!fin && mine && DU.busy) pic = `<img class="duDie big spin" src="assets/duel/die-rolling.webp" alt="">`;   // 🎲 rolling…
  else if (ev && ev.bust) pic = `<img class="duBust${fx("fresh")}" src="assets/duel/race-bust.webp" alt="">`;
  else if (ev && ev.roll) pic = `<img class="duDie big${fx("tumble")}" src="assets/duel/die-${ev.roll}.webp" alt="${ev.roll}">`;
  else if (ev && "bank" in ev) pic = `<img class="duBank${fx("fresh")}" src="assets/duel/race-bank.webp" alt="">`;
  const whoEv = ev ? (ev.who === v.me ? "You" : p.nick) : "";
  const evWho = (txt) => whoEv === "You" ? txt.you : `<span data-noi18n>${escapeHtml(whoEv)}</span> ${txt.them}`;
  const parts = [];
  if (!fin && ev && ev.bust && !st.tp) parts.push(`💥 ${evWho({ you: "You rolled a 1 and lost", them: "rolled a 1 and lost" })} ${ev.lost} points!`);
  if (!fin && ev && "bank" in ev && !st.tp) parts.push(`💰 ${evWho({ you: "You banked", them: "banked" })} ${ev.bank} points.`);
  if (!fin) parts.push(mine ? (st.tp ? `🎲 This turn: <b>${st.tp}</b> points. Roll again or Bank?` : "🎲 Your turn: roll the die!")
    : `⏳ <span data-noi18n>${escapeHtml(p.nick)}</span>'s turn${st.tp ? `: <b>${st.tp}</b> points this turn` : ""}…`);
  const myTotal = v.my_score;
  if (!fin && mine) parts.push(`<span class="duTip">You need <b>${Math.max(0, goal - myTotal - tp)}</b> more · each roll has a 1 in 6 chance to lose ${tp ? `these <b>${tp}</b> points` : "this turn's points"}.</span>`);
  say = parts.length ? parts.map(x => `<div>${x}</div>`).join("") : null;
  // 📜 the last turns, newest first
  const turns = duRaceTurns(v.log).slice(-4).reverse();
  const hist = turns.length ? `<ul class="duHist">${turns.map(t => {
    const you = t.who === v.me, img = t.kind === "bust" ? "race-bust" : t.kind === "win" || t.kind === "start" ? "race-flag" : "race-bank";
    const txt = t.kind === "start" ? (you ? `You start with ${t.pts}` : `starts with ${t.pts}`) : t.kind === "bust" ? (you ? `You lost ${t.pts}` : `lost ${t.pts}`) : t.kind === "win" ? (you ? "You won!" : "won!") : (you ? `You banked ${t.pts}` : `banked ${t.pts}`);
    return `<li class="${t.kind}"><img class="duHIco" src="assets/duel/${img}.webp" alt="">${you ? "" : `<span class="duHWho" data-noi18n>${escapeHtml(p.nick)}</span>`} ${txt} <span class="duHDice">${t.dice.map(n => `<img src="assets/duel/die-${n}.webp" alt="${n}">`).join("")}</span></li>`; }).join("")}</ul>` : "";
  const bankTo = st.tp && mine ? ` → ${myTotal + tp} / ${goal}` : "";
  const controls = fin ? "" : `<div class="duPicks"><button class="btn big duRoll" data-du="roll" ${mine && !DU.busy ? "" : "disabled"}>🎲 Roll</button>
    <button class="btn big duBankBtn" data-du="bank" ${mine && !DU.busy ? "" : "disabled"}><img class="ico" src="assets/duel/race-bank.webp" alt=""><span>Bank${bankTo}</span></button></div>`;
  return { stage: `<div class="duRace">${lane(v.me, v.my_score, mineName, me.avatar)}${lane(oppSide, v.opp_score, p.nick, p.avatar)}<div class="duRacePic">${pic}</div>${hist}</div>`, say, controls };
}
// 🎲 Dice Battle: your dice (or the ones you're shaking) VS theirs; the result rolls in die by die, after a short pause
function duDiceImgs(roll, t0, age, step) {   // t0: first die's delay (ms); age: how long ago it happened (a redraw carries on where it was)
  const r = String(roll).split(","), end = t0 + r.length * step + 600, anim = age < end;
  const dice = r.map((n, i) => `<img class="duDie${n === "1" ? " one" : ""}${anim ? " land" : ""}"${anim ? ` style="--d:${t0 + i * step - age}ms"` : ""} src="assets/duel/die-${n}.webp" alt="${n}">`).join("");
  const sc = duDiceScore(roll);
  return { dice, n: r.length, sum: `<b class="duSum${sc ? "" : " bust"}${anim ? " land" : ""}"${anim ? ` style="--d:${t0 + r.length * step - age}ms"` : ""}>${sc}</b>`, sc, end: end - age };
}
function duDiceStage(v, showing, fin, last) {
  const now = Date.now(), opp = v.me === "a" ? "b" : "a", res = showing || (fin ? last : null);
  const side = (inner, n, cls) => `<div class="duSide duDice n${n} ${cls || ""}">${inner}</div>`;
  if (res && res[v.me] && res[opp]) {   // 🎉 a round result: theirs is revealed now (and yours, if the timer rolled for you)
    const age = showing && DU.res ? now - DU.res.at : 1e9;
    const sawMine = DU.myRollRound === res.r && DU.myRollAt && DU.res && DU.res.at - DU.myRollAt < 20000;
    const m = duDiceImgs(res[v.me], 0, sawMine ? 1e9 : age, 110), t = duDiceImgs(res[opp], 550, age, 150);
    const reveal = Math.max(0, t.end - 400);   // the winner lights up once the last die has landed
    const wl = (who) => !res.w ? "tie" : res.w === who ? "win" : "lose";
    const st = (who) => `${wl(who)}${age < 1e8 && reveal > 0 ? " later" : ""}`;
    const delay = age < 1e8 && reveal > 0 ? ` style="--duRev:${reveal}ms"` : "";
    return `<div class="duSide duDice n${m.n} ${st(v.me)}"${delay}>${m.dice}${m.sum}</div><div class="duVs">VS</div><div class="duSide duDice n${t.n} ${st(opp)}"${delay}>${t.dice}${t.sum}</div>`;
  }
  let mine;
  if (v.my_pick && /^[1-6](,[1-6])+$/.test(v.my_pick)) { const m = duDiceImgs(v.my_pick, 0, now - (DU.myRollAt || 0), 110); mine = side(m.dice + m.sum, m.n); }
  else { const n = DU.diceN; mine = side([6, 5, 4, 3, 2].slice(0, n).map((f, i) => `<img class="duDie ghost${DU.shake ? " shaking" : ""}" style="animation-delay:${-i * 37}ms" src="assets/duel/die-${f}.webp" alt="">`).join(""), n, DU.shake ? "shake" : ""); }
  const theirs = side(`<div class="duDie wait">${v.opp_moved ? "✔️" : "❔"}</div><div class="duDie wait">${v.opp_moved ? "✔️" : "❔"}</div>`, 2, v.opp_moved ? "ready" : "");
  return `${mine}<div class="duVs">VS</div>${theirs}`;
}
function duDiceControls(v, showing) {
  if (v.my_pick || showing) return `<div class="duPicks"><button class="btn big duRoll" data-du="roll" disabled>🎲 Roll</button></div>`;
  const n = DU.diceN;
  return `<div class="duDiceN"><span>Dice:</span>${[2, 3, 4, 5].map(k => `<button class="seg ${n === k ? "on" : ""}" data-du="dicen" data-n="${k}" ${DU.shake ? "disabled" : ""}>${k}</button>`).join("")}</div>
    <div class="duTip">Any 1 scores 0: with ${n} dice that happens ${DU_ZERO[n]}% of the time.</div>
    <div class="duPicks"><button class="btn big duRoll ${DU.shake ? "shaking" : ""}" data-du="roll" ${DU.busy ? "disabled" : ""}>🎲 Roll ${n} dice</button></div>
    <div class="duTip">Hold the button to shake the dice, let go to roll.</div>`;
}
function duRoll() {
  const v = DU.cur; DU.shake = 0;
  if (!v || v.status !== "active" || v.my_pick) return renderDuels();
  duDo("duel_move", { p_id: v.id, p_pick: v.game === "dice" ? String(DU.diceN) : "roll" }, duUpdate);
}
// ✋ hold to shake (dice only; it doesn't change the roll): pressing starts it, letting go anywhere rolls
document.addEventListener("pointerdown", (e) => {
  const b = e.target.closest('[data-du="roll"]');
  if (!b || b.disabled || e.button > 0 || !DU.cur || DU.cur.game !== "dice" || DU.cur.my_pick) return;
  DU.shake = Date.now(); renderDuels();
});
document.addEventListener("pointerup", () => { if (DU.shake) duRoll(); });
document.addEventListener("pointercancel", () => { if (DU.shake) { DU.shake = 0; renderDuels(); } });
// round dots (● won ○ to go) for the best-of games; Race to 42 keeps its points
const duScoreHtml = (v, n) => v.game === "race" ? `<span class="duScore">${n}</span>`
  : `<span class="duPips" title="${n} / ${duNeed(v)}">${Array.from({ length: v.game === "chest" ? Math.max(3, v.my_score, v.opp_score) : duNeed(v) }, (_, i) => `<i class="${i < n ? "on" : ""}"></i>`).join("")}</span>`;
function duMatchHtml(v) {
  const g = DU_GAMES[v.game], p = duPerson(v), me = prof.row || {}, now = Date.now();
  const showing = DU.res && now < DU.res.until ? DU.res.e : null, fin = v.status === "done";
  const last = fin ? (v.log || [])[(v.log || []).length - 1] : showing;
  const mine = last ? last[v.me] : v.my_pick, theirs = last ? last[v.me === "a" ? "b" : "a"] : (v.opp_moved ? "?" : null);
  let say;
  if (fin) say = v.won ? `🏆 You won the duel! +${fmt(duWinAmt(v.bet))}` : `💸 You lost the duel. −${fmt(v.bet)}`;
  else if (v.game === "race") say = null;
  else if (showing && v.game === "chest") say = duChestSay(v, showing);
  else if (showing) say = !showing.w ? (v.game === "rps" ? "🤝 Draw! Play again." : "🤝 Same total! Roll again.") : showing.w === v.me ? "✅ You win this round!" : "❌ They win this round.";
  else if (v.game === "chest") say = duChestSay(v, null);
  else if (v.my_pick) say = `⏳ Waiting for <span data-noi18n>${escapeHtml(p.nick)}</span>…`;
  else say = v.game === "rps" ? "Pick your hand!" : "Pick your dice and roll!";
  const tk = v.id + ":" + v.round + ":" + v.status + (v.game === "chest" ? ":" + !!(duChestRole(v) === "hide" ? v.my_pick : v.opp_moved) : "");   // (Bluff Chest: the guesser's 15 s start once the coin is hidden)   // the end of this round's timer, fixed once (so the page only changes when something happens)
  if (DU.tKey !== tk) { DU.tKey = tk; DU.tEnd = now + (v.secs_left || 0) * 1000; }
  const left = fin || (showing && v.game !== "race") ? "" : `<span class="duTimer">⏱️ <b data-du-t="${DU.tEnd}"></b></span>`;
  const race = v.game === "race" ? duRaceHtml(v, fin) : null;
  if (race && race.say) say = race.say;
  const stage = race ? race.stage : v.game === "chest" ? duChestStage(v, last, fin, showing) : v.game === "rps"
    ? `<div class="duSide">${duHand(mine)}</div><div class="duVs">VS</div><div class="duSide">${duHand(theirs, true)}</div>`
    : duDiceStage(v, showing, fin, last);
  const controls = fin
    ? `<div class="duEnd">${v.reason === "left" ? `<p>${v.won ? "Your friend left the duel." : "You were away for too long."}</p>` : v.reason === "resign" ? `<p>${v.won ? "Your friend gave up." : "You gave up."}</p>` : ""}
        <button class="btn big" data-du="back">⚔️ Back to the online casino</button></div>`
    : race ? race.controls : v.game === "chest" ? duChestControls(v, showing)
    : v.game === "rps"
      ? `<div class="duPicks">${DU_PICKS.map(k => `<button class="duPick ${v.my_pick === k ? "on" : ""}" data-du="pick" data-k="${k}" ${v.my_pick || showing || DU.busy ? "disabled" : ""}><img src="assets/duel/hand-${k}.webp" alt=""><span>${k[0].toUpperCase() + k.slice(1)}</span></button>`).join("")}</div>`
      : duDiceControls(v, showing);
  return `<div class="card duMatch ${v.game}" style="background-image:url('${g.bg}')">
    <div class="duTop"><div class="duPl">${profAvatarImg(me.avatar, "frAv")}<b data-noi18n>${escapeHtml(me.nickname || "You")}</b>${duScoreHtml(v, v.my_score)}</div>
      <div class="duMid"><b>${DU_GAMES[v.game].name}</b><span>${v.game === "race" ? `First to ${duGoalOf(v)} · Bet ${fmt(v.bet)}` : v.game === "dice" ? `Round ${v.round} · Best of ${duBestOf(v)} · Bet ${fmt(v.bet)}` : `Round ${v.round} · Bet ${fmt(v.bet)}`}</span>${left}</div>
      <div class="duPl r">${duScoreHtml(v, v.opp_score)}<b data-noi18n>${escapeHtml(p.nick)}</b>${profAvatarImg(p.avatar, "frAv")}</div></div>
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
      <div class="muted">Play against your friends. The winner takes both bets minus a 2% fee.</div></div>
      <div class="duMoney" title="Your money">${profCoinImg(profCoin(), "duMoneyI")}<b id="duMoney" data-noi18n></b></div></div>
    ${DU.err ? `<div class="card profErr">❌ ${DU.err}</div>` : ""}${body}`;
  if (html === DU.html && box.firstChild) return;   // nothing changed: don't redraw (keeps the dice and hands from popping again)
  DU.html = html; box.innerHTML = html;
  duMoneyTick();
  box.querySelectorAll("[data-du-t]").forEach(el => { el.textContent = Math.max(0, Math.ceil((Number(el.dataset.duT) - Date.now()) / 1000)); });
}
// ⏱️ the countdowns on the page tick by themselves
setInterval(() => { if (DU.shake && DU.cur && DU.cur.status === "active" && DU.tEnd - Date.now() < 700) duRoll();   // ⏱️ still shaking when time runs out: roll
  if (DU.cur && DU.cur.game === "chest" && DU.cur.status === "active" && !DU.cur.my_pick && DU.chest && DU.chest.coin && !DU.busy && DU.tEnd - Date.now() < 700) duChestHide();   // ⏱️ coin chosen but Hide not pressed: hide it
  document.querySelectorAll("[data-du-t]").forEach(el => { const s = Math.max(0, Math.ceil((Number(el.dataset.duT) - Date.now()) / 1000)); if (el.textContent !== String(s)) el.textContent = s; });
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
  if (k === "roll" && DU.cur) duRoll();
  if (k === "ccoin" && DU.cur && DU.cur.game === "chest") { const sel = duChestSel(DU.cur), c = b.dataset.k;   // 💰 1st tap: the coin; then taps place / move / remove the sparkle
    if (!sel.coin) sel.coin = c; else sel.hint = sel.hint === c ? "" : c; renderDuels(); }
  if (k === "chide") duChestHide();
  if (k === "creset" && DU.cur) { DU.chest = null; renderDuels(); }
  if (k === "best") { DU.best = Number(b.dataset.n) === 5 ? 5 : 3; state.duBest = DU.best; save(); renderDuels(); }
  if (k === "dicen") { DU.diceN = Math.max(2, Math.min(5, Number(b.dataset.n) || 3)); state.duDiceN = DU.diceN; save(); renderDuels(); }
  if (k === "bank" && DU.cur) duDo("duel_move", { p_id: DU.cur.id, p_pick: "bank" }, duUpdate);
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
// 💰 your money, live, at the top of the online casino (filled in here so the page itself doesn't redraw every second)
function duMoneyTick() { const m = $("duMoney"); if (m) { const t = fmt(state.money); if (m.textContent !== t) m.textContent = t; } }
setInterval(duMoneyTick, 500);
