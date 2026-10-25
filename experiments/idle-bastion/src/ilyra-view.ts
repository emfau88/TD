import { t } from './i18n';
import type Phaser from 'phaser';
import { ilyraFrame } from './ilyra';
import { KEYS } from './art';
import type { IdleBattle } from './battle';
import { IlyraSpellView } from './ilyra-spell-view';
export class IlyraView {
 private sprite:Phaser.GameObjects.Image;
 private shadow:Phaser.GameObjects.Ellipse;
 private name:Phaser.GameObjects.Text;
 private spell:IlyraSpellView;
 constructor(scene:Phaser.Scene){
  this.sprite=scene.add.image(0,0,KEYS.ilyra,0).setOrigin(.5,56/64);
  this.shadow=scene.add.ellipse(0,0,20,7,0x142e30,.22);
  this.name=scene.add.text(0,0,'Ilyra',{fontFamily:'Segoe UI',fontSize:'11px',fontStyle:'bold',resolution:2,color:'#d9f1ff',stroke:'#1c2d36',strokeThickness:2}).setOrigin(.5).setDepth(5001);
  this.spell=new IlyraSpellView(scene);
 }
 contains(p:{x:number;y:number}){return this.sprite.visible&&this.sprite.getBounds().contains(p.x,p.y);}
 update(b:IdleBattle){
  const s=b.ilyra;for(const o of [this.sprite,this.shadow,this.name])o.setVisible(!!s);
  this.spell.update(b);if(!s)return;
  this.sprite.setPosition(s.x,s.y).setFrame(ilyraFrame(s,b.elapsed)).setDepth(s.y+1002);
  this.shadow.setPosition(s.x,s.y+1).setDepth(s.y+999);
  this.name.setPosition(s.x,s.y+13).setText(t(s.volley?t('Ilyra · Sternensalve'):s.path.length?t('Ilyra · unterwegs'):'Ilyra'));
 }
 destroy():void{this.spell.destroy();this.sprite.destroy();this.shadow.destroy();this.name.destroy();}
}
