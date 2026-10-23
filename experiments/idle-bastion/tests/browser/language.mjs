// Isolated Chrome / native IndexedDB language and layout regression checks.
import assert from 'node:assert/strict';
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE);
import { readFileSync,writeFileSync,mkdirSync } from 'node:fs';
const base=process.env.SPIRE_TEST_URL??'http://127.0.0.1:5202',out='artifacts/idle-bastion/acceptance/language';mkdirSync(out,{recursive:true});
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
const snapshot=JSON.parse(readFileSync('artifacts/idle-bastion/acceptance/b16/economy/two-storms-wave50-earned.json','utf8'));
const report=[];
const captures=new Set(['catalog-390-de.png','menu-390-de.png','settlement-768-en.png','settlement-844-en.png','tavern-390-en.png']);
async function capture(page,name) { if(captures.has(name))await page.screenshot({path:out+'/'+name}); }
// Dispatch the real select handler, including while another modal is open.
// Importing a second dev-module URL after HMR would test a different singleton.
async function chooseLanguage(page, lang) {
 await page.locator('#language-choice').evaluate((select,lang)=>{select.value=lang;select.dispatchEvent(new Event('change'));},lang);
 assert.equal(await page.locator('html').getAttribute('lang'),lang);
}
async function inspect(page,view){return await page.evaluate(view=>{
 const visible=e=>!!e.getClientRects().length&&getComputedStyle(e).visibility!=='hidden'&&!e.closest('[hidden]');
 const issues=[];
 for(const el of document.querySelectorAll('.build-card strong,.build-card b,.build-card small,.context-tabs button,.action-stack button,.tv-actions button,.tutorial-actions button,.language-settings select')){
  if(!visible(el))continue;
  if(el.scrollWidth>el.clientWidth+2)issues.push({type:'element',text:el.textContent?.trim(),id:el.id,w:el.clientWidth,scroll:el.scrollWidth});
  const card=el.closest('.build-card');if(card){const box=card.getBoundingClientRect(),range=document.createRange();range.selectNodeContents(el);const rect=range.getBoundingClientRect();if(rect.right>box.right-3||rect.left<box.left+3||rect.top<box.top+2||rect.bottom>box.bottom-2)issues.push({type:'card',text:el.textContent?.trim(),id:card.id,over:Math.round(Math.max(rect.right-box.right,box.left-rect.left,box.top-rect.top,rect.bottom-box.bottom))});}
 }
 return {view,lang:document.documentElement.lang,bodyOverflow:document.documentElement.scrollWidth>innerWidth,issues,visibleText:document.body.innerText};
},view);}
try {for(const width of [320,390,768,844,1440]){
 const context=await browser.newContext({viewport:{width,height:width===844?390:width<700?844:960},isMobile:width<700,hasTouch:width<700,locale:'de-DE'}),page=await context.newPage(),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.goto(base+'/stormlight-check.html');
 if ([390,1440].includes(width)) {
  const native = await page.evaluate(async snapshot => {
   const {openBattleStore}=await import('/src/save-store.ts'),{BattleSession}=await import('/src/battle-session.ts');
   const {IdleBattle}=await import('/src/battle.ts'),{certifyFarm}=await import('/src/farming.ts');
   const {beginAbsence,reserveOffline,createOfflineState,offlinePolicy}=await import('/src/offline.ts');
   const {setLanguage}=await import('/src/i18n.ts');
   const b=IdleBattle.restore(snapshot),proof=certifyFarm(b),now=61000;
   const offline=reserveOffline(beginAbsence(createOfflineState(1000),1000,proof,false,offlinePolicy(true)),now);
   const pending=structuredClone(offline.pendingReward),name='spire-idle-bastion-probe-language-'+crypto.randomUUID();
   let store=await openBattleStore(indexedDB,name,()=>now);
   await store.save(b.snapshot(),false,0,{offline});store.close();
   store=await openBattleStore(indexedDB,name,()=>now);
   let session=await BattleSession.open(store,{now:()=>now,locks:null});
   const before=JSON.stringify(session.battle.snapshot()),certificate=JSON.stringify(session.certificate);
   setLanguage('de');setLanguage('en');
   if (JSON.stringify(session.battle.snapshot())!==before||JSON.stringify(session.certificate)!==certificate)throw Error('Language changed live battle or certificate');
   if (JSON.stringify(session.pendingReward)!==JSON.stringify(pending))throw Error('Historical receipt changed');
   const gold=session.battle.gold*1000+session.battle.goldRemainderUnits;
   if (!await session.claimOffline())throw Error('Claim failed');setLanguage('de');
   if (await session.claimOffline())throw Error('Duplicate claim after language change');
   const credited=session.battle.gold*1000+session.battle.goldRemainderUnits-gold;
   if(credited!==pending.amountUnits)throw Error('Incorrect claim amount');
   const saved=JSON.stringify(session.battle.snapshot());await session.close();
   setLanguage('en');store=await openBattleStore(indexedDB,name,()=>now);session=await BattleSession.open(store,{now:()=>now,locks:null});
   if(JSON.stringify(session.battle.snapshot())!==saved)throw Error('Reload changed battle');
   if(session.pendingReward?.amountUnits>0)throw Error('Duplicate receipt');await session.close();
   return {farmWave:proof.wave,creditedUnits:credited,exactReload:true,languageIndependentProof:true,doubleCredit:false};
  },snapshot);
  report.push({width,native});
 }
 const slot='language-paid-'+width;
 await page.evaluate(async ({slot,snapshot})=>{
  const {openBattleStore}=await import('/src/save-store.ts');const {createOfflineState}=await import('/src/offline.ts');
  const store=await openBattleStore(indexedDB,'spire-idle-bastion-probe-'+slot);const now=Date.now(),offline=createOfflineState(now);offline.baseline.paused=true;
  await store.save(snapshot,true,0,{offline});store.close();
 },{slot,snapshot});
 await page.goto(base+'/?probe='+slot);await page.waitForSelector('#game canvas');await page.waitForTimeout(500);
 if(await page.locator('#claim-offline').isVisible())await page.locator('#claim-offline').click();
 for(const lang of ['en','de']){
  await chooseLanguage(page,lang);await page.waitForTimeout(100);
  report.push({width,...await inspect(page,'battle')});
  for(const tab of ['tower-tab','settlement-tab']){await page.locator('#'+tab).click();report.push({width,...await inspect(page,tab)});if(tab==='settlement-tab'&&[768,844].includes(width)){await capture(page,`settlement-${width}-${lang}.png`);}if(tab==='tower-tab'&&[390,1440].includes(width)){await page.locator('#pick-storm').scrollIntoViewIfNeeded();await capture(page,`catalog-${width}-${lang}.png`);}}
  await page.locator('#open-menu').click();await page.locator('#language-choice').selectOption(lang==='en'?'de':'en');await page.locator('#language-choice').selectOption(lang);assert.equal(await page.locator('html').getAttribute('lang'),lang);report.push({width,...await inspect(page,'menu')});await capture(page,`menu-${width}-${lang}.png`);await page.locator('#close-menu').click();
  await page.locator('#wave-summary').click();assert.ok((await page.locator('#journal-enemy-roster').textContent()).includes(lang==='en'?'Leaf Beetle':'Blattkäfer'));report.push({width,...await inspect(page,'chronicle')});await page.locator('#close-progress').click();
  await page.locator('#tower-tab').click();
  await page.locator('#pad-choice').selectOption(snapshot.towers.find(t=>t.kind===5).padId,{force:true});report.push({width,...await inspect(page,'stormlight')});await page.locator('#close-context').click();
  await page.locator('#settlement-tab').click();await page.locator('#pick-tavern').scrollIntoViewIfNeeded();await page.locator('#pick-tavern').click();
  await page.waitForSelector('#tavern-dialog[open]');report.push({width,...await inspect(page,'tavern')});
  await page.locator('#tavern-dialog [data-do=mara]').click();await page.waitForTimeout(400);report.push({width,...await inspect(page,'mara')});
  if(width!==320)await capture(page,`tavern-${width}-${lang}.png`);
  await chooseLanguage(page,lang==='en'?'de':'en');
  const otherLine=await page.locator('#tavern-dialog [data-text=line]').textContent();
  await chooseLanguage(page,lang);
  assert.notEqual(await page.locator('#tavern-dialog [data-text=line]').textContent(),otherLine,JSON.stringify({width,lang,errors,domLang:await page.locator('html').getAttribute('lang')}));
  await page.locator('#tavern-dialog [data-do=back]').click();
  await page.locator('#tavern-dialog [data-do=ilyra]').click();await page.waitForTimeout(200);report.push({width,...await inspect(page,'ilyra')});
  await page.locator('#tavern-dialog [data-do=close]').first().click();
 }
 await page.reload();await page.waitForSelector('#game canvas');assert.equal(await page.locator('html').getAttribute('lang'),'de');
 report.push({width,errors,preferenceReload:true});await context.close();
}}finally{writeFileSync(out+'/layout-browser.json',JSON.stringify(report.map(({visibleText,...rest})=>rest),null,2));await browser.close();}
const issues=report.filter(r=>r.bodyOverflow||r.issues?.length||r.errors?.length);
console.log(JSON.stringify({samples:report.length,issues:issues.map(({visibleText,...rest})=>rest),native:report.filter(r=>r.native)},null,2));
assert.deepEqual(issues,[],'No browser errors or text outside measured card boundaries');
