// ============================================================
//  PORT FOLIOPOLIS — SPRITES   (edit these freely)
// ------------------------------------------------------------
//  Each sprite is a grid of single characters. Each character
//  maps to a color in PALETTE below. '.' = transparent.
//  RULE: every row in a grid MUST be the same length.
//  Colors render as crisp pixels (each cell = 3x3 screen px).
//  Add a new sprite by adding a key to SPRITES, then use that
//  key as a texture in game.js.
// ============================================================

const PALETTE = {
  '.': null,        // transparent
  'O': 0x241803,    // outline (near-black)
  'F': 0xf8a838,    // calico orange fur
  'W': 0xfdfdfd,    // white
  'P': 0xf070a0,    // pink  (nose / inner ear)
  'G': 0x28b828,    // green tunic
  'S': 0xf8c89c,    // skin / peach
  'K': 0x43321c,    // dark brown (boots / hooves)
  'B': 0x8a5018,    // horn brown
  'H': 0xd8b878,    // satyr fur (tan)
  'R': 0xe02810,    // red vest
  'Y': 0xfcd400,    // gold
  'y': 0xb88600,    // dark gold edge
  'b': 0x3c78f8,    // jay blue
  'a': 0xb0b0c0,    // larry gray
  'd': 0x58c838,    // betsy dino-green
  'm': 0x9090a0,    // armor grey
  'X': 0x000000,    // armor outline (black)
};

// These are the UNARMORED ("basic") sprites. Each character will also
// get an _armored variant later (e.g. calico_armored) for the G'n'G
// armor state — same grid with armor pixels added. Add those as new keys.
const SPRITES = {
  // ---- Heroes, UNARMORED ("naked"): full body in the fur/head color, no clothes ----
  // Calico — cat lady (orange)
  calico: [
    '..O......O..',
    '.OFO....OFO.',
    '.OFFO..OFFO.',
    '.OFFFFFFFFO.',
    '.OWWWWWWWWO.',
    '.OWOWWWWOWO.',
    '.OWWWPPWWWO.',
    '.OFWWWWWWFO.',
    '..OFFFFFFO..',
    '..OFFFFFFO..',
    '.OFFFFFFFFO.',
    '.OFFFFFFFFO.',
    '..OFFFFFFO..',
    '..OFFOOFFO..',
    '..OFFOOFFO..',
    '..OFFOOFFO..',
  ],
  // Jay — bird man (blue, yellow beak)
  jay: [
    '......b.....',
    '....ObObO...',
    '..ObbbbbbO..',
    '.ObbbbbbbbO.',
    '.OWWWWWWWWO.',
    '.OWOWYWWOWO.',
    '.OWWWYYYYYO.',
    '.ObWWYYYWbO.',
    '..ObbYbbbO..',
    '..ObbbbbbO..',
    '.ObbbbbbbbO.',
    '.ObbbbbbbbO.',
    '..ObbbbbbO..',
    '..ObbOObbO..',
    '..ObbOObbO..',
    '..ObbOObbO..',
  ],
  // Larry — elephant man (gray)
  larry: [
    '...OaaaaO...',
    'OaaOaaaaOaaO',
    'OaaOaaaaOaaO',
    'OaaOWWWWOaaO',
    'OaaOWOOWOaaO',
    '.OaOWWWWOaO.',
    '..OOWWWWOO..',
    '...OaaaaO...',
    '....OaaO....',
    '..OaaaaaaO..',
    '.OaaaaaaaaO.',
    '.OaaaaaaaaO.',
    '..OaaaaaaO..',
    '..OaaOOaaO..',
    '..OaaOOaaO..',
    '..OaaOOaaO..',
  ],
  // Betsy — triceratops lady (dino-green)
  betsy: [
    '..W.OOOO.W..',
    '.OWOddddOWO.',
    'OddddddddddO',
    'OddddddddddO',
    '.OddWWWWddO.',
    '.OdWOWWOWdO.',
    '..OWWWWWWO..',
    '..OWWPPWWO..',
    '..OddddddO..',
    '..OddddddO..',
    '.OddddddddO.',
    '.OddddddddO.',
    '..OddddddO..',
    '..OddOOddO..',
    '..OddOOddO..',
    '..OddOOddO..',
  ],

  // ---- Heroes, ARMORED: head kept colored, body recolored gray (m), outline kept ----
  calico_armored: [
    '..O......O..',
    '.OFO....OFO.',
    '.OFFO..OFFO.',
    '.OFFFFFFFFO.',
    '.OWWWWWWWWO.',
    '.OWOWWWWOWO.',
    '.OWWWPPWWWO.',
    '.OFWWWWWWFO.',
    '..OFFFFFFO..',
    '..OmmmmmmO..',
    '.OmmmmmmmmO.',
    '.OmmmmmmmmO.',
    '..OmmmmmmO..',
    '..OmmOOmmO..',
    '..OmmOOmmO..',
    '..OmmOOmmO..',
  ],
  jay_armored: [
    '......b.....',
    '....ObObO...',
    '..ObbbbbbO..',
    '.ObbbbbbbbO.',
    '.OWWWWWWWWO.',
    '.OWOWYWWOWO.',
    '.OWWWYYYYYO.',
    '.ObWWYYYWbO.',
    '..ObbYbbbO..',
    '..OmmmmmmO..',
    '.OmmmmmmmmO.',
    '.OmmmmmmmmO.',
    '..OmmmmmmO..',
    '..OmmOOmmO..',
    '..OmmOOmmO..',
    '..OmmOOmmO..',
  ],
  larry_armored: [
    '...OaaaaO...',
    'OaaOaaaaOaaO',
    'OaaOaaaaOaaO',
    'OaaOWWWWOaaO',
    'OaaOWOOWOaaO',
    '.OaOWWWWOaO.',
    '..OOWWWWOO..',
    '...OaaaaO...',
    '....OaaO....',
    '..OmmmmmmO..',
    '.OmmmmmmmmO.',
    '.OmmmmmmmmO.',
    '..OmmmmmmO..',
    '..OmmOOmmO..',
    '..OmmOOmmO..',
    '..OmmOOmmO..',
  ],
  betsy_armored: [
    '..W.OOOO.W..',
    '.OWOddddOWO.',
    'OddddddddddO',
    'OddddddddddO',
    '.OddWWWWddO.',
    '.OdWOWWOWdO.',
    '..OWWWWWWO..',
    '..OWWPPWWO..',
    '..OddddddO..',
    '..OmmmmmmO..',
    '.OmmmmmmmmO.',
    '.OmmmmmmmmO.',
    '..OmmmmmmO..',
    '..OmmOOmmO..',
    '..OmmOOmmO..',
    '..OmmOOmmO..',
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
    '..OHHHHHHO..',
    '...OHHHHO...',
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
