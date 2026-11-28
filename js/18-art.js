/* Empire of Coins © 2026 milkhunt3r. All rights reserved. */
/* =====================================================================
   🖼️ ART GALLERY: copy a painting as closely as you can.
   Unlock: 500k. Tiers: Easy (1 scoin), Medium (10 scoin), Hard (100 scoin): you earn match% of the value.
   Sell right away, or keep the painting in your Collection (10 slots; +10 slots for 500k, 750k, 1M…).
   Paintings are generated from a seed, using only the 24 colors of the player's palette.
   ===================================================================== */
const ART_SLOTS_MAX = 100;   // a collection can hold at most 100 paintings
const ART_UNLOCK = 500000, ART_SLOTS_START = 10, ART_SLOTS_STEP = 10, ART_SLOT_PRICE = 500000, ART_SLOT_PRICE_STEP = 250000;
// Tiers (Nov 2026): the old 3-shape tier is retired ("hidden": old copies in collections still show); the kid drawings became Easy,
// the detailed scenes became Normal, and 🏛️ Masterpieces (js/18a-art-masters.js) are the new top tier. Keys stay the same for old saves.
const ART_TIERS = {
  easy:   { name: "Starter", icon: "⚪", value: 1e6, desc: "3–4 simple shapes", hidden: true },
  medium: { name: "Easy",    icon: "🟢", value: 1e7, desc: "Kid-style drawings: houses, flowers, trees, boats, cars, rockets, snowmen, rainbows, mushrooms, balloons, ice cream, castles, fish, butterflies" },
  hard:   { name: "Normal",  icon: "🟡", value: 1e8, desc: "Detailed scenes with many colors: mountains, city, seaside, desert, winter, farm, underwater or space" },
  master: { name: "Masterpiece", icon: "🏛️", value: 1e9, desc: "10 famous paintings, simplified: The Starry Night, The Great Wave, Mona Lisa, The Scream and more" },
};
const ART_TIER_LIST = () => Object.keys(ART_TIERS).filter(k => !ART_TIERS[k].hidden);
// 24 colours (8 added in Nov 2026: slate, tan, maroon, salmon, ochre, olive, turquoise, lavender), in palette order
const ART_PAL = {
  white: "#ffffff", gray: "#8d8d8d", slate: "#455a64", black: "#1b1b1b",
  beige: "#ffe0b2", tan: "#c8a27a", brown: "#6d4c41", maroon: "#8e1b2b",
  red: "#e53935", salmon: "#ff8a65", pink: "#f48fb1", orange: "#fb8c00",
  ochre: "#c9a227", yellow: "#fdd835", lime: "#8bc34a", olive: "#6b7d2a",
  green: "#2e7d32", teal: "#00897b", turquoise: "#26c6da", sky: "#81d4fa",
  blue: "#1e88e5", navy: "#1a237e", lavender: "#b39ddb", purple: "#8e24aa",
};
const ART_W = 320, ART_H = 240;
// Unlocks: the gallery opens after the 💵 Millionaire achievement (and costs ART_UNLOCK);
// Medium needs 5 submitted Easy paintings, Hard needs 10 submitted Medium paintings (sold or kept)
const ART_TIER_NEED = { hard: { tier: "medium", count: 5 }, master: { tier: "hard", count: 10 } };
const artGalleryReady = () => !!(state.achievements && state.achievements.cash1s);
if (!state.art) state.art = { unlocked: false, slots: ART_SLOTS_START, slotBuys: 0, items: [], tier: "medium", seed: 0, page: "studio", sold: 0 };

// Seeded random numbers, so a painting can be drawn again from its seed
function artRng(seed) {
  let a = seed >>> 0;
  return () => { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
function paintArt(ctx, tier, seed) {
  const R = artRng(seed), rnd = (a, b) => a + R() * (b - a), ri = (a, b) => Math.floor(rnd(a, b + 1)), pick = (arr) => arr[Math.floor(R() * arr.length)];
  const P = ART_PAL;
  const fill = (c) => { ctx.fillStyle = c; };
  const rect = (c, x, y, w, h) => { fill(c); ctx.fillRect(x, y, w, h); };
  const circ = (c, x, y, r) => { fill(c); ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill(); };
  const ell = (c, x, y, rx, ry, rot = 0) => { fill(c); ctx.beginPath(); ctx.ellipse(x, y, rx, ry, rot, 0, Math.PI * 2); ctx.fill(); };
  const poly = (c, pts) => { fill(c); ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]); pts.slice(1).forEach(p => ctx.lineTo(p[0], p[1])); ctx.closePath(); ctx.fill(); };
  const line = (c, w, pts) => { ctx.strokeStyle = c; ctx.lineWidth = w; ctx.lineCap = "round"; ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]); pts.slice(1).forEach(p => ctx.lineTo(p[0], p[1])); ctx.stroke(); };
  ctx.save();
  rect(P.white, 0, 0, ART_W, ART_H);
  if (tier === "master") { ART_MASTERS[seed % ART_MASTERS.length].draw({ P, rect, circ, ell, poly, line }); ctx.restore(); return; }   // 🏛️ js/18a-art-masters.js
  if (tier === "easy") {
    // 3–4 big shapes in different colors, spread over the canvas
    const colors = ["red", "orange", "yellow", "green", "blue", "navy", "purple", "pink", "teal", "brown", "black", "lime"].sort(() => R() - 0.5);
    const n = ri(3, 4), cells = [[0, 0], [1, 0], [0, 1], [1, 1]].sort(() => R() - 0.5);
    for (let i = 0; i < n; i++) {
      const [cx, cy] = cells[i], c = P[colors[i]], s = rnd(70, 105);
      const x = cx * 160 + rnd(s / 2 + 8, 160 - s / 2 - 8), y = cy * 120 + rnd(s / 2 + 6, 120 - s / 2 - 6);
      const kind = pick(["circle", "square", "rect", "triangle"]);
      if (kind === "circle") circ(c, x, y, s / 2 * 0.9);
      else if (kind === "square") rect(c, x - s / 2 * 0.85, y - s / 2 * 0.85, s * 0.85, s * 0.85);
      else if (kind === "rect") rect(c, x - s * 0.6, y - s * 0.32, s * 1.2, s * 0.64);
      else poly(c, [[x, y - s / 2], [x + s / 2, y + s / 2], [x - s / 2, y + s / 2]]);
    }
  } else if (tier === "medium") {
    // Medium: kid-style drawings with big simple shapes and a few colors (14 kinds)
    const scene = pick(["house", "flower", "tree", "boat", "car", "rocket", "snowman", "rainbow", "mushroom", "balloons", "icecream", "castle", "fish", "butterfly"]);
    const skyC = pick([P.sky, P.sky, P.white]);
    const sunX = pick([50, 270]), sunR = rnd(22, 30);
    const ground = (c = P.lime, y = 185) => rect(c, 0, y, ART_W, ART_H - y);
    const sun = () => circ(P.yellow, sunX, 45, sunR);
    const cloud = (x, y, s = 1) => { circ(P.white, x, y, 14 * s); circ(P.white, x + 16 * s, y - 7 * s, 17 * s); circ(P.white, x + 34 * s, y, 14 * s); };
    rect(skyC, 0, 0, ART_W, ART_H);
    if (scene === "house") {
      ground(); sun();
      const hx = rnd(85, 135), hw = rnd(110, 130), hy = 110, wall = pick([P.red, P.orange, P.yellow, P.beige, P.pink, P.salmon, P.tan, P.lavender]);
      if (R() < 0.5) rect(P.brown, hx + hw * 0.7, hy - 55, 16, 40);   // chimney
      rect(wall, hx, hy, hw, 80);
      poly(pick([P.brown, P.red, P.navy, P.maroon, P.slate]), [[hx - 12, hy], [hx + hw / 2, hy - rnd(55, 70)], [hx + hw + 12, hy]]);
      rect(P.brown, hx + hw * 0.58, hy + 35, 26, 45);
      const win = pick([P.blue, P.sky, P.yellow, P.turquoise]);
      rect(win, hx + hw * 0.14, hy + 20, 30, 28);
    } else if (scene === "flower") {
      ground(); sun();
      const n = ri(1, 3), pc = pick([P.red, P.pink, P.purple, P.orange, P.blue, P.salmon, P.lavender, P.maroon]);
      for (let f = 0; f < n; f++) {
        const fx = n === 1 ? rnd(130, 190) : 60 + f * (200 / (n - 1)) + rnd(-10, 10), fy = rnd(75, 110), k = ri(5, 6), r = n === 1 ? 26 : 20;
        rect(P.green, fx - 4, fy, 8, 190 - fy);
        ell(P.green, fx - 20, fy + 60, 20, 8, -0.5);
        for (let i = 0; i < k; i++) { const a = i / k * Math.PI * 2; circ(n === 1 ? pc : pick([P.red, P.pink, P.purple, P.orange, P.salmon, P.lavender]), fx + Math.cos(a) * r, fy + Math.sin(a) * r, r * 0.7); }
        circ(pick([P.yellow, P.brown, P.orange, P.ochre]), fx, fy, r * 0.6);
      }
    } else if (scene === "tree") {
      ground(); sun();
      const tx = rnd(120, 200);
      rect(P.brown, tx - 13, 120, 26, 70);
      circ(P.green, tx, 100, 48); circ(P.green, tx - 38, 120, 32); circ(P.green, tx + 38, 120, 32);
      if (R() < 0.7) for (let i = 0; i < ri(3, 5); i++) circ(P.red, tx + rnd(-50, 50), rnd(80, 130), 7);
    } else if (scene === "boat") {
      rect(P.blue, 0, 160, ART_W, 80);
      sun();
      const bx = rnd(100, 200);
      poly(P.brown, [[bx - 70, 160], [bx + 70, 160], [bx + 48, 190], [bx - 48, 190]]);
      rect(P.brown, bx - 3, 55, 6, 105);
      poly(pick([P.white, P.red, P.orange, P.salmon]), [[bx + 6, 60], [bx + 6, 150], [bx + 70, 150]]);
      poly(pick([P.yellow, P.pink, P.white, P.lavender]), [[bx - 6, 75], [bx - 6, 150], [bx - 55, 150]]);
    } else if (scene === "car") {
      ground(P.lime, 170); rect(P.gray, 0, 190, ART_W, 50); sun();
      if (R() < 0.6) cloud(rnd(110, 200), rnd(40, 60));
      const cx = rnd(40, 110), body = pick([P.red, P.blue, P.yellow, P.orange, P.purple, P.turquoise, P.maroon, P.olive]);
      poly(body, [[cx + 40, 160], [cx + 60, 125], [cx + 130, 125], [cx + 150, 160]]);
      rect(body, cx, 158, 190, 40);
      rect(P.sky, cx + 64, 132, 30, 24); rect(P.sky, cx + 100, 132, 30, 24);
      circ(P.black, cx + 45, 200, 20); circ(P.black, cx + 145, 200, 20);
      circ(P.gray, cx + 45, 200, 8); circ(P.gray, cx + 145, 200, 8);
      rect(P.yellow, cx + 178, 165, 12, 10);
    } else if (scene === "rocket") {
      rect(P.navy, 0, 0, ART_W, ART_H);
      for (let i = 0; i < ri(5, 8); i++) circ(P.yellow, rnd(15, 305), rnd(15, 225), rnd(3, 6));
      circ(P.beige, pick([55, 265]), rnd(50, 80), rnd(24, 32));
      const rx = rnd(130, 190), ry = rnd(60, 80);
      poly(P.red, [[rx, ry], [rx + 26, ry + 40], [rx - 26, ry + 40]]);
      rect(P.white, rx - 26, ry + 40, 52, 90);
      circ(P.sky, rx, ry + 70, 13);
      poly(P.red, [[rx - 26, ry + 95], [rx - 50, ry + 135], [rx - 26, ry + 130]]); poly(P.red, [[rx + 26, ry + 95], [rx + 50, ry + 135], [rx + 26, ry + 130]]);
      poly(P.orange, [[rx - 20, ry + 130], [rx + 20, ry + 130], [rx, ry + 170]]); poly(P.yellow, [[rx - 10, ry + 130], [rx + 10, ry + 130], [rx, ry + 152]]);
    } else if (scene === "snowman") {
      rect(P.sky, 0, 0, ART_W, ART_H); ground(P.white, 180);
      for (let i = 0; i < 10; i++) circ(P.white, rnd(10, 310), rnd(10, 170), rnd(3, 5));
      const sx = rnd(120, 200);
      circ(P.white, sx, 175, 42); circ(P.white, sx, 112, 32); circ(P.white, sx, 62, 24);
      rect(P.black, sx - 22, 30, 44, 8); rect(P.black, sx - 14, 4, 28, 28);
      circ(P.black, sx - 8, 58, 3); circ(P.black, sx + 8, 58, 3);
      poly(P.orange, [[sx, 64], [sx + 22, 68], [sx, 71]]);
      for (const y of [102, 118, 134]) circ(P.black, sx, y, 3.5);
      line(P.brown, 5, [[sx - 30, 110], [sx - 70, 85]]); line(P.brown, 5, [[sx + 30, 110], [sx + 70, 85]]);
      rect(pick([P.red, P.blue, P.green, P.purple, P.maroon, P.turquoise]), sx - 26, 82, 52, 9);
    } else if (scene === "rainbow") {
      rect(P.sky, 0, 0, ART_W, ART_H);
      const cx = rnd(140, 180), cy = 200;
      [P.red, P.orange, P.yellow, P.green, P.blue, P.purple].forEach((c, i) => circ(c, cx, cy, 130 - i * 14));
      circ(P.sky, cx, cy, 130 - 6 * 14);
      ground(P.lime, 190);
      cloud(cx - 150, 185, 1.3); cloud(cx + 95, 185, 1.3);
      if (R() < 0.5) circ(P.yellow, pick([40, 285]), 40, 22);
    } else if (scene === "mushroom") {
      ground(P.green, 200);
      if (skyC !== P.white) sun();
      const n = ri(1, 2);
      for (let m = 0; m < n; m++) {
        const mx = n === 1 ? rnd(130, 190) : 90 + m * 140, s = n === 1 ? 1 : 0.75, cap = pick([P.red, P.orange, P.purple, P.maroon, P.salmon]);
        rect(P.beige, mx - 22 * s, 200 - 80 * s, 44 * s, 80 * s);
        fill(cap); ctx.beginPath(); ctx.ellipse(mx, 200 - 78 * s, 85 * s, 70 * s, 0, Math.PI, 0); ctx.fill();
        circ(P.white, mx - 40 * s, 200 - 110 * s, 12 * s); circ(P.white, mx + 10 * s, 200 - 130 * s, 14 * s); circ(P.white, mx + 48 * s, 200 - 100 * s, 10 * s);
      }
      for (let i = 0; i < 8; i++) poly(P.lime, (() => { const gx = rnd(0, 310); return [[gx, 200], [gx + 5, 186], [gx + 10, 200]]; })());
    } else if (scene === "balloons") {
      rect(P.sky, 0, 0, ART_W, ART_H);
      cloud(rnd(20, 90), rnd(190, 210)); cloud(rnd(200, 260), rnd(190, 215));
      const n = ri(3, 4), kx = rnd(140, 180), ky = 215;
      const cols = [P.red, P.yellow, P.blue, P.pink, P.purple, P.orange, P.green].sort(() => R() - 0.5);
      for (let i = 0; i < n; i++) {
        const bx = kx + (i - (n - 1) / 2) * 52 + rnd(-8, 8), by = rnd(55, 95);
        line(P.black, 2, [[bx, by + 38], [kx, ky]]);
        ell(cols[i], bx, by, 30, 38);
        poly(cols[i], [[bx, by + 36], [bx + 6, by + 46], [bx - 6, by + 46]]);
      }
    } else if (scene === "icecream") {
      rect(pick([P.white, P.pink, P.sky, P.lavender]), 0, 0, ART_W, ART_H);
      const ix = rnd(130, 190), scoops = ri(1, 3);
      poly(pick([P.orange, P.brown, P.tan, P.ochre]), [[ix - 45, 140], [ix + 45, 140], [ix, 230]]);
      const flav = [P.pink, P.beige, P.brown, P.lime, P.yellow].sort(() => R() - 0.5);
      for (let i = 0; i < scoops; i++) circ(flav[i], ix, 125 - i * 42, 46);
      circ(P.red, ix, 125 - (scoops - 1) * 42 - 50, 11);
      line(P.green, 3, [[ix, 125 - (scoops - 1) * 42 - 60], [ix + 10, 125 - (scoops - 1) * 42 - 76]]);
    } else if (scene === "castle") {
      ground(); sun();
      const cx = rnd(70, 110), wall = pick([P.gray, P.beige, P.pink, P.tan, P.lavender]), roof = pick([P.red, P.blue, P.purple, P.maroon, P.slate]);
      rect(wall, cx + 30, 100, 120, 90);
      for (let i = 0; i < 4; i++) rect(wall, cx + 34 + i * 30, 88, 18, 14);
      for (const tx of [cx, cx + 150]) { rect(wall, tx, 80, 40, 110); poly(roof, [[tx - 6, 80], [tx + 20, 30], [tx + 46, 80]]); }
      fill(P.brown); ctx.beginPath(); ctx.moveTo(cx + 72, 190); ctx.lineTo(cx + 72, 150); ctx.arc(cx + 90, 150, 18, Math.PI, 0); ctx.lineTo(cx + 108, 190); ctx.fill();
      rect(P.black, cx + 14, 110, 12, 18); rect(P.black, cx + 164, 110, 12, 18);
      line(P.black, 2, [[cx + 20, 30], [cx + 20, 10]]); poly(pick([P.yellow, P.red, P.green]), [[cx + 20, 10], [cx + 38, 15], [cx + 20, 20]]);
    } else if (scene === "fish") {
      rect(P.blue, 0, 0, ART_W, ART_H); ground(P.beige, 205);
      for (let i = 0; i < ri(2, 3); i++) { const wx = rnd(20, 300); line(P.green, 6, [[wx, 205], [wx - 8, 180], [wx + 6, 160], [wx - 4, 140]]); }
      const n = ri(1, 2);
      for (let f = 0; f < n; f++) {
        const fx = n === 1 ? rnd(130, 190) : 90 + f * 140, fy = rnd(80, 140), s = n === 1 ? 1 : 0.7, c = pick([P.orange, P.yellow, P.red, P.pink, P.purple, P.salmon, P.turquoise]), d = R() < 0.5 ? 1 : -1;
        poly(c, [[fx - d * 50 * s, fy], [fx - d * 90 * s, fy - 35 * s], [fx - d * 90 * s, fy + 35 * s]]);
        ell(c, fx, fy, 60 * s, 38 * s);
        circ(P.white, fx + d * 30 * s, fy - 8 * s, 10 * s); circ(P.black, fx + d * 32 * s, fy - 8 * s, 5 * s);
      }
      for (let i = 0; i < 5; i++) circ(P.white, rnd(30, 300), rnd(20, 120), rnd(4, 8));
    } else {   // butterfly
      ground(); sun();
      const bx = rnd(130, 190), by = rnd(95, 120), w1 = pick([P.purple, P.blue, P.orange, P.pink, P.red, P.turquoise, P.maroon]), w2 = pick([P.yellow, P.pink, P.sky, P.lime, P.lavender, P.salmon]);
      ell(w1, bx - 38, by - 25, 38, 30, -0.4); ell(w1, bx + 38, by - 25, 38, 30, 0.4);
      ell(w2, bx - 30, by + 25, 26, 22, 0.4); ell(w2, bx + 30, by + 25, 26, 22, -0.4);
      circ(w2, bx - 40, by - 28, 10); circ(w2, bx + 40, by - 28, 10);
      ell(P.black, bx, by, 7, 42);
      line(P.black, 2, [[bx - 3, by - 40], [bx - 18, by - 65]]); line(P.black, 2, [[bx + 3, by - 40], [bx + 18, by - 65]]);
      circ(P.black, bx - 18, by - 65, 4); circ(P.black, bx + 18, by - 65, 4);
    }
  } else {
    // Hard: one of 8 detailed scenes, each with its own random layout and time of day
    const scene = pick(["mountains", "city", "seaside", "desert", "winter", "farm", "underwater", "space"]);
    const time = pick(["day", "sunset", "night"]);
    const skyOf = (t) => t === "day" ? P.sky : t === "sunset" ? P.orange : P.navy;
    const stars = (n, y1 = 120) => { for (let i = 0; i < n; i++) circ(P.white, rnd(5, 315), rnd(5, y1), rnd(1.2, 2.4)); };
    const clouds = (n) => { for (let i = 0; i < n; i++) { const cx = rnd(20, 280), cy = rnd(18, 60); circ(P.white, cx, cy, 13); circ(P.white, cx + 15, cy - 6, 15); circ(P.white, cx + 30, cy, 12); } };
    const birds = (n, y0 = 60, y1 = 110) => { for (let i = 0; i < n; i++) { const bx = rnd(40, 280), by = rnd(y0, y1); line(P.black, 2, [[bx - 7, by - 4], [bx, by], [bx + 7, by - 4]]); } };
    const skyAndSun = () => {
      rect(skyOf(time), 0, 0, ART_W, ART_H);
      if (time === "sunset") rect(P.yellow, 0, 70, ART_W, 45);
      if (time === "night") stars(18);
      circ(time === "night" ? P.beige : P.yellow, rnd(40, 280), rnd(30, 70), rnd(16, 24));
      if (time !== "night") clouds(ri(1, 3));
    };
    const pine = (x, y, h, c = P.green, snow = false) => { rect(P.brown, x - 3, y - 10, 6, 14); poly(c, [[x, y - h], [x + h * 0.35, y - 8], [x - h * 0.35, y - 8]]); if (snow) poly(P.white, [[x, y - h], [x + h * 0.12, y - h * 0.7], [x - h * 0.12, y - h * 0.7]]); };
    if (scene === "mountains") {
      const time = pick(["day", "sunset", "night"]);
      const sky = time === "day" ? P.sky : time === "sunset" ? P.orange : P.navy;
      rect(sky, 0, 0, ART_W, ART_H);
      if (time === "sunset") rect(P.yellow, 0, 70, ART_W, 45);
      if (time === "night") for (let i = 0; i < 18; i++) circ(P.white, rnd(5, 315), rnd(5, 110), rnd(1.2, 2.4));
      circ(time === "night" ? P.beige : P.yellow, rnd(40, 280), rnd(30, 70), rnd(16, 24));
      if (time !== "night") for (let i = 0; i < ri(2, 3); i++) { const cx = rnd(30, 290), cy = rnd(20, 60); circ(P.white, cx, cy, 13); circ(P.white, cx + 15, cy - 6, 15); circ(P.white, cx + 30, cy, 12); }
      const far = time === "night" ? P.purple : P.gray, near = time === "night" ? P.navy : pick([P.purple, P.brown, P.slate, P.olive]);
      const peaks = (c, base, hmin, hmax, step) => { const pts = [[0, ART_H]]; for (let x = 0; x <= ART_W; x += step) pts.push([x, base - (x / step) % 2 * rnd(hmin, hmax) - rnd(0, 10)]); pts.push([ART_W, ART_H]); poly(c, pts); };
      peaks(far, 150, 40, 70, 40);
      peaks(near, 170, 25, 45, 32);
      rect(time === "night" ? P.green : P.lime, 0, 175, ART_W, 65);
      rect(time === "night" ? P.navy : P.blue, rnd(10, 60), 192, rnd(110, 170), 26);
      for (let i = 0; i < ri(4, 6); i++) { const x = rnd(10, 310), y = rnd(185, 230), h = rnd(28, 45); rect(P.brown, x - 3, y - 10, 6, 14); poly(P.green, [[x, y - h], [x + h * 0.35, y - 8], [x - h * 0.35, y - 8]]); }
      const hx = rnd(200, 255), hy = 178;
      rect(pick([P.red, P.beige, P.pink, P.tan, P.salmon]), hx, hy, 46, 34); poly(P.brown, [[hx - 6, hy], [hx + 23, hy - 22], [hx + 52, hy]]);
      rect(time === "night" ? P.yellow : P.sky, hx + 6, hy + 8, 11, 10); rect(P.black, hx + 28, hy + 14, 10, 20);
      for (let i = 0; i < ri(2, 4); i++) { const bx = rnd(60, 260), by = rnd(70, 110); line(P.black, 2, [[bx - 7, by - 4], [bx, by], [bx + 7, by - 4]]); }
      for (let i = 0; i < ri(5, 8); i++) circ(pick([P.red, P.yellow, P.pink, P.white]), rnd(5, 315), rnd(220, 236), 3);

    } else if (scene === "city") {
      // skyline: buildings with window grids, a street with cars
      skyAndSun();
      let x = rnd(-10, 5);
      while (x < ART_W) {
        const w = rnd(30, 52), h = rnd(70, 165), c = pick([P.gray, P.navy, P.purple, P.brown, P.teal, P.black, P.slate, P.maroon, P.tan]);
        rect(c, x, 200 - h, w, h);
        if (R() < 0.3) rect(c, x + w * 0.35, 200 - h - 18, w * 0.3, 18);   // tower on top
        const win = time === "night" ? P.yellow : time === "sunset" ? P.orange : P.sky;
        for (let wy = 200 - h + 8; wy < 190; wy += 14) for (let wx = x + 5; wx < x + w - 8; wx += 10) if (R() < 0.75) rect(win, wx, wy, 5, 7);
        x += w + rnd(0, 6);
      }
      rect(P.black, 0, 200, ART_W, 40);
      for (let i = 0; i < 8; i++) rect(P.yellow, i * 42 + 6, 218, 22, 4);
      for (let i = 0; i < ri(2, 4); i++) { const cx = rnd(10, 280), cy = pick([204, 226]); rect(pick([P.red, P.blue, P.yellow, P.white, P.lime, P.turquoise, P.salmon]), cx, cy, 34, 10); circ(P.gray, cx + 8, cy + 10, 4); circ(P.gray, cx + 26, cy + 10, 4); }
    } else if (scene === "seaside") {
      // beach with a lighthouse, sea, boats and palm trees
      skyAndSun();
      const sea = time === "night" ? P.navy : P.blue, beachY = rnd(175, 190);
      rect(sea, 0, 120, ART_W, ART_H - 120);
      for (let i = 0; i < 6; i++) { const wx = rnd(10, 270), wy = rnd(132, beachY - 10); line(time === "night" ? P.blue : P.sky, 2, [[wx, wy], [wx + 14, wy - 3], [wx + 28, wy]]); }
      poly(P.beige, [[0, beachY], [ART_W, beachY - rnd(0, 20)], [ART_W, ART_H], [0, ART_H]]);
      const lx = pick([rnd(30, 70), rnd(250, 290)]);
      circ(P.gray, lx, beachY + 4, 26);
      for (let k = 0; k < 4; k++) poly(k % 2 ? P.white : P.red, [[lx - 13 + k * 1.5, beachY - k * 22], [lx + 13 - k * 1.5, beachY - k * 22], [lx + 12 - (k + 1) * 1.5, beachY - (k + 1) * 22], [lx - 12 + (k + 1) * 1.5, beachY - (k + 1) * 22]]);
      rect(time === "night" ? P.yellow : P.black, lx - 8, beachY - 104, 16, 14); poly(P.red, [[lx - 12, beachY - 104], [lx, beachY - 120], [lx + 12, beachY - 104]]);
      for (let i = 0; i < ri(1, 3); i++) { const bx = rnd(110, 230), by = rnd(130, beachY - 15); poly(P.brown, [[bx - 18, by], [bx + 18, by], [bx + 12, by + 8], [bx - 12, by + 8]]); poly(pick([P.white, P.red, P.yellow]), [[bx + 2, by - 2], [bx + 2, by - 30], [bx + 20, by - 2]]); }
      for (let i = 0; i < ri(1, 2); i++) { const px = rnd(120, 230), py = beachY + rnd(10, 30); line(P.brown, 6, [[px, py], [px + 6, py - 45]]); for (let a = 0; a < 5; a++) ell(P.green, px + 6 + Math.cos(a * 1.25) * 16, py - 45 + Math.sin(a * 1.25) * 6, 18, 6, a * 1.25); }
      if (R() < 0.7) { const ux = rnd(170, 290), uy = beachY + rnd(22, 40); line(P.black, 2, [[ux, uy], [ux, uy - 28]]); poly(pick([P.red, P.pink, P.orange, P.purple, P.turquoise, P.salmon]), [[ux - 22, uy - 26], [ux, uy - 40], [ux + 22, uy - 26]]); }
    } else if (scene === "desert") {
      // dunes, pyramids, cacti
      skyAndSun();
      const pyr = (x, base, h) => { poly(P.beige, [[x - h, base], [x, base - h], [x + h, base]]); poly(P.orange, [[x, base - h], [x + h, base], [x + h * 0.25, base]]); };
      for (let i = 0; i < ri(1, 3); i++) pyr(rnd(60, 260), 170, rnd(35, 70));
      ell(P.yellow, rnd(40, 120), 205, 170, 45);
      ell(P.orange, rnd(200, 280), 222, 170, 40);
      ell(P.beige, rnd(100, 220), 245, 200, 30);
      for (let i = 0; i < ri(2, 4); i++) { const cx = rnd(20, 300), cy = rnd(190, 225), h = rnd(26, 42); rect(P.green, cx - 5, cy - h, 10, h); rect(P.green, cx - 16, cy - h * 0.7, 6, h * 0.35); rect(P.green, cx - 16, cy - h * 0.45, 12, 5); rect(P.green, cx + 10, cy - h * 0.8, 6, h * 0.3); rect(P.green, cx + 4, cy - h * 0.55, 12, 5); }
      birds(ri(1, 3), 40, 90);
    } else if (scene === "winter") {
      // snowy mountains, pine trees, a cabin with smoke, falling snow
      const wt = pick(["day", "night"]);
      rect(wt === "day" ? P.sky : P.navy, 0, 0, ART_W, ART_H);
      if (wt === "night") { stars(14); circ(P.beige, rnd(40, 280), rnd(30, 60), 18); }
      for (let i = 0; i < ri(2, 3); i++) { const mx = rnd(30, 290), h = rnd(70, 110), w = rnd(70, 110); poly(P.gray, [[mx - w, 175], [mx, 175 - h], [mx + w, 175]]); poly(P.white, [[mx, 175 - h], [mx + w * 0.3, 175 - h * 0.7], [mx + w * 0.1, 175 - h * 0.62], [mx - w * 0.1, 175 - h * 0.72], [mx - w * 0.3, 175 - h * 0.7]]); }
      rect(P.white, 0, 170, ART_W, 70);
      const cx = rnd(120, 220), cy = 200;
      rect(P.brown, cx, cy - 34, 56, 34); poly(P.white, [[cx - 8, cy - 32], [cx + 28, cy - 58], [cx + 64, cy - 32]]);
      rect(P.gray, cx + 40, cy - 64, 9, 20); circ(P.gray, cx + 48, cy - 74, 6); circ(P.gray, cx + 56, cy - 86, 8); circ(P.gray, cx + 66, cy - 100, 10);
      rect(P.yellow, cx + 8, cy - 26, 12, 10); rect(P.red, cx + 30, cy - 22, 12, 22);
      for (let i = 0; i < ri(4, 7); i++) pine(rnd(10, 310), rnd(195, 236), rnd(30, 50), P.green, true);
      for (let i = 0; i < 26; i++) circ(P.white, rnd(5, 315), rnd(5, 165), rnd(1.5, 3));
      if (R() < 0.6) { const sx = rnd(30, 100), sy = 222; circ(P.white, sx, sy, 11); circ(P.white, sx, sy - 16, 8); circ(P.black, sx - 3, sy - 18, 1.5); circ(P.black, sx + 3, sy - 18, 1.5); poly(P.orange, [[sx, sy - 16], [sx + 10, sy - 14], [sx, sy - 13]]); }
    } else if (scene === "farm") {
      // rolling hills, a red barn, a fence, fields and animals
      skyAndSun();
      ell(P.green, rnd(40, 120), 175, 180, 50);
      ell(P.lime, rnd(200, 280), 185, 190, 50);
      rect(P.lime, 0, 195, ART_W, 45);
      for (let i = 0; i < 4; i++) rect(i % 2 ? P.yellow : P.green, 0, 205 + i * 9, ART_W, 5);
      const bx = rnd(30, 170), by = 190;
      rect(P.red, bx, by - 50, 70, 50); poly(P.brown, [[bx - 6, by - 50], [bx + 35, by - 78], [bx + 76, by - 50]]);
      rect(P.white, bx + 24, by - 32, 22, 32); line(P.white, 3, [[bx + 24, by - 32], [bx + 46, by]]); line(P.white, 3, [[bx + 46, by - 32], [bx + 24, by]]);
      if (R() < 0.7) { const sx = bx + 85; rect(P.gray, sx, by - 70, 22, 70); ell(P.gray, sx + 11, by - 70, 11, 8); }
      for (let x = 4; x < ART_W; x += 18) rect(P.brown, x, 186, 4, 18);
      rect(P.brown, 0, 190, ART_W, 3); rect(P.brown, 0, 198, ART_W, 3);
      for (let i = 0; i < ri(1, 3); i++) { const ax = rnd(200, 300), ay = rnd(160, 178), col = pick([P.white, P.pink, P.brown, P.tan]); ell(col, ax, ay, 14, 9); circ(col, ax + 14, ay - 5, 6); rect(P.black, ax - 9, ay + 6, 3, 8); rect(P.black, ax + 6, ay + 6, 3, 8); if (col === P.white) { circ(P.black, ax - 3, ay - 2, 3); circ(P.black, ax + 5, ay + 2, 2.5); } }
      birds(ri(1, 3), 50, 90);
    } else if (scene === "underwater") {
      // sea floor with fish, seaweed, coral and bubbles
      rect(P.sky, 0, 0, ART_W, 60); rect(P.blue, 0, 60, ART_W, 90); rect(P.navy, 0, 150, ART_W, 90);
      poly(P.beige, [[0, 205], [80, 195], [160, 208], [240, 196], [ART_W, 204], [ART_W, ART_H], [0, ART_H]]);
      for (let i = 0; i < ri(4, 7); i++) { const sx = rnd(10, 310), h = rnd(40, 90); const pts = []; for (let k = 0; k <= 6; k++) pts.push([sx + (k % 2 ? 6 : -6), 205 - h * k / 6]); line(pick([P.green, P.lime, P.teal, P.olive]), 5, pts); }
      for (let i = 0; i < ri(2, 4); i++) { const cx = rnd(20, 300), cy = rnd(200, 215), c = pick([P.pink, P.orange, P.red, P.purple, P.salmon, P.lavender]); circ(c, cx, cy, 10); circ(c, cx - 10, cy - 8, 7); circ(c, cx + 9, cy - 10, 7); circ(c, cx, cy - 18, 6); }
      for (let i = 0; i < ri(4, 7); i++) { const fx = rnd(30, 290), fy = rnd(50, 180), s = rnd(10, 18), c = pick([P.orange, P.yellow, P.red, P.pink, P.lime, P.purple, P.turquoise, P.salmon]), dir = R() < 0.5 ? 1 : -1; ell(c, fx, fy, s, s * 0.55); poly(c, [[fx - dir * s * 0.8, fy], [fx - dir * s * 1.6, fy - s * 0.5], [fx - dir * s * 1.6, fy + s * 0.5]]); circ(P.black, fx + dir * s * 0.5, fy - s * 0.12, 2); }
      if (R() < 0.6) { const sx = rnd(40, 280), sy = rnd(220, 232); for (let a = 0; a < 5; a++) line(P.orange, 5, [[sx, sy], [sx + Math.cos(a * 1.257 - 1.57) * 10, sy + Math.sin(a * 1.257 - 1.57) * 10]]); }
      for (let i = 0; i < 12; i++) circ(P.white, rnd(10, 310), rnd(20, 190), rnd(2, 4));
    } else {
      // space: planets, a moon, a rocket and stars
      rect(pick([P.navy, P.black]), 0, 0, ART_W, ART_H);
      stars(40, 235);
      const big = { x: rnd(60, 260), y: rnd(60, 180), r: rnd(28, 44), c: pick([P.orange, P.purple, P.teal, P.red, P.lime, P.turquoise, P.salmon, P.ochre]) };
      if (R() < 0.6) ell(P.beige, big.x, big.y, big.r * 1.9, big.r * 0.45, -0.3);
      circ(big.c, big.x, big.y, big.r);
      ell(pick([P.yellow, P.pink, P.white]), big.x, big.y - big.r * 0.3, big.r * 0.9, big.r * 0.12);
      ell(pick([P.yellow, P.pink, P.white]), big.x, big.y + big.r * 0.25, big.r * 0.85, big.r * 0.1);
      for (let i = 0; i < ri(2, 3); i++) circ(pick([P.blue, P.pink, P.green, P.gray, P.yellow, P.lavender, P.maroon]), rnd(20, 300), rnd(20, 220), rnd(8, 18));
      const mx = rnd(30, 290), my = rnd(25, 70); circ(P.gray, mx, my, 16); circ(P.white, mx - 5, my - 4, 4); circ(P.white, mx + 6, my + 5, 3);
      const rx = rnd(60, 260), ry = rnd(90, 200);
      poly(P.white, [[rx, ry - 40], [rx + 12, ry - 22], [rx + 12, ry + 14], [rx - 12, ry + 14], [rx - 12, ry - 22]]);
      circ(P.sky, rx, ry - 14, 6);
      poly(P.red, [[rx - 12, ry + 2], [rx - 22, ry + 20], [rx - 12, ry + 14]]); poly(P.red, [[rx + 12, ry + 2], [rx + 22, ry + 20], [rx + 12, ry + 14]]);
      poly(P.orange, [[rx - 9, ry + 14], [rx + 9, ry + 14], [rx, ry + 36]]); poly(P.yellow, [[rx - 5, ry + 14], [rx + 5, ry + 14], [rx, ry + 27]]);
    }
  }
  ctx.restore();
}
function artCanvasOf(tier, seed, w = ART_W) {
  const c = document.createElement("canvas"); c.width = ART_W; c.height = ART_H;
  paintArt(c.getContext("2d"), tier, seed);
  if (w === ART_W) return c;
  const s = document.createElement("canvas"); s.width = w; s.height = Math.round(w * ART_H / ART_W);
  s.getContext("2d").drawImage(c, 0, 0, s.width, s.height);
  return s;
}

/* ----- Match score: compares the two pictures the way a person would.
   Both are shrunk to 40×30 cells and softly blurred (so small wobbles and offsets of a few pixels don't matter).
   Colors: how close each cell's color is (perceptual Lab distance).
   Shapes: does each cell have the right palette color nearby (within one cell)?
   Both are measured against an empty white canvas, so blank = 0% and a perfect copy = 100%. ----- */
const GW = 40, GH = 30;
function artGrid(canvas, passes = 1) {
  const d = canvas.getContext("2d").getImageData(0, 0, ART_W, ART_H).data, cw = ART_W / GW, ch = ART_H / GH;
  const g = new Float32Array(GW * GH * 3);
  for (let y = 0; y < ART_H; y++) for (let x = 0; x < ART_W; x++) {
    const i = (y * ART_W + x) * 4, k = (Math.floor(y / ch) * GW + Math.floor(x / cw)) * 3;
    g[k] += d[i]; g[k + 1] += d[i + 1]; g[k + 2] += d[i + 2];
  }
  const n = cw * ch;
  for (let k = 0; k < g.length; k++) g[k] /= n;
  // soft blur: each cell is half itself, half its neighbours (Easy blurs twice: more forgiving)
  let b = g;
  for (let p = 0; p < passes; p++) b = artBlur(b);
  return { raw: g, blur: b };
}
function artBlur(g) {
  const b = new Float32Array(g.length);
  for (let y = 0; y < GH; y++) for (let x = 0; x < GW; x++) for (let c = 0; c < 3; c++) {
    let s = 0, w = 0;
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
      const yy = y + dy, xx = x + dx; if (yy < 0 || xx < 0 || yy >= GH || xx >= GW) continue;
      const wt = dx === 0 && dy === 0 ? 4 : 1; s += g[(yy * GW + xx) * 3 + c] * wt; w += wt;
    }
    b[(y * GW + x) * 3 + c] = s / w;
  }
  return b;
}
function toLab(r, g, b) {
  const f = (c) => { c /= 255; return c > 0.04045 ? Math.pow((c + 0.055) / 1.055, 2.4) : c / 12.92; };
  const R = f(r), G = f(g), B = f(b);
  let X = (R * 0.4124 + G * 0.3576 + B * 0.1805) / 0.95047, Y = R * 0.2126 + G * 0.7152 + B * 0.0722, Z = (R * 0.0193 + G * 0.1192 + B * 0.9505) / 1.08883;
  const h = (t) => t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116;
  X = h(X); Y = h(Y); Z = h(Z);
  return [116 * Y - 16, 500 * (X - Y), 200 * (Y - Z)];
}
const PAL_LAB = Object.values(ART_PAL).map(hex => toLab(parseInt(hex.slice(1, 3), 16), parseInt(hex.slice(3, 5), 16), parseInt(hex.slice(5, 7), 16)));
function nearestPal(lab) { let best = 0, bd = 1e9; PAL_LAB.forEach((p, i) => { const d = (p[0] - lab[0]) ** 2 + (p[1] - lab[1]) ** 2 + (p[2] - lab[2]) ** 2; if (d < bd) { bd = d; best = i; } }); return best; }
function artRaw(refG, cpyG, reach = 1, slack = 50) {
  const lab = (arr, k) => toLab(arr[k], arr[k + 1], arr[k + 2]);
  const side = (g) => { const L = [], I = []; for (let k = 0; k < GW * GH; k++) { L.push(lab(g.blur, k * 3)); I.push(nearestPal(lab(g.raw, k * 3))); } return { L, I }; };
  const R = side(refG), C = side(cpyG);
  // checks one direction: does every cell of A find its color / palette color nearby in B?
  const dir = (A, B) => {
    let col = 0, shp = 0;
    for (let y = 0; y < GH; y++) for (let x = 0; x < GW; x++) {
      const k = y * GW + x, a = A.L[k];
      let dmin = 1e9, ok = 0;
      for (let dy = -reach; dy <= reach; dy++) for (let dx = -reach; dx <= reach; dx++) {
        const yy = y + dy, xx = x + dx; if (yy < 0 || xx < 0 || yy >= GH || xx >= GW) continue;
        const q = yy * GW + xx, b = B.L[q], d = Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
        if (d < dmin) dmin = d;
        if (B.I[q] === A.I[k]) ok = 1;
      }
      col += Math.max(0, Math.min(1, 1 - (dmin - 6) / slack));
      shp += ok;
    }
    return { col: col / (GW * GH), shp: shp / (GW * GH) };
  };
  // both ways: the copy must contain the original (nothing missing) AND the original must contain the copy (nothing extra)
  const a = dir(R, C), b = dir(C, R);
  return { col: Math.min(a.col, b.col) * 0.5 + (a.col + b.col) / 4, shp: Math.min(a.shp, b.shp) * 0.5 + (a.shp + b.shp) / 4 };
}
let blankCanvas = null;
// How forgiving each tier is: Easy accepts shapes up to 2 cells (16 px) off and blurs more
// passes = blur, reach = how many cells off still counts, slack = color distance allowed, power = how hard the final % is curved down
// Easy and Medium are judged harder because the shape tools and square brush make clean copies easy
/* Score = 40% colour/layout check (cell by cell) + 60% 🔷 shape count check (each separate shape: right colour, place and size),
   then raised to "power" (higher = stricter). objTol: how far (in 4 px cells) a shape may be off. */
window.ART_TOLERANCE = { easy:   { passes: 1, reach: 1, slack: 30, power: 1,   objTol: 10 },
                         medium: { passes: 1, reach: 1, slack: 30, power: 1.4, objTol: 7 },
                         hard:   { passes: 1, reach: 1, slack: 50, power: 1.4, objTol: 6 },
                         master: { passes: 1, reach: 1, slack: 50, power: 1.3, objTol: 7 } };
// 🔷 Shape count check: find each separate shape (same palette colour, connected) and see if the copy has a matching one
const OBJ_CELL = 4;                       // work on 80 × 60 cells of 4 × 4 pixels
const PAL_RGB = Object.values(ART_PAL).map(h => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)]);
function artLabels(canvas) {
  const W = ART_W / OBJ_CELL, H = ART_H / OBJ_CELL, d = canvas.getContext("2d").getImageData(0, 0, ART_W, ART_H).data;
  const lab = new Int16Array(W * H), votes = new Uint16Array(PAL_RGB.length);
  for (let cy = 0; cy < H; cy++) for (let cx = 0; cx < W; cx++) {
    votes.fill(0);
    for (let y = cy * OBJ_CELL; y < cy * OBJ_CELL + OBJ_CELL; y++) for (let x = cx * OBJ_CELL; x < cx * OBJ_CELL + OBJ_CELL; x++) {
      const i = (y * ART_W + x) * 4; let best = 0, bd = 1e9;
      for (let p = 0; p < PAL_RGB.length; p++) { const q = PAL_RGB[p], dd = (q[0] - d[i]) ** 2 + (q[1] - d[i + 1]) ** 2 + (q[2] - d[i + 2]) ** 2; if (dd < bd) { bd = dd; best = p; } }
      votes[best]++;
    }
    let m = 0; for (let p = 1; p < votes.length; p++) if (votes[p] > votes[m]) m = p;
    lab[cy * W + cx] = m;
  }
  return { lab, W, H };
}
function artComponents(L) {
  const { lab, W, H } = L, seen = new Int32Array(W * H).fill(-1), comps = [];
  for (let s = 0; s < W * H; s++) {
    if (seen[s] >= 0) continue;
    const col = lab[s], id = comps.length, st = [s]; seen[s] = id;
    let n = 0, sx = 0, sy = 0, x0 = 1e9, y0 = 1e9, x1 = -1, y1 = -1;
    while (st.length) {
      const p = st.pop(), x = p % W, y = (p - x) / W; n++; sx += x; sy += y;
      if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y;
      // look 2 cells around (diagonals too): a thin or diagonal brush line stays ONE shape instead of many small pieces
      for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) {
        if ((!dx && !dy) || Math.abs(dx) > 1 || Math.abs(dy) > 1) continue;   // touching cells, diagonals included
        const xx = x + dx, yy = y + dy; if (xx < 0 || yy < 0 || xx >= W || yy >= H) continue;
        const q = yy * W + xx; if (seen[q] < 0 && lab[q] === col) { seen[q] = id; st.push(q); }
      }
    }
    comps.push({ col, n, cx: sx / n, cy: sy / n, w: x1 - x0 + 1, h: y1 - y0 + 1 });
  }
  return comps;
}
// how well each shape in A is found in B (weighted by √size, so the background can't carry the score alone)
function artObjDir(A, B, tol, ox = 0, oy = 0) {   // ox, oy: how far B is shifted compared to A (in cells)
  let got = 0, tot = 0, found = 0;
  for (const a of A) {
    const w = Math.sqrt(a.n); tot += w;
    let best = 0;
    for (const b of B) {
      if (b.col !== a.col) continue;
      const reach = tol * (1 + Math.sqrt(a.n) / 6);                  // bigger shapes may be a little further off
      const dist = Math.hypot(a.cx + ox - b.cx, a.cy + oy - b.cy);
      const pos = Math.max(0, 1 - dist / reach);
      const size = Math.min(a.n, b.n) / Math.max(a.n, b.n);
      const s = pos * Math.pow(size, 0.5);
      if (s > best) best = s;
    }
    got += w * best; if (best >= 0.35) found++;   // "found" = a reasonable match (partial matches still give partial points)
  }
  return { s: tot ? got / tot : 1, found };
}
const OBJ_BG = 0.15;   // a shape covering 15%+ of the picture counts as background (checked by the colour check instead)
function artObjects(refCanvas, copyCanvas, tol) {
  const cells = (ART_W / OBJ_CELL) * (ART_H / OBJ_CELL), fg = (list) => list.filter(c => c.n < cells * OBJ_BG);
  const R = fg(artComponents(artLabels(refCanvas))), C = fg(artComponents(artLabels(copyCanvas)));
  if (!R.length) return { score: 1, found: 0, count: 0 };
  // People often draw the whole picture a bit shifted: find the shift (up to 10 cells = 40 px) that lines the shapes up best,
  // then compare. The 📐 layout check still takes points off for the shift itself.
  let ox = 0, oy = 0, bestS = -1;
  if (C.length) for (let dy = -10; dy <= 10; dy++) for (let dx = -10; dx <= 10; dx++) {
    const sc = artObjDir(R, C, tol * 0.6, dx, dy).s - Math.hypot(dx, dy) * 0.004;   // small preference for no shift
    if (sc > bestS) { bestS = sc; ox = dx; oy = dy; }
  }
  const miss = artObjDir(R, C, tol, ox, oy), extra = C.length ? artObjDir(C, R, tol, -ox, -oy).s : 0;   // nothing drawn = nothing found
  return { score: miss.s * 0.75 + extra * 0.25, found: miss.found, count: R.length, shift: [ox, oy] };   // 75%: shapes found, 25%: nothing extra
}

function artScore(refCanvas, copyCanvas, tier = "medium") {
  const T = ART_TOLERANCE[tier] || ART_TOLERANCE.medium;
  if (!blankCanvas) { blankCanvas = document.createElement("canvas"); blankCanvas.width = ART_W; blankCanvas.height = ART_H; const c = blankCanvas.getContext("2d"); c.fillStyle = "#fff"; c.fillRect(0, 0, ART_W, ART_H); }
  const rg = artGrid(refCanvas, T.passes), cg = artGrid(copyCanvas, T.passes), bg = artGrid(blankCanvas, T.passes);
  const got = artRaw(rg, cg, T.reach, T.slack), base = artRaw(rg, bg, T.reach, T.slack);
  const norm = (v, b) => b >= 0.999 ? 1 : Math.max(0, Math.min(1, (v - b) / (1 - b)));
  const colors = norm(got.col, base.col), shapes = norm(got.shp, base.shp), obj = artObjects(refCanvas, copyCanvas, T.objTol);
  const sim = (colors + shapes) / 2 * 0.4 + obj.score * 0.6;
  return { colors, shapes, objects: obj.score, found: obj.found, count: obj.count,
    total: Math.round(Math.pow(sim, T.power) * 1000) / 10 };   // one decimal, in %
}

/* ----- Drawing on the "Your copy" canvas: brush, fill bucket, eraser, undo, clear. Mouse and touch. ----- */
const ART_TOOLS = [{ id: "brush", label: "🖌️ Brush" }, { id: "fill", label: "🪣 Fill" }, { id: "eraser", label: "🧽 Eraser" },
  { id: "pick", label: "💧 Eyedropper", title: "Click either picture to take its colour" },
  { id: "move", label: "✋ Grab", title: "Drag to move the last shape you drew; pick a color to recolor it (until you draw or paint something else)" }];
// shape tools: drag a box, the shape is filled with the selected color
const ART_SHAPES = [{ id: "rect", label: "⬛ Square", title: "Drag to draw a filled rectangle (hold Shift for a perfect square)" },
  { id: "ellipse", label: "⚫ Circle", title: "Drag to draw a filled oval (hold Shift for a perfect circle)" },
  { id: "tri", label: "🔺 Triangle", title: "Drag to draw a filled triangle; turn it with the ↻ slider or mouse wheel (180° = upside down)" },
  { id: "line", label: "➖ Line", title: "Drag to draw a straight line in the brush size (hold Shift for straight 45° angles)" }];
const isShapeTool = (t) => ART_SHAPES.some(s => s.id === t);
const ART_SIZES = [1, 2, 4, 10, 22, 44];
const artUI = { mirror: false, prevTool: "brush", tool: "brush", tip: "round", color: "black", size: 10, shapeStart: null, shapeBase: null, angles: { ellipse: 0, tri: 0 }, lastShape: null, undo: [], drawing: false, last: null, result: null };
const drawCtx = () => $("artDraw").getContext("2d", { willReadFrequently: true });
function artPushUndo() { const c = drawCtx(); artUI.undo.push(c.getImageData(0, 0, ART_W, ART_H)); if (artUI.undo.length > 25) artUI.undo.shift(); }
function artClearCanvas() { const c = drawCtx(); c.fillStyle = "#ffffff"; c.fillRect(0, 0, ART_W, ART_H); }
function artPos(e) { const r = $("artDraw").getBoundingClientRect(); return [(e.clientX - r.left) / r.width * ART_W, (e.clientY - r.top) / r.height * ART_H]; }
function artFlood(x, y, hex) {
  const c = drawCtx(), img = c.getImageData(0, 0, ART_W, ART_H), d = img.data;
  x = Math.floor(x); y = Math.floor(y);
  if (x < 0 || y < 0 || x >= ART_W || y >= ART_H) return;
  const i0 = (y * ART_W + x) * 4, sr = d[i0], sg = d[i0 + 1], sb = d[i0 + 2];
  const nr = parseInt(hex.slice(1, 3), 16), ng = parseInt(hex.slice(3, 5), 16), nb = parseInt(hex.slice(5, 7), 16);
  if (Math.abs(sr - nr) + Math.abs(sg - ng) + Math.abs(sb - nb) < 6) return;
  const tol = 90, same = (i) => Math.abs(d[i] - sr) + Math.abs(d[i + 1] - sg) + Math.abs(d[i + 2] - sb) <= tol;
  const seen = new Uint8Array(ART_W * ART_H), stack = [[x, y]];
  while (stack.length) {
    const [px, py] = stack.pop();
    let lx = px; while (lx >= 0 && !seen[py * ART_W + lx] && same((py * ART_W + lx) * 4)) lx--;
    lx++;
    let up = false, down = false;
    for (let cx = lx; cx < ART_W; cx++) {
      const p = py * ART_W + cx, i = p * 4;
      if (seen[p] || !same(i)) break;
      seen[p] = 1; d[i] = nr; d[i + 1] = ng; d[i + 2] = nb; d[i + 3] = 255;
      if (py > 0) { const q = p - ART_W; if (!seen[q] && same(q * 4)) { if (!up) { stack.push([cx, py - 1]); up = true; } } else up = false; }
      if (py < ART_H - 1) { const q = p + ART_W; if (!seen[q] && same(q * 4)) { if (!down) { stack.push([cx, py + 1]); down = true; } } else down = false; }
    }
  }
  c.putImageData(img, 0, 0);
}
// 🪞 Mirror mode: everything you paint is painted again, flipped left ↔ right
function artMirrored(fn) { const c = drawCtx(); c.save(); c.translate(ART_W, 0); c.scale(-1, 1); fn(); c.restore(); }
function artStroke(a, b) { artStroke1(a, b); if (artUI.mirror) artMirrored(() => artStroke1(a, b)); }
function artStroke1(a, b) {
  const c = drawCtx();
  if (artUI.tip === "square") {   // square brush: stamp squares along the line
    c.fillStyle = artUI.tool === "eraser" ? "#ffffff" : ART_PAL[artUI.color];
    const n = Math.max(1, Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]) / Math.max(1, artUI.size / 4))), h = artUI.size / 2;
    for (let i = 0; i <= n; i++) { const x = a[0] + (b[0] - a[0]) * i / n, y = a[1] + (b[1] - a[1]) * i / n; c.fillRect(Math.round(x - h), Math.round(y - h), artUI.size, artUI.size); }
    return;
  }
  if (artUI.size <= 2) {   // thin lines: snap to the pixel grid so they stay sharp
    const snap = (v) => artUI.size === 1 ? Math.floor(v) + 0.5 : Math.round(v);
    a = [snap(a[0]), snap(a[1])]; b = [snap(b[0]), snap(b[1])];
  }
  c.strokeStyle = artUI.tool === "eraser" ? "#ffffff" : ART_PAL[artUI.color];
  c.lineWidth = artUI.size; c.lineCap = "round"; c.lineJoin = "round";
  c.beginPath(); c.moveTo(a[0], a[1]); c.lineTo(b[0], b[1]); c.stroke();
}

// Circle (oval) and triangle tools: drag to size them; turn them with the angle slider or the mouse wheel,
// during or right after drawing (oval 0–179°, triangle 0–359°: 180° is upside down)
const turnable = (t) => t === "ellipse" || t === "tri";
const ANGLE_MAX = { ellipse: 180, tri: 360 };
function artShape(a, b, square) {
  drawCtx().putImageData(artUI.shapeBase, 0, 0);   // live preview: redraw from the canvas as it was when the drag started
  artShape1(a, b, square);
  if (artUI.mirror) artMirrored(() => artShape1(a, b, square));
}
function artShape1(a, b, square) {
  const c = drawCtx();
  if (artUI.tool === "line") {   // ➖ straight line in the brush size; Shift snaps to 45°
    let e = b;
    if (square) { const ang = Math.round(Math.atan2(b[1] - a[1], b[0] - a[0]) / (Math.PI / 4)) * Math.PI / 4, len = Math.hypot(b[0] - a[0], b[1] - a[1]); e = [a[0] + Math.cos(ang) * len, a[1] + Math.sin(ang) * len]; }
    c.strokeStyle = ART_PAL[artUI.color]; c.lineWidth = artUI.size; c.lineCap = artUI.tip === "square" ? "square" : "round";
    c.beginPath(); c.moveTo(a[0], a[1]); c.lineTo(e[0], e[1]); c.stroke();
    return;
  }
  let w = b[0] - a[0], h = b[1] - a[1];
  if (square) { const m = Math.max(Math.abs(w), Math.abs(h)); w = Math.sign(w || 1) * m; h = Math.sign(h || 1) * m; }
  const x0 = Math.min(a[0], a[0] + w), y0 = Math.min(a[1], a[1] + h), W = Math.abs(w), H = Math.abs(h);
  if (W < 1 || H < 1) return;
  c.fillStyle = ART_PAL[artUI.color];
  c.beginPath();
  if (artUI.tool === "rect") c.rect(x0, y0, W, H);
  else if (artUI.tool === "ellipse") c.ellipse(x0 + W / 2, y0 + H / 2, W / 2, H / 2, artUI.angles.ellipse * Math.PI / 180, 0, Math.PI * 2);
  else {   // triangle, turned around the middle of its box
    const cx = x0 + W / 2, cy = y0 + H / 2, r = artUI.angles.tri * Math.PI / 180, cs = Math.cos(r), sn = Math.sin(r);
    const pts = [[0, -H / 2], [W / 2, H / 2], [-W / 2, H / 2]].map(([x, y]) => [cx + x * cs - y * sn, cy + x * sn + y * cs]);
    c.moveTo(pts[0][0], pts[0][1]); c.lineTo(pts[1][0], pts[1][1]); c.lineTo(pts[2][0], pts[2][1]); c.closePath();
  }
  c.fill();
}
function renderArtTools() {
  $("artPalette").innerHTML = Object.entries(ART_PAL).map(([k, hex]) =>
    `<button class="artColor ${artUI.color === k ? "on" : ""}" data-acolor="${k}" title="${k}" style="background:${hex}"></button>`).join("");
  $("artToolBtns").innerHTML = ART_TOOLS.map(t => `<button class="seg ${artUI.tool === t.id ? "on" : ""}" data-atool="${t.id}" ${t.title ? `title="${t.title}"` : ""}>${t.label}</button>`).join("")
    + `<button class="seg ${artUI.mirror ? "on" : ""}" data-amirror="1" title="Mirror mode: everything you paint is copied to the other side (left ↔ right)">🪞 Mirror</button>`;
  $("artDraw").style.cursor = artUI.tool === "move" ? (artUI.lastShape ? "grab" : "not-allowed") : artUI.tool === "pick" ? "copy" : "crosshair";
  $("artRef").style.cursor = artUI.tool === "pick" ? "copy" : "";
  $("artShapeBtns").innerHTML = ART_SHAPES.map(t => `<button class="seg ${artUI.tool === t.id ? "on" : ""}" data-atool="${t.id}" title="${t.title}">${t.label}</button>`).join("");
  $("artTips").innerHTML = [["round", "Round brush", "50%"], ["square", "Square brush", "1px"]].map(([id, title, r]) =>
    `<button class="seg ${artUI.tip === id ? "on" : ""}" data-atip="${id}" title="${title}"><span class="sizeDot" style="width:11px;height:11px;border-radius:${r}"></span></button>`).join("");
  $("artAngleBox").hidden = !turnable(artUI.tool);
  if (turnable(artUI.tool)) {
    $("artAngle").max = ANGLE_MAX[artUI.tool] - 1;
    $("artAngle").value = artUI.angles[artUI.tool]; $("artAngleVal").textContent = artUI.angles[artUI.tool] + "°";
  }
  $("artSizes").innerHTML = ART_SIZES.map(s => `<button class="seg ${artUI.size === s ? "on" : ""}" data-asize="${s}" title="Brush size ${s} px">
    <span class="sizeDot" style="width:${Math.max(2, s / 2.2)}px;height:${Math.max(2, s / 2.2)}px;border-radius:${artUI.tip === "square" ? "1px" : "50%"}"></span></button>`).join("");
  $("artTiers").innerHTML = ART_TIER_LIST().map(k => [k, ART_TIERS[k]]).map(([k, t]) => {
    if (artTierOpen(k)) return `<button class="seg ${state.art.tier === k ? "on" : ""}" data-atier="${k}">${t.icon} ${t.name} · ${fmt(t.value)}</button>`;
    const n = ART_TIER_NEED[k], have = state.art.done[n.tier] || 0;
    return `<button class="seg" disabled title="Submit (sell or keep) ${n.count} ${ART_TIERS[n.tier].name} paintings to unlock">🔒 ${t.name} · ${have}/${n.count} ${ART_TIERS[n.tier].name}</button>`;
  }).join("");
  const t = ART_TIERS[state.art.tier];
  const M = state.art.tier === "master" ? ART_MASTERS[state.art.seed % ART_MASTERS.length] : null;
  $("artRefLabel").textContent = M ? `Original · ${M.emoji} ${M.name} (${M.artist}, ${M.year})` : "Original";
  renderArtComm();
  $("artTierInfo").textContent = `${t.icon} ${t.name}: ${t.desc}. You earn your match % of ${fmt(t.value)}: an 85% copy is worth ${fmt(t.value * 0.85)}. Under ${ART_MIN_MATCH}% it can't be sold or kept.`;
}
function artNewPainting(keepSeed) {
  if (!keepSeed || !state.art.seed) state.art.seed = 1 + secureRandomInt(2 ** 31 - 2);
  const ref = $("artRef").getContext("2d");
  paintArt(ref, state.art.tier, state.art.seed);
  artClearCanvas(); artUI.undo = []; artUI.result = null; artUI.lastShape = null;
  $("artResult").innerHTML = ""; $("artSubmit").disabled = false;
  renderArtTools();
  save();
}
const ART_MIN_MATCH = 50;   // copies under 50% can't be sold or kept
function artSubmit() {
  const score = artScore($("artRef"), $("artDraw"), state.art.tier);
  const t = ART_TIERS[state.art.tier], comm = artCommActive(), value = Math.floor(t.value * score.total / 100) * (comm ? ART_COMM_MULT : 1);
  const thumb = document.createElement("canvas"); thumb.width = 160; thumb.height = 120;
  thumb.getContext("2d").drawImage($("artDraw"), 0, 0, 160, 120);
  const best = state.stats.artBest || (state.stats.artBest = {});
  best[state.art.tier] = Math.max(best[state.art.tier] || 0, score.total);
  artUI.result = { tier: state.art.tier, seed: state.art.seed, score: score.total, colors: score.colors, shapes: score.shapes, value, comm, img: thumb.toDataURL("image/jpeg", 0.7) };
  const heat = artHeatHtml();
  $("artSubmit").disabled = true;
  if (score.total < ART_MIN_MATCH) {   // ❌ too far from the original: no sale, no collection
    $("artResult").innerHTML = `<div class="artResult">
      <div class="artScore" style="color:#ff8a8a">${score.total.toFixed(1)}%<small>match</small></div>
      <div><div>🎨 Colors <b>${(score.colors * 100).toFixed(0)}%</b> · 📐 Layout <b>${(score.shapes * 100).toFixed(0)}%</b> · 🔷 Shapes found <b>${score.found}/${score.count}</b></div>
        <div style="color:#ff8a8a"><b>Not close enough.</b> A copy needs at least ${ART_MIN_MATCH}% to be sold or kept, so this one isn't worth anything.</div>
        ${heat}
        <div class="moneyRow" style="margin-top:8px">
          <button class="btn" id="artRetry">🖌️ Keep working on it</button>
          <button class="btn ghost" id="artSkip">🔄 New painting</button></div></div></div>`;
    return;
  }
  const full = state.art.items.length >= state.art.slots;
  $("artResult").innerHTML = `<div class="artResult">
    <div class="artScore">${score.total.toFixed(1)}%<small>match</small></div>
    <div><div>🎨 Colors <b>${(score.colors * 100).toFixed(0)}%</b> · 📐 Layout <b>${(score.shapes * 100).toFixed(0)}%</b> · 🔷 Shapes found <b>${score.found}/${score.count}</b></div>
      <div class="muted">${score.total >= 90 ? "Masterpiece! 🏆" : score.total >= 75 ? "Great copy! 👏" : score.total >= 50 ? "Not bad. 🙂" : "Keep practicing. 🖌️"}
        Worth <b>${fmt(value)}</b> (${score.total.toFixed(1)}% of ${fmt(t.value)}${comm ? `, 📜 commission ×${ART_COMM_MULT}` : ""}).</div>
      ${heat}
      <div class="moneyRow" style="margin-top:8px">
        <button class="btn" id="artSell">💰 Sell for ${fmt(value)}</button>
        <button class="btn ghost" id="artKeep" ${full ? "disabled" : ""}>🖼️ Keep in collection (${state.art.items.length}/${state.art.slots})</button>
        ${full ? `<span class="muted">Collection full: buy more slots</span>` : ""}</div></div></div>`;
}
/* ----- 🔥 Heatmap: after submitting, red marks show where the copy doesn't match the original
   (same 4 × 4 px colour cells the scorer uses; a cell counts as fine if its colour is within 1 cell of the right place) ----- */
function artHeatHtml() {
  const A = artLabels($("artRef")), B = artLabels($("artDraw")), { W, H } = A;
  const c = document.createElement("canvas"); c.width = ART_W; c.height = ART_H;
  const g = c.getContext("2d"); g.filter = "grayscale(1)"; g.globalAlpha = 0.4; g.drawImage($("artDraw"), 0, 0); g.globalAlpha = 1; g.filter = "none";   // grey copy, so the red marks stand out
  const near = (L, x, y, col) => { for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) { const xx = x + dx, yy = y + dy; if (xx >= 0 && yy >= 0 && xx < W && yy < H && L.lab[yy * W + xx] === col) return true; } return false; };
  let bad = 0;
  g.fillStyle = "rgba(255, 40, 40, 0.75)";
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const k = y * W + x;
    if (!near(B, x, y, A.lab[k]) || !near(A, x, y, B.lab[k])) { g.fillRect(x * OBJ_CELL, y * OBJ_CELL, OBJ_CELL, OBJ_CELL); bad++; }
  }
  return `<div class="artHeat"><img src="${c.toDataURL()}" alt=""><div class="muted">🔥 <b>Where it differs:</b> red marks the parts that don't match the original (${Math.round(bad / (W * H) * 100)}% of the picture).</div></div>`;
}
/* ----- 📜 Daily commission: one specific painting (Normal, or a Masterpiece once they are open) that pays ×3.
   24 hours to deliver it (sell or keep, at least 50%), once; then a new one comes when the 24 hours are over. ----- */
const ART_COMM_MULT = 3, ART_COMM_TIME = 24 * 3600e3;
function artCommCheck() {
  const a = state.art, c = a.comm, now = Date.now();
  if (c && now < c.until) return c;
  const tiers = ["master", "hard"].filter(artTierOpen);
  if (!tiers.length) { a.comm = null; return null; }
  const tier = tiers.length > 1 && Math.random() < 0.5 ? "hard" : tiers[0];
  a.comm = { tier, seed: 1 + secureRandomInt(2 ** 31 - 2), until: now + ART_COMM_TIME, done: false };
  save(); return a.comm;
}
const artCommActive = () => { const c = state.art.comm; return !!(c && !c.done && Date.now() < c.until && state.art.tier === c.tier && state.art.seed === c.seed); };
let artCommPic = {};
function renderArtComm() {
  const box = $("artComm"); if (!box) return;
  const c = artCommCheck();
  if (!c) { box.innerHTML = `<div class="artCommCard locked">📜 <b>Daily commission:</b> unlock 🟡 Normal paintings to get a daily commission (×${ART_COMM_MULT} value).</div>`; return; }
  const key = c.tier + c.seed; if (!artCommPic[key]) artCommPic = { [key]: artCanvasOf(c.tier, c.seed, 160).toDataURL() };
  const M = c.tier === "master" ? ART_MASTERS[c.seed % ART_MASTERS.length] : null, T = ART_TIERS[c.tier];
  const what = M ? `${M.emoji} <b>${M.name}</b> (${M.artist})` : `this ${T.icon} <b>${T.name}</b> painting`;
  box.innerHTML = `<div class="artCommCard ${c.done ? "done" : artCommActive() ? "on" : ""}"><img src="${artCommPic[key]}" alt="">
    <div><b>📜 Daily commission</b>${c.done ? ` · ✅ Delivered!` : ""}
      <div>${c.done ? `Thank you! A new commission in <b data-acommt="${c.until}">${clockLong(Math.ceil((c.until - Date.now()) / 1000))}</b>.`
        : `A collector wants a copy of ${what} and pays <b>×${ART_COMM_MULT}</b>: up to ${fmt(T.value * ART_COMM_MULT)}. Time left: <b data-acommt="${c.until}">${clockLong(Math.ceil((c.until - Date.now()) / 1000))}</b>.`}</div>
      ${c.done ? "" : artCommActive() ? `<div class="muted">🖌️ You're painting it now. Submit a copy of ${ART_MIN_MATCH}%+ to deliver it.</div>` : `<button class="btn small" data-acomm="1">🖌️ Paint it</button>`}</div></div>`;
}
setInterval(() => { document.querySelectorAll("[data-acommt]").forEach(el => { const left = Number(el.dataset.acommt) - Date.now(); if (left <= 0) { if (!$("artView").hidden && state.art.unlocked) renderArtComm(); } else el.textContent = clockLong(Math.ceil(left / 1000)); }); }, 1000);
function artFinish(keep) {
  const r = artUI.result;
  if (!r || r.score < ART_MIN_MATCH) return;
  if (keep && state.art.items.length >= state.art.slots) return;
  const before = Object.keys(ART_TIERS).filter(artTierOpen);
  state.art.done[r.tier] = (state.art.done[r.tier] || 0) + 1;
  if (r.comm && state.art.comm && !state.art.comm.done) {   // 📜 commission delivered
    state.art.comm.done = true; state.stats.artComms = (state.stats.artComms || 0) + 1;
    setTimeout(() => showNotice(`📜 Commission delivered! The collector paid ×${ART_COMM_MULT}: ${fmt(r.value)}.`), 300);
  }
  Object.keys(ART_TIERS).filter(k => artTierOpen(k) && !before.includes(k))
    .forEach(k => setTimeout(() => showNotice(`🔓 ${ART_TIERS[k].icon} ${ART_TIERS[k].name} paintings are now unlocked in the Art studio!`), 1200));
  if (keep) {
    if (state.art.items.length >= state.art.slots) return;
    const item = { id: state.nextId++, tier: r.tier, seed: r.seed, score: r.score, value: r.value, img: r.img, at: Date.now() };
    state.art.items.unshift(item);
    artStoreImg(item);
    showNotice(`🖼️ Added to your collection (worth ${fmt(r.value)}).`);
  } else {
    state.money += r.value;
    state.art.sold = (state.art.sold || 0) + 1; state.stats.artSold = (state.stats.artSold || 0) + 1;
    clickedThisSecond += r.value;   // counts as income (taxes)
    showNotice(`💰 Sold your copy for ${fmt(r.value)}!`);
  }
  updateCounter();
  renderArtTools();   // tier buttons may have unlocked
  artNewPainting(false);
}

/* ----- Painting pictures are kept in the browser's IndexedDB (much more room than the save),
   so a big collection can't fill up the save. The save only keeps each painting's id, score and value.
   If IndexedDB is not available, the picture stays in the save as before. ----- */
const artImgs = {};   // id -> picture (data URL), loaded through storage.images
const artImgDel = (id) => storage.images.del(id);
const artImgOf = (it) => it.img || artImgs[it.id] || artCanvasOf(it.tier, it.seed, 160).toDataURL();   // last resort: the original
async function artStoreImg(it) {   // move a painting's picture out of the save
  if (!it.img) return;
  const ok = await storage.images.put(it.id, it.img);
  if (ok) { artImgs[it.id] = it.img; delete it.img; save(); }
}
// On start: load the pictures, move any still inside the save, and delete pictures of paintings that are gone
(async () => {
  const all = await storage.images.all();
  if (!all) return;
  const ids = new Set(state.art.items.map(it => it.id));
  for (const k in all) { if (ids.has(Number(k))) artImgs[k] = all[k]; else artImgDel(Number(k)); }
  for (const it of state.art.items) await artStoreImg(it);
  flushSave();   // write the smaller save right away
  if (!$("artCollection").hidden) renderArtCollection();
})();

if (state.art.slots > ART_SLOTS_MAX) state.art.slots = Math.max(ART_SLOTS_MAX, state.art.items.length);
// painting copies submitted per tier (sold or kept); older saves that already used a tier keep it open
if (!state.art.done) {
  const best = (state.stats && state.stats.artBest) || {}, has = (t) => (best[t] || 0) > 0 || state.art.items.some(i => i.tier === t);
  state.art.done = { easy: has("medium") || has("hard") ? 5 : 0, medium: has("hard") ? 10 : 0, hard: 0 };
}
const artTierOpen = (k) => { const n = ART_TIER_NEED[k]; return !n || (state.art.done[n.tier] || 0) >= n.count; };
if (!ART_TIERS[state.art.tier] || ART_TIERS[state.art.tier].hidden || !artTierOpen(state.art.tier)) { state.art.tier = "medium"; state.art.seed = 0; }
const artSlotPrice = () => ART_SLOT_PRICE + ART_SLOT_PRICE_STEP * (state.art.slotBuys || 0);
function renderArtCollection() {
  renderArtHead();
  const a = state.art;
  $("artSlots").textContent = `(${a.items.length} / ${a.slots})`;
  const maxed = a.slots >= ART_SLOTS_MAX;
  $("artBuySlots").textContent = maxed ? `✅ Maximum ${ART_SLOTS_MAX} slots` : `➕ ${ART_SLOTS_STEP} slots (${fmt(artSlotPrice())})`;
  $("artBuySlots").disabled = maxed || state.money < artSlotPrice();
  const total = a.items.reduce((s, x) => s + x.value, 0);
  $("artGrid").innerHTML = a.items.length ? `<div class="muted" style="grid-column:1/-1">Collection value: <b>${fmt(total)}</b> · Average match: <b>${(a.items.reduce((s, x) => s + x.score, 0) / a.items.length).toFixed(1)}%</b></div>` + a.items.map(it => {
    const t = ART_TIERS[it.tier];
    return `<div class="artCard"><img class="artCopy" src="${artImgOf(it)}" alt="Your copy" title="${t.name} painting">
      <div class="row"><b>${it.score.toFixed(1)}%</b><b class="income">${fmt(it.value)}</b></div>
      <button class="btn ghost small" data-asell="${it.id}">💰 Sell</button></div>`;
  }).join("") : `<div class="muted">No paintings yet. Make a copy in the 🎨 Art studio and choose "Keep".</div>`;
}
// 🎮 the shared mini-game header (🖼️ collection count) and the folded rules
function renderArtHead() {
  const a = state.art, h = $("artHead");
  if (h) h.innerHTML = mgHead(`<img class="mgIco" src="assets/icons/ico-artgallery.webp" alt="">`, "Art Gallery",
    a.unlocked ? `<span>🖼️ <b>${(a.items || []).length} / ${a.slots}</b> <span>in your collection</span></span>` : "");
  const w = $("artHow");
  if (w) w.innerHTML = mgHow("art", `<ul class="mgHowList">
      <li>🎨 Copy the painting on the left onto your canvas on the right, with the brush, fill, shapes and the other tools.</li>
      <li>✅ Press <b>Submit copy</b> to score it: you earn your match % of the painting's value. Under ${ART_MIN_MATCH}% it can't be sold or kept.</li>
      <li>🖼️ Sell a copy right away, or keep it in your collection (more room costs money). Kept paintings can be sold any time.</li>
      <li>🟢 Easy → 🟡 Normal → 🏛️ Masterpiece: finish paintings to unlock the harder, more valuable tiers.</li>
      <li>📜 Once Normal is open, a daily commission pays ×3 for one painting a day.</li></ul>`, !(state.stats.artSold || 0) && !(a.items || []).length);
}
// keep the 🖼️ count fresh (keeping or selling a copy changes it)
setInterval(() => { const h = $("artHead"); if (!h || $("artView").hidden || !state.art.unlocked) return;
  const b = h.querySelector(".mgStat b"), t = `${(state.art.items || []).length} / ${state.art.slots}`; if (b && b.textContent !== t) b.textContent = t; }, 1000);
function showArtPage(p) {
  renderArtHead();
  state.art.page = p === "collection" ? "collection" : "studio";
  $("artStudio").hidden = state.art.page !== "studio";
  $("artCollection").hidden = state.art.page !== "collection";
  document.querySelectorAll("[data-art]").forEach(b => b.classList.toggle("active", b.dataset.art === state.art.page));
  if (state.art.page === "collection") renderArtCollection();
}
function updateArtTab() {   // the 🎮 Mini-games tab shows 🔒 until at least one mini-game is open
  const tab = document.querySelector('.tab[data-view="games"]');
  const any = state.art.unlocked || (typeof mineUnlocked === "function" && mineUnlocked());
  const ready = any && typeof mgReady === "function" && Object.keys(mgReady()).length;   // ❗ a game wants your attention
  const html = (any ? "" : ico("lock", "lockS")) + '<img class="tabIco" src="assets/icons/tab-games.webp" alt="">Mini-games' + (ready ? ' <span class="tabWarn gold">!</span>' : "");
  if (tab && tab.innerHTML !== html) tab.innerHTML = html;
}
function renderArt() {
  const open = state.art.unlocked;
  updateArtTab();
  $("artLocked").hidden = open; $("artOpen").hidden = !open;
  renderArtHead();
  if (!open) {
    $("artLocked").innerHTML = `<h2>${ico("lock", "lockS")}${ico("artgallery", "biz")}Art Gallery</h2>
      <p>Copy paintings as closely as you can: the better the match, the more they're worth. Sell your copies right away or keep them in your collection.</p>
      <p class="muted">🟢 Easy ${fmt(ART_TIERS.medium.value)} · 🟡 Normal ${fmt(ART_TIERS.hard.value)} · 🏛️ Masterpiece ${fmt(ART_TIERS.master.value)} (you earn your match %; at least ${ART_MIN_MATCH}% to sell or keep)</p>
      ${artGalleryReady()
        ? `<button class="btn big" id="artUnlock" ${state.money >= ART_UNLOCK ? "" : "disabled"}>🔓 Open the gallery for ${fmt(ART_UNLOCK)}</button>`
        : `<p><b>🔒 Unlocks with the 💵 Millionaire achievement:</b> have ${fmt(1e6)} on hand.</p>`}`;
    return;
  }
  renderArtTools();
  showArtPage(state.art.page);
}

// ----- events -----
$("artView").addEventListener("click", (e) => {
  if (isPaused()) return;
  if (e.target.closest("#artUnlock")) {
    if (state.art.unlocked || state.money < ART_UNLOCK || !artGalleryReady()) return;
    state.money -= ART_UNLOCK; state.art.unlocked = true;
    updateCounter(); save(); renderArt(); artNewPainting(true);
    showNotice("🖼️ The Art Gallery is open!");
    return;
  }
  const nav = e.target.closest("[data-art]"); if (nav) { showArtPage(nav.dataset.art); save(); return; }
  const col = e.target.closest("[data-acolor]");
  if (col) {
    artUI.color = col.dataset.acolor;
    if (artUI.tool === "move" && artUI.lastShape && !artUI.result) { artPushUndo(); artUI.lastShape.color = artUI.color; artDrawLast(artUI.lastShape, 0, 0); }   // ✋ recolor the grabbed shape
    if (artUI.tool === "eraser") artUI.tool = "brush";
    renderArtTools(); return;
  }
  if (e.target.closest("[data-amirror]")) { artUI.mirror = !artUI.mirror; renderArtTools(); return; }
  if (e.target.closest("[data-acomm]")) {   // 📜 switch to the commissioned painting
    const c = artCommCheck(); if (!c || c.done || !artTierOpen(c.tier)) return;
    state.art.tier = c.tier; state.art.seed = c.seed; artNewPainting(true); return;
  }
  const tool = e.target.closest("[data-atool]"); if (tool) { if (tool.dataset.atool === "pick" && artUI.tool !== "pick") artUI.prevTool = artUI.tool; artUI.tool = tool.dataset.atool; renderArtTools(); return; }
  const keepsTool = (t) => t === "line" || t === "brush" || t === "eraser";   // the ➖ line uses the brush size and tip too
  const size = e.target.closest("[data-asize]"); if (size) { artUI.size = Number(size.dataset.asize); if (!keepsTool(artUI.tool)) artUI.tool = "brush"; renderArtTools(); return; }
  const tip = e.target.closest("[data-atip]"); if (tip) { artUI.tip = tip.dataset.atip; if (!keepsTool(artUI.tool)) artUI.tool = "brush"; renderArtTools(); return; }
  const tier = e.target.closest("[data-atier]");
  if (tier && tier.dataset.atier !== state.art.tier && artTierOpen(tier.dataset.atier)) { state.art.tier = tier.dataset.atier; renderArtTools(); artNewPainting(false); return; }
  if (e.target.closest("#artUndo")) { artUI.lastShape = null; const u = artUI.undo.pop(); if (u) drawCtx().putImageData(u, 0, 0); return; }
  if (e.target.closest("#artClear")) { artUI.lastShape = null; artPushUndo(); artClearCanvas(); return; }
  if (e.target.closest("#artNew")) {   // 🔄 ask first if there's a copy in progress (one wrong tap shouldn't throw it away)
    if (!artUI.undo.length || artUI.result) { artNewPainting(false); return; }
    showModal(`<h2>🔄 Start a new painting?</h2><p>Your copy of this painting will be lost.</p>
      <div class="row" style="justify-content:center;gap:10px"><button class="btn ghost" data-modal="close">Keep painting</button><button class="btn dangerBtn" id="artNewYes">Start over</button></div>`);
    $("artNewYes").onclick = () => { hideModal(); artNewPainting(false); };
    return;
  }
  if (e.target.closest("#artSubmit")) { artSubmit(); return; }
  if (e.target.closest("#artSell")) { artFinish(false); return; }
  if (e.target.closest("#artRetry")) { artUI.result = null; $("artResult").innerHTML = ""; $("artSubmit").disabled = false; return; }
  if (e.target.closest("#artSkip")) { artUI.result = null; artNewPainting(false); return; }
  if (e.target.closest("#artKeep")) { artFinish(true); return; }
  if (e.target.closest("#artBuySlots")) {
    const price = artSlotPrice();
    if (state.money < price || state.art.slots >= ART_SLOTS_MAX) return;
    state.money -= price; state.art.slots += ART_SLOTS_STEP; state.art.slotBuys = (state.art.slotBuys || 0) + 1;
    updateCounter(); save(); renderArtCollection();
    showNotice(`🖼️ Collection now has ${state.art.slots} slots.`);
    return;
  }
  const sell = e.target.closest("[data-asell]");
  if (sell) {
    const it = state.art.items.find(x => x.id === Number(sell.dataset.asell));
    if (!it) return;
    state.art.items = state.art.items.filter(x => x !== it);
    delete artImgs[it.id]; artImgDel(it.id);
    state.money += it.value; clickedThisSecond += it.value; state.art.sold = (state.art.sold || 0) + 1; state.stats.artSold = (state.stats.artSold || 0) + 1;
    updateCounter(); save(); renderArtCollection();
    showNotice(`💰 Sold a painting for ${fmt(it.value)}!`);
  }
});
const artCanvas = $("artDraw");
// 💧 eyedropper: take the palette colour under the pointer (from the original or your copy), then go back to the last tool
function artPickColor(canvas, e) {
  const r = canvas.getBoundingClientRect(), x = Math.floor((e.clientX - r.left) / r.width * ART_W), y = Math.floor((e.clientY - r.top) / r.height * ART_H);
  const d = canvas.getContext("2d").getImageData(Math.max(0, Math.min(ART_W - 1, x)), Math.max(0, Math.min(ART_H - 1, y)), 1, 1).data;
  let best = 0, bd = 1e9; PAL_RGB.forEach((q, i) => { const dd = (q[0] - d[0]) ** 2 + (q[1] - d[1]) ** 2 + (q[2] - d[2]) ** 2; if (dd < bd) { bd = dd; best = i; } });
  artUI.color = Object.keys(ART_PAL)[best]; artUI.tool = artUI.prevTool === "pick" ? "brush" : artUI.prevTool; renderArtTools();
}
$("artRef").addEventListener("pointerdown", (e) => { if (artUI.tool === "pick" && !isPaused()) { e.preventDefault(); artPickColor($("artRef"), e); } });
artCanvas.addEventListener("pointerdown", (e) => {
  if (isPaused() || artUI.result) return;
  e.preventDefault();
  const p = artPos(e);
  if (artUI.tool === "pick") { artPickColor(artCanvas, e); return; }
  if (artUI.tool === "move") {   // ✋ grab: drag the last shape somewhere else
    if (!artUI.lastShape) { showNotice("✋ Draw a shape first (⬛ Square, ⚫ Circle or 🔺 Triangle), then grab it to move it."); return; }
    artPushUndo();
    artUI.grab = { start: p, dx: 0, dy: 0 };
    artCanvas.setPointerCapture(e.pointerId); artCanvas.style.cursor = "grabbing";
    return;
  }
  artPushUndo();
  artUI.lastShape = null;   // a new action: the previous shape can't be turned or moved any more
  if (artUI.tool === "fill") { artFlood(p[0], p[1], ART_PAL[artUI.color]); return; }
  artUI.drawing = true; artUI.last = p;
  artCanvas.setPointerCapture(e.pointerId);
  if (isShapeTool(artUI.tool)) { artUI.shapeStart = p; artUI.lastMove = p; artUI.shapeBase = drawCtx().getImageData(0, 0, ART_W, ART_H); return; }
  artStroke(p, [p[0] + 0.01, p[1]]);
});
// redraw the last shape moved by (dx, dy), on top of the canvas as it was before that shape
function artDrawLast(L, dx, dy) {
  const keep = { tool: artUI.tool, color: artUI.color, angle: artUI.angles[L.tool] };
  artUI.tool = L.tool; artUI.color = L.color; artUI.shapeBase = L.base;
  if (L.angle !== undefined) artUI.angles[L.tool] = L.angle;
  artShape([L.a[0] + dx, L.a[1] + dy], [L.b[0] + dx, L.b[1] + dy], L.square);
  artUI.tool = keep.tool; artUI.color = keep.color; artUI.shapeBase = null;
  if (keep.angle !== undefined) artUI.angles[L.tool] = keep.angle;
}
artCanvas.addEventListener("pointermove", (e) => {
  if (artUI.grab && artUI.lastShape) {
    const p = artPos(e);
    artUI.grab.dx = p[0] - artUI.grab.start[0]; artUI.grab.dy = p[1] - artUI.grab.start[1];
    artDrawLast(artUI.lastShape, artUI.grab.dx, artUI.grab.dy);
    return;
  }
  if (!artUI.drawing) return;
  const p = artPos(e);
  if (artUI.shapeStart) { artShape(artUI.shapeStart, p, e.shiftKey); return; }
  artStroke(artUI.last, p); artUI.last = p;
});
["pointerup", "pointercancel"].forEach(ev => artCanvas.addEventListener(ev, (e) => {
  if (artUI.grab) {   // the shape stays where it was dropped (and can be grabbed or turned again)
    const L = artUI.lastShape, g = artUI.grab;
    if (L) { L.a = [L.a[0] + g.dx, L.a[1] + g.dy]; L.b = [L.b[0] + g.dx, L.b[1] + g.dy]; }
    artUI.grab = null; artCanvas.style.cursor = "grab";
    return;
  }
  if (artUI.shapeStart && ev === "pointerup") {
    const end = artPos(e);
    artShape(artUI.shapeStart, end, e.shiftKey);
    // the oval just drawn can still be turned (slider / wheel) until the next action
    // the shape just drawn can still be moved (✋ Grab) and turned (slider / wheel) until the next action
    if (isShapeTool(artUI.tool)) artUI.lastShape = { a: artUI.shapeStart, b: end, square: e.shiftKey, base: artUI.shapeBase, color: artUI.color, tool: artUI.tool, angle: artUI.angles[artUI.tool] };
  }
  artUI.drawing = false; artUI.shapeStart = null; artUI.shapeBase = null;
}));
function artTurn(deg) {
  const t = artUI.tool, max = ANGLE_MAX[t];
  if (!max) return;
  artUI.angles[t] = ((Math.round(deg) % max) + max) % max;
  $("artAngle").value = artUI.angles[t]; $("artAngleVal").textContent = artUI.angles[t] + "°";
  if (artUI.drawing && artUI.shapeStart && artUI.lastMove) { artShape(artUI.shapeStart, artUI.lastMove, false); return; }
  const L = artUI.lastShape;
  if (L && L.tool === t && !artUI.result) {   // turn the shape that was just drawn
    L.angle = artUI.angles[t];
    artDrawLast(L, 0, 0);
  }
}
$("artAngle").addEventListener("input", () => artTurn(Number($("artAngle").value)));
artCanvas.addEventListener("wheel", (e) => {
  if (!turnable(artUI.tool)) return;
  e.preventDefault();
  artTurn(artUI.angles[artUI.tool] + (e.deltaY > 0 ? 5 : -5));
}, { passive: false });
artCanvas.addEventListener("pointermove", (e) => { if (artUI.shapeStart) artUI.lastMove = artPos(e); });

// keep the money-dependent buttons fresh
setInterval(() => {
  if ($("artView").hidden) return;
  if (!state.art.unlocked) { const b = $("artUnlock"); if (b) b.disabled = state.money < ART_UNLOCK; else if (artGalleryReady()) renderArt(); }
  else if (!$("artCollection").hidden) $("artBuySlots").disabled = state.art.slots >= ART_SLOTS_MAX || state.money < artSlotPrice();
}, 1000);
updateArtTab();
if (state.art.unlocked) { paintArt($("artRef").getContext("2d"), state.art.tier, state.art.seed || (state.art.seed = 1 + secureRandomInt(2 ** 31 - 2))); artClearCanvas(); }
