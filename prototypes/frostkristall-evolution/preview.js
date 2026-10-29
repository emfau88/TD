import {LEVELS,CYCLE,sample,crystalFrame,trajectory,tick,DISTANCE,FIRE} from './study-model.js?v=2';
import {attackPose} from './attack-motion.js?v=2';
const $=id=>document.getElementById(id),images=new Map(),warden=new Map();
const names=['Frostkristall','Eiskern','Frostprisma','Eisfassung','Froststahl','Eiswächter','Polarstern','Winterkrone'];
const descriptions=['Erster Originalkristall, kompakter Sockel.','Zweite Originalbauform in einer separaten eisblauen Farbvariante.','Dritte Originalbauform mit langem Prisma, jetzt ebenfalls eisblau.','Verstärkte Fassung mit breiterem Eiskristall.','Stahlstreben und geteilte Kristallfacette.','Gebogene Silberfassung und seitliche Eisfacetten.','V-Streben und vier markante Seitenfacetten.','Kreuzfassung, Goldklammern und breiter Eiskern.'];
let manifest,wardenManifest,terrain,castFx,selected=25,shotLevel=25,clock={time:0,last:null},playing=false,raf=0;
const visibleViews=new Set();
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
function loadImage(url){return new Promise((resolve,reject)=>{const i=new Image();i.onload=()=>resolve(i);i.onerror=()=>reject(new Error('Grafik fehlt: '+url));i.src=url;});}
function cameraZoom(){const w=innerWidth,h=innerHeight;return w<=700&&h>w?Math.max(h/640,w/640):Math.min(w/1120,h/640);}
function setup(canvas){const w=canvas.clientWidth,h=canvas.clientHeight,d=Math.min(devicePixelRatio||1,2);if(canvas.width!==Math.round(w*d)||canvas.height!==Math.round(h*d)){canvas.width=Math.round(w*d);canvas.height=Math.round(h*d);}const c=canvas.getContext('2d');c.setTransform(d,0,0,d,0,0);c.imageSmoothingEnabled=false;return {c,w,h};}
function iceMask(image){
 const out=document.createElement('canvas');out.width=image.width;out.height=image.height;
 const c=out.getContext('2d');c.drawImage(image,0,0);const pixels=c.getImageData(0,0,out.width,out.height);
 for(let i=0;i<pixels.data.length;i+=4){const a=pixels.data[i+3],r=pixels.data[i],g=pixels.data[i+1],b=pixels.data[i+2];
  pixels.data[i]=230;pixels.data[i+1]=252;pixels.data[i+2]=255;pixels.data[i+3]=a&&b>r+20&&g>r+12&&g>90?a:0;
 }
 c.putImageData(pixels,0,0);return out;
}
function drawFacets(c,img,x,y,s,spread){
 // Side facets separate by at most two native pixels, with the centre anchored.
 for(const [left,width,offset] of [[0,24,-spread],[24,16,0],[40,24,spread]])
  c.drawImage(img,left,0,width,64,x+(left-32+offset)*s,y-32*s,width*s,64*s);
}
function drawPart(c,level,part,x,y,z,kind='frost',time=null){
 const s=.63*z;
 if(kind==='warden'){
  const r=wardenManifest.levels.find(r=>r.level===level),img=warden.get(level)[part==='base'?'base':'weapon'];
  if(part==='base')c.drawImage(img,x-32*s,y+13*z-102.4*s,64*s,128*s);
  else c.drawImage(img,x-48*s,y+r.weaponY*z-48*s,96*s,96*s);return;
 }
 const r=manifest.levels.find(r=>r.level===level),im=images.get(level),pose=attackPose(level,time??0);
 if(part==='base'){
  c.drawImage(im.base,x-32*s,y+13*z-166.4*s,64*s,192*s);
  if(pose.baseLight){c.save();c.globalAlpha=pose.baseLight;c.drawImage(im.baseMask,x-32*s,y+13*z-166.4*s,64*s,192*s);c.restore();}
 }else if(time!==null&&r.originalStage&&!r.paletteCorrected){
  const n=r.attackSize,frame=crystalFrame(r,time);
  c.drawImage(im.attack,(frame%r.attackCols)*n,Math.floor(frame/r.attackCols)*n,n,n,x-n/2*s,y+r.crystalY*z-n/2*s,n*s,n*s);
 }else{
  if(pose.fxFrame>=0){const f=pose.fxFrame,n=pose.fxSize*s;c.save();c.globalAlpha=pose.fxOpacity;
   c.drawImage(castFx,f%4*64,Math.floor(f/4)*64,64,64,x-n/2,y+r.crystalY*z-n/2,n,n);c.restore();}
  const cy=y+r.crystalY*z+pose.y*s;
  drawFacets(c,im.crystal,x,cy,s,pose.spread);
  if(pose.light){c.save();c.globalAlpha=pose.light;drawFacets(c,im.crystalMask,x,cy,s,pose.spread);c.restore();}
 }
}
function drawNative(canvas,level,time=null){
 const c=canvas.getContext('2d');c.clearRect(0,0,canvas.width,canvas.height);c.imageSmoothingEnabled=false;
 const y=166.4-13/.63-64;
 drawPart(c,level,'base',48,y,1/.63,'frost',time);drawPart(c,level,'crystal',48,y,1/.63,'frost',time);
}
function terrainFill(c,w,h,z,ox,oy){
 for(let y=Math.floor(-oy/z/40)*40;y<(h-oy)/z;y+=40)for(let x=Math.floor(-ox/z/40)*40;x<(w-ox)/z;x+=40)c.drawImage(terrain,...manifest.terrain.grass,ox+x*z,oy+y*z,40*z+.1,40*z+.1);
}
function drawMap(){
 const {c,w,h}=setup($('map')),z=cameraZoom(),rows=Number($('rows').value),mixed=$('neighbor').value==='warden';
 const oy=h/2-(rows===3?215:195)*z,ox=w/2-160*z;terrainFill(c,w,h,z,ox,oy);
 const order=[...LEVELS,1,10,20,25],towers=order.slice(0,rows*4).map((level,i)=>({level,x:100+i%4*40,y:180+Math.floor(i/4)*40,kind:i>=8&&mixed?'warden':'frost'}));
 const parts=towers.flatMap(t=>[{...t,part:'base',depth:t.y+1000},{...t,part:'crystal',depth:t.y+1001}]).sort((a,b)=>a.depth-b.depth);
 for(const t of parts)drawPart(c,t.level,t.part,ox+t.x*z,oy+t.y*z,z,t.kind,clock.time);
 if($('labels').checked)for(const t of towers){const x=ox+t.x*z,y=oy+(t.y+7)*z;c.fillStyle='#152a25eb';c.fillRect(x-12,y-8,24,17);c.fillStyle='#ffe1a2';c.font='13px "Spire Clear Digits",Pixelify,sans-serif';c.textAlign='center';c.textBaseline='middle';c.fillText(String(t.level),x,y+1);}
 $('scale-note').textContent=innerWidth+' × '+innerHeight+' px · Spielmaßstab '+z.toFixed(2)+'× · Feldabstand '+(40*z).toFixed(1)+' px';
 $('row-note').textContent=rows===2?'Alle acht Froststufen in zwei benachbarten Reihen.':mixed?'Acht Froststufen; davor vier kompakte Waldwächter als Verdeckungsprobe.':'Acht Froststufen; vier Stufen in der Vorderreihe wiederholt.';
 $('map').dataset.zoom=z.toFixed(6);$('map').dataset.rows=String(rows);$('map').dataset.mixed=String(mixed);
}
function detail(level){
 selected=level;const r=manifest.levels.find(r=>r.level===level),i=LEVELS.indexOf(level);
 $('detail-name').textContent=names[i]+' · Level '+level;$('detail-description').textContent=descriptions[i];
 drawNative($('detail'),level,clock.time);detailPhase();
 for(const part of ['base','crystal']){$(part+'-part').src='./'+r[part];$('download-'+part).href='./'+r[part];}
 document.querySelectorAll('#levels [data-level]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.level)===level)));
}
function detailPhase(){$('detail-phase').textContent=attackPose(selected,clock.time).phase+' · '+clock.time.toFixed(2)+' s';}
function detailZoom(){const n=Number($('detail-zoom').value);$('detail').style.width=96*n+'px';$('detail').style.height=140*n+'px';}
function active(){return playing&&visibleViews.size>0&&!document.hidden;}
function schedule(){if(active()&&!raf)raf=requestAnimationFrame(frame);}
function play(value){playing=value;clock.last=null;document.querySelectorAll('[data-play-toggle]').forEach(b=>{b.textContent=value?'Pause':'Abspielen';b.setAttribute('aria-pressed',String(value));});if(!value)renderViews();schedule();}
function drawComparison(){document.querySelectorAll('.tower-card canvas').forEach((cv,i)=>drawNative(cv,LEVELS[i],clock.time));}
function renderViews(){drawShot();drawMap();drawComparison();drawNative($('detail'),selected,clock.time);detailPhase();}
function frame(now){
 raf=0;clock=tick(clock,now,active(),Number($('shot-speed').value));
 if(visibleViews.has('shot'))drawShot();if(visibleViews.has('map'))drawMap();
 if(visibleViews.has('comparison'))drawComparison();if(visibleViews.has('detail'))drawNative($('detail'),selected,clock.time);detailPhase();
 schedule();
}
function shotSelect(level){shotLevel=level;clock={time:0,last:null};document.querySelectorAll('[data-shot-level]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.shotLevel)===level)));$('shot-pattern').textContent='Level '+level+' · Ein Frostgeschoss pro Zyklus';renderViews();}
function seek(t){play(false);clock={time:t,last:null};renderViews();}
function drawShot(){
 const {c,w,h}=setup($('shot'));if(!w)return;
 const r=manifest.levels.find(r=>r.level===shotLevel),im=images.get(shotLevel),z=cameraZoom(),g=trajectory(r.crystalY+attackPose(shotLevel,FIRE).y*.63,Number($('shot-direction').value)),st=sample(clock.time);
 const ox=w/2-(Math.min(-32,g.end.x-24)+Math.max(32,g.end.x+24))/2*z,oy=h/2-(Math.min(-58,g.end.y-24)+Math.max(30,g.end.y+24))/2*z;
 terrainFill(c,w,h,z,ox,oy);
 const px=x=>ox+x*z,py=y=>oy+y*z;
 c.strokeStyle='#e1eec9';c.lineWidth=1.5;c.beginPath();c.arc(px(g.end.x),py(g.end.y),8*z,0,Math.PI*2);c.stroke();
 drawPart(c,shotLevel,'base',px(0),py(0),z,'frost',clock.time);drawPart(c,shotLevel,'crystal',px(0),py(0),z,'frost',clock.time);
 if(st.flight){
  const x=g.start.x+g.dx*DISTANCE*st.progress,y=g.start.y+g.dy*DISTANCE*st.progress,ps=.5*z;
  c.save();c.translate(px(x),py(y));c.rotate(g.angle);
  if(r.originalStage&&!r.paletteCorrected){const f=Math.floor(st.age*12)%5;c.drawImage(im.projectile,f*32,0,32,32,-16*ps,-16*ps,32*ps,32*ps);}
  else c.drawImage(im.projectile,-16*ps,-16*ps,32*ps,32*ps);
  c.restore();
 }
 if(st.impact){const fx=im.impact,frames=im.impactFrames,cols=fx.width/64,f=Math.min(frames-1,Math.floor(st.impactAge/.5*frames)),s=.8*z;c.drawImage(fx,(f%cols)*64,Math.floor(f/cols)*64,64,64,px(g.end.x)-32*s,py(g.end.y)-32*s,64*s,64*s);}
 const pose=attackPose(shotLevel,clock.time),phase=st.flight?'Flug':st.impact?'Treffer':shotLevel===1?(clock.time>=.12&&clock.time<FIRE?'Aufladen':'Ruhe'):pose.phase;
 $('shot-time').value=String(Math.round(clock.time*1000));$('shot-phase').textContent=phase+' · '+clock.time.toFixed(2)+' s';
 Object.assign($('shot').dataset,{level:String(shotLevel),time:clock.time.toFixed(4),phase,playing:String(playing),projectiles:st.flight?'1':'0',zoom:z.toFixed(6),corePhase:pose.phase,coreY:String(pose.y),fxFrame:String(pose.fxFrame)});
}
async function init(){
 const res=await fetch('./manifest.json?v=2');if(!res.ok)throw new Error('Grafikmanifest fehlt.');manifest=await res.json();
 const wr=await fetch('../waldwaechter-evolution/manifest.json?v=3');if(!wr.ok)throw new Error('Waldwächter-Referenz fehlt.');wardenManifest=await wr.json();
 await Promise.all(manifest.levels.map(async r=>{
  const stage=r.paletteCorrected?1:(r.originalStage??1),prefix='./assets/original/level-'+stage+'-';
  const paths=[r.base,r.crystal].map(p=>'./'+p).concat([r.originalStage&&!r.paletteCorrected?prefix+'projectile.png':'./'+r.projectile,prefix+'impact.png']);
  const [base,crystal,projectile,impact]=await Promise.all(paths.map(loadImage));
  const attack=r.originalStage&&!r.paletteCorrected?await loadImage(prefix+'attack.png'):null;
  images.set(r.level,{base,crystal,baseMask:iceMask(base),crystalMask:iceMask(crystal),projectile,impact,attack,impactFrames:[5,6,7][stage-1]});
 }));
 await Promise.all([1,10,20,25].map(async level=>{const r=wardenManifest.levels.find(r=>r.level===level),[base,weapon]=await Promise.all([r.base,r.weapon].map(p=>loadImage('../waldwaechter-evolution/'+p)));warden.set(level,{base,weapon});}));
 [terrain,castFx]=await Promise.all(['./assets/terrain.png','./assets/frost-cast-v2.png'].map(loadImage));await Promise.all([document.fonts.load('14px Pixelify'),document.fonts.load('14px "Spire Clear Digits"','258')]);
 LEVELS.forEach((level,i)=>{
  const card=document.createElement('article');card.className='tower-card';const cv=document.createElement('canvas');cv.width=96;cv.height=140;cv.setAttribute('aria-label','Frostkristall Level '+level);
  const title=document.createElement('strong');title.textContent='Level '+level;const span=document.createElement('span');span.textContent=names[i];card.append(cv,title,span);$('comparison').append(card);drawNative(cv,level);
  for(const shot of [false,true]){const b=document.createElement('button');b.type='button';b.textContent='Lv. '+level;if(shot)b.dataset.shotLevel=String(level);else b.dataset.level=String(level);b.addEventListener('click',()=>shot?shotSelect(level):detail(level));$(shot?'shot-levels':'levels').append(b);}
 });
 for(const id of ['rows','neighbor','labels'])$(id).addEventListener('change',drawMap);
 $('detail-zoom').addEventListener('change',detailZoom);
 document.querySelectorAll('[data-play-toggle]').forEach(b=>b.addEventListener('click',()=>play(!playing)));$('shot-restart').addEventListener('click',()=>{clock={time:0,last:null};play(true);renderViews();});
 $('shot-charge').addEventListener('click',()=>seek(.24));$('shot-release').addEventListener('click',()=>seek(FIRE));
 $('shot-flight').addEventListener('click',()=>seek(.4));$('shot-impact').addEventListener('click',()=>seek(.72));$('shot-time').max=String(CYCLE*1000);
 $('shot-time').addEventListener('input',e=>seek(Number(e.target.value)/1000));$('shot-direction').addEventListener('change',drawShot);$('shot-speed').addEventListener('change',()=>{clock.last=null;});
 new ResizeObserver(drawMap).observe($('map'));new ResizeObserver(drawShot).observe($('shot'));
 window.addEventListener('resize',()=>{drawMap();drawShot();});
 const observer=new IntersectionObserver(entries=>{for(const e of entries)e.isIntersecting?visibleViews.add(e.target.id):visibleViews.delete(e.target.id);clock.last=null;if(!playing)renderViews();schedule();});
 for(const id of ['shot','map','comparison','detail'])observer.observe($(id));
 document.addEventListener('visibilitychange',()=>{clock.last=null;schedule();});reduced.addEventListener('change',e=>{if(e.matches)play(false);});
 detailZoom();detail(selected);drawMap();shotSelect(25);play(!reduced.matches);document.body.dataset.ready='true';
}
init().catch(e=>{$('scale-note').textContent=e.message+' Bitte neu laden.';$('scale-note').setAttribute('role','alert');console.error(e);});
