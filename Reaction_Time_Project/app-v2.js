const LEVELS = [
  { id: 1, name: 'Level 1: Warmup', target: 350, minDelay: 1500, maxDelay: 3200, fakeChance: 0, hint: 'Wait for emerald green, then click or tap SPACE as fast as possible.' },
  { id: 2, name: 'Level 2: Quick Reflex', target: 290, minDelay: 1400, maxDelay: 3800, fakeChance: 0, hint: 'Faster threshold! Beat 290 ms to unlock Level 3.' },
  { id: 3, name: 'Level 3: Decoy Trap', target: 270, minDelay: 1500, maxDelay: 3800, fakeChance: 0.45, hint: 'Hold steady on AMBER fake signals — only strike on GREEN!' },
  { id: 4, name: 'Level 4: Pro Reflex', target: 235, minDelay: 1200, maxDelay: 4200, fakeChance: 0.5, hint: 'Tight reflex target with unpredictable fakeouts.' },
  { id: 5, name: 'Level 5: Apex Speed', target: 200, minDelay: 1000, maxDelay: 4500, fakeChance: 0.5, hint: 'Sub-200 ms mastery required to conquer the arena!' }
];

const BENCHMARKS = [
  { name: 'F1 Driver', ms: 185 },
  { name: 'Pro Gamer', ms: 220 },
  { name: 'Average Human', ms: 275 },
  { name: 'Slow Reflex', ms: 380 }
];

let mode = 'campaign'; // campaign | average | blitz
let phase = 'IDLE'; // IDLE | WAIT | FAKE | GO | DONE
let currentLevel = 1;
let unlockedLevel = 1;
let startTime = 0;
let waitTimer = null;
let sfxEnabled = true;

// 5-Try mode state
let avgAttempts = [];

// 30s Blitz state
let blitzActive = false;
let blitzHits = 0;
let blitzRemaining = 30.0;
let blitzInterval = null;

let stats = JSON.parse(localStorage.getItem('rsa_pro_stats')) || {
  best: null,
  blitzHigh: 0,
  unlockedLevel: 1,
  streak: 0,
  validHits: 0,
  totalAttempts: 0,
  recentMs: [],
  runs: []
};

currentLevel = stats.unlockedLevel || 1;
unlockedLevel = stats.unlockedLevel || 1;

let submission = JSON.parse(localStorage.getItem('rsa_pro_submission')) || {
  name: 'Jordan Vance',
  title: 'Reaction Speed Arena',
  desc: 'A multi-mode reflex & timing web application featuring 5 escalating levels, amber decoy traps, 5-try average & 30s blitz modes, real-time consistency charts, and benchmark comparisons.',
  option: 'Option 1: Interactive Reaction Speed Game',
  credits: 'Original project created for this online class using semantic HTML5, modern CSS3, and vanilla JavaScript.'
};

// DOM elements
const reactionStage = document.getElementById('reactionStage');
const flashOverlay = document.getElementById('flashOverlay');
const stageEmoji = document.getElementById('stageEmoji');
const stageHeading = document.getElementById('stageHeading');
const scoreReadout = document.getElementById('scoreReadout');
const ratingPill = document.getElementById('ratingPill');
const stageCaption = document.getElementById('stageCaption');
const signalReadout = document.getElementById('signalReadout');

const fxCanvas = document.getElementById('fxCanvas');
const fxCtx = fxCanvas.getContext('2d');
const trendCanvas = document.getElementById('trendCanvas');
const trendCtx = trendCanvas.getContext('2d');

const submissionModal = document.getElementById('submissionModal');
const keysModal = document.getElementById('keysModal');

// Particle burst system
let particles = [];

function resizeFxCanvas() {
  fxCanvas.width = reactionStage.clientWidth;
  fxCanvas.height = reactionStage.clientHeight;
}
window.addEventListener('resize', resizeFxCanvas);
resizeFxCanvas();

function spawnBurst(x, y, color, count = 22) {
  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.4;
    const speed = 2.2 + Math.random() * 5.5;
    particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      radius: 2.5 + Math.random() * 3.5,
      alpha: 1,
      color
    });
  }
}

function animateParticles() {
  fxCtx.clearRect(0, 0, fxCanvas.width, fxCanvas.height);
  particles = particles.filter(p => p.alpha > 0.02);
  for (const p of particles) {
    p.x += p.vx;
    p.y += p.vy;
    p.vx *= 0.96;
    p.vy *= 0.96;
    p.alpha *= 0.93;

    fxCtx.save();
    fxCtx.globalAlpha = p.alpha;
    fxCtx.fillStyle = p.color;
    fxCtx.beginPath();
    fxCtx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
    fxCtx.fill();
    fxCtx.restore();
  }
  requestAnimationFrame(animateParticles);
}
animateParticles();

// Web Audio synthesizer
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function tone(freq, duration = 0.1, type = 'sine', vol = 0.12) {
  if (!sfxEnabled) return;
  if (audioCtx.state === 'suspended') audioCtx.resume();
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(vol, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.start();
  osc.stop(audioCtx.currentTime + duration);
}

function triggerFlash() {
  flashOverlay.classList.add('flash');
  setTimeout(() => flashOverlay.classList.remove('flash'), 140);
}

function saveStats() {
  localStorage.setItem('rsa_pro_stats', JSON.stringify(stats));
}

function getRank(bestMs) {
  if (!bestMs) return 'RANK: ROOKIE';
  if (bestMs <= 185) return 'RANK: APEX LEGEND';
  if (bestMs <= 215) return 'RANK: PRO REFLEX';
  if (bestMs <= 265) return 'RANK: SHARP';
  return 'RANK: CONTENDER';
}

function getRatingLabel(ms) {
  if (ms <= 175) return '⚡ GODLIKE';
  if (ms <= 210) return '🔥 BLAZING';
  if (ms <= 260) return '✨ FAST';
  if (ms <= 340) return '👍 SOLID';
  return '🐢 WARMING UP';
}

function renderLevelStrip() {
  const strip = document.getElementById('levelStrip');
  strip.style.display = mode === 'campaign' ? 'grid' : 'none';
  strip.innerHTML = LEVELS.map(lvl => {
    const unlocked = lvl.id <= unlockedLevel;
    const active = lvl.id === currentLevel;
    return `
      <button class="lvl-pill ${unlocked ? 'unlocked' : ''} ${active ? 'active' : ''}"
              ${unlocked ? '' : 'disabled'}
              onclick="jumpToLevel(${lvl.id})">
        LVL ${lvl.id}
      </button>
    `;
  }).join('');
}

function jumpToLevel(id) {
  if (id > unlockedLevel) return;
  clearTimeout(waitTimer);
  currentLevel = id;
  renderLevelStrip();
  resetStage();
}

function updateHUD() {
  document.getElementById('badgeStreak').textContent = `🔥 ${stats.streak} STREAK`;
  document.getElementById('badgeRank').textContent = getRank(stats.best);

  const blitzBox = document.getElementById('blitzTimerBox');

  if (mode === 'campaign') {
    blitzBox.classList.add('hidden');
    const cfg = LEVELS[currentLevel - 1];
    document.getElementById('badgeMode').textContent = `LEVEL ${cfg.id} / ${LEVELS.length}`;
    document.getElementById('hudTitle').textContent = cfg.name;
    document.getElementById('hudSubtitle').textContent = cfg.hint;
    document.getElementById('targetLabel').textContent = 'TARGET';
    document.getElementById('targetValue').textContent = `< ${cfg.target} ms`;
  } else if (mode === 'average') {
    blitzBox.classList.add('hidden');
    document.getElementById('badgeMode').textContent = `TRY ${Math.min(avgAttempts.length + 1, 5)} / 5`;
    document.getElementById('hudTitle').textContent = '5-Try Average Lab';
    document.getElementById('hudSubtitle').textContent = 'Record 5 clean green-light reactions to compute your average.';
    document.getElementById('targetLabel').textContent = 'AVG SCORE';
    const avg = avgAttempts.length
      ? `${Math.round(avgAttempts.reduce((a, b) => a + b, 0) / avgAttempts.length)} ms`
      : '-- ms';
    document.getElementById('targetValue').textContent = avg;
  } else {
    blitzBox.classList.remove('hidden');
    document.getElementById('badgeMode').textContent = '30s BLITZ';
    document.getElementById('hudTitle').textContent = '30-Second Reflex Blitz';
    document.getElementById('hudSubtitle').textContent = 'Score as many clean green hits as possible before the 30s clock runs out!';
    document.getElementById('targetLabel').textContent = 'BLITZ HITS';
    document.getElementById('targetValue').textContent = `${blitzHits}`;
    document.getElementById('blitzClock').textContent = `${blitzRemaining.toFixed(1)}s`;
  }
}

function resetStage() {
  clearTimeout(waitTimer);
  phase = 'IDLE';
  reactionStage.className = 'reaction-stage';
  scoreReadout.classList.add('hidden');
  ratingPill.classList.add('hidden');
  stageEmoji.textContent = '🎯';

  if (mode === 'campaign') {
    stageHeading.textContent = `Start Level ${currentLevel}`;
    stageCaption.textContent = 'Click or press SPACE to arm the signal.';
  } else if (mode === 'average') {
    stageHeading.textContent = avgAttempts.length >= 5 ? 'Start New 5-Try Set' : `Try ${avgAttempts.length + 1} of 5`;
    stageCaption.textContent = 'Click or press SPACE to begin waiting.';
  } else {
    stageHeading.textContent = 'Start 30s Blitz';
    stageCaption.textContent = 'Click or press SPACE to start the timer and first signal.';
  }

  signalReadout.textContent = 'STATUS: STANDBY';
  updateHUD();
}

function startBlitzClockIfNeeded() {
  if (mode !== 'blitz' || blitzActive) return;
  blitzActive = true;
  blitzHits = 0;
  blitzRemaining = 30.0;
  const startedAt = performance.now();

  blitzInterval = setInterval(() => {
    const elapsed = (performance.now() - startedAt) / 1000;
    blitzRemaining = Math.max(0, 30 - elapsed);
    document.getElementById('blitzClock').textContent = `${blitzRemaining.toFixed(1)}s`;

    if (blitzRemaining <= 0) {
      endBlitz();
    }
  }, 100);
}

function endBlitz() {
  clearInterval(blitzInterval);
  clearTimeout(waitTimer);
  blitzActive = false;
  phase = 'DONE';
  reactionStage.className = 'reaction-stage';
  scoreReadout.classList.remove('hidden');
  scoreReadout.textContent = `${blitzHits} HITS`;
  ratingPill.classList.remove('hidden');
  ratingPill.textContent = blitzHits >= stats.blitzHigh ? '🏆 NEW BLITZ RECORD' : 'BLITZ COMPLETE';

  if (blitzHits > stats.blitzHigh) {
    stats.blitzHigh = blitzHits;
  }
  addRun(`Blitz: ${blitzHits} hits`, blitzHits > 0);
  saveStats();

  stageEmoji.textContent = '⏱️';
  stageHeading.textContent = 'Time’s Up!';
  stageCaption.textContent = 'Click or press SPACE to play another 30s Blitz.';
  signalReadout.textContent = 'STATUS: BLITZ FINISHED';
  updateHUD();
  updateSidebar();
}

function beginWait() {
  clearTimeout(waitTimer);
  phase = 'WAIT';
  reactionStage.className = 'reaction-stage wait';
  scoreReadout.classList.add('hidden');
  ratingPill.classList.add('hidden');
  stageEmoji.textContent = '⏳';
  stageHeading.textContent = 'Wait for Green...';
  stageCaption.textContent = 'Stay calm — do not trigger early.';
  signalReadout.textContent = 'STATUS: ARMED (WAIT)';
  tone(310, 0.08);

  let cfg;
  if (mode === 'campaign') {
    cfg = LEVELS[currentLevel - 1];
  } else if (mode === 'blitz') {
    cfg = { minDelay: 700, maxDelay: 1900, fakeChance: 0.25 };
  } else {
    cfg = { minDelay: 1400, maxDelay: 3800, fakeChance: 0.2 };
  }

  const delay = Math.floor(Math.random() * (cfg.maxDelay - cfg.minDelay)) + cfg.minDelay;
  const triggerFake = Math.random() < cfg.fakeChance;

  waitTimer = setTimeout(() => {
    if (triggerFake) enterFake();
    else enterGo();
  }, delay);
}

function enterFake() {
  if (mode === 'blitz' && !blitzActive) return;
  phase = 'FAKE';
  reactionStage.className = 'reaction-stage fake';
  stageEmoji.textContent = '⚠️';
  stageHeading.textContent = 'DECOY AMBER! HOLD!';
  stageCaption.textContent = 'Do NOT click amber! Wait for green...';
  signalReadout.textContent = 'STATUS: DECOY SIGNAL';
  tone(190, 0.14, 'sawtooth', 0.11);

  waitTimer = setTimeout(() => {
    if (phase !== 'FAKE') return;
    phase = 'WAIT';
    reactionStage.className = 'reaction-stage wait';
    stageEmoji.textContent = '⏳';
    stageHeading.textContent = 'Wait for Green...';
    stageCaption.textContent = 'Good discipline! Green coming up...';
    signalReadout.textContent = 'STATUS: ARMED (WAIT)';
    const extra = Math.floor(Math.random() * 1400) + 800;
    waitTimer = setTimeout(enterGo, extra);
  }, 1050);
}

function enterGo() {
  if (mode === 'blitz' && !blitzActive) return;
  phase = 'GO';
  reactionStage.className = 'reaction-stage go';
  stageEmoji.textContent = '⚡';
  stageHeading.textContent = 'CLICK NOW!';
  stageCaption.textContent = '';
  signalReadout.textContent = 'STATUS: GO SIGNAL ACTIVE';
  startTime = performance.now();
  triggerFlash();
  tone(880, 0.11, 'triangle', 0.14);
}

function handleAction(coords = null) {
  const cx = coords ? coords.x : reactionStage.clientWidth / 2;
  const cy = coords ? coords.y : reactionStage.clientHeight / 2;

  if (phase === 'IDLE' || phase === 'DONE') {
    if (mode === 'average' && avgAttempts.length >= 5) {
      avgAttempts = [];
    }
    if (mode === 'blitz') {
      startBlitzClockIfNeeded();
    }
    spawnBurst(cx, cy, '#22d3ee', 14);
    beginWait();
    return;
  }

  if (phase === 'WAIT' || phase === 'FAKE') {
    clearTimeout(waitTimer);
    const hitFake = phase === 'FAKE';
    stats.streak = 0;
    stats.totalAttempts++;
    spawnBurst(cx, cy, hitFake ? '#f59e0b' : '#a855f7', 22);
    tone(150, 0.22, 'sawtooth', 0.13);

    if (mode === 'blitz' && blitzActive) {
      phase = 'WAIT';
      addRun(hitFake ? 'Blitz Decoy' : 'Blitz Early', false);
      saveStats();
      updateHUD();
      updateSidebar();
      setTimeout(() => {
        if (blitzActive) beginWait();
      }, 450);
      return;
    }

    phase = 'DONE';
    reactionStage.className = 'reaction-stage early';
    scoreReadout.classList.add('hidden');
    ratingPill.classList.add('hidden');
    stageEmoji.textContent = hitFake ? '💥' : '🚫';
    stageHeading.textContent = hitFake ? 'Triggered Decoy Trap!' : 'Too Early!';
    stageCaption.textContent = 'Click or press SPACE to try again.';
    signalReadout.textContent = hitFake ? 'STATUS: PENALTY (DECOY)' : 'STATUS: PENALTY (EARLY)';
    addRun(hitFake ? 'Decoy Hit' : 'False Start', false);
    saveStats();
    updateHUD();
    updateSidebar();
    return;
  }

  if (phase === 'GO') {
    const ms = Math.max(1, Math.round(performance.now() - startTime));
    spawnBurst(cx, cy, '#10b981', 28);
    recordReaction(ms);
  }
}

function recordReaction(ms) {
  stats.validHits++;
  stats.totalAttempts++;
  stats.recentMs.push(ms);
  if (stats.recentMs.length > 12) stats.recentMs.shift();

  if (stats.best === null || ms < stats.best) {
    stats.best = ms;
  }

  if (mode === 'blitz' && blitzActive) {
    blitzHits++;
    if (blitzHits > stats.blitzHigh) stats.blitzHigh = blitzHits;
    stats.streak++;
    tone(780, 0.09, 'sine', 0.12);
    addRun(`${ms} ms (Blitz)`, true);
    saveStats();
    updateHUD();
    updateSidebar();
    drawTrendChart();
    beginWait();
    return;
  }

  phase = 'DONE';
  reactionStage.className = 'reaction-stage';
  scoreReadout.classList.remove('hidden');
  scoreReadout.textContent = `${ms} ms`;
  ratingPill.classList.remove('hidden');
  ratingPill.textContent = getRatingLabel(ms);

  if (mode === 'campaign') {
    const cfg = LEVELS[currentLevel - 1];
    const passed = ms <= cfg.target;

    if (passed) {
      stats.streak++;
      tone(760, 0.14, 'sine', 0.13);
      addRun(`${ms} ms (Lvl ${cfg.id})`, true);

      if (currentLevel < LEVELS.length) {
        stageEmoji.textContent = '✅';
        stageHeading.textContent = 'Level Cleared!';
        currentLevel++;
        if (currentLevel > unlockedLevel) {
          unlockedLevel = currentLevel;
          stats.unlockedLevel = unlockedLevel;
        }
        renderLevelStrip();
        stageCaption.textContent = `Beat < ${cfg.target} ms! Click or press SPACE for Level ${currentLevel}.`;
      } else {
        stageEmoji.textContent = '🏆';
        stageHeading.textContent = 'Arena Champion!';
        stageCaption.textContent = `You cleared Level 5 (< ${cfg.target} ms)! Click to run again.`;
      }
    } else {
      stats.streak = 0;
      tone(235, 0.18, 'triangle', 0.12);
      addRun(`${ms} ms (Lvl ${cfg.id})`, false);
      stageEmoji.textContent = '⏱️';
      stageHeading.textContent = 'Target Missed';
      stageCaption.textContent = `Needed < ${cfg.target} ms. Click or press SPACE to retry Level ${cfg.id}.`;
    }
  } else {
    avgAttempts.push(ms);
    stats.streak++;
    tone(720, 0.12, 'sine', 0.12);
    addRun(`${ms} ms (${avgAttempts.length}/5)`, true);

    if (avgAttempts.length < 5) {
      stageEmoji.textContent = '⚡';
      stageHeading.textContent = `Try ${avgAttempts.length} of 5 Recorded`;
      stageCaption.textContent = 'Click or press SPACE for the next attempt.';
    } else {
      const avg = Math.round(avgAttempts.reduce((a, b) => a + b, 0) / 5);
      scoreReadout.textContent = `${avg} ms AVG`;
      ratingPill.textContent = getRatingLabel(avg);
      stageEmoji.textContent = '📊';
      stageHeading.textContent = '5-Try Average Complete!';
      stageCaption.textContent = `Splits: ${avgAttempts.join('ms, ')}ms. Click to start a new set.`;
    }
  }

  signalReadout.textContent = `STATUS: LOGGED (${ms} ms)`;
  saveStats();
  updateHUD();
  updateSidebar();
  drawTrendChart();
}

function addRun(label, passed) {
  stats.runs.unshift({ label, passed });
  if (stats.runs.length > 20) stats.runs.pop();
}

function updateSidebar() {
  document.getElementById('kpiBest').textContent = stats.best ? `${stats.best} ms` : '-- ms';
  document.getElementById('kpiBlitz').textContent = `${stats.blitzHigh} HITS`;
  document.getElementById('historyCount').textContent = `${stats.runs.length} RUNS`;

  const acc = stats.totalAttempts > 0
    ? `${Math.round((stats.validHits / stats.totalAttempts) * 100)}%`
    : '--%';
  document.getElementById('kpiAccuracy').textContent = acc;

  document.getElementById('kpiAvg').textContent = stats.recentMs.length
    ? `${Math.round(stats.recentMs.reduce((a, b) => a + b, 0) / stats.recentMs.length)} ms`
    : '-- ms';

  const entries = [...BENCHMARKS];
  if (stats.best) entries.push({ name: 'You (Best)', ms: stats.best, isPlayer: true });
  entries.sort((a, b) => a.ms - b.ms);

  document.getElementById('benchmarkList').innerHTML = entries.map(item => {
    const pct = Math.min(100, Math.max(12, Math.round((item.ms / 420) * 100)));
    return `
      <div class="bench-item ${item.isPlayer ? 'is-player' : ''}">
        <div class="bench-row">
          <span>${item.name}</span>
          <span>${item.ms} ms</span>
        </div>
        <div class="bench-bar">
          <div class="bench-fill" style="width: ${pct}%"></div>
        </div>
      </div>
    `;
  }).join('');

  const list = document.getElementById('historyList');
  if (!stats.runs.length) {
    list.innerHTML = `<li class="history-empty">No runs recorded yet.</li>`;
  } else {
    list.innerHTML = stats.runs.map(r => `
      <li>
        <span>${r.label}</span>
        <span class="${r.passed ? 'res-pass' : 'res-fail'}">${r.passed ? 'PASS' : 'MISS'}</span>
      </li>
    `).join('');
  }
}

function drawTrendChart() {
  const dpr = window.devicePixelRatio || 1;
  const rect = trendCanvas.getBoundingClientRect();
  trendCanvas.width = Math.max(300, rect.width) * dpr;
  trendCanvas.height = 105 * dpr;
  trendCtx.setTransform(dpr, 0, 0, dpr, 0, 0);

  const w = Math.max(300, rect.width);
  const h = 105;
  trendCtx.clearRect(0, 0, w, h);

  const pts = stats.recentMs;
  if (!pts.length) {
    trendCtx.fillStyle = '#64748b';
    trendCtx.font = '12px Inter, sans-serif';
    trendCtx.fillText('Complete a reaction test to plot your consistency curve.', 16, h / 2 + 4);
    document.getElementById('consistencyScore').textContent = 'CONSISTENCY: --';
    return;
  }

  const mean = pts.reduce((a, b) => a + b, 0) / pts.length;
  const variance = pts.reduce((acc, v) => acc + Math.pow(v - mean, 2), 0) / pts.length;
  const stdDev = Math.round(Math.sqrt(variance));
  const cLabel = stdDev < 25 ? 'LASER' : stdDev < 55 ? 'STEADY' : 'VARIABLE';
  document.getElementById('consistencyScore').textContent = `CONSISTENCY: ${cLabel} (±${stdDev}ms)`;

  const minVal = Math.max(100, Math.min(...pts) - 25);
  const maxVal = Math.max(...pts) + 25;
  const padX = 18;
  const padY = 16;

  const coords = pts.map((val, idx) => {
    const x = pts.length === 1
      ? w / 2
      : padX + (idx / (pts.length - 1)) * (w - padX * 2);
    const ratio = (val - minVal) / Math.max(1, maxVal - minVal);
    const y = padY + ratio * (h - padY * 2);
    return { x, y, val };
  });

  // Area gradient
  const grad = trendCtx.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0, 'rgba(34, 211, 238, 0.32)');
  grad.addColorStop(1, 'rgba(34, 211, 238, 0.0)');

  trendCtx.beginPath();
  trendCtx.moveTo(coords[0].x, h);
  coords.forEach(c => trendCtx.lineTo(c.x, c.y));
  trendCtx.lineTo(coords[coords.length - 1].x, h);
  trendCtx.closePath();
  trendCtx.fillStyle = grad;
  trendCtx.fill();

  // Line
  trendCtx.beginPath();
  coords.forEach((c, i) => {
    if (i === 0) trendCtx.moveTo(c.x, c.y);
    else trendCtx.lineTo(c.x, c.y);
  });
  trendCtx.strokeStyle = '#22d3ee';
  trendCtx.lineWidth = 2.4;
  trendCtx.stroke();

  // Dots
  coords.forEach(c => {
    trendCtx.beginPath();
    trendCtx.arc(c.x, c.y, 3.8, 0, Math.PI * 2);
    trendCtx.fillStyle = '#f8fafc';
    trendCtx.fill();
    trendCtx.strokeStyle = '#22d3ee';
    trendCtx.lineWidth = 2;
    trendCtx.stroke();
  });
}

/* Submission Section & Modal */
function renderSubmission() {
  document.getElementById('dispName').textContent = submission.name;
  document.getElementById('dispTitle').textContent = submission.title;
  document.getElementById('dispDesc').textContent = submission.desc;
  document.getElementById('dispOption').textContent = submission.option;
  document.getElementById('dispCredits').textContent = submission.credits;
}

function openSubModal() {
  document.getElementById('inName').value = submission.name;
  document.getElementById('inTitle').value = submission.title;
  document.getElementById('inDesc').value = submission.desc;
  document.getElementById('inOption').value = submission.option;
  document.getElementById('inCredits').value = submission.credits;
  submissionModal.classList.remove('hidden');
}

function closeSubModal() {
  submissionModal.classList.add('hidden');
}

document.getElementById('btnEditSubmission').addEventListener('click', openSubModal);
document.getElementById('btnCloseModal').addEventListener('click', closeSubModal);
document.getElementById('btnCancelModal').addEventListener('click', closeSubModal);

document.getElementById('submissionForm').addEventListener('submit', (e) => {
  e.preventDefault();
  submission = {
    name: document.getElementById('inName').value.trim(),
    title: document.getElementById('inTitle').value.trim(),
    desc: document.getElementById('inDesc').value.trim(),
    option: document.getElementById('inOption').value.trim(),
    credits: document.getElementById('inCredits').value.trim()
  };
  localStorage.setItem('rsa_pro_submission', JSON.stringify(submission));
  renderSubmission();
  closeSubModal();
});

document.getElementById('btnCopySummary').addEventListener('click', () => {
  const summary = [
    `Student Name: ${submission.name}`,
    `Project Title: ${submission.title}`,
    `Description: ${submission.desc}`,
    `Chosen Option: ${submission.option}`,
    `Credits / Originality: ${submission.credits}`
  ].join('\n');

  navigator.clipboard?.writeText(summary);
  const toast = document.getElementById('copyToast');
  toast.classList.remove('hidden');
  setTimeout(() => toast.classList.add('hidden'), 2600);
});

/* Keys Modal */
document.getElementById('btnKeyboardGuide').addEventListener('click', () => {
  keysModal.classList.remove('hidden');
});
document.getElementById('btnCloseKeys').addEventListener('click', () => {
  keysModal.classList.add('hidden');
});

/* Contact Form */
document.getElementById('contactForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const name = document.getElementById('cName').value.trim();
  const topic = document.getElementById('cTopic').value;
  document.getElementById('contactStatus').textContent = `Message received (${topic}) from ${name}!`;
  document.getElementById('contactBadge').textContent = 'SENT';
  e.target.reset();
});

/* Mode & Controls */
function setMode(newMode) {
  clearTimeout(waitTimer);
  clearInterval(blitzInterval);
  blitzActive = false;
  mode = newMode;
  avgAttempts = [];

  document.querySelectorAll('.mode-tab').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.mode === newMode);
  });

  renderLevelStrip();
  resetStage();
}

document.getElementById('tabCampaign').addEventListener('click', () => setMode('campaign'));
document.getElementById('tabAverage').addEventListener('click', () => setMode('average'));
document.getElementById('tabBlitz').addEventListener('click', () => setMode('blitz'));

function toggleSound() {
  sfxEnabled = !sfxEnabled;
  document.getElementById('btnSound').textContent = sfxEnabled ? '🔊 SFX' : '🔇 Muted';
}
document.getElementById('btnSound').addEventListener('click', toggleSound);

document.getElementById('btnResetStats').addEventListener('click', () => {
  clearTimeout(waitTimer);
  clearInterval(blitzInterval);
  blitzActive = false;
  stats = {
    best: null,
    blitzHigh: 0,
    unlockedLevel: 1,
    streak: 0,
    validHits: 0,
    totalAttempts: 0,
    recentMs: [],
    runs: []
  };
  currentLevel = 1;
  unlockedLevel = 1;
  avgAttempts = [];
  saveStats();
  renderLevelStrip();
  resetStage();
  updateSidebar();
  drawTrendChart();
});

reactionStage.addEventListener('pointerdown', (e) => {
  e.preventDefault();
  const rect = reactionStage.getBoundingClientRect();
  handleAction({ x: e.clientX - rect.left, y: e.clientY - rect.top });
});

window.addEventListener('keydown', (e) => {
  const modalOpen = !submissionModal.classList.contains('hidden') || !keysModal.classList.contains('hidden');
  const typing = ['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName);
  if (modalOpen || typing) return;

  if (e.code === 'Space') {
    e.preventDefault();
    if (!e.repeat) handleAction();
  } else if (e.key.toLowerCase() === 's') {
    toggleSound();
  } else if (e.key.toLowerCase() === 'm') {
    const order = ['campaign', 'average', 'blitz'];
    setMode(order[(order.indexOf(mode) + 1) % order.length]);
  } else if (['1', '2', '3', '4', '5'].includes(e.key) && mode === 'campaign') {
    jumpToLevel(Number(e.key));
  }
});

// Init
renderLevelStrip();
resetStage();
updateSidebar();
renderSubmission();
drawTrendChart();