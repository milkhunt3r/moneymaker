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

// Balls still in the air when the page closed: give their bets back
if (state.plinkoInPlay > 0) state.casinoChips += state.plinkoInPlay;
if (state.plinkoVipInPlay > 0) { state.vip.coins += state.plinkoVipInPlay; state.plinkoVipInPlay = 0; }
state.plinkoInPlay = 0;

// Board geometry (canvas pixels)
const PW = 680, PH = 552, P_TOP = 50, P_GAP_Y = 38, P_GAP_X = 46, PEG_R = 4, BALL_R = 8;
const P_CX = PW / 2;
const pegY = (r) => P_TOP + r * P_GAP_Y;
const slotY = () => pegY(PLINKO_ROWS - 1) + 34;
const slotX = (k) => P_CX + (k - PLINKO_ROWS / 2) * P_GAP_X;

function multColor(m) {
  if (m >= 100) return "#ff3d3d";
  if (m >= 10) return "#ff6b3d";
  if (m >= 3) return "#ff9f2e";
  if (m >= 1.5) return "#ffc02e";
  if (m >= 1) return "#ffd34d";
  if (m >= 0.6) return "#c9c27a";
  return "#9a9ab0";
}

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
    plinko.balls.push({ path, bet, vip: vipBall, start: now + i * 140, slot: path.reduce((a, b) => a + b, 0), done: false });
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
  if (seg === 0) return { x: P_CX, y: 4 + (yAt(0) - 4) * f * f };
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
  plinko.raf = plinko.balls.length ? requestAnimationFrame(plinkoFrame) : null;
  if (!plinko.raf && cv) setTimeout(() => { const c = $("plinkoCanvas"); if (c) drawPlinko(c.getContext("2d"), performance.now()); }, 400);
}

function drawPlinko(ctx, now) {
  ctx.clearRect(0, 0, PW, PH);
  // pegs: row r has r + 3 pegs
  ctx.fillStyle = "#e6e6f5";
  for (let r = 0; r < PLINKO_ROWS; r++) {
    const n = r + 3;
    for (let j = 0; j < n; j++) {
      const x = P_CX + (j - (n - 1) / 2) * P_GAP_X;
      ctx.beginPath(); ctx.arc(x, pegY(r), PEG_R, 0, Math.PI * 2); ctx.fill();
    }
  }
  // slots
  const sy = slotY() + 6;
  PLINKO_MULTS.forEach((m, k) => {
    const x = slotX(k), w = P_GAP_X - 6;
    const hit = plinko.hits[k] && now - plinko.hits[k] < 350;
    const lift = hit ? 6 * (1 - (now - plinko.hits[k]) / 350) : 0;
    ctx.fillStyle = multColor(m);
    ctx.globalAlpha = hit ? 1 : 0.9;
    roundRect(ctx, x - w / 2, sy + lift, w, 30, 6); ctx.fill();
    ctx.globalAlpha = 1;
    ctx.fillStyle = "#1b1b1b";
    ctx.font = "bold 12px system-ui, sans-serif"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText(m + "×", x, sy + 15 + lift);
  });
  // balls
  for (const ball of plinko.balls) {
    const t = now - ball.start;
    if (t < 0) continue;
    const p = ballPos(ball, t);
    if (!p) continue;
    const g = ctx.createRadialGradient(p.x - 3, p.y - 3, 1, p.x, p.y, BALL_R);
    g.addColorStop(0, "#fff6c2"); g.addColorStop(0.5, "#ffd34d"); g.addColorStop(1, "#c98a00");
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(p.x, p.y, BALL_R, 0, Math.PI * 2); ctx.fill();
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
      <div class="row"><div><h2 style="margin:0">${plinkoCfg().emoji} ${plinkoCfg().title}</h2>
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
      <div class="ballCount"><span class="muted">Balls:</span>
        <input type="range" min="1" max="${PLINKO_MAX_BALLS}" value="${plinko.count}" id="plinkoCount"><b id="plinkoCountText">${plinko.count}</b></div>
      <button class="btn big" data-plinko="drop" style="margin-top:0">🔻 Drop ${plinko.count > 1 ? plinko.count + " balls" : "ball"} (${fmt(total)})</button>
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
