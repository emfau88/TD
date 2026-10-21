import test from 'node:test';
import assert from 'node:assert/strict';
import { AudioObserver, battleCues, CueLimiter, DEFAULT_MIX, readMix } from '../src/audio-cues';
import { IdleBattle, type Shot } from '../src/battle';

test('four tower roles use launch/actual hit; splash and unrelated events do not duplicate impacts',()=>{
  const shot=(kind:1|2|3|4,uid=kind)=>({kind,uid} as Shot);
  assert.deepEqual(battleCues([
    {type:'fire',shot:shot(1)},{type:'hit',shot:shot(1)},
    {type:'fire',shot:shot(2)},{type:'hit',shot:shot(2)},
    {type:'fire',shot:shot(3)},{type:'hit',shot:shot(3)},{type:'hit',shot:shot(3)},
    {type:'fire',shot:shot(4)},{type:'hit',shot:shot(4)},
    {type:'escape'},{type:'kill'},{type:'wave'},{type:'workshop'},
  ]),['shoot1','hit1','iceLaunch','iceHit','stone','shoot2','hit2','alarm','craft']);
});
test('combat bursts are bounded and core warning has its own cooldown',()=>{
  const limiter=new CueLimiter();
  assert.equal(limiter.allow('shoot1',0,0),true);
  assert.equal(limiter.allow('shoot1',20,1),false);
  assert.equal(limiter.allow('iceHit',30,3),false);
  assert.equal(limiter.allow('alarm',30,3),true);
  assert.equal(limiter.allow('alarm',100,3),false);
  assert.equal(limiter.allow('alarm',1230,3),true);
  limiter.reset();
  for(let i=0;i<8;i++) assert.equal(limiter.allow(i%2?'hit1':'shoot1',i*110,0),true);
  assert.equal(limiter.allow('iceHit',890,0),false);
  assert.equal(limiter.allow('iceHit',1100,0),true);
});
test('saved effects and gift stock are silent; only new spells/received gifts make cues',()=>{
  const b=new IdleBattle(), observer=new AudioObserver();
  b.mara.cooldownRemaining=20;b.mara.effectRemaining=5;b.social.gifts=3;
  assert.deepEqual(observer.update(b,true),[]);
  assert.deepEqual(observer.update(b,true),[]);
  b.mara.cooldownRemaining=0;b.mara.effectRemaining=0;observer.update(b,true);
  b.mara.cooldownRemaining=30;b.mara.effectRemaining=8;
  assert.deepEqual(observer.update(b,true),['mara']);
  b.social.gifts=4;assert.deepEqual(observer.update(b,false),['gift']);
  b.social.gifts=3;assert.deepEqual(observer.update(b,false),[]);
  const restored=new IdleBattle();restored.social.gifts=10;restored.mara.cooldownRemaining=30;restored.mara.effectRemaining=8;
  assert.deepEqual(observer.update(restored,true),[]);
});
test('settings tolerate invalid storage and never exceed safe slider range',()=>{
  assert.deepEqual(readMix(null),DEFAULT_MIX);
  assert.deepEqual(readMix({music:Infinity,effects:-1,voices:2,muted:'false'}),{music:.16,effects:0,voices:1,muted:false});
});

test('tower build and upgrade have distinct cues; settlement keeps craft',()=>{
  assert.deepEqual(battleCues([{type:'build'},{type:'upgrade'},{type:'workshop'}]),['build','upgrade','craft']);
});

test('boss laugh starts once per dance, never on load or windup-to-channel',()=>{
  const b=new IdleBattle(), observer=new AudioObserver();
  observer.update(b,true);
  b.bossCharm.phase='windup';b.bossCharm.targetUid=1;
  assert.deepEqual(observer.update(b,true),['charm']);
  b.bossCharm.phase='channel';
  assert.deepEqual(observer.update(b,true),[]);
  assert.deepEqual(new AudioObserver().update(b,true),[],'loaded dance remains silent');
  b.bossCharm.phase='idle';observer.update(b,true);
  b.bossCharm.phase='windup';
  assert.deepEqual(observer.update(b,true),['charm'],'next dance on same tower sounds again');
  observer.update(b,false);
  assert.deepEqual(observer.update(b,true),[],'resuming does not restart laugh');
});
