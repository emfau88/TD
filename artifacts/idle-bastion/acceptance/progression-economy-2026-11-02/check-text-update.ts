/** Local production copy check, using isolated probe saves only. */
import { chromium } from 'file:///C:/Users/madde/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
import assert from 'node:assert/strict';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { IdleBattle } from '../../../../experiments/idle-bastion/src/battle';
import { certifyFarm } from '../../../../experiments/idle-bastion/src/farming';
import { beginAbsence, createOfflineState, WAREHOUSE_OFFLINE, LEGACY_WAREHOUSE_OFFLINE } from '../../../../experiments/idle-bastion/src/offline';
const dir='artifacts/idle-bastion/acceptance/progression-economy-2026-11-02',out=dir+'/text-update';
mkdirSync(out,{recursive:true});
const fixture=JSON.parse(readFileSync('experiments/idle-bastion/tests/fixtures/progression-economy-v16.json','utf8'));
const farm=JSON.parse(readFileSync(dir+'/runs/relaxed-fresh.json','utf8')).final;
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
const results:any[]=[],origin='http://127.0.0.1:5268';
try {
  for(const lang of ['de','en'])for(const kind of ['legacy','current','farm']){
    const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
    const page=await context.newPage(),errors:string[]=[];
    page.on('pageerror',(error:Error)=>errors.push(error.message));
    page.on('response',(response:any)=>{if(response.status()>=400&&response.url().startsWith(origin))errors.push(`${response.status()} ${response.url()}`);});
    await page.addInitScript((lang:string)=>{localStorage.setItem('spire-language-v1',lang);localStorage.setItem('spire-audio-mix-v1',JSON.stringify({muted:true,music:.16,effects:.4,voices:.7}));},lang);
    const battle=IdleBattle.restore(kind==='farm'?farm:fixture.before)!;assert.ok(battle);
    if(kind==='current'){const attempt=battle.attemptId;for(let i=0;i<16000&&battle.attemptId===attempt;i++)battle.update(.025);}
    if(kind==='farm'){assert.equal(battle.mode,'farm');assert.ok(battle.progress.lastDefeat);}
    const proof=kind==='legacy'?fixture.proof:certifyFarm(battle)!;
    const start=Date.now()-86400000,policy=kind==='legacy'?LEGACY_WAREHOUSE_OFFLINE:WAREHOUSE_OFFLINE;
    const seed={schemaVersion:2,revision:1,writtenAt:start,paused:kind==='farm',battle:battle.snapshot(),offline:beginAbsence(createOfflineState(start),start,proof,kind==='farm',policy)};
    const slot=`copy-${kind}-${lang}-${process.pid}`,name=`spire-idle-bastion-probe-${slot}`;
    await page.goto(origin+'/audio-credits.html');
    await page.evaluate(async({name,seed}:any)=>{
      const db=await new Promise<IDBDatabase>((resolve,reject)=>{const q=indexedDB.open(name,1);q.onupgradeneeded=()=>q.result.createObjectStore('saves');q.onsuccess=()=>resolve(q.result);q.onerror=()=>reject(q.error);});
      await new Promise<void>((resolve,reject)=>{const tx=db.transaction('saves','readwrite');tx.objectStore('saves').put(seed,'default');tx.oncomplete=()=>resolve();tx.onerror=()=>reject(tx.error);});db.close();
    },{name,seed});
    await page.goto(`${origin}/?probe=${slot}`);await page.locator('#claim-offline').waitFor({timeout:60000});
    const basis=await page.locator('#return-basis').innerText();
    const legacyText=lang==='de'?'Diese Abwesenheit wird noch nach den früheren Regeln vergütet.':'This absence is still paid under the previous rules.';
    assert.equal(basis.includes(legacyText),kind==='legacy');
    if(kind==='legacy')await page.screenshot({path:`${out}/legacy-${lang}-390.png`});
    await page.locator('#claim-offline').click();await page.locator('#return-card').waitFor({state:'hidden'});
    let fallback='';
    if(kind==='farm'){
      await page.locator('#fallback-note').waitFor();fallback=await page.locator('#fallback-copy').innerText();
      assert.match(fallback,/10\s?%/);assert.ok(fallback.includes(lang==='de'?'Gold und Ausbau bleiben erhalten':'gold and upgrades are preserved'));
      const box=await page.locator('#fallback-note').boundingBox();assert.ok(box&&box.x>=0&&box.x+box.width<=391&&box.y>=0&&box.y+box.height<=844);
      assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
      await page.screenshot({path:`${out}/farm-${lang}-390.png`});
      await page.locator('#dismiss-fallback').click();await page.locator('#fallback-note').waitFor({state:'hidden'});
    }
    await page.locator('#gold-summary').click();
    const rate=await page.locator('#journal-rate-note').innerText(),boss=await page.locator('.boss-record').innerText(),enemy=await page.locator('.enemy-record').innerText();
    assert.ok(rate.includes(lang==='de'?'Noch nicht geschaffte Wellen':'Waves you have not cleared yet'));
    assert.ok(boss.includes(lang==='de'?'bereits enthalten':'already included'));
    assert.ok(enemy.includes(lang==='de'?'Alle Turmtypen':'All tower types'));
    assert.ok(!enemy.includes('Alle vier'));assert.deepEqual(errors,[]);
    results.push({lang,kind,basis,fallback,rate,boss,enemy,errors});await context.close();console.log(`PASS ${kind} ${lang}: current production copy, conditional legacy note, mobile layout and journal`);
  }
}finally{writeFileSync(out+'/browser.json',JSON.stringify(results,null,2)+'\n');await browser.close();}
