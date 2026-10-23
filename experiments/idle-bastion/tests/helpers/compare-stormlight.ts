/** Controlled equal-investment role comparison; these are not progression saves. */
import {readFileSync,writeFileSync} from 'node:fs';
import {IdleBattle,BASE,stats,upgradeCost,towerDefinition,type TowerId} from '../../src/battle';
import {waveRecipe} from '../../src/wave-recipes';
const output='artifacts/idle-bastion/acceptance/b16';
const results:unknown[]=[];
for(const milestone of [40,60]){
 const original=JSON.parse(readFileSync(`${output}/economy/one-storm-wave${milestone}-earned.json`,'utf8'));
 const paid=original.towers.find((t:any)=>t.kind===5),budget=paid.spent;
 for(const wave of (milestone===40?[28,29,30,36,40,46]:[54,60,70]))for(const kind of [1,3,5] as const){
  const s=IdleBattle.restore(original)!.snapshot(),def=towerDefinition(kind);
  let level=1,spent=def.cost;while(spent+upgradeCost({def,level})<=budget){spent+=upgradeCost({def,level});level++;}
  const slot=s.towers.find(t=>t.uid===paid.uid)!;Object.assign(slot,{kind,level,spent,cooldown:def.cooldown});
  s.mode='advance';s.highestCleared=wave-1;s.wave=wave-1;s.phase='intermission';s.lives=BASE.coreLives;s.queue=[];s.enemies=[];s.shots=[];s.spawnTimer=0;s.intermissionRemaining=0;s.farmWave=1;s.advanceRequested=false;s.liveClearedWaves=s.liveClearedWaves.filter(w=>w<wave);
  // Research remains owned, but historical unlock requirements need a late record.
  if(wave<29){s.highestCleared=28;s.wave=27;}
  if(s.ilyra){s.ilyra.volley=null;s.ilyra.autoCast=false;}
  let b=IdleBattle.restore(s,{maraBonus:false,ilyraAbilities:false,socialRewards:false});if(!b)throw Error(`Invalid role bench ${milestone}/${wave}/${kind}`);
  b.update(.025);for(const t of b.towers)t.cooldown=stats(t).cooldown;b.drainEvents();
  let peak=0,damage=0,kills=0,done=false;const chainHits=new Map<number,number>();
  for(let tick=0;tick<8000;tick++){
   b.update(.025);peak=Math.max(peak,b.enemies.length);
   for(const e of b.drainEvents()){
    if(e.type==='hit'&&e.shot&&e.shot.towerUid===paid.uid){damage+=(e.amount??0)*(1-e.enemy!.def.armor);chainHits.set(e.shot.uid,(chainHits.get(e.shot.uid)??0)+1);}
    if(e.type==='kill'&&e.tower?.uid===paid.uid)kills++;
    if(e.type==='clear'||e.type==='defeat'){
     if(kind===5&&Math.max(0,...chainHits.values())>3)throw Error('Unbounded chain');
     results.push({milestone,wave,family:wave===40?'elite':waveRecipe(wave).family,kind,level,spent,budget,win:e.type==='clear',leakedLives:20-b.lives,seconds:(tick+1)*.025,peak,towerDamage:damage,towerKills:kills,maxTargetsPerAttack:Math.max(0,...chainHits.values()),meanTargets:chainHits.size?[...chainHits.values()].reduce((a,z)=>a+z,0)/chainHits.size:0});
     done=true;break;
    }
   }
   if(done)break;
  }
  if(!done)throw Error('Role bench timed out');
 }
}
writeFileSync(`${output}/role-comparisons.json`,JSON.stringify(results,null,2));console.log(JSON.stringify({fights:results.length}));
