'use strict';

(function () {
  const BEST_PREFIX = 'arcade_gd_best_lvl_';
  const CLEARED_KEY = 'arcade_gd_cleared_levels_v1';
  const MUTE_KEY = 'arcade_audio_muted_v1';
  const FIXED_DT = 1000 / 60;
  const JUMP_BUFFER_SEC = 0.13;

  // Built-in Web Audio Music & Sound Effects (works even without arcade-audio.js)
  let audioCtx = null;
  let musicTimer = null;
  let musicStep = 0;
  let muted = false;

  try {
    muted = localStorage.getItem(MUTE_KEY) === '1';
  } catch {
    muted = false;
  }

  const MUSIC_NOTES = [146.83, 174.61, 220.0, 293.66, 261.63, 220.0, 196.0, 220.0];
  const MUSIC_TEMPO_MS = 165;

  function ensureAudio() {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        audioCtx = new AudioContextClass();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume().catch(() => {});
    }
    return audioCtx;
  }

  function playTone(freq, duration, type, volume, delay = 0) {
    if (muted) return;
    const ac = ensureAudio();
    if (!ac) return;

    const startAt = ac.currentTime + delay;
    const osc = ac.createOscillator();
    const gain = ac.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, startAt);

    gain.gain.setValueAtTime(0.0001, startAt);
    gain.gain.exponentialRampToValueAtTime(Math.max(0.0001, volume), startAt + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, startAt + duration);

    osc.connect(gain);
    gain.connect(ac.destination);

    osc.start(startAt);
    osc.stop(startAt + duration + 0.02);
  }

  function startMusic() {
    if (musicTimer || muted) return;
    const ac = ensureAudio();
    if (!ac) return;

    musicTimer = setInterval(() => {
      if (muted || !audioCtx || audioCtx.state !== 'running') return;
      const freq = MUSIC_NOTES[musicStep % MUSIC_NOTES.length];
      playTone(freq, (MUSIC_TEMPO_MS / 1000) * 0.85, 'sawtooth', 0.028, 0);
      musicStep += 1;
    }, MUSIC_TEMPO_MS);
  }

  function stopMusic() {
    if (musicTimer) {
      clearInterval(musicTimer);
      musicTimer = null;
    }
  }

  function unlockMusic() {
    ensureAudio();
    if (!muted) {
      startMusic();
    }
  }

  function sfxJump() {
    unlockMusic();
    playTone(340, 0.08, 'square', 0.045, 0);
    playTone(540, 0.1, 'triangle', 0.06, 0.03);
  }

  function sfxCrash() {
    playTone(160, 0.16, 'sawtooth', 0.08, 0);
    playTone(95, 0.24, 'sawtooth', 0.08, 0.08);
  }

  function sfxWin() {
    playTone(523.25, 0.1, 'triangle', 0.07, 0);
    playTone(659.25, 0.1, 'triangle', 0.07, 0.09);
    playTone(783.99, 0.1, 'triangle', 0.07, 0.18);
    playTone(1046.5, 0.24, 'triangle', 0.08, 0.27);
  }

  function sfxClick() {
    unlockMusic();
    playTone(440, 0.05, 'sine', 0.04, 0);
  }

  function updateMuteButton() {
    const btn = document.getElementById('gdMuteBtn');
    if (!btn) return;
    btn.textContent = muted ? '🔇 Music OFF (M)' : '🔊 Music ON (M)';
    btn.setAttribute('aria-pressed', String(muted));
  }

  function toggleMute() {
    muted = !muted;
    try {
      localStorage.setItem(MUTE_KEY, muted ? '1' : '0');
    } catch {}
    if (muted) {
      stopMusic();
    } else {
      unlockMusic();
    }
    updateMuteButton();
  }

  function setupMuteButton() {
    if (document.getElementById('gdMuteBtn')) {
      updateMuteButton();
      return;
    }
    const nav = document.querySelector('.topbar .nav-actions') || document.querySelector('.topbar');
    if (!nav) return;

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.id = 'gdMuteBtn';
    btn.className = 'nav-link';
    btn.style.cursor = 'pointer';
    btn.addEventListener('click', toggleMute);
    nav.appendChild(btn);
    updateMuteButton();
  }

  const LEVELS = [
    {
      name: 'Neon Warmup',
      diff: 'LEVEL 1 • EASY',
      speed: 5.2,
      cubeColor: '#22d3ee',
      accent: '#10b981',
      lengthPx: 2600,
      rewardXp: 25,
      rewardCoins: 10,
      blocks: [
        { x: 650, y: 196, w: 120, h: 44 },
        { x: 1320, y: 176, w: 140, h: 64 },
        { x: 2020, y: 196, w: 130, h: 44 }
      ],
      spikes: [
        { x: 460, w: 28, h: 28 },
        { x: 960, w: 28, h: 28 },
        { x: 1640, w: 28, h: 28 },
        { x: 2280, w: 28, h: 28 }
      ]
    },
    {
      name: 'Pulse Steps',
      diff: 'LEVEL 2 • MEDIUM',
      speed: 6.3,
      cubeColor: '#38bdf8',
      accent: '#22d3ee',
      lengthPx: 3200,
      rewardXp: 40,
      rewardCoins: 15,
      blocks: [
        { x: 560, y: 192, w: 110, h: 48 },
        { x: 820, y: 156, w: 115, h: 84 },
        { x: 1520, y: 184, w: 120, h: 56 },
        { x: 2240, y: 162, w: 130, h: 78 },
        { x: 2740, y: 192, w: 110, h: 48 }
      ],
      spikes: [
        { x: 410, w: 28, h: 30 },
        { x: 705, w: 28, h: 30 },
        { x: 1120, w: 28, h: 30 },
        { x: 1152, w: 28, h: 30 },
        { x: 1820, w: 28, h: 30 },
        { x: 2500, w: 28, h: 30 },
        { x: 2940, w: 28, h: 30 }
      ]
    },
    {
      name: 'Spike Gauntlet',
      diff: 'LEVEL 3 • HARD',
      speed: 7.4,
      cubeColor: '#a855f7',
      accent: '#f59e0b',
      lengthPx: 3800,
      rewardXp: 60,
      rewardCoins: 22,
      blocks: [
        { x: 600, y: 184, w: 105, h: 56 },
        { x: 840, y: 146, w: 105, h: 94 },
        { x: 1580, y: 176, w: 110, h: 64 },
        { x: 2150, y: 152, w: 110, h: 88 },
        { x: 2920, y: 180, w: 115, h: 60 },
        { x: 3250, y: 146, w: 105, h: 94 }
      ],
      spikes: [
        { x: 390, w: 28, h: 32 },
        { x: 735, w: 28, h: 32 },
        { x: 1080, w: 28, h: 32 },
        { x: 1112, w: 28, h: 32 },
        { x: 1380, w: 28, h: 32 },
        { x: 1860, w: 28, h: 32 },
        { x: 1892, w: 28, h: 32 },
        { x: 2450, w: 28, h: 32 },
        { x: 2730, w: 28, h: 32 },
        { x: 3440, w: 28, h: 32 }
      ]
    },
    {
      name: 'Overdrive Surge',
      diff: 'LEVEL 4 • VERY HARD',
      speed: 8.5,
      cubeColor: '#f59e0b',
      accent: '#f43f5e',
      lengthPx: 4400,
      rewardXp: 85,
      rewardCoins: 30,
      blocks: [
        { x: 540, y: 186, w: 96, h: 54 },
        { x: 760, y: 148, w: 96, h: 92 },
        { x: 980, y: 186, w: 96, h: 54 },
        { x: 1680, y: 166, w: 105, h: 74 },
        { x: 2320, y: 148, w: 100, h: 92 },
        { x: 3020, y: 176, w: 100, h: 64 },
        { x: 3650, y: 150, w: 100, h: 90 }
      ],
      spikes: [
        { x: 360, w: 28, h: 32 },
        { x: 1210, w: 28, h: 32 },
        { x: 1242, w: 28, h: 32 },
        { x: 1510, w: 28, h: 32 },
        { x: 1960, w: 28, h: 32 },
        { x: 2130, w: 28, h: 32 },
        { x: 2162, w: 28, h: 32 },
        { x: 2620, w: 28, h: 32 },
        { x: 2840, w: 28, h: 32 },
        { x: 3280, w: 28, h: 32 },
        { x: 3312, w: 28, h: 32 },
        { x: 3920, w: 28, h: 32 },
        { x: 3952, w: 28, h: 32 }
      ]
    },
    {
      name: 'Cyber Nightmare',
      diff: 'LEVEL 5 • EXTREME',
      speed: 9.6,
      cubeColor: '#f43f5e',
      accent: '#a855f7',
      lengthPx: 5000,
      rewardXp: 120,
      rewardCoins: 45,
      blocks: [
        { x: 520, y: 184, w: 92, h: 56 },
        { x: 730, y: 146, w: 92, h: 94 },
        { x: 940, y: 184, w: 92, h: 56 },
        { x: 1580, y: 164, w: 96, h: 76 },
        { x: 2140, y: 146, w: 96, h: 94 },
        { x: 2740, y: 174, w: 96, h: 66 },
        { x: 3340, y: 146, w: 96, h: 94 },
        { x: 4040, y: 176, w: 100, h: 64 }
      ],
      spikes: [
        { x: 340, w: 28, h: 34 },
        { x: 1150, w: 28, h: 34 },
        { x: 1182, w: 28, h: 34 },
        { x: 1410, w: 28, h: 34 },
        { x: 1820, w: 28, h: 34 },
        { x: 1990, w: 28, h: 34 },
        { x: 2022, w: 28, h: 34 },
        { x: 2420, w: 28, h: 34 },
        { x: 2580, w: 28, h: 34 },
        { x: 2980, w: 28, h: 34 },
        { x: 3012, w: 28, h: 34 },
        { x: 3580, w: 28, h: 34 },
        { x: 3820, w: 28, h: 34 },
        { x: 4320, w: 28, h: 34 },
        { x: 4352, w: 28, h: 34 },
        { x: 4640, w: 28, h: 34 }
      ]
    }
  ];

  const canvas = document.getElementById('dashCanvas');
  const ctx = canvas?.getContext('2d');

  const dom = {
    diffTag: document.getElementById('dashDiffTag'),
    heading: document.getElementById('dashHeading'),
    progress: document.getElementById('dashProgress'),
    attempts: document.getElementById('dashAttempts'),
    best: document.getElementById('dashBest'),
    status: document.getElementById('dashStatus'),
    jumpBtn: document.getElementById('btnDashJump'),
    restartBtn: document.getElementById('btnDashRestart')
  };

  const W = canvas ? canvas.width : 640;
  const H = canvas ? canvas.height : 300;
  const GROUND_Y = 240;
  const PLAYER_SIZE = 28;
  const PLAYER_X = 96;

  let currentLvl = 0;
  let attempts = 1;
  let bestPct = loadBest(0);

  let worldX = 0;
  let py = GROUND_Y - PLAYER_SIZE;
  let vy = 0;
  let onGround = true;
  let angle = 0;
  let jumpBufferTimer = 0;
  let state = 'playing'; // 'playing' | 'dead' | 'won'
  let accumulator = 0;
  let lastFrameTime = performance.now();

  function loadBest(lvlIdx) {
    try {
      const v = Number(localStorage.getItem(`${BEST_PREFIX}${lvlIdx}`));
      return Number.isFinite(v) && v >= 0 ? Math.min(100, Math.floor(v)) : 0;
    } catch { return 0; }
  }

  function saveBest(lvlIdx, pct) {
    try { localStorage.setItem(`${BEST_PREFIX}${lvlIdx}`, String(Math.min(100, Math.floor(pct)))); } catch {}
  }

  function loadCleared() {
    try {
      const arr = JSON.parse(localStorage.getItem(CLEARED_KEY) || '[]');
      return Array.isArray(arr) ? arr : [];
    } catch { return []; }
  }

  function saveCleared(arr) {
    try { localStorage.setItem(CLEARED_KEY, JSON.stringify(arr)); } catch {}
  }

  function currentPct() {
    const lvl = LEVELS[currentLvl];
    return Math.min(100, Math.max(0, Math.floor((worldX / lvl.lengthPx) * 100)));
  }

  function syncHud() {
    const lvl = LEVELS[currentLvl];
    const pct = currentPct();
    if (pct > bestPct) {
      bestPct = pct;
      saveBest(currentLvl, bestPct);
    }
    if (dom.diffTag) dom.diffTag.textContent = lvl.diff;
    if (dom.heading) dom.heading.textContent = lvl.name;
    if (dom.progress) dom.progress.textContent = `${pct}%`;
    if (dom.attempts) dom.attempts.textContent = String(attempts);
    if (dom.best) dom.best.textContent = `${bestPct}%`;

    document.querySelectorAll('.lvl-btn').forEach((btn) => {
      btn.classList.toggle('active', Number(btn.dataset.lvl) === currentLvl);
    });
  }

  function resetRun(incrementAttempt) {
    if (incrementAttempt) attempts += 1;
    worldX = 0;
    py = GROUND_Y - PLAYER_SIZE;
    vy = 0;
    onGround = true;
    angle = 0;
    jumpBufferTimer = 0;
    state = 'playing';
    syncHud();
  }

  function selectLevel(idx) {
    const clamped = Math.max(0, Math.min(LEVELS.length - 1, idx));
    currentLvl = clamped;
    attempts = 1;
    bestPct = loadBest(currentLvl);
    resetRun(false);
    sfxClick();
    if (dom.status) {
      dom.status.textContent = `Loaded ${LEVELS[currentLvl].name} (${LEVELS[currentLvl].diff}). Jump over spikes!`;
    }
  }

  function executeJumpIfPossible() {
    if (onGround && jumpBufferTimer > 0) {
      vy = -11.4;
      onGround = false;
      jumpBufferTimer = 0;
      sfxJump();
    }
  }

  function jump() {
    unlockMusic();
    if (state === 'dead') {
      resetRun(true);
      return;
    }
    if (state === 'won') {
      const next = (currentLvl + 1) % LEVELS.length;
      selectLevel(next);
      return;
    }
    jumpBufferTimer = JUMP_BUFFER_SEC;
    executeJumpIfPossible();
  }

  function awardLevelClear(lvl) {
    const cleared = loadCleared();
    if (cleared.includes(currentLvl)) return;
    cleared.push(currentLvl);
    saveCleared(cleared);

    const api = window.ArcadeQuests;
    if (api && typeof api.loadData === 'function' && typeof api.saveData === 'function') {
      const st = api.loadData();
      st.xp = (Number(st.xp) || 0) + lvl.rewardXp;
      st.coins = (Number(st.coins) || 0) + lvl.rewardCoins;
      api.saveData(st);
    }
  }

  function die(msg) {
    if (state !== 'playing') return;
    state = 'dead';
    jumpBufferTimer = 0;
    sfxCrash();
    syncHud();
    if (dom.status) {
      dom.status.textContent = `${msg} (${currentPct()}%) — Press Space / Click to retry!`;
    }
  }

  function winLevel() {
    if (state !== 'playing') return;
    state = 'won';
    jumpBufferTimer = 0;
    worldX = LEVELS[currentLvl].lengthPx;
    bestPct = 100;
    saveBest(currentLvl, 100);
    const lvl = LEVELS[currentLvl];
    const firstTime = !loadCleared().includes(currentLvl);
    awardLevelClear(lvl);
    sfxWin();
    syncHud();
    if (dom.status) {
      dom.status.textContent = firstTime
        ? `Cleared ${lvl.name}! Earned +${lvl.rewardXp} XP and +${lvl.rewardCoins} Coins!`
        : `Cleared ${lvl.name} again! Press Space / Click for the next level.`;
    }
  }

  function stepPhysics() {
    if (state !== 'playing') return;
    const lvl = LEVELS[currentLvl];

    if (jumpBufferTimer > 0) {
      jumpBufferTimer = Math.max(0, jumpBufferTimer - FIXED_DT / 1000);
    }

    worldX += lvl.speed;
    if (worldX >= lvl.lengthPx) {
      winLevel();
      return;
    }

    const prevBottom = py + PLAYER_SIZE;
    vy += 0.64;
    py += vy;

    let landedSupport = GROUND_Y;
    const pLeft = PLAYER_X;
    const pRight = PLAYER_X + PLAYER_SIZE;

    for (const blk of lvl.blocks) {
      const bLeft = blk.x - worldX;
      const bRight = bLeft + blk.w;
      const overlapX = pRight > bLeft + 3 && pLeft < bRight - 3;

      if (overlapX) {
        if (vy >= 0 && prevBottom <= blk.y + 12 && py + PLAYER_SIZE >= blk.y) {
          landedSupport = Math.min(landedSupport, blk.y);
        } else if (py < blk.y + blk.h && py + PLAYER_SIZE > blk.y + 8 && pRight > bLeft + 3 && pLeft < bRight - 3) {
          die('Hit a block wall!');
          return;
        }
      }
    }

    if (py + PLAYER_SIZE >= landedSupport) {
      py = landedSupport - PLAYER_SIZE;
      vy = 0;
      onGround = true;
      angle = Math.round(angle / (Math.PI / 2)) * (Math.PI / 2);
      executeJumpIfPossible();
    } else {
      onGround = false;
      angle += 0.14;
    }

    for (const spk of lvl.spikes) {
      const sLeft = spk.x - worldX + 5;
      const sRight = spk.x - worldX + spk.w - 5;
      const sTop = GROUND_Y - spk.h + 5;
      const sBottom = GROUND_Y;

      if (pRight > sLeft && pLeft < sRight && py + PLAYER_SIZE > sTop && py < sBottom) {
        die('Crashed into a spike!');
        return;
      }
    }

    syncHud();
  }

  function draw() {
    if (!ctx) return;
    const lvl = LEVELS[currentLvl];

    ctx.fillStyle = '#060b1b';
    ctx.fillRect(0, 0, W, H);

    ctx.strokeStyle = 'rgba(148, 163, 184, 0.08)';
    ctx.lineWidth = 1;
    const gridOffset = -(worldX % 32);
    for (let x = gridOffset; x < W; x += 32) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, GROUND_Y);
      ctx.stroke();
    }

    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, GROUND_Y, W, H - GROUND_Y);
    ctx.strokeStyle = lvl.accent;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(0, GROUND_Y);
    ctx.lineTo(W, GROUND_Y);
    ctx.stroke();

    for (const blk of lvl.blocks) {
      const bx = blk.x - worldX;
      if (bx + blk.w < -40 || bx > W + 40) continue;
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(bx, blk.y, blk.w, blk.h);
      ctx.strokeStyle = lvl.accent;
      ctx.lineWidth = 2;
      ctx.strokeRect(bx, blk.y, blk.w, blk.h);
    }

    for (const spk of lvl.spikes) {
      const sx = spk.x - worldX;
      if (sx + spk.w < -40 || sx > W + 40) continue;
      ctx.fillStyle = '#f43f5e';
      ctx.beginPath();
      ctx.moveTo(sx, GROUND_Y);
      ctx.lineTo(sx + spk.w / 2, GROUND_Y - spk.h);
      ctx.lineTo(sx + spk.w, GROUND_Y);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#fda4af';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    ctx.save();
    ctx.translate(PLAYER_X + PLAYER_SIZE / 2, py + PLAYER_SIZE / 2);
    ctx.rotate(angle);
    ctx.fillStyle = lvl.cubeColor;
    ctx.fillRect(-PLAYER_SIZE / 2, -PLAYER_SIZE / 2, PLAYER_SIZE, PLAYER_SIZE);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.strokeRect(-PLAYER_SIZE / 2, -PLAYER_SIZE / 2, PLAYER_SIZE, PLAYER_SIZE);
    ctx.restore();

    if (state === 'dead') {
      ctx.fillStyle = 'rgba(4, 8, 20, 0.68)';
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = '#fda4af';
      ctx.font = '800 22px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`CRASHED AT ${currentPct()}%`, W / 2, H * 0.48);
    } else if (state === 'won') {
      ctx.fillStyle = 'rgba(4, 8, 20, 0.72)';
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = '#6ee7b7';
      ctx.font = '800 22px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`${lvl.name.toUpperCase()} — 100% CLEARED!`, W / 2, H * 0.48);
    }
  }

  function loop(now) {
    const frameDelta = Math.min(100, Math.max(0, now - lastFrameTime));
    lastFrameTime = now;
    accumulator += frameDelta;

    while (accumulator >= FIXED_DT) {
      stepPhysics();
      accumulator -= FIXED_DT;
    }

    draw();
    requestAnimationFrame(loop);
  }

  setupMuteButton();

  document.querySelectorAll('.lvl-btn').forEach((btn) => {
    btn.addEventListener('click', () => selectLevel(Number(btn.dataset.lvl)));
  });

  dom.jumpBtn?.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    jump();
  });
  dom.restartBtn?.addEventListener('click', () => {
    sfxClick();
    resetRun(true);
  });
  canvas?.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    jump();
  });

  window.addEventListener('pointerdown', unlockMusic, { passive: true });
  window.addEventListener('keydown', (e) => {
    if (e.repeat) return;
    if (e.key === 'm' || e.key === 'M') {
      toggleMute();
      return;
    }
    unlockMusic();
    if (e.code === 'Space' || e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
      e.preventDefault();
      jump();
    } else if (e.key >= '1' && e.key <= '5') {
      selectLevel(Number(e.key) - 1);
    }
  });

  syncHud();
  requestAnimationFrame(loop);
})();