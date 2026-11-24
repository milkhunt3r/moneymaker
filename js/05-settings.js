/* Empire of Coins © 2026 milkhunt3r. All rights reserved. */
/* =====================================================================
   SETTINGS: save, download / load a progress file, reset
   ===================================================================== */
$("settingsBtn").addEventListener("click", (e) => {
  e.stopPropagation();
  showSettings(false);
});
// click anywhere else closes the menu
document.addEventListener("click", (e) => {
  // (ignore clicks made by code, like the download link)
  if (e.isTrusted && !e.target.closest("#settingsWrap")) $("settingsMenu").hidden = true;
});

const SETTINGS_NOTE = "The game saves itself every 30 seconds and after every action.";
function settingsNote(text) {
  $("settingsNote").textContent = text;
  const n = $("orNote"); if (n) n.textContent = text;
  setTimeout(() => {
    $("settingsNote").textContent = SETTINGS_NOTE;
    const n2 = $("orNote"); if (n2) n2.textContent = SETTINGS_NOTE;
  }, 3000);
}

// ⚙️ The ornate settings panel (from the ⚙️ button and from Settings on the main menu).
// Its rows run the same actions as the (hidden) #settingsMenu buttons.
const OR_ICONS = {
  cup: '<path d="M4 8h13v5a6 6 0 0 1-6 6H10a6 6 0 0 1-6-6V8z"/><path d="M17 10h1.5a2.5 2.5 0 0 1 0 5H17" fill="none" stroke="currentColor" stroke-width="2"/><path d="M8 2.5c0 1.5 1.5 1.5 1.5 3M12 2.5c0 1.5 1.5 1.5 1.5 3" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>',
  save: '<path d="M4 3h12.5L21 7.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zm3 2v5h9V5zm5 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z"/>',
  download: '<path d="M11 3h2v10.2l3.6-3.6 1.4 1.4-6 6-6-6 1.4-1.4 3.6 3.6zM4 19h16v2H4z"/>',
  load: '<path d="M13 21h-2V10.8l-3.6 3.6L6 13l6-6 6 6-1.4 1.4-3.6-3.6zM4 3h16v2H4z"/>',
  tips: '<path d="M12 2a7 7 0 0 0-4 12.7V17a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-2.3A7 7 0 0 0 12 2zM9 20h6v1.2a.8.8 0 0 1-.8.8H9.8a.8.8 0 0 1-.8-.8z"/>',
  tipsReset: '<path d="M12 4a8 8 0 1 1-7.7 10h2.1A6 6 0 1 0 12 6V9L7 5l5-4z"/>',
  tutorial: '<path d="M6 3.5v17l14-8.5z"/>',
  bug: '<path d="M9 4.5 7.6 3.1 9 1.7l2 2a5 5 0 0 1 2 0l2-2 1.4 1.4L15 4.5A5 5 0 0 1 17 8H7a5 5 0 0 1 2-3.5zM6 10h12v4a6 6 0 0 1-12 0zm-4 1h3v2H2zm17 0h3v2h-3zM2 17l3-1 .6 1.9-3 1zm19.4 1.9-3-1 .6-1.9 3 1zM11 12h2v7h-2z"/>',
  menu: '<path d="M12 3 2 11h3v10h5v-6h4v6h5V11h3z"/>',
  bright: '<path d="M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10zm-1-6h2v3h-2zm0 19h2v3h-2zM1 11h3v2H1zm19 0h3v2h-3zM4.2 5.6l1.4-1.4 2.1 2.1-1.4 1.4zm12.1 12.1 1.4-1.4 2.1 2.1-1.4 1.4zM4.2 18.4l2.1-2.1 1.4 1.4-2.1 2.1zM16.3 6.3l2.1-2.1 1.4 1.4-2.1 2.1z"/>',
  lang: '<path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm6.9 6h-2.9a15.7 15.7 0 0 0-1.4-3.6A8 8 0 0 1 18.9 8zM12 4a14 14 0 0 1 1.9 4h-3.8A14 14 0 0 1 12 4zM4.3 14a8.2 8.2 0 0 1 0-4h3.4a16.5 16.5 0 0 0 0 4zm.8 2h2.9a15.7 15.7 0 0 0 1.4 3.6A8 8 0 0 1 5.1 16zM8 8H5.1a8 8 0 0 1 4.3-3.6A15.7 15.7 0 0 0 8 8zm4 12a14 14 0 0 1-1.9-4h3.8A14 14 0 0 1 12 20zm2.3-6H9.7a14.7 14.7 0 0 1 0-4h4.6a14.7 14.7 0 0 1 0 4zm.3 5.6a15.7 15.7 0 0 0 1.4-3.6h2.9a8 8 0 0 1-4.3 3.6zm1.7-5.6a16.5 16.5 0 0 0 0-4h3.4a8.2 8.2 0 0 1 0 4z"/>',
  reset: '<path d="M8 2h8l1 2h4v2H3V4h4zM5 8h14l-1.2 13a1 1 0 0 1-1 1H7.2a1 1 0 0 1-1-1zm4 2v9h2v-9zm4 0v9h2v-9z"/>',
};
const orIcon = (k) => `<svg viewBox="0 0 24 24">${OR_ICONS[k]}</svg>`;
let settingsFromMenu = false;
// 🌗 Background brightness (20–100%): 100% = the art as it is; lower = darker, easier on the eyes
const bgBright = () => (typeof state.bgBright === "number" ? state.bgBright : 100);
function applyBgBright() { $("bgDim").style.opacity = ((100 - bgBright()) / 100).toFixed(2); }
applyBgBright();
$("modalBox").addEventListener("input", (e) => {
  if (e.target.id !== "orBright") return;
  state.bgBright = Number(e.target.value);
  e.target.style.setProperty("--p", (state.bgBright - 20) / 0.8 + "%");
  $("orBrightVal").textContent = state.bgBright + "%";
  applyBgBright(); save();
});
function showSettings(fromMenu) {
  settingsFromMenu = !!fromMenu;
  $("settingsMenu").hidden = true;
  const row = (k, text, extra = "") => `<button class="orRow" data-or="${k}">${orIcon(k)}<span class="grow">${text}</span>${extra}</button>`;
  showModal(`<div class="orPanel">
      <div class="orRibbon"><span>Settings</span></div>
      <button class="orClose" data-modal="close" aria-label="Close">✕</button>
      <div class="orSec">Display</div>
      <div class="orRow slider">${orIcon("bright")}<span class="grow">Background brightness</span><span class="orVal" id="orBrightVal">${bgBright()}%</span>
        <input type="range" class="orRange" id="orBright" min="20" max="100" step="5" value="${bgBright()}" style="--p:${(bgBright() - 20) / 0.8}%" aria-label="Background brightness"></div>
      <div class="orRow slider">${orIcon("lang")}<span class="grow">Language</span>
        <span class="orLang" data-noi18n><button data-lang="en">English</button><button data-lang="es">Español</button></span></div>
      <div class="orSec">Help</div>
      ${row("tips", "Show tips", `<span class="orSwitch ${state.tips.on ? "on" : ""}" id="orTips"></span>`)}
      ${row("tipsReset", "Show all tips again")}
      ${row("tutorial", "Replay the guided start")}
      <button class="orRow" data-or="donate">${orIcon("cup")}<span class="grow">Support the game</span><span class="orArrow">›</span></button>
      <div class="orRow orLegal">${typeof legalLinks === "function" ? legalLinks() : ""}</div>
      <button class="orRow" data-or="bug">${orIcon("bug")}<span class="grow">Report a bug</span><span class="orArrow">›</span></button>
      <div class="orNote" id="orNote">${SETTINGS_NOTE}</div>
      <div class="orBtns">
        ${fromMenu ? "" : `<button class="orBtn orBlue" data-or="menu"><span>${orIcon("menu")}Main menu</span></button>`}
        <button class="orBtn orRed" data-or="reset"><span>${orIcon("reset")}Reset game</span></button>
      </div>
    </div>`);
  $("modalBox").classList.add("ornate");
}
$("modalBox").addEventListener("click", (e) => {
  const b = e.target.closest("[data-or]"); if (!b) return;
  const what = b.dataset.or;
  if (what === "bug") return showBugReport();
  if (what === "donate") return showDonate();   // 🐞 js/05b-bug-report.js
  if (what === "menu" || what === "tutorial") hideModal();
  $("settingsMenu").querySelector(`[data-setting="${what}"]`).click();
  if (what === "tutorial" && settingsFromMenu) closeMenu();
  const t = $("orTips"); if (t) t.classList.toggle("on", !!state.tips.on);
});

$("settingsMenu").addEventListener("click", (e) => {
  const btn = e.target.closest("[data-setting]");
  if (!btn) return;
  const what = btn.dataset.setting;

  if (what === "menu") { $("settingsMenu").hidden = true; openMenu(); return; }
  if (what === "tips") {
    state.tips.on = !state.tips.on; save();
    $("tipsToggle").textContent = `💡 Show tips: ${state.tips.on ? "ON" : "OFF"}`;
    settingsNote(state.tips.on ? "💡 Tips are on." : "💡 Tips are off.");
    return;
  }
  if (what === "tipsReset") { state.tips.seen = {}; state.tips.on = true; state.tips.lastAt = 0; save(); $("tipsToggle").textContent = "💡 Show tips: ON"; settingsNote("↺ All tips will show again."); return; }
  if (what === "tutorial") { state.tips.tutorial = 0; delete state.tips.energyBase; state.tips.on = true; tutClicks = 0; save(); $("tipsToggle").textContent = "💡 Show tips: ON"; $("settingsMenu").hidden = true; showView("income"); state.incomePage = "biz"; render(); return; }
  if (what === "save") {
    save(); flushSave();
    settingsNote(saveFailedAt ? "❌ Could not save: browser storage is full." : "✅ Game saved!");
    // ☁️ signed in: also upload to the cloud now (js/29-cloud.js)
    if (typeof cloud === "object" && cloud.user && typeof cloudUpload === "function") {
      if (cloud.conflict) { cloudSync(); return; }
      cloud.dirty = true;
      cloudUpload().then(ok => { if (!cloud.conflict) settingsNote(ok ? "✅ Game saved, also in the ☁️ cloud!" : "✅ Saved on this device. ❌ The cloud save failed."); });
    }
  }

  if (what === "reset") {
    $("settingsMenu").hidden = true;
    showModal(`<h2>🗑️ Reset game?</h2>
               <p>This deletes <b>all</b> your progress: money, businesses, levels and investments.</p>
               <p class="muted">Your ☁️ cloud save is not deleted: sign in again to get it back.</p>
               <div class="row">
                 <button class="btn ghost big" data-modal="close">Cancel</button>
                 <button class="btn big dangerBtn" data-modal="confirmReset">Yes, reset everything</button>
               </div>`);
  }
});

// (loading a progress file was removed: saves are protected against editing, see 💾 STORAGE in js/01-core.js)
