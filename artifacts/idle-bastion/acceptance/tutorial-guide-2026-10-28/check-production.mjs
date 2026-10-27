import {chromium} from 'file:///C:/Users/madde/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
import {createOfflineState} from '../../../../experiments/idle-bastion/src/offline.ts';
const out='artifacts/idle-bastion/acceptance/tutorial-guide-2026-10-28',origin=process.env.CHECK_ORIGIN||'http://127.0.0.1:5254',results=[];
const seeds=JSON.parse(await readFile(out+'/fixtures.json','utf8'));
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
const prefix=origin.startsWith('https:')?'live':'production';
async function start(width,height,lang){
 const p=await browser.newPage({viewport:{width,height},isMobile:width<700,hasTouch:width<700}),errors=[];
 p.on('pageerror',e=>errors.push(e.message));
 await p.addInitScript(lang=>{localStorage.setItem('spire-language-v1',lang);localStorage.setItem('spire-audio-mix-v1',JSON.stringify({muted:true,music:.16,effects:.4,voices:.7}));},lang);
 return {p,errors};
}
async function check(p,name,width){
 const data=await p.evaluate(()=>{
  const guide=document.getElementById('tutorial-guide'),r=guide.getBoundingClientRect(),pause=document.getElementById('pause'),pr=pause.getBoundingClientRect(),sr=pause.querySelector('svg').getBoundingClientRect(),map=document.querySelector('.map-controls').getBoundingClientRect();
  const visible=el=>!!el&&el.getClientRects().length>0&&getComputedStyle(el).display!=='none';
  const outside=['onboarding-card','wisp-arrival','discovery-card','fallback-note','quick-win-hint','combat-message','lesson-savings','tutorial-card','mobile-hint','boss-banner'].filter(id=>{const el=document.getElementById(id);return visible(el)&&!guide.contains(el);});
  return {source:guide.dataset.source,text:guide.innerText,height:r.height,cardWidth:r.width,right:r.right,mapLeft:map.x,overflow:guide.scrollWidth>guide.clientWidth+1,outside,
   pause:{x:pr.x,right:pr.right,disabled:pause.disabled,dx:Math.abs(sr.x+sr.width/2-pr.x-pr.width/2),dy:Math.abs(sr.y+sr.height/2-pr.y-pr.height/2)}};
 });
 assert.deepEqual(data.outside,[],JSON.stringify(data));assert.equal(data.overflow,false);
 assert.ok(data.pause.dx<1&&data.pause.dy<1&&data.pause.right<=width,JSON.stringify(data));
 assert.ok(data.text.match(/\d+\/14/),JSON.stringify(data));assert.ok(data.height<=190,JSON.stringify(data));
 assert.ok(data.right< data.mapLeft,JSON.stringify(data));
 await p.screenshot({path:out+'/'+prefix+'-'+name+'-'+width+'.png'});
 results.push({width,name,...data});await writeFile(out+'/'+prefix+'-results.json',JSON.stringify(results,null,2)+'\n');
 console.log(prefix+' passed '+width+' '+name);
}
async function pointer(p,target){
 if(await p.locator('#lesson-pointer').getAttribute('data-target')==='camera-reset')await p.locator('#camera-reset').click();
 await p.locator('#lesson-pointer[data-target="'+target+'"]').waitFor({state:'visible'});
 const pt=await p.locator('#lesson-pointer').evaluate(e=>({x:parseFloat(e.style.left),y:parseFloat(e.style.top)}));
 if(p.viewportSize().width<700)await p.touchscreen.tap(pt.x,pt.y);else await p.mouse.click(pt.x,pt.y);
}
try {
 if(!process.env.LIVE_ONLY&&!process.env.CASE_FILTER)for(const [width,height,lang] of [[390,844,'en'],[320,568,'de']].filter(([w])=>!process.env.FRESH_WIDTH||w===Number(process.env.FRESH_WIDTH))){
  const {p,errors}=await start(width,height,lang);await p.goto(origin+'/?fresh=1',{waitUntil:'domcontentloaded'});await p.locator('#boot-screen').waitFor({state:'hidden',timeout:60000});
  for(let i=0;i<3;i++)await p.locator('#onboarding-primary').tap();
  await p.waitForFunction(()=>document.getElementById('app').dataset.intro==='build');
  await check(p,'fresh-build',width);
  await p.locator('#pick-archer')[width<700?'tap':'click']();assert.equal(await p.locator('#tutorial-guide').isVisible(),false);assert.equal(await p.locator('#placement-help .guide-inline').isVisible(),true);
  await pointer(p,'starter');await p.waitForFunction(()=>document.getElementById('app').dataset.intro==='ready');
  await p.locator('#onboarding-primary').click();await p.waitForFunction(()=>document.getElementById('app').dataset.intro==='upgrade',null,{timeout:30000});
  await pointer(p,'upgrade');await p.locator('#context-panel').waitFor({state:'visible'});
  assert.equal(await p.locator('#tutorial-guide').isVisible(),false);assert.equal(await p.locator('#context-panel .guide-inline').isVisible(),true);
  await p.locator('#upgrade')[width<700?'tap':'click']();await p.waitForFunction(()=>document.getElementById('app').dataset.intro==='workshop');
  await check(p,'first-wave',width);
  await p.locator('#pause')[width<700?'tap':'click']();await p.waitForFunction(()=>document.getElementById('pause').getAttribute('aria-pressed')==='true');
  await p.locator('#pause')[width<700?'tap':'click']();await p.waitForFunction(()=>document.getElementById('pause').getAttribute('aria-pressed')==='false');
  assert.deepEqual(errors,[]);await p.close();
 }
 const cases=process.env.LIVE_ONLY?[[390,844,'en','wait-wisp'],[320,568,'de','warehouse']]:[[1440,900,'en','wait-wisp'],[320,568,'de','wait-warehouse'],[390,844,'en','wisp'],[320,568,'de','cannon'],[320,568,'de','warehouse'],[844,390,'en','wait-wisp'],[390,844,'en','frost']];
 for(const [width,height,lang,kind] of cases.filter(c=>!process.env.CASE_FILTER||c[3]===process.env.CASE_FILTER)){
  const {p,errors}=await start(width,height,lang);
  await p.goto(origin+'/audio-credits.html');
  const now=Date.now(),raw={schemaVersion:2,revision:1,writtenAt:now,paused:false,battle:seeds[kind],offline:createOfflineState(now)};
  const slot=await p.evaluate(async raw=>{
   const slot='guide-production-'+crypto.randomUUID();
   await new Promise((resolve,reject)=>{const req=indexedDB.open('spire-idle-bastion-probe-'+slot,1);req.onupgradeneeded=()=>req.result.createObjectStore('saves');req.onerror=()=>reject(req.error);req.onsuccess=()=>{const db=req.result,tx=db.transaction('saves','readwrite');tx.objectStore('saves').put(raw,'default');tx.oncomplete=()=>{db.close();resolve();};tx.onerror=()=>reject(tx.error);};});return slot;
  },raw);
  await p.goto(origin+'/?probe='+slot,{waitUntil:'domcontentloaded'});await p.locator('#boot-screen').waitFor({state:'hidden',timeout:60000});
  if(await p.locator('#claim-offline').isVisible())await p.locator('#claim-offline').click();
  await p.locator('#tutorial-guide').waitFor({state:'visible'}).catch(async e=>{await p.screenshot({path:out+'/failure-'+kind+'.png'});console.log(await p.locator('#app').innerText());throw e;});await check(p,kind,width);
  if(kind==='wait-wisp'){
   await p.locator('#pause')[width<700?'tap':'click']();await p.waitForFunction(()=>document.getElementById('pause').getAttribute('aria-pressed')==='true');await p.screenshot({path:out+'/'+prefix+'-paused-'+width+'.png'});
   await p.locator('#pause')[width<700?'tap':'click']();
   await p.reload();await p.locator('#boot-screen').waitFor({state:'hidden',timeout:60000});if(await p.locator('#claim-offline').isVisible())await p.locator('#claim-offline').click();
   assert.ok((await p.locator('#tutorial-guide').innerText()).includes('10/14'));
  }else if(kind==='wisp'){
   await p.locator('#meet-wisp')[width<700?'tap':'click']();await p.waitForFunction(()=>document.getElementById('app').dataset.discovery==='mara-wait');
   await p.locator('#discovery-next')[width<700?'tap':'click']();await p.waitForFunction(()=>document.getElementById('app').dataset.discovery==='mara-ready'||document.getElementById('app').dataset.discovery==='mara-effect');
  }else if(kind==='cannon'){
   await p.locator('#quick-win-dismiss')[width<700?'tap':'click']();await p.waitForFunction(()=>document.getElementById('app').dataset.discovery==='warehouse');
   assert.ok((await p.locator('#tutorial-guide').innerText()).includes('14/14'));
  }else if(kind==='warehouse'){
   await p.locator('#discovery-later')[width<700?'tap':'click']();await p.waitForFunction(()=>document.getElementById('app').dataset.discovery==='done');
   assert.equal(await p.locator('#tutorial-guide').isVisible(),false);
   assert.equal(await p.locator('#quick-win-hint').isVisible(),true,'deferred level-six workshop tip returns');
  }else if(kind==='frost'){
   await p.locator('#pick-frost')[width<700?'tap':'click']();assert.equal(await p.locator('#placement-help .guide-inline').isVisible(),true);
   await pointer(p,'frost');await p.waitForFunction(()=>document.getElementById('app').dataset.intro==='done');
   await p.waitForFunction(()=>document.getElementById('tutorial-guide').innerText.includes('10/14'));
  }
  assert.deepEqual(errors,[]);await p.close();
 }
}finally{await browser.close();}
