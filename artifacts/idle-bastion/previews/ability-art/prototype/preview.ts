// Local presentation prototype. No production import, no default save access.
import { BattleScene } from '../../src/battle-scene';
import { IdleBattle } from '../../src/battle';
import { createFeatureProbe } from '../../src/feature-probes';
import { openBattleStore } from '../../src/save-store';
import { setLanguage } from '../../src/i18n';
import { maraFrame } from '../../src/art';
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

type Mode='ilyra-ready'|'ilyra-cooldown'|'mara-path'|'mara-cast'|'mara-buff'|'ilyra-flight'|'ilyra-impact'|'mara-animated'|'ilyra-animated'|'cooldown-animated';
const labels:Record<Mode,string>={
 'ilyra-ready':'Ilyra · Bereit & Auswahl', 'ilyra-cooldown':'Ilyra · Radialer Cooldown',
 'mara-path':'Mara · Auswahl & Laufziel', 'mara-cast':'Mara · Lichtimpuls', 'mara-buff':'Mara · Verstärkter Turm',
 'ilyra-flight':'Sternensalve · Flug', 'ilyra-impact':'Sternensalve · Einschlag',
 'mara-animated':'Mara · Animationsprobe', 'ilyra-animated':'Sternensalve · Animationsprobe',
 'cooldown-animated':'Cooldown · Animationsprobe',
};
let mode:Mode=(params.searchParams.get('mode') as Mode)||'ilyra-cooldown';
let started=performance.now(), scene:any, visual:IdleBattle, sprites:any[]=[];
const el = (id:string)=>document.getElementById(id)!;
document.body.insertAdjacentHTML('beforeend',`<div id="art-label">SPIRE · GESTALTUNGSPROBE</div><section id="art-panel"><button id="spell-disc" aria-label="Zaubervorschau"><img id="spell-image" alt=""><span id="spell-shade"></span><span id="spell-number"></span></button><div class="art-copy"><div id="art-name"></div><div id="art-status"></div><span id="art-auto"></span></div></section><div id="art-modes"><select id="art-choice">${Object.entries(labels).map(([key,value])=>`<option value="${key}">${value}</option>`).join('')}</select></div>`);
if(params.searchParams.has('capture'))document.body.classList.add('capture');

function sprite(key:string,x:number,y:number,width:number,height:number,alpha=1,depth=900,rotation=0) {
 const s=scene.add.image(x,y,`art-${key}`).setDisplaySize(width,height).setAlpha(alpha).setDepth(depth).setRotation(rotation);
 sprites.push(s);return s;
}
function clearArt(){for(const s of sprites)s.destroy();sprites=[];}
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
 if(['mara-cast','mara-buff','mara-animated'].includes(mode)&&visual.moveMaraTo({x:8,y:8})){
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
 sprite(`${hero}-ring`,a.x,a.y+3,58,24,.85+.08*Math.sin(time*2),900);
}
function starVolley(age:number,time:number){
 const a=visual.ilyra!, candidates=visual.enemies.filter(e=>Math.hypot(e.x-a.x,e.y-a.y)<205);
 const target=candidates.sort((l,r)=>r.x-l.x)[0]??{x:a.x+150,y:a.y+40};
 const x=target.x,y=target.y;
 const pace=1.35, logical=age/pace;
 if(logical>=.95){a.volley=null;return;}
 a.volley={x,y,originX:a.x,originY:a.y,age:logical,pace:1.35,hit:logical>=.6,...visual.ilyraPower};
 sprite('ilyra-ring',x,y+2,144,68,logical<.6?.24:Math.max(0,.32-(logical-.6)),900);
 if(logical<.18){sprite('star-impact',a.x,a.y-24,18+logical*60,18+logical*60,.7,1003+a.y,logical);return;}
 if(logical<.6){
  for(let i=-1;i<=1;i++){
   const t=Math.max(0,Math.min(1,(logical-.18)/.42-i*.025));
   const at=(f:number)=>({x:a.x+(x-a.x)*f+i*18*Math.sin(Math.PI*f),y:a.y-24+(y-a.y+24)*f-Math.sin(Math.PI*f)*(25+i*8)});
   const p=at(t),prev=at(Math.max(0,t-.04));const angle=Math.atan2(p.y-prev.y,p.x-prev.x);
   // Pulse/twinkle, changing tail length and detached fading motes, not a static translated icon.
   const pulse=1+.09*Math.sin(time*29+i*2);
   for(let j=3;j>=1;j--){const q=at(Math.max(0,t-j*.035));sprite('star-projectile',q.x,q.y,21-j*3,9-j,.1+.05*(4-j),1003+q.y,angle);}
   sprite('star-projectile',p.x,p.y,(33+i*3)*pulse,15*pulse,.94,1003+p.y,angle);
   sprite('star-impact',p.x+5*Math.cos(angle),p.y+5*Math.sin(angle),9*pulse,9*pulse,.65,1005+p.y,time*2);
  }
 }else if(logical<.95){
  const f=(logical-.6)/.35, fade=1-f;
  sprite('star-impact',x,y-8,30+f*56,30+f*56,Math.sin(Math.PI*(.15+f*.85))*.9,1003+y,f*.12);
  sprite('ilyra-ring',x,y+4,40+f*90,20+f*42,fade*.6,900);
  for(let i=0;i<8;i++){const angle=i*Math.PI/4+.15,rad=12+f*48;
   sprite('star-impact',x+Math.cos(angle)*rad,y-7+Math.sin(angle)*rad*.65,7-3*f,7-3*f,fade*.8,1004+y,angle+f);
  }
 }
}
function maraEffect(age:number,time:number){
 const a=visual.mara, tower=visual.towers.find(t=>t.uid===a.targetTowerUid)??visual.towers[0];
 const start={x:a.x,y:a.y-22},end={x:tower.x,y:tower.y-28};
 const flight=.55;
 if(age<flight){
  scene.mara.setFrame(maraFrame('left',false,true,visual.elapsed));
  const t=age/flight,at=(f:number)=>({x:start.x+(end.x-start.x)*f,y:start.y+(end.y-start.y)*f-Math.sin(Math.PI*f)*28});
  const p=at(t),prev=at(Math.max(0,t-.04)),angle=Math.atan2(p.y-prev.y,p.x-prev.x);
  sprite('mara-mote',start.x,start.y,14+Math.sin(t*Math.PI)*8,12,.55*(1-t),1003+a.y,-Math.PI/2);
  for(let j=3;j>=1;j--){const q=at(Math.max(0,t-j*.05));sprite('mara-mote',q.x,q.y,18-j*3,9-j,.12*(4-j),1003+q.y,angle);}
  sprite('mara-mote',p.x,p.y,28*(1+.06*Math.sin(time*30)),17,.96,1003+p.y,angle);
 }
 if(age>=flight&&age<8.55){
  const t=age-flight,fade=Math.min(1,t/.18,(8-t)/.7),pulse=.73+Math.sin(time*3)*.08;
  sprite('mara-ring',tower.x,tower.y+12,66,29,fade*pulse,900);
  const views=scene.towerViews.get(tower.uid);views?.weapon.setTint(0xffe6a1);
  for(let i=0;i<3;i++){const p=(t*.28+i/3)%1;
   sprite('mara-mote',tower.x+Math.sin(i*2.1+t)*15,tower.y+4-p*44,10,7,fade*Math.sin(p*Math.PI)*.42,1004+tower.y,-Math.PI/2);
  }
  if(t<.5)sprite('mara-ring',tower.x,tower.y+10,32+t*86,16+t*38,(1-t/.5)*.8,900);
 }
}
function render(){
 if(!scene||!visual||!scene.textures.exists('art-ilyra-ring'))return;
 clearArt();scene.selection.clear();scene.effects.clear();scene.buffText.setVisible(false);
 // Hide only the former Ilyra effect graphics; keep her genuine character sprite and cast frames.
 for(const g of [scene.ilyraView.ground,scene.ilyraView.cast,scene.ilyraView.impact,...scene.ilyraView.stars])g.clear();
 const time=(performance.now()-started)/1000;
 el('art-label').textContent=`ENTWURF · ${labels[mode]}`;
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
 if(mode==='mara-cast'||mode==='mara-buff'||mode==='mara-animated'){
  const age=mode==='mara-cast'?.27:mode==='mara-buff'?2.2:time%10;
  maraEffect(age,time);disc('mara',Math.max(0,30-age),age<.55?'Lichtimpuls zum Turm':age<8.55?`Turm verstärkt · ${Math.ceil(8.55-age)} s`:'Verstärkung klingt aus',true);
 }
 if(mode==='ilyra-flight'||mode==='ilyra-impact'||mode==='ilyra-animated'){
  const age=mode==='ilyra-flight'?.55:mode==='ilyra-impact'?.98:time%2.8;
  starVolley(age,time);disc('ilyra',Math.max(0,28-age),age<.81?'Sternensalve unterwegs':age<1.3?'Sternenlicht klingt aus':'Lädt sich wieder auf');
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
