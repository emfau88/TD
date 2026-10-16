import assert from 'node:assert/strict';
import test from 'node:test';
import { center } from '../src/data';
import { WoodlandSimulation } from '../src/woodland-simulation';
import { runCampaign } from '../scripts/balance';

test('M2: the landscaped forest is winnable through all twenty waves with the normal budget',()=>{
  const result=runCampaign(0,new WoodlandSimulation());
  assert.equal(result.phase,'victory');assert.equal(result.wave,20);assert.ok(result.lives>0);assert.ok(result.gold>=0);
  console.log(`Forest result: ${result.lives} lives, ${result.kills} kills, ${result.towers} towers, ${result.seconds}s simulated.`);
  const undefended=new WoodlandSimulation();while(undefended.phase==='build'){undefended.startWave();undefended.update(180);}assert.equal(undefended.phase,'defeat');assert.equal(undefended.lives,0);
});

test('M2: Mara travels to a tower and acts before applying her timed boost',()=>{
  const sim=new WoodlandSimulation(),tower=sim.build(1,8,8)!;assert.ok(tower);
  assert.equal(sim.command('mara',{kind:'overclock',tower:tower.uid}),false);
  sim.startWave();assert.ok(sim.command('mara',{kind:'overclock',tower:tower.uid}));sim.update(.2);
  assert.equal(sim.boosts.size,0);assert.equal(sim.heroes[1].cooldown,0);
  sim.update(1.2);assert.ok(sim.boosts.has(tower.uid));assert.ok(sim.heroes[1].cooldown>29);
  assert.equal(sim.command('mara',{kind:'overclock',tower:tower.uid}),false);
  sim.update(8.1);assert.equal(sim.boosts.size,0);
});

test('M2: Wisp applies real slowing at the destination and rejects water',()=>{
  const sim=new WoodlandSimulation(),wisp=sim.heroes[0];Object.assign(wisp,center([2,7]));
  assert.equal(sim.command('wisp',{kind:'move',col:14,row:3}),false);
  sim.startWave();assert.ok(sim.command('wisp',{kind:'distract',col:2,row:7}));sim.update(.4);assert.equal(sim.distractions.length,0);
  sim.update(.5);assert.equal(sim.distractions.length,1);assert.ok(sim.enemies[0].slow>=.45);assert.ok(wisp.cooldown>21);
});

test('M2: checkpoints restore towers, priorities and companion positions without pending orders',()=>{
  const sim=new WoodlandSimulation(),tower=sim.build(1,8,8)!;sim.upgrade(tower.uid);tower.priority='strong';
  sim.command('mara',{kind:'move',col:9,row:7});sim.update(.1);
  const saved=sim.snapshot()!,restored=WoodlandSimulation.restore(JSON.parse(JSON.stringify(saved)))!;
  assert.ok(restored);assert.deepEqual(restored.snapshot(),saved);assert.equal(restored.heroes[1].order,undefined);
  const next=restored.build(1,8,7)!;assert.ok(next);assert.notEqual(next.uid,restored.towers[0].uid);
  sim.startWave();assert.equal(sim.snapshot(),undefined);
  assert.equal(WoodlandSimulation.restore({...saved,towers:[{...saved.towers[0],col:14,row:3}]}),undefined);
  assert.equal(WoodlandSimulation.restore({...saved,heroes:[saved.heroes[0],saved.heroes[0]]}),undefined);
});

test('M2: sold targets cancel pending actions; building cannot occupy a companion',()=>{
  const sim=new WoodlandSimulation(),tower=sim.build(1,8,8)!;assert.equal(sim.build(1,8,9),undefined);
  sim.startWave();sim.command('mara',{kind:'overclock',tower:tower.uid});sim.sell(tower.uid);sim.update(.1);
  assert.equal(sim.heroes[1].order,undefined);assert.equal(sim.heroes[1].cooldown,0);assert.equal(sim.boosts.size,0);
  assert.equal(sim.canWalk(27,8),false);
});
