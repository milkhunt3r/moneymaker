/* Empire of Coins © 2026 milkhunt3r. All rights reserved. */
/* =====================================================================
   🗺️ WORLD MAP: shows every truck, tanker and plane. Moving ones travel along their route
   (trucks: straight roads, tankers: sea lanes, planes: curved flight paths). Hover an icon for details.
   Drawn on assets/world-map.jpg (see proj() for how latitude / longitude become map positions).
   ===================================================================== */
const MAP_W = 1000, MAP_IMG_W = 1991, MAP_IMG_H = 789, MAP_H = MAP_W * MAP_IMG_H / MAP_IMG_W;
// The map picture is an artistic projection, so positions come from a fit to 75 coastline landmarks:
// a smooth polynomial plus small local corrections around each landmark (pixels of the 1991×789 picture).
const MAP_FIT = { cx: [966.5343, 996.442, 5.3647, 9.5695, 46.2894, -23.0165, 15.7843, -11.0297, -26.3327, -34.0364], cy: [492.5698, 29.8299, -455.9495, -41.8657, -15.5446, 1.8785, -135.1557, -7.2385, 30.6098, 19.9199], S: 9.0,
  pts: [[41.9, -87.6, -0.676, 5.631], [46.8, -92.1, -0.208, 1.29], [42.9, -78.9, 9.563, -13.991], [44.2, -76.5, 21.098, -13.089], [40.7, -74.0, -49.229, 51.707], [35.2, -75.5, 5.602, -15.013], [25.1, -80.9, 4.532, -5.731], [29.0, -89.2, -20.552, -4.215], [29.3, -94.8, 46.72, 2.549], [25.95, -97.15, -25.647, -7.205], [32.7, -117.2, 2.925, 10.316], [34.45, -120.5, 4.564, -12.129], [37.8, -122.5, -14.213, -1.382], [40.4, -124.4, 9.739, 6.873], [48.4, -124.7, 8.897, 0.183], [21.6, -87.1, -7.631, 7.469], [22.9, -109.9, -4.105, 0.398], [21.9, -84.95, 6.636, 0.211], [43.4, -65.6, 18.147, -20.842], [47.5, -52.6, -10.036, 6.215], [65.6, -168.0, -5.902, 2.518], [57.5, -153.0, -3.707, -4.614], [-7.15, -34.8, -1.378, -2.941], [-23.0, -42.0, 7.563, -6.112], [-34.8, -56.5, -5.985, 13.057], [-4.7, -81.3, -3.617, 7.793], [-18.5, -70.3, -3.681, -5.706], [-55.9, -67.3, 1.098, -3.169], [12.4, -71.7, 0.149, 1.611], [-34.8, 20.0, 3.159, 39.276], [-34.4, 18.5, -0.593, -15.374], [-0.7, 8.7, 4.967, 9.597], [-22.9, 14.5, -11.115, -30.25], [-29.9, 31.0, 10.436, -14.465], [-1.0, 33.0, -1.304, 3.308], [-6.8, 39.3, -1.796, 8.354], [36.0, -5.6, -1.836, -1.106], [50.07, -5.7, -1.105, 0.56], [57.7, 10.6, 0.085, 4.82], [37.5, 14.1, 12.601, -1.449], [41.1, 29.0, -37.636, 2.886], [44.4, 34.0, 27.822, -6.654], [12.6, 43.4, -2.877, 5.872], [11.8, 51.3, -2.768, -3.828], [22.5, 59.8, -4.751, 9.616], [26.6, 56.3, 0.937, -11.157], [29.5, 48.0, 3.358, 1.932], [8.1, 77.5, -2.044, 0.162], [5.9, 80.6, 1.789, 0.073], [5.6, 95.3, -4.441, 7.238], [1.3, 103.8, -1.238, -0.738], [34.4, 126.5, 8.317, -10.872], [43.4, 145.8, -11.244, -5.355], [54.4, 142.7, 2.125, 0.775], [51.0, 156.7, -2.412, 2.317], [35.0, 140.0, 11.653, 6.128], [31.2, 121.5, -15.583, 8.18], [39.0, 117.7, 12.072, 13.254], [23.7, 121.0, 1.956, -17.107], [22.3, 114.2, -8.898, 3.703], [19.2, 109.7, 7.193, 0.53], [8.6, 104.7, 4.013, 3.629], [13.5, 100.5, -0.862, -14.987], [18.5, 121.0, 3.37, 6.028], [7.0, 116.8, -4.229, 0.372], [-10.7, 142.5, -13.842, -1.209], [-26.2, 113.2, -3.841, -10.718], [-34.4, 115.1, 7.104, 7.537], [-39.1, 146.4, -0.112, 7.917], [-43.6, 146.8, -4.65, -0.322], [-28.6, 153.6, -4.826, -14.559], [-12.4, 130.8, 30.935, 14.362], [71.2, 25.8, -12.147, -5.537], [69.0, 33.0, 9.588, -4.961], [65.8, 24.2, 4.478, 7.777]] };
function projRaw(lat, lon) {
  const a = lat / 90, o = lon / 180, F = [1, o, a, o * a, o * o, a * a, a ** 3, o ** 3, o * a * a, o * o * a];
  let x = 0, y = 0;
  for (let i = 0; i < F.length; i++) { x += F[i] * MAP_FIT.cx[i]; y += F[i] * MAP_FIT.cy[i]; }
  for (const [plat, plon, wx, wy] of MAP_FIT.pts) {
    const dlon = (lon - plon) * Math.cos((lat + plat) / 360 * Math.PI), d2 = (lat - plat) ** 2 + dlon * dlon;
    if (d2 > 2000) continue;
    const k = Math.exp(-d2 / (2 * MAP_FIT.S * MAP_FIT.S)); x += k * wx; y += k * wy;
  }
  return [x * MAP_W / MAP_IMG_W, y * MAP_W / MAP_IMG_W];
}
// [x, y] on the map for a latitude / longitude; longitudes past ±180 continue on the next copy of the map
function proj(lat, lon) {
  if (lon > 180) { const p = projRaw(lat, lon - 360); return [p[0] + MAP_W, p[1]]; }
  if (lon < -180) { const p = projRaw(lat, lon + 360); return [p[0] - MAP_W, p[1]]; }
  return projRaw(lat, lon);
}
// City coordinates [latitude, longitude]
const CITY = {
  "Chicago": [41.88, -87.63], "New York": [40.71, -74.0], "Sydney": [-33.87, 151.2], "Melbourne": [-37.81, 144.96],
  "Madrid": [40.42, -3.7], "Milan": [45.46, 9.19], "Bangkok": [13.75, 100.5], "Kuala Lumpur": [3.14, 101.69],
  "Los Angeles": [34.05, -118.24], "Denver": [39.74, -104.99], "Beijing": [39.9, 116.4], "Shanghai": [31.23, 121.47],
  "Toronto": [43.65, -79.38], "Montreal": [45.5, -73.57], "Johannesburg": [-26.2, 28.05], "Cape Town": [-33.92, 18.42],
  "São Paulo": [-23.55, -46.63], "Buenos Aires": [-34.6, -58.38], "Delhi": [28.61, 77.21], "Mumbai": [19.08, 72.88],
  "Sullom Voe": [60.46, -1.28], "Rotterdam": [51.92, 4.48], "Ceyhan": [36.68, 35.82], "Augusta / Trieste": [37.23, 15.22],
  "Arzew": [35.85, -0.32], "Fos-sur-Mer": [43.44, 4.94], "Cayo Arcas": [20.2, -91.98], "Houston": [29.76, -95.37],
  "Kikeh": [6.3, 116.2], "Singapore": [1.29, 103.85], "Kozmino": [42.73, 133.03], "Ulsan": [35.54, 129.31],
  "Primorsk": [60.36, 28.61], "Wilhelmshaven": [53.52, 8.13], "Mina Al Fahal": [23.63, 58.52], "Melaka": [2.19, 102.25],
  "Hong Kong": [22.3, 114.17], "Anchorage": [61.22, -149.9], "Leipzig": [51.34, 12.37], "Dubai": [25.2, 55.27],
  "Memphis": [35.15, -90.05], "Louisville": [38.25, -85.76], "Liège": [50.63, 5.57], "Istanbul": [41.0, 28.98],
  "Incheon": [37.46, 126.44], "Doha": [25.29, 51.53], "Frankfurt": [50.11, 8.68], "Tokyo": [35.68, 139.69],
  "Miami": [25.76, -80.19], "Bogotá": [4.71, -74.07], "Amsterdam": [52.37, 4.9],
};
// Sea lanes for tankers (in-between points [lat, lon]) so ships don't sail over land
const SEA_LANES = {
  "Sullom Voe>Rotterdam": [[59, 1], [55, 3.5], [52.3, 3.8]],
  "Ceyhan>Augusta / Trieste": [[35.8, 34.5], [34, 27], [36.3, 16.5]],
  "Houston>Rotterdam": [[27, -89], [24.2, -83], [25.5, -79.5], [33, -70], [44, -40], [49.3, -6], [50.2, -1], [51.4, 2.5]],
  "Primorsk>Wilhelmshaven": [[59.7, 25], [58.8, 20], [56, 15.5], [55.5, 12.9], [56.8, 12], [57.9, 10.9], [57.5, 8], [54.2, 7.6]],
  "Mina Al Fahal>Melaka": [[21, 61], [8, 76], [5.2, 80.5], [6, 93], [5.5, 97]],
  "Kikeh>Singapore": [[5, 110]],
};
const MAP_HOME = { truck: "Chicago", tanker: "Rotterdam", plane: "Memphis" };
const MAP_COLOR = { truck: "#ff9800", tanker: "#29b6f6", plane: "#b388ff" };
const cityName = (s) => s.replace(/ \S+$/, "");


// The path of a route as map points [x, y] (x can go past the map edge for Pacific flights)
const routePathCache = {};
function routePath(key, route) {
  const id = key + ":" + route.from + ">" + route.to;
  if (routePathCache[id]) return routePathCache[id];
  const a = CITY[cityName(route.from)], b = CITY[cityName(route.to)];
  if (!a || !b) return null;
  let pts;
  if (key === "plane") {
    // curved flight path, the short way around the world
    let lon1 = a[1], lon2 = b[1];
    if (lon2 - lon1 > 180) lon2 -= 360; else if (lon1 - lon2 > 180) lon2 += 360;
    const dist = Math.hypot(lon2 - lon1, b[0] - a[0]);
    const cLat = (a[0] + b[0]) / 2 + dist * 0.18 * (((a[0] + b[0]) / 2) >= 0 ? 1 : -1);
    const cLon = (lon1 + lon2) / 2;
    pts = [];
    for (let i = 0; i <= 30; i++) {
      const t = i / 30;
      const lat = (1 - t) ** 2 * a[0] + 2 * (1 - t) * t * cLat + t * t * b[0];
      const lon = (1 - t) ** 2 * lon1 + 2 * (1 - t) * t * cLon + t * t * lon2;
      pts.push(proj(lat, lon));
    }
  } else {
    const lane = key === "tanker" ? (SEA_LANES[cityName(route.from) + ">" + cityName(route.to)] || []) : [];
    pts = [a, ...lane, b].map(([lat, lon]) => proj(lat, lon));
  }
  return (routePathCache[id] = pts);
}
// Point at fraction f (0…1) along a path
function pointAt(pts, f) {
  const seg = [];
  let total = 0;
  for (let i = 1; i < pts.length; i++) { const d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); seg.push(d); total += d; }
  let want = Math.max(0, Math.min(1, f)) * total;
  for (let i = 0; i < seg.length; i++) {
    if (want <= seg[i] || i === seg.length - 1) {
      const t = seg[i] ? Math.min(1, want / seg[i]) : 0;
      return [pts[i][0] + (pts[i + 1][0] - pts[i][0]) * t, pts[i][1] + (pts[i + 1][1] - pts[i][1]) * t];
    }
    want -= seg[i];
  }
  return pts[0];
}
const wrapX = (x) => ((x % MAP_W) + MAP_W) % MAP_W;

if (!state.mapShow) state.mapShow = { truck: true, tanker: true, plane: true };
function renderMapBase() {
  $("worldMap").innerHTML = `<svg viewBox="0 0 ${MAP_W} ${MAP_H}" id="mapSvg">
    <rect width="${MAP_W}" height="${MAP_H}" fill="#0b2450"/>
    <image href="assets/world-map.jpg" x="0" y="0" width="${MAP_W}" height="${MAP_H}" preserveAspectRatio="none"/>
    <g id="mapRoutes"></g><g id="mapCities"></g><g id="mapVehicles"></g></svg>
    <div class="mapTip" id="mapTip" hidden></div>`;
}
// Where each vehicle is right now, and what to show when you hover it
function mapItems() {
  const items = [];
  for (const key of ["truck", "tanker", "plane"]) {
    if (!state.mapShow[key]) continue;
    const F = FLEETS[key];
    for (const v of fleetList(key)) {
      if (v.contract) {
        const r = F.routes[v.contract.route], pts = routePath(key, r);
        if (!pts) continue;
        const f = 1 - v.contract.left / v.contract.seconds;
        const [x, y] = pointAt(pts, f);
        items.push({ key, v, x, y, pts, moving: true,
          tip: `<b>${fIco(key)}${v.name}</b><br>${r.from} → ${r.to}<br>${Math.round(f * 100)}% · ${clockLong(v.contract.left)} left<br><span class="income">+${fmt(contractPayout(key, v.contract.profit))} on arrival</span>` });
      } else {
        const home = v.city || MAP_HOME[key], c = CITY[home] || CITY[MAP_HOME[key]];
        const hp = proj(c[0], c[1]);
        items.push({ key, v, x: hp[0], y: hp[1], moving: false, home,
          tip: v.broken ? `<b>${fIco(key)}${v.name}</b><br>${lgIco("repair")}Broken down in ${home}<br>Repair: ${fmt(v.broken.cost)}`
                        : `<b>${fIco(key)}${v.name}</b><br>Waiting for a contract in ${home}` });
      }
    }
  }
  // vehicles parked in the same city spread out in a small circle
  const groups = {};
  items.filter(i => !i.moving).forEach(i => (groups[i.home] = groups[i.home] || []).push(i));
  for (const g of Object.values(groups)) if (g.length > 1) g.forEach((i, k) => {
    const ang = (k / g.length) * Math.PI * 2, rad = 7 + g.length * 0.8;
    i.x += Math.cos(ang) * rad; i.y += Math.sin(ang) * rad;
  });
  return items;
}
// Every city used by a contract: which fleets go there and which routes
const MAP_CITIES = {};
for (const key of ["truck", "tanker", "plane"]) for (const r of FLEETS[key].routes) for (const end of [r.from, r.to]) {
  const name = cityName(end);
  if (!CITY[name]) continue;
  const c = MAP_CITIES[name] || (MAP_CITIES[name] = { name, label: end, fleets: [], routes: [] });
  if (!c.fleets.includes(key)) c.fleets.push(key);
  const txt = `${fIco(key)}${cityName(r.from)} → ${cityName(r.to)}`;
  if (!c.routes.includes(txt)) c.routes.push(txt);
}
let mapCitiesNow = [];
function renderMapCities(items) {
  const heading = new Set(), fromHere = new Set();
  for (const i of items) if (i.moving) { const r = FLEETS[i.key].routes[i.v.contract.route]; heading.add(cityName(r.to)); fromHere.add(cityName(r.from)); }
  mapCitiesNow = Object.values(MAP_CITIES).filter(c => c.fleets.some(k => state.mapShow[k]));
  $("mapCities").innerHTML = mapCitiesNow.map((c, n) => {
    const [lat, lon] = CITY[c.name], [x, y] = proj(lat, lon), R = 4.2;
    const fl = c.fleets.filter(k => state.mapShow[k]);
    // one color per fleet: a full dot, or slices for cities used by several fleets
    let dot;
    if (fl.length === 1) dot = `<circle r="${R}" fill="${MAP_COLOR[fl[0]]}"/>`;
    else dot = fl.map((k, i) => {
      const a0 = (i / fl.length) * Math.PI * 2 - Math.PI / 2, a1 = ((i + 1) / fl.length) * Math.PI * 2 - Math.PI / 2;
      return `<path d="M0,0 L${(R * Math.cos(a0)).toFixed(2)},${(R * Math.sin(a0)).toFixed(2)} A${R},${R} 0 ${a1 - a0 > Math.PI ? 1 : 0} 1 ${(R * Math.cos(a1)).toFixed(2)},${(R * Math.sin(a1)).toFixed(2)} Z" fill="${MAP_COLOR[k]}"/>`;
    }).join("");
    const ring = heading.has(c.name) ? `<circle r="8" class="destRing"/>` : "";
    return `<g class="mapCity" data-city="${n}" transform="translate(${x.toFixed(1)},${y.toFixed(1)})">${ring}${dot}<circle r="${R}" fill="none" stroke="#0b1426" stroke-width="1"/></g>`;
  }).join("");
  mapCitiesNow.forEach(c => { c.heading = heading.has(c.name); c.from = fromHere.has(c.name); });
}
let mapItemsNow = [];
function renderMapVehicles() {
  if (!$("mapSvg")) renderMapBase();
  const all = mapItems();
  renderMapCities(all);
  // vehicles on top of each other (same route, same moment) become one icon with a "×N" badge; the tip lists them all
  mapItemsNow = [];
  for (const i of all) {
    const g = mapItemsNow.find(o => o.key === i.key && o.moving === i.moving && Math.abs(wrapX(o.x) - wrapX(i.x)) < 7 && Math.abs(o.y - i.y) < 7);
    if (g) { g.group.push(i); continue; }
    mapItemsNow.push({ ...i, group: [i] });
  }
  for (const g of mapItemsNow) if (g.group.length > 1)
    g.tip = `<b>${fIco(g.key)}${g.group.length} vehicles here</b><br>` + g.group.slice(0, 6).map(i => i.tip).join("<hr class=\"mapTipHr\">") + (g.group.length > 6 ? `<br>… and ${g.group.length - 6} more` : "");
  // route lines of moving vehicles (drawn again one map-width left and right, for Pacific flights)
  $("mapRoutes").innerHTML = mapItemsNow.filter(i => i.moving).map(i => {
    const pts = i.pts.map(p => p.join(",")).join(" ");
    return [-MAP_W, 0, MAP_W].map(dx => `<polyline points="${pts}" transform="translate(${dx},0)" stroke="${MAP_COLOR[i.key]}"/>`).join("");
  }).join("");
  $("mapVehicles").innerHTML = mapItemsNow.map((i, n) => {
    const x = wrapX(i.x), r = i.key === "truck" ? 8 : 9.5;
    const ring = i.v.broken ? "#ff5252" : i.moving ? MAP_COLOR[i.key] : "#8a8fa8";
    return `<g class="mapIcon ${i.moving ? "" : "idle"}" data-mi="${n}" transform="translate(${x.toFixed(1)},${i.y.toFixed(1)})">
      <circle r="${r}" fill="#0b1426" stroke="${ring}" stroke-width="2"/>
      <image href="assets/icons/ico-lg-${i.v.broken ? "repair" : FLEETS[i.key].pic}.webp" x="${-r * 0.8}" y="${-r * 0.8}" width="${r * 1.6}" height="${r * 1.6}"/>${i.group.length > 1
        ? `<g class="mapCount" transform="translate(${r * 0.85},${-r * 0.85})"><circle r="6.5"/><text text-anchor="middle" dy="2.6">${i.group.length}</text></g>` : ""}</g>`;
  }).join("");
  $("mapCounts").innerHTML = ["truck", "tanker", "plane"].map(k => {
    const list = fleetList(k), moving = list.filter(v => v.contract).length;
    return `${fIco(k)}${moving}/${list.length} on the move`;
  }).join(" · ");
}
function showMapTip(e) {
  const g = e.target.closest("[data-mi]") || e.target.closest("[data-city]");
  const tip = $("mapTip");
  if (!g) { tip.hidden = true; return; }
  if (g.dataset.city !== undefined) {
    const c = mapCitiesNow[Number(g.dataset.city)];
    if (!c) return;
    const coming = mapItemsNow.filter(i => i.moving && cityName(FLEETS[i.key].routes[i.v.contract.route].to) === c.name).map(i => `${fIco(i.key)}${i.v.name}`);
    tip.innerHTML = `<b>📍 ${c.label}</b><br>${c.routes.join("<br>")}` + (coming.length ? `<br><span class="income">Arriving: ${coming.join(", ")}</span>` : "");
  } else {
    const item = mapItemsNow[Number(g.dataset.mi)];
    if (!item) return;
    tip.innerHTML = item.tip;
  }
  tip.hidden = false;
  const box = $("worldMap").getBoundingClientRect(), r = g.getBoundingClientRect();
  const left = r.left - box.left + r.width / 2, top = r.top - box.top;
  tip.style.left = Math.max(4, Math.min(box.width - 214, left - 105)) + "px";
  tip.style.top = (top > 110 ? top - tip.offsetHeight - 8 : top + r.height + 8) + "px";
}
function updateMapControls() {
  $("worldMapWrap").hidden = !!state.mapHidden;
  $("mapToggle").textContent = state.mapHidden ? "▸ Show" : "▾ Minimize";
  document.querySelectorAll("[data-mapshow]").forEach(b => b.classList.toggle("on", !!state.mapShow[b.dataset.mapshow]));
}
$("worldMap").addEventListener("mousemove", showMapTip);
$("worldMap").addEventListener("mouseleave", () => { $("mapTip").hidden = true; });
$("worldMap").addEventListener("click", showMapTip);   // tap on phones
$("mapCard").addEventListener("click", (e) => {
  if (e.target.closest("#mapToggle")) { state.mapHidden = !state.mapHidden; updateMapControls(); save(); return; }
  const f = e.target.closest("[data-mapshow]");
  if (f) { state.mapShow[f.dataset.mapshow] = !state.mapShow[f.dataset.mapshow]; updateMapControls(); renderMapVehicles(); save(); }
});
renderMapBase();
updateMapControls();
setInterval(() => { if (!$("logisticsView").hidden && !state.mapHidden) renderMapVehicles(); }, 1000);
