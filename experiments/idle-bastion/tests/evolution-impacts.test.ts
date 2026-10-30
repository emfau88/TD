import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import type Phaser from 'phaser';
import { CombatEffects } from '../src/combat-effects';
import { evolutionImpact, prepareEvolutionImpacts } from '../src/evolution-impacts';
import { SKIN_LEVELS } from '../src/tower-evolution';
import { towerSheet } from '../src/tower-atlas';
import { worldEffectDepth } from '../src/world-depth';
import { IdleBattle, type BattleEvent, type Shot } from '../src/battle';
import { createTowerProbe } from '../src/tower-test-probes';

function renderer() {
  const images: ReturnType<typeof image>[]=[];
  function image(x:number,y:number,key:string,frame:number) {
    const sprite={x,y,key,frame,depth:0,scale:0,origin:[0,0],destroyed:false,
      setScale(s:number){this.scale=s;return this;},setOrigin(x:number,y:number){this.origin=[x,y];return this;},
      setDepth(n:number){this.depth=n;return this;},setFrame(n:number){this.frame=n;return this;},destroy(){this.destroyed=true;}};
    return sprite;
  }
  const graphics=()=>({setDepth(){return this;},lineStyle(){return this;},beginPath(){return this;},moveTo(){return this;},lineTo(){return this;},strokePath(){return this;},setAlpha(){return this;},destroy(){}});
  return {images,scene:{add:{graphics,image:(x:number,y:number,key:string,frame:number)=>{const sprite=image(x,y,key,frame);images.push(sprite);return sprite;}}} as unknown as Phaser.Scene};
}
const hit=(kind:number,level:number,uid=1,x=200,y=220):BattleEvent=>({type:'hit',shot:{uid,kind,level} as Shot,x,y});

test('impact thresholds match skins, retain level 25 above the cap for all five towers',()=>{
  for(const kind of [1,2,3,4,5])for(let level=1;level<=120;level++){
    const expected=[...SKIN_LEVELS].reverse().find(n=>n<=level)!;
    const fx=evolutionImpact(kind,level)!;
    assert.equal(fx.level,expected);assert.equal(fx.key,`evolution-impact-r5-${kind}-${expected}`);
    assert.equal(fx.frames.length,10);assert.ok(fx.duration>=(kind===5?.25:.3)&&fx.duration<=.55);
  }
  assert.equal(evolutionImpact(6,25),undefined);
});

test('all 40 textures prepare once, with bounded frames and no per-hit canvas allocation',()=>{
  const textures=new Map<string,unknown>(),frames:number[][]=[];let canvases=0,originalDraws=0;
  for(const kind of [1,2,3,4,5])for(const stage of (kind===5?[1,2,3]:[1]))textures.set(towerSheet(kind,stage,'Projectile - Impact').key,{getSourceImage:()=>({width:576,height:192})});
  const context={save(){},restore(){},scale(){},translate(){},fillRect(){},drawImage(...args:unknown[]){
    assert.equal(args.length,9);assert.ok(args.slice(1).every(Number.isFinite));originalDraws++;
  }};
  const doc=Object.getOwnPropertyDescriptor(globalThis,'document');
  Object.defineProperty(globalThis,'document',{configurable:true,value:{createElement(name:string){assert.equal(name,'canvas');canvases++;return {width:0,height:0,getContext:()=>context};}}});
  const scene={textures:{exists:(key:string)=>textures.has(key),get:(key:string)=>textures.get(key),addCanvas(key:string,canvas:{width:number;height:number}){
    assert.equal(canvas.width,960);assert.equal(canvas.height,96);const texture={add(...args:number[]){frames.push(args);},setFilter(mode:number){assert.equal(mode,1);}};
    textures.set(key,texture);return texture;
  }}} as unknown as Phaser.Scene;
  try { prepareEvolutionImpacts(scene);prepareEvolutionImpacts(scene); }
  finally { if(doc)Object.defineProperty(globalThis,'document',doc);else delete (globalThis as {document?:unknown}).document; }
  assert.equal(canvases,40);assert.equal(frames.length,400);assert.ok(originalDraws>0);
  assert.ok(frames.every(([frame,source,x,y,w,h])=>source===0&&x===frame*96&&y===0&&w===96&&h===96));
});

test('confirmed payload chooses impact after owner upgrade/sale; splash yields only one visual hit',()=>{
  const {scene,images}=renderer(),fx=new CombatEffects(scene);
  const event=hit(3,15,11),shot=Object.freeze(event.shot!);
  fx.accept([{...event,shot,tower:{level:25} as never},{...event,shot,x:230,y:240}],10);
  assert.equal(images.length,1);assert.equal(images[0].key,evolutionImpact(3,15)!.key);
  assert.equal(images[0].x,200);assert.equal(images[0].y,220);
  assert.equal(images[0].scale,1);assert.deepEqual(images[0].origin,[.5,.5]);
  assert.equal(images[0].depth,worldEffectDepth(220));assert.equal(shot.level,15);
});

test('impact timing follows simulation pause, expiry and rollback, with existing 96-sprite bound',()=>{
  const {scene,images}=renderer(),fx=new CombatEffects(scene);fx.accept([hit(4,25)],1);
  fx.update(1.22,new Set(),new Set());const frame=images[0].frame;
  for(let i=0;i<120;i++)fx.update(1.22,new Set(),new Set());
  assert.equal(images[0].frame,frame);assert.equal(images[0].destroyed,false);
  fx.update(1.56,new Set(),new Set());assert.equal(images[0].destroyed,true);
  fx.accept([hit(1,10,2)],2);fx.update(1,new Set(),new Set());assert.equal(images[1].destroyed,true);
  fx.accept(Array.from({length:110},(_,i)=>hit(2,20,100+i)),3);
  assert.equal(images.filter(i=>!i.destroyed).length,96);fx.destroy();assert.ok(images.every(i=>i.destroyed));
});

test('Stormlight uses its new duration while construction retains the original lifetime',()=>{
  const {scene,images}=renderer(),fx=new CombatEffects(scene);
  fx.accept([hit(5,20),{type:'build',tower:{x:200,y:260} as never}],1);
  assert.equal(images[0].key,evolutionImpact(5,20)!.key);
  assert.equal(images[1].depth,worldEffectDepth(260));
  fx.update(1.42,new Set(),new Set());assert.equal(images[0].destroyed,true);assert.equal(images[1].destroyed,false);
});

test('all five towers at all eight tiers trigger their impact in real combat without mutating the save',()=>{
  const earned=JSON.parse(readFileSync(new URL('../../../artifacts/idle-bastion/acceptance/wave-rework-v2/earned-balanced-late.json',import.meta.url),'utf8'));
  for(const [index,scenario] of (['warden','frost','slinger','sniper','storm'] as const).entries())for(const level of SKIN_LEVELS){
    const b=createTowerProbe(scenario,earned,level),kind=index+1;let events:BattleEvent[]=[];
    for(let tick=0;tick<1200;tick++){b.update(.025);events=b.drainEvents();if(events.some(e=>e.type==='hit'&&e.shot?.kind===kind&&e.shot.level===level))break;}
    assert.ok(events.some(e=>e.type==='hit'&&e.shot?.kind===kind&&e.shot.level===level),`${scenario} ${level} hits`);
    const before=b.snapshot(),{scene,images}=renderer(),fx=new CombatEffects(scene);
    fx.accept(events,b.elapsed);fx.update(b.elapsed+.1,new Set(),new Set());
    assert.ok(images.some(i=>i.key===evolutionImpact(kind,level)!.key&&!i.destroyed));
    assert.deepEqual(b.snapshot(),before);assert.deepEqual(IdleBattle.restore(before)?.snapshot(),before);fx.destroy();
  }
});
