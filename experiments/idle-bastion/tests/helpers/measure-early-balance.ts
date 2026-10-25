/** Reproducible earned-gold release experiment. Run via scripts/early-balance-release.py. */
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { writeFileSync, mkdirSync, readFileSync, existsSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { pathToFileURL } from 'node:url';
import type { IdleBattle as Battle, Tower, TowerId, BattleSnapshot } from '../../src/battle';
import type { FarmCertificate } from '../../src/farming';
const source = resolve(process.env.SPIRE_BALANCE_SOURCE ?? 'experiments/idle-bastion/src');
const engine = await import(pathToFileURL(join(source, 'battle.ts')).href) as typeof import('../../src/battle');
const farming = await import(pathToFileURL(join(source, 'farming.ts')).href) as typeof import('../../src/farming');
const recipes = await import(pathToFileURL(join(source, 'wave-recipes.ts')).href) as typeof import('../../src/wave-recipes');
const balance = await import(pathToFileURL(join(source, 'balance.ts')).href) as typeof import('../../src/balance');
const { IdleBattle, stats, upgradeCost, waveCount, waveEnemy, BATTLE_RULES_VERSION } = engine;
const output = process.argv[2] ?? 'qa/early-balance-release/baseline';
mkdirSync(output, { recursive: true });
const round = (n:number) => Math.round(n*1000)/1000;
const wallet = (b:Battle) => b.gold + b.goldRemainderUnits/1000;
const levels = (b:Battle) => b.towers.map(t=>({pad:t.padId,kind:t.def.id,level:t.level}));
type Profile = { name:string; style:'A'|'B'|'C'|'minimal'; interval:number; mara?:boolean; freeze15?:boolean; cannonPad?:string; immediateRetry?:boolean };
const profiles:Profile[] = [
  {name:'A',style:'A',interval:20}, {name:'A-direct-retry',style:'A',interval:20,immediateRetry:true}, {name:'B',style:'B',interval:10}, {name:'C',style:'C',interval:5},
  {name:'minimal',style:'minimal',interval:20}, {name:'B-no-mara',style:'B',interval:10,mara:false},
  {name:'B-freeze15',style:'B',interval:10,freeze15:true},
  {name:'C-20s',style:'C',interval:20},
  {name:'B-poor-placement',style:'B',interval:10,cannonPad:'cell-17-9'},
];
export function run(profile:Profile) {
  const b = IdleBattle.newGame();
  const purchases:unknown[] = [], attempts:any[] = [], snapshots:Record<string,BattleSnapshot> = {};
  let spent=0, nextBuy=0, losses=0, pressure=0, lastFailure=0, recoveryBought=false, recoveryFarms=0;
  let proof:FarmCertificate|undefined, proofKey='', current:any, tutorialEnd=0;
  const transact=(label:string,fn:()=>unknown) => {
    const before=wallet(b), ok=!!fn();
    if(ok){const cost=round(before-wallet(b));spent+=cost;purchases.push({at:round(b.elapsed),wave:b.wave,label,cost,gold:round(wallet(b)),levels:levels(b)});
      if(cost>0 && lastFailure)recoveryBought=true;}
    return ok;
  };
  const padId=(pad:string)=>{const m=/^cell-(\d+)-(\d+)$/.exec(pad);return m?b.layout.towerPads.find(p=>p.cell.x===Number(m[1])&&p.cell.y===Number(m[2]))?.id??pad:pad;};
  const at=(pad:string)=>b.towers.find(t=>t.padId===padId(pad));
  const build=(pad:string,kind:TowerId)=>transact('build '+kind+' '+pad,()=>b.build(padId(pad),kind));
  const up=(tower:Tower)=>transact('upgrade '+tower.def.id+' '+tower.padId,()=>b.upgrade(tower.uid));
  const upgradeTo=(tower:Tower|undefined,level:number)=>tower && tower.level<Math.min(b.maxLevel,level) ? up(tower):false;
  const buy = () => {
    if(profile.style==='minimal'||profile.freeze15&&b.bossVictories)return false;
    const w=b.towers.find(t=>t.protected)!, f=b.towers.find(t=>t.def.id===2)!;
    if(profile.style==='A') {
      if(w.level<3)return up(w);
      if(f.level<2)return up(f);
      const other=at('cell-17-9');
      if(!other)return build('cell-17-9',1);
      if(other.level<2)return up(other);
      if(!b.settlement.warehouseBuilt)return transact('warehouse',()=>b.buildWarehouse());
      const target = b.bossVictories ? (b.highestCleared>=20?9:6) : [3,4,5,6][Math.min(3,losses)];
      if(losses>=3&&!b.towers.some(t=>t.def.id===4))return build('cell-14-8',4);
      if(target>6&&!b.settlement.workshopUpgraded)return transact('workshop2',()=>b.upgradeWorkshop());
      const next=b.towers.filter(t=>t.def.id!==2 && t.level<(t.def.id===4?Math.min(6,target):target))
        .sort((a,z)=>upgradeCost(a)-upgradeCost(z))[0];
      return next ? up(next):false;
    }
    const cannon=b.towers.find(t=>t.def.id===3);
    if(!cannon && b.highestCleared>=5)return build(profile.cannonPad??(profile.style==='B'?'cell-9-7':'cell-11-5'),3);
    if(!cannon)return false;
    if(profile.style==='B') {
      if(w.level<3)return up(w);
      if(cannon.level<3)return up(cannon);
      if(f.level<2)return up(f);
      if(!b.settlement.warehouseBuilt && b.warehouseUnlocked)return transact('warehouse',()=>b.buildWarehouse());
      const sniper=b.towers.find(t=>t.def.id===4);
      if(!sniper && b.highestCleared>=10)return build('cell-14-5',4);
      if(sniper && sniper.level<3)return up(sniper);
      if(w.level<4)return up(w);
      if(b.highestCleared>=18&&!b.settlement.workshopUpgraded)return transact('workshop2',()=>b.upgradeWorkshop());
      const goal=b.highestCleared>=20?Math.min(7,5+pressure+losses):b.bossVictories?4:Math.min(6,3+losses);
      const next=b.towers.filter(t=>t.def.id!==2&&t.level<Math.min(goal,b.maxLevel)).sort((a,z)=>upgradeCost(a)-upgradeCost(z))[0];
      return next ? up(next):false;
    }
    if(!b.towers.some(t=>t.def.id===4)&&b.highestCleared>=10)return build('cell-14-5',4);
    if(b.bossVictories&&!at('cell-14-7'))return build('cell-14-7',2);
    if(b.bossVictories&&!b.settlement.workshopUpgraded&&b.gold>=1400)return transact('workshop2',()=>b.upgradeWorkshop());
    if(b.settlement.workshopUpgraded&&!b.settlement.warehouseBuilt&&b.gold>=850)return transact('warehouse',()=>b.buildWarehouse());
    const target=b.highestCleared>=20?8:b.bossVictories?6:4;
    const options=b.towers.filter(t=>t.def.id!==2&&t.level<Math.min(target,b.maxLevel)&&b.gold-upgradeCost(t)>=200);
    const gain=(t:Tower)=>{const a=stats(t),z=stats({...t,level:t.level+1});return (z.damage/z.cooldown-a.damage/a.cooldown)/upgradeCost(t);};
    options.sort((a,z)=>gain(z)-gain(a)||a.uid-z.uid);
    return options[0]?up(options[0]):false;
  };
  b.beginIntroduction(); assert.ok(build(b.recommendedStarterPad!,1)); assert.ok(b.startDefense());
  for(let tick=0;tick<30*60*40&&b.highestCleared<25;tick++){
    if(b.learningPaused && b.guiding){
      const stage=b.introduction.stage;
      if(stage==='upgrade')assert.ok(up(b.towers[0]));
      if(stage==='workshop')assert.ok(transact('workshop',()=>b.buildWorkshop()));
      if(stage==='research')assert.ok(transact('research',()=>b.researchFrost()));
      if(stage==='frost')assert.ok(build(b.recommendedFrostPad!,2));
      if(b.guiding)assert.ok(b.continueLesson());
    }
    if(!b.guiding&&!tutorialEnd){tutorialEnd=b.elapsed;nextBuy=b.elapsed;}
    if(b.discoveryPaused){if(b.discovery==='wisp')b.meetWisp();else b.continueDiscovery();}
    if(b.discovery==='mara-controls'||b.discovery==='cannon'||b.discovery==='warehouse')b.dismissDiscovery();
    if(profile.mara===false)b.mara.autoCast=false;
    if(!b.guiding&&b.phase!=='defeat'&&b.elapsed+1e-9>=nextBuy){
      nextBuy=b.elapsed+profile.interval; buy();
      if(profile.style==='C'){const best=[...b.towers].sort((a,z)=>stats(z).damage/stats(z).cooldown-stats(a).damage/stats(a).cooldown)[0];if(best)b.assignMara(best.uid);}
      if(lastFailure && recoveryBought && (profile.immediateRetry||recoveryFarms>=1) && b.mode==='farm'){
        b.requestAdvance(); lastFailure=0; recoveryBought=false; recoveryFarms=0;
      }
    }
    // Match production: only earned live clears and real two-cycle certificates.
    // Refresh at boundaries or after investments, never transfer probe gold.
    if(!b.guiding&&(b.phase==='intermission'||lastFailure)){
      const key=farming.defenseFingerprint(b)+'/'+b.liveClearedWaves.join(',');
      if(key!==proofKey){proof=farming.certifyFarm(b,proof);b.setFarmWave(proof?.wave??1);proofKey=key;}
    }
    b.update(.025);
    assert.equal(75000+b.earned*1000+b.rewardRemainderUnits-spent*1000,Math.round(wallet(b)*1000),'earned money ledger');
    if(current && b.bossEnemy){
      current.bossFarthest=Math.max(current.bossFarthest??0,b.bossEnemy.distance/b.bossEnemy.total);
      if(b.bossCharm.phase==='channel')current.channelSeconds=round((current.channelSeconds??0)+.025);
    }
    for(const e of b.drainEvents()){
      if(e.type==='wave'){
        current={wave:b.wave,mode:b.mode,start:round(b.elapsed),goldStart:round(wallet(b)),spentStart:spent,levelsStart:levels(b),interrupts:0};
        if((b.wave===15||b.wave===25)&&!snapshots['entry'+b.wave])snapshots['entry'+b.wave]=b.snapshot();
      }
      if(e.type==='boss-interrupt'&&current)current.interrupts++;
      if(e.type==='clear'||e.type==='defeat'){
        if(!current)continue;
        Object.assign(current,{result:e.type==='clear'?'win':'loss',end:round(b.elapsed),duration:round(b.elapsed-current.start),
          damage:20-b.lives,gold:round(wallet(b)),spent,earned:round(b.earned+b.rewardRemainderUnits/1000),levels:levels(b)});
        attempts.push(current);current=undefined;
        if(e.type==='defeat'){
          losses++;lastFailure=b.elapsed;recoveryBought=false;recoveryFarms=0;
          if(profile.immediateRetry)nextBuy=b.elapsed+.025;
          if(profile.style==='minimal'||profile.freeze15)break;
        }else{
          if(b.mode==='farm'&&lastFailure)recoveryFarms++;
          if(b.lives<=15&&b.highestCleared>=20)pressure=Math.min(2,pressure+1);
          if((b.wave===15||b.wave===25)&&!snapshots['clear'+b.wave])snapshots['clear'+b.wave]=b.snapshot();
        }
      }
    }
    if((profile.style==='minimal'||profile.freeze15)&&losses)break;
    if(b.bossCharm.phase==='channel'&&!snapshots['channel'+b.wave])snapshots['channel'+b.wave]=b.snapshot();
    if([10,20].includes(b.wave)&&!snapshots['active'+b.wave]&&b.enemies.length&&b.shots.length&&b.snapshot().queue.length)snapshots['active'+b.wave]=b.snapshot();
  }
  const wins=(n:number)=>attempts.find(a=>a.wave===n&&a.result==='win'&&a.mode==='advance');
  const result={profile,tutorialEnd:round(tutorialEnd),record:b.highestCleared,losses,firstLoss:attempts.find(a=>a.result==='loss'),
    boss15:wins(15),boss25:wins(25),farmAttempts:attempts.filter(a=>a.mode==='farm'),
    finalGold:round(wallet(b)),spent,levels:levels(b),proof:farming.certifyFarm(b,proof),attempts,purchases};
  const runsFile=join(output,'runs.json');
  const runs=existsSync(runsFile)?JSON.parse(readFileSync(runsFile,'utf8')):[];
  const retained=runs.filter((r:any)=>r.profile.name!==profile.name);
  retained.push(result);retained.sort((a:any,z:any)=>a.profile.name.localeCompare(z.profile.name));
  writeFileSync(runsFile,'[\n'+retained.map((r:any)=>JSON.stringify(r)).join(',\n')+'\n]\n');
  if(profile.name==='B' && (!process.env.SPIRE_BALANCE_SOURCE || process.env.SPIRE_BALANCE_CAPTURE==='1'))
    writeFileSync(join(output,'B-snapshots.json'),JSON.stringify(snapshots,null,2)+'\n');
  if(process.env.SPIRE_BALANCE_CAPTURE==='1' && profile.name==='B'){
    const continuations=['active10','active20','channel15','channel25'].map(key=>{
      const before=snapshots[key];assert.ok(before,key);
      const old=IdleBattle.restore(before)!;assert.ok(old);
      let steps=0;while(old.phase==='wave'&&steps<12000){old.update(.025);steps++;}
      assert.notEqual(old.phase,'wave');
      return {key,before,steps,after:old.snapshot()};
    });
    const historic=[];
    for(let version=3;version<=15;version++)for(let wave=1;wave<=70;wave++){
      const enemies=Array.from({length:waveCount(wave,version)},(_,i)=>waveEnemy(wave,i,version));
      historic.push({version,wave,enemies:enemies.map(e=>[e.id,e.hp*balance.healthMultiplier(wave,version,e.id==='Rosenspiegel'),balance.battleReward(e.gold,wave,version)]),
        gaps:enemies.map((_,i)=>recipes.spawnGap(wave,i+1,version)),clear:balance.battleReward(recipes.clearReward(wave,version),wave,version)});
    }
    writeFileSync(join(output,'legacy-fixtures.json'),JSON.stringify({continuations,departure:{snapshot:b.snapshot(),proof:result.proof},
      historicDigest:createHash('sha256').update(JSON.stringify(historic)).digest('hex')},null,2)+'\n');
  }
  console.log(JSON.stringify({name:profile.name,record:b.highestCleared,losses,firstLoss:result.firstLoss?.wave,
    boss15:result.boss15?.end,boss25:result.boss25?.end,farms:result.farmAttempts.length,
    damage:Object.fromEntries([5,10,12,13,14,15,16,20,21,24,25].map(n=>[n,wins(n)?.damage])),gold:result.finalGold}));
  return result;
}
const ruleRows=Array.from({length:25},(_,i)=>{
  const wave=i+1, enemies=Array.from({length:waveCount(wave)},(_,j)=>waveEnemy(wave,j));
  const count:Record<string,number>={};for(const e of enemies)count[e.id]=(count[e.id]??0)+1;
  return {wave,count,maximumDamage:enemies.reduce((s,e)=>s+e.lives,0),
    hp:enemies.reduce((s,e)=>s+e.hp*balance.healthMultiplier(wave,BATTLE_RULES_VERSION,e.id==='Rosenspiegel'),0),
    spawnSeconds:round(.15+enemies.slice(1).reduce((s,_,i)=>s+recipes.spawnGap(wave,i+1,BATTLE_RULES_VERSION),0)),
    gold:round((wave>5?1.1:1)*(balance.battleReward(recipes.clearReward(wave,BATTLE_RULES_VERSION),wave,BATTLE_RULES_VERSION)+enemies.reduce((s,e)=>s+balance.battleReward(e.gold,wave,BATTLE_RULES_VERSION),0)))};
});
writeFileSync(join(output,'rules.json'),JSON.stringify(ruleRows,null,2)+'\n');
const selected=process.env.SPIRE_BALANCE_PROFILES?.split(',');
for(const p of profiles)if(selected?selected.includes(p.name):!p.immediateRetry)run(p);
