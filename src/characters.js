import * as THREE from 'three';

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const rand = (a, b) => a + Math.random() * (b - a);
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const lerpAngle = (a, b, t) => {
  let d = ((b - a + Math.PI) % (Math.PI * 2)) - Math.PI;
  if (d < -Math.PI) d += Math.PI * 2;
  return a + d * t;
};

const GEO = {
  torso: new THREE.BoxGeometry(0.44, 0.54, 0.27),
  hips: new THREE.BoxGeometry(0.4, 0.2, 0.26),
  head: new THREE.BoxGeometry(0.25, 0.27, 0.25),
  hair: new THREE.BoxGeometry(0.27, 0.09, 0.27),
  cap: new THREE.BoxGeometry(0.27, 0.1, 0.28),
  brim: new THREE.BoxGeometry(0.26, 0.035, 0.14),
  face: new THREE.BoxGeometry(0.2, 0.07, 0.02),
  arm: new THREE.BoxGeometry(0.115, 0.46, 0.14),
  leg: new THREE.BoxGeometry(0.165, 0.7, 0.185),
  shoe: new THREE.BoxGeometry(0.18, 0.12, 0.28),
  gun: new THREE.BoxGeometry(0.055, 0.11, 0.28),
  grip: new THREE.BoxGeometry(0.05, 0.14, 0.07),
};

const matCache = new Map();
function mat(color, opts = {}) {
  const key = `${color}|${opts.roughness ?? 0.9}|${opts.metalness ?? 0}`;
  if (!matCache.has(key)) {
    matCache.set(key, new THREE.MeshStandardMaterial({
      color, roughness: opts.roughness ?? 0.9, metalness: opts.metalness ?? 0,
      transparent: !!opts.transparent, opacity: opts.opacity ?? 1,
    }));
  }
  return matCache.get(key);
}

const SKIN = [0xe3b28c, 0xc98d64, 0x97603d, 0xf0c9a6, 0x6f4930, 0xd6a07a];
const SHIRTS = [0xf2f2ee, 0xdb3b30, 0x2f5f9e, 0xe8c84a, 0x3f3f42, 0x4f8a4e, 0xdb6c9a, 0x1b1b1e, 0xb8b0a0, 0x7b4bd6];
const PANTS = [0x384861, 0x2b2b30, 0x6e6857, 0x4a4e57, 0x6b7a8f, 0x232327];

export function makeCharacterModel(opts = {}) {
  const skin = opts.skin ?? pick(SKIN);
  const shirt = opts.shirt ?? pick(SHIRTS);
  const pants = opts.pants ?? pick(PANTS);
  const group = new THREE.Group();
  const body = new THREE.Group();
  group.add(body);

  const skinMat = mat(skin);
  const shirtMat = mat(shirt);
  const pantsMat = mat(pants);
  const shoeMat = mat(opts.shoes ?? 0x1e1e20);

  const torso = new THREE.Mesh(GEO.torso, shirtMat);
  torso.position.y = 1.16;
  torso.castShadow = true;
  body.add(torso);

  const hips = new THREE.Mesh(GEO.hips, pantsMat);
  hips.position.y = 0.83;
  hips.castShadow = true;
  body.add(hips);

  const headPivot = new THREE.Group();
  headPivot.position.y = 1.52;
  body.add(headPivot);
  const head = new THREE.Mesh(GEO.head, skinMat);
  head.castShadow = true;
  headPivot.add(head);
  const face = new THREE.Mesh(GEO.face, mat(0x1b1b1b));
  face.position.set(0, 0.0, 0.132);
  headPivot.add(face);

  const hair = new THREE.Mesh(GEO.hair, mat(opts.hair ?? 0x2a211b));
  hair.position.set(0, 0.12, -0.005);
  hair.castShadow = true;
  headPivot.add(hair);

  if (opts.cap) {
    const cap = new THREE.Mesh(GEO.cap, mat(opts.capColor ?? 0x222226));
    cap.position.set(0, 0.14, 0);
    cap.castShadow = true;
    headPivot.add(cap);
    const brim = new THREE.Mesh(GEO.brim, mat(opts.capColor ?? 0x222226));
    brim.position.set(0, 0.11, 0.17);
    headPivot.add(brim);
  }

  const armL = new THREE.Group();
  armL.position.set(-0.285, 1.37, 0);
  const armLMesh = new THREE.Mesh(GEO.arm, opts.sleeveless ? skinMat : shirtMat);
  armLMesh.position.y = -0.22;
  armLMesh.castShadow = true;
  armL.add(armLMesh);
  const handL = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.12, 0.12), skinMat);
  handL.position.y = -0.47;
  armL.add(handL);
  body.add(armL);

  const armR = new THREE.Group();
  armR.position.set(0.285, 1.37, 0);
  const armRMesh = new THREE.Mesh(GEO.arm, opts.sleeveless ? skinMat : shirtMat);
  armRMesh.position.y = -0.22;
  armRMesh.castShadow = true;
  armR.add(armRMesh);
  const handR = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.12, 0.12), skinMat);
  handR.position.y = -0.47;
  armR.add(handR);
  body.add(armR);

  const legL = new THREE.Group();
  legL.position.set(-0.12, 0.8, 0);
  const legLMesh = new THREE.Mesh(GEO.leg, pantsMat);
  legLMesh.position.y = -0.35;
  legLMesh.castShadow = true;
  legL.add(legLMesh);
  const shoeL = new THREE.Mesh(GEO.shoe, shoeMat);
  shoeL.position.set(0, -0.7, 0.05);
  legL.add(shoeL);
  body.add(legL);

  const legR = new THREE.Group();
  legR.position.set(0.12, 0.8, 0);
  const legRMesh = new THREE.Mesh(GEO.leg, pantsMat);
  legRMesh.position.y = -0.35;
  legRMesh.castShadow = true;
  legR.add(legRMesh);
  const shoeR = new THREE.Mesh(GEO.shoe, shoeMat);
  shoeR.position.set(0, -0.7, 0.05);
  legR.add(shoeR);
  body.add(legR);

  // weapon in right hand
  const gun = new THREE.Group();
  const gunBody = new THREE.Mesh(GEO.gun, mat(0x1a1c1f, { metalness: 0.6, roughness: 0.35 }));
  gunBody.position.set(0, -0.02, 0.09);
  const grip = new THREE.Mesh(GEO.grip, mat(0x141518));
  grip.position.set(0, -0.09, -0.02);
  gun.add(gunBody, grip);
  gun.position.set(0, -0.5, 0.05);
  gun.visible = !!opts.armed;
  armR.add(gun);

  if (opts.vest) {
    const vest = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.4, 0.29), mat(opts.vestColor ?? 0x1c2023));
    vest.position.y = 1.18;
    body.add(vest);
  }

  if (opts.noShadow) {
    group.traverse((o) => { if (o.isMesh) o.castShadow = false; });
  }
  group.userData.isCharacter = true;
  return {
    group, body, headPivot, torso, armL, armR, legL, legR, gun,
    setArmed(v) { gun.visible = v; },
    setDeadPose(sign = 1) {
      body.rotation.z = (Math.PI / 2) * sign;
    },
  };
}

export class Character {
  constructor(scene, opts = {}) {
    this.scene = scene;
    this.model = makeCharacterModel(opts);
    this.group = this.model.group;
    this.group.position.set(opts.x ?? 0, 0.14, opts.z ?? 0);
    if (opts.heading !== undefined) this.group.rotation.y = opts.heading;
    this.heading = opts.heading ?? 0;
    this.health = opts.health ?? 100;
    this.maxHealth = this.health;
    this.alive = true;
    this.phase = Math.random() * 10;
    this.moveSpeed = 0;
    this.aiming = false;
    this.isPlayer = false;
    this.deadTime = 0;
    this.scale = opts.scale ?? 1;
    if (this.scale !== 1) this.group.scale.setScalar(this.scale);
    scene.add(this.group);
  }

  get pos() { return this.group.position; }

  setPosition(x, z) {
    this.group.position.x = x;
    this.group.position.z = z;
  }

  setHeading(h) {
    this.heading = h;
    this.group.rotation.y = h;
  }

  animate(dt, speed, aiming = false) {
    const model = this.model;
    this.phase += dt * (2.2 + speed * 1.5);
    const amt = clamp(speed / 6.5, 0, 1);
    if (!this.alive) {
      model.armL.rotation.x *= 0.9;
      model.armR.rotation.x *= 0.9;
      return;
    }
    if (speed > 0.12) {
      const s = Math.sin(this.phase);
      model.legL.rotation.x = s * 0.72 * amt;
      model.legR.rotation.x = -s * 0.72 * amt;
      model.armL.rotation.x = -s * 0.55 * amt;
      model.armR.rotation.x = s * 0.55 * amt;
      model.body.position.y = Math.abs(Math.sin(this.phase * 2)) * 0.035 * amt;
    } else {
      model.legL.rotation.x *= 0.85;
      model.legR.rotation.x *= 0.85;
      model.armL.rotation.x = Math.sin(this.phase * 0.4) * 0.03;
      model.armR.rotation.x = -Math.sin(this.phase * 0.4) * 0.03;
      model.body.position.y = Math.sin(this.phase * 0.6) * 0.008;
    }
    if (aiming) {
      model.armR.rotation.x = -1.42;
      model.armL.rotation.x = -1.2;
      model.armL.rotation.z = 0.32;
      model.armR.rotation.z = -0.08;
      model.aiming = true;
    } else {
      model.armL.rotation.z *= 0.8;
      model.armR.rotation.z *= 0.8;
    }
    this.aiming = aiming;
  }

  faceTowards(x, z, dt, speed = 12) {
    const target = Math.atan2(x - this.pos.x, z - this.pos.z);
    this.setHeading(lerpAngle(this.heading, target, clamp(dt * speed, 0, 1)));
  }

  damage(amount, game, opts = {}) {
    if (!this.alive) return false;
    this.health -= amount;
    if (this.health <= 0) {
      this.die(game, opts);
      return true;
    }
    return false;
  }

  die(game, opts = {}) {
    if (!this.alive) return;
    this.alive = false;
    this.deadTime = 0;
    this.moveSpeed = 0;
    this.model.setDeadPose(Math.random() < 0.5 ? 1 : -1);
    this.group.position.y = 0.16;
    const p = this.pos.clone();
    game.fx.blood(new THREE.Vector3(p.x, 1.1, p.z));
    game.fx.bloodPool(p);
    if (game.audio) game.audio.thud(p);
    if (opts.onDeath) opts.onDeath(this);
  }

  remove() {
    this.scene.remove(this.group);
  }
}

/* ------------------------------------------------------------------ */
/* Player                                                              */
/* ------------------------------------------------------------------ */

const WEAPONS = [
  { id: 'pistol', name: 'PISTOL', icon: 'pistol', damage: 40, rate: 0.34, mag: 12, reserve: 96, spread: 0.012, range: 70, auto: false, pellets: 1 },
  { id: 'smg', name: 'MICRO SMG', icon: 'smg', damage: 17, rate: 0.085, mag: 30, reserve: 120, spread: 0.032, range: 55, auto: true, pellets: 1 },
  { id: 'shotgun', name: 'PUMP SHOTGUN', icon: 'shotgun', damage: 13, rate: 0.85, mag: 6, reserve: 36, spread: 0.075, range: 26, auto: false, pellets: 7 },
];

export class Player extends Character {
  constructor(scene, game) {
    super(scene, {
      skin: 0xc98d64, shirt: 0xf0eee6, pants: 0x36455e, shoes: 0xe8e8e4,
      cap: true, capColor: 0x191a1d, armed: true, health: 100,
    });
    this.isPlayer = true;
    this.game = game;
    this.group.scale.setScalar(1.01);
    this.weapons = WEAPONS.map((w) => ({ ...w, ammo: w.mag, reserveAmmo: w.reserve }));
    this.weaponIndex = 0;
    this.aiming = false;
    this.sprinting = false;
    this.vehicle = null;
    this.armor = 0;
    this.vy = 0;
    this.jumping = false;
    this.stepTimer = 0;
    this.fireCooldown = 0;
    this.reloadTimer = 0;
    this.isDead = false;
    this._lastDamage = 0;
    this.model.setArmed(true);
  }

  get weapon() { return this.weapons[this.weaponIndex]; }
  get inVehicle() { return !!this.vehicle; }

  spawn(x, z, heading = 0) {
    this.group.position.set(x, 0.14, z);
    this.setHeading(heading);
    this.health = 100;
    this.armor = 0;
    this.alive = true;
    this.isDead = false;
    this.group.visible = true;
    this.model.body.rotation.z = 0;
    this.group.rotation.z = 0;
    this.vehicle = null;
    this.vy = 0;
    this.jumping = false;
    this.weaponIndex = 0;
    this.weapons.forEach((w) => { w.ammo = w.mag; w.reserveAmmo = w.reserve; });
    this.model.setArmed(true);
    if (this.game.hud) this.game.hud.setWeapon(this.weapon);
  }

  update(dt, input, game) {
    if (!this.alive) return;
    this.fireCooldown = Math.max(0, this.fireCooldown - dt);
    if (this.reloadTimer > 0) {
      this.reloadTimer -= dt;
      if (this.reloadTimer <= 0) this.finishReload(game);
    }

    if (this.vehicle) {
      this.group.position.copy(this.vehicle.group.position);
      this.group.position.y = 0.14;
      return;
    }

    this.aiming = input.aiming;
    const yaw = game.cameraYaw;
    const f = new THREE.Vector3(-Math.sin(yaw), 0, -Math.cos(yaw));
    const r = new THREE.Vector3(Math.cos(yaw), 0, -Math.sin(yaw));
    const dir = new THREE.Vector3();
    dir.addScaledVector(f, input.moveY);
    dir.addScaledVector(r, input.moveX);
    const len = dir.length();
    if (len > 1) dir.divideScalar(len);
    const moving = len > 0.08;

    this.sprinting = input.sprint && !this.aiming && moving;
    let speed = this.aiming ? 2.5 : this.sprinting ? 6.4 : 3.6;
    if (this.reloadTimer > 0) speed *= 0.75;
    this.moveSpeed = moving ? speed * Math.min(1, len) : 0;

    if (moving) {
      const target = Math.atan2(dir.x, dir.z);
      if (this.aiming) {
        this.setHeading(yaw + Math.PI);
      } else {
        this.setHeading(lerpAngle(this.heading, target, clamp(dt * 13, 0, 1)));
      }
      const vx = dir.x * this.moveSpeed;
      const vz = dir.z * this.moveSpeed;
      let nx = this.pos.x + vx * dt;
      let res = game.world.resolveCircle(nx, this.pos.z, 0.4);
      this.pos.x = res.x;
      this.pos.z = res.z;
      let nz = this.pos.z + vz * dt;
      res = game.world.resolveCircle(this.pos.x, nz, 0.4);
      this.pos.x = res.x;
      this.pos.z = res.z;

      // footsteps
      this.stepTimer -= dt * this.moveSpeed;
      if (this.stepTimer <= 0) {
        this.stepTimer = 2.4;
        if (game.audio) game.audio.footstep(this.sprinting);
      }
    }

    // jump
    if (input.jump && !this.jumping) {
      this.vy = 5.5;
      this.jumping = true;
      if (game.audio) game.audio.jump();
    }
    if (this.jumping) {
      this.vy -= 17 * dt;
      this.group.position.y += this.vy * dt;
      if (this.group.position.y <= 0.14) {
        this.group.position.y = 0.14;
        this.jumping = false;
        this.vy = 0;
      }
    }

    this.animate(dt, this.moveSpeed, this.aiming && this.reloadTimer <= 0);
    if (game.audio) game.audio.setFootstepsMoving(moving && !this.aiming, this.sprinting);

    // hit flash / health regen up to 45
    this._lastDamage += dt;
    if (this._lastDamage > 4 && this.health < 100) {
      this.health = Math.min(100, this.health + dt * 2.2);
    }
  }

  tryEnterVehicle(game, manual = true) {
    if (this.vehicle || !this.alive) return false;
    const v = game.vehicles.nearest(this.pos, 4.6);
    if (!v) {
      if (manual) game.hud.subtitle('근처에 탑승할 차량이 없습니다.', 1.6);
      return false;
    }
    if (v.dead) {
      if (manual) game.hud.subtitle('폐차된 차량에는 탑승할 수 없습니다.', 1.6);
      return false;
    }
    if (Math.abs(v.speed) > 5.5) {
      if (manual) game.hud.subtitle('차량이 너무 빠릅니다! 속도를 줄이세요.', 1.8);
      return false;
    }
    this.vehicle = v;
    this.group.visible = false;
    v.enter(this);
    game.cameraYaw = v.heading + Math.PI;
    game.cameraPitch = 0.17;
    if (v.isPolice) game.addWanted(1, '경찰차를 훔쳤습니다');
    if (game.audio) game.audio.startEngine();
    if (game.radio) game.radio.start(v);
    game.hud.subtitle(v.name + ' 탑승 · F 하차 · H 경적', 2.2);
    return true;
  }

  exitVehicle(game) {
    if (!this.vehicle) return;
    const v = this.vehicle;
    if (Math.abs(v.speed) > 7.5) {
      game.hud.subtitle('차량이 너무 빠릅니다!', 1.4);
      return;
    }
    const side = new THREE.Vector3(Math.cos(v.heading), 0, -Math.sin(v.heading));
    let x = v.pos.x - side.x * 1.7;
    let z = v.pos.z - side.z * 1.7;
    const r = game.world.resolveCircle(x, z, 0.45);
    x = r.x;
    z = r.z;
    this.group.position.set(x, 0.14, z);
    this.group.visible = true;
    this.setHeading(v.heading);
    v.exit();
    this.vehicle = null;
    if (game.audio) game.audio.stopEngine();
    if (game.radio) game.radio.stop();
    game.cameraYaw = this.heading + Math.PI;
  }

  switchWeapon(i, game) {
    if (i < 0 || i >= this.weapons.length || i === this.weaponIndex) return;
    this.weaponIndex = i;
    this.reloadTimer = 0;
    if (game.hud) game.hud.setWeapon(this.weapon);
    if (game.audio) game.audio.click();
    game.hud.subtitle(`${this.weapon.name} 장착`, 1.2);
  }

  reload(game) {
    const w = this.weapon;
    if (this.reloadTimer > 0 || w.ammo >= w.mag || w.reserveAmmo <= 0) return;
    this.reloadTimer = w.id === 'shotgun' ? 1.5 : w.id === 'smg' ? 1.2 : 1.0;
    if (game.audio) game.audio.reload();
  }

  finishReload(game) {
    const w = this.weapon;
    const need = w.mag - w.ammo;
    const take = Math.min(need, w.reserveAmmo);
    w.ammo += take;
    w.reserveAmmo -= take;
    if (game.hud) game.hud.setWeapon(w);
  }

  damage(amount, game, opts = {}) {
    if (!this.alive || this.isDead) return;
    this._lastDamage = 0;
    let dmg = amount;
    if (this.armor > 0) {
      const absorbed = Math.min(this.armor, dmg * 0.7);
      this.armor -= absorbed;
      dmg -= absorbed;
    }
    this.health -= dmg;
    game.hud.damageFlash();
    if (game.audio) game.audio.playerHit();
    if (this.health <= 0) {
      this.health = 0;
      this.die(game);
      game.onPlayerDeath();
    }
  }

  die(game) {
    if (this.isDead) return;
    this.isDead = true;
    this.alive = false;
    this.vehicle = null;
    this.group.visible = true;
    this.group.position.y = 0.16;
    this.model.setDeadPose(1);
  }
}

/* ------------------------------------------------------------------ */
/* Pedestrians                                                         */
/* ------------------------------------------------------------------ */

export class Pedestrian extends Character {
  constructor(scene, world, opts = {}) {
    super(scene, {
      x: 0, z: 0, health: 70,
      shirt: pick(SHIRTS), pants: pick(PANTS), skin: pick(SKIN),
      cap: Math.random() < 0.18, armed: false,
      scale: rand(0.92, 1.06), noShadow: true,
      hair: pick([0x2a211b, 0x151515, 0x6b4a2f, 0xa5793f, 0x8d8d8d]),
    });
    this.world = world;
    this.block = opts.block ?? pick(world.blocks);
    this.t = rand(0, 1000);
    this.speed = rand(1.0, 1.5);
    this.baseSpeed = this.speed;
    this.dir = Math.random() < 0.5 ? 1 : -1;
    this.fleeTimer = 0;
    this.idleTimer = rand(2, 8);
    this.corpseTimer = 0;
    this.rumor = false;
    const loop = world.sidewalkLoop(this.block, this.t);
    this.group.position.set(loop.x, 0.14, loop.z);
    this.setHeading(Math.atan2(loop.dx * this.dir, loop.dz * this.dir));
  }

  startle(source, game, strength = 1) {
    if (!this.alive) return;
    this.fleeTimer = Math.max(this.fleeTimer, 3 + strength * 2);
    const dx = this.pos.x - source.x;
    const dz = this.pos.z - source.z;
    const loop = this.world.sidewalkLoop(this.block, this.t);
    const dot = loop.dx * dx + loop.dz * dz;
    this.dir = dot >= 0 ? 1 : -1;
    if (game.audio && Math.random() < 0.25) game.audio.pedScream(this.pos);
  }

  update(dt, game) {
    if (!this.alive) {
      this.corpseTimer += dt;
      if (this.corpseTimer > 30) {
        this.scene.remove(this.group);
        this.removed = true;
      }
      return;
    }
    this.fleeTimer = Math.max(0, this.fleeTimer - dt);
    const fleeing = this.fleeTimer > 0;
    let speed = fleeing ? 4.4 : this.speed;

    if (!fleeing) {
      this.idleTimer -= dt;
      if (this.idleTimer < 0) {
        this.idleTimer = rand(3, 9);
        this.idle = !this.idle;
      }
      if (this.idle) speed = 0;
    }

    // react to cars speeding nearby
    if (!fleeing && game.player.vehicle) {
      const d = this.pos.distanceTo(game.player.vehicle.pos);
      if (d < 11 && Math.abs(game.player.vehicle.speed) > 9) this.startle(game.player.vehicle.pos, game, 0.4);
    }

    this.moveSpeed = speed;
    if (speed > 0) {
      const loop = this.world.sidewalkLoop(this.block, this.t);
      this.t += this.dir * speed * dt;
      const next = this.world.sidewalkLoop(this.block, this.t);
      this.group.position.x = next.x;
      this.group.position.z = next.z;
      this.setHeading(Math.atan2(next.dx * this.dir, next.dz * this.dir));
    }
    this.animate(dt, this.moveSpeed, false);
    // bob position
    this.group.position.y = 0.14 + (this.alive ? Math.abs(Math.sin(this.phase * 2)) * 0.02 * clamp(this.moveSpeed / 5, 0, 1) : 0);
  }
}

/* ------------------------------------------------------------------ */
/* Enemies                                                             */
/* ------------------------------------------------------------------ */

export class Enemy extends Character {
  constructor(scene, opts = {}) {
    super(scene, {
      x: opts.x, z: opts.z, heading: opts.heading, health: opts.health ?? 100,
      shirt: opts.shirt ?? 0x3a1c1c, pants: opts.pants ?? 0x232326, skin: pick(SKIN),
      armed: true, cap: !!opts.cap, capColor: opts.capColor, vest: !!opts.vest,
      vestColor: opts.vestColor, scale: opts.scale ?? 1, noShadow: true,
    });
    this.kind = opts.kind ?? 'enemy';
    this.shootTimer = rand(0.5, 1.6);
    this.accuracy = opts.accuracy ?? 0.42;
    this.damageAmount = opts.damage ?? 8;
    this.range = opts.range ?? 36;
    this.reactionTimer = 0;
    this.strafeDir = Math.random() < 0.5 ? 1 : -1;
    this.strafeTimer = rand(1, 3);
    this.stopped = false;
    this.muzzle = null;
  }

  updateCombat(dt, game, desiredDist = 13) {
    if (!this.alive) return;
    const player = game.player;
    const target = player.vehicle ? player.vehicle.pos : player.pos;
    const dx = target.x - this.pos.x;
    const dz = target.z - this.pos.z;
    const dist = Math.hypot(dx, dz);
    const los = !game.world.lineBlocked(this.pos.x, this.pos.z, target.x, target.z);

    if (dist > desiredDist + 2 || !los) {
      const speed = this.kind === 'cop' ? 4.6 : 4.1;
      const nx = this.pos.x + (dx / dist) * speed * dt;
      const nz = this.pos.z + (dz / dist) * speed * dt;
      const r = game.world.resolveCircle(nx, this.pos.z, 0.42);
      this.pos.x = r.x;
      this.pos.z = r.z;
      const r2 = game.world.resolveCircle(this.pos.x, nz, 0.42);
      this.pos.x = r2.x;
      this.pos.z = r2.z;
      this.moveSpeed = speed;
      this.faceTowards(target.x, target.z, dt, 10);
    } else {
      // strafe and keep distance
      this.strafeTimer -= dt;
      if (this.strafeTimer < 0) {
        this.strafeTimer = rand(1, 3);
        this.strafeDir *= -1;
      }
      const strafeSpeed = dist < desiredDist - 3 ? -2.2 : 1.4;
      const px = -dz / dist;
      const pz = dx / dist;
      const nx = this.pos.x + px * this.strafeDir * strafeSpeed * dt;
      const nz = this.pos.z + pz * this.strafeDir * strafeSpeed * dt;
      const r = game.world.resolveCircle(nx, nz, 0.42);
      this.pos.x = r.x;
      this.pos.z = r.z;
      this.moveSpeed = strafeSpeed;
      this.faceTowards(target.x, target.z, dt, 14);
    }

    this.animate(dt, this.moveSpeed, true);

    this.shootTimer -= dt;
    if (los && dist < this.range && this.shootTimer <= 0) {
      this.shootTimer = this.kind === 'cop' ? rand(1.0, 1.8) : rand(1.2, 2.3);
      const acc = clamp(this.accuracy - dist / 160, 0.12, 0.8);
      game.combat.enemyShoot(this, target, acc, this.damageAmount);
    }
  }

  die(game, opts = {}) {
    super.die(game, opts);
    if (this.kind === 'cop') game.addWanted(2, '경찰관 사망');
    else if (this.kind === 'gangster') game.notify('적 제거', '조직원이 쓰러졌습니다.', 'police');
    this.muzzle?.remove();
  }
}

export class Cop extends Enemy {
  constructor(scene, opts = {}) {
    super(scene, {
      ...opts, kind: 'cop', health: 100, accuracy: 0.5, damage: 9, range: 40,
      shirt: 0x233a5c, pants: 0x1c2028, cap: true, capColor: 0x1b3048,
      vest: true, vestColor: 0x20262e,
    });
  }
}

export class Gangster extends Enemy {
  constructor(scene, opts = {}) {
    super(scene, {
      ...opts, kind: 'gangster', health: 110, accuracy: 0.38, damage: 7, range: 32,
      shirt: opts.shirt ?? 0x5d1e1e, pants: 0x25252a, cap: Math.random() < 0.5,
      capColor: 0x1a1a1a,
    });
  }
}
