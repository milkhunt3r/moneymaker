/* Empire of Coins © 2026 milkhunt3r. All rights reserved. */
/* =====================================================================
   SETTINGS: change these numbers to balance the game
   ===================================================================== */
const LAW_IMMIGRATION = 0.25;   // ⚖️ immigration lawyer: +25% for car washes and gold mines (per lawyer)
const LAW_BUSINESS = 0.10;      // ⚖️ business lawyer: +10% for one random business (per lawyer)
const MONEY_PER_CLICK = 1;
const MAX_CLICKS_PER_SECOND = 10;
const LAZY_CHANCE = 0.3;            // 30% chance a lazy worker earns nothing that second
const CRIMINAL_CHANCE = 1 / 20;     // 1 in 20 chance per second to double company income
const EMBEZZLER_BONUS = 0.30;       // +30% company income
const EMBEZZLER_CHANCE = 1 / 100;   // 1 in 100 chance per second that he steals...
const EMBEZZLER_STEAL = 0.10;       // ...10% of what the company earned in the last 60 seconds
const GAMBLE_EVERY = 10;            // gamblers (accountant and worker) roll every 10 seconds
const NIGHT_OWL_PHASE = 10;         // 10 seconds double, then 10 seconds half
const HARD_WORKER_BONUS = 0.50;     // +50% income
const BURNOUT_CHANCE = 0.02;        // 2% chance per second to burn out...
const BURNOUT_SECONDS = 10;         // ...and earn nothing for 10 seconds
const COPYCAT_EVERY = 20;           // copycat picks a new trait to copy every 20 seconds

// Tax inspection event
const TAX_CHANCE = 1 / 1000;        // checked every second, even while you already owe taxes
const TAX_FORCED_AFTER = 1200;      // happens for sure if it hasn't for 1200 seconds
const TAX_RATE = 0.20;              // 20% of...
const TAX_LOOKBACK = 300;           // ...everything you earned in the last 300 seconds (5 min)
const TAX_TIME_TO_PAY = 300;        // 5 minutes to pay each tax bill
const TAX_LATE_PENALTY = 0.50;      // can't pay in time: bill +50% and 5 more minutes. Miss again = game over

// Business types. To add a new one later, copy the car wash entry.
const BUSINESS_TYPES = [
  {
    id: "hotdog",
    name: "Hot Dog Stand",
    emoji: "🌭",
    price: 100,
    maxOwned: 3,
    priceMultiplier: 2, // 100, 200, 400
    noStaff: true,      // a small stand: no accountant and no HR, just 2 workers
    maxEmployees: 2,
    hireBaseCost: 0,    // first worker is free, the second costs 50
    hireCostStep: 50,
    minIncome: 2,
    maxIncome: 3,
    refreshBaseCost: 5,
    refreshCostStep: 5,
  },
  {
    id: "carwash",
    name: "Car Wash",
    emoji: "🚗",
    price: 1000,
    maxOwned: 3,        // how many of this business you can own
    priceMultiplier: 2, // each extra one costs double: 1000, 2000, 4000
    maxEmployees: 10,   // includes the accountant and HR, so 8 workers
    hireBaseCost: 0,    // first worker is free...
    hireCostStep: 100,  // ...then each next worker costs 100 more (100, 200, 300...)
    minIncome: 1,       // each candidate earns a random whole number
    maxIncome: 3,     // between minIncome and maxIncome per second
    refreshBaseCost: 10,  // first "new options" costs this...
    refreshCostStep: 10,  // ...and every refresh after that costs this much more
  },
  {
    id: "repair",
    name: "Car Repair Shop",
    emoji: "🔧",
    price: 10000,       // 10k, then 20k, then 40k
    maxOwned: 3,
    priceMultiplier: 2,
    // Unlock: have 20 workers across your car washes
    unlock: () => carWashWorkers() >= 20 ? 3 : 0,
    unlockText: () => `Unlocks when you have 20 car wash workers (you have ${carWashWorkers()})`,
    maxEmployees: 12,   // includes the accountant and HR, so 10 workers
    hireBaseCost: 0,    // first worker is free...
    hireCostStep: 150,  // ...then 150, 300, 450...
    minIncome: 3,
    maxIncome: 6,
    refreshBaseCost: 10,
    refreshCostStep: 10,
  },
  {
    id: "salon",
    name: "Car Salon",
    emoji: "🚘",
    price: 100000,      // 100k, then 200k, then 400k
    maxOwned: 3,
    priceMultiplier: 2,
    // Unlock: own all 3 car washes and all 3 repair shops
    unlock: () => (ownedOf("carwash") >= 3 && ownedOf("repair") >= 3) ? 3 : 0,
    unlockText: () => `Unlocks when you own all 3 car washes (${ownedOf("carwash")}/3) and all 3 repair shops (${ownedOf("repair")}/3)`,
    maxEmployees: 10,   // includes the accountant and HR, so 8 workers
    hireBaseCost: 0,    // first worker is free...
    hireCostStep: 200,  // ...then 200, 400, 600...
    minIncome: 5,
    maxIncome: 8,
    refreshBaseCost: 10,
    refreshCostStep: 10,
    perk: "Each Car Salon gives all car washes and repair shops +10% income",
  },
  {
    id: "casino",
    name: "Casino",
    emoji: "🎰",
    price: 1000000,     // 1M, then 2M, 4M, 8M...
    maxOwned: 10,       // Gambler level 5, 15, 25 ... 95 = up to 10 casinos
    priceMultiplier: 2,
    // Unlock: first casino at Gambler level 5, then one more every 10 levels
    unlock: () => {
      const lvl = levelInfo(state.casinoXp).level;
      return lvl < 5 ? 0 : 1 + Math.floor((lvl - 5) / 10);
    },
    unlockText: (owned) => `Casino #${owned + 1} unlocks at Gambler level ${5 + owned * 10} (play in the 🎰 Casino tab)`,
    maxEmployees: 15,   // includes the accountant and HR, so 13 workers
    hireBaseCost: 0,    // first worker is free...
    hireCostStep: 250,  // ...then 250, 500, 750...
    minIncome: 5,
    maxIncome: 10,
    refreshBaseCost: 10,
    refreshCostStep: 10,
  },
  {
    id: "hotel",
    name: "Hotel",
    emoji: "🏨",
    price: 2500000,     // 2.5M, then 5M, 10M...
    maxOwned: 10,       // Investor level 5, 15, 25 ... 95 = up to 10 hotels
    priceMultiplier: 2,
    // Unlock: first hotel at Investor level 5, then one more every 10 levels
    unlock: () => {
      const lvl = levelInfo((state.invest && state.invest.xp) || 0, INVEST_XP).level;
      return lvl < 5 ? 0 : 1 + Math.floor((lvl - 5) / 10);
    },
    unlockText: (owned) => `Hotel #${owned + 1} unlocks at Investor level ${5 + owned * 10} (invest in the 📈 Investing tab)`,
    maxEmployees: 18,   // includes the accountant and HR, so 16 workers
    hireBaseCost: 0,    // first worker is free...
    hireCostStep: 350,  // ...then 350, 700, 1,050...
    minIncome: 9,
    maxIncome: 12,
    refreshBaseCost: 10,
    refreshCostStep: 10,
  },
  {
    id: "broker",
    name: "Brokerage Firm",
    emoji: "🏦",
    price: 5000000,     // 5M
    maxOwned: 1,        // you can only have one
    priceMultiplier: 1,
    // Unlock: Investor level 10
    unlock: () => levelInfo((state.invest && state.invest.xp) || 0, INVEST_XP).level >= 10 ? 1 : 0,
    unlockText: () => `Unlocks at Investor level 10 (invest in the 📈 Investing tab)`,
    maxEmployees: 20,   // includes the accountant and HR, so 18 workers
    hireBaseCost: 0,    // first worker is free...
    hireCostStep: 500,  // ...then 500, 1,000, 1,500...
    minIncome: 12,
    maxIncome: 15,
    refreshBaseCost: 10,
    refreshCostStep: 10,
    perk: "Unlocks the Broker ETF in the 📈 Investing tab: no fee and bigger wins",
  },
];

const ACCOUNTANTS = {
  numbers:  { name: "Good with numbers", emoji: "🧮", desc: "Company profit +15%" },
  criminal: { name: "Criminal",          emoji: "🕵️", desc: "1 in 20 chance each second to double company income" },
  embezzler:{ name: "Embezzler",         emoji: "🦹", desc: "Company income +30%, but a 1 in 100 chance each second he steals 10% of the last minute's earnings" },
  gambler:  { name: "Gambler",           emoji: "🎰", desc: "Every 10 seconds he bets that second's income: 50/50 to double it or lose it" },
};

const HR_OPTIONS = {
  motivator:  { name: "Motivator",         emoji: "📣", desc: "All workers earn +15%" },
  friendship: { name: "Friendship expert", emoji: "💞", desc: "Candidates are twice as likely to have the Friendship trait" },
  talent:     { name: "Talent acquisition specialist", emoji: "🎯", desc: "Hiring workers and refreshing candidates costs 30% less. Company profit +5% when every worker spot is filled" },
  schedule:   { name: "Schedule specialist", emoji: "🗓️", desc: "Night owls and morning people earn ×3 (instead of ×2) during their double-income 10 seconds" },
};

// chance = how likely a new candidate gets this trait
// Every candidate gets exactly one trait, so the chances add up to 1.
const TRAITS = {
  friendship: { name: "Friendship",  emoji: "🤝", chance: 0.16, desc: "+20% for every Friendship worker in the company" },
  leader:     { name: "Leader",      emoji: "⭐", chance: 0.12, desc: "Doubles the income of one random co-worker each second" },
  lazy:       { name: "Lazy",        emoji: "😴", chance: 0.16, desc: "30% chance to earn nothing each second" },
  bully:      { name: "Bully",       emoji: "😠", chance: 0.12, desc: "Earns double, but one random co-worker earns nothing" },
  nightowl:   { name: "Night owl",   emoji: "🦉", chance: 0.12, desc: "10 seconds double income, then 10 seconds half income" },
  morning:    { name: "Morning person", emoji: "☀️", chance: 0.12, desc: "10 seconds double income, then 10 seconds half income" },
  // Very rare: rolled separately with a fixed 1 in 100 chance (see rollTrait)
  legend:     { name: "The Legend",  emoji: "🏆", chance: 0, desc: "Every worker in the company earns +1 per second (stacks)" },
  hardworker: { name: "Hard worker", emoji: "💪", chance: 0.12, desc: "Earns +50%, but sometimes burns out for 10 seconds" },
  mentor:     { name: "Mentor",      emoji: "🧑‍🏫", chance: 0.08, desc: "The lowest-earning co-worker earns double" },
  copycat:    { name: "Copycat",     emoji: "🔁", chance: 0.06, desc: "Copies the trait of a random co-worker every 20 seconds" },
  gambler:    { name: "Gambler",     emoji: "🎲", chance: 0.06, desc: "Every 10 seconds: 50/50 to earn double or nothing for the next 10 seconds" },
  // ----- Car repair shop traits -----
  mechanic:    { name: "Mechanic",    emoji: "🛠️", chance: 0.10, onlyFor: ["repair"], desc: "+10% income for every car wash you own" },
  overcharger: { name: "Overcharger", emoji: "🧾", chance: 0.10, onlyFor: ["repair"], desc: "+80% income, but a 1 in 50 chance each second of a complaint: nothing for 15 seconds" },
  apprentice:  { name: "Apprentice",  emoji: "🎓", chance: 0.08, onlyFor: ["repair"], desc: "Starts at 50% income, +5% every minute, up to 200%" },
  // ----- Car salon traits -----
  promoter:  { name: "Promoter",         emoji: "📢", chance: 0.12, onlyFor: ["salon"], desc: "Every car wash earns +2% (stacks for each Promoter)" },
  // ----- Hotel traits -----
  concierge: { name: "Concierge",        emoji: "🛎️", chance: 0.08, onlyFor: ["hotel"], desc: "Doubles the income of the 2 best-paid co-workers (max 5 per hotel)" },
  vip:       { name: "VIP guest magnet", emoji: "🧳", chance: 0.08, onlyFor: ["hotel"], desc: "Each second a 1 in 30 chance of a ×20 tip" },
  cleaner:   { name: "Cleaner",          emoji: "🧹", chance: 0.10, onlyFor: ["hotel"], desc: "Stops one Lazy worker from slacking each second" },
  // ----- Casino-only traits (onlyFor = which businesses can get them) -----
  mastergambler: { name: "Master gambler", emoji: "🃏", chance: 0.08, onlyFor: ["casino"], desc: "Every 10 seconds: 70% chance to earn double, 30% nothing, for the next 10 seconds" },
  quickhands:    { name: "Quick hands",    emoji: "✋", chance: 0.10, onlyFor: ["casino"], desc: "Earns double every 5th second" },
  scammer:       { name: "Scammer",        emoji: "🤑", chance: 0.08, onlyFor: ["casino"], desc: "Each second: 1 in 5 chance of triple income, 1 in 10 chance of losing three times its income" },
  normal:     { name: "No trait",   emoji: "🙂", chance: 0,    desc: "Just does the job" }, // only for old saves
};

const FIRST_NAMES = ["Alex", "Sam", "Maria", "Jonas", "Lena", "Omar", "Kate", "Igor", "Nina", "Tom",
                     "Ella", "Max", "Sofia", "Leo", "Mia", "Dan", "Ava", "Ivan", "Zoe", "Ben"];

/* =====================================================================
   GAME STATE (everything that gets saved)
   ===================================================================== */
let state = {
  money: 0,
  companies: [],   // { typeId, accountant, hr, workers: [{id, name, trait}], candidates }
  nextId: 1,
  earnedHistory: [],       // money earned each second (clicks + companies), last 5 minutes
  secondsSinceTax: 0,      // seconds since the last tax inspection
  taxDebts: [],            // tax bills: { id, amount, timeLeft, extended }
  pendingTaxId: null,      // bill waiting for you to confirm payment (game is paused)
  gameOver: false,
};

/* =====================================================================
   💾 STORAGE: the ONLY place that knows where saves are kept.
   Today: the browser (localStorage for the game, IndexedDB for painting pictures).
   Later (accounts + database): replace the insides of these functions with server calls;
   the rest of the game only uses storage.* and does not need to change.
     storage.loadGame()          -> saved progress object, or null
     storage.saveGame(progress)  -> writes progress (throws if it can't, e.g. storage full)
     storage.loadPrefs()         -> screen preferences of this device (tab, map filters, chart settings…)
     storage.savePrefs(prefs)
     storage.clearGame()         -> deletes progress, preferences and pictures (game reset)
     storage.images.put / del / all  -> painting pictures (id -> picture)
   ===================================================================== */
const SAVE_KEY = "coinClickerSave", PREFS_KEY = "coinClickerPrefs", IMG_DB = "coinClickerArt";
// Screen preferences: kept per device, never part of the progress that is saved (and later sent to the server)
// 🎨 painted icons (assets/icons/ico-*.webp), used in place of some emoji: ico("lock"), ico("prestige", "big")
const ico = (n, cls = "") => `<img class="ico ${cls}" src="assets/icons/ico-${n}.webp" alt="">`;
const bizIco = (id) => ico("biz-" + id, "biz");   // 🏢 business / special building pictures
// 🧮 accountant / HR manager picture (assets/icons/ico-st-<key>.webp), or the emoji for anything without one
const STAFF_PICS = ["numbers", "criminal", "embezzler", "gambler", "motivator", "friendship", "talent", "schedule"];
const staffIco = (key, o, cls = "staffI") => STAFF_PICS.includes(key) ? ico("st-" + key, cls) : (o ? o.emoji + " " : "");
// 🧬 Gene Splicer species bonuses: +1% per discovered species of a category (geneCatCount lives in js/24-genetics.js)
// 👽 alliance bonuses from 🌌 Space (js/34-space.js loads later)
const alienBonus = (key) => (typeof spAllyBonus === "function" ? spAllyBonus(key) : 0);
const geneBonus = (cat) => (typeof geneCatCount === "function" ? geneCatCount(cat) * 0.01 : 0);
const PREF_KEYS = ["view", "coinUnit", "casinoPage", "logiPage", "rewardType", "rewardState", "gamePage", "incomePage", "achPage", "achHideDone", "achCat", "bgBright", "mapShow", "mapHidden", "cryptoChart", "cryptoTf", "cryptoMA", "investPage",
                   "vpPayHidden", "uthPayHidden", "groupCollapsed", "wikiPage"];
function splitState(st) {   // -> { progress, prefs }
  const progress = {}, prefs = {};
  for (const k in st) (PREF_KEYS.includes(k) ? prefs : progress)[k] = st[k];
  return { progress, prefs };
}
let imgDbP = null;
function imgDb() {
  if (!imgDbP) imgDbP = new Promise((res) => {
    try {
      const rq = indexedDB.open(IMG_DB, 1);
      rq.onupgradeneeded = () => rq.result.createObjectStore("imgs");
      rq.onsuccess = () => res(rq.result);
      rq.onerror = () => res(null);
    } catch (e) { res(null); }
  });
  return imgDbP;
}
async function imgDo(mode, fn) {   // run one request on the pictures store; null if IndexedDB is unavailable
  const db = await imgDb();
  if (!db) return null;
  return new Promise((res) => {
    try {
      const tx = db.transaction("imgs", mode), rq = fn(tx.objectStore("imgs"));
      tx.oncomplete = () => res(rq ? rq.result : true);
      tx.onerror = tx.onabort = () => res(null);
    } catch (e) { res(null); }
  });
}
/* 🔐 The save is scrambled and signed, so it can't simply be edited in the browser:
   "EOC2:" + signature + ":" + the progress (JSON, XOR-scrambled, base64). The signature is a hash of the JSON with a
   secret salt; a save whose signature doesn't match was changed outside the game and is not loaded (see loadGame).
   Old plain-JSON saves still load once and are written in the new format at the next save.
   (Not unbreakable: the code runs in the player's browser. It only stops casual editing.) */
const SAVE_TAG = "EOC2:", SAVE_BAK = SAVE_KEY + "Bak", SAVE_BAD = SAVE_KEY + "Bad", SAVE_SALT = "eoc\u00b7v2\u00b7Kz7#qL9w!mR2";
function saveHash(str) {   // 53-bit hash (cyrb53) of the salted text, as hex
  let h1 = 0xdeadbeef ^ 0x9e37, h2 = 0x41c6ce57 ^ 0x79b9;
  const t = SAVE_SALT + str + SAVE_SALT;
  for (let i = 0; i < t.length; i++) { const c = t.charCodeAt(i); h1 = Math.imul(h1 ^ c, 2654435761); h2 = Math.imul(h2 ^ c, 1597334677); }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(36);
}
function saveXor(bytes) {   // the same scramble both ways
  let x = 0x2545f491;
  for (let i = 0; i < bytes.length; i++) { x ^= x << 13; x ^= x >>> 17; x ^= x << 5; bytes[i] ^= x & 255; }
  return bytes;
}
function saveEncode(progress) {
  const json = JSON.stringify(progress), b = saveXor(new TextEncoder().encode(json));
  let bin = ""; for (let i = 0; i < b.length; i += 0x8000) bin += String.fromCharCode.apply(null, b.subarray(i, i + 0x8000));
  return SAVE_TAG + saveHash(json) + ":" + btoa(bin);
}
function saveDecode(raw) {   // -> { data, ok } (ok false: edited or broken)
  if (!raw) return { data: null, ok: true };
  if (raw[0] === "{") { try { return { data: JSON.parse(raw), ok: true, legacy: true }; } catch (e) { return { data: null, ok: false }; } }
  try {
    if (!raw.startsWith(SAVE_TAG)) return { data: null, ok: false };
    const k = raw.indexOf(":", SAVE_TAG.length), sig = raw.slice(SAVE_TAG.length, k), bin = atob(raw.slice(k + 1));
    const b = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) b[i] = bin.charCodeAt(i);
    const json = new TextDecoder().decode(saveXor(b));
    if (saveHash(json) !== sig) return { data: null, ok: false };
    return { data: JSON.parse(json), ok: true };
  } catch (e) { return { data: null, ok: false }; }
}
// ☁️ the cloud copy carries a signature too (over a key-sorted copy, because the database reorders keys)
const saveCanon = (v) => v && typeof v === "object" ? (Array.isArray(v) ? "[" + v.map(saveCanon).join(",") + "]"
  : "{" + Object.keys(v).sort().filter(k => k !== "_sig" && v[k] !== undefined).map(k => JSON.stringify(k) + ":" + saveCanon(v[k])).join(",") + "}") : JSON.stringify(v === undefined ? null : v);
const saveSign = (progress) => saveHash("cloud" + saveCanon(progress));
let saveTamper = null;   // set when this device's save was refused (shown once the page is ready)
let saveBakAt = 0;
const storage = {
  loadGame() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (raw) {
        const r = saveDecode(raw);
        if (r.ok) return r.data;
        // ✋ edited outside the game: keep it aside, fall back to the last good backup (or a new game)
        try { localStorage.setItem(SAVE_BAD, raw); } catch (e) {}
        const bak = saveDecode(localStorage.getItem(SAVE_BAK));
        saveTamper = { backup: !!(bak.ok && bak.data) };
        if (bak.ok && bak.data) return bak.data;
        try { localStorage.removeItem("eoc-local-at"); localStorage.removeItem("eoc-cloud"); } catch (e) {}   // a new game: the ☁️ cloud save (if any) loads after signing in
        return null;
      }
      const old = localStorage.getItem("coinClickerMoney");   // the very first version only saved money
      return old ? { money: parseInt(old, 10) || 0 } : null;
    } catch (e) { return null; }
  },
  saveGame(progress) {
    const raw = saveEncode(progress);
    localStorage.setItem(SAVE_KEY, raw);
    if (Date.now() - saveBakAt > 10 * 60e3) { saveBakAt = Date.now(); try { localStorage.setItem(SAVE_BAK, raw); } catch (e) {} }   // a backup every 10 minutes
  },
  loadPrefs() { try { return JSON.parse(localStorage.getItem(PREFS_KEY) || "{}") || {}; } catch (e) { return {}; } },
  savePrefs(prefs) { try { localStorage.setItem(PREFS_KEY, JSON.stringify(prefs)); } catch (e) {} },
  clearGame() {
    try { [SAVE_KEY, SAVE_BAK, "coinClickerMoney", PREFS_KEY].forEach(k => localStorage.removeItem(k)); } catch (e) {}
    try { indexedDB.deleteDatabase(IMG_DB); } catch (e) {}
  },
  images: {
    put: (id, img) => imgDo("readwrite", st => st.put(img, id)),
    del: (id) => imgDo("readwrite", st => st.delete(id)),
    async all() {   // -> { id: picture } or null
      const keys = await imgDo("readonly", st => st.getAllKeys());
      if (!keys) return null;
      const vals = await imgDo("readonly", st => st.getAll()) || [];
      const out = {}; keys.forEach((k, i) => out[k] = vals[i]); return out;
    },
  },
};

// 🛡️ A save can come from a file someone sent you, so it is cleaned before use: no text in it may carry HTML
// (the game shows names and texts from the save inside the page) and no key may change how objects work.
// The game itself never stores <, >, " or ` in its texts, so nothing real is lost.
const BAD_KEYS = new Set(["__proto__", "constructor", "prototype"]);
function cleanSave(v, depth = 0) {
  if (typeof v === "string") return v.replace(/<[^>]*>/g, "").replace(/[<>"`]/g, "").replace(/javascript:/gi, "");
  if (!v || typeof v !== "object" || depth > 40) return v;
  if (Array.isArray(v)) return v.map(x => cleanSave(x, depth + 1));
  const out = {};
  for (const k of Object.keys(v)) if (!BAD_KEYS.has(k)) out[cleanSave(k)] = cleanSave(v[k], depth + 1);
  return out;
}
// Load the save: progress first, then this device's screen preferences on top
const loadedSave = cleanSave(storage.loadGame());
if (loadedSave) { delete loadedSave._sig; Object.assign(state, loadedSave); }
Object.assign(state, cleanSave(storage.loadPrefs()) || {});

// Fix up saves from the previous version: old workers had no income roll
state.companies.forEach(c => {
  c.workers.forEach(w => { if (!w.base) w.base = 3; });
  if (c.candidates && c.candidates.some(x => !x.base)) c.candidates = null;
});

// Old saves had a single tax debt
if (state.taxDebt > 0) {
  state.taxDebts = [{ id: state.nextId++, amount: state.taxDebt, timeLeft: Math.min(state.taxTimeLeft, 300), extended: false }];
}
delete state.taxDebt; delete state.taxTimeLeft;

/* ----- When the game saves -----
   save() only MARKS the game as changed (cheap: it is called all over the code).
   The progress is actually written by flushSave():
     · within 3 seconds after a player action (any click except on the coin)
     · every 30 seconds while the game runs (income, timers…)
     · right away when the tab is hidden or closed
   This keeps the number of writes low, which matters once saves go to a server. ----- */
const SAVE_EVERY = 30000, ACTION_SAVE_DELAY = 3000;
let stopSaving = false;   // set while resetting / loading, so the old game isn't saved again
let saveFailedAt = 0;
let catchingUp = false;   // true while the game clock runs several seconds at once
let saveDirty = false, actionSaveTimer = null, lastPrefs = "";
function save() { if (!stopSaving) saveDirty = true; }
function flushSave() {
  clearTimeout(actionSaveTimer); actionSaveTimer = null;
  if (stopSaving || catchingUp || !saveDirty) return;
  const { progress, prefs } = splitState(state);
  const p = JSON.stringify(prefs);
  if (p !== lastPrefs) { storage.savePrefs(prefs); lastPrefs = p; }
  try {
    storage.saveGame(progress);
    saveDirty = false;
    if (saveFailedAt) { saveFailedAt = 0; const w = document.getElementById("saveWarn"); if (w) w.hidden = true; }
  } catch (e) {
    if (!saveFailedAt) console.warn("Saving failed:", e);
    saveFailedAt = Date.now();
    const w = document.getElementById("saveWarn");
    if (w) {
      w.hidden = false;
      w.innerHTML = `⚠️ <b>Your progress is not being saved</b>: this browser's storage for the game is full.
        Sign in (👤 Profile) to keep it in the ☁️ cloud. <button class="btn small" id="saveWarnOk">OK</button>`;
      $("saveWarnOk").addEventListener("click", () => { w.hidden = true; });
    }
  }
}
setInterval(flushSave, SAVE_EVERY);
document.addEventListener("click", (e) => {   // player actions: save soon (coin clicks are too frequent for that)
  if (e.target.closest && e.target.closest("#coin")) return;
  if (!actionSaveTimer) actionSaveTimer = setTimeout(() => { save(); flushSave(); }, ACTION_SAVE_DELAY);
}, true);
document.addEventListener("visibilitychange", () => { if (document.hidden) flushSave(); });
window.addEventListener("pagehide", flushSave);
window.addEventListener("beforeunload", flushSave);

/* =====================================================================
   HELPERS
   ===================================================================== */
const $ = (id) => document.getElementById(id);
// Plain whole number (used for XP and counts)
const fmtNum = (n) => Math.floor(n).toLocaleString();

// Money: shown in the biggest coin that fits.
//   under 1M          -> "950,000"        (bcoin)
//   1M  to 1M scoin   -> "3.4 scoin"      (1 scoin = 1,000,000 bcoin)
//   1M scoin to 1M gcoin -> "10,956.92 gcoin" (1 gcoin = 1,000,000 scoin)
//   1M gcoin and up   -> "2.5 pcoin"      (1 pcoin = 1,000,000 gcoin)
// 🥉 bcoin = bronze, 🥈 scoin = silver, 🥇 gcoin = gold, 💎 pcoin = platinum
// Never rounds up, so it never shows more than you have.
const SCOIN = 1e6, GCOIN = 1e12, PCOIN = 1e18;
// scoinFrom: from which amount to switch from bcoin to scoin (1M by default)
function splitCoins(n, scoinFrom = SCOIN) {
  const a = Math.abs(n);
  if (a < scoinFrom) return [Math.floor(a).toLocaleString(), "bcoin"];
  const unit = a < GCOIN ? SCOIN : a < PCOIN ? GCOIN : PCOIN;
  const v = Math.floor(a / unit * 100) / 100;
  return [v.toLocaleString(undefined, { maximumFractionDigits: 2 }), unit === SCOIN ? "scoin" : unit === GCOIN ? "gcoin" : "pcoin"];
}
const fmt = (n) => {
  const [num, unit] = splitCoins(n);
  return (n < 0 ? "−" : "") + num + (unit === "bcoin" ? "" : " " + unit);
};
// Money with its coin name always written out ("2,000 bcoin", "3.4 scoin")
const coins = (n) => { const [num, unit] = splitCoins(n); return (n < 0 ? "−" : "") + num + " " + unit; };
const randomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];
const typeOf = (company) => BUSINESS_TYPES.find(t => t.id === company.typeId);

// Accountant and HR count as 2 of the max employees
const maxWorkers = (company) => typeOf(company).maxEmployees - (typeOf(company).noStaff ? 0 : 2) + (lawCount("employment") > 0 ? 1 : 0);
const staffReady = (company) => !!typeOf(company).noStaff || !!(company.accountant && company.hr);   // can hire workers and earn

const ownedOf = (typeId) => state.companies.filter(c => c.typeId === typeId).length;
const carWashWorkers = () => state.companies
  .filter(c => c.typeId === "carwash").reduce((a, c) => a + c.workers.length, 0);

// How many of this business you are allowed to own right now
const allowedToOwn = (t) => Math.min(t.maxOwned, t.unlock ? t.unlock() : t.maxOwned);

// Price of the next business of this type: 1000, then 2000, then 4000
function businessPrice(type) {
  const owned = state.companies.filter(c => c.typeId === type.id).length;
  return type.price * Math.pow(type.priceMultiplier || 1, owned);
}

function hireCost(company) {
  const t = typeOf(company);
  let cost = t.hireBaseCost + t.hireCostStep * company.workers.length;
  return applyTalentDiscount(company, cost);
}

// Pick a random trait using each trait's chance.
// The Friendship expert doubles the Friendship chance; other traits shrink to make room.
const LEGEND_CHANCE = 1 / 100;
const CONCIERGE_MAX = 5; // most Concierges a hotel can have
const conciergeCount = (company) => (company.workers || []).filter(w => w.trait === "concierge").length;
function rollTrait(company) {
  // The Legend: always exactly 1 in 100, in every business
  if (Math.random() < LEGEND_CHANCE) return "legend";

  // Only traits this business can have, scaled so the chances add up to 1
  const chances = {};
  for (const key in TRAITS) {
    const t = TRAITS[key];
    if (t.onlyFor && !t.onlyFor.includes(company.typeId)) continue;
    if (key === "concierge" && conciergeCount(company) >= CONCIERGE_MAX) continue;
    chances[key] = t.chance;
  }
  const scale = (sum) => { for (const k in chances) chances[k] /= sum; };
  scale(Object.values(chances).reduce((a, b) => a + b, 0));

  if (company.hr === "friendship") {
    const oldF = chances.friendship;
    const newF = Math.min(oldF * 2, 1);
    const shrink = (1 - newF) / (1 - oldF);
    for (const key in chances) chances[key] = key === "friendship" ? newF : chances[key] * shrink;
  }

  let roll = Math.random();
  for (const key in chances) {
    if (roll < chances[key]) return key;
    roll -= chances[key];
  }
  return "bully"; // only reached through tiny rounding errors
}

// Random whole number from min to max (both included)
const randomInt = (min, max) => min + Math.floor(Math.random() * (max - min + 1));

function makeCandidates(company) {
  const t = typeOf(company);
  const list = [];
  for (let i = 0; i < 3; i++) {
    list.push({
      id: state.nextId++,
      name: randomItem(FIRST_NAMES),
      trait: rollTrait(company),
      base: randomInt(t.minIncome, t.maxIncome),
    });
  }
  return list;
}

// New candidates cost the same as hiring the next worker (Talent specialist discount included).
// The price does not go up when you refresh.
function refreshCost(company) {
  return hireCost(company);
}

// Talent acquisition specialist: hiring and refreshing cost 30% less
const TALENT_DISCOUNT = 0.30;
function applyTalentDiscount(company, cost) {
  if (company.hr === "talent") cost *= 1 - TALENT_DISCOUNT;
  return Math.round(cost);
}
