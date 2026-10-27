import {chromium} from 'file:///C:/Users/madde/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
import assert from 'node:assert/strict';
import {writeFile} from 'node:fs/promises';
const out='artifacts/idle-bastion/acceptance/tower-stat-icons-2026-10-27', results=[];
const origin=process.env.CHECK_ORIGIN||'http://127.0.0.1:5254';
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
const profiles=[[1440,900,'en'],[390,844,'en'],[320,568,'de'],[844,390,'en']].filter(([w])=>!process.env.CHECK_WIDTH||w===Number(process.env.CHECK_WIDTH));
try { for(const [width,height,lang] of profiles) {
 const page=await browser.newPage({viewport:width===844?{width:390,height:844}:{width,height},isMobile:width<700,hasTouch:width<700}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.addInitScript(lang=>localStorage.setItem('spire-language-v1',lang),lang);
 const click=async selector=>{if(width<700)await page.locator(selector).tap();else await page.locator(selector).click();};
 const tapPointer=async()=>{const pt=await page.locator('#lesson-pointer').evaluate(e=>({x:parseFloat(e.style.left),y:parseFloat(e.style.top)}));if(width<700)await page.touchscreen.tap(pt.x,pt.y);else await page.mouse.click(pt.x,pt.y);};
 await page.goto(origin+'/?fresh=1',{waitUntil:'domcontentloaded'});
 await page.locator('#boot-screen').waitFor({state:'hidden',timeout:60000});
 for(let i=0;i<3;i++)await click('#onboarding-primary');
 await click('#pick-archer');await tapPointer();
 await page.waitForFunction(()=>document.getElementById('app').dataset.intro==='ready');
 await click('#onboarding-primary');
 await page.waitForFunction(()=>document.getElementById('app').dataset.intro==='upgrade',null,{timeout:30000});
 await tapPointer();await page.locator('#context-panel').waitFor({state:'visible'});
 if(width===844)await page.setViewportSize({width,height});
 await page.evaluate(()=>document.fonts.load('500 19px "Pixelify Sans"'));
 const stats=await page.locator('#tower-stats').evaluate(el=>[...el.children].map(row=>{
   const term=row.querySelector('dt'),value=row.querySelector('dd'),icon=term.querySelector('svg'),r=row.getBoundingClientRect(),tr=term.getBoundingClientRect(),vr=value.getBoundingClientRect();
   return {label:term.textContent,value:value.textContent,icon:!!icon,decorative:icon?.getAttribute('aria-hidden'),fits:tr.right<=r.right+1&&vr.right<=r.right+1&&row.scrollWidth<=row.clientWidth+1};
 }));
 assert.equal(stats.length,4);assert.ok(stats.every(s=>s.icon&&s.decorative==='true'&&s.fits),JSON.stringify(stats));
 assert.deepEqual(stats.map(s=>s.label),lang==='de'?['Schaden','Reichweite','Angriff alle','Abschüsse']:['Damage','Range','Attack interval','Kills']);
 const icons=await page.locator('#tower-stats svg').evaluateAll(els=>els.map(el=>el.innerHTML));
 assert.equal(new Set(icons).size,4);
 assert.ok(await page.locator('[data-ui-icon] svg').count()>10);
 assert.equal(await page.locator('#pad-choice').isVisible(),false);
 const box=await page.locator('#context-panel').boundingBox();
 assert.ok(box.x>=0&&box.x+box.width<=width+1);
 await page.screenshot({path:out+(origin.startsWith('https:')?'/live-tower-':'/tower-')+width+'-'+lang+'.png'});
 await click('#upgrade');
 await page.waitForFunction(()=>document.getElementById('app').dataset.intro==='workshop');
 assert.deepEqual(errors,[]);
 results.push({width,height,lang,stats,panel:box,upgradeResumes:true,errors});
 console.log('tower icons and upgrade passed '+width+' '+lang);
 await page.close();
 }
 await writeFile(out+(origin.startsWith('https:')?'/live-results.json':'/browser-results.json'),JSON.stringify(results,null,2)+'\n');
} finally {await browser.close();}
