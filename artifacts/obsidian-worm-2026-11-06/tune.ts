import assert from 'node:assert/strict';
import{readFileSync,writeFileSync,existsSync}from'node:fs';
import{IdleBattle}from'../../experiments/idle-bastion/src/battle';
import{healthMultiplier}from'../../experiments/idle-bastion/src/balance';
import{run,offline}from'./simulate';
const read=(f:string)=>JSON.parse(readFileSync(new URL(f,import.meta.url),'utf8'));
let late:any;
if(existsSync(new URL('mixed-earned-late.json',import.meta.url)))late=read('mixed-earned-late.json');
else{const old=read('candidate-2/mixed-w35-24h.json'),away=offline(old.final,24);late=run('mixed',{initial:away.snapshot,cashOut:true,seconds:1800,ember:true});writeFileSync(new URL('mixed-earned-late.json',import.meta.url),JSON.stringify({offline:away.gold,...late}));}
const sources={relaxed:read('candidate-2/relaxed-w35-24h.json'),mixed:late,tactical:read('candidate-2/tactical-w30-24h.json')};
const results:any[]=[];
for(const style of ['relaxed','mixed','tactical']as const){
 const seed=sources[style].snapshots.clear44;assert.ok(seed,'earned W44 '+style);
 for(const returned of [false,true]){
  const away=returned?offline(seed,24):undefined;
  const spent=returned?run(style,{initial:away!.snapshot,cashOut:true,seconds:0,ember:true}):undefined;
  const snapshot=spent?.final??seed;
  for(const hp of [500,550,600,700]){
   const b=IdleBattle.restore(snapshot)!;assert.ok(b);b.update(2.2);assert.equal(b.wave,45);const e=b.wormEnemy!;assert.ok(e);
   // Isolated HP hypothesis only; all movement, targeting, heroes and damage use the real engine.
   e.def={...e.def,hp};e.maxHp=hp*healthMultiplier(45,b.waveRecipeVersion,true);e.hp=e.maxHp;
   const start=b.elapsed;let far=0,minHp=1;
   while(b.phase==='wave'&&b.elapsed-start<180){b.update(.025);far=Math.max(far,e.distance/e.total);if(e.hp>0)minHp=Math.min(minHp,e.hp/e.maxHp);b.drainEvents();}
   results.push({style,returned,hp,result:b.phase,seconds:+(b.elapsed-start).toFixed(2),farthest:+far.toFixed(3),remaining:b.phase==='defeat'?+minHp.toFixed(3):0,offline:away?.gold,spending:spent?.summary.returnSpending});
  }
 }
}
writeFileSync(new URL('hp-candidates.json',import.meta.url),JSON.stringify(results,null,2));console.log(JSON.stringify(results.map(({spending,...r})=>r),null,2));
