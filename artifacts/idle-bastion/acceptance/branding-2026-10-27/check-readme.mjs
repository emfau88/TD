import {chromium} from 'file:///C:/Users/madde/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
import assert from 'node:assert/strict';
import {writeFile} from 'node:fs/promises';
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
try {
 const page=await browser.newPage({viewport:{width:1280,height:900}});
 await page.goto('https://github.com/emfau88/TD',{waitUntil:'domcontentloaded'});
 const article=page.locator('article.markdown-body').filter({hasText:'Towers & Tantrums'});
 await article.getByRole('heading',{name:'Towers & Tantrums',exact:true}).waitFor({state:'visible',timeout:45000});
 const data=await article.evaluate(async el=>{
  const imgs=[...el.querySelectorAll('img')];await Promise.all(imgs.map(img=>img.decode().catch(()=>{})));
  return {heading:el.querySelector('h1').textContent,images:imgs.map(img=>({alt:img.alt,loaded:img.naturalWidth>0,src:img.getAttribute('src')})),historical:el.querySelector('details')?.querySelector('summary')?.textContent};
 });
 assert.equal(data.images.length,5);assert.ok(data.images.every(img=>img.loaded));
 assert.match(data.historical,/ältere Bildstände/);
 await writeFile('artifacts/idle-bastion/acceptance/branding-2026-10-27/readme-live.json',JSON.stringify(data,null,2)+'\n');
 console.log(JSON.stringify({heading:data.heading,loadedImages:data.images.length,historical:data.historical}));
} finally {await browser.close();}
