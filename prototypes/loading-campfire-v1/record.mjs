import {chromium} from 'file:///C:/Users/madde/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
import {mkdir,rename} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
const folder=fileURLToPath(new URL('./checks/video/',import.meta.url));await mkdir(folder,{recursive:true});
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
try{
 const context=await browser.newContext({viewport:{width:1280,height:720},recordVideo:{dir:folder,size:{width:1280,height:720}}}),page=await context.newPage(),errors=[];
 page.on('pageerror',e=>errors.push(e.message));await page.goto('http://127.0.0.1:5207');
 await page.evaluate(async()=>{await document.fonts.ready;await Promise.all([...document.images].map(i=>i.decode()));});
 await page.waitForTimeout(12000);const video=page.video();await context.close();
 if(errors.length)throw new Error(errors.join('\n'));
 const dest=fileURLToPath(new URL('./checks/animated-preview-effects-v2.webm',import.meta.url));await rename(await video.path(),dest);console.log(dest);
}finally{await browser.close();}
