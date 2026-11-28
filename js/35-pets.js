/* Empire of Coins © 2026 milkhunt3r. All rights reserved. */
/* =====================================================================
   🐾 PETS PAGE (top tab). Room for more pets later.
   - Top: your pet collection (owned pets in colour, unknown ones as "?"), and a reminder that pets stay through prestiges.
   - One card per pet: portrait, name (✏️ to rename), a live status line with "Go see", stats,
     an Active / Resting switch (resting = hidden and not working), its own settings, and "How it works" folded away.
   - The page is built once; every second only the live parts (status, numbers) are updated, so taps on the
     switches are never lost and the pictures don't reload.
   ===================================================================== */
const PET_SLOTS = 4;   // pets in the game (owned + still to find), for the "2 / 4" count
let petPageSig = "", petEditing = "";

const petHas = () => typeof petOwned === "function" && petOwned();
const pipHas = () => typeof pipOwned === "function" && pipOwned();
const petOn = () => petHas() && !state.pet.hidden;
const pipOn = () => pipHas() && !state.pip.off;

// 🔴 live parts (keyed by data-pv)
function petLive() {
  const v = {};
  if (petHas()) {
    const P = state.pet;
    const es = LANG === "es";
    v.mStatus = !petOn() ? (es ? "💤 <b>Descansando.</b> Apagado: no está en la página de 💰 Ingresos y no compra bebidas ni toca la moneda." : "💤 <b>Resting.</b> Turned off: he isn't on the 💰 Income page and doesn't buy drinks or tap.")
      : energyActive() ? (es ? `👆 <b>Bebida energética activa</b> · quedan ${state.energyLeft} s. Toca la moneda mientras estás en la página de 💰 Ingresos.` : `👆 <b>Energy drink active</b> · ${state.energyLeft} s left. He taps the coin while you're on the 💰 Income page.`)
      : state.energyCooldown > PET_WAKE_BEFORE ? (es ? `😴 <b>Durmiendo.</b> Se despierta en <b>${clockMs((state.energyCooldown - PET_WAKE_BEFORE) * 1000)}</b>, justo antes de la próxima bebida.` : `😴 <b>Sleeping.</b> Wakes up in <b>${clockMs((state.energyCooldown - PET_WAKE_BEFORE) * 1000)}</b>, just before the next drink.`)
      : state.money >= ENERGY_PRICE ? (es ? "⚡ <b>Despierto.</b> Comprará la próxima bebida energética en cuanto abras la página de 💰 Ingresos." : "⚡ <b>Awake.</b> He'll buy the next energy drink as soon as you open the 💰 Income page.")
      : (es ? `⚡ <b>Despierto.</b> Esperando a que tengas ${fmt(ENERGY_PRICE)} para la próxima bebida energética.` : `⚡ <b>Awake.</b> Waiting until you have ${fmt(ENERGY_PRICE)} for the next energy drink.`);
    v.mStats = `<span>💰 Earned: <b>${fmt(P.earned || 0)}</b></span><span>👆 Coin taps: <b>${(P.taps || 0).toLocaleString()}</b></span><span>⚡ Energy drinks: <b>${(P.drinks || 0).toLocaleString()}</b></span><span>❤️ Petted: <b>${(P.pets || 0).toLocaleString()}</b></span>`;
  }
  if (pipHas()) {
    const Q = state.pip, now = Date.now(), ph = pipPhase(now);
    const es = LANG === "es";
    v.pStatus = !pipOn() ? (es ? "💤 <b>Descansando.</b> Apagado: no está en la página de 🎮 Minijuegos y su reloj de pintura está en pausa." : "💤 <b>Resting.</b> Turned off: he isn't on the 🎮 Mini-games page and his painting clock is paused.")
      : ph.painting ? (es ? `🎨 <b>Pintando el cuadro n.º ${(Q.painted + 1).toLocaleString()}</b> · listo en <b>${clockMs(ph.next - now)}</b>` : `🎨 <b>Painting #${(Q.painted + 1).toLocaleString()}</b> · done in <b>${clockMs(ph.next - now)}</b>`)
      : (es ? `😴 <b>Dormido.</b> El próximo cuadro empieza en <b>${clockMs(ph.next - PIP_PAINT - now)}</b>` : `😴 <b>Asleep.</b> Next painting starts in <b>${clockMs(ph.next - PIP_PAINT - now)}</b>`);
    v.pStats = `<span>💰 Earned: <b>${fmt(Q.earned || 0)}</b></span><span>🖼️ Paintings: <b>${(Q.painted || 0).toLocaleString()}</b></span><span>📥 Kept: <b>${(Q.kept || 0).toLocaleString()}</b></span><span>💵 Sold: <b>${(Q.sold || 0).toLocaleString()}</b></span><span>❤️ Petted: <b>${(Q.pets || 0).toLocaleString()}</b></span><span>😤 Disturbed: <b>${(Q.pokes || 0).toLocaleString()}</b></span>`;
  }
  return v;
}

function petNameHtml(k, name) {
  if (petEditing === k) return `<input class="petNameInput" id="${k === "pet" ? "petName" : "pipName"}" maxlength="16" value="${escapeHtml(name)}" aria-label="Name" data-noi18n>`;
  return `<span data-noi18n>${escapeHtml(name)}</span><button class="petEdit" data-petedit="${k}" title="Rename" aria-label="Rename">✏️</button>`;
}
function petSwitchRow(attr, on, onText, offText) {
  return `<div class="orRow petOnRow"><span class="grow"><b>${on ? "🟢 Active" : "💤 Resting"}</b><small>${on ? onText : offText}</small></span>
    <span class="orSwitch ${on ? "on" : ""}" ${attr} role="switch" tabindex="0" aria-checked="${on}"></span></div>`;
}

function renderPetPage() {
  const box = $("petPage"); if (!box) return;
  const has = petHas(), pip = pipHas(), P = state.pet || {}, Q = state.pip || {}, v = petLive();
  const owned = (has ? 1 : 0) + (pip ? 1 : 0);
  // 🐾 collection row
  const slot = (k, img, name, hint) => k ? `<button class="petPick" data-petgo="${k}"><img src="${img}" alt=""><span data-noi18n>${escapeHtml(name)}</span></button>`
    : `<div class="petPick unknown" title="${hint}"><span class="petQ">?</span><span>${hint}</span></div>`;
  const top = `<div class="card petTop"><div class="petTopHead"><h2 style="margin:0"><span>🐾 Your pets</span> <span class="muted" data-noi18n>${owned} / ${PET_SLOTS}</span></h2>
      <span class="muted">🔁 Pets stay with you through prestige resets.</span></div>
    <div class="petPicks">
      ${slot(has && "pet", "assets/pet/pet-portrait.webp", petCleanName(P.name) || "Mochi", "🏴‍☠️ Pirate loot boxes")}
      ${slot(pip && "pip", "assets/pip/pip-portrait.webp", pipHas() ? pipName() : "", "🎨 An art-loving alien race")}
      ${Array.from({ length: PET_SLOTS - 2 }, () => slot(null, "", "", "Coming in a future update")).join("")}
    </div>
    ${owned < 2 ? `<div class="muted petFind">${!has ? "🏴‍☠️ <b>Where to find a pet:</b> open pirate loot boxes in 🎮 Mini-games → 🚀 Nebula Strike (levels 4 and 5, or the pirate chest in the hangar). Every box has a small chance to hold one." : ""}
      ${!pip ? " 🎨 Rumour has it an art-loving alien race has a painter who'd love a new home." : ""}</div>` : ""}</div>`;
  const mine = has ? `<div class="card petCard" id="petCard-pet">
      <div class="petHero"><img class="petHeroPic" src="assets/pet/pet-portrait.webp" alt="">
        <div class="petHeroInfo"><h2 class="petNameH">${petNameHtml("pet", petCleanName(P.name) || "Mochi")}</h2>
          <div class="muted">Your baby dragon-moth${P.at ? ` · together since ${new Date(P.at).toLocaleDateString()}` : ""}</div>
          <div class="petStatus"><span data-pv="mStatus" data-noi18n>${v.mStatus}</span><button class="btn small" data-petvisit="pet">Go see him →</button></div>
          <div class="petStats" data-pv="mStats">${v.mStats}</div></div></div>
      ${petSwitchRow('data-pet="show"', petOn(), "Lives on the 💰 Income page and runs your ⚡ energy drink.", "Hidden. He doesn't buy energy drinks or tap the coin.")}
      <details class="petHow"><summary>ℹ️ How it works</summary>
      <ul class="petDoes">
        <li>⚡ Buys the energy drink by itself when it's ready and you can afford it.</li>
        <li>👆 While the drink is active, it taps the coin for you: 10 clicks per second, worth the same as yours (they count for 🏆 achievements too).</li>
        <li>😴 While the drink cools down it walks off and sleeps, and wakes up 10 seconds before the next drink.</li>
        <li>❤️ Click it to pet it. Pet it 5 times in a row and it jumps for joy!</li>
        <li>💰 "Earned" counts his coin taps from this update on.</li>
      </ul></details></div>` : "";
  const pipCard = pip ? `<div class="card petCard" id="petCard-pip">
      <div class="petHero"><img class="petHeroPic" src="assets/pip/pip-portrait.webp" alt="">
        <div class="petHeroInfo"><h2 class="petNameH">${petNameHtml("pip", pipName())}</h2>
          <div class="muted">Your Lumerian painter${Q.at ? ` · together since ${new Date(Q.at).toLocaleDateString()}` : ""}</div>
          <div class="petStatus"><span data-pv="pStatus" data-noi18n>${v.pStatus}</span><button class="btn small" data-petvisit="pip">Go see him →</button></div>
          <div class="petStats" data-pv="pStats">${v.pStats}</div></div></div>
      ${petSwitchRow('data-pip="toggle"', pipOn(), "Lives on the 🎮 Mini-games page and paints every 15 minutes.", "Hidden, and his painting clock is paused until you turn him back on.")}
      <div class="orRow petOnRow"><span class="grow"><b>Always sell his paintings</b><small>${Q.sellAll ? "Every painting is sold right away for money." : "Paintings go to your 🖼️ collection; he only sells when it's full."}</small></span>
        <span class="orSwitch ${Q.sellAll ? "on" : ""}" data-pip="sell" role="switch" tabindex="0" aria-checked="${!!Q.sellAll}"></span></div>
      <details class="petHow"><summary>ℹ️ How it works</summary>
      <ul class="petDoes">
        <li>🎮 Lives at the top of the Mini-games page, next to his easel.</li>
        <li>🎨 Every 15 minutes he paints a 🟡 Normal painting: 14 minutes asleep, then 1 minute of painting. His copies are 85–95% matches.</li>
        <li>🖼️ The painting goes to your collection. If it's full (or "Always sell" is on), he sells it right away. Both count for 🏆 achievements.</li>
        <li>🌙 He keeps painting while the game is closed (up to 24 hours).</li>
        <li>❤️ Click him while he sleeps to pet him. Don't poke him while he's painting: he gets a bit grumpy!</li>
      </ul></details></div>` : "";
  // keep the folded / unfolded "How it works" as it was
  const open = [...box.querySelectorAll("details.petHow")].map(d => d.open);
  box.innerHTML = top + mine + pipCard;
  box.querySelectorAll("details.petHow").forEach((d, i) => { if (open[i]) d.open = true; });
  petPageSig = petSig();
  const inp = box.querySelector(".petNameInput"); if (inp) { inp.focus(); inp.select(); }
}
// what decides the page's layout (anything else is a live part)
const petSig = () => [petHas(), pipHas(), petOn(), pipOn(), !!(state.pip && state.pip.sellAll), state.pet && state.pet.name, state.pip && state.pip.name, petEditing, LANG].join("|");

// every second: update the live parts only (or rebuild if the layout changed)
setInterval(() => {
  if (state.view !== "pet" || $("petView").hidden) return;
  if (petEditing) return;   // typing a name: leave the page alone
  if (petSig() !== petPageSig) return renderPetPage();
  const v = petLive();
  document.querySelectorAll("#petPage [data-pv]").forEach(el => { const h = v[el.dataset.pv]; if (h != null && el.dataset.h !== h) { el.dataset.h = h; el.innerHTML = h; } });
}, 1000);

$("petPage").addEventListener("click", (e) => {
  const ed = e.target.closest("[data-petedit]");
  if (ed) { petEditing = ed.dataset.petedit; renderPetPage(); return; }
  const go = e.target.closest("[data-petgo]");
  if (go) { const c = $("petCard-" + go.dataset.petgo); if (c) c.scrollIntoView({ behavior: "smooth", block: "start" }); return; }
  const vis = e.target.closest("[data-petvisit]");
  if (vis) { if (vis.dataset.petvisit === "pet") showView("income"); else openGame(null); }
});
// ✏️ rename: Enter or leaving the field saves (the change handlers in js/33-pet.js and js/36-pip.js store the name)
$("petPage").addEventListener("keydown", (e) => { if (e.target.classList.contains("petNameInput") && (e.key === "Enter" || e.key === "Escape")) e.target.blur(); });
$("petPage").addEventListener("focusout", (e) => {
  if (!e.target.classList.contains("petNameInput")) return;
  setTimeout(() => { petEditing = ""; renderPetPage(); }, 0);
});
