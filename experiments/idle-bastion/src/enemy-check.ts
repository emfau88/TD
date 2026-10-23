import Phaser from 'phaser';
import { ENEMIES, type EnemyId } from './enemy-roster';
import { ENEMY_SHEETS, preloadEnemySheets, enemyFrame, enemyFlip, enemyHealFrame, type EnemyDirection } from './enemy-art';
const ids: EnemyId[]=['Leafbug','Scorpion','ForestGoblin','BoneGuard','ForestCultist'];
const narrow=window.innerWidth<600, width=narrow?400:900, height=narrow?560:500;
let age=0,paused=false,zoom=1;
const direction=document.querySelector<HTMLSelectElement>('#direction')!, action=document.querySelector<HTMLSelectElement>('#action')!;
document.querySelector<HTMLButtonElement>('#pause')!.onclick=event=>{paused=!paused;(event.currentTarget as HTMLButtonElement).textContent=paused?'Weiter':'Pause';};
document.querySelector<HTMLButtonElement>('#step')!.onclick=()=>{paused=true;age+=.1;document.querySelector('#pause')!.textContent='Weiter';};
document.querySelector<HTMLButtonElement>('#zoom')!.onclick=event=>{zoom=zoom===1?2:1;(event.currentTarget as HTMLButtonElement).textContent=`Ansicht ${zoom}×`;};
class EnemyCheck extends Phaser.Scene {
  private sprites: Phaser.GameObjects.Image[]=[];
  private shadows: Phaser.GameObjects.Ellipse[]=[];
  private ring!:Phaser.GameObjects.Graphics;
  private points:{x:number;y:number}[]=[];
  preload(){preloadEnemySheets(this);this.load.spritesheet('check-grass',new URL('../../../public/assets/Grass Tileset.png',import.meta.url).href,{frameWidth:64,frameHeight:64});}
  create(){
    this.add.tileSprite(width/2,height/2,width,height,'check-grass',18).setTileScale(.625);
    const g=this.add.graphics();g.fillStyle(0x997b50).fillRoundedRect(12,narrow?15:132,width-24,narrow?530:225,20);g.fillStyle(0xbba06e).fillRoundedRect(18,narrow?21:142,width-36,narrow?518:205,18);
    ids.forEach((id,i)=>{
      const x=narrow?100+i%2*200:90+i*180,y=narrow?105+Math.floor(i/2)*175:240,s=ENEMY_SHEETS[id];this.points.push({x,y});
      this.add.text(x,narrow?y-65:45,ENEMIES[id].name,{fontFamily:'system-ui',fontSize:'17px',color:'#fff5d9',stroke:'#203426',strokeThickness:3}).setOrigin(.5);
      this.add.text(x,narrow?y-40:75,i<2?'SPIRE-Referenz':`Neu · Welle ${ENEMIES[id].firstWave}`,{fontSize:'13px',color:'#f3e6bc',stroke:'#203426',strokeThickness:3}).setOrigin(.5);
      this.shadows.push(this.add.ellipse(x,y+9,23,9,0x203426,.3));
      this.sprites.push(this.add.image(x,y,s.key).setScale(s.scale));
      this.add.text(x,narrow?y+60:415,i===4?'Begrenzte Heilung':i===3?'25 % Rüstung':i===2?'Schneller Bodenläufer':'Originalmaßstab',{fontSize:'13px',color:'#fff5d9',stroke:'#203426',strokeThickness:3}).setOrigin(.5);
    });
    this.ring=this.add.graphics();
  }
  update(_time:number,dt:number){
    if(!paused)age+=Math.min(dt/1000,.1);
    const route=Math.floor(age/2)%4;
    const dir=direction.value==='route'?(['side','down','side','up'] as const)[route]:direction.value==='left'?'side':direction.value as EnemyDirection;
    const left=direction.value==='left'||direction.value==='route'&&route===2;
    this.ring.clear();
    ids.forEach((id,i)=>{
      const x=this.points[i].x+(direction.value==='route'?Math.sin(age*Math.PI/2)*20:0), y=this.points[i].y+(direction.value==='route'?Math.cos(age*Math.PI/2)*22:0);
      const healing=id==='ForestCultist'&&action.value==='heal';
      this.sprites[i].setPosition(x,y).setScale(ENEMY_SHEETS[id].scale*zoom).setFrame(healing?enemyHealFrame(id,dir,age%.4,left):enemyFrame(id,dir,age,left)).setFlipX(enemyFlip(id,dir,left));
      this.shadows[i].setPosition(x,y+9*zoom).setScale(zoom);
      if(healing)this.ring.lineStyle(2,0xa4edb3,.8).strokeEllipse(x,y+9*zoom,35*zoom,14*zoom);
    });
    document.querySelector('#status')!.textContent=`${paused?'Angehalten':'Läuft'} · ${direction.options[direction.selectedIndex].text} · ${zoom}× · ${age.toFixed(1)} s · Originalframes, keine Spiegelung der neuen Figuren`;
  }
}
if(narrow)document.querySelector<HTMLElement>('#preview')!.style.aspectRatio=`${width}/${height}`;
const game=new Phaser.Game({type:Phaser.AUTO,parent:'preview',width,height,pixelArt:true,scale:{mode:Phaser.Scale.FIT,autoCenter:Phaser.Scale.CENTER_BOTH},scene:EnemyCheck});
if(import.meta.hot)import.meta.hot.dispose(()=>game.destroy(true));
