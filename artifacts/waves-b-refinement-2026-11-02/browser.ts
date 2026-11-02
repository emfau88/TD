import {chromium} from 'file:///C:/Users/madde/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {IdleBattle} from '../../experiments/idle-bastion/src/battle';
import {certifyFarm,farmRewardUnits} from '../../experiments/idle-bastion/src/farming';
import {beginAbsence,createOfflineState,WAREHOUSE_OFFLINE} from '../../experiments/idle-bastion/src/offline';
const out='artifacts/waves-b-refinement-2026-11-02/browser',origin=process.argv[2]??'http://127.0.0.1:5197';mkdirSync(out,{recursive:true});
const legacy=JSON.parse(readFileSync('experiments/idle-bastion/tests/fixtures/wave-progression-v17.json','utf8'));
const currentRun=JSON.parse(readFileSync('artifacts/waves-b-refinement-2026-11-02/integrated/runs/mixed-fresh60.json','utf8'));
const current=IdleBattle.restore(currentRun.snapshots.firstPost25Loss)!;assert.ok(current);
current.update(.025);assert.ok(current.requestAdvance());
for(let i=0;i<2000&&!(current.phase==='wave'&&current.wave===35);i++)current.update(.025);
assert.equal(current.wave,35);assert.equal(current.phase,'wave');
for(let i=0;i<160;i++)current.update(.025);
const currentProof=certifyFarm(current)!;assert.ok(currentProof);
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
const results:any[]=[];
const money=(b:any)=>b.gold*1000+b.goldRemainderUnits;
const earned=(b:any)=>b.progress.battleGold*1000+b.rewardRemainderUnits;
async function readSave(page:any,name:string){return page.evaluate(async(name:string)=>{
  const db=await new Promise<IDBDatabase>((resolve,reject)=>{const q=indexedDB.open(name);q.onsuccess=()=>resolve(q.result);q.onerror=()=>reject(q.error);});
  const s=await new Promise<any>((resolve,reject)=>{const q=db.transaction('saves').objectStore('saves').get('default');q.onsuccess=()=>resolve(q.result);q.onerror=()=>reject(q.error);});db.close();return s;
},name);}
try{
  for(const [kind,width,lang] of [['current',1440,'de'],['legacy',390,'en']] as const){
    const context=await browser.newContext({viewport:{width,height:900},isMobile:width<700,hasTouch:width<700});
    const page=await context.newPage(),errors:string[]=[];
    page.on('pageerror',(e:Error)=>errors.push(e.message));
    page.on('response',(r:any)=>{if(r.url().startsWith(origin)&&r.status()>=400)errors.push(`${r.status()} ${r.url()}`);});
    await page.addInitScript((lang:string)=>{localStorage.setItem('spire-language-v1',lang);localStorage.setItem('spire-audio-mix-v1',JSON.stringify({muted:true,music:0,effects:0,voices:0}));},lang);
    await page.goto(origin+'/audio-credits.html');
    const battle=kind==='legacy'?legacy.before:current.snapshot(),proof=kind==='legacy'?legacy.proof:currentProof;
    const now=Date.now(),start=now-86400000;
    const seed={schemaVersion:2,revision:1,writtenAt:start,paused:false,battle,maraOfflineWelcomeSeen:true,
      offline:beginAbsence(createOfflineState(start),start,proof,false,WAREHOUSE_OFFLINE)};
    const slot=`waves-${kind}-${process.pid}`,name=`spire-idle-bastion-probe-${slot}`;
    await page.evaluate(async({name,seed}:any)=>{
      const db=await new Promise<IDBDatabase>((resolve,reject)=>{const q=indexedDB.open(name,1);q.onupgradeneeded=()=>q.result.createObjectStore('saves');q.onsuccess=()=>resolve(q.result);q.onerror=()=>reject(q.error);});
      await new Promise<void>((resolve,reject)=>{const tx=db.transaction('saves','readwrite');tx.objectStore('saves').put(seed,'default');tx.oncomplete=()=>resolve();tx.onerror=()=>reject(tx.error);});db.close();
    },{name,seed});
    await page.goto(`${origin}/?probe=${slot}`);await page.locator('#claim-offline').waitFor({timeout:60000});
    const before=await readSave(page,name),expected=Number(farmRewardUnits(proof)*260n*28800000n/(BigInt(proof.durationMs)*1000n));
    assert.equal(before.battle.schemaVersion,34);assert.equal(before.battle.rulesVersion,18);
    assert.equal(before.battle.waveRecipeVersion,kind==='legacy'?17:18);
    for(const key of ['wave','elapsed','enemies','queue','shots','towers'])assert.deepEqual(before.battle[key],battle[key]);
    assert.equal(before.offline.pendingReward.amountUnits,expected);assert.equal(before.offline.pendingReward.creditedMs,28800000);
    await page.reload();await page.locator('#claim-offline').waitFor({timeout:60000});
    const reloadedReceipt=(await readSave(page,name)).offline.pendingReward;
    for(const key of ['id','amountUnits','from','creditedMs','efficiencyPermille','limitMs'])assert.equal(reloadedReceipt[key],before.offline.pendingReward[key]);
    assert.ok(reloadedReceipt.elapsedMs>=before.offline.pendingReward.elapsedMs);
    await page.locator('#claim-offline').click();await page.locator('#return-card').waitFor({state:'hidden'});
    await page.waitForTimeout(5000);await page.locator('#pause').click();
    await page.waitForFunction(()=>document.querySelector('#pause')!.getAttribute('aria-pressed')==='true');
    const paused=await readSave(page,name);assert.equal(paused.paused,true);
    assert.equal(money(paused.battle)-money(before.battle)-(earned(paused.battle)-earned(before.battle)),expected);
    assert.ok(paused.battle.elapsed>before.battle.elapsed+3);
    assert.equal(paused.offline.baseline.certificate.rulesVersion,18);assert.equal(paused.offline.baseline.efficiencyPermille,260);
    await page.screenshot({path:`${out}/${kind}-${width}.png`});
    await page.reload();await page.locator('#boot-screen').waitFor({state:'hidden',timeout:60000});
    const again=await readSave(page,name);assert.equal(money(again.battle),money(paused.battle));assert.equal(again.paused,true);
    assert.equal(again.offline.pendingReward?.amountUnits??0,0);
    assert.deepEqual(again.battle,paused.battle);
    if(kind==='current'){
      if(await page.locator('#return-card').isVisible())await page.locator('#claim-offline').click();
      await page.locator('#pause').click();
      await page.waitForFunction(()=>document.querySelector('#pause')!.getAttribute('aria-pressed')==='false');
      for(const hero of ['mara','ilyra']){
        await page.locator(`#pick-${hero}`).click();
        for(const enabled of [false,true]){
          await page.locator(`#${hero}-auto`).click();
          await page.waitForFunction(({hero,enabled})=>document.getElementById(`${hero}-auto`)!.getAttribute('aria-pressed')===String(enabled),{hero,enabled});
          assert.equal((await readSave(page,name)).battle[hero].autoCast,enabled);
        }
        await page.screenshot({path:`${out}/${hero}-auto.png`});await page.locator('#close-context').click();
      }
      await page.locator('#pause').click();
      await page.waitForFunction(()=>document.querySelector('#pause')!.getAttribute('aria-pressed')==='true');
      await page.reload();await page.locator('#boot-screen').waitFor({state:'hidden',timeout:60000});
      const settings=await readSave(page,name);assert.equal(settings.battle.mara.autoCast,true);assert.equal(settings.battle.ilyra.autoCast,true);
    }
    assert.deepEqual(errors,[]);
    results.push({kind,width,lang,wave:battle.wave,recipe:battle.waveRecipeVersion,gold:expected/1000,seconds:paused.battle.elapsed-before.battle.elapsed,exactCombatReload:true,autoButtonsAndReload:kind==='current',errors});
    console.log(`${kind}: W${battle.wave}, exact 24h claim, old/new recipe, combat, pause and reload passed`);await context.close();
  }
}finally{writeFileSync(`${out}/results.json`,JSON.stringify(results,null,2)+'\n');await browser.close();}
