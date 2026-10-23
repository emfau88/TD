/** Paid progression and identical earned defenses across main / W01 / W02.
 * Model seconds exclude tutorial reading, human deliberation and offline income. */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { IdleBattle, BASE, stats, upgradeCost, waveCount, waveEnemy, type BattleSnapshot } from '../../src/battle';
import { battleLayout, CORE_PLOTS } from '../../src/layout';
import { waveRecipe, spawnGap, clearReward } from '../../src/wave-recipes';
import { ENEMIES } from '../../src/enemy-roster';
import { healthMultiplier, battleReward } from '../../src/balance';
import { certifyFarm, defenseFingerprint, type FarmCertificate } from '../../src/farming';
import { nextPurchase, purchase } from './balance-run';
const output = 'artifacts/idle-bastion/acceptance/wave-rework-v2';
mkdirSync(output, { recursive: true });
const approaches = ['balanced', 'archers', 'area'] as const;
function play(approach: typeof approaches[number]) {
  const b = new IdleBattle(battleLayout(false, CORE_PLOTS, 5));
  const milestones: Record<string, number> = {}, losses: unknown[] = [], buys: unknown[] = [], clears: unknown[] = [], farms: {start:number;end?:number;wave:number}[] = [];
  let proof: FarmCertificate | undefined, key = '', investment = -1, retried = -1, previousMode = b.mode, started = 0, goldStart = 0;
  let failurePower = 0;
  const power = () => b.towers.reduce((sum,t) => sum + stats(t).damage / stats(t).cooldown * (t.def.id === 3 ? 2 : t.def.id === 2 ? .5 : 1), 0);
  let mid: BattleSnapshot | undefined, dense: BattleSnapshot | undefined, peak = 0;
  for (let second = 0; second < 7200 && b.highestCleared < 40; second++) {
    if (b.wispUnlocked && !b.wispArrival.met) b.meetWisp();
    if (second % 2 === 0) {
      const cannon = b.towers.find(t => t.def.id === 3);
      const area = approach === 'area' && b.highestCleared >= 10 && !b.towers.some(t => t.padId === 'cell-10-3') && b.canBuild('cell-10-3', 3)
        ? {type:'build' as const,pad:'cell-10-3',kind:3 as const} : undefined;
      const preferred = approach === 'area' && b.settlement.workshopUpgraded && cannon && cannon.level < Math.min(12, 7 + Math.floor(Math.max(0, b.highestCleared - 20) / 5)) && b.gold >= upgradeCost(cannon)
        ? {type:'upgrade' as const,uid:cannon.uid} : undefined;
      const normal = area ?? preferred ?? nextPurchase(b, approach === 'archers' ? 'alternative' : 'guided');
      const later = [...b.towers].filter(t => t.def.id !== 2 && t.level < b.maxLevel)
        .sort((a,z) => upgradeCost(a) / (approach === 'area' && a.def.id === 3 ? 1.5 : 1) - upgradeCost(z) / (approach === 'area' && z.def.id === 3 ? 1.5 : 1))[0];
      const action = normal ?? (b.settlement.workshopUpgraded && later ? {type:'upgrade' as const,uid:later.uid} : undefined);
      if (action && purchase(b, action)) { investment = second; buys.push({at:b.elapsed,...action,gold:b.gold}); }
    }
    const nextKey = defenseFingerprint(b) + '/' + b.liveClearedWaves.join(',');
    if (nextKey !== key) { proof = certifyFarm(b, proof); b.setFarmWave(proof?.wave ?? 1); key = nextKey; }
    if (b.mode === 'farm' && investment > retried && power() >= failurePower * 1.2) { b.requestAdvance(); retried = investment; }
    b.update(1);
    if (b.mode !== previousMode) {
      if (b.mode === 'farm') farms.push({start:b.elapsed,wave:b.farmWave});
      else if (farms.at(-1)) farms.at(-1)!.end = b.elapsed;
      previousMode = b.mode;
    }
    for (const e of b.drainEvents()) {
      if (e.type === 'wave') { started = b.elapsed; goldStart = b.earned + b.rewardRemainderUnits / 1000; }
      if (e.type === 'defeat') { failurePower = power(); losses.push({at:b.elapsed,wave:e.wave}); }
      if (e.type === 'boss-victory') milestones['boss' + e.wave] ??= b.elapsed;
      if (e.type === 'clear') {
        clears.push({wave:e.wave,mode:b.mode,at:b.elapsed,seconds:b.elapsed-started+2,gold:b.earned+b.rewardRemainderUnits/1000-goldStart});
        milestones['wave' + e.wave] ??= b.elapsed;
      }
    }
    if (b.highestCleared >= 25 && !mid) mid = b.snapshot();
    if (approach === 'balanced' && b.wave === 40 && b.phase === 'wave' && b.enemies.length > peak) { peak = b.enemies.length; dense = b.snapshot(); }
  }
  if (b.highestCleared < 40 || !mid) throw Error(`${approach} stalled at ${b.highestCleared} after ${b.elapsed}s`);
  const result = { approach, seconds:b.elapsed, record:b.highestCleared, milestones, losses, farms,
    farmSeconds:farms.reduce((sum,f)=>sum+(f.end??b.elapsed)-f.start,0), levels:b.towers.map(t=>({kind:t.def.id,pad:t.padId,level:t.level})),
    gold:b.gold, earned:b.earned, farm:proof, clears, purchases:buys };
  writeFileSync(`${output}/played-${approach}.json`, JSON.stringify(result,null,2));
  writeFileSync(`${output}/earned-${approach}-mid.json`, JSON.stringify(mid,null,2));
  writeFileSync(`${output}/earned-${approach}-late.json`, JSON.stringify(b.snapshot(),null,2));
  if (dense) writeFileSync(`${output}/view-wave40.json`, JSON.stringify(dense,null,2));
  console.log(JSON.stringify({approach,seconds:b.elapsed,losses:losses.length,farmSeconds:result.farmSeconds,levels:result.levels}));
  return result;
}
function measure(snapshot: BattleSnapshot, wave: number, version: 10|11|12, omitKind = 0) {
  const source = IdleBattle.restore(snapshot); if (!source) throw Error('Invalid earned source');
  const s = source.snapshot(); s.introduction={stage:'done',preparationSeconds:0,halted:false};s.discovery='off';
  s.highestCleared=wave-1;s.wave=wave-1;s.phase='intermission';s.mode='advance';s.advanceRequested=false;s.farmWave=1;
  s.liveClearedWaves=[];s.lives=BASE.coreLives;s.queue=[];s.enemies=[];s.shots=[];s.spawnTimer=0;s.intermissionRemaining=0;
  s.bossChallengeRequested=false;s.bossCharm={phase:'idle',targetUid:null,remaining:0,cooldown:0};
  if (omitKind) s.towers=s.towers.filter(t=>t.protected||t.kind!==omitKind);
  // All omitted kinds are unprotected Frost/cannon/sniper; keep Mara's paid starter target.
  let b=IdleBattle.restore(s,{maraBonus:false,ilyraAbilities:false,socialRewards:false});if(!b)throw Error('Invalid comparison prep');
  b.update(.025);const active=b.snapshot();active.waveRecipeVersion=version;
  active.queue=Array.from({length:waveCount(wave,version)},(_,i)=>waveEnemy(wave,i,version).id);
  b=IdleBattle.restore(active,{maraBonus:false,ilyraAbilities:false,socialRewards:false});if(!b)throw Error('Invalid comparison queue');
  for(const t of b.towers)t.cooldown=stats(t).cooldown;
  const gold=b.earned+b.rewardRemainderUnits/1000, kills=b.kills;
  let seconds=0,peak=0,enemySeconds=0,escapeCount=0;const hits:Record<string,number>={};
  for(;seconds<180;seconds+=.025){
    b.update(.025);peak=Math.max(peak,b.enemies.length);enemySeconds+=b.enemies.length*.025;
    for(const e of b.drainEvents()){
      if(e.type==='escape')escapeCount++;
      if(e.type==='hit'&&e.shot)hits[e.shot.kind]=(hits[e.shot.kind]??0)+1;
      if(e.type==='defeat'||e.type==='clear'){
        const duration=seconds+.025+2, reward=b.earned+b.rewardRemainderUnits/1000-gold;
        return {wave,version,omitKind,win:e.type==='clear',leaks:20-b.lives,escapeCount,seconds:duration,reward,goldPerMinute:reward*60/duration,
          peak,meanEnemies:enemySeconds/duration,kills:b.kills-kills,hits};
      }
    }
  }
  throw Error('Comparison timed out');
}
const recipes=Array.from({length:100},(_,i)=>{
  const wave=i+1;
  const versions=[10,11,12].map(version=>{
    const enemies=Array.from({length:waveCount(wave,version)},(_,j)=>waveEnemy(wave,j,version));const counts:Record<string,number>={};
    for(const e of enemies)counts[e.id]=(counts[e.id]??0)+1;
    return {version,count:enemies.length,counts,hp:enemies.reduce((sum,e)=>sum+e.hp*healthMultiplier(wave,version,e.id==='Rosenspiegel'),0),
      armoredHp:enemies.reduce((sum,e)=>sum+e.hp*healthMultiplier(wave,version,e.id==='Rosenspiegel')/(1-e.armor),0),
      spawnSeconds:.15+enemies.slice(1).reduce((sum,_,j)=>sum+spawnGap(wave,j+1,version),0),
      gold:enemies.reduce((sum,e)=>sum+battleReward(e.gold,wave,version),battleReward(clearReward(wave,version),wave,version))};
  });
  return {wave,family:wave>=6&&wave!==15&&wave!==25?waveRecipe(wave).family:'entry/boss',versions};
});
const played=approaches.map(play);
const fixed=approaches.flatMap(approach=>(['mid','late'] as const).flatMap(stage=>{
  const s=JSON.parse(readFileSync(`${output}/baseline-v11/earned-${approach}-${stage}.json`,'utf8'));
  return Array.from({length:15},(_,i)=>i+26).flatMap(wave=>([10,11,12] as const).map(version=>({approach,stage,...measure(s,wave,version)})));
}));
const ablations=approaches.flatMap(approach=>{
  const s=JSON.parse(readFileSync(`${output}/baseline-v11/earned-${approach}-late.json`,'utf8'));
  return [29,30,32,36,40].flatMap(wave=>[0,2,3,4].flatMap(omitKind=>([10,11,12] as const).map(version=>({approach,...measure(s,wave,version,omitKind)}))));
});
writeFileSync(`${output}/balance-results.json`,JSON.stringify({recipes,played,fixed,ablations},null,2));
console.log(JSON.stringify({fixed:fixed.length,ablations:ablations.length,versions:[10,11,12].map(version=>({version,wins:fixed.filter(r=>r.version===version&&r.win).length,safe:fixed.filter(r=>r.version===version&&r.win&&!r.leaks).length}))}));
