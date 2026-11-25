/* Empire of Coins © 2026 milkhunt3r. All rights reserved. */
/* =====================================================================
   👤 PLAYER PROFILE: nickname, avatar (the emblem of one of your 🎁 reward collections), achievements and prestige count.
   · Opened with the round 👤 button next to ⚙️ Settings.
   · Needs a Google sign-in (☁️ js/29-cloud.js): the profile is stored in Supabase table public.profiles
     (see docs/supabase-profiles.sql). Every signed-in player can see every profile; only you can change yours.
   · Nicknames: 3–16 letters, numbers, spaces, _ . -; unique (ignoring case); rude or reserved names are refused
     here AND by the database (same word lists).
   · Achievements and prestige count are uploaded by themselves when they change.
   · The ☁️ Account rows (sign in / save now / sign out / delete account) live here too, not in ⚙️ Settings.
   ===================================================================== */
const PROF_CACHE = "eoc-profile";
const PROF_RENAME_COST = 100 * GCOIN;   // the first nickname is free; every change after that costs 100 gcoin
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
// avatars: the emblems of the 🎁 reward collections you have unlocked (assets/col/<id>.webp)
const profColOpen = (col) => COSMETICS.some(c => c.collection === col.id && state.cosmetics.owned[c.id]) || (() => { const p = rewardProgress(col); return p.total > 0 && p.done >= p.total; })();
// 🐾 starter avatars every player can pick (assets/avatars/<name>.webp), shown before the collection emblems
const PROF_STARTERS = { "s-dragonmoth": "Baby dragon-moth", "s-pipmouse": "Painter mouse", "s-luckycat": "Lucky cat", "s-penguin": "Penguin banker", "s-turtle": "Coin turtle", "s-bunny": "Bunny gambler" };
const profAvatarIds = () => Object.keys(PROF_STARTERS).concat(COLLECTIONS.filter(c => c.reward && COL_EMBLEMS.has(c.id) && !(c.hidden && c.hidden()) && profColOpen(c)).map(c => c.id));
const profAvName = (id) => { if (PROF_STARTERS[id]) return PROF_STARTERS[id]; const c = COLLECTIONS.find(x => x.id === id); return c ? c.name.replace(/^\S+\s/, "") : ""; };
const profAvatarImg = (id, cls = "") => PROF_STARTERS[id] ? `<img class="${cls}" src="assets/avatars/${id.slice(2)}.webp" alt="">` : id && COL_EMBLEMS.has(id) ? `<img class="${cls}" src="assets/col/${id}.webp" alt="">` : `<span class="${cls} profNoAv">👤</span>`;
// 🐾 pets other players see on your profile
const PROF_PETS = { mochi: { pic: "assets/pet/pet-portrait.webp", name: "Baby dragon-moth" }, pip: { pic: "assets/pip/pip-portrait.webp", name: "Pip the painter" } };
const profPets = () => [state.pet && state.pet.owned && !state.pet.pending ? "mochi" : null, state.pip && state.pip.owned ? "pip" : null].filter(Boolean);
// 🪙 the coin skin you use (assets/<id>-coin.webp; "" = the normal coin) and its picture
const profCoin = () => { const c = COSMETICS.find(x => x.slot === "coin" && state.cosmetics.on[x.id]); return c ? c.id.replace(/Coin$/, "") : ""; };
const profCoinImg = (id, cls = "profCoinI") => `<img class="${cls}" src="assets/${/^[a-z0-9]{1,20}$/.test(id || "") && COSMETICS.some(x => x.id === id + "Coin") ? id + "-coin" : "coin"}.webp" alt="">`;
const profPetsHtml = (pets) => pets.length ? `<div class="profPets">${pets.filter(k => PROF_PETS[k]).map(k => `<img src="${PROF_PETS[k].pic}" alt="" title="${PROF_PETS[k].name}">`).join("")}</div>` : "";
const profSignedIn = () => typeof cloud === "object" && !!cloud.user && !!cloud.sb;

async function profLoad() {
  if (!profSignedIn() || prof.loading) return;
  prof.loading = true; prof.err = "";
  try {
    // "*": the columns added by later SQL files (friends, money) may not exist yet; see what came back
    const { data, error } = await cloud.sb.from("profiles").select("*").eq("user_id", cloud.user.id).maybeSingle();
    if (error) throw error;
    if (data) { prof.friendsOn = "friend_code" in data; prof.moneyOn = "money" in data; }
    prof.row = data; prof.user = cloud.user.id; prof.fetched = cloud.user.id; profCache();
  } catch (e) { console.warn("Profile load failed:", e); prof.err = e && (e.code === "42P01" || e.code === "PGRST205") ? profDbError(e) : "load"; }
  prof.loading = false;
  profUi(); profPushStats();
}
function profDbError(e) {
  const c = e && e.code;
  if (c === "23505") return "That nickname is already taken. Try another one.";
  if (e && /nickname_cooldown/.test(e.message || "")) return "You can change your nickname only once a day. Please try again tomorrow.";
  if (c === "23514") return "That nickname isn't allowed. Please choose a friendly one.";
  if (c === "42P01" || c === "PGRST205") return "Profiles aren't switched on yet. Please try again later.";
  return "Something went wrong. Please try again.";
}
async function profSaveNick(raw) {
  const n = profTidy(raw), bad = profNickError(n);
  prof.msg = "";
  if (bad) { prof.err = bad; return renderProfile(); }
  if (!profSignedIn() || prof.busy) return;
  if (prof.row && prof.row.nickname === n) { prof.err = ""; prof.editing = false; return renderProfile(); }
  const paid = !!prof.row;
  if (paid && state.money < PROF_RENAME_COST) { prof.err = `You need ${fmt(PROF_RENAME_COST)} to change your nickname.`; return renderProfile(); }
  prof.busy = true; prof.err = ""; renderProfile();
  try {
    const st = profStats(), avatar = (prof.row && prof.row.avatar) || prof.pendingAvatar || "";
    const q = prof.row
      ? cloud.sb.from("profiles").update({ nickname: n }).eq("user_id", cloud.user.id)
      : cloud.sb.from("profiles").insert({ user_id: cloud.user.id, nickname: n, avatar, ...st });
    const { error } = await q;
    if (error) throw error;
    prof.row = { ...(prof.row || { avatar, ...st }), nickname: n }; prof.user = cloud.user.id; profCache();
    if (paid) { state.money -= PROF_RENAME_COST; updateCounter(); save(); }
    prof.editing = false;
    prof.msg = paid ? `✅ Nickname changed (−${fmt(PROF_RENAME_COST)}).` : "✅ Nickname saved.";
    if (!paid) setTimeout(profLoad, 300);   // fetch the friend code the database gave the new profile
  } catch (e) { console.warn("Nickname save failed:", e); prof.err = profDbError(e); }
  prof.busy = false; profUi();
}
async function profSetAvatar(id) {
  if (!profAvatarIds().includes(id)) return;
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
  st.prestige = Math.min(st.prestige, (prof.row.prestige || 0) + 1);   // the database accepts one prestige step per upload
  if (prof.friendsOn) st.pets = profPets();
  if (prof.moneyOn) { st.coin = profCoin(); st.money = Math.max(0, Math.floor(state.money)); }
  const moneySame = !prof.moneyOn || (st.coin === prof.row.coin && Math.abs(st.money - (prof.row.money || 0)) <= Math.max(1, (prof.row.money || 0) * 0.01));   // money: only when it moved 1%+
  if (st.ach_done === prof.row.ach_done && st.ach_total === prof.row.ach_total && st.prestige === prof.row.prestige && String(st.pets) === String(prof.row.pets) && moneySame) return;
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
    <div class="profCardInfo"><div class="profNick"><span data-noi18n>${nick ? escapeHtml(nick) : "<i>…</i>"}</span>${row && !prof.editing ? `<button class="profEdit" data-prof="edit" title="Change nickname" aria-label="Change nickname">✏️</button>` : ""}</div>
      <div class="profStats"><span>🏆 <b>${st.ach_done}/${st.ach_total}</b> achievements</span><span>⭐ Prestige <b>${st.prestige}</b></span></div>
      <div class="profMoney">${profCoinImg(profCoin())}<b id="profMoney">${fmt(state.money)}</b></div>
      ${profPetsHtml(profPets())}
      ${row && row.friend_code ? `<div class="profCode">Friend code: <b data-noi18n>${escapeHtml(row.friend_code)}</b> <button class="btn ghost small" data-prof="copy">📋 Copy</button></div>` : ""}</div></div>`;
}
function renderProfile() {
  const box = $("profileView"); if (!box || box.hidden) return;
  if (!profSignedIn()) {
    box.innerHTML = `<div class="card profWrap"><h2 style="margin-top:0">👤 Your profile</h2>
      <p>Sign in with Google to create your player profile. Other players will see your <b>nickname</b>, your <b>avatar</b>, your <b>achievements</b> and your <b>prestige count</b>.</p>
      <button class="btn big" data-prof="signin"><span class="gIcon">G</span>Sign in with Google</button>
      ${typeof cloud === "object" && !cloud.sb ? `<p class="muted">${cloud.status === "loading" ? "Connecting…" : "Sign-in isn't available right now."}</p>` : ""}
      <p class="muted">Signing in also keeps a ☁️ cloud copy of your progress, so you can play on other devices.</p>
      <div class="guestWarn">⚠️ Playing as a guest: ${GUEST_WARN}</div></div>`;
    return;
  }
  if (prof.user !== cloud.user.id && !prof.loading) { prof.row = null; profLoad(); }
  else if (prof.fetched !== cloud.user.id && !prof.loading && !prof.err) profLoad();
  const row = prof.user === cloud.user.id ? prof.row : null;
  const inc = typeof frIncoming === "function" ? frIncoming() : 0;
  // 👈 Profile / Friends on the left, like the other pages (.subLayout)
  const tabs = `<div class="subLayout"><nav class="subNav"><button class="subTab ${prof.tab !== "friends" ? "active" : ""}" data-prof="tab-me">👤 Profile</button>
    <button class="subTab ${prof.tab === "friends" ? "active" : ""}" data-prof="tab-friends">👥 Friends${inc ? ` <span class="profBadge">${inc}</span>` : ""}</button></nav><div class="subMain">`;
  if (prof.tab === "friends" && typeof renderFriends === "function") { box.innerHTML = tabs + `<div id="friendsBox"></div></div></div>`; renderFriends(row); return; }
  const ids = profAvatarIds(), cur = row ? row.avatar : prof.pendingAvatar;
  const shown = prof.showAll ? ids : ids.slice(0, 60);
  const typed = $("profNick") ? $("profNick").value : null;
  const showNick = (!row && !prof.loading) || (row && prof.editing), afford = state.money >= PROF_RENAME_COST;
  const errText = prof.err === "load" ? "Your profile couldn't be loaded. Check your connection and try again." : prof.err;
  box.innerHTML = tabs + `<div class="card profWrap"><div class="row"><h2 style="margin:0">👤 Your profile</h2><span class="muted">Visible to other players</span></div>
      ${profCardHtml(row)}
      ${prof.loading && !row ? `<p class="muted">Loading…</p>` : ""}
      ${!row && !prof.loading ? `<p class="profNew">✨ Choose a nickname and an avatar to create your profile.</p>` : ""}
      ${prof.msg && !showNick ? `<div class="profOk">${prof.msg}</div>` : ""}
      ${prof.err && !showNick ? `<div class="profErr">❌ ${errText}</div>` : ""}</div>
    ${showNick ? `<div class="card profWrap"><h3 style="margin-top:0">✏️ ${row ? "Change nickname" : "Nickname"}</h3>
      <div class="profNickRow"><input id="profNick" maxlength="16" autocomplete="off" spellcheck="false" placeholder="Your nickname" value="${escapeHtml(typed != null ? typed : row ? row.nickname : "")}" data-noi18n aria-label="Nickname">
        ${row ? `<button class="btn" data-prof="nick" ${prof.busy || !afford ? "disabled" : ""}>Change · ${fmt(PROF_RENAME_COST)}</button><button class="btn ghost" data-prof="cancel">Cancel</button>`
          : `<button class="btn" data-prof="nick" ${prof.busy ? "disabled" : ""}>Create profile</button>`}</div>
      <div class="muted">3–16 characters: letters, numbers, spaces and _ . - · Every nickname is unique. Rude names aren't allowed.</div>
      <div class="muted">${row ? `Changing your nickname costs <b>${fmt(PROF_RENAME_COST)}</b>.${afford ? "" : ` You have ${fmt(state.money)}.`}` : "Your first nickname is free. Changing it later costs 100 gcoin."}</div>
      ${prof.err ? `<div class="profErr">❌ ${errText}</div>` : ""}
      ${prof.msg ? `<div class="profOk">${prof.msg}</div>` : ""}</div>` : ""}
    <div class="card profWrap"><h3 style="margin-top:0">🖼️ Avatar</h3>
      <p class="muted">Pick a starter avatar or the emblem of one of your 🎁 reward collections. Unlock more collections (🏆 Achievements → 🎁 Rewards) to get more avatars.</p>
      ${ids.length ? `<div class="profAvGrid">${shown.map(id => {
        return `<button class="profAvPick ${id === cur ? "on" : ""}" data-prof-av="${id}" title="${escapeHtml(profAvName(id))}">${profAvatarImg(id)}</button>`; }).join("")}</div>
        ${ids.length > shown.length ? `<button class="btn ghost small" data-prof="all">Show all ${ids.length}</button>` : ""}`
        : `<p>🔒 Unlock your first 🎁 reward collection (🏆 Achievements → 🎁 Rewards) to choose an avatar.</p>`}</div>
    <div class="card profWrap"><h3 style="margin-top:0">☁️ Account</h3><div id="cloudRows">${cloudRowsHtml()}</div></div></div></div>`;
}
function profUi() {
  const b = $("profileBtn");
  if (b) {
    const av = profSignedIn() && prof.user === cloud.user.id && prof.row ? prof.row.avatar : "";
    const html = av ? profAvatarImg(av, "profBtnAv") : `<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7"/></svg>`;
    const inc = typeof frIncoming === "function" ? frIncoming() : 0, key = (av || "-") + "|" + inc;
    if (b.dataset.av !== key) { b.innerHTML = html + (inc ? `<span class="profBtnDot" aria-label="Friend requests">${inc}</span>` : ""); b.dataset.av = key; }
  }
  const typing = document.activeElement && ["profNick", "frSearch"].includes(document.activeElement.id);   // don't rebuild the page under the player's fingers
  if (state.view === "profile" && !typing) renderProfile();
}

/* ----- 🔘 wiring ----- */
$("settingsWrap").insertAdjacentHTML("afterbegin", `<button id="profileBtn" title="Profile" aria-label="Profile"></button>`);
$("profileBtn").addEventListener("click", () => showView("profile"));
document.addEventListener("click", (e) => {
  const v = $("profileView"); if (!v || !v.contains(e.target)) return;
  const av = e.target.closest("[data-prof-av]"); if (av) return profSetAvatar(av.dataset.profAv);
  const cb = e.target.closest("[data-cloud]");
  if (cb) {
    const k = cb.dataset.cloud;
    if (k === "in") cloudSignIn();
    if (k === "out") cloudSignOut();
    if (k === "del") cloudDeleteAsk();
    if (k === "now") {
      if (cloud.conflict) return cloudSync();
      cloud.dirty = true;
      cloudUpload().then(ok => { if (!cloud.conflict) showNotice(ok ? "☁️ Saved to the cloud." : "❌ Cloud save failed. Your progress is still saved on this device."); });
    }
    return;
  }
  const b = e.target.closest("[data-prof]"); if (!b) return;
  if (b.dataset.prof === "signin" && typeof cloudSignIn === "function") cloudSignIn();
  if (b.dataset.prof === "nick") profSaveNick($("profNick").value);
  if (b.dataset.prof === "all") { prof.showAll = true; renderProfile(); }
  if (b.dataset.prof === "tab-me" || b.dataset.prof === "tab-friends") { prof.tab = b.dataset.prof === "tab-friends" ? "friends" : "me"; prof.err = ""; prof.msg = ""; renderProfile(); if (prof.tab === "friends" && typeof frLoad === "function") frLoad(); }
  if (b.dataset.prof === "copy" && prof.row && prof.row.friend_code) {
    const c = prof.row.friend_code;
    (navigator.clipboard ? navigator.clipboard.writeText(c) : Promise.reject()).then(() => showNotice(`📋 Friend code ${c} copied.`), () => showNotice(`📋 Your friend code: ${c}`));
  }
  if (b.dataset.prof === "edit") { prof.editing = true; prof.err = ""; prof.msg = ""; renderProfile(); const i = $("profNick"); if (i) { i.focus(); i.select(); } }
  if (b.dataset.prof === "cancel") { prof.editing = false; prof.err = ""; prof.msg = ""; renderProfile(); }
});
document.addEventListener("keydown", (e) => { if (e.key === "Enter" && e.target.id === "profNick") profSaveNick(e.target.value); });
document.addEventListener("input", (e) => { if (e.target.id === "profNick" && (prof.err || prof.msg)) { prof.err = ""; prof.msg = ""; const x = document.querySelector(".profErr, .profOk"); if (x) x.remove(); } });
// signing in or out (☁️ js/29-cloud.js calls updateCloudUi on every change)
const profCloudUiOrig = updateCloudUi;
let profAuthSeen;
updateCloudUi = function () {
  profCloudUiOrig();   // also refreshes the ☁️ Account rows (#cloudRows) on the profile page
  const id = profSignedIn() ? cloud.user.id : null, key = (typeof cloud === "object" && cloud.sb ? "sb" : "-") + (id || "");
  if (id && prof.user !== id) { prof.row = null; prof.user = null; profLoad(); }
  else if (id && prof.fetched !== id && !prof.loading) profLoad();   // the saved copy is only for a quick first look: always fetch the real profile once
  if (key !== profAuthSeen) { profAuthSeen = key; profUi(); }
};
profUi();
if (state.view === "profile") renderProfile();
setInterval(() => { const m = $("profMoney"); if (m) { const t = fmt(state.money); if (m.textContent !== t) m.textContent = t; } }, 1000);   // 💰 the money on your profile card stays live
