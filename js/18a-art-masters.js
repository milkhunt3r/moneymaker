/* =====================================================================
   🏛️ MASTERPIECES (Art Gallery top tier): our own simplified versions of 10 famous public-domain paintings,
   drawn with simple shapes in the game's 24 colours (no photos, no copies of the real brushwork).
   paintArt(ctx, "master", seed) draws ART_MASTERS[seed % 10].
   ===================================================================== */
const ART_MASTERS = [
  { id: "starry", emoji: "🌌", name: "The Starry Night", artist: "Vincent van Gogh", year: 1889, draw(h) {
    const { P, rect, circ, ell, poly, line } = h;
    rect(P.navy, 0, 0, 320, 240);
    // the big swirls across the sky
    line(P.blue, 16, [[0, 70], [50, 58], [100, 74], [150, 92], [200, 82], [250, 66], [320, 72]]);
    line(P.sky, 9, [[20, 100], [70, 92], [120, 104], [170, 118], [220, 108], [270, 96], [320, 104]]);
    circ(P.blue, 150, 92, 26); circ(P.sky, 150, 92, 15); circ(P.navy, 150, 92, 7);
    // stars with halos, and the moon
    for (const [x, y, r] of [[40, 30, 9], [92, 44, 8], [205, 36, 9], [130, 22, 7], [250, 120, 7], [60, 128, 7]]) { circ(P.turquoise, x, y, r + 7); circ(P.yellow, x, y, r); }
    circ(P.yellow, 280, 36, 24); circ(P.orange, 280, 36, 15); circ(P.navy, 290, 30, 12);
    // hills and the village
    poly(P.blue, [[0, 170], [70, 150], [150, 160], [230, 140], [320, 152], [320, 240], [0, 240]]);
    poly(P.teal, [[0, 196], [100, 184], [200, 192], [320, 180], [320, 240], [0, 240]]);
    for (const [x, w] of [[110, 22], [140, 18], [170, 24], [205, 20], [238, 22], [270, 18]]) {
      rect(P.navy, x, 196, w, 18); poly(P.black, [[x - 3, 196], [x + w / 2, 186], [x + w + 3, 196]]); rect(P.yellow, x + w / 2 - 3, 202, 6, 6);
    }
    poly(P.black, [[190, 196], [197, 150], [204, 196]]);   // church spire
    // the cypress tree in front
    poly(P.black, [[30, 240], [44, 150], [52, 90], [60, 30], [70, 92], [82, 160], [96, 240]]);
    line(P.olive, 5, [[50, 230], [58, 120], [62, 60]]);
  } },
  { id: "wave", emoji: "🌊", name: "The Great Wave off Kanagawa", artist: "Katsushika Hokusai", year: 1831, draw(h) {
    const { P, rect, circ, ell, poly, line } = h;
    rect(P.beige, 0, 0, 320, 240); rect(P.tan, 0, 0, 320, 18);
    // Mount Fuji, small in the distance
    poly(P.navy, [[170, 190], [205, 150], [240, 190]]); poly(P.white, [[196, 161], [205, 150], [214, 161], [205, 166]]);
    // the sea
    rect(P.blue, 0, 190, 320, 50);
    poly(P.navy, [[200, 200], [260, 178], [320, 190], [320, 240], [180, 240]]);
    circ(P.white, 262, 180, 6); circ(P.white, 278, 184, 5); circ(P.white, 296, 186, 6);
    // the great wave rolling in from the left
    poly(P.navy, [[0, 240], [0, 120], [30, 70], [80, 35], [140, 25], [190, 40], [205, 70], [180, 62], [150, 64], [130, 90], [120, 140], [110, 200], [90, 240]]);
    poly(P.blue, [[20, 240], [30, 150], [55, 100], [95, 66], [140, 56], [150, 64], [130, 90], [120, 140], [110, 200], [90, 240]]);
    line(P.sky, 5, [[40, 210], [55, 150], [85, 110], [125, 80]]);
    // white claws of foam on the crest
    for (const [x, y, r] of [[140, 28, 10], [160, 32, 9], [178, 40, 8], [192, 52, 8], [200, 66, 7], [120, 30, 9], [100, 36, 8]]) circ(P.white, x, y, r);
    for (const [x, y] of [[188, 74], [176, 70], [164, 68]]) circ(P.white, x, y, 5);
    // the boats
    ell(P.tan, 150, 200, 44, 9, -0.25); ell(P.tan, 60, 222, 40, 8, 0.3);
    for (const x of [134, 146, 158]) circ(P.navy, x, 194, 3);
  } },
  { id: "sunflowers", emoji: "🌻", name: "Sunflowers", artist: "Vincent van Gogh", year: 1888, draw(h) {
    const { P, rect, circ, ell, poly, line } = h;
    rect(P.yellow, 0, 0, 320, 240); rect(P.ochre, 0, 180, 320, 60); rect(P.brown, 0, 178, 320, 4);
    // the vase
    poly(P.orange, [[126, 170], [194, 170], [204, 232], [116, 232]]); rect(P.yellow, 116, 196, 88, 36);
    line(P.blue, 3, [[118, 196], [202, 196]]);
    // stems and leaves
    for (const [x, y] of [[100, 60], [150, 40], [205, 55], [80, 110], [240, 110], [160, 100]]) line(P.green, 5, [[160, 175], [x, y]]);
    ell(P.olive, 115, 150, 22, 8, 0.6); ell(P.olive, 210, 150, 22, 8, -0.6);
    // the sunflowers: orange petals around a brown middle
    const flower = (x, y, r, petal) => { for (let i = 0; i < 10; i++) { const a = i / 10 * Math.PI * 2; ell(petal, x + Math.cos(a) * r, y + Math.sin(a) * r, r * 0.55, r * 0.28, a); } circ(P.brown, x, y, r * 0.65); };
    flower(100, 60, 26, P.orange); flower(150, 40, 22, P.orange); flower(205, 55, 26, P.orange);
    flower(80, 110, 22, P.orange); flower(240, 110, 24, P.orange); flower(160, 100, 26, P.orange);
    circ(P.olive, 260, 160, 12); circ(P.lime, 262, 158, 6);   // one closed bud
  } },
  { id: "scream", emoji: "😱", name: "The Scream", artist: "Edvard Munch", year: 1893, draw(h) {
    const { P, rect, circ, ell, poly, line } = h;
    rect(P.orange, 0, 0, 320, 240);
    // the burning sky in wavy bands
    line(P.red, 14, [[0, 30], [60, 18], [120, 34], [190, 22], [260, 36], [320, 24]]);
    line(P.yellow, 10, [[0, 64], [70, 52], [140, 68], [210, 56], [280, 70], [320, 60]]);
    line(P.salmon, 8, [[0, 92], [80, 84], [160, 98], [240, 88], [320, 96]]);
    // the dark blue fjord swirling on the right
    poly(P.navy, [[110, 110], [200, 100], [320, 108], [320, 240], [140, 240], [120, 180]]);
    line(P.blue, 10, [[150, 140], [210, 126], [270, 142], [320, 132]]);
    line(P.turquoise, 8, [[160, 190], [230, 172], [290, 190]]);
    // the bridge running in from the bottom left
    poly(P.maroon, [[0, 160], [140, 104], [170, 106], [80, 240], [0, 240]]);
    line(P.black, 4, [[0, 150], [150, 98]]); line(P.orange, 3, [[0, 176], [152, 108]]);
    // two people far away on the bridge
    rect(P.black, 120, 96, 7, 20); circ(P.black, 123, 94, 4); rect(P.black, 134, 94, 7, 20); circ(P.black, 137, 92, 4);
    // the screaming figure
    poly(P.black, [[120, 240], [128, 190], [150, 160], [178, 162], [188, 196], [196, 240]]);
    ell(P.beige, 160, 136, 22, 30);
    ell(P.black, 151, 130, 5, 8); ell(P.black, 169, 130, 5, 8); ell(P.black, 160, 152, 5, 9);
    ell(P.beige, 133, 140, 6, 20, 0.2); ell(P.beige, 187, 140, 6, 20, -0.2);   // hands on the cheeks
  } },
  { id: "monalisa", emoji: "🖼️", name: "Mona Lisa", artist: "Leonardo da Vinci", year: 1503, draw(h) {
    const { P, rect, circ, ell, poly, line } = h;
    // misty landscape behind her
    rect(P.olive, 0, 0, 320, 240); rect(P.turquoise, 0, 0, 320, 50); rect(P.ochre, 0, 50, 320, 26);
    poly(P.green, [[0, 120], [60, 90], [110, 104], [110, 240], [0, 240]]); poly(P.green, [[210, 100], [270, 80], [320, 96], [320, 240], [210, 240]]);
    line(P.sky, 6, [[10, 200], [50, 160], [30, 130], [70, 108]]); line(P.brown, 5, [[310, 200], [270, 160], [292, 130], [262, 110]]);
    // dark dress and shoulders
    poly(P.black, [[70, 240], [90, 170], [125, 140], [195, 140], [230, 170], [250, 240]]);
    poly(P.ochre, [[125, 150], [160, 175], [195, 150], [190, 165], [160, 186], [130, 165]]);
    // her hands resting at the bottom
    ell(P.beige, 140, 226, 30, 12, 0.15); ell(P.beige, 180, 222, 28, 11, -0.1);
    // dark hair around the face, then the face with its famous smile
    ell(P.black, 160, 92, 46, 60); rect(P.black, 116, 92, 88, 60);
    ell(P.beige, 160, 92, 30, 40); rect(P.beige, 150, 126, 20, 18);
    ell(P.brown, 148, 86, 5, 3); ell(P.brown, 172, 86, 5, 3);
    line(P.brown, 2, [[150, 112], [160, 115], [170, 112]]);
  } },
  { id: "pearl", emoji: "💎", name: "Girl with a Pearl Earring", artist: "Johannes Vermeer", year: 1665, draw(h) {
    const { P, rect, circ, ell, poly, line } = h;
    rect(P.black, 0, 0, 320, 240);
    // yellow-brown jacket and white collar
    poly(P.ochre, [[90, 240], [110, 186], [170, 168], [232, 190], [250, 240]]); poly(P.brown, [[200, 196], [232, 190], [250, 240], [214, 240]]);
    poly(P.white, [[122, 190], [168, 176], [182, 196], [140, 206]]);
    // face, turned over her shoulder
    ell(P.beige, 152, 120, 40, 52); rect(P.beige, 140, 150, 30, 34);
    // blue turban with the yellow cloth falling down the back
    ell(P.blue, 168, 74, 50, 30, -0.2); poly(P.blue, [[120, 80], [150, 52], [214, 56], [210, 92], [170, 92]]);
    poly(P.yellow, [[200, 70], [236, 76], [248, 150], [222, 156], [214, 100]]);
    ell(P.yellow, 160, 62, 30, 8, -0.2);
    // eyes, lips and the pearl
    ell(P.black, 136, 116, 6, 4); ell(P.black, 166, 112, 5, 4);
    ell(P.salmon, 144, 152, 8, 4);
    circ(P.gray, 188, 154, 9); circ(P.white, 186, 151, 5);
  } },
  { id: "sunrise", emoji: "🌅", name: "Impression, Sunrise", artist: "Claude Monet", year: 1872, draw(h) {
    const { P, rect, circ, ell, poly, line } = h;
    // misty blue-grey harbour
    rect(P.slate, 0, 0, 320, 240); rect(P.teal, 0, 130, 320, 110);
    // faint cranes and chimneys in the mist
    for (const x of [30, 52, 240, 262, 290]) line(P.sky, 4, [[x, 130], [x, 60 + (x % 30)]]);
    line(P.sky, 3, [[52, 70], [80, 82]]); line(P.sky, 3, [[262, 76], [236, 90]]);
    // the orange sun and its reflection on the water
    circ(P.orange, 190, 82, 16);
    for (let i = 0; i < 6; i++) rect(P.orange, 178 + (i % 2) * 6, 140 + i * 15, 26 - i * 2, 5);
    line(P.salmon, 3, [[150, 110], [230, 106]]);
    // small dark boats with rowers
    const boat = (x, y, s) => { ell(P.navy, x, y, 22 * s, 5 * s); rect(P.navy, x - 4 * s, y - 16 * s, 6 * s, 14 * s); circ(P.navy, x - 1 * s, y - 18 * s, 4 * s); };
    boat(130, 190, 1.4); boat(90, 162, 1); boat(230, 170, 0.9);
    line(P.blue, 4, [[0, 216], [80, 212]]); line(P.blue, 4, [[220, 222], [320, 218]]);
  } },
  { id: "redfuji", emoji: "🗻", name: "Red Fuji (Fine Wind, Clear Morning)", artist: "Katsushika Hokusai", year: 1831, draw(h) {
    const { P, rect, circ, ell, poly, line } = h;
    rect(P.blue, 0, 0, 320, 240); rect(P.sky, 0, 60, 320, 180);
    // rows of small white clouds
    for (let r = 0; r < 4; r++) for (let x = (r % 2) * 18; x < 320; x += 36) ell(P.white, x, 30 + r * 16, 14, 5);
    // the red mountain with its dark snowy top
    poly(P.red, [[0, 240], [110, 120], [140, 92], [190, 92], [220, 120], [320, 220], [320, 240]]);
    poly(P.navy, [[118, 112], [140, 92], [190, 92], [212, 112], [196, 124], [178, 108], [160, 126], [142, 110]]);
    for (const x of [148, 166, 184]) line(P.white, 4, [[x, 96], [x - 6, 120]]);
    line(P.maroon, 5, [[60, 200], [120, 150]]); line(P.maroon, 5, [[250, 200], [210, 150]]);
    // dark green forest at the foot
    poly(P.green, [[0, 240], [0, 206], [60, 196], [120, 210], [180, 200], [240, 214], [320, 206], [320, 240]]);
    for (let x = 10; x < 320; x += 26) circ(P.olive, x, 222, 9);
  } },
  { id: "bedroom", emoji: "🛏️", name: "The Bedroom", artist: "Vincent van Gogh", year: 1888, draw(h) {
    const { P, rect, circ, ell, poly, line } = h;
    // blue walls, a sloping floor
    rect(P.lavender, 0, 0, 320, 240);
    poly(P.blue, [[0, 0], [70, 30], [70, 150], [0, 190]]);           // left wall
    poly(P.lime, [[0, 190], [70, 150], [260, 150], [320, 200], [320, 240], [0, 240]]);   // floor
    line(P.olive, 3, [[40, 240], [110, 150]]); line(P.olive, 3, [[140, 240], [160, 150]]);
    // window and pictures on the wall
    rect(P.turquoise, 110, 36, 46, 56); line(P.white, 3, [[133, 36], [133, 92]]); line(P.white, 3, [[110, 64], [156, 64]]);
    rect(P.orange, 190, 40, 30, 36); rect(P.yellow, 230, 50, 26, 30); rect(P.red, 196, 46, 18, 24);
    // the big wooden bed on the right with the red blanket
    poly(P.orange, [[200, 110], [320, 120], [320, 240], [180, 240]]);
    poly(P.red, [[190, 170], [320, 160], [320, 240], [170, 240]]);
    ell(P.white, 232, 136, 26, 12); ell(P.white, 282, 140, 26, 12);
    // two yellow chairs and a small table
    poly(P.yellow, [[40, 190], [80, 186], [86, 216], [44, 222]]); rect(P.yellow, 44, 150, 6, 42); rect(P.yellow, 72, 150, 6, 40);
    poly(P.yellow, [[140, 176], [170, 172], [172, 196], [142, 200]]); rect(P.yellow, 144, 140, 5, 36);
    rect(P.tan, 84, 140, 40, 8); rect(P.tan, 88, 148, 5, 30); rect(P.tan, 116, 148, 5, 30);
    circ(P.blue, 96, 134, 6); rect(P.white, 106, 128, 8, 12);
  } },
  { id: "poppies", emoji: "🌺", name: "Poppy Field", artist: "Claude Monet", year: 1873, draw(h) {
    const { P, rect, circ, ell, poly, line } = h;
    rect(P.sky, 0, 0, 320, 240);
    // soft white clouds
    for (const [x, y, s] of [[50, 40, 1], [150, 26, 1.3], [250, 50, 1.1]]) { ell(P.white, x, y, 36 * s, 14 * s); ell(P.white, x + 24 * s, y - 8 * s, 22 * s, 12 * s); }
    // a row of dark trees on the hill and a little house
    poly(P.green, [[0, 120], [80, 108], [160, 112], [240, 100], [320, 110], [320, 140], [0, 140]]);
    for (let x = 10; x < 320; x += 30) circ(P.olive, x, 106 + (x % 3) * 4, 16);
    rect(P.white, 230, 104, 22, 14); poly(P.red, [[226, 104], [241, 94], [256, 104]]);
    // the meadow and the long red streak of poppies
    poly(P.lime, [[0, 140], [320, 140], [320, 240], [0, 240]]);
    poly(P.green, [[180, 140], [320, 140], [320, 240], [240, 240]]);
    for (const [x, y] of [[20, 200], [40, 186], [60, 172], [80, 160], [100, 150], [36, 220], [62, 204], [88, 188], [112, 172], [130, 158], [70, 230], [104, 214], [130, 196], [150, 176], [20, 166], [140, 230]]) circ(P.red, x, y, 6);
    // the two pairs walking through the field (mother with an umbrella and her child)
    const pair = (x, y, s) => { poly(P.navy, [[x - 8 * s, y], [x, y - 32 * s], [x + 8 * s, y]]); circ(P.beige, x, y - 34 * s, 4 * s); ell(P.navy, x - 4 * s, y - 44 * s, 12 * s, 6 * s);
      rect(P.white, x + 12 * s, y - 16 * s, 6 * s, 16 * s); circ(P.beige, x + 15 * s, y - 19 * s, 3 * s); };
    pair(200, 220, 1.4); pair(90, 140, 0.8);
  } },
];
