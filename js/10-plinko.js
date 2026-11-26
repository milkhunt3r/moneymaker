/* Empire of Coins © 2026 milkhunt3r. All rights reserved. */
/* =====================================================================
   PLINKO: 12 rows of pegs, ball always dropped from the top centre.
   At each peg it bounces left or right (50/50), landing in one of 13 slots.
   Multipliers (edges to middle): 250, 10, 3, 1.5, 1, 0.6, 0.3 -> exact payback 97.99%.
   Up to 20 balls in the air at once. 5,000 - 5 scoin per ball (Super high rollers: 10 - 500 scoin).
   ===================================================================== */
const PLINKO_ROWS = 12;
const PLINKO_MULTS = [250, 10, 3, 1.5, 1, 0.6, 0.3, 0.6, 1, 1.5, 3, 10, 250];
const PLINKO_MAX_BALLS = 20;
const PLINKO_TABLES = {
  plinko:      { title: "Plinko", emoji: "🔻", min: 5000, max: 5000000, chips: [5000, 25000, 100000, 500000, 1000000, 5000000] },
  plinkoSuper: { title: "Plinko: Super high rollers", emoji: "💎🔻", min: 10000000, max: 500000000, chips: [10000000, 25000000, 50000000, 100000000, 250000000, 500000000] },
};
const isPlinko = () => !!PLINKO_TABLES[currentGame];
const plinkoCfg = () => PLINKO_TABLES[currentGame] || PLINKO_TABLES.plinko;
const plinko = { bet: 5000, count: 1, balls: [], history: [], lastWin: null, message: "", hits: {}, raf: null, roundBet: 0, roundWin: 0 };

/* 🔒 Balls still in the air are saved with their path: after a reload they land where they were going
   (no refund, so refreshing can't undo a ball heading for a low multiplier). Very old saves without paths get the bets back. */
if (!state.plinkoAir) state.plinkoAir = [];
let plinkoAway = null;
if (state.plinkoAir.length) { plinkoAway = state.plinkoAir.slice(); state.plinkoAir = []; }
else {
  if (state.plinkoInPlay > 0) state.casinoChips += state.plinkoInPlay;
  if (state.plinkoVipInPlay > 0) { state.vip.coins += state.plinkoVipInPlay; state.plinkoVipInPlay = 0; }
  state.plinkoInPlay = 0;
}

// Board geometry (canvas pixels)
// (the board sits inside the cabinet picture assets/plinko/bg.webp, 680 × 850)
const PW = 680, PH = 850, P_TOP = 172, P_GAP_Y = 41, P_GAP_X = 37, PEG_R = 5, BALL_R = 8, P_DROP_Y = 132, CUP_BOTTOM = 706;
const P_CX = PW / 2;
const pegY = (r) => P_TOP + r * P_GAP_Y;
const slotY = () => CUP_BOTTOM - 44;
const slotX = (k) => P_CX + (k - PLINKO_ROWS / 2) * P_GAP_X;

// 🎨 the prize cups (assets/plinko/cup-0..6): ruby 250× · orange 10× · yellow 3× · green 1.5× · teal 1× · blue 0.6× · purple 0.3×
const PLINKO_CUP = (m) => m >= 100 ? 0 : m >= 10 ? 1 : m >= 3 ? 2 : m >= 1.5 ? 3 : m >= 1 ? 4 : m >= 0.6 ? 5 : 6;
const PLINKO_CUP_COLORS = ["#e3262e", "#ff7a1a", "#ffc928", "#7ccf2a", "#1fc9a8", "#2a9bff", "#8a3dff"];
function multColor(m) { return PLINKO_CUP_COLORS[PLINKO_CUP(m)]; }
const PIMG = {};
["bg", "peg", "ball", "ball-ruby", "fx-small", "fx-big", "fx-crown", "cup-0", "cup-1", "cup-2", "cup-3", "cup-4", "cup-5", "cup-6"].forEach(n => { const i = new Image(); i.src = `assets/plinko/${n}.webp`; PIMG[n] = i; });
const pOk = (i) => i && i.complete && i.naturalWidth > 0;
plinko.fx = []; plinko.lit = {};

function plinkoDrop() {
  if (isPaused()) return;
  const n = plinko.count, bet = plinko.bet;
  if (plinko.balls.length + n > PLINKO_MAX_BALLS)
    return plinkoMsg(`Max ${PLINKO_MAX_BALLS} balls in the air at once (${plinko.balls.length} still falling).`);
  const cfg = plinkoCfg();
  if (bet < cfg.min || bet > cfg.max) return plinkoMsg(`Bet per ball must be ${coins(cfg.min)} – ${coins(cfg.max)}.`);
  const total = bet * n;
  const vipBall = vipOn(currentGame);
  if (purse(currentGame) < total) return plinkoMsg(`Not enough ${purseName(currentGame)}.`);

  payFrom(currentGame, total);
  if (vipBall) state.plinkoVipInPlay += total; else state.plinkoInPlay += total;
  casinoRecord(total, 0);
  countPlay("plinko", n);                          // every ball is one game
  addXp(total);                                   // XP = bet × game multiplier
  if (plinko.balls.length === 0) { plinko.roundBet = 0; plinko.roundWin = 0; }
  plinko.roundBet += total;
  plinko.message = "";

  const now = performance.now();
  for (let i = 0; i < n; i++) {
    const path = [];
    for (let r = 0; r < PLINKO_ROWS; r++) path.push(secureRandomInt(2));   // 0 = left, 1 = right
    const ball = { id: state.nextId++, path, bet, vip: vipBall, start: now + i * 140, slot: path.reduce((a, b) => a + b, 0), done: false };
    plinko.balls.push(ball);
    state.plinkoAir.push({ id: ball.id, bet, vip: vipBall, slot: ball.slot });   // 🔒 saved until it lands
  }
  updateCounter(); save();
  renderPlinkoControls();
  if (!plinko.raf) plinko.raf = requestAnimationFrame(plinkoFrame);
}

// Where a ball is, t ms after it was dropped
const SEG_MS = 120;
function ballPos(ball, t) {
  // segment 0: fall from the top to the first peg; segments 1..12: bounce peg to peg; 13: fall into the slot
  const seg = Math.floor(t / SEG_MS), f = (t % SEG_MS) / SEG_MS;
  const xAt = (row) => {              // x of the ball when it reaches peg row "row"
    let rights = 0;
    for (let i = 0; i < row; i++) rights += ball.path[i];
    return P_CX + (rights - row / 2) * P_GAP_X;
  };
  const yAt = (row) => pegY(row) - PEG_R - BALL_R;
  if (seg === 0) return { x: P_CX, y: P_DROP_Y + (yAt(0) - P_DROP_Y) * f * f };
  if (seg <= PLINKO_ROWS - 1) {
    const r0 = seg - 1, r1 = seg;
    const x = xAt(r0) + (xAt(r1) - xAt(r0)) * f;
    const y = yAt(r0) + (yAt(r1) - yAt(r0)) * f - Math.sin(Math.PI * f) * 14;   // little hop
    return { x, y };
  }
  if (seg === PLINKO_ROWS) {
    const x0 = xAt(PLINKO_ROWS - 1), x1 = slotX(ball.slot);
    return { x: x0 + (x1 - x0) * f, y: yAt(PLINKO_ROWS - 1) + (slotY() - yAt(PLINKO_ROWS - 1)) * f - Math.sin(Math.PI * f) * 10 };
  }
  return null;   // landed
}

function plinkoLand(ball) {
  state.plinkoAir = (state.plinkoAir || []).filter(b => b.id !== ball.id);
  const mult = PLINKO_MULTS[ball.slot];
  const win = ball.bet * mult;
  if (mult === 250) state.stats.plinko250 = true;
  const cashback = mult < 1 ? ball.bet * (1 - mult) * cashbackRate() : 0;   // cashback on the lost part
  state.casinoChips += win + cashback;
  if (ball.vip) state.plinkoVipInPlay = Math.max(0, state.plinkoVipInPlay - ball.bet);
  else state.plinkoInPlay = Math.max(0, state.plinkoInPlay - ball.bet);
  casinoRecord(0, win + cashback);
  plinko.roundWin += win + cashback;
  plinko.history = [mult, ...plinko.history].slice(0, 14);
  plinko.hits[ball.slot] = performance.now();
  plinko.fx.push({ x: slotX(ball.slot), y: slotY() + 10, t: performance.now(), kind: mult >= 100 ? "fx-crown" : mult >= 10 ? "fx-big" : "fx-small" });
  plinko.lastWin = { mult, win };
  updateCounter();
}

function plinkoFrame(now) {
  const cv = $("plinkoCanvas");
  for (const ball of plinko.balls) {
    if (!ball.done && now - ball.start > SEG_MS * (PLINKO_ROWS + 1)) { ball.done = true; plinkoLand(ball); }
  }
  const before = plinko.balls.length;
  plinko.balls = plinko.balls.filter(b => !b.done);
  if (cv) drawPlinko(cv.getContext("2d"), now);
  if (before !== plinko.balls.length) {
    save();
    renderPlinkoControls();
    if (plinko.balls.length === 0) {
      const net = plinko.roundWin - plinko.roundBet;
      plinko.message = `Paid ${fmt(plinko.roundWin)} on ${fmt(plinko.roundBet)} bet (${net >= 0 ? "+" : "−"}${fmt(Math.abs(net))}).`;
      renderPlinkoControls();
    }
  }
  plinko.raf = plinko.balls.length || plinko.fx.length ? requestAnimationFrame(plinkoFrame) : null;
  if (!plinko.raf && cv) setTimeout(() => { const c = $("plinkoCanvas"); if (c) drawPlinko(c.getContext("2d"), performance.now()); }, 400);
}

function drawPlinko(ctx, now) {
  ctx.clearRect(0, 0, PW, PH);
  if (pOk(PIMG.bg)) ctx.drawImage(PIMG.bg, 0, 0, PW, PH);
  const pos = [];
  for (const ball of plinko.balls) { const t = now - ball.start; if (t < 0) continue; const p = ballPos(ball, t); if (p) pos.push([p, ball]); }
  // pegs: row r has r + 3 pegs
  const ps = PEG_R * 2.6;
  for (let r = 0; r < PLINKO_ROWS; r++) {
    const n = r + 3;
    for (let j = 0; j < n; j++) {
      const x = P_CX + (j - (n - 1) / 2) * P_GAP_X, y = pegY(r), img = PIMG.peg, sz = ps;
      if (pOk(img)) ctx.drawImage(img, x - sz / 2, y - sz / 2, sz, sz);
      else { ctx.fillStyle = "#ffd34d"; ctx.beginPath(); ctx.arc(x, y, PEG_R, 0, Math.PI * 2); ctx.fill(); }
    }
  }
  // prize cups with their multiplier
  const cw = P_GAP_X - 2, ch = cw * 159 / 120;
  PLINKO_MULTS.forEach((m, k) => {
    const x = slotX(k), hit = plinko.hits[k] && now - plinko.hits[k] < 400;
    const lift = hit ? -7 * Math.sin(Math.PI * (now - plinko.hits[k]) / 400) : 0;
    const img = PIMG["cup-" + PLINKO_CUP(m)], top = CUP_BOTTOM - ch + lift;
    if (pOk(img)) ctx.drawImage(img, x - cw / 2, top, cw, ch);
    else { ctx.fillStyle = multColor(m); roundRect(ctx, x - cw / 2, top + ch * 0.4, cw, ch * 0.6, 6); ctx.fill(); }
    const label = m + "×";
    ctx.font = `900 ${label.length > 3 ? 10 : 12}px system-ui, sans-serif`; ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.lineWidth = 3; ctx.strokeStyle = "rgba(40,20,0,0.85)"; ctx.strokeText(label, x, top + ch * 0.68);
    ctx.fillStyle = "#fff"; ctx.fillText(label, x, top + ch * 0.68);
  });
  // balls (now and then a ruby one, just for looks)
  for (const [p, ball] of pos) {
    const img = (ball.id || 0) % 9 === 4 ? PIMG["ball-ruby"] : PIMG.ball, sz = BALL_R * 2.2;
    if (pOk(img)) ctx.drawImage(img, p.x - sz / 2, p.y - sz / 2, sz, sz);
    else { ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.arc(p.x, p.y, BALL_R, 0, Math.PI * 2); ctx.fill(); }
  }
  // landing bursts
  plinko.fx = plinko.fx.filter(f => now - f.t < 900);
  for (const f of plinko.fx) {
    const k = (now - f.t) / 900, img = PIMG[f.kind], base = f.kind === "fx-small" ? 46 : f.kind === "fx-big" ? 130 : 200;
    if (!pOk(img)) continue;
    const sz = base * (0.5 + 0.7 * Math.min(1, k * 2.5));
    ctx.globalAlpha = 1 - Math.max(0, (k - 0.55) / 0.45);
    ctx.drawImage(img, f.x - sz / 2, f.y - sz * (f.kind === "fx-small" ? 0.5 : 0.75), sz, sz);
    ctx.globalAlpha = 1;
  }
}
function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
}

function plinkoMsg(text) { plinko.message = text; renderPlinkoControls(); }

function renderPlinko() {
  $("casinoGame").innerHTML = `
    <div class="card">
      <div class="row"><div><h2 style="margin:0">${casIco(currentGame)}${plinkoCfg().title}</h2>
        <div class="muted">Bet ${coins(plinkoCfg().min)} – ${coins(plinkoCfg().max)} per ball · drop up to ${PLINKO_MAX_BALLS} balls at once · 12 rows · 0.3× to 250×</div></div>
        <button class="btn ghost small" data-back="1" id="plinkoBack">← All games</button></div>
      <canvas id="plinkoCanvas" width="${PW}" height="${PH}"></canvas>
      <div id="plinkoControls"></div>
    </div>`;
  renderPlinkoControls();
  drawPlinko($("plinkoCanvas").getContext("2d"), performance.now());
  if (plinko.balls.length && !plinko.raf) plinko.raf = requestAnimationFrame(plinkoFrame);
}

function renderPlinkoControls() {
  const box = $("plinkoControls");
  if (!box || !isPlinko()) return;
  const total = plinko.bet * plinko.count;
  const flying = plinko.balls.length;
  $("plinkoBack").disabled = flying > 0;
  box.innerHTML = `
    <div class="chipsRow" style="justify-content:center">
      <span class="muted">Bet per ball:</span>
      ${plinkoCfg().chips.map(v => `<button class="chip ${v === plinko.bet ? "selected" : ""}" data-plinkobet="${v}"
         style="background:${CHIP_COLORS[v].bg}; color:${CHIP_COLORS[v].text}">${chipLabel(v)}</button>`).join("")}
    </div>
    <div class="plinkoControls">
      <div class="ballCount"><img class="ico" src="assets/plinko/ico-balls.webp" alt=""><span class="muted">Balls:</span>
        <input type="range" min="1" max="${PLINKO_MAX_BALLS}" value="${plinko.count}" id="plinkoCount"><b id="plinkoCountText">${plinko.count}</b></div>
      <button class="btn big plinkoDrop" data-plinko="drop" style="margin-top:0"><img class="ico" src="assets/plinko/ico-drop.webp" alt="">Drop ${plinko.count > 1 ? plinko.count + " balls" : "ball"} (${fmt(total)})</button>
      <span class="muted">${flying ? flying + " in the air" : ""}</span>
    </div>
    <div id="plinkoHistory">${plinko.history.map(m => `<span style="background:${multColor(m)}">${m}×</span>`).join("")}</div>
    <div id="casinoMsg" class="${/\+/.test(plinko.message) ? "income" : "flash"}" style="margin-top:8px; text-align:center">${plinko.message}</div>`;
}

$("casinoGame").addEventListener("click", (e) => {
  if (!isPlinko()) return;
  const chip = e.target.closest("[data-plinkobet]");
  if (chip) { plinko.bet = Number(chip.dataset.plinkobet); renderPlinkoControls(); return; }
  const btn = e.target.closest("[data-plinko]");
  if (btn && btn.dataset.plinko === "drop") plinkoDrop();
});
$("casinoGame").addEventListener("input", (e) => {
  if (!isPlinko() || e.target.id !== "plinkoCount") return;
  plinko.count = Number(e.target.value);
  $("plinkoCountText").textContent = plinko.count;
  const btn = document.querySelector("[data-plinko=drop]");
  if (btn) btn.textContent = `🔻 Drop ${plinko.count > 1 ? plinko.count + " balls" : "ball"} (${fmt(plinko.bet * plinko.count)})`;
});

// ▶ balls that were in the air when the page closed land now
document.addEventListener("DOMContentLoaded", () => {
  if (!plinkoAway) return;
  const before = plinko.roundWin; plinko.roundWin = 0;
  plinkoAway.forEach(b => plinkoLand(b));
  const won = plinko.roundWin; plinko.roundWin = before;
  showNotice(`🔻 ${plinkoAway.length} Plinko ball${plinkoAway.length > 1 ? "s" : ""} still in the air landed: +${fmt(won)}.`);
  plinkoAway = null; save();
});
