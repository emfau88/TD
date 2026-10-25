import type Phaser from 'phaser';
import type {IdleBattle} from './battle';
import {MARA,type MaraState} from './mara';
import {SpellSprites} from './spell-sprites';
import {groundEffectDepth as ground,worldEffectDepth as depth} from './world-depth';
type TowerView={base:Phaser.GameObjects.Image;weapon:Phaser.GameObjects.Image};

/** Display-only support pulses. The model's effectTowerUid owns the glow, even after retargeting. */
export class MaraSpellView {
 private readonly sprites:SpellSprites;
 private last?:{uid:number;end:number};
 private lastElapsed=0;
 private pulseKey='';
 private origin={x:0,y:0};
 castDirection?:MaraState['direction'];
 constructor(scene:Phaser.Scene){this.sprites=new SpellSprites(scene,64);}
 update(b:IdleBattle,views:ReadonlyMap<number,TowerView>):void {
  this.sprites.begin();this.castDirection=undefined;
  if(b.elapsed<this.lastElapsed){this.last=undefined;this.pulseKey='';}this.lastElapsed=b.elapsed;
  const active=b.towers.find(t=>b.isMaraBoosted(t.uid)&&!b.isCharmed(t.uid));
  if(active)this.last={uid:active.uid,end:b.elapsed+b.mara.effectRemaining};
  let fade=active?Math.min(1,(MARA.duration-b.mara.effectRemaining)/.18):0;
  // A short natural-expiry afterglow. Sale, defeat, charm and wave changes clear immediately.
  if(!active&&this.last&&b.phase==='wave'&&b.mara.effectRemaining<=1e-9&&b.elapsed>=this.last.end&&!b.isCharmed(this.last.uid))
   fade=Math.max(0,1-(b.elapsed-this.last.end)/.4);
  const tower=active??(fade>0?b.towers.find(t=>t.uid===this.last?.uid):undefined),view=tower&&views.get(tower.uid);
  if(!tower||!view||fade<=0){if(!active)this.last=undefined;return;}
  const age=active?MARA.duration-b.mara.effectRemaining:MARA.duration+(b.elapsed-this.last!.end),phase=age%1;
  const arrival=phase-.55,hit=active&&arrival>=0&&arrival<.28?1-arrival/.28:0;
  for(const source of [view.base,view.weapon]){
   for(let i=0;i<8;i++){
    const angle=i*Math.PI/4;
    this.sprites.silhouette(source,Math.cos(angle)*4.8,Math.sin(angle)*4.8,(.026+hit*.012)*fade,source.depth-.2,true);
    this.sprites.silhouette(source,Math.cos(angle)*2.2,Math.sin(angle)*2.2,(.07+hit*.025)*fade,source.depth-.1,true);
   }
   this.sprites.silhouette(source,0,0,(.20+hit*.07)*fade,source.depth+.02);
   this.sprites.silhouette(source,0,0,(.065+hit*.055)*fade,source.depth+.03,true);
  }
  this.sprites.image('mara-ring',tower.x,tower.y+12,66,29,fade*(.73+Math.sin(b.elapsed*3)*.08),ground);
  const end={x:tower.x,y:tower.y-28};
  if(active){
   const key=`${tower.uid}:${Math.round((b.elapsed-age)*1000)}:${Math.floor(age)}`;
   if(key!==this.pulseKey){this.pulseKey=key;this.origin={x:b.mara.x,y:b.mara.y-22};}
   if(phase<.55){
    const start=this.origin,t=phase/.55;
    if(!b.mara.path.length){const dx=tower.x-b.mara.x,dy=tower.y-b.mara.y;this.castDirection=Math.abs(dx)>Math.abs(dy)?dx<0?'left':'right':dy<0?'up':'down';}
    const at=(f:number)=>({x:start.x+(end.x-start.x)*f,y:start.y+(end.y-start.y)*f-Math.sin(Math.PI*f)*28,groundY:start.y+22+(tower.y-start.y-22)*f});
    const p=at(t),previous=at(Math.max(0,t-.04)),angle=Math.atan2(p.y-previous.y,p.x-previous.x);
    this.sprites.image('mara-mote',start.x,start.y,14+Math.sin(t*Math.PI)*8,12,.55*(1-t),depth(start.y+22),-Math.PI/2);
    for(let j=3;j>=1;j--){const q=at(Math.max(0,t-j*.05));this.sprites.image('mara-mote',q.x,q.y,18-j*3,9-j,.12*(4-j),depth(q.groundY),angle);}
    this.sprites.image('mara-mote',p.x,p.y,28*(1+.06*Math.sin(b.elapsed*30)),17,.96,depth(p.groundY),angle);
   }
   if(arrival>=0&&arrival<.4){
    const f=arrival/.4;
    this.sprites.image('mara-ring',tower.x,tower.y+10,38+arrival*70,18+arrival*30,(1-f)*.65*fade,ground);
    for(let i=0;i<5;i++){
     const angle=-Math.PI/2+(i-2)*.68,reach=5+f*(22+(i%2)*8);
     this.sprites.image('mara-mote',end.x+Math.cos(angle)*reach,end.y+Math.sin(angle)*reach+f*f*11,(8-i%2*2)*(1-f*.4),4,(1-f)*.95,depth(tower.y)+2,angle+f*.8);
    }
   }
  }
  for(let i=0;i<3;i++){const p=(age*.28+i/3)%1;this.sprites.image('mara-mote',tower.x+Math.sin(i*2.1+age)*15,tower.y+4-p*44,10,7,fade*Math.sin(p*Math.PI)*.42,depth(tower.y)+1,-Math.PI/2);}
 }
 destroy():void{this.sprites.destroy();this.last=undefined;}
}
