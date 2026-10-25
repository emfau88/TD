import type Phaser from 'phaser';
import type {IdleBattle} from './battle';
import type {ControlledHero} from './hero-controls';
import {SpellSprites} from './spell-sprites';
import {groundEffectDepth as ground} from './world-depth';

export class HeroMarks {
 private readonly sprites:SpellSprites;
 private readonly light:Phaser.GameObjects.Graphics;
 constructor(scene:Phaser.Scene){this.sprites=new SpellSprites(scene,60);this.light=scene.add.graphics().setDepth(ground);}
 update(b:IdleBattle,hero?:ControlledHero):void {
  this.sprites.begin();this.light.clear();if(!hero)return;
  const a=hero==='mara'?b.mara:b.ilyra;if(!a)return;
  const key=hero==='mara'?'mara-ring':'ilyra-ring';
  this.light.fillStyle(hero==='mara'?0xffd97a:0x9ce2ff,.21).fillEllipse(a.x,a.y+2,32,14);
  this.sprites.image(key,a.x,a.y+2,42,22,.32,ground,0,true);
  this.sprites.image(key,a.x,a.y+2,38,20,1,ground+1);
  this.sprites.image(key,a.x,a.y+2,38,20,.64+.04*Math.sin(b.elapsed*2),ground+2,0,true);
  const destination=a.path.at(-1);if(!destination)return;
  let length=0,from={x:a.x,y:a.y};for(const p of a.path){length+=Math.hypot(p.x-from.x,p.y-from.y);from=p;}
  const spacing=Math.max(18,length/48);let remaining=spacing;from={x:a.x,y:a.y};
  for(const p of a.path){
   const distance=Math.hypot(p.x-from.x,p.y-from.y);
   while(remaining<distance){const f=remaining/distance;
    this.sprites.image(hero==='mara'?'mara-mote':'star-impact',from.x+(p.x-from.x)*f,from.y+(p.y-from.y)*f+2,hero==='mara'?6:4,4,.56,ground);
    remaining+=spacing;
   }
   remaining-=distance;from=p;
  }
  this.sprites.image('destination',destination.x,destination.y+2,27,18,.95,ground);
 }
 destroy():void{this.sprites.destroy();this.light.destroy();}
}
