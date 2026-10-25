import type Phaser from 'phaser';
import type {IdleBattle} from './battle';
import {ILYRA} from './ilyra';
import {SpellSprites} from './spell-sprites';
import {groundEffectDepth as ground,worldEffectDepth as depth} from './world-depth';

/** Cosmetic coverage of the existing single circular hit. Never applies damage. */
export class IlyraSpellView {
 private readonly sprites:SpellSprites;
 private readonly field:Phaser.GameObjects.Graphics;
 constructor(scene:Phaser.Scene){this.sprites=new SpellSprites(scene,64);this.field=scene.add.graphics().setDepth(ground);}
 update(b:IdleBattle):void {
  this.sprites.begin();this.field.clear();const v=b.ilyra?.volley;if(!v)return;
  const {x,y,age}=v,radius=ILYRA.radius,time=age*(v.pace??1);
  const fade=v.hit?Math.max(0,1-(age-ILYRA.impact)/(ILYRA.duration-ILYRA.impact)):1;
  this.field.fillStyle(0x99dfff,(v.hit?.16:.065)*fade).fillCircle(x,y,radius);
  this.field.lineStyle(5,0x8bdbff,.13*fade).strokeCircle(x,y,radius);
  this.field.lineStyle(1.5,0xbbeeff,.7*fade).strokeCircle(x,y,radius);
  for(let i=0;i<12;i++){
   const a=i*Math.PI/6,size=i%3===0?9:5;
   this.sprites.image('star-impact',x+Math.cos(a)*radius,y+Math.sin(a)*radius,size,size,.76*fade,ground+1,Math.PI/4);
  }
  if(age<ILYRA.windup){this.sprites.image('star-impact',v.originX,v.originY-24,18+age*60,18+age*60,.7,depth(v.originY),age);return;}
  const points=[{x,y},...Array.from({length:8},(_,i)=>({x:x+Math.cos(i*Math.PI/4)*radius*.72,y:y+Math.sin(i*Math.PI/4)*radius*.72}))];
  if(!v.hit){
   for(const [i,destination]of points.entries()){
    const delay=(i%3)*.018,span=ILYRA.impact-ILYRA.windup-delay;
    if(age<ILYRA.windup+delay)continue;
    const progress=Math.max(0,Math.min(1,(age-ILYRA.windup-delay)/span));
    const at=(f:number)=>({x:v.originX+(destination.x-v.originX)*f+Math.sin(Math.PI*f)*(i%2?7:-7),
     y:v.originY-24+(destination.y-v.originY+24)*f-Math.sin(Math.PI*f)*(24+(i%3)*7),groundY:v.originY+(destination.y-v.originY)*f});
    const p=at(progress),previous=at(Math.max(0,progress-.04)),angle=Math.atan2(p.y-previous.y,p.x-previous.x),pulse=1+.08*Math.sin(time*29+i*2);
    for(let j=2;j>=1;j--){const q=at(Math.max(0,progress-j*.035));this.sprites.image('star-projectile',q.x,q.y,13-j*2,6,.15*(3-j),depth(q.groundY),angle);}
    this.sprites.image('star-projectile',p.x,p.y,(i===0?27:21)*pulse,10*pulse,.96,depth(p.groundY),angle);
   }
  }else{
   const f=Math.max(0,1-fade);
   this.field.lineStyle(2,0xdff6ff,fade*.6).strokeCircle(x,y,Math.min(radius,12+f*radius*1.8));
   for(const [i,p]of points.entries()){
    const size=(i===0?30:18)+f*10,angle=i*Math.PI/4,reach=8+f*10;
    this.sprites.image('star-impact',p.x,p.y-5,size,size,fade*.86,depth(p.y),f*.15);
    this.sprites.image('star-impact',p.x+Math.cos(angle)*reach,p.y+Math.sin(angle)*reach,5,5,fade*.6,depth(p.y)+1,angle);
   }
  }
 }
 destroy():void{this.sprites.destroy();this.field.destroy();}
}
