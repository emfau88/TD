import {chromium} from 'file:///C:/Users/madde/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
import assert from 'node:assert/strict';
import {writeFile} from 'node:fs/promises';
const out='artifacts/idle-bastion/acceptance/loading-polish-2026-10-27';
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,args:['--autoplay-policy=document-user-activation-required']});
const results=[];
try {for(const width of [1440,390]) {
 const page=await browser.newPage({viewport:{width,height:900},isMobile:width<700,hasTouch:width<700});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.addInitScript(()=>{
  window.__starts=[];window.__playing=[];
  const start=AudioBufferSourceNode.prototype.start;
  AudioBufferSourceNode.prototype.start=function(...args){window.__starts.push({at:performance.now(),duration:this.buffer?.duration});return start.apply(this,args);};
  document.addEventListener('playing',e=>{if(e.target instanceof HTMLMediaElement)window.__playing.push({at:performance.now(),src:e.target.currentSrc});},true);
 });
 await page.goto('https://emfau88.github.io/TD/?fresh=1&verify='+Date.now());
 await page.locator('#boot-screen').waitFor({state:'hidden',timeout:90000});
 const bundle=await page.locator('script[type=module][src]').getAttribute('src');
 assert.equal(await page.locator('#tavern-gift-badge').count(),1);
 assert.equal(await page.locator('#unlock-clearing').count(),0);
 const initial=await page.evaluate(()=>({at:performance.now(),ready:document.querySelector('audio[data-spire-music]')?.readyState,paused:document.querySelector('audio[data-spire-music]')?.paused}));
 assert.equal(initial.paused,true); assert.equal(initial.ready,4);
 assert.ok((await page.title()).startsWith('Towers & Tantrums'));
 assert.equal(await page.locator('#boot-screen h1 span').count(),2);
 assert.match(await page.locator('.boot-art').getAttribute('src'),/campfire-cutout/);
 assert.equal(await page.locator('.boot-art').evaluate(el=>getComputedStyle(el).backgroundColor),'rgba(0, 0, 0, 0)');
 const clicks=[];
 for(let i=0;i<3;i++) {
  const before=await page.evaluate(()=>({n:window.__starts.length,at:performance.now()}));
  const label=await page.locator('#onboarding-primary').innerText();
  if(width<700)await page.locator('#onboarding-primary').tap();else await page.locator('#onboarding-primary').click();
  await page.waitForFunction(n=>window.__starts.length>n,before.n,{timeout:2500});
  const source=await page.evaluate(n=>window.__starts[n],before.n);
  clicks.push({label,automationToSoundMs:Math.round(source.at-before.at),bufferDuration:source.duration});
 }
 await page.waitForFunction(()=>document.querySelector('audio[data-spire-music]')?.currentTime>1.5,null,{timeout:10000});
 const audio=await page.evaluate(()=>({currentTime:document.querySelector('audio[data-spire-music]').currentTime,playing:window.__playing,stage:document.getElementById('app').dataset.intro}));
 assert.equal(audio.stage,'build');
 assert.deepEqual(errors,[]);
 results.push({width,bundle,initial,clicks,audio,errors});
 console.log('live audio passed '+width+' '+JSON.stringify(clicks));
 await page.close();
}
 await writeFile(out+'/live-results.json',JSON.stringify(results,null,2)+'\n');
} finally {await browser.close();}
