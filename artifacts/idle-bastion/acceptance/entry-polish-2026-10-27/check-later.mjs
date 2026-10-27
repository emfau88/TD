import {chromium} from 'file:///C:/Users/madde/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
import assert from 'node:assert/strict';import {writeFile} from 'node:fs/promises';
const out='artifacts/idle-bastion/acceptance/entry-polish-2026-10-27',results=[];
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
try{for(const width of [1440,390,320]){
 for(const kind of ['workshop','mara','cannon','gift']){
  const p=await browser.newPage({viewport:{width,height:900},isMobile:width<700,hasTouch:width<700});const errors=[];p.on('pageerror',e=>errors.push(e.message));
  await p.route('**/src/main.ts*',async r=>{const response=await r.fetch(),body=await response.text();await r.fulfill({response,body:body.replace('const audio = new GameAudio();','const audio = new GameAudio(); globalThis.__entryProbe = () => ({audio, scene, session});')});});
  await p.goto('http://127.0.0.1:5252/tests/browser/quick-wins-session.html');
  const seed=await p.evaluate(async kind=>{
   const {IdleBattle}=await import('/src/battle.ts'),{openBattleStore}=await import('/src/save-store.ts');
   let b;
   if(kind==='workshop'){
    b=IdleBattle.newGame();b.beginIntroduction();b.build(b.recommendedStarterPad);b.startDefense();
    for(let i=0;i<10000&&!b.workshopKitAvailable;i++){b.update(.025);if(b.introduction.stage==='upgrade'&&b.learningPaused)b.upgrade(b.towers[0].uid);}
    if(!b.workshopKitAvailable)throw Error('No workshop kit');
   }else if(kind==='gift'){
    b=new IdleBattle();b.update(4);b.gold=12000;b.highestCleared=25;b.bossVictories=1;b.secondBossVictories=1;
    b.buildWorkshop();b.researchFrost();b.update(.025);b.wispArrival.met=true;b.discovery='off';b.tutorial.hidden=true;
    if(!b.buildTavern(b.recommendedTavernPlot))throw Error('No tavern');
   }else{
    const {prepareQuickWinFixture}=await import('/tests/browser/quick-wins-session.ts');b=prepareQuickWinFixture('cannon').battle;
    b.discovery=kind==='mara'?'mara-wait':'cannon';
   }
   if(!IdleBattle.restore(b.snapshot()))throw Error('Invalid fixture '+kind);
   const slot='entry-'+crypto.randomUUID(),store=await openBattleStore(undefined,'spire-idle-bastion-probe-'+slot);
   await store.save(b.snapshot(),false,0);store.close();
   return {slot,plot:b.plots.workshop};
  },kind);
  await p.goto('http://127.0.0.1:5252/?probe='+seed.slot);
  await p.locator('#boot-screen').waitFor({state:'hidden',timeout:60000});
  const click=async sel=>{if(width<700)await p.locator(sel).tap();else await p.locator(sel).click();};
  if(await p.locator('#claim-offline').isVisible())await click('#claim-offline');
  await p.waitForTimeout(700);
  let data={};
  if(kind==='workshop'){
   await click('#settlement-tab');await click('#pick-workshop');
   const pt=await p.evaluate(()=>window.__entryProbe().scene.learningAnchor('workshop'));
   if(width<700)await p.touchscreen.tap(pt.x,pt.y);else await p.mouse.click(pt.x,pt.y);
   await p.waitForFunction(()=>window.__entryProbe().session.battle.settlement.workshopBuilt);
   data=await p.evaluate(()=>{const b=window.__entryProbe().session.battle;return {plot:b.plots.workshop,stage:b.introduction.stage};});
   assert.deepEqual(data.plot,seed.plot);
  }else if(kind==='mara'){
   data=await p.evaluate(()=>{const {scene,session}=window.__entryProbe();const c=scene.cameras.main.worldView,b=session.battle;return {mara:{x:b.mara.x,y:b.mara.y},view:{x:c.x,y:c.y,width:c.width,height:c.height},step:b.discovery};});
   assert.equal(data.step,'mara-wait');assert.ok(data.mara.x>=data.view.x&&data.mara.x<=data.view.x+data.view.width);
   assert.ok(await p.locator('#discovery-card [data-tutorial-progress]').isVisible());
  }else if(kind==='cannon'){
   await p.locator('#quick-win-hint').waitFor({state:'visible'});
   data=await p.locator('#quick-win-open').evaluate(e=>({height:e.getBoundingClientRect().height,frame:getComputedStyle(e,'::before').borderImageSource,primary:e.classList.contains('primary-action')}));
   assert.equal(data.primary,true);assert.ok(data.height>=44);assert.ok(data.frame.includes('gold-action'));
   assert.ok(await p.locator('#quick-win-hint [data-tutorial-progress]').isVisible());
  }else{
   await click('#settlement-tab');await p.locator('#pick-tavern').scrollIntoViewIfNeeded();
   assert.ok(await p.locator('#tavern-gift-badge').isVisible());
   data=await p.evaluate(()=>{const a=document.querySelector('#pick-tavern').getBoundingClientRect(),b=document.querySelector('#tavern-gift-badge').getBoundingClientRect(),tab=document.querySelector('#settlement-tab');return{card:{x:a.x,y:a.y,width:a.width,height:a.height},badge:{x:b.x,y:b.y,width:b.width,height:b.height},tabGift:tab.classList.contains('has-gifts')||tab.classList.contains('gift-ready')};});
   assert.equal(data.tabGift,false);assert.ok(data.badge.x+data.badge.width<=data.card.x+data.card.width);assert.ok(data.badge.y>=data.card.y);
  }
  await p.screenshot({path:out+'/'+kind+'-'+width+'.png'});
  assert.deepEqual(errors,[]);results.push({width,kind,data,errors});console.log('passed '+kind+' '+width);await p.close();
 }
}await writeFile(out+'/later-results.json',JSON.stringify(results,null,2)+'\n');}finally{await browser.close();}
