import {rename,mkdir} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {chromium} from 'file:///C:/Users/madde/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
const dir=fileURLToPath(new URL('checks/',import.meta.url));
await mkdir(dir,{recursive:true});
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
try{
 const context=await browser.newContext({viewport:{width:1100,height:840},recordVideo:{dir,size:{width:1100,height:840}}});
 const page=await context.newPage();
 await page.goto('http://127.0.0.1:5208/');
 await page.waitForFunction(()=>window.wormStudy);
 await page.evaluate(()=>document.fonts.ready);
 await page.waitForTimeout(4500);
 await page.locator('#health').fill('70');await page.waitForTimeout(2200);
 await page.locator('#health').fill('50');await page.waitForTimeout(2200);
 await page.locator('#health').fill('20');await page.waitForTimeout(2200);
 await page.locator('#reset').click();await page.waitForTimeout(4000);
 await page.screenshot({path:dir+'/obsidian-worm.png',fullPage:true});
 const video=page.video();await context.close();await rename(await video.path(),dir+'/obsidian-worm.webm');
 console.log(dir+'/obsidian-worm.webm');
}finally{await browser.close();}

