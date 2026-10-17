import assert from 'node:assert/strict';
import test from 'node:test';
import { ENEMIES, type EnemyDef } from '../src/data';
import { ROSENSPIEGEL, SUCCUBUS_CHARM } from '../src/succubus';
import { Simulation, type Enemy, type Tower } from '../src/simulation';
import { WoodlandSimulation } from '../src/woodland-simulation';
import { REGION_WAVE_COUNT, regionWaveComposition } from '../src/region-waves';
import { runCampaign } from '../scripts/balance';

function enemy(uid=100,def:EnemyDef=ROSENSPIEGEL,x=160,y=340):Enemy{
  return {uid,def,x,y,hp:1000,maxHp:1000,distance:0,total:10000,path:[{x,y},{x:x+10000,y}],segment:0,speed:0,slow:0,slowTime:0,burn:0,burnTime:0,boss:false,direction:'side',flip:false};
}
function encounter(sim:Simulation=new Simulation(0)){
  sim.gold=10000;const tower=sim.build(1,8,8)!;assert.ok(tower);tower.cooldown=100;
  const caster=enemy();sim.wave=6;sim.phase='wave';sim.enemies=[caster];return {sim,tower,caster};
}
const close=(actual:number,expected:number)=>assert.ok(Math.abs(actual-expected)<1e-8,`${actual} differs from ${expected}`);
const STEP=.025;

test('one target is announced outside short tower range, then slowed for the full configured channel while the caster dances',()=>{
  const {sim,tower,caster}=encounter();caster.speed=42;
  assert.ok(Math.hypot(tower.x-caster.x,tower.y-caster.y)>tower.def.range);
  sim.update(.025);const start=sim.elapsed,position={x:caster.x,y:caster.y};
  assert.equal(caster.charmAction?.targetUid,tower.uid);assert.equal(caster.charmAction.active,false);
  assert.equal(caster.nextCharmAt,start+SUCCUBUS_CHARM.cooldown);
  assert.equal(sim.drainEvents().filter(event=>event.type==='charm-start').length,1);
  const windupDuration=SUCCUBUS_CHARM.windup-STEP;
  const windupCooldown=tower.cooldown;sim.update(windupDuration);close(tower.cooldown,windupCooldown-windupDuration);
  assert.equal(caster.charmAction?.active,false);
  sim.update(.025);assert.equal(caster.charmAction?.active,true);
  assert.equal(sim.drainEvents().filter(event=>event.type==='charm').length,1);
  const activeDuration=SUCCUBUS_CHARM.channel-STEP;
  const activeCooldown=tower.cooldown;sim.update(activeDuration);close(tower.cooldown,activeCooldown-activeDuration*SUCCUBUS_CHARM.rateMultiplier);
  assert.deepEqual({x:caster.x,y:caster.y},position,'The full dance holds the caster in place');
  sim.update(.025);assert.equal(caster.charmAction,undefined);
  const end=sim.drainEvents().find(event=>event.type==='charm-end');assert.equal(end?.reason,'complete');
  close(tower.charmRecoveryUntil!,sim.elapsed+SUCCUBUS_CHARM.recovery);
  sim.update(.025);assert.ok(caster.x>position.x,'Walking resumes after the dance');
});

test('windup and charm pause without updates, and alternate time step sizes produce the same fire-rate effect',()=>{
  const first=encounter(),second=encounter();first.sim.update(.025);second.sim.update(.025);
  const initial=first.caster.charmAction!.startedAt;first.sim.update(0);first.sim.update(Number.NaN);
  assert.equal(first.sim.elapsed,.025);assert.equal(first.caster.charmAction?.startedAt,initial);
  first.sim.update(2);for(let i=0;i<80;i++)second.sim.update(.025);
  close(first.tower.cooldown,second.tower.cooldown);assert.equal(first.caster.charmAction?.active,true);
});

test('a tower cannot be charmed twice at once or immediately after recovery, and range is fixed at 200',()=>{
  const {sim,tower,caster}=encounter();const second=enemy(101);sim.enemies.push(second);
  sim.update(.025);assert.ok(caster.charmAction);assert.equal(second.charmAction,undefined);
  sim.update(SUCCUBUS_CHARM.windup+SUCCUBUS_CHARM.channel);assert.equal(caster.charmAction,undefined);assert.equal(second.charmAction,undefined);
  sim.update(SUCCUBUS_CHARM.recovery-STEP);assert.equal(second.charmAction,undefined);
  sim.update(.025);assert.equal(sim.enemies.filter(unit=>unit.charmAction).length,1);
  const outside=encounter();outside.caster.x=outside.tower.x-200.01;outside.sim.update(.025);assert.equal(outside.caster.charmAction,undefined);
  outside.caster.x=outside.tower.x-200;outside.sim.update(.025);assert.ok(outside.caster.charmAction);
  assert.equal(tower.def.range,132,'The target tower range does not determine charm reach');
});

test('death, sale, escape, loss of range and wave end release the target immediately',()=>{
  for(const reason of ['kill','sold','escape','range','wave-end'] as const){
    const {sim,tower,caster}=encounter();sim.update(SUCCUBUS_CHARM.windup+STEP);assert.equal(caster.charmAction?.active,true);sim.drainEvents();
    if(reason==='kill')sim.shots.push({uid:500,tower,target:caster.uid,x:caster.x,y:caster.y,speed:100,damage:2000,level:1});
    if(reason==='sold')assert.equal(sim.sell(tower.uid),true);
    if(reason==='escape')caster.segment=caster.path.length-1;
    if(reason==='range')caster.x=tower.x-200.1;
    if(reason==='wave-end')sim.phase='build';
    if(reason!=='sold')sim.update(.025);
    assert.equal(caster.charmAction,undefined,reason);
    assert.equal(sim.drainEvents().find(event=>event.type==='charm-end')?.reason,reason);
    if(reason!=='sold')assert.ok(tower.charmRecoveryUntil!>sim.elapsed);
  }
});

test('Mara boost and charm multiply to 90 percent; boost expiry keeps its exact duration',()=>{
  for(const remaining of [8,.05]){
    const {sim,tower,caster}=encounter(new WoodlandSimulation());
    const woodland=sim as WoodlandSimulation;woodland.elapsed=SUCCUBUS_CHARM.windup;
    caster.charmAction={startedAt:0,targetUid:tower.uid,direction:'side',flip:false,active:true};caster.nextCharmAt=SUCCUBUS_CHARM.cooldown;
    woodland.boosts.set(tower.uid,remaining);tower.cooldown=10;woodland.update(.1);
    close(tower.cooldown,10-(Math.min(remaining,.1)*1.5+Math.max(0,.1-remaining))*.6);
    if(remaining===.05)assert.equal(woodland.boosts.size,0);
  }
});

test('only Windbruch waves 6 and 9 gain one ground caster; saves omit all temporary charm state',()=>{
  assert.equal(ENEMIES.length,8);assert.equal(ROSENSPIEGEL.flying,false);
  for(let wave=1;wave<=REGION_WAVE_COUNT;wave++){
    const original=regionWaveComposition(wave),wind=regionWaveComposition(wave,'windbreak');
    assert.equal(wind.filter(entry=>entry.type.charmer).length,wave===6||wave===9?1:0);
    assert.deepEqual(wind.filter(entry=>!entry.type.charmer),original);
    for(const region of ['old-grove','mirror-winter'] as const)assert.deepEqual(regionWaveComposition(wave,region),original);
  }
  const sim=new WoodlandSimulation('windbreak');sim.gold=10000;
  let tower:Tower|undefined;for(let row=1;row<15&&!tower;row++)for(let col=1;col<27&&!tower;col++)tower=sim.build(1,col,row);
  assert.ok(tower);tower.charmRecoveryUntil=100;
  const saved=sim.snapshot()!;assert.equal('charmRecoveryUntil' in saved.towers[0],false);
  const restored=WoodlandSimulation.restore(saved)!;assert.ok(restored);assert.equal(restored.towers[0].charmRecoveryUntil,undefined);
  assert.equal(new Simulation(0).waveLimit,20);
});

test('Windbruch remains beatable with the current towers and normal budget',()=>{
  const result=runCampaign(3,new WoodlandSimulation('windbreak'));
  assert.equal(result.phase,'victory');assert.equal(result.wave,10);assert.ok(result.lives>0);assert.ok(result.gold>=0);
  console.log(`Windbruch with Rosenspiegel: ${result.lives} lives, ${result.kills} kills, ${result.towers} towers, ${result.seconds}s simulated.`);
});
