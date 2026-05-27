// Port Foliopolis — greybox vertical slice
// Bright-NES placeholder palette; shapes stand in for sprites.
const W = 800, H = 480;

// Individual Glitch objects extracted from the BG sampler (assets/glitch/elements/<biome>_NN.png).
// Scattered across the explore world to make a diverse, evolving singular background.
const GLX_ELEM = { meadow: 21, woods: 11, mountain: 9, lair: 9 };

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
    this.load.image('sword',    'assets/sword.png');
    this.load.image('shield',   'assets/shield.png');
    this.load.image('pa_bg',      PA + 'bg_green.png');
    this.load.image('pa_bg_blue', PA + 'pa_bg_blue.png');
    this.load.image('pa_bg_gray', PA + 'pa_bg_gray.png');
    this.load.image('sky_zones', 'assets/glitch/sky_zones.png');           // world-anchored per-zone sky gradient
    ['mtn_0','mtn_1','mtn_2','treeline_leafy','treeline_pine0','treeline_pine1']   // big parallax backdrop pieces
      .forEach(k => this.load.image('bk_' + k, 'assets/glitch/backdrop/' + k + '.png'));
    ['pa_woods_top','pa_woods_fill','pa_mtn','pa_gold','pa_wood'].forEach(k => this.load.image(k, PA + k + '.png'));
    this.load.image('pa_grass', PA + 'grass.png');
    this.load.image('pa_dirt',  PA + 'dirt.png');
    for (const b in GLX_ELEM) for (let i = 0; i < GLX_ELEM[b]; i++)   // scattered Glitch bg objects
      this.load.image(`el_${b}_${i}`, `assets/glitch/elements/${b}_${String(i).padStart(2, '0')}.png`);
    ['ninja','pink','mask','virtual'].forEach(c => {
      ['idle','run','jump','fall','djump','wall'].forEach(a => {
        this.load.spritesheet(`${c}_${a}`, PA + `${c}_${a}.png`, { frameWidth:96, frameHeight:96 });
      });
    });
    // enemies (each baked 3x; frame dims differ per creature)
    const ES = { slime:[132,90], ghost:[88,60], rino:[156,102], plant:[132,126], pig:[108,90], skull:[156,162] };
    for (const k in ES) this.load.spritesheet(`${k}_idle`, PA + `${k}_idle.png`, { frameWidth:ES[k][0], frameHeight:ES[k][1] });
    ['p_orange','p_red','p_bullet','p_rock'].forEach(k => this.load.image(k, PA + k + '.png'));
    this.load.spritesheet('duck_idle', PA + 'duck_idle.png', { frameWidth:54, frameHeight:54 });
  }
  create(){
    buildAllTextures(this);
    ['ninja','pink','mask','virtual'].forEach(c => {
      this.anims.create({ key:`${c}-idle`, frames:this.anims.generateFrameNumbers(`${c}_idle`), frameRate:20, repeat:-1 });
      this.anims.create({ key:`${c}-run`,  frames:this.anims.generateFrameNumbers(`${c}_run`),  frameRate:20, repeat:-1 });
      this.anims.create({ key:`${c}-jump`, frames:this.anims.generateFrameNumbers(`${c}_jump`), frameRate:1 });
      this.anims.create({ key:`${c}-fall`, frames:this.anims.generateFrameNumbers(`${c}_fall`), frameRate:1 });
      this.anims.create({ key:`${c}-djump`, frames:this.anims.generateFrameNumbers(`${c}_djump`), frameRate:20, repeat:0 });
      this.anims.create({ key:`${c}-wall`,  frames:this.anims.generateFrameNumbers(`${c}_wall`),  frameRate:16, repeat:-1 });
    });
    ['slime','ghost','rino','plant','pig','skull'].forEach(k =>
      this.anims.create({ key:`${k}-idle`, frames:this.anims.generateFrameNumbers(`${k}_idle`), frameRate:14, repeat:-1 }));
    this.anims.create({ key:'phil-idle', frames:this.anims.generateFrameNumbers('duck_idle'), frameRate:8, repeat:-1 });
    const explore = location.search.indexOf('explore') >= 0;   // /?explore → roam the empty world
    this.scene.start(explore ? 'explore' : 'title');
  }
}

class TitleScene extends Phaser.Scene {
  constructor(){ super('title'); }
  create(){
    this.cameras.main.setBackgroundColor(PAL.sky);
    this.add.tileSprite(0, 0, W, H, 'pa_bg').setOrigin(0).setDepth(-10);
    this.add.tileSprite(0, 348, W, 48, 'pa_grass').setOrigin(0).setDepth(-9);
    this.add.tileSprite(0, 396, W, H - 396, 'pa_dirt').setOrigin(0).setDepth(-9);
    // Phil (static — no bounce) greets you and delivers the hook from a punchy speech bubble
    this.add.sprite(108, 172, 'duck_idle').setScale(2.0).setFlipX(true);   // face his speech bubble
    const bx = 188, by = 32, bw = 504, bh = 128, r = 18, INK = 0x202020;
    const g = this.add.graphics();
    g.fillStyle(INK, 0.22); g.fillRoundedRect(bx + 9, by + 11, bw, bh, r);                              // drop shadow
    g.fillStyle(0xffffff, 1); g.fillRoundedRect(bx, by, bw, bh, r);                                     // body
    g.lineStyle(5, INK, 1); g.strokeRoundedRect(bx, by, bw, bh, r);                                     // bold border
    g.fillStyle(0xffffff, 1); g.fillTriangle(bx + 34, by + bh - 3, bx + 98, by + bh - 3, 148, by + bh + 42);  // tail
    g.lineStyle(5, INK, 1);
    g.lineBetween(bx + 34, by + bh, 148, by + bh + 42);
    g.lineBetween(bx + 98, by + bh, 148, by + bh + 42);
    this.add.text(bx + bw / 2, by + 47, 'PORT FOLIOPOLIS',
      { fontFamily:'monospace', fontSize:'31px', color:'#c0392b', fontStyle:'bold' }).setOrigin(0.5);
    this.add.text(bx + bw / 2, by + 88, 'NEEDS YOUR HELP!',
      { fontFamily:'monospace', fontSize:'27px', color:'#202020', fontStyle:'bold' }).setOrigin(0.5);
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
    if(window.PortChat) window.PortChat.reset();   // clean-slate NPC chats each playthrough (death = fresh start)
    this.cameras.main.setBackgroundColor(PAL.sky);
    this.physics.world.setBounds(0, -200, WORLD_W, GROUND_TOP + 200);   // world FLOOR = grass line — nothing can fall past it
    this.cameras.main.setBounds(0, 0, WORLD_W, H);

    // --- meadow (Pixel Adventure by Pixel Frog, CC0) ---
    this.add.tileSprite(0, 0, W, H, 'pa_bg').setOrigin(0).setScrollFactor(0).setDepth(-20);
    this.add.tileSprite(0, GROUND_TOP, WORLD_W, 48, 'pa_grass').setOrigin(0).setDepth(-6);
    this.add.tileSprite(0, GROUND_TOP + 48, WORLD_W, H - GROUND_TOP - 48, 'pa_dirt').setOrigin(0).setDepth(-6);

    // invisible collision ground — thick + explicitly full-world so nothing falls through past town
    const ground = this.add.rectangle(WORLD_W/2, GROUND_TOP + 120, WORLD_W, 240, PAL.grass).setVisible(false);
    this.physics.add.existing(ground, true);
    ground.body.setSize(WORLD_W, 240);
    this.groundBody = ground;   // dropped coins collide with this

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

    // Phil — assistant duck: trails you a few steps behind, hops obstacles, walks through enemies; click (or face him + S) to talk
    this.phil = this.physics.add.sprite(60, GROUND_TOP - 100, 'duck_idle');
    this.phil.body.setSize(48, 44).setOffset(3, 10);
    this.phil.body.setCollideWorldBounds(true);
    this.phil.body.setMaxVelocity(230, 920);
    this.phil.play('phil-idle');
    this.physics.add.collider(this.phil, ground);
    this.physics.add.collider(this.phil, roqPlat);
    this.phil.setInteractive({ useHandCursor:true });
    this.phil.on('pointerdown', () => this.openChat('phil'));

    // coins
    this.coins = 0;
    [380, 660, 980, 2350, 2650].forEach(x=>{
      const c = this.physics.add.staticImage(x, GROUND_TOP - 22, 'coin');
      this.physics.add.overlap(this.player, c, ()=>{
        if(!c.active) return;
        c.destroy(); this.coins++; this.coinText.setText('GOLD: ' + this.coins);
      });
    });

    // --- the bestiary (Pixel Adventure) ---
    this.enemies = this.physics.add.group();
    const GROUNDED = [
      { kind:'slime', x:700,  body:[114,78, 9,12],  gold:1, hp:1, patrol:90 },                          // Imp
      { kind:'rino',  x:1150, body:[144,84, 6,18],  gold:1, hp:1, patrol:0  },                          // Thornboar (charges)
      { kind:'plant', x:2300, body:[84,105, 33,21], gold:1, hp:1, patrol:0  },                          // Faun
      { kind:'pig',   x:1700, body:[99,81, 6,9],    gold:5, hp:5, patrol:0, onPlat:true, boss:true },   // Roq
    ];
    GROUNDED.forEach(d => {
      const e = this.enemies.create(d.x, d.onPlat ? platY - 80 : GROUND_TOP - 160, d.kind + '_idle');
      e.body.setSize(d.body[0], d.body[1]).setOffset(d.body[2], d.body[3]);
      e.body.setCollideWorldBounds(true);
      e.play(d.kind + '-idle');
      e.setData({ kind:d.kind, gold:d.gold, hp:d.hp, patrol:d.patrol, dir:1, homeX:d.x, floater:false, dying:false, boss:!!d.boss, aggro:false });
    });
    [ { kind:'ghost', x:1400, y:300, gold:1, hp:1 },                                                    // Wisp
      { kind:'skull', x:2900, y:230, gold:5, hp:5, boss:true } ].forEach(d => {                         // Emma
      const e = this.enemies.create(d.x, d.y, d.kind + '_idle');
      e.body.setAllowGravity(false);
      e.play(d.kind + '-idle');
      e.setData({ kind:d.kind, gold:d.gold, hp:d.hp, patrol:0, dir:1, homeX:d.x, floater:true, dying:false, boss:!!d.boss, aggro:false });
    });
    this.physics.add.collider(this.enemies, ground);
    this.physics.add.collider(this.enemies, roqPlat);
    this.add.text(2900, 110, 'EMMA', {fontFamily:'monospace', fontSize:'16px', color:'#202020'}).setOrigin(0.5);

    // player health — 2 hits per life (G'n'G-lite); 2 lives, then a genuine death
    this.hp = 2;
    this.invuln = 0;
    this.hasShield = false;
    this.tookShield = false;
    this.carriedShield = null;
    this.boltToggle = false;
    this.physics.add.overlap(this.player, this.enemies, (p, e) => this.playerHit(e));

    // projectiles — Emma's orange/red particles + Plant's lob
    this.bolts = this.physics.add.group();
    this.physics.add.overlap(this.player, this.bolts, (p, b) => { const bx = b.x; b.destroy(); this.damagePlayer(bx); });
    this.physics.add.collider(this.bolts, ground, (b) => b.destroy());

    // input
    this.cursors  = this.input.keyboard.createCursorKeys();
    this.keyA     = this.input.keyboard.addKey('A');
    this.keySpace = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.keyS     = this.input.keyboard.addKey('S'); // speak / take Emma's shield

    // HUD (fixed to camera) — coin counter top, armor indicator
    this.coinText = this.add.text(16, 12, 'GOLD: 0',
      {fontFamily:'monospace', fontSize:'20px', color:'#fcd800', fontStyle:'bold'})
      .setScrollFactor(0).setStroke('#202020', 5);
    this.add.text(W/2, 12, this.heroName,
      {fontFamily:'monospace', fontSize:'14px', color:'#202020'}).setOrigin(0.5,0).setScrollFactor(0);
    this.hpText = this.add.text(W-16, 12, '',
      {fontFamily:'monospace', fontSize:'18px', color:'#ff5a5a', fontStyle:'bold'})
      .setOrigin(1,0).setScrollFactor(0).setStroke('#202020', 5);
    this.updateHpHud();

    // sword swing — overhead -> down, ~4 frames, stays attached to the hero
    this.facing = 1;
    this.jumpsUsed = 0;       // 0 on ground -> allows 1 ground jump + 1 air (double) jump
    this.swingHits = new Set();
    this.attacking = false;
    this.attackElapsed = 0;
    this.FRAME_MS = 55;
    this.SWING = [   // hilt-pivot: (dx,dy) is the HAND position, ang sweeps the blade around it
      { dx: 10, dy: -10, ang: -10 },  // windup — blade up & back
      { dx: 15, dy: -6,  ang: 50  },  // chopping down-forward
      { dx: 19, dy: -2,  ang: 105 },  // out front
      { dx: 21, dy: 6,   ang: 150 },  // down follow-through
    ];
    this.sword = this.add.image(0, 0, 'sword').setOrigin(0.5, 0.85).setDepth(5).setVisible(false);  // pivot at the grip
  }

  doAttack(){
    if(this.attacking) return;
    this.attacking = true;
    this.attackElapsed = 0;
    this.swingHits = new Set();   // each enemy takes at most one hit per swing
  }

  hitEnemy(e){
    if(e.getData('dying') || this.swingHits.has(e)) return;
    this.swingHits.add(e);
    if(e.getData('boss') && !e.getData('aggro')){     // bosses stay passive until you swing at them
      e.setData('aggro', true);
      e.setData('aggroAt', this.time.now);
      e.setData('nextFire', this.time.now + 1200);    // a beat before the first attack
      e.setData('nextDive', this.time.now + 3000);    // and well before the first dive
    }
    if(e.getData('kind') === 'skull' && this.tookShield) e.setData('escalated', true);  // betray the dragon who armed you
    const hp = e.getData('hp') - 1;
    e.setData('hp', hp);
    if(hp > 0){                                   // flinch
      e.setTintFill(0xffffff);
      this.time.delayedCall(100, () => { if(e.active) e.clearTint(); });
      return;
    }
    e.setData('dying', true);
    e.body.enable = false;
    const gold = e.getData('gold'), ex = e.x, ey = e.y;
    e.setTintFill(0xffffff);
    this.tweens.add({ targets: e, alpha: 0, scaleX: 1.25, scaleY: 1.25, duration: 170,
      onComplete: () => { e.destroy(); this.dropGold(ex, ey, gold); } });
  }

  dropGold(x, y, n){
    for(let i = 0; i < n; i++){
      const c = this.physics.add.image(x + Phaser.Math.Between(-28, 28), y - 10, 'coin');
      c.setCollideWorldBounds(true);
      this.physics.add.collider(c, this.groundBody);
      c.setVelocity(Phaser.Math.Between(-70, 70), Phaser.Math.Between(-260, -150)).setBounce(0.35);
      this.physics.add.overlap(this.player, c, () => {
        if(!c.active) return;
        c.destroy(); this.coins++; this.coinText.setText('GOLD: ' + this.coins);
      });
    }
  }

  playerHit(e){
    if(e.getData('dying')) return;
    if(e.getData('boss') && !e.getData('aggro')) return;   // a passive boss does no contact damage until provoked
    this.damagePlayer(e.x);
  }

  damagePlayer(fromX){
    if(this.time.now < this.invuln) return;
    this.invuln = this.time.now + 1200;
    const dir = this.player.x <= fromX ? -1 : 1;
    this.player.body.setVelocity(dir * 240, -250);
    if(this.hasShield){                       // shield eats the hit first, then shatters
      this.hasShield = false;
      if(this.carriedShield){
        const s = this.carriedShield; this.carriedShield = null;
        this.tweens.add({ targets:s, scaleX:1.5, scaleY:1.5, angle:120, alpha:0, duration:280, onComplete:()=> s.destroy() });
      }
      this.player.setTint(0x8fd0ff);
      this.time.delayedCall(1200, () => this.player.clearTint());
      this.updateHpHud();
      return;
    }
    this.hp--;
    this.player.setTint(0xff6a6a);
    this.time.delayedCall(1200, () => this.player.clearTint());
    this.updateHpHud();
    if(this.hp <= 0) this.die();
  }

  fireBolt(emma){
    this.boltToggle = !this.boltToggle;
    const b = this.bolts.create(emma.x, emma.y + 20, this.boltToggle ? 'p_orange' : 'p_red');
    b.body.setAllowGravity(false);
    const sx = (this.player.x < emma.x) ? -1 : 1;        // toward your SIDE at a fixed 45° dive — not aimed; dodgeable
    b.body.setVelocity(sx * 190, 190);
    this.time.delayedCall(3500, () => { if(b.active) b.destroy(); });
  }

  grantEmmaShield(){                          // called by the chat once Emma is won over
    if(this.tookShield || this.shieldDropping) return;
    this.shieldDropping = true;
    const emma = this.enemies.getChildren().find(e => e.active && e.getData('kind') === 'skull');
    const x = emma ? emma.x : this.player.x, y = emma ? emma.y : 220;
    const drop = this.physics.add.image(x, y, 'shield').setDepth(4);
    drop.setCollideWorldBounds(true).setBounce(0.5).setVelocity(Phaser.Math.Between(-30, 30), -140);
    this.physics.add.collider(drop, this.groundBody);
    this.tweens.add({ targets: drop, angle: 360, duration: 1100, repeat: -1 });   // shine/spin
    const t = this.add.text(x, y - 70, "Emma's shield — take it!",
      { fontFamily:'monospace', fontSize:'14px', color:'#8fd0ff', fontStyle:'bold' }).setOrigin(0.5).setStroke('#202020', 4);
    this.tweens.add({ targets:t, y:t.y - 26, alpha:0, duration:2400, onComplete:()=> t.destroy() });
    this.physics.add.overlap(this.player, drop, () => { if(drop.active){ drop.destroy(); this.giveShield(); } });
  }

  giveShield(){
    this.tookShield = true; this.hasShield = true; this.shieldDropping = false;
    this.updateHpHud();
    if(this.carriedShield) this.carriedShield.destroy();
    this.carriedShield = this.add.image(this.player.x, this.player.y, 'shield').setScale(0.66).setDepth(1);
  }

  die(){                            // hp gone = genuine death — fade out, full restart from the home screen
    this.player.disableBody(true, false);
    this.cameras.main.fade(550, 0, 0, 0);
    this.time.delayedCall(580, () => this.scene.start('title'));
  }

  updateHpHud(){
    if(this.hpText) this.hpText.setText('HP ' + '♥'.repeat(Math.max(0, this.hp)) + (this.hasShield ? ' (S)' : ''));
  }

  updatePhil(){
    const p = this.phil, b = p.body;
    const onGround = b.blocked.down || b.touching.down;
    const gap = this.player.x - p.x, dist = Math.abs(gap);
    let chasing = p.getData('chasing');
    if(dist > 150) chasing = true; else if(dist < 80) chasing = false;   // hysteresis: trail, but hold once close
    p.setData('chasing', chasing);
    if(chasing){
      const dir = Math.sign(gap) || 1;
      b.setVelocityX(dir * 200);                 // never faster than the hero
      p.setFlipX(dir > 0);                       // face the way he's hustling
      const blocked = (b.blocked.left && dir < 0) || (b.blocked.right && dir > 0);
      if(onGround && (blocked || this.player.y < p.y - 60)) b.setVelocityY(-470);   // hop obstacles / climb to you
    } else {
      b.setVelocityX(0);                         // close enough — hold position so you can turn and talk
      p.setFlipX(this.player.x > p.x);           // turn to face you
    }
    p.play('phil-idle', true);
  }

  openChat(npc){
    const src = npc === 'phil' ? this.phil
      : this.enemies.getChildren().find(e => e.getData('kind') === (npc === 'roq' ? 'pig' : 'skull'));
    if(!src || !src.active || !window.PortChat) return;
    window.PortChat.open(npc, this);   // DOM chat panel; pauses the world while open
  }

  showGreet(e, text){                  // floating bubble over a boss on first approach
    const t = this.add.text(e.x, e.y - 72, text,
      { fontFamily:'monospace', fontSize:'13px', color:'#202020', backgroundColor:'#ffffff',
        padding:{ x:7, y:5 }, wordWrap:{ width:250 }, align:'center' }).setOrigin(0.5, 1).setDepth(30);
    this.tweens.add({ targets:t, y:t.y - 16, alpha:0, delay:2600, duration:1300, onComplete:()=> t.destroy() });
  }

  update(time, delta){
    const b = this.player.body, speed = 200, JUMP_V = 480, MAX_JUMPS = 2;
    if(this.cursors.left.isDown){ b.setVelocityX(-speed); this.facing = -1; }
    else if(this.cursors.right.isDown){ b.setVelocityX(speed); this.facing = 1; }
    else b.setVelocityX(0);
    this.player.setFlipX(this.facing < 0); // profile sprite faces the way you move/attack

    const onGround = b.blocked.down || b.touching.down;
    if(onGround) this.jumpsUsed = 0;
    if(Phaser.Input.Keyboard.JustDown(this.keySpace) && this.jumpsUsed < MAX_JUMPS){
      b.setVelocityY(-JUMP_V);
      this.jumpsUsed++;
      if(this.jumpsUsed === 2) this.player.play(`${this.heroChar}-djump`); // 2nd (air) jump → double-jump anim
    }
    if(Phaser.Input.Keyboard.JustDown(this.keyA)) this.doAttack();
    if(Phaser.Input.Keyboard.JustDown(this.keyS)){           // talk to the nearest NPC you're facing
      let best = null, bd = 240;
      const check = (k, n) => {
        if(!n || !n.active) return;
        const d = Phaser.Math.Distance.Between(this.player.x, this.player.y, n.x, n.y);
        const facing = Math.sign(n.x - this.player.x) === this.facing || d < 70;   // must be looking at them
        if(d < bd && facing){ bd = d; best = k; }
      };
      check('phil', this.phil);
      this.enemies.getChildren().forEach(e => { if(e.getData('kind') === 'pig') check('roq', e); if(e.getData('kind') === 'skull') check('emma', e); });
      if(best) this.openChat(best);
    }
    // animation state (let the double-jump anim play out before reverting to jump/fall)
    const hc = this.heroChar;
    const cur = this.player.anims.currentAnim && this.player.anims.currentAnim.key;
    if(cur === `${hc}-djump` && this.player.anims.isPlaying){
      // double-jump animation in progress — leave it alone
    } else if(!onGround){
      this.player.play(b.velocity.y < 0 ? `${hc}-jump` : `${hc}-fall`, true);
    } else if(this.cursors.left.isDown || this.cursors.right.isDown){
      this.player.play(`${hc}-run`, true);
    } else {
      this.player.play(`${hc}-idle`, true);
    }

    this.updatePhil();
    if(this.carriedShield){                   // shield rides on the hero's arm until spent
      this.carriedShield.x = this.player.x + this.facing * 15;
      this.carriedShield.y = this.player.y + 8;
      this.carriedShield.setFlipX(this.facing < 0);
    }

    // enemy behaviours
    this.enemies.getChildren().forEach(e => {
      if(!e.active || e.getData('dying')) return;
      const kind = e.getData('kind');

      if(e.getData('boss') && !e.getData('greeted') && Phaser.Math.Distance.Between(this.player.x, this.player.y, e.x, e.y) < 340){
        e.setData('greeted', true);   // first approach this run → auto speech bubble
        this.showGreet(e, kind === 'pig' ? "Ho there, hero! Got work for you — press S to talk."
                                         : "Lower your blade, little one… let's talk. Press S.");
      }

      if(kind === 'ghost'){                          // Wisp — Boo: freezes when faced; else zig-zags toward you
        e.setFlipX(this.player.x > e.x);
        const faced = Math.sign(e.x - this.player.x) === this.facing;
        if(faced){ e.body.setVelocity(0, 0); }
        else {
          const a = Math.atan2((this.player.y - 30) - e.y, this.player.x - e.x);
          const wob = Math.sin(time / 150) * 130;     // weave across the approach line — unpredictable
          e.body.setVelocity(Math.cos(a) * 64 + Math.cos(a + Math.PI/2) * wob,
                             Math.sin(a) * 64 + Math.sin(a + Math.PI/2) * wob);
        }

      } else if(kind === 'rino'){                    // Thornboar — charges; ramps to full speed after 1s closing in
        const dx = this.player.x - e.x;
        if(Math.abs(dx) < 460){
          const dir = Math.sign(dx) || 1;
          if(e.getData('chargeDir') !== dir){ e.setData('chargeDir', dir); e.setData('chargeStart', time); }
          const fast = time - e.getData('chargeStart') > 1000;
          e.body.setVelocityX(dir * (fast ? 300 : 110));
          e.setFlipX(dir > 0);
        } else {
          e.setData('chargeDir', 0);
          e.body.setVelocityX(0);
        }

      } else if(kind === 'skull'){                   // Emma — passive; on provoke she recoils, then loops; never faster than the hero
        const esc = e.getData('escalated');
        const SP = esc ? 200 : 150;                                 // base escapable; escalated matches the hero's ~200 (never exceeds)
        if(!e.getData('aggro')){                                    // hovering, not yet attacking
          e.body.setVelocity(0, ((230 + Math.sin(time / 600) * 45) - e.y) * 2);
        } else if(time < (e.getData('aggroAt') || 0) + 1100){       // first-hit recoil: pull away and rise, give the hero room
          const away = (e.x < this.player.x) ? -1 : 1;
          e.body.setVelocity(away * SP, -SP * 0.7);
        } else if(time < (e.getData('diveUntil') || 0)){           // mid-dive: swoop at the player (dodgeable — slower than you)
          const a = Math.atan2(this.player.y - e.y, this.player.x - e.x);
          e.body.setVelocity(Math.cos(a) * SP, Math.sin(a) * SP);
        } else {                                                   // flight: drift + bob, fire, schedule next dive
          let dir = e.getData('dir');
          if(e.x > e.getData('homeX') + 260) dir = -1;
          else if(e.x < e.getData('homeX') - 260) dir = 1;
          e.setData('dir', dir);
          e.body.setVelocityX(dir * (esc ? 110 : 60));
          e.body.setVelocityY(((230 + Math.sin(time / (esc ? 240 : 600)) * (esc ? 80 : 45)) - e.y) * 2.5);
          if(time > (e.getData('nextFire') || 0)){ this.fireBolt(e); e.setData('nextFire', time + (esc ? 650 : 950)); }
          if(time > (e.getData('nextDive') || 0)){ e.setData('diveUntil', time + 480); e.setData('nextDive', time + (esc ? 2300 : 3800)); }
        }

      } else if(kind === 'plant'){                   // Faun — lobs an arc
        if(time > (e.getData('nextFire') || 0) && Math.abs(this.player.x - e.x) < 620){
          const b = this.bolts.create(e.x, e.y - 36, 'p_bullet');
          b.body.setVelocity(Phaser.Math.Clamp(this.player.x - e.x, -260, 260), -340);
          this.time.delayedCall(4000, () => { if(b.active) b.destroy(); });
          e.setData('nextFire', time + 1700);
        }

      } else if(kind === 'pig'){                     // Roq — passive until provoked, then lobs rocks in a fixed arc
        if(e.getData('aggro') && time > (e.getData('nextFire') || 0)){
          const b = this.bolts.create(e.x, e.y - 30, 'p_rock');
          const sx = (this.player.x < e.x) ? -1 : 1;
          b.body.setVelocity(sx * 200, -300);          // consistent arc toward your side — read it and weave
          this.time.delayedCall(4000, () => { if(b.active) b.destroy(); });
          e.setData('nextFire', time + 950);
        }

      } else if(e.getData('patrol') > 0){            // Imp (Slime) — patrol
        let dir = e.getData('dir');
        if(e.x > e.getData('homeX') + e.getData('patrol')) dir = -1;
        else if(e.x < e.getData('homeX') - e.getData('patrol')) dir = 1;
        e.setData('dir', dir);
        e.body.setVelocityX(dir * 64);
        e.setFlipX(dir > 0);
      }
    });

    // drive the swing — recomputed from the hero's CURRENT position each frame, so it stays attached
    if(this.attacking){
      this.attackElapsed += delta;
      const total = this.SWING.length * this.FRAME_MS;
      const f = this.SWING[Math.min(this.SWING.length - 1, Math.floor(this.attackElapsed / this.FRAME_MS))];
      this.sword.setVisible(true);
      this.sword.x = this.player.x + this.facing * f.dx;
      this.sword.y = this.player.y + f.dy;
      this.sword.setAngle(this.facing * f.ang);
      // blade hitbox — a reach-region in front of the hero, live through the swing
      const hb = new Phaser.Geom.Rectangle(this.player.x + this.facing * 46 - 39, this.player.y - 60, 78, 96);
      this.enemies.getChildren().forEach(e => {
        if(e.active && !e.getData('dying') && Phaser.Geom.Rectangle.Overlaps(hb, e.getBounds())) this.hitEnemy(e);
      });
      this.bolts.getChildren().forEach(b => {                              // swat projectiles out of the air
        if(b.active && Phaser.Geom.Rectangle.Overlaps(hb, b.getBounds())){
          const px = b.x, py = b.y, tex = (b.texture && b.texture.key) || 'p_bullet';
          b.destroy();
          const poof = this.add.image(px, py, tex).setDepth(6);
          this.tweens.add({ targets: poof, scaleX: 1.9, scaleY: 1.9, alpha: 0, duration: 170, onComplete: () => poof.destroy() });
        }
      });
      if(this.attackElapsed >= total){ this.attacking = false; this.sword.setVisible(false); }
    }
  }
}

// ============================================================
//  EXPLORE — the whole field, blockout, no NPCs/enemies (/?explore)
// ============================================================
class ExploreScene extends Phaser.Scene {
  constructor(){ super('explore'); }
  create(){
    const GT = 410, WORLD_W = 9600;
    this.killY = 1100;
    this.physics.world.setBounds(0, -400, WORLD_W, 1600);
    this.cameras.main.setBounds(0, -400, WORLD_W, 1600);   // headroom above the mountain top so the hero stays centered
    this.cameras.main.setBackgroundColor(PAL.sky);

    // biome ranges (drive the labels + the parallax-bg swapping)
    this.BIOMES = [
      [0,    2400, 'meadow',   'MEADOW · TOWN'],
      [2400, 4800, 'delta',    'DELTA'],
      [4800, 7200, 'woods',    'WOODS'],
      [7200, 8800, 'mountain', 'MOUNTAIN'],
      [8800, 9600, 'lair',     'LAIR'],
    ];
    this.BIOMES.forEach(([x1, x2, key, label]) =>
      this.add.text((x1 + x2) / 2, 150, label, { fontFamily:'monospace', fontSize:'20px', color:'#ffffff' })
        .setOrigin(0.5).setStroke('#202020', 5).setDepth(-1));
    // Background = world-anchored parallax. Colours belong to the zone's PLACE in the world (you scroll
    // through them), not to the camera: a per-zone sky gradient + far mountains + mid treelines, all in
    // world space behind the near scatter. No camera-triggered crossfade.
    this.buildParallax(WORLD_W, GT);

    // player (default hero for roaming)
    this.player = this.physics.add.sprite(80, GT - 130, 'ninja_idle');
    this.player.body.setSize(69, 72).setOffset(12, 24);
    this.player.body.setMaxVelocity(220, 950);
    this.player.play('ninja-idle');
    this.cameras.main.startFollow(this.player, true, 0.12, 0.12);
    this.cameras.main.setDeadzone(140, 240);   // roam-box, not glued to center; headroom (above) handles the mountain top
    this.lastSafe = { x: 80, y: GT - 130 };
    this.facing = 1; this.jumpsUsed = 0;

    const floor = (x1, x2, topY, topTile, fillTile) => {
      const w = x2 - x1;
      this.add.tileSprite(x1, topY + 48, w, 240, fillTile || topTile).setOrigin(0).setDepth(-7);   // dirt body below
      this.add.tileSprite(x1, topY, w, 48, topTile).setOrigin(0).setDepth(-5);                      // one full surface tile on top (grass never covered)
      const r = this.add.rectangle(x1 + w / 2, topY + 26, w, 52).setVisible(false);
      this.physics.add.existing(r, true); r.body.setSize(w, 52);
      this.physics.add.collider(this.player, r);
    };
    const plat = (x1, x2, topY) => {           // wooden jump-through platform (pack wood-beam tile)
      const w = x2 - x1;
      this.add.tileSprite(x1, topY, w, 24, 'pa_wood').setOrigin(0).setDepth(-4);
      const r = this.add.rectangle(x1 + w / 2, topY + 12, w, 24).setVisible(false);
      this.physics.add.existing(r, true); r.body.setSize(w, 24);
      r.body.checkCollision.down = r.body.checkCollision.left = r.body.checkCollision.right = false;
      this.physics.add.collider(this.player, r);
    };
    const wall = (x, topY, h) => {              // solid vertical rock face — wall-slide + wall-jump surface
      this.add.tileSprite(x - 22, topY, 44, h, 'pa_mtn').setOrigin(0).setDepth(-6);
      const r = this.add.rectangle(x, topY + h / 2, 36, h).setVisible(false);
      this.physics.add.existing(r, true); r.body.setSize(36, h);
      this.physics.add.collider(this.player, r);
    };

    floor(0, 2400, GT, 'pa_grass', 'pa_dirt');                        // MEADOW + TOWN
    plat(1980, 2200, GT - 120);                                       //   Roq's town platform (wood)
    // DELTA — blue water + wood logs you hop across
    this.add.rectangle(2400, GT + 6, 2400, 380, 0x3a78c8).setOrigin(0).setDepth(-6).setAlpha(0.6);
    this.add.rectangle(2400, GT + 6, 2400, 10, 0x9fd6f2).setOrigin(0).setDepth(-6).setAlpha(0.85);   // surface shimmer
    [2540, 2840, 3140, 3440, 3740, 4040, 4340, 4640].forEach(lx => plat(lx, lx + 170, GT));
    floor(4800, 5950, GT, 'pa_woods_top', 'pa_woods_fill');           // WOODS — orange/brown (pit gap 5950–6300)
    floor(6300, 7200, GT, 'pa_woods_top', 'pa_woods_fill');
    // MOUNTAIN — a dramatic vertical climb: rising ledges (double-jumpable) with solid rock faces
    // you can wall-slide down and wall-jump off; the scattered rock spires sell the crag.
    // MOUNTAIN — a hard vertical climb. A full catch-floor at the base means every miss drops you here
    // and you start the ascent over. Narrow ledges + a rock wall (wall-slide/jump) carry you to the summit.
    floor(7200, 8800, GT, 'pa_mtn', 'pa_mtn');                       // catch floor (whole base)
    plat(7330, 7425, GT - 165);                                      // P1  — ascent begins
    plat(7560, 7655, GT - 320);                                      // P2
    plat(7350, 7445, GT - 455);                                      // P3  (zig back to the left)
    plat(7600, 7695, GT - 490);                                      // P4  — summit
    wall(7290, GT - 490, 490);                                       // left rock face — wall-slide / wall-jump
    plat(7860, 7965, GT - 400);                                      // P5  — descent to the lair begins
    plat(8130, 8250, GT - 340);                                      // P6
    plat(8400, 8530, GT - 285);                                      // P7
    floor(8530, 8800, GT - 285, 'pa_mtn', 'pa_mtn');                 // lair approach lip
    floor(8800, 9600, GT - 285, 'pa_gold', 'pa_gold');               // LAIR — gold plate floor
    floor(5820, 6380, 820, 'pa_mtn', 'pa_mtn');                       // HOME BASE — secret chamber (rock)
    this.add.text(6100, 760, '★ 1-UP ★', { fontFamily:'monospace', fontSize:'15px', color:'#fcd800' })
      .setOrigin(0.5).setStroke('#202020', 4);
    // floating platforms — a little verticality + challenge through the run
    [[760, 940, GT - 110], [1180, 1340, GT - 175], [1520, 1660, GT - 120],
     [5080, 5260, GT - 130], [5480, 5660, GT - 205], [6620, 6820, GT - 140]]
      .forEach(([a, b, y]) => plat(a, b, y));

    this.scatterBg(GT, WORLD_W);   // diverse, evolving singular background of individual Glitch objects

    this.cursors = this.input.keyboard.createCursorKeys();
    this.keySpace = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.add.text(12, 12, 'EXPLORE  ·  ←→ move  ·  space ×2 jump  ·  fall = respawn',
      { fontFamily:'monospace', fontSize:'13px', color:'#ffffff' }).setScrollFactor(0).setStroke('#202020', 4).setDepth(50);
  }

  // World-anchored parallax backdrop. Wide pieces (distant mountain ranges + their green foothills, and
  // big treelines) are laid out in world space and parallaxed by depth, so the scenery belongs to the
  // zone's PLACE in the world. Vertically screen-locked (scrollFactorY 0) → a stable distant horizon.
  buildParallax(WORLD_W, GT){
    this.sky = this.add.tileSprite(0, 0, W, H, 'sky_zones').setOrigin(0).setScrollFactor(0).setDepth(-50);
    const rnd = (a, c) => a + Math.random() * (c - a);
    const zoneAt = (x) => (this.BIOMES.find(z => x >= z[0] && x < z[1]) || this.BIOMES[0])[2];
    const layer = (factor, depth, baseYFor, poolFor, hLo, hHi, overlap, gap, aLo, aHi, tint, sfY = 0) => {
      let rx = 100;
      while (rx < WORLD_W){
        const z = zoneAt(rx), pool = poolFor(z, rx);
        if (pool && pool.length){
          const key = pool[Math.floor(Math.random() * pool.length)];
          const src = this.textures.get(key).getSourceImage();
          const sc = rnd(hLo, hHi) / src.height;                 // scale each piece to a target on-screen height
          const img = this.add.image(rx * factor, baseYFor(z), key).setOrigin(0.5, 1).setScale(sc)
            .setScrollFactor(factor, sfY).setDepth(depth).setAlpha(rnd(aLo, aHi));
          if (tint) img.setTint(tint);
          if (Math.random() < 0.5) img.setFlipX(true);
          rx += (src.width * sc * overlap) / factor;             // step in real-X (layer is compressed by `factor`)
        } else rx += gap;
      }
    };
    // Mountains live only in the meadow and the mountain/cave area — NOT the delta or woods pools. Parallax
    // then keeps the open-water delta clear, and the peaks loom in naturally as you approach through the woods.
    // FAR — small distant ranges, hazed (snowy rock at the peak)
    layer(0.28, -44, () => 292,
      (z) => ({ meadow:['bk_mtn_1'], delta:[], woods:[],
                mountain:['bk_mtn_2','bk_mtn_1'], lair:[] }[z]),
      120, 180, 0.85, 1800, 0.7, 0.86, 0xeef2f7);
    // MID-FAR — the big mountain (incl. its green foothill) in the midground; rocky peaks up top
    layer(0.46, -40, () => 306,
      (z) => ({ meadow:['bk_mtn_0'], delta:[], woods:[],
                mountain:['bk_mtn_2','bk_mtn_0'], lair:[] }[z]),
      210, 300, 0.8, 2100, 0.82, 0.95, 0xe1e8f2);
    // MID treelines — meadow deciduous; mountain pines thin to rock near the lair. (Woods handled below.)
    layer(0.55, -34, () => 322,
      (z, x) => {
        if (z === 'meadow') return ['bk_treeline_leafy'];
        if (z === 'mountain') return x < 7800 ? ['bk_treeline_pine1'] : [];   // phase trees out toward the summit
        return [];                                                            // delta + woods + lair: none here
      },
      160, 250, 0.46, 700, 0.9, 1, null);
    // WOODS forest — pulled to the FOREGROUND (scrollFactor 1, world-locked) and packed LOW so the canopy
    // fills the screen down to the ground: a solid wall of pines you can't see beneath. Sits behind the
    // hero + terrain but in front of everything else.
    layer(1.0, -8, () => GT + 46,
      (z) => z === 'woods' ? ['bk_treeline_pine0', 'bk_treeline_pine0', 'bk_treeline_pine1'] : [],
      300, 430, 0.3, 700, 0.95, 1, null, 1);
    // CAVE = hard stop: a dark slab in front of the parallax bg from the lair entrance on, so the cave
    // reads as a sealed chamber (the sky gradient underneath stays the mountain colour). Floor + the
    // lair's own stalagmites/stalactites still render in front of it.
    this.add.rectangle(8800, -400, 1000, 1700, 0x0d0a13).setOrigin(0, 0).setDepth(-33);
  }

  // Scatter individual Glitch objects across the whole world — one continuous background whose
  // species + density evolve with the biome (with soft blend zones at the borders, so it never snaps).
  scatterBg(GT, WORLD_W){
    const rnd = (a, c) => a + Math.random() * (c - a);
    const groundY = (x) => {                         // approx terrain top at X — scenery sits on the mountain base
      if (x >= 8530) return GT - 285;                //   lair lip + lair
      return GT;                                     //   everything else (incl. the mountain catch-floor base)
    };
    const poolAt = (x) => {                           // biome pool, blended near borders + remixed for mixed zones
      let b = this.BIOMES.find(z => x >= z[0] && x < z[1]) || this.BIOMES[0];
      const idx = this.BIOMES.indexOf(b), Z = 320;
      if (x - b[0] < Z && idx > 0 && Math.random() < (1 - (x - b[0]) / Z) * 0.5) b = this.BIOMES[idx - 1];
      else if (b[1] - x < Z && idx < this.BIOMES.length - 1 && Math.random() < (1 - (b[1] - x) / Z) * 0.5) b = this.BIOMES[idx + 1];
      let key = b[2];
      if (key === 'delta') key = Math.random() < 0.5 ? 'meadow' : 'woods';            // delta borrows its neighbours
      if (key === 'mountain'){                                                        // trees fade to rock toward the lair
        const treeP = Math.max(0, 0.5 * (1 - (x - 7200) / 1000));
        key = Math.random() < treeP ? 'woods' : 'mountain';
      }
      return key;
    };
    const zoneAt = (x) => (this.BIOMES.find(z => x >= z[0] && x < z[1]) || this.BIOMES[0])[2];
    let x = 40;
    while (x < WORLD_W - 40){
      const rz = zoneAt(x);                             // actual zone (poolAt remaps; rz is the real ground)
      const key = poolAt(x), n = GLX_ELEM[key];
      if (!n){ x += 160; continue; }
      const tex = `el_${key}_${Math.floor(Math.random() * n)}`;
      const src = this.textures.get(tex).getSourceImage();
      if (key === 'lair' && src.width / src.height > 1.5){   // wide stalactite bands hang from the chamber ceiling
        const s = this.add.image(x, groundY(x) - 240, tex).setOrigin(0.5, 0)
          .setScale(rnd(0.3, 0.5)).setDepth(-12).setAlpha(rnd(0.85, 1));
        if (Math.random() < 0.5) s.setFlipX(true);
        x += rnd(120, 220);
        continue;
      }
      if (rz === 'delta' && src.height > 250){          // delta is open water — keep low banks/reeds, no trees
        x += rnd(90, 180);
        continue;
      }
      const distant = Math.random() < 0.45;           // two depth bands → a sense of distance
      const scale = distant ? rnd(0.16, 0.30) : rnd(0.30, 0.56);
      const baseY = groundY(x) + rnd(-2, 24) - (distant ? rnd(8, 40) : 0);
      const s = this.add.image(x, baseY, tex).setOrigin(0.5, 1).setScale(scale)
        .setDepth(distant ? -30 : -12).setAlpha(distant ? rnd(0.5, 0.78) : rnd(0.85, 1));
      if (distant) s.setTint(0xc4cfe0);               // mild haze pushes the far band back
      if (Math.random() < 0.5) s.setFlipX(true);
      const dense = rz === 'woods';                   // pack the woods thick with trees
      x += dense ? (distant ? rnd(26, 60) : rnd(42, 95))
                 : (distant ? rnd(60, 140) : rnd(110, 240));
    }
  }

  update(){
    const b = this.player.body, SPEED = 200, JUMP = 480;
    const L = this.cursors.left.isDown, R = this.cursors.right.isDown;
    const onGround = b.blocked.down || b.touching.down;
    // wall-slide: airborne, pressing into a solid wall, sinking → cling + slow the fall
    const wallL = (b.blocked.left  || b.touching.left)  && L;
    const wallR = (b.blocked.right || b.touching.right) && R;
    const sliding = !onGround && (wallL || wallR) && b.velocity.y > 10;
    const wallDir = wallL ? 1 : -1;            // push-off direction (away from the wall)

    if(L){ b.setVelocityX(-SPEED); this.facing = -1; }
    else if(R){ b.setVelocityX(SPEED); this.facing = 1; }
    else b.setVelocityX(0);

    if(onGround) this.jumpsUsed = 0;
    if(sliding){ if(b.velocity.y > 90) b.setVelocityY(90); this.jumpsUsed = 1; }   // grip the rock; keep one air-jump

    if(Phaser.Input.Keyboard.JustDown(this.keySpace)){
      if(sliding){ b.setVelocityX(wallDir * 280); b.setVelocityY(-JUMP); this.jumpsUsed = 1; this.facing = wallDir; }   // kick off the wall
      else if(this.jumpsUsed < 2){ b.setVelocityY(-JUMP); this.jumpsUsed++; }
    }

    if(sliding){ this.player.play('ninja-wall', true); this.player.setFlipX(wallR); }   // cling, facing away from the wall
    else {
      this.player.setFlipX(this.facing < 0);
      if(!onGround) this.player.play(b.velocity.y < 0 ? 'ninja-jump' : 'ninja-fall', true);
      else if(L || R) this.player.play('ninja-run', true);
      else this.player.play('ninja-idle', true);
    }
    if(onGround && this.player.y < 600){ this.lastSafe.x = this.player.x; this.lastSafe.y = this.player.y - 6; }
    if(this.player.y > this.killY){ this.player.setPosition(this.lastSafe.x, this.lastSafe.y); b.setVelocity(0, 0); }

    // sky gradient pans slowly by scroll position — the colour you see is set by WHERE you are in the
    // world (the zone), not by the camera chasing the hero. Mountains/treelines parallax on their own.
    this.sky.tilePositionX = this.cameras.main.scrollX * 0.15;
  }
}

new Phaser.Game({
  type: Phaser.AUTO,
  width: W, height: H,
  parent: 'game',
  pixelArt: true,
  backgroundColor: '#5c94fc',
  physics: { default: 'arcade', arcade: { gravity: { y: 1150 }, debug: false } },
  scene: [BootScene, TitleScene, PlayScene, ExploreScene],
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
});
