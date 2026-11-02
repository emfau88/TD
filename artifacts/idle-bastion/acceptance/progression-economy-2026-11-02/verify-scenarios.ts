/** node --import tsx artifacts/idle-bastion/acceptance/progression-economy-2026-11-02/verify-scenarios.ts <previous-analysis-directory> */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {run, offline, save, type Style} from './simulate';

const previous=resolve(process.argv[2]);
const read=(name:string)=>JSON.parse(readFileSync(resolve(previous,'runs',name),'utf8'));
const persisted=(value:unknown)=>JSON.parse(JSON.stringify(value));
const results:any[]=[];
for(const style of ['relaxed','mixed','tactical'] as Style[]){
  const expectedFresh=read(`split-${style}-fresh.json`);
  const fresh=run(style,{seconds:style==='relaxed'?1800:3600});
  assert.deepEqual(persisted(fresh.summary),expectedFresh.summary,`${style}: complete fresh-run summary`);
  assert.deepEqual(fresh.purchases,expectedFresh.purchases,`${style}: every fresh purchase`);
  save(`runs/${style}-fresh.json`,fresh);
  results.push({scenario:'fresh',...fresh.summary});
  console.log(`${style}: fresh progression and purchases match the hypothesis exactly`);
  const baseline=read(`1000-${style}-fresh.json`);
  for(const wave of [20,30]){
    const initial=baseline.snapshots['clear'+wave];
    const rewards=[.5,2,8,24].map(hours=>({hours,gold:offline(initial,hours).gold}));
    assert.equal(rewards[2].gold,rewards[3].gold,'eight-hour cap');
    const award=offline(initial,24);
    const result=run(style,{initial:award.snapshot,cashOut:true});
    const expected=read(`split-${style}-w${wave}-24h.json`);
    assert.equal(award.gold,expected.offline,'exact integrated offline claim');
    assert.deepEqual(persisted(result.summary),expected.summary,`${style} W${wave}: complete return summary`);
    assert.deepEqual(result.purchases,expected.purchases,`${style} W${wave}: every return purchase`);
    save(`runs/${style}-w${wave}-24h.json`,{offline:award.gold,proof:award.proof,rewards,...result});
    results.push({scenario:'return',departure:wave,offline:award.gold,rewards,...result.summary});
    console.log(`${style} W${wave}: ${award.gold} gold, challenge W${result.summary.firstPressure.wave} after ${result.summary.firstPressure.at}s; exact match`);
  }
}
save('integration-scenarios.json',results);
console.log('PASS: three fresh runs, six returns, 24 absence comparisons, complete purchase/summary parity.');
