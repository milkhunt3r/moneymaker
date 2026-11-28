/* Empire of Coins © 2026 milkhunt3r. All rights reserved. */
/* =====================================================================
   🐞 REPORT A BUG (⚙️ Settings → Report a bug)
   A short form; "Send by email" opens the player's email app with a ready report addressed to
   BUG_EMAIL (Cloudflare Email Routing forwards it to the game's inbox). "Copy report" copies the same
   text for players without an email app. Game details (version, page, browser, screen) are attached
   only if the box is ticked; no save data or account details are included.
   ===================================================================== */
const BUG_EMAIL = "contact@empireofcoins.com";
const BUG_DEVICES = ["Phone", "Tablet", "PC or laptop"];
// best guess for the device list (the player can change it)
const bugGuessDevice = () => /iPad|Tablet/i.test(navigator.userAgent) || (navigator.maxTouchPoints > 1 && /Macintosh/.test(navigator.userAgent)) ? "Tablet"
  : isPhone() || /Mobi|Android|iPhone/i.test(navigator.userAgent) ? "Phone" : "PC or laptop";
const BUG_KINDS = ["Something doesn't work", "Wrong numbers or rewards", "Display or layout problem", "Translation error", "Lost progress", "Other"];
function bugGameInfo() {
  const v = (document.querySelector('script[src*="01-core.js"]') || {}).src || "";
  const page = state.view + (state.view === "games" && state.gamePage ? " / " + state.gamePage : "");
  return [
    `Game version: ${(v.match(/v=([\w]+)/) || [])[1] || "?"}`,
    `Page: ${page}`,
    `Language: ${typeof LANG === "string" ? LANG : "en"}`,
    `Signed in: ${typeof cloud === "object" && cloud.user ? "yes" : "no (guest)"}`,
    `Screen: ${innerWidth}×${innerHeight} (${isPhone() ? "phone" : "desktop"})`,
    `Browser: ${navigator.userAgent}`,
    `Time: ${new Date().toISOString()}`,
  ].join("\n");
}
function bugReportText() {
  const kind = $("bugKind").value, device = $("bugDevice").value, what = $("bugText").value.trim().slice(0, 1500);
  return { subject: `[Bug] Empire of Coins: ${kind}`,
    body: `Device: ${device}\n\nWhat happened:\n${what || "(no description)"}\n\n` + ($("bugInfo").checked ? `--- Game details ---\n${bugGameInfo()}\n` : "") };
}
function showBugReport() {
  showModal(`<div class="bugForm">
    <h2>${ico("bug", "pti")}Report a bug</h2>
    <p class="muted">Tell us what went wrong. Your report goes to <b>${BUG_EMAIL}</b>.</p>
    <label>What are you playing on?<select id="bugDevice">${BUG_DEVICES.map(d => `<option value="${d}" ${d === bugGuessDevice() ? "selected" : ""}>${d === "Phone" ? "📱" : d === "Tablet" ? "📲" : "💻"} ${d}</option>`).join("")}</select></label>
    <label>What kind of problem?<select id="bugKind">${BUG_KINDS.map(k => `<option value="${k}">${k}</option>`).join("")}</select></label>
    <label>What happened? What did you expect?<textarea id="bugText" rows="6" maxlength="1500"
      placeholder="For example: I won the level 4 boss but the loot box didn't open."></textarea></label>
    <label class="bugCheck"><input type="checkbox" id="bugInfo" checked> Attach game details (version, page, browser and screen size). No save data or personal details are included.</label>
    <div class="cloudPick">
      <button class="btn big" id="bugSend">${acI("requests")}<span>Send by email</span></button>
      <button class="btn big ghost" id="bugCopy">${acI("copy")}<span>Copy report</span></button>
    </div>
    <p class="muted bugAlt">No email app? Press <b>Copy report</b> and send it from your email to <b>${BUG_EMAIL}</b>.</p>
    <button class="btn ghost small" id="bugBack">← Back to settings</button>
  </div>`);
  $("modalBox").classList.add("wide");
  $("bugText").focus();
  $("bugSend").onclick = () => {
    const r = bugReportText();
    location.href = `mailto:${BUG_EMAIL}?subject=${encodeURIComponent(r.subject)}&body=${encodeURIComponent(r.body)}`;
    showNotice("📧 Opening your email app… If nothing opens, use Copy report.");
  };
  $("bugCopy").onclick = async () => {
    const r = bugReportText(), text = `To: ${BUG_EMAIL}\nSubject: ${r.subject}\n\n${r.body}`;
    try { await navigator.clipboard.writeText(text); showNotice("📋 Report copied. Paste it into an email to " + BUG_EMAIL + "."); }
    catch (e) { $("bugText").value = text; $("bugText").select(); showNotice("📋 Select the text and copy it."); }
  };
  $("bugBack").onclick = () => showSettings(typeof settingsFromMenu !== "undefined" && settingsFromMenu);
}

/* ☕ SUPPORT THE GAME (main menu → Donate, ⚙️ Settings → Support the game)
   Opens the Ko-fi page in a new tab. Donations are voluntary and give nothing in the game (see the Terms of Use). */
const KOFI_URL = "https://ko-fi.com/eoccgame";
function showDonate() {
  showModal(`<div class="donateBox">
    <h2>☕ Support Empire of Coins</h2>
    <p>Empire of Coins is made by one developer and is <b>free to play, with no ads and nothing to buy</b>. If you enjoy it,
      you can support its development with a small donation on Ko-fi.</p>
    <ul>
      <li>Donations are completely <b>voluntary</b> and go to the developer.</li>
      <li>They <b>don't give anything in the game</b>: no coins, chips or items. Every player stays on equal terms.</li>
      <li>Payment is handled securely by Ko-fi with PayPal or Stripe. The game never sees your payment details.</li>
    </ul>
    <div class="cloudPick">
      <button class="btn big" id="donateGo">☕ Open Ko-fi</button>
      <button class="btn big ghost" id="donateClose">Maybe later</button>
    </div>
    <p class="muted">Thank you for playing! ❤️</p>
  </div>`);
  $("modalBox").classList.add("wide");
  $("donateClose").onclick = () => hideModal();
  $("donateGo").onclick = () => { window.open(KOFI_URL, "_blank", "noopener"); hideModal(); };
}
