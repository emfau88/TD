import {initShooting} from './shooting.js?v=3';
// Isolated visual study. No game imports, gameplay, or save access.
const levels=[1,2,3,5,10,15,20,25];
const names=['Waldwächter','Ausgebaut','Veteran','Verstärkt','Stahlwächter','Elite','Meister','Großmeister'];
const descriptions=[
 'Erste Originalgrafik mit kürzerem Unterbau. Die einzelne Armbrust bleibt unverändert.',
 'Zweite Originalgrafik, jetzt bei Level 2. Verkürzter Unterbau, unverändertes Geschütz.',
 'Dritte Originalgrafik, jetzt bei Level 3. Begrenzter Höhenrahmen wie bei den weiteren kompakten Stufen.',
 'Neue Zwischenstufe: starke Eichenstreben und Eisenbeschläge, noch ohne schwere Vollstahlkonstruktion.',
 'Stählerne Träger und schwere dreifache Armbrust. Kurze Holzfront statt zusätzlicher Höhe.',
 'Kantige Doppelarme und goldene Verbindungspunkte. Waffen und Plattform bleiben gut erkennbar.',
 'V-Streben und fünf Pfeilführungen. Mächtigeres Geschütz im gleichen Gebäude-Größenrahmen.',
 'Neue Spitzenstufe: Kreuzverstrebung und zwei kompakte Bogeneinheiten. Sechs Pfeilspitzen, keine zusätzliche Etage.'
];
const $=id=>document.getElementById(id);
const sprites=new Map();
let manifest,terrain,selected=25;
function loadImage(url){
 return new Promise((resolve,reject)=>{
  const img=new Image();img.onload=()=>resolve(img);
  img.onerror=()=>reject(new Error('Grafik konnte nicht geladen werden: '+url));img.src=url;
 });
}
function drawPart(ctx,level,part,x,y,zoom,mode='compact'){
 const record=manifest.levels.find(r=>r.level===level);
 const sprite=sprites.get(level)[mode][part],s=manifest.scale*zoom;
 if(part==='base') ctx.drawImage(sprite,x-32*s,y+13*zoom-102.4*s,64*s,128*s);
 else ctx.drawImage(sprite,x-48*s,y+(mode==='compact'?record.weaponY:-23)*zoom-48*s,96*s,96*s);
}
function drawTower(ctx,level,x,y,zoom,mode='compact'){
 drawPart(ctx,level,'base',x,y,zoom,mode);
 drawPart(ctx,level,'weapon',x,y,zoom,mode);
}
function drawNative(canvas,level){
 const ctx=canvas.getContext('2d');
 ctx.clearRect(0,0,canvas.width,canvas.height);ctx.imageSmoothingEnabled=false;
 drawTower(ctx,level,48,112.4-13/manifest.scale,1/manifest.scale);
}
function cameraZoom(){
 const w=window.innerWidth,h=window.innerHeight;
 return w<=700&&h>w?Math.max(h/640,w/640):Math.min(w/1120,h/640);
}
function drawMap(){
 const canvas=$('map'),width=canvas.clientWidth,height=canvas.clientHeight;
 const dpr=Math.min(window.devicePixelRatio||1,2);
 canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);
 const ctx=canvas.getContext('2d');ctx.setTransform(dpr,0,0,dpr,0,0);ctx.imageSmoothingEnabled=false;
 const zoom=cameraZoom(),rows=Number($('rows').value),mode=$('height-mode').value;
 const camera={x:160,y:rows===3?215:195};
 const px=x=>width/2+(x-camera.x)*zoom,py=y=>height/2+(y-camera.y)*zoom;
 const left=Math.floor((camera.x-width/(2*zoom))/40),right=Math.ceil((camera.x+width/(2*zoom))/40);
 const top=Math.floor((camera.y-height/(2*zoom))/40),bottom=Math.ceil((camera.y+height/(2*zoom))/40);
 const roadRow=rows===3?8:7;
 for(let row=top;row<=bottom;row++)for(let col=left;col<=right;col++){
  const tile=row===roadRow?manifest.terrain.horizontalPath:manifest.terrain.grass;
  ctx.drawImage(terrain,...tile,px(col*40),py(row*40),40*zoom+.1,40*zoom+.1);
 }
 for(const [x,y]of [[20,140],[300,140],[20,340],[300,340]]){
  ctx.drawImage(terrain,...manifest.terrain.tree,px(x)-24.8*zoom,py(y)-41*zoom,49.6*zoom,51.2*zoom);
 }
 const order=[1,2,3,5,10,15,20,25,1,10,20,25];
 const towers=order.slice(0,rows*4).map((level,i)=>({level,x:100+(i%4)*40,y:180+Math.floor(i/4)*40}));
 // Same depth policy as battle-scene: all bases at y+1000, weapons at y+1001.
 const parts=towers.flatMap(t=>[{...t,part:'base',depth:t.y+1000},{...t,part:'weapon',depth:t.y+1001}]);
 parts.sort((a,b)=>a.depth-b.depth);
 for(const t of parts) drawPart(ctx,t.level,t.part,px(t.x),py(t.y),zoom,mode);
 if($('labels').checked)for(const t of towers){
  const x=px(t.x),y=py(t.y+1);
  ctx.fillStyle='rgba(15,29,23,.9)';ctx.fillRect(x-12,y-8,24,17);
  ctx.fillStyle='#ffe1a2';ctx.font='13px "Spire Clear Digits",Pixelify,sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(String(t.level),x,y+1);
 }
 canvas.dataset.zoom=zoom.toFixed(6);canvas.dataset.mode=mode;canvas.dataset.rows=String(rows);
 canvas.dataset.towers=String(towers.length);canvas.dataset.spacingWorld='40';
 $('scale-note').textContent=window.innerWidth+' × '+window.innerHeight+' px · Spielmaßstab '+zoom.toFixed(2)+'× · Reihenabstand '+(40*zoom).toFixed(1)+' px';
 $('height-note').textContent=mode==='compact'?'Kompakt: Türme höchstens 58 Kartenpixel hoch.':'Bisheriges Format: Basen bis zu 73 Kartenpixel hoch.';
 $('row-note').textContent=rows===3?'Drei direkt benachbarte Reihen; vier Stufen in der vorderen Reihe wiederholt.':'Alle acht Stufen in zwei direkt benachbarten Reihen.';
}
function showDetail(level){
 selected=level;const i=levels.indexOf(level),record=manifest.levels.find(r=>r.level===level);
 $('detail-name').textContent=names[i]+' · Level '+level;
 $('detail-description').textContent=descriptions[i];drawNative($('detail'),level);
 for(const part of ['base','weapon']){
  $(part+'-part').src='./'+record[part];$('download-'+part).href='./'+record[part];
 }
 document.querySelectorAll('[data-level]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.level)===level)));
}
function setDetailZoom(){
 const factor=Number($('detail-zoom').value);$('detail').style.width=96*factor+'px';$('detail').style.height=140*factor+'px';
}
async function init(){
 const response=await fetch('./manifest.json?v=3');if(!response.ok)throw new Error('Grafikmanifest konnte nicht geladen werden.');
 manifest=await response.json();
 await Promise.all(manifest.levels.map(async r=>{
  const [base,weapon,referenceBase,referenceWeapon]=await Promise.all([r.base,r.weapon,r.referenceBase,r.referenceWeapon].map(p=>loadImage('./'+p)));
  sprites.set(r.level,{compact:{base,weapon},reference:{base:referenceBase,weapon:referenceWeapon}});
 }));
 terrain=await loadImage('./assets/terrain.png');await Promise.all([document.fonts.load('14px Pixelify'),document.fonts.load('14px "Spire Clear Digits"','258')]);
 levels.forEach((level,i)=>{
  const card=document.createElement('article');card.className='tower-card';
  const canvas=document.createElement('canvas');canvas.width=96;canvas.height=140;canvas.setAttribute('aria-label','Waldwächter Level '+level);
  const title=document.createElement('strong');title.textContent='Level '+level;
  const description=document.createElement('span');description.textContent=names[i];
  card.append(canvas,title,description);$('comparison').append(card);drawNative(canvas,level);
  const button=document.createElement('button');button.type='button';button.textContent='Lv. '+level;button.dataset.level=String(level);
  button.addEventListener('click',()=>showDetail(level));$('levels').append(button);
 });
 for(const id of ['labels','rows','height-mode'])$(id).addEventListener('change',drawMap);
 $('detail-zoom').addEventListener('change',setDetailZoom);
 new ResizeObserver(drawMap).observe($('map'));window.addEventListener('resize',drawMap);
 setDetailZoom();showDetail(selected);drawMap();await initShooting({manifest,terrain,sprites,drawPart,cameraZoom,loadImage});document.body.dataset.ready='true';document.body.dataset.revision='3';
}
init().catch(error=>{$('scale-note').textContent=error.message+' Bitte Seite neu laden.';$('scale-note').setAttribute('role','alert');console.error(error);});

