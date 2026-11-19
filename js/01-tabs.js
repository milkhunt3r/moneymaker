/* =====================================================================
   🗂️ ONE TAB AT A TIME
   Two tabs running the game would each keep their own copy of the progress and overwrite each other's save
   (and the cloud save). Only one tab plays: it holds a browser lock ("Web Locks"). A tab opened while the game
   is already running shows a screen with "Play here": that tells the other tab to save and stop, then this tab
   reloads with the latest save and takes over. A tab that was taken over stops saving and offers "Play here" too.
   Until a tab has the lock it never saves, so a second tab can't overwrite the progress of the first.
   Browsers without Web Locks simply run as before.
   ===================================================================== */
const TAB_LOCK = "empire-of-coins-game";
const tabChan = typeof BroadcastChannel === "function" ? new BroadcastChannel("empire-of-coins") : null;
let tabActive = !(navigator.locks && navigator.locks.request);   // no Web Locks: behave as before
let tabRelease = null;
if (!tabActive) stopSaving = true;                                // nothing is saved until this tab owns the game

function tabScreen(text) {
  let el = document.getElementById("tabBlock");
  if (!el) {
    el = document.createElement("div");
    el.id = "tabBlock";
    document.body.appendChild(el);
  }
  el.innerHTML = `<div class="tabCard"><div class="tabIcon">🗂️</div><h2>The game is open in another tab</h2>
    <p>${text}</p><button class="btn big" id="tabPlayHere">▶ Play here</button></div>`;
  el.hidden = false;
  document.getElementById("tabPlayHere").onclick = tabTakeOver;
}
// this tab wants to play: ask the other tab to save and stop, wait for its lock, then reload with the newest save
function tabTakeOver() {
  const b = document.getElementById("tabPlayHere");
  if (b) { b.disabled = true; b.textContent = "⏳ …"; }
  if (tabChan) tabChan.postMessage({ type: "takeover" });
  navigator.locks.request(TAB_LOCK, () => { location.reload(); return new Promise(() => {}); });
}
// the lock is held for as long as this tab plays (the promise stays open until another tab takes over)
function tabAcquire(ifAvailable) {
  return navigator.locks.request(TAB_LOCK, { ifAvailable }, (lock) => {
    if (!lock) return false;
    tabActive = true; stopSaving = false;
    const el = document.getElementById("tabBlock"); if (el) el.hidden = true;
    return new Promise((res) => { tabRelease = res; });
  });
}
if (!tabActive) {
  tabAcquire(true).then((got) => {
    if (got === false) tabScreen("Only one tab can play at a time, so your progress is never overwritten. Play here to move the game to this tab.");
  });
  if (tabChan) tabChan.onmessage = (e) => {
    if (!e.data || e.data.type !== "takeover" || !tabActive) return;
    // another tab takes over: save everything now, stop saving, and hand over the lock
    // (no cloud upload here: the new tab uploads the same save; two tabs uploading at once would trip over each other)
    try { save(); flushSave(); } catch (err) {}
    tabActive = false; stopSaving = true;
    tabScreen("You opened the game in another tab, so it was paused here. Your progress is saved.");
    // an upload already running finishes first (at most 5 s), then the lock goes to the new tab
    const running = typeof cloud !== "undefined" && cloud.inflight ? cloud.inflight.catch(() => {}) : Promise.resolve();
    Promise.race([running, new Promise(r => setTimeout(r, 5000))]).then(() => { if (tabRelease) { tabRelease(); tabRelease = null; } });
  };
}
