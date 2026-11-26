/* Empire of Coins © 2026 milkhunt3r. All rights reserved. */
/* =====================================================================
   📈 INVESTING LAYOUT (loaded after js/28-freight-shares.js)
   · One slim bar (level, money, holdings) instead of the level card and the wallet card, on both Investing pages.
   · Investing page: a portfolio list (one row per investment: worth, all-time profit, mini chart). The chosen investment's
     full card (chart, buy and sell) opens under the list. Locked investments fold into one line.
   ===================================================================== */
const IV_ITEMS = [
  { k: "re", name: "Real estate", icon: () => ico("re-key"), prices: null },
  { k: "etf", name: "Stock market ETF", icon: () => ivIco("etf"), prices: () => inv.etfPrices },
  { k: "gold", name: "Gold", icon: () => ivIco("gold"), prices: () => inv.goldPrices },
  { k: "petf", name: "Broker ETF", icon: () => ivIco("petf"), prices: () => inv.petfPrices, locked: () => !hasBroker() && !(inv.petf > 0), lockText: "needs a Brokerage Firm (Income, Investor level 10)" },
  { k: "gfc", name: "Global Freight Co. shares", icon: () => ico("lg-crates"), prices: () => inv.gfcPrices, locked: () => !gfcOpen() && !(inv.gfc > 0), lockText: "opens with Logistics (buy your first Car Salon)" },
];
// the 5 investment cards, in page order
(function ivSetup() {
  const pane = $("investPane"); if (!pane) return;
  const cards = [...pane.children].filter(el => el.classList.contains("card"));
  IV_ITEMS.forEach((it, i) => { if (cards[i]) { cards[i].dataset.ivcard = it.k; cards[i].classList.add("ivCard"); } });
  const list = document.createElement("div"); list.id = "ivList"; list.className = "card ivList"; pane.prepend(list);
  const hud = document.createElement("div"); hud.id = "investHud"; hud.className = "card ivHud";
  $("investView").querySelector(".subLayout").before(hud);
})();
if (!IV_ITEMS.some(it => it.k === state.ivCard)) state.ivCard = "re";

function ivSpark(arr) {
  const pts = (arr || []).slice(-30); if (pts.length < 2) return `<svg class="ivSpark" viewBox="0 0 100 28"></svg>`;
  const mx = Math.max(...pts), mn = Math.min(...pts), up = pts[pts.length - 1] >= pts[0];
  const xy = pts.map((v, i) => `${(i * 100 / (pts.length - 1)).toFixed(1)},${(25 - (v - mn) / Math.max(1e-9, mx - mn) * 22).toFixed(1)}`).join(" ");
  return `<svg class="ivSpark ${up ? "up" : "down"}" viewBox="0 0 100 28" preserveAspectRatio="none"><polyline points="${xy}"/></svg>`;
}
const ivProfit = (k) => { const st = inv.stats && inv.stats[k]; return st ? st.out + investCurrent(k) - st.in : 0; };
const ivSigned = (n) => `<b class="${n > 0.5 ? "up" : n < -0.5 ? "down" : ""}">${n > 0.5 ? "+" : n < -0.5 ? "−" : ""}${fmt(Math.abs(n))}</b>`;

function ivHudHtml() {
  const info = levelInfo(inv.xp, INVEST_XP);
  const hold = [["re", ico("re-key"), investCurrent("re")], ["etf", ivIco("etf"), inv.etf + inv.petf], ["gold", ivIco("gold"), inv.gold]];
  const total = IV_ITEMS.concat([{ k: "crypto" }]).reduce((a, it) => a + ivProfit(it.k), 0);
  return `<button class="casHudLv" data-levels="investor" title="Investor level · ${info.max ? "max level" : `${fmtNum(info.into)} / ${fmtNum(info.need)} XP`}">${ivIco("invest")}<span>Lv <b>${info.level}</b></span>
      <span class="casHudXp"><i style="width:${info.max ? 100 : 100 * info.into / info.need}%"></i></span></button>
    <span class="casHudMoney" title="Your money"><img class="coinSkinImg" src="assets/coin.webp" alt=""><b>${fmt(state.money)}</b></span>
    ${hold.map(([k, ic, v]) => `<span class="ivHold" title="${{ re: "Real estate", etf: "ETF", gold: "Gold" }[k]}">${ic}<b>${fmt(v)}</b></span>`).join("")}
    <span class="ivHold" title="All-time profits">${ivIco("profits")}${ivSigned(total)}</span>`;
}
function ivListHtml() {
  const open = IV_ITEMS.filter(it => !(it.locked && it.locked())), locked = IV_ITEMS.filter(it => it.locked && it.locked());
  const rows = open.map(it => {
    const worth = it.k === "etf" ? inv.etf : investCurrent(it.k), pr = ivProfit(it.k);
    const extra = it.k === "re" ? `<span class="muted">${inv.properties.length} ${inv.properties.length === 1 ? "property" : "properties"}</span>` : ivSpark(it.prices && it.prices());
    return `<button class="ivRow ${state.ivCard === it.k ? "on" : ""}" data-ivpick="${it.k}">
      <span class="ivRowName">${it.icon()}<b>${it.name}</b></span>
      <span class="ivRowVal"><small>Worth</small><b>${fmt(worth)}</b></span>
      <span class="ivRowVal"><small>Profit</small>${ivSigned(pr)}</span>
      <span class="ivRowChart">${extra}</span></button>`; }).join("");
  return `<div class="ivRows">${rows}</div>${locked.length ? `<div class="muted ivLocked">${locked.map(it => `<span>${ico("lock", "lockS")}<b>${it.name}</b> · <span>${it.lockText}</span></span>`).join("")}</div>` : ""}`;
}
function ivApply() {
  document.querySelectorAll("#investPane [data-ivcard]").forEach(c => { c.hidden = c.dataset.ivcard !== state.ivCard; });
}
function ivRefresh() {
  if ($("investView").hidden) return;
  const hud = $("investHud"), h = ivHudHtml(); if (hud.dataset.h !== h) { hud.dataset.h = h; hud.innerHTML = h; }
  const pick = IV_ITEMS.find(it => it.k === state.ivCard);
  if (pick && pick.locked && pick.locked()) { state.ivCard = "re"; ivApply(); }
  if (!$("investPane").hidden) { const l = $("ivList"), x = ivListHtml(); if (l.dataset.h !== x) { l.dataset.h = x; l.innerHTML = x; } }
}
$("investPane").addEventListener("click", (e) => {
  const r = e.target.closest("[data-ivpick]"); if (!r) return;
  state.ivCard = r.dataset.ivpick; ivApply(); ivRefresh(); save();
  if (typeof drawChart === "function") { drawChart("etfChart", inv.etfPrices); drawChart("goldChart", inv.goldPrices); drawChart("petfChart", inv.petfPrices); drawChart("gfcChart", inv.gfcPrices); }
});
/* ----- 🔁 one Buy | Sell switch per investment: one amount row at a time; the % buttons fill % of your money (Buy) or of what you hold (Sell) ----- */
const IV_TRADE = {
  etf:  { buy: "Invest", sell: "Cash out", hold: () => inv.etf, fee: () => etfFee() },
  gold: { buy: "Buy", sell: "Sell", hold: () => inv.gold, fee: () => 0 },
  gfc:  { buy: "Buy", sell: "Sell", hold: () => inv.gfc, fee: () => etfFee() },
};
if (!state.ivMode) state.ivMode = {};
(function ivTradeSetup() {
  for (const [k, T] of Object.entries(IV_TRADE)) {
    const buyRow = $(k + "Amount") && $(k + "Amount").closest(".moneyRow"), sellRow = $(k + "SellAmount") && $(k + "SellAmount").closest(".moneyRow");
    if (!buyRow || !sellRow) continue;
    buyRow.dataset.ivrow = k + "-buy"; sellRow.dataset.ivrow = k + "-sell";
    buyRow.insertAdjacentHTML("beforebegin", `<div class="segGroup ivMode"><button class="seg buy" data-ivmode="${k}" data-mode="buy">${T.buy}</button><button class="seg sell" data-ivmode="${k}" data-mode="sell">${T.sell}</button></div>`);
    const firstBtn = sellRow.querySelector("button");
    firstBtn.insertAdjacentHTML("beforebegin", [0.25, 0.5, 0.75].map(p => `<button class="btn ghost small" data-ivsell="${k}" data-pct="${p}">${p * 100}%</button>`).join(""));
    sellRow.insertAdjacentHTML("afterend", `<div class="muted ivPrev" id="ivprev-${k}"></div>`);
  }
})();
function ivModeApply() {
  for (const k of Object.keys(IV_TRADE)) {
    const m = state.ivMode[k] === "sell" ? "sell" : "buy";
    document.querySelectorAll(`[data-ivmode="${k}"]`).forEach(b => b.classList.toggle("on", b.dataset.mode === m));
    const b = document.querySelector(`[data-ivrow="${k}-buy"]`), s2 = document.querySelector(`[data-ivrow="${k}-sell"]`);
    if (b) b.hidden = m !== "buy"; if (s2) s2.hidden = m !== "sell";
  }
}
// what you are about to do, in plain words (updated every second and while typing)
function ivPreview() {
  for (const [k, T] of Object.entries(IV_TRADE)) {
    const el = $("ivprev-" + k); if (!el) continue;
    const sell = state.ivMode[k] === "sell";
    if (sell) { const v = Math.min(Math.floor(Number($(k + "SellAmount").value) || 0), T.hold());   // ETF and freight shares also show "You get …" in their row
      el.textContent = k === "gold" && v > 0 ? `You get ${fmt(v)} (no fee)` : ""; continue; }
    const a = Math.floor(Number($(k + "Amount").value) || 0);
    el.textContent = a > 0 ? (a > state.money ? `You only have ${fmt(state.money)}.` : `You put in ${fmt(a)} · ${fmt(state.money - a)} left`) : "";
  }
}
$("investPane").addEventListener("click", (e) => {
  const m = e.target.closest("[data-ivmode]");
  if (m) { state.ivMode[m.dataset.ivmode] = m.dataset.mode; ivModeApply(); ivPreview(); save(); return; }
  const sp = e.target.closest("[data-ivsell]");
  if (sp) { const k = sp.dataset.ivsell, box = $(k + "SellAmount"); box.value = Math.floor(IV_TRADE[k].hold() * Number(sp.dataset.pct)); box.dispatchEvent(new Event("input", { bubbles: true })); ivPreview(); }
});
$("investPane").addEventListener("input", ivPreview);
ivModeApply();
ivApply(); ivRefresh();
setInterval(() => { ivRefresh(); ivPreview(); }, 1000);
