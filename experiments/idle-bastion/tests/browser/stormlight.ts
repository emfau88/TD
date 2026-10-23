/** Real Phaser/UI checks in isolated browser saves, based on the paid audit. */
import {readFileSync,writeFileSync} from 'node:fs';
import {IdleBattle} from '../../src/battle';
import {createOfflineState} from '../../src/offline';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE??'playwright');
const base=process.env.SPIRE_TEST_URL??'http://127.0.0.1:5198',out='artifacts/idle-bastion/acceptance/b16';
const production=process.env.SPIRE_PRODUCTION_CHECK==='1',prefix=production?'production-':'';
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH??'C:/Program Files/Google/Chrome/Application/chrome.exe'});
const report:{errors:string[];samples:unknown[];launcherVerified:boolean}={errors:[],samples:[],launcherVerified:false};
try{
 for(const [device,viewport] of [['desktop',{width:1600,height:1000}],['mobile',{width:390,height:844}]] as const){
  const context=await browser.newContext({viewport,isMobile:device==='mobile',hasTouch:device==='mobile'}),page=await context.newPage();
  page.on('pageerror',(e:Error)=>report.errors.push(e.message));page.on('response',(r:any)=>{if(r.status()>=400)report.errors.push(`${r.status()} ${r.url()}`);});
  await page.goto(base+'/?fresh=1');
  if(!production){
   await page.goto(base+'/stormlight-check.html');await page.locator('[data-sample="stage3"]').click();
   await page.waitForURL(/probe=b16-review-/);await page.locator('#game canvas').waitFor();report.launcherVerified=true;
  }
  for(const sample of (production?['research','dense']:device==='desktop'?['research','stage1','stage2','stage3','dense']:['research','stage3','dense'])){
   const battle=JSON.parse(readFileSync(`${out}/economy/${sample==='research'?'research-before':sample==='dense'?'one-storm-wave40':'one-storm-'+sample}.json`,'utf8'));
   if(!IdleBattle.restore(battle))throw Error('Invalid paid UI snapshot '+sample);
   const slot=`b16-${device}-${sample}`,now=Date.now(),offline=createOfflineState(now);offline.baseline.paused=true;
   await page.evaluate(async({slot,battle,now,offline}:any)=>new Promise<void>((resolve,reject)=>{const r=indexedDB.open(`spire-idle-bastion-probe-${slot}`,1);r.onupgradeneeded=()=>r.result.createObjectStore('saves');r.onerror=()=>reject(r.error);r.onsuccess=()=>{const db=r.result,tx=db.transaction('saves','readwrite');tx.objectStore('saves').put({schemaVersion:2,revision:1,writtenAt:now,paused:true,battle,offline},'default');tx.oncomplete=()=>{db.close();resolve();};tx.onerror=()=>reject(tx.error);};}),{slot,battle,now,offline});
   await page.goto(`${base}/?probe=${slot}`);await page.locator('#game canvas').waitFor();
   await page.waitForFunction(()=>!document.querySelector('#return-card')?.hasAttribute('hidden')||!(document.querySelector('#pause') as HTMLButtonElement)?.disabled);await page.waitForTimeout(250);
   if(await page.locator('#claim-offline').isVisible())await page.locator('#claim-offline').click();
   await page.waitForFunction(()=>!(document.querySelector('#pause') as HTMLButtonElement)?.disabled);
   if(sample==='research'){
    await page.locator('#pick-storm').scrollIntoViewIfNeeded();await page.locator('#pick-storm').click();await page.locator('#tech-storm').click();
    await page.locator('#research-details').filter({hasText:'Turmbau separat'}).waitFor();
    await page.screenshot({path:`${out}/${prefix}research-${device}.png`,fullPage:true});
    await page.locator('#close-context').click();await page.locator('#pause').click();
    await page.locator('#pick-workshop').scrollIntoViewIfNeeded();await page.locator('#pick-workshop').click();await page.locator('#tech-storm').click();
    await page.waitForFunction(()=>!(document.querySelector('#research-storm') as HTMLButtonElement).disabled);
    await page.locator('#research-storm').click();await page.locator('#tech-storm-status').filter({hasText:'✓'}).waitFor();
    await page.locator('#close-context').click();await page.locator('#tower-tab').click();
    await page.locator('#pick-storm').scrollIntoViewIfNeeded();await page.locator('#pick-storm').click();
    await page.waitForFunction(()=>document.querySelector('#pick-storm')?.getAttribute('aria-pressed')==='true');
    await page.locator('#cancel-placement').click();await page.locator('#pad-choice').selectOption('cell-24-7',{force:true});
    await page.waitForFunction(()=>!(document.querySelector('#build-storm') as HTMLButtonElement).disabled);await page.locator('#build-storm').click();
    await page.locator('#context-panel').waitFor({state:'hidden'});await page.waitForFunction(()=>!(document.querySelector('#pause') as HTMLButtonElement).disabled);
    await page.locator('#pause').click();await page.waitForTimeout(250);
   }else{
    const storm=battle.towers.find((t:any)=>t.kind===5);
    await page.locator('#pad-choice').selectOption(storm.padId,{force:true});await page.locator('#tower-role').filter({hasText:'Bis zu drei Ziele'}).waitFor();
    if(sample==='dense')await page.locator('#close-context').click();
    await page.screenshot({path:`${out}/${prefix}${sample}-${device}.png`,fullPage:true});
    if(sample!=='dense')await page.locator('#close-context').click();
    await page.locator('#pause').click();await page.waitForTimeout(2300);await page.locator('#pause').click();await page.waitForTimeout(250);
   }
   const saved=await page.evaluate(async(slot:string)=>new Promise<any>(resolve=>{const r=indexedDB.open(`spire-idle-bastion-probe-${slot}`,1);r.onsuccess=()=>{const db=r.result,q=db.transaction('saves').objectStore('saves').get('default');q.onsuccess=()=>{db.close();resolve(q.result);};};}),slot);
   if(!IdleBattle.restore(saved.battle))throw Error('Strict live reload rejected '+sample);
   if(sample==='research'&&(!saved.battle.settlement.stormResearched||!saved.battle.towers.some((t:any)=>t.kind===5)||saved.battle.gold-battle.gold!==saved.battle.earned-battle.earned-900-170))throw Error('Research and build did not charge exactly 900 + 170 gold');
   await page.reload();await page.locator('#game canvas').waitFor();await page.waitForTimeout(400);
   const restored=await page.evaluate(async(slot:string)=>new Promise<any>(resolve=>{const r=indexedDB.open(`spire-idle-bastion-probe-${slot}`,1);r.onsuccess=()=>{const db=r.result,q=db.transaction('saves').objectStore('saves').get('default');q.onsuccess=()=>{db.close();resolve(q.result);};};}),slot);
   if(JSON.stringify(saved.battle)!==JSON.stringify(restored.battle))throw Error('Paused reload changed battle');
   report.samples.push({device,sample,pausedReload:true,research:saved.battle.settlement.stormResearched,initialLivingEnemies:battle.enemies.length,bodyWidth:await page.evaluate(()=>document.body.scrollWidth),viewport});
  }
  await context.close();
 }
 if(report.errors.length)throw Error(report.errors.join('\n'));
}finally{writeFileSync(`${out}/${prefix}browser-results.json`,JSON.stringify(report,null,2));await browser.close();}
console.log(JSON.stringify(report));
