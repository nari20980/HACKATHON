'use strict';

(function () {
  const BEST_KEY_PREFIX = 'arcade_draw_match_best_v1_';

  const PALETTE = [
    { hex: '#f59e0b', name: 'Golden Amber' },
    { hex: '#d97706', name: 'Lion Mane' },
    { hex: '#ef4444', name: 'Crimson Red' },
    { hex: '#22d3ee', name: 'Neon Cyan' },
    { hex: '#3b82f6', name: 'Ocean Blue' },
    { hex: '#a855f7', name: 'Royal Violet' },
    { hex: '#10b981', name: 'Emerald Green' },
    { hex: '#f8fafc', name: 'Pure White' },
    { hex: '#0f172a', name: 'Midnight Ink' }
  ];

  const SUBJECT_TITLES = {
    penguin: 'TOP TARGET: PENGUIN',
    lion: 'TOP TARGET: LION',
    rocket: 'TOP TARGET: ROCKET',
    sunset: 'TOP TARGET: SUN & WAVES'
  };

  let currentSubject = 'penguin';
  let currentColor = PALETTE[0].hex;
  let brushSize = 14;
  let eraserOn = false;
  let guideOn = true;
  let isDrawing = false;
  let lastPt = null;
  let bestScores = loadBestScores();

  const dom = {
    refCanvas: document.getElementById('refCanvas'),
    drawCanvas: document.getElementById('drawCanvas'),
    targetLabel: document.getElementById('targetLabel'),
    compatPercent: document.getElementById('compatPercent'),
    compatBarFill: document.getElementById('compatBarFill'),
    bestScoreLabel: document.getElementById('bestScoreLabel'),
    btnToggleGuide: document.getElementById('btnToggleGuide'),
    btnEraser: document.getElementById('btnEraser'),
    swatches: document.getElementById('swatches'),
    btnClearDraw: document.getElementById('btnClearDraw'),
    btnCheckMatch: document.getElementById('btnCheckMatch'),
    statusMsg: document.getElementById('statusMsg')
  };

  const refCtx = dom.refCanvas?.getContext('2d');
  const drawCtx = dom.drawCanvas?.getContext('2d');

  const cleanCanvas = document.createElement('canvas');
  cleanCanvas.width = 320;
  cleanCanvas.height = 230;
  const cleanCtx = cleanCanvas.getContext('2d');

  function loadBestScores() {
    try {
      const parsed = JSON.parse(localStorage.getItem(`${BEST_KEY_PREFIX}all`) || '{}');
      return parsed && typeof parsed === 'object' ? parsed : {};
    } catch {
      return {};
    }
  }

  function saveBestScore(subject, pct) {
    bestScores[subject] = Math.max(Number(bestScores[subject]) || 0, Math.round(pct));
    try {
      localStorage.setItem(`${BEST_KEY_PREFIX}all`, JSON.stringify(bestScores));
    } catch {
      // Ignore storage errors
    }
  }

  function drawSubjectArtwork(ctx, w, h, subject, dashedOnly = false) {
    ctx.save();
    const cx = w / 2;
    const cy = h / 2;

    if (dashedOnly) {
      ctx.setLineDash([5, 5]);
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.42)';
      ctx.lineWidth = 2;
    }

    if (subject === 'penguin') {
      if (!dashedOnly) {
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.ellipse(cx - 28, h - 24, 18, 8, -0.1, 0, Math.PI * 2);
        ctx.ellipse(cx + 28, h - 24, 18, 8, 0.1, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.beginPath();
      ctx.ellipse(cx, h * 0.55, 52, 68, 0, 0, Math.PI * 2);
      if (dashedOnly) {
        ctx.stroke();
      } else {
        ctx.fillStyle = '#0f172a';
        ctx.fill();
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      if (!dashedOnly) {
        ctx.fillStyle = '#f8fafc';
        ctx.beginPath();
        ctx.ellipse(cx, h * 0.61, 33, 45, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.moveTo(cx - 9, h * 0.41);
        ctx.lineTo(cx + 9, h * 0.41);
        ctx.lineTo(cx, h * 0.5);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.arc(cx - 16, h * 0.34, 3.5, 0, Math.PI * 2);
        ctx.arc(cx + 16, h * 0.34, 3.5, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (subject === 'lion') {
      ctx.beginPath();
      ctx.arc(cx, cy, 68, 0, Math.PI * 2);
      if (dashedOnly) {
        ctx.stroke();
      } else {
        ctx.fillStyle = '#d97706';
        ctx.fill();
      }

      ctx.beginPath();
      ctx.arc(cx, cy + 4, 44, 0, Math.PI * 2);
      if (dashedOnly) {
        ctx.stroke();
      } else {
        ctx.fillStyle = '#f59e0b';
        ctx.fill();

        ctx.beginPath();
        ctx.arc(cx - 34, cy - 30, 12, 0, Math.PI * 2);
        ctx.arc(cx + 34, cy - 30, 12, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.arc(cx - 15, cy - 4, 4.5, 0, Math.PI * 2);
        ctx.arc(cx + 15, cy - 4, 4.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.moveTo(cx - 8, cy + 8);
        ctx.lineTo(cx + 8, cy + 8);
        ctx.lineTo(cx, cy + 18);
        ctx.closePath();
        ctx.fill();
      }
    } else if (subject === 'rocket') {
      if (!dashedOnly) {
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.moveTo(cx - 16, cy + 54);
        ctx.lineTo(cx + 16, cy + 54);
        ctx.lineTo(cx, cy + 88);
        ctx.closePath();
        ctx.fill();
      }

      if (!dashedOnly) {
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.moveTo(cx - 26, cy + 20);
        ctx.lineTo(cx - 52, cy + 54);
        ctx.lineTo(cx - 26, cy + 54);
        ctx.closePath();
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(cx + 26, cy + 20);
        ctx.lineTo(cx + 52, cy + 54);
        ctx.lineTo(cx + 26, cy + 54);
        ctx.closePath();
        ctx.fill();
      }

      ctx.beginPath();
      ctx.ellipse(cx, cy + 6, 26, 52, 0, 0, Math.PI * 2);
      if (dashedOnly) {
        ctx.stroke();
      } else {
        ctx.fillStyle = '#f8fafc';
        ctx.fill();

        ctx.fillStyle = '#22d3ee';
        ctx.beginPath();
        ctx.arc(cx, cy, 11, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (subject === 'sunset') {
      ctx.beginPath();
      ctx.arc(cx, cy - 16, 42, 0, Math.PI * 2);
      if (dashedOnly) {
        ctx.stroke();
      } else {
        ctx.fillStyle = '#f59e0b';
        ctx.fill();

        ctx.fillStyle = '#3b82f6';
        ctx.fillRect(0, cy + 26, w, h - (cy + 26));
        ctx.fillStyle = '#22d3ee';
        ctx.fillRect(0, cy + 48, w, h - (cy + 48));
      }
    }

    ctx.restore();
  }

  function renderReference() {
    if (!refCtx || !dom.refCanvas) return;
    refCtx.fillStyle = '#0b1224';
    refCtx.fillRect(0, 0, dom.refCanvas.width, dom.refCanvas.height);
    drawSubjectArtwork(refCtx, dom.refCanvas.width, dom.refCanvas.height, currentSubject, false);
    if (dom.targetLabel) {
      dom.targetLabel.textContent = SUBJECT_TITLES[currentSubject] || 'TOP TARGET';
    }
    if (dom.bestScoreLabel) {
      dom.bestScoreLabel.textContent = `BEST: ${Number(bestScores[currentSubject]) || 0}%`;
    }
  }

  function redrawPlayerCanvas() {
    if (!drawCtx || !dom.drawCanvas) return;
    drawCtx.clearRect(0, 0, dom.drawCanvas.width, dom.drawCanvas.height);
    drawCtx.drawImage(cleanCanvas, 0, 0);
    if (guideOn) {
      drawSubjectArtwork(drawCtx, dom.drawCanvas.width, dom.drawCanvas.height, currentSubject, true);
    }
  }

  function clearBoard() {
    if (!cleanCtx) return;
    cleanCtx.fillStyle = '#0b1224';
    cleanCtx.fillRect(0, 0, cleanCanvas.width, cleanCanvas.height);
    redrawPlayerCanvas();
    updateScoreUI(0);
  }

  function computeCompatibility() {
    if (!refCtx || !cleanCtx || !dom.refCanvas) return 0;
    const w = dom.refCanvas.width;
    const h = dom.refCanvas.height;
    const rData = refCtx.getImageData(0, 0, w, h).data;
    const dData = cleanCtx.getImageData(0, 0, w, h).data;

    let simSum = 0;
    let count = 0;
    const step = 6;
    const maxDist = Math.sqrt(255 * 255 * 3);

    for (let y = 0; y < h; y += step) {
      for (let x = 0; x < w; x += step) {
        const idx = (y * w + x) * 4;
        const dr = rData[idx] - dData[idx];
        const dg = rData[idx + 1] - dData[idx + 1];
        const db = rData[idx + 2] - dData[idx + 2];
        const dist = Math.sqrt(dr * dr + dg * dg + db * db);
        simSum += Math.max(0, 1 - dist / maxDist);
        count += 1;
      }
    }

    return count > 0 ? Math.round((simSum / count) * 100) : 0;
  }

  function updateScoreUI(pct) {
    if (dom.compatPercent) dom.compatPercent.textContent = `${pct}%`;
    if (dom.compatBarFill) dom.compatBarFill.style.width = `${pct}%`;
    if (dom.bestScoreLabel) {
      dom.bestScoreLabel.textContent = `BEST: ${Number(bestScores[currentSubject]) || 0}%`;
    }
  }

  function getPt(e) {
    const rect = dom.drawCanvas.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) * dom.drawCanvas.width) / Math.max(1, rect.width),
      y: ((e.clientY - rect.top) * dom.drawCanvas.height) / Math.max(1, rect.height)
    };
  }

  function strokeLine(a, b) {
    if (!cleanCtx) return;
    cleanCtx.save();
    cleanCtx.lineCap = 'round';
    cleanCtx.lineJoin = 'round';
    cleanCtx.lineWidth = brushSize;
    cleanCtx.strokeStyle = eraserOn ? '#0b1224' : currentColor;
    cleanCtx.beginPath();
    cleanCtx.moveTo(a.x, a.y);
    cleanCtx.lineTo(b.x, b.y);
    cleanCtx.stroke();
    cleanCtx.restore();
    redrawPlayerCanvas();
  }

  function renderSwatches() {
    if (!dom.swatches) return;
    dom.swatches.innerHTML = '';
    PALETTE.forEach((col) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `swatch-btn${!eraserOn && col.hex === currentColor ? ' active' : ''}`;
      btn.style.backgroundColor = col.hex;
      btn.title = col.name;
      btn.setAttribute('aria-label', col.name);
      btn.addEventListener('click', () => {
        eraserOn = false;
        currentColor = col.hex;
        if (dom.btnEraser) {
          dom.btnEraser.textContent = 'Eraser: OFF';
          dom.btnEraser.classList.remove('active');
        }
        renderSwatches();
      });
      dom.swatches.appendChild(btn);
    });
  }

  document.querySelectorAll('.subject-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const subj = btn.dataset.subject;
      if (!SUBJECT_TITLES[subj]) return;
      currentSubject = subj;
      document.querySelectorAll('.subject-btn').forEach((b) => b.classList.toggle('active', b === btn));
      renderReference();
      redrawPlayerCanvas();
      updateScoreUI(0);
    });
  });

  dom.drawCanvas?.addEventListener('pointerdown', (e) => {
    isDrawing = true;
    lastPt = getPt(e);
    strokeLine(lastPt, lastPt);
  });

  dom.drawCanvas?.addEventListener('pointermove', (e) => {
    if (!isDrawing || !lastPt) return;
    const nextPt = getPt(e);
    strokeLine(lastPt, nextPt);
    lastPt = nextPt;
  });

  window.addEventListener('pointerup', () => {
    isDrawing = false;
    lastPt = null;
  });

  dom.btnToggleGuide?.addEventListener('click', () => {
    guideOn = !guideOn;
    dom.btnToggleGuide.textContent = `Guide: ${guideOn ? 'ON' : 'OFF'}`;
    dom.btnToggleGuide.classList.toggle('active', guideOn);
    redrawPlayerCanvas();
  });

  dom.btnEraser?.addEventListener('click', () => {
    eraserOn = !eraserOn;
    dom.btnEraser.textContent = `Eraser: ${eraserOn ? 'ON' : 'OFF'}`;
    dom.btnEraser.classList.toggle('active', eraserOn);
    renderSwatches();
  });

  document.querySelectorAll('.brush-sizes .mini-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      brushSize = Number(btn.dataset.size) || 14;
      document.querySelectorAll('.brush-sizes .mini-btn').forEach((b) => b.classList.toggle('active', b === btn));
    });
  });

  dom.btnClearDraw?.addEventListener('click', () => {
    clearBoard();
    if (dom.statusMsg) dom.statusMsg.textContent = 'Canvas cleared. Draw your next version!';
  });

  dom.btnCheckMatch?.addEventListener('click', () => {
    const pct = computeCompatibility();
    saveBestScore(currentSubject, pct);
    updateScoreUI(pct);

    const api = window.ArcadeQuests;
    if (pct >= 75 && api && typeof api.loadData === 'function' && typeof api.saveData === 'function') {
      const xpGain = pct >= 90 ? 40 : 25;
      const coinGain = pct >= 90 ? 18 : 12;
      const state = api.loadData();
      state.xp = (Number(state.xp) || 0) + xpGain;
      state.coins = (Number(state.coins) || 0) + coinGain;
      api.saveData(state);
      if (dom.statusMsg) {
        dom.statusMsg.textContent = `${pct}% compatibility! Earned +${xpGain} XP and +${coinGain} Coins.`;
      }
    } else if (dom.statusMsg) {
      dom.statusMsg.textContent = `Compatibility: ${pct}%. Reach 75%+ to earn XP and Coins!`;
    }
  });

  renderSwatches();
  renderReference();
  clearBoard();
})();