import Phaser from 'phaser';
import { ForestScene } from './scene';
import { Simulation } from './simulation';
import { CELL, center, pathCells, waterCells, type MapDef, type Point } from './data';
import { prepareStyleAssets, MARA_FOOT } from './style-assets';
import { previewPath } from './style-navigation';

export const STYLE_WIDTH=800,STYLE_HEIGHT=480;
export const STYLE_MAP:MapDef={id:0,name:'Waldlichtung',subtitle:'Gemeinsame Grafikprobe',difficulty:'Probe',seed:11,gold:350,
  paths:[[[-1,6],[6,6],[6,3],[11,3],[11,8],[20,8]]],air:[[-1,6],[10,5],[20,8]],water:[[13,3,5,4]]};
type HeroID='wisp'|'mara';
type Direction='down'|'left'|'right'|'up';
type Actor=Point & {id:HeroID;sprite:Phaser.GameObjects.Sprite;ring:Phaser.GameObjects.Ellipse;shadow:Phaser.GameObjects.Ellipse;label:Phaser.GameObjects.Text;path:Point[];direction:Direction;animation:string;action:number;patrol:number};

export class StyleScene extends ForestScene {
  selectedHero?:HeroID;
  actors:Actor[]=[];
  movementDemo=false;
  private pondCells=new Set<string>();
  protected createSimulation(){
    const sim=new Simulation(0);sim.map=STYLE_MAP;sim.blocked=new Set([...pathCells(STYLE_MAP.paths[0]),...waterCells(STYLE_MAP)]);
    const canBuild=sim.canBuild.bind(sim);
    sim.canBuild=(col,row)=>col<STYLE_WIDTH/CELL&&row<STYLE_HEIGHT/CELL&&canBuild(col,row)&&!this.actors.some(a=>Math.floor(a.x/CELL)===col&&Math.floor(a.y/CELL)===row);
    return sim;
  }
  protected makeTerrainFrames(){super.makeTerrainFrames();prepareStyleAssets(this);}
  protected drawMap(){
    this.actors=[];this.selectedHero=undefined;this.movementDemo=false;this.pondCells=waterCells(STYLE_MAP);
    this.ground=this.add.container(0,0);
    this.terrainKey='style-ground';const terrain=this.textures.createCanvas(this.terrainKey,STYLE_WIDTH,STYLE_HEIGHT)!;
    const ctx=terrain.context,source=this.textures.get('Grass Tileset').getSourceImage() as HTMLImageElement;
    ctx.imageSmoothingEnabled=false;
    for(let row=0;row<12;row++)for(let col=0;col<20;col++)ctx.drawImage(source,128,64,64,64,col*CELL,row*CELL,CELL,CELL);
    const route=pathCells(STYLE_MAP.paths[0]);
    for(const key of route){
      const [col,row]=key.split(',').map(Number);if(col<0||col>=20)continue;
      const north=route.has(`${col},${row-1}`),south=route.has(`${col},${row+1}`),east=route.has(`${col+1},${row}`),west=route.has(`${col-1},${row}`);
      const [x,y]=north&&east?[320,192]:north&&west?[448,192]:south&&east?[320,64]:south&&west?[448,64]:north||south?[320,128]:[384,64];
      ctx.drawImage(source,x,y,64,64,col*CELL,row*CELL,CELL,CELL);
    }
    terrain.refresh();this.ground.add(this.add.image(0,0,terrain.key).setOrigin(0));this.drawWater();
    this.routeKey='style-shade';const shade=this.textures.createCanvas(this.routeKey,STYLE_WIDTH,STYLE_HEIGHT)!;
    const gradient=shade.context.createLinearGradient(0,0,0,STYLE_HEIGHT);gradient.addColorStop(0,'rgba(20,56,36,.17)');gradient.addColorStop(.45,'rgba(20,56,36,.025)');gradient.addColorStop(1,'rgba(20,56,36,.16)');
    shade.context.fillStyle=gradient;shade.context.fillRect(0,0,STYLE_WIDTH,STYLE_HEIGHT);shade.refresh();this.ground.add(this.add.image(0,0,shade.key).setOrigin(0));
    const trees=[[1,1],[2,1],[1,2],[3,1],[9,1],[10,1],[11,1],[12,1],[17,1],[18,1],[1,9],[2,10],[3,10],[4,10],[16,10],[17,10],[18,10],[18,2],[15,9],[8,9]];
    trees.forEach(([col,row],index)=>{
      const at=center([col,row]);this.sim.obstacles.add(`${col},${row}`);
      this.track(this.add.image(at.x,at.y+12,'Grass Tileset',`${index%7===0?'autumn':'tree'}-${index%4}`).setOrigin(.5,1).setScale(.8).setDepth(at.y+1000));
    });
    for(const [col,row] of [[3,4],[8,2],[12,9],[18,9],[4,9],[16,2]]){
      const at=center([col,row]);this.ground.add(this.add.image(at.x,at.y,'Grass Tileset','flowers').setScale(.65));
    }
    const goal=center([19,8]);this.sim.obstacles.add('19,8');this.track(this.add.image(goal.x,goal.y+3,'Tower 08',2).setScale(.65).setOrigin(.5,.78).setDepth(goal.y+1000));
    this.track(this.add.sprite(goal.x,goal.y-39,'Tower 08 - Level 03 - Weapon',0).setScale(.7).setDepth(goal.y+1001));
    this.track(this.add.text(12,6*CELL+7,'➜',{fontSize:'24px',color:'#35533b'}));
    this.addHero('wisp',8,6);this.addHero('mara',9,6);
    this.sim.build(1,5,4);this.handleEvents();
    this.selectHero('mara');
  }
  private addHero(id:HeroID,col:number,row:number){
    const at=center([col,row]);
    const sprite=this.track(this.add.sprite(at.x,at.y,id==='mara'?'style-mara':'Wisp - Animations',0));
    sprite.setOrigin(.5,id==='mara'?MARA_FOOT[1]/64:51/64).setScale(id==='mara'?1:.9);
    const shadow=this.track(this.add.ellipse(at.x,at.y,22,8,0x18382b,.22).setDepth(950));
    const ring=this.track(this.add.ellipse(at.x,at.y,32,13).setStrokeStyle(1.5,0xffe4a8,.9).setDepth(951));
    const label=this.track(this.add.text(at.x,at.y+10,id==='mara'?'Mara':'Wisp',{fontFamily:'system-ui',fontSize:'10px',color:'#fff3cf',stroke:'#20392c',strokeThickness:3}).setOrigin(.5).setDepth(5000));
    this.actors.push({...at,id,sprite,shadow,ring,label,path:[],direction:'down',animation:'',action:0,patrol:0});
  }
  selectHero(id:HeroID){this.cancelBuild();this.selected=undefined;this.selectedHero=id;this.drawRange();this.hooks.changed();}
  override chooseBuild(id:number){this.selectedHero=undefined;super.chooseBuild(id);}
  walkable(col:number,row:number){return col>=0&&col<STYLE_WIDTH/CELL&&row>=0&&row<STYLE_HEIGHT/CELL&&!this.pondCells.has(`${col},${row}`)&&!this.sim.obstacles.has(`${col},${row}`)&&!this.sim.towers.some(t=>t.col===col&&t.row===row);}
  moveHero(id:HeroID,col:number,row:number){
    const actor=this.actors.find(a=>a.id===id)!;
    const path=previewPath([Math.floor(actor.x/CELL),Math.floor(actor.y/CELL)],[col,row],(c,r)=>this.walkable(c,r));
    if(!path){this.hooks.toast('Dort ist kein freier Boden. Wähle ein erreichbares Ziel.');return false;}
    actor.path=path;actor.action=0;this.hooks.changed();return true;
  }
  protected override click(col:number,row:number){
    if(this.paused){this.hooks.toast('Setze die Szene zuerst fort.');return;}
    if(this.buildId){super.click(col,row);return;}
    const actor=this.actors.find(a=>Math.floor(a.x/CELL)===col&&Math.floor(a.y/CELL)===row);
    if(actor){this.selectHero(actor.id);return;}
    if(this.selectedHero){this.movementDemo=false;this.moveHero(this.selectedHero,col,row);return;}
    super.click(col,row);
  }
  toggleMovement(){
    this.movementDemo=!this.movementDemo;
    if(this.movementDemo)for(const actor of this.actors){actor.patrol=0;this.moveHero(actor.id,actor.id==='wisp'?8:9,4);}
    else for(const actor of this.actors)actor.path=[];
    this.hooks.changed();
  }
  showAction(){const actor=this.actors.find(a=>a.id===this.selectedHero);if(!actor)return;this.movementDemo=false;actor.path=[];actor.action=1.2;this.hooks.changed();}
  override update(time:number,delta:number){
    super.update(time,delta);
    const dt=this.paused||this.menu?0:Math.min(delta/1000,.08)*this.speed;
    for(const actor of this.actors){
      actor.action=Math.max(0,actor.action-dt);
      if(actor.path.length&&dt){
        // Retarget from the current location when a newly placed tower blocks a route.
        const end=actor.path.at(-1)!;
        if(actor.path.some(p=>!this.walkable(Math.floor(p.x/CELL),Math.floor(p.y/CELL)))){
          const path=previewPath([Math.floor(actor.x/CELL),Math.floor(actor.y/CELL)],[Math.floor(end.x/CELL),Math.floor(end.y/CELL)],(c,r)=>this.walkable(c,r));
          actor.path=path??[];
        }
        let distance=dt*(actor.id==='wisp'?90:80);
        while(actor.path.length&&distance>0){
          const target=actor.path[0],dx=target.x-actor.x,dy=target.y-actor.y,length=Math.hypot(dx,dy);
          actor.direction=Math.abs(dx)>Math.abs(dy)?dx<0?'left':'right':dy<0?'up':'down';
          const step=Math.min(distance,length);if(length){actor.x+=dx/length*step;actor.y+=dy/length*step;}distance-=step;
          if(length<=step+.001)actor.path.shift();
        }
      }
      if(this.movementDemo&&!actor.path.length&&dt){
        const shift=actor.id==='mara'?1:0,points=[[8+shift,4],[9+shift,4],[9+shift,7],[8+shift,7]];
        actor.patrol=(actor.patrol+1)%points.length;this.moveHero(actor.id,...points[actor.patrol] as [number,number]);
      }
      const moving=actor.path.length>0;
      const animation=actor.id==='mara'?`style-mara-${actor.direction}-${actor.action?'action':moving?'walk':'idle'}`:
        `style-wisp-${actor.direction==='left'||actor.direction==='right'?'side':actor.direction}${actor.action?'-action':''}`;
      if(actor.animation!==animation){actor.sprite.play(animation);actor.animation=animation;}
      actor.sprite.setFlipX(actor.id==='wisp'&&actor.direction==='left').setPosition(actor.x,actor.y).setDepth(actor.y+1002);
      actor.shadow.setPosition(actor.x,actor.y+1);actor.ring.setPosition(actor.x,actor.y+2).setVisible(this.selectedHero===actor.id);
      actor.label.setPosition(actor.x,actor.y+13);
    }
  }
}
