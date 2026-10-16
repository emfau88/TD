import Phaser from 'phaser';
import { ForestScene } from './scene';
import { CELL, WIDTH, HEIGHT, COLS, ROWS, center, pathCells } from './data';
import { prepareStyleAssets, MARA_FOOT } from './style-assets';
import { WoodlandSimulation, type Companion, type CompanionID } from './woodland-simulation';
import { WOODLAND_TREES, WOODLAND_FLOWERS, WOODLAND_ROCKS } from './woodland-world';

type HeroView={sprite:Phaser.GameObjects.Sprite;shadow:Phaser.GameObjects.Ellipse;ring:Phaser.GameObjects.Ellipse;name:Phaser.GameObjects.Text;animation:string};
export class WoodlandScene extends ForestScene {
  declare sim:WoodlandSimulation;
  selectedHero?:CompanionID;
  abilityMode=false;
  private heroViews=new Map<CompanionID,HeroView>();
  private abilityDrawing?:Phaser.GameObjects.Graphics;
  private pending?:WoodlandSimulation;
  protected override createSimulation(){const sim=this.pending??new WoodlandSimulation();this.pending=undefined;return sim;}
  restore(saved:unknown){const sim=WoodlandSimulation.restore(saved);if(!sim)return false;this.pending=sim;this.loadMap(0);this.menu=false;return true;}
  protected override makeTerrainFrames(){
    super.makeTerrainFrames();prepareStyleAssets(this);
    for(const [row,direction]of ['down','left','right','up'].entries())this.anims.create({key:`wood-mara-${direction}-walk`,frames:[row*4+1,row*4+2].map(frame=>({key:'style-mara',frame})),frameRate:6,repeat:-1});
  }
  protected override drawMap(){
    this.heroViews.clear();this.selectedHero=undefined;this.abilityMode=false;
    this.ground=this.add.container(0,0);
    this.terrainKey='woodland-ground';const terrain=this.textures.createCanvas(this.terrainKey,WIDTH,HEIGHT)!,ctx=terrain.context;
    const source=this.textures.get('Grass Tileset').getSourceImage() as HTMLImageElement;ctx.imageSmoothingEnabled=false;
    for(let row=0;row<ROWS;row++)for(let col=0;col<COLS;col++)ctx.drawImage(source,128,64,64,64,col*CELL,row*CELL,CELL,CELL);
    const path=pathCells(this.sim.map.paths[0]);
    for(const key of path){
      const [col,row]=key.split(',').map(Number);if(col<0||col>=COLS)continue;
      const n=path.has(`${col},${row-1}`),s=path.has(`${col},${row+1}`),e=path.has(`${col+1},${row}`),w=path.has(`${col-1},${row}`);
      const [x,y]=n&&e?[320,192]:n&&w?[448,192]:s&&e?[320,64]:s&&w?[448,64]:n||s?[320,128]:[384,64];
      ctx.drawImage(source,x,y,64,64,col*CELL,row*CELL,CELL,CELL);
    }
    terrain.refresh();this.ground.add(this.add.image(0,0,terrain.key).setOrigin(0));this.drawWater();
    this.routeKey='woodland-light';const shade=this.textures.createCanvas(this.routeKey,WIDTH,HEIGHT)!,gradient=shade.context.createLinearGradient(0,0,0,HEIGHT);
    gradient.addColorStop(0,'rgba(20,56,36,.17)');gradient.addColorStop(.45,'rgba(20,56,36,.025)');gradient.addColorStop(1,'rgba(20,56,36,.16)');
    shade.context.fillStyle=gradient;shade.context.fillRect(0,0,WIDTH,HEIGHT);shade.refresh();this.ground.add(this.add.image(0,0,shade.key).setOrigin(0));
    WOODLAND_TREES.forEach(([col,row],index)=>{
      const point=center([col,row]),autumn=(col<5&&row>9)||index%13===0;
      const x=point.x+(index*7%9)-4,y=point.y+12+(index%3)-1;
      this.track(this.add.image(x,y,'Grass Tileset',`${autumn?'autumn':'tree'}-${index%4}`).setOrigin(.5,1).setScale(.78+index%3*.02).setDepth(point.y+1000));
    });
    for(const [col,row]of WOODLAND_FLOWERS){const p=center([col,row]);this.ground.add(this.add.image(p.x,p.y,'Grass Tileset','flowers').setScale(.65));}
    for(const [col,row]of WOODLAND_ROCKS){const p=center([col,row]);this.track(this.add.image(p.x,p.y+10,'Grass Tileset','rock').setOrigin(.5,1).setScale(.65).setDepth(p.y+1000));}
    const goal=center([27,8]);
    const halo=this.track(this.add.circle(goal.x,goal.y,28,0xffd79b,.12).setDepth(900));
    this.tweens.add({targets:halo,alpha:.22,scale:1.08,duration:1800,yoyo:true,repeat:-1});
    this.track(this.add.image(goal.x,goal.y+3,'Tower 08',2).setScale(.65).setOrigin(.5,.78).setDepth(goal.y+1000));
    this.track(this.add.sprite(goal.x,goal.y-39,'Tower 08 - Level 03 - Weapon',0).setScale(.7).setDepth(goal.y+1001));
    this.track(this.add.text(8,7*CELL+8,'➜',{fontSize:'24px',color:'#35533b'}));
    this.abilityDrawing=this.track(this.add.graphics().setDepth(5700));
    for(const hero of this.sim.heroes){
      const sprite=this.track(this.add.sprite(hero.x,hero.y,hero.id==='mara'?'style-mara':'Wisp - Animations',0).setOrigin(.5,hero.id==='mara'?MARA_FOOT[1]/64:51/64).setScale(hero.id==='mara'?1:.9));
      const shadow=this.track(this.add.ellipse(hero.x,hero.y,22,8,0x18382b,.22).setDepth(950));
      const ring=this.track(this.add.ellipse(hero.x,hero.y+2,32,13).setStrokeStyle(1.4,0xffe4a8,.9).setDepth(951));
      const name=this.track(this.add.text(hero.x,hero.y+13,hero.id==='mara'?'Mara':'Wisp',{fontFamily:'system-ui',fontSize:'10px',color:'#fff3cf',stroke:'#20392c',strokeThickness:3}).setOrigin(.5).setDepth(5000));
      this.heroViews.set(hero.id,{sprite,shadow,ring,name,animation:''});
    }
    for(const tower of this.sim.towers)this.refreshTower(tower);
  }
  selectHero(id:CompanionID){this.cancelBuild();this.selected=undefined;this.selectedHero=id;this.abilityMode=false;this.drawRange();this.hooks.changed();}
  override chooseBuild(id:number){this.selectedHero=undefined;this.abilityMode=false;super.chooseBuild(id);}
  override clearSelection(){this.selectedHero=undefined;this.abilityMode=false;super.clearSelection();}
  prepareAbility(){
    const hero=this.sim.heroes.find(h=>h.id===this.selectedHero);if(!hero||this.paused||this.menu||this.sim.phase!=='wave'||hero.cooldown>0)return;
    this.abilityMode=!this.abilityMode;this.hooks.toast(this.abilityMode?(hero.id==='mara'?'Wähle den Turm, den Mara übertakten soll.':'Wähle den Ort für Wisps Ablenkung.'):'Fähigkeitsauswahl aufgehoben.');this.hooks.changed();
  }
  protected override click(col:number,row:number){
    if(this.paused)return;
    if(this.buildId){super.click(col,row);return;}
    const hero=this.sim.heroes.find(h=>Math.floor(h.x/CELL)===col&&Math.floor(h.y/CELL)===row);
    if(hero&&!this.abilityMode){this.selectHero(hero.id);return;}
    const tower=this.sim.towers.find(t=>t.col===col&&t.row===row);
    if(this.selectedHero&&this.abilityMode){
      const order=this.selectedHero==='mara'?(tower?{kind:'overclock' as const,tower:tower.uid}:undefined):{kind:'distract' as const,col,row};
      if(order&&this.sim.command(this.selectedHero,order)){this.abilityMode=false;this.hooks.toast('Unterwegs. Die Fähigkeit wirkt nach der Ankunft.');}
      else this.hooks.toast(this.selectedHero==='mara'?'Wähle einen erreichbaren eigenen Turm.':'Dieses Ziel ist nicht erreichbar.');
    }else if(tower){this.selectedHero=undefined;super.click(col,row);}
    else if(this.selectedHero){if(!this.sim.command(this.selectedHero,{kind:'move',col,row}))this.hooks.toast('Dort ist kein erreichbarer freier Boden.');}
    else super.click(col,row);
    this.hooks.changed();
  }
  private renderHero(hero:Companion){
    const view=this.heroViews.get(hero.id)!;const moving=hero.path.length>0,acting=hero.action>0||hero.pose>0;
    const animation=hero.id==='mara'?(moving?`wood-mara-${hero.direction}-walk`:`style-mara-${hero.direction}-${acting?'action':'idle'}`):`style-wisp-${hero.direction==='left'||hero.direction==='right'?'side':hero.direction}${acting?'-action':''}`;
    if(view.animation!==animation){view.sprite.play(animation);view.animation=animation;}
    view.sprite.setPosition(hero.x,hero.y).setFlipX(hero.id==='wisp'&&hero.direction==='left').setDepth(hero.y+1002);
    view.shadow.setPosition(hero.x,hero.y+1);view.ring.setPosition(hero.x,hero.y+2).setVisible(this.selectedHero===hero.id);view.name.setPosition(hero.x,hero.y+13);
  }
  override update(time:number,delta:number){
    super.update(time,delta);if(!this.sim)return;
    for(const hero of this.sim.heroes)this.renderHero(hero);
    const drawing=this.abilityDrawing;drawing?.clear();if(!drawing)return;
    for(const field of this.sim.distractions){drawing.fillStyle(0xc7edab,.10).fillCircle(field.x,field.y,110);drawing.lineStyle(1.5,0xc7edab,.6).strokeCircle(field.x,field.y,110);}
    for(const tower of this.sim.towers)if(this.sim.boosts.has(tower.uid)){drawing.lineStyle(2,0xffca80,.9).strokeEllipse(tower.x,tower.y+15,42,18);}
    const hero=this.sim.heroes.find(h=>h.id===this.selectedHero),target=hero?.path.at(-1);
    if(target){drawing.lineStyle(1.5,0xffe4a8,.8).strokeEllipse(target.x,target.y+2,24,11);}
    for(const message of this.sim.abilityMessages.splice(0))this.hooks.toast(message);
    if(this.abilityMode&&this.sim.phase!=='wave'){this.abilityMode=false;this.hooks.changed();}
  }
}
