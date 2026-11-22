const COLORS = [
  '#000000', '#64748b', '#ffffff', '#ef4444', '#f97316', '#facc15',
  '#22c55e', '#06b6d4', '#3b82f6', '#a855f7', '#ec4899',
  '#475569', '#cbd5e1', '#991b1b', '#9a3412', '#a16207',
  '#15803d', '#0e7490', '#1d4ed8', '#6b21a8', '#be185d', '#78350f'
];

// Built-in vector sketch library so bots can live-draw recognizable pictures stroke-by-stroke!
const SKETCH_WORDS = [
  {
    word: 'house',
    strokes: [
      { color: '#78350f', size: 8, pts: [[250, 260], [250, 420], [510, 420], [510, 260], [250, 260]] },
      { color: '#ef4444', size: 10, pts: [[225, 260], [380, 130], [535, 260]] },
      { color: '#9a3412', size: 8, pts: [[350, 420], [350, 330], [410, 330], [410, 420]] },
      { color: '#38bdf8', size: 7, pts: [[285, 295], [325, 295], [325, 335], [285, 335], [285, 295]] },
      { color: '#38bdf8', size: 7, pts: [[435, 295], [475, 295], [475, 335], [435, 335], [435, 295]] }
    ]
  },
  {
    word: 'sun',
    strokes: [
      { color: '#facc15', size: 14, pts: circlePoints(380, 250, 82, 28) },
      { color: '#f97316', size: 9, pts: [[380, 115], [380, 148]] },
      { color: '#f97316', size: 9, pts: [[380, 352], [380, 385]] },
      { color: '#f97316', size: 9, pts: [[245, 250], [278, 250]] },
      { color: '#f97316', size: 9, pts: [[482, 250], [515, 250]] },
      { color: '#f97316', size: 9, pts: [[285, 155], [310, 180]] },
      { color: '#f97316', size: 9, pts: [[450, 320], [475, 345]] },
      { color: '#f97316', size: 9, pts: [[475, 155], [450, 180]] },
      { color: '#f97316', size: 9, pts: [[310, 320], [285, 345]] }
    ]
  },
  {
    word: 'tree',
    strokes: [
      { color: '#78350f', size: 18, pts: [[380, 430], [380, 255]] },
      { color: '#22c55e', size: 16, pts: circlePoints(380, 200, 88, 26) },
      { color: '#15803d', size: 14, pts: circlePoints(320, 230, 58, 22) },
      { color: '#15803d', size: 14, pts: circlePoints(440, 230, 58, 22) }
    ]
  },
  {
    word: 'pizza',
    strokes: [
      { color: '#facc15', size: 10, pts: [[380, 110], [240, 400], [520, 400], [380, 110]] },
      { color: '#d97706', size: 16, pts: [[235, 402], [525, 402]] },
      { color: '#ef4444', size: 16, pts: circlePoints(380, 250, 12, 10) },
      { color: '#ef4444', size: 16, pts: circlePoints(340, 330, 12, 10) },
      { color: '#ef4444', size: 16, pts: circlePoints(425, 340, 12, 10) }
    ]
  },
  {
    word: 'rocket',
    strokes: [
      { color: '#3b82f6', size: 9, pts: [[380, 95], [330, 195], [330, 355], [430, 355], [430, 195], [380, 95]] },
      { color: '#ef4444', size: 9, pts: [[330, 295], [275, 375], [330, 355]] },
      { color: '#ef4444', size: 9, pts: [[430, 295], [485, 375], [430, 355]] },
      { color: '#06b6d4', size: 8, pts: circlePoints(380, 225, 24, 18) },
      { color: '#f97316', size: 11, pts: [[350, 365], [380, 445], [410, 365]] }
    ]
  },
  {
    word: 'smiley',
    strokes: [
      { color: '#facc15', size: 12, pts: circlePoints(380, 250, 125, 32) },
      { color: '#000000', size: 14, pts: circlePoints(335, 215, 10, 10) },
      { color: '#000000', size: 14, pts: circlePoints(425, 215, 10, 10) },
      { color: '#000000', size: 10, pts: arcPoints(380, 255, 72, 0.2 * Math.PI, 0.8 * Math.PI, 18) }
    ]
  },
  {
    word: 'cat',
    strokes: [
      { color: '#475569', size: 9, pts: circlePoints(380, 275, 95, 28) },
      { color: '#475569', size: 9, pts: [[305, 205], [295, 125], [350, 185]] },
      { color: '#475569', size: 9, pts: [[455, 205], [465, 125], [410, 185]] },
      { color: '#22c55e', size: 10, pts: circlePoints(345, 255, 9, 10) },
      { color: '#22c55e', size: 10, pts: circlePoints(415, 255, 9, 10) },
      { color: '#ec4899', size: 9, pts: [[372, 285], [388, 285], [380, 296], [372, 285]] },
      { color: '#000000', size: 5, pts: [[260, 280], [325, 285]] },
      { color: '#000000', size: 5, pts: [[435, 285], [500, 280]] }
    ]
  },
  {
    word: 'bicycle',
    strokes: [
      { color: '#000000', size: 9, pts: circlePoints(270, 330, 62, 24) },
      { color: '#000000', size: 9, pts: circlePoints(490, 330, 62, 24) },
      { color: '#ef4444', size: 8, pts: [[270, 330], [360, 235], [455, 235], [375, 330], [270, 330]] },
      { color: '#ef4444', size: 8, pts: [[455, 235], [490, 330]] },
      { color: '#475569', size: 8, pts: [[445, 205], [475, 205]] },
      { color: '#475569', size: 8, pts: [[342, 215], [375, 215]] }
    ]
  }
];

function circlePoints(cx, cy, r, steps) {
  const out = [];
  for (let i = 0; i <= steps; i += 1) {
    const a = (i / steps) * Math.PI * 2;
    out.push([Math.round(cx + Math.cos(a) * r), Math.round(cy + Math.sin(a) * r)]);
  }
  return out;
}

function arcPoints(cx, cy, r, startA, endA, steps) {
  const out = [];
  for (let i = 0; i <= steps; i += 1) {
    const a = startA + (i / steps) * (endA - startA);
    out.push([Math.round(cx + Math.cos(a) * r), Math.round(cy + Math.sin(a) * r)]);
  }
  return out;
}

const canvas = document.getElementById('drawCanvas');
const ctx = canvas.getContext('2d');

const timerValEl = document.getElementById('timerVal');
const roleTagEl = document.getElementById('roleTag');
const wordMaskEl = document.getElementById('wordMask');
const roundPillEl = document.getElementById('roundPill');
const btnSwitchRoleEl = document.getElementById('btnSwitchRole');
const btnNewGameEl = document.getElementById('btnNewGame');

const playerListEl = document.getElementById('playerList');
const boardOverlayEl = document.getElementById('boardOverlay');
const overlayTagEl = document.getElementById('overlayTag');
const overlayTitleEl = document.getElementById('overlayTitle');
const overlaySubEl = document.getElementById('overlaySub');
const wordChoicesEl = document.getElementById('wordChoices');

const drawToolbarEl = document.getElementById('drawToolbar');
const colorPaletteEl = document.getElementById('colorPalette');
const toolBtns = Array.from(document.querySelectorAll('[data-tool]'));
const sizeBtns = Array.from(document.querySelectorAll('[data-size]'));
const btnUndoEl = document.getElementById('btnUndo');
const btnClearEl = document.getElementById('btnClear');

const guessCounterEl = document.getElementById('guessCounter');
const chatFeedEl = document.getElementById('chatFeed');
const guessFormEl = document.getElementById('guessForm');
const guessInputEl = document.getElementById('guessInput');

const TOTAL_ROUNDS = 5;
const ROUND_SECONDS = 60;

let players = [
  { id: 'you', name: 'You', avatar: '😎', score: 0, guessed: false, isBot: false },
  { id: 'bot1', name: 'SketchBot', avatar: '🤖', score: 0, guessed: false, isBot: true },
  { id: 'bot2', name: 'PixelFox', avatar: '🦊', score: 0, guessed: false, isBot: true },
  { id: 'bot3', name: 'DoodleCat', avatar: '🐱', score: 0, guessed: false, isBot: true }
];

let preferRole = 'guesser'; // 'guesser' (bots draw, you guess) | 'drawer' (you draw, bots guess)
let roundNum = 1;
let timeLeft = ROUND_SECONDS;
let roundActive = false;
let currentEntry = SKETCH_WORDS[0];
let revealedIndices = new Set();
let roundTimer = null;
let botTimer = null;
let botDrawInterval = null;

// Canvas & Drawing History
let brushColor = '#000000';
let brushSize = 9;
let activeTool = 'brush';
let isDrawing = false;
let strokes = [];
let currentStroke = null;

function clearCanvasWhite(recordHistory = true) {
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  if (recordHistory) strokes = [];
}

function redrawAllStrokes() {
  clearCanvasWhite(false);
  for (const st of strokes) {
    if (st.fill) {
      ctx.fillStyle = st.color;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      continue;
    }
    if (!st.pts || st.pts.length === 0) continue;
    ctx.strokeStyle = st.color;
    ctx.lineWidth = st.size;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(st.pts[0][0], st.pts[0][1]);
    for (let i = 1; i < st.pts.length; i += 1) {
      ctx.lineTo(st.pts[i][0], st.pts[i][1]);
    }
    ctx.stroke();
  }
}

function buildPalette() {
  colorPaletteEl.innerHTML = '';
  COLORS.forEach((hex, idx) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = `swatch ${idx === 0 ? 'active' : ''}`.trim();
    btn.style.backgroundColor = hex;
    btn.title = hex;
    btn.addEventListener('click', () => {
      brushColor = hex;
      if (activeTool === 'eraser') setActiveTool('brush');
      document.querySelectorAll('.swatch').forEach((s) => s.classList.toggle('active', s === btn));
    });
    colorPaletteEl.appendChild(btn);
  });
}

function setActiveTool(tool) {
  activeTool = tool;
  toolBtns.forEach((b) => b.classList.toggle('active', b.dataset.tool === tool));
}

toolBtns.forEach((btn) => {
  btn.addEventListener('click', () => setActiveTool(btn.dataset.tool));
});

sizeBtns.forEach((btn) => {
  btn.addEventListener('click', () => {
    brushSize = Number(btn.dataset.size) || 9;
    sizeBtns.forEach((b) => b.classList.toggle('active', b === btn));
  });
});

btnUndoEl.addEventListener('click', () => {
  if (preferRole !== 'drawer' || !roundActive) return;
  strokes.pop();
  redrawAllStrokes();
});

btnClearEl.addEventListener('click', () => {
  if (preferRole !== 'drawer' || !roundActive) return;
  clearCanvasWhite(true);
});

function canvasPointFromEvent(e) {
  const rect = canvas.getBoundingClientRect();
  return [
    ((e.clientX - rect.left) / rect.width) * canvas.width,
    ((e.clientY - rect.top) / rect.height) * canvas.height
  ];
}

canvas.addEventListener('pointerdown', (e) => {
  if (preferRole !== 'drawer' || !roundActive) return;
  const pt = canvasPointFromEvent(e);

  if (activeTool === 'fill') {
    strokes.push({ fill: true, color: brushColor });
    redrawAllStrokes();
    return;
  }

  isDrawing = true;
  const col = activeTool === 'eraser' ? '#ffffff' : brushColor;
  currentStroke = { color: col, size: brushSize, pts: [pt] };
  strokes.push(currentStroke);

  ctx.strokeStyle = col;
  ctx.lineWidth = brushSize;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(pt[0], pt[1]);
  ctx.lineTo(pt[0] + 0.1, pt[1] + 0.1);
  ctx.stroke();
});

canvas.addEventListener('pointermove', (e) => {
  if (!isDrawing || !currentStroke) return;
  const pt = canvasPointFromEvent(e);
  currentStroke.pts.push(pt);
  ctx.lineTo(pt[0], pt[1]);
  ctx.stroke();
});

window.addEventListener('pointerup', () => {
  isDrawing = false;
  currentStroke = null;
});

function addChat(text, cls = '') {
  const div = document.createElement('div');
  div.className = `chat-msg ${cls}`.trim();
  div.textContent = text;
  chatFeedEl.appendChild(div);
  chatFeedEl.scrollTop = chatFeedEl.scrollHeight;
}

function renderPlayers() {
  const sorted = [...players].sort((a, b) => b.score - a.score);
  playerListEl.innerHTML = '';
  sorted.forEach((p, idx) => {
    const isDrawer = (preferRole === 'drawer' && p.id === 'you') || (preferRole === 'guesser' && p.id === 'bot1');
    const row = document.createElement('div');
    row.className = `player-row ${p.guessed ? 'guessed' : ''}`.trim();
    row.innerHTML = `
      <div class="player-left">
        <div class="avatar">${p.avatar}</div>
        <div>
          <div class="player-name">#${idx + 1} ${p.name} ${isDrawer ? '✏️' : ''}</div>
          <div class="player-sub">${p.guessed ? 'Guessed!' : isDrawer ? 'Drawing...' : 'Guessing'}</div>
        </div>
      </div>
      <div class="player-score">${p.score}</div>
    `;
    playerListEl.appendChild(row);
  });

  const guessedTotal = players.filter((p) => p.guessed).length;
  guessCounterEl.textContent = `${guessedTotal} Guessed`;
}

function updateWordHintDisplay() {
  const word = currentEntry.word.toUpperCase();
  if (preferRole === 'drawer' || players.find((p) => p.id === 'you')?.guessed || !roundActive) {
    wordMaskEl.textContent = word.split('').join(' ');
    return;
  }
  wordMaskEl.textContent = word
    .split('')
    .map((ch, idx) => (ch === ' ' ? ' ' : revealedIndices.has(idx) ? ch : '_'))
    .join(' ');
}

function revealOneLetterHint() {
  const word = currentEntry.word;
  const hidden = [];
  for (let i = 0; i < word.length; i += 1) {
    if (word[i] !== ' ' && !revealedIndices.has(i)) hidden.push(i);
  }
  if (hidden.length > 1) {
    const pick = hidden[Math.floor(Math.random() * hidden.length)];
    revealedIndices.add(pick);
    updateWordHintDisplay();
    addChat('Hint: A letter was revealed!', 'system');
  }
}

function isOneLetterOff(guess, target) {
  if (Math.abs(guess.length - target.length) > 1) return false;
  let diffs = 0;
  const len = Math.max(guess.length, target.length);
  for (let i = 0; i < len; i += 1) {
    if (guess[i] !== target[i]) diffs += 1;
  }
  return diffs === 1;
}

function awardArcadeXp(xp, coins) {
  if (window.ArcadeQuests?.loadData && window.ArcadeQuests?.saveData) {
    const st = window.ArcadeQuests.loadData();
    st.xp = (Number(st.xp) || 0) + xp;
    st.coins = (Number(st.coins) || 0) + coins;
    window.ArcadeQuests.saveData(st);
  }
}

function handlePlayerGuess(playerObj, rawGuess) {
  const clean = rawGuess.trim();
  if (!clean) return;

  const target = currentEntry.word.toLowerCase();
  const normalized = clean.toLowerCase();
  const isDrawer =
    (preferRole === 'drawer' && playerObj.id === 'you') ||
    (preferRole === 'guesser' && playerObj.id === 'bot1');

  if (!roundActive || isDrawer || playerObj.guessed) {
    addChat(`${playerObj.name}: ${clean}`);
    return;
  }

  if (normalized === target) {
    playerObj.guessed = true;
    const bonus = Math.max(100, Math.round(timeLeft * 6.5));
    playerObj.score += bonus;

    const drawer = players.find((p) => (preferRole === 'drawer' ? p.id === 'you' : p.id === 'bot1'));
    if (drawer) drawer.score += 75;

    addChat(`🎉 ${playerObj.name} guessed the word! (+${bonus} pts)`, 'correct');
    if (playerObj.id === 'you') {
      awardArcadeXp(20, 8);
    }

    renderPlayers();
    updateWordHintDisplay();

    const activeGuessers = players.filter((p) =>
      preferRole === 'drawer' ? p.id !== 'you' : p.id !== 'bot1'
    );
    if (activeGuessers.every((p) => p.guessed)) {
      endRound('Everyone guessed the word!');
    }
    return;
  }

  if (isOneLetterOff(normalized, target)) {
    addChat(`${playerObj.name}: ${clean}`);
    addChat(`🔥 "${clean}" is super close!`, 'close');
    return;
  }

  addChat(`${playerObj.name}: ${clean}`);
}

guessFormEl.addEventListener('submit', (e) => {
  e.preventDefault();
  const you = players.find((p) => p.id === 'you');
  handlePlayerGuess(you, guessInputEl.value);
  guessInputEl.value = '';
});

function animateBotSketch(entry) {
  clearInterval(botDrawInterval);
  clearCanvasWhite(true);
  let sIdx = 0;
  let pIdx = 1;

  botDrawInterval = setInterval(() => {
    if (!roundActive || sIdx >= entry.strokes.length) {
      clearInterval(botDrawInterval);
      return;
    }
    const st = entry.strokes[sIdx];
    const prev = st.pts[pIdx - 1];
    const curr = st.pts[pIdx];
    if (prev && curr) {
      ctx.strokeStyle = st.color;
      ctx.lineWidth = st.size;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo(prev[0], prev[1]);
      ctx.lineTo(curr[0], curr[1]);
      ctx.stroke();
    }
    pIdx += 1;
    if (pIdx >= st.pts.length) {
      sIdx += 1;
      pIdx = 1;
    }
  }, 55);
}

function scheduleBotGuesses() {
  clearInterval(botTimer);
  const wrongPool = ['apple', 'car', 'cloud', 'star', 'fish', 'crown', 'boat', 'bird', 'flower'];

  botTimer = setInterval(() => {
    if (!roundActive) return;
    const eligibleBots = players.filter((p) => {
      if (!p.isBot || p.guessed) return false;
      if (preferRole === 'guesser' && p.id === 'bot1') return false;
      return true;
    });
    if (eligibleBots.length === 0) return;

    const bot = eligibleBots[Math.floor(Math.random() * eligibleBots.length)];
    const hasInk = preferRole === 'guesser' || strokes.length > 0;
    const solveChance = hasInk && timeLeft < 42 ? 0.34 : 0.08;

    if (Math.random() < solveChance) {
      handlePlayerGuess(bot, currentEntry.word);
    } else {
      const decoys = wrongPool.filter((w) => w !== currentEntry.word);
      handlePlayerGuess(bot, decoys[Math.floor(Math.random() * decoys.length)]);
    }
  }, 3400);
}

function startRoundWithWord(entry) {
  currentEntry = entry;
  revealedIndices = new Set();
  timeLeft = ROUND_SECONDS;
  roundActive = true;
  players.forEach((p) => {
    p.guessed = false;
  });

  boardOverlayEl.classList.add('hidden');
  clearCanvasWhite(true);

  const youDrawing = preferRole === 'drawer';
  roleTagEl.textContent = youDrawing ? 'DRAW THIS WORD' : 'GUESS THE SKETCH';
  drawToolbarEl.classList.toggle('disabled', !youDrawing);
  guessInputEl.disabled = youDrawing;
  guessInputEl.placeholder = youDrawing ? 'You are drawing!' : 'Type your guess here...';
  roundPillEl.textContent = `Round ${roundNum} / ${TOTAL_ROUNDS}`;
  timerValEl.textContent = String(timeLeft);
  timerValEl.classList.remove('urgent');

  renderPlayers();
  updateWordHintDisplay();

  if (youDrawing) {
    addChat(`✏️ You are drawing "${entry.word.toUpperCase()}"!`, 'system');
  } else {
    addChat('🤖 SketchBot is drawing! Type your guesses in chat.', 'system');
    animateBotSketch(entry);
  }

  scheduleBotGuesses();

  clearInterval(roundTimer);
  roundTimer = setInterval(() => {
    timeLeft -= 1;
    timerValEl.textContent = String(Math.max(0, timeLeft));
    if (timeLeft <= 12) timerValEl.classList.add('urgent');

    if (timeLeft === 40 || timeLeft === 22) {
      revealOneLetterHint();
    }

    if (timeLeft <= 0) {
      endRound("Time's up!");
    }
  }, 1000);
}

function endRound(reason) {
  if (!roundActive) return;
  roundActive = false;
  clearInterval(roundTimer);
  clearInterval(botTimer);
  clearInterval(botDrawInterval);

  updateWordHintDisplay();
  addChat(`${reason} The word was "${currentEntry.word.toUpperCase()}".`, 'system');

  if (roundNum >= TOTAL_ROUNDS) {
    const winner = [...players].sort((a, b) => b.score - a.score)[0];
    overlayTagEl.textContent = 'FINAL PODIUM';
    overlayTitleEl.textContent = `🏆 ${winner.name} Wins with ${winner.score} pts!`;
    overlaySubEl.textContent = 'Click below to start a fresh 5-round match.';
    wordChoicesEl.innerHTML = '';
    const replayBtn = document.createElement('button');
    replayBtn.type = 'button';
    replayBtn.className = 'choice-btn';
    replayBtn.textContent = 'Play Again';
    replayBtn.addEventListener('click', startNewMatch);
    wordChoicesEl.appendChild(replayBtn);
    boardOverlayEl.classList.remove('hidden');
    if (winner.id === 'you') awardArcadeXp(50, 20);
    return;
  }

  overlayTagEl.textContent = 'ROUND OVER';
  overlayTitleEl.textContent = `The word was: ${currentEntry.word.toUpperCase()}`;
  overlaySubEl.textContent = 'Next round starting shortly...';
  wordChoicesEl.innerHTML = '';
  boardOverlayEl.classList.remove('hidden');

  setTimeout(() => {
    roundNum += 1;
    prepareRound();
  }, 2400);
}

function pickThreeWords() {
  const pool = [...SKETCH_WORDS].sort(() => Math.random() - 0.5);
  return pool.slice(0, 3);
}

function prepareRound() {
  const options = pickThreeWords();
  if (preferRole === 'drawer') {
    overlayTagEl.textContent = `ROUND ${roundNum} OF ${TOTAL_ROUNDS} • YOUR TURN`;
    overlayTitleEl.textContent = 'Choose a Word to Draw';
    overlaySubEl.textContent = 'Pick one of the 3 secret words below:';
    wordChoicesEl.innerHTML = '';
    options.forEach((opt) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'choice-btn';
      btn.textContent = opt.word.toUpperCase();
      btn.addEventListener('click', () => startRoundWithWord(opt));
      wordChoicesEl.appendChild(btn);
    });
    boardOverlayEl.classList.remove('hidden');
  } else {
    startRoundWithWord(options[0]);
  }
}

function startNewMatch() {
  clearInterval(roundTimer);
  clearInterval(botTimer);
  clearInterval(botDrawInterval);
  roundNum = 1;
  players.forEach((p) => {
    p.score = 0;
    p.guessed = false;
  });
  chatFeedEl.innerHTML = '';
  addChat('Welcome to Scribble.io! Guess fast for maximum points.', 'system');
  prepareRound();
}

btnSwitchRoleEl.addEventListener('click', () => {
  preferRole = preferRole === 'guesser' ? 'drawer' : 'guesser';
  btnSwitchRoleEl.textContent = preferRole === 'guesser' ? 'Role: Guesser' : 'Role: Drawer';
  startNewMatch();
});

btnNewGameEl.addEventListener('click', startNewMatch);

buildPalette();
startNewMatch();