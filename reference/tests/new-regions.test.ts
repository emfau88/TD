import assert from 'node:assert/strict';
import test from 'node:test';
import { pathCells, waterCells } from '../src/data';
import { WoodlandSimulation } from '../src/woodland-simulation';
import { decodeRegionSave } from '../src/region-save';
import { runCampaign } from '../scripts/balance';

for(const id of ['mirror-winter','windbreak'] as const)test(`M3: ${id} has connected paths, valid scenery and ten playable waves`,()=>{
  const sim=new WoodlandSimulation(id),water=waterCells(sim.map);
  for(const route of sim.map.paths)for(const key of pathCells(route)){
    if(water.has(key))assert.ok(sim.region.bridgeCells.has(key),`Route crosses blocked terrain at ${key}`);
    if(key!=='27,8')assert.ok(!sim.obstacles.has(key),`Scenery blocks ${key}`);
  }
  for(const [c,r]of id==='windbreak'?[[2,8],[12,12],[24,9]]:[[5,5],[12,12],[19,7]]){
    assert.ok(sim.command('wisp',{kind:'move',col:c,row:r}),`Companion cannot reach ${c},${r}`);sim.update(70);assert.equal(sim.heroes[0].path.length,0);
  }
  assert.equal(sim.command('wisp',{kind:'move',col:id==='windbreak'?8:14,row:8}),false);
  const checkpoint=sim.snapshot()!;assert.deepEqual(WoodlandSimulation.restore(checkpoint)?.snapshot(),checkpoint);
  const result=runCampaign(sim.map.id,new WoodlandSimulation(id));
  console.log(`${result.map}: ${result.lives} lives, ${result.kills} kills, ${result.towers} towers, ${result.seconds}s simulated.`);
  assert.equal(result.phase,'victory');assert.equal(result.wave,10);assert.ok(result.gold>=0);
});

test('M3: all four regions are present with independent progress from a fresh save',()=>{
  const save=decodeRegionSave(undefined);assert.equal(Object.keys(save.maps).length,4);
  for(const entry of Object.values(save.maps)){assert.equal(entry.stars,0);assert.equal(entry.checkpoint,undefined);}
});
