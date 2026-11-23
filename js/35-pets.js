/* =====================================================================
   🐾 PET PAGE (top tab, where the Shop used to be). Room for more pets later.
   - Your pet: picture, name, show on the Income page, what it does, and its stats.
   - No pet yet: where to find one (🏴‍☠️ pirate loot box in 🚀 Nebula Strike).
   ===================================================================== */
function renderPetPage() {
  const box = $("petPage"); if (!box) return;
  const has = typeof petOwned === "function" && petOwned(), P = state.pet || {};
  const since = has && P.at ? new Date(P.at).toLocaleDateString() : "";
  const mine = has ? `<div class="card petCard">
      <div class="petHero"><img class="petHeroPic" src="assets/pet/pet-portrait.webp" alt="">
        <div class="petHeroInfo"><h2 style="margin:0">🐾 ${petCleanName(P.name) || "Mochi"}</h2>
          <div class="muted">Your baby dragon-moth${since ? ` · together since ${since}` : ""}</div>
          <div class="petStats"><span>❤️ Petted: <b>${(P.pets || 0).toLocaleString()}</b></span><span>👆 Coin taps: <b>${(P.taps || 0).toLocaleString()}</b></span></div></div></div>
      <div class="orRow petSetRow"><span class="grow">Show on the 💰 Income page</span>
        <span class="orSwitch ${P.hidden ? "" : "on"}" data-pet="show" role="switch" tabindex="0"></span></div>
      <div class="orRow slider"><span class="grow">Name</span><input class="petNameInput" id="petName" maxlength="16" value="${petCleanName(P.name)}" aria-label="Pet name" data-noi18n></div>
      <h3>What it does</h3>
      <ul class="petDoes">
        <li>⚡ Buys the energy drink by itself when it's ready and you can afford it.</li>
        <li>👆 While the drink is active, it taps the coin for you: 10 clicks per second, worth the same as yours (they count for 🏆 achievements too).</li>
        <li>😴 While the drink cools down it walks off and sleeps, and wakes up 10 seconds before the next drink.</li>
        <li>❤️ Click it to pet it. Pet it 5 times in a row and it jumps for joy!</li>
      </ul></div>`
    : `<div class="card petCard empty"><h2 style="margin:0">🐾 No pet yet</h2>
      <p>Pets live on your 💰 Income page, keep you company and help you out.</p>
      <p>🏴‍☠️ <b>How to find one:</b> open pirate loot boxes in 🎮 Mini-games → 🚀 Nebula Strike (levels 4 and 5, or the pirate chest in the hangar). Every box has a small chance to hold a pet.</p></div>`;
  box.innerHTML = mine + `<div class="card petSoon"><h3 style="margin:0 0 6px">🔜 More pets are coming</h3>
    <div class="petSlots">${Array.from({ length: 3 }, () => `<div class="petSlot">❔</div>`).join("")}</div>
    <div class="muted">New friends will join in future updates.</div></div>`;
}
// keep the numbers fresh while the page is open
setInterval(() => { if (state.view === "pet" && !$("petView").hidden && !(document.activeElement && document.activeElement.id === "petName")) renderPetPage(); }, 2000);
