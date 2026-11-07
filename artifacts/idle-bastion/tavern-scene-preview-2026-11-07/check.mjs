import { chromium } from 'file:///C:/Users/madde/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
import { writeFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
const results=[];
try{
 for(const width of [1200,390]){
  const page=await browser.newPage({viewport:{width,height:900},isMobile:width===390,hasTouch:width===390});const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:5292/');
  const check=async code=>{
    await page.waitForFunction(code=>document.querySelector('.stage').dataset.clip===code&&document.querySelector('video.visible')?.readyState>=2,code);
    assert.equal(await page.locator('video.visible').count(),1);
    assert.equal(await page.locator('#error').isVisible(),false);
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  };
  const played=[];
  for(const [hero,prefix,count] of [['mara','MC',7],['ilyra','IF',5]]){
    await page.click(`[data-hero=${hero}]`);await check(prefix+'01');
    for(let i=2;i<=count;i++){
      const code=prefix+String(i).padStart(2,'0');await page.click(`button[data-clip=${code}]`);await check(code);played.push(code);
      if(code==='MC07'||code==='IF05'){await page.waitForTimeout(800);await page.screenshot({path:new URL(`${hero}-${width}.png`,import.meta.url).pathname.slice(1),fullPage:true});}
      await check(prefix+'01');
    }
  }
  // Several competing selections while another reaction is active.
  await page.evaluate(()=>{document.querySelector('button[data-clip=IF04]').click();document.querySelector('[data-hero=mara]').click();document.querySelector('button[data-clip=MC06]').click();document.querySelector('[data-hero=ilyra]').click();document.querySelector('button[data-clip=IF05]').click();});
  await check('IF05');await check('IF01');
  assert.deepEqual(errors,[]);assert.equal(await page.evaluate(()=>localStorage.length),0);
  results.push({width,played,returnToIdle:true,rapidSwitch:true,noOverflow:true,noPageErrors:true,noSaveAccess:true});await page.close();
 }
 // The downloadable single file must also work without the HTTP server.
 const offline=await browser.newPage();await offline.goto(new URL('index.html',import.meta.url).href+'?hero=ilyra');
 await offline.waitForFunction(()=>document.querySelector('.stage').dataset.clip==='IF01');
 await offline.click('[data-clip=IF05]');await offline.waitForFunction(()=>document.querySelector('.stage').dataset.clip==='IF05');await offline.close();
 await writeFile(new URL('results.json',import.meta.url),JSON.stringify({passed:true,offlineFile:true,results},null,2)+'\n');console.log(JSON.stringify({passed:true,offlineFile:true,results}));
}finally{await browser.close();}
