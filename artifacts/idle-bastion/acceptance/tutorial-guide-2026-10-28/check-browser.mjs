import {chromium} from 'file:///C:/Users/madde/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
import assert from 'node:assert/strict';
import {writeFile} from 'node:fs/promises';
const out='artifacts/idle-bastion/acceptance/tutorial-guide-2026-10-28',origin='http://127.0.0.1:5252',results=[];
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
const probe=await browser.newPage();
await probe.goto(origin+'/tests/browser/quick-wins-session.html');
const seeds=await probe.evaluate(async()=>{
 const {IdleBattle}=await import('/src/battle.ts');
 const b=IdleBattle.newGame(),states={};
 const until=condition=>{for(let i=0;i<24000&&!condition();i++)b.update(.025);if(!condition())throw Error('Fixture stuck '+b.introduction.stage+' '+b.discovery+' '+b.highestCleared);};
 b.beginIntroduction();b.build(b.recommendedStarterPad);b.startDefense();
 until(()=>b.introduction.stage==='upgrade'&&b.learningPaused);b.upgrade(b.towers[0].uid);
 until(()=>b.workshopKitAvailable);b.buildWorkshop();b.continueLesson();
 states.saving=b.snapshot();until(()=>b.learningPaused);b.researchFrost();b.continueLesson();states.frost=b.snapshot();
 b.build(b.recommendedFrostPad,2);b.update(.025);states['after-frost']=b.snapshot();
 until(()=>b.highestCleared>=4);states['wait-wisp']=b.snapshot();
 until(()=>b.discoveryPaused&&b.wispUnlocked);states.wisp=b.snapshot();
 b.meetWisp();states.mara=b.snapshot();b.continueDiscovery();
 b.mara.autoCast=true;until(()=>b.discovery==='mara-effect');states['mara-effect']=b.snapshot();
 until(()=>b.discovery==='mara-controls');states['mara-controls']=b.snapshot();
 b.continueDiscovery();states.cannon=b.snapshot();b.dismissDiscovery();states['wait-warehouse']=b.snapshot();
 b.gold=2000;for(const tower of b.towers)while(tower.level<6&&b.upgrade(tower.uid)){}
 until(()=>b.highestCleared>=8);states.warehouse=b.snapshot();
 for(const [name,s] of Object.entries(states))if(!IdleBattle.restore(s))throw Error('Invalid '+name);
 return states;
});
await probe.close();
await writeFile(out+'/fixtures.json',JSON.stringify(seeds));
try {
for(const [width,height,lang] of [[390,844,'en'],[320,568,'de'],[1440,900,'en']]){
 const p=await browser.newPage({viewport:{width,height},isMobile:width<700,hasTouch:width<700}),errors=[];
 p.on('pageerror',e=>errors.push(e.message));
 await p.addInitScript(lang=>{localStorage.setItem('spire-language-v1',lang);localStorage.setItem('spire-audio-mix-v1',JSON.stringify({muted:true,music:.16,effects:.4,voices:.7}));},lang);
 await p.route('**/src/main.ts*',async route=>{const response=await route.fetch();let body=await response.text();body=body.replace('const audio = new GameAudio();','const audio = new GameAudio(); globalThis.__guideProbe=()=>({session,scene,syncUI,showCombatMessage,selectPad});');await route.fulfill({response,body});});
 for(const kind of ['saving','frost','after-frost','wait-wisp','wisp','mara','mara-effect','mara-controls','cannon','wait-warehouse','warehouse']){
  await p.goto(origin+'/tests/browser/quick-wins-session.html');
  const slot=await p.evaluate(async raw=>{
   const {openBattleStore}=await import('/src/save-store.ts');const slot='guide-'+crypto.randomUUID(),store=await openBattleStore(undefined,'spire-idle-bastion-probe-'+slot);
   await store.save(raw,false,0);store.close();return slot;
  },seeds[kind]);
  await p.goto(origin+'/?probe='+slot,{waitUntil:'domcontentloaded'});await p.locator('#boot-screen').waitFor({state:'hidden',timeout:45000});
  if(await p.locator('#claim-offline').isVisible())await p.locator('#claim-offline').click();
  await p.locator('#tutorial-guide').waitFor({state:'visible'});
  await p.evaluate(()=>document.fonts.load('500 17px "Pixelify Sans"'));
  const data=await p.evaluate(()=>{
   const guide=document.getElementById('tutorial-guide'),r=guide.getBoundingClientRect();
   const visible=el=>!!el&&el.getClientRects().length>0&&getComputedStyle(el).display!=='none';
   const outside=['onboarding-card','wisp-arrival','discovery-card','fallback-note','quick-win-hint','combat-message','lesson-savings','tutorial-card','mobile-hint'].filter(id=>{const el=document.getElementById(id);return visible(el)&&!guide.contains(el);});
   const pause=document.getElementById('pause'),pr=pause.getBoundingClientRect(),sr=pause.querySelector('svg').getBoundingClientRect(),wave=document.getElementById('wave-summary').getBoundingClientRect();
   return {source:guide.dataset.source,text:guide.innerText,height:r.height,cardWidth:r.width,x:r.x,bottom:r.bottom,overflow:guide.scrollWidth>guide.clientWidth+1,outside,
    pause:{x:pr.x,y:pr.y,w:pr.width,h:pr.height,dx:Math.abs(sr.x+sr.width/2-pr.x-pr.width/2),dy:Math.abs(sr.y+sr.height/2-pr.y-pr.height/2),afterWave:pr.x>=wave.right-1,disabled:pause.disabled},
    model:{stage:window.__guideProbe().session.battle.introduction.stage,discovery:window.__guideProbe().session.battle.discovery}};
  });
  assert.deepEqual(data.outside,[],JSON.stringify(data));assert.equal(data.overflow,false);
  assert.ok(data.pause.dx<1&&data.pause.dy<1&&data.pause.afterWave,JSON.stringify(data.pause));
  assert.ok(data.pause.x+data.pause.w<=width,JSON.stringify(data.pause));
  assert.ok(data.text.match(/\d+\/14/),JSON.stringify(data));assert.ok(data.height<=190,JSON.stringify(data));
  if(['wait-wisp','wait-warehouse'].includes(kind))assert.ok(data.text.includes('4/5')||data.text.includes('/8'),JSON.stringify(data));
  if(['wait-wisp','wisp','cannon','wait-warehouse','warehouse','saving','mara'].includes(kind))
   await p.screenshot({path:out+'/'+kind+'-'+width+'.png'});
  if(kind==='wisp'){
   await p.locator('#meet-wisp').click();await p.waitForFunction(()=>window.__guideProbe().session.battle.discovery==='mara-wait');
   assert.equal(await p.locator('#tutorial-guide').getAttribute('data-source'),'discovery-card');
  }
  if(kind==='cannon'){
   await p.locator('#quick-win-dismiss').click();await p.waitForFunction(()=>window.__guideProbe().session.battle.discovery==='warehouse');
  }
  if(kind==='wait-wisp'){
   await p.locator('#pause').click();await p.waitForFunction(()=>window.__guideProbe().session.paused);
   assert.equal(await p.locator('#pause').getAttribute('aria-pressed'),'true');
   await p.screenshot({path:out+'/paused-'+width+'.png'});
   await p.locator('#pause').click();await p.waitForFunction(()=>!window.__guideProbe().session.paused);
   await p.evaluate(async()=>{const {session,selectPad}=window.__guideProbe();await selectPad(session.battle.towers[0].padId);});
   assert.equal(await p.locator('#tutorial-guide').isVisible(),false);
   assert.equal(await p.locator('#context-panel .guide-inline').isVisible(),true);
   await p.locator('#close-context').click();await p.locator('#tutorial-guide').waitFor({state:'visible'});
   await p.reload();await p.locator('#boot-screen').waitFor({state:'hidden',timeout:45000});
   if(await p.locator('#claim-offline').isVisible())await p.locator('#claim-offline').click();
   assert.ok((await p.locator('#tutorial-guide').innerText()).includes('10/14'));
  }
  assert.deepEqual(errors,[]);results.push({viewport:{width,height,lang},kind,...data});await writeFile(out+'/browser-results.json',JSON.stringify(results,null,2)+'\n');
  console.log('guide passed '+width+' '+kind+' height='+data.height);
 }
 await p.close();
}
}finally{await browser.close();}
