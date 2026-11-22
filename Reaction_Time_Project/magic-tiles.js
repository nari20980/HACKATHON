'use strict';

(function () {
  const BEST_KEY = 'arcade_magic_tiles_best_v1';
  const canvas = document.getElementById('tilesCanvas');
  const ctx = canvas?.getContext('2d');

  const dom = {
    score: document.getElementById('tilesScore'),
    streak: document.getElementById('tilesStreak'),
    best: document.getElementById('tilesBest'),
    startBtn: document.getElementById('btnTilesStart'),
    status: document.getElementById('tilesStatus')
  };

  const W = canvas ? canvas.width : 320;
  const H = canvas ? canvas.height : 440;
  const LANES = 4;
  const LANE_W = W / LANES;
  const TILE_H = 78;

  let tiles = [];
  let score = 0;
  let streak = 0;
  let best = loadBest();
  let running = false;
  let rewardGiven = false;
  let spawnTimer = 0;

  function loadBest() {
    try {
      const v = Number(localStorage.getItem(BEST_KEY));
      return Number.isFinite(v) && v >= 0 ? Math.floor(v) : 0;
    } catch { return 0; }
  }

  function saveBest(val) {
    try { localStorage.setItem(BEST_KEY, String(Math.floor(val))); } catch {}
  }

  function syncHud() {
    if (score > best) { best = score; saveBest(best); }
    if (dom.score) dom.score.textContent = String(score);
    if (dom.streak) dom.streak.textContent = String(streak);
    if (dom.best) dom.best.textContent = String(best);
  }

  function spawnTile() {
    const lane = Math.floor(Math.random() * LANES);
    tiles.push({
      lane,
      y: -TILE_H,
      hit: false
    });
  }

  function startGame() {
    tiles = [];
    score = 0;
    streak = 0;
    rewardGiven = false;
    spawnTimer = 0;
    running = true;
    spawnTile();
    syncHud();
    if (dom.status) dom.status.textContent = 'Tap tiles or press D / F / J / K (1–4) as they fall!';
  }

  function endGame(reason) {
    running = false;
    syncHud();
    if (score >= 15 && !rewardGiven && window.ArcadeQuests?.loadData) {
      rewardGiven = true;
      const st = window.ArcadeQuests.loadData();
      st.xp = (Number(st.xp) || 0) + 30;
      st.coins = (Number(st.coins) || 0) + 12;
      window.ArcadeQuests.saveData(st);
      if (dom.status) {
        dom.status.textContent = `${reason} Score: ${score} • Earned +30 XP and +12 Coins!`;
      }
    } else if (dom.status) {
      dom.status.textContent = `${reason} Final score: ${score}. Click Start / Restart to try again.`;
    }
  }

  function hitLane(lane) {
    if (!running) return;
    const candidate = tiles.find((t) => !t.hit && t.lane === lane && t.y + TILE_H > 40 && t.y < H);
    if (candidate) {
      candidate.hit = true;
      score += 1;
      streak += 1;
      syncHud();
    } else {
      streak = 0;
      endGame(`Missed lane ${lane + 1}!`);
    }
  }

  function update() {
    if (!running) return;
    const speed = 3.2 + Math.min(4.2, score * 0.08);
    spawnTimer += speed;
    if (spawnTimer >= 122) {
      spawnTimer = 0;
      spawnTile();
    }

    for (let i = tiles.length - 1; i >= 0; i -= 1) {
      const t = tiles[i];
      t.y += speed;
      if (!t.hit && t.y > H) {
        endGame('A tile slipped past the bottom!');
        return;
      }
      if (t.y > H + TILE_H) {
        tiles.splice(i, 1);
      }
    }
  }

  function draw() {
    if (!ctx) return;
    ctx.fillStyle = '#060b1b';
    ctx.fillRect(0, 0, W, H);

    ctx.strokeStyle = 'rgba(148, 163, 184, 0.14)';
    ctx.lineWidth = 1;
    for (let i = 1; i < LANES; i += 1) {
      ctx.beginPath();
      ctx.moveTo(i * LANE_W, 0);
      ctx.lineTo(i * LANE_W, H);
      ctx.stroke();
    }

    // Hit line
    ctx.strokeStyle = 'rgba(34, 211, 238, 0.45)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, H - 56);
    ctx.lineTo(W, H - 56);
    ctx.stroke();

    for (const t of tiles) {
      ctx.fillStyle = t.hit ? 'rgba(16, 185, 129, 0.25)' : '#22d3ee';
      ctx.fillRect(t.lane * LANE_W + 6, t.y, LANE_W - 12, TILE_H);
      if (!t.hit) {
        ctx.strokeStyle = '#a855f7';
        ctx.lineWidth = 2;
        ctx.strokeRect(t.lane * LANE_W + 6, t.y, LANE_W - 12, TILE_H);
      }
    }
  }

  function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
  }

  canvas?.addEventListener('pointerdown', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) * W) / Math.max(1, rect.width);
    const lane = Math.max(0, Math.min(LANES - 1, Math.floor(x / LANE_W)));
    hitLane(lane);
  });

  document.querySelectorAll('.lane-btn').forEach((btn) => {
    btn.addEventListener('click', () => hitLane(Number(btn.dataset.lane) || 0));
  });

  dom.startBtn?.addEventListener('click', startGame);

  window.addEventListener('keydown', (e) => {
    const k = e.key.toLowerCase();
    if (k === 'd' || k === '1') hitLane(0);
    else if (k === 'f' || k === '2') hitLane(1);
    else if (k === 'j' || k === '3') hitLane(2);
    else if (k === 'k' || k === '4') hitLane(3);
  });

  startGame();
  requestAnimationFrame(loop);
})();