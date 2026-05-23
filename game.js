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
  create(){
    buildAllTextures(this);
    console.log('[boot] textures —',
      'calico:', this.textures.exists('calico'),
      'roq:', this.textures.exists('roq'),
      'coin:', this.textures.exists('coin'));
    this.scene.start('title');
  }
}

class TitleScene extends Phaser.Scene {
  constructor(){ super('title'); }
  create(){
    this.cameras.main.setBackgroundColor(PAL.sky);
    this.add.text(W/2, 80, 'PORT FOLIOPOLIS\nNEEDS YOUR HELP!',
      {fontFamily:'monospace', fontSize:'34px', color:'#ffffff', align:'center', fontStyle:'bold'})
      .setOrigin(0.5).setStroke('#202020', 6);
    this.add.text(W/2, 190, 'CHOOSE YOUR HERO',
      {fontFamily:'monospace', fontSize:'20px', color:'#202020'}).setOrigin(0.5);

    const heroes = [
      {name:'Calico', color:PAL.calico, key:'calico'},
      {name:'Jay',    color:PAL.jay,    key:'jay'},
      {name:'Larry',  color:PAL.larry,  key:'larry'},
      {name:'Betsy',  color:PAL.betsy,  key:'betsy'},
    ];
    heroes.forEach((h,i)=>{
      const x = W/2 + (i-1.5)*130;
      let obj;
      if (this.textures.exists(h.key)) {
        obj = this.add.image(x, 300, h.key).setScale(1.2).setInteractive({useHandCursor:true});
      } else {
        obj = this.add.rectangle(x, 300, 58, 84, h.color)
          .setStrokeStyle(3, PAL.dark).setInteractive({useHandCursor:true});
        obj.on('pointerover', ()=> obj.setStrokeStyle(5, PAL.red));
        obj.on('pointerout',  ()=> obj.setStrokeStyle(3, PAL.dark));
      }
      this.add.text(x, 362, h.name, {fontFamily:'monospace', fontSize:'16px', color:'#202020'}).setOrigin(0.5);
      obj.on('pointerdown', ()=> this.scene.start('play', {color:h.color, name:h.name, key:h.key}));
    });
    this.add.text(W/2, H-28, '←→ move  ·  space jump  ·  A attack  ·  S speak  ·  ↑↓ ladders',
      {fontFamily:'monospace', fontSize:'13px', color:'#202020'}).setOrigin(0.5);
  }
}

class PlayScene extends Phaser.Scene {
  constructor(){ super('play'); }
  init(data){ this.heroColor = data.color || PAL.calico; this.heroName = data.name || 'Calico'; this.heroKey = data.key || 'calico'; }
  create(){
    const WORLD_W = 3200, GROUND_TOP = H - 48;
    this.cameras.main.setBackgroundColor(PAL.sky);
    this.physics.world.setBounds(0, -200, WORLD_W, H + 200);
    this.cameras.main.setBounds(0, 0, WORLD_W, H);

    // ground
    const ground = this.add.rectangle(WORLD_W/2, GROUND_TOP + 24, WORLD_W, 48, PAL.grass);
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
    if (this.textures.exists('roq')) this.add.image(1700, platY - 25, 'roq');
    else this.add.rectangle(1700, platY - 38, 38, 56, PAL.roq).setStrokeStyle(3, PAL.dark);
    this.add.text(1700, platY - 52, 'ROQ', {fontFamily:'monospace', fontSize:'13px', color:'#202020'}).setOrigin(0.5);

    // player — falls in from above (the drop-in)
    this.armored = true;  // you start in armor (G'n'G)
    const armoredKey = this.heroKey + '_armored';
    const pkey = this.textures.exists(armoredKey) ? armoredKey
               : (this.textures.exists(this.heroKey) ? this.heroKey : 'calico');
    this.player = this.physics.add.sprite(120, -120, pkey);
    this.player.body.setCollideWorldBounds(true);
    this.player.body.setMaxVelocity(210, 920);
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
      { dx: 2,  dy: -34, ang: 0   },  // overhead (blade up)
      { dx: 16, dy: -26, ang: 45  },  // diagonal
      { dx: 26, dy: -6,  ang: 90  },  // horizontal, out front
      { dx: 22, dy: 12,  ang: 125 },  // down-front (follow-through)
    ];
    this.sword = this.add.rectangle(0, 0, 12, 50, 0xffffff, 0.95)
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

    const onGround = b.blocked.down || b.touching.down;
    if(Phaser.Input.Keyboard.JustDown(this.keySpace) && onGround)
      b.setVelocityY(-622); // space only — up/down are reserved for ladders, not jump
    if(Phaser.Input.Keyboard.JustDown(this.keyA)) this.doAttack();
    if(Phaser.Input.Keyboard.JustDown(this.keyArmor)){
      this.armored = !this.armored;
      const k = this.armored ? this.heroKey + '_armored' : this.heroKey;
      if(this.textures.exists(k)) this.player.setTexture(k);
      this.armorText.setText(this.armored ? '[ ARMOR ]' : '[ no armor ]');
    }

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
