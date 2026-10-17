import assert from 'node:assert/strict';
import test from 'node:test';
import { ENEMIES, type EnemyDef } from '../src/data';
import { JELLY_HEAL, LANTERN_JELLY } from '../src/jelly';
import { Simulation, type Enemy } from '../src/simulation';
import { REGION_WAVE_COUNT, regionWaveComposition } from '../src/region-waves';
import { WoodlandSimulation } from '../src/woodland-simulation';
import { runCampaign } from '../scripts/balance';

function enemy(uid:number,hp:number,def:EnemyDef=ENEMIES[0],x=300):Enemy{
  return {uid,def,x,y:300,hp,maxHp:100,distance:0,total:10000,path:[{x,y:300},{x:x+10000,y:300}],segment:0,speed:0,slow:0,slowTime:0,burn:0,burnTime:0,boss:false,direction:'side',flip:false,...(def.healer?{nextHealAt:0}:{})};
}
function encounter(enemies:Enemy[]){const sim=new Simulation(0);sim.wave=4;sim.phase='wave';sim.enemies=enemies;return sim;}

test('healing caps hit points, excludes ineligible units and cannot stack across two healers',()=>{
  const healer=enemy(1,10,LANTERN_JELLY),second=enemy(2,5,LANTERN_JELLY),hurt=enemy(3,20),almostFull=enemy(4,99);
  const boss={...enemy(5,1),boss:true},outside=enemy(6,1,ENEMIES[0],401),dead=enemy(7,0),full=enemy(8,100);
  const sim=encounter([healer,second,hurt,almostFull,boss,outside,dead,full]);
  sim.update(.025);assert.equal(sim.drainEvents().filter(event=>event.type==='heal-start').length,2);
  sim.update(.2);
  assert.equal(hurt.hp,26);assert.equal(almostFull.hp,100);assert.equal(healer.hp,10);assert.equal(second.hp,5);
  assert.equal(boss.hp,1);assert.equal(outside.hp,1);assert.equal(dead.hp,0);assert.equal(full.hp,100);
  const pulse=sim.drainEvents().filter(event=>event.type==='heal');assert.equal(pulse.length,1);assert.equal(pulse[0].amount,7);
  assert.deepEqual(pulse[0].healedTargets?.map(target=>[target.enemy.uid,target.amount]),[[3,6],[4,1]]);
  sim.update(1.975);assert.equal(hurt.hp,26,'No second pulse before the full two-second interval');
  sim.update(.025);assert.equal(hurt.hp,32,'The next pulse arrives two simulation seconds after the first');
});

test('the two most injured targets are selected stably and casting uses simulation time and a frozen facing',()=>{
  const healer=enemy(1,100,LANTERN_JELLY),a=enemy(4,20),b=enemy(3,20),c=enemy(5,90);
  healer.speed=43;healer.path=[{x:300,y:300},{x:310,y:300},{x:310,y:1300}];healer.total=1010;
  const sim=encounter([healer,a,b,c]);sim.update(.025);
  const action=healer.healAction!;assert.equal(action.direction,'side');assert.equal(action.flip,false);
  sim.phase='build';sim.update(10);assert.equal(sim.elapsed,.025);assert.equal(a.hp,20,'Build/menu time does not advance the cast');
  sim.phase='wave';sim.update(.25);assert.equal(healer.direction,'down');assert.equal(healer.healAction?.direction,'side');
  const pulse=sim.drainEvents().find(event=>event.type==='heal')!;
  assert.deepEqual(pulse.healedTargets?.map(target=>target.enemy.uid),[3,4]);assert.equal(c.hp,90);
  sim.update(.15);assert.equal(healer.healAction,undefined,'The 400-ms cast releases its facing for movement');
});

test('burn and projectile deaths are resolved before the pulse, regardless of enemy order',()=>{
  for(const cause of ['healer-burn','target-burn','healer-shot'] as const){
    const healer=enemy(1,100,LANTERN_JELLY),target=enemy(2,20),sim=encounter([healer,target]);
    sim.phase='build';const owner=sim.build(1,8,8)!;sim.towers=[];sim.phase='wave';sim.elapsed=.19;
    healer.healAction={startedAt:0,direction:'side',flip:false,pulsed:false};healer.nextHealAt=2;
    if(cause==='healer-shot')sim.shots.push({uid:3,tower:owner,target:healer.uid,x:healer.x,y:healer.y,speed:100,damage:200,level:1});
    else {const victim=cause==='healer-burn'?healer:target;victim.hp=1;victim.burn=1000;victim.burnTime=1;victim.burnSource=owner;}
    sim.update(.025);
    assert.equal(sim.drainEvents().filter(event=>event.type==='heal').length,0,cause);
    if(cause==='target-burn')assert.ok(target.hp<=0);else {assert.ok(healer.hp<=0);assert.equal(target.hp,20);}
  }
});

test('only Moor waves 4, 7 and 9 introduce healers; the historical roster and all other region plans stay intact',()=>{
  assert.equal(ENEMIES.length,8);assert.ok(!ENEMIES.some(enemy=>enemy.healer));
  const marsh=new WoodlandSimulation('lantern-marsh');
  for(let wave=1;wave<=REGION_WAVE_COUNT;wave++){
    const original=regionWaveComposition(wave),moor=marsh.compositionForWave(wave);
    assert.equal(moor.filter(entry=>entry.type.healer).length,wave===4?1:wave===7||wave===9?2:0);
    assert.deepEqual(moor.filter(entry=>!entry.type.healer),original);
    for(const region of ['old-grove','mirror-winter','windbreak'] as const)assert.deepEqual(regionWaveComposition(wave,region).filter(entry=>!entry.type.charmer),original);
  }
  assert.equal(new Simulation(0).waveLimit,20);assert.equal(JELLY_HEAL.maxTargets,2);
});

test('the Moor healer waves are beatable with the existing towers and normal budget',()=>{
  const result=runCampaign(1,new WoodlandSimulation('lantern-marsh'));
  assert.equal(result.phase,'victory');assert.equal(result.wave,10);assert.ok(result.lives>0);assert.ok(result.gold>=0);
  console.log(`Moor with healers: ${result.lives} lives, ${result.kills} kills, ${result.towers} towers, ${result.seconds}s simulated.`);
});
