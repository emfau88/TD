import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,existsSync} from 'node:fs';
const variant=process.argv[2],stage=process.argv[3]??'core';
assert.ok(['control','A','B'].includes(variant));
const {run,offline}=await import(`./${variant}/simulate.ts`);
const path=(name:string,v=variant)=>new URL(`./${v}/runs/${name}.json`,import.meta.url);
const read=(name:string,v=variant)=>JSON.parse(readFileSync(path(name,v),'utf8'));
const write=(name:string,data:unknown)=>{assert.ok(!existsSync(path(name)),`Do not overwrite measured ${variant}/${name}`);writeFileSync(path(name),JSON.stringify(data,null,2)+'\n');};
const brief=(name:string,data:any)=>console.log(JSON.stringify({variant,name,highest:data.summary.highest,pressure:data.summary.firstPressure,loss:data.summary.firstLoss,farmRate:data.summary.farmPerMinute,gold:data.offline}));
for(const style of ['relaxed','mixed','tactical']){
  if(stage==='core'){
    const fresh=run(style,{seconds:3600});write(`${style}-fresh60`,fresh);brief(`${style}-fresh60`,fresh);
    if(variant==='control'){
      const oldPath=new URL(`../idle-bastion/acceptance/progression-economy-2026-11-02/runs/${style}-fresh.json`,import.meta.url);
      if(existsSync(oldPath)){
        const old=JSON.parse(readFileSync(oldPath,'utf8')),limit=old.summary.elapsed;
        assert.deepEqual(fresh.rows.filter((r:any)=>r.end<=limit),old.rows,'control reproduces old first 30 minutes');
        assert.deepEqual(fresh.purchases.filter((p:any)=>p.t<=limit),old.purchases,'identical baseline spending');
      }else{
        const expected=JSON.parse(readFileSync(new URL('../idle-bastion/acceptance/progression-economy-2026-11-02/integration-scenarios.json',import.meta.url),'utf8')).find((r:any)=>r.scenario==='fresh'&&r.style===style);
        assert.equal(fresh.snapshots.at30.highestCleared,expected.highest);
        assert.deepEqual(fresh.summary.firstPressure,expected.firstPressure);assert.deepEqual(fresh.summary.firstLoss,expected.firstLoss);
      }
    }
    for(const wave of [20,30]){
      const initial=fresh.snapshots['clear'+wave];
      if(!initial){write(`${style}-w${wave}-24h`,{unavailable:true,reason:`W${wave} not reached within 60 minutes`});continue;}
      const rewards=[.5,2,8,24].map(hours=>({hours,gold:offline(initial,hours).gold}));
      assert.equal(rewards[2].gold,rewards[3].gold);
      const departure=offline(initial,24),returned=run(style,{initial:departure.snapshot,cashOut:true,seconds:1800});
      const result={offline:departure.gold,proof:departure.proof,rewards,...returned};write(`${style}-w${wave}-24h`,result);brief(`${style}-w${wave}-24h`,result);
    }
  }else if(stage==='followup'){
    if(variant!=='control'){
      const initial=read(`${style}-fresh60`,'control').snapshots.clear30;
      const departure=offline(initial,24),returned=run(style,{initial:departure.snapshot,cashOut:true,seconds:1800});
      const result={offline:departure.gold,proof:departure.proof,...returned};write(`${style}-matched30-24h`,result);brief(`${style}-matched30-24h`,result);
    }
    if(style==='mixed'){
      const fresh=read(`${style}-fresh60`),initial=fresh.snapshots.firstPost25Loss;assert.ok(initial);
      for(const retry of ['never','immediate']){
        const result=run(style,{initial,seconds:600,buy:false,retry});write(`${style}-retry-${retry}`,result);brief(`${style}-retry-${retry}`,result);
      }
      if(fresh.summary.maxNoRecordSeconds>900){const result=run(style,{seconds:3600,adapt:true});write(`${style}-adapt60`,result);brief(`${style}-adapt60`,result);}
    }
  }else if(stage==='days'){
    if(style!=='tactical')continue;
    let previous=read(`${style}-w30-24h`);
    for(let day=2;day<=4;day++){
      const departure=offline(previous.final,24),returned=run(style,{initial:departure.snapshot,cashOut:true,seconds:1800});
      const result={day,offline:departure.gold,proof:departure.proof,...returned};write(`${style}-day${day}`,result);brief(`${style}-day${day}`,result);previous=result;
    }
  }else throw new Error('unknown stage');
}
console.log(`PASS ${variant} ${stage}: real purchases, earned snapshots, farm proofs, offline caps and money/save checks`);
