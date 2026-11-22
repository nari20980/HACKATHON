'use strict';

(function () {
  const WINS = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6]
  ];

  const gridEl = document.getElementById('tttGrid');
  const statusEl = document.getElementById('tttStatus');
  const aiBtn = document.getElementById('btnTttAi');
  const p2Btn = document.getElementById('btnTtt2p');
  const resetBtn = document.getElementById('btnTttReset');

  let cells = Array(9).fill(null);
  let turn = 'X';
  let vsAi = true;
  let finished = false;
  let winLine = [];
  let rewardGiven = false;

  function checkWinner(b) {
    for (const line of WINS) {
      const [a, c, d] = line;
      if (b[a] && b[a] === b[c] && b[a] === b[d]) {
        return { winner: b[a], line };
      }
    }
    if (b.every((v) => v !== null)) {
      return { winner: 'draw', line: [] };
    }
    return null;
  }

  function finishTurn(player) {
    const res = checkWinner(cells);
    if (!res) {
      turn = turn === 'X' ? 'O' : 'X';
      if (statusEl) statusEl.textContent = `Player ${turn}'s turn.`;
      return;
    }

    finished = true;
    winLine = res.line;
    if (res.winner === 'draw') {
      if (statusEl) statusEl.textContent = "It's a draw! Click New Round to play again.";
      return;
    }

    if (player === 'X' && !rewardGiven && window.ArcadeQuests?.loadData) {
      rewardGiven = true;
      const st = window.ArcadeQuests.loadData();
      st.xp = (Number(st.xp) || 0) + 20;
      st.coins = (Number(st.coins) || 0) + 10;
      window.ArcadeQuests.saveData(st);
    }

    if (statusEl) {
      statusEl.textContent = `Player ${res.winner} wins!${res.winner === 'X' ? ' (+20 XP & +10 Coins)' : ''}`;
    }
  }

  function aiTurn() {
    if (finished || turn !== 'O') return;
    const empty = cells.map((v, i) => (v === null ? i : -1)).filter((i) => i >= 0);
    if (!empty.length) return;

    // Try winning move first, otherwise random open cell
    let chosen = empty[Math.floor(Math.random() * empty.length)];
    for (const idx of empty) {
      const copy = [...cells];
      copy[idx] = 'O';
      if (checkWinner(copy)?.winner === 'O') {
        chosen = idx;
        break;
      }
    }

    cells[chosen] = 'O';
    finishTurn('O');
    render();
  }

  function handleCell(idx) {
    if (finished || cells[idx] !== null) return;
    if (vsAi && turn === 'O') return;

    cells[idx] = turn;
    const movedBy = turn;
    finishTurn(movedBy);
    render();

    if (!finished && vsAi && turn === 'O') {
      setTimeout(aiTurn, 200);
    }
  }

  function render() {
    if (!gridEl) return;
    gridEl.innerHTML = '';
    cells.forEach((val, idx) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'ttt-cell'
        + (val === 'X' ? ' x' : val === 'O' ? ' o' : '')
        + (winLine.includes(idx) ? ' win' : '');
      btn.textContent = val || '';
      btn.addEventListener('click', () => handleCell(idx));
      gridEl.appendChild(btn);
    });
  }

  function resetRound() {
    cells = Array(9).fill(null);
    turn = 'X';
    finished = false;
    winLine = [];
    rewardGiven = false;
    if (statusEl) statusEl.textContent = 'Player X goes first.';
    render();
  }

  aiBtn?.addEventListener('click', () => {
    vsAi = true;
    aiBtn.classList.add('active');
    p2Btn?.classList.remove('active');
    resetRound();
  });

  p2Btn?.addEventListener('click', () => {
    vsAi = false;
    p2Btn.classList.add('active');
    aiBtn?.classList.remove('active');
    resetRound();
  });

  resetBtn?.addEventListener('click', resetRound);
  resetRound();
})();