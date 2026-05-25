// ============================================================
//  PORT FOLIOPOLIS — SPRITES   (edit these freely)
// ------------------------------------------------------------
//  Each sprite is a grid of single characters. Each character
//  maps to a color in PALETTE below. '.' = transparent.
//  RULE: every row in a grid MUST be the same length.
//  Heroes are drawn in PROFILE, FACING RIGHT — the game flips
//  them for left (sprite.setFlipX). Let each animal's signature
//  feature (ear/snout, beak, ear/trunk, horns) lead the silhouette.
//  Heroes render at 4px per cell (see CELLS); add new sprites by
//  adding a key here and using it as a texture in game.js.
// ============================================================

const PALETTE = {
  '.': null,        // transparent
  'O': 0x241803,    // outline (near-black)
  'F': 0xf8a838,    // calico orange fur
  'W': 0xfdfdfd,    // white (muzzle / horn / belly)
  'P': 0xf070a0,    // pink  (nose / beak underside)
  'G': 0x28b828,    // green tunic (legacy)
  'S': 0xf8c89c,    // skin / peach (legacy)
  'K': 0x43321c,    // dark brown (feet / hooves)
  'B': 0x8a5018,    // horn brown
  'H': 0xd8b878,    // satyr fur (tan)
  'R': 0xe02810,    // red vest
  'Y': 0xfcd400,    // gold / beak
  'y': 0xb88600,    // dark gold edge
  'b': 0x3c78f8,    // jay blue
  'a': 0xb0b0c0,    // larry gray
  'd': 0x58c838,    // betsy dino-green
  'm': 0x9090a0,    // armor grey
  'X': 0x000000,    // armor outline (black)
  'u': 0x8a3cb0,    // imp purple
  'e': 0x2a9468,    // emma dragon green
  'g': 0x7ad0a8,    // emma belly / light green
};

// Heroes come in two states: UNARMORED (naked, full fur color) and
// _armored (head kept colored, body recolored grey). All profile, facing right.
const SPRITES = {
  // ---- Calico — cat, profile: pointed ear up, snout + pink nose forward ----
  calico: [
    '...O........',
    '...FO.......',
    '..OOFO......',
    '..OFFFF.....',
    '..OFFOFFO...',
    '..OFFOFWWP..',
    '..OFFFFWWW..',
    '..OFFFFFO...',
    'F..OFFFFO...',
    'F.OFFFFFFO..',
    '.FOFOFFFFO..',
    '.FOFOFFFFO..',
    '..FOOFFFO...',
    '..OFFOFFO...',
    '..OFFOFFO...',
    '..OKKOKKO...',
  ],
  calico_armored: [
    '...O........',
    '...FO.......',
    '..OOFO......',
    '..OFFFF.....',
    '..OFFOFFO...',
    '..OFFOFWWP..',
    '..OFFFFWWW..',
    '..OFFFFFO...',
    'F..OmmmmO...',
    'F.OmmmmmmO..',
    '.FOmOmmmmO..',
    '.FOFOmmmmO..',
    '..FOOmmmO...',
    '..OmmOmmO...',
    '..OFFOFFO...',
    '..OKKOKKO...',
  ],

  // ---- Jay — bird, profile: crest up, yellow beak forward ----
  jay: [
    '...O........',
    '...bO.......',
    '..OObO......',
    '..ObbbbO....',
    '..ObbObYO...',
    '..ObbObYYYY.',
    '..ObbbbbYY..',
    '...ObbbbO...',
    '...ObbbbO...',
    '..ObbbObbO..',
    'ObObbObbbO..',
    'bbObObbbbb..',
    '.bbObbbbbO..',
    '.....YOYO...',
    '.....YOYO...',
    '.....YOYO...',
  ],
  jay_armored: [
    '...O........',
    '...bO.......',
    '..OObO......',
    '..ObbbbO....',
    '..ObbObYO...',
    '..ObbObYYYY.',
    '..ObbbbbYY..',
    '...ObbbbO...',
    '...OmmmmO...',
    '..OmmmOmmO..',
    'ObOmbOmmmO..',
    'bbObOmmmmm..',
    '.bbOmmmmmO..',
    '.....YOYO...',
    '.....YOYO...',
    '.....YOYO...',
  ],

  // ---- Larry — elephant, profile: big ear back, trunk forward/down ----
  larry: [
    '.OOOO.......',
    'OaaaOaaO....',
    'OaaaaaaaO...',
    'OaaaaOaaO...',
    'OaaaaaaaO...',
    'OaaaaaOaa...',
    'OaaOaaOaa...',
    'OaOaaaaOaO..',
    '.O.OaaaOaa..',
    '..OaaaaaO...',
    '..OaaOaaaO..',
    '.aOaKOaaaO..',
    '..aOOaaaaO..',
    '..OaaOaaO...',
    '..OaaOaaO...',
    '..OaKOaKO...',
  ],
  larry_armored: [
     '.OOOO.......',
    'OaaaOaaO....',
    'OaaaaaaaO...',
    'OaaaaOaaO...',
    'OaaaaaaaO...',
    'OaaaaaOaa...',
    'OaaOaaOaa...',
    'OaOaaaaOaO..',
    '.O.OmmmOaa..',
    '..OmmmmmO...',
    '..OmmOmmmO..',
    '.aOaKOmmmO..',
    '..aOOmmmmO..',
    '..OmmOmmO...',
    '..OmmOmmO...',
    '..OaKOaKO...',
  ],

  // ---- Betsy — triceratops, profile: frill back, horn + beak forward ----
  betsy: [
    'Od..........',
    'Oddd.W......',
    'ddddWW......',
    'ddddddd.W...',
    '.dddOddWW...',
    '..OddddWdP..',
    '..OddddddO..',
    '...dddddO...',
    '...OOdddO...',
    '..OddddddO..',
    '..OddddddO..',
    '.dOdaOdddO..',
    'dddOOdddO...',
    '..OddOddO...',
    '..OddOddO...',
    '..OdaOdaO...',
  ],
  betsy_armored: [
    'Od..........',
    'Oddd.W......',
    'ddddWW......',
    'ddddddd.W...',
    '.dddOddWW...',
    '..OddddWdP..',
    '..OddddddO..',
    '...dddddO...',
    '...OOmmmO...',
    '..OmmmmmmO..',
    '..OmmmmmmO..',
    '.dOdaOmmmO..',
    'dddOOmmmO...',
    '..OmmOmmO...',
    '..OmmOmmO...',
    '..OdaOdaO...',

  ],

  // ---- Monsters (starting points — refine like the heroes) ----
  // Imp — small horned gremlin, slow ground walker
  imp: [
    '..O.....O...',
    '..uO...Ou...',
    '...OuuuuO...',
    '..OuuuuuuO..',
    '..OuOuuOuO..',
    '..OuuuuuuO..',
    '...OuuuuO...',
    '..OuuuuuuO..',
    '..OuuuuuuO..',
    '...OuOOuO...',
    '...OK..KO...',
  ],
  // Thornboar — charges; spiky back, tusk forward
  thornboar: [
    '...O.O.O....',
    '..OBOBOBBO..',
    '.OBBBBBBBBO.',
    '.OBBBBBBBBW.',
    '.OBBOBBBBBW.',
    '.OBBBBBBBBW.',
    '.OBBBBBBBBO.',
    '..OBBOBBO...',
    '..OBBOBBO...',
    '..OKKOKKO...',
  ],
  // Faun piper — Roq's lesser kin; lobs acorns from range
  faun: [
    '..B....B....',
    '..OB..BO....',
    '...OSSSO....',
    '..OSOSSSO...',
    '..OSSSSPO...',
    '...OSSSO....',
    '...OHHHO....',
    '..OHHHHHO...',
    '..OHHHHHO...',
    '...OHHHO....',
    '...OHHHO....',
    '..OHHOHHO...',
    '..OHHOHHO...',
    '..OKKOKKO...',
  ],
  // Wisp — woods Boo; advances when unobserved, freezes when faced
   wisp: [
    '...WWWW.....',
    '..WWWWWWW...',
    '.WWWWWWWWW..',
    '.WWWWWWWWW..',
    '.WWWOWWOWW..',
    '.WWWOWWOWW..',
    '.WWWWWWWWW..',
    '.WWWWWWWWW..',
    '.WWWWWWWWW..',
    '.WW.WW.WW...',
    '.W..W..W....',
  ],

  // ---- Emma — the dragon boss. Blank 32-wide x 24-tall canvas; draw her here (cell 4 -> 128x96 px) ----
  emma: [
    '...............OO..............O',
    '..............OO..............O.',
    '.............OOOOO...........OO.',
    '..OOO.......OOOOO...........OO..',
    'OOOOOO.......OOOOO.........OO...',
    '.OOOOOO.....OOOOO...........OO..',
    '.....OOO.....OOOOOO........OO...',
    '......OOO.....OOOOOO......OOO...',
    '.......OOOOOOOOOOOOOOOO..OOO....',
    '......OOOOOOOOOOOOOOOOOOOOOO....',
    '.....OOOOOOOOOOOOOOOOOOOOOOO....',
    '................................',
    '................................',
    '................................',
    '................................',
    '................................',
    '................................',
    '................................',
    '................................',
    '................................',
    '................................',
    '................................',
    '................................',
    '................................',
  ],

  // Roq — the satyr (12 x 18): brown horns, beard, red vest, furry legs, hooves
  roq: [
    '.BB......BB.',
    '.OBO....OBO.',
    '..OSSSSSSO..',
    '.OSSSSSSSSO.',
    '.OSOSSSSOSO.',
    '.OmmmPPmmmO.',
    '..OmmWWmmO..',
    '..OmmmmmmO..',
    '...OmmmmO...',
    '..ORRRRRRO..',
    '.OSRRRRRRSO.',
    '.OSRRRRRRSO.',
    '..OBBBBBBO..',
    '..OBBBBBBO..',
    '..OBBOOBBO..',
    '..OBBOOBBO..',
    '..OKKOOKKO..',
    '..OKKOOKKO..',
  ],

  // Small 1gp coin (8 x 8)
  coin: [
    '..yYYy..',
    '.yYWYYy.',
    'yYWWYYYy',
    'yYWYYYYy',
    'yYYYYYYy',
    '.yYYYYy.',
    '..yYYy..',
  ],
};

// Builds a crisp pixel texture from a char grid. cell = px per cell.
function makePixelTexture(scene, key, rows, palette, cell) {
  if (scene.textures.exists(key)) return;
  const cols = rows[0].length, h = rows.length;
  const g = scene.make.graphics({ add: false });   // off-display graphics
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < cols; x++) {
      const col = palette[rows[y][x]];
      if (col == null) continue;                    // transparent / unknown
      g.fillStyle(col, 1);
      g.fillRect(x * cell, y * cell, cell, cell);
    }
  }
  g.generateTexture(key, cols * cell, h * cell);     // bake to a real texture
  g.destroy();
}

// All sprites share ONE pixel size (cell 4) so pixels look uniform everywhere.
// Make a sprite bigger/smaller by changing its grid dimensions, not the cell.
const CELLS = {};

function buildAllTextures(scene, defCell = 4) {
  for (const key in SPRITES) makePixelTexture(scene, key, SPRITES[key], PALETTE, CELLS[key] || defCell);
}
