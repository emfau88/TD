import {chromium} from 'file:///C:/Users/madde/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
import {readFile,writeFile} from 'node:fs/promises';import assert from 'node:assert/strict';
const snapshots=JSON.parse(await readFile('artifacts/idle-bastion/acceptance/early-balance-release/selected/B-snapshots.json','utf8'));
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true}),results=[];
try{
for(const who of ['mara','ilyra']){
 const page=await browser.newPage({viewport:{width:who==='mara'?1280:390,height:850}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:5252/tests/browser/tavern-session.html');
 await page.evaluate(async({snapshot,who})=>{
  const {IdleBattle}=await import('/src/battle.ts'),{BattleSession}=await import('/src/battle-session.ts'),{openBattleStore}=await import('/src/save-store.ts'),{TavernUI}=await import('/src/tavern-ui.ts'),{rigPreviewPresentation}=await import('/src/tavern-rig-preview.ts');
  await import('/src/battle.css');await import('/src/premium.css');
  const b=IdleBattle.restore(snapshot);if(!b)throw Error('Historical source invalid');
  if(!b.buildTavern(b.recommendedTavernPlot))throw Error('Tavern unavailable');
  if(who==='ilyra'&&(!b.upgradeTavern()||!b.recruitIlyra()))throw Error('Ilyra unavailable');
  b.wispArrival.met=true;b.discovery='off';b.tutorial.hidden=true;b.mode='farm';b.setFarmWave(who==='mara'?14:24);
  if(b.ilyra)b.ilyra.introduction='done';
  const db='spire-idle-bastion-probe-t12-flow-'+crypto.randomUUID();let store=await openBattleStore(undefined,db);await store.save(b.snapshot(),true,0);store.close();
  let session=await BattleSession.open(await openBattleStore(undefined,db));
  async function resume(){if(session.pendingReward)await session.claimOffline();if(session.awaitingResume)await session.resumeActive();}
  await resume();const heartbeat=setInterval(()=>void session.heartbeat(),1000);document.body.replaceChildren();
  const ui=new TavernUI({session:()=>session,presentation:rigPreviewPresentation,navigate:()=>{}});session.onChange=()=>ui.update();ui.open();ui.dialog.querySelector('[data-do='+who+']').click();
  window.t12={who,db,ui,heartbeat,get session(){return session},notices:[],clears:[],async reload(){const before=JSON.stringify(session.battle.social);await session.close();session=await BattleSession.open(await openBattleStore(undefined,db));await resume();session.onChange=()=>ui.update();ui.update();if(before!==JSON.stringify(session.battle.social))throw Error('Social changed on reload');}};
 },{snapshot:snapshots[who==='mara'?'clear15':'clear25'],who});
 const d=page.locator('#tavern-dialog');
 await page.waitForFunction(()=>document.querySelector('.tv-figure canvas')?.dataset.clip==='idle');
 for(let i=0;i<3;i++)await d.locator('[data-action=talk]').click();
 assert.equal(await page.evaluate(()=>window.t12.session.battle.social.points[window.t12.who]),23);
 await d.locator('[data-action=gift]').click();
 await page.waitForFunction(()=>window.t12.session.battle.social.points[window.t12.who]===35);
 await page.evaluate(()=>{window.t12.started=window.t12.session.battle.elapsed;window.t12.session.battle.drainEvents();});
 await d.locator('[data-do=touch]').click();await d.locator('[data-region=shoulder]').waitFor({state:'visible',timeout:30000});
 for(let i=0;i<3;i++){await d.locator('[data-region=shoulder]').click();if(i<2)await d.locator('[data-region=shoulder]').waitFor({state:'visible',timeout:30000});}
 assert.equal(await page.evaluate(()=>window.t12.session.battle.social.points[window.t12.who]),47);
 async function playUntil(target){
  return await page.evaluate(async target=>{
   const f=window.t12,s=f.session;await s.setPaused(false);let steps=0;
   while(s.battle.social.personal[f.who].clears<target&&steps++<12000){
    s.advance(.25);if(s.busy)await s.flush();
    for(const event of s.battle.drainEvents()){if(event.type==='clear')f.clears.push({wave:event.wave,elapsed:s.battle.elapsed});if(event.type==='gift-found'||event.type==='personal-gift')f.notices.push(event);}
    if(steps%160===0)await s.heartbeat();
    if(s.error)throw s.error;if(s.battle.phase==='defeat')throw Error('Fixture defense defeated');
   }
   await s.setPaused(true);
   if(s.battle.social.personal[f.who].clears!==target)throw Error('Target count not reached');
   return {target,seconds:s.battle.elapsed-f.started,points:s.battle.social.points[f.who],farmWave:s.battle.farmWave};
  },target);
 }
 await playUntil(3);await d.locator('[data-action=talk]').click();
 await playUntil(6);await d.locator('[data-action=talk]').click();assert.equal(await page.evaluate(()=>window.t12.session.battle.social.points[window.t12.who]),58);
 const half=await playUntil(15);await page.evaluate(()=>window.t12.reload());
 const before=await playUntil(29);assert.equal(await d.locator('[data-action=gift]').isDisabled(),true);
 const end=await playUntil(30);assert.equal(await d.locator('[data-action=gift]').isEnabled(),true);
 await d.locator('[data-action=gift]').click();await page.waitForFunction(()=>window.t12.session.battle.social.points[window.t12.who]===70);
 for(const heart of [1,2,3]){
  await d.locator('[data-moment="'+heart+'"]').click();
  for(let beat=0;beat<3;beat++)await d.locator('[data-do=story-next]').click();
 }
 await page.evaluate(()=>window.t12.reload());
 const state=await page.evaluate(()=>({social:window.t12.session.battle.social,notices:window.t12.notices,clears:window.t12.clears,snapshot:window.t12.session.battle.snapshot()}));
 assert.equal(state.social.points[who],70);assert.equal(state.notices.filter(e=>e.type==='personal-gift'&&e.companion===who).length,1);
 assert.equal(state.notices.filter(e=>e.type==='gift-found').length,3);assert.equal(state.clears.length,30);assert.deepEqual(errors,[]);
 await writeFile('artifacts/idle-bastion/acceptance/t12/flow-'+who+'-save.json',JSON.stringify(state.snapshot,null,2));
 results.push({who,source:who==='mara'?'clear15':'clear25',half,before,end,normalGiftNotices:3,personalGiftNotices:1,reloadAt15And70:true,moments:[1,2,3],errors});
 console.log(JSON.stringify(results.at(-1)));await page.evaluate(async()=>{clearInterval(window.t12.heartbeat);window.t12.ui.destroy();await window.t12.session.close();});await page.close();
}
await writeFile('artifacts/idle-bastion/acceptance/t12/flow-results.json',JSON.stringify(results,null,2));
}finally{await browser.close();}
