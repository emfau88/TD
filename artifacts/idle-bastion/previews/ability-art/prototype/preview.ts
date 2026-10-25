// Local presentation prototype. No production import, no default save access.
import Phaser from 'phaser';
import { BattleScene } from '../../src/battle-scene';
import { IdleBattle } from '../../src/battle';
import { createFeatureProbe } from '../../src/feature-probes';
import { openBattleStore } from '../../src/save-store';
import { setLanguage } from '../../src/i18n';
import { maraFrame } from '../../src/art';
import { ILYRA } from '../../src/ilyra';
import { MARA } from '../../src/mara';
import earned from '../../../../artifacts/idle-bastion/acceptance/wave-rework-v2/earned-balanced-late.json?raw';
import './preview.css';

const files = import.meta.glob('../../../../artifacts/idle-bastion/previews/ability-art/assets/*.png', {eager:true,query:'?url',import:'default'}) as Record<string,string>;
const urls = Object.fromEntries(Object.entries(files).map(([path,url])=>[path.split('/').pop()!.replace('.png',''),url]));
const params = new URL(location.href);
const slot = `art-${crypto.randomUUID()}`;
params.searchParams.set('probe',slot); history.replaceState(null,'',params);
setLanguage('de');
const initial = createFeatureProbe('heroes',JSON.parse(earned));
const store = await openBattleStore(undefined,`spire-idle-bastion-probe-${slot}`);
await store.save(initial.snapshot(),false,0);store.close();

type Mode='ilyra-ready'|'ilyra-cooldown'|'mara-path'|'mara-cast'|'mara-buff'|'mara-impact'|'mara-ended'|'ilyra-flight'|'ilyra-impact'|'mara-animated'|'ilyra-animated'|'cooldown-animated';
const labels:Record<Mode,string>={
 'ilyra-ready':'Ilyra · Bereit & Auswahl', 'ilyra-cooldown':'Ilyra · Radialer Cooldown',
 'mara-path':'Mara · Auswahl & Laufziel', 'mara-cast':'Mara · Lichtimpuls', 'mara-buff':'Mara · Verstärkter Turm',
 'mara-impact':'Mara · Trefferfunken & Turmlicht', 'mara-ended':'Mara · Verstärkung beendet',
 'ilyra-flight':'Sternensalve · Flug', 'ilyra-impact':'Sternensalve · Einschlag',
 'mara-animated':'Mara · Animationsprobe', 'ilyra-animated':'Sternensalve · Animationsprobe',
 'cooldown-animated':'Cooldown · Animationsprobe',
};
let mode:Mode=(params.searchParams.get('mode') as Mode)||'ilyra-cooldown';
let started=performance.now(), scene:any, visual:IdleBattle, sprites:any[]=[];
const towerLight:any[]=[];
let towerLightUsed=0;
const el = (id:string)=>document.getElementById(id)!;
document.body.insertAdjacentHTML('beforeend',`<div id="art-label">SPIRE · GESTALTUNGSPROBE</div><section id="art-panel"><button id="spell-disc" aria-label="Zaubervorschau"><img id="spell-image" alt=""><span id="spell-shade"></span><span id="spell-number"></span></button><div class="art-copy"><div id="art-name"></div><div id="art-status"></div><span id="art-auto"></span></div></section><div id="art-modes"><select id="art-choice">${Object.entries(labels).map(([key,value])=>`<option value="${key}">${value}</option>`).join('')}</select></div>`);
if(params.searchParams.has('capture'))document.body.classList.add('capture');

function sprite(key:string,x:number,y:number,width:number,height:number,alpha=1,depth=900,rotation=0) {
 const s=scene.add.image(x,y,`art-${key}`).setDisplaySize(width,height).setAlpha(alpha).setDepth(depth).setRotation(rotation);
 sprites.push(s);return s;
}
function clearArt(){for(const s of sprites)s.destroy();sprites=[];for(const s of towerLight)s.setVisible(false);towerLightUsed=0;}
function fitCamera(){
 if(!scene)return;
 const cam=scene.cameras.main, density=scene.pixelDensity;
 const mobile=innerWidth<=700;
 cam.setZoom(density*(mobile?1.12:1.5));
 cam.centerOn(mobile?280:380,mobile?280:280);
}
function prepare(){
 if(!scene)return;
 visual=IdleBattle.restore(initial.snapshot())!;
 visual.mara.effectRemaining=0;visual.mara.effectTowerUid=null;visual.mara.autoCast=false;
 visual.ilyra!.volley=null;visual.ilyra!.autoCast=false;
 if(['mara-cast','mara-buff','mara-impact','mara-ended','mara-animated'].includes(mode)&&visual.moveMaraTo({x:8,y:8})){
  const at=visual.mara.path.at(-1)!;visual.mara.x=at.x;visual.mara.y=at.y;visual.mara.path=[];
 }
 if(mode==='mara-path'){
  for(const c of [{x:9,y:8},{x:8,y:9},{x:7,y:10}])if(visual.moveMaraTo(c))break;
 }
 scene.readBattle=()=>visual;
 started=performance.now();fitCamera();render();
}
function disc(hero:'mara'|'ilyra',remaining:number,status:string,auto=false){
 (el('spell-image') as HTMLImageElement).src=urls[`${hero}-spell`];
 const ready=remaining<=0;
 el('spell-disc').classList.toggle('ready',ready);
 el('spell-shade').style.setProperty('--reveal',`${(1-remaining/(hero==='mara'?30:28))*360}deg`);
 el('spell-number').textContent=ready?'':String(Math.ceil(remaining));
 el('art-name').textContent=hero==='mara'?'Über­takten':'Sternensalve';
 el('art-status').textContent=status;
 el('art-auto').textContent=auto?'AUTO EIN':'AUTO AUS';el('art-auto').classList.toggle('on',auto);
 el(`${hero}-brief`).textContent=remaining>0?`${Math.ceil(remaining)} s`:'Bereit';
 (el(`${hero}-cooldown`) as HTMLProgressElement).value=(hero==='mara'?30:28)-remaining;
}
function selection(hero:'mara'|'ilyra',time:number){
 const a=hero==='mara'?visual.mara:visual.ilyra!;
 // Same tight footprint as the original selection ellipse, with the generated ornament.
 const light=scene.add.graphics().setDepth(900);
 light.fillStyle(hero==='mara'?0xffd97a:0x9ce2ff,.21).fillEllipse(a.x,a.y+2,32,14);sprites.push(light);
 sprite(`${hero}-ring`,a.x,a.y+2,42,22,.32,900).setBlendMode(1);
 sprite(`${hero}-ring`,a.x,a.y+2,38,20,1,901);
 sprite(`${hero}-ring`,a.x,a.y+2,38,20,.64+.04*Math.sin(time*2),902).setBlendMode(1);
}
function starVolley(age:number,time:number){
 const a=visual.ilyra!, candidates=visual.enemies.filter(e=>Math.hypot(e.x-a.x,e.y-a.y)<205);
 const target=candidates.sort((l,r)=>r.x-l.x)[0]??{x:a.x+150,y:a.y+40};
 const x=target.x,y=target.y,radius=ILYRA.radius,logical=age/ILYRA.volleyPace;
 if(logical>=ILYRA.duration){a.volley=null;return;}
 const hit=logical>=ILYRA.impact;
 a.volley={x,y,originX:a.x,originY:a.y,age:logical,pace:ILYRA.volleyPace,hit,...visual.ilyraPower};
 const fade=hit?Math.max(0,1-(logical-ILYRA.impact)/(ILYRA.duration-ILYRA.impact)):1;
 // Game damage uses an actual circle in world coordinates, not a flattened ellipse.
 const field=scene.add.graphics().setDepth(900);sprites.push(field);
 field.fillStyle(0x99dfff,(hit?.16:.065)*fade).fillCircle(x,y,radius);
 field.lineStyle(5,0x8bdbff,.13*fade).strokeCircle(x,y,radius);
 field.lineStyle(1.5,0xbbeeff,.7*fade).strokeCircle(x,y,radius);
 for(let i=0;i<12;i++){
  const angle=i*Math.PI/6,px=x+Math.cos(angle)*radius,py=y+Math.sin(angle)*radius;
  sprite('star-impact',px,py,i%3===0?9:5,i%3===0?9:5,.76*fade,901,Math.PI/4);
 }
 const points=[{x,y},...Array.from({length:8},(_,i)=>({x:x+Math.cos(i*Math.PI/4)*radius*.72,y:y+Math.sin(i*Math.PI/4)*radius*.72}))];
 (window as any).artReview.effectSpec={ring:[38,20],radius,center:{x,y},points,impact:ILYRA.impact*ILYRA.volleyPace,maraBuff:MARA.duration};
 if(logical<ILYRA.windup){sprite('star-impact',a.x,a.y-24,18+logical*60,18+logical*60,.7,1003+a.y,logical);return;}
 if(!hit){
  for(const [i,dest] of points.entries()){
   // Slightly staggered departures, all nine arrive at the ONE model damage instant.
   const delay=(i%3)*.018,span=ILYRA.impact-ILYRA.windup-delay;
   const t=Math.max(0,Math.min(1,(logical-ILYRA.windup-delay)/span));
   const at=(f:number)=>({x:a.x+(dest.x-a.x)*f+Math.sin(Math.PI*f)*(i%2?7:-7),y:a.y-24+(dest.y-a.y+24)*f-Math.sin(Math.PI*f)*(24+(i%3)*7)});
   const p=at(t),prev=at(Math.max(0,t-.04)),angle=Math.atan2(p.y-prev.y,p.x-prev.x),pulse=1+.08*Math.sin(time*29+i*2);
   for(let j=2;j>=1;j--){const q=at(Math.max(0,t-j*.035));sprite('star-projectile',q.x,q.y,13-j*2,6,.15*(3-j),1003+q.y,angle);}
   sprite('star-projectile',p.x,p.y,(i===0?27:21)*pulse,10*pulse,.96,1003+p.y,angle);
  }
 }else{
  const f=(logical-ILYRA.impact)/(ILYRA.duration-ILYRA.impact);
  field.lineStyle(2,0xdff6ff,fade*.6).strokeCircle(x,y,Math.min(radius,12+f*radius*1.8));
  for(const [i,p]of points.entries()){
   sprite('star-impact',p.x,p.y-5,(i===0?30:18)+f*10,(i===0?30:18)+f*10,fade*.86,1003+p.y,f*.15);
   const angle=i*Math.PI/4;const reach=8+f*10;
   sprite('star-impact',p.x+Math.cos(angle)*reach,p.y+Math.sin(angle)*reach,5,5,fade*.6,1004+p.y,angle);
  }
  for(const e of visual.enemies.filter(e=>e.hp>0&&Math.hypot(e.x-x,e.y-y)<=radius)){
   sprite('star-impact',e.x,e.y-17,14+f*7,14+f*7,fade*.85,1005+e.y);
  }
 }
}
// Reuse silhouettes of the actual base/weapon, preserving their frame and transform.
// All layers belong to this presentation scene; original textures remain unchanged.
function towerGlow(view:any,fade:number,hit:number){
 const color=0xffcd69;
 function layer(source:any,dx:number,dy:number,alpha:number,depth:number,add=false){
  const index=towerLightUsed++;
  const copy=towerLight[index]??(towerLight[index]=scene.add.image(0,0,source.texture.key,source.frame.name));
  copy.setTexture(source.texture.key,source.frame.name).setOrigin(source.originX,source.originY)
   .setScale(source.scaleX,source.scaleY).setRotation(source.rotation).setFlip(source.flipX,source.flipY)
   .setPosition(source.x+dx,source.y+dy).setDepth(depth).setTint(color).setTintMode(Phaser.TintModes.FILL)
   .setBlendMode(add?1:0).setAlpha(alpha*fade).setVisible(true);
 }
 for(const source of [view.base,view.weapon]){
  for(let i=0;i<8;i++){
   const angle=i*Math.PI/4;
   layer(source,Math.cos(angle)*4.8,Math.sin(angle)*4.8,.026+hit*.012,source.depth-.2,true);
   layer(source,Math.cos(angle)*2.2,Math.sin(angle)*2.2,.07+hit*.025,source.depth-.1,true);
  }
  layer(source,0,0,.20+hit*.07,source.depth+.02);
  layer(source,0,0,.065+hit*.055,source.depth+.03,true);
 }
}
function maraEffect(age:number,time:number){
 const a=visual.mara, tower=visual.towers.find(t=>t.uid===a.targetTowerUid)??visual.towers[0];
 const start={x:a.x,y:a.y-22},end={x:tower.x,y:tower.y-28};
 const flight=.55,interval=1,phase=age%interval;
 // Repeated visual support pulses over the existing eight-second buff, no extra casts.
 if(age<MARA.duration&&phase<flight){
  scene.mara.setFrame(maraFrame('left',false,true,visual.elapsed));
  const t=phase/flight,at=(f:number)=>({x:start.x+(end.x-start.x)*f,y:start.y+(end.y-start.y)*f-Math.sin(Math.PI*f)*28});
  const p=at(t),prev=at(Math.max(0,t-.04)),angle=Math.atan2(p.y-prev.y,p.x-prev.x);
  sprite('mara-mote',start.x,start.y,14+Math.sin(t*Math.PI)*8,12,.55*(1-t),1003+a.y,-Math.PI/2);
  for(let j=3;j>=1;j--){const q=at(Math.max(0,t-j*.05));sprite('mara-mote',q.x,q.y,18-j*3,9-j,.12*(4-j),1003+q.y,angle);}
  sprite('mara-mote',p.x,p.y,28*(1+.06*Math.sin(time*30)),17,.96,1003+p.y,angle);
 }
 const arrival=phase-flight,hit=age<MARA.duration&&arrival>=0&&arrival<.28?1-arrival/.28:0;
 const fade=Math.max(0,Math.min(1,age/.18,(MARA.duration+.4-age)/.4));
 const views=scene.towerViews.get(tower.uid);
 if(fade>0&&views)towerGlow(views,fade,hit);
 (window as any).artReview.maraSpec={age,buffDuration:MARA.duration,fade,hit,glowParts:views&&fade>0?2:0,lightLayers:towerLightUsed};
 if(age<MARA.duration+.4){
  const t=age,pulse=.73+Math.sin(time*3)*.08;
  sprite('mara-ring',tower.x,tower.y+12,66,29,fade*pulse,900);
  for(let i=0;i<3;i++){const p=(t*.28+i/3)%1;
   sprite('mara-mote',tower.x+Math.sin(i*2.1+t)*15,tower.y+4-p*44,10,7,fade*Math.sin(p*Math.PI)*.42,1004+tower.y,-Math.PI/2);
  }
  if(age<MARA.duration&&arrival>=0&&arrival<.4){
   const f=arrival/.4;
   sprite('mara-ring',tower.x,tower.y+10,38+arrival*70,18+arrival*30,(1-f)*.65*fade,900);
   for(let i=0;i<5;i++){
    const angle=-Math.PI/2+(i-2)*.68,reach=5+f*(22+(i%2)*8);
    const px=end.x+Math.cos(angle)*reach,py=end.y+Math.sin(angle)*reach+f*f*11;
    sprite('mara-mote',px,py,(8-i%2*2)*(1-f*.4),4,(1-f)*.95,1005+tower.y,angle+f*.8);
   }
  }
 }
}
function render(){
 if(!scene||!visual||!scene.textures.exists('art-ilyra-ring'))return;
 clearArt();scene.selection.clear();scene.effects.clear();scene.buffText.setVisible(false);
 // Hide the live spell layers; this archived prototype supplies its own posed effects.
 scene.ilyraView.spell.sprites.begin();scene.ilyraView.spell.field.clear();
 scene.maraSpell.sprites.begin();scene.heroMarks.sprites.begin();scene.heroMarks.light.clear();
 const time=(performance.now()-started)/1000;
 el('art-label').textContent=`ENTWURF V3 · ${labels[mode]}`;
 const mara=mode.startsWith('mara');selection(mara?'mara':'ilyra',time);
 visual.ilyra!.volley=null;
 if(mode==='ilyra-ready')disc('ilyra',0,'Bereit · Ziel wählen');
 if(mode==='ilyra-cooldown')disc('ilyra',14,'Bereit in 14 s');
 if(mode==='cooldown-animated'){
  const left=Math.max(0,14-time%16);disc('ilyra',left,left>0?`Bereit in ${Math.ceil(left)} s`:'Bereit · Ziel wählen');
 }
 if(mode==='mara-path'){
  disc('mara',0,'Standort gewählt · freie Bewegung');
  let from={x:visual.mara.x,y:visual.mara.y};
  for(const p of visual.mara.path){
   const d=Math.hypot(p.x-from.x,p.y-from.y);
   for(let q=16;q<=d;q+=16){const t=q/d;sprite('mara-mote',from.x+(p.x-from.x)*t,from.y+(p.y-from.y)*t+2,6,4,.56,900);}
   from=p;
  }
  const p=visual.mara.path.at(-1);if(p)sprite('destination',p.x,p.y+2,27,18,.95,900);
 }
 if(['mara-cast','mara-buff','mara-impact','mara-ended','mara-animated'].includes(mode)){
  const age=mode==='mara-cast'?.27:mode==='mara-buff'?2.27:mode==='mara-impact'?2.67:mode==='mara-ended'?8.6:time%10;
  maraEffect(age,time);disc('mara',Math.max(0,MARA.cooldown-age),age<MARA.duration?`Lichtimpulse · Buff ${Math.ceil(MARA.duration-age)} s`:'Verstärkung beendet',true);
 }
 if(mode==='ilyra-flight'||mode==='ilyra-impact'||mode==='ilyra-animated'){
  const age=mode==='ilyra-flight'?.68:mode==='ilyra-impact'?.94:time%3.2;
  starVolley(age,time);disc('ilyra',Math.max(0,ILYRA.cooldown-age),age<ILYRA.impact*ILYRA.volleyPace?'Sternenfächer · Flächentreffer':age<ILYRA.duration*ILYRA.volleyPace?'Gesamte Fläche getroffen':'Lädt sich wieder auf');
 }
}

const proto=BattleScene.prototype as any;
const preload=proto.preload,create=proto.create,draw=proto.drawSelection;
proto.preload=function(){preload.call(this);for(const [name,url]of Object.entries(urls))this.load.image(`raw-${name}`,url);};
proto.create=function(){
 this.hooks.advance=()=>{};
 const changed=this.hooks.changed;this.hooks.changed=()=>{changed();if(this===scene)render();};
 create.call(this);scene=this;
 const metrics=[];
 for(const name of Object.keys(urls)){
  const image=this.textures.get(`raw-${name}`).getSourceImage() as HTMLImageElement;
  const c=document.createElement('canvas');c.width=image.width;c.height=image.height;const ctx=c.getContext('2d')!;ctx.drawImage(image,0,0);
  const data=ctx.getImageData(0,0,c.width,c.height).data;let x0=c.width,y0=c.height,x1=0,y1=0,transparent=0;
  for(let y=0;y<c.height;y++)for(let x=0;x<c.width;x++){const a=data[(y*c.width+x)*4+3];if(a===0)transparent++;if(a>20){x0=Math.min(x0,x);y0=Math.min(y0,y);x1=Math.max(x1,x);y1=Math.max(y1,y);}}
  const crop=document.createElement('canvas');crop.width=x1-x0+1;crop.height=y1-y0+1;crop.getContext('2d')!.drawImage(c,x0,y0,crop.width,crop.height,0,0,crop.width,crop.height);
  this.textures.addCanvas(`art-${name}`,crop);metrics.push({name,width:c.width,height:c.height,transparent:transparent/(c.width*c.height),bounds:[x0,y0,x1,y1]});
 }
 (window as any).artReview.metrics=metrics;prepare();(window as any).artReview.ready=true;
};
proto.drawSelection=function(){draw.call(this);if(this===scene)render();};
(window as any).artReview={ready:false,set(next:Mode){mode=next;(el('art-choice') as HTMLSelectElement).value=next;prepare();},camera:fitCamera};
(el('art-choice') as HTMLSelectElement).value=mode;
el('art-choice').addEventListener('change',e=>(window as any).artReview.set((e.target as HTMLSelectElement).value));
el('spell-disc').addEventListener('click',()=>{if(mode==='ilyra-ready')(window as any).artReview.set('ilyra-animated');else if(mode==='mara-path')(window as any).artReview.set('mara-animated');});
window.addEventListener('resize',()=>setTimeout(fitCamera,150));
const resume=setInterval(()=>{const b=document.getElementById('claim-offline') as HTMLButtonElement|null;if(b&&!b.closest('[hidden]')&&!b.disabled){b.click();clearInterval(resume);setTimeout(fitCamera,500);}},150);
await import('../../src/bootstrap');
