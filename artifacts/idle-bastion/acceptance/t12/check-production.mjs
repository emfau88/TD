import {chromium} from 'file:///C:/Users/madde/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
import assert from 'node:assert/strict';import {readFile,writeFile} from 'node:fs/promises';
const battle=JSON.parse(await readFile('artifacts/idle-bastion/acceptance/t12/flow-mara-save.json','utf8'));
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true}),results=[];
try{for(const width of [1440,390]){
 const page=await browser.newPage({viewport:{width,height:900},isMobile:width===390,hasTouch:width===390});const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:5253/audio-credits.html');
 const slot=await page.evaluate(async battle=>{
  const slot='t12-prod-'+crypto.randomUUID(),now=Date.now();localStorage.setItem('spire-language-v1','de');
  const envelope={schemaVersion:2,revision:1,writtenAt:now,paused:true,battle,offline:{schemaVersion:1,nextWindowId:1,baseline:{at:now,paused:true,certificate:null,efficiencyPermille:650,limitMs:28800000},window:null,pendingReward:null,roundingRemainder:{numerator:'0',denominator:'1'}}};
  await new Promise((resolve,reject)=>{const r=indexedDB.open('spire-idle-bastion-probe-'+slot,1);r.onupgradeneeded=()=>r.result.createObjectStore('saves');r.onerror=()=>reject(r.error);r.onsuccess=()=>{const db=r.result,tx=db.transaction('saves','readwrite');tx.objectStore('saves').put(envelope,'default');tx.oncomplete=()=>{db.close();resolve();};tx.onerror=()=>reject(tx.error);};});return slot;
 },battle);
 await page.goto('http://127.0.0.1:5253/?probe='+slot);await page.locator('#boot-screen').waitFor({state:'hidden',timeout:60000});
 if(await page.locator('#claim-offline').isVisible())await page.locator('#claim-offline').click();
 await page.locator('#settlement-tab').click();await page.locator('#pick-tavern').click();
 const d=page.locator('#tavern-dialog');await d.locator('[data-do=mara]').click();await page.waitForFunction(()=>document.querySelector('.tv-figure canvas')?.dataset.clip==='idle');
 assert.match(await d.locator('[data-text=chapter]').innerText(),/kommenden Update/);assert.equal(await d.locator('[data-action=gift]').isDisabled(),true);
 await d.locator('[data-do=touch]').click();await d.locator('[data-region=hair]').waitFor({state:'visible',timeout:30000});
 if(width===390)await d.locator('[data-region=hair]').tap();else await d.locator('[data-region=hair]').click();
 await page.waitForFunction(()=>document.querySelector('.tv-figure canvas')?.dataset.clip==='head');
 await page.screenshot({path:'artifacts/idle-bastion/acceptance/t12/production-'+width+'.png'});
 await d.locator('[data-do=close]').first().click();await page.locator('#camera-reset').click();
 await page.screenshot({path:'artifacts/idle-bastion/acceptance/t12/map-overview-'+width+'.png'});
 results.push({width,touchEvent:width===390,chapter:true,errors});assert.deepEqual(errors,[]);await page.close();
}await writeFile('artifacts/idle-bastion/acceptance/t12/production-results.json',JSON.stringify(results,null,2));console.log(JSON.stringify(results));}finally{await browser.close();}
