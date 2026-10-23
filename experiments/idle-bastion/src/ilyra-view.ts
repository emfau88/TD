import { t } from './i18n';
import type Phaser from 'phaser';
import { ILYRA, ilyraFrame } from './ilyra';
import { KEYS } from './art';
import type { IdleBattle } from './battle';
import { groundEffectDepth, worldEffectDepth } from './world-depth';
export class IlyraView {
 private sprite:Phaser.GameObjects.Image;
 private shadow:Phaser.GameObjects.Ellipse;
 private name:Phaser.GameObjects.Text;
 private ground:Phaser.GameObjects.Graphics;
 private cast:Phaser.GameObjects.Graphics;
 private impact:Phaser.GameObjects.Graphics;
 private stars:Phaser.GameObjects.Graphics[];
 constructor(scene:Phaser.Scene){
  this.sprite=scene.add.image(0,0,KEYS.ilyra,0).setOrigin(.5,56/64);
  this.shadow=scene.add.ellipse(0,0,20,7,0x142e30,.22);
  this.name=scene.add.text(0,0,'Ilyra',{fontFamily:'Segoe UI',fontSize:'11px',fontStyle:'bold',resolution:2,color:'#d9f1ff',stroke:'#1c2d36',strokeThickness:2}).setOrigin(.5).setDepth(5001);
  this.ground=scene.add.graphics().setDepth(groundEffectDepth);
  this.cast=scene.add.graphics();this.impact=scene.add.graphics();
  this.stars=Array.from({length:3},()=>scene.add.graphics());
 }
 contains(p:{x:number;y:number}){return this.sprite.visible&&this.sprite.getBounds().contains(p.x,p.y);}
 update(b:IdleBattle){
  const s=b.ilyra;for(const o of [this.sprite,this.shadow,this.name])o.setVisible(!!s);
  for(const g of [this.ground,this.cast,this.impact,...this.stars])g.clear();if(!s)return;
  this.sprite.setPosition(s.x,s.y).setFrame(ilyraFrame(s,b.elapsed)).setDepth(s.y+1002);
  this.shadow.setPosition(s.x,s.y+1).setDepth(s.y+999);
  this.name.setPosition(s.x,s.y+13).setText(t(s.volley?t('Ilyra · Sternensalve'):s.path.length?t('Ilyra · unterwegs'):'Ilyra'));
  const v=s.volley;if(!v)return;
  const fade=v.hit?Math.max(0,1-(v.age-ILYRA.impact)/(ILYRA.duration-ILYRA.impact)):1;
  this.ground.fillStyle(0x7ddcff,.09*fade).fillCircle(v.x,v.y,ILYRA.radius);
  this.ground.lineStyle(1.5,0xb9eaff,.7*fade).strokeCircle(v.x,v.y,ILYRA.radius);
  if(v.age<ILYRA.windup){this.cast.setDepth(worldEffectDepth(s.y)).lineStyle(2,0xf3d792,1).strokeCircle(s.x,s.y-22,7+v.age*35);return;}
  if(!v.hit){
   const t=Math.min(1,(v.age-ILYRA.windup)/(ILYRA.impact-ILYRA.windup));
   for(let i=-1;i<=1;i++){
    const g=this.stars[i+1].setDepth(worldEffectDepth(v.originY+(v.y-v.originY)*t));
    const at=(f:number)=>({x:v.originX+(v.x-v.originX)*f+i*18*Math.sin(Math.PI*f),y:v.originY-24+(v.y-v.originY+24)*f-Math.sin(Math.PI*f)*(25+i*8)});
    const p=at(t),tail=at(Math.max(0,t-.13));g.lineStyle(3,0x83cbf4,.7).lineBetween(tail.x,tail.y,p.x,p.y);
    g.fillStyle(0xfff4cf,1).fillCircle(p.x,p.y,3);g.lineStyle(1,0xe7f7ff,.9).lineBetween(p.x-6,p.y,p.x+6,p.y).lineBetween(p.x,p.y-6,p.x,p.y+6);
   }
  }else{
   const g=this.impact.setDepth(worldEffectDepth(v.y));
   const radius=8+(1-fade)*ILYRA.radius;
   g.lineStyle(3,0xe0f4ff,fade).strokeCircle(v.x,v.y,radius);
   for(let i=0;i<10;i++){const a=i*Math.PI/5,x=v.x+Math.cos(a)*radius,y=v.y+Math.sin(a)*radius;
    g.fillStyle(i%2?0xf2d795:0xafdeff,fade).fillRect(Math.round(x)-2,Math.round(y)-2,4,4);}
  }
 }
}
