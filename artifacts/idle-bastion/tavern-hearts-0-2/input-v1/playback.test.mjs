import {test} from 'node:test';
import assert from 'node:assert/strict';
import {Playback} from './playback.js';
const clips={idle:{fps:30,count:90,restFrames:[0,1,88,89],minHeart:0},head:{fps:30,count:30,minHeart:0},touch:{fps:30,count:60,minHeart:0},variant:{fps:30,count:60,minHeart:2},giggle:{fps:30,count:60,minHeart:2}};
const available=()=>true;
test('A request waits for a neutral pose, carries its text, then returns to idle',()=>{
 const p=new Playback(clips,2);p.frame=40;
 assert.equal(p.request('head','hello'),true);
 p.step(1/30,available);assert.equal(p.key,'idle');assert.equal(p.frame,41);
 while(p.frame<88)p.step(1/30,available);
 p.step(1/30,available);assert.equal(p.key,'head');assert.equal(p.started.payload,'hello');
 for(let n=0;n<30;n++)p.step(1/30,available);
 assert.equal(p.key,'idle');assert.equal(p.frame,0);
});
test('Only one request; running reactions cannot be interrupted by another gesture',()=>{
 const p=new Playback(clips);assert.ok(p.request('head'));assert.equal(p.request('touch'),false);
 p.step(0,available);assert.equal(p.request('touch'),false);
});
test('Cold pages hold the pose instead of skipping frames; loaded pages resume',()=>{
 const p=new Playback(clips);p.request('head');p.step(.1,()=>false);
 assert.equal(p.key,'idle');assert.equal(p.frame,0);assert.ok(p.pending);
 p.step(.01,available);assert.equal(p.key,'head');
 p.step(.05,()=>false);assert.equal(p.frame,0);
 p.step(1/30,available);assert.equal(p.frame,1);
});
test('Extra gestures are gated at two hearts and absent from automatic early idle',()=>{
 for(const heart of [0,1]){const p=new Playback(clips,heart);assert.equal(p.request('giggle'),false);assert.equal(p.request('variant'),false);
 for(let n=0;n<1000;n++){p.step(1/30,available);assert.equal(p.key,'idle');}}
});
test('The extra idle occurs only after three complete ordinary loops',()=>{
 const p=new Playback(clips,2);
 for(let n=0;n<270;n++){p.step(1/30,available);assert.equal(p.key,'idle');}
 assert.equal(p.pending.key,'variant');p.step(1/30,available);assert.equal(p.key,'variant');
 for(let n=0;n<60;n++)p.step(1/30,available);
 assert.equal(p.key,'idle');assert.equal(p.loops,0);
});
test('A user request takes priority over the automatic extra idle',()=>{
 const p=new Playback(clips,2);p.loops=2;p.frame=89;p.request('head');p.step(0,available);assert.equal(p.key,'head');
});
