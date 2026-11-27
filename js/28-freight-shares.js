/* Empire of Coins © 2026 milkhunt3r. All rights reserved. */
/* =====================================================================
   🚚 GLOBAL FREIGHT CO. SHARES (📈 Investing): a share price that follows your logistics deliveries.
   Every 10 game seconds: deliveries in the last 20 seconds (n) vs the 20 seconds before (m).
     move = +0.095% + 1% for every extra delivery (n > m) or −1% for every missing one (n < m) + noise (±0.5%),
     at most +8% / −6% per move
   More deliveries than before → up, fewer → down; a bigger fleet makes bigger swings. A small steady drift
   makes the price rise over time (simulated: about +35% an hour).
   Your shares are a value that moves with the price (like the ETF); selling pays the ETF cash-out fee.
   The price doesn't move while the game is closed (offline time runs no market moves).
   ===================================================================== */
const GFC_EVERY = 10, GFC_WINDOW = 20, GFC_MAX_UP = 0.08, GFC_MAX_DOWN = 0.06;
const GFC_DRIFT = 0.00095, GFC_UP = 0.01, GFC_DOWN = 0.01;   // simulated: about +35% an hour (a bit less with a very busy fleet, but bigger swings)
if (typeof inv.gfc !== "number") { inv.gfc = 0; inv.gfcInvested = 0; }
if (!Array.isArray(inv.gfcPrices)) inv.gfcPrices = [100];
if (!Array.isArray(inv.gfcHistory)) inv.gfcHistory = [];
if (typeof inv.gfcTimer !== "number") inv.gfcTimer = GFC_EVERY;
if (!inv.stats.gfc) inv.stats.gfc = { in: 0, out: 0 };
const gfcSeconds = [];   // deliveries per game second, the last 40 seconds (not saved)
const gfcOpen = () => typeof logisticsOpen === "function" && logisticsOpen();
const gfcCount = (from, to) => gfcSeconds.slice(Math.max(0, gfcSeconds.length - to), gfcSeconds.length - from).reduce((a, b) => a + b, 0);

function gfcMove() {
  const n = gfcCount(0, GFC_WINDOW), m = gfcCount(GFC_WINDOW, GFC_WINDOW * 2);
  const d = n - m;
  const move = GFC_DRIFT + (d > 0 ? GFC_UP * d : GFC_DOWN * d) + (Math.random() - 0.5) * 0.01;
  return Math.max(-GFC_MAX_DOWN, Math.min(GFC_MAX_UP, move));
}
// Called every game second from investTick (after logisticsTick has counted this second's deliveries)
function gfcTick() {
  gfcSeconds.push(deliveredThisSecond);
  deliveredThisSecond = 0;
  if (gfcSeconds.length > GFC_WINDOW * 2) gfcSeconds.shift();
  if (!gfcOpen()) return;
  if (--inv.gfcTimer > 0) return;
  inv.gfcTimer = GFC_EVERY;
  const move = gfcMove();
  inv.gfc *= 1 + move;
  inv.gfcHistory = [move, ...inv.gfcHistory].slice(0, 15);
  inv.gfcPrices = inv.gfcPrices.concat(inv.gfcPrices[inv.gfcPrices.length - 1] * (1 + move)).slice(-CHART_POINTS - 1);
  drawChart("gfcChart", inv.gfcPrices);
}

$("gfcBuy").addEventListener("click", () => {
  if (isPaused() || !gfcOpen()) return;
  const amount = readAmount("gfcAmount");
  if (amount < ETF_MIN) return investMessage("Shares need at least " + fmt(ETF_MIN) + ".", false, "gfc");
  if (amount > state.money) return investMessage("You don't have that much money.", false, "gfc");
  state.money -= amount;
  inv.gfc += amount;
  inv.gfcInvested += amount;
  investRecord("gfc", amount, 0);
  $("gfcAmount").value = "";
  investMessage("Bought " + fmt(amount) + " of Global Freight Co. shares.", true, "gfc");
  updateCounter(); updateInvestLive(); save();
});
function sellGfc(amount) {
  if (isPaused()) return;
  amount = Math.min(amount, inv.gfc);
  if (amount <= 0) return investMessage("No shares to sell.", false, "gfc");
  const fee = amount * etfFee();
  inv.gfcInvested *= 1 - amount / inv.gfc;
  inv.gfc -= amount;
  if (inv.gfc < 0.5) { inv.gfc = 0; inv.gfcInvested = 0; }
  state.money += amount - fee;
  investRecord("gfc", 0, amount - fee);
  $("gfcSellAmount").value = "";
  investMessage(`Sold ${fmt(amount)} of shares (fee ${fmt(fee)}): +${fmt(amount - fee)} to your money.`, true, "gfc");
  updateCounter(); updateInvestLive(); save();
}
$("gfcSell").addEventListener("click", () => sellGfc(readAmount("gfcSellAmount")));
$("gfcSellAll").addEventListener("click", () => sellGfc(inv.gfc));
$("gfcSellAmount").addEventListener("input", updateGfc);

function updateGfc() {
  const open = gfcOpen();
  $("gfcLocked").hidden = open;
  $("gfcBody").hidden = !open;
  if (!open) return;
  $("gfcValue").textContent = fmt(inv.gfc);
  showPL("gfc", inv.gfc, inv.gfcInvested);
  $("gfcTimer").textContent = inv.gfcTimer + "s";
  const n = gfcCount(0, GFC_WINDOW), m = gfcCount(GFC_WINDOW, GFC_WINDOW * 2);
  $("gfcDeliv").textContent = n;
  $("gfcDeliv").className = "bigValue " + (n > m ? "up" : n < m ? "down" : "");
  $("gfcDelivPrev").textContent = `20 s before: ${m}`;
  const last = inv.gfcHistory[0];
  $("gfcLast").textContent = last === undefined ? "–" : (last > 0 ? "+" : "−") + (Math.abs(last) * 100).toFixed(1) + "%";
  $("gfcLast").className = "bigValue " + (last > 0 ? "up" : last < 0 ? "down" : "");
  $("gfcHistory").innerHTML = inv.gfcHistory.map(x => `<span class="${x > 0 ? "up" : "down"}">${x > 0 ? "+" : "−"}${(Math.abs(x) * 100).toFixed(1)}%</span>`).join("");
  const sell = Math.min(readAmount("gfcSellAmount"), inv.gfc);
  $("gfcSellPreview").textContent = sell > 0 ? `You get ${fmt(sell * (1 - etfFee()))} after the ${pct(etfFee())} fee` : "";
}
// refresh with the rest of the investing page
const _updateInvestLiveGfc = updateInvestLive;
updateInvestLive = function () { _updateInvestLiveGfc(); updateGfc(); };
chartHover("gfcChart", () => inv.gfcPrices);
drawChart("gfcChart", inv.gfcPrices);
applyInfo();
updateInvestLive();
