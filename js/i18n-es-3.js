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
  "Saving": "Guardado", "The game saves automatically in your browser. Sign in with Google (⚙️ Settings → Account) to keep a ☁️ cloud copy and play on other devices. In ⚙️ Settings you can also load an old progress file or reset the game.":
    "El juego se guarda automáticamente en tu navegador. Inicia sesión con Google (⚙️ Ajustes → Cuenta) para tener una copia en la ☁️ nube y jugar en otros dispositivos. En ⚙️ Ajustes también puedes cargar un archivo de progreso antiguo o reiniciar la partida.",
  "Tips and guided start": "Consejos e inicio guiado",
  "New players get a short guided start (click the coin, buy a business, hire staff). After that, a small tip appears the first time you meet something new, with a link to the matching Wiki page. ⚙️ Settings: turn tips on/off, show all tips again, or replay the guided start.":
    "Los jugadores nuevos tienen un breve inicio guiado (haz clic en la moneda, compra un negocio, contrata personal). Después aparece un pequeño consejo la primera vez que encuentras algo nuevo, con un enlace a la página correspondiente de la Wiki. ⚙️ Ajustes: activa o desactiva los consejos, vuelve a ver todos o repite el inicio guiado.",
  "Background and offline": "En segundo plano y sin conexión",
  "Art Gallery paintings are stored separately in the browser so a big collection never fills up the save; a downloaded backup includes them. If the browser ever refuses to save, a red warning appears at the bottom of the screen.":
    "Los cuadros de la Galería de arte se guardan aparte en el navegador para que una colección grande nunca llene la partida guardada; la copia de seguridad descargada los incluye. Si el navegador se niega a guardar, aparece un aviso rojo en la parte inferior de la pantalla.",
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
  "The 💰 Income tab has three pages: 🏢 Businesses, ⭐ Special and 🔬 Science. Science unlocks at Logistics level 50, Investor level 50 and Gambler level 25.":
    "La pestaña 💰 Ingresos tiene tres páginas: 🏢 Negocios, ⭐ Especiales y 🔬 Ciencia. Ciencia se desbloquea con nivel de logística 50, nivel de inversor 50 y nivel de jugador 25.",
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
H("A shipping company that lives on <b>your logistics deliveries</b>. Every 10 seconds the share price moves: it compares the contracts your trucks, tankers and planes delivered in the <b>last 20 seconds</b> with the 20 seconds before. More deliveries than before: the price jumps up (+1.1% for every extra contract). Fewer: it drops (−0.9% for every missing one). The same number: a small move around +0.12%. A little random noise is added to every move (±0.5%), and one move is at most +8% / −6%. Ups are a bit bigger than downs, so over time the price rises, and faster the more you deliver. Min. 1,000. Selling has the same fee as the ETF cash-out fee. The price doesn't move while the game is closed.",
  "Una naviera que vive de <b>tus entregas logísticas</b>. Cada 10 segundos se mueve el precio de la acción: compara los contratos que tus camiones, petroleros y aviones han entregado en los <b>últimos 20 segundos</b> con los 20 segundos anteriores. Más entregas que antes: el precio sube (+1,1% por cada contrato de más). Menos: baja (−0,9% por cada uno que falte). El mismo número: un pequeño movimiento de alrededor de +0,12%. A cada movimiento se le suma un poco de azar (±0,5%), y un movimiento es como mucho de +8% / −6%. Las subidas son algo mayores que las bajadas, así que con el tiempo el precio sube, y más rápido cuanto más entregas. Mín. 1.000. Vender tiene la misma comisión que la retirada del ETF. El precio no se mueve con el juego cerrado.");

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

H("⚠️ <b>Your progress is not being saved</b>: this browser's storage for the game is full. Sign in (⚙️ Settings → Account) to keep it in the ☁️ cloud. <button>OK</button>",
  "⚠️ <b>Tu progreso no se está guardando</b>: el almacenamiento del navegador para el juego está lleno. Inicia sesión (⚙️ Ajustes → Cuenta) para guardarlo en la ☁️ nube. <button>OK</button>");

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
  "Fly through three sectors of space, shoot everything that moves and defeat the boss at the end of each level. Lose all your lives and the level starts over from the beginning.":
    "Vuela por tres sectores del espacio, dispara a todo lo que se mueva y derrota al jefe al final de cada nivel. Si pierdes todas tus vidas, el nivel empieza de nuevo desde el principio.",
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
  "A side-scrolling space shooter. It opens when you build the 🚀 Space Mission Center (🔬 Science) and stays open for good, even after a prestige. Fly your ship through 4 levels of enemy waves; each level ends with a boss (level 4 has two). Beating a level opens the next one. Levels are free to play, but if you lose all your lives, the level starts over from the beginning.":
    "Un matamarcianos de desplazamiento lateral. Se abre al construir el 🚀 Centro de misiones espaciales (🔬 Ciencia) y queda abierto para siempre, incluso tras un prestigio. Pilota tu nave por 4 niveles de oleadas enemigas; cada nivel termina con un jefe (el nivel 4 tiene dos). Superar un nivel abre el siguiente. Jugar los niveles es gratis, pero si pierdes todas tus vidas, el nivel empieza de nuevo desde el principio.",
  "Fly a spaceship through 4 levels of enemy waves and defeat the bosses waiting at the end.": "Pilota una nave por 4 niveles de oleadas enemigas y derrota a los jefes que esperan al final.",
  "Show on the Income page": "Mostrar en la página de Ingresos", "Name": "Nombre", "🐾 Pet": "🐾 Mascota", "The pet": "La mascota",
  "Best friends": "Mejores amigos", "Pet your pet 100 times": "Acaricia a tu mascota 100 veces", "Paw power": "Poder de patitas", "Let your pet tap the coin 10,000 times": "Deja que tu mascota pulse la moneda 10.000 veces",
  "Skip": "Saltar", "Pirate chest": "Cofre pirata", "Beat Admiral Dreadmaw first": "Derrota antes al Almirante Fauces Negras", "Buy another": "Comprar otro", "Close": "Cerrar",
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
rx(String.raw`Level (\d): (Scrap Belt|Hive Nebula|Crimson Fortress|Pirate's Cove)( · (\d+:\d\d))?`, (m, n, l, c, tm) => `Nivel ${n}: ${shEsName(l)}${tm ? " · " + tm : ""}`);
rx(String.raw`(\d): (Scrap Belt|Hive Nebula|Crimson Fortress|Pirate's Cove)`, (m, n, l) => `${n}: ${shEsName(l)}`);
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
hrx(String.raw`🏴‍☠️ Every clear: a <b>pirate loot box<\/b> \(40–180 min of income( or a rare pet)?\) \+ <span>✨<\/span> (\d+)(?:<br>✅ Cleared · Best time (\d+:\d\d))?(?:(?: · |<br>)⭐ Best score ([\d.,]+))?`,
  (m, pet, d, tm, sc) => `🏴‍☠️ Cada victoria: un <b>cofre del botín pirata</b> (40–180 min de ingresos${pet ? " o una mascota rara" : ""}) + <span>✨</span> ${d}${tm ? `<br>✅ Superado · Mejor tiempo ${tm}` : ""}${sc ? `${tm ? " · " : "<br>"}⭐ Mejor puntuación ${sc}` : ""}`);
H("<b>You found a pet!</b><br>Your new friend now lives on your 💰 Income page. It drinks the ⚡ energy drink and taps the coin for you!", "<b>¡Has encontrado una mascota!</b><br>Tu nuevo amigo ya vive en tu página de 💰 Ingresos. ¡Se bebe la ⚡ bebida energética y pulsa la moneda por ti!");
H("🏴‍☠️ <b>Pirate loot box</b> (level 4, every clear): after Captain Cutlass, the waves continue for about 2 more minutes before Admiral Dreadmaw. Beat him to open a loot box (after your first win you can also buy one in the hangar for ✨ 10,000 stardust):",
  "🏴‍☠️ <b>Cofre del botín pirata</b> (nivel 4, en cada victoria): tras el Capitán Sable, las oleadas siguen unos 2 minutos más antes del Almirante Fauces Negras. Derrótalo para abrir un cofre del botín (tras tu primera victoria también puedes comprar uno en el hangar por ✨ 10.000 de polvo estelar):");
rx(String.raw`Loot box \+ ✨ (\d+)`, "Cofre del botín + ✨ $1");
rx(String.raw`(\d+)–(\d+) min of income`, "$1–$2 min de ingresos");
rx(String.raw`(\d+) min of income`, "$1 min de ingresos");
hrx(String.raw`🏴‍☠️ Buy another · <span>✨<\/span> ([\d.,]+)`, "🏴‍☠️ Comprar otro · <span>✨</span> $1");
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
