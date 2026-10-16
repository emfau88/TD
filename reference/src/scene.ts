import Phaser from 'phaser';
import { CELL,COLS,ROWS,WIDTH,HEIGHT,TOWERS,pathCells,waterCells,seeded,center } from './data';
import { assetUrl } from './assets';
import { Simulation,stats, type Enemy,type Tower,type Event } from './simulation';
import { TREE_FRAMES, WATER_TILE_SIZE, waterTileSource, clearWaterBackdrop } from './terrain';

export type AssetInfo={width?:number;height?:number;frames?:number;cols?:number;rows?:number;sheetWidth:number;sheetHeight:number;frameMap?:number[];durations?:number[];tags?:{name:string;start:number;end:number}[]};
export type Assets=Record<string,AssetInfo>;
export type GameHooks={ready:()=>void; changed:()=>void; event:(event:Event)=>void; select:(tower?:Tower)=>void; toast:(message:string)=>void;};
type EnemyView={sprite:Phaser.GameObjects.Sprite;shadow:Phaser.GameObjects.Ellipse;bar:Phaser.GameObjects.Graphics;anim:string};
type TowerView={base:Phaser.GameObjects.Image;weapon:Phaser.GameObjects.Sprite;level:Phaser.GameObjects.Text};

export class ForestScene extends Phaser.Scene {
  sim!:Simulation; hooks!:GameHooks; assets!:Assets; buildId?:number; selected?:number;
  private isPaused=false;private gameSpeed=1;private inMenu=true;
  get paused(){return this.isPaused;}
  set paused(value:boolean){this.isPaused=value;this.syncClocks();this.refreshPreview();}
  get speed(){return this.gameSpeed;}
  set speed(value:number){this.gameSpeed=value;this.syncClocks();}
  get menu(){return this.inMenu;}
  set menu(value:boolean){this.inMenu=value;this.syncClocks();this.refreshPreview();}
  protected ground?:Phaser.GameObjects.Container; private towerViews=new Map<number,TowerView>();private enemyViews=new Map<number,EnemyView>();private shotViews=new Map<number,Phaser.GameObjects.Sprite|Phaser.GameObjects.Arc>();
  private cursor!:Phaser.GameObjects.Graphics;private ranges!:Phaser.GameObjects.Graphics;private effects!:Phaser.GameObjects.Graphics;private ghost?:Phaser.GameObjects.Image;
  private ticks=0; private lastUi=0;protected terrainKey?:string;protected routeKey?:string;private temporaryObjects=new Set<Phaser.GameObjects.GameObject>();
  private readonly preventContextMenu:EventListener=event=>event.preventDefault();
  constructor(assets:Assets,hooks:GameHooks){super('Forest');this.assets=assets;this.hooks=hooks;}
  preload(){
    for(const [name,info] of Object.entries(this.assets)){
      const url=assetUrl(name);
      if(info.width&&info.height&&info.cols&&info.rows)this.load.spritesheet(name,url,{frameWidth:info.width,frameHeight:info.height});else this.load.image(name,url);
    }
  }
  create(){
    this.makeAnimations();this.makeTerrainFrames();
    this.ranges=this.add.graphics().setDepth(6000);this.cursor=this.add.graphics().setDepth(6001);this.effects=this.add.graphics().setDepth(7000);
    this.input.on('pointermove',(pointer:Phaser.Input.Pointer)=>this.hover(pointer.worldX,pointer.worldY));
    this.input.on('pointerdown',(pointer:Phaser.Input.Pointer)=>{if(this.menu||this.sim.phase==='victory'||this.sim.phase==='defeat')return;if(pointer.rightButtonDown()){this.cancelBuild();return;}this.click(Math.floor(pointer.worldX/CELL),Math.floor(pointer.worldY/CELL));});
    this.input.on(Phaser.Input.Events.GAME_OUT,()=>this.hidePreview());
    this.game.canvas.addEventListener('contextmenu',this.preventContextMenu);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN,()=>{this.clearWorld();this.game.canvas.removeEventListener('contextmenu',this.preventContextMenu);this.anims.globalTimeScale=1;});
    this.loadMap(0);this.hooks.ready();
  }
  private syncClocks(){const timeScale=this.paused||this.menu?0:this.speed;if(this.anims)this.anims.globalTimeScale=timeScale;if(this.tweens)this.tweens.timeScale=timeScale;}
  protected track<ObjectType extends Phaser.GameObjects.GameObject>(object:ObjectType):ObjectType{this.temporaryObjects.add(object);object.once(Phaser.GameObjects.Events.DESTROY,()=>this.temporaryObjects.delete(object));return object;}
  private clearWorld(){
    this.tweens.killAll();for(const object of [...this.temporaryObjects])object.destroy();this.temporaryObjects.clear();
    this.ground?.destroy(true);this.ground=undefined;
    for(const view of this.towerViews.values()){view.base.destroy();view.weapon.destroy();view.level.destroy();}this.towerViews.clear();
    for(const view of this.enemyViews.values()){view.sprite.destroy();view.shadow.destroy();view.bar.destroy();}this.enemyViews.clear();
    for(const shot of this.shotViews.values())shot.destroy();this.shotViews.clear();
    if(this.terrainKey){this.textures.remove(this.terrainKey);this.terrainKey=undefined;}
    if(this.routeKey){this.textures.remove(this.routeKey);this.routeKey=undefined;}
  }
  private makeAnimations(){
    for(const [name,info] of Object.entries(this.assets)){
      if(!info.width||!info.frameMap)continue;
      const make=(key:string,start:number,end:number,repeat=-1)=>{
        if(this.anims.exists(key))return;
        const frames=info.frameMap!.slice(start,end+1).filter(frame=>frame<info.cols!*info.rows!);
        if(!frames.length)return;
        this.anims.create({key,frames:frames.map((frame,i)=>({key:name,frame,duration:info.durations?.[start+i]??100})),repeat});
      };
      const directions=info.tags?.filter(t=>['Down','Up','Side','Right','Left'].includes(t.name));
      if(directions?.length===9){
        for(let row=0;row<9;row++){const tag=directions[row];make(`${name}-${row<3?'idle':row<6?'move':'death'}-${['down','up','side'][row%3]}`,tag.start,tag.end,row>=6?0:-1);}
      }else if(name==='Wisp - Animations'){make('wisp',0,8);make('wisp-summon',27,35,0);}
      else if(name==='Tower Construction'){const transitions=info.tags?.filter(tag=>tag.name==='Transition')??[];transitions.forEach((tag,index)=>make(`construction-${index+1}`,tag.start,tag.end,0));}
      else if(name.includes('Weapon')){
        const idle=info.tags?.find(t=>t.name==='Idle');
        if(idle)make(`${name}-idle`,idle.start,idle.end);
        const start=idle?idle.end+1:0;make(`${name}-attack`,start,info.frames!-1,0);
      }else if(name.includes('Impact')||name.includes('Projectile')||name==='Tower - Collapse')make(`${name}-play`,0,info.frames!-1,name.includes('Projectile')&&!name.includes('Impact')?-1:0);
    }
  }
  protected makeTerrainFrames(){
    const texture=this.textures.get('Grass Tileset');
    const frames:Record<string,[number,number,number,number]>={grass:[64,64,64,64],sand:[128,128,64,64],...TREE_FRAMES,rock:[832,768,64,64],flowers:[704,576,64,64],bridge:[704,768,64,192]};
    for(const [name,[x,y,w,h]] of Object.entries(frames))if(!texture.has(name))texture.add(name,0,x,y,w,h);
    const info=this.assets['Animated water tiles'];
    if(!this.textures.exists('water-terrain')){
      const copy=this.textures.createCanvas('water-terrain',info.sheetWidth,info.sheetHeight)!;
      copy.context.drawImage(this.textures.get('Animated water tiles').getSourceImage() as HTMLImageElement,0,0);
      const pixels=copy.context.getImageData(0,0,info.sheetWidth,info.sheetHeight);
      clearWaterBackdrop(pixels.data,info.sheetWidth,info.width!,info.height!);
      copy.context.putImageData(pixels,0,0);copy.refresh();
    }
    const water=this.textures.get('water-terrain');
    // A 4x4 sample covers corners, both edge variants and four interior tiles.
    for(let row=0;row<4;row++)for(let col=0;col<4;col++){
      const [x,y]=waterTileSource(col,row,4,4),key=`water-${x}-${y}`;
      if(this.anims.exists(key))continue;
      const animationFrames=info.frameMap!.map((sheetFrame,index)=>{
        const name=`${key}-${index}`;
        water.add(name,0,sheetFrame*info.width!+x,y,WATER_TILE_SIZE,WATER_TILE_SIZE);
        return {key:'water-terrain',frame:name,duration:info.durations![index]};
      });
      this.anims.create({key,frames:animationFrames,frameRate:10,repeat:-1});
    }
  }
  protected drawWater(){
    for(const [x,y,w,h] of this.sim.map.water){
      const cols=w*2,rows=h*2,size=CELL/2;
      for(let row=0;row<rows;row++)for(let col=0;col<cols;col++){
        const [sx,sy]=waterTileSource(col,row,cols,rows),key=`water-${sx}-${sy}`;
        this.ground!.add(this.add.sprite(x*CELL+col*size,y*CELL+row*size,'water-terrain',`${key}-0`)
          .setOrigin(0).setDisplaySize(size,size).play(key));
      }
    }
  }
  protected createSimulation(id:number){return new Simulation(id);}
  loadMap(id:number){
    this.clearWorld();this.ticks=0;this.lastUi=0;this.effects.clear();
    this.sim=this.createSimulation(id);this.paused=false;this.speed=1;this.selected=undefined;this.cancelBuild();this.hooks.select();
    this.drawMap();this.hooks.changed();
  }
  protected drawMap(){
    const map=this.sim.map,random=seeded(map.seed),paths=new Set(map.paths.flatMap(p=>[...pathCells(p)])),water=waterCells(map);
    this.ground=this.add.container(0,0).setDepth(0);
    this.terrainKey='forest-terrain';const canvas=this.textures.createCanvas(this.terrainKey,WIDTH,HEIGHT)!;
    let ctx=canvas.context;const source=this.textures.get('Grass Tileset').getSourceImage() as HTMLImageElement;
    ctx.imageSmoothingEnabled=false;
    for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++)ctx.drawImage(source,64,64,64,64,c*CELL,r*CELL,CELL,CELL);
    for(let i=0;i<1800;i++){const x=random()*WIDTH,y=random()*HEIGHT;ctx.fillStyle=random()>.5?'rgba(217,233,138,.18)':'rgba(42,91,46,.12)';ctx.fillRect(x,y,2,2);}
    // Preserve the existing scenery positions: the old pond decoration consumed
    // 66 random numbers per pond before the trees were placed.
    for(let i=0;i<map.water.length*66;i++)random();
    canvas.refresh();this.ground.add(this.add.image(0,0,canvas.key).setOrigin(0));
    this.drawWater();
    // Paths and bridge must sit above opaque water; shade both grass sources alike.
    this.routeKey='forest-routes';const routes=this.textures.createCanvas(this.routeKey,WIDTH,HEIGHT)!;
    ctx=routes.context;ctx.imageSmoothingEnabled=false;
    const shade=ctx.createLinearGradient(0,0,0,HEIGHT);shade.addColorStop(0,'rgba(20,56,36,.19)');shade.addColorStop(.4,'rgba(20,56,36,0)');shade.addColorStop(1,'rgba(20,56,36,.15)');ctx.fillStyle=shade;ctx.fillRect(0,0,WIDTH,HEIGHT);
    ctx.strokeStyle='#b28256';ctx.lineWidth=48;ctx.lineJoin='round';ctx.lineCap='round';
    for(const nodes of map.paths){ctx.beginPath();nodes.forEach(([c,r],i)=>i?ctx.lineTo(c*CELL+20,r*CELL+20):ctx.moveTo(c*CELL+20,r*CELL+20));ctx.stroke();}
    ctx.strokeStyle='#e8b87f';ctx.lineWidth=40;
    for(const nodes of map.paths){ctx.beginPath();nodes.forEach(([c,r],i)=>i?ctx.lineTo(c*CELL+20,r*CELL+20):ctx.moveTo(c*CELL+20,r*CELL+20));ctx.stroke();}
    for(const key of paths){const[c,r]=key.split(',').map(Number);if(c<0||c>=COLS)continue;ctx.globalAlpha=.5;ctx.drawImage(source,128,128,64,64,c*CELL+3,r*CELL+3,CELL-6,CELL-6);ctx.globalAlpha=1;}
    if(map.id===1){for(let c=13;c<=17;c++){ctx.fillStyle='#bb845b';ctx.fillRect(c*CELL,7*CELL-2,CELL,44);ctx.strokeStyle='#815e50';ctx.lineWidth=2;for(let x=c*CELL;x<(c+1)*CELL;x+=8){ctx.beginPath();ctx.moveTo(x,7*CELL);ctx.lineTo(x,8*CELL);ctx.stroke();}ctx.fillStyle='#b5c0bb';ctx.fillRect(c*CELL,7*CELL-4,CELL,5);ctx.fillRect(c*CELL,8*CELL-1,CELL,5);}}
    routes.refresh();this.ground.add(this.add.image(0,0,routes.key).setOrigin(0));
    for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++){
      const key=`${c},${r}`,edge=c===0||r===0||c===COLS-1||r===ROWS-1;
      const nearPath=[...paths].some(p=>{const[x,y]=p.split(',').map(Number);return Math.abs(x-c)+Math.abs(y-r)<=1;});
      if(paths.has(key)||water.has(key)||nearPath)continue;
      if(edge||random()<.075){const autumn=random()<.18,variant=autumn?(c+r)%4:(random()<.5?0:1)+2*((c+r)%2);const tree=this.add.image(c*CELL+20,r*CELL+37,'Grass Tileset',`${autumn?'autumn':'tree'}-${variant}`).setOrigin(.5,1).setScale(.68+random()*.16).setDepth(r*CELL+35);this.sim.obstacles.add(key);this.ground.add(tree);}
      else if(random()<.1){this.ground.add(this.add.image(c*CELL+20,r*CELL+20,'Grass Tileset','flowers').setScale(.65).setAlpha(.8));}
    }
    // Landmark at the end of every route.
    const goal=center([27,8]);const aura=this.add.circle(goal.x,goal.y-10,32,0xc0eabc,.16);this.ground.add(aura);
    this.ground.add(this.add.image(goal.x,goal.y+3,'Tower 08',2).setScale(.65).setOrigin(.5,.78));
    this.ground.add(this.add.sprite(goal.x,goal.y-39,'Tower 08 - Level 03 - Weapon',0).setScale(.7));
    const label=this.add.text(goal.x-16,goal.y+31,'SPIRE',{fontFamily:'monospace',fontSize:'9px',color:'#f7edc9',backgroundColor:'#294b38',padding:{x:6,y:4}});this.ground.add(label);
    for(const route of map.paths){const entry=center([0,route[0][1]]);const gate=this.add.graphics();gate.fillStyle(0x2b4b39,.8);gate.fillRoundedRect(2,entry.y-15,47,30,4);gate.lineStyle(1,0xdac087,.5);gate.strokeRoundedRect(2,entry.y-15,47,30,4);this.ground.add(gate);this.ground.add(this.add.text(12,entry.y-9,'➜',{fontSize:'20px',color:'#f4d997'}));}
    const wisp=this.add.sprite(goal.x-51,goal.y+3,'Wisp - Animations',0).setScale(.75).play('wisp');this.ground.add(wisp);
    this.tweens.add({targets:aura,alpha:.3,scale:1.15,duration:1800,yoyo:true,repeat:-1});
  }
  chooseBuild(id:number){if(!TOWERS.some(tower=>tower.id===id))return;this.buildId=id;this.selected=undefined;this.hooks.select();this.ghost?.destroy();this.ghost=this.add.image(-100,-100,`Tower ${String(id).padStart(2,'0')}`,0).setScale(.63).setOrigin(.5,this.assets[`Tower ${String(id).padStart(2,'0')}`].height===192?.81:.8).setAlpha(.5).setDepth(6002);this.refreshPreview();this.hooks.changed();}
  cancelBuild(){this.buildId=undefined;this.ghost?.destroy();this.ghost=undefined;this.cursor?.clear();this.drawRange();this.hooks.select(this.sim?.towers.find(tower=>tower.uid===this.selected));this.hooks.changed();}
  clearSelection(){this.selected=undefined;this.cancelBuild();this.hooks.select();}
  protected click(col:number,row:number){
    const existing=this.sim.towers.find(t=>t.col===col&&t.row===row);
    if(existing){this.cancelBuild();this.selected=existing.uid;this.drawRange();this.hooks.select(existing);this.hooks.changed();return;}
    if(this.buildId){if(this.paused){this.hooks.toast('Zum Bauen zuerst das Spiel fortsetzen.');return;}const def=TOWERS[this.buildId-1];if(this.sim.gold<def.cost){this.hooks.toast('Nicht genug Gold für diesen Turm.');return;}if(!this.sim.canBuild(col,row)){this.hooks.toast('Baue auf einer freien Wiese neben dem Weg.');return;}const tower=this.sim.build(this.buildId,col,row);if(tower){this.handleEvents();this.hooks.changed();this.hover(col*CELL+20,row*CELL+20);}return;}
    this.selected=undefined;this.drawRange();this.hooks.select();this.hooks.changed();
  }
  private hidePreview(){this.cursor?.clear();this.ghost?.setVisible(false);if(this.menu)this.ranges?.clear();else this.drawRange();}
  private refreshPreview(){if(!this.sim||!this.cursor||!this.input)return;if(this.menu||!this.input.isOver){this.hidePreview();return;}const point=this.input.activePointer.positionToCamera(this.cameras.main) as Phaser.Math.Vector2;this.hover(point.x,point.y);}
  private hover(x:number,y:number){
    this.cursor.clear();this.ranges.clear();if(this.menu||x<0||y<0||x>=WIDTH||y>=HEIGHT){this.hidePreview();return;}
    this.drawRange();if(!this.buildId)return;
    const col=Math.floor(x/CELL),row=Math.floor(y/CELL),point=center([col,row]),valid=!this.paused&&this.sim.canBuild(col,row)&&this.sim.gold>=TOWERS[this.buildId-1].cost;
    const color=valid?0xe4e9b0:0xea8674;
    this.cursor.lineStyle(2,color,.95).strokeRoundedRect(col*CELL+2,row*CELL+2,CELL-4,CELL-4,4);this.cursor.fillStyle(color,.12).fillRoundedRect(col*CELL+2,row*CELL+2,CELL-4,CELL-4,4);
    this.ranges.lineStyle(1,color,.5).strokeCircle(point.x,point.y,TOWERS[this.buildId-1].range);this.ranges.fillStyle(color,.055).fillCircle(point.x,point.y,TOWERS[this.buildId-1].range);
    this.ghost?.setVisible(true).setPosition(point.x,point.y+13).setTint(color);
  }
  drawRange(){this.ranges?.clear();const tower=this.sim?.towers.find(t=>t.uid===this.selected);if(tower){this.ranges.fillStyle(0xe9dba0,.07).fillCircle(tower.x,tower.y,stats(tower).range);this.ranges.lineStyle(1.5,0xe9dba0,.7).strokeCircle(tower.x,tower.y,stats(tower).range);this.ranges.lineStyle(2,0xf4e4ab,1).strokeRoundedRect(tower.col*CELL+1,tower.row*CELL+1,38,38,5);}}
  handleEvents(){for(const event of this.sim.drainEvents()){
    this.hooks.event(event);
    if(event.type==='build'||event.type==='upgrade'){this.refreshTower(event.tower!);this.puff(event.x!,event.y!,0xe9dcad);this.playEffect('Tower Construction',`construction-${event.tower!.level}`,event.x!,event.y!+29,.63,.75);if(event.type==='build'){const wisp=this.track(this.add.sprite(event.x!,event.y!+12,'Wisp - Animations',0).setDepth(6200).setScale(.7).play('wisp-summon'));this.tweens.add({targets:wisp,y:event.y!-25,alpha:0,duration:950,onComplete:()=>wisp.destroy()});}}
    if(event.type==='sell'){const view=this.towerViews.get(event.tower!.uid);view?.base.destroy();view?.weapon.destroy();view?.level.destroy();this.towerViews.delete(event.tower!.uid);this.playEffect('Tower - Collapse','Tower - Collapse-play',event.x!,event.y!,.55,.6);this.puff(event.x!,event.y!,0xdac99d);if(this.selected===event.tower!.uid){this.selected=undefined;this.hooks.select();this.drawRange();}}
    if(event.type==='fire'){const view=this.towerViews.get(event.tower!.uid);const key=`${this.weaponKey(event.tower!)}-attack`,animation=this.anims.get(key);if(view&&animation)view.weapon.play({key,frameRate:animation.frames.length/(stats(event.tower!).cooldown*.85)});}
    if(event.type==='hit'){const tower=event.shot!.tower,id=String(tower.def.id).padStart(2,'0'),prefix=`Tower ${id} - ${tower.def.id===7?'Level X':`Level ${String(tower.level).padStart(2,'0')}`}`;const key=tower.def.id===8?`${prefix} - Projectile`:[1,6].includes(tower.def.id)?`Tower ${id} - Weapon - Impact`:`${prefix} - Projectile - Impact`;if(!this.playEffect(key,`${key}-play`,event.x!,event.y!,tower.def.id===8?.32:.6))this.puff(event.x!,event.y!,tower.def.color,tower.def.splash?18:7);if(tower.def.chain){const line=this.track(this.add.graphics().setDepth(6500));line.lineStyle(2,0xbaf6ff,1);const links=[tower,...event.links!];for(let i=1;i<links.length;i++){line.beginPath().moveTo(links[i-1].x,links[i-1].y).lineTo(links[i].x,links[i].y).strokePath();}this.tweens.add({targets:line,alpha:0,duration:180,onComplete:()=>line.destroy()});}}
    if(event.type==='kill'){this.floating(event.x!,event.y!-16,`+${event.amount}`, '#fff0a5');this.removeEnemy(event.enemy!,true);}
    if(event.type==='escape'){this.removeEnemy(event.enemy!,false);this.puff(event.x!,event.y!,0xeb8879,16);}
  }this.refreshPreview();}
  private playEffect(texture:string,animation:string,x:number,y:number,scale:number,origin=.5){if(!this.textures.exists(texture)||!this.anims.exists(animation))return false;const sprite=this.track(this.add.sprite(x,y,texture).setScale(scale).setOrigin(.5,origin).setDepth(6500));sprite.once(Phaser.Animations.Events.ANIMATION_COMPLETE,()=>sprite.destroy());sprite.play({key:animation,repeat:0});return true;}
  private weaponKey(tower:Tower){return`Tower ${String(tower.def.id).padStart(2,'0')} - Level ${String(tower.level).padStart(2,'0')} - Weapon`;}
  private refreshTower(tower:Tower){
    const id=String(tower.def.id).padStart(2,'0'),weaponKey=this.weaponKey(tower),baseInfo=this.assets[`Tower ${id}`];
    let view=this.towerViews.get(tower.uid);
    if(!view){view={base:this.add.image(tower.x,tower.y+13,`Tower ${id}`,tower.level-1).setOrigin(.5,.8).setScale(.63),weapon:this.add.sprite(tower.x,tower.y-23,weaponKey,0).setScale(.63),level:this.add.text(tower.x,tower.y+13,'',{fontFamily:'monospace',fontSize:'9px',color:'#faf0cf',backgroundColor:'#294935',padding:{x:3,y:1}}).setOrigin(.5)};this.towerViews.set(tower.uid,view);const weapon=view.weapon;weapon.on(Phaser.Animations.Events.ANIMATION_COMPLETE,()=>{const idle=`${this.weaponKey(tower)}-idle`;if(this.anims.exists(idle))weapon.play(idle);else weapon.setFrame(0);});}
    view.base.setFrame(tower.level-1);view.weapon.stop().setTexture(weaponKey,0);
    // Bases of crystal towers occupy a taller frame, so their anchor differs.
    view.base.setOrigin(.5,baseInfo.height===192?.81:.8);view.weapon.setPosition(tower.x,tower.y-(baseInfo.height===192?34:23));
    view.level.setText(['I','II','III'][tower.level-1]);view.base.setDepth(tower.y+1000);view.weapon.setDepth(tower.y+1001);view.level.setDepth(tower.y+1002);
    const idle=`${weaponKey}-idle`;if(this.anims.exists(idle))view.weapon.play(idle);
    this.drawRange();
  }
  private removeEnemy(enemy:Enemy,death:boolean){const view=this.enemyViews.get(enemy.uid);if(!view)return;view.bar.destroy();view.shadow.destroy();this.enemyViews.delete(enemy.uid);const key=`${enemy.def.id}-death-${enemy.direction}`;if(death&&this.anims.exists(key)){this.track(view.sprite);view.sprite.once(Phaser.Animations.Events.ANIMATION_COMPLETE,()=>view.sprite.destroy());view.sprite.play(key);}else view.sprite.destroy();}
  private puff(x:number,y:number,color:number,radius=10){const ring=this.track(this.add.circle(x,y,radius,color,.35).setDepth(6500));this.tweens.add({targets:ring,scale:2.1,alpha:0,duration:250,onComplete:()=>ring.destroy()});}
  private floating(x:number,y:number,text:string,color:string){const label=this.track(this.add.text(x,y,text,{fontFamily:'monospace',fontSize:'11px',fontStyle:'bold',color,stroke:'#304a32',strokeThickness:2}).setOrigin(.5).setDepth(6800));this.tweens.add({targets:label,y:y-25,alpha:0,duration:850,onComplete:()=>label.destroy()});}
  update(_time:number,delta:number){
    this.ticks+=this.paused||this.menu?0:delta*this.speed;
    if(this.sim&&!this.paused&&!this.menu){const duration=Math.min(delta/1000,.08)*this.speed;const steps=Math.ceil(duration/.025);for(let i=0;i<steps;i++)this.sim.update(duration/steps);this.handleEvents();}
    if(!this.sim)return;
    for(const tower of this.sim.towers){const view=this.towerViews.get(tower.uid);if(view&&[1,3,4,6].includes(tower.def.id))view.weapon.setRotation(tower.angle);}
    for(const enemy of this.sim.enemies){
      let view=this.enemyViews.get(enemy.uid);
      if(!view){view={sprite:this.add.sprite(enemy.x,enemy.y,enemy.def.id).setScale(enemy.def.id==='Firewasp'?.65:.83),shadow:this.add.ellipse(enemy.x,enemy.y+12,23,9,0x263e30,.24),bar:this.add.graphics(),anim:''};this.enemyViews.set(enemy.uid,view);}
      const key=`${enemy.def.id}-move-${enemy.direction}`;
      if(view.anim!==key&&this.anims.exists(key)){view.sprite.play(key);view.anim=key;}
      const bob=enemy.def.flying?Math.sin(this.ticks*.007+enemy.uid)*3-11:0;
      view.sprite.setPosition(enemy.x,enemy.y+bob).setFlipX(enemy.flip).setDepth(enemy.y+(enemy.def.flying?4000:2000)).setTint(enemy.slowTime>0?0xb9ecff:enemy.burnTime>0?0xffd3a6:0xffffff);
      if(enemy.boss)view.sprite.setScale(1.15);view.shadow.setPosition(enemy.x,enemy.y+9).setDepth(1000);
      const barY=enemy.y-25+bob;view.bar.clear().setDepth(5000);if(enemy.hp<enemy.maxHp||enemy.boss){view.bar.fillStyle(0x263f33,.85).fillRoundedRect(enemy.x-17,barY,34,5,2);view.bar.fillStyle(enemy.boss?0xf2b473:0xdde69c,1).fillRoundedRect(enemy.x-16,barY+1,32*enemy.hp/enemy.maxHp,3,1);}
    }
    const liveShots=new Set<number>();for(const shot of this.sim.shots){liveShots.add(shot.uid);let sprite=this.shotViews.get(shot.uid);if(!sprite){const tower=shot.tower,id=String(tower.def.id).padStart(2,'0'),key=`Tower ${id} - ${tower.def.id===7?'Level X':`Level ${String(tower.level).padStart(2,'0')}`} - Projectile`;if(this.textures.exists(key)&&tower.def.id!==8){sprite=this.add.sprite(shot.x,shot.y,key,0).setScale(tower.def.id===3?.65:.45);const animation=`${key}-play`;if(this.anims.exists(animation))sprite.play(animation);}else sprite=this.add.circle(shot.x,shot.y,tower.def.id===8?6:3,tower.def.color);sprite.setDepth(5500);this.shotViews.set(shot.uid,sprite);}const target=this.sim.enemies.find(e=>e.uid===shot.target);sprite.setPosition(shot.x,shot.y);if(target)sprite.setRotation(Math.atan2(target.y-shot.y,target.x-shot.x)+Math.PI/2);}
    for(const[id,sprite]of this.shotViews)if(!liveShots.has(id)){sprite.destroy();this.shotViews.delete(id);}
    if(_time-this.lastUi>150){this.lastUi=_time;this.refreshPreview();this.hooks.changed();}
  }
}
