import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,existsSync,mkdirSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';
import {resolve} from 'node:path';
import {run,offline,dir,type Style} from './simulate';
const evidence=JSON.parse(gunzipSync(readFileSync(dir+'evidence.json.gz')).toString());
const out=resolve(process.argv[2]??dir+'.repro')+'/';assert.equal(existsSync(out),false,'choose a fresh output directory');mkdirSync(out+'runs',{recursive:true});
const summaries:any[]=[];
function save(name:string,r:any){
 const path=out+'runs/'+name+'.json';assert.equal(existsSync(path),false,'keep previous measured runs');writeFileSync(path,JSON.stringify(r)+'\n');
 const s=r.summary,purchase=r.purchases.find((p:any)=>p.label==='ember research');
 const item={name,...Object.fromEntries(['style','elapsed','initialRecord','highest','firstLoss','firstPressure','longestSafe','maxNoRecordSeconds','farmPerMinute','spent','gold'].map(k=>[k,s[k]])),offline:r.offline,research:purchase?{t:purchase.t,wave:purchase.wave,cost:purchase.cost}:undefined,emberLevels:s.levels.filter((t:any)=>t.kind===7)};
 summaries.push(item);writeFileSync(out+'results.json',JSON.stringify(summaries,null,2)+'\n');
 console.log(JSON.stringify({name,highest:r.summary.highest,loss:r.summary.firstLoss,pressure:r.summary.firstPressure,maxNoRecord:r.summary.maxNoRecordSeconds,researchAt:item.research?.t,emberLevels:r.summary.levels.filter((t:any)=>t.kind===7),farm:r.summary.farmPerMinute}));
}
for(const style of ['relaxed','mixed','tactical'] as Style[]){
 const control=run(style,{seconds:3600});
 const previous=evidence.baseline[style];
 assert.deepEqual(control.rows,previous.rows,'no-tower combat unchanged');assert.deepEqual(control.purchases,previous.purchases,'no-tower purchase decisions unchanged');
 save(style+'-control60',control);save(style+'-ember60',run(style,{seconds:3600,ember:true}));
 const departure=offline(control.snapshots.clear34,24);
 save(style+'-return-control',{offline:departure.gold,proof:departure.proof,...run(style,{initial:departure.snapshot,seconds:1800,cashOut:true})});
 save(style+'-return-ember',{offline:departure.gold,proof:departure.proof,...run(style,{initial:departure.snapshot,seconds:1800,cashOut:true,ember:true})});
 if(style==='tactical')save(style+'-return-two',{offline:departure.gold,proof:departure.proof,...run(style,{initial:departure.snapshot,seconds:1800,cashOut:true,ember:true,emberCount:2})});
}
