import {chromium} from 'file:///C:/Users/madde/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
const out='artifacts/idle-bastion/acceptance/entry-polish-2026-10-27';await mkdir(out,{recursive:true});
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,args:['--autoplay-policy=document-user-activation-required']});
const results=[];
try{for(const width of [1440,390,320]){
 const page=await browser.newPage({viewport:{width,height:900},isMobile:width<700,hasTouch:width<700});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/src/main.ts*',async route=>{const response=await route.fetch();const body=await response.text();assert.ok(body.includes('const audio = new GameAudio();'));await route.fulfill({response,body:body.replace('const audio = new GameAudio();','const audio = new GameAudio(); globalThis.__entryProbe = () => ({audio, scene, session});')});});
 await page.addInitScript(()=>{
  window.__starts=[];
  const start=AudioBufferSourceNode.prototype.start;
  AudioBufferSourceNode.prototype.start=function(...a){window.__starts.push({at:performance.now(),duration:this.buffer?.duration});return start.apply(this,a);};
 });
 const click=async selector=>{const el=page.locator(selector);if(width<700)await el.tap();else await el.click();};
 const point=async which=>page.evaluate(which=>window.__entryProbe().scene.learningAnchor(which),which);
 const tap=async p=>{if(width<700)await page.touchscreen.tap(p.x,p.y);else await page.mouse.click(p.x,p.y);};
 await page.goto('http://127.0.0.1:5252/?fresh=1');
 await page.locator('#boot-screen').waitFor({state:'hidden',timeout:60000});
 const initial=await page.evaluate(async()=>{const a=window.__entryProbe().audio;return{context:!!a.context,clickPrepared:!!await a.buffers.get('click'),musicReady:document.querySelector('audio[data-spire-music]')?.readyState};});
 assert.equal(initial.context,false);assert.equal(initial.clickPrepared,true);
 await page.screenshot({path:out+'/intro-'+width+'.png'});
 for(let i=0;i<3;i++){
  const before=await page.evaluate(()=>window.__starts.length),label=await page.locator('#onboarding-primary').innerText();
  await click('#onboarding-primary');
  await page.waitForFunction(n=>window.__starts.length>n,before,{timeout:1500});
  results.push({width,label,click:true});
 }
 await page.waitForFunction(()=>document.querySelector('audio[data-spire-music]')?.currentTime>.1,{},{timeout:2500});
 assert.ok(await page.locator('#onboarding-eyebrow').isVisible());
 await click('#pick-archer');await tap(await point('starter'));
 await page.waitForFunction(()=>document.querySelector('#app').dataset.intro==='ready');
 await click('#onboarding-primary');
 await page.waitForFunction(()=>document.querySelector('#app').dataset.intro==='upgrade',{},{timeout:30000});
 await page.screenshot({path:out+'/upgrade-marker-'+width+'.png'});
 await tap(await point('upgrade'));
 await page.locator('#context-panel').waitFor({state:'visible'});
 assert.equal(await page.locator('#pad-choice').isVisible(),false);
 await click('#upgrade');
 await page.waitForFunction(()=>document.querySelector('#app').dataset.intro==='workshop');
 const after=await page.evaluate(()=>{const b=window.__entryProbe().session.battle;return{level:b.towers[0].level,paused:b.learningPaused,stage:b.introduction.stage,world:window.__entryProbe().scene.cameras.main.worldView};});
 assert.equal(after.level,2);assert.equal(after.paused,false);
 assert.equal(await page.locator('#context-panel').isVisible(),false);
 await page.screenshot({path:out+'/after-upgrade-'+width+'.png'});
 await page.reload();await page.locator('#boot-screen').waitFor({state:'hidden',timeout:60000});
 if(await page.locator('#claim-offline').isVisible())await click('#claim-offline');
 await page.waitForFunction(()=>window.__entryProbe().session.battle.introduction.stage==='workshop');
 assert.deepEqual(errors,[]);
 results.push({width,initial,after,errors});console.log('fresh flow passed '+width);
 await page.close();
}
await writeFile(out+'/fresh-results.json',JSON.stringify(results,null,2)+'\n');
}finally{await browser.close();}
