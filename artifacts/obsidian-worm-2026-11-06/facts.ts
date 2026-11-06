import {writeFileSync} from 'node:fs';
import {waveRecipe} from '../../experiments/idle-bastion/src/wave-recipes';
import {ENEMIES} from '../../experiments/idle-bastion/src/enemy-roster';
import {healthMultiplier,battleRewardUnits} from '../../experiments/idle-bastion/src/balance';
const facts=[36,45].map(wave=>{
 const prior=waveRecipe(wave,19),current=waveRecipe(wave,20),def=ENEMIES[current.enemies[0]];
 const paid=(r:typeof prior,version:number)=>[r.clearGold,...r.enemies.map(id=>ENEMIES[id].gold)].reduce((sum,g)=>sum+battleRewardUnits(g,wave,version,true,false)/1000,0);
 return {wave,hp:def.hp*healthMultiplier(wave,20,true),speed:def.speed,armor:def.armor,coreDamage:def.lives,
   oldEnemies:prior.enemies,baseGold:current.clearGold+def.gold,oldPaidWithWisp:paid(prior,19),newPaidWithWisp:paid(current,20)};
});
writeFileSync(new URL('facts.json',import.meta.url),JSON.stringify(facts,null,2)+'\n');console.log(JSON.stringify(facts,null,2));
