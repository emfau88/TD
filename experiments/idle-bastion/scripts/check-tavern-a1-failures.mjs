import {createRequire} from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
const {chromium}=createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE || 'playwright');
const base=process.env.BASE_URL || 'http://127.0.0.1:5231';
const out=process.env.REPORT_DIR || 'qa/tavern-a1/failures';fs.mkdirSync(out,{recursive:true});
const browser=await chromium.launch({channel:'chrome',headless:true}), results=[];
const ready=page=>page.waitForFunction(()=>document.querySelector('#tavern-dialog')?.dataset.reacting==='false'&&!document.querySelector('[data-action="talk"]').disabled);
const snapshot=page=>page.evaluate(()=>({points:document.querySelector('progress').value,stock:document.querySelector('[data-text="stock"]').textContent,reacting:document.querySelector('#tavern-dialog').dataset.reacting,cache:Number(document.querySelector('.tv-figure canvas').dataset.cachedPages)}));
try {
 for(const mobile of [false,true])for(const hero of ['mara','ilyra']) {
  const context=await browser.newContext({viewport:mobile?{width:390,height:844}:{width:1280,height:800},isMobile:mobile,hasTouch:mobile});
  const page=await context.newPage(), errors=[];page.on('pageerror',e=>errors.push(String(e)));
  await page.addInitScript(()=>{window.wrongDraws=[];const draw=CanvasRenderingContext2D.prototype.drawImage;CanvasRenderingContext2D.prototype.drawImage=function(image,...args){if(this.canvas.closest('.tv-figure')){const who=document.querySelector('#tavern-dialog').dataset.companion;if(image.src.includes('/mara/')&&who==='ilyra'||image.src.includes('/ilyra/')&&who==='mara')window.wrongDraws.push(image.src);}return draw.call(this,image,...args);};});
  let fail=true, attempts=0;
  const failHead=`**/tavern-rig/${hero}/head/00.webp`;
  await page.route(failHead,route=>{attempts++;return fail?route.abort('failed'):route.continue();});
  await page.goto(`${base}/tavern-rig-check.html?hero=${hero}`);await ready(page);await page.waitForTimeout(600);
  const before=await snapshot(page);await page.locator('[data-action="talk"]').click();await ready(page);
  const failed=await snapshot(page);assert.equal(failed.points,before.points+8);assert.equal(failed.stock,before.stock);
  assert.ok(attempts<=4&&attempts>=2);assert.equal(await page.locator('.tv-figure canvas').getAttribute('data-reaction-error'),'true');
  await page.screenshot({path:path.join(out,`${hero}-${mobile?'mobile':'desktop'}-failed.png`)});
  fail=false;await page.locator('[data-action="talk"]').click();await page.waitForFunction(()=>document.querySelector('.tv-figure canvas').dataset.clip==='head');await ready(page);
  assert.equal((await snapshot(page)).points,before.points+16,'one reward per user action, none for retries');
  await page.locator('[data-action="talk"]').click();await page.waitForFunction(()=>document.querySelector('.tv-figure canvas').dataset.clip==='head');await ready(page);
  assert.equal((await snapshot(page)).points,before.points+16,'repeat after budget remains free of points');
  await page.unroute(failHead);
  // Fail a later page, after a gift reaction has already begun.
  let giftAttempts=0;await page.route(`**/tavern-rig/${hero}/joy/05.webp`,route=>{giftAttempts++;return route.abort('failed');});
  const giftBefore=await snapshot(page);await page.locator('[data-action="gift"]').click();await ready(page);
  const giftAfter=await snapshot(page);assert.equal(giftAfter.points,giftBefore.points+12);assert.match(giftBefore.stock,/20/);assert.match(giftAfter.stock,/19/);assert.equal(giftAttempts,2);
  assert.equal(await page.locator('.tv-figure canvas').getAttribute('data-clip'),'idle');
  // No stale canvas pixels or portrait, including the synchronous switch frame.
  await page.route('**/tavern-rig/manifest.json',async route=>{await new Promise(resolve=>setTimeout(resolve,500));await route.continue();});
  const switches=[];
  for(const who of ['mara','ilyra','mara','ilyra','mara','ilyra']) {
   await page.locator('[data-do="back"]').click();
   const frame=await page.evaluate(who=>{document.querySelector(`[data-do="${who}"]`).click();const c=document.querySelector('.tv-figure canvas'),p=document.querySelector('.tv-loading-portrait'),pixels=c.getContext('2d').getImageData(0,0,c.width,c.height).data;let alpha=0;for(let i=3;i<pixels.length;i+=4)alpha+=pixels[i];return{alpha,canvasHidden:c.hidden,portraitHidden:p.hidden,portrait:p.src,who};},who);
   assert.equal(frame.alpha,0);assert.equal(frame.canvasHidden,true);assert.equal(frame.portraitHidden,false);assert.ok(frame.portrait.includes(`${who}-portrait`));switches.push(frame);
   await page.waitForTimeout(80);
  }
  await ready(page);assert.deepEqual(await page.evaluate(()=>window.wrongDraws),[]);
  await page.screenshot({path:path.join(out,`${hero}-${mobile?'mobile':'desktop'}-switched.png`)});
  // First idle failure still permits a conversation using the matching portrait.
  await page.unroute('**/tavern-rig/manifest.json');
  await page.route(`**/tavern-rig/${hero}/idle/00.webp`,route=>route.abort('failed'));
  await page.reload();await ready(page);
  assert.equal(await page.locator('.tv-loading-portrait').evaluate(p=>p.hidden),false);
  await page.locator('[data-action="talk"]').click();await page.waitForFunction(()=>document.querySelector('.tv-figure canvas').dataset.clip==='head');await ready(page);
  assert.equal(await page.locator('.tv-loading-portrait').evaluate(p=>p.hidden),false,'return to matching portrait when idle is missing');
  const last=await snapshot(page);assert.ok(last.cache<=14);assert.deepEqual(errors,[]);
  const result={hero,mobile,headAttempts:attempts,giftAttempts,failed,giftAfter,switches:switches.length,wrongDraws:0,portraitFallback:true,cacheLimit:last.cache,errors};results.push(result);console.log(JSON.stringify(result));
  fs.writeFileSync(path.join(out,'checks.json'),JSON.stringify(results,null,2));await context.close();
 }
 // Accelerate only the animation clock to exercise several automatic idle loops.
 // A broken automatic variation must stay suppressed until the view is reopened.
 const variants=[];
 for(const hero of ['mara','ilyra']) {
  const page=await browser.newPage();let attempts=0;
  await page.addInitScript(()=>{const raf=window.requestAnimationFrame.bind(window);window.requestAnimationFrame=callback=>raf(time=>callback(time*20));});
  await page.route(`**/tavern-rig/${hero}/variant/00.webp`,route=>{attempts++;return route.abort('failed');});
  await page.goto(`${base}/tavern-rig-check.html?hero=${hero}`);
  await page.waitForFunction(()=>document.querySelector('.tv-figure canvas')?.dataset.reactionError==='true');
  await ready(page);await page.waitForTimeout(2200);
  assert.equal(attempts,2,'automatic loops must not restart exhausted atlas retries');
  variants.push({hero,attempts,suppressed:true});await page.close();
 }
 fs.writeFileSync(path.join(out,'variants.json'),JSON.stringify(variants,null,2));console.log(JSON.stringify(variants));
}finally{await browser.close();}
