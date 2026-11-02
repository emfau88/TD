import {chromium} from 'file:///C:/Users/madde/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import {IdleBattle} from '../../../../experiments/idle-bastion/src/battle';
import {certifyFarm,farmRewardUnits} from '../../../../experiments/idle-bastion/src/farming';
import {beginAbsence,createOfflineState,WAREHOUSE_OFFLINE,LEGACY_WAREHOUSE_OFFLINE} from '../../../../experiments/idle-bastion/src/offline';

const out='artifacts/idle-bastion/acceptance/progression-economy-2026-11-02';
const origin='http://127.0.0.1:5268',now=Date.now();
const legacy=JSON.parse(readFileSync('experiments/idle-bastion/tests/fixtures/progression-economy-v16.json','utf8'));
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
const selected=process.argv[2]??'all';
const results:any[]=selected==='all'?[]:JSON.parse(readFileSync(`${out}/browser.json`,'utf8')).filter((r:any)=>r.kind!==selected&&r.kind!=='fresh');
const money=(s:any)=>s.gold*1000+s.goldRemainderUnits;
const earned=(s:any)=>s.progress.battleGold*1000+s.rewardRemainderUnits;
async function pageFor(lang:string,width:number,height:number){
  const context=await browser.newContext({viewport:{width,height},isMobile:width<700,hasTouch:width<700});
  const page=await context.newPage(),errors:string[]=[];
  page.on('pageerror',(e:Error)=>errors.push(e.message));
  page.on('response',(r:any)=>{if(r.status()>=400&&r.url().startsWith(origin))errors.push(`${r.status()} ${r.url()}`);});
  await page.addInitScript((lang:string)=>{localStorage.setItem('spire-language-v1',lang);
    localStorage.setItem('spire-audio-mix-v1',JSON.stringify({muted:true,music:.16,effects:.4,voices:.7}));},lang);
  return {page,context,errors};
}
async function readSave(page:any,name:string){return page.evaluate(async(name:string)=>{
  const db=await new Promise<IDBDatabase>((resolve,reject)=>{const q=indexedDB.open(name);q.onsuccess=()=>resolve(q.result);q.onerror=()=>reject(q.error);});
  const save=await new Promise<any>((resolve,reject)=>{const q=db.transaction('saves').objectStore('saves').get('default');q.onsuccess=()=>resolve(q.result);q.onerror=()=>reject(q.error);});db.close();return save;
},name);}
try{
  for(const [kind,lang,width,height] of [['current','de',1440,900],['legacy','en',390,844]] as const){
    if(selected!=='all'&&selected!==kind)continue;
    const {page,context,errors}=await pageFor(lang,width,height);
    const b=IdleBattle.restore(legacy.before)!;
    const attempt=b.attemptId;
    if(kind==='current')for(let i=0;i<16000&&b.attemptId===attempt;i++)b.update(.025);
    const battle=kind==='legacy'?legacy.before:b.snapshot();
    const proof=kind==='legacy'?legacy.proof:certifyFarm(b)!;
    const policy=kind==='legacy'?LEGACY_WAREHOUSE_OFFLINE:WAREHOUSE_OFFLINE;
    const start=now-86400000,offline=beginAbsence(createOfflineState(start),start,proof,false,policy);
    const seed={schemaVersion:2,revision:1,writtenAt:start,paused:false,battle,offline};
    const slot=`economy-${kind}-${process.pid}`,name=`spire-idle-bastion-probe-${slot}`;
    await page.goto(origin+'/audio-credits.html');
    await page.evaluate(async({name,seed}:any)=>{
      const db=await new Promise<IDBDatabase>((resolve,reject)=>{const q=indexedDB.open(name,1);q.onupgradeneeded=()=>q.result.createObjectStore('saves');q.onsuccess=()=>resolve(q.result);q.onerror=()=>reject(q.error);});
      await new Promise<void>((resolve,reject)=>{const tx=db.transaction('saves','readwrite');tx.objectStore('saves').put(seed,'default');tx.oncomplete=()=>resolve();tx.onerror=()=>reject(tx.error);});db.close();
    },{name,seed});
    await page.goto(`${origin}/?probe=${slot}`);
    await page.locator('#claim-offline').waitFor({timeout:60000});
    const first=await readSave(page,name);
    const expected=Number(farmRewardUnits(proof)*BigInt(policy.efficiencyPermille)*28800000n/(BigInt(proof.durationMs)*1000n));
    assert.equal(first.offline.pendingReward.amountUnits,expected);
    assert.equal(first.offline.pendingReward.creditedMs,28800000);
    assert.equal(first.battle.elapsed,battle.elapsed);assert.equal(first.battle.wave,battle.wave);
    assert.match(await page.locator('#return-basis').innerText(),new RegExp(String(policy.efficiencyPermille/10)));
    const shown=await page.locator('#return-card').innerText();
    await page.screenshot({path:`${out}/return-${kind}-${width}.png`});
    await page.reload();await page.locator('#claim-offline').waitFor({timeout:60000});
    const again=await readSave(page,name);assert.equal(again.offline.pendingReward.id,first.offline.pendingReward.id);
    assert.equal(again.offline.pendingReward.amountUnits,expected);assert.equal(again.offline.pendingReward.creditedMs,28800000);
    await page.locator('#claim-offline').click();await page.locator('#return-card').waitFor({state:'hidden'});
    await page.locator('#pause').click();await page.waitForFunction(()=>document.querySelector('#pause')!.getAttribute('aria-pressed')==='true');
    const claimed=await readSave(page,name);
    assert.equal(claimed.offline.pendingReward,null);
    assert.equal(money(claimed.battle)-money(first.battle)-(earned(claimed.battle)-earned(first.battle)),expected);
    assert.equal(claimed.offline.baseline.efficiencyPermille,260);
    await page.reload();await page.locator('#boot-screen').waitFor({state:'hidden',timeout:60000});
    const reloaded=await readSave(page,name);assert.equal(money(reloaded.battle),money(claimed.battle));assert.equal(reloaded.paused,true);
    assert.equal(reloaded.offline.pendingReward?.amountUnits??0,0,'paused reload cannot produce another payout');
    if(await page.locator('#return-card').isVisible()){
      await page.locator('#claim-offline').click();await page.locator('#return-card').waitFor({state:'hidden'});
      const zeroClaim=await readSave(page,name);assert.equal(money(zeroClaim.battle),money(claimed.battle));assert.equal(zeroClaim.paused,true);
    }
    await page.locator(width<700?'#gold-summary':'#open-progress').click();
    const rateNote=await page.locator('#journal-rate-note').innerText(),offlineNote=await page.locator('#journal-offline-note').innerText();
    assert.match(rateNote,/10\s?%/);assert.match(offlineNote,/26\s?%/);
    await page.screenshot({path:`${out}/journal-${kind}-${width}.png`});
    await page.locator('#close-progress').click();await page.locator('#settlement-tab').click();await page.locator('#pick-warehouse').click();
    assert.match(await page.locator('#warehouse-efficiency').innerText(),/26\s?%/);
    await page.screenshot({path:`${out}/warehouse-${kind}-${width}.png`});
    await page.locator('#close-context').click();await page.locator('#pause').click();
    await page.waitForTimeout(2500);await page.locator('#pause').click();
    const resumed=await readSave(page,name);assert.ok(resumed.battle.elapsed>=reloaded.battle.elapsed+1);
    assert.deepEqual(errors,[]);results.push({kind,lang,width,expectedGold:expected/1000,shown,rateNote,offlineNote,continuedSeconds:resumed.battle.elapsed-reloaded.battle.elapsed,errors});
    console.log(`${kind} ${width}px: exact claim, reload, current hints, pause and continued combat passed`);
    await context.close();
  }
  const {page,context,errors}=await pageFor('en',390,844);
  await page.goto(origin+'/?probe=economy-fresh-'+process.pid);await page.locator('#boot-screen').waitFor({state:'hidden',timeout:60000});
  for(let i=0;i<3;i++)await page.locator('#onboarding-primary').click();
  await page.locator('#pick-archer').click();
  const pointer=async()=>{const locator=page.locator('#lesson-pointer');await locator.waitFor();const p=await locator.evaluate((e:HTMLElement)=>({x:parseFloat(e.style.left),y:parseFloat(e.style.top)}));await page.touchscreen.tap(p.x,p.y);};
  await pointer();await page.waitForFunction(()=>document.getElementById('app')!.dataset.intro==='ready');
  await page.locator('#onboarding-primary').click();
  await page.waitForFunction(()=>document.getElementById('app')!.dataset.intro==='upgrade',null,{timeout:30000});
  await pointer();await page.locator('#upgrade').click();
  await page.waitForFunction(()=>document.getElementById('app')!.dataset.intro==='workshop');
  let freshSave:any;
  for(let i=0;i<120;i++){
    freshSave=await readSave(page,'spire-idle-bastion-probe-economy-fresh-'+process.pid);
    if(freshSave.battle.highestCleared>=1)break;
    await page.waitForTimeout(250);
  }
  assert.equal(freshSave.battle.highestCleared,1);assert.equal(freshSave.battle.towers[0].level,2);
  assert.equal(freshSave.battle.gold,85,'75 starting gold + 70 first-wave rewards - 60 upgrade');
  await page.screenshot({path:`${out}/fresh-390.png`});
  assert.deepEqual(errors,[]);results.push({kind:'fresh',lang:'en',width:390,starterBuild:true,firstWave:true,paidUpgrade:true,errors});
  console.log('fresh 390px: starter placement, first clear and paid upgrade passed');await context.close();
}finally{writeFileSync(`${out}/browser.json`,JSON.stringify(results,null,2)+'\n');await browser.close();}
