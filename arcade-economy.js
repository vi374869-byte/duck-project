/* One browser-local wallet, shared by the hub and every game. */
(() => {
  'use strict';
  const KEY = 'duckSharedEconomyV2';
  const game = document.currentScript?.dataset.game || 'hub';
  const titles = {duck:'Pet a Duck',space:'Space Wars',third:'Candy Racers',tiki:'TikiTaki',rhythm:'Rhythm Mania',six:'Tycoon',seven:'Color Splash',multi:'Sky Strike',cloud:'Cloud Duel'};
  const catalog = {
    bonus: {name:'Double coins',cost:75,description:'Earn twice as many coins from this game.'},
    gold: {name:'Golden frame',cost:120,description:'Give this game a glowing golden border.'}
  };
  let fallback = null, storageFailed = false;
  function safeRead(key, defaultValue = {}) {
    try { const value = JSON.parse(localStorage.getItem(key)); return value && typeof value === 'object' ? value : defaultValue; }
    catch (_) { return defaultValue; }
  }
  function clean(value) {
    const perks = {};
    for (const id of Object.keys(titles)) perks[id] = Array.isArray(value.perks?.[id]) ? value.perks[id].filter(p => Object.hasOwn(catalog,p)) : [];
    return {...value, coins:Number.isSafeInteger(value.coins) && value.coins >= 0 ? value.coins : 0,
      vip:value.vip === true, unlockedGames:Array.isArray(value.unlockedGames) ? value.unlockedGames : [],
      perks,
      claims:Array.isArray(value.claims) ? value.claims : []};
  }
  function read() { return clean(storageFailed && fallback ? fallback : safeRead(KEY, fallback || {})); }
  function write(value) {
    fallback = clean(value);
    try { localStorage.setItem(KEY, JSON.stringify(fallback)); storageFailed = false; }
    catch (_) { storageFailed = true; }
    window.dispatchEvent(new Event('arcade-economy'));
    if (parent !== window) parent.postMessage({type:'duck-economy-updated'}, location.origin === 'null' ? '*' : location.origin);
    return fallback;
  }
  function has(id, which = game) { return read().perks[which]?.includes(id) === true; }
  function earn(amount, which = game, claim) {
    if (!Number.isSafeInteger(amount) || amount <= 0 || !titles[which]) return 0;
    const state = read();
    if (claim && state.claims.includes(claim)) return 0;
    const reward = amount * (state.perks[which]?.includes('bonus') ? 2 : 1);
    if (!Number.isSafeInteger(state.coins + reward)) return 0;
    state.coins += reward;
    if (claim) state.claims.push(claim);
    write(state); return reward;
  }
  function spend(amount) {
    const state = read();
    if (!Number.isSafeInteger(amount) || amount < 0 || state.coins < amount) return false;
    state.coins -= amount; write(state); return true;
  }
  function buy(id, which = game) {
    const perk = catalog[id], state = read();
    if (!perk || !titles[which] || state.perks[which]?.includes(id) || state.coins < perk.cost) return false;
    state.coins -= perk.cost;
    state.perks[which] = [...(Array.isArray(state.perks[which]) ? state.perks[which] : []), id];
    write(state); return true;
  }
  const existing = safeRead(KEY, null);
  if (!existing) {
    const old = safeRead('duckPetFinalVersionV1');
    write({coins:Number.isSafeInteger(old.coins) ? old.coins : 100,vip:old.vip === true});
  }
  window.Arcade = {read,write,safeRead,earn,spend,buy,has,game,catalog};
  window.addEventListener('storage', event => { if (event.key === KEY) window.dispatchEvent(new Event('arcade-economy')); });
  window.addEventListener('DOMContentLoaded', () => {
    if (game === 'hub') return;
    const host = document.createElement('div');
    host.id = 'arcade-wallet';
    const shadow = host.attachShadow({mode:'open'});
    shadow.innerHTML = `<style>:host{position:fixed;right:12px;bottom:10px;z-index:10000;font:14px system-ui;color:#30264b}button{font:inherit;font-weight:700;cursor:pointer;border:2px solid #efbb46;border-radius:14px;padding:9px 13px;background:#fff5c6;color:#493510}button:disabled{cursor:default;opacity:.6}dialog{color:#30264b;background:#fffdf4;border:3px solid #efbb46;border-radius:20px;max-width:340px;width:calc(100vw - 60px);padding:22px}dialog::backdrop{background:#11182799}h2{margin-top:0}article{margin:16px 0}p{line-height:1.4}small{display:block;margin-top:8px}button:focus-visible{outline:3px solid #385ed5;outline-offset:3px}</style><button id="open" aria-label="Open coin balance and perks">🪙 <span id="balance"></span> · Perks</button><dialog><h2>${titles[game] || 'Arcade'} perks</h2><p>One coin balance for every game. Unlocks are permanent.</p><div id="items"></div><p id="status" role="status"></p><button id="close">Back to game</button><small>Saved in this browser.</small></dialog>`;
    document.body.append(host);
    const dialog = shadow.querySelector('dialog');
    shadow.querySelector('#open').onclick = () => { render(); dialog.showModal(); };
    shadow.querySelector('#close').onclick = () => dialog.close();
    const frame = document.createElement('style');
    frame.textContent = 'html.arcade-gold::after{content:"";position:fixed;inset:0;border:5px solid #ffce54;box-shadow:inset 0 0 25px #ffcd5480;pointer-events:none;z-index:9999;box-sizing:border-box}';
    document.head.append(frame);
    function render() {
      shadow.querySelector('#balance').textContent = read().coins.toLocaleString();
      document.documentElement.classList.toggle('arcade-gold',has('gold'));
      const items = shadow.querySelector('#items'); items.replaceChildren();
      for (const [id,perk] of Object.entries(catalog)) {
        const article = document.createElement('article'), button = document.createElement('button'), description = document.createElement('p');
        const owned = has(id);
        button.textContent = owned ? `${perk.name} · Unlocked` : `${perk.name} · ${perk.cost} coins`;
        button.disabled = owned || read().coins < perk.cost;
        description.textContent = perk.description;
        button.onclick = () => { const success = buy(id); shadow.querySelector('#status').textContent = success ? `${perk.name} unlocked!` : 'Not enough coins or already unlocked.'; };
        article.append(button,description); items.append(article);
      }
      if (storageFailed) shadow.querySelector('#status').textContent = 'Browser storage is unavailable. Progress lasts for this page only.';
    }
    window.addEventListener('arcade-economy',render); render();
  });
})();
