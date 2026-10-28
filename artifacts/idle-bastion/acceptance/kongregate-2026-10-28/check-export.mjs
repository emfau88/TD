import {chromium} from 'file:///C:/Users/madde/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {createFeatureProbe} from '../../../../experiments/idle-bastion/src/feature-probes.ts';
import {createOfflineState} from '../../../../experiments/idle-bastion/src/offline.ts';
const out='artifacts/idle-bastion/acceptance/kongregate-2026-10-28';
const bundle='qa/kongregate-2026-10-28/bundle',game='http://127.0.0.1:5256/games/towers/';
const previous=process.env.MEDIA_ONLY?JSON.parse(await readFile(out+'/browser-results.json','utf8')):{results:[]};
const results=previous.results.filter(r=>r.embedded), failures=[], external=[];
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,args:['--autoplay-policy=document-user-activation-required']});
function watch(p){p.on('pageerror',e=>failures.push(e.message));p.on('response',r=>{if(r.status()>=400)failures.push(r.status()+' '+r.url());});p.on('request',r=>{if(/^https?:/.test(r.url())&&!/^http:\/\/(localhost|127\.0\.0\.1):5256\//.test(r.url()))external.push(r.url());});}
async function ready(f){await f.locator('#boot-screen').waitFor({state:'hidden',timeout:60000});if(await f.locator('#claim-offline').isVisible())await f.locator('#claim-offline').click();}
async function pointer(p,f,target){
 if(await f.locator('#lesson-pointer').getAttribute('data-target')==='camera-reset')await f.locator('#camera-reset').click();
 const point=f.locator('#lesson-pointer[data-target="'+target+'"]');await point.waitFor({state:'visible'});
 const pt=await point.evaluate(e=>({x:parseFloat(e.style.left),y:parseFloat(e.style.top)}));
 if(p.viewportSize().width<700)await p.touchscreen.tap(pt.x,pt.y);else await p.mouse.click(pt.x,pt.y);
}
try{
 if(!process.env.MEDIA_ONLY)for(const [width,height,lang] of [[1000,650,'en'],[390,844,'de']]){
  const p=await browser.newPage({viewport:{width,height},isMobile:width<700,hasTouch:width<700});watch(p);
  await p.addInitScript(lang=>localStorage.setItem('spire-language-v1',lang),lang);
  await p.goto('http://localhost:5256/embed.html');
  await p.frameLocator('iframe').locator('#onboarding-primary').waitFor({state:'visible',timeout:60000});
  const f=p.frames().find(f=>f.url().startsWith(game));assert.ok(f);await ready(f);
  assert.equal(await f.evaluate(()=>document.querySelector('audio[data-spire-music]').readyState),4);
  for(let i=0;i<3;i++)await f.locator('#onboarding-primary')[width<700?'tap':'click']();
  await f.waitForFunction(()=>document.getElementById('app').dataset.intro==='build');
  await f.waitForFunction(()=>document.querySelector('audio[data-spire-music]').currentTime>.05);
  await f.locator('#pick-archer')[width<700?'tap':'click']();await pointer(p,f,'starter');
  await f.waitForFunction(()=>document.getElementById('app').dataset.intro==='ready');
  await f.locator('#onboarding-primary').click();await f.waitForFunction(()=>document.getElementById('app').dataset.intro==='upgrade',null,{timeout:30000});
  await pointer(p,f,'upgrade');await f.locator('#upgrade')[width<700?'tap':'click']();
  await f.waitForFunction(()=>document.getElementById('app').dataset.intro==='workshop');
  await f.locator('#pause').click();await f.waitForFunction(()=>document.getElementById('pause').getAttribute('aria-pressed')==='true');
  await f.locator('#open-menu').click();
  for(const kind of ['audio','enemies']){
   await f.locator('[data-credits="'+kind+'"]').click();const dialog=f.locator('#credits-dialog');
   await dialog.waitFor({state:'visible'});assert.equal(await dialog.locator('a[href]').count(),0);
   await dialog.locator('summary').click();const notices=await dialog.locator('pre').innerText();
   assert.ok(notices.includes('creativecommons.org/licenses/by/4.0/')&&notices.includes('MaskedIntrovert')&&notices.includes('Permission is hereby granted'));
   const box=await dialog.evaluate(e=>({scroll:e.scrollWidth,width:e.clientWidth}));assert.ok(box.scroll<=box.width+1);
   if(kind==='audio')await p.screenshot({path:out+'/credits-'+width+'.png'});
   await dialog.locator('header button').click();
  }
  await f.locator('#close-menu').click();await p.reload();
  await p.frameLocator('iframe').locator('#app').waitFor({state:'visible'});const again=p.frames().find(f=>f.url().startsWith(game));await ready(again);
  assert.equal(await again.locator('#app').getAttribute('data-intro'),'workshop');
  assert.equal(await again.locator('#pause').getAttribute('aria-pressed'),'true');
  await again.locator('#pause').click();await again.waitForFunction(()=>document.getElementById('pause').getAttribute('aria-pressed')==='false');
  await p.screenshot({path:out+'/iframe-'+width+'.png'});
  results.push({width,height,lang,embedded:true,musicReady:true,musicStarted:true,buildUpgrade:true,creditsNoLinks:true,licenseText:true,reload:true});
  await writeFile(out+'/browser-results.json',JSON.stringify({results,failures,external},null,2)+'\n');
  console.log('iframe passed '+width);await p.close();
 }
 // Prepared state uses the same earned defense and real purchases as existing review tools.
 const earned=JSON.parse(await readFile('artifacts/idle-bastion/acceptance/wave-rework-v2/earned-balanced-late.json','utf8'));
 const b=createFeatureProbe('heroes',earned),now=Date.now(),raw={schemaVersion:2,revision:1,writtenAt:now,paused:false,battle:b.snapshot(),offline:createOfflineState(now)};
 const p=await browser.newPage({viewport:{width:1280,height:800}});watch(p);
 await p.addInitScript(()=>{localStorage.setItem('spire-language-v1','en');localStorage.setItem('spire-audio-mix-v1',JSON.stringify({muted:true,music:.16,effects:.55,voices:.55}));});
 await p.goto(game+'LICENSES.txt');
 const slot=await p.evaluate(async raw=>{const slot='submission-'+crypto.randomUUID();await new Promise((res,rej)=>{const r=indexedDB.open('spire-idle-bastion-probe-'+slot,1);r.onupgradeneeded=()=>r.result.createObjectStore('saves');r.onerror=()=>rej(r.error);r.onsuccess=()=>{const db=r.result,tx=db.transaction('saves','readwrite');tx.objectStore('saves').put(raw,'default');tx.oncomplete=()=>{db.close();res();};};});return slot;},raw);
 await p.goto(game+'?probe='+slot);await ready(p);
 const hide=p.getByRole('button',{name:'Hide tips',exact:true});if(await hide.isVisible())await hide.click();
 await p.locator('#camera-reset').click();await p.waitForTimeout(1800);
 if(await hide.isVisible())await hide.click();
 await p.screenshot({path:bundle+'/02-media/01-defense.png'});
 await p.locator('#pause').click();await p.waitForFunction(()=>document.getElementById('pause').getAttribute('aria-pressed')==='true');
 await p.screenshot({path:out+'/map-for-selection.png'});
 await p.mouse.click(176,340);await p.locator('#context-panel').waitFor({state:'visible'});
 await p.screenshot({path:bundle+'/02-media/02-tower-upgrades.png'});await p.locator('#close-context').click();
 await p.locator('#settlement-tab').click();await p.locator('#pick-tavern').click();await p.locator('.tv-overview').waitFor({state:'visible'});

 for(const who of ['mara','ilyra']){
  await p.locator('[data-do="'+who+'"]').click();await p.locator('.tv-character').waitFor({state:'visible'});
  await p.locator('.tv-load-status').waitFor({state:'hidden',timeout:45000});
  for(let i=0;i<3;i++){await p.locator('[data-action="talk"]').click();await p.waitForTimeout(650);}
  await p.locator('[data-action="gift"]').click();await p.waitForFunction(()=>document.querySelector('.tv-bond-copy').textContent.includes('2 hearts'));
  await p.locator('.tv-load-status').waitFor({state:'hidden',timeout:45000});await p.waitForTimeout(700);
  await p.screenshot({path:bundle+'/02-media/'+(who==='mara'?'03-mara':'04-ilyra')+'.png'});
  await p.locator('[data-do="back"]').click();
 }
 results.push({screenshots:4,source:'Earned wave-40 defense plus real tavern upgrades and recruitment; unmodified game rendering'});
 await p.setViewportSize({width:1000,height:800});await p.goto('http://127.0.0.1:5256/icon.html');
 await p.evaluate(()=>document.fonts.ready);await p.locator('img').evaluate(img=>img.decode());await p.screenshot({path:bundle+'/02-media/game-icon.png'});
 assert.deepEqual(external,[]);assert.deepEqual(failures,[]);
 await writeFile(out+'/browser-results.json',JSON.stringify({results,failures,external},null,2)+'\n');
 console.log('screenshots, icon and external request check passed');await p.close();
}finally{await browser.close();}
