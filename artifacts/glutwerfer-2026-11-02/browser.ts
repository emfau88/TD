import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';
import {chromium} from 'file:///C:/Users/madde/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
import {IdleBattle,EMBER_BURN} from '../../experiments/idle-bastion/src/battle';
import {createOfflineState} from '../../experiments/idle-bastion/src/offline';
import {offline} from './simulate';
const origin=(process.argv[2]??'http://127.0.0.1:5198').replace(/\/$/,''),out=process.argv[3]??'artifacts/glutwerfer-2026-11-02/browser';mkdirSync(out,{recursive:true});
const archive=JSON.parse(gunzipSync(readFileSync('artifacts/glutwerfer-2026-11-02/evidence.json.gz')).toString());
const control=archive.candidates.final['mixed-control60'];
// The W30 locked sample comes from the actual previous Main save (schema 34).
control.snapshots.clear30=archive.baseline.mixed.snapshots.clear30;
const earned=offline(control.snapshots.clear34,24).snapshot;
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'}),results:any[]=[];
async function readSave(page:any,name:string){return page.evaluate(async(name:string)=>new Promise<any>((resolve,reject)=>{const q=indexedDB.open(name);q.onerror=()=>reject(q.error);q.onsuccess=()=>{const db=q.result,r=db.transaction('saves').objectStore('saves').get('default');r.onsuccess=()=>{db.close();resolve(r.result);};r.onerror=()=>reject(r.error);};}),name);}
const money=(b:any)=>b.gold*1000+b.goldRemainderUnits, gains=(b:any)=>b.progress.battleGold*1000+b.rewardRemainderUnits;
try{
 for(const [width,lang] of [[1440,'de'],[390,'en']] as const){
  const context=await browser.newContext({viewport:{width,height:900},isMobile:width<700,hasTouch:width<700}),page=await context.newPage(),errors:string[]=[];
  page.on('pageerror',(e:Error)=>errors.push(e.message));page.on('response',(r:any)=>{if(r.url().startsWith(origin)&&r.status()>=400)errors.push(`${r.status()} ${r.url()}`);});
  await page.addInitScript((lang:string)=>{localStorage.setItem('spire-language-v1',lang);localStorage.setItem('spire-audio-mix-v1',JSON.stringify({muted:true,music:0,effects:0,voices:0}));},lang);
  async function seed(sample:string,battle:any){console.log('seed',width,sample);
   assert.ok(IdleBattle.restore(battle));await page.goto(origin+'/audio-credits.html');
   const slot=`ember-${width}-${sample}-${process.pid}`,name=`spire-idle-bastion-probe-${slot}`,now=Date.now(),off=createOfflineState(now);off.baseline.paused=true;
   await page.evaluate(async({name,battle,now,off}:any)=>new Promise<void>((resolve,reject)=>{const q=indexedDB.open(name,1);q.onupgradeneeded=()=>q.result.createObjectStore('saves');q.onerror=()=>reject(q.error);q.onsuccess=()=>{const db=q.result,tx=db.transaction('saves','readwrite');tx.objectStore('saves').put({schemaVersion:2,revision:1,writtenAt:now,paused:true,battle,offline:off,maraOfflineWelcomeSeen:true},'default');tx.oncomplete=()=>{db.close();resolve();};tx.onerror=()=>reject(tx.error);};}),{name,battle,now,off});
   await page.goto(`${origin}/?probe=${slot}`);await page.locator('#game canvas').waitFor({timeout:60000});await page.locator('#boot-screen').waitFor({state:'hidden',timeout:60000});
   if(await page.locator('#claim-offline').isVisible())await page.locator('#claim-offline').click();
   await page.waitForFunction(()=>!(document.querySelector('#pause') as HTMLButtonElement).disabled);assert.equal(await page.locator('#pause').getAttribute('aria-pressed'),'true');return name;
  }
  async function workshop(){await page.locator('#settlement-tab').click();await page.locator('#pick-workshop').click();}
  async function pausedReload(name:string){const before=await readSave(page,name);assert.ok(IdleBattle.restore(before.battle));assert.equal(before.paused,true);await page.reload();await page.locator('#boot-screen').waitFor({state:'hidden',timeout:60000});await page.waitForTimeout(200);assert.deepEqual((await readSave(page,name)).battle,before.battle);if(await page.locator('#claim-offline').isVisible())await page.locator('#claim-offline').click();assert.equal(await page.locator('#pause').getAttribute('aria-pressed'),'true');return before;}
  // A new Glut entry must not steal an explicit click on locked Sturmlicht.
  let name=await seed('explicit-choice',archive.candidates.final['relaxed-control60'].snapshots.clear34);
  await page.locator('#pick-storm').scrollIntoViewIfNeeded();await page.locator('#pick-storm').click();assert.equal(await page.locator('#tech-storm').getAttribute('aria-pressed'),'true');assert.ok(await page.locator('#research-ember').isHidden());assert.equal((await readSave(page,name)).battle.settlement.emberResearchSeen,false);await page.locator('#close-context').click();await workshop();assert.equal(await page.locator('#tech-ember').getAttribute('aria-pressed'),'true');await page.waitForFunction(()=>!document.querySelector('#pick-workshop')?.classList.contains('new-building'));
  if(process.env.EMBER_NOTICE_ONLY==='1'){assert.deepEqual(errors,[]);results.push({width,lang,explicitChoicePreserved:true,newSeenOnlyWhenViewed:true,errors});console.log(JSON.stringify(results.at(-1)));await context.close();continue;}
  const locked=control.snapshots.clear30;name=await seed('locked',locked);assert.equal(await page.locator('#pick-workshop').evaluate((e:any)=>e.classList.contains('new-building')),false);await workshop();await page.locator('#tech-ember').click();assert.ok(await page.locator('#research-ember').isDisabled());assert.ok((await page.locator('#research-details').innerText()).includes('34'));assert.equal((await readSave(page,name)).battle.settlement.emberResearchSeen,false);
  const poor=IdleBattle.restore(control.snapshots.clear34)!.snapshot();assert.ok(poor.gold<EMBER_BURN.researchCost);name=await seed('new-poor',poor);
  assert.ok(await page.locator('#pick-workshop').evaluate((e:any)=>e.classList.contains('new-building')));assert.ok((await page.locator('#settlement-tab').getAttribute('aria-label'))!.includes(lang==='de'?'Neue Forschung':'New research'));
  await page.screenshot({path:`${out}/new-${width}.png`});await workshop();await page.locator('#ember-saving').waitFor();assert.ok(await page.locator('#research-ember').isDisabled());await page.waitForFunction(()=>!document.querySelector('#pick-workshop')?.classList.contains('new-building'));
  await page.screenshot({path:`${out}/saving-${width}.png`});await page.locator('#close-context').click();assert.equal((await pausedReload(name)).battle.settlement.emberResearchSeen,true);assert.equal(await page.locator('#pick-workshop').evaluate((e:any)=>e.classList.contains('new-building')),false);
  name=await seed('purchase',earned);await page.locator('#pause').click();await workshop();await page.locator('#research-ember').click();await page.waitForFunction(()=>document.querySelector('#tech-ember-status')!.textContent!.includes('✓'));
  await page.locator('#close-context').click();await page.locator('#tower-tab').click();await page.locator('#pick-ember').scrollIntoViewIfNeeded();await page.locator('#pick-ember').click();await page.waitForFunction(()=>document.querySelector('#pick-ember')!.getAttribute('aria-pressed')==='true');await page.locator('#cancel-placement').click();await page.locator('#pad-choice').selectOption('cell-10-3',{force:true});await page.locator('#build-ember').click();await page.locator('#context-panel').waitFor({state:'hidden'});await page.locator('#pause').click();
  await page.waitForFunction(()=>document.querySelector('#pause')!.getAttribute('aria-pressed')==='true');const saved=await pausedReload(name);assert.ok(saved.battle.settlement.emberResearched);assert.ok(saved.battle.towers.some((t:any)=>t.kind===7));assert.equal(money(saved.battle)-money(earned)-(gains(saved.battle)-gains(earned)),-5220000);
  await page.locator('#pad-choice').selectOption('cell-10-3',{force:true});await page.locator('#tower-role').filter({hasText:lang==='de'?'Brand':'burn'}).waitFor();assert.ok((await page.locator('#tower-stats').innerText()).includes(lang==='de'?'Brand pro Sekunde':'Burn per second'));await page.screenshot({path:`${out}/tower-${width}.png`});
  // Later original sprite stages use the same earned return wallet, with every upgrade paid.
  for(const level of [4,7]){
   const b=IdleBattle.restore(earned)!;assert.ok(b.researchEmber());const tower=b.build('cell-10-3',7)!;assert.ok(tower);while(tower.level<level)assert.ok(b.upgrade(tower.uid));
   let burned=false;for(let n=0;n<3200;n++){b.update(.025);if(b.enemies.some(e=>e.burn)){burned=true;break;}}assert.ok(burned);
   name=await seed('stage'+level,b.snapshot());await page.locator('#pad-choice').selectOption(tower.padId,{force:true});await page.locator('#close-context').click();await page.screenshot({path:`${out}/combat-l${level}-${width}.png`});
   await page.locator('#pause').click();await page.waitForTimeout(2300);await page.locator('#pause').click();await pausedReload(name);
  }
  assert.ok(await page.evaluate(()=>document.body.scrollWidth<=innerWidth));assert.deepEqual(errors,[]);results.push({width,lang,explicitChoicePreserved:true,locked:true,newWithoutMoney:true,seenPersists:true,researchAndBuildPaid:5220,exactPausedReload:true,originalStages:[1,2,3],errors});console.log(JSON.stringify(results.at(-1)));await context.close();
 }
}finally{writeFileSync(`${out}/results.json`,JSON.stringify(results,null,2)+'\n');await browser.close();}
