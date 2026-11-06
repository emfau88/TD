import {mkdirSync,writeFileSync} from 'node:fs';
import {run,offline} from './simulate';
import {waveEnemy,waveCount,BATTLE_RULES_VERSION} from '../../experiments/idle-bastion/src/battle';
import {waveRecipe,clearReward,spawnGap} from '../../experiments/idle-bastion/src/wave-recipes';
import {healthMultiplier} from '../../experiments/idle-bastion/src/balance';
const label=process.argv[2]??'candidate',dir=new URL(label+'/',import.meta.url);mkdirSync(dir,{recursive:true});
const save=(name:string,result:unknown)=>writeFileSync(new URL(name+'.json',dir),JSON.stringify(result));
save('waves',Array.from({length:250},(_,i)=>{const w=i+1;return {wave:w,enemies:Array.from({length:waveCount(w)},(_,i)=>waveEnemy(w,i).id),clearGold:clearReward(w,BATTLE_RULES_VERSION),gaps:Array.from({length:waveCount(w)},(_,i)=>spawnGap(w,i+1,BATTLE_RULES_VERSION)),hp:healthMultiplier(w,BATTLE_RULES_VERSION,false)};}));
console.log(label+' engine loaded: rules '+BATTLE_RULES_VERSION);
for(const style of ['relaxed','mixed','tactical'] as const){
 const fresh=run(style,{seconds:3600,ember:true});save(style+'-fresh',fresh);console.log(style+' fresh '+JSON.stringify({highest:fresh.summary.highest,firstLoss:fresh.summary.firstLoss}));
 for(const wave of [8,14,20]){
  const snapshot=fresh.snapshots['clear'+wave];if(!snapshot)throw new Error(style+' missing earned W'+wave);
  const away=offline(snapshot,24),returned=run(style,{initial:away.snapshot,cashOut:true,seconds:1800,ember:true});
  const caps=Object.fromEntries([.5,2,8,24].map(h=>[h,offline(snapshot,h).gold]));
  save(style+'-w'+wave+'-24h',{offline:away.gold,proof:away.proof,caps,...returned});
  console.log(style+' W'+wave+' +24h '+JSON.stringify({gold:away.gold,highest:returned.summary.highest,firstLoss:returned.summary.firstLoss}));
 }
}
