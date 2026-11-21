/* =====================================================================
   🚀 NEBULA STRIKE (🎮 Mini-games): a side-scrolling space shooter.
   - Unlock: build the 🚀 Space Mission Center once. It stays unlocked for good (also after a prestige).
   - 3 levels, each ending with a boss. Beating a level unlocks the next one. Levels are free to play.
     Lose every life and the level starts over from the beginning (the ✨ stardust you picked up is kept).
   - ✨ Stardust: dropped by enemies and paid for clearing a level. It buys ships and upgrades;
     every ship has its own upgrades.
   - 💰 Money: the first clear of a level pays SH_LEVELS[].first minutes of income, every later clear
     .again minutes (income = the Gold Mine Dig base: business income over the last minute).
   - 🛡️ Shield: usable every 15 s; it stays up 1.5 s and blocks the next hit, then breaks.
   This file: save data, ships, upgrades, levels and the 🛸 hangar page.
   js/31-shooter-art.js draws the pictures, js/32-shooter-game.js runs the game.
   ===================================================================== */
if (!state.shooter) state.shooter = {};
const SH = state.shooter;
SH.done = SH.done || 0;            // levels cleared (0–3); level n+1 is open
SH.dust = SH.dust || 0;            // ✨ stardust you have
SH.dustAll = SH.dustAll || 0;      // ✨ stardust earned in total
SH.ship = SH.ship || "sparrow";
SH.owned = SH.owned || ["sparrow"];
SH.up = SH.up || {};               // { ship: { upgrade: level } }
SH.best = SH.best || {};           // fastest clear per level (seconds)
SH.clears = SH.clears || {};       // clears per level
for (const k of ["runs", "wins", "kills", "blocks", "earned", "perfect", "bossKills"]) SH[k] = SH[k] || 0;
if (typeof SH.auto !== "boolean") SH.auto = true;   // 🔫 auto-fire (otherwise hold Space)
// ⌨️ key bindings for the shield and the special weapon: null = the default keys, otherwise { code, label } picked in the hangar
SH.bind = SH.bind || { shield: null, special: null };
const SH_BIND_DEF = { shield: { codes: ["ShiftLeft", "ShiftRight", "KeyK"], label: "Shift / K" }, special: { codes: ["KeyX", "KeyL"], label: "X / L" } };
// keys that can't be used: moving, pausing and menu keys
const SH_BIND_BLOCK = new Set(["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "KeyA", "KeyD", "KeyW", "KeyS", "KeyP", "Escape", "Space", "KeyJ", "Tab", "MetaLeft", "MetaRight", "ContextMenu"]);
const shBindCodes = (a) => (SH.bind[a] ? [SH.bind[a].code] : SH_BIND_DEF[a].codes);
const shBindLabel = (a) => (SH.bind[a] ? SH.bind[a].label : SH_BIND_DEF[a].label);
function shKeyLabel(e) {
  const names = { Space: "Space", ShiftLeft: "Shift", ShiftRight: "Right Shift", ControlLeft: "Ctrl", ControlRight: "Right Ctrl", AltLeft: "Alt", AltRight: "Alt Gr",
    Enter: "Enter", Backspace: "Backspace", CapsLock: "Caps Lock", Tab: "Tab" };
  if (names[e.code]) return names[e.code];
  if (/^Key[A-Z]$/.test(e.code)) return e.code.slice(3);
  if (/^Digit\d$/.test(e.code)) return e.code.slice(5);
  if (/^Numpad/.test(e.code)) return "Num " + e.code.slice(6);
  return e.key && e.key.length === 1 ? e.key.toUpperCase() : e.code;
}
let shBinding = null;   // the action waiting for a key press in the hangar

/* ----- 🛸 SHIPS -----
   speed: px / sec · hearts: lives · rate: shots / sec · dmg: damage per shot · hit: hitbox radius · cost: upgrade price factor */
const SH_SHIPS = {
  sparrow:   { name: "Sparrow",   price: 0,    speed: 300, hearts: 3, gun: "single", rate: 6,   dmg: 1,    w: 92,  hit: 14, cost: 1,
    desc: "Balanced starter ship with one steady gun." },
  dart:      { name: "Dart",      price: 600,  speed: 390, hearts: 2, gun: "twin",   rate: 8,   dmg: 0.55, w: 116, hit: 10, cost: 1.25,
    desc: "Very fast and small, with twin rapid-fire guns, but only 2 lives." },
  bulwark:   { name: "Bulwark",   price: 1500, speed: 225, hearts: 5, gun: "heavy",  rate: 3.5, dmg: 1.6,  w: 100, hit: 19, cost: 1.25,
    desc: "A slow flying fortress with a heavy double cannon and 5 lives." },
  sovereign: { name: "Sovereign", price: 5000, speed: 340, hearts: 4, gun: "royal",  rate: 7,   dmg: 1.4,  w: 126, hit: 12, cost: 1.75, needs: 3,
    desc: "The legendary golden ship: fast, 4 lives and an energy cannon with side bolts." },
};
const SH_SHIP_IDS = Object.keys(SH_SHIPS);
// shots per second × damage (side bolts included): used for the firepower bar
const shDps = (id) => { const s = SH_SHIPS[id]; return s.rate * s.dmg * (s.gun === "twin" || s.gun === "heavy" ? 2 : 1) + (s.gun === "royal" ? s.rate * s.dmg * 0.32 * 2 : 0); };

/* ----- ⬆️ UPGRADES (bought separately for every ship, paid with ✨ stardust; price × the ship's cost factor) ----- */
const SH_UPS = {
  dmg:        { icon: "💥", name: "Damage",          max: 5, costs: [40, 90, 160, 260, 400], eff: (l) => l ? `+${l * 15}% damage` : "normal damage" },
  rate:       { icon: "🔫", name: "Fire rate",       max: 5, costs: [40, 90, 160, 260, 400], eff: (l) => l ? `+${l * 10}% fire rate` : "normal fire rate" },
  hull:       { icon: "❤️", name: "Hull armour",     max: 2, costs: [200, 450],              eff: (l) => l ? `+${l} ${l === 1 ? "life" : "lives"}` : "no extra lives" },
  shieldCd:   { icon: "🛡️", name: "Shield recharge", max: 5, costs: [50, 110, 190, 300, 450], eff: (l) => `shield every ${15 - l} sec` },
  shieldTime: { icon: "⏱️", name: "Shield time",     max: 5, costs: [50, 110, 190, 300, 450], eff: (l) => `shield stays up ${(1.5 + l * 0.1).toFixed(1)} sec` },
  ammo:       { icon: "🚀", name: "Special ammo",    max: 3, costs: [80, 180, 320],          eff: (l) => l ? `+${l * 25}% special weapon ammo` : "normal special weapon ammo" },
  magnet:     { icon: "🧲", name: "Stardust magnet", max: 3, costs: [60, 150, 300],          eff: (l) => ["no magnet", "small pull range", "medium pull range", "large pull range"][l] },
};
const SH_UP_IDS = Object.keys(SH_UPS);
const shUp = (ship, k) => ((SH.up[ship] || {})[k] || 0);
const shUpCost = (ship, k) => { const l = shUp(ship, k), U = SH_UPS[k]; return l >= U.max ? 0 : Math.round(U.costs[l] * SH_SHIPS[ship].cost / 5) * 5; };

/* ----- 🗺️ LEVELS (len = seconds of waves before the boss; first / again = minutes of income) ----- */
const SH_LEVELS = [
  { n: 1, name: "Scrap Belt",       boss: "Scrap Crab", img: "boss-crab",    diff: "🟢 Easy",   time: "about 5 min",   len: 255, first: 30,  again: 3, dustFirst: 100, dustAgain: 30 },
  { n: 2, name: "Hive Nebula",      boss: "Hive Queen", img: "boss-hive",    diff: "🟠 Medium", time: "about 6–7 min", len: 345, first: 60,  again: 5, dustFirst: 200, dustAgain: 60 },
  { n: 3, name: "Crimson Fortress", boss: "The Taxman", img: "boss-taxman",  diff: "🔴 Hard",   time: "about 6–7 min", len: 330, first: 120, again: 8, dustFirst: 400, dustAgain: 100 },
];
const shReward = (L, first) => Math.round((first ? L.first : L.again) * 60 * mineBase());

function shUnlocked() {
  if (!SH.unlocked && state.science && state.science.space) SH.unlocked = true;
  return !!SH.unlocked;
}
const shClock = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
const shDustIco = `<span class="shDustIco">✨</span>`;

/* ----- 🛸 HANGAR PAGE ----- */
function renderShooter() {
  const v = $("shooterView"); if (!v) return;
  if (!shUnlocked()) {
    v.innerHTML = `<button class="btn ghost small gamesBack" data-games-back>← 🎮 Mini-games</button><p>🔒 Build the 🚀 Space Mission Center (💰 Income → 🔬 Science) first.</p>`;
    return;
  }
  if (typeof shR !== "undefined" && shR) return shRenderPlay();
  const ship = SH.ship;
  v.innerHTML = `<button class="btn ghost small gamesBack" data-games-back>← 🎮 Mini-games</button>
    <div class="card shIntro">
      <h2>🚀 Nebula Strike</h2>
      <p>Fly through three sectors of space, shoot everything that moves and defeat the boss at the end of each level.
        Lose all your lives and the level starts over from the beginning.</p>
      <p class="muted">🛡️ <b>Shield:</b> every ${15 - shUp(ship, "shieldCd")} sec. It stays up ${(1.5 + shUp(ship, "shieldTime") * 0.1).toFixed(1)} sec and blocks the next hit, so time it well.
        📦 Shoot the glowing supply ships for special weapons: 🚀 homing missiles, ⚡ laser beam and 💠 nova spread.</p>
      <div class="shKeys muted">⌨️ Move: arrows or WASD · ⏸️ Pause: P or Esc<br>
        📱 Phone: drag anywhere on the screen to fly, and tap the buttons for the shield and special weapon.</div>
      <div class="shBinds">${["shield", "special"].map(k => `<div class="shBind">
          <span>${k === "shield" ? "🛡️ Shield" : "🚀 Special weapon"}</span>
          <button class="btn small ${shBinding === k ? "waiting" : ""}" data-sh-bind="${k}">${shBinding === k ? "Press a key…" : `⌨️ ${shBindLabel(k)}`}</button>
        </div>`).join("")}
        ${SH.bind.shield || SH.bind.special ? `<button class="btn ghost small" data-sh-bind="reset">↺ Default keys</button>` : ""}
      </div>
      <label class="shAuto"><input type="checkbox" data-sh="auto" ${SH.auto ? "checked" : ""}> 🔫 Auto-fire (turn it off to shoot by holding Space)</label>
      <div class="shDustBig">${shDustIco} Stardust: <b>${SH.dust.toLocaleString()}</b></div>
    </div>
    <div class="shLevels">${SH_LEVELS.map(L => {
      const open = SH.done >= L.n - 1, done = SH.done >= L.n;
      return `<div class="card shLevel ${open ? "" : "locked"} ${done ? "done" : ""}">
        <div class="shBossPic"><img src="assets/shooter/${L.img}.webp" alt="${L.boss}"></div>
        <h3>Level ${L.n}: ${L.name}</h3>
        <div class="muted">${L.diff} · ${L.time} · Boss: <b>${L.boss}</b></div>
        <div class="shLvReward">${done
          ? `✅ Cleared${SH.best[L.n] ? ` · Best time ${shClock(SH.best[L.n])}` : ""}<br>Play again: 💰 ${fmt(shReward(L, false))} + ${shDustIco} ${L.dustAgain}`
          : `First clear: 💰 <b>${fmt(shReward(L, true))}</b> + ${shDustIco} ${L.dustFirst}`}</div>
        ${open ? `<button class="btn" data-sh-play="${L.n}">▶ Play</button>` : `<button class="btn" disabled>🔒 Beat level ${L.n - 1} first</button>`}
      </div>`;
    }).join("")}</div>
    <div class="card shHangar">
      <h3>🛸 Hangar</h3>
      <div class="shShips">${SH_SHIP_IDS.map(id => {
        const s = SH_SHIPS[id], own = SH.owned.includes(id), sel = id === ship, locked = s.needs && SH.done < s.needs;
        const bar = (label, val) => `<div class="shBar"><span>${label}</span><i><b style="width:${Math.round(Math.min(1, val) * 100)}%"></b></i></div>`;
        return `<div class="shShip ${sel ? "sel" : ""} ${own ? "" : "notOwned"}">
          <div class="shShipPic"><img src="assets/shooter/ship-${id}.webp" alt="${s.name}"></div>
          <b>${s.name}</b><div class="muted shShipDesc">${s.desc}</div>
          ${bar("Speed", s.speed / 400)}${bar("Lives", s.hearts / 5)}${bar("Firepower", shDps(id) / 16)}
          ${sel ? `<button class="btn small" disabled>✅ Flying</button>`
            : own ? `<button class="btn small" data-sh-ship="${id}">🛸 Fly this ship</button>`
            : locked ? `<button class="btn small" disabled>🔒 Beat level ${s.needs} · ${shDustIco} ${s.price.toLocaleString()}</button>`
            : `<button class="btn small" data-sh-buy="${id}" ${SH.dust >= s.price ? "" : "disabled"}>Buy · ${shDustIco} ${s.price.toLocaleString()}</button>`}
        </div>`;
      }).join("")}</div>
      <h3 class="shUpTitle">⬆️ Upgrades for the ${SH_SHIPS[ship].name}</h3>
      <p class="muted">Every ship has its own upgrades. They are paid with ${shDustIco} stardust.</p>
      <div class="mineUpGrid">${SH_UP_IDS.map(k => {
        const U = SH_UPS[k], l = shUp(ship, k), c = shUpCost(ship, k);
        return `<div class="mineUp ${c ? "" : "maxed"}">
          <div class="mineUpHead"><span class="mineUpIcon">${U.icon}</span><b>${U.name}</b><span class="mineUpLv">Lv ${l}/${U.max}</span></div>
          <div class="mineUpEff">Now: ${U.eff(l)}</div>
          ${c ? `<div class="mineUpEff next">Next: ${U.eff(l + 1)}</div>
            <button class="btn small" data-sh-up="${k}" ${SH.dust >= c ? "" : "disabled"}>⬆️ Upgrade · ${shDustIco} ${c.toLocaleString()}</button>`
          : `<div class="mineUpEff next">✅ Max level</div>`}
        </div>`;
      }).join("")}</div>
    </div>
    <p class="muted shStatsLine">Runs: ${SH.runs} · Levels won: ${SH.wins} · Enemies destroyed: ${SH.kills.toLocaleString()} · Hits blocked: ${SH.blocks} · Stardust earned: ${SH.dustAll.toLocaleString()} · Money earned: ${fmt(SH.earned)}</p>`;
}

function shBuyShip(id) {
  const s = SH_SHIPS[id];
  if (!s || SH.owned.includes(id) || (s.needs && SH.done < s.needs) || SH.dust < s.price) return;
  SH.dust -= s.price; SH.owned.push(id); SH.ship = id;
  showNotice(`🛸 You bought the ${s.name}!`);
  save(); renderShooter();
}
function shBuyUp(k) {
  const ship = SH.ship, c = shUpCost(ship, k);
  if (!c || SH.dust < c) return;
  SH.dust -= c;
  SH.up[ship] = SH.up[ship] || {}; SH.up[ship][k] = shUp(ship, k) + 1;
  showNotice(`${SH_UPS[k].icon} ${SH_SHIPS[ship].name}: ${SH_UPS[k].name} level ${SH.up[ship][k]}: ${SH_UPS[k].eff(SH.up[ship][k])}!`);
  save(); renderShooter();
}
$("shooterView").addEventListener("click", (e) => {
  const t = e.target;
  const play = t.closest("[data-sh-play]"); if (play && !play.disabled) return shStart(+play.dataset.shPlay);
  const buy = t.closest("[data-sh-buy]"); if (buy && !buy.disabled) return shBuyShip(buy.dataset.shBuy);
  const sel = t.closest("[data-sh-ship]"); if (sel && SH.owned.includes(sel.dataset.shShip)) { SH.ship = sel.dataset.shShip; save(); return renderShooter(); }
  const up = t.closest("[data-sh-up]"); if (up && !up.disabled) return shBuyUp(up.dataset.shUp);
});
// ⌨️ change a key: click the button, then press the new key (Esc cancels)
document.addEventListener("click", (e) => {
  const b = e.target.closest("[data-sh-bind]"); if (!b) return;
  if (b.dataset.shBind === "reset") { SH.bind = { shield: null, special: null }; shBinding = null; save(); return renderShooter(); }
  shBinding = shBinding === b.dataset.shBind ? null : b.dataset.shBind; renderShooter();
});
document.addEventListener("keydown", (e) => {
  if (!shBinding) return;
  if (state.view !== "games" || state.gamePage !== "shooter" || !$("modal").hidden) { shBinding = null; return; }
  e.preventDefault(); e.stopPropagation();
  if (e.repeat) return;
  const a = shBinding, other = a === "shield" ? "special" : "shield";
  if (e.code === "Escape") { shBinding = null; return renderShooter(); }
  if (SH_BIND_BLOCK.has(e.code)) return showNotice("⌨️ That key is used to move, shoot or pause. Pick another one.");
  if (shBindCodes(other).includes(e.code)) return showNotice(other === "shield" ? "⌨️ That key is already used for the shield. Pick another one." : "⌨️ That key is already used for the special weapon. Pick another one.");
  SH.bind[a] = { code: e.code, label: shKeyLabel(e) };
  shBinding = null; save(); renderShooter();
}, true);
$("shooterView").addEventListener("change", (e) => {
  if (e.target.matches("[data-sh=auto]")) { SH.auto = e.target.checked; save(); }
});
