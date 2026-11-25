/* Empire of Coins © 2026 milkhunt3r. All rights reserved. */
/* =====================================================================
   💡 TIPS + GUIDED START (Settings → 💡 Show tips)
   · Guided start: 5 small steps for new players; each highlights something and waits until you do it.
   · Tips: a small card the first time something new happens (each tip shows once), with "📖 Read more" → Wiki.
     At most one tip at a time and at least TIP_GAP between tips; they never pause the game.
   Progress (which tips were seen, tutorial step) is part of the saved progress.
   ===================================================================== */
const TIP_GAP = 60000;
const TIPS = {
  staff:     { icon: "🧮", title: "Hiring staff", wiki: "income", text: "Bigger businesses need an accountant and an HR manager before they can hire workers. Pick the ones whose bonus suits you; you can't change them later." },
  special:   { icon: "⭐", title: "Special businesses", wiki: "income", text: "Special businesses need no workers. Most have a requirement first; they show 🔒 until you meet it, so check this page as you grow." },
  taxes:     { icon: "🧾", title: "Taxes", wiki: "general", text: "Your income is taxed. When a tax bill comes you have time to pay it; unpaid bills become debt that grows. Pay with the red banner at the top." },
  casino:    { icon: "🎰", title: "The casino", wiki: "casino", text: "Pick a table and bet straight from your money. Bets give Gambler XP, and every Gambler level gives cashback on lost bets." },
  hot:       { icon: "🔥", title: "Hot Tables", wiki: "casino", text: "Right now one game gets +10 on its XP multiplier for 10 minutes (+20 from Gambler level 50, +40 from level 75). The card under your Gambler level shows which game and how long." },
  freeChips: { icon: "🎁", title: "Free bet chips", wiki: "casino", text: "You earn free chips on a timer. Place them on Roulette, Blackjack, Video Poker or Hold'em: you keep what they win, not the chip itself." },
  invest:    { icon: "📈", title: "Investing", wiki: "investing", text: "Real estate pays rent and can be sold for profit, ETFs grow (and dip) over time, gold is a safe store of value. Money invested also earns Investor XP." },
  live:      { icon: "📡", title: "Live trading", wiki: "investing", text: "These are real crypto prices. Long wins when the price goes up, Short when it goes down. Leverage multiplies profit AND loss: watch the liquidation price." },
  logistics: { icon: "🚢", title: "Logistics", wiki: "logistics", text: "Buy a truck, pick one of its contracts, and it pays when it arrives. Delivering earns Logistics XP, which unlocks agents and more." },
  breakdown: { icon: "🔧", title: "A truck broke down", wiki: "logistics", text: "Broken trucks can't take contracts until repaired: pay the repair on the red truck. Later, a 🛰️ satellite repairs them for free." },
  agent:     { icon: "🤖", title: "Logistics agents", wiki: "logistics", text: "Agents pick a contract for you a few seconds after a truck is free, for a small fee. Turn them on per vehicle type in Logistics." },
  art:       { icon: "🖼️", title: "Art studio", wiki: "art", text: "Copy the painting on the left. The Fill bucket and shape tools (Shift = perfect square/circle) are the fastest way to a high match %." },
  artTier:   { icon: "🔓", title: "A new painting tier", wiki: "art", text: "Harder paintings are worth much more, but are also judged on more detail. Keep practicing on the easier tier if your match drops." },
  science:   { icon: "🔬", title: "Science", wiki: "income", text: "Start with the University: it costs money until it has 50 scientists, then earns. The Research lab and Space Mission Center come after it." },
  prestige:  { icon: "⭐", title: "Prestige", wiki: "general", text: "You can now reset the game for a permanent Legacy bonus. Achievements, levels, cosmetics and your paintings are kept. There's no rush." },
  offline:   { icon: "🌙", title: "Offline earnings", wiki: "general", text: "While the game is closed you earn at 50% for up to 8 hours. Keep the game open (even in a background tab) to earn at full speed." },
  achievements: { icon: "🏆", title: "Achievements", wiki: "achievements", text: "Achievements track your milestones in every part of the game. The counter on the tab shows how many you have." },
};
if (!state.tips) {
  const veteran = (state.companies || []).length > 0 || (state.stats && (state.stats.clicks || 0) > 50);
  state.tips = { on: true, seen: {}, tutorial: veteran ? "skipped" : 0, lastAt: 0 };
}
$("tipsToggle").textContent = `💡 Show tips: ${state.tips.on ? "ON" : "OFF"}`;
const tipQueue = [];
function showTip(id) {
  const T = state.tips;
  if (!T.on || T.seen[id] || !TIPS[id] || tipQueue.includes(id)) return;
  tipQueue.push(id);
}
function tipPump() {
  const T = state.tips, card = $("tipCard");
  if (!T.on) { tipQueue.length = 0; card.hidden = true; return; }
  if (!card.hidden || !tipQueue.length || Date.now() - (T.lastAt || 0) < TIP_GAP) return;
  if (typeof tutActive === "function" && tutActive()) return;   // no tips during the guided start
  if (!$("modal").hidden) return;                              // wait until pop-ups are closed
  const id = tipQueue.shift(), t = TIPS[id];
  if (T.seen[id]) return;
  T.seen[id] = true; T.lastAt = Date.now(); save();
  card.innerHTML = `<div class="tipHead"><span class="tipIcon">${t.icon}</span><b>${t.title}</b><button class="tipX" data-tip="close" aria-label="Close">✕</button></div>
    <div class="tipText">${t.text}</div>
    <div class="tipBtns"><button class="btn small" data-tip="close">Got it</button>
      <button class="btn ghost small" data-tip="wiki" data-wiki-go="${t.wiki}">📖 Read more</button>
      <button class="btn ghost small tipOff" data-tip="off">Turn tips off</button></div>`;
  card.hidden = false;
}
$("tipCard").addEventListener("click", (e) => {
  const b = e.target.closest("[data-tip]"); if (!b) return;
  if (b.dataset.tip === "wiki") { state.wikiPage = b.dataset.wikiGo; showView("wiki"); if (typeof renderWiki === "function") renderWiki(); }
  if (b.dataset.tip === "off") { state.tips.on = false; save(); showNotice("💡 Tips turned off. Turn them back on in ⚙️ Settings."); }
  $("tipCard").hidden = true;
});
// When does each tip appear? Checked every 2 seconds (cheap checks only).
function tipTriggers() {
  if (!state.tips.on) return;
  const v = state.view;
  if (v === "income" && state.incomePage === "special") showTip("special");
  if (state.companies.some(c => !typeOf(c).noStaff && !c.accountant)) showTip("staff");
  if ((state.taxDebts || []).length || state.pendingTaxId !== null) showTip("taxes");
  if (v === "casino") showTip("casino");
  if (v === "casino" && hotNow().active) showTip("hot");
  if (typeof freeUnlocked === "function" && freeUnlocked().length) showTip("freeChips");
  if (v === "invest") showTip(state.investPage === "live" && liveOpen() ? "live" : "invest");
  if (v === "logistics" && logisticsOpen()) showTip("logistics");
  if (logi.trucks.some(t => t.broken)) showTip("breakdown");
  if (logiLevel() >= AGENT_LEVEL.truck) showTip("agent");
  if (v === "art" && state.art && state.art.unlocked) showTip("art");
  if (state.art && state.art.done && (state.art.done.medium || 0) >= ART_TIER_NEED.hard.count) showTip("artTier");
  if (scienceOpen()) showTip("science");
  if (state.prestigeOffered) showTip("prestige");
  if (v === "achievements") showTip("achievements");
}
setInterval(() => { tipTriggers(); tipPump(); }, 2000);

// ----- Guided start -----
let tutClicks = 0;
$("coin").addEventListener("click", () => { tutClicks++; });
const TUT = [
  { target: "#coin", view: "income", text: "👆 <b>Click the coin</b> to earn your first money.", done: () => tutClicks >= 10, progress: () => `${Math.min(tutClicks, 10)} / 10` },
  { target: "#energyBtn", view: "income", text: "⚡ <b>Buy an energy drink.</b> For 30 seconds every click is worth ×5, a quick way to afford your first business.",
    done: () => energyActive() || (state.stats.boostEnergy || 0) > (state.tips.energyBase ?? (state.tips.energyBase = state.stats.boostEnergy || 0)),
    hint: () => state.money < ENERGY_PRICE ? `It costs ${fmt(ENERGY_PRICE)}: keep clicking the coin.` : "Then click the coin as fast as you can!" },
  { target: '[data-action="buy"][data-type="hotdog"]', view: "income", page: "biz", text: "🌭 <b>Buy a Hot Dog Stand.</b> It's your first business: small, cheap, and it earns money every second.",
    done: () => state.companies.some(c => c.typeId === "hotdog"),
    hint: () => state.money < 100 ? "Keep clicking the coin until you have 100." : "" },
  { target: '[data-action="hire"]', view: "income", page: "biz", text: "👷 <b>Hire a worker.</b> A business only earns when it has workers. Each worker has a trait with a small bonus. The first one is free!",
    done: () => state.companies.some(c => c.workers.length > 0) },
  { target: '[data-action="hire"]', view: "income", page: "biz", text: "👷 <b>Hire a second worker.</b> A Hot Dog Stand has room for 2 workers.",
    done: () => state.companies.some(c => c.workers.length >= 2) || !state.companies.some(c => c.workers.length < maxWorkers(c)),
    hint: () => { const c = state.companies.find(x => x.typeId === "hotdog"); return c ? `It costs ${fmt(hireCost(c))}.` : ""; } },
  { target: '[data-action="buy"][data-type="carwash"]', view: "income", page: "biz", text: "🚗 <b>Next goal: a Car Wash</b> (1,000). Bigger businesses earn more, but first you'll pick an <b>accountant</b> and an <b>HR manager</b>, and each gives a bonus.", next: true },
  { target: "#perSecond", view: "income", text: "📈 This is your <b>income per second</b>. More businesses and workers make it grow, even while you're away.", next: true },
  { target: "#tabs", view: null, text: "🔓 New tabs and features <b>unlock as you grow</b>. Look for 🔒 to see what's next, and 📖 Wiki if you need help. Have fun!", next: true, last: true },
];
function tutActive() { return typeof state.tips.tutorial === "number" && state.tips.tutorial < TUT.length && state.tips.on; }
function tutEnd(how) {
  state.tips.tutorial = how; save();
  $("tutBubble").hidden = true;
  document.querySelectorAll(".tutGlow").forEach(el => el.classList.remove("tutGlow"));
  state.tips.lastAt = Date.now();
}
function tutTick() {
  const bubble = $("tutBubble");
  document.querySelectorAll(".tutGlow").forEach(el => el.classList.remove("tutGlow"));
  if (!tutActive() || !$("modal").hidden) { bubble.hidden = true; return; }   // wait while a pop-up (e.g. the welcome screen) is open
  let step = TUT[state.tips.tutorial];
  if (step.done && step.done()) { state.tips.tutorial++; save(); return tutTick(); }
  const onView = !step.view || state.view === step.view;
  const onPage = !step.page || (state.incomePage || "biz") === step.page;
  const el = onView && onPage ? [...document.querySelectorAll(step.target)].find(x => x.offsetParent !== null) : null;
  const hint = step.hint ? step.hint() : "";
  bubble.innerHTML = `<div class="tutStep">Guided start · ${state.tips.tutorial + 1} / ${TUT.length}</div>
    <div>${el ? step.text : (!onView ? `Go back to <b>💰 Income</b> to continue.` : !onPage ? `Open <b>🏢 Businesses</b> to continue.` : step.text)}</div>
    ${step.progress ? `<div class="tutProg">${step.progress()}</div>` : ""}${hint ? `<div class="muted">${hint}</div>` : ""}
    <div class="tutBtns">${step.next ? `<button class="btn small" data-tut="next">${step.last ? "Finish" : "Next"}</button>` : ""}
      <button class="btn ghost small" data-tut="skip">Skip tutorial</button></div>`;
  bubble.hidden = false;
  if (el) {
    el.classList.add("tutGlow");
    const r = el.getBoundingClientRect(), bw = bubble.offsetWidth, bh = bubble.offsetHeight;
    let top = r.bottom + 12, left = r.left + r.width / 2 - bw / 2;
    if (top + bh > innerHeight - 8) top = Math.max(8, r.top - bh - 12);
    left = Math.max(8, Math.min(innerWidth - bw - 8, left));
    bubble.style.top = top + "px"; bubble.style.left = left + "px"; bubble.classList.remove("free");
  } else { bubble.style.top = ""; bubble.style.left = ""; bubble.classList.add("free"); }
}
$("tutBubble").addEventListener("click", (e) => {
  const b = e.target.closest("[data-tut]"); if (!b) return;
  if (b.dataset.tut === "skip") return tutEnd("skipped");
  const step = TUT[state.tips.tutorial];
  if (step && step.last) return tutEnd("done");
  state.tips.tutorial++; save(); tutTick();
});
setInterval(tutTick, 400);
addEventListener("scroll", () => { if (tutActive()) tutTick(); }, { passive: true });
