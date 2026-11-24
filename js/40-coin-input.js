/* Empire of Coins © 2026 milkhunt3r. All rights reserved. */
/* =====================================================================
   🪙 COIN UNIT SWITCH next to every money box: type the amount in bcoin, scoin (1M) or gcoin (1M scoin),
   instead of counting zeros. The rest of the game is not changed: each money box still reports its amount
   in bcoin through .value (and code that fills the box, like the 10% buttons, still writes bcoin).
   · The chosen unit is remembered (state.coinUnit, a screen preference); "auto" picks it from your money.
   ===================================================================== */
const COIN_UNITS = { bcoin: 1, scoin: SCOIN, gcoin: GCOIN };
const COIN_BOXES = "#buyAmount, #reAmount, #etfAmount, #etfSellAmount, #goldAmount, #goldSellAmount, #petfAmount, #gfcAmount, #gfcSellAmount, [id^='cbuy-'], #duBet";
const NATIVE_VALUE = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value");
const coinUnit = () => COIN_UNITS[state.coinUnit] ? state.coinUnit : state.money >= GCOIN ? "gcoin" : state.money >= SCOIN ? "scoin" : "bcoin";
const coinNice = (n) => String(Math.round(n * 1e6) / 1e6);   // up to 6 decimals, no float noise
function coinBox(el) {
  if (el.dataset.coinUnit) return;
  const raw = NATIVE_VALUE.get.call(el);   // anything already in the box (e.g. from the page's HTML) is bcoin
  el.dataset.coinUnit = "1";
  const minB = Number(el.getAttribute("min")) || 0;
  Object.defineProperty(el, "value", {
    configurable: true,
    get() { const v = NATIVE_VALUE.get.call(this); return v === "" ? "" : String(Math.round(Number(v) * COIN_UNITS[this.dataset.u || "bcoin"])); },
    set(v) { NATIVE_VALUE.set.call(this, v === "" || v == null || isNaN(Number(v)) ? "" : coinNice(Number(v) / COIN_UNITS[this.dataset.u || "bcoin"])); },
  });
  const fit = () => { el.dataset.u = coinUnit(); const m = COIN_UNITS[el.dataset.u]; el.step = m > 1 ? "any" : "1"; if (minB) el.min = coinNice(minB / m); };
  el.coinFit = fit; fit();
  if (raw !== "") el.value = raw;   // (fit() has set the unit, so this converts the bcoin amount)
  const sel = document.createElement("select");
  sel.className = "coinUnitSel"; sel.setAttribute("aria-label", "Coin");
  sel.innerHTML = Object.keys(COIN_UNITS).map(u => `<option value="${u}">${u}</option>`).join("");
  sel.value = coinUnit();
  sel.setAttribute("data-noi18n", "");
  el.insertAdjacentElement("afterend", sel);
}
// switching the unit converts what is typed in every money box, and all switches follow
document.addEventListener("change", (e) => {
  if (!e.target.classList || !e.target.classList.contains("coinUnitSel")) return;
  const boxes = [...document.querySelectorAll("[data-coin-unit]")], keep = boxes.map(b => b.value);   // in bcoin
  state.coinUnit = e.target.value; save();
  boxes.forEach((b, i) => { b.coinFit(); b.value = keep[i]; b.dispatchEvent(new Event("input", { bubbles: true })); });
  document.querySelectorAll(".coinUnitSel").forEach(s => { s.value = coinUnit(); });
});
document.querySelectorAll(COIN_BOXES).forEach(coinBox);
new MutationObserver(() => { document.querySelectorAll(COIN_BOXES).forEach(el => { if (!el.dataset.coinUnit) coinBox(el); }); })
  .observe(document.body, { childList: true, subtree: true });
// "auto" follows your money: keep the switches showing the unit in use
setInterval(() => { if (state.coinUnit) return; const u = coinUnit();
  document.querySelectorAll(".coinUnitSel").forEach(s => { if (s.value !== u) { const b = s.previousElementSibling, keep = b && b.value; s.value = u; if (b && b.coinFit) { b.coinFit(); b.value = keep; } } }); }, 2000);
