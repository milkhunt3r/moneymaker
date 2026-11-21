/* =====================================================================
   🚀 NEBULA STRIKE: pictures.
   Ships and bosses are painted (assets/shooter/*.webp). Enemies, shots, pick-ups and the space
   background are drawn here once into small offscreen canvases ("sprites") in the same cartoon
   style: bold dark outline, glossy gradients, gold trim. Enemies face left.
   ===================================================================== */
const SH_IMG = {};
function shImg(name) {
  if (!SH_IMG[name]) { const im = new Image(); im.src = `assets/shooter/${name}.webp`; SH_IMG[name] = im; }
  return SH_IMG[name];
}
const SH_SPR = {};
const SH_OUT = "#1a0f2e";
// draws once into a 2× canvas; returns { c, w, h }
function shSprite(key, w, h, draw, k = 2) {
  if (SH_SPR[key]) return SH_SPR[key];
  const c = document.createElement("canvas");
  c.width = Math.ceil(w * k); c.height = Math.ceil(h * k);
  const g = c.getContext("2d");
  g.scale(k, k); g.lineJoin = "round"; g.lineCap = "round"; g.translate(w / 2, h / 2);
  draw(g, w, h);
  return (SH_SPR[key] = { c, w, h });
}
function shLin(g, x0, y0, x1, y1, stops) { const gr = g.createLinearGradient(x0, y0, x1, y1); stops.forEach((c, i) => gr.addColorStop(i / (stops.length - 1), c)); return gr; }
function shRad(g, x, y, r0, r1, stops) { const gr = g.createRadialGradient(x, y, r0, x, y, r1); stops.forEach((c, i) => gr.addColorStop(i / (stops.length - 1), c)); return gr; }
function shPaint(g, fill, lw = 2.5) { g.fillStyle = fill; g.fill(); g.strokeStyle = SH_OUT; g.lineWidth = lw; g.stroke(); }
function shShine(g, x, y, rx, ry, a = 0.55) { g.save(); g.globalAlpha = a; g.fillStyle = "#fff"; g.beginPath(); g.ellipse(x, y, rx, ry, -0.3, 0, Math.PI * 2); g.fill(); g.restore(); }
function shDot(g, x, y, r, fill) { g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); shPaint(g, fill, 1.5); }

/* ----- 👾 ENEMIES ----- */
const SH_ENEMY_ART = {
  // 🛸 saucer drone
  drone: [50, 36, (g) => {
    g.beginPath(); g.ellipse(0, 5, 23, 9, 0, 0, Math.PI * 2); shPaint(g, shLin(g, 0, -4, 0, 14, ["#ff8be0", "#c22fb4", "#6a1585"]));
    g.beginPath(); g.ellipse(0, 3, 21, 3, 0, 0, Math.PI * 2); g.strokeStyle = "#ffcc33"; g.lineWidth = 2; g.stroke();
    g.beginPath(); g.ellipse(0, 1, 11, 11, 0, Math.PI, Math.PI * 2); g.closePath(); shPaint(g, shRad(g, -3, -6, 1, 13, ["#e9fdff", "#5fd9ff", "#1478c8"]));
    shShine(g, -4, -5, 3.5, 2);
    [-13, 0, 13].forEach(x => shDot(g, x, 8, 2.2, "#ffe14d"));
  }],
  // ➤ fast darter (arrow)
  darter: [54, 28, (g) => {
    g.beginPath(); g.moveTo(-25, 0); g.lineTo(5, -12); g.lineTo(23, -10); g.lineTo(16, 0); g.lineTo(23, 10); g.lineTo(5, 12); g.closePath();
    shPaint(g, shLin(g, 0, -12, 0, 12, ["#ffb15c", "#ff5a2b", "#b3161e"]));
    g.beginPath(); g.moveTo(-14, 0); g.lineTo(14, 0); g.strokeStyle = "#ffd84a"; g.lineWidth = 3; g.stroke();
    g.beginPath(); g.ellipse(-4, -4, 6, 3, -0.2, 0, Math.PI * 2); shPaint(g, shLin(g, 0, -7, 0, -1, ["#d8fbff", "#3cb8ff"]), 1.5);
    g.beginPath(); g.arc(20, 0, 4, 0, Math.PI * 2); g.fillStyle = "#ffe8a0"; g.fill();
  }],
  // 🔫 gun pod
  gunner: [66, 52, (g) => {
    g.beginPath(); g.moveTo(-33, -5); g.lineTo(-18, -5); g.lineTo(-18, 5); g.lineTo(-33, 5); g.closePath(); shPaint(g, shLin(g, 0, -5, 0, 5, ["#9aa0b5", "#3b3f52"]));
    g.beginPath(); g.rect(-35, -7, 5, 14); shPaint(g, "#ffc72e", 2);
    g.beginPath(); g.moveTo(14, -20); g.lineTo(28, -25); g.lineTo(26, -10); g.closePath(); shPaint(g, "#ffc72e", 2);
    g.beginPath(); g.moveTo(14, 20); g.lineTo(28, 25); g.lineTo(26, 10); g.closePath(); shPaint(g, "#ffc72e", 2);
    g.beginPath(); g.roundRect(-20, -19, 46, 38, 14); shPaint(g, shLin(g, 0, -19, 0, 19, ["#7dffd5", "#1fb58e", "#0d5e57"]));
    g.beginPath(); g.rect(-18, -8, 42, 4); g.fillStyle = "#ffcc33"; g.fill();
    g.beginPath(); g.arc(-5, 6, 6, 0, Math.PI * 2); shPaint(g, shRad(g, -7, 4, 1, 7, ["#fff0f0", "#ff3b3b", "#8a0b0b"]), 2);
    shShine(g, -6, -13, 8, 2.5, 0.45);
  }],
  // ✴️ spinner (drawn rotating)
  weaver: [48, 48, (g) => {
    for (let i = 0; i < 4; i++) {
      g.save(); g.rotate(i * Math.PI / 2);
      g.beginPath(); g.moveTo(0, -6); g.quadraticCurveTo(14, -22, 21, -8); g.quadraticCurveTo(12, -4, 6, 4); g.closePath();
      shPaint(g, shLin(g, 0, -20, 20, 0, ["#ff9df0", "#b52bd6", "#5a1380"]), 2);
      g.restore();
    }
    g.beginPath(); g.arc(0, 0, 9, 0, Math.PI * 2); shPaint(g, shRad(g, -2, -2, 1, 10, ["#fffbe0", "#ffd02e", "#d97a00"]));
    shShine(g, -3, -3, 3, 2);
  }],
  // 💣 space mine
  mine: [42, 42, (g) => {
    for (let i = 0; i < 8; i++) {
      g.save(); g.rotate(i * Math.PI / 4);
      g.beginPath(); g.moveTo(-4, -12); g.lineTo(0, -20); g.lineTo(4, -12); g.closePath(); shPaint(g, "#ff4040", 1.8);
      g.restore();
    }
    g.beginPath(); g.arc(0, 0, 13, 0, Math.PI * 2); shPaint(g, shRad(g, -4, -4, 1, 14, ["#b9bdd0", "#5d6178", "#24263a"]));
    g.beginPath(); g.arc(0, 0, 13, 0, Math.PI * 2); g.strokeStyle = "#ffcc33"; g.lineWidth = 1.5; g.setLineDash([3, 4]); g.stroke(); g.setLineDash([]);
    shShine(g, -5, -6, 4, 2.5, 0.5);
  }],
  // 🛡️ big armoured gunship
  brute: [112, 78, (g) => {
    [-14, 0, 14].forEach(y => { g.beginPath(); g.rect(-56, y - 4, 22, 8); shPaint(g, shLin(g, 0, y - 4, 0, y + 4, ["#9aa0b5", "#3b3f52"]), 2); g.beginPath(); g.rect(-57, y - 5, 5, 10); shPaint(g, "#ffc72e", 1.5); });
    g.beginPath(); g.moveTo(-38, -26); g.lineTo(10, -36); g.lineTo(48, -24); g.lineTo(54, 0); g.lineTo(48, 24); g.lineTo(10, 36); g.lineTo(-38, 26); g.lineTo(-44, 0); g.closePath();
    shPaint(g, shLin(g, 0, -36, 0, 36, ["#ff5a6e", "#c21d36", "#5e0b1a"]), 3);
    g.beginPath(); g.moveTo(-30, 8); g.lineTo(40, 8); g.lineTo(44, 22); g.lineTo(-26, 22); g.closePath(); shPaint(g, shLin(g, 0, 8, 0, 22, ["#7c8194", "#33364a"]), 2);
    g.beginPath(); g.moveTo(-28, -8); g.lineTo(42, -8); g.strokeStyle = "#ffcc33"; g.lineWidth = 3.5; g.stroke();
    g.beginPath(); g.roundRect(-8, -26, 30, 10, 4); shPaint(g, shLin(g, 0, -26, 0, -16, ["#fff6a0", "#ffb300"]), 2);
    [[-30, -16], [-6, -2], [22, -2], [40, -14], [-30, 15], [30, 15]].forEach(([x, y]) => shDot(g, x, y, 2.2, "#ffcc33"));
    [[48, -12], [48, 12]].forEach(([x, y]) => { g.beginPath(); g.arc(x + 6, y, 5, 0, Math.PI * 2); g.fillStyle = "#ffae3b"; g.fill(); });
    shShine(g, 0, -26, 18, 3, 0.35);
  }],
  // 🐝 homing wasp
  homer: [46, 32, (g) => {
    g.save(); g.globalAlpha = 0.7;
    g.beginPath(); g.ellipse(6, -10, 10, 5, -0.5, 0, Math.PI * 2); shPaint(g, "rgba(200,240,255,0.8)", 1.5);
    g.restore();
    g.beginPath(); g.moveTo(-22, 0); g.quadraticCurveTo(-6, -12, 16, -7); g.quadraticCurveTo(22, 0, 16, 7); g.quadraticCurveTo(-6, 12, -22, 0); g.closePath();
    shPaint(g, shLin(g, -20, 0, 20, 0, ["#ffe23d", "#ffb000"]));
    g.save(); g.clip(); g.fillStyle = "#2a1b3d"; [-2, 7, 16].forEach(x => g.fillRect(x, -12, 4, 24)); g.restore();
    g.beginPath(); g.moveTo(-22, 0); g.quadraticCurveTo(-6, -12, 16, -7); g.quadraticCurveTo(22, 0, 16, 7); g.quadraticCurveTo(-6, 12, -22, 0); g.strokeStyle = SH_OUT; g.lineWidth = 2.5; g.stroke();
    g.beginPath(); g.arc(-12, -2, 3.5, 0, Math.PI * 2); shPaint(g, "#ff2b4a", 1.5);
  }],
  // 🟢 tiny swarm bug / hive larva
  tiny: [30, 24, (g) => {
    g.beginPath(); g.ellipse(4, -8, 7, 4, -0.4, 0, Math.PI * 2); shPaint(g, "rgba(210,255,230,0.75)", 1.5);
    g.beginPath(); g.ellipse(0, 1, 12, 9, 0, 0, Math.PI * 2); shPaint(g, shRad(g, -3, -2, 1, 13, ["#e8ff8a", "#7bdc2a", "#2d7a1a"]));
    g.beginPath(); g.arc(-6, 0, 3, 0, Math.PI * 2); shPaint(g, "#ffef5c", 1.2);
    shShine(g, 1, -4, 4, 2, 0.5);
  }],
  // 📦 supply ship: drops a special weapon or a life
  carrier: [64, 44, (g) => {
    g.beginPath(); g.ellipse(0, 0, 29, 17, 0, 0, Math.PI * 2); shPaint(g, shLin(g, 0, -17, 0, 17, ["#ffffff", "#9fe8ff", "#2a8fd6"]));
    g.beginPath(); g.ellipse(0, 0, 29, 17, 0, 0, Math.PI * 2); g.strokeStyle = "#5ef2ff"; g.lineWidth = 1.5; g.stroke();
    g.beginPath(); g.roundRect(-10, -9, 20, 18, 3); shPaint(g, shLin(g, 0, -9, 0, 9, ["#ffe37a", "#e09400"]), 2);
    g.beginPath(); g.moveTo(-10, 0); g.lineTo(10, 0); g.moveTo(0, -9); g.lineTo(0, 9); g.strokeStyle = "#8a4b00"; g.lineWidth = 2; g.stroke();
    shShine(g, -12, -9, 8, 3, 0.6);
  }],
  // 🚀 the Taxman's missile (can be shot down)
  tmissile: [40, 18, (g) => {
    g.beginPath(); g.moveTo(-19, 0); g.lineTo(-9, -6); g.lineTo(14, -6); g.lineTo(14, 6); g.lineTo(-9, 6); g.closePath();
    shPaint(g, shLin(g, 0, -6, 0, 6, ["#ffd98a", "#d6402b", "#6d0f1e"]), 2);
    g.beginPath(); g.moveTo(10, -6); g.lineTo(18, -10); g.lineTo(18, 10); g.lineTo(10, 6); g.closePath(); shPaint(g, "#ffcc33", 1.5);
  }],
};
// asteroids: 4 random shapes, each drawn at its own size
function shRock(size, v) {
  return shSprite(`rock${v}-${size}`, size * 2 + 6, size * 2 + 6, (g) => {
    let s = v * 97 + 13; const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
    g.beginPath();
    const n = 11;
    for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2, r = size * (0.78 + rnd() * 0.22); g[i ? "lineTo" : "moveTo"](Math.cos(a) * r, Math.sin(a) * r); }
    g.closePath(); shPaint(g, shRad(g, -size * 0.3, -size * 0.3, 2, size * 1.1, ["#c9a27a", "#8a6446", "#4a3326"]), 3);
    for (let i = 0; i < 3; i++) {
      const a = rnd() * Math.PI * 2, d = rnd() * size * 0.45, r = size * (0.12 + rnd() * 0.12);
      g.beginPath(); g.arc(Math.cos(a) * d, Math.sin(a) * d, r, 0, Math.PI * 2); g.fillStyle = "rgba(40,25,20,0.45)"; g.fill();
    }
    shShine(g, -size * 0.35, -size * 0.4, size * 0.25, size * 0.1, 0.25);
  });
}
const shEnemySprite = (type) => { const a = SH_ENEMY_ART[type]; return shSprite("en-" + type, a[0], a[1], a[2]); };

/* ----- 💥 SHOTS ----- */
// enemy shots get a dark ring so they stand out on the bright red and green backgrounds
const SH_SHOT_ART = {
  single: [22, 10, (g) => { g.shadowColor = "#ffd34d"; g.shadowBlur = 6; g.beginPath(); g.roundRect(-9, -3, 18, 6, 3); g.fillStyle = shLin(g, -9, 0, 9, 0, ["#ff9d00", "#fff3a8"]); g.fill(); }],
  twin:   [20, 8, (g) => { g.shadowColor = "#5ef2ff"; g.shadowBlur = 6; g.beginPath(); g.roundRect(-8, -2, 16, 4, 2); g.fillStyle = shLin(g, -8, 0, 8, 0, ["#2a9dff", "#e6fdff"]); g.fill(); }],
  heavy:  [26, 16, (g) => { g.shadowColor = "#ff7a1a"; g.shadowBlur = 8; g.beginPath(); g.ellipse(0, 0, 10, 5.5, 0, 0, Math.PI * 2); g.fillStyle = shRad(g, 3, -1, 1, 11, ["#fff6c0", "#ffb21a", "#e2431a"]); g.fill(); }],
  royal:  [26, 16, (g) => { g.shadowColor = "#ff4fe0"; g.shadowBlur = 9; g.beginPath(); g.ellipse(0, 0, 10, 5, 0, 0, Math.PI * 2); g.fillStyle = shRad(g, 3, 0, 1, 11, ["#ffffff", "#6ff4ff", "#d42bd6"]); g.fill(); }],
  side:   [14, 8, (g) => { g.shadowColor = "#6ff4ff"; g.shadowBlur = 5; g.beginPath(); g.roundRect(-5, -2, 10, 4, 2); g.fillStyle = "#c6fbff"; g.fill(); }],
  spread: [16, 16, (g) => { g.shadowColor = "#ff5ce1"; g.shadowBlur = 7; g.beginPath(); g.arc(0, 0, 5, 0, Math.PI * 2); g.fillStyle = shRad(g, -1, -1, 0.5, 6, ["#ffffff", "#ff7aeb", "#b51ad6"]); g.fill(); }],
  missile:[28, 14, (g) => {
    g.beginPath(); g.moveTo(12, 0); g.lineTo(5, -4.5); g.lineTo(-10, -4.5); g.lineTo(-10, 4.5); g.lineTo(5, 4.5); g.closePath(); shPaint(g, shLin(g, 0, -4, 0, 4, ["#ffffff", "#c8cbe0", "#7b7f99"]), 1.8);
    g.beginPath(); g.moveTo(-6, -4.5); g.lineTo(-12, -8); g.lineTo(-12, 8); g.lineTo(-6, 4.5); g.closePath(); shPaint(g, "#ff8a1a", 1.5);
  }],
  // enemy shots
  eb:     [18, 18, (g) => { g.shadowColor = "#ff3b2b"; g.shadowBlur = 7; g.beginPath(); g.arc(0, 0, 6, 0, Math.PI * 2); g.fillStyle = shRad(g, -1, -1, 0.5, 7, ["#ffffff", "#ffb03b", "#ff2b2b"]); g.fill(); g.shadowBlur = 0; g.strokeStyle = "rgba(25,5,30,0.95)"; g.lineWidth = 2; g.beginPath(); g.arc(0, 0, 6.5, 0, Math.PI * 2); g.stroke(); }],
  acid:   [18, 18, (g) => { g.shadowColor = "#9dff2b"; g.shadowBlur = 7; g.beginPath(); g.arc(0, 0, 6, 0, Math.PI * 2); g.fillStyle = shRad(g, -1, -1, 0.5, 7, ["#ffffff", "#d9ff5c", "#3fae12"]); g.fill(); g.shadowBlur = 0; g.strokeStyle = "rgba(25,5,30,0.95)"; g.lineWidth = 2; g.beginPath(); g.arc(0, 0, 6.5, 0, Math.PI * 2); g.stroke(); }],
  ebBig:  [28, 28, (g) => { g.shadowColor = "#ff3b2b"; g.shadowBlur = 10; g.beginPath(); g.arc(0, 0, 10, 0, Math.PI * 2); g.fillStyle = shRad(g, -2, -2, 1, 11, ["#ffffff", "#ff8a3b", "#c4122b"]); g.fill(); g.shadowBlur = 0; g.strokeStyle = "rgba(25,5,30,0.95)"; g.lineWidth = 2; g.beginPath(); g.arc(0, 0, 10.5, 0, Math.PI * 2); g.stroke(); }],
  coin:   [22, 22, (g) => {
    g.beginPath(); g.arc(0, 0, 9, 0, Math.PI * 2); shPaint(g, shRad(g, -3, -3, 1, 10, ["#fff8c4", "#ffcc22", "#c27a00"]), 2);
    g.beginPath(); g.arc(0, 0, 5.5, 0, Math.PI * 2); g.strokeStyle = "#a35f00"; g.lineWidth = 1.5; g.stroke();
  }],
};
const shShotSprite = (k) => { const a = SH_SHOT_ART[k]; return shSprite("shot-" + k, a[0], a[1], a[2]); };

/* ----- 🎁 PICK-UPS ----- */
const SH_PICK_COL = { missile: ["#ffd08a", "#ff7a1a"], laser: ["#c6fbff", "#13b7e8"], spread: ["#ffc2f3", "#c21ad6"], heart: ["#ffc2c2", "#e0112b"] };
function shPickSprite(k) {
  if (k === "dust") return shSprite("pk-dust", 22, 22, (g) => {
    g.shadowColor = "#ffe66b"; g.shadowBlur = 8;
    g.beginPath();
    for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4 - Math.PI / 2, r = i % 2 ? 3.2 : 9; g.lineTo(Math.cos(a) * r, Math.sin(a) * r); }
    g.closePath(); g.fillStyle = shRad(g, 0, 0, 0.5, 9, ["#ffffff", "#fff27a", "#ffb300"]); g.fill();
  });
  return shSprite("pk-" + k, 40, 40, (g) => {
    const [c1, c2] = SH_PICK_COL[k];
    g.shadowColor = c2; g.shadowBlur = 10;
    g.beginPath(); g.arc(0, 0, 16, 0, Math.PI * 2); g.fillStyle = shRad(g, -5, -5, 2, 18, [c1, c2]); g.fill();
    g.shadowBlur = 0; g.strokeStyle = SH_OUT; g.lineWidth = 2.5; g.stroke();
    g.beginPath(); g.arc(0, 0, 13, 0, Math.PI * 2); g.strokeStyle = "#ffe27a"; g.lineWidth = 1.5; g.stroke();
    g.fillStyle = "#fff"; g.strokeStyle = SH_OUT; g.lineWidth = 1.8;
    g.beginPath();
    if (k === "missile") { g.moveTo(9, 0); g.lineTo(3, -4); g.lineTo(-7, -4); g.lineTo(-10, -8); g.lineTo(-10, 8); g.lineTo(-7, 4); g.lineTo(3, 4); g.closePath(); }
    if (k === "laser") { g.moveTo(2, -10); g.lineTo(-6, 2); g.lineTo(0, 2); g.lineTo(-3, 10); g.lineTo(6, -3); g.lineTo(0, -3); g.closePath(); }
    if (k === "heart") { g.moveTo(0, 8); g.bezierCurveTo(-12, -1, -7, -11, 0, -4); g.bezierCurveTo(7, -11, 12, -1, 0, 8); g.closePath(); }
    if (k === "spread") { [[-6, 0], [4, -7], [4, 7], [8, 0]].forEach(([x, y]) => { g.moveTo(x + 3.5, y); g.arc(x, y, 3.5, 0, Math.PI * 2); }); }
    g.fill(); g.stroke();
    shShine(g, -6, -8, 5, 2.5, 0.5);
  });
}

/* ----- 🌌 BACKGROUND (one look per level) ----- */
const SH_SKY = [
  { top: "#0b0b2a", bottom: "#1d1046", blobs: ["rgba(120,70,255,0.22)", "rgba(40,140,255,0.18)", "rgba(255,90,200,0.12)"], planet: ["#ffb36b", "#a8452a"] },
  { top: "#06150f", bottom: "#1a0f33", blobs: ["rgba(90,255,120,0.16)", "rgba(170,60,255,0.22)", "rgba(40,200,180,0.14)"], planet: ["#b0ff8a", "#2f7a3a"] },
  { top: "#1a0508", bottom: "#2a0a1e", blobs: ["rgba(255,60,60,0.2)", "rgba(255,170,40,0.14)", "rgba(160,30,120,0.2)"], planet: ["#ffd27a", "#8a1a1a"] },
];
function shNebula(lv) {
  return shSprite("neb" + lv, 1920, 540, (g) => {
    g.translate(-960, -270);
    const P = SH_SKY[lv - 1];
    let s = lv * 7919; const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
    for (let i = 0; i < 14; i++) {
      // keep blobs away from the seam so the strip loops without a visible edge
      const x = 180 + rnd() * 1560, y = rnd() * 540, r = 120 + rnd() * 220;
      g.fillStyle = shRad(g, x, y, 0, r, [P.blobs[i % P.blobs.length], "rgba(0,0,0,0)"]);
      g.fillRect(x - r, y - r, r * 2, r * 2);
    }
  }, 1);
}
function shPlanet(lv, r) {
  return shSprite(`planet${lv}-${r}`, r * 2 + 40, r * 2 + 40, (g) => {
    const [c1, c2] = SH_SKY[lv - 1].planet;
    g.fillStyle = shRad(g, 0, 0, r * 0.9, r + 18, ["rgba(255,255,255,0.15)", "rgba(255,255,255,0)"]); g.fillRect(-r - 20, -r - 20, r * 2 + 40, r * 2 + 40);
    g.beginPath(); g.arc(0, 0, r, 0, Math.PI * 2); g.fillStyle = shRad(g, -r * 0.35, -r * 0.35, r * 0.1, r * 1.1, [c1, c2, "#120818"]); g.fill();
    g.save(); g.clip(); g.globalAlpha = 0.18; g.fillStyle = "#fff";
    for (let i = -2; i <= 2; i++) g.fillRect(-r, i * r * 0.32 - 3, r * 2, 5);
    g.restore();
  });
}
