

const TIMINGS = {
  SHOW_ON_BASE: 500,
  SHOW_GAP_BASE: 200,
  SHOW_ON_MIN: 200,
  SHOW_GAP_MIN: 80,
  SPEEDUP_PER_LEVEL: 25,
  NEXT_ROUND: 700,
};

const STORAGE_KEY = 'simon.settings';

const NOTE = {
  G3: 196.00,
  C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392.00, A4: 440.00, B4: 493.88,
  C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46, G5: 783.99,
};

const MELODY_FREQS = [
  NOTE.E4, NOTE.F4, NOTE.G4, NOTE.A4, NOTE.B4,
  NOTE.C5, NOTE.D5, NOTE.E5, NOTE.F5, NOTE.G5,
];

const SCALE = [
  NOTE.C4, NOTE.D4, NOTE.E4, NOTE.F4, NOTE.G4,
  NOTE.A4, NOTE.B4, NOTE.C5, NOTE.D5, NOTE.E5,
];

const PALETTE = {
  green:  { base: '#2ecc71', lit: '#7dffb0' },
  red:    { base: '#e74c3c', lit: '#ff8a7a' },
  yellow: { base: '#f1c40f', lit: '#ffe680' },
  blue:   { base: '#3498db', lit: '#7fc8ff' },
  teal:   { base: '#1abc9c', lit: '#6effe0' },
  cyan:   { base: '#00bcd4', lit: '#7fe9ff' },
  orange: { base: '#e67e22', lit: '#ffbd80' },
  pink:   { base: '#e84393', lit: '#ff9ec9' },
  purple: { base: '#9b59b6', lit: '#d8a6f0' },
  lime:   { base: '#b8d92e', lit: '#e6f58a' },
};

const COLOR_ORDER = [
  'green', 'red', 'yellow', 'blue', 'teal',
  'cyan', 'orange', 'pink', 'purple', 'lime',
];

const DEFAULT_KEYS_BY_SIZE = {
  4:  ['q', 'w', 'a', 's'],
  5:  ['q', 'w', 'e', 'a', 's'],
  6:  ['q', 'w', 'e', 'a', 's', 'd'],
  7:  ['q', 'w', 'e', 'r', 'a', 's', 'd'],
  8:  ['q', 'w', 'e', 'r', 'a', 's', 'd', 'f'],
  9:  ['q', 'w', 'e', 'r', 't', 'a', 's', 'd', 'f'],
  10: ['q', 'w', 'e', 'r', 't', 'a', 's', 'd', 'f', 'g'],
};

const TABLE_LAYOUTS = {
  4:  { cols: 2, rows: 2 },
  5:  { cols: 3, rows: 2 },
  6:  { cols: 3, rows: 2 },
  7:  { cols: 4, rows: 2 },
  8:  { cols: 4, rows: 2 },
  9:  { cols: 3, rows: 3 },
  10: { cols: 5, rows: 2 },
};

const DEFAULT_SETTINGS = {
  mode: 'memory',
  size: 4,
  layout: 'circle',    // 'circle' | 'table'
  sound: 'timbre',
  sustain: 1.0,
  keys: [...DEFAULT_KEYS_BY_SIZE[4]],
};

const MODE_INFO = {
  memory: 'Запоминание: классический Simon — последовательность растёт, ошибка завершает игру.',
  free:   'Свободный: последовательность не показывается, нажимайте секторы в любом порядке — просто играйте звуками.',
};

const SIZE_INFO = {
  4:  'Классический Simon: 4 сектора крестом.',
  5:  'Пять плиток (таблица).',
  6:  'Шесть плиток (таблица).',
  7:  'Семь плиток (таблица).',
  8:  'Восемь плиток (таблица).',
  9:  'Девять плиток (таблица).',
  10: 'Десять плиток (таблица).',
};

const SOUND_INFO = {
  sine:   'Простой синус: чистый тон, каждая плитка — своя нота.',
  timbre: 'Тембры: у каждой плитки своя форма волны, гармоники и огибающая.',
  melody: 'Мелодия: ноты подобраны так, чтобы складываться в узнаваемую мелодию.',
};


const boardWrap  = document.getElementById('boardWrap');
const boardEl    = document.getElementById('board');
const startBtn   = document.getElementById('startBtn');
const levelEl    = document.getElementById('level');
const statusEl   = document.getElementById('status');
const messageEl  = document.getElementById('message');
const modeLabel  = document.getElementById('modeLabel');

const subtitleEl  = document.getElementById('subtitle');
const easterEggEl = document.getElementById('easterEgg');
const keygridEl   = document.getElementById('keygrid');

const settingsBtn   = document.getElementById('settingsBtn');
const settingsModal = document.getElementById('settingsModal');
const modeGroup     = document.getElementById('modeGroup');
const modeHint      = document.getElementById('modeHint');
const sizeGroup     = document.getElementById('sizeGroup');
const sizeHint      = document.getElementById('sizeHint');
const layoutGroup   = document.getElementById('layoutGroup');
const layoutHint    = document.getElementById('layoutHint');
const layoutSection = document.getElementById('layoutSection');
const soundGroup    = document.getElementById('soundGroup');
const soundHint     = document.getElementById('soundHint');
const sustainRange  = document.getElementById('sustainRange');
const sustainValue  = document.getElementById('sustainValue');
const keysGroup     = document.getElementById('keysGroup');
const resetBtn      = document.getElementById('resetSettings');
const closeBtn      = document.getElementById('closeSettings');

const MIN_SIZE = 4;
const MAX_SIZE = 10;

function clampSize(v) {
  const n = Math.round(Number(v));
  if (!isFinite(n)) return MIN_SIZE;
  return Math.min(MAX_SIZE, Math.max(MIN_SIZE, n));
}

function clampSustain(v) {
  const n = Number(v);
  if (!isFinite(n)) return 1;
  return Math.min(3, Math.max(0.25, n));
}

function defaultKeysFor(size) { return [...DEFAULT_KEYS_BY_SIZE[size]]; }

function normalizeSettings(raw) {
  const size = clampSize(raw?.size ?? MIN_SIZE);
  const defKeys = defaultKeysFor(size);
  const keys = Array.isArray(raw?.keys) && raw.keys.length === size
    ? raw.keys.map(k => String(k).toLowerCase())
    : defKeys;
  const sound = ['sine', 'timbre', 'melody'].includes(raw?.sound) ? raw.sound : 'timbre';
  const sustain = clampSustain(raw?.sustain ?? 1);
  const layout = raw?.layout === 'table' ? 'table' : 'circle';
  return {
    mode: raw?.mode === 'free' ? 'free' : 'memory',
    size,
    layout,
    sound,
    sustain,
    keys,
  };
}

function loadSettings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return normalizeSettings(raw ? JSON.parse(raw) : DEFAULT_SETTINGS);
  } catch (_) {
    return normalizeSettings(DEFAULT_SETTINGS);
  }
}

function saveSettings() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch (_) {}
}

let settings = loadSettings();

const game = {
  sequence: [],
  playerInput: [],
  level: 0,
  isShowing: false,
  isAwaitingInput: false,
  isGameOver: true,
  timers: [],
  freeModeActive: false,
  padEls: [],
};

function setStatus(text) { statusEl.textContent = text; }

function setMessage(text, type) {
  messageEl.textContent = text;
  messageEl.classList.remove('message--error', 'message--success');
  if (type === 'error') messageEl.classList.add('message--error');
  if (type === 'success') messageEl.classList.add('message--success');
}

function updateLevel() { levelEl.textContent = String(game.level); }

function later(fn, delay) {
  const id = setTimeout(() => {
    game.timers = game.timers.filter(t => t !== id);
    fn();
  }, delay);
  game.timers.push(id);
  return id;
}

function clearTimers() {
  game.timers.forEach(clearTimeout);
  game.timers = [];
}

function wait(ms) { return new Promise(resolve => later(resolve, ms)); }

function padCount() { return settings.size; }

function freqForPad(index, scheme) {
  if (scheme === 'melody') {
    return MELODY_FREQS[index % MELODY_FREQS.length];
  }
  return SCALE[index % SCALE.length];
}

let audioCtx = null;
let masterGain = null;

function ensureAudio() {
  if (!audioCtx) {
    const AC = window.AudioContext || window.AudioContext;
    if (!AC) return null;
    audioCtx = new AC();
    masterGain = audioCtx.createGain();
    masterGain.gain.value = 0.9;
    masterGain.connect(audioCtx.destination);
  }
  if (audioCtx.state === 'suspended') audioCtx.resume();
  return audioCtx;
}

const TIMBRES = [
  { type: 'sine',     harmonics: [1, 0.35, 0.12], attack: 0.008, release: 1.0, detune: 0 },
  { type: 'triangle', harmonics: [1, 0.25, 0.10], attack: 0.010, release: 0.8, detune: 6 },
  { type: 'square',   harmonics: [1, 0.18],       attack: 0.004, release: 0.5, detune: 0 },
  { type: 'sawtooth', harmonics: [1, 0.30, 0.15], attack: 0.006, release: 0.7, detune: -4 },
  { type: 'sine',     harmonics: [1, 0.55, 0.20], attack: 0.020, release: 0.9, detune: 0 },
  { type: 'triangle', harmonics: [1, 0.45, 0.10], attack: 0.005, release: 0.6, detune: 3 },
  { type: 'square',   harmonics: [1, 0.10, 0.05], attack: 0.008, release: 0.55, detune: -2 },
  { type: 'sawtooth', harmonics: [1, 0.40, 0.22, 0.10], attack: 0.006, release: 1.1, detune: 4 },
];

function sustainShape(baseAttack, baseRelease, duration) {
  const s = clampSustain(settings.sustain);
  const attack  = Math.max(0.002, baseAttack * (s < 1 ? 1 : Math.min(s, 1.5)));
  const release = Math.max(0.08, baseRelease * s);
  const total   = Math.max(duration, release);
  return { attack, release, total };
}

function playSine(index, duration) {
  const ctx = audioCtx;
  const freq = freqForPad(index, 'sine');
  const { attack, total } = sustainShape(0.01, 0.25, duration);

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.value = freq;

  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.15, now + attack);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + total);

  osc.connect(gain).connect(masterGain);
  osc.start(now);
  osc.stop(now + total + 0.05);
  osc.onended = () => { try { gain.disconnect(); } catch (_) {} };
}

function playTimbre(index, duration) {
  const ctx = audioCtx;
  const baseFreq = freqForPad(index, 'timbre');
  const t = TIMBRES[index % TIMBRES.length];

  const { attack, total } = sustainShape(t.attack, t.release, duration);
  const now = ctx.currentTime;
  const stopAt = now + total + 0.05;

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.15, now + attack);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + total);

  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = Math.min(8000, baseFreq * 6);
  filter.Q.value = 0.7;

  gain.connect(filter).connect(masterGain);

  const oscs = [];
  t.harmonics.forEach((amp, h) => {
    const osc = ctx.createOscillator();
    osc.type = t.type;
    osc.frequency.value = baseFreq * (h + 1);
    osc.detune.value = t.detune * (h + 1);

    const hGain = ctx.createGain();
    hGain.gain.value = amp;

    osc.connect(hGain).connect(gain);
    osc.start(now);
    osc.stop(stopAt);
    oscs.push(osc);
  });

  if (t.type === 'sine' || t.type === 'triangle') {
    const detuneOsc = ctx.createOscillator();
    detuneOsc.type = t.type;
    detuneOsc.frequency.value = baseFreq;
    detuneOsc.detune.value = t.detune * 3;

    const dGain = ctx.createGain();
    dGain.gain.value = 0.12;

    detuneOsc.connect(dGain).connect(gain);
    detuneOsc.start(now);
    detuneOsc.stop(stopAt);
    oscs.push(detuneOsc);
  }

  oscs[oscs.length - 1].onended = () => {
    try { gain.disconnect(); filter.disconnect(); } catch (_) {}
  };
}

function playMelody(index, duration) {
  const ctx = audioCtx;
  const freq = freqForPad(index, 'melody');
  const { attack, total } = sustainShape(0.012, 0.6, duration);

  const now = ctx.currentTime;
  const stopAt = now + total + 0.05;

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.18, now + attack);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + total);

  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = Math.min(7000, freq * 5);
  filter.Q.value = 0.5;

  gain.connect(filter).connect(masterGain);

  [
    { f: freq,     a: 1.0 },
    { f: freq * 2, a: 0.28 },
    { f: freq * 3, a: 0.08 },
  ].forEach(({ f, a }) => {
    const osc = ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.value = f;

    const hGain = ctx.createGain();
    hGain.gain.value = a;

    osc.connect(hGain).connect(gain);
    osc.start(now);
    osc.stop(stopAt);
  });

  const detuneOsc = ctx.createOscillator();
  detuneOsc.type = 'triangle';
  detuneOsc.frequency.value = freq;
  detuneOsc.detune.value = 4;

  const dGain = ctx.createGain();
  dGain.gain.value = 0.12;
  detuneOsc.connect(dGain).connect(gain);
  detuneOsc.start(now);
  detuneOsc.stop(stopAt);

  detuneOsc.onended = () => {
    try { gain.disconnect(); filter.disconnect(); } catch (_) {}
  };
}

function playTone(index, duration = 0.25) {
  try {
    const ctx = ensureAudio();
    if (!ctx) return;

    switch (settings.sound) {
      case 'sine':   return playSine(index, duration);
      case 'melody': return playMelody(index, duration);
      case 'timbre':
      default:       return playTimbre(index, duration);
    }
  } catch (_) {}
}

function setPadsDisabled(disabled) {
  game.padEls.forEach(el => { el.disabled = disabled; });
}

function resolvedLayout() {
  if (settings.size !== 4) return 'table';
  return settings.layout === 'table' ? 'table' : 'circle';
}

function buildBoard() {
  const layout = resolvedLayout();

  const center = boardEl.querySelector('.board__center');
  boardEl.innerHTML = '';
  if (center) boardEl.appendChild(center);

  // Сброс классов и инлайн-стилей
  boardEl.classList.remove('board--table', 'board--circle');
  boardEl.style.gridTemplateColumns = '';
  boardEl.style.gridTemplateRows = '';
  boardEl.style.display = '';
  boardEl.style.padding = '';
  boardEl.style.position = '';

  game.padEls = [];

  if (layout === 'circle') {
    buildCircleBoard(center);
  } else {
    buildTableBoard(center);
  }
}

function buildCircleBoard(center) {
  boardEl.classList.add('board--circle');
  boardEl.style.gridTemplateColumns = '1fr 1fr';
  boardEl.style.gridTemplateRows = '1fr 1fr';

  const roundColors = ['green', 'red', 'yellow', 'blue'];

  for (let i = 0; i < 4; i++) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = `pad pad--${roundColors[i]}`;
    btn.dataset.index = String(i);
    btn.setAttribute('aria-label', `Сектор ${i + 1}`);
    btn.addEventListener('click', () => handlePadClick(Number(btn.dataset.index)));
    boardEl.insertBefore(btn, center);
    game.padEls.push(btn);
  }
}

function buildTableBoard(center) {
  const layout = TABLE_LAYOUTS[settings.size] || TABLE_LAYOUTS[6];

  boardEl.classList.add('board--table');
  boardEl.style.gridTemplateColumns = `repeat(${layout.cols}, 1fr)`;
  boardEl.style.gridTemplateRows = `repeat(${layout.rows}, 1fr)`;

  for (let i = 0; i < settings.size; i++) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'pad';
    btn.dataset.index = String(i);
    btn.setAttribute('aria-label', `Сектор ${i + 1}`);

    const colorName = COLOR_ORDER[i % COLOR_ORDER.length];
    const c = PALETTE[colorName];
    btn.style.background = c.base;
    btn.style.setProperty('--pad-lit', c.lit);
    btn.dataset.lit = 'true';

    btn.addEventListener('click', () => handlePadClick(Number(btn.dataset.index)));
    boardEl.insertBefore(btn, center);
    game.padEls.push(btn);
  }
}

function flashPad(index, duration = 200) {
  const el = game.padEls[index];
  if (!el) return;
  el.classList.add('active');
  later(() => el.classList.remove('active'), duration);
}

function keygridColumns() {
  const size = settings.size;
  if (size <= 4) return 2;
  if (size <= 6) return 3;
  if (size <= 8) return 4;
  if (size === 9) return 3;
  return 5;
}

function buildKeygrid() {
  const cols = keygridColumns();
  keygridEl.style.gridTemplateColumns = `repeat(${cols}, auto)`;
  keygridEl.innerHTML = '';

  for (let i = 0; i < settings.size; i++) {
    const colorName = COLOR_ORDER[i % COLOR_ORDER.length];
    const c = PALETTE[colorName];

    const kbd = document.createElement('kbd');
    kbd.dataset.key = String(i);
    kbd.textContent = formatKey(settings.keys[i]);

    kbd.style.background = c.base;
    kbd.style.borderColor = 'rgba(0, 0, 0, 0.35)';
    kbd.style.color = '#0b1210';
    kbd.style.fontWeight = '700';

    keygridEl.appendChild(kbd);
  }
}

function buildKeysUI() {
  const cols = keygridColumns();
  keysGroup.innerHTML = '';
  keysGroup.classList.add('keys--grid');
  keysGroup.style.gridTemplateColumns = `repeat(${cols}, minmax(0, 1fr))`;

  for (let i = 0; i < settings.size; i++) {
    const colorName = COLOR_ORDER[i % COLOR_ORDER.length];
    const c = PALETTE[colorName];

    const item = document.createElement('div');
    item.className = 'keys__item';

    const label = document.createElement('span');
    label.className = 'keys__label';
    label.textContent = String(i + 1);
    label.style.color = c.base;

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'keys__btn';
    btn.dataset.bind = String(i);
    btn.textContent = formatKey(settings.keys[i]);

    item.appendChild(label);
    item.appendChild(btn);
    keysGroup.appendChild(item);
  }
}

function randomPadIndex() {
  return Math.floor(Math.random() * padCount());
}

function extendSequence() {
  game.sequence.push(randomPadIndex());
  game.level = game.sequence.length;
  updateLevel();
}

function currentTimings() {
  const step = Math.max(0, game.level - 1) * TIMINGS.SPEEDUP_PER_LEVEL;
  return {
    on:  Math.max(TIMINGS.SHOW_ON_MIN,  TIMINGS.SHOW_ON_BASE  - step),
    gap: Math.max(TIMINGS.SHOW_GAP_MIN, TIMINGS.SHOW_GAP_BASE - step),
  };
}

async function showSequence() {
  game.isShowing = true;
  game.isAwaitingInput = false;
  game.playerInput = [];
  setPadsDisabled(true);
  setStatus('Смотрите…');

  const { on, gap } = currentTimings();

  for (let i = 0; i < game.sequence.length; i++) {
    const idx = game.sequence[i];
    const el = game.padEls[idx];
    if (!el) continue;

    el.classList.add('active');
    playTone(idx, Math.max(0.12, on / 1000));
    await wait(on);

    el.classList.remove('active');
    await wait(gap);
  }

  game.isShowing = false;
  game.isAwaitingInput = true;
  setPadsDisabled(false);
  setStatus('Ваш ход');
}

async function startRound() {
  extendSequence();
  setMessage('');
  await showSequence();
}

function startFreeMode() {
  game.isGameOver = false;
  game.isShowing = false;
  game.isAwaitingInput = true;
  game.freeModeActive = true;
  game.sequence = [];
  game.playerInput = [];
  game.level = 0;

  updateLevel();
  setMessage('');
  setStatus('Свободная игра');
  setPadsDisabled(false);
}

function stopFreeMode() {
  clearTimers();
  game.isGameOver = true;
  game.isShowing = false;
  game.isAwaitingInput = false;
  game.freeModeActive = false;

  game.padEls.forEach(el => el.classList.remove('active'));
  setPadsDisabled(true);

  setStatus('Готовы?');
  setMessage('');
  startBtn.disabled = false;
  startBtn.textContent = 'Старт';
}

function handlePadClick(index) {
  if (game.isGameOver || game.isShowing) return;
  if (!game.isAwaitingInput) return;

  const el = game.padEls[index];
  if (!el) return;

  flashPad(index, 200);
  playTone(index, 0.2);

  if (settings.mode === 'free') return;

  game.playerInput.push(index);
  const pos = game.playerInput.length - 1;

  if (game.sequence[pos] !== index) {
    endGame();
    return;
  }

  if (game.playerInput.length === game.sequence.length) {
    game.isAwaitingInput = false;
    setPadsDisabled(true);
    setStatus('Верно!');
    setMessage('Верно! Следующий уровень…', 'success');
    later(() => { if (!game.isGameOver) startRound(); }, TIMINGS.NEXT_ROUND);
  }
}

function endGame() {
  game.isGameOver = true;
  game.isShowing = false;
  game.isAwaitingInput = false;
  game.freeModeActive = false;
  clearTimers();

  game.padEls.forEach(el => el.classList.remove('active'));
  setPadsDisabled(true);

  setStatus('Игра окончена');
  if (game.level > 0) {
    setMessage(`Вы дошли до уровня ${game.level}`, 'error');
  } else {
    setMessage('');
  }
  startBtn.disabled = false;
  startBtn.textContent = 'Заново';
}

function startGame() {
  clearTimers();
  game.padEls.forEach(el => el.classList.remove('active'));

  game.sequence = [];
  game.playerInput = [];
  game.level = 0;
  game.isShowing = false;
  game.isAwaitingInput = false;
  game.isGameOver = false;
  game.freeModeActive = false;

  updateLevel();
  setMessage('');

  if (settings.mode === 'free') {
    startBtn.disabled = false;
    startBtn.textContent = 'Стоп';
    startFreeMode();
  } else {
    startBtn.disabled = true;
    startBtn.textContent = 'Игра идёт…';
    startRound();
  }
}

startBtn.addEventListener('click', () => {
  if (settings.mode === 'free' && game.freeModeActive) {
    stopFreeMode();
    return;
  }
  startGame();
});

function buildKeyMap() {
  const map = {};
  const ru = { 'q': 'й', 'w': 'ц', 'e': 'у', 'r': 'к', 't': 'е',
               'a': 'ф', 's': 'ы', 'd': 'в', 'f': 'а', 'g': 'п' };
  settings.keys.forEach((k, idx) => {
    if (!k) return;
    map[k] = idx;
    if (ru[k]) map[ru[k]] = idx;
  });
  return map;
}

document.addEventListener('keydown', (e) => {
  if (e.repeat) return;
  if (!settingsModal.hidden) return;

  const key = e.key.toLowerCase();

  if (key === 'enter' || key === ' ') {
    e.preventDefault();
    if (settings.mode === 'free' && game.freeModeActive) {
      stopFreeMode();
    } else if (!startBtn.disabled || game.isGameOver) {
      startGame();
    }
    return;
  }

  const map = buildKeyMap();
  if (key in map) {
    e.preventDefault();
    handlePadClick(map[key]);
  }
});

const EASTER_PHRASES = [
  'Симон не всегда говорит правду…',
  'Память — единственное, что у тебя осталось.',
  'Ошибка — это просто ещё один раунд.',
  'Он смотрит. Он всегда смотрит.',
  'Пять секунд славы — и снова с нуля.',
  'Ты уверен, что это был именно жёлтый?',
  'Симон говорит: «Не моргай».',
  'Каждый раунд — маленькая смерть.',
  'Ты слышишь этот звук? Это твоя память трещит.',
  'Никто не проходит дальше 12 уровня.',
];

let lastEasterIndex = -1;

subtitleEl.addEventListener('click', () => {
  let idx;
  do {
    idx = Math.floor(Math.random() * EASTER_PHRASES.length);
  } while (EASTER_PHRASES.length > 1 && idx === lastEasterIndex);
  lastEasterIndex = idx;

  easterEggEl.textContent = EASTER_PHRASES[idx];
  easterEggEl.classList.remove('is-visible');
  void easterEggEl.offsetWidth;
  easterEggEl.classList.add('is-visible');
});

function formatKey(k) {
  if (!k) return '—';
  return k.length === 1 ? k.toUpperCase() : k;
}

function updateSustainLabel() {
  sustainValue.textContent = settings.sustain.toFixed(2).replace(/0$/, '') + '×';
}

function renderSettingsUI() {
  modeGroup.querySelectorAll('.segmented__option').forEach(btn => {
    btn.setAttribute('aria-checked', btn.dataset.mode === settings.mode ? 'true' : 'false');
  });
  modeHint.textContent = MODE_INFO[settings.mode];
  modeLabel.textContent = settings.mode === 'free' ? 'Свободный' : 'Запоминание';

  sizeGroup.querySelectorAll('.segmented__option').forEach(btn => {
    btn.setAttribute('aria-checked', Number(btn.dataset.size) === settings.size ? 'true' : 'false');
  });
  sizeHint.textContent = SIZE_INFO[settings.size] || '';

  const layoutAvailable = settings.size === 4;
  layoutSection.style.opacity = layoutAvailable ? '' : '0.5';

  layoutGroup.querySelectorAll('.segmented__option').forEach(btn => {
    btn.disabled = !layoutAvailable;
    const isActive = btn.dataset.layout === settings.layout;
    btn.setAttribute('aria-checked', layoutAvailable && isActive ? 'true' : 'false');
  });

  if (layoutAvailable) {
    layoutHint.textContent = 'Для 4 плиток доступны круг и таблица.';
  } else {
    layoutHint.textContent = 'Для 5–10 плиток доступна только таблица.';
  }

  soundGroup.querySelectorAll('.segmented__option').forEach(btn => {
    btn.setAttribute('aria-checked', btn.dataset.sound === settings.sound ? 'true' : 'false');
  });
  soundHint.textContent = SOUND_INFO[settings.sound];

  sustainRange.value = String(settings.sustain);
  updateSustainLabel();

  buildKeysUI();
  buildKeygrid();

  if (settings.mode !== 'free' && game.freeModeActive) {
    stopFreeMode();
  }
}

function openSettings() {
  renderSettingsUI();
  settingsModal.hidden = false;
}

function closeSettings() {
  settingsModal.hidden = true;
  cancelKeyListening();
}

settingsBtn.addEventListener('click', openSettings);
settingsModal.addEventListener('click', (e) => {
  if (e.target.matches('[data-close]')) closeSettings();
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && !settingsModal.hidden) closeSettings();
});

modeGroup.addEventListener('click', (e) => {
  const btn = e.target.closest('.segmented__option');
  if (!btn) return;
  settings.mode = btn.dataset.mode === 'free' ? 'free' : 'memory';
  saveSettings();
  renderSettingsUI();
});

sizeGroup.addEventListener('click', (e) => {
  const btn = e.target.closest('.segmented__option');
  if (!btn) return;
  const newSize = clampSize(btn.dataset.size);
  if (newSize === settings.size) return;

  endGame();
  startBtn.textContent = 'Старт';
  startBtn.disabled = false;
  game.sequence = [];
  game.playerInput = [];
  game.level = 0;
  updateLevel();
  setStatus('Готовы?');
  setMessage('');

  settings.size = newSize;
  settings.keys = defaultKeysFor(newSize);

  if (newSize !== 4 && settings.layout === 'circle') {
    settings.layout = 'table';
  }

  saveSettings();

  buildBoard();
  buildKeygrid();
  buildKeysUI();

  renderSettingsUI();
});

layoutGroup.addEventListener('click', (e) => {
  const btn = e.target.closest('.segmented__option');
  if (!btn || btn.disabled) return;
  const newLayout = btn.dataset.layout;
  if (newLayout !== 'circle' && newLayout !== 'table') return;
  if (newLayout === settings.layout) return;
  if (settings.size !== 4 && newLayout === 'circle') return;

  endGame();
  startBtn.textContent = 'Старт';
  startBtn.disabled = false;
  game.sequence = [];
  game.playerInput = [];
  game.level = 0;
  updateLevel();
  setStatus('Готовы?');
  setMessage('');

  settings.layout = newLayout;
  saveSettings();
  buildBoard();
  renderSettingsUI();
});

soundGroup.addEventListener('click', (e) => {
  const btn = e.target.closest('.segmented__option');
  if (!btn) return;
  const newSound = btn.dataset.sound;
  if (!['sine', 'timbre', 'melody'].includes(newSound)) return;

  settings.sound = newSound;
  saveSettings();
  renderSettingsUI();

  const demoCount = Math.min(settings.size, 4);
  for (let i = 0; i < demoCount; i++) {
    later(() => {
      flashPad(i, 220);
      playTone(i, 0.25);
    }, i * 260);
  }
});

sustainRange.addEventListener('input', () => {
  settings.sustain = clampSustain(sustainRange.value);
  updateSustainLabel();
  saveSettings();
});

sustainRange.addEventListener('change', () => {
  flashPad(0, 220);
  playTone(0, 0.25);
});

let listeningBtn = null;

function startKeyListening(btn) {
  cancelKeyListening();
  listeningBtn = btn;
  btn.classList.add('is-listening');
  btn.textContent = '…';
}

function cancelKeyListening() {
  if (!listeningBtn) return;
  const idx = Number(listeningBtn.dataset.bind);
  listeningBtn.textContent = formatKey(settings.keys[idx]);
  listeningBtn.classList.remove('is-listening');
  listeningBtn = null;
}

keysGroup.addEventListener('click', (e) => {
  const btn = e.target.closest('.keys__btn');
  if (!btn) return;
  startKeyListening(btn);
});

document.addEventListener('keydown', (e) => {
  if (!listeningBtn) return;

  e.preventDefault();
  e.stopPropagation();

  if (e.key === 'Escape') {
    cancelKeyListening();
    return;
  }

  if (e.key.length !== 1) return;

  const newKey = e.key.toLowerCase();
  const idx = Number(listeningBtn.dataset.bind);

  settings.keys = settings.keys.map((k, i) => (k === newKey && i !== idx ? '' : k));
  settings.keys[idx] = newKey;

  saveSettings();
  cancelKeyListening();
  buildKeysUI();
  buildKeygrid();
}, true);

resetBtn.addEventListener('click', () => {
  settings = normalizeSettings(DEFAULT_SETTINGS);
  saveSettings();
  cancelKeyListening();
  buildBoard();
  renderSettingsUI();
  endGame();
  startBtn.textContent = 'Старт';
  startBtn.disabled = false;
});

closeBtn.addEventListener('click', closeSettings);

buildBoard();
renderSettingsUI();
setPadsDisabled(true);
updateLevel();
setStatus('Готовы?');
