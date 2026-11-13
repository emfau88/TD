// Isolated build acceptance: all responses come from local build files or a
// mock SDK. No scores or test saves can reach the real Kongregate service.
import { chromium } from 'file:///C:/Users/madde/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
import assert from 'node:assert/strict';
import { readFile, writeFile } from 'node:fs/promises';
import { resolve, extname } from 'node:path';
const out = resolve('artifacts/idle-bastion/acceptance/kongregate-leaderboards-2026-11-13');
const build = resolve('experiments/idle-bastion/dist-kongregate');
const game = 'http://127.0.0.1:5293/games/towers/';
const parent = 'http://localhost:5293/';
const sdk = 'https://cdn1.kongregate.com/javascripts/kongregate_api.js';
const mime = { '.html':'text/html', '.js':'text/javascript', '.css':'text/css', '.json':'application/json',
  '.png':'image/png', '.webp':'image/webp', '.mp3':'audio/mpeg', '.wav':'audio/wav', '.mp4':'video/mp4', '.ttf':'font/ttf' };
const results = [], errors = [];
const browser = await chromium.launch({ executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe', headless:true });
const mockSDK = `window.submissions=[]; window.kongregateAPI={loadAPI:cb=>cb(),getAPI:()=>({
  services:{isGuest:()=>false,getUserId:()=>123,addEventListener:()=>{}},
  stats:{submit:(name,value)=>window.submissions.push([name,value])}})};`;
async function context(mode, query = '') {
  const ctx = await browser.newContext({viewport:{width:1000,height:650}});
  let requests = 0;
  await ctx.route('**/*', async route => {
    const url = route.request().url();
    if (url === sdk) {
      requests++;
      if (mode === 'blocked') return route.abort('failed');
      return route.fulfill({contentType:'text/javascript',body:mockSDK});
    }
    if (url === parent) return route.fulfill({contentType:'text/html',body:
      `<meta name="viewport" content="width=device-width,initial-scale=1"><style>body{margin:0}iframe{border:0;width:100vw;height:100vh}</style><iframe src="${game + query}"></iframe>`});
    assert.ok(url.startsWith(game), 'Unexpected network request: ' + url);
    const relative = decodeURIComponent(new URL(url).pathname.slice('/games/towers/'.length)) || 'index.html';
    const path = resolve(build, relative);
    assert.ok(path.startsWith(build));
    await route.fulfill({contentType:mime[extname(path)] ?? 'application/octet-stream',body:await readFile(path)});
  });
  const page = await ctx.newPage(); page.on('pageerror', error => errors.push(error.message));
  await page.goto(parent);
  const frame = page.frames().find(frame => frame.url().startsWith(game));
  assert.ok(frame);
  await frame.locator('#boot-screen').waitFor({state:'hidden',timeout:60000});
  await frame.locator('#onboarding-primary').waitFor({state:'visible'});
  return {ctx,page,frame,requests:()=>requests};
}
async function pointer(page, frame, target) {
  const point = frame.locator('#lesson-pointer[data-target="' + target + '"]');
  await point.waitFor({state:'visible'});
  const {x,y} = await point.evaluate(e => ({x:parseFloat(e.style.left),y:parseFloat(e.style.top)}));
  await page.mouse.click(x,y);
}
try {
  const {ctx,page,frame,requests} = await context('connected');
  for (let i=0;i<3;i++) await frame.locator('#onboarding-primary').click();
  await frame.waitForFunction(() => document.getElementById('app').dataset.intro === 'build');
  await frame.locator('#pick-archer').click(); await pointer(page,frame,'starter');
  await frame.waitForFunction(() => document.getElementById('app').dataset.intro === 'ready');
  await frame.locator('#onboarding-primary').click();
  await frame.waitForFunction(() => document.getElementById('app').dataset.intro === 'upgrade', null, {timeout:30000});
  await pointer(page,frame,'upgrade'); await frame.locator('#upgrade').click();
  await frame.waitForFunction(() => document.getElementById('app').dataset.intro === 'workshop', null, {timeout:60000});
  await frame.waitForFunction(() => ['Highest Wave','Best Gold per Minute','Enemies Defeated'].every(name =>
    window.submissions?.some(([key,value]) => key === name && value > 0)), null, {timeout:45000}).catch(async error => {
      console.log(JSON.stringify({requests:requests(),errors,details:await frame.evaluate(async () => ({
        submissions:window.submissions, safeRate:document.getElementById('safe-rate')?.textContent,
        save:await new Promise(resolve => {const request=indexedDB.open('spire-idle-bastion');request.onsuccess=()=>{
          const db=request.result, read=db.transaction('saves').objectStore('saves').get('default');
          read.onsuccess=()=>{const s=read.result;resolve({highest:s.battle.highestCleared,kills:s.battle.kills,record:s.bestFarmGoldPerMinute,certificate:s.offline.baseline.certificate});db.close();};};})
      }))},null,2)); throw error;
    });
  // The workshop lesson already holds combat after this first clear.
  const submitted = await frame.evaluate(() => Object.fromEntries(window.submissions));
  assert.equal(submitted['Highest Wave'],1); assert.equal(requests(),1);
  await page.screenshot({path:out+'/local-game.png'});
  await page.reload();
  const reloaded = page.frames().find(f => f.url().startsWith(game));
  await reloaded.locator('#boot-screen').waitFor({state:'hidden',timeout:60000});
  await reloaded.waitForFunction(() => window.submissions?.length >= 3, null, {timeout:15000});
  assert.deepEqual(await reloaded.evaluate(() => Object.fromEntries(window.submissions)),submitted);
  results.push({case:'regular-game',savedScores:submitted,reloadResubmits:true,sdkLoadedOncePerPage:requests()===2});
  await ctx.close();
  for (const [mode,query] of [['blocked',''],['connected','?probe=leaderboards-qa']]) {
    const check = await context(mode,query);
    // Wait on the actual startup heartbeat rather than speeding up simulation.
    await check.frame.waitForTimeout(1500);
    assert.equal(await check.frame.locator('#onboarding-primary').isEnabled(),true);
    assert.equal(check.requests(),query ? 0 : 1);
    results.push({case:query?'probe-excluded':'api-unavailable',gameStarts:true,sdkRequests:check.requests()});
    await check.ctx.close();
  }
  assert.deepEqual(errors,[]);
  await writeFile(out+'/browser-results.json',JSON.stringify({results,errors},null,2)+'\n');
  console.log(JSON.stringify({results,errors},null,2));
} finally { await browser.close(); }
