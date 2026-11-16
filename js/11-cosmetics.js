/* =====================================================================
   SHOP: cosmetic items (Wow So Rich Collection)
   ===================================================================== */
// slot: items in the same slot replace each other (only one background at a time)
const COLLECTIONS = [
  { id: "wow",   name: "🐕 Wow So Rich Collection" },
  { id: "ahead", name: "♟️ One Step Ahead Collection" },
  { id: "royal", name: "👑 Royal Collection" },
  { id: "rain",  name: "🐸 Make It Rain Collection" },
  { id: "emperor", name: "🦁 Emperor Collection" },
  // 🎁 reward collections: not sold in the Shop, unlocked in Achievements → Rewards
  { id: "artist", name: "🎨 Artist Collection", reward: { cat: "art", text: "Unlock every 🖼️ Art Gallery achievement" } },
  { id: "bull", name: "🐂 Bull Run Collection", reward: { cat: "invest", text: "Unlock every 📈 Investments achievement" } },
  // a reward can also need a hand-picked list of achievements (ids)
  { id: "shark", name: "🦈 The Shark at the Table Collection", reward: { ids: ["glevel50", "quads4", "play-uth-1000", "play-vp-1000"],
    text: "Unlock 👑 Whale, 🀄 Four of a kind ×4, 🤠 Ultimate Texas Hold'em veteran and 🎴 Video Poker veteran" } },
  { id: "space", name: "🚀 The Space Race Collection", reward: { ids: ["satellite", "sciSpace", "spaceOk", "spaceFail"],
    text: "Unlock 🛰️ Eye in the sky, 🚀 Space race, 🌕 Lift-off! and 💥 Houston, we have a problem" } },
  { id: "global", name: "🌍 The Global Network Collection", reward: { cat: "logistics", text: "Unlock every 🚢 Logistics achievement" } },
  { id: "jackpot", name: "🎰 The Jackpot Collection", reward: { cat: "casino", text: "Unlock every 🎰 Casino achievement" } },
  { id: "goldrush", name: "⛏️ The Gold Rush Collection", reward: { ids: ["mine1", "mine4", "mineRun50", "mineGold"], text: "Unlock ⛏️ Gold digger, ⛏️ Mining magnate, 🪨 Regular miner and 🟡 Golden touch" } },
  { id: "gambler99", name: "🦊 Master Gambler Coin", reward: { ids: ["glevel99"], text: "Unlock 💎 Casino legend (Gambler level 99)" } },
  { id: "investor99", name: "🦉 Master Investor Coin", reward: { ids: ["ilevel99"], text: "Unlock 🏛️ Market maker (Investor level 99)" } },
  { id: "logistics99", name: "🦅 Master Logistics Coin", reward: { ids: ["llevel99"], text: "Unlock 🏆 Logistics legend (Logistics level 99)" } },
  { id: "strongman", name: "🦛 The Strongman Collection", reward: { ids: ["boost-energy-100", "click100k"], text: "Unlock ⚡ Wired for life and 🦾 Iron finger" } },
];
// 🛡️ painted collection emblems (assets/col/<id>.webp): the title shows the emblem instead of the leading emoji
const COL_EMBLEMS = new Set(["wow", "ahead", "royal", "rain", "emperor", "artist", "bull", "shark",
  "space", "global", "jackpot", "goldrush", "gambler99", "investor99", "logistics99", "strongman"]);
const colTitle = (col) => COL_EMBLEMS.has(col.id)
  ? `<img class="colEmblem" src="assets/col/${col.id}.webp" alt="">${col.name.replace(/^\S+\s/, "")}` : col.name;
const COSMETICS = [
  { id: "wowBg",   collection: "wow", slot: "background", name: "Wow So Rich Background", price: 5000000, desc: "A very rich Shiba Inu tycoon counts his cash in a glittering office, behind the whole game.",
    preview: `<div class="preview" style="background-image:url('assets/wow-background-thumb.jpg')"></div>` },
  { id: "wowCoin", collection: "wow", slot: "coin", name: "Wow So Rich Coin", price: 5000000, desc: "Replaces the golden coin you click with the Wow So Rich coin.",
    preview: `<div class="preview"><img src="assets/wow-coin.webp" alt="Wow So Rich coin"></div>` },
  { id: "wowCards", collection: "wow", slot: "cards", name: "Wow So Rich Cards", price: 5000000, desc: "A full deck with the Shiba tycoon on the Jacks, Queens, Kings and Joker, for every card game.",
    preview: `<div class="preview cardsPreview"><img src="assets/cards-wow/Jc.webp" alt=""><img src="assets/cards-wow/Qh.webp" alt=""><img src="assets/cards-wow/Ks.webp" alt="Wow So Rich cards"></div>` },
  { id: "aheadBg", collection: "ahead", slot: "background", name: "One Step Ahead Background", price: 25000000, desc: "A gentleman chimpanzee moves his golden knight in a grand chess library, always one step ahead, behind the whole game.",
    preview: `<div class="preview" style="background-image:url('assets/ahead-background-thumb.jpg')"></div>` },
  { id: "aheadCoin", collection: "ahead", slot: "coin", name: "One Step Ahead Coin", price: 25000000, desc: "Replaces the coin you click with the gentleman chimpanzee's gold medallion.",
    preview: `<div class="preview"><img src="assets/ahead-coin.webp" alt="One Step Ahead coin"></div>` },
  { id: "aheadCards", collection: "ahead", slot: "cards", name: "One Step Ahead Cards", price: 25000000, desc: "A full deck with the gentleman chimpanzee on the Jacks, Queens, Kings and Joker, for every card game.",
    preview: `<div class="preview cardsPreview"><img src="assets/cards-ahead/Jc.webp" alt=""><img src="assets/cards-ahead/Qh.webp" alt=""><img src="assets/cards-ahead/Ks.webp" alt="One Step Ahead cards"></div>` },
  { id: "royalBg", collection: "royal", slot: "background", name: "Royal Background", price: 100000000, desc: "His Majesty the Cat, glowing over the whole game.",
    preview: `<div class="preview" style="background-image:url('assets/royal-background-thumb.jpg')"></div>` },
  { id: "royalCoin", collection: "royal", slot: "coin", name: "Royal Coin", price: 100000000, desc: "Replaces the coin you click with His Majesty's golden coin.",
    preview: `<div class="preview"><img src="assets/royal-coin.webp" alt="Royal coin"></div>` },
  { id: "royalCards", collection: "royal", slot: "cards", name: "Royal Cards", price: 100000000, desc: "A full deck with His Majesty the Cat on the Jacks, Queens, Kings and Joker, for every card game.",
    preview: `<div class="preview cardsPreview"><img src="assets/cards-royal/Jc.webp" alt=""><img src="assets/cards-royal/Qh.webp" alt=""><img src="assets/cards-royal/Ks.webp" alt="Royal cards"></div>` },
  { id: "rainBg", collection: "rain", slot: "background", name: "Make It Rain Background", price: 500000000, desc: "The frog wizard casts his golden coin spell behind the whole game.",
    preview: `<div class="preview" style="background-image:url('assets/rain-background-thumb.jpg')"></div>` },
  { id: "rainCoin", collection: "rain", slot: "coin", name: "Make It Rain Coin", price: 500000000, desc: "Replaces the coin you click with the frog wizard's golden coin.",
    preview: `<div class="preview"><img src="assets/rain-coin.webp" alt="Make It Rain coin"></div>` },
  { id: "rainCards", collection: "rain", slot: "cards", name: "Make It Rain Cards", price: 500000000, desc: "A full deck with the frog wizard on the Jacks, Queens, Kings and Joker, for every card game.",
    preview: `<div class="preview cardsPreview"><img src="assets/cards-rain/Jc.webp" alt=""><img src="assets/cards-rain/Qh.webp" alt=""><img src="assets/cards-rain/Ks.webp" alt="Make It Rain cards"></div>` },
  { id: "emperorBg", collection: "emperor", slot: "background", name: "Emperor Background", price: 1e12, desc: "The Lion Emperor on his golden throne, looking over his whole empire: city, casino, harbor, gold mines and a rocket launch, behind the whole game.",
    preview: `<div class="preview" style="background-image:url('assets/emperor-background-thumb.jpg')"></div>` },
  { id: "emperorCoin", collection: "emperor", slot: "coin", name: "Emperor Coin", price: 1e12, desc: "Replaces the coin you click with the Lion Emperor's ruby-set gold medallion.",
    preview: `<div class="preview"><img src="assets/emperor-coin.webp" alt="Emperor coin"></div>` },
  { id: "emperorCards", collection: "emperor", slot: "cards", name: "Emperor Cards", price: 1e12, desc: "A full deck with the Lion Emperor as King, the Lioness Empress as Queen, the Lion Prince as Jack and the monkey jester as Joker, for every card game.",
    preview: `<div class="preview cardsPreview"><img src="assets/cards-emperor/Jc.webp" alt=""><img src="assets/cards-emperor/Qh.webp" alt=""><img src="assets/cards-emperor/Ks.webp" alt="Emperor cards"></div>` },
  { id: "artistBg", collection: "artist", slot: "background", name: "Artist Background", price: 0, desc: "The painter cat at work under a sky full of stars, behind the whole game.",
    preview: `<div class="preview" style="background-image:url('assets/artist-background-thumb.jpg')"></div>` },
  { id: "artistCoin", collection: "artist", slot: "coin", name: "Artist Coin", price: 0, desc: "Replaces the coin you click with the painter cat's golden medallion.",
    preview: `<div class="preview"><img src="assets/artist-coin.webp" alt="Artist coin"></div>` },
  { id: "bullBg", collection: "bull", slot: "background", name: "Bull Run Background", price: 0, desc: "A penguin investor watches the bull charge up the market, behind the whole game.",
    preview: `<div class="preview" style="background-image:url('assets/bull-background-thumb.jpg')"></div>` },
  { id: "bullCoin", collection: "bull", slot: "coin", name: "Bull Run Coin", price: 0, desc: "Replaces the coin you click with the penguin investor's Bull Run coin.",
    preview: `<div class="preview"><img src="assets/bull-coin.webp" alt="Bull Run coin"></div>` },
  { id: "sharkBg", collection: "shark", slot: "background", name: "Shark at the Table Background", price: 0, desc: "The tuxedo shark rakes in the pot under a deep-sea glass dome while his rivals sweat, behind the whole game.",
    preview: `<div class="preview" style="background-image:url('assets/shark-background-thumb.jpg')"></div>` },
  { id: "sharkCoin", collection: "shark", slot: "coin", name: "Shark at the Table Coin", price: 0, desc: "Replaces the coin you click with the shark's black-pearl medallion and his four aces.",
    preview: `<div class="preview"><img src="assets/shark-coin.webp" alt="Shark at the Table coin"></div>` },
  { id: "spaceBg", collection: "space", slot: "background", name: "Space Race Background", price: 0, desc: "A rocket blasts past the satellites toward the Moon, behind the whole game.",
    preview: `<div class="preview" style="background-image:url('assets/space-background-thumb.jpg')"></div>` },
  { id: "spaceCoin", collection: "space", slot: "coin", name: "Space Race Coin", price: 0, desc: "Replaces the coin you click with the golden rocket launch medallion.",
    preview: `<div class="preview"><img src="assets/space-coin.webp" alt="Space Race coin"></div>` },
  { id: "globalBg", collection: "global", slot: "background", name: "Global Network Background", price: 0, desc: "The walrus shipping tycoon runs the world's freight from his harbor control tower, behind the whole game.",
    preview: `<div class="preview" style="background-image:url('assets/global-background-thumb.jpg')"></div>` },
  { id: "globalCoin", collection: "global", slot: "coin", name: "Global Network Coin", price: 0, desc: "Replaces the coin you click with the walrus captain's golden shipping medallion.",
    preview: `<div class="preview"><img src="assets/global-coin.webp" alt="Global Network coin"></div>` },
  { id: "jackpotBg", collection: "jackpot", slot: "background", name: "Jackpot Background", price: 0, desc: "The lucky fox rolls double six on a glittering Las Vegas casino floor, behind the whole game.",
    preview: `<div class="preview" style="background-image:url('assets/jackpot-background-thumb.jpg')"></div>` },
  { id: "jackpotCoin", collection: "jackpot", slot: "coin", name: "Jackpot Coin", price: 0, desc: "Replaces the coin you click with the winking fox's golden casino medallion.",
    preview: `<div class="preview"><img src="assets/jackpot-coin.webp" alt="Jackpot coin"></div>` },
  { id: "goldrushBg", collection: "goldrush", slot: "background", name: "Gold Rush Background", price: 0, desc: "A happy mole miner strikes gold by lantern light deep in an old mine, behind the whole game.",
    preview: `<div class="preview" style="background-image:url('assets/goldrush-background-thumb.jpg')"></div>` },
  { id: "goldrushCoin", collection: "goldrush", slot: "coin", name: "Gold Rush Coin", price: 0, desc: "Replaces the coin you click with the mole miner's golden medallion.",
    preview: `<div class="preview"><img src="assets/goldrush-coin.webp" alt="Gold Rush coin"></div>` },
  { id: "gambler99Coin", collection: "gambler99", slot: "coin", name: "Master Gambler Coin", price: 0, desc: "An obsidian and platinum casino chip with the gentleman fox and his winning hand. Only for Gambler level 99.",
    preview: `<div class="preview"><img src="assets/gambler99-coin.webp" alt="Master Gambler coin"></div>` },
  { id: "investor99Coin", collection: "investor99", slot: "coin", name: "Master Investor Coin", price: 0, desc: "A glowing emerald crystal coin with the wise rose-gold owl and his rising chart. Only for Investor level 99.",
    preview: `<div class="preview"><img src="assets/investor99-coin.webp" alt="Master Investor coin"></div>` },
  { id: "logistics99Coin", collection: "logistics99", slot: "coin", name: "Master Logistics Coin", price: 0, desc: "A sapphire and silver badge with the captain sea eagle over a compass rose. Only for Logistics level 99.",
    preview: `<div class="preview"><img src="assets/logistics99-coin.webp" alt="Master Logistics coin"></div>` },
  { id: "strongmanBg", collection: "strongman", slot: "background", name: "Strongman Background", price: 0, desc: "A hippo strongman loads the last Atlas stone onto its pillar while the crowd roars, behind the whole game.",
    preview: `<div class="preview" style="background-image:url('assets/strongman-background-thumb.jpg')"></div>` },
  { id: "strongmanCoin", collection: "strongman", slot: "coin", name: "Strongman Coin", price: 0, desc: "Replaces the coin you click with the hippo strongman's hammered iron medallion.",
    preview: `<div class="preview"><img src="assets/strongman-coin.webp" alt="Strongman coin"></div>` },
];
if (!state.cosmetics) state.cosmetics = { owned: {}, on: {} };

// Turn an item on and turn off other items in the same slot
function turnOn(id) {
  const item = COSMETICS.find(c => c.id === id);
  COSMETICS.forEach(c => { if (c.slot === item.slot) state.cosmetics.on[c.id] = false; });
  state.cosmetics.on[id] = true;
}

function applyCosmetics() {
  document.body.classList.toggle("wowBg", !!state.cosmetics.on.wowBg);
  document.body.classList.toggle("royalBg", !!state.cosmetics.on.royalBg);
  document.body.classList.toggle("emperorBg", !!state.cosmetics.on.emperorBg);
  $("coin").classList.toggle("emperorCoin", !!state.cosmetics.on.emperorCoin);
  document.body.classList.toggle("rainBg", !!state.cosmetics.on.rainBg);
  if (typeof applyDeck === "function") {   // 🃏 card deck: redraw an open card table with the new cards
    applyDeck();
    if (state.view === "casino" && typeof currentGame === "string" && currentGame && typeof renderCasino === "function") renderCasino();
  }
  document.body.classList.toggle("aheadBg", !!state.cosmetics.on.aheadBg);
  document.body.classList.toggle("artistBg", !!state.cosmetics.on.artistBg);
  document.body.classList.toggle("bullBg", !!state.cosmetics.on.bullBg);
  document.body.classList.toggle("sharkBg", !!state.cosmetics.on.sharkBg);
  document.body.classList.toggle("spaceBg", !!state.cosmetics.on.spaceBg);
  document.body.classList.toggle("globalBg", !!state.cosmetics.on.globalBg);
  document.body.classList.toggle("jackpotBg", !!state.cosmetics.on.jackpotBg);
  document.body.classList.toggle("goldrushBg", !!state.cosmetics.on.goldrushBg);
  $("coin").classList.toggle("goldrushCoin", !!state.cosmetics.on.goldrushCoin);
  document.body.classList.toggle("strongmanBg", !!state.cosmetics.on.strongmanBg);
  ["gambler99", "investor99", "logistics99"].forEach(n => $("coin").classList.toggle(n + "Coin", !!state.cosmetics.on[n + "Coin"]));
  $("coin").classList.toggle("strongmanCoin", !!state.cosmetics.on.strongmanCoin);
  $("coin").classList.toggle("jackpotCoin", !!state.cosmetics.on.jackpotCoin);
  $("coin").classList.toggle("globalCoin", !!state.cosmetics.on.globalCoin);
  $("coin").classList.toggle("spaceCoin", !!state.cosmetics.on.spaceCoin);
  $("coin").classList.toggle("sharkCoin", !!state.cosmetics.on.sharkCoin);
  $("coin").classList.toggle("bullCoin", !!state.cosmetics.on.bullCoin);
  $("coin").classList.toggle("artistCoin", !!state.cosmetics.on.artistCoin);
  $("coin").classList.toggle("wowCoin", !!state.cosmetics.on.wowCoin);
  $("coin").classList.toggle("royalCoin", !!state.cosmetics.on.royalCoin);
  $("coin").classList.toggle("rainCoin", !!state.cosmetics.on.rainCoin);
  $("coin").classList.toggle("aheadCoin", !!state.cosmetics.on.aheadCoin);
  if (typeof syncBgLayer === "function") syncBgLayer();   // 📱 phone mode: background picture on its own layer
}

function cosmeticCard(c) {
    const owned = !!state.cosmetics.owned[c.id], on = !!state.cosmetics.on[c.id];
    const action = owned
      ? `<span class="muted">${on ? "On" : "Off"}</span>
         <button class="switch ${on ? "on" : ""}" data-cosmetic-toggle="${c.id}" aria-label="Turn ${c.name} ${on ? "off" : "on"}"></button>`
      : c.price === 0 ? `<span class="muted">🔒 Reward</span>`
      : `<span><b>${coins(c.price)}</b></span>
         <button class="btn" data-cosmetic-buy="${c.id}" data-cost="${c.price}" ${state.money < c.price ? "disabled" : ""}>Buy</button>`;
    return `<div class="cosmetic ${on ? "on" : ""}">${c.preview}
      <div class="info"><b>${c.name}</b><div class="muted">${c.desc}</div>
        <div class="row">${action}</div></div></div>`;
}
function renderCosmetics() {
  const card = cosmeticCard;
  $("cosmetics").innerHTML = COLLECTIONS.filter(col => !col.reward).map(col => `
    <div class="card">
      <h2 style="margin:0">${colTitle(col)}</h2>
      <div class="cosmetics">${COSMETICS.filter(c => c.collection === col.id).map(card).join("")}</div>
    </div>`).join("");
}

$("cosmetics").addEventListener("click", (e) => {
  if (isPaused()) return;
  const buy = e.target.closest("[data-cosmetic-buy]");
  if (buy) {
    const c = COSMETICS.find(x => x.id === buy.dataset.cosmeticBuy);
    if (!c || state.cosmetics.owned[c.id] || state.money < c.price) return;
    state.money -= c.price;
    state.cosmetics.owned[c.id] = true;
    turnOn(c.id);                             // switch it on right away
    showNotice("🛍️ Bought " + c.name + "!");
  }
  const tog = e.target.closest("[data-cosmetic-toggle]");
  if (tog) {
    const id = tog.dataset.cosmeticToggle;
    if (state.cosmetics.owned[id]) {
      if (state.cosmetics.on[id]) state.cosmetics.on[id] = false;
      else turnOn(id);
    }
  }
  if (buy || tog) { applyCosmetics(); renderCosmetics(); updateCounter(); save(); }
});
// the same on/off switches on the Rewards page
$("rewardList").addEventListener("click", (e) => {
  const tog = e.target.closest("[data-cosmetic-toggle]");
  if (!tog) return;
  const id = tog.dataset.cosmeticToggle;
  if (!state.cosmetics.owned[id]) return;
  if (state.cosmetics.on[id]) state.cosmetics.on[id] = false; else turnOn(id);
  applyCosmetics(); renderRewards(); save();
});
