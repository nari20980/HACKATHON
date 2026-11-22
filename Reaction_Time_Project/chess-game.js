'use strict';

(function () {
  const GLYPHS = {
    wK: '♔', wQ: '♕', wR: '♖', wB: '♗', wN: '♘', wP: '♙',
    bK: '♚', bQ: '♛', bR: '♜', bB: '♝', bN: '♞', bP: '♟'
  };

  const VALUES = { P: 1, N: 3, B: 3, R: 5, Q: 9, K: 100 };

  const boardEl = document.getElementById('chessBoard');
  const statusEl = document.getElementById('chessStatus');
  const modeAiBtn = document.getElementById('btnModeAi');
  const mode2pBtn = document.getElementById('btnMode2p');
  const resetBtn = document.getElementById('btnResetChess');

  let board = [];
  let turn = 'w';
  let vsAi = true;
  let selected = null;
  let legalMoves = [];
  let gameOver = false;
  let rewardGiven = false;

  function initialBoard() {
    return [
      ['bR', 'bN', 'bB', 'bQ', 'bK', 'bB', 'bN', 'bR'],
      ['bP', 'bP', 'bP', 'bP', 'bP', 'bP', 'bP', 'bP'],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      ['wP', 'wP', 'wP', 'wP', 'wP', 'wP', 'wP', 'wP'],
      ['wR', 'wN', 'wB', 'wQ', 'wK', 'wB', 'wN', 'wR']
    ];
  }

  function inBounds(r, c) {
    return r >= 0 && r < 8 && c >= 0 && c < 8;
  }

  function getMovesFor(r, c, b = board) {
    const piece = b[r][c];
    if (!piece) return [];
    const color = piece[0];
    const type = piece[1];
    const moves = [];

    const addIf = (nr, nc) => {
      if (!inBounds(nr, nc)) return false;
      const target = b[nr][nc];
      if (!target) {
        moves.push({ r: nr, c: nc });
        return true;
      }
      if (target[0] !== color) {
        moves.push({ r: nr, c: nc });
      }
      return false;
    };

    const slide = (dirs) => {
      for (const [dr, dc] of dirs) {
        let nr = r + dr;
        let nc = c + dc;
        while (inBounds(nr, nc)) {
          if (!addIf(nr, nc)) break;
          nr += dr;
          nc += dc;
        }
      }
    };

    if (type === 'P') {
      const dir = color === 'w' ? -1 : 1;
      const startRow = color === 'w' ? 6 : 1;
      if (inBounds(r + dir, c) && !b[r + dir][c]) {
        moves.push({ r: r + dir, c });
        if (r === startRow && inBounds(r + dir * 2, c) && !b[r + dir * 2][c]) {
          moves.push({ r: r + dir * 2, c });
        }
      }
      for (const dc of [-1, 1]) {
        if (inBounds(r + dir, c + dc) && b[r + dir][c + dc] && b[r + dir][c + dc][0] !== color) {
          moves.push({ r: r + dir, c: c + dc });
        }
      }
    } else if (type === 'N') {
      for (const [dr, dc] of [[-2, -1], [-2, 1], [-1, -2], [-1, 2], [1, -2], [1, 2], [2, -1], [2, 1]]) {
        addIf(r + dr, c + dc);
      }
    } else if (type === 'B') {
      slide([[-1, -1], [-1, 1], [1, -1], [1, 1]]);
    } else if (type === 'R') {
      slide([[-1, 0], [1, 0], [0, -1], [0, 1]]);
    } else if (type === 'Q') {
      slide([[-1, -1], [-1, 1], [1, -1], [1, 1], [-1, 0], [1, 0], [0, -1], [0, 1]]);
    } else if (type === 'K') {
      for (const [dr, dc] of [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]]) {
        addIf(r + dr, c + dc);
      }
    }

    return moves;
  }

  function applyMove(fr, fc, tr, tc) {
    const moving = board[fr][fc];
    const captured = board[tr][tc];
    board[tr][tc] = moving;
    board[fr][fc] = null;

    // Pawn promotion to Queen
    if (moving === 'wP' && tr === 0) board[tr][tc] = 'wQ';
    if (moving === 'bP' && tr === 7) board[tr][tc] = 'bQ';

    if (captured && captured[1] === 'K') {
      gameOver = true;
      const winner = moving[0] === 'w' ? 'White' : 'Black';
      if (winner === 'White' && !rewardGiven && window.ArcadeQuests?.loadData) {
        rewardGiven = true;
        const st = window.ArcadeQuests.loadData();
        st.xp = (Number(st.xp) || 0) + 35;
        st.coins = (Number(st.coins) || 0) + 15;
        window.ArcadeQuests.saveData(st);
      }
      if (statusEl) {
        statusEl.textContent = `${winner} wins by capturing the King! Click New Game to play again.`;
      }
      return;
    }

    turn = turn === 'w' ? 'b' : 'w';
    if (statusEl && !gameOver) {
      statusEl.textContent = `${turn === 'w' ? 'White' : 'Black'}'s turn.`;
    }
  }

  function aiMove() {
    if (gameOver || turn !== 'b') return;
    let bestMove = null;
    let bestScore = -999;

    for (let r = 0; r < 8; r += 1) {
      for (let c = 0; c < 8; c += 1) {
        if (board[r][c] && board[r][c][0] === 'b') {
          for (const m of getMovesFor(r, c)) {
            const target = board[m.r][m.c];
            const score = (target ? VALUES[target[1]] * 10 : 0) + Math.random() * 1.5;
            if (score > bestScore) {
              bestScore = score;
              bestMove = { fr: r, fc: c, tr: m.r, tc: m.c };
            }
          }
        }
      }
    }

    if (bestMove) {
      applyMove(bestMove.fr, bestMove.fc, bestMove.tr, bestMove.tc);
      render();
    }
  }

  function handleSquareClick(r, c) {
    if (gameOver) return;
    if (vsAi && turn === 'b') return;

    const moveMatch = legalMoves.find((m) => m.r === r && m.c === c);
    if (selected && moveMatch) {
      applyMove(selected.r, selected.c, r, c);
      selected = null;
      legalMoves = [];
      render();
      if (!gameOver && vsAi && turn === 'b') {
        setTimeout(aiMove, 220);
      }
      return;
    }

    const p = board[r][c];
    if (p && p[0] === turn) {
      selected = { r, c };
      legalMoves = getMovesFor(r, c);
    } else {
      selected = null;
      legalMoves = [];
    }
    render();
  }

  function render() {
    if (!boardEl) return;
    boardEl.innerHTML = '';
    for (let r = 0; r < 8; r += 1) {
      for (let c = 0; c < 8; c += 1) {
        const btn = document.createElement('button');
        btn.type = 'button';
        const isDark = (r + c) % 2 === 1;
        const isSel = selected && selected.r === r && selected.c === c;
        const isLegal = legalMoves.some((m) => m.r === r && m.c === c);

        btn.className = `sq ${isDark ? 'dark' : 'light'}${isSel ? ' selected' : ''}${isLegal ? ' legal' : ''}`;
        const piece = board[r][c];
        btn.textContent = piece ? GLYPHS[piece] : '';
        btn.style.color = piece && piece[0] === 'w' ? '#f8fafc' : '#c084fc';
        btn.addEventListener('click', () => handleSquareClick(r, c));
        boardEl.appendChild(btn);
      }
    }
  }

  function resetGame() {
    board = initialBoard();
    turn = 'w';
    selected = null;
    legalMoves = [];
    gameOver = false;
    rewardGiven = false;
    if (statusEl) statusEl.textContent = "White's turn. Click a piece to see legal moves.";
    render();
  }

  modeAiBtn?.addEventListener('click', () => {
    vsAi = true;
    modeAiBtn.classList.add('active');
    mode2pBtn?.classList.remove('active');
    resetGame();
  });

  mode2pBtn?.addEventListener('click', () => {
    vsAi = false;
    mode2pBtn.classList.add('active');
    modeAiBtn?.classList.remove('active');
    resetGame();
  });

  resetBtn?.addEventListener('click', resetGame);
  resetGame();
})();