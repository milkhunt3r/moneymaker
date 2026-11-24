/* Empire of Coins © 2026 milkhunt3r. All rights reserved. */
/* =====================================================================
   📖 WIKI: how to play, with tables built from the game's own data (always up to date).
   ===================================================================== */
const WIKI_SECTIONS = [
  { id: "general", name: "⭐ General" }, { id: "income", name: "💰 Income" }, { id: "casino", name: "🎰 Casino" },
  { id: "investing", name: "📈 Investing" }, { id: "logistics", name: "🚢 Logistics" },
  { id: "art", name: "🎮 Mini-games" }, { id: "achievements", name: "🏆 Achievements" }, { id: "pet", name: "🐾 Pet" },
];
const wt = (head, rows) => `<table class="wikiTable"><thead><tr>${head.map(h => `<th>${h}</th>`).join("")}</tr></thead>
  <tbody>${rows.map(r => `<tr>${r.map(c => `<td>${c}</td>`).join("")}</tr>`).join("")}</tbody></table>`;
const infoText = (id) => ($("info-" + id) ? $("info-" + id).innerHTML : "");
const pctx = (x) => (x * 100).toFixed(x * 100 % 1 ? 1 : 0) + "%";

function wikiGeneral() {
  return `<h2>⭐ General</h2>
    <p><b>Empire of Coins</b> is an idle tycoon game. Click the coin, build businesses, play the casino, invest, run a logistics empire, and grow your fortune up to <b>1 gcoin</b>, where you can prestige (then 5, 10 and 20 gcoin).</p>
    <h3>Money units</h3>
    ${wt(["Unit", "Value", "Where you see it"], [
      ["bcoin", "1", "Normal amounts"], ["scoin (sc)", `${(1e6).toLocaleString()} bcoin`, "Amounts from 1 million (your main counter switches at 100 scoin)"], ["gcoin", `${(1e6).toLocaleString()} scoin`, "The biggest amounts"]])}
    <p class="muted">Hover your money counter to see it in the other unit.</p>
    <h3>The tabs</h3>
    ${wt(["Tab", "What you do there"], [
      ["💰 Income", "Click the coin, buy businesses and special businesses, hire workers, use boosters"],
      ["🎰 Casino", "Move money into casino chips and play table games"],
      ["📈 Investing", "Real estate, ETFs, gold, Broker ETF and live crypto trading"],
      ["🚢 Logistics", "Trucks, oil tankers and cargo planes on contracts, with a world map"],
      ["🎮 Mini-games", "🖼️ Art Gallery: copy paintings and sell them or keep them · ⛏️ Gold Mine Dig: dig for ore (needs a gold mine) · 🚀 Nebula Strike: space shooter (needs the Space Mission Center)"],
      ["🏆 Achievements", "Goals across the whole game"], ["🐾 Pet", "Your pet and how to find one"], ["📖 Wiki", "This guide"]])}
    <h3>🧾 Taxes</h3>
    <p>Every second there is a 1 in ${Math.round(1 / TAX_CHANCE).toLocaleString()} chance of a tax inspection (and always after ${TAX_FORCED_AFTER / 60} minutes without one).
      The bill is <b>${pctx(TAX_RATE)} of everything you earned in the last ${TAX_LOOKBACK / 60} minutes</b>. You have <b>${TAX_TIME_TO_PAY / 60} minutes</b> to pay it with the red button on 💰 Income, or the red banner at the top of any other tab (clicking it pays right there).
      If you can't, the bill grows by ${pctx(TAX_LATE_PENALTY)} and you get ${TAX_TIME_TO_PAY / 60} more minutes. Miss it again and you get a <b>final warning</b>: if your investments (Broker ETF, ETF, gold, properties) can cover the rest, you can sell them with a <b>20% fee</b> to pay (only what's needed is sold). If even that isn't enough, it's <b>game over</b>. Bills stack, so keep some money ready.
      A Debt &amp; financial lawyer gives part of every tax payment back.</p>
    <h3>📊 Levels</h3>
    ${wt(["Level", "How you get XP", "What it gives"], [
      ["🎲 Gambler (Casino)", "XP = bcoin you bet × the table's XP multiplier", "0.1% cashback on lost bets per level, casino businesses, free bet chips"],
      ["📈 Investor (Investing)", "XP every minute you have money invested, plus XP per crypto trade", "Lower ETF fee, +0.1% on property sales per level, hotels, Brokerage Firm, lower crypto fee"],
      ["🚚 Logistics", "XP for every delivered contract (contract minutes × 1 truck / 3 tanker / 6 plane)", "Logistics agents: trucks at 5, tankers at 25, planes at 50"]])}
    <p class="muted">Each level card has a "📋 All levels" button with every level's XP and unlocks.</p>
    <h3>⭐ Prestige</h3>
    <p>When the money on hand reaches <b>1 gcoin</b> (1st prestige), <b>5 gcoin</b> (2nd), <b>10 gcoin</b> (3rd) or <b>20 gcoin</b> (4th), you can reset the game for a permanent Legacy bonus (max ${PRESTIGE_MAX} prestiges; the 4th finishes the game, but you can keep playing).
      After every prestige there are <b>no tax inspections for the first 10 minutes</b>, whichever bonus you pick.
      <b>Always kept:</b> achievements, Gambler, Investor and Logistics levels, cosmetics, statistics, free bet chips, the 🖼️ Art Gallery unlock, its collection slots and your paintings.</p>
    ${wt(["Bonus", "Effect", "Max"], [
      ["💼 Tycoon's Legacy", `+25% income from businesses, special businesses and clicks, once. From the reset you pick it on, every reset keeps your Science buildings (University, Research lab, Space Mission Center${secretsOpen() ? ", 2nd University, Astronomy Research Center, Orbital Space Station" : ""}${secrets2Open() ? ", 3rd University, Moon Base, Genetics Laboratory, Mars Base" : ""}), but not the satellite`, "1"],
      ["🚢 Global Empire", "1st: keep trucks, tankers, planes, warehouses, Trading Port and Logistics Center on every reset (the satellite resets with Science). 2nd: all contracts take half the time (same pay)", "2"],
      ["🎟️ VIP Coins", "A free 500 scoin bet chip every 10 min for the Super high roller tables, and all other free bet chips come twice as fast (every 10 / 7.5 / 5 min instead of 20 / 15 / 10). You can hold up to 200 chips of 500 scoin instead of 100", "1"]])}
    <p class="muted">Tycoon's Legacy and VIP Coins can be picked once, Global Empire twice: 4 picks for 4 prestiges, so by the end you have every bonus, in the order you choose.</p>
    <h3>💾 Saving</h3>
    <p>The game saves automatically in your browser. Sign in with Google (⚙️ Settings → Account) to keep a ☁️ cloud copy and play on other devices. In ⚙️ Settings you can also reset the game.</p>
    <p>👤 <b>Profile</b> (the round button next to ⚙️): once signed in, choose a nickname and an avatar (one of your achievement badges). Other players see your nickname, avatar, achievements and prestige count. Nicknames are unique, and rude ones aren't allowed.</p>
    <h3>💡 Tips and guided start</h3>
    <p>New players get a short guided start (click the coin, buy a business, hire staff). After that, a small tip appears the first time you meet something new, with a link to the matching Wiki page.
      ⚙️ Settings: turn tips on/off, show all tips again, or replay the guided start.</p>
    <h3>🌙 Background and offline</h3>
    <p>The game counts real time: in a background tab it earns at full speed (it catches up when the browser wakes it).
      When the game is closed (or the computer sleeps) for more than 5 minutes, you get <b>offline earnings</b> when you come back:
      up to 8 hours count, and businesses, special businesses, gold mines and rent pay 50%. Contracts on their way, free bet chips and VIP chips keep their timers running.
      Nothing random happens while you're away (no taxes, crashes, breakdowns or market moves), and Logistics agents only start new contracts while the game is open.</p>
    <p>Art Gallery paintings are stored separately in the browser so a big collection never fills up the save. If the browser ever refuses to save, a red warning appears at the bottom of the screen.</p>`;
}

function wikiIncome() {
  const biz = BUSINESS_TYPES.map(t => {
    let unlock = "Always";
    try { if (t.unlockText) unlock = t.unlockText(0).replace(/\s*\([^)]*\)/g, ""); } catch (e) {}
    return [`${t.emoji} <b>${t.name}</b>`, fmt(t.price) + (t.maxOwned > 1 ? `, then ×${t.priceMultiplier || 2} each` : ""), t.maxOwned,
            t.noStaff ? `${t.maxEmployees} workers (no accountant or HR)` : `${t.maxEmployees - 2} workers + accountant + HR`, `${t.minIncome}–${t.maxIncome} / sec per worker`, unlock];
  });
  const traitRows = Object.entries(TRAITS).filter(([k]) => k !== "normal").map(([k, t]) =>
    [`${t.emoji} ${t.name}`, t.desc, t.onlyFor ? t.onlyFor.map(id => (BUSINESS_TYPES.find(b => b.id === id) || {}).name).join(", ") : "All", k === "legend" ? "1%" : pctx(t.chance)]);
  return `<h2>💰 Income</h2>
    <h3>👆 Clicking</h3>
    <p>Every click on the coin gives 1 bcoin (up to 10 clicks per second). Boosters and Tycoon's Legacy increase it.</p>
    <h3>🏢 Businesses</h3>
    <p>Buy a business, then hire workers. Each worker earns a random amount per second and has one trait. The first worker is free; each one after that costs more. You choose from 3 candidates, and "New options" refreshes them for a small growing price.</p>
    ${wt(["Business", "Price", "Max", "Staff", "Worker income", "Unlock"], biz)}
    <h3>👤 Worker traits</h3>
    ${wt(["Trait", "Effect", "Businesses", "Chance"], traitRows)}
    <h3>🧮 Accountants (one per business)</h3>
    ${wt(["Accountant", "Effect"], Object.entries(ACCOUNTANTS).map(([k, a]) => [`${staffIco(k, a)}${a.name}`, a.desc]))}
    <h3>🤝 HR managers (one per business)</h3>
    ${wt(["HR", "Effect"], Object.entries(HR_OPTIONS).map(([k, a]) => [`${staffIco(k, a)}${a.name}`, a.desc]))}
    <h3>⚡ Boosters</h3>
    ${wt(["Booster", "Price", "Effect", "Cooldown"], [
      ["⚡ Energy drink", fmt(ENERGY_PRICE), `Clicks ×${ENERGY_MULTIPLIER} for ${ENERGY_SECONDS} s`, `${ENERGY_COOLDOWN / 60} min`],
      ["🧙 Magical pill", fmt(PILL_PRICE), `Each click also gives ${pctx(PILL_SHARE)} of your income per second, for ${PILL_SECONDS} s`, `${PILL_COOLDOWN / 60} min`],
      ["🎩 Political influence", fmt(INFLUENCE_PRICE), `Business income ×2 for ${INFLUENCE_SECONDS / 60} min`, `${INFLUENCE_COOLDOWN / 60} min`]])}
    <h3>⭐ Special businesses</h3>
    <p>No workers, HR manager or accountant. Sorted from cheapest to most expensive.</p>
    ${wt(["Business", "Price", "Unlock", "What it does"], [
      ["📦 Warehouse", fmt(WAREHOUSE_PRICE), `Max 5; slots open at ${WAREHOUSE_UNLOCKS.join(", ")} trucks`, `+${pctx(WAREHOUSE_BONUS)} on truck contract payouts each`],
      ["⚖️ Law Firm", fmt(LAW_PRICE), "Always", `Hire up to ${LAW_MAX} attorneys (slot n costs ${fmt(LAW_SLOT_PRICE)} × n); pick 1 of 3 each time`],
      ["🧑‍💼 Recruitment Agency", fmt(RECRUIT_PRICE), `${RECRUIT_NEED.hotel} hotels and ${RECRUIT_NEED.casino} casinos`, `📝 Staffing plan: pick the accountant, HR and a trait for every worker place of a hotel and a casino. 👥 Hire staff fills every hotel and casino with no staff yet, ${fmt(RECRUIT_FILL)} per business (pay per second stays random). Businesses with staff are not touched. 🔄 Apply to all brings every hotel and casino in line with the plan, ${fmt(RECRUIT_FILL)} per business that needs changes (workers who fit the plan are kept). The plan is kept on prestige`],
      ["🏢 Real Estate Agency", fmt(AGENCY_PRICE), `${fmt(AGENCY_UNLOCK)} all-time real estate profit`, `+${pctx(AGENCY_SALE_BONUS)} on property sales; agents join as real estate profit grows: 1st at ${fmt(agencyNeedFor(1))}, 2nd at ${fmt(agencyNeedFor(2))}, 3rd at ${fmt(agencyNeedFor(3))}, 4th at ${fmt(agencyNeedFor(4))}… (each step ${fmt(AGENCY_PER_AGENT)} bigger; max ${AGENCY_MAX_AGENTS}, reached at ${fmt(agencyNeedFor(AGENCY_MAX_AGENTS))}), each earns 0/5/10/15 per second`],
      ["🎢 Amusement Park", fmt(PARK_PRICE), "One per hotel", `Earns ${pctx(PARK_SHARE)} of its paired hotel's income`],
      ["⛏️ Gold Mine", fmt(MINE_PRICE), `${fmt(MINE_UNLOCK)} all-time gold profit; max ${MINE_MAX}`, `${MINE_INCOME} / sec until its 20–30 scoin of gold is mined, then it closes. 🔥 Gold rush: 1 in ${RUSH_ODDS} chance per second per mine (2 mines: 1 in ${RUSH_ODDS / 2}) of 2× mine income for ${RUSH_SECONDS} sec`],
      ["⚓ Trading Port", fmt(PORT_PRICE), "Own an oil tanker; max 1", `${PORT_PER_TANKER} / sec per tanker and +${pctx(PORT_BONUS)} on tanker contracts`],
      ["🏛️ Art Gallery", fmt(GALLERY_PRICE), `${GALLERY_NEED} paintings in your Art Gallery collection; max 1`, `${fmt(GALLERY_PER_PAINTING)} / sec per painting in your collection, max ${fmt(GALLERY_MAX)} / sec`],
      ["🏬 Logistics Center", fmt(CENTER_PRICE), `Logistics level ${CENTER_LEVEL}; max 1`, `Choose 1 agent upgrade (fee 1%, best contract, or 3-second picks); the other two cost ${fmt(CENTER_UPGRADE_PRICE)} each`]])}
    <h3>⚖️ Attorneys</h3>
    ${wt(["Attorney", "Effect"], Object.values(ATTORNEYS).map(a => [`${a.emoji} ${a.name}`, a.desc]))}
    <p class="muted">When all ${LAW_MAX} slots are filled, you can fire any attorney and choose a replacement from 3 offers for ${fmt(LAW_REPLACE_PRICE)}.</p>
    <h3>🔬 Science</h3>
    <p>The 💰 Income tab has three pages: 🏢 Businesses, ⭐ Special and 🔬 Science. Science unlocks at Logistics level ${SCI_REQ.logistics}, Investor level ${SCI_REQ.investor} and Gambler level ${SCI_REQ.gambler}.</p>
    <p>👩‍🔬 <b>Scientists are a resource:</b> the Research lab costs ${LAB_SCI} scientists and the Space Mission Center ${SPACE_SCI}${secretsOpen() ? `, the 🔭 Astronomy Research Center ${ASTRO_SCI} and the 🛸 Orbital Space Station ${STATION_SCI}` : ""}${secrets2Open() ? `, the 🌕 Moon Base ${MOON_SCI} and the 🧬 Genetics Laboratory ${GENE_SCI} and the 🔴 Mars Base ${MARS_SCI}` : ""}. They leave your University, which then trains new ones (1 every 2 minutes) and costs money again until it's back to ${UNI_MAX}.</p>
    ${wt(["Building", "Price", "Needs", "What it does"], [
      ["🎓 University", fmt(UNI_PRICE), "Science unlocked", `1 scientist every 2 min, up to ${UNI_MAX}. Costs ${UNI_COST_PER_EMPTY} / sec per empty place (−${fmt(UNI_COST_PER_EMPTY * UNI_MAX)} / sec at first); full: +${fmt(UNI_FULL_INCOME)} / sec`],
      ["🧪 Research lab", `${fmt(LAB_PRICE)} + 👩‍🔬 ${LAB_SCI} scientists`, "University", `Every second a 1 in ${LAB_ODDS.toLocaleString("en-US")} chance of a breakthrough (guaranteed after 2 hours): a Nobel Prize and ${fmt(LAB_REWARD)}. The game pauses until you accept it. Offline: at most 1`],
      ["🚀 Space Mission Center", `${fmt(SPACE_PRICE)} + 👩‍🔬 ${SPACE_SCI} scientists`, `${SPACE_NEED} breakthroughs`, `A mission every 20 minutes: ${fmt(SPACE_MIN * 1e6)} – ${fmt(SPACE_MAX * 1e6)}, ${Math.round(SPACE_FAIL * 100)}% chance to fail (${Math.round((SPACE_FAIL - SAT_FAIL_CUT) * 100)}% with the satellite)`],
      ["🛰️ Satellite (🚢 Logistics)", fmt(SAT_PRICE), "Space Mission Center", "Missions fail 15% instead of 20% · cargo planes +5% pay · tankers 10% faster · broken trucks repaired for free after 5 sec"],
      // 🌌 secret buildings: only listed once the 1st prestige has revealed them
      ...(secretsOpen() ? [
        ["🌌 🎓 2nd University", fmt(UNI_PRICE), "University · 1st prestige", `Trains its own scientists (1 every 2 min, up to ${UNI_MAX}) into the same shared pool, with the same running cost and full-house income`],
        ["🌌 🔭 Astronomy Research Center", `${fmt(ASTRO_PRICE)} + 👩‍🔬 ${ASTRO_SCI} scientists`, "1st prestige", `Space missions launch ${ASTRO_TIME_CUT / 60} minutes sooner`],
        ["🌌 🛸 Orbital Space Station", `${fmt(STATION_PRICE)} + 👩‍🔬 ${STATION_SCI} scientists`, "1st prestige · both Universities full", `Missions fail ${STATION_FAIL_CUT * 100}% less often and launch ${STATION_TIME_CUT / 60} minutes sooner · Research lab breakthroughs 1 in ${STATION_LAB_ODDS.toLocaleString("en-US")} (guaranteed within 1 hour)`],
      ] : []),
      // 🌌🌌 second-tier secrets: only listed after the 2nd prestige
      ...(secrets2Open() ? [
        ["🌌🌌 🎓 3rd University", fmt(UNI_PRICE), "2nd University · 2nd prestige", `A third University for the shared pool: up to ${UNI_MAX * 3} scientists in total`],
        ["🌌🌌 🌕 Moon Base", `${fmt(MOON_PRICE)} + 👩‍🔬 ${MOON_SCI} scientists`, "Orbital Space Station · 2nd prestige", `A deep space mission every ${DEEP_EVERY / 60} minutes: ${fmt(DEEP_MIN * 1e6)} – ${fmt(DEEP_MAX * 1e6)}, ${Math.round(DEEP_FAIL * 100)}% chance to fail (not changed by the satellite, Astronomy center or station)`],
        ["🌌🌌 🧬 Genetics Laboratory", `${fmt(GENE_PRICE)} + 👩‍🔬 ${GENE_SCI} scientists`, "Moon Base · 2nd prestige", `+${GENE_BONUS * 100}% on every 🚀 space mission and 🌕 deep space mission reward`],
        ["🌌🌌 🔴 Mars Base", `${fmt(MARS_PRICE)} + 👩‍🔬 ${MARS_SCI} scientists`, "Moon Base + Genetics Laboratory · 2nd prestige", `Its own deep space mission every ${MARS_EVERY / 60} minutes: ${fmt(DEEP_MIN * 1e6)} – ${fmt(DEEP_MAX * 1e6)}, ${Math.round(MARS_FAIL * 100)}% chance to fail (+30% with the Genetics Laboratory). Moon Base missions launch ${MARS_MOON_CUT / 60} minutes sooner and fail ${MARS_MOON_FAIL_CUT * 100}% less often`],
      ] : [])])}
    ${secretsOpen() ? `<p class="muted">🌌 With both 🔭 and 🛸 a space mission launches every ${(SPACE_EVERY - ASTRO_TIME_CUT - STATION_TIME_CUT) / 60} minutes and fails ${Math.round((SPACE_FAIL - SAT_FAIL_CUT - STATION_FAIL_CUT) * 100)}% of the time with the satellite.</p>` : ""}
    <p class="muted">Nobel Prizes can be won in 10 fields: Physics, Chemistry, Medicine and Physiology, Biology, Genetics, Molecular Biology, Neuroscience, Astronomy and Astrophysics, Materials Science and Environmental Science. A prestige resets Science, unless you picked Tycoon's Legacy.</p>`;
}

function wikiCasino() {
  const lim = (t) => `${fmt(t.min)} – ${fmt(t.max)}`;
  const tables = (map) => Object.values(map).map(t => `${t.title || t.name}: ${lim(t)}`).join("<br>");
  const vpRows = VP_HANDS.slice(1).reverse().map(h => [h.name, h.pays + "×", h.jackpot ? `+${h.jackpot * 100}% of the jackpot (× your bet / max bet)` : ""]);
  const pk = (map) => Object.keys(map).map(Number).sort((a, b) => b - a).map(c => [PK_NAMES[c], map[c] === 1.5 ? "3:2" : map[c] + ":1"]);
  return `<h2>🎰 Casino</h2>
    <p>Move money into <b>casino chips</b> at the top of the Casino tab, play, then cash out. Most games have Classic, High roller and Super high roller tables.
      Bets give <b>Gambler XP</b> (bet × the table's XP multiplier) and you get <b>cashback</b> on lost bets (0.1% per Gambler level, +5% per Criminal defense lawyer).
      Random results use your browser's secure random generator.</p>
    ${wt(["Game", "Classic", "High rollers", "Super high rollers"], [
      ["🎡 Roulette", "×" + XP_TABLE_MULT.rouletteLow, "×" + XP_TABLE_MULT.rouletteHigh, "×" + XP_TABLE_MULT.rouletteSuper],
      ["🃏 Blackjack", "×" + XP_TABLE_MULT.bjLow, "×" + XP_TABLE_MULT.bjHigh, "×" + XP_TABLE_MULT.bjSuper],
      ["🎴 Baccarat", "×" + XP_TABLE_MULT.bacLow, "×" + XP_TABLE_MULT.bacHigh, "×" + XP_TABLE_MULT.bacSuper],
      ["🎴 Video Poker", "×" + XP_TABLE_MULT.vpLow, "×" + XP_TABLE_MULT.vpHigh, "×" + XP_TABLE_MULT.vpSuper],
      ["🤠 Ultimate Texas Hold'em", "×" + XP_TABLE_MULT.uthLow, "×" + XP_TABLE_MULT.uthHigh, "×" + XP_TABLE_MULT.uthSuper],
      ["🔻 Plinko", "×" + XP_TABLE_MULT.plinko, "–", "×" + XP_TABLE_MULT.plinkoSuper],
      ["🎈 Sky Climb", "×" + XP_TABLE_MULT.climb, "×" + XP_TABLE_MULT.climbHigh, "–"],
      ["🧬 Gene Cascade", "–", "×" + XP_TABLE_MULT.gcHigh, "×" + XP_TABLE_MULT.gcSuper]])}
    <h3>🔥 Hot Tables</h3>
    <p>Every 20 minutes one game type becomes <b>hot</b>: for 10 minutes <b>all</b> its tables get a bonus on their XP multiplier, then there are 10 minutes with no bonus.
      The bonus grows with your 🎲 Gambler level: <b>+10</b> (levels 1–49), <b>+20</b> from level 50, <b>+40</b> from level 75 (you get +${hotBonus()} now; High roller Blackjack ×4 becomes ×${4 + hotBonus()}). The hot game is chosen at random and is never the same twice in a row. The timer is shown under your Gambler level, together with the next hot game.</p>
    <h3>🎁 Free bet chips</h3>
    <p>From Gambler level 5 you get free chips on timers (see the frame under the Gambler level). Use them at Roulette, Blackjack, Baccarat, Video Poker and Hold'em (not Plinko, Sky Climb or Gene Cascade).
      A free chip is a bet: whatever it wins goes to your casino chips. At Hold'em, a free Ante needs 2 chips (Ante + Blind).</p>
    ${wt(["Gambler level", "Free chip"], FREE_CHIP_TYPES.map(c => [c.level, "Free " + chipLabel(c.value) + " chip"]).concat([[45, "All timers 20 → 15 min"], [85, "All timers 15 → 10 min"]]).sort((x, y) => x[0] - y[0]))}

    <h3>🎡 Roulette (European, 0–36)</h3>
    <p>${tables(ROULETTE_TABLES)} per spot.</p>
    ${wt(["Bet", "Covers", "Pays"], [["Straight up", "1 number (incl. 0)", "35:1"], ["Split bet", "2 numbers next to each other (incl. 0–1/2/3)", "17:1"],
      ["Street", "3 numbers in a row (incl. 0-1-2, 0-2-3)", "11:1"], ["Corner", "4 numbers (incl. 0-1-2-3)", "8:1"], ["Six line", "2 rows, 6 numbers", "5:1"],
      ["Dozen / Column", "12 numbers", "2:1"], ["Red / Black, Odd / Even, 1–18 / 19–36", "18 numbers", "1:1"]])}
    <p class="muted">0 loses all outside bets. House edge 2.7%.</p>

    <h3>🃏 Blackjack</h3>
    <p>${tables(BJ_TABLES)} per hand. Play up to 3 seats.</p>
    <ul><li>${BJ_DECKS}-deck shoe, the dealer stands on 17. <b>Blackjack pays 3:2</b>, other wins 1:1, ties push.</li>
      <li><b>Double</b> on any first two cards (one more card). <b>Split</b> pairs once per seat; split aces get one card each.</li>
      <li><b>Surrender</b> a first-two-card hand to get half your bet back. <b>Insurance</b> (half your bet) pays 2:1 when the dealer shows an Ace and has blackjack.</li></ul>

    <h3>🎴 Video Poker (Jacks or Better + Joker)</h3>
    <p>${tables(VP_TABLES)}. 53 cards with one wild joker. Get 5 cards, hold the ones you like, draw new ones for the rest. Pays from a pair of Jacks or better.
      <b>Jackpot</b> = 50× the table's max bet; your share is your bet ÷ the max bet. About 98% return with perfect play.</p>
    ${wt(["Hand", "Pays", "Jackpot"], vpRows)}

    <h3>🎴 Baccarat</h3>
    <p>🔒 Unlocks at <b>Gambler level ${BAC_LEVEL}</b>. ${tables(BAC_TABLES)} per betting spot. 8-deck shoe.</p>
    <ul><li>Two hands are dealt, <b>Player</b> and <b>Banker</b>. The one closest to 9 wins. A = 1, 2–9 count as shown, 10/J/Q/K = 0, and only the last digit counts (7 + 8 = 5).</li>
      <li>Nobody makes choices: a third card is drawn by the standard casino rules. An 8 or 9 in the first two cards is a <b>natural</b> and ends the hand.</li>
      <li>Bet on any spots you like: at least one bet on Player, Banker or Tie.</li></ul>
    ${wt(["Bet", "Pays"], [["Player", "1:1"], ["Banker", "0.95:1 (5% commission)"], ["Tie", "8:1 (Player and Banker bets are returned)"], ["Player Pair / Banker Pair", "11:1 (first two cards of that hand are the same rank)"]])}

    <h3>🤠 Ultimate Texas Hold'em</h3>
    <p>${tables(UTH_TABLES)} Ante per seat. Play 1 or 2 seats. Ante + equal Blind, optional Trips.</p>
    <ul><li>Before the flop: check or raise 3×/4× the ante. After the flop: check or raise 2×. After the river: raise 1× or fold. You can raise only once.</li>
      <li>Best 5 of 7 cards vs the dealer. <b>Play</b> pays 1:1 if you win. <b>Ante</b> pays 1:1, but pushes if the dealer has less than a pair.
        <b>Blind</b> pays the table below when you win with a straight or better (otherwise pushes on a win). Ties push. Folding loses Ante and Blind.</li>
      <li><b>Trips</b> pays on your own hand, even if you fold.</li></ul>
    <div class="wikiCols"><div><b>Blind</b>${wt(["Hand", "Pays"], pk(UTH_BLIND_PAYS))}</div><div><b>Trips</b>${wt(["Hand", "Pays"], pk(UTH_TRIPS_PAYS))}</div></div>

    <h3>🔻 Plinko</h3>
    <p>${tables(PLINKO_TABLES)} per ball, up to 20 balls at once. Each ball falls through 12 rows into a slot (about 98% return):</p>
    ${wt(["Slot", ...PLINKO_MULTS.map((m, i) => i + 1)], [["Pays", ...PLINKO_MULTS.map(m => m + "×")]])}

    <h3>🧬 Gene Cascade (slot)</h3>
    <p>🔒 Unlocks after your <b>1st prestige</b> and at <b>Gambler level ${GC_LEVEL}</b>. ${Object.values(GC_TABLES).map(t => `${t.title.replace("Gene Cascade: ", "")}: ${fmt(t.min)} – ${fmt(t.max)}`).join(" · ")} per spin. A 7×7 grid of specimens.</p>
    <ul><li><b>Clusters</b> of 5 or more of the same specimen touching up, down, left or right (not diagonal) pay. Winners pop, the rest fall and new ones drop in, which can win again (<b>tumbles</b>).</li>
      <li>🔬 <b>Lab spots</b>: a square where a winner popped is marked; each later win popping there doubles it: ×2, ×4, ×8 … ×128. Spots inside one cluster are <b>added</b> and multiply that cluster's pay. They reset after each paid spin.</li>
      <li>🧪 <b>DNA vials</b>: 3 / 4 / 5 / 6 / 7 on the grid at the end of a spin give 10 / 12 / 15 / 20 / 30 <b>free spins</b>. In free spins the lab spots stay for the whole bonus, and vials can add more free spins.</li>
      <li>🛒 <b>Buy free spins</b>: pay ${SL_BUY}× the bet to start the bonus at once (mostly 10 free spins, sometimes more). It also returns about 99% but swings a lot: half of bought bonuses pay under 15× the bet.</li>
      <li>About 99% return (simulated over millions of spins): a win on about 41% of spins, free spins about once every 100 spins. Max win ${SL_CAP.toLocaleString()}× the bet. A spin is decided before it is shown, so leaving or reloading pays the same win.</li></ul>
    ${wt(["Specimen", "5", "6", "8", "10", "12", "15+"], SL_SYMBOLS.map((s, i) => [s.name, ...[5, 6, 8, 10, 12, 15].map(n => +SL_PAY[i][n].toFixed(2) + "×")]))}

    <h3>🎈 Sky Climb</h3>
    <p>${Object.values(CLIMB_TABLES).map(t => `${t.title.replace("Sky Climb: ", "").replace("Sky Climb", "Classic")}: ${fmt(t.min)} – ${fmt(t.max)}`).join(" · ")}. A bag has 28 balls: 19 green, 8 red, 1 gold, not put back during a round.
      Green climbs one step, gold climbs one step and gives a shield against the next red, red pops your balloon (you lose what is still riding).
      After each step: <b>cash out</b>, <b>take half</b> (once per round), or <b>draw again</b>. About 97.7% return with perfect play.</p>
    ${wt(["Step", ...CLIMB_LADDER.slice(1, 11).map((m, i) => i + 1)], [["Pays", ...CLIMB_LADDER.slice(1, 11).map(m => m + "×")]])}
    ${wt(["Step", ...CLIMB_LADDER.slice(11).map((m, i) => i + 11)], [["Pays", ...CLIMB_LADDER.slice(11).map(m => m.toLocaleString() + "×")]])}`;
}

function wikiInvesting() {
  return `<h2>📈 Investing</h2>
    <p><b>Investor XP</b>: every minute you have money invested gives 4 XP (8 XP from 1 scoin invested, 16 XP from 100 scoin), plus XP per crypto trade.
      Each level lowers the ETF fee, adds +0.1% to property sales and lowers the crypto fee every 10 levels. Hotels unlock at levels 5, 15, 25…, the Brokerage Firm at 10.</p>
    <h3>🏠 Real estate</h3><p>${infoText("re")}</p>
    <h3>📊 ETF</h3><p>${infoText("etf")}</p>
    <h3>🪙 Gold</h3><p>${infoText("gold")}</p>
    <h3>🏦 Broker ETF</h3><p>${infoText("petf")}</p>
    <h3>🚚 Global Freight Co. shares</h3><p class="muted">🔒 Unlocks with 🚢 Logistics.</p><p>${infoText("gfc")}</p>
    <h3>📡 Live trading (crypto)</h3><p class="muted">🔒 Unlocks at Investor level ${LIVE_LEVEL}.</p><p>${infoText("crypto")}</p>
    <p class="muted">Chart tools: Line or Candles (1 min, 5 min, 15 min, 4 hours), volume bars, and MA5 / MA10 / MA20 / MA50 moving averages. Hover the chart for details.</p>`;
}

function wikiLogistics() {
  const fleetRow = (k) => { const F = FLEETS[k]; const mins = F.routes.map(r => r.min), maxs = F.routes.map(r => r.max);
    return [`${fIco(k)}${F.label}`, fmt(F.price), F.slots, `${Math.min(...mins)}–${Math.max(...maxs)} min`, F.unlock ? `Own ${F.unlock.tankers} oil tankers` : "Always", `Level ${AGENT_LEVEL[k]}`]; };
  return `<h2>🚢 Logistics</h2>
    <p class="muted">🔒 Logistics unlocks when you buy your first 🚘 Car Salon.</p>
    <p>Buy vehicles, then pick one of 4 contract offers for each. When the trip ends, the contract is paid to your money and a new set of offers appears.
      Trips keep moving while the game is closed.</p>
    ${wt(["Fleet", "Price", "Slots", "Trip length", "Unlock", `${lgIco("agent")}Agent unlock`], ["truck", "tanker", "plane"].map(fleetRow))}
    <h3>${lgIco("level", "h")}Logistics level</h3>
    <p>XP for every delivered contract: contract minutes × 1 (truck), × 3 (tanker), × 6 (plane). The level unlocks the <b>Logistics agents</b>:
      turn one on and it picks a random contract 5 seconds after the offers appear, for 2% of that contract's profit.
      The 🏬 Logistics Center (Logistics level ${CENTER_LEVEL}) upgrades all agents: 1% fee, the most profitable contract, and picks after 3 seconds.</p>
    <h3>${lgIco("truck", "h")}Semi-trucks</h3><p>${infoText("truck")}</p>
    <h3>${lgIco("tanker", "h")}Oil tankers</h3><p>${infoText("logi")}</p>
    <h3>${lgIco("plane", "h")}Cargo planes</h3><p>${infoText("plane")}</p>
    <h3>🗺️ World map</h3>
    <p>Shows every vehicle moving along its route (trucks on roads, tankers on sea lanes, planes on flight paths), and every contract city as a dot in the fleet's color.
      Hover a vehicle or city for details. A glowing ring means a vehicle is on its way there.</p>
    <h3>Bonuses</h3>
    <ul><li>📦 Warehouses: +2% on truck contracts each (max 5).</li><li>⚓ Trading Port: +2.5% on tanker contracts and ${PORT_PER_TANKER} / sec per tanker.</li>
      <li>🚢 Global Empire prestige: keep your fleet on resets; level 2 halves every contract's time.</li></ul>
    ${typeof SP_RACES === "object" ? `<h2>🌌 Space</h2>
    <p>The second Logistics page. It opens when you build the 🚀 Space Mission Center: a star map with our Solar System in the middle and alien systems all around it.</p>
    <p><b>Ships:</b> 🚀 Space Mission Center 1 ship, and more from other space buildings (up to 6). Ships keep flying while the game is closed.</p>
    <p><b>1. Explore:</b> send a ship to an unknown signal. It flies there and back (6–40 min each way) and meets the race that lives there.
      Three systems are reachable from the start; each of the others is revealed by its neighbour once you are <b>Acquainted</b>.</p>
    <p>🔮 <b>Network races:</b> the Mystics and the Machines (found through a 😊 Friendly neighbour) and the Ancients (once 3 races trust you, 💛 Trusted) only want other races' goods.</p>
    <p><b>2. Gifts:</b> each race asks for one gift at a time: money, ore from your 🏦 vault, ${spKindOpen.dna() ? "DNA samples, " : ""}paintings or stardust.
      Their favourite kind gives +${SP_FAV_PTS} friendship, the other +${SP_PTS}. A request changes every 24 hours, or ask for something else every 4 hours.
      Paintings you give away count as sold. Only one gift per race can be on its way at a time.</p>
    <p>🚚 <b>Logistics XP:</b> every gift trip gives ${LOGI_XP_RATE.ship} XP per minute of the round trip when the ship gets home. Exploring gives no XP.</p>
    <p>🛣️ <b>Trade routes</b> (from 😊 Friendly): one ship flies to the race and back for good, bringing ${SP_ROUTE_GOODS[3]} goods every trip (${SP_ROUTE_GOODS[4]} at 💛 Trusted and ${SP_ROUTE_GOODS[5]} at 💖 Allies, with trips 15% and 30% faster). It keeps going while the game is closed and gives Logistics XP like a gift trip. Stop it any time: the ship comes home after its trip.</p>
    <p>🏪 <b>Market</b> (🌌 Space → Market): sell alien goods for money. A good is worth about ${SP_PRICE_MIN} × the race's distance (in minutes) minutes of your business income, and every price moves up or down every 30 minutes. Once you are 💖 Allies with a race, you can also buy its goods there; buying always costs more than the best selling price.</p>
    <p>⭐ <b>Special requests:</b> sometimes a race asks for 50% more within 12 hours, for ${SP_SPECIAL.pts}× friendship and extra goods. Let it run out and they are offended (−${SP_SPECIAL.offend} friendship).</p>
    <p>☄️ <b>On the way:</b> an asteroid field can make a trip ${SP_EV.delay * 100}% longer; your ship may rescue a lost alien ship (+${SP_EV.rescue} friendship); and pirates may stop it: pay a toll (${SP_EV.toll} min of income) or run for it (50% chance to lose the cargo). Pirates leave you alone once the Void Corsairs are 💛 Trusted.</p>
    ${wt(["Race", "💛 Trusted", "💖 Allies"], Object.entries(SP_BONUS).map(([k, B]) => [SP.races[k].found ? `${SP_RACES[k].emoji} ${SP_RACES[k].name}` : "❓ Unknown", B.text(B.val[0], 0), B.text(B.val[1], 1)]))}
    <p class="muted">🏅 Alliance bonuses last while you keep that friendship level.</p>
    <p>🆘 <b>Alien emergencies:</b> while you play, a race you know may suddenly need help. Send ${SP_SOS_SCI} 🔬 scientists within ${SP_SOS_TIME / 60e3} minutes for +${SP_SOS_WIN} friendship; if nobody comes, they lose ${SP_SOS_LOSE} friendship with you. Exploring takes ${SP_EXPLORE_SCI} scientists.</p>
    <p><b>3. Alien goods:</b> your ship comes back with the race's own goods (more at higher friendship, plus a thank-you shipment at every new level). Sell them at the 🏪 Market.</p>
    ${wt(["Race", "Lives", "Favourite", "Also likes", "Sends back", "Each way"], Object.entries(SP_RACES).map(([k, R]) =>
      [SP.races[k].found ? `${R.emoji} ${R.name}` : "❓ Unknown", SP.races[k].found ? R.title : "?", SP.races[k].found ? spKindName(R.wants[0]) : "?", SP.races[k].found ? spKindName(R.wants[1]) : "?",
        SP.races[k].found ? spGood(R.good) : "?", `${R.min} min`]))}
    ${wt(["Friendship", "Needed"], SP_LEVELS.slice(1).map(l => [`${l.icon} ${l.name}`, l.pts ? l.pts.toLocaleString() : "First contact"]))}
    <p>A prestige never resets the races, your friendship or your goods. Ships come from your buildings, so you get them back as you rebuild them (or keep them with Tycoon's Legacy).</p>` : ""}`;
}

function wikiAchievements() {
  return `<h2>🏆 Achievements</h2>
    <p>${achShown().length} achievements in ${achCatsShown().length} categories. They are checked every second, kept forever (also through prestige) and shown with progress bars in the 🏆 tab.</p>
    <h3>🎁 Rewards</h3>
    <p>Cosmetic collections (backgrounds, coins and 🃏 card decks) are unlocked by achievements. Turn them on in 🏆 Achievements → 🎁 Rewards. You can wear one item per slot, and wearing the coin and background of the same collection unlocks 🎨 "Dressed to impress".</p>
    ${wt(["Reward", "How to unlock"], COLLECTIONS.filter(c => c.reward && !(c.hidden && c.hidden())).map(c => [c.name, c.reward.text]))}
    ${achCatsShown().map(c => `<h3>${c.name}</h3>` + wt(["", "Achievement", "Goal", ""],
      achShown().filter(a => a.cat === c.id).map(a => [a.icon, `<b>${a.name}</b>`, a.desc, state.achievements[a.id] ? "✅" : ""]))).join("")}`;
}

function wikiPet() {
  return `<h2>🐾 Pet</h2>
    <p>A pet lives on your 💰 Income page and helps you. Find one in a 🏴‍☠️ pirate loot box (🎮 Mini-games → 🚀 Nebula Strike, levels 4 and 5, or the pirate chest in the hangar). More pets are coming.</p>
    <ul><li>⚡ It buys the energy drink by itself when it's ready and you can afford it.</li>
      <li>👆 While the drink is active, it taps the coin for you: 10 clicks per second, worth the same as yours (they count for 🏆 achievements).</li>
      <li>😴 During the cooldown it sleeps, and wakes up 10 seconds before the next drink.</li>
      <li>❤️ Click it to pet it. On the 🐾 Pet page you can rename it or hide it.</li></ul>
    <h3>🐭 Pip the painter</h3>
    <p>A young alien painter from the Lumerians (🌌 Space Logistics). Once you are 😊 Friendly with them, you can adopt him for 10 paintings from your collection (they count as sold for 🏆 achievements).</p>
    <ul><li>🎮 He lives at the top of the Mini-games page, next to his easel.</li>
      <li>🎨 Every 15 minutes he paints a 🟡 Normal painting: 14 minutes asleep, then 1 minute of painting. His copies are 85–95% matches, worth that part of 100M.</li>
      <li>🖼️ The painting goes to your collection; if it's full, he sells it right away. Both count for 🏆 achievements.</li>
      <li>🌙 He keeps painting while the game is closed (up to 24 hours of paintings).</li>
      <li>❤️ Click him while he sleeps to pet him. If you poke him while he's painting, he gets a bit grumpy. Rename him on the 🐾 Pet page.</li></ul>`;
}

function wikiArt() {
  const mineSec = (typeof ORES === "object") ? ORE_KEYS.map(k => `${oreIcon(k)} ${ORES[k].name} ${ORES[k].sec} sec`).join(" · ") : "";
  return `<h2>🎮 Mini-games</h2>
    <p>The 🎮 Mini-games tab holds games you unlock with your buildings and achievements. Play them to earn extra money.</p>
    <h2>⛏️ Gold Mine Dig</h2>
    <p>Unlocks when you buy your first ⛏️ gold mine and stays unlocked even after the mine runs dry or a prestige.
      Each run costs ⚡ 1 energy: you have up to ${MINE_ENERGY_MAX} (more with the ⚡ Energy tank), and 1 comes back every ${MINE_REGEN_MS / 60000} minutes (faster with ⏱️ Fast recharge), also while the game is closed.</p>
    <p>Dig with the arrow keys / WASD or the on-screen buttons. Every step burns lamp oil (${MINE_LAMP} at the start): walking through a tunnel ${MINE_COST.walk},
      digging dirt ${MINE_COST.dirt}, each hit on stone ${MINE_COST.stone} (2 hits) and on granite ${MINE_COST.granite} (3 hits). 🪨 Bedrock can't be dug.
      Your bag holds ${MINE_BAG} ore. Walk back to the surface to sell; if the lamp runs out underground, the rescue team keeps you safe but you keep only ${MINE_RESCUE_KEEP * 100}% of your ore (more with 🆘 Rescue insurance).</p>
    <p>Ore is worth seconds of your income (your average business income over the last minute, at least ${fmt(MINE_MIN_BASE)} / sec): ${mineSec}.
      Deeper ore is rarer and worth more. 🔥 A gold rush in your real mines doubles ore value while it lasts.</p>
    <h3>🏦 Vault and ⬆️ upgrades</h3>
    <p>At the end of a run you choose: <b>💰 sell</b> your ore, or <b>🏦 keep it in the vault</b>. Your vault (shown under the energy) pays for upgrades, and you can still sell vault ore later at its normal value (no gold rush bonus). If you're rescued, the team saves 50% of your ore (65% / 80% with insurance), starting with the most valuable piece.</p>
    ${wt(["Upgrade", "Levels", "Effect per level", "Cost per level (money + ore)"], Object.keys(MINE_UPS).map(k => {
      const U = MINE_UPS[k];
      return [U.icon + " " + U.name, U.max, U.costs.map((_, i) => U.eff(i + 1)).join(" → "),
        U.costs.map(c => fmt(c[0]) + " + " + Object.keys(c[1]).map(o => c[1][o] + " " + oreIcon(o)).join(" ")).join(" · ")];
    }))}
    <p class="muted">Upgrades and the vault are kept on prestige.</p>
    <h2>${ico("artgallery", "biz")}Art Gallery</h2>
    <p>Copy a painting as closely as you can. The closer the match, the more your copy is worth. After you earn the 💵 Millionaire achievement (${fmt(1e6)} on hand), the gallery can be opened for <b>${fmt(ART_UNLOCK)}</b>.</p>
    <h3>Tiers</h3>
    <p>🟡 Normal unlocks after you submit (sell or keep) ${ART_TIER_NEED.hard.count} Easy paintings; 🏛️ Masterpiece unlocks after ${ART_TIER_NEED.master.count} Normal paintings.</p>
    ${wt(["Tier", "Paintings", "Full value"], ART_TIER_LIST().map(k => ART_TIERS[k]).map(t => [`${t.icon} ${t.name}`, t.desc, fmt(t.value)]))}
    <h3>🏛️ Masterpieces</h3>
    <p>Simplified versions of famous old paintings (all old enough to be free for everyone to use), drawn in the game's 24 colours:</p>
    ${wt(["Painting", "Artist", "Year"], ART_MASTERS.map(m => [`${m.emoji} ${m.name}`, m.artist, m.year]))}
    <h3>📜 Daily commission</h3>
    <p>Every 24 hours a collector asks for one specific painting (🟡 Normal, or a 🏛️ Masterpiece once they are open) and pays <b>×${ART_COMM_MULT}</b> its value. Press 🖌️ Paint it in the studio, then sell or keep a copy of at least ${ART_MIN_MATCH}% before the time runs out. One delivery per commission.</p>
    <p>Your copy is worth <b>match % × the full value</b>: an 80% copy of a Normal painting is worth ${fmt(ART_TIERS.hard.value * 0.8)}. A copy under <b>${ART_MIN_MATCH}%</b> can't be sold or kept: keep working on it or start a new one. There is no timer.</p>
    <h3>Tools</h3>
    ${wt(["Tool", "What it does"], [["🖌️ Brush", "Paints with the selected color: round or square tip, 6 sizes from 1 px to 44 px"],
      ["⬛ Square / ⚫ Circle / 🔺 Triangle", "Drag a box to draw a filled shape. Hold Shift for a perfect square or circle. Turn an oval or a triangle to any angle (180° = upside down) with the ↻ slider or the mouse wheel, while drawing it or right after"], ["🪣 Fill", "Fills an area of one color"], ["➖ Line", "Drag to draw a straight line in the brush size and tip. Hold Shift for straight 45° angles"],
      ["💧 Eyedropper", "Click the original (or your copy) to take that colour"], ["🪞 Mirror", "Turn it on and everything you paint is also painted on the other side, flipped left ↔ right"], ["✋ Grab", "Drag the last shape you drew to move it; pick a color to recolor it (works until you draw or paint something else)"], ["🧽 Eraser", "Paints white"], ["↶ Undo / 🗑️ Clear", "Takes back the last step / starts over"]])}
    <p>🔥 After you submit, a <b>heatmap</b> shows in red where your copy doesn't match the original.</p>
    <h3>How the match is scored</h3>
    <p>Your copy is judged three ways: <b>🎨 Colors</b> (each part has the right color), <b>📐 Layout</b> (things are in the right places) and
      <b>🔷 Shapes found</b>: every separate shape in the original (each planet, star, sail, sun…) must appear in your copy in the same color, in about the same place and size.
      Brush strokes count as shapes too (a painted arm or branch is one shape), and if your whole drawing is a bit shifted, the shapes are lined up before they're compared.
      The shape count is worth the most, so painting only the background (sky, sea, space) scores low; drawing every object scores high. Extra scribbles cost points, small wobbles are forgiven, and an empty canvas scores 0%.</p>
    <h3>Sell or keep</h3>
    <p>After submitting, <b>sell</b> the copy for its value right away, or <b>keep</b> it in your 🖼️ Collection (no money now; sell it there any time for the same value).
      The collection starts with ${ART_SLOTS_START} slots; each +${ART_SLOTS_STEP} slots costs ${fmt(ART_SLOT_PRICE)}, then ${fmt(ART_SLOT_PRICE + ART_SLOT_PRICE_STEP)}, ${fmt(ART_SLOT_PRICE + 2 * ART_SLOT_PRICE_STEP)}… up to a maximum of ${ART_SLOTS_MAX} slots. A prestige keeps the gallery unlocked, your bought slots and all your paintings; only the 🏛️ Art Gallery business is reset (buy it again to earn from the paintings).</p>
    <h3>🏛️ Art Gallery business</h3>
    <p>With ${GALLERY_NEED} paintings in your collection you can buy the 🏛️ Art Gallery special business (💰 Income tab) for ${fmt(GALLERY_PRICE)}.
      It earns ${fmt(GALLERY_PER_PAINTING)} / sec for every painting in your collection, up to ${fmt(GALLERY_MAX)} / sec. Selling paintings lowers it.</p>
    ${typeof SH_LEVELS === "object" ? `<h2>🚀 Nebula Strike</h2>
    <p>A side-scrolling space shooter. It opens when you build the 🚀 Space Mission Center (🔬 Science) and stays open for good, even after a prestige.
      Fly your ship through 5 levels of enemy waves; levels 1–4 end with a boss (level 4 has two), and in level 5 you must survive for 5 minutes. Beating a level opens the next one. Levels are free to play,
      but if you lose all your lives, the level starts over from the beginning.</p>
    ${wt(["Level", "Difficulty", "Length", "Boss", "First clear", "Later clears"], SH_LEVELS.map(L =>
      [`${L.n}: ${L.name}`, L.diff, L.time, L.survive ? t("None (survive 5 min)") : L.boss1 ? `${L.boss1} + ${L.boss}` : L.boss,
        L.loot ? `🏴‍☠️ Loot box + ✨ ${L.dustFirst}` : `${L.first} min of income + ✨ ${L.dustFirst}`, L.loot ? `🏴‍☠️ Loot box + ✨ ${L.dustAgain}` : `${L.again} min of income + ✨ ${L.dustAgain}`]))}
    <p>🏴‍☠️ <b>Pirate loot box</b> (levels 4 and 5, every clear): after Captain Cutlass, the waves continue for about 2 more minutes before Admiral Dreadmaw. Beat him to open a loot box (after your first win you can also buy one in the hangar for ✨ 10,000 stardust):</p>
    <p>🗺️ <b>Level 5: Pirates' Lost Treasure</b> has no boss: survive for 5 minutes while it keeps getting busier. Watch out for 🦈 sea sharks, powder monkeys with big cannonballs, and cursed rocks and broken masts that can't be destroyed (your shots bounce off them, so fly around them). Survive to win the same pirate loot box.</p>
    ${wt(["Rarity", "Chance", "Prize"], shLootOdds().filter(T => T.p).map(T => [T.k === "pet" ? "🐾 Pet" : T.name, `${T.p}%`, T.k === "pet" ? "A pet that lives on your 💰 Income page (you can only have one; after that its chance goes to Epic)" : T.min[0] === T.min[1] ? `${T.min[0]} min of income` : `${T.min[0]}–${T.min[1]} min of income`]))}
    <p class="muted">The income reward uses the same base as the Gold Mine Dig (business income over the last minute).</p>
    <p>🛡️ <b>Shield:</b> usable every 15 sec. It stays up 1.5 sec and blocks the next hit (a shot, an enemy or a boss beam), then breaks. If nothing hits it in time, it's wasted.</p>
    <p>📦 <b>Supply ships</b> (glowing capsules) fly by every 20–28 sec. Shoot them for a special weapon or an extra life:
      🚀 homing missiles (8 shots), ⚡ laser beam (3 shots, hits everything in a line and erases enemy shots) and 💠 nova spread (6 shots of 9 bullets that go through enemies).
      Picking up the same weapon adds ammo; a different one replaces it.</p>
    <p>✨ <b>Stardust</b> drops from enemies and bosses and is paid for clearing a level (you keep what you collected even if you lose).
      It buys ships and upgrades in the 🛸 hangar. Every ship has its own upgrades.</p>
    ${wt(["Ship", "Price", "Speed", "Lives", "Gun"], SH_SHIP_IDS.map(id => { const s = SH_SHIPS[id];
      return [s.name, s.price ? `✨ ${s.price.toLocaleString()}${s.needs ? ` (after level ${s.needs})` : ""}` : "Free", String(s.speed), String(s.hearts), s.desc]; }))}
    ${wt(["Upgrade", "Levels", "Effect", "⛏️ Mine ore"], SH_UP_IDS.map(k => [SH_UPS[k].icon + " " + SH_UPS[k].name, String(SH_UPS[k].max), SH_UPS[k].eff(SH_UPS[k].max) + " at max",
      Object.entries(SH_UP_ORE[k] || {}).map(([lv, ore]) => `Lv ${lv}: ${Object.entries(ore).map(([o, n]) => `${o === "ruby" ? "🔴" : "💎"} ${n}`).join(" ")}`).join(" · ") || "—"]))}
    <p>🐾 <b>The pet</b> (5% from the pirate loot box, only one): it lives on your 💰 Income page next to the coin. When the ⚡ energy drink is ready it drinks it for you (it pays the normal price),
      then taps the coin at the max speed of 10 clicks per second while the drink lasts (its taps count as clicks, also for achievements, and share the 10-per-second limit with your own clicks).
      During the drink's cooldown it sleeps and wakes up 10 seconds before the next one. It only works while the Income page is on screen. Click it to pet it; hide it or rename it in ⚙️ Settings.</p>
    <p>⭐ Score: every destroyed enemy gives points (100 for small ships, up to 1,000 for big gunships) and each boss gives a big bonus (Scrap Crab 5,000, Hive Queen 10,000, The Taxman 20,000). Your best score for each level is shown in the hangar.</p>
    <p>⛏️ The top upgrade levels also need 💎 diamonds or 🔴 rubies from your 🏦 vault in the ⛏️ Gold Mine Dig, on every ship. Keep ore after a dig instead of selling it to save up.</p>
    <p>⌨️ Move with the arrows or WASD, 🛡️ shield with Shift or K, 🚀 special weapon with X or L, ⏸️ pause with P or Esc. You can change the shield and special weapon keys in the hangar. Auto-fire is on by default (turn it off in the hangar to shoot with Space).
      📱 On a phone, drag anywhere on the screen to fly and tap the buttons for the shield and special weapon.</p>` : ""}
    ${typeof secrets2Open === "function" && secrets2Open() && typeof GENE_TOTAL === "number" ? `<h2>🌌🌌 🧬 Gene Splicer</h2>
    <p>Opens when you buy the 🧬 Genetics Laboratory (🔬 Science) and stays open for good, even after a prestige.
      You start with 5 DNA samples: 🧑 Human, 🐟 Fish, 🦎 Lizard, 🕷️ Spider and 🌱 Plant. Put two samples in the splicer (the same one twice works too):
      if they make a species, it goes into your ❄️ freezer and becomes a new sample to splice with. There are ${GENE_TOTAL} species to find.</p>
    ${wt(["Rarity", "First discovery pays"], ["c", "u", "r", "e", "l"].map(k => [GENE_RARITY[k].name, `${GENE_RARITY[k].min} min of income`]))}
    <p>Splicing a species you already know pays nothing, but gives you one more DNA sample of it. The reward uses the same income base as the Gold Mine Dig.</p>
    <p>🧪 <b>DNA:</b> you can hold up to ${GENE_DNA_MAX} samples of each species. Every 10 minutes every species you know gets +1 (also while you are away).
      A splice uses 1 of each sample (2 if both are the same).</p>
    <p>🧪 <b>Mutations:</b> two samples that don't make a real species make a <b>mutant</b> instead, named after its parents (🕷️ Spider + 🌳 Tree = Spidree).
      It pays ${GENE_MUTANT_SEC} sec of income the first time and goes in your 🧪 Mutant jar. Mutants can't be spliced again, and each pair makes its mutant only once.</p>
    <p>🏆 <b>Species bonuses</b> (for good, +1% for every species you discover in that category): 🐟 Aquatic → tanker contracts, 🐦 Birds → cargo plane contracts,
      🐾 Mammals → truck contracts, 🐉 Mythical → space and deep space mission rewards, 🦕 Extinct → Art Gallery income, 🕷️ Bugs → ore sold in the Gold Mine Dig.</p>
    <p>🔎 <b>Unfound partners:</b> each sample in your freezer shows how many new species you can still make with it and the samples you already have ("3 unfound"),
      or "🔒 later" when the rest need a sample you haven't found yet. Mutants never count, and hints only show real recipes.</p>
    <p>💡 <b>Hints:</b> spend ${GENE_HINT_SCI} scientists from your Universities to reveal one recipe you can make right now. The 📖 Codex shows every species you've found and how you made it.</p>` : ""}`;
}
const WIKI_RENDER = { art: wikiArt, general: wikiGeneral, income: wikiIncome, casino: wikiCasino, investing: wikiInvesting, logistics: wikiLogistics, achievements: wikiAchievements, pet: wikiPet };
function renderWiki() {
  const page = WIKI_RENDER[state.wikiPage] ? state.wikiPage : "general";
  $("wikiNav").innerHTML = WIKI_SECTIONS.map(s => `<button class="subTab ${s.id === page ? "active" : ""}" data-wiki="${s.id}">${s.name}</button>`).join("");
  $("wikiBody").innerHTML = WIKI_RENDER[page]();
}
/* ----- 🔍 Wiki search: looks through every section (headings, paragraphs, list items, table rows) ----- */
const escHtml = (t) => String(t).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const escRe = (t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const WIKI_BLOCKS = "h2, h3, h4, p, li, tr";
function wikiWords(q) { return q.toLowerCase().split(/\s+/).filter(w => w.length >= 2); }
function wikiSearch(q) {
  const words = wikiWords(q), hits = [];
  if (!words.length) return hits;
  const tmp = document.createElement("div");
  for (const sec of WIKI_SECTIONS) {
    try { tmp.innerHTML = WIKI_RENDER[sec.id](); } catch (e) { continue; }
    i18nApply(tmp);   // 🌐 search the words the player reads (Spanish when the game is in Spanish)
    let heading = t(sec.name);
    tmp.querySelectorAll(WIKI_BLOCKS).forEach((el, idx) => {
      const raw = el.tagName === "TR" ? [...el.cells].map(c => c.textContent.trim()).filter(Boolean).join(" · ") : el.textContent;
      const text = raw.replace(/\s+/g, " ").trim();
      if (/^H[234]$/.test(el.tagName)) heading = text;
      const low = text.toLowerCase();
      if (!text || !words.every(w => low.includes(w))) return;
      const score = (/^H[234]$/.test(el.tagName) ? 10 : 0) + words.reduce((a, w) => a + low.split(w).length - 1, 0);
      hits.push({ sec: sec.id, secName: t(sec.name), heading, text, idx, score });
    });
  }
  return hits.sort((a, b) => b.score - a.score).slice(0, 40);
}
function wikiMark(text, words) {
  let html = escHtml(text);
  for (const w of words) html = html.replace(new RegExp("(" + escRe(escHtml(w)) + ")", "gi"), "<mark>$1</mark>");
  return html;
}
function wikiSnippet(text, words) {
  const low = text.toLowerCase(), at = Math.max(0, low.indexOf(words[0]) - 60);
  const cut = (at > 0 ? "…" : "") + text.slice(at, at + 170) + (at + 170 < text.length ? "…" : "");
  return wikiMark(cut, words);
}
let wikiQuery = "";
function renderWikiResults() {
  const q = wikiQuery.trim(), words = wikiWords(q);
  if (!words.length) { $("wikiSearchInfo").textContent = ""; renderWiki(); return; }
  const hits = wikiSearch(q);
  $("wikiSearchInfo").textContent = hits.length ? `${hits.length}${hits.length === 40 ? "+" : ""} result${hits.length === 1 ? "" : "s"}` : "";
  $("wikiNav").querySelectorAll(".subTab").forEach(b => b.classList.remove("active"));
  $("wikiBody").innerHTML = `<h2>🔍 Results for “${escHtml(q)}”</h2>` + (hits.length
    ? hits.map((h, i) => `<button class="wikiHitRow" data-hit="${i}">
        <span class="wikiHitWhere" data-noi18n>${h.secName}${h.heading && h.heading !== h.secName ? " › " + escHtml(h.heading) : ""}</span>
        <span class="wikiHitText" data-noi18n>${wikiSnippet(h.text, words)}</span></button>`).join("")
    : `<p class="muted">Nothing found. Try another word, e.g. a game, a building or a vehicle.</p>`);
  $("wikiBody")._hits = hits;
}
function openWikiHit(h) {
  const words = wikiWords(wikiQuery);
  state.wikiPage = h.sec; renderWiki(); save();
  i18nApply($("wikiBody"));   // translate now, before the search words are marked
  // highlight the search words in the opened section and jump to the matching block
  const walker = document.createTreeWalker($("wikiBody"), NodeFilter.SHOW_TEXT), nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);
  const re = new RegExp("(" + words.map(escRe).join("|") + ")", "gi");
  for (const n of nodes) {
    if (!re.test(n.nodeValue)) continue;
    re.lastIndex = 0;
    const span = document.createElement("span");
    span.innerHTML = escHtml(n.nodeValue).replace(new RegExp("(" + words.map(w => escRe(escHtml(w))).join("|") + ")", "gi"), "<mark>$1</mark>");
    n.replaceWith(span);
  }
  const el = $("wikiBody").querySelectorAll(WIKI_BLOCKS)[h.idx];
  if (el) { el.classList.add("wikiFlash"); el.scrollIntoView({ behavior: "smooth", block: "center" }); setTimeout(() => el.classList.remove("wikiFlash"), 2200); }
}
let wikiSearchTimer = null;
$("wikiSearch").addEventListener("input", () => {
  clearTimeout(wikiSearchTimer);
  wikiSearchTimer = setTimeout(() => { wikiQuery = $("wikiSearch").value; renderWikiResults(); }, 150);
});
$("wikiSearch").addEventListener("keydown", (e) => {
  if (e.key === "Escape") { $("wikiSearch").value = ""; wikiQuery = ""; renderWikiResults(); }
  if (e.key === "Enter") { const h = ($("wikiBody")._hits || [])[0]; if (h && wikiWords(wikiQuery).length) openWikiHit(h); }
});
$("wikiBody").addEventListener("click", (e) => {
  const r = e.target.closest("[data-hit]");
  if (r) openWikiHit($("wikiBody")._hits[Number(r.dataset.hit)]);
});
$("wikiNav").addEventListener("click", (e) => {
  const b = e.target.closest("[data-wiki]");
  if (!b) return;
  state.wikiPage = b.dataset.wiki;
  renderWiki(); save();
  $("wikiView").scrollIntoView({ behavior: "smooth", block: "start" });
});
