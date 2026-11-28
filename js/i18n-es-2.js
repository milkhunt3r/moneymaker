/* Empire of Coins © 2026 milkhunt3r. All rights reserved. */
/* =====================================================================
   🌐 ESPAÑOL (España), session 2: the rule texts in Investing, Logistics and Live trading, every casino game,
   the mini-games, achievement names and descriptions, and the Shop / reward items.
   Loaded after js/i18n-es.js (same helpers: es, NUM, rx, hrx, plural). The generic fallbacks at the end
   (sentence by sentence, and markup piece by piece) must stay the last rules.
   ===================================================================== */
// es() that gives null (instead of the English) when a piece has no translation
function esq(s) {
  const m = String(s).match(EDGE); if (!m) return null;
  const core = squash(m[2]);
  if (!core || !LETTER.test(core.replace(/\b[sgb]coin\b|\bXP\b/g, ""))) return decFix(String(s));
  if (I18N_DONE.has(core)) return String(s);
  const out = trCore(core);
  return out == null ? null : m[1] + decFix(out) + m[3];
}
// an ES_HTML sentence, also under the key it gets when its bold words were already translated
function H(en, sp) {
  ES_HTML[en] = sp;
  // a note with no tags shows as plain text: translate it by its words, without the leading emoji
  if (!/<[a-z]/i.test(en)) { const strip = (x) => x.replace(/^[^\p{L}\d]+/u, ""); ES[strip(en)] = strip(sp); }
  const v = en.replace(/<b>([^<]+)<\/b>/g, (m, x) => `<b>${ES[x.replace(/:$/, "")] !== undefined && /:$/.test(x) ? ES[x.replace(/:$/, "")] + ":" : (ES[x] ?? x)}</b>`);
  if (v !== en) ES_HTML[v] = sp;
}

/* ---------- 🃏 cards, hands, places ---------- */
const RANK_ES = { Ace: "As", King: "Rey", Queen: "Reina", Jack: "Jota" };
const SUIT_ES = { spades: "picas", hearts: "corazones", diamonds: "diamantes", clubs: "tréboles" };
rx(String.raw`(Ace|King|Queen|Jack|\d+) of (spades|hearts|diamonds|clubs)`, (m, r, s) => `${RANK_ES[r] || r} de ${SUIT_ES[s]}`);
const CITY_ES = { "New York": "Nueva York", "Cape Town": "Ciudad del Cabo", "Milan": "Milán", "Beijing": "Pekín", "Shanghai": "Shanghái",
  "Singapore": "Singapur", "Frankfurt": "Fráncfort", "Dubai": "Dubái", "Sydney": "Sídney", "Mumbai": "Bombay", "Istanbul": "Estambul",
  "Tokyo": "Tokio", "Bangkok": "Bangkok", "Montreal": "Montreal", "Liège": "Lieja", "Augusta / Trieste": "Augusta / Trieste",
  "Melaka": "Malaca", "Hong Kong": "Hong Kong", "Kuala Lumpur": "Kuala Lumpur", "Los Angeles": "Los Ángeles", "Rotterdam": "Róterdam",
  "Johannesburg": "Johannesburgo", "Delhi": "Delhi", "São Paulo": "São Paulo", "Buenos Aires": "Buenos Aires" };
const cityEs = (c) => c.replace(/^(.+?)( \S+)?$/u, (m, n, f) => (CITY_ES[n] || n) + (f || ""));
ES_RX.push([/^(.+? [\u{1F1E6}-\u{1F1FF}]{2}) → (.+? [\u{1F1E6}-\u{1F1FF}]{2})$/u, (m, a, b) => `${cityEs(a)} → ${cityEs(b)}`]);
const routeEs = (r) => r.replace(/^(.+? [\u{1F1E6}-\u{1F1FF}]{2}) → (.+? [\u{1F1E6}-\u{1F1FF}]{2})$/u, (m, a, b) => `${cityEs(a)} → ${cityEs(b)}`);

Object.assign(ES, {
  // ===================== 🎰 CASINO: shared =====================
  "Clear bets": "Quitar apuestas", "Repeat last bets": "Repetir últimas apuestas", "Deal": "Repartir", "Dealing...": "Repartiendo...",
  "Dealer": "Crupier", "Face-down card": "Carta boca abajo", "Payouts": "Premios", "Reward": "Premio", "bet": "apuesta", "Bet": "Apuesta",
  "Chip": "Ficha", "Joker": "Comodín", "Win": "Gana", "Lose": "Pierde", "Push": "Empate", "push": "empate", "Bust": "Te pasas",
  "Surrendered": "Rendido", "Blackjack!": "¡Blackjack!", "No win": "Sin premio", "Click to bet": "Haz clic para apostar",
  "Place your bet": "Haz tu apuesta", "with the chips below": "con las fichas de abajo", "none yet": "todavía ninguno", "in play": "en juego",
  "Max bet": "Apuesta máx.", "Max level reached!": "¡Nivel máximo alcanzado!", "Level up!": "¡Subes de nivel!",
  "Seat 1": "Asiento 1", "Seat 2": "Asiento 2", "Seat 3": "Asiento 3", "empty": "vacío", "not playing": "no juega", "your move": "te toca",
  "Your money back (push).": "Recuperas tu dinero (empate).", "Your bet back.": "Recuperas tu apuesta.", "You broke even.": "Te quedas igual.",
  "No free chips of that kind left.": "No te quedan fichas gratis de ese tipo.", "That would go over the table limit.": "Eso supera el límite de la mesa.",
  "Click a seat to place a bet first.": "Primero haz clic en un asiento para apostar.", "🔀 New shoe shuffled.": "🔀 Zapato nuevo barajado.",
  "Enter how much money to bring in.": "Escribe cuánto dinero quieres traer.", "You don't have that much money.": "No tienes tanto dinero.",
  "Free bet chips: what the bet pays goes to your casino chips.": "Fichas de apuesta gratis: lo que pague la apuesta va a tus fichas del casino.",
  "Free:": "Gratis:", "On the table now:": "En la mesa ahora:", "Roulette games": "Ruletas", "Card games": "Juegos de cartas", "Slot games": "Tragaperras",
  "All games": "Todos los juegos", "chips": "fichas", "VIP coins": "monedas VIP",
  // ===================== 🎡 ROULETTE =====================
  "Place your bets!": "¡Hagan sus apuestas!", "Spinning...": "Girando...", "Red": "Rojo", "Black": "Negro", "Even": "Par", "Odd": "Impar",
  "1st 12": "1.ª docena", "2nd 12": "2.ª docena", "3rd 12": "3.ª docena", "2 to 1": "2 a 1",
  "Pick a chip, then click a betting spot.": "Elige una ficha y haz clic en una casilla de apuesta.",
  "Click a number, or the line between numbers: between 2 = split, where 4 meet = corner, bottom edge = street, bottom corner = six line (next to 0: trios 0-1-2 / 0-2-3 where two rows meet the zero, and first four 0-1-2-3 at its bottom).":
    "Haz clic en un número o en la línea entre números: entre 2 = caballo, donde se juntan 4 = cuadro, borde inferior = transversal, esquina inferior = seisena (junto al 0: tríos 0-1-2 / 0-2-3 donde dos filas tocan el cero, y primeros cuatro 0-1-2-3 en su parte inferior).",
  "Pays: number 35:1 · split 17:1 · street / trio 11:1 · corner / first four 8:1 · six line 5:1 · dozen / column 2:1 · red, black, odd, even, 1–18, 19–36 1:1 · when 0 comes up, only bets on 0 win":
    "Pagos: número 35:1 · caballo 17:1 · transversal / trío 11:1 · cuadro / primeros cuatro 8:1 · seisena 5:1 · docena / columna 2:1 · rojo, negro, impar, par, 1–18, 19–36 1:1 · cuando sale el 0, solo ganan las apuestas al 0",
  "Last numbers": "Últimos números",
  // ===================== 🃏 BLACKJACK =====================
  "Hit": "Pedir", "Stand": "Plantarse", "Double": "Doblar", "Split": "Separar", "Surrender": "Rendirse",
  "Take insurance": "Asegurar", "No insurance": "Sin seguro", "Dealer has blackjack!": "¡La banca tiene blackjack!",
  "Click a seat to add the chip. Play up to 3 seats.": "Haz clic en un asiento para poner la ficha. Juega hasta 3 asientos.",
  "Double on any first two cards · Split once per seat (split aces get one card) · Surrender a first-two-card hand for half your bet back · Insurance pays 2:1 when the dealer shows an Ace":
    "Dobla con cualquiera de las dos primeras cartas · Separa una vez por asiento (los ases separados reciben una carta) · Ríndete con las dos primeras cartas y recupera la mitad de tu apuesta · El seguro paga 2:1 cuando la banca muestra un as",
  // ===================== 🎴 VIDEO POKER =====================
  "Royal Flush": "Escalera real", "Straight Flush": "Escalera de color", "Four of a Kind": "Póquer", "Full House": "Full", "Flush": "Color",
  "Straight": "Escalera", "Three of a Kind": "Trío", "Two Pair": "Doble pareja", "Pair": "Pareja", "Jacks or Better": "Jotas o más",
  "Five of a Kind": "Repóker", "Wild Royal Flush": "Escalera real con comodín", "Lower hands": "Manos menores", "High Card": "Carta alta",
  "JACKPOT": "BOTE", "Release": "Soltar", "Hold": "Guardar", "Draw": "Cambiar", "HELD": "GUARDADA", "all cards": "todas las cartas",
  "Click the cards you want to keep, then draw.": "Haz clic en las cartas que quieres guardar y luego cambia.",
  "The joker is wild and becomes the best card for your hand · \"1×\" means you get your bet back · Returns about 98% with perfect play":
    "El comodín se convierte en la mejor carta para tu mano · «1×» significa que recuperas tu apuesta · Devuelve cerca del 98% jugando perfecto",
  "(bet the max to win all of it)": "(apuesta el máximo para ganarlo entero)",
  "▸ Show": "▸ Mostrar", "▾ Minimize": "▾ Minimizar", "Show": "Mostrar", "Minimize": "Minimizar",
  // ===================== 🤠 ULTIMATE TEXAS HOLD'EM =====================
  "Ante": "Ante", "Blind": "Ciega", "Trips": "Trips", "Play": "Jugar", "Board": "Mesa", "Check": "Pasar", "Fold": "Retirarse", "folded": "retirado",
  "(when you win)": "(cuando ganas)", "(your hand, win or lose)": "(tu mano, ganes o pierdas)", "click": "clic", "= ante": "= ante", "optional": "opcional",
  "Before the flop": "Antes del flop", "After the flop": "Después del flop", "After the river": "Después del river",
  "Click Ante or Trips on a seat to add the chip. The Blind matches the Ante.": "Haz clic en Ante o Trips de un asiento para poner la ficha. La ciega iguala al ante.",
  "Raise 3× or 4× before the flop, 2× after the flop, or 1× after the river (once per hand) · The dealer needs a pair to qualify, otherwise Antes push · Best 5 of 7 cards":
    "Sube 3× o 4× antes del flop, 2× después del flop o 1× después del river (una vez por mano) · La banca necesita una pareja para calificar; si no, los antes empatan · Cuentan las 5 mejores de 7 cartas",
  "A free Ante needs 2 free chips (Ante + Blind).": "Un ante gratis necesita 2 fichas gratis (ante + ciega).",
  // ===================== 🎴 BACCARAT =====================
  "PLAYER": "JUGADOR", "BANKER": "BANCA", "Player": "Jugador", "Banker": "Banca", "Tie": "Empate", "Player Pair": "Pareja del jugador",
  "Banker Pair": "Pareja de la banca", "Last results": "Últimos resultados", "B": "B", "P": "J", "T": "E",
  "A = 1 · 10, J, Q, K = 0 · only the last digit counts · Banker wins pay 0.95:1 (5% commission) · On a Tie, Player and Banker bets are returned · The third card is drawn by the standard rules":
    "A = 1 · 10, J, Q, K = 0 · solo cuenta la última cifra · Banca paga 0,95:1 (5% de comisión) · En un empate se devuelven las apuestas a Jugador y Banca · La tercera carta se saca según las reglas estándar",
  "Pair bets need a Player, Banker or Tie bet too.": "Las apuestas a pareja necesitan también una apuesta a Jugador, Banca o Empate.",
  "(natural)": "(natural)",
  // ===================== 🔻 PLINKO =====================
  "Bet per ball": "Apuesta por bola", "Balls": "Bolas",
  // ===================== 🎈 SKY CLIMB =====================
  "Place a bet and start climbing!": "¡Apuesta y empieza a subir!", "Same bet": "Misma apuesta", "Start": "Empezar", "Cash out": "Retirar",
  "Take half": "Llevarte la mitad", "Draw a ball": "Sacar una bola", "riding": "en juego", "Red: popped!": "Roja: ¡pinchado!",
  "Green: +1 step": "Verde: +1 peldaño", "Gold: +1 step and a shield": "Dorada: +1 peldaño y un escudo", "Red, blocked by your shield": "Roja, bloqueada por tu escudo",
  "Green climbs a step · Gold climbs and gives a shield that blocks one red · Red pops your balloon · Take half once to bank half and keep climbing with the rest":
    "La verde sube un peldaño · La dorada sube y da un escudo que bloquea una roja · La roja pincha tu globo · Llévate la mitad una vez para guardarla y sigue subiendo con el resto",
  "🛡️ Your gold shield blocked the red ball! You're still flying.": "🛡️ ¡Tu escudo dorado ha bloqueado la bola roja! Sigues volando.",
  "🎈 Your Sky Climb is still in the air: continue it in the 🎰 Casino.": "🎈 Tu Sky Climb sigue en el aire: continúala en el 🎰 Casino.",
  "TOP OF THE SKY!": "¡EN LO MÁS ALTO DEL CIELO!", "The other half keeps climbing.": "La otra mitad sigue subiendo.", "You're still flying.": "Sigues volando.",
  "Shield": "Escudo", "shield": "escudo",
  // ===================== 🧬 GENE CASCADE =====================
  "Paytable and rules": "Tabla de premios y reglas", "Specimen": "Espécimen", "SPIN": "GIRAR", "Fast play": "Juego rápido",
  "Skip to the result": "Ir al resultado", "Buy free spins": "Comprar tiradas gratis", "Tap again to buy": "Pulsa otra vez para comprar",
  "Pays are × your bet for a cluster of that many touching specimens (up, down, left or right; not diagonal). Sizes in between pay in between.":
    "Los premios son × tu apuesta por un grupo de ese número de especímenes juntos (arriba, abajo, izquierda o derecha; no en diagonal). Los tamaños intermedios pagan intermedio.",
  "Winning specimens pop, the rest fall down and new ones drop in. That can win again in the same spin.":
    "Los especímenes ganadores explotan, el resto cae y entran otros nuevos. Puedes volver a ganar en la misma tirada.",
  "Spots reset after every paid spin, but in free spins they stay for the whole bonus.":
    "Las casillas se reinician tras cada tirada pagada, pero en las tiradas gratis se mantienen durante todo el bono.",
  "About 99% return. A spin can win at most 5000× your bet.": "Devolución de cerca del 99%. Una tirada puede ganar como máximo 5000× tu apuesta.",
  "No win this time.": "Esta vez no hay premio.", "Lab spots": "Casillas de laboratorio", "DNA vials": "Viales de ADN", "added": "se suman",

  // ===================== 📈 INVESTING =====================
  "Safe, steady income: earns 0.8% of its value as rent every 60 seconds (about +48% per hour, paid to your money). Locked for 20 minutes after buying, then sell any time with no fee. Min. 50,000.":
    "Ingresos seguros y constantes: gana el 0,8% de su valor en alquiler cada 60 segundos (unos +48% por hora, a tu dinero). Bloqueado 20 minutos tras comprarlo; después véndelo cuando quieras sin comisión. Mín. 50.000.",
  "Each second there is a small 1 in 21,600 chance (about once every 6 hours) of a market crash: all properties lose 70% of their value.":
    "Cada segundo hay una pequeña probabilidad de 1 entre 21.600 (más o menos una vez cada 6 horas) de un desplome del mercado: todos los inmuebles pierden el 70% de su valor.",
  "Every 10 seconds the market moves: 1 in 10 chance of −4%, 1 in 10 chance of +4%, otherwise 50/50 between +1.2% and −1%. On average about +25% an hour, but a lucky (or well-timed) player can do better. Min. 1,000 per investment. Cash-out fee":
    "Cada 10 segundos el mercado se mueve: 1 entre 10 de −4%, 1 entre 10 de +4%; si no, 50/50 entre +1,2% y −1%. De media unos +25% por hora, pero con suerte (o buen ojo) se puede ganar más. Mín. 1.000 por inversión. Comisión de retirada",
  "(lower with every Investor level).": "(baja con cada nivel de inversor).",
  "Buy a": "Compra una", "Brokerage Firm (Income tab, needs Investor level 10) to unlock.": "Agencia de valores (pestaña Ingresos, requiere nivel de inversor 10) para desbloquearlo.",
  "One slot: you invest once (min. 1,000, max. 10,000,000), and cash out everything before investing again. Your investment can still grow past 10M.":
    "Una sola plaza: inviertes una vez (mín. 1.000, máx. 10.000.000) y lo retiras todo antes de volver a invertir. Tu inversión puede seguir creciendo por encima de 10 M.",
  "Nothing to cash out.": "No hay nada que retirar.", "No gold to cash out.": "No tienes oro que retirar.", "Not enough money.": "No tienes suficiente dinero.",
  "ℹ️ Hide info": "ℹ️ Ocultar información", "Hide info": "Ocultar información", "Invested": "Invertido", "Gold": "Oro",
  "🏚️ Real estate crash! Properties lost 70% of their value.": "🏚️ ¡Desplome inmobiliario! Los inmuebles han perdido el 70% de su valor.",
  "Rent paid": "Alquiler cobrado", "rent in": "alquiler en", "Total profit": "Beneficio total", "Transit time": "Tiempo de viaje",
  // ===================== 💹 LIVE TRADING =====================
  "Long": "Largo", "Short": "Corto", "Bitcoin": "Bitcoin", "Ethereum": "Ethereum", "Solana": "Solana", "Live trading": "Trading en vivo",
  "● Connecting… trading paused": "● Conectando… trading en pausa", "no liquidation": "sin liquidación",
  "Trade real Bitcoin, Ethereum and Solana prices with Long / Short positions and up to ×50 leverage.":
    "Opera con los precios reales de Bitcoin, Ethereum y Solana con posiciones largas / cortas y hasta ×50 de apalancamiento.",
  "Open positions": "Posiciones abiertas", "Recent trades": "Operaciones recientes", "Liquidated": "Liquidada", "Close": "Cerrar",
  // ===================== 🚚 LOGISTICS =====================
  "4 contract offers": "4 ofertas de contrato", "Breakdowns": "Averías", "Express contracts": "Contratos exprés", "LONG HAUL": "LARGA DISTANCIA",
  "Wide-body cargo plane": "Avión de carga de fuselaje ancho", "Aframax crude oil tanker": "Petrolero de crudo Aframax", "Semi-truck": "Camión articulado",
  "Truck": "Camión", "Tanker": "Petrolero", "Plane": "Avión", "Agent": "Agente", "OFF": "NO", "ON": "SÍ",
  "at the depot · choose a contract": "en el depósito · elige un contrato", "in port · choose a contract": "en puerto · elige un contrato",
  "at the airport · choose a contract": "en el aeropuerto · elige un contrato", "Keep delivering to unlock more.": "Sigue entregando para desbloquear más.",
  "The agent picks a random contract 5 seconds after the offers appear. Fee: 2% of the contract, paid from your money.":
    "El agente elige un contrato al azar 5 segundos después de que aparezcan las ofertas. Comisión: 2% del contrato, de tu dinero.",
  "Hover (or tap) a vehicle or city. Dots = contract cities in the fleet's color (🟠 trucks, 🔵 tankers, 🟣 planes); a glowing ring = a vehicle is on its way there. Gray ring on a vehicle = waiting, red = broken down.":
    "Pasa el ratón (o toca) por un vehículo o una ciudad. Puntos = ciudades de contrato con el color de la flota (🟠 camiones, 🔵 petroleros, 🟣 aviones); un anillo brillante = un vehículo va hacia allí. Anillo gris en un vehículo = esperando, rojo = averiado.",
  "Logistics unlocked! Buy trucks and deliver contracts around the world.": "¡Logística desbloqueada! Compra camiones y entrega contratos por todo el mundo.",
  "A truck is broken down: repair it in 🚢 Logistics": "Un camión está averiado: repáralo en 🚢 Logística",
  "Repair": "Reparar", "Broken down": "Averiado", "All agents unlocked": "Todos los agentes desbloqueados",
});

H("The safest, slowest investment. Gold moves together with the stock market, every 10 seconds: 24% chance of +0.4%, 41% chance of +0.2%, 35% chance of −0.15%. That is about <b>+50–60% per hour</b>, and it almost never loses over a few minutes. Min. 1,000. <b>No cash-out fee</b>. After you sell gold, you have to wait <b>5 minutes</b> before selling again.",
  "La inversión más segura y más lenta. El oro se mueve a la vez que la bolsa, cada 10 segundos: 24% de probabilidad de +0,4%, 41% de +0,2% y 35% de −0,15%. Son unos <b>+50–60% por hora</b>, y casi nunca pierde en unos pocos minutos. Mín. 1.000. <b>Sin comisión de retirada</b>. Después de vender oro tienes que esperar <b>5 minutos</b> para volver a vender.");
H("Only for owners of a Brokerage Firm. Works like the normal ETF, with better wins: every 10 seconds, 1 in 10 chance of −4%, 1 in 10 chance of +5%, otherwise 50/50 between +2% and −1%. <b>No cash-out fee.</b> One slot: you invest once (min. 1,000, max. 10,000,000), and cash out everything before investing again. Your investment can still grow past 10M. It grows up to <b>10 gcoin</b> at most. Turn on 🔁 Auto cash-out to cash out at the cap and invest 10,000,000 again on its own.",
  "Solo para propietarios de una Agencia de valores. Funciona como el ETF normal, con mejores subidas: cada 10 segundos, 1 entre 10 de −4%, 1 entre 10 de +5%; si no, 50/50 entre +2% y −1%. <b>Sin comisión de retirada.</b> Una sola plaza: inviertes una vez (mín. 1.000, máx. 10.000.000) y lo retiras todo antes de volver a invertir. Tu inversión puede seguir creciendo por encima de 10 M. Crece hasta <b>10 gcoin</b> como máximo. Activa 🔁 Retirada automática para retirarlo al llegar al tope y volver a invertir 10.000.000 solo.");
H("Trade <b>Bitcoin, Ethereum and Solana at their real, live prices</b> (1 US dollar = 1 bcoin), streamed every second from Binance (or Coinbase if Binance isn't reachable). Prices move with the real market, 24/7, up or down. <br><br><b>Positions:</b> every trade opens its own position. <b>Long</b> earns when the price goes up, <b>Short</b> when it goes down. <b>Leverage ×20 / ×50</b> multiplies your profit and loss: at ×50, a 1% price move changes your position by 50%. If the price moves 1/leverage against you (5% at ×20, 2% at ×50; 100% up for a ×1 Short) the position is <b>liquidated</b> and you lose the money you put in. Liquidations are checked while the game is open. <br><br><b>Fee:</b> 2% of the money you put in when you open and of what you get back when you close, 0.1% less for every 10 Investor levels (level 10, 20, 30…). At Investor level 99 trading is free. <br><b>XP:</b> every trade gives Investor XP based on its size (1,000 → 1 XP, 1 scoin → 4 XP, 1 gcoin → 10 XP), at most once a minute. Coins you hold also count as invested money for the per-minute Investor XP. Min. trade 1,000. Trading pauses if the live prices stop. <br><br><b>⏳ Limit orders:</b> open a position only when the price reaches your limit: a Long when the price drops to it, a Short when it rises to it. The money is set aside until then (Cancel gives it back). At most 10 orders. <b>🎯 Take profit / 🛑 Stop loss:</b> a position closes by itself when its profit or loss (after the closing fee) reaches the % of the money you put in that you chose. Set them when opening, or later with ✏️. Orders, take profit and stop loss are checked while the game is open (also in a background tab).",
  "Opera con <b>Bitcoin, Ethereum y Solana a sus precios reales en directo</b> (1 dólar estadounidense = 1 bcoin), actualizados cada segundo desde Binance (o Coinbase si Binance no responde). Los precios se mueven con el mercado real, 24/7, al alza o a la baja. <br><br><b>Posiciones:</b> cada operación abre su propia posición. <b>Largo</b> gana cuando el precio sube; <b>Corto</b>, cuando baja. <b>Apalancamiento ×20 / ×50</b> multiplica tus ganancias y pérdidas: a ×50, un movimiento del 1% cambia tu posición un 50%. Si el precio se mueve 1/apalancamiento en tu contra (5% a ×20, 2% a ×50; una subida del 100% en un Corto ×1), la posición queda <b>liquidada</b> y pierdes el dinero que pusiste. Las liquidaciones se comprueban mientras el juego está abierto. <br><br><b>Comisión:</b> 2% del dinero que pones al abrir y de lo que recibes al cerrar, un 0,1% menos por cada 10 niveles de inversor (nivel 10, 20, 30…). En el nivel de inversor 99 operar es gratis. <br><b>XP:</b> cada operación da XP de inversor según su tamaño (1.000 → 1 XP, 1 scoin → 4 XP, 1 gcoin → 10 XP), como mucho una vez por minuto. Las monedas que tienes también cuentan como dinero invertido para la XP de inversor por minuto. Operación mínima: 1.000. El trading se pausa si se detienen los precios en directo. <br><br><b>⏳ Órdenes límite:</b> abren una posición solo cuando el precio llega a tu límite: un largo cuando el precio baja hasta él, un corto cuando sube hasta él. El dinero queda apartado hasta entonces (Cancelar lo devuelve). Máximo 10 órdenes. <b>🎯 Toma de beneficios / 🛑 Stop loss:</b> una posición se cierra sola cuando su beneficio o pérdida (tras la comisión de cierre) llega al % del dinero que pusiste que hayas elegido. Fíjalos al abrir o después con ✏️. Las órdenes, la toma de beneficios y el stop loss se comprueban con el juego abierto (también en una pestaña en segundo plano).");
H("Buy a semi-truck (150,000) for one of your 15 slots. Each free truck gets <b>4 contract offers</b> on roads around the world: pick one and it drives. When it arrives, the whole contract is paid to your money. Longer routes pay more per second. A truck earns back its price in about 1.5 hours. Trips keep moving while the game is closed. <br><br>{i}<b>Breakdowns:</b> after each delivery there is a 1 in 100 chance the truck breaks down. It can't take new contracts until you pay for repairs (500 – 5,000). <br><br>{i}<b>Logistics agent</b> (unlocks at Logistics level 5): turn it on and it picks a random contract for any waiting truck 5 seconds after the offers appear. It charges 2% of that contract's profit, taken from your money the moment it picks. It waits if you can't afford the fee.",
  "Compra un camión articulado (150.000) para una de tus 15 plazas. Cada camión libre recibe <b>4 ofertas de contrato</b> por carreteras de todo el mundo: elige una y se pone en marcha. Al llegar, el contrato entero se paga a tu dinero. Las rutas más largas pagan más por segundo. Un camión recupera su precio en cerca de 1,5 horas. Los viajes siguen avanzando con el juego cerrado. <br><br>{i}<b>Averías:</b> tras cada entrega hay 1 probabilidad entre 100 de que el camión se averíe. No puede aceptar contratos hasta que pagues la reparación (500 – 5.000). <br><br>{i}<b>Agente logístico</b> (se desbloquea en el nivel de logística 5): actívalo y elegirá un contrato al azar para cualquier camión que espere, 5 segundos después de que aparezcan las ofertas. Cobra el 2% del beneficio de ese contrato, que se descuenta de tu dinero en el momento de elegir. Espera si no puedes pagar la comisión.");
H("Buy an <b>Aframax</b> tanker (75 scoin) for one of your 10 slots. Each free tanker gets <b>4 contract offers</b>: pick one and the tanker sails. When it arrives, the whole contract is paid to your money. Then it gets 4 new offers. Longer routes pay more per second, and the two ocean crossings pay the most. A tanker earns back its price in about 3 hours. Voyages keep moving while the game is closed. <br><br>{i}<b>Logistics agent</b> (unlocks at Logistics level 25): turn it on and it picks a random contract for any waiting tanker 5 seconds after the offers appear. It charges 2% of that contract's profit, taken from your money the moment it picks. It waits if you can't afford the fee.",
  "Compra un petrolero <b>Aframax</b> (75 scoin) para una de tus 10 plazas. Cada petrolero libre recibe <b>4 ofertas de contrato</b>: elige una y zarpa. Al llegar, el contrato entero se paga a tu dinero y recibe 4 ofertas nuevas. Las rutas más largas pagan más por segundo, y las dos travesías oceánicas son las que más pagan. Un petrolero recupera su precio en unas 3 horas. Las travesías siguen avanzando con el juego cerrado. <br><br>{i}<b>Agente logístico</b> (se desbloquea en el nivel de logística 25): actívalo y elegirá un contrato al azar para cualquier petrolero que espere, 5 segundos después de que aparezcan las ofertas. Cobra el 2% del beneficio de ese contrato, que se descuenta de tu dinero en el momento de elegir. Espera si no puedes pagar la comisión.");
H("Buy a <b>cargo plane</b> (250 scoin) for one of your 5 slots. Unlocks when you own 3 oil tankers. Flights are short (2 – 8 minutes) and pay about <b>125 scoin per hour</b> while flying, so a plane earns back its price in about 2 hours if you keep it busy. Each free plane gets 4 contract offers. <br><br>{i}<b>Express contracts:</b> sometimes one offer is an express job: 40% faster and 25% more per second, but it disappears after 30 seconds if you don't take it. <br><br>{i}<b>Logistics agent</b> (unlocks at Logistics level 50): picks a random contract 5 seconds after the offers appear, for 2% of that contract's profit.",
  "Compra un <b>avión de carga</b> (250 scoin) para una de tus 5 plazas. Se desbloquea cuando tienes 3 petroleros. Los vuelos son cortos (2 – 8 minutos) y pagan unos <b>125 scoin por hora</b> en vuelo, así que un avión recupera su precio en unas 2 horas si lo mantienes ocupado. Cada avión libre recibe 4 ofertas de contrato. <br><br>{i}<b>Contratos exprés:</b> a veces una oferta es un encargo exprés: un 40% más rápido y un 25% más por segundo, pero desaparece a los 30 segundos si no lo aceptas. <br><br>{i}<b>Agente logístico</b> (se desbloquea en el nivel de logística 50): elige un contrato al azar 5 segundos después de que aparezcan las ofertas, por el 2% del beneficio de ese contrato.");
// the same rule texts when they are cut into pieces (text next to icons)
Object.assign(ES, {
  "Buy a semi-truck (150,000) for one of your 15 slots. Each free truck gets": "Compra un camión articulado (150.000) para una de tus 15 plazas. Cada camión libre recibe",
  "Buy an": "Compra un", "Aframax": "Aframax", "cargo plane": "avión de carga", "liquidated": "liquidada", "+50–60% per hour": "+50–60% por hora",
  "No cash-out fee": "Sin comisión de retirada", "No cash-out fee.": "Sin comisión de retirada.", "5 minutes": "5 minutos", "125 scoin per hour": "125 scoin por hora",
  "Bitcoin, Ethereum and Solana at their real, live prices": "Bitcoin, Ethereum y Solana a sus precios reales en directo", "Trade": "Opera con",
  "Leverage ×20 / ×50": "Apalancamiento ×20 / ×50",
});

/* ---------- casino: text with numbers ---------- */
rx(String.raw`You won (${NUM})!`, "¡Has ganado $1!");
rx(String.raw`You lost (${NUM})\.`, "Has perdido $1.");
rx(String.raw`Cashback \+([\d.,]+)\.`, "Reembolso +$1.");
rx(String.raw`Now level (\d+)\.`, "Ahora eres nivel $1.");
rx(String.raw`Spin \(bet (${NUM})\)`, "Girar (apuesta $1)");
rx(String.raw`Deal \(bet (${NUM})\)`, "Repartir (apuesta $1)");
rx(String.raw`Repeat last bets \((${NUM})\)`, "Repetir últimas apuestas ($1)");
rx(String.raw`total bet (${NUM})`, "apuesta total $1");
rx(String.raw`Bet (${NUM})`, "Apuesta $1");
rx(String.raw`Bet (${NUM}) \(doubled\)`, "Apuesta $1 (doblada)");
rx(String.raw`Limits per spot: (${NUM}) – (${NUM})`, "Límites por casilla: $1 – $2");
rx(String.raw`Table limit: max (${NUM}) on one spot\.`, "Límite de la mesa: máx. $1 en una casilla.");
rx(String.raw`Not enough (chips|VIP coins)\.`, (m, p) => `No tienes suficientes ${ES[p]}.`);
rx(String.raw`Not enough (chips|VIP coins) to repeat \((${NUM}) needed\)\.`, (m, p, n) => `No tienes suficientes ${ES[p]} para repetir (hacen falta ${n}).`);
rx(String.raw`Not enough (chips|VIP coins) \(Ante \+ Blind = (${NUM})\)\.`, (m, p, n) => `No tienes suficientes ${ES[p]} (ante + ciega = ${n}).`);
rx(String.raw`Not enough (chips|VIP coins) for that raise \((${NUM})\)\.`, (m, p, n) => `No tienes suficientes ${ES[p]} para esa subida (${n}).`);
const BETNAME = { Split: "Caballo", Street: "Transversal", Corner: "Cuadro", "Six line": "Seisena", "First four": "Primeros cuatro", Trio: "Trío" };
rx(String.raw`(Split|Street|Corner|Six line|First four|Trio) ([\d-]+) · pays (\d+:1)`, (m, k, n, p) => `${BETNAME[k]} ${n} · paga ${p}`);
rx(String.raw`(.+) · pays (\d+:1)`, (m, a, p) => { const x = esq(a); return x == null ? null : `${x} · paga ${p}`; });
rx(String.raw`Limits per hand: (${NUM}) – (${NUM}) · Blackjack pays 3:2 · Dealer stands on 17`, "Límites por mano: $1 – $2 · El blackjack paga 3:2 · La banca se planta con 17");
rx(String.raw`Insurance paid (${NUM})!`, "¡El seguro paga $1!");
rx(String.raw`Insurance lost \((${NUM})\)\.`, "Seguro perdido ($1).");
rx(String.raw`Take insurance \((${NUM})\)`, "Asegurar ($1)");
rx(String.raw`Seat (\d) · (.+)`, (m, n, s) => { const x = esq(s); return x == null ? null : `Asiento ${n} · ${x}`; });
rx(String.raw`Jacks or Better with 1 joker \(53 cards\) · Bets (${NUM}) – (${NUM})`, "Jotas o más con 1 comodín (53 cartas) · Apuestas $1 – $2");
rx(String.raw`(${NUM}) \((\d+)% jackpot\)`, "$1 ($2% del bote)");
rx(String.raw`Royal Flush wins 100% · any Straight Flush wins 20% · paid on top of the normal win\. Your bet of (${NUM}) wins (\d+%) of it( \(bet the max to win all of it\))?\.`,
  (m, b, p, x) => `La escalera real gana el 100% · cualquier escalera de color gana el 20% · se paga además del premio normal. Tu apuesta de ${b} gana el ${p}${x ? " (apuesta el máximo para ganarlo entero)" : ""}.`);
rx(String.raw`Royal Flush wins 100% · any Straight Flush wins 20% · paid on top of the normal win\. Your share = your bet ÷ max bet\.`,
  "La escalera real gana el 100% · cualquier escalera de color gana el 20% · se paga además del premio normal. Tu parte = tu apuesta ÷ apuesta máxima.");
rx(String.raw`Click chips to add to your bet \((${NUM}) – (${NUM})\)\.`, "Haz clic en las fichas para sumarlas a tu apuesta ($1 – $2).");
rx(String.raw`Click chips to add to your bet \(max (${NUM})\)\.`, "Haz clic en las fichas para sumarlas a tu apuesta (máx. $1).");
rx(String.raw`(?:💰 )?JACKPOT \+(${NUM})!`, "💰 BOTE +$1!");
rx(String.raw`(Royal Flush|Straight Flush|Four of a Kind|Full House|Flush|Straight|Three of a Kind|Two Pair|Jacks or Better|Five of a Kind|Wild Royal Flush|Pair)!`, (m, h) => `¡${ES[h]}!`);
rx(String.raw`Ante (${NUM}) – (${NUM}) per seat · Blind = Ante · Trips optional \(up to (${NUM})\) · Play 1 or 2 seats`, "Ante $1 – $2 por asiento · Ciega = ante · Trips opcional (hasta $3) · Juega 1 o 2 asientos");
rx(String.raw`Raise (\d)× \((${NUM})\)`, "Subir $1× ($2)");
rx(String.raw`Folded · (${NUM})`, "Retirado · $1");
const HAND_ES = (h) => ES[h] || h;
rx(String.raw`Dealer has (.+?)( \(doesn't qualify, so Antes push\))?\.`, (m, h, q) => `La banca tiene ${HAND_ES(h)}${q ? " (no califica, así que los antes empatan)" : ""}.`);
rx(String.raw`Bet on the hand that gets closest to 9 · (${NUM}) – (${NUM}) per spot · 8-deck shoe`, "Apuesta a la mano que más se acerque a 9 · $1 – $2 por casilla · zapato de 8 barajas");
rx(String.raw`(Player|Banker) wins (\d) to (\d)( \(natural\))?(\.?)`, (m, w, a, b, n, d) => `Gana ${w === "Player" ? "el Jugador" : "la Banca"} ${a} a ${b}${n ? " (natural)" : ""}${d}`);
rx(String.raw`Tie at (\d)( \(natural\))?(\.?)`, (m, a, n, d) => `Empate a ${a}${n ? " (natural)" : ""}${d}`);
rx(String.raw`Put at least (${NUM}) on Player, Banker or Tie\.`, "Pon al menos $1 en Jugador, Banca o Empate.");
rx(String.raw`Limits per spot: (${NUM}) – (${NUM}) · Pairs pay 11:1 · Tie pays 8:1`, "Límites por casilla: $1 – $2 · Las parejas pagan 11:1 · El empate paga 8:1");
rx(String.raw`Bet (${NUM}) – (${NUM}) per ball · drop up to 20 balls at once · 12 rows · 0\.3× to 250×`, "Apuesta $1 – $2 por bola · lanza hasta 20 bolas a la vez · 12 filas · de 0,3× a 250×");
rx(String.raw`Drop ball \((${NUM})\)`, "Lanzar bola ($1)");
rx(String.raw`Drop (\d+) balls \((${NUM})\)`, "Lanzar $1 bolas ($2)");
rx(String.raw`(\d+) in the air`, "$1 en el aire");
rx(String.raw`Paid (${NUM}) on (${NUM}) bet \((${NUM})\)\.`, "Pagado $1 por una apuesta de $2 ($3).");
rx(String.raw`Max (\d+) balls in the air at once \((\d+) still falling\)\.`, "Máximo $1 bolas en el aire a la vez ($2 aún cayendo).");
rx(String.raw`Bet per ball must be (${NUM}) – (${NUM})\.`, "La apuesta por bola debe ser de $1 – $2.");
rx(String.raw`(\d+) Plinko balls? still in the air landed: \+(${NUM})\.`, "Han caído $1 bolas de Plinko que seguían en el aire: +$2.");
rx(String.raw`Bet (${NUM}) – (${NUM}) · 19 green, 8 red, 1 gold ball · balls are not put back`, "Apuesta $1 – $2 · 19 bolas verdes, 8 rojas y 1 dorada · las bolas no se devuelven");
rx(String.raw`Next ball climbs: ([\d.,]+%)`, (m, p) => `La siguiente bola sube: ${decFix(p)}`);
rx(String.raw`Red: ([\d.,]+%)`, (m, p) => `Roja: ${decFix(p)}`);
rx(String.raw`Step (\d+) of 20 · ([\d.,]+)× on (${NUM})(.*)`, (m, s, x, b, rest) => `Peldaño ${s} de 20 · ${x}× sobre ${b}${rest ? (esq(rest) ?? rest) : ""}`);
rx(String.raw`banked (${NUM})`, "guardado $1");
rx(String.raw`Red ball! Your balloon popped and you lost (${NUM})\.`, "¡Bola roja! Tu globo ha explotado y has perdido $1.");
rx(String.raw`You kept the (${NUM}) you banked\.`, "Conservas los $1 que guardaste.");
rx(String.raw`Cashed out (${NUM}) at ([\d.,]+)×\.`, "Has retirado $1 a $2×.");
rx(String.raw`(${NUM}) at ([\d.,]+)×\.`, "$1 a $2×.");
rx(String.raw`Total with banked half: (${NUM})\.`, "Total con la mitad guardada: $1.");
rx(String.raw`Banked (${NUM})\.`, "Has guardado $1.");
rx(String.raw`Clusters of 5\+ touching specimens pay · Bet (${NUM}) – (${NUM}) per spin · Max win 5000× your bet`, "Pagan los grupos de 5 o más especímenes juntos · Apuesta $1 – $2 por tirada · Premio máximo 5000× tu apuesta");
rx(String.raw`Start the free spins at once for ([\d.,]+)× your bet`, (m, x) => `Empieza ya las tiradas gratis por ${decFix(x)}× tu apuesta`);
rx(String.raw`(${NUM}) · ([\d.,]+)× bet`, (m, a, x) => `${a} · ${decFix(x)}× la apuesta`);
rx(String.raw`Bets here are (${NUM}) – (${NUM})\.`, "Aquí las apuestas son de $1 – $2.");
rx(String.raw`Not enough chips( to buy the bonus)?\. Add money to the casino first\.`, (m, b) => `No tienes suficientes fichas${b ? " para comprar el bono" : ""}. Primero añade dinero al casino.`);
rx(String.raw`(\d+) DNA vials! (\d+) FREE SPINS`, "¡$1 viales de ADN! $2 TIRADAS GRATIS");
rx(String.raw`Bonus bought: (\d+) DNA vials! (\d+) FREE SPINS`, "Bono comprado: ¡$1 viales de ADN! $2 TIRADAS GRATIS");
rx(String.raw`\+(\d+) FREE SPINS`, "+$1 TIRADAS GRATIS");
rx(String.raw`Free spin (\d+) of (\d+)`, "Tirada gratis $1 de $2");
rx(String.raw`MAX WIN ([\d.,]+)×!`, "¡PREMIO MÁXIMO $1×!");
rx(String.raw`MEGA WIN (${NUM})!`, "¡MEGAPREMIO $1!");
rx(String.raw`BIG WIN (${NUM})!`, "¡GRAN PREMIO $1!");
rx(String.raw`You won (${NUM}) \(([\d.,]+)× your bet\)( with (\d+) free spins)?\.`, (m, w, x, f, n) => `Has ganado ${w} (${decFix(x)}× tu apuesta)${f ? ` con ${n} tiradas gratis` : ""}.`);
rx(String.raw`Bought bonus \((${NUM})\): it paid (${NUM}) \(([\d.,]+)× your bet, (\d+) free spins\), (${NUM}) overall\.`,
  (m, c, w, x, n, o) => `Bono comprado (${c}): ha pagado ${w} (${decFix(x)}× tu apuesta, ${n} tiradas gratis), ${o} en total.`);
rx(String.raw`Your Gene Cascade spin finished: you won (${NUM})( \(with (\d+) free spins\))?\.`, (m, w, f, n) => `Tu tirada de Gene Cascade ha terminado: has ganado ${w}${f ? ` (con ${n} tiradas gratis)` : ""}.`);
rx(String.raw`Your (Blackjack|Ultimate Texas Hold'em) hand is still in play: it's waiting for you in the 🎰 Casino\.`, (m, g) => `Tu mano de ${g} sigue en juego: te espera en el 🎰 Casino.`);
rx(String.raw`Your baccarat hand finished: (.+?)\.`, (m, w) => `Tu mano de baccarat ha terminado: ${esq(w) ?? w}.`);
rx(String.raw`Your roulette spin finished: (\d+)\.`, "Tu tirada de ruleta ha terminado: $1.");
rx(String.raw`Unlocks at Gambler level (\d+) \(you are level (\d+)\)`, "Se desbloquea en el nivel de jugador $1 (eres nivel $2)");
rx(String.raw`Unlocks after your 1st prestige and at Gambler level (\d+) \((prestige ✓|no prestige yet) · you are level (\d+)\)`,
  (m, l, p, y) => `Se desbloquea tras tu 1.er prestigio y en el nivel de jugador ${l} (${p === "prestige ✓" ? "prestigio ✓" : "aún sin prestigio"} · eres nivel ${y})`);
rx(String.raw`Hot Tables: (.+) gets \+(\d+) XP multiplier for 10 minutes!`, (m, g, n) => `Mesas calientes: ¡${es(g)} recibe +${n} al multiplicador de XP durante 10 minutos!`);
hrx(String.raw`(✨ XP ×\d+) <span>🔥 HOT<\/span>`, "$1 <span>🔥 CALIENTE</span>");
hrx(String.raw`(🔬|\{i\}) <b>Lab spots<\/b>: a square where a winner popped is marked\. The next win popping there makes it ×2, then ×4, ×8 … up to ×128\. All spots inside one cluster are <b>added<\/b> and multiply that cluster's pay\.`,
  "$1 <b>Casillas de laboratorio</b>: la casilla donde explota un ganador queda marcada. El siguiente premio que explote allí la convierte en ×2, luego ×4, ×8 … hasta ×128. Todas las casillas de un grupo <b>se suman</b> y multiplican el premio de ese grupo.");
hrx(String.raw`(\{i\}|🧪) <b>DNA vials<\/b>: 3 \/ 4 \/ 5 \/ 6 \/ 7 vials on the grid when the spin ends give 10 \/ 12 \/ 15 \/ 20 \/ 30 free spins \(more can be won during the bonus\)\.`,
  "$1 <b>Viales de ADN</b>: 3 / 4 / 5 / 6 / 7 viales en la cuadrícula al terminar la tirada dan 10 / 12 / 15 / 20 / 30 tiradas gratis (durante el bono se pueden ganar más).");
hrx(String.raw`(🛒|\{i\}) <b>Buy free spins<\/b> for ([\d.,]+)× your bet: the bonus starts at once \(3 vials or more, mostly 10 free spins\)\. A bought bonus also returns about 99%, but it swings a lot: half of them pay less than 15× the bet\.`,
  (m, i, x) => `${i} <b>Compra tiradas gratis</b> por ${decFix(x)}× tu apuesta: el bono empieza enseguida (3 viales o más, casi siempre 10 tiradas gratis). Un bono comprado también devuelve cerca del 99%, pero varía mucho: la mitad pagan menos de 15× la apuesta.`);

/* ---------- investing / live trading / logistics: text with numbers ---------- */
hrx(String.raw`(\d+) (property|properties) · total value <b>(${NUM})<\/b> · next rent (\d+:\d\d) \(\+(${NUM})\) · (\d+) \/ (\d+) can be sold`,
  (m, n, w, v, t, r, a, b) => `${n} ${plural(n, "inmueble", "inmuebles")} · valor total <b>${v}</b> · próximo alquiler ${t} (+${r}) · se ${plural(a, "puede", "pueden")} vender ${a} / ${b}`);
rx(String.raw`Property (\d+) · value`, "Inmueble $1 · valor");
rx(String.raw`(\d+) (property|properties) · total value`, (m, n) => `${n} ${plural(n, "inmueble", "inmuebles")} · valor total`);
rx(String.raw`next rent (\d+:\d\d) \(\+(${NUM})\) · (\d+) \/ (\d+) can be sold`, "próximo alquiler $1 (+$2) · se pueden vender $3 / $4");
rx(String.raw`after ([\d.,]+%) cash-out fee: (${NUM})`, (m, p, v) => `tras la comisión de retirada del ${decFix(p)}: ${v}`);
rx(String.raw`You get (${NUM}) after the ([\d.,]+%) fee`, (m, v, p) => `Recibes ${v} tras la comisión del ${decFix(p)}`);
rx(String.raw`Bought a property for (${NUM})\.`, "Has comprado un inmueble por $1.");
rx(String.raw`Invested (${NUM}) in the ETF\.`, "Has invertido $1 en el ETF.");
rx(String.raw`Invested (${NUM}) in the Broker ETF\.`, "Has invertido $1 en el ETF del bróker.");
rx(String.raw`Bought (${NUM}) of gold\.`, "Has comprado $1 de oro.");
rx(String.raw`Rent paid: \+(${NUM})`, "Alquiler cobrado: +$1");
rx(String.raw`Cashed out (${NUM}) \(fee (${NUM})\): \+(${NUM}) to your money\.`, "Has retirado $1 (comisión $2): +$3 a tu dinero.");
rx(String.raw`Sold (?:a|the) property for (${NUM})\.?(.*)`, (m, v, rest) => `Has vendido el inmueble por ${v}.${rest ? " " + (esq(rest.trim()) ?? rest.trim()) : ""}`);
rx(String.raw`Agency bonus \+(${NUM})\.`, "Bonificación de la agencia +$1.");
rx(String.raw`Investor level \+(${NUM})\.`, "Nivel de inversor +$1.");
rx(String.raw`Real estate lawyers? \+(${NUM})\.`, "Abogados inmobiliarios +$1.");
rx(String.raw`Investor level up! Now level (\d+)\.?`, "¡Subes de nivel de inversor! Ahora eres nivel $1.");
rx(String.raw`REAL ESTATE CRASH! Your properties lost (${NUM})(.*)`, (m, v, r) => `¡DESPLOME INMOBILIARIO! Tus inmuebles han perdido ${v}${r}`);
rx(String.raw`Real estate \((\d+)\)`, "Inmuebles ($1)");
rx(String.raw`(${NUM}) from the Broker ETF \(no fee\)\.`, "$1 del ETF del bróker (sin comisión).");
rx(String.raw`Trading fee: ([\d.,]+%) when you open and when you close \(Investor level (\d+); next −0\.1% at level (\d+)\)`,
  (m, f, l, n) => `Comisión de trading: ${decFix(f)} al abrir y al cerrar (nivel de inversor ${l}; siguiente −0,1% en el nivel ${n})`);
rx(String.raw`Trading fee: ([\d.,]+%) when you open and when you close \(Investor level 99: free!\)`, (m, f) => `Comisión de trading: ${decFix(f)} al abrir y al cerrar (nivel de inversor 99: ¡gratis!)`);
rx(String.raw`The price reached (.+)\. You lost the (${NUM}) you put in\.`, "El precio ha llegado a $1. Has perdido los $2 que pusiste.");
rx(String.raw`● Live from (Binance|Coinbase)`, "● En directo desde $1");
rx(String.raw`Unlocks at Investor level (\d+) \(you are level (\d+)\)\.?`, "Se desbloquea en el nivel de inversor $1 (eres nivel $2).");
rx(String.raw`Unlocks at Investor level (\d+)`, "Se desbloquea en el nivel de inversor $1");
// logistics
hrx(String.raw`(<span>\{i\}Best per sec<\/span> )?<b>([^<]+)<\/b> \{i\}Total profit: <b>(${NUM})<\/b><br> \{i\}Transit time: <b>([^<]+)<\/b><br> <span>≈ (${NUM}) \/ sec<\/span>( <span>LONG HAUL<\/span>| <span>EXPRESS[^<]*<\/span>)?`,
  (m, bst, r, p, t, s, x) => `${bst ? "<span>{i}Mejor por segundo</span> " : ""}<b>${routeEs(r)}</b> {i}Beneficio total: <b>${p}</b><br> {i}Tiempo de viaje: <b>${t}</b><br> <span>≈ ${s} / s</span>${x ? (/LONG/.test(x) ? " <span>LARGA DISTANCIA</span>" : " <span>" + (esq(x.replace(/<\/?span>/g, "").trim()) ?? x.replace(/<\/?span>/g, "").trim()) + "</span>") : ""}`);
rx(String.raw`≈ (${NUM}) \/ sec`, "≈ $1 / s");
rx(String.raw`\+(${NUM}) on arrival`, "+$1 al llegar");
rx(String.raw`Transit (\d[\dhm: ]*)`, "Viaje $1");
rx(String.raw`(\d+)\/(\d+) on the move`, "$1/$2 en ruta");
rx(String.raw`Truck (\d+)`, "Camión $1");
rx(String.raw`Bought (.+)! Choose its first contract\.`, (m, v) => `¡Has comprado ${es(v)}! Elige su primer contrato.`);
rx(String.raw`(.+) repaired for (${NUM})\. It's ready for contracts\.`, (m, v, c) => `${es(v)}, reparado por ${c}. Ya puede aceptar contratos.`);
rx(String.raw`Agent sent (.+) to (.+) \(fee (${NUM})\)`, (m, v, c, f) => `El agente ha enviado ${es(v)} a ${CITY_ES[c] || c} (comisión ${f})`);
rx(String.raw`Agent picks a contract in (\d+)s`, "El agente elige un contrato en $1 s");
rx(String.raw`Agent is waiting: needs (${NUM}) for the fee`, "El agente espera: necesita $1 para la comisión");
rx(String.raw`(Truck|Tanker|Plane) agent unlocks at level (\d+)`, (m, f, l) => `El agente de ${{ Truck: "camiones", Tanker: "petroleros", Plane: "aviones" }[f]} se desbloquea en el nivel ${l}`);
rx(String.raw`Logistics level (\d+)!`, "¡Nivel de logística $1!");
rx(String.raw`Unlocked: 🤖 Logistics agent for (.+)\.`, (m, l) => `Desbloqueado: 🤖 agente logístico para ${l.replace(/trucks/, "camiones").replace(/tankers/, "petroleros").replace(/planes/, "aviones").replace(/ and /, " y ")}.`);
rx(String.raw`Broken down in (.+)`, (m, c) => `Averiado en ${cityEs(c)}`);
rx(String.raw`Waiting for a contract in (.+)`, (m, c) => `Esperando contrato en ${cityEs(c)}`);
rx(String.raw`Repair: (${NUM})`, "Reparación: $1");
rx(String.raw`Repair for (${NUM})`, "Reparar por $1");
rx(String.raw`Broken down · repair for (${NUM})`, "Averiado · reparación por $1");

/* ===================== 🎮 MINI-GAMES ===================== */
Object.assign(ES, {
  // hub
  "Unlock mini-games with your buildings and achievements, then play them to earn extra money.": "Desbloquea minijuegos con tus edificios y logros, y juega para ganar dinero extra.",
  "Copy paintings as closely as you can. Sell them or keep them in your collection.": "Copia cuadros lo más fielmente que puedas. Véndelos o guárdalos en tu colección.",
  "Dig 250 m deep for coal, copper, silver, gold, diamonds, rubies and treasure chests before your lamp runs out.": "Excava hasta 250 m en busca de carbón, cobre, plata, oro, diamantes, rubíes y cofres del tesoro antes de que se apague tu lámpara.",
  "Splice DNA samples into new species: from frogs and dolphins to dinosaurs, dragons and the kraken.": "Combina muestras de ADN para crear especies nuevas: de ranas y delfines a dinosaurios, dragones y el kraken.",
  "More coming soon": "Más próximamente", "New mini-games will unlock with other buildings.": "Se desbloquearán nuevos minijuegos con otros edificios.",
  "Gold Mine Dig": "Excavación en la mina de oro", "Gene Splicer": "Empalmador genético", "Art Gallery": "Galería de arte", "Art studio": "Estudio de arte",
  "View": "Ver", "▶ Play": "▶ Jugar", "Play": "Jugar", "Unlocks with the 💵 Millionaire achievement": "Se desbloquea con el logro 💵 Millonario",
  "🔒 Unlocks with the 💵 Millionaire achievement:": "🔒 Se desbloquea con el logro 💵 Millonario:",
  "Buy your first ⛏️ gold mine (💰 Income → ⭐ Special)": "Compra tu primera ⛏️ mina de oro (💰 Ingresos → ⭐ Especiales)",
  "Buy the 🧬 Genetics Laboratory (💰 Income → 🔬 Science)": "Compra el 🧬 Laboratorio de genética (💰 Ingresos → 🔬 Ciencia)",
  "Buy the 🧬 Genetics Laboratory in 🔬 Science first.": "Primero compra el 🧬 Laboratorio de genética en 🔬 Ciencia.",
  "New mini-game: Gene Splicer! Find it in 🎮 Mini-games.": "¡Nuevo minijuego: Empalmador genético! Lo tienes en 🎮 Minijuegos.",
  "run in progress": "partida en curso", "Open it for 500.000": "Ábrela por 500.000",
  // ---------- ⛏️ gold mine ----------
  "Coal": "Carbón", "Copper": "Cobre", "Silver": "Plata", "Diamond": "Diamante", "Ruby": "Rubí",
  "Up": "Arriba", "Left": "Izquierda", "Down": "Abajo", "Right": "Derecha", "Lamp": "Lámpara", "Depth": "Profundidad", "Layer": "Capa",
  "Deepest": "Máx. profundidad", "Bag": "Bolsa", "Worth": "Valor", "Surface": "Superficie", "Mine": "Mina", "Lava zone": "Zona de lava", "Crystal caves": "Cuevas de cristal",
  "full": "llena", "End run": "Terminar partida", "Upgrades": "Mejoras", "Upgrade": "Mejorar", "Max level": "Nivel máximo", "Less": "Menos", "More": "Más", "Max": "Máx.",
  "Dig down with the arrow keys (or the buttons). Come back up before your lamp runs out!": "Excava con las flechas (o los botones). ¡Vuelve a subir antes de que se apague la lámpara!",
  "Dig down into your gold mine and grab as much ore as your bag can hold. The deeper you go, the better the ore, but every step burns lamp oil. Back at the surface, sell your ore or keep it in your":
    "Excava en tu mina de oro y llévate todo el mineral que quepa en tu bolsa. Cuanto más bajas, mejor es el mineral, pero cada paso gasta aceite de la lámpara. De vuelta en la superficie, vende el mineral o guárdalo en tu",
  "Ore is worth seconds of your income (8–500 sec each, based on your business income over the last minute). 🔥 A gold rush in your mines doubles it.":
    "El mineral vale segundos de tus ingresos (8–500 s cada uno, según los ingresos de tus negocios en el último minuto). 🔥 Una fiebre del oro en tus minas lo duplica.",
  "Below": "Por debajo de", "the heat burns your lamp 25% faster, and 🔴 rubies appear. 📦 Below": "el calor gasta tu lámpara un 25% más rápido y aparecen 🔴 rubíes. 📦 Por debajo de",
  "are 1–2 treasure chests (5 bag slots each): bring them up yourself to open them. The rescue team leaves them behind.":
    "hay 1–2 cofres del tesoro (5 huecos de bolsa cada uno): súbelos tú mismo para abrirlos. El equipo de rescate los deja atrás.",
  "Sell vault ore": "Vender mineral de la cámara", "Mine lift": "Ascensor de la mina",
  "Single use. Takes you straight back to the surface with everything you carry, chests included.": "De un solo uso. Te sube directamente a la superficie con todo lo que llevas, cofres incluidos.",
  "Back to the surface with everything you carry": "Vuelve a la superficie con todo lo que llevas",
  "Each level costs money and ore from your": "Cada nivel cuesta dinero y mineral de tu", "vault. Keep ore after a run to save up for them.": "cámara. Guarda mineral tras cada partida para ahorrar para ellas.",
  "Bigger lamp": "Lámpara más grande", "Bigger bag": "Bolsa más grande", "Better pickaxe": "Pico mejor", "Mining boots": "Botas de minero",
  "Ore appraiser": "Tasador de mineral", "Energy tank": "Depósito de energía", "Fast recharge": "Recarga rápida", "Rescue insurance": "Seguro de rescate", "Heat suit": "Traje térmico",
  "normal ore value": "valor normal del mineral", "no protection": "sin protección",
  "survive one lava touch per run · half the burst splash · less heat next to lava": "sobrevives a un toque de lava por partida · la mitad de salpicadura · menos calor junto a la lava",
  "survive one lava touch · splash −5% · heat −2.5% per step · no extra lamp burn below 150 m": "sobrevives a un toque de lava · salpicadura −5% · calor −2,5% por paso · sin gasto extra de lámpara por debajo de 150 m",
  "stone 1 · granite 2 · −25% oil per dig": "piedra 1 · granito 2 · −25% de aceite por golpe",
  "You keep only part of your ore": "Solo conservas parte de tu mineral", "You keep only part of your ore and lose the chests": "Solo conservas parte de tu mineral y pierdes los cofres",
  "Ore from your last run: sell or keep": "Mineral de tu última partida: vender o guardar", "Rescued!": "¡Rescatado!", "Run complete!": "¡Partida completada!",
  "Burned by lava!": "¡Quemado por la lava!", "Deepest point": "Punto más profundo", "new record!": "¡nuevo récord!", "Keep in the vault": "Guardar en la cámara",
  "Ore in the vault pays for ⬆️ upgrades. You can also sell it later (without the 🔥 gold rush bonus).": "El mineral de la cámara paga las ⬆️ mejoras. También puedes venderlo más tarde (sin la bonificación de 🔥 fiebre del oro).",
  "Sell ore from your vault": "Vender mineral de tu cámara", "Choose how much of each ore to sell. Ore you keep pays for ⬆️ upgrades.": "Elige cuánto vendes de cada mineral. El que guardes paga las ⬆️ mejoras.",
  "Select everything": "Seleccionar todo", "Your vault is empty.": "Tu cámara está vacía.", "Clear": "Borrar",
  "Your lamp ran out underground. The rescue team brought you up with": "Tu lámpara se ha apagado bajo tierra. El equipo de rescate te ha subido con el",
  "The lava caught you. The emergency rescue brought you up with": "La lava te ha alcanzado. El rescate de emergencia te ha subido con el",
  "Treasure chest": "Cofre del tesoro", "Open treasure chest": "Abrir cofre del tesoro", "Open the chest": "Abrir el cofre",
  "You carried it all the way up. What's inside?": "Lo has subido hasta arriba. ¿Qué habrá dentro?", "Big prize": "Gran premio", "Good prize": "Buen premio", "Small prize": "Premio pequeño",
  "1 in 5,000! Your miners will talk about this for years.": "¡1 entre 5.000! Tus mineros hablarán de esto durante años.", "Next chest": "Siguiente cofre", "Continue to your ore": "Seguir con tu mineral",
  "Heat: the lamp burns 25% faster": "Calor: la lámpara se gasta un 25% más rápido", "Gold rush: ore ×2!": "Fiebre del oro: ¡mineral ×2!",
  "The lift brought you back to the surface!": "¡El ascensor te ha devuelto a la superficie!", "Bedrock: too hard to dig. Find another way.": "Roca madre: demasiado dura para excavar. Busca otro camino.",
  "Lava! Far too hot to cross. Find another way.": "¡Lava! Demasiado caliente para cruzarla. Busca otro camino.", "Your bag is full! Head back up.": "¡Tu bolsa está llena! Vuelve a subir.",
  "A treasure chest! Carry it to the surface to open it.": "¡Un cofre del tesoro! Llévalo a la superficie para abrirlo.",
  "Your heat suit saved you! The lava cooled down (once per run).": "¡Tu traje térmico te ha salvado! La lava se ha enfriado (una vez por partida).", "The lava got you!": "¡La lava te ha alcanzado!",
  "Burned by lava! The rescue team brought you up. You had no ore with you.": "¡Quemado por la lava! El equipo de rescate te ha subido. No llevabas mineral.",
  "Rescued! You had no ore with you.": "¡Rescatado! No llevabas mineral.",
  // ---------- 🎨 art gallery ----------
  "Original": "Original", "Your copy": "Tu copia", "Submit copy": "Entregar copia", "New painting": "Cuadro nuevo", "Easy": "Fácil", "Medium": "Media", "Hard": "Difícil",
  "Turn the shape: drag the slider or use the mouse wheel over the canvas (also right after drawing it)": "Gira la forma: arrastra el control o usa la rueda del ratón sobre el lienzo (también justo después de dibujarla)",
  "Paintings you kept. You can sell any of them later for its full value.": "Los cuadros que has guardado. Puedes vender cualquiera más tarde por su valor completo.",
  "Copy paintings as closely as you can: the better the match, the more they're worth. Sell your copies right away or keep them in your collection.":
    "Copia cuadros lo más fielmente que puedas: cuanto más se parezcan, más valen. Vende tus copias enseguida o guárdalas en tu colección.",
  "Open the gallery for 500.000": "Abre la galería por 500.000", "3–4 simple shapes": "3–4 formas sencillas",
  "Kid-style drawings: houses, flowers, trees, boats, cars, rockets, snowmen, rainbows, mushrooms, balloons, ice cream, castles, fish, butterflies":
    "Dibujos infantiles: casas, flores, árboles, barcos, coches, cohetes, muñecos de nieve, arcoíris, setas, globos, helados, castillos, peces, mariposas",
  "Detailed scenes with many colors: mountains, city, seaside, desert, winter, farm, underwater or space": "Escenas detalladas con muchos colores: montañas, ciudad, playa, desierto, invierno, granja, fondo marino o espacio",
  "Drag to move the last shape you drew; pick a color to recolor it (until you draw or paint something else)": "Arrastra para mover la última forma que dibujaste; elige un color para cambiárselo (hasta que dibujes o pintes otra cosa)",
  "Drag to draw a filled rectangle (hold Shift for a perfect square)": "Arrastra para dibujar un rectángulo relleno (mantén Mayús para un cuadrado perfecto)",
  "Drag to draw a filled oval (hold Shift for a perfect circle)": "Arrastra para dibujar un óvalo relleno (mantén Mayús para un círculo perfecto)",
  "Drag to draw a filled triangle; turn it with the ↻ slider or mouse wheel (180° = upside down)": "Arrastra para dibujar un triángulo relleno; gíralo con el control ↻ o la rueda del ratón (180° = boca abajo)",
  "Round brush": "Pincel redondo", "Square brush": "Pincel cuadrado", "Great copy! 👏": "¡Gran copia! 👏", "Keep practicing. 🖌️": "Sigue practicando. 🖌️",
  "Masterpiece! 🏆": "¡Obra maestra! 🏆", "Not bad. 🙂": "No está mal. 🙂", "Great copy!": "¡Gran copia!", "Keep practicing.": "Sigue practicando.", "Masterpiece!": "¡Obra maestra!", "Not bad.": "No está mal.",
  "Not close enough.": "No se parece lo suficiente.", "match": "parecido", "Sell": "Vender", "Keep": "Guardar", "Keep working on it": "Seguir trabajando",
  "Collection full: buy more slots": "Colección llena: compra más huecos", "Collection value:": "Valor de la colección:", "Collection value": "Valor de la colección",
  "Average match": "Parecido medio", "Colors": "Colores", "Layout": "Composición", "Shapes found": "Formas encontradas",
  "No paintings yet. Make a copy in the 🎨 Art studio and choose \"Keep\".": "Aún no hay cuadros. Haz una copia en el 🎨 Estudio de arte y elige «Guardar».",
  "The Art Gallery is open!": "¡La Galería de arte está abierta!",
  "Draw a shape first (⬛ Square, ⚫ Circle or 🔺 Triangle), then grab it to move it.": "Primero dibuja una forma (⬛ cuadrado, ⚫ círculo o 🔺 triángulo) y luego agárrala para moverla.",
  "Square": "Cuadrado", "Circle": "Círculo", "Triangle": "Triángulo", "Brush": "Pincel", "Fill": "Relleno", "Move": "Mover", "Undo": "Deshacer", "Collection": "Colección", "Studio": "Estudio",
  // ---------- 🧬 gene splicer ----------
  "Common": "Común", "Uncommon": "Poco común", "Rare": "Rara", "Extinct": "Extinta", "Mythical": "Mítica", "Starting sample": "Muestra inicial", "Mutant": "Mutante",
  "All": "Todos", "Aquatic": "Acuáticos", "Reptiles & Amphibians": "Reptiles y anfibios", "Birds": "Aves", "Mammals": "Mamíferos", "Bugs": "Bichos",
  "Plants & Fungi": "Plantas y hongos", "Starting": "Iniciales", "Splice": "Empalmar", "Codex": "Códice", "Search": "Buscar", "DNA samples": "Muestras de ADN",
  "Click to take it out": "Haz clic para sacarla", "Pick a sample below": "Elige una muestra abajo", "Sample A": "Muestra A", "Sample B": "Muestra B",
  "Pick two samples from your freezer (the same one twice works too).": "Elige dos muestras de tu congelador (también vale la misma dos veces).",
  "Not enough DNA: each sample refills by 1 every 10 minutes (max 3).": "No hay ADN suficiente: cada muestra se recarga 1 cada 10 minutos (máx. 3).",
  "Species bonuses": "Bonificaciones de especies", "+1% for every species you discover in each category, for good": "+1% por cada especie que descubras en cada categoría, para siempre",
  "Every species you discover in these categories gives +1% for good": "Cada especie que descubras en estas categorías da +1% para siempre",
  "tanker contracts": "contratos de petroleros", "cargo plane contracts": "contratos de aviones de carga", "truck contracts": "contratos de camiones",
  "space mission rewards": "premios de misiones espaciales", "Art Gallery income": "ingresos de la Galería de arte", "ore sold in the Gold Mine Dig": "mineral vendido en la mina de oro",
  "Needs a University with scientists": "Necesita una universidad con científicos", "No new recipe is possible with what you have": "No es posible ninguna receta nueva con lo que tienes",
  "Mutants come from pairs that don't make a real species. They can't be spliced again and don't count as species.": "Los mutantes salen de parejas que no forman una especie real. No se pueden volver a empalmar y no cuentan como especies.",
  "No mutants yet.": "Aún no hay mutantes.", "Nothing here yet.": "Aquí no hay nada todavía.", "done": "completo", "unfound": "sin descubrir", "later": "más adelante",
  "Mutation": "Mutación", "New species": "Especie nueva", "species": "especies",
});
rx(String.raw`Start a run \(`, "Empezar partida (");
rx(String.raw`Lv (\d+)\/(\d+)`, "Nv. $1/$2");
rx(String.raw`Now: (.+)`, (m, x) => { const v = esq(x); return v == null ? null : `Ahora: ${v}`; });
rx(String.raw`Next: (.+)`, (m, x) => { const v = esq(x); return v == null ? null : `Siguiente: ${v}`; });
rx(String.raw`(\d+) lamp oil`, "$1 de aceite");
rx(String.raw`holds (\d+) ore`, "caben $1 de mineral");
rx(String.raw`stone (\d) hits? · granite (\d) hits?`, (m, a, b) => `piedra ${a} ${plural(a, "golpe", "golpes")} · granito ${b} ${plural(b, "golpe", "golpes")}`);
rx(String.raw`walking costs ([\d.,]+) oil`, (m, x) => `caminar gasta ${decFix(x)} de aceite`);
rx(String.raw`\+(\d+)% ore value`, "+$1% de valor del mineral");
rx(String.raw`up to (\d+) energy`, "hasta $1 de energía");
rx(String.raw`\+1 energy every (\d+) min`, "+1 de energía cada $1 min");
rx(String.raw`rescue keeps (\d+)% of your ore`, "el rescate conserva el $1% de tu mineral");
rx(String.raw`(.+) level (\d+): (.+)!`, (m, n, l, e) => { const a = esq(n), b = esq(e); return a == null || b == null ? null : `${a} nivel ${l}: ¡${b}!`; });
rx(String.raw`(\d+) m`, "$1 m");
rx(String.raw`Head back up! About (\d+) oil to get out\.( Or take the)?`, (m, n, l) => `¡Vuelve a subir! Necesitas unos ${n} de aceite para salir.${l ? " O usa el" : ""}`);
rx(String.raw`lift\.`, "ascensor.");
rx(String.raw`Call the rescue team \(keep (\d+)%\)`, "Llamar al equipo de rescate (conservas el $1%)");
rx(String.raw`Runs: (\d+) · Deepest ever: (\d+) m · Chests opened: (\d+) · Earned: (${NUM})`, "Partidas: $1 · Récord de profundidad: $2 m · Cofres abiertos: $3 · Ganado: $4");
rx(String.raw`of your ore \((\d+) lost\)\.`, "de tu mineral (perdido: $1).");
hrx(String.raw`(Your lamp ran out underground\. The rescue team|The lava caught you\. The emergency rescue) brought you up with <b>(\d+%)<\/b> of your ore \((\d+) lost\)\.`,
  (m, a, p, n) => `${/lava/.test(a) ? "La lava te ha alcanzado. El rescate de emergencia" : "Tu lámpara se ha apagado bajo tierra. El equipo de rescate"} te ha subido con el <b>${p}</b> de tu mineral (perdido: ${n}).`);
hrx(String.raw`Deepest point: <b>(\d+) m<\/b>( · 🏆 new record!)?`, (m, d, r) => `Punto más profundo: <b>${d} m</b>${r ? " · 🏆 ¡nuevo récord!" : ""}`);
rx(String.raw`(Coal|Copper|Silver|Gold|Diamond|Ruby) ×(\d+)`, (m, o, n) => `${ES[o]} ×${n}`);
rx(String.raw`\+1 (Coal|Copper|Silver|Gold|Diamond|Ruby)!`, (m, o) => `¡+1 de ${ES[o].toLowerCase()}!`);
rx(String.raw`Sell for (${NUM})`, "Vender por $1");
rx(String.raw`Sold your ore for (${NUM})!`, "¡Has vendido tu mineral por $1!");
rx(String.raw`Sold (\d+) vault ore for (${NUM})!`, "¡Has vendido $1 de mineral de la cámara por $2!");
rx(String.raw`(\d+) ore stored in your vault\.`, "$1 de mineral guardado en tu cámara.");
rx(String.raw`Mine lift bought! You have (\d+)\.`, "¡Ascensor comprado! Tienes $1.");
rx(String.raw`Buy a lift · (${NUM})`, "Comprar ascensor · $1");
rx(String.raw`(\d+) in vault · (${NUM}) each`, "$1 en la cámara · $2 cada uno");
rx(String.raw`Your next upgrade levels need this much (Coal|Copper|Silver|Gold|Diamond|Ruby)`, (m, o) => `Tus próximos niveles de mejora necesitan esta cantidad de ${ES[o].toLowerCase()}`);
rx(String.raw`next upgrades need (\d+)`, "las próximas mejoras necesitan $1");
rx(String.raw`(\d+) min (?:(\d+) sec )?of your income\.`, (m, a, b) => `${a} min ${b ? b + " s " : ""}de tus ingresos.`);
rx(String.raw`No room for the chest: it needs (\d+) free bag slots\.`, "No cabe el cofre: necesita $1 huecos libres en la bolsa.");
rx(String.raw`A lava pocket burst open and splashed you \(−([\d.,]+) oil\)! It flows fast: get away, go UP!`, (m, n) => `¡Una bolsa de lava ha reventado y te ha salpicado (−${decFix(n)} de aceite)! Fluye rápido: aléjate, ¡SUBE!`);
rx(String.raw`Scorching heat next to the lava: −([\d.,]+) oil!`, (m, n) => `Calor abrasador junto a la lava: ¡−${decFix(n)} de aceite!`);
rx(String.raw`Run over: no ore this time\. Deepest point (\d+) m\.`, "Partida terminada: esta vez sin mineral. Punto más profundo: $1 m.");
rx(String.raw`vault to pay for upgrades\. If the lamp runs out underground, the rescue team saves (\d+)% of your ore\.`, "cámara para pagar mejoras. Si la lámpara se apaga bajo tierra, el equipo de rescate salva el $1% de tu mineral.");
hrx(String.raw`🌋 Below <b>100 m<\/b>: lava pools block the way and rocks with glowing red cracks hide lava pockets\. Breaking one splashes you \(−20% lamp\) and the lava flows fast, even if you stand still \(it can rise 1 tile\)\. Every step next to lava burns 5% of your lamp\. Getting caught saves only (\d+)% of your ore\. 🔥 Below <b>150 m<\/b> the heat burns your lamp 25% faster, and 🔴 rubies appear\. 📦 Below <b>130 m<\/b> are 1–2 treasure chests \(5 bag slots each\): bring them up yourself to open them\. The rescue team leaves them behind\.`,
  "🌋 Por debajo de <b>100 m</b>: los lagos de lava cortan el paso y las rocas con grietas rojas brillantes esconden bolsas de lava. Romper una te salpica (−20% de lámpara) y la lava fluye rápido, aunque te quedes quieto (puede subir 1 casilla). Cada paso junto a la lava gasta un 5% de tu lámpara. Si te alcanza, solo se salva el $1% de tu mineral. 🔥 Por debajo de <b>150 m</b> el calor gasta tu lámpara un 25% más rápido y aparecen 🔴 rubíes. 📦 Por debajo de <b>130 m</b> hay 1–2 cofres del tesoro (5 huecos de bolsa cada uno): súbelos tú mismo para abrirlos. El equipo de rescate los deja atrás.");
rx(String.raw`(Easy|Medium|Hard) (${NUM}) · 🟡 Medium (${NUM}) · 🔴 Hard (${NUM}) \(you earn your match %; at least 50% to sell or keep\)`,
  (m, e, a, b, c) => `Fácil ${a} · 🟡 Media ${b} · 🔴 Difícil ${c} (ganas tu % de parecido; al menos el 50% para vender o guardar)`);
rx(String.raw`(Easy|Medium|Hard): (.+)\. You earn your match % of (${NUM}): an 85% copy is worth (${NUM})\. Under (\d+)% it can't be sold or kept\.`,
  (m, t, d, v, w, u) => `${ES[t]}: ${esq(d) ?? d}. Ganas tu % de parecido de ${v}: una copia al 85% vale ${w}. Por debajo del ${u}% no se puede vender ni guardar.`);
rx(String.raw`(Easy|Medium|Hard) paintings are now unlocked in the Art studio!`, (m, t) => `¡Ya puedes pintar cuadros de nivel ${ES[t]} en el Estudio de arte!`);
rx(String.raw`Added to your collection \(worth (${NUM})\)\.`, "Añadido a tu colección (vale $1).");
rx(String.raw`Sold your copy for (${NUM})!`, "¡Has vendido tu copia por $1!");
rx(String.raw`Sold a painting for (${NUM})!`, "¡Has vendido un cuadro por $1!");
rx(String.raw`Collection now has (\d+) slots\.`, "La colección tiene ahora $1 huecos.");
rx(String.raw`(\d+) paintings in your collection`, "$1 cuadros en tu colección");
rx(String.raw`(\d+) \/ (\d+) paintings`, "$1 / $2 cuadros");
rx(String.raw`Buy (\d+) more slots? · (${NUM})`, "Comprar $1 huecos más · $2");
// gene splicer
rx(String.raw`(\d+) unfound`, "$1 sin descubrir");
rx(String.raw`(\d+) later`, "$1 más adelante");
rx(String.raw`Freezer \((\d+)\)`, "Congelador ($1)");
rx(String.raw`Mutants \((\d+)\)`, "Mutantes ($1)");
rx(String.raw`(\d+) \/ (\d+) species`, "$1 / $2 especies");
rx(String.raw`Hint · 👩‍🔬 (\d+) scientists`, "Pista · 👩‍🔬 $1 científicos");
rx(String.raw`You have (\d+) scientists`, "Tienes $1 científicos");
rx(String.raw`Next DNA for every sample in`, "Siguiente ADN para todas las muestras en");
rx(String.raw`Uses 1 DNA of each sample( \(2 of this one\))?\. A pair that isn't a real recipe makes a 🧪 mutant\.`,
  (m, d) => `Usa 1 de ADN de cada muestra${d ? " (2 de esta)" : ""}. Una pareja que no es una receta real crea un 🧪 mutante.`);
rx(String.raw`You already made this mutant \((.+)\)\.`, "Ya has creado este mutante ($1).");
rx(String.raw`You've made (\d+) of ([\d,.]+) possible\.`, (m, a, b) => `Has creado ${a} de ${b.replace(/,/g, ".")} posibles.`);
rx(String.raw`(\d+) new species can still be made with (.+?) and samples you already have(?: \(\+(\d+) more need samples you haven't found yet\))?`,
  (m, n, s, l) => `Aún se ${plural(n, "puede", "pueden")} crear ${n} ${plural(n, "especie nueva", "especies nuevas")} con ${es(s)} y muestras que ya tienes${l ? ` (otras ${l} necesitan muestras que aún no has encontrado)` : ""}`);
rx(String.raw`(\d+) new species need (.+?) and a sample you haven't found yet`, (m, n, s) => `${n} ${plural(n, "especie nueva necesita", "especies nuevas necesitan")} ${es(s)} y una muestra que aún no has encontrado`);
rx(String.raw`Every species with (.+?) is found`, (m, s) => `Ya has encontrado todas las especies con ${es(s)}`);
rx(String.raw`Already in your freezer: no reward, 🧬 \+1 (.+?) DNA( \(already full\))?`, (m, s, f) => `Ya está en tu congelador: sin premio, 🧬 +1 de ADN de ${es(s)}${f ? " (ya lleno)" : ""}`);
rx(String.raw`(?:(${NUM}) · )?🧬 \+1 (.+?) DNA`, (m, r, s) => `${r ? r + " · " : ""}🧬 +1 de ADN de ${es(s)}`);
rx(String.raw`Not a real species: (.+?) and (.+?) don't make one\. It goes in your (.*?)Mutant jar and can't be spliced again\.`,
  (m, a, b, i) => `No es una especie real: ${es(a)} y ${es(b)} no forman ninguna. Va a tu tarro de mutantes ${i}y no se puede volver a empalmar.`);
rx(String.raw`New species: (.+?)!( \+(${NUM}))?`, (m, s, r, v) => `Especie nueva: ¡${es(s)}!${r ? " +" + v : ""}`);
rx(String.raw`Hint: try (.+?) \+ (.+?)!`, (m, a, b) => `Pista: ¡prueba ${es(a)} + ${es(b)}!`);
rx(String.raw`Try (.+?) \+ (.+)`, (m, a, b) => `Prueba ${es(a)} + ${es(b)}`);
rx(String.raw`No (.+?) DNA left: it refills every 10 minutes\.`, (m, s) => `No te queda ADN de ${es(s)}: se recarga cada 10 minutos.`);
rx(String.raw`Mega-(\S+)`, (m, s) => `Mega${s}`);

const SPECIES_ES = {
  Human: "Humano", Fish: "Pez", Lizard: "Lagarto", Spider: "Araña", Plant: "Planta", Shark: "Tiburón", Dinosaur: "Dinosaurio", Scorpion: "Escorpión",
  Tree: "Árbol", Ape: "Simio", Mermaid: "Sirena", Frog: "Rana", Crab: "Cangrejo", Seaweed: "Alga", Centipede: "Ciempiés", Iguana: "Iguana",
  Lizardfolk: "Hombre lagarto", Arachne: "Aracne", "Venus flytrap": "Venus atrapamoscas", Dryad: "Dríade", Flower: "Flor", Worm: "Gusano", Snake: "Serpiente",
  Ant: "Hormiga", Bee: "Abeja", Caterpillar: "Oruga", Butterfly: "Mariposa", Beetle: "Escarabajo", Cactus: "Cactus", Mushroom: "Seta", Coral: "Coral",
  Bird: "Pájaro", Archaeopteryx: "Arqueoptérix", Fly: "Mosca", Mosquito: "Mosquito", Grasshopper: "Saltamontes", Dragonfly: "Libélula", Mouse: "Ratón",
  Rat: "Rata", Bat: "Murciélago", Squirrel: "Ardilla", Rabbit: "Conejo", Cat: "Gato", Tiger: "Tigre", Lion: "León", Wolf: "Lobo", Dog: "Perro", Fox: "Zorro",
  Bear: "Oso", Panda: "Panda", Deer: "Ciervo", Horse: "Caballo", Cow: "Vaca", Goat: "Cabra", Pig: "Cerdo", Zebra: "Cebra", Camel: "Camello",
  Elephant: "Elefante", Rhino: "Rinoceronte", Hippo: "Hipopótamo", Gorilla: "Gorila", Monkey: "Mono", Sloth: "Perezoso", Mole: "Topo", Hedgehog: "Erizo",
  Armadillo: "Armadillo", Walrus: "Morsa", Seal: "Foca", Platypus: "Ornitorrinco", Dolphin: "Delfín", Whale: "Ballena", Orca: "Orca", Narwhal: "Narval",
  "Manta ray": "Mantarraya", Shrimp: "Gamba", Lobster: "Bogavante", Octopus: "Pulpo", Squid: "Calamar", Clownfish: "Pez payaso", Jellyfish: "Medusa",
  Starfish: "Estrella de mar", Seahorse: "Caballito de mar", Eel: "Anguila", Crocodile: "Cocodrilo", "Komodo dragon": "Dragón de Komodo", Turtle: "Tortuga marina",
  Tortoise: "Tortuga", Chameleon: "Camaleón", Salamander: "Salamandra", Axolotl: "Ajolote", "Poison dart frog": "Rana dardo venenosa", Cobra: "Cobra",
  Pigeon: "Paloma", Eagle: "Águila", Owl: "Búho", Parrot: "Loro", Chicken: "Gallina", Duck: "Pato", Penguin: "Pingüino", Flamingo: "Flamenco", Peacock: "Pavo real",
  Ladybug: "Mariquita", "Praying mantis": "Mantis religiosa", Wasp: "Avispa", Tarantula: "Tarántula", "Zombie fungus": "Hongo zombi", Treefolk: "Ent",
  Mandrake: "Mandrágora", "T-Rex": "T-Rex", Brachiosaurus: "Braquiosaurio", Triceratops: "Tricerátops", Ankylosaurus: "Anquilosaurio", Pterodactyl: "Pterodáctilo",
  Megalodon: "Megalodón", Coelacanth: "Celacanto", Trilobite: "Trilobites", Ammonite: "Amonites", Ichthyosaur: "Ictiosaurio", Plesiosaur: "Plesiosaurio",
  Mammoth: "Mamut", "Sabre-toothed cat": "Tigre dientes de sable", "Dire wolf": "Lobo terrible", Neanderthal: "Neandertal", Dodo: "Dodo", Titanoboa: "Titanoboa",
  Meganeura: "Meganeura", Dragon: "Dragón", "Elder dragon": "Dragón ancestral", Phoenix: "Fénix", Unicorn: "Unicornio", Pegasus: "Pegaso", Centaur: "Centauro",
  Griffin: "Grifo", Hippogriff: "Hipogrifo", Harpy: "Arpía", Sphinx: "Esfinge", Manticore: "Mantícora", Chimera: "Quimera", Minotaur: "Minotauro", Hydra: "Hidra",
  Medusa: "Gorgona", Basilisk: "Basilisco", Kraken: "Kraken", Leviathan: "Leviatán", Cerberus: "Cerbero", Vampire: "Vampiro", Werewolf: "Hombre lobo", Satyr: "Sátiro",
  Selkie: "Selkie", Siren: "Sirena cantora", Kitsune: "Kitsune", Jackalope: "Jackalope", Yeti: "Yeti", Fairy: "Hada", Qilin: "Qilin",
};
Object.assign(ES, SPECIES_ES);
Object.assign(ES, {
  "One of your 5 starting samples": "Una de tus 5 muestras iniciales", "A fish built for hunting": "Un pez hecho para cazar", "A lizard, but much, much bigger": "Un lagarto, pero mucho, mucho más grande",
  "Eight legs plus a stinger": "Ocho patas y un aguijón", "Lots of plant grows into a tree": "Mucha planta acaba siendo un árbol", "Our closest relatives": "Nuestros parientes más cercanos",
  "Half fish, half human": "Mitad pez, mitad humana", "The first animals to leave the water were in between": "Los primeros animales que salieron del agua estaban a medio camino",
  "Legs and claws, living in the sea": "Patas y pinzas, viviendo en el mar", "A plant that lives in the sea": "Una planta que vive en el mar", "A long body with far too many legs": "Un cuerpo largo con demasiadas patas",
  "A lizard that eats leaves": "Un lagarto que come hojas", "Scaly people from old legends": "Gente escamosa de viejas leyendas", "The weaver of Greek myth, turned into a spider": "La tejedora del mito griego, convertida en araña",
  "A plant that traps bugs like a spider": "Una planta que atrapa bichos como una araña", "A tree spirit from Greek myth": "Un espíritu del árbol del mito griego",
  "What trees and plants grow to attract bees": "Lo que dan árboles y plantas para atraer a las abejas", "Lives in the soil under the plants": "Vive en la tierra bajo las plantas",
  "A lizard that lost its legs": "Un lagarto que perdió las patas", "Tiny climbers that live in colonies": "Pequeñas trepadoras que viven en colonias", "A flying worker that loves flowers": "Una obrera voladora que adora las flores",
  "A worm-like baby that eats leaves": "Una cría con forma de gusano que come hojas", "It hangs in a tree and changes": "Se cuelga de un árbol y se transforma", "An armoured insect": "Un insecto acorazado",
  "A spiky plant from the scorpion's desert": "Una planta con pinchos del desierto del escorpión", "Grows where old wood rots": "Crece donde se pudre la madera vieja", "A sea forest builds a reef": "Un bosque marino construye un arrecife",
  "Small dinosaurs learned to glide from the trees": "Pequeños dinosaurios aprendieron a planear desde los árboles", "The famous half-dinosaur, half-bird": "El famoso medio dinosaurio, medio ave",
  "A bug that learned to fly": "Un bicho que aprendió a volar", "A fly that wants your blood": "Una mosca que quiere tu sangre", "A jumping leaf-eater": "Un comehojas saltarín", "Its young grow up in ponds": "Sus crías crecen en charcas",
  "The first mammals were small and lizard-like": "Los primeros mamíferos eran pequeños y parecidos a lagartos", "A bigger, tougher mouse": "Un ratón más grande y más duro", "A mammal that flies": "Un mamífero que vuela",
  "A mouse that lives in trees": "Un ratón que vive en los árboles", "A grass-eater with big ears": "Un comedor de hierba con grandes orejas", "People kept cats to catch mice": "La gente tenía gatos para cazar ratones",
  "A very big cat": "Un gato muy grande", "The king of the big cats": "El rey de los grandes felinos", "A hunter that works in a pack": "Un cazador que trabaja en manada", "Wolves that came to live with people": "Lobos que se fueron a vivir con la gente",
  "A small hunter of rabbits": "Un pequeño cazador de conejos", "A huge omnivore": "Un omnívoro enorme", "A bear that eats bamboo": "Un oso que come bambú", "A forest grazer": "Un herbívoro del bosque",
  "A grazer people learned to ride": "Un herbívoro que aprendimos a montar", "A grazer that eats grass all day": "Un herbívoro que come hierba todo el día", "A sure-footed farm animal": "Un animal de granja de paso firme",
  "A farm animal that eats anything": "Un animal de granja que se come de todo", "A horse with stripes": "Un caballo con rayas", "A horse for the desert": "Un caballo para el desierto",
  "A giant with a snake-like trunk": "Un gigante con una trompa como una serpiente", "Armour and a horn, like a rhino beetle": "Coraza y cuerno, como un escarabajo rinoceronte", "Its name means 'river horse'": "Su nombre significa «caballo de río»",
  "The biggest ape": "El simio más grande", "An ape that lives in the trees": "Un simio que vive en los árboles", "A very slow leaf-eater": "Un comehojas muy lento", "A digger, just like our miner": "Un excavador, como nuestro minero",
  "A mouse covered in spikes": "Un ratón cubierto de pinchos", "A mammal in a suit of armour": "Un mamífero con armadura", "A seal with tusks": "Una foca con colmillos", "A 'sea dog'": "Un «perro de mar»",
  "A mammal with a duck's bill that lays eggs": "Un mamífero con pico de pato que pone huevos", "A clever mammal of the sea": "Un mamífero listo del mar", "The biggest animal ever": "El animal más grande de la historia",
  "The killer whale": "La ballena asesina", "The unicorn of the sea": "El unicornio del mar", "It 'flies' through the water": "«Vuela» por el agua", "A small swimmer with a shell": "Un pequeño nadador con caparazón",
  "Big claws and a long tail": "Grandes pinzas y una cola larga", "Eight arms in the sea": "Ocho brazos en el mar", "A fast cousin of the octopus": "Un primo rápido del pulpo", "Lives in the reef": "Vive en el arrecife",
  "A floating, stinging blob": "Una masa flotante que pica", "A reef crawler with five arms": "Un reptador del arrecife con cinco brazos", "A tiny fish with a horse's head": "Un pez diminuto con cabeza de caballo",
  "A fish shaped like a snake": "Un pez con forma de serpiente", "A lizard that hunts in the water": "Un lagarto que caza en el agua", "The biggest lizard alive today": "El lagarto vivo más grande de hoy",
  "A reptile in a shell": "Un reptil con caparazón", "A slow land turtle that eats plants": "Una tortuga terrestre lenta que come plantas", "Changes colour like flowers": "Cambia de color como las flores",
  "A lizard-shaped amphibian": "Un anfibio con forma de lagarto", "A salamander that never leaves the water": "Una salamandra que nunca sale del agua", "Bright colours mean 'don't eat me'": "Los colores vivos significan «no me comas»",
  "A snake with deadly venom": "Una serpiente con veneno mortal", "The city bird": "El ave de la ciudad", "A bird of prey that eats snakes": "Un ave rapaz que come serpientes",
  "A night hunter with a cat-like face": "Un cazador nocturno con cara de gato", "A bird that can talk": "Un ave que sabe hablar", "A farm bird": "Un ave de granja", "A pond bird": "Un ave de charca",
  "A bird that swims instead of flying": "Un ave que nada en vez de volar", "Pink from eating shrimp": "Rosa de tanto comer gambas", "A tail like a bunch of flowers": "Una cola como un ramo de flores",
  "A spotted beetle in the garden": "Un escarabajo con puntos en el jardín", "A hunter that waits very still": "Un cazador que espera muy quieto", "A bee with a meaner sting": "Una abeja con peor picadura",
  "A big, hairy spider": "Una araña grande y peluda", "A real fungus that takes over ants": "Un hongo real que se apodera de las hormigas", "A walking, talking tree": "Un árbol que anda y habla",
  "A root that screams when pulled out": "Una raíz que grita cuando la arrancas", "The king of the dinosaurs": "El rey de los dinosaurios", "A long-necked plant-eater": "Un herbívoro de cuello largo",
  "Three horns and a big frill": "Tres cuernos y una gran gola", "A dinosaur tank with a club tail": "Un dinosaurio tanque con cola de maza", "A flying reptile": "Un reptil volador",
  "A shark as big as a bus": "Un tiburón tan grande como un autobús", "A 'living fossil' fish, still alive today": "Un pez «fósil viviente» que sigue vivo hoy", "An ancient sea bug": "Un antiguo bicho marino",
  "An ancient squid in a spiral shell": "Un antiguo calamar en una concha en espiral", "A sea reptile shaped like a dolphin": "Un reptil marino con forma de delfín", "A long-necked sea reptile": "Un reptil marino de cuello largo",
  "A woolly elephant of the ice age": "Un elefante lanudo de la Edad de Hielo", "A cat with huge fangs": "Un felino con colmillos enormes", "A giant ice-age wolf": "Un lobo gigante de la Edad de Hielo",
  "Our ancient cousins": "Nuestros antiguos primos", "A bird that couldn't fly away": "Un ave que no pudo salir volando", "A snake as long as a bus": "Una serpiente tan larga como un autobús",
  "A dragonfly the size of a hawk": "Una libélula del tamaño de un halcón", "A giant winged lizard": "Un lagarto gigante con alas", "The oldest dragon of them all": "El dragón más antiguo de todos",
  "A fiery bird reborn from its ashes": "Un ave de fuego que renace de sus cenizas", "A horse with one horn": "Un caballo con un cuerno", "The winged horse": "El caballo alado", "Half human, half horse": "Mitad humano, mitad caballo",
  "Eagle at the front, lion at the back": "Águila por delante, león por detrás", "Half eagle, half horse": "Mitad águila, mitad caballo", "A bird-woman of Greek myth": "Una mujer pájaro del mito griego",
  "A lion with a human head and riddles": "Un león con cabeza humana y acertijos", "A lion with a scorpion's tail": "Un león con cola de escorpión", "Lion, goat and snake in one": "León, cabra y serpiente en uno",
  "A bull-headed man in a maze": "Un hombre con cabeza de toro en un laberinto", "Cut off one head and two grow back": "Córtale una cabeza y le salen dos", "Snakes for hair; one look turns you to stone": "Serpientes por pelo; una mirada te convierte en piedra",
  "Hatched from an egg by a serpent": "Nacido de un huevo incubado por una serpiente", "A sea monster that sinks ships": "Un monstruo marino que hunde barcos", "The great sea serpent": "La gran serpiente marina",
  "A three-headed guard dog": "Un perro guardián de tres cabezas", "Comes out at night, wants your blood": "Sale de noche y quiere tu sangre", "A person who turns into a wolf": "Una persona que se convierte en lobo",
  "Half goat, half human, loves music": "Mitad cabra, mitad humano, le encanta la música", "A seal who can become a person": "Una foca que puede convertirse en persona", "Sings sailors onto the rocks": "Atrae con su canto a los marineros contra las rocas",
  "A magical fox with many tails": "Un zorro mágico con muchas colas", "A rabbit with antlers": "Un conejo con cornamenta", "The abominable snowman": "El abominable hombre de las nieves", "A tiny winged person": "Una personita con alas",
  "A lucky dragon-unicorn from Chinese legend": "Un dragón-unicornio de la suerte de la leyenda china",
});

/* ===================== 🏆 ACHIEVEMENTS ===================== */
Object.assign(ES, {
  // names
  "Millionaire": "Millonario", "Multi-millionaire": "Multimillonario", "Swimming in coins": "Nadando en monedas", "Billionaire": "Milmillonario",
  "Gold baron": "Barón del oro", "Coin emperor": "Emperador de las monedas", "A fresh start": "Un nuevo comienzo", "Second wind": "Segundo aire", "Legend": "Leyenda",
  "Good citizen": "Buen ciudadano", "Model taxpayer": "Contribuyente modelo", "Pillar of society": "Pilar de la sociedad", "Treat yourself": "Date un capricho",
  "Hail, Emperor!": "¡Salve, Emperador!", "Double degree": "Doble titulación", "Stargazer": "Observador de estrellas", "Home among the stars": "Un hogar entre las estrellas",
  "Triple degree": "Triple titulación", "Brain trust": "Equipo de cerebros", "One small step": "Un pequeño paso", "Into the deep": "Hacia las profundidades",
  "Deep space veteran": "Veterano del espacio profundo", "Red planet": "Planeta rojo", "Rewriting the code": "Reescribiendo el código", "Dressed to impress": "Vestido para impresionar",
  "Warming up": "Calentando", "Clicker": "Clicador", "Click machine": "Máquina de clics", "Iron finger": "Dedo de hierro", "Squeaky clean": "Limpio como una patena",
  "Grease monkey": "Manitas del motor", "Showroom king": "Rey del concesionario", "The house always wins": "La banca siempre gana", "Hotelier": "Hotelero",
  "Storage empire": "Imperio del almacenaje", "Full legal team": "Equipo legal completo", "Agency boss": "Jefe de agencia", "Gold digger": "Buscador de oro",
  "Mining magnate": "Magnate minero", "Harbor master": "Capitán de puerto", "Headhunter": "Cazatalentos", "Patron of the arts": "Mecenas de las artes",
  "Higher education": "Educación superior", "Mad scientist": "Científico loco", "Space race": "Carrera espacial", "Nobel laureate": "Premio Nobel", "Genius": "Genio",
  "Changed the world": "Cambiaste el mundo", "Lift-off!": "¡Despegue!", "Houston, we have a problem": "Houston, tenemos un problema", "Theme park tycoon": "Magnate de los parques temáticos",
  "Money printer": "Imprenta de dinero", "Money fountain": "Fuente de dinero", "Caffeinated": "Con cafeína", "Wired for life": "Enchufado de por vida",
  "Feeling magical": "Sensación mágica", "Potion master": "Maestro de pociones", "Lobbyist": "Lobista", "Pulling the strings": "Moviendo los hilos",
  "Regular": "Habitual", "High roller": "Gran apostador", "New in town": "Nuevo en la ciudad", "Known face": "Cara conocida", "Whale": "Ballena", "Casino legend": "Leyenda del casino",
  "Beat the house": "Ganarle a la banca", "Royal Flush or Jackpot!": "¡Escalera real o bote!", "Four of a kind ×4": "Póquer ×4", "6 7": "6 7",
  "Card counter": "Contador de cartas", "Blackjack legend": "Leyenda del blackjack", "Called it": "Lo sabía", "All on zero": "Todo al cero", "Edge of glory": "Al borde de la gloria",
  "Whale at the table": "Ballena en la mesa", "Red or black?": "¿Rojo o negro?", "Max credits": "Créditos al máximo", "All in": "Todo o nada",
  "Roulette regular": "Habitual de la ruleta", "Roulette veteran": "Veterano de la ruleta", "Blackjack regular": "Habitual del blackjack", "Blackjack veteran": "Veterano del blackjack",
  "Plinko regular": "Habitual del Plinko", "Plinko veteran": "Veterano del Plinko", "Sky Climb regular": "Habitual de Sky Climb", "Sky Climb veteran": "Veterano de Sky Climb",
  "Video Poker regular": "Habitual del videopóquer", "Video Poker veteran": "Veterano del videopóquer", "Ultimate Texas Hold'em regular": "Habitual del Ultimate Texas Hold'em",
  "Ultimate Texas Hold'em veteran": "Veterano del Ultimate Texas Hold'em", "Punto Banco": "Punto Banco", "Baccarat regular": "Habitual del baccarat",
  "Baccarat high society": "Alta sociedad del baccarat", "Hot shoe": "Zapato caliente", "Lab rat": "Rata de laboratorio", "Cascade regular": "Habitual de la cascada",
  "Chain reaction": "Reacción en cadena", "It's mutating!": "¡Está mutando!", "Bought in bulk": "Compra al por mayor", "Landlord": "Casero",
  "Property portfolio": "Cartera inmobiliaria", "Real estate mogul": "Magnate inmobiliario", "Skyline owner": "Dueño del horizonte", "Flipper": "Compraventa rápida",
  "Survivor": "Superviviente", "Index fan": "Fan de los índices", "Market timer": "Cazador del momento", "Fort Knox": "Fort Knox", "Friends in high places": "Amigos en las altas esferas",
  "Wall Street insider": "Infiltrado de Wall Street", "First green trade": "Primera operación en verde", "Day trader": "Trader intradía", "Market shark": "Tiburón del mercado",
  "Golden touch": "Toque de oro", "Insider": "Con información privilegiada", "First steps": "Primeros pasos", "Analyst": "Analista", "Wolf of Wall Street": "El lobo de Wall Street",
  "Market maker": "Creador de mercado", "On the road": "En la carretera", "Dispatcher": "Despachador", "Supply chain boss": "Jefe de la cadena de suministro",
  "Logistics legend": "Leyenda de la logística", "Trucking company": "Empresa de transportes", "Set sail": "Zarpar", "Oil baron": "Barón del petróleo", "Taking off": "Despegando",
  "Airline": "Aerolínea", "Reliable carrier": "Transportista fiable", "Logistics pro": "Profesional de la logística", "Global network": "Red global", "First big haul": "Primer gran cargamento",
  "Eye in the sky": "Ojo en el cielo", "Shipping tycoon": "Magnate naviero",
  "Apprentice: Easy": "Aprendiz: fácil", "Skilled copyist: Easy": "Copista hábil: fácil", "Master forger: Easy": "Maestro falsificador: fácil",
  "Apprentice: Medium": "Aprendiz: media", "Skilled copyist: Medium": "Copista hábil: media", "Master forger: Medium": "Maestro falsificador: media",
  "Apprentice: Hard": "Aprendiz: difícil", "Skilled copyist: Hard": "Copista hábil: difícil", "Master forger: Hard": "Maestro falsificador: difícil",
  "Small collection": "Pequeña colección", "Curator": "Comisario", "Museum of copies": "Museo de copias", "Grand gallery": "Gran galería", "First sale": "Primera venta",
  "Art dealer": "Marchante", "Gallery regular": "Habitual de la galería", "Art market mogul": "Magnate del mercado del arte",
  "First dig": "Primera excavación", "Regular miner": "Minero habitual", "Mine foreman": "Capataz de mina", "Going down": "Bajando", "Deep shaft": "Pozo profundo",
  "Into the dark": "Hacia la oscuridad", "Coal collector": "Coleccionista de carbón", "Silver lining": "Rayo de plata", "Shine bright": "Brilla con fuerza", "Packed bag": "Bolsa a rebosar",
  "Close call": "Por los pelos", "Saved by the bell": "Salvado por la campana", "First upgrade": "Primera mejora", "Hoarder": "Acaparador", "Fully lit": "Bien iluminado",
  "Survive the lava": "Sobrevive a la lava", "Rock bottom": "Tocando fondo", "First chest": "Primer cofre", "Treasure hunter": "Cazatesoros", "Going up": "Subiendo",
  "Frequent rider": "Pasajero frecuente", "Master Miner": "Maestro minero", "It's alive!": "¡Está vivo!", "Lab assistant": "Ayudante de laboratorio", "Geneticist": "Genetista",
  "Master of life": "Maestro de la vida", "Release the Kraken": "Liberad al Kraken", "Dragon whisperer": "Susurrador de dragones", "One of a kind": "Único en su especie",
  // descriptions
  "Have 1 scoin on hand (not in casino chips)": "Ten 1 scoin en mano (sin contar fichas del casino)", "Have 10 scoin on hand (not in casino chips)": "Ten 10 scoin en mano (sin contar fichas del casino)",
  "Have 100 scoin on hand (not in casino chips)": "Ten 100 scoin en mano (sin contar fichas del casino)", "Have 1 gcoin on hand (not in casino chips)": "Ten 1 gcoin en mano (sin contar fichas del casino)",
  "Have 5 gcoin on hand (not in casino chips)": "Ten 5 gcoin en mano (sin contar fichas del casino)", "Have 10 gcoin on hand (not in casino chips)": "Ten 10 gcoin en mano (sin contar fichas del casino)",
  "Have 20 gcoin on hand (not in casino chips)": "Ten 20 gcoin en mano (sin contar fichas del casino)",
  "Prestige for the first time": "Haz prestigio por primera vez", "Prestige twice": "Haz prestigio dos veces", "Prestige 4 times and finish the game": "Haz prestigio 4 veces y termina el juego",
  "Pay 10 tax bills": "Paga 10 facturas de impuestos", "Pay 100 tax bills": "Paga 100 facturas de impuestos", "Pay 250 tax bills": "Paga 250 facturas de impuestos",
  "Buy your first cosmetic item in the Shop": "Compra tu primer artículo cosmético en la Tienda",
  "Buy the whole 🦁 Emperor Collection and wear all 3 items at once (background, coin and cards)": "Compra toda la 🦁 Colección del Emperador y lleva los 3 artículos a la vez (fondo, moneda y cartas)",
  "Own two Universities": "Ten dos universidades", "Build an Astronomy Research Center": "Construye un Centro de Investigación Astronómica", "Put an Orbital Space Station in orbit": "Pon en órbita una Estación Espacial Orbital",
  "Own three Universities": "Ten tres universidades", "Have 150 scientists in your Universities": "Ten 150 científicos en tus universidades", "Build the Moon Base": "Construye la Base Lunar",
  "Complete your first successful deep space mission": "Completa con éxito tu primera misión al espacio profundo", "Complete 10 successful deep space missions": "Completa con éxito 10 misiones al espacio profundo",
  "Build the Mars Base": "Construye la Base en Marte", "Open the Genetics Laboratory": "Abre el Laboratorio de genética", "Wear the coin and background from the same collection": "Lleva la moneda y el fondo de la misma colección",
  "Click the coin 100 times": "Haz clic en la moneda 100 veces", "Click the coin 1,000 times": "Haz clic en la moneda 1.000 veces", "Click the coin 10,000 times": "Haz clic en la moneda 10.000 veces",
  "Click the coin 100,000 times": "Haz clic en la moneda 100.000 veces", "Own 3 car washes": "Ten 3 lavaderos de coches", "Own 3 car repair shops": "Ten 3 talleres mecánicos", "Own 3 car salons": "Ten 3 concesionarios",
  "Own 2 casinos": "Ten 2 casinos", "Own 2 hotels": "Ten 2 hoteles", "Own 5 warehouses": "Ten 5 almacenes", "Fill all 10 attorney slots in the Law Firm": "Ocupa las 10 plazas de abogado del bufete",
  "Have 100 real estate agents": "Ten 100 agentes inmobiliarios", "Buy your first gold mine": "Compra tu primera mina de oro", "Buy 4 gold mines (all-time)": "Compra 4 minas de oro (en total)",
  "Buy the Trading Port": "Compra el Puerto comercial", "Buy the Recruitment Agency special business": "Compra el negocio especial Agencia de selección",
  "Buy the Art Gallery special business": "Compra el negocio especial Galería de arte", "Build a University": "Construye una universidad", "Build a Research lab": "Construye un laboratorio de investigación",
  "Build a Space Mission Center": "Construye un Centro de Misiones Espaciales", "Make 1 scientific breakthrough": "Consigue 1 avance científico", "Make 5 scientific breakthroughs": "Consigue 5 avances científicos",
  "Make 10 scientific breakthroughs": "Consigue 10 avances científicos", "Complete your first successful space mission": "Completa con éxito tu primera misión espacial",
  "Have a space mission fail": "Haz que fracase una misión espacial", "Pair two amusement parks with hotels": "Empareja dos parques de atracciones con hoteles",
  "Reach an income of 5,000 / sec": "Llega a unos ingresos de 5.000 / s", "Reach an income of 10,000 / sec": "Llega a unos ingresos de 10.000 / s",
  "Use 10 energy drinks": "Usa 10 bebidas energéticas", "Use 100 energy drinks": "Usa 100 bebidas energéticas", "Use 10 magical pills": "Usa 10 píldoras mágicas", "Use 100 magical pills": "Usa 100 píldoras mágicas",
  "Use 10 political influences": "Usa 10 influencias políticas", "Use 50 political influences": "Usa 50 influencias políticas", "Bet 1 scoin in total": "Apuesta 1 scoin en total",
  "Bet 100 scoin in total": "Apuesta 100 scoin en total", "Reach Gambler level 5": "Llega al nivel de jugador 5", "Reach Gambler level 25": "Llega al nivel de jugador 25",
  "Reach Gambler level 50": "Llega al nivel de jugador 50", "Reach Gambler level 99": "Llega al nivel de jugador 99", "Be 1 scoin up in the casino (all-time earnings)": "Ve 1 scoin por delante en el casino (ganancias totales)",
  "Get a Royal Flush in Video Poker or Ultimate Texas Hold'em, or reach the Sky Climb jackpot (the top step)": "Consigue una escalera real en videopóquer o Ultimate Texas Hold'em, o llega al bote de Sky Climb (el peldaño más alto)",
  "Get 4 four-of-a-kinds in total (Video Poker and Ultimate Texas Hold'em)": "Consigue 4 póqueres en total (videopóquer y Ultimate Texas Hold'em)",
  "Win an Ultimate Texas Hold'em hand holding a 6 and a 7": "Gana una mano de Ultimate Texas Hold'em con un 6 y un 7", "Win 100 Blackjack hands": "Gana 100 manos de blackjack",
  "Win 1,000 Blackjack hands": "Gana 1.000 manos de blackjack", "Win a bet on a single number in Roulette": "Gana una apuesta a un solo número en la ruleta",
  "Win a Roulette spin with your only bet on 0": "Gana una tirada de ruleta con tu única apuesta en el 0", "Hit the 250× slot in Plinko": "Acierta la casilla de 250× en Plinko",
  "Bet 500 scoin on one Blackjack hand": "Apuesta 500 scoin en una mano de blackjack", "Bet 500 scoin on red or black in a single spin": "Apuesta 500 scoin a rojo o negro en una sola tirada",
  "Play a Video Poker hand with a 500 scoin bet": "Juega una mano de videopóquer con una apuesta de 500 scoin", "Play an Ultimate Texas Hold'em hand with a 500 scoin ante": "Juega una mano de Ultimate Texas Hold'em con un ante de 500 scoin",
  "Play 100 Roulette spins": "Juega 100 tiradas de ruleta", "Play 1000 Roulette spins": "Juega 1000 tiradas de ruleta",
  "Play 100 Blackjack hands (each seat you bet on counts)": "Juega 100 manos de blackjack (cuenta cada asiento en el que apuestas)", "Play 1000 Blackjack hands (each seat you bet on counts)": "Juega 1000 manos de blackjack (cuenta cada asiento en el que apuestas)",
  "Drop 100 Plinko balls": "Lanza 100 bolas de Plinko", "Drop 1000 Plinko balls": "Lanza 1000 bolas de Plinko", "Play 100 Sky Climb rounds": "Juega 100 rondas de Sky Climb", "Play 500 Sky Climb rounds": "Juega 500 rondas de Sky Climb",
  "Play 100 Video Poker hands": "Juega 100 manos de videopóquer", "Play 1000 Video Poker hands": "Juega 1000 manos de videopóquer",
  "Play 100 Ultimate Texas Hold'em hands (each seat you bet on counts)": "Juega 100 manos de Ultimate Texas Hold'em (cuenta cada asiento en el que apuestas)",
  "Play 1000 Ultimate Texas Hold'em hands (each seat you bet on counts)": "Juega 1000 manos de Ultimate Texas Hold'em (cuenta cada asiento en el que apuestas)",
  "Play 50 Baccarat hands": "Juega 50 manos de baccarat", "Play 100 Baccarat hands": "Juega 100 manos de baccarat", "Play 500 Baccarat hands": "Juega 500 manos de baccarat",
  "Win 3 Baccarat hands in a row": "Gana 3 manos de baccarat seguidas", "Play 50 Gene Cascade spins": "Juega 50 tiradas de Gene Cascade", "Play 100 Gene Cascade spins": "Juega 100 tiradas de Gene Cascade",
  "Play 500 Gene Cascade spins": "Juega 500 tiradas de Gene Cascade", "Land 3+ DNA vials to trigger free spins in Gene Cascade": "Consigue 3 o más viales de ADN para activar tiradas gratis en Gene Cascade",
  "Buy free spins in Gene Cascade": "Compra tiradas gratis en Gene Cascade", "Buy your first property": "Compra tu primer inmueble", "Own 10 properties at once": "Ten 10 inmuebles a la vez",
  "Earn 1 scoin in all-time real estate profit": "Gana 1 scoin en beneficios inmobiliarios totales", "Earn 10 scoin in all-time real estate profit": "Gana 10 scoin en beneficios inmobiliarios totales",
  "Sell 100 properties": "Vende 100 inmuebles", "Live through a real estate crash": "Sobrevive a un desplome inmobiliario", "Earn 1 scoin in all-time ETF profit": "Gana 1 scoin en beneficios totales del ETF",
  "Earn 10 scoin in all-time ETF profit": "Gana 10 scoin en beneficios totales del ETF", "Earn 10 scoin in all-time gold profit": "Gana 10 scoin en beneficios totales del oro",
  "Earn 10 scoin in all-time Broker ETF profit": "Gana 10 scoin en beneficios totales del ETF del bróker", "Earn 100 scoin in all-time Broker ETF profit": "Gana 100 scoin en beneficios totales del ETF del bróker",
  "Close 1 profitable trade in Live trading": "Cierra 1 operación con beneficio en Trading en vivo", "Close 10 profitable trades in Live trading": "Cierra 10 operaciones con beneficio en Trading en vivo",
  "Close 100 profitable trades in Live trading": "Cierra 100 operaciones con beneficio en Trading en vivo", "Earn 1 scoin in all-time gold profit": "Gana 1 scoin en beneficios totales del oro",
  "Fill the Broker ETF (10 scoin invested)": "Llena el ETF del bróker (10 scoin invertidos)", "Reach Investor level 5": "Llega al nivel de inversor 5", "Reach Investor level 25": "Llega al nivel de inversor 25",
  "Reach Investor level 50": "Llega al nivel de inversor 50", "Reach Investor level 99": "Llega al nivel de inversor 99", "Reach Logistics level 5": "Llega al nivel de logística 5",
  "Reach Logistics level 25": "Llega al nivel de logística 25", "Reach Logistics level 50": "Llega al nivel de logística 50", "Reach Logistics level 99": "Llega al nivel de logística 99",
  "Buy 15 semi-trucks": "Compra 15 camiones articulados", "Buy your first oil tanker": "Compra tu primer petrolero", "Buy 10 oil tankers": "Compra 10 petroleros",
  "Buy your first cargo plane": "Compra tu primer avión de carga", "Buy 5 cargo planes": "Compra 5 aviones de carga", "Fulfill 100 logistics contracts": "Cumple 100 contratos de logística",
  "Fulfill 1,000 logistics contracts": "Cumple 1.000 contratos de logística", "Fulfill 5,000 logistics contracts": "Cumple 5.000 contratos de logística", "Earn 1 scoin from logistics": "Gana 1 scoin con la logística",
  "Launch a satellite": "Lanza un satélite", "Earn 100 scoin from logistics": "Gana 100 scoin con la logística",
  "Submit a 50%+ match on an Easy painting": "Entrega una copia de un cuadro fácil con un 50% o más de parecido", "Submit a 75%+ match on an Easy painting": "Entrega una copia de un cuadro fácil con un 75% o más de parecido",
  "Submit a 90%+ match on an Easy painting": "Entrega una copia de un cuadro fácil con un 90% o más de parecido", "Submit a 50%+ match on a Medium painting": "Entrega una copia de un cuadro de dificultad media con un 50% o más de parecido",
  "Submit a 75%+ match on a Medium painting": "Entrega una copia de un cuadro de dificultad media con un 75% o más de parecido", "Submit a 90%+ match on a Medium painting": "Entrega una copia de un cuadro de dificultad media con un 90% o más de parecido",
  "Submit a 50%+ match on a Hard painting": "Entrega una copia de un cuadro difícil con un 50% o más de parecido", "Submit a 75%+ match on a Hard painting": "Entrega una copia de un cuadro difícil con un 75% o más de parecido",
  "Submit a 90%+ match on a Hard painting": "Entrega una copia de un cuadro difícil con un 90% o más de parecido",
  "Have 10 paintings in your collection": "Ten 10 cuadros en tu colección", "Have 50 paintings in your collection": "Ten 50 cuadros en tu colección", "Have 100 paintings in your collection": "Ten 100 cuadros en tu colección",
  "Buy every collection slot (100 slots)": "Compra todos los huecos de la colección (100 huecos)", "Sell 1 painting": "Vende 1 cuadro", "Sell 50 paintings": "Vende 50 cuadros",
  "Sell 100 paintings": "Vende 100 cuadros", "Sell 200 paintings": "Vende 200 cuadros", "Finish your first Gold Mine Dig run": "Termina tu primera partida en la mina de oro",
  "Finish 50 runs": "Termina 50 partidas", "Finish 200 runs": "Termina 200 partidas", "Reach a depth of 50 m": "Llega a 50 m de profundidad", "Reach a depth of 80 m": "Llega a 80 m de profundidad",
  "Reach a depth of 100 m": "Llega a 100 m de profundidad", "Bring back 100 coal": "Trae 100 de carbón", "Bring back 100 silver": "Trae 100 de plata", "Bring back 100 gold": "Trae 100 de oro",
  "Bring back your first diamond": "Trae tu primer diamante", "Come back to the surface with a completely full bag": "Vuelve a la superficie con la bolsa completamente llena",
  "Reach the surface with less than 3 lamp oil left": "Llega a la superficie con menos de 3 de aceite en la lámpara", "Get rescued for the first time": "Haz que te rescaten por primera vez",
  "Buy any Gold Mine Dig upgrade": "Compra cualquier mejora de la mina de oro", "Have 100 ore in your vault at once": "Ten 100 de mineral en tu cámara a la vez",
  "Max out any Gold Mine Dig upgrade": "Lleva al máximo cualquier mejora de la mina de oro", "Reach a depth of 150 m": "Llega a 150 m de profundidad",
  "Reach the bottom of the mine: 250 m": "Llega al fondo de la mina: 250 m", "Open your first treasure chest": "Abre tu primer cofre del tesoro", "Open 50 treasure chests": "Abre 50 cofres del tesoro",
  "Take the mine lift up": "Sube en el ascensor de la mina", "Take the mine lift up 20 times": "Sube en el ascensor de la mina 20 veces", "Max out every Gold Mine Dig upgrade": "Lleva al máximo todas las mejoras de la mina de oro",
  "Discover your first new species": "Descubre tu primera especie nueva", "Discover 10 species": "Descubre 10 especies", "Discover 50 species": "Descubre 50 especies", "Discover 100 species": "Descubre 100 especies",
  "Discover the Kraken": "Descubre el Kraken", "Discover the Elder dragon": "Descubre el Dragón ancestral", "Discover the Unicorn": "Descubre el Unicornio",
});
rx(String.raw`Unlocked (\d+)\/(\d+)\/(\d+)`, "Desbloqueado el $2/$1/$3");

/* ===================== 🛍️ SHOP ITEMS AND 🎁 REWARDS ===================== */
const COS_NAME = { "Wow So Rich": "«Wow So Rich»", "One Step Ahead": "«Un paso por delante»", "Royal": "de la Realeza", "Make It Rain": "«Lluvia de billetes»", "Emperor": "del Emperador",
  "Artist": "del Artista", "Bull Run": "del Mercado alcista", "Shark at the Table": "del Tiburón en la mesa", "Space Race": "de la Carrera espacial", "Global Network": "de la Red global",
  "Jackpot": "del Bote", "Mad Lab": "del Laboratorio loco", "Gold Rush": "de la Fiebre del oro", "Strongman": "del Forzudo", "Snake in a Top Hat": "de la Serpiente con chistera",
  "Dragon": "del Dragón", "Rat Hacker": "de la Rata hacker", "Cat Cowboy": "del Gato vaquero" };
const COS_KIND = { Collection: "Colección", Background: "Fondo", Coin: "Moneda", Cards: "Cartas", Deck: "Baraja" };
rx(String.raw`(?:The )?(${Object.keys(COS_NAME).join("|")}) (Collection|Background|Coin|Cards|Deck)`, (m, n, k) => `${COS_KIND[k]} ${COS_NAME[n]}`);
Object.assign(ES, {
  "Master Gambler Coin": "Moneda del Gran jugador", "Master Investor Coin": "Moneda del Gran inversor", "Master Logistics Coin": "Moneda del Gran logista",
  "Turn Master Gambler Coin on": "Activar la Moneda del Gran jugador", "Turn Master Investor Coin on": "Activar la Moneda del Gran inversor", "Turn Master Logistics Coin on": "Activar la Moneda del Gran logista",
  "Unlocked": "Desbloqueado", "Off": "Desactivado", "On": "Activado", "new": "nuevo",
  "Finish every achievement of a category to unlock its collection. Rewards can't be bought in the Shop.": "Completa todos los logros de una categoría para desbloquear su colección. Las recompensas no se pueden comprar en la Tienda.",
  "You finished every achievement it needs. Turn it on in 🏆 Achievements → 🎁 Rewards.": "Has completado todos los logros que necesita. Actívala en 🏆 Logros → 🎁 Recompensas.",
  "A very rich Shiba Inu tycoon counts his cash in a glittering office, behind the whole game.": "Un riquísimo magnate shiba inu cuenta sus billetes en un despacho reluciente, detrás de todo el juego.",
  "Replaces the golden coin you click with the Wow So Rich coin.": "Cambia la moneda dorada en la que haces clic por la moneda «Wow So Rich».",
  "A full deck with the Shiba tycoon on the Jacks, Queens, Kings and Joker, for every card game.": "Una baraja completa con el magnate shiba en las jotas, reinas, reyes y el comodín, para todos los juegos de cartas.",
  "A gentleman chimpanzee moves his golden knight in a grand chess library, always one step ahead, behind the whole game.": "Un chimpancé caballero mueve su caballo dorado en una gran biblioteca de ajedrez, siempre un paso por delante, detrás de todo el juego.",
  "Replaces the coin you click with the gentleman chimpanzee's gold medallion.": "Cambia la moneda en la que haces clic por el medallón de oro del chimpancé caballero.",
  "A full deck with the gentleman chimpanzee on the Jacks, Queens, Kings and Joker, for every card game.": "Una baraja completa con el chimpancé caballero en las jotas, reinas, reyes y el comodín, para todos los juegos de cartas.",
  "His Majesty the Cat, glowing over the whole game.": "Su Majestad el Gato, resplandeciendo sobre todo el juego.",
  "Replaces the coin you click with His Majesty's golden coin.": "Cambia la moneda en la que haces clic por la moneda dorada de Su Majestad.",
  "A full deck with His Majesty the Cat on the Jacks, Queens, Kings and Joker, for every card game.": "Una baraja completa con Su Majestad el Gato en las jotas, reinas, reyes y el comodín, para todos los juegos de cartas.",
  "The frog wizard casts his golden coin spell behind the whole game.": "El mago rana lanza su hechizo de monedas de oro detrás de todo el juego.",
  "Replaces the coin you click with the frog wizard's golden coin.": "Cambia la moneda en la que haces clic por la moneda dorada del mago rana.",
  "A full deck with the frog wizard on the Jacks, Queens, Kings and Joker, for every card game.": "Una baraja completa con el mago rana en las jotas, reinas, reyes y el comodín, para todos los juegos de cartas.",
  "The Lion Emperor on his golden throne, looking over his whole empire: city, casino, harbor, gold mines and a rocket launch, behind the whole game.": "El León Emperador en su trono dorado, contemplando todo su imperio: ciudad, casino, puerto, minas de oro y el lanzamiento de un cohete, detrás de todo el juego.",
  "Replaces the coin you click with the Lion Emperor's ruby-set gold medallion.": "Cambia la moneda en la que haces clic por el medallón de oro con rubíes del León Emperador.",
  "A full deck with the Lion Emperor as King, the Lioness Empress as Queen, the Lion Prince as Jack and the monkey jester as Joker, for every card game.": "Una baraja completa con el León Emperador de rey, la Leona Emperatriz de reina, el León Príncipe de jota y el mono bufón de comodín, para todos los juegos de cartas.",
  "The painter cat at work under a sky full of stars, behind the whole game.": "El gato pintor trabajando bajo un cielo lleno de estrellas, detrás de todo el juego.",
  "Replaces the coin you click with the painter cat's golden medallion.": "Cambia la moneda en la que haces clic por el medallón dorado del gato pintor.",
  "A penguin investor watches the bull charge up the market, behind the whole game.": "Un pingüino inversor mira cómo el toro dispara el mercado, detrás de todo el juego.",
  "Replaces the coin you click with the penguin investor's Bull Run coin.": "Cambia la moneda en la que haces clic por la moneda «Mercado alcista» del pingüino inversor.",
  "The tuxedo shark rakes in the pot under a deep-sea glass dome while his rivals sweat, behind the whole game.": "El tiburón de esmoquin se lleva el bote bajo una cúpula de cristal en el fondo del mar mientras sus rivales sudan, detrás de todo el juego.",
  "Replaces the coin you click with the shark's black-pearl medallion and his four aces.": "Cambia la moneda en la que haces clic por el medallón de perla negra del tiburón y sus cuatro ases.",
  "A rocket blasts past the satellites toward the Moon, behind the whole game.": "Un cohete pasa a toda velocidad junto a los satélites rumbo a la Luna, detrás de todo el juego.",
  "Replaces the coin you click with the golden rocket launch medallion.": "Cambia la moneda en la que haces clic por el medallón dorado del lanzamiento del cohete.",
  "The walrus shipping tycoon runs the world's freight from his harbor control tower, behind the whole game.": "La morsa magnate naviera dirige los envíos del mundo desde su torre de control del puerto, detrás de todo el juego.",
  "Replaces the coin you click with the walrus captain's golden shipping medallion.": "Cambia la moneda en la que haces clic por el medallón naviero dorado de la morsa capitana.",
  "The lucky fox rolls double six on a glittering Las Vegas casino floor, behind the whole game.": "El zorro con suerte saca un doble seis en un reluciente casino de Las Vegas, detrás de todo el juego.",
  "Replaces the coin you click with the winking fox's golden casino medallion.": "Cambia la moneda en la que haces clic por el medallón dorado de casino del zorro que guiña el ojo.",
  "Two raccoon scientists watch in shock as a spilled flask brings a cute winged mutant to life, behind the whole game.": "Dos mapaches científicos miran atónitos cómo un matraz derramado da vida a un adorable mutante con alas, detrás de todo el juego.",
  "Replaces the coin you click with the raccoon scientist's golden medallion.": "Cambia la moneda en la que haces clic por el medallón dorado del mapache científico.",
  "A happy mole miner strikes gold by lantern light deep in an old mine, behind the whole game.": "Un topo minero feliz encuentra oro a la luz del farol en lo más hondo de una vieja mina, detrás de todo el juego.",
  "Replaces the coin you click with the mole miner's golden medallion.": "Cambia la moneda en la que haces clic por el medallón dorado del topo minero.",
  "An obsidian and platinum casino chip with the gentleman fox and his winning hand. Only for Gambler level 99.": "Una ficha de casino de obsidiana y platino con el zorro caballero y su mano ganadora. Solo para el nivel de jugador 99.",
  "A glowing emerald crystal coin with the wise rose-gold owl and his rising chart. Only for Investor level 99.": "Una moneda de cristal de esmeralda brillante con el sabio búho de oro rosa y su gráfico al alza. Solo para el nivel de inversor 99.",
  "A sapphire and silver badge with the captain sea eagle over a compass rose. Only for Logistics level 99.": "Una insignia de zafiro y plata con el pigargo capitán sobre una rosa de los vientos. Solo para el nivel de logística 99.",
  "A hippo strongman loads the last Atlas stone onto its pillar while the crowd roars, behind the whole game.": "Un hipopótamo forzudo sube la última piedra de Atlas a su pilar mientras el público ruge, detrás de todo el juego.",
  "Replaces the coin you click with the hippo strongman's hammered iron medallion.": "Cambia la moneda en la que haces clic por el medallón de hierro forjado del hipopótamo forzudo.",
  "A full deck with the top-hatted snake family on the Jacks, Queens, Kings and Joker, for every card game. Reward for 🃏 Blackjack veteran.": "Una baraja completa con la familia de serpientes con chistera en las jotas, reinas, reyes y el comodín, para todos los juegos de cartas. Recompensa de 🃏 Veterano del blackjack.",
  "A full deck with the dragon court on the Jacks, Queens, Kings and Joker, for every card game. Reward for 🎴 Baccarat high society.": "Una baraja completa con la corte del dragón en las jotas, reinas, reyes y el comodín, para todos los juegos de cartas. Recompensa de 🎴 Alta sociedad del baccarat.",
  "A full deck with the rat hacker crew on the Jacks, Queens, Kings and Joker, for every card game. Reward for 🎴 Video Poker veteran.": "Una baraja completa con la banda de ratas hacker en las jotas, reinas, reyes y el comodín, para todos los juegos de cartas. Recompensa de 🎴 Veterano del videopóquer.",
  "A full deck with the cat cowboy posse on the Jacks, Queens, Kings and Joker, for every card game. Reward for 🤠 Ultimate Texas Hold'em veteran.": "Una baraja completa con la cuadrilla de gatos vaqueros en las jotas, reinas, reyes y el comodín, para todos los juegos de cartas. Recompensa de 🤠 Veterano del Ultimate Texas Hold'em.",
  // what unlocks each reward
  "Unlock every 🖼️ Art Gallery achievement": "Desbloquea todos los logros de 🖼️ Galería de arte", "Unlock every 📈 Investments achievement": "Desbloquea todos los logros de 📈 Inversiones",
  "Unlock 👑 Whale, 🀄 Four of a kind ×4, 🤠 Ultimate Texas Hold'em veteran and 🎴 Video Poker veteran": "Desbloquea 👑 Ballena, 🀄 Póquer ×4, 🤠 Veterano del Ultimate Texas Hold'em y 🎴 Veterano del videopóquer",
  "Unlock 🛰️ Eye in the sky, 🚀 Space race, 🌕 Lift-off! and 💥 Houston, we have a problem": "Desbloquea 🛰️ Ojo en el cielo, 🚀 Carrera espacial, 🌕 ¡Despegue! y 💥 Houston, tenemos un problema",
  "Unlock every 🚢 Logistics achievement": "Desbloquea todos los logros de 🚢 Logística", "Unlock every 🎰 Casino achievement": "Desbloquea todos los logros de 🎰 Casino",
  "Unlock ⛏️ Gold digger, ⛏️ Mining magnate, 🪨 Regular miner and 🟡 Golden touch": "Desbloquea ⛏️ Buscador de oro, ⛏️ Magnate minero, 🪨 Minero habitual y 🟡 Toque de oro",
  "Unlock 💎 Casino legend (Gambler level 99)": "Desbloquea 💎 Leyenda del casino (nivel de jugador 99)", "Unlock 🏛️ Market maker (Investor level 99)": "Desbloquea 🏛️ Creador de mercado (nivel de inversor 99)",
  "Unlock 🏆 Logistics legend (Logistics level 99)": "Desbloquea 🏆 Leyenda de la logística (nivel de logística 99)",
  "Unlock every 🧬 Genetics achievement except 🧬 Master of life": "Desbloquea todos los logros de 🧬 Genética excepto 🧬 Maestro de la vida",
  "Unlock 🃏 Blackjack veteran (1,000 hands)": "Desbloquea 🃏 Veterano del blackjack (1.000 manos)", "Unlock 🎴 Baccarat high society (500 hands)": "Desbloquea 🎴 Alta sociedad del baccarat (500 manos)",
  "Unlock 🎴 Video Poker veteran (1,000 hands)": "Desbloquea 🎴 Veterano del videopóquer (1.000 manos)", "Unlock 🤠 Ultimate Texas Hold'em veteran (1,000 hands)": "Desbloquea 🤠 Veterano del Ultimate Texas Hold'em (1.000 manos)",
  "Unlock ⚡ Wired for life and 🦾 Iron finger": "Desbloquea ⚡ Enchufado de por vida y 🦾 Dedo de hierro",
});
rx(String.raw`Reward unlocked: (.+)!`, (m, n) => { const x = esq(n); return x == null ? null : `Recompensa desbloqueada: ¡${x}!`; });

/* ===================== 🔬 SCIENCE (seen on the way) ===================== */
Object.assign(ES, {
  "University": "Universidad", "Research lab": "Laboratorio de investigación", "Space Mission Center": "Centro de Misiones Espaciales",
  "Astronomy Research Center": "Centro de Investigación Astronómica", "Orbital Space Station": "Estación Espacial Orbital", "Moon Base": "Base Lunar",
  "Trains 1 scientist every 2 minutes, up to 50. Until it's full it costs 5 / sec per empty place (−250 / sec at the start); with 50 scientists it earns +500 / sec.":
    "Forma 1 científico cada 2 minutos, hasta 50. Hasta que se llena cuesta 5 / s por plaza vacía (−250 / s al principio); con 50 científicos gana +500 / s.",
  "Every second a 1 in 7,200 chance of a scientific breakthrough: a Nobel Prize and 1000 scoin. Guaranteed at least every 2 hours.":
    "Cada segundo, 1 probabilidad entre 7.200 de un avance científico: un Premio Nobel y 1000 scoin. Garantizado al menos cada 2 horas.",
  "Launches a space mission every 20 minutes: 2000 scoin – 5000 scoin, with a 20% chance the mission fails. Unlocks a 🛰️ satellite in Logistics.":
    "Lanza una misión espacial cada 20 minutos: 2000 scoin – 5000 scoin, con un 20% de probabilidad de que fracase. Desbloquea un 🛰️ satélite en Logística.",
  "Needs 2 breakthroughs in your Research lab": "Requiere 2 avances en tu laboratorio de investigación",
  "Space missions launch 5 minutes sooner (every 15 instead of 20 minutes).": "Las misiones espaciales salen 5 minutos antes (cada 15 en vez de cada 20 minutos).",
  "Space missions fail 5% less often and launch 5 minutes sooner; the 🧪 Research lab's odds become 1 in 3,600 (a breakthrough guaranteed within 1 hour).":
    "Las misiones espaciales fracasan un 5% menos y salen 5 minutos antes; la probabilidad del 🧪 laboratorio de investigación pasa a 1 entre 3.600 (un avance garantizado en menos de 1 hora).",
  "Needs both Universities full (2 × 50)": "Requiere las dos universidades llenas (2 × 50)", "Needs the 🛸 Orbital Space Station": "Requiere la 🛸 Estación Espacial Orbital",
  "Needs 150 scientists: all three Universities full (3 × 50)": "Requiere 150 científicos: las tres universidades llenas (3 × 50)",
  "Launches a deep space mission every 20 minutes: 50.000 scoin – 70.000 scoin, with a 20% chance the mission fails.": "Lanza una misión al espacio profundo cada 20 minutos: 50.000 scoin – 70.000 scoin, con un 20% de probabilidad de que fracase.",
});
rx(String.raw`\/ (\d+) scientists`, "/ $1 científicos");
hrx(String.raw`\{i\}<b>(\d+)<\/b> \/ (\d+) scientists`, "{i}<b>$1</b> / $2 científicos");
rx(String.raw`(\d+) (?:\/ (\d+) )?scientists`, (m, a, b) => `${a}${b ? " / " + b : ""} científicos`);

Object.assign(ES, {
  "Amount (min 1,000)": "Cantidad (mín. 1.000)", "Amount (min 50,000)": "Cantidad (mín. 50.000)", "Amount": "Cantidad",
  "Cash-out amount": "Cantidad a retirar", "1,000 – 10,000,000": "1.000 – 10.000.000", "🔍 Search": "🔍 Buscar",
  "Red ball!": "¡Bola roja!", "You have": "Tienes", "BTC": "BTC", "ETH": "ETH", "SOL": "SOL", "Ξ": "Ξ",
  "Mutants come from pairs that don't make a real species.": "Los mutantes salen de parejas que no forman una especie real.",
  "They can't be spliced again and don't count as species.": "No se pueden volver a empalmar y no cuentan como especies.",
});
rx(String.raw`Your balloon popped and you lost (${NUM})\.`, "Tu globo ha explotado y has perdido $1.");
rx(String.raw`EXPRESS · (\d+)s left`, "EXPRÉS · quedan $1 s");
rx(String.raw`MA(\d+)`, "MA$1");
rx(String.raw`(\d+) \(MAX\)`, "$1 (MÁX.)");
rx(String.raw`[\d.,]+[kKMB]`, (m) => m);
rx(String.raw`\/ (\d+) species`, "/ $1 especies");
rx(String.raw`\+1 in`, "+1 en");
rx(String.raw`(Extinct|Mythical) (\d+\/\d+)`, (m, c, n) => `${c === "Extinct" ? "Extintas" : "Míticas"} ${n}`);
rx(String.raw`(.+?) (\d+\/\d+)`, (m, a, n) => { const x = esq(a); return x == null ? null : `${x} ${n}`; });

H("💼 Fix: <b>Tycoon's Legacy</b> now keeps your 🔬 Science buildings on every later reset too, not only on the reset you pick it (the satellite still resets).",
  "💼 Corrección: <b>Legado del magnate</b> ahora conserva tus edificios de 🔬 Ciencia también en todos los reinicios posteriores, no solo en el reinicio en que lo eliges (el satélite se sigue reiniciando).");

