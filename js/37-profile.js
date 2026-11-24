/* Empire of Coins © 2026 milkhunt3r. All rights reserved. */
/* =====================================================================
   👤 PLAYER PROFILE: nickname, avatar (one of your achievement badges), achievements and prestige count.
   · Opened with the round 👤 button next to ⚙️ Settings.
   · Needs a Google sign-in (☁️ js/29-cloud.js): the profile is stored in Supabase table public.profiles
     (see docs/supabase-profiles.sql). Every signed-in player can see every profile; only you can change yours.
   · Nicknames: 3–16 letters, numbers, spaces, _ . -; unique (ignoring case); rude or reserved names are refused
     here AND by the database (same word lists).
   · Achievements and prestige count are uploaded by themselves when they change.
   ===================================================================== */
const PROF_CACHE = "eoc-profile";
const prof = { row: null, user: null, loading: false, err: "", msg: "", busy: false, showAll: false };
try { const c = JSON.parse(localStorage.getItem(PROF_CACHE) || "null"); if (c && c.user) { prof.row = c.row; prof.user = c.user; } } catch (e) {}
const profCache = () => { try { localStorage.setItem(PROF_CACHE, JSON.stringify(prof.row && prof.user ? { user: prof.user, row: prof.row } : null)); } catch (e) {} };

/* ----- 🚫 nickname rules (the same lists live in docs/supabase-profiles.sql) ----- */
const PROF_BAD = /(fuck|fck|shit|bitch|bich|cunt|nigg|niga|faggot|fagot|whore|slut|rapist|nazi|hitler|porn|pussy|pusy|penis|vagina|asshole|ashole|retard|wanker|dildo|jizz|molest|incest|hijoput|hijodeput|hijaput|gilipol|mierd|cabron|pendej|maricon|folla|subnormal|putita|puton)/;
const PROF_BAD_SQ = /(fuck|fck|shit|bitch|bich|cunt|nigg|niga|fagot|whore|slut|rapist|nazi|hitler|porn|pusy|penis|vagina|ashole|retard|wanker|dildo|jiz|molest|incest|hijoput|hijodeput|hijaput|gilipol|mierd|cabron|pendej|maricon|fola|subnormal|putita|puton)/;
const PROF_BAD_WORDS = new Set(["ass", "fag", "dick", "cock", "cum", "sex", "sexy", "pedo", "anal", "boob", "boobs", "tits", "tit", "rape", "puta", "puto", "putas", "putos",
  "culo", "polla", "verga", "zorra", "cono", "pene", "perra", "joder", "hdp", "mamon", "admin", "moderator", "mod", "official", "oficial", "staff", "support", "soporte", "system", "sistema"]);
const PROF_RESERVED = new Set(["admin", "moderator", "empireofcoins", "official", "staff", "support", "kkk"]);
const PROF_CHARS = /^[A-Za-z0-9ÀÁÂÃÄÅÇÈÉÊËÌÍÎÏÑÒÓÔÕÖÙÚÛÜÝàáâãäåçèéêëìíîïñòóôõöùúûüýÿ_ .-]+$/;
const profTidy = (n) => String(n || "").replace(/\s+/g, " ").trim();
function profNickOk(n) {
  let t = n.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
  t = t.replace(/[013457@$!]/g, (c) => ({ 0: "o", 1: "i", 3: "e", 4: "a", 5: "s", 7: "t", "@": "a", $: "s", "!": "i" }[c]));
  const joined = t.replace(/[^a-z]/g, ""), squeezed = joined.replace(/([a-z])\1+/g, "$1");
  if (PROF_BAD.test(joined) || PROF_BAD_SQ.test(squeezed)) return false;
  // words: split on spaces/symbols AND on camelCase ("BigDick" → big, dick)
  const words = n.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/([a-z])([A-Z])/g, "$1 $2").toLowerCase()
    .replace(/[013457@$!]/g, (c) => ({ 0: "o", 1: "i", 3: "e", 4: "a", 5: "s", 7: "t", "@": "a", $: "s", "!": "i" }[c])).split(/[^a-z]+/);
  if (words.some(w => PROF_BAD_WORDS.has(w)) || PROF_RESERVED.has(joined)) return false;
  return true;
}
function profNickError(n) {
  if (n.length < 3) return "Your nickname needs at least 3 characters.";
  if (n.length > 16) return "Your nickname can have at most 16 characters.";
  if (!PROF_CHARS.test(n)) return "Use only letters, numbers, spaces and _ . -";
  if (!profNickOk(n)) return "That nickname isn't allowed. Please choose a friendly one.";
  return "";
}

/* ----- 🏆 what other players see ----- */
const profStats = () => ({ ach_done: achDone(), ach_total: achShown().length, prestige: (state.legacy && state.legacy.count) || 0 });
const profAvatarIds = () => ACHIEVEMENTS.filter(a => ACH_PICS.has(a.id) && state.achievements[a.id]).map(a => a.id);
const profAvatarImg = (id, cls = "") => id && ACH_PICS.has(id) ? `<img class="${cls}" src="assets/ach/${id}.webp" alt="">` : `<span class="${cls} profNoAv">👤</span>`;
const profSignedIn = () => typeof cloud === "object" && !!cloud.user && !!cloud.sb;

async function profLoad() {
  if (!profSignedIn() || prof.loading) return;
  prof.loading = true; prof.err = "";
  try {
    const { data, error } = await cloud.sb.from("profiles").select("nickname, avatar, ach_done, ach_total, prestige").eq("user_id", cloud.user.id).maybeSingle();
    if (error) throw error;
    prof.row = data; prof.user = cloud.user.id; profCache();
  } catch (e) { console.warn("Profile load failed:", e); prof.err = e && (e.code === "42P01" || e.code === "PGRST205") ? profDbError(e) : "load"; }
  prof.loading = false;
  profUi(); profPushStats();
}
function profDbError(e) {
  const c = e && e.code;
  if (c === "23505") return "That nickname is already taken. Try another one.";
  if (c === "23514") return "That nickname isn't allowed. Please choose a friendly one.";
  if (c === "42P01" || c === "PGRST205") return "Profiles aren't switched on yet. Please try again later.";
  return "Something went wrong. Please try again.";
}
async function profSaveNick(raw) {
  const n = profTidy(raw), bad = profNickError(n);
  prof.msg = "";
  if (bad) { prof.err = bad; return renderProfile(); }
  if (!profSignedIn() || prof.busy) return;
  if (prof.row && prof.row.nickname === n) { prof.err = ""; return renderProfile(); }
  prof.busy = true; prof.err = ""; renderProfile();
  try {
    const st = profStats(), avatar = (prof.row && prof.row.avatar) || prof.pendingAvatar || "";
    const q = prof.row
      ? cloud.sb.from("profiles").update({ nickname: n }).eq("user_id", cloud.user.id)
      : cloud.sb.from("profiles").insert({ user_id: cloud.user.id, nickname: n, avatar, ...st });
    const { error } = await q;
    if (error) throw error;
    prof.row = { ...(prof.row || { avatar, ...st }), nickname: n }; prof.user = cloud.user.id; profCache();
    prof.msg = "✅ Nickname saved.";
  } catch (e) { console.warn("Nickname save failed:", e); prof.err = profDbError(e); }
  prof.busy = false; profUi();
}
async function profSetAvatar(id) {
  if (!ACH_PICS.has(id) || !state.achievements[id]) return;
  if (!prof.row) { prof.pendingAvatar = id; return renderProfile(); }
  const old = prof.row.avatar;
  prof.row.avatar = id; profCache(); profUi();
  try { const { error } = await cloud.sb.from("profiles").update({ avatar: id }).eq("user_id", cloud.user.id); if (error) throw error; }
  catch (e) { console.warn("Avatar save failed:", e); prof.row.avatar = old; profCache(); prof.err = profDbError(e); profUi(); }
}
// 🔄 achievements and prestige go up by themselves (checked every 30 s, only uploaded when they changed)
let profPushing = false;
async function profPushStats() {
  if (!profSignedIn() || !prof.row || profPushing || prof.user !== cloud.user.id) return;
  const st = profStats();
  if (st.ach_done === prof.row.ach_done && st.ach_total === prof.row.ach_total && st.prestige === prof.row.prestige) return;
  profPushing = true;
  try { const { error } = await cloud.sb.from("profiles").update(st).eq("user_id", cloud.user.id); if (!error) { Object.assign(prof.row, st); profCache(); } }
  catch (e) {}
  profPushing = false;
}
setInterval(profPushStats, 30000);

/* ----- 🖼️ the page ----- */
function profCardHtml(row) {
  const st = profStats(), nick = row ? row.nickname : "", av = row ? row.avatar : prof.pendingAvatar;
  return `<div class="profCard">${profAvatarImg(av, "profAv")}
    <div class="profCardInfo"><div class="profNick" data-noi18n>${nick ? escapeHtml(nick) : "<i>…</i>"}</div>
      <div class="profStats"><span>🏆 <b>${st.ach_done}/${st.ach_total}</b> achievements</span><span>⭐ Prestige <b>${st.prestige}</b></span></div></div></div>`;
}
function renderProfile() {
  const box = $("profileView"); if (!box || box.hidden) return;
  if (!profSignedIn()) {
    box.innerHTML = `<div class="card profWrap"><h2 style="margin-top:0">👤 Your profile</h2>
      <p>Sign in with Google to create your player profile. Other players will see your <b>nickname</b>, your <b>avatar</b>, your <b>achievements</b> and your <b>prestige count</b>.</p>
      <button class="btn big" data-prof="signin"><span class="gIcon">G</span>Sign in with Google</button>
      ${typeof cloud === "object" && !cloud.sb ? `<p class="muted">${cloud.status === "loading" ? "Connecting…" : "Sign-in isn't available right now."}</p>` : ""}</div>`;
    return;
  }
  if (prof.user !== cloud.user.id && !prof.loading) { prof.row = null; profLoad(); }
  const row = prof.user === cloud.user.id ? prof.row : null;
  const ids = profAvatarIds(), cur = row ? row.avatar : prof.pendingAvatar;
  const shown = prof.showAll ? ids : ids.slice(0, 60);
  const typed = $("profNick") ? $("profNick").value : null;
  box.innerHTML = `<div class="card profWrap"><div class="row"><h2 style="margin:0">👤 Your profile</h2><span class="muted">Visible to other players</span></div>
      ${profCardHtml(row)}
      ${prof.loading && !row ? `<p class="muted">Loading…</p>` : ""}
      ${!row && !prof.loading ? `<p class="profNew">✨ Choose a nickname and an avatar to create your profile.</p>` : ""}</div>
    <div class="card profWrap"><h3 style="margin-top:0">✏️ Nickname</h3>
      <div class="profNickRow"><input id="profNick" maxlength="16" autocomplete="off" spellcheck="false" placeholder="Your nickname" value="${escapeHtml(typed != null ? typed : row ? row.nickname : "")}" data-noi18n aria-label="Nickname">
        <button class="btn" data-prof="nick" ${prof.busy ? "disabled" : ""}>${row ? "Save" : "Create profile"}</button></div>
      <div class="muted">3–16 characters: letters, numbers, spaces and _ . - · Every nickname is unique. Rude names aren't allowed.</div>
      ${prof.err ? `<div class="profErr">❌ ${prof.err === "load" ? "Your profile couldn't be loaded. Check your connection and try again." : prof.err}</div>` : ""}
      ${prof.msg ? `<div class="profOk">${prof.msg}</div>` : ""}</div>
    <div class="card profWrap"><h3 style="margin-top:0">🖼️ Avatar</h3>
      <p class="muted">Pick one of your achievement badges. Unlock more achievements to get more avatars.</p>
      ${ids.length ? `<div class="profAvGrid">${shown.map(id => { const a = ACHIEVEMENTS.find(x => x.id === id);
        return `<button class="profAvPick ${id === cur ? "on" : ""}" data-prof-av="${id}" title="${escapeHtml(a.name)}">${profAvatarImg(id)}</button>`; }).join("")}</div>
        ${ids.length > shown.length ? `<button class="btn ghost small" data-prof="all">Show all ${ids.length}</button>` : ""}`
        : `<p>🔒 Unlock achievements with a badge picture to choose an avatar.</p>`}</div>`;
}
function profUi() {
  const b = $("profileBtn");
  if (b) {
    const av = profSignedIn() && prof.user === cloud.user.id && prof.row ? prof.row.avatar : "";
    const html = av ? profAvatarImg(av, "profBtnAv") : `<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7"/></svg>`;
    if (b.dataset.av !== (av || "-")) { b.innerHTML = html; b.dataset.av = av || "-"; }
  }
  if (state.view === "profile") renderProfile();
}

/* ----- 🔘 wiring ----- */
$("settingsWrap").insertAdjacentHTML("afterbegin", `<button id="profileBtn" title="Profile" aria-label="Profile"></button>`);
$("profileBtn").addEventListener("click", () => showView("profile"));
document.addEventListener("click", (e) => {
  const v = $("profileView"); if (!v || !v.contains(e.target)) return;
  const av = e.target.closest("[data-prof-av]"); if (av) return profSetAvatar(av.dataset.profAv);
  const b = e.target.closest("[data-prof]"); if (!b) return;
  if (b.dataset.prof === "signin" && typeof cloudSignIn === "function") cloudSignIn();
  if (b.dataset.prof === "nick") profSaveNick($("profNick").value);
  if (b.dataset.prof === "all") { prof.showAll = true; renderProfile(); }
});
document.addEventListener("keydown", (e) => { if (e.key === "Enter" && e.target.id === "profNick") profSaveNick(e.target.value); });
document.addEventListener("input", (e) => { if (e.target.id === "profNick" && (prof.err || prof.msg)) { prof.err = ""; prof.msg = ""; const x = document.querySelector(".profErr, .profOk"); if (x) x.remove(); } });
// signing in or out (☁️ js/29-cloud.js calls updateCloudUi on every change)
const profCloudUiOrig = updateCloudUi;
updateCloudUi = function () {
  profCloudUiOrig();
  const id = profSignedIn() ? cloud.user.id : null;
  if (id && prof.user !== id) { prof.row = null; prof.user = null; profLoad(); }
  profUi();
};
profUi();
if (state.view === "profile") renderProfile();
