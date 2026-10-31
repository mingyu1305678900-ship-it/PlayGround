/* Game engine — state, typewriter, choices, save data, ambient particles. */
(() => {
  'use strict';

  const $ = (id) => document.getElementById(id);
  const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
  const escapeHtml = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  const SAVE_KEY = 'byeol-night-save-v1';
  const AUTO_KEY = 'byeol-night-auto-v1';
  const ENDINGS_KEY = 'byeol-night-endings-v1';
  const SETTINGS_KEY = 'byeol-night-settings-v1';
  const SPEEDS = [44, 24, 10];
  const SPEED_LABELS = ['느리게', '보통', '빠르게'];

  const state = {
    name: '도윤',
    sceneId: null,
    affection: 0,
    trust: 0,
    flags: {},
    memories: [],
    history: [],
    started: false
  };

  const settings = { speed: 1, muted: false, shake: true };

  let currentNode = null;
  let currentChoices = [];
  let typeTimer = null;
  let typing = false;
  let fullText = '';
  let pendingEnding = null;
  let autoMode = false;
  let autoTimer = null;
  let currentBg = '';
  let panelOpen = false;
  let confirmAction = null;
  let titleTimer = null;

  const refs = {};

  /* ───────────────────────── particles ───────────────────────── */
  class Particles {
    constructor(canvas) {
      this.canvas = canvas;
      this.ctx = canvas.getContext('2d');
      this.items = [];
      this.mode = 'stars';
      this.w = 0;
      this.h = 0;
      this.dpr = 1;
      this.shooting = 0;
      this.reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      this.resize = this.resize.bind(this);
      this.tick = this.tick.bind(this);
      window.addEventListener('resize', this.resize);
      this.resize();
      requestAnimationFrame(this.tick);
    }

    resize() {
      this.dpr = Math.min(2, window.devicePixelRatio || 1);
      this.w = window.innerWidth;
      this.h = window.innerHeight;
      this.canvas.width = Math.floor(this.w * this.dpr);
      this.canvas.height = Math.floor(this.h * this.dpr);
      this.canvas.style.width = this.w + 'px';
      this.canvas.style.height = this.h + 'px';
      this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
      this.build();
    }

    setMode(bg) {
      const map = {
        'rain-street': 'rain',
        cafe: 'dust',
        studio: 'dust',
        rooftop: 'stars',
        planetarium: 'stars',
        festival: 'embers',
        dawn: 'petals',
        title: 'stars'
      };
      this.mode = map[bg] || 'stars';
      this.build();
    }

    build() {
      const base = { rain: 130, dust: 38, stars: 76, embers: 54, petals: 34 }[this.mode] || 50;
      const count = Math.round(base * (this.reduced ? 0.35 : 1));
      const r = Math.random;
      this.items = Array.from({ length: count }, () => this.make(r));
    }

    make(r = Math.random) {
      const w = this.w || innerWidth;
      const h = this.h || innerHeight;
      if (this.mode === 'rain') {
        return { x: r() * w * 1.2 - w * 0.1, y: r() * h, len: 10 + r() * 22, speed: 12 + r() * 14, alpha: 0.1 + r() * 0.3 };
      }
      if (this.mode === 'dust') {
        return { x: r() * w, y: r() * h, size: 1 + r() * 3, vx: (r() - 0.5) * 0.12, vy: -0.05 - r() * 0.16, alpha: 0.1 + r() * 0.35, phase: r() * 6.28 };
      }
      if (this.mode === 'embers') {
        return { x: r() * w, y: h + r() * h * 0.4, size: 1 + r() * 3.2, vx: (r() - 0.5) * 0.3, vy: -0.25 - r() * 0.7, alpha: 0.2 + r() * 0.55, phase: r() * 6.28, hue: r() > 0.5 ? '255,190,120' : '255,150,175' };
      }
      if (this.mode === 'petals') {
        return { x: r() * w, y: r() * h - h * 0.2, size: 3 + r() * 5, vx: 0.18 + r() * 0.5, vy: 0.18 + r() * 0.5, alpha: 0.25 + r() * 0.5, phase: r() * 6.28, spin: (r() - 0.5) * 0.03 };
      }
      return { x: r() * w, y: r() * h, size: 0.5 + r() * 1.8, vx: (r() - 0.5) * 0.05, vy: (r() - 0.5) * 0.05, alpha: 0.15 + r() * 0.7, phase: r() * 6.28 };
    }

    tick(t) {
      const ctx = this.ctx;
      const dpr = this.dpr;
      if (!ctx) return;
      ctx.clearRect(0, 0, this.w, this.h);
      const mode = this.mode;
      const time = t * 0.001;

      if (mode === 'rain') {
        ctx.strokeStyle = '#cfe6ff';
        ctx.lineWidth = 1;
        for (const p of this.items) {
          ctx.globalAlpha = p.alpha;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x - p.len * 0.22, p.y + p.len);
          ctx.stroke();
          p.y += p.speed * (this.reduced ? 0.3 : 1);
          p.x -= p.speed * 0.08;
          if (p.y > this.h + 30) { p.y = -30; p.x = Math.random() * this.w * 1.2 - this.w * 0.1; }
          if (p.x < -40) p.x = this.w + 20;
        }
      } else if (mode === 'dust') {
        for (const p of this.items) {
          const tw = 0.6 + 0.4 * Math.sin(time * 0.7 + p.phase);
          ctx.globalAlpha = p.alpha * tw;
          ctx.fillStyle = '#ffe1b5';
          ctx.beginPath();
          ctx.arc(p.x + Math.sin(time * 0.4 + p.phase) * 8, p.y, p.size, 0, 6.283);
          ctx.fill();
          p.y += p.vy * (this.reduced ? 0.4 : 1);
          p.x += p.vx;
          if (p.y < -10) { p.y = this.h + 10; p.x = Math.random() * this.w; }
        }
      } else if (mode === 'embers') {
        for (const p of this.items) {
          ctx.globalAlpha = p.alpha * (0.6 + 0.4 * Math.sin(time * 2 + p.phase));
          ctx.fillStyle = `rgb(${p.hue})`;
          ctx.beginPath();
          ctx.arc(p.x + Math.sin(time * 1.3 + p.phase) * 10, p.y, p.size, 0, 6.283);
          ctx.fill();
          p.y += p.vy * (this.reduced ? 0.3 : 1);
          p.x += p.vx + Math.sin(time + p.phase) * 0.14;
          if (p.y < -20) { p.y = this.h + 20; p.x = Math.random() * this.w; }
        }
      } else if (mode === 'petals') {
        for (const p of this.items) {
          ctx.save();
          ctx.globalAlpha = p.alpha;
          ctx.translate(p.x + Math.sin(time * 0.8 + p.phase) * 18, p.y);
          ctx.rotate(Math.sin(time * 0.8 + p.phase) * 0.9 + p.phase);
          ctx.fillStyle = p.size > 5 ? '#ffc7cb' : '#ffe0cd';
          ctx.beginPath();
          ctx.ellipse(0, 0, p.size, p.size * 0.55, 0.5, 0, 6.283);
          ctx.fill();
          ctx.restore();
          p.y += p.vy * (this.reduced ? 0.35 : 1);
          p.x += p.vx + Math.sin(time * 0.9 + p.phase) * 0.2;
          if (p.y > this.h + 20) { p.y = -20; p.x = Math.random() * this.w; }
          if (p.x > this.w + 20) p.x = -20;
        }
      } else {
        for (const p of this.items) {
          const tw = 0.45 + 0.55 * Math.sin(time * 0.9 + p.phase);
          ctx.globalAlpha = p.alpha * tw;
          ctx.fillStyle = '#fff4d6';
          ctx.beginPath();
          ctx.arc(p.x + Math.sin(time * 0.2 + p.phase) * 3, p.y, p.size, 0, 6.283);
          ctx.fill();
          p.x += p.vx * (this.reduced ? 0.3 : 1);
          p.y += p.vy * (this.reduced ? 0.3 : 1);
          if (p.x < -10) p.x = this.w + 10;
          if (p.x > this.w + 10) p.x = -10;
          if (p.y < -10) p.y = this.h + 10;
          if (p.y > this.h + 10) p.y = -10;
        }
        if (!this.reduced) {
          this.shootingCalc = (this.shootingCalc || 0) + 1;
          if (this.shootingCalc % 420 === 0) this.shooting = 1;
          if (this.shooting > 0) {
            const p = this.shooting;
            ctx.globalAlpha = 0.55 * p;
            ctx.strokeStyle = '#fff3d2';
            ctx.lineWidth = 1.6;
            ctx.beginPath();
            ctx.moveTo(this.w * 0.78 - (1 - p) * 140, this.h * 0.18 + (1 - p) * 70);
            ctx.lineTo(this.w * 0.78 - (1 - p) * 220, this.h * 0.18 + (1 - p) * 110);
            ctx.stroke();
            this.shooting -= 0.012;
          }
        }
      }
      ctx.globalAlpha = 1;
      requestAnimationFrame(this.tick);
    }
  }

  /* ───────────────────────── init ───────────────────────── */
  function init() {
    Object.assign(refs, {
      game: $('game'),
      bgWrap: $('bgWrap'),
      portrait: $('portrait'),
      chapterLabel: $('chapterLabel'),
      chapterPill: $('chapterPill'),
      affectionFill: $('affectionFill'),
      affectionValue: $('affectionValue'),
      affectionMeter: $('affectionMeter'),
      dialogueArea: $('dialogueArea'),
      dialogueCard: $('dialogueCard'),
      speakerName: $('speakerName'),
      dialogueText: $('dialogueText'),
      sceneTime: $('sceneTime'),
      choiceList: $('choiceList'),
      advanceBtn: $('advanceBtn'),
      autoBtn: $('autoBtn'),
      titleScreen: $('titleScreen'),
      endingScreen: $('endingScreen'),
      playerName: $('playerName'),
      playBtn: $('playBtn'),
      continueBtn: $('continueBtn'),
      soundBtn: $('soundBtn'),
      galleryBtn: $('galleryBtn'),
      menuBtn: $('menuBtn'),
      modalBackdrop: $('modalBackdrop'),
      menuPanel: $('menuPanel'),
      historyPanel: $('historyPanel'),
      galleryPanel: $('galleryPanel'),
      settingsPanel: $('settingsPanel'),
      historyBody: $('historyBody'),
      galleryGrid: $('galleryGrid'),
      galleryIntro: $('galleryIntro'),
      toastStack: $('toastStack'),
      confirmBackdrop: $('confirmBackdrop'),
      confirmTitle: $('confirmTitle'),
      confirmMessage: $('confirmMessage'),
      confirmYes: $('confirmYes'),
      confirmNo: $('confirmNo'),
      endingKicker: $('endingKicker'),
      endingTitle: $('endingTitle'),
      endingSub: $('endingSub'),
      endingNote: $('endingNote'),
      endAffection: $('endAffection'),
      endTrust: $('endTrust'),
      endMemories: $('endMemories'),
      endingCollection: $('endingCollection'),
      endingCount: $('endingCount'),
      speedRange: $('speedRange'),
      speedLabel: $('speedLabel'),
      soundToggle: $('soundToggle'),
      soundLabel: $('soundLabel'),
      shakeToggle: $('shakeToggle'),
      shakeLabel: $('shakeLabel'),
      muteMenuLabel: $('muteMenuLabel'),
      replayBtn: $('replayBtn'),
      endingTitleBtn: $('endingTitleBtn'),
      saveBtn: $('saveBtn'),
      loadBtn: $('loadBtn'),
      historyBtn: $('historyBtn'),
      muteMenuBtn: $('muteMenuBtn'),
      galleryMenuBtn: $('galleryMenuBtn'),
      restartBtn: $('restartBtn'),
      settingsMenuBtn: $('settingsMenuBtn')
    });

    loadSettings();
    refs.portrait.innerHTML = window.ART.portrait();
    refs.portrait.dataset.expr = 'smile';
    setBackground('cafe');
    setExpression('smile');
    window.particleField = new Particles($('particles'));
    window.particleField.setMode('stars');
    refs.game.dataset.screen = 'title';
    bindEvents();
    updateMeter();
    refreshEndingCount();
    refreshContinue();
    renderGallery();
    applySettings();
    highlightMenu();
    setTimeout(() => refs.game.classList.add('ready'), 60);
  }

  /* ───────────────────────── settings / storage ───────────────────────── */
  function loadSettings() {
    try {
      const raw = localStorage.getItem(SETTINGS_KEY);
      if (raw) Object.assign(settings, JSON.parse(raw));
    } catch {}
    settings.speed = clamp(Number(settings.speed) || 0, 0, 2);
  }

  function persistSettings() {
    try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings)); } catch {}
  }

  function applySettings() {
    window.AudioEngine.setMuted(settings.muted);
    refs.speedRange.value = settings.speed;
    refs.speedLabel.textContent = SPEED_LABELS[settings.speed];
    refs.soundToggle.checked = !settings.muted;
    refs.soundLabel.textContent = settings.muted ? '꺼짐' : '켜짐';
    refs.shakeToggle.checked = settings.shake;
    refs.shakeLabel.textContent = settings.shake ? '켜짐' : '꺼짐';
    refs.game.classList.toggle('sound-off', settings.muted);
    refs.muteMenuLabel.textContent = settings.muted ? '꺼짐' : '켜짐';
    refs.soundBtn.setAttribute('aria-label', settings.muted ? '소리 켜기' : '소리 끄기');
    refs.soundBtn.classList.toggle('is-muted', settings.muted);
  }

  function snapshot() {
    return {
      v: 1,
      name: state.name,
      sceneId: state.sceneId,
      affection: state.affection,
      trust: state.trust,
      flags: state.flags,
      memories: state.memories,
      history: state.history,
      started: state.started,
      savedAt: Date.now()
    };
  }

  function autoSave() {
    if (!state.started || !state.sceneId) return;
    try { localStorage.setItem(AUTO_KEY, JSON.stringify(snapshot())); } catch {}
    refreshContinue();
  }

  function readSaved(key) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return null;
      const data = JSON.parse(raw);
      if (!data || !STORY.scenes[data.sceneId]) return null;
      return data;
    } catch { return null; }
  }

  function getAutoSaved() { return readSaved(AUTO_KEY); }
  function getManualSaved() { return readSaved(SAVE_KEY); }
  function getSaved() { return getManualSaved() || getAutoSaved(); }

  function saveManual() {
    if (!state.started || !state.sceneId) return false;
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(snapshot())); } catch { return false; }
    return true;
  }

  function refreshContinue() {
    refs.continueBtn.hidden = !(getAutoSaved() || getManualSaved());
  }

  function getUnlockedEndings() {
    try {
      const arr = JSON.parse(localStorage.getItem(ENDINGS_KEY) || '[]');
      return Array.isArray(arr) ? arr.filter((k) => STORY.endings[k]) : [];
    } catch { return []; }
  }

  function unlockEnding(id) {
    const list = getUnlockedEndings();
    if (!list.includes(id)) {
      list.push(id);
      try { localStorage.setItem(ENDINGS_KEY, JSON.stringify(list)); } catch {}
    }
    refreshEndingCount();
  }

  function refreshEndingCount() {
    const list = getUnlockedEndings();
    refs.endingCount.textContent = `엔딩 ${list.length} / 4`;
    return list;
  }

  /* ───────────────────────── background / character ───────────────────────── */
  function setBackground(name) {
    if (currentBg === name) return;
    currentBg = name;
    const layer = document.createElement('div');
    layer.className = 'bg-layer enter';
    layer.innerHTML = window.ART.background(name);
    refs.bgWrap.appendChild(layer);
    requestAnimationFrame(() => requestAnimationFrame(() => layer.classList.add('active')));
    const old = [...refs.bgWrap.querySelectorAll('.bg-layer:not(.enter)')];
    old.forEach((node) => { node.classList.add('leave'); setTimeout(() => node.remove(), 1200); });
    setTimeout(() => layer.classList.remove('enter'), 40);
    refs.game.dataset.bg = name;
    if (window.particleField) window.particleField.setMode(name);
  }

  function setExpression(expr) {
    if (!expr) return;
    refs.portrait.dataset.expr = expr;
  }

  function updateChapter(node) {
    if (!node.chapter) return;
    const label = node.chapter >= 5 ? 'Epilogue' : `Chapter ${node.chapter}`;
    refs.chapterLabel.textContent = `${label} · ${node.chapterName || ''}`;
    refs.chapterPill.dataset.chapter = node.chapter;
  }

  function showChapterCard(num, name) {
    document.querySelectorAll('.chapter-card').forEach((n) => n.remove());
    const card = document.createElement('div');
    card.className = 'chapter-card';
    card.innerHTML = `<span class="cc-kicker">${num >= 5 ? 'EPILOGUE' : `CHAPTER ${num}`}</span><span class="cc-name">${escapeHtml(name || '')}</span><span class="cc-rule"></span>`;
    refs.game.appendChild(card);
    requestAnimationFrame(() => card.classList.add('show'));
    setTimeout(() => { card.classList.remove('show'); setTimeout(() => card.remove(), 700); }, 2600);
  }

  function shake(intensity = 5) {
    if (!settings.shake) return;
    refs.game.style.setProperty('--shake', `${intensity}px`);
    refs.game.classList.remove('shaking');
    void refs.game.offsetWidth;
    refs.game.classList.add('shaking');
    setTimeout(() => refs.game.classList.remove('shaking'), 520);
  }

  /* ───────────────────────── story progression ───────────────────────── */
  function personalize(text) {
    return String(text || '').replaceAll('{name}', state.name).replaceAll('도윤', state.name);
  }

  function startNew() {
    const name = (refs.playerName.value || '').trim().slice(0, 10) || '도윤';
    state.name = name;
    state.sceneId = STORY.start;
    state.affection = 0;
    state.trust = 0;
    state.flags = {};
    state.memories = [];
    state.history = [];
    state.started = true;
    autoMode = false;
    updateAutoButton();
    refs.playerName.value = name;
    window.AudioEngine.start();
    window.AudioEngine.setMuted(settings.muted);
    refs.game.dataset.screen = 'story';
    refs.titleScreen.classList.add('is-hidden');
    refs.endingScreen.hidden = true;
    refs.endingScreen.classList.remove('show');
    refs.game.classList.remove('ending-mode');
    updateMeter();
    goTo(STORY.start, { autosave: true, addHistory: true });
  }

  function continueGame() {
    const saved = getAutoSaved() || getManualSaved();
    if (!saved) return;
    restore(saved);
  }

  function restore(saved) {
    state.name = saved.name || '도윤';
    state.sceneId = saved.sceneId;
    state.affection = Number(saved.affection) || 0;
    state.trust = Number(saved.trust) || 0;
    state.flags = saved.flags || {};
    state.memories = Array.isArray(saved.memories) ? saved.memories : [];
    state.history = Array.isArray(saved.history) ? saved.history : [];
    state.started = true;
    refs.playerName.value = state.name;
    window.AudioEngine.start();
    window.AudioEngine.setMuted(settings.muted);
    refs.game.dataset.screen = 'story';
    refs.titleScreen.classList.add('is-hidden');
    refs.endingScreen.hidden = true;
    refs.endingScreen.classList.remove('show');
    refs.game.classList.remove('ending-mode');
    updateMeter();
    renderGallery();
    goTo(saved.sceneId, { autosave: false, addHistory: false, instant: true });
    showToast('저장된 밤으로 돌아왔어요', 'moon');
  }

  function goTo(id, opts = {}) {
    const node = STORY.scenes[id];
    if (!node) { console.warn('Unknown scene', id); return; }
    clearAuto();
    currentNode = node;
    currentChoices = [];
    pendingEnding = null;
    state.sceneId = id;

    if (node.chapter) updateChapter(node);
    if (node.chapterIntro) showChapterCard(node.chapter, node.chapterName);
    if (node.bg) setBackground(node.bg);
    if (node.mood) window.AudioEngine.setMood(node.mood);
    if (node.expr) setExpression(node.expr);
    else if (!node.narration && node.speaker === '서아') setExpression('smile');

    if (node.affection || node.trust) applyStats(node.affection || 0, node.trust || 0, false);
    if (node.memory) unlockMemory(node.memory);

    const text = personalize(node.text);
    const speaker = node.speaker ? personalize(node.speaker) : '';
    refs.speakerName.textContent = speaker || (node.narration ? '' : state.name);
    refs.dialogueCard.classList.toggle('narration', Boolean(node.narration));
    refs.dialogueCard.classList.toggle('has-speaker', Boolean(speaker));
    refs.sceneTime.textContent = node.time || '';
    refs.sceneTime.style.visibility = node.time ? 'visible' : 'hidden';
    refs.sceneTime.textContent = node.time || '';
    refs.choiceList.innerHTML = '';
    refs.choiceList.classList.remove('show');
    refs.dialogueCard.classList.remove('choosing');

    if (opts.addHistory !== false) {
      state.history.push({ speaker: speaker || (node.narration ? '' : state.name), text, type: node.narration ? 'narration' : 'line' });
      if (state.history.length > 260) state.history = state.history.slice(-260);
    }

    if (node.choices) currentChoices = node.choices;
    if (node.endingResolve) pendingEnding = STORY.resolveEnding(state);
    if (node.ending) pendingEnding = node.ending;

    typeText(text, { instant: Boolean(opts.instant) });

    if (opts.autosave !== false) autoSave();
    if (node.id === 'c4_10' || node.id === 'c4_11') shake(4);
  }

  function typeText(text, { instant = false } = {}) {
    clearTimeout(typeTimer);
    clearInterval(typeTimer);
    fullText = text;
    refs.dialogueText.textContent = '';
    refs.dialogueText.classList.add('typing');
    typing = true;
    refs.advanceBtn.classList.remove('ready');
    refs.dialogueCard.classList.remove('done');

    if (instant) { finishTyping(); return; }

    let i = 0;
    const speed = SPEEDS[settings.speed];
    const step = () => {
      i += settings.speed === 2 ? 2 : 1;
      refs.dialogueText.textContent = fullText.slice(0, i);
      if (i >= fullText.length) { finishTyping(); return; }
      let delay = speed;
      const ch = fullText[i - 1];
      if (ch === '.' || ch === '?' || ch === '!' || ch === '…') delay += speed * 3;
      else if (ch === ',' || ch === '·') delay += speed * 1.5;
      typeTimer = setTimeout(step, delay);
    };
    typeTimer = setTimeout(step, 90);
  }

  function finishTyping() {
    clearTimeout(typeTimer);
    clearInterval(typeTimer);
    typing = false;
    refs.dialogueText.textContent = fullText;
    refs.dialogueText.classList.remove('typing');
    refs.dialogueCard.classList.add('done');
    refs.advanceBtn.classList.add('ready');
    afterTyping();
  }

  function afterTyping() {
    clearAuto();
    if (currentChoices.length) {
      renderChoices();
      return;
    }
    if (autoMode) {
      const wait = 1500 + Math.min(2200, fullText.length * 26);
      autoTimer = setTimeout(() => { if (!panelOpen && autoMode) advance(); }, wait);
    }
  }

  function renderChoices() {
    refs.choiceList.innerHTML = '';
    refs.dialogueCard.classList.add('choosing');
    currentChoices.forEach((choice, index) => {
      const btn = document.createElement('button');
      btn.className = 'choice-btn';
      btn.type = 'button';
      btn.innerHTML = `<span class="choice-index">${String(index + 1).padStart(2, '0')}</span><span class="choice-label">${escapeHtml(personalize(choice.label))}</span><span class="choice-arrow">→</span>`;
      btn.addEventListener('click', (event) => { event.stopPropagation(); choose(index); });
      refs.choiceList.appendChild(btn);
      setTimeout(() => btn.classList.add('in'), 70 + index * 80);
    });
    refs.choiceList.classList.add('show');
    refs.advanceBtn.classList.remove('ready');
    refs.advanceBtn.style.visibility = 'hidden';
  }

  function choose(index) {
    const choice = currentChoices[index];
    if (!choice) return;
    window.AudioEngine.choice();
    refs.choiceList.classList.remove('show');
    refs.choiceList.innerHTML = '';
    refs.dialogueCard.classList.remove('choosing');
    refs.advanceBtn.style.visibility = '';

    state.history.push({ speaker: '선택', text: personalize(choice.label), type: 'choice' });
    if (choice.flags) Object.assign(state.flags, choice.flags);
    applyStats(choice.affection || 0, choice.trust || 0, true);
    currentChoices = [];
    if (choice.memory) unlockMemory(choice.memory);

    const destination = choice.route && !choice.next ? null : choice.next;
    if (destination) goTo(destination, { autosave: true, addHistory: true });
    else if (choice.ending) showEnding(choice.ending);
    else if (pendingEnding) showEnding(pendingEnding);
    else advance();
  }

  function advance() {
    if (panelOpen || !currentNode || refs.game.dataset.screen !== 'story') return;
    if (typing) { finishTyping(); return; }
    if (currentChoices.length) return;
    if (pendingEnding) { showEnding(pendingEnding); return; }
    if (currentNode.next) { goTo(currentNode.next, { autosave: true, addHistory: true }); return; }
    if (currentNode.ending) { showEnding(currentNode.ending); return; }
    showEnding(STORY.resolveEnding(state));
  }

  function applyStats(affection, trust, animate) {
    if (affection) {
      state.affection = clamp(state.affection + affection, 0, STORY.maxAffection);
      if (animate) {
        showToast(`호감도 +${affection}`, 'heart');
        window.AudioEngine.heart();
      }
    }
    if (trust) {
      state.trust = clamp(state.trust + trust, 0, STORY.maxTrust);
      if (animate) showToast(`신뢰 +${trust}`, 'star');
    }
    updateMeter(animate);
  }

  function updateMeter(animate = false) {
    const pct = Math.round((state.affection / STORY.maxAffection) * 100);
    refs.affectionFill.style.width = pct + '%';
    refs.affectionValue.textContent = state.affection;
    refs.affectionMeter.setAttribute('aria-valuenow', state.affection);
    if (animate) {
      refs.affectionMeter.classList.remove('pulse');
      void refs.affectionMeter.offsetWidth;
      refs.affectionMeter.classList.add('pulse');
      setTimeout(() => refs.affectionMeter.classList.remove('pulse'), 700);
    }
  }

  function unlockMemory(memory) {
    if (state.memories.some((m) => m.id === memory.id)) return;
    state.memories.push({ ...memory, chapter: currentNode?.chapter || 1 });
    showToast(`추억이 기록되었어요 · ${memory.title}`, 'memory', memory.glyph);
    window.AudioEngine.memory();
    renderGallery();
  }

  /* ───────────────────────── ending ───────────────────────── */
  function showEnding(id) {
    const ending = STORY.endings[id] || STORY.endings.normal;
    if (id === 'true' || id === 'good') {
      unlockMemory({ id: 'epilogue', title: '우리의 별자리', desc: '이야기가 끝난 뒤에도, 우리는 같은 하늘을 봐요.', glyph: '★' });
    }
    unlockEnding(id);
    const list = refreshEndingCount();
    refs.endAffection.textContent = state.affection;
    refs.endTrust.textContent = state.trust;
    refs.endMemories.textContent = `${state.memories.length} / 8`;
    refs.endingKicker.textContent = ending.kicker;
    refs.endingTitle.textContent = ending.title;
    refs.endingSub.textContent = ending.sub;
    refs.endingNote.textContent = ending.note;
    refs.endingScreen.dataset.color = ending.color;
    refs.endingCollection.textContent = `엔딩 수집 ${list.length} / 4 · ${list.map((key) => STORY.endings[key].title).join(' · ')}`;
    refs.game.dataset.screen = 'ending';
    refs.game.classList.add('ending-mode');
    refs.soundBtn.classList.remove('is-muted');
    clearAuto();
    window.AudioEngine.ending();
    window.AudioEngine.setMood(id === 'true' ? 'dawn' : id === 'sad' ? 'sad' : 'romantic');
    refs.endingScreen.hidden = false;
    requestAnimationFrame(() => refs.endingScreen.classList.add('show'));
    autoSave();
  }

  function showTitle() {
    clearAuto();
    refs.game.dataset.screen = 'title';
    refs.titleScreen.classList.remove('is-hidden');
    refs.endingScreen.hidden = true;
    refs.endingScreen.classList.remove('show');
    refs.game.classList.remove('ending-mode');
    refs.dialogueText.textContent = '';
    refs.choiceList.innerHTML = '';
    refs.advanceBtn.style.visibility = '';
    setExpression('smile');
    setBackground('cafe');
    window.AudioEngine.setMood('cafe');
    refreshContinue();
    refreshEndingCount();
    renderGallery();
  }

  /* ───────────────────────── panels / toasts ───────────────────────── */
  function showToast(text, type = 'info', glyph = '') {
    const el = document.createElement('div');
    el.className = `toast toast-${type}`;
    const icon = glyph || (type === 'heart' ? '❤' : type === 'star' ? '✦' : type === 'memory' ? '✧' : type === 'moon' ? '☾' : '·');
    el.innerHTML = `<span class="toast-icon">${escapeHtml(icon)}</span><span>${escapeHtml(text)}</span>`;
    refs.toastStack.appendChild(el);
    requestAnimationFrame(() => el.classList.add('show'));
    setTimeout(() => {
      el.classList.remove('show');
      setTimeout(() => el.remove(), 450);
    }, type === 'memory' ? 2600 : 1800);
  }

  function openPanel(panel) {
    closePanels();
    panelOpen = true;
    refs.modalBackdrop.hidden = false;
    panel.hidden = false;
    requestAnimationFrame(() => {
      refs.modalBackdrop.classList.add('show');
      panel.classList.add('show');
    });
    if (panel === refs.historyPanel) renderHistory();
    if (panel === refs.galleryPanel) renderGallery();
    highlightMenu();
    clearAuto();
  }

  function closePanels() {
    panelOpen = false;
    [refs.menuPanel, refs.historyPanel, refs.galleryPanel, refs.settingsPanel].forEach((panel) => {
      panel.classList.remove('show');
      if (!panel.hidden) setTimeout(() => { panel.hidden = true; }, 180);
    });
    refs.modalBackdrop.classList.remove('show');
    setTimeout(() => { refs.modalBackdrop.hidden = true; }, 200);
  }

  function renderHistory() {
    if (!state.history.length) {
      refs.historyBody.innerHTML = '<p class="empty-note">아직 기록된 대화가 없어요.</p>';
      return;
    }
    refs.historyBody.innerHTML = state.history.map((entry) => {
      if (entry.type === 'choice') {
        return `<div class="history-entry choice"><span class="history-name">선택</span><p>${escapeHtml(entry.text)}</p></div>`;
      }
      if (entry.type === 'narration') {
        return `<div class="history-entry narration"><p>${escapeHtml(entry.text)}</p></div>`;
      }
      return `<div class="history-entry"><span class="history-name">${escapeHtml(entry.speaker || '')}</span><p>${escapeHtml(entry.text)}</p></div>`;
    }).join('');
    requestAnimationFrame(() => { refs.historyBody.scrollTop = refs.historyBody.scrollHeight; });
  }

  function renderGallery() {
    const all = [
      { id: 'latte', title: '루나 라떼', desc: '비 오는 첫날, 컵 위에 작은 별을 그려준 밤.', glyph: '☕' },
      { id: 'first-friday', title: '다음 금요일, 8시', desc: '컵홀더에 남겨진, 아주 작은 초대.', glyph: '✧' },
      { id: 'rejection', title: '스물일곱 번째 반려', desc: '“반려는 끝이 아니라, 아직 끝나지 않았다는 뜻이잖아요.”', glyph: '✉' },
      { id: 'manuscript', title: '별을 삼킨 고양이', desc: '반려됐지만, 그녀에게 처음 보여준 이야기.', glyph: '☾' },
      { id: 'umbrella', title: '우산 아래', desc: '비가 와서 다행이라고, 처음으로 생각한 밤.', glyph: '☂' },
      { id: 'shooting-star', title: '별이 쏟아진 밤', desc: '옥상에서, 처음으로 손을 잡은 밤.', glyph: '✦' },
      { id: 'confession', title: '불꽃 아래의 고백', desc: '“나, 도윤 씨를 좋아해요. 아마… 첫날부터.”', glyph: '❤' },
      { id: 'epilogue', title: '우리의 별자리', desc: '이야기가 끝난 뒤에도, 우리는 같은 하늘을 봐요.', glyph: '★' }
    ];
    const owned = new Set(state.memories.map((m) => m.id));
    refs.galleryIntro.textContent = state.memories.length
      ? `서아와 함께 만든 ${state.memories.length}개의 장면. 아직 ${all.length - state.memories.length}개의 밤이 남아 있어요.`
      : '아직 아무것도 담기지 않았어요. 첫 번째 밤을 시작해볼까요?';
    refs.galleryGrid.innerHTML = all.map((memory) => owned.has(memory.id)
      ? `<article class="memory-card unlocked"><span class="memory-glyph">${memory.glyph}</span><h4>${escapeHtml(memory.title)}</h4><p>${escapeHtml(memory.desc)}</p></article>`
      : `<article class="memory-card locked"><span class="memory-glyph">?</span><h4>아직 만나지 못한 밤</h4><p>서아와의 시간 속에서 발견할 수 있어요.</p></article>`).join('');

    let badges = refs.galleryPanel.querySelector('.ending-badges');
    if (!badges) {
      badges = document.createElement('div');
      badges.className = 'ending-badges';
      refs.galleryPanel.querySelector('.panel-body').appendChild(badges);
    }
    const unlocked = getUnlockedEndings();
    badges.innerHTML = `<h4>모은 엔딩</h4><div class="badge-row">${['true', 'good', 'normal', 'sad'].map((key) => {
      const e = STORY.endings[key];
      return `<span class="ending-badge ${unlocked.includes(key) ? 'got' : ''}" data-color="${e.color}">${unlocked.includes(key) ? escapeHtml(e.title) : '???'}</span>`;
    }).join('')}</div>`;
  }

  function highlightMenu() {
    const canStory = state.started && gameScreen() === 'story';
    [refs.saveBtn, refs.loadBtn, refs.historyBtn].forEach((btn) => { btn.disabled = false; });
    refs.loadBtn.disabled = !getSaved();
    refs.historyBtn.disabled = !state.history.length;
    refs.saveBtn.disabled = !canStory;
  }

  function gameScreen() { return refs.game.dataset.screen; }

  function toggleSound() {
    settings.muted = !settings.muted;
    persistSettings();
    applySettings();
    if (!settings.muted) {
      window.AudioEngine.start();
      window.AudioEngine.setMuted(false);
      window.AudioEngine.click();
    }
    showToast(settings.muted ? '소리를 껐어요' : '소리를 켰어요', 'moon');
  }

  function toggleAuto() {
    autoMode = !autoMode;
    updateAutoButton();
    showToast(autoMode ? '자동 진행을 켰어요' : '자동 진행을 껐어요', 'moon');
    if (autoMode && !typing && !currentChoices.length) afterTyping();
    if (!autoMode) clearAuto();
  }

  function updateAutoButton() {
    refs.autoBtn.classList.toggle('active', autoMode);
    refs.autoBtn.setAttribute('aria-pressed', String(autoMode));
    refs.autoBtn.querySelector('span').textContent = autoMode ? '자동 켜짐' : '자동';
  }

  function clearAuto() {
    clearTimeout(autoTimer);
    autoTimer = null;
  }

  function showConfirm(title, message, action) {
    confirmAction = action;
    refs.confirmTitle.textContent = title;
    refs.confirmMessage.textContent = message;
    refs.confirmBackdrop.hidden = false;
    requestAnimationFrame(() => refs.confirmBackdrop.classList.add('show'));
  }

  function closeConfirm() {
    refs.confirmBackdrop.classList.remove('show');
    setTimeout(() => { refs.confirmBackdrop.hidden = true; }, 180);
    confirmAction = null;
  }

  /* ───────────────────────── events ───────────────────────── */
  function bindEvents() {
    refs.playBtn.addEventListener('click', () => {
      window.AudioEngine.start();
      window.AudioEngine.click();
      startNew();
    });
    refs.continueBtn.addEventListener('click', () => {
      window.AudioEngine.start();
      window.AudioEngine.click();
      continueGame();
    });
    refs.playerName.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') { event.stopPropagation(); refs.playBtn.click(); }
    });
    refs.playerName.addEventListener('click', (event) => event.stopPropagation());

    refs.dialogueCard.addEventListener('click', (event) => {
      if (event.target.closest('button, input, a')) return;
      advance();
    });
    refs.advanceBtn.addEventListener('click', (event) => { event.stopPropagation(); window.AudioEngine.click(); advance(); });
    refs.autoBtn.addEventListener('click', (event) => { event.stopPropagation(); window.AudioEngine.click(); toggleAuto(); });
    refs.characterStage = $('characterStage');
    refs.characterStage.addEventListener('click', () => { if (!panelOpen) advance(); });

    refs.soundBtn.addEventListener('click', (event) => { event.stopPropagation(); toggleSound(); });
    refs.galleryBtn.addEventListener('click', (event) => { event.stopPropagation(); window.AudioEngine.click(); openPanel(refs.galleryPanel); });
    refs.menuBtn.addEventListener('click', (event) => { event.stopPropagation(); window.AudioEngine.click(); openPanel(refs.menuPanel); });

    refs.modalBackdrop.addEventListener('click', closePanels);
    refs.menuPanel.querySelectorAll('[data-close]').forEach((b) => b.addEventListener('click', closePanels));
    refs.historyPanel.querySelectorAll('[data-close]').forEach((b) => b.addEventListener('click', closePanels));
    refs.galleryPanel.querySelectorAll('[data-close]').forEach((b) => b.addEventListener('click', closePanels));
    refs.settingsPanel.querySelectorAll('[data-close]').forEach((b) => b.addEventListener('click', closePanels));

    refs.saveBtn.addEventListener('click', () => {
      if (saveManual()) showToast('지금 이 밤을 저장했어요', 'moon');
      closePanels();
    });
    refs.loadBtn.addEventListener('click', () => {
      closePanels();
      setTimeout(() => {
        const saved = getSaved();
        if (saved) restore(saved);
        else showToast('저장된 밤이 없어요', 'moon');
      }, 200);
    });
    refs.historyBtn.addEventListener('click', () => openPanel(refs.historyPanel));
    refs.muteMenuBtn.addEventListener('click', toggleSound);
    refs.galleryMenuBtn.addEventListener('click', () => openPanel(refs.galleryPanel));
    refs.settingsMenuBtn.addEventListener('click', () => openPanel(refs.settingsPanel));
    refs.restartBtn.addEventListener('click', () => {
      closePanels();
      setTimeout(() => showConfirm('처음부터 시작할까요?', '지금까지의 기록은 사라져요. 저장하지 않은 밤은 되돌릴 수 없어요.', startNew), 200);
    });

    refs.confirmNo.addEventListener('click', closeConfirm);
    refs.confirmYes.addEventListener('click', () => {
      const action = confirmAction;
      closeConfirm();
      if (action) setTimeout(action, 200);
    });
    refs.confirmBackdrop.addEventListener('click', (event) => { if (event.target === refs.confirmBackdrop) closeConfirm(); });

    refs.speedRange.addEventListener('input', () => {
      settings.speed = clamp(Number(refs.speedRange.value), 0, 2);
      refs.speedLabel.textContent = SPEED_LABELS[settings.speed];
      persistSettings();
    });
    refs.soundToggle.addEventListener('change', () => {
      settings.muted = !refs.soundToggle.checked;
      persistSettings();
      applySettings();
      if (!settings.muted) { window.AudioEngine.start(); window.AudioEngine.setMuted(false); }
    });
    refs.shakeToggle.addEventListener('change', () => {
      settings.shake = refs.shakeToggle.checked;
      persistSettings();
      applySettings();
    });

    refs.replayBtn.addEventListener('click', () => {
      window.AudioEngine.click();
      startNew();
    });
    refs.endingTitleBtn.addEventListener('click', () => {
      window.AudioEngine.click();
      showTitle();
    });

    document.addEventListener('keydown', (event) => {
      const tag = (event.target.tagName || '').toLowerCase();
      if (tag === 'input' || tag === 'textarea') return;
      if (event.key === 'Escape') {
        if (panelOpen) closePanels();
        else if (!refs.confirmBackdrop.hidden) closeConfirm();
        else if (gameScreen() === 'story') openPanel(refs.menuPanel);
        return;
      }
      if (event.key === 'h' || event.key === 'H') { if (gameScreen() === 'story') openPanel(refs.historyPanel); return; }
      if (event.key === 'g' || event.key === 'G') { openPanel(refs.galleryPanel); return; }
      if (event.key === 's' || event.key === 'S') { toggleSound(); return; }
      if (event.key === 'a' || event.key === 'A') { if (gameScreen() === 'story') toggleAuto(); return; }
      if (gameScreen() !== 'story' || panelOpen) return;
      if (event.key === ' ' || event.key === 'Enter' || event.key === 'ArrowRight') {
        if (event.target.closest('button')) return;
        event.preventDefault();
        advance();
      }
      if (/^[1-4]$/.test(event.key) && currentChoices.length) {
        choose(Number(event.key) - 1);
      }
    });

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) clearAuto();
    });
  }

  window.addEventListener('DOMContentLoaded', init);
})();
