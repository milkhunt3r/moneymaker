/* =====================================================================
   🔞 AGE AND ENTERTAINMENT NOTICE
   Shown the first time someone presses ▶ Play on this device (guests and signed-in players alike).
   The player must confirm they are 18+ and that the in-game money is virtual. The answer is kept in
   localStorage (AGE_KEY, with the notice version and date) and copied into the save (state.ageOk).
   Bump AGE_VERSION when the text changes in a way players must accept again.
   Loaded before js/29-cloud.js so it runs before the guest sign-in prompt.
   ===================================================================== */
const AGE_KEY = "eoc-age-ok", AGE_VERSION = 2;   // 2: also accepts the Terms of Use
function ageAccepted() {
  try { const v = JSON.parse(localStorage.getItem(AGE_KEY) || "null"); return !!(v && v.v >= AGE_VERSION); } catch (e) { return false; }
}
// 📄 the Terms of Use and Privacy Policy pages (open in a new tab, in the game's language)
const legalLinks = () => `<a href="terms.html?lang=${LANG}" target="_blank" rel="noopener">📄 Terms of Use</a><a href="privacy.html?lang=${LANG}" target="_blank" rel="noopener">🔒 Privacy Policy</a>`;
function ageNoticeHtml() {
  return `<div class="ageGate">
    <h2>🔞 Before you play</h2>
    <p><b>Empire of Coins</b> is intended for adults. It contains <b>simulated gambling</b> (casino games such as roulette, blackjack,
      poker and slot-style games) and <b>simulated investing</b> (shares, real estate, precious metals and cryptocurrency trading).</p>
    <p>By continuing, you confirm that:</p>
    <ul>
      <li>you are at least <b>18 years old</b>, or of the age of majority in your country of residence if that is higher;</li>
      <li>you understand that this game is provided <b>solely for entertainment purposes</b>;</li>
      <li>all coins, winnings, investments and other items in the game are <b>virtual</b>. They have <b>no monetary value</b>,
        cannot be purchased with real money, and cannot be exchanged, withdrawn or redeemed for real money, goods or services of any kind;</li>
      <li>the game does <b>not</b> offer real-money gambling or real investing. Market prices shown in the game may be based on real market
        data, but every trade is simulated;</li>
      <li>results in the game do not indicate future results in real gambling or on real financial markets, and nothing in the game
        constitutes financial or investment advice.</li>
    </ul>
    <p class="muted">If gambling is causing problems for you or someone close to you, please contact a support service in your country.</p>
    <p>Please also read our Terms of Use and Privacy Policy:</p>
    <div class="ageLinks">${legalLinks()}</div>
    <label class="ageCheck"><input type="checkbox" id="ageAgree"> I have read and agree to the above and to the Terms of Use.</label>
    <div class="cloudPick">
      <button class="btn big" id="ageYes" disabled>I confirm, continue</button>
      <button class="btn big ghost" id="ageNo">I am under 18</button>
    </div>
    <p class="ageNoMsg" id="ageNoMsg" hidden>We are sorry, but Empire of Coins is only available to players aged 18 and over.</p>
  </div>`;
}
$("mainMenu").addEventListener("click", (e) => {
  const b = e.target.closest('[data-menu="play"]');
  if (!b || ageAccepted()) return;
  e.stopImmediatePropagation();   // don't start (and don't show the guest prompt) until confirmed
  showModal(ageNoticeHtml());
  $("modalBox").classList.add("wide");
  $("ageAgree").onchange = () => { $("ageYes").disabled = !$("ageAgree").checked; };
  $("ageNo").onclick = () => { $("ageNoMsg").hidden = false; $("ageYes").disabled = true; $("ageAgree").checked = false; };
  $("ageYes").onclick = () => {
    if (!$("ageAgree").checked) return;
    const rec = { v: AGE_VERSION, at: Date.now() };
    try { localStorage.setItem(AGE_KEY, JSON.stringify(rec)); } catch (err) {}
    state.ageOk = rec; save();
    hideModal();
    b.click();   // carry on with ▶ Play (the guest prompt, if any, comes next)
  };
}, true);
