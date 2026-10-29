import type Phaser from 'phaser';
import { attackPose } from '../../../prototypes/frostkristall-evolution/attack-motion.js';
import { EVOLUTION_SKINS, evolutionSkin, evolutionKey, frostAnimationTime, arrowCopies, type EvolutionSkin } from './tower-evolution';
import { towerSheet, weaponFrame } from './tower-atlas';
import type { BattleEvent, IdleBattle, Tower } from './battle';
import { projectileDepth } from './world-depth';

const urls=import.meta.glob(['../../../prototypes/*-evolution/assets/compact/*.png','../../../prototypes/waldwaechter-evolution/assets/shooting/*.png','../../../prototypes/frostkristall-evolution/assets/frost-cast-v2.png'],{eager:true,query:'?url',import:'default'}) as Record<string,string>;
const FX='evolution-frost-cast',S=.63,FRAMES=30;
export type EvolutionTowerView={base:Phaser.GameObjects.Image;weapon:Phaser.GameObjects.Image};
const key=(r:EvolutionSkin,role:string)=>evolutionKey(r.kind,r.level,role);
function source(path:string):string {const url=urls[path];if(!url)throw new Error('Missing evolution asset '+path);return url;}
function weaponKey(r:EvolutionSkin):string {
 return r.originalStage&&(r.kind===1||r.level===1)?towerSheet(r.kind,r.originalStage,'Weapon').key:key(r,r.kind===2?'attack':'weapon');
}
export function preloadEvolution(scene:Phaser.Scene):void {
 for(const r of EVOLUTION_SKINS){scene.load.image(key(r,'base'),source(r.base));scene.load.image(key(r,'weapon'),source(r.weapon));
  if(r.kind===2&&r.level>1)scene.load.image(key(r,'projectile'),source('../../../prototypes/frostkristall-evolution/assets/compact/level-'+r.level+'-projectile.png'));
  if(r.kind===1&&r.level>=10)scene.load.image(key(r,'projectile'),source('../../../prototypes/waldwaechter-evolution/assets/shooting/'+(r.level===10?'steel-arrow.png':'arrow-'+r.level+'.png')));
 }
 scene.load.spritesheet(FX,source('../../../prototypes/frostkristall-evolution/assets/frost-cast-v2.png'),{frameWidth:64,frameHeight:64});
}
function iceMask(image:HTMLImageElement|HTMLCanvasElement):HTMLCanvasElement {
 const out=document.createElement('canvas');out.width=image.width;out.height=image.height;
 const c=out.getContext('2d')!;c.drawImage(image,0,0);const pixels=c.getImageData(0,0,out.width,out.height);
 for(let i=0;i<pixels.data.length;i+=4){const a=pixels.data[i+3],r=pixels.data[i],g=pixels.data[i+1],b=pixels.data[i+2];
  pixels.data[i]=230;pixels.data[i+1]=252;pixels.data[i+2]=255;pixels.data[i+3]=a&&b>r+20&&g>r+12&&g>90?a:0;
 }
 c.putImageData(pixels,0,0);return out;
}
function facets(c:CanvasRenderingContext2D,img:CanvasImageSource,spread:number,y:number):void {
 for(const [left,width,offset] of [[0,24,-spread],[24,16,0],[40,24,spread]])c.drawImage(img,left,0,width,64,left+offset,y,width,64);
}
/** Bake once at load, not once per turret/frame; below 2048px texture width. */
export function prepareEvolution(scene:Phaser.Scene):void {
 const fx=scene.textures.get(FX).getSourceImage() as HTMLImageElement;
 for(const r of EVOLUTION_SKINS.filter(r=>r.kind===2&&r.level>1)){
  if(scene.textures.exists(key(r,'attack')))continue;
  const core=scene.textures.get(key(r,'weapon')).getSourceImage() as HTMLImageElement,mask=iceMask(core);
  const canvas=document.createElement('canvas');canvas.width=64*FRAMES;canvas.height=64;const c=canvas.getContext('2d')!;c.imageSmoothingEnabled=false;
  for(let frame=0;frame<FRAMES;frame++){
   const t=frame===0?0:(frame-1)/(FRAMES-2)*.86,p=attackPose(r.level,t);c.save();c.translate(frame*64,0);
   if(p.fxFrame>=0){c.globalAlpha=p.fxOpacity;c.drawImage(fx,p.fxFrame%4*64,Math.floor(p.fxFrame/4)*64,64,64,32-p.fxSize/2,32-p.fxSize/2,p.fxSize,p.fxSize);}
   c.globalAlpha=1;facets(c,core,p.spread,p.y);c.globalAlpha=p.light;facets(c,mask,p.spread,p.y);c.restore();
  }
  const texture=scene.textures.addCanvas(key(r,'attack'),canvas)!;
  for(let frame=0;frame<FRAMES;frame++)texture.add(frame,0,frame*64,0,64,64);
  const base=scene.textures.get(key(r,'base')).getSourceImage() as HTMLImageElement;
  scene.textures.addCanvas(key(r,'glow'),iceMask(base));
 }
}
export function evolutionGhost(kind:number):{base:string;weapon:string;originY:number;weaponY:number}|undefined {
 const r=evolutionSkin(kind,1);return r?{base:key(r,'base'),weapon:weaponKey(r),originY:r.originY,weaponY:r.weaponY}:undefined;
}
type Origin={model:{x:number;y:number};muzzle:{x:number;y:number};at:number};
type ShotView={sprites:Phaser.GameObjects.Image[];origin:Origin};
export class EvolutionView {
 private glows=new Map<number,Phaser.GameObjects.Image>();
 private origins=new Map<number,Origin>();
 private shots=new Map<number,ShotView>();
 constructor(private scene:Phaser.Scene){}
 accept(events:readonly BattleEvent[],elapsed:number):void {
  for(const e of events){if(e.type!=='fire'||!e.shot||!e.tower)continue;const r=evolutionSkin(e.shot.kind,e.shot.level);if(!r)continue;
   const a=e.tower.angle,extra=r.kind===1?16:0,lift=r.kind===2?attackPose(r.level,.28).y*S:0;
   this.origins.set(e.shot.uid,{model:{x:e.tower.x,y:e.tower.y-12},muzzle:{x:e.tower.x+Math.sin(a)*extra,y:e.tower.y+r.weaponY-Math.cos(a)*extra+lift},at:elapsed});
  }
 }
 updateTower(tower:Tower,view:EvolutionTowerView,age:number,cycle:number,cooldown:number,hasTarget:boolean,elapsed:number,tint:number,tremble:number,wobble:number):boolean {
  const r=evolutionSkin(tower.def.id,tower.level);if(!r)return false;
  view.base.setTexture(key(r,'base'),0).setOrigin(.5,r.originY).setPosition(tower.x+tremble*.6,tower.y+13).setRotation(wobble*.4).setTint(tint);
  const time=r.kind===2?frostAnimationTime(age,cooldown,cycle,hasTarget):0,p=attackPose(r.level,time);
  let frame=0,recoil=0;
  if(r.originalStage&&(r.kind===1||r.level===1))frame=weaponFrame(r.kind,r.originalStage,age,elapsed,cycle);
  else if(r.kind===2)frame=time>0&&time<.86?1+Math.min(FRAMES-2,Math.floor(time/.86*(FRAMES-2))):0;
  if(r.kind===1&&r.level>3&&age>=0&&age<.14)recoil=2.2*Math.sin(Math.PI*age/.14);
  view.weapon.setTexture(weaponKey(r),Math.max(0,frame)).setScale(S).setPosition(tower.x+tremble-Math.sin(tower.angle)*recoil,tower.y+r.weaponY+Math.cos(tower.angle)*recoil).setRotation((r.kind===2?0:tower.angle)+wobble).setTint(tint);
  let glow=this.glows.get(tower.uid);
  if(r.kind===2&&r.level>1){
   if(!glow){glow=this.scene.add.image(0,0,key(r,'glow')).setScale(S);this.glows.set(tower.uid,glow);}
   glow.setTexture(key(r,'glow')).setOrigin(.5,r.originY).setPosition(view.base.x,view.base.y).setRotation(view.base.rotation).setTint(tint).setDepth(tower.y+1000.1).setAlpha(p.baseLight).setVisible(p.baseLight>0);
  }else glow?.setVisible(false);
  return true;
 }
 sync(sim:IdleBattle,elapsed:number):void {
  const liveTowers=new Set(sim.towers.map(t=>t.uid)),liveShots=new Set(sim.shots.map(s=>s.uid));
  for(const [id,glow] of this.glows)if(!liveTowers.has(id)){glow.destroy();this.glows.delete(id);}
  for(const [id,v] of this.shots)if(!liveShots.has(id)||v.origin.at>elapsed){v.sprites.forEach(s=>s.destroy());this.shots.delete(id);}
  for(const [id,o] of this.origins)if(!liveShots.has(id)||o.at>elapsed)this.origins.delete(id);
  for(const shot of sim.shots){const r=evolutionSkin(shot.kind,shot.level);if(!r)continue;
   const target=sim.enemies.find(e=>e.uid===shot.target);if(!target)continue;
   let v=this.shots.get(shot.uid);
   const earlyArrow=r.kind===1&&r.level<10,originalFrost=r.kind===2&&r.level===1;
   const sheet=earlyArrow?towerSheet(1,Math.min(3,r.level),'Projectile'):originalFrost?towerSheet(2,1,'Projectile'):undefined;
   if(!v){const count=r.kind===1&&r.level>=10?3:1;
    const origin=this.origins.get(shot.uid)??{model:{x:shot.x,y:shot.y},muzzle:{x:shot.x,y:shot.y},at:elapsed};
    v={origin,sprites:Array.from({length:count},()=>this.scene.add.image(shot.x,shot.y,sheet?.key??key(r,'projectile'),0).setScale(r.kind===2?.5:.45))};this.shots.set(shot.uid,v);
   }
   const moved=Math.hypot(shot.x-v.origin.model.x,shot.y-v.origin.model.y),left=Math.hypot(target.x-shot.x,target.y-shot.y),progress=Math.min(1,moved/Math.max(.001,moved+left));
   const copies=r.kind===1?arrowCopies(r.level,progress):[{offset:0,progress,visible:true}];
   const start=v.origin.muzzle,angle=Math.atan2(target.y-start.y,target.x-start.x)+Math.PI/2;
   const depth=projectileDepth(shot,sim.towers.find(t=>t.uid===shot.towerUid),target);
   v.sprites.forEach((sprite,i)=>{const p=copies[i];sprite.setVisible(p.visible).setPosition(start.x+(target.x-start.x)*p.progress+Math.cos(angle)*p.offset*.45,start.y+(target.y-start.y)*p.progress+Math.sin(angle)*p.offset*.45).setRotation(angle).setDepth(depth);
    if(sheet)sprite.setFrame(Math.floor(Math.max(0,elapsed-v.origin.at)*11)%sheet.frameMap.length);
   });
  }
 }
 destroy():void {for(const g of this.glows.values())g.destroy();for(const v of this.shots.values())v.sprites.forEach(s=>s.destroy());this.glows.clear();this.shots.clear();this.origins.clear();}
}
