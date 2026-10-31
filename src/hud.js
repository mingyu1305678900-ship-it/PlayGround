import * as THREE from 'three';
import { MAP_EXTENT } from './world.js';

const $ = (id) => document.getElementById(id);

const ICONS = {
  pistol: '<svg viewBox="0 0 64 40" width="30" height="20"><path fill="currentColor" d="M7 9h44v11H31l-3 4-4 12h-8l5-16H7z"/><path fill="currentColor" d="M45 6h13v6H45z"/></svg>',
  smg: '<svg viewBox="0 0 64 40" width="32" height="20"><path fill="currentColor" d="M5 12h34v9H26v5h-7v-5H5z"/><path fill="currentColor" d="M39 12h20v7h-6v5h-9v-5h-5z"/><path fill="currentColor" d="M20 24h7v10h-7z"/><path fill="currentColor" d="M46 19h5v8h-5z"/></svg>',
  shotgun: '<svg viewBox="0 0 64 40" width="34" height="20"><path fill="currentColor" d="M4 16h44v6H4z"/><path fill="currentColor" d="M48 15h12v8H48z"/><path fill="currentColor" d="M13 22h10v9H13z"/><path fill="currentColor" d="M23 22h5l-2 5h-5z"/></svg>',
};

export class HUD {
  constructor(game) {
    this.game = game;
    this.el = {
      hud: $('hud'),
      intro: $('intro'),
      money: $('money'),
      wanted: $('wanted'),
      radar: $('radar'),
      health: $('health-fill'),
      armor: $('armor-fill'),
      areaName: $('area-name'),
      objective: $('objective'),
      objectiveText: $('objective-text'),
      subtitle: $('subtitle'),
      notifications: $('notifications'),
      speedo: $('speedo'),
      speedNum: $('speedo-num'),
      speedFill: $('speedo-fill'),
      gear: $('gear'),
      weaponHud: $('weapon-hud'),
      weaponIcon: $('weapon-icon'),
      weaponName: $('weapon-name'),
      ammoMag: $('ammo-mag'),
      ammoReserve: $('ammo-reserve'),
      crosshair: $('crosshair'),
      hitmarker: $('hitmarker'),
      damage: $('damage-vignette'),
      areaBanner: $('area-banner'),
      bigMessage: $('big-message'),
      bigTitle: $('big-title'),
      bigSub: $('big-sub'),
      interact: $('interact-prompt'),
      interactText: $('interact-text'),
      radio: $('radio-popup'),
      radioName: $('radio-name'),
      radarN: document.querySelector('.radar-n'),
      touchHint: $('touch-hint'),
    };
    this.radarCtx = this.el.radar.getContext('2d');
    this.lastMoney = -1;
    this.lastWanted = -1;
    this.lastHealth = -1;
    this.areaTimer = 0;
    this.subtitleTimer = 0;
    this.areaNameTimer = 0;
    this.bigTimer = 0;
    this.radioTimer = 0;
    this.hitTime = 0;
    this.noteCount = 0;
    this._makeStars();
    this._lastRadar = 0;
  }

  _makeStars() {
    this.stars = [];
    for (let i = 0; i < 5; i++) {
      const s = document.createElement('span');
      s.className = 'star';
      s.textContent = '★';
      this.el.wanted.appendChild(s);
      this.stars.push(s);
    }
  }

  showHud(show) {
    this.el.hud.classList.toggle('hidden', !show);
  }

  setMoney(v, animate = true) {
    this.el.money.textContent = `$${Math.max(0, Math.round(v)).toLocaleString('en-US')}`;
    if (animate && this.lastMoney >= 0 && v !== this.lastMoney) {
      this.el.money.classList.add('bump');
      setTimeout(() => this.el.money.classList.remove('bump'), 180);
    }
    this.lastMoney = v;
  }

  setWeapon(w) {
    this.el.weaponName.textContent = w.name;
    this.el.weaponIcon.innerHTML = ICONS[w.icon] || ICONS.pistol;
    this.el.ammoMag.textContent = w.ammo;
    this.el.ammoReserve.textContent = w.reserveAmmo;
    this.el.weaponHud.classList.toggle('low', w.ammo <= Math.max(2, w.mag * 0.25));
  }

  setObjective(text, complete = false) {
    if (!text) {
      this.el.objective.classList.add('hidden');
      return;
    }
    this.el.objective.classList.remove('hidden');
    this.el.objective.classList.toggle('complete', complete);
    this.el.objectiveText.textContent = text;
  }

  subtitle(text, seconds = 3) {
    this.el.subtitle.textContent = text;
    this.el.subtitle.classList.remove('hidden');
    this.subtitleTimer = seconds;
  }

  notify(title, body, type = '') {
    const div = document.createElement('div');
    div.className = `note ${type ? type + '-note' : ''}`;
    div.innerHTML = `<div class="note-title">${title}</div><div class="note-body">${body}</div>`;
    this.el.notifications.appendChild(div);
    this.noteCount++;
    setTimeout(() => div.classList.add('out'), 4600);
    setTimeout(() => {
      div.remove();
      this.noteCount--;
    }, 5200);
    while (this.el.notifications.children.length > 4) this.el.notifications.firstChild.remove();
  }

  damageFlash() {
    this.el.damage.classList.add('show');
    clearTimeout(this._dmgT);
    this._dmgT = setTimeout(() => this.el.damage.classList.remove('show'), 110);
  }

  showHit(kill = false) {
    this.el.hitmarker.classList.remove('show');
    void this.el.hitmarker.offsetWidth;
    this.el.hitmarker.classList.add('show');
    if (kill) this.el.hitmarker.style.filter = 'sepia(1) saturate(6) hue-rotate(-20deg)';
    else this.el.hitmarker.style.filter = '';
  }

  setWanted(n, flashing = false) {
    this.el.wanted.classList.toggle('hidden', n <= 0);
    for (let i = 0; i < 5; i++) {
      this.stars[i].classList.toggle('on', i < n);
      this.stars[i].classList.toggle('flash', flashing && i < n);
    }
    if (n !== this.lastWanted && n > 0) {
      this.el.wanted.animate(
        [{ transform: 'scale(1.25)' }, { transform: 'scale(1)' }],
        { duration: 260, easing: 'ease-out' }
      );
    }
    this.lastWanted = n;
  }

  showArea(name, sub) {
    this.el.areaName.textContent = name;
    if (!this.el.areaBanner.classList.contains('show')) {
      this.el.areaBanner.innerHTML = `<div class="ab-name">${name}</div><div class="ab-sub">${sub}</div>`;
      this.el.areaBanner.classList.add('show');
      this.areaTimer = 3.2;
    }
  }

  hideAreaBanner() {
    this.el.areaBanner.classList.remove('show');
  }

  showBig(title, sub, cls = '', seconds = 4) {
    this.el.bigTitle.textContent = title;
    this.el.bigTitle.className = cls;
    this.el.bigSub.textContent = sub || '';
    this.el.bigMessage.classList.remove('hidden');
    this.bigTimer = seconds;
  }

  hideBig() {
    this.el.bigMessage.classList.add('hidden');
  }

  showRadio(name) {
    this.el.radioName.textContent = name;
    this.el.radio.classList.remove('hidden');
    this.radioTimer = 3.2;
  }

  setPrompt(text) {
    if (!text) {
      this.el.interact.classList.add('hidden');
    } else {
      this.el.interact.classList.remove('hidden');
      this.el.interactText.textContent = text;
    }
  }

  setArea(name) {
    this.el.areaName.textContent = name;
  }

  update(dt, game) {
    const player = game.player;
    this.setMoney(game.money);
    this.setWanted(game.wanted, game.police?.evading);
    this.el.health.style.width = `${Math.max(0, Math.min(100, player.health))}%`;
    this.el.armor.style.width = `${Math.max(0, Math.min(100, player.armor))}%`;

    if (this.subtitleTimer > 0) {
      this.subtitleTimer -= dt;
      if (this.subtitleTimer <= 0) this.el.subtitle.classList.add('hidden');
    }
    if (this.areaTimer > 0) {
      this.areaTimer -= dt;
      if (this.areaTimer <= 0) this.hideAreaBanner();
    }
    if (this.bigTimer > 0) {
      this.bigTimer -= dt;
      if (this.bigTimer <= 0) this.hideBig();
    }
    if (this.radioTimer > 0) {
      this.radioTimer -= dt;
      if (this.radioTimer <= 0) this.el.radio.classList.add('hidden');
    }

    const v = player.vehicle;
    if (v) {
      this.el.speedo.classList.remove('hidden');
      const kmh = Math.round(Math.abs(v.speed) * 3.6);
      this.el.speedNum.textContent = kmh;
      this.el.speedFill.style.width = `${Math.min(100, (Math.abs(v.speed) / v.stats.maxSpeed) * 100)}%`;
      this.el.gear.textContent = v.speed < -0.5 ? 'R' : v.speed > 25 ? 'D' : 'D';
      this.el.weaponHud.style.opacity = '0.45';
    } else {
      this.el.speedo.classList.add('hidden');
      this.el.weaponHud.style.opacity = '1';
      if (player.weapon) {
        this.el.ammoMag.textContent = player.weapon.ammo;
        this.el.ammoReserve.textContent = player.weapon.reserveAmmo;
        this.el.weaponHud.classList.toggle('low', player.weapon.ammo <= Math.max(2, player.weapon.mag * 0.25));
      }
    }

    // crosshair
    const showCross = !v && !player.isDead && game.state === 'playing';
    this.el.crosshair.classList.toggle('hidden', !showCross);
    const spread = player.sprinting || player.moveSpeed > 4 ? true : !player.aiming;
    this.el.crosshair.classList.toggle('wide', spread);
    if (game.combat) {
      // aim assist tint when a target is near the reticle
      const origin = game.camera.position.clone();
      const dir = game.camera.getWorldDirection(origin.clone());
      let hot = false;
      for (const e of game.enemies) {
        if (!e.alive) continue;
        const d = new THREE.Vector3(e.pos.x - origin.x, 1.1 - origin.y, e.pos.z - origin.z).normalize();
        if (d.dot(dir) > 0.985 && e.pos.distanceTo(player.pos) < 45) { hot = true; break; }
      }
      this.el.crosshair.classList.toggle('hit', hot);
    }

    this._drawRadar(game, v);
  }

  _drawRadar(game, vehicle) {
    const ctx = this.radarCtx;
    const size = 420;
    const cx = size / 2;
    const cy = size / 2;
    const player = game.player;
    const world = game.world;
    const px = player.pos.x;
    const pz = player.pos.z;
    const yaw = vehicle ? vehicle.heading + Math.PI : game.cameraYaw;
    const viewRadius = vehicle ? 145 : 105;
    const s = (size / 2 - 8) / viewRadius;

    ctx.clearRect(0, 0, size, size);
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, size / 2 - 3, 0, Math.PI * 2);
    ctx.clip();
    ctx.fillStyle = '#0a1411';
    ctx.fillRect(0, 0, size, size);

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(yaw);
    const k = s / world.mapScale;
    ctx.scale(k, k);
    ctx.drawImage(world.mapCanvas, -(px + MAP_EXTENT) * world.mapScale, -(pz + MAP_EXTENT) * world.mapScale);
    ctx.restore();

    // vignette
    const grad = ctx.createRadialGradient(cx, cy, size * 0.22, cx, cy, size / 2);
    grad.addColorStop(0, 'rgba(0,0,0,0)');
    grad.addColorStop(1, 'rgba(0,0,0,0.55)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);

    // blips
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(yaw);
    const blip = (wx, wz) => ({ x: (wx - px) * s, y: (wz - pz) * s });
    const inRange = (wx, wz) => Math.hypot(wx - px, wz - pz) < viewRadius * 1.02;

    // traffic / parked cars
    ctx.fillStyle = 'rgba(210,220,218,0.42)';
    for (const v of game.vehicles.vehicles) {
      if (v === vehicle) continue;
      if (!inRange(v.pos.x, v.pos.z)) continue;
      const b = blip(v.pos.x, v.pos.z);
      ctx.beginPath();
      ctx.arc(b.x, b.y, 2.4, 0, Math.PI * 2);
      ctx.fill();
    }

    // cops / enemies
    const t = performance.now() / 1000;
    for (const e of game.enemies) {
      if (!e.alive || !inRange(e.pos.x, e.pos.z)) continue;
      const b = blip(e.pos.x, e.pos.z);
      const pulse = 0.65 + Math.sin(t * 7) * 0.35;
      ctx.fillStyle = e.kind === 'cop' ? (Math.sin(t * 6) > 0 ? '#ff4238' : '#4d8bff') : '#ff4a3d';
      ctx.globalAlpha = pulse;
      ctx.beginPath();
      ctx.arc(b.x, b.y, 5.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    }
    for (const v of game.vehicles.vehicles) {
      if (!v.ai || v.ai.type !== 'chase') continue;
      if (!inRange(v.pos.x, v.pos.z)) continue;
      const b = blip(v.pos.x, v.pos.z);
      ctx.fillStyle = Math.sin(t * 7) > 0 ? '#ff3d34' : '#3d7bff';
      ctx.beginPath();
      ctx.arc(b.x, b.y, 4.6, 0, Math.PI * 2);
      ctx.fill();
    }

    // mission marker
    const marker = game.missions?.activeMarker;
    if (marker && inRange(marker.x, marker.z)) {
      const b = blip(marker.x, marker.z);
      const pulse = 6 + Math.sin(t * 3) * 1.4;
      ctx.fillStyle = '#f4c542';
      ctx.globalAlpha = 0.28;
      ctx.beginPath(); ctx.arc(b.x, b.y, pulse * 2.2, 0, Math.PI * 2); ctx.fill();
      ctx.globalAlpha = 1;
      ctx.beginPath();
      ctx.moveTo(b.x, b.y - pulse);
      ctx.lineTo(b.x + pulse, b.y);
      ctx.lineTo(b.x, b.y + pulse);
      ctx.lineTo(b.x - pulse, b.y);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = 'rgba(0,0,0,0.65)';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    // mission target car
    const target = game.missions?.targetVehicle;
    if (target && target !== vehicle && inRange(target.pos.x, target.pos.z)) {
      const b = blip(target.pos.x, target.pos.z);
      ctx.strokeStyle = '#6ee7ff';
      ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.arc(b.x, b.y, 5, 0, Math.PI * 2); ctx.stroke();
    }

    // personal car when on foot
    if (!vehicle && game.player.lastVehicle && inRange(game.player.lastVehicle.pos.x, game.player.lastVehicle.pos.z)) {
      const b = blip(game.player.lastVehicle.pos.x, game.player.lastVehicle.pos.z);
      ctx.fillStyle = '#6ee7ff';
      ctx.beginPath(); ctx.arc(b.x, b.y, 4, 0, Math.PI * 2); ctx.fill();
    }

    ctx.restore();

    // player heading cone
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(yaw);
    const fov = ctx.createRadialGradient(0, 0, 2, 0, 0, viewRadius * s * 0.55);
    fov.addColorStop(0, 'rgba(255,255,255,0.16)');
    fov.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = fov;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, viewRadius * s * 0.55, -Math.PI / 2 - 0.55, -Math.PI / 2 + 0.55);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    ctx.restore();

    // north marker position
    if (this.el.radarN) {
      const nx = 50 + Math.sin(yaw) * 43;
      const ny = 50 - Math.cos(yaw) * 43;
      this.el.radarN.style.left = `${nx}%`;
      this.el.radarN.style.top = `${ny}%`;
    }
  }
}
