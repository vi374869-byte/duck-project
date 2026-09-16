(() => {
  const game=document.querySelector('script[data-game]')?.dataset.game;
  const tap=id=>document.getElementById(id)?.click();
  let shape=0;
  function duckClick(x,y){const r=canvas.getBoundingClientRect();canvas.dispatchEvent(new MouseEvent('click',{clientX:r.left+x*r.width/canvas.width,clientY:r.top+y*r.height/canvas.height,bubbles:true}));}
  window.addEventListener('keydown',e=>{
    if(ArcadeControls.mode!=='pc'||e.target?.matches?.('input,textarea,select,[contenteditable=true]'))return;
    const k=e.key.toLowerCase();
    if(e.target?.closest?.('button,summary') && ['enter',' '].includes(k))return;
    if(game==='space'){
      if(!e.repeat && ['arrowleft','a'].includes(k))target=Math.max(0,target-1);
      if(!e.repeat && ['arrowright','d'].includes(k))target=Math.min(2,target+1);
      if(k===' ')boosting=true;
      if(k==='enter'&&!playing)start();
    } else if(game==='third'){
      if(k==='enter'&&!active)beginGame();
    } else if(game==='tiki'){
      if(/^[1-9]$/.test(k)&&!e.repeat)document.getElementById('board').children[Number(k)-1]?.click();
      if(k==='r'&&!e.repeat)resetGame();
    } else if(game==='rhythm'){
      if(k==='enter'&&!e.repeat)tap('btn-play');
    } else if(game==='seven'){
      if((e.ctrlKey||e.metaKey)&&['s','z'].includes(k)){e.preventDefault();tap(k==='s'?'btn-save':'btn-undo');return;}
      if(/^[1-9]$/.test(k))document.querySelectorAll('.swatch')[Number(k)-1]?.click();
      const shapes=[...document.querySelectorAll('#active-canvas .fillable')];
      if(k==='arrowright'||k==='arrowleft'){
        shape=(shape+(k==='arrowright'?1:-1)+shapes.length)%shapes.length;
        shapes.forEach((s,i)=>{s.style.filter=i===shape?'drop-shadow(0 0 2px #815ba8)':'';});
      }
      if(k==='enter')shapes[shape%shapes.length]?.dispatchEvent(new MouseEvent('click',{bubbles:true}));
    } else if(game==='duck'){
      keys[e.key]=true;
      if(/^[1-9]$/.test(k)&&!e.repeat)switchRoom(Number(k));
      if(k==='m')switchRoom(State.MENU);
      if(['z','x','c'].includes(k)&&currentState===3){const p=gardenPlots[['z','x','c'].indexOf(k)];duckClick(p.x,p.y);}
      if(k===' '||k==='enter'){
        e.preventDefault();
        if(currentState===0)duckClick(225,315);
        else if(currentState===9){const b=interactiveBubbles[0];if(b)duckClick(b.x,b.y);}
        else duckClick(duckWalk.x,410);
      }
    }
  });
  window.addEventListener('keyup',e=>{if(game==='space'&&e.key===' ')boosting=false;if(game==='duck')keys[e.key]=false;});
  window.addEventListener('arcade-input-reset',()=>{if(game==='space')boosting=false;if(game==='duck'||game==='six')Object.keys(keys).forEach(k=>keys[k]=false);});
  if(game==='third'){
    let previous=performance.now(),touchDirection=0;
    function move(now){const dt=Math.min(.05,(now-previous)/1000);previous=now;const held=ArcadeControls.held;const direction=ArcadeControls.mode==='mobile'?touchDirection:Number(held.has('d')||held.has('D')||held.has('ArrowRight'))-Number(held.has('a')||held.has('A')||held.has('ArrowLeft'));if(active)duck=Math.max(40,Math.min(860,duck+direction*520*dt));requestAnimationFrame(move);}
    requestAnimationFrame(move);
    for(const [id,direction] of [['left',-1],['right',1]]){const b=document.getElementById(id);b.onpointerdown=e=>{touchDirection=direction;b.setPointerCapture(e.pointerId);};for(const type of ['pointerup','pointercancel','lostpointercapture'])b.addEventListener(type,()=>touchDirection=0);}
    window.addEventListener('arcade-input-reset',()=>touchDirection=0);
  }
})();
