import {readFileSync,writeFileSync,existsSync} from 'node:fs';
const read=p=>JSON.parse(readFileSync(new URL(p,import.meta.url),'utf8'));
const rows=[];
for(const label of ['baseline','selected'])for(const style of ['relaxed','mixed','tactical'])for(const scenario of ['fresh','w30-24h','w35-24h','w44-24h']){
 const file=`${label}/${style}-${scenario}.json`;if(!existsSync(new URL(file,import.meta.url)))continue;
 const r=read(file),worms=r.rows.filter(x=>[36,45].includes(x.wave)&&x.frontier);
 rows.push({label,style,scenario,offline:r.offline??0,highest:r.summary.highest,firstLoss:r.summary.firstLoss,
   spentOnReturn:r.summary.returnSpending?.spent,goldRemaining:r.summary.returnSpending?.remaining,
   encounters:[36,45].map(wave=>{const attempts=worms.filter(x=>x.wave===wave),win=attempts.find(x=>x.result==='clear');return{wave,attempts:attempts.length,defeats:attempts.filter(x=>x.result==='defeat').length,
     firstStart:attempts[0]?.start,firstRemainingHp:attempts[0]?.result==='defeat'?attempts[0]?.wormMinHp:undefined,
     winAt:win?.end,fightSeconds:win?Math.round((win.end-win.start)*1000)/1000:undefined,farthest:win?.farthest};})});
}
writeFileSync(new URL('summary.json',import.meta.url),JSON.stringify(rows,null,2)+'\n');
console.log(JSON.stringify(rows,null,2));
