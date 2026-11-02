import assert from 'node:assert/strict';
import {mkdirSync,existsSync,readFileSync,writeFileSync} from 'node:fs';
mkdirSync(new URL('./retry-controls/',import.meta.url),{recursive:true});
for(const variant of ['control','B']){
  const {run}=await import(`../waves-26-50-study-2026-11-02/${variant}/simulate.ts`);
  for(const style of ['relaxed','tactical']){
    const fresh=JSON.parse(readFileSync(new URL(`../waves-26-50-study-2026-11-02/${variant}/runs/${style}-fresh60.json`,import.meta.url),'utf8'));
    for(const retry of ['never','immediate']){
      const path=new URL(`./retry-controls/${variant}-${style}-${retry}.json`,import.meta.url);assert.ok(!existsSync(path));
      const result=run(style,{initial:fresh.snapshots.firstPost25Loss,seconds:600,buy:false,retry});
      writeFileSync(path,JSON.stringify(result,null,2)+'\n');
      console.log(JSON.stringify({variant,style,retry,wave:fresh.snapshots.firstPost25Loss.wave,earned:result.summary.earned}));
    }
  }
}
