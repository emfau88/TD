// UI-only acceptance against the built game. Every save belongs to a disposable
// browser context/probe. Fixtures are produced by the real model or prior runs.
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';
import {chromium} from 'file:///C:/Users/madde/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
import {IdleBattle} from '../../../../experiments/idle-bastion/src/battle';
import {createOfflineState} from '../../../../experiments/idle-bastion/src/offline';
const origin=process.argv[2]??'http://127.0.0.1:5199';
const out=process.argv[3]??'artifacts/idle-bastion/acceptance/mobile-landscape-2026-11-02/browser';mkdirSync(out,{recursive:true});
const archive=JSON.parse(gunzipSync(readFileSync('artifacts/glutwerfer-2026-11-02/evidence.json.gz')).toString());
const veteran=archive.candidates.final['mixed-return-control'].final;
const fixtures=JSON.parse(readFileSync('artifacts/idle-bastion/acceptance/tutorial-guide-2026-10-28/fixtures.json','utf8'));
const early=IdleBattle.newGame();early.beginIntroduction();assert.ok(early.build(early.recommendedStarterPad!));early.startDefense();
while(!early.learningPaused)early.update(.025);
assert.ok(early.upgrade(early.towers[0].uid));
const wave1=early.snapshot();
while(!early.learningPaused)early.update(.025);
assert.ok(early.buildWorkshop());const workshop=early.snapshot();
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'}),results:any[]=[];
const controls=['.app-header','.header-actions','.command-dock','#tower-catalog','#pick-mara','#onboarding-card','#tutorial-guide','#context-panel','#tavern-dialog','.tv-stage','.tv-conversation','.tv-action-dock','#game-menu'];
try{for(const [width,height,lang] of [[720,320,'en'],[844,390,'de'],[932,430,'en'],[390,844,'en'],[1440,900,'de']] as const){
 const touch=width<1000,compact=touch&&width>height;
 const ctx=await browser.newContext({viewport:{width,height},isMobile:touch,hasTouch:touch}),p=await ctx.newPage(),errors:string[]=[];
 p.setDefaultTimeout(15000);p.on('pageerror',e=>errors.push(e.message));p.on('response',r=>{if(r.status()>=400)errors.push(`${r.status()} ${r.url()}`)});
 await p.addInitScript(lang=>{localStorage.setItem('spire-language-v1',lang);localStorage.setItem('spire-audio-mix-v1',JSON.stringify({muted:true,music:0,effects:0,voices:0}));},lang);
 async function loaded(){await p.locator('#boot-screen').waitFor({state:'hidden',timeout:60000});}
 async function seed(label:string,battle:any,paused=true,awayMs=0){
  assert.ok(IdleBattle.restore(battle));await p.goto(origin+'/audio-credits.html');
  const now=Date.now()-awayMs,off=createOfflineState(now);off.baseline.paused=paused;
  const slot=`landscape-${width}-${label}-${Date.now()}`,name='spire-idle-bastion-probe-'+slot;
  await p.evaluate(async({name,battle,off,now,paused})=>new Promise<void>((resolve,reject)=>{const q=indexedDB.open(name,1);q.onupgradeneeded=()=>q.result.createObjectStore('saves');q.onerror=()=>reject(q.error);q.onsuccess=()=>{const db=q.result,tx=db.transaction('saves','readwrite');tx.objectStore('saves').put({schemaVersion:2,revision:1,writtenAt:now,paused,battle,offline:off,maraOfflineWelcomeSeen:true},'default');tx.oncomplete=()=>{db.close();resolve()};tx.onerror=()=>reject(tx.error);};}),{name,battle,off,now,paused});
  await p.goto(origin+'/?probe='+slot);await loaded();
  if(!awayMs&&await p.locator('#claim-offline').isVisible())await p.locator('#claim-offline').click();return name;
 }
 async function record(sample:string){
  const data=await p.evaluate(selectors=>({mode:getComputedStyle(document.documentElement).getPropertyValue('--compact-landscape').trim(),width:innerWidth,height:innerHeight,boxes:Object.fromEntries(selectors.map(s=>{const e=document.querySelector(s),r=e?.getBoundingClientRect();return[s,e&&r?{x:r.x,y:r.y,w:r.width,h:r.height,bottom:r.bottom,right:r.right,clientH:e.clientHeight,scrollH:e.scrollHeight,visible:!!e.getClientRects().length&&getComputedStyle(e).visibility!=='hidden'}:null]}))}),controls);
  assert.equal(data.mode,compact?'1':'');assert.deepEqual(errors,[]);
  await p.screenshot({path:`${out}/${width}-${height}-${sample}.png`});results.push({width,height,lang,sample,...data,errors:[...errors]});writeFileSync(out+'/results.json',JSON.stringify(results,null,2));console.log(`${width}x${height} ${lang} ${sample}`);return data;
 }
 async function inside(selector:string,parent?:string){
  const r=await p.locator(selector).boundingBox();assert.ok(r,selector+' visible');
  const bound=parent?await p.locator(parent).boundingBox():{x:0,y:0,width:p.viewportSize()!.width,height:p.viewportSize()!.height};assert.ok(bound);
  assert.ok(r.x>=bound.x-1&&r.y>=bound.y-1&&r.x+r.width<=bound.x+bound.width+1&&r.y+r.height<=bound.y+bound.height+1,`${selector} inside ${parent??'viewport'}: ${JSON.stringify({r,bound})}`);
 }
 // The real three-page introduction; keep its target and controls above the card.
 await p.goto(origin+'/?fresh=1');await loaded();
 for(let step=0;step<3;step++){
  await inside('#onboarding-card');await inside('#onboarding-primary','#onboarding-card');
  if(compact){const r=await p.locator('#onboarding-card').boundingBox();assert.ok(r!.height<height*.55);await inside('#open-menu');}
  await record('intro-'+step);await p.locator('#onboarding-primary').click();
 }
 await p.locator('#pick-archer').click();await record('starter-placement');
 // Use the actual tutorial pointer to tap the recommended map location.
 if(compact){
  await p.locator('#lesson-pointer[data-target=starter]').waitFor();
  const point=await p.locator('#lesson-pointer').evaluate(e=>({x:parseFloat((e as HTMLElement).style.left),y:parseFloat((e as HTMLElement).style.top)}));
  await p.touchscreen.tap(point.x,point.y);await p.locator('#onboarding-primary').waitFor();
  await p.waitForFunction(()=>document.querySelector('#onboarding-primary')?.textContent?.match(/Start|Welle/));await record('starter-built');
 }
 await seed('wave1',wave1);await p.locator('#tutorial-guide').waitFor();
 if(compact){await inside('#tower-catalog','.command-dock');await inside('#pick-mara canvas','#pick-mara');await inside('#pick-mara strong','#pick-mara');await inside('#open-menu');await inside('.life-tile','.app-header');}
 await record('wave1');await p.locator('#guide-toggle').click();await record('guide-details');await p.locator('#guide-toggle').click();
 if(width===720){
  await p.setViewportSize({width:390,height:844});await p.waitForFunction(()=>getComputedStyle(document.documentElement).getPropertyValue('--compact-landscape').trim()==='');await inside('#pick-mara');
  await p.setViewportSize({width,height});await p.waitForFunction(()=>getComputedStyle(document.documentElement).getPropertyValue('--compact-landscape').trim()==='1');await inside('#pick-mara canvas','#pick-mara');await record('rotated-back');
 }
 await seed('research',workshop);await p.locator('#settlement-tab').click();await p.locator('#pick-workshop').click();await inside('#context-panel');
 await p.locator('#research-frost').scrollIntoViewIfNeeded();await inside('#research-frost','#context-panel');await record('tutorial-research');
 await seed('wisp',fixtures['wait-wisp']);await record('wait-wisp');
 const save=await seed('veteran',veteran);
 await p.locator('#catalog-next').isVisible().then(async visible=>{if(visible){await p.locator('#catalog-next').click();await p.waitForFunction(()=>document.querySelector('#tower-catalog')!.scrollLeft>0);}});
 await record('catalog-scrolled');
 await p.locator('#settlement-tab').click();await p.locator('#pick-tavern').click();await p.locator('#tavern-dialog[open]').waitFor();await record('tavern-overview');
 for(const who of ['mara','ilyra']){
  await p.locator(`[data-do=${who}]`).click();await p.locator('.tv-figure canvas').waitFor({state:'visible',timeout:60000});
  if(compact){const stage=await p.locator('.tv-stage').boundingBox();assert.ok(stage!.height>=160);await inside('.tv-action-dock','#tavern-dialog');await inside('.tv-conversation','#tavern-dialog');}
  await record('tavern-'+who);
  if(compact){
   await p.locator('[data-do=speak]').click();await inside('.tv-gestures','#tavern-dialog');await record(who+'-talk-menu');
   // Earn the first heart through the actual two conversations, never edit points.
   await p.locator('[data-action=talk]').click();await p.locator('[data-do=speak]').click();await p.locator('[data-action=talk]').click();
   await p.waitForFunction(()=>!(document.querySelector('[data-moment="1"]') as HTMLButtonElement).disabled);await record(who+'-new-moment');
   await p.locator('[data-moment="1"]').click();await p.waitForFunction(()=>document.querySelector('#tavern-dialog')?.getAttribute('data-story')==='true');await record(who+'-story');await p.locator('[data-do=story-next]').click();await p.locator('[data-do=story-exit]').click();
   await p.locator('[data-do=touch]').click();await record(who+'-touch');
  }
  await p.locator('.tv-back').click();
 }
 await p.locator('.tv-close').click();await p.locator('#pick-workshop').click();await p.locator('#tech-ember').click();await record('workshop');await p.locator('#close-context').click();
 await p.locator('#open-menu').click();await inside('#game-menu');await p.locator('#show-hints').scrollIntoViewIfNeeded();await inside('#show-hints','#game-menu');await record('menu-scrolled');await p.locator('#close-menu').click();
 await p.locator('#gold-summary').click();await inside('#chronicle');await record('chronicle');await p.locator('#close-progress').click();
 await p.reload();await loaded();if(await p.locator('#claim-offline').isVisible())await p.locator('#claim-offline').click();assert.equal(await p.locator('#pause').getAttribute('aria-pressed'),'true');await record('reload');
 if(compact){
  await seed('return',veteran,true,24*60*60*1000);await p.locator('#claim-offline').waitFor();await inside('.return-dialog');await inside('#claim-offline','.return-dialog');await record('return');await p.locator('#claim-offline').click();
 }
 await ctx.close();
}}finally{await browser.close();}
