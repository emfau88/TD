/** Real Phaser/browser views in isolated contexts and probe slots; no production save access. */
import { readFileSync,writeFileSync,mkdirSync } from 'node:fs';
import { createOfflineState } from '../../src/offline';
import { IdleBattle } from '../../src/battle';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE??'playwright');
const base=process.env.SPIRE_TEST_URL??'http://127.0.0.1:5194';
const output='artifacts/idle-bastion/acceptance/wave-rework';mkdirSync(output,{recursive:true});
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH??'C:/Program Files/Google/Chrome/Application/chrome.exe'});
const report:{errors:string[];views:unknown[];preview:unknown[];checks:unknown[]}={errors:[],views:[],preview:[],checks:[]};
try{
 for(const [device,viewport] of [['desktop',{width:1600,height:1000}],['mobile',{width:390,height:844}]] as const){
  const context=await browser.newContext({viewport,deviceScaleFactor:1,isMobile:device==='mobile',hasTouch:device==='mobile',reducedMotion:'reduce'});
  const page=await context.newPage();page.on('pageerror',(e:{message:string})=>report.errors.push(`${device}: ${e.message}`));
  page.on('response',(r:{status():number;url():string})=>{if(r.status()>=400)report.errors.push(`${r.status()} ${r.url()}`);});
  await page.goto(`${base}/enemy-check.html`);await page.locator('canvas').waitFor();
  await page.waitForFunction(()=>document.querySelector('#status')?.textContent?.includes('Läuft'));
  for(const dir of ['side','left','up','down']){
   await page.locator('#direction').selectOption(dir);await page.waitForTimeout(150);
   report.preview.push({device,direction:dir,status:await page.locator('#status').innerText()});
  }
  await page.locator('#action').selectOption('heal');await page.locator('#zoom').click();await page.locator('#pause').click();
  const before=await page.locator('#status').innerText();await page.locator('#step').click();await page.waitForTimeout(100);const after=await page.locator('#status').innerText();
  if(before===after)throw Error('Preview frame step did not advance');
  await page.screenshot({path:`${output}/enemy-preview-${device}.png`,fullPage:true});
  for(const wave of (device==='desktop'?[19,26,32,40]:[32,40])){
   const battle=JSON.parse(readFileSync(`${output}/view-wave${wave}.json`,'utf8'));if(!IdleBattle.restore(battle))throw Error('Invalid captured paid snapshot');
   const slot=`wave-rework-${device}-${wave}`,now=Date.now(),offline=createOfflineState(now);offline.baseline.paused=true;
   await page.evaluate(async({slot,battle,now,offline}:{slot:string;battle:unknown;now:number;offline:unknown})=>{
    await new Promise<void>((resolve,reject)=>{const request=indexedDB.open(`spire-idle-bastion-probe-${slot}`,1);request.onupgradeneeded=()=>request.result.createObjectStore('saves');
     request.onerror=()=>reject(request.error);request.onsuccess=()=>{const db=request.result,tx=db.transaction('saves','readwrite');
      tx.objectStore('saves').put({schemaVersion:2,revision:1,writtenAt:now,paused:true,battle,offline},'default');
      tx.oncomplete=()=>{db.close();resolve();};tx.onerror=()=>reject(tx.error);
     };
    });
   },{slot,battle,now,offline});
   await page.goto(`${base}/?probe=${slot}`);await page.locator('#game canvas').waitFor();
   await page.waitForFunction(()=>!document.querySelector('#return-card')?.hasAttribute('hidden')||!(document.querySelector('#pause') as HTMLButtonElement)?.disabled);
   if(await page.locator('#claim-offline').isVisible())await page.locator('#claim-offline').click();
   await page.waitForFunction(()=>!(document.querySelector('#pause') as HTMLButtonElement)?.disabled,{},{timeout:10000}).catch(async(error:Error)=>{
     report.errors.push((await page.locator('body').innerText()).slice(-3000));await page.screenshot({path:`${output}/browser-failure.png`,fullPage:true});throw error;
   });
   await page.waitForTimeout(450);
   if(await page.locator('#meet-wisp').isVisible()){await page.locator('#meet-wisp').click();await page.waitForTimeout(150);}
   if(device==='mobile'){
     await page.mouse.move(60,510);await page.mouse.down();await page.mouse.move(355,510,{steps:14});await page.mouse.up();await page.waitForTimeout(100);
   }
   if(wave===40){await page.locator('#pause').click();await page.waitForFunction(()=>document.querySelector('#wave-mode')?.textContent==='Elite');}
   await page.screenshot({path:`${output}/game-wave${wave}-${device}.png`,fullPage:true});
   if(wave===40)await page.locator('#pause').click();
   report.views.push({device,wave,enemies:battle.enemies.map((e:{defId:string})=>e.defId),viewport,canvas:await page.locator('#game canvas').boundingBox()});
   if(wave===32){
    await page.locator('#pause').click();await page.waitForTimeout(1400);await page.locator('#pause').click();
    const read=()=>page.evaluate(async(slot:string)=>new Promise<any>((resolve,reject)=>{const r=indexedDB.open(`spire-idle-bastion-probe-${slot}`,1);r.onsuccess=()=>{const db=r.result,q=db.transaction('saves').objectStore('saves').get('default');q.onsuccess=()=>{db.close();resolve(q.result);};q.onerror=()=>reject(q.error);};r.onerror=()=>reject(r.error);}),slot);
    const saved=await read();if(!IdleBattle.restore(saved.battle)||saved.battle.schemaVersion!==25)throw Error('Live browser checkpoint invalid');
    await page.reload();await page.locator('#game canvas').waitFor();await page.waitForTimeout(400);const resumed=await read();
    if(resumed.battle.gold!==saved.battle.gold||resumed.battle.attemptId!==saved.battle.attemptId||JSON.stringify(resumed.battle.queue)!==JSON.stringify(saved.battle.queue))throw Error('Paused reload altered wallet, attempt or queue');
    report.checks.push({device,pausedReload:true,schema:saved.battle.schemaVersion,rules:saved.battle.rulesVersion,attempt:saved.battle.attemptId});
   }
  }
  await context.close();
 }
 if(report.errors.length)throw Error(report.errors.join('\n'));
}finally{writeFileSync(`${output}/browser-results.json`,JSON.stringify(report,null,2));await browser.close();}
console.log(JSON.stringify(report));
