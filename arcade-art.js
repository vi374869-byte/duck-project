/* Shared illustrated materials; game rules and hit boxes stay in each game. */
const ArcadeArt = (() => {
  const {gradient:grad,oval,panel,cloud} = DuckArt;
  const ink='#66536f', cache=new Map();
  function path(c,points,fill,stroke) {c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fillStyle=fill;c.fill();if(stroke){c.strokeStyle=stroke;c.lineWidth=2;c.stroke();}}
  function line(c,points,color,width=2){c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.strokeStyle=color;c.lineWidth=width;c.lineCap='round';c.stroke();}
  function label(c,text,x,y,size=12,color=ink){c.fillStyle=color;c.font=`bold ${size}px "Trebuchet MS", sans-serif`;c.textAlign='center';c.fillText(text,x,y);}
  function star(c,x,y,r,color='#fff4c4'){path(c,[[x,y-r],[x+r*.3,y-r*.3],[x+r,y],[x+r*.3,y+r*.3],[x,y+r],[x-r*.3,y+r*.3],[x-r,y],[x-r*.3,y-r*.3]],color);}
  function cached(c,key,w,h,draw){if(!(w>0&&h>0))return;const id=`${key}:${Math.round(w)}:${Math.round(h)}`;let bg=cache.get(id);if(!bg){bg=document.createElement('canvas');bg.width=Math.ceil(w);bg.height=Math.ceil(h);draw(bg.getContext('2d'));if(cache.size>12)cache.clear();cache.set(id,bg);}c.drawImage(bg,0,0,w,h);}
  function sky(c,w,h,colors=['#c5e9f3','#ecf4e5']){c.fillStyle=grad(c,0,0,h,colors);c.fillRect(0,0,w,h);cloud(c,w*.14,h*.2,.8);cloud(c,w*.78,h*.31,.65);cloud(c,w*.47,h*.1,.42);}
  function space(c){const h=c.canvas.height,horizon=h*2/9;cached(c,'space',900,h,g=>{
    g.fillStyle=grad(g,0,0,h,['#c5bee8','#d8d1ef','#eee4ef']);g.fillRect(0,0,900,h);
    for(let i=0;i<55;i++)star(g,(i*137+31)%900,(i*53+12)%(h*.58),2+i%3,'#fffbea');
    oval(g,732,h*.19,46,46,grad(g,0,h*.19-46,95,['#fff2cf','#e6c6bb']));g.save();g.translate(732,h*.19+4);g.rotate(-.35);g.strokeStyle='#fff4deaa';g.lineWidth=9;g.beginPath();g.ellipse(0,0,67,16,0,0,Math.PI*2);g.stroke();g.restore();
    oval(g,136,h*.37,30,30,grad(g,0,h*.37-30,60,['#d0ecf1','#a5c1df']));oval(g,125,h*.37-10,9,7,'#f4fbff70');
    cloud(g,120,h*.56,.9);cloud(g,784,h*.6,1.1);
    path(g,[[300,horizon],[600,horizon],[900,h],[0,h]],grad(g,0,horizon,h-horizon,['#f4e8ed','#bbaed9']));
    line(g,[[300,horizon],[0,h]],'#fff9e9',8);line(g,[[600,horizon],[900,h]],'#fff9e9',8);
    for(let lane=0;lane<2;lane++)for(let y=horizon+45;y<h-10;y+=45){const x=450+(lane?1:-1)*(y-horizon)/(h-horizon)*130;line(g,[[x,y],[x+(lane?1:-1)*5,y+16]],'#fff5e6bb',3);}
    for(let y=horizon+55;y<h;y+=65){const edge=(y-horizon)/(h-horizon)*450;line(g,[[450-edge,y],[450+edge,y]],'#ffffff25',1);}
  });}
  function ship(c,x,y){c.save();c.translate(x,y);oval(c,0,45,54,10,'#8977a335');
    path(c,[[-16,28],[-13,67],[0,83],[13,67],[16,28]],grad(c,0,25,60,['#fff3b5','#ecb39f']));
    path(c,[[-19,-8],[-58,28],[-57,39],[-18,29]],grad(c,0,-10,50,['#f5cfdf','#bf96c5']),'#fff0f4');
    path(c,[[19,-8],[58,28],[57,39],[18,29]],grad(c,0,-10,50,['#f5cfdf','#bf96c5']),'#fff0f4');
    c.fillStyle=grad(c,-10,-55,100,['#fffaf0','#efdbd9','#d3bcd5']);c.beginPath();c.moveTo(0,-55);c.bezierCurveTo(-33,-26,-28,17,-16,39);c.quadraticCurveTo(0,45,16,39);c.bezierCurveTo(28,17,33,-26,0,-55);c.fill();c.strokeStyle='#fff8f0';c.lineWidth=3;c.stroke();
    oval(c,0,-12,16,23,'#ae9bc4');oval(c,0,-14,12,18,grad(c,0,-30,36,['#e0f9ff','#94bed7']));line(c,[[-7,-20],[-4,-25],[3,-26]],'#ffffffc0',3);line(c,[[-13,25],[13,25]],'#c7a6c2',4);c.restore();}
  function gem(c,x,y,r){c.save();path(c,[[x,y-r],[x+r*.72,y],[x,y+r],[x-r*.72,y]],grad(c,x,y-r,r*2,['#f1ffff','#86cdd8','#a89bcf']),'#fff8ed');path(c,[[x,y-r],[x,y+r],[x-r*.72,y]],'#d9f8f780');line(c,[[x-r*.3,y-r*.17],[x,y-r*.55]],'#ffffffd9',2);c.restore();}
  function candyBackground(c){const h=c.canvas.height;cached(c,'candy',900,h,g=>{
    sky(g,900,h,['#bce8f0','#ffecde']);
    oval(g,110,h*.7,230,200,grad(g,0,h*.3,h*.6,['#f6cddc','#ddabc6']));oval(g,770,h*.74,250,230,grad(g,0,h*.3,h*.6,['#d4c8eb','#b8b4dc']));
    for(let i=0;i<10;i++){const x=35+i*94,y=h*.46+(i%3)*39;line(g,[[x,y],[x,y+115]],'#fff9df',9);oval(g,x,y,22,22,i%2?'#fff1af':'#f1b8ce');g.strokeStyle='#ffffffa0';g.lineWidth=5;g.beginPath();g.arc(x,y,12,0,Math.PI*1.6);g.stroke();}
    path(g,[[315,h*.35],[585,h*.35],[900,h],[0,h]],grad(g,0,h*.35,h*.65,['#f5ded7','#e7bbca']));line(g,[[315,h*.35],[0,h]],'#fff5dc',10);line(g,[[585,h*.35],[900,h]],'#fff5dc',10);
    for(let y=h*.44;y<h-40;y+=55)line(g,[[450,y],[450,y+24]],'#fff4dcaa',5);
    panel(g,0,h-48,900,48,'#fff0c1','#e4b996',10);for(let i=0;i<900;i+=45)line(g,[[i,h-39],[i+18,h-12]],'#f2cca2',2);
  });}
  function candy(c,x,y,good){c.save();c.translate(x,y);if(good){path(c,[[-11,-7],[-24,-14],[-23,13],[-11,7]],'#d69ab7');path(c,[[11,-7],[24,-14],[23,13],[11,7]],'#d69ab7');panel(c,-14,-12,28,24,'#fff4da','#efadc8',10);line(c,[[-5,-7],[4,7]],'#ffffffa0',6);}else{oval(c,0,0,18,18,grad(c,0,-18,36,['#c2b5d6','#867caa']));line(c,[[5,-15],[10,-24],[17,-22]],'#857092',3);star(c,20,-25,5,'#ffdc8f');line(c,[[-8,-2],[-3,2]],'#59476d',2);line(c,[[8,-2],[3,2]],'#59476d',2);line(c,[[-5,10],[0,7],[5,10]],'#f5e7ef',2);}c.restore();}
  function kart(c,x,y){c.save();c.translate(x,y);oval(c,0,31,43,9,'#9e718331');panel(c,-36,8,15,25,'#a195b5','#766b91',6);panel(c,21,8,15,25,'#a195b5','#766b91',6);panel(c,-40,-8,80,37,'#fff0c7','#efb1c4',15);c.save();c.translate(-8,-8);c.scale(.38,.38);DuckArt.body(c,'#eec76b','#fff0ad');DuckArt.head(c,'#eec76b','#fff0ad');c.restore();panel(c,-30,7,60,18,'#fff3d2','#edc29d',7);oval(c,-23,14,5,4,'#fffce2');oval(c,23,14,5,4,'#fffce2');star(c,0,15,6,'#d2acbe');c.restore();}
  function arena(c,w,h){cached(c,'arena',w,h,g=>{
    sky(g,w,h,['#bbdfed','#deddf0']);
    panel(g,12,12,w-24,h-24,'#f6f4e4','#d6e6dd',28);
    g.save();g.beginPath();g.roundRect(18,18,w-36,h-36,22);g.clip();
    for(let y=25;y<h;y+=48)for(let x=25;x<w;x+=48){panel(g,x,y,44,44,(x+y)%3?'#e3eee3':'#eae6ef','#d8e3dc',8);oval(g,x+11,y+12,1,1,'#ffffffd0');}
    g.restore();
    for(let i=0;i<8;i++)star(g,27+i*(w-54)/8,h-26,3,'#b6cebf');
  });}
  function obstacle(c,x,y,w,h){panel(c,x,y,w,h,'#e0d2eb','#b7a9cd',Math.min(14,h/2));line(c,[[x+10,y+8],[x+w-10,y+8]],'#fff6ee99',2);}
  function pilot(c,x,y,angle,color,name,health=100,r=16){c.save();oval(c,x,y+r+5,r+4,5,'#8a81932b');c.translate(x,y);c.rotate(angle||0);oval(c,0,0,r,r,grad(c,0,-r,r*2,['#fff8ec',color]));c.strokeStyle='#fffaf1';c.lineWidth=2;c.stroke();panel(c,2,-6,r+14,12,'#f9f4e7','#aa9fb9',5);panel(c,-9,-11,15,22,'#a4c9d8','#748da9',6);line(c,[[-6,-6],[-6,3]],'#e4fbffc0',2);c.restore();label(c,name,x,y-r-11,11);panel(c,x-18,y+r+10,36,5,'#ede2e9','#e0d2df',2);if(health>0){c.fillStyle='#7bab98';c.beginPath();c.roundRect(x-17,y+r+11,34*Math.min(100,health)/100,3,1.5);c.fill();}}
  function pellet(c,x,y,color,r=4){oval(c,x,y,r+1,r+1,color);oval(c,x-r*.2,y-r*.3,r*.4,r*.4,'#fff7e4');}
  function rhythmBackground(c,w,h,laneWidth,pressed,colors,hitY){cached(c,'rhythm',w,h,g=>{
    g.fillStyle=grad(g,0,0,h,['#e4d8f0','#f9e9e8']);g.fillRect(0,0,w,h);
    for(let i=0;i<5;i++){g.fillStyle=grad(g,0,0,h,['#ffffff60',['#efd4df','#f4deca','#efe7c8','#d7e9df','#e1d9ef'][i]]);g.fillRect(i*laneWidth+2,0,laneWidth-4,h);}
    for(let i=0;i<30;i++)star(g,(i*71+11)%w,(i*97+33)%h,2,'#ffffff75');
  });
    for(let i=0;i<5;i++){if(pressed[i]){c.fillStyle='#fffdf07a';c.fillRect(i*laneWidth,0,laneWidth,h);}panel(c,i*laneWidth+5,hitY-15,laneWidth-10,30,'#fffdf0',pressed[i]?colors[i]:'#e2d4e7',8);label(c,window.ArcadeControls?.mode==='mobile'?'♪':['D','F','G','J','K'][i],i*laneWidth+laneWidth/2,hitY+5,14);}
  }
  function note(c,x,y,w,color){panel(c,x,y,w,18,'#fff9e7',color,7);oval(c,x+w/2-4,y+10,4,3,'#806b894d');line(c,[[x+w/2,y+10],[x+w/2,y+3],[x+w/2+4,y+4]],'#806b894d',1.5);}
  function tycoon(c,w,h,s){c.save();cached(c,'tycoon',w,h,g=>{sky(g,w,h,['#b9ddea','#e4eddd']);oval(g,w*.5,h*.8,w*.37,24,'#94b4b033');panel(g,110,80,w-220,h-160,'#f7edd8','#dfcdb6',27);g.save();g.beginPath();g.roundRect(116,86,w-232,h-172,22);g.clip();for(let y=100;y<h-80;y+=35)line(g,[[116,y],[w-116,y]],'#bfac942b',1);for(let x=125;x<w-110;x+=48)line(g,[[x,86],[x,h-86]],'#bfac942b',1);g.restore();});
    const {conveyorBelt:b,beltScroll,worldUpgraders,droppers,furnace,ores,pads,cash,collectPad,vaultCash,player,particles,hasWalls,hasTurret}=s;
    if(hasWalls){c.strokeStyle='#b69cc9';c.lineWidth=8;c.beginPath();c.roundRect(120,90,w-240,h-180,20);c.stroke();}
    panel(c,b.startX,b.startY-b.width/2,b.endX-b.startX,b.width,'#a3c3c8','#789aa7',8);
    for(let x=b.startX+beltScroll;x<b.endX;x+=16)line(c,[[x,b.startY-12],[x,b.startY+12]],'#d6e4df90',2);
    worldUpgraders.forEach(u=>{panel(c,u.x-u.w/2,u.y,u.w,u.h,'#eee0f3','#b8a0ce',8);line(c,[[u.x,u.y+7],[u.x,u.y+u.h-7]],'#fff3c8',5);});
    droppers.forEach(d=>{panel(c,d.x-20,d.y-30,40,38,'#fff2d7','#c5d7c4',9);panel(c,d.x-10,d.y-21,20,14,'#aecbd3','#83a3b9',4);line(c,[[d.x-7,d.y+5],[d.x+7,d.y+5]],'#ac91ba',7);oval(c,d.x-9,d.y-14,2,2,'#fff6c9');});
    panel(c,furnace.x,furnace.y,furnace.w,furnace.h,'#f4d7c1','#c9a0a3',10);panel(c,furnace.x+9,furnace.y+13,35,36,'#a58b9e','#816f8d',10);path(c,[[furnace.x+17,furnace.y+43],[furnace.x+20,furnace.y+22],[furnace.x+27,furnace.y+32],[furnace.x+33,furnace.y+24],[furnace.x+36,furnace.y+43]],'#ffdc98');
    ores.forEach(o=>gem(c,o.x,o.y,7));
    pads.forEach(p=>{if(!p.unlocked||p.bought)return;oval(c,p.x,p.y+4,p.radius,p.radius,'#b2a19130');oval(c,p.x,p.y,p.radius,p.radius,grad(c,0,p.y-p.radius,p.radius*2,['#fffcdf','#e7c9ab']));c.strokeStyle='#fff8ea';c.lineWidth=3;c.stroke();star(c,p.x,p.y,9,cash>=p.cost?'#84b39d':'#cfa1ac');label(c,p.title,p.x,p.y-p.radius-7,10);label(c,`${p.cost} coins`,p.x,p.y+p.radius+14,10,cash>=p.cost?'#427d65':'#a35671');});
    oval(c,collectPad.x,collectPad.y,collectPad.radius,collectPad.radius,grad(c,0,collectPad.y-28,56,['#e8f5cc','#a5c5a9']));c.strokeStyle='#fffce9';c.lineWidth=3;c.stroke();label(c,'COLLECT',collectPad.x,collectPad.y+4,10,'#49775e');if(vaultCash)label(c,`${Math.floor(vaultCash)}`,collectPad.x,collectPad.y-34,11,'#49775e');
    if(hasTurret){panel(c,637,130,40,40,'#dad7eb','#a4a2c6',14);line(c,[[657,150],[675,133]],'#829eaf',8);oval(c,651,146,5,5,'#e8f6ec');}
    particles.forEach(p=>{c.globalAlpha=Math.max(0,p.alpha);star(c,p.x,p.y,3,'#fff1ba');});c.globalAlpha=1;
    oval(c,player.x,player.y+13,13,5,'#bca99550');panel(c,player.x-10,player.y-8,20,23,'#e5d5e9','#ad97bc',7);oval(c,player.x,player.y-11,11,10,'#f3d0af');panel(c,player.x-13,player.y-22,26,13,'#fff0bc','#e1be80',7);line(c,[[player.x-3,player.y-10],[player.x-3,player.y-8]],ink,2);line(c,[[player.x+4,player.y-10],[player.x+4,player.y-8]],ink,2);c.restore();}
  return {space,ship,gem,candyBackground,candy,kart,arena,obstacle,pilot,pellet,rhythmBackground,note,tycoon};
})();
