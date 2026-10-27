import {chromium} from 'file:///C:/Users/madde/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
import assert from 'node:assert/strict';
import {writeFile} from 'node:fs/promises';
const out='artifacts/idle-bastion/acceptance/branding-2026-10-27', results=[];
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,args:['--autoplay-policy=document-user-activation-required']});
const origin='http://127.0.0.1:5254';
try {
for(const [width,height,lang,rnd] of [[1440,900,'en',.1],[1280,720,'en',.1],[390,844,'en',.4],[320,568,'en',.8],[844,390,'en',.1],[390,844,'de',.4],[320,568,'de',.8]]) {
 const page=await browser.newPage({viewport:{width,height},isMobile:width<700,hasTouch:width<700}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.addInitScript(({lang,rnd})=>{localStorage.setItem('spire-language-v1',lang);const original=Math.random;let first=true;Math.random=()=>{if(first){first=false;return rnd;}return original();};},{lang,rnd});
 let release;const gate=new Promise(r=>release=r);
 await page.route('**/exploration-*.mp3',async route=>{await gate;await route.continue();});
 await page.goto(origin+'/?fresh=1',{waitUntil:'domcontentloaded'});
 await page.waitForFunction(()=>document.getElementById('boot-screen').dataset.phase==='audio',null,{timeout:45000});
 await page.waitForFunction(()=>document.querySelector('.boot-art').complete&&document.querySelector('.boot-art').naturalWidth>0);
 await page.evaluate(()=>document.fonts.load('700 56px "Spire Loading"'));
 const layout=await page.evaluate(()=>{
  const host=document.getElementById('boot-screen'),panel=host.querySelector('.boot-panel').getBoundingClientRect();
  const lines=[...host.querySelectorAll('h1 span,.boot-tagline span')].map(el=>({text:el.textContent,x:el.getBoundingClientRect().x,right:el.getBoundingClientRect().right,overflow:el.scrollWidth>el.clientWidth+1}));
  const audio=document.querySelector('audio[data-spire-music]');
  return {phase:host.dataset.phase,inert:document.getElementById('app').inert,panel:{x:panel.x,y:panel.y,right:panel.right,bottom:panel.bottom},lines,quip:document.getElementById('boot-quip').textContent,audioReady:audio.readyState,audioPaused:audio.paused};
 });
 assert.equal(layout.lines.length,4);
 assert.equal(layout.inert,true);assert.equal(layout.audioPaused,true);assert.ok(layout.audioReady<4);
 assert.ok(layout.panel.y>=0&&layout.panel.bottom<=height+1,JSON.stringify(layout));
 for(const line of layout.lines)assert.ok(!line.overflow&&line.x>=0&&line.right<=width+1,JSON.stringify(line));
 const suffix=lang==='en'?String(width):width+'-de';
 await page.screenshot({path:out+'/loading-'+suffix+'.png'});
 release();await page.locator('#boot-screen').waitFor({state:'hidden',timeout:45000});
 assert.equal(await page.evaluate(()=>document.querySelector('audio[data-spire-music]').readyState),4);
 assert.equal(await page.evaluate(()=>document.querySelector('audio[data-spire-music]').paused),true);
 const header=await page.evaluate(()=>{const brand=document.querySelector('.brand'),r=brand.getBoundingClientRect(),next=brand.nextElementSibling.getBoundingClientRect();return{shown:getComputedStyle(brand).display!=='none',right:r.right,next:next.x};});
 if(header.shown)assert.ok(header.right<=header.next+1,JSON.stringify(header));
 if(width===390&&lang==='en') {
  await page.locator('#onboarding-primary').tap();
  await page.waitForFunction(()=>document.querySelector('audio[data-spire-music]').currentTime>.1,null,{timeout:1500});
 }
 assert.deepEqual(errors,[]);results.push({width,height,lang,layout,header,errors});
 console.log('loading layout + audio gate passed '+width+' '+lang);
 await page.close();
}
assert.equal(new Set(results.filter(r=>r.lang==='en').map(r=>r.layout.quip)).size,3);
for(const mode of ['muted','error','timeout']) {
 const page=await browser.newPage({viewport:{width:320,height:568},isMobile:true,hasTouch:true}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));let requests=0,release;
 const gate=new Promise(r=>release=r);
 if(mode==='muted')await page.addInitScript(()=>localStorage.setItem('spire-audio-mix-v1',JSON.stringify({muted:true,music:.16,effects:.4,voices:.7})));
 await page.route('**/exploration-*.mp3',async route=>{requests++;if(mode==='timeout'){await gate;await route.abort();}else await route.abort();});
 await page.goto(origin+'/?fresh=1',{waitUntil:'domcontentloaded'});
 if(mode==='muted') {
  await page.locator('#boot-screen').waitFor({state:'hidden',timeout:45000});assert.equal(requests,0);
 } else {
  await page.waitForFunction(()=>document.getElementById('boot-screen').dataset.phase==='error',{timeout:45000});
  assert.equal(await page.locator('#boot-recovery').innerText(),'Continue without music');
  assert.equal(await page.locator('#boot-quip').isVisible(),false);
  if(mode==='error')await page.screenshot({path:out+'/loading-error-320.png'});
  await page.locator('#boot-recovery').tap();await page.locator('#boot-screen').waitFor({state:'hidden'});
  assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('spire-audio-mix-v1')).music),0);
 }
 release();assert.deepEqual(errors,[]);results.push({mode,requests,errors});console.log('audio startup '+mode+' passed');await page.close();
}
await writeFile(out+'/browser-results.json',JSON.stringify(results,null,2)+'\n');
} finally {await browser.close();}
