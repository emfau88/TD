import {chromium} from 'file:///C:/Users/madde/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
const out='artifacts/idle-bastion/acceptance/entry-polish-2026-10-27';await mkdir(out,{recursive:true});
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,args:['--autoplay-policy=document-user-activation-required']});
const results=[];
try{for(const width of [1440,390]){
 const page=await browser.newPage({viewport:{width,height:900},isMobile:width<700,hasTouch:width<700});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.addInitScript(()=>{
  window.__starts=[];
  const start=AudioBufferSourceNode.prototype.start;
  AudioBufferSourceNode.prototype.start=function(...a){window.__starts.push({at:performance.now(),duration:this.buffer?.duration});return start.apply(this,a);};
 });
 const click=async selector=>{const el=page.locator(selector);if(width<700)await el.tap();else await el.click();};
 const point=async which=>page.evaluate(()=>{const a=document.getElementById('lesson-pointer');return{x:parseFloat(a.style.left),y:parseFloat(a.style.top)}});
 const tap=async p=>{if(width<700)await page.touchscreen.tap(p.x,p.y);else await page.mouse.click(p.x,p.y);};
 await page.goto('http://127.0.0.1:5253/?fresh=1');
 await page.locator('#boot-screen').waitFor({state:'hidden',timeout:60000});
 const initial=await page.evaluate(()=>({musicReady:document.querySelector('audio[data-spire-music]')?.readyState,paused:document.querySelector('audio[data-spire-music]')?.paused}));
 assert.equal(initial.paused,true);
 await page.screenshot({path:out+'/production-intro-'+width+'.png'});
 for(let i=0;i<3;i++){
  const before=await page.evaluate(()=>window.__starts.length),label=await page.locator('#onboarding-primary').innerText();
  if(width===1440&&i===0){await page.locator('#onboarding-primary').focus();await page.keyboard.press('Enter');}else await click('#onboarding-primary');
  await page.waitForFunction(n=>window.__starts.length>n,before,{timeout:1500});
  results.push({width,label,click:true});
 }
 await page.waitForFunction(()=>document.querySelector('audio[data-spire-music]')?.currentTime>.1,{},{timeout:2500});
 assert.ok(await page.locator('#onboarding-eyebrow').isVisible());
 await click('#pick-archer');await tap(await point('starter'));
 await page.waitForFunction(()=>document.querySelector('#app').dataset.intro==='ready');
 await click('#onboarding-primary');
 await page.waitForFunction(()=>document.querySelector('#app').dataset.intro==='upgrade',{},{timeout:30000});
 await page.screenshot({path:out+'/production-upgrade-marker-'+width+'.png'});
 await tap(await point('upgrade'));
 await page.locator('#context-panel').waitFor({state:'visible'});
 assert.equal(await page.locator('#pad-choice').isVisible(),false);
 await click('#upgrade');
 await page.waitForFunction(()=>document.querySelector('#app').dataset.intro==='workshop');
 const after=await page.evaluate(()=>({stage:document.querySelector('#app').dataset.intro}));
 assert.equal(after.stage,'workshop');
 assert.equal(await page.locator('#context-panel').isVisible(),false);
 await page.screenshot({path:out+'/production-after-upgrade-'+width+'.png'});
 await page.reload();await page.locator('#boot-screen').waitFor({state:'hidden',timeout:60000});
 if(await page.locator('#claim-offline').isVisible())await click('#claim-offline');
 await page.waitForFunction(()=>document.querySelector('#app').dataset.intro==='workshop');
 await click('#pause');await click('#open-menu');
 const count=await page.evaluate(()=>window.__starts.length);
 await click('[data-credits="audio"]');
 await page.waitForFunction(n=>window.__starts.length>n,count);
 await click('#credits-dialog button');
 await page.locator('[data-audio-mute]').check();
 await page.waitForFunction(()=>document.querySelector('audio[data-spire-music]').paused);
 await page.locator('[data-audio-mute]').uncheck();
 await page.waitForFunction(()=>!document.querySelector('audio[data-spire-music]').paused);
 assert.deepEqual(errors,[]);
 results.push({width,initial,after,errors});console.log('fresh flow passed '+width);
 await page.close();
}
await writeFile(out+'/production-results.json',JSON.stringify(results,null,2)+'\n');
}finally{await browser.close();}
