import {chromium} from 'file:///C:/Users/madde/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
import assert from 'node:assert/strict';
import {writeFile} from 'node:fs/promises';
const out='artifacts/idle-bastion/acceptance/map-edge-fix-2026-10-27';
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true}),results=[];
try{for(const width of [1440,390]){
 const mobile=width<700;
 const page=await browser.newPage({viewport:{width,height:900},isMobile:mobile,hasTouch:mobile}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.addInitScript(()=>localStorage.setItem('spire-language-v1','de'));
 await page.goto('http://127.0.0.1:5253/?fresh=1');
 await page.locator('#boot-screen').waitFor({state:'hidden',timeout:60000});
 await page.locator('#onboarding-primary').click();
 await page.waitForFunction(()=>document.querySelector('#app')?.dataset.maraIntro==='1');
 await page.waitForTimeout(1400);await page.screenshot({path:out+'/production-intro-'+width+'.png'});
 await page.locator('#onboarding-primary').click();await page.locator('#onboarding-primary').click();
 await page.waitForFunction(()=>document.querySelector('#app')?.dataset.intro==='build');
 await page.waitForTimeout(300);await page.screenshot({path:out+'/production-after-intro-'+width+'.png'});
 if(mobile){
   const c=await page.context().newCDPSession(page);
   await c.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:40,y:430}]});
   for(let i=1;i<=18;i++)await c.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:40+(width-65)*i/18,y:430}]});
   await c.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
 }else{await page.mouse.move(60,430);await page.mouse.down({button:'middle'});await page.mouse.move(width-25,430,{steps:25});await page.mouse.up({button:'middle'});}
 await page.waitForTimeout(250);await page.screenshot({path:out+'/production-spawn-left-'+width+'.png'});
 if(!mobile)await page.screenshot({path:out+'/production-spawn-left-1440-detail.png',clip:{x:0,y:70,width:650,height:650}});
 await page.locator('#camera-reset').click();
 await page.waitForTimeout(250);await page.screenshot({path:out+'/production-overview-'+width+'.png'});
 assert.deepEqual(errors,[]);
 results.push({width,stage:await page.locator('#app').getAttribute('data-intro'),errors});await page.close();
}await writeFile(out+'/production-results.json',JSON.stringify(results,null,2)+'\n');console.log(JSON.stringify(results));}finally{await browser.close();}
