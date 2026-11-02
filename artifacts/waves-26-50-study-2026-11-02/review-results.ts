import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,readdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
const read=(p:string)=>JSON.parse(readFileSync(new URL(p,import.meta.url),'utf8'));
const frozen=read('./frozen.json'),variants=['control','A','B'],styles=['relaxed','mixed','tactical'];
const hash=(p:URL|string)=>createHash('sha256').update(readFileSync(p)).digest('hex');
assert.equal(hash(new URL('./PLAN_PRE_RUN.md',import.meta.url)),frozen.planSha256);
for(const [file,h] of Object.entries(frozen.sourceManifest))assert.equal(hash('experiments/idle-bastion/src/'+file),h);
const summary:any={base:frozen.baseCommit,validatedRuns:0,offlineComparisons:0,fresh:[],returns:[],matched:[],retry:[],adapt:[],days:[],recipes:{}};
const metrics=(data:any)=>{
  const frontier=data.rows.filter((r:any)=>r.frontier&&r.wave>=26),pressure=frontier.find((r:any)=>r.damage>=5),loss=frontier.find((r:any)=>r.result==='defeat');
  const clear25=data.rows.find((r:any)=>r.wave===25&&r.frontier&&r.result==='clear');
  const elapsed=data.summary.elapsed;
  return {...data.summary,highest30:data.snapshots.at30?.highestCleared??data.summary.highest,
    pressureAfter25:pressure?{wave:pressure.wave,at:pressure.end,since25:clear25?pressure.end-clear25.end:null}:null,
    lossAfter25:loss?{wave:loss.wave,at:loss.end}:null,
    openRecoveries:data.summary.recoveries.filter((r:any)=>r.winAt===undefined).map((r:any)=>({wave:r.wave,observedSeconds:elapsed-r.lossAt})),
    earnedWaveCoverage:[...new Set(frontier.map((r:any)=>r.wave))],offline:data.offline,rewards:data.rewards};
};
for(const variant of variants){
  for(const [file,h] of Object.entries(frozen.variants[variant].files))assert.equal(hash(new URL(`./${variant}/engine/${file}`,import.meta.url)),h);
  assert.equal(hash(new URL(`./${variant}/simulate.ts`,import.meta.url)),frozen.variants[variant].controllerSha256);
  const {IdleBattle}=await import(`./${variant}/engine/battle.ts`);
  for(const file of readdirSync(new URL(`./${variant}/runs/`,import.meta.url)).filter(f=>f.endsWith('.json'))){
    const data=read(`./${variant}/runs/${file}`);assert.ok(!data.unavailable,`${variant}/${file} must be earned`);
    const b=IdleBattle.restore(data.final);assert.ok(b);assert.deepEqual(b.snapshot(),data.final);
    summary.validatedRuns++;
  }
  for(const style of styles){
    const data=read(`./${variant}/runs/${style}-fresh60.json`),control=read(`./control/runs/${style}-fresh60.json`);
    assert.deepEqual(data.snapshots.clear20,control.snapshots.clear20);
    assert.deepEqual(data.snapshots.clear25,control.snapshots.clear25,'entire earned state through boss 25');
    const end25=data.rows.find((r:any)=>r.wave===25&&r.frontier&&r.result==='clear').end;
    assert.deepEqual(data.rows.filter((r:any)=>r.end<=end25),control.rows.filter((r:any)=>r.end<=end25));
    assert.deepEqual(data.purchases.filter((r:any)=>r.t<=end25),control.purchases.filter((r:any)=>r.t<=end25));
    summary.fresh.push({variant,...metrics(data)});
    for(const wave of [20,30]){
      const d=read(`./${variant}/runs/${style}-w${wave}-24h.json`);summary.returns.push({variant,departure:wave,...metrics(d)});
      assert.equal(d.rewards[2].gold,d.rewards[3].gold);summary.offlineComparisons+=d.rewards.length;
    }
    if(variant!=='control')summary.matched.push({variant,...metrics(read(`./${variant}/runs/${style}-matched30-24h.json`))});
  }
  const safe=read(`./${variant}/runs/mixed-retry-never.json`),retry=read(`./${variant}/runs/mixed-retry-immediate.json`);
  summary.retry.push({variant,wave:retry.summary.initialRecord+1,safe:safe.summary.earned,retry:retry.summary.earned,ratio:retry.summary.earned/safe.summary.earned});
  summary.adapt.push({variant,...metrics(read(`./${variant}/runs/mixed-adapt60.json`))});
  for(let day=2;day<=4;day++)summary.days.push({variant,day,...metrics(read(`./${variant}/runs/tactical-day${day}.json`))});
  const recipes=read('./recipes.json'),rows=recipes[variant].rows.filter((r:any)=>r.wave>=26&&r.wave<=50);
  const ratios=rows.slice(1).map((r:any,i:number)=>r.pressure/rows[i].pressure);
  summary.recipes[variant]={minPressureStep:Math.min(...ratios),maxPressureStep:Math.max(...ratios),minTypes:Math.min(...rows.map((r:any)=>Object.keys(r.composition).length)),maxTypes:Math.max(...rows.map((r:any)=>Object.keys(r.composition).length)),maxGoldDeviation:Math.max(...rows.map((r:any)=>Math.abs(r.gold/recipes.control.rows[r.wave-1].gold-1)))};
}
assert.equal(summary.validatedRuns,51);assert.equal(summary.offlineComparisons,72);
for(const variant of variants){const played=new Set([...summary.returns,...summary.days].filter((r:any)=>r.variant===variant).flatMap((r:any)=>r.earnedWaveCoverage));for(let wave=26;wave<=50;wave++)assert.ok(played.has(wave),`${variant}: W${wave} actually fought`);}
writeFileSync(new URL('./results.json',import.meta.url),JSON.stringify(summary,null,2)+'\n');
console.log(JSON.stringify({validatedRuns:summary.validatedRuns,offlineComparisons:summary.offlineComparisons,sourceFilesUnchanged:Object.keys(frozen.sourceManifest).length,entryThrough25:'exact states, rows and purchases identical',wave26to50:'actually fought in each variant',retry:summary.retry,recipes:summary.recipes},null,2));
