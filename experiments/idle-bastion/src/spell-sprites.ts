import type Phaser from 'phaser';
import type {SpellArt} from './spell-art';

// Phaser 4 TintModes; keep the view importable without booting the browser engine.
const TINT_MULTIPLY=0,TINT_FILL=1;

/** Bounded, reused display objects; no particle allocation in the steady render loop. */
export class SpellSprites {
 private readonly images:Phaser.GameObjects.Image[]=[];
 private used=0;
 constructor(private readonly scene:Phaser.Scene,private readonly capacity=96){}
 begin():void{this.used=0;for(const image of this.images)image.setVisible(false);}
 private next(texture:string,frame:string|number=0):Phaser.GameObjects.Image {
  if(this.used>=this.capacity)throw new Error('Spell sprite budget exceeded');
  const i=this.used++,image=this.images[i]??(this.images[i]=this.scene.add.image(0,0,texture,frame));
  return image.setTexture(texture,frame).setVisible(true).setOrigin(.5).setScale(1).setFlip(false,false)
   .setTint(0xffffff).setTintMode(TINT_MULTIPLY).setBlendMode('NORMAL');
 }
 image(key:SpellArt,x:number,y:number,width:number,height:number,alpha:number,depth:number,rotation=0,add=false):Phaser.GameObjects.Image {
  return this.next(`spell-${key}`,'__BASE').setPosition(x,y).setDisplaySize(width,height)
   .setAlpha(Math.max(0,Math.min(1,alpha))).setDepth(depth).setRotation(rotation)
   .setBlendMode(add?'ADD':'NORMAL');
 }
 silhouette(source:Phaser.GameObjects.Image,dx:number,dy:number,alpha:number,depth:number,add=false):void {
  this.next(source.texture.key,source.frame.name).setOrigin(source.originX,source.originY)
   .setScale(source.scaleX,source.scaleY).setRotation(source.rotation).setFlip(source.flipX,source.flipY)
   .setPosition(source.x+dx,source.y+dy).setDepth(depth).setTint(0xffcd69).setTintMode(TINT_FILL)
   .setBlendMode(add?'ADD':'NORMAL').setAlpha(alpha);
 }
 destroy():void{for(const image of this.images)image.destroy();this.images.length=0;}
}
