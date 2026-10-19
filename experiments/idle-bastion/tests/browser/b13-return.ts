/** Return from the actual B13 save; only its departure clock is shifted by one hour. */
import { readFileSync, writeFileSync } from 'node:fs';
import { createOfflineState, beginAbsence, offlinePolicy } from '../../src/offline';
import { IdleBattle } from '../../src/battle';
const playwrightModule=process.env.PLAYWRIGHT_MODULE ?? 'playwright';
const {chromium}=await import(playwrightModule);
const root='artifacts/idle-bastion/acceptance/15min',seed=JSON.parse(readFileSync(`${root}/b13-browser-save.json`,'utf8'));
const start=Date.now()-3600000,certificate=seed.offline.baseline.certificate;
if(!certificate||!seed.battle.settlement.warehouseBuilt)throw Error('Real playthrough did not earn the required return basis');
seed.writtenAt=start;seed.offline=beginAbsence(createOfflineState(start),start,certificate,false,offlinePolicy(true));
const slot=`b13-return-${Date.now()}`,database=`spire-idle-bastion-probe-${slot}`;
const browser=await chromium.launch({headless:true}),context=await browser.newContext({viewport:{width:1600,height:1000}}),page=await context.newPage();
page.setDefaultTimeout(8000);const report:any={slot,simulatedAbsenceMs:3600000,source:'b13-browser-save.json',sourceElapsed:seed.battle.elapsed,sourceGold:seed.battle.gold,sourceRecord:seed.battle.highestCleared,certificate,errors:[],purchases:[]};
page.on('pageerror',(e:Error)=>report.errors.push(e.message));
async function save(){return page.evaluate(async(name:string)=>{const db:IDBDatabase=await new Promise(resolve=>{const q=indexedDB.open(name);q.onsuccess=()=>resolve(q.result);});const s=await new Promise<any>(resolve=>{const q=db.transaction('saves').objectStore('saves').get('default');q.onsuccess=()=>resolve(q.result);});db.close();return s;},database);}
try{
 await page.goto('http://127.0.0.1:5191/asset-check.html');
 await page.evaluate(async({name,seed}:any)=>{const db:IDBDatabase=await new Promise(resolve=>{const q=indexedDB.open(name,1);q.onupgradeneeded=()=>q.result.createObjectStore('saves');q.onsuccess=()=>resolve(q.result);});await new Promise<void>((resolve,reject)=>{const tx=db.transaction('saves','readwrite');tx.objectStore('saves').put(seed,'default');tx.oncomplete=()=>resolve();tx.onerror=()=>reject(tx.error);});db.close();},{name:database,seed});
 await page.goto(`http://127.0.0.1:5191/?probe=${slot}`);await page.locator('#claim-offline').waitFor();
 report.shown=await page.locator('#return-card').innerText();report.pending=(await save()).offline.pendingReward;
 await page.screenshot({path:`root-placeholder/b13-return.png`.replace('root-placeholder',root)});
 await page.locator('#claim-offline').click();await page.waitForFunction(()=>document.querySelector<HTMLElement>('#return-card')!.hidden);
 const claimed=await save();report.claimedGold=claimed.battle.gold;report.pendingAfter=claimed.offline.pendingReward;
 // Spend the earned offline proceeds through actual tower panels, then continue combat.
 for(const kind of [3,4,1]){
  const before=await save(),b=IdleBattle.restore(before.battle)!;const t=b.towers.find(t=>t.def.id===kind)!;
  await page.locator('#camera-reset').click();const box=(await page.locator('#game canvas').boundingBox())!;const zoom=Math.min(box.width/b.layout.bounds.width,box.height/b.layout.bounds.height),cell=b.layout.towerPads.find(p=>p.id===t.padId)!.cell;
  await page.mouse.click(box.x+box.width/2+((cell.x+.5)*40-b.layout.bounds.width/2)*zoom,box.y+box.height/2+((cell.y+.5)*40-12-b.layout.bounds.height/2)*zoom);
  await page.locator('#upgrade').click();await page.locator('#close-context').click();await page.waitForTimeout(200);
  const after=await save();const upgraded=after.battle.towers.find((v:any)=>v.uid===t.uid);if(upgraded.level!==t.level+1)throw Error('Upgrade not persisted');
  report.purchases.push({kind,from:t.level,to:upgraded.level,goldBefore:b.gold,goldAfter:after.battle.gold});
 }
 if(await page.locator('#advance').isVisible())await page.locator('#advance').click();
 await page.waitForTimeout(15000);report.continued=await save();
 if(report.continued.battle.elapsed<=seed.battle.elapsed+10)throw Error('Battle did not resume');
 if(report.pendingAfter!==null)throw Error('Claim stayed pending');
 await page.screenshot({path:`${root}/b13-return-purchases.png`});
 if(report.errors.length)throw Error(report.errors.join('; '));
 console.log(JSON.stringify({shown:report.shown,purchases:report.purchases,continuedSeconds:report.continued.battle.elapsed-seed.battle.elapsed}));
}catch(e){report.failure=String(e);throw e;}finally{writeFileSync(`${root}/b13-return.json`,JSON.stringify(report,null,2));await context.close();await browser.close();}
