import {writeFileSync} from 'node:fs';
import {waveCount,waveEnemy} from '../../experiments/idle-bastion/src/battle';
import {ENEMY_ROSTER,ENEMIES} from '../../experiments/idle-bastion/src/enemy-roster';
import {waveRecipe} from '../../experiments/idle-bastion/src/wave-recipes';
const rows=Array.from({length:50},(_,i)=>{
 const wave=i+1,counts:Record<string,number>={};
 for(let n=0;n<waveCount(wave);n++){const id=waveEnemy(wave,n).id;counts[id]=(counts[id]??0)+1;}
 const entries=Object.entries(counts).sort((a,b)=>b[1]-a[1]),count=entries.reduce((s,e)=>s+e[1],0);
 return {wave,count,types:entries.length,dominant:entries[0][0],dominantShare:entries[0][1]/count,
   special:[15,25,36,45].includes(wave)?'boss':waveRecipe(wave)?.elite?'elite':'ordinary',counts};
});
const bands=[[1,5],[6,10],[11,20],[21,30],[31,40],[41,50]].map(([from,to])=>{
 const waves=rows.filter(r=>r.wave>=from&&r.wave<=to),counts:Record<string,number>={};
 for(const r of waves)for(const[id,n]of Object.entries(r.counts))counts[id]=(counts[id]??0)+n;
 const total=Object.values(counts).reduce((a,b)=>a+b,0),entries=Object.entries(counts).sort((a,b)=>b[1]-a[1]);
 const patterns=waves.map(r=>Object.keys(r.counts).sort().join('|'));
 return {from,to,types:Object.keys(counts).length,meanTypes:Math.round(waves.reduce((s,r)=>s+r.types,0)/waves.length*100)/100,
   uniqueTypeSets:new Set(patterns).size,dominant:entries[0][0],dominantShare:Math.round(entries[0][1]/total*1000)/10,
   sameTypeSetAsPrevious:patterns.filter((x,i)=>i>0&&x===patterns[i-1]).length,total,counts};
});
const first20=rows.filter(r=>r.wave<=20).reduce((out,r)=>{for(const[id,n]of Object.entries(r.counts))out[id]=(out[id]??0)+n;return out;},{} as Record<string,number>);
const roster=ENEMY_ROSTER.map(e=>({id:e.id,name:e.name,firstWave:e.firstWave,actualFirst:rows.find(r=>r.counts[e.id])?.wave??null,
   encounters:rows.filter(r=>r.counts[e.id]).length,role:e.role}));
const result={roster,bands,first20,rows};writeFileSync(new URL('wave-variety.json',import.meta.url),JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify({roster,bands,first20},null,2));
const descriptions=rows.map(r=>`| ${r.wave} | ${r.count} | ${r.types} | ${Object.entries(r.counts).map(([id,n])=>`${n} ${ENEMIES[id as keyof typeof ENEMIES].name}`).join(', ')} |`);
const total20=Object.values(first20).reduce((s,n)=>s+n,0),common20=first20.Leafbug+first20.Firebug+first20.FlyingLocust;
const bandTable=bands.map(b=>`| ${b.from}–${b.to} | ${b.types} | ${b.meanTypes} | ${b.uniqueTypeSets} |`).join('\n');
writeFileSync(new URL('WAVES_1_50.md',import.meta.url),'# Gegnerbesetzung W1–50\n\nGemessen aus `waveCount`/`waveEnemy`, Regeln 20, einschließlich echter Bossbegleiter.\nKeine Gameplayänderung. Kurzer/langer Wurm sind zwei Definitionen derselben Figur.\n\n'
 +'19 Definitionen: 16 normale Arten, Rosenspiegel und zwei Wurmvarianten; 18 unterschiedliche Figuren/Familien. Bis W50: 18 Definitionen / 17 Figuren. Zunderläufer beginnt erst bei W54. Kosmetische Pilzfarben zählen nicht doppelt.\n\n'
 +`W1–20: ${common20} von ${total20} Gegnern (${(common20/total20*100).toFixed(1)} %) sind Blattkäfer, Feuerkäfer oder Flugheuschrecken. W1–3 bestehen nur aus Blattkäfern. Neue Arten erscheinen anfangs meist mit zwei Exemplaren; das erklärt den stärkeren Wiederholungseindruck trotz neun eingeführter Definitionen bis W20.\n\n`
 +'| Abschnitt | Verschiedene Typen im Abschnitt | Ø Typen pro Welle | Unterschiedliche Artenkombinationen |\n| --- | ---: | ---: | ---: |\n'+bandTable
 +'\n\nKombination = ungeordnete Menge der Arten, ohne Anzahl/HP/Spawnabstände. Solowürmer senken den Durchschnitt ab W31 absichtlich. Diese Kennzahlen messen Besetzung, nicht subjektiven Spaß oder Schwierigkeit.\n\n'
 +'| Welle | Gegner | Typen | Besetzung |\n| --- | ---: | ---: | --- |\n'+descriptions.join('\n')+'\n');
