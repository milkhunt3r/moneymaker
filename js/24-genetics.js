/* =====================================================================
   🧬 GENE SPLICER (🎮 Mini-games, secret: opens once the 🧬 Genetics Laboratory is bought, after the 2nd prestige).
   Start with 5 DNA samples (Human, Fish, Lizard, Spider, Plant). Put two in the splicer: if they make a species,
   it goes into your ❄️ freezer. 150 species to find (recipe book: GENE_RECIPES below).
   - First discovery pays minutes of income by rarity: common 1, uncommon 2, rare 5, extinct 15, mythical 30.
     Splicing a species you already know pays nothing (you just get one more DNA sample of it).
   - DNA: up to 3 samples of each species. Every 10 minutes every species you know gets +1.
     A splice uses 1 of each (2 if both are the same); a pair that is not a recipe makes a 🧪 mutant (see MUTATIONS).
   - 💡 Hint: 10 scientists reveal one recipe you can make right now.
   - A prestige never resets it (like all mini-games).
   ===================================================================== */
// [sample A, sample B, result, emoji, category, rarity, why]  rarity: c common, u uncommon, r rare, e extinct, l mythical
const GENE_RECIPES = [
  ["Fish", "Fish", "Shark", "🦈", "aqua", "u", "A fish built for hunting"],
  ["Lizard", "Lizard", "Dinosaur", "🦕", "ext", "e", "A lizard, but much, much bigger"],
  ["Spider", "Spider", "Scorpion", "🦂", "bug", "c", "Eight legs plus a stinger"],
  ["Plant", "Plant", "Tree", "🌳", "plant", "c", "Lots of plant grows into a tree"],
  ["Human", "Human", "Ape", "🦍", "mam", "c", "Our closest relatives"],
  ["Fish", "Human", "Mermaid", "🧜", "myth", "l", "Half fish, half human"],
  ["Fish", "Lizard", "Frog", "🐸", "rept", "c", "The first animals to leave the water were in between"],
  ["Fish", "Spider", "Crab", "🦀", "aqua", "c", "Legs and claws, living in the sea"],
  ["Fish", "Plant", "Seaweed", "🌿", "plant", "c", "A plant that lives in the sea"],
  ["Lizard", "Spider", "Centipede", "🐛", "bug", "c", "A long body with far too many legs"],
  ["Lizard", "Plant", "Iguana", "🦎", "rept", "c", "A lizard that eats leaves"],
  ["Lizard", "Human", "Lizardfolk", "🧌", "myth", "l", "Scaly people from old legends"],
  ["Spider", "Human", "Arachne", "🕸️", "myth", "l", "The weaver of Greek myth, turned into a spider"],
  ["Spider", "Plant", "Venus flytrap", "🪴", "plant", "u", "A plant that traps bugs like a spider"],
  ["Plant", "Human", "Dryad", "🍃", "myth", "l", "A tree spirit from Greek myth"],
  ["Plant", "Tree", "Flower", "🌸", "plant", "c", "What trees and plants grow to attract bees"],
  ["Centipede", "Plant", "Worm", "🪱", "bug", "c", "Lives in the soil under the plants"],
  ["Lizard", "Worm", "Snake", "🐍", "rept", "c", "A lizard that lost its legs"],
  ["Spider", "Tree", "Ant", "🐜", "bug", "c", "Tiny climbers that live in colonies"],
  ["Ant", "Flower", "Bee", "🐝", "bug", "c", "A flying worker that loves flowers"],
  ["Worm", "Flower", "Caterpillar", "🐛", "bug", "c", "A worm-like baby that eats leaves"],
  ["Caterpillar", "Tree", "Butterfly", "🦋", "bug", "u", "It hangs in a tree and changes"],
  ["Ant", "Scorpion", "Beetle", "🪲", "bug", "c", "An armoured insect"],
  ["Scorpion", "Plant", "Cactus", "🌵", "plant", "c", "A spiky plant from the scorpion's desert"],
  ["Tree", "Worm", "Mushroom", "🍄", "plant", "c", "Grows where old wood rots"],
  ["Seaweed", "Seaweed", "Coral", "🪸", "aqua", "u", "A sea forest builds a reef"],
  ["Dinosaur", "Tree", "Bird", "🐦", "bird", "u", "Small dinosaurs learned to glide from the trees"],
  ["Lizard", "Bird", "Archaeopteryx", "🪶", "ext", "e", "The famous half-dinosaur, half-bird"],
  ["Ant", "Bird", "Fly", "🪰", "bug", "c", "A bug that learned to fly"],
  ["Fly", "Human", "Mosquito", "🦟", "bug", "c", "A fly that wants your blood"],
  ["Fly", "Plant", "Grasshopper", "🦗", "bug", "c", "A jumping leaf-eater"],
  ["Fly", "Fish", "Dragonfly", "🪰", "bug", "u", "Its young grow up in ponds"],
  ["Lizard", "Ape", "Mouse", "🐁", "mam", "c", "The first mammals were small and lizard-like"],
  ["Mouse", "Mouse", "Rat", "🐀", "mam", "c", "A bigger, tougher mouse"],
  ["Mouse", "Bird", "Bat", "🦇", "mam", "u", "A mammal that flies"],
  ["Mouse", "Tree", "Squirrel", "🐿️", "mam", "c", "A mouse that lives in trees"],
  ["Mouse", "Plant", "Rabbit", "🐇", "mam", "c", "A grass-eater with big ears"],
  ["Mouse", "Human", "Cat", "🐈", "mam", "c", "People kept cats to catch mice"],
  ["Cat", "Cat", "Tiger", "🐅", "mam", "u", "A very big cat"],
  ["Cat", "Tiger", "Lion", "🦁", "mam", "u", "The king of the big cats"],
  ["Rat", "Tiger", "Wolf", "🐺", "mam", "u", "A hunter that works in a pack"],
  ["Wolf", "Human", "Dog", "🐕", "mam", "c", "Wolves that came to live with people"],
  ["Wolf", "Rabbit", "Fox", "🦊", "mam", "c", "A small hunter of rabbits"],
  ["Wolf", "Ape", "Bear", "🐻", "mam", "u", "A huge omnivore"],
  ["Bear", "Plant", "Panda", "🐼", "mam", "r", "A bear that eats bamboo"],
  ["Rabbit", "Tree", "Deer", "🦌", "mam", "c", "A forest grazer"],
  ["Deer", "Human", "Horse", "🐎", "mam", "c", "A grazer people learned to ride"],
  ["Deer", "Plant", "Cow", "🐄", "mam", "c", "A grazer that eats grass all day"],
  ["Deer", "Cow", "Goat", "🐐", "mam", "c", "A sure-footed farm animal"],
  ["Cow", "Rat", "Pig", "🐖", "mam", "c", "A farm animal that eats anything"],
  ["Horse", "Tiger", "Zebra", "🦓", "mam", "u", "A horse with stripes"],
  ["Horse", "Lizard", "Camel", "🐫", "mam", "u", "A horse for the desert"],
  ["Cow", "Snake", "Elephant", "🐘", "mam", "r", "A giant with a snake-like trunk"],
  ["Cow", "Beetle", "Rhino", "🦏", "mam", "r", "Armour and a horn, like a rhino beetle"],
  ["Cow", "Fish", "Hippo", "🦛", "mam", "r", "Its name means 'river horse'"],
  ["Ape", "Ape", "Gorilla", "🦍", "mam", "u", "The biggest ape"],
  ["Ape", "Tree", "Monkey", "🐒", "mam", "c", "An ape that lives in the trees"],
  ["Ape", "Plant", "Sloth", "🦥", "mam", "u", "A very slow leaf-eater"],
  ["Rat", "Worm", "Mole", "🐀", "mam", "u", "A digger, just like our miner"],
  ["Mouse", "Cactus", "Hedgehog", "🦔", "mam", "c", "A mouse covered in spikes"],
  ["Mouse", "Turtle", "Armadillo", "🦔", "mam", "u", "A mammal in a suit of armour"],
  ["Seal", "Elephant", "Walrus", "🦭", "mam", "r", "A seal with tusks"],
  ["Dog", "Fish", "Seal", "🦭", "mam", "u", "A 'sea dog'"],
  ["Duck", "Mouse", "Platypus", "🦆", "mam", "r", "A mammal with a duck's bill that lays eggs"],
  ["Shark", "Ape", "Dolphin", "🐬", "aqua", "u", "A clever mammal of the sea"],
  ["Dolphin", "Dolphin", "Whale", "🐋", "aqua", "r", "The biggest animal ever"],
  ["Dolphin", "Shark", "Orca", "🐋", "aqua", "r", "The killer whale"],
  ["Dolphin", "Rhino", "Narwhal", "🦄", "aqua", "r", "The unicorn of the sea"],
  ["Shark", "Bird", "Manta ray", "🐟", "aqua", "r", "It 'flies' through the water"],
  ["Fish", "Crab", "Shrimp", "🦐", "aqua", "c", "A small swimmer with a shell"],
  ["Crab", "Scorpion", "Lobster", "🦞", "aqua", "u", "Big claws and a long tail"],
  ["Fish", "Centipede", "Octopus", "🐙", "aqua", "u", "Eight arms in the sea"],
  ["Octopus", "Fish", "Squid", "🦑", "aqua", "u", "A fast cousin of the octopus"],
  ["Coral", "Fish", "Clownfish", "🐠", "aqua", "c", "Lives in the reef"],
  ["Coral", "Squid", "Jellyfish", "🪼", "aqua", "u", "A floating, stinging blob"],
  ["Coral", "Crab", "Starfish", "⭐", "aqua", "c", "A reef crawler with five arms"],
  ["Horse", "Fish", "Seahorse", "🐴", "aqua", "u", "A tiny fish with a horse's head"],
  ["Snake", "Fish", "Eel", "🐍", "aqua", "c", "A fish shaped like a snake"],
  ["Lizard", "Shark", "Crocodile", "🐊", "rept", "u", "A lizard that hunts in the water"],
  ["Lizard", "Dinosaur", "Komodo dragon", "🦎", "rept", "r", "The biggest lizard alive today"],
  ["Lizard", "Beetle", "Turtle", "🐢", "rept", "c", "A reptile in a shell"],
  ["Turtle", "Plant", "Tortoise", "🐢", "rept", "u", "A slow land turtle that eats plants"],
  ["Lizard", "Flower", "Chameleon", "🦎", "rept", "u", "Changes colour like flowers"],
  ["Frog", "Lizard", "Salamander", "🦎", "rept", "c", "A lizard-shaped amphibian"],
  ["Salamander", "Fish", "Axolotl", "🦎", "rept", "r", "A salamander that never leaves the water"],
  ["Frog", "Flower", "Poison dart frog", "🐸", "rept", "r", "Bright colours mean 'don't eat me'"],
  ["Snake", "Scorpion", "Cobra", "🐍", "rept", "u", "A snake with deadly venom"],
  ["Bird", "Human", "Pigeon", "🕊️", "bird", "c", "The city bird"],
  ["Bird", "Snake", "Eagle", "🦅", "bird", "u", "A bird of prey that eats snakes"],
  ["Bird", "Cat", "Owl", "🦉", "bird", "u", "A night hunter with a cat-like face"],
  ["Bird", "Ape", "Parrot", "🦜", "bird", "u", "A bird that can talk"],
  ["Bird", "Cow", "Chicken", "🐔", "bird", "c", "A farm bird"],
  ["Bird", "Frog", "Duck", "🦆", "bird", "c", "A pond bird"],
  ["Bird", "Fish", "Penguin", "🐧", "bird", "u", "A bird that swims instead of flying"],
  ["Bird", "Shrimp", "Flamingo", "🦩", "bird", "u", "Pink from eating shrimp"],
  ["Bird", "Flower", "Peacock", "🦚", "bird", "r", "A tail like a bunch of flowers"],
  ["Beetle", "Flower", "Ladybug", "🐞", "bug", "c", "A spotted beetle in the garden"],
  ["Spider", "Grasshopper", "Praying mantis", "🦗", "bug", "u", "A hunter that waits very still"],
  ["Bee", "Scorpion", "Wasp", "🐝", "bug", "c", "A bee with a meaner sting"],
  ["Spider", "Mouse", "Tarantula", "🕷️", "bug", "u", "A big, hairy spider"],
  ["Mushroom", "Ant", "Zombie fungus", "🍄", "plant", "r", "A real fungus that takes over ants"],
  ["Tree", "Human", "Treefolk", "🌳", "myth", "l", "A walking, talking tree"],
  ["Mushroom", "Human", "Mandrake", "🌱", "myth", "l", "A root that screams when pulled out"],
  ["Dinosaur", "Dinosaur", "T-Rex", "🦖", "ext", "e", "The king of the dinosaurs"],
  ["Dinosaur", "Plant", "Brachiosaurus", "🦕", "ext", "e", "A long-necked plant-eater"],
  ["Dinosaur", "Rhino", "Triceratops", "🦕", "ext", "e", "Three horns and a big frill"],
  ["Dinosaur", "Armadillo", "Ankylosaurus", "🦕", "ext", "e", "A dinosaur tank with a club tail"],
  ["Dinosaur", "Bat", "Pterodactyl", "🦅", "ext", "e", "A flying reptile"],
  ["Dinosaur", "Shark", "Megalodon", "🦈", "ext", "e", "A shark as big as a bus"],
  ["Dinosaur", "Fish", "Coelacanth", "🐟", "aqua", "r", "A 'living fossil' fish, still alive today"],
  ["Dinosaur", "Crab", "Trilobite", "🪲", "ext", "e", "An ancient sea bug"],
  ["Dinosaur", "Squid", "Ammonite", "🐚", "ext", "e", "An ancient squid in a spiral shell"],
  ["Dinosaur", "Dolphin", "Ichthyosaur", "🐬", "ext", "e", "A sea reptile shaped like a dolphin"],
  ["Dinosaur", "Seal", "Plesiosaur", "🦕", "ext", "e", "A long-necked sea reptile"],
  ["Dinosaur", "Elephant", "Mammoth", "🦣", "ext", "e", "A woolly elephant of the ice age"],
  ["Dinosaur", "Cat", "Sabre-toothed cat", "🐅", "ext", "e", "A cat with huge fangs"],
  ["Dinosaur", "Wolf", "Dire wolf", "🐺", "ext", "e", "A giant ice-age wolf"],
  ["Dinosaur", "Human", "Neanderthal", "🧔", "ext", "e", "Our ancient cousins"],
  ["Dinosaur", "Pigeon", "Dodo", "🦤", "ext", "e", "A bird that couldn't fly away"],
  ["Dinosaur", "Snake", "Titanoboa", "🐍", "ext", "e", "A snake as long as a bus"],
  ["Dinosaur", "Dragonfly", "Meganeura", "🪰", "ext", "e", "A dragonfly the size of a hawk"],
  ["Dinosaur", "Eagle", "Dragon", "🐉", "myth", "l", "A giant winged lizard"],
  ["Dragon", "Dragon", "Elder dragon", "🐲", "myth", "l", "The oldest dragon of them all"],
  ["Peacock", "Dragon", "Phoenix", "🔥", "myth", "l", "A fiery bird reborn from its ashes"],
  ["Horse", "Narwhal", "Unicorn", "🦄", "myth", "l", "A horse with one horn"],
  ["Horse", "Bird", "Pegasus", "🪽", "myth", "l", "The winged horse"],
  ["Horse", "Human", "Centaur", "🏹", "myth", "l", "Half human, half horse"],
  ["Eagle", "Lion", "Griffin", "🦅", "myth", "l", "Eagle at the front, lion at the back"],
  ["Eagle", "Horse", "Hippogriff", "🦅", "myth", "l", "Half eagle, half horse"],
  ["Eagle", "Human", "Harpy", "🦅", "myth", "l", "A bird-woman of Greek myth"],
  ["Lion", "Human", "Sphinx", "🦁", "myth", "l", "A lion with a human head and riddles"],
  ["Lion", "Scorpion", "Manticore", "🦁", "myth", "l", "A lion with a scorpion's tail"],
  ["Lion", "Goat", "Chimera", "🐐", "myth", "l", "Lion, goat and snake in one"],
  ["Cow", "Human", "Minotaur", "🐂", "myth", "l", "A bull-headed man in a maze"],
  ["Snake", "Snake", "Hydra", "🐍", "myth", "l", "Cut off one head and two grow back"],
  ["Snake", "Human", "Medusa", "🐍", "myth", "l", "Snakes for hair; one look turns you to stone"],
  ["Snake", "Chicken", "Basilisk", "🐍", "myth", "l", "Hatched from an egg by a serpent"],
  ["Squid", "Whale", "Kraken", "🦑", "myth", "l", "A sea monster that sinks ships"],
  ["Whale", "Dragon", "Leviathan", "🐋", "myth", "l", "The great sea serpent"],
  ["Dog", "Dog", "Cerberus", "🐕", "myth", "l", "A three-headed guard dog"],
  ["Human", "Bat", "Vampire", "🧛", "myth", "l", "Comes out at night, wants your blood"],
  ["Human", "Dire wolf", "Werewolf", "🐺", "myth", "l", "A person who turns into a wolf"],
  ["Goat", "Human", "Satyr", "🐐", "myth", "l", "Half goat, half human, loves music"],
  ["Seal", "Human", "Selkie", "🦭", "myth", "l", "A seal who can become a person"],
  ["Bird", "Mermaid", "Siren", "🧜", "myth", "l", "Sings sailors onto the rocks"],
  ["Fox", "Fox", "Kitsune", "🦊", "myth", "l", "A magical fox with many tails"],
  ["Rabbit", "Deer", "Jackalope", "🐇", "myth", "l", "A rabbit with antlers"],
  ["Gorilla", "Bear", "Yeti", "🦍", "myth", "l", "The abominable snowman"],
  ["Butterfly", "Human", "Fairy", "🧚", "myth", "l", "A tiny winged person"],
  ["Unicorn", "Dragon", "Qilin", "🦄", "myth", "l", "A lucky dragon-unicorn from Chinese legend"],
];
const GENE_BASE = [["Human", "🧑"], ["Fish", "🐟"], ["Lizard", "🦎"], ["Spider", "🕷️"], ["Plant", "🌱"]];
const GENE_CATS = [
  ["all", "🧬 All"], ["start", "🧪 Start"], ["aqua", "🐟 Aquatic"], ["rept", "🦎 Reptiles & Amphibians"], ["bird", "🐦 Birds"], ["mam", "🐾 Mammals"],
  ["bug", "🕷️ Bugs"], ["plant", "🌱 Plants & Fungi"], ["ext", "🦕 Extinct"], ["myth", "🐉 Mythical"],
];
// first discovery pays minutes of your income (same base as the mine: business income per second over the last minute)
const GENE_RARITY = {
  c: { name: "Common", min: 1 }, u: { name: "Uncommon", min: 2 }, r: { name: "Rare", min: 5 },
  e: { name: "Extinct", min: 15 }, l: { name: "Mythical", min: 30 }, s: { name: "Starting sample", min: 0 },
};
const GENE_DNA_MAX = 3, GENE_REGEN_MS = 10 * 60 * 1000, GENE_HINT_SCI = 10;

// lookups: species by name, and recipe by pair ("A|B", names sorted)
const GENE_SPECIES = {};
GENE_BASE.forEach(([n, e]) => GENE_SPECIES[n] = { name: n, emoji: e, cat: "start", rar: "s", why: "One of your 5 starting samples" });
const GENE_BY_PAIR = {};
const genePair = (a, b) => [a, b].sort().join("|");
GENE_RECIPES.forEach(([a, b, r, e, cat, rar, why]) => {
  GENE_SPECIES[r] = { name: r, emoji: e, cat, rar, why, a, b };
  GENE_BY_PAIR[genePair(a, b)] = r;
});
const GENE_TOTAL = GENE_RECIPES.length;   // 150 species to discover

if (!state.genetics) state.genetics = { unlocked: false };
const G = state.genetics;
G.known = G.known || []; G.dna = G.dna || {}; G.tried = G.tried || []; G.hints = G.hints || [];
/* 🧪 MUTATIONS: a pair that is not a real recipe makes a mutant instead of nothing. Its name and look come from its parents
   (Spider + Tree = Spidree 🕷️🌳). It costs DNA like any splice, pays 30 sec of income the first time, and goes into the
   🧪 Mutant jar: mutants can't be spliced again and never count as species, unfound partners or hints. */
G.mutants = G.mutants || {};   // pair key -> 1
if (!G.mutVer) { G.tried = []; G.mutVer = 1; }   // pairs that used to "not mix" can now make their mutant
const GENE_MUTANT_SEC = 30, GENE_MUTANTS_ALL = (() => { const n = GENE_BASE.length + GENE_RECIPES.length; return n * (n + 1) / 2 - GENE_RECIPES.length; })();
const VOW = /[aeiouy]+/gi;
function mutantName(a, b) {
  if (a === b) return "Mega-" + a.toLowerCase();
  const A = a.split(" ")[0], B = b.split(" ").pop().toLowerCase();
  const va = [...A.matchAll(VOW)], vb = [...B.matchAll(VOW)];
  // head: the first part of A up to its 2nd vowel group (or one letter past its only vowel group)
  const head = va.length >= 2 ? A.slice(0, va[1].index) : va.length ? A.slice(0, Math.min(A.length, va[0].index + va[0][0].length + 1)) : A;
  // tail: B from the consonant before its last vowel group
  const lv = vb.length ? vb[vb.length - 1].index : 0, tail = B.slice(Math.max(0, lv - 1));
  const n = head + (head.slice(-1) === tail[0] ? tail.slice(1) : tail);
  return n.charAt(0).toUpperCase() + n.slice(1).toLowerCase();
}
const mutantOf = (key) => { const [a, b] = key.split("|"); return { a, b, name: mutantName(a, b), emoji: GENE_SPECIES[a].emoji + GENE_SPECIES[b].emoji }; };
const mutantCount = () => Object.keys(G.mutants).length;
// 🧬 species bonuses (used all over the game through geneBonus() in js/01-core.js)
const geneCatCount = (cat) => G.known.filter(n => GENE_SPECIES[n] && GENE_SPECIES[n].cat === cat).length;
const GENE_PERKS = [["aqua", "🐟", "tanker contracts"], ["bird", "🐦", "cargo plane contracts"], ["mam", "🐾", "truck contracts"],
  ["myth", "🐉", "space mission rewards"], ["ext", "🦕", "Art Gallery income"], ["bug", "🕷️", "ore sold in the Gold Mine Dig"]];
// 🔎 unfound partners: real recipes with this sample whose result you haven't found yet (mutants never count)
function geneUnfound(n) {
  let now = 0, later = 0;
  for (const [a, b, r] of GENE_RECIPES) {
    if ((a !== n && b !== n) || geneKnows(r)) continue;
    const other = a === n ? b : a;
    if (geneKnows(other)) now++; else later++;
  }
  return { now, later };
}
const geneFound = () => G.known.filter(n => GENE_SPECIES[n] && GENE_SPECIES[n].rar !== "s").length;
const geneKnows = (n) => G.known.includes(n);
let geneSlots = [null, null], geneLast = null, geneTab = "freezer", geneCat = "all";

// 🔓 the mini-game opens (for good) once the 🧬 Genetics Laboratory is bought; you start with 3 of each base sample
function geneUnlock() {
  if (G.unlocked) return;
  G.unlocked = true;
  GENE_BASE.forEach(([n]) => { if (!geneKnows(n)) G.known.push(n); G.dna[n] = GENE_DNA_MAX; });
  G.regenAt = Date.now() + GENE_REGEN_MS;
  showNotice("🧬 New mini-game: Gene Splicer! Find it in 🎮 Mini-games.");
  save();
}
// 🧪 every 10 minutes each sample you know gets +1 DNA (max 3 of each); works while you are away too
function geneRegen() {
  if (!G.unlocked) return false;
  const now = Date.now();
  if (!G.regenAt) G.regenAt = now + GENE_REGEN_MS;
  if (now < G.regenAt) return false;
  const n = Math.min(GENE_DNA_MAX, 1 + Math.floor((now - G.regenAt) / GENE_REGEN_MS));
  G.known.forEach(k => { G.dna[k] = Math.min(GENE_DNA_MAX, (G.dna[k] || 0) + n); });
  G.regenAt += GENE_REGEN_MS * Math.ceil((now - G.regenAt + 1) / GENE_REGEN_MS);
  save();
  return true;
}
const geneReward = (sp) => Math.round(GENE_RARITY[sp.rar].min * 60 * mineBase());
// 🖼️ painted species icons (assets/gene/<name>.webp); species without one yet keep their emoji
const GENE_PICS = new Set(["Human", "Fish", "Lizard", "Spider", "Plant", "Tree", "Seaweed", "Venus flytrap", "Flower", "Cactus", "Mushroom",
  "Zombie fungus", "Scorpion", "Centipede", "Worm", "Ant",
  "Bee", "Caterpillar", "Butterfly", "Beetle", "Fly", "Mosquito", "Grasshopper", "Dragonfly", "Ladybug", "Praying mantis", "Wasp", "Tarantula",
  "Frog", "Iguana", "Snake", "Crocodile",
  "Komodo dragon", "Turtle", "Tortoise", "Chameleon", "Salamander", "Axolotl", "Poison dart frog", "Cobra",
  "Bird", "Pigeon", "Eagle", "Owl", "Parrot", "Chicken", "Duck", "Penguin",
  "Flamingo", "Peacock", "Shark", "Crab", "Coral", "Dolphin", "Whale", "Orca", "Narwhal", "Manta ray", "Shrimp", "Lobster", "Octopus", "Squid",
  "Clownfish", "Jellyfish", "Starfish", "Seahorse", "Eel", "Coelacanth",
  "Ape", "Mouse", "Rat", "Bat", "Squirrel", "Rabbit", "Cat", "Tiger", "Lion", "Wolf", "Dog", "Fox",
  "Bear", "Panda", "Deer", "Horse", "Cow", "Goat", "Pig", "Zebra", "Camel", "Elephant", "Rhino", "Hippo", "Gorilla", "Monkey", "Sloth", "Mole",
  "Hedgehog", "Armadillo", "Walrus", "Seal", "Platypus", "Dinosaur", "Archaeopteryx", "T-Rex", "Brachiosaurus", "Triceratops", "Ankylosaurus",
  "Pterodactyl", "Megalodon", "Trilobite", "Ammonite", "Ichthyosaur",
  "Plesiosaur", "Mammoth", "Sabre-toothed cat", "Dire wolf", "Neanderthal", "Dodo", "Titanoboa", "Meganeura",
  "Mermaid", "Lizardfolk", "Arachne", "Dryad", "Treefolk", "Mandrake", "Dragon", "Elder dragon",
  "Phoenix", "Unicorn", "Pegasus", "Centaur", "Griffin", "Hippogriff", "Harpy", "Sphinx", "Manticore", "Chimera", "Minotaur", "Hydra",
  "Medusa", "Basilisk", "Kraken", "Leviathan",
  "Cerberus", "Vampire", "Werewolf", "Satyr", "Selkie", "Siren", "Kitsune", "Jackalope", "Yeti", "Fairy", "Qilin"]);
function gEm(n, cls = "") {
  const s = GENE_SPECIES[n]; if (!s) return "";
  return GENE_PICS.has(n) ? `<img class="geneImg ${cls}" src="assets/gene/${n.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.webp" alt="${s.emoji}">` : s.emoji;
}
const geneCard = (n, extra = "") => { const s = GENE_SPECIES[n];
  return `<span class="geneEmoji">${gEm(n)}</span><span class="geneName">${s.name}</span>${extra}`; };
const genePips = (n) => `<span class="genePips" title="DNA samples">${Array.from({ length: GENE_DNA_MAX }, (_, i) => `<i class="${i < (G.dna[n] || 0) ? "on" : ""}"></i>`).join("")}</span>`;
// a hint: a recipe you can make right now (both samples known) that you haven't found yet
function geneHintOptions() {
  return GENE_RECIPES.filter(([a, b, r]) => geneKnows(a) && geneKnows(b) && !geneKnows(r) && !G.hints.includes(genePair(a, b)));
}

function renderGene() {
  const box = $("geneView"); if (!box) return;
  geneRegen();
  if (!G.unlocked) { box.innerHTML = `<button class="btn ghost small" data-games-back>← Mini-games</button><p>🔒 Buy the 🧬 Genetics Laboratory in 🔬 Science first.</p>`; return; }
  const found = geneFound(), [A, B] = geneSlots;
  const need = (n) => (A === B && n === A ? 2 : 1);
  const canSplice = A && B && (G.dna[A] || 0) >= need(A) && (G.dna[B] || 0) >= need(B);
  const pk = A && B ? genePair(A, B) : null, isRecipe = pk && GENE_BY_PAIR[pk];
  const tried = pk && !isRecipe && (G.mutants[pk] || G.tried.includes(pk));   // this mutant is already in your jar
  const slot = (i) => { const n = geneSlots[i];
    return `<button class="geneSlot ${n ? "full r-" + GENE_SPECIES[n].rar : ""}" data-gslot="${i}" title="${n ? "Click to take it out" : "Pick a sample below"}">
      ${n ? geneCard(n, genePips(n)) : `<span class="geneEmoji">🧪</span><span class="geneName muted">Sample ${i ? "B" : "A"}</span>`}</button>`; };
  const hintsOpen = G.hints.filter(p => { const r = GENE_BY_PAIR[p]; return r && !geneKnows(r); });
  const hintOpts = geneHintOptions().length, sciHave = typeof sciPool === "function" && sci().uni ? sciPool() : 0;
  let result = "";
  if (geneLast) {
    const L = geneLast, s = L.result && GENE_SPECIES[L.result];
    result = L.mutant
      ? `<div class="geneResult mutant ${L.isNew ? "new" : ""}">
          <div class="geneResEmoji">${gEm(L.mutant.a, "half")}${gEm(L.mutant.b, "half")}</div>
          <div><div class="geneResName">🧪 Mutation: <b>${L.mutant.name}</b> <span class="geneRar r-m">Mutant</span></div>
            <div class="muted">Not a real species: ${gEm(L.mutant.a, "sm")} ${L.mutant.a} and ${gEm(L.mutant.b, "sm")} ${L.mutant.b} don't make one. It goes in your 🧪 Mutant jar and can't be spliced again.</div>
            <div>${L.reward ? `💰 +${fmt(L.reward)}` : ""}</div></div></div>`
      : `<div class="geneResult r-${s.rar} ${L.isNew ? "new" : ""}">
          <div class="geneResEmoji">${gEm(s.name)}</div>
          <div><div class="geneResName">${L.isNew ? "🎉 New species: " : ""}<b>${s.name}</b> <span class="geneRar r-${s.rar}">${GENE_RARITY[s.rar].name}</span></div>
            <div class="muted">${s.why}</div>
            <div>${L.isNew ? (L.reward ? `💰 +${fmt(L.reward)} · 🧬 +1 ${s.name} DNA` : `🧬 +1 ${s.name} DNA`) : `Already in your freezer: no reward, 🧬 +1 ${s.name} DNA${L.capped ? " (already full)" : ""}`}</div></div></div>`;
  }
  // freezer (known samples) or codex (all species, undiscovered as ???)
  const list = geneTab === "mutants" ? [] : geneTab === "freezer"
    ? G.known.filter(n => geneCat === "all" || GENE_SPECIES[n].cat === geneCat)
    : [...GENE_BASE.map(b => b[0]), ...GENE_RECIPES.map(r => r[2])].filter(n => geneCat === "all" || GENE_SPECIES[n].cat === geneCat);
  const catCount = (c) => { const all = Object.values(GENE_SPECIES).filter(s => s.rar !== "s" && (c === "all" || s.cat === c));
    return c === "start" ? "" : ` ${all.filter(s => geneKnows(s.name)).length}/${all.length}`; };
  const cards = list.map(n => { const s = GENE_SPECIES[n], k = geneKnows(n);
    if (geneTab === "freezer") { const u = geneUnfound(n);
      const tag = u.now ? `<span class="geneUnf" title="${u.now} new species can still be made with ${n} and samples you already have${u.later ? ` (+${u.later} more need samples you haven't found yet)` : ""}">${u.now} unfound</span>`
        : u.later ? `<span class="geneUnf later" title="${u.later} new species need ${n} and a sample you haven't found yet">🔒 ${u.later} later</span>` : `<span class="geneUnf done" title="Every species with ${n} is found">✓ done</span>`;
      return `<button class="geneCard r-${s.rar} ${geneSlots.includes(n) ? "sel" : ""}" data-gs="${n}" data-name="${n.toLowerCase()}" ${(G.dna[n] || 0) ? "" : "data-empty"}>${geneCard(n, genePips(n))}${tag}</button>`; }
    return k ? `<div class="geneCard r-${s.rar} codex" data-name="${n.toLowerCase()}" title="${s.why}">${geneCard(n, s.a ? `<span class="geneHow">${gEm(s.a, "sm")} + ${gEm(s.b, "sm")}</span>` : "")}</div>`
      : `<div class="geneCard unknown" data-name=""><span class="geneEmoji">❔</span><span class="geneName">???</span><span class="geneHow">${GENE_RARITY[s.rar].name}</span></div>`; }).join("");
  box.innerHTML = `
    <div class="geneTop">
      <button class="btn ghost small" data-games-back>← Mini-games</button>
      <h2>${ico("sci-gene", "h")}Gene Splicer</h2>
      <div class="geneProg"><b>${found}</b> / ${GENE_TOTAL} species
        <div class="xpBar"><div class="xpFill" style="width:${found / GENE_TOTAL * 100}%"></div></div></div>
    </div>
    <div class="card geneLab">
      <div class="geneSplicer">${slot(0)}<div class="genePlus">+</div>${slot(1)}
        <button class="btn big" data-gene="splice" ${canSplice && !tried ? "" : "disabled"}>🧬 Splice</button></div>
      <div class="muted geneNote">${!A || !B ? "Pick two samples from your freezer (the same one twice works too)."
        : tried ? `🧪 You already made this mutant (${mutantName(...pk.split("|"))}).` : canSplice ? `Uses 1 DNA of each sample${A === B ? " (2 of this one)" : ""}. A pair that isn't a real recipe makes a 🧪 mutant.`
        : "Not enough DNA: each sample refills by 1 every 10 minutes (max 3)."}</div>
      ${result}
    </div>
    <div class="geneBar">
      <span>🧪 Next DNA for every sample in <b id="geneRegen">${clockMs(Math.max(0, (G.regenAt || Date.now()) - Date.now()))}</b></span>
      <button class="btn small" data-gene="hint" ${sciHave >= GENE_HINT_SCI && hintOpts ? "" : "disabled"}
        title="${!sci().uni ? "Needs a University with scientists" : hintOpts ? "" : "No new recipe is possible with what you have"}">💡 Hint · 👩‍🔬 ${GENE_HINT_SCI} scientists</button>
      <span class="muted">You have ${ico("sci-scientist")}${sciHave} scientists</span>
    </div>
    <div class="genePerkTitle">🏆 Species bonuses <span class="muted">+1% for every species you discover in each category, for good</span></div>
    <div class="genePerks" title="Every species you discover in these categories gives +1% for good">${GENE_PERKS.map(([c, e, what]) =>
      `<span>${e} <b>+${geneCatCount(c)}%</b> ${what}</span>`).join("")}</div>
    ${hintsOpen.length ? `<div class="geneHints">${hintsOpen.map(p => { const [a, b] = p.split("|");
      return `<span>💡 Try ${gEm(a, "sm")} ${a} + ${gEm(b, "sm")} ${b}</span>`; }).join("")}</div>` : ""}
    <div class="card">
      <div class="geneTabs"><button class="subTab ${geneTab === "freezer" ? "active" : ""}" data-gtab="freezer">❄️ Freezer (${G.known.length})</button>
        <button class="subTab ${geneTab === "codex" ? "active" : ""}" data-gtab="codex">📖 Codex</button>
        <button class="subTab ${geneTab === "mutants" ? "active" : ""}" data-gtab="mutants">🧪 Mutants (${mutantCount()})</button>
        <input id="geneSearch" type="search" placeholder="🔍 Search" autocomplete="off"></div>
      <div class="achCats" ${geneTab === "mutants" ? "hidden" : ""}>${GENE_CATS.filter(([c]) => geneTab === "codex" ? c !== "start" || true : true).map(([c, l]) =>
        `<button class="achCat ${geneCat === c ? "active" : ""}" data-gcat="${c}">${l}${catCount(c)}</button>`).join("")}</div>
      ${geneTab === "mutants" ? `<p class="muted">Mutants come from pairs that don't make a real species. They can't be spliced again and don't count as species. You've made ${mutantCount()} of ${GENE_MUTANTS_ALL.toLocaleString("en-US")} possible.</p>
        <div class="geneGrid">${Object.keys(G.mutants).reverse().map(k => { const m = mutantOf(k);
          return `<div class="geneCard r-m codex" data-name="${m.name.toLowerCase()}" title="${m.a} + ${m.b}"><span class="geneEmoji">${gEm(m.a, "half")}${gEm(m.b, "half")}</span><span class="geneName">${m.name}</span><span class="geneHow">${gEm(m.a, "sm")} + ${gEm(m.b, "sm")}</span></div>`; }).join("") || `<p class="muted">No mutants yet.</p>`}</div>`
      : `<div class="geneGrid">${cards || `<p class="muted">Nothing here yet.</p>`}</div>`}
    </div>`;
}

function geneSplice() {
  const [A, B] = geneSlots; if (!A || !B) return;
  const key = genePair(A, B), r = GENE_BY_PAIR[key];
  const need = A === B ? { [A]: 2 } : { [A]: 1, [B]: 1 };
  if (Object.entries(need).some(([k, n]) => (G.dna[k] || 0) < n)) return;
  if (!r) {   // 🧪 not a real recipe: a mutant (once per pair; costs DNA, pays 30 sec of income)
    if (G.mutants[key]) return;
    Object.entries(need).forEach(([k, n]) => { G.dna[k] -= n; });
    G.mutants[key] = 1;
    const m = mutantOf(key), reward = Math.round(GENE_MUTANT_SEC * mineBase());
    state.money += reward; clickedThisSecond += reward; G.earned = (G.earned || 0) + reward;
    G.splices = (G.splices || 0) + 1;
    geneLast = { mutant: m, isNew: true, reward };
    geneSlots = [null, null];
    save(); updateCounter(); return renderGene();
  }
  Object.entries(need).forEach(([k, n]) => { G.dna[k] -= n; });
  const s = GENE_SPECIES[r], isNew = !geneKnows(r);
  let reward = 0, capped = false;
  if (isNew) {   // 🎉 first discovery: the sample goes in the freezer and pays by rarity
    G.known.push(r); G.dna[r] = 1;
    reward = geneReward(s);
    state.money += reward; clickedThisSecond += reward;   // counts as income (taxes)
    G.earned = (G.earned || 0) + reward;
    G.hints = G.hints.filter(p => p !== key);
    showNotice(`🧬 New species: ${s.emoji} ${s.name}!${reward ? ` +${fmt(reward)}` : ""}`);
  } else {   // already known: no money, but you get one more DNA sample of it
    capped = (G.dna[r] || 0) >= GENE_DNA_MAX;
    G.dna[r] = Math.min(GENE_DNA_MAX, (G.dna[r] || 0) + 1);
  }
  G.splices = (G.splices || 0) + 1;
  geneLast = { result: r, isNew, reward, capped };
  geneSlots = [null, null];
  save(); updateCounter(); renderGene();
  if (isNew) checkAchievements();
}
function geneHint() {
  const opts = geneHintOptions();
  if (!opts.length || !sci().uni || sciPool() < GENE_HINT_SCI) return;
  spendScientists(GENE_HINT_SCI);
  const [a, b, r] = opts[secureRandomInt(opts.length)];
  G.hints.push(genePair(a, b));
  showNotice(`💡 Hint: try ${GENE_SPECIES[a].emoji} ${a} + ${GENE_SPECIES[b].emoji} ${b}!`);
  save(); renderGene();
}

$("geneView").addEventListener("click", (e) => {
  const t = e.target;
  const s = t.closest("[data-gs]");
  if (s) {   // put a sample in the first empty slot (or replace B)
    const n = s.dataset.gs;
    if (!(G.dna[n] || 0)) return showNotice(`🧪 No ${n} DNA left: it refills every 10 minutes.`);
    const i = geneSlots[0] ? (geneSlots[1] ? 1 : 1) : 0;
    geneSlots[i] = n; geneLast = null; return renderGene();
  }
  const sl = t.closest("[data-gslot]"); if (sl) { geneSlots[+sl.dataset.gslot] = null; return renderGene(); }
  const g = t.closest("[data-gene]");
  if (g && !g.disabled) { if (g.dataset.gene === "splice") geneSplice(); if (g.dataset.gene === "hint") geneHint(); return; }
  const tab = t.closest("[data-gtab]"); if (tab) { geneTab = tab.dataset.gtab; return renderGene(); }
  const c = t.closest("[data-gcat]"); if (c) { geneCat = c.dataset.gcat; return renderGene(); }
});
$("geneView").addEventListener("input", (e) => {   // search filters the cards without a re-render
  if (e.target.id !== "geneSearch") return;
  const q = e.target.value.trim().toLowerCase();
  document.querySelectorAll("#geneView .geneCard").forEach(c => { c.style.display = !q || (c.dataset.name || "").includes(q) ? "" : "none"; });
});
// every second: unlock check, DNA refill and the countdown
setInterval(() => {
  if (!G.unlocked && state.science && state.science.gene) geneUnlock();
  if (!G.unlocked) return;
  const changed = geneRegen();
  const onPage = state.view === "games" && state.gamePage === "gene";
  if (onPage && changed) renderGene();
  const el = $("geneRegen"); if (el) el.textContent = clockMs(Math.max(0, G.regenAt - Date.now()));
  if (state.view === "games" && !state.gamePage && changed) renderGames();
}, 1000);
if (!G.unlocked && state.science && state.science.gene) geneUnlock();
if (state.view === "games" && state.gamePage === "gene") renderGames();
