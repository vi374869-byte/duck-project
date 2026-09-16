// Games are free to enter; shared coins buy permanent perks inside each game.
const ECONOMY_KEY = 'duckSharedEconomyV2';
const GAME_UNLOCK_COST = 0; // Testing price — change this to 1000 for release.
const ROUND_REWARD = 25;

const games = {
  duck: { title: 'Pet a Duck', url: 'pet-a-duck.html', free: true },
  space: { title: 'Space Wars', url: 'space-wars.html' },
  third: { title: 'Candy Racers', url: 'candy-racers.html' },
  tiki: { title: 'TikiTaki', url: 'tikitaki.html' },
  rhythm: { title: 'Rhythm Mania', url: 'rhythm-mania.html' },
  six: { title: 'Tycoon', url: 'no-name.html' },
  seven: { title: 'Color Splash', url: 'color-splash-studio.html' },
  multi: { title: 'Sky Strike', url: 'sky-strike-lobby.html' }
};

function getEconomy() { return Arcade.read(); }
function saveEconomy(economy) { Arcade.write(economy); }
function isUnlocked(id, economy = getEconomy()) { return Boolean(games[id]) && (GAME_UNLOCK_COST === 0 || games[id].free || economy.unlockedGames.includes(id)); }
function updateCoins() { document.getElementById('coinVal').textContent = getEconomy().coins; }

function updateGameLocks() {
  const economy = getEconomy();
  Object.keys(games).forEach(id => {
    const card = document.querySelector(`[onclick="launchGame('${id}')"]`);
    if (!card) return;
    const unlocked = isUnlocked(id, economy);
    card.classList.toggle('is-locked', !unlocked);
    const buttonLabel = card.querySelector('b');
    if (buttonLabel) buttonLabel.textContent = unlocked ? 'PLAY' : `🔒 UNLOCK · ${GAME_UNLOCK_COST}`;
    card.setAttribute('aria-label', unlocked ? `Play ${games[id].title}` : `Unlock ${games[id].title} for ${GAME_UNLOCK_COST} coins`);
  });
}

function showHub() {
  window.ArcadeControls?.refreshMode();
  document.getElementById('dashboardScreen').hidden = false;
  document.getElementById('playScreen').hidden = true;
  document.querySelector('.hub-shell').classList.remove('game-open');
  const frame = document.getElementById('gameFrame');
  frame.src = 'about:blank';
  updateCoins(); updateGameLocks();
}

function launchGame(id) {
  const game = games[id];
  if (!game) return;
  const economy = getEconomy();
  if (!isUnlocked(id, economy)) {
    if (economy.coins < GAME_UNLOCK_COST) return;
    economy.coins -= GAME_UNLOCK_COST;
    economy.unlockedGames.push(id);
    saveEconomy(economy);
    updateCoins(); updateGameLocks();
  }
  document.getElementById('dashboardScreen').hidden = true;
  document.getElementById('playScreen').hidden = false;
  document.querySelector('.hub-shell').classList.add('game-open');
  document.getElementById('gameTitle').textContent = game.title;
  const frame = document.getElementById('gameFrame');
  frame.onload = () => {
    attachSpacePickupSound(id, frame);
    if (window.ArcadeControls?.mode === "pc") frame.contentWindow.focus();

  };
  if (frame.src !== new URL(game.url, location.href).href) frame.src = game.url;
}

function attachSpacePickupSound(id, frame) {
  if (id !== 'space') return;
  const points = frame.contentDocument?.getElementById('points');
  if (!points) return;
  let previous = Number(points.textContent) || 0;
  const Audio = window.AudioContext || window.webkitAudioContext;
  if (!Audio) return;
  const audio = new Audio();
  frame.contentWindow.addEventListener('pagehide', () => audio.close());
  new MutationObserver(() => {
    const current = Number(points.textContent) || 0;
    if (current > previous) {
      const now = audio.currentTime, oscillator = audio.createOscillator(), gain = audio.createGain();
      oscillator.frequency.setValueAtTime(650, now);
      oscillator.frequency.exponentialRampToValueAtTime(1180, now + .12);
      gain.gain.setValueAtTime(.12, now);
      gain.gain.exponentialRampToValueAtTime(.001, now + .14);
      oscillator.connect(gain).connect(audio.destination);
      oscillator.start(now); oscillator.stop(now + .15);
    }
    previous = current;
  }).observe(points, { childList: true, characterData: true, subtree: true });
}

async function toggleFullscreen() {
  const shell = document.querySelector('.hub-shell');
  if (document.fullscreenElement) await document.exitFullscreen(); else await shell.requestFullscreen();
}
function openStore() {}
function closeStore() {}
window.addEventListener('arcade-economy', () => { updateCoins(); updateGameLocks(); });
window.addEventListener('message', event => {
  if (event.source !== document.getElementById('gameFrame').contentWindow || event.origin !== location.origin) return;
  if (event.data?.type === 'duck-economy-updated') { updateCoins(); updateGameLocks(); }
  if (['duck-return-hub', 'game-return-hub'].includes(event.data?.type)) showHub();
});
window.addEventListener('storage', () => { updateCoins(); updateGameLocks(); });
window.addEventListener('DOMContentLoaded', () => { updateCoins(); updateGameLocks(); });
