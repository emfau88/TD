import {fileURLToPath,pathToFileURL} from 'node:url';
import {dirname,join} from 'node:path';
import {writeFile,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const here=dirname(fileURLToPath(import.meta.url)),results=[];
const browser=await chromium.launch({channel:'chrome',headless:true});
await mkdir('qa/ilyra-map-idle/trio',{recursive:true});
try{
 for(const width of [320,390]){
  const context=await browser.newContext({viewport:{width,height:width===320?568:844},isMobile:true,hasTouch:true});
  const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(pathToFileURL(join(here,'ilyra-hip-v3.html')).href);
  const img=page.locator('img');await img.evaluate(i=>i.decode());
  assert.equal((await img.boundingBox()).width,width);
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  assert.equal(await page.locator('a[download]').getAttribute('href'),'Ilyra-Hip-Shift-Handy-V3.gif');
  const hashes=[];
  for(let i=0;i<7;i++){
   hashes.push(createHash('sha256').update(await img.screenshot()).digest('hex'));
   await page.waitForTimeout(220);
  }
  assert.ok(new Set(hashes).size>2);assert.deepEqual(errors,[]);
  await img.screenshot({path:`qa/ilyra-map-idle/trio/ilyra-hip-${width}-v3.png`});
  results.push({width,loads:true,animates:true,downloadTargetsGif:true,noOverflow:true,errors});
  await context.close();
 }
 await writeFile(join(here,'ilyra-hip/rig-v3/browser-checks.json'),JSON.stringify({version:3,mobileEmulation:true,physicalPhone:false,results},null,2)+'\n');
 console.log(JSON.stringify(results));
}finally{await browser.close();}
