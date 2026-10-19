import test from 'node:test';
import assert from 'node:assert/strict';
import {IdleBattle} from '../src/battle';
import {nextPurchase,purchase} from './helpers/balance-run';

test('actual Frost hit preserves the earned boss dance through reload; selling its target still ends it',()=>{
 const b=new IdleBattle();let charm:ReturnType<IdleBattle['snapshot']>|undefined;
 for(let frame=0;frame<24000&&!charm;frame++){
  if(frame%40===0){const a=nextPurchase(b);if(a)purchase(b,a);}
  b.update(.025);b.drainEvents();if(b.bossCharm.phase==='channel')charm=b.snapshot();
 }
 assert.ok(charm,'Current earned purchases must reach an actual boss channel');
 const casting=IdleBattle.restore(charm)!;assert.ok(casting);
 const boss=casting.bossEnemy!, target=casting.bossCharm.targetUid, remaining=casting.bossCharm.remaining;
 const frost=casting.towers.find(t=>t.def.id===2);assert.ok(frost);
 // Isolate the hit without killing the boss; all positions/health/purchases are earned.
 (casting as any).hit({kind:2,damage:0,towerUid:frost.uid},boss);
 assert.ok(boss.slowRemaining>0);assert.equal(casting.bossCharm.phase,'channel');assert.equal(casting.bossCharm.targetUid,target);assert.equal(casting.bossCharm.remaining,remaining);
 const restored=IdleBattle.restore(casting.snapshot())!;assert.ok(restored);assert.deepEqual(restored.snapshot(),casting.snapshot());
 casting.update(.25);restored.update(.25);assert.equal(casting.bossCharm.phase,'channel');assert.deepEqual(restored.snapshot(),casting.snapshot());
 if(!casting.towers.find(t=>t.uid===target)!.protected){assert.equal(casting.sell(target!),true);assert.equal(casting.bossCharm.targetUid,null);}
});

test('fresh guided opening reaches Wisp without early Mara casts or leaks',()=>{
 const b=IdleBattle.newGame();b.beginIntroduction();b.build('tower-start');b.startDefense();
 for(let frame=0;frame<16000&&!b.wispUnlocked;frame++){
  b.update(.025);assert.equal(b.mara.effectRemaining,0);assert.equal(b.lives,20);
  if(!b.guiding)continue;
  if(b.learningPaused){switch(b.introduction.stage){
   case 'upgrade':b.upgrade(1);break;case 'workshop':b.buildWorkshop();break;
   case 'research':b.researchFrost();break;case 'frost':b.build(b.recommendedFrostPad!,2);break;
  }if(b.lessonComplete)b.continueLesson();}
 }
 assert.equal(b.wispUnlocked,true);assert.equal(b.discoveryPaused,true);assert.equal(b.highestCleared,5);
 assert.equal(b.meetWisp(),true);assert.equal(b.discovery,'mara-wait');b.update(10);assert.equal(b.mara.effectRemaining,0);
});
