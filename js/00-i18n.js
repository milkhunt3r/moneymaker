/* =====================================================================
   🌐 LANGUAGES: English (the game's own text) and Español (Spain).
   The game is written in English. In Spanish, everything shown on screen is translated as it appears:
     - a whole sentence with inline bold/spans ("Each click is worth <b>×5</b> …") is translated as one piece
       (ES_HTML / ES_HTML_RX in js/i18n-es.js), so the Spanish can use its own word order;
     - otherwise each piece of text is translated (ES / ES_RX), keeping any emoji in front of it;
     - titles, placeholders and aria-labels too.
   Numbers use the Spanish format (1.234,5) in Spanish.
   The choice is kept in localStorage ("eoc-lang"), apart from the save, so a reset keeps it.
   ===================================================================== */
const LANG = (() => { try { return localStorage.getItem("eoc-lang") === "es" ? "es" : "en"; } catch (e) { return "en"; } })();
document.documentElement.lang = LANG;
function setLanguage(l) {
  try { localStorage.setItem("eoc-lang", l); } catch (e) {}
  try { if (typeof flushSave === "function") flushSave(); } catch (e) {}
  location.reload();
}
// Spanish number format everywhere a number is formatted without a locale
if (LANG === "es") {
  const orig = Number.prototype.toLocaleString;
  Number.prototype.toLocaleString = function (loc, opt) { return orig.call(this, loc === undefined ? "es-ES" : loc, opt); };
}
const ES = {}, ES_RX = [], ES_HTML = {}, ES_HTML_RX = [];   // filled by js/i18n-es.js
let I18N_READY = false;   // set by js/i18n-es.js once the translations are loaded
const I18N_MISS = new Map();   // (testing) English text that has no translation yet
const I18N_DONE = new Set();   // Spanish text the game already shows (not re-checked, not counted as missing)

const I18N_SKIP = new Set(["SCRIPT", "STYLE", "TEXTAREA", "INPUT", "CANVAS", "SVG", "svg", "NOSCRIPT"]);
const I18N_INLINE = new Set(["B", "STRONG", "I", "EM", "SPAN", "SMALL", "A", "BR", "CODE", "IMG", "SUP", "SUB", "U", "S", "MARK", "KBD"]);
const LETTER = /\p{L}/u;
// emoji / symbols around the text stay as they are
const EDGE = /^([\s\p{Extended_Pictographic}️‍←-⇿■-◿☀-➿⬀-⯿·•–—→←↺✓✔✕✖]*)([\s\S]*?)([\s\p{Extended_Pictographic}️‍:·•]*)$/u;
const squash = (s) => s.replace(/\s+/g, " ").trim();

function trCore(s) {
  if (Object.prototype.hasOwnProperty.call(ES, s)) return ES[s];
  for (const [rx, to] of ES_RX) { const m = s.match(rx); if (m) return typeof to === "function" ? to(...m) : s.replace(rx, to); }
  return null;
}
// translate a plain string (keeps emoji and spaces around it); returns null if unknown
// decimals the game writes with a point ("+2.0", "×1.5") get the Spanish comma; thousands ("10.000") are left alone
const decFix = (s) => s.replace(/(\d)\.(\d{1,2})(?!\d)/g, "$1,$2");
function trText(raw) {
  const m = raw.match(EDGE); if (!m) return null;
  const core = squash(m[2]);
  if (!core) return null;
  if (!LETTER.test(core.replace(/\b[sgb]coin\b|\d(?:sc|k|s|h|m|min)\b|\bXP\b/g, ""))) { const d = decFix(raw); return d !== raw ? d : null; }   // only numbers
  if (I18N_DONE.has(core)) return null;
  let out = trCore(core);
  if (out === null && m[3] && /:\s*$/.test(m[3])) { const c2 = trCore(core + ":"); if (c2 !== null) return m[1] + c2 + m[3].replace(/^\s*:/, ""); }
  if (out === null) { I18N_MISS.set(core, (I18N_MISS.get(core) || 0) + 1); return null; }
  out = decFix(out);
  I18N_DONE.add(squash(out));
  return m[1] + out + m[3];
}
// t("English") in code: the Spanish if there is one, else the English
const t = (s) => (LANG === "es" ? (trText(s) ?? s) : s);

// a sentence with inline markup → its key: tags without attributes, icons as {i}, spaces squashed
function blockKey(el) {
  let k = "";
  for (const n of el.childNodes) {
    if (n.nodeType === 3) k += n.nodeValue;
    else if (n.nodeType === 1) {
      if (n.tagName === "IMG") k += "{i}";
      else if (n.tagName === "BR") k += "<br>";
      else { const tg = n.tagName.toLowerCase(); k += `<${tg}>${blockKey(n)}</${tg}>`; }
    }
  }
  return k;
}
function isBlock(el) {
  if (!el.childNodes.length || el.querySelector("[id], input, select, textarea, button, canvas")) return false;
  let text = false, tag = false;
  for (const n of el.childNodes) {
    if (n.nodeType === 3) { if (LETTER.test(n.nodeValue)) text = true; }
    else if (n.nodeType === 1) { if (!I18N_INLINE.has(n.tagName) || !isInlineDeep(n)) return false; if (n.tagName !== "BR" && n.tagName !== "IMG") tag = true; }
  }
  return text && tag;
}
const isInlineDeep = (el) => [...el.children].every(c => I18N_INLINE.has(c.tagName) && isInlineDeep(c));
// put the Spanish template in, giving each tag back its original attributes (in order, per tag name) and each {i} its icon
function applyBlock(el, tpl) {
  const imgs = [...el.querySelectorAll("img")].map(i => i.cloneNode(true));
  const byTag = {};
  el.querySelectorAll("*").forEach(n => (byTag[n.tagName] = byTag[n.tagName] || []).push(n));
  const box = document.createElement("div");
  box.innerHTML = tpl.replace(/\{i\}/g, '<img data-i18n-i="1">');
  const used = {};
  box.querySelectorAll("*").forEach(n => {
    if (n.dataset && n.dataset.i18nI) { const im = imgs.shift(); if (im) n.replaceWith(im); else n.remove(); return; }
    const src = (byTag[n.tagName] || [])[used[n.tagName] = (used[n.tagName] || 0)];
    used[n.tagName]++;
    if (src) for (const a of src.attributes) n.setAttribute(a.name, a.value);
  });
  if (el.innerHTML !== box.innerHTML) el.innerHTML = box.innerHTML;   // (no change → no new mutation, no loop)
}
function trBlock(el) {
  const key = squash(blockKey(el));
  if (I18N_DONE.has("HTML: " + key)) return true;
  if (Object.prototype.hasOwnProperty.call(ES_HTML, key)) { applyBlock(el, ES_HTML[key]); return doneBlock(el); }
  for (const [rx, to] of ES_HTML_RX) { const m = key.match(rx); if (m) { applyBlock(el, typeof to === "function" ? to(...m) : key.replace(rx, to)); return doneBlock(el); } }
  I18N_MISS.set("HTML: " + key, (I18N_MISS.get("HTML: " + key) || 0) + 1);
  return false;
}
function doneBlock(el) { I18N_DONE.add("HTML: " + squash(blockKey(el))); return true; }
function _unused() {
}
const ATTRS = ["title", "placeholder", "aria-label"];
let i18nBusy = false;
function i18nApply(root) {
  if (LANG !== "es" || !root || !I18N_READY) return;
  i18nBusy = true;
  try {
    if (root.nodeType === 3) { const v = trText(root.nodeValue); if (v !== null && v !== root.nodeValue) root.nodeValue = v; return; }
    if (root.nodeType !== 1 || I18N_SKIP.has(root.tagName) || root.closest("[data-noi18n]")) return;
    walk(root);
  } finally { i18nBusy = false; }
}
function walk(el) {
  if (I18N_SKIP.has(el.tagName) || (el.dataset && "noi18n" in el.dataset)) return;
  for (const a of ATTRS) { const v = el.getAttribute(a); if (v && LETTER.test(v)) { const tv = trText(v); if (tv !== null && tv !== v) el.setAttribute(a, tv); } }
  if (isBlock(el) && trBlock(el)) return;
  for (const n of [...el.childNodes]) {
    if (n.nodeType === 3) { const v = trText(n.nodeValue); if (v !== null && v !== n.nodeValue) n.nodeValue = v; }
    else if (n.nodeType === 1) walk(n);
  }
}
if (LANG === "es") {
  // everything the game draws later is translated as it appears (before the screen is painted)
  new MutationObserver((list) => {
    if (i18nBusy) return;
    const targets = new Set();
    for (const m of list) {
      if (m.type === "characterData") targets.add(m.target.parentElement);
      else if (m.type === "attributes") targets.add(m.target);
      else targets.add(m.target);
    }
    for (const el of targets) {
      if (!el || !el.isConnected) continue;
      let skip = false;
      for (let p = el.parentElement; p; p = p.parentElement) if (targets.has(p)) { skip = true; break; }
      if (!skip) i18nApply(el);
    }
  }).observe(document.documentElement, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ATTRS });
  document.addEventListener("DOMContentLoaded", () => { i18nApply(document.body); });
}

// 🌐 the language switch: in ⚙️ Settings and on the main menu
document.addEventListener("click", (e) => {
  const b = e.target.closest("[data-lang]");
  if (!b) return;
  e.stopPropagation();
  if (b.dataset.lang !== LANG) setLanguage(b.dataset.lang);
}, true);
