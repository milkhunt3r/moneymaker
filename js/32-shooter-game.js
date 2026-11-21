/* =====================================================================
   🚀 NEBULA STRIKE: the game (canvas 960 × 540, fixed 60 steps per second).
   - A level is a stream of enemy waves (picked at random from the level's list, closer together as it goes on),
     📦 supply ships every 20–28 s (special weapon or a life), then a ⚠️ boss.
   - The run is not saved: leaving the page pauses it, reloading drops it (levels are free to replay).
   ===================================================================== */
const SHW = 960, SHH = 540, SH_DT = 1 / 60;
let shR = null;                                  // the run in progress
const shKeys = {};
let shRaf = 0, shLast = 0, shAcc = 0, shCtx = null, shCanvas = null, shTouchUI = false;
const shRand = (a, b) => a + Math.random() * (b - a);
const shPick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const shClamp = (v, a, b) => Math.max(a, Math.min(b, v));

/* ----- per-level setup: waves [weight, from second], gap between waves (start → end), speed, enemy fire, enemy HP, bullet speed ----- */
const SH_CFG = [
  { waves: { line: [3, 0], vee: [2, 20], sine: [2, 35], rocks: [2, 0], gunners: [1.5, 50], mines: [1, 110] },
    gap: [4.2, 2.8], spd: 1, fire: 0.6, hp: 1, bs: 210, boss: "crab" },
  { waves: { line: [2, 0], vee: [2, 0], sine: [2, 0], rocks: [1.5, 0], gunners: [2, 0], mines: [1.5, 0], column: [1.5, 30], brute: [1, 60], swarm: [1, 90] },
    gap: [3.6, 2.3], spd: 1.1, fire: 0.85, hp: 1.6, bs: 250, boss: "hive" },
  { waves: { line: [1.5, 0], vee: [2, 0], sine: [2, 0], rocks: [1, 0], gunners: [2, 0], mines: [1.5, 0], column: [1.5, 0], brute: [1.5, 40], swarm: [2, 0], homers: [2, 30] },
    gap: [3.0, 1.8], spd: 1.2, fire: 1.1, hp: 2.3, bs: 285, boss: "taxman" },
];
// enemy base stats (HP × the level's hp factor; ✨ stardust × 1 / 1.5 / 2 by level)
const SH_EN = {
  drone: { hp: 2, r: 18, dust: 1 }, darter: { hp: 1, r: 14, dust: 1 }, weaver: { hp: 2, r: 19, dust: 2 },
  gunner: { hp: 5, r: 24, dust: 4 }, mine: { hp: 3, r: 16, dust: 2 }, brute: { hp: 28, r: 38, dust: 12 },
  homer: { hp: 2, r: 15, dust: 2 }, tiny: { hp: 1, r: 11, dust: 1 }, carrier: { hp: 4, r: 24, dust: 3 },
  rock: { hp: 4, r: 24, dust: 1 }, tmissile: { hp: 2, r: 12, dust: 0 },
};
// 🎁 special weapons (ammo × the Special ammo upgrade)
const SH_SPECIAL = {
  missile: { ammo: 8, icon: "🚀", name: "Homing missiles", cd: 0.25 },
  laser:   { ammo: 3, icon: "⚡", name: "Laser beam", cd: 0.9 },
  spread:  { ammo: 6, icon: "💠", name: "Nova spread", cd: 0.35 },
};

function shStats() {
  const id = SH.ship, s = SH_SHIPS[id], u = (k) => shUp(id, k);
  return { id, speed: s.speed, hearts: s.hearts + u("hull"), dmg: s.dmg * (1 + 0.15 * u("dmg")), dmgMul: 1 + 0.15 * u("dmg"),
    rate: s.rate * (1 + 0.1 * u("rate")), shieldCd: 15 - u("shieldCd"), shieldTime: 1.5 + 0.1 * u("shieldTime"),
    ammo: 1 + 0.25 * u("ammo"), magnet: [0, 90, 150, 220][u("magnet")], gun: s.gun, w: s.w, hit: s.hit, img: "ship-" + id };
}

/* ---------------------------------------------------------------------
   ▶ START / END
   --------------------------------------------------------------------- */
function shStart(lv) {
  if (!shUnlocked() || lv < 1 || lv > 3 || lv > SH.done + 1) return;
  const st = shStats(), L = SH_LEVELS[lv - 1], cfg = SH_CFG[lv - 1];
  shR = { lv, L, cfg, st, t: 0, phase: "intro", bgX: 0,
    p: { x: 150, y: SHH / 2, hearts: st.hearts, inv: 2, cool: 0, shield: 0, shieldCd: 0, special: null, ammo: 0, spCool: 0, tdx: 0, tdy: 0 },
    en: [], pb: [], eb: [], fx: [], pk: [], beams: [], laser: 0, boss: null,
    nextWave: 3, nextCarrier: 16, kills: 0, dust: 0, hits: 0, blocks: 0, shake: 0, banner: null, paused: false, end: null,
    stars: Array.from({ length: 90 }, (_, i) => ({ x: Math.random() * SHW, y: Math.random() * SHH, z: i % 3 })),
    planet: { x: SHW + 200, y: shRand(120, 420), r: Math.round(shRand(50, 90)), next: 40 } };
  shR.banner = { big: t(`Level ${lv}`), small: t(L.name), life: 3 };
  SH.runs++; save();
  [st.img, L.img, ...(lv === 3 ? ["boss-taxman-dmg"] : [])].forEach(shImg);
  renderShooter(); shKick();
}
function shQuit() {
  shR = null; shStop(); save(); renderShooter();
}
function shWin() {
  const R = shR, L = R.L, first = SH.done < R.lv;
  const money = shReward(L, first), dust = first ? L.dustFirst : L.dustAgain;
  state.money += money; clickedThisSecond += money; SH.earned += money;   // counts as income (taxes)
  SH.dust += dust; SH.dustAll += dust; R.dust += dust;
  if (first) SH.done = R.lv;
  SH.wins++; SH.bossKills++; SH.clears[R.lv] = (SH.clears[R.lv] || 0) + 1;
  if (!R.hits) SH.perfect++;
  if (!SH.best[R.lv] || R.t < SH.best[R.lv]) SH.best[R.lv] = Math.round(R.t);
  R.end = { win: true, first, money, bonus: dust };
  save(); updateCounter(); shShowEnd();
}
function shLose() {
  const R = shR;
  R.end = { win: false, pct: Math.min(99, Math.floor(R.t / (R.L.len + 60) * 100)) };
  save(); shShowEnd();
}

/* ---------------------------------------------------------------------
   👾 SPAWNING
   --------------------------------------------------------------------- */
function shAdd(type, x, y, o = {}) {
  const R = shR, d = SH_EN[type];
  const e = { type, x, y, y0: y, vx: -120, vy: 0, t: 0, hp: d.hp * (type === "carrier" ? 1 : R.cfg.hp), r: d.r, dust: d.dust, flash: 0, rot: 0, ph: 0, ...o };
  R.en.push(e); return e;
}
const SH_WAVES = {
  line(R, s) { const y = shRand(70, SHH - 70); for (let i = 0; i < 5; i++) shAdd("drone", SHW + 40 + i * 55, y, { vx: -150 * s, ph: i * 0.7 }); },
  vee(R, s) { const y = shRand(110, SHH - 110); [0, 1, -1, 2, -2].forEach((k) => shAdd("darter", SHW + 40 + Math.abs(k) * 42, y + k * 34, { vx: -280 * s })); },
  sine(R, s) { const y = shRand(150, SHH - 150), amp = shRand(70, 110); for (let i = 0; i < 6; i++) shAdd("weaver", SHW + 40 + i * 58, y, { vx: -130 * s, amp, ph: -i * 0.55 }); },
  gunners(R, s) {
    const n = R.lv === 3 ? 3 : 2, ys = [shRand(80, 200), shRand(340, 460), shRand(220, 320)];
    for (let i = 0; i < n; i++) shAdd("gunner", SHW + 50 + i * 30, ys[i], { vx: -160 * s, stopX: shRand(700, 830), stay: 5 + R.lv, fireAt: 0.8 + i * 0.5 });
  },
  rocks(R, s) {
    const n = 3 + Math.floor(Math.random() * 3);
    for (let i = 0; i < n; i++) {
      const size = Math.round(shRand(18, 34));
      shAdd("rock", SHW + 40 + i * shRand(40, 90), shRand(50, SHH - 50), { vx: -shRand(90, 170) * s, vy: shRand(-25, 25), r: size * 0.85, hp: Math.round(size / 6) * R.cfg.hp, size, v: i % 4, spin: shRand(-1.5, 1.5) });
    }
  },
  mines(R, s) { for (let i = 0; i < 3 + (R.lv > 1 ? 1 : 0); i++) shAdd("mine", SHW + 40 + i * 70, shRand(70, SHH - 70), { vx: -75 * s }); },
  brute(R, s) { shAdd("brute", SHW + 70, shRand(140, SHH - 140), { vx: -110 * s, stopX: shRand(740, 800), stay: 9, fireAt: 1.2 }); },
  column(R, s) {
    const gap = Math.floor(shRand(1, 6));
    for (let i = 0; i < 8; i++) if (i !== gap && i !== gap + 1) shAdd("drone", SHW + 40, 40 + i * 65, { vx: -130 * s, ph: 0, still: true });
  },
  swarm(R, s) {
    const top = Math.random() < 0.5, y = top ? shRand(90, 200) : shRand(340, 450);
    for (let i = 0; i < 9; i++) shAdd("tiny", SHW + 30 + i * 34, y, { vx: -240 * s, amp: 60, ph: -i * 0.45, freq: 3.2 });
  },
  homers(R, s) { for (let i = 0; i < 3; i++) shAdd("homer", SHW + 40 + i * 60, shRand(60, SHH - 60), { vx: -200 * s, ang: Math.PI }); },
};
function shSpawnWave(R) {
  const list = Object.entries(R.cfg.waves).filter(([, [, from]]) => R.t >= from);
  let sum = list.reduce((a, [, [w]]) => a + w, 0), r = Math.random() * sum;
  for (const [k, [w]] of list) { r -= w; if (r <= 0) { SH_WAVES[k](R, R.cfg.spd); R.lastWave = k; return; } }
}

/* ---------------------------------------------------------------------
   🔫 SHOOTING
   --------------------------------------------------------------------- */
function shEnemyShot(x, y, ang, spd, kind = "eb", o = {}) {
  shR.eb.push({ x, y, vx: Math.cos(ang) * spd, vy: Math.sin(ang) * spd, r: kind === "ebBig" ? 10 : kind === "coin" ? 8 : 6, kind, ...o });
}
const shAim = (x, y) => Math.atan2(shR.p.y - y, shR.p.x - x);
function shPlayerShot(x, y, vx, vy, dmg, kind, r) { shR.pb.push({ x, y, vx, vy, dmg, kind, r }); }
function shGun(R) {
  const P = R.p, st = R.st, nx = P.x + st.w * 0.42;
  if (st.gun === "single") shPlayerShot(nx, P.y + 3, 760, 0, st.dmg, "single", 5);
  if (st.gun === "twin") { shPlayerShot(nx, P.y - 4, 900, 0, st.dmg, "twin", 4); shPlayerShot(nx, P.y + 6, 900, 0, st.dmg, "twin", 4); }
  if (st.gun === "heavy") { shPlayerShot(nx, P.y - 9, 620, 0, st.dmg, "heavy", 7); shPlayerShot(nx, P.y + 9, 620, 0, st.dmg, "heavy", 7); }
  if (st.gun === "royal") {
    shPlayerShot(nx + 4, P.y + 1, 820, 0, st.dmg, "royal", 6);
    [-0.14, 0.14].forEach(a => shPlayerShot(nx - 20, P.y, Math.cos(a) * 760, Math.sin(a) * 760, st.dmg * 0.32, "side", 4));
  }
}
function shUseSpecial(R) {
  const P = R.p; if (!P.special || P.ammo <= 0 || P.spCool > 0 || R.phase === "dead") return;
  const S = SH_SPECIAL[P.special], m = R.st.dmgMul, nx = P.x + R.st.w * 0.4;
  P.spCool = S.cd; P.ammo--;
  if (P.special === "missile") shPlayerShot(nx, P.y, 420, 0, 8 * m, "missile", 8);
  if (P.special === "laser") R.laser = 0.6;
  // 💠 nova spread: 9 bullets in a fan that pierce through enemies (each bullet hits every enemy once)
  if (P.special === "spread") for (let i = 0; i < 9; i++) { const a = -0.28 + i * 0.07; shPlayerShot(nx, P.y, Math.cos(a) * 640, Math.sin(a) * 640, 5 * m, "spread", 7); R.pb[R.pb.length - 1].pierce = new Set(); }
  if (P.ammo <= 0) P.special = null;
}
function shUseShield(R) {
  const P = R.p; if (P.shieldCd > 0 || R.phase === "dead" || R.end) return;
  P.shield = R.st.shieldTime; P.shieldCd = R.st.shieldCd;
}

/* ---------------------------------------------------------------------
   💥 HITS
   --------------------------------------------------------------------- */
function shFx(x, y, n, col, spd = 160, size = 4) {
  for (let i = 0; i < n; i++) {
    const a = Math.random() * Math.PI * 2, v = spd * (0.3 + Math.random());
    shR.fx.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: 0.4 + Math.random() * 0.4, max: 0.8, r: size * (0.6 + Math.random()), c: col });
  }
}
function shRing(x, y, r, col) { shR.fx.push({ ring: true, x, y, r: r * 0.3, to: r, life: 0.4, max: 0.4, c: col }); }
function shText(x, y, text, col = "#fff") { shR.fx.push({ text, x, y, vy: -40, vx: 0, life: 1.1, max: 1.1, c: col }); }
function shBoom(x, y, r) {
  shFx(x, y, Math.round(8 + r / 2), "#ffd34d", 120 + r * 4, 3 + r / 10);
  shFx(x, y, Math.round(5 + r / 3), "#ff6a2b", 80 + r * 3, 4 + r / 8);
  shRing(x, y, r * 1.6, "rgba(255,220,120,0.9)");
}
function shDrop(k, x, y, v = 0) { shR.pk.push({ k, x, y, v, t: 0, vx: k === "dust" ? -70 + shRand(-30, 30) : -60, vy: k === "dust" ? shRand(-40, 40) : 0 }); }
function shKill(e) {
  const R = shR;
  e.dead = true; R.kills++; SH.kills++;
  shBoom(e.x, e.y, e.r);
  if (e.type === "carrier") {
    const P = R.p, opts = ["missile", "missile", "spread", "spread", "laser", "laser"];
    if (P.hearts < R.st.hearts) opts.push("heart", R.lv === 1 ? "heart" : "laser");
    shDrop(shPick(opts), e.x, e.y);
  }
  if (e.type === "mine" && R.lv > 1) for (let i = 0; i < 8; i++) shEnemyShot(e.x, e.y, i * Math.PI / 4, R.cfg.bs * 0.6);
  const v = e.dust * (1 + 0.5 * (R.lv - 1));
  if (v && (e.dust > 1 || Math.random() < 0.55)) {
    const n = Math.min(4, Math.ceil(v / 2)), each = Math.max(1, Math.round(v / n));
    for (let i = 0; i < n; i++) shDrop("dust", e.x + shRand(-10, 10), e.y + shRand(-10, 10), each);
  }
}
function shHitEnemy(e, dmg) {
  e.hp -= dmg; e.flash = 0.07;
  if (e.hp <= 0 && !e.dead) shKill(e);
}
// returns false (no effect: invulnerable), "blocked" (the shield took it) or true (lost a life)
function shHurt(R) {
  const P = R.p;
  if (P.inv > 0 || R.phase === "dead" || R.end) return false;
  if (P.shield > 0) {
    P.shield = 0; P.inv = 0.6; R.blocks++; SH.blocks++;
    shRing(P.x, P.y, 70, "rgba(120,240,255,0.95)"); shFx(P.x, P.y, 14, "#8ff6ff", 200, 3);
    shText(P.x, P.y - 40, t("BLOCKED!"), "#8ff6ff");
    return "blocked";
  }
  P.hearts--; R.hits++; P.inv = 1.6; R.shake = 0.35;
  shBoom(P.x, P.y, 22);
  if (P.hearts <= 0) {
    R.phase = "dead"; R.deadT = 0; shBoom(P.x, P.y, 60); shFx(P.x, P.y, 40, "#ffffff", 260, 3); R.shake = 0.7;
  }
  return true;
}
// boss hit circles in screen space
function shBossCircles(b) {
  const h = b.w * b.def.ar;
  return b.def.circles.map(([dx, dy, r]) => [b.x + dx * b.w, b.y + dy * h, r * b.w]);
}
const shDist2 = (ax, ay, bx, by) => (ax - bx) ** 2 + (ay - by) ** 2;

/* ---------------------------------------------------------------------
   👹 BOSSES
   circles: [x, y, radius] as parts of the picture width/height (from the centre)
   --------------------------------------------------------------------- */
const SH_BOSS = {
  crab:   { name: "Scrap Crab", img: "boss-crab", w: 300, ar: 516 / 800, hp: 240, hx: SHW - 170, dust: 60,
    circles: [[0.13, 0.02, 0.21], [-0.33, -0.25, 0.1], [-0.33, 0.21, 0.1], [0.1, -0.42, 0.06], [0.26, -0.42, 0.06]] },
  hive:   { name: "Hive Queen", img: "boss-hive", w: 390, ar: 376 / 800, hp: 340, hx: SHW - 205, dust: 100,
    circles: [[-0.43, 0.06, 0.06], [-0.3, 0.12, 0.075], [-0.14, 0.17, 0.08], [0.03, 0.17, 0.085], [0.2, 0.16, 0.08], [0.36, 0.12, 0.065]] },
  taxman: { name: "The Taxman", img: "boss-taxman", w: 500, ar: 401 / 800, hp: 1200, hx: SHW - 255, dust: 160,
    circles: [[-0.42, 0.04, 0.045], [-0.28, 0.02, 0.07], [-0.12, 0.0, 0.085], [0.06, 0.0, 0.11], [0.24, 0.02, 0.08], [0.39, 0.04, 0.06]] },
};
function shBossMake(k) {
  const d = SH_BOSS[k];
  return { k, def: d, img: d.img, w: d.w, x: SHW + d.w / 2 + 30, y: SHH / 2, hp: d.hp, max: d.hp, t: 0, at: 0, act: null, i: -1, dur: 1,
    fired: 0, mem: {}, flash: 0, inv: 0, entering: true, phase: 1, lunge: 0 };
}
const shBossPt = (b, dx, dy) => [b.x + dx * b.w, b.y + dy * b.w * b.def.ar];
const shBossH = (b) => b.w * b.def.ar;
function shBossTrack(b, ty, v, dt) {
  const h = shBossH(b), lo = h * 0.35, hi = SHH - h * 0.35;
  b.y += shClamp(shClamp(ty, lo, hi) - b.y, -v * dt, v * dt);
}
// fire `n` times, one every `gap` sec, starting at `from` sec into the attack
function shEvery(b, from, gap, n, fn) { while (b.fired < n && b.at >= from + b.fired * gap) fn(b.fired++); }
const SH_BOSS_SEQ = {
  crab: (b) => b.phase === 1 ? ["spread", "idle", "eye", "idle", "claw", "idle"] : ["spread", "eye", "claw", "idle", "spread", "claw", "idle"],
  hive: (b) => b.phase === 1 ? ["stream", "idle", "brood", "idle", "ring", "idle"] : ["stream", "spiral", "brood", "ring", "idle"],
  taxman: (b) => b.phase === 1 ? ["volley", "idle", "beam", "idle", "volley", "idle"]
    : b.phase === 2 ? ["volley", "coins", "idle", "beam", "missiles", "idle"] : ["curtain", "volley", "beam", "coins", "missiles", "beam", "idle"],
};
const SH_BOSS_ACT = {
  crab: {
    idle(b, dt, R) { b.dur = b.phase === 1 ? 1.1 : 0.8; shBossTrack(b, R.p.y, 55, dt); },
    spread(b, dt, R) {
      b.dur = 2.2; shBossTrack(b, R.p.y, 35, dt);
      const n = b.phase === 1 ? 3 : 5;
      shEvery(b, 0.3, 0.6, 3, () => [[0.1, -0.44], [0.26, -0.44]].forEach(([dx, dy]) => {
        const [x, y] = shBossPt(b, dx, dy), a = shAim(x, y);
        for (let i = 0; i < n; i++) shEnemyShot(x, y, a + (i - (n - 1) / 2) * 0.22, R.cfg.bs * 0.9);
      }));
    },
    eye(b, dt, R) {
      b.dur = 1.7; shBossTrack(b, R.p.y, 30, dt);
      shEvery(b, 0.3, b.phase === 1 ? 0.2 : 0.14, b.phase === 1 ? 6 : 9, () => { const [x, y] = shBossPt(b, -0.03, -0.08); shEnemyShot(x, y, shAim(x, y), R.cfg.bs * 1.1, "ebBig"); });
    },
    claw(b, dt, R) {
      b.dur = 2.4;
      const home = b.def.hx, far = 250;
      if (b.at < 0.8) { b.warn = true; shBossTrack(b, R.p.y, 160, dt); b.x = home; }
      else if (b.at < 1.25) { b.warn = false; const k = (b.at - 0.8) / 0.45; b.x = home + (far - home) * (1 - (1 - k) ** 2); }
      else if (b.at < 1.5) b.x = far;
      else { const k = Math.min(1, (b.at - 1.5) / 0.9); b.x = far + (home - far) * k; }
    },
  },
  hive: {
    idle(b, dt) { b.dur = b.phase === 1 ? 1.0 : 0.7; },
    stream(b, dt, R) {
      b.dur = 2.4;
      if (!b.mem.a) { const [x, y] = shBossPt(b, -0.47, 0.25); b.mem.a = shAim(x, y); }
      shEvery(b, 0.2, 0.1, 22, (i) => {
        const [x, y] = shBossPt(b, -0.47, 0.25), w = Math.sin(i * 0.7) * 0.35;
        shEnemyShot(x, y, b.mem.a + w, R.cfg.bs, "acid");
        if (b.phase === 2) shEnemyShot(x, y, b.mem.a - w, R.cfg.bs, "acid");
      });
    },
    brood(b, dt, R) {
      b.dur = 1.6;
      const pods = [-0.23, -0.13, -0.03, 0.08, 0.17];
      shEvery(b, 0.2, 0.2, b.phase === 1 ? 3 : 5, (i) => {
        const [x, y] = shBossPt(b, pods[i % 5], 0.36);
        shAdd("tiny", x, y, { home: true, vx: -120, vy: 60, ang: Math.PI * 0.8, hp: 2 * R.cfg.hp, dust: 1 });
      });
    },
    ring(b, dt, R) {
      b.dur = 1.3;
      shEvery(b, 0.3, 0.5, b.phase === 1 ? 1 : 2, (k) => {
        const [x, y] = shBossPt(b, 0, 0.1), n = 16;
        for (let i = 0; i < n; i++) shEnemyShot(x, y, (i + k * 0.5) / n * Math.PI * 2, R.cfg.bs * 0.7, "acid");
      });
    },
    spiral(b, dt, R) {
      b.dur = 2.6;
      shEvery(b, 0.2, 0.06, 40, (i) => { const [x, y] = shBossPt(b, 0, 0.1); shEnemyShot(x, y, i * 0.42 + Math.PI * 0.5, R.cfg.bs * 0.65, "acid"); });
    },
  },
  taxman: {
    idle(b, dt) { b.dur = [1.2, 0.9, 0.6][b.phase - 1]; },
    volley(b, dt, R) {
      b.dur = 1.9;
      const tur = [[-0.3, -0.2], [-0.12, -0.26], [0.06, -0.32], [0.24, -0.24], [-0.25, 0.22], [-0.05, 0.28], [0.18, 0.24]];
      shEvery(b, 0.3, 0.8, 2, () => tur.forEach(([dx, dy]) => {
        const [x, y] = shBossPt(b, dx, dy), a = shAim(x, y);
        shEnemyShot(x, y, a, R.cfg.bs * 0.95);
        if (b.phase === 3) { shEnemyShot(x, y, a - 0.2, R.cfg.bs * 0.95); shEnemyShot(x, y, a + 0.2, R.cfg.bs * 0.95); }
      }));
    },
    beam(b, dt, R) {
      const tele = b.phase === 3 ? 0.65 : 0.95;
      b.dur = 1.0 + tele + 1.0;
      const muzzle = () => shBossPt(b, -0.47, -0.165);
      if (b.at < 1.0) { const [, my] = muzzle(); shBossTrack(b, b.y + (R.p.y - my), 170, dt); }
      else if (!b.mem.beam) { const [x, y] = muzzle(); b.mem.beam = true; R.beams.push({ x0: x, y, t: 0, tele, on: 1.0, w: 34 }); }
    },
    coins(b, dt, R) {
      b.dur = 2.2;
      shEvery(b, 0.3, 0.9, 2, () => {
        const [x, y] = shBossPt(b, -0.05, 0);
        for (let i = 0; i < 8; i++) R.eb.push({ x, y, vx: -150 - i * 45 - Math.random() * 30, vy: -320 + Math.random() * 280, g: 320, r: 8, kind: "coin" });
      });
    },
    missiles(b, dt, R) {
      b.dur = 1.4;
      shEvery(b, 0.2, 0.3, 3, (i) => { const [x, y] = shBossPt(b, 0.15 + i * 0.08, i === 1 ? 0.3 : -0.34); shAdd("tmissile", x, y, { vx: -150, ang: Math.PI, hp: 2 * R.cfg.hp }); });
    },
    curtain(b, dt, R) {
      b.dur = 3.2;
      shEvery(b, 0.2, 1.0, 3, () => {
        const g = b.mem.gap = shClamp((b.mem.gap || shRand(100, 440)) + shRand(-150, 150), 90, 450);
        const [x] = shBossPt(b, -0.5, 0);
        for (let y = 14; y < SHH; y += 26) if (Math.abs(y - g) > 58) R.eb.push({ x, y, vx: -R.cfg.bs * 0.8, vy: 0, r: 6, kind: "eb" });
      });
    },
  },
};
function shBossStep(R, b, dt) {
  b.t += dt; b.flash = Math.max(0, b.flash - dt); b.inv = Math.max(0, b.inv - dt);
  if (b.entering) {
    b.x -= 110 * dt; shBossTrack(b, SHH / 2, 60, dt);
    if (b.x <= b.def.hx) { b.x = b.def.hx; b.entering = false; }
    return;
  }
  // phases: crab and hive get angry at 50%, the Taxman at 66% and 33% (then he shows his battle damage)
  const f = b.hp / b.max;
  const ph = b.k === "taxman" ? (f > 0.66 ? 1 : f > 0.33 ? 2 : 3) : (f > 0.5 ? 1 : 2);
  if (ph > b.phase) {
    b.phase = ph; b.inv = 1.0; R.shake = 0.5;
    if (b.k === "taxman" && ph === 3) { b.img = "boss-taxman-dmg"; for (let i = 0; i < 6; i++) shBoom(b.x + shRand(-0.4, 0.4) * b.w, b.y + shRand(-0.3, 0.3) * shBossH(b), 30); }
    R.banner = { big: t("⚠️ " + b.def.name + " is getting angry!"), small: "", life: 2, warn: true };
  }
  if (b.k === "hive") shBossTrack(b, SHH / 2 + 10 + Math.sin(b.t * (b.phase === 1 ? 0.8 : 1.1)) * 120, 120, dt);
  if (b.k === "taxman" && b.act !== "beam") shBossTrack(b, SHH / 2 + Math.sin(b.t * 0.45) * 70, 45, dt);
  b.at += dt;
  if (!b.act || b.at >= b.dur) {
    const seq = SH_BOSS_SEQ[b.k](b);
    b.i = (b.i + 1) % seq.length; b.act = seq[b.i]; b.at = 0; b.fired = 0; b.mem = {}; b.warn = false;
  }
  SH_BOSS_ACT[b.k][b.act](b, dt, R);
}
function shBossKilled(R, b) {
  R.phase = "dying"; R.dieT = 0; b.dead = true; R.eb = []; R.beams = [];
  R.en.forEach(e => { if (!e.dead) { e.dead = true; shBoom(e.x, e.y, e.r); } });
  const d = Math.round(b.def.dust);
  R.dust += d; SH.dust += d; SH.dustAll += d;
  shText(b.x, b.y - 60, `+${d} ✨`, "#ffe66b");
}

/* ---------------------------------------------------------------------
   ⏱️ ONE STEP (1/60 s)
   --------------------------------------------------------------------- */
function shUpdate(dt) {
  const R = shR; if (!R || R.paused) return;
  const P = R.p, st = R.st;
  R.t += dt; R.bgX += dt * (R.phase === "boss" ? 40 : 90);
  R.shake = Math.max(0, R.shake - dt);
  if (R.banner && (R.banner.life -= dt) <= 0) R.banner = null;
  for (const s of R.stars) { s.x -= [25, 60, 130][s.z] * dt * (R.phase === "boss" ? 0.5 : 1); if (s.x < 0) { s.x += SHW; s.y = Math.random() * SHH; } }
  const pl = R.planet; pl.x -= 12 * dt; if (pl.x < -pl.r * 2) { pl.x = SHW + pl.r + shRand(300, 900); pl.y = shRand(100, 440); pl.r = Math.round(shRand(45, 95)); }

  // 🚀 player
  if (R.phase !== "dead") {
    let mx = 0, my = 0;
    if (shKeys.ArrowLeft || shKeys.KeyA) mx--; if (shKeys.ArrowRight || shKeys.KeyD) mx++;
    if (shKeys.ArrowUp || shKeys.KeyW) my--; if (shKeys.ArrowDown || shKeys.KeyS) my++;
    const len = Math.hypot(mx, my) || 1;
    P.x += mx / len * st.speed * dt; P.y += my / len * st.speed * dt;
    // 📱 drag: follow the finger, a little faster than the ship's own speed
    if (P.tdx || P.tdy) {
      const d = Math.hypot(P.tdx, P.tdy), step = Math.min(d, st.speed * 1.8 * dt);
      P.x += P.tdx / d * step; P.y += P.tdy / d * step; P.tdx -= P.tdx / d * step; P.tdy -= P.tdy / d * step;
      if (d - step < 0.5) P.tdx = P.tdy = 0;
    }
    const maxX = R.boss && !R.boss.dead ? Math.min(SHW * 0.7, R.boss.def.hx - R.boss.w * 0.5 - 40) : SHW * 0.7;
    P.x = shClamp(P.x, st.w * 0.45, Math.max(st.w * 0.45, maxX)); P.y = shClamp(P.y, 48, SHH - 20);
    P.cool -= dt; P.spCool -= dt; P.inv -= dt;
    if (P.shield > 0) P.shield -= dt;
    if (P.shieldCd > 0) P.shieldCd -= dt;
    const firing = (SH.auto || shKeys.Space || shKeys.KeyJ || R.touching) && R.phase !== "intro" && R.phase !== "won";
    if (firing && P.cool <= 0) { shGun(R); P.cool = 1 / st.rate; }
  } else if ((R.deadT += dt) > 1.8 && !R.end) shLose();

  // 🗺️ director
  if (R.phase === "intro" && R.t >= 2.5) R.phase = "waves";
  if (R.phase === "waves") {
    if (R.t >= R.nextWave) { shSpawnWave(R); const k = Math.min(1, R.t / R.L.len); R.nextWave = R.t + (R.cfg.gap[0] + (R.cfg.gap[1] - R.cfg.gap[0]) * k) * shRand(0.85, 1.15); }
    if (R.t >= R.nextCarrier) { shAdd("carrier", SHW + 40, shRand(90, SHH - 90), { vx: -90 }); R.nextCarrier = R.t + shRand(20, 28); }
    if (R.t >= R.L.len) { R.phase = "warn"; R.warnT = 0; R.banner = { big: t("⚠️ WARNING"), small: t(SH_BOSS[R.cfg.boss].name + " is coming!"), life: 3.5, warn: true }; }
  }
  if (R.phase === "warn" && (R.warnT += dt) > 3.5) { R.phase = "boss"; R.boss = shBossMake(R.cfg.boss); R.bossT0 = R.t; }
  if (R.phase === "boss" && R.boss) shBossStep(R, R.boss, dt);
  // during the boss fight supply ships drift down from the top, in front of the boss
  if (R.phase === "boss" && R.nextCarrier <= R.t) { shAdd("carrier", shRand(220, 420), -30, { vx: -15, fromTop: true }); R.nextCarrier = R.t + 26; }
  if (R.phase === "dying") {
    const b = R.boss; R.dieT += dt; R.shake = 0.3;
    if (R.dieT < 2.6 && Math.random() < 0.25) shBoom(b.x + shRand(-0.4, 0.4) * b.w, b.y + shRand(-0.35, 0.35) * shBossH(b), shRand(20, 45));
    if (R.dieT >= 2.6 && !b.gone) { b.gone = true; shBoom(b.x, b.y, 120); shFx(b.x, b.y, 60, "#ffffff", 400, 4); }
    if (R.dieT >= 4 && !R.end) { R.phase = "won"; shWin(); }
  }

  // 👾 enemies
  for (const e of R.en) {
    if (e.dead) continue;
    e.t += dt; e.flash = Math.max(0, e.flash - dt);
    shEnemyStep(R, e, dt);
    if (e.x < -90 || e.x > SHW + 400 || e.y < -120 || e.y > SHH + 120) { e.dead = true; e.gone = true; continue; }
    if (R.phase !== "dead" && shDist2(e.x, e.y, P.x, P.y) < (e.r + st.hit) ** 2) {
      if (shHurt(R)) { if (e.type === "brute") e.hp -= 6; else shHitEnemy(e, 99); }
    }
  }

  // 💥 player shots
  const b = R.boss && !R.boss.dead && !R.boss.entering ? R.boss : null, bc = b ? shBossCircles(b) : [];
  for (const s of R.pb) {
    if (s.kind === "missile") {
      let tgt = null, best = 1e9;
      for (const e of R.en) if (!e.dead && e.x > s.x - 40) { const d = shDist2(e.x, e.y, s.x, s.y); if (d < best) { best = d; tgt = e; } }
      if (b && (!tgt || shDist2(b.x, b.y, s.x, s.y) < best)) tgt = { x: b.x, y: b.y };
      const a = Math.atan2(s.vy, s.vx), want = tgt ? Math.atan2(tgt.y - s.y, tgt.x - s.x) : 0;
      let da = ((want - a + Math.PI * 3) % (Math.PI * 2)) - Math.PI; da = shClamp(da, -5 * dt, 5 * dt);
      const sp = Math.min(620, Math.hypot(s.vx, s.vy) + 600 * dt);
      s.vx = Math.cos(a + da) * sp; s.vy = Math.sin(a + da) * sp;
      if (Math.random() < 0.5) R.fx.push({ x: s.x - 10, y: s.y, vx: -40, vy: 0, life: 0.3, max: 0.3, r: 3, c: "#ffb25c" });
    }
    s.x += s.vx * dt; s.y += s.vy * dt;
    if (s.x > SHW + 30 || s.y < -30 || s.y > SHH + 30 || s.x < -30) { s.dead = true; continue; }
    for (const e of R.en) {
      if (e.dead || shDist2(e.x, e.y, s.x, s.y) > (e.r + s.r) ** 2) continue;
      if (s.pierce) { if (s.pierce.has(e)) continue; s.pierce.add(e); shHitEnemy(e, s.dmg); shFx(s.x, s.y, 3, "#ffb8f0", 90, 2); continue; }
      shHitEnemy(e, s.dmg); s.dead = true; shFx(s.x, s.y, 3, "#fff2a8", 90, 2); break;
    }
    if (!s.dead && b) for (const [cx, cy, cr] of bc) {
      if (shDist2(cx, cy, s.x, s.y) > (cr + s.r) ** 2) continue;
      s.dead = true; shFx(s.x, s.y, 3, "#fff2a8", 90, 2);
      if (b.inv <= 0) { b.hp -= s.dmg; b.flash = 0.06; if (b.hp <= 0) shBossKilled(R, b); }
      break;
    }
  }
  // ⚡ laser: everything on the ship's line takes damage; enemy shots on it are erased
  if (R.laser > 0) {
    R.laser -= dt;
    const dps = 60 * st.dmgMul;
    for (const e of R.en) if (!e.dead && e.x > P.x && Math.abs(e.y - P.y) < e.r + 14) shHitEnemy(e, dps * dt);
    if (b && b.inv <= 0 && bc.some(([cx, cy, cr]) => cx > P.x && Math.abs(cy - P.y) < cr + 14)) { b.hp -= dps * dt; b.flash = 0.05; if (b.hp <= 0) shBossKilled(R, b); }
    for (const s of R.eb) if (s.x > P.x && Math.abs(s.y - P.y) < 18) s.dead = true;
  }
  if (b && R.phase === "boss" && !b.dead && b.hp > 0) {
    for (const [cx, cy, cr] of bc) if (shDist2(cx, cy, P.x, P.y) < (cr + st.hit * 0.8) ** 2) { shHurt(R); break; }
  }

  // 🔴 enemy shots
  for (const s of R.eb) {
    if (s.g) s.vy += s.g * dt;
    s.x += s.vx * dt; s.y += s.vy * dt;
    if (s.x < -30 || s.x > SHW + 40 || s.y < -60 || s.y > SHH + 30) { s.dead = true; continue; }
    if (R.phase !== "dead" && shDist2(s.x, s.y, P.x, P.y) < (s.r + st.hit) ** 2 && shHurt(R)) s.dead = true;
  }
  // ☄️ the Taxman's beams
  for (const bm of R.beams) {
    bm.t += dt;
    if (bm.t > bm.tele && bm.t < bm.tele + bm.on && !bm.done && P.x < bm.x0 && Math.abs(P.y - bm.y) < bm.w / 2 + st.hit * 0.6) {
      if (shHurt(R)) bm.done = true;   // one beam = one attack (a shield block uses it up too)
    }
    if (bm.t > bm.tele + bm.on) bm.dead = true;
  }

  // 🎁 pick-ups
  for (const k of R.pk) {
    k.t += dt;
    const d2 = shDist2(k.x, k.y, P.x, P.y), pull = k.k === "dust" ? st.magnet + 40 : 0;
    if (R.phase !== "dead" && pull && d2 < pull * pull) {
      const d = Math.sqrt(d2) || 1; k.x += (P.x - k.x) / d * 420 * dt; k.y += (P.y - k.y) / d * 420 * dt;
    } else { k.x += k.vx * dt; k.y += (k.vy + (k.k === "dust" ? 0 : Math.sin(k.t * 3) * 30)) * dt; k.vy *= 0.97; }
    if (k.x < -30) { k.dead = true; continue; }
    if (R.phase !== "dead" && d2 < (st.hit + 18) ** 2) { k.dead = true; shCollect(R, k); }
  }

  // ✨ effects
  for (const f of R.fx) { f.life -= dt; if (!f.ring) { f.x += f.vx * dt; f.y += f.vy * dt; if (!f.text) { f.vx *= 0.96; f.vy *= 0.96; } } }
  R.en = R.en.filter(e => !e.dead); R.pb = R.pb.filter(s => !s.dead); R.eb = R.eb.filter(s => !s.dead);
  R.pk = R.pk.filter(k => !k.dead); R.fx = R.fx.filter(f => f.life > 0); R.beams = R.beams.filter(x => !x.dead);
  if (R.fx.length > 600) R.fx.splice(0, R.fx.length - 600);
}
function shCollect(R, k) {
  const P = R.p;
  if (k.k === "dust") { R.dust += k.v; SH.dust += k.v; SH.dustAll += k.v; return; }
  if (k.k === "heart") {
    if (P.hearts < R.st.hearts) { P.hearts++; shText(P.x, P.y - 40, t("+1 life"), "#ff8a9a"); }
    else { R.dust += 10; SH.dust += 10; SH.dustAll += 10; shText(P.x, P.y - 40, "+10 ✨", "#ffe66b"); }
    return;
  }
  const S = SH_SPECIAL[k.k], add = Math.round(S.ammo * R.st.ammo);
  if (P.special === k.k) P.ammo = Math.min(add * 2, P.ammo + add); else { P.special = k.k; P.ammo = add; }
  shText(P.x, P.y - 40, `${S.icon} ${t(S.name)}`, "#fff");
}
function shEnemyStep(R, e, dt) {
  const P = R.p, fire = R.cfg.fire, bs = R.cfg.bs;
  switch (e.type) {
    case "drone":
      e.x += e.vx * dt; e.y = e.y0 + (e.still ? 0 : Math.sin(e.t * 3 + e.ph) * 12);
      if (R.lv === 3 && !e.still && Math.random() < 0.12 * fire * dt) shEnemyShot(e.x - 15, e.y, Math.PI, bs * 0.8);
      break;
    case "darter": e.x += e.vx * dt; e.y += e.vy * dt; break;
    case "weaver":
      e.x += e.vx * dt; e.y = e.y0 + e.amp * Math.sin(2.2 * e.t + e.ph); e.rot += 5 * dt;
      if (R.lv > 1 && Math.random() < 0.15 * fire * dt) shEnemyShot(e.x, e.y, shAim(e.x, e.y), bs * 0.8);
      break;
    case "gunner": case "brute": {
      if (!e.parked) { e.x += e.vx * dt; if (e.x <= e.stopX) { e.parked = e.t; } }
      else if (e.t - e.parked < e.stay) {
        e.y += shClamp((e.type === "brute" ? e.y0 + Math.sin(e.t) * 60 : P.y) - e.y, -40 * dt, 40 * dt);
        e.fireT = (e.fireT ?? e.fireAt) - dt;
        if (e.fireT <= 0) {
          if (e.type === "gunner") { e.fireT = 1.8 / fire; e.burst = 3; }
          else { e.fireT = 2.2 / fire; const a = shAim(e.x - 50, e.y); for (let i = -2; i <= 2; i++) shEnemyShot(e.x - 50, e.y, a + i * 0.2, bs * 0.85, "ebBig"); }
        }
        if (e.burst > 0 && (e.burstT = (e.burstT || 0) - dt) <= 0) { e.burst--; e.burstT = 0.15; shEnemyShot(e.x - 32, e.y, shAim(e.x - 32, e.y), bs); }
      } else e.x -= 240 * dt;
      break;
    }
    case "mine": e.x += e.vx * dt; e.y = e.y0 + Math.sin(e.t * 1.5) * 20; e.rot += dt; break;
    case "homer": case "tmissile": {
      const spd = e.type === "homer" ? 230 * R.cfg.spd : 260, turn = e.type === "homer" ? 2.2 : 1.8;
      if (e.t < (e.type === "homer" ? 4 : 3)) {
        const want = Math.atan2(P.y - e.y, P.x - e.x);
        let da = ((want - e.ang + Math.PI * 3) % (Math.PI * 2)) - Math.PI; e.ang += shClamp(da, -turn * dt, turn * dt);
      }
      e.x += Math.cos(e.ang) * spd * dt; e.y += Math.sin(e.ang) * spd * dt;
      if (e.type === "tmissile" && Math.random() < 0.6) R.fx.push({ x: e.x + 14, y: e.y, vx: 30, vy: 0, life: 0.35, max: 0.35, r: 3.5, c: "#ff8a3b" });
      break;
    }
    case "tiny":
      if (e.home) {
        if (e.t < 3.5) { const want = Math.atan2(P.y - e.y, P.x - e.x); let da = ((want - e.ang + Math.PI * 3) % (Math.PI * 2)) - Math.PI; e.ang += shClamp(da, -2 * dt, 2 * dt); }
        e.x += Math.cos(e.ang) * 150 * dt; e.y += Math.sin(e.ang) * 150 * dt;
      } else { e.x += e.vx * dt; e.y = e.y0 + e.amp * Math.sin(e.freq * e.t + e.ph); }
      break;
    case "carrier": e.x += e.vx * dt; if (e.fromTop) e.y += 60 * dt; else e.y = e.y0 + Math.sin(e.t * 2) * 30; break;
    case "rock": e.x += e.vx * dt; e.y += e.vy * dt; e.rot += e.spin * dt; break;
  }
}

/* ---------------------------------------------------------------------
   🎨 DRAWING
   --------------------------------------------------------------------- */
function shDrawSprite(g, spr, x, y, rot = 0, flip = false) {
  if (!rot && !flip) return g.drawImage(spr.c, x - spr.w / 2, y - spr.h / 2, spr.w, spr.h);
  g.save(); g.translate(x, y); if (rot) g.rotate(rot); if (flip) g.scale(-1, 1);
  g.drawImage(spr.c, -spr.w / 2, -spr.h / 2, spr.w, spr.h); g.restore();
}
function shDrawImg(g, name, x, y, w, alpha = 1) {
  const im = shImg(name); if (!im.complete || !im.naturalWidth) return 0;
  const h = w * im.naturalHeight / im.naturalWidth;
  if (alpha !== 1) g.globalAlpha = alpha;
  g.drawImage(im, x - w / 2, y - h / 2, w, h);
  g.globalAlpha = 1;
  return h;
}
function shHeart(g, x, y, s, full) {
  g.beginPath(); g.moveTo(x, y + s * 0.8);
  g.bezierCurveTo(x - s * 1.2, y - s * 0.1, x - s * 0.7, y - s * 1.1, x, y - s * 0.4);
  g.bezierCurveTo(x + s * 0.7, y - s * 1.1, x + s * 1.2, y - s * 0.1, x, y + s * 0.8);
  g.fillStyle = full ? "#ff3b5c" : "rgba(255,255,255,0.15)"; g.fill();
  g.strokeStyle = "#1a0f2e"; g.lineWidth = 2; g.stroke();
}
function shTextOut(g, s, x, y, size, col = "#fff", align = "center") {
  g.font = `800 ${size}px system-ui, sans-serif`; g.textAlign = align; g.textBaseline = "middle";
  g.lineWidth = Math.max(3, size / 6); g.strokeStyle = "rgba(10,5,30,0.9)"; g.strokeText(s, x, y);
  g.fillStyle = col; g.fillText(s, x, y);
}
function shDraw() {
  const g = shCtx, R = shR; if (!g || !R) return;
  const P = R.p, st = R.st, lv = R.lv;
  g.save();
  // 🌌 sky
  const sky = SH_SKY[lv - 1];
  const bg = g.createLinearGradient(0, 0, 0, SHH); bg.addColorStop(0, sky.top); bg.addColorStop(1, sky.bottom);
  g.fillStyle = bg; g.fillRect(0, 0, SHW, SHH);
  if (R.shake > 0) g.translate(shRand(-1, 1) * 8 * R.shake, shRand(-1, 1) * 8 * R.shake);
  const neb = shNebula(lv), nx = -((R.bgX * 0.3) % 1920);
  g.drawImage(neb.c, nx, 0, 1920, 540); g.drawImage(neb.c, nx + 1920, 0, 1920, 540);
  shDrawSprite(g, shPlanet(lv, R.planet.r), R.planet.x, R.planet.y);
  for (const s of R.stars) { g.fillStyle = ["rgba(255,255,255,0.35)", "rgba(255,255,255,0.6)", "#fff"][s.z]; const sz = s.z + 1; g.fillRect(s.x, s.y, s.z === 2 ? 5 : sz, s.z === 2 ? 2 : sz); }

  // 🎁 pick-ups
  for (const k of R.pk) {
    const spr = shPickSprite(k.k);
    shDrawSprite(g, spr, k.x, k.y, k.k === "dust" ? k.t * 3 : 0);
  }
  // 👹 boss
  const b = R.boss;
  if (b && !b.gone) {
    let bx = b.x, by = b.y;
    if (b.warn) { bx += shRand(-3, 3); by += shRand(-2, 2); }
    const h = shDrawImg(g, b.img, bx, by, b.w);
    if (h && (b.flash > 0 || b.warn && Math.floor(R.t * 10) % 2 || b.inv > 0 && Math.floor(R.t * 12) % 2)) {
      g.save(); g.globalCompositeOperation = "lighter"; g.globalAlpha = b.warn ? 0.45 : 0.35;
      shDrawImg(g, b.img, bx, by, b.w); g.restore();
    }
    if (b.k === "taxman" && b.phase === 3 && Math.random() < 0.3) R.fx.push({ x: bx + shRand(-0.4, 0.4) * b.w, y: by - shRand(0, 0.3) * h, vx: -30, vy: -50, life: 0.9, max: 0.9, r: 8, c: "rgba(70,60,70,0.5)", smoke: true });
  }
  // ☄️ beams (red warning line, then the beam)
  for (const bm of R.beams) {
    if (bm.t < bm.tele) {
      if (Math.floor(bm.t * 12) % 2 === 0) { g.strokeStyle = "rgba(255,60,60,0.9)"; g.lineWidth = 2; g.setLineDash([12, 8]); g.beginPath(); g.moveTo(0, bm.y); g.lineTo(bm.x0, bm.y); g.stroke(); g.setLineDash([]); }
    } else {
      const k = Math.min(1, (bm.t - bm.tele) / 0.12), w = bm.w * k * (0.9 + Math.random() * 0.2);
      g.save(); g.globalCompositeOperation = "lighter";
      const gr = g.createLinearGradient(0, bm.y - w, 0, bm.y + w);
      gr.addColorStop(0, "rgba(255,80,40,0)"); gr.addColorStop(0.35, "rgba(255,120,40,0.8)"); gr.addColorStop(0.5, "rgba(255,255,220,1)"); gr.addColorStop(0.65, "rgba(255,120,40,0.8)"); gr.addColorStop(1, "rgba(255,80,40,0)");
      g.fillStyle = gr; g.fillRect(0, bm.y - w, bm.x0, w * 2); g.restore();
    }
  }
  // 👾 enemies
  for (const e of R.en) {
    const spr = e.type === "rock" ? shRock(e.size, e.v) : shEnemySprite(e.type);
    const rot = e.type === "weaver" || e.type === "rock" || e.type === "mine" ? e.rot : (e.type === "homer" || e.type === "tmissile" || (e.type === "tiny" && e.home)) ? e.ang - Math.PI : 0;
    shDrawSprite(g, spr, e.x, e.y, rot);
    if (e.flash > 0) { g.save(); g.globalCompositeOperation = "lighter"; g.globalAlpha = 0.6; shDrawSprite(g, spr, e.x, e.y, rot); g.restore(); }
    if (e.type === "mine" && Math.floor(e.t * 3) % 2) { g.fillStyle = "#ff4040"; g.beginPath(); g.arc(e.x, e.y, 3.5, 0, Math.PI * 2); g.fill(); }
    if (e.type === "carrier") { g.save(); g.globalCompositeOperation = "lighter"; g.globalAlpha = 0.25 + 0.15 * Math.sin(e.t * 6); g.fillStyle = "#5ef2ff"; g.beginPath(); g.arc(e.x, e.y, 34, 0, Math.PI * 2); g.fill(); g.restore(); }
  }
  // 💥 player shots
  for (const s of R.pb) shDrawSprite(g, shShotSprite(s.kind), s.x, s.y, s.vy ? Math.atan2(s.vy, s.vx) : 0);
  // ⚡ laser
  if (R.laser > 0) {
    const x0 = P.x + st.w * 0.4, w = 13 * (0.85 + Math.random() * 0.3);
    g.save(); g.globalCompositeOperation = "lighter";
    const gr = g.createLinearGradient(0, P.y - w, 0, P.y + w);
    gr.addColorStop(0, "rgba(40,200,255,0)"); gr.addColorStop(0.4, "rgba(80,220,255,0.85)"); gr.addColorStop(0.5, "#ffffff"); gr.addColorStop(0.6, "rgba(80,220,255,0.85)"); gr.addColorStop(1, "rgba(40,200,255,0)");
    g.fillStyle = gr; g.fillRect(x0, P.y - w, SHW - x0, w * 2); g.restore();
  }
  // 🚀 player ship
  if (R.phase !== "dead" || R.deadT < 0.05) {
    if (!(P.inv > 0 && P.shield <= 0 && Math.floor(R.t * 14) % 2)) {
      g.save(); g.globalCompositeOperation = "lighter"; g.globalAlpha = 0.5 + Math.random() * 0.3;
      g.fillStyle = shRad(g, P.x - st.w * 0.5, P.y, 1, 16, ["rgba(255,200,120,0.9)", "rgba(255,100,40,0)"]);
      g.fillRect(P.x - st.w * 0.5 - 18, P.y - 16, 36, 32); g.restore();
      shDrawImg(g, st.img, P.x, P.y, st.w);
    }
    if (P.shield > 0) {
      const k = P.shield < 0.4 ? (Math.floor(R.t * 16) % 2 ? 0.3 : 0.9) : 0.9, r = st.w * 0.62;
      g.save(); g.globalAlpha = k;
      g.fillStyle = shRad(g, P.x, P.y, r * 0.5, r, ["rgba(120,240,255,0.05)", "rgba(120,240,255,0.25)", "rgba(200,255,255,0.7)"]);
      g.beginPath(); g.ellipse(P.x, P.y, r, r * 0.72, 0, 0, Math.PI * 2); g.fill();
      g.strokeStyle = "rgba(200,255,255,0.95)"; g.lineWidth = 2.5; g.stroke(); g.restore();
    }
  }
  // 🔴 enemy shots
  for (const s of R.eb) shDrawSprite(g, shShotSprite(s.kind), s.x, s.y, s.kind === "coin" ? R.t * 6 : 0);
  // ✨ effects
  g.save();
  for (const f of R.fx) {
    const a = Math.max(0, f.life / f.max);
    if (f.text) { g.globalAlpha = Math.min(1, a * 1.5); shTextOut(g, f.text, f.x, f.y, 20, f.c); continue; }
    g.globalAlpha = a;
    if (f.ring) { const r = f.to - (f.to - f.r) * a; g.strokeStyle = f.c; g.lineWidth = 3 * a + 1; g.beginPath(); g.arc(f.x, f.y, r, 0, Math.PI * 2); g.stroke(); continue; }
    g.globalCompositeOperation = f.smoke ? "source-over" : "lighter";
    g.fillStyle = f.c; g.beginPath(); g.arc(f.x, f.y, f.r * (f.smoke ? 2 - a : 1), 0, Math.PI * 2); g.fill();
  }
  g.restore();
  g.restore();
  shDrawHud(g, R);
}
function shDrawHud(g, R) {
  const P = R.p, st = R.st;
  g.fillStyle = "rgba(8,4,24,0.55)"; g.fillRect(0, 0, SHW, 40);
  for (let i = 0; i < st.hearts; i++) shHeart(g, 22 + i * 26, 21, 10, i < P.hearts);
  // 🛡️ shield
  let x = 30 + st.hearts * 26 + 14;
  const ready = P.shieldCd <= 0, k = ready ? 1 : 1 - P.shieldCd / st.shieldCd;
  g.beginPath(); g.arc(x, 20, 14, 0, Math.PI * 2); g.fillStyle = P.shield > 0 ? "rgba(120,240,255,0.6)" : ready ? "rgba(80,200,255,0.35)" : "rgba(255,255,255,0.08)"; g.fill();
  g.beginPath(); g.arc(x, 20, 14, -Math.PI / 2, -Math.PI / 2 + k * Math.PI * 2); g.strokeStyle = ready ? "#8ff6ff" : "#5c7a99"; g.lineWidth = 3; g.stroke();
  shTextOut(g, "🛡️", x, 21, 14);
  if (!ready) shTextOut(g, String(Math.ceil(P.shieldCd)), x + 26, 21, 15, "#b9d6ff");
  x += 52;
  // 🎁 special weapon
  if (P.special) { shTextOut(g, `${SH_SPECIAL[P.special].icon} ×${P.ammo}`, x, 21, 17, "#fff", "left"); }
  // ✨ stardust
  shTextOut(g, `✨ ${R.dust}`, SHW - 70, 21, 17, "#ffe66b", "right");
  // progress (waves) or boss health
  const bx = 360, bw = 300;
  if (R.boss && !R.boss.dead && !R.boss.entering) {
    const b = R.boss;
    g.fillStyle = "rgba(255,255,255,0.12)"; g.fillRect(bx, 13, bw, 14);
    g.fillStyle = b.phase === 1 ? "#ff4d6a" : b.phase === 2 ? "#ff8a2b" : "#ffd02e"; g.fillRect(bx, 13, bw * Math.max(0, b.hp / b.max), 14);
    g.strokeStyle = "#1a0f2e"; g.lineWidth = 2; g.strokeRect(bx, 13, bw, 14);
    shTextOut(g, t(b.def.name), bx + bw / 2, 20, 13);
  } else if (!R.boss) {
    const k = Math.min(1, R.t / R.L.len);
    g.fillStyle = "rgba(255,255,255,0.12)"; g.fillRect(bx, 15, bw, 10);
    g.fillStyle = "#7ad7ff"; g.fillRect(bx, 15, bw * k, 10);
    g.strokeStyle = "#1a0f2e"; g.lineWidth = 2; g.strokeRect(bx, 15, bw, 10);
    shTextOut(g, "👹", bx + bw + 14, 20, 16);
    shTextOut(g, `🚀`, bx + bw * k, 20, 14);
  }
  // banners
  if (R.banner) {
    const a = Math.min(1, R.banner.life * 2);
    g.globalAlpha = a;
    if (R.banner.warn) { g.fillStyle = "rgba(160,0,20,0.35)"; g.fillRect(0, SHH / 2 - 50, SHW, 100); }
    shTextOut(g, R.banner.big, SHW / 2, SHH / 2 - 12, 44, R.banner.warn ? "#ff6b6b" : "#ffd34d");
    if (R.banner.small) shTextOut(g, R.banner.small, SHW / 2, SHH / 2 + 30, 24, "#fff");
    g.globalAlpha = 1;
  }
}

/* ---------------------------------------------------------------------
   🔁 LOOP, PAUSE AND THE PLAY PAGE
   --------------------------------------------------------------------- */
const shVisible = () => state.view === "games" && state.gamePage === "shooter" && !document.hidden && $("mainMenu").hidden && $("modal").hidden;
function shLoop(ts) {
  shRaf = 0;
  if (!shR) return;
  if (!shVisible()) { if (!shR.end) shPause(true); return; }
  const dt = Math.min(0.1, Math.max(0, (ts - shLast) / 1000)); shLast = ts;
  if (!shR.paused) { shAcc += dt; let n = 0; while (shAcc >= SH_DT && n++ < 6) { shUpdate(SH_DT); shAcc -= SH_DT; } if (n >= 6) shAcc = 0; }
  shDraw();
  if (!shR.paused && !(shR.end && shR.fx.length === 0)) shRaf = requestAnimationFrame(shLoop);
}
function shKick() { if (!shRaf && shR && shCanvas) { shLast = performance.now(); shAcc = 0; shRaf = requestAnimationFrame(shLoop); } }
function shStop() { if (shRaf) cancelAnimationFrame(shRaf); shRaf = 0; }
function shPause(on) {
  const R = shR; if (!R || R.end) return;
  R.paused = on; for (const k in shKeys) shKeys[k] = false;
  const o = $("shOverlay");
  if (o) {
    o.hidden = !on;
    if (on) o.innerHTML = `<div class="shPanel"><h2>⏸️ Paused</h2>
      <p class="muted">Level ${R.lv}: ${R.L.name} · ${shClock(R.t)}</p>
      <div class="moneyRow" style="justify-content:center"><button class="btn big" data-shp="resume">▶ Resume</button>
      <button class="btn ghost" data-shp="quit">🏳️ Quit level</button></div>
      <div class="shPauseKeys">${shTouchUI
        ? `<span>👆 Drag anywhere to fly</span><span>🛡️ Shield button</span><span>🚀 Special weapon button</span><span>⏸️ Pause button</span>`
        : `<span><b>⬆️⬇️⬅️➡️ / WASD</b> Move</span><span><b>${shBindLabel("shield")}</b> 🛡️ Shield</span><span><b>${shBindLabel("special")}</b> 🚀 Special weapon</span>
           <span><b>${SH.auto ? "Auto-fire on" : "Space"}</b> 🔫 Shoot</span><span><b>P / Esc</b> ⏸️ Pause</span>`}</div>
      <p class="muted">If you quit, you keep the stardust you collected.</p></div>`;
  }
  if (on) { shDraw(); save(); } else shKick();
}
function shShowEnd() {
  const R = shR, E = R.end, o = $("shOverlay"); if (!o) return;
  o.hidden = false;
  o.innerHTML = E.win
    ? `<div class="shPanel win"><h2>🏆 Level ${R.lv} cleared!</h2>
        <p><b>${R.L.boss}</b> was defeated in ${shClock(R.t)}.</p>
        <div class="shEndStats"><span>👾 Enemies destroyed: <b>${R.kills}</b></span><span>💔 Lives lost: <b>${R.hits}</b></span><span>🛡️ Hits blocked: <b>${R.blocks}</b></span></div>
        <div class="shEndReward"><span>💰 <b>+${fmt(E.money)}</b></span><span>✨ <b>+${R.dust.toLocaleString()}</b> stardust</span></div>
        ${E.first ? `<p class="shFirst">⭐ First clear!${R.lv < 3 ? ` Level ${R.lv + 1} is now open.` : " You beat every level!"}</p>` : ""}
        <div class="moneyRow" style="justify-content:center">
          ${R.lv < 3 ? `<button class="btn big" data-shp="next">▶ Level ${R.lv + 1}</button>` : ""}
          <button class="btn" data-shp="again">🔁 Play again</button><button class="btn ghost" data-shp="hangar">🛸 Hangar</button></div></div>`
    : `<div class="shPanel lose"><h2>💥 Your ship was destroyed</h2>
        <p>You made it ${E.pct}% of the way through level ${R.lv}. The level starts over from the beginning.</p>
        <div class="shEndStats"><span>👾 Enemies destroyed: <b>${R.kills}</b></span><span>🛡️ Hits blocked: <b>${R.blocks}</b></span></div>
        <p>✨ You keep the <b>${R.dust.toLocaleString()}</b> stardust you collected. Spend it on upgrades in the hangar.</p>
        <div class="moneyRow" style="justify-content:center"><button class="btn big" data-shp="again">🔁 Try again</button>
          <button class="btn ghost" data-shp="hangar">🛸 Hangar</button></div></div>`;
}
function shRenderPlay() {
  const v = $("shooterView");
  v.innerHTML = `<div class="shPlay">
      <div class="shStage" id="shStage">
        <canvas id="shCanvas" width="${SHW}" height="${SHH}"></canvas>
        <button class="shPauseBtn" data-shp="pause" aria-label="Pause">⏸️</button>
        <div class="shTouch ${shTouchUI ? "" : "off"}">
          <button class="shTBtn sp" data-shp="special" aria-label="Special weapon">🚀</button>
          <button class="shTBtn sh" data-shp="shield" aria-label="Shield">🛡️</button>
        </div>
        <div class="shOverlay" id="shOverlay" hidden></div>
      </div>
      <p class="muted shRotate">📱 Turn your phone sideways for a bigger screen.</p>
    </div>`;
  shCanvas = $("shCanvas");
  const k = Math.min(2, Math.max(1, window.devicePixelRatio || 1));
  shCanvas.width = SHW * k; shCanvas.height = SHH * k;
  shCtx = shCanvas.getContext("2d"); shCtx.setTransform(k, 0, 0, k, 0, 0);
  shBindTouch();
  if (shR.end) { shDraw(); shShowEnd(); }
  else if (shR.paused) { shR.paused = false; shPause(true); }
  else shKick();
}
function shBindTouch() {
  const c = shCanvas; let last = null;
  c.addEventListener("pointerdown", (e) => {
    if (e.pointerType !== "mouse" && !shTouchUI) { shTouchUI = true; document.querySelector(".shTouch")?.classList.remove("off"); }
    if (!shR || shR.paused || shR.end) return;
    last = { x: e.clientX, y: e.clientY, id: e.pointerId }; shR.touching = true;
    try { c.setPointerCapture(e.pointerId); } catch (_) {}
    e.preventDefault();
  });
  c.addEventListener("pointermove", (e) => {
    if (!last || e.pointerId !== last.id || !shR) return;
    const s = SHW / c.clientWidth;
    shR.p.tdx += (e.clientX - last.x) * s * 1.25; shR.p.tdy += (e.clientY - last.y) * s * 1.25;
    last = { x: e.clientX, y: e.clientY, id: e.pointerId };
    e.preventDefault();
  });
  const up = (e) => { if (last && e.pointerId === last.id) { last = null; if (shR) shR.touching = false; } };
  c.addEventListener("pointerup", up); c.addEventListener("pointercancel", up);
}
$("shooterView").addEventListener("pointerdown", (e) => {
  const b = e.target.closest("[data-shp]"); if (!b || !shR) return;
  const a = b.dataset.shp;
  if (a === "shield") { e.preventDefault(); shUseShield(shR); }
  if (a === "special") { e.preventDefault(); shUseSpecial(shR); }
});
$("shooterView").addEventListener("click", (e) => {
  const b = e.target.closest("[data-shp]"); if (!b || !shR) return;
  const a = b.dataset.shp, lv = shR.lv;
  if (a === "pause") shPause(!shR.paused);
  if (a === "resume") shPause(false);
  if (a === "quit" || a === "hangar") shQuit();
  if (a === "again") { shR = null; shStart(lv); }
  if (a === "next") { shR = null; shStart(lv + 1); }
});
const SH_GAME_KEYS = new Set(["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "KeyA", "KeyD", "KeyW", "KeyS", "Space", "KeyJ", "KeyP", "Escape"]);
document.addEventListener("keydown", (e) => {
  const isShield = shBindCodes("shield").includes(e.code), isSpecial = shBindCodes("special").includes(e.code);
  if (!shR || !shVisible() || !(SH_GAME_KEYS.has(e.code) || isShield || isSpecial) || e.target.closest("input, textarea, select")) return;
  e.preventDefault();
  if (e.code === "KeyP" || e.code === "Escape") { if (!e.repeat && !shR.end) shPause(!shR.paused); return; }
  if (shR.paused || shR.end) return;
  shKeys[e.code] = true;
  if (e.repeat) return;
  if (isShield) shUseShield(shR);
  if (isSpecial) shUseSpecial(shR);
});
document.addEventListener("keyup", (e) => { shKeys[e.code] = false; });
document.addEventListener("visibilitychange", () => { if (document.hidden && shR && !shR.end) shPause(true); });
window.addEventListener("blur", () => { for (const k in shKeys) shKeys[k] = false; });
if (state.view === "games" && state.gamePage === "shooter") renderGames();
