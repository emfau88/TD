import assert from 'node:assert/strict';
import {readFileSync,readdirSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {IdleBattle,waveCount,waveEnemy,BATTLE_RULES_VERSION} from '../../experiments/idle-bastion/src/battle';
import {healthMultiplier,battleRewardUnits} from '../../experiments/idle-bastion/src/balance';
import {waveRecipe,clearReward,spawnGap,enemyPressure} from '../../experiments/idle-bastion/src/wave-recipes';
import {certifyFarm,farmRewardGold} from '../../experiments/idle-bastion/src/farming';
const here=new URL('.',import.meta.url),old=new URL('../waves-26-50-study-2026-11-02/',import.meta.url);
const read=(url:URL)=>JSON.parse(readFileSync(url,'utf8'));
const hash=(url:URL)=>createHash('sha256').update(readFileSync(url)).digest('hex');
const manifest=read(new URL('frozen.json',old));
const allowed=['balance.ts','battle.ts','offline.ts','wave-recipes.ts'];
for(const [file,digest] of Object.entries(manifest.sourceManifest))if(!allowed.includes(file))
  assert.equal(hash(new URL(`../../experiments/idle-bastion/src/${file}`,here)),digest,`unrelated source ${file}`);
for(const variant of ['control','B'])for(const [file,digest] of Object.entries(manifest.variants[variant].files))
  assert.equal(hash(new URL(`${variant}/engine/${file}`,old)),digest,`frozen baseline ${variant}/${file}`);
for(const variant of ['B2','B3']){
  const frozen=read(new URL(variant==='B2'?'frozen.json':'B3-frozen.json',here));
  for(const [file,digest] of Object.entries(frozen))assert.equal(hash(new URL(`${variant}/${file}`,here)),digest);
}
const runs=readdirSync(new URL('integrated/runs/',here)).filter(f=>f.endsWith('.json'));
assert.equal(runs.length,19);
const fought=new Set<number>();
for(const file of runs){
  const actual=read(new URL('integrated/runs/'+file,here)),expected=read(new URL('B3/runs/'+file,here));
  for(const key of ['summary','rows','purchases'])assert.deepEqual(actual[key],expected[key],file+' '+key);
  assert.deepEqual({...actual.final,schemaVersion:33,rulesVersion:17,waveRecipeVersion:17},expected.final,file+' final');
  assert.deepEqual(IdleBattle.restore(actual.final)!.snapshot(),actual.final,file+' roundtrip');
  if('offline' in actual)assert.equal(actual.offline,expected.offline,file+' offline');
  for(const row of actual.rows)fought.add(row.wave);
}
for(let w=26;w<=50;w++)assert.ok(fought.has(w),`W${w} actually fought`);
const model=await import('./B3/engine/battle');
const balance=await import('./B3/engine/balance');
const recipe=await import('./B3/engine/wave-recipes');
const recipes=[];
for(let wave=1;wave<=250;wave++){
  const es=Array.from({length:waveCount(wave)},(_,i)=>waveEnemy(wave,i));
  assert.equal(es.length,model.waveCount(wave,17));
  assert.equal(healthMultiplier(wave,BATTLE_RULES_VERSION,wave===15||wave===25),balance.healthMultiplier(wave,17,wave===15||wave===25));
  for(let i=0;i<es.length;i++){assert.deepEqual(es[i],model.waveEnemy(wave,i,17));assert.equal(spawnGap(wave,i+1,BATTLE_RULES_VERSION),recipe.spawnGap(wave,i+1,17));}
  assert.equal(clearReward(wave,BATTLE_RULES_VERSION),recipe.clearReward(wave,17));
  const composition=Object.fromEntries([...new Set(es.map(e=>e.id))].map(id=>[id,es.filter(e=>e.id===id).length]));
  recipes.push({wave,composition,hp:es.reduce((sum,e)=>sum+e.hp*healthMultiplier(wave,BATTLE_RULES_VERSION,e.id==='Rosenspiegel'),0),
    pressure:es.reduce((sum,e)=>sum+enemyPressure(e.id)*healthMultiplier(wave,BATTLE_RULES_VERSION,e.id==='Rosenspiegel'),0),
    gold:es.reduce((sum,e)=>sum+battleRewardUnits(e.gold,wave,BATTLE_RULES_VERSION,true,false)/1000,battleRewardUnits(clearReward(wave,BATTLE_RULES_VERSION),wave,BATTLE_RULES_VERSION,true,false)/1000)});
}
const legacyModel=await import('../waves-26-50-study-2026-11-02/control/engine/battle');
const legacyFarm=await import('../waves-26-50-study-2026-11-02/control/engine/farming');
const migrations=[];
for(const style of ['relaxed','mixed','tactical']){
  const fresh=read(new URL(`control/runs/${style}-fresh60.json`,old));
  const cases=[['clear20',fresh.snapshots.clear20],['clear30',fresh.snapshots.clear30],['active60',fresh.final],
    ...[20,30].map(w=>[`returned${w}`,read(new URL(`control/runs/${style}-w${w}-24h.json`,old)).final])];
  for(const [name,snapshot] of cases){
    const before=legacyModel.IdleBattle.restore(snapshot)!,after=IdleBattle.restore(snapshot)!;assert.ok(before&&after);
    const oldProof=legacyFarm.certifyFarm(before)!,newProof=certifyFarm(after,oldProof)!;assert.ok(oldProof&&newProof);
    migrations.push({style,name,record:after.highestCleared,oldWave:oldProof.wave,newWave:newProof.wave,
      oldGoldMinute:farmRewardGold(oldProof)/oldProof.durationMs*60000,newGoldMinute:farmRewardGold(newProof)/newProof.durationMs*60000});
  }
}
const results:any={recipes,runs:19,sourceInvariant:true,migrations,variants:{}};
for(const variant of ['control','B','B2','B3']){
  const folder=new URL(variant==='control'||variant==='B'?`${variant}/runs/`:`${variant}/runs/`,variant==='control'||variant==='B'?old:here);
  results.variants[variant]={};
  for(const style of ['relaxed','mixed','tactical']){
    const fresh=read(new URL(`${style}-fresh60.json`,folder));
    const returned=(wave:number)=>{const r=read(new URL(`${style}-w${wave}-24h.json`,folder));return {offline:r.offline,...r.summary,firstPost25Pressure:r.rows.find((r:any)=>r.wave>25&&r.frontier&&r.damage>=5)};};
    const retry=(kind:string)=>{
      const url=(variant==='control'||variant==='B')&&style!=='mixed'
        ?new URL(`retry-controls/${variant}-${style}-${kind}.json`,here):new URL(`${style}-retry-${kind}.json`,folder);
      return read(url).summary.earned;
    };
    const safe=retry('never'),immediate=retry('immediate');
    results.variants[variant][style]={fresh:{...fresh.summary,highest30:fresh.snapshots.at30.highestCleared,
      firstPost25Pressure:fresh.rows.find((r:any)=>r.wave>25&&r.frontier&&r.damage>=5),firstPost25Loss:fresh.snapshots.firstPost25Loss.wave},
      w20:returned(20),w30:returned(30),retry:{safe,immediate,ratio:immediate/safe},
      ...(style==='mixed'?{adaptive:read(new URL(`${style}-adapt60.json`,folder)).summary}:{}),
      ...(style==='tactical'?{days:[returned(30).highest,...[2,3,4].map(day=>read(new URL(`${style}-day${day}.json`,folder)).summary.highest)]}:{})};
  }
}
writeFileSync(new URL('results.json',here),JSON.stringify(results,null,2)+'\n');
console.log('PASS: 19 integrated runs exactly reproduce B3 rows, purchases, summaries, offline payouts and final states (only version metadata differs). W26–50 fought; 250 recipes match.');
console.log('PASS: baseline/B/B2/B3 hashes unchanged; 107 unrelated production sources unchanged.');
