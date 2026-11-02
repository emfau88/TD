import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,existsSync} from 'node:fs';
const stage=process.argv[2]??'screen';
const variant=process.argv[3]??'B2';assert.ok(['B2','B3','integrated'].includes(variant));
const {run,offline}=await import(`./${variant}/simulate.ts`);
const path=(name:string)=>new URL(`./${variant}/runs/${name}.json`,import.meta.url);
const read=(name:string)=>JSON.parse(readFileSync(path(name),'utf8'));
const save=(name:string,result:any)=>{
  assert.ok(!existsSync(path(name)),`Keep measured ${name}`);
  writeFileSync(path(name),JSON.stringify(result,null,2)+'\n');
  console.log(JSON.stringify({name,highest:result.summary.highest,leak:result.summary.firstLeak,pressure:result.summary.firstPressure,loss:result.summary.firstLoss,maxNoRecord:result.summary.maxNoRecordSeconds,offline:result.offline}));
};
for(const style of ['relaxed','mixed','tactical'] as const){
  if(stage==='screen'){
    const fresh=run(style,{seconds:3600});save(`${style}-fresh60`,fresh);
    const old=JSON.parse(readFileSync(new URL(`../waves-26-50-study-2026-11-02/B/runs/${style}-fresh60.json`,import.meta.url),'utf8'));
    assert.deepEqual({...fresh.snapshots.clear25,schemaVersion:33,rulesVersion:17,waveRecipeVersion:17},old.snapshots.clear25,'entry unchanged');
    const departure=offline(fresh.snapshots.clear20,24);
    save(`${style}-w20-24h`,{offline:departure.gold,proof:departure.proof,...run(style,{initial:departure.snapshot,cashOut:true,seconds:1800})});
  } else if(stage==='followup'){
    const fresh=read(`${style}-fresh60`);
    const departure=offline(fresh.snapshots.clear30,24);
    save(`${style}-w30-24h`,{offline:departure.gold,proof:departure.proof,...run(style,{initial:departure.snapshot,cashOut:true,seconds:1800})});
    for(const retry of ['never','immediate'] as const)
      save(`${style}-retry-${retry}`,run(style,{initial:fresh.snapshots.firstPost25Loss,seconds:600,buy:false,retry}));
    if(style==='mixed')save(`${style}-adapt60`,run(style,{seconds:3600,adapt:true}));
  } else if(stage==='days'&&style==='tactical'){
    let previous=read(`${style}-w30-24h`);
    for(let day=2;day<=4;day++){
      const departure=offline(previous.final,24);
      previous={day,offline:departure.gold,proof:departure.proof,...run(style,{initial:departure.snapshot,cashOut:true,seconds:1800})};
      save(`${style}-day${day}`,previous);
    }
  } else assert.ok(stage==='days');
}
