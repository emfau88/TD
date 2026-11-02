import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
const variants=['control','A','B'],all:any={};
for(const variant of variants){
  const b=await import(`./${variant}/engine/battle.ts`),bal=await import(`./${variant}/engine/balance.ts`),w=await import(`./${variant}/engine/wave-recipes.ts`),e=await import(`./${variant}/engine/enemy-roster.ts`);
  const rows=[];
  for(let wave=1;wave<=55;wave++){
    const composition:Record<string,number>={};let hp=0,pressure=0,killBase=0,gold=bal.battleRewardUnits(w.clearReward(wave,17),wave,17,true,false)/1000;
    const enemies=Array.from({length:b.waveCount(wave,17)},(_,i)=>b.waveEnemy(wave,i,17));
    for(const enemy of enemies){composition[enemy.id]=(composition[enemy.id]??0)+1;const scale=bal.healthMultiplier(wave,17,enemy.id==='Rosenspiegel');hp+=enemy.hp*scale;pressure+=w.enemyPressure(enemy.id)*scale;killBase+=enemy.gold;gold+=bal.battleRewardUnits(enemy.gold,wave,17,true,false)/1000;}
    rows.push({wave,composition,count:enemies.length,healers:enemies.filter(e.isHealer).length,hp,pressure,baseGold:killBase+w.clearReward(wave,17),gold,gaps:enemies.map((_,i)=>w.spawnGap(wave,i+1,17))});
  }
  all[variant]={rows,stats:[b.BASE,b.FROST,b.CANNON,b.SNIPER,b.STORMLIGHT,b.SETTLEMENT,b.STORM_CHAIN]};
  if(variant!=='control'){
    assert.deepEqual(all[variant].stats,all.control.stats);
    assert.deepEqual(rows.slice(0,25),all.control.rows.slice(0,25),'W1–25 unchanged');
    for(let i=25;i<55;i++){
      const row=rows[i],old=all.control.rows[i];
      assert.equal(row.baseGold,old.baseGold);assert.equal(row.count,old.count);assert.equal(row.healers,old.healers);assert.deepEqual(row.gaps,old.gaps);
      assert.ok(Math.abs(row.gold/old.gold-1)<.01,'ordinary gold rounding <1%');
      for(const id of Object.keys(row.composition))assert.ok(id in old.composition,'no new type or early introduction');
      const special=e.introducedEnemy(i+1,17)?.id??e.introducedEnemy(i,17)?.id;
      if(special)assert.equal(row.composition[special],old.composition[special]);
      if(variant==='B'&&i>25)assert.ok(row.pressure>rows[i-1].pressure,'strictly rising diagnostic pressure');
    }
  }
}
const manifest=JSON.parse(readFileSync(new URL('./frozen.json',import.meta.url),'utf8'));
for(const [path,hash] of Object.entries(manifest.sourceManifest))assert.equal(createHash('sha256').update(readFileSync('experiments/idle-bastion/src/'+path)).digest('hex'),hash);
for(const variant of variants)for(const [path,hash] of Object.entries(manifest.variants[variant].files))assert.equal(createHash('sha256').update(readFileSync(new URL(`./${variant}/engine/${path}`,import.meta.url))).digest('hex'),hash);
writeFileSync(new URL('./recipes.json',import.meta.url),JSON.stringify(all,null,2)+'\n');
console.log('PASS: W1–25, towers, prices, counts, spawn timing, introduction/healer slots, base reward budget; B diagnostic pressure rises through W55; sources match frozen manifests.');
for(const v of variants)console.log(v,all[v].rows.filter((r:any)=>[26,30,35,40,44,50,51].includes(r.wave)).map((r:any)=>({wave:r.wave,hp:Math.round(r.hp),pressure:Math.round(r.pressure),gold:r.gold})));
