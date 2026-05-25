// Sprite gallery — every sprite, labeled, each in a tile sized to ITS dimensions.
// Big sprites (Emma) get a big tile; the page scrolls if it gets tall.
// Open /gallery.html. Pure review tool.
const CELL = 4;     // uniform pixel size (matches CELLS default in sprites.js)
const ZOOM = 2;     // gallery magnification on top of the texture
const PAD = 28;
const LABEL_H = 22;
const MAXW = 900;   // wrap width
const TOP = 58;

// Pre-measure from the grids and flow-lay-out, so we can size the canvas up front.
const layout = [];
let lx = PAD, ly = TOP, rowH = 0;
for (const key of Object.keys(SPRITES)) {
  const grid = SPRITES[key];
  const w = grid[0].length * CELL * ZOOM;
  const h = grid.length * CELL * ZOOM;
  if (lx + w + PAD > MAXW) { lx = PAD; ly += rowH; rowH = 0; }   // wrap
  layout.push({ key, w, h, x: lx, y: ly });
  lx += w + PAD;
  rowH = Math.max(rowH, h + LABEL_H + PAD);
}
const GW = MAXW;
const GH = ly + rowH + PAD;

class GalleryScene extends Phaser.Scene {
  constructor() { super('gallery'); }
  create() {
    buildAllTextures(this);
    this.cameras.main.setBackgroundColor(0xb8bcc2);
    this.add.text(GW / 2, 28, 'PORT FOLIOPOLIS — SPRITE GALLERY',
      { fontFamily: 'monospace', fontSize: '22px', color: '#ffffff', fontStyle: 'bold' })
      .setOrigin(0.5).setStroke('#202020', 5);

    for (const it of layout) {
      const cx = it.x + it.w / 2, cy = it.y + it.h / 2;
      this.add.rectangle(cx, cy, it.w + 14, it.h + 14, 0x686d74).setStrokeStyle(2, 0x2a2d31);
      this.add.image(cx, cy, it.key).setScale(ZOOM);
      this.add.text(cx, it.y + it.h + 12, it.key,
        { fontFamily: 'monospace', fontSize: '13px', color: '#ffffff' })
        .setOrigin(0.5, 0).setStroke('#202020', 3);
    }
  }
}

new Phaser.Game({
  type: Phaser.AUTO,
  width: GW, height: GH,
  parent: 'game',
  pixelArt: true,
  backgroundColor: '#b8bcc2',
  scene: [GalleryScene],
  scale: { mode: Phaser.Scale.NONE },   // render at full size; page scrolls
});
