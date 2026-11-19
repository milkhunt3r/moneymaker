/* =====================================================================
   ☁️ CLOUD SAVE (Supabase): optional Google login; your progress is copied to your account.
   · Playing without an account works exactly as before (the save stays in this browser).
   · Signed in: the browser save stays the main copy, and it is uploaded to the cloud about once a minute
     (and when the tab is hidden). Painting pictures are not uploaded: on another device kept paintings show the original.
   · On start (and after logging in) the cloud save is compared with this device:
       - no cloud save yet            → this device's progress is uploaded
       - only this device changed      → uploaded
       - only the cloud changed (another device played) → the cloud save is loaded
       - both changed                  → the player chooses which one to keep
     Uploads only overwrite the cloud copy this device last saw (saved_at), so two devices never silently
     overwrite each other.
   · Database: table public.saves (user_id, data, saved_at), Row Level Security: each player only reaches
     their own row. Account deletion: rpc delete_my_account() (see supabase-setup.sql).
   ===================================================================== */
const CLOUD_URL = "https://wxgbjblreysikhwngclb.supabase.co";
const CLOUD_KEY = "sb_publishable_ye9UrsqgQDIqlkR03IVoKg_QSpSX1gu";   // publishable key: safe in the page (RLS protects the data)
const CLOUD_LIB = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.js";
const CLOUD_EVERY = 60000;
const CLOUD_META = "eoc-cloud", LOCAL_AT = "eoc-local-at", LOCAL_GRACE = 15000;

const cloud = { sb: null, user: null, status: "loading", lastAt: 0, busy: false, dirty: false, ready: false };
const cloudMeta = () => { try { return JSON.parse(localStorage.getItem(CLOUD_META) || "null"); } catch (e) { return null; } };
const setCloudMeta = (m) => { try { m ? localStorage.setItem(CLOUD_META, JSON.stringify(m)) : localStorage.removeItem(CLOUD_META); } catch (e) {} };
const localAt = () => Number(localStorage.getItem(LOCAL_AT)) || 0;
const localAtStart = localAt();      // when this device last saved BEFORE this page load (the game saves again right after starting)
const hadLocalAt = localAtStart > 0;  // false on a brand-new device (or before this feature)

// every write of the browser save marks the cloud copy as out of date
const _saveGameLocal = storage.saveGame;
storage.saveGame = (progress) => {
  _saveGameLocal(progress);
  try { localStorage.setItem(LOCAL_AT, String(Date.now())); } catch (e) {}
  cloud.dirty = true;
};

// a short summary of a save, to choose between two of them
function saveSummary(p) {
  const money = Number(p && p.money) || 0, prest = (p && p.legacy && p.legacy.count) || 0;
  const biz = (p && p.companies && p.companies.length) || 0, ach = p && p.achievements ? Object.keys(p.achievements).length : 0;
  return `💰 ${fmt(money)} · ⭐ ${prest}/4 · 🏢 ${biz} · 🏆 ${ach}`;
}
const whenText = (ms) => ms ? new Date(ms).toLocaleString(LANG === "es" ? "es-ES" : undefined, { dateStyle: "medium", timeStyle: "short" }) : "–";
// a brand-new game on this device (nothing worth keeping)
const localIsFresh = () => !hadLocalAt && !(state.legacy && state.legacy.count) && state.companies.length === 0 && state.money < 10000;

async function cloudFetch() {
  const { data, error } = await cloud.sb.from("saves").select("data, saved_at").eq("user_id", cloud.user.id).maybeSingle();
  if (error) throw error;
  return data;   // null when there is no cloud save yet
}
// upload this device's progress; `force` overwrites whatever the cloud has
async function cloudUpload(force) {
  if (!cloud.user || cloud.busy || !tabActive) return false;   // only the tab that plays uploads (js/01-tabs.js)
  cloud.busy = true;
  try {
    flushSave();
    const progress = splitState(state).progress, now = Date.now(), meta = cloudMeta();
    const known = meta && meta.user === cloud.user.id ? meta.cloudAt : null;
    let ok = false;
    if (force || known == null) {
      const { error } = await cloud.sb.from("saves").upsert({ user_id: cloud.user.id, data: progress, saved_at: now });
      if (error) throw error;
      ok = true;
    } else {
      const { data, error } = await cloud.sb.from("saves").update({ data: progress, saved_at: now })
        .eq("user_id", cloud.user.id).eq("saved_at", known).select("saved_at");
      if (error) throw error;
      ok = data && data.length > 0;
      if (!ok) {   // the cloud copy changed on another device since we last saw it: let the player choose
        cloud.busy = false;
        const row = await cloudFetch();
        if (row) return cloudConflict(row), false;
        return cloudUpload(true);
      }
    }
    setCloudMeta({ user: cloud.user.id, cloudAt: now, localAt: localAt() });
    cloud.lastAt = now; cloud.dirty = false; cloud.status = "ok";
    return true;
  } catch (e) {
    console.warn("Cloud save failed:", e);
    cloud.status = "error";
    return false;
  } finally { cloud.busy = false; updateCloudUi(); }
}
// replace this device's save with the cloud one and restart
function cloudLoad(row) {
  stopSaving = true;
  _saveGameLocal(row.data);
  try { localStorage.setItem(LOCAL_AT, String(Date.now())); } catch (e) {}
  setCloudMeta({ user: cloud.user.id, cloudAt: row.saved_at, localAt: localAt() });
  showModal(`<h2>☁️ Loading your cloud save…</h2>`);
  setTimeout(() => location.reload(), 300);
}
function cloudConflict(row) {
  const local = splitState(state).progress;
  showModal(`<h2>☁️ Which progress do you want to keep?</h2>
    <p>Your cloud save and this device have different progress.</p>
    <div class="cloudPick">
      <button class="btn big" data-cloudpick="cloud"><b>☁️ Cloud save</b><small>${saveSummary(row.data)}</small><small>Saved ${whenText(row.saved_at)}</small></button>
      <button class="btn big ghost" data-cloudpick="device"><b>💻 This device</b><small>${saveSummary(local)}</small><small>Saved ${whenText(localAt())}</small></button>
    </div>
    <p class="muted">The other one is replaced.</p>`);
  $("modalBox").querySelector('[data-cloudpick="cloud"]').onclick = () => cloudLoad(row);
  $("modalBox").querySelector('[data-cloudpick="device"]').onclick = () => { hideModal(); cloudUpload(true); };
}
// after a session starts: compare the cloud save with this device
async function cloudSync() {
  if (!tabActive) { setTimeout(cloudSync, 2000); return; }   // a second tab waits until it plays
  try {
    const row = await cloudFetch(), meta = cloudMeta(), mine = meta && meta.user === cloud.user.id;
    if (!row) return cloudUpload(true);
    if (mine && row.saved_at === meta.cloudAt) { if (localAt() > meta.localAt) cloudUpload(); else { cloud.lastAt = row.saved_at; cloud.status = "ok"; } return; }
    // only the cloud changed (a few seconds of saves right after the last upload, e.g. when closing the tab, don't count)
    if ((mine && localAtStart <= meta.localAt + LOCAL_GRACE) || localIsFresh()) return cloudLoad(row);
    cloudConflict(row);
  } catch (e) { console.warn("Cloud sync failed:", e); cloud.status = "error"; }
  finally { updateCloudUi(); }
}

function cloudSignIn() {
  if (!cloud.sb) return showNotice("☁️ The cloud service can't be reached right now.");
  if (Date.now() - (cloud.signInAt || 0) < 5000) return;   // one login at a time (no repeated clicks)
  cloud.signInAt = Date.now();
  save(); flushSave();
  cloud.sb.auth.signInWithOAuth({ provider: "google", options: { redirectTo: location.origin + location.pathname } });
}
async function cloudSignOut() {
  if (cloud.dirty) await cloudUpload();
  await cloud.sb.auth.signOut();
  cloud.user = null; cloud.status = "out";
  showNotice("☁️ Signed out. Your progress stays on this device.");
  updateCloudUi();
}
function cloudDeleteAsk() {
  showModal(`<h2>🗑️ Delete your account?</h2>
    <p>This deletes your account and your <b>cloud save</b> for good.</p>
    <p class="muted">The progress on this device stays (you can keep playing without an account).</p>
    <div class="row"><button class="btn ghost big" data-modal="close">Cancel</button>
      <button class="btn big dangerBtn" id="cloudDelYes">Yes, delete my account</button></div>`);
  $("cloudDelYes").onclick = async () => {
    const { error } = await cloud.sb.rpc("delete_my_account");
    if (error) { console.warn(error); return showNotice("❌ Could not delete the account. Try again later."); }
    await cloud.sb.auth.signOut();
    setCloudMeta(null);
    cloud.user = null; cloud.status = "out";
    hideModal(); showNotice("🗑️ Your account and cloud save were deleted."); updateCloudUi();
  };
}

// ---------- UI: the ⚙️ Settings account rows and the main menu badge ----------
function cloudRowsHtml() {
  const icon = '<svg viewBox="0 0 24 24"><path d="M19 18H6.5a4.5 4.5 0 0 1-.6-9 6 6 0 0 1 11.6 1.5A3.8 3.8 0 0 1 19 18z"/></svg>';
  const r = (k, text, extra = "") => `<button class="orRow" data-cloud="${k}">${icon}<span class="grow">${text}</span>${extra}</button>`;
  if (!cloud.sb) return `<div class="orRow off">${icon}<span class="grow">Cloud save</span><span class="orSoon">${cloud.status === "loading" ? "Connecting…" : "Not available"}</span></div>`;
  if (!cloud.user) return r("in", `<span class="gIcon">G</span>Sign in with Google`, `<span class="orSoon">Cloud save</span>`);
  const st = cloud.status === "error" ? "⚠️ Last upload failed" : cloud.lastAt ? `Saved ${whenText(cloud.lastAt)}` : "…";
  return `<div class="orRow cloudInfo">${icon}<span class="grow"><b data-noi18n>${escapeHtml(cloud.user.email || "Google account")}</b><small id="cloudSt">${st}</small></span></div>` +
    `<div class="cloudBtns"><button data-cloud="now">Save now</button><button data-cloud="out">Sign out</button><button data-cloud="del" class="danger">Delete account</button></div>`;
}
const escapeHtml = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
function updateCloudUi() {
  const box = $("cloudRows");
  if (box) box.innerHTML = cloudRowsHtml();
  const b = $("menuAccount");
  if (b) b.innerHTML = !cloud.sb ? "" : cloud.user ? `☁️ ${escapeHtml((cloud.user.user_metadata && cloud.user.user_metadata.name) || cloud.user.email || "")}` : `<span class="gIcon">G</span>Sign in`;
  if (b) b.hidden = !cloud.sb;
}
// the account section goes at the top of the ⚙️ Settings panel
const _showSettingsCloud = showSettings;
showSettings = function (fromMenu) {
  _showSettingsCloud(fromMenu);
  const first = $("modalBox").querySelector(".orSec");
  if (first) first.insertAdjacentHTML("beforebegin", `<div class="orSec">Account</div><div id="cloudRows">${cloudRowsHtml()}</div>`);
};
$("modalBox").addEventListener("click", (e) => {
  const b = e.target.closest("[data-cloud]"); if (!b) return;
  const k = b.dataset.cloud;
  if (k === "in") cloudSignIn();
  if (k === "out") cloudSignOut();
  if (k === "del") cloudDeleteAsk();
  if (k === "now") cloudUpload().then(ok => showNotice(ok ? "☁️ Saved to the cloud." : "❌ Cloud save failed. Your progress is still saved on this device."));
});
$("menuCorner").insertAdjacentHTML("beforeend", `<button id="menuAccount" hidden></button>`);
$("menuAccount").addEventListener("click", () => cloud.user ? showSettings(true) : cloudSignIn());

// ---------- start: load the Supabase library (the game works without it) ----------
function cloudStart() {
  if (typeof window.supabase === "undefined" || !window.supabase.createClient) { cloud.status = "off"; return updateCloudUi(); }
  cloud.sb = window.supabase.createClient(CLOUD_URL, CLOUD_KEY, { auth: { flowType: "pkce", detectSessionInUrl: true, persistSession: true } });
  cloud.status = "out";
  cloud.sb.auth.onAuthStateChange((event, session) => {
    const u = session && session.user;
    if (u && (!cloud.user || cloud.user.id !== u.id)) {
      cloud.user = u;
      if (/[?&]code=/.test(location.search)) history.replaceState(null, "", location.pathname);   // tidy the address after the Google login
      setTimeout(cloudSync, 0);
    }
    if (!u) cloud.user = null;
    updateCloudUi();
  });
  updateCloudUi();
}
(function loadCloudLib() {
  const s = document.createElement("script");
  s.src = CLOUD_LIB; s.async = true;
  s.onload = cloudStart;
  s.onerror = () => { cloud.status = "off"; updateCloudUi(); };
  document.head.appendChild(s);
})();
setInterval(() => { if (cloud.user && cloud.dirty && !stopSaving) cloudUpload(); }, CLOUD_EVERY);
document.addEventListener("visibilitychange", () => { if (document.hidden && cloud.user && cloud.dirty && !stopSaving) cloudUpload(); });
