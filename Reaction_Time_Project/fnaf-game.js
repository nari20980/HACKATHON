'use strict';

(function () {
  const HOURS = ['12 AM', '1 AM', '2 AM', '3 AM', '4 AM', '5 AM', '6 AM'];
  const SECONDS_PER_HOUR = 30; // 30s per hour = 3-minute (180s) full night

  const canvas = document.getElementById('fnafCanvas');
  const ctx = canvas?.getContext('2d');

  const dom = {
    time: document.getElementById('fnafTime'),
    power: document.getElementById('fnafPower'),
    usage: document.getElementById('fnafUsage'),
    doorBtn: document.getElementById('btnToggleDoor'),
    camBtn: document.getElementById('btnToggleCam'),
    cam1Btn: document.getElementById('btnCam1'),
    cam2Btn: document.getElementById('btnCam2'),
    restartBtn: document.getElementById('btnRestartNight'),
    status: document.getElementById('fnafStatus')
  };

  const W = canvas ? canvas.width : 480;
  const H = canvas ? canvas.height : 290;

  // Bot locations: 0 = Stage (CAM 1), 1 = Hallway (CAM 2), 2 = Doorway, 3 = Jumpscare
  let botLoc = 0;
  let doorClosed = false;
  let camOn = false;
  let camView = 1; // 1 or 2

  let power = 100;
  let elapsedSec = 0;
  let aiTimer = 0;
  let gameState = 'playing'; // 'playing' | 'won' | 'lost'
  let rewardGiven = false;
  let lastTs = performance.now();

  function currentUsage() {
    let u = 1;
    if (doorClosed) u += 1;
    if (camOn) u += 1;
    return u;
  }

  function currentHourIndex() {
    return Math.min(HOURS.length - 1, Math.floor(elapsedSec / SECONDS_PER_HOUR));
  }

  function syncHud() {
    const hIdx = currentHourIndex();
    const u = currentUsage();
    if (dom.time) dom.time.textContent = HOURS[hIdx];
    if (dom.power) dom.power.textContent = `${Math.max(0, Math.ceil(power))}%`;
    if (dom.usage) dom.usage.textContent = `${u}x`;

    if (dom.doorBtn) {
      dom.doorBtn.textContent = doorClosed ? '🚪 Door: CLOSED (D)' : '🚪 Door: OPEN (D)';
      dom.doorBtn.classList.toggle('closed', doorClosed);
    }
    if (dom.camBtn) {
      dom.camBtn.textContent = camOn ? '📷 Monitor: ON (C)' : '📷 Monitor: OFF (C)';
      dom.camBtn.classList.toggle('on', camOn);
    }
    if (dom.cam1Btn) dom.cam1Btn.classList.toggle('active', camOn && camView === 1);
    if (dom.cam2Btn) dom.cam2Btn.classList.toggle('active', camOn && camView === 2);
  }

  function awardNightWin() {
    if (rewardGiven) return;
    rewardGiven = true;
    const api = window.ArcadeQuests;
    if (api && typeof api.loadData === 'function' && typeof api.saveData === 'function') {
      const state = api.loadData();
      state.xp = (Number(state.xp) || 0) + 45;
      state.coins = (Number(state.coins) || 0) + 20;
      api.saveData(state);
    }
  }

  function triggerLoss(reason) {
    if (gameState !== 'playing') return;
    gameState = 'lost';
    doorClosed = false;
    camOn = false;
    syncHud();
    if (dom.status) {
      dom.status.textContent = `${reason} Click Restart Night to try again.`;
    }
  }

  function triggerWin() {
    if (gameState !== 'playing') return;
    gameState = 'won';
    doorClosed = false;
    camOn = false;
    awardNightWin();
    syncHud();
    if (dom.status) {
      dom.status.textContent = '6:00 AM! You survived the full night shift and earned +45 XP and +20 Coins!';
    }
  }

  function restartNight() {
    botLoc = 0;
    doorClosed = false;
    camOn = false;
    camView = 1;
    power = 100;
    elapsedSec = 0;
    aiTimer = 0;
    gameState = 'playing';
    rewardGiven = false;
    lastTs = performance.now();
    syncHud();
    if (dom.status) {
      dom.status.textContent = '12 AM shift started (30s per hour). Watch cameras and save power!';
    }
  }

  function toggleDoor() {
    if (gameState !== 'playing') return;
    if (power <= 0) return;
    doorClosed = !doorClosed;
    syncHud();
  }

  function toggleCam() {
    if (gameState !== 'playing') return;
    if (power <= 0) return;
    camOn = !camOn;
    syncHud();
  }

  function selectCam(view) {
    if (gameState !== 'playing') return;
    camView = view;
    camOn = true;
    syncHud();
  }

  function stepAi(dt) {
    const hourFactor = Math.max(0.65, 1 - currentHourIndex() * 0.05);
    const moveInterval = (power <= 0 ? 2.4 : 5.4) * hourFactor;
    aiTimer += dt;
    if (aiTimer < moveInterval) return;
    aiTimer = 0;

    if (botLoc === 0) {
      if (Math.random() < 0.62) {
        botLoc = 1;
        if (dom.status && gameState === 'playing') {
          dom.status.textContent = 'Movement detected in the Hallway (CAM 2)!';
        }
      }
    } else if (botLoc === 1) {
      if (Math.random() < 0.65) {
        botLoc = 2;
        if (dom.status && gameState === 'playing') {
          dom.status.textContent = 'Animatronic is at your Doorway! Close the door (D)!';
        }
      } else if (Math.random() < 0.25) {
        botLoc = 0;
      }
    } else if (botLoc === 2) {
      if (doorClosed) {
        botLoc = 0;
        if (dom.status && gameState === 'playing') {
          dom.status.textContent = 'Blocked by the security door! The animatronic retreated to Stage.';
        }
      } else {
        botLoc = 3;
        triggerLoss('The animatronic entered the office because the door was open!');
      }
    }
  }

  function update(now) {
    const dt = Math.min(0.25, Math.max(0, (now - lastTs) / 1000));
    lastTs = now;

    if (gameState !== 'playing') return;

    elapsedSec += dt;
    if (elapsedSec >= SECONDS_PER_HOUR * (HOURS.length - 1)) {
      elapsedSec = SECONDS_PER_HOUR * (HOURS.length - 1);
      triggerWin();
      return;
    }

    if (power > 0) {
      const drainRate = 0.24 + (doorClosed ? 0.22 : 0) + (camOn ? 0.18 : 0);
      power = Math.max(0, power - drainRate * dt);
      if (power <= 0) {
        doorClosed = false;
        camOn = false;
        if (dom.status) {
          dom.status.textContent = 'Power out! Doors and monitors are offline!';
        }
      }
    }

    stepAi(dt);
    syncHud();
  }

  function drawBot(x, y, scale = 1) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);

    ctx.fillStyle = '#7c3aed';
    ctx.fillRect(-18, -10, 36, 42);

    ctx.fillStyle = '#a855f7';
    ctx.beginPath();
    ctx.arc(0, -24, 18, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.arc(-14, -40, 6, 0, Math.PI * 2);
    ctx.arc(14, -40, 6, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#fef08a';
    ctx.beginPath();
    ctx.arc(-6, -25, 3.5, 0, Math.PI * 2);
    ctx.arc(6, -25, 3.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  function drawScene() {
    if (!ctx) return;

    ctx.fillStyle = '#050814';
    ctx.fillRect(0, 0, W, H);

    if (camOn && power > 0) {
      ctx.fillStyle = '#071124';
      ctx.fillRect(14, 14, W - 28, H - 28);
      ctx.strokeStyle = 'rgba(34, 211, 238, 0.45)';
      ctx.lineWidth = 2;
      ctx.strokeRect(14, 14, W - 28, H - 28);

      ctx.fillStyle = '#67e8f9';
      ctx.font = '700 13px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.fillText(camView === 1 ? 'CAM 01 • SHOW STAGE' : 'CAM 02 • EAST HALLWAY', 28, 38);

      if (camView === 1 && botLoc === 0) {
        drawBot(W / 2, H * 0.62, 1.05);
      } else if (camView === 2 && botLoc === 1) {
        drawBot(W / 2, H * 0.64, 1.15);
      } else {
        ctx.fillStyle = '#94a3b8';
        ctx.font = '600 14px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('No animatronic visible on this feed', W / 2, H * 0.52);
      }
    } else {
      ctx.fillStyle = '#0b1020';
      ctx.fillRect(24, 24, W - 48, H - 48);

      ctx.fillStyle = '#111827';
      ctx.fillRect(46, 56, 96, 178);
      if (doorClosed && power > 0) {
        ctx.fillStyle = 'rgba(244, 63, 94, 0.35)';
        ctx.fillRect(46, 56, 96, 178);
        ctx.strokeStyle = '#f43f5e';
        ctx.lineWidth = 3;
        ctx.strokeRect(46, 56, 96, 178);
      } else {
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 2;
        ctx.strokeRect(46, 56, 96, 178);
      }

      if (botLoc === 2 || botLoc === 3) {
        drawBot(94, 165, 1.1);
      }

      ctx.fillStyle = '#1e293b';
      ctx.fillRect(160, H - 72, W - 184, 42);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '700 12px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.fillText('SECURITY OFFICE', 174, 46);
    }

    if (gameState === 'won') {
      ctx.fillStyle = 'rgba(4, 8, 20, 0.72)';
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = '#6ee7b7';
      ctx.font = '800 22px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('6:00 AM — SHIFT COMPLETE!', W / 2, H * 0.5);
    } else if (gameState === 'lost') {
      ctx.fillStyle = 'rgba(4, 8, 20, 0.75)';
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = '#fda4af';
      ctx.font = '800 22px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('GAME OVER', W / 2, H * 0.5);
    }
  }

  function loop(now) {
    update(now);
    drawScene();
    requestAnimationFrame(loop);
  }

  dom.doorBtn?.addEventListener('click', toggleDoor);
  dom.camBtn?.addEventListener('click', toggleCam);
  dom.cam1Btn?.addEventListener('click', () => selectCam(1));
  dom.cam2Btn?.addEventListener('click', () => selectCam(2));
  dom.restartBtn?.addEventListener('click', restartNight);

  window.addEventListener('keydown', (e) => {
    const k = e.key.toLowerCase();
    if (k === 'd') toggleDoor();
    else if (k === 'c') toggleCam();
    else if (k === '1') selectCam(1);
    else if (k === '2') selectCam(2);
  });

  syncHud();
  requestAnimationFrame(loop);
})();