import { chromium } from 'file:///C:/Users/madde/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
import { writeFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
const ready=p=>p.waitForFunction(()=>document.querySelector('.tv-figure canvas')?.dataset.clip==='idle'&&!document.querySelector('[data-do=speak]').disabled);
async function open(p,preset='legacy4'){
 await p.goto('http://127.0.0.1:5278/tavern-test.html');await p.selectOption('#preset',preset);await p.selectOption('#companion','ilyra');await p.click('#start');
 await p.waitForFunction(()=>document.querySelector('#boot-screen')?.hidden===true);if(await p.locator('#claim-offline').isVisible())await p.click('#claim-offline');await ready(p);await p.click('[data-do=speak]');
}
async function change(p,place){
 if(!await p.locator('[data-do=switch-location]').isVisible())await p.click('[data-do=speak]');await p.click('[data-do=switch-location]');
 await p.waitForFunction(place=>document.querySelector('#tavern-dialog').dataset.location===place,place);await ready(p);
}
try{
 const p=await browser.newPage({viewport:{width:1280,height:844}}),errors=[];p.on('pageerror',e=>errors.push(e.message));
 await open(p,'heart3');assert.equal(await p.locator('[data-do=switch-location]').isVisible(),false);
 await open(p);await p.evaluate(async()=>{
  const {GameAudio}=await import(performance.getEntriesByType('resource').find(r=>/\/src\/game-audio\.ts(?:\?|$)/.test(r.name)).name),voice=GameAudio.prototype.touchCompanion;
  window.voices=[];GameAudio.prototype.touchCompanion=function(who){window.voices.push(who);return voice.call(this,who);};
 });
 await p.route('**/ilyra-window/IF01.mp4',r=>r.abort());await p.click('[data-do=switch-location]');
 await p.waitForFunction(()=>document.querySelector('.tv-result')?.textContent.includes('nicht geladen'));await ready(p);
 assert.equal(await p.locator('#tavern-dialog').getAttribute('data-location'),'standard');
 await p.unroute('**/ilyra-window/IF01.mp4');await change(p,'ilyra-window');
 for(const region of ['hair','shoulder','hand']){await p.click(`[data-region=${region}]`);await p.waitForFunction(region=>document.querySelector('.tv-figure canvas').dataset.clip===region,region);await ready(p);}
 assert.deepEqual(await p.evaluate(()=>window.voices),['ilyra','ilyra','ilyra']);
 await p.click('[data-do=speak]');assert.equal(await p.locator('[data-gesture=giggle]').isVisible(),false);assert.equal(await p.locator('[data-gesture=hip]').isVisible(),false);
 await p.evaluate(()=>document.querySelector('[data-gesture=hip]').click());assert.deepEqual(await p.evaluate(()=>window.voices),['ilyra','ilyra','ilyra']);
 await change(p,'standard');await p.click('[data-do=speak]');await p.click('[data-gesture=hip]');await p.waitForFunction(()=>document.querySelector('.tv-figure canvas').dataset.clip==='hip');await ready(p);
 assert.deepEqual(await p.evaluate(()=>window.voices),['ilyra','ilyra','ilyra','ilyra']);
 await p.route('**/ilyra-window/IF01.mp4',async r=>{await new Promise(resolve=>setTimeout(resolve,1300));await r.continue().catch(()=>{});});
 await p.click('[data-do=speak]');await p.click('[data-do=switch-location]');await p.click('[data-do=back]');await p.click('[data-do=mara]');await ready(p);await p.waitForTimeout(1500);
 assert.equal(await p.locator('.tv-stage').getAttribute('data-video-scene'),null);assert.equal(await p.locator('.tv-figure canvas').getAttribute('data-companion'),'mara');assert.deepEqual(errors,[]);
 await writeFile(new URL('behavior.json',import.meta.url),JSON.stringify({passed:true,heart3StillClosed:true,failedLoadKeepsRoom:true,retry:true,threeTouchesUseIlyraPool:true,missingGesturesProduceNoVoice:true,standardComplimentPreserved:true,staleSwitchCancelled:true,errors},null,2)+'\n');console.log('Window gates, retry, voice pool, hidden actions and cancellation passed');
}finally{await browser.close();}
