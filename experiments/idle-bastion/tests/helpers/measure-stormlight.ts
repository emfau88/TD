/** Paid continuation from the same real wave-25 save. No credited resources or synthetic unlocks. */
import {mkdirSync,readFileSync,writeFileSync} from 'node:fs';
import {IdleBattle,STORMLIGHT,STORM_CHAIN,stats,upgradeCost,towerDefinition,type TowerId} from '../../src/battle';
import {certifyFarm,defenseFingerprint,farmRewardGold,type FarmCertificate} from '../../src/farming';
const output='artifacts/idle-bastion/acceptance/b16/economy';mkdirSync(output,{recursive:true});
const source=JSON.parse(readFileSync('artifacts/idle-bastion/acceptance/wave-rework-v2/earned-balanced-mid.json','utf8'));
const save=(name:string,value:unknown)=>writeFileSync(`${output}/${name}.json`,JSON.stringify(value,null,2));

const captureOnly=process.env.SPIRE_CAPTURE_ONLY==='1';
for(const approach of ['control','one-storm','two-storms'] as const){
 if(captureOnly&&approach!=='one-storm')continue;
 const b=IdleBattle.restore(source)!;if(!b)throw Error('Paid source failed migration');
 const start=b.elapsed,wanted=approach==='control'?0:approach==='one-storm'?1:2;
 const purchases:unknown[]=[],losses:unknown[]=[],samples:unknown[]=[],farmCounts:Record<string,number>={},stages=new Set<number>();
 let proof:FarmCertificate|undefined,key='',investment=-1,retry=-1,failurePower=0,farmSeconds=0,next=0;
 const milestones=[25,28,30,40,50,60,70];
 const power=()=>b.towers.reduce((sum,t)=>sum+stats(t).damage/stats(t).cooldown*(t.def.id===2?.5:t.def.id===3?2:t.def.id===5?1.65:1),0);
 const record=(action:string,cost:number,extra:object={})=>{investment=b.elapsed;purchases.push({at:b.elapsed,action,cost,gold:b.gold,...extra});
  if(captureOnly){const t=b.towers.find(t=>t.def.id===5);if(t&&!stages.has(t.visualStage)){stages.add(t.visualStage);save(`${approach}-stage${t.visualStage}`,b.snapshot());}}};
 function buildExtra(kind:TowerId){
  const pad=b.layout.towerPads.filter(p=>b.canBuild(p.id,kind)).sort((a,z)=>{
   const score=(p:typeof a)=>b.layout.road.waypoints.map(c=>({x:(c.x+.5)*40,y:(c.y+.5)*40})).filter(q=>Math.hypot(q.x-(p.cell.x+.5)*40,q.y-(p.cell.y+.5)*40)<=STORMLIGHT.range).length;
   return score(z)-score(a)||a.id.localeCompare(z.id);
  })[0];
  if(pad&&b.build(pad.id,kind)){record('build',towerDefinition(kind).cost,{kind,pad:pad.id});return true;}return false;
 }
 for(let second=0;second<24*3600&&b.highestCleared<70;second++){
  if(b.wispUnlocked&&!b.wispArrival.met)b.wispArrival.met=true; // Confirm arrival, no resources.
  if(b.discoveryActive)b.dismissDiscovery();
  if(!b.settlement.tavernBuilt){const place=b.recommendedTavernPlot;if(place&&b.buildTavern(place))record('tavern',0);}
  if(b.settlement.tavernLevel===1&&b.upgradeTavern())record('tavern-II',1200);
  if(b.ilyraRecruitable&&b.recruitIlyra())record('recruit-Ilyra',0);
  if(b.ilyra?.introduction==='move'&&!b.ilyra.path.length){
   for(const cell of [{x:3,y:5},{x:4,y:5},{x:3,y:6},{x:5,y:5}])if(b.moveIlyraTo(cell))break;
  }
  if(b.ilyra?.introduction==='cast'&&!b.ilyra.path.length){const enemy=b.enemies.find(e=>b.canCastIlyra(e));if(enemy)b.castIlyraAt(enemy);}
  if(second%2===0){
   const reserve=!b.settlement.tavernBuilt||b.settlement.tavernLevel===1?1200:wanted&&!b.settlement.stormResearched&&b.highestCleared>=27?STORM_CHAIN.researchCost:0;
   if(wanted&&b.stormResearchUnlocked&&!b.settlement.stormResearched&&b.gold>=STORM_CHAIN.researchCost){if(captureOnly)save('research-before',b.snapshot());if(b.researchStorm())record('research-storm',STORM_CHAIN.researchCost);}
   const extra=b.towers.filter(t=>t.def.id===(wanted?5:3)).length-(wanted?0:1);
   const building=wanted?b.settlement.stormResearched&&extra<wanted:extra<1;
   if(building&&buildExtra(wanted?5:3)){}else{
    const t=b.towers.filter(t=>t.def.id!==2&&t.level<b.maxLevel).sort((a,z)=>upgradeCost(a)/(a.def.id===3?1.5:a.def.id===5?1.4:1)-upgradeCost(z)/(z.def.id===3?1.5:z.def.id===5?1.4:1))[0];
    if(t&&b.gold>=upgradeCost(t)+reserve){const cost=upgradeCost(t);if(b.upgrade(t.uid))record('upgrade',cost,{kind:t.def.id,level:t.level,uid:t.uid});}
   }
  }
  if(captureOnly&&stages.size===3)break;
  const fingerprint=defenseFingerprint(b)+'/'+b.liveClearedWaves.join(',');
  if(fingerprint!==key){proof=certifyFarm(b,proof);b.setFarmWave(proof?.wave??1);key=fingerprint;}
  if(b.mode==='farm'&&investment>retry&&power()>=failurePower*1.2){b.requestAdvance();retry=investment;}
  if(b.mode==='farm')farmSeconds++;
  b.update(1);
  for(const event of b.drainEvents()){
   if(event.type==='defeat'){failurePower=power();losses.push({wave:event.wave,at:b.elapsed,farm:b.farmWave});}
   if(event.type==='clear'&&b.mode==='farm')farmCounts[String(event.wave)]=(farmCounts[String(event.wave)]??0)+1;
  }
  const storm=b.towers.find(t=>t.def.id===5);
  if(storm&&!stages.has(storm.visualStage)&&b.phase==='wave'&&b.shots.some(s=>s.kind===5)){
   stages.add(storm.visualStage);save(`${approach}-stage${storm.visualStage}`,b.snapshot());
  }
  if(storm&&b.wave===40&&b.enemies.length>=14)save(`${approach}-wave40`,b.snapshot());
  while(next<milestones.length&&b.highestCleared>=milestones[next]){
   const milestone=milestones[next++],rate=proof?farmRewardGold(proof)*60000/proof.durationMs:0;
   const tower=b.towers.filter(t=>t.def.id!==2).sort((a,z)=>upgradeCost(a)-upgradeCost(z))[0],cost=upgradeCost(tower);
   samples.push({milestone,elapsedAfter25:b.elapsed-start,gold:b.gold,earned:b.earned,farmWave:proof?.wave,safeGoldPerMinute:rate,cheapestUpgrade:{kind:tower.def.id,level:tower.level,cost,minutesAtRate:rate?cost/rate:null,waitWithWalletMinutes:rate?Math.max(0,cost-b.gold)/rate:null},levels:b.towers.map(t=>({kind:t.def.id,level:t.level,pad:t.padId}))});
   save(`${approach}-wave${milestone}-earned`,b.snapshot());
  }
 }
 if(!b.ilyra||b.ilyra.introduction!=='done')throw Error(`${approach}: real Ilyra introduction never completed`);
 if(wanted&&b.towers.filter(t=>t.def.id===5).length!==wanted)throw Error(`${approach}: requested paid storm defense missing`);
 if(captureOnly){console.log(JSON.stringify({capturedStages:[...stages],at:b.elapsed}));continue;}
 const result={approach,source:'wave-rework-v2/earned-balanced-mid.json',giftedResources:0,record:b.highestCleared,secondsAfter25:b.elapsed-start,farmSeconds,purchases,losses,samples,farmCounts,finalFarm:proof,finalLevels:b.towers.map(t=>({kind:t.def.id,level:t.level,pad:t.padId}))};
 save(approach,result);save(`${approach}-final`,b.snapshot());console.log(JSON.stringify({approach,record:result.record,seconds:result.secondsAfter25,losses:losses.length,purchases:purchases.length,farm:proof?.wave}));
}
save('upgrade-curve',[10,15,20,25,30,35,40].map(level=>({level,towers:([1,3,4,5] as const).map(kind=>({kind,damage:stats({def:towerDefinition(kind),level}).damage,nextCost:upgradeCost({def:towerDefinition(kind),level})}))})));
