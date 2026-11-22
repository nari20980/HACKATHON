'use strict';

(function () {
  const BEST_KEY = 'arcade_bowling_best_v1';
  const canvas = document.getElementById('bowlCanvas');
  const ctx = canvas?.getContext('2d');

  const dom = {
    score: document.getElementById('bowlScore'),
    ball: document.getElementById('bowlBall'),
    best: document.getElementById('bowlBest'),
    throwBtn: document.getElementById('btnBowlThrow'),
    resetBtn: document.getElementById('btnBowlReset'),
    status: document.getElementById('bowlStatus')
  };

  const W = canvas ? canvas.width : 360;
  const H = canvas ? canvas.height : 460;
  const LANE_X = 68;
  const LANE_W = W - LANE_X * 2;

  let pins = [];
  let ball = { x: W / 2, y: H - 56, r: 14, vx: 0, vy: 0, rolling: false };
  let ballNum = 1;
  let score = 0;
  let best = loadBest();
  let roundOver = false;
  let rewardGiven = false;

  function loadBest() {
    try {
      const v = Number(localStorage.getItem(BEST_KEY));
      return Number.isFinite(v) && v >= 0 ? Math.floor(v) : 0;
    } catch { return 0; }
  }

  function saveBest(val) {
    try { localStorage.setItem(BEST_KEY, String(Math.floor(val))); } catch {}
  }

  function createPins() {
    const rows = [
      [0],
      [-1, 1],
      [-2, 0, 2],
      [-3, -1, 1, 3]
    ];
    const list = [];
    rows.forEach((offsets, rIdx) => {
      offsets.forEach((off) => {
        list.push({
          x: W / 2 + off * 18,
          y: 86 + rIdx * 24,
          vx: 0,
          vy: 0,
          down: false
        });
      });
    });
    return list;
  }

  function syncHud() {
    if (score > best) { best = score; saveBest(best); }
    if (dom.score) dom.score.textContent = String(score);
    if (dom.ball) dom.ball.textContent = `${Math.min(2, ballNum)} / 2`;
    if (dom.best) dom.best.textContent = String(best);
  }

  function resetBall() {
    ball = { x: W / 2, y: H - 56, r: 14, vx: 0, vy: 0, rolling: false };
  }

  function resetRack() {
    pins = createPins();
    ballNum = 1;
    score = 0;
    roundOver = false;
    rewardGiven = false;
    resetBall();
    syncHud();
    if (dom.status) dom.status.textContent = 'Position with ←/→ and roll with SPACE or Roll Ball!';
  }

  function shiftBall(dx) {
    if (ball.rolling || roundOver) return;
    ball.x = Math.max(LANE_X + ball.r + 4, Math.min(LANE_X + LANE_W - ball.r - 4, ball.x + dx));
  }

  function throwBall() {
    if (roundOver) { resetRack(); return; }
    if (ball.rolling) return;
    const centerOffset = (W / 2 - ball.x) * 0.025;
    ball.vx = centerOffset;
    ball.vy = -8.5;
    ball.rolling = true;
  }

  function finishBall() {
    ball.rolling = false;
    const knocked = pins.filter((p) => p.down).length;
    score = knocked;
    syncHud();

    if (knocked === 10 || ballNum >= 2) {
      roundOver = true;
      if (knocked >= 8 && !rewardGiven && window.ArcadeQuests?.loadData) {
        rewardGiven = true;
        const st = window.ArcadeQuests.loadData();
        st.xp = (Number(st.xp) || 0) + 30;
        st.coins = (Number(st.coins) || 0) + 12;
        window.ArcadeQuests.saveData(st);
      }
      if (dom.status) {
        dom.status.textContent = knocked === 10
          ? 'STRIKE! All 10 pins down! Click New Rack to bowl again.'
          : `Frame complete! Knocked ${knocked} / 10 pins. Click New Rack to play again.`;
      }
    } else {
      ballNum += 1;
      resetBall();
      syncHud();
      if (dom.status) dom.status.textContent = `Ball 2 ready! ${10 - knocked} pin(s) standing.`;
    }
  }

  function update() {
    if (!ball.rolling) return;

    ball.x += ball.vx;
    ball.y += ball.vy;

    if (ball.x - ball.r < LANE_X || ball.x + ball.r > LANE_X + LANE_W) {
      ball.vx = 0;
    }

    for (const p of pins) {
      if (p.down) {
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.9;
        p.vy *= 0.9;
        continue;
      }
      const dist = Math.hypot(ball.x - p.x, ball.y - p.y);
      if (dist < ball.r + 8) {
        p.down = true;
        p.vx = (p.x - ball.x) * 0.45 + (Math.random() - 0.5) * 2;
        p.vy = -4.5 - Math.random() * 2;
      }
    }

    for (let i = 0; i < pins.length; i += 1) {
      if (!pins[i].down) continue;
      for (let j = 0; j < pins.length; j += 1) {
        if (i === j || pins[j].down) continue;
        if (Math.hypot(pins[i].x - pins[j].x, pins[i].y - pins[j].y) < 16) {
          pins[j].down = true;
          pins[j].vx = pins[i].vx * 0.8 + (Math.random() - 0.5) * 2;
          pins[j].vy = pins[i].vy * 0.8 - 1.5;
        }
      }
    }

    if (ball.y < 42) {
      finishBall();
    }
  }

  function draw() {
    if (!ctx) return;
    ctx.fillStyle = '#060b1b';
    ctx.fillRect(0, 0, W, H);

    // Lane surface
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(LANE_X, 24, LANE_W, H - 48);
    ctx.strokeStyle = '#22d3ee';
    ctx.lineWidth = 2;
    ctx.strokeRect(LANE_X, 24, LANE_W, H - 48);

    // Pins
    for (const p of pins) {
      ctx.fillStyle = p.down ? 'rgba(148, 163, 184, 0.35)' : '#f8fafc';
      ctx.beginPath();
      ctx.arc(p.x, p.y, 7, 0, Math.PI * 2);
      ctx.fill();
      if (!p.down) {
        ctx.fillStyle = '#f43f5e';
        ctx.fillRect(p.x - 4, p.y - 2, 8, 3);
      }
    }

    // Ball
    ctx.fillStyle = '#a855f7';
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
  }

  document.querySelectorAll('[data-shift]').forEach((btn) => {
    btn.addEventListener('click', () => shiftBall(Number(btn.dataset.shift) || 0));
  });
  dom.throwBtn?.addEventListener('click', throwBall);
  dom.resetBtn?.addEventListener('click', resetRack);

  window.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') { e.preventDefault(); shiftBall(-16); }
    else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') { e.preventDefault(); shiftBall(16); }
    else if (e.code === 'Space') { e.preventDefault(); throwBall(); }
  });

  resetRack();
  requestAnimationFrame(loop);
})();