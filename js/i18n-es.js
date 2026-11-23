/* =====================================================================
   🌐 ESPAÑOL (España): translations of the game's English text. Used only when the language is Español.
   ES: exact text → text · ES_RX: text with numbers or names (regex → replacement)
   ES_HTML: a sentence with inline markup (tags without attributes, icons as {i}) → the same in Spanish
   ES_HTML_RX: the same with numbers or names.
   Session 1: menus, buttons and the core screens (main menu, settings, top bar, Income, tax, tab headers).
   ===================================================================== */
// a piece of text in Spanish (or as it is, if it has no translation yet)
const es = (s) => (s == null ? s : trText(String(s)) ?? s);
const NUM = String.raw`[−+-]?[\d.,]+(?:\s?[sgb]coin)?`;   // an amount as the game shows it ("2,5 scoin", "1.000")
const rx = (src, to) => ES_RX.push([new RegExp("^" + src + "$"), to]);
const hrx = (src, to) => ES_HTML_RX.push([new RegExp("^" + src + "$"), to]);
const plural = (n, one, many) => (String(n).replace(/\D/g, "") === "1" ? one : many);
const MONTHS = { January: "enero", February: "febrero", March: "marzo", April: "abril", May: "mayo", June: "junio", July: "julio",
  August: "agosto", September: "septiembre", October: "octubre", November: "noviembre", December: "diciembre" };
const esDate = (d) => d.replace(/^(\d+) (\w+) (\d+)$/, (m, day, mon, y) => `${day} de ${MONTHS[mon] || mon} de ${y}`);

Object.assign(ES, {
  // ----- loading, main menu, tabs -----
  "Empire of Coins": "Empire of Coins",
  "Loading": "Cargando", "Loading your empire…": "Cargando tu imperio…",
  "Play": "Jugar", "Settings": "Ajustes", "About": "Acerca de", "Donate": "Donar", "Coming soon": "Próximamente",
  "Donate (coming soon)": "Donar (próximamente)", "Main menu": "Menú principal",
  "Income": "Ingresos", "Casino": "Casino", "Investing": "Inversiones", "Logistics": "Logística", "Mini-games": "Minijuegos",
  "Achievements": "Logros", "Shop": "Tienda", "Wiki": "Wiki",
  "Prestige": "Prestigio", "Reset the game for a permanent Legacy bonus": "Reinicia la partida a cambio de una bonificación de Legado permanente",
  "Your prestige level and Legacy bonuses": "Tu nivel de prestigio y tus bonificaciones de Legado",
  // ----- settings -----
  "Save game": "Guardar partida", "Download progress file": "Descargar archivo de progreso", "Load progress file": "Cargar archivo de progreso",
  "Show all tips again": "Volver a mostrar todos los consejos", "Replay the guided start": "Repetir la introducción guiada",
  "Reset game": "Reiniciar partida", "Game": "Partida", "Display": "Pantalla", "Help": "Ayuda", "Language": "Idioma",
  "Background brightness": "Brillo del fondo", "Show tips": "Mostrar consejos", "Report a bug": "Informar de un error", "Close": "Cerrar",
  "The game saves itself every 30 seconds and after every action.": "La partida se guarda sola cada 30 segundos y después de cada acción.",
  "Tips are on.": "Consejos activados.", "Tips are off.": "Consejos desactivados.", "All tips will show again.": "Todos los consejos volverán a aparecer.",
  "Game saved!": "¡Partida guardada!", "Progress file downloaded.": "Archivo de progreso descargado.",
  "Could not save: browser storage is full.": "No se ha podido guardar: el almacenamiento del navegador está lleno.",
  "Reset game?": "¿Reiniciar la partida?", "Your ☁️ cloud save is not deleted: sign in again to get it back.": "Tu partida en la ☁️ nube no se borra: vuelve a iniciar sesión para recuperarla.",
  "Cancel": "Cancelar", "Yes, reset everything": "Sí, reiniciar todo", "OK": "Vale",
  // ----- about -----
  "About the game": "Acerca del juego", "How to play": "Cómo se juega", "Patch notes": "Notas de la versión",
  "The game saves itself in this browser. Sign in with Google (⚙️ Settings) to keep a ☁️ cloud copy. The 📖 Wiki in the game explains every feature.":
    "La partida se guarda en este navegador. Inicia sesión con Google (⚙️ Ajustes) para tener una copia en la ☁️ nube. La 📖 Wiki del juego explica todas las funciones.",
  // ----- top bar: coins, boosters, counter -----
  "Currency info": "Información sobre las monedas", "Coins": "Monedas", "How the coins work": "Cómo funcionan las monedas", "the basic coin": "la moneda básica",
  "= 1,000,000 bcoin": "= 1.000.000 bcoin", "= 1,000,000 scoin": "= 1.000.000 scoin", "= 1,000,000,000,000 bcoin": "= 1.000.000.000.000 bcoin",
  "Money is always shown in the biggest coin that fits, so 3,400,000 bcoin shows as 3.4 scoin. Hover over your money to see the exact amount in bcoin.":
    "El dinero se muestra siempre en la moneda más grande que cabe: 3.400.000 bcoin aparecen como 3,4 scoin. Pasa el ratón por encima de tu dinero para ver la cantidad exacta en bcoin.",
  "Energy drink": "Bebida energética", "Magical pill": "Píldora mágica", "Political influence": "Influencia política",
  "Energy drink: 5x click value for 30 seconds, costs 50": "Bebida energética: clics ×5 durante 30 segundos, cuesta 50",
  "Magical pill: each click gives 10% of your income per second for 30 seconds, costs 2000": "Píldora mágica: durante 30 segundos cada clic da el 10% de tus ingresos por segundo, cuesta 2000",
  "Political influence: doubles income from all businesses for 2 minutes, costs 250,000": "Influencia política: duplica los ingresos de todos los negocios durante 2 minutos, cuesta 250.000",
  "After it wears off: 2-minute cooldown.": "Cuando se acaba: 2 minutos de espera.",
  "After it wears off: 5-minute cooldown. Works together with the energy drink (×5 on the whole click).": "Cuando se acaba: 5 minutos de espera. Se combina con la bebida energética (×5 sobre todo el clic).",
  "After it wears off: 30-minute cooldown.": "Cuando se acaba: 30 minutos de espera.",
  "Click the coin to earn money": "Haz clic en la moneda para ganar dinero",
  // ----- Income: pages and businesses -----
  "Businesses": "Negocios", "Special": "Especiales", "Science": "Ciencia",
  "Hot Dog Stand": "Puesto de perritos", "Car Wash": "Lavadero de coches", "Car Repair Shop": "Taller mecánico", "Car Salon": "Concesionario",
  "Hotel": "Hotel", "Brokerage Firm": "Agencia de valores",
  "Each Car Salon gives all car washes and repair shops +10% income": "Cada concesionario da +10% de ingresos a todos los lavaderos y talleres",
  "Unlocks the Broker ETF in the 📈 Investing tab: no fee and bigger wins": "Desbloquea el ETF de bróker en la pestaña 📈 Inversiones: sin comisión y con más ganancias",
  "Unlocks at Investor level 10 (invest in the 📈 Investing tab)": "Se desbloquea en el nivel de inversor 10 (invierte en la pestaña 📈 Inversiones)",
  "More businesses coming soon...": "Pronto habrá más negocios...",
  "Show all": "Mostrar todo", "Minimize all": "Minimizar todo", "Show": "Mostrar", "Hide": "Ocultar", "Minimize": "Minimizar",
  "Show workers": "Mostrar trabajadores", "Hide workers": "Ocultar trabajadores",
  "Hire your accountant": "Contrata a tu contable", "Hire your HR manager": "Contrata a tu responsable de RR. HH.",
  "Accountant": "Contable", "HR": "RR. HH.",
  "No workers yet. Hire someone to start earning!": "Aún no hay trabajadores. ¡Contrata a alguien para empezar a ganar!",
  "Fire": "Despedir", "Choose who to hire (free)": "Elige a quién contratar (gratis)", "The company is full.": "La empresa está completa.",
  "Buy": "Comprar", "Sell": "Vender",
  // accountants
  "Good with numbers": "Bueno con los números", "Company profit +15%": "Beneficio de la empresa +15%",
  "Criminal": "Delincuente", "1 in 20 chance each second to double company income": "1 entre 20 cada segundo de duplicar los ingresos de la empresa",
  "Embezzler": "Malversador", "Company income +30%, but a 1 in 100 chance each second he steals 10% of the last minute's earnings":
    "Ingresos de la empresa +30%, pero cada segundo hay 1 entre 100 de que robe el 10% de lo ganado en el último minuto",
  "Gambler": "Jugador", "Every 10 seconds he bets that second's income: 50/50 to double it or lose it":
    "Cada 10 segundos apuesta los ingresos de ese segundo: al 50% los duplica o los pierde",
  // HR
  "Motivator": "Motivador", "All workers earn +15%": "Todos los trabajadores ganan +15%",
  "Friendship expert": "Experto en compañerismo", "Candidates are twice as likely to have the Friendship trait": "Los candidatos tienen el doble de probabilidad de tener el rasgo Compañerismo",
  "Talent acquisition specialist": "Especialista en captación de talento",
  "Hiring workers and refreshing candidates costs 30% less. Company profit +5% when every worker spot is filled":
    "Contratar y renovar candidatos cuesta un 30% menos. Beneficio de la empresa +5% con todas las plazas ocupadas",
  "Schedule specialist": "Especialista en horarios",
  "Night owls and morning people earn ×3 (instead of ×2) during their double-income 10 seconds":
    "Nocturnos y madrugadores ganan ×3 (en vez de ×2) durante sus 10 segundos de ingresos dobles",
  // worker traits
  "Friendship": "Compañerismo", "+20% for every Friendship worker in the company": "+20% por cada trabajador con Compañerismo en la empresa",
  "Leader": "Líder", "Doubles the income of one random co-worker each second": "Cada segundo duplica los ingresos de un compañero al azar",
  "Lazy": "Vago", "30% chance to earn nothing each second": "Cada segundo, 30% de probabilidad de no ganar nada",
  "Bully": "Matón", "Earns double, but one random co-worker earns nothing": "Gana el doble, pero un compañero al azar no gana nada",
  "Night owl": "Nocturno", "Morning person": "Madrugador", "10 seconds double income, then 10 seconds half income": "10 segundos de ingresos dobles y luego 10 segundos a la mitad",
  "The Legend": "La Leyenda", "Every worker in the company earns +1 per second (stacks)": "Cada trabajador de la empresa gana +1 por segundo (se acumula)",
  "Hard worker": "Currante", "Earns +50%, but sometimes burns out for 10 seconds": "Gana +50%, pero a veces se quema durante 10 segundos",
  "Mentor": "Mentor", "The lowest-earning co-worker earns double": "El compañero que menos gana gana el doble",
  "Copycat": "Imitador", "Copies the trait of a random co-worker every 20 seconds": "Cada 20 segundos copia el rasgo de un compañero al azar",
  "Every 10 seconds: 50/50 to earn double or nothing for the next 10 seconds": "Cada 10 segundos: al 50% gana el doble o nada durante los 10 segundos siguientes",
  "Mechanic": "Mecánico", "+10% income for every car wash you own": "+10% de ingresos por cada lavadero que tengas",
  "Overcharger": "Clavador", "+80% income, but a 1 in 50 chance each second of a complaint: nothing for 15 seconds":
    "+80% de ingresos, pero cada segundo hay 1 entre 50 de una queja: nada durante 15 segundos",
  "Apprentice": "Aprendiz", "Starts at 50% income, +5% every minute, up to 200%": "Empieza al 50% de ingresos, +5% cada minuto, hasta el 200%",
  "Promoter": "Promotor", "Every car wash earns +2% (stacks for each Promoter)": "Cada lavadero gana +2% (se acumula por cada promotor)",
  "Concierge": "Conserje", "Doubles the income of the 2 best-paid co-workers (max 5 per hotel)": "Duplica los ingresos de los 2 compañeros mejor pagados (máx. 5 por hotel)",
  "VIP guest magnet": "Imán de clientes VIP", "Each second a 1 in 30 chance of a ×20 tip": "Cada segundo, 1 entre 30 de una propina ×20",
  "Cleaner": "Limpiador", "Stops one Lazy worker from slacking each second": "Cada segundo evita que un trabajador Vago se escaquee",
  "Master gambler": "Maestro del juego", "Every 10 seconds: 70% chance to earn double, 30% nothing, for the next 10 seconds":
    "Cada 10 segundos: 70% de ganar el doble y 30% de nada durante los 10 segundos siguientes",
  "Quick hands": "Manos rápidas", "Earns double every 5th second": "Gana el doble cada 5 segundos",
  "Scammer": "Estafador", "Each second: 1 in 5 chance of triple income, 1 in 10 chance of losing three times its income":
    "Cada segundo: 1 entre 5 de ingresos triples y 1 entre 10 de perder el triple de sus ingresos",
  "No trait": "Sin rasgo", "Just does the job": "Simplemente hace su trabajo",
  // worker status
  "quick!": "¡rápido!", "complaint": "queja", "slacking": "escaqueándose", "caught!": "¡pillado!", "off duty": "fuera de servicio",
  "scammed!": "¡estafa!", "burnt out": "quemado", "VIP tip!": "¡propina VIP!", "kept busy": "ocupado", "losing": "perdiendo", "winning": "ganando",
  "awake": "despierto", "sleepy": "con sueño", "boosted": "potenciado", "bullied": "acosado", "served": "atendido", "mentored": "tutelado",
  // flashes
  "Criminal accounting: income doubled!": "Contabilidad creativa: ¡ingresos duplicados!",
  "The gamble paid off: income doubled!": "La apuesta ha salido bien: ¡ingresos duplicados!",
  // ----- Income: special businesses -----
  "Special businesses": "Negocios especiales", "Warehouse": "Almacén",
  "+2% profit on every truck contract · no workers, HR manager or accountant": "+2% de beneficio en cada contrato de camión · sin trabajadores, RR. HH. ni contable",
  "Law Firm": "Bufete de abogados",
  "No workers, HR or accountant: hire up to 10 attorneys instead (slots cost 50k, then 100k, 150k…)": "Sin trabajadores, RR. HH. ni contable: en su lugar contrata hasta 10 abogados (las plazas cuestan 50k, luego 100k, 150k…)",
  "8 kinds of lawyers: casino cashback, tax refunds, extra worker slots, steady income and more": "8 tipos de abogados: reembolso en el casino, devolución de impuestos, plazas extra de trabajadores, ingresos fijos y más",
  "No attorneys yet.": "Aún no hay abogados.", "Choose your new attorney": "Elige a tu nuevo abogado", "you'll choose 1 of 3 lawyers": "elegirás 1 de 3 abogados",
  "Fire this attorney and choose a new one from 3 offers": "Despide a este abogado y elige uno nuevo entre 3 opciones",
  "Criminal defense lawyer": "Abogado penalista", "+5% cashback on lost casino bets": "+5% de reembolso en las apuestas perdidas del casino",
  "Immigration lawyer": "Abogado de extranjería", "Gold mines and car washes earn +25%": "Las minas de oro y los lavaderos ganan +25%",
  "Divorce & family lawyer": "Abogado de familia", "Earns 90–100 per second (changes every second)": "Gana 90–100 por segundo (cambia cada segundo)",
  "Employment lawyer": "Abogado laboralista", "+1 worker slot in every business (only one allowed)": "+1 plaza de trabajador en cada negocio (solo se permite uno)",
  "Real estate lawyer": "Abogado inmobiliario", "Real estate sales pay +2% more": "Las ventas de inmuebles pagan un 2% más",
  "Business lawyer": "Abogado mercantil", "+10% income for one random business, changes every 10 seconds": "+10% de ingresos para un negocio al azar, cambia cada 10 segundos",
  "Debt & financial lawyer": "Abogado financiero", "Get 25% of every tax payment back (up to 100% with 4 of them)": "Recupera el 25% de cada pago de impuestos (hasta el 100% con 4 de ellos)",
  "Civil litigation lawyer": "Abogado civilista", "Earns 70–100 per second (changes every second)": "Gana 70–100 por segundo (cambia cada segundo)",
  "Real Estate Agency": "Agencia inmobiliaria", "No agents yet.": "Aún no hay agentes.",
  "+2% when you sell real estate · each agent earns 0, 5, 10 or 15 at random every second": "+2% al vender inmuebles · cada agente gana al azar 0, 5, 10 o 15 cada segundo",
  "+2% bonus every time you sell a property · new agents at 100k, 300k, 600k, 1M… real estate profit (each step 100k bigger) · each agent earns 0, 5, 10 or 15 at random every second (7.5 / sec on average)":
    "+2% extra cada vez que vendes un inmueble · nuevos agentes a los 100k, 300k, 600k, 1M… de beneficio inmobiliario (cada paso 100k mayor) · cada agente gana al azar 0, 5, 10 o 15 cada segundo (7,5 / s de media)",
  "Logistics Center": "Centro logístico", "Choose the first upgrade": "Elige la primera mejora",
  "Cheaper agents": "Agentes más baratos", "Logistics agent fee drops from 2% to 1%": "La comisión del agente logístico baja del 2% al 1%",
  "Smart agents": "Agentes listos", "Agents pick the most profitable contract (best pay per second) instead of a random one": "Los agentes eligen el contrato más rentable (el que más paga por segundo) en vez de uno al azar",
  "Fast agents": "Agentes rápidos", "Agents pick a new contract after 3 seconds instead of 5": "Los agentes eligen un contrato nuevo a los 3 segundos en vez de a los 5",
  "Amusement Park": "Parque de atracciones", "Amusement Parks": "Parques de atracciones",
  "Each park pairs with one of your hotels and earns 50% of its income": "Cada parque se une a uno de tus hoteles y gana el 50% de sus ingresos",
  "Unlocks when you buy a hotel: one park slot for every hotel": "Se desbloquea al comprar un hotel: una plaza de parque por cada hotel",
  "Gold Mine": "Mina de oro", "Recruitment Agency": "Agencia de contratación",
  "No empty hotels or casinos right now.": "Ahora mismo no hay hoteles ni casinos vacíos.",
  "Staffing plan": "Plan de plantilla", "Hire staff": "Contratar personal", "Apply to all": "Aplicar a todos",
  "Trading Port": "Puerto comercial", "Unlocks when you own an oil tanker (see 🚢 Logistics)": "Se desbloquea cuando tengas un petrolero (ver 🚢 Logística)",
  "Art Gallery": "Galería de arte",
  // ----- Science (locked page) -----
  "Build a University, make Nobel Prize-winning breakthroughs and launch space missions.": "Construye una universidad, consigue avances dignos del Nobel y lanza misiones espaciales.",
  "Unlocks when you reach": "Se desbloquea al alcanzar",
  "Logistics level": "Nivel de logística", "Investor level": "Nivel de inversor", "Gambler level": "Nivel de jugador",
  // ----- tax -----
  "Click to pay": "Haz clic para pagar", "Tax payment due": "Pago de impuestos pendiente", "The game is paused until you pay.": "La partida está en pausa hasta que pagues.",
  "Final tax warning": "Último aviso de Hacienda", "Investment": "Inversión", "Value": "Valor", "You get": "Recibes",
  "The game is paused until you choose. Live trading positions are not touched.": "La partida está en pausa hasta que elijas. Las posiciones de trading en vivo no se tocan.",
  "Don't sell (game over)": "No vender (fin de la partida)", "Game over": "Fin de la partida", "Start over": "Empezar de nuevo",
  "The tax office took everything. Time to start again from zero.": "Hacienda se lo ha llevado todo. Toca empezar de cero.",
  // ----- alerts -----
  "Achievement unlocked!": "¡Logro desbloqueado!", "Click to close": "Haz clic para cerrar",
  // ----- guided start -----
  "Next": "Siguiente", "Finish": "Terminar", "Skip tutorial": "Saltar tutorial", "Guided start": "Introducción guiada",
  "Then click the coin as fast as you can!": "¡Y ahora haz clic en la moneda lo más rápido que puedas!",
  "Keep clicking the coin until you have 100.": "Sigue haciendo clic en la moneda hasta tener 100.",
  // ----- prestige -----
  "Tycoon's Legacy": "Legado del magnate", "Global Empire": "Imperio global", "VIP Coins": "Monedas VIP", "Not yet": "Todavía no",
  "Income +25% for good": "Ingresos +25% para siempre", "Free chips: every 20 min → every 10 min": "Fichas gratis: cada 20 min → cada 10 min",
  "Always kept: achievements, levels, cosmetics, statistics and your 🖼️ Art Gallery (unlock, slots and paintings). After every prestige: 🛡️ no tax inspections for the first 10 minutes.":
    "Siempre se conservan: logros, niveles, cosméticos, estadísticas y tu 🖼️ Galería de arte (desbloqueo, huecos y cuadros). Después de cada prestigio: 🛡️ sin inspecciones de Hacienda durante los primeros 10 minutos.",
  "+25% income from businesses, special businesses and clicks, forever. From this reset on, every reset keeps your 🔬 Science buildings (not the satellite).":
    "+25% de ingresos de negocios, negocios especiales y clics, para siempre. A partir de este reinicio, todos los reinicios conservan tus edificios de 🔬 Ciencia (no el satélite).",
  "Keep all your trucks, oil tankers and cargo planes, plus warehouses, Trading Port and Logistics Center, on this and every future reset (not the 🛰️ satellite).":
    "Conserva todos tus camiones, petroleros y aviones de carga, además de almacenes, puerto comercial y centro logístico, en este reinicio y en todos los siguientes (no el 🛰️ satélite).",
  "A free 500 scoin bet chip every 10 minutes for the Super high roller tables, and all your other free bet chips come twice as fast. You can hold up to 200 chips of 500 scoin instead of 100. What they win goes to your casino chips.":
    "Una ficha de apuesta gratis de 500 scoin cada 10 minutos para las mesas de súper altas apuestas, y todas tus demás fichas gratis llegan el doble de rápido. Puedes tener hasta 200 fichas de 500 scoin en vez de 100. Lo que ganen va a tus fichas de casino.",
  // ----- headers and buttons of the other tabs -----
  "Your money": "Tu dinero", "Casino chips": "Fichas de casino", "VIP coins": "Monedas VIP",
  "Move money into the casino to play. You can add more at any time.": "Pasa dinero al casino para jugar. Puedes añadir más cuando quieras.",
  "Add to casino": "Añadir al casino", "Cash out all chips": "Canjear todas las fichas", "All levels": "Todos los niveles",
  "All-time earnings": "Ganancias totales", "Free bet chips": "Fichas de apuesta gratis", "Choose a game": "Elige un juego",
  "Hover a chip for details · use them at Roulette, Blackjack, Baccarat, Video Poker and Hold'em (not Plinko, Sky Climb or Gene Cascade)":
    "Pasa el ratón por una ficha para ver los detalles · úsalas en ruleta, blackjack, baccarat, videopóquer y Hold'em (no en Plinko, Sky Climb ni Gene Cascade)",
  "Roulette games": "Ruleta", "Card games": "Juegos de cartas", "Slot games": "Tragaperras", "More games coming soon...": "Pronto habrá más juegos...",
  "Plinko": "Plinko", "Sky Climb": "Sky Climb", "HOT": "CALIENTE",
  "Roulette": "Ruleta", "Blackjack": "Blackjack", "Baccarat": "Baccarat", "Video Poker": "Videopóquer", "Ultimate Texas Hold'em": "Ultimate Texas Hold'em", "Gene Cascade": "Gene Cascade",
  "Hot Tables cooling down": "Mesas calientes en pausa",
  "Real estate": "Inmuebles", "Gold": "Oro", "ETF": "ETF", "Stock market ETF": "ETF de bolsa", "Broker ETF": "ETF de bróker", "Live trading": "Trading en vivo",
  "Invest": "Invertir", "Cash out": "Retirar", "Cash out all": "Retirarlo todo", "Cash out all (no fee)": "Retirarlo todo (sin comisión)",
  "Buy property": "Comprar inmueble", "Buy gold": "Comprar oro", "Your ETF": "Tu ETF", "Your gold": "Tu oro", "Your Broker ETF": "Tu ETF de bróker",
  "Invested": "Invertido", "Profit / loss": "Ganancia / pérdida", "Last move": "Último movimiento", "Next move in": "Próximo movimiento en",
  "All-time profits": "Beneficios totales", "You don't own any property yet.": "Todavía no tienes ningún inmueble.",
  "Live crypto market": "Mercado cripto en vivo", "Live price": "Precio en vivo", "Open positions": "Posiciones abiertas", "Worth": "Valor",
  "Open profit / loss": "Ganancia / pérdida abierta", "Line": "Línea", "Candles": "Velas", "Positions": "Posiciones", "Fee": "Comisión",
  "Connecting…": "Conectando…", "Connecting… trading paused": "Conectando… trading en pausa",
  "The chart appears as live prices come in…": "El gráfico aparece a medida que llegan los precios en vivo…", "Waiting for 1-minute candles…": "Esperando velas de 1 minuto…",
  "One slot: cash out to invest again.": "Una sola plaza: retira para volver a invertir.",
  "Trucks": "Camiones", "Tankers": "Petroleros", "Planes": "Aviones", "Delivered (all time)": "Entregado (total)", "Contracts fulfilled": "Contratos cumplidos",
  "World map": "Mapa mundial", "Semi-trucks": "Camiones", "Crude oil tankers": "Petroleros de crudo", "Cargo planes": "Aviones de carga",
  "Logistics agent": "Agente logístico", "Semi-truck": "Camión", "Aframax crude oil tanker": "Petrolero de crudo Aframax", "Cargo plane": "Avión de carga",
  "Locked": "Bloqueado", "Empty slot": "Plaza libre",
  "Run trucks, oil tankers and cargo planes on contracts around the world.": "Gestiona camiones, petroleros y aviones de carga con contratos por todo el mundo.",
  "Achievements unlocked": "Logros desbloqueados", "Rewards": "Recompensas", "All": "Todos", "General": "General", "Investments": "Inversiones",
  "Mining": "Minería", "Secrets": "Secretos", "Genetics": "Genética", "Hide completed": "Ocultar completados", "Show completed": "Mostrar completados",
  "Cosmetic items change how the game looks. Turn them on or off any time after buying. Only one background can be on at a time.":
    "Los objetos cosméticos cambian el aspecto del juego. Actívalos o desactívalos cuando quieras después de comprarlos. Solo puede haber un fondo activo a la vez.",
  "Amount": "Cantidad", "Collection": "Colección", "Undo": "Deshacer", "Clear": "Borrar", "Info": "Info",
});

// ----- text with numbers or names -----
rx(String.raw`(${NUM}) \/ sec`, "$1 / s");
rx(String.raw`Buy (${NUM})`, "Comprar $1");
rx(String.raw`Buy for (${NUM})`, "Comprar por $1");
rx(String.raw`Pay (${NUM})`, "Pagar $1");
rx(String.raw`Sell and pay (${NUM})`, "Vender y pagar $1");
rx(String.raw`(${NUM}) each`, "$1 cada uno");
rx(String.raw`Owned: (\d+) \/ (\d+)`, "En propiedad: $1 / $2");
rx(String.raw`Owned: (\d+) \/ (\d+) \(one slot per hotel\)`, "En propiedad: $1 / $2 (una plaza por hotel)");
rx(String.raw`Level (\d+)`, "Nivel $1");
rx(String.raw`Show tips: (ON|OFF)`, (m, v) => `Mostrar consejos: ${v === "ON" ? "SÍ" : "NO"}`);
rx(String.raw`(.+) #(\d+)`, (m, name, n) => `${es(name)} #${n}`);
rx(String.raw`Up to (\d+) employees \(incl\. accountant & HR\) · workers earn ([\d–.,]+) \/ sec`, "Hasta $1 empleados (contable y RR. HH. incluidos) · cada trabajador gana $2 / s");
rx(String.raw`Up to (\d+) employees · workers earn ([\d–.,]+) \/ sec`, "Hasta $1 empleados · cada trabajador gana $2 / s");
rx(String.raw`(\d+) workers · no accountant or HR · workers earn ([\d–.,]+) \/ sec`, "$1 trabajadores · sin contable ni RR. HH. · cada trabajador gana $2 / s");
rx(String.raw`Unlocks when you have 20 car wash workers \(you have (\d+)\)`, "Se desbloquea con 20 trabajadores en lavaderos (tienes $1)");
rx(String.raw`Unlocks when you own all 3 car washes \((\d)\/3\) and all 3 repair shops \((\d)\/3\)`, "Se desbloquea cuando tengas los 3 lavaderos ($1/3) y los 3 talleres ($2/3)");
rx(String.raw`Casino #(\d+) unlocks at Gambler level (\d+) \(play in the 🎰 Casino tab\)`, "El casino #$1 se desbloquea en el nivel de jugador $2 (juega en la pestaña 🎰 Casino)");
rx(String.raw`Hotel #(\d+) unlocks at Investor level (\d+) \(invest in the 📈 Investing tab\)`, "El hotel #$1 se desbloquea en el nivel de inversor $2 (invierte en la pestaña 📈 Inversiones)");
rx(String.raw`(\d+) business(?:es)? · (\d+) workers?`, (m, a, b) => `${a} ${plural(a, "negocio", "negocios")} · ${b} ${plural(b, "trabajador", "trabajadores")}`);
rx(String.raw`(\d+) \/ (\d+) workers`, "$1 / $2 trabajadores");
rx(String.raw`Workers \((\d+) \/ (\d+)\)`, "Trabajadores ($1 / $2)");
rx(String.raw`base (\S+)`, "base $1");
rx(String.raw`as (\S+) (.+)`, (m, e, n) => `como ${e} ${es(n)}`);
rx(String.raw`Choose who to hire \((${NUM}) money\)`, "Elige a quién contratar (cuesta $1)");
rx(String.raw`New options \((${NUM})\)`, "Nuevas opciones ($1)");
rx(String.raw`Lost the bet: (.+) gone!`, "Apuesta perdida: ¡se han perdido $1!");
rx(String.raw`The embezzler stole (.+)!`, "¡El malversador ha robado $1!");
rx(String.raw`(\d+)%`, "$1%");
// special businesses
rx(String.raw`Warehouses × (\d+)`, "Almacenes × $1");
rx(String.raw`Unlocks when you own (\d+) semi-trucks \(you have (\d+), see 🚢 Logistics\)`, "Se desbloquea cuando tengas $1 camiones (tienes $2, ver 🚢 Logística)");
rx(String.raw`Attorneys \((\d+) \/ (\d+)\)`, "Abogados ($1 / $2)");
rx(String.raw`Buy attorney slot \((${NUM})\)`, "Comprar plaza de abogado ($1)");
rx(String.raw`Replace \((${NUM})\)`, "Sustituir ($1)");
rx(String.raw`All attorney slots are filled\. You can fire and replace any attorney for (${NUM})\.`, "Todas las plazas de abogado están ocupadas. Puedes despedir y sustituir a cualquier abogado por $1.");
rx(String.raw`Agents \((\d+) \/ (\d+)\)`, "Agentes ($1 / $2)");
rx(String.raw`Agent (\d+)`, "Agente $1");
rx(String.raw`Your agency is full \(max (\d+) agents\)\.`, "Tu agencia está completa (máx. $1 agentes).");
rx(String.raw`Next agent at (${NUM}) real estate profit \(now (${NUM})\)`, "Próximo agente con $1 de beneficio inmobiliario (ahora $2)");
rx(String.raw`(\d+) agents · about (${NUM}) \/ sec on average`, "$1 agentes · unos $2 / s de media");
rx(String.raw`Agents join at 100k, 300k, 600k, 1M… real estate profit \(you'd start with (\d+)\)`, "Los agentes se unen a los 100k, 300k, 600k, 1M… de beneficio inmobiliario (empezarías con $1)");
rx(String.raw`Unlocks at 100,000 all-time real estate profit \(now (${NUM}), see 📈 Investing\)`, "Se desbloquea con 100.000 de beneficio inmobiliario total (ahora $1, ver 📈 Inversiones)");
rx(String.raw`Upgrades every 🤖 Logistics agent: choose 1 of 3 when you buy it, add the other two later for (${NUM}) each · no workers, HR manager or accountant · max 1`,
  "Mejora a todos los 🤖 agentes logísticos: elige 1 de 3 al comprarlo y añade las otras dos más tarde por $1 cada una · sin trabajadores, RR. HH. ni contable · máx. 1");
rx(String.raw`Unlocks at 🚚 Logistics level (\d+) \(you are level (\d+)\)`, "Se desbloquea en el 🚚 nivel de logística $1 (estás en el nivel $2)");
rx(String.raw`(\d) \/ 3 upgrades`, "$1 / 3 mejoras");
rx(String.raw`Paired with 🏨 Hotel #(\d+) · earns 50% of its income`, "Unido al 🏨 hotel #$1 · gana el 50% de sus ingresos");
rx(String.raw`Pairs with 🏨 Hotel #(\d+) and earns 50% of its income · no workers, HR manager or accountant`, "Se une al 🏨 hotel #$1 y gana el 50% de sus ingresos · sin trabajadores, RR. HH. ni contable");
rx(String.raw`(\d+) parks? · (\d+) \/ (\d+) hotel slots used`, (m, a, b, c) => `${a} ${plural(a, "parque", "parques")} · ${b} / ${c} plazas de hotel usadas`);
rx(String.raw`Fixed income of (${NUM}) \/ sec · each mine holds a random (${NUM}) – (${NUM}) of gold, then closes`, "Ingresos fijos de $1 / s · cada mina guarda al azar entre $2 y $3 de oro y después cierra");
rx(String.raw`Gold rush: a 1 in (\d+) chance every second per mine you own \(2 mines: 1 in (\d+)\) to double gold mine income for (\d+) seconds`,
  "Fiebre del oro: cada segundo, 1 entre $1 por cada mina que tengas (2 minas: 1 entre $2) de duplicar los ingresos de las minas durante $3 segundos");
rx(String.raw`Unlocks at 500,000 all-time gold profit \(now (${NUM}), see 📈 Investing\)`, "Se desbloquea con 500.000 de beneficio total en oro (ahora $1, ver 📈 Inversiones)");
rx(String.raw`Mined (${NUM}) of (${NUM}) · (${NUM}) left \(about (\d+)h (\d+)m\)`, "Extraído $1 de $2 · quedan $3 (unas $4 h $5 min)");
rx(String.raw`Fills every empty 🎰 casino and 🏨 hotel with your staffing plan: accountant, HR and a chosen trait for every worker · (${NUM}) per business filled · pay per second stays random · 👥 Hire staff only fills businesses with no staff · 🔄 Apply to all brings every hotel and casino in line with the plan · max 1`,
  "Llena cada 🎰 casino y 🏨 hotel vacío con tu plan de plantilla: contable, RR. HH. y un rasgo elegido para cada trabajador · $1 por negocio · el sueldo por segundo sigue siendo al azar · 👥 Contratar personal solo llena negocios sin plantilla · 🔄 Aplicar a todos ajusta cada hotel y casino al plan · máx. 1");
rx(String.raw`Unlocks when you own (\d+) hotels \((\d+)\/(\d+)\) and (\d+) casinos \((\d+)\/(\d+)\)`, "Se desbloquea cuando tengas $1 hoteles ($2/$3) y $4 casinos ($5/$6)");
rx(String.raw`Earns (${NUM}) \/ sec per oil tanker you own and \+2\.5% profit on every tanker contract · no workers, HR manager or accountant · max 1`,
  "Gana $1 / s por cada petrolero que tengas y +2,5% de beneficio en cada contrato de petrolero · sin trabajadores, RR. HH. ni contable · máx. 1");
rx(String.raw`With your (\d+) tankers?: \+(${NUM}) \/ sec`, "Con tus $1 petroleros: +$2 / s");
rx(String.raw`Shows your paintings to visitors: (${NUM}) \/ sec for each painting in your 🖼️ Collection, up to (${NUM}) \/ sec \((\d+) paintings\) · no workers, HR manager or accountant · max 1`,
  "Muestra tus cuadros a los visitantes: $1 / s por cada cuadro de tu 🖼️ Colección, hasta $2 / s ($3 cuadros) · sin trabajadores, RR. HH. ni contable · máx. 1");
rx(String.raw`Unlocks with (\d+) paintings in your 🖼️ Art Gallery collection \(you have (\d+)\)`, "Se desbloquea con $1 cuadros en tu colección de la 🖼️ Galería de arte (tienes $2)");
rx(String.raw`With your (\d+) paintings: \+(${NUM}) \/ sec`, "Con tus $1 cuadros: +$2 / s");
rx(String.raw`(${NUM}) \/ sec for each of your (\d+) paintings?( · maximum reached| · max (${NUM}) \/ sec)`,
  (m, a, n, tail, max) => `${a} / s por cada uno de tus ${n} ${plural(n, "cuadro", "cuadros")}${max ? ` · máx. ${max} / s` : " · máximo alcanzado"}`);
// tax
rx(String.raw`TAX DEBT: (${NUM}) · (\d+:\d\d) left · click to pay`, "DEUDA FISCAL: $1 · quedan $2 · haz clic para pagar");
rx(String.raw`TAX DEBT: (${NUM})`, "DEUDA FISCAL: $1");
rx(String.raw`(${NUM}) · (\d+:\d\d) left`, "$1 · quedan $2");
rx(String.raw`(${NUM}) \(\+50%, last chance!\) · (\d+:\d\d) left`, "$1 (+50%, ¡última oportunidad!) · quedan $2");
rx(String.raw`Paid (${NUM})\. Still owed: (${NUM})`, "Pagado: $1. Aún debes: $2");
rx(String.raw`Not enough money: you have (${NUM}), you owe (${NUM})`, "No tienes suficiente dinero: tienes $1 y debes $2");
rx(String.raw`Tax paid: (${NUM})\. All bills are settled\.`, "Impuestos pagados: $1. Todas las facturas están saldadas.");
rx(String.raw`Tax inspection! You owe (${NUM})\. Pay within 5 minutes\.`, "¡Inspección de Hacienda! Debes $1. Paga en menos de 5 minutos.");
rx(String.raw`Not enough money! Tax bill raised to (${NUM})\. You have 5 more minutes\.`, "¡No tienes suficiente dinero! La factura sube a $1. Tienes 5 minutos más.");
rx(String.raw`Sold investments for (${NUM}) \(after the 20% fee\) and paid the tax bill of (${NUM})\.`, "Has vendido inversiones por $1 (tras la comisión del 20%) y pagado la factura de impuestos de $2.");
rx(String.raw`Real estate \((\d+)\)`, "Inmuebles ($1)");
// boosters, guided start, about, prestige
rx(String.raw`Right now that's (${NUM}) per click\.`, "Ahora mismo son $1 por clic.");
rx(String.raw`Right now that's about (${NUM}) extra over the 2 minutes\.`, "Ahora mismo son unos $1 extra durante los 2 minutos.");
rx(String.raw`Guided start · (\d+) \/ (\d+)`, "Introducción guiada · $1 / $2");
rx(String.raw`It costs (${NUM}): keep clicking the coin\.`, "Cuesta $1: sigue haciendo clic en la moneda.");
rx(String.raw`It costs (${NUM})\.`, "Cuesta $1.");
rx(String.raw`(Latest update|Earlier update) · (\d+ \w+ \d+) · (.+)`, (m, k, d, title) => `${k === "Latest update" ? "Última actualización" : "Actualización anterior"} · ${esDate(d)} · ${title}`);
rx(String.raw`You made it: (${NUM})!`, "¡Lo has conseguido: $1!");
rx(String.raw`Prestige (\d) of (\d)`, "Prestigio $1 de $2");
rx(String.raw`You'd keep (\d+) trucks, (\d+) tankers, (\d+) planes`, "Conservarías $1 camiones, $2 petroleros y $3 aviones");
// other tabs
rx(String.raw`(${NUM}) \/ (${NUM}) XP to level (\d+)`, "$1 / $2 XP para el nivel $3");
rx(String.raw`Cashback (${NUM}%) on lost bets`, "Reembolso del $1 en apuestas perdidas");
rx(String.raw`(Roulette|Blackjack|Baccarat|Video Poker|Ultimate Texas Hold'em|Plinko|Sky Climb|Gene Cascade): (Classic table|High rollers|Super high rollers)`,
  (m, g, t) => `${{ Roulette: "Ruleta", "Video Poker": "Videopóquer" }[g] || g}: ${{ "Classic table": "mesa clásica", "High rollers": "altas apuestas", "Super high rollers": "súper altas apuestas" }[t]}`);
rx(String.raw`Logistics agent: (ON|OFF)`, (m, v) => `Agente logístico: ${v === "ON" ? "ACTIVADO" : "DESACTIVADO"}`);
rx(String.raw`Agent: Logistics level (\d+)`, "Agente: nivel de logística $1");
rx(String.raw`(Truck|Tanker|Plane) agent unlocks at level (\d+)`, (m, f, l) => `El agente de ${{ Truck: "camiones", Tanker: "petroleros", Plane: "aviones" }[f]} se desbloquea en el nivel ${l}`);
rx(String.raw`Unlocks when you own 3 oil tankers \(you have (\d+)\)`, "Se desbloquea cuando tengas 3 petroleros (tienes $1)");
rx(String.raw`Price · last (\d+) min`, "Precio · últimos $1 min");
rx(String.raw`(\d+)-candle moving average`, "Media móvil de $1 velas");
rx(String.raw`Open (Long|Short) ×(\d+)`, (m, s, x) => `Abrir ${s === "Long" ? "largo" : "corto"} ×${x}`);
rx(String.raw`ETF cash-out fee (${NUM}%) · property sales \+(${NUM}%)`, "Comisión de retirada del ETF $1 · ventas de inmuebles +$2");

// ----- sentences with bold / icons -----
Object.assign(ES_HTML, {
  "Each click is worth <b>×5</b> for the next <b>30 seconds</b>.": "Cada clic vale <b>×5</b> durante los próximos <b>30 segundos</b>.",
  "Click the can to buy it for <b>50</b>.": "Haz clic en la lata para comprarla por <b>50</b>.",
  "For <b>30 seconds</b>, each click also gives <b>10% of your income per second</b>.": "Durante <b>30 segundos</b>, cada clic da además <b>el 10% de tus ingresos por segundo</b>.",
  "Click the pill to buy it for <b>2,000</b>.": "Haz clic en la píldora para comprarla por <b>2000</b>.",
  "<b>Doubles the income of all your businesses</b> for <b>2 minutes</b>.": "<b>Duplica los ingresos de todos tus negocios</b> durante <b>2 minutos</b>.",
  "Click the hat to buy it for <b>250,000</b>.": "Haz clic en el sombrero para comprarlo por <b>250.000</b>.",
  "= 1,000,000 scoin<br><span>= 1,000,000,000,000 bcoin</span>": "= 1.000.000 scoin<br><span>= 1.000.000.000.000 bcoin</span>",
  // guided start
  "👆 <b>Click the coin</b> to earn your first money.": "👆 <b>Haz clic en la moneda</b> para ganar tu primer dinero.",
  "⚡ <b>Buy an energy drink.</b> For 30 seconds every click is worth ×5, a quick way to afford your first business.":
    "⚡ <b>Compra una bebida energética.</b> Durante 30 segundos cada clic vale ×5: una forma rápida de pagarte tu primer negocio.",
  "🌭 <b>Buy a Hot Dog Stand.</b> It's your first business: small, cheap, and it earns money every second.":
    "🌭 <b>Compra un puesto de perritos.</b> Es tu primer negocio: pequeño, barato y gana dinero cada segundo.",
  "👷 <b>Hire a worker.</b> A business only earns when it has workers. Each worker has a trait with a small bonus. The first one is free!":
    "👷 <b>Contrata a un trabajador.</b> Un negocio solo gana dinero si tiene trabajadores. Cada uno tiene un rasgo con una pequeña bonificación. ¡El primero es gratis!",
  "👷 <b>Hire a second worker.</b> A Hot Dog Stand has room for 2 workers.": "👷 <b>Contrata a un segundo trabajador.</b> En un puesto de perritos caben 2 trabajadores.",
  "🚗 <b>Next goal: a Car Wash</b> (1,000). Bigger businesses earn more, but first you'll pick an <b>accountant</b> and an <b>HR manager</b>, and each gives a bonus.":
    "🚗 <b>Siguiente objetivo: un lavadero de coches</b> (1000). Los negocios grandes ganan más, pero antes elegirás un <b>contable</b> y un <b>responsable de RR. HH.</b>, y cada uno da una bonificación.",
  "📈 This is your <b>income per second</b>. More businesses and workers make it grow, even while you're away.":
    "📈 Estos son tus <b>ingresos por segundo</b>. Con más negocios y trabajadores crecen, incluso cuando no estás.",
  "🔓 New tabs and features <b>unlock as you grow</b>. Look for 🔒 to see what's next, and 📖 Wiki if you need help. Have fun!":
    "🔓 Las nuevas pestañas y funciones <b>se desbloquean a medida que creces</b>. Busca el 🔒 para ver lo siguiente y la 📖 Wiki si necesitas ayuda. ¡Diviértete!",
  "Go back to <b>💰 Income</b> to continue.": "Vuelve a <b>💰 Ingresos</b> para continuar.",
  "Open <b>🏢 Businesses</b> to continue.": "Abre <b>🏢 Negocios</b> para continuar.",
  // settings, about
  "This deletes <b>all</b> your progress: money, businesses, levels and investments.": "Esto borra <b>todo</b> tu progreso: dinero, negocios, niveles e inversiones.",
  "<b>Empire of Coins</b> is an idle tycoon game. You start with one coin and build a business empire that keeps earning, even while you're away.":
    "<b>Empire of Coins</b> es un juego idle de magnates. Empiezas con una moneda y construyes un imperio empresarial que sigue ganando dinero incluso cuando no estás.",
  "👆 <b>Click the coin</b> to earn your first money, and use boosters like the energy drink to speed up.":
    "👆 <b>Haz clic en la moneda</b> para ganar tu primer dinero y usa potenciadores como la bebida energética para ir más rápido.",
  "🏢 <b>Buy businesses and hire workers.</b> Every worker has a trait, and accountants and HR experts make a business earn more.":
    "🏢 <b>Compra negocios y contrata trabajadores.</b> Cada trabajador tiene un rasgo, y los contables y expertos de RR. HH. hacen que un negocio gane más.",
  "📈 <b>Grow into new areas</b> as you unlock them: 🎰 Casino, 📈 Investing, 🚢 Logistics, 🎮 Mini-games (🖼️ Art Gallery, ⛏️ Gold Mine Dig) and 🔬 Science.":
    "📈 <b>Amplía tu imperio</b> a nuevas áreas según las desbloquees: 🎰 Casino, 📈 Inversiones, 🚢 Logística, 🎮 Minijuegos (🖼️ Galería de arte, ⛏️ Excavación en la mina de oro) y 🔬 Ciencia.",
  "🏆 <b>Collect achievements</b> to win reward collections, and spend scoin in the 🛍️ Shop on looks for your coin and background.":
    "🏆 <b>Consigue logros</b> para ganar colecciones de recompensa y gasta scoin en la 🛍️ Tienda en aspectos para tu moneda y tu fondo.",
  "⭐ <b>Prestige</b> at 1, 5, 10 and 20 gcoin: start over with a permanent Legacy bonus.": "⭐ <b>Haz prestigio</b> con 1, 5, 10 y 20 gcoin: vuelve a empezar con una bonificación de Legado permanente.",
  // tax, prestige, other tabs
  "You can sell investments to cover it, with a <b>20% fee</b>. Only what's needed is sold (Broker ETF, then ETF, then gold, then the cheapest properties; a property is sold whole).":
    "Puedes vender inversiones para cubrirla, con una <b>comisión del 20%</b>. Solo se vende lo necesario (ETF de bróker, luego ETF, luego oro y después los inmuebles más baratos; cada inmueble se vende entero).",
  "You can <b>prestige</b>: start the game over and choose a permanent Legacy bonus.": "Puedes hacer <b>prestigio</b>: empieza la partida de nuevo y elige una bonificación de Legado permanente.",
  "<b>Unlocks when you buy your first 🚘 Car Salon</b> (💰 Income → 🏢 Businesses; it needs 3 car washes and 3 repair shops).":
    "<b>Se desbloquea al comprar tu primer 🚘 concesionario</b> (💰 Ingresos → 🏢 Negocios; necesitas 3 lavaderos y 3 talleres).",
});
hrx(String.raw`Time is up for your tax bill of <b>(${NUM})</b>\.`, "Se ha acabado el plazo de tu factura de impuestos de <b>$1</b>.");
hrx(String.raw`Your tax bill of <b>(${NUM})</b> is due and you only have <b>(${NUM})</b>: <b>(${NUM})</b> is missing\.`, "Tu factura de impuestos de <b>$1</b> vence y solo tienes <b>$2</b>: faltan <b>$3</b>.");
hrx(String.raw`You couldn't pay your tax bill of <b>(${NUM})</b>, even after the extension\.`, "No has podido pagar tu factura de impuestos de <b>$1</b>, ni siquiera con la prórroga.");
hrx(String.raw`Truck contracts pay <b>\+(\d+)%</b> \(\+2% per warehouse\)`, "Los contratos de camión pagan <b>+$1%</b> (+2% por almacén)");
hrx(String.raw`(${NUM}) \/ sec for each of your (\d+) oil tankers? · tanker contracts pay <b>\+2\.5%</b>`, (m, a, n) => `${a} / s por cada uno de tus ${n} ${plural(n, "petrolero", "petroleros")} · los contratos de petrolero pagan <b>+2,5%</b>`);
hrx(String.raw`<b>(\d+)</b> empty business(?:es)? ready to staff · cost (${NUM})`, (m, n, c) => `<b>${n}</b> ${plural(n, "negocio vacío listo", "negocios vacíos listos")} para contratar personal · cuesta ${c}`);
// "Name <span>× 2</span>", "Title <span>(0/1)</span>"
hrx(String.raw`((?:\{i\})*)([^<{]+?) <span>(× \d+|\(\d+\/\d+\))<\/span>`, (m, i, name, tail) => `${i}${es(name)} <span>${tail}</span>`);
// "<b>Name</b>: description" and "Label: <b>value</b>"
hrx(String.raw`<b>([^<]+)<\/b>: ([^<]+)`, (m, a, b) => `<b>${es(a)}</b>: ${es(b)}`);
hrx(String.raw`((?:\{i\})*)([^<{]+?): <b>([^<]+)<\/b>`, (m, i, a, b) => `${i}${es(a)}: <b>${es(b)}</b>`);
// achievement pop-up: "<b>🏆 Achievement unlocked!</b>{i} <b>Name</b>: desc<br><small>Click to close</small>"
hrx(String.raw`<b>([^<]+)<\/b>((?:\{i\})*[^<{]{0,8}?) <b>([^<]+)<\/b>: ([^<]+)<br><small>([^<]+)<\/small>`,
  (m, a, i, b, c, d) => `<b>${es(a)}</b>${i} <b>${es(b)}</b>: ${es(c)}<br><small>${es(d)}</small>`);

// casino lobby and Hot Tables
rx(String.raw`next in (\d+:\d\d)`, "la siguiente en $1");
rx(String.raw`(\d+:\d\d) left`, "quedan $1");
rx(String.raw`Hot Tables: (.+) · \+(\d+) XP multiplier`, (m, g, n) => `Mesas calientes: ${es(g)} · +${n} al multiplicador de XP`);
rx(String.raw`All (.+) tables get \+(\d+) on their XP multiplier right now \(e\.g\. ×4 becomes ×(\d+)\)\. Then a 10-minute break; next up: (.+)\.`,
  (m, g, n, x, nx) => `Todas las mesas de ${es(g)} tienen ahora +${n} en su multiplicador de XP (p. ej., ×4 pasa a ×${x}). Luego, 10 minutos de pausa; la siguiente: ${es(nx)}.`);
hrx(String.raw`Next hot game: <b>([^<]+)<\/b> \(\+(\d+) XP multiplier for 10 minutes on all its tables\)\.`, (m, g, n) => `Próximo juego caliente: <b>${es(g)}</b> (+${n} al multiplicador de XP durante 10 minutos en todas sus mesas).`);
rx(String.raw`European roulette, bets from (${NUM}) to (${NUM}) per spot\.`, "Ruleta europea, apuestas de $1 a $2 por casilla.");
rx(String.raw`Play 1 to 3 hands against the dealer\. Bets from (${NUM}) to (${NUM}) per hand\.`, "Juega de 1 a 3 manos contra la banca. Apuestas de $1 a $2 por mano.");
rx(String.raw`Bet on Player, Banker or a Tie: the hand closest to 9 wins\. Bets from (${NUM}) to (${NUM}) per spot\.`, "Apuesta a Jugador, Banca o Empate: gana la mano más cercana a 9. Apuestas de $1 a $2 por casilla.");
rx(String.raw`Jacks or Better with a joker \(53 cards\)\. Bets from (${NUM}) to (${NUM})\. Jackpot (${NUM})\.`, "Jacks or Better con comodín (53 cartas). Apuestas de $1 a $2. Bote de $3.");
rx(String.raw`Beat the dealer's poker hand\. Play 1 or 2 seats\. Ante (${NUM}) to (${NUM}) \(\+ equal Blind, optional Trips\)\.`, "Gana a la mano de póquer de la banca. Juega 1 o 2 asientos. Ante de $1 a $2 (+ ciega igual, Trips opcional).");
rx(String.raw`Drop up to 20 balls down a peg pyramid into multipliers from 0\.3× to 250×\. Bets (${NUM}) – (${NUM}) per ball\.`, "Deja caer hasta 20 bolas por una pirámide de clavos hacia multiplicadores de 0,3× a 250×. Apuestas de $1 a $2 por bola.");
rx(String.raw`Same pyramid, 0\.3× to 250×, up to 20 balls\. Bets from (${NUM}) to (${NUM}) per ball\.`, "La misma pirámide, de 0,3× a 250×, hasta 20 bolas. Apuestas de $1 a $2 por bola.");
rx(String.raw`Draw balls to climb a 20-step ladder up to 50,000×\. Cash out before a red ball pops your balloon! Bets (${NUM}) – (${NUM})\.`, "Saca bolas para subir una escalera de 20 peldaños hasta 50.000×. ¡Cobra antes de que una bola roja te pinche el globo! Apuestas de $1 a $2.");
rx(String.raw`A 7×7 slot: clusters of 5\+ touching specimens pay, then tumble\. Lab spots grow ×2 … ×128\. Bets (${NUM}) – (${NUM}) per spin\.`, "Tragaperras de 7×7: los grupos de 5 o más especímenes juntos pagan y caen. Las casillas de laboratorio crecen ×2 … ×128. Apuestas de $1 a $2 por tirada.");

