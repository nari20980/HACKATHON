'use strict';

(function () {
  const HOLES = [
    {
      start: { x: 85, y: 170 },
      cup: { x: 430, y: 170 },
      walls: [
        { x: 245, y: 95, w: 22, h: 150 }
      ]
    },
    {
      start: { x: 80, y: 85 },
      cup: { x: 435, y: 255 },
      walls: [
        { x: 185, y: 0, w: 22, h: 210 },
        { x: 325, y: 130, w: 22, h: 210 }
      ]
    },
    {
      start: { x: 75, y: 265 },
      cup: { x: 440, y: 75 },
      walls: [
        { x: 170, y: 120, w: 180, h: 20 },
        { x: 250, y: 200, w: 20, h: 140 }
      ]
    }
  ];

  const canvas = document.getElementById('golfCanvas');
  const ctx = canvas?.getContext('2d');

  const dom = {
    hole: document.getElementById('golfHole'),
    strokes: document.getElementById('golfStrokes'),
    total: document.getElementById('golfTotal'),
    retryBtn: document.getElementById('btnRetryHole'),
    nextBtn: document.getElementById('btnNextHole'),
    status: document.getElementById('golfStatus')
  };

  const W = canvas ? canvas.width : 520;
  const H = canvas ? canvas.height : 340;
  const BALL_R = 9;
  const CUP_R = 14;

  let holeIdx = 0;
  let strokes = 0;
  let totalStrokes = 0;
  let sunk = false;
  let rewardGiven = false;
  let dragging = false;
  let dragPt = null;

  const ball = { x: 85, y: 170, vx: 0, vy: 0 };

  function isMoving() {
    return Math.hypot(ball.vx, ball.vy) > 0.08;
  }

  function syncHud() {
    if (dom.hole) dom.hole.textContent = `${holeIdx + 1} / ${HOLES.length}`;
    if (dom.strokes) dom.strokes.textContent = String(strokes);
    if (dom.total) dom.total.textContent = String(totalStrokes);
  }

  function loadHole(idx) {
    holeIdx = ((idx % HOLES.length) + HOLES.length) % HOLES.length;
    const h = HOLES[holeIdx];
    ball.x = h.start.x;
    ball.y = h.start.y;
    ball.vx = 0;
    ball.vy = 0;
    strokes = 0;
    sunk = false;
    dragging = false;
    dragPt = null;
    syncHud();
    if (dom.status) dom.status.textContent = `Hole ${holeIdx + 1}: Drag backward from the ball to putt toward the cup!`;
  }

  function getPointer(e) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) * W) / Math.max(1, rect.width),
      y: ((e.clientY - rect.top) * H) / Math.max(1, rect.height)
    };
  }

  function onHoleSunk() {
    if (sunk) return;
    sunk = true;
    ball.vx = 0;
    ball.vy = 0;
    totalStrokes += strokes;
    syncHud();

    if (holeIdx === HOLES.length - 1 && !rewardGiven && window.ArcadeQuests?.loadData) {
      rewardGiven = true;
      const st = window.ArcadeQuests.loadData();
      st.xp = (Number(st.xp) || 0) + 35;
      st.coins = (Number(st.coins) || 0) + 15;
      window.ArcadeQuests.saveData(st);
      if (dom.status) {
        dom.status.textContent = `Course finished in ${totalStrokes} total strokes! Earned +35 XP and +15 Coins!`;
      }
    } else if (dom.status) {
      dom.status.textContent = `Sunk in ${strokes} stroke(s)! Click Next Hole to continue.`;
    }
  }

  function update() {
    const h = HOLES[holeIdx];
    if (!sunk && isMoving()) {
      ball.x += ball.vx;
      ball.y += ball.vy;
      ball.vx *= 0.985;
      ball.vy *= 0.985;
      if (Math.hypot(ball.vx, ball.vy) <= 0.08) {
        ball.vx = 0;
        ball.vy = 0;
      }

      if (ball.x - BALL_R < 8) { ball.x = 8 + BALL_R; ball.vx = Math.abs(ball.vx) * 0.85; }
      if (ball.x + BALL_R > W - 8) { ball.x = W - 8 - BALL_R; ball.vx = -Math.abs(ball.vx) * 0.85; }
      if (ball.y - BALL_R < 8) { ball.y = 8 + BALL_R; ball.vy = Math.abs(ball.vy) * 0.85; }
      if (ball.y + BALL_R > H - 8) { ball.y = H - 8 - BALL_R; ball.vy = -Math.abs(ball.vy) * 0.85; }

      for (const wall of h.walls) {
        const nearestX = Math.max(wall.x, Math.min(ball.x, wall.x + wall.w));
        const nearestY = Math.max(wall.y, Math.min(ball.y, wall.y + wall.h));
        const dx = ball.x - nearestX;
        const dy = ball.y - nearestY;
        const dist = Math.hypot(dx, dy);
        if (dist < BALL_R) {
          if (Math.abs(dx) > Math.abs(dy)) {
            ball.vx = -ball.vx * 0.85;
            ball.x += dx >= 0 ? BALL_R - dist : -(BALL_R - dist);
          } else {
            ball.vy = -ball.vy * 0.85;
            ball.y += dy >= 0 ? BALL_R - dist : -(BALL_R - dist);
          }
        }
      }

      if (Math.hypot(ball.x - h.cup.x, ball.y - h.cup.y) < CUP_R) {
        ball.x = h.cup.x;
        ball.y = h.cup.y;
        onHoleSunk();
      }
    }
  }

  function draw() {
    if (!ctx) return;
    const h = HOLES[holeIdx];

    ctx.fillStyle = '#071c19';
    ctx.fillRect(0, 0, W, H);

    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 4;
    ctx.strokeRect(6, 6, W - 12, H - 12);

    // Cup
    ctx.fillStyle = '#020617';
    ctx.beginPath();
    ctx.arc(h.cup.x, h.cup.y, CUP_R, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#6ee7b7';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Walls
    for (const wall of h.walls) {
      ctx.fillStyle = '#334155';
      ctx.fillRect(wall.x, wall.y, wall.w, wall.h);
      ctx.strokeStyle = '#22d3ee';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(wall.x, wall.y, wall.w, wall.h);
    }

    // Aim line
    if (dragging && dragPt && !sunk && !isMoving()) {
      const dx = ball.x - dragPt.x;
      const dy = ball.y - dragPt.y;
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(ball.x, ball.y);
      ctx.lineTo(ball.x + dx, ball.y + dy);
      ctx.stroke();
    }

    // Ball
    ctx.fillStyle = '#f8fafc';
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, BALL_R, 0, Math.PI * 2);
    ctx.fill();
  }

  function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
  }

  canvas?.addEventListener('pointerdown', (e) => {
    if (sunk || isMoving()) return;
    dragging = true;
    dragPt = getPointer(e);
  });

  canvas?.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    dragPt = getPointer(e);
  });

  window.addEventListener('pointerup', () => {
    if (!dragging || !dragPt) return;
    dragging = false;
    const dx = ball.x - dragPt.x;
    const dy = ball.y - dragPt.y;
    const power = Math.min(13, Math.hypot(dx, dy) * 0.11);
    if (power > 0.6) {
      const ang = Math.atan2(dy, dx);
      ball.vx = Math.cos(ang) * power;
      ball.vy = Math.sin(ang) * power;
      strokes += 1;
      syncHud();
    }
    dragPt = null;
  });

  dom.retryBtn?.addEventListener('click', () => loadHole(holeIdx));
  dom.nextBtn?.addEventListener('click', () => loadHole(holeIdx + 1));

  loadHole(0);
  requestAnimationFrame(loop);
})();