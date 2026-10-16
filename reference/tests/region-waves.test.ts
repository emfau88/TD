import assert from 'node:assert/strict';
import test from 'node:test';
import { ENEMIES } from '../src/data';
import { Simulation } from '../src/simulation';
import { WoodlandSimulation } from '../src/woodland-simulation';
import { REGION_WAVE_COUNT, regionWaveComposition } from '../src/region-waves';
import { decodeRegionSave } from '../src/region-save';

test('ten-wave pacing includes every enemy role and only two boss waves',()=>{
  assert.equal(REGION_WAVE_COUNT,10);
  const types=new Set<string>(),bossWaves:number[]=[];
  for(let wave=1;wave<=REGION_WAVE_COUNT;wave++){
    const enemies=regionWaveComposition(wave);assert.ok(enemies.length<=18);
    enemies.forEach(enemy=>types.add(enemy.type.id));
    if(enemies.some(enemy=>enemy.boss))bossWaves.push(wave);
  }
  assert.deepEqual([...types].sort(),ENEMIES.map(enemy=>enemy.id).sort());
  assert.deepEqual(bossWaves,[5,10]);assert.throws(()=>regionWaveComposition(11),RangeError);
  const sim=new WoodlandSimulation();sim.wave=10;assert.equal(sim.startWave(),false);
  assert.equal(new Simulation(0).waveLimit,20,'Historical comparison keeps its original pacing');
});

test('late twenty-wave checkpoints retain defense and resume before the new finale',()=>{
  const sim=new WoodlandSimulation();sim.build(1,8,8);
  const old={...sim.snapshot()!,version:1,wave:14};
  const migrated=decodeRegionSave({version:2,sound:false,selected:'old-grove',maps:{'old-grove':{best:20,stars:3,checkpoint:old}}});
  const progress=migrated.maps['old-grove'];assert.equal(progress.best,10);assert.equal(progress.stars,3);
  const restored=WoodlandSimulation.restore(progress.checkpoint)!;
  assert.equal(restored.wave,9);assert.equal(restored.gold,old.gold);
  assert.deepEqual(restored.snapshot()!.towers,old.towers);assert.deepEqual(restored.snapshot()!.heroes,old.heroes);
  assert.equal(restored.snapshot()!.version,2);
  assert.equal(WoodlandSimulation.restore({...old,version:2}),undefined);
});
