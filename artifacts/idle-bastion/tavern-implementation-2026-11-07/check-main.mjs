import { chromium } from 'file:///C:/Users/madde/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
const out = new URL('./main/', import.meta.url); await mkdir(out, { recursive: true });
const browser = await chromium.launch({ executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,args:['--disable-gpu'] });
const results=[];
try {
 for(const width of [1280,320]) {
  const page=await browser.newPage({viewport:{width,height:844}}),errors=[],old=[];
  await page.addInitScript(()=>localStorage.setItem('spire-audio-mix-v1',JSON.stringify({music:0,effects:.55,voices:.55,muted:false})));
  page.on('pageerror',e=>errors.push(e.message));
  page.on('request',r=>{if(r.resourceType()==='image'&&/tavern-rig\/.*\/\d+\.webp/.test(r.url()))old.push(r.url());});
  await page.goto('http://127.0.0.1:5277/tests/browser/tavern-session.html');
  await page.selectOption('#hearts','35');await page.selectOption('#language','de');await page.click('#ilyra');
  const link=page.locator('#result a');await link.waitFor();const url=await link.getAttribute('href');
  await page.goto(new URL(url,'http://127.0.0.1:5277/tests/browser/tavern-session.html').href,{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>document.querySelector('#boot-screen')?.hidden===true,{timeout:60000});
  await page.waitForFunction(()=>document.querySelector('#pick-tavern')?.hidden===false,{timeout:60000});
  if(await page.locator('#claim-offline').isVisible()) await page.click('#claim-offline');
  await page.locator('#return-card').waitFor({state:'hidden'});
  await page.evaluate(()=>document.querySelector('#pick-tavern').click());
  await page.locator('#tavern-dialog[open]').waitFor();await page.click('#tavern-dialog [data-do=ilyra]');
  await page.waitForFunction(()=>document.querySelector('.tv-figure canvas')?.dataset.renderer==='video'&&document.querySelector('.tv-figure canvas')?.dataset.clip==='idle');
  await page.locator('#tavern-dialog').screenshot({path:fileURLToPath(new URL(`ilyra-${width}.png`,out))});
  await page.click('#tavern-dialog [data-region=shoulder]');
  await page.waitForFunction(()=>document.querySelector('.tv-figure canvas')?.dataset.clip==='touch');
  await page.click('#tavern-dialog .tv-close');
  await page.reload();await page.waitForFunction(()=>document.querySelector('#boot-screen')?.hidden===true,{timeout:60000});await page.waitForFunction(()=>document.querySelector('#pick-tavern')?.hidden===false);
  if(await page.locator('#claim-offline').isVisible()) await page.click('#claim-offline');
  await page.locator('#return-card').waitFor({state:'hidden'});
  await page.evaluate(()=>document.querySelector('#pick-tavern').click());
  await page.click('#tavern-dialog [data-do=ilyra]');
  await page.waitForFunction(()=>document.querySelector('.tv-figure canvas')?.dataset.clip==='idle');
  assert.deepEqual(errors,[]);assert.deepEqual(old,[]);
  results.push({width,errors,oldAtlasImages:old,reload:true,actualMainVideo:true,probeUrl:page.url()});await page.close();
 }
 await writeFile(new URL('results.json',out),JSON.stringify(results,null,2));console.log(JSON.stringify(results));
} finally {await browser.close();}
