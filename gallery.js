// Sprite gallery — renders every entry in SPRITES, labeled, at 2x.
// Open /gallery.html. Pure review tool; no game logic.
const COLS = 4;
const TILE = 190;
const TOP = 70;
const SCALE = 2;
const W = COLS * TILE;
const ROWS = Math.ceil(Object.keys(SPRITES).length / COLS);
const H = TOP + ROWS * TILE;

class GalleryScene extends Phaser.Scene {
  constructor(){ super('gallery'); }
  create(){
    buildAllTextures(this);
    this.cameras.main.setBackgroundColor(0xb8bcc2); // neutral light gray

    this.add.text(W/2, 30, 'PORT FOLIOPOLIS — SPRITE GALLERY',
      {fontFamily:'monospace', fontSize:'22px', color:'#ffffff', fontStyle:'bold'})
      .setOrigin(0.5).setStroke('#202020', 5);

    Object.keys(SPRITES).forEach((key, i) => {
      const col = i % COLS, row = Math.floor(i / COLS);
      const cx = col * TILE + TILE / 2;
      const cy = TOP + row * TILE + TILE / 2;
      // tile background (darker so light + grey sprites still read)
      this.add.rectangle(cx, cy, TILE - 14, TILE - 14, 0x686d74).setStrokeStyle(2, 0x2a2d31);
      // the sprite, enlarged (relative sizes preserved — Roq/coin show smaller)
      this.add.image(cx, cy - 14, key).setScale(SCALE);
      // label
      this.add.text(cx, cy + TILE/2 - 22, key,
        {fontFamily:'monospace', fontSize:'13px', color:'#ffffff'}).setOrigin(0.5).setStroke('#202020', 3);
    });
  }
}

new Phaser.Game({
  type: Phaser.AUTO,
  width: W, height: H,
  parent: 'game',
  pixelArt: true,
  backgroundColor: '#b8bcc2',
  scene: [GalleryScene],
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
});
