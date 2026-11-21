'use strict';

(function () {
  const STORAGE_KEY = 'arcade_quests_xp_v1';
  const BASE_XP = 100;
  const XP_STEP = 50;

  const DEFAULT_SHOP_ITEMS = [
    {
      id: 'xp-booster-50',
      name: 'XP Surge Pack',
      desc: 'Instantly grants +50 XP toward your next level.',
      cost: 40,
      type: 'xp',
      xpGain: 50,
      badge: 'INSTANT XP'
    },
    {
      id: 'xp-overdrive-120',
      name: 'Overdrive XP Core',
      desc: 'Instantly grants +120 XP for a big level push.',
      cost: 85,
      type: 'xp',
      xpGain: 120,
      badge: 'INSTANT XP'
    },
    {
      id: 'coin-stash-60',
      name: 'Lucky Coin Stash',
      desc: 'Adds +60 bonus coins to your wallet for quest rerolls or items.',
      cost: 35,
      type: 'coins',
      coinGain: 60,
      badge: 'COIN PACK'
    },
    {
      id: 'neon-crown-badge',
      name: 'Neon Crown Badge',
      desc: 'Unlocks an exclusive Arcade Crown perk in your collection.',
      cost: 90,
      type: 'perk',
      badge: 'COLLECTIBLE'
    },
    {
      id: 'cyber-grid-theme',
      name: 'Cyber Grid Accent',
      desc: 'Unlocks the Cyber Grid collector perk for your profile.',
      cost: 110,
      type: 'perk',
      badge: 'COLLECTIBLE'
    }
  ];

  function fallbackLoad() {
    try {
      const raw = JSON.parse(localStorage.getItem(STORAGE_KEY));
      return {
        ...(raw && typeof raw === 'object' ? raw : {}),
        xp: typeof raw?.xp === 'number' && raw.xp >= 0 ? Math.floor(raw.xp) : 0,
        coins: typeof raw?.coins === 'number' && raw.coins >= 0 ? Math.floor(raw.coins) : 75,
        ownedItems: Array.isArray(raw?.ownedItems) ? raw.ownedItems : []
      };
    } catch {
      return { xp: 0, coins: 75, ownedItems: [] };
    }
  }

  function fallbackSave(data) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      // Ignore storage access errors
    }
  }

  function fallbackLevelInfo(totalXp) {
    const safeXp = Math.max(0, Math.floor(Number(totalXp) || 0));
    let level = 1;
    let intoLevel = safeXp;
    let neededForNext = BASE_XP;

    while (intoLevel >= neededForNext) {
      intoLevel -= neededForNext;
      level += 1;
      neededForNext = BASE_XP + (level - 1) * XP_STEP;
    }

    let rank = 'ROOKIE';
    if (level >= 5) rank = 'APEX';
    else if (level >= 3) rank = 'VETERAN';
    else if (level >= 2) rank = 'CONTENDER';

    return {
      level,
      intoLevel,
      neededForNext,
      toNext: Math.max(0, neededForNext - intoLevel),
      rank,
      totalXp: safeXp
    };
  }

  function fallbackBuy(itemId) {
    const item = DEFAULT_SHOP_ITEMS.find((entry) => entry.id === itemId);
    const data = fallbackLoad();
    if (!item || data.coins < item.cost) return { ok: false, data };
    if (item.type === 'perk' && data.ownedItems.includes(item.id)) return { ok: false, data };

    data.coins -= item.cost;
    if (item.type === 'xp') data.xp += item.xpGain || 0;
    else if (item.type === 'coins') data.coins += item.coinGain || 0;
    else if (item.type === 'perk') data.ownedItems.push(item.id);

    fallbackSave(data);
    return { ok: true, item, data };
  }

  const api = window.ArcadeQuests || {
    SHOP_ITEMS: DEFAULT_SHOP_ITEMS,
    loadData: fallbackLoad,
    getLevelInfo: fallbackLevelInfo,
    buyShopItem: fallbackBuy
  };

  const dom = {
    shopCoinBalance: document.getElementById('shopCoinBalance'),
    shopLevelTag: document.getElementById('shopLevelTag'),
    shopCoinsHeading: document.getElementById('shopCoinsHeading'),
    shopXpSubtext: document.getElementById('shopXpSubtext'),
    ownedSummary: document.getElementById('ownedSummary'),
    shopGrid: document.getElementById('shopGrid')
  };

  function renderShop() {
    if (!dom.shopGrid) return;

    const state = api.loadData();
    const ownedItems = Array.isArray(state.ownedItems) ? state.ownedItems : [];
    const info = api.getLevelInfo(state.xp);
    const items = Array.isArray(api.SHOP_ITEMS) && api.SHOP_ITEMS.length
      ? api.SHOP_ITEMS
      : DEFAULT_SHOP_ITEMS;

    const ownedPerksCount = items.filter(
      (it) => it.type === 'perk' && ownedItems.includes(it.id)
    ).length;

    if (dom.shopCoinBalance) dom.shopCoinBalance.textContent = `COINS: ${state.coins}`;
    if (dom.shopLevelTag) dom.shopLevelTag.textContent = `LEVEL ${info.level} • ${info.rank}`;
    if (dom.shopCoinsHeading) dom.shopCoinsHeading.textContent = `${state.coins} Coins Available`;
    if (dom.shopXpSubtext) {
      dom.shopXpSubtext.textContent = `${state.xp} Total XP • ${info.toNext} XP needed for Level ${info.level + 1}`;
    }
    if (dom.ownedSummary) dom.ownedSummary.textContent = `Owned Perks: ${ownedPerksCount}`;

    dom.shopGrid.innerHTML = '';

    for (const item of items) {
      const isPerk = item.type === 'perk';
      const isOwned = isPerk && ownedItems.includes(item.id);
      const canAfford = state.coins >= item.cost;

      const card = document.createElement('article');
      card.className = `shop-card${isOwned ? ' owned' : ''}`;

      const topBox = document.createElement('div');

      const badge = document.createElement('span');
      badge.className = 'item-type';
      badge.textContent = item.badge || 'ITEM';

      const title = document.createElement('h3');
      title.textContent = item.name;

      const desc = document.createElement('p');
      desc.textContent = item.desc;

      topBox.append(badge, title, desc);

      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'buy-btn';

      if (isOwned) {
        btn.disabled = true;
        btn.textContent = '✓ Owned';
      } else {
        btn.disabled = !canAfford;
        btn.textContent = canAfford ? `Buy • ${item.cost} Coins` : `Need ${item.cost} Coins`;
        btn.addEventListener('click', () => {
          api.buyShopItem(item.id);
          renderShop();
        });
      }

      card.append(topBox, btn);
      dom.shopGrid.appendChild(card);
    }
  }

  renderShop();
})();