import * as THREE from 'https://unpkg.com/three@0.169.0/build/three.module.js';

const PX = 1 / 16;

// Max tool rarity is strictly capped at Diamond ('wood', 'stone', 'iron', 'diamond')
const TOOL_TIERS = [
  { id: 'wood', label: 'Wooden', materialId: 'planks', color: '#b88b4e', speed: 1.35 },
  { id: 'stone', label: 'Stone', materialId: 'stone', color: '#9ca3af', speed: 1.75 },
  { id: 'iron', label: 'Iron', materialId: 'iron_block', color: '#e2e8f0', speed: 2.25 },
  { id: 'diamond', label: 'Diamond', materialId: 'diamond_block', color: '#22d3ee', speed: 2.9 }
];

const TOOL_TYPES = [
  { id: 'pickaxe', label: 'Pickaxe', favored: ['stone', 'smooth_stone', 'coal_ore', 'iron_ore', 'gold_ore', 'diamond_ore', 'obsidian', 'brick', 'sandstone'] },
  { id: 'axe', label: 'Axe', favored: ['wood', 'planks', 'birch_log', 'birch_planks', 'spruce_log', 'spruce_planks', 'leaves'] },
  { id: 'shovel', label: 'Shovel', favored: ['grass', 'dirt', 'sand', 'snow_block', 'clay_block'] },
  { id: 'sword', label: 'Sword', favored: ['leaves'] }
];

const TOOL_ITEMS = [];
for (const tier of TOOL_TIERS) {
  for (const kind of TOOL_TYPES) {
    TOOL_ITEMS.push({
      id: `${tier.id}_${kind.id}`,
      name: `${tier.label} ${kind.label}`,
      isTool: true,
      tier: tier.id,
      toolKind: kind.id,
      speed: tier.speed,
      favored: kind.favored,
      color: tier.color,
      solid: false
    });
  }
}

const BLOCK_ITEMS = [
  { id: 'grass', name: 'Grass Block', style: 'grass', solid: true, dropId: 'dirt', hardness: 0.65, color: '#4ea832' },
  { id: 'dirt', name: 'Dirt', style: 'noise', base: '#7c5332', dark: '#5d3c22', light: '#966742', solid: true, hardness: 0.55, color: '#7c5332' },
  { id: 'stone', name: 'Cobblestone', style: 'stone', base: '#7a7d82', accent: '#93979e', border: '#3f4146', solid: true, hardness: 1.45, color: '#7a7d82' },
  { id: 'wood', name: 'Oak Log', style: 'log', base: '#65492b', dark: '#4d361e', top: '#b9935a', solid: true, hardness: 1.25, color: '#65492b' },
  { id: 'planks', name: 'Oak Planks', style: 'planks', base: '#b88b4e', seam: '#6c4d26', solid: true, hardness: 1.05, color: '#b88b4e' },
  { id: 'leaves', name: 'Oak Leaves', style: 'noise', base: '#368023', dark: '#255c17', light: '#4da134', solid: true, hardness: 0.35, color: '#368023' },
  { id: 'glass', name: 'Glass', style: 'glass', stroke: '#dbf4ff', solid: true, transparent: true, opacity: 0.68, hardness: 0.45, color: '#bae6fd' },
  { id: 'water', name: 'Water', style: 'water', base: '#2582e0', ripple: '#6ec8ff', solid: false, transparent: true, opacity: 0.76, hardness: 0.4, color: '#2582e0' },

  { id: 'stick', name: 'Stick', style: 'stick', base: '#b88b4e', solid: false, hardness: 0.5 },
  { id: 'smooth_stone', name: 'Smooth Stone', style: 'noise', base: '#8c8f94', dark: '#73767b', light: '#a3a6ab', solid: true, dropId: 'stone', hardness: 1.5, color: '#8c8f94' },
  { id: 'sand', name: 'Sand', style: 'noise', base: '#dcc488', dark: '#c2a86b', light: '#efe0b4', solid: true, hardness: 0.55, color: '#dcc488' },
  { id: 'sandstone', name: 'Sandstone', style: 'planks', base: '#d2b878', seam: '#9e854b', solid: true, hardness: 1.2, color: '#d2b878' },
  { id: 'brick', name: 'Red Brick', style: 'brick', base: '#9e4332', mortar: '#c4b8a8', solid: true, hardness: 1.5, color: '#9e4332' },
  { id: 'birch_log', name: 'Birch Log', style: 'log', base: '#e2dfd7', dark: '#383530', top: '#d6c7a5', solid: true, hardness: 1.25, color: '#e2dfd7' },
  { id: 'birch_planks', name: 'Birch Planks', style: 'planks', base: '#dfc78e', seam: '#967e49', solid: true, hardness: 1.05, color: '#dfc78e' },
  { id: 'spruce_log', name: 'Spruce Log', style: 'log', base: '#4a311d', dark: '#322012', top: '#8c6643', solid: true, hardness: 1.25, color: '#4a311d' },
  { id: 'spruce_planks', name: 'Spruce Planks', style: 'planks', base: '#7d5635', seam: '#472f1b', solid: true, hardness: 1.05, color: '#7d5635' },

  { id: 'gold_block', name: 'Gold Block', style: 'metal', base: '#f5c518', hi: '#fff078', lo: '#b88b00', solid: true, hardness: 1.8, color: '#f5c518' },
  { id: 'iron_block', name: 'Iron Block', style: 'metal', base: '#cbd5e1', hi: '#f1f5f9', lo: '#64748b', solid: true, hardness: 1.9, color: '#cbd5e1' },
  { id: 'diamond_block', name: 'Diamond Block', style: 'metal', base: '#22d3ee', hi: '#a5f3fc', lo: '#0284c7', solid: true, hardness: 2.2, color: '#22d3ee' },
  { id: 'emerald_block', name: 'Emerald Block', style: 'metal', base: '#10b981', hi: '#6ee7b7', lo: '#047857', solid: true, hardness: 2.0, color: '#10b981' },
  { id: 'amethyst_block', name: 'Amethyst Block', style: 'metal', base: '#a855f7', hi: '#e9d5ff', lo: '#6b21a8', solid: true, hardness: 1.6, color: '#a855f7' },
  { id: 'copper_block', name: 'Copper Block', style: 'metal', base: '#c26d47', hi: '#eb9a75', lo: '#7c3b1e', solid: true, hardness: 1.7, color: '#c26d47' },
  { id: 'coal_ore', name: 'Coal Ore', style: 'ore', stone: '#7a7d82', spot: '#1e293b', solid: true, hardness: 1.55, color: '#475569' },
  { id: 'iron_ore', name: 'Iron Ore', style: 'ore', stone: '#7a7d82', spot: '#d6b496', solid: true, hardness: 1.7, color: '#a89f91' },

  { id: 'gold_ore', name: 'Gold Ore', style: 'ore', stone: '#7a7d82', spot: '#facc15', solid: true, hardness: 1.85, color: '#eab308' },
  { id: 'diamond_ore', name: 'Diamond Ore', style: 'ore', stone: '#7a7d82', spot: '#38bdf8', solid: true, hardness: 2.1, color: '#38bdf8' },
  { id: 'obsidian', name: 'Obsidian', style: 'noise', base: '#1b1629', dark: '#0f0b1a', light: '#3b2d5c', solid: true, hardness: 2.8, color: '#1b1629' },
  { id: 'netherrack', name: 'Crimson Stone', style: 'noise', base: '#7f2323', dark: '#541414', light: '#a83636', solid: true, hardness: 1.1, color: '#7f2323' },
  { id: 'glowstone', name: 'Glowstone', style: 'noise', base: '#f59e0b', dark: '#b45309', light: '#fef08a', solid: true, hardness: 0.7, color: '#f59e0b' },
  { id: 'sea_lantern', name: 'Sea Lantern', style: 'tile', base: '#67e8f9', inner: '#ecfeff', border: '#0891b2', solid: true, hardness: 0.75, color: '#67e8f9' },
  { id: 'redstone_block', name: 'Ruby Block', style: 'tile', base: '#dc2626', inner: '#fca5a5', border: '#7f1d1d', solid: true, hardness: 1.6, color: '#dc2626' },
  { id: 'lapis_block', name: 'Sapphire Block', style: 'tile', base: '#2563eb', inner: '#93c5fd', border: '#1e3a8a', solid: true, hardness: 1.6, color: '#2563eb' },

  { id: 'wool_white', name: 'White Wool', style: 'noise', base: '#f1f5f9', dark: '#cbd5e1', light: '#ffffff', solid: true, hardness: 0.6, color: '#f1f5f9' },
  { id: 'wool_red', name: 'Red Wool', style: 'noise', base: '#ef4444', dark: '#b91c1c', light: '#fca5a5', solid: true, hardness: 0.6, color: '#ef4444' },
  { id: 'wool_blue', name: 'Blue Wool', style: 'noise', base: '#3b82f6', dark: '#1d4ed8', light: '#93c5fd', solid: true, hardness: 0.6, color: '#3b82f6' },
  { id: 'wool_green', name: 'Green Wool', style: 'noise', base: '#22c55e', dark: '#15803d', light: '#86efac', solid: true, hardness: 0.6, color: '#22c55e' },
  { id: 'wool_yellow', name: 'Yellow Wool', style: 'noise', base: '#eab308', dark: '#a16207', light: '#fef08a', solid: true, hardness: 0.6, color: '#eab308' },
  { id: 'wool_purple', name: 'Purple Wool', style: 'noise', base: '#a855f7', dark: '#7e22ce', light: '#e9d5ff', solid: true, hardness: 0.6, color: '#a855f7' },
  { id: 'wool_orange', name: 'Orange Wool', style: 'noise', base: '#f97316', dark: '#c2410c', light: '#fed7aa', solid: true, hardness: 0.6, color: '#f97316' },
  { id: 'wool_cyan', name: 'Cyan Wool', style: 'noise', base: '#06b6d4', dark: '#0e7490', light: '#a5f3fc', solid: true, hardness: 0.6, color: '#06b6d4' },

  { id: 'wool_pink', name: 'Pink Wool', style: 'noise', base: '#ec4899', dark: '#be185d', light: '#fbcfe8', solid: true, hardness: 0.6, color: '#ec4899' },
  { id: 'wool_black', name: 'Charcoal Wool', style: 'noise', base: '#27272a', dark: '#18181b', light: '#52525b', solid: true, hardness: 0.6, color: '#27272a' },
  { id: 'snow_block', name: 'Snow Block', style: 'noise', base: '#f8fafc', dark: '#dbeafe', light: '#ffffff', solid: true, hardness: 0.55, color: '#f8fafc' },
  { id: 'ice_block', name: 'Ice Block', style: 'glass', stroke: '#bae6fd', solid: true, transparent: true, opacity: 0.78, hardness: 0.65, color: '#93c5fd' },
  { id: 'clay_block', name: 'Clay Block', style: 'noise', base: '#9ca3af', dark: '#6b7280', light: '#d1d5db', solid: true, hardness: 0.7, color: '#9ca3af' },
  { id: 'terracotta', name: 'Terracotta', style: 'planks', base: '#b4694a', seam: '#7c4129', solid: true, hardness: 1.2, color: '#b4694a' },
  { id: 'moss_stone', name: 'Mossy Stone', style: 'ore', stone: '#7a7d82', spot: '#4ea832', solid: true, hardness: 1.5, color: '#5f8d4e' },
  { id: 'quartz_block', name: 'Quartz Block', style: 'tile', base: '#f5f2eb', inner: '#ffffff', border: '#d6d0c4', solid: true, hardness: 1.3, color: '#f5f2eb' },
  { id: 'dark_prismarine', name: 'Dark Prismarine', style: 'tile', base: '#1e3a4c', inner: '#2dd4bf', border: '#0f172a', solid: true, hardness: 1.5, color: '#1e3a4c' }
];

const ALL_ITEMS = [...BLOCK_ITEMS, ...TOOL_ITEMS];
const ITEM_BY_ID = new Map(ALL_ITEMS.map((item) => [item.id, item]));

const COLOR_CACHE = new Map();
function getBlockColor(blockId) {
  if (COLOR_CACHE.has(blockId)) return COLOR_CACHE.get(blockId);
  const def = ITEM_BY_ID.get(blockId);
  const c = new THREE.Color(def?.color || '#7a7d82');
  COLOR_CACHE.set(blockId, c);
  return c;
}

const canvas = document.getElementById('worldCanvas');
const overlay = document.getElementById('lockOverlay');
const hotbarEl = document.getElementById('hotbar');
const blockLabelEl = document.getElementById('blockLabel');
const biomeBadgeEl = document.getElementById('biomeBadge');
const modeBadgeEl = document.getElementById('modeBadge');
const timeBadgeEl = document.getElementById('timeBadge');
const hpBadgeEl = document.getElementById('hpBadge');
const placedCounterEl = document.getElementById('placedCounter');
const soundBtn = document.getElementById('btnSound');

const chatMessagesEl = document.getElementById('chatMessages');
const chatFormEl = document.getElementById('chatForm');
const chatInputEl = document.getElementById('chatInput');

const survivalModalEl = document.getElementById('survivalModal');
const backpackGridEl = document.getElementById('backpackGrid');
const survivalHotbarGridEl = document.getElementById('survivalHotbarGrid');
const craftGridEl = document.getElementById('craftGrid');
const craftOutputBtnEl = document.getElementById('craftOutputBtn');
const btnCloseSurvivalEl = document.getElementById('btnCloseSurvival');

const creativeModalEl = document.getElementById('creativeModal');
const creativeGridEl = document.getElementById('creativeGrid');
const creativeSearchEl = document.getElementById('creativeSearch');
const targetSlotNumEl = document.getElementById('targetSlotNum');
const btnCloseCreativeEl = document.getElementById('btnCloseCreative');

function seededRand(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

function makePixelTextureFromGrid(grid, palette) {
  const size = grid.length;
  const texCanvas = document.createElement('canvas');
  texCanvas.width = size;
  texCanvas.height = size;
  const tctx = texCanvas.getContext('2d');

  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const ch = grid[y][x];
      tctx.fillStyle = palette[ch] || '#ff00ff';
      tctx.fillRect(x, y, 1, 1);
    }
  }

  const tex = new THREE.CanvasTexture(texCanvas);
  tex.magFilter = THREE.NearestFilter;
  tex.minFilter = THREE.NearestFilter;
  tex.generateMipmaps = false;
  tex.colorSpace = THREE.SRGBColorSpace;
  return { texture: tex, dataUrl: texCanvas.toDataURL() };
}

function makeIconTexture(drawFn, seed = 1) {
  const size = 16;
  const texCanvas = document.createElement('canvas');
  texCanvas.width = size;
  texCanvas.height = size;
  const tctx = texCanvas.getContext('2d');
  const rand = seededRand(seed);
  drawFn(tctx, size, rand);

  const texture = new THREE.CanvasTexture(texCanvas);
  texture.magFilter = THREE.NearestFilter;
  texture.minFilter = THREE.NearestFilter;
  texture.generateMipmaps = false;
  texture.colorSpace = THREE.SRGBColorSpace;
  return { texture, dataUrl: texCanvas.toDataURL() };
}

function buildItemSwatch(item, index) {
  const seed = 300 + index * 19;
  if (item.isTool) {
    return makeIconTexture((tctx) => {
      tctx.clearRect(0, 0, 16, 16);
      tctx.fillStyle = '#9c6b38';
      for (let i = 0; i < 9; i += 1) tctx.fillRect(3 + i, 12 - i, 2, 2);
      tctx.fillStyle = item.color;
      if (item.toolKind === 'pickaxe') {
        tctx.fillRect(8, 2, 6, 2);
        tctx.fillRect(12, 4, 2, 5);
      } else if (item.toolKind === 'axe') {
        tctx.fillRect(10, 2, 5, 6);
      } else if (item.toolKind === 'shovel') {
        tctx.fillRect(11, 2, 4, 4);
      } else {
        tctx.fillRect(9, 2, 5, 2);
        tctx.fillRect(11, 4, 3, 5);
        tctx.fillRect(8, 8, 5, 2);
      }
    }, seed).dataUrl;
  }
  return makeIconTexture((tctx) => {
    tctx.fillStyle = item.color || item.base || '#7a7d82';
    tctx.fillRect(0, 0, 16, 16);
    tctx.strokeStyle = 'rgba(255,255,255,0.22)';
    tctx.strokeRect(0.5, 0.5, 15, 15);
  }, seed).dataUrl;
}

const itemSwatches = new Map();
ALL_ITEMS.forEach((item, idx) => itemSwatches.set(item.id, buildItemSwatch(item, idx)));

// Game State
let username = 'player';
let gamemode = 'survival';
let keepInventory = true;
let placedCount = 0;
let playerHp = 20;

const CYCLE_SECONDS = 90;
let dayPhase = 0.22;
let wasNight = false;

function isNightTime() {
  return dayPhase >= 0.56 && dayPhase <= 0.94;
}

function updateHpBadge() {
  if (!hpBadgeEl) return;
  hpBadgeEl.textContent = gamemode === 'creative' ? 'HP: ∞' : `HP: ${Math.max(0, Math.ceil(playerHp))}/20`;
}

function appendChat(text, cls = '') {
  if (!chatMessagesEl) return;
  const line = document.createElement('div');
  line.className = `chat-line ${cls}`.trim();
  line.textContent = text;
  chatMessagesEl.appendChild(line);
  chatMessagesEl.scrollTop = chatMessagesEl.scrollHeight;
}

// Inventories & 2x2 Crafting
let survivalHotbar = [
  { id: 'diamond_pickaxe', count: 1 },
  { id: 'wood_axe', count: 1 },
  { id: 'diamond_sword', count: 1 },
  { id: 'planks', count: 24 },
  { id: 'wood', count: 12 },
  { id: 'stone', count: 16 },
  { id: 'iron_block', count: 6 },
  { id: 'stick', count: 12 }
];

let backpackSlots = Array.from({ length: 27 }, (_, idx) => {
  if (idx === 0) return { id: 'dirt', count: 16 };
  if (idx === 1) return { id: 'diamond_block', count: 6 };
  return null;
});

let creativeHotbar = BLOCK_ITEMS.slice(0, 8).map((b) => ({ id: b.id, count: 64 }));
let selectedSlot = 0;
let craftSlots = [null, null, null, null];

function getActiveHotbar() {
  return gamemode === 'creative' ? creativeHotbar : survivalHotbar;
}

function addItemToSurvival(itemId, qty = 1) {
  if (!ITEM_BY_ID.has(itemId) || qty <= 0) return;
  const itemDef = ITEM_BY_ID.get(itemId);
  if (!itemDef.isTool) {
    for (const slot of survivalHotbar) {
      if (slot && slot.id === itemId && slot.count < 64) {
        const take = Math.min(64 - slot.count, qty);
        slot.count += take;
        qty -= take;
        if (qty <= 0) return;
      }
    }
    for (const slot of backpackSlots) {
      if (slot && slot.id === itemId && slot.count < 64) {
        const take = Math.min(64 - slot.count, qty);
        slot.count += take;
        qty -= take;
        if (qty <= 0) return;
      }
    }
  }
  for (let i = 0; i < survivalHotbar.length && qty > 0; i += 1) {
    if (!survivalHotbar[i]) {
      survivalHotbar[i] = { id: itemId, count: itemDef.isTool ? 1 : Math.min(64, qty) };
      qty -= survivalHotbar[i].count;
    }
  }
  for (let i = 0; i < backpackSlots.length && qty > 0; i += 1) {
    if (!backpackSlots[i]) {
      backpackSlots[i] = { id: itemId, count: itemDef.isTool ? 1 : Math.min(64, qty) };
      qty -= backpackSlots[i].count;
    }
  }
}

function consumeSelectedSurvivalBlock() {
  if (gamemode !== 'survival') return true;
  const slot = survivalHotbar[selectedSlot];
  if (!slot || !slot.id) return false;
  const def = ITEM_BY_ID.get(slot.id);
  if (!def || def.isTool || !def.solid) return false;
  slot.count -= 1;
  if (slot.count <= 0) survivalHotbar[selectedSlot] = null;
  return true;
}

function matchCraftingRecipe(grid) {
  const counts = {};
  for (const s of grid) {
    if (s && s.id && s.count > 0) counts[s.id] = (counts[s.id] || 0) + s.count;
  }
  const keys = Object.keys(counts);
  if (keys.length === 0) return null;

  const plankKey = ['planks', 'birch_planks', 'spruce_planks'].find((k) => counts[k] >= 2 && keys.length === 1);
  if (plankKey) return { outputId: 'stick', outputCount: 4, consume: { [plankKey]: 2 } };

  const logKey = ['wood', 'birch_log', 'spruce_log'].find((k) => counts[k] >= 1 && keys.length === 1);
  if (logKey) {
    return {
      outputId: logKey === 'birch_log' ? 'birch_planks' : logKey === 'spruce_log' ? 'spruce_planks' : 'planks',
      outputCount: 4,
      consume: { [logKey]: 1 }
    };
  }

  const stickCount = counts.stick || 0;
  if (stickCount >= 2) {
    for (const tier of TOOL_TIERS) {
      if ((counts[tier.materialId] || 0) >= 2 && keys.length === 2) {
        return { outputId: `${tier.id}_pickaxe`, outputCount: 1, consume: { stick: 2, [tier.materialId]: 2 } };
      }
    }
  }
  if (stickCount >= 1) {
    for (const tier of TOOL_TIERS) {
      if ((counts[tier.materialId] || 0) >= 2 && keys.length === 2) {
        return { outputId: `${tier.id}_sword`, outputCount: 1, consume: { stick: 1, [tier.materialId]: 2 } };
      }
    }
  }
  if (stickCount >= 2) {
    for (const tier of TOOL_TIERS) {
      if ((counts[tier.materialId] || 0) >= 1 && keys.length === 2) {
        return { outputId: `${tier.id}_axe`, outputCount: 1, consume: { stick: 2, [tier.materialId]: 1 } };
      }
    }
  }
  if (stickCount >= 2) {
    for (const tier of TOOL_TIERS) {
      if ((counts[tier.materialId] || 0) >= 1 && keys.length === 2) {
        return { outputId: `${tier.id}_shovel`, outputCount: 1, consume: { stick: 2, [tier.materialId]: 1 } };
      }
    }
  }
  return null;
}

function syncHotbarUi() {
  const bar = getActiveHotbar();
  const slotEntry = bar[selectedSlot];
  const itemDef = slotEntry ? ITEM_BY_ID.get(slotEntry.id) : null;
  blockLabelEl.textContent = itemDef
    ? `${itemDef.name}${gamemode === 'survival' && !itemDef.isTool ? ` (${slotEntry.count})` : ''}`
    : 'Empty Slot';

  hotbarEl.innerHTML = '';
  bar.forEach((entry, i) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    const def = entry ? ITEM_BY_ID.get(entry.id) : null;
    btn.className = `slot ${i === selectedSlot ? 'active' : ''} ${def?.tier === 'diamond' ? 'tier-diamond' : ''}`.trim();
    const sw = def ? itemSwatches.get(def.id) || '' : '';
    const countBadge =
      def && gamemode === 'survival' && !def.isTool && entry.count > 1
        ? `<span class="slot-count">${entry.count}</span>`
        : '';
    btn.innerHTML = `<span class="slot-key">${i + 1}</span>${def ? `<img class="slot-img" src="${sw}" alt="${def.name}" />` : ''}${countBadge}`;
    btn.addEventListener('click', () => {
      selectSlot(i);
      playTone(480, 0.05, 'sine', 0.04);
    });
    hotbarEl.appendChild(btn);
  });

  syncHeldItemModel();
  if (!survivalModalEl.classList.contains('hidden')) renderSurvivalModal();
}

function selectSlot(idx) {
  const bar = getActiveHotbar();
  selectedSlot = ((idx % bar.length) + bar.length) % bar.length;
  syncHotbarUi();
}

function moveItemToCraft(sourceList, sourceIdx) {
  const src = sourceList[sourceIdx];
  if (!src || src.count <= 0) return;
  const emptyIdx = craftSlots.findIndex((c) => !c);
  if (emptyIdx === -1) {
    appendChat('2×2 crafting grid is full.', 'warn');
    return;
  }
  craftSlots[emptyIdx] = { id: src.id, count: 1 };
  src.count -= 1;
  if (src.count <= 0) sourceList[sourceIdx] = null;
  renderSurvivalModal();
  syncHotbarUi();
}

function returnCraftSlot(craftIdx) {
  const slot = craftSlots[craftIdx];
  if (!slot) return;
  addItemToSurvival(slot.id, slot.count);
  craftSlots[craftIdx] = null;
  renderSurvivalModal();
  syncHotbarUi();
}

function renderSurvivalModal() {
  craftGridEl.innerHTML = '';
  craftSlots.forEach((slot, idx) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'inv-slot';
    if (slot) {
      const def = ITEM_BY_ID.get(slot.id);
      btn.innerHTML = `<img src="${itemSwatches.get(slot.id) || ''}" alt="${def.name}" /><span class="slot-count">${slot.count}</span>`;
      btn.addEventListener('click', () => returnCraftSlot(idx));
    }
    craftGridEl.appendChild(btn);
  });

  const recipe = matchCraftingRecipe(craftSlots);
  craftOutputBtnEl.innerHTML = '';
  if (recipe) {
    const outDef = ITEM_BY_ID.get(recipe.outputId);
    craftOutputBtnEl.classList.add('ready');
    craftOutputBtnEl.disabled = false;
    craftOutputBtnEl.innerHTML = `<img src="${itemSwatches.get(recipe.outputId) || ''}" alt="${outDef.name}" /><span>${outDef.name} ×${recipe.outputCount}</span>`;
  } else {
    craftOutputBtnEl.classList.remove('ready');
    craftOutputBtnEl.disabled = true;
    craftOutputBtnEl.innerHTML = '<span class="craft-empty-text">No Recipe</span>';
  }

  backpackGridEl.innerHTML = '';
  backpackSlots.forEach((slot, idx) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    const def = slot ? ITEM_BY_ID.get(slot.id) : null;
    btn.className = `inv-slot ${def?.tier === 'diamond' ? 'tier-diamond' : ''}`.trim();
    if (slot && def) {
      btn.innerHTML = `<img src="${itemSwatches.get(def.id) || ''}" alt="${def.name}" />${!def.isTool ? `<span class="slot-count">${slot.count}</span>` : ''}`;
      btn.addEventListener('click', () => moveItemToCraft(backpackSlots, idx));
    }
    backpackGridEl.appendChild(btn);
  });

  survivalHotbarGridEl.innerHTML = '';
  survivalHotbar.forEach((slot, idx) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    const def = slot ? ITEM_BY_ID.get(slot.id) : null;
    btn.className = `inv-slot ${idx === selectedSlot ? 'active' : ''} ${def?.tier === 'diamond' ? 'tier-diamond' : ''}`.trim();
    if (slot && def) {
      btn.innerHTML = `<span class="slot-key">${idx + 1}</span><img src="${itemSwatches.get(def.id) || ''}" alt="${def.name}" />${!def.isTool ? `<span class="slot-count">${slot.count}</span>` : ''}`;
      btn.addEventListener('click', () => moveItemToCraft(survivalHotbar, idx));
    } else {
      btn.innerHTML = `<span class="slot-key">${idx + 1}</span>`;
    }
    survivalHotbarGridEl.appendChild(btn);
  });
}

craftOutputBtnEl.addEventListener('click', () => {
  const recipe = matchCraftingRecipe(craftSlots);
  if (!recipe) return;
  const needed = { ...recipe.consume };
  for (let i = 0; i < craftSlots.length; i += 1) {
    const slot = craftSlots[i];
    if (!slot) continue;
    const req = needed[slot.id] || 0;
    if (req > 0) {
      const take = Math.min(slot.count, req);
      slot.count -= take;
      needed[slot.id] -= take;
      if (slot.count <= 0) craftSlots[i] = null;
    }
  }
  addItemToSurvival(recipe.outputId, recipe.outputCount);
  playTone(640, 0.08, 'triangle', 0.06);
  appendChat(`Crafted ${ITEM_BY_ID.get(recipe.outputId).name} ×${recipe.outputCount}!`, 'cmd');
  renderSurvivalModal();
  syncHotbarUi();
});

function renderCreativeGrid(filterText = '') {
  const q = filterText.trim().toLowerCase();
  creativeGridEl.innerHTML = '';
  const matches = BLOCK_ITEMS.filter((b) => b.id !== 'stick' && (!q || b.name.toLowerCase().includes(q) || b.id.includes(q)));
  for (const item of matches) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'creative-item';
    btn.innerHTML = `<img src="${itemSwatches.get(item.id) || ''}" alt="${item.name}" /><span>${item.name}</span>`;
    btn.addEventListener('click', () => {
      creativeHotbar[selectedSlot] = { id: item.id, count: 64 };
      syncHotbarUi();
      closeModals();
    });
    creativeGridEl.appendChild(btn);
  }
}

function openInventoryForMode() {
  if (document.pointerLockElement === canvas) document.exitPointerLock?.();
  if (gamemode === 'creative') {
    survivalModalEl.classList.add('hidden');
    targetSlotNumEl.textContent = String(selectedSlot + 1);
    creativeSearchEl.value = '';
    renderCreativeGrid('');
    creativeModalEl.classList.remove('hidden');
    creativeSearchEl.focus();
  } else {
    creativeModalEl.classList.add('hidden');
    renderSurvivalModal();
    survivalModalEl.classList.remove('hidden');
  }
}

function closeModals() {
  creativeModalEl.classList.add('hidden');
  survivalModalEl.classList.add('hidden');
}

btnCloseCreativeEl.addEventListener('click', closeModals);
btnCloseSurvivalEl.addEventListener('click', closeModals);
creativeSearchEl.addEventListener('input', () => renderCreativeGrid(creativeSearchEl.value));

// Chat & Commands
function syncModeHud() {
  if (!modeBadgeEl) return;
  modeBadgeEl.textContent = `MODE: ${gamemode.toUpperCase()} (${username})`;
  updateHpBadge();
  syncHotbarUi();
}

function setGamemode(nextMode, targetUser) {
  const normalized = String(nextMode || '').toLowerCase();
  if (normalized !== 'survival' && normalized !== 'creative') {
    appendChat('Usage: gamemode <username> <survival|creative>', 'warn');
    return;
  }
  if (targetUser && targetUser.toLowerCase() !== '@s') username = targetUser;
  gamemode = normalized;
  if (gamemode === 'survival') playerHp = 20;
  resetMiningProgress();
  syncModeHud();
  appendChat(`[Server] Set ${username}'s gamemode to ${gamemode.toUpperCase()}`, 'cmd');
}

function setGamerule(ruleName, rawVal) {
  const key = String(ruleName || '').toLowerCase();
  const val = String(rawVal || '').toLowerCase();
  if (key !== 'keep_inventory' && key !== 'keepinventory') {
    appendChat('Supported gamerule: keep_inventory', 'warn');
    return;
  }
  if (val !== 'true' && val !== 'false') {
    appendChat('Usage: gamerule keep_inventory <true|false>', 'warn');
    return;
  }
  keepInventory = val === 'true';
  appendChat(`[Server] Gamerule keep_inventory set to ${keepInventory}`, 'cmd');
}

function handleChatSubmit(rawText) {
  const trimmed = String(rawText || '').trim();
  if (!trimmed) return;
  const clean = trimmed.startsWith('/') ? trimmed.slice(1).trim() : trimmed;
  const parts = clean.split(/\s+/);
  const head = (parts[0] || '').toLowerCase();

  if (head === 'gamemode') {
    const a1 = (parts[1] || '').toLowerCase();
    const a2 = (parts[2] || '').toLowerCase();
    if (a1 === 'survival' || a1 === 'creative') setGamemode(a1, parts[2] || username);
    else if (a2 === 'survival' || a2 === 'creative') setGamemode(a2, parts[1] || username);
    else appendChat('Usage: gamemode <username> <survival|creative>', 'warn');
    return;
  }
  if (head === 'gamerule') {
    setGamerule(parts[1], parts[2]);
    return;
  }
  if (head === 'help') {
    appendChat('Commands: gamemode <user> <survival|creative>, gamerule keep_inventory <true|false>', 'cmd');
    return;
  }
  appendChat(`<${username}> ${trimmed}`);
}

function openChatInput(prefill = '') {
  if (document.pointerLockElement === canvas) document.exitPointerLock?.();
  closeModals();
  chatInputEl.value = prefill;
  chatInputEl.focus();
}

chatFormEl.addEventListener('submit', (e) => {
  e.preventDefault();
  handleChatSubmit(chatInputEl.value);
  chatInputEl.value = '';
  chatInputEl.blur();
});

// Web Audio Synth
let audioCtx = null;
let musicInterval = null;
let stepIdx = 0;
let muted = false;
const notes = [196.0, 220.0, 261.63, 293.66, 329.63, 293.66, 261.63, 220.0];

function ensureAudio() {
  if (!audioCtx) {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (Ctx) audioCtx = new Ctx();
  }
  if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume().catch(() => {});
  if (!muted && !musicInterval && audioCtx) {
    musicInterval = setInterval(() => {
      if (muted || !audioCtx || audioCtx.state !== 'running') return;
      playTone(notes[stepIdx % notes.length], 0.16, 'triangle', 0.022);
      stepIdx += 1;
    }, 230);
  }
}

function playTone(freq, dur, type, vol) {
  if (muted) return;
  ensureAudio();
  if (!audioCtx) return;
  const now = audioCtx.currentTime;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, now);
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(Math.max(0.0001, vol), now + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + dur);
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.start(now);
  osc.stop(now + dur + 0.02);
}

function toggleSound() {
  muted = !muted;
  soundBtn.textContent = muted ? 'Sound: OFF' : 'Sound: ON';
  if (!muted) ensureAudio();
}

soundBtn.addEventListener('click', toggleSound);

// Three.js Scene (Low-Lag Settings + Sky/Sun/Moon/Stars)
const scene = new THREE.Scene();
const daySky = new THREE.Color(0x68a8f8);
const duskSky = new THREE.Color(0xe07a44);
const nightSky = new THREE.Color(0x050917);
scene.background = daySky.clone();
scene.fog = new THREE.FogExp2(0x68a8f8, 0.016);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 140);
scene.add(camera);

const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: 'high-performance' });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.25));
renderer.shadowMap.enabled = false;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;

const hemiLight = new THREE.HemisphereLight(0xdbeafe, 0x3b3328, 0.9);
scene.add(hemiLight);

const dirLight = new THREE.DirectionalLight(0xfff5d6, 1.15);
dirLight.position.set(24, 38, 18);
scene.add(dirLight);

const sunDisc = new THREE.Mesh(
  new THREE.BoxGeometry(6, 6, 6),
  new THREE.MeshBasicMaterial({ color: 0xffe066, fog: false })
);
scene.add(sunDisc);

const moonDisc = new THREE.Mesh(
  new THREE.BoxGeometry(4.5, 4.5, 4.5),
  new THREE.MeshBasicMaterial({ color: 0xe2e8f0, fog: false })
);
scene.add(moonDisc);

const starRand = seededRand(9001);
const starPositions = new Float32Array(260 * 3);
for (let i = 0; i < 260; i += 1) {
  const r = 100;
  const theta = starRand() * Math.PI * 2;
  const phi = starRand() * Math.PI * 0.45;
  starPositions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
  starPositions[i * 3 + 1] = r * Math.cos(phi) + 8;
  starPositions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
}
const starGeo = new THREE.BufferGeometry();
starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
const starMat = new THREE.PointsMaterial({ color: 0xffffff, size: 1.15, transparent: true, opacity: 0, fog: false });
const starField = new THREE.Points(starGeo, starMat);
scene.add(starField);

// First-Person Held Item
const heldPivot = new THREE.Group();
heldPivot.position.set(0.38, -0.32, -0.56);
camera.add(heldPivot);

let heldMesh = null;
let swingTimer = 0;

function syncHeldItemModel() {
  if (heldMesh) {
    heldPivot.remove(heldMesh);
    heldMesh = null;
  }
  const bar = getActiveHotbar();
  const entry = bar[selectedSlot];
  const def = entry ? ITEM_BY_ID.get(entry.id) : null;
  if (!def) return;

  if (def.isTool) {
    const grp = new THREE.Group();
    const handle = new THREE.Mesh(
      new THREE.BoxGeometry(0.05, 0.34, 0.05),
      new THREE.MeshLambertMaterial({ color: 0x9c6b38 })
    );
    handle.rotation.z = -0.35;
    grp.add(handle);

    const head = new THREE.Mesh(
      new THREE.BoxGeometry(def.toolKind === 'sword' ? 0.06 : 0.24, def.toolKind === 'sword' ? 0.28 : 0.08, 0.07),
      new THREE.MeshLambertMaterial({ color: def.color })
    );
    head.position.set(0.05, 0.14, 0);
    grp.add(head);
    heldMesh = grp;
    heldPivot.add(heldMesh);
    return;
  }

  heldMesh = new THREE.Mesh(
    new THREE.BoxGeometry(0.24, 0.24, 0.24),
    new THREE.MeshLambertMaterial({ color: def.color || '#7a7d82' })
  );
  heldMesh.rotation.set(0.18, 0.45, 0);
  heldPivot.add(heldMesh);
}

// Selection Box & Mining Crack Overlay
const selectionBox = new THREE.LineSegments(
  new THREE.EdgesGeometry(new THREE.BoxGeometry(1.012, 1.012, 1.012)),
  new THREE.LineBasicMaterial({ color: 0x111827 })
);
selectionBox.visible = false;
scene.add(selectionBox);

const crackMat = new THREE.MeshBasicMaterial({
  color: 0x0f172a,
  transparent: true,
  opacity: 0,
  depthWrite: false
});
const crackMesh = new THREE.Mesh(new THREE.BoxGeometry(1.016, 1.016, 1.016), crackMat);
crackMesh.visible = false;
scene.add(crackMesh);

// 1. Fast Chunked Voxel World with Face Culling
const CHUNK_SIZE = 16;
const VIEW_CHUNK_RADIUS = 2;
const WORLD_MAX_COORD = 160;
const CAVE_MIN_Y = -50;
const WATER_LEVEL = -1;

const FACES = [
  { dir: [1, 0, 0], shade: 0.82, corners: [[1, 0, 1], [1, 0, 0], [1, 1, 0], [1, 1, 1]] },
  { dir: [-1, 0, 0], shade: 0.82, corners: [[0, 0, 0], [0, 0, 1], [0, 1, 1], [0, 1, 0]] },
  { dir: [0, 1, 0], shade: 1.0, corners: [[0, 1, 1], [1, 1, 1], [1, 1, 0], [0, 1, 0]] },
  { dir: [0, -1, 0], shade: 0.58, corners: [[0, 0, 0], [1, 0, 0], [1, 0, 1], [0, 0, 1]] },
  { dir: [0, 0, 1], shade: 0.92, corners: [[0, 0, 1], [1, 0, 1], [1, 1, 1], [0, 1, 1]] },
  { dir: [0, 0, -1], shade: 0.92, corners: [[1, 0, 0], [0, 0, 0], [0, 1, 0], [1, 1, 0]] }
];

const chunkVertexMat = new THREE.MeshLambertMaterial({ vertexColors: true });

const blockIdMap = new Map(); // "x,y,z" -> blockId
const chunkMeshes = new Map(); // "cx,cz" -> THREE.Mesh
const dirtyChunks = new Set(); // "cx,cz"
const generatedChunks = new Set(); // "cx,cz"
const chunkQueue = [];
const queuedChunkKeys = new Set();

function keyOf(x, y, z) {
  return `${Math.round(x)},${Math.round(y)},${Math.round(z)}`;
}

function chunkKeyOf(cx, cz) {
  return `${cx},${cz}`;
}

function biomeAt(x, z) {
  if (Math.hypot(x, z - 6) < 18) return 'plains';
  const n = Math.sin(x * 0.022) * Math.cos(z * 0.022) + Math.sin((x - z) * 0.015) * 0.5;
  if (n > 0.45) return 'desert';
  if (n < -0.45) return 'snow';
  if (Math.sin(x * 0.018 + 2.1) * Math.cos(z * 0.018 - 1.2) > 0.72) return 'crimson';
  return 'plains';
}

function biomeLabel(b) {
  if (b === 'desert') return 'DESERT';
  if (b === 'snow') return 'SNOW TUNDRA';
  if (b === 'crimson') return 'CRIMSON HIGHLANDS';
  return 'PLAINS';
}

const VILLAGE_CENTERS = [
  { vx: 24, vz: -18 },
  { vx: -52, vz: 28 },
  { vx: 68, vz: 54 },
  { vx: -78, vz: -64 }
];

function getVillageAt(x, z) {
  for (const v of VILLAGE_CENTERS) {
    const dx = x - v.vx;
    const dz = z - v.vz;
    if (Math.abs(dx) <= 13 && Math.abs(dz) <= 13) return { v, dx, dz };
  }
  return null;
}

function surfaceHeightAt(x, z) {
  const vInfo = getVillageAt(x, z);
  const pond1 = Math.hypot(x + 6, z - 5);
  const pond2 = Math.hypot(x - 42, z + 38);
  const pondDip1 = pond1 < 5.2 ? Math.cos((pond1 / 5.2) * (Math.PI / 2)) * 2.4 : 0;
  const pondDip2 = pond2 < 6.5 ? Math.cos((pond2 / 6.5) * (Math.PI / 2)) * 2.6 : 0;
  const b = biomeAt(x, z);
  const amp = b === 'desert' ? 1.4 : b === 'snow' ? 3.2 : 2.5;
  const rawHills = Math.sin(x * 0.12) * Math.cos(z * 0.12) * amp + Math.sin((x + z) * 0.06) * 1.4;
  if (vInfo) return Math.max(WATER_LEVEL + 1, Math.round(rawHills * 0.15));
  return Math.round(rawHills - pondDip1 - pondDip2);
}

function isCaveAir(x, y, z) {
  if (y >= 0 || y <= CAVE_MIN_Y) return false;
  const t1 = Math.sin(x * 0.13 + y * 0.17) * Math.cos(z * 0.13 - y * 0.15);
  const t2 = Math.cos((x + z) * 0.09 + y * 0.21);
  const chamber = Math.sin(x * 0.06) * Math.sin(y * 0.11) * Math.cos(z * 0.06);
  return Math.abs(t1 + t2 * 0.65) < 0.23 || chamber > 0.68;
}

function oreAt(x, y, z) {
  if (y > -4) return null;
  const h = Math.abs(Math.sin(x * 37.1 + y * 91.7 + z * 53.3) * 19753.13) % 1;
  if (y <= -32 && h < 0.016) return 'diamond_ore';
  if (y <= -20 && h < 0.024) return 'gold_ore';
  if (y <= -8 && h < 0.036) return 'iron_ore';
  if (h < 0.045) return 'coal_ore';
  return null;
}

function getBlockAt(x, y, z) {
  const id = blockIdMap.get(keyOf(x, y, z));
  if (!id) return null;
  const def = ITEM_BY_ID.get(id);
  return def ? { blockId: id, solid: Boolean(def.solid) } : null;
}

function isSolidAt(x, y, z) {
  const entry = getBlockAt(x, y, z);
  return Boolean(entry && entry.solid);
}

function markChunkDirtyAt(gx, gz) {
  const cx = Math.floor(gx / CHUNK_SIZE);
  const cz = Math.floor(gz / CHUNK_SIZE);
  dirtyChunks.add(chunkKeyOf(cx, cz));
  if (gx - cx * CHUNK_SIZE === 0) dirtyChunks.add(chunkKeyOf(cx - 1, cz));
  if (gx - cx * CHUNK_SIZE === CHUNK_SIZE - 1) dirtyChunks.add(chunkKeyOf(cx + 1, cz));
  if (gz - cz * CHUNK_SIZE === 0) dirtyChunks.add(chunkKeyOf(cx, cz - 1));
  if (gz - cz * CHUNK_SIZE === CHUNK_SIZE - 1) dirtyChunks.add(chunkKeyOf(cx, cz + 1));
}

function setWorldBlock(x, y, z, itemDef, countPlacement = false) {
  if (!itemDef || itemDef.isTool || itemDef.id === 'stick') return;
  const gx = Math.round(x);
  const gy = Math.round(y);
  const gz = Math.round(z);
  blockIdMap.set(keyOf(gx, gy, gz), itemDef.id);
  markChunkDirtyAt(gx, gz);

  if (countPlacement) {
    placedCount += 1;
    placedCounterEl.textContent = `Placed: ${placedCount}`;
    if (placedCount % 10 === 0 && window.ArcadeQuests?.loadData && window.ArcadeQuests?.saveData) {
      const st = window.ArcadeQuests.loadData();
      st.xp = (Number(st.xp) || 0) + 15;
      st.coins = (Number(st.coins) || 0) + 5;
      window.ArcadeQuests.saveData(st);
    }
  }
}

function removeWorldBlockAt(gx, gy, gz, giveDrop = false) {
  const k = keyOf(gx, gy, gz);
  const prevId = blockIdMap.get(k);
  if (!prevId) return;
  blockIdMap.delete(k);
  markChunkDirtyAt(gx, gz);

  if (giveDrop && gamemode === 'survival') {
    const def = ITEM_BY_ID.get(prevId);
    const dropId = def?.dropId || prevId;
    if (ITEM_BY_ID.has(dropId) && dropId !== 'water') {
      addItemToSurvival(dropId, 1);
      syncHotbarUi();
    }
  }
}

function setGenBlock(x, y, z, itemId) {
  if (!ITEM_BY_ID.has(itemId)) return;
  blockIdMap.set(keyOf(x, y, z), itemId);
}

function buildChunkGeometry(cx, cz) {
  const positions = [];
  const normals = [];
  const colors = [];
  const indices = [];
  let vertCount = 0;

  const startX = cx * CHUNK_SIZE;
  const startZ = cz * CHUNK_SIZE;

  for (let y = CAVE_MIN_Y; y <= 14; y += 1) {
    for (let dz = 0; dz < CHUNK_SIZE; dz += 1) {
      for (let dx = 0; dx < CHUNK_SIZE; dx += 1) {
        const wx = startX + dx;
        const wz = startZ + dz;
        const blockId = blockIdMap.get(keyOf(wx, y, wz));
        if (!blockId) continue;

        const baseColor = getBlockColor(blockId);
        const isTransparent = blockId === 'water' || blockId === 'glass' || blockId === 'ice_block';

        for (const face of FACES) {
          const nx = wx + face.dir[0];
          const ny = y + face.dir[1];
          const nz = wz + face.dir[2];
          const neighborId = blockIdMap.get(keyOf(nx, ny, nz));

          if (neighborId) {
            if (!isTransparent) {
              const nTrans = neighborId === 'water' || neighborId === 'glass' || neighborId === 'ice_block' || neighborId === 'leaves';
              if (!nTrans) continue;
            } else if (neighborId === blockId) {
              continue;
            }
          }

          for (const c of face.corners) {
            positions.push(wx + c[0] - 0.5, y + c[1] - 0.5, wz + c[2] - 0.5);
            normals.push(face.dir[0], face.dir[1], face.dir[2]);
            colors.push(baseColor.r * face.shade, baseColor.g * face.shade, baseColor.b * face.shade);
          }

          indices.push(vertCount, vertCount + 1, vertCount + 2, vertCount, vertCount + 2, vertCount + 3);
          vertCount += 4;
        }
      }
    }
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
  geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  geo.setIndex(indices);
  return geo;
}

function rebuildChunkMesh(cx, cz) {
  const cKey = chunkKeyOf(cx, cz);
  const old = chunkMeshes.get(cKey);
  if (old) {
    scene.remove(old);
    old.geometry.dispose();
    chunkMeshes.delete(cKey);
  }
  const geo = buildChunkGeometry(cx, cz);
  const mesh = new THREE.Mesh(geo, chunkVertexMat);
  mesh.userData = { cx, cz };
  scene.add(mesh);
  chunkMeshes.set(cKey, mesh);
}

function generateChunkData(cx, cz) {
  const cKey = chunkKeyOf(cx, cz);
  queuedChunkKeys.delete(cKey);
  if (generatedChunks.has(cKey)) return;
  generatedChunks.add(cKey);

  const startX = cx * CHUNK_SIZE;
  const startZ = cz * CHUNK_SIZE;

  for (let dx = 0; dx < CHUNK_SIZE; dx += 1) {
    for (let dz = 0; dz < CHUNK_SIZE; dz += 1) {
      const x = startX + dx;
      const z = startZ + dz;
      if (Math.abs(x) > WORLD_MAX_COORD || Math.abs(z) > WORLD_MAX_COORD) continue;

      const b = biomeAt(x, z);
      const topY = surfaceHeightAt(x, z);
      const vInfo = getVillageAt(x, z);

      for (let y = CAVE_MIN_Y; y <= topY; y += 1) {
        if (y > CAVE_MIN_Y && y < topY && isCaveAir(x, y, z)) continue;

        if (y === topY && topY >= WATER_LEVEL) {
          if (vInfo && (Math.abs(vInfo.dx) <= 1 || Math.abs(vInfo.dz) <= 1)) {
            setGenBlock(x, y, z, b === 'desert' ? 'sandstone' : 'smooth_stone');
          } else if (b === 'desert') setGenBlock(x, y, z, 'sand');
          else if (b === 'snow') setGenBlock(x, y, z, 'snow_block');
          else if (b === 'crimson') setGenBlock(x, y, z, 'netherrack');
          else setGenBlock(x, y, z, 'grass');
        } else if (y >= topY - 2) {
          setGenBlock(x, y, z, b === 'desert' ? 'sandstone' : b === 'crimson' ? 'netherrack' : 'dirt');
        } else {
          setGenBlock(x, y, z, oreAt(x, y, z) || 'stone');
        }
      }

      if (topY < WATER_LEVEL) {
        for (let wy = topY + 1; wy <= WATER_LEVEL; wy += 1) {
          setGenBlock(x, wy, z, b === 'snow' ? 'ice_block' : 'water');
        }
      }

      if (vInfo) {
        const { dx: vx, dz: vz } = vInfo;
        const houses = [{ hx: -7, hz: -7 }, { hx: 5, hz: -7 }, { hx: -7, hz: 5 }, { hx: 5, hz: 5 }];
        for (const h of houses) {
          const rx = vx - h.hx;
          const rz = vz - h.hz;
          if (rx >= 0 && rx <= 4 && rz >= 0 && rz <= 4) {
            const floorY = surfaceHeightAt(x, z) + 1;
            const wallMat = b === 'desert' ? 'sandstone' : 'planks';
            const roofMat = b === 'desert' ? 'terracotta' : 'spruce_planks';
            setGenBlock(x, floorY - 1, z, wallMat);
            for (let wy = 0; wy < 3; wy += 1) {
              const isEdge = rx === 0 || rx === 4 || rz === 0 || rz === 4;
              const isDoor = rz === 4 && rx === 2 && wy < 2;
              const isWindow = wy === 1 && ((rx === 0 && rz === 2) || (rx === 4 && rz === 2));
              if (isEdge && !isDoor) {
                setGenBlock(x, floorY + wy, z, isWindow ? 'glass' : wy === 0 ? 'stone' : wallMat);
              }
            }
            for (let p = 0; p <= 2; p += 1) {
              if (rx >= p && rx <= 4 - p && rz >= 0 && rz <= 4) setGenBlock(x, floorY + 3 + p, z, roofMat);
            }
            if (rx === 2 && rz === 2) setGenBlock(x, floorY + 2, z, 'glowstone');
          }
        }
      } else {
        const treeHash = Math.abs(Math.sin(x * 12.9898 + z * 78.233) * 43758.5453) % 1;
        if (topY >= WATER_LEVEL && treeHash < 0.017 && Math.hypot(x, z) > 5) {
          const trunkTop = topY + 1;
          if (b === 'desert') {
            for (let dy = 0; dy < 3; dy += 1) setGenBlock(x, trunkTop + dy, z, 'wool_green');
          } else {
            const logId = b === 'snow' ? 'spruce_log' : b === 'crimson' ? 'birch_log' : 'wood';
            const leafId = b === 'snow' ? 'leaves' : b === 'crimson' ? 'wool_red' : 'leaves';
            for (let dy = 0; dy < 4; dy += 1) setGenBlock(x, trunkTop + dy, z, logId);
            for (let lx = -1; lx <= 1; lx += 1) {
              for (let lz = -1; lz <= 1; lz += 1) {
                for (let ly = 3; ly <= 4; ly += 1) {
                  if (lx === 0 && lz === 0 && ly < 4) continue;
                  setGenBlock(x + lx, trunkTop + ly, z + lz, leafId);
                }
              }
            }
          }
        }
      }
    }
  }

  dirtyChunks.add(cKey);
}

function enqueueNeededChunks(pcx, pcz) {
  for (let cx = pcx - VIEW_CHUNK_RADIUS; cx <= pcx + VIEW_CHUNK_RADIUS; cx += 1) {
    for (let cz = pcz - VIEW_CHUNK_RADIUS; cz <= pcz + VIEW_CHUNK_RADIUS; cz += 1) {
      const cKey = chunkKeyOf(cx, cz);
      if (!generatedChunks.has(cKey) && !queuedChunkKeys.has(cKey)) {
        queuedChunkKeys.add(cKey);
        chunkQueue.push([cx, cz]);
      }
    }
  }
}

function flushChunkWork(maxGen = 2, maxRebuild = 2) {
  let g = 0;
  while (g < maxGen && chunkQueue.length > 0) {
    const [cx, cz] = chunkQueue.shift();
    generateChunkData(cx, cz);
    g += 1;
  }

  let r = 0;
  for (const cKey of Array.from(dirtyChunks)) {
    if (r >= maxRebuild) break;
    dirtyChunks.delete(cKey);
    const [cx, cz] = cKey.split(',').map(Number);
    if (generatedChunks.has(cKey)) {
      rebuildChunkMesh(cx, cz);
      r += 1;
    }
  }
}

function updateChunksAroundPlayer(px, pz) {
  const pcx = Math.floor(px / CHUNK_SIZE);
  const pcz = Math.floor(pz / CHUNK_SIZE);
  enqueueNeededChunks(pcx, pcz);
  flushChunkWork(2, 2);

  for (const [cKey, mesh] of chunkMeshes.entries()) {
    const [cx, cz] = cKey.split(',').map(Number);
    if (Math.abs(cx - pcx) > VIEW_CHUNK_RADIUS + 1 || Math.abs(cz - pcz) > VIEW_CHUNK_RADIUS + 1) {
      scene.remove(mesh);
      mesh.geometry.dispose();
      chunkMeshes.delete(cKey);
    }
  }

  if (biomeBadgeEl) {
    biomeBadgeEl.textContent = `BIOME: ${biomeLabel(biomeAt(Math.round(px), Math.round(pz)))}`;
  }
}

// 2. Non-Cursed Minecraft Zombies & Skeletons (Shared Materials + Top-Joint Pivots)
const zombieFaceTex = makePixelTextureFromGrid(
  [
    'dgldgdlg',
    'gldggdlg',
    'gggggggg',
    'gddggddg',
    'geegeeeg',
    'ggdggdgg',
    'ggmmmmgg',
    'dgdggdgd'
  ],
  { g: '#557d44', d: '#436636', l: '#679453', e: '#1a1a1a', m: '#2c4223' }
).texture;

const skeletonFaceTex = makePixelTextureFromGrid(
  [
    'bbbbbbbb',
    'bsbbbbsb',
    'bbbbbbbb',
    'bbbbbbbb',
    'beebbeeb',
    'bbbnnbbs',
    'bnnnnnnb',
    'sbbbsbbs'
  ],
  { b: '#d6d6d6', s: '#b5b5b5', e: '#1c1c1c', n: '#4a4a4a' }
).texture;

const skeletonRibsTex = makePixelTextureFromGrid(
  [
    'sbbbbbbs',
    'bnnnnnnb',
    'sbbbbbbs',
    'bnnnnnnb',
    'sbbbbbbs',
    'bnnbbnnb',
    'ssbbbbss',
    'ssbbbbss'
  ],
  { b: '#d6d6d6', s: '#b5b5b5', n: '#4a4a4a' }
).texture;

const MOB_MATS = {
  zombieSkin: new THREE.MeshLambertMaterial({ color: 0x557d44 }),
  zombieFace: new THREE.MeshLambertMaterial({ map: zombieFaceTex }),
  zombieShirt: new THREE.MeshLambertMaterial({ color: 0x009999 }),
  zombiePants: new THREE.MeshLambertMaterial({ color: 0x3b3b8c }),
  skeletonBone: new THREE.MeshLambertMaterial({ color: 0xd6d6d6 }),
  skeletonFace: new THREE.MeshLambertMaterial({ map: skeletonFaceTex }),
  skeletonRibs: new THREE.MeshLambertMaterial({ map: skeletonRibsTex }),
  bowWood: new THREE.MeshLambertMaterial({ color: 0x6b4423 }),
  bowString: new THREE.MeshLambertMaterial({ color: 0xdddddd })
};

function makeMobHead(size, frontMat, sideMat) {
  return new THREE.Mesh(new THREE.BoxGeometry(size, size, size), [
    sideMat,
    sideMat,
    sideMat,
    sideMat,
    frontMat,
    sideMat
  ]);
}

function makeMobLimb(w, h, d, mat) {
  const pivot = new THREE.Group();
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  mesh.position.y = -h / 2;
  pivot.add(mesh);
  return pivot;
}

function createZombieMesh() {
  const root = new THREE.Group();
  const leftLeg = makeMobLimb(4 * PX, 12 * PX, 4 * PX, MOB_MATS.zombiePants);
  leftLeg.position.set(-2 * PX, 12 * PX, 0);
  const rightLeg = makeMobLimb(4 * PX, 12 * PX, 4 * PX, MOB_MATS.zombiePants);
  rightLeg.position.set(2 * PX, 12 * PX, 0);

  const torso = new THREE.Mesh(new THREE.BoxGeometry(8 * PX, 12 * PX, 4 * PX), MOB_MATS.zombieShirt);
  torso.position.y = 18 * PX;

  const head = makeMobHead(8 * PX, MOB_MATS.zombieFace, MOB_MATS.zombieSkin);
  head.position.y = 28 * PX;

  const leftArm = makeMobLimb(4 * PX, 12 * PX, 4 * PX, MOB_MATS.zombieSkin);
  leftArm.position.set(-6 * PX, 22 * PX, 0);
  leftArm.rotation.x = -Math.PI / 2;

  const rightArm = makeMobLimb(4 * PX, 12 * PX, 4 * PX, MOB_MATS.zombieSkin);
  rightArm.position.set(6 * PX, 22 * PX, 0);
  rightArm.rotation.x = -Math.PI / 2;

  root.add(leftLeg, rightLeg, torso, head, leftArm, rightArm);
  root.userData = { type: 'zombie', leftLeg, rightLeg, leftArm, rightArm, walkTime: 0 };
  return root;
}

function createSkeletonMesh() {
  const root = new THREE.Group();
  const leftLeg = makeMobLimb(2 * PX, 12 * PX, 2 * PX, MOB_MATS.skeletonBone);
  leftLeg.position.set(-2 * PX, 12 * PX, 0);
  const rightLeg = makeMobLimb(2 * PX, 12 * PX, 2 * PX, MOB_MATS.skeletonBone);
  rightLeg.position.set(2 * PX, 12 * PX, 0);

  const torso = new THREE.Mesh(new THREE.BoxGeometry(8 * PX, 12 * PX, 4 * PX), [
    MOB_MATS.skeletonBone,
    MOB_MATS.skeletonBone,
    MOB_MATS.skeletonBone,
    MOB_MATS.skeletonBone,
    MOB_MATS.skeletonRibs,
    MOB_MATS.skeletonRibs
  ]);
  torso.position.y = 18 * PX;

  const head = makeMobHead(8 * PX, MOB_MATS.skeletonFace, MOB_MATS.skeletonBone);
  head.position.y = 28 * PX;

  const leftArm = makeMobLimb(2 * PX, 12 * PX, 2 * PX, MOB_MATS.skeletonBone);
  leftArm.position.set(-5 * PX, 22 * PX, 0);
  leftArm.rotation.x = -Math.PI / 2.2;
  leftArm.rotation.z = -0.15;

  const rightArm = makeMobLimb(2 * PX, 12 * PX, 2 * PX, MOB_MATS.skeletonBone);
  rightArm.position.set(5 * PX, 22 * PX, 0);
  rightArm.rotation.x = -Math.PI / 2;

  const bow = new THREE.Group();
  const bowTop = new THREE.Mesh(new THREE.BoxGeometry(1 * PX, 6 * PX, 1.5 * PX), MOB_MATS.bowWood);
  bowTop.position.set(0, 3 * PX, 1 * PX);
  bowTop.rotation.x = 0.25;
  const bowBot = new THREE.Mesh(new THREE.BoxGeometry(1 * PX, 6 * PX, 1.5 * PX), MOB_MATS.bowWood);
  bowBot.position.set(0, -3 * PX, 1 * PX);
  bowBot.rotation.x = -0.25;
  const bowStr = new THREE.Mesh(new THREE.BoxGeometry(0.4 * PX, 11 * PX, 0.4 * PX), MOB_MATS.bowString);
  bowStr.position.set(0, 0, -0.5 * PX);
  bow.add(bowTop, bowBot, bowStr);
  bow.position.set(0, -10 * PX, 2 * PX);
  bow.rotation.x = Math.PI / 2;
  rightArm.add(bow);

  root.add(leftLeg, rightLeg, torso, head, leftArm, rightArm);
  root.userData = { type: 'skeleton', leftLeg, rightLeg, leftArm, rightArm, walkTime: 0 };
  return root;
}

function animateMobLimbs(mob, dt, isMoving) {
  const u = mob.userData;
  if (!isMoving) {
    u.leftLeg.rotation.x *= 0.85;
    u.rightLeg.rotation.x *= 0.85;
    return;
  }
  u.walkTime += dt * 7;
  const swing = Math.sin(u.walkTime) * 0.6;
  u.leftLeg.rotation.x = swing;
  u.rightLeg.rotation.x = -swing;
  if (u.type === 'zombie') {
    const bob = Math.sin(u.walkTime * 0.5) * 0.08;
    u.leftArm.rotation.x = -Math.PI / 2 + bob;
    u.rightArm.rotation.x = -Math.PI / 2 - bob;
  }
}

const mobs = [];
const arrows = [];
let mobSpawnTimer = 0;
const arrowGeo = new THREE.BoxGeometry(0.08, 0.08, 0.65);
const arrowMat = new THREE.MeshBasicMaterial({ color: 0xfde047 });

function spawnNightMob() {
  if (!isNightTime() || mobs.length >= 10) return;
  const angle = Math.random() * Math.PI * 2;
  const dist = 12 + Math.random() * 10;
  const sx = Math.max(-WORLD_MAX_COORD + 4, Math.min(WORLD_MAX_COORD - 4, player.pos.x + Math.cos(angle) * dist));
  const sz = Math.max(-WORLD_MAX_COORD + 4, Math.min(WORLD_MAX_COORD - 4, player.pos.z + Math.sin(angle) * dist));
  const sy = surfaceHeightAt(Math.round(sx), Math.round(sz)) + 0.5;

  const kind = Math.random() < 0.52 ? 'zombie' : 'skeleton';
  const mesh = kind === 'zombie' ? createZombieMesh() : createSkeletonMesh();
  mesh.position.set(sx, sy, sz);
  scene.add(mesh);

  mobs.push({ kind, mesh, hp: 14, attackCooldown: 1.2 + Math.random() });
}

function fireSkeletonArrow(mob) {
  const origin = mob.mesh.position.clone();
  origin.y += 1.35;
  const target = player.pos.clone();
  target.y -= 0.2;
  const dir = target.sub(origin);
  const dist = Math.max(1, dir.length());
  dir.normalize();

  const arrowMesh = new THREE.Mesh(arrowGeo, arrowMat);
  arrowMesh.position.copy(origin);
  arrowMesh.lookAt(origin.clone().add(dir));
  scene.add(arrowMesh);

  arrows.push({
    mesh: arrowMesh,
    vel: dir.multiplyScalar(14.5),
    life: Math.min(3.5, dist / 14.5 + 0.6)
  });
}

function removeMobAt(idx) {
  const m = mobs[idx];
  if (!m) return;
  scene.remove(m.mesh);
  mobs.splice(idx, 1);
}

function damagePlayer(amount, sourceLabel) {
  if (gamemode !== 'survival') return;
  playerHp -= amount;
  updateHpBadge();
  playTone(130, 0.14, 'sawtooth', 0.08);
  if (playerHp <= 0) {
    playerHp = 20;
    updateHpBadge();
    player.pos.set(0, surfaceHeightAt(0, 6) + 2.7, 6);
    player.vel.set(0, 0, 0);
    if (!keepInventory) {
      placedCount = 0;
      placedCounterEl.textContent = 'Placed: 0';
      appendChat(`${username} was slain by ${sourceLabel}! keep_inventory is false: progress reset.`, 'warn');
    } else {
      appendChat(`${username} was slain by ${sourceLabel}! Respawned with keep_inventory true.`, 'warn');
    }
  }
}

function updateDayNightAndMobs(dt) {
  dayPhase = (dayPhase + dt / CYCLE_SECONDS) % 1;
  const night = isNightTime();

  const sunAngle = (dayPhase - 0.25) * Math.PI * 2;
  const sunHeight = Math.sin(sunAngle);
  const sunX = player.pos.x + Math.cos(sunAngle) * 58;
  const sunY = player.pos.y + Math.sin(sunAngle) * 58;
  const sunZ = player.pos.z + 18;

  dirLight.position.set(player.pos.x + Math.cos(sunAngle) * 22, Math.max(8, sunHeight * 32 + 12), player.pos.z + 12);
  sunDisc.position.set(sunX, sunY, sunZ);
  moonDisc.position.set(player.pos.x - Math.cos(sunAngle) * 58, player.pos.y - Math.sin(sunAngle) * 58, sunZ);
  starField.position.copy(player.pos);
  starMat.opacity = night ? Math.min(0.9, starMat.opacity + dt * 0.8) : Math.max(0, starMat.opacity - dt * 0.8);

  if (sunHeight > 0.2) {
    scene.background.lerp(daySky, dt * 1.5);
    dirLight.intensity = 1.15;
    hemiLight.intensity = 0.9;
  } else if (sunHeight > -0.2) {
    scene.background.lerp(duskSky, dt * 1.5);
    dirLight.intensity = 0.65;
    hemiLight.intensity = 0.55;
  } else {
    scene.background.lerp(nightSky, dt * 1.5);
    dirLight.intensity = 0.22;
    hemiLight.intensity = 0.35;
  }
  scene.fog.color.copy(scene.background);

  const totalMinutes = Math.floor(dayPhase * 24 * 60);
  const hh = String(Math.floor(totalMinutes / 60)).padStart(2, '0');
  const mm = String(totalMinutes % 60).padStart(2, '0');
  if (timeBadgeEl) {
    timeBadgeEl.textContent = `${night ? 'NIGHT' : 'DAY'} (${hh}:${mm})`;
    timeBadgeEl.classList.toggle('night', night);
  }

  if (night && !wasNight) appendChat('Night has fallen! Zombies and Skeletons with bows are spawning...', 'warn');
  else if (!night && wasNight) appendChat('Dawn breaks! Daylight burns Zombies and Skeletons!', 'cmd');
  wasNight = night;

  if (night && gamemode === 'survival') {
    mobSpawnTimer -= dt;
    if (mobSpawnTimer <= 0) {
      spawnNightMob();
      mobSpawnTimer = 3.6;
    }
  }

  for (let i = mobs.length - 1; i >= 0; i -= 1) {
    const m = mobs[i];
    const pos = m.mesh.position;
    const distToPlayer = Math.hypot(player.pos.x - pos.x, player.pos.z - pos.z);
    if (distToPlayer > 52) {
      removeMobAt(i);
      continue;
    }

    if (!night) {
      m.hp -= 5.5 * dt;
      m.mesh.rotation.z = Math.sin(performance.now() * 0.04) * 0.08;
      if (m.hp <= 0) {
        removeMobAt(i);
        continue;
      }
    } else {
      m.mesh.rotation.z = 0;
    }

    const toPlayerX = player.pos.x - pos.x;
    const toPlayerZ = player.pos.z - pos.z;
    m.mesh.rotation.y = Math.atan2(toPlayerX, toPlayerZ);
    m.attackCooldown -= dt;

    let moving = false;
    if (m.kind === 'zombie') {
      if (distToPlayer > 1.35) {
        const speed = 3.1;
        pos.x += (toPlayerX / distToPlayer) * speed * dt;
        pos.z += (toPlayerZ / distToPlayer) * speed * dt;
        moving = true;
      } else if (m.attackCooldown <= 0 && night) {
        m.attackCooldown = 1.15;
        damagePlayer(3, 'Zombie');
      }
    } else {
      if (distToPlayer > 10.5) {
        const speed = 2.5;
        pos.x += (toPlayerX / distToPlayer) * speed * dt;
        pos.z += (toPlayerZ / distToPlayer) * speed * dt;
        moving = true;
      } else if (distToPlayer < 4.5) {
        const speed = 2.0;
        pos.x -= (toPlayerX / distToPlayer) * speed * dt;
        pos.z -= (toPlayerZ / distToPlayer) * speed * dt;
        moving = true;
      }
      if (distToPlayer <= 15 && m.attackCooldown <= 0 && night) {
        m.attackCooldown = 2.1;
        fireSkeletonArrow(m);
      }
    }

    pos.y = surfaceHeightAt(Math.round(pos.x), Math.round(pos.z)) + 0.5;
    animateMobLimbs(m.mesh, dt, moving);
  }

  for (let i = arrows.length - 1; i >= 0; i -= 1) {
    const ar = arrows[i];
    ar.life -= dt;
    ar.vel.y -= 9.8 * dt;
    ar.mesh.position.addScaledVector(ar.vel, dt);

    const hitPlayer = ar.mesh.position.distanceTo(new THREE.Vector3(player.pos.x, player.pos.y - 0.4, player.pos.z)) < 0.85;
    if (hitPlayer) {
      damagePlayer(3.5, 'Skeleton Bow');
      scene.remove(ar.mesh);
      arrows.splice(i, 1);
      continue;
    }
    if (ar.life <= 0 || ar.mesh.position.y < CAVE_MIN_Y) {
      scene.remove(ar.mesh);
      arrows.splice(i, 1);
    }
  }
}

// Player & Physics
const spawnY = surfaceHeightAt(0, 6) + 2.7;
const player = {
  pos: new THREE.Vector3(0, spawnY, 6),
  vel: new THREE.Vector3(0, 0, 0),
  yaw: 0,
  pitch: 0,
  eyeHeight: 1.65,
  onGround: false,
  walkPhase: 0
};

const keys = new Set();
let jumpBuffer = 0;

function requestLock() {
  ensureAudio();
  if (!creativeModalEl.classList.contains('hidden') || !survivalModalEl.classList.contains('hidden')) return;
  if (document.pointerLockElement !== canvas) canvas.requestPointerLock?.();
}

document.getElementById('btnEnterLock').addEventListener('click', requestLock);
document.getElementById('btnOverlayStart').addEventListener('click', requestLock);

document.addEventListener('pointerlockchange', () => {
  const locked = document.pointerLockElement === canvas;
  const modalOpen = !creativeModalEl.classList.contains('hidden') || !survivalModalEl.classList.contains('hidden');
  overlay.classList.toggle('hidden', locked || modalOpen);
  if (!locked) {
    selectionBox.visible = false;
    resetMiningProgress();
  }
});

window.addEventListener('mousemove', (e) => {
  if (document.pointerLockElement !== canvas) return;
  const sens = 0.0022;
  player.yaw -= e.movementX * sens;
  player.pitch = Math.max(-Math.PI / 2 + 0.05, Math.min(Math.PI / 2 - 0.05, player.pitch - e.movementY * sens));
});

window.addEventListener('keydown', (e) => {
  if (e.repeat) return;
  if (e.key === 'Escape') {
    if (!creativeModalEl.classList.contains('hidden') || !survivalModalEl.classList.contains('hidden')) {
      closeModals();
      return;
    }
    if (document.activeElement === chatInputEl) {
      chatInputEl.blur();
      return;
    }
  }
  if (document.activeElement === chatInputEl || document.activeElement === creativeSearchEl) return;

  ensureAudio();
  if (e.key === 't' || e.key === 'T') {
    e.preventDefault();
    openChatInput('');
    return;
  }
  if (e.key === '/') {
    e.preventDefault();
    openChatInput('/');
    return;
  }
  if (e.key === 'e' || e.key === 'E') {
    e.preventDefault();
    const isOpen = !creativeModalEl.classList.contains('hidden') || !survivalModalEl.classList.contains('hidden');
    if (isOpen) closeModals();
    else openInventoryForMode();
    return;
  }
  if (e.key === 'm' || e.key === 'M') {
    toggleSound();
    return;
  }
  if (e.key >= '1' && e.key <= '8') {
    selectSlot(Number(e.key) - 1);
    return;
  }
  if (e.code === 'Space') {
    e.preventDefault();
    jumpBuffer = 0.14;
  }
  keys.add(e.code);
});

window.addEventListener('keyup', (e) => keys.delete(e.code));

window.addEventListener('wheel', (e) => {
  if (document.pointerLockElement !== canvas) return;
  selectSlot(selectedSlot + (e.deltaY > 0 ? 1 : -1));
}, { passive: true });

// Fast Voxel DDA Raycast (Zero Scene Mesh Raycast Overhead)
let holdingRightBreak = false;
let holdingLeftToolMine = false;
let miningKey = null;
let miningProgress = 0;
let miningTickSound = 0;

function triggerSwing() {
  swingTimer = 0.22;
}

function resetMiningProgress() {
  miningKey = null;
  miningProgress = 0;
  miningTickSound = 0;
  crackMesh.visible = false;
  crackMat.opacity = 0;
}

function raycastVoxel(maxDist = 7.5) {
  const dir = new THREE.Vector3(
    -Math.sin(player.yaw) * Math.cos(player.pitch),
    Math.sin(player.pitch),
    -Math.cos(player.yaw) * Math.cos(player.pitch)
  ).normalize();

  const step = 0.06;
  let prevX = Math.round(player.pos.x);
  let prevY = Math.round(player.pos.y);
  let prevZ = Math.round(player.pos.z);

  for (let d = 0.2; d <= maxDist; d += step) {
    const wx = player.pos.x + dir.x * d;
    const wy = player.pos.y + dir.y * d;
    const wz = player.pos.z + dir.z * d;
    const gx = Math.round(wx);
    const gy = Math.round(wy);
    const gz = Math.round(wz);

    const entry = getBlockAt(gx, gy, gz);
    if (entry && entry.blockId !== 'water') {
      return {
        gx,
        gy,
        gz,
        blockId: entry.blockId,
        normal: {
          x: Math.max(-1, Math.min(1, prevX - gx)),
          y: Math.max(-1, Math.min(1, prevY - gy)),
          z: Math.max(-1, Math.min(1, prevZ - gz))
        }
      };
    }
    prevX = gx;
    prevY = gy;
    prevZ = gz;
  }
  return null;
}

function computeBreakRate(blockId, heldItem) {
  const bDef = ITEM_BY_ID.get(blockId);
  const hardness = Math.max(0.25, bDef?.hardness ?? 1.0);
  let rate = 1.0 / hardness;
  if (heldItem?.isTool) {
    const favored = heldItem.favored?.includes(blockId);
    rate *= favored ? heldItem.speed * 1.45 : heldItem.speed * 0.75;
  }
  return rate;
}

function updateGradualMining(dt, hit) {
  if (document.pointerLockElement !== canvas || gamemode === 'creative') {
    resetMiningProgress();
    return;
  }
  const bar = getActiveHotbar();
  const heldItem = bar[selectedSlot] ? ITEM_BY_ID.get(bar[selectedSlot].id) : null;
  const wantsMine = holdingRightBreak || (holdingLeftToolMine && Boolean(heldItem?.isTool));

  if (!wantsMine || !hit) {
    resetMiningProgress();
    return;
  }

  const currentKey = keyOf(hit.gx, hit.gy, hit.gz);
  if (currentKey !== miningKey) {
    miningKey = currentKey;
    miningProgress = 0;
    miningTickSound = 0;
  }

  miningProgress += computeBreakRate(hit.blockId, heldItem) * dt;
  crackMesh.position.set(hit.gx, hit.gy, hit.gz);
  crackMesh.visible = true;
  crackMat.opacity = Math.min(0.65, miningProgress * 0.62);

  miningTickSound -= dt;
  if (miningTickSound <= 0) {
    miningTickSound = 0.22;
    playTone(170 + miningProgress * 120, 0.04, 'triangle', 0.03);
  }

  if (miningProgress >= 1) {
    removeWorldBlockAt(hit.gx, hit.gy, hit.gz, true);
    playTone(230, 0.08, 'sawtooth', 0.06);
    resetMiningProgress();
  }
}

function tryAttackMob() {
  const forward = new THREE.Vector3(
    -Math.sin(player.yaw) * Math.cos(player.pitch),
    Math.sin(player.pitch),
    -Math.cos(player.yaw) * Math.cos(player.pitch)
  ).normalize();
  const bar = getActiveHotbar();
  const heldItem = bar[selectedSlot] ? ITEM_BY_ID.get(bar[selectedSlot].id) : null;
  const dmg = heldItem?.toolKind === 'sword' ? 8 : heldItem?.isTool ? 5 : 3.5;

  for (let i = mobs.length - 1; i >= 0; i -= 1) {
    const m = mobs[i];
    const mobCenter = m.mesh.position.clone().add(new THREE.Vector3(0, 1.0, 0));
    const toMob = mobCenter.clone().sub(player.pos);
    if (toMob.length() <= 4.2 && toMob.normalize().dot(forward) > 0.78) {
      m.hp -= dmg;
      playTone(620, 0.06, 'square', 0.05);
      if (m.hp <= 0) {
        removeMobAt(i);
        appendChat(`Defeated a ${m.kind}!`, 'cmd');
      }
      return true;
    }
  }
  return false;
}

function updateSelectionOutline() {
  if (document.pointerLockElement !== canvas) {
    selectionBox.visible = false;
    return null;
  }
  const hit = raycastVoxel(7.5);
  if (!hit) {
    selectionBox.visible = false;
    return null;
  }
  selectionBox.position.set(hit.gx, hit.gy, hit.gz);
  selectionBox.visible = true;
  return hit;
}

canvas.addEventListener('contextmenu', (e) => e.preventDefault());

canvas.addEventListener('mousedown', (e) => {
  if (document.pointerLockElement !== canvas) return;
  triggerSwing();

  const bar = getActiveHotbar();
  const heldItem = bar[selectedSlot] ? ITEM_BY_ID.get(bar[selectedSlot].id) : null;

  if (e.button === 0) {
    if (tryAttackMob()) return;
    if (heldItem?.isTool) {
      if (gamemode === 'creative') {
        const hit = raycastVoxel(7.5);
        if (hit) {
          removeWorldBlockAt(hit.gx, hit.gy, hit.gz, false);
          playTone(250, 0.07, 'square', 0.055);
        }
      } else {
        holdingLeftToolMine = true;
      }
      return;
    }

    const hit = raycastVoxel(7.5);
    if (!hit || !heldItem || heldItem.isTool || heldItem.id === 'stick' || !heldItem.solid) return;

    const gx = hit.gx + hit.normal.x;
    const gy = hit.gy + hit.normal.y;
    const gz = hit.gz + hit.normal.z;

    const px = Math.round(player.pos.x);
    const pz = Math.round(player.pos.z);
    const pyFeet = Math.round(player.pos.y - player.eyeHeight);
    const pyHead = Math.round(player.pos.y);
    const insidePlayer = gx === px && gz === pz && (gy === pyFeet || gy === pyHead);

    if (!insidePlayer && consumeSelectedSurvivalBlock()) {
      setWorldBlock(gx, gy, gz, heldItem, gamemode === 'survival');
      playTone(520, 0.07, 'triangle', 0.06);
      syncHotbarUi();
    }
  } else if (e.button === 2) {
    if (gamemode === 'creative') {
      const hit = raycastVoxel(7.5);
      if (hit) {
        removeWorldBlockAt(hit.gx, hit.gy, hit.gz, false);
        playTone(190, 0.08, 'sawtooth', 0.055);
      }
    } else {
      holdingRightBreak = true;
    }
  }
});

window.addEventListener('mouseup', (e) => {
  if (e.button === 0) holdingLeftToolMine = false;
  if (e.button === 2) holdingRightBreak = false;
  if (!holdingLeftToolMine && !holdingRightBreak) resetMiningProgress();
});

function stepPhysics(dt) {
  if (jumpBuffer > 0) jumpBuffer = Math.max(0, jumpBuffer - dt);
  if (swingTimer > 0) swingTimer = Math.max(0, swingTimer - dt);

  const forward = new THREE.Vector3(-Math.sin(player.yaw), 0, -Math.cos(player.yaw));
  const right = new THREE.Vector3(Math.cos(player.yaw), 0, -Math.sin(player.yaw));
  const wish = new THREE.Vector3();

  if (keys.has('KeyW') || keys.has('ArrowUp')) wish.add(forward);
  if (keys.has('KeyS') || keys.has('ArrowDown')) wish.sub(forward);
  if (keys.has('KeyD') || keys.has('ArrowRight')) wish.add(right);
  if (keys.has('KeyA') || keys.has('ArrowLeft')) wish.sub(right);
  if (wish.lengthSq() > 0) wish.normalize();

  const moveSpeed = gamemode === 'creative' ? 8.5 : 6.2;
  player.vel.x = wish.x * moveSpeed;
  player.vel.z = wish.z * moveSpeed;

  const horizSpeed = Math.hypot(player.vel.x, player.vel.z);
  if (player.onGround && horizSpeed > 0.2) player.walkPhase += dt * horizSpeed * 1.65;
  else player.walkPhase += dt * 1.4;

  if (jumpBuffer > 0 && player.onGround) {
    player.vel.y = 7.4;
    player.onGround = false;
    jumpBuffer = 0;
    playTone(360, 0.09, 'square', 0.045);
  }

  player.vel.y -= 19.5 * dt;

  const nextX = Math.max(-WORLD_MAX_COORD + 1, Math.min(WORLD_MAX_COORD - 1, player.pos.x + player.vel.x * dt));
  const feetY = Math.floor(player.pos.y - player.eyeHeight + 0.1);
  const headY = Math.floor(player.pos.y - 0.1);
  const checkX = Math.round(nextX + Math.sign(player.vel.x) * 0.32);
  const checkZ = Math.round(player.pos.z);
  if (!isSolidAt(checkX, feetY, checkZ) && !isSolidAt(checkX, headY, checkZ)) player.pos.x = nextX;

  const nextZ = Math.max(-WORLD_MAX_COORD + 1, Math.min(WORLD_MAX_COORD - 1, player.pos.z + player.vel.z * dt));
  const checkX2 = Math.round(player.pos.x);
  const checkZ2 = Math.round(nextZ + Math.sign(player.vel.z) * 0.32);
  if (!isSolidAt(checkX2, feetY, checkZ2) && !isSolidAt(checkX2, headY, checkZ2)) player.pos.z = nextZ;

  const nextY = player.pos.y + player.vel.y * dt;
  const supportY = Math.floor(nextY - player.eyeHeight);
  if (player.vel.y <= 0 && isSolidAt(Math.round(player.pos.x), supportY, Math.round(player.pos.z))) {
    player.pos.y = supportY + 1 + player.eyeHeight;
    player.vel.y = 0;
    player.onGround = true;
  } else {
    player.pos.y = nextY;
    player.onGround = false;
  }

  if (player.pos.y < CAVE_MIN_Y - 8) {
    player.pos.set(0, spawnY, 6);
    player.vel.set(0, 0, 0);
    if (!keepInventory) {
      placedCount = 0;
      placedCounterEl.textContent = 'Placed: 0';
    }
  }

  updateChunksAroundPlayer(player.pos.x, player.pos.z);
  updateDayNightAndMobs(dt);

  const bobY = player.onGround && horizSpeed > 0.2 ? Math.sin(player.walkPhase * 2) * 0.045 : 0;
  camera.position.set(player.pos.x, player.pos.y + bobY, player.pos.z);
  camera.quaternion.setFromEuler(new THREE.Euler(player.pitch, player.yaw, 0, 'YXZ'));

  const swingOffset = swingTimer > 0 ? Math.sin((1 - swingTimer / 0.22) * Math.PI) : 0;
  heldPivot.position.set(
    0.38 - swingOffset * 0.12,
    -0.32 + Math.sin(player.walkPhase) * 0.015 - swingOffset * 0.1,
    -0.56 - swingOffset * 0.14
  );
  heldPivot.rotation.set(swingOffset * 0.75, swingOffset * 0.35, -swingOffset * 0.45);

  const hit = updateSelectionOutline();
  updateGradualMining(dt, hit);
}

// Initial Spawn Chunk Build
updateChunksAroundPlayer(player.pos.x, player.pos.z);
flushChunkWork(25, 25);
syncModeHud();
appendChat('Chunk face-culling & Minecraft mob rigs active!', 'cmd');

let lastTime = performance.now();
function animate(now) {
  const dt = Math.min(0.05, Math.max(0.001, (now - lastTime) / 1000));
  lastTime = now;

  stepPhysics(dt);
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.25));
});

requestAnimationFrame(animate);