import {mkdirSync,writeFileSync} from 'node:fs';
import {run,offline} from './simulate';
const label=process.argv[2]??'current',dir=new URL(label+'/',import.meta.url);mkdirSync(dir,{recursive:true});
console.log(label+' engine loaded');
for(const style of ['relaxed','mixed','tactical'] as const){
 const fresh=run(style,{seconds:3600,ember:true}),earned={...fresh.snapshots};let latest=fresh;
 const save=(name:string,result:unknown)=>writeFileSync(new URL(name+'.json',dir),JSON.stringify(result));
 save(style+'-fresh',fresh);console.log(style+' fresh '+JSON.stringify(fresh.summary));
 for(const wave of [30,35,44]){
  if(wave===44&&!earned.clear44){
   const away=offline(latest.final,24);latest=run(style,{initial:away.snapshot,cashOut:true,seconds:1800,ember:true});
   save(style+'-reach44',{offline:away.gold,...latest});for(const[key,value]of Object.entries(latest.snapshots))earned[key]??=value;
  }
  const snapshot=earned['clear'+wave];if(!snapshot){console.log(style+' no earned W'+wave+' departure');continue;}
  const away=offline(snapshot,24),returned=run(style,{initial:away.snapshot,cashOut:true,seconds:1800,ember:true});
  save(style+'-w'+wave+'-24h',{offline:away.gold,proof:away.proof,...returned});
  for(const [key,value]of Object.entries(returned.snapshots))earned[key]??=value;
  latest=returned;
  console.log(style+' W'+wave+' +24h '+JSON.stringify({gold:away.gold,highest:returned.summary.highest,firstLoss:returned.summary.firstLoss}));
 }
}
