'use strict';

const CELL = 30;
const COLS = 20;
const ROWS = 20;
const STEP = 150;
const START = 3;

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const state = {
    snake: [],
    dir: { x: 1, y: 0 },
    next: { x: 1, y: 0 },
    apple: { x: 0, y: 0 },
    score: 0,
    over: false,
    win: false,
    last: 0,
};

function init() {
    const sx = Math.floor(COLS / 2) - 1;
    const sy = Math.floor(ROWS / 2);
    state.snake = Array.from({ length: START }, (_, i) => ({ x: sx - i, y: sy }));

    state.dir = { x: 1, y: 0 };
    state.next = { x: 1, y: 0 };
    state.score = 0;
    state.over = false;
    state.win = false;
    state.last = performance.now();

    spawnApple();
    draw();
}

function spawnApple() {
    const free = [];
    for (let x = 0; x < COLS; x++)
        for (let y = 0; y < ROWS; y++)
            if (!state.snake.some(s => s.x === x && s.y === y))
                free.push({ x, y });

    if (!free.length) return state.win = true;
    state.apple = free[Math.floor(Math.random() * free.length)];
}

function step() {
    state.dir = { ...state.next };
    const h = state.snake[0];
    const n = { x: h.x + state.dir.x, y: h.y + state.dir.y };

    if (n.x < 0 || n.x >= COLS || n.y < 0 || n.y >= ROWS ||
        state.snake.some(s => s.x === n.x && s.y === n.y)) {
        state.over = true;
        return;
    }

    state.snake.unshift(n);
    if (n.x === state.apple.x && n.y === state.apple.y) {
        state.score++;
        spawnApple();
    } else {
        state.snake.pop();
    }
}

function update(now) {
    if (state.over || state.win) return;
    const dt = now - state.last;
    if (dt >= STEP) {
        const n = Math.floor(dt / STEP);
        for (let i = 0; i < n && !state.over && !state.win; i++) step();
        state.last += n * STEP;
    }
}

function draw() {
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#111';
    ctx.fillRect(state.apple.x * CELL + 9, state.apple.y * CELL + 9, CELL - 18, CELL - 18);

    state.snake.forEach((s, i) => {
        ctx.fillStyle = i === 0 ? '#111' : '#999';
        const p = i === 0 ? 2 : 6;
        ctx.fillRect(s.x * CELL + p, s.y * CELL + p, CELL - p * 2, CELL - p * 2);
    });

    ctx.fillStyle = '#111';
    ctx.font = '14px monospace';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(state.score, 12, 10);

    if (state.over || state.win) drawEnd();
}

function drawEnd() {
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    ctx.fillStyle = '#111';
    ctx.font = '48px monospace';
    ctx.fillText(state.score, canvas.width / 2, canvas.height / 2 - 30);

    ctx.font = '16px monospace';
    ctx.fillText(state.win ? 'победа' : 'игра окончена', canvas.width / 2, canvas.height / 2 + 20);

    ctx.font = '14px monospace';
    ctx.fillStyle = '#888';
    ctx.fillText('нажмите, чтобы начать', canvas.width / 2, canvas.height / 2 + 60);
}

function onKey(e) {
    const map = {
        ArrowUp:    { x: 0,  y: -1 },
        ArrowDown:  { x: 0,  y: 1  },
        ArrowLeft:  { x: -1, y: 0  },
        ArrowRight: { x: 1,  y: 0  },
    };
    const d = map[e.key];
    if (!d) return;
    e.preventDefault();
    if (state.over || state.win) return;
    if (state.dir.x === -d.x && state.dir.y === -d.y) return;
    if (state.next.x === -d.x && state.next.y === -d.y) return;
    state.next = d;
}

function onClick() {
    if (state.over || state.win) init();
}

function loop(now) {
    update(now);
    draw();
    requestAnimationFrame(loop);
}

document.addEventListener('keydown', onKey);
canvas.addEventListener('click', onClick);

init();
requestAnimationFrame(loop);
