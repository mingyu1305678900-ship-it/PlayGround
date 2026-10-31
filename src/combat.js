import * as THREE from 'three';

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const tmp = new THREE.Vector3();
const tmp2 = new THREE.Vector3();

function raySphere(origin, dir, center, radius, maxDist) {
  const ox = center.x - origin.x;
  const oy = center.y - origin.y;
  const oz = center.z - origin.z;
  const tca = ox * dir.x + oy * dir.y + oz * dir.z;
  if (tca < 0) return null;
  const d2 = ox * ox + oy * oy + oz * oz - tca * tca;
  const r2 = radius * radius;
  if (d2 > r2) return null;
  const thc = Math.sqrt(r2 - d2);
  const t = tca - thc;
  if (t < 0 || t > maxDist) return null;
  return t;
}

function rayBox(origin, dir, min, max, maxDist) {
  let tmin = 0;
  let tmax = maxDist;
  for (const axis of ['x', 'y', 'z']) {
    const o = origin[axis];
    const d = dir[axis];
    if (Math.abs(d) < 1e-8) {
      if (o < min[axis] || o > max[axis]) return null;
    } else {
      let t1 = (min[axis] - o) / d;
      let t2 = (max[axis] - o) / d;
      if (t1 > t2) { const tt = t1; t1 = t2; t2 = tt; }
      tmin = Math.max(tmin, t1);
      tmax = Math.min(tmax, t2);
      if (tmin > tmax) return null;
    }
  }
  if (tmax < 0) return null;
  return tmin >= 0 ? tmin : tmax;
}

export class Combat {
  constructor(game) {
    this.game = game;
    this.lastHit = 0;
    this.shots = 0;
  }

  getAimDir(origin, dir) {
    const game = this.game;
    const targets = [...game.enemies, ...game.peds.filter((p) => p.alive && p.fleeTimer > 0)];
    let best = null;
    let bestScore = 0.34;
    for (const c of targets) {
      if (!c.alive) continue;
      const dx = c.pos.x - origin.x;
      const dz = c.pos.z - origin.z;
      const dy = 1.1 - origin.y;
      const len = Math.hypot(dx, dy, dz);
      if (len > 60) continue;
      const dot = (dx * dir.x + dy * dir.y + dz * dir.z) / len;
      const angle = Math.acos(clamp(dot, -1, 1));
      if (angle < bestScore) {
        bestScore = angle;
        best = c;
      }
    }
    if (!best) return dir.clone();
    const target = new THREE.Vector3(best.pos.x, 1.05, best.pos.z);
    const desired = target.sub(origin).normalize();
    const assist = game.input.touch ? 0.85 : game.input.aiming ? 0.75 : 0.55;
    return dir.clone().lerp(desired, assist).normalize();
  }

  trace(origin, dir, maxDist, ignore = null) {
    const game = this.game;
    let nearest = maxDist;
    let hit = null;

    // characters
    for (const c of [...game.peds, ...game.enemies]) {
      if (!c.alive || c === ignore) continue;
      const center = new THREE.Vector3(c.pos.x, c.pos.y + 1.02, c.pos.z);
      const t = raySphere(origin, dir, center, 0.48, nearest);
      if (t !== null && t < nearest) {
        nearest = t;
        hit = { type: 'character', object: c, distance: t, head: false };
      }
      // head sphere
      const headC = new THREE.Vector3(c.pos.x, c.pos.y + 1.62, c.pos.z);
      const th = raySphere(origin, dir, headC, 0.2, nearest);
      if (th !== null && th < nearest) {
        nearest = th;
        hit = { type: 'character', object: c, distance: th, head: true };
      }
    }

    // vehicles
    for (const v of game.vehicles.vehicles) {
      if (v.dead) continue;
      const rel = new THREE.Vector3().subVectors(origin, v.pos);
      const cos = Math.cos(v.heading);
      const sin = Math.sin(v.heading);
      const ox = rel.x * cos - rel.z * sin;
      const oz = rel.x * sin + rel.z * cos;
      const oy = rel.y;
      const dx = dir.x * cos - dir.z * sin;
      const dz = dir.x * sin + dir.z * cos;
      const dy = dir.y;
      const localOrigin = { x: ox, y: oy, z: oz };
      const localDir = { x: dx, y: dy, z: dz };
      const t = rayBox(
        localOrigin, localDir,
        { x: -v.stats.width / 2, y: 0.2, z: -v.stats.len / 2 },
        { x: v.stats.width / 2, y: v.stats.height + 0.2, z: v.stats.len / 2 },
        nearest
      );
      if (t !== null && t < nearest) {
        nearest = t;
        hit = { type: 'vehicle', object: v, distance: t };
      }
    }

    // buildings
    for (const c of game.world.colliders) {
      const t = rayBox(
        origin, dir,
        { x: c.minX, y: 0, z: c.minZ },
        { x: c.maxX, y: c.height, z: c.maxZ },
        nearest
      );
      if (t !== null && t < nearest) {
        nearest = t;
        hit = { type: 'world', distance: t };
      }
    }

    // ground
    if (dir.y < -0.0001) {
      const t = -origin.y / dir.y;
      if (t > 0 && t < nearest) {
        nearest = t;
        hit = { type: 'world', distance: t };
      }
    }

    if (!hit) return { hit: null, point: origin.clone().addScaledVector(dir, maxDist), distance: maxDist };
    const point = origin.clone().addScaledVector(dir, nearest);
    return { hit, point, distance: nearest };
  }

  tryFire(game) {
    const player = game.player;
    if (!player.alive || player.inVehicle) return;
    if (player.reloadTimer > 0) return;
    const w = player.weapon;
    if (player.fireCooldown > 0) return;
    if (w.ammo <= 0) {
      player.reload(game);
      return;
    }
    player.fireCooldown = w.rate;
    w.ammo--;
    game.hud.setWeapon(w);

    const cam = game.camera;
    const origin = cam.position.clone();
    const dir = cam.getWorldDirection(new THREE.Vector3());
    const aimDir = this.getAimDir(origin, dir);
    aimDir.normalize();

    const right = new THREE.Vector3().crossVectors(aimDir, cam.up).normalize();
    const up = new THREE.Vector3().crossVectors(right, aimDir).normalize();
    const spread = w.spread * (player.aiming ? 0.55 : 1) * (player.sprinting ? 1.8 : 1);
    if (player.moveSpeed > 4) spread *= 1.2;

    const muzzle = player.pos.clone();
    muzzle.y += 1.25;
    const fwd = new THREE.Vector3(Math.sin(player.heading), 0, Math.cos(player.heading));
    muzzle.addScaledVector(fwd, 0.45);
    muzzle.x += right.x * 0.22;
    muzzle.z += right.z * 0.22;

    let anyHit = false;
    let killed = false;

    for (let p = 0; p < w.pellets; p++) {
      const d = aimDir.clone();
      d.addScaledVector(right, (Math.random() - 0.5) * spread * 2);
      d.addScaledVector(up, (Math.random() - 0.5) * spread * 2);
      d.normalize();
      const result = this.trace(origin, d, w.range, player);
      const hit = result.hit;
      const end = result.point;
      if (hit) {
        if (hit.type === 'character') {
          const c = hit.object;
          const dmg = w.damage * (hit.head ? 2.2 : 1) * (p === 0 ? 1 : 0.9);
          const dead = c.damage(dmg, game, { bullet: true });
          anyHit = true;
          if (dead) killed = true;
          game.fx.blood(end);
          if (c.kind === 'gangster' || c.kind === 'cop') {
            if (dead) game.hud.showHit(true);
          }
          if (dead) {
            if (c.kind !== 'cop' && c.kind !== 'gangster') game.addWanted(1, '민간인 사살');
          } else if (c.kind !== 'cop' && c.kind !== 'gangster' && Math.random() < 0.4) {
            game.addWanted(1, '총격 사건');
          }
        } else if (hit.type === 'vehicle') {
          hit.object.damage(w.damage * 0.7, game, 'bullet');
          game.fx.sparks(end, null);
          anyHit = true;
          if (hit.object.isPolice) game.addWanted(1, '경찰차 공격');
        } else {
          game.fx.sparks(end, null);
        }
      }
      game.fx.tracer(muzzle, end, 0xffe3a0, 0.06);
    }

    if (anyHit) {
      game.hud.showHit(killed);
      this.lastHit = performance.now();
    }
    game.fx.burst(muzzle, { count: 3, color: 0xffd27f, speed: 2.2, life: 0.12, size: 0.3, gravity: 0, spread: 1 });
    game.fx.shake = Math.max(game.fx.shake, w.id === 'shotgun' ? 0.18 : w.id === 'smg' ? 0.05 : 0.09);
    game.audio.gunshot(w.id);
    game.onGunshot(player.pos);
    player.model.armR.rotation.x = -1.55;
    player.animate(0.016, 0, true);
  }

  enemyShoot(shooter, target, accuracy, damage) {
    const game = this.game;
    const player = game.player;
    if (!player.alive) return;
    const vehicle = player.vehicle;
    const targetPos = vehicle ? vehicle.pos.clone().add(new THREE.Vector3(0, 0.9, 0)) : player.pos.clone().add(new THREE.Vector3(0, 1.1, 0));
    const origin = shooter.pos.clone();
    origin.y += 1.25;
    const dir = targetPos.clone().sub(origin).normalize();

    const hitChance = clamp(accuracy, 0.05, 0.9);
    const willHit = Math.random() < hitChance;
    if (!willHit) {
      dir.x += (Math.random() - 0.5) * 0.16;
      dir.y += (Math.random() - 0.5) * 0.1;
      dir.z += (Math.random() - 0.5) * 0.16;
      dir.normalize();
    } else {
      dir.x += (Math.random() - 0.5) * 0.02;
      dir.y += (Math.random() - 0.5) * 0.02;
      dir.normalize();
    }
    const distance = 60;
    const result = this.trace(origin, dir, distance, shooter);
    const end = result.point;
    game.fx.tracer(origin, end, 0xffb36b, 0.09);
    game.fx.burst(origin, { count: 2, color: 0xffcf7a, speed: 1.2, life: 0.09, size: 0.22, gravity: 0, spread: 1 });
    game.audio.enemyShot(shooter.pos);

    if (willHit) {
      if (vehicle) {
        vehicle.damage(damage * 0.8, game, 'bullet');
        if (Math.random() < 0.25) player.damage(damage * 0.4, game, { bullet: true });
        game.fx.sparks(end, null);
      } else {
        player.damage(damage, game, { bullet: true });
        game.fx.blood(end);
        game.fx.shake = Math.max(game.fx.shake, 0.12);
      }
    } else {
      if (result.hit?.type === 'world') game.fx.sparks(end, null);
    }
  }
}
