import {chromium} from 'file:///C:/Users/madde/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
import {mkdir,writeFile} from 'node:fs/promises';
const out='artifacts/idle-bastion/acceptance/map-edge-review-2026-10-27';await mkdir(out,{recursive:true});
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true}),results=[];
try{for(const width of [1440,390]){
 const page=await browser.newPage({viewport:{width,height:900}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.addInitScript(()=>localStorage.setItem('spire-language-v1','de'));
 await page.goto('http://127.0.0.1:5253/?fresh=1');await page.locator('#boot-screen').waitFor({state:'hidden',timeout:60000});
 await page.locator('#onboarding-primary').click();await page.waitForFunction(()=>document.querySelector('#app')?.dataset.maraIntro==='1');
 await page.waitForTimeout(1400);await page.screenshot({path:out+'/intro-spawn-'+width+'.png'});
 await page.locator('#onboarding-primary').click();await page.locator('#onboarding-primary').click();
 await page.waitForFunction(()=>document.querySelector('#app')?.dataset.intro==='build');
 await page.screenshot({path:out+'/after-intro-'+width+'.png'});
 await page.mouse.move(70,300);await page.mouse.down();await page.mouse.move(Math.min(width-25,800),300,{steps:25});await page.mouse.up();
 await page.screenshot({path:out+'/spawn-left-'+width+'.png'});
 if(width>700)await page.screenshot({path:out+'/spawn-left-'+width+'-detail.png',clip:{x:0,y:70,width:650,height:650}});
 results.push({width,stage:await page.locator('#app').getAttribute('data-intro'),errors});await page.close();
}await writeFile(out+'/results.json',JSON.stringify(results,null,2));console.log(JSON.stringify(results));}finally{await browser.close();}
