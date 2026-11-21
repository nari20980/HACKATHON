'use strict';

(function () {
  const HINT_SETS = [
    [
      { id: 's1', hint: 'Hint: Flightless black-and-white bird that waddles on ice.', word: 'PENGUIN' },
      { id: 's2', hint: 'Hint: King of the jungle with a big furry mane.', word: 'LION' },
      { id: 's3', hint: 'Hint: Blasts into space with fire and thrusters.', word: 'ROCKET' },
      { id: 's4', hint: 'Hint: Rolling ocean water that crashes on the shore.', word: 'WAVE' }
    ],
    [
      { id: 's1', hint: 'Hint: Device you click or tap to score points fast.', word: 'MOUSE' },
      { id: 's2', hint: 'Hint: Glowing orb that lights up the daytime sky.', word: 'SUN' },
      { id: 's3', hint: 'Hint: Square building piece placed on a 5×5 grid.', word: 'BLOCK' },
      { id: 's4', hint: 'Hint: How fast you respond when a green light appears.', word: 'REFLEX' }
    ]
  ];

  let setIndex = 0;
  let placedMap = {}; // slotId -> word
  let selectedWord = null;
  let draggedWord = null;
  let rewardClaimedForSet = false;

  const dom = {
    slotsGrid: document.getElementById('slotsGrid'),
    wordBank: document.getElementById('wordBank'),
    solvedCount: document.getElementById('solvedCount'),
    statusLine: document.getElementById('statusLine'),
    btnNextSet: document.getElementById('btnNextSet'),
    btnResetPuzzle: document.getElementById('btnResetPuzzle')
  };

  function shuffle(arr) {
    const copy = arr.slice();
    for (let i = copy.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  function currentItems() {
    return HINT_SETS[setIndex % HINT_SETS.length];
  }

  function countSolved() {
    const items = currentItems();
    return items.filter((item) => placedMap[item.id] === item.word).length;
  }

  function awardSetCompletion() {
    if (rewardClaimedForSet) return;
    rewardClaimedForSet = true;
    const api = window.ArcadeQuests;
    if (api && typeof api.loadData === 'function' && typeof api.saveData === 'function') {
      const state = api.loadData();
      state.xp = (Number(state.xp) || 0) + 30;
      state.coins = (Number(state.coins) || 0) + 15;
      api.saveData(state);
      if (dom.statusLine) {
        dom.statusLine.textContent = 'All hints matched! Earned +30 XP and +15 Coins.';
      }
    }
  }

  function tryPlaceWordOnSlot(word, slotId, slotEl) {
    const items = currentItems();
    const targetItem = items.find((it) => it.id === slotId);
    if (!targetItem || !word) return;

    if (placedMap[slotId] === targetItem.word) return;

    if (word === targetItem.word) {
      placedMap[slotId] = word;
      selectedWord = null;
      renderAll();

      const solved = countSolved();
      if (solved === items.length) {
        awardSetCompletion();
      } else if (dom.statusLine) {
        dom.statusLine.textContent = `Nice! "${word}" fits that hint (${solved}/${items.length} solved).`;
      }
    } else {
      slotEl?.classList.add('wrong');
      setTimeout(() => slotEl?.classList.remove('wrong'), 420);
      if (dom.statusLine) {
        dom.statusLine.textContent = `"${word}" does not match that hint—read the clue and try another slot!`;
      }
    }
  }

  function renderSlots() {
    if (!dom.slotsGrid) return;
    const items = currentItems();
    dom.slotsGrid.innerHTML = '';

    items.forEach((item) => {
      const isSolved = placedMap[item.id] === item.word;
      const block = document.createElement('div');
      block.className = `hollow-block${isSolved ? ' solved' : ''}`;
      block.dataset.slotId = item.id;

      const hintEl = document.createElement('p');
      hintEl.className = 'hint-text';
      hintEl.textContent = item.hint;

      const dropZone = document.createElement('div');
      dropZone.className = 'slot-drop-zone';
      dropZone.textContent = isSolved ? `✓ ${item.word}` : 'Drop matching word here';

      block.addEventListener('dragover', (e) => {
        if (isSolved) return;
        e.preventDefault();
        block.classList.add('drag-over');
      });

      block.addEventListener('dragleave', () => {
        block.classList.remove('drag-over');
      });

      block.addEventListener('drop', (e) => {
        e.preventDefault();
        block.classList.remove('drag-over');
        const word = e.dataTransfer?.getData('text/plain') || draggedWord;
        draggedWord = null;
        tryPlaceWordOnSlot(word, item.id, block);
      });

      block.addEventListener('click', () => {
        if (isSolved || !selectedWord) return;
        tryPlaceWordOnSlot(selectedWord, item.id, block);
      });

      block.appendChild(hintEl);
      block.appendChild(dropZone);
      dom.slotsGrid.appendChild(block);
    });
  }

  function renderWordBank() {
    if (!dom.wordBank) return;
    const items = currentItems();
    const usedWords = new Set(Object.values(placedMap));
    const bankWords = shuffle(items.map((it) => it.word));

    dom.wordBank.innerHTML = '';
    bankWords.forEach((word) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      const isPlaced = usedWords.has(word);
      const isSelected = selectedWord === word;
      btn.className = `word-block${isPlaced ? ' placed' : ''}${isSelected ? ' selected' : ''}`;
      btn.textContent = word;
      btn.draggable = !isPlaced;

      btn.addEventListener('dragstart', (e) => {
        if (isPlaced) return;
        draggedWord = word;
        e.dataTransfer?.setData('text/plain', word);
      });

      btn.addEventListener('click', () => {
        if (isPlaced) return;
        selectedWord = selectedWord === word ? null : word;
        renderWordBank();
        if (dom.statusLine && selectedWord) {
          dom.statusLine.textContent = `Selected "${selectedWord}"—click a hollow hint block to place it, or drag it.`;
        }
      });

      dom.wordBank.appendChild(btn);
    });
  }

  function renderAll() {
    const items = currentItems();
    const solved = countSolved();
    if (dom.solvedCount) dom.solvedCount.textContent = `${solved} / ${items.length}`;
    renderSlots();
    renderWordBank();
  }

  function resetCurrentSet() {
    placedMap = {};
    selectedWord = null;
    draggedWord = null;
    rewardClaimedForSet = false;
    renderAll();
    if (dom.statusLine) {
      dom.statusLine.textContent = 'Drag each word block onto the hollow block whose hint matches it.';
    }
  }

  dom.btnResetPuzzle?.addEventListener('click', resetCurrentSet);

  dom.btnNextSet?.addEventListener('click', () => {
    setIndex = (setIndex + 1) % HINT_SETS.length;
    resetCurrentSet();
  });

  renderAll();
})();