import assert from 'node:assert/strict';
import test from 'node:test';
import { PLAYABLE_MAPS,CELL,ENEMIES,MAPS,center,platformCells,type EnemyDef,type Point } from '../src/data';
import { findHeroPath } from '../src/companions';
import { Simulation,type Enemy } from '../src/simulation';

function stationary(point:Point,def:EnemyDef=ENEMIES[0],uid=8000):Enemy{
  return {...point,uid,def,hp:10000,maxHp:10000,path:[point,{x:point.x+2000,y:point.y}],distance:0,total:2000,segment:0,speed:0,slow:0,slowTime:0,burn:0,burnTime:0,boss:false,direction:'side',flip:false};
}
function finishAction(sim:Simulation,id='wisp'){
  for(let step=0;step<2400&&sim.heroes.find(hero=>hero.id===id)?.target;step++)sim.update(.025);
  assert.equal(sim.heroes.find(hero=>hero.id===id)?.target,null);
}

test('the playable release has exactly five curated regions with ten waves and a required core each',()=>{
  assert.equal(PLAYABLE_MAPS.length,5);
  assert.deepEqual(PLAYABLE_MAPS.map(map=>map.id),[4,7,10,16,3]);
  assert.equal(new Set(PLAYABLE_MAPS.map(map=>map.name)).size,5);
  assert.equal(new Set(PLAYABLE_MAPS.map(map=>JSON.stringify(map.paths))).size,5);
  assert.equal(MAPS[3].campaignOrder,17);
  assert.deepEqual(MAPS.slice(0,3).map(map=>map.id),[0,1,2]);
  for(const map of PLAYABLE_MAPS){
    assert.ok(map.story?.intro&&map.story?.outro&&map.mechanism);
    assert.equal(map.waves,10);
    assert.equal(map.objectives?.some(objective=>objective.required),true);
  }
});

test('both companions spawn visibly inside the five authored maps, away from the Spire and objects',()=>{
  for(const map of PLAYABLE_MAPS){
    const sim=new Simulation(map.id),base=center(map.goal!);
    for(const hero of sim.heroes){
      assert.ok(hero.x>=40&&hero.x<=1080&&hero.y>=68&&hero.y<=600,`${map.name}: ${hero.id} must fit inside the viewport`);
      assert.ok(Math.hypot(hero.x-base.x,hero.y-base.y)>=CELL*1.8);
      assert.ok(!sim.objectives.some(objective=>objective.x===hero.x&&objective.y===hero.y));
    }
  }
});

test('navigation uses safe cardinal steps and refuses isolated goals instead of crossing corners',()=>{
  const walkable=new Set(['1,1','2,1','3,1','3,2','3,3','2,3']);
  const route=findHeroPath([1,1],[2,3],(col,row)=>walkable.has(`${col},${row}`));
  assert.deepEqual(route,[[2,1],[3,1],[3,2],[3,3],[2,3]]);
  assert.equal(findHeroPath([1,1],[2,2],(col,row)=>walkable.has(`${col},${row}`)),undefined);
  assert.equal(findHeroPath([1,1],[Number.NaN,2],()=>true),undefined);
});

test('diagonal Moon bridges remain connected for cardinal hero navigation and seven plazas stay distinct',()=>{
  for(const map of PLAYABLE_MAPS.filter(map=>map.theme==='moon')){
    const sim=new Simulation(map.id),goal=map.goal!;
    assert.equal(map.islands?.length,7);
    for(let i=0;i<map.islands!.length;i++)for(let j=i+1;j<map.islands!.length;j++){
      const [ax,ay,arx,ary]=map.islands![i],[bx,by,brx,bry]=map.islands![j];
      assert.ok(Math.abs(ax-bx)>arx+brx||Math.abs(ay-by)>ary+bry,'Plaza bounds must not merge into a single landmass');
    }
    for(const route of map.paths){assert.ok(findHeroPath(route[0],[goal[0]-1,goal[1]],(col,row)=>sim.canWalk(col,row)));}
    for(const hero of sim.heroes)assert.ok(Math.abs(hero.x-center(goal).x)>=CELL*2&&Math.abs(hero.y-center(goal).y)<1);
  }
});

test('companions move during build time and never advance wave queues or combat time',()=>{
  const sim=new Simulation(3),hero=sim.heroes[0],before={x:hero.x,y:hero.y};
  assert.ok(sim.commandHero('wisp',3,3));
  const route=hero.path.map(point=>[Math.floor(point.x/CELL),Math.floor(point.y/CELL)]);
  assert.ok(route.length>10);
  assert.ok(route.every(([col,row])=>sim.canWalk(col,row)));
  sim.update(.1);assert.ok(Math.hypot(hero.x-before.x,hero.y-before.y)>0);
  finishAction(sim);
  assert.deepEqual({x:hero.x,y:hero.y},center([3,3]));
  assert.equal(sim.wave,0);assert.equal(sim.elapsed,0);assert.equal(sim.remaining,0);
  const voidCell=[...Array(28).keys()].flatMap(col=>[...Array(16).keys()].map(row=>[col,row])).find(([col,row])=>!platformCells(sim.map).has(`${col},${row}`))!;
  assert.equal(sim.commandHero('wisp',voidCell[0],voidCell[1]),false);
});

test('a newly built tower causes a moving companion to reroute, never pass through it',()=>{
  const sim=new Simulation(0),hero=sim.heroes[0];hero.x=center([8,8]).x;hero.y=center([8,8]).y;
  assert.ok(sim.commandHero('wisp',11,8));
  assert.ok(sim.build(1,9,8));
  sim.update(.025);
  assert.ok(hero.path.every(point=>point.x!==center([9,8]).x||point.y!==center([9,8]).y));
  finishAction(sim);
  assert.deepEqual({x:hero.x,y:hero.y},center([11,8]));
});

test('objective rewards require arrival and are awarded once; required final rune gates victory',()=>{
  const sim=new Simulation(3),rune=sim.objectives.find(item=>item.required)!,gold=sim.gold;
  sim.wave=sim.totalWaves;sim.phase='wave';sim.update(.025);
  assert.equal(sim.phase,'build');assert.equal(sim.awaitingObjective,true);
  assert.equal(sim.startWave(),false);
  assert.ok(sim.commandAction('wisp','rune',rune.id));
  assert.equal(rune.completed,false);assert.equal(sim.gold,gold+65);
  finishAction(sim);
  assert.equal(rune.completed,true);assert.equal(sim.phase,'victory');assert.equal(sim.gold,gold+65+rune.reward);
  assert.ok(sim.heroes.every(hero=>hero.state==='celebrate'));
  assert.equal(sim.commandAction('wisp','rune',rune.id),false);
  assert.equal(sim.drainEvents().filter(event=>event.type==='victory').length,1);
});

test('all mission objectives can be reached without crossing water, void or tower plots',()=>{
  for(const map of PLAYABLE_MAPS){
    const sim=new Simulation(map.id);
    for(const objective of sim.objectives.filter(objective=>objective.kind!=='station')){
      assert.ok(sim.commandAction('wisp',objective.kind,objective.id),`${map.name}: ${objective.label}`);
      assert.ok(sim.heroes[0].path.every(point=>sim.canWalk(Math.floor(point.x/CELL),Math.floor(point.y/CELL))));
      finishAction(sim);assert.ok(objective.completed);
    }
  }
});

test('selling Maras target during travel cancels the action without remote boost or cooldown',()=>{
  const sim=new Simulation(3),tower=sim.build(1,4,2)!;assert.ok(tower);
  sim.phase='wave';sim.enemies=[stationary(center([14,8]))];
  assert.ok(sim.overclock(tower.uid));assert.equal(sim.isOverclocked(tower),false);
  sim.sell(tower.uid);sim.update(.1);
  assert.equal(sim.heroes.find(hero=>hero.id==='mara')?.target,null);assert.equal(sim.maraCooldown,0);
});

test('Runa and Ilyra abilities run on arrival, have distinct effects and obey cooldowns',()=>{
  const sim=new Simulation(13,['runa','ilyra']);
  for(const hero of sim.heroes){hero.x=center([8,8]).x;hero.y=center([8,8]).y;}
  const ground=stationary(center([9,8]),ENEMIES[0],1),air=stationary(center([9,8]),ENEMIES[4],2);
  sim.phase='wave';sim.enemies=[ground,air];
  assert.ok(sim.commandAction('runa','point',[8,8]));assert.equal(ground.slowTime,0);
  sim.update(.5);assert.equal(ground.slow,.65);assert.ok(ground.slowTime>5);
  assert.equal(sim.commandAction('runa','point',[8,8]),false);
  assert.ok(sim.commandAction('ilyra','point',[8,8]));sim.update(.5);
  assert.equal(ground.hp,10000-75);assert.equal(air.hp,10000-145);
  assert.ok(sim.heroes.every(hero=>hero.cooldown>0));
  assert.equal(new Simulation(4).setParty(['runa','ilyra']),true,'Unlocked companions may revisit earlier missions');
});

test('checkpoints restore economy, towers, party and objectives and reject corrupt geometry',()=>{
  const sim=new Simulation(13,['runa','ilyra']),objective=sim.objectives[0];
  assert.ok(sim.commandAction('runa',objective.kind,objective.id));finishAction(sim,'runa');
  const tower=sim.build(1,8,8)!;assert.ok(tower);sim.upgrade(tower.uid);tower.priority='strong';
  sim.wave=2;sim.lives=17;sim.kills=31;
  const saved=sim.snapshot()!,restored=Simulation.restore(JSON.parse(JSON.stringify(saved)))!;
  assert.ok(restored);assert.deepEqual(restored.snapshot(),saved);
  assert.equal(restored.towers[0].def,sim.towers[0].def);
  assert.equal(Simulation.restore({...saved,gold:NaN}),undefined);
  assert.equal(Simulation.restore({...saved,towers:[{...saved.towers[0],col:-4}]}),undefined);
  assert.equal(Simulation.restore({...saved,heroes:[{...saved.heroes[0],x:NaN},saved.heroes[1]]}),undefined);
  sim.startWave();assert.equal(sim.snapshot(),undefined);
});

test('new enemy support abilities heal, hasten and disrupt their actual neighbours',()=>{
  const sim=new Simulation(0);sim.phase='wave';
  const ally=stationary({x:200,y:200});ally.hp=500;ally.speed=100;
  const healer=stationary({x:205,y:200},ENEMIES.find(def=>def.heal)!,1);
  const herald=stationary({x:210,y:200},ENEMIES.find(def=>def.haste)!,2);
  sim.enemies=[ally,healer,herald];sim.update(.1);
  assert.ok(ally.hp>500);assert.ok(Math.abs(ally.x-212.5)<.001);
  const tower=sim.build(1,8,8)!;assert.ok(tower);tower.cooldown=10;
  const ram=stationary({x:tower.x+10,y:tower.y},ENEMIES.find(def=>def.sabotage)!,3);
  sim.enemies=[ram];sim.update(.1);assert.ok(Math.abs(tower.cooldown-9.93)<.001);
});
