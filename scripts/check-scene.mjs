import assert from 'node:assert/strict';
import { readFile,writeFile } from 'node:fs/promises';
import { resolve,dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { runInNewContext } from 'node:vm';
import { build } from 'esbuild';

// API-double tests cover behavior and lifetime; real browser pixel QA is separate.
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const assets=JSON.parse(await readFile(resolve(root,'public/assets/manifest.json'),'utf8'));
// Exercise scenery collision even while a particular art atlas is being generated.
// Production packaging separately verifies that actual atlas PNGs are present.
for(const theme of ['forest','marsh','wind','ember','frost','moon'])assets[`Terrain ${theme}`]??={width:443,height:443,cols:4,rows:2,sheetWidth:1774,sheetHeight:887};
for(const theme of ['forest','marsh','wind','frost','moon'])assets[`Terrain ${theme} calm`]??={width:443,height:443,cols:4,rows:2,sheetWidth:1774,sheetHeight:887};
const canvasCalls=[];
const canvas=()=>({width:1120,height:640,getContext:()=>new Proxy({imageSmoothingEnabled:false},{get(target,key){if(key in target)return target[key];if(key==='createLinearGradient'||key==='createRadialGradient')return()=>({addColorStop(){}});return(...args)=>canvasCalls.push([key,...args]);}})});
const stub=`
class Display {
  constructor(scene,kind,x=0,y=0,texture,frame){this.scene=scene;this.kind=kind;this.x=x;this.y=y;this.texture=texture;this.frame=frame;this.visible=true;this.children=[];this.listeners={};this.width=20;this.height=20;scene.objects.push(this);}
  setDepth(v){this.depth=v;return this;} setAlpha(v){this.alpha=v;return this;} setOrigin(x,y=x){this.originX=x;this.originY=y;return this;}
  setScale(x,y=x){this.scaleX=x;this.scaleY=y;this.scaleCalls=(this.scaleCalls??0)+1;return this;}
  setDisplaySize(w,h){this.displayWidth=w;this.displayHeight=h;this.scaleAtDisplay=this.scaleCalls??0;return this;}
  setPosition(x,y){this.x=x;this.y=y;return this;} setRotation(v){this.rotation=v;return this;} setTint(v){this.tint=v;return this;} setFlipX(v){this.flipX=v;return this;}
  setVisible(v){this.visible=v;return this;} setFrame(v){this.frame=v;return this;} setTexture(v,f){this.texture=v;this.frame=f;return this;}
  setText(v){this.text=v;this.width=Math.min(237,String(v).length*7+22);this.height=Math.ceil(String(v).length/30)*16+18;return this;}
  play(v){this.animation=v;return this;} stop(){return this;}
  add(v){this.children.push(...(Array.isArray(v)?v:[v]));return this;}
  once(event,fn){this.listeners[event]=fn;return this;} on(event,fn){this.listeners[event]=fn;return this;}
  destroy(children=false){if(this.destroyed)return;this.destroyed=true;if(children)this.children.forEach(c=>c.destroy(true));this.listeners.destroy?.();}
}
for(const name of ['clear','fillStyle','lineStyle','fillRect','strokeRect','fillCircle','strokeCircle','fillRoundedRect','strokeRoundedRect','fillTriangle','lineBetween','beginPath','moveTo','lineTo','strokePath','strokeEllipse','fillEllipse'])Display.prototype[name]=function(...args){(this.drawCalls??=[]).push([name,...args]);return this;};
class Scene {
  constructor(){
    this.objects=[];const make=(kind)=>(x=0,y=0,texture,frame)=>new Display(this,kind,x,y,texture,frame);
    this.add={graphics:()=>new Display(this,'graphics'),image:make('image'),sprite:make('sprite'),circle:make('circle'),ellipse:make('ellipse'),container:(x,y,items=[])=>new Display(this,'container',x,y).add(items),text:(x,y,text)=>new Display(this,'text',x,y).setText(text)};
    const registry=new Map();this.anims={globalTimeScale:1,exists:key=>registry.has(key),create:def=>registry.set(def.key,def),get:key=>registry.get(key)};
    const textures=new Map(),frames=new Map();this.frameCrops=[];this.textures={exists:key=>Boolean(ASSETS[key])||textures.has(key),remove:key=>textures.delete(key),get:key=>({has:()=>true,add(){},getSourceImage:()=>({width:1024,height:1024}),get:index=>{const id=key+':'+index;if(!frames.has(id)){const width=ASSETS[key]?.width??256,height=ASSETS[key]?.height??256,cols=ASSETS[key]?.cols??1;frames.set(id,{cutX:(index%cols)*width,cutY:Math.floor(index/cols)*height,cutWidth:width,cutHeight:height,source:{image:{}},setSize:(w,h,x,y)=>{Object.assign(frames.get(id),{cutX:x,cutY:y,cutWidth:w,cutHeight:h});this.frameCrops.push({key,index,w,h,x,y});return frames.get(id);}});}return frames.get(id);}}),createCanvas:(key,w,h)=>{const texture={key,width:w,height:h,context:CANVAS().getContext('2d'),refresh(){}};textures.set(key,texture);return texture;}};
    this.tweens={timeScale:1,killAll:()=>{},add:()=>{}};this.input={isOver:false,listeners:{},on(event,fn){this.listeners[event]=fn;}};
    this.game={canvas:{addEventListener(){},removeEventListener(){}}};this.events={once(){}};
  }
}
export default {Scene,Math:{Clamp:(v,min,max)=>Math.max(min,Math.min(max,v))},GameObjects:{Events:{DESTROY:'destroy'}},Animations:{Events:{ANIMATION_COMPLETE:'animationcomplete'}},Input:{Events:{GAME_OUT:'out'}},Scenes:{Events:{SHUTDOWN:'shutdown'}}};
`;
const output=await build({entryPoints:[resolve(root,'src/scene.ts')],bundle:true,write:false,format:'cjs',target:'es2022',plugins:[{name:'scene-display-double',setup(builder){builder.onResolve({filter:/^phaser$/},()=>({path:'phaser',namespace:'double'}));builder.onLoad({filter:/.*/,namespace:'double'},()=>({contents:stub}));}}]});
const module={exports:{}};runInNewContext(output.outputFiles[0].text,{module,exports:module.exports,URL,console,ASSETS:assets,CANVAS:canvas,document:{createElement:canvas}});
const {ForestScene}=module.exports;
const toasts=[];
const scene=new ForestScene(assets,{ready(){},changed(){},event(){},select(){},toast:text=>toasts.push(text)});
scene.create();scene.loadMap(3);scene.menu=false;
const propFrame=scene.textures.get('Terrain marsh calm').get(5),propInfo=assets['Terrain marsh calm'];
assert.equal(propFrame.cutWidth,propInfo.width-12,'Transparent terrain props exclude atlas separator columns');assert.equal(propFrame.cutX,propInfo.width+6);assert.equal(propFrame.cutY,propInfo.height+6);
scene.prepareTerrainFrames();assert.equal(propFrame.cutWidth,propInfo.width-12,'Terrain frame preparation must be idempotent');
const find=texture=>scene.objects.find(object=>object.texture===texture&&!object.destroyed);
const click=(x,y,right=false)=>scene.input.listeners.pointerdown({worldX:x,worldY:y,rightButtonDown:()=>right});
const advance=seconds=>{for(let time=0;time<seconds;time+=.05)scene.update(time*1000,50);};
assert.equal(scene.world.portals.length,4);assert.equal(scene.world.portals[0].alpha,1);assert.equal(scene.world.portals[2].alpha,.35);
const hero=scene.sim.heroes.find(hero=>hero.id==='mara'),initial={x:hero.x,y:hero.y};
click(hero.x,hero.y-20);assert.equal(scene.selectedHero,'mara','Visible character click must select it');
let destination;
for(let row=5;row<12&&!destination;row++)for(let col=11;col<19&&!destination;col++)if(scene.sim.canWalk(col,row)&&Math.hypot(col*40+20-hero.x,row*40+20-hero.y)>85)destination={x:col*40+20,y:row*40+20};
assert.ok(destination);click(destination.x,destination.y,true);assert.equal(hero.state,'move');advance(8);
assert.notDeepEqual({x:hero.x,y:hero.y},initial,'Right-click must move the actual hero during the build phase');
assert.ok(Math.hypot(hero.x-destination.x,hero.y-destination.y)<1);
const visibleMara=find(assets['Hero Mara']?'Hero Mara':'Mara');assert.ok(visibleMara);assert.equal(visibleMara.x,hero.x);assert.equal(visibleMara.originY,.95);
const cache=scene.sim.objectives.find(objective=>objective.kind==='cache');click(cache.x,cache.y-10);advance(8);assert.equal(cache.completed,true,'Object click must walk to and collect supplies');
scene.chooseBuild(1);assert.equal(scene.selectedHero,undefined);assert.equal(scene.abilityTargeting,false);scene.cancelBuild();
let tower;
for(let row=5;row<12&&!tower;row++)for(let col=10;col<20&&!tower;col++)if(Math.hypot(col*40+20-hero.x,row*40+20-hero.y)>100)tower=scene.sim.build(1,col,row);
assert.ok(tower);scene.handleEvents();scene.selected=tower.uid;scene.sim.startWave();scene.handleEvents();
assert.equal(scene.activateMara(),true);assert.equal(scene.sim.isOverclocked(tower),false,'Overclock waits for arrival and cast');
for(let step=0;step<240&&!scene.sim.isOverclocked(tower);step++)scene.update(step*50,50);
assert.equal(scene.sim.isOverclocked(tower),true);assert.ok(Math.hypot(hero.x-tower.x,hero.y-tower.y)<44);assert.equal(scene.activateMara(),false);assert.match(toasts.at(-1),/Sekunden/);
scene.selectHero('wisp');assert.equal(scene.heroAbility(),true);const wisp=scene.sim.heroes.find(hero=>hero.id==='wisp');click(wisp.x,wisp.y);advance(1);assert.ok(wisp.cooldown>0,'Point ability also works on the current cell');
scene.paused=true;const pausedTime=scene.world.time,pausedPosition={x:hero.x,y:hero.y};scene.update(50,50);assert.equal(scene.world.time,pausedTime);assert.deepEqual({x:hero.x,y:hero.y},pausedPosition);assert.equal(scene.anims.globalTimeScale,0);
scene.sim.enemies=[{uid:999,x:120,y:120,def:{id:'Sternenrichter',flying:false},hp:100,maxHp:100,boss:true,direction:'side',flip:false,slowTime:0,burnTime:0}];scene.update(100,0);const judge=find('Sternenrichter');assert.equal(judge.displayWidth,68);assert.equal(judge.scaleCalls,judge.scaleAtDisplay);
scene.sim.enemies.push({uid:1000,x:155,y:140,hp:80,def:{id:'Leafbug'},shieldSource:999});scene.world.update(0);assert.ok(scene.world.links.drawCalls.some(call=>call[0]==='strokeEllipse'));
scene.dialogueEnabled=false;assert.equal(scene.world.bubble.visible,false);scene.dialogueEnabled=true;scene.world.react({type:'victory'});assert.match(scene.world.bubbleText.text,/Spire gerettet/);
const oldWorld=scene.world,oldMara=visibleMara;scene.loadMap(3);assert.ok(oldWorld.links.destroyed);assert.ok(oldWorld.bubble.destroyed);assert.ok(oldMara.destroyed);assert.equal(scene.world.time,0);
scene.sim.wave=3;scene.world.update(0);assert.equal(scene.world.portals[0].alpha,.35);assert.equal(scene.world.portals[2].alpha,1);
const checkpoint=scene.sim.snapshot();assert.equal(scene.restoreRun(checkpoint),true);assert.equal(scene.sim.wave,3);assert.equal(scene.restoreRun({version:7}),false);
const renderedObstacles={};
for(const id of [3,...Array.from({length:17},(_,index)=>index+4)]){
  scene.loadMap(id);assert.equal(scene.sim.heroes.length,2);assert.ok(scene.world);assert.equal(scene.world.heroViews.size,2);
  if([3,4,7,10,16].includes(id))renderedObstacles[id]=[...scene.sim.obstacles];
  for(const objective of scene.sim.objectives.filter(objective=>objective.kind!=='station')){assert.equal(scene.sim.commandAction('wisp',objective.kind,objective.id),true,`Map ${id}: rendered scenery must leave ${objective.label} reachable`);for(let step=0;step<500&&!objective.completed;step++)scene.sim.update(.1);assert.equal(objective.completed,true,`Map ${id}: hero must reach and finish ${objective.label}`);}
  const state=scene.sim.snapshot();assert.equal(scene.restoreRun(state),true,`Map ${id}: scenery and complete objectives must restore`);assert.ok(scene.sim.objectives.filter(objective=>objective.kind!=='station').every(objective=>objective.completed));
  const station=scene.sim.objectives.find(objective=>objective.kind==='station');
  if(station){scene.sim.startWave();scene.handleEvents();scene.selectHero('wisp');click(station.x,station.y-10);for(let step=0;step<300&&!station.uses;step++)scene.update(step*50,50);assert.equal(station.uses,1,`Map ${id}: station click must walk, channel and activate`);assert.ok(scene.sim.regionEffect);assert.equal(station.completed,false);}
}
await writeFile(resolve(root,'tests/rendered-obstacles.json'),JSON.stringify(renderedObstacles,null,2)+'\n');
assert.ok(canvasCalls.some(call=>call[0]==='drawImage'));assert.ok(canvasCalls.some(call=>call[0]==='ellipse'));
assert.ok(canvasCalls.some(call=>call[0]==='drawImage'&&call[2]===192&&call[3]===192&&call[4]===64&&call[5]===64),'Animated water must sample only the grass-free central 64px square');
scene.clearWorld();assert.equal(scene.world,undefined);
console.log('Scene checks passed: hero pointer selection/movement, arrival-only actions, supplies, target mode, pause, portals, shields, checkpoint, 18 worlds and cleanup. Browser pixel QA remains separate.');
