/* =====================================================================
   ENERGY DRINK: costs 50, clicks are worth x5 for 30 seconds
   ===================================================================== */
const ENERGY_PRICE = 50;
const ENERGY_SECONDS = 30;
const ENERGY_MULTIPLIER = 5;
if (typeof state.energyLeft !== "number") state.energyLeft = 0;
var energyReady = true;

// ----- Magical pill: costs 2,000; each click also gives 10% of your income per second, for 30 s -----
const PILL_PRICE = 2000;
const PILL_SECONDS = 30;
const PILL_SHARE = 0.10;
const PILL_COOLDOWN = 300;      // 5 minutes after the effect ends
const ENERGY_COOLDOWN = 120;    // 2 minutes after the effect ends
if (typeof state.pillCooldown !== "number") state.pillCooldown = 0;
if (typeof state.energyCooldown !== "number") state.energyCooldown = 0;
if (typeof state.pillLeft !== "number") state.pillLeft = 0;
const pillActive = () => state.pillLeft > 0;

// ----- Political influence: costs 250k, all businesses earn double for 120 s, 30 min cooldown -----
const INFLUENCE_PRICE = 250000;
const INFLUENCE_SECONDS = 120;
const INFLUENCE_COOLDOWN = 1800;
if (typeof state.influenceLeft !== "number") state.influenceLeft = 0;
if (typeof state.influenceCooldown !== "number") state.influenceCooldown = 0;
var influenceActive = () => state.influenceLeft > 0;

const energyActive = () => state.energyLeft > 0;
// A click: 1 bcoin, plus 20% of your income per second while a pill is active,
// and the energy drink multiplies the whole click by 5
const clickValue = () => {
  let v = MONEY_PER_CLICK;
  if (pillActive()) v += PILL_SHARE * Math.max(0, state.lastIncome || 0);
  if (energyActive()) v *= ENERGY_MULTIPLIER;
  return v * legacyIncomeMult();
};

function updateEnergy() {
  // political influence
  const hat = $("influenceBtn");
  hat.classList.toggle("active", influenceActive());
  hat.classList.toggle("cantAfford", !influenceActive() && (state.money < INFLUENCE_PRICE || state.influenceCooldown > 0));
  $("influenceTimer").hidden = !influenceActive() && state.influenceCooldown === 0;
  $("influenceTimer").textContent = influenceActive() ? state.influenceLeft + "s" : "⏳ " + clock(state.influenceCooldown);
  $("influenceTimer").classList.toggle("cooldown", !influenceActive());
  const base = Math.max(0, (state.lastIncome || 0) / (influenceActive() ? 2 : 1));
  $("influencePreview").textContent = "Right now that's about +" + fmt(base * INFLUENCE_SECONDS) + " extra over the 2 minutes.";

  // magical pill
  const pill = $("pillBtn");
  pill.classList.toggle("active", pillActive());
  pill.classList.toggle("cantAfford", !pillActive() && (state.money < PILL_PRICE || state.pillCooldown > 0));
  $("pillTimer").hidden = !pillActive() && state.pillCooldown === 0;
  $("pillTimer").textContent = pillActive() ? state.pillLeft + "s" : "⏳ " + clock(state.pillCooldown);
  $("pillTimer").classList.toggle("cooldown", !pillActive());
  $("pillPreview").textContent = "Right now that's +" + fmt(PILL_SHARE * Math.max(0, state.lastIncome || 0)) + " per click.";

  const btn = $("energyBtn");
  btn.classList.toggle("active", energyActive());
  btn.classList.toggle("cantAfford", !energyActive() && (state.money < ENERGY_PRICE || state.energyCooldown > 0));
  $("energyTimer").hidden = !energyActive() && state.energyCooldown === 0;
  $("energyTimer").textContent = energyActive() ? state.energyLeft + "s" : "⏳ " + clock(state.energyCooldown);
  $("energyTimer").classList.toggle("cooldown", !energyActive());
}

// runs every second from the game loop (pauses with the game)
function energyTick() {
  if (state.energyLeft > 0) { state.energyLeft--; if (state.energyLeft === 0) state.energyCooldown = ENERGY_COOLDOWN; }
  else if (state.energyCooldown > 0) state.energyCooldown--;
  if (state.pillLeft > 0) { state.pillLeft--; if (state.pillLeft === 0) state.pillCooldown = PILL_COOLDOWN; }
  else if (state.pillCooldown > 0) state.pillCooldown--;
  if (state.influenceLeft > 0) { state.influenceLeft--; if (state.influenceLeft === 0) state.influenceCooldown = INFLUENCE_COOLDOWN; }
  else if (state.influenceCooldown > 0) state.influenceCooldown--;
  updateEnergy();
}

$("energyBtn").addEventListener("click", () => {
  if (isPaused()) return;
  if (energyActive()) { showNotice("⚡ An energy drink is already working (" + state.energyLeft + "s left)."); return; }
  if (state.energyCooldown > 0) { showNotice("⏳ Energy drink cooldown: " + clock(state.energyCooldown) + " left."); return; }
  if (state.money < ENERGY_PRICE) { showNotice("You need " + coins(ENERGY_PRICE) + " for an energy drink."); return; }
  state.money -= ENERGY_PRICE;
  state.energyLeft = ENERGY_SECONDS;
  state.stats.boostEnergy = (state.stats.boostEnergy || 0) + 1; 
  showNotice("⚡ Energy drink! Clicks are worth ×" + ENERGY_MULTIPLIER + " for " + state.energyLeft + " seconds.");
  updateCounter(); updateEnergy(); save();
});

$("influenceBtn").addEventListener("click", () => {
  if (isPaused()) return;
  if (influenceActive()) { showNotice("🎩 Your political influence is already working (" + state.influenceLeft + "s left)."); return; }
  if (state.influenceCooldown > 0) { showNotice("⏳ Political influence cooldown: " + clock(state.influenceCooldown) + " left."); return; }
  if (state.money < INFLUENCE_PRICE) { showNotice("You need " + coins(INFLUENCE_PRICE) + " for political influence."); return; }
  state.money -= INFLUENCE_PRICE;
  state.influenceLeft = INFLUENCE_SECONDS;
  state.stats.boostInfluence = (state.stats.boostInfluence || 0) + 1; 
  showNotice("🎩 Political influence bought! All businesses earn double for 2 minutes.");
  updateCounter(); updateEnergy(); save();
});

$("pillBtn").addEventListener("click", () => {
  if (isPaused()) return;
  if (pillActive()) { showNotice("🧙 A magical pill is already working (" + state.pillLeft + "s left)."); return; }
  if (state.pillCooldown > 0) { showNotice("⏳ Magical pill cooldown: " + clock(state.pillCooldown) + " left."); return; }
  if (state.money < PILL_PRICE) { showNotice("You need " + coins(PILL_PRICE) + " for a magical pill."); return; }
  state.money -= PILL_PRICE;
  state.pillLeft = PILL_SECONDS;
  state.stats.boostPill = (state.stats.boostPill || 0) + 1; 
  showNotice("🧙 Magical pill! Each click gives +" + fmt(PILL_SHARE * Math.max(0, state.lastIncome || 0)) + " extra for 30 seconds.");
  updateCounter(); updateEnergy(); save();
});
