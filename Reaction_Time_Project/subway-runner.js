'use strict';

(function () {
  const BEST_KEY = 'arcade_subway_best_v1';
  const canvas = document.getElementById('runnerCanvas');
  const ctx = canvas?.getContext('2d');

  const dom = {
    dist: document.getElementById('runDist'),
    coins: document.getElementById('runCoins'),
    best: document.getElementById('runBest'),
    startBtn: document.getElementById('btnRunStart'),
    status: document.getElementById('runnerStatus')
  };

  const W = canvas ? canvas.width : 380;
  const H = canvas ? canvas.height : 480;
  const LANE_CENTERS = [W * 0.24, W * 0.5, W * 0.76];
  const LANE_W = 84;
  const PLAYER_Y = H - 86;

  let lane = 1; // 0, 1, 2
  let playerX = LANE_CENTERS[1];
  let jumpZ = 0; // height above ground
  let vz = 0;
  let rollTimer = 0;

  let running = false;
  let distancePx = 0;
  let coins = 0;
  let bestMeters = loadBest();
  let speed = 5.2;
  let spawnGap = 0;
  let trackScroll = 0;
  let rewardGiven = false;
  let touchStart = null;

  // Obstacles: { lane, y, h, kind: 'low' | 'high' | 'train' }
  let obstacles = [];
  // Coins: { lane, y, z, collected }
  let coinItems = [];

  function loadBest() {
    try {
      const v = Number(localStorage.getItem(BEST_KEY));
      return Number.isFinite(v) && v >= 0 ? Math.floor(v) : 0;
    } catch { return 0; }
  }

  function saveBest(meters) {
    try { localStorage.setItem(BEST_KEY, String(Math.floor(meters))); } catch {}
  }

  function currentMeters() {
    return Math.floor(distancePx / 18);
  }

  function syncHud() {
    const m = currentMeters();
    if (m > bestMeters) {
      bestMeters = m;
      saveBest(bestMeters);
    }
    if (dom.dist) dom.dist.textContent = `${m}m`;
    if (dom.coins) dom.coins.textContent = String(coins);
    if (dom.best) dom.best.textContent = `${bestMeters}m`;
  }

  function spawnWave() {
    const kinds = ['low', 'high', 'train'];
    const kind = kinds[Math.floor(Math.random() * kinds.length)];
    const targetLane = Math.floor(Math.random() * 3);
    const h = kind === 'train' ? 96 : 26;

    obstacles.push({
      lane: targetLane,
      y: -h - 20,
      h,
      kind
    });

    // Spawn coins in another lane or trailing behind
    const coinLane = (targetLane + 1 + Math.floor(Math.random() * 2)) % 3;
    for (let i = 0; i < 3; i += 1) {
      coinItems.push({
        lane: coinLane,
        y: -120 - i * 34,
        z: kind === 'low' ? 18 : 0,
        collected: false
      });
    }
  }

  function startRun() {
    lane = 1;
    playerX = LANE_CENTERS[1];
    jumpZ = 0;
    vz = 0;
    rollTimer = 0;
    distancePx = 0;
    coins = 0;
    speed = 5.2;
    spawnGap = 40;
    obstacles = [];
    coinItems = [];
    rewardGiven = false;
    running = true;
    syncHud();
    if (dom.status) {
      dom.status.textContent = 'Endless run active! Dodge trains, jump low barriers, and roll under high ones.';
    }
  }

  function crash() {
    running = false;
    const m = currentMeters();
    syncHud();

    if (m >= 100 && !rewardGiven && window.ArcadeQuests?.loadData) {
      rewardGiven = true;
      const st = window.ArcadeQuests.loadData();
      st.xp = (Number(st.xp) || 0) + 35;
      st.coins = (Number(st.coins) || 0) + 15 + Math.floor(coins / 3);
      window.ArcadeQuests.saveData(st);
      if (dom.status) {
        dom.status.textContent = `Crashed at ${m}m (${coins} coins)! Earned +35 XP & bonus Coins. Click Start / Restart!`;
      }
    } else if (dom.status) {
      dom.status.textContent = `Crashed at ${m}m (${coins} coins). Click Start / Restart to keep running!`;
    }
  }

  function handleCommand(cmd) {
    if (!running && (cmd === 'left' || cmd === 'right' || cmd === 'jump')) {
      startRun();
    }
    if (!running) return;

    if (cmd === 'left') {
      lane = Math.max(0, lane - 1);
    } else if (cmd === 'right') {
      lane = Math.min(2, lane + 1);
    } else if (cmd === 'jump') {
      if (jumpZ <= 0.5) {
        vz = 11.2;
        rollTimer = 0;
      }
    } else if (cmd === 'roll') {
      if (jumpZ > 0.5) {
        vz = -12;
      }
      rollTimer = 26;
    }
  }

  function update() {
    if (!running) return;

    speed = Math.min(11.5, 5.2 + distancePx * 0.00018);
    distancePx += speed;
    trackScroll = (trackScroll + speed) % 44;

    const targetX = LANE_CENTERS[lane];
    playerX += (targetX - playerX) * 0.28;

    if (jumpZ > 0 || vz > 0) {
      jumpZ += vz;
      vz -= 0.68;
      if (jumpZ <= 0) {
        jumpZ = 0;
        vz = 0;
      }
    }

    if (rollTimer > 0) {
      rollTimer -= 1;
    }

    spawnGap -= speed;
    if (spawnGap <= 0) {
      spawnWave();
      spawnGap = Math.max(125, 225 - speed * 8);
    }

    const isRolling = rollTimer > 0 && jumpZ <= 1;

    for (let i = obstacles.length - 1; i >= 0; i -= 1) {
      const ob = obstacles[i];
      ob.y += speed;

      const sameLane = Math.abs(playerX - LANE_CENTERS[ob.lane]) < 34;
      const obTop = ob.y;
      const obBottom = ob.y + ob.h;
      const pTop = PLAYER_Y - 22 - jumpZ;
      const pBottom = PLAYER_Y + 14 - jumpZ;

      const overlapY = pBottom > obTop + 6 && pTop < obBottom - 6;
      if (sameLane && overlapY) {
        if (ob.kind === 'low' && jumpZ > 18) {
          // Jumped over low barrier
        } else if (ob.kind === 'high' && isRolling) {
          // Rolled under high barrier
        } else {
          crash();
          return;
        }
      }

      if (ob.y > H + 120) {
        obstacles.splice(i, 1);
      }
    }

    for (let i = coinItems.length - 1; i >= 0; i -= 1) {
      const c = coinItems[i];
      c.y += speed;
      if (!c.collected) {
        const nearLane = Math.abs(playerX - LANE_CENTERS[c.lane]) < 32;
        const nearY = Math.abs(c.y - (PLAYER_Y - jumpZ)) < 26;
        if (nearLane && nearY) {
          c.collected = true;
          coins += 1;
        }
      }
      if (c.y > H + 60 || c.collected) {
        coinItems.splice(i, 1);
      }
    }

    syncHud();
  }

  function draw() {
    if (!ctx) return;

    ctx.fillStyle = '#060b1b';
    ctx.fillRect(0, 0, W, H);

    // Track bed
    const trackLeft = W * 0.1;
    const trackRight = W * 0.9;
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(trackLeft, 0, trackRight - trackLeft, H);

    // Rails & sleepers
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.16)';
    ctx.lineWidth = 2;
    for (let y = -44 + trackScroll; y < H + 44; y += 44) {
      ctx.beginPath();
      ctx.moveTo(trackLeft, y);
      ctx.lineTo(trackRight, y);
      ctx.stroke();
    }

    for (const cx of LANE_CENTERS) {
      ctx.strokeStyle = 'rgba(34, 211, 238, 0.22)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cx - 14, 0);
      ctx.lineTo(cx - 14, H);
      ctx.moveTo(cx + 14, 0);
      ctx.lineTo(cx + 14, H);
      ctx.stroke();
    }

    // Coins
    for (const c of coinItems) {
      if (c.collected) continue;
      const cx = LANE_CENTERS[c.lane];
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.arc(cx, c.y - c.z, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#fef08a';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    // Obstacles
    for (const ob of obstacles) {
      const cx = LANE_CENTERS[ob.lane];
      const w = LANE_W - 18;
      const x = cx - w / 2;

      if (ob.kind === 'train') {
        ctx.fillStyle = '#a855f7';
        ctx.fillRect(x, ob.y, w, ob.h);
        ctx.strokeStyle = '#e9d5ff';
        ctx.lineWidth = 2;
        ctx.strokeRect(x, ob.y, w, ob.h);
        ctx.fillStyle = '#22d3ee';
        ctx.fillRect(x + 8, ob.y + 10, w - 16, 18);
      } else if (ob.kind === 'high') {
        ctx.fillStyle = '#f43f5e';
        ctx.fillRect(x, ob.y, w, ob.h);
      } else {
        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(x, ob.y, w, ob.h);
      }
    }

    // Runner character
    const isRolling = rollTimer > 0 && jumpZ <= 1;
    const pH = isRolling ? 18 : 34;
    const pW = isRolling ? 32 : 26;
    const py = PLAYER_Y - jumpZ - pH / 2 + 12;

    ctx.fillStyle = '#22d3ee';
    ctx.fillRect(playerX - pW / 2, py, pW, pH);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.strokeRect(playerX - pW / 2, py, pW, pH);
  }

  function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
  }

  dom.startBtn?.addEventListener('click', startRun);

  document.querySelectorAll('[data-cmd]').forEach((btn) => {
    btn.addEventListener('click', () => handleCommand(btn.dataset.cmd));
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') { e.preventDefault(); handleCommand('left'); }
    else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') { e.preventDefault(); handleCommand('right'); }
    else if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W' || e.code === 'Space') { e.preventDefault(); handleCommand('jump'); }
    else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') { e.preventDefault(); handleCommand('roll'); }
  });

  canvas?.addEventListener('pointerdown', (e) => {
    touchStart = { x: e.clientX, y: e.clientY };
  });

  canvas?.addEventListener('pointerup', (e) => {
    if (!touchStart) return;
    const dx = e.clientX - touchStart.x;
    const dy = e.clientY - touchStart.y;
    touchStart = null;
    if (Math.abs(dx) < 14 && Math.abs(dy) < 14) {
      handleCommand('jump');
      return;
    }
    if (Math.abs(dx) > Math.abs(dy)) {
      handleCommand(dx > 0 ? 'right' : 'left');
    } else {
      handleCommand(dy > 0 ? 'roll' : 'jump');
    }
  });

  syncHud();
  draw();
  requestAnimationFrame(loop);
})();