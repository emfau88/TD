/** Rules 21: three readable silhouettes in the opening, then recurring escorts.
 * Historical attempts use the frozen rules-20 recipes without substitution. */
import {ENEMIES,regularEnemy,type EnemyId} from './enemy-roster';
import {wormEncounter} from './worm';
import {waveRecipeV20,spawnGapV20,clearRewardV20,waveHealthFactorV20} from './wave-recipes-v20';
import {enemyPressure,type WaveRecipe} from './wave-recipes-v11';
export {FAMILY_NAMES,enemyPressure,type WaveFamily,type WaveRecipe} from './wave-recipes-v11';
type Swap=readonly [from:EnemyId,to:EnemyId,count?:number];
const OPENING:Readonly<Record<number,readonly Swap[]>>={
  3:[['Leafbug','CobaltSlime',2]], 4:[['Leafbug','CobaltSlime',2]],
  5:[['Leafbug','CobaltSlime']], 7:[['Firebug','FlameWisp',2]],
  8:[['Leafbug','FlameWisp',2],['Leafbug','CobaltSlime']],
  9:[['Firebug','FlameWisp']], 10:[['Leafbug','CobaltSlime']],
  12:[['FlyingLocust','FloatingEye',2]], 14:[['FlyingLocust','FloatingEye']],
  16:[['Leafbug','CobaltSlime']], 18:[['Firebug','FlameWisp']],
  19:[['FlyingLocust','FloatingEye']], 20:[['Leafbug','CobaltSlime'],['Firebug','FlameWisp']],
  23:[['Firebug','FlameWisp'],['FlyingLocust','FloatingEye']],
  27:[['FlyingLocust','FloatingEye']], 33:[['FlyingLocust','FloatingEye']],
  38:[['Leafbug','CobaltSlime']], 41:[['Firewasp','FlameWisp']],
};
// Later fire spirits replace existing flyers, preserving ground/air counters.
const RECURRING:readonly Swap[]=[['Leafbug','CobaltSlime'],['Firewasp','FlameWisp'],['FlyingLocust','FloatingEye']];
function previous(wave:number):WaveRecipe{
  if(wave>=6)return waveRecipeV20(wave,20);
  const enemies=Array.from({length:wave+5},(_,i)=>regularEnemy(wave,i,20).id);
  return {family:'swarm',enemies,gaps:enemies.map((_,i)=>spawnGapV20(wave,i+1,20)),clearGold:clearRewardV20(wave,20),elite:false};
}
export function waveRecipe(wave:number,version=21):WaveRecipe{
  if(version<21)return waveRecipeV20(wave,version);
  const old=previous(wave);
  if(wave===15||wave===25||wormEncounter(wave,version)||old.elite)return old;
  const swaps=OPENING[wave]??(wave>=26?[RECURRING[wave%3]]:[]);
  if(!swaps.length)return old;
  const enemies=[...old.enemies];let clearGold=old.clearGold;
  for(const[from,to,count]of swaps){
    const slots=enemies.map((id,i)=>id===from?i:-1).filter(i=>i>=0),n=Math.min(count??slots.length,slots.length);
    for(let k=0;k<n;k++){
      const index=slots[Math.floor((k+.5)*slots.length/n)];
      enemies[index]=to;clearGold+=ENEMIES[from].gold-ENEMIES[to].gold;
    }
  }
  return {...old,enemies,clearGold};
}
export const spawnGap=spawnGapV20;
export function clearReward(wave:number,version:number):number{
  return version>=21&&wave!==15&&wave!==25?waveRecipe(wave,version).clearGold:clearRewardV20(wave,version);
}
export function waveHealthFactor(wave:number,version:number,boss:boolean):number{
  const factor=waveHealthFactorV20(wave,Math.min(version,20),boss);
  if(version<21||wave<=25||boss||wormEncounter(wave,version))return factor;
  const pressure=(r:WaveRecipe)=>r.enemies.reduce((sum,id)=>sum+enemyPressure(id),0);
  // Retain the reviewed late pressure curve; only the composition changes.
  return factor*pressure(previous(wave))/pressure(waveRecipe(wave,version));
}
