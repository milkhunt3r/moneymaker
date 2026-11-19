/* =====================================================================
   🏠 MAIN MENU (start page)
   Shown every time the game opens. The picture (1672 × 941) has the logo and buttons painted in;
   invisible buttons sit on top of them. The picture covers the screen, but on narrow screens it shrinks
   so the logo and buttons (x 975–1450, y 35–700 in the picture) always fit.
   The game clock keeps running while the menu is open.
   ===================================================================== */
const MENU_W = 1672, MENU_H = 941;
const MENU_SAFE = { x0: 220, x1: 1640, y0: 70, y1: 870 };    // everything important (penguin with his feet, logo, buttons, roulette): never cut off
const MENU_FOCUS = { x0: 895, x1: 1325, y0: 85, y1: 656 };   // logo + buttons: what phones zoom in on
function layoutMenu() {
  const vw = innerWidth, vh = innerHeight, pad = 8;
  // Landscape screens: fill the screen; only the plain edges (sky and sea) may be cut off, never the safe area.
  // Portrait screens (phones): zoom in on the logo and buttons.
  const F = vw >= vh ? MENU_SAFE : MENU_FOCUS;
  let s = Math.max(vw / MENU_W, vh / MENU_H);                       // cover the screen
  s = Math.min(s, (vw - 2 * pad) / (F.x1 - F.x0), (vh - 2 * pad) / (F.y1 - F.y0));   // ...but keep the important part on screen
  const place = (view, size, f0, f1) => {
    let o = (view - size * s) / 2;                                   // centered
    if (size * s >= view) o = Math.min(0, Math.max(view - size * s, o));
    const lo = pad - f0 * s, hi = view - pad - f1 * s;               // keep the focus area visible
    return lo <= hi ? Math.min(hi, Math.max(lo, o)) : (lo + hi) / 2;
  };
  const x = place(vw, MENU_W, F.x0, F.x1), y = place(vh, MENU_H, F.y0, F.y1);
  $("menuStage").style.transform = `translate(${x}px, ${y}px) scale(${s})`;
}
function openMenu() {
  $("mainMenu").hidden = false; document.body.classList.add("menuOpen");
  layoutMenu();
}
function closeMenu() {
  $("mainMenu").hidden = true; document.body.classList.remove("menuOpen");
  if (state.taxHoliday > 0) showNotice(`🛡️ Tax holiday: no tax inspections for the next ${Math.ceil(state.taxHoliday / 60)} minutes.`);
  if (secretsOpen() && secretsUnseen().length && $("modal").hidden) showSecrets();
  save();
}
addEventListener("resize", () => { if (!$("mainMenu").hidden) layoutMenu(); });
$("brand").addEventListener("click", openMenu);
// The logo sits left of the tabs: the wide logo if there is room, else the coin icon, else nothing
function fitBrand() {
  const first = document.querySelector("#tabs .tab:not([hidden])");
  if (!first) return;
  const room = first.getBoundingClientRect().left - 14 - 12;   // free space left of the first tab
  $("brandWide").hidden = room < 138;
  $("brandIcon").hidden = !(room < 138 && room >= 44);
}
new ResizeObserver(fitBrand).observe($("tabs"));
new ResizeObserver(() => document.documentElement.style.setProperty("--tabsH", $("tabs").offsetHeight + "px")).observe($("tabs"));
addEventListener("resize", fitBrand); fitBrand();

// 📝 Patch notes: newest first. The first entry is shown open in About.
const PATCH_NOTES = [
  { date: "18 November 2026", title: "Empire of Coins", items: [
    "🌐 More of the game in <b>Español</b>: the rules in Investing, Logistics and Live trading, every casino game (buttons, rules, pay tables and results), the Gold Mine Dig and Art Gallery mini-games, all achievement names and descriptions, and the Shop and reward items.",
    "🗂️ The game now runs in <b>one tab at a time</b>: opening it in a second tab no longer overwrites your progress. Click <b>Play here</b> to move it.",
    "☁️ <b>Cloud save</b>: sign in with Google (⚙️ Settings or the main menu) to keep your progress in your account and continue on another device. Playing without an account works as before.",
    "🚚 New in 📈 Investing: <b>Global Freight Co. shares</b>. The price follows your logistics deliveries: more contracts delivered than in the 20 seconds before, and it goes up; fewer, and it goes down.",
    "📡 <b>Live trading</b>: <b>⏳ limit orders</b> (open a Long when the price drops to your price, or a Short when it rises to it) and <b>🎯 take profit / 🛑 stop loss</b> on every position.",
    "🎟️ <b>VIP Coins</b> prestige bonus: you can now hold up to <b>200</b> free 500 scoin chips instead of 100.",
    "🏆 Easier goals: <b>Blackjack legend</b> now needs 500 won hands, and <b>Ultimate Texas Hold'em veteran</b> 500 hands played.",
    "🎰 <b>Clear bets</b> now also empties the table after a finished hand (Baccarat and Blackjack), and <b>Repeat last bets</b> places your free bet chips again first when the last bet used them, paying only the rest from your chips.",
    "🌐 The 📖 Wiki, the ⭐ prestige screens and the special business details are now in <b>Español</b> too. The Wiki search finds Spanish words when the game is in Spanish.",
    "💼 Fix: <b>Tycoon's Legacy</b> now keeps your 🔬 Science buildings on every later reset too, not only on the reset you pick it (the satellite still resets).",
  ] },
  { date: "17 November 2026", title: "Empire of Coins", items: [
    "🎴 New card game: <b>Baccarat</b>! Bet on Player, Banker or a Tie, plus Pair side bets. Three tables with the same limits as Blackjack. Unlocks at <b>Gambler level 20</b>.",
    "🏆 4 new Baccarat achievements: play 50, 100 and 500 hands, and win 3 hands in a row.",
    "🎈 New <b>Sky Climb: High rollers</b> table with bets from 5 to 500 scoin.",
    "🏆 Sky Climb veteran now needs 500 rounds instead of 1,000.",
    "🧬 New slot: <b>Gene Cascade</b>! A 7×7 grid of specimens: clusters of 5+ pay and tumble, 🔬 lab spots grow from ×2 up to ×128, and 🧪 DNA vials give up to 30 free spins where the spots stay. High rollers and Super high rollers tables. Unlocks after your <b>1st prestige</b> at <b>Gambler level 40</b>. You can also 🛒 buy the free spins for 50.5× your bet.",
    "🐍🐉 New reward card decks: <b>Snake in a Top Hat</b> for 🃏 Blackjack veteran (1,000 hands) and <b>Dragon</b> for 🎴 Baccarat high society (500 hands), <b>Rat Hacker</b> for 🎴 Video Poker veteran (1,000 hands), <b>Cat Cowboy</b> for 🤠 Ultimate Texas Hold'em veteran (1,000 hands).",
    "🏆 ♠️ Royal Flush! and 💰 Jackpot! are now one achievement, <b>Royal Flush or Jackpot!</b>: a Royal Flush in Video Poker or Hold'em, or the top of Sky Climb. If you had either one, you keep it.",
    "🌋 Gold Mine Dig lava is dangerous now: flowing lava spreads on its own every 0.7 s, bursting pockets splash you (−20% lamp), standing next to lava burns 5% lamp per step, and lava can rise 1 tile. The 🧯 Heat suit softens all of it.",
    "🌐 New language: <b>Español</b> (Spain). Switch it in ⚙️ Settings or at the top of the main menu. This first part covers the menus, buttons, Income, taxes and the tab headers; the rest of the game follows in the next updates.",
    "🆘 Final tax warning: if you can't pay a bill after the extension, you can now sell investments with a 20% fee to cover it instead of losing the game.",
    "🧾 Tax debt can be paid from any tab: click the red banner at the top (it stays in view while you scroll).",
    "🏆 Easier achievements: 🏛️ Pillar of society needs 250 tax bills (was 500), 💰 Art market mogul 200 paintings sold (was 250), ⛏️ Mine foreman 200 runs (was 250).",
    "🏆 5 Gene Cascade achievements in 🎰 Casino: play 50, 100 and 500 spins, trigger free spins, and buy free spins.",
  ] },
  { date: "13 November 2026", title: "Empire of Coins", items: [
    "🏠 Real estate: each property shows a building that grows with its value: house (up to 500,000), apartment building (up to 5 scoin), castle (up to 50 scoin) and skyscraper (50 scoin and more).",
    "⭐ Prestige: <b>🎟️ VIP Coins</b> now gives a free 500 scoin chip every <b>10 minutes</b> and makes <b>every other free chip come twice as fast</b>. VIP Coins and 💼 Tycoon's Legacy can each be picked <b>once</b> (Global Empire twice), so over 4 prestiges you collect every bonus, in the order you choose.",
    "🛡️ Collections now have painted emblems in the 🛍️ Shop and on the 🎁 Rewards page.",
    "🏅 Every achievement now has a painted medal badge (grey until you earn them). Two-step achievements get a bronze badge first and a gold one for the bigger goal; the Art Gallery brushes show a 🟢 / 🟡 / 🔴 difficulty dot.",
    "🔒 Casino fix: refreshing the page no longer cancels a game. Blackjack, Video Poker and Hold'em hands come back exactly as they were (same cards, same deck), a roulette spin finishes with its result, Plinko balls land where they were heading, and a Sky Climb continues where you left it.",
    "🔥 Hot Tables now run 10 minutes hot, 10 minutes cooldown. The bonus grows with your Gambler level: +10, <b>+20</b> from level 50, <b>+40</b> from level 75.",
    "🧮 Accountants and HR managers have painted portraits when you hire them and on your business cards.",
    "🎰 Casino lobby: every game has a painted picture, with 💎 badges for the High roller and Super high roller tables.",
    "🎨 Science buildings, the satellite and your scientists have painted pictures too.",
    "🎨 Every business and special building now has its own painted picture (Hot Dog Stand to Trading Port).",
    "🎨 More painted icons: Businesses / Special / Science buttons, the settings gear, the padlock on locked tabs, the Prestige crown, tax debts and the \"While you were away\" pop-up.",
    "🎨 New painted icons on the main tabs (Income, Casino, Investing, Logistics, Mini-games, Achievements, Shop, Wiki).",
    "⛏️ Gold Mine Dig: cleaner surface edge (the grass sits on the ground instead of covering the first row) and no more stray bedrock blocks right under the grass.",
    "📖 Wiki: the 🌌 secret Science buildings (2nd University, Astronomy Research Center, Orbital Space Station) are now listed once your first prestige has unlocked them.",
    "🧮 Accountant <b>Good with numbers</b> now gives <b>+15%</b> company profit instead of +5%.",
    "🏦 Selling vault ore: choose exactly how much of each ore to sell (slider, − / +, Max), see the total before you sell, and see how much each ore your next upgrades still need.",
    "🌄 Gold Mine Dig: new surface with sunset hills, a wooden ⛏️ mine entrance and a 🛗 lift headframe (the lift now brings you up right into it).",
    "⛏️ Gold Mine Dig: ore now shows its painted picture everywhere (vault, values, upgrade costs, bag, pop-ups, wiki), and the 🛗 mine lift has its own bigger box at the top of the upgrades.",
    "📦 New treasure chest art: an old dusty chest in the rock, an ornate chest to open, a chest full of coins and gems for prizes, and a glowing diamond chest for the 💎 jackpot.",
    "⛏️ Gold Mine Dig: new hand-painted ore: ⚫ coal, 🟠 copper, ⚪ silver, 🟡 gold, 💎 diamond and 🔴 ruby clusters.",
    "⛏️ Gold Mine Dig: 🪨 bedrock is now much darker with a thick black frame, so it is easy to see which rock can't be dug.",
    "⛏️ Gold Mine Dig: new 💠 crystal rock and hard crystal rock in the crystal caves, painted 🌋 lava and hot rock (lava pockets), and dark earth behind every tunnel you dig.",
    "⛏️ Gold Mine Dig: new 🌋 basalt and hard basalt (hexagonal columns) in the lava zone, new bedrock everywhere, and hidden lava pockets now glow brighter so you can tell them apart.",
    "⛏️ Gold Mine Dig: new hand-painted dirt, stone and granite. The rock joins into one continuous rock face, darker and tinted in the 🌋 lava zone and 💠 crystal caves.",
    "⛏️ Gold Mine Dig: the miner has new art! The mole miner stands, swings his pickaxe sideways, strikes down and climbs, depending on what you do.",
    "⛏️ New Mining achievements: 🔥 Survive the lava (150 m), 🏁 Rock bottom (250 m), 📦 First chest, 💰 Treasure hunter (50 chests), 🛗 Going up (use a lift) and 🛗 Frequent rider (20 lifts).",
    "⛏️ <b>Gold Mine Dig: the deep mine!</b> The mine is now <b>250 m</b> deep and 25 tiles wide (the view follows you sideways), in three layers: the old mine, the 🌋 <b>lava zone</b> (100–170 m, hard basalt) and the 💠 <b>crystal caves</b> (170–250 m, even harder rock).",
    "🌋 Lava: pools block the way, and rocks with glowing red cracks hide <b>lava pockets</b> that flow down and sideways when you break them (never up). Getting caught saves only 30% of your ore. 🔥 Below 150 m the heat burns your lamp 25% faster.",
    "📦 <b>Treasure chests</b> below 130 m (1–2 per map, 5 bag slots each). Bring them up yourself to open them: 🪙 small (2–5 min of income), 💵 good (5–15 min), 💰 big (50–60 min), or the 💎 <b>jackpot</b> (1 in 5,000: 50,000 scoin, or 8 hours of income if that is more).",
    "🔴 New ore: <b>Ruby</b> (500 sec of income) below 150 m. New upgrades: 🧯 <b>Heat suit</b> (survive one lava touch per run; Lv 2 also removes the heat) and 🪔 Bigger lamp levels 6 and 7 (paid with rubies). 🛗 <b>Mine lifts</b>: buy them before a run, each one takes you straight back to the surface with everything you carry.",
    "Achievement <b>🎩 Pulling the strings</b> now needs <b>50</b> political influences instead of 100.",
    "Achievement <b>🌍 Global network</b> now needs <b>5,000</b> logistics contracts instead of 10,000.",
    "⛏️ New Mining achievement <b>🏅 Master Miner</b>: max out every Gold Mine Dig upgrade.",
    "⛏️ The Gold Rush Collection now also needs <b>🪨 Regular miner</b> and <b>🟡 Golden touch</b> (players who already own it keep it).",
    "🚢 Logistics: the tab shows a <b style=\"color:#ff6b6b\">red ❗ warning</b> while a truck is broken down and not repaired.",
    "Achievement <b>Art market mogul</b> now needs <b>250</b> paintings sold instead of 1,000.",
    "Smoother clicking: the coin's shadow is drawn once instead of being re-blurred on every frame, so fast clicking no longer slows down other browser tabs.",
    "The game has a new name: <b>Empire of Coins</b>, with a new logo, browser tab icon, loading screen and this main menu.",
    "New first business: the <b>🌭 Hot Dog Stand</b> (100, 2 workers, no accountant or HR, up to 3). The guided start now begins with it.",
    "Hotels: at most <b>5 Concierges</b> per hotel. More Concierges stacked their bonus far too high.",
    "⚡ Smoother clicking: the game no longer slows down other browser tabs (lighter booster glows, click numbers and background).",
    "📱 <b>Phone mode</b>: on screens up to 760 px the tabs move to the bottom, the game no longer zooms out, the casino jumps straight to the table, and blur effects and endless glows are turned off so phones run smoother.",
    "New <b>⛏️ Mining</b> achievements section: 16 achievements for the Gold Mine Dig.",
    "⭐ Your prestige level and Legacy bonuses are now shown in the 💰 Income tab: click the ⭐ Prestige badge for details.",
    "Achievements: 🏛️ Pillar of society needs 500 tax bills (was 1,000). Blackjack and Ultimate Texas Hold'em count one game per seat you bet on (splits don't add games).",
    "🏢 Real estate agency: each new agent needs a bigger profit step (100k, +200k, +300k…). Agents you already have stay.",
    "🖼️ Art studio: fairer scoring with a new 🔷 shape count check. Easy copies that are a little off score higher; Medium and Hard need every shape, not just the background. Brush strokes count as shapes, and a drawing that is a bit shifted overall is lined up before comparing.",
    "⚖️ Lawyers: 🛂 Immigration lawyer now +25% (was 10%), 💼 Business lawyer now +10% (was 2%).",
    "⛏️ Gold Mine Dig: <b>upgrades</b> (lamp, bag, pickaxe, boots, appraiser, energy tank, fast recharge, rescue insurance) paid with money and ore, and an <b>🏦 ore vault</b>: keep ore after a run or sell it.",
    "Art Gallery: a copy needs at least <b>50% match</b> to be sold or kept.",
    "New <b>🎮 Mini-games</b> tab: the 🖼️ Art Gallery moved here, plus a new game, <b>⛏️ Gold Mine Dig</b> (test version): dig for ore with your mole miner, unlocked by your first gold mine.",
    "Plinko: new table limits, 5,000 – 5 scoin per ball (Super high rollers: 10 – 500 scoin).",
    "New look for ⚙️ Settings: a royal gold panel, a tips switch, a 🌗 background brightness slider and a 🐞 Report a bug button (coming soon).",
    "New rewards: three <b>Master coins</b> for reaching level 99: 🦊 Gambler, 🦉 Investor and 🦅 Logistics.",
    "New reward: <b>🦛 The Strongman Collection</b> (background and coin) for finishing ⚡ Wired for life and 🦾 Iron finger.",
    "New special business: the <b>🧑‍💼 Recruitment Agency</b> (10 scoin, needs 2 hotels and 2 casinos). Save a staffing plan once, then staff every new hotel and casino in one click for 1 scoin each, or apply the plan to all of them.",
    "Shop: the new <b>🦁 Emperor Collection</b> (background, coin and card deck, 1 gcoin each), with the achievement <b>Hail, Emperor!</b> for wearing all 3 at once.",
    "Shop: new prices per item: One Step Ahead 25 scoin, Royal 100 scoin, Make It Rain 500 scoin (Wow So Rich stays 5 scoin). Items you already own stay yours.",
    "Prestige: the 4 resets are now at <b>1, 5, 10 and 20 gcoin</b>, with new achievements for 5, 10 and 20 gcoin. 💼 Tycoon's Legacy also keeps your Science buildings (not the satellite), and every prestige gives a <b>10-minute tax holiday</b>.",
    "Science: buildings now cost scientists (Research lab 20, Space Mission Center 50). Space missions run every 20 minutes and pay 2,000–5,000 scoin, with a 20% chance to fail (15% with the satellite).",
  ] },
  { date: "12 November 2026", title: "Science, rewards and card decks", items: [
    "<b>🔬 Science</b>: University, Research lab with Nobel Prizes, Space Mission Center and the Logistics satellite.",
    "<b>🎁 Rewards</b> in Achievements: 8 collections (backgrounds and coins) for finishing groups of achievements, plus a Hide / Show completed switch.",
    "Casino: <b>🔥 Hot Tables</b> (+10 Gambler XP multiplier on one game for 15 minutes), per-table XP multipliers, new roulette wheel and fox card deck.",
    "Shop: new <b>🃏 Cards</b> slot with 4 themed card decks.",
    "Guided start and one-time tips for new players, Wiki search, more investing amount buttons, booster achievements and the Art studio Grab tool.",
  ] },
  { date: "11 November 2026", title: "Art Gallery and offline earnings", items: [
    "<b>🖼️ Art Gallery</b>: copy paintings in the studio, sell them or keep them in your collection.",
    "<b>🌙 Offline earnings</b>: 50% of your income for up to 8 hours while the game is closed, and background tabs now catch up.",
    "Gold mines hold 20–30 scoin and can start a <b>gold rush</b>.",
    "Safer saving, the Wiki, the live Logistics world map and Live trading improvements.",
  ] },
];
function showAbout() {
  const notes = PATCH_NOTES.map((n, i) => `<details${i === 0 ? " open" : ""}>
      <summary>${i === 0 ? "🆕 Latest update" : "Earlier update"} · ${n.date} · ${n.title}</summary>
      <ul>${n.items.map(x => `<li>${x}</li>`).join("")}</ul></details>`).join("");
  showModal(`<div class="aboutLogo"><img src="assets/logo/logo-banner.webp" alt="Empire of Coins"></div>
    <h2>About the game</h2>
    <p><b>Empire of Coins</b> is an idle tycoon game. You start with one coin and build a business empire that keeps earning, even while you're away.</p>
    <h3>How to play</h3>
    <ul>
      <li>👆 <b>Click the coin</b> to earn your first money, and use boosters like the energy drink to speed up.</li>
      <li>🏢 <b>Buy businesses and hire workers.</b> Every worker has a trait, and accountants and HR experts make a business earn more.</li>
      <li>📈 <b>Grow into new areas</b> as you unlock them: 🎰 Casino, 📈 Investing, 🚢 Logistics, 🎮 Mini-games (🖼️ Art Gallery, ⛏️ Gold Mine Dig) and 🔬 Science.</li>
      <li>🏆 <b>Collect achievements</b> to win reward collections, and spend scoin in the 🛍️ Shop on looks for your coin and background.</li>
      <li>⭐ <b>Prestige</b> at 1, 5, 10 and 20 gcoin: start over with a permanent Legacy bonus.</li>
    </ul>
    <p class="muted">💾 The game saves itself in this browser. Sign in with Google (⚙️ Settings) to keep a ☁️ cloud copy.
      The 📖 Wiki in the game explains every feature.</p>
    <h3>📝 Patch notes</h3>
    ${notes}
    <div class="closeRow"><button class="btn big" data-modal="close">Close</button></div>`);
  $("modalBox").classList.add("wide", "about");
}

$("mainMenu").addEventListener("click", (e) => {
  const b = e.target.closest("[data-menu]"); if (!b) return;
  const what = b.dataset.menu;
  if (what === "play") closeMenu();
  if (what === "settings") showSettings(true);
  if (what === "about") showAbout();
  // "donate": does nothing for now
});

// 🌌 One-time pop-up after the 1st prestige: hidden unlocks that were never mentioned anywhere before
const SECRETS = [
  { id: "uni2", html: () => `<b>🎓 2nd University</b><div class="muted">A second University for ${fmt(UNI_PRICE)}. It trains its own scientists for the same shared pool.</div>` },
  { id: "astro", html: () => `<b>🔭 Astronomy Research Center</b><div class="muted">${fmt(ASTRO_PRICE)} + 👩‍🔬 ${ASTRO_SCI} scientists: space missions launch ${ASTRO_TIME_CUT / 60} minutes sooner.</div>` },
  { id: "uni3", tier: 2, html: () => `<b>🎓 3rd University</b><div class="muted">A third University for ${fmt(UNI_PRICE)}: up to ${UNI_MAX * 3} scientists in your shared pool.</div>` },
  { id: "mars", tier: 2, html: () => `<b>🔴 Mars Base</b><div class="muted">${fmt(MARS_PRICE)} + 👩‍🔬 ${MARS_SCI} scientists, after the Moon Base and the Genetics Laboratory: its own deep space mission every ${MARS_EVERY / 60} minutes (${Math.round(MARS_FAIL * 100)}% chance to fail), and Moon Base missions launch ${MARS_MOON_CUT / 60} minutes sooner and fail ${MARS_MOON_FAIL_CUT * 100}% less often.</div>` },
  { id: "moon", tier: 2, html: () => `<b>🌕 Moon Base</b><div class="muted">${fmt(MOON_PRICE)} + 👩‍🔬 ${MOON_SCI} scientists, after the 🛸 Orbital Space Station: a deep space mission every ${DEEP_EVERY / 60} minutes worth ${fmt(DEEP_MIN * 1e6)} – ${fmt(DEEP_MAX * 1e6)} (${Math.round(DEEP_FAIL * 100)}% chance to fail).</div>` },
  { id: "gene", tier: 2, html: () => `<b>🧬 Genetics Laboratory</b><div class="muted">${fmt(GENE_PRICE)} + 👩‍🔬 ${GENE_SCI} scientists, after the Moon Base: +${GENE_BONUS * 100}% on every space and deep space mission.</div>` },
  { id: "station", html: () => `<b>🛸 Orbital Space Station</b><div class="muted">${fmt(STATION_PRICE)} + 👩‍🔬 ${STATION_SCI} scientists: missions fail ${STATION_FAIL_CUT * 100}% less often and launch ${STATION_TIME_CUT / 60} minutes sooner; lab breakthroughs become 1 in ${STATION_LAB_ODDS.toLocaleString("en-US")} (guaranteed within 1 hour).</div>` },
];
const secretsUnseen = () => {
  const seen = state.legacy.secretsSeen || (state.legacy.secretsShown ? ["uni2", "astro"] : []);
  const pc = (state.legacy && state.legacy.count) || 0;
  return SECRETS.filter(x => !seen.includes(x.id) && pc >= (x.tier || 1));
};
function showSecrets() {
  const list = secretsUnseen();
  state.legacy.secretsSeen = [...new Set([...(state.legacy.secretsSeen || (state.legacy.secretsShown ? ["uni2", "astro"] : [])), ...list.map(x => x.id)])]; save();
  showModal(`<h2>🌌 New unlocks!</h2>
    <p>Your prestige opened doors that were hidden until now:</p>
    ${list.map(x => `<div class="card secretCard" style="text-align:left">${x.html()}</div>`).join("")}
    <p class="muted">Find them in 💰 Income → 🔬 Science. ${list.some(x => x.tier === 2) ? "New hidden achievements have appeared in 🏆 Achievements → 🌌 Secrets." : "A new 🌌 Secrets section has appeared in 🏆 Achievements."}</p>
    <button class="btn big" data-modal="close">✨ Great!</button>`);
  $("modalBox").classList.add("gold");
}

openMenu();   // the game always opens on the main menu

// Hide the loading screen once the game is ready (shown for at least 0.7 s so it doesn't just flash)
(function hideLoading() {
  const el = $("loading");
  let done = false;
  const go = () => { if (done) return; done = true;
    setTimeout(() => { el.classList.add("fade"); setTimeout(() => el.remove(), 500); }, Math.max(0, 700 - performance.now())); };
  if (document.readyState === "complete") go(); else addEventListener("load", go, { once: true });
  setTimeout(go, 4000);   // never wait more than 4 s for slow images
})();
