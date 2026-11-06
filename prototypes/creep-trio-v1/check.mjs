import{chromium}from'file:///C:/Users/madde/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
import{mkdir,writeFile,rename,readFile}from'node:fs/promises';import{fileURLToPath}from'node:url';import assert from'node:assert/strict';
const root=new URL('./',import.meta.url),out=new URL('checks/animation/',root);await mkdir(out,{recursive:true});
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'}),results=[];
const snap=page=>page.evaluate(()=>window.creepPreview.snapshot());
try{
 const manifest=JSON.parse(await readFile(new URL('assets/animation-manifest.json',root),'utf8'));
 assert.deepEqual(manifest.creatures.map(c=>new Set(c.animation.frames.map(f=>f.sha256)).size),[6,8,8]);
 for(const[width,height,dpr,reduced]of[[1032,660,1,false],[844,390,1,false],[390,844,1,false],[844,390,3,false],[844,390,1,true]]){
  const context=await browser.newContext({viewport:{width,height},hasTouch:width<1000,deviceScaleFactor:dpr,reducedMotion:reduced?'reduce':'no-preference'}),page=await context.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)errors.push(`${r.status()} ${r.url()}`);});
  await page.goto('http://127.0.0.1:5213/');await page.waitForFunction(()=>window.previewReady===true);
  assert.equal(await page.locator('article').count(),3);assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  assert.equal(await page.evaluate(()=>localStorage.length),0);assert.deepEqual(await page.evaluate(async()=>await indexedDB.databases()),[]);
  if(reduced){const a=await snap(page);await page.waitForTimeout(200);assert.deepEqual(await snap(page),a);assert.equal(a.playing,false);await page.locator('#pause').click();}
  const seen=[new Set(),new Set(),new Set()],start=await snap(page);
  for(let k=0;k<22;k++){await page.waitForTimeout(65);const s=await snap(page);s.frames.forEach((f,i)=>seen[i].add(f));}
  const moved=await snap(page);assert.ok(moved.time>start.time+1000);assert.deepEqual(seen.map(s=>s.size),[6,8,8]);
  await page.locator('#pause').click();await page.waitForTimeout(70);const stopped=await snap(page),pixels=await page.locator('.small').evaluateAll(els=>els.map(c=>c.toDataURL()));
  await page.waitForTimeout(210);assert.deepEqual(await snap(page),stopped);assert.deepEqual(await page.locator('.small').evaluateAll(els=>els.map(c=>c.toDataURL())),pixels);
  await page.screenshot({path:fileURLToPath(new URL(`${width}-dpr${dpr}${reduced?'-reduced':''}.png`,out)),fullPage:true});
  await page.locator('#detail').check();assert.equal(await page.locator('.large:visible').count(),3);
  if(width===1032)await page.screenshot({path:fileURLToPath(new URL('detail.png',out)),fullPage:true});
  await page.locator('#travel').selectOption('path');await page.locator('#pause').click();const walkStart=await snap(page);await page.waitForTimeout(750);const walkEnd=await snap(page);assert.ok(walkEnd.x.every((x,i)=>Math.abs(x-walkStart.x[i])>17));await page.locator('#pause').click();
  await page.locator('#speed').selectOption('0.5');await page.locator('#pause').click();const halfStart=await snap(page);await page.waitForTimeout(600);const halfEnd=await snap(page);assert.ok(halfEnd.time-halfStart.time>210&&halfEnd.time-halfStart.time<390);
  if(width===844&&!reduced&&dpr===1){await page.setViewportSize({width:390,height:844});await page.waitForTimeout(120);assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));}
  assert.deepEqual(errors,[]);results.push({width,height,dpr,reduced,uniqueFrames:seen.map(s=>s.size),movement:true,pauseFreezesPixels:true,halfSpeed:true,detailView:true,noStorage:true,noOverflow:true,noBrowserErrors:true});await context.close();
 }
 const context=await browser.newContext({viewport:{width:900,height:420},recordVideo:{dir:fileURLToPath(out),size:{width:900,height:420}}}),page=await context.newPage();
 await page.goto('http://127.0.0.1:5213/');await page.waitForFunction(()=>window.previewReady===true);await page.waitForTimeout(7200);
 const video=page.video();await context.close();await rename(await video.path(),fileURLToPath(new URL('creep-trio.webm',out)));
}finally{await browser.close();await writeFile(new URL('results.json',out),JSON.stringify(results,null,2)+'\n');}
console.log(JSON.stringify(results));
