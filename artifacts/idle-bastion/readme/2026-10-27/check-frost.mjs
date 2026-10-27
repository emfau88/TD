import {chromium} from 'file:///C:/Users/madde/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
import assert from 'node:assert/strict';
import {writeFile} from 'node:fs/promises';
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
try {
 const page=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:5254/feature-check.html?scenario=frost');
 await page.waitForURL(/\?probe=/,{timeout:45000});
 await page.locator('#boot-screen').waitFor({state:'hidden',timeout:45000});
 if(await page.locator('#claim-offline').isVisible())await page.locator('#claim-offline').tap();
 await page.waitForFunction(()=>document.getElementById('app').dataset.intro==='frost');
 const data=await page.evaluate(()=>({stage:document.getElementById('app').dataset.intro,copy:document.getElementById('onboarding-card').innerText}));
 assert.deepEqual(errors,[]);
 await writeFile('artifacts/idle-bastion/readme/2026-10-27/frost-result.json',JSON.stringify({...data,errors},null,2)+'\n');
 console.log(JSON.stringify(data));
} finally {await browser.close();}
