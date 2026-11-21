'use strict';

(function () {
  const BEST_STORAGE_KEY = 'arcade_aim_best_v1';
  const TARGET_SIZES = {
    normal: 54,
    small: 36
  };

  let durationSec = 15;
  let targetSizeKey = 'normal';
  let isRunning = false;
  let timeLeftMs = 15000;
  let lastTickPerf = 0;
  let rafId = null;

  let hits = 0;
  let misses = 0;
  let reactionTimesMs = [];
  let targetSpawnedAt = 0;
  let bestScore = loadBestScore();

  const dom = {
    arenaContainer: document.getElementById('arenaContainer'),
    arenaOverlay: document.getElementById('arenaOverlay'),
    overlayTitle: document.getElementById('overlayTitle'),
    overlayDesc: document.getElementById('overlayDesc'),
    btnStartAim: document.getElementById('btnStartAim'),
    statTime: document.getElementById('statTime'),
    statHits: document.getElementById('statHits'),
    statAccuracy: document.getElementById('statAccuracy'),
    statAvgMs: document.getElementById('statAvgMs'),
    statBest: document.getElementById('statBest'),
    aimStatusText: document.getElementById('aimStatusText'),
    aimRewardNote: document.getElementById('aimRewardNote')
  };

  function loadBestScore() {
    try {
      const val = Number(localStorage.getItem(BEST_STORAGE_KEY));
      return Number.isFinite(val) && val > 0 ? Math.floor(val) : 0;
    } catch {
      return 0;
    }
  }

  function saveBestScore(score) {
    try {
      localStorage.setItem(BEST_STORAGE_KEY, String(Math.floor(score)));
    } catch {
      // Ignore storage errors
    }
  }

  function getAccuracy() {
    const totalClicks = hits + misses;
    if (totalClicks <= 0) return 100;
    return Math.max(0, Math.round((hits / totalClicks) * 100));
  }

  function getAvgReactionMs() {
    if (!reactionTimesMs.length) return null;
    const sum = reactionTimesMs.reduce((acc, n) => acc + n, 0);
    return Math.round(sum / reactionTimesMs.length);
  }

  function getComputedScore() {
    const acc = getAccuracy();
    const sizeBonus = targetSizeKey === 'small' ? 1.25 : 1;
    return Math.round(hits * (acc / 100) * 10 * sizeBonus);
  }

  function renderStats() {
    const avg = getAvgReactionMs();
    if (dom.statTime) dom.statTime.textContent = `${(Math.max(0, timeLeftMs) / 1000).toFixed(1)}s`;
    if (dom.statHits) dom.statHits.textContent = String(hits);
    if (dom.statAccuracy) dom.statAccuracy.textContent = `${getAccuracy()}%`;
    if (dom.statAvgMs) dom.statAvgMs.textContent = avg !== null ? `${avg} ms` : '-- ms';
    if (dom.statBest) dom.statBest.textContent = String(bestScore);
  }

  function clearExistingTarget() {
    dom.arenaContainer?.querySelectorAll('.aim-target').forEach((el) => el.remove());
  }

  function spawnTarget() {
    if (!isRunning || !dom.arenaContainer) return;
    clearExistingTarget();

    const rect = dom.arenaContainer.getBoundingClientRect();
    const size = TARGET_SIZES[targetSizeKey] || TARGET_SIZES.normal;
    const pad = Math.ceil(size / 2) + 14;

    const usableW = Math.max(40, rect.width - pad * 2);
    const usableH = Math.max(40, rect.height - pad * 2);
    const x = pad + Math.random() * usableW;
    const y = pad + Math.random() * usableH;

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'aim-target';
    btn.setAttribute('aria-label', 'Aim target');
    btn.style.width = `${size}px`;
    btn.style.height = `${size}px`;
    btn.style.left = `${x}px`;
    btn.style.top = `${y}px`;

    btn.addEventListener('pointerdown', (e) => {
      e.stopPropagation();
      if (!isRunning) return;

      const elapsed = Math.max(1, Math.round(performance.now() - targetSpawnedAt));
      reactionTimesMs.push(elapsed);
      hits += 1;
      renderStats();
      spawnTarget();
    });

    targetSpawnedAt = performance.now();
    dom.arenaContainer.appendChild(btn);
  }

  function awardArcadeRewards(score) {
    const api = window.ArcadeQuests;
    if (!api || typeof api.loadData !== 'function' || typeof api.saveData !== 'function') {
      return null;
    }
    const xpEarned = Math.max(10, Math.min(80, Math.floor(score / 4) + hits));
    const coinsEarned = hits >= 10 ? 15 : hits >= 5 ? 10 : 5;

    const state = api.loadData();
    state.xp = (Number(state.xp) || 0) + xpEarned;
    state.coins = (Number(state.coins) || 0) + coinsEarned;
    api.saveData(state);

    return { xpEarned, coinsEarned };
  }

  function finishRun() {
    isRunning = false;
    if (rafId) cancelAnimationFrame(rafId);
    rafId = null;
    timeLeftMs = 0;
    clearExistingTarget();

    const finalScore = getComputedScore();
    if (finalScore > bestScore) {
      bestScore = finalScore;
      saveBestScore(bestScore);
    }

    const reward = hits > 0 ? awardArcadeRewards(finalScore) : null;
    renderStats();

    document.querySelectorAll('.chip-btn').forEach((b) => {
      b.disabled = false;
    });

    const avg = getAvgReactionMs();
    if (dom.overlayTitle) dom.overlayTitle.textContent = `Run Complete • Score ${finalScore}`;
    if (dom.overlayDesc) {
      dom.overlayDesc.textContent =
        `${hits} hits • ${getAccuracy()}% accuracy • Avg ${avg !== null ? `${avg} ms` : '-- ms'}` +
        (reward ? ` • Earned +${reward.xpEarned} XP & +${reward.coinsEarned} Coins!` : '');
    }
    if (dom.btnStartAim) dom.btnStartAim.textContent = 'Play Again';
    if (dom.aimStatusText) {
      dom.aimStatusText.textContent = `Final Score: ${finalScore} (Best: ${bestScore}).`;
    }
    if (dom.aimRewardNote && reward) {
      dom.aimRewardNote.textContent = `Rewarded +${reward.xpEarned} XP & +${reward.coinsEarned} Coins`;
    }
    dom.arenaOverlay?.classList.remove('hidden');
  }

  function loop(now) {
    if (!isRunning) return;
    const dt = now - lastTickPerf;
    lastTickPerf = now;
    timeLeftMs -= dt;

    renderStats();

    if (timeLeftMs <= 0) {
      finishRun();
      return;
    }
    rafId = requestAnimationFrame(loop);
  }

  function startRun() {
    hits = 0;
    misses = 0;
    reactionTimesMs = [];
    timeLeftMs = durationSec * 1000;
    isRunning = true;
    lastTickPerf = performance.now();

    document.querySelectorAll('.chip-btn').forEach((b) => {
      b.disabled = true;
    });

    dom.arenaOverlay?.classList.add('hidden');
    if (dom.aimStatusText) dom.aimStatusText.textContent = 'Go! Click each target as fast as you can.';
    renderStats();
    spawnTarget();
    rafId = requestAnimationFrame(loop);
  }

  dom.btnStartAim?.addEventListener('click', startRun);

  dom.arenaContainer?.addEventListener('pointerdown', (e) => {
    if (!isRunning) return;
    if (e.target.closest('.aim-target')) return;
    misses += 1;
    dom.arenaContainer.classList.remove('miss-flash');
    void dom.arenaContainer.offsetWidth;
    dom.arenaContainer.classList.add('miss-flash');
    renderStats();
  });

  document.querySelectorAll('.chip-btn[data-duration]').forEach((btn) => {
    btn.addEventListener('click', () => {
      if (isRunning) return;
      durationSec = Number(btn.dataset.duration) || 15;
      timeLeftMs = durationSec * 1000;
      document.querySelectorAll('.chip-btn[data-duration]').forEach((b) => {
        b.classList.toggle('active', b === btn);
      });
      renderStats();
    });
  });

  document.querySelectorAll('.chip-btn[data-size]').forEach((btn) => {
    btn.addEventListener('click', () => {
      if (isRunning) return;
      targetSizeKey = btn.dataset.size === 'small' ? 'small' : 'normal';
      document.querySelectorAll('.chip-btn[data-size]').forEach((b) => {
        b.classList.toggle('active', b === btn);
      });
    });
  });

  renderStats();
})();