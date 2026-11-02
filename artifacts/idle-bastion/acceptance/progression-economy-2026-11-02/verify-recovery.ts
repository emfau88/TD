/** Focused integration comparison: repeated frontier attempts and one adaptive build. */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {run,save,type Style} from './simulate';
const previous=resolve(process.argv[2]),read=(name:string)=>JSON.parse(readFileSync(resolve(previous,'runs',name),'utf8'));
const results:any[]=[];
for(const style of ['relaxed','mixed','tactical'] as Style[]){
  const initial=read(`1000-${style}-fresh.json`).snapshots.firstLoss;
  for(const retry of ['never','immediate'] as const){
    const actual=run(style,{initial,seconds:600,buy:false,retry});
    const expected=read(`100-${style}-retry-${retry}.json`);
    // A stored legacy attempt retains its old rate until the next boundary.
    // These starting fixtures are already defeated, so the measured runs match.
    assert.deepEqual(JSON.parse(JSON.stringify(actual.summary)),expected.summary);
    save(`runs/${style}-retry-${retry}.json`,actual);results.push({retry,...actual.summary});
    console.log(`${style} ${retry}: ${actual.summary.earned} gold; exact hypothesis match`);
  }
}
const adapted=run('mixed',{seconds:3600,adapt:true});
assert.deepEqual(JSON.parse(JSON.stringify(adapted.summary)),read('100-mixed-adapt60m.json').summary);
save('runs/mixed-adapt60m.json',adapted);results.push({scenario:'adapt',...adapted.summary});
save('integration-recovery.json',results);
console.log('PASS: six repeated-attack/farming controls and adaptive 60-minute recovery match exactly.');
