import assert from 'node:assert/strict';
import test from 'node:test';
import { CELL, pathCells, waterCells } from '../src/data';
import { WoodlandSimulation } from '../src/woodland-simulation';
import { REGIONS } from '../src/regions';
import { decodeRegionSave } from '../src/region-save';
import { runCampaign } from '../scripts/balance';

test('M3: water crossings are real bridges, unbuildable and reachable by companions',()=>{
  const sim=new WoodlandSimulation('lantern-marsh'),region=sim.region,water=waterCells(sim.map);
  for(const key of pathCells(sim.map.paths[0])){
    if(water.has(key))assert.ok(region.bridgeCells.has(key),`Unbridged route at ${key}`);
    if(key!=='27,8')assert.ok(!region.obstacles.has(key),`Obstacle on route at ${key}`);
  }
  for(const key of region.bridgeCells){const [c,r]=key.split(',').map(Number);assert.ok(sim.canWalk(c,r));assert.equal(sim.canBuild(c,r),false);}
  assert.equal(sim.command('wisp',{kind:'move',col:8,row:6}),false);
  for(const [c,r]of [[3,8],[12,13],[23,11]]){
    assert.ok(sim.command('wisp',{kind:'move',col:c,row:r}));
    for(const point of sim.heroes[0].path){const key=`${Math.floor(point.x/CELL)},${Math.floor(point.y/CELL)}`;assert.ok(!water.has(key)||region.bridgeCells.has(key));}
    sim.update(40);assert.equal(sim.heroes[0].path.length,0);
  }
});

test('M3: migrate woodland progress and keep both region checkpoints independent',()=>{
  const forest=new WoodlandSimulation();forest.build(1,8,8);
  const migrated=decodeRegionSave({version:1,sound:false,stars:2,best:20,checkpoint:forest.snapshot()});
  assert.equal(migrated.sound,false);assert.equal(migrated.maps['old-grove'].stars,2);
  assert.deepEqual(migrated.maps['old-grove'].checkpoint,forest.snapshot());
  const marsh=new WoodlandSimulation('lantern-marsh');assert.ok(marsh.build(1,12,4));
  migrated.maps['lantern-marsh'].checkpoint=marsh.snapshot();migrated.selected='lantern-marsh';
  const reloaded=decodeRegionSave(JSON.parse(JSON.stringify(migrated)));
  for(const region of REGIONS.slice(0,2)){const cp=reloaded.maps[region.key].checkpoint!;assert.equal(cp.map,region.key);assert.deepEqual(WoodlandSimulation.restore(cp)?.snapshot(),cp);}
  assert.equal(reloaded.selected,'lantern-marsh');
  migrated.maps['old-grove'].checkpoint=marsh.snapshot();assert.equal(decodeRegionSave(migrated).maps['old-grove'].checkpoint,undefined);
});

test('M3: Laternenmoor can be completed with the normal budget and ten varied waves',()=>{
  const result=runCampaign(1,new WoodlandSimulation('lantern-marsh'));
  console.log(`Marsh result: ${result.lives} lives, ${result.kills} kills, ${result.towers} towers, ${result.seconds}s simulated.`);
  assert.equal(result.phase,'victory');assert.equal(result.wave,10);assert.ok(result.lives>0);assert.ok(result.gold>=0);
});
