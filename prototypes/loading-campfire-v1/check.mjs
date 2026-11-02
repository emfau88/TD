import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
import {chromium} from 'file:///C:/Users/madde/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
const out=new URL('./checks/',import.meta.url);await mkdir(out,{recursive:true});
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'}),results=[];
try{
 for(const [width,height]of [[1440,900],[1920,1080],[844,390],[720,320],[390,844],[430,932]]){
  const context=await browser.newContext({viewport:{width,height},hasTouch:width<1000,isMobile:width<1000}),p=await context.newPage(),errors=[];
  p.on('pageerror',e=>errors.push(e.message));p.on('response',r=>{if(r.status()>=400)errors.push(`${r.status()} ${r.url()}`);});
  await p.goto('http://127.0.0.1:5207');await p.evaluate(async()=>{await document.fonts.ready;await Promise.all([...document.images].map(i=>i.decode()));});
  await p.waitForTimeout(900);
  const layout=await p.evaluate(()=>{const box=s=>{const r=document.querySelector(s).getBoundingClientRect();return{x:r.x,y:r.y,w:r.width,h:r.height,right:r.right,bottom:r.bottom};};return{scrollW:document.documentElement.scrollWidth,scrollH:document.documentElement.scrollHeight,title:box('.title-block'),camp:box('.camp'),loading:box('.loading'),tools:box('.tools'),fire:box('#fire'),asset:document.querySelector('#camp-art').currentSrc};});
  assert.equal(layout.scrollW,width);assert.equal(layout.scrollH,height);
  for(const key of ['title','camp','loading','tools','fire']){const r=layout[key];assert.ok(r.x>=-1&&r.y>=0&&r.right<=width+1&&r.bottom<=height,`${width} ${key} outside viewport`);}
  assert.ok(layout.title.bottom<layout.camp.y+layout.camp.h*.17,`${width} title covers faces`);
  const a=await p.locator('#fire').evaluate(c=>c.toDataURL());await p.waitForTimeout(160);const b=await p.locator('#fire').evaluate(c=>c.toDataURL());assert.notEqual(a,b,'generated fire frames change');
  await p.screenshot({path:new URL(`${width}x${height}.png`,out).pathname.replace(/^\/([A-Z]:)/,'$1')});
  await p.locator('#motion').click();await p.waitForTimeout(80);const frozen=await p.locator('#fire').evaluate(c=>c.toDataURL());await p.waitForTimeout(180);assert.equal(await p.locator('#fire').evaluate(c=>c.toDataURL()),frozen);
  assert.equal(await p.locator('.ember').first().evaluate(e=>getComputedStyle(e).visibility),'hidden');
  await p.locator('#lang').click();assert.equal(await p.locator('html').getAttribute('lang'),'en');assert.equal(await p.locator('#motion').getAttribute('aria-pressed'),'false');
  await p.emulateMedia({reducedMotion:'reduce'});assert.equal(await p.locator('.world').evaluate(e=>getComputedStyle(e).animationName),'none');
  if(width===390){await p.setViewportSize({width:844,height:390});await p.waitForFunction(()=>document.querySelector('#camp-art').currentSrc.endsWith('camp-wide.webp'));await p.setViewportSize({width,height});await p.waitForFunction(()=>document.querySelector('#camp-art').currentSrc.endsWith('camp-portrait.webp'));}
  if(width===720){await p.locator('#replay').waitFor({state:'visible',timeout:25000});assert.equal(await p.locator('.load-line').evaluate(e=>getComputedStyle(e).visibility),'hidden');await p.locator('#replay').click();assert.equal(await p.locator('#replay').isVisible(),false);assert.ok(Number(await p.locator('.track').getAttribute('aria-valuenow'))<5);}
  assert.deepEqual(errors,[]);results.push({width,height,...layout,animatedFire:true,pause:true,english:true,reducedMotion:true,errors});console.log(`${width}x${height} OK`);await context.close();
 }
 await writeFile(new URL('results.json',out),JSON.stringify(results,null,2));
}finally{await browser.close();}
