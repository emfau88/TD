import {chromium} from 'file:///C:/Users/madde/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
import assert from 'node:assert/strict';
import {writeFile} from 'node:fs/promises';
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
const results=[];
try {
for(const who of ['mara','ilyra']) {
 const page=await browser.newPage({viewport:{width:who==='mara'?1280:390,height:850}});const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:5252/tavern-rig-check.html?hero='+who);
 const dialog=page.locator('#tavern-dialog'), canvas=dialog.locator('.tv-figure canvas');
 await dialog.waitFor();await page.waitForFunction(()=>document.querySelector('.tv-figure canvas')?.dataset.clip==='idle');
 for(const hearts of [0,1,2,3,4,5]) {
  await dialog.locator('[data-do=close]').first().click();
  await page.locator('#review-hearts').selectOption(String(hearts));
  await page.locator('#review-'+who).click();await dialog.waitFor();
  await page.waitForFunction(()=>document.querySelector('.tv-figure canvas')?.dataset.clip==='idle');
  if(hearts<2){assert.equal(await dialog.locator('[data-do=touch]').isDisabled(),true);continue;}
  await dialog.locator('[data-do=touch]').click();
  const expected=hearts===2?['shoulder']:hearts===3?['shoulder','hair']:['shoulder','hair','hand'];
  for(const region of ['shoulder','hair','hand']) {
   const button=dialog.locator('[data-region='+region+']');
   assert.equal(await button.isEnabled(),expected.includes(region));
   if(expected.includes(region)) {
    await button.click();const clip={shoulder:'touch',hair:'head',hand:'giggle'}[region];
    await page.waitForFunction(expected=>document.querySelector('.tv-figure canvas')?.dataset.clip===expected,clip,{timeout:15000});
    const cachedPages=Number(await canvas.getAttribute('data-cached-pages'));assert.ok(cachedPages<=14);results.push({who,hearts,region,clip:await canvas.getAttribute('data-clip'),cachedPages});
   }
  }
 }
 await dialog.locator('[data-moment="1"]').click();
 await page.waitForFunction(()=>document.querySelector('.tv-figure canvas')?.dataset.clip==='head');
 await dialog.locator('[data-do=story-next]').click();
 await page.waitForFunction(()=>document.querySelector('.tv-figure canvas')?.dataset.clip==='idle');
 results.push({who,storyOneSecondBeat:'idle',errors});assert.deepEqual(errors,[]);
 await page.screenshot({path:'artifacts/idle-bastion/acceptance/t12/touches-'+who+'.png'});
 await page.close();
}
await writeFile('artifacts/idle-bastion/acceptance/t12/touches-results.json',JSON.stringify(results,null,2));
console.log(JSON.stringify(results));
} finally {await browser.close();}
