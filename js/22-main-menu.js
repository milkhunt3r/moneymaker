/* Empire of Coins © 2026 milkhunt3r. All rights reserved. */
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
  menuInfo();
  layoutMenu();
}
// ▶ the line under Play (your progress at a glance) and the 🆕 badge on About (patch notes you haven't seen)
const NOTES_SEEN = "eoc-notes-seen";
function menuInfo() {
  const fresh = !state.legacy.count && !state.companies.length && state.money < 1000;
  const c = $("menuContinue");
  const es = LANG === "es";
  if (c) c.innerHTML = fresh ? (es ? "Nueva partida: empieza con una moneda" : "New game: start with one coin") :
    `${es ? "Continuar" : "Continue"} · <b>${fmt(state.money)}</b>${state.legacy.count ? ` · ⭐ ${es ? "Prestigio" : "Prestige"} <b>${state.legacy.count}/${PRESTIGE_MAX}</b>` : ""}`;
  let seen = ""; try { seen = localStorage.getItem(NOTES_SEEN) || ""; } catch (e) {}
  const n = $("menuNew"); if (n) n.hidden = !PATCH_NOTES.length || seen === PATCH_NOTES[0].date;
}
setInterval(() => { if (!$("mainMenu").hidden) menuInfo(); }, 1000);
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
  { date: "28 November 2026", title: "Empire of Coins", items: [
    "🎨 More painted icons instead of emoji: the 🐾 Pets page, worker traits, statuses and buttons on 💰 Income (and the Wiki trait list), the buttons and payout tables in the 🎰 Casino, 🚚 Logistics (Send buttons, friendship levels, gifts, pirates, escorts, trade routes, trading, alliance bonuses, outposts and crafting), and 📈 Investing (selling locks, auto cash-out, sale bonuses, take profit, stop loss, liquidation, open positions and chart buttons).",
    "🚀 Nebula Strike: ✨ stardust is now a little see-through, so it's easier to tell apart from enemy bullets.",
    "⚙️ Settings: the <b>Display</b> section folds away (tap its header). Folded, it shows your language, brightness and number format at a glance.",
    "🎮 Mini-game fixes: 🎨 Art Gallery: Submit copy and New painting sit apart, and New painting asks before throwing your copy away. ⛏️ Gold Mine: a 🏦 Vault box with your ore and what it's worth. 🚀 Nebula Strike: a big Continue button for the next level, and the pirate chest sits right under it. 🧬 Gene Splicer: a start guide for your first splice, and the DNA timer and Hint sit in the splicer box.",
    "🎮 Mini-games hub: 🎨 Pip now paints at the top of the 🖼️ Art Gallery page, a <b>!</b> on a game (and on the Mini-games tab) shows when it wants you: today's art commission, full mine energy, full DNA or something to buy in Nebula Strike. On phones the games sit two per row.",
    "🎮 Mini-games: side tabs keep each game tidy. ⛏️ Gold Mine Dig: Dig / Upgrades. 🚀 Nebula Strike: Levels / Hangar / Upgrades. 🧬 Gene Splicer: Freezer / Codex / Mutants / Bonuses, with the splicer always on top. A <b>!</b> shows when you can buy an upgrade or a ship.",
    "🎮 Mini-games: every game now has the same header (← back, title and its key number: 🖼️ collection, ⚡ energy, 🏁 levels and ✨ stardust, or species found), and the rules are folded into <b>ℹ️ How to play</b> (open the first time, folded once you've played).",
    "🛠️ Space crafting level 3 now also unlocks crafting in batches of <b>150</b>.",
    "🏆 6 new achievements: <b>🐾 Pet lover</b> (have 2 pets) and <b>🏡 Full house</b> (have 3 pets), plus 4 Mining achievements for 🤖 Digy: adopt him, let him dig 5 and 50 times, and pet him 100 times.",
    "🤖 Digy reacts now: click him to pet him (5 in a row and he jumps for joy), he wakes up with a stretch and does a ta-da once he's clean. Don't poke him while he digs: he gets grumpy!",
    "🤖 New pet: <b>Digy</b>, a little Kragg mining robot! Get him from the 🗿 Kragg once you're 😊 Friendly (💎 50 diamonds + 🔴 10 rubies). When your ⛏️ mine energy is full, he digs for 30 seconds (⚡ 3 energy) and brings 🔴 1 · 💎 3 · 🟡 10 · ⚪ 20 · 🟠 25 · ⚫ 25 to your 🏦 vault, also while the game is closed (up to 24 hours).",
    "👥 Friends: your friend requests and friends now come first, with a big friend code box (📋 Copy, 📤 Share) and an invite when you have no friends yet. Online friends have a <b>⚔️ Challenge</b> button that opens the Online casino with them picked.",
    "👤 Profile: tap your avatar to change it, see your 🦊🦉🦅 levels and your pets by name, pick a <b>🏅 showcase</b> of 3 achievements, and choose whether other players can see your money.",
    "🐾 The Pet tab is now <b>Pets</b>: your pet collection at the top (2 of 4 found so far), a live status line for each pet with a Go see him button, and earnings for both pets.",
    "🐾 Every pet has an <b>Active / Resting</b> switch. Resting hides it and stops its work (Pip's painting clock pauses). Pip also has a new <b>Always sell his paintings</b> option. Rename a pet with the ✏️ next to its name.",
    "⚙️ More settings: <b>Numbers</b> (coins like 3.92 gcoin, short like 3.92T, or full), <b>Reduce effects</b> (no blur, glows play once, no floating click numbers) and <b>Pop-ups</b> (all, only warnings, or none).",
    "💾 <b>Back up or restore your game</b> in ⚙️ Settings: download a backup file or copy a backup code, and load it on any browser, no account needed. Backups can't be edited to cheat.",
    "🏠 Main menu: a line under Play shows your progress (money and prestige), a <b>NEW</b> badge on About marks patch notes you haven't read, Donate is now a small button, and the top corner shows whether your game is saved to the ☁️ cloud.",
    "⚙️ Settings: a new <b>Account</b> section (sign in, ☁️ Sync now, sign out), a \"Saved 12 s ago\" row with a Save now button, an About section, and 🗑️ Reset game moved to a small danger zone at the bottom.",
    "🎁 Free casino bet chips now go back to 0 on a prestige reset. 🎟️ VIP Coins keeps them: pick it and your free chips stay on that and every later reset.",
    "🌌 Prestige resets no longer touch Space: friendships, goods, stardust, crafted items, research and contracts all stay. Ships in flight finish their trip, and friendships don't cool off while you have no ships.",
  ] },
  { date: "27 November 2026", title: "Empire of Coins", items: [
    "⚖️ Balance update: businesses matter for longer. 🚘 Car Salons earn <b>×2</b>. 🎰 Casinos and 🏨 Hotels earn <b>×2</b>, and <b>+0.5 more for every 2 you own</b> (2 owned ×2.5, 4 owned ×3 … 10 owned ×4.5).",
    "🏠 Real estate now pays <b>0.8% rent every 60 seconds</b> (was 1.2% every 45 seconds), about +48% an hour.",
    "📈 Stock market ETF: the small up move is now +1.2% (was +1.5%), about <b>+25% an hour</b> on average. It still swings a lot in the short term, so good timing can beat that.",
    "🚚 Global Freight Co. shares rise about <b>+35% an hour</b> on average: ups and downs are now the same size (±1% per contract) with a small steady drift.",
    "💼 Broker ETF now grows up to <b>10 gcoin</b> at most. New <b>🔁 Auto cash-out</b>: at the cap it cashes out for you and invests 10,000,000 again.",
    "🔬 Science opens earlier: it now needs <b>Logistics 30, Investor 30 and Gambler 20</b> (was 50 / 50 / 25).",
  ] },
  { date: "26 November 2026", title: "Empire of Coins", items: [
    "🎰 The casino now matches the other pages: one slim bar (level, money, Hot Tables, cashback, all-time earnings and free chips) replaces the four big cards in the lobby and the Online casino. Tap the free chips to open their refill timers.",
    "🗂️ Achievements: on big screens the categories are now a list in the left menu with a progress ring each; on phones they are one row you can swipe.",
    "🎁 Rewards are easier to use: the page shows what you're wearing now, your unlocked collections come first with <b>👕 Wear</b> buttons, and locked collections are short rows sorted by how close you are (tap one to preview its items).",
    "🏆 Achievements are easier to browse: smaller cards (3 per row), finished categories fold into one line, and a new <b>⭐ Almost there</b> box shows the achievements you are closest to.",
    "🗺️ The world map is smaller by default (⤢ Full map makes it full width again), its help text moved into an ℹ️ button, and on phones it starts folded.",
    "🌍 Earth logistics is tidier: one slim bar shows your level, money, vehicles on the road and contracts, and Trucks · Tankers · Planes tabs show one fleet at a time (with a <b>!</b> when vehicles wait or break down). The world map follows the tab you pick.",
    "🚚 Logistics is faster to run: every vehicle is one compact row, idle ones show their ⭐ best offer (most money per second) with a <b>Send</b> button, and <b>⭐ Send all</b> puts every waiting vehicle on its best contract at once. \"Other offers\" still opens all 4.",
    "🔁 Investing: each investment now has one <b>Buy | Sell</b> switch with a single amount row. In Sell mode the % buttons fill a share of what you hold, and a line tells you what you put in or get back.",
    "🪙 Live trading is easier: one coin at a time with tabs (price, 24h change and how many positions you have), a big Open button with its preview right under it, and all your open positions and limit orders together in one list at the top.",
    "📈 Investing is tidier: one slim bar shows your level, money and holdings, and the Investing page starts with a portfolio list (worth, profit and a mini chart for each investment). Pick one to open its chart and buy/sell controls.",
    "💡 Income tips: a gold <b>!</b> on Income and Businesses when a business has free worker slots, a <b>⭐ Best value</b> tag on the business with the most income per coin, a <b>Max</b> button to buy several at once, and Buy buttons now say how much money is missing.",
    "🏢 Businesses are easier to manage: the shop is wider on big screens, each business is one compact row (2 per line) with its workers bar, and a gold banner takes you straight to businesses that still have free worker slots. Tap <b>👷 Hire</b> or <b>Details</b> to open one.",
    "🎰 Shorter tables: empty Blackjack and Hold'em tables take less room between rounds, and the Video Poker and Hold'em payout tables start folded after your first 3 rounds (📋 Show opens them again).",
    "🎰 New casino lobby: one card per game with a quick table switch (Classic, High rollers, Super high rollers), a <b>▶ Continue playing</b> row with the 🔥 hot game and your last tables, and a table switch in the bar while you play.",
    "🎰 Casino tables are easier to play: while a game is open, one slim bar shows your level, money, Hot Tables timer and free chips, so the table starts higher. Every chip table (Roulette, Blackjack, Baccarat, Hold'em) now has the same buttons in the same order, with <b>↶ Undo</b> everywhere; on phones they stay at the bottom of the screen.",
    "🔁 Stardust Drift: new <b>Keep harvesting</b> switch. Harvesters fly out again on their own (also while the game is closed), with an escort when a frigate is free, always, or never.",
    "🌌 Space is easier to use: the system panel now sits beside the star map (a slide-up sheet on phones), race panels are shorter, and a gold <b>!</b> on the Space tabs shows when a harvester is back, a contract can be delivered, crafting is done or you can afford research.",
    "🔁 Market: you can now <b>trade goods</b> with 😊 Friendly races. Give 2 of any alien good, get 1 of theirs (🏺 Ancient Relics can't be traded).",
    "🛸 New spaceships! ✨ <b>Stardust Harvesters</b> farm stardust and 🛡️ <b>Escort Frigates</b> protect your ships from pirates. Research them in 🌌 Space → Research. Your old ships are now called 🚀 <b>courier ships</b>.",
    "🌫️ A new area on the star map: the <b>Stardust Drift</b>. Explore it, then send harvesters to farm stardust for an hour, but watch out for pirates!",
    "🔬 New in 🌌 Space: <b>Research</b>! 5 research lines (crafting, extra ships, cargo holds, engines and outposts), each with 3 levels.",
    "🛠️ Space <b>crafting</b>: mix alien goods into 4 new resources (🔷 Resonance Prisms, 🔩 Voidsteel Ingots, ⛵ Star Sails and 💾 Chrono Chips), in batches of 25 to 100. You need them for the top research levels.",
    "🏗️ <b>Outposts</b>: build a base in a friendly system and it makes that race's goods on its own, no ship needed.",
    "🎡 Roulette: new <b>↶ Undo last bet</b> button. It takes back your last chip (or your last ↺ Repeat last bets), and you can press it again and again.",
    "🌌 Space politics: races now have ⚔️ <b>rivals</b> (helping one makes its rival a little jealous), 💖 old allies slowly cool off unless you send a gift or keep a trade route running (never below 😊 Friendly), and selling lots of one good 📉 lowers its price for a few hours.",
    "📜 New in 🌌 Space: the <b>Contracts board</b>. Races post timed jobs: bring them goods from other worlds before the deadline for money and friendship.",
    "💎 New coin: <b>pcoin</b> (platinum). 1 pcoin = 1,000,000 gcoin; money switches to pcoin from 1,000,000 gcoin. The money boxes can be set to pcoin too.",
  ] },
  { date: "25 November 2026", title: "Empire of Coins", items: [
    "🎰 No more casino chips: you now bet straight from your money, and wins go straight back to it. Any chips you had were turned back into money.",
    "👤 6 new starter avatars for your profile: everyone can pick them, even without unlocked rewards.",
    "⚔️ <b>2 new online casino games!</b> 💰 <b>Bluff Chest</b>: hide the coin in one of 3 chests or find your friend's (first to 3). 🏁 <b>Race to 21</b>: roll as often as you dare, but a 1 loses the turn's points. 6 new achievements.",
    "⚔️ Online casino: duels now have a 2% fee. The winner takes both bets minus 2% (a win pays +96% of the bet, a loss costs the bet).",
  ] },
  { date: "24 November 2026", title: "Empire of Coins", items: [
    "🪙 Every box where you type an amount of money now has a coin switch (bcoin, scoin or gcoin), so you don't have to count zeros. Your choice is remembered.",
    "⚔️ <b>Online casino!</b> In 🎰 Casino → ⚔️ Online casino, challenge a friend who is online to ✊ Rock Paper Scissors or 🎲 Dice Battle and choose your bet. Best of 3: the winner takes the other player's bet. 6 new achievements.",
    "👥 <b>Friends!</b> In 👤 Profile → 👥 Friends, find players by nickname or by their friend code, send requests, and see who is 🟢 online. Click a friend to see their avatar, achievements, prestige and pets.",
    "👤 <b>Player profiles!</b> Click the round 👤 button next to ⚙️ Settings, sign in with Google and choose a nickname and an avatar (the emblem of one of your 🎁 reward collections). Other players will see your nickname, avatar, achievements and prestige count.",
    "🐾 <b>New pet: Pip the painter!</b> Become 😊 Friendly with the Lumerians in 🌌 Space Logistics and adopt him for 10 paintings. He lives at the top of the 🎮 Mini-games page and paints a 🟡 Normal painting (85–95% match) every 15 minutes for your collection, even while the game is closed. Rename him on the 🐾 Pet page.",
    "🏆 4 new 🖼️ Art Gallery achievements for Pip: 🐾 A painter in the family, 🖌️ Little artist, 🎨 Prolific painter and 💜 Muse.",
    "🏪 Alien market: once you are 💖 Allies with a race, you can also buy its goods there (handy for gifts to other races). Buying always costs more than selling.",
    "🎨 <b>Art Gallery update!</b> New tiers: 🟢 Easy (kid-style drawings), 🟡 Normal (detailed scenes) and the new 🏛️ <b>Masterpiece</b> tier: copy 10 famous paintings like The Starry Night, The Great Wave, Mona Lisa and The Scream (opens after 10 Normal paintings). The old 3-shape tier is retired.",
    "🖌️ New drawing tools: ➖ Line, 💧 Eyedropper and 🪞 Mirror mode. After you submit, a 🔥 heatmap shows where your copy differs from the original.",
    "🎨 8 new colours in the Art studio palette (24 in all): slate, tan, maroon, salmon, ochre, olive, turquoise and lavender. Every painting now uses them.",
    "📜 <b>Daily commission</b>: every day a collector asks for one specific painting and pays ×3. You have 24 hours to deliver it.",
    "🏆 Art Gallery achievements now follow the new tiers (Easy, Normal and Masterpiece). Achievements you already have stay unlocked.",
    "🐾 The 🛍️ Shop is now the <b>🐾 Pet</b> page: see your pet, rename it, hide it, and check its stats. More pets are coming!",
    "🎁 All cosmetic collections are now rewards in 🏆 Achievements → 🎁 Rewards: 🐕 Wow So Rich (💰 Multi-millionaire), ♟️ One Step Ahead (🤑 Beat the house), 👑 Royal (🏦 Friends in high places), 🐸 Make It Rain (💸 Money fountain, 🎩 Lobbyist and 🧙 Feeling magical) and 🦁 Emperor (🏰 Coin emperor). Items you already bought stay yours.",
    "🌌 New in 🚢 Logistics: <b>Space</b>! Logistics now has two pages, 🌍 Earth (everything you know) and 🌌 Space. Build the 🚀 Space Mission Center to get your first spaceship and open the star map.",
    "👽 Send ships to explore unknown systems and meet 6 alien races. Each one has its own tastes: send them the gifts they ask for (money, ore, paintings, stardust and more) to grow your friendship from Contacted to Allies.",
    "📦 Your ships come back with alien goods. Ships keep flying while the game is closed, and a prestige never resets your alien friends.",
    "🏆 New <b>🪐 Space</b> achievements section: 5 achievements.",
    "🚚 Gift trips to alien races give Logistics XP (6 XP per minute of the trip). Exploring gives none.",
    "🆘 Space: alien races sometimes have an emergency while you play. Send 20 🔬 scientists within 15 minutes for extra friendship, or they lose friendship with you. Exploring now takes 10 scientists.",
    "🛣️ Space: <b>trade routes</b>! Once you are 😊 Friendly with a race, give it a ship that flies back and forth for good and brings their goods home every trip (more and faster at Trusted and Allies).",
    "🏪 New <b>Market</b> page under 🌌 Space: sell your alien goods. Prices move every 30 minutes, and goods from far-away races are worth more.",
    "🏆 2 new 🪐 Space achievements: 🛣️ Open for business and 🏪 Galactic merchant.",
    "🔮 Space: 3 new alien races far out on the star map: the Mystics, the Machines and the Ancients. They only want goods from other races, so build your trading network to reach them.",
    "🏅 <b>Alliance bonuses</b>: become 💛 Trusted and 💖 Allies with a race for a permanent bonus (more income, ore value, stardust, faster trade routes, an extra spaceship and more).",
    "☄️ Space events: special requests with a deadline, asteroid fields, lost alien ships to rescue, and pirates who want a toll.",
    "🏆 2 new 🪐 Space achievements: 🌌 Galactic network and 👑 Friends forever.",
  ] },
  { date: "23 November 2026", title: "Empire of Coins", items: [
    "🗺️ New Nebula Strike level 5: <b>Pirates' Lost Treasure</b>! Opens after you beat level 4. There's no boss: survive for 5 minutes as the pirates' graveyard gets busier and busier. Watch out for 🦈 sea sharks, powder monkeys with big cannonballs and skull asteroids, and fly around the cursed rocks and broken masts: they can't be destroyed. Survive to win a pirate loot box.",
    "🏆 New Nebula Strike achievement: 🗺️ Survivor of the graveyard.",
  ] },
  { date: "22 November 2026", title: "Empire of Coins", items: [
    "☕ You can now support Empire of Coins on Ko-fi: press <b>Donate</b> on the main menu or ⚙️ Settings → Support the game. Donations are completely voluntary and don't give anything in the game, so every player stays on equal terms. Thank you!",
    "🐞 <b>Report a bug</b> is now open in ⚙️ Settings: describe the problem and send it by email (or copy the report) to contact@empireofcoins.com.",
    "💀 Nebula Strike: before his last phase, a damaged Admiral Dreadmaw now sails off screen and sends walls of bullets from the right, the top and the bottom. Use the whole screen and slip through the gaps before he returns!",
  ] },
  { date: "21 November 2026", title: "Empire of Coins", items: [
    "🚀 New mini-game: <b>Nebula Strike</b>! A side-scrolling space shooter that opens when you build the 🚀 Space Mission Center. Fight through 3 levels of enemy waves and beat the <b>Scrap Crab</b>, the <b>Hive Queen</b> and <b>The Taxman</b>. Time your 🛡️ shield, grab special weapons from supply ships and collect ✨ stardust to buy 4 ships and their upgrades.",
    "🏆 New <b>🚀 Nebula Strike</b> achievements section: 10 achievements.",
    "🏴‍☠️ Nebula Strike: after beating Admiral Dreadmaw, you can buy a <b>pirate chest</b> in the hangar for ✨ 10,000 stardust. Same prizes and odds as the level 4 loot box, pet included.",
    "🏴‍☠️ Nebula Strike level 4 is much busier: waves come faster, a new one arrives as soon as the screen empties, and space mines and asteroids keep drifting in the whole way to the bosses.",
    "🚀 Nebula Strike: The Taxman and Admiral Dreadmaw are a bit smaller, so you can fly further forward during their fights.",
    "🎰 Nebula Strike: opening the pirate loot box is now a spin! A reel of rarity cards races past and slowly stops on your prize. Can't wait? Press ⏩ Skip.",
    "🏴‍☠️ Nebula Strike level 4: two new pirate enemies! <b>Cannon Skiffs</b> come in pairs and lob arcing cannonballs from above and below, and <b>Grapple Raiders</b> throw a hook on a chain: if it catches you, you lose a life and get pulled in and slowed. Block it with your 🛡️ shield or shoot the hook to break it.",
    "🐾 <b>The pet is here!</b> Find it in the pirate loot box (5%) and it moves into your 💰 Income page: it drinks the ⚡ energy drink for you, taps the coin 10 times per second while it lasts, sleeps during the cooldown and loves being petted. Rename or hide it in ⚙️ Settings. 2 new achievements: 💖 Best friends and 🐾 Paw power.",
    "🏴‍☠️ Nebula Strike: new <b>level 4: Pirate's Cove</b> (very hard, opens after level 3). Two bosses: <b>Captain Cutlass</b> after 2 minutes, then 2 more minutes of waves and the final boss <b>Admiral Dreadmaw</b> in his treasure cave. Every clear opens a <b>pirate loot box</b>: 40–180 minutes of income by rarity (Common, Rare, Epic, Legendary), or a rare pet!",
    "🏆 3 new Nebula Strike achievements: 🏴‍☠️ Pirate's bane, 💰 Treasure hunter and 🐾 A new friend.",
    "🤖 Nebula Strike: two new enemies! <b>Junk Bots</b> (from level 1) charge straight at you when they line up with your ship, and <b>Laser Sentinels</b> (from level 2) park on the right and fire a beam across the screen after a red warning line. Dodge it or block it with your 🛡️ shield.",
    "👾 Nebula Strike: new hand-painted enemies: saucer drones (with their pilots), darters, gun pods, space mines, wasp hunters, swarm bugs, armoured gunships, supply ships and The Taxman's missiles.",
    "🦀 Nebula Strike: the Scrap Crab has a new look: it now flies on three rocket jets.",
    "🌌 Nebula Strike: new hand-painted backgrounds for all 3 levels, and each boss now has its own arena (the Scrap Crab's junkyard, the Hive Queen's nest and The Taxman's vault) that fades in when the boss arrives.",
    "🪨 Nebula Strike: new hand-painted asteroids in three sizes (bigger ones are tougher and worth more points) and a new look for the spinning blade enemies.",
    "⭐ Nebula Strike: every destroyed enemy and boss now gives ⭐ points. Your best score for each level is shown next to its best time.",
    "⛏️ Nebula Strike: the top upgrade levels now also need 💎 diamonds or 🔴 rubies from the Gold Mine Dig vault.",
    "⌨️ Nebula Strike: you can change the keys for the 🛡️ shield and 🚀 special weapon in the hangar.",
    "🚀 Nebula Strike: the pause screen now shows the controls, and the 💠 nova spread is stronger (a tighter fan of bullets that go through enemies).",
  ] },
  { date: "18 November 2026", title: "Empire of Coins", items: [
    "🌐 More of the game in <b>Español</b>: the rules in Investing, Logistics and Live trading, every casino game (buttons, rules, pay tables and results), the Gold Mine Dig and Art Gallery mini-games, all achievement names and descriptions, and the Shop and reward items.",
    "☁️ Fix: after signing out, a guest game no longer replaces your account's cloud save when you sign in again (you choose which progress to keep), and signing in always lets you pick a Google account.",
    "🚚 <b>Global Freight Co. shares</b>: up moves are now bigger than down moves, so the price rises over time (faster the more you deliver).",
    "👤 You can keep playing as a <b>guest</b> without signing in. The game reminds you that guest progress is only saved in this browser.",
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
  try { localStorage.setItem(NOTES_SEEN, PATCH_NOTES[0].date); } catch (e) {}
  menuInfo();
}

$("mainMenu").addEventListener("click", (e) => {
  const b = e.target.closest("[data-menu]"); if (!b) return;
  const what = b.dataset.menu;
  if (what === "play") closeMenu();
  if (what === "settings") showSettings(true);
  if (what === "about") showAbout();
  if (what === "donate") showDonate();
});

// 🌌 One-time pop-up after the 1st prestige: hidden unlocks that were never mentioned anywhere before
const SECRETS = [
  { id: "uni2", html: () => `<b>🎓 2nd University</b><div class="muted">A second University for ${fmt(UNI_PRICE)}. It trains its own scientists for the same shared pool.</div>` },
  { id: "astro", html: () => `<b>🔭 Astronomy Research Center</b><div class="muted">${fmt(ASTRO_PRICE)} + 👩‍🔬 ${ASTRO_SCI} scientists: space missions launch ${ASTRO_TIME_CUT / 60} minutes sooner.</div>` },
  { id: "uni3", tier: 2, html: () => `<b>🎓 3rd University</b><div class="muted">A third University for ${fmt(UNI_PRICE)}: up to ${UNI_MAX * 3} scientists in your shared pool.</div>` },
  { id: "uni4", tier: 4, html: () => `<b>🎓 4th University</b><div class="muted">Your reward for all 4 prestiges: a fourth University for ${fmt(UNI_PRICE)}, up to ${UNI_MAX * 4} scientists in your shared pool.</div>` },
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
    <p class="muted">Find them in 💰 Income → 🔬 Science. ${list.every(x => x.tier === 4) ? "" : list.some(x => x.tier === 2) ? "New hidden achievements have appeared in 🏆 Achievements → 🌌 Secrets." : "A new 🌌 Secrets section has appeared in 🏆 Achievements."}</p>
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
