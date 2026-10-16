import assert from 'node:assert/strict';
import test from 'node:test';
import { PLAYABLE_MAPS,CELL,ENEMIES,MAPS,center,waterCells,type EnemyDef,type Point } from '../src/data';
import { Simulation,type Enemy } from '../src/simulation';

function enemy(point:Point,def:EnemyDef,uid:number):Enemy{return {...point,uid,def,hp:10000,maxHp:10000,path:[point,{x:point.x+5000,y:point.y}],distance:0,total:5000,segment:0,speed:0,slow:0,slowTime:0,burn:0,burnTime:0,boss:false,direction:'side',flip:false};}
function activateStation(sim:Simulation){
  const station=sim.objectives.find(objective=>objective.kind==='station')!;
  assert.ok(station);assert.equal(sim.commandAction('wisp','station',station.id),false,'Stations cannot be wasted in build time');
  sim.phase='wave';sim.enemies=[enemy({x:station.x,y:station.y},ENEMIES[0],9000)];
  assert.ok(sim.commandAction('wisp','station',station.id));assert.equal(sim.regionEffect,undefined,'No remote activation');
  for(let time=0;time<60&&!sim.regionEffect;time+=.025)sim.update(.025);
  assert.ok(sim.regionEffect);assert.equal(station.uses,1);assert.ok(station.cooldown>29.9);
  assert.ok(Math.hypot(sim.heroes[0].x-station.x,sim.heroes[0].y-station.y)<CELL*1.08);
  assert.equal(sim.commandAction('mara','station',station.id),false,'Cooldown belongs to station, not to activating hero');
  return station;
}

test('the rounded frost lake leaves exactly four snowy corner cells walkable',()=>{
  const map=MAPS[16],water=waterCells(map),sim=new Simulation(16);
  assert.equal(water.size,76);
  for(const [col,row] of [[9,4],[18,4],[9,11],[18,11]]){assert.equal(water.has(`${col},${row}`),false);assert.equal(sim.canWalk(col,row),true);}
  for(const [col,row] of [[10,4],[17,4],[9,5],[18,10]])assert.equal(water.has(`${col},${row}`),true);
  assert.equal(waterCells(MAPS[4]).size,6*4+5*3,'Other maps retain rectangular water collision');
});

test('each region station is reachable and only activates after an on-site interaction',()=>{
  for(const map of PLAYABLE_MAPS.filter(map=>['forest','marsh','frost'].includes(map.theme!))){
    const sim=new Simulation(map.id);const station=activateStation(sim);
    const expected={forest:'roots',marsh:'silence',ember:'overdrive',frost:'thaw'}[map.theme as 'forest'|'marsh'|'ember'|'frost'];
    assert.equal(sim.regionEffect?.type,expected);assert.equal(sim.drainEvents().filter(event=>event.type==='station').length,1);
    sim.enemies=[];sim.update(.025);assert.equal(sim.regionEffect,undefined);assert.equal(station.activeRemaining,0);
    const restored=Simulation.restore(sim.snapshot())!;assert.ok(restored);assert.ok(restored.objectives.find(objective=>objective.kind==='station')!.cooldown>0);
    assert.equal(restored.objectives.find(objective=>objective.kind==='station')!.uses,1);
  }
});

test('forest root station halves ground movement inside its zone and spares air and distant enemies',()=>{
  const sim=new Simulation(4),station=activateStation(sim);
  const ground=enemy({x:station.x,y:station.y},ENEMIES[0],1),air=enemy({x:station.x,y:station.y},ENEMIES[4],2),far=enemy({x:station.x-300,y:station.y},ENEMIES[0],3);
  for(const item of [ground,air,far])item.speed=100;sim.enemies=[ground,air,far];sim.update(.1);
  assert.ok(Math.abs(ground.x-station.x-5)<.001);assert.ok(Math.abs(air.x-station.x-10)<.001);assert.ok(Math.abs(far.x-(station.x-300)-10)<.001);
});

test('marsh bell suppresses healing and expired effect restores healer behavior',()=>{
  const sim=new Simulation(7),station=activateStation(sim);
  const patient=enemy({x:station.x,y:station.y},ENEMIES[0],1),healer=enemy({x:station.x+20,y:station.y},ENEMIES.find(def=>def.heal)!,2);patient.hp=500;sim.enemies=[patient,healer];
  sim.update(.5);assert.equal(patient.hp,500);
  sim.regionEffect!.remaining=.01;sim.update(.1);assert.ok(patient.hp>500);
});

test('ember steam station increases turret firing progress by 25 percent',()=>{
  const sim=new Simulation(13);activateStation(sim);
  const tower=sim.build(1,8,8)!;assert.ok(tower);tower.cooldown=10;
  sim.enemies=[enemy({x:tower.x+20,y:tower.y},ENEMIES[0],1)];sim.update(.4);
  assert.ok(Math.abs(tower.cooldown-9.5)<.001);
});

test('frost thaw station cancels the Frost Rams disruption and expiry restores it',()=>{
  const sim=new Simulation(16);activateStation(sim);
  const tower=sim.build(1,6,8)!;assert.ok(tower);tower.cooldown=10;
  sim.enemies=[enemy({x:tower.x+20,y:tower.y},ENEMIES.find(def=>def.sabotage)!,1)];sim.update(.4);
  assert.ok(Math.abs(tower.cooldown-9.6)<.001);delete sim.regionEffect;sim.update(.4);assert.ok(Math.abs(tower.cooldown-9.32)<.001);
});

test('wind and moon previews equal actual spawning routes and only change between waves',()=>{
  const wind=new Simulation(10);const first=JSON.stringify(wind.activeAir);wind.wave=3;assert.notEqual(JSON.stringify(wind.activeAir),first);
  wind.startWave();wind.update(3);for(const flying of wind.enemies.filter(enemy=>enemy.def.flying))assert.deepEqual(flying.path,wind.activeAir.map(center));
  const held=JSON.stringify(wind.activeAir);wind.wave=6;assert.equal(JSON.stringify(wind.activeAir),held);wind.phase='build';assert.equal(JSON.stringify(wind.activeAir),first);
  const moon=new Simulation(3);assert.equal(moon.activePaths.length,2);moon.wave=6;assert.equal(moon.activePaths.length,4);
});

test('corrupt checkpoint arrays, fractional resources and repeated IDs are safely rejected',()=>{
  const sim=new Simulation(4),saved=sim.snapshot()!;
  for(const invalid of [{...saved,heroes:[null,null]},{...saved,heroes:[saved.heroes[0],saved.heroes[0]]},{...saved,gold:.5},{...saved,kills:1.5},{...saved,objectives:['supply','supply']},{...saved,stations:[null]},{...saved,stations:[{id:'region-station',cooldown:-1,uses:0}]},{...saved,stations:[{id:'region-station',cooldown:0,uses:1.5}]}]){
    assert.doesNotThrow(()=>Simulation.restore(invalid));assert.equal(Simulation.restore(invalid),undefined);
  }
});

test('Wisp panic only distracts ground enemies as advertised',()=>{
  const sim=new Simulation(4),hero=sim.heroes[0],point={x:hero.x,y:hero.y};
  const ground=enemy(point,ENEMIES[0],1),air=enemy(point,ENEMIES[4],2);sim.enemies=[ground,air];sim.phase='wave';
  assert.ok(sim.commandAction('wisp','point',[Math.floor(hero.x/CELL),Math.floor(hero.y/CELL)]));sim.update(.6);
  assert.ok(ground.slowTime>0);assert.equal(air.slowTime,0);
});
