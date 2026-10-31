/* A tiny generative soundtrack — soft piano-ish arpeggios, pads and rain.
   Everything is synthesized at runtime with the Web Audio API. */
(() => {
  'use strict';

  const MOODS = {
    night: { root: 220, chord: [0, 3, 7, 10], scale: [0, 3, 5, 7, 10], bpm: 62, pad: 0.035, rain: 0.9 },
    cafe: { root: 196, chord: [0, 4, 7, 11], scale: [0, 2, 4, 7, 9], bpm: 70, pad: 0.03, rain: 0.25 },
    romantic: { root: 261.63, chord: [0, 4, 7, 11], scale: [0, 2, 4, 7, 9], bpm: 68, pad: 0.04, rain: 0 },
    festival: { root: 293.66, chord: [0, 4, 7, 11], scale: [0, 2, 4, 7, 9], bpm: 78, pad: 0.028, rain: 0 },
    sad: { root: 174.61, chord: [0, 3, 7, 10], scale: [0, 2, 3, 7, 10], bpm: 54, pad: 0.038, rain: 0.55 },
    dawn: { root: 246.94, chord: [0, 4, 7, 11], scale: [0, 2, 4, 6, 9], bpm: 60, pad: 0.042, rain: 0 },
    warm: { root: 233.08, chord: [0, 4, 7, 11], scale: [0, 2, 4, 7, 9], bpm: 66, pad: 0.032, rain: 0 }
  };

  const engine = {
    ctx: null,
    master: null,
    musicBus: null,
    sfxBus: null,
    rainGain: null,
    rainSource: null,
    delay: null,
    timer: null,
    step: 0,
    mood: 'night',
    muted: false,
    started: false,

    ensure() {
      if (this.ctx) return true;
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return false;
      this.ctx = new Ctx();
      const ctx = this.ctx;

      const comp = ctx.createDynamicsCompressor();
      comp.threshold.value = -22;
      comp.knee.value = 24;
      comp.ratio.value = 4;
      comp.attack.value = 0.01;
      comp.release.value = 0.3;
      comp.connect(ctx.destination);

      this.master = ctx.createGain();
      this.master.gain.value = this.muted ? 0 : 0.9;
      this.master.connect(comp);

      this.musicBus = ctx.createGain();
      this.musicBus.gain.value = 0.22;
      this.musicBus.connect(this.master);

      this.sfxBus = ctx.createGain();
      this.sfxBus.gain.value = 0.22;
      this.sfxBus.connect(this.master);

      const delay = ctx.createDelay(1.5);
      delay.delayTime.value = 0.44;
      const fb = ctx.createGain();
      fb.gain.value = 0.3;
      const wet = ctx.createGain();
      wet.gain.value = 0.32;
      const tone = ctx.createBiquadFilter();
      tone.type = 'lowpass';
      tone.frequency.value = 2100;
      delay.connect(tone); tone.connect(fb); fb.connect(delay); tone.connect(wet); wet.connect(this.musicBus);
      this.delay = delay;

      this.createRain();
      return true;
    },

    createRain() {
      const ctx = this.ctx;
      const length = ctx.sampleRate * 3;
      const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      let last = 0;
      for (let i = 0; i < length; i++) {
        const white = Math.random() * 2 - 1;
        last = last * 0.96 + white * 0.04;
        data[i] = last * 3.2;
      }
      const src = ctx.createBufferSource();
      src.buffer = buffer;
      src.loop = true;
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 900;
      filter.Q.value = 0.5;
      const gain = ctx.createGain();
      gain.gain.value = 0;
      src.connect(filter); filter.connect(gain); gain.connect(this.musicBus);
      src.start();
      this.rainSource = src;
      this.rainGain = gain;
    },

    start() {
      if (!this.ensure()) return;
      if (this.ctx.state === 'suspended') this.ctx.resume();
      if (this.started) return;
      this.started = true;
      this.schedule();
      this.timer = setInterval(() => this.schedule(), 280);
    },

    setMood(name) {
      if (!MOODS[name]) name = 'night';
      this.mood = name;
      if (!this.ctx) return;
      const m = MOODS[name];
      const now = this.ctx.currentTime;
      if (this.rainGain) {
        this.rainGain.gain.cancelScheduledValues(now);
        this.rainGain.gain.setTargetAtTime(m.rain * 0.05, now, 2);
      }
    },

    noteFreq(midi) {
      return 440 * Math.pow(2, (midi - 69) / 12);
    },

    piano(freq, when, dur = 2.4, volume = 0.14, pan = 0) {
      const ctx = this.ctx;
      const osc = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();
      const panner = ctx.createStereoPanner ? ctx.createStereoPanner() : null;

      osc.type = 'triangle';
      osc.frequency.value = freq;
      osc2.type = 'sine';
      osc2.frequency.value = freq * 2.003;
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(2800, when);
      filter.frequency.exponentialRampToValueAtTime(650, when + dur);
      filter.Q.value = 0.6;

      gain.gain.setValueAtTime(0, when);
      gain.gain.linearRampToValueAtTime(volume, when + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.0008, when + dur);

      osc.connect(filter); osc2.connect(filter);
      if (panner) { panner.pan.value = pan; filter.connect(panner); panner.connect(gain); } else filter.connect(gain);
      gain.connect(this.musicBus);
      if (this.delay) gain.connect(this.delay);

      osc.start(when); osc2.start(when);
      osc.stop(when + dur + 0.1); osc2.stop(when + dur + 0.1);
      osc.onended = () => { try { filter.disconnect(); gain.disconnect(); panner?.disconnect(); } catch {} };
    },

    softPad() {
      const ctx = this.ctx;
      const m = MOODS[this.mood];
      const now = ctx.currentTime;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0, now);
      g.gain.linearRampToValueAtTime(m.pad * 0.6, now + 3.4);
      g.gain.linearRampToValueAtTime(0, now + 11);
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 760;
      g.connect(filter); filter.connect(this.musicBus);
      const chord = m.chord;
      chord.slice(0, 3).forEach((semi, i) => {
        const osc = ctx.createOscillator();
        osc.type = i === 0 ? 'sine' : 'triangle';
        osc.frequency.value = m.root * Math.pow(2, semi / 12) / 2;
        osc.detune.value = i * 4 - 4;
        osc.connect(g);
        osc.start(now); osc.stop(now + 11.2);
      });
    },

    schedule() {
      if (!this.ctx || !this.started || this.ctx.state !== 'running') return;
      const m = MOODS[this.mood];
      const stepDur = 60 / m.bpm / 2;
      const now = this.ctx.currentTime + 0.08;
      const step = this.step++;

      if (step % 16 === 0) this.softPad();

      if (step % 2 === 0) {
        const degree = m.scale[(Math.floor(step / 2) * 3 + (step % 5)) % m.scale.length];
        const octave = step % 32 >= 16 ? 2 : 1;
        const freq = m.root * Math.pow(2, degree / 12) * octave;
        this.piano(freq, now, 2.8, 0.11, Math.sin(step * 0.7) * 0.45);
      }

      if (step % 8 === 3) {
        const degree = m.scale[(step / 2) % m.scale.length | 0];
        this.piano(m.root * Math.pow(2, degree / 12) / 2, now, 4.2, 0.075, -0.2);
      }

      if (step % 32 === 31) {
        [0, 2, 4].forEach((n, i) => {
          const semi = m.chord[n % m.chord.length];
          this.piano(m.root * Math.pow(2, semi / 12), now + i * 0.12, 4.5, 0.07, -0.3 + i * 0.3);
        });
      }
    },

    blip(freq = 680, volume = 0.06, dur = 0.1, type = 'sine') {
      if (!this.ctx || this.muted) return;
      const ctx = this.ctx;
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, now);
      g.gain.setValueAtTime(0, now);
      g.gain.linearRampToValueAtTime(volume, now + 0.008);
      g.gain.exponentialRampToValueAtTime(0.0001, now + dur);
      osc.connect(g); g.connect(this.sfxBus);
      osc.start(now); osc.stop(now + dur + 0.02);
    },

    click() { this.blip(540, 0.045, 0.07, 'sine'); },
    choice() { this.blip(760, 0.07, 0.16, 'triangle'); setTimeout(() => this.blip(980, 0.045, 0.2, 'sine'), 70); },
    heart() { this.blip(880, 0.055, 0.18, 'sine'); setTimeout(() => this.blip(1174, 0.05, 0.28, 'sine'), 100); },
    memory() { [523, 659, 784, 1046].forEach((f, i) => setTimeout(() => this.blip(f, 0.05, 0.5, 'sine'), i * 90)); },
    ending() { [392, 523, 659, 784, 1046].forEach((f, i) => setTimeout(() => this.blip(f, 0.06, 1.8, 'sine'), i * 180)); },

    setMuted(muted) {
      this.muted = muted;
      if (this.master && this.ctx) {
        this.master.gain.cancelScheduledValues(this.ctx.currentTime);
        this.master.gain.setTargetAtTime(muted ? 0 : 0.9, this.ctx.currentTime, 0.12);
      }
    }
  };

  window.AudioEngine = engine;
})();
