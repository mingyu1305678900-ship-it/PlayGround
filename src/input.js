const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

export class Input {
  constructor(game) {
    this.game = game;
    this.keys = new Set();
    this.moveX = 0;
    this.moveY = 0;
    this.mouseDown = false;
    this.aim = false;
    this.jump = false;
    this.sprint = false;
    this.brake = false;
    this.lookX = 0;
    this.lookY = 0;
    this.locked = false;
    this.touch = window.matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window;
    this.touchAimToggle = false;
    this.touchFire = false;
    this.touchSprint = false;
    this.touchBrake = false;
    this.stickPointer = null;
    this.stickCenter = { x: 0, y: 0 };
    this.lookPointer = null;
    this.lastLook = { x: 0, y: 0 };
    this.sensitivity = this.touch ? 0.0045 : 0.0022;
    this._bindKeyboard();
    this._bindMouse();
    this._bindTouch();
  }

  get forward() { return this.moveY > 0.15; }
  get back() { return this.moveY < -0.15; }
  get left() { return this.moveX < -0.15; }
  get right() { return this.moveX > 0.15; }
  get firing() { return this.mouseDown || this.touchFire; }
  get aiming() { return this.aim || (this.touchAimToggle && !this.game.player?.inVehicle); }

  _bindKeyboard() {
    window.addEventListener('keydown', (e) => {
      if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(e.code)) e.preventDefault();
      if (e.repeat) {
        this.keys.add(e.code);
        return;
      }
      this.keys.add(e.code);
      const game = this.game;
      if (!game || game.state !== 'playing') return;
      switch (e.code) {
        case 'KeyF':
        case 'KeyE':
          if (game.player.inVehicle) game.player.exitVehicle(game);
          else game.player.tryEnterVehicle(game, true);
          break;
        case 'KeyR':
          game.player.reload(game);
          break;
        case 'Digit1':
          game.player.switchWeapon(0, game);
          break;
        case 'Digit2':
          game.player.switchWeapon(1, game);
          break;
        case 'Digit3':
          game.player.switchWeapon(2, game);
          break;
        case 'KeyH':
          if (game.player.inVehicle) game.audio.horn();
          break;
        case 'KeyB':
          if (game.player.inVehicle && game.radio) game.radio.next();
          break;
        case 'Space':
          this.jump = true;
          break;
        case 'Escape':
          if (!this.touch && this.locked) document.exitPointerLock();
          else game.pause();
          break;
        default:
          break;
      }
    });
    window.addEventListener('keyup', (e) => this.keys.delete(e.code));
    window.addEventListener('blur', () => {
      this.keys.clear();
      this.mouseDown = false;
      this.aim = false;
    });
  }

  _bindMouse() {
    const canvas = this.game.canvas;
    canvas.addEventListener('mousedown', (e) => {
      if (this.game.state !== 'playing') return;
      if (!this.touch && !this.locked) {
        canvas.requestPointerLock?.();
        return;
      }
      if (e.button === 0) this.mouseDown = true;
      if (e.button === 2) this.aim = true;
    });
    window.addEventListener('mouseup', (e) => {
      if (e.button === 0) this.mouseDown = false;
      if (e.button === 2) this.aim = false;
    });
    canvas.addEventListener('contextmenu', (e) => e.preventDefault());
    document.addEventListener('pointerlockchange', () => {
      this.locked = document.pointerLockElement === canvas;
      if (!this.locked && this.game.state === 'playing' && !this.touch) this.game.pause();
    });
    document.addEventListener('mousemove', (e) => {
      if (!this.locked) return;
      this.lookX += e.movementX;
      this.lookY += e.movementY;
    });
  }

  _bindTouch() {
    if (!this.touch) return;
    const stickZone = document.getElementById('stick-zone');
    const knob = document.getElementById('stick-knob');
    const lookZone = document.getElementById('look-zone');

    if (stickZone) {
      const resetStick = () => {
        this.stickPointer = null;
        this.moveX = 0;
        this.moveY = 0;
        if (knob) knob.style.transform = 'translate(0px, 0px)';
      };
      stickZone.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        this.stickPointer = e.pointerId;
        const r = stickZone.getBoundingClientRect();
        this.stickCenter = { x: r.left + r.width / 2, y: r.top + r.height / 2 };
        stickZone.setPointerCapture(e.pointerId);
        this._moveStick(e.clientX, e.clientY, knob);
      });
      stickZone.addEventListener('pointermove', (e) => {
        if (e.pointerId !== this.stickPointer) return;
        this._moveStick(e.clientX, e.clientY, knob);
      });
      stickZone.addEventListener('pointerup', (e) => { if (e.pointerId === this.stickPointer) resetStick(); });
      stickZone.addEventListener('pointercancel', (e) => { if (e.pointerId === this.stickPointer) resetStick(); });
    }

    if (lookZone) {
      lookZone.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        this.lookPointer = e.pointerId;
        this.lastLook = { x: e.clientX, y: e.clientY };
        lookZone.setPointerCapture(e.pointerId);
      });
      lookZone.addEventListener('pointermove', (e) => {
        if (e.pointerId !== this.lookPointer) return;
        const dx = e.clientX - this.lastLook.x;
        const dy = e.clientY - this.lastLook.y;
        this.lastLook = { x: e.clientX, y: e.clientY };
        this.lookX += dx * 1.1;
        this.lookY += dy * 1.1;
      });
      const end = (e) => { if (e.pointerId === this.lookPointer) this.lookPointer = null; };
      lookZone.addEventListener('pointerup', end);
      lookZone.addEventListener('pointercancel', end);
    }

    const hold = (id, on, off) => {
      const el = document.getElementById(id);
      if (!el) return;
      el.addEventListener('pointerdown', (e) => { e.preventDefault(); on(); el.setPointerCapture(e.pointerId); });
      el.addEventListener('pointerup', (e) => { e.preventDefault(); off(); });
      el.addEventListener('pointercancel', () => off());
    };
    hold('btn-fire', () => { this.touchFire = true; }, () => { this.touchFire = false; });
    hold('btn-sprint', () => { this.touchSprint = true; this.sprint = true; }, () => { this.touchSprint = false; this.sprint = false; });
    hold('btn-brake', () => { this.touchBrake = true; }, () => { this.touchBrake = false; });
    hold('btn-aim', () => { this.touchAimToggle = !this.touchAimToggle; }, () => {});

    const tap = (id, fn) => {
      const el = document.getElementById(id);
      if (!el) return;
      el.addEventListener('pointerdown', (e) => { e.preventDefault(); fn(); });
    };
    tap('btn-jump', () => { this.jump = true; });
    tap('btn-enter', () => {
      if (this.game.player.inVehicle) this.game.player.exitVehicle(this.game);
      else this.game.player.tryEnterVehicle(this.game, true);
    });
    tap('btn-reload', () => this.game.player.reload(this.game));
    tap('weapon-hud', () => {
      const player = this.game.player;
      if (!player || player.inVehicle) return;
      player.switchWeapon((player.weaponIndex + 1) % player.weapons.length, this.game);
    });
  }

  _moveStick(x, y, knob) {
    const dx = x - this.stickCenter.x;
    const dy = y - this.stickCenter.y;
    const max = 48;
    const len = Math.hypot(dx, dy);
    const k = len > max ? max / len : 1;
    const nx = dx * k;
    const ny = dy * k;
    this.moveX = clamp(nx / max, -1, 1);
    this.moveY = clamp(-ny / max, -1, 1);
    if (knob) knob.style.transform = `translate(${nx}px, ${ny}px)`;
  }

  update() {
    if (this.touch) {
      // touch axes already set by the stick
      this.moveX = clamp(this.moveX, -1, 1);
      this.moveY = clamp(this.moveY, -1, 1);
      this.sprint = this.touchSprint;
      this.brake = this.touchBrake;
    } else {
      this.moveX = (this.keys.has('KeyD') || this.keys.has('ArrowRight') ? 1 : 0) - (this.keys.has('KeyA') || this.keys.has('ArrowLeft') ? 1 : 0);
      this.moveY = (this.keys.has('KeyW') || this.keys.has('ArrowUp') ? 1 : 0) - (this.keys.has('KeyS') || this.keys.has('ArrowDown') ? 1 : 0);
      this.sprint = this.keys.has('ShiftLeft') || this.keys.has('ShiftRight');
      this.aim = this.aim || this.keys.has('ShiftRight') && false;
      this.brake = this.keys.has('Space');
    }
  }

  consumeLook() {
    const out = { x: this.lookX, y: this.lookY };
    this.lookX = 0;
    this.lookY = 0;
    return out;
  }

  postUpdate() {
    this.jump = false;
  }
}
