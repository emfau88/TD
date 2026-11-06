import { chromium } from 'file:///C:/Users/madde/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
const out=new URL('./progress/',import.meta.url);await mkdir(out,{recursive:true});
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,args:['--disable-gpu']});const results=[];
try{
 for(const width of [1280,320]) for(const language of ['de','en']){
  const page=await browser.newPage({viewport:{width,height:844}});const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:5277/tavern-rig-check.html?artwork=video');await page.waitForFunction(()=>window.tavernReview&&document.querySelector('.tv-figure canvas')?.dataset.clip==='idle');
  await page.selectOption('#review-language',language);
  for(const [points,clears] of [[58,18],[47,30],[58,30]]){
   await page.evaluate(({points,clears})=>{const f=window.tavernReview,s=f.session.battle.social;s.points.mara=points;s.personal.mara={clears,claimed:false};s.reserves.mara={talk:3,touch:3,clears:0};f.ui.update();},{points,clears});
   const hint=await page.locator('[data-text=gift-hint]').textContent();
   if(clears===18)assert.match(hint,/12/);
   if(points===58&&clears===30)assert.equal(await page.locator('[data-action=gift]').isDisabled(),false);
   assert.equal(await page.locator('.tv-actions > button').count(),3);
   const bounds=await page.evaluate(()=>{const r=document.querySelector('[data-text=gift-hint]').getBoundingClientRect(),c=document.querySelector('.tv-conversation').getBoundingClientRect();return {fullyVisible:r.top>=c.top&&r.bottom<=c.bottom,hintBottom:r.bottom,containerBottom:c.bottom,overflow:document.documentElement.scrollWidth>innerWidth};});
   assert.equal(bounds.overflow,false);
   await page.locator('#tavern-dialog').screenshot({path:fileURLToPath(new URL(`${language}-${width}-${points}-${clears}.png`,out))});
   results.push({width,language,points,clears,hint,bounds});
  }
  await page.evaluate(()=>{const f=window.tavernReview;f.session.battle.social.points.mara=47;f.ui.update();});
  await page.click('[data-moment="3"]');assert.notEqual(await page.locator('[data-text=result]').textContent(),'');assert.equal(await page.locator('.tv-story-heading').isVisible(),false);
  await page.evaluate(()=>{const f=window.tavernReview;f.session.battle.social.points.mara=8;f.session.battle.social.reserves.mara={talk:3,touch:0,clears:0};f.ui.update();});
  await page.click('[data-do=speak]');await page.click('[data-action=talk]');await page.waitForSelector('[data-moment="1"][data-celebrating="true"]');
  await page.click('[data-do=new-moment]');await page.waitForFunction(()=>document.querySelector('.tv-figure canvas')?.dataset.clip==='touch');
  assert.deepEqual(errors,[]);await page.close();
 }
 await writeFile(new URL('results.json',out),JSON.stringify(results,null,2));console.log(JSON.stringify({cases:results.length,hintsVisible:results.filter(r=>r.bounds.fullyVisible).length,errors:0}));
}finally{await browser.close();}
