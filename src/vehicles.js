import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const rand = (a, b) => a + Math.random() * (b - a);
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

const CAR_COLORS = [0xb6312a, 0x2b5d9e, 0xe8e6df, 0x16181c, 0x9aa0a6, 0xd97a24, 0x3d6b45, 0xc9b23a, 0x4a2f63, 0x2d7a78, 0x77242b, 0x53616b];

const TYPES = {
  sedan: { len: 4.5, width: 1.88, height: 1.42, maxSpeed: 27, accel: 11, turn: 2.1, name: 'Sultan' },
  sports: { len: 4.55, width: 1.98, height: 1.14, maxSpeed: 38, accel: 17, turn: 2.25, name: 'Banshee' },
  suv: { len: 4.95, width: 2.02, height: 1.76, maxSpeed: 24, accel: 9.5, turn: 1.8, name: 'Rancher' },
  taxi: { len: 4.6, width: 1.9, height: 1.52, maxSpeed: 25, accel: 10.5, turn: 2.0, name: 'Downtown Cab' },
  van: { len: 5.3, width: 2.08, height: 1.92, maxSpeed: 21, accel: 8, turn: 1.7, name: 'Speedo' },
  police: { len: 4.7, width: 1.98, height: 1.55, maxSpeed: 33, accel: 14, turn: 2.15, name: 'LSPD Cruiser' },
};

const bodyCache = new Map();
const lightCache = new Map();
const wheelCache = new Map();
const lightMat = new THREE.MeshBasicMaterial({ vertexColors: true, toneMapped: false });
const wheelMat = new THREE.MeshStandardMaterial({ color: 0x141517, roughness: 0.9 });
const glassMat = new THREE.MeshStandardMaterial({ color: 0x26333d, roughness: 0.15, metalness: 0.7 });

function coloredBox(geos, w, h, d, color, x, y, z) {
  const g = new THREE.BoxGeometry(w, h, d);
  const c = new THREE.Color(color);
  const n = g.attributes.position.count;
  const arr = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    arr[i * 3] = c.r;
    arr[i * 3 + 1] = c.g;
    arr[i * 3 + 2] = c.b;
  }
  g.setAttribute('color', new THREE.BufferAttribute(arr, 3));
  g.translate(x, y, z);
  geos.push(g);
}

function buildBody(type, color, isPolice, isTaxi) {
  const key = `${type}|${color}|${isPolice ? 1 : 0}|${isTaxi ? 1 : 0}`;
  if (bodyCache.has(key)) return bodyCache.get(key);
  const t = TYPES[type];
  const { len, width, height } = t;
  const body = [];
  const lights = [];
  const bodyColor = isPolice ? 0xe8e8e7 : isTaxi ? 0xd8b32c : color;
  const lowerH = height * 0.4;
  const baseY = 0.33;

  // main hull
  coloredBox(body, width, lowerH, len, bodyColor, 0, baseY + lowerH / 2, 0);
  // hood and trunk
  const deckY = baseY + lowerH + 0.04;
  coloredBox(body, width * 0.96, 0.12, len * 0.27, bodyColor, 0, deckY + 0.06, len * 0.31);
  coloredBox(body, width * 0.96, 0.12, len * 0.24, bodyColor, 0, deckY + 0.06, -len * 0.33);
  // cabin
  const cabinH = height * (type === 'sports' ? 0.32 : 0.4);
  const cabinLen = len * (type === 'van' ? 0.62 : 0.44);
  const cabinZ = type === 'van' ? -len * 0.13 : -len * 0.06;
  coloredBox(body, width * 0.86, cabinH, cabinLen, glassMat.color, 0, deckY + cabinH / 2, cabinZ);
  // roof
  coloredBox(body, width * 0.8, 0.09, cabinLen * 0.86, bodyColor, 0, deckY + cabinH + 0.045, cabinZ);
  // pillars
  coloredBox(body, width * 0.88, 0.11, 0.1, bodyColor, 0, deckY + cabinH * 0.6, cabinZ + cabinLen * 0.42);
  coloredBox(body, width * 0.88, 0.11, 0.1, bodyColor, 0, deckY + cabinH * 0.6, cabinZ - cabinLen * 0.42);
  // bumpers
  coloredBox(body, width * 0.94, 0.18, 0.22, 0x1b1d20, 0, baseY + 0.12, len / 2 - 0.02);
  coloredBox(body, width * 0.94, 0.18, 0.22, 0x1b1d20, 0, baseY + 0.12, -len / 2 + 0.02);
  // side skirts
  coloredBox(body, width + 0.02, 0.1, len * 0.62, 0x22252a, 0, baseY + 0.06, 0);

  if (isPolice) {
    coloredBox(body, width + 0.03, 0.28, len * 0.55, 0x141619, 0, baseY + lowerH * 0.62, -len * 0.03);
  }
  if (isTaxi) {
    coloredBox(body, 0.62, 0.16, 0.32, 0xe8e2c8, 0, deckY + cabinH + 0.18, cabinZ + 0.1);
  }

  // headlights & taillights
  const headY = baseY + lowerH * 0.62;
  const hx = width * 0.32;
  const lightCol = 0xfff0c0;
  const tailCol = 0xff2f24;
  for (const sx of [-1, 1]) {
    coloredBox(lights, width * 0.2, 0.14, 0.06, lightCol, sx * hx, headY, len / 2 - 0.01);
    coloredBox(lights, width * 0.18, 0.12, 0.05, tailCol, sx * hx, headY, -len / 2 + 0.01);
  }

  const merged = mergeGeometries(body);
  const lightsGeo = mergeGeometries(lights);
  const out = { body: merged, lights: lightsGeo };
  bodyCache.set(key, out);

  if (!wheelCache.has(type)) {
    const wheels = [];
    const wr = 0.34;
    const wz = len * 0.31;
    const wx = width / 2 - 0.06;
    for (const sx of [-1, 1]) {
      for (const sz of [-1, 1]) {
        const cyl = new THREE.CylinderGeometry(wr, wr, 0.26, 10);
        cyl.rotateZ(Math.PI / 2);
        cyl.translate(sx * wx, wr, sz * wz);
        wheels.push(cyl);
      }
    }
    wheelCache.set(type, mergeGeometries(wheels));
  }
  return out;
}

function makePoliceDecalTexture() {
  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 64;
  const ctx = c.getContext('2d');
  ctx.clearRect(0, 0, 256, 64);
  ctx.fillStyle = 'rgba(12,16,24,0.85)';
  ctx.fillRect(0, 0, 256, 64);
  ctx.fillStyle = '#e8eef5';
  ctx.font = '900 34px "Arial Black", Impact, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('POLICE', 128, 34);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}
let policeDecalTex = null;

export class Vehicle {
  constructor(scene, opts = {}) {
    const type = opts.type || 'sedan';
    const t = TYPES[type];
    this.scene = scene;
    this.type = type;
    this.stats = t;
    this.name = t.name;
    this.isPolice = !!opts.isPolice || type === 'police';
    this.isTaxi = type === 'taxi';
    this.color = opts.color ?? (this.isPolice ? 0xe8e8e7 : this.isTaxi ? 0xd8b32c : pick(CAR_COLORS));
    this.heading = opts.heading ?? 0;
    this.speed = opts.speed ?? 0;
    this.steer = 0;
    this.throttle = 0;
    this.brake = 0;
    this.health = 100;
    this.dead = false;
    this.isPlayer = false;
    this.ai = null;
    this.group = new THREE.Group();
    this.group.position.set(opts.x ?? 0, 0, opts.z ?? 0);
    this.group.rotation.y = this.heading;
    this.scene.add(this.group);

    const built = buildBody(type, this.color, this.isPolice, this.isTaxi);
    this.bodyMesh = new THREE.Mesh(built.body, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.38, metalness: 0.45 }));
    this.bodyMesh.castShadow = true;
    this.bodyMesh.receiveShadow = true;
    this.group.add(this.bodyMesh);

    this.lightsMesh = new THREE.Mesh(built.lights, lightMat);
    this.group.add(this.lightsMesh);

    this.wheelsMesh = new THREE.Mesh(wheelCache.get(type), wheelMat);
    this.wheelsMesh.castShadow = true;
    this.group.add(this.wheelsMesh);

    if (this.isPolice) {
      this.redLight = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.14, 0.3), new THREE.MeshBasicMaterial({ color: 0xff2a24, toneMapped: false }));
      this.blueLight = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.14, 0.3), new THREE.MeshBasicMaterial({ color: 0x2f7dff, toneMapped: false }));
      this.redLight.position.set(-0.52, 1.62, -0.1);
      this.blueLight.position.set(0.52, 1.62, -0.1);
      this.group.add(this.redLight, this.blueLight);
      const bar = new THREE.Mesh(new THREE.BoxGeometry(1.25, 0.1, 0.36), new THREE.MeshStandardMaterial({ color: 0x1a1c1f }));
      bar.position.set(0, 1.55, -0.1);
      this.group.add(bar);

      if (!policeDecalTex) policeDecalTex = makePoliceDecalTexture();
      const decalMat = new THREE.MeshBasicMaterial({ map: policeDecalTex, transparent: true, depthWrite: false });
      for (const sx of [-1, 1]) {
        const d = new THREE.Mesh(new THREE.PlaneGeometry(2.5, 0.62), decalMat);
        d.position.set(sx * (t.width / 2 + 0.012), 0.66, -0.15);
        d.rotation.y = sx * Math.PI / 2;
        this.group.add(d);
      }
    }

    this.radius = t.width * 0.52;
    this.smokeTimer = 0;
    this.fireTimer = 0;
    this.flashTimer = 0;
    this.collisionCooldown = 0;
    this.stuckTimer = 0;
    this.entered = false;
  }

  get pos() { return this.group.position; }

  enter(player) {
    this.isPlayer = true;
    this.ai = null;
    this.entered = true;
    this.throttle = 0;
  }

  exit() {
    this.isPlayer = false;
    this.throttle = 0;
    this.brake = 1;
  }

  damage(amount, game, source = 'bullet') {
    if (this.dead) return;
    this.health -= amount;
    if (this.health <= 0) {
      this.health = 0;
      this.dead = true;
      this.speed *= 0.3;
      game.vehicles.explode(this, game);
    }
  }

  updatePhysics(dt, game) {
    this.collisionCooldown = Math.max(0, this.collisionCooldown - dt);
    if (this.dead) {
      this.speed *= Math.max(0, 1 - dt * 4);
      this._integrate(dt, game, true);
      return;
    }

    if (this.isPlayer) {
      const input = game.input;
      const forward = this.speed;
      this.throttle = input.forward ? 1 : 0;
      if (input.back) this.throttle = forward > 0.6 ? 0 : -0.65;
      if (input.back && forward > 0.6) this.brake = 1;
      else this.brake = input.brake ? 1 : 0;
      // The chase camera sits behind the car, so world +X is screen-left.
      // Negate the intent so A/left actually turns left on screen.
      this.steer = -input.carSteer;
      if (input.brake && Math.abs(this.speed) > 6) this.steer *= 1.5;
    } else if (this.ai) {
      this._updateAI(dt, game);
    } else {
      this.throttle = 0;
      this.steer = 0;
      this.brake = 0.35;
    }

    // engine / brake
    if (this.throttle > 0) {
      this.speed += this.stats.accel * this.throttle * dt;
    } else if (this.throttle < 0) {
      if (this.speed > 0.4) this.speed += this.throttle * this.stats.accel * 1.8 * dt;
      else this.speed += this.throttle * this.stats.accel * 0.5 * dt;
    }
    if (this.brake) {
      const dec = 24 * this.brake * dt;
      if (this.speed > 0) this.speed = Math.max(0, this.speed - dec);
      else this.speed = Math.min(0, this.speed + dec);
    }
    // drag + rolling resistance
    this.speed -= this.speed * (0.18 + (this.isPlayer ? 0 : 0.12)) * dt;
    if (!this.throttle && !this.brake) {
      const roll = 1.2 * dt;
      if (this.speed > 0) this.speed = Math.max(0, this.speed - roll);
      else this.speed = Math.min(0, this.speed + roll);
    }
    this.speed = clamp(this.speed, -this.stats.maxSpeed * 0.34, this.stats.maxSpeed);

    const steerFactor = clamp(Math.abs(this.speed) / 7, 0, 1) * (1 - clamp(Math.abs(this.speed) / (this.stats.maxSpeed * 2.6), 0, 0.35));
    this.heading += this.steer * this.stats.turn * steerFactor * dt * Math.sign(this.speed || 1);
    this._integrate(dt, game, false);

    if (this.isPlayer) {
      const a = game.audio;
      if (a) a.updateEngine(Math.abs(this.speed) / this.stats.maxSpeed, this.throttle);
    }

    // damage smoke
    if (this.health < 42) {
      this.smokeTimer -= dt;
      if (this.smokeTimer <= 0) {
        this.smokeTimer = 0.16;
        const f = new THREE.Vector3(Math.sin(this.heading), 0, Math.cos(this.heading));
        const p = this.pos.clone().addScaledVector(f, this.stats.len * 0.34);
        p.y = 0.9;
        game.fx.burst(p, { count: 2, color: 0x444444, speed: 1.2, life: 1.3, size: 0.7, gravity: -0.5, kind: 'smoke' });
      }
    }
  }

  _integrate(dt, game, dead) {
    if (Math.abs(this.speed) < 0.01 && dead) return;
    const fx = Math.sin(this.heading) * this.speed * dt;
    const fz = Math.cos(this.heading) * this.speed * dt;
    let nx = this.pos.x + fx;
    let nz = this.pos.z + fz;
    const res = game.world.resolveCircle(nx, nz, 1.15);
    if (res.hit) {
      const impactSpeed = Math.abs(this.speed);
      this.speed *= -0.22;
      if (impactSpeed > 4 && this.collisionCooldown <= 0) {
        this.collisionCooldown = 0.22;
        this.health -= impactSpeed * 0.85;
        const p = this.pos.clone();
        p.y = 0.55;
        game.fx.sparks(p, null);
        if (this.isPlayer) {
          game.fx.shake = Math.max(game.fx.shake, Math.min(0.5, impactSpeed * 0.02));
          game.audio.crash(impactSpeed);
        }
        if (this.health <= 0 && !this.dead) {
          this.dead = true;
          game.vehicles.explode(this, game);
        }
      }
    }
    nx = res.x;
    nz = res.z;
    this.group.position.x = nx;
    this.group.position.z = nz;
    this.group.rotation.y = this.heading;

    if (this.isPolice) {
      this.flashTimer += dt;
      const on = Math.sin(this.flashTimer * 14) > 0;
      if (this.redLight) this.redLight.visible = on;
      if (this.blueLight) this.blueLight.visible = !on;
    }
  }

  _updateAI(dt, game) {
    const ai = this.ai;
    if (!ai) return;

    let tx;
    let tz;
    let dist;
    if (ai.type === 'traffic') {
      // Traffic uses waypoints and has no chase target. The old code bailed
      // out here because ai.target was undefined, which left every traffic
      // car coasting straight until it stopped.
      if (!ai.waypoint) return;
      tx = ai.waypoint.x;
      tz = ai.waypoint.z;
      dist = Math.hypot(tx - this.pos.x, tz - this.pos.z);
      if (dist < 5.5) {
        this._nextTrafficWaypoint(game.world);
        tx = ai.waypoint.x;
        tz = ai.waypoint.z;
        dist = Math.hypot(tx - this.pos.x, tz - this.pos.z);
      }
    } else {
      const target = ai.target;
      if (!target) return;
      const tp = target.vehicle ? target.vehicle.pos : target.pos;
      if (!tp) return;
      tx = tp.x;
      tz = tp.z;
      dist = Math.hypot(tx - this.pos.x, tz - this.pos.z);
    }

    const dx = tx - this.pos.x;
    const dz = tz - this.pos.z;
    const desired = Math.atan2(dx, dz);
    let diff = ((desired - this.heading + Math.PI) % (Math.PI * 2)) - Math.PI;
    if (diff < -Math.PI) diff += Math.PI * 2;
    this.steer = clamp(diff * 2.4, -1, 1);

    let desiredSpeed = this.stats.maxSpeed * (ai.type === 'chase' ? 0.95 : 0.52);
    if (Math.abs(diff) > 0.8) desiredSpeed *= 0.4;
    if (dist < 16 && ai.type === 'chase') desiredSpeed = Math.max(0, (dist - 6) * 1.6);

    // obstacle avoidance
    let blocked = false;
    const fwdX = Math.sin(this.heading);
    const fwdZ = Math.cos(this.heading);
    for (const other of game.vehicles.vehicles) {
      if (other === this || other.dead) continue;
      // Parked cars sit at the curb; don't let them freeze a whole lane.
      if (!other.ai && !other.isPlayer) continue;
      const ox = other.pos.x - this.pos.x;
      const oz = other.pos.z - this.pos.z;
      const ahead = ox * fwdX + oz * fwdZ;
      const lateral = Math.abs(ox * fwdZ - oz * fwdX);
      const lateralLimit = other.isPlayer ? 2.2 : 1.7;
      if (ahead > 1.5 && ahead < 11 && lateral < lateralLimit) {
        blocked = true;
        break;
      }
    }
    const player = game.player;
    if (!player.vehicle) {
      const ox = player.pos.x - this.pos.x;
      const oz = player.pos.z - this.pos.z;
      const ahead = ox * fwdX + oz * fwdZ;
      const lateral = Math.abs(ox * fwdZ - oz * fwdX);
      if (ahead > 0 && ahead < 8 && lateral < 2.2) blocked = true;
    }

    // Simple anti-gridlock: if a traffic car has been pinned for a while,
    // let it creep through for a moment and pick a fresh waypoint.
    if (ai.type === 'traffic') {
      if (ai.ignoreBlockers > 0) {
        ai.ignoreBlockers -= dt;
        blocked = false;
      }
      if (blocked) this.stuckTimer += dt;
      else this.stuckTimer = Math.max(0, this.stuckTimer - dt * 1.5);
      if (this.stuckTimer > 3.5) {
        this.stuckTimer = 0;
        ai.ignoreBlockers = 1.6;
        this._nextTrafficWaypoint(game.world);
        blocked = false;
      }
    }

    if (blocked) desiredSpeed = 0;

    if (this.speed < desiredSpeed - 0.4) this.throttle = 0.8;
    else if (this.speed > desiredSpeed + 1.2) this.throttle = -0.3;
    else this.throttle = 0.05;
    this.brake = desiredSpeed === 0 && this.speed > 0.4 ? 1 : 0;
    if (this.brake) this.throttle = 0;
  }

  initTraffic(world) {
    this.ai = { type: 'traffic', waypoint: null, ignoreBlockers: 0 };
    this.stuckTimer = 0;
    this.nodeI = clamp(Math.round(this.pos.x / 78), -4, 4);
    this.nodeJ = clamp(Math.round(this.pos.z / 78), -4, 4);
    // determine closest direction from heading
    const s = Math.sin(this.heading);
    const c = Math.cos(this.heading);
    if (Math.abs(s) > Math.abs(c)) this.dir = s > 0 ? 0 : 2;
    else this.dir = c > 0 ? 1 : 3;
    this._nextTrafficWaypoint(world);
  }

  _nextTrafficWaypoint(world) {
    const dirs = [[1, 0], [0, 1], [-1, 0], [0, -1]];
    const reverse = (this.dir + 2) % 4;
    const options = [];
    for (let d = 0; d < 4; d++) {
      if (d === reverse) continue;
      const ni = this.nodeI + dirs[d][0];
      const nj = this.nodeJ + dirs[d][1];
      if (ni < -4 || ni > 4 || nj < -4 || nj > 4) continue;
      const weight = d === this.dir ? 0.55 : 0.225;
      options.push({ d, ni, nj, weight });
    }
    if (!options.length) {
      this.nodeI = clamp(this.nodeI + dirs[reverse][0], -4, 4);
      this.nodeJ = clamp(this.nodeJ + dirs[reverse][1], -4, 4);
      this.dir = reverse;
    } else {
      let r = Math.random();
      let chosen = options[0];
      for (const o of options) {
        r -= o.weight;
        if (r <= 0) { chosen = o; break; }
      }
      this.nodeI = chosen.ni;
      this.nodeJ = chosen.nj;
      this.dir = chosen.d;
    }
    const offset = 3.4;
    let x = this.nodeI * 78;
    let z = this.nodeJ * 78;
    if (this.dir === 0) z += offset;
    if (this.dir === 2) z -= offset;
    if (this.dir === 1) x -= offset;
    if (this.dir === 3) x += offset;
    this.ai.waypoint = { x, z };
  }
}

export class VehicleManager {
  constructor(scene, world) {
    this.scene = scene;
    this.world = world;
    this.vehicles = [];
    this.trafficCount = 20;
    this.trafficTimer = 0;
    this.headlight = new THREE.SpotLight(0xfff0c8, 0, 62, 0.55, 0.5, 1.2);
    this.headlight.castShadow = false;
    this.headlight.position.set(0, 1, 0);
    this.scene.add(this.headlight);
    this.headlight.target = new THREE.Object3D();
    this.scene.add(this.headlight.target);
    this._spawnParked();
    this._spawnTraffic();
  }

  add(opts) {
    const v = new Vehicle(this.scene, opts);
    this.vehicles.push(v);
    return v;
  }

  _roadSpawn(minDist, maxDist, from) {
    for (let tries = 0; tries < 60; tries++) {
      const alongZ = Math.random() < 0.5;
      const line = Math.floor(rand(-4, 5));
      const t = rand(-3.8, 3.8) * 78;
      const dir = Math.random() < 0.5 ? 1 : -1;
      let x;
      let z;
      let heading;
      if (alongZ) {
        x = line * 78 + (dir > 0 ? -3.4 : 3.4);
        z = t;
        heading = dir > 0 ? 0 : Math.PI;
      } else {
        x = t;
        z = line * 78 + (dir > 0 ? 3.4 : -3.4);
        heading = dir > 0 ? Math.PI / 2 : -Math.PI / 2;
      }
      if (from && (Math.hypot(x - from.x, z - from.z) < minDist || Math.hypot(x - from.x, z - from.z) > maxDist)) continue;
      if (this.world.isBlocked(x, z, 1.5)) continue;
      return { x, z, heading };
    }
    return { x: 0, z: 40, heading: 0 };
  }

  _spawnTraffic() {
    const center = this.world.spawn || { x: 0, z: 0 };
    for (let i = 0; i < this.trafficCount; i++) {
      // Put a handful of cars in the player's first view so the city feels alive.
      const close = i < 7;
      const spot = this._roadSpawn(close ? 16 : 55, close ? 95 : 270, center);
      const v = this.add({
        x: spot.x, z: spot.z, heading: spot.heading,
        type: pick(['sedan', 'sedan', 'suv', 'sports', 'van', 'taxi']),
        speed: rand(4, 10),
      });
      v.initTraffic(this.world);
    }
  }

  _spawnParked() {
    // roadside parked cars
    const used = new Set();
    for (let i = 0; i < 26; i++) {
      const block = pick(this.world.blocks);
      if (block.isPark) continue;
      const key = `${block.i},${block.j}`;
      if (used.has(key)) continue;
      used.add(key);
      const side = Math.floor(Math.random() * 4);
      const t = rand(8, 56);
      let x;
      let z;
      let heading;
      if (side === 0) { x = block.x0 - 2.0; z = block.z0 + t; heading = 0; }
      if (side === 1) { x = block.x1 + 2.0; z = block.z0 + t; heading = Math.PI; }
      if (side === 2) { x = block.x0 + t; z = block.z0 - 2.0; heading = Math.PI / 2; }
      if (side === 3) { x = block.x0 + t; z = block.z1 + 2.0; heading = -Math.PI / 2; }
      if (this.world.isBlocked(x, z, 1.2)) continue;
      this.add({ x, z, heading, type: pick(['sedan', 'sports', 'suv', 'taxi', 'van', 'sedan']), color: pick(CAR_COLORS) });
    }
    // parking lots
    let lots = 0;
    for (const block of this.world.parkingBlocks) {
      if (lots > 3) break;
      lots++;
      for (const spot of block.parkingSpots || []) {
        if (Math.random() < 0.6) {
          this.add({ x: spot.x, z: spot.z, heading: spot.heading, type: pick(['sedan', 'suv', 'sports']) });
        }
      }
    }
    // a guaranteed ride near the player spawn
    this.add({ x: 156 + 6.2, z: 198, heading: Math.PI, type: 'sedan', color: 0x2b5d9e });
    this.add({ x: 156 - 5.8, z: 210, heading: 0, type: 'taxi' });
  }

  nearest(pos, maxDist) {
    let best = null;
    let bestD = maxDist;
    for (const v of this.vehicles) {
      if (v.dead) continue;
      const d = Math.hypot(v.pos.x - pos.x, v.pos.z - pos.z);
      if (d < bestD) { bestD = d; best = v; }
    }
    return best;
  }

  spawnTrafficNear(pos) {
    const spot = this._roadSpawn(55, 200, pos);
    const v = this.add({
      x: spot.x, z: spot.z, heading: spot.heading,
      type: pick(['sedan', 'sedan', 'suv', 'sports', 'van', 'taxi']),
      speed: rand(4, 9),
    });
    v.initTraffic(this.world);
    return v;
  }

  update(dt, game) {
    const player = game.player;
    for (const v of this.vehicles) {
      v.updatePhysics(dt, game);
      if (!v.isPlayer && v.ai?.type === 'traffic') {
        const d = Math.hypot(v.pos.x - player.pos.x, v.pos.z - player.pos.z);
        if (d > 235) {
          // recycle far traffic back into the player's neighborhood
          const spot = this._roadSpawn(70, 190, player.pos);
          v.group.position.set(spot.x, 0, spot.z);
          v.heading = spot.heading;
          v.group.rotation.y = spot.heading;
          v.speed = rand(4, 9);
          v.stuckTimer = 0;
          v.initTraffic(this.world);
        }
      }
    }

    // Keep a steady stream of moving cars even after thefts or explosions.
    this.trafficTimer -= dt;
    if (this.trafficTimer <= 0) {
      this.trafficTimer = 2.5;
      let activeTraffic = 0;
      for (const v of this.vehicles) {
        if (!v.dead && !v.isPlayer && v.ai?.type === 'traffic') activeTraffic++;
      }
      if (activeTraffic < this.trafficCount) this.spawnTrafficNear(player.pos);
    }

    // car vs car
    for (let i = 0; i < this.vehicles.length; i++) {
      const a = this.vehicles[i];
      if (a.dead) continue;
      for (let j = i + 1; j < this.vehicles.length; j++) {
        const b = this.vehicles[j];
        if (b.dead) continue;
        const dx = b.pos.x - a.pos.x;
        const dz = b.pos.z - a.pos.z;
        const minD = 2.35;
        const d2 = dx * dx + dz * dz;
        if (d2 > minD * minD || d2 < 1e-5) continue;
        const d = Math.sqrt(d2);
        const push = (minD - d) * 0.5;
        const nx = dx / d;
        const nz = dz / d;
        a.pos.x -= nx * push;
        a.pos.z -= nz * push;
        b.pos.x += nx * push;
        b.pos.z += nz * push;
        const rel = Math.abs(a.speed - b.speed);
        if (rel > 5) {
          a.health -= rel * 0.4;
          b.health -= rel * 0.4;
          if (a.isPlayer || b.isPlayer) {
            game.audio.crash(rel);
            game.fx.shake = Math.max(game.fx.shake, 0.2);
          }
        }
        a.speed *= 0.92;
        b.speed *= 0.92;
        if (a.health <= 0 && !a.dead) { a.dead = true; this.explode(a, game); }
        if (b.health <= 0 && !b.dead) { b.dead = true; this.explode(b, game); }
      }
    }

    // run over characters
    if (!game.player.isDead) {
      for (const v of this.vehicles) {
        if (v.dead || Math.abs(v.speed) < 5) continue;
        const fx = Math.sin(v.heading);
        const fz = Math.cos(v.heading);
        const frontX = v.pos.x + fx * v.stats.len * 0.42;
        const frontZ = v.pos.z + fz * v.stats.len * 0.42;
        const targets = [game.peds, game.enemies];
        for (const arr of targets) {
          for (const c of arr) {
            if (!c.alive) continue;
            if (Math.hypot(c.pos.x - frontX, c.pos.z - frontZ) < 1.35) {
              const wasPlayer = v.isPlayer;
              c.damage(999, game, { car: true });
              if (wasPlayer && c.kind !== 'cop' && c.kind !== 'gangster') {
                game.addWanted(1, '보행자를 치었습니다');
              }
              if (wasPlayer && game.audio) game.audio.thud(c.pos);
            }
          }
        }
      }
    }

    // headlights for player car
    const pv = player.vehicle;
    if (pv && !pv.dead) {
      const fx = Math.sin(pv.heading);
      const fz = Math.cos(pv.heading);
      const rightX = Math.cos(pv.heading);
      const rightZ = -Math.sin(pv.heading);
      this.headlight.position.set(pv.pos.x + fx * pv.stats.len * 0.45, 1.0, pv.pos.z + fz * pv.stats.len * 0.45);
      this.headlight.target.position.set(pv.pos.x + fx * 30, 0.1, pv.pos.z + fz * 30);
      this.headlight.intensity = game.world.night * 55;
    } else {
      this.headlight.intensity = 0;
    }
  }

  explode(v, game) {
    if (v.exploded) return;
    v.exploded = true;
    v.dead = true;
    game.fx.explosion(v.pos.clone());
    game.audio.explosion(v.pos);
    if (v.isPlayer && game.player.vehicle === v) {
      game.player.vehicle = null;
      game.player.group.visible = true;
      game.player.group.position.set(v.pos.x, 1.2, v.pos.z);
      game.player.damage(220, game, { explosion: true });
    }
    // blast damage
    for (const c of [...game.peds, ...game.enemies]) {
      if (c.alive && c.pos.distanceTo(v.pos) < 7) c.damage(180, game, { explosion: true });
    }
    if (game.player.alive && !game.player.vehicle && game.player.pos.distanceTo(v.pos) < 6) {
      game.player.damage(80, game, { explosion: true });
    }
    game.addWanted(1, '차량 폭발');
    if (v.ai) v.ai = null;
    v.bodyMesh.material.color.setHex(0x2a2724);
  }
}
