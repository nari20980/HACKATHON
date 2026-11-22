'use strict';

(function () {
  const PUZZLES = [
    {
      given: [
        [5, 3, 0, 0, 7, 0, 0, 0, 0],
        [6, 0, 0, 1, 9, 5, 0, 0, 0],
        [0, 9, 8, 0, 0, 0, 0, 6, 0],
        [8, 0, 0, 0, 6, 0, 0, 0, 3],
        [4, 0, 0, 8, 0, 3, 0, 0, 1],
        [7, 0, 0, 0, 2, 0, 0, 0, 6],
        [0, 6, 0, 0, 0, 0, 2, 8, 0],
        [0, 0, 0, 4, 1, 9, 0, 0, 5],
        [0, 0, 0, 0, 8, 0, 0, 7, 9]
      ],
      solution: [
        [5, 3, 4, 6, 7, 8, 9, 1, 2],
        [6, 7, 2, 1, 9, 5, 3, 4, 8],
        [1, 9, 8, 3, 4, 2, 5, 6, 7],
        [8, 5, 9, 7, 6, 1, 4, 2, 3],
        [4, 2, 6, 8, 5, 3, 7, 9, 1],
        [7, 1, 3, 9, 2, 4, 8, 5, 6],
        [9, 6, 1, 5, 3, 7, 2, 8, 4],
        [2, 8, 7, 4, 1, 9, 6, 3, 5],
        [3, 4, 5, 2, 8, 6, 1, 7, 9]
      ]
    }
  ];

  const boardEl = document.getElementById('sudokuBoard');
  const numpadEl = document.getElementById('numpad');
  const statusEl = document.getElementById('sudokuStatus');
  const checkBtn = document.getElementById('btnCheckSudoku');
  const newBtn = document.getElementById('btnNewSudoku');

  let currentPuzzle = PUZZLES[0];
  let board = [];
  let selected = { r: 0, c: 2 };
  let rewardGiven = false;

  function loadPuzzle(idx = 0) {
    currentPuzzle = PUZZLES[idx % PUZZLES.length];
    board = currentPuzzle.given.map((row) => [...row]);
    rewardGiven = false;
    renderBoard();
    if (statusEl) statusEl.textContent = 'Click a cell and type 1–9 (or Backspace to clear).';
  }

  function hasConflict(r, c, val) {
    if (!val) return false;
    for (let i = 0; i < 9; i += 1) {
      if (i !== c && board[r][i] === val) return true;
      if (i !== r && board[i][c] === val) return true;
    }
    const br = Math.floor(r / 3) * 3;
    const bc = Math.floor(c / 3) * 3;
    for (let rr = br; rr < br + 3; rr += 1) {
      for (let cc = bc; cc < bc + 3; cc += 1) {
        if ((rr !== r || cc !== c) && board[rr][cc] === val) return true;
      }
    }
    return false;
  }

  function renderBoard() {
    if (!boardEl) return;
    boardEl.innerHTML = '';
    for (let r = 0; r < 9; r += 1) {
      for (let c = 0; c < 9; c += 1) {
        const btn = document.createElement('button');
        btn.type = 'button';
        const isGiven = currentPuzzle.given[r][c] !== 0;
        const val = board[r][c];
        const bad = !isGiven && val !== 0 && hasConflict(r, c, val);

        btn.className = 'cell'
          + (isGiven ? ' given' : '')
          + (selected.r === r && selected.c === c ? ' selected' : '')
          + (bad ? ' bad' : '')
          + (c === 2 || c === 5 ? ' b-right' : '')
          + (r === 2 || r === 5 ? ' b-bottom' : '');
        btn.textContent = val ? String(val) : '';
        btn.addEventListener('click', () => {
          selected = { r, c };
          renderBoard();
        });
        boardEl.appendChild(btn);
      }
    }
  }

  function setValue(val) {
    const { r, c } = selected;
    if (currentPuzzle.given[r][c] !== 0) return;
    board[r][c] = val;
    renderBoard();

    const solved = board.every((row, ri) =>
      row.every((v, ci) => v === currentPuzzle.solution[ri][ci])
    );
    if (solved && statusEl) {
      const api = window.ArcadeQuests;
      if (!rewardGiven && api && typeof api.loadData === 'function' && typeof api.saveData === 'function') {
        rewardGiven = true;
        const state = api.loadData();
        state.xp = (Number(state.xp) || 0) + 35;
        state.coins = (Number(state.coins) || 0) + 15;
        api.saveData(state);
        statusEl.textContent = 'Sudoku solved! Earned +35 XP and +15 Coins!';
      } else {
        statusEl.textContent = 'Sudoku solved! Great job!';
      }
    }
  }

  function renderNumpad() {
    if (!numpadEl) return;
    numpadEl.innerHTML = '';
    for (let n = 1; n <= 9; n += 1) {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'num-btn';
      b.textContent = String(n);
      b.addEventListener('click', () => setValue(n));
      numpadEl.appendChild(b);
    }
    const clr = document.createElement('button');
    clr.type = 'button';
    clr.className = 'num-btn';
    clr.textContent = 'Clear';
    clr.addEventListener('click', () => setValue(0));
    numpadEl.appendChild(clr);
  }

  checkBtn?.addEventListener('click', () => {
    let errors = 0;
    let empty = 0;
    for (let r = 0; r < 9; r += 1) {
      for (let c = 0; c < 9; c += 1) {
        if (!board[r][c]) empty += 1;
        else if (hasConflict(r, c, board[r][c])) errors += 1;
      }
    }
    if (statusEl) {
      statusEl.textContent = errors > 0
        ? `Found ${errors} conflict(s) highlighted in red.`
        : empty > 0
          ? `No conflicts so far! ${empty} cell(s) remaining.`
          : 'Board complete with zero conflicts!';
    }
  });

  newBtn?.addEventListener('click', () => loadPuzzle(0));

  window.addEventListener('keydown', (e) => {
    if (e.key >= '1' && e.key <= '9') setValue(Number(e.key));
    else if (e.key === 'Backspace' || e.key === 'Delete' || e.key === '0') setValue(0);
    else if (e.key === 'ArrowUp') { selected.r = Math.max(0, selected.r - 1); renderBoard(); }
    else if (e.key === 'ArrowDown') { selected.r = Math.min(8, selected.r + 1); renderBoard(); }
    else if (e.key === 'ArrowLeft') { selected.c = Math.max(0, selected.c - 1); renderBoard(); }
    else if (e.key === 'ArrowRight') { selected.c = Math.min(8, selected.c + 1); renderBoard(); }
  });

  renderNumpad();
  loadPuzzle(0);
})();