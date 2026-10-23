/** Read-only counterfactual farm measurements on copies of the paid audit saves. */
import {readFileSync,writeFileSync} from 'node:fs';
import {IdleBattle} from '../../src/battle';
import {certifyFarm,farmRewardGold} from '../../src/farming';
const out='artifacts/idle-bastion/acceptance/b16/economy',rows=[];
for(const [approach,wave] of [['control',40],['one-storm',40],['one-storm',60],['one-storm',70]] as const){
 const saved=JSON.parse(readFileSync(`${out}/${approach}-wave${wave}-earned.json`,'utf8'));
 const b=IdleBattle.restore(saved)!;const regular=certifyFarm(b),candidates=[];
 for(const candidate of b.liveClearedWaves){
  const copy=IdleBattle.restore({...b.snapshot(),liveClearedWaves:[...new Set([1,candidate])].sort((a,z)=>a-z),farmWave:candidate})!;
  if(!copy)throw Error('Invalid isolated farm candidate');const p=certifyFarm(copy);
  candidates.push({wave:candidate,safe:p?.wave===candidate,goldPerMinute:p?.wave===candidate?farmRewardGold(p)*60000/p.durationMs:0});
 }
 const best=candidates.reduce((a,z)=>z.goldPerMinute>a.goldPerMinute?z:a,candidates[0]);
 rows.push({approach,milestone:wave,regular:regular?{wave:regular.wave,goldPerMinute:farmRewardGold(regular)*60000/regular.durationMs}:null,best,candidates});
 console.log(JSON.stringify(rows.at(-1),['approach','milestone','regular','best','wave','goldPerMinute']));
}
writeFileSync(`${out}/farm-audit.json`,JSON.stringify(rows,null,2));
