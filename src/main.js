import * as THREE from 'three';
import './style.css';
import { World, BLOCK } from './world.js';
import { FX } from './fx.js';
import { HUD } from './hud.js';
import { AudioSystem, Radio } from './audio.js';
import { Input } from './input.js';
import { Player, Pedestrian, Gangster } from './characters.js';
import { VehicleManager } from './vehicles.js';
import { Combat } from './combat.js';
import { PoliceSystem } from './police.js';
import { MissionManager } from './missions.js';

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const lerpAngle = (a, b, t) => {
  let d = ((b - a + Math.PI) % (Math.PI * 2)) - Math.PI;
  if (d < -Math.PI) d += Math.PI * 2;
  return a + d * t;
};
const frame = () => new Promise((r) => requestAnimationFrame(r));

const HOSPITAL = { x: -72, z: 82 };

class Game {
  constructor() {
    this.state = 'loading';
    this.money = 1250;
    this.wanted = 0;
    this.wantedCooldown = 0;
    this.cameraYaw = 0;
    this.cameraPitch = 0.2;
    this.time = 0;
    this.introTime = 0;
    this.lastLookTime = 0;
    this.enemies = [];
    this.peds = [];
    this.spawnPedsTimer = 0;
    this.nearVehicle = null;
    this.lastArea = '';
    this.areaTimer = 0;
    this.recoil = 0;
    this.isMobile = window.matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window;
  }

  async boot() {
    const progress = (pct, label) => {
      const fill = document.getElementById('load-fill');
      const pctEl = document.getElementById('load-pct');
      const status = document.getElementById('load-status');
      if (fill) fill.style.width = `${pct}%`;
      if (pctEl) pctEl.textContent = `${pct}%`;
      if (status && label) status.textContent = label;
    };

    progress(6, 'STARTING ENGINE');
    await frame();

    const canvas = document.createElement('canvas');
    canvas.id = 'game';
    document.getElementById('app').prepend(canvas);
    this.canvas = canvas;

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance', alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, this.isMobile ? 1.3 : 1.6));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.14;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    this.renderer = renderer;
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(62, window.innerWidth / window.innerHeight, 0.1, 2600);
    this.camera.position.set(180, 90, 220);
    this.camera.lookAt(0, 20, 0);

    progress(14, 'GENERATING LOS SANTOS');
    await frame();

    this.world = new World(this.scene, renderer);
    progress(48, 'RAISING THE SKYLINE');
    await frame();

    this.fx = new FX(this.scene, this.camera);
    this.audio = new AudioSystem(this);
    this.radio = new Radio(this.audio);
    this.audio.radio = this.radio;
    this.hud = new HUD(this);
    this.hud.setMoney(this.money, false);
    this.hud.setWanted(0);

    progress(60, 'SPAWNING TRAFFIC');
    await frame();
    this.vehicles = new VehicleManager(this.scene, this.world);

    progress(70, 'WAKING UP THE CITY');
    await frame();
    this.player = new Player(this.scene, this);
    this.player.lastVehicle = null;
    this.player.spawn(this.world.spawn.x, this.world.spawn.z, this.world.spawn.heading);
    this.cameraYaw = this.world.spawn.heading + Math.PI;
    this.cameraPitch = 0.18;

    this.police = new PoliceSystem(this);
    this.combat = new Combat(this);
    this.missions = new MissionManager(this);

    for (let i = 0; i < 18; i++) {
      this.peds.push(new Pedestrian(this.scene, this.world));
    }

    this.input = new Input(this);

    progress(86, 'TUNING THE RADIO');
    await frame();
    this.hud.setWeapon(this.player.weapon);

    this.resize();
    window.addEventListener('resize', () => this.resize());
    window.addEventListener('blur', () => {
      if (this.state === 'playing') this.pause();
    });
    document.addEventListener('visibilitychange', () => {
      if (document.hidden && this.state === 'playing') this.pause();
    });
    document.getElementById('start-btn').addEventListener('click', () => this.startGame());
    document.getElementById('resume-btn').addEventListener('click', () => this.resume());
    document.getElementById('restart-btn').addEventListener('click', () => window.location.reload());
    document.addEventListener('pointerlockchange', () => {
      const locked = document.pointerLockElement === this.canvas;
      this.input.locked = locked;
      if (!locked && this.state === 'playing' && !this.input.touch) this.pause();
    });

    progress(100, 'READY');
    const startBtn = document.getElementById('start-btn');
    startBtn.disabled = false;
    this.state = 'intro';
    this.updateIntroCamera(0);
    this.lastTime = performance.now();
    this.loop = this.loop.bind(this);
    requestAnimationFrame(this.loop);
  }

  resize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    this.renderer.setSize(w, h);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
  }

  startGame() {
    if (this.state !== 'intro') return;
    this.audio.init();
    this.state = 'playing';
    const intro = document.getElementById('intro');
    intro.classList.add('out');
    setTimeout(() => intro.classList.add('hidden'), 750);
    this.hud.showHud(true);
    this.hud.showArea(this.world.areaName(this.player.pos.x, this.player.pos.z).name, 'LOS SANTOS · 15:20');
    this.hud.subtitle('LAMAR: 어이, 이 도시에서 살아남으려면 차와 총이 필요해. 첫 일감을 찾아봐.', 5);
    this.missions.start();
    if (this.input.touch) {
      document.getElementById('mobile-controls').classList.remove('hidden');
      const hint = document.getElementById('touch-hint');
      hint.classList.remove('hidden');
      setTimeout(() => hint.classList.add('hidden'), 6500);
    }
    this.updateCamera(1, true);
    if (!this.input.touch) {
      try { this.canvas.requestPointerLock?.(); } catch (e) { /* ignore */ }
    }
    this.audio.click();
    this.lastArea = this.world.areaName(this.player.pos.x, this.player.pos.z).name;
  }

  pause() {
    if (this.state !== 'playing') return;
    this.state = 'paused';
    this.input.mouseDown = false;
    this.input.touchFire = false;
    this.input.aim = false;
    this.audio.stopEngine();
    if (this.radio) this.radio.stop();
    document.getElementById('pause').classList.remove('hidden');
  }

  resume() {
    if (this.state !== 'paused') return;
    document.getElementById('pause').classList.add('hidden');
    this.state = 'playing';
    this.audio.init();
    if (this.player.vehicle) this.audio.startEngine();
    if (this.player.vehicle && this.radio) this.radio.start();
    if (!this.input.touch) {
      try { this.canvas.requestPointerLock?.(); } catch (e) { /* ignore */ }
    }
  }

  loop(now) {
    requestAnimationFrame(this.loop);
    const dt = Math.min(0.05, Math.max(0.0001, (now - this.lastTime) / 1000));
    this.lastTime = now;
    if (!this.renderer || !this.world) return;
    this.update(dt);
    this.renderer.render(this.scene, this.camera);
  }

  update(dt) {
    this.time += dt;

    if (this.state === 'intro' || this.state === 'loading') {
      this.introTime += dt;
      this.updateIntroCamera(dt);
      this.world.update(dt, this.player?.pos);
      this.fx?.update(dt);
      this.vehicles?.update(dt, this);
      for (const p of this.peds) p.update(dt, this);
      return;
    }

    if (this.state === 'paused') {
      this.world.update(dt, this.player.pos);
      this.fx.update(dt);
      return;
    }

    if (this.state === 'wasted') {
      this.world.update(dt, this.player.pos);
      this.fx.update(dt);
      this.hud.update(dt, this);
      return;
    }

    // --- playing ---
    this.input.update();
    const look = this.input.consumeLook();
    if (look.x !== 0 || look.y !== 0) {
      const sens = this.input.touch ? 0.0042 : 0.0021;
      this.cameraYaw -= look.x * sens;
      this.cameraPitch += look.y * sens;
      this.lastLookTime = 0;
    } else {
      this.lastLookTime += dt;
    }

    const vehicle = this.player.vehicle;
    if (vehicle) {
      if (this.lastLookTime > 1.1) {
        const targetYaw = vehicle.heading + Math.PI;
        this.cameraYaw = lerpAngle(this.cameraYaw, targetYaw, clamp(dt * 1.4, 0, 1));
      }
      this.cameraPitch = clamp(this.cameraPitch, 0.01, 0.72);
    } else {
      const aiming = this.input.aiming;
      this.cameraPitch = aiming ? clamp(this.cameraPitch, -0.18, 0.8) : clamp(this.cameraPitch, -0.32, 1.02);
    }

    this.player.update(dt, this.input, this);
    this.player.lastVehicle = vehicle || this.player.lastVehicle;

    // weapon use
    if (!vehicle && this.player.alive) {
      if (this.input.firing) this.combat.tryFire(this);
    }

    this.vehicles.update(dt, this);

    // pedestrians
    for (const p of this.peds) p.update(dt, this);
    this.peds = this.peds.filter((p) => !p.removed);
    this.spawnPedsTimer -= dt;
    if (this.spawnPedsTimer <= 0) {
      this.spawnPedsTimer = 4;
      const alive = this.peds.filter((p) => p.alive).length;
      if (alive < 17) {
        let tries = 0;
        while (tries++ < 10) {
          const p = new Pedestrian(this.scene, this.world);
          if (Math.hypot(p.pos.x - this.player.pos.x, p.pos.z - this.player.pos.z) > 30) {
            this.peds.push(p);
            break;
          }
          p.remove();
        }
      }
    }

    // enemies
    for (const e of this.enemies) {
      if (e.alive) {
        e.updateCombat(dt, this, e.kind === 'cop' ? 15 : 13);
      } else {
        e.deadTime += dt;
        if (e.deadTime > 35) {
          e.remove();
          e._removed = true;
        }
      }
    }
    this.enemies = this.enemies.filter((e) => !e._removed);

    this.police.update(dt, this);
    this.missions.update(dt);
    this.fx.update(dt);
    this.world.update(dt, this.player.pos);
    this.radio.update();
    this.updateCamera(dt);

    // area banner
    const area = this.world.areaName(this.player.pos.x, this.player.pos.z);
    this.hud.setArea(area.name);
    if (area.name !== this.lastArea) {
      this.lastArea = area.name;
      this.hud.showArea(area.name, area.sub);
    }

    // exit prompt
    if (this.player.inVehicle) {
      this.hud.setPrompt(this.input.touch ? 'CAR 버튼으로 하차' : '하차');
    } else {
      this.nearVehicle = this.vehicles.nearest(this.player.pos, 4.6);
      if (this.nearVehicle) {
        const verb = this.nearVehicle.isPolice ? '경찰차 훔치기' : '차량 훔치기';
        this.hud.setPrompt(this.input.touch ? `${verb} (CAR)` : verb);
      } else {
        this.hud.setPrompt(null);
      }
    }

    this.hud.update(dt, this);
    this.input.postUpdate();
    this.wantedCooldown = Math.max(0, this.wantedCooldown - dt * 1000);

    // player collision against parked cars
    if (!this.player.vehicle) {
      for (const v of this.vehicles.vehicles) {
        if (v.dead) continue;
        const dx = this.player.pos.x - v.pos.x;
        const dz = this.player.pos.z - v.pos.z;
        const d = Math.hypot(dx, dz);
        const min = 1.35;
        if (d < min && d > 0.001) {
          this.player.pos.x = v.pos.x + (dx / d) * min;
          this.player.pos.z = v.pos.z + (dz / d) * min;
        }
      }
    }
  }

  updateIntroCamera(dt) {
    this.introTime += dt * 0.55;
    const a = this.introTime * 0.035;
    const r = 245;
    this.camera.position.set(Math.cos(a) * r, 82 + Math.sin(a * 0.7) * 22, Math.sin(a) * r);
    this.camera.lookAt(0, 26, 0);
    this.camera.fov = 58;
    this.camera.updateProjectionMatrix();
  }

  updateCamera(dt, snap = false) {
    if (this.state === 'intro' || this.state === 'loading') return;
    const player = this.player;
    if (!player || !player.alive) return;
    const vehicle = player.vehicle;
    const yaw = this.cameraYaw;
    const pitch = this.cameraPitch;
    const aiming = player.aiming && !vehicle;

    let target;
    let dist;
    if (vehicle) {
      const fx = Math.sin(vehicle.heading);
      const fz = Math.cos(vehicle.heading);
      target = new THREE.Vector3(vehicle.pos.x + fx * 2.2, 1.35, vehicle.pos.z + fz * 2.2);
      dist = 8.8;
    } else {
      target = new THREE.Vector3(player.pos.x, player.pos.y + 1.5, player.pos.z);
      // over-the-shoulder framing keeps the player model clear of the reticle
      const shoulder = aiming ? 0.72 : 0.5;
      target.x += Math.cos(yaw) * shoulder;
      target.z += -Math.sin(yaw) * shoulder;
      if (aiming) target.y += 0.08;
      dist = aiming ? 3.0 : 5.4;
    }

    const dir = new THREE.Vector3(Math.sin(yaw) * Math.cos(pitch), Math.sin(pitch), Math.cos(yaw) * Math.cos(pitch));
    const hit = this.world.rayAABB(target, dir, dist + 0.6);
    let useDist = dist;
    if (hit < dist + 0.4) useDist = Math.max(0.9, hit - 0.35);
    const desired = target.clone().addScaledVector(dir, useDist);
    desired.y = Math.max(0.5, desired.y);

    const smooth = snap ? 1 : 1 - Math.exp(-dt * 14);
    this.camera.position.lerp(desired, smooth);
    this.camera.lookAt(target.x, target.y + 0.12, target.z);

    if (this.fx.shake > 0.001) {
      const s = this.fx.shake;
      this.camera.position.x += (Math.random() - 0.5) * s * 0.55;
      this.camera.position.y += (Math.random() - 0.5) * s * 0.45;
      this.camera.position.z += (Math.random() - 0.5) * s * 0.55;
    }

    let fov = 62;
    if (vehicle) fov = 62 + clamp(Math.abs(vehicle.speed) / vehicle.stats.maxSpeed, 0, 1) * 10;
    else if (aiming) fov = 50;
    this.camera.fov += (fov - this.camera.fov) * clamp(dt * 6, 0, 1);
    this.camera.updateProjectionMatrix();
  }

  addWanted(n, reason, force = false) {
    if (this.state !== 'playing' || !this.player.alive) return;
    const now = performance.now();
    if (!force && now < this.wantedCooldown) return;
    this.wantedCooldown = now + 2600;
    const before = this.wanted;
    this.wanted = clamp(this.wanted + n, 0, 5);
    if (this.wanted > before) {
      this.police.onWantedRaised();
      const stars = '★'.repeat(this.wanted);
      this.hud.notify(`수배 ${this.wanted}단계 ${stars}`, reason, 'police');
      this.hud.setWanted(this.wanted);
      this.audio.wanted();
    }
  }

  raiseWanted(n, reason, force = true) {
    if (this.state !== 'playing' || !this.player.alive) return;
    const before = this.wanted;
    this.wanted = clamp(Math.max(this.wanted, n), 0, 5);
    if (this.wanted !== before) {
      this.police.onWantedRaised();
      this.hud.setWanted(this.wanted);
      this.hud.notify(`수배 ${this.wanted}단계 ${'★'.repeat(this.wanted)}`, reason, 'police');
      this.audio.wanted();
    }
  }

  clearWanted() {
    if (this.wanted === 0) {
      this.missions?.onWantedCleared();
      return;
    }
    this.wanted = 0;
    this.hud.setWanted(0);
    this.police.resetEvasion();
    this.hud.notify('수배 해제', '경찰의 추격에서 벗어났습니다.', '');
    this.missions?.onWantedCleared();
  }

  onWantedCleared() {
    if (this.wanted === 0) return;
    this.wanted = 0;
    this.hud.setWanted(0);
    this.hud.notify('수배 해제', '경찰이 수색을 포기했습니다.', '');
    this.missions?.onWantedCleared();
  }

  addMoney(amount) {
    this.money = Math.max(0, this.money + amount);
    this.hud.setMoney(this.money);
  }

  notify(title, body, type) {
    this.hud.notify(title, body, type);
  }

  onGunshot(pos) {
    for (const p of this.peds) {
      if (!p.alive) continue;
      if (p.pos.distanceTo(pos) < 34) p.startle(pos, this, 0.8);
    }
    if (this.state === 'playing' && this.wanted === 0) {
      for (const p of this.peds) {
        if (!p.alive) continue;
        if (p.pos.distanceTo(pos) < 24 && !this.world.lineBlocked(p.pos.x, p.pos.z, pos.x, pos.z)) {
          this.addWanted(1, '목격자가 경찰에 신고했습니다.');
          break;
        }
      }
    }
  }

  onPlayerDeath() {
    if (this.state === 'wasted' || this.state === 'paused') return;
    this.state = 'wasted';
    this.input.mouseDown = false;
    this.input.touchFire = false;
    this.input.touchAimToggle = false;
    this.audio.stopEngine();
    this.radio.stop();
    this.audio.wasted();
    this.hud.setPrompt(null);
    this.hud.setWanted(0);
    this.wanted = 0;
    if (this.player.vehicle) {
      const v = this.player.vehicle;
      this.player.vehicle = null;
      v.exit();
    }
    this.police.onPlayerDeath();
    this.missions.onPlayerDeath();
    const wasted = document.getElementById('wasted');
    wasted.classList.remove('hidden');
    this.cameraPitch = 0.35;
    setTimeout(() => this.respawn(), 4400);
  }

  respawn() {
    const wasted = document.getElementById('wasted');
    wasted.classList.add('hidden');
    const spot = this.world.resolveCircle(HOSPITAL.x, HOSPITAL.z, 0.5);
    this.player.spawn(spot.x, spot.z, Math.PI);
    this.player.vehicle = null;
    this.cameraYaw = Math.PI + Math.PI;
    this.cameraPitch = 0.22;
    this.updateCamera(1, true);
    this.state = 'playing';
    this.lastArea = this.world.areaName(spot.x, spot.z).name;
    this.hud.showArea('LOS SANTOS MEDICAL CENTER', 'HOSPITAL DISTRICT');
    this.addMoney(-500);
    this.hud.subtitle('병원비 $500이 청구되었습니다. 다시 일어서세요.', 3.5);
    this.hud.notify('부활', '병원에서 깨어났습니다. 수배가 해제되었습니다.', '');
    this.police.resetEvasion();
    this.cameraPitch = 0.22;
    this.lastLookTime = 0;
    if (!this.input.touch && !this.input.locked) this.pause();
  }
}

const game = new Game();
window.__game = game;
game.boot().catch((err) => {
  console.error(err);
  const status = document.getElementById('load-status');
  if (status) status.textContent = 'FAILED TO LOAD — ' + err.message;
});
