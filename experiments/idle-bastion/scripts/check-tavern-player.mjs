// Deterministic player/cache integration without browser state or real downloads.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';
import { JSDOM } from 'jsdom';
const root=fileURLToPath(new URL('../',import.meta.url));
const dom=new JSDOM('<!doctype html><canvas></canvas>',{url:'http://localhost/',pretendToBeVisual:true});
for(const key of ['window','document','location','HTMLElement','HTMLCanvasElement'])globalThis[key]=dom.window[key];
const paint={clearRect(){},drawImage(){},save(){},restore(){},globalAlpha:1};
dom.window.HTMLCanvasElement.prototype.getContext=()=>paint;
const callbacks=new Map();let sequence=0,now=1000,maxPages=0;
globalThis.requestAnimationFrame=callback=>{callbacks.set(++sequence,callback);return sequence;};
globalThis.cancelAnimationFrame=id=>callbacks.delete(id);
const realFetch=globalThis.fetch,realImage=globalThis.Image;
const manifest=JSON.parse(readFileSync(new URL('../assets/tavern-rig/manifest.json',import.meta.url),'utf8'));
globalThis.fetch=async()=>({ok:true,json:async()=>manifest});
let holdHeadTail=false,failHip=false;const held=[];
globalThis.Image=class {
  onload=null;onerror=null;url='';width=1920;height=1400;
  set src(url){this.url=url;if(holdHeadTail&&/head\/0[23]\.webp/.test(url)){held.push(this);return;}queueMicrotask(()=>failHip&&/hip\//.test(url)?this.onerror?.():this.onload?.());}
  removeAttribute(){this.url='';}async decode(){}
};
const settle=()=>new Promise(resolve=>setImmediate(resolve));
const server=await createServer({root,configFile:false,server:{middlewareMode:true},appType:'custom'});
const canvas=document.querySelector('canvas');let player;
async function frames(count){for(let i=0;i<count;i++){now+=34;const batch=[...callbacks.values()];callbacks.clear();for(const callback of batch)callback(now);await settle();maxPages=Math.max(maxPages,Number(canvas.dataset.cachedPages)||0);assert.ok(maxPages<=14);}}
try{
 const {RigPreviewPlayer}=await server.ssrLoadModule('/src/tavern-rig-preview.ts');
 player=new RigPreviewPlayer(canvas,()=>{});player.setHearts(3);
 holdHeadTail=true;await player.start('mara');await settle();player.act('talk');await settle();await frames(12);
 assert.equal(canvas.dataset.clip,'head','a reaction starts from its first two pages while later pages are still loading');
 assert.equal(player.loadingReactions,false,'pose transition is not a network-loading state');
 const drawn=canvas.dataset.frame;assert.ok(Number(drawn)>=0);await frames(25);assert.ok(Number(canvas.dataset.frame)<=15,'never draw an undecoded page');assert.equal(canvas.dataset.error,undefined);
 holdHeadTail=false;for(const image of held.splice(0))image.onload?.();await settle();await frames(10);assert.ok(Number(canvas.dataset.frame)>15,'rolling buffer continues when pages arrive');
 player.play('shoulder');player.play('hair');player.play('hand');await settle();await frames(12);assert.equal(canvas.dataset.clip,'giggle','latest tap wins');
 player.stop();assert.equal(callbacks.size,0);assert.equal(canvas.dataset.clip,undefined);
 player.setHearts(0);await player.start('ilyra');await settle();failHip=true;player.setHearts(3);player.gesture('hip');await new Promise(resolve=>setTimeout(resolve,300));await frames(3);
 assert.equal(canvas.dataset.reactionError,'true');assert.equal(player.loadingReactions,false);assert.equal(player.ready,true);
 failHip=false;player.gesture('hip');await settle();await frames(12);assert.equal(canvas.dataset.reactionError,undefined);assert.equal(canvas.dataset.clip,'hip');
 for(const region of ['shoulder','hair','hand','shoulder','hair','hand']){player.play(region);await settle();await frames(12);}
 assert.ok(maxPages<=14);player.stop();assert.equal(callbacks.size,0);
 console.log('PASS: two-page startup, retained pose on missing tail, recovery, latest intent, failure/retry, two companions, maximum '+maxPages+' cached pages (limit 14).');
}finally{player?.stop();await server.close();dom.window.close();globalThis.fetch=realFetch;globalThis.Image=realImage;}
