const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const bgMusic = document.getElementById("bgMusic");

const State = {
  MENU: 0,
  ROOM_1_HOME: 1,
  ROOM_2_BATH: 2,
  ROOM_3_GARDEN: 3,
  ROOM_4_CLOSET: 4,
  ROOM_5_STORE: 5,
  ROOM_6_KITCHEN: 6,
  SETTINGS: 10,
  ARCADE_FLAP: 7,
  ARCADE_CATCH: 8,
  ARCADE_BUBBLES: 9
};
let currentState = State.MENU;
const ECONOMY_KEY = 'duckSharedEconomyV2';
const sharedEconomy = Arcade.read();
const VIP_REWARDS = ['vipTiara', 'vipCape', 'vipWings', 'vipCollar', 'vipRainbowBow', 'vipThrone', 'vipChandelier', 'vipDiamondRug', 'vipMirror', 'vipCurtains'];

function applyVerifiedVip(economy) {
  if (!economy?.vip || pet.vip) return;
  pet.vip = true; pet.coins = economy.coins;
  VIP_REWARDS.forEach(item => pet.owned[item] = true);
  saveState();
  document.getElementById('vipSuccessToast').classList.add('show');
  setTimeout(() => document.getElementById('vipSuccessToast').classList.remove('show'), 4500);
}

const saved = Arcade.safeRead("duckPetFinalVersionV1");
const pet = {
  hunger: saved.hunger ?? 100,
  cleanliness: saved.cleanliness ?? 100,
  energy: saved.energy ?? 100,
  get coins() { return Arcade.read().coins; },
  set coins(value) { const delta = value - Arcade.read().coins; if (delta > 0) Arcade.earn(delta); else Arcade.spend(-delta); },
  musicEnabled: saved.musicEnabled ?? true,
  sfxEnabled: saved.sfxEnabled ?? true,
  isSleeping: false,
  growthStage: saved.growthStage ?? 0,
  birthTime: saved.birthTime ?? Date.now(),
  owned: {
    hat: saved.owned?.hat ?? false, ribbon: saved.owned?.ribbon ?? false,
    tux: saved.owned?.tux ?? false, tie: saved.owned?.tie ?? false,
    cowboyHat: saved.owned?.cowboyHat ?? false, topHat: saved.owned?.topHat ?? false,
    crown: saved.owned?.crown ?? false, scarf: saved.owned?.scarf ?? false,
    dress: saved.owned?.dress ?? false, skirt: saved.owned?.skirt ?? false, shoes: saved.owned?.shoes ?? false,
    clock: saved.owned?.clock ?? false, chair: saved.owned?.chair ?? false,
    table: saved.owned?.table ?? false, plant: saved.owned?.plant ?? false,
    rug: saved.owned?.rug ?? false, lamp: saved.owned?.lamp ?? false,
    bookshelf: saved.owned?.bookshelf ?? false, painting: saved.owned?.painting ?? false,
    sofa: saved.owned?.sofa ?? false, drawer: saved.owned?.drawer ?? false,
    // VIP exclusive items
    vipTiara: saved.owned?.vipTiara ?? false, vipCape: saved.owned?.vipCape ?? false,
    vipWings: saved.owned?.vipWings ?? false, vipCollar: saved.owned?.vipCollar ?? false,
    vipRainbowBow: saved.owned?.vipRainbowBow ?? false,
    vipThrone: saved.owned?.vipThrone ?? false, vipChandelier: saved.owned?.vipChandelier ?? false,
    vipDiamondRug: saved.owned?.vipDiamondRug ?? false, vipMirror: saved.owned?.vipMirror ?? false,
    vipCurtains: saved.owned?.vipCurtains ?? false,
  },
  equippedHat: saved.equippedHat ?? false,
  equippedTux: saved.equippedTux ?? false,
  equippedRibbon: saved.equippedRibbon ?? false,
  equippedTie: saved.equippedTie ?? false,
  equippedCowboy: saved.equippedCowboy ?? false,
  equippedTopHat: saved.equippedTopHat ?? false,
  equippedCrown: saved.equippedCrown ?? false,
  equippedScarf: saved.equippedScarf ?? false,
  equippedDress: saved.equippedDress ?? false,
  equippedSkirt: saved.equippedSkirt ?? false,
  equippedShoes: saved.equippedShoes ?? false,
  // VIP equipped
  equippedVipTiara: saved.equippedVipTiara ?? false,
  equippedVipCape: saved.equippedVipCape ?? false,
  equippedVipWings: saved.equippedVipWings ?? false,
  equippedVipCollar: saved.equippedVipCollar ?? false,
  equippedVipRainbowBow: saved.equippedVipRainbowBow ?? false,
  // VIP status & duck color
  vip: sharedEconomy.vip ?? saved.vip ?? false,
  duckColor: saved.duckColor ?? '#facc15',
  inventory: saved.inventory ?? { bread: 3, carrots: 3, seeds: 3 }
};

if (bgMusic) {
  bgMusic.volume = 0.25;
  if (pet.musicEnabled) {
    bgMusic.play().catch(() => {
      const unlockAudio = () => {
        if (pet.musicEnabled) bgMusic.play().catch(() => {});
        window.removeEventListener('click', unlockAudio);
        window.removeEventListener('touchstart', unlockAudio);
      };
      window.addEventListener('click', unlockAudio);
      window.addEventListener('touchstart', unlockAudio);
    });
  }
}

let storeTab = 'clothes';
let storeScrollY = 0;
let wardrobeScrollY = 0;
let gameplaySecondsCounter = 0;

const duckWalk = {
  x: 225,
  y: 410,
  targetX: 225,
  isWalking: false,
  speed: 120
};

function saveState() {
  if (window.parent !== window) window.parent.postMessage({ type: 'duck-economy-updated' }, '*');
  localStorage.setItem("duckPetFinalVersionV1", JSON.stringify({
    hunger: pet.hunger, cleanliness: pet.cleanliness, energy: pet.energy,
    coins: pet.coins, musicEnabled: pet.musicEnabled, sfxEnabled: pet.sfxEnabled,
    growthStage: pet.growthStage, birthTime: pet.birthTime,
    owned: pet.owned, equippedHat: pet.equippedHat, equippedTux: pet.equippedTux,
    equippedRibbon: pet.equippedRibbon, equippedTie: pet.equippedTie,
    equippedCowboy: pet.equippedCowboy, equippedTopHat: pet.equippedTopHat,
    equippedCrown: pet.equippedCrown, equippedScarf: pet.equippedScarf,
    equippedDress: pet.equippedDress, equippedSkirt: pet.equippedSkirt, equippedShoes: pet.equippedShoes,
    equippedVipTiara: pet.equippedVipTiara, equippedVipCape: pet.equippedVipCape,
    equippedVipWings: pet.equippedVipWings, equippedVipCollar: pet.equippedVipCollar,
    equippedVipRainbowBow: pet.equippedVipRainbowBow,
    vip: pet.vip, duckColor: pet.duckColor,
    inventory: pet.inventory
  }));
}

window.addEventListener('storage', event => { if (event.key === ECONOMY_KEY) applyVerifiedVip(Arcade.read()); });

const gardenPlots = [
  { x: 90, y: 520, radius: 45, stage: 0, cooldown: 0 },
  { x: 225, y: 520, radius: 35, stage: 0, cooldown: 0 },
  { x: 360, y: 520, radius: 45, stage: 0, cooldown: 0 }
];

let clickPops = [];
function spawnClickerPop(x, y) {
  clickPops.push({ x, y, alpha: 1.0, scale: 0.4 });
  if (pet.sfxEnabled) AudioEngine.pop();
}

let fridgeOpen = false;

let interactiveBubbles = [];
function initBubbleGame() {
  interactiveBubbles = [];
  for(let i=0; i<10; i++) {
    interactiveBubbles.push({
      x: Math.random() * 350 + 50,
      y: Math.random() * 400 + 50,
      radius: Math.random() * 25 + 20,
      vy: -Math.random() * 60 - 30
    });
  }
}
let bubbleGameScore = 0;

const basket = { x: 225, y: 520, width: 85, height: 20, speed: 420 };
const breadObj = { x: 225, y: 0, radius: 11, speed: 290 };
let catchTimer = 15; let catchScore = 0;

const flapDuck = { x: 90, y: 250, vy: 0, gravity: 980, jump: -320, size: 28 };
let flapPipes = []; let flapScore = 0; let flapSpawnTimer = 0; let flapGameOver = false;
const keys = {};
const DUCK_COLOR_MAP = {
  '#facc15': { body: '#facc15', highlight: '#fef08a' },
  '#f8fafc': { body: '#f8fafc', highlight: '#ffffff' },
  '#334155': { body: '#334155', highlight: '#475569' },
  '#f9a8d4': { body: '#f9a8d4', highlight: '#fce7f3' },
  '#7dd3fc': { body: '#7dd3fc', highlight: '#e0f2fe' },
  '#c4b5fd': { body: '#c4b5fd', highlight: '#ede9fe' },
};

const topStats = document.getElementById("topStats");
const barHunger = document.getElementById("barHunger");
const barClean = document.getElementById("barClean");
const barEnergy = document.getElementById("barEnergy");
const coinVal = document.getElementById("coinVal");

function updateHUD() {
  barHunger.style.width = `${pet.hunger}%`;
  barClean.style.width = `${pet.cleanliness}%`;
  barEnergy.style.width = `${pet.energy}%`;
  coinVal.textContent = pet.coins;
}

function switchRoom(state) {
  if (pet.sfxEnabled) AudioEngine.pop();
  currentState = state;
  const isMenu = (state === State.MENU);
  fridgeOpen = false;
  storeScrollY = 0;
  wardrobeScrollY = 0;

  topStats.style.display = isMenu ? "none" : "flex";
  document.getElementById("uiControlPanel").style.display = isMenu ? "none" : "flex";
  
  if (isMenu) {
    canvas.style.top = "0px";
    canvas.style.height = "100%";
    canvas.height = 800;
  } else {
    canvas.style.top = "125px";
    canvas.style.height = "calc(100% - 200px)";
    canvas.height = 600;
  }

  document.getElementById("gamesDropdown").style.display = "none";

  if (state === State.ARCADE_BUBBLES) {
    bubbleGameScore = 0;
    initBubbleGame();
  } else if (state === State.ARCADE_CATCH) {
    catchScore = 0;
    catchTimer = 15;
    breadObj.y = 0;
    breadObj.x = Math.random() * 320 + 60;
  } else if (state === State.ARCADE_FLAP) {
    flapDuck.y = 250;
    flapDuck.vy = 0;
    flapPipes = [];
    flapScore = 0;
    flapGameOver = false;
  }
}

function toggleGameMenu() {
  if (pet.energy <= 0) {
    alert("Duck too tired");
    return;
  }
  const menu = document.getElementById("gamesDropdown");
  menu.style.display = menu.style.display === "none" ? "flex" : "none";
}

canvas.addEventListener("wheel", (e) => {
  if (currentState === State.ROOM_5_STORE) {
    storeScrollY = Math.max(0, Math.min(450, storeScrollY + e.deltaY * 0.5));
    e.preventDefault();
  } else if (currentState === State.ROOM_4_CLOSET) {
    wardrobeScrollY = Math.max(0, Math.min(900, wardrobeScrollY + e.deltaY * 0.5));
    e.preventDefault();
  }
}, { passive: false });

// ── Touch Support ─────────────────────────────────────────────────────────────
// Forward touchstart → click so every tap triggers the existing click handler
canvas.addEventListener("touchstart", (e) => {
  e.preventDefault();
  const touch = e.changedTouches[0];
  const simulatedEvent = new MouseEvent("click", {
    clientX: touch.clientX,
    clientY: touch.clientY,
    bubbles: true,
    cancelable: true
  });
  canvas.dispatchEvent(simulatedEvent);
}, { passive: false });

// Touchmove: scroll store/wardrobe, drag bread-catch basket
let _lastTouchY = null;
let _lastTouchX = null;
canvas.addEventListener("touchmove", (e) => {
  e.preventDefault();
  const touch = e.touches[0];
  const rect = canvas.getBoundingClientRect();
  const touchX = ((touch.clientX - rect.left) / rect.width) * canvas.width;
  const touchY = ((touch.clientY - rect.top) / rect.height) * canvas.height;

  if (currentState === State.ROOM_5_STORE) {
    if (_lastTouchY !== null) {
      const rawDY = ((touch.clientY - _lastTouchY) / rect.height) * canvas.height;
      storeScrollY = Math.max(0, Math.min(800, storeScrollY - rawDY));
    }
  } else if (currentState === State.ROOM_4_CLOSET) {
    if (_lastTouchY !== null) {
      const rawDY = ((touch.clientY - _lastTouchY) / rect.height) * canvas.height;
      wardrobeScrollY = Math.max(0, Math.min(800, wardrobeScrollY - rawDY));
    }
  } else if (currentState === State.ARCADE_CATCH) {
    // Drag basket horizontally
    basket.x = Math.max(basket.width / 2, Math.min(canvas.width - basket.width / 2, touchX));
  }

  _lastTouchY = touch.clientY;
  _lastTouchX = touch.clientX;
}, { passive: false });

canvas.addEventListener("touchend", () => {
  _lastTouchY = null;
  _lastTouchX = null;
}, { passive: true });
// ─────────────────────────────────────────────────────────────────────────────

function renderDetailedDuck(bounceOffset = 0) {
  ctx.save();
  if (duckWalk.isWalking) {
    const diff = duckWalk.targetX - duckWalk.x;
    if (Math.abs(diff) > 1) {
      duckWalk.x += Math.sign(diff) * duckWalk.speed * 0.016;
      bounceOffset += Math.sin(Date.now() * 0.02) * 4;
    } else {
      duckWalk.isWalking = false;
    }
  }

  ctx.translate(duckWalk.x, 380 + bounceOffset);

  if (pet.growthStage === 4) {
    ctx.fillStyle = "rgba(0,0,0,0.15)";
    ctx.beginPath(); ctx.ellipse(0, 48, 35, 12, 0, 0, Math.PI * 2); ctx.fill();

    ctx.fillStyle = "#94a3b8";
    ctx.beginPath();
    ctx.arc(0, -10, 25, Math.PI, 0, false);
    ctx.fillRect(-25, -10, 50, 45);
    ctx.fill();

    ctx.fillStyle = "#64748b";
    ctx.font = "bold 11px Arial"; ctx.textAlign = "center";
    ctx.fillText("R.I.P", 0, 10);

    ctx.fillStyle = "#ffffff";
    ctx.beginPath(); ctx.arc(0, -22, 10, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#0f172a";
    ctx.beginPath(); ctx.arc(-3, -24, 2, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(3, -24, 2, 0, Math.PI * 2); ctx.fill();
    ctx.fillRect(-2, -18, 4, 3);

    ctx.restore();
    return;
  }

  if (pet.growthStage === 0) {
    ctx.fillStyle = "rgba(0,0,0,0.15)";
    ctx.beginPath(); ctx.ellipse(0, 48, 35, 12, 0, 0, Math.PI * 2); ctx.fill();
    DuckArt.egg(ctx);
    ctx.fillStyle = "#a16207";
    ctx.font = "bold 13px Arial"; ctx.textAlign = "center";
    ctx.fillText("Egg (Hatching...)", 0, 75);
    ctx.restore();
    return;
  }

  // Shadow under feet
  ctx.fillStyle = "rgba(0,0,0,0.15)";
  ctx.beginPath(); ctx.ellipse(0, 48, 35, 12, 0, 0, Math.PI * 2); ctx.fill();

  const scale = pet.growthStage === 1 ? 0.55 : (pet.growthStage === 2 ? 0.8 : 1.0);
  ctx.scale(scale, scale);

  const dc = DUCK_COLOR_MAP[pet.duckColor] || DUCK_COLOR_MAP['#facc15'];
  const duckBodyColor = pet.growthStage === 3 ? (pet.duckColor === '#facc15' ? '#fde047' : pet.duckColor) : dc.body;
  const duckHighlightColor = dc.highlight;

  DuckArt.body(ctx, duckBodyColor, duckHighlightColor);

  if (pet.equippedShoes && pet.owned.shoes) {
    ctx.fillStyle = DuckArt.fabric(ctx, '#1e293b');
    ctx.beginPath(); ctx.ellipse(-16, 74, 11, 6, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(16, 74, 11, 6, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = DuckArt.fabric(ctx, '#38bdf8'); ctx.fillRect(-20, 70, 8, 3); ctx.fillRect(12, 70, 8, 3);
  }

  if (pet.equippedSkirt && pet.owned.skirt) {
    ctx.fillStyle = DuckArt.fabric(ctx, '#4f46e5');
    ctx.beginPath();
    ctx.moveTo(-32, 18); ctx.lineTo(32, 18); ctx.lineTo(44, 48); ctx.lineTo(-44, 48);
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle = "#312e81"; ctx.lineWidth = 2; ctx.stroke();
  }

  if (pet.equippedDress && pet.owned.dress) {
    ctx.fillStyle = DuckArt.fabric(ctx, '#db2777');
    ctx.beginPath();
    ctx.moveTo(-28, 2); ctx.lineTo(28, 2); ctx.lineTo(52, 65); ctx.lineTo(-52, 65);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = DuckArt.fabric(ctx, '#f472b6');
    ctx.fillRect(-15, 12, 30, 45);
    ctx.strokeStyle = "#831843"; ctx.lineWidth = 2; ctx.stroke();
  }

  DuckArt.head(ctx, duckBodyColor, duckHighlightColor, pet.isSleeping);

  if (currentState !== State.ROOM_2_BATH && !pet.equippedDress && !pet.equippedSkirt && !pet.equippedShoes) DuckArt.feet(ctx);

  if (pet.equippedHat && pet.owned.hat) {
    ctx.fillStyle = DuckArt.fabric(ctx, '#ef4444');
    ctx.fillRect(8, -80, 42, 12);
    ctx.fillRect(18, -100, 22, 22);
    ctx.fillStyle = DuckArt.fabric(ctx, '#facc15'); ctx.fillRect(18, -92, 22, 4);
  }
  if (pet.equippedCowboy && pet.owned.cowboyHat) {
    ctx.fillStyle = DuckArt.fabric(ctx, '#b45309');
    ctx.beginPath(); ctx.ellipse(28, -65, 38, 10, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillRect(13, -92, 30, 28);
    ctx.fillStyle = DuckArt.fabric(ctx, '#78350f'); ctx.fillRect(13, -70, 30, 6);
  }
  if (pet.equippedTopHat && pet.owned.topHat) {
    ctx.fillStyle = DuckArt.fabric(ctx, '#0f172a');
    ctx.fillRect(12, -88, 32, 32);
    ctx.fillRect(0, -58, 56, 6);
    ctx.fillStyle = DuckArt.fabric(ctx, '#ef4444'); ctx.fillRect(12, -68, 32, 8);
  }
  if (pet.equippedCrown && pet.owned.crown) {
    ctx.fillStyle = DuckArt.fabric(ctx, '#f59e0b');
    ctx.beginPath();
    ctx.moveTo(8, -65); ctx.lineTo(13, -92); ctx.lineTo(24, -72); ctx.lineTo(35, -92); ctx.lineTo(46, -65);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = DuckArt.fabric(ctx, '#ef4444'); ctx.beginPath(); ctx.arc(24, -72, 3, 0, Math.PI * 2); ctx.fill();
  }
  if (pet.equippedScarf && pet.owned.scarf) {
    ctx.fillStyle = DuckArt.fabric(ctx, '#dc2626');
    ctx.fillRect(8, -14, 40, 16);
    ctx.fillRect(32, 2, 14, 28);
    ctx.fillStyle = DuckArt.fabric(ctx, '#b91c1c');
    ctx.fillRect(8, -14, 40, 4);
  }
  if (pet.equippedRibbon && pet.owned.ribbon) {
    ctx.fillStyle = DuckArt.fabric(ctx, '#ec4899');
    ctx.beginPath(); ctx.arc(52, -8, 10, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.moveTo(58, -12); ctx.lineTo(74, -20); ctx.lineTo(70, 0); ctx.closePath(); ctx.fill();
  }
  if (pet.equippedTux && pet.owned.tux) {
    ctx.fillStyle = DuckArt.fabric(ctx, '#1e293b');
    ctx.fillRect(-28, 2, 56, 42);
    ctx.fillStyle = DuckArt.fabric(ctx, '#ffffff');
    ctx.beginPath(); ctx.moveTo(0, 2); ctx.lineTo(-12, 28); ctx.lineTo(12, 28); ctx.closePath(); ctx.fill();
    ctx.fillStyle = DuckArt.fabric(ctx, '#ef4444');
    ctx.beginPath(); ctx.moveTo(0, 18); ctx.lineTo(-4, 26); ctx.lineTo(4, 26); ctx.closePath(); ctx.fill();
  }
  if (pet.equippedTie && pet.owned.tie) {
    ctx.fillStyle = DuckArt.fabric(ctx, '#3b82f6');
    ctx.beginPath(); ctx.moveTo(25, -12); ctx.lineTo(18, 18); ctx.lineTo(32, 18); ctx.closePath(); ctx.fill();
  }

  // ── VIP Accessories ─────────────────────────────────────────────────────────────────
  if (pet.vip) {
    if (pet.equippedVipWings && pet.owned.vipWings) {
      ctx.fillStyle = "rgba(196,181,253,0.65)";
      ctx.beginPath(); ctx.moveTo(-52,-8); ctx.lineTo(-108,-58); ctx.lineTo(-94,14); ctx.lineTo(-52,24); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = "#a78bfa"; ctx.lineWidth = 1.5; ctx.stroke();
      ctx.beginPath(); ctx.moveTo(52,-8); ctx.lineTo(108,-58); ctx.lineTo(94,14); ctx.lineTo(52,24); ctx.closePath(); ctx.fill();
      ctx.stroke();
    }
    if (pet.equippedVipCape && pet.owned.vipCape) {
      ctx.fillStyle = DuckArt.fabric(ctx, '#f59e0b');
      ctx.beginPath(); ctx.moveTo(-28,0); ctx.lineTo(28,0); ctx.lineTo(64,84); ctx.lineTo(-64,84); ctx.closePath(); ctx.fill();
      ctx.fillStyle = DuckArt.fabric(ctx, '#fde68a'); ctx.fillRect(-26,0,52,7);
      ctx.strokeStyle = "#92400e"; ctx.lineWidth = 2; ctx.stroke();
    }
    if (pet.equippedVipCollar && pet.owned.vipCollar) {
      ctx.fillStyle = DuckArt.fabric(ctx, '#e2e8f0');
      ctx.beginPath(); ctx.ellipse(28,-18,26,10,0,0,Math.PI*2); ctx.fill();
      ctx.strokeStyle = "#94a3b8"; ctx.lineWidth = 2; ctx.stroke();
      ctx.fillStyle = DuckArt.fabric(ctx, '#38bdf8'); ctx.beginPath(); ctx.arc(28,-18,5,0,Math.PI*2); ctx.fill();
      ctx.fillStyle = DuckArt.fabric(ctx, '#ffffff'); ctx.beginPath(); ctx.arc(26,-20,2,0,Math.PI*2); ctx.fill();
    }
    if (pet.equippedVipRainbowBow && pet.owned.vipRainbowBow) {
      const rc = ['#ef4444','#f97316','#eab308','#22c55e','#3b82f6','#a855f7'];
      rc.forEach((c,i) => {
        ctx.fillStyle = c;
        ctx.beginPath(); ctx.arc(46+(i-2.5)*7, -6+(i%2===0?-5:5), 7, 0, Math.PI*2); ctx.fill();
      });
    }
    if (pet.equippedVipTiara && pet.owned.vipTiara) {
      ctx.fillStyle = DuckArt.fabric(ctx, '#cbd5e1'); ctx.fillRect(6,-75,46,10);
      [[14,-76,'#38bdf8'],[29,-84,'#f0abfc'],[44,-76,'#38bdf8']].forEach(([gx,gy,gc]) => {
        ctx.fillStyle = gc; ctx.beginPath(); ctx.arc(gx,gy,6,0,Math.PI*2); ctx.fill();
        ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(gx-2,gy-2,2,0,Math.PI*2); ctx.fill();
      });
    }
  }
  // ───────────────────────────────────────────────────────────────────────

  ctx.restore();
}

function renderPlayScreenDuck() {
  ctx.save();ctx.translate(210,200);ctx.scale(1.1,1.1);
  DuckArt.oval(ctx,0,60,58,10,'#879ba42b');
  DuckArt.body(ctx,'#f4ca63','#fff0ae');
  DuckArt.head(ctx,'#f4ca63','#fff0ae');
  ctx.restore();
}

canvas.addEventListener("click", (e) => {
  const rect = canvas.getBoundingClientRect();
  const clickX = ((e.clientX - rect.left) / rect.width) * canvas.width;
  const clickY = ((e.clientY - rect.top) / rect.height) * canvas.height;

  spawnClickerPop(clickX, clickY);

  if (currentState === State.MENU) {
    if (clickX >= 100 && clickX <= 350 && clickY >= 280 && clickY <= 350) {
      if (pet.sfxEnabled) AudioEngine.quack();
      switchRoom(State.ROOM_1_HOME);
    } else if (clickX >= 100 && clickX <= 350 && clickY >= 380 && clickY <= 450) {
      if (pet.sfxEnabled) AudioEngine.pop();
      currentState = State.SETTINGS;
    } else if (clickX >= 125 && clickX <= 325 && clickY >= 480 && clickY <= 535) {
      if (pet.sfxEnabled) AudioEngine.pop();
      if (confirm("Exit game and close page?")) {
        if (window.parent !== window) {
          window.parent.postMessage({ type: 'duck-return-hub' }, '*');
        } else {
          window.location.href = '../index.html';
        }
      }
    }
    return;
  }

  if (currentState === State.SETTINGS) {
    if (clickX >= 75 && clickX <= 375 && clickY >= 250 && clickY <= 320) {
      pet.musicEnabled = !pet.musicEnabled;
      if (pet.musicEnabled) {
        bgMusic.play().catch(() => {});
      } else {
        bgMusic.pause();
      }
      if (pet.sfxEnabled) AudioEngine.pop();
      saveState();
    } else if (clickX >= 75 && clickX <= 375 && clickY >= 350 && clickY <= 420) {
      pet.sfxEnabled = !pet.sfxEnabled;
      if (pet.sfxEnabled) AudioEngine.pop();
      saveState();
    } else if (clickX >= 125 && clickX <= 325 && clickY >= 480 && clickY <= 535) {
      if (pet.sfxEnabled) AudioEngine.pop();
      currentState = State.MENU;
    }
    return;
  }

  if (pet.growthStage === 4) {
    pet.growthStage = 0;
    pet.birthTime = Date.now();
    pet.hunger = 100;
    pet.cleanliness = 100;
    pet.energy = 100;
    saveState();
    alert("A new egg has appeared!");
    return;
  }

  if (currentState === State.ROOM_1_HOME || currentState === State.ROOM_3_GARDEN || currentState === State.ROOM_4_CLOSET) {
    if (clickY > 250 && clickY < 550) {
      duckWalk.targetX = Math.max(80, Math.min(370, clickX));
      duckWalk.isWalking = true;
    }
  }

  if (currentState === State.ROOM_1_HOME) {
    if (pet.owned.chair && clickX >= 280 && clickX <= 420 && clickY >= 380 && clickY <= 520) {
      pet.isSleeping = !pet.isSleeping;
      if (pet.sfxEnabled) AudioEngine.playTone(pet.isSleeping ? 240 : 440, "sine", 0.15);
      saveState();
    }
  } 
  else if (currentState === State.ROOM_2_BATH) {
    if (Math.hypot(clickX - duckWalk.x, clickY - 410) < 90) {
      pet.cleanliness = Math.min(100, pet.cleanliness + 15);
      if (pet.sfxEnabled) AudioEngine.pop();
      saveState();
    }
  } 
  else if (currentState === State.ROOM_3_GARDEN) {
    const now = Date.now();
    gardenPlots.forEach(p => {
      if (Math.hypot(clickX - p.x, clickY - p.y) > p.radius || now < p.cooldown) return;
      if (p.stage === 0) {
        if ((pet.inventory.seeds || 0) < 1) { alert('Buy garden seeds in the General Store first.'); return; }
        pet.inventory.seeds--;
      }
      if (p.stage < 3) {
        p.stage++;
        if (pet.sfxEnabled) AudioEngine.pop();
      } else {
        p.stage = 0;
        pet.inventory.carrots = (pet.inventory.carrots || 0) + 1;
        pet.coins += 5;
        if (pet.sfxEnabled) AudioEngine.coin();
      }
      p.cooldown = now + 500;
      saveState();
    });
  } 
  else if (currentState === State.ROOM_4_CLOSET) {
    const adjustedY = clickY + wardrobeScrollY;
    if (pet.vip && clickY >= 80 && clickY <= 125) {
      const colors = ['#facc15','#f8fafc','#334155','#f9a8d4','#7dd3fc','#c4b5fd'];
      colors.forEach((color, index) => { const x = 55 + index * 63; if (Math.hypot(clickX - x, clickY - 102) < 26) { pet.duckColor = color; saveState(); } });
      return;
    }
    if (clickX >= 50 && clickX <= 400) {
      if (adjustedY >= 480 && adjustedY <= 525) {
        if (pet.owned.hat) { pet.equippedHat = !pet.equippedHat; if (pet.sfxEnabled) AudioEngine.pop(); } else alert("Item locked!");
      } else if (adjustedY >= 535 && adjustedY <= 580) {
        if (pet.owned.cowboyHat) { pet.equippedCowboy = !pet.equippedCowboy; if (pet.sfxEnabled) AudioEngine.pop(); } else alert("Item locked!");
      } else if (adjustedY >= 590 && adjustedY <= 635) {
        if (pet.owned.topHat) { pet.equippedTopHat = !pet.equippedTopHat; if (pet.sfxEnabled) AudioEngine.pop(); } else alert("Item locked!");
      } else if (adjustedY >= 645 && adjustedY <= 690) {
        if (pet.owned.crown) { pet.equippedCrown = !pet.equippedCrown; if (pet.sfxEnabled) AudioEngine.pop(); } else alert("Item locked!");
      } else if (adjustedY >= 700 && adjustedY <= 745) {
        if (pet.owned.ribbon) { pet.equippedRibbon = !pet.equippedRibbon; if (pet.sfxEnabled) AudioEngine.pop(); } else alert("Item locked!");
      } else if (adjustedY >= 755 && adjustedY <= 800) {
        if (pet.owned.tux) { pet.equippedTux = !pet.equippedTux; if (pet.sfxEnabled) AudioEngine.pop(); } else alert("Item locked!");
      } else if (adjustedY >= 810 && adjustedY <= 855) {
        if (pet.owned.dress) { pet.equippedDress = !pet.equippedDress; if (pet.sfxEnabled) AudioEngine.pop(); } else alert("Item locked!");
      } else if (adjustedY >= 865 && adjustedY <= 910) {
        if (pet.owned.skirt) { pet.equippedSkirt = !pet.equippedSkirt; if (pet.sfxEnabled) AudioEngine.pop(); } else alert("Item locked!");
      } else if (adjustedY >= 920 && adjustedY <= 965) {
        if (pet.owned.shoes) { pet.equippedShoes = !pet.equippedShoes; if (pet.sfxEnabled) AudioEngine.pop(); } else alert("Item locked!");
      } else if (adjustedY >= 975 && adjustedY <= 1020) {
        if (pet.owned.tie) { pet.equippedTie = !pet.equippedTie; if (pet.sfxEnabled) AudioEngine.pop(); } else alert("Item locked!");
      } else if (adjustedY >= 1030 && adjustedY <= 1075) {
        if (pet.owned.scarf) { pet.equippedScarf = !pet.equippedScarf; if (pet.sfxEnabled) AudioEngine.pop(); } else alert("Item locked!");
      } else if (adjustedY >= 1085 && adjustedY <= 1130) {
        if (pet.owned.vipTiara) { pet.equippedVipTiara = !pet.equippedVipTiara; if (pet.sfxEnabled) AudioEngine.pop(); } else alert("This item is not owned.");
      } else if (adjustedY >= 1140 && adjustedY <= 1185) {
        if (pet.owned.vipCape) { pet.equippedVipCape = !pet.equippedVipCape; if (pet.sfxEnabled) AudioEngine.pop(); } else alert("This item is not owned.");
      } else if (adjustedY >= 1195 && adjustedY <= 1240) {
        if (pet.owned.vipWings) { pet.equippedVipWings = !pet.equippedVipWings; if (pet.sfxEnabled) AudioEngine.pop(); } else alert("This item is not owned.");
      } else if (adjustedY >= 1250 && adjustedY <= 1295) {
        if (pet.owned.vipCollar) { pet.equippedVipCollar = !pet.equippedVipCollar; if (pet.sfxEnabled) AudioEngine.pop(); } else alert("This item is not owned.");
      } else if (adjustedY >= 1305 && adjustedY <= 1350) {
        if (pet.owned.vipRainbowBow) { pet.equippedVipRainbowBow = !pet.equippedVipRainbowBow; if (pet.sfxEnabled) AudioEngine.pop(); } else alert("This item is not owned.");
      }
    }
    saveState();
  }
  else if (currentState === State.ROOM_5_STORE) {
    if (clickY >= 55 && clickY <= 87) {
      if (clickX >= 5 && clickX <= 145) { storeTab = 'clothes'; storeScrollY = 0; if (pet.sfxEnabled) AudioEngine.pop(); }
      else if (clickX >= 155 && clickX <= 295) { storeTab = 'furniture'; storeScrollY = 0; if (pet.sfxEnabled) AudioEngine.pop(); }
      else if (clickX >= 305 && clickX <= 445) { storeTab = 'food'; storeScrollY = 0; if (pet.sfxEnabled) AudioEngine.pop(); }
      return;
    }

    const adjustedY = clickY + storeScrollY;

    if (clickX >= 50 && clickX <= 390) {
      if (storeTab === 'clothes') {
        const storeClothes = [
          { name: "Party Hat", price: 3, key: 'hat' },
          { name: "Cowboy Hat", price: 5, key: 'cowboyHat' },
          { name: "Top Hat", price: 7, key: 'topHat' },
          { name: "Royal Crown", price: 12, key: 'crown' },
          { name: "Bow Ribbon", price: 3, key: 'ribbon' },
          { name: "Tuxedo Suit", price: 15, key: 'tux' },
          { name: "Gala Evening Dress", price: 25, key: 'dress' },
          { name: "Pleated Summer Skirt", price: 12, key: 'skirt' },
          { name: "Designer Leather Shoes", price: 18, key: 'shoes' },
          { name: "Blue Tie", price: 4, key: 'tie' },
          { name: "Cozy Scarf", price: 5, key: 'scarf' }
        ];
        storeClothes.forEach((item, idx) => {
          const itemY = 130 + idx * 85;
          if (adjustedY >= itemY && adjustedY <= itemY + 70) {
            if (!pet.owned[item.key] && pet.coins >= item.price) {
              pet.coins -= item.price;
              pet.owned[item.key] = true;
              if (pet.sfxEnabled) AudioEngine.coin();
              saveState();
              alert(`Bought ${item.name}!`);
            } else {
              alert(pet.owned[item.key] ? "Already owned!" : "Not enough coins!");
            }
          }
        });
      } else if (storeTab === 'furniture') {
        const storeFurniture = [
          { name: "Wall Clock", price: 4, key: 'clock' },
          { name: "Comfy Chair", price: 6, key: 'chair' },
          { name: "Wooden Table", price: 8, key: 'table' },
          { name: "House Plant", price: 5, key: 'plant' },
          { name: "Fluffy Rug", price: 4, key: 'rug' },
          { name: "Floor Lamp", price: 5, key: 'lamp' },
          { name: "Bookshelf", price: 9, key: 'bookshelf' },
          { name: "Fancy Painting", price: 7, key: 'painting' },
          { name: "Luxury Velvet Sofa", price: 22, key: 'sofa' },
          { name: "Mahogany Drawer", price: 16, key: 'drawer' }
        ];
        storeFurniture.forEach((item, idx) => {
          const itemY = 130 + idx * 85;
          if (adjustedY >= itemY && adjustedY <= itemY + 70) {
            if (!pet.owned[item.key] && pet.coins >= item.price) {
              pet.coins -= item.price;
              pet.owned[item.key] = true;
              if (pet.sfxEnabled) AudioEngine.coin();
              saveState();
              alert(`Bought ${item.name}!`);
            } else {
              alert(pet.owned[item.key] ? "Already owned!" : "Not enough coins!");
            }
          }
        });
      } else if (storeTab === 'food') {
        if (adjustedY >= 130 && adjustedY <= 200) {
          if (pet.coins >= 2) { pet.coins -= 2; pet.inventory.bread = (pet.inventory.bread || 0) + 1; if (pet.sfxEnabled) AudioEngine.coin(); saveState(); alert("Bought Bread!"); }
          else alert("Not enough coins!");
        } else if (adjustedY >= 215 && adjustedY <= 285) {
          if (pet.coins >= 3) { pet.coins -= 3; pet.inventory.seeds = (pet.inventory.seeds || 0) + 1; if (pet.sfxEnabled) AudioEngine.coin(); saveState(); alert("Bought Seeds Pack!"); }
          else alert("Not enough coins!");
        }
      }
    }
  }
  // Room 6: Kitchen
  else if (currentState === State.ROOM_6_KITCHEN) {
    if (!fridgeOpen) {
      if (clickX >= 60 && clickX <= 200 && clickY >= 150 && clickY <= 480) {
        fridgeOpen = true;
        if (pet.sfxEnabled) AudioEngine.pop();
      }
    } else {
      if (clickX >= 340 && clickX <= 370 && clickY >= 140 && clickY <= 170) {
        fridgeOpen = false;
        if (pet.sfxEnabled) AudioEngine.pop();
      } else if (clickX >= 80 && clickX <= 370 && clickY >= 200 && clickY <= 270) {
        if ((pet.inventory.bread || 0) > 0) {
          pet.inventory.bread--;
          pet.hunger = Math.min(100, pet.hunger + 25);
          if (pet.sfxEnabled) AudioEngine.coin();
          saveState();
        } else {
          if (pet.sfxEnabled) AudioEngine.playTone(180, "sawtooth", 0.2);
        }
      } else if (clickX >= 80 && clickX <= 370 && clickY >= 290 && clickY <= 360) {
        if ((pet.inventory.carrots || 0) > 0) {
          pet.inventory.carrots--;
          pet.hunger = Math.min(100, pet.hunger + 20);
          if (pet.sfxEnabled) AudioEngine.coin();
          saveState();
        } else {
          if (pet.sfxEnabled) AudioEngine.playTone(180, "sawtooth", 0.2);
        }
      }
    }
  }
  // Minigame 1: Flappy Duck
  else if (currentState === State.ARCADE_FLAP) {
    if (flapGameOver) {
      flapDuck.y = 250; flapDuck.vy = 0; flapPipes = []; flapScore = 0; flapGameOver = false;
    } else {
      flapDuck.vy = flapDuck.jump;
      if (pet.sfxEnabled) AudioEngine.flap();
    }
  }
  // Minigame 3: Pop Bubbles
  else if (currentState === State.ARCADE_BUBBLES) {
    interactiveBubbles.forEach((b, idx) => {
      if (Math.hypot(clickX - b.x, clickY - b.y) < b.radius) {
        interactiveBubbles.splice(idx, 1);
        bubbleGameScore++;
        if (pet.sfxEnabled) AudioEngine.pop();
        saveState();
      }
    });
    if (interactiveBubbles.length === 0) {
      bubbleGameScore = 0;
      pet.coins += 5;
      if (pet.sfxEnabled) AudioEngine.coin();
      saveState();
      alert("Minigame Won! +5 Coins awarded!");
      initBubbleGame();
    }
  }
});

let lastTime = performance.now();
function tick(now) {
  const dt = Math.min((now - lastTime) / 1000, 0.1);
  lastTime = now;

  gameplaySecondsCounter += dt;
  if (gameplaySecondsCounter >= 600) {
    gameplaySecondsCounter = 0;
    pet.coins += 1;
    saveState();
  }

  const elapsedSec = (Date.now() - pet.birthTime) / 1000;
  if (pet.growthStage === 0 && elapsedSec > 20) {
    pet.growthStage = 1;
    saveState();
    alert("Your egg hatched into a baby chick!");
  } else if (pet.growthStage === 1 && elapsedSec > 50) {
    pet.growthStage = 2;
    saveState();
    alert("Your chick has grown into a young duck!");
  } else if (pet.growthStage === 2 && elapsedSec > 90) {
    pet.growthStage = 3;
    saveState();
    alert("Your duck is now an old duck!");
  } else if (pet.growthStage === 3 && elapsedSec > 3600000) {
    pet.growthStage = 4;
    saveState();
    alert("Your duck has passed away of old age after 1000 hours. Tap anywhere to spawn a new egg!");
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (currentState !== State.MENU && currentState !== State.SETTINGS && pet.growthStage < 4) {
    // Hunger and cleanliness drop to 0 over 1 hour (3600 seconds) if not maintained manually
    pet.hunger = Math.max(0, pet.hunger - (100 / 3600) * dt);
    pet.cleanliness = Math.max(0, pet.cleanliness - (100 / 3600) * dt);

    if (pet.isSleeping) {
      pet.energy = Math.min(100, pet.energy + 10.0 * dt); // Energy is the only stat that goes up automatically
    } else {
      pet.energy = Math.max(0, pet.energy - 0.5 * dt);
    }

    if ((pet.hunger <= 0 || pet.cleanliness <= 0 || pet.energy <= 0) && pet.growthStage < 4) {
      pet.growthStage = 4;
      saveState();
      alert("Oh no! Your pet's stats reached 0%. It passed away. Tap anywhere to spawn a new egg!");
    }

    updateHUD();
  }

  if (currentState === State.MENU) {
    DuckArt.scene(ctx, 'menu');
    renderPlayScreenDuck();

    ctx.fillStyle = "#0369a1"; ctx.font = "bold 26px Arial"; ctx.textAlign = "center";
    ctx.fillText("PET A DUCK", canvas.width / 2, 90);

    ctx.fillStyle = "#bbf7d0"; DuckArt.panel(ctx,100,280,250,70,'#fff8dc',ctx.fillStyle,18);
    ctx.fillStyle = "#0f172a"; ctx.font = "bold 20px Arial"; ctx.fillText("▶ Play Game", canvas.width / 2, 325);

    ctx.fillStyle = "#fed7aa"; DuckArt.panel(ctx,100,380,250,70,'#fff8dc',ctx.fillStyle,18);
    ctx.fillStyle = "#0f172a"; ctx.fillText("⚙️ Settings", canvas.width / 2, 425);

    ctx.fillStyle = "#fca5a5"; DuckArt.panel(ctx,125,480,200,55,'#fff8dc',ctx.fillStyle,18);
    ctx.fillStyle = "#0f172a"; ctx.font = "bold 18px Arial"; ctx.fillText("🚪 Quit Game", canvas.width / 2, 514);
  } 
  else if (currentState === State.SETTINGS) {
    DuckArt.scene(ctx, 'settings');

    ctx.fillStyle = "#0f172a"; ctx.font = "bold 24px Arial"; ctx.textAlign = "center";
    ctx.fillText("⚙️ AUDIO SETTINGS", canvas.width / 2, 100);

    ctx.fillStyle = pet.musicEnabled ? "#bbf7d0" : "#fca5a5"; 
    DuckArt.panel(ctx,75,250,300,70,'#fff8dc',ctx.fillStyle,18);
    ctx.strokeStyle = "#0f172a"; ctx.lineWidth = 2; 
    ctx.fillStyle = "#0f172a"; ctx.font = "bold 18px Arial"; 
    ctx.fillText(`🎵 Background Music: ${pet.musicEnabled ? 'ON' : 'OFF'}`, canvas.width / 2, 292);

    ctx.fillStyle = pet.sfxEnabled ? "#bbf7d0" : "#fca5a5"; 
    DuckArt.panel(ctx,75,350,300,70,'#fff8dc',ctx.fillStyle,18);
    
    ctx.fillStyle = "#0f172a"; 
    ctx.fillText(`🔔 Click Sound Effects: ${pet.sfxEnabled ? 'ON' : 'OFF'}`, canvas.width / 2, 392);

    ctx.fillStyle = "#cbd5e1"; DuckArt.panel(ctx,125,480,200,55,'#fff8dc',ctx.fillStyle,18);
    
    ctx.fillStyle = "#0f172a"; ctx.font = "bold 18px Arial"; 
    ctx.fillText("⬅️ Back", canvas.width / 2, 514);
  }
  else if (currentState === State.ROOM_1_HOME) {
    DuckArt.scene(ctx, 'home');
    DuckArt.furniture(ctx, pet.owned);
    // VIP Furniture
    if (pet.owned.vipCurtains) {
      ctx.fillStyle = "#7c3aed"; ctx.fillRect(0, 0, 28, 350); ctx.fillRect(422, 0, 28, 350);
      ctx.fillStyle = "#5b21b6"; ctx.fillRect(0, 0, 28, 18); ctx.fillRect(422, 0, 28, 18);
    }
    if (pet.owned.vipChandelier) {
      const cx = 225, cy = 28;
      ctx.fillStyle = "#f59e0b"; ctx.beginPath(); ctx.arc(cx, cy, 10, 0, Math.PI * 2); ctx.fill();
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2;
        const ex = cx + Math.cos(a) * 30, ey = cy + Math.sin(a) * 22;
        ctx.strokeStyle = "#f59e0b"; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(ex, ey); ctx.stroke();
        ctx.fillStyle = "#fde047"; ctx.beginPath(); ctx.arc(ex, ey, 5, 0, Math.PI * 2); ctx.fill();
      }
    }
    if (pet.owned.vipDiamondRug) {
      ctx.fillStyle = "#4f46e5"; ctx.beginPath(); ctx.ellipse(225, 482, 82, 26, 0, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = "#818cf8"; ctx.lineWidth = 2; ctx.stroke();
      ctx.strokeStyle = "#c7d2fe"; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(148,482); ctx.lineTo(225,458); ctx.lineTo(302,482); ctx.lineTo(225,506); ctx.closePath(); ctx.stroke();
    }
    if (pet.owned.vipMirror) {
      ctx.fillStyle = "#d1d5db"; ctx.fillRect(5, 195, 36, 125);
      ctx.strokeStyle = "#f59e0b"; ctx.lineWidth = 3; ctx.strokeRect(5, 195, 36, 125);
      ctx.fillStyle = "rgba(186,230,253,0.45)"; ctx.fillRect(8, 198, 30, 119);
    }
    if (pet.owned.vipThrone) {
      ctx.fillStyle = "#f59e0b"; ctx.fillRect(340, 380, 55, 90);
      ctx.fillStyle = "#fde047"; ctx.fillRect(340, 352, 55, 32);
      ctx.fillStyle = "#f59e0b"; ctx.fillRect(335, 462, 10, 18); ctx.fillRect(390, 462, 10, 18);
      ctx.strokeStyle = "#92400e"; ctx.lineWidth = 2; ctx.strokeRect(340, 352, 55, 120);
      ctx.fillStyle = "#ef4444"; ctx.beginPath(); ctx.arc(367, 342, 8, 0, Math.PI * 2); ctx.fill();
    }

    renderDetailedDuck();

  } 
  else if (currentState === State.ROOM_2_BATH) {
    DuckArt.scene(ctx, 'bath');
    const bounce = Math.sin(now * 0.008) * 6;
    renderDetailedDuck(bounce);
  } 
  else if (currentState === State.ROOM_3_GARDEN) {
    DuckArt.scene(ctx, 'garden');
    
    ctx.fillStyle = "#52525b"; ctx.fillRect(380, 310, 6, 110);
    ctx.fillStyle = "#a16207"; ctx.beginPath(); ctx.arc(383, 308, 7, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#e2e8f0"; ctx.beginPath(); ctx.moveTo(370, 400); ctx.lineTo(396, 400); ctx.lineTo(390, 435); ctx.lineTo(376, 435); ctx.closePath(); ctx.fill();
    ctx.fillStyle = "#cbd5e1"; ctx.beginPath(); ctx.moveTo(376, 400); ctx.lineTo(383, 400); ctx.lineTo(383, 435); ctx.lineTo(376, 435); ctx.closePath(); ctx.fill();

    renderDetailedDuck();
    gardenPlots.forEach(p => DuckArt.plot(ctx, p));
  } 
  else if (currentState === State.ROOM_4_CLOSET) {
    DuckArt.scene(ctx, 'closet');
    renderDetailedDuck();

    ctx.save();
    ctx.translate(0, -wardrobeScrollY);

    ctx.fillStyle = "#701a75"; ctx.font = "bold 16px Arial"; ctx.textAlign = "center";
    ctx.fillText("👕 Wardrobe Selector (Scroll to view more)", 225, 30);

    const wardrobeItems = [
      { name: "🎩 Party Hat", owned: pet.owned.hat, equipped: pet.equippedHat, y: 480 },
      { name: "🤠 Cowboy Hat", owned: pet.owned.cowboyHat, equipped: pet.equippedCowboy, y: 535 },
      { name: "🎩 Top Hat", owned: pet.owned.topHat, equipped: pet.equippedTopHat, y: 590 },
      { name: "👑 Royal Crown", owned: pet.owned.crown, equipped: pet.equippedCrown, y: 645 },
      { name: "🎀 Bow Ribbon", owned: pet.owned.ribbon, equipped: pet.equippedRibbon, y: 700 },
      { name: "👔 Tuxedo Suit", owned: pet.owned.tux, equipped: pet.equippedTux, y: 755 },
      { name: "👗 Gala Dress", owned: pet.owned.dress, equipped: pet.equippedDress, y: 810 },
      { name: "🩰 Summer Skirt", owned: pet.owned.skirt, equipped: pet.equippedSkirt, y: 865 },
      { name: "👞 Leather Shoes", owned: pet.owned.shoes, equipped: pet.equippedShoes, y: 920 },
      { name: "👔 Blue Tie", owned: pet.owned.tie, equipped: pet.equippedTie, y: 975 },
      { name: "🧣 Cozy Scarf", owned: pet.owned.scarf, equipped: pet.equippedScarf, y: 1030 },
      { name: "💎 VIP Diamond Tiara", owned: pet.owned.vipTiara, equipped: pet.equippedVipTiara, vip: true, y: 1085 },
      { name: "🌟 VIP Golden Cape", owned: pet.owned.vipCape, equipped: pet.equippedVipCape, vip: true, y: 1140 },
      { name: "🪽 VIP Crystal Wings", owned: pet.owned.vipWings, equipped: pet.equippedVipWings, vip: true, y: 1195 },
      { name: "💫 VIP Platinum Collar", owned: pet.owned.vipCollar, equipped: pet.equippedVipCollar, vip: true, y: 1250 },
      { name: "🌈 VIP Rainbow Bow", owned: pet.owned.vipRainbowBow, equipped: pet.equippedVipRainbowBow, vip: true, y: 1305 }
    ];

    wardrobeItems.forEach(item => {
      ctx.fillStyle = !item.owned ? "#e2e8f0" : (item.equipped ? (item.vip ? "#fef9c3" : "#bbf7d0") : "#ffffff");
      DuckArt.panel(ctx,50,item.y,350,45,'#fff8ef',ctx.fillStyle,12);
      ctx.strokeStyle = item.vip ? "#f59e0b" : "#701a75"; ctx.lineWidth = item.vip ? 3 : 2; 
      ctx.fillStyle = item.vip ? "#92400e" : "#0f172a"; ctx.font = item.vip ? "bold 13px Arial" : "bold 13px Arial"; ctx.textAlign = "left";
      let status = !item.owned ? (item.vip ? "[VIP LOCKED]" : "[LOCKED]") : (item.equipped ? "\u2713 EQUIPPED" : "Unequipped");
      ctx.fillText(`${item.name}: ${status}`, 65, item.y + 28);
    });

    if (pet.vip) {
      const colors = ['#facc15','#f8fafc','#334155','#f9a8d4','#7dd3fc','#c4b5fd'];
      ctx.fillStyle = '#701a75'; ctx.font = 'bold 12px Arial'; ctx.textAlign = 'center'; ctx.fillText('VIP: choose your duck color', 225, 62);
      colors.forEach((color, index) => { const x = 55 + index * 63; ctx.fillStyle = color; ctx.beginPath(); ctx.arc(x, 102, 20, 0, Math.PI * 2); ctx.fill(); ctx.strokeStyle = pet.duckColor === color ? '#701a75' : '#ffffff'; ctx.lineWidth = pet.duckColor === color ? 4 : 2; ctx.stroke(); });
    }

    ctx.restore();
  } 
  else if (currentState === State.ROOM_5_STORE) {
    DuckArt.scene(ctx, 'store');
    
    ctx.fillStyle = "#ca8a04"; ctx.font = "bold 20px Arial"; ctx.textAlign = "center";
    ctx.fillText("🛒 GENERAL STORE", 225, 35);

    ctx.fillStyle = storeTab === 'clothes' ? "#eab308" : "#fef08a"; DuckArt.panel(ctx,5,55,140,32,'#fff5c9',ctx.fillStyle,10);
    ctx.fillStyle = storeTab === 'furniture' ? "#eab308" : "#fef08a"; DuckArt.panel(ctx,155,55,140,32,'#fff5c9',ctx.fillStyle,10);
    ctx.fillStyle = storeTab === 'food' ? "#eab308" : "#fef08a"; DuckArt.panel(ctx,305,55,140,32,'#fff5c9',ctx.fillStyle,10);

    ctx.fillStyle = "#0f172a"; ctx.font = "bold 11px Arial"; ctx.textAlign = "center";
    ctx.fillText("Clothes", 75, 76);
    ctx.fillText("Furniture", 225, 76);
    ctx.fillText("Food", 375, 76);

    ctx.save();
    ctx.translate(0, -storeScrollY);

    if (storeTab === 'clothes') {
      const storeClothes = [
        { name: "🎩 Party Hat (3c)", owned: pet.owned.hat, y: 115 },
        { name: "🤠 Cowboy Hat (5c)", owned: pet.owned.cowboyHat, y: 200 },
        { name: "🎩 Top Hat (7c)", owned: pet.owned.topHat, y: 285 },
        { name: "👑 Royal Crown (12c)", owned: pet.owned.crown, y: 370 },
        { name: "🎀 Ribbon (3c)", owned: pet.owned.ribbon, y: 455 },
        { name: "👔 Tuxedo Suit (15c)", owned: pet.owned.tux, y: 540 },
        { name: "👗 Gala Dress (25c)", owned: pet.owned.dress, y: 625 },
        { name: "🩰 Summer Skirt (12c)", owned: pet.owned.skirt, y: 710 },
        { name: "👞 Leather Shoes (18c)", owned: pet.owned.shoes, y: 795 },
        { name: "👔 Blue Tie (4c)", owned: pet.owned.tie, y: 880 },
        { name: "🧣 Cozy Scarf (5c)", owned: pet.owned.scarf, y: 965 }
      ];
      storeClothes.forEach(item => {
        ctx.fillStyle = item.owned ? "#cbd5e1" : "#ffffff";
        DuckArt.panel(ctx,50,item.y,340,70,'#fffdf3',ctx.fillStyle === '#cbd5e1' ? '#d5d4df' : '#f4dfc2',16);
        ctx.strokeStyle = "#ca8a04"; ctx.lineWidth = 2; 
        ctx.fillStyle = "#713f12"; ctx.font = "bold 14px Arial"; ctx.textAlign = "left";
        ctx.fillText(item.owned ? item.name.replace(/\(.*?\)/, "(OWNED)") : item.name, 70, item.y + 42);
      });
    } else if (storeTab === 'furniture') {
      const storeFurniture = [
        { name: "⏰ Wall Clock (4c)", owned: pet.owned.clock, y: 115 },
        { name: "🪑 Comfy Chair (6c)", owned: pet.owned.chair, y: 200 },
        { name: "🪵 Wooden Table (8c)", owned: pet.owned.table, y: 285 },
        { name: "🌱 House Plant (5c)", owned: pet.owned.plant, y: 370 },
        { name: "🔴 Fluffy Rug (4c)", owned: pet.owned.rug, y: 455 },
        { name: "🏮 Floor Lamp (5c)", owned: pet.owned.lamp, y: 540 },
        { name: "📚 Bookshelf (9c)", owned: pet.owned.bookshelf, y: 625 },
        { name: "🎨 Fancy Painting (7c)", owned: pet.owned.painting, y: 710 },
        { name: "🛋️ Luxury Sofa (22c)", owned: pet.owned.sofa, y: 795 },
        { name: "🗄️ Mahogany Drawer (16c)", owned: pet.owned.drawer, y: 880 }
      ];
      storeFurniture.forEach(item => {
        ctx.fillStyle = item.owned ? "#cbd5e1" : "#ffffff";
        DuckArt.panel(ctx,50,item.y,340,70,'#fffdf3',ctx.fillStyle === '#cbd5e1' ? '#d5d4df' : '#f4dfc2',16);
        ctx.strokeStyle = "#ca8a04"; ctx.lineWidth = 2; 
        ctx.fillStyle = "#713f12"; ctx.font = "bold 14px Arial"; ctx.textAlign = "left";
        ctx.fillText(item.owned ? item.name.replace(/\(.*?\)/, "(OWNED)") : item.name, 70, item.y + 42);
      });
    } else if (storeTab === 'food') {
      const storeFood = [
        { name: "🍞 Bread (2c)", stock: pet.inventory.bread, y: 115 },
        { name: "🌱 Garden Seeds Pack (3c)", stock: pet.inventory.seeds, y: 200 }
      ];
      storeFood.forEach(item => {
        ctx.fillStyle = "#ffffff";
        DuckArt.panel(ctx,50,item.y,340,70,'#fffdf3',ctx.fillStyle === '#cbd5e1' ? '#d5d4df' : '#f4dfc2',16);
        ctx.strokeStyle = "#ca8a04"; ctx.lineWidth = 2; 
        ctx.fillStyle = "#713f12"; ctx.font = "bold 14px Arial"; ctx.textAlign = "left";
        ctx.fillText(item.name, 70, item.y + 30);
        ctx.font = "12px Arial"; ctx.fillText("Owned Stock: " + item.stock, 70, item.y + 52);
      });
    }

    ctx.restore();

  }
  else if (currentState === State.ROOM_6_KITCHEN) {
    DuckArt.scene(ctx, 'kitchen');

    DuckArt.panel(ctx,60,150,140,300,'#f7f8e9','#aed8d6',22);
    DuckArt.panel(ctx,69,193,122,69,'#e5f2e9','#c4e1d7',12);
    DuckArt.panel(ctx,170,274,10,55,'#fff9dc','#bfad8c',5);
    ctx.fillStyle = "#64748b"; ctx.fillRect(170, 270, 15, 60);
    ctx.font = "bold 14px Arial"; ctx.fillStyle = "#334155"; ctx.textAlign = "center";
    ctx.fillText("Refrigerator", 130, 180);

    if (fridgeOpen) {
      ctx.fillStyle = "rgba(15, 23, 42, 0.75)"; ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#ffffff"; DuckArt.panel(ctx,50,120,350,350,'#fff8dc',ctx.fillStyle,18);
      ctx.strokeStyle = "#0284c7"; ctx.lineWidth = 4; 

      ctx.fillStyle = "#0f172a"; ctx.font = "bold 18px Arial"; ctx.textAlign = "center";
      ctx.fillText("🧊 Refrigerator Catalog", 225, 155);

      ctx.fillStyle = "#ef4444"; ctx.fillRect(340, 135, 30, 30);
      ctx.fillStyle = "#ffffff"; ctx.fillText("X", 355, 157);

      ctx.fillStyle = "#fef08a"; DuckArt.panel(ctx,80,190,290,70,'#fff8dc',ctx.fillStyle,18);
      ctx.fillStyle = "#713f12"; ctx.font = "bold 14px Arial"; ctx.textAlign = "left";
      ctx.fillText(`🍞 Bread (Owned: ${pet.inventory.bread || 0})`, 100, 220);
      ctx.font = "12px Arial"; ctx.fillText("Click to Eat (+25 Hunger)", 100, 240);

      ctx.fillStyle = "#ffedd5"; DuckArt.panel(ctx,80,280,290,70,'#fff8dc',ctx.fillStyle,18);
      ctx.fillStyle = "#9a3412"; ctx.font = "bold 14px Arial"; ctx.fillText(`🥕 Carrots (Owned: ${pet.inventory.carrots || 0})`, 100, 310);
      ctx.font = "12px Arial"; ctx.fillText("Click to Eat (+20 Hunger)", 100, 330);
    }
  }
  else if (currentState === State.ARCADE_FLAP) {
    DuckArt.scene(ctx, 'flap');

    if (!flapGameOver) {
      flapDuck.vy += flapDuck.gravity * dt;
      flapDuck.y += flapDuck.vy * dt;

      flapSpawnTimer -= dt;
      if (flapSpawnTimer <= 0) {
        const gap = 160;
        const topHeight = Math.random() * 250 + 50;
        flapPipes.push({ x: canvas.width + 40, top: topHeight, bottom: topHeight + gap, passed: false });
        flapSpawnTimer = 1.6;
      }

      for (let i = flapPipes.length - 1; i >= 0; i--) {
        const p = flapPipes[i];
        p.x -= 180 * dt;

        if (flapDuck.x + flapDuck.size > p.x && flapDuck.x - flapDuck.size < p.x + 60) {
          if (flapDuck.y - flapDuck.size < p.top || flapDuck.y + flapDuck.size > p.bottom) {
            flapGameOver = true;
          }
        }

        if (!p.passed && p.x + 60 < flapDuck.x) { 
          p.passed = true; 
          flapScore++; 
          if (flapScore >= 10) {
            pet.coins += 5;
            if (pet.sfxEnabled) AudioEngine.coin();
            saveState();
            alert("Flappy Duck Won! +5 Coins awarded!");
            switchRoom(State.ROOM_1_HOME);
          }
        }
        if (p.x < -70) flapPipes.splice(i, 1);
      }

      if (flapDuck.y < 20 || flapDuck.y > canvas.height - 40) flapGameOver = true;
    }

    flapPipes.forEach((p) => {
      ctx.fillStyle = "#22c55e";
      DuckArt.panel(ctx,p.x,0,60,p.top,'#bce9b2','#73b696',12);
      DuckArt.panel(ctx,p.x,p.bottom,60,canvas.height-p.bottom,'#bce9b2','#73b696',12);
    });

    ctx.fillStyle = "#facc15";
    ctx.save();ctx.translate(flapDuck.x,flapDuck.y);ctx.scale(.36,.36);DuckArt.body(ctx,'#f4ca63','#fff0ae');DuckArt.head(ctx,'#f4ca63','#fff0ae');ctx.restore();

    ctx.font = "bold 24px Arial"; ctx.fillStyle = "#0f172a"; ctx.textAlign = "center";
    ctx.fillText(`Score: ${flapScore}/10`, 225, 40);

    if (flapGameOver) {
      ctx.fillStyle = "rgba(15, 23, 42, 0.75)"; ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#ffffff"; ctx.font = "bold 26px Arial"; ctx.fillText("Game Over! Tap to Retry", 225, 310);
      flapScore = 0; saveState();
    }
  }
  else if (currentState === State.ARCADE_CATCH) {
    catchTimer -= dt;
    if (keys["ArrowLeft"] || keys["a"] || keys["A"]) basket.x -= basket.speed * dt;
    if (keys["ArrowRight"] || keys["d"] || keys["D"]) basket.x += basket.speed * dt;
    basket.x = Math.max(basket.width / 2, Math.min(canvas.width - basket.width / 2, basket.x));

    breadObj.y += breadObj.speed * dt;
    if (breadObj.x >= basket.x - basket.width / 2 && breadObj.x <= basket.x + basket.width / 2 &&
        breadObj.y + breadObj.radius >= basket.y && breadObj.y - breadObj.radius <= basket.y + basket.height) {
      catchScore++;
      if (pet.sfxEnabled) AudioEngine.coin();
      breadObj.y = 0; breadObj.x = Math.random() * 320 + 60;
    }
    if (breadObj.y > canvas.height) { breadObj.y = 0; breadObj.x = Math.random() * 320 + 60; }

    ctx.fillStyle = "#fef9c3"; ctx.fillRect(0, 0, canvas.width, canvas.height);
    DuckArt.panel(ctx,basket.x-basket.width/2,basket.y,basket.width,basket.height,'#f3ce97','#bb8d68',7);
    for(let i=7;i<basket.width;i+=10){ctx.strokeStyle='#a37b5b70';ctx.beginPath();ctx.moveTo(basket.x-basket.width/2+i,basket.y+3);ctx.lineTo(basket.x-basket.width/2+i,basket.y+basket.height-3);ctx.stroke();}
    DuckArt.panel(ctx,breadObj.x-11,breadObj.y-12,22,24,'#ffe7b4','#ca9569',8);

    ctx.font = "bold 20px Arial"; ctx.fillStyle = "#dc2626"; ctx.textAlign = "left";
    ctx.fillText(`Timer: ${Math.max(0, Math.ceil(catchTimer))}s`, 25, 40);
    ctx.fillStyle = "#15803d"; ctx.fillText(`Bread: ${catchScore}`, 25, 70);

    if (catchTimer <= 0) {
      pet.coins += 5;
      if (pet.sfxEnabled) AudioEngine.coin();
      saveState();
      alert(`Bread Catch Finished! You caught ${catchScore} items. +5 Coins awarded!`);
      switchRoom(State.ROOM_1_HOME);
    }
  }
  else if (currentState === State.ARCADE_BUBBLES) {
    ctx.fillStyle = "#e0f2fe"; ctx.fillRect(0, 0, canvas.width, canvas.height);
    interactiveBubbles.forEach(b => {
      b.y += b.vy * dt;
      if (b.y < -50) b.y = canvas.height + 50;
      DuckArt.bubble(ctx,b.x,b.y,b.radius);
    });
    ctx.font = "bold 20px Arial"; ctx.fillStyle = "#0f172a"; ctx.textAlign = "center";
    ctx.fillText(`Bubbles Popped: ${bubbleGameScore}/10`, 225, 40);
  }

  for (let i = clickPops.length - 1; i >= 0; i--) {
    const pop = clickPops[i];
    pop.alpha -= 0.05;
    pop.scale += 0.04;
    if (pop.alpha <= 0) {
      clickPops.splice(i, 1);
      continue;
    }
    ctx.save();
    ctx.globalAlpha = Math.max(0, pop.alpha);
    ctx.strokeStyle = "#facc15";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(pop.x, pop.y, pop.scale * 30, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  requestAnimationFrame(tick);
}

switchRoom(State.MENU);
requestAnimationFrame(tick);
