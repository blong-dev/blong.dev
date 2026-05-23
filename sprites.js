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
    '.FOmOmmmmO..',
    '..FOOmmmO...',
    '..OmmOmmO...',
    '..OmmOmmO...',
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
    'bbObObbbbO..',
    '.bbObbbbO...',
    '..ObbObbO...',
    '..ObbObbO...',
    '..OKKOKKO...',
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
    'ObOmmOmmmO..',
    'bbOmOmmmmO..',
    '.bbOmmmmO...',
    '..OmmOmmO...',
    '..OmmOmmO...',
    '..OKKOKKO...',
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
    '.aOaaOaaaO..',
    '..aOOaaaaO..',
    '..OaaOaaO...',
    '..OaaOaaO...',
    '..OKKOKKO...',
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
    '.aOmmOmmmO..',
    '..aOOmmmmO..',
    '..OmmOmmO...',
    '..OmmOmmO...',
    '..OKKOKKO...',
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
    '.dOddOdddO..',
    'dddOOdddO...',
    '..OddOddO...',
    '..OddOddO...',
    '..OKKOKKO...',
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
    '.dOmmOmmmO..',
    'dddOOmmmO...',
    '..OmmOmmO...',
    '..OmmOmmO...',
    '..OKKOKKO...',
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

// per-sprite pixel size (px per cell): satyr small, coin medium; heroes default to 4
const CELLS = { roq: 2, coin: 3 };

function buildAllTextures(scene, defCell = 4) {
  for (const key in SPRITES) makePixelTexture(scene, key, SPRITES[key], PALETTE, CELLS[key] || defCell);
}
