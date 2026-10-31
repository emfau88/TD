import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import type Phaser from 'phaser';
import { stormCastFrame, stormLinkStyle, stormLinkPoints, stormShotOrigin } from '../src/storm-visuals';
import { SKIN_LEVELS } from '../src/tower-evolution';
import { createTowerProbe } from '../src/tower-test-probes';
import { CombatEffects } from '../src/combat-effects';
import { IdleBattle, type BattleEvent, type Shot } from '../src/battle';

const earned=JSON.parse(readFileSync(new URL('../../../artifacts/idle-bastion/acceptance/wave-rework-v2/earned-balanced-late.json',import.meta.url),'utf8'));
test('all eight Stormlight tiers show chain hops from the hit enemy, never from their owner',()=>{
 for(const level of SKIN_LEVELS){
  const b=createTowerProbe('storm',earned,level),hits=new Map<number,{x:number;y:number}>();let hops=0,root=0;
  for(let tick=0;tick<1000&&hops<3;tick++){
   b.update(.025);const events=b.drainEvents();
   for(const e of events){
    if(e.shot?.kind!==5)continue;
    if(e.type==='hit')hits.set(e.shot.uid,{x:e.x!,y:e.y!});
    if(e.type==='fire'){
     const before=b.snapshot(),origin=stormShotOrigin(e,b.elapsed)!;
     if(e.tower){assert.equal(origin.model.y,e.tower.y-12);assert.equal(origin.muzzle.y,e.tower.y-18);root++;}
     else {assert.deepEqual(origin.muzzle,hits.get(e.shot.uid));assert.deepEqual(origin.model,origin.muzzle);hops++;}
     assert.deepEqual(b.snapshot(),before);assert.ok(e.shot.chainHits!.length<3);
    }
   }
  }
  assert.ok(root>0&&hops>0,`level ${level} launches and chains`);
  const copy=IdleBattle.restore(b.snapshot())!;assert.ok(copy);
  for(let i=0;i<40;i++){b.update(.025);copy.update(.025);}assert.deepEqual(copy.snapshot(),b.snapshot());
 }
});

test('lightning paths stay narrow with exact endpoints, finite coordinates and bounded lifetime',()=>{
 for(const level of SKIN_LEVELS)for(const length of [0,.1,10,80,500])for(let angle=0;angle<360;angle+=10){
  const a=angle*Math.PI/180,x=100+Math.cos(a)*length,y=150+Math.sin(a)*length;
  const points=stormLinkPoints(100,150,x,y,level,123),style=stormLinkStyle(level);
  assert.deepEqual(points[0],{x:100,y:150});assert.deepEqual(points.at(-1),{x,y});assert.ok(points.length<=11);
  for(const p of points){assert.ok(Number.isFinite(p.x)&&Number.isFinite(p.y));
   if(length>=1)assert.ok(Math.abs((p.x-100)*Math.sin(a)-(p.y-150)*Math.cos(a))<=5.151);}
  assert.ok(style.duration>=.13&&style.duration<.2);assert.ok(style.width<=3);
 }
 assert.equal(stormCastFrame(-1),0);assert.equal(stormCastFrame(0),1);assert.equal(stormCastFrame(.34),0);
 for(let i=0;i<340;i++)assert.ok(stormCastFrame(i/1000)>=1&&stormCastFrame(i/1000)<=11);
});

test('three chain contacts retain separate impacts; duplicate contacts collapse; links pause and cap at 48',()=>{
 const images:{key:string;destroyed:boolean}[]=[],links:{destroyed:boolean;alpha:number}[]=[];
 const scene={add:{image(_x:number,_y:number,key:string){const state={key,destroyed:false};images.push(state);return {setScale(){return this;},setOrigin(){return this;},setDepth(){return this;},setFrame(){return this;},destroy(){state.destroyed=true;}};},
  graphics(){const state={destroyed:false,alpha:1};links.push(state);return {setDepth(){return this;},lineStyle(){return this;},beginPath(){return this;},moveTo(){return this;},lineTo(){return this;},strokePath(){return this;},setAlpha(n:number){state.alpha=n;return this;},destroy(){state.destroyed=true;}};}}} as unknown as Phaser.Scene;
 const fx=new CombatEffects(scene),hit=(n:number):BattleEvent=>({type:'hit',x:100+n*30,y:200,shot:{uid:5,kind:5,level:25,chainHits:[11,12].slice(0,n)} as Shot});
 fx.accept([hit(0),hit(0),hit(1),hit(2)],1);assert.equal(images.length,3);assert.ok(images.every(i=>i.key==='evolution-impact-r5-5-25'));
 const event:BattleEvent={type:'fire',x:100,y:200,shot:{uid:5,kind:5,level:25,chainHits:[11]} as Shot,enemy:{x:150,y:200} as never};
 fx.accept(Array.from({length:55},()=>event),1);assert.equal(links.filter(l=>!l.destroyed).length,48);
 fx.update(1.05,new Set(),new Set());const alpha=links.at(-1)!.alpha;fx.update(1.05,new Set(),new Set());assert.equal(links.at(-1)!.alpha,alpha);
 fx.update(1.2,new Set(),new Set());assert.ok(links.every(l=>l.destroyed));assert.ok(images.every(i=>!i.destroyed));
 fx.destroy();assert.ok(images.every(i=>i.destroyed));
});
