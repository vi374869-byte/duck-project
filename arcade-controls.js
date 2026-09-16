(() => {
  const key = 'skyArcadeControlsV1';
  const read = () => { try { return localStorage.getItem(key); } catch { return null; } };
  const saved=read();
  let mode = ['pc','mobile'].includes(saved)?saved:(matchMedia('(pointer: coarse)').matches?'mobile':'pc');
  const held = new Set();
  const emit = (type, value) => window.dispatchEvent(new KeyboardEvent(type, {key:value, code:value.length===1?'Key'+value.toUpperCase():value, bubbles:true}));
  function release() { for (const value of held) emit('keyup', value); held.clear(); window.dispatchEvent(new Event('arcade-input-reset')); }
  function setMode(value, persist = true) {
    release(); mode = value === 'mobile' ? 'mobile' : 'pc';
    if (persist) { try { localStorage.setItem(key, mode); } catch {} }
    document.documentElement.dataset.controls = mode;
    window.dispatchEvent(new Event('arcade-controls-change'));
  }
  function refreshMode() { const saved=read(); if (['pc','mobile'].includes(saved) && saved!==mode) setMode(saved, false); }
  window.ArcadeControls = {get mode(){return mode;}, setMode, refreshMode, held,
    press(value, down) { if (down === held.has(value)) return; down ? held.add(value) : held.delete(value); emit(down?'keydown':'keyup',value); }};
  document.documentElement.dataset.controls = mode;
  const editable = e => e.target?.matches?.('input,textarea,select,[contenteditable=true]');
  window.addEventListener('keydown', e => {
    if (editable(e)) {e.stopImmediatePropagation();return;}
    if (mode === 'mobile' && e.isTrusted && !['Tab','Enter','Escape'].includes(e.key)) {e.stopImmediatePropagation(); return;}
    held.add(e.key);
    if (mode === 'pc' && [' ','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.key) && !e.target?.matches?.('button')) e.preventDefault();
  }, true);
  window.addEventListener('keyup', e => held.delete(e.key), true);
  window.addEventListener('blur', release);
  document.addEventListener('visibilitychange', () => {if(document.hidden) release();});
  window.addEventListener('storage', e => {if(e.key === key) refreshMode();});
  window.addEventListener('focus', refreshMode);
  document.addEventListener('DOMContentLoaded', () => {
    const game = document.querySelector('script[data-game]')?.dataset.game;
    const toggle = document.createElement('div'); toggle.className='arcade-mode-toggle';
    toggle.innerHTML='<span>Controls</span><button type="button" data-mode="pc">⌨ PC</button><button type="button" data-mode="mobile">☝ Mobile</button>';
    toggle.querySelectorAll('button').forEach(b => b.onclick=()=>setMode(b.dataset.mode));
    const refresh=()=>toggle.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.mode===mode)));
    window.addEventListener('arcade-controls-change',refresh); refresh();
    if(game==='hub'){document.querySelector('.topbar').append(toggle);return;}
    const hints={duck:['1–6 rooms · 7–9 mini games · Space interact/flap · ← → catch · M menu','Tap your duck, rooms and games. Drag to catch bread.'],space:['A/D or ← → lanes · Hold Space boost · Enter launch','Tap or drag to steer. Hold BOOST to speed up.'],third:['A/D or ← → steer · Enter race','Drag to steer, or hold the left/right buttons.'],tiki:['1–9 choose a square (top left to bottom right) · R restart','Tap a square to place your piece.'],rhythm:['D F G J K hit notes · Enter play','Tap the five lanes to the beat.'],six:['WASD or arrows move · Walk onto pads to buy upgrades','Use the joystick or drag your worker. Walk onto upgrade pads.'],seven:['1–9 colors · ← → select shape · Enter paint · Ctrl+Z undo · Ctrl+S save','Tap a color, then a shape. Tap a drawing to unlock it.'],multi:['WASD / arrows move · IJKL aim · Space fire · Mouse aim/fire','Use the joystick to move. Hold the arena to aim and fire.']};
    hints.cloud=['WASD / arrows move · Mouse aim/fire · 1/2 weapons','Use the joystick to move. Hold the arena to aim and fire.'];
    if(location.pathname.endsWith('/sky-strike.html'))hints.multi[0]+=' · 1/2 weapons · Enter start';
    if(!document.querySelector('canvas') && game==='multi') hints.multi=['Tab choose fields · Enter activate buttons','Tap a field to enter your name and room. Tap a button to join.'];
    const dock=document.createElement('details');dock.id='arcade-controls-dock';
    dock.innerHTML='<summary></summary><div class="controls-details"></div>';
    dock.lastChild.append(toggle);document.body.append(dock);
    function updateHint(){const inlineHint=document.getElementById('controls-hint');if(inlineHint&&hints[game])inlineHint.textContent=hints[game][mode==='pc'?0:1];dock.querySelector('summary').textContent=(mode==='pc'?'⌨ PC · ':'☝ Mobile · ')+(hints[game]||['Tab / Enter choose · Mouse play','Tap to play'])[mode==='pc'?0:1];}
    window.addEventListener('arcade-controls-change',updateHint);updateHint();
    if ((['multi','cloud'].includes(game) && document.querySelector('canvas')) || game==='six') {
      const stick=document.createElement('div');stick.id='arcade-touch-stick';stick.setAttribute('aria-label','Drag to move');stick.innerHTML='<span>MOVE</span><i></i>';document.body.append(stick);
      let pointer=null;
      const move=e=>{const r=stick.getBoundingClientRect(),dx=e.clientX-r.left-r.width/2,dy=e.clientY-r.top-r.height/2; const l=Math.max(1,Math.hypot(dx,dy)/30);stick.lastChild.style.transform=`translate(${dx/l}px,${dy/l}px)`;for(const [k,on] of [['a',dx < -10],['d',dx>10],['w',dy < -10],['s',dy>10]]) ArcadeControls.press(k,on);};
      stick.onpointerdown=e=>{if(pointer!==null)return;pointer=e.pointerId;stick.setPointerCapture(pointer);move(e);e.stopPropagation();e.preventDefault();};
      stick.onpointermove=e=>{if(e.pointerId===pointer){move(e);e.stopPropagation();}};
      const stop=e=>{if(e && e.pointerId!==pointer)return;pointer=null;for(const k of ['w','a','s','d'])ArcadeControls.press(k,false);stick.lastChild.style.transform='';e?.stopPropagation();};
      stick.onpointerup=stop;stick.onpointercancel=stop;stick.onlostpointercapture=stop;
      window.addEventListener('arcade-input-reset',()=>stop());
    }
  });
})();
