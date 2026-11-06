import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {IdleBattle,BASE,BATTLE_RULES_VERSION,waveCount,waveEnemy,isNormalFarmWave,type Shot} from '../src/battle';
import {waveRecipe,clearReward,spawnGap} from '../src/wave-recipes';
import {ENEMIES} from '../src/enemy-roster';
import {healthMultiplier} from '../src/balance';
import {wormNodes,isWorm} from '../src/worm';
import {certifyFarm} from '../src/farming';
import {battleLayout,DEFAULT_PLOTS,CORE_PLOTS} from '../src/layout';
const fixture=JSON.parse(readFileSync(new URL('./fixtures/wave-progression-v17.json',import.meta.url),'utf8'));
function encounter(wave=36){
 const s=IdleBattle.restore(fixture.before)!.snapshot();
 Object.assign(s,{highestCleared:wave-1,wave:wave-1,phase:'intermission',mode:'advance',advanceRequested:false,queue:[],enemies:[],shots:[],intermissionRemaining:0,spawnTimer:0,lives:20,farmWave:1});
 s.liveClearedWaves=s.liveClearedWaves.filter(w=>w<wave&&isNormalFarmWave(w));
 const b=IdleBattle.restore(s)!;assert.ok(b);b.update(.2);assert.equal(b.wave,wave);assert.equal(b.enemies.length,1);return b;
}
test('only W36 and W45 change; one worm, no escorts, same base gold budget, no offline farm',()=>{
 for(let wave=1;wave<=250;wave++){
  if(wave===15||wave===25)continue;
  if(wave===36||wave===45){
   assert.equal(waveCount(wave),1);assert.ok(isWorm(waveEnemy(wave,0).id));assert.equal(isNormalFarmWave(wave),false);
   const old=waveRecipe(wave,19),now=waveRecipe(wave);
   const gold=(r:typeof old)=>r.clearGold+r.enemies.reduce((sum,id)=>sum+ENEMIES[id].gold,0);
   assert.equal(gold(now),gold(old));assert.ok(waveCount(wave,19)>1);
  }else{
   assert.deepEqual(waveRecipe(wave,20),waveRecipe(wave,19));assert.equal(clearReward(wave,20),clearReward(wave,19));
   assert.equal(healthMultiplier(wave,20,false),healthMultiplier(wave,19,false));
   for(let i=1;i<=waveCount(wave);i++)assert.equal(spawnGap(wave,i,20),spawnGap(wave,i,19));
  }
 }
});
test('both encounters round-trip during entry, movement, damage and defeat; never coexist with creeps',()=>{
 for(const wave of [36,45]){
  let b=encounter(wave);assert.equal(b.wormBody(b.enemies[0]).length,1,'body emerges progressively');
  let max=0;
  for(let i=0;i<1000&&b.phase==='wave';i++){
   assert.equal(b.enemies.length,1);max=Math.max(max,b.wormBody(b.enemies[0]).length);
   if(i%40===0){const s=b.snapshot(),copy=IdleBattle.restore(s);assert.ok(copy);assert.deepEqual(copy.snapshot(),s);b=copy;}
   b.update(.1);b.drainEvents();
  }
  assert.ok(max>2);assert.notEqual(b.phase,'wave');assert.ok(IdleBattle.restore(b.snapshot()));
  assert.equal(b.liveClearedWaves.includes(wave),false);assert.notEqual(certifyFarm(b)?.wave,wave);
 }
});
test('visible parts shrink from the rear, stay on the route and do not pile up at the entrance',()=>{
 const b=encounter(45),e={...b.enemies[0],distance:700,hp:b.enemies[0].maxHp},path=[{x:0,y:0},{x:400,y:0},{x:400,y:400},{x:800,y:400}];
 assert.equal(wormNodes(e,path).length,32);e.hp=e.maxHp/2;assert.equal(wormNodes(e,path).length,17);
 e.distance=0;assert.equal(wormNodes(e,path).length,1);e.hp=0;assert.equal(wormNodes(e,path).length,0);
});
test('the full body follows all supported real maps without crossing non-neighbouring parts',()=>{
 for(const version of [3,4,5]as const){
  const b=new IdleBattle(battleLayout(false,version===5?CORE_PLOTS:DEFAULT_PLOTS,version));
  const path=(b as any).path,total=(b as any).pathLength,template=encounter(45).enemies[0];
  for(let distance=0;distance<total;distance+=4){
   const nodes=wormNodes({...template,hp:template.maxHp,distance},path);
   for(let i=0;i<nodes.length;i++)for(let j=i+2;j<nodes.length;j++)
    assert.ok(Math.hypot(nodes[i].x-nodes[j].x,nodes[i].y-nodes[j].y)>17,`body crossing on layout ${version}, distance ${distance}`);
  }
 }
});
test('Ilyra and Mara recognize a body in range while the head is far away; frost/volley affect it once',()=>{
 const b=encounter(45),e=b.enemies[0];(b as any).move(e,20);const point=b.wormBody(e).at(-3)!;
 assert.ok(Math.hypot(e.x-point.x,e.y-point.y)>200);
 assert.ok(b.ilyra);Object.assign(b.ilyra,{x:point.x,y:point.y,path:[],cooldown:0,volley:null,autoCast:true,introduction:'done'});
 assert.ok(b.canCastIlyra(point));(b as any).stepIlyra(.025);assert.ok(b.ilyra.volley);
 const v=b.ilyra.volley!,hp=e.hp;v.age=10;(b as any).stepIlyra(.025);
 assert.ok(Math.abs(hp-e.hp-v.damage*(1-e.def.armor))<1e-7);
 const tower=b.towers[0];tower.x=point.x;tower.y=point.y;Object.assign(b.mara,{x:point.x,y:point.y,targetTowerUid:tower.uid,path:[],unreachable:false,cooldownRemaining:0,effectRemaining:0,autoCast:true});
 b.update(.025);assert.ok(b.mara.effectRemaining>0);
});
test('body-only targets are in range; cannon/ember/chain hit one shared enemy, not every segment',()=>{
 const b=encounter(45),e=b.enemies[0];(b as any).move(e,16);
 const tail=b.wormBody(e).at(-1)!;assert.ok(Math.hypot(e.x-tail.x,e.y-tail.y)>100);assert.equal(b.enemyDistance(e,tail),0);
 for(const kind of [1,2,3,4,5,7] as const){
  e.hp=e.maxHp;delete e.burn;
  const point=b.wormBody(e).at(-2)!,before=e.hp;
  const shot:Shot={uid:999,towerUid:b.towers[0].uid,target:e.uid,x:point.x,y:point.y,speed:480,damage:100,level:1,kind,...(kind===5?{chainHits:[]}: {})};
  assert.equal((b as any).impact(shot,e,point),false);
  assert.equal(before-e.hp,kind===4?100:90);if(kind===5)assert.deepEqual(shot.chainHits,[e.uid]);
  if(kind===7)assert.ok(e.burn);if(kind===2)assert.ok(e.slowRemaining>0);
 }
 const oldGold=b.gold,oldKills=b.kills;e.hp=1;
 (b as any).hit({kind:1,damage:10,towerUid:b.towers[0].uid},e);const paid=b.gold-oldGold;
 (b as any).hit({kind:1,damage:10,towerUid:b.towers[0].uid},e);
 assert.ok(paid>0);assert.equal(b.gold-oldGold,paid);assert.equal(b.kills,oldKills+1);
});
test('head escape causes one defeat; no kill or segment gold',()=>{
 const b=encounter(),e=b.enemies[0],gold=b.gold,kills=b.kills;(b as any).move(e,10000);
 b.update(BASE.stepSeconds);assert.equal(b.phase,'defeat');assert.equal(b.lives,0);assert.equal(b.gold,gold);assert.equal(b.kills,kills);
 assert.ok(IdleBattle.restore(b.snapshot()));
});
test('rule-19 attempts and historical W36 farm evidence migrate without changing combat or money',()=>{
 const b=encounter(),s=b.snapshot();s.waveRecipeVersion=19;s.queue=waveRecipe(36,19).enemies.slice() as typeof s.queue;s.enemies=[];s.shots=[];s.spawnTimer=.15;
 const old:any={...s,schemaVersion:35,rulesVersion:19,highestCleared:36,liveClearedWaves:[1,36],farmWave:36};
 const copy=IdleBattle.restore(old);assert.ok(copy);assert.equal(copy.waveRecipeVersion,19);assert.equal(copy.gold,old.gold);
 assert.deepEqual(copy.snapshot().queue,old.queue);assert.equal(copy.farmWave,1);assert.deepEqual(copy.liveClearedWaves,[1]);
 copy.update(1);assert.ok(copy.enemies.every(e=>!isWorm(e.def.id)));assert.ok(IdleBattle.restore(copy.snapshot()));
 const bad=structuredClone(old);bad.rulesVersion=BATTLE_RULES_VERSION;bad.schemaVersion=36;assert.equal(IdleBattle.restore(bad),undefined);
});
