/* =====================================================================
   ACHIEVEMENTS: checked every second. Each one has a goal and a function that
   measures your progress. Unlocked ones are saved with the time you got them.
   ===================================================================== */
const SC = 1e6;   // 1 scoin
const ACH_CATEGORIES = [
  { id: "general", name: "⭐ General" },
  { id: "income", name: "💰 Income" }, { id: "casino", name: "🎰 Casino" },
  { id: "invest", name: "📈 Investments" }, { id: "logistics", name: "🚢 Logistics" },
  { id: "art", name: "🖼️ Art Gallery" }, { id: "mine", name: "⛏️ Mining" },
  { id: "shooter", name: "🚀 Nebula Strike" },
  { id: "space", name: "🪐 Space Logistics" },
  // 🌌 secret: invisible (also not counted) until the 1st prestige
  { id: "secret", name: "🌌 Secrets", hidden: () => !((state.legacy && state.legacy.count) >= 1) },
  // 🧬 Gene Splicer: invisible (also not counted) until the 2nd prestige
  { id: "genetics", name: "🧬 Genetics", hidden: () => !((state.legacy && state.legacy.count) >= 2) },
];
// 🎨 painted category icons (assets/icons/ico-ui-*.webp); the name's emoji stays for plain text
const ACH_CAT_PIC = { space: "space", general: "general", income: "income", casino: "casino", invest: "invest", logistics: "logistics", art: "art", mine: "mining", secret: "secrets", genetics: "genetics", shooter: "nebula" };
const catLabel = (c) => ACH_CAT_PIC[c.id] ? ico("ui-" + ACH_CAT_PIC[c.id]) + c.name.replace(/^\S+\s/, "") : c.name;
const achCatsShown = () => ACH_CATEGORIES.filter(c => !(c.hidden && c.hidden()));
// an achievement with a tier stays hidden until that many prestiges (🌌🌌 second-tier secrets: 2)
const achShown = () => { const ids = achCatsShown().map(c => c.id), pc = (state.legacy && state.legacy.count) || 0;
  return ACHIEVEMENTS.filter(a => ids.includes(a.cat) && !(a.tier && pc < a.tier)); };
const flag = (k) => () => (state.stats[k] ? 1 : 0);
// all-time profit of an investment: money taken out + what it is worth now - money put in
const investProfit = (key) => { const st = inv.stats && inv.stats[key]; return st ? st.out + investCurrent(key) - st.in : 0; };
// wearing the coin and background of the same collection
const matchingSet = () => COLLECTIONS_IDS().some(col =>
  ["coin", "background"].every(slot => COSMETICS.some(c => c.collection === col && c.slot === slot && state.cosmetics.on[c.id])));
const COLLECTIONS_IDS = () => [...new Set(COSMETICS.map(c => c.collection))];
const ACHIEVEMENTS = [
  // General
  { id: "cash1s",     cat: "general", icon: "💵", name: "Millionaire",        desc: "Have 1 scoin on hand (not in casino chips)",   goal: SC,       get: () => state.money, money: true },
  { id: "cash10s",    cat: "general", icon: "💰", name: "Multi-millionaire",  desc: "Have 10 scoin on hand (not in casino chips)",  goal: 10 * SC,  get: () => state.money, money: true },
  { id: "cash100s",   cat: "general", icon: "🏦", name: "Swimming in coins",  desc: "Have 100 scoin on hand (not in casino chips)", goal: 100 * SC, get: () => state.money, money: true },
  { id: "cash1g",     cat: "general", icon: "👑", name: "Billionaire",        desc: "Have 1 gcoin on hand (not in casino chips)",   goal: 1e12,     get: () => state.money, money: true },
  { id: "cash5g",     cat: "general", icon: "💎", name: "Gold baron",         desc: "Have 5 gcoin on hand (not in casino chips)",   goal: 5e12,     get: () => state.money, money: true },
  { id: "cash10g",    cat: "general", icon: "🏰", name: "Coin emperor",       desc: "Have 10 gcoin on hand (not in casino chips)",  goal: 10e12,    get: () => state.money, money: true },
  { id: "cash20g",    cat: "general", icon: "🌍", name: "Empire of Coins",    desc: "Have 20 gcoin on hand (not in casino chips)",  goal: 20e12,    get: () => state.money, money: true },
  { id: "prestige1",  cat: "general", icon: "⭐", name: "A fresh start",      desc: "Prestige for the first time",         goal: 1, get: () => state.legacy.count },
  { id: "prestige2",  cat: "general", icon: "🌟", name: "Second wind",        desc: "Prestige twice",                    goal: 2, get: () => state.legacy.count },
  { id: "prestige4",  cat: "general", icon: "🏆", name: "Legend",             desc: "Prestige 4 times and finish the game", goal: 4, get: () => state.legacy.count },
  { id: "tax10",      cat: "general", icon: "🧾", name: "Good citizen",       desc: "Pay 10 tax bills",                    goal: 10,   get: () => state.stats.taxPaid || 0 },
  { id: "tax100",     cat: "general", icon: "🧾", name: "Model taxpayer",     desc: "Pay 100 tax bills",                   goal: 100,  get: () => state.stats.taxPaid || 0 },
  { id: "tax1000",    cat: "general", icon: "🏛️", name: "Pillar of society",  desc: "Pay 250 tax bills",                   goal: 250, get: () => state.stats.taxPaid || 0 },
  { id: "cosmetic1",  cat: "general", icon: "🛍️", name: "Treat yourself",     desc: "Buy your first cosmetic item in the Shop", goal: 1, get: () => COSMETICS.some(c => c.price > 0 && state.cosmetics.owned[c.id]) ? 1 : 0 },
  { id: "emperor",    cat: "general", icon: "🦁", name: "Hail, Emperor!",     desc: "Buy the whole 🦁 Emperor Collection and wear all 3 items at once (background, coin and cards)", goal: 3,
    get: () => ["emperorBg", "emperorCoin", "emperorCards"].filter(id => state.cosmetics.owned[id] && state.cosmetics.on[id]).length },
  { id: "uni2",     cat: "secret", icon: "🎓", name: "Double degree", desc: "Own two Universities", goal: 2, get: () => state.science ? (state.science.uni ? 1 : 0) + (state.science.uni2 ? 1 : 0) : 0 },
  { id: "astro",    cat: "secret", icon: "🔭", name: "Stargazer", desc: "Build an Astronomy Research Center", goal: 1, get: () => state.science && state.science.astro ? 1 : 0 },
  { id: "station",  cat: "secret", icon: "🛸", name: "Home among the stars", desc: "Put an Orbital Space Station in orbit", goal: 1, get: () => state.science && state.science.station ? 1 : 0 },
  // 🌌🌌 second-tier secrets: invisible (and not counted) until the 2nd prestige
  { id: "uni3",     cat: "secret", tier: 2, icon: "🎓", name: "Triple degree", desc: "Own three Universities", goal: 3, get: () => state.science ? ["uni", "uni2", "uni3"].filter(k => state.science[k]).length : 0 },
  { id: "sci150",   cat: "secret", tier: 2, icon: "👩‍🔬", name: "Brain trust", desc: "Have 150 scientists in your Universities", goal: 150, get: () => state.science && state.science.uni ? sciPool() : 0 },
  { id: "moon",     cat: "secret", tier: 2, icon: "🌕", name: "One small step", desc: "Build the Moon Base", goal: 1, get: () => state.science && state.science.moon ? 1 : 0 },
  { id: "deep1",    cat: "secret", tier: 2, icon: "🚀", name: "Into the deep", desc: "Complete your first successful deep space mission", goal: 1, get: () => state.stats.deepOk || 0 },
  { id: "deep10",   cat: "secret", tier: 2, icon: "🌌", name: "Deep space veteran", desc: "Complete 10 successful deep space missions", goal: 10, get: () => state.stats.deepOk || 0 },
  { id: "mars",     cat: "secret", tier: 2, icon: "🔴", name: "Red planet", desc: "Build the Mars Base", goal: 1, get: () => state.science && state.science.mars ? 1 : 0 },
  { id: "gene",     cat: "secret", tier: 2, icon: "🧬", name: "Rewriting the code", desc: "Open the Genetics Laboratory", goal: 1, get: () => state.science && state.science.gene ? 1 : 0 },
  { id: "fullSet",    cat: "general", icon: "🎨", name: "Dressed to impress", desc: "Wear the coin and background from the same collection", goal: 1, get: () => matchingSet() ? 1 : 0 },
  // Income
  { id: "click100",   cat: "income", icon: "👆", name: "Warming up",         desc: "Click the coin 100 times",            goal: 100,    get: () => state.stats.clicks },
  { id: "click1k",    cat: "income", icon: "👆", name: "Clicker",            desc: "Click the coin 1,000 times",          goal: 1000,   get: () => state.stats.clicks },
  { id: "click10k",   cat: "income", icon: "🖱️", name: "Click machine",      desc: "Click the coin 10,000 times",         goal: 10000,  get: () => state.stats.clicks },
  { id: "click100k",  cat: "income", icon: "🦾", name: "Iron finger",        desc: "Click the coin 100,000 times",        goal: 100000, get: () => state.stats.clicks },
  { id: "wash3",      cat: "income", icon: "🚗", name: "Squeaky clean",      desc: "Own 3 car washes",                    goal: 3, get: () => ownedOf("carwash") },
  { id: "repair3",    cat: "income", icon: "🔧", name: "Grease monkey",      desc: "Own 3 car repair shops",              goal: 3, get: () => ownedOf("repair") },
  { id: "salon3",     cat: "income", icon: "🚘", name: "Showroom king",      desc: "Own 3 car salons",                    goal: 3, get: () => ownedOf("salon") },
  { id: "casino2",    cat: "income", icon: "🎰", name: "The house always wins", desc: "Own 2 casinos",                    goal: 2, get: () => ownedOf("casino") },
  { id: "hotel2",     cat: "income", icon: "🏨", name: "Hotelier",           desc: "Own 2 hotels",                        goal: 2, get: () => ownedOf("hotel") },
  { id: "warehouse5", cat: "income", icon: "📦", name: "Storage empire",     desc: "Own 5 warehouses",                    goal: 5, get: () => warehouseCount() },
  { id: "law10",      cat: "income", icon: "⚖️", name: "Full legal team",    desc: "Fill all 10 attorney slots in the Law Firm", goal: 10, get: () => state.special.law ? state.special.law.attorneys.length : 0 },
  { id: "agents100",  cat: "income", icon: "🏢", name: "Agency boss",        desc: "Have 100 real estate agents",         goal: 100, get: () => state.special.agency && state.special.agency.agents ? state.special.agency.agents.length : 0 },
  { id: "mine1",      cat: "income", icon: "⛏️", name: "Gold digger",        desc: "Buy your first gold mine",            goal: 1, get: () => state.stats.minesBought },
  { id: "mine4",      cat: "income", icon: "⛏️", name: "Mining magnate",     desc: "Buy 4 gold mines (all-time)",         goal: 4, get: () => state.stats.minesBought },
  { id: "port",       cat: "income", icon: "⚓", name: "Harbor master",      desc: "Buy the Trading Port",                goal: 1, get: () => state.special.port ? 1 : 0 },
  { id: "recruit", cat: "income", icon: "🧑‍💼", name: "Headhunter", desc: "Buy the Recruitment Agency special business", goal: 1, get: () => state.special.recruit ? 1 : 0 },
  { id: "artbiz", cat: "income", icon: "🏛️", name: "Patron of the arts", desc: "Buy the Art Gallery special business", goal: 1, get: () => state.special.gallery ? 1 : 0 },
  { id: "sciUni",   cat: "income", icon: "🎓", name: "Higher education", desc: "Build a University", goal: 1, get: () => state.science && state.science.uni ? 1 : 0 },
  { id: "sciLab",   cat: "income", icon: "🧪", name: "Mad scientist", desc: "Build a Research lab", goal: 1, get: () => state.science && state.science.lab ? 1 : 0 },
  { id: "sciSpace", cat: "income", icon: "🚀", name: "Space race", desc: "Build a Space Mission Center", goal: 1, get: () => state.science && state.science.space ? 1 : 0 },
  { id: "nobel1",   cat: "income", icon: "🏅", name: "Nobel laureate", desc: "Make 1 scientific breakthrough", goal: 1, get: () => state.stats.nobels || 0 },
  { id: "nobel5",   cat: "income", icon: "🏅", name: "Genius", desc: "Make 5 scientific breakthroughs", goal: 5, get: () => state.stats.nobels || 0 },
  { id: "nobel10",  cat: "income", icon: "🏅", name: "Changed the world", desc: "Make 10 scientific breakthroughs", goal: 10, get: () => state.stats.nobels || 0 },
  { id: "spaceOk",  cat: "income", icon: "🌕", name: "Lift-off!", desc: "Complete your first successful space mission", goal: 1, get: () => state.stats.spaceOk || 0 },
  { id: "spaceFail", cat: "income", icon: "💥", name: "Houston, we have a problem", desc: "Have a space mission fail", goal: 1, get: () => state.stats.spaceFail || 0 },
  { id: "parks2",     cat: "income", icon: "🎢", name: "Theme park tycoon",  desc: "Pair two amusement parks with hotels", goal: 2, get: () => state.special.parks.length },
  { id: "inc5k",      cat: "income", icon: "📈", name: "Money printer",      desc: "Reach an income of 5,000 / sec",      goal: 5000,  get: () => state.stats.bestIncome, money: true },
  { id: "inc10k",     cat: "income", icon: "💸", name: "Money fountain",     desc: "Reach an income of 10,000 / sec",     goal: 10000, get: () => state.stats.bestIncome, money: true },
  { id: "boost-energy-10", cat: "income", icon: "⚡", name: "Caffeinated", desc: "Use 10 energy drinks", goal: 10, get: () => state.stats.boostEnergy || 0 },
  { id: "boost-energy-100", cat: "income", icon: "⚡", name: "Wired for life", desc: "Use 100 energy drinks", goal: 100, get: () => state.stats.boostEnergy || 0 },
  { id: "boost-pill-10", cat: "income", icon: "🧙", name: "Feeling magical", desc: "Use 10 magical pills", goal: 10, get: () => state.stats.boostPill || 0 },
  { id: "boost-pill-100", cat: "income", icon: "🧙", name: "Potion master", desc: "Use 100 magical pills", goal: 100, get: () => state.stats.boostPill || 0 },
  { id: "boost-influence-10", cat: "income", icon: "🎩", name: "Lobbyist", desc: "Use 10 political influences", goal: 10, get: () => state.stats.boostInfluence || 0 },
  { id: "boost-influence-100", cat: "income", icon: "🎩", name: "Pulling the strings", desc: "Use 50 political influences", goal: 50, get: () => state.stats.boostInfluence || 0 },
  // Casino
  { id: "bet1s",      cat: "casino", icon: "🎲", name: "Regular",            desc: "Bet 1 scoin in total",                goal: SC,       get: () => state.casinoStats.wagered, money: true },
  { id: "bet100s",    cat: "casino", icon: "🎲", name: "High roller",        desc: "Bet 100 scoin in total",              goal: 100 * SC, get: () => state.casinoStats.wagered, money: true },
  { id: "glevel5",    cat: "casino", icon: "🎲", name: "New in town",        desc: "Reach Gambler level 5",               goal: 5,  get: () => levelInfo(state.casinoXp).level },
  { id: "glevel25",   cat: "casino", icon: "🎖️", name: "Known face",         desc: "Reach Gambler level 25",              goal: 25, get: () => levelInfo(state.casinoXp).level },
  { id: "glevel50",   cat: "casino", icon: "👑", name: "Whale",              desc: "Reach Gambler level 50",              goal: 50, get: () => levelInfo(state.casinoXp).level },
  { id: "glevel99",   cat: "casino", icon: "💎", name: "Casino legend",      desc: "Reach Gambler level 99",              goal: 99, get: () => levelInfo(state.casinoXp).level },
  { id: "casinoUp",   cat: "casino", icon: "🤑", name: "Beat the house",     desc: "Be 1 scoin up in the casino (all-time earnings)", goal: SC, get: () => state.casinoStats.returned - state.casinoStats.wagered, money: true },
  { id: "royal",      cat: "casino", icon: "♠️", name: "Royal Flush or Jackpot!", desc: "Get a Royal Flush in Video Poker or Ultimate Texas Hold'em, or reach the Sky Climb jackpot (the top step)", goal: 1,
    get: () => (state.stats.royal || state.stats.climbTop || state.stats.vpJackpot ? 1 : 0) },
  { id: "quads4",     cat: "casino", icon: "🀄", name: "Four of a kind ×4",  desc: "Get 4 four-of-a-kinds in total (Video Poker and Ultimate Texas Hold'em)", goal: 4, get: () => state.stats.quads || 0 },
  { id: "sixSeven",   cat: "casino", icon: "🤷", name: "6 7",                desc: "Win an Ultimate Texas Hold'em hand holding a 6 and a 7", goal: 1, get: flag("sixSeven") },
  { id: "bj100",      cat: "casino", icon: "🃏", name: "Card counter",       desc: "Win 100 Blackjack hands",             goal: 100,  get: () => state.stats.bjWins || 0 },
  { id: "bj1000",     cat: "casino", icon: "🂡", name: "Blackjack legend",   desc: "Win 500 Blackjack hands",             goal: 500,  get: () => state.stats.bjWins || 0 },
  { id: "rouNumber",  cat: "casino", icon: "🎯", name: "Called it",          desc: "Win a bet on a single number in Roulette", goal: 1, get: flag("rouletteNumber") },
  { id: "rouZero",    cat: "casino", icon: "🟢", name: "All on zero",        desc: "Win a Roulette spin with your only bet on 0", goal: 1, get: flag("rouletteZeroOnly") },
  { id: "plinko250",  cat: "casino", icon: "🔻", name: "Edge of glory",      desc: "Hit the 250× slot in Plinko",          goal: 1, get: flag("plinko250") },
  { id: "bj500",      cat: "casino", icon: "💎", name: "Whale at the table", desc: "Bet 500 scoin on one Blackjack hand",  goal: 1, get: flag("bj500") },
  { id: "rb500",      cat: "casino", icon: "🔴", name: "Red or black?",      desc: "Bet 500 scoin on red or black in a single spin", goal: 1, get: flag("redBlack500") },
  { id: "vp500",      cat: "casino", icon: "🎴", name: "Max credits",        desc: "Play a Video Poker hand with a 500 scoin bet", goal: 1, get: flag("vp500") },
  { id: "uth500",     cat: "casino", icon: "🤠", name: "All in",             desc: "Play an Ultimate Texas Hold'em hand with a 500 scoin ante", goal: 1, get: flag("uth500") },
  ...[["roulette", "🎡", "Roulette", "spins"], ["blackjack", "🃏", "Blackjack", "hands"], ["plinko", "🔻", "Plinko", "balls"],
      ["climb", "🎈", "Sky Climb", "rounds"], ["vp", "🎴", "Video Poker", "hands"], ["uth", "🤠", "Ultimate Texas Hold'em", "hands"]]
    .flatMap(([g, icon, label, unit]) => [100, g === "climb" || g === "uth" ? 500 : 1000].map(n => ({   // Sky Climb and Hold'em veteran: 500 (id kept for old saves)
      id: `play-${g}-${n === 100 ? 100 : 1000}`, cat: "casino", icon, name: `${label} ${n === 100 ? "regular" : "veteran"}`,
      desc: `${unit === "balls" ? "Drop" : "Play"} ${n.toLocaleString()} ${label} ${unit}${g === "blackjack" || g === "uth" ? " (each seat you bet on counts)" : ""}`, goal: n, get: () => (state.stats.played && state.stats.played[g]) || 0 }))),
  // 🎴 Baccarat
  ...[50, 100, 500].map(n => ({ id: `bac${n}`, cat: "casino", icon: "🎴", name: n === 50 ? "Punto Banco" : n === 100 ? "Baccarat regular" : "Baccarat high society",
      desc: `Play ${n} Baccarat hands`, goal: n, get: () => (state.stats.played && state.stats.played.bac) || 0 })),
  { id: "bacStreak3", cat: "casino", icon: "🔥", name: "Hot shoe", desc: "Win 3 Baccarat hands in a row", goal: 3, get: () => state.stats.bacBestStreak || 0 },
  // 🧬 Gene Cascade (slot; shown from the 1st prestige, when it can unlock)
  ...[50, 100, 500].map(n => ({ id: `gc${n}`, cat: "casino", tier: 1, icon: "🧬", name: n === 50 ? "Lab rat" : n === 100 ? "Cascade regular" : "Chain reaction",
      desc: `Play ${n} Gene Cascade spins`, goal: n, get: () => (state.stats.played && state.stats.played.gc) || 0 })),
  { id: "gcFree", cat: "casino", tier: 1, icon: "🧪", name: "It's mutating!", desc: "Land 3+ DNA vials to trigger free spins in Gene Cascade", goal: 1, get: () => state.stats.gcFree || 0 },
  { id: "gcBuy",  cat: "casino", tier: 1, icon: "🛒", name: "Bought in bulk", desc: "Buy free spins in Gene Cascade", goal: 1, get: () => state.stats.gcBuys || 0 },
  // Investments
  { id: "prop1",      cat: "invest", icon: "🏠", name: "Landlord",           desc: "Buy your first property",             goal: 1,  get: () => Math.max(inv.properties.length, state.invest.stats && state.invest.stats.re && state.invest.stats.re.in > 0 ? 1 : 0) },
  { id: "prop10",     cat: "invest", icon: "🏘️", name: "Property portfolio", desc: "Own 10 properties at once",           goal: 10, get: () => inv.properties.length },
  { id: "re1s",       cat: "invest", icon: "🏙️", name: "Real estate mogul",  desc: "Earn 1 scoin in all-time real estate profit", goal: SC,      get: () => reProfit(), money: true },
  { id: "re10s",      cat: "invest", icon: "🌆", name: "Skyline owner",      desc: "Earn 10 scoin in all-time real estate profit", goal: 10 * SC, get: () => reProfit(), money: true },
  { id: "reSold100",  cat: "invest", icon: "🔑", name: "Flipper",            desc: "Sell 100 properties",                 goal: 100, get: () => state.stats.reSold || 0 },
  { id: "reCrash",    cat: "invest", icon: "🏚️", name: "Survivor",           desc: "Live through a real estate crash",    goal: 1, get: flag("reCrash") },
  { id: "etf1s",      cat: "invest", icon: "📉", name: "Index fan",          desc: "Earn 1 scoin in all-time ETF profit",         goal: SC,       get: () => investProfit("etf"), money: true },
  { id: "etf10s",     cat: "invest", icon: "📈", name: "Market timer",       desc: "Earn 10 scoin in all-time ETF profit",        goal: 10 * SC,  get: () => investProfit("etf"), money: true },
  { id: "gold10s",    cat: "invest", icon: "🪙", name: "Fort Knox",          desc: "Earn 10 scoin in all-time gold profit",       goal: 10 * SC,  get: () => goldProfit(), money: true },
  { id: "petf10s",    cat: "invest", icon: "🏦", name: "Friends in high places", desc: "Earn 10 scoin in all-time Broker ETF profit", goal: 10 * SC,  get: () => investProfit("petf"), money: true },
  { id: "petf100s",   cat: "invest", icon: "🏛️", name: "Wall Street insider", desc: "Earn 100 scoin in all-time Broker ETF profit", goal: 100 * SC, get: () => investProfit("petf"), money: true },
  { id: "trade1",     cat: "invest", icon: "📡", name: "First green trade",  desc: "Close 1 profitable trade in Live trading",    goal: 1,   get: () => state.stats.profitTrades || 0 },
  { id: "trade10",    cat: "invest", icon: "📈", name: "Day trader",         desc: "Close 10 profitable trades in Live trading",  goal: 10,  get: () => state.stats.profitTrades || 0 },
  { id: "trade100",   cat: "invest", icon: "🦈", name: "Market shark",       desc: "Close 100 profitable trades in Live trading", goal: 100, get: () => state.stats.profitTrades || 0 },
  { id: "gold1s",     cat: "invest", icon: "🥇", name: "Golden touch",       desc: "Earn 1 scoin in all-time gold profit",        goal: SC, get: () => goldProfit(), money: true },
  { id: "petfFull",   cat: "invest", icon: "🏦", name: "Insider",            desc: "Fill the Broker ETF (10 scoin invested)", goal: 10 * SC, get: () => investCurrent("petf"), money: true },
  { id: "ilevel5",    cat: "invest", icon: "📈", name: "First steps",        desc: "Reach Investor level 5",              goal: 5,  get: () => levelInfo(inv.xp, INVEST_XP).level },
  { id: "ilevel25",   cat: "invest", icon: "📊", name: "Analyst",            desc: "Reach Investor level 25",             goal: 25, get: () => levelInfo(inv.xp, INVEST_XP).level },
  { id: "ilevel50",   cat: "invest", icon: "🐂", name: "Wolf of Wall Street", desc: "Reach Investor level 50",            goal: 50, get: () => levelInfo(inv.xp, INVEST_XP).level },
  { id: "ilevel99",   cat: "invest", icon: "🏛️", name: "Market maker",       desc: "Reach Investor level 99",             goal: 99, get: () => levelInfo(inv.xp, INVEST_XP).level },
  // Logistics
  { id: "llevel5",    cat: "logistics", icon: "🚚", name: "On the road",      desc: "Reach Logistics level 5",            goal: 5,  get: () => logiLevel() },
  { id: "llevel25",   cat: "logistics", icon: "🗺️", name: "Dispatcher",       desc: "Reach Logistics level 25",           goal: 25, get: () => logiLevel() },
  { id: "llevel50",   cat: "logistics", icon: "🌐", name: "Supply chain boss", desc: "Reach Logistics level 50",          goal: 50, get: () => logiLevel() },
  { id: "llevel99",   cat: "logistics", icon: "🏆", name: "Logistics legend", desc: "Reach Logistics level 99",           goal: 99, get: () => logiLevel() },
  { id: "truck15",    cat: "logistics", icon: "🚛", name: "Trucking company", desc: "Buy 15 semi-trucks",                 goal: 15, get: () => logi.trucks.length },
  { id: "tanker1",    cat: "logistics", icon: "🚢", name: "Set sail",         desc: "Buy your first oil tanker",          goal: 1,  get: () => logi.tankers.length },
  { id: "tanker10",   cat: "logistics", icon: "🛢️", name: "Oil baron",        desc: "Buy 10 oil tankers",                 goal: 10, get: () => logi.tankers.length },
  { id: "plane1",     cat: "logistics", icon: "✈️", name: "Taking off",       desc: "Buy your first cargo plane",         goal: 1,  get: () => logi.planes.length },
  { id: "plane5",     cat: "logistics", icon: "🛫", name: "Airline",          desc: "Buy 5 cargo planes",                 goal: 5,  get: () => logi.planes.length },
  { id: "con100",     cat: "logistics", icon: "📋", name: "Reliable carrier", desc: "Fulfill 100 logistics contracts",    goal: 100,   get: () => logi.contracts || 0 },
  { id: "con1k",      cat: "logistics", icon: "📋", name: "Logistics pro",    desc: "Fulfill 1,000 logistics contracts",  goal: 1000,  get: () => logi.contracts || 0 },
  { id: "con10k",     cat: "logistics", icon: "🌍", name: "Global network",   desc: "Fulfill 5,000 logistics contracts", goal: 5000, get: () => logi.contracts || 0 },
  { id: "logi1s",     cat: "logistics", icon: "💵", name: "First big haul",   desc: "Earn 1 scoin from logistics",        goal: SC,       get: () => logi.earned, money: true },
  { id: "arteasy50", cat: "art", icon: "🟢", name: "Apprentice: Easy", desc: "Submit a 50%+ match on an Easy painting", goal: 50, get: () => Math.floor((state.stats.artBest || {}).easy || 0) },
  { id: "arteasy75", cat: "art", icon: "🟢", name: "Skilled copyist: Easy", desc: "Submit a 75%+ match on an Easy painting", goal: 75, get: () => Math.floor((state.stats.artBest || {}).easy || 0) },
  { id: "arteasy90", cat: "art", icon: "🟢", name: "Master forger: Easy", desc: "Submit a 90%+ match on an Easy painting", goal: 90, get: () => Math.floor((state.stats.artBest || {}).easy || 0) },
  { id: "artmedium50", cat: "art", icon: "🟡", name: "Apprentice: Medium", desc: "Submit a 50%+ match on a Medium painting", goal: 50, get: () => Math.floor((state.stats.artBest || {}).medium || 0) },
  { id: "artmedium75", cat: "art", icon: "🟡", name: "Skilled copyist: Medium", desc: "Submit a 75%+ match on a Medium painting", goal: 75, get: () => Math.floor((state.stats.artBest || {}).medium || 0) },
  { id: "artmedium90", cat: "art", icon: "🟡", name: "Master forger: Medium", desc: "Submit a 90%+ match on a Medium painting", goal: 90, get: () => Math.floor((state.stats.artBest || {}).medium || 0) },
  { id: "arthard50", cat: "art", icon: "🔴", name: "Apprentice: Hard", desc: "Submit a 50%+ match on a Hard painting", goal: 50, get: () => Math.floor((state.stats.artBest || {}).hard || 0) },
  { id: "arthard75", cat: "art", icon: "🔴", name: "Skilled copyist: Hard", desc: "Submit a 75%+ match on a Hard painting", goal: 75, get: () => Math.floor((state.stats.artBest || {}).hard || 0) },
  { id: "arthard90", cat: "art", icon: "🔴", name: "Master forger: Hard", desc: "Submit a 90%+ match on a Hard painting", goal: 90, get: () => Math.floor((state.stats.artBest || {}).hard || 0) },
  { id: "artcol10", cat: "art", icon: "🖼️", name: "Small collection", desc: "Have 10 paintings in your collection", goal: 10, get: () => paintingsOwned() },
  { id: "artcol50", cat: "art", icon: "🖼️", name: "Curator", desc: "Have 50 paintings in your collection", goal: 50, get: () => paintingsOwned() },
  { id: "artcol100", cat: "art", icon: "🖼️", name: "Museum of copies", desc: "Have 100 paintings in your collection", goal: 100, get: () => paintingsOwned() },
  { id: "artslots", cat: "art", icon: "🏛️", name: "Grand gallery", desc: "Buy every collection slot (100 slots)", goal: 100, get: () => (state.art && state.art.slots) || 0 },
  { id: "artsold1", cat: "art", icon: "💰", name: "First sale", desc: "Sell 1 painting", goal: 1, get: () => state.stats.artSold || 0 },
  { id: "artsold50", cat: "art", icon: "💰", name: "Art dealer", desc: "Sell 50 paintings", goal: 50, get: () => state.stats.artSold || 0 },
  { id: "artsold100", cat: "art", icon: "💰", name: "Gallery regular", desc: "Sell 100 paintings", goal: 100, get: () => state.stats.artSold || 0 },
  { id: "artsold1000", cat: "art", icon: "💰", name: "Art market mogul", desc: "Sell 200 paintings", goal: 200, get: () => state.stats.artSold || 0 },
  // ⛏️ Mining (🎮 Mini-games → Gold Mine Dig). state.mine is set up by js/23-minigames.js, so every check is guarded.
  ...(() => {
    const Mn = () => state.mine || {}, ore = (k) => () => ((Mn().ores || {})[k] || 0), depth = () => (Mn().best || 0) * 2;
    const ups = () => (typeof MINE_UPS === "object" ? Object.keys(MINE_UPS) : []);
    return [
      { id: "mineRun1",    icon: "⛏️", name: "First dig",          desc: "Finish your first Gold Mine Dig run",       goal: 1,   get: () => Mn().runs || 0 },
      { id: "mineRun50",   icon: "🪨", name: "Regular miner",      desc: "Finish 50 runs",                             goal: 50,  get: () => Mn().runs || 0 },
      { id: "mineRun250",  icon: "⛏️", name: "Mine foreman",       desc: "Finish 200 runs",                            goal: 200, get: () => Mn().runs || 0 },
      { id: "mineDeep50",  icon: "🕳️", name: "Going down",         desc: "Reach a depth of 50 m",                      goal: 50,  get: depth },
      { id: "mineDeep80",  icon: "🔦", name: "Deep shaft",         desc: "Reach a depth of 80 m",                      goal: 80,  get: depth },
      { id: "mineDeep100", icon: "🌋", name: "Into the dark",      desc: "Reach a depth of 100 m",                     goal: 100, get: depth },
      { id: "mineCoal",    icon: "⚫", name: "Coal collector",     desc: "Bring back 100 coal",                        goal: 100, get: ore("coal") },
      { id: "mineSilver",  icon: "⚪", name: "Silver lining",      desc: "Bring back 100 silver",                      goal: 100, get: ore("silver") },
      { id: "mineGold",    icon: "🟡", name: "Golden touch",       desc: "Bring back 100 gold",                        goal: 100, get: ore("gold") },
      { id: "mineDiamond", icon: "💎", name: "Shine bright",       desc: "Bring back your first diamond",              goal: 1,   get: ore("diamond") },
      { id: "mineFullBag", icon: "🎒", name: "Packed bag",         desc: "Come back to the surface with a completely full bag", goal: 1, get: () => Mn().fullBag ? 1 : 0 },
      { id: "mineClose",   icon: "🪔", name: "Close call",         desc: "Reach the surface with less than 3 lamp oil left", goal: 1, get: () => Mn().closeCall ? 1 : 0 },
      { id: "mineRescue",  icon: "🆘", name: "Saved by the bell",  desc: "Get rescued for the first time",             goal: 1,   get: () => Mn().rescued ? 1 : 0 },
      { id: "mineUp1",     icon: "⬆️", name: "First upgrade",      desc: "Buy any Gold Mine Dig upgrade",              goal: 1,   get: () => ups().some(k => (Mn().up || {})[k] > 0) ? 1 : 0 },
      { id: "mineHoard",   icon: "🏦", name: "Hoarder",            desc: "Have 100 ore in your vault at once",         goal: 100, get: () => Object.values(Mn().vault || {}).reduce((a, b) => a + b, 0) },
      { id: "mineMaxUp",   icon: "🪔", name: "Fully lit",          desc: "Max out any Gold Mine Dig upgrade",          goal: 1,   get: () => ups().some(k => ((Mn().up || {})[k] || 0) >= MINE_UPS[k].max) ? 1 : 0 },
      { id: "mineDeep150", icon: "🔥", name: "Survive the lava",   desc: "Reach a depth of 150 m",                     goal: 150, get: depth },
      { id: "mineDeep250", icon: "🏁", name: "Rock bottom",        desc: "Reach the bottom of the mine: 250 m",        goal: 250, get: depth },
      { id: "mineChest1",  icon: "📦", name: "First chest",        desc: "Open your first treasure chest",             goal: 1,   get: () => Mn().chests || 0 },
      { id: "mineChest50", icon: "💰", name: "Treasure hunter",    desc: "Open 50 treasure chests",                    goal: 50,  get: () => Mn().chests || 0 },
      { id: "mineLift1",   icon: "🛗", name: "Going up",           desc: "Take the mine lift up",                      goal: 1,   get: () => Mn().liftsUsed || 0 },
      { id: "mineLift20",  icon: "🛗", name: "Frequent rider",     desc: "Take the mine lift up 20 times",             goal: 20,  get: () => Mn().liftsUsed || 0 },
      { id: "mineMaster",  icon: "🏅", name: "Master Miner",       desc: "Max out every Gold Mine Dig upgrade",        goal: 1,   get: () => ups().length && ups().every(k => ((Mn().up || {})[k] || 0) >= MINE_UPS[k].max) ? 1 : 0 },
    ].map(a => ({ ...a, cat: "mine" }));
  })(),
  // 🧬 Gene Splicer (🎮 Mini-games, secret: the whole section is hidden until the 2nd prestige). state.genetics comes from js/24-genetics.js.
  ...(() => {
    const GS = () => (typeof geneFound === "function" ? geneFound() : 0), GK = (n) => (state.genetics && (state.genetics.known || []).includes(n) ? 1 : 0);
    return [
      { id: "gene1",       icon: "🧬", name: "It's alive!",        desc: "Discover your first new species",  goal: 1,   get: GS },
      { id: "gene10",      icon: "🧫", name: "Lab assistant",      desc: "Discover 10 species",              goal: 10,  get: GS },
      { id: "gene50",      icon: "🔬", name: "Geneticist",         desc: "Discover 50 species",              goal: 50,  get: GS },
      { id: "gene100",     icon: "🧬", name: "Master of life",     desc: "Discover 100 species",             goal: 100, get: GS },
      { id: "geneKraken",  icon: "🦑", name: "Release the Kraken", desc: "Discover the Kraken",              goal: 1,   get: () => GK("Kraken") },
      { id: "geneElder",   icon: "🐲", name: "Dragon whisperer",   desc: "Discover the Elder dragon",        goal: 1,   get: () => GK("Elder dragon") },
      { id: "geneUnicorn", icon: "🦄", name: "One of a kind",      desc: "Discover the Unicorn",             goal: 1,   get: () => GK("Unicorn") },
    ].map(a => ({ ...a, cat: "genetics" }));
  })(),
  // 🚀 Nebula Strike (🎮 Mini-games). state.shooter is set up by js/30-shooter.js, so every check is guarded.
  ...(() => {
    const N = () => state.shooter || {}, shipUps = (id) => ((N().up || {})[id] || {});
    const maxed = (id) => typeof SH_UPS === "object" && Object.keys(SH_UPS).every(k => (shipUps(id)[k] || 0) >= SH_UPS[k].max);
    return [
      { id: "shLv1",     icon: "🦀", name: "Scrap metal",         desc: "Beat the Scrap Crab in level 1 of Nebula Strike",     goal: 1, get: () => (N().done || 0) >= 1 ? 1 : 0 },
      { id: "shLv2",     icon: "🐝", name: "Hive buster",         desc: "Beat the Hive Queen in level 2 of Nebula Strike",     goal: 1, get: () => (N().done || 0) >= 2 ? 1 : 0 },
      { id: "shLv3",     icon: "👁️", name: "Tax evasion",         desc: "Beat The Taxman in level 3 of Nebula Strike",         goal: 1, get: () => (N().done || 0) >= 3 ? 1 : 0 },
      { id: "shLv4",     icon: "🏴‍☠️", name: "Pirate's bane",       desc: "Beat Admiral Dreadmaw in level 4 of Nebula Strike", goal: 1, get: () => (N().done || 0) >= 4 ? 1 : 0 },
      { id: "shLv5",     icon: "🗺️", name: "Survivor of the graveyard", desc: "Survive 5 minutes in level 5 of Nebula Strike", goal: 1, get: () => (N().done || 0) >= 5 ? 1 : 0 },
      { id: "shLoot10",  icon: "💰", name: "Treasure hunter",     desc: "Open 10 pirate loot boxes",                       goal: 10, get: () => N().loots || 0 },
      { id: "petLove",   icon: "💖", name: "Best friends",        desc: "Pet your pet 100 times",                          goal: 100, get: () => (state.pet && state.pet.pets) || 0 },
      { id: "petTaps",   icon: "🐾", name: "Paw power",           desc: "Let your pet tap the coin 10,000 times",          goal: 10000, get: () => (state.pet && state.pet.taps) || 0 },
      { id: "shPet",     icon: "🐾", name: "A new friend",        desc: "Find the pet in a pirate loot box",               goal: 1, get: () => state.pet && state.pet.owned && !state.pet.pending ? 1 : 0 },
      { id: "shPerfect", icon: "✨", name: "Untouchable",         desc: "Beat a Nebula Strike level without losing a life",  goal: 1, get: () => N().perfect || 0 },
      { id: "shBlock50", icon: "🛡️", name: "Perfect timing",      desc: "Block 50 hits with your shield",                    goal: 50, get: () => N().blocks || 0 },
      { id: "shKill1k",  icon: "👾", name: "Space exterminator",  desc: "Destroy 1,000 enemies in Nebula Strike",            goal: 1000, get: () => N().kills || 0 },
      { id: "shWins10",  icon: "🏁", name: "Veteran pilot",       desc: "Win 10 Nebula Strike levels",                       goal: 10, get: () => N().wins || 0 },
      { id: "shFleet",   icon: "🛸", name: "Full hangar",         desc: "Own all 4 Nebula Strike ships",                     goal: 4, get: () => (N().owned || []).length },
      { id: "shMaxShip", icon: "⬆️", name: "Fully loaded",        desc: "Max out every upgrade on one ship",                 goal: 1, get: () => (N().owned || []).some(maxed) ? 1 : 0 },
      { id: "shDust5k",  icon: "🌟", name: "Stardust collector",  desc: "Collect 5,000 stardust",                            goal: 5000, get: () => N().dustAll || 0 },
    ].map(a => ({ ...a, cat: "shooter" }));
  })(),
  // 🪐 Space logistics (js/34-space.js loads later, so every check is guarded)
  ...(() => {
    const S = () => state.space || {}, races = () => Object.values(S().races || {});
    const lv = (pts) => races().some(r => r.found && (r.pts || 0) >= pts) ? 1 : 0;
    return [
      { id: "spMeet1",   icon: "👽", name: "First contact",          desc: "Meet your first alien race",                    goal: 1,  get: () => races().filter(r => r.found).length },
      { id: "spMeet6",   icon: "🔭", name: "Star cartographer",      desc: "Meet 6 alien races",                            goal: 6,  get: () => races().filter(r => r.found).length },
      { id: "spFriend",  icon: "😊", name: "Friends among the stars", desc: "Become Friendly with an alien race",           goal: 1,  get: () => lv(1000) },
      { id: "spAlly",    icon: "💖", name: "Interstellar alliance",  desc: "Become Allies with an alien race",              goal: 1,  get: () => lv(5000) },
      { id: "spGifts50", icon: "🎁", name: "Generous empire",        desc: "Deliver 50 gifts to alien races",               goal: 50, get: () => (S().stats || {}).gifts || 0 },
      { id: "spMeet9",   icon: "🌌", name: "Galactic network",       desc: "Meet all 9 alien races",                        goal: 9,  get: () => races().filter(r => r.found).length },
      { id: "spAllies3", icon: "👑", name: "Friends forever",        desc: "Become Allies with 3 alien races",             goal: 3,  get: () => races().filter(r => r.found && (r.pts || 0) >= 5000).length },
      { id: "spRoute1",  icon: "🛣️", name: "Open for business",      desc: "Open your first trade route",                   goal: 1,  get: () => (S().stats || {}).routes || 0 },
      { id: "spSold1k",  icon: "🏪", name: "Galactic merchant",      desc: "Sell 1,000 alien goods at the market",          goal: 1000, get: () => (S().stats || {}).sold || 0 },
    ].map(a => ({ ...a, cat: "space" }));
  })(),
  { id: "satellite", cat: "logistics", icon: "🛰️", name: "Eye in the sky", desc: "Launch a satellite", goal: 1, get: () => state.science && state.science.satellite ? 1 : 0 },
  { id: "logi100s",   cat: "logistics", icon: "💎", name: "Shipping tycoon",  desc: "Earn 100 scoin from logistics",      goal: 100 * SC, get: () => logi.earned, money: true },
];

if (!state.stats) state.stats = {};
for (const [k, v] of Object.entries({ clicks: 0, minesBought: state.special.mines.length, bestIncome: 0 }))
  if (typeof state.stats[k] !== "number") state.stats[k] = v;
if (!state.achievements) state.achievements = {};
// "Royal Flush!" and "Jackpot!" became one achievement: whoever had the old Jackpot! keeps it as this one
if (state.achievements.bigWin) { if (!state.achievements.royal) state.achievements.royal = state.achievements.bigWin; delete state.achievements.bigWin; }

// 🏅 painted achievement badges (assets/ach/<id>.webp); achievements without one keep their emoji
const ACH_PICS = new Set(["cash1s", "cash10s", "cash100s", "cash1g", "cash5g", "cash10g", "cash20g", "prestige1", "prestige2", "prestige4",
  "tax10", "tax100", "tax1000", "cosmetic1", "emperor", "fullSet",
  "click100", "click1k", "click10k", "click100k", "inc5k", "inc10k", "nobel1", "nobel5", "nobel10", "sciSpace", "spaceOk", "spaceFail",
  "glevel5", "bet1s", "glevel25", "bet100s", "glevel50", "glevel99", "bj500", "casinoUp", "vp500", "uth500", "plinko250", "rouNumber",
  "royal", "quads4", "sixSeven", "bj100", "bj1000", "rouZero", "rb500",
  "prop1", "prop10", "re1s", "re10s", "reSold100", "reCrash", "etf1s", "etf10s", "gold10s", "petf10s", "petf100s", "trade1",
  "trade10", "trade100", "gold1s", "petfFull", "ilevel5", "ilevel25", "ilevel50", "ilevel99",
  "llevel5", "llevel25", "llevel50", "llevel99", "truck15", "tanker1", "tanker10", "plane1", "plane5", "con100", "con1k", "con10k", "logi1s", "logi100s",
  "mineRun1", "mineRun50", "mineRun250", "mineDeep50", "mineDeep80", "mineDeep100", "mineFullBag", "mineClose", "mineRescue", "mineUp1", "mineHoard", "mineDeep150", "mineDeep250", "mineMaster", "mineChest50", "mineMaxUp",
  "arteasy50", "arteasy75", "arteasy90", "artmedium50", "artmedium75", "artmedium90", "arthard50", "arthard75", "arthard90",
  "artcol10", "artcol50", "artcol100", "artslots", "artsold1", "artsold50", "artsold100", "artsold1000",
  "uni2", "uni3", "sci150", "moon", "deep1", "deep10", "gene", "gene1", "gene100", "geneKraken", "geneElder", "geneUnicorn", "mars",
  // built from existing art in a badge rim (bronze rim = the first step, gold = the bigger one)
  "astro", "station", "wash3", "repair3", "salon3", "casino2", "hotel2", "warehouse5", "law10", "agents100", "mine1", "mine4", "port", "recruit", "artbiz", "sciUni", "sciLab", "parks2", "boost-energy-10", "boost-energy-100", "boost-pill-10", "boost-pill-100", "boost-influence-10", "boost-influence-100", "mineCoal", "mineSilver", "mineGold", "mineDiamond", "mineChest1", "mineLift1", "mineLift20", "gene10", "gene50", "satellite", "play-roulette-100", "play-roulette-1000", "play-blackjack-100", "play-blackjack-1000", "play-plinko-100", "play-plinko-1000", "play-climb-100", "play-climb-1000", "play-vp-100", "play-vp-1000", "play-uth-100", "play-uth-1000", "bac50", "bac100", "bac500", "bacStreak3", "gc50", "gc100", "gc500", "gcFree", "gcBuy",
  // 🚀 Nebula Strike
  "spMeet1", "spMeet6", "spFriend", "spAlly", "spGifts50", "spMeet9", "spAllies3", "spRoute1", "spSold1k",
  "shLv1", "shLv2", "shLv3", "shLv4", "shLoot10", "petLove", "petTaps", "shPet", "shPerfect", "shBlock50", "shKill1k", "shWins10", "shFleet", "shMaxShip", "shDust5k"]);
const achIcon = (a, cls = "") => {
  if (!ACH_PICS.has(a.id)) return a.icon;
  const diff = (a.id.match(/^art(easy|medium|hard)\d/) || [])[1];   // 🖼️ Art Gallery brushes: a dot shows Easy / Medium / Hard
  return `<img class="achPic ${cls}" src="assets/ach/${a.id}.webp" alt="">${diff && !cls ? `<span class="achDiff ${diff}"></span>` : ""}`;
};
const achDone = () => achShown().filter(a => state.achievements[a.id]).length;
function achValue(a) { try { return Math.max(0, a.get() || 0); } catch (err) { return 0; } }

let achFirstCheck = true;
function checkAchievements() {
  const fresh = [];
  for (const a of ACHIEVEMENTS) {
    if (state.achievements[a.id]) continue;
    if (achValue(a) >= a.goal) { state.achievements[a.id] = Date.now(); fresh.push(a); }
  }
  // an old save can unlock many at once: just mark them, without a pop-up for each
  if (achFirstCheck && fresh.length > 3) showAlert(`🏆 ${fresh.length} achievements unlocked!`, "Your progress so far has already earned them. See 🏆 Achievements.", "good");
  else fresh.forEach(a => showAlert(`🏆 Achievement unlocked!`, `${achIcon(a, "inl")} <b style="display:inline">${a.name}</b>: ${a.desc}`, "good"));
  achFirstCheck = false;
  if (fresh.length) save();
  const tabText = `${achDone()}/${achShown().length}`;
  if ($("achTab").textContent !== tabText) $("achTab").textContent = tabText;
  // the page is only rebuilt when something unlocks; otherwise just the progress bars move (much less work, esp. on phones)
  if (!$("achievementsView").hidden) { if (fresh.length) renderAchievements(); else updateAchProgress(); }
}
const ACH_BY_ID = {};
function updateAchProgress() {
  if (!ACH_BY_ID.__ready) { ACHIEVEMENTS.forEach(a => ACH_BY_ID[a.id] = a); ACH_BY_ID.__ready = true; }
  document.querySelectorAll("#achList [data-achbar]").forEach(el => {
    const a = ACH_BY_ID[el.dataset.achbar]; if (!a) return;
    const v = Math.min(a.goal, achValue(a)), w = (100 * v / a.goal) + "%";
    if (el.style.width !== w) el.style.width = w;
    const num = el.parentElement.nextElementSibling;
    if (num) { const show = (x) => a.money ? fmt(x) : x.toLocaleString(), t = `${show(Math.floor(v))} / ${show(a.goal)}`; if (num.textContent !== t) num.textContent = t; }
  });
}

/* ----- 🎁 Rewards: cosmetic collections earned by finishing a whole achievement category ----- */
function rewardProgress(col) {
  const pc = (state.legacy && state.legacy.count) || 0;   // achievements of a later prestige tier don't count yet
  const list = col.reward.ids ? ACHIEVEMENTS.filter(a => col.reward.ids.includes(a.id)) : ACHIEVEMENTS.filter(a => a.cat === col.reward.cat && !(a.tier && pc < a.tier));
  return { done: list.filter(a => state.achievements[a.id]).length, total: list.length };
}
function grantRewards() {   // checked with the achievements; a reward, once earned, stays
  for (const col of COLLECTIONS.filter(c => c.reward)) {
    const items = COSMETICS.filter(c => c.collection === col.id);
    if (items.every(c => state.cosmetics.owned[c.id])) continue;
    const p = rewardProgress(col);
    if (p.done < p.total) continue;
    items.forEach(c => state.cosmetics.owned[c.id] = true);
    save();
    showAlert(`🎁 Reward unlocked: ${col.name}!`, `You finished every achievement it needs. Turn it on in 🏆 Achievements → 🎁 Rewards.`);
    if (state.view === "achievements") renderAchievements();
  }
}
function renderRewards() {
  $("rewardList").innerHTML = `<div class="card"><h2 style="margin:0 0 4px">${ico("ui-rewards", "h")}Rewards</h2>
      <div class="muted">Finish every achievement of a category to unlock its collection. Rewards can't be bought in the Shop.</div></div>` +
    COLLECTIONS.filter(c => c.reward && !(c.hidden && c.hidden())).map(col => {
      const p = rewardProgress(col), items = COSMETICS.filter(c => c.collection === col.id), got = items.every(c => state.cosmetics.owned[c.id]);
      return `<div class="card rewardCard ${got ? "got" : ""}">
        <div class="row"><h2 style="margin:0">${got ? "" : ico("lock", "lockS")}${colTitle(col)}</h2><span class="muted">${got ? "✅ Unlocked" : `${p.done} / ${p.total}`}</span></div>
        <div class="muted">${col.reward.text}</div>
        ${col.reward.ids && !got ? `<div class="rewardNeeds">${ACHIEVEMENTS.filter(x => col.reward.ids.includes(x.id)).map(x =>
          `<span class="${state.achievements[x.id] ? "ok" : ""}">${state.achievements[x.id] ? "✅" : "⬜"} ${x.icon} ${x.name}</span>`).join("")}</div>` : ""}
        ${got ? "" : `<div class="bar"><div style="width:${100 * p.done / Math.max(1, p.total)}%"></div></div>`}
        <div class="cosmetics">${items.map(cosmeticCard).join("")}</div></div>`;
    }).join("");
}
function showAchPage(p) {
  state.achPage = p === "rewards" ? "rewards" : "list";
  $("achList").hidden = state.achPage !== "list";
  $("rewardList").hidden = state.achPage !== "rewards";
  document.querySelectorAll("[data-achpage]").forEach(b => b.classList.toggle("active", b.dataset.achpage === state.achPage));
  if (state.achPage === "rewards") renderRewards();
}
$("achList").addEventListener("click", (e) => {
  const cat = e.target.closest("[data-achcat]");
  if (cat) { state.achCat = cat.dataset.achcat; save(); return renderAchievements(); }
  if (!e.target.closest("#achHideToggle")) return;
  state.achHideDone = !state.achHideDone; save();
  renderAchievements();
});
$("achNav").addEventListener("click", (e) => {
  const b = e.target.closest("[data-achpage]"); if (!b) return;
  showAchPage(b.dataset.achpage); save();
});
setInterval(grantRewards, 2000);

function renderAchievements() {
  showAchPage(state.achPage);
  $("achTotal").textContent = `${achDone()} / ${achShown().length}`;
  const hide = !!state.achHideDone;
  const sel = achCatsShown().some(c => c.id === state.achCat) ? state.achCat : "all";
  const chip = (id, name, done, total) => `<button class="achCat ${sel === id ? "active" : ""}" data-achcat="${id}">${name} <span>${done}/${total}</span></button>`;
  const doneIn = (id) => ACHIEVEMENTS.filter(a => a.cat === id && state.achievements[a.id]).length;
  $("achList").innerHTML = `<div class="achCats">${chip("all", ico("ui-trophy") + "All", achDone(), achShown().length)}${achCatsShown().map(c =>
        chip(c.id, catLabel(c), doneIn(c.id), ACHIEVEMENTS.filter(a => a.cat === c.id).length)).join("")}</div>
    <div class="achFilter"><button class="btn ghost small" id="achHideToggle">${hide ? "👁️ Show completed" : ico("ui-hide") + "Hide completed"}</button>
      <span class="muted">${hide ? "Completed achievements are hidden." : ""}</span></div>` + achCatsShown().filter(c => sel === "all" || c.id === sel).map(c => {
    const all = ACHIEVEMENTS.filter(a => a.cat === c.id);
    const done = all.filter(a => state.achievements[a.id]).length;
    const list = hide ? all.filter(a => !state.achievements[a.id]) : all;
    return `<div class="achHead"><h2 style="margin:0">${catLabel(c)}</h2><span class="muted">${done} / ${all.length}</span></div>
      ${list.length ? "" : `<div class="muted" style="margin:4px 0 14px">✅ All done in this category!</div>`}
      <div class="achGrid">${list.map(a => {
        const got = state.achievements[a.id];
        const v = Math.min(a.goal, achValue(a));
        const show = (x) => a.money ? fmt(x) : x.toLocaleString();
        return `<div class="ach ${got ? "done" : ""}">
          <div class="ico ${ACH_PICS.has(a.id) ? "pic" : ""}">${achIcon(a)}</div>
          <div style="flex:1; min-width:0">
            <div class="nm">${a.name}</div>
            <div class="muted">${a.desc}</div>
            ${got ? `<div class="muted" style="color:#ffd34d">✔ Unlocked ${new Date(got).toLocaleDateString()}</div>`
                  : a.goal > 1 ? `<div class="bar"><div data-achbar="${a.id}" style="width:${100 * v / a.goal}%"></div></div><div class="muted" data-achnum="${a.id}">${show(Math.floor(v))} / ${show(a.goal)}</div>` : ""}
          </div></div>`;
      }).join("")}</div>`;
  }).join("");
}
setInterval(checkAchievements, 1000);
