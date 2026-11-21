'use strict';

(function () {
  const GRID_STORAGE_KEY = 'arcade_mc_builder_5x5_v1';
  const GRID_SIZE = 25; // 5x5

  const BLOCK_META = {
    oak_log: { label: 'Oak Log', className: 'tex-oak-log' },
    oak_planks: { label: 'Oak Planks', className: 'tex-oak-planks' },
    cobblestone: { label: 'Cobblestone', className: 'tex-cobblestone' },
    air: { label: 'Empty Hand (Erase)', className: '' }
  };

  let heldBlock = 'oak_log';
  let isPointerDown = false;
  let cellsState = loadGrid();

  const dom = {
    blockGrid: document.getElementById('blockGrid'),
    hotbar: document.getElementById('hotbar'),
    holdingLabel: document.getElementById('holdingLabel'),
    blockCountLabel: document.getElementById('blockCountLabel'),
    btnClearGrid: document.getElementById('btnClearGrid')
  };

  function loadGrid() {
    try {
      const saved = JSON.parse(localStorage.getItem(GRID_STORAGE_KEY));
      if (Array.isArray(saved) && saved.length === GRID_SIZE) {
        return saved.map((val) => (BLOCK_META[val] ? val : 'air'));
      }
    } catch {
      // Ignore storage errors
    }
    return Array(GRID_SIZE).fill('air');
  }

  function saveGrid() {
    try {
      localStorage.setItem(GRID_STORAGE_KEY, JSON.stringify(cellsState));
    } catch {
      // Ignore storage errors
    }
  }

  function updateCounters() {
    const placed = cellsState.filter((b) => b !== 'air').length;
    if (dom.blockCountLabel) {
      dom.blockCountLabel.textContent = `${placed} / ${GRID_SIZE} Placed`;
    }
    if (dom.holdingLabel) {
      dom.holdingLabel.textContent = `Holding: ${BLOCK_META[heldBlock]?.label || 'Oak Log'}`;
    }
  }

  function applyCellVisual(cellEl, blockType, animate) {
    cellEl.classList.remove('tex-oak-log', 'tex-oak-planks', 'tex-cobblestone', 'placed');
    const meta = BLOCK_META[blockType];
    if (meta && meta.className) {
      cellEl.classList.add(meta.className);
      if (animate) {
        void cellEl.offsetWidth;
        cellEl.classList.add('placed');
      }
    }
  }

  function placeBlockAt(index, blockType = heldBlock) {
    if (index < 0 || index >= GRID_SIZE) return;
    const nextType = BLOCK_META[blockType] ? blockType : 'air';
    if (cellsState[index] === nextType) return;

    cellsState[index] = nextType;
    const cellEl = dom.blockGrid?.children[index];
    if (cellEl) {
      applyCellVisual(cellEl, nextType, nextType !== 'air');
    }
    saveGrid();
    updateCounters();
  }

  function selectHotbarBlock(blockType) {
    if (!BLOCK_META[blockType]) return;
    heldBlock = blockType;
    dom.hotbar?.querySelectorAll('.hotbar-slot').forEach((slot) => {
      slot.classList.toggle('active', slot.dataset.block === blockType);
    });
    updateCounters();
  }

  function buildGrid() {
    if (!dom.blockGrid) return;
    dom.blockGrid.innerHTML = '';

    for (let i = 0; i < GRID_SIZE; i += 1) {
      const cell = document.createElement('div');
      cell.className = 'grid-cell';
      cell.setAttribute('role', 'gridcell');
      cell.dataset.index = String(i);
      applyCellVisual(cell, cellsState[i], false);

      cell.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        if (e.button === 2) {
          placeBlockAt(i, 'air');
          return;
        }
        isPointerDown = true;
        placeBlockAt(i, heldBlock);
      });

      cell.addEventListener('contextmenu', (e) => e.preventDefault());
      dom.blockGrid.appendChild(cell);
    }

    // Touch & mouse drag-painting across squares
    dom.blockGrid.addEventListener('pointermove', (e) => {
      if (!isPointerDown) return;
      const target = document.elementFromPoint(e.clientX, e.clientY);
      const cell = target?.closest('.grid-cell');
      if (cell && typeof cell.dataset.index === 'string') {
        placeBlockAt(Number(cell.dataset.index), heldBlock);
      }
    });

    window.addEventListener('pointerup', () => {
      isPointerDown = false;
    });
  }

  dom.hotbar?.querySelectorAll('.hotbar-slot').forEach((slot) => {
    slot.addEventListener('click', () => {
      selectHotbarBlock(slot.dataset.block);
    });
  });

  dom.btnClearGrid?.addEventListener('click', () => {
    cellsState = Array(GRID_SIZE).fill('air');
    saveGrid();
    buildGrid();
    updateCounters();
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === '1') selectHotbarBlock('oak_log');
    else if (e.key === '2') selectHotbarBlock('oak_planks');
    else if (e.key === '3') selectHotbarBlock('cobblestone');
    else if (e.key === '4') selectHotbarBlock('air');
  });

  buildGrid();
  updateCounters();
})();