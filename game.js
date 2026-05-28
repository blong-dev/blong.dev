// Port Foliopolis — greybox vertical slice
// Bright-NES placeholder palette; shapes stand in for sprites.
const W = 800, H = 480;

// ---- On-screen Gameboy controls: one shared pad state, bound to the DOM buttons once. ----
// Keyboard still drives the game directly; these flags are OR'd in alongside it.
// left/right are HELD (true while pressed); jump/attack/talk are EDGE (consumed once via padHit).
const PAD = { left:false, right:false, jump:false, attack:false, talk:false };
const HELD = { left:true, right:true };
const padHit = k => { if(PAD[k]){ PAD[k] = false; return true; } return false; };
function padClear(){ PAD.left = PAD.right = PAD.jump = PAD.attack = PAD.talk = false; }
window.__padClear = padClear;   // chat.js clears the pad when a conversation opens
function bindPad(){
  // Face buttons (J/A/S) — discrete edge taps.
  document.querySelectorAll('[data-pad]').forEach(btn => {
    const k = btn.dataset.pad;
    if(HELD[k]) return;                       // left/right are handled as one slide region below
    const down = e => { if(e.cancelable) e.preventDefault(); btn.classList.add('pressed'); PAD[k] = true; };
    const up   = e => { if(e && e.cancelable) e.preventDefault(); btn.classList.remove('pressed'); };
    btn.addEventListener('pointerdown', down);
    btn.addEventListener('pointerup', up);
    btn.addEventListener('pointercancel', up);
    btn.addEventListener('contextmenu', e => e.preventDefault());   // no long-press menu on mobile
  });
  // D-pad — one slide region: direction comes from finger POSITION, so dragging
  // across it switches left<->right without lifting (implicit pointer capture would
  // otherwise pin every move to whichever button you first touched).
  const pad = document.querySelector('.gb-dpad');
  if(pad){
    const dl = pad.querySelector('.d-left'), dr = pad.querySelector('.d-right');
    let active = false;
    const apply = e => {
      const r = pad.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dz = r.width * 0.16;               // dead zone over the center (up/down) column
      const L = dx <= -dz, R = dx >= dz;
      PAD.left = L; PAD.right = R;
      dl.classList.toggle('pressed', L); dr.classList.toggle('pressed', R);
    };
    const end = e => { active = false; PAD.left = PAD.right = false;
      dl.classList.remove('pressed'); dr.classList.remove('pressed');
      try { if(e) pad.releasePointerCapture(e.pointerId); } catch(_){} };
    pad.addEventListener('pointerdown', e => { if(e.cancelable) e.preventDefault();
      active = true; try { pad.setPointerCapture(e.pointerId); } catch(_){} apply(e); });
    pad.addEventListener('pointermove', e => { if(active) apply(e); });
    pad.addEventListener('pointerup', end);
    pad.addEventListener('pointercancel', end);
    pad.addEventListener('contextmenu', e => e.preventDefault());
  }
}
if(document.readyState !== 'loading') bindPad(); else document.addEventListener('DOMContentLoaded', bindPad);

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
    ['pa_woods_top','pa_woods_fill','pa_mtn','pa_gold','pa_wood','pa_logL','pa_logR'].forEach(k => this.load.image(k, PA + k + '.png'));
    this.load.image('pa_grass', PA + 'grass.png');
    this.load.image('pa_dirt',  PA + 'dirt.png');
    this.load.image('ladder',   PA + 'ladder.png');
    this.load.image('bg_grad',  'assets/glitch/delta_far.png');   // sky gradient (unused now)
    this.load.image('bg_blue',  'assets/pixel-adventure/Background/Blue.png');   // tiling Pixel-Adventure blue backdrop
    this.load.image('lair_far', 'assets/glitch/lair_far.png');    // dark cave backdrop for the lair
    this.load.image('sea',      'assets/magic-cliffs/sea.png');   // delta water
    ['meadow_07','meadow_08','meadow_09','meadow_10','woods_00','woods_01','woods_02','woods_03']  // the 8 in elements/woods/
      .forEach((f, i) => this.load.image('tree' + i, 'assets/glitch/elements/woods/' + f + '.png'));
    ['meadow_02','meadow_08','meadow_12','meadow_15','meadow_17','meadow_19']  // elements/meadow/
      .forEach((f, i) => this.load.image('md' + i, 'assets/glitch/elements/meadow/' + f + '.png'));
    ['lair_02','lair_03','lair_04','lair_05','lair_06','lair_08']                   // lair floor: stalagmites + boulders
      .forEach((f, i) => this.load.image('lf' + i, 'assets/glitch/elements/lair/' + f + '.png'));
    ['lair_00','lair_01','lair_07']                                                 // lair ceiling: hanging stalactites
      .forEach((f, i) => this.load.image('lc' + i, 'assets/glitch/elements/lair/' + f + '.png'));
    ['ninja','pink','mask','virtual'].forEach(c => {
      ['idle','run','jump','fall','djump','wall'].forEach(a => {
        this.load.spritesheet(`${c}_${a}`, PA + `${c}_${a}.png`, { frameWidth:96, frameHeight:96 });
      });
    });
    // enemies (each baked 3x; frame dims differ per creature)
    const ES = { slime:[132,90], ghost:[88,60], rino:[156,102], plant:[132,126], pig:[108,90], skull:[156,162],
                 bat:[92,60], bird:[96,96], turtle:[88,52], trunk:[192,96], snail:[76,48] };
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
    ['slime','ghost','rino','plant','pig','skull','bat','bird','turtle','trunk','snail'].forEach(k =>
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
      spr.on('pointerdown', ()=> this.scene.start('explore', {name:h.name, char:h.char}));
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
    this.carriedShield = this.add.image(this.player.x, this.player.y, 'shield').setScale(0.9).setDepth(1);
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
      this.carriedShield.y = this.player.y + 22;
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
  init(data){ this.heroChar = (data && data.char) || 'ninja'; this.heroName = (data && data.name) || ''; }
  create(){
    const GT = 410, WORLD_W = 9600;
    this.killY = 880;                                       // just below the secret home base (820) → snappier respawns
    this.physics.world.setBounds(0, -1200, WORLD_W, 2400);
    this.cameras.main.setBounds(0, -1200, WORLD_W, 2400);  // tall headroom — the lair is an open chamber for Emma to fly + swoop
    this.cameras.main.setBackgroundColor(PAL.sky);

    // Background — the tiling Pixel-Adventure blue backdrop, STATIC (pinned to the screen, doesn't move with the world).
    this.add.tileSprite(0, 0, W, H, 'bg_blue').setOrigin(0).setScrollFactor(0).setDepth(-100);
    // LAIR — its own dark cave backdrop, world-anchored. Starts exactly at the gold floor (x8800), so the
    // whole climb stays bright sky and the cave only takes over once you reach the golden ground up top.
    // Tall (fills the open chamber above the floor where Emma flies).
    this.add.image(8800, -1250, 'lair_far').setOrigin(0).setDisplaySize(880, 1350).setDepth(-90);

    // player — spawns ABOVE the screen and free-falls into the meadow, like dropping out of the menu
    this.player = this.physics.add.sprite(80, GT - 540, this.heroChar + '_idle');
    this.player.body.setSize(48, 72).setOffset(25, 24);   // footprint matches the FEET (x21-77), not the wide arms → no edge air-walk
    this.player.body.setMaxVelocity(220, 950);
    this.player.play(this.heroChar + '-fall');           // already plummeting as the world fades in
    this.cameras.main.setDeadzone(140, 240);   // roam-box, not glued to center
    this.cameras.main.setFollowOffset(0, 120);  // start low → lots of sky above (spacious); update() eases it for drops
    this.cameras.main.setScroll(0, 0);          // HOLD on the meadow (ground low, full sky) so the hero drops in from the top
    this.followStarted = false;                 // camera only begins tracking once he lands (see update)
    this.lastSafe = { x: 80, y: GT - 80 };
    this.facing = 1; this.jumpsUsed = 0; this.camOffY = 120;

    this.solids = [];   // every terrain collider — the hero collides per-rect (below); NPCs/coins/shield collide with the lot
    const floor = (x1, x2, topY, topTile, fillTile, fillH = 240) => {
      const w = x2 - x1;
      this.add.tileSprite(x1, topY + 48, w, fillH, fillTile || topTile).setOrigin(0).setDepth(-7);  // body below (tall = solid cliff)
      this.add.tileSprite(x1, topY, w, 48, topTile).setOrigin(0).setDepth(-5);                       // one full surface tile on top
      const r = this.add.rectangle(x1 + w / 2, topY + 26, w, 52).setVisible(false);
      this.physics.add.existing(r, true); r.body.setSize(w, 52);
      this.physics.add.collider(this.player, r); this.solids.push(r);
      return r;
    };
    const plat = (x1, x2, topY, tile = 'pa_wood') => {   // jump-through platform (wood, or rock for the mountain)
      const w = x2 - x1;
      this.add.tileSprite(x1, topY, w, 24, tile).setOrigin(0).setDepth(-4);
      const r = this.add.rectangle(x1 + w / 2, topY + 12, w, 24).setVisible(false);
      this.physics.add.existing(r, true); r.body.setSize(w, 24);
      r.body.checkCollision.down = r.body.checkCollision.left = r.body.checkCollision.right = false;
      this.physics.add.collider(this.player, r); this.solids.push(r);
      return r;
    };
    const log = (x1, x2, topY) => {            // jump-through wood log with carved swirl end-caps
      const w = x2 - x1, cap = 48;
      this.add.tileSprite(x1 + cap, topY, Math.max(0, w - 2 * cap), 24, 'pa_wood').setOrigin(0).setDepth(-4);  // planks
      this.add.tileSprite(x1, topY, cap, 24, 'pa_logL').setOrigin(0).setDepth(-4);                              // left swirl
      this.add.tileSprite(x2 - cap, topY, cap, 24, 'pa_logR').setOrigin(0).setDepth(-4);                        // right swirl
      const r = this.add.rectangle(x1 + w / 2, topY + 12, w, 24).setVisible(false);
      this.physics.add.existing(r, true); r.body.setSize(w, 24);
      r.body.checkCollision.down = r.body.checkCollision.left = r.body.checkCollision.right = false;
      this.physics.add.collider(this.player, r); this.solids.push(r);
      return r;
    };
    const wall = (x, topY, h) => {              // solid vertical rock face — ninja wall-slide / wall-jump surface
      this.add.tileSprite(x - 22, topY, 44, h, 'pa_mtn').setOrigin(0).setDepth(-6);
      const r = this.add.rectangle(x, topY + h / 2, 40, h).setVisible(false);
      this.physics.add.existing(r, true); r.body.setSize(40, h);
      this.physics.add.collider(this.player, r); this.solids.push(r);
      return r;
    };

    floor(0, 2400, GT, 'pa_grass', 'pa_dirt');                        // MEADOW + TOWN
    log(1980, 2200, GT - 120);                                        //   Roq's town platform (wooden log)
    // DELTA — magic-cliffs sea + wood logs you hop across
    this.add.rectangle(2400, GT + 6, 2400, 480, 0x3f78d8).setOrigin(0).setDepth(-8);   // BLUE water base (the sea tile itself is opaque teal, so we paint the colour ourselves)
    this.sea = this.add.tileSprite(2400, GT + 6, 2400, 480, 'sea').setOrigin(0).setDepth(-6).setTileScale(3, 3)
      .setAlpha(0.4).setTint(0x9ec8ff);                                                  // sea texture kept only as faint pale-blue wave shimmer on top
    [[2500,2680,GT],[2780,2920,GT-50],[3020,3180,GT],[3270,3410,GT-80],[3500,3680,GT],
     [3800,3960,GT-40],[4080,4260,GT],[4360,4500,GT-70],[4620,4810,GT]]   // logs hop up + down, varied spacing
      .forEach(([a, b, y]) => log(a, b, y));
    floor(4800, 6080, GT, 'pa_woods_top', 'pa_woods_fill');           // WOODS — orange/brown (pit gap 6080–6280, narrow enough to wall-jump out of)
    floor(6280, 7200, GT, 'pa_woods_top', 'pa_woods_fill');
    log(6960, 7160, GT - 250);                                        // woods→mountain transition perch — too high to reach
                                                                       //   from the ground; only by jumping off the last floating log (@6620-6820)
    // MOUNTAIN — a ninja wall-climb. No steps: two facing rock walls form a chimney you scale by
    // wall-jumping between them. The right wall gates the way up, so the climb is mandatory; the base
    // catches misses. Top out onto the summit plateau and into the lair.
    const MF = 1500;                                                 // fill height (solid cliff body — tall climb)
    floor(7200, 7840, GT, 'pa_mtn', 'pa_mtn', MF);                  // base — arrive from the woods (catches every miss)
    // STAGE 1 — CHIMNEY: wall-jump up between two rock walls, base (410) → plateau A (-100)
    wall(7640, GT - 510, 420);                                      //   left wall  (open below → walk in under it)
    wall(7840, GT - 510, 510);                                      //   right wall (FULL → blocks the cliff edge + gives the first cling)
    floor(7820, 8300, GT - 510, 'pa_mtn', 'pa_mtn', MF);            // plateau A — top out here (checkpoint)
    // STAGE 2 — PLATFORM JUMP: hop ledge to ledge up to the lair, plateau A (-100) → summit (-500). No walls.
    plat(8370, 8470, GT - 643, 'pa_mtn');                          //   ↗
    plat(8560, 8660, GT - 777, 'pa_mtn');                          //   ↗
    plat(8730, 8800, GT - 910, 'pa_mtn');                          //   ↗ lair lip
    floor(8800, 9600, GT - 910, 'pa_gold', 'pa_gold', MF);         // LAIR — gold plate, at the summit
    // SECRET BASE — beneath the woods pit (6080–6280). Hidden until you've CROSSED the pit twice THIS run (no save);
    // then it's there to drop into: a floor, a climbable chimney to wall-jump back out, and a hidden 1-UP. Returning
    // to Roq to collect the bounty takes you back over the pit, so the second crossing tends to happen on its own.
    this.pitCrosses = 0; this.secretOpen = false; this.pitSide = null;
    this.openSecretBase = () => {
      if(this.secretOpen) return;
      this.secretOpen = true;
      floor(6040, 6320, 820, 'pa_mtn', 'pa_mtn');                  // the room floor
      wall(6080, GT, 410); wall(6280, GT, 410);                    // the PIT'S OWN walls are the climb — wall-jump between them, top out onto the woods floors
      const oneUp = this.add.text(6180, 778, '♥', { fontFamily:'monospace', fontSize:'42px', color:'#5aff5a' }).setOrigin(0.5).setStroke('#143d14', 7).setDepth(6);
      this.physics.add.existing(oneUp); oneUp.body.setAllowGravity(false);
      this.tweens.add({ targets:oneUp, y:oneUp.y - 10, duration:700, yoyo:true, repeat:-1, ease:'Sine.inOut' });
      this.add.text(6180, 718, '★ 1-UP ★', { fontFamily:'monospace', fontSize:'13px', color:'#fcd800' }).setOrigin(0.5).setStroke('#202020', 4);
      this.physics.add.overlap(this.player, oneUp, () => { if(!oneUp.active) return; oneUp.destroy(); this.hp++; this.updateHpHud();
        const t = this.add.text(this.player.x, this.player.y - 60, '1-UP!', { fontFamily:'monospace', fontSize:'18px', color:'#5aff5a', fontStyle:'bold' }).setOrigin(0.5).setStroke('#143d14', 5).setDepth(40);
        this.tweens.add({ targets:t, y:t.y - 42, alpha:0, duration:1500, onComplete:()=> t.destroy() }); });
    };
    // floating platforms — a little verticality + challenge through the run (wooden logs)
    [[760, 940, GT - 110], [1180, 1340, GT - 175], [1520, 1660, GT - 120],
     [5080, 5260, GT - 130], [5480, 5660, GT - 205], [6620, 6820, GT - 140]]
      .forEach(([a, b, y]) => log(a, b, y));

    // WOODS — a thick forest scattered behind the play area from the 8 elements/woods/ trees (leafy +
    // pines). Two depth bands; nothing placed over the pit (5950–6300) so no trees float over the gap.
    const R = new Phaser.Math.RandomDataGenerator(['port-foliopolis']);   // SEEDED → identical scatter every load
    const rnd = (a, c) => R.realInRange(a, c);
    const pick = (n) => R.integerInRange(0, n - 1);
    const chance = (p) => R.frac() < p;
    for (let i = 0; i < 75; i++){
      let x = rnd(4810, 6840); if (x > 5950) x += 350;             // skip the pit
      const key = 'tree' + pick(8);
      const far = chance(0.5);
      const t = this.add.image(x, GT + rnd(-4, 18), key).setOrigin(0.5, 1)
        .setScale(far ? rnd(0.22, 0.38) : rnd(0.40, 0.55))
        .setDepth(far ? -25 : -12).setAlpha(far ? rnd(0.5, 0.7) : rnd(0.9, 1));
      if (far) t.setTint(0xb9c4d6);
      if (chance(0.5)) t.setFlipX(true);
    }

    // MOUNTAIN BASE — forest the foot with the four pines (woods_00–03 = tree4–7), same scatter
    for (let i = 0; i < 30; i++){
      const key = 'tree' + (4 + pick(4));
      const far = chance(0.5);
      const t = this.add.image(rnd(7220, 7800), GT + rnd(-4, 18), key).setOrigin(0.5, 1)
        .setScale(far ? rnd(0.22, 0.38) : rnd(0.40, 0.55))
        .setDepth(far ? -25 : -12).setAlpha(far ? rnd(0.5, 0.7) : rnd(0.9, 1));
      if (far) t.setTint(0xb9c4d6);
      if (chance(0.5)) t.setFlipX(true);
    }

    // MEADOW — ground cover (grass, ferns, flowers) + the odd tree/mound, from elements/meadow/ (sparse)
    for (let i = 0; i < 22; i++){
      const key = 'md' + pick(6);
      const far = chance(0.4);
      const t = this.add.image(rnd(40, 2360), GT + rnd(-2, 16), key).setOrigin(0.5, 1)
        .setScale(far ? rnd(0.30, 0.45) : rnd(0.45, 0.65))
        .setDepth(far ? -25 : -12).setAlpha(far ? rnd(0.6, 0.8) : rnd(0.92, 1));
      if (far) t.setTint(0xcfe0f0);
      if (chance(0.5)) t.setFlipX(true);
    }
    // LAIR — stalagmites + boulders rising off the gold floor, and stalactites hanging from the chamber roof
    for (let i = 0; i < 12; i++){
      const t = this.add.image(rnd(8830, 9570), GT - 910 + rnd(-2, 10), 'lf' + pick(6))
        .setOrigin(0.5, 1).setScale(rnd(0.30, 0.55)).setDepth(-20);
      if (chance(0.5)) t.setFlipX(true);
    }
    for (let i = 0; i < 7; i++){
      const t = this.add.image(rnd(8830, 9570), rnd(-905, -855), 'lc' + pick(3))
        .setOrigin(0.5, 0).setScale(rnd(0.5, 0.8)).setDepth(-25);
      if (chance(0.5)) t.setFlipX(true);
    }

    this.cursors = this.input.keyboard.createCursorKeys();
    this.input.keyboard.addCapture('UP,DOWN,LEFT,RIGHT,SPACE');   // keep game keys from scrolling the embedding page
    this.keySpace = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.keyA = this.input.keyboard.addKey('A');   // attack
    this.keyJ = this.input.keyboard.addKey('J');   // jump (matches the on-screen J button)
    this.keyS = this.input.keyboard.addKey('S');   // speak / take Emma's shield
    if(window.PortChat) window.PortChat.reset();   // clean-slate NPC chats each playthrough (death = fresh start)

    // --- combat state ---
    this.hp = 2; this.invuln = 0; this.bossDead = { roq: false, emma: false }; this.bountyPaid = false;   // a slain boss → fed to the OTHER boss's chat agent
    this.hasShield = false; this.tookShield = false; this.carriedShield = null; this.shieldDropping = false;
    this.boltToggle = false;
    this.swingHits = new Set(); this.attacking = false; this.attackElapsed = 0; this.FRAME_MS = 55;
    this.SWING = [ { dx:10, dy:-10, ang:-10 }, { dx:15, dy:-6, ang:50 }, { dx:19, dy:-2, ang:105 }, { dx:21, dy:6, ang:150 } ];
    this.sword = this.add.image(0, 0, 'sword').setOrigin(0.5, 0.85).setDepth(5).setVisible(false);

    // --- the bosses: Roq in the town, Emma flying in the lair chamber ---
    this.enemies = this.physics.add.group();
    const roq = this.enemies.create(2090, GT - 170, 'pig_idle');                 // Roq — business hog
    roq.body.setSize(99, 81).setOffset(6, 9); roq.play('pig-idle');
    roq.setData({ kind:'pig', gold:5, hp:5, patrol:0, dir:1, homeX:2090, floater:false, dying:false, boss:true, aggro:false });
    this.physics.add.collider(roq, this.solids);
    const emma = this.enemies.create(9200, -690, 'skull_idle');                  // Emma — demilich, hovers in the chamber
    emma.body.setAllowGravity(false); emma.play('skull-idle');
    emma.setData({ kind:'skull', gold:5, hp:5, patrol:0, dir:1, homeX:9200, homeY:-690, floater:true, dying:false, boss:true, aggro:false });
    this.add.text(9200, -880, 'EMMA', { fontFamily:'monospace', fontSize:'16px', color:'#e0c060' }).setOrigin(0.5).setStroke('#202020', 4);
    this.add.text(2090, GT - 250, 'ROQ', { fontFamily:'monospace', fontSize:'13px', color:'#ffffff' }).setOrigin(0.5).setStroke('#202020', 4);
    this.physics.add.overlap(this.player, this.enemies, (p, e) => this.playerHit(e));   // contact damage (passive bosses do none)

    // --- the bestiary, placed across the biomes (easy → charger → shooters → climb hazards), 2-ish per zone ---
    const ebody = (e, w, h, ox, oy) => { e.body.setSize(w, h).setOffset(ox, oy); return e; };
    const groundFoe = (kind, x, extra) => {                       // gravity on — lands on the terrain
      const e = this.enemies.create(x, GT - 170, kind + '_idle'); e.play(kind + '-idle');
      this.physics.add.collider(e, this.solids);
      e.setData(Object.assign({ kind, gold:1, hp:1, maxHp:1, patrol:0, dir:1, homeX:x, spawnY: GT - 170, floater:false, dying:false, boss:false, aggro:false }, extra || {}));
      return e;
    };
    const flyFoe = (kind, x, y, extra) => {                       // no gravity — hovers / patrols / clings
      const e = this.enemies.create(x, y, kind + '_idle'); e.body.setAllowGravity(false); e.play(kind + '-idle');
      e.setData(Object.assign({ kind, gold:1, hp:1, maxHp:1, patrol:0, dir:1, homeX:x, homeY:y, spawnY:y, floater:true, dying:false, boss:false, aggro:false }, extra || {}));
      return e;
    };
    ebody(groundFoe('rino',   1300), 144, 84, 6, 18);             // MEADOW — Thornboar charges
    ebody(groundFoe('turtle', 760),  80, 44, 4, 6);               //   spiky Turtles (small), slow patrol — three across the meadow
    ebody(groundFoe('turtle', 1500), 80, 44, 4, 6);
    ebody(groundFoe('turtle', 2300), 80, 44, 4, 6);
    ebody(groundFoe('plant', 3120), 84, 105, 33, 21);            // DELTA — Faun cannons on the logs
    ebody(groundFoe('plant', 4180), 84, 105, 33, 21);
    ebody(flyFoe('bird', 3520, GT - 150), 60, 46, 18, 26);        //   BlueBirds patrol overhead
    ebody(flyFoe('bird', 4300, GT - 210), 60, 46, 18, 26);
    ebody(groundFoe('trunk', 5180), 138, 80, 27, 14);            // WOODS — Trunk cannons
    ebody(groundFoe('trunk', 6720), 138, 80, 27, 14);
    ebody(flyFoe('ghost', 5600, GT - 150), 60, 40, 14, 12);       //   Wisps — Boo: freeze them by facing them
    ebody(flyFoe('ghost', 5000, -70),  60, 40, 14, 12);           //   two more drift down from off the top of the screen
    ebody(flyFoe('ghost', 6900, -40),  60, 40, 14, 12);
    ebody(flyFoe('ghost', 7480, GT - 320), 60, 40, 14, 12);       //   one haunts the mountain climb
    ebody(flyFoe('snail', 7682, GT - 270, { vdir: 1,  baseAngle: 90 }),  44, 30, 16, 9);   // MOUNTAIN — Snail on the LEFT wall (belly-left)
    ebody(flyFoe('snail', 7800, GT - 270, { vdir: -1, baseAngle: -90 }), 44, 30, 16, 9);   //   Snail on the RIGHT wall (belly-right)
    ebody(flyFoe('bat', 7440, GT - 300), 72, 34, 10, 13);         //   Bats dart along the climb (small + fast) — three up the mountain
    ebody(flyFoe('bat', 8080, GT - 620), 72, 34, 10, 13);
    ebody(flyFoe('bat', 8600, GT - 880), 72, 34, 10, 13);

    // --- Phil — assistant duck: trails you (warps up if he falls behind in the rough terrain); click/face+S to talk ---
    this.phil = this.physics.add.sprite(80, GT - 120, 'duck_idle');
    this.phil.body.setSize(48, 44).setOffset(3, 10);
    this.phil.body.setMaxVelocity(280, 950); this.duckJumps = 0;
    this.phil.play('phil-idle');
    this.physics.add.collider(this.phil, this.solids);   // a real grounded duck — walks/lands on the terrain like the hero
    this.phil.setInteractive({ useHandCursor:true });
    this.phil.on('pointerdown', () => this.openChat('phil'));

    // --- projectiles: Emma's particles + Roq's rocks ---
    this.bolts = this.physics.add.group();
    this.physics.add.overlap(this.player, this.bolts, (p, bo) => { const bx = bo.x; bo.destroy(); this.damagePlayer(bx); });
    // projectiles do NOT collide with terrain — they only deal damage on contact, then sail through and off-screen,
    // self-destructing on their timer. (Also kills the class of bug where a projectile could delete a terrain collider.)

    this.coins = 0;   // gold is earned only by killing — drops from slain bosses, no coins lying around

    // --- HUD ---
    this.coinText = this.add.text(16, 12, 'GOLD: 0',
      { fontFamily:'monospace', fontSize:'20px', color:'#fcd800', fontStyle:'bold' }).setScrollFactor(0).setStroke('#202020', 5).setDepth(50);
    this.add.text(W/2, 12, this.heroName,
      { fontFamily:'monospace', fontSize:'14px', color:'#ffffff' }).setOrigin(0.5,0).setScrollFactor(0).setStroke('#202020', 4).setDepth(50);
    this.hpText = this.add.text(W-16, 12, '',
      { fontFamily:'monospace', fontSize:'18px', color:'#ff5a5a', fontStyle:'bold' }).setOrigin(1,0).setScrollFactor(0).setStroke('#202020', 5).setDepth(50);
    this.updateHpHud();
  }

  doAttack(){
    if(this.attacking) return;
    this.attacking = true; this.attackElapsed = 0; this.swingHits = new Set();
  }
  hitEnemy(e){
    if(e.getData('dying') || this.swingHits.has(e)) return;
    this.swingHits.add(e);
    if(e.getData('boss') && !e.getData('aggro')){                 // bosses stay passive until you swing
      e.setData('aggro', true); e.setData('aggroAt', this.time.now);
      e.setData('nextFire', this.time.now + 1200); e.setData('nextDive', this.time.now + 3000);
    }
    if(e.getData('kind') === 'skull' && this.tookShield) e.setData('escalated', true);   // betray the demilich who armed you
    const hp = e.getData('hp') - 1; e.setData('hp', hp);
    if(hp > 0){ e.setTintFill(0xffffff); this.time.delayedCall(100, () => { if(e.active) e.clearTint(); }); return; }
    e.setData('dying', true); e.body.enable = false;
    const dk = e.getData('kind'); if(dk === 'pig') this.bossDead.roq = true; else if(dk === 'skull') this.bossDead.emma = true;   // mark a fallen boss
    const gold = e.getData('gold'), ex = e.x, ey = e.y; e.setTintFill(0xffffff);
    // disableBody (hide + deactivate) instead of destroy() — destroying a sprite that's in a collider vs the shared
    // this.solids array can leave a dangling collider; disabling keeps it clean and the foe is gone all the same.
    this.tweens.add({ targets:e, alpha:0, scaleX:1.25, scaleY:1.25, duration:170, onComplete:() => { if(e.body) e.disableBody(true, true); this.dropGold(ex, ey, gold); } });
    if(!e.getData('boss')) this.time.delayedCall(60000, () => this.reviveEnemy(e));   // commons respawn at their post ~a minute after death (bosses stay dead)
  }
  reviveEnemy(e){
    if(!e || !e.body) return;
    e.enableBody(true, e.getData('homeX'), e.getData('spawnY'), true, true);   // back at its spawn, full health
    e.setData('hp', e.getData('maxHp') || 1); e.setData('dying', false); e.setData('aggro', false);
    e.clearTint(); e.setAlpha(1); e.setScale(1);
    e.play(e.getData('kind') + '-idle', true);
  }
  dropGold(x, y, n){
    for(let i = 0; i < n; i++){
      const c = this.physics.add.image(x + Phaser.Math.Between(-28, 28), y - 10, 'coin');
      this.physics.add.collider(c, this.solids);
      c.setVelocity(Phaser.Math.Between(-70, 70), Phaser.Math.Between(-260, -150)).setBounce(0.35);
      this.physics.add.overlap(this.player, c, () => { if(c.active){ c.destroy(); this.coins++; this.coinText.setText('GOLD: ' + this.coins); } });
    }
  }
  playerHit(e){
    if(e.getData('dying')) return;
    if(e.getData('boss') && !e.getData('aggro')) return;          // a passive boss does no contact damage
    this.damagePlayer(e.x);
  }
  damagePlayer(fromX){
    if(this.time.now < this.invuln) return;
    this.invuln = this.time.now + 1200;
    const dir = this.player.x <= fromX ? -1 : 1;
    this.player.body.setVelocity(dir * 240, -250);
    if(this.hasShield){                                           // shield eats the hit, then shatters
      this.hasShield = false;
      if(this.carriedShield){ const s = this.carriedShield; this.carriedShield = null; this.tweens.add({ targets:s, scaleX:1.5, scaleY:1.5, angle:120, alpha:0, duration:280, onComplete:()=> s.destroy() }); }
      this.player.setTint(0x8fd0ff); this.time.delayedCall(1200, () => this.player.clearTint());
      this.updateHpHud(); return;
    }
    this.hp--;
    this.player.setTint(0xff6a6a); this.time.delayedCall(1200, () => this.player.clearTint());
    this.updateHpHud();
    if(this.hp <= 0) this.die();
  }
  fireBolt(emma){
    this.boltToggle = !this.boltToggle;
    const bo = this.bolts.create(emma.x, emma.y + 20, this.boltToggle ? 'p_orange' : 'p_red');
    bo.body.setAllowGravity(false);
    const sx = (this.player.x < emma.x) ? -1 : 1;
    bo.body.setVelocity(sx * 190, 190);
    this.time.delayedCall(3500, () => { if(bo.active) bo.destroy(); });
  }
  payBounty(){                                                    // Roq pays the 25-gold deal — it rains from the sky (once)
    if(this.bountyPaid) return;
    this.bountyPaid = true;
    this.coins += 25; this.coinText.setText('GOLD: ' + this.coins);
    const top = this.cameras.main.scrollY;
    for(let i = 0; i < 25; i++){                                  // a celebratory shower of coins falling around the hero
      const c = this.add.image(this.player.x + Phaser.Math.Between(-170, 170), top - Phaser.Math.Between(20, 380), 'coin').setDepth(35);
      this.tweens.add({ targets:c, y: this.player.y + Phaser.Math.Between(-6, 34), delay: Phaser.Math.Between(0, 650), duration: Phaser.Math.Between(650, 1300), ease:'Quad.in',
        onComplete: () => this.tweens.add({ targets:c, alpha:0, duration:220, onComplete:()=> c.destroy() }) });
    }
    const t = this.add.text(this.player.x, this.player.y - 70, '+25 GOLD',
      { fontFamily:'monospace', fontSize:'18px', color:'#fcd800', fontStyle:'bold' }).setOrigin(0.5).setStroke('#202020', 5).setDepth(40);
    this.tweens.add({ targets:t, y:t.y - 46, alpha:0, duration:1600, onComplete:()=> t.destroy() });
  }
  grantEmmaShield(){                                              // called by the chat once Emma is won over
    if(this.tookShield || this.shieldDropping) return;
    this.shieldDropping = true;
    const emma = this.enemies.getChildren().find(e => e.active && e.getData('kind') === 'skull');
    const x = emma ? emma.x : this.player.x, y = emma ? emma.y : 220;
    const drop = this.physics.add.image(x, y, 'shield').setDepth(4);
    drop.setBounce(0.5).setVelocity(Phaser.Math.Between(-30, 30), -140);
    this.physics.add.collider(drop, this.solids);
    this.tweens.add({ targets:drop, angle:360, duration:1100, repeat:-1 });
    const t = this.add.text(x, y - 70, "Emma's shield — take it!", { fontFamily:'monospace', fontSize:'14px', color:'#8fd0ff', fontStyle:'bold' }).setOrigin(0.5).setStroke('#202020', 4).setDepth(30);
    this.tweens.add({ targets:t, y:t.y - 26, alpha:0, duration:2400, onComplete:()=> t.destroy() });
    this.physics.add.overlap(this.player, drop, () => { if(drop.active){ drop.destroy(); this.giveShield(); } });
  }
  giveShield(){
    this.tookShield = true; this.hasShield = true; this.shieldDropping = false;
    this.updateHpHud();
    if(this.carriedShield) this.carriedShield.destroy();
    this.carriedShield = this.add.image(this.player.x, this.player.y, 'shield').setScale(0.9).setDepth(1);
  }
  die(){
    this.player.disableBody(true, false);
    this.cameras.main.fade(550, 0, 0, 0);
    this.time.delayedCall(580, () => this.scene.start('title'));
  }
  updateHpHud(){
    if(this.hpText) this.hpText.setText('HP ' + '♥'.repeat(Math.max(0, this.hp)) + (this.hasShield ? ' (S)' : ''));
  }
  updatePhil(){
    const p = this.phil, b = p.body;
    if(Phaser.Math.Distance.Between(p.x, p.y, this.player.x, this.player.y) > 1100){     // last-ditch rejoin if stranded miles off
      p.setPosition(this.player.x - this.facing * 50, this.player.y - 60); b.setVelocity(0, 0); this.duckJumps = 0; p.play('phil-idle', true); return;
    }
    const onGround = b.blocked.down || b.touching.down;
    if(onGround) this.duckJumps = 0;                                     // reset the air-jump budget on touchdown
    const gap = this.player.x - p.x, dist = Math.abs(gap), dx = gap;
    let chasing = p.getData('chasing');
    if(dist > 140) chasing = true; else if(dist < 70) chasing = false;   // hysteresis — hold when close so he doesn't fidget around behind you
    p.setData('chasing', chasing);
    p.setFlipX((chasing ? (Math.sign(gap) || 1) : Math.sign(this.player.x - p.x)) > 0);
    const leap = (vy) => { b.setVelocityY(-vy); b.setVelocityX(Phaser.Math.Clamp(dx * 1.6, -255, 255)); this.duckJumps++; };  // hop/flap toward the hero
    if(!chasing){
      if(onGround) b.setVelocityX(0);
    } else if(onGround){
      const dir = Math.sign(gap) || 1;
      b.setVelocityX(dir * (dist > 320 ? 270 : 200));                    // catch up when far behind, match the hero's pace when near
      const blocked = (b.blocked.left && dir < 0) || (b.blocked.right && dir > 0);
      const aheadX = p.x + dir * 44, footY = p.y + 28;
      const groundAhead = this.solids.some(r => { const bb = r.body; return bb && aheadX >= bb.left && aheadX <= bb.right && footY >= bb.top - 24 && footY <= bb.top + 36; });
      const playerBelow = this.player.y > p.y + 90;
      if(blocked || this.player.y < p.y - 50 || (!groundAhead && !playerBelow))
        leap(470 + Phaser.Math.Clamp(Math.abs(dx) * 0.4, 0, 300));       // launch — arc scales with the gap, aimed at the hero
    } else {
      b.setVelocityX(Phaser.Math.Clamp(dx * 2.2, -255, 255));            // steer the arc toward the hero in mid-air
      if(this.duckJumps < 3 && b.velocity.y > 40 && this.player.y < p.y + 40) leap(430);  // triple-jump to clear a gap / climb to you
    }
    // HARD RULE — the duck NEVER drops off the bottom of the screen, even when YOU do. Catch him just inside the
    // view, bounce him back up toward you, refresh his hops. He stays up there looking smug while you plummet.
    const floorY = this.cameras.main.scrollY + this.cameras.main.height - 46;
    if(p.y > floorY){ p.setY(floorY); b.setVelocityY(this.player.y < p.y - 20 ? -470 : 0); this.duckJumps = 0; }
    p.play('phil-idle', true);
  }
  openChat(npc){
    const src = npc === 'phil' ? this.phil : this.enemies.getChildren().find(e => e.getData('kind') === (npc === 'roq' ? 'pig' : 'skull'));
    if(!src || !src.active || !window.PortChat) return;
    window.PortChat.open(npc, this);
  }
  showGreet(e, text){
    const t = this.add.text(e.x, e.y - 72, text, { fontFamily:'monospace', fontSize:'13px', color:'#202020', backgroundColor:'#ffffff', padding:{ x:7, y:5 }, wordWrap:{ width:250 }, align:'center' }).setOrigin(0.5, 1).setDepth(30);
    this.tweens.add({ targets:t, y:t.y - 16, alpha:0, delay:2600, duration:1300, onComplete:()=> t.destroy() });
  }

  update(time, delta){
    this.sea.tilePositionX += 0.15;            // gentle current on the delta water
    const b = this.player.body, SPEED = 200, JUMP = 480;
    const L = this.cursors.left.isDown || PAD.left, R = this.cursors.right.isDown || PAD.right;
    const jump = Phaser.Input.Keyboard.JustDown(this.keySpace) || Phaser.Input.Keyboard.JustDown(this.keyJ) || padHit('jump');
    b.setAllowGravity(true);

    const onGround = b.blocked.down || b.touching.down;
    if(!this.followStarted && onGround){          // dropped in from the top and landed → camera begins tracking
      this.cameras.main.startFollow(this.player, true, 0.12, 0.12, 0, 120);   // pass the offset — startFollow() without it resets offset to 0 and snap-recentres (that was the landing lurch)
      this.followStarted = true; this.camOffY = 120;
    }
    // ninja wall-climb: airborne, pressing into a solid wall, sinking → cling + slow the fall, then kick off
    const wallL = (b.blocked.left  || b.touching.left)  && L;
    const wallR = (b.blocked.right || b.touching.right) && R;
    const sliding = !onGround && (wallL || wallR) && b.velocity.y > 10;
    const wallDir = wallL ? 1 : -1;            // push-off direction (away from the wall)

    if(L){ b.setVelocityX(-SPEED); this.facing = -1; }
    else if(R){ b.setVelocityX(SPEED); this.facing = 1; }
    else b.setVelocityX(0);

    if(onGround) this.jumpsUsed = 0;
    if(sliding){ if(b.velocity.y > 90) b.setVelocityY(90); this.jumpsUsed = 1; }   // grip the rock; keep one air-jump

    if(jump){
      if(sliding){ b.setVelocityX(wallDir * 280); b.setVelocityY(-JUMP); this.jumpsUsed = 1; this.facing = wallDir; }   // kick off the wall
      else if(this.jumpsUsed < 2){ b.setVelocityY(-JUMP); this.jumpsUsed++; if(this.jumpsUsed === 2) this.player.play(this.heroChar + '-djump'); }
    }
    if(Phaser.Input.Keyboard.JustDown(this.keyA) || padHit('attack')) this.doAttack();
    if(Phaser.Input.Keyboard.JustDown(this.keyS) || padHit('talk')){    // talk to the nearest NPC you're facing
      let best = null, bd = 240;
      const check = (k, n) => {
        if(!n || !n.active) return;
        const d = Phaser.Math.Distance.Between(this.player.x, this.player.y, n.x, n.y);
        const facing = Math.sign(n.x - this.player.x) === this.facing || d < 70;
        if(d < bd && facing){ bd = d; best = k; }
      };
      check('phil', this.phil);
      this.enemies.getChildren().forEach(e => { if(e.getData('kind') === 'pig') check('roq', e); if(e.getData('kind') === 'skull') check('emma', e); });
      if(best) this.openChat(best);
    }

    const hc = this.heroChar, cur = this.player.anims.currentAnim && this.player.anims.currentAnim.key;
    if(sliding){ this.player.play(hc + '-wall', true); this.player.setFlipX(wallR); }   // cling, facing away from the wall
    else {
      this.player.setFlipX(this.facing < 0);
      if(cur === hc + '-djump' && this.player.anims.isPlaying){ /* let the double-jump anim finish */ }
      else if(!onGround) this.player.play(b.velocity.y < 0 ? hc + '-jump' : hc + '-fall', true);
      else if(L || R) this.player.play(hc + '-run', true);
      else this.player.play(hc + '-idle', true);
    }
    if(onGround && this.player.y < 600){ this.lastSafe.x = this.player.x; this.lastSafe.y = this.player.y - 48; }   // respawn a tile higher → drop in cleanly
    if(this.player.body.enable && this.player.y > this.killY){   // a FALL is a death — costs a life; the shield can't save you from it, but you don't lose the shield either
      this.hp--; this.updateHpHud();
      if(this.hp <= 0) this.die();
      else { this.player.setPosition(this.lastSafe.x, this.lastSafe.y); b.setVelocity(0, 0);
             this.player.setTint(0xff6a6a); this.time.delayedCall(700, () => this.player.clearTint()); }
    }
    // SECRET BASE — count successful pit CROSSINGS (over the gap, at woods level); reveal the room on the second
    if(!this.secretOpen && this.player.y < 450){
      const side = this.player.x < 6080 ? 'L' : (this.player.x > 6280 ? 'R' : null);
      if(side && this.pitSide && side !== this.pitSide && ++this.pitCrosses >= 2) this.openSecretBase();
      if(side) this.pitSide = side;
    }

    // --- NPCs + combat ---
    this.updatePhil();
    if(this.carriedShield){                   // shield rides on the hero's arm until spent
      this.carriedShield.x = this.player.x + this.facing * 15;
      this.carriedShield.y = this.player.y + 22;
      this.carriedShield.setFlipX(this.facing < 0);
    }
    this.enemies.getChildren().forEach(e => {
      if(!e.active || e.getData('dying')) return;
      const kind = e.getData('kind');
      if(e.getData('boss') && !e.getData('greeted') && Phaser.Math.Distance.Between(this.player.x, this.player.y, e.x, e.y) < 320){
        e.setData('greeted', true);
        this.openChat(kind === 'pig' ? 'roq' : 'emma');   // first approach to a boss → the conversation opens itself, so it's impossible to miss
      }
      if(kind === 'pig'){                       // Roq — passive until provoked, then lobs rocks in a fixed arc
        if(e.getData('aggro') && time > (e.getData('nextFire') || 0)){
          const bo = this.bolts.create(e.x, e.y - 30, 'p_rock');
          const sx = (this.player.x < e.x) ? -1 : 1;
          bo.body.setVelocity(sx * 200, -300);
          this.time.delayedCall(4000, () => { if(bo.active) bo.destroy(); });
          e.setData('nextFire', time + 950);
        }
      } else if(kind === 'skull'){              // Emma — hovers; on provoke she recoils, then loops + dives + bolts (never faster than the hero)
        const esc = e.getData('escalated'), SP = esc ? 200 : 150, hy = e.getData('homeY');
        if(!e.getData('aggro')){
          e.body.setVelocity(0, ((hy + Math.sin(time / 600) * 45) - e.y) * 2);
        } else if(time < (e.getData('aggroAt') || 0) + 1100){       // first-hit recoil — pull away + rise
          const away = (e.x < this.player.x) ? -1 : 1;
          e.body.setVelocity(away * SP, -SP * 0.7);
        } else if(time < (e.getData('diveUntil') || 0)){           // mid-dive: swoop at the player
          const a = Math.atan2(this.player.y - e.y, this.player.x - e.x);
          e.body.setVelocity(Math.cos(a) * SP, Math.sin(a) * SP);
        } else {                                                   // flight: drift + bob, fire, schedule next dive
          let dir = e.getData('dir');
          if(e.x > e.getData('homeX') + 260) dir = -1; else if(e.x < e.getData('homeX') - 260) dir = 1;
          e.setData('dir', dir);
          e.body.setVelocityX(dir * (esc ? 110 : 60));
          e.body.setVelocityY(((hy + Math.sin(time / (esc ? 240 : 600)) * (esc ? 80 : 45)) - e.y) * 2.5);
          if(time > (e.getData('nextFire') || 0)){ this.fireBolt(e); e.setData('nextFire', time + (esc ? 650 : 950)); }
          if(time > (e.getData('nextDive') || 0)){ e.setData('diveUntil', time + 480); e.setData('nextDive', time + (esc ? 2300 : 3800)); }
        }
      } else if(kind === 'plant'){              // Faun — lobs an arced bullet (read the arc, weave)
        if(time > (e.getData('nextFire') || 0) && Math.abs(this.player.x - e.x) < 620){
          const bo = this.bolts.create(e.x, e.y - 36, 'p_bullet');
          bo.body.setVelocity(Phaser.Math.Clamp(this.player.x - e.x, -260, 260), -340);
          this.time.delayedCall(4000, () => { if(bo.active) bo.destroy(); });
          e.setData('nextFire', time + 1700);
        }
      } else if(kind === 'trunk'){              // Trunk — cannon: a straight horizontal shot when you're roughly level
        if(time > (e.getData('nextFire') || 0) && Math.abs(this.player.x - e.x) < 660 && Math.abs(this.player.y - e.y) < 130){
          const sx = (this.player.x < e.x) ? -1 : 1; e.setFlipX(sx > 0);
          const bo = this.bolts.create(e.x + sx * 34, e.y - 8, 'p_bullet'); bo.body.setAllowGravity(false);
          bo.body.setVelocity(sx * 250, 0);
          this.time.delayedCall(4000, () => { if(bo.active) bo.destroy(); });
          e.setData('nextFire', time + 1800);
        }
      } else if(kind === 'ghost'){              // Wisp — Boo: dormant until you're near, then freezes when faced / sneaks when not
        if(Phaser.Math.Distance.Between(this.player.x, this.player.y, e.x, e.y) > 540){ e.body.setVelocity(0, 0); }
        else {
          e.setFlipX(this.player.x > e.x);
          if(Math.sign(e.x - this.player.x) === this.facing){ e.body.setVelocity(0, 0); }
          else {
            const a = Math.atan2((this.player.y - 30) - e.y, this.player.x - e.x), wob = Math.sin(time / 150) * 130;
            e.body.setVelocity(Math.cos(a) * 64 + Math.cos(a + Math.PI/2) * wob, Math.sin(a) * 64 + Math.sin(a + Math.PI/2) * wob);
          }
        }
      } else if(kind === 'rino'){               // Thornboar — creeps, then explodes into a charge after 1s closing in
        const dx = this.player.x - e.x;
        if(Math.abs(dx) < 460){
          const dir = Math.sign(dx) || 1;
          if(e.getData('chargeDir') !== dir){ e.setData('chargeDir', dir); e.setData('chargeStart', time); }
          e.body.setVelocityX(dir * (time - e.getData('chargeStart') > 1000 ? 300 : 110)); e.setFlipX(dir > 0);
        } else { e.setData('chargeDir', 0); e.body.setVelocityX(0); }
      } else if(kind === 'turtle'){             // spiky Turtle — slow shell patrol (always dangerous to touch)
        let dir = e.getData('dir');
        if(e.x > e.getData('homeX') + 80) dir = -1; else if(e.x < e.getData('homeX') - 80) dir = 1;
        e.setData('dir', dir); e.body.setVelocityX(dir * 40); e.setFlipX(dir > 0);
      } else if(kind === 'snail'){              // Snail — clings to its wall (constant base angle → never flips over), head leads its crawl
        let vdir = e.getData('vdir');
        if(e.y > e.getData('homeY') + 150) vdir = -1; else if(e.y < e.getData('homeY') - 150) vdir = 1;
        e.setData('vdir', vdir); e.body.setVelocity(0, vdir * 48);
        const base = e.getData('baseAngle'); e.setAngle(base); e.setFlipX((base > 0) === (vdir > 0));
      } else if(kind === 'bat'){                // Bat — HUNTS: tracks and dives at you continuously, weaving like a swoop, no retreat
        if(Phaser.Math.Distance.Between(this.player.x, this.player.y, e.x, e.y) < 620){
          const a = Math.atan2(this.player.y - e.y, this.player.x - e.x);
          const wob = Math.sin(time / 150 + e.getData('homeX')) * 120;   // weave perpendicular to the dive → a swooping pursuit
          e.body.setVelocity(Math.cos(a) * 195 + Math.cos(a + Math.PI / 2) * wob, Math.sin(a) * 195 + Math.sin(a + Math.PI / 2) * wob);
        } else { e.body.setVelocity((e.getData('homeX') - e.x) * 2, (e.getData('homeY') - e.y) * 2); }   // drift back only after you leave the mountain
        e.setFlipX(this.player.x > e.x);
      } else if(kind === 'bird'){               // BlueBird — cruises back and forth over the delta (a timing obstacle)
        let dir = e.getData('dir');
        if(e.x > e.getData('homeX') + 320) dir = -1; else if(e.x < e.getData('homeX') - 320) dir = 1;
        e.setData('dir', dir);
        e.body.setVelocityX(dir * 120);
        e.body.setVelocityY((e.getData('homeY') + Math.sin(time / 350) * 16 - e.y) * 3);
        e.setFlipX(dir > 0);
      }
    });
    // sword swing — recomputed from the hero's CURRENT position each frame, so it stays attached
    if(this.attacking){
      this.attackElapsed += delta;
      const total = this.SWING.length * this.FRAME_MS;
      const f = this.SWING[Math.min(this.SWING.length - 1, Math.floor(this.attackElapsed / this.FRAME_MS))];
      this.sword.setVisible(true);
      this.sword.x = this.player.x + this.facing * f.dx;
      this.sword.y = this.player.y + f.dy;
      this.sword.setAngle(this.facing * f.ang);
      const hb = new Phaser.Geom.Rectangle(this.player.x + this.facing * 46 - 39, this.player.y - 60, 78, 96);
      this.enemies.getChildren().forEach(e => { if(e.active && !e.getData('dying') && Phaser.Geom.Rectangle.Overlaps(hb, e.getBounds())) this.hitEnemy(e); });
      this.bolts.getChildren().forEach(bo => {
        if(bo.active && Phaser.Geom.Rectangle.Overlaps(hb, bo.getBounds())){
          const px = bo.x, py = bo.y, tex = (bo.texture && bo.texture.key) || 'p_bullet';
          bo.destroy();
          const poof = this.add.image(px, py, tex).setDepth(6);
          this.tweens.add({ targets:poof, scaleX:1.9, scaleY:1.9, alpha:0, duration:170, onComplete:() => poof.destroy() });
        }
      });
      if(this.attackElapsed >= total){ this.attacking = false; this.sword.setVisible(false); }
    }

    // camera Y: sit the hero low for a spacious sky; ease the view DOWN (hero higher) only when plummeting,
    // so dropping into the pit isn't blind. Skipped during the opening drop (camera is held on the meadow) so
    // the offset stays put and follow switches on cleanly — no lurch when he lands.
    if(this.followStarted){
      const targetOff = (!onGround && b.velocity.y > 280) ? -70 : 120;
      this.camOffY += (targetOff - this.camOffY) * 0.06;
      this.cameras.main.setFollowOffset(0, this.camOffY);
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
  scene: [BootScene, TitleScene, PlayScene, ExploreScene],
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
});
