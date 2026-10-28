// Complete fresh-game model flow; browser input and visual approval are separate.
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';
const server=await createServer({root:fileURLToPath(new URL('../',import.meta.url)),configFile:false,server:{middlewareMode:true},appType:'custom'});
try {
  const { IdleBattle }=await server.ssrLoadModule('/src/battle.ts');
  const { tutorialProgress }=await server.ssrLoadModule('/src/tutorial-progress.ts');
  let b=IdleBattle.newGame();const seen=[], transitions=[];
  const record=()=>{const step=tutorialProgress(b)?.current;if(step&&!seen.includes(step))seen.push(step);};
  const reload=()=>{const snapshot=b.snapshot();const restored=IdleBattle.restore(snapshot);assert.ok(restored);assert.deepEqual(restored.snapshot(),snapshot);b=restored;};
  for(const step of [0,1,2]){assert.equal(tutorialProgress(b,{active:true,step}).current,step+1);seen.push(step+1);}
  assert.ok(b.beginIntroduction());record();assert.ok(b.build(b.recommendedStarterPad));record();assert.ok(b.startDefense());
  let frostGold;
  for(let i=0;i<40000&&tutorialProgress(b);i++) {
    b.update(.025);record();const state=b.introduction.stage+'/'+b.discovery;
    if(transitions.at(-1)?.state!==state){reload();transitions.push({state,step:tutorialProgress(b)?.current,gold:b.gold,wave:b.wave});}
    if(b.learningPaused&&!b.lessonComplete){
      if(b.introduction.stage==='upgrade')assert.ok(b.upgrade(b.towers[0].uid));
      else if(b.introduction.stage==='workshop'){const gold=b.gold;assert.ok(b.buildWorkshop());assert.equal(b.gold,gold);}
      else if(b.introduction.stage==='research')assert.ok(b.researchFrost());
      else if(b.introduction.stage==='frost'){frostGold=b.gold;const frost=b.build(b.recommendedFrostPad,2);assert.ok(frost);assert.equal(frost.spent,0);assert.equal(b.gold,frostGold);assert.equal(b.frostKitAvailable,false);reload();}
    }
    if(b.learningPaused&&b.lessonComplete)assert.ok(b.continueLesson());
    if(b.discovery==='wisp'&&b.discoveryPaused)assert.ok(b.meetWisp());
    else if(b.discovery==='mara-wait')assert.ok(b.continueDiscovery());
    else if(b.discovery==='mara-controls')assert.ok(b.continueDiscovery());
    else if(b.discovery==='cannon'||b.discovery==='warehouse')assert.ok(b.dismissDiscovery());
  }
  assert.equal(tutorialProgress(b),undefined);assert.deepEqual(seen,[1,2,3,4,5,6,7,8,9,10,11,12,13,14]);
  assert.equal(frostGold,25);assert.equal(b.towers.filter(t=>t.def.id===2).length,1);assert.equal(b.introduction.stage,'done');assert.equal(b.discovery,'done');reload();
  console.log(JSON.stringify({passed:true,steps:seen,freeFrostGold:frostGold,transitions,final:{wave:b.wave,lives:b.lives,gold:b.gold}},null,2));
}finally{await server.close();}
