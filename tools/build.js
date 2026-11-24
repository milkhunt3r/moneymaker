/* Empire of Coins © 2026 milkhunt3r. All rights reserved. */
// 🔨 Build: dev.html (every js/*.js file on its own, handy for testing) → index.html (the live page).
// All game scripts are joined into ONE file, game.js, wrapped in a function, so nothing of the game
// (state, money, functions…) can be reached from the browser console. Cache-busters come from file hashes.
// Run after every change:  node tools/build.js
const fs = require("fs"), path = require("path"), crypto = require("crypto");
const root = path.join(__dirname, "..");
const hash = (buf) => crypto.createHash("sha1").update(buf).digest("hex").slice(0, 10);
let html = fs.readFileSync(path.join(root, "dev.html"), "utf8");
const tags = [...html.matchAll(/^[ \t]*<script src="(js\/[^"?]+)(?:\?[^"]*)?"><\/script>\r?\n/gm)];
if (!tags.length) throw new Error("no game scripts found in dev.html");
// Joining the files into one function changes two things, and the build undoes both:
// · top-level const/let become var: as separate scripts, "typeof laterThing" was "undefined" before that file ran;
//   inside one function a later const would throw instead ("Cannot access … before initialization").
// · function declarations are now hoisted for the WHOLE game, so "typeof laterFunction === 'function'" (used to call
//   something from a file that loads later) would be true too early: those checks also test that the file has run.
const srcs = tags.map(m => fs.readFileSync(path.join(root, m[1]), "utf8")
  .replace(/^\/\* Empire of Coins © 2026 milkhunt3r\. All rights reserved\. \*\/\n/, "").replace(/^(const|let) /gm, "var "));
const defAt = {};
srcs.forEach((src, i) => { for (const m of src.matchAll(/^(?:async )?function\*? *([A-Za-z_$][\w$]*)/gm)) defAt[m[1]] = i; });
const parts = srcs.map((src, i) => `\n// ===== ${tags[i][1]} =====\n__eocLoaded = ${i};\n` +
  src.replace(/typeof ([A-Za-z_$][\w$]*) (===|!==) "function"/g, (m, n, op) => !(n in defAt) ? m
    : op === "===" ? `(__eocLoaded >= ${defAt[n]} && ${m})` : `(__eocLoaded < ${defAt[n]} || ${m})`));
const game = `/* Empire of Coins © 2026 milkhunt3r. All rights reserved. Copying or reusing this code without permission is not allowed. */\n(function () {\nvar __eocLoaded = -1;\n${parts.join("")}\n})();\n`;
fs.writeFileSync(path.join(root, "game.js"), game);
// one <script> for the whole game where the first game script was; the others are removed
for (const m of tags) html = html.replace(m[0], m === tags[0] ? `__GAME__` : "");
html = html.replace("__GAME__", `  <script src="game.js?v=${hash(game)}"></script>\n`);
// the dev-only guard is not part of the live page
html = html.replace(/[ \t]*<!-- DEV ONLY -->[\s\S]*?<!-- \/DEV ONLY -->\r?\n/, "");
// css and other local files: cache-buster = their content hash
html = html.replace(/(href|src)="((?:css|legal)\/[^"?]+)\?v=[^"]*"/g, (m, a, f) => `${a}="${f}?v=${hash(fs.readFileSync(path.join(root, f)))}"`);
html = html.replace("<!DOCTYPE html>\n", "<!DOCTYPE html>\n<!-- Built from dev.html by tools/build.js: edit dev.html, not this file. -->\n");
fs.writeFileSync(path.join(root, "index.html"), html);
console.log(`game.js: ${tags.length} scripts, ${(game.length / 1024).toFixed(0)} KB`);
