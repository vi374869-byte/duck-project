/* Canvas artwork in the same soft, dimensional palette as Sky Arcade. */
const DuckArt = (() => {
  const tau = Math.PI * 2;
  function gradient(c,x,y,h,colors) { const g=c.createLinearGradient(x,y,x,y+h); colors.forEach((v,i)=>g.addColorStop(i/(colors.length-1),v)); return g; }
  function fabric(c,color) { const n=parseInt(color.slice(1),16);const light=[n>>16,(n>>8)&255,n&255].map(v=>Math.round(v+(255-v)*.28));return gradient(c,0,-100,180,[`rgb(${light.join(',')})`,color]); }
  function oval(c,x,y,rx,ry,fill,angle=0) { c.fillStyle=fill;c.beginPath();c.ellipse(x,y,rx,ry,angle,0,tau);c.fill(); }
  function line(c,points,color,width=2) { c.strokeStyle=color;c.lineWidth=width;c.lineCap='round';c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.stroke(); }
  function panel(c,x,y,w,h,top='#fffdf7',bottom='#e7e1f3',radius=16) {
    c.save();c.shadowColor='#63558228';c.shadowBlur=8;c.shadowOffsetY=5;
    c.fillStyle=gradient(c,x,y,h,[top,bottom]);c.beginPath();c.roundRect(x,y,w,h,Math.min(radius,h/2,w/2));c.fill();
    c.shadowColor='transparent';c.strokeStyle='#ffffffcc';c.lineWidth=2;c.stroke();
    c.beginPath();c.roundRect(x+4,y+4,w-8,Math.max(2,h*.32),Math.min(radius,8));c.fillStyle='#ffffff25';c.fill();c.restore();
  }
  function texture(c,x,y,w,h,color='#ffffff35',step=17) {
    c.save();c.beginPath();c.rect(x,y,w,h);c.clip();
    for(let row=0;row<h/step;row++)for(let col=0;col<w/step;col++){
      const px=x+col*step+(row%2)*7,py=y+row*step;
      oval(c,px,py,1,1,color);
    }c.restore();
  }
  function cloud(c,x,y,s=1) {
    c.save();c.translate(x,y);c.scale(s,s);c.shadowColor='#6e9fbd20';c.shadowBlur=6;c.shadowOffsetY=5;
    c.fillStyle=gradient(c,0,-25,55,['#ffffff','#f5fcff','#c8e6f0']);
    c.beginPath();c.moveTo(-55,20);c.bezierCurveTo(-85,20,-81,-10,-56,-10);c.bezierCurveTo(-59,-34,-27,-41,-16,-22);c.bezierCurveTo(0,-55,44,-39,43,-12);c.bezierCurveTo(69,-18,84,15,58,23);c.bezierCurveTo(20,31,-28,28,-55,20);c.fill();
    c.shadowColor='transparent';line(c,[[-51,15],[-30,18],[-10,17]],'#ffffffa0',3);c.restore();
  }
  function scene(c,kind) {
    c.save();
    const height=c.canvas.height;
    const outdoor=['garden','menu','flap'].includes(kind),bath=kind==='bath';
    c.fillStyle=gradient(c,0,0,600,outdoor?['#95daf3','#dcf5ff','#c9eacb']:bath?['#d3f3ff','#effcff','#a7ddea']:['#efe0fa','#fbf0e9','#edd1b3']);c.fillRect(0,0,450,height);
    texture(c,0,0,450,350,'#ffffff60',20);
    if(outdoor){
      oval(c,355,90,37,37,gradient(c,0,50,80,['#fff9c5','#ffda84']));oval(c,344,77,14,9,'#ffffff65',-.4);
      cloud(c,82,125,.72);cloud(c,340,205,.62);cloud(c,214,51,.4);
      if(kind!=='flap'){
        oval(c,100,375,220,95,gradient(c,0,280,170,['#b4e9b8','#78bd91']));oval(c,370,395,235,105,'#9dd8aa');
        c.fillStyle=gradient(c,0,350,250,['#b7e6a6','#7bbe92']);c.fillRect(0,350,450,height-350);
        for(let i=0;i<65;i++){const x=(i*79)%450,y=362+(i*47)%230;line(c,[[x-3,y],[x,y-6],[x+3,y]],'#609e7855',1.2);}
        for(let i=0;i<15;i++){const x=(i*97+24)%450,y=365+(i*31)%120;oval(c,x,y,3,3,i%2?'#fff8db':'#f9cee4');oval(c,x,y,1,1,'#e6b461');}
      }
    }else if(bath){
      for(let y=35;y<350;y+=58)for(let x=-20;x<450;x+=65)panel(c,x,y,61,54,'#ecfbff','#cce8f3',9);
      panel(c,255,72,135,145,'#fffdf7','#b1d4ec',45);panel(c,267,82,111,119,'#a8d6eb','#effbff',36);
      line(c,[[290,177],[343,100]],'#ffffff99',8);
      c.fillStyle=gradient(c,0,350,250,['#9cdce8','#62b5d2']);c.fillRect(0,350,450,height-350);
      for(let i=0;i<12;i++){const y=367+i*20;line(c,[[0,y],[80,y-3],[160,y+3],[240,y-2],[340,y+2],[450,y]],'#e7fbff65',2);}
      for(let i=0;i<10;i++)bubble(c,30+(i*61)%400,425+(i*37)%150,5+i%4*2);
      panel(c,30,270,60,62,'#ffe4e9','#e8b3cf',14);panel(c,43,258,34,15,'#fffdf4','#d4b7dd',5);
      oval(c,60,301,12,14,'#fff7e7');
    }else{
      // Embossed wallpaper, painted skirting, and warm wood floorboards.
      for(let x=12;x<450;x+=32)line(c,[[x,0],[x,350]],'#cfbddb44',1);
      c.fillStyle=gradient(c,0,350,250,['#e9cba9','#d9b48f']);c.fillRect(0,350,450,height-350);
      for(let y=350;y<height;y+=42){line(c,[[0,y],[450,y]],'#bd926a70',2);for(let x=(y%84?0:65);x<450;x+=130){line(c,[[x,y],[x,y+42]],'#bd926a50',1);line(c,[[x+12,y+18],[x+90,y+15]],'#fff2d450',1);}}
      panel(c,0,335,450,18,'#fffdf1','#dcc9df',2);
      if(kind==='home'){
        panel(c,260,66,145,173,'#fffdf9','#d0bedc',23);panel(c,271,77,123,145,'#8ed7ef','#d5f4f5',17);
        cloud(c,334,127,.42);oval(c,330,218,62,30,'#a0d9a7');line(c,[[333,78],[333,220]],'#fffdf7',7);line(c,[[274,155],[391,155]],'#fffdf7',7);
        panel(c,257,228,150,13,'#fff9e9','#c9b4ce',5);
        oval(c,220,480,135,36,'#ba99bb44');oval(c,220,474,131,34,gradient(c,0,440,70,['#ead4ed','#c5aad3']));
        c.strokeStyle='#fff4e6';c.lineWidth=2;c.setLineDash([4,5]);c.beginPath();c.ellipse(220,474,120,27,0,0,tau);c.stroke();c.setLineDash([]);
      }
    }
    c.restore();
  }
  function body(c,base,highlight) {
    c.save();
    const g=gradient(c,0,-30,90,[highlight,base,'#dfaa48']);
    c.fillStyle=g;c.beginPath();c.moveTo(-43,-6);c.quadraticCurveTo(-66,-20,-59,-30);c.quadraticCurveTo(-37,-17,-23,-24);c.bezierCurveTo(45,-45,70,9,39,41);c.bezierCurveTo(9,65,-48,47,-50,12);c.closePath();c.fill();
    c.strokeStyle='#a97d452e';c.lineWidth=2;c.stroke();
    oval(c,-14,-5,26,15,'#fffde93d',-.35);
    c.fillStyle=gradient(c,-10,0,35,[highlight,base,'#d7a044']);c.beginPath();c.moveTo(-26,4);c.bezierCurveTo(-3,-6,22,8,17,20);c.quadraticCurveTo(-9,37,-29,14);c.closePath();c.fill();
    for(let i=0;i<3;i++)line(c,[[-15+i*8,14],[-8+i*8,20]],'#b8873f55',1.6);
    c.save();c.beginPath();c.ellipse(-3,9,45,35,0,0,tau);c.clip();texture(c,-48,-25,90,75,'#fff7c630',11);c.restore();c.restore();
  }
  function head(c,base,highlight,sleeping=false) {
    c.save();oval(c,28,-35,33,34,gradient(c,0,-67,67,[highlight,base,'#edba55']));
    c.fillStyle=highlight;c.beginPath();c.moveTo(11,-60);c.quadraticCurveTo(6,-79,22,-68);c.quadraticCurveTo(22,-82,31,-65);c.fill();
    oval(c,14,-49,13,8,'#fffdea60',-.5);
    c.fillStyle=gradient(c,0,-40,24,['#ffd68a','#f4a24c','#df7e48']);c.beginPath();c.moveTo(51,-40);c.bezierCurveTo(66,-45,85,-36,81,-29);c.quadraticCurveTo(75,-18,52,-22);c.closePath();c.fill();
    line(c,[[56,-29],[76,-29]],'#c77940',1.5);oval(c,63,-36,2,1.2,'#b6774a');
    if(sleeping)line(c,[[31,-41],[36,-38],[42,-41]],'#51433e',2.5);
    else{oval(c,36,-43,5.5,7,'#463f44');oval(c,34,-46,2,2.4,'#fff');oval(c,38,-41,1,1,'#c6e5ef');}
    oval(c,39,-26,9,5,'#efad8a70');c.restore();
  }
  function egg(c) {
    c.save();oval(c,0,56,40,10,'#aa82752b');
    c.fillStyle=gradient(c,-30,-33,95,['#fffef0','#ffecc0','#e9c59c']);c.beginPath();c.moveTo(0,-34);c.bezierCurveTo(30,-34,51,23,35,48);c.bezierCurveTo(23,69,-23,69,-35,48);c.bezierCurveTo(-51,23,-30,-34,0,-34);c.fill();
    for(let i=0;i<25;i++){const x=Math.sin(i*8.1)*26,y=-14+(i*19)%65;oval(c,x,y,1.5+i%2,1.2,'#d2af8766',i);}
    oval(c,-14,-5,8,21,'#ffffff7a',.35);c.restore();
  }
  function feet(c) {
    c.save();for(const x of [-12,12]){
      panel(c,x-3,46,7,23,'#ffc878','#e9a461',3);
      c.fillStyle=gradient(c,0,66,14,['#ffd38a','#e9a064']);c.beginPath();c.moveTo(x-4,66);c.quadraticCurveTo(x-14,73,x-10,76);c.quadraticCurveTo(x-4,79,x,76);c.quadraticCurveTo(x+9,80,x+12,75);c.quadraticCurveTo(x+10,68,x+3,66);c.fill();
    }c.restore();
  }
  function plot(c,p) {
    c.save();oval(c,p.x,p.y+12,p.radius+4,p.radius*.55,'#4e796333');oval(c,p.x,p.y,p.radius,p.radius*.65,gradient(c,0,p.y-25,55,['#bc8c62','#835b49']));
    for(let i=0;i<13;i++)oval(c,p.x+Math.sin(i*8)*p.radius*.75,p.y+Math.cos(i*7)*p.radius*.4,2.5,1.5,'#e1b78a88');
    if(p.stage>0){const size=p.stage===1?.5:1;c.save();c.translate(p.x,p.y);c.scale(size,size);line(c,[[0,5],[0,-28]],'#5e945d',4);for(let i=0;i<4;i++)oval(c,i%2?9:-9,-10-i*7,13,6,i%2?'#a9d989':'#7cb877',i%2?-.6:.6);c.restore();}
    if(p.stage===3){c.fillStyle=gradient(c,0,p.y-5,30,['#ffd38e','#eb9755']);c.beginPath();c.moveTo(p.x-9,p.y-5);c.lineTo(p.x+9,p.y-5);c.quadraticCurveTo(p.x+5,p.y+17,p.x-3,p.y+26);c.closePath();c.fill();}c.restore();
  }
  function bubble(c,x,y,r) { c.save();oval(c,x,y,r,r,gradient(c,x,y-r,r*2,['#ffffffa0','#9cdaef45','#b5b7ed80']));c.strokeStyle='#ffffffc0';c.lineWidth=1.5;c.stroke();oval(c,x-r*.3,y-r*.35,r*.25,r*.13,'#ffffffd0',-.6);c.restore(); }
  function furniture(c,o) {
    if(o.rug){oval(c,225,490,103,30,gradient(c,0,460,60,['#ffdbe1','#d397b6']));for(let i=0;i<3;i++){c.strokeStyle='#fff1dc88';c.lineWidth=1;c.beginPath();c.ellipse(225,490,91-i*9,23-i*3,0,0,tau);c.stroke();}}
    if(o.clock){oval(c,90,110,34,34,'#c6a8c2');oval(c,90,108,29,29,'#fffbef');for(let i=0;i<12;i++)oval(c,90+Math.sin(i*tau/12)*23,108-Math.cos(i*tau/12)*23,1.5,1.5,'#9b8199');line(c,[[90,89],[90,108],[103,114]],'#796778',3);}
    if(o.painting){panel(c,156,70,84,92,'#fff5ce','#d3b190',10);panel(c,166,80,64,70,'#b4def0','#e5f6f4',5);c.save();c.beginPath();c.roundRect(166,80,64,70,5);c.clip();oval(c,185,100,8,8,'#fff2b4');oval(c,196,149,30,23,'#99c4ad');c.restore();}
    if(o.table){panel(c,69,423,12,49,'#d4ad81','#a57e62',4);panel(c,128,423,12,49,'#d4ad81','#a57e62',4);panel(c,53,404,99,21,'#f4d7ae','#bd936e',9);line(c,[[64,413],[141,413]],'#fff0ce80',1);}
    if(o.chair||o.sofa){const x=o.sofa?242:334,w=o.sofa?112:78;panel(c,x,380,w,75,'#d5d4f0','#a49dca',20);panel(c,x-6,421,w+12,35,'#e7dff5','#ada1cd',15);panel(c,x+8,401,w-16,34,'#e8e0f8','#c4b4db',12);for(let i=0;i<3;i++)oval(c,x+18+i*(w-36)/2,415,2,2,'#a591bd');}
    if(o.drawer){panel(c,142,363,61,81,'#f3d4ad','#bb9275',9);for(let i=0;i<3;i++){panel(c,148,370+i*23,49,19,'#efd3b6','#c8a385',5);oval(c,172,380+i*23,3,2,'#fff2bb');}}
    if(o.plant){panel(c,350,313,37,37,'#ffd6bf','#d29c8c',9);for(let i=0;i<5;i++)oval(c,368+Math.sin(i*2)*15,293+i*3,8,20,i%2?'#a0d6a7':'#77b597',i*.7);panel(c,347,310,43,9,'#ffe3c8','#dca58e',4);}
    if(o.bookshelf){panel(c,303,245,61,120,'#ecd1b0','#b58b71',8);for(let row=0;row<3;row++){panel(c,309,252+row*35,49,28,'#ba957d','#c9a58d',3);for(let i=0;i<5;i++)panel(c,313+i*8,257+row*35,6,20,['#d9b9e2','#9bc9ce','#efb4b8','#dcd597','#adc0dd'][i],'#b4a0b4',2);}}
    if(o.lamp){line(c,[[38,324],[38,410]],'#ac8d91',5);oval(c,38,409,17,5,'#b69aa8');panel(c,16,297,45,37,'#fff6c7','#eac59f',14);}
  }
  return {gradient,fabric,oval,panel,cloud,scene,body,head,egg,feet,plot,bubble,furniture};
})();
