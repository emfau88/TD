import Phaser from 'phaser';
import { ForestScene } from './scene';
import { CELL, WIDTH, HEIGHT, COLS, ROWS, center, pathCells, waterCells } from './data';
import { prepareStyleAssets, MARA_FOOT } from './style-assets';
import { WoodlandSimulation, type Companion, type CompanionID } from './woodland-simulation';
import { REGIONS, marshWaterSource } from './regions';
import { prepareMarshAssets } from './marsh-assets';
import { WIND_LAND } from './wind-world';

const terrainMask=(c:number,r:number,cells:Set<string>)=>Number(cells.has(`${c},${r-1}`))+Number(cells.has(`${c+1},${r}`))*2+Number(cells.has(`${c},${r+1}`))*4+Number(cells.has(`${c-1},${r}`))*8;

type HeroView={sprite:Phaser.GameObjects.Sprite;shadow:Phaser.GameObjects.Ellipse;ring:Phaser.GameObjects.Ellipse;name:Phaser.GameObjects.Text;animation:string};
export class WoodlandScene extends ForestScene {
  declare sim:WoodlandSimulation;
  selectedHero?:CompanionID;
  abilityMode=false;
  private heroViews=new Map<CompanionID,HeroView>();
  private abilityDrawing?:Phaser.GameObjects.Graphics;
  private pending?:WoodlandSimulation;
  get mapZoom(){return this.cameras.main.zoom;}
  private readonly preventWheel=(event:WheelEvent)=>{if(!event.ctrlKey&&!this.menu)event.preventDefault();};
  override create(){
    super.create();
    this.game.canvas.addEventListener('wheel',this.preventWheel,{passive:false});
    this.events.once(Phaser.Scenes.Events.SHUTDOWN,()=>this.game.canvas.removeEventListener('wheel',this.preventWheel));
    this.input.on('wheel',(pointer:Phaser.Input.Pointer,_objects:unknown,dx:number,dy:number)=>{
      if(!this.menu&&!(pointer.event as WheelEvent).ctrlKey&&dy)this.setMapZoom(this.mapZoom+(dy<0?.05:-.05),pointer.x,pointer.y);
    });
    this.input.on('pointermove',(pointer:Phaser.Input.Pointer)=>{
      if(!this.menu&&this.mapZoom>1&&pointer.middleButtonDown()){
        const camera=this.cameras.main;
        camera.setScroll(camera.clampX(camera.scrollX-(pointer.x-pointer.prevPosition.x)/camera.zoom),camera.clampY(camera.scrollY-(pointer.y-pointer.prevPosition.y)/camera.zoom));
      }
    });
  }
  setMapZoom(value:number,x=WIDTH/2,y=HEIGHT/2){
    const camera=this.cameras.main,old=camera.zoom,zoom=Math.round(Phaser.Math.Clamp(value,1,1.2)*100)/100;
    camera.setZoom(zoom);
    camera.setScroll(camera.clampX(camera.scrollX+(x-WIDTH/2)*(1/old-1/zoom)),camera.clampY(camera.scrollY+(y-HEIGHT/2)*(1/old-1/zoom)));
    this.hooks.changed();
  }
  protected override createSimulation(id:number){const sim=this.pending??new WoodlandSimulation(REGIONS[id]?.key);this.pending=undefined;return sim;}
  restore(saved:unknown){const sim=WoodlandSimulation.restore(saved);if(!sim)return false;this.pending=sim;this.loadMap(sim.map.id);this.menu=false;return true;}
  protected override makeTerrainFrames(){
    super.makeTerrainFrames();prepareStyleAssets(this);prepareMarshAssets(this);
    const terrain=this.textures.get('Grass Tileset');
    terrain.add('marsh-bridge-h',0,448,864,192,96);
    terrain.add('marsh-bridge-v',0,696,768,80,192);
    const windDetails=this.textures.get('Windbruch Details v1');
    windDetails.add('bridge-h',0,0,0,160,64);windDetails.add('bridge-v',0,160,0,64,160);
    windDetails.add('crag',0,224,0,64,64);windDetails.add('vines',0,288,0,64,64);
    windDetails.add('rim-top',0,288,0,64,22);
    const info=this.assets['Animated water tiles'],water=this.textures.get('water-terrain');
    for(const [x,y]of [[152,152],[264,152],[152,264],[264,264]]){
      const key=`water-${x}-${y}`;
      const frames=info.frameMap!.map((frame,index)=>{const name=`${key}-${index}`;water.add(name,0,frame*info.width!+x,y,32,32);return {key:'water-terrain',frame:name,duration:info.durations![index]};});
      this.anims.create({key,frames,frameRate:10,repeat:-1});
    }
    for(const [row,direction]of ['down','left','right','up'].entries())this.anims.create({key:`wood-mara-${direction}-walk`,frames:[row*4+1,row*4+2].map(frame=>({key:'style-mara',frame})),frameRate:6,repeat:-1});
  }
  protected override drawMap(){
    this.cameras.main.setBounds(0,0,WIDTH,HEIGHT).setZoom(1).centerOn(WIDTH/2,HEIGHT/2);
    this.heroViews.clear();this.selectedHero=undefined;this.abilityMode=false;
    const region=this.sim.region,marsh=region.key==='lantern-marsh',winter=region.key==='mirror-winter',wind=region.key==='windbreak';
    this.ground=this.add.container(0,0);
    if(wind)this.drawWindSky();
    this.terrainKey='woodland-ground';const terrain=this.textures.createCanvas(this.terrainKey,WIDTH,HEIGHT)!,ctx=terrain.context;
    const source=this.textures.get(winter?'Spiegelwinter Tiles v1':wind?'Windbruch Tiles v1':'Grass Tileset').getSourceImage() as HTMLImageElement;ctx.imageSmoothingEnabled=false;
    const drawTile=(frame:number,c:number,r:number,dy=0)=>ctx.drawImage(source,frame%8*64,Math.floor(frame/8)*64,64,64,c*CELL,r*CELL+dy,CELL,CELL);
    if(wind)for(const key of WIND_LAND){
      const [c,r]=key.split(',').map(Number),frame=36+terrainMask(c,r,WIND_LAND);
      // Vary the lower silhouette in small pixel steps instead of a uniform slab.
      for(let strip=0;strip<20;strip++){
        const depth=25+((c*13+Math.floor(strip/5)*7)%10);
        ctx.drawImage(source,frame%8*64+strip*3.2,Math.floor(frame/8)*64,3.2,64,c*CELL+strip*2,r*CELL+depth,2,CELL);
      }
    }
    for(let row=0;row<ROWS;row++)for(let col=0;col<COLS;col++){
      if(wind){if(WIND_LAND.has(`${col},${row}`))drawTile(4+terrainMask(col,row,WIND_LAND),col,row);}
      else ctx.drawImage(source,winter?0:128,winter?0:64,64,64,col*CELL,row*CELL,CELL,CELL);
    }
    const path=new Set(this.sim.map.paths.flatMap(nodes=>[...pathCells(nodes)]));
    for(const key of path){
      const [col,row]=key.split(',').map(Number);if(col<0||col>=COLS)continue;
      const n=path.has(`${col},${row-1}`),s=path.has(`${col},${row+1}`),e=path.has(`${col+1},${row}`),w=path.has(`${col-1},${row}`);
      if(winter||wind){if(!region.bridgeCells.has(key))drawTile((winter?4:20)+terrainMask(col,row,path),col,row);continue;}
      const [x,y]=n&&e?[320,192]:n&&w?[448,192]:s&&e?[320,64]:s&&w?[448,64]:n||s?[320,128]:[384,64];
      ctx.drawImage(source,x,y,64,64,col*CELL,row*CELL,CELL,CELL);
    }
    terrain.refresh();this.ground.add(this.add.image(0,0,terrain.key).setOrigin(0));
    if(wind)this.drawWindRims(path);
    if(winter)this.drawIce();else if(marsh)this.drawMarshWater();else if(!wind)this.drawWater();
    for(const bridge of region.bridges){
      const horizontal=bridge.direction==='horizontal';
      const key=wind?'Windbruch Details v1':'Grass Tileset',frame=wind?(horizontal?'bridge-h':'bridge-v'):(horizontal?'marsh-bridge-h':'marsh-bridge-v');
      this.ground.add(this.add.image(bridge.col*CELL+(horizontal?60:20),bridge.row*CELL+(horizontal?20:60),key,frame).setScale(wind?1:.625));
    }
    this.routeKey='woodland-light';const shade=this.textures.createCanvas(this.routeKey,WIDTH,HEIGHT)!,gradient=shade.context.createLinearGradient(0,0,0,HEIGHT);
    gradient.addColorStop(0,winter?'rgba(54,88,131,.09)':marsh?'rgba(23,51,47,.28)':'rgba(20,56,36,.17)');gradient.addColorStop(.45,winter?'rgba(54,88,131,0)':marsh?'rgba(23,51,47,.12)':'rgba(20,56,36,.025)');gradient.addColorStop(1,winter?'rgba(54,88,131,.12)':marsh?'rgba(23,51,47,.25)':'rgba(20,56,36,.16)');
    shade.context.fillStyle=gradient;shade.context.fillRect(0,0,WIDTH,HEIGHT);shade.refresh();this.ground.add(this.add.image(0,0,shade.key).setOrigin(0));
    region.trees.forEach(([col,row],index)=>{
      const point=center([col,row]),autumn=!marsh&&((col<5&&row>9)||index%13===0);
      const x=point.x+(index*7%9)-4,y=point.y+12+(index%3)-1;
      this.track(this.add.image(x,y,winter?'Spiegelwinter Sprites v1':'Grass Tileset',winter?index%2:`${autumn?'autumn':'tree'}-${index%4}`).setOrigin(.5,winter?58/64:1).setScale(winter?.95:.78+index%3*.02).setDepth(point.y+1000));
    });
    for(const [col,row]of region.flowers){const p=center([col,row]);this.ground.add(this.add.image(p.x,p.y,'Grass Tileset','flowers').setScale(.65));}
    for(const [col,row]of region.rocks){const p=center([col,row]);this.track(this.add.image(p.x,p.y+10,winter?'Spiegelwinter Sprites v1':'Grass Tileset',winter?2:'rock').setOrigin(.5,winter?58/64:1).setScale(winter?1:.65).setDepth(p.y+1000));}
    for(const [col,row]of region.crystals){
      const p=center([col,row]),crystal=this.track(this.add.image(p.x,p.y+10,wind?'Windbruch Sprites v1':'Spiegelwinter Sprites v1',wind?0:3).setOrigin(.5,58/64).setDepth(p.y+1000));
      if(wind){const glow=this.track(this.add.ellipse(p.x,p.y+6,34,14,0x9ad7dd,.16).setDepth(900));this.tweens.add({targets:glow,alpha:.32,scale:1.12,duration:1900+(col%3)*180,yoyo:true,repeat:-1});this.tweens.add({targets:crystal,alpha:.82,duration:1900,yoyo:true,repeat:-1});}
    }
    for(const [col,row]of region.arches){const p=center([col,row]);this.track(this.add.image(p.x,p.y+10,'Windbruch Sprites v1',3).setOrigin(.5,58/64).setScale(1.15).setDepth(p.y+1000));}
    if(marsh)this.drawMarshProps();
    const goal=center([27,8]);
    const halo=this.track(this.add.circle(goal.x,goal.y,28,0xffd79b,.12).setDepth(900));
    this.tweens.add({targets:halo,alpha:.22,scale:1.08,duration:1800,yoyo:true,repeat:-1});
    this.track(this.add.image(goal.x,goal.y+3,'Tower 08',2).setScale(.65).setOrigin(.5,.78).setDepth(goal.y+1000));
    this.track(this.add.sprite(goal.x,goal.y-39,'Tower 08 - Level 03 - Weapon',0).setScale(.7).setDepth(goal.y+1001));
    for(const nodes of this.sim.map.paths)this.track(this.add.text(8,nodes[0][1]*CELL+8,'➜',{fontSize:'24px',color:winter?'#536e87':'#35533b'}));
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
  private drawWindRims(path:Set<string>){
    for(const key of WIND_LAND){
      const [c,r]=key.split(',').map(Number);
      if(!WIND_LAND.has(`${c},${r-1}`)&&!path.has(key)&&(c+r)%2===0){
        this.ground!.add(this.add.image(c*CELL+20,r*CELL+7,'Windbruch Details v1','rim-top').setOrigin(.5,.7).setScale(.8).setFlipX(c%3===0));
      }
      if(WIND_LAND.has(`${c},${r+1}`)||path.has(key)||this.sim.region.bridgeCells.has(`${c},${r+1}`))continue;
      if((c+r)%2===0){
        this.ground!.add(this.add.image(c*CELL+20,r*CELL+CELL-6+(c%3-1)*2,'Windbruch Details v1','crag').setOrigin(.5,8/64).setScale(.95+(c%3)*.12).setFlipX(c%3===0));
      }
      if((c+r)%3===0){
        this.ground!.add(this.add.image(c*CELL+30,r*CELL+CELL-3,'Windbruch Details v1','vines').setOrigin(.5,8/64).setScale(.72+(c%2)*.16));
      }
    }
  }
  private drawWindSky(){
    if(!this.textures.exists('wind-sky')){
      const texture=this.textures.createCanvas('wind-sky',WIDTH,HEIGHT)!,ctx=texture.context,gradient=ctx.createLinearGradient(0,0,0,HEIGHT);
      gradient.addColorStop(0,'#334865');gradient.addColorStop(.5,'#668a9e');gradient.addColorStop(1,'#a2bfc3');
      ctx.fillStyle=gradient;ctx.fillRect(0,0,WIDTH,HEIGHT);texture.refresh();
    }
    this.ground!.add(this.add.image(0,0,'wind-sky').setOrigin(0));
    for(const [x,y,scale,alpha]of [[120,80,2.8,.4],[420,350,3.2,.3],[920,70,3.1,.4],[1030,590,3.5,.45],[100,570,3,.4],[730,290,2.8,.3]]){
      const cloud=this.add.image(x,y,'Windbruch Sprites v1',2).setScale(scale).setAlpha(alpha);this.ground!.add(cloud);
      this.tweens.add({targets:cloud,x:x+75,y:y+8,duration:14000+x*5,yoyo:true,repeat:-1,ease:'Sine.easeInOut'});
    }
    for(const [x,y,scale]of [[140,95,1.5],[365,555,1.5],[820,130,1.35],[990,585,1.3]]){
      const islet=this.add.image(x,y,'Windbruch Sprites v1',1).setScale(scale);this.ground!.add(islet);
      this.tweens.add({targets:islet,y:y-9,duration:2800+x,yoyo:true,repeat:-1,ease:'Sine.easeInOut'});
    }
  }
  private drawIce(){
    const cells=waterCells(this.sim.map);
    for(const key of cells){const [c,r]=key.split(',').map(Number),mask=Number(cells.has(`${c},${r-1}`))+Number(cells.has(`${c+1},${r}`))*2+Number(cells.has(`${c},${r+1}`))*4+Number(cells.has(`${c-1},${r}`))*8;
      this.ground!.add(this.add.image(c*CELL,r*CELL,'Spiegelwinter Tiles v1',20+mask).setOrigin(0).setScale(.625));}
  }
  private drawMarshWater(){
    const cells=waterCells(this.sim.map),size=CELL/2;
    // Extend edge channels beyond the viewport rather than closing them with a shore.
    const wet=(c:number,r:number)=>cells.has(`${Math.floor(Math.max(0,Math.min(COLS*2-1,c))/2)},${Math.floor(Math.max(0,Math.min(ROWS*2-1,r))/2)}`);
    for(let r=0;r<ROWS*2;r++)for(let c=0;c<COLS*2;c++)if(wet(c,r)){
      const [x,y]=marshWaterSource(c,r,wet),key=`water-${x}-${y}`;
      this.ground!.add(this.add.sprite(c*size,r*size,'water-terrain',`${key}-0`).setOrigin(0).setDisplaySize(size,size).setTint(0xc9dfc8).play(key));
    }
  }
  private drawMarshProps(){
    const region=this.sim.region;
    for(const [name,points,scale]of [['moss',region.moss,.85],['reeds',region.reeds,.8],['stump',region.stumps,.9],['lantern',region.lanterns,1]] as const){
      for(const [col,row]of points){
        const p=center([col,row]);
        if(name==='lantern'){
          const glow=this.add.graphics();
          glow.fillStyle(0xffd080,.045).fillEllipse(p.x+9,p.y-4,68,40);
          glow.fillStyle(0xffd080,.08).fillEllipse(p.x+9,p.y-4,42,28);
          this.ground!.add(glow);
          const flame=this.track(this.add.circle(p.x+11,p.y-7,3,0xffe9ad,.26).setDepth(p.y+1002));
          this.tweens.add({targets:flame,alpha:.12,duration:850+(col%3)*160,yoyo:true,repeat:-1});
        }
        const image=this.add.image(p.x,p.y+10,'marsh-props',name).setOrigin(.5,56/64).setScale(scale);
        if(name==='moss')this.ground!.add(image);else this.track(image.setDepth(p.y+1000));
      }
    }
  }
  selectHero(id:CompanionID){this.cancelBuild();this.selected=undefined;this.selectedHero=id;this.abilityMode=false;this.drawRange();this.hooks.changed();}
  override chooseBuild(id:number){this.selectedHero=undefined;this.abilityMode=false;super.chooseBuild(id);}
  override clearSelection(){this.selectedHero=undefined;this.abilityMode=false;super.clearSelection();}
  prepareAbility(){
    const hero=this.sim.heroes.find(h=>h.id===this.selectedHero);if(!hero||this.paused||this.menu||this.sim.phase!=='wave'||hero.cooldown>0)return;
    this.abilityMode=!this.abilityMode;this.hooks.toast(this.abilityMode?(hero.id==='mara'?'Wähle den Turm, den Mara übertakten soll.':'Wähle den Ort für Wisps Ablenkung.'):'Fähigkeitsauswahl aufgehoben.');this.hooks.changed();
  }
  protected override click(col:number,row:number){
    if(this.paused||this.input.activePointer.middleButtonDown())return;
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
