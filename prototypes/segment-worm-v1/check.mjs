import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {chromium} from 'file:///C:/Users/madde/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
const out=new URL('checks/',import.meta.url);await mkdir(out,{recursive:true});
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'}),results=[];
try{
 for(const [width,height]of [[1440,900],[844,390],[390,844]]){
  const context=await browser.newContext({viewport:{width,height},hasTouch:width<1000,isMobile:width<1000,deviceScaleFactor:1}),page=await context.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)errors.push(r.status()+' '+r.url());});
  await page.goto('http://127.0.0.1:5208');await page.waitForFunction(()=>window.wormStudy);await page.evaluate(()=>document.fonts.ready);await page.waitForTimeout(700);
  const start=await page.evaluate(()=>window.wormStudy.getState());assert.equal(start.segments,30);
  await page.screenshot({path:fileURLToPath(new URL(width+'x'+height+'.png',out)),fullPage:true});
  await page.locator('#pause').click();const frozen=await page.locator('#route').evaluate(c=>c.toDataURL());await page.waitForTimeout(180);assert.equal(await page.locator('#route').evaluate(c=>c.toDataURL()),frozen);
  await page.locator('#hit').click();assert.equal((await page.evaluate(()=>window.wormStudy.getState())).segments,27);
  for(let i=0;i<4;i++)await page.locator('#hit').click();
  assert.equal((await page.evaluate(()=>window.wormStudy.getState())).segments,15);
  await page.locator('#health').fill('0');assert.equal((await page.evaluate(()=>window.wormStudy.getState())).segments,0);
  await page.locator('#reset').click();assert.equal((await page.evaluate(()=>window.wormStudy.getState())).segments,30);
  await page.locator('#zoom').click();assert.equal((await page.evaluate(()=>window.wormStudy.getState())).zoom,2);
  await page.screenshot({path:fileURLToPath(new URL(width+'-detail.png',out))});await page.locator('#zoom').click();
  await page.locator('#pause').click();await page.waitForTimeout(1400);const moving=await page.evaluate(()=>window.wormStudy.getState());assert.ok(moving.distance>start.distance);
  let min=Infinity,max=0;for(let i=1;i<moving.centres.length;i++){const a=moving.centres[i-1],b=moving.centres[i],distance=Math.hypot(a.x-b.x,a.y-b.y);min=Math.min(min,distance);max=Math.max(max,distance);}assert.ok(min>9&&max<18,'connected segment spacing');
  const viewport=await page.evaluate(async()=>({width:innerWidth,scroll:document.documentElement.scrollWidth,storage:localStorage.length,databases:(await indexedDB.databases()).length}));assert.equal(viewport.width,viewport.scroll);assert.equal(viewport.storage,0);assert.equal(viewport.databases,0);
  await page.emulateMedia({reducedMotion:'reduce'});await page.waitForFunction(()=>window.wormStudy.getState().paused);
  assert.deepEqual(errors,[]);results.push({width,height,segments:30,half:15,scale:start.scale,headSpacing:start.headSpacing,lengthApprox:start.headSpacing+30*start.spacing,spacing:{min,max},pause:true,zoom:true,reducedMotion:true,noHorizontalPageOverflow:true,errors});
  console.log(width+'x'+height+' OK');await context.close();
 }
 // Inspect the head joint over one complete route, including all turn directions.
 const page=await browser.newPage({viewport:{width:1100,height:840}});
 await page.clock.install({time:0});await page.clock.pauseAt(1000);
 await page.goto('http://127.0.0.1:5208/');await page.waitForFunction(()=>window.wormStudy);await page.evaluate(()=>document.fonts.ready);
 await page.locator('#zoom').click();
 const first=await page.evaluate(()=>window.wormStudy.getState()),seen=new Set();let headMin=Infinity,headMax=0;
 for(let i=0;i<Math.ceil(first.length/48/.25)+2;i++){
  await page.clock.runFor(250);const state=await page.evaluate(()=>window.wormStudy.getState());
  const [head,body]=state.centres,gap=Math.hypot(head.x-body.x,head.y-body.y);
  headMin=Math.min(headMin,gap);headMax=Math.max(headMax,gap);
  const sector=((Math.round(head.angle/(Math.PI/4))%8)+8)%8;
  if(!seen.has(sector)){
   seen.add(sector);const box=await page.locator('#route').boundingBox();
   await page.screenshot({path:fileURLToPath(new URL('head-'+sector+'.png',out)),clip:{x:box.x+box.width/2-70,y:box.y+box.height/2-70,width:140,height:140}});
  }
 }
 assert.equal(seen.size,8);assert.ok(headMin>10&&headMax<12.6,'compact head joint through a complete route');
 results.push({headJoint:{configured:first.headSpacing,min:headMin,max:headMax,directions:seen.size,completeRoute:true}});
 console.log('Head joint: full route / eight directions OK');await page.close();
 await writeFile(new URL('results.json',out),JSON.stringify(results,null,2));
}finally{await browser.close();}
