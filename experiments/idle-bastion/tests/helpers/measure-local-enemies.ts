/** Continues the real, paid W02 wave-40 save. No granted gold/levels/unlocks. */
import { mkdirSync,readFileSync,writeFileSync } from 'node:fs';
import { IdleBattle,stats,upgradeCost } from '../../src/battle';
import { certifyFarm,defenseFingerprint,type FarmCertificate } from '../../src/farming';
const output='artifacts/idle-bastion/acceptance/local-enemy-assets';mkdirSync(output,{recursive:true});
const seed=JSON.parse(readFileSync('artifacts/idle-bastion/acceptance/wave-rework-v2/earned-balanced-late.json','utf8'));
const b=IdleBattle.restore(seed)!;if(!b)throw Error('Paid source failed migration');
const started=b.elapsed,losses:unknown[]=[],buys:unknown[]=[],clears:unknown[]=[],seen=new Set<string>();
let proof:FarmCertificate|undefined,key='',lastInvestment=-1,retry=-1,failurePower=0;
const power=()=>b.towers.reduce((sum,t)=>sum+stats(t).damage/stats(t).cooldown*(t.def.id===3?2:t.def.id===2?.5:1),0);
const peaks=new Map<number,number>(),introScores=new Map<number,number>();
for(let second=0;second<10800&&b.highestCleared<56;second++){
 if(second%2===0){
  const candidates=b.towers.filter(t=>t.def.id!==2&&t.level<b.maxLevel).sort((a,z)=>upgradeCost(a)/(a.def.id===3?1.5:1)-upgradeCost(z)/(z.def.id===3?1.5:1));
  const t=candidates[0];if(t&&b.gold>=upgradeCost(t)){const cost=upgradeCost(t);if(b.upgrade(t.uid)){lastInvestment=second;buys.push({at:b.elapsed,uid:t.uid,level:t.level,cost,gold:b.gold});}}
 }
 const nextKey=defenseFingerprint(b)+'/'+b.liveClearedWaves.join(',');
 if(nextKey!==key){proof=certifyFarm(b,proof);b.setFarmWave(proof?.wave??1);key=nextKey;}
 if(b.mode==='farm'&&lastInvestment>retry&&power()>=failurePower*1.2){b.requestAdvance();retry=lastInvestment;}
 b.update(1);
 for(const e of b.drainEvents()){
  if(e.type==='defeat'){failurePower=power();losses.push({at:b.elapsed,wave:e.wave,farm:b.farmWave});}
  if(e.type==='clear')clears.push({at:b.elapsed,wave:e.wave,mode:b.mode});
 }
 for(const e of b.enemies)seen.add(e.def.id);
 const newcomers=b.enemies.filter(e=>e.def.firstWave===b.wave&&e.def.firstWave>40&&e.x>60&&e.x<250);
 const score=newcomers.length*100-newcomers.reduce((sum,e)=>sum+Math.abs(e.x-140),0)/10;
 if(newcomers.length&&score>(introScores.get(b.wave)??0)){introScores.set(b.wave,score);writeFileSync(`${output}/view-intro${b.wave}.json`,JSON.stringify(b.snapshot(),null,2));}
 if([42,46,50,54,55,56].includes(b.wave)&&b.phase==='wave'&&b.enemies.some(e=>e.def.firstWave>40)&&b.enemies.length>(peaks.get(b.wave)??0)){
  peaks.set(b.wave,b.enemies.length);writeFileSync(`${output}/view-wave${b.wave}.json`,JSON.stringify(b.snapshot(),null,2));
 }
}
const result={source:'wave-rework-v2/earned-balanced-late.json',giftedGold:0,secondsAfter40:b.elapsed-started,record:b.highestCleared,losses,purchases:buys,clears,
 levels:b.towers.map(t=>({kind:t.def.id,level:t.level,pad:t.padId})),gold:b.gold,earned:b.earned,farm:proof,seen:[...seen],peaks:Object.fromEntries(peaks)};
writeFileSync(`${output}/paid-continuation.json`,JSON.stringify(result,null,2));writeFileSync(`${output}/earned-late.json`,JSON.stringify(b.snapshot(),null,2));
console.log(JSON.stringify({secondsAfter40:result.secondsAfter40,record:b.highestCleared,defeats:losses.length,purchases:buys.length,newSpecies:[...seen].filter(id=>['MossShroom','WoodSpider','HornedBat','EmberBomb'].includes(id)),peaks:result.peaks}));
