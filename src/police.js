import * as THREE from 'three';
import { Cop } from './characters.js';
import { Vehicle } from './vehicles.js';

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const rand = (a, b) => a + Math.random() * (b - a);

export class PoliceSystem {
  constructor(game) {
    this.game = game;
    this.cops = [];
    this.cars = [];
    this.spawnTimer = 0;
    this.copTimer = 0;
    this.evading = false;
    this.evadeTimer = 0;
    this.starTimer = 0;
    this.clearTimer = 0;
    this.sirenTime = 0;
    this.carFireTimers = new Map();
    this.lastWanted = 0;
  }

  resetEvasion() {
    this.evading = false;
    this.evadeTimer = 0;
    this.starTimer = 0;
  }

  onWantedRaised() {
    this.resetEvasion();
    this.lastWanted = this.game.wanted;
    this.clearTimer = 0;
  }

  update(dt, game) {
    const wanted = game.wanted;
    const player = game.player;
    if (wanted <= 0) {
      this.evading = false;
      this.evadeTimer = 0;
      if (this.cars.length || this.cops.length) {
        this.clearTimer += dt;
        if (this.clearTimer > 10) this._clearAll(game, true);
      }
      game.audio.updateSiren(999, false);
      return;
    }
    this.clearTimer = 0;

    // --- spawning ---
    this.spawnTimer -= dt;
    const desiredCars = Math.min(4, wanted);
    const activeCars = this.cars.filter((v) => !v.dead && !v.isPlayer);
    if (this.spawnTimer <= 0 && activeCars.length < desiredCars) {
      this.spawnTimer = rand(2.4, 4.5) - Math.min(1.2, wanted * 0.2);
      this._spawnCopCar(game);
    }

    this.copTimer -= dt;
    const desiredCops = wanted >= 1 ? Math.min(9, 1 + wanted * 2) : 0;
    const activeCops = this.cops.filter((c) => c.alive);
    if (this.copTimer <= 0 && activeCops.length < desiredCops) {
      this.copTimer = rand(1.6, 3.2);
      this._spawnCop(game);
    }

    // --- cops chase & shoot (movement handled in main for all enemies) ---
    for (const c of this.cops) {
      if (!c.alive) continue;
      c.accuracy = 0.34 + Math.min(wanted, 5) * 0.045;
      c.damageAmount = 7 + Math.min(wanted, 5);
    }

    // --- cop cars ---
    let nearestCar = null;
    let nearestDist = 1e9;
    for (const v of this.cars) {
      if (v.dead) continue;
      if (v.isPlayer) continue;
      v.ai = { type: 'chase', target: player };
      const d = Math.hypot(v.pos.x - player.pos.x, v.pos.z - player.pos.z);
      if (d < nearestDist) { nearestDist = d; nearestCar = v; }
      if (d > 280) {
        const spot = game.vehicles._roadSpawn(70, 140, player.pos);
        v.group.position.set(spot.x, 0, spot.z);
        v.heading = spot.heading;
        v.group.rotation.y = spot.heading;
        v.speed = 10;
      }
      // drive-by shots
      let timer = this.carFireTimers.get(v) ?? rand(0.5, 1.4);
      timer -= dt;
      if (timer <= 0 && d < 42 && d > 8) {
        timer = rand(1.0, 1.8);
        this._copCarShoot(v, game, d);
      }
      this.carFireTimers.set(v, timer);
    }

    // siren
    if (nearestCar && nearestDist < 220) {
      game.audio.updateSiren(nearestDist, true);
    } else {
      game.audio.updateSiren(999, false);
    }

    // --- evasion ---
    let closestCop = 1e9;
    for (const c of this.cops) {
      if (c.alive) closestCop = Math.min(closestCop, Math.hypot(c.pos.x - player.pos.x, c.pos.z - player.pos.z));
    }
    for (const v of this.cars) {
      if (!v.dead && !v.isPlayer) closestCop = Math.min(closestCop, Math.hypot(v.pos.x - player.pos.x, v.pos.z - player.pos.z));
    }

    if (closestCop > 55) {
      this.evadeTimer += dt;
      if (this.evadeTimer > 6) {
        if (!this.evading) {
          this.evading = true;
          this.starTimer = 0;
          game.notify('수배 회피 중', '경찰의 시야에서 벗어났습니다.', 'police');
        }
        this.starTimer += dt;
        if (this.starTimer > 5.5) {
          this.starTimer = 0;
          game.wanted = Math.max(0, game.wanted - 1);
          if (game.wanted > 0) {
            game.notify('수배 레벨 감소', `수배 ${game.wanted}단계`, 'police');
          } else {
            game.onWantedCleared();
          }
        }
      }
    } else {
      if (closestCop < 40) {
        this.evadeTimer = 0;
        this.evading = false;
      }
    }

    // dead cleanup
    for (const v of this.cars) {
      if (v.dead) {
        const i = this.cars.indexOf(v);
        if (i >= 0) this.cars.splice(i, 1);
      }
    }
    for (const c of this.cops) {
      if (!c.alive) {
        if (c.deadTime === 0) c.deadTime = 0.01;
      }
    }
  }

  _spawnCopCar(game) {
    const player = game.player;
    const spot = game.vehicles._roadSpawn(95, 190, player.pos);
    const v = game.vehicles.add({ x: spot.x, z: spot.z, heading: spot.heading, type: 'police' });
    v.ai = { type: 'chase', target: player };
    v.isPolice = true;
    this.cars.push(v);
    game.audio.wanted();
  }

  _spawnCop(game) {
    const player = game.player;
    let x = null;
    let z = null;
    for (let tries = 0; tries < 30; tries++) {
      const spot = game.vehicles._roadSpawn(34, 70, player.pos);
      const d = Math.hypot(spot.x - player.pos.x, spot.z - player.pos.z);
      if (d > 30) {
        x = spot.x;
        z = spot.z;
        break;
      }
    }
    if (x === null) {
      const p = game.world.randomSidewalk();
      x = p.x;
      z = p.z;
    }
    const heading = Math.atan2(player.pos.x - x, player.pos.z - z);
    const cop = new Cop(game.scene, { x, z, heading, health: 100 });
    game.enemies.push(cop);
    this.cops.push(cop);
  }

  _copCarShoot(car, game, dist) {
    const player = game.player;
    const target = player.vehicle ? player.vehicle.pos : player.pos;
    if (game.world.lineBlocked(car.pos.x, car.pos.z, target.x, target.z)) return;
    const from = new THREE.Vector3(car.pos.x, 1.6, car.pos.z);
    const to = new THREE.Vector3(target.x, player.vehicle ? 1.0 : 1.15, target.z);
    const dir = to.clone().sub(from).normalize();
    const hit = Math.random() < clamp(0.42 - dist / 160, 0.12, 0.42);
    if (!hit) {
      dir.x += (Math.random() - 0.5) * 0.16;
      dir.z += (Math.random() - 0.5) * 0.16;
      dir.normalize();
    }
    const end = to.clone().addScaledVector(dir, 10);
    game.fx.tracer(from, hit ? to : end, 0xffc07a, 0.08);
    game.fx.burst(from, { count: 2, color: 0xffd27f, speed: 1.4, life: 0.08, size: 0.24, gravity: 0, spread: 1 });
    game.audio.enemyShot(car.pos);
    if (hit) {
      if (player.vehicle) {
        player.vehicle.damage(5, game, 'bullet');
        if (Math.random() < 0.2) player.damage(4, game, { bullet: true });
      } else {
        player.damage(5, game, { bullet: true });
        game.fx.blood(to);
      }
    }
  }

  _clearAll(game, silent) {
    for (const v of this.cars) {
      if (v.isPlayer) continue;
      v.ai = null;
      v.brake = 1;
      const i = game.vehicles.vehicles.indexOf(v);
      if (i >= 0) game.vehicles.vehicles.splice(i, 1);
      game.scene.remove(v.group);
    }
    this.cars = [];
    for (const c of this.cops) {
      if (c.alive) {
        const i = game.enemies.indexOf(c);
        if (i >= 0) game.enemies.splice(i, 1);
        c.remove();
      }
    }
    this.cops = [];
    this.carFireTimers.clear();
    if (!silent) game.audio.updateSiren(999, false);
  }

  onPlayerDeath() {
    this._clearAll(this.game, true);
  }
}
