// Scope: local comparison fixture, frame boundaries, lazy reactions, tab pause.
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { JSDOM } from 'jsdom';
import { createServer } from 'vite';
const root=fileURLToPath(new URL('../',import.meta.url));
const dom=new JSDOM(await readFile(new URL('../idle-review.html',import.meta.url),'utf8'),{url:'http://localhost/idle-review.html'});
for(const key of ['window','document','location','HTMLElement','HTMLCanvasElement'])globalThis[key]=dom.window[key];
const requests=[];let tick,clock=1000,hold=false;const held=[];
globalThis.Image=class {set src(value){requests.push(value);const resolve=()=>this.onload?.();if(hold&&/shoulder/.test(value))held.push(resolve);else queueMicrotask(resolve);}};
globalThis.requestAnimationFrame=fn=>(tick=fn,1);globalThis.cancelAnimationFrame=()=>{};
const paints=new Map();
dom.window.HTMLCanvasElement.prototype.getContext=function(){const canvas=this;return {clearRect(){paints.set(canvas.id,(paints.get(canvas.id)??0)+1);},drawImage(){},imageSmoothingEnabled:false};};
Object.defineProperty(document,'hidden',{value:false,configurable:true});
Object.defineProperty(dom.window,'localStorage',{get(){throw new Error('No save access allowed');}});
const settle=()=>new Promise(resolve=>setImmediate(resolve));
const click=selector=>document.querySelector(selector).click();
const value=(id,next)=>{const el=document.getElementById(id);el.value=next;el.dispatchEvent(new dom.window.Event('change'));};
const advance=ms=>{for(let t=0;t<ms;t+=20){clock+=20;tick(clock);}};
const frame=()=>document.getElementById('after').dataset.frame;
const server=await createServer({root,configFile:false,server:{middlewareMode:true},appType:'custom'});
try{
 const {frameAt,total}=await server.ssrLoadModule('/src/idle-review.ts');await settle();tick(clock);
 assert.equal(requests.length,2);assert.ok(requests.every(url=>url.includes('mara')));
 assert.equal(frame(),'mara:idle:0');
 const {idle:clip}=JSON.parse(await readFile(new URL('../assets/mara-tavern/idle-study/candidate.json',import.meta.url),'utf8'));
 assert.equal(total(clip),4640);
 // Actual delivered timeline: every boundary and repeated loop seam.
 let boundary=0;
 for(let i=0;i<clip.length;i++){
  assert.equal(frameAt(clip,boundary),clip[i][0]);
  assert.equal(frameAt(clip,boundary+clip[i][1]-1),clip[i][0]);
  boundary+=clip[i][1];
 }
 for(const t of [4639,4640,4641,9279,9280,9281])assert.equal(frameAt(clip,t),0);
 advance(800);assert.equal(frame(),'mara:idle:1');
 click('#pause');const frozen=frame();advance(2000);assert.equal(frame(),frozen);click('#pause');tick(clock);
 Object.defineProperty(document,'hidden',{value:true,configurable:true});advance(2000);assert.equal(frame(),frozen);
 Object.defineProperty(document,'hidden',{value:false,configurable:true});tick(clock);
 click('#restart');assert.equal(frame(),'mara:idle:0');
 click('#seam-preview');tick(clock);const seamPaints=paints.get('after');advance(500);
 assert.equal(frame(),'mara:idle:0');assert.equal(paints.get('after'),seamPaints,'No repaint/blank frame across the loop seam');
 click('#blink-preview');tick(clock);advance(380);assert.equal(frame(),'mara:idle:5');
 advance(160);assert.equal(frame(),'mara:idle:0');
 click('#frames');assert.equal(document.querySelectorAll('#filmstrip canvas').length,6);click('#frames');
 for(const kind of ['shoulder','hand','hair']){
  value('reaction',kind);click('#touch');await settle();tick(clock);
  assert.ok(frame().includes(kind));assert.equal(document.getElementById('touch').disabled,true);
  const count=requests.length;click('#touch');assert.equal(requests.length,count);
  advance(4000);assert.ok(frame().includes('idle'));assert.equal(document.getElementById('touch').disabled,false);
 }
 assert.equal(requests.filter(url=>url.includes('mara-shoulder')).length,1);
 assert.equal(requests.filter(url=>url.includes('mara-reactions')).length,1);
 click('[data-hero="ilyra"]');await settle();tick(clock);
 assert.equal(frame(),'ilyra:idle:0');assert.ok(!requests.some(url=>url.includes('ilyra-shoulder')));
 hold=true;value('reaction','shoulder');click('#touch');await settle();assert.equal(held.length,1);
 click('[data-hero="mara"]');await settle();held.shift()();await settle();assert.equal(frame(),'mara:idle:0');
 hold=false;click('[data-hero="ilyra"]');await settle();tick(clock);
 for(const kind of ['shoulder','hand','hair']){
  value('reaction',kind);click('#touch');await settle();tick(clock);assert.ok(frame().includes(kind));
  advance(4000);assert.ok(frame().includes('idle'));
 }
 click('#frames');assert.equal(document.querySelectorAll('#filmstrip canvas').length,5);
 console.log('PASS: actual frame boundaries, repeated 4.64s seam without repaint, isolated blink, pause/hidden tab, lazy images, six unchanged reactions and return, stale load ignored, no save access, six Mara/five Ilyra drawings.');
}finally{await server.close();dom.window.close();}
