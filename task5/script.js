'use strict';


const TIMINGS = {
  SHOW_ON_BASE: 500,     // базовая длительность подсветки
  SHOW_GAP_BASE: 200,    // базовая пауза между секторами
  SHOW_ON_MIN: 200,      // минимальная длительность подсветки
  SHOW_GAP_MIN: 80,      // минимальная пауза
  SPEEDUP_PER_LEVEL: 25, // на сколько мс ускоряемся за уровень
  NEXT_ROUND: 700,       // пауза перед новым показом
};

const CONFIG = {
  PADS_COUNT: 4,
};


const padEls    = Array.from(document.querySelectorAll('.pad'));
const startBtn  = document.getElementById('startBtn');
const levelEl   = document.getElementById('level');
const statusEl  = document.getElementById('status');
const messageEl = document.getElementById('message');


const game = {
  sequence: [],           // текущая последовательность индексов 0..3
  playerInput: [],        // ввод игрока в текущем раунде
  level: 0,               // текущий уровень (длина последовательности)
  isShowing: false,       // идёт показ последовательности компьютером
  isAwaitingInput: false, // ждём ввод игрока
  isGameOver: true,       // игра не запущена / проиграна
  timers: [],             // активные таймеры (для корректной очистки)
};


function setStatus(text) {
  statusEl.textContent = text;
}


function setMessage(text, type) {
  messageEl.textContent = text;
  messageEl.classList.remove('message--error', 'message--success');
  if (type === 'error') messageEl.classList.add('message--error');
  if (type === 'success') messageEl.classList.add('message--success');
}


function updateLevel() {
  levelEl.textContent = String(game.level);
}


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


function wait(ms) {
  return new Promise(resolve => later(resolve, ms));
}


let audioCtx = null;
const PAD_FREQ = [329.63, 261.63, 220.0, 164.81]; // E4, C4, A3, E3

function playTone(index, duration = 0.25) {
  try {
    if (!audioCtx) {
      const AC = window.AudioContext || window.AudioContext;
      if (!AC) return;
      audioCtx = new AC();
    }
    if (audioCtx.state === 'suspended') audioCtx.resume();

    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.value = PAD_FREQ[index] ?? 440;

    const now = audioCtx.currentTime;
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.15, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc.connect(gain).connect(audioCtx.destination);
    osc.start(now);
    osc.stop(now + duration + 0.02);
  } catch (_) {
    // Ignore
  }
}

function setPadsDisabled(disabled) {
  padEls.forEach(el => { el.disabled = disabled; });
}

function randomPadIndex() {
  return Math.floor(Math.random() * CONFIG.PADS_COUNT);
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
    const el = padEls[idx];

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


function handlePadClick(index) {
  if (!game.isAwaitingInput || game.isShowing || game.isGameOver) return;

  const el = padEls[index];
  el.classList.add('active');
  playTone(index, 0.2);
  later(() => el.classList.remove('active'), 200);

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
    later(() => {
      if (!game.isGameOver) startRound();
    }, TIMINGS.NEXT_ROUND);
  }
}


function endGame() {
  game.isGameOver = true;
  game.isShowing = false;
  game.isAwaitingInput = false;
  clearTimers();

  padEls.forEach(el => el.classList.remove('active'));
  setPadsDisabled(true);

  setStatus('Игра окончена');
  setMessage(`Вы дошли до уровня ${game.level}`, 'error');
  startBtn.disabled = false;
  startBtn.textContent = 'Заново';
}


function startGame() {
  clearTimers();
  padEls.forEach(el => el.classList.remove('active'));

  game.sequence = [];
  game.playerInput = [];
  game.level = 0;
  game.isShowing = false;
  game.isAwaitingInput = false;
  game.isGameOver = false;

  updateLevel();
  setMessage('');
  startBtn.disabled = true;
  startBtn.textContent = 'Игра идёт…';

  startRound();
}


padEls.forEach(el => {
  el.addEventListener('click', () => {
    const idx = Number(el.dataset.index);
    handlePadClick(idx);
  });
});

startBtn.addEventListener('click', () => {
  startGame();
});


const KEY_MAP = {
  'q': 0,
  'w': 1,
  'a': 2,
  's': 3,
  // поддержка русской раскладки (ЙЦУКЕН)
  'й': 0,
  'ц': 1,
  'ф': 2,
  'ы': 3,
};

document.addEventListener('keydown', (e) => {
  if (e.repeat) return;

  const key = e.key.toLowerCase();

  if (key === 'enter' || key === ' ') {
    if (startBtn.disabled && !game.isGameOver) return;
    e.preventDefault();
    startGame();
    return;
  }

  if (key in KEY_MAP) {
    e.preventDefault();
    handlePadClick(KEY_MAP[key]);
  }
});


setPadsDisabled(true);
updateLevel();
setStatus('Готовы?');
