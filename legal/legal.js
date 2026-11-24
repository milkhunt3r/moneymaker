/* Empire of Coins © 2026 milkhunt3r. All rights reserved. */
// 🌐 English / Español switch for the Terms of Use and Privacy Policy pages.
// Language: ?lang=es|en from the game link, otherwise the game's own setting (localStorage "eoc-lang"), otherwise English.
(function () {
  let lang = new URLSearchParams(location.search).get("lang");
  if (lang !== "es" && lang !== "en") { try { lang = localStorage.getItem("eoc-lang"); } catch (e) {} }
  if (lang !== "es") lang = "en";
  function show(l) {
    document.querySelectorAll("article[lang]").forEach(a => { a.hidden = a.lang !== l; });
    document.querySelectorAll(".lang button").forEach(b => b.classList.toggle("on", b.dataset.l === l));
    document.documentElement.lang = l;
    const t = document.querySelector(`article[lang="${l}"] h1`); if (t) document.title = t.textContent + " · Empire of Coins";
  }
  document.querySelectorAll(".lang button").forEach(b => b.addEventListener("click", () => show(b.dataset.l)));
  show(lang);
})();
