/** Focused merge check: identical paid defenses, only waves 45–47/rules 13–14. */
import {readFileSync,writeFileSync} from 'node:fs';
import {IdleBattle,BASE,stats,waveCount,waveEnemy} from '../../src/battle';
import {waveRecipe} from '../../src/wave-recipes';
import {ENEMIES} from '../../src/enemy-roster';
import {healthMultiplier} from '../../src/balance';
const output='artifacts/idle-bastion/acceptance/local-enemy-assets/merge-ready';
function fight(seed:any,wave:number,version:13|14){
 const s=IdleBattle.restore(seed)!.snapshot();s.highestCleared=wave-1;s.wave=wave-1;s.phase='intermission';s.mode='advance';s.advanceRequested=false;
 s.queue=[];s.enemies=[];s.shots=[];s.intermissionRemaining=0;s.spawnTimer=0;s.lives=BASE.coreLives;s.farmWave=1;s.liveClearedWaves=s.liveClearedWaves.filter(w=>w<wave);
 let b=IdleBattle.restore(s,{maraBonus:false,ilyraAbilities:false,socialRewards:false})!;if(!b)throw Error('Invalid comparison prep');
 b.update(.025);const active=b.snapshot();active.waveRecipeVersion=version;active.queue=Array.from({length:waveCount(wave,version)},(_,i)=>waveEnemy(wave,i,version).id);
 b=IdleBattle.restore(active,{maraBonus:false,ilyraAbilities:false,socialRewards:false})!;if(!b)throw Error('Invalid comparison attempt');
 for(const t of b.towers)t.cooldown=stats(t).cooldown;
 const gold=b.earned+b.rewardRemainderUnits/1000;let peak=0;
 for(let i=0;i<8000;i++){
  b.update(.025);peak=Math.max(peak,b.enemies.length);
  for(const e of b.drainEvents())if(e.type==='clear'||e.type==='defeat')return {wave,version,win:e.type==='clear',leakedLives:BASE.coreLives-b.lives,seconds:(i+1)*.025,peak,gold:b.earned+b.rewardRemainderUnits/1000-gold};
 }
 throw Error('Timed out');
}
const sources={at40:JSON.parse(readFileSync('artifacts/idle-bastion/acceptance/wave-rework-v2/earned-balanced-late.json','utf8')),before46:JSON.parse(readFileSync(output+'/historical-live46-v27.json','utf8'))};
const fights=Object.entries(sources).flatMap(([source,seed])=>[45,46,47].flatMap(w=>([13,14] as const).map(version=>({source,...fight(seed,w,version)}))));
const recipes=[45,46,47].flatMap(wave=>([13,14] as const).map(version=>{const r=waveRecipe(wave,version);return {wave,version,count:r.enemies.length,counts:Object.fromEntries([...new Set(r.enemies)].map(id=>[id,r.enemies.filter(e=>e===id).length])),effectiveHp:r.enemies.reduce((sum,id)=>sum+ENEMIES[id].hp*healthMultiplier(wave,version,false)/(1-ENEMIES[id].armor),0),budget:r.clearGold+r.enemies.reduce((sum,id)=>sum+ENEMIES[id].gold,0)};}));
writeFileSync(output+'/focused-comparisons.json',JSON.stringify({recipes,fights},null,2));console.log(JSON.stringify({recipes,fights}));
