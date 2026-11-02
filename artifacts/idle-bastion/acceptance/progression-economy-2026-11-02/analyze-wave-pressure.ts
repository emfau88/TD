/** Read-only extraction of current recipes and existing integrated runs. No candidate changes. */
import { readFileSync, writeFileSync } from 'node:fs';
import { waveCount, waveEnemy } from '../../../../experiments/idle-bastion/src/battle';
import { healthMultiplier, battleRewardUnits } from '../../../../experiments/idle-bastion/src/balance';
import { clearReward, waveRecipe } from '../../../../experiments/idle-bastion/src/wave-recipes';
const dir='artifacts/idle-bastion/acceptance/progression-economy-2026-11-02';
const waves=Array.from({length:50},(_,i)=>{
  const wave=i+1,enemies=Array.from({length:waveCount(wave,17)},(_,i)=>waveEnemy(wave,i,17));
  const composition:Record<string,number>={};let hp=0,armorAdjustedHp=0,gold=battleRewardUnits(clearReward(wave,17),wave,17,true,false)/1000;
  for(const e of enemies){composition[e.id]=(composition[e.id]??0)+1;const health=e.hp*healthMultiplier(wave,17,e.id==='Rosenspiegel');hp+=health;armorAdjustedHp+=health/(1-e.armor);gold+=battleRewardUnits(e.gold,wave,17,true,false)/1000;}
  return {wave,family:[15,25].includes(wave)?'boss':wave<6?'tutorial':waveRecipe(wave,17).family,composition,count:enemies.length,hp:Math.round(hp),armorAdjustedHp:Math.round(armorAdjustedHp),ordinaryGold:Math.round(gold*1000)/1000};
});
const runs=[];
for(const style of ['relaxed','mixed','tactical'])for(const scenario of ['fresh','w20-24h','w30-24h']){
  const data=JSON.parse(readFileSync(`${dir}/runs/${style}-${scenario}.json`,'utf8'));
  runs.push({style,scenario,firstLeak:data.summary.firstLeak,firstPressure:data.summary.firstPressure,firstLoss:data.summary.firstLoss,
    rows:data.rows.filter((r:any)=>r.frontier&&r.wave>=10&&r.wave<=46).map((r:any)=>({wave:r.wave,damage:r.damage,farthest:r.farthest,start:r.start,end:r.end,result:r.result,gold:r.gold}))});
}
writeFileSync(dir+'/wave-pressure-review.json',JSON.stringify({note:'Raw HP and armor-adjusted HP are diagnostics, not a universal combat difficulty score. Armor penetration, splash, healing, speed, grouping and placement affect real pressure. Ordinary gold excludes first-boss bonuses.',waves,runs},null,2)+'\n');
console.log(JSON.stringify(waves.filter(w=>w.wave>=19&&w.wave<=40),null,2));
