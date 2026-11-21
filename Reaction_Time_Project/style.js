'use strict';

const STORAGE_KEY = 'arcade_switcher_v2';
const DURATIONS = [1, 2, 5, 10, 60];

const state = {
  activeGame: 'reaction', // 'reaction' | 'clicker'
  rx: {
    phase: 'IDLE', // 'IDLE' | 'WAITING' | 'GO' | 'DONE'
    startTime: 0,
    timer: null,
    best: null,
    last: null
  },
  clk: {
    duration: 5,
    status: 'IDLE', // 'IDLE' | 'RUNNING' | 'FINISHED'
    clicks: 0,
    remaining: 5.0,
    startedAt: 0,
    interval: null,
    bestClicksByDuration: { 1: 0, 2: 0, 5: 0, 10: 0, 60: 0 }
  }
};

function loadSaved() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (saved) {
      state.rx.best = typeof saved.rxBest === 'number' ? saved.rxBest : null;
      if (saved.bestClicksByDuration && typeof saved.bestClicksByDuration === 'object') {
        for (const sec of DURATIONS) {
          if (typeof saved.bestClicksByDuration[sec] === 'number') {
            state.clk.bestClicksByDuration[sec] = saved.bestClicksByDuration[sec];
          }
        }
      }
    }
  } catch {
    // Ignore storage access errors
  }
}

function saveScores() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      rxBest: state.rx.best,
      bestClicksByDuration: state.clk.bestClicksByDuration
    }));
  } catch {
    // Ignore storage access errors
  }
}

const dom = {
  btnGameReaction: document.getElementById('btnGameReaction'),
  btnGameClicker: document.getElementById('btnGameClicker'),
  btnResetAll: document.getElementById('btnResetAll'),
  reactionPanel: document.getElementById('reactionPanel'),
  clickerPanel: document.getElementById('clickerPanel'),
  rxPad: document.getElementById('rxPad'),
  rxEmoji: document.getElementById('rxEmoji'),
  rxHeading: document.getElementById('rxHeading'),
  rxCaption: document.getElementById('rxCaption'),
  rxBest: document.getElementById('rxBest'),
  rxLast: document.getElementById('rxLast'),
  clkTime: document.getElementById('clkTime'),
  clkCount: document.getElementById('clkCount'),
  clkCps: document.getElementById('clkCps'),
  clkBest: document.getElementById('clkBest'),
  clkPad: document.getElementById('clkPad'),
  clkEmoji: document.getElementById('clkEmoji'),
  clkHeading: document.getElementById('clkHeading'),
  clkCaption: document.getElementById('clkCaption'),
  durButtons: document.querySelectorAll('.dur-btn')
};

function clearTimers() {
  clearTimeout(state.rx.timer);
  clearInterval(state.clk.interval);
  state.rx.timer = null;
  state.clk.interval = null;
}

function switchGame(game) {
  clearTimers();
  state.activeGame = game;

  const isReaction = game === 'reaction';
  dom.btnGameReaction.classList.toggle('active', isReaction);
  dom.btnGameClicker.classList.toggle('active', !isReaction);
  dom.reactionPanel.classList.toggle('hidden', !isReaction);
  dom.clickerPanel.classList.toggle('hidden', isReaction);

  resetReaction();
  resetClicker();
}

// --- Reaction Test ---
function renderReactionStats() {
  dom.rxBest.textContent = state.rx.best !== null ? `${state.rx.best} ms` : '-- ms';
  dom.rxLast.textContent = state.rx.last !== null ? `${state.rx.last} ms` : '-- ms';
}

function resetReaction() {
  clearTimeout(state.rx.timer);
  state.rx.phase = 'IDLE';
  dom.rxPad.classList.remove('waiting', 'go', 'early');
  dom.rxEmoji.textContent = '🎯';
  dom.rxHeading.textContent = 'Click or Press SPACE to Start';
  dom.rxCaption.textContent = 'Wait for green, then click as fast as you can.';
  renderReactionStats();
}

function startReactionWait() {
  state.rx.phase = 'WAITING';
  dom.rxPad.classList.remove('go', 'early');
  dom.rxPad.classList.add('waiting');
  dom.rxEmoji.textContent = '⏳';
  dom.rxHeading.textContent = 'Wait for Green...';
  dom.rxCaption.textContent = 'Do not click early!';

  const delay = 1200 + Math.floor(Math.random() * 2400);
  state.rx.timer = setTimeout(() => {
    state.rx.phase = 'GO';
    dom.rxPad.classList.remove('waiting');
    dom.rxPad.classList.add('go');
    dom.rxEmoji.textContent = '⚡';
    dom.rxHeading.textContent = 'CLICK NOW!';
    dom.rxCaption.textContent = 'React now!';
    state.rx.startTime = performance.now();
  }, delay);
}

function handleReactionPress() {
  if (state.rx.phase === 'IDLE' || state.rx.phase === 'DONE') {
    startReactionWait();
    return;
  }

  if (state.rx.phase === 'WAITING') {
    clearTimeout(state.rx.timer);
    state.rx.phase = 'DONE';
    dom.rxPad.classList.remove('waiting');
    dom.rxPad.classList.add('early');
    dom.rxEmoji.textContent = '🚫';
    dom.rxHeading.textContent = 'Too Early!';
    dom.rxCaption.textContent = 'Click or press SPACE to try again.';
    return;
  }

  if (state.rx.phase === 'GO') {
    const ms = Math.max(1, Math.round(performance.now() - state.rx.startTime));
    state.rx.phase = 'DONE';
    state.rx.last = ms;
    if (state.rx.best === null || ms < state.rx.best) {
      state.rx.best = ms;
    }
    saveScores();
    renderReactionStats();

    dom.rxPad.classList.remove('go');
    dom.rxEmoji.textContent = '⚡';
    dom.rxHeading.textContent = `${ms} ms`;
    dom.rxCaption.textContent = 'Click or press SPACE to test again.';
  }
}

// --- Timed Clicker Test (1s, 2s, 5s, 10s, 60s) ---
function getBestForDuration(sec) {
  return state.clk.bestClicksByDuration[sec] || 0;
}

function renderClickerStats() {
  const elapsed = state.clk.status === 'RUNNING'
    ? Math.max(0.05, (performance.now() - state.clk.startedAt) / 1000)
    : state.clk.duration;

  const cps = state.clk.status === 'IDLE'
    ? 0
    : state.clk.clicks / (state.clk.status === 'RUNNING' ? elapsed : state.clk.duration);

  dom.clkTime.textContent = `${state.clk.remaining.toFixed(1)}s`;
  dom.clkCount.textContent = String(state.clk.clicks);
  dom.clkCps.textContent = cps.toFixed(2);
  dom.clkBest.textContent = String(getBestForDuration(state.clk.duration));
}

function resetClicker() {
  clearInterval(state.clk.interval);
  state.clk.status = 'IDLE';
  state.clk.clicks = 0;
  state.clk.remaining = state.clk.duration;
  dom.clkEmoji.textContent = '🖱️';
  dom.clkHeading.textContent = `CLICK TO COUNT (${state.clk.duration}s)`;
  dom.clkCaption.textContent = `Count how many clicks you get in ${state.clk.duration} second${state.clk.duration === 1 ? '' : 's'}.`;
  renderClickerStats();
}

function finishClicker() {
  clearInterval(state.clk.interval);
  state.clk.status = 'FINISHED';
  state.clk.remaining = 0;

  const currentBest = getBestForDuration(state.clk.duration);
  if (state.clk.clicks > currentBest) {
    state.clk.bestClicksByDuration[state.clk.duration] = state.clk.clicks;
    saveScores();
  }

  dom.clkEmoji.textContent = '🏆';
  dom.clkHeading.textContent = `${state.clk.clicks} CLICKS`;
  dom.clkCaption.textContent = `Finished ${state.clk.duration}s timer — click pad to run again.`;
  renderClickerStats();
}

function handleClickerPress() {
  if (state.clk.status === 'FINISHED') {
    resetClicker();
    return;
  }

  if (state.clk.status === 'IDLE') {
    state.clk.status = 'RUNNING';
    state.clk.clicks = 1;
    state.clk.remaining = state.clk.duration;
    state.clk.startedAt = performance.now();
    dom.clkEmoji.textContent = '🔥';
    dom.clkHeading.textContent = '1 CLICK';
    dom.clkCaption.textContent = `${state.clk.duration}s timer running — keep clicking!`;

    state.clk.interval = setInterval(() => {
      const elapsed = (performance.now() - state.clk.startedAt) / 1000;
      state.clk.remaining = Math.max(0, state.clk.duration - elapsed);
      renderClickerStats();
      if (state.clk.remaining <= 0) {
        finishClicker();
      }
    }, 50);

    renderClickerStats();
    return;
  }

  if (state.clk.status === 'RUNNING') {
    state.clk.clicks++;
    dom.clkHeading.textContent = `${state.clk.clicks} ${state.clk.clicks === 1 ? 'CLICK' : 'CLICKS'}`;
    renderClickerStats();
  }
}

// --- Events ---
dom.btnGameReaction.addEventListener('click', () => switchGame('reaction'));
dom.btnGameClicker.addEventListener('click', () => switchGame('clicker'));

dom.rxPad.addEventListener('pointerdown', (e) => {
  e.preventDefault();
  handleReactionPress();
});

dom.clkPad.addEventListener('pointerdown', (e) => {
  e.preventDefault();
  handleClickerPress();
});

dom.durButtons.forEach((btn) => {
  btn.addEventListener('click', () => {
    const secs = Number(btn.dataset.seconds);
    if (!DURATIONS.includes(secs)) return;
    state.clk.duration = secs;
    dom.durButtons.forEach((b) => b.classList.toggle('active', b === btn));
    resetClicker();
  });
});

dom.btnResetAll.addEventListener('click', () => {
  clearTimers();
  state.rx.best = null;
  state.rx.last = null;
  state.clk.bestClicksByDuration = { 1: 0, 2: 0, 5: 0, 10: 0, 60: 0 };
  saveScores();
  resetReaction();
  resetClicker();
});

window.addEventListener('keydown', (e) => {
  if (e.code === 'Space' && state.activeGame === 'reaction') {
    e.preventDefault();
    if (!e.repeat) handleReactionPress();
  }
});

loadSaved();
const urlGame = new URLSearchParams(window.location.search).get('game');
switchGame(urlGame === 'clicker' ? 'clicker' : 'reaction');