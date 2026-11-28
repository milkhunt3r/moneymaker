/* Empire of Coins © 2026 milkhunt3r. All rights reserved. */
/* =====================================================================
   🌐 ESPAÑOL (España), session 3: the 📖 Wiki, the ⭐ prestige screens and the special business details.
   Loaded after js/i18n-es-2.js. The generic fallbacks at the end must stay the last rules.
   ===================================================================== */
// vehicle names stay as they are (except the ones that are also words, e.g. Coral)
for (const n of ["Albatross", "Aurora", "Borealis", "Condor", "Falcon", "Meridian", "Nautilus", "Neptune", "Odyssey", "Osprey", "Pelican"]) if (ES[n] === undefined) ES[n] = n;
// people's names stay as they are
for (const n of ["Ben", "Nina", "Ivan", "Tom", "Jonas", "Leo", "Lena", "Zoe", "Maria", "Mia", "Sofia", "Max", "Emma", "Noah", "Liam", "Olivia", "Lucas", "Anna", "Elias", "Ella", "Finn", "Lea", "Paul", "Hanna", "Felix", "Clara", "Jan", "Sara", "Tim", "Lisa", "Eva", "Luca", "Mila", "Omar", "Yuki", "Kai", "Ava", "Sam", "Ali", "Ida", "Kate", "Igor", "Alex", "Dan"])
  if (ES[n] === undefined) ES[n] = n;

/* ===================== ⭐ PRESTIGE ===================== */
Object.assign(ES, {
  "Are you sure? This": "¿Seguro? Esto", "resets": "reinicia", "This can't be undone.": "No se puede deshacer.", "Prestige now": "Hacer prestigio ya", "Back": "Volver",
  "Kept: achievements, levels, cosmetics, statistics, Legacy bonuses, free bet chips, Art Gallery unlock, slots and paintings. 🛡️ No tax inspections for the first 10 minutes after the reset.":
    "Se conservan: logros, niveles, cosméticos, estadísticas, bonificaciones de Legado, fichas de apuesta gratis, el desbloqueo de la Galería de arte, sus huecos y los cuadros. 🛡️ Sin inspecciones de Hacienda durante los 10 primeros minutos tras el reinicio.",
  "Your Legacy": "Tu Legado", "next at": "el siguiente con", "Free chips: every 10 min → every 5 min": "Fichas gratis: cada 10 min → cada 5 min",
  "+25% income from businesses, special businesses and clicks": "+25% de ingresos de negocios, negocios especiales y clics",
  "Not picked yet: +25% income per pick": "Aún sin elegir: +25% de ingresos por elección", "Not picked yet: keep your logistics fleet on every reset": "Aún sin elegir: conserva tu flota logística en cada reinicio",
  "Not picked yet: free 500 scoin VIP chips": "Aún sin elegir: fichas VIP gratis de 500 scoin",
  "Fleet, warehouses, Trading Port and Logistics Center kept on every reset": "Flota, almacenes, Puerto comercial y Centro logístico se conservan en cada reinicio",
  "Fleet, warehouses, Trading Port and Logistics Center kept on every reset · contracts take half the time": "Flota, almacenes, Puerto comercial y Centro logístico se conservan en cada reinicio · los contratos duran la mitad",
  "All 4 prestiges done: you finished the game! You can keep playing.": "Has hecho los 4 prestigios: ¡has terminado el juego! Puedes seguir jugando.",
  "This is your final prestige.": "Este es tu último prestigio.", "After it, no more resets are possible, but you can keep playing.": "Después ya no se puede reiniciar más, pero puedes seguir jugando.",
});
const RESET_PARTS = {
  "your money, casino chips, businesses, workers, special businesses, investments and logistics fleet": "tu dinero, fichas del casino, negocios, trabajadores, negocios especiales, inversiones y flota logística",
  "your money, casino chips, businesses, workers, other special businesses and investments": "tu dinero, fichas del casino, negocios, trabajadores, el resto de negocios especiales e inversiones",
};
const resetEs = (a, b) => (RESET_PARTS[a] || a) + (/kept/.test(b) ? " (tus edificios de 🔬 Ciencia se conservan; el 🛰️ satélite no)" : " y 🔬 Ciencia");
hrx(String.raw`Are you sure\? This <b>resets<\/b> (.+?)( \(your 🔬 Science buildings are kept, the 🛰️ satellite is not\)| and 🔬 Science)\.`, (m, a, b) => `¿Seguro? Esto <b>reinicia</b> ${resetEs(a, b)}.`);
rx(String.raw`(your money, .+?)( \(your 🔬 Science buildings are kept, the 🛰️ satellite is not\)| and 🔬 Science)\.`, (m, a, b) => `${resetEs(a, b)}.`);
hrx(String.raw`(?:Prestige|Prestigio) <b>(\d) (?:of|de) (\d)<\/b> · next at <b>(${NUM})<\/b> \(you have (${NUM})\)`, "Prestigio <b>$1 de $2</b> · el siguiente con <b>$3</b> (tienes $4)");
rx(String.raw`(\d) of (\d)`, "$1 de $2");
rx(String.raw`\(you have (${NUM})\)`, "(tienes $1)");
rx(String.raw`Your picks: (.+)`, (m, l) => "Tus elecciones: " + l.replace(/💼 Tycoon's Legacy/g, "💼 Legado del magnate").replace(/🚢 Global Empire/g, "🚢 Imperio global").replace(/🎟️ VIP Coins/g, "🎟️ Monedas VIP"));
rx(String.raw`\+(\d+)% income from businesses, special businesses and clicks`, "+$1% de ingresos de negocios, negocios especiales y clics");
rx(String.raw`A free 500 scoin VIP chip every (\d+) minutes for the Super high roller tables( · up to 200 chips of 500 scoin)?`, (m, n, c) => `Una ficha VIP gratis de 500 scoin cada ${n} minutos para las mesas de súper altas apuestas${c ? " · hasta 200 fichas de 500 scoin" : ""}`);
rx(String.raw`Income \+(\d+)% for good`, "Ingresos +$1% para siempre");

/* ===================== 🏢 SPECIAL BUSINESSES (details and staffing plan) ===================== */
Object.assign(ES, {
  "Law Firm opened! Buy attorney slots to hire lawyers.": "¡Bufete abierto! Compra plazas de abogado para contratar letrados.",
  "Logistics Center opened! Choose its first upgrade.": "¡Centro logístico abierto! Elige su primera mejora.",
  "Choose the staff for every new hotel and casino. \"🎲 Random\" rolls a trait like normal hiring. Max 5 🛎️ Concierges per hotel.":
    "Elige el personal de cada hotel y casino nuevo. «🎲 Al azar» sortea un rasgo como en una contratación normal. Máximo 5 🛎️ conserjes por hotel.",
  "Save plan": "Guardar plan", "Apply staffing plan to all": "Aplicar el plan de personal a todos", "Random": "Al azar", "🎲 Random": "🎲 Al azar",
  "58 workers hired. Workers who fit the plan keep their pay; new workers get random pay.": "58 trabajadores contratados. Los que encajan en el plan mantienen su sueldo; los nuevos cobran un sueldo al azar.",
  "Hand": "Mano", "Slot": "Hueco", "Step": "Peldaño", "sell": "vender", "owned": "en propiedad", "1st prestige": "1.er prestigio", "2nd prestige": "2.º prestigio",
});
rx(String.raw`Worker (\d+)`, "Trabajador $1");
rx(String.raw`Amusement park #(\d) opened next to Hotel #(\d)!`, "¡Parque de atracciones n.º $1 abierto junto al hotel n.º $2!");
rx(String.raw`(\d+) places: accountant, HR and (\d+) workers · pay (\d+)–(\d+) \/ sec each \(random\)`, "$1 plazas: contable, RR. HH. y $2 trabajadores · sueldo $3–$4 / s cada uno (al azar)");
hrx(String.raw`<b>(\d+)<\/b> businesses? needs? changes to match your plan\. Total cost: <b>(${NUM})<\/b> \(1 scoin per business\)\.`,
  (m, n, c) => `<b>${n}</b> ${plural(n, "negocio necesita", "negocios necesitan")} cambios para ajustarse a tu plan. Coste total: <b>${c}</b> (1 scoin por negocio).`);
rx(String.raw`(Casino|Hotel) #(\d+): hire (\d+)`, (m, b, n, h) => `${b === "Casino" ? "Casino" : "Hotel"} n.º ${n}: contratar ${h}`);
rx(String.raw`(Casino|Hotel) #(\d+): (\d+) changes?`, (m, b, n, h) => `${b} n.º ${n}: ${h} ${plural(h, "cambio", "cambios")}`);
rx(String.raw`(\d+) workers hired\. Workers who fit the plan keep their pay; new workers get random pay\.`, "$1 trabajadores contratados. Los que encajan en el plan mantienen su sueldo; los nuevos cobran un sueldo al azar.");
rx(String.raw`Apply for (${NUM})`, "Aplicar por $1");

/* ===================== 📖 WIKI ===================== */
const TABLE_ES = { "Classic table": "mesa clásica", "High rollers": "altas apuestas", "Super high rollers": "súper altas apuestas" };
const GAME_ES = (g) => ES[g] || g;
rx(String.raw`(Roulette|Blackjack|Video Poker|Baccarat|Ultimate Texas Hold'em|Plinko|Sky Climb): (Classic table|High rollers|Super high rollers): (${NUM}) – (${NUM})(.*)`,
  (m, g, tb, a, b, rest) => { const r = rest ? esq(rest) : ""; return r == null ? null : `${GAME_ES(g)}: ${TABLE_ES[tb]}: ${a} – ${b}${r}`; });
Object.assign(ES, {
  // shared table heads
  "Effect": "Efecto", "Price": "Precio", "Always": "Siempre", "Pays": "Paga", "Achievement": "Logro", "Goal": "Objetivo", "Unlock": "Desbloqueo",
  "What it does": "Qué hace", "Levels": "Niveles", "Business": "Negocio", "coin": "moneda", "background": "fondo", "cards": "cartas", "Unit": "Unidad",
  "Where you see it": "Dónde lo ves", "Tab": "Pestaña", "What you do there": "Qué haces allí", "Level": "Nivel", "How you get XP": "Cómo ganas XP", "What it gives": "Qué te da",
  "Bonus": "Bonificación", "Staff": "Personal", "Worker income": "Ingresos por trabajador", "Trait": "Rasgo", "Chance": "Probabilidad", "Booster": "Potenciador",
  "Cooldown": "Recarga", "Attorney": "Abogado", "Attorneys": "Abogados", "Building": "Edificio", "Needs": "Requisitos", "Covers": "Cubre", "Jackpot": "Bote",
  "Fleet": "Flota", "Slots": "Plazas", "Trip length": "Duración del viaje", "Agent unlock": "Desbloqueo del agente", "Bonuses": "Bonificaciones", "Oil tankers": "Petroleros",
  "Tiers": "Niveles", "Tier": "Nivel", "Paintings": "Cuadros", "Full value": "Valor completo", "Tools": "Herramientas", "Tool": "Herramienta", "Grab": "Agarrar",
  "Eraser": "Goma", "Paints white": "Pinta de blanco", "Item": "Artículo", "How to unlock": "Cómo desbloquearla", "Effect per level": "Efecto por nivel",
  "Cost per level (money + ore)": "Coste por nivel (dinero + mineral)", "Classic": "Clásica", "Hot Tables": "Mesas calientes", "Insurance": "Seguro",
  "Street": "Transversal", "Corner": "Cuadro", "Six line": "Seisena", "Dozen / Column": "Docena / Columna", "Player Pair / Banker Pair": "Pareja del jugador / Pareja de la banca",
  // ⭐ general
  "Money units": "Unidades de dinero", "Normal amounts": "Cantidades normales", "scoin (sc)": "scoin (sc)",
  "Amounts from 1 million (your main counter switches at 100 scoin)": "Cantidades a partir de 1 millón (tu contador principal cambia a los 100 scoin)",
  "The biggest amounts": "Las cantidades más grandes", "1,000,000 bcoin": "1.000.000 bcoin", "1,000,000 scoin": "1.000.000 scoin",
  "Hover your money counter to see it in the other unit.": "Pasa el ratón por tu contador de dinero para verlo en la otra unidad.", "The tabs": "Las pestañas",
  "Click the coin, buy businesses and special businesses, hire workers, use boosters": "Haz clic en la moneda, compra negocios y negocios especiales, contrata trabajadores, usa potenciadores",
  "Move money into casino chips and play table games": "Pasa dinero a fichas del casino y juega en las mesas",
  "Real estate, ETFs, gold, Broker ETF and live crypto trading": "Inmuebles, ETF, oro, ETF del bróker y trading de criptomonedas en directo",
  "Trucks, oil tankers and cargo planes on contracts, with a world map": "Camiones, petroleros y aviones de carga con contratos, con un mapa del mundo",
  "Art Gallery: copy paintings and sell them or keep them · ⛏️ Gold Mine Dig: dig for ore (needs a gold mine)": "Galería de arte: copia cuadros y véndelos o guárdalos · ⛏️ Excavación en la mina de oro: excava en busca de mineral (necesita una mina de oro)",
  "Goals across the whole game": "Objetivos por todo el juego", "Cosmetics: backgrounds and coins": "Cosméticos: fondos y monedas", "This guide": "Esta guía",
  "Gambler (Casino)": "Jugador (Casino)", "Investor (Investing)": "Inversor (Inversiones)",
  "XP = bcoin you bet × the table's XP multiplier": "XP = bcoin que apuestas × el multiplicador de XP de la mesa",
  "0.1% cashback on lost bets per level, casino businesses, free bet chips": "0,1% de reembolso en apuestas perdidas por nivel, casinos, fichas de apuesta gratis",
  "XP every minute you have money invested, plus XP per crypto trade": "XP cada minuto que tienes dinero invertido, más XP por operación de cripto",
  "Lower ETF fee, +0.1% on property sales per level, hotels, Brokerage Firm, lower crypto fee": "Menor comisión del ETF, +0,1% en ventas de inmuebles por nivel, hoteles, Agencia de valores, menor comisión de cripto",
  "XP for every delivered contract (contract minutes × 1 truck / 3 tanker / 6 plane)": "XP por cada contrato entregado (minutos del contrato × 1 camión / 3 petrolero / 6 avión)",
  "Logistics agents: trucks at 5, tankers at 25, planes at 50": "Agentes logísticos: camiones en el 5, petroleros en el 25, aviones en el 50",
  "Each level card has a \"📋 All levels\" button with every level's XP and unlocks.": "Cada tarjeta de nivel tiene un botón «📋 Todos los niveles» con la XP y los desbloqueos de cada nivel.",
  "1st: keep trucks, tankers, planes, warehouses, Trading Port and Logistics Center on every reset (the satellite resets with Science). 2nd: all contracts take half the time (same pay)":
    "1.ª: conserva camiones, petroleros, aviones, almacenes, Puerto comercial y Centro logístico en cada reinicio (el satélite se reinicia con Ciencia). 2.ª: todos los contratos duran la mitad (misma paga)",
  "A free 500 scoin bet chip every 10 min for the Super high roller tables, and all other free bet chips come twice as fast (every 10 / 7.5 / 5 min instead of 20 / 15 / 10). You can hold up to 200 chips of 500 scoin instead of 100":
    "Una ficha de apuesta gratis de 500 scoin cada 10 min para las mesas de súper altas apuestas, y el resto de fichas gratis llegan el doble de rápido (cada 10 / 7,5 / 5 min en vez de 20 / 15 / 10). Puedes tener hasta 200 fichas de 500 scoin en vez de 100",
  "Tycoon's Legacy and VIP Coins can be picked once, Global Empire twice: 4 picks for 4 prestiges, so by the end you have every bonus, in the order you choose.":
    "Legado del magnate y Monedas VIP se pueden elegir una vez, Imperio global dos: 4 elecciones para 4 prestigios, así que al final tendrás todas las bonificaciones, en el orden que elijas.",
  "Saving": "Guardado", "The game saves automatically in your browser. Sign in with Google (👤 Profile) to keep a ☁️ cloud copy and play on other devices. In ⚙️ Settings you can also reset the game.":
    "El juego se guarda automáticamente en tu navegador. Inicia sesión con Google (👤 Perfil) para tener una copia en la ☁️ nube y jugar en otros dispositivos. En ⚙️ Ajustes también puedes reiniciar la partida.",
  "Tips and guided start": "Consejos e inicio guiado",
  "New players get a short guided start (click the coin, buy a business, hire staff). After that, a small tip appears the first time you meet something new, with a link to the matching Wiki page. ⚙️ Settings: turn tips on/off, show all tips again, or replay the guided start.":
    "Los jugadores nuevos tienen un breve inicio guiado (haz clic en la moneda, compra un negocio, contrata personal). Después aparece un pequeño consejo la primera vez que encuentras algo nuevo, con un enlace a la página correspondiente de la Wiki. ⚙️ Ajustes: activa o desactiva los consejos, vuelve a ver todos o repite el inicio guiado.",
  "Background and offline": "En segundo plano y sin conexión",
  "Art Gallery paintings are stored separately in the browser so a big collection never fills up the save. If the browser ever refuses to save, a red warning appears at the bottom of the screen.":
    "Los cuadros de la Galería de arte se guardan aparte en el navegador para que una colección grande nunca llene la partida guardada. Si el navegador se niega a guardar, aparece un aviso rojo en la parte inferior de la pantalla.",
  // 💰 income
  "Clicking": "Clics", "Every click on the coin gives 1 bcoin (up to 10 clicks per second). Boosters and Tycoon's Legacy increase it.":
    "Cada clic en la moneda da 1 bcoin (hasta 10 clics por segundo). Los potenciadores y el Legado del magnate lo aumentan.",
  "Buy a business, then hire workers. Each worker earns a random amount per second and has one trait. The first worker is free; each one after that costs more. You choose from 3 candidates, and \"New options\" refreshes them for a small growing price.":
    "Compra un negocio y contrata trabajadores. Cada trabajador gana una cantidad al azar por segundo y tiene un rasgo. El primero es gratis; cada uno de los siguientes cuesta más. Eliges entre 3 candidatos, y «Nuevas opciones» los renueva por un pequeño precio que va subiendo.",
  "2 workers (no accountant or HR)": "2 trabajadores (sin contable ni RR. HH.)", "Unlocks when you have 20 car wash workers": "Se desbloquea cuando tienes 20 trabajadores en lavaderos",
  "Unlocks when you own all 3 car washes and all 3 repair shops": "Se desbloquea cuando tienes los 3 lavaderos y los 3 talleres",
  "Casino #1 unlocks at Gambler level 5": "El casino n.º 1 se desbloquea en el nivel de jugador 5", "Hotel #1 unlocks at Investor level 5": "El hotel n.º 1 se desbloquea en el nivel de inversor 5",
  "Worker traits": "Rasgos de los trabajadores", "Accountants (one per business)": "Contables (uno por negocio)", "HR managers (one per business)": "Responsables de RR. HH. (uno por negocio)",
  "Boosters": "Potenciadores", "Clicks ×5 for 30 s": "Clics ×5 durante 30 s", "Each click also gives 10% of your income per second, for 30 s": "Cada clic da además el 10% de tus ingresos por segundo, durante 30 s",
  "Business income ×2 for 2 min": "Ingresos de negocios ×2 durante 2 min",
  "No workers, HR manager or accountant. Sorted from cheapest to most expensive.": "Sin trabajadores, responsable de RR. HH. ni contable. Ordenados del más barato al más caro.",
  "Max 5; slots open at 3, 6, 9, 12, 15 trucks": "Máx. 5; las plazas se abren con 3, 6, 9, 12 y 15 camiones", "+2% on truck contract payouts each": "+2% en los pagos de contratos de camiones cada uno",
  "Hire up to 10 attorneys (slot n costs 50.000 × n); pick 1 of 3 each time": "Contrata hasta 10 abogados (la plaza n cuesta 50.000 × n); elige 1 de 3 cada vez",
  "2 hotels and 2 casinos": "2 hoteles y 2 casinos",
  "Staffing plan: pick the accountant, HR and a trait for every worker place of a hotel and a casino. 👥 Hire staff fills every hotel and casino with no staff yet, 1 scoin per business (pay per second stays random). Businesses with staff are not touched. 🔄 Apply to all brings every hotel and casino in line with the plan, 1 scoin per business that needs changes (workers who fit the plan are kept). The plan is kept on prestige":
    "Plan de personal: elige el contable, RR. HH. y un rasgo para cada plaza de trabajador de un hotel y un casino. 👥 Contratar personal llena todos los hoteles y casinos que aún no tienen personal, 1 scoin por negocio (el sueldo por segundo sigue siendo al azar). Los negocios con personal no se tocan. 🔄 Aplicar a todos ajusta todos los hoteles y casinos al plan, 1 scoin por negocio que necesite cambios (se mantienen los trabajadores que encajan). El plan se conserva al hacer prestigio",
  "100.000 all-time real estate profit": "100.000 de beneficio inmobiliario total",
  "+2% on property sales; agents join as real estate profit grows: 1st at 100.000, 2nd at 300.000, 3rd at 600.000, 4th at 1 scoin… (each step 100.000 bigger; max 100, reached at 505 scoin), each earns 0/5/10/15 per second":
    "+2% en las ventas de inmuebles; se suman agentes a medida que crece el beneficio inmobiliario: el 1.º con 100.000, el 2.º con 300.000, el 3.º con 600.000, el 4.º con 1 scoin… (cada escalón 100.000 mayor; máx. 100, al llegar a 505 scoin), cada uno gana 0/5/10/15 por segundo",
  "One per hotel": "Uno por hotel", "Earns 50% of its paired hotel's income": "Gana el 50% de los ingresos de su hotel emparejado",
  "500.000 all-time gold profit; max 2": "500.000 de beneficio total en oro; máx. 2",
  "500 / sec until its 20–30 scoin of gold is mined, then it closes. 🔥 Gold rush: 1 in 1000 chance per second per mine (2 mines: 1 in 500) of 2× mine income for 10 sec":
    "500 / s hasta extraer sus 20–30 scoin de oro; después cierra. 🔥 Fiebre del oro: 1 probabilidad entre 1000 por segundo y mina (2 minas: 1 entre 500) de ×2 en los ingresos de la mina durante 10 s",
  "Own an oil tanker; max 1": "Ten un petrolero; máx. 1", "350 / sec per tanker and +2.5% on tanker contracts": "350 / s por petrolero y +2,5% en los contratos de petroleros",
  "20 paintings in your Art Gallery collection; max 1": "20 cuadros en tu colección de la Galería de arte; máx. 1", "250 / sec per painting in your collection, max 10.000 / sec": "250 / s por cuadro de tu colección, máx. 10.000 / s",
  "Logistics level 20; max 1": "Nivel de logística 20; máx. 1",
  "Choose 1 agent upgrade (fee 1%, best contract, or 3-second picks); the other two cost 1 scoin each": "Elige 1 mejora de agentes (comisión del 1%, mejor contrato o elección en 3 segundos); las otras dos cuestan 1 scoin cada una",
  "When all 10 slots are filled, you can fire any attorney and choose a replacement from 3 offers for 1 scoin.": "Cuando las 10 plazas están ocupadas, puedes despedir a cualquier abogado y elegir un sustituto entre 3 ofertas por 1 scoin.",
  "The 💰 Income tab has three pages: 🏢 Businesses, ⭐ Special and 🔬 Science. Science unlocks at Logistics level 30, Investor level 30 and Gambler level 20.":
    "La pestaña 💰 Ingresos tiene tres páginas: 🏢 Negocios, ⭐ Especiales y 🔬 Ciencia. Ciencia se desbloquea con nivel de logística 30, nivel de inversor 30 y nivel de jugador 20.",
  "Science unlocked": "Ciencia desbloqueada",
  "1 scientist every 2 min, up to 50. Costs 5 / sec per empty place (−250 / sec at first); full: +500 / sec": "1 científico cada 2 min, hasta 50. Cuesta 5 / s por plaza vacía (−250 / s al principio); llena: +500 / s",
  "Every second a 1 in 7,200 chance of a breakthrough (guaranteed after 2 hours): a Nobel Prize and 1000 scoin. The game pauses until you accept it. Offline: at most 1":
    "Cada segundo, 1 probabilidad entre 7.200 de un avance (garantizado tras 2 horas): un Premio Nobel y 1000 scoin. El juego se pausa hasta que lo aceptas. Sin conexión: como mucho 1",
  "2 breakthroughs": "2 avances", "A mission every 20 minutes: 2000 scoin – 5000 scoin, 20% chance to fail (15% with the satellite)": "Una misión cada 20 minutos: 2000 scoin – 5000 scoin, 20% de probabilidad de fracaso (15% con el satélite)",
  "Satellite (🚢 Logistics)": "Satélite (🚢 Logística)",
  "Missions fail 15% instead of 20% · cargo planes +5% pay · tankers 10% faster · broken trucks repaired for free after 5 sec": "Las misiones fracasan un 15% en vez de un 20% · aviones de carga +5% de paga · petroleros un 10% más rápidos · los camiones averiados se reparan gratis a los 5 s",
  "Nobel Prizes can be won in 10 fields: Physics, Chemistry, Medicine and Physiology, Biology, Genetics, Molecular Biology, Neuroscience, Astronomy and Astrophysics, Materials Science and Environmental Science. A prestige resets Science, unless you picked Tycoon's Legacy.":
    "Se pueden ganar Premios Nobel en 10 campos: Física, Química, Medicina y Fisiología, Biología, Genética, Biología molecular, Neurociencia, Astronomía y Astrofísica, Ciencia de materiales y Ciencias ambientales. Un prestigio reinicia la Ciencia, salvo si elegiste el Legado del magnate.",
  "2nd University": "2.ª universidad", "3rd University": "3.ª universidad", "University · 1st prestige": "Universidad · 1.er prestigio", "2nd University · 2nd prestige": "2.ª universidad · 2.º prestigio",
  "Trains its own scientists (1 every 2 min, up to 50) into the same shared pool, with the same running cost and full-house income": "Forma sus propios científicos (1 cada 2 min, hasta 50) para la misma reserva compartida, con el mismo coste y los mismos ingresos al llenarse",
  "Space missions launch 5 minutes sooner": "Las misiones espaciales salen 5 minutos antes", "1st prestige · both Universities full": "1.er prestigio · las dos universidades llenas",
  "Missions fail 5% less often and launch 5 minutes sooner · Research lab breakthroughs 1 in 3,600 (guaranteed within 1 hour)": "Las misiones fracasan un 5% menos y salen 5 minutos antes · avances del laboratorio 1 entre 3.600 (garantizado en menos de 1 hora)",
  "A third University for the shared pool: up to 150 scientists in total": "Una tercera universidad para la reserva compartida: hasta 150 científicos en total",
  "Orbital Space Station · 2nd prestige": "Estación Espacial Orbital · 2.º prestigio",
  "A deep space mission every 20 minutes: 50.000 scoin – 70.000 scoin, 20% chance to fail (not changed by the satellite, Astronomy center or station)": "Una misión al espacio profundo cada 20 minutos: 50.000 scoin – 70.000 scoin, 20% de probabilidad de fracaso (no la cambian el satélite, el centro astronómico ni la estación)",
  "Genetics Laboratory": "Laboratorio de genética", "Moon Base · 2nd prestige": "Base Lunar · 2.º prestigio", "+30% on every 🚀 space mission and 🌕 deep space mission reward": "+30% en cada premio de 🚀 misión espacial y 🌕 misión al espacio profundo",
  "Mars Base": "Base en Marte", "Moon Base + Genetics Laboratory · 2nd prestige": "Base Lunar + Laboratorio de genética · 2.º prestigio",
  "Its own deep space mission every 10 minutes: 50.000 scoin – 70.000 scoin, 10% chance to fail (+30% with the Genetics Laboratory). Moon Base missions launch 10 minutes sooner and fail 10% less often":
    "Su propia misión al espacio profundo cada 10 minutos: 50.000 scoin – 70.000 scoin, 10% de probabilidad de fracaso (+30% con el Laboratorio de genética). Las misiones de la Base Lunar salen 10 minutos antes y fracasan un 10% menos",
  "With both 🔭 and 🛸 a space mission launches every 10 minutes and fails 10% of the time with the satellite.": "Con 🔭 y 🛸 a la vez sale una misión espacial cada 10 minutos y fracasa el 10% de las veces con el satélite.",
  // 🎰 casino
  "Roulette (European, 0–36)": "Ruleta (europea, 0–36)", "1 number (incl. 0)": "1 número (incl. el 0)", "2 numbers next to each other (incl. 0–1/2/3)": "2 números juntos (incl. 0–1/2/3)",
  "3 numbers in a row (incl. 0-1-2, 0-2-3)": "3 números en fila (incl. 0-1-2, 0-2-3)", "4 numbers (incl. 0-1-2-3)": "4 números (incl. 0-1-2-3)", "2 rows, 6 numbers": "2 filas, 6 números",
  "12 numbers": "12 números", "Red / Black, Odd / Even, 1–18 / 19–36": "Rojo / Negro, Impar / Par, 1–18 / 19–36", "18 numbers": "18 números",
  "0 loses all outside bets. House edge 2.7%.": "Con el 0 pierden todas las apuestas exteriores. Ventaja de la casa: 2,7%.",
  "Video Poker (Jacks or Better + Joker)": "Videopóquer (Jotas o más + comodín)", "+100% of the jackpot (× your bet / max bet)": "+100% del bote (× tu apuesta / apuesta máx.)",
  "+20% of the jackpot (× your bet / max bet)": "+20% del bote (× tu apuesta / apuesta máx.)",
  "Bet on any spots you like: at least one bet on Player, Banker or Tie.": "Apuesta en las casillas que quieras: al menos una apuesta a Jugador, Banca o Empate.",
  "0.95:1 (5% commission)": "0,95:1 (5% de comisión)", "8:1 (Player and Banker bets are returned)": "8:1 (se devuelven las apuestas a Jugador y Banca)",
  "11:1 (first two cards of that hand are the same rank)": "11:1 (las dos primeras cartas de esa mano tienen el mismo valor)",
  "Before the flop: check or raise 3×/4× the ante. After the flop: check or raise 2×. After the river: raise 1× or fold. You can raise only once.":
    "Antes del flop: pasa o sube 3×/4× el ante. Después del flop: pasa o sube 2×. Después del river: sube 1× o retírate. Solo puedes subir una vez.",
  "Gene Cascade (slot)": "Gene Cascade (tragaperras)",
  "About 99% return (simulated over millions of spins): a win on about 41% of spins, free spins about once every 100 spins. Max win 5000× the bet. A spin is decided before it is shown, so leaving or reloading pays the same win.":
    "Devolución de cerca del 99% (simulada en millones de tiradas): premio en cerca del 41% de las tiradas, tiradas gratis más o menos una vez cada 100. Premio máximo 5000× la apuesta. La tirada se decide antes de mostrarse, así que salir o recargar paga el mismo premio.",
  "From Gambler level 5 you get free chips on timers (see the frame under the Gambler level). Use them at Roulette, Blackjack, Baccarat, Video Poker and Hold'em (not Plinko, Sky Climb or Gene Cascade). A free chip is a bet: whatever it wins goes to your casino chips. At Hold'em, a free Ante needs 2 chips (Ante + Blind).":
    "Desde el nivel de jugador 5 recibes fichas gratis con temporizador (mira el recuadro bajo el nivel de jugador). Úsalas en ruleta, blackjack, baccarat, videopóquer y Hold'em (no en Plinko, Sky Climb ni Gene Cascade). Una ficha gratis es una apuesta: lo que gane va a tus fichas del casino. En Hold'em, un ante gratis necesita 2 fichas (ante + ciega).",
  "Free chip": "Ficha gratis", "All timers 20 → 15 min": "Todos los temporizadores 20 → 15 min", "All timers 15 → 10 min": "Todos los temporizadores 15 → 10 min",
  // 📈 investing
  "Investor XP": "XP de inversor",
  "every minute you have money invested gives 4 XP (8 XP from 1 scoin invested, 16 XP from 100 scoin), plus XP per crypto trade. Each level lowers the ETF fee, adds +0.1% to property sales and lowers the crypto fee every 10 levels. Hotels unlock at levels 5, 15, 25…, the Brokerage Firm at 10.":
    "cada minuto que tienes dinero invertido da 4 XP (8 XP desde 1 scoin invertido, 16 XP desde 100 scoin), más XP por operación de cripto. Cada nivel baja la comisión del ETF y suma +0,1% a las ventas de inmuebles, y la comisión de cripto baja cada 10 niveles. Los hoteles se desbloquean en los niveles 5, 15, 25…; la Agencia de valores, en el 10.",
  "Live trading (crypto)": "Trading en vivo (cripto)", "Unlocks at Investor level 20.": "Se desbloquea en el nivel de inversor 20.",
  "Chart tools: Line or Candles (1 min, 5 min, 15 min, 4 hours), volume bars, and MA5 / MA10 / MA20 / MA50 moving averages. Hover the chart for details.":
    "Herramientas del gráfico: línea o velas (1 min, 5 min, 15 min, 4 horas), barras de volumen y medias móviles MA5 / MA10 / MA20 / MA50. Pasa el ratón por el gráfico para ver detalles.",
  // 🚢 logistics
  "Logistics unlocks when you buy your first 🚘 Car Salon.": "La logística se desbloquea cuando compras tu primer 🚘 concesionario.",
  "Buy vehicles, then pick one of 4 contract offers for each. When the trip ends, the contract is paid to your money and a new set of offers appears. Trips keep moving while the game is closed.":
    "Compra vehículos y elige una de las 4 ofertas de contrato para cada uno. Al terminar el viaje, el contrato se paga a tu dinero y aparecen ofertas nuevas. Los viajes siguen avanzando con el juego cerrado.",
  "Own 3 oil tankers": "Ten 3 petroleros",
  "Shows every vehicle moving along its route (trucks on roads, tankers on sea lanes, planes on flight paths), and every contract city as a dot in the fleet's color. Hover a vehicle or city for details. A glowing ring means a vehicle is on its way there.":
    "Muestra cada vehículo avanzando por su ruta (camiones por carretera, petroleros por rutas marítimas, aviones por rutas aéreas) y cada ciudad de contrato como un punto del color de la flota. Pasa el ratón por un vehículo o una ciudad para ver detalles. Un anillo brillante significa que un vehículo va hacia allí.",
  "Warehouses: +2% on truck contracts each (max 5).": "Almacenes: +2% en los contratos de camiones cada uno (máx. 5).",
  "Trading Port: +2.5% on tanker contracts and 350 / sec per tanker.": "Puerto comercial: +2,5% en los contratos de petroleros y 350 / s por petrolero.",
  "Global Empire prestige: keep your fleet on resets; level 2 halves every contract's time.": "Prestigio Imperio global: conserva tu flota en los reinicios; el nivel 2 reduce a la mitad el tiempo de cada contrato.",
  // 🎮 mini-games
  "The 🎮 Mini-games tab holds games you unlock with your buildings and achievements. Play them to earn extra money.": "La pestaña 🎮 Minijuegos reúne juegos que desbloqueas con tus edificios y logros. Juega para ganar dinero extra.",
  "Unlocks when you buy your first ⛏️ gold mine and stays unlocked even after the mine runs dry or a prestige. Each run costs ⚡ 1 energy: you have up to 5 (more with the ⚡ Energy tank), and 1 comes back every 20 minutes (faster with ⏱️ Fast recharge), also while the game is closed.":
    "Se desbloquea al comprar tu primera ⛏️ mina de oro y sigue desbloqueado aunque la mina se agote o hagas prestigio. Cada partida cuesta ⚡ 1 de energía: tienes hasta 5 (más con el ⚡ depósito de energía) y recuperas 1 cada 20 minutos (más rápido con ⏱️ recarga rápida), también con el juego cerrado.",
  "Dig with the arrow keys / WASD or the on-screen buttons. Every step burns lamp oil (100 at the start): walking through a tunnel 0.25, digging dirt 1, each hit on stone 1.25 (2 hits) and on granite 1.5 (3 hits). 🪨 Bedrock can't be dug. Your bag holds 25 ore. Walk back to the surface to sell; if the lamp runs out underground, the rescue team keeps you safe but you keep only 50% of your ore (more with 🆘 Rescue insurance).":
    "Excava con las flechas / WASD o con los botones de la pantalla. Cada paso gasta aceite de la lámpara (100 al principio): andar por un túnel 0,25, cavar tierra 1, cada golpe a la piedra 1,25 (2 golpes) y al granito 1,5 (3 golpes). 🪨 La roca madre no se puede excavar. En tu bolsa caben 25 de mineral. Vuelve andando a la superficie para vender; si la lámpara se apaga bajo tierra, el equipo de rescate te pone a salvo, pero solo conservas el 50% de tu mineral (más con 🆘 seguro de rescate).",
  "Ore is worth seconds of your income (your average business income over the last minute, at least 500 / sec)": "El mineral vale segundos de tus ingresos (tus ingresos medios de negocios en el último minuto, como mínimo 500 / s)",
  "Coal 8 sec": "Carbón 8 s", "Copper 20 sec": "Cobre 20 s", "Silver 45 sec": "Plata 45 s", "Gold 100 sec": "Oro 100 s", "Diamond 250 sec": "Diamante 250 s",
  "Ruby 500 sec. Deeper ore is rarer and worth more. 🔥 A gold rush in your real mines doubles ore value while it lasts.": "Rubí 500 s. El mineral más profundo es más raro y vale más. 🔥 Una fiebre del oro en tus minas reales duplica el valor del mineral mientras dura.",
  "Vault and ⬆️ upgrades": "Cámara y ⬆️ mejoras", "Upgrades and the vault are kept on prestige.": "Las mejoras y la cámara se conservan al hacer prestigio.",
  "Medium unlocks after you submit (sell or keep) 5 Easy paintings; 🔴 Hard unlocks after 10 Medium paintings.": "La dificultad media se desbloquea al entregar (vender o guardar) 5 cuadros fáciles; 🔴 la difícil, tras 10 cuadros de dificultad media.",
  "Paints with the selected color: round or square tip, 6 sizes from 1 px to 44 px": "Pinta con el color elegido: punta redonda o cuadrada, 6 tamaños de 1 px a 44 px",
  "Square / ⚫ Circle / 🔺 Triangle": "Cuadrado / ⚫ Círculo / 🔺 Triángulo",
  "Drag a box to draw a filled shape. Hold Shift for a perfect square or circle. Turn an oval or a triangle to any angle (180° = upside down) with the ↻ slider or the mouse wheel, while drawing it or right after":
    "Arrastra un recuadro para dibujar una forma rellena. Mantén Mayús para un cuadrado o un círculo perfecto. Gira un óvalo o un triángulo a cualquier ángulo (180° = boca abajo) con el control ↻ o la rueda del ratón, mientras lo dibujas o justo después",
  "Fills an area of one color": "Rellena una zona de un solo color",
  "Drag the last shape you drew to move it; pick a color to recolor it (works until you draw or paint something else)": "Arrastra la última forma que dibujaste para moverla; elige un color para cambiárselo (funciona hasta que dibujes o pintes otra cosa)",
  "Undo / 🗑️ Clear": "Deshacer / 🗑️ Borrar", "Takes back the last step / starts over": "Deshace el último paso / empieza de nuevo", "How the match is scored": "Cómo se puntúa el parecido",
  "Sell or keep": "Vender o guardar", "Art Gallery business": "Negocio Galería de arte",
  "With 20 paintings in your collection you can buy the 🏛️ Art Gallery special business (💰 Income tab) for 50 scoin. It earns 250 / sec for every painting in your collection, up to 10.000 / sec. Selling paintings lowers it.":
    "Con 20 cuadros en tu colección puedes comprar el negocio especial 🏛️ Galería de arte (pestaña 💰 Ingresos) por 50 scoin. Gana 250 / s por cada cuadro de tu colección, hasta 10.000 / s. Vender cuadros lo reduce.",
  // 🏆 achievements, 🛍️ shop
  "Finishing every achievement of a category unlocks a cosmetic collection that can't be bought in the Shop. Turn it on in 🏆 Achievements → 🎁 Rewards.":
    "Completar todos los logros de una categoría desbloquea una colección cosmética que no se puede comprar en la Tienda. Actívala en 🏆 Logros → 🎁 Recompensas.",
  "Cosmetics only: they change how the game looks, not how it plays. Each item belongs to a collection and a slot (background, coin or 🃏 cards, which changes the deck in every card game). You can wear one item per slot and switch any time in the Shop.":
    "Solo cosméticos: cambian el aspecto del juego, no cómo se juega. Cada artículo pertenece a una colección y a un hueco (fondo, moneda o 🃏 cartas, que cambia la baraja en todos los juegos de cartas). Puedes llevar un artículo por hueco y cambiarlo cuando quieras en la Tienda.",
  "Wearing the coin and background from the same collection unlocks the 🎨 \"Dressed to impress\" achievement.": "Llevar la moneda y el fondo de la misma colección desbloquea el logro 🎨 «Vestido para impresionar».",
  "Nothing found. Try another word, e.g. a game, a building or a vehicle.": "No se ha encontrado nada. Prueba con otra palabra, por ejemplo un juego, un edificio o un vehículo.",
});
rx(String.raw`(\d+) achievements in (\d+) categories\. They are checked every second, kept forever \(also through prestige\) and shown with progress bars in the 🏆 tab\.`,
  "$1 logros en $2 categorías. Se comprueban cada segundo, se conservan para siempre (también al hacer prestigio) y se muestran con barras de progreso en la pestaña 🏆.");
rx(String.raw`(\d+) workers \+ accountant \+ HR`, "$1 trabajadores + contable + RR. HH.");
rx(String.raw`(${NUM}), then ×2 each`, "$1, luego ×2 cada uno");
rx(String.raw`([\d–]+) \/ sec per worker`, "$1 / s por trabajador");
rx(String.raw`(\d+) min`, "$1 min");
rx(String.raw`(${NUM}) \+ 👩‍🔬 (\d+) scientists`, "$1 + 👩‍🔬 $2 científicos");
rx(String.raw`(\d+)–(\d+) min`, "$1–$2 min");
rx(String.raw`Free (\S+) chip`, "Ficha gratis de $1");
rx(String.raw`Plinko: (${NUM}) – (${NUM})`, "Plinko: $1 – $2");
rx(String.raw`Plinko: Super high rollers: (${NUM}) – (${NUM}) per ball, up to 20 balls at once\. Each ball falls through 12 rows into a slot \(about 98% return\)`,
  "Plinko: súper altas apuestas: $1 – $2 por bola, hasta 20 bolas a la vez. Cada bola cae por 12 filas hasta una casilla (devolución de cerca del 98%)");
rx(String.raw`(\d+) lamp oil( → .*)?`, (m) => m.replace(/(\d+) lamp oil/g, "$1 de aceite"));
rx(String.raw`(?:holds \d+ ore|stone \d|walking costs|\+\d+% ore value|up to \d+ energy|\+1 energy every|rescue keeps|survive one lava).* → .*`,
  (m) => { const parts = m.split(" → ").map(p => esq(p)); return parts.includes(null) ? null : parts.join(" → "); });
rx(String.raw`(\d+) (?:🔍 )?results?`, (m, n) => `${n} ${plural(n, "resultado", "resultados")}`);
rx(String.raw`(\d+)\+ results`, "Más de $1 resultados");
rx(String.raw`🔍 Results for “(.+)”`, "🔍 Resultados de «$1»");
rx(String.raw`Results for “(.+)”`, "Resultados de «$1»");
rx(String.raw`\+25% income from businesses, special businesses and clicks, once\. From the reset you pick it on, every reset keeps your Science buildings \((.+)\), but not the satellite`,
  (m, l) => `+25% de ingresos de negocios, negocios especiales y clics, una vez. Desde el reinicio en que lo eliges, todos los reinicios conservan tus edificios de Ciencia (${l.split(", ").map(x => ES[x] || x).join(", ")}), pero no el satélite`);
Object.assign(ES, { "Research lab": "Laboratorio de investigación", "Astronomy Research Center": "Centro de Investigación Astronómica" });

// wiki sentences with bold words
H("<b>Empire of Coins</b> is an idle tycoon game. Click the coin, build businesses, play the casino, invest, run a logistics empire, and grow your fortune up to <b>1 gcoin</b>, where you can prestige (then 5, 10 and 20 gcoin).",
  "<b>Empire of Coins</b> es un juego de magnates idle. Haz clic en la moneda, monta negocios, juega en el casino, invierte, dirige un imperio logístico y haz crecer tu fortuna hasta <b>1 gcoin</b>, donde puedes hacer prestigio (luego con 5, 10 y 20 gcoin).");
hrx(String.raw`Every second there is a 1 in (\d+) chance of a tax inspection \(and always after (\d+) minutes without one\)\. The bill is <b>(\d+%) of everything you earned in the last (\d+) minutes<\/b>\. You have <b>(\d+) minutes<\/b> to pay it with the red button on 💰 Income, or the red banner at the top of any other tab \(clicking it pays right there\)\. If you can't, the bill grows by (\d+%) and you get (\d+) more minutes\. Miss it again and you get a <b>final warning<\/b>: if your investments \(Broker ETF, ETF, gold, properties\) can cover the rest, you can sell them with a <b>20% fee<\/b> to pay \(only what's needed is sold\)\. If even that isn't enough, it's <b>game over<\/b>\. Bills stack, so keep some money ready\. A Debt &amp; financial lawyer gives part of every tax payment back\.`,
  "Cada segundo hay 1 probabilidad entre $1 de una inspección de Hacienda (y siempre tras $2 minutos sin ninguna). La factura es <b>el $3 de todo lo que has ganado en los últimos $4 minutos</b>. Tienes <b>$5 minutos</b> para pagarla con el botón rojo de 💰 Ingresos o con el aviso rojo de la parte superior de cualquier otra pestaña (al hacer clic se paga allí mismo). Si no puedes, la factura sube un $6 y tienes $7 minutos más. Si vuelves a fallar, recibes un <b>último aviso</b>: si tus inversiones (ETF del bróker, ETF, oro, inmuebles) cubren el resto, puedes venderlas con una <b>comisión del 20%</b> para pagar (solo se vende lo necesario). Si ni eso alcanza, <b>se acaba la partida</b>. Las facturas se acumulan, así que ten dinero preparado. Un abogado financiero te devuelve parte de cada pago de impuestos.");
hrx(String.raw`Every second there is a 1 in (\d+) chance of a tax inspection \(and always after (\d+) minutes without one\)\. The bill is <b>(\d+%) of everything you earned in the last (\d+) minutes<\/b>\. You have <b>(\d+) minutes<\/b> to pay it with the red button on 💰 Income, or the red banner at the top of any other tab \(clicking it pays right there\)\. If you can't, the bill grows by (\d+%) and you get (\d+) more minutes\. Miss it again and you get a <b>final warning<\/b>: if your investments \(Broker ETF, ETF, gold, properties\) can cover the rest, you can sell them with a <b>20% fee<\/b> to pay \(only what's needed is sold\)\. If even that isn't enough, it's <b>game over<\/b>\. Bills stack, so keep some money ready\. A Debt & financial lawyer gives part of every tax payment back\.`,
  "Cada segundo hay 1 probabilidad entre $1 de una inspección de Hacienda (y siempre tras $2 minutos sin ninguna). La factura es <b>el $3 de todo lo que has ganado en los últimos $4 minutos</b>. Tienes <b>$5 minutos</b> para pagarla con el botón rojo de 💰 Ingresos o con el aviso rojo de la parte superior de cualquier otra pestaña (al hacer clic se paga allí mismo). Si no puedes, la factura sube un $6 y tienes $7 minutos más. Si vuelves a fallar, recibes un <b>último aviso</b>: si tus inversiones (ETF del bróker, ETF, oro, inmuebles) cubren el resto, puedes venderlas con una <b>comisión del 20%</b> para pagar (solo se vende lo necesario). Si ni eso alcanza, <b>se acaba la partida</b>. Las facturas se acumulan, así que ten dinero preparado. Un abogado financiero te devuelve parte de cada pago de impuestos.");
H("When the money on hand reaches <b>1 gcoin</b> (1st prestige), <b>5 gcoin</b> (2nd), <b>10 gcoin</b> (3rd) or <b>20 gcoin</b> (4th), you can reset the game for a permanent Legacy bonus (max 4 prestiges; the 4th finishes the game, but you can keep playing). After every prestige there are <b>no tax inspections for the first 10 minutes</b>, whichever bonus you pick. <b>Always kept:</b> achievements, Gambler, Investor and Logistics levels, cosmetics, statistics, free bet chips, the 🖼️ Art Gallery unlock, its collection slots and your paintings.",
  "Cuando el dinero en mano llega a <b>1 gcoin</b> (1.er prestigio), <b>5 gcoin</b> (2.º), <b>10 gcoin</b> (3.º) o <b>20 gcoin</b> (4.º), puedes reiniciar la partida a cambio de una bonificación de Legado permanente (máx. 4 prestigios; el 4.º termina el juego, pero puedes seguir jugando). Tras cada prestigio <b>no hay inspecciones de Hacienda durante los 10 primeros minutos</b>, elijas la bonificación que elijas. <b>Siempre se conservan:</b> logros, niveles de jugador, inversor y logística, cosméticos, estadísticas, fichas de apuesta gratis, el desbloqueo de la 🖼️ Galería de arte, sus huecos de colección y tus cuadros.");
H("The game counts real time: in a background tab it earns at full speed (it catches up when the browser wakes it). When the game is closed (or the computer sleeps) for more than 5 minutes, you get <b>offline earnings</b> when you come back: up to 8 hours count, and businesses, special businesses, gold mines and rent pay 50%. Contracts on their way, free bet chips and VIP chips keep their timers running. Nothing random happens while you're away (no taxes, crashes, breakdowns or market moves), and Logistics agents only start new contracts while the game is open.",
  "El juego cuenta el tiempo real: en una pestaña en segundo plano gana a toda velocidad (se pone al día cuando el navegador la despierta). Si el juego está cerrado (o el ordenador en reposo) más de 5 minutos, al volver recibes <b>ganancias sin conexión</b>: cuentan hasta 8 horas, y los negocios, negocios especiales, minas de oro y alquileres pagan el 50%. Los contratos en camino, las fichas de apuesta gratis y las fichas VIP siguen con sus temporizadores. Mientras no estás no pasa nada al azar (ni impuestos, ni desplomes, ni averías, ni movimientos del mercado), y los agentes logísticos solo empiezan contratos nuevos con el juego abierto.");
H("👩‍🔬 <b>Scientists are a resource:</b> the Research lab costs 20 scientists and the Space Mission Center 50. They leave your University, which then trains new ones (1 every 2 minutes) and costs money again until it's back to 50.",
  "👩‍🔬 <b>Los científicos son un recurso:</b> el laboratorio de investigación cuesta 20 científicos y el Centro de Misiones Espaciales 50. Se van de tu universidad, que entonces forma otros nuevos (1 cada 2 minutos) y vuelve a costar dinero hasta llegar otra vez a 50.");
H("👩‍🔬 <b>Scientists are a resource:</b> the Research lab costs 20 scientists and the Space Mission Center 50, the 🔭 Astronomy Research Center 20 and the 🛸 Orbital Space Station 100, the 🌕 Moon Base 150 and the 🧬 Genetics Laboratory 75 and the 🔴 Mars Base 150. They leave your University, which then trains new ones (1 every 2 minutes) and costs money again until it's back to 50.",
  "👩‍🔬 <b>Los científicos son un recurso:</b> el laboratorio de investigación cuesta 20 científicos, el Centro de Misiones Espaciales 50, el 🔭 Centro de Investigación Astronómica 20, la 🛸 Estación Espacial Orbital 100, la 🌕 Base Lunar 150, el 🧬 Laboratorio de genética 75 y la 🔴 Base en Marte 150. Se van de tu universidad, que entonces forma otros nuevos (1 cada 2 minutos) y vuelve a costar dinero hasta llegar otra vez a 50.");
H("Move money into <b>casino chips</b> at the top of the Casino tab, play, then cash out. Most games have Classic, High roller and Super high roller tables. Bets give <b>Gambler XP</b> (bet × the table's XP multiplier) and you get <b>cashback</b> on lost bets (0.1% per Gambler level, +5% per Criminal defense lawyer). Random results use your browser's secure random generator.",
  "Pasa dinero a <b>fichas del casino</b> en la parte superior de la pestaña Casino, juega y luego retíralo. La mayoría de juegos tienen mesas clásicas, de altas apuestas y de súper altas apuestas. Las apuestas dan <b>XP de jugador</b> (apuesta × el multiplicador de XP de la mesa) y recibes un <b>reembolso</b> de las apuestas perdidas (0,1% por nivel de jugador, +5% por cada abogado penalista). Los resultados al azar usan el generador aleatorio seguro de tu navegador.");
hrx(String.raw`Every 20 minutes one game type becomes <b>hot<\/b>: for 10 minutes <b>all<\/b> its tables get a bonus on their XP multiplier, then there are 10 minutes with no bonus\. The bonus grows with your 🎲 Gambler level: <b>\+10<\/b> \(levels 1–49\), <b>\+20<\/b> from level 50, <b>\+40<\/b> from level 75 \(you get \+(\d+) now; High roller Blackjack ×4 becomes ×(\d+)\)\. The hot game is chosen at random and is never the same twice in a row\. The timer is shown under your Gambler level, together with the next hot game\.`,
  "Cada 20 minutos un tipo de juego se pone <b>caliente</b>: durante 10 minutos <b>todas</b> sus mesas reciben una bonificación en su multiplicador de XP, y luego hay 10 minutos sin bonificación. La bonificación crece con tu nivel de 🎲 jugador: <b>+10</b> (niveles 1–49), <b>+20</b> desde el nivel 50, <b>+40</b> desde el nivel 75 (ahora tienes +$1; el blackjack de altas apuestas ×4 pasa a ×$2). El juego caliente se elige al azar y nunca se repite dos veces seguidas. El temporizador se muestra bajo tu nivel de jugador, junto con el siguiente juego caliente.");
H("6-deck shoe, the dealer stands on 17. <b>Blackjack pays 3:2</b>, other wins 1:1, ties push.", "Zapato de 6 barajas, la banca se planta con 17. <b>El blackjack paga 3:2</b>, el resto de premios 1:1, los empates devuelven la apuesta.");
H("<b>Double</b> on any first two cards (one more card). <b>Split</b> pairs once per seat; split aces get one card each.", "<b>Doblar</b> con cualquiera de las dos primeras cartas (una carta más). <b>Separar</b> parejas una vez por asiento; los ases separados reciben una carta cada uno.");
H("<b>Surrender</b> a first-two-card hand to get half your bet back. <b>Insurance</b> (half your bet) pays 2:1 when the dealer shows an Ace and has blackjack.", "<b>Rendirse</b> con las dos primeras cartas para recuperar la mitad de tu apuesta. El <b>seguro</b> (la mitad de tu apuesta) paga 2:1 cuando la banca muestra un as y tiene blackjack.");
hrx(String.raw`Video Poker: Classic table: (${NUM}) – (${NUM})<br>Video Poker: High rollers: (${NUM}) – (${NUM})<br>Video Poker: Super high rollers: (${NUM}) – (${NUM})\. 53 cards with one wild joker\. Get 5 cards, hold the ones you like, draw new ones for the rest\. Pays from a pair of Jacks or better\. <b>Jackpot<\/b> = 50× the table's max bet; your share is your bet ÷ the max bet\. About 98% return with perfect play\.`,
  "Videopóquer: mesa clásica: $1 – $2<br>Videopóquer: altas apuestas: $3 – $4<br>Videopóquer: súper altas apuestas: $5 – $6. 53 cartas con un comodín. Recibes 5 cartas, guardas las que quieras y cambias el resto. Paga desde una pareja de jotas o más. <b>Bote</b> = 50× la apuesta máxima de la mesa; tu parte es tu apuesta ÷ la apuesta máxima. Devuelve cerca del 98% jugando perfecto.");
hrx(String.raw`🔒 Unlocks at <b>Gambler level 20<\/b>\. Baccarat: Classic table: (${NUM}) – (${NUM})<br>Baccarat: High rollers: (${NUM}) – (${NUM})<br>Baccarat: Super high rollers: (${NUM}) – (${NUM}) per betting spot\. 8-deck shoe\.`,
  "🔒 Se desbloquea en el <b>nivel de jugador 20</b>. Baccarat: mesa clásica: $1 – $2<br>Baccarat: altas apuestas: $3 – $4<br>Baccarat: súper altas apuestas: $5 – $6 por casilla. Zapato de 8 barajas.");
H("Two hands are dealt, <b>Player</b> and <b>Banker</b>. The one closest to 9 wins. A = 1, 2–9 count as shown, 10/J/Q/K = 0, and only the last digit counts (7 + 8 = 5).",
  "Se reparten dos manos, <b>Jugador</b> y <b>Banca</b>. Gana la que más se acerque a 9. A = 1, del 2 al 9 valen lo que marcan, 10/J/Q/K = 0, y solo cuenta la última cifra (7 + 8 = 5).");
H("Nobody makes choices: a third card is drawn by the standard casino rules. An 8 or 9 in the first two cards is a <b>natural</b> and ends the hand.",
  "Nadie decide nada: la tercera carta se saca según las reglas estándar del casino. Un 8 o un 9 con las dos primeras cartas es un <b>natural</b> y termina la mano.");
H("Best 5 of 7 cards vs the dealer. <b>Play</b> pays 1:1 if you win. <b>Ante</b> pays 1:1, but pushes if the dealer has less than a pair. <b>Blind</b> pays the table below when you win with a straight or better (otherwise pushes on a win). Ties push. Folding loses Ante and Blind.",
  "Las 5 mejores de 7 cartas contra la banca. <b>Jugar</b> paga 1:1 si ganas. El <b>ante</b> paga 1:1, pero empata si la banca tiene menos de una pareja. La <b>ciega</b> paga según la tabla de abajo cuando ganas con escalera o mejor (si no, empata al ganar). Los empates devuelven la apuesta. Retirarse pierde el ante y la ciega.");
H("<b>Trips</b> pays on your own hand, even if you fold.", "<b>Trips</b> paga según tu propia mano, aunque te retires.");
hrx(String.raw`🔒 Unlocks after your <b>1st prestige<\/b> and at <b>Gambler level 40<\/b>\. High rollers: (${NUM}) – (${NUM}) · Super high rollers: (${NUM}) – (${NUM}) per spin\. A 7×7 grid of specimens\.`,
  "🔒 Se desbloquea tras tu <b>1.er prestigio</b> y en el <b>nivel de jugador 40</b>. Altas apuestas: $1 – $2 · Súper altas apuestas: $3 – $4 por tirada. Una cuadrícula de 7×7 especímenes.");
H("<b>Clusters</b> of 5 or more of the same specimen touching up, down, left or right (not diagonal) pay. Winners pop, the rest fall and new ones drop in, which can win again (<b>tumbles</b>).",
  "Pagan los <b>grupos</b> de 5 o más especímenes iguales que se tocan arriba, abajo, a la izquierda o a la derecha (no en diagonal). Los ganadores explotan, el resto cae y entran otros nuevos, que pueden volver a ganar (<b>cascadas</b>).");
H("🔬 <b>Lab spots</b>: a square where a winner popped is marked; each later win popping there doubles it: ×2, ×4, ×8 … ×128. Spots inside one cluster are <b>added</b> and multiply that cluster's pay. They reset after each paid spin.",
  "🔬 <b>Casillas de laboratorio</b>: la casilla donde explota un ganador queda marcada; cada premio posterior que explote allí la duplica: ×2, ×4, ×8 … ×128. Las casillas de un mismo grupo <b>se suman</b> y multiplican el premio de ese grupo. Se reinician tras cada tirada pagada.");
H("🧪 <b>DNA vials</b>: 3 / 4 / 5 / 6 / 7 on the grid at the end of a spin give 10 / 12 / 15 / 20 / 30 <b>free spins</b>. In free spins the lab spots stay for the whole bonus, and vials can add more free spins.",
  "🧪 <b>Viales de ADN</b>: 3 / 4 / 5 / 6 / 7 en la cuadrícula al terminar una tirada dan 10 / 12 / 15 / 20 / 30 <b>tiradas gratis</b>. En las tiradas gratis las casillas de laboratorio se mantienen durante todo el bono, y los viales pueden sumar más tiradas.");
hrx(String.raw`🛒 <b>Buy free spins<\/b>: pay ([\d.,]+)× the bet to start the bonus at once \(mostly 10 free spins, sometimes more\)\. It also returns about 99% but swings a lot: half of bought bonuses pay under 15× the bet\.`,
  (m, x) => `🛒 <b>Comprar tiradas gratis</b>: paga ${decFix(x)}× la apuesta para empezar el bono enseguida (casi siempre 10 tiradas gratis, a veces más). También devuelve cerca del 99%, pero varía mucho: la mitad de los bonos comprados pagan menos de 15× la apuesta.`);
hrx(String.raw`Classic: (${NUM}) – (${NUM}) · High rollers: (${NUM}) – (${NUM})\. A bag has 28 balls: 19 green, 8 red, 1 gold, not put back during a round\. Green climbs one step, gold climbs one step and gives a shield against the next red, red pops your balloon \(you lose what is still riding\)\. After each step: <b>cash out<\/b>, <b>take half<\/b> \(once per round\), or <b>draw again<\/b>\. About 97\.7% return with perfect play\.`,
  "Clásica: $1 – $2 · Altas apuestas: $3 – $4. La bolsa tiene 28 bolas: 19 verdes, 8 rojas y 1 dorada, que no se devuelven durante la ronda. La verde sube un peldaño, la dorada sube un peldaño y da un escudo contra la siguiente roja, y la roja pincha tu globo (pierdes lo que siga en juego). Tras cada peldaño: <b>retirar</b>, <b>llevarte la mitad</b> (una vez por ronda) o <b>sacar otra</b>. Devuelve cerca del 97,7% jugando perfecto.");
H("XP for every delivered contract: contract minutes × 1 (truck), × 3 (tanker), × 6 (plane). The level unlocks the <b>Logistics agents</b>: turn one on and it picks a random contract 5 seconds after the offers appear, for 2% of that contract's profit. The 🏬 Logistics Center (Logistics level 20) upgrades all agents: 1% fee, the most profitable contract, and picks after 3 seconds.",
  "XP por cada contrato entregado: minutos del contrato × 1 (camión), × 3 (petrolero), × 6 (avión). El nivel desbloquea los <b>agentes logísticos</b>: activa uno y elegirá un contrato al azar 5 segundos después de que aparezcan las ofertas, por el 2% del beneficio de ese contrato. El 🏬 Centro logístico (nivel de logística 20) mejora a todos los agentes: comisión del 1%, el contrato más rentable y elección a los 3 segundos.");
H("At the end of a run you choose: <b>💰 sell</b> your ore, or <b>🏦 keep it in the vault</b>. Your vault (shown under the energy) pays for upgrades, and you can still sell vault ore later at its normal value (no gold rush bonus). If you're rescued, the team saves 50% of your ore (65% / 80% with insurance), starting with the most valuable piece.",
  "Al final de cada partida eliges: <b>💰 vender</b> tu mineral o <b>🏦 guardarlo en la cámara</b>. Tu cámara (debajo de la energía) paga las mejoras, y aún puedes vender su mineral más tarde a su valor normal (sin la bonificación de fiebre del oro). Si te rescatan, el equipo salva el 50% de tu mineral (65% / 80% con seguro), empezando por la pieza más valiosa.");
H("Copy a painting as closely as you can. The closer the match, the more your copy is worth. After you earn the 💵 Millionaire achievement (1 scoin on hand), the gallery can be opened for <b>500.000</b>.",
  "Copia un cuadro lo más fielmente que puedas. Cuanto más se parezca, más vale tu copia. Cuando consigues el logro 💵 Millonario (1 scoin en mano), puedes abrir la galería por <b>500.000</b>.");
H("Your copy is worth <b>match % × the full value</b>: an 80% copy of a Hard painting is worth 80 scoin. A copy under <b>50%</b> can't be sold or kept: keep working on it or start a new one. There is no timer.",
  "Tu copia vale <b>% de parecido × el valor completo</b>: una copia al 80% de un cuadro difícil vale 80 scoin. Una copia por debajo del <b>50%</b> no se puede vender ni guardar: sigue trabajando en ella o empieza otra. No hay límite de tiempo.");
H("Your copy is judged three ways: <b>🎨 Colors</b> (each part has the right color), <b>📐 Layout</b> (things are in the right places) and <b>🔷 Shapes found</b>: every separate shape in the original (each planet, star, sail, sun…) must appear in your copy in the same color, in about the same place and size. Brush strokes count as shapes too (a painted arm or branch is one shape), and if your whole drawing is a bit shifted, the shapes are lined up before they're compared. The shape count is worth the most, so painting only the background (sky, sea, space) scores low; drawing every object scores high. Extra scribbles cost points, small wobbles are forgiven, and an empty canvas scores 0%.",
  "Tu copia se juzga de tres formas: <b>🎨 Colores</b> (cada parte tiene el color correcto), <b>📐 Composición</b> (las cosas están en su sitio) y <b>🔷 Formas encontradas</b>: cada forma separada del original (cada planeta, estrella, vela, sol…) debe aparecer en tu copia con el mismo color y más o menos en el mismo sitio y tamaño. Los trazos de pincel también cuentan como formas (un brazo o una rama pintados son una forma), y si todo tu dibujo está un poco desplazado, las formas se alinean antes de compararlas. Las formas son lo que más cuenta, así que pintar solo el fondo (cielo, mar, espacio) puntúa poco; dibujar cada objeto puntúa mucho. Los garabatos de más restan puntos, los pequeños temblores se perdonan y un lienzo vacío puntúa 0%.");
H("After submitting, <b>sell</b> the copy for its value right away, or <b>keep</b> it in your 🖼️ Collection (no money now; sell it there any time for the same value). The collection starts with 10 slots; each +10 slots costs 500.000, then 750.000, 1 scoin… up to a maximum of 100 slots. A prestige keeps the gallery unlocked, your bought slots and all your paintings; only the 🏛️ Art Gallery business is reset (buy it again to earn from the paintings).",
  "Tras entregarla, <b>vende</b> la copia por su valor enseguida o <b>guárdala</b> en tu 🖼️ Colección (sin dinero ahora; véndela allí cuando quieras por el mismo valor). La colección empieza con 10 huecos; cada +10 huecos cuesta 500.000, luego 750.000, 1 scoin… hasta un máximo de 100 huecos. Un prestigio conserva la galería desbloqueada, los huecos comprados y todos tus cuadros; solo se reinicia el negocio 🏛️ Galería de arte (cómpralo otra vez para ganar con los cuadros).");
/* ---------- wiki: 🧬 Gene Splicer and leftovers ---------- */
Object.assign(ES, {
  "Straight up": "Pleno", "Split bet": "Caballo", "Taxes": "Impuestos", "Search the wiki (e.g. tanker, jackpot, Nobel)…": "Busca en la wiki (p. ej., petrolero, bote, Nobel)…", "Search the wiki": "Buscar en la wiki", "Rarity": "Rareza", "First discovery pays": "El primer descubrimiento paga",
  "Splicing a species you already know pays nothing, but gives you one more DNA sample of it. The reward uses the same income base as the Gold Mine Dig.":
    "Empalmar una especie que ya conoces no paga nada, pero te da una muestra más de su ADN. El premio usa la misma base de ingresos que la mina de oro.",
  "per spot.": "por casilla.", "per hand. Play up to 3 seats.": "por mano. Juega hasta 3 asientos.",
  "Ante per seat. Play 1 or 2 seats. Ante + equal Blind, optional Trips.": "de ante por asiento. Juega 1 o 2 asientos. Ante + una ciega igual, Trips opcional.",
});
rx(String.raw`(\d+) min of income`, "$1 min de ingresos");
hrx(String.raw`Opens when you buy the 🧬 Genetics Laboratory \(🔬 Science\) and stays open for good, even after a prestige\. You start with 5 DNA samples: 🧑 Human, 🐟 Fish, 🦎 Lizard, 🕷️ Spider and 🌱 Plant\. Put two samples in the splicer \(the same one twice works too\): if they make a species, it goes into your ❄️ freezer and becomes a new sample to splice with\. There are (\d+) species to find\.`,
  "Se abre al comprar el 🧬 Laboratorio de genética (🔬 Ciencia) y sigue abierto para siempre, incluso tras un prestigio. Empiezas con 5 muestras de ADN: 🧑 Humano, 🐟 Pez, 🦎 Lagarto, 🕷️ Araña y 🌱 Planta. Pon dos muestras en el empalmador (también vale la misma dos veces): si forman una especie, va a tu ❄️ congelador y se convierte en una muestra nueva para empalmar. Hay $1 especies por descubrir.");
hrx(String.raw`🧪 <b>DNA:<\/b> you can hold up to (\d+) samples of each species\. Every 10 minutes every species you know gets \+1 \(also while you are away\)\. A splice uses 1 of each sample \(2 if both are the same\)\.`,
  "🧪 <b>ADN:</b> puedes tener hasta $1 muestras de cada especie. Cada 10 minutos todas las especies que conoces reciben +1 (también mientras no estás). Un empalme usa 1 de cada muestra (2 si son la misma).");
hrx(String.raw`🧪 <b>Mutations:<\/b> two samples that don't make a real species make a <b>mutant<\/b> instead, named after its parents \(🕷️ Spider \+ 🌳 Tree = Spidree\)\. It pays (\d+) sec of income the first time and goes in your 🧪 Mutant jar\. Mutants can't be spliced again, and each pair makes its mutant only once\.`,
  "🧪 <b>Mutaciones:</b> dos muestras que no forman una especie real crean en su lugar un <b>mutante</b>, con un nombre sacado de sus padres (🕷️ Araña + 🌳 Árbol = Spidree). Paga $1 s de ingresos la primera vez y va a tu 🧪 tarro de mutantes. Los mutantes no se pueden volver a empalmar, y cada pareja crea su mutante una sola vez.");
H("🏆 <b>Species bonuses</b> (for good, +1% for every species you discover in that category): 🐟 Aquatic → tanker contracts, 🐦 Birds → cargo plane contracts, 🐾 Mammals → truck contracts, 🐉 Mythical → space and deep space mission rewards, 🦕 Extinct → Art Gallery income, 🕷️ Bugs → ore sold in the Gold Mine Dig.",
  "🏆 <b>Bonificaciones de especies</b> (para siempre, +1% por cada especie que descubras en esa categoría): 🐟 Acuáticos → contratos de petroleros, 🐦 Aves → contratos de aviones de carga, 🐾 Mamíferos → contratos de camiones, 🐉 Míticas → premios de misiones espaciales y al espacio profundo, 🦕 Extintas → ingresos de la Galería de arte, 🕷️ Bichos → mineral vendido en la mina de oro.");
H("🔎 <b>Unfound partners:</b> each sample in your freezer shows how many new species you can still make with it and the samples you already have (\"3 unfound\"), or \"🔒 later\" when the rest need a sample you haven't found yet. Mutants never count, and hints only show real recipes.",
  "🔎 <b>Parejas sin descubrir:</b> cada muestra de tu congelador indica cuántas especies nuevas puedes crear aún con ella y las muestras que ya tienes («3 sin descubrir»), o «🔒 más adelante» cuando el resto necesita una muestra que aún no has encontrado. Los mutantes nunca cuentan, y las pistas solo muestran recetas reales.");
hrx(String.raw`💡 <b>Hints:<\/b> spend (\d+) scientists from your Universities to reveal one recipe you can make right now\. The 📖 Codex shows every species you've found and how you made it\.`,
  "💡 <b>Pistas:</b> gasta $1 científicos de tus universidades para revelar una receta que puedas hacer ahora mismo. El 📖 Códice muestra todas las especies que has encontrado y cómo las creaste.");

rx(String.raw`Opens when you buy the 🧬 Genetics Laboratory \(🔬 Science\) and stays open for good, even after a prestige\. You start with 5 DNA samples: 🧑 Human, 🐟 Fish, 🦎 Lizard, 🕷️ Spider and 🌱 Plant\. Put two samples in the splicer \(the same one twice works too\): if they make a species, it goes into your ❄️ freezer and becomes a new sample to splice with\. There are (\d+) species to find\.`,
  "Se abre al comprar el 🧬 Laboratorio de genética (🔬 Ciencia) y sigue abierto para siempre, incluso tras un prestigio. Empiezas con 5 muestras de ADN: 🧑 Humano, 🐟 Pez, 🦎 Lagarto, 🕷️ Araña y 🌱 Planta. Pon dos muestras en el empalmador (también vale la misma dos veces): si forman una especie, va a tu ❄️ congelador y se convierte en una muestra nueva para empalmar. Hay $1 especies por descubrir.");
Object.assign(ES, { "High rollers": "Altas apuestas", "Super high rollers": "Súper altas apuestas" });

H("🌐 The 📖 Wiki, the ⭐ prestige screens and the special business details are now in <b>Español</b> too. The Wiki search finds Spanish words when the game is in Spanish.",
  "🌐 La 📖 Wiki, las pantallas de ⭐ prestigio y los detalles de los negocios especiales ya están también en <b>español</b>. El buscador de la Wiki encuentra palabras en español cuando el juego está en español.");

H("🎰 <b>Clear bets</b> now also empties the table after a finished hand (Baccarat and Blackjack), and <b>Repeat last bets</b> places your free bet chips again first when the last bet used them, paying only the rest from your chips.",
  "🎰 <b>Quitar apuestas</b> ahora también vacía la mesa tras una mano terminada (baccarat y blackjack), y <b>Repetir últimas apuestas</b> vuelve a usar primero tus fichas de apuesta gratis si la última apuesta las usó, y solo paga el resto con tus fichas.");

Object.assign(ES, {
  "Dealer shows an Ace. Insurance pays 2:1 if the dealer has blackjack.": "La banca muestra un as. El seguro paga 2:1 si la banca tiene blackjack.",
  "Only with recipes": "Solo con recetas", "No sample can make a new species right now.": "Ahora mismo ninguna muestra puede crear una especie nueva.",
  "Show only samples that can still make a new species with what you have (hides ✓ done and 🔒 later)": "Muestra solo las muestras que aún pueden crear una especie nueva con lo que tienes (oculta ✓ completo y 🔒 más adelante)",
});

rx(String.raw`You have: (.+)`, (m, h) => { const x = esq(h); return x == null ? null : `Tienes: ${x}`; });
H("🧬 <b>Gene Splicer</b>: a new <b>🔎 Only with recipes</b> button in the freezer shows only the samples that can still make a new species with what you have.",
  "🧬 <b>Empalmador genético</b>: un nuevo botón <b>🔎 Solo con recetas</b> en el congelador muestra solo las muestras que aún pueden crear una especie nueva con lo que tienes.");

Object.assign(ES, {
  "Win 500 Blackjack hands": "Gana 500 manos de blackjack",
  "Play 500 Ultimate Texas Hold'em hands (each seat you bet on counts)": "Juega 500 manos de Ultimate Texas Hold'em (cuenta cada asiento en el que apuestas)",
  "Unlock 🤠 Ultimate Texas Hold'em veteran (500 hands)": "Desbloquea 🤠 Veterano del Ultimate Texas Hold'em (500 manos)",
});
H("🏆 Easier goals: <b>Blackjack legend</b> now needs 500 won hands, and <b>Ultimate Texas Hold'em veteran</b> 500 hands played.",
  "🏆 Objetivos más fáciles: <b>Leyenda del blackjack</b> ahora pide 500 manos ganadas, y <b>Veterano del Ultimate Texas Hold'em</b>, 500 manos jugadas.");

rx(String.raw`🎫 VIP chip from the ⭐ VIP Coins prestige bonus: a free 500 scoin bet chip every (\d+) min\. It goes into the same 500 scoin pile as the slot next to it \(you have (\d+), max (\d+)\)\.`,
  "🎫 Ficha VIP de la bonificación de prestigio ⭐ Monedas VIP: una ficha de apuesta gratis de 500 scoin cada $1 min. Va al mismo montón de 500 scoin que la casilla de al lado (tienes $2, máx. $3).");

Object.assign(ES, {
  "🔒 Unlocks when you choose ⭐ VIP Coins as a prestige bonus (from 1 gcoin): a free 500 scoin bet chip every 10 min, all free chips twice as fast, and room for 200 chips of 500 scoin.":
    "🔒 Se desbloquea al elegir ⭐ Monedas VIP como bonificación de prestigio (desde 1 gcoin): una ficha de apuesta gratis de 500 scoin cada 10 min, todas las fichas gratis el doble de rápido y espacio para 200 fichas de 500 scoin.",
});
rx(String.raw`Free (\S+) bet chip: a new one every ([\d.,]+) min( \(🎟️ VIP: twice as fast\))?, even while the game is closed \(max (\d+)\)\. Unlocked at Gambler level (\d+)\.`,
  (m, c, g, v, x, l) => `Ficha de apuesta gratis de ${c}: una nueva cada ${decFix(g)} min${v ? " (🎟️ VIP: el doble de rápido)" : ""}, también con el juego cerrado (máx. ${x}). Desbloqueada en el nivel de jugador ${l}.`);
H("🎟️ <b>VIP Coins</b> prestige bonus: you can now hold up to <b>200</b> free 500 scoin chips instead of 100.",
  "🎟️ Bonificación de prestigio <b>Monedas VIP</b>: ahora puedes tener hasta <b>200</b> fichas gratis de 500 scoin en vez de 100.");

/* ===================== 📡 LIVE TRADING (positions, limit orders, take profit / stop loss) and 🚚 freight shares ===================== */
const SIDE_ES = (s) => (s === "Long" ? "Largo" : "Corto");
Object.assign(ES, {
  "Position": "Posición", "Size": "Tamaño", "Entry": "Entrada", "Now": "Ahora", "Liquidation": "Liquidación", "Auto-close": "Cierre automático",
  "Open for": "Abierta", "Live price": "Precio en vivo", "24h": "24 h", "Worth": "Valor", "Open profit / loss": "Beneficio / pérdida abierto",
  "Recent trades:": "Operaciones recientes:", "Crypto": "Cripto", "Market": "A mercado", "Limit": "Límite", "Limit price": "Precio límite",
  "Take profit": "Toma de beneficios", "Stop loss": "Stop loss", "Limit order": "Orden límite", "Opens at": "Se abre a", "Waiting for": "Esperando",
  "Save": "Guardar", "Set take profit / stop loss": "Fijar toma de beneficios / stop loss", "Take profit / 🛑 Stop loss": "Toma de beneficios / 🛑 Stop loss",
  "Open now at the live price": "Abrir ya al precio en vivo", "Open when the price reaches your limit": "Abrir cuando el precio llegue a tu límite",
  "Close by itself when the profit (after the closing fee) reaches this % of the money you put in": "Se cierra sola cuando el beneficio (tras la comisión de cierre) llega a este % del dinero que pusiste",
  "Close by itself when the loss (after the closing fee) reaches this % of the money you put in": "Se cierra sola cuando la pérdida (tras la comisión de cierre) llega a este % del dinero que pusiste",
  "The position closes by itself when its profit or loss (after the closing fee) reaches this % of the money you put in. Leave a box empty to turn it off.":
    "La posición se cierra sola cuando su beneficio o pérdida (tras la comisión de cierre) llega a este % del dinero que pusiste. Deja una casilla vacía para desactivarla.",
  "Enter the limit price.": "Escribe el precio límite.", "No live price right now: trading is paused.": "Ahora no hay precio en vivo: el trading está en pausa.",
  "You can have at most 10 limit orders.": "Puedes tener como máximo 10 órdenes límite.",
  "A Long limit must be below the current price (it opens when the price drops to it).": "Un límite en largo debe estar por debajo del precio actual (se abre cuando el precio baja hasta él).",
  "A Short limit must be above the current price (it opens when the price rises to it).": "Un límite en corto debe estar por encima del precio actual (se abre cuando el precio sube hasta él).",
  "The position is already past that profit: close it instead, or pick a higher %.": "La posición ya ha superado ese beneficio: ciérrala o elige un % más alto.",
  "The position is already past that loss: close it instead, or pick a bigger %.": "La posición ya ha superado esa pérdida: ciérrala o elige un % mayor.",
  "Take profit must be between 1% and 10000%.": "La toma de beneficios debe estar entre el 1% y el 10000%.", "Stop loss must be between 1% and 95%.": "El stop loss debe estar entre el 1% y el 95%.",
  "Minimum trade is": "La operación mínima es de", "no liquidation": "sin liquidación",
  // freight shares
  "Global Freight Co. shares": "Acciones de Global Freight Co.", "Freight shares": "Acciones de transporte", "Your shares": "Tus acciones",
  "Deliveries · last 20 s": "Entregas · últimos 20 s", "Buy shares": "Comprar acciones", "Sell all": "Vender todo", "No shares to sell.": "No tienes acciones que vender.",
  "Unlocks with 🚢 Logistics (buy your first Car Salon).": "Se desbloquea con 🚢 Logística (compra tu primer concesionario).",
});
rx(String.raw`(Long|Short) ×(\d+)`, (m, s, l) => `${SIDE_ES(s)} ×${l}`);
rx(String.raw`(Place limit|Open) (Long|Short) ×(\d+)`, (m, a, s, l) => `${a === "Open" ? "Abrir" : "Orden límite"} ${SIDE_ES(s).toLowerCase()} ×${l}`);
rx(String.raw`● Live \((Binance|Coinbase)\)`, "● En directo ($1)");
rx(String.raw`Live \((Binance|Coinbase)\)`, "En directo ($1)");
rx(String.raw`(\d+)-candle moving average`, "Media móvil de $1 velas");
rx(String.raw`Waiting for (1-minute|5-minute|15-minute|4-hour) candles…`, (m, t) => `Esperando velas de ${{ "1-minute": "1 minuto", "5-minute": "5 minutos", "15-minute": "15 minutos", "4-hour": "4 horas" }[t]}…`);
rx(String.raw`Opened (Long|Short) ×(\d+) at ([\d.,]+) \(fee (${NUM})\)( · \+(\d+) XP)?\.`, (m, s, l, p, f, x, n) => `Abierto ${SIDE_ES(s).toLowerCase()} ×${l} a ${p} (comisión ${f})${x ? ` · +${n} XP` : ""}.`);
rx(String.raw`(🎯 |🛑 )?Closed (Long|Short) ×(\d+) for (${NUM}) \(fee (${NUM})\) · (profit \+|loss −)(${NUM})( · \+(\d+) XP)?\.`,
  (m, w, s, l, g, f, k, r, x, n) => `${w || ""}Cerrado ${SIDE_ES(s).toLowerCase()} ×${l} por ${g} (comisión ${f}) · ${k === "profit +" ? "beneficio +" : "pérdida −"}${r}${x ? ` · +${n} XP` : ""}.`);
rx(String.raw`Position size (${NUM}) · fee (${NUM})(.*)`, (m, a, f, rest) => {
  const r = rest.replace(/ · liquidated at ([\d.,]+) \((\d+)% (drop|rise)\)/, (q, p, n, d) => ` · liquidación a ${p} (${d === "drop" ? "bajada" : "subida"} del ${n}%)`)
    .replace(" · no liquidation", " · sin liquidación").replace(/ · opens at ([\d.,]+)/, " · se abre a $1");
  return `Tamaño de la posición ${a} · comisión ${f}${r}`;
});
rx(String.raw`(?:⏳ )?(Enter a price below|Enter a price above) ([\d.,]+): the position opens when the price (drops|rises) to it\.`,
  (m, a, p, d) => `${/below/.test(a) ? "Escribe un precio por debajo de" : "Escribe un precio por encima de"} ${p}: la posición se abre cuando el precio ${d === "drops" ? "baja" : "sube"} hasta él.`);
rx(String.raw`Limit order placed: (Long|Short) ×(\d+) with (${NUM}) when the price reaches ([\d.,]+)\.`, (m, s, l, a, p) => `Orden límite colocada: ${SIDE_ES(s).toLowerCase()} ×${l} con ${a} cuando el precio llegue a ${p}.`);
rx(String.raw`Limit order cancelled: (${NUM}) back to your money\.`, "Orden límite cancelada: $1 vuelven a tu dinero.");
rx(String.raw`Limit order filled: (\w+) (Long|Short) ×(\d+)`, (m, c, s, l) => `Orden límite ejecutada: ${c} ${SIDE_ES(s).toLowerCase()} ×${l}`);
rx(String.raw`Opened at ([\d.,]+) with (${NUM}) \(fee (${NUM})\)\.`, "Abierta a $1 con $2 (comisión $3).");
rx(String.raw`(Take profit|Stop loss): (\w+) (Long|Short) ×(\d+) closed`, (m, k, c, s, l) => `${k === "Take profit" ? "Toma de beneficios" : "Stop loss"}: ${c} ${SIDE_ES(s).toLowerCase()} ×${l} cerrada`);
rx(String.raw`Closed at ([\d.,]+) for (${NUM}) · (profit \+|loss −)(${NUM})\.`, (m, p, g, k, r) => `Cerrada a ${p} por ${g} · ${k === "profit +" ? "beneficio +" : "pérdida −"}${r}.`);
rx(String.raw`Liquidated: (\w+) (Long|Short) ×(\d+)`, (m, c, s, l) => `Liquidada: ${c} ${SIDE_ES(s).toLowerCase()} ×${l}`);
rx(String.raw`Stop loss must be bigger than the trading fees \(([\d.,]+)%\)\.`, (m, f) => `El stop loss debe ser mayor que las comisiones de trading (${decFix(f)}%).`);
rx(String.raw`entry ([\d.,]+) · put in (${NUM})`, "entrada $1 · pusiste $2");
hrx(String.raw`<span>(?:▲ |▼ )?(?:Long|Short|Largo|Corto) ×\d+<\/span> <b>(\w+)<\/b> · entry ([\d.,]+) · put in (${NUM})`,
  (m) => m.replace(/(Long|Short) ×/, (q, s) => SIDE_ES(s) + " ×").replace(/ · entry ([\d.,]+) · put in /, " · entrada $1 · pusiste "));
rx(String.raw`(\d+) s before: (\d+)`, "$1 s antes: $2");
rx(String.raw`Bought (${NUM}) of Global Freight Co\. shares\.`, "Has comprado $1 en acciones de Global Freight Co.");
rx(String.raw`Sold (${NUM}) of shares \(fee (${NUM})\): \+(${NUM}) to your money\.`, "Has vendido $1 en acciones (comisión $2): +$3 a tu dinero.");
rx(String.raw`Shares need at least (${NUM})\.`, "Las acciones necesitan al menos $1.");
H("A shipping company that lives on <b>your logistics deliveries</b>. Every 10 seconds the share price moves: it compares the contracts your trucks, tankers and planes delivered in the <b>last 20 seconds</b> with the 20 seconds before. More deliveries than before: the price jumps up (+1% for every extra contract). Fewer: it drops (−1% for every missing one). The same number: a small move around +0.1%. A little random noise is added to every move (±0.5%), and one move is at most +8% / −6%. Over time the price rises, about +35% an hour on average; a bigger fleet makes bigger swings to time. Min. 1,000. Selling has the same fee as the ETF cash-out fee. The price doesn't move while the game is closed.",
  "Una naviera que vive de <b>tus entregas logísticas</b>. Cada 10 segundos se mueve el precio de la acción: compara los contratos que tus camiones, petroleros y aviones han entregado en los <b>últimos 20 segundos</b> con los 20 segundos anteriores. Más entregas que antes: el precio sube (+1% por cada contrato de más). Menos: baja (−1% por cada uno que falte). El mismo número: un pequeño movimiento de alrededor de +0,1%. A cada movimiento se le suma un poco de azar (±0,5%), y un movimiento es como mucho de +8% / −6%. Con el tiempo el precio sube, unos +35% por hora de media; una flota más grande da oscilaciones más grandes que aprovechar. Mín. 1.000. Vender tiene la misma comisión que la retirada del ETF. El precio no se mueve con el juego cerrado.");

Object.assign(ES, { "Unlocks with 🚢 Logistics.": "Se desbloquea con 🚢 Logística." });
H("📡 <b>Live trading</b>: <b>⏳ limit orders</b> (open a Long when the price drops to your price, or a Short when it rises to it) and <b>🎯 take profit / 🛑 stop loss</b> on every position.",
  "📡 <b>Trading en vivo</b>: <b>⏳ órdenes límite</b> (abre un largo cuando el precio baja a tu precio, o un corto cuando sube hasta él) y <b>🎯 toma de beneficios / 🛑 stop loss</b> en cada posición.");
H("🚚 New in 📈 Investing: <b>Global Freight Co. shares</b>. The price follows your logistics deliveries: more contracts delivered than in the 20 seconds before, and it goes up; fewer, and it goes down.",
  "🚚 Novedad en 📈 Inversiones: <b>acciones de Global Freight Co.</b> El precio sigue tus entregas logísticas: si entregas más contratos que en los 20 segundos anteriores, sube; si entregas menos, baja.");

/* ===================== ☁️ CLOUD SAVE (account) ===================== */
Object.assign(ES, {
  "G": "G", "Account": "Cuenta", "Cloud save": "Guardado en la nube", "Connecting…": "Conectando…", "Not available": "No disponible",
  "Sign in with Google": "Iniciar sesión con Google", "Sign in": "Iniciar sesión", "Save to the cloud now": "Guardar en la nube ahora",
  "Sign out": "Cerrar sesión", "Save now": "Guardar ahora", "Delete account": "Eliminar cuenta", "Last upload failed": "Falló la última subida", "Google account": "Cuenta de Google",
  "Loading your cloud save…": "Cargando tu partida de la nube…", "Which progress do you want to keep?": "¿Qué progreso quieres conservar?",
  "Your cloud save and this device have different progress.": "Tu partida en la nube y este dispositivo tienen un progreso distinto.",
  "This device": "Este dispositivo",
  "The other one is replaced.": "La otra se sustituye.",
  "Delete your account?": "¿Eliminar tu cuenta?", "Yes, delete my account": "Sí, eliminar mi cuenta",
  "The progress on this device stays (you can keep playing without an account).": "El progreso de este dispositivo se queda (puedes seguir jugando sin cuenta).",
  "The cloud service can't be reached right now.": "Ahora mismo no se puede conectar con la nube.",
  "Signed out. Playing on here as a guest won't change your account's cloud save.": "Sesión cerrada. Si sigues jugando aquí como invitado, tu partida en la nube no cambiará.",
  "Could not delete the account. Try again later.": "No se ha podido eliminar la cuenta. Inténtalo más tarde.",
  "Your account and cloud save were deleted.": "Se han eliminado tu cuenta y tu partida en la nube.",
  "Saved to the cloud.": "Guardado en la nube.", "Cloud save failed. Your progress is still saved on this device.": "Falló el guardado en la nube. Tu progreso sigue guardado en este dispositivo.",
});
rx(String.raw`Saved (\d.+)`, "Guardado: $1");
H("This deletes your account and your <b>cloud save</b> for good.", "Esto elimina tu cuenta y tu <b>partida en la nube</b> para siempre.");
H("☁️ <b>Cloud save</b>: sign in with Google (⚙️ Settings or the main menu) to keep your progress in your account and continue on another device. Playing without an account works as before.",
  "☁️ <b>Guardado en la nube</b>: inicia sesión con Google (⚙️ Ajustes o el menú principal) para guardar tu progreso en tu cuenta y seguir en otro dispositivo. Jugar sin cuenta funciona como antes.");

H("⚠️ <b>Your progress is not being saved</b>: this browser's storage for the game is full. Sign in (👤 Profile) to keep it in the ☁️ cloud. <button>OK</button>",
  "⚠️ <b>Tu progreso no se está guardando</b>: el almacenamiento del navegador para el juego está lleno. Inicia sesión (👤 Perfil) para guardarlo en la ☁️ nube. <button>OK</button>");

Object.assign(ES, {
  "The game is open in another tab": "El juego está abierto en otra pestaña", "Play here": "Jugar aquí",
  "Only one tab can play at a time, so your progress is never overwritten. Play here to move the game to this tab.":
    "Solo una pestaña puede jugar a la vez, así tu progreso nunca se sobrescribe. Pulsa «Jugar aquí» para pasar el juego a esta pestaña.",
  "You opened the game in another tab, so it was paused here. Your progress is saved.": "Has abierto el juego en otra pestaña, así que aquí se ha pausado. Tu progreso está guardado.",
});
H("🗂️ The game now runs in <b>one tab at a time</b>: opening it in a second tab no longer overwrites your progress. Click <b>Play here</b> to move it.",
  "🗂️ El juego ahora funciona en <b>una sola pestaña a la vez</b>: abrirlo en otra pestaña ya no sobrescribe tu progreso. Pulsa <b>Jugar aquí</b> para moverlo.");

Object.assign(ES, {
  "Keep your progress safe": "Protege tu progreso", "Play as guest": "Jugar como invitado", "Don't ask again on this device": "No volver a preguntar en este dispositivo",
  "Sign in with Google to save your progress in the cloud and play on any device.": "Inicia sesión con Google para guardar tu progreso en la nube y jugar en cualquier dispositivo.",
  "As a guest, your progress is saved only in this browser. It can be lost if you clear your browsing data, play in a private window or switch to another device.":
    "Como invitado, tu progreso solo se guarda en este navegador. Puede perderse si borras los datos de navegación, juegas en una ventana privada o cambias de dispositivo.",
  "Playing as a guest: your progress is saved only in this browser. It can be lost if you clear your browsing data, play in a private window or switch to another device.":
    "Jugando como invitado: tu progreso solo se guarda en este navegador. Puede perderse si borras los datos de navegación, juegas en una ventana privada o cambias de dispositivo.",
});
H("👤 You can keep playing as a <b>guest</b> without signing in. The game reminds you that guest progress is only saved in this browser.",
  "👤 Puedes seguir jugando como <b>invitado</b> sin iniciar sesión. El juego te recuerda que el progreso de invitado solo se guarda en este navegador.");

hrx(String.raw`⚠️ You already have \{i\} <b>([^<]+)<\/b>: this recipe gives no reward, only \+1 ([^<]+?) DNA( \(and it's already full\))?\.`,
  (m, a, b, f) => `⚠️ Ya tienes {i} <b>${es(a)}</b>: esta receta no da premio, solo +1 de ADN de ${es(b)}${f ? " (y ya está lleno)" : ""}.`);
hrx(String.raw`⚠️ You already have <b>([^<]+)<\/b>: this recipe gives no reward, only \+1 ([^<]+?) DNA( \(and it's already full\))?\.`,
  (m, a, b, f) => `⚠️ Ya tienes <b>${es(a)}</b>: esta receta no da premio, solo +1 de ADN de ${es(b)}${f ? " (y ya está lleno)" : ""}.`);

H("🚚 <b>Global Freight Co. shares</b>: up moves are now bigger than down moves, so the price rises over time (faster the more you deliver).",
  "🚚 <b>Acciones de Global Freight Co.</b>: ahora las subidas son mayores que las bajadas, así que el precio sube con el tiempo (más rápido cuanto más entregas).");

Object.assign(ES, { "Fix: after signing out, a guest game no longer replaces your account's cloud save when you sign in again (you choose which progress to keep), and signing in always lets you pick a Google account.":
  "Corrección: tras cerrar sesión, una partida de invitado ya no sustituye tu partida en la nube al volver a entrar (eliges qué progreso conservar), y al iniciar sesión siempre puedes elegir la cuenta de Google." });

/* ===================== 🚀 NEBULA STRIKE (mini-game) ===================== */
Object.assign(ES, {
  "Nebula Strike": "Nebula Strike", "Sparrow": "Sparrow", "Dart": "Dart", "Bulwark": "Bulwark", "Sovereign": "Sovereign",
  "Scrap Belt": "Cinturón de Chatarra", "Hive Nebula": "Nebulosa Colmena", "Crimson Fortress": "Fortaleza Carmesí",
  "Scrap Crab": "Cangrejo Chatarra", "Hive Queen": "Reina de la Colmena", "The Taxman": "El Recaudador",
  "Speed": "Velocidad", "Lives": "Vidas", "Firepower": "Potencia de fuego", "Hangar": "Hangar", "First clear": "Primera victoria",
  "Stardust": "Polvo estelar", "stardust": "polvo estelar", "stardust.": "polvo estelar.", "Flying": "En vuelo", "Fly this ship": "Pilotar esta nave",
  "Balanced starter ship with one steady gun.": "Nave inicial equilibrada con un cañón constante.",
  "Very fast and small, with twin rapid-fire guns, but only 2 lives.": "Muy rápida y pequeña, con dos cañones de tiro rápido, pero solo 2 vidas.",
  "A slow flying fortress with a heavy double cannon and 5 lives.": "Una fortaleza voladora lenta con un cañón doble pesado y 5 vidas.",
  "The legendary golden ship: fast, 4 lives and an energy cannon with side bolts.": "La legendaria nave dorada: rápida, 4 vidas y un cañón de energía con disparos laterales.",
  "Damage": "Daño", "Fire rate": "Cadencia de tiro", "Hull armour": "Blindaje del casco", "Shield recharge": "Recarga del escudo",
  "Shield time": "Duración del escudo", "Special ammo": "Munición especial", "Stardust magnet": "Imán de polvo estelar",
  "normal damage": "daño normal", "normal fire rate": "cadencia normal", "no extra lives": "sin vidas extra", "normal special weapon ammo": "munición especial normal",
  "no magnet": "sin imán", "small pull range": "alcance pequeño", "medium pull range": "alcance medio", "large pull range": "alcance grande",
  "Fly through five sectors of space, shoot everything that moves, defeat the bosses and survive the pirates' graveyard. Lose all your lives and the level starts over from the beginning.":
    "Vuela por cinco sectores del espacio, dispara a todo lo que se mueva, derrota a los jefes y sobrevive al cementerio pirata. Si pierdes todas tus vidas, el nivel empieza de nuevo desde el principio.",
  "Move: arrows or WASD · 🛡️ Shield: Shift or K · 🚀 Special weapon: X or L · ⏸️ Pause: P or Esc":
    "Moverse: flechas o WASD · 🛡️ Escudo: Shift o K · 🚀 Arma especial: X o L · ⏸️ Pausa: P o Esc",
  "Phone: drag anywhere on the screen to fly, and tap the buttons for the shield and special weapon.":
    "Móvil: arrastra el dedo por la pantalla para volar y toca los botones del escudo y del arma especial.",
  "Auto-fire (turn it off to shoot by holding Space)": "Disparo automático (desactívalo para disparar manteniendo la barra espaciadora)",
  "Pause": "Pausa", "Special weapon": "Arma especial", "Shield": "Escudo", "WARNING": "¡ATENCIÓN!", "BLOCKED!": "¡BLOQUEADO!", "+1 life": "+1 vida",
  "Homing missiles": "Misiles teledirigidos", "Laser beam": "Rayo láser", "Nova spread": "Abanico nova",
  "Paused": "En pausa", "Resume": "Continuar", "Quit level": "Abandonar el nivel", "If you quit, you keep the stardust you collected.": "Si abandonas, conservas el polvo estelar que has recogido.",
  "Your ship was destroyed": "Tu nave ha sido destruida", "Try again": "Reintentar", "Play again": "Jugar otra vez",
  "Enemies destroyed": "Enemigos destruidos", "Hits blocked": "Golpes bloqueados", "Lives lost": "Vidas perdidas",
  "Cleared": "Superado", "Beat level 1 first": "Supera antes el nivel 1", "Beat level 2 first": "Supera antes el nivel 2", "Beat level 3 first": "Supera antes el nivel 3", "Beat level 3": "Supera el nivel 3",
  "Build the 🚀 Space Mission Center (💰 Income → 🔬 Science)": "Construye el 🚀 Centro de misiones espaciales (💰 Ingresos → 🔬 Ciencia)",
  "Build the 🚀 Space Mission Center (💰 Income → 🔬 Science) first.": "Construye antes el 🚀 Centro de misiones espaciales (💰 Ingresos → 🔬 Ciencia).",
  "Fly a spaceship through 3 levels of enemy waves and defeat a boss at the end of each one.": "Pilota una nave por 3 niveles de oleadas enemigas y derrota a un jefe al final de cada uno.",
  "📱 Turn your phone sideways for a bigger screen.": "📱 Gira el móvil para ver la pantalla más grande.", "Turn your phone sideways for a bigger screen.": "Gira el móvil para ver la pantalla más grande.",
  "Drag anywhere to fly": "Arrastra para volar", "Shield button": "Botón del escudo", "Special weapon button": "Botón del arma especial", "Pause button": "Botón de pausa",
  "Move: arrows or WASD · ⏸️ Pause: P or Esc": "Moverse: flechas o WASD · ⏸️ Pausa: P o Esc", "Q": "Q", "E": "E",
  "Press a key…": "Pulsa una tecla…", "Default keys": "Teclas por defecto", "Right Shift": "Shift derecho", "Right Ctrl": "Ctrl derecho", "Enter": "Intro", "Backspace": "Retroceso", "Caps Lock": "Bloq Mayús",
  "That key is used to move, shoot or pause. Pick another one.": "Esa tecla se usa para moverse, disparar o pausar. Elige otra.",
  "That key is already used for the shield. Pick another one.": "Esa tecla ya se usa para el escudo. Elige otra.",
  "That key is already used for the special weapon. Pick another one.": "Esa tecla ya se usa para el arma especial. Elige otra.",
  "Mine ore": "Mineral de la mina",
  "The top upgrade levels also need 💎 diamonds or 🔴 rubies from your 🏦 vault in the ⛏️ Gold Mine Dig, on every ship. Keep ore after a dig instead of selling it to save up.":
    "Los niveles más altos de las mejoras también necesitan 💎 diamantes o 🔴 rubíes de tu 🏦 cámara en la ⛏️ mina de oro, en todas las naves. Guarda el mineral tras excavar en vez de venderlo para ahorrar.",
  "⛏️ Nebula Strike: the top upgrade levels now also need 💎 diamonds or 🔴 rubies from the Gold Mine Dig vault.":
    "⛏️ Nebula Strike: los niveles más altos de las mejoras ahora también necesitan 💎 diamantes o 🔴 rubíes de la cámara de la mina de oro.",
  "Score": "Puntuación", "New best score!": "¡Nueva mejor puntuación!", "Best score": "Mejor puntuación",
  "⭐ Nebula Strike: every destroyed enemy and boss now gives ⭐ points. Your best score for each level is shown next to its best time.":
    "⭐ Nebula Strike: cada enemigo y jefe destruido da ahora ⭐ puntos. Tu mejor puntuación de cada nivel aparece junto a su mejor tiempo.",
  "Score: every destroyed enemy gives points (100 for small ships, up to 1,000 for big gunships) and each boss gives a big bonus (Scrap Crab 5,000, Hive Queen 10,000, The Taxman 20,000). Your best score for each level is shown in the hangar.":
    "Puntuación: cada enemigo destruido da puntos (100 por las naves pequeñas, hasta 1.000 por las cañoneras grandes) y cada jefe da una gran bonificación (Cangrejo Chatarra 5.000, Reina de la Colmena 10.000, El Recaudador 20.000). Tu mejor puntuación de cada nivel aparece en el hangar.",
  "🪨 Nebula Strike: new hand-painted asteroids in three sizes (bigger ones are tougher and worth more points) and a new look for the spinning blade enemies.":
    "🪨 Nebula Strike: nuevos asteroides pintados a mano en tres tamaños (los grandes son más duros y dan más puntos) y un nuevo aspecto para los enemigos de cuchillas giratorias.",
  "🌌 Nebula Strike: new hand-painted backgrounds for all 3 levels, and each boss now has its own arena (the Scrap Crab's junkyard, the Hive Queen's nest and The Taxman's vault) that fades in when the boss arrives.":
    "🌌 Nebula Strike: nuevos fondos pintados a mano para los 3 niveles, y cada jefe tiene ahora su propia arena (el desguace del Cangrejo Chatarra, el nido de la Reina de la Colmena y la cámara acorazada de El Recaudador) que aparece cuando llega el jefe.",
  "🦀 Nebula Strike: the Scrap Crab has a new look: it now flies on three rocket jets.": "🦀 Nebula Strike: el Cangrejo Chatarra tiene un nuevo aspecto: ahora vuela con tres propulsores.",
  "👾 Nebula Strike: new hand-painted enemies: saucer drones (with their pilots), darters, gun pods, space mines, wasp hunters, swarm bugs, armoured gunships, supply ships and The Taxman's missiles.": "👾 Nebula Strike: nuevos enemigos pintados a mano: platillos (con sus pilotos), dardos, cápsulas cañón, minas espaciales, avispas cazadoras, bichos de enjambre, cañoneras blindadas, naves de suministros y los misiles de El Recaudador.",
  "Pirate's Cove": "Cala Pirata", "Captain Cutlass": "Capitán Sable", "Admiral Dreadmaw": "Almirante Fauces Negras",
  "💀 Very hard": "💀 Muy difícil", "Very hard": "Muy difícil", "and": "y", "Open the loot box": "Abrir el cofre del botín",
  "Common": "Común", "Rare": "Raro", "Epic": "Épico", "Legendary": "Legendario", "Pet": "Mascota", "Prize": "Premio",
  "You found a pet!": "¡Has encontrado una mascota!", "Your new friend now lives on your 💰 Income page. It drinks the ⚡ energy drink and taps the coin for you!": "Tu nuevo amigo ya vive en tu página de 💰 Ingresos. ¡Se bebe la ⚡ bebida energética y pulsa la moneda por ti!",
  "Pirate's bane": "Azote de piratas", "Treasure hunter": "Cazatesoros", "A new friend": "Un nuevo amigo",
  "Beat Admiral Dreadmaw in level 4 of Nebula Strike": "Derrota al Almirante Fauces Negras en el nivel 4 de Nebula Strike",
  "Open 10 pirate loot boxes": "Abre 10 cofres del botín pirata", "Find the pet in a pirate loot box": "Encuentra la mascota en un cofre del botín pirata",
  "Onwards!": "¡Adelante!", "The final boss is waiting further ahead…": "El jefe final te espera más adelante…",
  "Captain Cutlass + Admiral Dreadmaw": "Capitán Sable + Almirante Fauces Negras",
  "A pet that lives on your 💰 Income page (you can only have one; after that its chance goes to Epic)": "Una mascota que vive en tu página de 💰 Ingresos (solo puedes tener una; después, su probabilidad pasa a Épico)",
  "A side-scrolling space shooter. It opens when you build the 🚀 Space Mission Center (🔬 Science) and stays open for good, even after a prestige. Fly your ship through 5 levels of enemy waves; levels 1–4 end with a boss (level 4 has two), and in level 5 you must survive for 5 minutes. Beating a level opens the next one. Levels are free to play, but if you lose all your lives, the level starts over from the beginning.":
    "Un matamarcianos de desplazamiento lateral. Se abre al construir el 🚀 Centro de misiones espaciales (🔬 Ciencia) y queda abierto para siempre, incluso tras un prestigio. Pilota tu nave por 5 niveles de oleadas enemigas; los niveles 1–4 terminan con un jefe (el nivel 4 tiene dos) y en el nivel 5 debes sobrevivir 5 minutos. Superar un nivel abre el siguiente. Jugar los niveles es gratis, pero si pierdes todas tus vidas, el nivel empieza de nuevo desde el principio.",
  "Fly a spaceship through 5 levels of enemy waves, defeat the bosses and survive the pirates' graveyard.": "Pilota una nave por 5 niveles de oleadas enemigas, derrota a los jefes y sobrevive al cementerio pirata.",
  "Show on the Income page": "Mostrar en la página de Ingresos", "Name": "Nombre", "🐾 Pet": "🐾 Mascota", "The pet": "La mascota",
  "Best friends": "Mejores amigos", "Pet your pet 100 times": "Acaricia a tu mascota 100 veces", "Paw power": "Poder de patitas", "Let your pet tap the coin 10,000 times": "Deja que tu mascota pulse la moneda 10.000 veces",
  "Skip": "Saltar", "Support the game": "Apoya el juego", "Donate": "Donar", "Maybe later": "Quizás más tarde", "☕ Open Ko-fi": "☕ Abrir Ko-fi", "Open Ko-fi": "Abrir Ko-fi",
  "☕ Support Empire of Coins": "☕ Apoya Empire of Coins", "Support Empire of Coins": "Apoya Empire of Coins", "Thank you for playing! ❤️": "¡Gracias por jugar! ❤️", "Thank you for playing!": "¡Gracias por jugar!", "Support the game on Ko-fi": "Apoya el juego en Ko-fi",
  "Payment is handled securely by Ko-fi with PayPal or Stripe. The game never sees your payment details.": "El pago lo gestiona de forma segura Ko-fi con PayPal o Stripe. El juego nunca ve tus datos de pago.", "Report a bug": "Informar de un error", "🐞 Report a bug": "🐞 Informar de un error",
  "What kind of problem?": "¿Qué tipo de problema?", "What are you playing on?": "¿En qué dispositivo juegas?", "📱 Phone": "📱 Móvil", "📲 Tablet": "📲 Tableta", "💻 PC or laptop": "💻 PC o portátil", "Phone": "Móvil", "Tablet": "Tableta", "PC or laptop": "PC o portátil", "What happened? What did you expect?": "¿Qué ha pasado? ¿Qué esperabas?",
  "Something doesn't work": "Algo no funciona", "Wrong numbers or rewards": "Números o premios incorrectos", "Display or layout problem": "Problema de visualización o de diseño",
  "Translation error": "Error de traducción", "Lost progress": "Progreso perdido", "Other": "Otro",
  "📧 Send by email": "📧 Enviar por correo", "Send by email": "Enviar por correo", "Copy report": "Copiar informe", "Back to settings": "Volver a ajustes",
  "Report copied. Paste it into an email to contact@empireofcoins.com.": "Informe copiado. Pégalo en un correo para contact@empireofcoins.com.", "📋 Copy report": "📋 Copiar informe", "← Back to settings": "← Volver a ajustes",
  "For example: I won the level 4 boss but the loot box didn't open.": "Por ejemplo: gané al jefe del nivel 4 pero el cofre del botín no se abrió.",
  "Attach game details (version, page, browser and screen size). No save data or personal details are included.": "Adjuntar datos del juego (versión, página, navegador y tamaño de pantalla). No se incluyen datos de la partida ni datos personales.",
  "📧 Opening your email app… If nothing opens, use Copy report.": "📧 Abriendo tu aplicación de correo… Si no se abre nada, usa Copiar informe.",
  "📋 Select the text and copy it.": "📋 Selecciona el texto y cópialo.",
  "🐞 <b>Report a bug</b> is now open in ⚙️ Settings: describe the problem and send it by email (or copy the report) to contact@empireofcoins.com.": "🐞 <b>Informar de un error</b> ya está disponible en ⚙️ Ajustes: describe el problema y envíalo por correo (o copia el informe) a contact@empireofcoins.com.", "⚠️ Barrage incoming!": "⚠️ ¡Llega una andanada!", "Barrage incoming!": "¡Llega una andanada!", "Find the gaps!": "¡Busca los huecos!",
  "⚠️ Admiral Dreadmaw is back!": "⚠️ ¡El Almirante Fauces Negras ha vuelto!",
  "💀 Nebula Strike: before his last phase, a damaged Admiral Dreadmaw now sails off screen and sends walls of bullets from the right, the top and the bottom. Use the whole screen and slip through the gaps before he returns!":
    "💀 Nebula Strike: antes de su última fase, el Almirante Fauces Negras, ya dañado, sale de la pantalla y lanza muros de balas desde la derecha, desde arriba y desde abajo. ¡Usa toda la pantalla y cuélate por los huecos antes de que vuelva!", "Pirate chest": "Cofre pirata", "Beat Admiral Dreadmaw first": "Derrota antes al Almirante Fauces Negras", "Buy another": "Comprar otro", "Close": "Cerrar",
  "The same loot box as level 4: 40–180 min of income by rarity or the rare pet.": "El mismo cofre del botín que en el nivel 4: de 40 a 180 min de ingresos según la rareza o la mascota rara.",
  "The same loot box as level 4: 40–180 min of income by rarity.": "El mismo cofre del botín que en el nivel 4: de 40 a 180 min de ingresos según la rareza.",
  "🏴‍☠️ Nebula Strike: after beating Admiral Dreadmaw, you can buy a <b>pirate chest</b> in the hangar for ✨ 10,000 stardust. Same prizes and odds as the level 4 loot box, pet included.":
    "🏴‍☠️ Nebula Strike: tras derrotar al Almirante Fauces Negras, puedes comprar un <b>cofre pirata</b> en el hangar por ✨ 10.000 de polvo estelar. Mismos premios y probabilidades que el cofre del botín del nivel 4, mascota incluida.", "⏩ Skip": "⏩ Saltar",
  "/ WASD": "/ WASD", "Shift / K": "Shift / K", "X / L": "X / L", "P / Esc": "P / Esc", "Move": "Moverse", "Shoot": "Disparar", "Auto-fire on": "Disparo automático", "Space": "Espacio",
  "about 5 min": "unos 5 min", "about 6–7 min": "unos 6–7 min",
  // achievements
  "Scrap metal": "Chatarra", "Hive buster": "Revienta colmenas", "Tax evasion": "Evasión fiscal", "Untouchable": "Intocable", "Perfect timing": "Sincronización perfecta",
  "Space exterminator": "Exterminador espacial", "Veteran pilot": "Piloto veterano", "Full hangar": "Hangar completo", "Fully loaded": "A tope", "Stardust collector": "Coleccionista de polvo estelar",
  "Beat the Scrap Crab in level 1 of Nebula Strike": "Derrota al Cangrejo Chatarra en el nivel 1 de Nebula Strike",
  "Beat the Hive Queen in level 2 of Nebula Strike": "Derrota a la Reina de la Colmena en el nivel 2 de Nebula Strike",
  "Beat The Taxman in level 3 of Nebula Strike": "Derrota a El Recaudador en el nivel 3 de Nebula Strike",
  "Beat a Nebula Strike level without losing a life": "Supera un nivel de Nebula Strike sin perder ninguna vida",
  "Block 50 hits with your shield": "Bloquea 50 golpes con tu escudo", "Destroy 1,000 enemies in Nebula Strike": "Destruye 1.000 enemigos en Nebula Strike",
  "Win 10 Nebula Strike levels": "Gana 10 niveles de Nebula Strike", "Own all 4 Nebula Strike ships": "Ten las 4 naves de Nebula Strike",
  "Max out every upgrade on one ship": "Lleva al máximo todas las mejoras de una nave", "Collect 5,000 stardust": "Recoge 5.000 de polvo estelar",
  // wiki
  "Difficulty": "Dificultad", "Length": "Duración", "Boss": "Jefe", "Later clears": "Siguientes victorias", "Ship": "Nave", "Gun": "Arma", "Free": "Gratis",
  "The income reward uses the same base as the Gold Mine Dig (business income over the last minute).": "El premio en ingresos usa la misma base que la mina de oro (ingresos de negocios del último minuto).",
  "Supply ships": "Naves de suministros",
  "A side-scrolling space shooter. It opens when you build the 🚀 Space Mission Center (🔬 Science) and stays open for good, even after a prestige. Fly your ship through 3 levels of enemy waves; each level ends with a boss. Beating a level opens the next one. Levels are free to play, but if you lose all your lives, the level starts over from the beginning.":
    "Un matamarcianos de desplazamiento lateral. Se abre al construir el 🚀 Centro de misiones espaciales (🔬 Ciencia) y queda abierto para siempre, incluso tras un prestigio. Pilota tu nave por 3 niveles de oleadas enemigas; cada nivel termina con un jefe. Superar un nivel abre el siguiente. Jugar los niveles es gratis, pero si pierdes todas tus vidas, el nivel empieza de nuevo desde el principio.",
  "Move with the arrows or WASD, 🛡️ shield with Shift or K, 🚀 special weapon with X or L, ⏸️ pause with P or Esc. You can change the shield and special weapon keys in the hangar. Auto-fire is on by default (turn it off in the hangar to shoot with Space). 📱 On a phone, drag anywhere on the screen to fly and tap the buttons for the shield and special weapon.":
    "Muévete con las flechas o WASD, 🛡️ escudo con Shift o K, 🚀 arma especial con X o L, ⏸️ pausa con P o Esc. Puedes cambiar las teclas del escudo y del arma especial en el hangar. El disparo automático está activado por defecto (desactívalo en el hangar para disparar con la barra espaciadora). 📱 En el móvil, arrastra el dedo por la pantalla para volar y toca los botones del escudo y del arma especial.",
  "Art Gallery: copy paintings and sell them or keep them · ⛏️ Gold Mine Dig: dig for ore (needs a gold mine) · 🚀 Nebula Strike: space shooter (needs the Space Mission Center)":
    "Galería de arte: copia cuadros y véndelos o guárdalos · ⛏️ Excavación en la mina de oro: excava en busca de mineral (necesita una mina de oro) · 🚀 Nebula Strike: matamarcianos espacial (necesita el Centro de misiones espaciales)",
});
const shEsName = (n) => ES[n] || n;
H("🛡️ <b>Shield:</b> every 15 sec. It stays up 1.5 sec and blocks the next hit, so time it well. 📦 Shoot the glowing supply ships for special weapons: 🚀 homing missiles, ⚡ laser beam and 💠 nova spread.",
  "🛡️ <b>Escudo:</b> cada 15 s. Dura 1,5 s y bloquea el siguiente golpe, así que actívalo en el momento justo. 📦 Dispara a las naves de suministros brillantes para conseguir armas especiales: 🚀 misiles teledirigidos, ⚡ rayo láser y 💠 abanico nova.");
hrx(String.raw`🛡️ <b>Shield:<\/b> every (\d+) sec\. It stays up ([\d.]+) sec and blocks the next hit, so time it well\. (📦 .+)`, (m, a, b, rest) =>
  `🛡️ <b>Escudo:</b> cada ${a} s. Dura ${b.replace(".", ",")} s y bloquea el siguiente golpe, así que actívalo en el momento justo. 📦 Dispara a las naves de suministros brillantes para conseguir armas especiales: 🚀 misiles teledirigidos, ⚡ rayo láser y 💠 abanico nova.`);
H("Every ship has its own upgrades. They are paid with <span>✨</span> stardust.", "Cada nave tiene sus propias mejoras. Se pagan con <span>✨</span> polvo estelar.");
H("🛡️ <b>Shield:</b> usable every 15 sec. It stays up 1.5 sec and blocks the next hit (a shot, an enemy or a boss beam), then breaks. If nothing hits it in time, it's wasted.",
  "🛡️ <b>Escudo:</b> se puede usar cada 15 s. Dura 1,5 s y bloquea el siguiente golpe (un disparo, un enemigo o el rayo de un jefe); después se rompe. Si nada lo golpea a tiempo, se desperdicia.");
H("📦 <b>Supply ships</b> (glowing capsules) fly by every 20–28 sec. Shoot them for a special weapon or an extra life: 🚀 homing missiles (8 shots), ⚡ laser beam (3 shots, hits everything in a line and erases enemy shots) and 💠 nova spread (6 shots of 9 bullets that go through enemies). Picking up the same weapon adds ammo; a different one replaces it.",
  "📦 Las <b>naves de suministros</b> (cápsulas brillantes) pasan cada 20–28 s. Dispárales para conseguir un arma especial o una vida extra: 🚀 misiles teledirigidos (8 disparos), ⚡ rayo láser (3 disparos; daña todo lo que hay en línea y borra los disparos enemigos) y 💠 abanico nova (6 disparos de 9 balas que atraviesan a los enemigos). Recoger la misma arma añade munición; una distinta la sustituye.");
H("✨ <b>Stardust</b> drops from enemies and bosses and is paid for clearing a level (you keep what you collected even if you lose). It buys ships and upgrades in the 🛸 hangar. Every ship has its own upgrades.",
  "✨ El <b>polvo estelar</b> lo sueltan los enemigos y los jefes, y se paga al superar un nivel (conservas lo recogido aunque pierdas). Con él compras naves y mejoras en el 🛸 hangar. Cada nave tiene sus propias mejoras.");
// upgrade effects ("Now: …" / "Next: …" are handled by the rules in i18n-es-2.js)
rx(String.raw`\+(\d+)% damage( at max)?`, (m, n, x) => `+${n}% de daño${x ? " al máximo" : ""}`);
rx(String.raw`\+(\d+)% fire rate( at max)?`, (m, n, x) => `+${n}% de cadencia${x ? " al máximo" : ""}`);
rx(String.raw`\+(\d) (?:life|lives)( at max)?`, (m, n, x) => `+${n} ${n === "1" ? "vida" : "vidas"}${x ? " al máximo" : ""}`);
rx(String.raw`shield every (\d+) sec( at max)?`, (m, n, x) => `escudo cada ${n} s${x ? " al máximo" : ""}`);
rx(String.raw`shield stays up ([\d.]+) sec( at max)?`, (m, n, x) => `el escudo dura ${n.replace(".", ",")} s${x ? " al máximo" : ""}`);
rx(String.raw`\+(\d+)% special weapon ammo( at max)?`, (m, n, x) => `+${n}% de munición especial${x ? " al máximo" : ""}`);
rx(String.raw`large pull range at max`, "alcance grande al máximo");
// hangar and levels
rx(String.raw`Level (\d): (Scrap Belt|Hive Nebula|Crimson Fortress|Pirate's Cove|Pirates' Lost Treasure)( · (\d+:\d\d))?`, (m, n, l, c, tm) => `Nivel ${n}: ${shEsName(l)}${tm ? " · " + tm : ""}`);
rx(String.raw`(\d): (Scrap Belt|Hive Nebula|Crimson Fortress|Pirate's Cove|Pirates' Lost Treasure)`, (m, n, l) => `${n}: ${shEsName(l)}`);
rx(String.raw`Upgrades for the (Sparrow|Dart|Bulwark|Sovereign)`, "Mejoras de la $1");
rx(String.raw`(?:🟢 )?Easy · about 5 min · Boss`, "Fácil · unos 5 min · Jefe");
rx(String.raw`(?:🟠 )?Medium · about 6–7 min · Boss`, "Media · unos 6–7 min · Jefe");
rx(String.raw`(?:🔴 )?Hard · about 6–7 min · Boss`, "Difícil · unos 6–7 min · Jefe");
Object.assign(ES, { "🟢 Easy": "🟢 Fácil", "🟠 Medium": "🟠 Media", "🔴 Hard": "🔴 Difícil", "Easy": "Fácil", "Medium": "Media", "Hard": "Difícil" });
hrx(String.raw`First clear: 💰 <b>(${NUM})<\/b> \+ <span>✨<\/span> (\d+)`, "Primera victoria: 💰 <b>$1</b> + <span>✨</span> $2");
hrx(String.raw`✅ Cleared(?: · Best time (\d+:\d\d))?(?: · ⭐ Best score ([\d.,]+))?<br>Play again: 💰 (${NUM}) \+ <span>✨<\/span> (\d+)`, (m, tm, sc, a, d) =>
  `✅ Superado${tm ? " · Mejor tiempo " + tm : ""}${sc ? " · ⭐ Mejor puntuación " + sc : ""}<br>Otra vez: 💰 ${a} + <span>✨</span> ${d}`);
hrx(String.raw`First clear: 💰 <b>(${NUM})<\/b> \+ <span>✨<\/span> (\d+)<br>⭐ Best score ([\d.,]+)`, "Primera victoria: 💰 <b>$1</b> + <span>✨</span> $2<br>⭐ Mejor puntuación $3");
rx(String.raw`(?:⭐ )?Best score ([\d.,]+)`, "⭐ Mejor puntuación $1");
rx(String.raw`Cleared · Best time (\d+:\d\d) · ⭐ Best score ([\d.,]+)`, "Superado · Mejor tiempo $1 · ⭐ Mejor puntuación $2");
rx(String.raw`Cleared · Best time (\d+:\d\d)`, "Superado · Mejor tiempo $1");
rx(String.raw`Cleared · ⭐ Best score ([\d.,]+)`, "Superado · ⭐ Mejor puntuación $1");
rx(String.raw`Play again: 💰 (${NUM}) \+`, "Otra vez: 💰 $1 +");
hrx(String.raw`<span>✨<\/span> Stardust: <b>([\d.,]+)<\/b>`, "<span>✨</span> Polvo estelar: <b>$1</b>");
hrx(String.raw`🔒 Beat level (\d) · <span>✨<\/span> ([\d.,]+)`, "🔒 Supera el nivel $1 · <span>✨</span> $2");
hrx(String.raw`Buy · <span>✨<\/span> ([\d.,]+)`, "Comprar · <span>✨</span> $1");
hrx(String.raw`⬆️ Upgrade · <span>✨<\/span> ([\d.,]+)`, "⬆️ Mejorar · <span>✨</span> $1");
rx(String.raw`(\d) \/ (\d) levels cleared · ✨ ([\d.,]+)( · 🚀 level in progress)?`, (m, n, tot, d, p) => `${n} / ${tot} niveles superados · ✨ ${d}${p ? " · 🚀 nivel en curso" : ""}`);
rx(String.raw`Runs: (\d+) · Levels won: (\d+) · Enemies destroyed: ([\d.,]+) · Hits blocked: (\d+) · Stardust earned: ([\d.,]+) · Money earned: (${NUM})`,
  "Partidas: $1 · Niveles ganados: $2 · Enemigos destruidos: $3 · Golpes bloqueados: $4 · Polvo estelar ganado: $5 · Dinero ganado: $6");
rx(String.raw`You bought the (Sparrow|Dart|Bulwark|Sovereign)!`, "¡Has comprado la $1!");
// in game
const shEsBoss = (n) => ({ "Scrap Crab": "el Cangrejo Chatarra", "Hive Queen": "la Reina de la Colmena", "The Taxman": "El Recaudador", "Captain Cutlass": "el Capitán Sable", "Admiral Dreadmaw": "el Almirante Fauces Negras" })[n] || n;
rx(String.raw`(Scrap Crab|Hive Queen|The Taxman|Captain Cutlass|Admiral Dreadmaw) is coming!`, (m, n) => `¡Se acerca ${shEsBoss(n)}!`);
rx(String.raw`(?:⚠️ )?(Scrap Crab|Hive Queen|The Taxman|Captain Cutlass|Admiral Dreadmaw) is back!`, (m, n) => { const a = shEsBoss(n); return `⚠️ ¡${a[0].toUpperCase() + a.slice(1)} ha vuelto!`; });
rx(String.raw`(?:⚠️ )?(Scrap Crab|Hive Queen|The Taxman|Captain Cutlass|Admiral Dreadmaw) is getting angry!`, (m, n) => { const a = shEsBoss(n); return `⚠️ ¡${a[0].toUpperCase() + a.slice(1)} se está enfadando!`; });
rx(String.raw`Level (\d) cleared!`, "¡Nivel $1 superado!");
hrx(String.raw`<b>(Scrap Crab|Hive Queen|The Taxman|Captain Cutlass|Admiral Dreadmaw)<\/b> was defeated in (\d+:\d\d)\.`, (m, n, tm) => `<b>${shEsName(n)}</b> ha sido derrotado en ${tm}.`);
rx(String.raw`was defeated in (\d+:\d\d)\.`, "ha sido derrotado en $1.");
hrx(String.raw`✨ <b>\+([\d.,]+)<\/b> stardust`, "✨ <b>+$1</b> de polvo estelar");
rx(String.raw`First clear! Level (\d) is now open\.`, "¡Primera victoria! El nivel $1 ya está abierto.");
rx(String.raw`First clear! You beat every level!`, "¡Primera victoria! ¡Has superado todos los niveles!");
rx(String.raw`You made it (\d+)% of the way through level (\d)\. The level starts over from the beginning\.`, "Has llegado al $1% del nivel $2. El nivel empieza de nuevo desde el principio.");
hrx(String.raw`✨ You keep the <b>([\d.,]+)<\/b> stardust you collected\. Spend it on upgrades in the hangar\.`, "✨ Conservas los <b>$1</b> de polvo estelar que has recogido. Gástalos en mejoras en el hangar.");
rx(String.raw`(\d+) min of income \+ ✨ (\d+)`, "$1 min de ingresos + ✨ $2");
rx(String.raw`([\d.,]+) \(after level (\d)\)`, "$1 (tras el nivel $2)");
rx(String.raw`(Sparrow|Dart|Bulwark|Sovereign): (Damage|Fire rate|Hull armour|Shield recharge|Shield time|Special ammo|Stardust magnet) level (\d): (.+)!`, (m, s, u, l, e) => {
  const v = esq(e); return `${s}: ${ES[u]} nivel ${l}: ${v == null ? e : v}!`; });
// patch notes
H("🚀 New mini-game: <b>Nebula Strike</b>! A side-scrolling space shooter that opens when you build the 🚀 Space Mission Center. Fight through 3 levels of enemy waves and beat the <b>Scrap Crab</b>, the <b>Hive Queen</b> and <b>The Taxman</b>. Time your 🛡️ shield, grab special weapons from supply ships and collect ✨ stardust to buy 4 ships and their upgrades.",
  "🚀 Nuevo minijuego: ¡<b>Nebula Strike</b>! Un matamarcianos de desplazamiento lateral que se abre al construir el 🚀 Centro de misiones espaciales. Abre paso por 3 niveles de oleadas enemigas y derrota al <b>Cangrejo Chatarra</b>, a la <b>Reina de la Colmena</b> y a <b>El Recaudador</b>. Usa el 🛡️ escudo en el momento justo, consigue armas especiales de las naves de suministros y recoge ✨ polvo estelar para comprar 4 naves y sus mejoras.");
ES["⌨️ Nebula Strike: you can change the keys for the 🛡️ shield and 🚀 special weapon in the hangar."] = "⌨️ Nebula Strike: puedes cambiar las teclas del 🛡️ escudo y del 🚀 arma especial en el hangar.";
ES["🏴‍☠️ Nebula Strike level 4 is much busier: waves come faster, a new one arrives as soon as the screen empties, and space mines and asteroids keep drifting in the whole way to the bosses."] = "🏴‍☠️ El nivel 4 de Nebula Strike está mucho más movido: las oleadas llegan más rápido, aparece una nueva en cuanto la pantalla se vacía, y las minas espaciales y los asteroides no dejan de llegar durante todo el camino hasta los jefes.";
ES["🚀 Nebula Strike: The Taxman and Admiral Dreadmaw are a bit smaller, so you can fly further forward during their fights."] = "🚀 Nebula Strike: El Recaudador y el Almirante Fauces Negras son un poco más pequeños, así que puedes avanzar más durante sus combates.";
ES["🎰 Nebula Strike: opening the pirate loot box is now a spin! A reel of rarity cards races past and slowly stops on your prize. Can't wait? Press ⏩ Skip."] = "🎰 Nebula Strike: ¡abrir el cofre del botín pirata ahora es una tirada! Una tira de cartas de rareza pasa a toda velocidad y se detiene poco a poco en tu premio. ¿No puedes esperar? Pulsa ⏩ Saltar.";
H("🏴‍☠️ Nebula Strike level 4: two new pirate enemies! <b>Cannon Skiffs</b> come in pairs and lob arcing cannonballs from above and below, and <b>Grapple Raiders</b> throw a hook on a chain: if it catches you, you lose a life and get pulled in and slowed. Block it with your 🛡️ shield or shoot the hook to break it.",
  "🏴‍☠️ Nebula Strike nivel 4: ¡dos enemigos piratas nuevos! Las <b>lanchas cañoneras</b> llegan en parejas y lanzan balas de cañón en arco desde arriba y desde abajo, y los <b>asaltantes con garfio</b> lanzan un garfio con cadena: si te atrapa, pierdes una vida y te arrastra y te frena. Bloquéalo con tu 🛡️ escudo o dispara al garfio para romperlo.");
H("🐾 <b>The pet is here!</b> Find it in the pirate loot box (5%) and it moves into your 💰 Income page: it drinks the ⚡ energy drink for you, taps the coin 10 times per second while it lasts, sleeps during the cooldown and loves being petted. Rename or hide it in ⚙️ Settings. 2 new achievements: 💖 Best friends and 🐾 Paw power.",
  "🐾 <b>¡Llega la mascota!</b> Encuéntrala en el cofre del botín pirata (5%) y se mudará a tu página de 💰 Ingresos: se bebe la ⚡ bebida energética por ti, pulsa la moneda 10 veces por segundo mientras dura, duerme durante la recarga y le encanta que la acaricien. Cámbiale el nombre u ocúltala en ⚙️ Ajustes. 2 logros nuevos: 💖 Mejores amigos y 🐾 Poder de patitas.");
H("🐾 <b>The pet</b> (5% from the pirate loot box, only one): it lives on your 💰 Income page next to the coin. When the ⚡ energy drink is ready it drinks it for you (it pays the normal price), then taps the coin at the max speed of 10 clicks per second while the drink lasts (its taps count as clicks, also for achievements, and share the 10-per-second limit with your own clicks). During the drink's cooldown it sleeps and wakes up 10 seconds before the next one. It only works while the Income page is on screen. Click it to pet it; hide it or rename it in ⚙️ Settings.",
  "🐾 <b>La mascota</b> (5% en el cofre del botín pirata, solo una): vive en tu página de 💰 Ingresos junto a la moneda. Cuando la ⚡ bebida energética está lista, se la bebe por ti (paga el precio normal) y pulsa la moneda a la velocidad máxima de 10 clics por segundo mientras dura (sus pulsaciones cuentan como clics, también para los logros, y comparten el límite de 10 por segundo con tus propios clics). Durante la recarga de la bebida duerme y se despierta 10 segundos antes de la siguiente. Solo funciona mientras la página de Ingresos está en pantalla. Haz clic en ella para acariciarla; ocúltala o cámbiale el nombre en ⚙️ Ajustes.");
H("🏴‍☠️ Nebula Strike: new <b>level 4: Pirate's Cove</b> (very hard, opens after level 3). Two bosses: <b>Captain Cutlass</b> after 2 minutes, then 2 more minutes of waves and the final boss <b>Admiral Dreadmaw</b> in his treasure cave. Every clear opens a <b>pirate loot box</b>: 40–180 minutes of income by rarity (Common, Rare, Epic, Legendary), or a rare pet!",
  "🏴‍☠️ Nebula Strike: nuevo <b>nivel 4: Cala Pirata</b> (muy difícil, se abre tras el nivel 3). Dos jefes: el <b>Capitán Sable</b> a los 2 minutos, luego 2 minutos más de oleadas y el jefe final, el <b>Almirante Fauces Negras</b>, en su cueva del tesoro. Cada victoria abre un <b>cofre del botín pirata</b>: de 40 a 180 minutos de ingresos según la rareza (Común, Raro, Épico, Legendario) ¡o una mascota rara!");
ES["🏆 3 new Nebula Strike achievements: 🏴‍☠️ Pirate's bane, 💰 Treasure hunter and 🐾 A new friend."] = "🏆 3 logros nuevos de Nebula Strike: 🏴‍☠️ Azote de piratas, 💰 Cazatesoros y 🐾 Un nuevo amigo.";
H("🤖 Nebula Strike: two new enemies! <b>Junk Bots</b> (from level 1) charge straight at you when they line up with your ship, and <b>Laser Sentinels</b> (from level 2) park on the right and fire a beam across the screen after a red warning line. Dodge it or block it with your 🛡️ shield.", "🤖 Nebula Strike: ¡dos enemigos nuevos! Los <b>robots chatarra</b> (desde el nivel 1) cargan en línea recta contra ti cuando se alinean con tu nave, y los <b>centinelas láser</b> (desde el nivel 2) se colocan a la derecha y disparan un rayo de lado a lado de la pantalla tras una línea roja de aviso. Esquívalo o bloquéalo con tu 🛡️ escudo.");
H("🚀 Nebula Strike: the pause screen now shows the controls, and the 💠 nova spread is stronger (a tighter fan of bullets that go through enemies).", "🚀 Nebula Strike: la pantalla de pausa ahora muestra los controles y el 💠 abanico nova es más fuerte (un abanico más cerrado de balas que atraviesan a los enemigos).");
H("🏆 New <b>🚀 Nebula Strike</b> achievements section: 10 achievements.", "🏆 Nueva sección de logros <b>🚀 Nebula Strike</b>: 10 logros.");

hrx(String.raw`⛏️ The top levels also need 💎 diamonds or 🔴 rubies from your 🏦 vault in the Gold Mine Dig \(keep ore after a run instead of selling it\)\. You have (.+)`,
  "⛏️ Los niveles más altos también necesitan 💎 diamantes o 🔴 rubíes de tu 🏦 cámara de la mina de oro (guarda el mineral tras una excavación en vez de venderlo). Tienes $1");
rx(String.raw`Lv (\d): ((?:💎|🔴) \d+)( · Lv (\d): ((?:💎|🔴) \d+))?`, (m, a, b, c, d, e) => `Nv ${a}: ${b}${c ? ` · Nv ${d}: ${e}` : ""}`);
rx(String.raw`(?:💀 )?Very hard · about 5 min · Bosses`, "Muy difícil · unos 5 min · Jefes");
hrx(String.raw`💀 Very hard · about 5 min · Bosses: <b>Captain Cutlass<\/b> and <b>Admiral Dreadmaw<\/b>`, "💀 Muy difícil · unos 5 min · Jefes: <b>Capitán Sable</b> y <b>Almirante Fauces Negras</b>");
hrx(String.raw`🏴‍☠️ Every clear: a <b>pirate loot box<\/b> \(40–180 min of income( or a rare pet)?\) \+ <span>✨<\/span> (\d+)(<br>✅ Cleared(?: · Best time (\d+:\d\d))?)?(?:(?: · |<br>)⭐ Best score ([\d.,]+))?`,
  (m, pet, d, cl, tm, sc) => `🏴‍☠️ Cada victoria: un <b>cofre del botín pirata</b> (40–180 min de ingresos${pet ? " o una mascota rara" : ""}) + <span>✨</span> ${d}${cl ? `<br>✅ Superado${tm ? " · Mejor tiempo " + tm : ""}` : ""}${sc ? `${cl ? " · " : "<br>"}⭐ Mejor puntuación ${sc}` : ""}`);
H("<b>You found a pet!</b><br>Your new friend now lives on your 💰 Income page. It drinks the ⚡ energy drink and taps the coin for you!", "<b>¡Has encontrado una mascota!</b><br>Tu nuevo amigo ya vive en tu página de 💰 Ingresos. ¡Se bebe la ⚡ bebida energética y pulsa la moneda por ti!");
H("🏴‍☠️ <b>Pirate loot box</b> (levels 4 and 5, every clear): after Captain Cutlass, the waves continue for about 2 more minutes before Admiral Dreadmaw. Beat him to open a loot box (after your first win you can also buy one in the hangar for ✨ 10,000 stardust):",
  "🏴‍☠️ <b>Cofre del botín pirata</b> (niveles 4 y 5, en cada victoria): tras el Capitán Sable, las oleadas siguen unos 2 minutos más antes del Almirante Fauces Negras. Derrótalo para abrir un cofre del botín (tras tu primera victoria también puedes comprar uno en el hangar por ✨ 10.000 de polvo estelar):");
rx(String.raw`Loot box \+ ✨ (\d+)`, "Cofre del botín + ✨ $1");
rx(String.raw`(\d+)–(\d+) min of income`, "$1–$2 min de ingresos");
rx(String.raw`(\d+) min of income`, "$1 min de ingresos");
hrx(String.raw`🏴‍☠️ Buy another · <span>✨<\/span> ([\d.,]+)`, "🏴‍☠️ Comprar otro · <span>✨</span> $1");
/* ===================== 🔞 age and entertainment notice ===================== */
Object.assign(ES, {
  "Before you play": "Antes de jugar", "Al continuar, confirmas que": "Al continuar, confirmas que", "By continuing, you confirm that:": "Al continuar, confirmas que:",
  "I have read and agree to the above.": "He leído y acepto lo anterior.",
  "I have read and agree to the above and to the Terms of Use.": "He leído y acepto lo anterior y las Condiciones de uso.",
  "Please also read our Terms of Use and Privacy Policy:": "Lee también nuestras Condiciones de uso y nuestra Política de privacidad:",
  "Lee también nuestras Condiciones de uso y nuestra Política de privacidad": "Lee también nuestras Condiciones de uso y nuestra Política de privacidad",
  "📄 Terms of Use": "📄 Condiciones de uso", "🔒 Privacy Policy": "🔒 Política de privacidad", "Terms of Use": "Condiciones de uso", "Privacy Policy": "Política de privacidad",
  "results in the game do not indicate future results in real gambling or on real financial markets, and nothing in the game constitutes financial or investment advice.":
    "los resultados en el juego no indican resultados futuros en juegos de azar reales ni en los mercados financieros reales, y nada de lo que aparece en el juego constituye asesoramiento financiero o de inversión.", "I confirm, continue": "Lo confirmo, continuar", "I am under 18": "Soy menor de 18 años",
  "We are sorry, but Empire of Coins is only available to players aged 18 and over.": "Lo sentimos, pero Empire of Coins solo está disponible para jugadores mayores de 18 años.",
  "If gambling is causing problems for you or someone close to you, please contact a support service in your country.": "Si el juego te está causando problemas a ti o a alguien cercano, ponte en contacto con un servicio de ayuda de tu país.",
});
H("<b>Empire of Coins</b> is intended for adults. It contains <b>simulated gambling</b> (casino games such as roulette, blackjack, poker and slot-style games) and <b>simulated investing</b> (shares, real estate, precious metals and cryptocurrency trading).",
  "<b>Empire of Coins</b> está destinado a personas adultas. Contiene <b>juegos de azar simulados</b> (juegos de casino como la ruleta, el blackjack, el póquer y juegos de tipo tragaperras) e <b>inversiones simuladas</b> (acciones, inmuebles, metales preciosos y compraventa de criptomonedas).");
H("you are at least <b>18 years old</b>, or of the age of majority in your country of residence if that is higher;",
  "tienes al menos <b>18 años</b>, o la mayoría de edad de tu país de residencia si esta es superior;");
H("you understand that this game is provided <b>solely for entertainment purposes</b>;",
  "entiendes que este juego se ofrece <b>únicamente con fines de entretenimiento</b>;");
H("all coins, winnings, investments and other items in the game are <b>virtual</b>. They have <b>no monetary value</b>, cannot be purchased with real money, and cannot be exchanged, withdrawn or redeemed for real money, goods or services of any kind;",
  "todas las monedas, ganancias, inversiones y demás elementos del juego son <b>virtuales</b>. <b>No tienen valor monetario</b>, no pueden comprarse con dinero real y no pueden canjearse, retirarse ni cambiarse por dinero real, bienes ni servicios de ningún tipo;");
H("the game does <b>not</b> offer real-money gambling or real investing. Market prices shown in the game may be based on real market data, but every trade is simulated;",
  "el juego <b>no</b> ofrece juegos de azar con dinero real ni inversiones reales. Los precios de mercado que se muestran en el juego pueden basarse en datos reales del mercado, pero todas las operaciones son simuladas;");
H("results in the game do not indicate future results in real gambling or on real financial markets, and nothing in the game constitutes financial or investment advice.",
  "los resultados en el juego no indican resultados futuros en juegos de azar reales ni en los mercados financieros reales, y nada de lo que aparece en el juego constituye asesoramiento financiero o de inversión.");
hrx(String.raw`Tell us what went wrong\. Your report goes to <b>([^<]+)<\/b>\.`, "Cuéntanos qué ha fallado. Tu informe se envía a <b>$1</b>.");
hrx(String.raw`No email app\? Press <b>Copy report<\/b> and send it from your email to <b>([^<]+)<\/b>\.`, "¿No tienes aplicación de correo? Pulsa <b>Copiar informe</b> y envíalo desde tu correo a <b>$1</b>.");
rx(String.raw`📋 Report copied\. Paste it into an email to (\S+)\.`, "📋 Informe copiado. Pégalo en un correo para $1.");
H("Empire of Coins is made by one developer and is <b>free to play, with no ads and nothing to buy</b>. If you enjoy it, you can support its development with a small donation on Ko-fi.",
  "Empire of Coins lo crea un único desarrollador y es <b>gratis, sin anuncios y sin nada que comprar</b>. Si te gusta, puedes apoyar su desarrollo con una pequeña donación en Ko-fi.");
H("Donations are completely <b>voluntary</b> and go to the developer.", "Las donaciones son totalmente <b>voluntarias</b> y van al desarrollador.");
H("They <b>don't give anything in the game</b>: no coins, chips or items. Every player stays on equal terms.", "<b>No dan nada en el juego</b>: ni monedas, ni fichas, ni objetos. Todos los jugadores siguen en igualdad de condiciones.");
H("☕ You can now support Empire of Coins on Ko-fi: press <b>Donate</b> on the main menu or ⚙️ Settings → Support the game. Donations are completely voluntary and don't give anything in the game, so every player stays on equal terms. Thank you!",
  "☕ Ya puedes apoyar Empire of Coins en Ko-fi: pulsa <b>Donar</b> en el menú principal o ⚙️ Ajustes → Apoya el juego. Las donaciones son totalmente voluntarias y no dan nada en el juego, así que todos los jugadores siguen en igualdad de condiciones. ¡Gracias!");
hrx(String.raw`(<b>(?:[^<]|<img[^>]*>)*?)(\d+) vehicles here<\/b>`, "$1$2 vehículos aquí</b>");
rx(String.raw`… and (\d+) more`, "… y $1 más");
rx(String.raw`(\d+) vehicles here`, "$1 vehículos aquí");
rx(String.raw`(\d+)% · ([\dh :m]+) left`, "$1% · quedan $2");
/* 🗺️ Nebula Strike level 5 */
Object.assign(ES, { "Survivor of the graveyard": "Superviviente del cementerio", "Survive 5 minutes in level 5 of Nebula Strike": "Sobrevive 5 minutos en el nivel 5 de Nebula Strike",
  "🏆 New Nebula Strike achievement: 🗺️ Survivor of the graveyard.": "🏆 Nuevo logro de Nebula Strike: 🗺️ Superviviente del cementerio." });
H("🗺️ New Nebula Strike level 5: <b>Pirates' Lost Treasure</b>! Opens after you beat level 4. There's no boss: survive for 5 minutes as the pirates' graveyard gets busier and busier. Watch out for 🦈 sea sharks, powder monkeys with big cannonballs and skull asteroids, and fly around the cursed rocks and broken masts: they can't be destroyed. Survive to win a pirate loot box.",
  "🗺️ ¡Nuevo nivel 5 de Nebula Strike: <b>El tesoro perdido de los piratas</b>! Se abre al superar el nivel 4. No hay jefe: sobrevive 5 minutos mientras el cementerio pirata se llena cada vez más. Cuidado con los 🦈 tiburones espaciales, los monos de pólvora con sus grandes balas de cañón y los asteroides calavera, y esquiva las rocas malditas y los mástiles rotos: no se pueden destruir. Sobrevive para ganar un cofre del botín pirata.");
Object.assign(ES, { "Pirates' Lost Treasure": "El tesoro perdido de los piratas", "💀 Very hard": "💀 Muy difícil", "5 min": "5 min",
  "Survive for 5 minutes!": "¡Sobrevive 5 minutos!", "🏴‍☠️ You survived!": "🏴‍☠️ ¡Has sobrevivido!", "The treasure is yours!": "¡El tesoro es tuyo!",
  "None (survive 5 min)": "Ninguno (sobrevive 5 min)", "You survived!": "¡Has sobrevivido!", "Beat level 4 first": "Supera antes el nivel 4", "survive!": "¡sobrevive!", "You survived": "Has sobrevivido", "in the pirates' graveyard!": "en el cementerio pirata!", "Cleared · ⭐ Best score": "Superado · ⭐ Mejor puntuación", "✅ Cleared": "✅ Superado" });
H("No boss: <b>survive!</b>", "Sin jefe: <b>¡sobrevive!</b>");
hrx(String.raw`You survived <b>(\d+:\d+)<\/b> in the pirates' graveyard!`, "¡Has sobrevivido <b>$1</b> en el cementerio pirata!");
hrx(String.raw`💀 Very hard · 5 min · No boss: <b>survive!<\/b>`, "💀 Muy difícil · 5 min · Sin jefe: <b>¡sobrevive!</b>");
rx(String.raw`(?:💀 )?Very hard · 5 min · No boss`, "Muy difícil · 5 min · Sin jefe");
H("🗺️ <b>Level 5: Pirates' Lost Treasure</b> has no boss: survive for 5 minutes while it keeps getting busier. Watch out for 🦈 sea sharks, powder monkeys with big cannonballs, and cursed rocks and broken masts that can't be destroyed (your shots bounce off them, so fly around them). Survive to win the same pirate loot box.",
  "🗺️ <b>Nivel 5: El tesoro perdido de los piratas</b> no tiene jefe: sobrevive 5 minutos mientras la acción no deja de crecer. Cuidado con los 🦈 tiburones espaciales, los monos de pólvora con sus grandes balas de cañón y las rocas malditas y mástiles rotos que no se pueden destruir (tus disparos rebotan en ellos, así que esquívalos). Sobrevive para ganar el mismo cofre del botín pirata.");

/* 🌌 Space logistics (js/34-space.js) */
const SP_ES_NAME = { "Kragg": "Kragg", "Aurumites": "Aurumitas", "Glimmerkin": "Glimmerkin", "Vynari": "Vynari", "Lumerians": "Lumerianos", "Void Corsairs": "Corsarios del Vacío", "Oracles of Vael": "Oráculos de Vael", "Cogitarium": "Cogitarium", "First Ones": "Primeros" };
const SP_ES_GOOD = { "Star Crystals": "Cristales estelares", "Void Gold": "Oro del vacío", "Nebula Cores": "Núcleos de nebulosa", "Living Silk": "Seda viva", "Echo Pearls": "Perlas de eco", "Pirate Charts": "Cartas piratas", "Time Shards": "Fragmentos del tiempo", "Nano Parts": "Nanopiezas", "Ancient Relics": "Reliquias antiguas" };
const SP_ES_LV = { "Unknown": "Desconocida", "Contacted": "Contactada", "Acquainted": "Conocida", "Friendly": "Amistosa", "Trusted": "De confianza", "Allies": "Aliada" };
const SP_ES_TITLE = { "Rock-eaters": "Comerrocas", "Bankers": "Banqueros", "Star-chasers": "Cazaestrellas", "Bio-collectors": "Biocoleccionistas", "Art lovers": "Amantes del arte", "Space pirates": "Piratas espaciales", "Mystics": "Místicos", "Machines": "Máquinas", "Ancients": "Ancestrales" };
const spN = (n) => SP_ES_NAME[n] || n, spG = (g) => SP_ES_GOOD[g] || g, spL = (l) => SP_ES_LV[l] || l;
const SP_RX_NAME = Object.keys(SP_ES_NAME).join("|"), SP_RX_GOOD = Object.keys(SP_ES_GOOD).join("|"), SP_RX_LV = Object.keys(SP_ES_LV).join("|");
Object.assign(ES, SP_ES_NAME, SP_ES_GOOD, SP_ES_LV, SP_ES_TITLE, {
  "Earth": "Tierra", "Space": "Espacio", "Star map": "Mapa estelar", "Home": "Hogar", "Solar System": "Sistema Solar", "Out of range": "Fuera de alcance",
  "Unknown signal": "Señal desconocida", "Uncharted": "Sin cartografiar", "Explore": "Explorar", "Alien goods": "Bienes alienígenas",
  "Coming soon: trade routes, selling alien goods, and trading them with other races.": "Próximamente: rutas comerciales, venta de bienes alienígenas e intercambio con otras razas.",
  "Favourite": "Favorito", "Also likes": "También le gusta", "Their request": "Su petición", "They send back": "Te devuelven", "Distance": "Distancia",
  "A hidden building": "Un edificio oculto", "ship": "nave", "ships": "naves", "Ships": "Naves", "busy": "ocupadas", "Races met": "Razas conocidas",
  "Gifts delivered": "Regalos entregados", "Ships in flight": "Naves en vuelo", "Send gift": "Enviar regalo", "Ask for something else": "Pedir otra cosa",
  "Send": "Enviar", "Money": "Dinero", "Ore": "Mineral", "Paintings": "Cuadros", "DNA samples": "Muestras de ADN", "Stardust": "Polvo estelar",
  "Home: the Solar System": "Hogar: el Sistema Solar", "Uncharted system": "Sistema sin cartografiar", "Pick for me": "Elige por mí",
  "Your spaceport. Pick a system on the map to explore it or send gifts. Ships keep flying while the game is closed.": "Tu puerto espacial. Elige un sistema en el mapa para explorarlo o enviar regalos. Las naves siguen volando con el juego cerrado.",
  "Nothing yet. Races send their goods back with your ships.": "Nada todavía. Las razas devuelven sus bienes con tus naves.",
  "Samples refill over time in the Gene Splicer.": "Las muestras se recargan con el tiempo en el Empalmador genético.",
  "Paintings you give away leave your collection (they count as sold for 🏆 achievements).": "Los cuadros que regalas salen de tu colección (cuentan como vendidos para los 🏆 logros).",
  "Explore the galaxy, meet alien races and trade with them.": "Explora la galaxia, conoce razas alienígenas y comercia con ellas.",
  "You have no ships right now. Build the 🚀 Space Mission Center (💰 Income → 🔬 Science) to get your first one back.": "Ahora mismo no tienes naves. Construye el 🚀 Centro de Misiones Espaciales (💰 Ingresos → 🔬 Ciencia) para recuperar la primera.",
  "All your ships are busy.": "Todas tus naves están ocupadas.", "You don't have enough for this gift yet.": "Todavía no tienes suficiente para este regalo.",
  "Something you haven't discovered yet": "Algo que aún no has descubierto", "The gift couldn't be sent.": "No se ha podido enviar el regalo.",
  "Race": "Raza", "Lives": "Vive", "Sends back": "Devuelve", "Each way": "Cada trayecto", "Friendship": "Amistad", "Needed": "Necesario",
  // 🏆
  "First contact": "Primer contacto", "Meet your first alien race": "Conoce tu primera raza alienígena", "Star cartographer": "Cartógrafo estelar",
  "Meet 6 alien races": "Conoce 6 razas alienígenas", "Friends among the stars": "Amigos entre las estrellas", "Become Friendly with an alien race": "Logra una amistad Amistosa con una raza alienígena",
  "Interstellar alliance": "Alianza interestelar", "Become Allies with an alien race": "Hazte Aliado de una raza alienígena", "Generous empire": "Imperio generoso",
  "Deliver 50 gifts to alien races": "Entrega 50 regalos a razas alienígenas",
  // bios
  "Huge, slow stone beings who chew asteroids for breakfast. They respect heavy, honest gifts.": "Enormes y lentos seres de piedra que mastican asteroides para desayunar. Respetan los regalos pesados y sinceros.",
  "Polite, gold-plated traders who count everything twice. Coins are the only language they fully trust.": "Comerciantes educados y bañados en oro que lo cuentan todo dos veces. Las monedas son el único idioma en el que confían del todo.",
  "Tiny shimmering beings who ride the solar winds and collect starlight in jars.": "Diminutos seres relucientes que cabalgan los vientos solares y guardan luz de estrellas en tarros.",
  "One giant jungle mind that wants to collect every form of life in the galaxy.": "Una gigantesca mente selvática que quiere coleccionar todas las formas de vida de la galaxia.",
  "Dreamy artists who see colours we can't imagine. They would trade a moon for a good painting.": "Artistas soñadores que ven colores que no podemos imaginar. Cambiarían una luna por un buen cuadro.",
  "A rowdy pirate clan from a cursed red star. Pay them well and they might even call you friend.": "Un clan pirata alborotador de una estrella roja maldita. Págales bien y puede que hasta te llamen amigo.",
  "The second Logistics page. It opens when you build the 🚀 Space Mission Center: a star map with our Solar System in the middle and alien systems all around it.":
    "La segunda página de Logística. Se abre al construir el 🚀 Centro de Misiones Espaciales: un mapa estelar con nuestro Sistema Solar en el centro y sistemas alienígenas a su alrededor.",
  "A prestige never resets the races, your friendship or your goods. Ships come from your buildings, so you get them back as you rebuild them (or keep them with Tycoon's Legacy).":
    "Un prestigio nunca reinicia las razas, tu amistad ni tus bienes. Las naves vienen de tus edificios, así que las recuperas al reconstruirlos (o las conservas con el Legado del magnate).",
  "🏆 New <b>🪐 Space</b> achievements section: 5 achievements.": "🏆 Nueva sección de logros <b>🪐 Espacio</b>: 5 logros.",
  "Space": "Espacio",
});
const spWord = (n, one, many) => plural(n, one, many);
hrx(String.raw`(${SP_RX_NAME})<small>(\S+) (${SP_RX_LV})<\/small>`, (m, n, ic, l) => `${spN(n)}<small>${ic} ${spL(l)}</small>`);
hrx(String.raw`Unknown signal<small>❓ Explore<\/small>`, "Señal desconocida<small>❓ Explorar</small>");
hrx(String.raw`Home<small>🌍 Solar System<\/small>`, "Hogar<small>🌍 Sistema Solar</small>");
rx(String.raw`(\d+) of (\d+) ships? free`, (m, a, b) => `${a} de ${b} ${plural(b, "nave libre", "naves libres")}`);
hrx(String.raw`(\S+) <b>(\d+)<\/b> (${SP_RX_GOOD})`, (m, e, n, g) => `${e} <b>${n}</b> ${spG(g)}`);
hrx(String.raw`(${SP_RX_NAME}) <span>· (.+)<\/span>`, (m, n, tl) => `${spN(n)} <span>· ${SP_ES_TITLE[tl] || tl}</span>`);
hrx(String.raw`❤️ <b>Favourite:<\/b> (.+) <span>\(\+(\d+) friendship\)<\/span>`, (m, k, n) => `❤️ <b>Favorito:</b> ${ES[k.replace(/^\S+ /, "")] ? k.replace(/ .+$/, "") + " " + ES[k.replace(/^\S+ /, "")] : k} <span>(+${n} de amistad)</span>`);
hrx(String.raw`👍 <b>Also likes:<\/b> (.+) <span>\(\+(\d+)\)<\/span>`, (m, k, n) => `👍 <b>También le gusta:</b> ${ES[k.replace(/^\S+ /, "")] ? k.replace(/ .+$/, "") + " " + ES[k.replace(/^\S+ /, "")] : k} <span>(+${n})</span>`);
hrx(String.raw`📦 <b>They send back:<\/b> (\S+) (${SP_RX_GOOD}) <span>\((\d+) per gift, more when you level up\)<\/span>`, (m, e, g, n) => `📦 <b>Te devuelven:</b> ${e} ${spG(g)} <span>(${n} por regalo, más al subir de nivel)</span>`);
hrx(String.raw`🛣️ <b>Distance:<\/b> (\d+) min each way`, "🛣️ <b>Distancia:</b> $1 min por trayecto");
rx(String.raw`(\d+) min each way`, "$1 min por trayecto");
rx(String.raw`\((\d+) per gift, more when you level up\)`, "($1 por regalo, más al subir de nivel)");
hrx(String.raw`🔒 A hidden building: <b>\+(\d+)<\/b> ships?`, (m, n) => `🔒 Un edificio oculto: <b>+${n}</b> ${plural(n, "nave", "naves")}`);
hrx(String.raw`(✅|🔒) (.+): <b>\+(\d+)<\/b> ships?`, (m, ok, b, n) => `${ok} ${ES[b.replace(/^\S+ /, "")] ? b.replace(/ .+$/, "") + " " + ES[b.replace(/^\S+ /, "")] : b}: <b>+${n}</b> ${plural(n, "nave", "naves")}`);
hrx(String.raw`🚀 Ships: <b>(\d+) \/ (\d+)<\/b> busy`, "🚀 Naves: <b>$1 / $2</b> ocupadas");
hrx(String.raw`👽 Races met: <b>(\d+) \/ (\d+)<\/b>`, "👽 Razas conocidas: <b>$1 / $2</b>");
hrx(String.raw`🎁 Gifts delivered: <b>(\d+)<\/b>`, "🎁 Regalos entregados: <b>$1</b>");
hrx(String.raw`(\+\d+) friendship( \(their favourite!\))? · a new request in <span>(.+)<\/span>`, (m, n, f, c) => `${n} de amistad${f ? " (¡su favorito!)" : ""} · nueva petición en <span>${c}</span>`);
rx(String.raw`([\d.,]+) \/ ([\d.,]+) friendship to (${SP_RX_LV})`, (m, a, b, l) => `${a} / ${b} de amistad para ${spL(l)}`);
rx(String.raw`([\d.,]+) friendship · best friends!`, "$1 de amistad · ¡mejores amigos!");
hrx(String.raw`<b>📜 Their request:<\/b> (.+)`, (m, r) => `<b>📜 Su petición:</b> ${spReqEs(r)}`);
hrx(String.raw`Send (.+)\?`, (m, r) => `¿Enviar ${spReqEs(r)}?`);
function spReqEs(r) {
  return r.replace(/<b>(\d+)<\/b> DNA samples \(you choose which\)/, "<b>$1</b> muestras de ADN (tú eliges cuáles)")
    .replace(/<b>(\d+)<\/b> paintings \(you choose which\)/, "<b>$1</b> cuadros (tú eliges cuáles)")
    .replace(/<b>([\d.,]+)<\/b> (stardust|polvo estelar)/, "<b>$1</b> de polvo estelar")
    .replace(/<b>(\d+)<\/b> ([A-Za-zíáéóú]+)/g, (m, n, o) => `<b>${n}</b> ${ES[o] || o}`);
}
hrx(String.raw`🚀 (🎁 Gift for the|Exploring:) ?(${SP_RX_NAME})? ?· (arrives in|coming home, back in) <b>([^<]+)<\/b>( · 🏴‍☠️ cargo stolen)?`, (m, k, n, w, c, st) =>
  `🚀 ${k.startsWith("🎁") ? `🎁 Regalo para los ${spN(n)}` : `Explorando: ${spN(n)}`} · ${w === "arrives in" ? "llega en" : "vuelve a casa, de vuelta en"} <b>${c}</b>${st ? " · 🏴‍☠️ carga robada" : ""}`);
hrx(String.raw`🚀 Exploring an unknown system · (arrives in|coming home, back in) <b>(.+)<\/b>`, (m, w, c) => `🚀 Explorando un sistema desconocido · ${w === "arrives in" ? "llega en" : "vuelve a casa, de vuelta en"} <b>${c}</b>`);
hrx(String.raw`Something is out there\. Send a ship to explore it: <b>(\d+) min<\/b> there and <b>(\d+) min<\/b> back\.`, "Ahí fuera hay algo. Envía una nave a explorarlo: <b>$1 min</b> de ida y <b>$2 min</b> de vuelta.");
hrx(String.raw`Your scanners can't find this system yet\. Become <b>Acquainted<\/b> with (a nearby race|the <b>(${SP_RX_NAME})<\/b>) and they will tell you where it is\.`, (m, w, n) =>
  `Tus escáneres aún no encuentran este sistema. Logra el nivel <b>Conocida</b> con ${n ? `los <b>${spN(n)}</b>` : "una raza cercana"} y te dirán dónde está.`);
rx(String.raw`Gift for the (${SP_RX_NAME})`, (m, n) => `Regalo para los ${spN(n)}`);
rx(String.raw`Ask for something else \((.+)\)`, "Pedir otra cosa ($1)");
hrx(String.raw`Choose <b>(\d+)<\/b> (DNA samples|paintings) to send: <b>(\d+) \/ (\d+)<\/b> chosen\.`, (m, n, w, a, b) => `Elige <b>${n}</b> ${w === "paintings" ? "cuadros" : "muestras de ADN"} para enviar: <b>${a} / ${b}</b> elegidos.`);
rx(String.raw`Your ship flies (\d+) min there and (\d+) min back, and brings their goods home\.`, "Tu nave tarda $1 min en ir y $2 min en volver, y trae sus bienes a casa.");
hrx(String.raw`<b>Opens when you build the 🚀 Space Mission Center<\/b> \(💰 Income → 🔬 Science\)\.`, "<b>Se abre al construir el 🚀 Centro de Misiones Espaciales</b> (💰 Ingresos → 🔬 Ciencia).");
// notices
rx(String.raw`Gift on its way to the (${SP_RX_NAME}) \((\d+) min\)\.`, (m, n, x) => `Regalo de camino a los ${spN(n)} (${x} min).`);
rx(String.raw`A ship is on its way to explore an unknown system \((\d+) min there, (\d+) min back\)\.`, "Una nave va de camino a explorar un sistema desconocido ($1 min de ida, $2 de vuelta).");
rx(String.raw`Your ship is back from the (${SP_RX_NAME})( with (\S+) (\d+) (${SP_RX_GOOD}))?\.`, (m, n, w, e, x, g) => `Tu nave ha vuelto de los ${spN(n)}${w ? ` con ${e} ${x} ${spG(g)}` : ""}.`);
hrx(String.raw`First contact! Your ship met the <b>(${SP_RX_NAME})<\/b> \((.+)\)\. See 🚢 Logistics → 🌌 Space\.`, (m, n, tl) => `¡Primer contacto! Tu nave ha conocido a los <b>${spN(n)}</b> (${SP_ES_TITLE[tl] || tl}). Míralo en 🚢 Logística → 🌌 Espacio.`);
hrx(String.raw`(\S+) The <b>(${SP_RX_NAME})<\/b> are now <b>(${SP_RX_LV})<\/b>! They load a thank-you gift on your ship\.`, (m, ic, n, l) => `${ic} ¡Los <b>${spN(n)}</b> ya son <b>${spL(l)}</b>! Cargan un regalo de agradecimiento en tu nave.`);
hrx(String.raw`The <b>(${SP_RX_NAME})<\/b> loved your gift: \+(\d+) friendship\.`, (m, n, x) => `A los <b>${spN(n)}</b> les ha encantado tu regalo: +${x} de amistad.`);
rx(String.raw`The (${SP_RX_NAME}) told you where to find a new system\. Send a ship to explore it!`, (m, n) => `Los ${spN(n)} te han dicho dónde encontrar un sistema nuevo. ¡Envía una nave a explorarlo!`);
rx(String.raw`Space: (\d+) updates while you were away\. See 🚢 Logistics → 🌌 Space\.`, "Espacio: $1 novedades mientras no estabas. Míralo en 🚢 Logística → 🌌 Espacio.");
H("New in 🚢 Logistics: <b>Space</b>! Explore the galaxy and meet alien races.", "Novedad en 🚢 Logística: ¡<b>Espacio</b>! Explora la galaxia y conoce razas alienígenas.");
ES["New in 🚢 Logistics: <b>Space</b>! Explore the galaxy and meet alien races."] = "Novedad en 🚢 Logística: ¡<b>Espacio</b>! Explora la galaxia y conoce razas alienígenas.";
rx(String.raw`First contact! Your ship met the <b>(${SP_RX_NAME})</b> \((.+)\)\. See 🚢 Logistics → 🌌 Space\.`, (m, n, tl) => `¡Primer contacto! Tu nave ha conocido a los <b>${spN(n)}</b> (${SP_ES_TITLE[tl] || tl}). Míralo en 🚢 Logística → 🌌 Espacio.`);
rx(String.raw`The <b>(${SP_RX_NAME})</b> are now <b>(${SP_RX_LV})</b>! They load a thank-you gift on your ship\.`, (m, n, l) => `¡Los <b>${spN(n)}</b> ya son <b>${spL(l)}</b>! Cargan un regalo de agradecimiento en tu nave.`);
rx(String.raw`The <b>(${SP_RX_NAME})</b> loved your gift: \+(\d+) friendship\.`, (m, n, x) => `A los <b>${spN(n)}</b> les ha encantado tu regalo: +${x} de amistad.`);
// wiki
H("<b>Ships:</b> 🚀 Space Mission Center 1 ship, and more from other space buildings (up to 6). Ships keep flying while the game is closed.",
  "<b>Naves:</b> 🚀 Centro de Misiones Espaciales 1 nave, y más con otros edificios espaciales (hasta 6). Las naves siguen volando con el juego cerrado.");
H("<b>1. Explore:</b> send a ship to an unknown signal. It flies there and back (6–18 min each way) and meets the race that lives there. Three systems are reachable from the start; each of the others is revealed by its neighbour once you are <b>Acquainted</b>.",
  "<b>1. Explorar:</b> envía una nave a una señal desconocida. Va y vuelve (6–18 min por trayecto) y conoce a la raza que vive allí. Tres sistemas se pueden alcanzar desde el principio; cada uno de los demás te lo revela su vecino cuando llegas a <b>Conocida</b>.");
hrx(String.raw`<b>2\. Gifts:<\/b> each race asks for one gift at a time: money, ore from your 🏦 vault, (DNA samples, )?paintings or stardust\. Their favourite kind gives \+(\d+) friendship, the other \+(\d+)\. A request changes every 24 hours, or ask for something else every 4 hours\. Paintings you give away count as sold\. Only one gift per race can be on its way at a time\.`,
  (m, d, a, b) => `<b>2. Regalos:</b> cada raza pide un regalo cada vez: dinero, mineral de tu 🏦 cámara, ${d ? "muestras de ADN, " : ""}cuadros o polvo estelar. Su tipo favorito da +${a} de amistad; el otro, +${b}. Una petición cambia cada 24 horas, o puedes pedir otra cosa cada 4 horas. Los cuadros que regalas cuentan como vendidos. Solo puede haber un regalo por raza de camino a la vez.`);
H("<b>3. Alien goods:</b> your ship comes back with the race's own goods (more at higher friendship, plus a thank-you shipment at every new level). Trading them comes in a later update.",
  "<b>3. Bienes alienígenas:</b> tu nave vuelve con los bienes propios de la raza (más cuanto mayor sea la amistad, y un envío de agradecimiento en cada nivel nuevo). Comerciar con ellos llegará en una próxima actualización.");
rx(String.raw`(\S+) (${SP_RX_LV})`, (m, ic, l) => `${ic} ${spL(l)}`);
hrx(String.raw`🚚 <b>Logistics XP:<\/b> every gift trip gives (\d+) XP per minute of the round trip when the ship gets home\. Exploring gives no XP\.`,
  "🚚 <b>XP de logística:</b> cada viaje con un regalo da $1 XP por minuto de ida y vuelta cuando la nave llega a casa. Explorar no da XP.");
ES["🚚 Gift trips to alien races give Logistics XP (6 XP per minute of the trip). Exploring gives none."] = "🚚 Los viajes con regalos a razas alienígenas dan XP de logística (6 XP por minuto de viaje). Explorar no da XP.";
// 🆘 alien emergency, resources bar, exploring cost
const SP_ES_SOS = {
  "A quake is splitting their home asteroid apart!": "¡Un terremoto está partiendo en dos su asteroide natal!",
  "Their central vault computer crashed and nobody can count anything!": "¡El ordenador de su cámara central se ha colgado y nadie puede contar nada!",
  "A solar storm is blowing their starlight jars away!": "¡Una tormenta solar se está llevando sus tarros de luz estelar!",
  "A strange blight is spreading through their jungle world!": "¡Una plaga extraña se extiende por su mundo selvático!",
  "Their colour crystals went grey and they can't paint anymore!": "¡Sus cristales de color se han vuelto grises y ya no pueden pintar!",
  "Their flagship reactor is overheating!": "¡El reactor de su buque insignia se está sobrecalentando!",
};
Object.assign(ES, SP_ES_SOS, { "Money": "Dinero", "Earth resources": "Recursos de la Tierra", "Scientists": "Científicos", "Space resources": "Recursos espaciales", "Space Logistics": "Logística espacial",
  "none yet": "ninguno todavía", "Alien emergency": "Emergencia alienígena", "An alien race needs help: see 🚢 Logistics → 🌌 Space": "Una raza alienígena necesita ayuda: mira 🚢 Logística → 🌌 Espacio" });
const spSosEs = (x) => SP_ES_SOS[x] || x;
rx(String.raw`Explore · 🔬 (\d+) scientists`, "Explorar · 🔬 $1 científicos");
rx(String.raw`You need (\d+) scientists \(you have (\d+)\)\.`, "Necesitas $1 científicos (tienes $2).");
rx(String.raw`You have (\d+) scientists\.`, "Tienes $1 científicos.");
rx(String.raw`Send (\d+) scientists`, "Enviar $1 científicos");
rx(String.raw`The (${SP_RX_NAME}) need help!`, (m, n) => `¡Los ${spN(n)} necesitan ayuda!`);
rx(String.raw`(.+!) Send (\d+) 🔬 scientists within (\d+) minutes \(🚢 Logistics → 🌌 Space\)\.`, (m, x, n, t) => `${spSosEs(x)} Envía ${n} 🔬 científicos en ${t} minutos (🚢 Logística → 🌌 Espacio).`);
hrx(String.raw`<b>🆘 The (${SP_RX_NAME}) need help!<\/b>(.+!) Send (\d+) 🔬 scientists within (\d+) minutes \(🚢 Logistics → 🌌 Space\)\.<br><small>.+<\/small>`, (m, n, x, k, tm) =>
  `<b>🆘 ¡Los ${spN(n)} necesitan ayuda!</b>${spSosEs(x)} Envía ${k} 🔬 científicos en ${tm} minutos (🚢 Logística → 🌌 Espacio).<br><small>Haz clic para cerrar</small>`);
hrx(String.raw`Send <b>(\d+) 🔬 scientists<\/b> before the time runs out: <b>\+(\d+)<\/b> friendship\. If nobody comes, they lose <b>(\d+)<\/b> friendship with you\.`,
  "Envía <b>$1 🔬 científicos</b> antes de que se acabe el tiempo: <b>+$2</b> de amistad. Si nadie acude, perderán <b>$3</b> de amistad contigo.");
rx(String.raw`Too late for the (${SP_RX_NAME})`, (m, n) => `Demasiado tarde para los ${spN(n)}`);
rx(String.raw`Nobody came to help\. They lost (\d+) friendship with you\.`, "Nadie acudió a ayudar. Han perdido $1 de amistad contigo.");
hrx(String.raw`<b>💔 Too late for the (${SP_RX_NAME})<\/b>Nobody came to help\. They lost (\d+) friendship with you\.<br><small>.+<\/small>`, (m, n, x) =>
  `<b>💔 Demasiado tarde para los ${spN(n)}</b>Nadie acudió a ayudar. Han perdido ${x} de amistad contigo.<br><small>Haz clic para cerrar</small>`);
rx(String.raw`Your scientists saved the day! The (${SP_RX_NAME}) are grateful: \+(\d+) friendship\.`, (m, n, x) => `¡Tus científicos han salvado el día! Los ${spN(n)} te lo agradecen: +${x} de amistad.`);
rx(String.raw`The <b>(${SP_RX_NAME})</b> are now <b>(${SP_RX_LV})</b>!`, (m, n, l) => `¡Los <b>${spN(n)}</b> ya son <b>${spL(l)}</b>!`);
H("🆘 <b>Alien emergencies:</b> while you play, a race you know may suddenly need help. Send 20 🔬 scientists within 15 minutes for +300 friendship; if nobody comes, they lose 200 friendship with you. Exploring takes 10 scientists.",
  "🆘 <b>Emergencias alienígenas:</b> mientras juegas, una raza que conoces puede necesitar ayuda de repente. Envía 20 🔬 científicos en 15 minutos para ganar +300 de amistad; si nadie acude, perderán 200 de amistad contigo. Explorar cuesta 10 científicos.");
ES["🆘 Space: alien races sometimes have an emergency while you play. Send 20 🔬 scientists within 15 minutes for extra friendship, or they lose friendship with you. Exploring now takes 10 scientists."] =
  "🆘 Espacio: a veces las razas alienígenas tienen una emergencia mientras juegas. Envía 20 🔬 científicos en 15 minutos para ganar amistad extra; si no, perderán amistad contigo. Explorar ahora cuesta 10 científicos.";
// 🛣️ trade routes and 🏪 market
Object.assign(ES, { "Market": "Mercado", "Trade route": "Ruta comercial", "Open trade route": "Abrir ruta comercial", "Stop the route": "Parar la ruta", "Keep it running": "Mantenerla activa",
  "Stops when the ship gets home.": "Se para cuando la nave llegue a casa.", "More goods and faster trips at 💛 Trusted and 💖 Allies.": "Más bienes y viajes más rápidos en 💛 De confianza y 💖 Aliada.",
  "Alien market": "Mercado alienígena", "Good": "Bien", "You have": "Tienes", "Price each": "Precio por unidad", "Last 6 hours": "Últimas 6 horas", "Sell": "Vender",
  "Unknown goods": "Bienes desconocidos", "Meet more alien races to trade their goods.": "Conoce más razas alienígenas para comerciar con sus bienes.", "Sold": "Vendidos", "Earned": "Ganado",
  "Sell the goods your ships bring home. Prices move every 30 minutes: sell when they are high. The further away a race lives, the more its goods are worth.":
    "Vende los bienes que traen tus naves. Los precios cambian cada 30 minutos: vende cuando estén altos. Cuanto más lejos viva una raza, más valen sus bienes.",
  "Sell them in 🌌 Space → Market, or give them to the races that want them (🔮 the Mystics, 🤖 the Machines and 👑 the Ancients).": "Véndelos en 🌌 Espacio → Mercado, o regálaselos a las razas que los quieren (🔮 los Místicos, 🤖 las Máquinas y 👑 los Ancestrales).",
  "Open for business": "Abierto al comercio", "Open your first trade route": "Abre tu primera ruta comercial", "Galactic merchant": "Mercader galáctico",
  "Sell 1,000 alien goods at the market": "Vende 1.000 bienes alienígenas en el mercado",
});
hrx(String.raw`🛣️ <b>Trade route:<\/b> opens when you are <b>😊 Friendly<\/b> with the (${SP_RX_NAME})\.`, (m, n) => `🛣️ <b>Ruta comercial:</b> se abre cuando tu amistad con los ${spN(n)} sea <b>😊 Amistosa</b>.`);
hrx(String.raw`🛣️ <b>Trade route:<\/b> one ship flies to the (${SP_RX_NAME}) and back <b>for good<\/b>, bringing (\S+) <b>(\d+)<\/b> (${SP_RX_GOOD}) every trip \((\d+) min round trip\)\. It keeps going while the game is closed\.`, (m, n, e, x, g, t) =>
  `🛣️ <b>Ruta comercial:</b> una nave va y vuelve de los ${spN(n)} <b>para siempre</b> y trae ${e} <b>${x}</b> ${spG(g)} en cada viaje (${t} min ida y vuelta). Sigue funcionando con el juego cerrado.`);
hrx(String.raw`🛣️ <b>Trade route open<\/b> · (\S+) <b>(\d+)<\/b> (${SP_RX_GOOD}) every trip \((\d+) min round trip\)`, (m, e, x, g, t) => `🛣️ <b>Ruta comercial abierta</b> · ${e} <b>${x}</b> ${spG(g)} en cada viaje (${t} min ida y vuelta)`);
hrx(String.raw`🚀 🛣️ Trade route: (${SP_RX_NAME}) · (arrives in|coming home, back in) <b>([^<]+)<\/b>( · 🏴‍☠️ cargo stolen)?`, (m, n, w, c, st) => `🚀 🛣️ Ruta comercial: ${spN(n)} · ${w === "arrives in" ? "llega en" : "vuelve a casa, de vuelta en"} <b>${c}</b>${st ? " · 🏴‍☠️ carga robada" : ""}`);
rx(String.raw`Trips so far: (\d+) · goods brought home: ([\d.,]+)`, "Viajes hasta ahora: $1 · bienes traídos: $2");
rx(String.raw`Trade route to the (${SP_RX_NAME}) is open! One ship now flies there and back for good\.`, (m, n) => `¡Ruta comercial con los ${spN(n)} abierta! Ahora una nave va y vuelve para siempre.`);
rx(String.raw`The trade route to the (${SP_RX_NAME}) has stopped\. Your ship is home\.`, (m, n) => `La ruta comercial con los ${spN(n)} se ha parado. Tu nave está en casa.`);
hrx(String.raw`⏱️ Prices change in <b>(.+)<\/b>`, "⏱️ Los precios cambian en <b>$1</b>");
rx(String.raw`from the (${SP_RX_NAME})`, (m, n) => `de los ${spN(n)}`);
rx(String.raw`Sell all \((.+)\)`, "Vender todo ($1)"); ES["Sell all"] = "Vender todo";
rx(String.raw`Sold (\S+) (\d+) (${SP_RX_GOOD}) for (.+)\.`, (m, e, n, g, x) => `Has vendido ${e} ${n} ${spG(g)} por ${x}.`);
hrx(String.raw`📦 Sold: <b>([\d.,]+)<\/b>`, "📦 Vendidos: <b>$1</b>"); hrx(String.raw`💰 Earned: <b>(.+)<\/b>`, "💰 Ganado: <b>$1</b>");
hrx(String.raw`🛣️ <b>Trade routes<\/b> \(from 😊 Friendly\): one ship flies to the race and back for good, bringing (\d+) goods every trip \((\d+) at 💛 Trusted and (\d+) at 💖 Allies, with trips 15% and 30% faster\)\. It keeps going while the game is closed and gives Logistics XP like a gift trip\. Stop it any time: the ship comes home after its trip\.`,
  "🛣️ <b>Rutas comerciales</b> (desde 😊 Amistosa): una nave va y vuelve de la raza para siempre y trae $1 bienes en cada viaje ($2 en 💛 De confianza y $3 en 💖 Aliada, con viajes un 15 % y un 30 % más rápidos). Sigue funcionando con el juego cerrado y da XP de logística como un viaje con regalo. Puedes pararla cuando quieras: la nave vuelve a casa tras su viaje.");
hrx(String.raw`🏪 <b>Market<\/b> \(🌌 Space → Market\): sell alien goods for money\. A good is worth about ([\d.]+) × the race's distance \(in minutes\) minutes of your business income, and every price moves up or down every 30 minutes\.( Once you are 💖 Allies with a race, you can also buy its goods there; buying always costs more than the best selling price\.)?`,
  (m, x, b) => `🏪 <b>Mercado</b> (🌌 Espacio → Mercado): vende bienes alienígenas por dinero. Un bien vale unos ${x.replace(".", ",")} × la distancia de la raza (en minutos) minutos de los ingresos de tus negocios, y cada precio sube o baja cada 30 minutos.${b ? " Cuando seas 💖 Aliada de una raza, también podrás comprar allí sus bienes; comprar siempre cuesta más que el mejor precio de venta." : ""}`);
H("<b>3. Alien goods:</b> your ship comes back with the race's own goods (more at higher friendship, plus a thank-you shipment at every new level). Sell them at the 🏪 Market.",
  "<b>3. Bienes alienígenas:</b> tu nave vuelve con los bienes propios de la raza (más cuanto mayor sea la amistad, y un envío de agradecimiento en cada nivel nuevo). Véndelos en el 🏪 Mercado.");
H("🛣️ Space: <b>trade routes</b>! Once you are 😊 Friendly with a race, give it a ship that flies back and forth for good and brings their goods home every trip (more and faster at Trusted and Allies).",
  "🛣️ Espacio: ¡<b>rutas comerciales</b>! Cuando tu amistad con una raza sea 😊 Amistosa, dale una nave que vaya y vuelva para siempre y traiga sus bienes en cada viaje (más y más rápido en De confianza y Aliada).");
H("🏪 New <b>Market</b> page under 🌌 Space: sell your alien goods. Prices move every 30 minutes, and goods from far-away races are worth more.",
  "🏪 Nueva página <b>Mercado</b> en 🌌 Espacio: vende tus bienes alienígenas. Los precios cambian cada 30 minutos, y los bienes de razas lejanas valen más.");
ES["🏆 2 new 🪐 Space achievements: 🛣️ Open for business and 🏪 Galactic merchant."] = "🏆 2 logros nuevos de 🪐 Espacio: 🛣️ Abierto al comercio y 🏪 Mercader galáctico.";
// 🔮 release 3: network races, events, alliance bonuses
Object.assign(ES, {
  "Ancient seers who read the future in crystals and sound. They only trade in things touched by other worlds.": "Antiguos videntes que leen el futuro en cristales y sonidos. Solo comercian con cosas que han tocado otros mundos.",
  "A planet-sized thinking machine with millions of little helpers. It wants rare materials to build an even bigger brain.": "Una máquina pensante del tamaño de un planeta con millones de pequeños ayudantes. Quiere materiales raros para construirse un cerebro aún mayor.",
  "The oldest beings in the galaxy, sleeping in their golden ruins. Only the most trusted traders may visit them.": "Los seres más antiguos de la galaxia, dormidos en sus ruinas doradas. Solo los comerciantes de más confianza pueden visitarlos.",
  "Your alliance bonuses": "Tus bonificaciones de alianza", "Alliance bonus": "Bonificación de alianza", "Wants a mix of": "Quiere una mezcla de",
  "Pirates!": "¡Piratas!", "Run for it": "Huir", "No answer in 1 minute: your captain runs for it.": "Sin respuesta en 1 minuto: tu capitán intentará huir.", "cargo stolen": "carga robada",
  "Galactic network": "Red galáctica", "Meet all 9 alien races": "Conoce las 9 razas alienígenas", "Friends forever": "Amigos para siempre", "Become Allies with 3 alien races": "Hazte Aliado de 3 razas alienígenas",
});
function spBonusEs(x) {
  return x.replace(/^\+(\d+)% ore value in the ⛏️ Gold Mine Dig$/, "+$1 % de valor del mineral en la ⛏️ Excavación de la mina de oro")
    .replace(/^\+(\d+)% income \(businesses, special businesses and clicks\)$/, "+$1 % de ingresos (negocios, negocios especiales y clics)")
    .replace(/^\+(\d+)% stardust in 🚀 Nebula Strike$/, "+$1 % de polvo estelar en 🚀 Nebula Strike")
    .replace(/^\+(\d+)% pay on every 🌍 Earth logistics contract$/, "+$1 % de pago en cada contrato de logística 🌍 Tierra")
    .replace(/^\+(\d+)% 🏛️ Art Gallery income$/, "+$1 % de ingresos de la 🏛️ Galería de arte")
    .replace(/^\+(\d+)% space mission rewards, and pirates leave your ships alone$/, "+$1 % en las recompensas de misiones espaciales, y los piratas dejan en paz a tus naves")
    .replace(/^Trade routes (\d+)% faster$/, "Rutas comerciales un $1 % más rápidas")
    .replace(/^Gift and exploring trips 15% faster$/, "Viajes de regalo y exploración un 15 % más rápidos")
    .replace(/^\+1 spaceship( \(and trips stay 15% faster\))?$/, (m, a) => `+1 nave espacial${a ? " (y los viajes siguen un 15 % más rápidos)" : ""}`)
    .replace(/^\+1 spaceship · trips 15% faster$/, "+1 nave espacial · viajes un 15 % más rápidos")
    .replace(/^\+(\d+)% on every 🏪 Market price$/, "+$1 % en todos los precios del 🏪 Mercado");
}
rx(String.raw`(Trusted|Allies): (.+)`, (m, l, x) => { const o = spBonusEs(x); return o === x ? null : `${l === "Trusted" ? "De confianza" : "Aliada"}: ${o}`; });
rx(String.raw`(${SP_RX_NAME}): (.+)`, (m, n, x) => { const o = spBonusEs(x); return o === x ? null : `${spN(n)}: ${o}`; });
hrx(String.raw`❤️ <b>Wants a mix of:<\/b> (.+) <span>\(\+(\d+) friendship\)<\/span>`, (m, l, n) =>
  `❤️ <b>Quiere una mezcla de:</b> ${l.replace(new RegExp(SP_RX_GOOD, "g"), (g) => spG(g))} <span>(+${n} de amistad)</span>`);
rx(String.raw`Special request! Bring it in time for extra friendship and goods, or they will be offended \(−(\d+)\)\.`, "¡Petición especial! Llévala a tiempo para ganar amistad y bienes extra, o se ofenderán (−$1).");
hrx(String.raw`(\+\d+) friendship( \(their favourite!\))? · time left <span>(.+)<\/span>`, (m, n, f, c) => `${n} de amistad${f ? " (¡su favorito!)" : ""} · tiempo restante <span>${c}</span>`);
rx(String.raw`The (${SP_RX_NAME}) are offended: nobody brought their special request\. −(\d+) friendship\.`, (m, n, x) => `Los ${spN(n)} se han ofendido: nadie les llevó su petición especial. −${x} de amistad.`);
hrx(String.raw`Space pirates stopped your ship on its way to the <b>(${SP_RX_NAME})<\/b>\.`, (m, n) => `Unos piratas espaciales han parado tu nave de camino a los <b>${spN(n)}</b>.`);
hrx(String.raw`💰 Pay them <b>(.+)<\/b> to pass, or 🚀 run for it: a 50% chance they take your cargo( \(exploring ships carry nothing worth taking\))?\.`, (m, x, e) =>
  `💰 Págales <b>${x}</b> para pasar, o 🚀 huye: hay un 50 % de probabilidades de que se lleven tu carga${e ? " (las naves de exploración no llevan nada de valor)" : ""}.`);
rx(String.raw`Pay (.+)`, "Pagar $1");
rx(String.raw`You paid the pirates\. Your ship flies on to the (${SP_RX_NAME})\.`, (m, n) => `Has pagado a los piratas. Tu nave sigue hacia los ${spN(n)}.`);
rx(String.raw`Your ship to the (${SP_RX_NAME}) flew into an asteroid field: (\d+) min late\.`, (m, n, x) => `Tu nave hacia los ${spN(n)} ha atravesado un campo de asteroides: ${x} min de retraso.`);
rx(String.raw`Your ship found a lost ship of the (${SP_RX_NAME}) and towed it home: \+(\d+) friendship\.`, (m, n, x) => `Tu nave ha encontrado una nave perdida de los ${spN(n)} y la ha remolcado a casa: +${x} de amistad.`);
rx(String.raw`Pirates caught your ship to the (${SP_RX_NAME}) and took the cargo!`, (m, n) => `¡Los piratas han atrapado tu nave hacia los ${spN(n)} y se han llevado la carga!`);
rx(String.raw`Your ship to the (${SP_RX_NAME}) escaped the pirates!`, (m, n) => `¡Tu nave hacia los ${spN(n)} ha escapado de los piratas!`);
rx(String.raw`Pirates stole your gift for the (${SP_RX_NAME})\. They will ask for something new\.`, (m, n) => `Los piratas robaron tu regalo para los ${spN(n)}. Te pedirán algo nuevo.`);
hrx(String.raw`Only the most trusted traders may visit this system\. Become <b>💛 Trusted<\/b> with <b>(\d+)<\/b> races \(you have (\d+)\)\.`, "Solo los comerciantes de más confianza pueden visitar este sistema. Logra el nivel <b>💛 De confianza</b> con <b>$1</b> razas (tienes $2).");
hrx(String.raw`Your scanners can't find this system yet\. Become <b>😊 Friendly<\/b> with (a nearby race|the <b>(${SP_RX_NAME})<\/b>) and they will tell you where it is\.`, (m, w, n) =>
  `Tus escáneres aún no encuentran este sistema. Logra el nivel <b>😊 Amistosa</b> con ${n ? `los <b>${spN(n)}</b>` : "una raza cercana"} y te dirán dónde está.`);
H("<b>1. Explore:</b> send a ship to an unknown signal. It flies there and back (6–40 min each way) and meets the race that lives there. Three systems are reachable from the start; each of the others is revealed by its neighbour once you are <b>Acquainted</b>.",
  "<b>1. Explorar:</b> envía una nave a una señal desconocida. Va y vuelve (6–40 min por trayecto) y conoce a la raza que vive allí. Tres sistemas se pueden alcanzar desde el principio; cada uno de los demás te lo revela su vecino cuando llegas a <b>Conocida</b>.");
H("🔮 <b>Network races:</b> the Mystics and the Machines (found through a 😊 Friendly neighbour) and the Ancients (once 3 races trust you, 💛 Trusted) only want other races' goods.",
  "🔮 <b>Razas de la red:</b> los Místicos y las Máquinas (que encuentras gracias a un vecino 😊 Amistoso) y los Ancestrales (cuando 3 razas confían en ti, 💛 De confianza) solo quieren bienes de otras razas.");
hrx(String.raw`⭐ <b>Special requests:<\/b> sometimes a race asks for 50% more within 12 hours, for ([\d.]+)× friendship and extra goods\. Let it run out and they are offended \(−(\d+) friendship\)\.`,
  (m, x, o) => `⭐ <b>Peticiones especiales:</b> a veces una raza pide un 50 % más en 12 horas, a cambio de ${x.replace(".", ",")}× de amistad y bienes extra. Si se acaba el tiempo, se ofende (−${o} de amistad).`);
hrx(String.raw`☄️ <b>On the way:<\/b> an asteroid field can make a trip (\d+)% longer; your ship may rescue a lost alien ship \(\+(\d+) friendship\); and pirates may stop it: pay a toll \((\d+) min of income\) or run for it \(50% chance to lose the cargo\)\. Pirates leave you alone once the Void Corsairs are 💛 Trusted\.`,
  "☄️ <b>Por el camino:</b> un campo de asteroides puede alargar un viaje un $1 %; tu nave puede rescatar una nave alienígena perdida (+$2 de amistad); y los piratas pueden pararla: paga un peaje ($3 min de ingresos) o huye (50 % de probabilidades de perder la carga). Los piratas te dejan en paz cuando los Corsarios del Vacío son 💛 De confianza.");
H("🏅 Alliance bonuses last while you keep that friendship level.", "🏅 Las bonificaciones de alianza duran mientras mantengas ese nivel de amistad.");
ES["🏅 Alliance bonuses last while you keep that friendship level."] = "🏅 Las bonificaciones de alianza duran mientras mantengas ese nivel de amistad.";
ES["💛 Trusted"] = "💛 De confianza";
ES["Alliance bonuses last while you keep that friendship level."] = "Las bonificaciones de alianza duran mientras mantengas ese nivel de amistad.";
rx(String.raw`(\+\d+% .+|Trade routes \d+% faster|Gift and exploring trips 15% faster|\+1 spaceship)`, (m, x) => { const o = spBonusEs(x); return o === x ? null : o; }); ES["💖 Allies"] = "💖 Aliada";
ES["🔮 Space: 3 new alien races far out on the star map: the Mystics, the Machines and the Ancients. They only want goods from other races, so build your trading network to reach them."] =
  "🔮 Espacio: 3 razas alienígenas nuevas en los confines del mapa estelar: los Místicos, las Máquinas y los Ancestrales. Solo quieren bienes de otras razas, así que construye tu red comercial para llegar a ellos.";
H("🏅 <b>Alliance bonuses</b>: become 💛 Trusted and 💖 Allies with a race for a permanent bonus (more income, ore value, stardust, faster trade routes, an extra spaceship and more).",
  "🏅 <b>Bonificaciones de alianza</b>: llega a 💛 De confianza y 💖 Aliada con una raza para obtener una bonificación permanente (más ingresos, valor del mineral, polvo estelar, rutas comerciales más rápidas, una nave espacial extra y más).");
ES["☄️ Space events: special requests with a deadline, asteroid fields, lost alien ships to rescue, and pirates who want a toll."] = "☄️ Eventos espaciales: peticiones especiales con plazo, campos de asteroides, naves alienígenas perdidas que rescatar y piratas que piden peaje.";
ES["🏆 2 new 🪐 Space achievements: 🌌 Galactic network and 👑 Friends forever."] = "🏆 2 logros nuevos de 🪐 Espacio: 🌌 Red galáctica y 👑 Amigos para siempre.";
Object.assign(ES, { "Zoom in": "Acercar", "Zoom out": "Alejar", "Whole map": "Mapa completo" });
// 🐾 Pet page and collections as rewards
Object.assign(ES, { "Pet": "Mascota", "No pet yet": "Todavía no tienes mascota", "Pets live on your 💰 Income page, keep you company and help you out.": "Las mascotas viven en tu página de 💰 Ingresos, te hacen compañía y te ayudan.",
  "More pets are coming": "Llegarán más mascotas", "New friends will join in future updates.": "Nuevos amigos se unirán en próximas actualizaciones.", "Mochi": "Mochi",
  "Petted": "Caricias", "Coin taps": "Toques a la moneda", "Show on the 💰 Income page": "Mostrar en la página de 💰 Ingresos",
  "Buys the energy drink by itself when it's ready and you can afford it.": "Compra la bebida energética por su cuenta cuando está lista y te la puedes permitir.",
  "While the drink is active, it taps the coin for you: 10 clicks per second, worth the same as yours (they count for 🏆 achievements too).": "Mientras la bebida está activa, toca la moneda por ti: 10 clics por segundo, que valen lo mismo que los tuyos (también cuentan para los 🏆 logros).",
  "While the drink cools down it walks off and sleeps, and wakes up 10 seconds before the next drink.": "Mientras la bebida se recarga, se aparta y duerme, y se despierta 10 segundos antes de la siguiente bebida.",
  "Click it to pet it. Pet it 5 times in a row and it jumps for joy!": "Haz clic en ella para acariciarla. ¡Acaríciala 5 veces seguidas y saltará de alegría!",
  "Unlock your first cosmetic item (🏆 Achievements → 🎁 Rewards)": "Desbloquea tu primer objeto cosmético (🏆 Logros → 🎁 Recompensas)",
  "Unlock the whole 🦁 Emperor Collection and wear all 3 items at once (background, coin and cards)": "Desbloquea toda la 🦁 Colección Emperador y lleva sus 3 objetos a la vez (fondo, moneda y cartas)",
  "Finish the achievements a collection needs to unlock it. Then turn its items on or off here any time.": "Completa los logros que pide una colección para desbloquearla. Después, activa o desactiva sus objetos aquí cuando quieras.",
  "Unlock 💰 Multi-millionaire": "Desbloquea 💰 Multimillonario", "Unlock 🤑 Beat the house": "Desbloquea 🤑 Ganarle a la banca", "Unlock 🏦 Friends in high places": "Desbloquea 🏦 Amigos en las altas esferas",
  "Unlock 💸 Money fountain, 🎩 Lobbyist and 🧙 Feeling magical": "Desbloquea 💸 Fuente de dinero, 🎩 Lobista y 🧙 Sensación mágica", "Unlock 🏰 Coin emperor": "Desbloquea 🏰 Emperador de las monedas",
  "A pet lives on your 💰 Income page and helps you. Find one in a 🏴‍☠️ pirate loot box (🎮 Mini-games → 🚀 Nebula Strike, levels 4 and 5, or the pirate chest in the hangar). More pets are coming.":
    "Una mascota vive en tu página de 💰 Ingresos y te ayuda. Encuentra una en un 🏴‍☠️ cofre del botín pirata (🎮 Minijuegos → 🚀 Nebula Strike, niveles 4 y 5, o el cofre pirata del hangar). Llegarán más mascotas.",
  "It buys the energy drink by itself when it's ready and you can afford it.": "Compra la bebida energética por su cuenta cuando está lista y te la puedes permitir.",
  "While the drink is active, it taps the coin for you: 10 clicks per second, worth the same as yours (they count for 🏆 achievements).": "Mientras la bebida está activa, toca la moneda por ti: 10 clics por segundo, que valen lo mismo que los tuyos (cuentan para los 🏆 logros).",
  "During the cooldown it sleeps, and wakes up 10 seconds before the next drink.": "Mientras se recarga duerme, y se despierta 10 segundos antes de la siguiente bebida.",
  "Click it to pet it. On the 🐾 Pet page you can rename it or hide it.": "Haz clic en ella para acariciarla. En la página 🐾 Mascota puedes cambiarle el nombre u ocultarla.",
  "Your pet and how to find one": "Tu mascota y cómo encontrar una",
  "Cosmetic collections (backgrounds, coins and 🃏 card decks) are unlocked by achievements. Turn them on in 🏆 Achievements → 🎁 Rewards. You can wear one item per slot, and wearing the coin and background of the same collection unlocks 🎨 \"Dressed to impress\".":
    "Las colecciones cosméticas (fondos, monedas y barajas 🃏) se desbloquean con logros. Actívalas en 🏆 Logros → 🎁 Recompensas. Puedes llevar un objeto por hueco, y llevar la moneda y el fondo de la misma colección desbloquea 🎨 «Vestido para impresionar».",
});
rx(String.raw`Your baby dragon-moth( · together since (.+))?`, (m, a, d) => `Tu bebé dragón-polilla${a ? ` · juntos desde el ${d}` : ""}`);
hrx(String.raw`🏴‍☠️ <b>How to find one:<\/b> open pirate loot boxes in 🎮 Mini-games → 🚀 Nebula Strike \(levels 4 and 5, or the pirate chest in the hangar\)\. Every box has a small chance to hold a pet\.`,
  "🏴‍☠️ <b>Cómo encontrar una:</b> abre cofres del botín pirata en 🎮 Minijuegos → 🚀 Nebula Strike (niveles 4 y 5, o el cofre pirata del hangar). Cada cofre tiene una pequeña probabilidad de traer una mascota.");
rx(String.raw`Turn (.+) (on|off)`, (m, n, o) => `${o === "on" ? "Activar" : "Desactivar"} ${ES[n] || n}`);
H("🐾 The 🛍️ Shop is now the <b>🐾 Pet</b> page: see your pet, rename it, hide it, and check its stats. More pets are coming!",
  "🐾 La 🛍️ Tienda ahora es la página <b>🐾 Mascota</b>: mira a tu mascota, cámbiale el nombre, ocúltala y consulta sus estadísticas. ¡Llegarán más mascotas!");
ES["🎁 All cosmetic collections are now rewards in 🏆 Achievements → 🎁 Rewards: 🐕 Wow So Rich (💰 Multi-millionaire), ♟️ One Step Ahead (🤑 Beat the house), 👑 Royal (🏦 Friends in high places), 🐸 Make It Rain (💸 Money fountain, 🎩 Lobbyist and 🧙 Feeling magical) and 🦁 Emperor (🏰 Coin emperor). Items you already bought stay yours."] =
  "🎁 Todas las colecciones cosméticas son ahora recompensas en 🏆 Logros → 🎁 Recompensas: 🐕 Wow So Rich (💰 Multimillonario), ♟️ «Un paso por delante» (🤑 Ganarle a la banca), 👑 Realeza (🏦 Amigos en las altas esferas), 🐸 «Lluvia de billetes» (💸 Fuente de dinero, 🎩 Lobista y 🧙 Sensación mágica) y 🦁 Emperador (🏰 Emperador de las monedas). Los objetos que ya compraste siguen siendo tuyos.";
Object.assign(ES, { "Energy drinks": "Bebidas energéticas", "Coins": "Monedas", "Cards": "Cartas", "Backgrounds": "Fondos", "Unlocked": "Desbloqueadas", "Locked": "Bloqueadas",
  "Nothing matches these filters.": "Nada coincide con estos filtros." });
// 👽 alien card v2 (painted icons sit outside the text now)
const spKindsEs = (l) => l.replace(new RegExp(SP_RX_GOOD, "g"), (g) => spG(g)).replace(/(\{i\}|\S) (Money|Ore|Paintings|Stardust|DNA samples)\b/g, (m, i, w) => `${i} ${ES[w] || w}`);
const spReqEs2 = (r) => spReqEs(r.replace(new RegExp(SP_RX_GOOD, "g"), (g) => spG(g)));
hrx(String.raw`<b>Favourite:<\/b> (.+) <span>\(\+(\d+) friendship\)<\/span>`, (m, k, n) => `<b>Favorito:</b> ${spKindsEs(k)} <span>(+${n} de amistad)</span>`);
hrx(String.raw`<b>Also likes:<\/b> (.+) <span>\(\+(\d+)\)<\/span>`, (m, k, n) => `<b>También le gusta:</b> ${spKindsEs(k)} <span>(+${n})</span>`);
hrx(String.raw`<b>Wants a mix of:<\/b> (.+) <span>\(\+(\d+) friendship\)<\/span>`, (m, k, n) => `<b>Quiere una mezcla de:</b> ${spKindsEs(k)} <span>(+${n} de amistad)</span>`);
hrx(String.raw`<b>They send back:<\/b> (\S+) (${SP_RX_GOOD}) <span>\((\d+) per gift, more when you level up\)<\/span>`, (m, e, g, n) => `<b>Te devuelven:</b> ${e} ${spG(g)} <span>(${n} por regalo, más al subir de nivel)</span>`);
hrx(String.raw`<b>Distance:<\/b> (\d+) min each way`, "<b>Distancia:</b> $1 min por trayecto");
hrx(String.raw`<b>Their request:<\/b> (.+)`, (m, r) => `<b>Su petición:</b> ${spReqEs2(r)}`);
hrx(String.raw`<b>Trade route:<\/b> opens when you are <b>😊 Friendly<\/b> with the (${SP_RX_NAME})\.`, (m, n) => `<b>Ruta comercial:</b> se abre cuando tu amistad con los ${spN(n)} sea <b>😊 Amistosa</b>.`);
hrx(String.raw`<b>Trade route:<\/b> one ship flies to the (${SP_RX_NAME}) and back <b>for good<\/b>, bringing (\S+) <b>(\d+)<\/b> (${SP_RX_GOOD}) every trip \((\d+) min round trip\)\. It keeps going while the game is closed\.`, (m, n, e, x, g, t) =>
  `<b>Ruta comercial:</b> una nave va y vuelve de los ${spN(n)} <b>para siempre</b> y trae ${e} <b>${x}</b> ${spG(g)} en cada viaje (${t} min ida y vuelta). Sigue funcionando con el juego cerrado.`);
hrx(String.raw`<b>Trade route open<\/b> · (\S+) <b>(\d+)<\/b> (${SP_RX_GOOD}) every trip \((\d+) min round trip\)`, (m, e, x, g, t) => `<b>Ruta comercial abierta</b> · ${e} <b>${x}</b> ${spG(g)} en cada viaje (${t} min ida y vuelta)`);
ES["Alliance bonus"] = "Bonificación de alianza";
// 🎨 Art Gallery 2.0: tiers, masterpieces, new tools, heatmap, daily commission
const ART_ES_TIER = { Easy: "Fácil", Normal: "Normal", Masterpiece: "Obra maestra", Starter: "Inicial" };
const ART_ES_MASTER = { "The Starry Night": "La noche estrellada", "The Great Wave off Kanagawa": "La gran ola de Kanagawa", "Sunflowers": "Los girasoles", "The Scream": "El grito",
  "Mona Lisa": "La Gioconda", "Girl with a Pearl Earring": "La joven de la perla", "Impression, Sunrise": "Impresión, sol naciente", "Red Fuji (Fine Wind, Clear Morning)": "Fuji rojo (Viento del sur, cielo despejado)",
  "The Bedroom": "El dormitorio", "Poppy Field": "Campo de amapolas" };
const ART_RX_MASTER = Object.keys(ART_ES_MASTER).map(k => k.replace(/[()]/g, "\\$&")).join("|");
Object.assign(ES, ART_ES_MASTER, { "Normal": "Normal", "Masterpiece": "Obra maestra", "Eyedropper": "Cuentagotas", "Mirror": "Espejo", "Daily commission": "Encargo diario", "Paint it": "Pintarlo",
  "Delivered!": "¡Entregado!", "Where it differs": "Dónde difiere", "Click either picture to take its colour": "Haz clic en cualquiera de los dos cuadros para coger su color",
  "Mirror mode: everything you paint is copied to the other side (left ↔ right)": "Modo espejo: todo lo que pintas se copia al otro lado (izquierda ↔ derecha)",
  "Drag to draw a straight line in the brush size (hold Shift for straight 45° angles)": "Arrastra para trazar una línea recta del tamaño del pincel (mantén Mayús para ángulos de 45°)",
  "You're painting it now. Submit a copy of 50%+ to deliver it.": "Lo estás pintando ahora. Entrega una copia del 50 % o más para cumplirlo.",
  "Apprentice: Normal": "Aprendiz: normal", "Skilled copyist: Normal": "Copista hábil: normal", "Master forger: Normal": "Maestro falsificador: normal",
  "Apprentice: Masterpiece": "Aprendiz: obra maestra", "Skilled copyist: Masterpiece": "Copista hábil: obra maestra", "Master forger: Masterpiece": "Maestro falsificador: obra maestra",
  "Submit a 50%+ match on a Normal painting": "Entrega una copia de un cuadro normal con un 50 %+ de parecido", "Submit a 75%+ match on a Normal painting": "Entrega una copia de un cuadro normal con un 75 %+ de parecido",
  "Submit a 90%+ match on a Normal painting": "Entrega una copia de un cuadro normal con un 90 %+ de parecido",
  "Submit a 50%+ match on a Masterpiece": "Entrega una copia de una obra maestra con un 50 %+ de parecido", "Submit a 75%+ match on a Masterpiece": "Entrega una copia de una obra maestra con un 75 %+ de parecido",
  "Submit a 90%+ match on a Masterpiece": "Entrega una copia de una obra maestra con un 90 %+ de parecido",
  "white": "blanco", "black": "negro", "gray": "gris", "red": "rojo", "orange": "naranja", "yellow": "amarillo", "lime": "lima", "green": "verde", "teal": "verde azulado", "sky": "celeste",
  "blue": "azul", "navy": "azul marino", "purple": "morado", "pink": "rosa", "brown": "marrón", "beige": "beis",
  "slate": "gris pizarra", "tan": "canela", "maroon": "granate", "salmon": "salmón", "ochre": "ocre", "olive": "verde oliva", "turquoise": "turquesa", "lavender": "lavanda",
  "10 famous paintings, simplified: The Starry Night, The Great Wave, Mona Lisa, The Scream and more": "10 cuadros famosos, simplificados: La noche estrellada, La gran ola, La Gioconda, El grito y más",
  "Painting": "Cuadro", "Artist": "Artista", "Year": "Año" });
rx(String.raw`Brush size (\d+) px`, "Tamaño del pincel: $1 px");
rx(String.raw`(Easy|Normal|Masterpiece) · (${NUM})`, (m, t, v) => `${ART_ES_TIER[t]} · ${v}`);
rx(String.raw`(Easy|Normal|Masterpiece): (.+)\. You earn your match % of (${NUM}): an 85% copy is worth (${NUM})\. Under (\d+)% it can't be sold or kept\.`,
  (m, t, d, v, w, u) => `${ART_ES_TIER[t]}: ${ES[d] || esq(d) || d}. Ganas tu % de parecido de ${v}: una copia al 85 % vale ${w}. Por debajo del ${u} % no se puede vender ni guardar.`);
rx(String.raw`(Easy|Normal|Masterpiece) paintings are now unlocked in the Art studio!`, (m, t) => `¡Ya puedes pintar cuadros de nivel ${ART_ES_TIER[t].toLowerCase()} en el Estudio de arte!`);
rx(String.raw`Original · (\S+) (${ART_RX_MASTER}) \((.+), (\d+)\)`, (m, e, n, a, y) => `Original · ${e} ${ART_ES_MASTER[n]} (${a}, ${y})`);
hrx(String.raw`A collector wants a copy of (?:(\S+) <b>(${ART_RX_MASTER})<\/b> \((.+?)\)|this (\S+) <b>(Normal|Masterpiece)<\/b> painting) and pays <b>×(\d+)<\/b>: up to (${NUM})\. Time left: <b>(.+)<\/b>\.`,
  (m, e, n, a, e2, t, x, v, c) => `Un coleccionista quiere una copia de ${n ? `${e} <b>${ART_ES_MASTER[n]}</b> (${a})` : `este cuadro ${e2} <b>${ART_ES_TIER[t].toLowerCase()}</b>`} y paga <b>×${x}</b>: hasta ${v}. Tiempo restante: <b>${c}</b>.`);
hrx(String.raw`Thank you! A new commission in <b>(.+)<\/b>\.`, "¡Gracias! Nuevo encargo en <b>$1</b>.");
hrx(String.raw`📜 <b>Daily commission:<\/b> unlock 🟡 Normal paintings to get a daily commission \(×(\d+) value\)\.`, "📜 <b>Encargo diario:</b> desbloquea los cuadros 🟡 normales para recibir un encargo diario (×$1 de valor).");
hrx(String.raw`(.+) Worth <b>(${NUM})<\/b> \(([\d.,]+)% of (${NUM})(, 📜 commission ×(\d+))?\)\.`, (m, p, v, pc, f, c, x) => `${ES[p] || p} Valor <b>${v}</b> (${pc.replace(".", ",")} % de ${f}${c ? `, 📜 encargo ×${x}` : ""}).`);
hrx(String.raw`🔥 <b>Where it differs:<\/b> red marks the parts that don't match the original \((\d+)% of the picture\)\.`, "🔥 <b>Dónde difiere:</b> el rojo marca las partes que no coinciden con el original ($1 % del cuadro).");
rx(String.raw`Commission delivered! The collector paid ×(\d+): (${NUM})\.`, "¡Encargo entregado! El coleccionista ha pagado ×$1: $2.");
rx(String.raw`Keep in collection \((\d+)\/(\d+)\)`, "Guardar en la colección ($1/$2)");
rx(String.raw`(Easy|Normal|Masterpiece) painting`, (m, t) => `Cuadro ${ART_ES_TIER[t].toLowerCase()}`);
rx(String.raw`Easy (${NUM}) · 🟡 Normal (${NUM}) · 🏛️ Masterpiece (${NUM}) \(you earn your match %; at least (\d+)% to sell or keep\)`,
  (m, a, b, c, u) => `Fácil ${a} · 🟡 Normal ${b} · 🏛️ Obra maestra ${c} (ganas tu % de parecido; al menos el ${u} % para vender o guardar)`);
hrx(String.raw`🟡 Normal unlocks after you submit \(sell or keep\) (\d+) Easy paintings; 🏛️ Masterpiece unlocks after (\d+) Normal paintings\.`, "🟡 Normal se desbloquea al entregar (vender o guardar) $1 cuadros fáciles; 🏛️ Obra maestra, tras $2 cuadros normales.");
H("Simplified versions of famous old paintings (all old enough to be free for everyone to use), drawn in the game's 24 colours:", "Versiones simplificadas de cuadros antiguos famosos (todos tan antiguos que cualquiera puede usarlos), dibujadas con los 24 colores del juego:");
hrx(String.raw`Every 24 hours a collector asks for one specific painting \(🟡 Normal, or a 🏛️ Masterpiece once they are open\) and pays <b>×(\d+)<\/b> its value\. Press 🖌️ Paint it in the studio, then sell or keep a copy of at least (\d+)% before the time runs out\. One delivery per commission\.`,
  "Cada 24 horas un coleccionista pide un cuadro concreto (🟡 normal, o una 🏛️ obra maestra cuando estén abiertas) y paga <b>×$1</b> su valor. Pulsa 🖌️ Pintarlo en el estudio y después vende o guarda una copia de al menos el $2 % antes de que se acabe el tiempo. Una entrega por encargo.");
hrx(String.raw`Your copy is worth <b>match % × the full value<\/b>: an 80% copy of a Normal painting is worth (${NUM})\. A copy under <b>(\d+)%<\/b> can't be sold or kept: keep working on it or start a new one\. There is no timer\.`,
  "Tu copia vale <b>% de parecido × el valor completo</b>: una copia al 80 % de un cuadro normal vale $1. Una copia por debajo del <b>$2 %</b> no se puede vender ni guardar: sigue trabajando en ella o empieza otra. No hay límite de tiempo.");
ES["Drag to draw a straight line in the brush size and tip. Hold Shift for straight 45° angles"] = "Arrastra para trazar una línea recta con el tamaño y la punta del pincel. Mantén Mayús para ángulos de 45°";
ES["Click the original (or your copy) to take that colour"] = "Haz clic en el original (o en tu copia) para coger ese color";
ES["Turn it on and everything you paint is also painted on the other side, flipped left ↔ right"] = "Actívalo y todo lo que pintes se pinta también al otro lado, volteado izquierda ↔ derecha";
hrx(String.raw`🔥 After you submit, a <b>heatmap<\/b> shows in red where your copy doesn't match the original\.`, "🔥 Al entregar, un <b>mapa de calor</b> muestra en rojo dónde tu copia no coincide con el original.");
ES["Line"] = "Línea";
H("🎨 <b>Art Gallery update!</b> New tiers: 🟢 Easy (kid-style drawings), 🟡 Normal (detailed scenes) and the new 🏛️ <b>Masterpiece</b> tier: copy 10 famous paintings like The Starry Night, The Great Wave, Mona Lisa and The Scream (opens after 10 Normal paintings). The old 3-shape tier is retired.",
  "🎨 <b>¡Novedades en la Galería de arte!</b> Nuevos niveles: 🟢 Fácil (dibujos infantiles), 🟡 Normal (escenas detalladas) y el nuevo nivel 🏛️ <b>Obra maestra</b>: copia 10 cuadros famosos como La noche estrellada, La gran ola, La Gioconda y El grito (se abre tras 10 cuadros normales). El antiguo nivel de 3 formas se retira.");
ES["🖌️ New drawing tools: ➖ Line, 💧 Eyedropper and 🪞 Mirror mode. After you submit, a 🔥 heatmap shows where your copy differs from the original."] =
  "🖌️ Nuevas herramientas de dibujo: ➖ Línea, 💧 Cuentagotas y 🪞 Modo espejo. Al entregar, un 🔥 mapa de calor muestra dónde tu copia difiere del original.";
H("📜 <b>Daily commission</b>: every day a collector asks for one specific painting and pays ×3. You have 24 hours to deliver it.", "📜 <b>Encargo diario</b>: cada día un coleccionista pide un cuadro concreto y paga ×3. Tienes 24 horas para entregarlo.");
ES["🎨 8 new colours in the Art studio palette (24 in all): slate, tan, maroon, salmon, ochre, olive, turquoise and lavender. Every painting now uses them."] =
  "🎨 8 colores nuevos en la paleta del Estudio de arte (24 en total): gris pizarra, canela, granate, salmón, ocre, verde oliva, turquesa y lavanda. Todos los cuadros los usan ahora.";
ES["🏆 Art Gallery achievements now follow the new tiers (Easy, Normal and Masterpiece). Achievements you already have stay unlocked."] =
  "🏆 Los logros de la Galería de arte siguen ahora los nuevos niveles (Fácil, Normal y Obra maestra). Los logros que ya tienes siguen desbloqueados.";
Object.assign(ES, { "Masterpieces": "Obras maestras", "Vincent van Gogh": "Vincent van Gogh", "Katsushika Hokusai": "Katsushika Hokusai", "Edvard Munch": "Edvard Munch",
  "Leonardo da Vinci": "Leonardo da Vinci", "Johannes Vermeer": "Johannes Vermeer", "Claude Monet": "Claude Monet",
  "Simplified versions of famous old paintings (all old enough to be free for everyone to use), drawn in the game's 24 colours": "Versiones simplificadas de cuadros antiguos famosos (todos tan antiguos que cualquiera puede usarlos), dibujadas con los 24 colores del juego" });
rx(String.raw`Normal unlocks after you submit \(sell or keep\) (\d+) Easy paintings; 🏛️ Masterpiece unlocks after (\d+) Normal paintings\.`, "Normal se desbloquea al entregar (vender o guardar) $1 cuadros fáciles; 🏛️ Obra maestra, tras $2 cuadros normales.");
// 🐾🎨 Pip the painter pet
Object.assign(ES, { "A painter wants to join you": "Un pintor quiere vivir contigo", "Adopt Pip": "Adoptar a Pip", "Adopt": "Adoptar", "Pip joined you!": "¡Pip se ha unido a ti!",
  "He set up his easel at the top of the 🎮 Mini-games page. Every 15 minutes he paints a 🟡 Normal painting for your collection (he naps in between).":
    "Ha montado su caballete arriba del todo en la página de 🎮 Minijuegos. Cada 15 minutos pinta un cuadro 🟡 Normal para tu colección (entre medias, se echa la siesta).",
  "Go and see him": "Ir a verlo", "Later": "Más tarde", "Painted": "Pintados", "Auto-sold": "Vendidos solos", "Last": "Último", "Disturbed": "Molestado",
  "Click him to pet him (he doesn't like it while he's painting!).": "Haz clic en él para acariciarlo (¡no le gusta nada mientras pinta!).",
  "What he does": "Qué hace", "Another pet is out there": "Hay otra mascota por ahí",
  "Lives at the top of the Mini-games page, next to his easel.": "Vive arriba del todo en la página de Minijuegos, junto a su caballete.",
  "Every 15 minutes he paints a 🟡 Normal painting: 14 minutes asleep, then 1 minute of painting. His copies are 85–95% matches.":
    "Cada 15 minutos pinta un cuadro 🟡 Normal: 14 minutos dormido y después 1 minuto pintando. Sus copias tienen un parecido del 85–95 %.",
  "The painting goes to your collection. If it's full, he sells it right away. Both count for 🏆 achievements.":
    "El cuadro va a tu colección. Si está llena, lo vende al momento. Ambas cosas cuentan para los 🏆 logros.",
  "He keeps painting while the game is closed (up to 24 hours).": "Sigue pintando con el juego cerrado (hasta 24 horas).",
  "Click him while he sleeps to pet him. Don't poke him while he's painting: he gets a bit grumpy!": "Haz clic en él mientras duerme para acariciarlo. No lo molestes mientras pinta: ¡se pone un poco gruñón!",
  "Pip the painter": "Pip, el pintor",
  "A young alien painter from the Lumerians (🌌 Space Logistics). Once you are 😊 Friendly with them, you can adopt him for 10 paintings from your collection (they count as sold for 🏆 achievements).":
    "Un joven pintor alienígena de los lumerianos (🌌 Logística espacial). Cuando llegues al nivel 😊 Amistosa con ellos, podrás adoptarlo a cambio de 10 cuadros de tu colección (cuentan como vendidos para los 🏆 logros).",
  "He lives at the top of the Mini-games page, next to his easel.": "Vive arriba del todo en la página de Minijuegos, junto a su caballete.",
  "Every 15 minutes he paints a 🟡 Normal painting: 14 minutes asleep, then 1 minute of painting. His copies are 85–95% matches, worth that part of 100M.":
    "Cada 15 minutos pinta un cuadro 🟡 Normal: 14 minutos dormido y después 1 minuto pintando. Sus copias tienen un parecido del 85–95 % y valen esa parte de 100 M.",
  "The painting goes to your collection; if it's full, he sells it right away. Both count for 🏆 achievements.":
    "El cuadro va a tu colección; si está llena, lo vende al momento. Ambas cosas cuentan para los 🏆 logros.",
  "He keeps painting while the game is closed (up to 24 hours of paintings).": "Sigue pintando con el juego cerrado (hasta 24 horas de cuadros).",
  "Click him while he sleeps to pet him. If you poke him while he's painting, he gets a bit grumpy. Rename him on the 🐾 Pet page.":
    "Haz clic en él mientras duerme para acariciarlo. Si lo molestas mientras pinta, se pone un poco gruñón. Cámbiale el nombre en la página 🐾 Mascota.",
  "Rumour has it an art-loving alien race has a painter who'd love a new home. New friends will also join in future updates.":
    "Se rumorea que una raza alienígena amante del arte tiene un pintor que busca un nuevo hogar. También se unirán nuevos amigos en próximas actualizaciones.",
  "A painter from the stars": "Un pintor de las estrellas" });
H("Become <b>😊 Friendly</b> with the Lumerians and one of their painters may want to come and live with you.",
  "Logra el nivel <b>😊 Amistosa</b> con los lumerianos y puede que uno de sus pintores quiera venirse a vivir contigo.");
H("Pip, a young Lumerian painter, would love to live with you and paint for you. The Lumerians ask <b>10 paintings</b> in return.",
  "A Pip, un joven pintor lumeriano, le encantaría vivir contigo y pintar para ti. Los lumerianos piden <b>10 cuadros</b> a cambio.");
rx(String.raw`Adopt Pip · 🖼️ (\d+) paintings`, "Adoptar a Pip · 🖼️ $1 cuadros");
const pipNumEs = (n) => n.replace(".", ",");
hrx(String.raw`😴 <b>Asleep\.<\/b> Next painting starts in <b>([\d:]+)<\/b>`, "😴 <b>Dormido.</b> El próximo cuadro empieza en <b>$1</b>");
hrx(String.raw`🎨 <b>Painting…<\/b> done in <b>([\d:]+)<\/b>`, "🎨 <b>Pintando…</b> termina en <b>$1</b>");
hrx(String.raw`💰 Auto-sold: <b>([\d.,]+)<\/b> \((.+)\)`, "💰 Vendidos solos: <b>$1</b> ($2)");
rx(String.raw`(\d+(?:\.\d)?)%`, (m, n) => `${pipNumEs(n)} %`);
rx(String.raw`(.+) finished a painting \((\d+\.\d)% match, worth (.+)\)\. It's in your 🖼️ collection\.`, (m, n, sc, v) => `${n} ha terminado un cuadro (parecido del ${pipNumEs(sc)} %, vale ${v}). Ya está en tu 🖼️ colección.`);
rx(String.raw`(.+) finished a painting \((\d+\.\d)%\)\. Your collection is full, so he sold it for (.+)\.`, (m, n, sc, v) => `${n} ha terminado un cuadro (${pipNumEs(sc)} %). Tu colección está llena, así que lo ha vendido por ${v}.`);
rx(String.raw`While you were away, (.+) painted (\d+) paintings?: (\d+) went to your 🖼️ collection(?:, (\d+) sold for (.+))?\.`, (m, n, c, k, sd, v) =>
  `Mientras no estabas, ${n} ha pintado ${c} cuadro${c === "1" ? "" : "s"}: ${k} a tu 🖼️ colección${sd ? `, ${sd} vendido${sd === "1" ? "" : "s"} por ${v}` : ""}.`);
rx(String.raw`Your Lumerian painter( · together since (.+))?`, (m, a, d) => `Tu pintor lumeriano${a ? ` · juntos desde el ${d}` : ""}`);
ES["❌ Pip couldn't be adopted."] = "❌ No se ha podido adoptar a Pip.";
H("🐾 <b>New pet: Pip the painter!</b> Become 😊 Friendly with the Lumerians in 🌌 Space Logistics and adopt him for 10 paintings. He lives at the top of the 🎮 Mini-games page and paints a 🟡 Normal painting (85–95% match) every 15 minutes for your collection, even while the game is closed. Rename him on the 🐾 Pet page.",
  "🐾 <b>Nueva mascota: ¡Pip, el pintor!</b> Logra el nivel 😊 Amistosa con los lumerianos en 🌌 Logística espacial y adóptalo a cambio de 10 cuadros. Vive arriba del todo en la página de 🎮 Minijuegos y pinta un cuadro 🟡 Normal (parecido del 85–95 %) cada 15 minutos para tu colección, incluso con el juego cerrado. Cámbiale el nombre en la página 🐾 Mascota.");
Object.assign(ES, { "A painter in the family": "Un pintor en la familia", "Adopt Pip from the Lumerians": "Adopta a Pip de los lumerianos",
  "Little artist": "Pequeño artista", "Let Pip paint 5 paintings": "Deja que Pip pinte 5 cuadros", "Prolific painter": "Pintor prolífico", "Let Pip paint 50 paintings": "Deja que Pip pinte 50 cuadros",
  "Muse": "Musa", "Pet Pip 100 times": "Acaricia a Pip 100 veces",
  "🏆 4 new 🖼️ Art Gallery achievements for Pip: 🐾 A painter in the family, 🖌️ Little artist, 🎨 Prolific painter and 💜 Muse.": "🏆 4 logros nuevos de 🖼️ Galería de arte para Pip: 🐾 Un pintor en la familia, 🖌️ Pequeño artista, 🎨 Pintor prolífico y 💜 Musa." });
// 🏪 buying alien goods at 💖 Allies
ES["Sell the goods your ships bring home. Prices move every 30 minutes: sell when they are high. The further away a race lives, the more its goods are worth. Once you are 💖 Allies with a race, you can buy its goods here too."] =
  "Vende los bienes que traen tus naves. Los precios cambian cada 30 minutos: vende cuando estén altos. Cuanto más lejos vive una raza, más valen sus bienes. Cuando seas 💖 Aliada de una raza, también podrás comprar aquí sus bienes.";
Object.assign(ES, { "Buy": "Comprar", "Buy here at 💖 Allies": "Compra aquí al llegar a 💖 Aliada", "Bought": "Comprados", "Spent": "Gastado" });
hrx(String.raw`💖 Buy: <b>(.+)<\/b> each`, "💖 Comprar: <b>$1</b> cada uno");
rx(String.raw`Bought (\S+) (\d+) (${SP_RX_GOOD}) for (.+)\.`, (m, e, n, g, x) => `Has comprado ${e} ${n} ${spG(g)} por ${x}.`);
rx(String.raw`You need (.+) to buy (\d+) (${SP_RX_GOOD})\.`, (m, x, n, g) => `Necesitas ${x} para comprar ${n} ${spG(g)}.`);
ES["🏪 Alien market: once you are 💖 Allies with a race, you can also buy its goods there (handy for gifts to other races). Buying always costs more than selling."] =
  "🏪 Mercado alienígena: cuando seas 💖 Aliada de una raza, también podrás comprar allí sus bienes (útil para regalos a otras razas). Comprar siempre cuesta más que vender.";
ES["Active trade route"] = "Ruta comercial activa";
// 👤 player profile
Object.assign(ES, { "Profile": "Perfil", "Your profile": "Tu perfil", "Visible to other players": "Visible para otros jugadores", "Loading…": "Cargando…",
  "Nickname": "Apodo", "Your nickname": "Tu apodo", "Create profile": "Crear perfil", "Avatar": "Avatar", "Save": "Guardar",
  "Sign-in isn't available right now.": "Ahora mismo no se puede iniciar sesión.",
  "3–16 characters: letters, numbers, spaces and _ . - · Every nickname is unique. Rude names aren't allowed.": "De 3 a 16 caracteres: letras, números, espacios y _ . - · Cada apodo es único. No se permiten nombres groseros.",
  "Pick the emblem of one of your 🎁 reward collections. Unlock more collections (🏆 Achievements → 🎁 Rewards) to get more avatars.": "Elige el emblema de una de tus colecciones de 🎁 recompensas. Desbloquea más colecciones (🏆 Logros → 🎁 Recompensas) para tener más avatares.",
  "Unlock your first 🎁 reward collection (🏆 Achievements → 🎁 Rewards) to choose an avatar.": "Desbloquea tu primera colección de 🎁 recompensas (🏆 Logros → 🎁 Recompensas) para elegir un avatar.",
  "Signing in also keeps a ☁️ cloud copy of your progress, so you can play on other devices.": "Al iniciar sesión también se guarda una copia de tu progreso en la ☁️ nube, para que puedas jugar en otros dispositivos.",
  "Account": "Cuenta",
  "Choose a nickname and an avatar to create your profile.": "Elige un apodo y un avatar para crear tu perfil.",
  "Your nickname needs at least 3 characters.": "Tu apodo necesita al menos 3 caracteres.", "Your nickname can have at most 16 characters.": "Tu apodo puede tener como máximo 16 caracteres.",
  "Use only letters, numbers, spaces and _ . -": "Usa solo letras, números, espacios y _ . -",
  "That nickname isn't allowed. Please choose a friendly one.": "Ese apodo no está permitido. Elige uno amable, por favor.",
  "That nickname is already taken. Try another one.": "Ese apodo ya está cogido. Prueba con otro.",
  "Profiles aren't switched on yet. Please try again later.": "Los perfiles todavía no están activados. Inténtalo más tarde.",
  "Something went wrong. Please try again.": "Algo ha salido mal. Inténtalo de nuevo.",
  "Your profile couldn't be loaded. Check your connection and try again.": "No se ha podido cargar tu perfil. Comprueba tu conexión e inténtalo de nuevo.",
  "Nickname saved.": "Apodo guardado.", "Unlock achievements with a badge picture to choose an avatar.": "Desbloquea logros con insignia para elegir un avatar." });
H("Sign in with Google to create your player profile. Other players will see your <b>nickname</b>, your <b>avatar</b>, your <b>achievements</b> and your <b>prestige count</b>.",
  "Inicia sesión con Google para crear tu perfil de jugador. Otros jugadores verán tu <b>apodo</b>, tu <b>avatar</b>, tus <b>logros</b> y tu <b>número de prestigios</b>.");
hrx(String.raw`🏆 <b>(\d+\/\d+)<\/b> achievements`, "🏆 <b>$1</b> logros");
hrx(String.raw`⭐ Prestige <b>(\d+)<\/b>`, "⭐ Prestigio <b>$1</b>");
rx(String.raw`Show all (\d+)`, "Mostrar los $1");
H("👤 <b>Player profiles!</b> Click the round 👤 button next to ⚙️ Settings, sign in with Google and choose a nickname and an avatar (the emblem of one of your 🎁 reward collections). Other players will see your nickname, avatar, achievements and prestige count.",
  "👤 <b>¡Perfiles de jugador!</b> Pulsa el botón redondo 👤 junto a ⚙️ Ajustes, inicia sesión con Google y elige un apodo y un avatar (el emblema de una de tus colecciones de 🎁 recompensas). Otros jugadores verán tu apodo, tu avatar, tus logros y tu número de prestigios.");
H("👤 <b>Profile</b> (the round button next to ⚙️): once signed in, choose a nickname and an avatar (the emblem of one of your 🎁 reward collections). Other players see your nickname, avatar, achievements and prestige count. Nicknames are unique, and rude ones aren't allowed. Your first nickname is free; changing it later (✏️ next to your name) costs 100 gcoin.",
  "👤 <b>Perfil</b> (el botón redondo junto a ⚙️): con la sesión iniciada, elige un apodo y un avatar (el emblema de una de tus colecciones de 🎁 recompensas). Otros jugadores ven tu apodo, tu avatar, tus logros y tu número de prestigios. Los apodos son únicos y no se permiten los groseros. Tu primer apodo es gratis; cambiarlo después (✏️ junto a tu nombre) cuesta 100 gcoin.");
Object.assign(ES, { "Change nickname": "Cambiar apodo", "Cancel": "Cancelar",
  "Your first nickname is free. Changing it later costs 100 gcoin.": "Tu primer apodo es gratis. Cambiarlo después cuesta 100 gcoin." });
rx(String.raw`Change · (.+)`, "Cambiar · $1");
hrx(String.raw`Changing your nickname costs <b>(.+?)<\/b>\.( You have (.+)\.)?`, (m, c, y, h) => `Cambiar tu apodo cuesta <b>${c}</b>.${y ? ` Tienes ${h}.` : ""}`);
rx(String.raw`You need (.+) to change your nickname\.`, "Necesitas $1 para cambiar tu apodo.");
rx(String.raw`Nickname changed \(−(.+)\)\.`, "Apodo cambiado (−$1).");
ES["You can change your nickname only once a day. Please try again tomorrow."] = "Solo puedes cambiar tu apodo una vez al día. Inténtalo de nuevo mañana.";
Object.assign(ES, { "Your save couldn't be loaded": "No se ha podido cargar tu partida", "Your cloud save couldn't be loaded": "No se ha podido cargar tu partida en la nube",
  "The saved game in this browser was changed outside the game, so it was not loaded.": "La partida guardada en este navegador se ha modificado fuera del juego, así que no se ha cargado.",
  "Your last automatic backup was loaded instead.": "En su lugar se ha cargado tu última copia de seguridad automática.",
  "A new game was started. If you play with a Google account, sign in (👤 Profile) to get your ☁️ cloud save back.": "Se ha empezado una partida nueva. Si juegas con una cuenta de Google, inicia sesión (👤 Perfil) para recuperar tu partida de la ☁️ nube.",
  "The cloud save was changed outside the game, so it was not loaded. This device's progress is kept and saved to the cloud again.": "La partida en la nube se ha modificado fuera del juego, así que no se ha cargado. Se conserva el progreso de este dispositivo y se vuelve a guardar en la nube." });
// 👥 friends
Object.assign(ES, { "Friends": "Amigos", "Friend requests": "Solicitudes de amistad", "Friend code": "Código de amigo", "Copy": "Copiar", "Find players": "Buscar jugadores",
  "Your friend code": "Tu código de amigo", "Share it so friends can find you.": "Compártelo para que tus amigos te encuentren.", "Nickname or friend code": "Apodo o código de amigo",
  "Search": "Buscar", "Searching…": "Buscando…", "No players found.": "No se ha encontrado ningún jugador.", "Online": "En línea", "Offline": "Desconectado",
  "Accept": "Aceptar", "Decline": "Rechazar", "Add friend": "Añadir amigo", "Request sent": "Solicitud enviada", "Requests you sent": "Solicitudes que has enviado",
  "No friends yet. Search for a nickname or a friend code above.": "Todavía no tienes amigos. Busca un apodo o un código de amigo arriba.",
  "You are now friends!": "¡Ahora sois amigos!", "Request declined.": "Solicitud rechazada.", "Request cancelled.": "Solicitud cancelada.", "Friend removed.": "Amigo eliminado.",
  "Pets": "Mascotas", "No pets yet.": "Todavía no tiene mascotas.", "Baby dragon-moth": "Bebé dragón-polilla", "Remove friend": "Eliminar amigo", "Remove": "Eliminar",
  "You will no longer be friends. You can send a new request later.": "Dejaréis de ser amigos. Podrás enviar una nueva solicitud más adelante.",
  "Create your profile first (👤 Profile tab: choose a nickname). Then you can add friends.": "Primero crea tu perfil (pestaña 👤 Perfil: elige un apodo). Después podrás añadir amigos.",
  "Friends aren't switched on yet. Please try again later.": "Los amigos todavía no están activados. Inténtalo más tarde.",
  "You have too many requests waiting. Cancel some first.": "Tienes demasiadas solicitudes pendientes. Cancela algunas primero.",
  "Your friend list is full (200 friends).": "Tu lista de amigos está llena (200 amigos).", "There is already a request between you two.": "Ya hay una solicitud entre vosotros dos." });
hrx(String.raw`👥 Friends <span>(\d+)<\/span>`, "👥 Amigos <span>$1</span>");
hrx(String.raw`📨 Friend requests <span>(\d+)<\/span>`, "📨 Solicitudes de amistad <span>$1</span>");
hrx(String.raw`<span><\/span> Online`, "<span></span> En línea");
hrx(String.raw`<span><\/span> Offline`, "<span></span> Desconectado");
hrx(String.raw`<span><\/span> Last seen (\d+) (min|h|days) ago`, (m, n, u) => `<span></span> Visto por última vez hace ${n} ${u === "days" ? (n === "1" ? "día" : "días") : u}`);
rx(String.raw`Your friends \((\d+)\)`, "Tus amigos ($1)");
rx(String.raw`(\d+) online`, "$1 en línea");
rx(String.raw`(\d+) (min|h|days) ago`, (m, n, u) => `hace ${n} ${u === "days" ? (n === "1" ? "día" : "días") : u}`);
rx(String.raw`Friend request sent to (.+)\.`, "Solicitud de amistad enviada a $1.");
rx(String.raw`Remove (.+)\?`, "¿Eliminar a $1?");
rx(String.raw`Friend code (\w+) copied\.`, "Código de amigo $1 copiado.");
rx(String.raw`Your friend code: (\w+)`, "Tu código de amigo: $1");
H("👥 <b>Friends!</b> In 👤 Profile → 👥 Friends, find players by nickname or by their friend code, send requests, and see who is 🟢 online. Click a friend to see their avatar, achievements, prestige and pets.",
  "👥 <b>¡Amigos!</b> En 👤 Perfil → 👥 Amigos, busca jugadores por su apodo o su código de amigo, envía solicitudes y mira quién está 🟢 en línea. Pulsa en un amigo para ver su avatar, sus logros, sus prestigios y sus mascotas.");
H("👥 <b>Friends</b> (👤 Profile → 👥 Friends): find players by nickname or by their 8-letter friend code (yours is on your profile), send a friend request, and accept or decline the ones you get. 🟢 means the friend is playing right now. Click a friend to see their avatar, achievements, prestige and pets.",
  "👥 <b>Amigos</b> (👤 Perfil → 👥 Amigos): busca jugadores por su apodo o por su código de amigo de 8 caracteres (el tuyo está en tu perfil), envía solicitudes de amistad y acepta o rechaza las que recibas. 🟢 significa que ese amigo está jugando ahora mismo. Pulsa en un amigo para ver su avatar, sus logros, sus prestigios y sus mascotas.");
Object.assign(ES, { "You finished the game!": "¡Has terminado el juego!", "That was your 4th and final prestige. No more resets are possible.": "Ese ha sido tu 4.º y último prestigio. Ya no se puede reiniciar más.",
  "You can keep playing as long as you like: collect the remaining achievements and enjoy your empire!": "Puedes seguir jugando todo lo que quieras: consigue los logros que te faltan y disfruta de tu imperio.", "Keep playing": "Seguir jugando" });
Object.assign(ES, { "Game saved, also in the ☁️ cloud!": "¡Partida guardada, también en la ☁️ nube!", "Saved on this device. ❌ The cloud save failed.": "Guardada en este dispositivo. ❌ Ha fallado el guardado en la nube." });
// ⚔️ online casino (duels)
Object.assign(ES, { "Online casino": "Casino online", "Play against your friends. The winner takes the other player's bet.": "Juega contra tus amigos. El ganador se lleva la apuesta del otro.",
  "Rock Paper Scissors": "Piedra, papel o tijera", "Dice Battle": "Batalla de dados",
  "Best of 3. Rock beats scissors, scissors beat paper, paper beats rock. A tie is played again.": "Al mejor de 3. La piedra gana a la tijera, la tijera al papel y el papel a la piedra. Un empate se vuelve a jugar.",
  "Best of 3. Both roll 2 dice: the higher total wins the round. A tie is rolled again.": "Al mejor de 3. Ambos tiran 2 dados: gana la ronda el total más alto. Un empate se vuelve a tirar.",
  "1. Choose a game": "1. Elige un juego", "2. Your bet": "2. Tu apuesta", "3. Challenge a friend": "3. Reta a un amigo", "Challenge": "Retar", "Bet": "Apuesta",
  "You have no friends to challenge yet. Add some in 👤 Profile → 👥 Friends.": "Todavía no tienes amigos a los que retar. Añádelos en 👤 Perfil → 👥 Amigos.",
  "VS": "VS", "Pick your hand!": "¡Elige tu mano!", "Roll your dice!": "¡Tira tus dados!", "Rock": "Piedra", "Paper": "Papel", "Scissors": "Tijera", "Roll": "Tirar",
  "Give up": "Rendirse", "Give up?": "¿Rendirte?", "Keep playing": "Seguir jugando", "Draw! Play again.": "¡Empate! Otra vez.", "Same total! Roll again.": "¡Mismo total! Tira otra vez.",
  "You win this round!": "¡Ganas esta ronda!", "They win this round.": "Tu rival gana esta ronda.", "Back to the online casino": "Volver al casino online",
  "Your friend left the duel.": "Tu amigo ha abandonado el duelo.", "You were away for too long.": "Has estado fuera demasiado tiempo.", "Your friend gave up.": "Tu amigo se ha rendido.", "You gave up.": "Te has rendido.",
  "You've been challenged!": "¡Te han retado!", "Decline": "Rechazar", "Accept": "Aceptar", "Expires in": "Caduca en", "s": "s",
  "You can only challenge your friends.": "Solo puedes retar a tus amigos.", "Your friend isn't online right now.": "Tu amigo no está en línea ahora mismo.",
  "You don't have enough money for this bet.": "No tienes suficiente dinero para esta apuesta.", "Your friend doesn't have enough money for this bet.": "Tu amigo no tiene suficiente dinero para esta apuesta.",
  "You already have a challenge or a duel going.": "Ya tienes un reto o un duelo en marcha.", "Your friend is already in a duel.": "Tu amigo ya está en un duelo.", "Choose a bet of at least 1.": "Elige una apuesta de al menos 1.",
  "This challenge has expired.": "Este reto ha caducado.", "This challenge isn't open any more.": "Este reto ya no está disponible.",
  "The online casino isn't switched on yet. Please try again later.": "El casino online todavía no está activado. Inténtalo más tarde.",
  "Sign in with Google and create your profile to play against your friends.": "Inicia sesión con Google y crea tu perfil para jugar contra tus amigos.",
  "Create your profile first (👤 Profile: choose a nickname). Then add friends and challenge them.": "Primero crea tu perfil (👤 Perfil: elige un apodo). Después añade amigos y rétalos.",
  "Open my profile": "Abrir mi perfil",
  "First blood": "Primera sangre", "Win a Rock Paper Scissors duel against a friend": "Gana un duelo de piedra, papel o tijera contra un amigo",
  "Hand master": "Maestro de la mano", "Win 5 Rock Paper Scissors duels": "Gana 5 duelos de piedra, papel o tijera",
  "Untouchable hand": "Mano intocable", "Win 20 Rock Paper Scissors duels": "Gana 20 duelos de piedra, papel o tijera",
  "Lucky roll": "Tirada de suerte", "Win a Dice Battle against a friend": "Gana una batalla de dados contra un amigo",
  "High roller duel": "Duelo de altos vuelos", "Win 5 Dice Battles": "Gana 5 batallas de dados", "Dice king": "Rey de los dados", "Win 20 Dice Battles": "Gana 20 batallas de dados" });
const duGameEs = (g) => ES[g] || g;
rx(String.raw`You have (.+)\. Your friend must have at least the same\. The winner gets the other player's bet\.`, "Tienes $1. Tu amigo debe tener al menos lo mismo. El ganador se lleva la apuesta del otro.");
hrx(String.raw`✊ Rock Paper Scissors: <b>(\d+)<\/b> won · <b>(\d+)<\/b> lost`, "✊ Piedra, papel o tijera: <b>$1</b> ganados · <b>$2</b> perdidos");
hrx(String.raw`🎲 Dice Battle: <b>(\d+)<\/b> won · <b>(\d+)<\/b> lost`, "🎲 Batalla de dados: <b>$1</b> ganadas · <b>$2</b> perdidas");
hrx(String.raw`💰 Won <b>(.+?)<\/b> · lost <b>(.+?)<\/b>`, "💰 Ganado <b>$1</b> · perdido <b>$2</b>");
hrx(String.raw`⏳ Waiting for <span>(.+?)<\/span> to accept…`, "⏳ Esperando a que <span>$1</span> acepte…");
hrx(String.raw`⏳ Waiting for <span>(.+?)<\/span>…`, "⏳ Esperando a <span>$1</span>…");
hrx(String.raw`(Rock Paper Scissors|Dice Battle|Bluff Chest|Race to 21) · bet (.+) · expires in <span>(\d*)<\/span> s`, (m, g, b, t) => `${duGameEs(g)} · apuesta ${b} · caduca en <span>${t}</span> s`);
rx(String.raw`Round (\d+) · Bet (.+)`, "Ronda $1 · Apuesta $2");
rx(String.raw`You won the duel! \+(.+)`, "¡Has ganado el duelo! +$1");
rx(String.raw`You lost the duel\. −(.+)`, "Has perdido el duelo. −$1");
hrx(String.raw`challenges you to <b>(.+?)<\/b> for <b>(.+?)<\/b>\.`, (m, g, b) => `te reta a <b>${duGameEs(g)}</b> por <b>${b}</b>.`);
rx(String.raw`(Best of 3\. .+?) The winner gets the other player's bet\.`, (m, r) => `${ES[r] || r} El ganador se lleva la apuesta del otro.`);
hrx(String.raw`You need (.+?) to accept \(you have (.+?)\)\.`, "Necesitas $1 para aceptar (tienes $2).");
hrx(String.raw`Your friend wins the duel and your bet of <b>(.+?)<\/b>\.`, "Tu amigo gana el duelo y tu apuesta de <b>$1</b>.");
rx(String.raw`Your duel with (.+) has started!`, "¡Tu duelo con $1 ha empezado!");
rx(String.raw`You won your (Rock Paper Scissors|Dice Battle|Bluff Chest|Race to 21) duel against (.+): \+(.+)!`, (m, g, n, x) => `Has ganado tu duelo de ${duGameEs(g).toLowerCase()} contra ${n}: +${x}!`);
rx(String.raw`You lost your (Rock Paper Scissors|Dice Battle|Bluff Chest|Race to 21) duel against (.+): −(.+)\.`, (m, g, n, x) => `Has perdido tu duelo de ${duGameEs(g).toLowerCase()} contra ${n}: −${x}.`);
H("⚔️ <b>Online casino!</b> In 🎰 Casino → ⚔️ Online casino, challenge a friend who is online to ✊ Rock Paper Scissors or 🎲 Dice Battle and choose your bet. Best of 3: the winner takes the other player's bet. 6 new achievements.",
  "⚔️ <b>¡Casino online!</b> En 🎰 Casino → ⚔️ Casino online, reta a un amigo que esté en línea a ✊ piedra, papel o tijera o a 🎲 batalla de dados y elige tu apuesta. Al mejor de 3: el ganador se lleva la apuesta del otro. 6 logros nuevos.");
Object.assign(ES, {
  "Rock Paper Scissors and Dice Battle: best of 3 rounds; a tie is played again. In Dice Battle both roll 2 dice and the higher total wins the round.": "Piedra, papel o tijera y batalla de dados: al mejor de 3 rondas; un empate se vuelve a jugar. En la batalla de dados ambos tiran 2 dados y gana la ronda el total más alto.",
  "You have 15 seconds per move: no pick in time means a random one. Leaving the duel for 30 seconds loses it.": "Tienes 15 segundos por jugada: si no eliges a tiempo, se elige al azar. Si abandonas el duelo 30 segundos, lo pierdes.",
  "The winner gets the other player's bet (paid from your money, not casino chips). The server keeps picks secret and rolls the dice, so nobody can cheat.": "El ganador se lleva la apuesta del otro (se paga con tu dinero, no con fichas del casino). El servidor mantiene en secreto las elecciones y tira los dados, así que nadie puede hacer trampas.",
  "A challenge expires after 60 seconds.": "Un reto caduca a los 60 segundos." });
H("On the left of the Casino, <b>Online casino</b> lets you play against your friends (👤 Profile → 👥 Friends). Pick a game (✊ Rock Paper Scissors, 🎲 Dice Battle, 💰 Bluff Chest or 🏁 Race to 21), choose a bet and challenge a friend who is 🟢 online; both of you need at least the bet in money.",
  "A la izquierda del Casino, el <b>Casino online</b> te permite jugar contra tus amigos (👤 Perfil → 👥 Amigos). Elige un juego (✊ piedra, papel o tijera, 🎲 batalla de dados, 💰 cofre farol o 🏁 carrera a 21), decide la apuesta y reta a un amigo que esté 🟢 en línea; los dos necesitáis tener al menos esa cantidad de dinero.");
ES["🪙 Every box where you type an amount of money now has a coin switch (bcoin, scoin or gcoin), so you don't have to count zeros. Your choice is remembered."] =
  "🪙 Todas las casillas donde escribes una cantidad de dinero tienen ahora un selector de moneda (bcoin, scoin o gcoin), para que no tengas que contar ceros. Se recuerda tu elección.";
Object.assign(ES, { "ship free": "nave libre", "ships free": "naves libres", "Free ships": "Naves libres" });
// ⚔️ duel fee
Object.assign(ES, { "Play against your friends. The winner takes both bets minus a 2% fee.": "Juega contra tus amigos. El ganador se lleva las dos apuestas menos una comisión del 2 %.",
  "⚔️ Online casino: duels now have a 2% fee. The winner takes both bets minus 2% (a win pays +96% of the bet, a loss costs the bet).": "⚔️ Casino online: los duelos tienen ahora una comisión del 2 %. El ganador se lleva las dos apuestas menos el 2 % (ganar paga +96 % de la apuesta y perder cuesta la apuesta).",
  "The winner takes both bets minus a 2% fee, so a win pays +96% of the bet and a loss costs the bet (paid from your money, not casino chips). The server keeps picks secret and rolls the dice, so nobody can cheat.": "El ganador se lleva las dos apuestas menos una comisión del 2 %, así que ganar paga +96 % de la apuesta y perder cuesta la apuesta (se paga con tu dinero, no con fichas del casino). El servidor mantiene en secreto las elecciones y tira los dados, así que nadie puede hacer trampas." });
rx(String.raw`You have (.+)\. Your friend must have at least the same\. The winner takes both bets minus a 2% fee\.`, "Tienes $1. Tu amigo debe tener al menos lo mismo. El ganador se lleva las dos apuestas menos una comisión del 2 %.");
rx(String.raw`((?:Best of 3\.|First to 3\.|Take turns) .+?) The winner takes both bets minus a 2% fee\.`, (m, r) => `${ES[r] || r} El ganador se lleva las dos apuestas menos una comisión del 2 %.`);
hrx(String.raw`🏆 Win: <b>(.+?)<\/b> · 💸 Lose: <b>(.+?)<\/b>`, "🏆 Si ganas: <b>$1</b> · 💸 Si pierdes: <b>$2</b>");
// 💰 Bluff Chest & 🏁 Race to 21
Object.assign(ES, { "Bluff Chest": "Cofre farol", "Race to 21": "Carrera a 21",
  "First to 3. Take turns hiding the coin in one of 3 chests while the other guesses. Found: the guesser scores. Missed: the hider scores.": "Gana quien llegue a 3. Por turnos, uno esconde la moneda en uno de los 3 cofres y el otro adivina. Si la encuentra, puntúa quien adivina; si falla, puntúa quien la esconde.",
  "Take turns rolling a die as often as you dare, then Bank your points. Rolling a 1 loses this turn's points. First to 21 wins.": "Por turnos, tira el dado tantas veces como te atrevas y después guarda tus puntos. Si sacas un 1, pierdes los puntos de ese turno. Gana quien llegue a 21.",
  "Hide your coin: pick a chest!": "Esconde tu moneda: ¡elige un cofre!", "Find the coin: pick a chest!": "Encuentra la moneda: ¡elige un cofre!",
  "They found your coin!": "¡Han encontrado tu moneda!", "You found the coin!": "¡Has encontrado la moneda!", "They missed: your coin stays hidden!": "Han fallado: ¡tu moneda sigue escondida!", "Empty! The coin was elsewhere.": "¡Vacío! La moneda estaba en otro cofre.",
  "Your turn: roll the die!": "Tu turno: ¡tira el dado!", "Bank": "Guardar",
  "Treasure hunter": "Cazatesoros", "Win a Bluff Chest duel against a friend": "Gana un duelo de cofre farol contra un amigo", "Master of bluff": "Maestro del farol", "Win 5 Bluff Chest duels": "Gana 5 duelos de cofre farol",
  "Pirate king": "Rey pirata", "Win 20 Bluff Chest duels": "Gana 20 duelos de cofre farol", "Off the line": "Buena salida", "Win a Race to 21 against a friend": "Gana una carrera a 21 contra un amigo",
  "Risk taker": "Amante del riesgo", "Win 5 Races to 21": "Gana 5 carreras a 21", "Race champion": "Campeón de carreras", "Win 20 Races to 21": "Gana 20 carreras a 21" });
hrx(String.raw`💰 Bluff Chest: <b>(\d+)<\/b> won · <b>(\d+)<\/b> lost`, "💰 Cofre farol: <b>$1</b> ganados · <b>$2</b> perdidos");
hrx(String.raw`🏁 Race to 21: <b>(\d+)<\/b> won · <b>(\d+)<\/b> lost`, "🏁 Carrera a 21: <b>$1</b> ganadas · <b>$2</b> perdidas");
rx(String.raw`First to 21 · Bet (.+)`, "Gana quien llegue a 21 · Apuesta $1");
hrx(String.raw`🎲 This turn: <b>(\d+)<\/b> points\. Roll again or Bank\?`, "🎲 Este turno: <b>$1</b> puntos. ¿Tiras otra vez o guardas?");
hrx(String.raw`⏳ <span>(.+?)<\/span>'s turn: <b>(\d+)<\/b> points this turn…`, "⏳ Turno de <span>$1</span>: <b>$2</b> puntos este turno…");
hrx(String.raw`⏳ <span>(.+?)<\/span>'s turn…`, "⏳ Turno de <span>$1</span>…");
rx(String.raw`You rolled a 1 and lost (\d+) points!`, "¡Has sacado un 1 y has perdido $1 puntos!");
hrx(String.raw`💥 <span>(.+?)<\/span> rolled a 1 and lost (\d+) points!`, "💥 <span>$1</span> ha sacado un 1 y ha perdido $2 puntos!");
rx(String.raw`You banked (\d+) points\.`, "Has guardado $1 puntos.");
hrx(String.raw`💰 <span>(.+?)<\/span> banked (\d+) points\.`, "💰 <span>$1</span> ha guardado $2 puntos.");
rx(String.raw`Bank \+(\d+)`, "Guardar +$1");
H("⚔️ <b>2 new online casino games!</b> 💰 <b>Bluff Chest</b>: hide the coin in one of 3 chests or find your friend's (first to 3). 🏁 <b>Race to 21</b>: roll as often as you dare, but a 1 loses the turn's points. 6 new achievements.",
  "⚔️ <b>¡2 juegos nuevos en el casino online!</b> 💰 <b>Cofre farol</b>: esconde la moneda en uno de 3 cofres o encuentra la de tu amigo (gana quien llegue a 3). 🏁 <b>Carrera a 21</b>: tira tantas veces como te atrevas, pero un 1 te hace perder los puntos del turno. 6 logros nuevos.");
H("💰 <b>Bluff Chest</b>: each round one player hides the coin in one of 3 chests and the other guesses (roles swap every round). Found: the guesser scores; missed: the hider scores. First to 3 wins.",
  "💰 <b>Cofre farol</b>: en cada ronda un jugador esconde la moneda en uno de los 3 cofres y el otro adivina (los papeles se cambian cada ronda). Si la encuentra, puntúa quien adivina; si falla, puntúa quien la esconde. Gana quien llegue a 3.");
H("🏁 <b>Race to 21</b>: take turns. On your turn, roll the die as often as you like and press <b>Bank</b> to add the turn's points to your total. Rolling a 1 loses this turn's points and ends your turn. The first to 21 wins. If your 15 seconds run out, you bank automatically.",
  "🏁 <b>Carrera a 21</b>: por turnos. En tu turno, tira el dado tantas veces como quieras y pulsa <b>Guardar</b> para sumar los puntos del turno a tu total. Si sacas un 1, pierdes los puntos de ese turno y se acaba tu turno. Gana quien llegue a 21. Si se acaban tus 15 segundos, se guardan automáticamente.");
Object.assign(ES, { "Pick a starter avatar or the emblem of one of your 🎁 reward collections. Unlock more collections (🏆 Achievements → 🎁 Rewards) to get more avatars.": "Elige un avatar inicial o el emblema de una de tus colecciones de 🎁 recompensas. Desbloquea más colecciones (🏆 Logros → 🎁 Recompensas) para tener más avatares.",
  "Painter mouse": "Ratón pintor", "Lucky cat": "Gato de la suerte", "Penguin banker": "Pingüino banquero", "Coin turtle": "Tortuga de monedas", "Bunny gambler": "Conejo apostador",
  "👤 6 new starter avatars for your profile: everyone can pick them, even without unlocked rewards.": "👤 6 avatares iniciales nuevos para tu perfil: todos pueden elegirlos, aunque no tengan recompensas desbloqueadas." });
// 🎰 casino: playing straight from your money
Object.assign(ES, { "Bet your money on table games": "Apuesta tu dinero en juegos de mesa", "money": "dinero",
  "Your money: you bet straight from it": "Tu dinero: apuestas directamente con él",
  "🎰 No more casino chips: you now bet straight from your money, and wins go straight back to it. Any chips you had were turned back into money.": "🎰 Se acabaron las fichas del casino: ahora apuestas directamente con tu dinero y las ganancias vuelven directamente a él. Las fichas que tenías se han convertido en dinero." });
rx(String.raw`Not enough money to repeat \((${NUM}) needed\)\.`, "No tienes suficiente dinero para repetir (hacen falta $1).");
rx(String.raw`Not enough money \(Ante \+ Blind = (${NUM})\)\.`, "No tienes suficiente dinero (ante + ciega = $1).");
rx(String.raw`Not enough money to raise (${NUM})\.`, "No tienes suficiente dinero para subir $1.");
rx(String.raw`Not enough money to buy the bonus \((${NUM})\)\.`, "No tienes suficiente dinero para comprar el bono ($1).");
rx(String.raw`Have (\d+) (scoin|gcoin|pcoin) on hand`, "Ten $1 $2 en mano");
Object.assign(ES, { "Shield active": "Escudo activo", "Gold ball! You climbed and got a shield against the next red ball.": "¡Bola dorada! Has subido y tienes un escudo contra la próxima bola roja." });
rx(String.raw`Red: ([\d.,]+)% \(blocked\)`, "Roja: $1 % (bloqueada)");
Object.assign(ES, { "bcoin (bronze)": "bcoin (bronce)", "scoin (silver, sc)": "scoin (plata, sc)", "gcoin (gold)": "gcoin (oro)", "pcoin (platinum)": "pcoin (platino)",
  "Very big amounts": "Cantidades muy grandes", "The biggest amounts (from 1,000,000 gcoin)": "Las cantidades más grandes (desde 1.000.000 gcoin)", "1,000,000 gcoin": "1.000.000 gcoin",
});
H("💎 New coin: <b>pcoin</b> (platinum). 1 pcoin = 1,000,000 gcoin; money switches to pcoin from 1,000,000 gcoin. The money boxes can be set to pcoin too.",
  "💎 Nueva moneda: <b>pcoin</b> (platino). 1 pcoin = 1.000.000 gcoin; el dinero pasa a mostrarse en pcoin desde 1.000.000 gcoin. Las casillas de dinero también se pueden poner en pcoin.");
Object.assign(ES, { "platinum": "platino", "gold": "oro", "silver": "plata", "bronze": "bronce" });
Object.assign(ES, { "bronze · the basic coin": "bronce · la moneda básica", "silver · = 1,000,000 bcoin": "plata · = 1.000.000 bcoin", "gold · = 1,000,000 scoin": "oro · = 1.000.000 scoin",
  "platinum · = 1,000,000 gcoin": "platino · = 1.000.000 gcoin", "= 1,000,000,000,000,000,000 bcoin": "= 1.000.000.000.000.000.000 bcoin",
  "Money is always shown in the biggest coin that fits, so 3,400,000 bcoin shows as 3.4 scoin. Hover over your money to see it in every coin.": "El dinero se muestra siempre en la moneda más grande que cabe: 3.400.000 bcoin aparecen como 3,4 scoin. Pasa el ratón por encima de tu dinero para verlo en todas las monedas." });
// 🌌 space politics & contracts (js/34c-space-politics.js)
Object.assign(ES, { "Contracts": "Contratos", "Contracts board": "Tablón de contratos", "Offers": "Ofertas", "Deliver": "Entregar", "Accept": "Aceptar", "Give up": "Renunciar", "Keep it": "Quedármelo",
  "Give up this contract?": "¿Renunciar a este contrato?", "Done": "Hechos", "Late": "Con retraso", "Failed": "Fallidos", "Delivered": "Entregado",
  "No offers right now.": "Ahora mismo no hay ofertas.", "Not enough goods yet.": "Todavía no tienes suficientes bienes.", "All ships are busy.": "Todas las naves están ocupadas.",
  "Meet at least 2 races (and be Acquainted with one) to get contracts.": "Conoce al menos 2 razas (y ten una amistad Conocida con una) para recibir contratos.",
  "Races pay well for goods from other worlds. Accept a contract (up to 2 at a time), then send a ship with the goods before the deadline: money and friendship. Late: half pay and no friendship. Missing the deadline or giving up: −50 friendship.":
    "Las razas pagan bien por bienes de otros mundos. Acepta un contrato (hasta 2 a la vez) y envía una nave con los bienes antes de que acabe el plazo: dinero y amistad. Con retraso: la mitad del pago y nada de amistad. Si se acaba el plazo o renuncias: −50 de amistad.",
  "A new contract arrives in": "Llega un contrato nuevo en", "Deliver within": "Entrégalo en", "On its way · arrives in": "En camino · llega en", "deadline in": "el plazo acaba en",
  "they start to cool off in": "empezarán a enfriarse en", "without a gift, a contract or a trade route.": "sin un regalo, un contrato o una ruta comercial.",
  "Rivals": "Rivales", "No rivals": "Sin rivales", "Warm": "Cálida", "Cooling off": "Enfriándose", "Contract cancelled.": "Contrato cancelado.",
  "Warm:": "Cálida:", "Rivals:": "Rivales:", "No rivals:": "Sin rivales:", "Cooling off:": "Enfriándose:",
  "your trade route keeps them happy.": "tu ruta comercial los mantiene contentos.",
  "−40 friendship an hour (never below 😊 Friendly). Send a gift or open a trade route.": "−40 de amistad por hora (nunca por debajo de 😊 Amistosa). Envía un regalo o abre una ruta comercial.",
  "You sold a lot of it lately. The price recovers by itself over a few hours.": "Has vendido mucho últimamente. El precio se recupera solo en unas horas.",
  "Sell the goods your ships bring home. Prices move every 30 minutes: sell when they are high. Selling a lot at once floods the market: every unit pays a little less, and the price recovers over a few hours. The further away a race lives, the more its goods are worth. Once you are 💖 Allies with a race, you can buy its goods here too.":
    "Vende los bienes que traen tus naves. Los precios cambian cada 30 minutos: vende cuando estén altos. Vender mucho de golpe satura el mercado: cada unidad se paga un poco menos, y el precio se recupera en unas horas. Cuanto más lejos vive una raza, más valen sus bienes. Cuando tu amistad con una raza sea 💖 Aliada, también podrás comprar aquí sus bienes.",
});
hrx(String.raw`<span>📜</span>Contracts`, "<span>📜</span>Contratos");
hrx(String.raw`<span class="ico">📜</span>Contracts`, `<span class="ico">📜</span>Contratos`);
rx(String.raw`\+(\d+) friendship`, "+$1 de amistad");
rx(String.raw`−(\d+)% flooded`, "−$1 % saturado");
rx(String.raw`(\d+) h to deliver once accepted · offer ends in`, "$1 h para entregarlo una vez aceptado · la oferta acaba en");
rx(String.raw`\(the ship needs (\d+) min to get there\)`, "(la nave tarda $1 min en llegar)");
rx(String.raw`Your contracts \((\d+)\/(\d+)\)`, "Tus contratos ($1/$2)");
hrx(String.raw`✍️ Your contracts \((\d+)\/(\d+)\)`, "✍️ Tus contratos ($1/$2)");
hrx(String.raw`✅ Done: <b>(\d+)<\/b>`, "✅ Hechos: <b>$1</b>"); hrx(String.raw`🐢 Late: <b>(\d+)<\/b>`, "🐢 Con retraso: <b>$1</b>"); hrx(String.raw`❌ Failed: <b>(\d+)<\/b>`, "❌ Fallidos: <b>$1</b>");
hrx(String.raw`<b>Rivals:<\/b> the (${SP_RX_NAME})\. Friendship you earn here costs (\d+)% of it with them \(never below 😊 Friendly\)\.`, (m, n, x) => `<b>Rivales:</b> los ${spN(n)}. La amistad que ganes aquí te cuesta un ${x} % de ella con ellos (nunca por debajo de 😊 Amistosa).`);
hrx(String.raw`<b>Rivals:<\/b> a race you haven't met yet\. Friendship you earn here costs (\d+)% of it with them \(never below 😊 Friendly\)\.`, "<b>Rivales:</b> una raza que aún no conoces. La amistad que ganes aquí te cuesta un $1 % de ella con ellos (nunca por debajo de 😊 Amistosa).");
hrx(String.raw`<b>No rivals:<\/b> everyone respects the (${SP_RX_NAME})\.`, (m, n) => `<b>Sin rivales:</b> todo el mundo respeta a los ${spN(n)}.`);
rx(String.raw`(😒 )?The (${SP_RX_NAME}) didn't like you helping their rivals, the (${SP_RX_NAME}): −(\d+) friendship\.`, (m, e, a, b, x) => `${e || ""}A los ${spN(a)} no les ha gustado que ayudes a sus rivales, los ${spN(b)}: −${x} de amistad.`);
hrx(String.raw`❄️ The (${SP_RX_NAME}) feel forgotten and are now only <b>(${SP_RX_LV})<\/b>\. Send a gift or keep a trade route running\.`, (m, n, l) => `❄️ Los ${spN(n)} se sienten olvidados y ahora vuestra amistad solo es <b>${spL(l)}</b>. Envíales un regalo o mantén una ruta comercial.`);
rx(String.raw`The (${SP_RX_NAME}) feel forgotten and are now only <b>(${SP_RX_LV})<\/b>\. Send a gift or keep a trade route running\.`, (m, n, l) => `Los ${spN(n)} se sienten olvidados y ahora vuestra amistad solo es <b>${spL(l)}</b>. Envíales un regalo o mantén una ruta comercial.`);
rx(String.raw`(📜 )?You missed the deadline of a contract for the (${SP_RX_NAME})(?:: −(\d+) friendship)?\.`, (m, e, n, x) => `${e || ""}Se ha acabado el plazo de un contrato para los ${spN(n)}${x ? `: −${x} de amistad` : ""}.`);
rx(String.raw`(📜 )?Contract cargo on its way to the (${SP_RX_NAME}) \((\d+) min\)\.`, (m, e, n, x) => `${e || ""}La carga del contrato va de camino a los ${spN(n)} (${x} min).`);
rx(String.raw`(📜 )?Contract cancelled: the (${SP_RX_NAME}) are disappointed \(−(\d+) friendship\)\.`, (m, e, n, x) => `${e || ""}Contrato cancelado: los ${spN(n)} están decepcionados (−${x} de amistad).`);
rx(String.raw`(🏴‍☠️ )?Pirates stole the contract cargo for the (${SP_RX_NAME})\. The contract is lost\.`, (m, e, n) => `${e || ""}Los piratas han robado la carga del contrato para los ${spN(n)}. El contrato se ha perdido.`);
rx(String.raw`(📜 )?Contract delivered late to the (${SP_RX_NAME}): half pay, (.+)\.`, (m, e, n, x) => `${e || ""}Contrato entregado con retraso a los ${spN(n)}: la mitad del pago, ${x}.`);
rx(String.raw`(📜 )?Contract done! The (${SP_RX_NAME}) paid (.+) and \+(\d+) friendship\.`, (m, e, n, x, p) => `${e || ""}¡Contrato cumplido! Los ${spN(n)} han pagado ${x} y +${p} de amistad.`);
rx(String.raw`(📜 )?Contract for the (${SP_RX_NAME})`, (m, e, n) => `${e || ""}Contrato para los ${spN(n)}`);
rx(String.raw`The (${SP_RX_NAME}) will be disappointed: −(\d+) friendship\.`, (m, n, x) => `Los ${spN(n)} se decepcionarán: −${x} de amistad.`);
H("⚔️ <b>Rivals:</b> some races dislike each other (Aurumites and Void Corsairs, Kragg and Lumerians, Glimmerkin and Vynari, Oracles of Vael and Cogitarium). Friendship you earn with one (gifts, contracts) costs 30% of it with its rival, but this never drops a race below 😊 Friendly. The First Ones have no rivals.",
  "⚔️ <b>Rivales:</b> algunas razas no se soportan (Aurumitas y Corsarios del Vacío, Kragg y Lumerianos, Glimmerkin y Vynari, Oráculos de Vael y Cogitarium). La amistad que ganes con una (regalos, contratos) te cuesta un 30 % de ella con su rival, pero así nunca bajará una raza de 😊 Amistosa. Los Primeros no tienen rivales.");
H("❄️ <b>Keeping friends:</b> once a race has been 💛 Trusted, it cools off after 24 hours without a gift, a contract or a rescue: −40 friendship an hour, never below 😊 Friendly. A running trade route keeps them warm.",
  "❄️ <b>Cuidar las amistades:</b> cuando una raza ha llegado a 💛 De confianza, se enfría tras 24 horas sin un regalo, un contrato o un rescate: −40 de amistad por hora, nunca por debajo de 😊 Amistosa. Una ruta comercial en marcha la mantiene cálida.");
H("📉 <b>Supply and demand:</b> selling a lot of one good at once floods the market: every unit pays a little less, and the price shows how flooded it is. It recovers by itself (half of the drop is gone after 3 hours).",
  "📉 <b>Oferta y demanda:</b> vender mucho de un mismo bien de golpe satura el mercado: cada unidad se paga un poco menos, y el precio muestra lo saturado que está. Se recupera solo (la mitad de la bajada desaparece en 3 horas).");
H("📜 <b>Contracts</b> (🌌 Space → Contracts): races you are Acquainted with post jobs: bring some goods from other worlds within a few hours. Accept up to 2, then send a ship with the goods: money and +150 friendship. Late: half pay and no friendship. Missing the deadline or giving up: −50 friendship. A new offer comes every hour (up to 3).",
  "📜 <b>Contratos</b> (🌌 Espacio → Contratos): las razas con las que tienes una amistad Conocida publican encargos: llévales bienes de otros mundos en unas horas. Acepta hasta 2 y envía una nave con los bienes: dinero y +150 de amistad. Con retraso: la mitad del pago y nada de amistad. Si se acaba el plazo o renuncias: −50 de amistad. Llega una oferta nueva cada hora (hasta 3).");
H("🌌 Space politics: races now have ⚔️ <b>rivals</b> (helping one makes its rival a little jealous), 💖 old allies slowly cool off unless you send a gift or keep a trade route running (never below 😊 Friendly), and selling lots of one good 📉 lowers its price for a few hours.",
  "🌌 Política espacial: ahora las razas tienen ⚔️ <b>rivales</b> (ayudar a una pone un poco celosa a su rival), 💖 los viejos aliados se enfrían poco a poco si no les envías un regalo o mantienes una ruta comercial (nunca por debajo de 😊 Amistosa), y vender mucho de un mismo bien 📉 baja su precio durante unas horas.");
H("📜 New in 🌌 Space: the <b>Contracts board</b>. Races post timed jobs: bring them goods from other worlds before the deadline for money and friendship.",
  "📜 Novedad en 🌌 Espacio: el <b>tablón de contratos</b>. Las razas publican encargos con plazo: llévales bienes de otros mundos antes de que se acabe para ganar dinero y amistad.");
Object.assign(ES, { "↶ Undo last bet": "↶ Deshacer última apuesta", "Undo last bet": "Deshacer última apuesta" });
H("🎡 Roulette: new <b>↶ Undo last bet</b> button. It takes back your last chip (or your last ↺ Repeat last bets), and you can press it again and again.",
  "🎡 Ruleta: nuevo botón <b>↶ Deshacer última apuesta</b>. Retira tu última ficha (o tu último ↺ Repetir últimas apuestas), y puedes pulsarlo una y otra vez.");
ES["Free bet chips: what the bet pays goes to your money."] = "Fichas de apuesta gratis: lo que pague la apuesta va a tu dinero.";
rx(String.raw`On the table now: (${NUM}) free\.`, "En la mesa ahora: $1 gratis.");
// 🔬 space research & crafting (js/34d-space-research.js)
const SP_ES_CRAFT = { "Resonance Prisms": "Prismas de resonancia", "Voidsteel Ingots": "Lingotes de acero del vacío", "Star Sails": "Velas estelares", "Chrono Chips": "Cronochips" };
const SP_RX_CRAFT = Object.keys(SP_ES_CRAFT).join("|"), spC = (c) => SP_ES_CRAFT[c] || c;
const SP_ES_RES = { "Space crafting": "Artesanía espacial", "Extra ship slots": "Hangares extra", "Cargo holds": "Bodegas de carga", "Ship engines": "Motores de nave", "Outposts": "Puestos avanzados",
  "Unlocks crafting: 60 s per unit": "Desbloquea la artesanía: 60 s por unidad", "Crafting: 45 s per unit": "Artesanía: 45 s por unidad", "Crafting: 30 s per unit": "Artesanía: 30 s por unidad",
  "+1 ship": "+1 nave", "+1 ship (2 in total)": "+1 nave (2 en total)", "+1 ship (3 in total)": "+1 nave (3 en total)",
  "+10 goods on every trip": "+10 bienes en cada viaje", "+10 goods on every trip (+20 in total)": "+10 bienes en cada viaje (+20 en total)", "+15 goods on every trip (+35 in total)": "+15 bienes en cada viaje (+35 en total)",
  "−5% trip time": "−5 % de tiempo de viaje", "−5% trip time (−10% in total)": "−5 % de tiempo de viaje (−10 % en total)", "−10% trip time (−20% in total)": "−10 % de tiempo de viaje (−20 % en total)",
  "+1 outpost": "+1 puesto avanzado", "+1 outpost (2 in total)": "+1 puesto avanzado (2 en total)", "+1 outpost (3 in total)": "+1 puesto avanzado (3 en total)" };
const SP_RX_RES = Object.keys(SP_ES_RES).map(k => k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|"), spRs = (x) => SP_ES_RES[x] || x;
Object.assign(ES, SP_ES_CRAFT, SP_ES_RES, { "Research": "Investigación", "Space research": "Investigación espacial", "scientists": "científicos", "Crafting": "Artesanía", "Crafted": "Fabricado",
  "Each level costs 🔬 scientists, money and space resources. The last levels need resources you craft yourself.": "Cada nivel cuesta 🔬 científicos, dinero y recursos espaciales. Los últimos niveles necesitan recursos que fabricas tú.",
  "to unlock crafting.": "para desbloquear la artesanía.", "Fully researched": "Investigado del todo", "Cancel (get your goods back)": "Cancelar (recuperas tus bienes)",
  "No outposts yet.": "Todavía no hay puestos avanzados.", "Outpost": "Puesto avanzado", "Build outpost": "Construir puesto avanzado", "Close the outpost": "Cerrar el puesto avanzado",
  "Close this outpost?": "¿Cerrar este puesto avanzado?", "Close it": "Cerrarlo",
  "Crafting cancelled. Your goods are back.": "Artesanía cancelada. Has recuperado tus bienes.",
  "a base in this system that makes": "una base en este sistema que produce", "makes": "produce",
});
rx(String.raw`Research level (\d)`, "Investigar nivel $1");
hrx(String.raw`<span class="ico">🔬<\/span>Research`, `<span class="ico">🔬</span>Investigación`); hrx(String.raw`<span>🔬<\/span>Research`, "<span>🔬</span>Investigación");
hrx(String.raw`🔒 Research <b>🛠️ Space crafting<\/b> to unlock crafting\.`, "🔒 Investiga <b>🛠️ Artesanía espacial</b> para desbloquear la artesanía.");
hrx(String.raw`<b>Level (\d):<\/b> (${SP_RX_RES})`, (m, n, x) => `<b>Nivel ${n}:</b> ${spRs(x)}`);
rx(String.raw`(✅ )?Now: (${SP_RX_RES})`, (m, e, x) => `${e || ""}Ahora: ${spRs(x)}`);
rx(String.raw`(🔬 )?Research done: (\S+) <b>(${SP_RX_RES}) (\d)<\/b> · (${SP_RX_RES})\.`, (m, e, i, nm, n, x) => `${e || ""}Investigación terminada: ${i} <b>${spRs(nm)} ${n}</b> · ${spRs(x)}.`);
rx(String.raw`(🛠️ )?Crafting done: (\S+) (\d+) (${SP_RX_CRAFT})\.`, (m, e, i, n, c) => `${e || ""}Artesanía terminada: ${i} ${n} ${spC(c)}.`);
hrx(String.raw`Crafting <b>(\d+)<\/b> (${SP_RX_CRAFT}) · ready in <b>([\d:]+)<\/b>`, (m, n, c, t) => `Fabricando <b>${n}</b> ${spC(c)} · listo en <b>${t}</b>`);
rx(String.raw`(${SP_RX_CRAFT}) · ready in`, (m, c) => `${spC(c)} · listo en`);
rx(String.raw`Mix 2 \+ 2 alien goods into 1 crafted resource, in batches of 25, 50, 75 or 100\. One batch at a time: (\d+) seconds a unit\. It keeps going while the game is closed\.`,
  "Combina 2 + 2 bienes alienígenas en 1 recurso fabricado, en lotes de 25, 50, 75 o 100. Un lote a la vez: $1 segundos por unidad. Sigue funcionando con el juego cerrado.");
rx(String.raw`(🏗️ )?Outposts \((\d+) \/ (\d+)\)`, (m, e, a, b) => `${e || ""}Puestos avanzados (${a} / ${b})`);
rx(String.raw`Outposts: (\d+) \/ (\d+) built( · research more 🏗️ Outposts or close one to build here)?\.`, (m, a, b, x) => `Puestos avanzados: ${a} / ${b} construidos${x ? " · investiga más 🏗️ Puestos avanzados o cierra uno para construir aquí" : ""}.`);
rx(String.raw`Goods made so far: ([\d.,]+)`, "Bienes producidos hasta ahora: $1");
rx(String.raw`(${SP_RX_GOOD}) an hour, no ship needed\. One per system\.`, (m, g) => `${spG(g)} por hora, sin necesidad de nave. Uno por sistema.`);
rx(String.raw`(${SP_RX_GOOD}) an hour, even while the game is closed\.`, (m, g) => `${spG(g)} por hora, incluso con el juego cerrado.`);
rx(String.raw`(🏗️ )?Outpost built at the (${SP_RX_NAME})! It makes (\d+) (${SP_RX_GOOD}) an hour\.`, (m, e, n, x, g) => `${e || ""}¡Puesto avanzado construido en los ${spN(n)}! Produce ${x} ${spG(g)} por hora.`);
hrx(String.raw`<b>Outpost:<\/b> you can build one here when you are <b>😊 Friendly<\/b> with the (${SP_RX_NAME})\.`, (m, n) => `<b>Puesto avanzado:</b> podrás construir uno aquí cuando tu amistad con los ${spN(n)} sea <b>😊 Amistosa</b>.`);
rx(String.raw`(\S+) (${SP_RX_NAME}): (\S+) (\d+) (${SP_RX_GOOD}) an hour · ([\d.,]+) made`, (m, e, n, i, x, g, k) => `${e} ${spN(n)}: ${i} ${x} ${spG(g)} por hora · ${k} producidos`);
H("🔬 <b>Research</b> (🌌 Space → Research): 5 research lines with 3 levels each. Every level costs 🔬 scientists (10/20/30), money (250,000/500,000/750,000 scoin) and space resources; the last levels need crafted resources. 🛠️ Space crafting unlocks crafting (60/45/30 s per unit), 🚀 Extra ship slots give +1 ship each, 📦 Cargo holds add +10/+10/+15 goods to every gift and trade route trip, 🔥 Ship engines cut trip times by 5%/5%/10%, and 🏗️ Outposts let you build +1 outpost each.",
  "🔬 <b>Investigación</b> (🌌 Espacio → Investigación): 5 líneas de investigación con 3 niveles cada una. Cada nivel cuesta 🔬 científicos (10/20/30), dinero (250.000/500.000/750.000 scoin) y recursos espaciales; los últimos niveles necesitan recursos fabricados. 🛠️ Artesanía espacial desbloquea la artesanía (60/45/30 s por unidad), 🚀 Hangares extra da +1 nave por nivel, 📦 Bodegas de carga suma +10/+10/+15 bienes a cada viaje de regalo y de ruta comercial, 🔥 Motores de nave reduce los viajes un 5 %/5 %/10 %, y 🏗️ Puestos avanzados te deja construir +1 puesto avanzado por nivel.");
H("🛠️ <b>Crafting:</b> mix 2 + 2 alien goods into 1 crafted resource, in batches of 25, 50, 75 or 100 (one batch at a time; it keeps going while the game is closed). 🔷 Resonance Prisms = Star Crystals + Echo Pearls · 🔩 Voidsteel Ingots = Nebula Cores + Void Gold · ⛵ Star Sails = Pirate Charts + Living Silk · 💾 Chrono Chips = Time Shards + Nano Parts.",
  "🛠️ <b>Artesanía:</b> combina 2 + 2 bienes alienígenas en 1 recurso fabricado, en lotes de 25, 50, 75 o 100 (un lote a la vez; sigue funcionando con el juego cerrado). 🔷 Prismas de resonancia = Cristales estelares + Perlas de eco · 🔩 Lingotes de acero del vacío = Núcleos de nebulosa + Oro del vacío · ⛵ Velas estelares = Cartas piratas + Seda viva · 💾 Cronochips = Fragmentos del tiempo + Nanopiezas.");
H("🏗️ <b>Outposts:</b> build one in a system you are 😊 Friendly with (one per system) for 1 gcoin and 10 🔬 scientists. It makes 20 of that race's goods an hour, even while the game is closed. Close it any time to build it somewhere else.",
  "🏗️ <b>Puestos avanzados:</b> construye uno en un sistema con el que tengas una amistad 😊 Amistosa (uno por sistema) por 1 gcoin y 10 🔬 científicos. Produce 20 bienes de esa raza por hora, incluso con el juego cerrado. Ciérralo cuando quieras para construirlo en otro sitio.");
H("🔬 New in 🌌 Space: <b>Research</b>! 5 research lines (crafting, extra ships, cargo holds, engines and outposts), each with 3 levels.",
  "🔬 Novedad en 🌌 Espacio: ¡<b>Investigación</b>! 5 líneas de investigación (artesanía, naves extra, bodegas de carga, motores y puestos avanzados), cada una con 3 niveles.");
H("🛠️ Space <b>crafting</b>: mix alien goods into 4 new resources (🔷 Resonance Prisms, 🔩 Voidsteel Ingots, ⛵ Star Sails and 💾 Chrono Chips), in batches of 25 to 100. You need them for the top research levels.",
  "🛠️ <b>Artesanía</b> espacial: combina bienes alienígenas en 4 recursos nuevos (🔷 Prismas de resonancia, 🔩 Lingotes de acero del vacío, ⛵ Velas estelares y 💾 Cronochips), en lotes de 25 a 100. Los necesitas para los niveles más altos de investigación.");
H("🏗️ <b>Outposts</b>: build a base in a friendly system and it makes that race's goods on its own, no ship needed.",
  "🏗️ <b>Puestos avanzados</b>: construye una base en un sistema amistoso y producirá los bienes de esa raza por sí sola, sin necesidad de nave.");
rx(String.raw`Pick a system on the 🌌 star map you are 😊 Friendly with and build an outpost there \((${NUM}) \+ (\d+) 🔬 scientists\)\. Each one makes (\d+) of that race's goods an hour\.`,
  "Elige en el 🌌 mapa estelar un sistema con el que tengas una amistad 😊 Amistosa y construye allí un puesto avanzado ($1 + $2 🔬 científicos). Cada uno produce $3 bienes de esa raza por hora.");
rx(String.raw`It stops making goods\. You can build a new one in another system \(that costs (${NUM}) and (\d+) 🔬 scientists again\)\.`, "Deja de producir bienes. Puedes construir uno nuevo en otro sistema (vuelve a costar $1 y $2 🔬 científicos).");
rx(String.raw`(❌ )?An outpost costs (${NUM}) and (\d+) 🔬 scientists\.`, (m, e, a, b) => `${e || ""}Un puesto avanzado cuesta ${a} y ${b} 🔬 científicos.`);
rx(String.raw`Build outpost · (${NUM}) \+ 🔬 (\d+)`, "Construir puesto avanzado · $1 + 🔬 $2");
// 🎓 4th University (after the 4th prestige)
Object.assign(ES, { "4th University": "4.ª universidad" });
rx(String.raw`Your reward for all 4 prestiges: a fourth University for the same shared pool, up to (\d+) scientists in total\. −(\d+) \/ sec per empty place, \+(${NUM}) \/ sec when full\.`,
  "Tu recompensa por los 4 prestigios: una cuarta universidad para la misma reserva compartida, hasta $1 científicos en total. −$2 / s por cada plaza vacía, +$3 / s cuando está llena.");
rx(String.raw`Your reward for all 4 prestiges: a fourth University for (${NUM}), up to (\d+) scientists in your shared pool\.`, "Tu recompensa por los 4 prestigios: una cuarta universidad por $1, hasta $2 científicos en tu reserva compartida.");
rx(String.raw`(🎓 )?4th University built! Up to (\d+) scientists in your shared pool\.`, (m, e, n) => `${e || ""}¡4.ª universidad construida! Hasta ${n} científicos en tu reserva compartida.`);
// 🎓 Science page: University card and Space Mission Center lines
Object.assign(ES, { "1st": "1.ª", "2nd": "2.ª", "3rd": "3.ª", "4th": "4.ª", "next launch in": "próximo lanzamiento en",
  "Both Universities share one pool": "Las dos universidades comparten una reserva", "All three Universities share one pool": "Las tres universidades comparten una reserva",
  "All four Universities share one pool": "Las cuatro universidades comparten una reserva",
  "A satellite is now available in 🚢 Logistics.": "Ya hay un satélite disponible en 🚢 Logística." });
rx(String.raw`University ×(\d)`, "Universidad ×$1");
rx(String.raw`1 new scientist every 2 minutes · −(\d+) \/ sec for each empty place · \+(${NUM}) \/ sec when full`, "1 científico nuevo cada 2 minutos · −$1 / s por cada plaza vacía · +$2 / s cuando está llena");
rx(String.raw`Every (\d+) minutes: (${NUM}) – (${NUM})( \(🧬 \+30%\))?, or nothing if the mission fails \((\d+)% chance\)`, (m, n, a, b, g, f) => `Cada ${n} minutos: ${a} – ${b}${g ? " (🧬 +30 %)" : ""}, o nada si la misión fracasa (${f} % de probabilidad)`);
// 🛸 fleet & Stardust Drift (js/34e-space-fleet.js)
Object.assign(SP_ES_RES, { "Stardust Harvesters": "Cosechadoras de polvo estelar", "Escort Frigates": "Fragatas de escolta", "Extra courier ships": "Naves mensajeras extra",
  "+1 harvester · 5 stardust a minute": "+1 cosechadora · 5 de polvo estelar por minuto", "+1 harvester (2 in total) · 6 stardust a minute each": "+1 cosechadora (2 en total) · 6 de polvo estelar por minuto cada una",
  "+1 harvester (3 in total) · 7 stardust a minute each": "+1 cosechadora (3 en total) · 7 de polvo estelar por minuto cada una",
  "+1 frigate": "+1 fragata", "+2 frigates (3 in total)": "+2 fragatas (3 en total)", "+2 frigates (5 in total)": "+2 fragatas (5 en total)" });
const SP_RX_RES2 = Object.keys(SP_ES_RES).sort((a, b) => b.length - a.length).map(k => k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|");
Object.assign(ES, SP_ES_RES, { "Free courier ships": "Naves mensajeras libres", "courier free": "mensajera libre", "couriers free": "mensajeras libres",
  "Stardust Drift": "Deriva de Polvo Estelar", "Pirate space": "Espacio pirata", "Pirates": "Piratas", "Farmed": "Cosechado", "Attacks": "Ataques", "Driven off": "Ahuyentados", "Frigates lost": "Fragatas perdidas",
  "Send with escort": "Enviar con escolta", "Send without escort": "Enviar sin escolta", "Harvesters at work": "Cosechadoras trabajando", "Harvester": "Cosechadora", "no escort": "sin escolta",
  "Courier ships": "Naves mensajeras", "(gifts, trade routes, contracts, exploring)": "(regalos, rutas comerciales, contratos, exploración)", "free": "libres",
  "A new Escort Frigate is ready.": "Una nueva fragata de escolta está lista.", "Fleet": "Flota",
  "Send a free frigate with every courier ship (pirates leave escorted ships alone)": "Enviar una fragata libre con cada nave mensajera (los piratas dejan en paz a las naves escoltadas)",
  "A glittering cloud of stardust left behind by dying stars. Harvesters can farm it, but wild pirates hunt here and nobody controls them, not even the Void Corsairs.":
    "Una nube brillante de polvo estelar que dejaron estrellas moribundas. Las cosechadoras pueden recogerlo, pero aquí cazan piratas salvajes que nadie controla, ni siquiera los Corsarios del Vacío.",
  "30% chance of an attack in the first half hour of farming, 50% in the second. Without an escort they take all the stardust farmed so far. A 🛡️ frigate drives them off, but has a 3% chance to be destroyed in each attack (and then the stardust is lost too).":
    "30 % de probabilidad de un ataque en la primera media hora de cosecha y 50 % en la segunda. Sin escolta se llevan todo el polvo estelar cosechado hasta entonces. Una 🛡️ fragata los ahuyenta, pero tiene un 3 % de probabilidad de ser destruida en cada ataque (y entonces también se pierde el polvo estelar).",
  "(🌌 Space → Research) to farm stardust here.": "(🌌 Espacio → Investigación) para cosechar polvo estelar aquí.",
  "Exploring the signal · back in": "Explorando la señal · vuelve en", "5 min each way · farming takes 1 hour": "5 min por trayecto · la cosecha dura 1 hora",
  "flying there · farming starts in": "de camino · la cosecha empieza en", "coming home · back in": "volviendo · llega en",
});
hrx(String.raw`A strange glittering cloud at the edge of your scanners\. Send a courier ship to explore it: <b>(\d+) min<\/b> there and <b>(\d+) min<\/b> back\.`, "Una extraña nube brillante en el borde de tus escáneres. Envía una nave mensajera a explorarla: <b>$1 min</b> de ida y <b>$2 min</b> de vuelta.");
rx(String.raw`(🚀 )?A courier ship is on its way to explore the strange signal \((\d+) min there, (\d+) min back\)\.`, (m, e, a, b) => `${e || ""}Una nave mensajera va de camino a explorar la extraña señal (${a} min de ida, ${b} min de vuelta).`);
rx(String.raw`(🌫️ )?Your courier ship found the <b>Stardust Drift<\/b>: a glittering cloud full of stardust, and full of pirates\. (Send a ✨ Stardust Harvester to farm it!|Research ✨ Stardust Harvesters \(🌌 Space → Research\) to farm it\.)`, (m, e, x) =>
  `${e || ""}Tu nave mensajera ha encontrado la <b>Deriva de Polvo Estelar</b>: una nube brillante llena de polvo estelar… y de piratas. ${x.startsWith("Send") ? "¡Envía una ✨ cosechadora de polvo estelar a recogerlo!" : "Investiga ✨ Cosechadoras de polvo estelar (🌌 Espacio → Investigación) para recogerlo."}`);
hrx(String.raw`Stardust Drift<small>(🏴‍☠️ Pirate space|(✨|🔁) (\d+) harvesting)<\/small>`, (m, x, e, n) => `Deriva de Polvo Estelar<small>${n ? `${e} ${n} cosechando` : "🏴‍☠️ Espacio pirata"}</small>`);
rx(String.raw`(\d+) harvesting`, "$1 cosechando");
hrx(String.raw`(\{i\}|🌫️ )?Stardust Drift <span>· Pirate space<\/span>`, (m, i) => `${i || ""}Deriva de Polvo Estelar <span>· Espacio pirata</span>`);
hrx(String.raw`<b>Distance:<\/b> (\d+) min each way · farming takes 1 hour`, "<b>Distancia:</b> $1 min por trayecto · la cosecha dura 1 hora");
hrx(String.raw`<b>Pirates:<\/b> (.+)`, (m, x) => `<b>Piratas:</b> ${ES[x] || x}`);
hrx(String.raw`(?:Research|Investigación) <b>✨ Stardust Harvesters<\/b> \(🌌 Space → Research\) to farm stardust here\.`, "Investiga <b>✨ Cosechadoras de polvo estelar</b> (🌌 Espacio → Investigación) para cosechar polvo estelar aquí.");
hrx(String.raw`<b>Level (\d):<\/b> (${SP_RX_RES2})`, (m, n, x) => `<b>Nivel ${n}:</b> ${SP_ES_RES[x] || x}`);
rx(String.raw`(✅ )?Now: (${SP_RX_RES2})`, (m, e, x) => `${e || ""}Ahora: ${SP_ES_RES[x] || x}`);
rx(String.raw`(🔬 )?Research done: (\S+) <b>(${SP_RX_RES2}) (\d)<\/b> · (${SP_RX_RES2})\.`, (m, e, i, nm, n, x) => `${e || ""}Investigación terminada: ${i} <b>${SP_ES_RES[nm] || nm} ${n}</b> · ${SP_ES_RES[x] || x}.`);
hrx(String.raw`<b>Stardust Harvesters:<\/b> (\d+) \/ (\d+) out · each farms <b>(\d+)<\/b> stardust a minute \(✨ ([\d.,]+) an hour\)\.`, "<b>Cosechadoras de polvo estelar:</b> $1 / $2 fuera · cada una cosecha <b>$3</b> de polvo estelar por minuto (✨ $4 por hora).");
rx(String.raw`(🛡️ )?Frigates free: (\d+) \/ (\d+)`, (m, e, a, b) => `${e || ""}Fragatas libres: ${a} / ${b}`);
rx(String.raw`All your courier ships are busy\.`, "Todas tus naves mensajeras están ocupadas.");
rx(String.raw`All your harvesters are out\.`, "Todas tus cosechadoras están fuera.");
rx(String.raw`All your frigates are busy\.`, "Todas tus fragatas están ocupadas.");
rx(String.raw`No frigates: build one for (${NUM}) at 🌍 Home\.`, "No tienes fragatas: construye una por $1 en 🌍 Hogar.");
rx(String.raw`Research 🛡️ Escort Frigates \(🌌 Space → Research\) to protect your harvesters\.`, "Investiga 🛡️ Fragatas de escolta (🌌 Espacio → Investigación) para proteger tus cosechadoras.");
rx(String.raw`(✨ )?A Stardust Harvester is on its way to the Stardust Drift( with a 🛡️ frigate escort| \(no escort: watch out for pirates!\))\.`, (m, e, x) => `${e || ""}Una cosechadora de polvo estelar va de camino a la Deriva de Polvo Estelar${x.includes("with") ? " con una 🛡️ fragata de escolta" : " (sin escolta: ¡cuidado con los piratas!)"}.`);
hrx(String.raw`(\S+|\{i\}) Harvester( \+ (?:\S+|\{i\}) escort| · <span>no escort<\/span>) · (flying there · farming starts in|farming · ✨ <b>[\d.,]+<\/b> so far · done in|coming home · back in) <b>([\d:]+)<\/b>( with ✨ <b>[\d.,]+<\/b>)?`, (m, i, esc, st, t, w) => {
  const e2 = esc.includes("no escort") ? " · <span>sin escolta</span>" : esc.replace(" escort", " escolta");
  const st2 = st.startsWith("flying") ? "de camino · la cosecha empieza en" : st.startsWith("coming") ? "volviendo · llega en" : st.replace("farming · ", "cosechando · ").replace(" so far · done in", " hasta ahora · termina en");
  return `${i} Cosechadora${e2} · ${st2} <b>${t}</b>${w ? w.replace(" with ", " con ") : ""}`; });
rx(String.raw`(🛡️ )?Pirates attacked your harvester in the Stardust Drift, but your frigate drove them off!`, (m, e) => `${e || ""}¡Los piratas atacaron tu cosechadora en la Deriva de Polvo Estelar, pero tu fragata los ahuyentó!`);
rx(String.raw`(💥 )?Pirates destroyed your escort frigate in the Stardust Drift and took ✨ ([\d.,]+) stardust! Build a new frigate for (${NUM}) \(🌍 Home\)\.`, (m, e, n, x) => `${e || ""}¡Los piratas destruyeron tu fragata de escolta en la Deriva de Polvo Estelar y se llevaron ✨ ${n} de polvo estelar! Construye una fragata nueva por ${x} (🌍 Hogar).`);
rx(String.raw`(🏴‍☠️ )?Pirates raided your unprotected harvester in the Stardust Drift and took ✨ ([\d.,]+) stardust! It keeps farming\.`, (m, e, n) => `${e || ""}¡Los piratas asaltaron tu cosechadora sin protección en la Deriva de Polvo Estelar y se llevaron ✨ ${n} de polvo estelar! Sigue cosechando.`);
rx(String.raw`(✨ )?Your harvester is back from the Stardust Drift with <b>([\d.,]+)<\/b> stardust( \(pirates took ([\d.,]+)\))?\.`, (m, e, n, x, l) => `${e || ""}Tu cosechadora ha vuelto de la Deriva de Polvo Estelar con <b>${n}</b> de polvo estelar${l ? ` (los piratas se llevaron ${l})` : ""}.`);
rx(String.raw`(🛡️ )?Pirates spotted your courier ship to the (${SP_RX_NAME}), saw its frigate escort and flew away\.`, (m, e, n) => `${e || ""}Los piratas vieron tu nave mensajera hacia los ${spN(n)}, vieron su fragata de escolta y se marcharon.`);
hrx(String.raw`🚀 Courier ships: <b>(\d+) \/ (\d+)<\/b> (?:busy|ocupadas)`, "🚀 Naves mensajeras: <b>$1 / $2</b> ocupadas");
hrx(String.raw`(\S+|\{i\}) Courier ships: <b>(\d+) \/ (\d+)<\/b> free <span>\(gifts, trade routes, contracts, exploring\)<\/span>`, "$1 Naves mensajeras: <b>$2 / $3</b> libres <span>(regalos, rutas comerciales, contratos, exploración)</span>");
hrx(String.raw`(\S+|\{i\}) Stardust Harvesters: <b>(\d+) \/ (\d+)<\/b> free`, "$1 Cosechadoras de polvo estelar: <b>$2 / $3</b> libres");
hrx(String.raw`(\S+|\{i\}) Escort Frigates: <b>(\d+) \/ (\d+)<\/b> free( · (\d+) destroyed)?`, (m, i, a, b, x, d) => `${i} Fragatas de escolta: <b>${a} / ${b}</b> libres${d ? ` · ${d} destruidas` : ""}`);
rx(String.raw`free · (\d+) destroyed`, "libres · $1 destruidas");
rx(String.raw`Build a frigate · (${NUM})`, "Construir una fragata · $1");
H("🛸 <b>Fleet:</b> 🚀 <b>courier ships</b> carry gifts, trade routes, contracts and explorers. ✨ <b>Stardust Harvesters</b> (research: up to 3) farm the 🌫️ Stardust Drift, and 🛡️ <b>Escort Frigates</b> (research: 1, then 2 and 2 more, up to 5) protect your other ships. Tick the box at 🌍 Home to send a free frigate with every courier ship: pirates leave escorted ships alone.",
  "🛸 <b>Flota:</b> las 🚀 <b>naves mensajeras</b> llevan regalos, rutas comerciales, contratos y exploradores. Las ✨ <b>cosechadoras de polvo estelar</b> (investigación: hasta 3) recogen polvo en la 🌫️ Deriva de Polvo Estelar, y las 🛡️ <b>fragatas de escolta</b> (investigación: 1, luego 2 y 2 más, hasta 5) protegen tus otras naves. Marca la casilla en 🌍 Hogar para enviar una fragata libre con cada nave mensajera: los piratas dejan en paz a las naves escoltadas.");
H("🌫️ <b>Stardust Drift:</b> an area at the top of the star map (explore it first, 5 min each way). A harvester flies there in 5 minutes, farms for 1 hour (5/6/7 stardust a minute, by research level) and flies home. Pirates: 30% chance of an attack in the first half hour of farming and 50% in the second. With no escort they take all the stardust farmed so far. A frigate drives them off, but each attack has a 3% chance to destroy it (and then the stardust is lost too). Build a new frigate for 10 gcoin at 🌍 Home.",
  "🌫️ <b>Deriva de Polvo Estelar:</b> una zona en la parte de arriba del mapa estelar (primero hay que explorarla, 5 min por trayecto). Una cosechadora tarda 5 minutos en llegar, cosecha durante 1 hora (5/6/7 de polvo estelar por minuto, según el nivel de investigación) y vuelve. Piratas: 30 % de probabilidad de un ataque en la primera media hora de cosecha y 50 % en la segunda. Sin escolta se llevan todo el polvo cosechado hasta entonces. Una fragata los ahuyenta, pero cada ataque tiene un 3 % de probabilidad de destruirla (y entonces también se pierde el polvo). Construye una fragata nueva por 10 gcoin en 🌍 Hogar.");
H("🛸 New spaceships! ✨ <b>Stardust Harvesters</b> farm stardust and 🛡️ <b>Escort Frigates</b> protect your ships from pirates. Research them in 🌌 Space → Research. Your old ships are now called 🚀 <b>courier ships</b>.",
  "🛸 ¡Naves nuevas! Las ✨ <b>cosechadoras de polvo estelar</b> recogen polvo estelar y las 🛡️ <b>fragatas de escolta</b> protegen tus naves de los piratas. Investígalas en 🌌 Espacio → Investigación. Tus naves de siempre ahora se llaman 🚀 <b>naves mensajeras</b>.");
H("🌫️ A new area on the star map: the <b>Stardust Drift</b>. Explore it, then send harvesters to farm stardust for an hour, but watch out for pirates!",
  "🌫️ Una zona nueva en el mapa estelar: la <b>Deriva de Polvo Estelar</b>. Explórala y envía cosechadoras a recoger polvo estelar durante una hora, ¡pero cuidado con los piratas!");
// 🔁 barter in the alien market
Object.assign(ES, { "Trade with friendly races": "Comerciar con razas amistosas", "You give": "Das", "You get": "Recibes", "How many to get": "Cuántos recibir", "Trade": "Intercambiar",
  "Pick two different goods.": "Elige dos bienes distintos.", "Goods received by trading": "Bienes recibidos intercambiando",
  "Swap your alien goods: you give 2, you get 1. You can get the goods of any race that is 😊 Friendly or better with you. 🏺 Ancient Relics can't be traded here.":
    "Intercambia tus bienes alienígenas: das 2 y recibes 1. Puedes conseguir los bienes de cualquier raza con la que tengas una amistad 😊 Amistosa o mejor. Las 🏺 Reliquias antiguas no se pueden intercambiar aquí." });
hrx(String.raw`🔒 Become <b>😊 Friendly<\/b> with a race to trade for its goods here\.`, "🔒 Consigue una amistad <b>😊 Amistosa</b> con una raza para intercambiar aquí sus bienes.");
rx(String.raw`You need at least (\d+) of an alien good to trade\.`, "Necesitas al menos $1 de un bien alienígena para intercambiar.");
rx(String.raw`(${SP_RX_GOOD}) \(([\d.,]+)\)`, (m, g, n) => `${spG(g)} (${n})`);
rx(String.raw`Max \(([\d.,]+)\)`, "Máx. ($1)");
hrx(String.raw`🔁 Goods received by trading: <b>([\d.,]+)<\/b>`, "🔁 Bienes recibidos intercambiando: <b>$1</b>");
rx(String.raw`(🔁 )?Traded (\S+) ([\d.,]+) (${SP_RX_GOOD}) for (\S+) ([\d.,]+) (${SP_RX_GOOD}) with the (${SP_RX_NAME})\.`, (m, e, i1, a, g1, i2, b, g2, n) => `${e || ""}Has intercambiado ${i1} ${a} ${spG(g1)} por ${i2} ${b} ${spG(g2)} con los ${spN(n)}.`);
H("🔁 <b>Trading goods</b> (🌌 Space → Market): swap your alien goods with races that are 😊 Friendly or better: you give 2 of any good and get 1 of theirs. 🏺 Ancient Relics can't be traded.",
  "🔁 <b>Intercambio de bienes</b> (🌌 Espacio → Mercado): intercambia tus bienes alienígenas con razas con las que tengas una amistad 😊 Amistosa o mejor: das 2 de cualquier bien y recibes 1 del suyo. Las 🏺 Reliquias antiguas no se pueden intercambiar.");
H("🔁 Market: you can now <b>trade goods</b> with 😊 Friendly races. Give 2 of any alien good, get 1 of theirs (🏺 Ancient Relics can't be traded).",
  "🔁 Mercado: ahora puedes <b>intercambiar bienes</b> con razas 😊 Amistosas. Da 2 de cualquier bien alienígena y recibe 1 del suyo (las 🏺 Reliquias antiguas no se pueden intercambiar).");
// 🪧 compact race panel (chips + tabs)
Object.assign(ES, { "Relations & bonuses": "Relaciones y bonificaciones", "Distance: one way": "Distancia: solo ida", "Your trade route keeps them happy": "Tu ruta comercial los mantiene contentos",
  "They start to cool off without a gift, a contract or a trade route": "Empiezan a enfriarse sin un regalo, un contrato o una ruta comercial", "Close": "Cerrar" });
rx(String.raw`Favourite gift: \+(\d+) friendship`, "Regalo favorito: +$1 de amistad");
rx(String.raw`Also likes: \+(\d+) friendship`, "También le gusta: +$1 de amistad");
rx(String.raw`Wants a mix of these goods \(\+(\d+) friendship\)`, "Quiere una mezcla de estos bienes (+$1 de amistad)");
rx(String.raw`They send back (\d+) per gift \(more when you level up\)`, "Te devuelven $1 por regalo (más al subir de nivel)");
rx(String.raw`Rivals: friendship you earn here costs (\d+)% of it with them`, "Rivales: la amistad que ganes aquí te cuesta un $1 % de ella con ellos");
rx(String.raw`−(\d+) friendship an hour \(never below Friendly\)`, "−$1 de amistad por hora (nunca por debajo de Amistosa)");
rx(String.raw`You have (\d+) paintings? in your collection\.`, "Tienes $1 cuadros en tu colección.");
// 🔔 Space tab alerts
Object.assign(ES, { "Something is ready in 🌌 Space": "Hay algo listo en 🌌 Espacio", "A harvester is back from the Stardust Drift": "Una cosechadora ha vuelto de la Deriva de Polvo Estelar",
  "You already have the goods for a contract offer": "Ya tienes los bienes para una oferta de contrato", "A contract is ready to deliver": "Hay un contrato listo para entregar",
  "Crafting is done": "La artesanía ha terminado", "You can afford a research level": "Puedes pagar un nivel de investigación",
  "Crafting is done · You can afford a research level": "La artesanía ha terminado · Puedes pagar un nivel de investigación" });
H("🌌 Space is easier to use: the system panel now sits beside the star map (a slide-up sheet on phones), race panels are shorter, and a gold <b>!</b> on the Space tabs shows when a harvester is back, a contract can be delivered, crafting is done or you can afford research.",
  "🌌 El Espacio es más cómodo: el panel del sistema está ahora junto al mapa estelar (una hoja que sube desde abajo en el móvil), los paneles de las razas son más cortos y un <b>!</b> dorado en las pestañas del Espacio avisa cuando vuelve una cosechadora, puedes entregar un contrato, termina la artesanía o puedes pagar una investigación.");
// 🔁 auto-harvest
Object.assign(ES, { "when a frigate is free": "cuando haya una fragata libre", "always (wait for a free frigate)": "siempre (esperar a una fragata libre)", "never": "nunca",
  "Waiting for a free frigate.": "Esperando a una fragata libre.", "Escort:": "Escolta:", "Escort": "Escolta", "Escolta": "Escolta", "Keep harvesting": "Seguir cosechando",
  "harvesters fly out again on their own, also while the game is closed": "las cosechadoras vuelven a salir solas, también con el juego cerrado" });
hrx(String.raw`🔁 <b>Keep harvesting:<\/b> harvesters fly out again on their own, also while the game is closed`, "🔁 <b>Seguir cosechando:</b> las cosechadoras vuelven a salir solas, también con el juego cerrado");
rx(String.raw`(🔁 )?Your harvesters made (\d+) trips? to the Stardust Drift and brought home ✨ <b>([\d.,]+)<\/b> stardust( \(pirates took ([\d.,]+)\))?\.`, (m, e, n, d, x, l) =>
  `${e || ""}Tus cosechadoras han hecho ${n} viaje${n === "1" ? "" : "s"} a la Deriva de Polvo Estelar y han traído ✨ <b>${d}</b> de polvo estelar${l ? ` (los piratas se llevaron ${l})` : ""}.`);
H("🔁 Stardust Drift: new <b>Keep harvesting</b> switch. Harvesters fly out again on their own (also while the game is closed), with an escort when a frigate is free, always, or never.",
  "🔁 Deriva de Polvo Estelar: nuevo interruptor <b>Seguir cosechando</b>. Las cosechadoras vuelven a salir solas (también con el juego cerrado), con escolta cuando haya una fragata libre, siempre o nunca.");
H("🔁 <b>Keep harvesting:</b> tick the box in the Stardust Drift panel and free harvesters fly out again on their own, also while the game is closed. Choose the escort: when a frigate is free, always (they wait for a free frigate), or never.",
  "🔁 <b>Seguir cosechando:</b> marca la casilla en el panel de la Deriva de Polvo Estelar y las cosechadoras libres vuelven a salir solas, también con el juego cerrado. Elige la escolta: cuando haya una fragata libre, siempre (esperan a una fragata libre) o nunca.");
// 🎰 in-game bar + ↶ Undo on every chip table
Object.assign(ES, { "Lv": "Nv.", "XP multiplier at this table": "Multiplicador de XP en esta mesa", "Free bet chips you own": "Fichas de apuesta gratis que tienes", "↶ Undo": "↶ Deshacer", "Undo": "Deshacer",
  "Your money: you bet straight from it": "Tu dinero: apuestas directamente con él" });
hrx(String.raw`Lv <b>(\d+)<\/b>`, "Nv. <b>$1</b>");
rx(String.raw`Gambler level · (max level|([\d.,]+) \/ ([\d.,]+) XP)`, (m, x, a, b) => `Nivel de jugador · ${a ? `${a} / ${b} XP` : "nivel máximo"}`);
rx(String.raw`Hot Tables: (.+) · \+(\d+) XP multiplier`, (m, g, n) => `Mesas calientes: ${ES[g] || g} · +${n} al multiplicador de XP`);
rx(String.raw`Next hot game: (.+)`, (m, g) => `Próximo juego caliente: ${ES[g] || g}`);
H("🎰 Casino tables are easier to play: while a game is open, one slim bar shows your level, money, Hot Tables timer and free chips, so the table starts higher. Every chip table (Roulette, Blackjack, Baccarat, Hold'em) now has the same buttons in the same order, with <b>↶ Undo</b> everywhere; on phones they stay at the bottom of the screen.",
  "🎰 Las mesas del casino son más cómodas: con un juego abierto, una barra fina muestra tu nivel, tu dinero, el temporizador de mesas calientes y las fichas gratis, así la mesa empieza más arriba. Todas las mesas con fichas (ruleta, blackjack, baccarat y Hold'em) tienen ahora los mismos botones en el mismo orden, con <b>↶ Deshacer</b> en todas; en el móvil se quedan en la parte de abajo de la pantalla.");
// 🎰 lobby rework: one card per game + continue playing + table switch
Object.assign(ES, { "Continue playing": "Seguir jugando", "Classic": "Clásica", "High": "Altas", "Super": "Súper", "Switch table": "Cambiar de mesa", "Finish this round first.": "Termina primero esta ronda.",
  "European roulette: bet on numbers, colours, dozens and more.": "Ruleta europea: apuesta a números, colores, docenas y más.",
  "Beat the dealer to 21 with up to 3 hands at once.": "Gana a la banca llegando a 21 con hasta 3 manos a la vez.",
  "Bet on Player, Banker or a Tie: the hand closest to 9 wins.": "Apuesta a Jugador, Banca o Empate: gana la mano más cercana a 9.",
  "Jacks or Better with a joker, and a jackpot on every table.": "Jacks or Better con comodín, y un bote en cada mesa.",
  "Beat the dealer's poker hand with 1 or 2 seats.": "Gana a la mano de póquer de la banca con 1 o 2 asientos.",
  "Drop up to 20 balls into multipliers from 0.3× to 250×.": "Suelta hasta 20 bolas hacia multiplicadores de 0,3× a 250×.",
  "Climb a 20-step ladder up to 50,000×. Cash out before a red ball!": "Sube una escalera de 20 peldaños hasta 50.000×. ¡Cobra antes de que salga una bola roja!",
  "A 7×7 cluster slot with lab spots that grow up to ×128.": "Una tragaperras de grupos de 7×7 con casillas de laboratorio que crecen hasta ×128." });
rx(String.raw`(Classic|High rollers|Super high rollers) · (?:bets )?(${NUM}) – (${NUM})`, (m, t, a, b) => `${{ Classic: "Clásica", "High rollers": "Altas apuestas", "Super high rollers": "Súper altas apuestas" }[t]} · ${a} – ${b}`);
H("🎰 New casino lobby: one card per game with a quick table switch (Classic, High rollers, Super high rollers), a <b>▶ Continue playing</b> row with the 🔥 hot game and your last tables, and a table switch in the bar while you play.",
  "🎰 Nuevo vestíbulo del casino: una tarjeta por juego con un cambio rápido de mesa (clásica, altas apuestas, súper altas apuestas), una fila <b>▶ Seguir jugando</b> con el juego caliente 🔥 y tus últimas mesas, y un cambio de mesa en la barra mientras juegas.");
H("🎰 Shorter tables: empty Blackjack and Hold'em tables take less room between rounds, and the Video Poker and Hold'em payout tables start folded after your first 3 rounds (📋 Show opens them again).",
  "🎰 Mesas más cortas: las mesas vacías de blackjack y Hold'em ocupan menos espacio entre rondas, y las tablas de pagos del videopóquer y del Hold'em empiezan plegadas después de tus 3 primeras rondas (📋 Mostrar las vuelve a abrir).");
hrx(String.raw`(\{i\}|<img[^>]*>)?<span>(.+?)<\/span>&nbsp;in ([\d:]+)`, (m, i, g, t) => `${i || ""}<span>${ES[g] || g}</span>&nbsp;en ${t}`);
hrx(String.raw`(\{i\}|<img[^>]*>)?<span>(.+?)<\/span> in ([\d:]+)`, (m, i, g, t) => `${i || ""}<span>${ES[g] || g}</span> en ${t}`);
rx(String.raw`in ([\d:]+)`, "en $1");
// 🏢 compact businesses
Object.assign(ES, { "free worker slots earn nothing": "las plazas de trabajador libres no ganan nada", "Show ›": "Ver ›", "Full": "Completo", "Details": "Detalles", "▴ Fold": "▴ Plegar", "▴ Hide": "▴ Ocultar", "▴ Hide offers": "▴ Ocultar ofertas", "Hide offers": "Ocultar ofertas" });
rx(String.raw`(\d+) (business needs|businesses need) staff`, (m, n, x) => `${n} ${x.startsWith("business ") ? "negocio necesita" : "negocios necesitan"} personal`);
rx(String.raw`(\d+) (business|businesses) · (\d+) \/ (\d+) workers`, (m, n, x, a, b) => `${n} ${x === "business" ? "negocio" : "negocios"} · ${a} / ${b} trabajadores`);
rx(String.raw`Hire · (\d+) free`, "Contratar · $1 libres");
H("🏢 Businesses are easier to manage: the shop is wider on big screens, each business is one compact row (2 per line) with its workers bar, and a gold banner takes you straight to businesses that still have free worker slots. Tap <b>👷 Hire</b> or <b>Details</b> to open one.",
  "🏢 Los negocios son más fáciles de gestionar: la tienda es más ancha en pantallas grandes, cada negocio es una fila compacta (2 por línea) con su barra de trabajadores, y un aviso dorado te lleva directamente a los negocios que aún tienen plazas libres. Pulsa <b>👷 Contratar</b> o <b>Detalles</b> para abrir uno.");
// 💡 income hints
Object.assign(ES, { "Hire workers to start earning": "Contrata trabajadores para empezar a ganar", "A business has free worker slots": "Un negocio tiene plazas de trabajador libres",
  "The most worker income for each coin you spend": "Los mayores ingresos de trabajadores por cada moneda que gastas", "Best value": "Mejor valor" });
rx(String.raw`Need (${NUM}) more`, "Faltan $1");
rx(String.raw`Max ×(\d+) · (${NUM})`, "Máx. ×$1 · $2");
rx(String.raw`(🏢 )?Bought (\d+) × (.+) for (${NUM})\.`, (m, e, n, b, x) => `${e || ""}Has comprado ${n} × ${ES[b] || b} por ${x}.`);
H("💡 Income tips: a gold <b>!</b> on Income and Businesses when a business has free worker slots, a <b>⭐ Best value</b> tag on the business with the most income per coin, a <b>Max</b> button to buy several at once, and Buy buttons now say how much money is missing.",
  "💡 Ayudas en Ingresos: un <b>!</b> dorado en Ingresos y Negocios cuando un negocio tiene plazas libres, una etiqueta <b>⭐ Mejor valor</b> en el negocio con más ingresos por moneda, un botón <b>Máx.</b> para comprar varios a la vez, y los botones de compra ahora dicen cuánto dinero falta.");
// 📈 investing layout
Object.assign(ES, { "Profit": "Beneficio", "Worth": "Valor", "Stock market ETF": "ETF de bolsa", "Global Freight Co. shares": "Acciones de Global Freight Co.", "Broker ETF": "ETF del bróker",
  "needs a Brokerage Firm (Income, Investor level 10)": "necesita una Agencia de Bolsa (Ingresos, nivel de inversor 10)",
  "opens with Logistics (buy your first Car Salon)": "se abre con Logística (compra tu primer concesionario)", "All-time profits": "Beneficios totales" });
rx(String.raw`(\d+) (property|properties)`, (m, n, x) => `${n} ${x === "property" ? "propiedad" : "propiedades"}`);
rx(String.raw`Investor level · (max level|([\d.,]+) \/ ([\d.,]+) XP)`, (m, x, a, b) => `Nivel de inversor · ${a ? `${a} / ${b} XP` : "nivel máximo"}`);
H("📈 Investing is tidier: one slim bar shows your level, money and holdings, and the Investing page starts with a portfolio list (worth, profit and a mini chart for each investment). Pick one to open its chart and buy/sell controls.",
  "📈 Inversiones más ordenadas: una barra fina muestra tu nivel, tu dinero y tus inversiones, y la página de Inversiones empieza con una lista de cartera (valor, beneficio y un minigráfico de cada inversión). Elige una para abrir su gráfico y sus controles de compra y venta.");
// 🪙 live trading tabs and positions list
Object.assign(ES, { "Coin": "Moneda", "₿ BTC": "₿ BTC", "Ξ ETH": "Ξ ETH", "◎ SOL": "◎ SOL" });
rx(String.raw`Open positions \((\d+)\)`, "Posiciones abiertas ($1)");
hrx(String.raw`📋 Open positions \((\d+)\)( · ⏳ limit orders \((\d+)\))?`, (m, a, x, b) => `📋 Posiciones abiertas (${a})${x ? ` · ⏳ órdenes límite (${b})` : ""}`);
rx(String.raw`Your (BTC|ETH|SOL) positions are in the list at the top\.`, "Tus posiciones de $1 están en la lista de arriba.");
H("🪙 Live trading is easier: one coin at a time with tabs (price, 24h change and how many positions you have), a big Open button with its preview right under it, and all your open positions and limit orders together in one list at the top.",
  "🪙 El trading en vivo es más cómodo: una moneda a la vez con pestañas (precio, cambio en 24 h y cuántas posiciones tienes), un botón grande de Abrir con su vista previa justo debajo, y todas tus posiciones abiertas y órdenes límite juntas en una lista arriba.");
// 🔁 investing Buy | Sell
rx(String.raw`You put in (${NUM}) · (${NUM}) left`, "Inviertes $1 · te quedan $2");
rx(String.raw`You only have (${NUM})\.`, "Solo tienes $1.");
rx(String.raw`You get (${NUM}) \(no fee\)`, "Recibes $1 (sin comisión)");
H("🔁 Investing: each investment now has one <b>Buy | Sell</b> switch with a single amount row. In Sell mode the % buttons fill a share of what you hold, and a line tells you what you put in or get back.",
  "🔁 Inversiones: cada inversión tiene ahora un interruptor <b>Comprar | Vender</b> con una sola fila de cantidad. En modo Vender, los botones de % rellenan una parte de lo que tienes, y una línea te dice cuánto pones o recibes.");
rx(String.raw`Sold (${NUM}) of gold \(no fee\)\.`, "Has vendido $1 de oro (sin comisión).");
rx(String.raw`Next gold sale in ([\d:]+)`, "Próxima venta de oro en $1");
// 🚚 logistics compact rows
Object.assign(ES, { "Best": "Mejor", "Best per sec": "Mejor por segundo", "Send all on their best contract": "Enviar todos a su mejor contrato", "at the depot": "en el depósito", "in port": "en el puerto", "at the airport": "en el aeropuerto",
  "trucks waiting for a contract": "camiones esperando un contrato", "tankers waiting for a contract": "petroleros esperando un contrato", "planes waiting for a contract": "aviones esperando un contrato", "⭐ Best": "⭐ Mejor", "⭐ Best per sec": "⭐ Mejor por segundo", "🚀 Send": "🚀 Enviar", "⭐ Send all on their best contract": "⭐ Enviar todos a su mejor contrato", "EXPRESS": "EXPRÉS" });
rx(String.raw`Other offers \((\d+)\) ▸`, "Otras ofertas ($1) ▸");
rx(String.raw`(\d+) (trucks|tankers|planes) waiting for a contract`, (m, n, x) => `${n} ${{ trucks: "camiones", tankers: "petroleros", planes: "aviones" }[x]} esperando un contrato`);
rx(String.raw`(\S+ )?Sent (\d+) on their best contracts\.`, (m, e, n) => `${e || ""}${n} enviados a sus mejores contratos.`);
rx(String.raw`(${NUM}) left`, "Quedan $1");
H("🚚 Logistics is faster to run: every vehicle is one compact row, idle ones show their ⭐ best offer (most money per second) with a <b>Send</b> button, and <b>⭐ Send all</b> puts every waiting vehicle on its best contract at once. \"Other offers\" still opens all 4.",
  "🚚 La logística es más rápida: cada vehículo es una fila compacta, los que esperan muestran su ⭐ mejor oferta (más dinero por segundo) con un botón <b>Enviar</b>, y <b>⭐ Enviar todos</b> manda a cada vehículo libre a su mejor contrato de una vez. \"Otras ofertas\" sigue abriendo las 4.");
// 🌍 earth slim bar + fleet tabs
Object.assign(ES, { "Trucks": "Camiones", "Tankers": "Petroleros", "Planes": "Aviones", "locked": "bloqueado", "none yet": "ninguno todavía", "Waiting for a contract": "Esperando un contrato", "Broken down": "Averiado",
  "Contracts fulfilled": "Contratos cumplidos", "Delivered (all time)": "Entregado (total)" });
rx(String.raw`(\d+) on the road( · (\d+) waiting)?( · (\d+) broken)?`, (m, a, x, b, y, c) => `${a} en ruta${x ? ` · ${b} esperando` : ""}${y ? ` · ${c} averiados` : ""}`);
rx(String.raw`(Trucks|Tankers|Planes) on the road \/ owned`, (m, x) => `${{ Trucks: "Camiones", Tankers: "Petroleros", Planes: "Aviones" }[x]} en ruta / en propiedad`);
rx(String.raw`Logistics level · (max level|([\d.,]+) \/ ([\d.,]+) XP)`, (m, x, a, b) => `Nivel de logística · ${a ? `${a} / ${b} XP` : "nivel máximo"}`);
H("🌍 Earth logistics is tidier: one slim bar shows your level, money, vehicles on the road and contracts, and Trucks · Tankers · Planes tabs show one fleet at a time (with a <b>!</b> when vehicles wait or break down). The world map follows the tab you pick.",
  "🌍 La logística de la Tierra está más ordenada: una barra fina muestra tu nivel, tu dinero, los vehículos en ruta y los contratos, y las pestañas Camiones · Petroleros · Aviones muestran una flota a la vez (con un <b>!</b> cuando hay vehículos esperando o averiados). El mapa del mundo sigue la pestaña que elijas.");
hrx(String.raw`(\{i\}|<img[^>]*>)(${NUM}) · (\{i\}|<img[^>]*>)([\dhms: ]+) · <b>≈ (${NUM}) \/ sec<\/b>`, "$1$2 · $3$4 · <b>≈ $5 / s</b>");
Object.assign(ES, { "BROKEN DOWN": "AVERIADO", "This truck needs repairs before it can take new contracts.": "Este camión necesita reparaciones antes de aceptar contratos nuevos." });
// 🗺️ map size
Object.assign(ES, { "⤢ Full map": "⤢ Mapa completo", "⤡ Smaller map": "⤡ Mapa más pequeño", "How to read the map": "Cómo leer el mapa" });
H("🗺️ The world map is smaller by default (⤢ Full map makes it full width again), its help text moved into an ℹ️ button, and on phones it starts folded.",
  "🗺️ El mapa del mundo es más pequeño por defecto (⤢ Mapa completo lo vuelve a poner a todo el ancho), su texto de ayuda está ahora en un botón ℹ️, y en el móvil empieza plegado.");
// 🏆 achievements layout
Object.assign(ES, { "Almost there": "Casi lo tienes", "⭐ Almost there": "⭐ Casi lo tienes", "Fold ▴": "Plegar ▴" });
rx(String.raw`(\d+) \/ (\d+) · Show ▸`, "$1 / $2 · Ver ▸");
rx(String.raw`Unlocked (\d+\/\d+\/\d+)`, "Desbloqueado el $1");
H("🏆 Achievements are easier to browse: smaller cards (3 per row), finished categories fold into one line, and a new <b>⭐ Almost there</b> box shows the achievements you are closest to.",
  "🏆 Los logros son más fáciles de ver: tarjetas más pequeñas (3 por fila), las categorías terminadas se pliegan en una línea, y un nuevo recuadro <b>⭐ Casi lo tienes</b> muestra los logros que tienes más cerca.");
// 🎁 rewards layout
Object.assign(ES, { "Wearing now:": "Llevas ahora:", "Wearing now": "Llevas ahora", "🪙 Coin": "🪙 Moneda", "🃏 Cards": "🃏 Cartas", "🖼️ Background": "🖼️ Fondo", "Coin": "Moneda", "Cards": "Cartas", "Background": "Fondo", "Classic": "Clásica",
  "🎁 Collections": "🎁 Colecciones", "Collections": "Colecciones", "✅ Your collections": "✅ Tus colecciones", "Your collections": "Tus colecciones", "Still to unlock": "Por desbloquear", "closest first": "las más cercanas primero",
  "👕 Wear": "👕 Llevar", "Wear": "Llevar", "✓ Wearing · take off": "✓ Puesto · quitar", "Wearing · take off": "Puesto · quitar", "Nothing matches this filter.": "Nada coincide con este filtro." });
rx(String.raw`(\d+) \/ (\d+) collections unlocked`, "$1 / $2 colecciones desbloqueadas");
hrx(String.raw`🔒 Still to unlock <span>· closest first<\/span>`, "🔒 Por desbloquear <span>· las más cercanas primero</span>");
H("🎁 Rewards are easier to use: the page shows what you're wearing now, your unlocked collections come first with <b>👕 Wear</b> buttons, and locked collections are short rows sorted by how close you are (tap one to preview its items).",
  "🎁 Las recompensas son más cómodas: la página muestra lo que llevas ahora, tus colecciones desbloqueadas aparecen primero con botones <b>👕 Llevar</b>, y las bloqueadas son filas cortas ordenadas por lo cerca que estás (toca una para ver sus objetos).");
H("🗂️ Achievements: on big screens the categories are now a list in the left menu with a progress ring each; on phones they are one row you can swipe.",
  "🗂️ Logros: en pantallas grandes, las categorías son ahora una lista en el menú de la izquierda con un anillo de progreso cada una; en el móvil son una fila que puedes deslizar.");
// 🎰 casino slim bar in the lobby
Object.assign(ES, { "Cashback on lost bets": "Reembolso de apuestas perdidas", "Free bet chips: refill over time": "Fichas de apuesta gratis: se recargan con el tiempo", "All-time earnings": "Ganancias totales" });
Object.assign(ES, { "free chips ▾": "fichas gratis ▾", "free chips ▴": "fichas gratis ▴" });
rx(String.raw`All-time earnings · total bet (${NUM})`, "Ganancias totales · apostado en total $1");
H("🎰 The casino now matches the other pages: one slim bar (level, money, Hot Tables, cashback, all-time earnings and free chips) replaces the four big cards in the lobby and the Online casino. Tap the free chips to open their refill timers.",
  "🎰 El casino ya se parece a las demás páginas: una barra fina (nivel, dinero, mesas calientes, reembolso, ganancias totales y fichas gratis) sustituye a las cuatro tarjetas grandes en el vestíbulo y en el casino online. Toca las fichas gratis para ver sus temporizadores de recarga.");
rx(String.raw`in ([\d:]+)`, "en $1");
rx(String.raw`· ([\d:]+)`, "· $1");
// ⚖️ balance update (businesses, rent, ETF, GFC, Broker ETF cap, Science gate)
rx(String.raw`Income ×([\d.]+)`, (m, a) => `Ingresos ×${a.replace(".", ",")}`);
rx(String.raw`Income ×([\d.]+) · ×([\d.]+) at (\d+) owned`, (m, a, b, n) => `Ingresos ×${a.replace(".", ",")} · ×${b.replace(".", ",")} con ${n} en propiedad`);
rx(String.raw`(.*) · 🚀 ×2, \+0\.5 every 2 owned`, (m, a) => `${es(a)} · 🚀 ×2, +0,5 cada 2 en propiedad`);
rx(String.raw`(.*) · 🚀 ×2`, (m, a) => `${es(a)} · 🚀 ×2`);
rx(String.raw`Auto cash-out: \+(${NUM}), and (${NUM}) invested again\.`, "Retirada automática: +$1, y $2 invertidos de nuevo.");
rx(String.raw`Broker ETF hit (${NUM}): cashed out and bought back in with (${NUM})\.`, "El ETF del bróker llegó a $1: retirado y reinvertido con $2.");
rx(String.raw`At the (${NUM}) cap: it won't grow more\. Cash out to start again\.`, "En el tope de $1: no crecerá más. Retíralo para empezar de nuevo.");
Object.assign(ES, { "Auto cash-out at 10 gcoin, then invest 10,000,000 again": "Retirada automática a 10 gcoin, y volver a invertir 10.000.000" });
H("⚖️ Balance update: businesses matter for longer. 🚘 Car Salons earn <b>×2</b>. 🎰 Casinos and 🏨 Hotels earn <b>×2</b>, and <b>+0.5 more for every 2 you own</b> (2 owned ×2.5, 4 owned ×3 … 10 owned ×4.5).",
  "⚖️ Ajuste de equilibrio: los negocios importan durante más tiempo. Los 🚘 concesionarios ganan <b>×2</b>. Los 🎰 casinos y 🏨 hoteles ganan <b>×2</b>, y <b>+0,5 más por cada 2 que tengas</b> (con 2 ×2,5, con 4 ×3 … con 10 ×4,5).");
H("🏠 Real estate now pays <b>0.8% rent every 60 seconds</b> (was 1.2% every 45 seconds), about +48% an hour.",
  "🏠 Los inmuebles pagan ahora <b>un 0,8% de alquiler cada 60 segundos</b> (antes 1,2% cada 45 segundos), unos +48% por hora.");
H("📈 Stock market ETF: the small up move is now +1.2% (was +1.5%), about <b>+25% an hour</b> on average. It still swings a lot in the short term, so good timing can beat that.",
  "📈 ETF de bolsa: la subida pequeña es ahora +1,2% (antes +1,5%), unos <b>+25% por hora</b> de media. Sigue moviéndose mucho a corto plazo, así que con buen ojo puedes ganar más.");
H("🚚 Global Freight Co. shares rise about <b>+35% an hour</b> on average: ups and downs are now the same size (±1% per contract) with a small steady drift.",
  "🚚 Las acciones de Global Freight Co. suben unos <b>+35% por hora</b> de media: las subidas y bajadas son ahora del mismo tamaño (±1% por contrato) con una pequeña subida constante.");
H("💼 Broker ETF now grows up to <b>10 gcoin</b> at most. New <b>🔁 Auto cash-out</b>: at the cap it cashes out for you and invests 10,000,000 again.",
  "💼 El ETF del bróker crece ahora hasta <b>10 gcoin</b> como máximo. Nuevo <b>🔁 Retirada automática</b>: al llegar al tope lo retira por ti y vuelve a invertir 10.000.000.");
H("🔬 Science opens earlier: it now needs <b>Logistics 30, Investor 30 and Gambler 20</b> (was 50 / 50 / 25).",
  "🔬 La ciencia se abre antes: ahora pide <b>Logística 30, Inversor 30 y Jugador 20</b> (antes 50 / 50 / 25).");
H("🌌 Prestige resets no longer touch Space: friendships, goods, stardust, crafted items, research and contracts all stay. Ships in flight finish their trip, and friendships don't cool off while you have no ships.",
  "🌌 El prestigio ya no afecta al espacio: las amistades, los bienes, el polvo estelar, los objetos fabricados, la investigación y los contratos se mantienen. Las naves en vuelo terminan su viaje, y las amistades no se enfrían mientras no tengas naves.");
// 📰 patch note
H("🌌 New in 🚢 Logistics: <b>Space</b>! Logistics now has two pages, 🌍 Earth (everything you know) and 🌌 Space. Build the 🚀 Space Mission Center to get your first spaceship and open the star map.",
  "🌌 Novedad en 🚢 Logística: ¡<b>Espacio</b>! Logística tiene ahora dos páginas: 🌍 Tierra (todo lo que ya conoces) y 🌌 Espacio. Construye el 🚀 Centro de Misiones Espaciales para conseguir tu primera nave y abrir el mapa estelar.");
ES["👽 Send ships to explore unknown systems and meet 6 alien races. Each one has its own tastes: send them the gifts they ask for (money, ore, paintings, stardust and more) to grow your friendship from Contacted to Allies."] =
  "👽 Envía naves a explorar sistemas desconocidos y conoce a 6 razas alienígenas. Cada una tiene sus gustos: mándales los regalos que piden (dinero, mineral, cuadros, polvo estelar y más) para que vuestra amistad pase de Contactada a Aliada.";
ES["📦 Your ships come back with alien goods. Ships keep flying while the game is closed, and a prestige never resets your alien friends."] =
  "📦 Tus naves vuelven con bienes alienígenas. Las naves siguen volando con el juego cerrado, y un prestigio nunca reinicia a tus amigos alienígenas.";

/* 🛰️ satellite card */
Object.assign(ES, { "Satellite": "Satélite", "in orbit": "en órbita", "Max 1 · works on its own, no agent needed · permanent bonuses": "Máx. 1 · funciona solo, sin agente · bonificaciones permanentes",
  "Cargo plane contracts pay +5%": "Los contratos de avión de carga pagan un +5 %", "Tanker contracts take 10% less time": "Los contratos de petrolero tardan un 10 % menos",
  "Broken trucks repair themselves for free after 5 seconds": "Los camiones averiados se reparan solos y gratis a los 5 segundos" });
rx(String.raw`Space missions fail 5% less often \((\d+)% instead of (\d+)%\)`, "Las misiones espaciales fallan un 5 % menos ($1 % en vez de $2 %)");
rx(String.raw`Launch (.+)`, "Lanzar $1");

/* ===================== generic fallbacks (keep these last) ===================== */
// a message made of several sentences: each sentence on its own ("You lost 1000. Cashback +99.")
ES_RX.push([/^(.+?[.!?)])\s+(\S.*)$/s, (s) => {
  const parts = s.split(/(?<=[.!?)])\s+(?=\S)/);
  if (parts.length < 2) return null;
  const out = [];
  for (const p of parts) { const x = esq(p); if (x == null) return null; out.push(x); }
  return out.join(" ");
}]);
// markup with short pieces of text ("✖ Release<small>all cards</small>", "{i}All <span>26/182</span>"): each piece on its own
ES_HTML_RX.push([/^[\s\S]*$/, (key) => {
  const bits = key.split(/(<[^>]+>|\{i\})/);
  let any = false;
  for (let i = 0; i < bits.length; i += 2) {
    if (!LETTER.test(bits[i])) continue;
    const x = esq(bits[i]); if (x == null) return null;
    bits[i] = x; any = true;
  }
  return any ? bits.join("") : null;
}]);


I18N_READY = true;
i18nApply(document.body);
document.title = t(document.title);
