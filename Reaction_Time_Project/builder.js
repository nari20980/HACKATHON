import * as THREE from 'https://unpkg.com/three@0.169.0/build/three.module.js';

// Max tool rarity is strictly capped at Diamond ('wood', 'stone', 'iron', 'diamond')
const TOOL_TIERS = [
  { id: 'wood', label: 'Wooden', materialId: 'planks', color: '#b88b4e', speed: 1.35 },
  { id: 'stone', label: 'Stone', materialId: 'stone', color: '#9ca3af', speed: 1.75 },
  { id: 'iron', label: 'Iron', materialId: 'iron_block', color: '#e2e8f0', speed: 2.25 },
  { id: 'diamond', label: 'Diamond', materialId: 'diamond_block', color: '#22d3ee', speed: 2.9 }
];

const TOOL_TYPES = [
  { id: 'pickaxe', label: 'Pickaxe', favored: ['stone', 'smooth_stone', 'coal_ore', 'iron_ore', 'gold_ore', 'diamond_ore', 'obsidian', 'brick'] },
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
  { id: 'grass', name: 'Grass Block', style: 'grass', solid: true, dropId: 'dirt' },
  { id: 'dirt', name: 'Dirt', style: 'noise', base: '#7c5332', dark: '#5d3c22', light: '#966742', solid: true },
  { id: 'stone', name: 'Cobblestone', style: 'stone', base: '#7a7d82', accent: '#93979e', border: '#3f4146', solid: true },
  { id: 'wood', name: 'Oak Log', style: 'log', base: '#65492b', dark: '#4d361e', top: '#b9935a', solid: true },
  { id: 'planks', name: 'Oak Planks', style: 'planks', base: '#b88b4e', seam: '#6c4d26', solid: true },
  { id: 'leaves', name: 'Oak Leaves', style: 'noise', base: '#368023', dark: '#255c17', light: '#4da134', solid: true },
  { id: 'glass', name: 'Glass', style: 'glass', stroke: '#dbf4ff', solid: true, transparent: true, opacity: 0.72 },
  { id: 'water', name: 'Water', style: 'water', base: '#2582e0', ripple: '#6ec8ff', solid: false, transparent: true, opacity: 0.76 },

  { id: 'stick', name: 'Stick', style: 'stick', base: '#b88b4e', solid: false },
  { id: 'smooth_stone', name: 'Smooth Stone', style: 'noise', base: '#8c8f94', dark: '#73767b', light: '#a3a6ab', solid: true, dropId: 'stone' },
  { id: 'sand', name: 'Sand', style: 'noise', base: '#dcc488', dark: '#c2a86b', light: '#efe0b4', solid: true },
  { id: 'sandstone', name: 'Sandstone', style: 'planks', base: '#d2b878', seam: '#9e854b', solid: true },
  { id: 'brick', name: 'Red Brick', style: 'brick', base: '#9e4332', mortar: '#c4b8a8', solid: true },
  { id: 'birch_log', name: 'Birch Log', style: 'log', base: '#e2dfd7', dark: '#383530', top: '#d6c7a5', solid: true },
  { id: 'birch_planks', name: 'Birch Planks', style: 'planks', base: '#dfc78e', seam: '#967e49', solid: true },
  { id: 'spruce_log', name: 'Spruce Log', style: 'log', base: '#4a311d', dark: '#322012', top: '#8c6643', solid: true },
  { id: 'spruce_planks', name: 'Spruce Planks', style: 'planks', base: '#7d5635', seam: '#472f1b', solid: true },

  { id: 'gold_block', name: 'Gold Block', style: 'metal', base: '#f5c518', hi: '#fff078', lo: '#b88b00', solid: true },
  { id: 'iron_block', name: 'Iron Block', style: 'metal', base: '#cbd5e1', hi: '#f1f5f9', lo: '#64748b', solid: true },
  { id: 'diamond_block', name: 'Diamond Block', style: 'metal', base: '#22d3ee', hi: '#a5f3fc', lo: '#0284c7', solid: true },
  { id: 'emerald_block', name: 'Emerald Block', style: 'metal', base: '#10b981', hi: '#6ee7b7', lo: '#047857', solid: true },
  { id: 'amethyst_block', name: 'Amethyst Block', style: 'metal', base: '#a855f7', hi: '#e9d5ff', lo: '#6b21a8', solid: true },
  { id: 'copper_block', name: 'Copper Block', style: 'metal', base: '#c26d47', hi: '#eb9a75', lo: '#7c3b1e', solid: true },
  { id: 'coal_ore', name: 'Coal Ore', style: 'ore', stone: '#7a7d82', spot: '#1e293b', solid: true },
  { id: 'iron_ore', name: 'Iron Ore', style: 'ore', stone: '#7a7d82', spot: '#d6b496', solid: true },

  { id: 'gold_ore', name: 'Gold Ore', style: 'ore', stone: '#7a7d82', spot: '#facc15', solid: true },
  { id: 'diamond_ore', name: 'Diamond Ore', style: 'ore', stone: '#7a7d82', spot: '#38bdf8', solid: true },
  { id: 'obsidian', name: 'Obsidian', style: 'noise', base: '#1b1629', dark: '#0f0b1a', light: '#3b2d5c', solid: true },
  { id: 'netherrack', name: 'Crimson Stone', style: 'noise', base: '#7f2323', dark: '#541414', light: '#a83636', solid: true },
  { id: 'glowstone', name: 'Glowstone', style: 'noise', base: '#f59e0b', dark: '#b45309', light: '#fef08a', solid: true },
  { id: 'sea_lantern', name: 'Sea Lantern', style: 'tile', base: '#67e8f9', inner: '#ecfeff', border: '#0891b2', solid: true },
  { id: 'redstone_block', name: 'Ruby Block', style: 'tile', base: '#dc2626', inner: '#fca5a5', border: '#7f1d1d', solid: true },
  { id: 'lapis_block', name: 'Sapphire Block', style: 'tile', base: '#2563eb', inner: '#93c5fd', border: '#1e3a8a', solid: true },

  { id: 'wool_white', name: 'White Wool', style: 'noise', base: '#f1f5f9', dark: '#cbd5e1', light: '#ffffff', solid: true },
  { id: 'wool_red', name: 'Red Wool', style: 'noise', base: '#ef4444', dark: '#b91c1c', light: '#fca5a5', solid: true },
  { id: 'wool_blue', name: 'Blue Wool', style: 'noise', base: '#3b82f6', dark: '#1d4ed8', light: '#93c5fd', solid: true },
  { id: 'wool_green', name: 'Green Wool', style: 'noise', base: '#22c55e', dark: '#15803d', light: '#86efac', solid: true },
  { id: 'wool_yellow', name: 'Yellow Wool', style: 'noise', base: '#eab308', dark: '#a16207', light: '#fef08a', solid: true },
  { id: 'wool_purple', name: 'Purple Wool', style: 'noise', base: '#a855f7', dark: '#7e22ce', light: '#e9d5ff', solid: true },
  { id: 'wool_orange', name: 'Orange Wool', style: 'noise', base: '#f97316', dark: '#c2410c', light: '#fed7aa', solid: true },
  { id: 'wool_cyan', name: 'Cyan Wool', style: 'noise', base: '#06b6d4', dark: '#0e7490', light: '#a5f3fc', solid: true },

  { id: 'wool_pink', name: 'Pink Wool', style: 'noise', base: '#ec4899', dark: '#be185d', light: '#fbcfe8', solid: true },
  { id: 'wool_black', name: 'Charcoal Wool', style: 'noise', base: '#27272a', dark: '#18181b', light: '#52525b', solid: true },
  { id: 'snow_block', name: 'Snow Block', style: 'noise', base: '#f8fafc', dark: '#dbeafe', light: '#ffffff', solid: true },
  { id: 'ice_block', name: 'Ice Block', style: 'glass', stroke: '#bae6fd', solid: true, transparent: true, opacity: 0.78 },
  { id: 'clay_block', name: 'Clay Block', style: 'noise', base: '#9ca3af', dark: '#6b7280', light: '#d1d5db', solid: true },
  { id: 'terracotta', name: 'Terracotta', style: 'planks', base: '#b4694a', seam: '#7c4129', solid: true },
  { id: 'moss_stone', name: 'Mossy Stone', style: 'ore', stone: '#7a7d82', spot: '#4ea832', solid: true },
  { id: 'quartz_block', name: 'Quartz Block', style: 'tile', base: '#f5f2eb', inner: '#ffffff', border: '#d6d0c4', solid: true },
  { id: 'dark_prismarine', name: 'Dark Prismarine', style: 'tile', base: '#1e3a4c', inner: '#2dd4bf', border: '#0f172a', solid: true }
];

const ALL_ITEMS = [...BLOCK_ITEMS, ...TOOL_ITEMS];
const ITEM_BY_ID = new Map(ALL_ITEMS.map((item) => [item.id, item]));

const canvas = document.getElementById('worldCanvas');
const overlay = document.getElementById('lockOverlay');
const hotbarEl = document.getElementById('hotbar');
const blockLabelEl = document.getElementById('blockLabel');
const modeBadgeEl = document.getElementById('modeBadge');
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
const craftRecipeHintEl = document.getElementById('craftRecipeHint');
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

function makePixelTexture(drawFn, seed = 1) {
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

function drawNoise(tctx, size, rand, baseHex, darkHex, lightHex) {
  tctx.fillStyle = baseHex;
  tctx.fillRect(0, 0, size, size);
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const r = rand();
      if (r < 0.25) {
        tctx.fillStyle = darkHex;
        tctx.fillRect(x, y, 1, 1);
      } else if (r > 0.74) {
        tctx.fillStyle = lightHex;
        tctx.fillRect(x, y, 1, 1);
      }
    }
  }
}

const texGrassTop = makePixelTexture((tctx, size, rand) => {
  drawNoise(tctx, size, rand, '#4ea832', '#3b8824', '#68c444');
}, 11);

const texGrassSide = makePixelTexture((tctx, size, rand) => {
  drawNoise(tctx, size, rand, '#7c5332', '#5d3c22', '#966742');
  tctx.fillStyle = '#4ea832';
  tctx.fillRect(0, 0, size, 3);
  for (let x = 0; x < size; x += 1) {
    const drip = rand() < 0.45 ? 4 : rand() < 0.75 ? 3 : 2;
    tctx.fillStyle = x % 2 === 0 ? '#4ea832' : '#3b8824';
    tctx.fillRect(x, 2, 1, drip - 1);
  }
}, 12);

const texDirtBase = makePixelTexture((tctx, size, rand) => {
  drawNoise(tctx, size, rand, '#7c5332', '#5d3c22', '#966742');
}, 13);

function buildItemVisual(item, index) {
  const seed = 300 + index * 19;

  if (item.isTool) {
    const icon = makePixelTexture((tctx, size) => {
      tctx.clearRect(0, 0, size, size);
      // Diagonal stick handle
      tctx.fillStyle = '#9c6b38';
      for (let i = 0; i < 9; i += 1) {
        tctx.fillRect(3 + i, 12 - i, 2, 2);
      }
      tctx.fillStyle = item.color;
      if (item.toolKind === 'pickaxe') {
        tctx.fillRect(8, 2, 6, 2);
        tctx.fillRect(12, 4, 2, 5);
        tctx.fillRect(7, 3, 2, 2);
      } else if (item.toolKind === 'axe') {
        tctx.fillRect(10, 2, 5, 6);
        tctx.fillRect(9, 4, 2, 3);
      } else if (item.toolKind === 'shovel') {
        tctx.fillRect(11, 2, 4, 4);
        tctx.fillRect(10, 3, 2, 2);
      } else {
        // Sword blade
        tctx.fillRect(9, 2, 5, 2);
        tctx.fillRect(11, 4, 3, 5);
        tctx.fillRect(8, 8, 5, 2);
      }
    }, seed);
    return { swatch: icon.dataUrl, mat: null };
  }

  if (item.style === 'stick') {
    const icon = makePixelTexture((tctx, size) => {
      tctx.clearRect(0, 0, size, size);
      tctx.fillStyle = '#a8753e';
      for (let i = 0; i < 10; i += 1) {
        tctx.fillRect(3 + i, 12 - i, 2, 2);
      }
    }, seed);
    return { swatch: icon.dataUrl, mat: null };
  }

  if (item.style === 'grass') {
    return {
      swatch: texGrassSide.dataUrl,
      mat: [
        new THREE.MeshLambertMaterial({ map: texGrassSide.texture }),
        new THREE.MeshLambertMaterial({ map: texGrassSide.texture }),
        new THREE.MeshLambertMaterial({ map: texGrassTop.texture }),
        new THREE.MeshLambertMaterial({ map: texDirtBase.texture }),
        new THREE.MeshLambertMaterial({ map: texGrassSide.texture }),
        new THREE.MeshLambertMaterial({ map: texGrassSide.texture })
      ]
    };
  }

  if (item.style === 'log') {
    const side = makePixelTexture((tctx, size, rand) => {
      tctx.fillStyle = item.base;
      tctx.fillRect(0, 0, size, size);
      for (let x = 0; x < size; x += 2) {
        tctx.fillStyle = (x / 2) % 2 === 0 ? item.dark : item.base;
        tctx.fillRect(x, 0, 2, size);
      }
      for (let i = 0; i < 20; i += 1) {
        tctx.fillStyle = item.dark;
        tctx.fillRect(Math.floor(rand() * size), Math.floor(rand() * size), 1, 2);
      }
    }, seed);
    const top = makePixelTexture((tctx, size) => {
      tctx.fillStyle = item.top;
      tctx.fillRect(0, 0, size, size);
      tctx.strokeStyle = item.dark;
      tctx.lineWidth = 1;
      tctx.strokeRect(2.5, 2.5, size - 5, size - 5);
      tctx.strokeRect(5.5, 5.5, size - 11, size - 11);
    }, seed + 1);
    return {
      swatch: side.dataUrl,
      mat: [
        new THREE.MeshLambertMaterial({ map: side.texture }),
        new THREE.MeshLambertMaterial({ map: side.texture }),
        new THREE.MeshLambertMaterial({ map: top.texture }),
        new THREE.MeshLambertMaterial({ map: top.texture }),
        new THREE.MeshLambertMaterial({ map: side.texture }),
        new THREE.MeshLambertMaterial({ map: side.texture })
      ]
    };
  }

  if (item.style === 'planks') {
    const tex = makePixelTexture((tctx, size, rand) => {
      tctx.fillStyle = item.base;
      tctx.fillRect(0, 0, size, size);
      for (let row = 0; row < 4; row += 1) {
        const y = row * 4;
        tctx.fillStyle = item.seam;
        tctx.fillRect(0, y + 3, size, 1);
        const seamX = ((row * 5 + 3) % (size - 2)) + 1;
        tctx.fillRect(seamX, y, 1, 3);
        if (rand() > 0.5) {
          tctx.fillRect((seamX + 5) % size, y + 1, 2, 1);
        }
      }
    }, seed);
    return { swatch: tex.dataUrl, mat: new THREE.MeshLambertMaterial({ map: tex.texture }) };
  }

  if (item.style === 'stone') {
    const tex = makePixelTexture((tctx, size, rand) => {
      tctx.fillStyle = item.base;
      tctx.fillRect(0, 0, size, size);
      const boxes = [
        [0, 0, 7, 4, item.accent],
        [8, 0, 8, 5, item.base],
        [0, 5, 6, 5, item.base],
        [7, 5, 6, 4, item.accent],
        [0, 11, 8, 5, item.accent],
        [9, 11, 7, 5, item.base]
      ];
      for (const [sx, sy, sw, sh, col] of boxes) {
        tctx.fillStyle = col;
        tctx.fillRect(sx, sy, sw, sh);
        tctx.strokeStyle = item.border;
        tctx.lineWidth = 1;
        tctx.strokeRect(sx + 0.5, sy + 0.5, Math.max(1, sw - 1), Math.max(1, sh - 1));
      }
      for (let i = 0; i < 16; i += 1) {
        tctx.fillStyle = item.border;
        tctx.fillRect(Math.floor(rand() * size), Math.floor(rand() * size), 1, 1);
      }
    }, seed);
    return { swatch: tex.dataUrl, mat: new THREE.MeshLambertMaterial({ map: tex.texture }) };
  }

  if (item.style === 'brick') {
    const tex = makePixelTexture((tctx, size) => {
      tctx.fillStyle = item.mortar;
      tctx.fillRect(0, 0, size, size);
      for (let row = 0; row < 4; row += 1) {
        const y = row * 4;
        const offset = (row % 2) * 4;
        for (let col = -1; col < 3; col += 1) {
          tctx.fillStyle = item.base;
          tctx.fillRect(col * 8 + offset + 1, y + 1, 6, 2);
        }
      }
    }, seed);
    return { swatch: tex.dataUrl, mat: new THREE.MeshLambertMaterial({ map: tex.texture }) };
  }

  if (item.style === 'metal') {
    const tex = makePixelTexture((tctx, size) => {
      tctx.fillStyle = item.base;
      tctx.fillRect(0, 0, size, size);
      tctx.fillStyle = item.hi;
      tctx.fillRect(1, 1, size - 2, 2);
      tctx.fillRect(1, 1, 2, size - 2);
      tctx.fillStyle = item.lo;
      tctx.fillRect(1, size - 3, size - 2, 2);
      tctx.fillRect(size - 3, 1, 2, size - 2);
    }, seed);
    return { swatch: tex.dataUrl, mat: new THREE.MeshLambertMaterial({ map: tex.texture }) };
  }

  if (item.style === 'ore') {
    const tex = makePixelTexture((tctx, size, rand) => {
      drawNoise(tctx, size, rand, item.stone, '#5b5e63', '#8f939a');
      const spots = [[3, 3], [9, 4], [5, 10], [11, 11], [12, 7]];
      for (const [ox, oy] of spots) {
        tctx.fillStyle = item.spot;
        tctx.fillRect(ox, oy, 2, 2);
      }
    }, seed);
    return { swatch: tex.dataUrl, mat: new THREE.MeshLambertMaterial({ map: tex.texture }) };
  }

  if (item.style === 'tile') {
    const tex = makePixelTexture((tctx, size) => {
      tctx.fillStyle = item.base;
      tctx.fillRect(0, 0, size, size);
      tctx.strokeStyle = item.border;
      tctx.lineWidth = 2;
      tctx.strokeRect(1, 1, size - 2, size - 2);
      tctx.fillStyle = item.inner;
      tctx.fillRect(5, 5, 6, 6);
    }, seed);
    return { swatch: tex.dataUrl, mat: new THREE.MeshLambertMaterial({ map: tex.texture }) };
  }

  if (item.style === 'glass') {
    const tex = makePixelTexture((tctx, size) => {
      tctx.clearRect(0, 0, size, size);
      tctx.strokeStyle = item.stroke;
      tctx.lineWidth = 2;
      tctx.strokeRect(1, 1, size - 2, size - 2);
      tctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
      tctx.fillRect(3, 3, 3, 2);
    }, seed);
    return {
      swatch: tex.dataUrl,
      mat: new THREE.MeshLambertMaterial({
        map: tex.texture,
        transparent: true,
        opacity: item.opacity ?? 0.72,
        depthWrite: false
      })
    };
  }

  if (item.style === 'water') {
    const tex = makePixelTexture((tctx, size, rand) => {
      tctx.fillStyle = item.base;
      tctx.fillRect(0, 0, size, size);
      tctx.fillStyle = item.ripple;
      for (let i = 0; i < 6; i += 1) {
        tctx.fillRect(Math.floor(rand() * 12), Math.floor(rand() * 15), 4, 1);
      }
    }, seed);
    return {
      swatch: tex.dataUrl,
      mat: new THREE.MeshLambertMaterial({
        map: tex.texture,
        transparent: true,
        opacity: item.opacity ?? 0.76,
        depthWrite: false
      })
    };
  }

  const tex = makePixelTexture((tctx, size, rand) => {
    drawNoise(tctx, size, rand, item.base, item.dark, item.light);
  }, seed);
  return {
    swatch: tex.dataUrl,
    mat: new THREE.MeshLambertMaterial({
      map: tex.texture,
      transparent: Boolean(item.transparent),
      opacity: item.opacity ?? 1
    })
  };
}

const itemVisuals = new Map();
ALL_ITEMS.forEach((item, idx) => {
  itemVisuals.set(item.id, buildItemVisual(item, idx));
});

// Game State: Gamemode, Gamerules & Inventories
let username = 'player';
let gamemode = 'survival'; // 'survival' | 'creative'
let keepInventory = true;
let placedCount = 0;

// Survival Hotbar (8 slots) + Backpack (27 slots)
let survivalHotbar = [
  { id: 'wood_pickaxe', count: 1 },
  { id: 'wood_axe', count: 1 },
  { id: 'planks', count: 16 },
  { id: 'wood', count: 8 },
  { id: 'stone', count: 12 },
  { id: 'iron_block', count: 6 },
  { id: 'diamond_block', count: 6 },
  { id: 'stick', count: 8 }
];

let backpackSlots = Array.from({ length: 27 }, (_, idx) => {
  if (idx === 0) return { id: 'dirt', count: 16 };
  if (idx === 1) return { id: 'torch_alt', count: 0 };
  return null;
});
backpackSlots[1] = { id: 'sand', count: 8 };

// Creative Hotbar (8 slots, customizable from the 50-block creative modal)
let creativeHotbar = BLOCK_ITEMS.slice(0, 8).map((b) => ({ id: b.id, count: 64 }));
let selectedSlot = 0;

// 2x2 Crafting Grid (4 slots)
let craftSlots = [null, null, null, null];

function getActiveHotbar() {
  return gamemode === 'creative' ? creativeHotbar : survivalHotbar;
}

function addItemToSurvival(itemId, qty = 1) {
  if (!ITEM_BY_ID.has(itemId) || qty <= 0) return;

  // Stack into existing slots first (tools stay single-count)
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
  if (slot.count <= 0) {
    survivalHotbar[selectedSlot] = null;
  }
  return true;
}

// 2x2 Crafting Recipes (Tools strictly capped at Diamond tier)
function matchCraftingRecipe(grid) {
  const counts = {};
  for (const s of grid) {
    if (s && s.id && s.count > 0) {
      counts[s.id] = (counts[s.id] || 0) + s.count;
    }
  }
  const keys = Object.keys(counts);
  if (keys.length === 0) return null;

  // 1) 2 Planks (or Birch/Spruce Planks) -> 4 Sticks
  const plankKey = ['planks', 'birch_planks', 'spruce_planks'].find((k) => counts[k] >= 2 && keys.length === 1);
  if (plankKey) {
    return {
      outputId: 'stick',
      outputCount: 4,
      consume: { [plankKey]: 2 }
    };
  }

  // 2) 1 Log -> 4 Oak Planks
  const logKey = ['wood', 'birch_log', 'spruce_log'].find((k) => counts[k] >= 1 && keys.length === 1);
  if (logKey) {
    return {
      outputId: logKey === 'birch_log' ? 'birch_planks' : logKey === 'spruce_log' ? 'spruce_planks' : 'planks',
      outputCount: 4,
      consume: { [logKey]: 1 }
    };
  }

  // 3) Tool recipes: 2 Sticks + 2 Tier Material -> Pickaxe / Axe / Shovel / Sword (Max: Diamond)
  const stickCount = counts.stick || 0;
  if (stickCount >= 2) {
    for (const tier of TOOL_TIERS) {
      const matQty = counts[tier.materialId] || 0;
      if (matQty >= 2 && keys.length === 2) {
        return {
          outputId: `${tier.id}_pickaxe`,
          outputCount: 1,
          consume: { stick: 2, [tier.materialId]: 2 }
        };
      }
    }
  }

  // 4) 1 Stick + 2 Tier Material -> Sword (Max: Diamond)
  if (stickCount >= 1) {
    for (const tier of TOOL_TIERS) {
      const matQty = counts[tier.materialId] || 0;
      if (matQty >= 2 && keys.length === 2) {
        return {
          outputId: `${tier.id}_sword`,
          outputCount: 1,
          consume: { stick: 1, [tier.materialId]: 2 }
        };
      }
    }
  }

  // 5) 2 Sticks + 1 Tier Material -> Axe (Max: Diamond)
  if (stickCount >= 2) {
    for (const tier of TOOL_TIERS) {
      const matQty = counts[tier.materialId] || 0;
      if (matQty >= 1 && keys.length === 2) {
        return {
          outputId: `${tier.id}_axe`,
          outputCount: 1,
          consume: { stick: 2, [tier.materialId]: 1 }
        };
      }
    }
  }

  // 6) 2 Sticks + 1 Block -> Shovel
  if (stickCount >= 2) {
    for (const tier of TOOL_TIERS) {
      const matQty = counts[tier.materialId] || 0;
      if (matQty >= 1 && keys.length === 2) {
        return {
          outputId: `${tier.id}_shovel`,
          outputCount: 1,
          consume: { stick: 2, [tier.materialId]: 1 }
        };
      }
    }
  }

  return null;
}

function appendChat(text, cls = '') {
  if (!chatMessagesEl) return;
  const line = document.createElement('div');
  line.className = `chat-line ${cls}`.trim();
  line.textContent = text;
  chatMessagesEl.appendChild(line);
  chatMessagesEl.scrollTop = chatMessagesEl.scrollHeight;
}

function syncModeHud() {
  if (!modeBadgeEl) return;
  const isCreative = gamemode === 'creative';
  modeBadgeEl.textContent = `MODE: ${gamemode.toUpperCase()} (${username})`;
  modeBadgeEl.classList.toggle('creative', isCreative);
  syncHotbarUi();
}

function setGamemode(nextMode, targetUser) {
  const normalized = String(nextMode || '').toLowerCase();
  if (normalized !== 'survival' && normalized !== 'creative') {
    appendChat('Usage: gamemode <username> <survival|creative>', 'warn');
    return;
  }
  if (targetUser && targetUser.toLowerCase() !== '@s') {
    username = targetUser;
  }
  gamemode = normalized;
  syncModeHud();
  appendChat(
    `[Server] Set ${username}'s gamemode to ${gamemode.toUpperCase()} (Press E for ${gamemode === 'creative' ? '50 Creative blocks' : 'Survival Inventory & Crafting'})`,
    'cmd'
  );
}

function setGamerule(ruleName, rawVal) {
  const key = String(ruleName || '').toLowerCase();
  const val = String(rawVal || '').toLowerCase();
  if (key !== 'keep_inventory' && key !== 'keepinventory') {
    appendChat(`Unknown gamerule "${ruleName}". Supported: keep_inventory`, 'warn');
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
    const arg1 = (parts[1] || '').toLowerCase();
    const arg2 = (parts[2] || '').toLowerCase();
    if (arg1 === 'survival' || arg1 === 'creative') {
      setGamemode(arg1, parts[2] || username);
    } else if (arg2 === 'survival' || arg2 === 'creative') {
      setGamemode(arg2, parts[1] || username);
    } else {
      appendChat('Usage: gamemode <username> <survival|creative>', 'warn');
    }
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
  if (document.pointerLockElement === canvas) {
    document.exitPointerLock?.();
  }
  creativeModalEl.classList.add('hidden');
  survivalModalEl.classList.add('hidden');
  chatInputEl.value = prefill;
  chatInputEl.focus();
}

chatFormEl.addEventListener('submit', (e) => {
  e.preventDefault();
  handleChatSubmit(chatInputEl.value);
  chatInputEl.value = '';
  chatInputEl.blur();
});

// Web Audio Synth & Sound Effects
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
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  if (!muted && !musicInterval && audioCtx) {
    musicInterval = setInterval(() => {
      if (muted || !audioCtx || audioCtx.state !== 'running') return;
      playTone(notes[stepIdx % notes.length], 0.16, 'triangle', 0.025);
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

// Three.js Scene Setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x69a7f5);
scene.fog = new THREE.FogExp2(0x69a7f5, 0.018);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 140);
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

scene.add(new THREE.AmbientLight(0xffffff, 0.72));
const sunLight = new THREE.DirectionalLight(0xfff7e0, 0.95);
sunLight.position.set(22, 36, 18);
scene.add(sunLight);

const boxGeo = new THREE.BoxGeometry(1, 1, 1);
const selectionBox = new THREE.LineSegments(
  new THREE.EdgesGeometry(new THREE.BoxGeometry(1.012, 1.012, 1.012)),
  new THREE.LineBasicMaterial({ color: 0x111827, linewidth: 2 })
);
selectionBox.visible = false;
scene.add(selectionBox);

const blockMap = new Map();
const colliders = [];
const rayTargets = [];

function keyOf(x, y, z) {
  return `${Math.round(x)},${Math.round(y)},${Math.round(z)}`;
}

function getBlockAt(x, y, z) {
  return blockMap.get(keyOf(x, y, z)) || null;
}

function isSolidAt(x, y, z) {
  const mesh = getBlockAt(x, y, z);
  return Boolean(mesh && mesh.userData.solid);
}

function addBlock(x, y, z, itemDef, countPlacement = false) {
  if (!itemDef || itemDef.isTool || itemDef.id === 'stick') return null;
  const gx = Math.round(x);
  const gy = Math.round(y);
  const gz = Math.round(z);
  const k = keyOf(gx, gy, gz);
  if (blockMap.has(k)) return null;

  const vis = itemVisuals.get(itemDef.id);
  if (!vis || !vis.mat) return null;

  const mesh = new THREE.Mesh(boxGeo, vis.mat);
  mesh.position.set(gx, gy, gz);
  mesh.userData = { gx, gy, gz, blockId: itemDef.id, solid: itemDef.solid };
  scene.add(mesh);
  blockMap.set(k, mesh);
  rayTargets.push(mesh);
  if (itemDef.solid) {
    colliders.push(mesh);
  }

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
  return mesh;
}

function removeBlock(mesh, giveDrop = false) {
  if (!mesh) return;
  const { gx, gy, gz, blockId } = mesh.userData;
  const k = keyOf(gx, gy, gz);
  scene.remove(mesh);
  blockMap.delete(k);

  const rIdx = rayTargets.indexOf(mesh);
  if (rIdx >= 0) rayTargets.splice(rIdx, 1);

  const cIdx = colliders.indexOf(mesh);
  if (cIdx >= 0) colliders.splice(cIdx, 1);

  if (giveDrop && gamemode === 'survival') {
    const def = ITEM_BY_ID.get(blockId);
    const dropId = def?.dropId || blockId;
    if (ITEM_BY_ID.has(dropId) && dropId !== 'water') {
      addItemToSurvival(dropId, 1);
      syncHotbarUi();
    }
  }
}

// Terrain Generation
const HALF_SIZE = 16;
const WATER_LEVEL = -1;

function surfaceHeightAt(x, z) {
  const distPond = Math.hypot(x + 5, z - 4);
  const pondDip = distPond < 5.2 ? Math.cos((distPond / 5.2) * (Math.PI / 2)) * 2.4 : 0;
  const hills =
    Math.sin(x * 0.18) * Math.cos(z * 0.18) * 2.2 +
    Math.sin((x + z) * 0.11) * 1.1;
  return Math.round(hills - pondDip);
}

for (let x = -HALF_SIZE; x <= HALF_SIZE; x += 1) {
  for (let z = -HALF_SIZE; z <= HALF_SIZE; z += 1) {
    const topY = surfaceHeightAt(x, z);
    for (let y = -4; y <= topY; y += 1) {
      if (y === topY && topY >= WATER_LEVEL) {
        addBlock(x, y, z, ITEM_BY_ID.get('grass'), false);
      } else if (y >= topY - 2) {
        addBlock(x, y, z, ITEM_BY_ID.get('dirt'), false);
      } else {
        addBlock(x, y, z, ITEM_BY_ID.get('stone'), false);
      }
    }
    if (topY < WATER_LEVEL) {
      for (let wy = topY + 1; wy <= WATER_LEVEL; wy += 1) {
        addBlock(x, wy, z, ITEM_BY_ID.get('water'), false);
      }
    }
  }
}

function spawnTree(tx, tz) {
  const baseY = surfaceHeightAt(tx, tz);
  if (baseY < WATER_LEVEL) return;
  const trunkTop = baseY + 1;
  for (let dy = 0; dy < 4; dy += 1) {
    addBlock(tx, trunkTop + dy, tz, ITEM_BY_ID.get('wood'), false);
  }
  for (let dx = -2; dx <= 2; dx += 1) {
    for (let dz = -2; dz <= 2; dz += 1) {
      for (let ly = 3; ly <= 4; ly += 1) {
        if (Math.abs(dx) === 2 && Math.abs(dz) === 2 && ly === 4) continue;
        if (dx === 0 && dz === 0 && ly < 4) continue;
        addBlock(tx + dx, trunkTop + ly, tz + dz, ITEM_BY_ID.get('leaves'), false);
      }
    }
  }
  addBlock(tx, trunkTop + 5, tz, ITEM_BY_ID.get('leaves'), false);
  addBlock(tx + 1, trunkTop + 5, tz, ITEM_BY_ID.get('leaves'), false);
  addBlock(tx - 1, trunkTop + 5, tz, ITEM_BY_ID.get('leaves'), false);
  addBlock(tx, trunkTop + 5, tz + 1, ITEM_BY_ID.get('leaves'), false);
  addBlock(tx, trunkTop + 5, tz - 1, ITEM_BY_ID.get('leaves'), false);
}

for (const [tx, tz] of [[-9, -8], [8, -9], [10, 7], [-11, 10], [2, -11]]) {
  spawnTree(tx, tz);
}

// Hotbar, Survival Inventory & 2x2 Crafting UI
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
    const isDiamond = def?.tier === 'diamond';
    btn.className = `slot ${i === selectedSlot ? 'active' : ''} ${isDiamond ? 'tier-diamond' : ''}`.trim();
    btn.title = def ? def.name : 'Empty';

    if (def) {
      const sw = itemVisuals.get(def.id)?.swatch || '';
      const countBadge =
        gamemode === 'survival' && !def.isTool && entry.count > 1
          ? `<span class="slot-count">${entry.count}</span>`
          : '';
      btn.innerHTML = `<span class="slot-key">${i + 1}</span><img class="slot-img" src="${sw}" alt="${def.name}" />${countBadge}`;
    } else {
      btn.innerHTML = `<span class="slot-key">${i + 1}</span>`;
    }

    btn.addEventListener('click', () => {
      selectSlot(i);
      playTone(480, 0.05, 'sine', 0.04);
    });
    hotbarEl.appendChild(btn);
  });

  if (!survivalModalEl.classList.contains('hidden')) {
    renderSurvivalModal();
  }
}

function selectSlot(idx) {
  const bar = getActiveHotbar();
  selectedSlot = ((idx % bar.length) + bar.length) % bar.length;
  syncHotbarUi();
}

function moveItemToCraft(sourceList, sourceIdx) {
  const src = sourceList[sourceIdx];
  if (!src || src.count <= 0) return;

  const emptyCraftIdx = craftSlots.findIndex((c) => !c);
  if (emptyCraftIdx === -1) {
    appendChat('2×2 crafting grid is full. Click a crafted slot to return it.', 'warn');
    return;
  }

  craftSlots[emptyCraftIdx] = { id: src.id, count: 1 };
  src.count -= 1;
  if (src.count <= 0) {
    sourceList[sourceIdx] = null;
  }
  playTone(510, 0.045, 'triangle', 0.04);
  renderSurvivalModal();
  syncHotbarUi();
}

function returnCraftSlot(craftIdx) {
  const slot = craftSlots[craftIdx];
  if (!slot) return;
  addItemToSurvival(slot.id, slot.count);
  craftSlots[craftIdx] = null;
  playTone(420, 0.045, 'sine', 0.04);
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
      const sw = itemVisuals.get(slot.id)?.swatch || '';
      btn.title = `${def.name} (Click to return)`;
      btn.innerHTML = `<img src="${sw}" alt="${def.name}" /><span class="slot-count">${slot.count}</span>`;
    } else {
      btn.title = 'Empty crafting slot';
    }
    btn.addEventListener('click', () => returnCraftSlot(idx));
    craftGridEl.appendChild(btn);
  });

  const recipe = matchCraftingRecipe(craftSlots);
  craftOutputBtnEl.innerHTML = '';
  if (recipe) {
    const outDef = ITEM_BY_ID.get(recipe.outputId);
    const sw = itemVisuals.get(recipe.outputId)?.swatch || '';
    craftOutputBtnEl.classList.add('ready');
    craftOutputBtnEl.disabled = false;
    craftOutputBtnEl.innerHTML = `<img src="${sw}" alt="${outDef.name}" /><span>${outDef.name} ×${recipe.outputCount}</span>`;
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
      const sw = itemVisuals.get(def.id)?.swatch || '';
      btn.title = `${def.name} (Click to add to crafting)`;
      btn.innerHTML = `<img src="${sw}" alt="${def.name}" />${!def.isTool ? `<span class="slot-count">${slot.count}</span>` : ''}`;
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
      const sw = itemVisuals.get(def.id)?.swatch || '';
      btn.title = `${def.name} (Click to add to crafting)`;
      btn.innerHTML = `<span class="slot-key">${idx + 1}</span><img src="${sw}" alt="${def.name}" />${!def.isTool ? `<span class="slot-count">${slot.count}</span>` : ''}`;
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

  // Deduct required items from crafting grid
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
  const outDef = ITEM_BY_ID.get(recipe.outputId);
  playTone(640, 0.08, 'triangle', 0.06);
  appendChat(`Crafted ${outDef.name} ×${recipe.outputCount}!`, 'cmd');
  renderSurvivalModal();
  syncHotbarUi();
});

// Creative 50-Block Picker Modal
function renderCreativeGrid(filterText = '') {
  const q = filterText.trim().toLowerCase();
  creativeGridEl.innerHTML = '';
  const matches = BLOCK_ITEMS.filter((b) => !q || b.name.toLowerCase().includes(q) || b.id.includes(q));

  for (const item of matches) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'creative-item';
    const sw = itemVisuals.get(item.id)?.swatch || '';
    btn.innerHTML = `<img src="${sw}" alt="${item.name}" /><span>${item.name}</span>`;
    btn.addEventListener('click', () => {
      creativeHotbar[selectedSlot] = { id: item.id, count: 64 };
      syncHotbarUi();
      closeModals();
      playTone(580, 0.06, 'triangle', 0.05);
      appendChat(`Equipped "${item.name}" into hotbar slot ${selectedSlot + 1}.`, 'cmd');
    });
    creativeGridEl.appendChild(btn);
  }
}

function openInventoryForMode() {
  if (document.pointerLockElement === canvas) {
    document.exitPointerLock?.();
  }
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

// Player & Physics
const spawnY = surfaceHeightAt(0, 6) + 2.7;
const player = {
  pos: new THREE.Vector3(0, spawnY, 6),
  vel: new THREE.Vector3(0, 0, 0),
  yaw: 0,
  pitch: 0,
  eyeHeight: 1.65,
  onGround: false
};

const keys = new Set();
let jumpBuffer = 0;

function requestLock() {
  ensureAudio();
  if (!creativeModalEl.classList.contains('hidden') || !survivalModalEl.classList.contains('hidden')) return;
  if (document.pointerLockElement !== canvas) {
    canvas.requestPointerLock?.();
  }
}

document.getElementById('btnEnterLock').addEventListener('click', requestLock);
document.getElementById('btnOverlayStart').addEventListener('click', requestLock);

document.addEventListener('pointerlockchange', () => {
  const locked = document.pointerLockElement === canvas;
  const modalOpen = !creativeModalEl.classList.contains('hidden') || !survivalModalEl.classList.contains('hidden');
  overlay.classList.toggle('hidden', locked || modalOpen);
  if (!locked) selectionBox.visible = false;
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

  if (document.activeElement === chatInputEl || document.activeElement === creativeSearchEl) {
    return;
  }

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
    if (isOpen) {
      closeModals();
    } else {
      openInventoryForMode();
    }
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

window.addEventListener('keyup', (e) => {
  keys.delete(e.code);
});

window.addEventListener('wheel', (e) => {
  if (document.pointerLockElement !== canvas) return;
  selectSlot(selectedSlot + (e.deltaY > 0 ? 1 : -1));
}, { passive: true });

// Raycast Target Highlight, Placement & Mining
const raycaster = new THREE.Raycaster();
raycaster.far = 7;

function getHit() {
  raycaster.setFromCamera(new THREE.Vector2(0, 0), camera);
  const hits = raycaster.intersectObjects(rayTargets, false);
  return hits.length > 0 ? hits[0] : null;
}

function updateSelectionOutline() {
  if (document.pointerLockElement !== canvas) {
    selectionBox.visible = false;
    return;
  }
  const hit = getHit();
  if (!hit) {
    selectionBox.visible = false;
    return;
  }
  selectionBox.position.copy(hit.object.position);
  selectionBox.visible = true;
}

canvas.addEventListener('contextmenu', (e) => e.preventDefault());

canvas.addEventListener('mousedown', (e) => {
  if (document.pointerLockElement !== canvas) return;
  const hit = getHit();
  if (!hit) return;

  const bar = getActiveHotbar();
  const slotEntry = bar[selectedSlot];
  const heldItem = slotEntry ? ITEM_BY_ID.get(slotEntry.id) : null;

  if (e.button === 0) {
    // Left-click: if holding a tool and aiming at a block, mine it with tool speed; otherwise place block
    if (heldItem?.isTool) {
      const isFavored = heldItem.favored?.includes(hit.object.userData.blockId);
      removeBlock(hit.object, true);
      playTone(isFavored ? 310 : 210, 0.07, 'square', 0.055);
      return;
    }

    if (!heldItem || heldItem.isTool || heldItem.id === 'stick' || !heldItem.solid) return;

    const n = hit.face.normal;
    const gx = Math.round(hit.object.position.x + n.x);
    const gy = Math.round(hit.object.position.y + n.y);
    const gz = Math.round(hit.object.position.z + n.z);

    const px = Math.round(player.pos.x);
    const pz = Math.round(player.pos.z);
    const pyFeet = Math.round(player.pos.y - player.eyeHeight);
    const pyHead = Math.round(player.pos.y);
    const insidePlayer = heldItem.solid && gx === px && gz === pz && (gy === pyFeet || gy === pyHead);

    if (!insidePlayer && consumeSelectedSurvivalBlock()) {
      addBlock(gx, gy, gz, heldItem, gamemode === 'survival');
      playTone(520, 0.07, 'triangle', 0.06);
      syncHotbarUi();
    }
  } else if (e.button === 2) {
    // Right-click: break/mine block and collect drop in survival
    removeBlock(hit.object, true);
    playTone(190, 0.08, 'sawtooth', 0.055);
  }
});

function stepPhysics(dt) {
  if (jumpBuffer > 0) jumpBuffer = Math.max(0, jumpBuffer - dt);

  const forward = new THREE.Vector3(-Math.sin(player.yaw), 0, -Math.cos(player.yaw));
  const right = new THREE.Vector3(Math.cos(player.yaw), 0, -Math.sin(player.yaw));
  const wish = new THREE.Vector3();

  if (keys.has('KeyW') || keys.has('ArrowUp')) wish.add(forward);
  if (keys.has('KeyS') || keys.has('ArrowDown')) wish.sub(forward);
  if (keys.has('KeyD') || keys.has('ArrowRight')) wish.add(right);
  if (keys.has('KeyA') || keys.has('ArrowLeft')) wish.sub(right);
  if (wish.lengthSq() > 0) wish.normalize();

  const moveSpeed = gamemode === 'creative' ? 8.2 : 6.2;
  player.vel.x = wish.x * moveSpeed;
  player.vel.z = wish.z * moveSpeed;

  if (jumpBuffer > 0 && player.onGround) {
    player.vel.y = 7.4;
    player.onGround = false;
    jumpBuffer = 0;
    playTone(360, 0.09, 'square', 0.045);
  }

  player.vel.y -= 19.5 * dt;

  const nextX = player.pos.x + player.vel.x * dt;
  const feetY = Math.floor(player.pos.y - player.eyeHeight + 0.1);
  const headY = Math.floor(player.pos.y - 0.1);
  const checkX = Math.round(nextX + Math.sign(player.vel.x) * 0.32);
  const checkZ = Math.round(player.pos.z);
  if (!isSolidAt(checkX, feetY, checkZ) && !isSolidAt(checkX, headY, checkZ)) {
    player.pos.x = nextX;
  }

  const nextZ = player.pos.z + player.vel.z * dt;
  const checkX2 = Math.round(player.pos.x);
  const checkZ2 = Math.round(nextZ + Math.sign(player.vel.z) * 0.32);
  if (!isSolidAt(checkX2, feetY, checkZ2) && !isSolidAt(checkX2, headY, checkZ2)) {
    player.pos.z = nextZ;
  }

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

  if (player.pos.y < -18) {
    player.pos.set(0, spawnY, 6);
    player.vel.set(0, 0, 0);
    if (!keepInventory) {
      placedCount = 0;
      placedCounterEl.textContent = 'Placed: 0';
      appendChat('keep_inventory is false: placed counter reset on respawn.', 'warn');
    } else {
      appendChat('keep_inventory is true: your progress was kept!', 'cmd');
    }
  }

  camera.position.copy(player.pos);
  const euler = new THREE.Euler(player.pitch, player.yaw, 0, 'YXZ');
  camera.quaternion.setFromEuler(euler);
  updateSelectionOutline();
}

syncModeHud();
appendChat('Survival mode active: Press E for Inventory & 2×2 Crafting (tools max out at Diamond).', 'cmd');

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
});

requestAnimationFrame(animate);