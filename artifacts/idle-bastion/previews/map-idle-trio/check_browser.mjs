import {fileURLToPath,pathToFileURL} from 'node:url';
import {dirname,join} from 'node:path';
import {writeFile,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const here=dirname(fileURLToPath(import.meta.url));
const browser=await chromium.launch({channel:'chrome',headless:true});
const results=[];await mkdir('qa/ilyra-map-idle/trio',{recursive:true});
try{
 for(const width of [320,390]){
  const context=await browser.newContext({viewport:{width,height:width===320?568:844},isMobile:true,hasTouch:true});
  const p=await context.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));
  await p.goto(pathToFileURL(join(here,'index.html')).href);
  assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  for(const id of ['mara-hip','mara-hair','ilyra-hip']){
   await p.locator(`nav a[href="#${id}"]`).click();
   const img=p.locator(`#${id} img`);await img.evaluate(i=>i.decode());
   assert.equal((await img.boundingBox()).width,width);
   const hashes=[];
   for(let i=0;i<4;i++){
    hashes.push(createHash('sha256').update(await img.screenshot()).digest('hex'));
    await p.waitForTimeout(350);
   }
   assert.ok(new Set(hashes).size>1,`${id} must animate`);
   assert.equal(await p.locator(`#${id} a[download]`).getAttribute('href'),await img.getAttribute('src'));
   await img.screenshot({path:`qa/ilyra-map-idle/trio/${id}-${width}.png`});
   results.push({pose:id,width,loads:true,animates:true,downloadTargetsGif:true,noHorizontalOverflow:true});
  }
  assert.deepEqual(errors,[]);await context.close();
 }
 await writeFile(join(here,'browser-checks.json'),JSON.stringify({mobileEmulation:true,physicalPhone:false,errors:[],results},null,2)+'\n');
 console.log(JSON.stringify(results));
}finally{await browser.close();}
