import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Playback} from './playback.js';
const {heroes}=JSON.parse(readFileSync(new URL('./manifest.json',import.meta.url)));
const ready=()=>true;
for(const [hero,clips] of Object.entries(heroes)){
 test(`${hero}: every idle phase reaches reaction in <= 300 ms through neutral`,()=>{
  for(let frame=0;frame<clips.idle.count;frame++){
   const p=new Playback(clips,2);p.frame=frame;p.request('touch',{line:'touch'});
   let time=0,last=frame;
   while(!p.started&&time<1){last=p.frame;p.step(1/60,ready);time+=1/60;}
   assert.equal(p.key,'touch',`phase ${frame}`);assert.ok(time<=.301,`${frame}: ${time}`);
   assert.ok(clips.idle.restFrames.includes(last));assert.equal(p.started.payload.line,'touch');
  }
 });
 test(`${hero}: active reaction accepts one replaceable follow-up, including same clip`,()=>{
  const p=new Playback(clips,2);p.request('touch',{line:'first'});p.step(0,ready);
  assert.ok(p.request('head',{line:'discard'}));assert.ok(p.request('touch',{line:'latest'}));
  assert.equal(p.key,'touch');p.frame=clips.touch.count-1;p.step(1/30,ready);
  assert.equal(p.key,'touch');assert.equal(p.started.payload.line,'latest');assert.equal(p.frame,0);assert.equal(p.pending,null);
 });
 test(`${hero}: replacing action during neutral return does not restart the return`,()=>{
  const p=new Playback(clips,2);p.frame=70;p.request('head');p.step(1/30,ready);
  const frames=[...p.returnFrames];p.request('touch');assert.deepEqual(p.returnFrames,frames);
 });
 test(`${hero}: slow assets hold current pose, recover and cancellation removes queue`,()=>{
  const p=new Playback(clips,2);p.frame=70;p.request('head');p.step(.1,()=>false);
  assert.equal(p.frame,70);assert.ok(p.waiting);p.request('touch');
  for(let i=0;i<20&&!p.started;i++)p.step(1/30,ready);
  assert.equal(p.key,'touch');p.request('head');p.cancel();assert.equal(p.pending,null);
  p.frame=clips.touch.count-1;p.step(1/30,ready);assert.equal(p.key,'idle');
 });
 test(`${hero}: gates, automatic idle frequency and user priority remain intact`,()=>{
  for(const heart of [0,1]){
   const p=new Playback(clips,heart);assert.equal(p.request('giggle'),false);assert.equal(p.request('variant'),false);
   for(let i=0;i<clips.idle.count*4;i++){p.step(1/30,ready);assert.equal(p.key,'idle');}
  }
  const p=new Playback(clips,2);
  for(let i=0;i<clips.idle.count*3;i++)p.step(1/30,ready);
  assert.equal(p.pending.key,'variant');p.request('head');p.step(0,ready);assert.equal(p.key,'head');
 });
 test(`${hero}: new selection state contains no previous queued action`,()=>{
  const old=new Playback(clips,2);old.request('giggle');
  const p=new Playback(clips,0);assert.equal(p.pending,null);assert.equal(p.key,'idle');
 });
}
