/** Run against the production preview in an isolated browser profile. */
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE??'playwright');
import {writeFileSync} from 'node:fs';
const base=process.env.SPIRE_TEST_URL??'http://127.0.0.1:5197';
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH??'C:/Program Files/Google/Chrome/Application/chrome.exe'}),errors=[],requests=[];
try {
 const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true}),page=await context.newPage();
 page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)errors.push(r.status()+' '+r.url());});page.on('request',r=>requests.push(r.url()));
 await page.goto(`${base}/enemy-lab.html`);await page.locator('article').last().waitFor();await page.waitForFunction(()=>[...document.querySelectorAll('article:not([hidden]) canvas')].some(c=>c.dataset.frame!==undefined),null,{timeout:5000}).catch(async e=>{throw Error(JSON.stringify({errors,reason:e.message,state:await page.evaluate(()=>({text:document.querySelector('#status').textContent,cards:[...document.querySelectorAll('article')].map(a=>({title:a.firstElementChild.textContent,hidden:a.hidden,frame:a.querySelector('canvas').dataset.frame}))}))}));});
 if(await page.locator('article:visible').count()!==4)throw Error('Public preview needs four legal new enemies');
 if(await page.locator('article').count()!==16)throw Error('Production preview must contain only the shipped roster');
 if(await page.locator('#group option').count()!==4)throw Error('Unexpected preview controls');
 const palettes=await page.locator('select[aria-label="Moospilz Farbvariante"] option').allTextContents();
 if(palettes.join('/')!=='Rote Kappe/Moosgrüne Kappe')throw Error('Moospilz palettes changed');
 await page.locator('#pause').click();await page.waitForTimeout(100);const first=await page.locator('article:visible canvas').evaluateAll(cs=>cs.map(c=>c.dataset.frame));await page.locator('#step').click();await page.waitForTimeout(70);
 const next=await page.locator('article:visible canvas').evaluateAll(cs=>cs.map(c=>c.dataset.frame));if(first.some((v,i)=>v===next[i]))throw Error('Public frame step failed '+JSON.stringify({first,next}));
 await page.goto(`${base}/?fresh=1`);await page.locator('#game canvas').waitFor();await page.waitForFunction(()=>!document.querySelector('#open-menu').disabled);await page.locator('#open-menu').click();await page.locator('#game-menu a[href="./enemy-credits.html"]').waitFor();
 await page.goto(`${base}/enemy-credits.html`);if(!await page.getByRole('link',{name:'Creative Commons Attribution 4.0 International',exact:true}).count())throw Error('Missing attribution license link');
 const result={errors,privateRequests:requests.filter(r=>r.includes('/.local-assets/')),loadedNewPNGs:requests.filter(r=>/\/(MossShroom|WoodSpider|HornedBat|EmberBomb)-[^/]+\.png/.test(r)),publicGallery:true,creditsReachableFromGame:true,pauseAndStep:true};if(errors.length||result.privateRequests.length)throw Error(JSON.stringify(result));
 writeFileSync('artifacts/idle-bastion/acceptance/local-enemy-assets/merge-ready/production-browser.json',JSON.stringify({...result,palettes},null,2));console.log(JSON.stringify(result));
}finally{await browser.close();}
