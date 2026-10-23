import fs from 'node:fs';import vm from 'node:vm';import assert from 'node:assert/strict';
const root=new URL('./preview/',import.meta.url),html=fs.readFileSync(new URL('index.html',root),'utf8'),manifest=JSON.parse(fs.readFileSync(new URL('manifest.json',root),'utf8'));
const elements=new Map();function el(id){if(!elements.has(id))elements.set(id,{value:id==='#pose'?'left':'',textContent:'',disabled:true,classList:{toggle:()=>true},getContext:()=>({clearRect(){},drawImage(){}})});return elements.get(id)}
let now=0,raf;const loaded=[];
class Image {set src(v){loaded.push(v);assert(fs.existsSync(new URL(v,root)),v);queueMicrotask(()=>this.onload());}}
const context=vm.createContext({document:{querySelector:el,addEventListener(){}},Image,fetch:async()=>({json:async()=>manifest}),performance:{now:()=>now},requestAnimationFrame:f=>{raf=f},console});
vm.runInContext(html.match(/<script>([\s\S]*?)<\/script>/)[1],context);
const flush=async()=>{for(let i=0;i<15;i++)await Promise.resolve()};await flush();const state=()=>JSON.parse(vm.runInContext('JSON.stringify({clip,frame,playing,cacheSize:cache.size})',context));const report={initial:state(),initialLoads:loaded.slice(),clips:[]};assert.equal(report.initial.clip,'left');assert(loaded.length<=3);
for(const name of ['left','right','both']){el('#pose').value=name;await el('#pose').onchange();await flush();assert.equal(state().clip,name);now+=4900;raf(now);await flush();assert.equal(state().clip,name);now+=100;raf(now);await flush();assert.equal(state().clip,'idle');assert.equal(state().frame,0);report.clips.push({name,return:state()});}
el('#pose').value='both';await el('#pose').onchange();await flush();el('#frame').oninput({target:{value:'60'}});await flush();assert.equal(state().playing,false);assert.equal(state().frame,60);el('#rest').onclick();await flush();assert.equal(state().frame,0);assert.equal(state().playing,false);report.scrubAndRest=true;report.maxCached=state().cacheSize;assert(report.maxCached<=4);
fs.writeFileSync(new URL('preview-script-checks.json',root),JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
