/* Empire of Coins © 2026 milkhunt3r. All rights reserved. */
/* =====================================================================
   👥 FRIENDS (👤 Profile → 👥 Friends). Needs a profile (js/37-profile.js) and the tables from docs/supabase-friends.sql.
   · Find players by nickname (start of the name) or by their 8-letter friend code, and send a request.
   · Requests: accept or decline the ones you got, cancel the ones you sent. Remove a friend at any time.
   · 🟢 online / ⚫ offline: the game updates your profile once a minute while it's open and visible
     (the database stamps last_seen); a friend seen in the last 3 minutes counts as online.
   · Click a friend to see their profile: avatar, achievements, prestige and pets.
   ===================================================================== */
const FR_ONLINE = 3 * 60e3, FR_PING = 60e3, FR_POLL = 2 * 60e3;
const fr = { rows: [], people: {}, loaded: false, loading: false, err: "", q: "", results: null, searching: false, busy: false, at: 0 };
const frMe = () => (profSignedIn() ? cloud.user.id : null);
const frOther = (r) => (r.requester === frMe() ? r.addressee : r.requester);
const frIncoming = () => fr.rows.filter(r => r.status === "pending" && r.addressee === frMe()).length;
const frOnline = (p) => !!(p && p.last_seen && Date.now() - Date.parse(p.last_seen) < FR_ONLINE);
const frDot = (p) => `<span class="frDot ${frOnline(p) ? "on" : ""}" title="${frOnline(p) ? "Online" : "Offline"}"></span>`;
const FR_COLS = "*";   // every column there is (later SQL files add some)
function frErr(e) {
  const m = (e && e.message) || "";
  if (/too_many_requests/.test(m)) return "You have too many requests waiting. Cancel some first.";
  if (/too_many_friends/.test(m)) return "Your friend list is full (200 friends).";
  if (e && e.code === "23505") return "There is already a request between you two.";
  if (e && (e.code === "42P01" || e.code === "PGRST205" || e.code === "42703")) return "Friends aren't switched on yet. Please try again later.";
  return "Something went wrong. Please try again.";
}
const frAgo = (t) => {
  const s = Math.max(0, (Date.now() - Date.parse(t)) / 1000);
  if (s < 3600) return `${Math.max(1, Math.round(s / 60))} min ago`;
  if (s < 86400) return `${Math.round(s / 3600)} h ago`;
  return `${Math.round(s / 86400)} days ago`;
};

/* ----- 🔄 loading ----- */
async function frLoad(quiet) {
  if (!frMe() || !prof.row || fr.loading) return;
  fr.loading = true; if (!quiet) fr.err = "";
  try {
    const { data, error } = await cloud.sb.from("friendships").select("id, requester, addressee, status, created_at");
    if (error) throw error;
    fr.rows = data || [];
    const ids = [...new Set(fr.rows.map(frOther))];
    if (ids.length) {
      const r = await cloud.sb.from("profiles").select(FR_COLS).in("user_id", ids);
      if (r.error) throw r.error;
      (r.data || []).forEach(p => fr.people[p.user_id] = p);
    }
    fr.loaded = true; fr.at = Date.now();
  } catch (e) { console.warn("Friends load failed:", e); if (!quiet) fr.err = frErr(e); }
  fr.loading = false;
  profUi();
}
async function frSearch(q) {
  q = profTidy(q); fr.q = q; fr.err = "";
  if (!frMe() || q.length < 2) { fr.results = null; return renderProfile(); }
  fr.searching = true; renderProfile();
  try {
    const code = q.replace(/[\s-]/g, "").toUpperCase();
    let res;
    if (/^[A-Z0-9]{8}$/.test(code)) {
      res = await cloud.sb.from("profiles").select(FR_COLS).eq("friend_code", code).limit(1);
      if (!res.error && (!res.data || !res.data.length)) res = null;   // not a code after all: search the name
    }
    if (!res) res = await cloud.sb.from("profiles").select(FR_COLS).ilike("nickname", q.replace(/[\\%_]/g, "\\$&") + "%").order("nickname").limit(10);
    if (res.error) throw res.error;
    fr.results = (res.data || []).filter(p => p.user_id !== frMe());
    fr.results.forEach(p => fr.people[p.user_id] = { ...(fr.people[p.user_id] || {}), ...p });
  } catch (e) { console.warn("Friend search failed:", e); fr.err = frErr(e); fr.results = null; }
  fr.searching = false; renderProfile();
}
async function frDo(fn, ok) {
  if (fr.busy) return;
  fr.busy = true; fr.err = "";
  try { const { error } = await fn(); if (error) throw error; if (ok) showNotice(ok); }
  catch (e) { console.warn("Friends:", e); fr.err = frErr(e); }
  fr.busy = false;
  await frLoad(true);
}
const frRowWith = (id) => fr.rows.find(r => frOther(r) === id);
function frAdd(id) {
  const r = frRowWith(id), p = fr.people[id];
  if (r && r.status === "pending" && r.addressee === frMe()) return frAccept(r.id);   // they already asked you
  if (r) return;
  frDo(() => cloud.sb.from("friendships").insert({ requester: frMe(), addressee: id }), `👥 Friend request sent to ${p ? p.nickname : "the player"}.`);
}
const frAccept = (rid) => frDo(() => cloud.sb.from("friendships").update({ status: "accepted" }).eq("id", rid), "👥 You are now friends!");
const frDelete = (rid, msg) => frDo(() => cloud.sb.from("friendships").delete().eq("id", rid), msg);

/* ----- 🖼️ the Friends tab ----- */
function frPersonRow(p, right) {
  return `<div class="frRow"><button class="frWho" data-fr-view="${p.user_id}">${profAvatarImg(p.avatar, "frAv")}${frDot(p)}
      <span class="frName" data-noi18n>${escapeHtml(p.nickname || "?")}</span><span class="frMini">🏆 ${p.ach_done || 0} · ⭐ ${p.prestige || 0}</span></button>
    <span class="frBtns">${right || ""}</span></div>`;
}
function frResultBtn(p) {
  const r = frRowWith(p.user_id);
  if (!r) return `<button class="btn small" data-fr="add" data-id="${p.user_id}" ${fr.busy ? "disabled" : ""}>➕ Add friend</button>`;
  if (r.status === "accepted") return `<span class="muted">✅ Friends</span>`;
  if (r.addressee === frMe()) return `<button class="btn small" data-fr="accept" data-rid="${r.id}">✅ Accept</button>`;
  return `<span class="muted">⏳ Request sent</span>`;
}
// 📤 your friend code: copy it, or share an invite with the phone's share sheet
const frInvite = (code) => LANG === "es" ? `¡Añádeme como amigo en Empire of Coins! Mi código de amigo: ${code}` : `Add me as a friend in Empire of Coins! My friend code: ${code}`;
function frCodeBox(row, big) {
  const code = escapeHtml(row.friend_code || "…");
  return `<div class="frCodeBox ${big ? "big" : ""}"><div><span class="muted">Your friend code</span><b data-noi18n>${code}</b></div>
    <span class="frCodeBtns"><button class="btn ghost small" data-prof="copy">📋 Copy</button>${navigator.share ? `<button class="btn small" data-fr="share">📤 Share</button>` : ""}</span></div>`;
}
// ⚔️ challenge a friend: opens 🎰 Casino → ⚔️ Online casino with this friend picked (choose a game and a bet there)
function frChallengeBtn(p) {
  return typeof duChallenge === "function" && frOnline(p) ? `<button class="btn small" data-fr="duel" data-id="${p.user_id}"><img class="ico" src="assets/duel/ico-duel.webp" alt="">Challenge</button>` : "";
}
function renderFriends(row) {
  const box = $("friendsBox"); if (!box) return;
  if (!row) { box.innerHTML = `<div class="card profWrap"><h2 style="margin-top:0">👥 Friends</h2><p>Create your profile first (👤 Profile tab: choose a nickname). Then you can add friends.</p></div>`; return; }
  if (prof.friendsOn === false) { box.innerHTML = `<div class="card profWrap"><h2 style="margin-top:0">👥 Friends</h2><p>Friends aren't switched on yet. Please try again later.</p></div>`; return; }
  if (!fr.loaded && !fr.loading) frLoad();
  const me = frMe(), P = (r) => fr.people[frOther(r)] || { user_id: frOther(r), nickname: "…" };
  const incoming = fr.rows.filter(r => r.status === "pending" && r.addressee === me);
  const outgoing = fr.rows.filter(r => r.status === "pending" && r.requester === me);
  const friends = fr.rows.filter(r => r.status === "accepted").map(P)
    .sort((a, b) => (frOnline(b) - frOnline(a)) || String(a.nickname).localeCompare(String(b.nickname)));
  const online = friends.filter(frOnline).length;
  const typed = $("frSearch") ? $("frSearch").value : fr.q;
  const none = fr.loaded && !friends.length;
  // 1. requests for you  2. your friends (or an invite when you have none)  3. add a friend  4. requests you sent
  const reqs = incoming.length ? `<div class="card profWrap"><h3 style="margin-top:0">📨 Friend requests <span class="profBadge">${incoming.length}</span></h3><div class="frList">${incoming.map(r => frPersonRow(P(r),
      `<button class="btn small" data-fr="accept" data-rid="${r.id}">✅ Accept</button><button class="btn ghost small" data-fr="decline" data-rid="${r.id}">Decline</button>`)).join("")}</div></div>` : "";
  const list = `<div class="card profWrap"><div class="row"><h3 style="margin:0">👥 Your friends (${friends.length})</h3><span class="muted">${friends.length ? `🟢 ${online} online` : ""}</span></div>
      ${fr.loading && !fr.loaded ? `<p class="muted">Loading…</p>` : friends.length ? `<div class="frList">${friends.map(p => frPersonRow(p, frOnline(p) ? `<span class="frOn">Online</span>${frChallengeBtn(p)}` : p.last_seen ? `<span class="muted">${frAgo(p.last_seen)}</span>` : "")).join("")}</div>`
        : `<div class="frEmpty"><p><b>No friends yet.</b> Send your friend code to the people you play with, or search for their nickname below.</p>${frCodeBox(row, true)}</div>`}</div>`;
  const add = `<div class="card profWrap"><h3 style="margin-top:0">➕ Add a friend</h3>
      <div class="profNickRow"><input id="frSearch" maxlength="20" autocomplete="off" spellcheck="false" placeholder="Nickname or friend code" value="${escapeHtml(typed || "")}" data-noi18n aria-label="Nickname or friend code">
        <button class="btn" data-fr="search" ${fr.searching ? "disabled" : ""}>Search</button></div>
      ${fr.err ? `<div class="profErr">❌ ${fr.err}</div>` : ""}
      ${fr.searching ? `<p class="muted">Searching…</p>` : fr.results ? (fr.results.length ? `<div class="frList">${fr.results.map(p => frPersonRow(p, frResultBtn(p))).join("")}</div>` : `<p class="muted">No players found.</p>`) : ""}
      ${none ? "" : frCodeBox(row, false)}</div>`;
  const sent = outgoing.length ? `<div class="card profWrap"><h3 style="margin-top:0">⏳ Requests you sent</h3><div class="frList">${outgoing.map(r => frPersonRow(P(r),
      `<button class="btn ghost small" data-fr="cancel" data-rid="${r.id}">Cancel</button>`)).join("")}</div></div>` : "";
  box.innerHTML = reqs + list + add + sent;
}

/* ----- 👤 a friend's profile ----- */
function frShowProfile(id) {
  const p = fr.people[id]; if (!p) return;
  const r = frRowWith(id), pets = (p.pets || []).filter(k => PROF_PETS[k]);
  showModal(`<div class="frProfile">${profAvatarImg(p.avatar, "profAv")}
      <h2 data-noi18n>${escapeHtml(p.nickname)}</h2>
      <div class="frStatus">${frDot(p)} ${frOnline(p) ? "Online" : p.last_seen ? `Last seen ${frAgo(p.last_seen)}` : "Offline"}</div>
      <div class="profStats" style="justify-content:center"><span>🏆 <b>${p.ach_total ? `${p.ach_done || 0}/${p.ach_total}` : p.ach_done || 0}</b> achievements</span><span>⭐ Prestige <b>${p.prestige || 0}</b></span></div>
      ${p.levels ? profLevelsHtml(p.levels).replace('class="profLvls"', 'class="profLvls" style="justify-content:center"') : ""}
      ${"money" in p ? (p.hide_money ? `<div class="profMoney" style="justify-content:center"><span class="muted">🙈 Money hidden</span></div>` : `<div class="profMoney" style="justify-content:center">${profCoinImg(p.coin)}<b>${fmt(Number(p.money) || 0)}</b></div>`) : ""}
      ${p.showcase && p.showcase.length ? `<h3 style="margin:16px 0 8px">🏅 Showcase</h3>${profShowcaseHtml(p.showcase, false).replace('class="profShow"', 'class="profShow" style="justify-content:center"')}` : ""}
      <h3 style="margin:16px 0 8px">🐾 Pets</h3>
      ${pets.length ? `<div class="frPets">${pets.map(k => `<div class="frPet"><img src="${PROF_PETS[k].pic}" alt=""><span>${PROF_PETS[k].name}</span></div>`).join("")}</div>` : `<p class="muted">No pets yet.</p>`}
      <div class="row" style="justify-content:center;gap:10px;margin-top:14px;flex-wrap:wrap">
        ${r && r.status === "accepted" ? frChallengeBtn(p) : ""}
        ${!r ? `<button class="btn" data-fr="add" data-id="${p.user_id}">➕ Add friend</button>` : ""}
        <button class="btn ghost" data-modal="close">Close</button></div>
      ${r && r.status === "accepted" ? `<button class="linkBtn frRemove" data-fr="remove" data-rid="${r.id}" data-name="${escapeHtml(p.nickname)}">Remove friend</button>` : ""}</div>`);
}

/* ----- 🔘 clicks ----- */
document.addEventListener("click", (e) => {
  const inPage = $("profileView") && $("profileView").contains(e.target), inModal = $("modalBox") && $("modalBox").contains(e.target);
  if (!inPage && !inModal) return;
  const v = e.target.closest("[data-fr-view]"); if (v && inPage) return frShowProfile(v.dataset.frView);
  const b = e.target.closest("[data-fr]"); if (!b) return;
  const k = b.dataset.fr, rid = Number(b.dataset.rid);
  if (k === "search") frSearch($("frSearch").value);
  if (k === "share" && prof.row && prof.row.friend_code) { navigator.share({ title: "Empire of Coins", text: frInvite(prof.row.friend_code) }).catch(() => {}); }
  if (k === "duel") {   // ⚔️ to the Online casino lobby with this friend picked
    if (inModal) hideModal();
    if (typeof DU === "object") DU.pick = b.dataset.id;
    state.casinoPage = "online"; showView("casino"); if (typeof duApplyPage === "function") duApplyPage();
    setTimeout(() => { const el = document.querySelector(".frRow.pick"); if (el) el.scrollIntoView({ behavior: "smooth", block: "center" }); }, 150);
  }
  if (k === "add") { if (inModal) hideModal(); frAdd(b.dataset.id); }
  if (k === "accept") frAccept(rid);
  if (k === "decline") frDelete(rid, "Request declined.");
  if (k === "cancel") frDelete(rid, "Request cancelled.");
  if (k === "remove") {
    const name = b.dataset.name;
    showModal(`<h2>Remove ${escapeHtml(name)}?</h2><p>You will no longer be friends. You can send a new request later.</p>
      <div class="row" style="justify-content:center;gap:10px"><button class="btn ghost" data-modal="close">Cancel</button><button class="btn dangerBtn" data-fr="removeYes" data-rid="${rid}">Remove</button></div>`);
  }
  if (k === "removeYes") { hideModal(); frDelete(rid, "Friend removed."); }
});
document.addEventListener("keydown", (e) => { if (e.key === "Enter" && e.target.id === "frSearch") frSearch(e.target.value); });

/* ----- ⏱️ staying "online" and checking for new requests ----- */
setInterval(() => {   // 🟢 a small update once a minute while the game is visible: the database stamps last_seen
  if (document.hidden || !frMe() || !prof.row || prof.friendsOn !== true || (typeof tabActive !== "undefined" && !tabActive)) return;
  cloud.sb.from("profiles").update({ pets: profPets() }).eq("user_id", frMe()).then(({ error }) => { if (!error) prof.row.pets = profPets(); }, () => {});
}, FR_PING);
setInterval(() => {   // new requests (the red number on 👤) and friends going on/offline
  if (document.hidden || !frMe() || !prof.row || prof.friendsOn !== true) return;
  frLoad(true);
}, FR_POLL);
setInterval(() => { if (state.view === "profile" && prof.tab === "friends" && !document.hidden) profUi(); }, 30e3);   // refresh "x min ago"
// once the profile is loaded: get the friend list for the red number
const frProfLoadOrig = profLoad;
profLoad = async function () { await frProfLoadOrig(); if (prof.row && prof.friendsOn) frLoad(true); };
