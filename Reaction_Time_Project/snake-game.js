'use strict';

(function () {
  const BEST_KEY = 'arcade_snake_best_v1';
  const canvas = document.getElementById('snakeCanvas');
  const ctx = canvas?.getContext('2d');

  const dom = {
    score: document.getElementById('snakeScore'),
    best: document.getElementById('snakeBest'),
    startBtn: document.getElementById('btnSnakeStart'),
    status: document.getElementById('snakeStatus')
  };

  const GRID = 20;
  const CELL = canvas ? canvas.width / GRID : 19;
  const TICK_MS = 125;

  let snake = [];
  let dir = { x: 1, y: 0 };
  let nextDir = { x: 1, y: 0 };
  let apple = { x: 14, y: 10 };
  let score = 0;
  let best = loadBest();
  let running = false;
  let rewardGivenThisRun = false;
  let lastTick = 0;
  let touchStart = null;

  function loadBest() {
    try {
      const v = Number(localStorage.getItem(BEST_KEY));
      return Number.isFinite(v) && v >= 0 ? Math.floor(v) : 0;
    } catch {
      return 0;
    }
  }

  function saveBest(val) {
    try {
      localStorage.setItem(BEST_KEY, String(Math.floor(val)));
    } catch {
      // Ignore storage errors
    }
  }

  function syncHud() {
    if (dom.score) dom.score.textContent = String(score);
    if (dom.best) dom.best.textContent = String(best);
  }

  function spawnApple() {
    const occupied = new Set(snake.map((seg) => `${seg.x},${seg.y}`));
    const free = [];
    for (let y = 0; y < GRID; y += 1) {
      for (let x = 0; x < GRID; x += 1) {
        if (!occupied.has(`${x},${y}`)) {
          free.push({ x, y });
        }
      }
    }
    if (free.length > 0) {
      apple = free[Math.floor(Math.random() * free.length)];
    }
  }

  function resetSnake(autoStart = true) {
    snake = [
      { x: 6, y: 10 },
      { x: 5, y: 10 },
      { x: 4, y: 10 }
    ];
    dir = { x: 1, y: 0 };
    nextDir = { x: 1, y: 0 };
    score = 0;
    rewardGivenThisRun = false;
    running = autoStart;
    lastTick = performance.now();
    spawnApple();
    syncHud();
    if (dom.status) {
      dom.status.textContent = autoStart
        ? 'Eat the spawned apples! Avoid walls and your own tail.'
        : 'Press Start / Restart or a direction key to play.';
    }
    drawBoard();
  }

  function setDirection(name) {
    const map = {
      up: { x: 0, y: -1 },
      down: { x: 0, y: 1 },
      left: { x: -1, y: 0 },
      right: { x: 1, y: 0 }
    };
    const candidate = map[name];
    if (!candidate) return;
    if (!running) {
      resetSnake(true);
    }
    // Prevent reversing directly into neck
    if (candidate.x + dir.x === 0 && candidate.y + dir.y === 0) return;
    nextDir = candidate;
  }

  function gameOver() {
    running = false;
    if (score > best) {
      best = score;
      saveBest(best);
    }
    syncHud();

    const api = window.ArcadeQuests;
    if (score >= 8 && !rewardGivenThisRun && api && typeof api.loadData === 'function' && typeof api.saveData === 'function') {
      rewardGivenThisRun = true;
      const xpGain = score >= 15 ? 35 : 20;
      const coinGain = score >= 15 ? 15 : 10;
      const state = api.loadData();
      state.xp = (Number(state.xp) || 0) + xpGain;
      state.coins = (Number(state.coins) || 0) + coinGain;
      api.saveData(state);
      if (dom.status) {
        dom.status.textContent = `Run over! Apples eaten: ${score} • Earned +${xpGain} XP and +${coinGain} Coins.`;
      }
    } else if (dom.status) {
      dom.status.textContent = `Run over! Apples eaten: ${score}. Click Start / Restart to try again.`;
    }
  }

  function step() {
    dir = nextDir;
    const head = snake[0];
    const nx = head.x + dir.x;
    const ny = head.y + dir.y;

    if (nx < 0 || nx >= GRID || ny < 0 || ny >= GRID) {
      gameOver();
      return;
    }

    const willEat = nx === apple.x && ny === apple.y;
    const bodyToCheck = willEat ? snake : snake.slice(0, -1);
    if (bodyToCheck.some((seg) => seg.x === nx && seg.y === ny)) {
      gameOver();
      return;
    }

    snake.unshift({ x: nx, y: ny });
    if (willEat) {
      score += 1;
      if (score > best) {
        best = score;
        saveBest(best);
      }
      syncHud();
      spawnApple();
    } else {
      snake.pop();
    }
  }

  function drawBoard() {
    if (!ctx || !canvas) return;
    const w = canvas.width;
    const h = canvas.height;

    ctx.fillStyle = '#071022';
    ctx.fillRect(0, 0, w, h);

    // Subtle grid lines
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.08)';
    ctx.lineWidth = 1;
    for (let i = 1; i < GRID; i += 1) {
      ctx.beginPath();
      ctx.moveTo(i * CELL, 0);
      ctx.lineTo(i * CELL, h);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, i * CELL);
      ctx.lineTo(w, i * CELL);
      ctx.stroke();
    }

    // Spawned apple
    const ax = apple.x * CELL + CELL / 2;
    const ay = apple.y * CELL + CELL / 2;
    ctx.fillStyle = '#f43f5e';
    ctx.beginPath();
    ctx.arc(ax, ay, CELL * 0.38, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#10b981';
    ctx.fillRect(ax - 1.5, ay - CELL * 0.48, 3, CELL * 0.2);

    // Snake segments
    snake.forEach((seg, idx) => {
      ctx.fillStyle = idx === 0 ? '#22d3ee' : '#10b981';
      ctx.fillRect(
        seg.x * CELL + 1.5,
        seg.y * CELL + 1.5,
        CELL - 3,
        CELL - 3
      );
    });
  }

  function loop(now) {
    if (running && now - lastTick >= TICK_MS) {
      lastTick = now;
      step();
      drawBoard();
    }
    requestAnimationFrame(loop);
  }

  dom.startBtn?.addEventListener('click', () => resetSnake(true));

  document.querySelectorAll('.dir-btn').forEach((btn) => {
    btn.addEventListener('click', () => setDirection(btn.dataset.dir));
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
      e.preventDefault();
      setDirection('up');
    } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
      e.preventDefault();
      setDirection('down');
    } else if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
      e.preventDefault();
      setDirection('left');
    } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
      e.preventDefault();
      setDirection('right');
    }
  });

  canvas?.addEventListener('pointerdown', (e) => {
    touchStart = { x: e.clientX, y: e.clientY };
  });

  canvas?.addEventListener('pointerup', (e) => {
    if (!touchStart) return;
    const dx = e.clientX - touchStart.x;
    const dy = e.clientY - touchStart.y;
    touchStart = null;
    if (Math.abs(dx) < 16 && Math.abs(dy) < 16) return;
    if (Math.abs(dx) > Math.abs(dy)) {
      setDirection(dx > 0 ? 'right' : 'left');
    } else {
      setDirection(dy > 0 ? 'down' : 'up');
    }
  });

  syncHud();
  resetSnake(false);
  requestAnimationFrame(loop);
})();