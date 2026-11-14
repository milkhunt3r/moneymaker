/* =====================================================================
   📱 PHONE MODE: screens up to PHONE_MAX px wide (phones, small tablets in portrait).
   Adds the "phone" class to <body>; css/style.css (📱 PHONE MODE section) does the layout:
   tab bar at the bottom, no blur effects, no endless glow animations, a cheaper background.
   Loaded first, so the right layout is used from the very first frame.
   ===================================================================== */
const PHONE_MAX = 760;
const phoneQuery = matchMedia(`(max-width: ${PHONE_MAX}px)`);
const isPhone = () => document.body.classList.contains("phone");
function applyPhoneMode() {
  const on = phoneQuery.matches;
  if (on === isPhone()) return;
  document.body.classList.toggle("phone", on);
  if (typeof syncBgLayer === "function") syncBgLayer();
}
applyPhoneMode();
phoneQuery.addEventListener ? phoneQuery.addEventListener("change", applyPhoneMode) : phoneQuery.addListener(applyPhoneMode);

/* Background art: "fixed" page backgrounds make the browser repaint the whole screen on scrolls and animations.
   The picture is drawn once on its own fixed layer (#bgLayer) instead, on every screen size. */
function syncBgLayer() {
  const layer = document.getElementById("bgLayer"); if (!layer) return;
  document.body.classList.add("bgProbe");                       // read the picture the body would show...
  const img = getComputedStyle(document.body).backgroundImage;
  document.body.classList.remove("bgProbe");                    // ...then let the layer show it
  layer.style.backgroundImage = img;
}
