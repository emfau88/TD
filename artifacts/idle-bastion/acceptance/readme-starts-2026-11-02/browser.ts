import assert from 'node:assert/strict';
import { mkdirSync, writeFileSync } from 'node:fs';
import { chromium } from 'file:///C:/Users/madde/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
import { IdleBattle } from '../../../../experiments/idle-bastion/src/battle';
import { createOfflineState } from '../../../../experiments/idle-bastion/src/offline';
const origin = process.argv[2] ?? 'http://127.0.0.1:5199';
const out = process.argv[3] ?? 'artifacts/idle-bastion/acceptance/readme-starts-2026-11-02/local';
mkdirSync(out, { recursive: true });
const browser = await chromium.launch({ headless: true, executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
const results: unknown[] = [];
try {
  for (const [width,height,lang] of [[1440,900,'en'],[844,390,'de']] as const) {
    const touch=width<1000, context=await browser.newContext({viewport:{width,height},isMobile:touch,hasTouch:touch}), page=await context.newPage();
    const errors:string[]=[];
    page.on('pageerror', e=>errors.push(e.message)); page.on('response', r=>{if(r.status()>=400)errors.push(`${r.status()} ${r.url()}`);});
    await page.addInitScript(lang=>{localStorage.setItem('spire-language-v1',lang);localStorage.setItem('spire-audio-mix-v1',JSON.stringify({muted:true,music:0,effects:0,voices:0}));},lang);
    await page.goto(origin+'/audio-credits.html');
    const now=Date.now(), main={schemaVersion:2,revision:7,writtenAt:now,paused:true,battle:IdleBattle.newGame().snapshot(),offline:createOfflineState(now)};
    await page.evaluate(async main=>new Promise<void>((resolve,reject)=>{
      const q=indexedDB.open('spire-idle-bastion',1);q.onupgradeneeded=()=>q.result.createObjectStore('saves');q.onerror=()=>reject(q.error);
      q.onsuccess=()=>{const db=q.result,tx=db.transaction('saves','readwrite');tx.objectStore('saves').put(main,'default');tx.oncomplete=()=>{db.close();resolve();};tx.onerror=()=>reject(tx.error);};
    }),main);
    const read=(name:string)=>page.evaluate(async name=>new Promise<any>((resolve,reject)=>{
      const q=indexedDB.open(name);q.onerror=()=>reject(q.error);q.onsuccess=()=>{const db=q.result,r=db.transaction('saves').objectStore('saves').get('default');r.onsuccess=()=>{db.close();resolve(r.result);};r.onerror=()=>reject(r.error);};
    }),name);
    const probes=new Set<string>();
    for(const scenario of ['boss','ilyra-unlock','boss'] as const){
      await page.goto(`${origin}/feature-check.html?scenario=${scenario}`);
      await page.waitForURL(/\?probe=review-/,{timeout:60000});
      await page.locator('#boot-screen').waitFor({state:'hidden',timeout:60000});
      if(await page.locator('#claim-offline').isVisible())await page.locator('#claim-offline').click();
      const slot=new URL(page.url()).searchParams.get('probe')!;assert.ok(!probes.has(slot));probes.add(slot);
      const name='spire-idle-bastion-probe-'+slot, initial=await read(name);
      assert.equal(initial.paused,true);assert.equal(await page.locator('#pause').getAttribute('aria-pressed'),'true');
      if(scenario==='boss'){
        assert.equal(initial.battle.wave,15);assert.equal(initial.battle.bossVictories,0);
        await page.locator('#pause').click();await page.waitForFunction(()=>document.querySelector('#pause')?.getAttribute('aria-pressed')==='false');
        await page.waitForTimeout(1500);await page.locator('#pause').click();
        await page.waitForFunction(()=>document.querySelector('#pause')?.getAttribute('aria-pressed')==='true');
        const active=await read(name);assert.ok(active.battle.elapsed>initial.battle.elapsed);assert.ok(active.battle.enemies.length>0);
      }else{
        assert.equal(initial.battle.highestCleared,25);assert.equal(initial.battle.settlement.tavernLevel,2);assert.equal(initial.battle.ilyra,null);
        await page.locator('#settlement-tab').click();await page.locator('#pick-tavern').click();await page.locator('[data-do=ilyra]').click();
        await page.locator('#recruit-ilyra').click();
        await page.waitForFunction(()=>!document.querySelector('#ilyra-commands')?.hasAttribute('hidden'));
        const recruited=await read(name);assert.equal(recruited.battle.ilyra?.introduction,'move');
        await page.reload();await page.locator('#boot-screen').waitFor({state:'hidden',timeout:60000});
        if(await page.locator('#claim-offline').isVisible())await page.locator('#claim-offline').click();
        assert.ok((await read(name)).battle.ilyra,'recruitment survives reload');
      }
      assert.deepEqual(await read('spire-idle-bastion'),main);assert.deepEqual(errors,[]);
      await page.screenshot({path:`${out}/${width}-${scenario}.png`});
      results.push({width,height,lang,scenario,wave:initial.battle.wave,paused:initial.paused,uniqueSlot:true,mainUnchanged:true,errors:[...errors]});
      writeFileSync(out+'/results.json',JSON.stringify(results,null,2));console.log(`${width} ${scenario} OK`);
    }
    await context.close();
  }
}finally{await browser.close();}
