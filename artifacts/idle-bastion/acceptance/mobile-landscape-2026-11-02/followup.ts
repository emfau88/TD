import assert from 'node:assert/strict';
import {writeFileSync,mkdirSync} from 'node:fs';
import {chromium} from 'file:///C:/Users/madde/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
import {IdleBattle} from '../../../../experiments/idle-bastion/src/battle';
import {createOfflineState} from '../../../../experiments/idle-bastion/src/offline';
const origin=process.argv[2]??'http://127.0.0.1:5199',out=process.argv[3]??'artifacts/idle-bastion/acceptance/mobile-landscape-2026-11-02/followup';mkdirSync(out,{recursive:true});
const instrument=origin.includes('127.0.0.1');
const b=IdleBattle.newGame();b.beginIntroduction();assert.ok(b.build(b.recommendedStarterPad!));b.startDefense();while(!b.learningPaused)b.update(.025);assert.equal(b.introduction.stage,'upgrade');const battle=b.snapshot();
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'}),results=[];
try{for(const [width,height,lang] of [[720,320,'en'],[844,390,'de'],[932,430,'en'],[390,844,'en'],[1440,900,'en']] as const){
 const touch=width<1000,compact=touch&&width>height,ctx=await browser.newContext({viewport:{width,height},isMobile:touch,hasTouch:touch}),p=await ctx.newPage(),errors:string[]=[];p.on('pageerror',e=>errors.push(e.message));p.on('response',r=>{if(r.status()>=400)errors.push(`${r.status()} ${r.url()}`)});
 await p.addInitScript(lang=>{localStorage.setItem('spire-language-v1',lang);localStorage.setItem('spire-audio-mix-v1',JSON.stringify({muted:true,music:0,effects:0,voices:0}));},lang);
 // Observation only, in the local browser response. No hook is added to game files.
 if(instrument)await p.route('**/assets/main-*.js',async route=>{const response=await route.fetch(),body=await response.text();assert.ok(body.includes('portraitCamera')&&body.includes('create(){'));await route.fulfill({response,body:body.replaceAll('create(){','create(){if(this.cameras?.main&&this.game&&this.sim?.layout)globalThis.__cameraScene=this;')});});
 await p.goto(origin+'/audio-credits.html');const now=Date.now(),off=createOfflineState(now),slot=`landscape-road-${Date.now()}`,name='spire-idle-bastion-probe-'+slot;
 await p.evaluate(async({name,now,off,battle})=>new Promise<void>((resolve,reject)=>{const q=indexedDB.open(name,1);q.onupgradeneeded=()=>q.result.createObjectStore('saves');q.onerror=()=>reject(q.error);q.onsuccess=()=>{const db=q.result,tx=db.transaction('saves','readwrite');tx.objectStore('saves').put({schemaVersion:2,revision:1,writtenAt:now,paused:false,battle,offline:off,maraOfflineWelcomeSeen:true},'default');tx.oncomplete=()=>{db.close();resolve()};tx.onerror=()=>reject(tx.error);};}),{name,now,off,battle});
 await p.goto(origin+'/?probe='+slot);await p.locator('#boot-screen').waitFor({state:'hidden',timeout:60000});if(await p.locator('#claim-offline').isVisible())await p.locator('#claim-offline').click();await p.locator('#tutorial-guide').waitFor();
 async function measure(label:string){
  await p.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
  const data=await p.evaluate(()=>{const guide=document.querySelector('#tutorial-guide')!.getBoundingClientRect(),header=document.querySelector('.app-header')!.getBoundingClientRect(),dock=document.querySelector('.command-dock')!.getBoundingClientRect(),s=(globalThis as any).__cameraScene;
   if(!s)return {guide:{x:guide.x,y:guide.y,w:guide.width,h:guide.height,right:guide.right},header:header.bottom,dock:dock.top};
   const c=s.cameras.main,k=s.pixelDensity,road=s.sim.layout.road.cells.map((cell:any)=>({x:(c.x+((cell.x+.5)*40-c.worldView.x)*c.zoom)/k,y:(c.y+((cell.y+.5)*40-c.worldView.y)*c.zoom)/k}));
   return {guide:{x:guide.x,y:guide.y,w:guide.width,h:guide.height,right:guide.right},header:header.bottom,dock:dock.top,zoom:c.zoom/k,viewport:{y:c.y/k,h:c.height/k},world:{y:c.worldView.y,bottom:c.worldView.bottom,height:c.worldView.height},roadVisible:road.filter((r:any)=>r.x>=0&&r.x<=innerWidth&&r.y>=header.bottom&&r.y<=dock.top&&!(r.x>=guide.left&&r.x<=guide.right&&r.y>=guide.top&&r.y<=guide.bottom)).length,roadTotal:road.length};
  });
  if(compact){assert.ok(data.guide.w<=width*.34);assert.ok(data.guide.right<=width-7);if('viewport' in data){assert.equal(data.viewport.y,48);assert.equal(data.viewport.h,height-112);if(label==='initial')assert.ok(Math.abs(data.zoom-Math.min(width/1120,height/640))<.001);}}
  assert.deepEqual(errors,[]);await p.screenshot({path:`${out}/${width}-${label}.png`});results.push({width,height,lang,label,...data,errors:[...errors]});writeFileSync(out+'/results.json','[\n'+results.map(x=>JSON.stringify(x)).join(',\n')+'\n]\n');console.log(JSON.stringify({width,label,...data}));return data;
 }
 await measure('initial');await p.locator('#guide-toggle').click();await measure('details');await p.locator('#guide-toggle').click();
 if(compact){
  const client=await ctx.newCDPSession(p),x=100,sy=height-85,ey=70;
  for(let n=0;n<4;n++){await client.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y:sy}]});for(let i=1;i<=12;i++)await client.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x,y:sy+(ey-sy)*i/12}]});await client.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});}
  const bottom=await measure('bottom');if('world' in bottom)assert.ok(Math.abs(bottom.world.bottom-640)<.1);
  // During the lesson this button intentionally returns to the starter tower.
  await p.locator('#camera-reset').click();await measure('refocus');
  if(instrument){await p.evaluate(()=>(globalThis as any).__cameraScene.resetCamera());const overview=await measure('overview');if('world' in overview)assert.ok(overview.world.height>=640-.1);}
  await p.locator('#camera-zoom').click();await measure('zoom');
 }
 // The actual learning target remains tappable after the camera geometry change.
 if(compact&&instrument){
  await p.evaluate(()=>{(globalThis as any).__cameraScene.focusGuidedDefense();});
  await p.locator('#lesson-pointer[data-target=upgrade]').waitFor();const point=await p.locator('#lesson-pointer').evaluate(e=>({x:parseFloat((e as HTMLElement).style.left),y:parseFloat((e as HTMLElement).style.top)}));await p.touchscreen.tap(point.x,point.y);await p.locator('#upgrade').click();await p.locator('#context-panel').waitFor({state:'hidden'});await measure('upgraded');
 }
 if(width===720){await p.setViewportSize({width:390,height:844});await p.waitForFunction(()=>getComputedStyle(document.documentElement).getPropertyValue('--compact-landscape').trim()==='');await p.setViewportSize({width,height});await p.waitForFunction(()=>getComputedStyle(document.documentElement).getPropertyValue('--compact-landscape').trim()==='1');await measure('rotated');}
 await ctx.close();
}}finally{await browser.close();}
