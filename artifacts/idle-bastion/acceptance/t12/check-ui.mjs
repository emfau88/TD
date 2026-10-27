import {chromium} from 'file:///C:/Users/madde/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
import assert from 'node:assert/strict';
import {writeFile} from 'node:fs/promises';
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
const results=[];
try {
 for(const [width,lang] of [[1280,'de'],[390,'en'],[320,'de']]) {
  const page=await browser.newPage({viewport:{width,height:850}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:5252/tests/browser/tavern-session.html');
  const slot=await page.evaluate(async lang=>{
   localStorage.setItem('spire-language-v1',lang);
   const {IdleBattle,BASE}=await import('/src/battle.ts');const {openBattleStore}=await import('/src/save-store.ts');
   const b=new IdleBattle();b.update(4);b.gold=12000;b.highestCleared=25;b.bossVictories=1;b.secondBossVictories=1;b.buildWorkshop();b.researchFrost();b.update(BASE.stepSeconds);b.wispArrival.met=true;b.discovery='off';b.tutorial.hidden=true;
   b.buildTavern(b.recommendedTavernPlot);b.upgradeTavern();b.recruitIlyra();b.ilyra.introduction='done';b.settlement.tavernSeen=true;
   b.social.points.mara=58;b.social.points.ilyra=35;
   for(const who of ['mara','ilyra']){b.social.reserves[who]={talk:3,touch:3,clears:0};b.social.personal[who]={clears:30,claimed:false};}
   b.social.gifts=0;
   if(!IdleBattle.restore(b.snapshot()))throw Error('invalid fixture');
   const slot='t12-ui-'+crypto.randomUUID();const store=await openBattleStore(undefined,'spire-idle-bastion-probe-'+slot);await store.save(b.snapshot(),true,0);store.close();return slot;
  },lang);
  await page.goto('http://127.0.0.1:5252/?probe='+slot);
  await page.locator('#boot-screen').waitFor({state:'hidden',timeout:60000});
  if(await page.locator('#claim-offline').isVisible())await page.locator('#claim-offline').click();
  await page.locator('#settlement-tab').click();
  assert.match(await page.locator('#settlement-tab').getAttribute('class'),/gift-ready/);
  assert.match(await page.locator('#tavern-gift-note').innerText(),/Mara/);
  await page.locator('#pick-tavern').click();
  const d=page.locator('#tavern-dialog');
  await d.locator('[data-do=ilyra]').click();
  await page.waitForFunction(()=>document.querySelector('.tv-figure canvas')?.dataset.clip==='idle');
  assert.match(await d.locator('[data-text=personal]').innerText(),/23/);
  assert.equal(await d.locator('[data-action=gift]').isDisabled(),true);
  await d.locator('[data-do=back]').click();await d.locator('[data-do=mara]').click();
  await page.waitForFunction(()=>document.querySelector('.tv-figure canvas')?.dataset.clip==='idle');
  assert.equal(await d.locator('[data-action=gift]').isEnabled(),true);
  assert.equal(await d.locator('.tv-bond-copy').evaluate(e=>e.scrollHeight<=e.clientHeight+1),true);
  await page.screenshot({path:'artifacts/idle-bastion/acceptance/t12/ui-'+width+'-'+lang+'-ready.png'});
  await d.locator('[data-action=gift]').focus();await page.keyboard.press('Enter');
  await page.waitForFunction(()=>document.querySelector('[data-text=points]')?.textContent?.includes('3 '));
  assert.equal(await d.locator('[data-action=gift]').isDisabled(),true);
  assert.match(await d.locator('[data-text=chapter]').innerText(),lang==='de'?/kommenden Update/:/future update/);
  assert.match(await d.locator('[data-do=new-moment]').innerText(),lang==='de'?/Haare/:/Hair/i);
  await d.locator('[data-do=touch]').click();
  await d.locator('[data-region=shoulder]').waitFor({state:'visible',timeout:30000});
  assert.equal(await d.locator('[data-region=shoulder]').isVisible(),true);assert.equal(await d.locator('[data-region=hair]').isVisible(),true);assert.equal(await d.locator('[data-region=hand]').isVisible(),false);
  await d.locator('[data-region=hair]').click();
  await page.waitForFunction(()=>document.querySelector('.tv-figure canvas')?.dataset.clip==='head');
  const close=await d.locator('[data-do=close]').first().boundingBox();assert.ok(close&&close.x>=0&&close.x+close.width<=width);
  assert.equal(await d.evaluate(e=>e.scrollWidth<=e.clientWidth+1),true);
  await page.screenshot({path:'artifacts/idle-bastion/acceptance/t12/ui-'+width+'-'+lang+'-complete.png'});
  await page.reload();await page.locator('#boot-screen').waitFor({state:'hidden',timeout:60000});if(await page.locator('#claim-offline').isVisible())await page.locator('#claim-offline').click();await page.locator('#settlement-tab').click();assert.doesNotMatch(await page.locator('#settlement-tab').getAttribute('class'),/gift-ready/);
  await page.locator('#pick-tavern').click();await d.locator('[data-do=mara]').click();await page.waitForFunction(()=>document.querySelector('.tv-figure canvas')?.dataset.clip==='idle');
  assert.match(await d.locator('[data-text=points]').innerText(),/^3 /);assert.equal(await d.locator('[data-action=gift]').isDisabled(),true);
  results.push({width,lang,personalBeforeAffectionRetained:true,keyboardGift:true,heartThreeReload:true,noHorizontalOverflow:true,errors});assert.deepEqual(errors,[]);
  await page.close();
 }
 await writeFile('artifacts/idle-bastion/acceptance/t12/ui-results.json',JSON.stringify(results,null,2));console.log(JSON.stringify(results));
}finally{await browser.close();}
