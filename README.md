# Empire of Coins

An idle tycoon game. Play it at https://empireofcoins.com

© 2026 milkhunt3r. All rights reserved. The code, art, audio and all other content in this repository are protected by copyright. They may not be copied, modified, redistributed or reused without written permission. See [LICENSE](LICENSE).

## Working on the game

- Edit `dev.html` and the files in `js/`, never `index.html` or `game.js`.
- Test with `dev.html` (opens only from this computer).
- Then run `node tools/build.js`: it joins all scripts into `game.js` (nothing reachable from the browser console) and writes `index.html` with fresh cache-busters.
