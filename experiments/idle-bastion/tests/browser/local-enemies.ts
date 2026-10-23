/** Live UI/Phaser checks; isolated browser databases, no user saves touched. */
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {createOfflineState} from '../../src/offline';
import {IdleBattle} from '../../src/battle';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE??'playwright');
const base=process.env.SPIRE_TEST_URL??'http://127.0.0.1:5196';
const output='artifacts/idle-bastion/acceptance/local-enemy-assets';mkdirSync(output,{recursive:true});
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH??'C:/Program Files/Google/Chrome/Application/chrome.exe'});
const report:{errors:string[];previews:unknown[];games:unknown[]}={errors:[],previews:[],games:[]};
try{
 for(const [device,viewport] of [['desktop',{width:1600,height:1000}],['mobile',{width:390,height:844}]] as const){
  const context=await browser.newContext({viewport,deviceScaleFactor:1,isMobile:device==='mobile',hasTouch:device==='mobile'}),page=await context.newPage();
  page.on('pageerror',(e:Error)=>report.errors.push(`${device}: ${e.message}`));page.on('response',(r:any)=>{if(r.status()>=400)report.errors.push(`${r.status()} ${r.url()}`);});
  await page.goto(base+'/enemy-lab.html');await page.locator('article[data-group="shrooms"]').last().waitFor();
  const variants=await page.locator('article[data-group="shrooms"] select').evaluateAll((nodes:any[])=>nodes.map(n=>({name:n.ariaLabel,count:n.options.length})));
  if(variants.reduce((n:number,r:{count:number})=>n+r.count,0)!==96)throw Error('Missing private palette choices');
  await page.locator('#group').selectOption('shrooms');
  for(const direction of ['down','up','side','left']){
   await page.locator('#direction').selectOption(direction);await page.waitForTimeout(70);
   const before=await page.locator('article[data-group="shrooms"] canvas').evaluateAll((cs:HTMLCanvasElement[])=>cs.map(c=>c.dataset.frame));
   if(direction==='down')await page.locator('#pause').click();await page.locator('#step').click();await page.waitForTimeout(60);
   const after=await page.locator('article[data-group="shrooms"] canvas').evaluateAll((cs:HTMLCanvasElement[])=>cs.map(c=>c.dataset.frame));
   if(before.some((v:string,i:number)=>v===after[i]))throw Error('Frame step failed in '+direction);
  }
  // Restricted standalone sprite comparisons never enter tracked artifacts.
  await page.screenshot({path:`experiments/idle-bastion/.local-assets/shrooms-${device}.png`,fullPage:true});
  await page.locator('#group').selectOption('frak');
  for(const resolution of ['16','32','48','64']){await page.locator('#resolution').selectOption(resolution);await page.waitForTimeout(60);}
  for(const action of ['Walk','Idle','Attack','Hurt']){await page.locator('#action').selectOption(action);await page.locator('#step').click();}
  await page.locator('#action').selectOption('Walk');await page.locator('#resolution').selectOption('48');await page.locator('#group').selectOption('new');await page.locator('#direction').selectOption('side');
  await page.locator('select[aria-label="Moospilz Farbvariante"]').selectOption('1');await page.waitForTimeout(150);
  await page.screenshot({path:`${output}/new-enemies-${device}.png`,fullPage:true});
  report.previews.push({device,variants,total:96,resolutions:[16,32,48,64],directions:4,pauseAndStep:true,bodyWidth:await page.evaluate(()=>document.body.scrollWidth),viewport});
  for(const sample of (device==='desktop'?[42,46,50,54,154]:[54,154])){
   const wave=sample%100,intro=sample!==54,view=intro?'intro':'wave';
   const battle=JSON.parse(readFileSync(`${output}/view-${view}${wave}.json`,'utf8'));if(!IdleBattle.restore(battle))throw Error('Invalid paid capture');
   const slot=`assets-${device}-${sample}`,now=Date.now(),offline=createOfflineState(now);offline.baseline.paused=true;
   await page.evaluate(async({slot,battle,now,offline}:any)=>new Promise<void>((resolve,reject)=>{const r=indexedDB.open(`spire-idle-bastion-probe-${slot}`,1);r.onupgradeneeded=()=>r.result.createObjectStore('saves');r.onerror=()=>reject(r.error);r.onsuccess=()=>{const db=r.result,tx=db.transaction('saves','readwrite');tx.objectStore('saves').put({schemaVersion:2,revision:1,writtenAt:now,paused:true,battle,offline},'default');tx.oncomplete=()=>{db.close();resolve();};tx.onerror=()=>reject(tx.error);};}),{slot,battle,now,offline});
   await page.goto(`${base}/?probe=${slot}`);await page.locator('#game canvas').waitFor();
   await page.waitForFunction(()=>!document.querySelector('#return-card')?.hasAttribute('hidden')||!(document.querySelector('#pause') as HTMLButtonElement)?.disabled);
   if(await page.locator('#claim-offline').isVisible())await page.locator('#claim-offline').click();
   await page.waitForFunction(()=>!(document.querySelector('#pause') as HTMLButtonElement)?.disabled);await page.waitForTimeout(400);
   if(await page.locator('#meet-wisp').isVisible())await page.locator('#meet-wisp').click();
   if(device==='mobile'){await page.mouse.move(60,510);await page.mouse.down();await page.mouse.move(355,510,{steps:14});await page.mouse.up();await page.waitForTimeout(150);}
   await page.screenshot({path:`${output}/game-${view}${wave}-${device}.png`,fullPage:true});
   if(!await page.locator('#pause').evaluate((el:HTMLElement)=>el.classList.contains('paused')))throw Error('Expected paused capture');
   await page.locator('#pause').click();
   const deltas=await page.evaluate(async()=>{const out:number[]=[];let previous=performance.now();for(let i=0;i<120;i++){const now=await new Promise<number>(resolve=>requestAnimationFrame(resolve));out.push(now-previous);previous=now;}return out;});
   await page.locator('#pause').click();await page.waitForTimeout(250);
   const saved=await page.evaluate(async(slot:string)=>new Promise<any>((resolve,reject)=>{const r=indexedDB.open(`spire-idle-bastion-probe-${slot}`,1);r.onerror=()=>reject(r.error);r.onsuccess=()=>{const db=r.result,q=db.transaction('saves').objectStore('saves').get('default');q.onsuccess=()=>{db.close();resolve(q.result);};q.onerror=()=>reject(q.error);};}),slot);
   if(!IdleBattle.restore(saved.battle))throw Error('Browser checkpoint failed strict restoration');
   await page.reload();await page.locator('#game canvas').waitFor();await page.waitForTimeout(350);
   const restored=await page.evaluate(async(slot:string)=>new Promise<any>(resolve=>{const r=indexedDB.open(`spire-idle-bastion-probe-${slot}`,1);r.onsuccess=()=>{const db=r.result,q=db.transaction('saves').objectStore('saves').get('default');q.onsuccess=()=>{db.close();resolve(q.result);};};}),slot);
   if(restored.battle.gold!==saved.battle.gold||restored.battle.attemptId!==saved.battle.attemptId||JSON.stringify(restored.battle.enemies)!==JSON.stringify(saved.battle.enemies)||JSON.stringify(restored.battle.queue)!==JSON.stringify(saved.battle.queue))throw Error('Paused reload changed live encounter');
   const sorted=deltas.slice(1).sort((a:number,z:number)=>a-z);
   report.games.push({device,wave,intro,enemyCount:battle.enemies.length,queue:battle.queue.length,species:[...new Set(battle.enemies.map((e:any)=>e.defId))],rAFmedian:sorted[Math.floor(sorted.length/2)],rAFp95:sorted[Math.floor(sorted.length*.95)],pausedReload:true});
  }
  await context.close();
 }
 if(report.errors.length)throw Error(report.errors.join('\n'));
}finally{writeFileSync(`${output}/browser-results.json`,JSON.stringify(report,null,2));await browser.close();}
console.log(JSON.stringify(report));
