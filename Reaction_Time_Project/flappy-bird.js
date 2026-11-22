'use strict';

(function () {
  const BEST_KEY = 'arcade_flappy_best_v1';
  const canvas = document.getElementById('flappyCanvas');
  const ctx = canvas?.getContext('2d');

  const dom = {
    score: document.getElementById('flappyScore'),
    best: document.getElementById('flappyBest'),
    actionBtn: document.getElementById('btnFlappyAction'),
    restartBtn: document.getElementById('btnFlappyRestart'),
    status: document.getElementById('flappyStatus')
  };

  const W = canvas ? canvas.width : 380;
  const H = canvas ? canvas.height : 460;
  const GROUND_H = 44;
  const GRAVITY = 0.34;
  const FLAP_IMPULSE = -6.8;
  const PIPE_W = 54;
  const PIPE_GAP = 128;
  const PIPE_SPEED = 2.35;

  let mode = 'ready'; // 'ready' | 'playing' | 'gameover'
  let score = 0;
  let best = loadBest();
  let rewardGivenThisRun = false;
  let frameCounter = 0;
  let pipes = [];

  const bird = {
    x: 92,
    y: H * 0.45,
    r: 14,
    vy: 0
  };

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

  function resetGame() {
    mode = 'ready';
    score = 0;
    rewardGivenThisRun = false;
    frameCounter = 0;
    pipes = [];
    bird.x = 92;
    bird.y = H * 0.45;
    bird.vy = 0;
    syncHud();
    if (dom.actionBtn) dom.actionBtn.textContent = 'Flap / Start';
    if (dom.status) {
      dom.status.textContent = 'Press SPACE, ↑, or click/tap to flap! Score 8+ points to earn XP and Coins.';
    }
    drawScene();
  }

  function spawnPipe() {
    const minTop = 44;
    const maxTop = H - GROUND_H - PIPE_GAP - 44;
    const topH = minTop + Math.random() * Math.max(20, maxTop - minTop);
    pipes.push({
      x: W + 16,
      topH,
      bottomY: topH + PIPE_GAP,
      passed: false
    });
  }

  function finishRun() {
    if (mode === 'gameover') return;
    mode = 'gameover';
    if (score > best) {
      best = score;
      saveBest(best);
    }
    syncHud();
    if (dom.actionBtn) dom.actionBtn.textContent = 'Play Again';

    const api = window.ArcadeQuests;
    if (score >= 8 && !rewardGivenThisRun && api && typeof api.loadData === 'function' && typeof api.saveData === 'function') {
      rewardGivenThisRun = true;
      const xpGain = score >= 16 ? 35 : 20;
      const coinGain = score >= 16 ? 15 : 10;
      const state = api.loadData();
      state.xp = (Number(state.xp) || 0) + xpGain;
      state.coins = (Number(state.coins) || 0) + coinGain;
      api.saveData(state);
      if (dom.status) {
        dom.status.textContent = `Game over! Score: ${score} • Earned +${xpGain} XP and +${coinGain} Coins.`;
      }
    } else if (dom.status) {
      dom.status.textContent = `Game over! Score: ${score}. Click Flap / Play Again or Restart.`;
    }
  }

  function flap() {
    if (mode === 'gameover') {
      resetGame();
    }
    if (mode === 'ready') {
      mode = 'playing';
      spawnPipe();
      if (dom.actionBtn) dom.actionBtn.textContent = 'Flap';
      if (dom.status) dom.status.textContent = 'Flying! Thread the needle through the pipe gaps.';
    }
    bird.vy = FLAP_IMPULSE;
  }

  function update() {
    if (mode !== 'playing') return;

    frameCounter += 1;
    bird.vy += GRAVITY;
    bird.y += bird.vy;

    if (bird.y - bird.r < 0) {
      bird.y = bird.r;
      bird.vy = 0;
    }

    if (bird.y + bird.r >= H - GROUND_H) {
      bird.y = H - GROUND_H - bird.r;
      finishRun();
      return;
    }

    if (frameCounter % 96 === 0) {
      spawnPipe();
    }

    for (let i = pipes.length - 1; i >= 0; i -= 1) {
      const p = pipes[i];
      p.x -= PIPE_SPEED;

      const hitX = bird.x + bird.r > p.x && bird.x - bird.r < p.x + PIPE_W;
      const hitTop = bird.y - bird.r < p.topH;
      const hitBottom = bird.y + bird.r > p.bottomY;
      if (hitX && (hitTop || hitBottom)) {
        finishRun();
        return;
      }

      if (!p.passed && p.x + PIPE_W < bird.x) {
        p.passed = true;
        score += 1;
        if (score > best) {
          best = score;
          saveBest(best);
        }
        syncHud();
      }

      if (p.x + PIPE_W < -20) {
        pipes.splice(i, 1);
      }
    }
  }

  function drawScene() {
    if (!ctx) return;

    const skyGrad = ctx.createLinearGradient(0, 0, 0, H - GROUND_H);
    skyGrad.addColorStop(0, '#071126');
    skyGrad.addColorStop(1, '#112244');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, W, H - GROUND_H);

    // Pipes
    for (const p of pipes) {
      ctx.fillStyle = '#10b981';
      ctx.fillRect(p.x, 0, PIPE_W, p.topH);
      ctx.fillRect(p.x, p.bottomY, PIPE_W, H - GROUND_H - p.bottomY);

      ctx.fillStyle = '#34d399';
      ctx.fillRect(p.x - 3, p.topH - 14, PIPE_W + 6, 14);
      ctx.fillRect(p.x - 3, p.bottomY, PIPE_W + 6, 14);
    }

    // Ground
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, H - GROUND_H, W, GROUND_H);
    ctx.fillStyle = '#22d3ee';
    ctx.fillRect(0, H - GROUND_H, W, 3);

    // Bird
    ctx.save();
    ctx.translate(bird.x, bird.y);
    const tilt = Math.max(-0.45, Math.min(0.75, bird.vy * 0.06));
    ctx.rotate(tilt);

    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.arc(0, 0, bird.r, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(5, -4, 3, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.moveTo(11, -2);
    ctx.lineTo(20, 2);
    ctx.lineTo(11, 6);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    if (mode === 'ready') {
      ctx.fillStyle = 'rgba(248, 250, 252, 0.92)';
      ctx.font = '700 15px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Tap / Click or Press SPACE to Flap', W / 2, H * 0.3);
    } else if (mode === 'gameover') {
      ctx.fillStyle = 'rgba(4, 8, 20, 0.65)';
      ctx.fillRect(0, 0, W, H - GROUND_H);
      ctx.fillStyle = '#f8fafc';
      ctx.font = '800 22px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('CRASHED!', W / 2, H * 0.42);
      ctx.font = '700 14px "JetBrains Mono", monospace';
      ctx.fillStyle = '#67e8f9';
      ctx.fillText(`SCORE: ${score}  •  BEST: ${best}`, W / 2, H * 0.49);
    }
  }

  function loop() {
    update();
    drawScene();
    requestAnimationFrame(loop);
  }

  canvas?.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    flap();
  });

  dom.actionBtn?.addEventListener('click', flap);
  dom.restartBtn?.addEventListener('click', resetGame);

  window.addEventListener('keydown', (e) => {
    if (e.code === 'Space' || e.code === 'ArrowUp') {
      e.preventDefault();
      flap();
    }
  });

  syncHud();
  resetGame();
  requestAnimationFrame(loop);
})();