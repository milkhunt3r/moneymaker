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
  const sv = $("orSaved"); if (sv) sv.textContent = savedAgo();
  setTimeout(() => {
    $("settingsNote").textContent = SETTINGS_NOTE;
    const n2 = $("orNote"); if (n2) n2.textContent = "";
    const sv = $("orSaved"); if (sv) sv.textContent = savedAgo();
  }, 3000);
}

// ⚙️ The ornate settings panel (from the ⚙️ button and from Settings on the main menu).
// Its rows run the same actions as the (hidden) #settingsMenu buttons.
const OR_ICONS = {
  cup: '<path d="M4 8h13v5a6 6 0 0 1-6 6H10a6 6 0 0 1-6-6V8z"/><path d="M17 10h1.5a2.5 2.5 0 0 1 0 5H17" fill="none" stroke="currentColor" stroke-width="2"/><path d="M8 2.5c0 1.5 1.5 1.5 1.5 3M12 2.5c0 1.5 1.5 1.5 1.5 3" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>',
  save: '<path d="M4 3h12.5L21 7.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zm3 2v5h9V5zm5 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z"/>',
  num: '<path d="M8 3 6.5 21h2L10 3zm7 0-1.5 18h2L17 3zM3.5 8h17v2h-17zm-1 6h17v2h-17z"/>',
  bell: '<path d="M12 22a2.5 2.5 0 0 0 2.4-2h-4.8a2.5 2.5 0 0 0 2.4 2zm7-6V11a7 7 0 0 0-5.5-6.8V3a1.5 1.5 0 0 0-3 0v1.2A7 7 0 0 0 5 11v5l-2 2v1h18v-1z"/>',
  lowFx: '<path d="M12 2l2.4 6.6L21 9l-5.2 4.2L17.6 20 12 16.3 6.4 20l1.8-6.8L3 9l6.6-.4z" opacity=".45"/><path d="M3 3l18 18-1.4 1.4-18-18z"/>',
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
// ⚙️ Numbers / Reduce effects / Pop-ups (screen preferences: per device, kept through resets)
// what the folded Display section shows on its header: language · brightness · numbers
const orDispSummary = () => `${LANG === "es" ? "Español" : "English"} · ${bgBright()}% · ${LANG === "es" ? { coins: "Monedas", short: "Corto", full: "Completo" }[numFmtNow()] : { coins: "Coins", short: "Short", full: "Full" }[numFmtNow()]}`;
const numFmtNow = () => ["short", "full"].includes(state.numFmt) ? state.numFmt : "coins";
const popupHint = () => ({ all: "Every pop-up in the corner: achievements, level-ups and warnings.",
  important: "Only warnings (breakdowns, failed missions, calls for help, trades closed at a loss).",
  off: "No pop-ups in the corner. Tax bills and other choices still open as usual." })[state.popups || "all"];
function applyLowFx() { document.body.classList.toggle("lowfx", !!state.lowFx); }
applyLowFx();
$("modalBox").addEventListener("click", (e) => {
  const n = e.target.closest("[data-numfmt]");
  if (n) {
    state.numFmt = n.dataset.numfmt === "coins" ? "" : n.dataset.numfmt; save();
    n.parentElement.querySelectorAll("button").forEach(b => b.classList.toggle("on", b === n));
    const ex = $("orNumEx"); if (ex) ex.textContent = fmt(state.money);
    if (typeof render === "function") render();
    updateCounter();
    return;
  }
  const p = e.target.closest("[data-popups]");
  if (p) {
    state.popups = p.dataset.popups === "all" ? "" : p.dataset.popups; save();
    p.parentElement.querySelectorAll("button").forEach(b => b.classList.toggle("on", b === p));
    const h = p.closest(".orRow").querySelector(".orHint"); if (h) h.textContent = popupHint();
    if (state.popups === "off") $("alerts").innerHTML = "";
  }
});

// 💾 Back up / restore: the same signed, scrambled text as the browser save (so it can't be edited to cheat)
// 💾 a backup must look like a real save before it may replace this game
const BACKUP_MAX = 2e6;   // characters (a busy save is ~120 KB)
function backupShapeOk(d) {
  if (!d || typeof d !== "object" || Array.isArray(d)) return false;
  const num = (x) => typeof x === "number" && Number.isFinite(x);
  return num(d.money) && d.money >= 0 && Array.isArray(d.companies) && (d.legacy == null || typeof d.legacy === "object")
    && (d.achievements == null || (typeof d.achievements === "object" && !Array.isArray(d.achievements)))
    && (d.nextId == null || num(d.nextId));
}
function backupText() { return saveEncode(splitState(state).progress); }
function showBackup() {
  showModal(`<h2>💾 Back up or restore your game</h2>
    <p>Keep a copy of your progress in a file, or move it to another browser without an account.</p>
    <div class="row" style="justify-content:center; flex-wrap:wrap; gap:8px">
      <button class="btn big" id="bkDownload">⬇️ Download backup file</button>
      <button class="btn big ghost" id="bkCopy">📋 Copy backup code</button></div>
    <h3 style="margin-top:18px">Restore</h3>
    <p class="muted">Load a backup file or paste a backup code. <b>It replaces the game on this device</b>${typeof cloud === "object" && cloud.user ? " (and your ☁️ cloud save at the next sync)" : ""}.</p>
    <div class="row" style="justify-content:center; flex-wrap:wrap; gap:8px">
      <label class="btn ghost" style="cursor:pointer; border:1px solid rgba(255,255,255,0.3); padding:8px 14px; border-radius:10px">📂 Choose a file<input type="file" id="bkFile" accept=".txt,text/plain" hidden></label></div>
    <textarea id="bkText" rows="3" style="width:100%; margin-top:8px; font-size:12px" placeholder="${LANG === "es" ? "…o pega aquí un código de copia" : "…or paste a backup code here"}" data-noi18n></textarea>
    <p class="muted" id="bkMsg"></p>
    <div class="row" style="justify-content:center; gap:8px">
      <button class="btn ghost" id="bkBack">← Settings</button>
      <button class="btn dangerBtn" id="bkLoad" disabled>Restore this backup</button></div>`);
  $("modalBox").classList.add("wide");
  const msg = (t) => { $("bkMsg").textContent = t; };
  let picked = null;
  const check = (raw) => {
    raw = (raw || "").trim(); picked = null; $("bkLoad").disabled = true;
    if (!raw) return msg("");
    if (raw.length > BACKUP_MAX) return msg("❌ This file is far too big to be an Empire of Coins backup.");
    let r; try { r = saveDecode(raw); } catch (e) { r = {}; }
    if (!r.ok || !backupShapeOk(r.data)) return msg("❌ This isn't a valid Empire of Coins backup (or it was changed).");
    picked = cleanSave(r.data); $("bkLoad").disabled = false;
    msg(`✅ Backup found: ${fmt(picked.money || 0)}${picked.legacy && picked.legacy.count ? `, ⭐ ${picked.legacy.count} prestige${picked.legacy.count === 1 ? "" : "s"}` : ""}.`);
  };
  $("bkDownload").onclick = () => {
    save(); flushSave();
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([backupText()], { type: "text/plain" }));
    a.download = `empire-of-coins-backup-${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 5000);
    msg("✅ Backup file downloaded.");
  };
  $("bkCopy").onclick = async () => {
    try { await navigator.clipboard.writeText(backupText()); msg("✅ Backup code copied. Paste it somewhere safe."); }
    catch (e) { $("bkText").value = backupText(); $("bkText").select(); msg("Select the code above and copy it."); }
  };
  $("bkFile").onchange = (e) => { const f = e.target.files[0]; if (!f) return;
    if (f.size > BACKUP_MAX) return msg("❌ This file is far too big to be an Empire of Coins backup.");   // don't even read it
    f.text().then(t => { $("bkText").value = ""; check(t); }); };
  $("bkText").oninput = (e) => check(e.target.value);
  $("bkBack").onclick = () => showSettings(settingsFromMenu);
  $("bkLoad").onclick = () => {
    if (!picked) return;
    stopSaving = true;
    try { storage.saveGame(picked); } catch (e) { stopSaving = false; return msg("❌ Could not save: browser storage is full."); }
    location.reload();
  };
}

// 💾 "Saved 12 s ago" in ⚙️ Settings (ticks while the window is open)
function savedAgo() {
  const s = Math.max(0, Math.round((Date.now() - lastSaveAt) / 1000));
  return s < 5 ? "just now" : s < 60 ? `${s} s ago` : s < 3600 ? `${Math.floor(s / 60)} min ago` : `${Math.floor(s / 3600)} h ago`;
}
setInterval(() => { const el = $("orSaved"); if (el) el.textContent = savedAgo(); }, 1000);
function showSettings(fromMenu) {
  settingsFromMenu = !!fromMenu;
  $("settingsMenu").hidden = true;
  const row = (k, text, extra = "") => `<button class="orRow" data-or="${k}">${orIcon(k)}<span class="grow">${text}</span>${extra}</button>`;
  showModal(`<div class="orPanel">
      <div class="orRibbon"><span>Settings</span></div>
      <button class="orClose" data-modal="close" aria-label="Close">✕</button>
      <div class="orSec">Game</div>
      <div class="orRow orSave">${orIcon("save")}<span class="grow"><span>Saved <b id="orSaved">${savedAgo()}</b></span><small>Saves itself every 30 seconds and after every action.</small></span>
        <button class="orMini" data-or="save">Save now</button></div>
      <button class="orRow" data-or="backup">${orIcon("download")}<span class="grow">Back up or restore your game</span><span class="orArrow">›</span></button>
      <div class="orSec">Account</div>
      <div id="orCloud">${typeof cloudRowsHtml === "function" ? cloudRowsHtml(true) : ""}</div>
      <button class="orSec orFold" data-or="foldDisplay" aria-expanded="${!!state.orDispOpen}"><span>Display</span><span class="orFoldHint" id="orDispHint" data-noi18n>${state.orDispOpen ? (LANG === "es" ? "▴ Ocultar" : "▴ Hide") : `${orDispSummary()} ▾`}</span></button>
      <div id="orDisplay" ${state.orDispOpen ? "" : "hidden"}>
      <div class="orRow slider">${orIcon("bright")}<span class="grow">Background brightness</span><span class="orVal" id="orBrightVal">${bgBright()}%</span>
        <input type="range" class="orRange" id="orBright" min="20" max="100" step="5" value="${bgBright()}" style="--p:${(bgBright() - 20) / 0.8}%" aria-label="Background brightness"></div>
      <div class="orRow slider">${orIcon("lang")}<span class="grow">Language</span>
        <span class="orLang" data-noi18n><button data-lang="en">English</button><button data-lang="es">Español</button></span></div>
      <div class="orRow slider">${orIcon("num")}<span class="grow">Numbers</span>
        <span class="orLang" data-noi18n>${[["coins", "Coins"], ["short", "Short"], ["full", "Full"]].map(([k, t]) => `<button data-numfmt="${k}" class="${numFmtNow() === k ? "on" : ""}">${LANG === "es" ? { Coins: "Monedas", Short: "Corto", Full: "Completo" }[t] : t}</button>`).join("")}</span>
        <small class="orHint" id="orNumEx">${fmt(state.money)}</small></div>
      ${row("lowFx", "Reduce effects", `<span class="orSwitch ${state.lowFx ? "on" : ""}" id="orLowFx"></span>`)}
      <div class="orRow slider">${orIcon("bell")}<span class="grow">Pop-ups</span>
        <span class="orLang" data-noi18n>${[["all", "All"], ["important", "Important"], ["off", "Off"]].map(([k, t]) => `<button data-popups="${k}" class="${(state.popups || "all") === k ? "on" : ""}">${LANG === "es" ? { All: "Todos", Important: "Importantes", Off: "Ninguno" }[t] : t}</button>`).join("")}</span>
        <small class="orHint">${popupHint()}</small></div>
      </div>
      <div class="orSec">Help</div>
      ${row("tips", "Show tips", `<span class="orSwitch ${state.tips.on ? "on" : ""}" id="orTips"></span>`)}
      ${row("tipsReset", "Show all tips again")}
      ${row("tutorial", "Replay the guided start")}
      <div class="orSec">About</div>
      <button class="orRow" data-or="donate">${orIcon("cup")}<span class="grow">Support the game</span><span class="orArrow">›</span></button>
      <button class="orRow" data-or="bug">${orIcon("bug")}<span class="grow">Report a bug</span><span class="orArrow">›</span></button>
      <div class="orRow orLegal">${typeof legalLinks === "function" ? legalLinks() : ""}</div>
      <div class="orNote" id="orNote"></div>
      ${fromMenu ? "" : `<div class="orBtns"><button class="orBtn orBlue" data-or="menu"><span>${orIcon("menu")}Main menu</span></button></div>`}
      <div class="orDanger"><span>Danger zone</span><button data-or="reset">🗑️ Reset game</button></div>
    </div>`);
  $("modalBox").classList.add("ornate");
}
$("modalBox").addEventListener("click", (e) => {
  const b = e.target.closest("[data-or]"); if (!b) return;
  const what = b.dataset.or;
  if (what === "bug") return showBugReport();
  if (what === "backup") return showBackup();
  if (what === "foldDisplay") {   // ▾ the Display section folds (folded by default; remembered on this device)
    state.orDispOpen = !state.orDispOpen; save();
    const d = $("orDisplay"), h = $("orDispHint"); if (d) d.hidden = !state.orDispOpen;
    if (h) h.textContent = state.orDispOpen ? (LANG === "es" ? "▴ Ocultar" : "▴ Hide") : `${orDispSummary()} ▾`;
    b.setAttribute("aria-expanded", !!state.orDispOpen); return;
  }
  if (what === "lowFx") { state.lowFx = !state.lowFx; applyLowFx(); save(); const t = $("orLowFx"); if (t) t.classList.toggle("on", !!state.lowFx); return; }
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
