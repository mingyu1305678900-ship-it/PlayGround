/* ============================================================
   여름의 끝에서, 너에게 — game engine
   ============================================================ */
(() => {
  'use strict';

  const SAVE_KEY = 'summer-door-save-v2';
  const SOUND_KEY = 'summer-door-sound';

  const $ = (id) => document.getElementById(id);

  const el = {
    body: document.body,
    hud: $('hud'),
    dayLabel: $('dayLabel'),
    chapterLabel: $('chapterLabel'),
    affectionFill: $('affectionFill'),
    affectionValue: $('affectionValue'),
    meter: $('meter'),
    soundBtn: $('soundBtn'),
    menuBtn: $('menuBtn'),
    portrait: $('portrait'),
    moodChip: $('moodChip'),
    placeLabel: $('placeLabel'),
    chapterQuote: $('chapterQuote'),
    progress: $('progress'),
    speaker: $('speaker'),
    line: $('line'),
    choices: $('choices'),
    nextBtn: $('nextBtn'),
    keyHint: $('keyHint'),
    titleScreen: $('titleScreen'),
    nameInput: $('nameInput'),
    startBtn: $('startBtn'),
    continueBtn: $('continueBtn'),
    titleCredits: $('titleCredits'),
    dayVeil: $('dayVeil'),
    veilDay: $('veilDay'),
    veilTitle: $('veilTitle'),
    veilQuote: $('veilQuote'),
    veilSkip: $('veilSkip'),
    minigame: $('minigame'),
    miniMarker: $('miniMarker'),
    miniScore: $('miniScore'),
    miniHearts: $('miniHearts'),
    miniTap: $('miniTap'),
    menu: $('menu'),
    menuClose: $('menuClose'),
    menuSound: $('menuSound'),
    menuSoundState: $('menuSoundState'),
    menuRestart: $('menuRestart'),
    menuTitleBtn: $('menuTitleBtn'),
    ending: $('ending'),
    endingEyebrow: $('endingEyebrow'),
    endingTitle: $('endingTitle'),
    endingBody: $('endingBody'),
    endingMemories: $('endingMemories'),
    endingAffection: $('endingAffection'),
    endingMemoryCount: $('endingMemoryCount'),
    endingQuote: $('endingQuote'),
    endingRestart: $('endingRestart'),
    endingTitleBtn: $('endingTitleBtn'),
    confirm: $('confirm'),
    confirmText: $('confirmText'),
    confirmNo: $('confirmNo'),
    confirmYes: $('confirmYes'),
    toasts: $('toasts'),
    petals: $('petals'),
  };

  const MOODS = {
    neutral: '🍃 차분함',
    happy: '🌤️ 기분 좋음',
    shy: '🌸 수줍음',
    laugh: '✨ 웃음',
    sad: '🌧️ 시무룩',
    surprise: '😳 놀람',
  };

  const state = {
    phase: 'title',
    name: '민준',
    dayIndex: 0,
    beatIndex: 0,
    affection: STORY.startAffection,
    memories: [],
    mood: 'neutral',
  };

  let runId = 0;
  let typing = false;
  let typeTimer = null;
  let typeComplete = null;
  let advanceResolve = null;
  let choiceResolve = null;
  let miniState = null;
  let confirmAction = null;
  let currentOption = null;

  /* ------------------------------------------------------------
     sound — a small generative music box
     ------------------------------------------------------------ */
  const Sound = {
    ctx: null,
    master: null,
    timer: null,
    on: false,
    chord: 0,
    chords: [
      [174.61, 220.0, 261.63, 329.63], // Fmaj7
      [130.81, 164.81, 196.0, 246.94], // Cmaj7
      [146.83, 174.61, 220.0, 261.63], // Dm7
      [98.0, 123.47, 146.83, 196.0],   // G6
    ],

    ensure() {
      if (this.ctx) return this.ctx;
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return null;
      this.ctx = new Ctx();
      this.master = this.ctx.createGain();
      this.master.gain.value = 0.34;
      this.master.connect(this.ctx.destination);
      return this.ctx;
    },

    async setEnabled(enabled) {
      try {
        if (enabled) {
          const ctx = this.ensure();
          if (!ctx) return false;
          await ctx.resume();
          this.on = true;
          this.master.gain.cancelScheduledValues(ctx.currentTime);
          this.master.gain.setValueAtTime(Math.max(this.master.gain.value, 0.0001), ctx.currentTime);
          this.master.gain.linearRampToValueAtTime(0.34, ctx.currentTime + 1.2);
          clearInterval(this.timer);
          this.playChord();
          this.timer = setInterval(() => this.playChord(), 6800);
          return true;
        }
        this.on = false;
        clearInterval(this.timer);
        this.timer = null;
        if (this.ctx && this.master) {
          const t = this.ctx.currentTime;
          this.master.gain.cancelScheduledValues(t);
          this.master.gain.setValueAtTime(this.master.gain.value, t);
          this.master.gain.linearRampToValueAtTime(0.0001, t + 0.5);
        }
        return false;
      } catch {
        return this.on;
      }
    },

    toggle() {
      return this.setEnabled(!this.on);
    },

    playChord() {
      if (!this.on || !this.ctx || !this.master) return;
      const ctx = this.ctx;
      const now = ctx.currentTime + 0.05;
      const chord = this.chords[this.chord % this.chords.length];
      this.chord += 1;
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 1150;
      filter.Q.value = 0.4;
      filter.connect(this.master);

      chord.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = i % 2 ? 'sine' : 'triangle';
        osc.frequency.value = freq;
        osc.detune.value = (i - 1.5) * 2.2;
        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.linearRampToValueAtTime(0.021 / (1 + i * 0.16), now + 2.4);
        gain.gain.setValueAtTime(0.021 / (1 + i * 0.16), now + 5.2);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 9.4);
        osc.connect(gain);
        gain.connect(filter);
        osc.start(now);
        osc.stop(now + 9.6);
      });
    },

    chime(up = true) {
      if (!this.on || !this.ctx || !this.master) return;
      const ctx = this.ctx;
      const now = ctx.currentTime + 0.02;
      const notes = up ? [523.25, 659.25, 783.99] : [392.0, 329.63];
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = freq;
        const t0 = now + i * 0.09;
        gain.gain.setValueAtTime(0.0001, t0);
        gain.gain.linearRampToValueAtTime(0.05, t0 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.9);
        osc.connect(gain);
        gain.connect(this.master);
        osc.start(t0);
        osc.stop(t0 + 1);
      });
    },

    click() {
      if (!this.on || !this.ctx || !this.master) return;
      const ctx = this.ctx;
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = 740;
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(0.028, now + 0.008);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.16);
      osc.connect(gain);
      gain.connect(this.master);
      osc.start(now);
      osc.stop(now + 0.2);
    },
  };

  /* ------------------------------------------------------------
     persistence
     ------------------------------------------------------------ */
  function safeGet(key) {
    try { return localStorage.getItem(key); } catch { return null; }
  }
  function safeSet(key, value) {
    try { localStorage.setItem(key, value); } catch { /* ignore */ }
  }
  function safeRemove(key) {
    try { localStorage.removeItem(key); } catch { /* ignore */ }
  }

  function readSave() {
    try {
      const raw = safeGet(SAVE_KEY);
      if (!raw) return null;
      const save = JSON.parse(raw);
      if (!save || typeof save !== 'object') return null;
      const dayIndex = Number(save.dayIndex);
      const beatIndex = Number(save.beatIndex);
      if (!Number.isInteger(dayIndex) || dayIndex < 0 || dayIndex >= STORY.days.length) return null;
      const beats = STORY.days[dayIndex].beats;
      const atEnding = save.atEnding === true && dayIndex === STORY.days.length - 1 && beatIndex === beats.length;
      if (!atEnding && (!Number.isInteger(beatIndex) || beatIndex < 0 || beatIndex >= beats.length)) return null;
      return {
        name: typeof save.name === 'string' && save.name.trim() ? save.name.slice(0, 12) : '민준',
        dayIndex,
        beatIndex,
        affection: Math.min(100, Math.max(0, Number(save.affection) || 0)),
        memories: Array.isArray(save.memories) ? save.memories.filter((id) => STORY.memories[id]) : [],
        mood: MOODS[save.mood] ? save.mood : 'neutral',
        atEnding,
      };
    } catch { return null; }
  }

  function writeSave(overrides = {}) {
    if (state.phase !== 'play') return;
    safeSet(SAVE_KEY, JSON.stringify({
      name: state.name,
      dayIndex: state.dayIndex,
      beatIndex: state.beatIndex,
      affection: state.affection,
      memories: state.memories,
      mood: state.mood,
      atEnding: false,
      ...overrides,
      at: Date.now(),
    }));
  }

  function saveGame() {
    writeSave();
  }

  // persist the result of a choice immediately, resuming at the next beat
  // (or at the ending, for the very last choice of the story)
  function checkpointAfterChoice() {
    const day = currentDay();
    if (!day) return;
    const nextBeat = state.beatIndex + 1;
    if (nextBeat < day.beats.length) {
      writeSave({ beatIndex: nextBeat });
    } else if (state.dayIndex < STORY.days.length - 1) {
      writeSave({
        dayIndex: state.dayIndex + 1,
        beatIndex: 0,
        mood: STORY.days[state.dayIndex + 1].mood || 'neutral',
      });
    } else {
      writeSave({ beatIndex: nextBeat, atEnding: true });
    }
  }

  function clearSave() {
    safeRemove(SAVE_KEY);
  }

  function refreshContinue() {
    const save = readSave();
    if (save && state.phase === 'title') {
      el.continueBtn.hidden = false;
      el.continueBtn.textContent = save.atEnding
        ? '이어서 하기 · 엔딩'
        : `이어서 하기 · DAY ${save.dayIndex + 1}`;
      if (!el.nameInput.value) el.nameInput.value = save.name;
    } else {
      el.continueBtn.hidden = true;
      el.continueBtn.textContent = '이어서 하기';
    }
  }

  /* ------------------------------------------------------------
     ui
     ------------------------------------------------------------ */
  function setScreen(name) {
    state.phase = name;
    el.body.dataset.screen = name;
  }

  function clamp(n, lo, hi) {
    return Math.min(hi, Math.max(lo, n));
  }

  function currentDay() {
    return STORY.days[state.dayIndex];
  }

  function buildProgress() {
    if (el.progress.childElementCount === STORY.days.length) return;
    el.progress.innerHTML = '';
    for (let i = 0; i < STORY.days.length; i += 1) {
      const dot = document.createElement('i');
      dot.dataset.day = String(i);
      el.progress.appendChild(dot);
    }
  }

  function updateDayUI() {
    const day = currentDay();
    if (!day) return;
    el.dayLabel.textContent = `DAY ${day.day}`;
    el.chapterLabel.textContent = day.title;
    el.placeLabel.textContent = day.place;
    el.chapterQuote.textContent = day.quote || '';
    buildProgress();
    [...el.progress.children].forEach((dot, i) => {
      dot.classList.toggle('done', i < state.dayIndex);
      dot.classList.toggle('on', i === state.dayIndex);
    });
  }

  function updateAffection(animate = false) {
    const v = clamp(Math.round(state.affection), 0, 100);
    el.affectionFill.style.transform = `scaleX(${v / 100})`;
    el.affectionValue.textContent = String(v);
    el.meter.setAttribute('aria-valuenow', String(v));
    if (animate) {
      el.meter.animate(
        [{ filter: 'brightness(1)' }, { filter: 'brightness(1.35)' }, { filter: 'brightness(1)' }],
        { duration: 620, easing: 'ease-out' }
      );
    }
  }

  function setMood(mood, pop = false) {
    const safe = MOODS[mood] ? mood : 'neutral';
    state.mood = safe;
    el.portrait.setAttribute('class', `portrait mood-${safe}`);
    el.moodChip.textContent = MOODS[safe];
    if (pop) {
      el.moodChip.classList.remove('pop');
      void el.moodChip.offsetWidth;
      el.moodChip.classList.add('pop');
    }
  }

  function toast(html, down = false) {
    const box = document.createElement('div');
    box.className = 'toast' + (down ? ' down' : '');
    box.innerHTML = html;
    el.toasts.appendChild(box);
    setTimeout(() => box.remove(), 3000);
  }

  function choiceToast(option) {
    const delta = Number(option.delta) || 0;
    if (delta > 0) {
      toast(`<span class="th">♥</span> 서아의 마음 <span class="num">+${delta}</span>`);
    } else if (delta < 0) {
      toast(`<span class="th">♥</span> 서아의 마음 <span class="num">${delta}</span>`, true);
    } else {
      toast('<span class="th">·</span> 서아가 조용히 고개를 끄덕였다');
    }
    if (option.memory) {
      const id = option.memory;
      setTimeout(() => {
        if (state.memories.includes(id)) {
          toast(`<span class="th">✿</span> ${STORY.memories[id]}`);
        }
      }, 420);
    }
  }

  function showNext(show, label = '계속') {
    el.nextBtn.hidden = !show;
    if (show) {
      el.nextBtn.innerHTML = `${label} <span aria-hidden="true">›</span>`;
      el.keyHint.innerHTML = '클릭 또는 <kbd>Space</kbd>';
    }
  }

  function hideChoices() {
    el.choices.innerHTML = '';
    choiceResolve = null;
    currentOption = null;
  }

  /* ------------------------------------------------------------
     dialogue
     ------------------------------------------------------------ */
  function applyName(text) {
    return String(text).replace(/\{name\}/g, state.name);
  }

  function displayLine(line) {
    return new Promise((resolve) => {
      const who = line.who || 'narr';
      const isNarr = who === 'narr';
      el.speaker.hidden = isNarr;
      el.speaker.dataset.who = who === 'me' ? 'me' : 'seoah';
      el.speaker.textContent = who === 'seoah' ? '서아' : who === 'me' ? state.name : '';
      el.line.classList.toggle('narr', isNarr);
      el.line.textContent = '';
      showNext(false);

      const full = applyName(line.text);
      const chars = Array.from(full);
      const caret = document.createElement('span');
      caret.className = 'caret';
      let i = 0;
      typing = true;

      const finish = () => {
        if (!typing) return;
        typing = false;
        clearInterval(typeTimer);
        typeTimer = null;
        typeComplete = null;
        el.line.textContent = full;
        advanceResolve = resolve;
        showNext(true, '계속');
      };

      typeComplete = finish;

      if (chars.length === 0) {
        finish();
        return;
      }

      typeTimer = setInterval(() => {
        i += 1;
        el.line.textContent = chars.slice(0, i).join('');
        el.line.appendChild(caret);
        if (i >= chars.length) finish();
      }, isNarr ? 17 : 23);
    });
  }

  function finishTyping() {
    if (typing && typeComplete) typeComplete();
  }

  async function playLines(lines, id) {
    if (!Array.isArray(lines)) return;
    for (const line of lines) {
      if (id !== runId) return;
      await displayLine(line);
      if (id !== runId) return;
    }
  }

  function advance() {
    if (!overlayOpen() && advanceResolve) {
      const resolve = advanceResolve;
      advanceResolve = null;
      showNext(false);
      resolve();
    }
  }

  function onAdvanceInput() {
    if (overlayOpen()) return;
    Sound.click();
    if (typing) finishTyping();
    else advance();
  }

  /* ------------------------------------------------------------
     choices
     ------------------------------------------------------------ */
  function renderChoices(choice) {
    el.choices.innerHTML = '';
    const prompt = document.createElement('p');
    prompt.className = 'choice-prompt';
    prompt.textContent = choice.prompt || '어떻게 할까?';
    el.choices.appendChild(prompt);

    choice.options.forEach((option, index) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'choice';
      btn.style.setProperty('--delay', `${index * 70}ms`);
      btn.innerHTML = `<span class="num">${index + 1}</span><span class="choice-text"></span>`;
      btn.querySelector('.choice-text').textContent = applyName(option.text);
      btn.addEventListener('click', () => selectChoice(option, btn));
      el.choices.appendChild(btn);
    });

    el.nextBtn.hidden = true;
    el.keyHint.innerHTML = '숫자 <kbd>1</kbd>–<kbd>3</kbd> 또는 클릭';
  }

  function waitChoice(choice) {
    renderChoices(choice);
    return new Promise((resolve) => {
      choiceResolve = resolve;
    });
  }

  function selectChoice(option, btn) {
    if (!choiceResolve || btn.disabled) return;
    const resolve = choiceResolve;
    choiceResolve = null;
    currentOption = option;
    [...el.choices.querySelectorAll('.choice')].forEach((b) => {
      b.disabled = true;
      b.classList.toggle('chosen', b === btn);
    });
    Sound.click();
    setTimeout(() => resolve(option), 260);
  }

  function applyChoice(option) {
    const delta = Number(option.delta) || 0;
    state.affection = clamp(state.affection + delta, 0, 100);
    setMood(option.mood || state.mood, true);
    updateAffection(true);
    if (option.memory && !state.memories.includes(option.memory)) {
      state.memories.push(option.memory);
    }
    choiceToast(option);
    if (delta > 0) Sound.chime(true);
    else if (delta < 0) Sound.chime(false);
  }

  /* ------------------------------------------------------------
     game flow
     ------------------------------------------------------------ */
  function overlayOpen() {
    return !el.dayVeil.hidden || !el.minigame.hidden || !el.menu.hidden ||
      !el.confirm.hidden || !el.ending.hidden;
  }

  function abortRun() {
    runId += 1;
    if (typeTimer) clearInterval(typeTimer);
    typeTimer = null;
    typing = false;
    typeComplete = null;
    if (advanceResolve) {
      const resolve = advanceResolve;
      advanceResolve = null;
      resolve();
    }
    choiceResolve = null;
    stopMini();
  }

  function showDayIntro(day) {
    return new Promise((resolve) => {
      el.veilDay.textContent = `DAY ${day.day}`;
      el.veilTitle.textContent = day.title;
      el.veilQuote.textContent = day.quote || '';
      el.dayVeil.hidden = false;
      let done = false;

      const finish = () => {
        if (done) return;
        done = true;
        clearTimeout(timer);
        el.dayVeil.removeEventListener('click', onClick);
        el.veilSkip.removeEventListener('click', onSkip);
        el.dayVeil.hidden = true;
        resolve();
      };
      const onSkip = (e) => { e.stopPropagation(); finish(); };
      const onClick = () => finish();
      el.veilSkip.addEventListener('click', onSkip);
      el.dayVeil.addEventListener('click', onClick);
      const timer = setTimeout(finish, window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 1500 : 2900);
    });
  }

  async function runBeat(id) {
    if (id !== runId) return;
    const day = STORY.days[state.dayIndex];
    const beat = day && day.beats[state.beatIndex];
    if (!beat) {
      finishGame();
      return;
    }

    updateDayUI();
    saveGame();
    setMood(state.mood);

    if (beat.minigame) {
      await playMiniGame();
      if (id !== runId) return;
    }

    await playLines(beat.lines, id);
    if (id !== runId) return;

    if (beat.choice) {
      const option = await waitChoice(beat.choice);
      if (id !== runId) return;
      hideChoices();
      applyChoice(option);
      checkpointAfterChoice();
      await playLines(option.reply, id);
      if (id !== runId) return;
    }

    state.beatIndex += 1;
    saveGame();

    if (state.beatIndex < day.beats.length) {
      runBeat(id);
      return;
    }

    await endDay(id);
  }

  async function endDay(id) {
    if (id !== runId) return;
    if (state.dayIndex >= STORY.days.length - 1) {
      finishGame();
      return;
    }
    state.dayIndex += 1;
    state.beatIndex = 0;
    state.mood = STORY.days[state.dayIndex].mood || 'neutral';
    saveGame();
    updateDayUI();
    updateAffection();
    setMood(state.mood);
    await showDayIntro(STORY.days[state.dayIndex]);
    if (id !== runId) return;
    runBeat(id);
  }

  function resolveEnding() {
    const affection = state.affection;
    const memories = state.memories.length;
    if (affection >= 85 && memories >= 5) return 'secret';
    if (affection >= 78) return 'true';
    if (affection >= 55) return 'good';
    if (affection >= 32) return 'normal';
    return 'bad';
  }

  function finishGame() {
    runId += 1;
    el.toasts.innerHTML = '';
    const key = resolveEnding();
    const ending = STORY.endings[key];
    state.phase = 'ending';
    clearSave();
    hideChoices();
    showNext(false);

    el.endingEyebrow.textContent = ending.eyebrow;
    el.endingTitle.textContent = ending.title;
    el.endingBody.innerHTML = ending.body.map((p) => `<p>${escapeHtml(p)}</p>`).join('');
    el.endingQuote.textContent = ending.quote;
    el.endingAffection.textContent = String(Math.round(state.affection));
    el.endingMemoryCount.textContent = `${state.memories.length}`;

    el.endingMemories.innerHTML = '';
    state.memories.forEach((mid) => {
      if (!STORY.memories[mid]) return;
      const chip = document.createElement('span');
      chip.className = 'memory-chip';
      chip.textContent = STORY.memories[mid];
      el.endingMemories.appendChild(chip);
    });

    el.ending.hidden = false;
    el.body.dataset.screen = 'ending';
    el.ending.scrollTop = 0;
    buildProgress();
    [...el.progress.children].forEach((dot) => {
      dot.classList.remove('on');
      dot.classList.add('done');
    });
    Sound.chime(key === 'true' || key === 'secret');
    refreshContinue();
  }

  function escapeHtml(text) {
    return String(text).replace(/[&<>"']/g, (c) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
    }[c]));
  }

  /* ------------------------------------------------------------
     minigame — heartbeat timing
     ------------------------------------------------------------ */
  function playMiniGame() {
    return new Promise((resolve) => {
      const hearts = [...el.miniHearts.children];
      hearts.forEach((h) => { h.classList.remove('on'); h.textContent = '♡'; });
      el.miniScore.textContent = '세 번의 박자 · 0 / 3';
      el.miniTap.textContent = '지금!';
      el.miniTap.disabled = false;
      el.minigame.hidden = false;
      el.miniMarker.style.left = '2%';

      miniState = {
        round: 0,
        points: 0,
        mode: 'tap',
        running: true,
        raf: 0,
        roundStart: 0,
        resolve,
        autoMiss: null,
        position: 2,
      };

      startMiniRound();
    });
  }

  function startMiniRound() {
    const m = miniState;
    if (!m) return;
    m.mode = 'tap';
    m.roundStart = performance.now();
    el.miniScore.textContent = `세 번의 박자 · ${m.round} / 3`;
    el.miniTap.textContent = '지금!';

    const loop = (now) => {
      if (!miniState || miniState !== m || m.mode !== 'tap') return;
      const t = (now - m.roundStart) / 420;
      const pos = 50 + 48 * Math.sin(t - Math.PI / 2);
      m.position = pos;
      el.miniMarker.style.left = `${pos}%`;
      m.raf = requestAnimationFrame(loop);
    };
    m.raf = requestAnimationFrame(loop);

    clearTimeout(m.autoMiss);
    m.autoMiss = setTimeout(() => {
      if (miniState === m && m.mode === 'tap') resolveMiniTap(true);
    }, 4200);
  }

  function resolveMiniTap(auto = false) {
    const m = miniState;
    if (!m || m.mode !== 'tap') return;
    m.mode = 'wait';
    cancelAnimationFrame(m.raf);
    clearTimeout(m.autoMiss);

    const dist = auto ? 100 : Math.abs(m.position - 50);
    let points = 0;
    let label = 'MISS';
    if (!auto) {
      if (dist <= 7) { points = 3; label = 'PERFECT'; }
      else if (dist <= 15) { points = 2; label = 'GREAT'; }
      else if (dist <= 25) { points = 1; label = 'GOOD'; }
    }

    m.points += points;
    m.round += 1;
    const heart = el.miniHearts.children[m.round - 1];
    if (heart) {
      heart.textContent = points > 0 ? '♥' : '♡';
      heart.classList.toggle('on', points > 0);
    }
    el.miniScore.textContent = `세 번의 박자 · ${m.round} / 3`;

    const score = document.createElement('div');
    score.className = 'float-score';
    score.textContent = points > 0 ? `${label} +${points}` : 'MISS';
    el.miniMarker.parentElement.appendChild(score);
    setTimeout(() => score.remove(), 1000);

    if (m.round >= 3) {
      m.mode = 'done';
      const bonus = m.points;
      if (bonus > 0) {
        state.affection = clamp(state.affection + bonus, 0, 100);
        updateAffection(true);
        toast(`<span class="th">♥</span> 심장이 뛴 만큼, 서아의 마음 <span class="num">+${bonus}</span>`);
        Sound.chime(true);
      } else {
        toast('<span class="th">·</span> 박자를 놓쳤지만, 서아는 웃어주었다');
      }
      el.miniScore.textContent = `세 번의 박자 · ${m.points} / 9`;
      el.miniTap.textContent = '계속';
      return;
    }

    setTimeout(() => {
      if (miniState === m && m.mode === 'wait') startMiniRound();
    }, 620);
  }

  function miniContinue() {
    if (!miniState) return;
    const resolve = miniState.resolve;
    miniState = null;
    el.minigame.hidden = true;
    resolve();
  }

  function stopMini() {
    if (miniState) {
      cancelAnimationFrame(miniState.raf);
      clearTimeout(miniState.autoMiss);
      miniState = null;
    }
    if (el.minigame) el.minigame.hidden = true;
  }

  /* ------------------------------------------------------------
     start / restart / title
     ------------------------------------------------------------ */
  function resetState(name) {
    state.phase = 'play';
    state.name = name || '민준';
    state.dayIndex = 0;
    state.beatIndex = 0;
    state.affection = STORY.startAffection;
    state.memories = [];
    state.mood = STORY.days[0].mood || 'neutral';
  }

  function hideAllVeils() {
    el.dayVeil.hidden = true;
    el.minigame.hidden = true;
    el.menu.hidden = true;
    el.confirm.hidden = true;
    el.ending.hidden = true;
    el.toasts.innerHTML = '';
  }

  function syncSoundUI() {
    el.soundBtn.setAttribute('aria-pressed', String(Sound.on));
    el.soundBtn.setAttribute('aria-label', Sound.on ? '소리 끄기' : '소리 켜기');
    el.menuSoundState.textContent = Sound.on ? '켜짐' : '꺼짐';
    safeSet(SOUND_KEY, Sound.on ? '1' : '0');
  }

  async function maybeEnableSound() {
    const pref = safeGet(SOUND_KEY);
    if (pref === '0') {
      syncSoundUI();
      return;
    }
    const ok = await Sound.setEnabled(true);
    if (!ok) await Sound.setEnabled(true);
    syncSoundUI();
  }

  function beginCurrent(skipIntro = false) {
    const id = runId;
    updateDayUI();
    updateAffection();
    setMood(state.mood);
    if (skipIntro) {
      runBeat(id);
      return;
    }
    const day = currentDay();
    showDayIntro(day).then(() => {
      if (id === runId) runBeat(id);
    });
  }

  function startNewGame() {
    abortRun();
    clearSave();
    hideAllVeils();
    resetState(state.name);
    setScreen('play');
    updateDayUI();
    updateAffection();
    setMood(state.mood);
    el.line.textContent = '';
    el.speaker.hidden = true;
    showNext(false);
    maybeEnableSound();
    beginCurrent(false);
  }

  function continueGame() {
    const save = readSave();
    if (!save) {
      startNewGame();
      return;
    }
    abortRun();
    hideAllVeils();
    state.phase = 'play';
    state.name = save.name;
    state.dayIndex = save.dayIndex;
    state.beatIndex = save.beatIndex;
    state.affection = save.affection;
    state.memories = [...save.memories];
    state.mood = save.mood;
    setScreen('play');
    updateDayUI();
    updateAffection();
    setMood(state.mood);
    el.line.textContent = '';
    el.speaker.hidden = true;
    showNext(false);
    maybeEnableSound();
    if (save.atEnding) {
      finishGame();
      return;
    }
    beginCurrent(false);
  }

  function returnToTitle(keepSave = true) {
    abortRun();
    hideAllVeils();
    if (!keepSave) clearSave();
    state.phase = 'title';
    setScreen('title');
    setMood('neutral');
    el.line.textContent = '';
    el.speaker.hidden = true;
    showNext(false);
    el.nameInput.value = state.name || '민준';
    refreshContinue();
    syncSoundUI();
  }

  function askConfirm(message, yesLabel, action) {
    el.confirmText.innerHTML = message;
    el.confirmYes.textContent = yesLabel || '확인';
    confirmAction = action;
    el.confirm.hidden = false;
  }

  function closeConfirm() {
    el.confirm.hidden = true;
    confirmAction = null;
  }

  /* ------------------------------------------------------------
     petals
     ------------------------------------------------------------ */
  function makePetals() {
    const count = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 16;
    for (let i = 0; i < count; i += 1) {
      const petal = document.createElement('span');
      petal.className = 'petal';
      const size = 6 + Math.random() * 8;
      petal.style.left = `${Math.random() * 100}%`;
      petal.style.width = `${size}px`;
      petal.style.height = `${size * 1.35}px`;
      petal.style.opacity = '0';
      petal.style.animationDuration = `${10 + Math.random() * 12}s`;
      petal.style.animationDelay = `${-Math.random() * 18}s`;
      petal.style.setProperty('--drift', `${-80 + Math.random() * 200}px`);
      el.petals.appendChild(petal);
    }
  }

  /* ------------------------------------------------------------
     events
     ------------------------------------------------------------ */
  function bindEvents() {
    el.startBtn.addEventListener('click', () => {
      const name = (el.nameInput.value || '').trim().slice(0, 12) || '민준';
      if (readSave()) {
        askConfirm('저장된 이야기가 있어요.<br />처음부터 새로 시작할까요?<br /><small>기존 진행 상황은 사라집니다.</small>', '새로 시작', () => {
          closeConfirm();
          state.name = name;
          startNewGame();
        });
        return;
      }
      state.name = name;
      startNewGame();
    });

    el.continueBtn.addEventListener('click', () => {
      Sound.click();
      continueGame();
    });

    el.titleCredits.addEventListener('click', () => {
      toast('<span class="th">✿</span> 이야기 · 그림 · 코드 모두 이 페이지 안에서');
    });

    el.nameInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        el.startBtn.click();
      }
    });

    el.nextBtn.addEventListener('click', onAdvanceInput);

    el.soundBtn.addEventListener('click', async () => {
      await Sound.toggle();
      syncSoundUI();
      if (Sound.on) Sound.click();
    });

    el.menuBtn.addEventListener('click', () => {
      el.menu.hidden = false;
      Sound.click();
    });
    el.menuClose.addEventListener('click', () => {
      el.menu.hidden = true;
    });
    el.menuSound.addEventListener('click', async () => {
      await Sound.toggle();
      syncSoundUI();
      if (Sound.on) Sound.click();
    });
    el.menuRestart.addEventListener('click', () => {
      el.menu.hidden = true;
      askConfirm('처음부터 다시 시작할까요?<br /><small>지금까지의 선택이 사라집니다.</small>', '다시 시작', () => {
        closeConfirm();
        startNewGame();
      });
    });
    el.menuTitleBtn.addEventListener('click', () => {
      el.menu.hidden = true;
      returnToTitle(true);
    });

    el.miniTap.addEventListener('click', () => {
      if (!miniState) return;
      if (miniState.mode === 'tap') resolveMiniTap(false);
      else if (miniState.mode === 'done') miniContinue();
    });

    el.endingRestart.addEventListener('click', () => {
      el.ending.hidden = true;
      startNewGame();
    });
    el.endingTitleBtn.addEventListener('click', () => {
      el.ending.hidden = true;
      returnToTitle(false);
    });

    el.confirmNo.addEventListener('click', closeConfirm);
    el.confirmYes.addEventListener('click', () => {
      const action = confirmAction;
      closeConfirm();
      if (action) action();
    });
    el.confirm.addEventListener('click', (e) => {
      if (e.target === el.confirm) closeConfirm();
    });

    el.menu.addEventListener('click', (e) => {
      if (e.target === el.menu) el.menu.hidden = true;
    });

    document.addEventListener('keydown', (e) => {
      if (!el.confirm.hidden) {
        if (e.key === 'Escape') closeConfirm();
        return;
      }
      if (!el.menu.hidden) {
        if (e.key === 'Escape') el.menu.hidden = true;
        return;
      }
      if (!el.minigame.hidden) {
        if (e.code === 'Space' || e.key === 'Enter') {
          e.preventDefault();
          if (miniState && miniState.mode === 'tap') resolveMiniTap(false);
          else if (miniState && miniState.mode === 'done') miniContinue();
        }
        return;
      }
      if (!el.ending.hidden) return;
      if (!el.dayVeil.hidden) return;
      if (document.activeElement === el.nameInput) return;

      if (e.code === 'Space' || e.key === 'Enter') {
        e.preventDefault();
        onAdvanceInput();
        return;
      }

      if (/^[1-3]$/.test(e.key)) {
        const buttons = [...el.choices.querySelectorAll('.choice')];
        const btn = buttons[Number(e.key) - 1];
        if (btn && !btn.disabled) btn.click();
      }

      if (e.key === 'm' || e.key === 'M') {
        el.menu.hidden = !el.menu.hidden;
      }
    });

    document.addEventListener('visibilitychange', () => {
      try {
        if (!Sound.on || !Sound.ctx) return;
        if (document.hidden) Sound.ctx.suspend();
        else Sound.ctx.resume();
      } catch { /* audio is optional */ }
    });
  }

  /* ------------------------------------------------------------
     boot
     ------------------------------------------------------------ */
  function boot() {
    makePetals();
    bindEvents();
    setScreen('title');
    setMood('neutral');
    el.ending.hidden = true;
    const save = readSave();
    state.name = save ? save.name : '민준';
    el.nameInput.value = state.name;
    refreshContinue();
    syncSoundUI();
    buildProgress();
    updateAffection(false);

    // debug / testing hook
    window.__summerGame = {
      state,
      gotoDay(dayNumber, affection = 80) {
        abortRun();
        hideAllVeils();
        setScreen('play');
        state.phase = 'play';
        state.dayIndex = clamp(dayNumber - 1, 0, STORY.days.length - 1);
        state.beatIndex = 0;
        state.affection = clamp(affection, 0, 100);
        state.memories = Object.keys(STORY.memories).slice(0, 6);
        state.mood = STORY.days[state.dayIndex].mood || 'neutral';
        updateDayUI();
        updateAffection();
        setMood(state.mood);
        runBeat(runId);
      },
      ending(key = 'secret') {
        const presets = {
          secret: [92, 6],
          true: [80, 3],
          good: [62, 2],
          normal: [40, 1],
          bad: [20, 0],
        };
        const [affection, memoryCount] = presets[key] || presets.secret;
        state.affection = affection;
        state.memories = Object.keys(STORY.memories).slice(0, memoryCount);
        finishGame();
      },
    };
  }

  boot();
})();
