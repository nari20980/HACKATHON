'use strict';

(function () {
  const BEST_KEY = 'arcade_tetris_best_v1';
  const COLS = 10;
  const ROWS = 20;
  const BLOCK = 24;

  const SHAPES = {
    I: { color: '#22d3ee', matrix: [[1, 1, 1, 1]] },
    O: { color: '#f59e0b', matrix: [[1, 1], [1, 1]] },
    T: { color: '#a855f7', matrix: [[0, 1, 0], [1, 1, 1]] },
    S: { color: '#10b981', matrix: [[0, 1, 1], [1, 1, 0]] },
    Z: { color: '#f43f5e', matrix: [[1, 1, 0], [0, 1, 1]] },
    J: { color: '#3b82f6', matrix: [[1, 0, 0], [1, 1, 1]] },
    L: { color: '#fb923c', matrix: [[0, 0, 1], [1, 1, 1]] }
  };
  const KEYS = Object.keys(SHAPES);

  const canvas = document.getElementById('tetrisCanvas');
  const ctx = canvas?.getContext('2d');
  const nextCanvas = document.getElementById('nextCanvas');
  const nextCtx = nextCanvas?.getContext('2d');

  const dom = {
    score: document.getElementById('tetrisScore'),
    lines: document.getElementById('tetrisLines'),
    best: document.getElementById('tetrisBest'),
    startBtn: document.getElementById('btnTetrisStart'),
    status: document.getElementById('tetrisStatus')
  };

  let grid = [];
  let current = null;
  let nextPiece = null;
  let score = 0;
  let linesCleared = 0;
  let best = loadBest();
  let running = false;
  let rewardGiven = false;
  let lastDrop = 0;

  function loadBest() {
    try {
      const v = Number(localStorage.getItem(BEST_KEY));
      return Number.isFinite(v) && v >= 0 ? Math.floor(v) : 0;
    } catch { return 0; }
  }

  function saveBest(val) {
    try { localStorage.setItem(BEST_KEY, String(Math.floor(val))); } catch {}
  }

  function createPiece() {
    const k = KEYS[Math.floor(Math.random() * KEYS.length)];
    const def = SHAPES[k];
    const matrix = def.matrix.map((row) => [...row]);
    return {
      color: def.color,
      matrix,
      x: Math.floor((COLS - matrix[0].length) / 2),
      y: 0
    };
  }

  function syncHud() {
    if (score > best) {
      best = score;
      saveBest(best);
    }
    if (dom.score) dom.score.textContent = String(score);
    if (dom.lines) dom.lines.textContent = String(linesCleared);
    if (dom.best) dom.best.textContent = String(best);
  }

  function collides(piece, nx, ny, mat = piece.matrix) {
    for (let r = 0; r < mat.length; r += 1) {
      for (let c = 0; c < mat[r].length; c += 1) {
        if (!mat[r][c]) continue;
        const gx = nx + c;
        const gy = ny + r;
        if (gx < 0 || gx >= COLS || gy >= ROWS) return true;
        if (gy >= 0 && grid[gy][gx]) return true;
      }
    }
    return false;
  }

  function rotateMatrix(mat) {
    const h = mat.length;
    const w = mat[0].length;
    const out = Array.from({ length: w }, () => Array(h).fill(0));
    for (let r = 0; r < h; r += 1) {
      for (let c = 0; c < w; c += 1) {
        out[c][h - 1 - r] = mat[r][c];
      }
    }
    return out;
  }

  function lockPiece() {
    for (let r = 0; r < current.matrix.length; r += 1) {
      for (let c = 0; c < current.matrix[r].length; c += 1) {
        if (current.matrix[r][c]) {
          const gy = current.y + r;
          const gx = current.x + c;
          if (gy >= 0 && gy < ROWS && gx >= 0 && gx < COLS) {
            grid[gy][gx] = current.color;
          }
        }
      }
    }

    let cleared = 0;
    for (let r = ROWS - 1; r >= 0; r -= 1) {
      if (grid[r].every((cell) => Boolean(cell))) {
        grid.splice(r, 1);
        grid.unshift(Array(COLS).fill(null));
        cleared += 1;
        r += 1;
      }
    }

    if (cleared > 0) {
      const pts = [0, 100, 300, 500, 800][cleared] || cleared * 200;
      score += pts;
      linesCleared += cleared;
      syncHud();

      const api = window.ArcadeQuests;
      if (linesCleared >= 4 && !rewardGiven && api && typeof api.loadData === 'function' && typeof api.saveData === 'function') {
        rewardGiven = true;
        const state = api.loadData();
        state.xp = (Number(state.xp) || 0) + 30;
        state.coins = (Number(state.coins) || 0) + 14;
        api.saveData(state);
        if (dom.status) {
          dom.status.textContent = `Cleared ${linesCleared} lines! Earned +30 XP and +14 Coins.`;
        }
      }
    }

    current = nextPiece;
    nextPiece = createPiece();
    if (collides(current, current.x, current.y)) {
      running = false;
      if (dom.status) {
        dom.status.textContent = `Stack topped out! Final score: ${score} • Lines: ${linesCleared}.`;
      }
    }
  }

  function moveHoriz(dx) {
    if (!running || !current) return;
    if (!collides(current, current.x + dx, current.y)) {
      current.x += dx;
      draw();
    }
  }

  function stepDown() {
    if (!running || !current) return;
    if (!collides(current, current.x, current.y + 1)) {
      current.y += 1;
    } else {
      lockPiece();
    }
    draw();
  }

  function hardDrop() {
    if (!running || !current) return;
    while (!collides(current, current.x, current.y + 1)) {
      current.y += 1;
      score += 2;
    }
    lockPiece();
    syncHud();
    draw();
  }

  function rotatePiece() {
    if (!running || !current) return;
    const rotated = rotateMatrix(current.matrix);
    if (!collides(current, current.x, current.y, rotated)) {
      current.matrix = rotated;
      draw();
    }
  }

  function startGame() {
    grid = Array.from({ length: ROWS }, () => Array(COLS).fill(null));
    score = 0;
    linesCleared = 0;
    rewardGiven = false;
    current = createPiece();
    nextPiece = createPiece();
    running = true;
    lastDrop = performance.now();
    syncHud();
    if (dom.status) dom.status.textContent = 'Stack blocks and clear full rows!';
    draw();
  }

  function drawCell(c2d, x, y, size, color) {
    c2d.fillStyle = color;
    c2d.fillRect(x * size + 1, y * size + 1, size - 2, size - 2);
  }

  function draw() {
    if (!ctx || !canvas) return;
    ctx.fillStyle = '#060b1b';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let r = 0; r < ROWS; r += 1) {
      for (let c = 0; c < COLS; c += 1) {
        if (grid[r][c]) drawCell(ctx, c, r, BLOCK, grid[r][c]);
      }
    }

    if (current) {
      for (let r = 0; r < current.matrix.length; r += 1) {
        for (let c = 0; c < current.matrix[r].length; c += 1) {
          if (current.matrix[r][c]) {
            drawCell(ctx, current.x + c, current.y + r, BLOCK, current.color);
          }
        }
      }
    }

    if (nextCtx && nextCanvas && nextPiece) {
      nextCtx.fillStyle = '#060b1b';
      nextCtx.fillRect(0, 0, nextCanvas.width, nextCanvas.height);
      const sz = 20;
      const offX = Math.floor((nextCanvas.width - nextPiece.matrix[0].length * sz) / 2);
      const offY = Math.floor((nextCanvas.height - nextPiece.matrix.length * sz) / 2);
      for (let r = 0; r < nextPiece.matrix.length; r += 1) {
        for (let c = 0; c < nextPiece.matrix[r].length; c += 1) {
          if (nextPiece.matrix[r][c]) {
            nextCtx.fillStyle = nextPiece.color;
            nextCtx.fillRect(offX + c * sz + 1, offY + r * sz + 1, sz - 2, sz - 2);
          }
        }
      }
    }
  }

  function loop(now) {
    const interval = Math.max(220, 720 - linesCleared * 35);
    if (running && now - lastDrop >= interval) {
      lastDrop = now;
      stepDown();
    }
    requestAnimationFrame(loop);
  }

  dom.startBtn?.addEventListener('click', startGame);

  document.querySelectorAll('.pad-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const act = btn.dataset.act;
      if (act === 'left') moveHoriz(-1);
      else if (act === 'right') moveHoriz(1);
      else if (act === 'down') stepDown();
      else if (act === 'rotate' || act === 'up') rotatePiece();
      else if (act === 'drop') hardDrop();
    });
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') { e.preventDefault(); moveHoriz(-1); }
    else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') { e.preventDefault(); moveHoriz(1); }
    else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') { e.preventDefault(); stepDown(); }
    else if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W' || e.key === 'x' || e.key === 'X') { e.preventDefault(); rotatePiece(); }
    else if (e.code === 'Space') { e.preventDefault(); hardDrop(); }
  });

  startGame();
  requestAnimationFrame(loop);
})();