const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

export class AudioSystem {
  constructor(game) {
    this.game = game;
    this.ctx = null;
    this.ready = false;
    this.master = null;
    this.noiseBuffer = null;
    this.engine = null;
    this.siren = null;
    this.sirenPhase = 0;
    this.lastFootstep = 0;
    this.enemyGunToggle = false;
  }

  init() {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') this.ctx.resume();
      return;
    }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    this.ctx = new AC();
    this.master = this.ctx.createGain();
    this.master.gain.value = 0.62;
    this.master.connect(this.ctx.destination);

    const len = this.ctx.sampleRate * 1.2;
    const buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
    this.noiseBuffer = buf;
    this._buildEngine();
    this._buildSiren();
    this._buildAmbient();
    this.ready = true;
  }

  _noise(duration, gainValue, filterFreq, type = 'lowpass', pan = 0) {
    if (!this.ready) return;
    const t = this.ctx.currentTime;
    const src = this.ctx.createBufferSource();
    src.buffer = this.noiseBuffer;
    src.loop = true;
    const filter = this.ctx.createBiquadFilter();
    filter.type = type;
    filter.frequency.value = filterFreq;
    filter.Q.value = 0.8;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(Math.max(0.0002, gainValue), t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + duration);
    src.connect(filter).connect(g);
    let node = g;
    if (pan !== 0) {
      const p = this.ctx.createStereoPanner();
      p.pan.value = clamp(pan, -1, 1);
      g.connect(p);
      node = p;
    }
    node.connect(this.master);
    src.start(t);
    src.stop(t + duration + 0.05);
  }

  _tone(type, freq, duration, gainValue, opts = {}) {
    if (!this.ready) return;
    const t = this.ctx.currentTime + (opts.delay || 0);
    const osc = this.ctx.createOscillator();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    if (opts.slideTo) osc.frequency.exponentialRampToValueAtTime(Math.max(20, opts.slideTo), t + duration);
    const g = this.ctx.createGain();
    const target = Math.max(0.0002, gainValue);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(target, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + duration);
    const filter = this.ctx.createBiquadFilter();
    filter.type = opts.filter || 'lowpass';
    filter.frequency.value = opts.cutoff || 1400;
    osc.connect(filter).connect(g).connect(this.master);
    osc.start(t);
    osc.stop(t + duration + 0.03);
  }

  _panFor(pos) {
    if (!pos || !this.game?.player) return 0;
    const cam = this.game.camera;
    const right = { x: Math.cos(this.game.cameraYaw), z: -Math.sin(this.game.cameraYaw) };
    const dx = pos.x - cam.position.x;
    const dz = pos.z - cam.position.z;
    const d = Math.hypot(dx, dz);
    if (d < 0.001) return 0;
    return ((dx * right.x + dz * right.z) / d) * 0.7;
  }

  _buildEngine() {
    const ctx = this.ctx;
    const gain = ctx.createGain();
    gain.gain.value = 0;
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 700;
    filter.Q.value = 3;
    gain.connect(filter).connect(this.master);
    const osc1 = ctx.createOscillator();
    osc1.type = 'sawtooth';
    osc1.frequency.value = 55;
    const osc2 = ctx.createOscillator();
    osc2.type = 'square';
    osc2.frequency.value = 27.5;
    const g2 = ctx.createGain();
    g2.gain.value = 0.4;
    osc1.connect(gain);
    osc2.connect(g2).connect(gain);
    osc1.start();
    osc2.start();
    this.engine = { gain, filter, osc1, osc2 };
  }

  _buildSiren() {
    const ctx = this.ctx;
    const osc = ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.value = 720;
    const gain = ctx.createGain();
    gain.gain.value = 0;
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 900;
    filter.Q.value = 2;
    osc.connect(filter).connect(gain).connect(this.master);
    osc.start();
    this.siren = { osc, gain };
  }

  _buildAmbient() {
    const ctx = this.ctx;
    const src = ctx.createBufferSource();
    src.buffer = this.noiseBuffer;
    src.loop = true;
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 260;
    const gain = ctx.createGain();
    gain.gain.value = 0.018;
    src.connect(filter).connect(gain).connect(this.master);
    src.start();
  }

  startEngine() {
    if (!this.ready) return;
    this.engine.gain.gain.cancelScheduledValues(this.ctx.currentTime);
    this.engine.gain.gain.setTargetAtTime(0.05, this.ctx.currentTime, 0.1);
  }

  stopEngine() {
    if (!this.ready) return;
    this.engine.gain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.12);
  }

  updateEngine(rpm, throttle) {
    if (!this.ready) return;
    const t = this.ctx.currentTime;
    const f = 48 + rpm * 155;
    this.engine.osc1.frequency.setTargetAtTime(f, t, 0.05);
    this.engine.osc2.frequency.setTargetAtTime(f * 0.5, t, 0.05);
    this.engine.filter.frequency.setTargetAtTime(420 + rpm * 1100, t, 0.08);
    this.engine.gain.gain.setTargetAtTime(0.028 + rpm * 0.05 + Math.max(0, throttle) * 0.012, t, 0.08);
  }

  updateSiren(distance, active) {
    if (!this.ready) return;
    const t = this.ctx.currentTime;
    if (!active) {
      this.siren.gain.gain.setTargetAtTime(0, t, 0.2);
      return;
    }
    this.sirenPhase += 0.016;
    const f = 640 + Math.abs(Math.sin(this.sirenPhase * 2.4)) * 420;
    this.siren.osc.frequency.setTargetAtTime(f, t, 0.03);
    this.siren.gain.gain.setTargetAtTime(clamp(1 - distance / 130, 0, 1) * 0.035, t, 0.1);
  }

  gunshot(id) {
    if (!this.ready) return;
    if (id === 'shotgun') {
      this._noise(0.34, 0.4, 900, 'lowpass');
      this._tone('sine', 120, 0.22, 0.24, { slideTo: 45, cutoff: 400 });
      this._noise(0.1, 0.2, 3000, 'highpass');
    } else if (id === 'smg') {
      this._noise(0.09, 0.24, 2200, 'lowpass');
      this._tone('square', 220, 0.06, 0.1, { slideTo: 90, cutoff: 900 });
    } else {
      this._noise(0.16, 0.28, 1600, 'lowpass');
      this._tone('sine', 180, 0.12, 0.16, { slideTo: 70, cutoff: 600 });
    }
  }

  enemyShot(pos) {
    if (!this.ready) return;
    const d = this.game.player.pos.distanceTo(pos);
    const vol = clamp(1 - d / 90, 0.05, 1);
    const pan = this._panFor(pos);
    this.enemyGunToggle = !this.enemyGunToggle;
    if (this.enemyGunToggle) this._noise(0.1, 0.16 * vol, 1400, 'lowpass', pan);
    else this._tone('square', 160, 0.08, 0.05 * vol, { slideTo: 80, cutoff: 700, delay: 0 });
  }

  explosion(pos) {
    if (!this.ready) return;
    const d = this.game.player.pos.distanceTo(pos);
    const vol = clamp(1 - d / 130, 0.15, 1);
    const pan = this._panFor(pos);
    this._noise(0.9, 0.6 * vol, 500, 'lowpass', pan);
    this._tone('sine', 80, 1.0, 0.35 * vol, { slideTo: 24, cutoff: 300 });
    this._tone('sawtooth', 140, 0.4, 0.12 * vol, { slideTo: 40, cutoff: 800 });
  }

  crash(intensity) {
    if (!this.ready) return;
    const v = clamp(intensity / 20, 0.08, 0.5);
    this._noise(0.25, v, 1200, 'bandpass');
    this._tone('square', 95, 0.14, v * 0.3, { slideTo: 50, cutoff: 500 });
  }

  thud(pos) {
    if (!this.ready) return;
    const d = this.game.player.pos.distanceTo(pos);
    this._noise(0.18, clamp(1 - d / 40, 0, 1) * 0.2, 300);
  }

  footstep(run) {
    if (!this.ready) return;
    const now = performance.now();
    if (now - this.lastFootstep < 180) return;
    this.lastFootstep = now;
    this._noise(0.07, run ? 0.035 : 0.022, run ? 900 : 600, 'bandpass');
  }

  setFootstepsMoving() {}

  jump() {
    this._tone('sine', 200, 0.12, 0.02, { slideTo: 120 });
  }

  reload() {
    if (!this.ready) return;
    this._tone('square', 700, 0.03, 0.05, { cutoff: 2000 });
    setTimeout(() => this._tone('square', 480, 0.04, 0.05, { cutoff: 1800 }), 130);
    setTimeout(() => this._tone('square', 900, 0.03, 0.04, { cutoff: 2200 }), 320);
  }

  click() {
    this._tone('square', 1100, 0.025, 0.03, { cutoff: 2500 });
  }

  horn() {
    if (!this.ready) return;
    const t = this.ctx.currentTime;
    for (const f of [330, 415]) {
      const osc = this.ctx.createOscillator();
      osc.type = 'square';
      osc.frequency.value = f;
      const g = this.ctx.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.045, t + 0.02);
      g.gain.setValueAtTime(0.045, t + 0.35);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.5);
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 1200;
      osc.connect(filter).connect(g).connect(this.master);
      osc.start(t);
      osc.stop(t + 0.55);
    }
  }

  pedScream(pos) {
    if (!this.ready) return;
    const d = this.game.player.pos.distanceTo(pos);
    const vol = clamp(1 - d / 45, 0, 1);
    this._tone('sawtooth', 700 + Math.random() * 240, 0.18, 0.018 * vol, { slideTo: 420, cutoff: 1400 });
  }

  playerHit() {
    if (!this.ready) return;
    this._noise(0.16, 0.12, 500);
    this._tone('sine', 90, 0.2, 0.08, { slideTo: 45 });
  }

  wanted() {
    if (!this.ready) return;
    this._tone('sawtooth', 560, 0.12, 0.04, { slideTo: 820, cutoff: 1400 });
    setTimeout(() => this._tone('sawtooth', 820, 0.18, 0.04, { slideTo: 560, cutoff: 1400 }), 130);
  }

  missionPassed() {
    if (!this.ready) return;
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((f, i) => this._tone('triangle', f, 0.32, 0.06, { delay: i * 0.13, cutoff: 3000 }));
  }

  missionFailed() {
    if (!this.ready) return;
    const notes = [392, 349.23, 261.63];
    notes.forEach((f, i) => this._tone('sawtooth', f, 0.35, 0.045, { delay: i * 0.16, cutoff: 1200 }));
  }

  wasted() {
    if (!this.ready) return;
    this._tone('sine', 120, 1.6, 0.1, { slideTo: 35, cutoff: 300 });
    this._noise(1.2, 0.08, 300);
  }

  update(dt) {
    if (this.radio) this.radio.update(dt);
  }
}

/* ------------------------------------------------------------------ */
/* Radio - tiny procedural stations                                    */
/* ------------------------------------------------------------------ */

const midi = (n) => 440 * Math.pow(2, (n - 69) / 12);

const STATIONS = [
  {
    name: 'LOS SANTOS ROCK RADIO',
    bpm: 112,
    bass: [0, 0, 5, 0, 7, 0, 5, 3, 0, 0, 5, 0, 8, 7, 5, 3],
    lead: [12, null, null, 15, null, 12, null, null, 17, null, 15, null, 12, null, 10, null],
    root: 33,
    mode: 'rock',
  },
  {
    name: 'NON-STOP POP',
    bpm: 118,
    bass: [0, 0, 7, 7, 5, 5, 3, 3, 0, 0, 7, 7, 10, 10, 8, 7],
    lead: [24, 19, 22, 26, 19, 22, 24, 27, 26, 22, 19, 24, 27, 24, 22, 19],
    root: 45,
    mode: 'pop',
  },
  {
    name: 'WEST COAST CLASSICS',
    bpm: 92,
    bass: [0, null, 0, 7, null, 5, null, 3, 0, null, 0, 7, null, 10, 8, 7],
    lead: [12, null, 15, null, 19, null, 15, null, 12, null, 17, null, 15, null, 10, null],
    root: 36,
    mode: 'classic',
  },
];

export class Radio {
  constructor(audio) {
    this.audio = audio;
    this.enabled = false;
    this.station = 0;
    this.step = 0;
    this.nextTime = 0;
    this.ctx = null;
    this.bus = null;
    this.timer = 0;
  }

  _ensure() {
    if (!this.audio.ready) return false;
    if (!this.bus) {
      const ctx = this.audio.ctx;
      this.ctx = ctx;
      this.bus = ctx.createGain();
      this.bus.gain.value = 0;
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 2600;
      this.bus.connect(filter).connect(this.audio.master);
    }
    return true;
  }

  start() {
    if (!this._ensure()) return;
    this.enabled = true;
    this.step = 0;
    this.nextTime = this.ctx.currentTime + 0.08;
    this.bus.gain.setTargetAtTime(0.18, this.ctx.currentTime, 0.4);
    this.audio.game.hud.showRadio(STATIONS[this.station].name);
  }

  stop() {
    if (!this.bus) return;
    this.enabled = false;
    this.bus.gain.setTargetAtTime(0, this.ctx.currentTime, 0.25);
  }

  next() {
    if (!this.enabled) return;
    this.station = (this.station + 1) % STATIONS.length;
    this.step = 0;
    this.nextTime = this.ctx.currentTime + 0.05;
    this.audio.game.hud.showRadio(STATIONS[this.station].name);
  }

  _note(type, freq, time, dur, vol, cutoff = 1800) {
    const ctx = this.ctx;
    const osc = ctx.createOscillator();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, time);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, time);
    g.gain.exponentialRampToValueAtTime(vol, time + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, time + dur);
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = cutoff;
    osc.connect(filter).connect(g).connect(this.bus);
    osc.start(time);
    osc.stop(time + dur + 0.02);
  }

  _drum(time, kind) {
    const ctx = this.ctx;
    if (kind === 'kick') {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(130, time);
      osc.frequency.exponentialRampToValueAtTime(42, time + 0.14);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.5, time);
      g.gain.exponentialRampToValueAtTime(0.0001, time + 0.18);
      osc.connect(g).connect(this.bus);
      osc.start(time);
      osc.stop(time + 0.2);
      return;
    }
    const src = ctx.createBufferSource();
    src.buffer = this.audio.noiseBuffer;
    const filter = ctx.createBiquadFilter();
    filter.type = kind === 'snare' ? 'bandpass' : 'highpass';
    filter.frequency.value = kind === 'snare' ? 1800 : 7000;
    const g = ctx.createGain();
    g.gain.setValueAtTime(kind === 'snare' ? 0.22 : 0.08, time);
    g.gain.exponentialRampToValueAtTime(0.0001, time + (kind === 'snare' ? 0.13 : 0.04));
    src.connect(filter).connect(g).connect(this.bus);
    src.start(time);
    src.stop(time + 0.16);
  }

  update() {
    if (!this.enabled || !this.ctx) return;
    const st = STATIONS[this.station];
    const stepDur = 60 / st.bpm / 2;
    const now = this.ctx.currentTime;
    if (this.nextTime < now) this.nextTime = now + 0.05;
    while (this.nextTime < now + 0.25) {
      const s = this.step;
      const bassNote = st.bass[s];
      if (bassNote !== null && bassNote !== undefined) {
        this._note('sawtooth', midi(st.root + bassNote), this.nextTime, stepDur * 0.9, 0.12, 700);
        this._note('sine', midi(st.root + bassNote - 12), this.nextTime, stepDur * 0.9, 0.1, 500);
      }
      const lead = st.lead[s];
      if (lead !== null && lead !== undefined) {
        this._note(st.mode === 'pop' ? 'square' : 'triangle', midi(st.root + lead), this.nextTime, stepDur * 0.7, st.mode === 'pop' ? 0.035 : 0.05, 2400);
      }
      if (st.mode === 'rock') {
        if (s % 4 === 0) this._drum(this.nextTime, 'kick');
        if (s % 4 === 2) this._drum(this.nextTime, 'snare');
        if (s % 2 === 0) this._drum(this.nextTime, 'hat');
        if (s % 8 === 0) {
          this._note('sawtooth', midi(st.root + 12 + st.bass[s]), this.nextTime, stepDur * 3.6, 0.028, 1200);
          this._note('sawtooth', midi(st.root + 19 + st.bass[s]), this.nextTime, stepDur * 3.6, 0.022, 1200);
        }
      } else if (st.mode === 'pop') {
        if (s % 4 === 0) this._drum(this.nextTime, 'kick');
        if (s % 4 === 2) this._drum(this.nextTime, 'snare');
        if (s % 2 === 0) this._drum(this.nextTime, 'hat');
      } else {
        if (s === 0 || s === 3 || s === 8 || s === 10) this._drum(this.nextTime, 'kick');
        if (s === 4 || s === 12) this._drum(this.nextTime, 'snare');
        if (s % 2 === 0) this._drum(this.nextTime, 'hat');
      }
      this.nextTime += stepDur;
      this.step = (s + 1) % 16;
    }
  }
}
