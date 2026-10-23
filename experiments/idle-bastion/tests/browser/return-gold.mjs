import assert from 'node:assert/strict';
import { readFileSync, writeFileSync } from 'node:fs';
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE);
const base=process.env.SPIRE_TEST_URL??'http://127.0.0.1:5202',out='artifacts/idle-bastion/acceptance/language';
const snapshot=JSON.parse(readFileSync('artifacts/idle-bastion/acceptance/b16/economy/two-storms-wave50-earned.json','utf8'));
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true}),report=[];
try {
 for(const width of [320,844,1440]) for(const lang of ['en','de']) for(const absence of [61234,28800000]) {
  const context=await browser.newContext({viewport:{width,height:width===844?390:width<700?844:960},isMobile:width<700});
  await context.addInitScript(()=>{Date.now=()=>2_000_000_000;});
  const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(base+'/stormlight-check.html');
  const seeded=await page.evaluate(async({snapshot,lang,absence})=>{
   const {IdleBattle}=await import('/src/battle.ts'),{certifyFarm}=await import('/src/farming.ts');
   const {openBattleStore}=await import('/src/save-store.ts');
   const {beginAbsence,reserveOffline,createOfflineState,offlinePolicy}=await import('/src/offline.ts');
   const b=IdleBattle.restore(snapshot),proof=certifyFarm(b),now=Date.now(),from=now-absence;
   const offline=reserveOffline(beginAbsence(createOfflineState(from),from,proof,false,offlinePolicy(true)),now);
   const slot='return-'+crypto.randomUUID(),store=await openBattleStore(indexedDB,'spire-idle-bastion-probe-'+slot);
   await store.save(b.snapshot(),false,0,{offline});store.close();localStorage.setItem('spire-language-v1',lang);
   return {slot,units:offline.pendingReward.amountUnits};
  },{snapshot,lang,absence});
  await page.goto(base+'/?probe='+seeded.slot);await page.waitForSelector('#return-card:not([hidden])');
  const headline=await page.locator('#return-gold').textContent();
  assert.equal(await page.locator('html').getAttribute('lang'),lang);
  assert.ok(!headline.includes('\n'));assert.ok(!/\d[.,]\d{3}/.test(headline),'No confusing long fractional string');
  if(absence===61234)assert.ok(!/million|Mio/.test(headline),'A small reward is never called millions');
  else assert.ok(/million|Mio/.test(headline),'A genuine large reward states its scale explicitly');
  await page.locator('#return-amount-details summary').click();
  const exact=await page.locator('#return-gold-exact').textContent();
  const whole=Math.floor(seeded.units/1000),fraction=seeded.units%1000;
  const expected='+'+String(whole).replace(/\B(?=(\d{3})+(?!\d))/g,'\u202f')+(fraction?(lang==='de'?',':'.')+String(fraction).padStart(3,'0').replace(/0+$/,''):'')+' '+(lang==='de'?'Gold':'gold');
  assert.equal(exact,expected);
  const bounds=await page.evaluate(()=>{
   const box=document.querySelector('.return-dialog').getBoundingClientRect(),range=document.createRange();range.selectNodeContents(document.querySelector('#return-gold'));const text=range.getBoundingClientRect();
   return {overflow:document.documentElement.scrollWidth>innerWidth,inside:text.left>=box.left+10&&text.right<=box.right-10,dialogFits:box.top>=0&&box.bottom<=innerHeight};
  });assert.deepEqual(bounds,{overflow:false,inside:true,dialogFits:true});assert.deepEqual(errors,[]);
  if(width===320&&absence===61234||width===1440&&absence===28800000&&lang==='en')await page.screenshot({path:out+`/return-${width}-${lang}.png`});
  report.push({width,lang,absence,units:seeded.units,headline,exact,bounds,errors});await context.close();
 }
} finally {await browser.close();}
writeFileSync(out+'/return-browser.json',JSON.stringify(report,null,2));console.log(JSON.stringify({cases:report.length,errors:report.flatMap(r=>r.errors)},null,2));
