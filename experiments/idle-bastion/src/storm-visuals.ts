import type Phaser from 'phaser';
import { profile } from '../../../prototypes/tower-impact-study/effects.js';
import type { BattleEvent } from './battle';
import { EVOLUTION_SKINS, evolutionKey, evolutionSkin, skinLevel } from './tower-evolution';

export const STORM_CAST_FRAMES=12;
/** Every chain fire payload starts a new visual segment, even though its shot UID is reused. */
export function stormShotOrigin(event:BattleEvent,elapsed:number){
 if(event.type!=='fire'||event.shot?.kind!==5||!event.enemy)return undefined;
 const r=evolutionSkin(5,event.shot.level)!;
 return {model:{x:event.x!,y:event.y!-(event.tower?12:0)},
  muzzle:{x:event.x!,y:event.y!+(event.tower?r.weaponY-4:0)},at:elapsed};
}
export const stormCastFrame=(age:number):number=>age>=0&&age<.34?1+Math.min(10,Math.floor(age/.34*11)):0;
export function stormLinkStyle(level:number){
 const p=profile(5,skinLevel(level));
 return {colors:p.colors.map(c=>parseInt(c.slice(1),16)),width:1.5+p.i*.2,duration:.13+p.i*.008,branches:p.i>=5};
}
/** Deterministic small bends, exact endpoints. No random jitter or per-frame allocations. */
export function stormLinkPoints(x:number,y:number,xx:number,yy:number,level:number,seed:number):{x:number;y:number}[]{
 const dx=xx-x,dy=yy-y,length=Math.hypot(dx,dy),tier=profile(5,skinLevel(level)).i;
 if(length<1)return [{x,y},{x:xx,y:yy}];
 const count=Math.min(10,4+Math.floor(tier/2)),bend=Math.min(length*.08,2+tier*.45);
 return Array.from({length:count+1},(_,i)=>{if(i===0)return {x,y};if(i===count)return {x:xx,y:yy};const offset=((i+seed)%2?1:-1)*bend;
  return {x:x+dx*i/count-dy/length*offset,y:y+dy*i/count+dx/length*offset};});
}
/** Prebake the high-tier release pulses; originals 1–3 keep their existing animation atlases. */
export function prepareStormEvolution(scene:Phaser.Scene):void{
 for(const r of EVOLUTION_SKINS.filter(r=>r.kind===5&&r.level>3)){
  const key=evolutionKey(5,r.level,'cast');if(scene.textures.exists(key))continue;
  const source=scene.textures.get(evolutionKey(5,r.level,'weapon')).getSourceImage() as HTMLImageElement;
  const canvas=document.createElement('canvas');canvas.width=96*STORM_CAST_FRAMES;canvas.height=96;
  const c=canvas.getContext('2d')!;c.imageSmoothingEnabled=false;const p=profile(5,r.level);
  for(let frame=0;frame<STORM_CAST_FRAMES;frame++){
   c.save();c.translate(frame*96,0);c.drawImage(source,0,0);
   if(frame>0){const t=(frame-1)/11;c.globalAlpha=(1-t)*.8;
    for(let j=0;j<2+Math.floor(p.i/2);j++){
     const a=j*Math.PI*2/(2+Math.floor(p.i/2)),radius=12+t*9;
     const x=Math.round(48+Math.cos(a)*radius),y=Math.round(40+Math.sin(a)*radius);
     c.fillStyle=p.colors[1];c.fillRect(x-2,y-1,5,2);c.fillRect(x,y-3,2,6);
     c.fillStyle=p.colors[2];c.fillRect(x,y-1,2,2);
    }
   }c.restore();
  }
  const tex=scene.textures.addCanvas(key,canvas)!;
  for(let frame=0;frame<STORM_CAST_FRAMES;frame++)tex.add(frame,0,frame*96,0,96,96);
  tex.setFilter(1);
 }
}
