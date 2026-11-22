'use strict';

(function () {
  const CLAIMED_KEY = 'arcade_xp_redeemed_v1';

  const ITEMS = [
    {
      id: 'sneakers-runner',
      cat: 'shoes',
      photo: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=640&q=80',
      alt: 'Athletic running sneakers',
      name: 'Neon Court Sneakers',
      xpCost: 150,
      desc: 'Lightweight everyday street sneakers built for comfort and grip.'
    },
    {
      id: 'hi-top-kicks',
      cat: 'shoes',
      photo: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=640&q=80',
      alt: 'Leather high-top shoes',
      name: 'Midnight Hi-Tops',
      xpCost: 280,
      desc: 'Classic high-top shoes with cushioned soles and clean styling.'
    },
    {
      id: 'phone-pro',
      cat: 'phones',
      photo: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=640&q=80',
      alt: 'Modern smartphone on dark surface',
      name: 'Pulse Smartphone X',
      xpCost: 600,
      desc: 'Flagship-style smartphone with a sharp OLED screen and fast performance.'
    },
    {
      id: 'phone-mini',
      cat: 'phones',
      photo: 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?auto=format&fit=crop&w=640&q=80',
      alt: 'Sleek mobile phone display',
      name: 'Pocket Mini Phone',
      xpCost: 350,
      desc: 'Compact everyday phone ideal for gaming, calls, and media.'
    },
    {
      id: 'studio-cans',
      cat: 'headphones',
      photo: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=640&q=80',
      alt: 'Over-ear studio headphones',
      name: 'Bassline Over-Ear Headphones',
      xpCost: 220,
      desc: 'Over-ear headphones delivering punchy bass and clear audio.'
    },
    {
      id: 'wireless-buds',
      cat: 'headphones',
      photo: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=640&q=80',
      alt: 'Wireless earbuds in charging case',
      name: 'Aero Wireless Earbuds',
      xpCost: 180,
      desc: 'Compact wireless earbuds for rhythm games and daily listening.'
    },
    {
      id: 'gaming-pad',
      cat: 'gear',
      photo: 'https://images.unsplash.com/photo-1592840496694-26d035ef52b7?auto=format&fit=crop&w=640&q=80',
      alt: 'Wireless gamepad controller',
      name: 'Pro Arcade Controller',
      xpCost: 320,
      desc: 'Ergonomic gamepad with responsive buttons and analog sticks.'
    },
    {
      id: 'tech-pack',
      cat: 'gear',
      photo: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=640&q=80',
      alt: 'Everyday backpack gear bag',
      name: 'Cyber Commuter Backpack',
      xpCost: 200,
      desc: 'Durable backpack for carrying your phone, headphones, and gear.'
    }
  ];

  const dom = {
    xpCounterValue: document.getElementById('xpCounterValue'),
    xpBalance: document.getElementById('xpBalance'),
    claimedCount: document.getElementById('xpClaimedCount'),
    grid: document.getElementById('xpCatalogGrid'),
    status: document.getElementById('xpShopStatus'),
    bonusBtn: document.getElementById('btnGrantTestXp'),
    popup: document.getElementById('xpPopup'),
    popupImg: document.getElementById('xpPopupImg'),
    popupTitle: document.getElementById('xpPopupTitle'),
    popupSub: document.getElementById('xpPopupSub'),
    popupClose: document.getElementById('xpPopupClose')
  };

  let activeCat = 'all';
  let popupTimer = null;

  function getXp() {
    const api = window.ArcadeQuests;
    if (api && typeof api.loadData === 'function') {
      const d = api.loadData();
      return Math.max(0, Number(d?.xp) || 0);
    }
    return 0;
  }

  function setXp(nextXp) {
    const api = window.ArcadeQuests;
    if (api && typeof api.loadData === 'function' && typeof api.saveData === 'function') {
      const d = api.loadData();
      d.xp = Math.max(0, Math.round(nextXp));
      api.saveData(d);
    }
  }

  function loadClaimed() {
    try {
      const raw = JSON.parse(localStorage.getItem(CLAIMED_KEY) || '[]');
      return Array.isArray(raw) ? raw : [];
    } catch { return []; }
  }

  function saveClaimed(ids) {
    try { localStorage.setItem(CLAIMED_KEY, JSON.stringify(ids)); } catch {}
  }

  function showPopup(item, remainingXp) {
    if (!dom.popup || !dom.popupTitle || !dom.popupSub) return;
    if (dom.popupImg) {
      dom.popupImg.src = item.photo;
      dom.popupImg.alt = item.alt;
    }
    dom.popupTitle.textContent = `You bought: ${item.name}`;
    dom.popupSub.textContent = `Spent ${item.xpCost} XP • Remaining: ${remainingXp} XP`;
    dom.popup.classList.add('show');
    if (popupTimer) clearTimeout(popupTimer);
    popupTimer = setTimeout(() => dom.popup?.classList.remove('show'), 4200);
  }

  function render() {
    const xp = getXp();
    const claimed = loadClaimed();

    if (dom.xpCounterValue) dom.xpCounterValue.textContent = `${xp} XP`;
    if (dom.xpBalance) dom.xpBalance.textContent = `${xp} XP`;
    if (dom.claimedCount) dom.claimedCount.textContent = String(claimed.length);
    if (!dom.grid) return;

    const visible = activeCat === 'all' ? ITEMS : ITEMS.filter((it) => it.cat === activeCat);
    dom.grid.innerHTML = '';

    for (const item of visible) {
      const isClaimed = claimed.includes(item.id);
      const canAfford = xp >= item.xpCost;

      const card = document.createElement('article');
      card.className = 'item-card';
      card.innerHTML = `
        <div>
          <div class="item-photo-wrap">
            <img class="item-photo" src="${item.photo}" alt="${item.alt}" loading="lazy" />
          </div>
          <span class="item-cat">${item.cat}</span>
          <h3>${item.name}</h3>
          <p>${item.desc}</p>
        </div>
        <div class="item-footer">
          <span class="xp-cost">${item.xpCost} XP</span>
          <button type="button" class="btn-redeem" ${isClaimed || !canAfford ? 'disabled' : ''}>
            ${isClaimed ? 'Redeemed ✓' : canAfford ? 'Redeem XP' : 'Need XP'}
          </button>
        </div>
      `;

      const img = card.querySelector('.item-photo');
      img?.addEventListener('error', () => {
        img.src = `https://placehold.co/640x400/0f172a/22d3ee?text=${encodeURIComponent(item.name)}`;
      }, { once: true });

      const btn = card.querySelector('.btn-redeem');
      btn?.addEventListener('click', () => {
        const curXp = getXp();
        const curClaimed = loadClaimed();
        if (curClaimed.includes(item.id) || curXp < item.xpCost) return;

        const nextXp = curXp - item.xpCost;
        setXp(nextXp);
        curClaimed.push(item.id);
        saveClaimed(curClaimed);

        if (dom.status) {
          dom.status.textContent = `Redeemed ${item.name} for ${item.xpCost} XP!`;
        }
        showPopup(item, nextXp);
        render();
      });

      dom.grid.appendChild(card);
    }
  }

  document.querySelectorAll('.filter-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      activeCat = btn.dataset.cat || 'all';
      document.querySelectorAll('.filter-btn').forEach((b) => b.classList.toggle('active', b === btn));
      render();
    });
  });

  dom.bonusBtn?.addEventListener('click', () => {
    const nextXp = getXp() + 250;
    setXp(nextXp);
    if (dom.status) dom.status.textContent = 'Added +250 Test XP so you can test redeeming items!';
    render();
  });

  dom.popupClose?.addEventListener('click', () => dom.popup?.classList.remove('show'));
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') dom.popup?.classList.remove('show');
  });

  render();
})();