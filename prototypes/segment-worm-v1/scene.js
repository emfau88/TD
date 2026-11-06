const $=id=>document.getElementById(id),canvas=$('route'),ctx=canvas.getContext('2d'),comparison=$('comparison'),cctx=comparison.getContext('2d');
const names=['obsidian-parts','grass','road','tree','Leafbug','Scorpion'],images={};
await Promise.all(names.map(name=>new Promise((resolve,reject)=>{const image=new Image();image.onload=()=>{images[name]=image;resolve();};image.onerror=()=>reject(Error('Grafik fehlt: '+name));image.src='assets/'+name+'.png';})));
const SCALE=.83,SEGMENTS=30,SPACING=13.5,HEAD_SPACING=12.5;
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
let paused=reduced.matches,zoom=1,hp=100,age=0,cycle=0,distance=0,previous=performance.now(),lastPaint=0,width=0,height=0,route=[],length=0,particles=[],frame=0;
const background=document.createElement('canvas'),bctx=background.getContext('2d');
const parts=images['obsidian-parts'];
const clamp=(v,a,b)=>Math.min(b,Math.max(a,v)),countFor=health=>health<=0?0:Math.ceil(SEGMENTS*health/100);

function makeRoute(w,h){
 const left=48,right=w-48,top=70,bottom=h-37,middle=(top+bottom)/2;
 const vertices=w<620?[[left,top],[right,top],[right,bottom],[left,bottom]]:
  [[left,top],[right,top],[right,bottom],[w*.59,bottom],[w*.59,middle],[w*.36,middle],[w*.36,bottom],[left,bottom]];
 const raw=[],radius=Math.min(24,(bottom-top)/5);
 for(let i=0;i<vertices.length;i++){
  const a=vertices[(i+vertices.length-1)%vertices.length],b=vertices[i],c=vertices[(i+1)%vertices.length];
  const ab=Math.hypot(b[0]-a[0],b[1]-a[1]),bc=Math.hypot(c[0]-b[0],c[1]-b[1]),r=Math.min(radius,ab*.3,bc*.3);
  const enter=[b[0]+(a[0]-b[0])*r/ab,b[1]+(a[1]-b[1])*r/ab],leave=[b[0]+(c[0]-b[0])*r/bc,b[1]+(c[1]-b[1])*r/bc];
  raw.push(enter);
  for(let step=1;step<=16;step++){const t=step/16,u=1-t;raw.push([u*u*enter[0]+2*u*t*b[0]+t*t*leave[0],u*u*enter[1]+2*u*t*b[1]+t*t*leave[1]]);}
 }
 raw.push(raw[0]);let total=0;
 route=raw.map((p,i)=>{if(i)total+=Math.hypot(p[0]-raw[i-1][0],p[1]-raw[i-1][1]);return{x:p[0],y:p[1],s:total};});length=total;
}
function sample(s){
 s=((s%length)+length)%length;
 let low=0,high=route.length-1;
 while(high-low>1){const mid=(low+high)>>1;if(route[mid].s<s)low=mid;else high=mid;}
 const a=route[low],b=route[high],t=(s-a.s)/(b.s-a.s||1);
 return{x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t,angle:Math.atan2(b.y-a.y,b.x-a.x)};
}
function at(index){
 const p=sample(distance-(index===0?0:HEAD_SPACING+(index-1)*SPACING));
 const sway=index?Math.sin(age*5.5-index*.58)*.55:0;
 p.x-=Math.sin(p.angle)*sway;p.y+=Math.cos(p.angle)*sway;return p;
}
function heading(angle){
 const q=((Math.round(angle/(Math.PI/2))%4)+4)%4;
 const basis=q===3?-Math.PI/2:q*Math.PI/2;
 let delta=angle-basis;while(delta>Math.PI)delta-=Math.PI*2;while(delta< -Math.PI)delta+=Math.PI*2;
 return{row:q===1?1:q===3?2:0,flip:q===2,rotation:delta};
}
function part(context,column,p,phase=0,scale=SCALE,alpha=1){
 const dir=heading(p.angle),col=column==='body'?1+phase:column==='head'?0:3;
 const pivot=dir.row===0?(col===0?[17,17]:col===1?[17,17]:col===2?[16,17]:[15,18]):col===0?[17,16]:col===3?[16,16]:[17,15];
 context.save();context.globalAlpha=alpha;context.translate(p.x,p.y);context.rotate(dir.rotation);context.scale(dir.flip?-scale:scale,scale);
 context.drawImage(parts,col*32,dir.row*32,32,32,-pivot[0],-pivot[1],32,32);context.restore();
}
function shadow(context,p,size=8,alpha=.23){context.fillStyle='rgba(22,27,31,'+alpha+')';context.beginPath();context.ellipse(p.x,p.y+7,size,3.1,0,0,Math.PI*2);context.fill();}
function original(context,name,p,animate=true){
 const dir=heading(p.angle),row=dir.row===1?3:dir.row===2?4:5;
 const f=row*8+(animate?Math.floor(age*10)%8:0),flip=name==='Scorpion'?!dir.flip:dir.flip;
 shadow(context,p,11.5);context.save();context.translate(Math.round(p.x),Math.round(p.y));context.scale(flip?-SCALE:SCALE,SCALE);
 context.drawImage(images[name],f%8*64,Math.floor(f/8)*64,64,64,-32,-32,64,64);context.restore();
}
function paintBackground(){
 background.width=width;background.height=height;bctx.imageSmoothingEnabled=false;
 for(let y=0;y<height;y+=40)for(let x=0;x<width;x+=40)bctx.drawImage(images.grass,x,y,40,40);
 bctx.beginPath();route.forEach((p,i)=>i?bctx.lineTo(p.x,p.y):bctx.moveTo(p.x,p.y));bctx.closePath();
 bctx.strokeStyle='#ad685d';bctx.lineWidth=43;bctx.lineJoin='round';bctx.stroke();
 const sand=document.createElement('canvas');sand.width=sand.height=40;const sandctx=sand.getContext('2d');sandctx.imageSmoothingEnabled=false;sandctx.drawImage(images.road,0,12,64,40,0,0,40,40);
 bctx.strokeStyle=bctx.createPattern(sand,'repeat');bctx.lineWidth=38;bctx.stroke();
 // Sparse original trees remain outside the route.
 for(const [x,y]of [[14,22],[width-27,25],[width*.43,30],[width*.47,height-8]]){
  bctx.drawImage(images.tree,x-20,y-35,40,41);
 }
}
function resize(){
 const fraction=length?distance/length:.63;width=Math.round(canvas.clientWidth);height=Math.round(canvas.clientHeight);
 const dpr=Math.min(devicePixelRatio||1,2);canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);ctx.imageSmoothingEnabled=false;
 makeRoute(width,height);distance=fraction*length;particles=[];paintBackground();paintComparison();paint();
}
function worm(){
 const n=countFor(hp);if(!hp)return;
 const nodes=[{type:'head',p:at(0),index:0}];
 for(let i=1;i<=n;i++)nodes.push({type:'body',p:at(i),index:i});
 nodes.push({type:'tail',p:at(n+1),index:n+1});
 for(const node of nodes)shadow(ctx,node.p,node.type==='head'?9:7.5);
 nodes.sort((a,b)=>a.p.y-b.p.y);
 for(const node of nodes)part(ctx,node.type,node.p,Math.floor(age*7-node.index*.45)&1);
 const head=at(0);ctx.fillStyle='#182029';ctx.fillRect(Math.round(head.x)-16,Math.round(head.y)-24,32,4);ctx.fillStyle=hp>35?'#e1af55':'#e57552';ctx.fillRect(Math.round(head.x)-15,Math.round(head.y)-23,30*hp/100,2);
}
function paint(){
 ctx.clearRect(0,0,width,height);
 ctx.save();
 if(zoom===2){const p=at(0);ctx.translate(width/2-p.x*2,height/2-p.y*2);ctx.scale(2,2);}
 ctx.drawImage(background,0,0);original(ctx,'Leafbug',sample(distance+115));original(ctx,'Scorpion',sample(distance-540));
 worm();
 for(const p of particles){const a=age-p.born,offset=16*a;part(ctx,p.type,{x:p.x+Math.sin(p.angle)*p.side*offset,y:p.y+Math.cos(p.angle)*p.side*offset+18*a*a,angle:p.angle},p.phase,SCALE*(1-a*.18),Math.max(0,1-a/.7));}
 ctx.restore();frame++;
 canvas.dataset.segments=String(countFor(hp));canvas.dataset.hp=String(hp);canvas.dataset.frame=String(frame);
}
function paintComparison(){
 const w=comparison.clientWidth,h=comparison.clientHeight,dpr=Math.min(devicePixelRatio||1,2);comparison.width=w*dpr;comparison.height=h*dpr;cctx.setTransform(dpr,0,0,dpr,0,0);cctx.imageSmoothingEnabled=false;
 cctx.fillStyle='#141a25';cctx.fillRect(0,0,w,h);
 for(const [row,health]of [100,50,20].entries()){
  const y=35+row*59,n=countFor(health),headX=530;
  cctx.fillStyle='#b8aabb';cctx.font='11px Segoe UI';cctx.textAlign='left';cctx.fillText(health+' %',12,y-3);cctx.fillStyle='#7f758d';cctx.fillText(n+' Teile',12,y+13);
  const pts=[{type:'head',p:{x:headX,y,angle:0}}];
  for(let i=1;i<=n;i++)pts.push({type:'body',p:{x:headX-HEAD_SPACING-(i-1)*SPACING,y,angle:0}});
  pts.push({type:'tail',p:{x:headX-HEAD_SPACING-n*SPACING,y,angle:0}});
  for(const point of pts.reverse()){shadow(cctx,point.p);part(cctx,point.type,point.p,0);}
 }
 original(cctx,'Leafbug',{x:w-125,y:33,angle:0},false);original(cctx,'Scorpion',{x:w-125,y:97,angle:0},false);
 cctx.textAlign='center';cctx.fillStyle='#a79aaf';cctx.font='11px Segoe UI';cctx.fillText('Blattkäfer',w-125,61);cctx.fillText('Skorpion',w-125,128);
 cctx.fillStyle='#776e83';cctx.font='10px Segoe UI';cctx.fillText('Originalmaßstab',w-125,165);
}
function health(value){
 const next=clamp(Math.round(value),0,100),before=countFor(hp),after=countFor(next);
 if(next<hp){
  for(let i=after+1;i<=before;i++)particles.push({...at(i),type:'body',born:age,side:i%2?-1:1,phase:i&1});
  if(next===0)particles.push({...at(0),type:'head',born:age,side:1,phase:0});
 }
 hp=next;$('health').value=String(hp);$('health-value').textContent=hp+' %';status();paint();
}
function status(){
 $('state').textContent=countFor(hp)+' Körpersegmente · '+(zoom===1?'Spielmaßstab':'2× Detailansicht');
 $('pause').textContent=paused?'Weiter':'Pause';$('pause').setAttribute('aria-pressed',String(paused));
 $('zoom').textContent=zoom===1?'2× ansehen':'Spielgröße';$('zoom').setAttribute('aria-pressed',String(zoom===2));
}
$('health').addEventListener('input',e=>{ $('auto').checked=false;health(Number(e.target.value));});
$('hit').addEventListener('click',()=>{$('auto').checked=false;health(hp-10);});
$('reset').addEventListener('click',()=>{particles=[];cycle=0;health(100);});
$('pause').addEventListener('click',()=>{paused=!paused;previous=performance.now();status();});
$('zoom').addEventListener('click',()=>{zoom=zoom===1?2:1;status();paint();});
$('auto').addEventListener('change',()=>{cycle=0;health(100);});
reduced.addEventListener('change',()=>{paused=reduced.matches;status();});
new ResizeObserver(resize).observe(canvas);
function tick(now){
 const dt=Math.max(0,Math.min((now-previous)/1000,.05));previous=now;
 if(!paused&&!document.hidden){age+=dt;distance+=dt*48;particles=particles.filter(p=>age-p.born<.7);
  if($('auto').checked){cycle=(cycle+dt)%34;const value=cycle<5?100:cycle<30?100-(cycle-5)*4:0;if(Math.round(value)!==hp)health(value);}
  if(now-lastPaint>33){paint();lastPaint=now;}
 }
 requestAnimationFrame(tick);
}
// Read-only diagnostics for this isolated visual study; no game state access.
window.wormStudy={getState:()=>({hp,segments:countFor(hp),age,distance,length,paused,zoom,scale:SCALE,spacing:SPACING,headSpacing:HEAD_SPACING,sourcePixels:128*96,centres:Array.from({length:countFor(hp)+2},(_,i)=>at(i))})};
status();resize();requestAnimationFrame(tick);
