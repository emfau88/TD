import assert from 'node:assert/strict';
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE);
import { mkdirSync, writeFileSync } from 'node:fs';
const out='artifacts/idle-bastion/acceptance/language';mkdirSync(out,{recursive:true});
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
const report=[];
try {for(const width of [320,390,1440]){
 const mobile=width<700;
 const context=await browser.newContext({viewport:{width,height:mobile?844:960},isMobile:mobile,hasTouch:mobile,locale:'de-DE'});
 const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto((process.env.SPIRE_TEST_URL??'http://127.0.0.1:5203')+'/?fresh=1');
 await page.waitForSelector('#game canvas');await page.waitForTimeout(1000);
 const target=new URL(page.url());assert.ok(target.searchParams.get('probe'));assert.equal(target.searchParams.has('fresh'),false);
 const cardIssues=await page.evaluate(()=>[...document.querySelectorAll('.build-card strong,.build-card b')].flatMap(el=>{
  if(!el.getClientRects().length||el.closest('[hidden]'))return[];
  const card=el.closest('.build-card').getBoundingClientRect(),range=document.createRange();range.selectNodeContents(el);const rect=range.getBoundingClientRect();
  return rect.left<card.left+2||rect.right>card.right-2||rect.top<card.top+2||rect.bottom>card.bottom-2?[el.textContent.trim()]:[];
 }));assert.deepEqual(cardIssues,[],'Fresh tutorial card text remains within borders');
 const first=await page.locator('body').innerText();assert.equal(await page.locator('html').getAttribute('lang'),'en');assert.ok(first.includes('Starter tower'));
 await page.screenshot({path:out+'/'+(width===390?'mobile':width===320?'small-mobile':'desktop')+'-english.png'});
 await page.locator('#open-menu').click();
 const menu=await page.locator('#game-menu').innerText();assert.ok(menu.includes('Language'));assert.ok(menu.includes('Audio'));
 await page.locator('#language-choice').selectOption('de');
 const de=await page.locator('#game-menu').innerText();assert.ok(de.includes('Sprache'));assert.ok(de.includes('Ton'));
 await page.reload();await page.waitForSelector('#game canvas');
 const saved=await page.locator('html').getAttribute('lang');
 const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth);assert.equal(saved,'de');assert.deepEqual(errors,[]);assert.equal(overflow,false);report.push({width,mobile,freshIsolated:true,errors,cardIssues,defaultEnglish:true,germanSelectable:true,saved,overflow});
 await context.close();
}} finally {await browser.close();}
writeFileSync(out+'/production-browser.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
