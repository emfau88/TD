import type Phaser from 'phaser';
import type { IdleBattle, Enemy } from './battle';
import { WORM } from './worm';

const KEY='idle-obsidian-worm';
export const WORM_SHEET={key:KEY,url:new URL('../assets/obsidian-worm/parts.png',import.meta.url).href,width:32,height:32,scale:WORM.scale,facesLeft:false,
  move:{side:{frames:[0],durations:[100]},down:{frames:[4],durations:[100]},up:{frames:[8],durations:[100]}}};
type Part={sprite:Phaser.GameObjects.Image;shadow:Phaser.GameObjects.Ellipse};
/** Each part has its own ground depth, so a long body does not jump in front of trees. */
export class WormView {
  private parts:Part[]=[];
  constructor(private scene:Phaser.Scene){}
  update(sim:IdleBattle,enemy:Enemy):void{
    const nodes=sim.wormBody(enemy),tint=enemy.slowRemaining>0?0x83ddff:enemy.burn?0xffbd80:0xffffff;
    while(this.parts.length<nodes.length)this.parts.push({sprite:this.scene.add.image(0,0,KEY),shadow:this.scene.add.ellipse(0,0,15,6,0x263e30,.24)});
    this.parts.forEach((part,i)=>{
      const p=nodes[i];part.sprite.setVisible(!!p);part.shadow.setVisible(!!p);if(!p)return;
      const q=((Math.round(p.angle/(Math.PI/2))%4)+4)%4,row=q===1?1:q===3?2:0,basis=q===3?-Math.PI/2:q*Math.PI/2;
      let angle=p.angle-basis;while(angle>Math.PI)angle-=2*Math.PI;while(angle< -Math.PI)angle+=2*Math.PI;
      const col=p.kind==='head'?0:p.kind==='tail'?3:1+(Math.floor(sim.elapsed*7-p.index*.45)&1);
      const pivot=row===0?(col===0?[17,17]:col===1?[17,17]:col===2?[16,17]:[15,18]):col===0?[17,16]:col===3?[16,16]:[17,15];
      part.sprite.setFrame(row*4+col).setOrigin(pivot[0]/32,pivot[1]/32).setPosition(p.x,p.y)
        .setScale(WORM.scale).setFlipX(q===2).setRotation(angle).setDepth(p.y+1000).setTint(tint);
      part.shadow.setPosition(p.x,p.y+7).setDepth(p.y+999);
    });
  }
  destroy():void{for(const p of this.parts){p.sprite.destroy();p.shadow.destroy();}this.parts=[];}
}
