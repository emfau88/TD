/** Integration audit: same purchase controllers as the reviewed hypothesis, using the actual current engine. */
const permille = 100;
import assert from 'node:assert/strict';
import {mkdirSync, readFileSync, writeFileSync} from 'node:fs';
import {fileURLToPath, pathToFileURL} from 'node:url';
import {IdleBattle, stats, upgradeCost, type Tower, type TowerId, type BattleSnapshot} from '../../../../experiments/idle-bastion/src/battle';
import {certifyFarm, defenseFingerprint, farmRewardGold, type FarmCertificate} from '../../../../experiments/idle-bastion/src/farming';
import {createOfflineState, beginAbsence, reserveOffline, offlinePolicy} from '../../../../experiments/idle-bastion/src/offline';
export const dir=fileURLToPath(new URL('.',import.meta.url));
mkdirSync(dir+'runs',{recursive:true});
export const r=(n:number)=>Math.round(n*1000)/1000;
export const wallet=(b:IdleBattle)=>r(b.gold+b.goldRemainderUnits/1000);
const earnings=(b:IdleBattle)=>r(b.earned+b.rewardRemainderUnits/1000);
const levels=(b:IdleBattle)=>b.towers.map(t=>({pad:t.padId,kind:t.def.id,level:t.level,spent:t.spent}));
export const profiles={
  relaxed:{interval:20,batch:1,retrySeconds:60,farms:2,heroes:false},
  mixed:{interval:10,batch:1,retrySeconds:25,farms:1,heroes:true},
  tactical:{interval:5,batch:2,retrySeconds:10,farms:1,heroes:true},
} as const;
export type Style=keyof typeof profiles;
type Options={initial?:BattleSnapshot;seconds?:number;cashOut?:boolean;buy?:boolean;retry?:'normal'|'immediate'|'never';capture?:boolean;adapt?:boolean};
export function run(style:Style,options:Options={}){
  const b=options.initial?IdleBattle.restore(structuredClone(options.initial))!:IdleBattle.newGame();assert.ok(b);
  const cfg=profiles[style],t0=b.elapsed,g0=wallet(b),e0=earnings(b),initialRecord=b.highestCleared;
  let spent=0,nextBuy=t0,losses=0,pressure=0,lastFailure:number|null=null,recoveryBought=false,recoveryFarms=0;
  let proof:FarmCertificate|undefined,proofKey='',row:any,firstPressure:any,firstLeak:any,firstLoss:any;
  const rows:any[]=[],purchases:any[]=[],snapshots:Record<string,BattleSnapshot>={},milestones:any[]=[],recoveries:any[]=[];
  let activeSeconds=0,farmSeconds=0,maxIdle=0,lastRecord=0,nextMinute=300,returnSpending:any;
  b.drainEvents();
  const refresh=()=>{const key=defenseFingerprint(b)+'/'+b.liveClearedWaves.join(',');if(key!==proofKey){proof=certifyFarm(b,proof);b.setFarmWave(proof?.wave??0);proofKey=key;}};
  const transact=(label:string,fn:()=>unknown)=>{const before=wallet(b),ok=!!fn();if(ok){const cost=r(before-wallet(b));spent=r(spent+cost);purchases.push({t:r(b.elapsed-t0),wave:b.wave,label,cost,gold:wallet(b),levels:levels(b)});if(cost>0&&lastFailure!==null)recoveryBought=true;refresh();}return ok;};
  const pad=(x:number,y:number)=>b.layout.towerPads.find(p=>p.cell.x===x&&p.cell.y===y)?.id;
  const at=(x:number,y:number)=>b.towers.find(t=>t.padId===pad(x,y));
  const build=(x:number,y:number,kind:TowerId)=>{const p=pad(x,y);return p?transact(`build ${kind} @${x},${y}`,()=>b.build(p,kind)):false;};
  const up=(t:Tower)=>transact(`upgrade ${t.def.id} @${t.padId} ->${t.level+1}`,()=>b.upgrade(t.uid));
  const heroActions=()=>{
    if(b.discoveryPaused){if(b.discovery==='wisp')b.meetWisp();else b.continueDiscovery();}
    if(['mara-controls','cannon','warehouse'].includes(b.discovery))b.dismissDiscovery();
    if(b.discovery==='mara-ready')b.castMaraNow();
    if(!b.discoveryActive)b.mara.autoCast=true;
    if(!cfg.heroes||!b.ilyra)return;
    if(b.ilyra.introduction==='move')assert.ok(b.moveIlyraTo(style==='tactical'?{x:13,y:6}:{x:17,y:6}),'earned Ilyra movement');
    if(b.ilyra.introduction==='cast'){
      const target=b.enemies.filter(e=>b.canCastIlyra(e)).sort((a,z)=>z.distance-a.distance)[0];if(target)b.castIlyraAt(target);
    }
    if(b.ilyra.introduction==='done'&&!b.ilyra.autoCast)assert.ok(b.setIlyraAuto(true));
  };
  const generalBuy=()=>{
    // Sensitivity only: a normal player reacts to the first late defeat with
    // a second slow zone, then an extra damage tower after another failed try.
    if(options.adapt&&style==='mixed'&&losses>=1&&b.highestCleared>=30){
      if(!at(14,7))return build(14,7,2);
      if(at(14,7)!.level<3)return up(at(14,7)!);
      if(losses>=2&&!at(10,3))return build(10,3,3);
    }
    if(!b.settlement.workshopUpgraded&&b.towers.some(t=>t.def.id!==2&&t.level>=6))return transact('workshop2',()=>b.upgradeWorkshop());
    if(cfg.heroes&&b.highestCleared>=25){
      if(!b.settlement.tavernBuilt)return transact('tavern',()=>b.buildTavern(b.recommendedTavernPlot!));
      if(b.settlement.tavernLevel===1)return transact('tavern2',()=>b.upgradeTavern());
      if(!b.ilyra)return transact('Ilyra',()=>b.recruitIlyra());
      if(b.stormResearchUnlocked&&!b.settlement.stormResearched)return transact('storm research',()=>b.researchStorm());
      if(b.settlement.stormResearched&&!b.towers.some(t=>t.def.id===5))return build(style==='tactical'?10:11,style==='tactical'?3:5,5);
    }
    // Later expansion is bought with earned gold; no perfect placement search or free tower relocation.
    if(b.highestCleared>=25&&style==='relaxed'&&!b.towers.some(t=>t.def.id===3))return build(9,7,3);
    if(b.highestCleared>=30&&style==='mixed'&&!at(14,8))return build(14,8,3);
    if(b.highestCleared>=20&&style==='tactical')for(const [x,y,kind] of [[9,7,3],[14,8,4]] as const)if(!at(x,y))return build(x,y,kind);
    const candidates=b.towers.filter(t=>t.level<b.maxLevel&&(t.def.id!==2||t.level<(style==='relaxed'?4:3))&&upgradeCost(t)<=b.gold);
    const gain=(t:Tower)=>{const a=stats(t),z=stats({...t,level:t.level+1});return (z.damage/z.cooldown-a.damage/a.cooldown)/upgradeCost(t)*(t.def.id===3?3:t.def.id===5?2:t.def.id===4?1.4:1);};
    candidates.sort((a,z)=>style==='tactical'?gain(z)-gain(a)||a.uid-z.uid:upgradeCost(a)-upgradeCost(z)||a.uid-z.uid);
    return candidates[0]?up(candidates[0]):false;
  };
  const buy=()=>{
    const w=b.towers.find(t=>t.protected)!,f=b.towers.find(t=>t.def.id===2)!;
    if(style==='relaxed'){
      if(w.level<3)return up(w);if(f.level<2)return up(f);
      if(!at(17,9))return build(17,9,1);if(at(17,9)!.level<2)return up(at(17,9)!);
      if(!b.settlement.warehouseBuilt)return transact('warehouse',()=>b.buildWarehouse());
      if(!b.bossVictories){
        if(losses>=3&&!b.towers.some(t=>t.def.id===4))return build(14,8,4);
        const target=[3,4,5,6][Math.min(3,losses)];
        const next=b.towers.filter(t=>t.def.id!==2&&t.level<target).sort((a,z)=>upgradeCost(a)-upgradeCost(z))[0];
        return next?up(next):false;
      }
      if(!b.towers.some(t=>t.def.id===4))return build(14,8,4);
      return generalBuy();
    }
    const cannon=b.towers.find(t=>t.def.id===3);
    if(!cannon)return b.highestCleared>=5?build(style==='mixed'?9:11,style==='mixed'?7:5,3):false;
    if(w.level<3)return up(w);if(cannon.level<3)return up(cannon);if(f.level<2)return up(f);
    if(!b.settlement.warehouseBuilt&&b.warehouseUnlocked)return transact('warehouse',()=>b.buildWarehouse());
    if(!b.towers.some(t=>t.def.id===4)&&b.highestCleared>=10)return build(14,5,4);
    if(style==='tactical'&&b.bossVictories&&!at(14,7))return build(14,7,2);
    return generalBuy();
  };
  const buyBatch=(n:number)=>{for(let i=0;i<n;i++)if(!buy())break;
    if(style==='tactical'){
      const best=[...b.towers].filter(t=>t.def.id!==2).sort((a,z)=>stats(z).damage/stats(z).cooldown-stats(a).damage/stats(a).cooldown)[0];
      if(best&&b.mara.targetTowerUid!==best.uid){b.assignMara(best.uid);refresh();}
    }
  };
  if(!options.initial){b.beginIntroduction();assert.ok(transact('starter',()=>b.build(b.recommendedStarterPad!,1)));assert.ok(b.startDefense());}
  refresh();
  if(options.cashOut){
    if(b.phase==='defeat')b.update(.025);heroActions();const before=wallet(b);buyBatch(1000);
    returnSpending={spent:r(before-wallet(b)),remaining:wallet(b),levels:levels(b)};
    if(b.mode==='farm')b.requestAdvance();
  }
  if(b.phase==='wave')row={wave:b.wave,mode:b.mode,start:0,frontier:b.wave>b.highestCleared,partial:true,goldStart:earnings(b),farthest:0};
  const seconds=options.seconds??1800;
  for(let tick=0;tick<seconds*40;tick++){
    if(b.learningPaused&&b.guiding){const stage=b.introduction.stage;
      if(stage==='upgrade')assert.ok(up(b.towers[0]));
      if(stage==='workshop')assert.ok(transact('workshop',()=>b.buildWorkshop()));
      if(stage==='research')assert.ok(transact('frost research',()=>b.researchFrost()));
      if(stage==='frost')assert.ok(transact('free frost',()=>b.build(b.recommendedFrostPad!,2)));
      if(b.learningPaused)assert.ok(b.continueLesson());
    }
    heroActions();
    // Stress control: a player presses advance within the existing 2s intermission.
    if(options.retry==='immediate'&&!b.guiding&&b.mode==='farm'&&b.phase!=='defeat'&&tick%40===0)b.requestAdvance();
    if(!b.guiding&&b.phase!=='defeat'&&b.elapsed+1e-9>=nextBuy){nextBuy=b.elapsed+cfg.interval;
      if(options.buy!==false)buyBatch(cfg.batch);
      if(b.mode==='farm'&&!b.advanceRequested&&lastFailure!==null&&options.retry!=='never'){
        const ready=options.retry==='immediate'||(recoveryBought&&recoveryFarms>=cfg.farms&&b.elapsed-lastFailure>=cfg.retrySeconds);
        if(ready)b.requestAdvance();
      }
    }
    if(!b.guiding&&b.mode==='farm')farmSeconds+=.025;else activeSeconds+=.025;
    b.update(.025);
    if(row){for(const e of b.enemies)if(e.hp>0)row.farthest=Math.max(row.farthest,e.distance/e.total);
      if(!firstLeak&&b.lives<20)firstLeak={wave:b.wave,at:r(b.elapsed-t0)};
      if(!firstPressure&&b.lives<=15)firstPressure={wave:b.wave,at:r(b.elapsed-t0)};
    }
    for(const e of b.drainEvents()){
      if(e.type==='wave')row={wave:e.wave,mode:b.mode,start:r(b.elapsed-t0),frontier:b.wave>b.highestCleared,goldStart:earnings(b),farthest:0,levelsStart:levels(b)};
      if((e.type==='clear'||e.type==='defeat')&&row){
        Object.assign(row,{result:e.type,end:r(b.elapsed-t0),damage:20-b.lives,gold:r(earnings(b)-row.goldStart),farthest:r(row.farthest)});rows.push(row);
        if(e.type==='defeat'){
          losses++;if(!firstLoss){firstLoss={wave:b.wave,at:r(b.elapsed-t0)};snapshots.firstLoss=b.snapshot();}
          if(lastFailure===null)recoveries.push({wave:b.wave,lossAt:r(b.elapsed-t0),gold:wallet(b)});
          lastFailure=b.elapsed;recoveryBought=false;recoveryFarms=0;
        }else{
          if(b.mode==='farm'&&lastFailure!==null)recoveryFarms++;
          if(row.frontier){maxIdle=Math.max(maxIdle,b.elapsed-t0-lastRecord);lastRecord=b.elapsed-t0;
            if(lastFailure!==null){const recovery=recoveries.at(-1);if(recovery&&!recovery.winAt){recovery.winAt=r(b.elapsed-t0);recovery.duration=r(recovery.winAt-recovery.lossAt);}lastFailure=null;recoveryBought=false;recoveryFarms=0;}
          }
          if(b.lives<=15)pressure++;
          if([20,30].includes(b.wave)&&!snapshots['clear'+b.wave])snapshots['clear'+b.wave]=b.snapshot();
        }row=undefined;
      }
    }
    refresh();
    const elapsed=b.elapsed-t0;
    if(elapsed+1e-6>=nextMinute){milestones.push({seconds:nextMinute,record:b.highestCleared,wave:b.wave,mode:b.mode,gold:wallet(b),earned:r(earnings(b)-e0),spent,levels:levels(b)});nextMinute+=300;}
    if(tick%2400===0)assert.equal(Math.round((g0+earnings(b)-e0-spent)*1000),Math.round(wallet(b)*1000),'real earned-gold ledger');
  }
  assert.ok(IdleBattle.restore(b.snapshot()),'valid final save');
  assert.equal(Math.round((g0+earnings(b)-e0-spent)*1000),Math.round(wallet(b)*1000),'final money ledger');
  maxIdle=Math.max(maxIdle,b.elapsed-t0-lastRecord);
  const frontier=rows.filter(x=>x.frontier);let streak=0,longestSafe=0;
  for(const row of frontier){streak=row.damage===0&&row.result==='clear'?streak+1:0;longestSafe=Math.max(longestSafe,streak);}
  const summary={style,permille,elapsed:r(b.elapsed-t0),initialRecord,highest:b.highestCleared,wave:b.wave,mode:b.mode,
    firstLeak,firstPressure,firstLoss,losses,frontierAttempts:frontier.length,pressureAttempts:frontier.filter(x=>x.damage>=5).length,
    longestSafe,frontierSafeBeforePressure:frontier.findIndex(x=>x.damage>=5),farmSeconds:r(farmSeconds),activeSeconds:r(activeSeconds),maxNoRecordSeconds:r(maxIdle),
    earned:r(earnings(b)-e0),gold:wallet(b),spent,returnSpending,levels:levels(b),farm:proof?.wave,farmPerMinute:proof?r(farmRewardGold(proof)/proof.durationMs*60000):0,
    ilyra:b.ilyra?.introduction??null,storm:b.settlement.stormResearched,milestones,recoveries};
  return {summary,rows,purchases,snapshots,final:b.snapshot()};
}
export function offline(snapshot:BattleSnapshot,hours:number){
  const b=IdleBattle.restore(snapshot)!;assert.ok(b);const proof=certifyFarm(b);assert.ok(proof,'real earned farm certificate');
  const now=1000000,off=reserveOffline(beginAbsence(createOfflineState(now),now,proof,false,offlinePolicy(b.settlement.warehouseBuilt)),now+hours*3600000);
  const units=off.pendingReward?.amountUnits??0;const capped=reserveOffline(beginAbsence(createOfflineState(now),now,proof,false,offlinePolicy(b.settlement.warehouseBuilt)),now+8*3600000);
  if(hours===24)assert.equal(units,capped.pendingReward?.amountUnits??0);
  b.creditOfflineUnits(units);return {snapshot:b.snapshot(),gold:units/1000,proof};
}
export const save=(path:string,x:unknown)=>writeFileSync(dir+path,JSON.stringify(x,null,2)+'\n');
