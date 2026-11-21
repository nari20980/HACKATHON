'use strict';

const QUEST_STORAGE_KEY = 'arcade_quests_xp_v1';
const BASE_XP = 100;
const XP_STEP = 50;

const TIERS = [
  { level: 1, title: 'Rookie' },
  { level: 2, title: 'Contender' },
  { level: 3, title: 'Veteran' },
  { level: 4, title: 'Striker' },
  { level: 5, title: 'Apex' }
];

function getXpRequiredForLevel(lvl) {
  const safeLvl = Math.max(1, Math.floor(lvl));
  return BASE_XP + (safeLvl - 1) * XP_STEP;
}

function getCumulativeXpForLevel(targetLevel) {
  let total = 0;
  for (let lvl = 1; lvl < targetLevel; lvl += 1) {
    total += getXpRequiredForLevel(lvl);
  }
  return total;
}

function getLevelInfo(totalXp) {
  const safeXp = Math.max(0, Math.floor(Number(totalXp) || 0));
  let level = 1;
  let intoLevel = safeXp;
  let neededForNext = getXpRequiredForLevel(level);

  while (intoLevel >= neededForNext) {
    intoLevel -= neededForNext;
    level += 1;
    neededForNext = getXpRequiredForLevel(level);
  }

  const toNext = Math.max(0, neededForNext - intoLevel);
  const pct = neededForNext > 0
    ? Math.min(100, Math.round((intoLevel / neededForNext) * 100))
    : 0;

  return { level, intoLevel, neededForNext, toNext, pct, totalXp: safeXp };
}

function readSaved() {
  try {
    const raw = JSON.parse(localStorage.getItem(QUEST_STORAGE_KEY));
    return {
      ...(raw && typeof raw === 'object' ? raw : {}),
      xp: typeof raw?.xp === 'number' && raw.xp >= 0 ? Math.floor(raw.xp) : 0,
      claimedIds: Array.isArray(raw?.claimedIds) ? raw.claimedIds : []
    };
  } catch {
    return { xp: 0, claimedIds: [] };
  }
}

function writeSaved(data) {
  try {
    localStorage.setItem(QUEST_STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Ignore storage access errors
  }
}

const state = readSaved();

const dom = {
  rankTag: document.getElementById('rankTag'),
  currentLevelHeading: document.getElementById('currentLevelHeading'),
  totalXpReadout: document.getElementById('totalXpReadout'),
  xpRemaining: document.getElementById('xpRemaining'),
  barCurrentLabel: document.getElementById('barCurrentLabel'),
  barTargetLabel: document.getElementById('barTargetLabel'),
  levelBar: document.getElementById('levelBar'),
  levelBarFill: document.getElementById('levelBarFill'),
  tiersGrid: document.getElementById('tiersGrid'),
  btnTestXp: document.getElementById('btnTestXp')
};

function renderLevels() {
  const info = getLevelInfo(state.xp);
  const matchedTier = TIERS.slice().reverse().find((t) => info.level >= t.level) || TIERS[0];

  if (dom.rankTag) dom.rankTag.textContent = `RANK: ${matchedTier.title.toUpperCase()}`;
  if (dom.currentLevelHeading) dom.currentLevelHeading.textContent = `Level ${info.level}`;
  if (dom.totalXpReadout) {
    dom.totalXpReadout.textContent = `${info.totalXp} Total XP • Next level needs ${info.neededForNext} XP (+${XP_STEP} per level)`;
  }
  if (dom.xpRemaining) dom.xpRemaining.textContent = `${info.toNext} XP`;
  if (dom.barCurrentLabel) dom.barCurrentLabel.textContent = `${info.intoLevel} XP`;
  if (dom.barTargetLabel) dom.barTargetLabel.textContent = `${info.neededForNext} XP`;
  if (dom.levelBarFill) dom.levelBarFill.style.width = `${info.pct}%`;
  if (dom.levelBar) dom.levelBar.setAttribute('aria-valuenow', String(info.pct));

  if (!dom.tiersGrid) return;
  dom.tiersGrid.innerHTML = '';

  for (const tier of TIERS) {
    const xpReq = getCumulativeXpForLevel(tier.level);
    const unlocked = info.totalXp >= xpReq;
    const isCurrent = info.level === tier.level;

    const card = document.createElement('article');
    card.className = `tier-card${unlocked ? ' unlocked' : ''}${isCurrent ? ' current' : ''}`;

    const lvlEl = document.createElement('span');
    lvlEl.className = 'tier-lvl';
    lvlEl.textContent = `LEVEL ${tier.level}`;

    const titleEl = document.createElement('h3');
    titleEl.textContent = tier.title;

    const reqEl = document.createElement('p');
    reqEl.textContent = `${xpReq} total XP required`;

    const statusEl = document.createElement('span');
    statusEl.className = 'tier-status';
    if (isCurrent) statusEl.textContent = '● CURRENT LEVEL';
    else if (unlocked) statusEl.textContent = '✓ UNLOCKED';
    else statusEl.textContent = 'LOCKED';

    card.append(lvlEl, titleEl, reqEl, statusEl);
    dom.tiersGrid.appendChild(card);
  }
}

dom.btnTestXp?.addEventListener('click', () => {
  state.xp += 25;
  writeSaved(state);
  renderLevels();
});

renderLevels();