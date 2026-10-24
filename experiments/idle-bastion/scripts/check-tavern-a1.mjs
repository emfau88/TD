// Optional local browser acceptance. Uses the real UI + temporary session fixture.
// BASE_URL points at a dev server or production build containing tavern-rig-check.
// PLAYWRIGHT_MODULE may point at an existing Playwright installation.
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const base = process.env.BASE_URL || 'http://127.0.0.1:5231';
const out = process.env.REPORT_DIR || 'qa/tavern-a1/after';
fs.mkdirSync(out, {recursive:true});
const browser = await chromium.launch({channel:'chrome',headless:true});
const results = [];
const idle = page => page.waitForFunction(() => document.querySelector('.tv-figure canvas')?.dataset.clip === 'idle' && document.querySelector('#tavern-dialog')?.dataset.reacting === 'false');
const geometry = page => page.locator('.tv-figure canvas').boundingBox();
const images = page => page.evaluate(() => performance.getEntriesByType('resource').filter(r => r.initiatorType === 'img' && /(?:\/\d{2}(?:-|\.webp)|-portrait)/.test(r.name)).map(r => ({url:r.name,bytes:r.transferSize,body:r.encodedBodySize})));
try {
 for (const mobile of [false,true]) for (const hero of ['mara','ilyra']) {
  if (process.env.PROFILE && process.env.PROFILE !== (mobile ? 'mobile' : 'desktop') || process.env.HERO && process.env.HERO !== hero) continue;
  const context = await browser.newContext({viewport:mobile?{width:390,height:844}:{width:1280,height:800},deviceScaleFactor:1,isMobile:mobile,hasTouch:mobile});
  const page = await context.newPage(), cdp = await context.newCDPSession(page), errors=[];
  page.on('pageerror',e=>errors.push(String(e)));
  await cdp.send('Network.enable');
  await cdp.send('Network.emulateNetworkConditions',{offline:false,latency:80,downloadThroughput:1250000,uploadThroughput:625000});
  await page.addInitScript(() => {
   performance.setResourceTimingBufferSize(5000); window.framesSeen=[];
   new MutationObserver(records => {
    const canvas = records.find(r => r.target.matches?.('.tv-figure canvas'))?.target;
    if(canvas?.dataset.clip) window.framesSeen.push({at:performance.now(),clip:canvas.dataset.clip,frame:Number(canvas.dataset.frame)});
   }).observe(document,{attributes:true,subtree:true,attributeFilter:['data-frame','data-clip']});
  });
  for (const cache of ['cold','warm']) {
   if(cache==='cold')await cdp.send('Network.clearBrowserCache');
   await page.goto(`${base}/tavern-rig-check.html?hero=${hero}`,{waitUntil:'domcontentloaded'}); await idle(page);
   const initial=await page.evaluate(()=>window.framesSeen[0].at), initialImages=await images(page);
   const before=await geometry(page);
   await page.waitForTimeout(1000); // Fixed user dwell after idle, equal on both revisions.
   const prefetch=await images(page), actions=[];
   for (const [action,selector,clip] of [ ['talk','[data-action="talk"]','head'],['touch','[data-region="shoulder"]','touch'],['gift','[data-action="gift"]','joy'],['giggle','[data-gesture="giggle"]','giggle'],['hip','[data-gesture="hip"]','hip'] ]) {
    if(action==='touch')await page.locator('[data-do="touch"]').click();
    // Deliberately scroll away from the reply before each action.
    await page.locator('.tv-conversation').evaluate(node=>{node.scrollTop=node.scrollHeight;});
    const start=await page.evaluate(()=>performance.now()); await page.locator(selector).click();
    await page.waitForFunction(key=>document.querySelector('.tv-figure canvas')?.dataset.clip===key,clip);
    const first=await page.evaluate(({clip,start})=>window.framesSeen.find(f=>f.at>=start&&f.clip===clip).at,{clip,start});
    await page.screenshot({path:path.join(out,`${hero}-${mobile?'mobile':'desktop'}-${cache}-${action}.png`)});
    await idle(page);
    const trace=await page.evaluate(({clip,first})=>window.framesSeen.filter(f=>f.at>=first&&f.clip===clip),{clip,first});
    const gaps=trace.slice(1).map((f,i)=>f.at-trace[i].at);
    const reply=await page.locator('.tv-dialogue').evaluate(node=>{const r=node.getBoundingClientRect(),p=node.parentElement.getBoundingClientRect();return{visible:r.top>=p.top&&r.bottom<=p.bottom,scroll:node.parentElement.scrollTop,font:getComputedStyle(node.querySelector('p')).fontSize};});
    actions.push({action,waitMs:Math.round(first-start),playMs:Math.round(trace.at(-1).at-first+1000/30),maxGapMs:Math.round(Math.max(...gaps)),stallsOver100ms:gaps.filter(g=>g>100).length,reply});
    assert.deepEqual(await geometry(page),before,'reply or action must not change figure geometry');
    if(action==='touch')await page.locator('[data-do="touch"]').click();
   }
   const start=await page.evaluate(()=>performance.now());await page.locator('[data-action="talk"]').click();
   await page.waitForFunction(()=>document.querySelector('.tv-figure canvas')?.dataset.clip==='head');
   const repeat=await page.evaluate(start=>window.framesSeen.find(f=>f.at>=start&&f.clip==='head').at-start,start);await idle(page);
   const all=await images(page), sum=rows=>rows.reduce((s,r)=>s+r.bytes,0);
   const row={hero,mobile,cache,idleMs:Math.round(initial),initialTransferBytes:sum(initialImages),prefetchTransferBytes:sum(prefetch),actions,repeatWaitMs:Math.round(repeat),transferBytes:sum(all),payloadBytes:all.reduce((s,r)=>s+r.body,0),imageRequests:all.length,errors:[...errors]};
   results.push(row);fs.writeFileSync(path.join(out,'metrics.json'),JSON.stringify(results,null,2));console.log(JSON.stringify(row));
  }
  await context.close();
 }
} finally {await browser.close();}
