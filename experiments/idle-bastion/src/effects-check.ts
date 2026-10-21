// Isolated visual fixture using the real renderers; no save or combat progression.
import Phaser from 'phaser';
import { ART, KEYS, SCALE, towerArt, towerMount } from './art';
import { preloadTowerSheets } from './tower-atlas';
import { CombatEffects } from './combat-effects';
import { IlyraView } from './ilyra-view';
import { projectileDepth } from './world-depth';
import type { IdleBattle, Shot } from './battle';
let phase='impact';
for(const button of document.querySelectorAll<HTMLButtonElement>('[data-phase]'))button.onclick=()=>{phase=button.dataset.phase!;};
class EffectsCheck extends Phaser.Scene {
  private fx!:CombatEffects;
  private ilyra!:IlyraView;
  private last='';
  private shot!:Phaser.GameObjects.Image;
  preload(){
    preloadTowerSheets(this);
    for(const [key,url,height] of [[KEYS.tower,ART.tower,128],[KEYS.frostTower,ART.frostTower,192],[KEYS.cannonTower,ART.cannonTower,128],[KEYS.sniperTower,ART.sniperTower,128]] as const)this.load.spritesheet(key,url,{frameWidth:64,frameHeight:height});
    this.load.spritesheet(KEYS.ilyra,ART.ilyra,{frameWidth:64,frameHeight:64});
  }
  create(){
    const ground=this.add.graphics();ground.fillStyle(0x637f48).fillRect(0,0,600,460);ground.fillStyle(0xbda274).fillRect(0,143,600,34).fillRect(0,323,600,34);
    for(const [index,x] of [85,225,365,505].entries()){
      this.tower(x-20,115,index+1);this.tower(x+14,195,index+1);
      this.add.text(x-34,225,['Wald','Frost','Stein','Scharfschütze'][index],{fontSize:'13px',color:'#ffffff'}).setDepth(6000);
    }
    this.tower(320,295,1);this.tower(350,375,1);this.tower(390,375,2);
    this.fx=new CombatEffects(this);this.ilyra=new IlyraView(this);
    this.shot=this.add.image(0,0,towerArt(2).projectile,0).setScale(.5);
  }
  private tower(x:number,y:number,kind:number){
    const art=towerArt(kind),mount=towerMount(kind);
    this.add.image(x,y+mount.baseY,art.base,0).setScale(SCALE.tower).setOrigin(.5,mount.originY).setDepth(y+1000);
    this.add.image(x,y+mount.weaponY,art.weapons[0],0).setScale(SCALE.tower).setDepth(y+1001);
  }
  update(){
    if(!this.fx||this.last===phase)return;this.last=phase;
    this.fx.destroy();
    for(const [index,x] of [85,225,365,505].entries())this.fx.accept([{type:'hit',shot:{uid:index+1,kind:index+1,level:1} as Shot,x,y:160}],1);
    this.fx.update(1.15,new Set(),new Set());
    const age=phase==='windup'?.12:phase==='flight'?.42:.73;
    this.ilyra.update({elapsed:1,ilyra:{x:140,y:350,path:[],direction:'right',cooldown:20,autoCast:false,introduction:'done',volley:{x:350,y:340,originX:140,originY:350,age,hit:phase==='impact'}}} as unknown as IdleBattle);
    const shot={x:350,y:158} as Shot;
    this.shot.setPosition(shot.x,shot.y).setDepth(projectileDepth(shot,{x:345,y:195},{x:365,y:160}));
    document.querySelector('#status')!.textContent=`Ansicht: ${phase} · echte CombatEffects / IlyraView · kein Spielstandzugriff`;
  }
}
const game=new Phaser.Game({type:Phaser.AUTO,parent:'preview',width:600,height:460,pixelArt:true,transparent:false,scale:{mode:Phaser.Scale.FIT,autoCenter:Phaser.Scale.CENTER_BOTH},scene:EffectsCheck});
if(import.meta.hot)import.meta.hot.dispose(()=>game.destroy(true));
