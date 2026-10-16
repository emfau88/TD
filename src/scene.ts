import Phaser from 'phaser';
import { CELL,WIDTH,HEIGHT,TOWERS,center,type HeroID } from './data';
import { assetUrl } from './assets';
import { Simulation,stats,MARA_FIRE_RATE, type Enemy,type Tower,type Event } from './simulation';
import { CampaignWorld } from './campaign-world';

export type AssetInfo={width?:number;height?:number;frames?:number;cols?:number;rows?:number;sheetWidth:number;sheetHeight:number;frameMap?:number[];durations?:number[];tags?:{name:string;start:number;end:number}[]};
export type Assets=Record<string,AssetInfo>;
export type GameHooks={ready:()=>void; changed:()=>void; event:(event:Event)=>void; select:(tower?:Tower)=>void; toast:(message:string)=>void;};
type EnemyView={sprite:Phaser.GameObjects.Sprite;shadow:Phaser.GameObjects.Ellipse;bar:Phaser.GameObjects.Graphics;anim:string;hurtUntil?:number};
type TowerView={base:Phaser.GameObjects.Image;weapon:Phaser.GameObjects.Sprite;level:Phaser.GameObjects.Text};

export class ForestScene extends Phaser.Scene {
  sim!:Simulation; hooks!:GameHooks; assets!:Assets; buildId?:number; selected?:number;selectedHero?:HeroID;abilityTargeting=false;
  private world?:CampaignWorld;private dialogue=true;
  get dialogueEnabled(){return this.dialogue;}
  set dialogueEnabled(value:boolean){this.dialogue=value;if(this.world)this.world.dialogueEnabled=value;}
  private isPaused=false;private gameSpeed=1;private inMenu=true;
  get paused(){return this.isPaused;}
  set paused(value:boolean){this.isPaused=value;this.syncClocks();this.refreshPreview();}
  get speed(){return this.gameSpeed;}
  set speed(value:number){this.gameSpeed=value;this.syncClocks();}
  get menu(){return this.inMenu;}
  set menu(value:boolean){this.inMenu=value;this.syncClocks();this.refreshPreview();}
  private towerViews=new Map<number,TowerView>();private enemyViews=new Map<number,EnemyView>();private shotViews=new Map<number,Phaser.GameObjects.Sprite|Phaser.GameObjects.Arc>();
  private cursor!:Phaser.GameObjects.Graphics;private ranges!:Phaser.GameObjects.Graphics;private effects!:Phaser.GameObjects.Graphics;private ghost?:Phaser.GameObjects.Image;
  private ticks=0; private lastUi=0;private temporaryObjects=new Set<Phaser.GameObjects.GameObject>();
  private readonly preventContextMenu:EventListener=event=>event.preventDefault();
  constructor(assets:Assets,hooks:GameHooks){super('Forest');this.assets=assets;this.hooks=hooks;}
  preload(){
    for(const [name,info] of Object.entries(this.assets)){
      const url=assetUrl(name);
      if(info.width&&info.height&&info.cols&&info.rows)this.load.spritesheet(name,url,{frameWidth:info.width,frameHeight:info.height});else this.load.image(name,url);
    }
  }
  create(){
    this.prepareTerrainFrames();
    this.makeAnimations();
    this.ranges=this.add.graphics().setDepth(6000);this.cursor=this.add.graphics().setDepth(6001);this.effects=this.add.graphics().setDepth(7000);
    this.input.on('pointermove',(pointer:Phaser.Input.Pointer)=>this.hover(pointer.worldX,pointer.worldY));
    this.input.on('pointerdown',(pointer:Phaser.Input.Pointer)=>{
      if(this.menu||this.sim.phase==='victory'||this.sim.phase==='defeat')return;
      const x=pointer.worldX,y=pointer.worldY;
      if(pointer.rightButtonDown()){
        if(this.selectedHero){this.heroCommand(x,y);return;}
        this.cancelBuild();return;
      }
      if(!this.buildId){const hero=this.abilityTargeting?undefined:this.world?.heroAt(x,y);if(hero){this.selectHero(hero);return;}if(this.selectedHero){this.heroCommand(x,y);return;}}
      this.click(Math.floor(x/CELL),Math.floor(y/CELL));
    });
    this.input.on(Phaser.Input.Events.GAME_OUT,()=>this.hidePreview());
    this.game.canvas.addEventListener('contextmenu',this.preventContextMenu);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN,()=>{this.clearWorld();this.game.canvas.removeEventListener('contextmenu',this.preventContextMenu);this.anims.globalTimeScale=1;});
    this.loadMap(0);this.hooks.ready();
  }
  private syncClocks(){const timeScale=this.paused||this.menu?0:this.speed;if(this.anims)this.anims.globalTimeScale=timeScale;if(this.tweens)this.tweens.timeScale=timeScale;}
  private track<ObjectType extends Phaser.GameObjects.GameObject>(object:ObjectType):ObjectType{this.temporaryObjects.add(object);object.once(Phaser.GameObjects.Events.DESTROY,()=>this.temporaryObjects.delete(object));return object;}
  private clearWorld(){
    this.tweens.killAll();for(const object of [...this.temporaryObjects])object.destroy();this.temporaryObjects.clear();
    this.world?.destroy();this.world=undefined;
    for(const view of this.towerViews.values()){view.base.destroy();view.weapon.destroy();view.level.destroy();}this.towerViews.clear();
    for(const view of this.enemyViews.values()){view.sprite.destroy();view.shadow.destroy();view.bar.destroy();}this.enemyViews.clear();
    for(const shot of this.shotViews.values())shot.destroy();this.shotViews.clear();
  }
  private prepareTerrainFrames(){
    // Generated atlas separators are outside the usable transparent prop area.
    // setSize updates both source cuts and UVs before any image is instantiated.
    const inset=6;
    for(const[name,info]of Object.entries(this.assets)){
      if(!name.startsWith('Terrain ')||!info.width||!info.height||!info.cols||!this.textures.exists(name))continue;
      const texture=this.textures.get(name);
      for(let index=4;index<8;index++){
        if(!texture.has(String(index)))continue;
        texture.get(index).setSize(info.width-inset*2,info.height-inset*2,(index%info.cols)*info.width+inset,Math.floor(index/info.cols)*info.height+inset);
      }
    }
  }
  private makeAnimations(){
    const custom=(texture:string,key:string,frames:number[],rate:number,repeat=-1)=>{if(!this.textures.exists(texture)||this.anims.exists(key))return;this.anims.create({key,frames:frames.map(frame=>({key:texture,frame})),frameRate:rate,repeat});};
    custom('Mara','mara-idle',[0,1],2);custom('Mara','mara-walk',[2,3],7);custom('Mara','mara-cast',[4,5],5);custom('Mara','mara-cheer',[6],1);custom('Mara','mara-panic',[7],1);
    for(const direction of ['up','down','side']){custom('Sternenrichter',`Sternenrichter-move-${direction}`,[0,1],3);custom('Sternenrichter',`Sternenrichter-death-${direction}`,[6,7],6,0);}
    custom('Sternenrichter','Sternenrichter-shield',[2,3],4);custom('Sternenrichter','Sternenrichter-hit',[4,5],8,0);
    for(const enemy of ['Lantern Jelly','Root Herald','Frost Ram'])for(const direction of ['up','down','side']){custom(enemy,`${enemy}-move-${direction}`,[0,1],4);custom(enemy,`${enemy}-death-${direction}`,[6,7],6,0);}
    for(const[id,name]of [['mara','Mara'],['wisp','Wisp'],['runa','Runa'],['ilyra','Ilyra']]){
      for(const[direction,row]of [['down',0],['left',1],['right',2],['up',3]] as const){
        const texture=`Hero ${name}`,base=(id==='wisp'&&direction==='left'?2:row)*4;custom(texture,`hero-${id}-${direction}-idle`,[base],1);custom(texture,`hero-${id}-${direction}-walk`,[base+1,base+2,base,base+2],7);custom(texture,`hero-${id}-${direction}-cast`,[base+3,base],4);
      }
    }
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
      else if(name==='Animated water tiles')make('water',0,9);
      else if(name==='Tower Construction'){const transitions=info.tags?.filter(tag=>tag.name==='Transition')??[];transitions.forEach((tag,index)=>make(`construction-${index+1}`,tag.start,tag.end,0));}
      else if(name.includes('Weapon')){
        const idle=info.tags?.find(t=>t.name==='Idle');
        if(idle)make(`${name}-idle`,idle.start,idle.end);
        const start=idle?idle.end+1:0;make(`${name}-attack`,start,info.frames!-1,0);
      }else if(name.includes('Impact')||name.includes('Projectile')||name==='Tower - Collapse')make(`${name}-play`,0,info.frames!-1,name.includes('Projectile')&&!name.includes('Impact')?-1:0);
    }
  }
  loadMap(id:number,party?:HeroID[]){
    this.clearWorld();this.ticks=0;this.lastUi=0;this.effects.clear();
    this.sim=new Simulation(id,party);this.paused=false;this.speed=1;this.selected=undefined;this.selectedHero=undefined;this.abilityTargeting=false;this.cancelBuild();this.hooks.select();
    this.drawMap();this.hooks.changed();
  }
  restoreRun(snapshot:unknown){
    const restored=Simulation.restore(snapshot);if(!restored)return false;
    this.clearWorld();this.ticks=0;this.lastUi=0;this.effects.clear();this.sim=restored;this.paused=false;this.speed=1;this.selected=undefined;this.selectedHero=undefined;this.abilityTargeting=false;this.cancelBuild();this.hooks.select();this.drawMap();
    for(const tower of this.sim.towers)this.refreshTower(tower);this.hooks.changed();return true;
  }
  private drawMap(){
    this.world=new CampaignWorld(this,this.sim);this.world.dialogueEnabled=this.dialogue;
  }
  chooseBuild(id:number){if(!TOWERS.some(tower=>tower.id===id))return;this.selectedHero=undefined;this.abilityTargeting=false;this.world?.selectHero();this.buildId=id;this.selected=undefined;this.hooks.select();this.ghost?.destroy();this.ghost=this.add.image(-100,-100,`Tower ${String(id).padStart(2,'0')}`,0).setScale(.63).setOrigin(.5,this.assets[`Tower ${String(id).padStart(2,'0')}`].height===192?.81:.8).setAlpha(.5).setDepth(6002);this.refreshPreview();this.hooks.changed();}
  selectHero(id:HeroID){
    if(!this.sim.heroes.some(hero=>hero.id===id))return;
    this.cancelBuild();this.abilityTargeting=false;this.selectedHero=id;this.world?.selectHero(id);this.refreshPreview();this.hooks.changed();
  }
  private heroCommand(x:number,y:number){
    if(!this.selectedHero)return false;
    if(this.paused){this.hooks.toast('Setze das Spiel fort, damit sich die Begleiter bewegen.');return false;}
    const col=Math.floor(x/CELL),row=Math.floor(y/CELL),tower=this.sim.towers.find(candidate=>candidate.col===col&&candidate.row===row),objective=this.world?.objectiveAt(x,y);
    let accepted=false;
    if(this.abilityTargeting&&this.selectedHero!=='mara')accepted=this.sim.commandAction(this.selectedHero,'point',[col,row]);
    else if(objective)accepted=this.sim.commandAction(this.selectedHero,objective.kind,objective.id);
    else if(tower){this.selected=tower.uid;this.hooks.select(tower);accepted=this.sim.commandAction(this.selectedHero,'tower',tower.uid);}
    else accepted=this.sim.commandHero(this.selectedHero,col,row);
    if(accepted)this.abilityTargeting=false;
    else this.hooks.toast(tower?'Diese Fähigkeit ist gerade nicht verfügbar. Wähle einen anderen Begleiter oder warte kurz.':'Dorthin führt kein freier Weg oder die Fähigkeit ist noch nicht bereit.');
    this.handleEvents();this.hooks.changed();return accepted;
  }
  heroAbility(){
    const id=this.selectedHero;if(!id){this.hooks.toast('Wähle zuerst einen Begleiter mit Q oder E.');return false;}
    if(this.menu||this.paused){this.hooks.toast('Setze das Spiel fort, damit dein Begleiter helfen kann.');return false;}
    const hero=this.sim.heroes.find(candidate=>candidate.id===id)!;
    if(this.sim.phase!=='wave'){this.hooks.toast('Fähigkeiten werden während einer Welle eingesetzt. Vorräte und Runen kannst du jederzeit anklicken.');return false;}
    if(hero.cooldown>0){this.hooks.toast(`Die Fähigkeit ist in ${Math.ceil(hero.cooldown)} Sekunden wieder bereit.`);return false;}
    if(id!=='mara'){this.abilityTargeting=true;this.hooks.toast('Klicke auf eine erreichbare Stelle für die Fähigkeit. Dein Begleiter läuft zuerst dorthin.');this.hooks.changed();return true;}
    const tower=this.sim.towers.find(candidate=>candidate.uid===this.selected);
    let accepted=false;
    if(tower)accepted=this.sim.commandAction(id,'tower',tower.uid);
    else {this.abilityTargeting=true;this.hooks.toast('Klicke auf den Turm, den Mara übertakten soll.');this.hooks.changed();return true;}
    if(!accepted)this.hooks.toast('Klicke mit ausgewähltem Begleiter auf einen Turm, eine Rune oder Vorräte.');
    this.handleEvents();this.hooks.changed();return accepted;
  }
  activateMara(){
    if(!this.sim.heroes.some(hero=>hero.id==='mara')){this.hooks.toast('Mara ist in dieser Mission nicht in deiner Gruppe.');return false;}
    this.selectHero('mara');return this.heroAbility();
  }
  cancelBuild(){this.buildId=undefined;this.ghost?.destroy();this.ghost=undefined;this.cursor?.clear();this.drawRange();this.hooks.select(this.sim?.towers.find(tower=>tower.uid===this.selected));this.hooks.changed();}
  clearSelection(){this.selected=undefined;this.selectedHero=undefined;this.abilityTargeting=false;this.world?.selectHero();this.cancelBuild();this.hooks.select();}
  private click(col:number,row:number){
    const existing=this.sim.towers.find(t=>t.col===col&&t.row===row);
    if(existing){this.cancelBuild();this.selected=existing.uid;this.drawRange();this.hooks.select(existing);this.hooks.changed();return;}
    if(this.buildId){if(this.paused){this.hooks.toast('Zum Bauen zuerst das Spiel fortsetzen.');return;}const def=TOWERS[this.buildId-1];if(this.sim.gold<def.cost){this.hooks.toast('Nicht genug Gold für diesen Turm.');return;}if(!this.sim.canBuild(col,row)){this.hooks.toast(this.sim.map.id===3?'Baue auf einer freien Steinplattform neben dem Weg.':'Baue auf einer freien Wiese neben dem Weg.');return;}const tower=this.sim.build(this.buildId,col,row);if(tower){this.handleEvents();this.hooks.changed();this.hover(col*CELL+20,row*CELL+20);}return;}
    this.selected=undefined;this.drawRange();this.hooks.select();this.hooks.changed();
  }
  private hidePreview(){this.cursor?.clear();this.ghost?.setVisible(false);if(this.menu)this.ranges?.clear();else this.drawRange();}
  private refreshPreview(){if(!this.sim||!this.cursor||!this.input)return;if(this.menu||!this.input.isOver){this.hidePreview();return;}const point=this.input.activePointer.positionToCamera(this.cameras.main) as Phaser.Math.Vector2;this.hover(point.x,point.y);}
  private hover(x:number,y:number){
    this.cursor.clear();this.ranges.clear();if(this.menu||x<0||y<0||x>=WIDTH||y>=HEIGHT){this.hidePreview();return;}
    this.drawRange();if(this.selectedHero&&!this.buildId){const hero=this.world?.heroAt(x,y),objective=this.world?.objectiveAt(x,y),col=Math.floor(x/CELL),row=Math.floor(y/CELL),tower=this.sim.towers.find(candidate=>candidate.col===col&&candidate.row===row),point=hero?this.sim.heroes.find(candidate=>candidate.id===hero)!:objective??tower??center([col,row]);this.cursor.lineStyle(1.5,objective||tower?0xf4d49b:0xa9ebd5,.7).strokeEllipse(point.x,point.y+3,objective||tower?40:25,objective||tower?20:13);if(this.abilityTargeting&&this.selectedHero!=='mara'){const radius=this.selectedHero==='wisp'?135:this.selectedHero==='runa'?170:185;this.cursor.lineStyle(1,0xb6e7d8,.4).strokeCircle(point.x,point.y,radius);this.cursor.fillStyle(0xb6e7d8,.04).fillCircle(point.x,point.y,radius);}return;}if(!this.buildId)return;
    const col=Math.floor(x/CELL),row=Math.floor(y/CELL),point=center([col,row]),valid=!this.paused&&this.sim.canBuild(col,row)&&this.sim.gold>=TOWERS[this.buildId-1].cost;
    const color=valid?0xe4e9b0:0xea8674;
    this.cursor.lineStyle(2,color,.95).strokeRoundedRect(col*CELL+2,row*CELL+2,CELL-4,CELL-4,4);this.cursor.fillStyle(color,.12).fillRoundedRect(col*CELL+2,row*CELL+2,CELL-4,CELL-4,4);
    this.ranges.lineStyle(1,color,.5).strokeCircle(point.x,point.y,TOWERS[this.buildId-1].range);this.ranges.fillStyle(color,.055).fillCircle(point.x,point.y,TOWERS[this.buildId-1].range);
    this.ghost?.setVisible(true).setPosition(point.x,point.y+13).setTint(color);
  }
  drawRange(){this.ranges?.clear();const tower=this.sim?.towers.find(t=>t.uid===this.selected);if(tower){this.ranges.fillStyle(0xe9dba0,.07).fillCircle(tower.x,tower.y,stats(tower).range);this.ranges.lineStyle(1.5,0xe9dba0,.7).strokeCircle(tower.x,tower.y,stats(tower).range);this.ranges.lineStyle(2,0xf4e4ab,1).strokeRoundedRect(tower.col*CELL+1,tower.row*CELL+1,38,38,5);}}
  handleEvents(){for(const event of this.sim.drainEvents()){
    this.hooks.event(event);
    this.world?.react(event);
    if(event.type==='hit'&&event.shot){const target=this.sim.enemies.find(enemy=>enemy.uid===event.shot!.target),view=this.enemyViews.get(event.shot.target);if(target?.def.id==='Sternenrichter'&&view)view.hurtUntil=this.ticks+230;}
    if(event.type==='build'||event.type==='upgrade'){this.refreshTower(event.tower!);this.puff(event.x!,event.y!,0xe9dcad);this.playEffect('Tower Construction',`construction-${event.tower!.level}`,event.x!,event.y!+29,.63,.75);if(event.type==='build'){const wisp=this.track(this.add.sprite(event.x!,event.y!+12,'Wisp - Animations',0).setDepth(6200).setScale(.7).play('wisp-summon'));this.tweens.add({targets:wisp,y:event.y!-25,alpha:0,duration:950,onComplete:()=>wisp.destroy()});}}
    if(event.type==='sell'){const view=this.towerViews.get(event.tower!.uid);view?.base.destroy();view?.weapon.destroy();view?.level.destroy();this.towerViews.delete(event.tower!.uid);this.playEffect('Tower - Collapse','Tower - Collapse-play',event.x!,event.y!,.55,.6);this.puff(event.x!,event.y!,0xdac99d);if(this.selected===event.tower!.uid){this.selected=undefined;this.hooks.select();this.drawRange();}}
    if(event.type==='fire'){const view=this.towerViews.get(event.tower!.uid);const key=`${this.weaponKey(event.tower!)}-attack`,animation=this.anims.get(key);if(view&&animation)view.weapon.play({key,frameRate:animation.frames.length*(this.sim.isOverclocked(event.tower!)?MARA_FIRE_RATE:1)/(stats(event.tower!).cooldown*.85)});}
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
  private enemyTexture(enemy:Enemy){return this.textures.exists(enemy.def.id)?enemy.def.id:enemy.def.texture??enemy.def.id;}
  private removeEnemy(enemy:Enemy,death:boolean){const view=this.enemyViews.get(enemy.uid);if(!view)return;view.bar.destroy();view.shadow.destroy();this.enemyViews.delete(enemy.uid);const key=`${this.enemyTexture(enemy)}-death-${enemy.direction}`;if(death&&this.anims.exists(key)){this.track(view.sprite);view.sprite.once(Phaser.Animations.Events.ANIMATION_COMPLETE,()=>view.sprite.destroy());view.sprite.play(key);}else view.sprite.destroy();}
  private puff(x:number,y:number,color:number,radius=10){const ring=this.track(this.add.circle(x,y,radius,color,.35).setDepth(6500));this.tweens.add({targets:ring,scale:2.1,alpha:0,duration:250,onComplete:()=>ring.destroy()});}
  private floating(x:number,y:number,text:string,color:string){const label=this.track(this.add.text(x,y,text,{fontFamily:'monospace',fontSize:'11px',fontStyle:'bold',color,stroke:'#304a32',strokeThickness:2}).setOrigin(.5).setDepth(6800));this.tweens.add({targets:label,y:y-25,alpha:0,duration:850,onComplete:()=>label.destroy()});}
  update(_time:number,delta:number){
    this.ticks+=this.paused||this.menu?0:delta*this.speed;
    if(this.sim&&!this.paused&&!this.menu){const duration=Math.min(delta/1000,.08)*this.speed;const steps=Math.ceil(duration/.025);for(let i=0;i<steps;i++)this.sim.update(duration/steps);this.handleEvents();}
    if(!this.sim)return;
    for(const tower of this.sim.towers){const view=this.towerViews.get(tower.uid);if(view&&[1,3,4,6].includes(tower.def.id))view.weapon.setRotation(tower.angle);}
    for(const enemy of this.sim.enemies){
      let view=this.enemyViews.get(enemy.uid);
      const texture=this.enemyTexture(enemy),customSprite=enemy.def.id==='Sternenrichter'||['Lantern Jelly','Root Herald','Frost Ram'].includes(texture);
      if(!view){view={sprite:this.add.sprite(enemy.x,enemy.y,texture).setScale(enemy.def.id==='Firewasp'?.65:.83),shadow:this.add.ellipse(enemy.x,enemy.y+12,23,9,0x263e30,.24),bar:this.add.graphics(),anim:''};if(customSprite)view.sprite.setDisplaySize(enemy.boss?68:54,enemy.boss?68:54).setOrigin(.5,.72);this.enemyViews.set(enemy.uid,view);}
      const shielding=enemy.def.id==='Sternenrichter'&&this.sim.enemies.some(candidate=>candidate.shieldSource===enemy.uid);
      const key=enemy.def.id==='Sternenrichter'&&this.ticks<(view.hurtUntil??0)?'Sternenrichter-hit':shielding?'Sternenrichter-shield':`${texture}-move-${enemy.direction}`;
      if(view.anim!==key&&this.anims.exists(key)){view.sprite.play(key);view.anim=key;}
      const bob=enemy.def.flying?Math.sin(this.ticks*.007+enemy.uid)*3-11:enemy.def.id==='Sternenrichter'?Math.sin(this.ticks*.004+enemy.uid)*2-3:0;
      const tint=enemy.slowTime>0?0xb9ecff:enemy.burnTime>0?0xffd3a6:texture!==enemy.def.id?(enemy.def.heal?0xb8ffe6:enemy.def.haste?0xc4d69a:0xb7e0fa):0xffffff;
      view.sprite.setPosition(enemy.x,enemy.y+bob).setFlipX(enemy.flip).setDepth(enemy.y+(enemy.def.flying?4000:1003)).setTint(tint);
      if(enemy.boss&&!customSprite)view.sprite.setScale(1.15);view.shadow.setPosition(enemy.x,enemy.y+9).setDepth(900+enemy.y);
      const barY=enemy.y-(enemy.def.id==='Sternenrichter'?(enemy.boss?50:42):25)+bob;view.bar.clear().setDepth(5000);if(enemy.hp<enemy.maxHp||enemy.boss){view.bar.fillStyle(0x263f33,.85).fillRoundedRect(enemy.x-17,barY,34,5,2);view.bar.fillStyle(enemy.boss?0xf2b473:0xdde69c,1).fillRoundedRect(enemy.x-16,barY+1,32*enemy.hp/enemy.maxHp,3,1);}
    }
    const liveShots=new Set<number>();for(const shot of this.sim.shots){liveShots.add(shot.uid);let sprite=this.shotViews.get(shot.uid);if(!sprite){const tower=shot.tower,id=String(tower.def.id).padStart(2,'0'),key=`Tower ${id} - ${tower.def.id===7?'Level X':`Level ${String(tower.level).padStart(2,'0')}`} - Projectile`;if(this.textures.exists(key)&&tower.def.id!==8){sprite=this.add.sprite(shot.x,shot.y,key,0).setScale(tower.def.id===3?.65:.45);const animation=`${key}-play`;if(this.anims.exists(animation))sprite.play(animation);}else sprite=this.add.circle(shot.x,shot.y,tower.def.id===8?6:3,tower.def.color);sprite.setDepth(5500);this.shotViews.set(shot.uid,sprite);}const target=this.sim.enemies.find(e=>e.uid===shot.target);sprite.setPosition(shot.x,shot.y);if(target)sprite.setRotation(Math.atan2(target.y-shot.y,target.x-shot.x)+Math.PI/2);}
    for(const[id,sprite]of this.shotViews)if(!liveShots.has(id)){sprite.destroy();this.shotViews.delete(id);}
    this.world?.update(this.paused||this.menu?0:Math.min(delta,80)*this.speed);
    if(_time-this.lastUi>150){this.lastUi=_time;this.refreshPreview();this.hooks.changed();}
  }
}
