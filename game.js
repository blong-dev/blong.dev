// Port Foliopolis — greybox vertical slice
// Bright-NES placeholder palette; shapes stand in for sprites.
const W = 800, H = 480;

const PAL = {
  sky:   0x5c94fc,  // SMB sky blue
  grass: 0x00a800,
  dirt:  0xd07030,
  gold:  0xfcd800,
  red:   0xf83800,
  dark:  0x202020,
  roq:   0xa0521c,
  calico:0xf8b850, jay:0x3cbcfc, larry:0xb8b8d0, betsy:0x58d854,
};

class BootScene extends Phaser.Scene {
  constructor(){ super('boot'); }
  preload(){
    const PA = 'assets/pixel-adventure/';
    this.load.image('pa_bg',    PA + 'bg_green.png');
    this.load.image('pa_grass', PA + 'grass.png');
    this.load.image('pa_dirt',  PA + 'dirt.png');
    ['ninja','pink','mask','virtual'].forEach(c => {
      ['idle','run','jump','fall'].forEach(a => {
        this.load.spritesheet(`${c}_${a}`, PA + `${c}_${a}.png`, { frameWidth:96, frameHeight:96 });
      });
    });
  }
  create(){
    buildAllTextures(this);
    ['ninja','pink','mask','virtual'].forEach(c => {
      this.anims.create({ key:`${c}-idle`, frames:this.anims.generateFrameNumbers(`${c}_idle`), frameRate:20, repeat:-1 });
      this.anims.create({ key:`${c}-run`,  frames:this.anims.generateFrameNumbers(`${c}_run`),  frameRate:20, repeat:-1 });
      this.anims.create({ key:`${c}-jump`, frames:this.anims.generateFrameNumbers(`${c}_jump`), frameRate:1 });
      this.anims.create({ key:`${c}-fall`, frames:this.anims.generateFrameNumbers(`${c}_fall`), frameRate:1 });
    });
    this.scene.start('title');
  }
}

class TitleScene extends Phaser.Scene {
  constructor(){ super('title'); }
  create(){
    this.cameras.main.setBackgroundColor(PAL.sky);
    this.add.tileSprite(0, 0, W, H, 'pa_bg').setOrigin(0).setDepth(-10);
    this.add.tileSprite(0, 348, W, 48, 'pa_grass').setOrigin(0).setDepth(-9);
    this.add.tileSprite(0, 396, W, H - 396, 'pa_dirt').setOrigin(0).setDepth(-9);
    this.add.text(W/2, 80, 'PORT FOLIOPOLIS\nNEEDS YOUR HELP!',
      {fontFamily:'monospace', fontSize:'34px', color:'#ffffff', align:'center', fontStyle:'bold'})
      .setOrigin(0.5).setStroke('#202020', 6);
    this.add.text(W/2, 190, 'CHOOSE YOUR HERO',
      {fontFamily:'monospace', fontSize:'20px', color:'#202020'}).setOrigin(0.5);

    const heroes = [
      {name:'Calico', char:'pink'},
      {name:'Jay',    char:'ninja'},
      {name:'Larry',  char:'mask'},
      {name:'Betsy',  char:'virtual'},
    ];
    heroes.forEach((h,i)=>{
      const x = W/2 + (i-1.5)*160;
      const spr = this.add.sprite(x, 290, `${h.char}_idle`).setScale(1.2).setInteractive({useHandCursor:true});
      spr.play(`${h.char}-idle`);
      this.add.text(x, 408, h.name, {fontFamily:'monospace', fontSize:'18px', color:'#ffffff'})
        .setOrigin(0.5).setStroke('#202020', 4);
      spr.on('pointerover', ()=> spr.setScale(1.38));
      spr.on('pointerout',  ()=> spr.setScale(1.2));
      spr.on('pointerdown', ()=> this.scene.start('play', {name:h.name, char:h.char}));
    });
    this.add.text(W/2, H-28, '←→ move  ·  space jump  ·  A attack  ·  S speak  ·  ↑↓ ladders',
      {fontFamily:'monospace', fontSize:'13px', color:'#202020'}).setOrigin(0.5);
  }
}

class PlayScene extends Phaser.Scene {
  constructor(){ super('play'); }
  init(data){ this.heroName = data.name || 'Calico'; this.heroChar = data.char || 'ninja'; }
  create(){
    const WORLD_W = 3200, GROUND_TOP = 410;  // sits on the painted grass line
    this.cameras.main.setBackgroundColor(PAL.sky);
    this.physics.world.setBounds(0, -200, WORLD_W, H + 200);
    this.cameras.main.setBounds(0, 0, WORLD_W, H);

    // --- meadow (Pixel Adventure by Pixel Frog, CC0) ---
    this.add.tileSprite(0, 0, W, H, 'pa_bg').setOrigin(0).setScrollFactor(0).setDepth(-20);
    this.add.tileSprite(0, GROUND_TOP, WORLD_W, 48, 'pa_grass').setOrigin(0).setDepth(-6);
    this.add.tileSprite(0, GROUND_TOP + 48, WORLD_W, H - GROUND_TOP - 48, 'pa_dirt').setOrigin(0).setDepth(-6);

    // invisible collision ground at the grass surface
    const ground = this.add.rectangle(WORLD_W/2, GROUND_TOP + 24, WORLD_W, 48, PAL.grass).setVisible(false);
    this.physics.add.existing(ground, true);

    // zone labels + a town dirt strip
    this.add.text(400, 70, 'MEADOW', {fontFamily:'monospace', fontSize:'16px', color:'#206020'}).setOrigin(0.5);
    this.add.rectangle(1700, GROUND_TOP - 1, 620, 6, PAL.dirt);
    this.add.text(1700, 70, 'TOWN', {fontFamily:'monospace', fontSize:'18px', color:'#202020'}).setOrigin(0.5);

    // Roq on a jump-through platform
    const platY = GROUND_TOP - 120;
    const roqPlat = this.add.rectangle(1700, platY, 170, 14, PAL.dirt).setStrokeStyle(2, PAL.dark);
    this.physics.add.existing(roqPlat, true);
    roqPlat.body.checkCollision.down = false;
    roqPlat.body.checkCollision.left = false;
    roqPlat.body.checkCollision.right = false;
    if (this.textures.exists('roq')) this.add.image(1700, platY - 43, 'roq');
    else this.add.rectangle(1700, platY - 38, 38, 56, PAL.roq).setStrokeStyle(3, PAL.dark);
    this.add.text(1700, platY - 82, 'ROQ', {fontFamily:'monospace', fontSize:'13px', color:'#202020'}).setOrigin(0.5);

    // player — the selected Pixel Adventure character, animated (anims built in BootScene)
    this.player = this.physics.add.sprite(120, -120, `${this.heroChar}_idle`);
    this.player.body.setSize(69, 72).setOffset(12, 24);   // tight hitbox around the character
    this.player.body.setCollideWorldBounds(true);
    this.player.body.setMaxVelocity(210, 920);
    this.player.play(`${this.heroChar}-idle`);
    this.physics.add.collider(this.player, ground);
    this.physics.add.collider(this.player, roqPlat);
    this.cameras.main.startFollow(this.player, true, 0.12, 0.12);

    // coins
    this.coins = 0;
    [380, 660, 980, 2350, 2650].forEach(x=>{
      const c = this.physics.add.staticImage(x, GROUND_TOP - 22, 'coin');
      this.physics.add.overlap(this.player, c, ()=>{
        if(!c.active) return;
        c.destroy(); this.coins++; this.coinText.setText('GOLD: ' + this.coins);
      });
    });

    // input
    this.cursors  = this.input.keyboard.createCursorKeys();
    this.keyA     = this.input.keyboard.addKey('A');
    this.keySpace = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.keyArmor = this.input.keyboard.addKey('X'); // debug: preview armor on/off

    // HUD (fixed to camera) — coin counter top, armor indicator
    this.coinText = this.add.text(16, 12, 'GOLD: 0',
      {fontFamily:'monospace', fontSize:'20px', color:'#fcd800', fontStyle:'bold'})
      .setScrollFactor(0).setStroke('#202020', 5);
    this.add.text(W/2, 12, this.heroName,
      {fontFamily:'monospace', fontSize:'14px', color:'#202020'}).setOrigin(0.5,0).setScrollFactor(0);
    this.armorText = this.add.text(W-16, 12, '[ ARMOR ]',
      {fontFamily:'monospace', fontSize:'16px', color:'#ffffff'})
      .setOrigin(1,0).setScrollFactor(0).setStroke('#202020', 5);

    // sword swing — overhead -> down, ~4 frames, stays attached to the hero
    this.facing = 1;
    this.attacking = false;
    this.attackElapsed = 0;
    this.FRAME_MS = 55;
    this.SWING = [
      { dx: 6,  dy: -54, ang: 0   },  // overhead (blade up)
      { dx: 30, dy: -40, ang: 45  },  // diagonal
      { dx: 50, dy: -8,  ang: 90  },  // horizontal, out front
      { dx: 42, dy: 22,  ang: 125 },  // down-front (follow-through)
    ];
    this.sword = this.add.rectangle(0, 0, 20, 84, 0xffffff, 0.95)
      .setStrokeStyle(2, PAL.red).setVisible(false);
  }

  doAttack(){
    if(this.attacking) return;
    this.attacking = true;
    this.attackElapsed = 0;
  }

  update(time, delta){
    const b = this.player.body, speed = 200;
    if(this.cursors.left.isDown){ b.setVelocityX(-speed); this.facing = -1; }
    else if(this.cursors.right.isDown){ b.setVelocityX(speed); this.facing = 1; }
    else b.setVelocityX(0);
    this.player.setFlipX(this.facing < 0); // profile sprite faces the way you move/attack

    const onGround = b.blocked.down || b.touching.down;
    if(Phaser.Input.Keyboard.JustDown(this.keySpace) && onGround)
      b.setVelocityY(-622); // space only — up/down are reserved for ladders, not jump
    if(Phaser.Input.Keyboard.JustDown(this.keyA)) this.doAttack();
    // animation state
    const hc = this.heroChar;
    if(!onGround) this.player.play(b.velocity.y < 0 ? `${hc}-jump` : `${hc}-fall`, true);
    else if(this.cursors.left.isDown || this.cursors.right.isDown) this.player.play(`${hc}-run`, true);
    else this.player.play(`${hc}-idle`, true);

    // drive the swing — recomputed from the hero's CURRENT position each frame, so it stays attached
    if(this.attacking){
      this.attackElapsed += delta;
      const total = this.SWING.length * this.FRAME_MS;
      const f = this.SWING[Math.min(this.SWING.length - 1, Math.floor(this.attackElapsed / this.FRAME_MS))];
      this.sword.setVisible(true);
      this.sword.x = this.player.x + this.facing * f.dx;
      this.sword.y = this.player.y + f.dy;
      this.sword.setAngle(this.facing * f.ang);
      if(this.attackElapsed >= total){ this.attacking = false; this.sword.setVisible(false); }
    }
  }
}

new Phaser.Game({
  type: Phaser.AUTO,
  width: W, height: H,
  parent: 'game',
  pixelArt: true,
  backgroundColor: '#5c94fc',
  physics: { default: 'arcade', arcade: { gravity: { y: 1150 }, debug: false } },
  scene: [BootScene, TitleScene, PlayScene],
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
});
