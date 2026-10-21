// Compact playback-lifecycle regression; no real sound or persistent game save.
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';
import { JSDOM } from 'jsdom';
const dom=new JSDOM('<!doctype html><body></body>',{url:'http://localhost',pretendToBeVisual:true});
for(const key of ['window','document','localStorage','HTMLElement','AbortController']) globalThis[key]=dom.window[key];
let hidden=false;Object.defineProperty(document,'hidden',{get:()=>hidden});
let contexts=0,plays=0,starts=0,requests=0;
const param=()=>({value:0,cancelScheduledValues(){},setValueAtTime(v){this.value=v;},linearRampToValueAtTime(v){this.value=v;}});
const node=()=>({gain:param(),connect(){},disconnect(){}});
class Context {
  state='suspended';currentTime=0;destination={};
  constructor(){contexts++;}
  async resume(){this.state='running';} async close(){this.state='closed';}
  createGain(){return node();}
  createDynamicsCompressor(){return {...node(),threshold:param(),ratio:param()};}
  createMediaElementSource(){return node();}
  async decodeAudioData(){return {duration:1};}
  createBufferSource(){return {...node(),start(){starts++;},stop(){this.onended?.();}};}
}
window.AudioContext=Context;
globalThis.Audio=class {constructor(){const e=document.createElement('audio');let paused=true;
  Object.defineProperty(e,'paused',{get:()=>paused});e.play=async()=>{paused=false;plays++;};e.pause=()=>{paused=true;};e.load=()=>{};return e;}};
globalThis.fetch=async()=>{requests++;return {ok:true,arrayBuffer:async()=>new ArrayBuffer(0)};};
const settle=()=>new Promise(r=>setTimeout(r,25));
const server=await createServer({root:fileURLToPath(new URL('../',import.meta.url)),configFile:false,server:{middlewareMode:true},appType:'custom'});
let audio;
try {
  const {GameAudio}=await server.ssrLoadModule('/src/game-audio.ts');
  audio=new GameAudio();audio.setState(true,true);
  assert.equal(contexts,0);assert.equal(requests,0);assert.equal(plays,0);
  document.dispatchEvent(new dom.window.Event('pointerdown'));await settle();
  assert.equal(contexts,1);assert.equal(requests,17);assert.equal(plays,1);
  const field=document.querySelector('[data-spire-music=field]');assert.equal(field.paused,false);
  audio.setTavern(true);await settle();
  const tavern=document.querySelector('[data-spire-music=tavern]');assert.equal(tavern.paused,false);
  await new Promise(r=>setTimeout(r,850));assert.equal(field.paused,true);
  audio.setMix({muted:true});assert.equal(tavern.paused,true);
  const old=starts;audio.play('alarm');await settle();assert.equal(starts,old);
  audio.setMix({muted:false});await settle();assert.equal(tavern.paused,false);
  audio.setState(true,false);audio.play('shoot1');await settle();assert.equal(starts,old);
  audio.play('alarm');await settle();assert.equal(starts,old+1,'warning/UI can play during manual pause');
  hidden=true;document.dispatchEvent(new dom.window.Event('visibilitychange'));assert.equal(tavern.paused,true);
  hidden=false;audio.setState(false,false);document.dispatchEvent(new dom.window.Event('visibilitychange'));assert.equal(tavern.paused,true,'lost ownership/return dialog stays silent');
  assert.equal(JSON.parse(localStorage.getItem('spire-audio-mix-v1')).muted,false);
  const {IdleBattle}=await server.ssrLoadModule('/src/battle.ts');
  const battle=new IdleBattle();
  audio.setState(true,true);audio.setMix({effects:0,voices:.55});audio.accept([],battle);
  const beforeDance=starts;
  battle.bossCharm.phase='windup';battle.bossCharm.targetUid=1;
  audio.accept([],battle);await settle();
  assert.equal(starts,beforeDance+1,'voices play independently of muted effects');
  battle.bossCharm.phase='channel';audio.accept([],battle);await settle();
  assert.equal(starts,beforeDance+1,'channel does not repeat the windup sound');
  assert.equal([...audio.active].filter(v=>v.speech).length,1);
  battle.bossCharm.phase='idle';audio.accept([],battle);
  assert.equal([...audio.active].filter(v=>v.speech).length,0,'end/interruption stops laugh');
  audio.setMix({voices:0});battle.bossCharm.phase='windup';audio.accept([],battle);await settle();
  assert.equal(starts,beforeDance+1,'voice slider mutes later laughs');
  const {nextVoiceIndex}=await server.ssrLoadModule('/src/mara-voice.ts');
  for(let previous=0;previous<10;previous++)for(const roll of [0,.2,.5,.99])assert.notEqual(nextVoiceIndex(10,previous,()=>roll),previous);
  assert.equal(document.querySelector('[data-spire-voice=mara]'),null,'no Mara clips loaded on map/overview');
  audio.setMix({voices:.55});audio.setState(true,false);audio.setCompanion('mara');
  const voice=document.querySelector('[data-spire-voice=mara]');
  assert.ok(voice.src.includes('flirty_'));assert.equal(voice.paused,true,'selection preloads without autoplay');
  const beforeTouch=plays;audio.touchCompanion('mara');await settle();
  assert.equal(plays,beforeTouch+1,'Mara speaks during an accepted touch even with combat paused');
  audio.touchCompanion('mara');await settle();assert.equal(plays,beforeTouch+1,'rapid touches do not overlap voice');
  const lastLine=voice.src;voice.onended();assert.notEqual(voice.src,lastLine,'next line never repeats directly');
  audio.setCompanion('ilyra');assert.equal(voice.paused,true);assert.equal(voice.getAttribute('src'),null);
  audio.touchCompanion('ilyra');await settle();assert.equal(plays,beforeTouch+1);
  audio.destroy();audio=undefined;assert.equal(document.querySelectorAll('audio').length,0);
  localStorage.removeItem('spire-audio-mix-v1');
  const beforePreview = requests;
  audio = new GameAudio({ combat:false }); audio.setState(true,false);
  document.dispatchEvent(new dom.window.Event('pointerdown')); await settle();
  assert.equal(requests-beforePreview,3,'tavern preview loads only click/craft/gift effects');
  assert.equal(document.querySelector('[data-spire-music=field]'),null,'preview never fetches field music');
  audio.setTavern(true); await settle();
  assert.equal(document.querySelector('[data-spire-music=tavern]').paused,false);
  console.log('PASS: gesture/lazy loading, music crossfade, mute, pause, hidden tab, ownership, storage, boss voice edges/channel/end and cleanup.');
} finally {audio?.destroy();await server.close();dom.window.close();}
