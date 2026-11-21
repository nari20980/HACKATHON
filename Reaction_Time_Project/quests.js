'use strict';

(function () {
  const FALLBACK_KEY = 'arcade_quests_xp_v1';
  const FALLBACK_XP_PER_LEVEL = 100;
  const FALLBACK_REROLL_COST = 25;
  const FALLBACK_COINS = 75;

  const FALLBACK_BASE_QUESTS = [
    {
      id: 'reflex-warmup',
      title: 'Reflex Warmup',
      desc: 'Complete a reaction time test round to prove your focus.',
      xp: 40,
      coins: 20,
      trigger: 'reaction'
    },
    {
      id: 'click-burst',
      title: 'Rapid Click Burst',
      desc: 'Put your finger speed to work in the timed clicker mode.',
      xp: 55,
      coins: 25,
      trigger: 'clicker'
    },
    {
      id: 'puzzle-snap',
      title: 'Slot Matcher',
      desc: 'Snap pieces cleanly into their matching puzzle slots.',
      xp: 65,
      coins: 30,
      trigger: 'puzzle'
    },
    {
      id: 'arcade-streak',
      title: 'Arcade Explorer',
      desc: 'Visit and test all three arcade modes in the hub.',
      xp: 80,
      coins: 40,
      trigger: 'explore'
    }
  ];

  const FALLBACK_POOL = [
    {
      id: 'reflex-sprint',
      title: 'Lightning Reflex',
      desc: 'Finish a reaction test round to earn bonus speed rewards.',
      xp: 50,
      coins: 25,
      trigger: 'reaction'
    },
    {
      id: 'reflex-focus',
      title: 'Green Signal Drill',
      desc: 'Log another reaction score on the reflex pad.',
      xp: 45,
      coins: 20,
      trigger: 'reaction'
    },
    {
      id: 'click-overdrive',
      title: 'Overdrive Taps',
      desc: 'Complete a timed clicker run to rack up fast taps.',
      xp: 60,
      coins: 30,
      trigger: 'clicker'
    },
    {
      id: 'click-endurance',
      title: 'Timer Finisher',
      desc: 'Beat the clock on any clicker timer setting.',
      xp: 65,
      coins: 35,
      trigger: 'clicker'
    },
    {
      id: 'puzzle-master',
      title: 'Board Architect',
      desc: 'Snap every piece into its slot to solve the board.',
      xp: 75,
      coins: 35,
      trigger: 'puzzle'
    },
    {
      id: 'puzzle-precision',
      title: 'Clean Snap',
      desc: 'Complete a full puzzle board solve.',
      xp: 70,
      coins: 30,
      trigger: 'puzzle'
    },
    {
      id: 'arcade-tour',
      title: 'Full Arcade Tour',
      desc: 'Visit all three modes (Reaction, Clicker, Puzzle).',
      xp: 85,
      coins: 45,
      trigger: 'explore'
    }
  ];

  function createFallbackApi() {
    function loadData() {
      try {
        const raw = JSON.parse(localStorage.getItem(FALLBACK_KEY));
        const validQuests = Array.isArray(raw?.activeQuests) && raw.activeQuests.length > 0
          ? raw.activeQuests
          : FALLBACK_BASE_QUESTS.map((q) => ({ ...q }));

        return {
          xp: typeof raw?.xp === 'number' && raw.xp >= 0 ? Math.floor(raw.xp) : 0,
          coins: typeof raw?.coins === 'number' && raw.coins >= 0 ? Math.floor(raw.coins) : FALLBACK_COINS,
          activeQuests: validQuests,
          claimedIds: Array.isArray(raw?.claimedIds) ? raw.claimedIds : [],
          visitedModes: Array.isArray(raw?.visitedModes) ? raw.visitedModes : []
        };
      } catch {
        return {
          xp: 0,
          coins: FALLBACK_COINS,
          activeQuests: FALLBACK_BASE_QUESTS.map((q) => ({ ...q })),
          claimedIds: [],
          visitedModes: []
        };
      }
    }

    function saveData(data) {
      try {
        localStorage.setItem(FALLBACK_KEY, JSON.stringify(data));
      } catch {
        // Ignore storage errors
      }
    }

    function getLevelInfo(totalXp) {
      const level = Math.floor(totalXp / FALLBACK_XP_PER_LEVEL) + 1;
      const intoLevel = totalXp % FALLBACK_XP_PER_LEVEL;
      const pct = Math.min(100, Math.round((intoLevel / FALLBACK_XP_PER_LEVEL) * 100));
      let rank = 'ROOKIE';
      if (level >= 5) rank = 'APEX';
      else if (level >= 3) rank = 'VETERAN';
      else if (level >= 2) rank = 'CONTENDER';
      return { level, intoLevel, pct, rank, totalXp };
    }

    function completeQuest(questIdOrTrigger) {
      const data = loadData();
      const quest = data.activeQuests.find(
        (q) => q.id === questIdOrTrigger || q.trigger === questIdOrTrigger
      );
      if (!quest || data.claimedIds.includes(quest.id)) return null;

      const prevLevel = getLevelInfo(data.xp).level;
      data.claimedIds.push(quest.id);
      data.xp += quest.xp;
      data.coins += typeof quest.coins === 'number' ? quest.coins : 20;
      saveData(data);

      const nextLevel = getLevelInfo(data.xp).level;
      return { quest, data, leveledUp: nextLevel > prevLevel, level: nextLevel };
    }

    function refreshQuestsWithCoins() {
      const data = loadData();
      if (data.coins < FALLBACK_REROLL_COST) {
        return { ok: false, reason: 'insufficient_coins', data };
      }

      const pool = FALLBACK_POOL.slice();
      for (let i = pool.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        const tmp = pool[i];
        pool[i] = pool[j];
        pool[j] = tmp;
      }

      data.coins -= FALLBACK_REROLL_COST;
      data.activeQuests = pool.slice(0, 4).map((q, idx) => ({
        ...q,
        id: `${q.id}-${Date.now().toString(36)}-${idx}`
      }));
      data.claimedIds = [];
      saveData(data);
      return { ok: true, data };
    }

    function resetAllQuestData() {
      const fresh = {
        xp: 0,
        coins: FALLBACK_COINS,
        activeQuests: FALLBACK_BASE_QUESTS.map((q) => ({ ...q })),
        claimedIds: [],
        visitedModes: []
      };
      saveData(fresh);
      return fresh;
    }

    return {
      XP_PER_LEVEL: FALLBACK_XP_PER_LEVEL,
      REROLL_COST: FALLBACK_REROLL_COST,
      loadData,
      saveData,
      getLevelInfo,
      completeQuest,
      refreshQuestsWithCoins,
      resetAllQuestData
    };
  }

  const api = window.ArcadeQuests || createFallbackApi();

  const dom = {
    questList: document.getElementById('questList'),
    topCoinBalance: document.getElementById('topCoinBalance'),
    levelBadge: document.getElementById('levelBadge'),
    xpBannerTitle: document.getElementById('xpBannerTitle'),
    xpHint: document.getElementById('xpHint'),
    xpPercent: document.getElementById('xpPercent'),
    xpFill: document.getElementById('xpFill'),
    xpProgressBar: document.getElementById('xpProgressBar'),
    questCounter: document.getElementById('questCounter'),
    btnRefreshQuests: document.getElementById('btnRefreshQuests'),
    levelUpToast: document.getElementById('levelUpToast'),
    levelUpText: document.getElementById('levelUpText'),
    btnResetQuests: document.getElementById('btnResetQuests')
  };

  function renderAll() {
    if (!dom.questList) return;

    let state = api.loadData();
    if (!Array.isArray(state.activeQuests) || state.activeQuests.length === 0) {
      state = api.resetAllQuestData();
    }

    const info = api.getLevelInfo(state.xp);

    if (dom.topCoinBalance) dom.topCoinBalance.textContent = `🪙 ${state.coins} COINS`;
    if (dom.levelBadge) dom.levelBadge.textContent = `LEVEL ${info.level} • ${info.rank}`;
    if (dom.xpBannerTitle) dom.xpBannerTitle.textContent = `${info.intoLevel} / ${api.XP_PER_LEVEL} XP`;
    if (dom.xpHint) {
      dom.xpHint.textContent = `Total XP: ${state.xp} • ${api.XP_PER_LEVEL - info.intoLevel} XP needed for Level ${info.level + 1}.`;
    }
    if (dom.xpPercent) dom.xpPercent.textContent = `${info.pct}%`;
    if (dom.xpFill) dom.xpFill.style.width = `${info.pct}%`;
    if (dom.xpProgressBar) dom.xpProgressBar.setAttribute('aria-valuenow', String(info.pct));
    if (dom.questCounter) {
      dom.questCounter.textContent = `${state.claimedIds.length} / ${state.activeQuests.length} CLAIMED`;
    }
    if (dom.btnRefreshQuests) {
      dom.btnRefreshQuests.textContent = `🔄 New Quests (${api.REROLL_COST} 🪙)`;
      dom.btnRefreshQuests.disabled = state.coins < api.REROLL_COST;
    }

    dom.questList.innerHTML = '';

    for (const quest of state.activeQuests) {
      const claimed = state.claimedIds.includes(quest.id);
      const rewardCoins = typeof quest.coins === 'number' ? quest.coins : 20;

      const card = document.createElement('article');
      card.className = `quest-card${claimed ? ' completed' : ''}`;

      const infoBox = document.createElement('div');
      infoBox.className = 'quest-info';

      const titleRow = document.createElement('div');
      titleRow.className = 'quest-title-row';

      const title = document.createElement('h3');
      title.textContent = quest.title;

      const xpBadge = document.createElement('span');
      xpBadge.className = 'xp-reward';
      xpBadge.textContent = `+${quest.xp} XP`;

      const coinBadge = document.createElement('span');
      coinBadge.className = 'coin-reward';
      coinBadge.textContent = `+${rewardCoins} 🪙`;

      const desc = document.createElement('p');
      desc.textContent = quest.desc;

      titleRow.append(title, xpBadge, coinBadge);
      infoBox.append(titleRow, desc);

      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'claim-btn';
      btn.disabled = claimed;
      btn.textContent = claimed ? '✓ Claimed' : 'Claim Reward';
      btn.addEventListener('click', () => {
        const result = api.completeQuest(quest.id);
        if (result && result.leveledUp && dom.levelUpToast && dom.levelUpText) {
          dom.levelUpText.textContent = `Level Up! You reached Level ${result.level}!`;
          dom.levelUpToast.classList.remove('hidden');
        }
        renderAll();
      });

      card.append(infoBox, btn);
      dom.questList.appendChild(card);
    }
  }

  dom.btnRefreshQuests?.addEventListener('click', () => {
    const res = api.refreshQuestsWithCoins();
    if (res.ok && dom.levelUpToast) {
      dom.levelUpToast.classList.add('hidden');
    }
    renderAll();
  });

  dom.btnResetQuests?.addEventListener('click', () => {
    api.resetAllQuestData();
    if (dom.levelUpToast) dom.levelUpToast.classList.add('hidden');
    renderAll();
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', renderAll);
  } else {
    renderAll();
  }
})();