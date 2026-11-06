import assert from 'node:assert/strict';
import{readFileSync,writeFileSync,mkdirSync}from'node:fs';
import{chromium}from'file:///C:/Users/madde/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
import{IdleBattle}from'../../experiments/idle-bastion/src/battle';
import{createOfflineState}from'../../experiments/idle-bastion/src/offline';
const origin=process.argv[2]??'http://127.0.0.1:5210',out=process.argv[3]??'artifacts/obsidian-worm-2026-11-06/browser';mkdirSync(out,{recursive:true});
const read=(name:string)=>JSON.parse(readFileSync(new URL(name,import.meta.url),'utf8'));
const seeds={36:read('selected/mixed-fresh.json').snapshots.clear35,45:read('selected/tactical-w30-24h.json').snapshots.clear44};
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'}),results:any[]=[];
async function saved(page:any,name:string){return page.evaluate(async(name:string)=>new Promise<any>((resolve,reject)=>{const q=indexedDB.open(name);q.onerror=()=>reject(q.error);q.onsuccess=()=>{const db=q.result,r=db.transaction('saves').objectStore('saves').get('default');r.onsuccess=()=>{db.close();resolve(r.result);};r.onerror=()=>reject(r.error);};}),name);}
try{
 for(const [width,height,lang]of [[1440,900,'de'],[844,390,'en'],[390,844,'de']]as const){
  const context=await browser.newContext({viewport:{width,height},hasTouch:width<1000,isMobile:width<1000}),page=await context.newPage(),errors:string[]=[];
  page.on('pageerror',(e:Error)=>errors.push(e.message));page.on('response',(r:any)=>{if(r.url().startsWith(origin)&&r.status()>=400)errors.push(r.status()+' '+r.url());});
  await page.addInitScript((lang:string)=>{localStorage.setItem('spire-language-v1',lang);localStorage.setItem('spire-audio-mix-v1',JSON.stringify({muted:true,music:0,effects:0,voices:0}));},lang);
  for(const wave of [36,45]as const){
   const b=IdleBattle.restore(seeds[wave])!;assert.ok(b);b.update(16);assert.equal(b.wave,wave);assert.equal(b.enemies.length,1);
   const battle=b.snapshot(),slot='worm-'+width+'-'+wave+'-'+process.pid,name='spire-idle-bastion-probe-'+slot,now=Date.now(),off=createOfflineState(now);off.baseline.paused=true;
   await page.goto(origin+'/audio-credits.html');
   await page.evaluate(async({name,battle,now,off}:any)=>new Promise<void>((resolve,reject)=>{const q=indexedDB.open(name,1);q.onupgradeneeded=()=>q.result.createObjectStore('saves');q.onerror=()=>reject(q.error);q.onsuccess=()=>{const db=q.result,tx=db.transaction('saves','readwrite');tx.objectStore('saves').put({schemaVersion:2,revision:1,writtenAt:now,paused:true,battle,offline:off,maraOfflineWelcomeSeen:true},'default');tx.oncomplete=()=>{db.close();resolve();};tx.onerror=()=>reject(tx.error);};}),{name,battle,now,off});
   await page.goto(origin+'/?probe='+slot);await page.locator('#game canvas').waitFor({timeout:60000});await page.locator('#boot-screen').waitFor({state:'hidden',timeout:60000});
   if(await page.locator('#claim-offline').isVisible())await page.locator('#claim-offline').click();
   await page.waitForFunction(()=>!(document.querySelector('#pause')as HTMLButtonElement).disabled);
   assert.equal(await page.locator('#pause').getAttribute('aria-pressed'),'true');await page.locator('#boss-banner').waitFor({state:'visible'});
   assert.ok((await page.locator('#boss-title').innerText()).includes(lang==='de'?'Obsidianwurm':'Obsidian Wurm'));
   assert.ok(!(await page.locator('#boss-banner').innerText()).includes('Rosenspiegel'));
   if(await page.locator('#hint-skip').isVisible())await page.locator('#hint-skip').click();
   const before=(await saved(page,name)).battle;await page.screenshot({path:out+'/'+width+'-w'+wave+'.png'});
   await page.locator('#camera-reset').click();await page.screenshot({path:out+'/'+width+'-w'+wave+'-overview.png'});
   await page.locator('#pause').click();await page.waitForTimeout(2200);await page.locator('#pause').click();
   await page.waitForFunction(()=>document.querySelector('#pause')!.getAttribute('aria-pressed')==='true');
   const after=(await saved(page,name)).battle;assert.ok(after.elapsed>before.elapsed);assert.equal(after.enemies.length,1);assert.ok(after.enemies[0].distance>before.enemies[0].distance);assert.ok(IdleBattle.restore(after));
   await page.reload();await page.locator('#boot-screen').waitFor({state:'hidden',timeout:60000});await page.waitForTimeout(200);assert.deepEqual((await saved(page,name)).battle,after);
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
   results.push({width,height,lang,wave,oneEnemy:true,moving:true,exactPausedReload:true,parts:b.wormBody(b.enemies[0]).length});
  }
  assert.deepEqual(errors,[]);await context.close();console.log(width+' OK');
 }
}finally{writeFileSync(out+'/results.json',JSON.stringify(results,null,2));await browser.close();}
