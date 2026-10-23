/** Paid model playthroughs and fixed earned defenses; not a real-time user playtest. */
import { mkdirSync, writeFileSync } from 'node:fs';
import { IdleBattle, BASE, upgradeCost, stats, waveCount, waveEnemy, type BattleSnapshot } from '../../src/battle';
import { battleLayout, CORE_PLOTS } from '../../src/layout';
import { waveRecipe, spawnGap, clearReward } from '../../src/wave-recipes';
import { ENEMIES } from '../../src/enemy-roster';
import { healthMultiplier, battleReward } from '../../src/balance';
import { certifyFarm, defenseFingerprint, type FarmCertificate } from '../../src/farming';
import { nextPurchase, purchase } from './balance-run';
const output='artifacts/idle-bastion/acceptance/wave-rework';mkdirSync(output,{recursive:true});
const recipes=Array.from({length:40},(_,i)=>{
  const wave=i+1;const calculate=(version:number)=>{
    const enemies=Array.from({length:waveCount(wave,version)},(_,j)=>waveEnemy(wave,j,version));
    const counts:Record<string,number>={};for(const e of enemies)counts[e.id]=(counts[e.id]??0)+1;
    return {count:enemies.length,counts,hp:enemies.reduce((s,e)=>s+e.hp*healthMultiplier(wave,version,e.id==='Rosenspiegel'),0),
      armoredHp:enemies.reduce((s,e)=>s+e.hp*healthMultiplier(wave,version,e.id==='Rosenspiegel')/(1-e.armor),0),
      spawnSeconds:.15+enemies.slice(1).reduce((s,_,j)=>s+spawnGap(wave,j+1,version),0),
      gold:enemies.reduce((s,e)=>s+battleReward(e.gold,wave,version),battleReward(clearReward(wave,version),wave,version))};
  };
  return {wave,family:wave>=6&&wave!==15&&wave!==25?waveRecipe(wave).family:wave===15||wave===25?'boss':'entry',old:calculate(10),current:calculate(11)};
});

function play(approach:'balanced'|'archers'|'area'){
  const b=new IdleBattle(battleLayout(false,CORE_PLOTS,5));
  const milestones:Record<string,number>={},losses:unknown[]=[],purchases:unknown[]=[],clears:unknown[]=[];
  const images=new Set<number>();let proof:FarmCertificate|undefined,key='',invested=-1,retried=-1,waveStarted=0,earnedAtStart=0;
  let mid:BattleSnapshot|undefined;
  for(let second=0;second<1800&&b.highestCleared<40;second++){
    if(b.wispUnlocked&&!b.wispArrival.met)b.meetWisp();
    const cannon=b.towers.find(t=>t.def.id===3);
    const focus=approach==='area'&&b.highestCleared>=10&&!b.towers.some(t=>t.padId==='cell-10-3')&&b.canBuild('cell-10-3',3)
      ? {type:'build' as const,pad:'cell-10-3',kind:3 as const}:approach==='area'&&b.settlement.workshopUpgraded&&cannon&&cannon.level<Math.min(12,7+Math.floor(Math.max(0,b.highestCleared-20)/5))&&b.gold>=upgradeCost(cannon)
      ? {type:'upgrade' as const,uid:cannon.uid}:nextPurchase(b,approach==='archers'?'alternative':'guided');
    if(focus&&purchase(b,focus)){invested=second;purchases.push({at:b.elapsed,...focus,gold:b.gold});}
    const nextKey=defenseFingerprint(b)+'/'+b.liveClearedWaves.join(',');
    if(nextKey!==key){proof=certifyFarm(b,proof);b.setFarmWave(proof?.wave??1);key=nextKey;}
    if(b.mode==='farm'&&invested>retried){b.requestAdvance();retried=invested;}
    b.update(1);
    for(const e of b.drainEvents()){
      if(e.type==='wave'){waveStarted=b.elapsed;earnedAtStart=b.earned+b.rewardRemainderUnits/1000;}
      if(e.type==='defeat')losses.push({at:b.elapsed,wave:e.wave});
      if(e.type==='boss-victory')milestones['boss'+e.wave]??=b.elapsed;
      if(e.type==='clear'){
        clears.push({wave:e.wave,at:b.elapsed,seconds:b.elapsed-waveStarted+2,gold:b.earned+b.rewardRemainderUnits/1000-earnedAtStart});
        milestones['wave'+e.wave]??=b.elapsed;
      }
    }
    if(b.highestCleared>=25&&!mid)mid=b.snapshot();
    const visibleTypes=b.wave===40?['ForestGoblin','BoneGuard','ForestCultist']:[b.wave===19?'ForestGoblin':b.wave===26?'BoneGuard':'ForestCultist'];
    if(approach==='balanced'&&[19,26,32,40].includes(b.wave)&&!images.has(b.wave)&&b.phase==='wave'&&visibleTypes.every(id=>b.enemies.some(e=>e.def.id===id))){
      writeFileSync(`${output}/view-wave${b.wave}.json`,JSON.stringify(b.snapshot(),null,2));images.add(b.wave);
    }
  }
  const result={approach,seconds:b.elapsed,record:b.highestCleared,milestones,losses,levels:b.towers.map(t=>({kind:t.def.id,pad:t.padId,level:t.level})),farm:proof,clears,purchases};
  writeFileSync(`${output}/played-${approach}.json`,JSON.stringify(result,null,2));
  console.log(JSON.stringify({approach,seconds:b.elapsed,record:b.highestCleared,boss15:milestones.boss15,boss25:milestones.boss25,wave40:milestones.wave40,losses:losses.length,levels:result.levels}));
  return {result,mid:mid!,late:b.snapshot()};
}

function measure(snapshot:BattleSnapshot,wave:number,version:number){
  const s=structuredClone(snapshot);s.introduction={stage:'done',preparationSeconds:0,halted:false};s.discovery='off';
  s.highestCleared=wave-1;s.wave=wave-1;s.phase='intermission';s.mode='advance';s.advanceRequested=false;s.farmWave=1;
  s.liveClearedWaves=s.liveClearedWaves.filter(w=>w<wave);s.lives=BASE.coreLives;s.queue=[];s.enemies=[];s.shots=[];s.spawnTimer=0;s.intermissionRemaining=0;
  s.bossChallengeRequested=false;s.bossCharm={phase:'idle',targetUid:null,remaining:0,cooldown:0};
  let b=IdleBattle.restore(s,{maraBonus:false,ilyraAbilities:false,socialRewards:false});if(!b)throw Error(`Invalid earned ${wave} fixture`);
  b.update(.025);const started=b.snapshot();started.waveRecipeVersion=version as 10|11;
  started.queue=Array.from({length:waveCount(wave,version)},(_,i)=>waveEnemy(wave,i,version).id);
  b=IdleBattle.restore(started,{maraBonus:false,ilyraAbilities:false,socialRewards:false});if(!b)throw Error('Invalid versioned wave fixture');
  for(const t of b.towers)t.cooldown=stats(t).cooldown;
  const gold=b.earned+b.rewardRemainderUnits/1000;let seconds=0;
  for(;seconds<180;seconds+=.025){
    b.update(.025);const events=b.drainEvents();
    if(events.some(e=>e.type==='defeat'))return {wave,version,win:false,leaks:20,seconds};
    if(events.some(e=>e.type==='clear')){const reward=b.earned+b.rewardRemainderUnits/1000-gold;return {wave,version,win:true,leaks:20-b.lives,seconds:seconds+2,reward,goldPerMinute:reward*60/(seconds+2)};}
  }
  return {wave,version,win:false,leaks:20-b.lives,seconds};
}
const played=([ 'balanced','archers','area'] as const).map(play);
const fixed=played.flatMap(p=>(['mid','late'] as const).flatMap(stage=>[26,27,28,29,30,31,32,33,34,35,36,37,38,39,40].flatMap(wave=>[10,11].map(version=>({approach:p.result.approach,stage,...measure(p[stage],wave,version)})))));
writeFileSync(`${output}/balance-results.json`,JSON.stringify({recipes,played:played.map(p=>p.result),fixed},null,2));
console.log(JSON.stringify({old29to30:recipes[29].old.armoredHp/recipes[28].old.armoredHp,current29to30:recipes[29].current.armoredHp/recipes[28].current.armoredHp,
 fixedNewWins:fixed.filter(r=>r.version===11&&r.win).length,fixedNewSafe:fixed.filter(r=>r.version===11&&r.win&&!r.leaks).length,fixedOldWins:fixed.filter(r=>r.version===10&&r.win).length}));
