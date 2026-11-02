// Small production-build probe. Run after npm run build and vite preview on port 5199.
import assert from 'node:assert/strict';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { chromium } from 'file:///C:/Users/madde/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
const base = process.env.LOADING_CHECK_URL || 'http://127.0.0.1:5199/';
const out = new URL('../../artifacts/idle-bastion/acceptance/loading-scene-2026-11-02/', import.meta.url);
await mkdir(out, { recursive: true });
const html = await readFile(new URL('../../experiments/idle-bastion/dist/index.html', import.meta.url), 'utf8');
const entry = html.match(/<script type="module" crossorigin src="([^"]+)"/)[1].split('/').pop();
assert.equal((html.match(/data:image\/webp;base64/g) || []).length, 4, 'all four tiny images inline');
assert.ok(html.includes('<style data-boot-style>'),'critical loader styles inline');
const browser = await chromium.launch({ headless: true, executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
const results = { inlineImages: 4, htmlBytes: Buffer.byteLength(html), layouts: [], performance: [], lifecycle: {}, realStartup: [] };
async function pageFor(width, height, isolated = true, options = {}) {
  const context = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: width < 1000 ? 2 : 1, hasTouch: width < 1000, isMobile: width < 1000, ...options });
  const page = await context.newPage(), errors = [], requests = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('request', r => requests.push(r.url()));
  if (isolated) await page.route('**/assets/**', route => {
    const path = new URL(route.request().url()).pathname;
    // Keep the genuine bootstrap/loader, replace only the game import for observation.
    if (path.endsWith('.js') && !path.endsWith(entry) && !/startup-|modulepreload-polyfill-|preload-helper-/.test(path)) return route.fulfill({ contentType: 'text/javascript', body: '' });
    if (path.endsWith('.css') && !path.includes('battle-')) return route.fulfill({ contentType: 'text/css', body: '' });
    return route.continue();
  });
  return { context, page, errors, requests };
}
const snapshot = page => page.evaluate(() => {
  const box = selector => { const r = document.querySelector(selector).getBoundingClientRect(); return { x:r.x, y:r.y, right:r.right, bottom:r.bottom, width:r.width, height:r.height }; };
  return { title:box('.boot-copy'), camp:box('.boot-camp'), status:box('.boot-status'), fire:box('#boot-fire'), motion:box('#boot-motion'), detail:[...document.querySelectorAll('.boot-hi')].map(i=>i.dataset.source) };
});
try {
  for (const [width, height] of [[1440,900],[1920,1080],[844,390],[932,430],[720,360],[390,844]]) {
    const { context, page, errors, requests } = await pageFor(width,height);
    await page.goto(base);
    await page.waitForFunction(() => document.querySelectorAll('.boot-hi.is-ready').length === 3 && document.querySelector('#boot-screen').hasAttribute('data-fire-ready'));
    await page.evaluate(async () => { await document.fonts.ready; document.querySelector('#boot-count').textContent='128 / 160 artwork files loaded'; });
    const layout = await snapshot(page);
    for (const [name,r] of Object.entries(layout).filter(([name])=>name!=='detail')) assert.ok(r.x>=-1 && r.y>=0 && r.right<=width+1 && r.bottom<=height+1, `${width} ${name} outside viewport`);
    assert.ok(layout.title.bottom < layout.camp.y + layout.camp.height * .2, 'title clear of faces');
    assert.ok(layout.fire.bottom < layout.status.y, 'status below fire');
    const effects = await page.evaluate(() => {
      const cloud = document.querySelector('#boot-cloud'), animation = cloud.getAnimations()[0], timing = animation.effect.getTiming();
      animation.pause(); animation.currentTime=0;
      const start=getComputedStyle(cloud).transform;
      animation.currentTime=12000; const end=getComputedStyle(cloud).transform;
      animation.currentTime=16000; const held=getComputedStyle(cloud).transform;
      animation.currentTime=4000; animation.play();
      return {start,end,held,duration:timing.duration,iterations:timing.iterations,embers:document.querySelectorAll('.boot-ember').length,large:document.querySelectorAll('.boot-ember-large').length,bar:document.querySelector('#boot-progress').getBoundingClientRect().height,shimmer:getComputedStyle(document.querySelector('h1 span'),'::after').animationName};
    });
    assert.notEqual(effects.start,effects.end); assert.equal(effects.end,effects.held);
    assert.equal(effects.duration,12000); assert.equal(effects.iterations,1);
    assert.equal(effects.embers,24); assert.equal(effects.large,2); assert.ok(effects.bar>=7);
    assert.equal(effects.shimmer,'boot-title-glint');
    const first = await page.locator('#boot-fire').evaluate(c=>c.toDataURL());
    await page.waitForTimeout(160);
    assert.notEqual(await page.locator('#boot-fire').evaluate(c=>c.toDataURL()),first);
    await page.screenshot({ path:fileURLToPath(new URL(`${width}x${height}.jpg`,out)), quality:85 });
    await page.locator('#boot-motion').click();
    const frozen = await page.locator('#boot-fire').evaluate(c=>c.toDataURL());
    await page.waitForTimeout(250);
    assert.equal(await page.locator('#boot-fire').evaluate(c=>c.toDataURL()),frozen);
    assert.equal(await page.locator('.boot-ember').first().evaluate(e=>getComputedStyle(e).visibility),'hidden');
    if (width===390) {
      await page.setViewportSize({width:844,height:390});
      await page.waitForFunction(()=>document.querySelector('#boot-camp-art .boot-hi')?.dataset.source.includes('camp-wide-mobile'));
      await page.setViewportSize({width,height});
      await page.waitForFunction(()=>document.querySelector('#boot-camp-art .boot-hi')?.dataset.source.includes('camp-portrait-mobile'));
    }
    if (width===844) {
      await page.locator('#boot-motion').click();
      await page.evaluate(()=>document.querySelector('#boot-screen').hidden=true);
      await page.waitForTimeout(50);
      const stopped = await page.locator('#boot-fire').evaluate(c=>c.toDataURL());
      const light = await page.locator('.boot-fire-light').getAttribute('style');
      await page.waitForTimeout(200);
      assert.equal(await page.locator('#boot-fire').evaluate(c=>c.toDataURL()),stopped);
      assert.equal(await page.locator('.boot-fire-light').getAttribute('style'),light);
      await page.evaluate(()=>{const host=document.querySelector('#boot-screen');host.hidden=false;host.dataset.phase='error';document.querySelector('#boot-phase').textContent='Startup was interrupted.';document.querySelector('#boot-error').textContent='The music is not ready to play. Try again or continue without music.';document.querySelector('#boot-error').hidden=false;document.querySelector('#boot-retry').hidden=false;document.querySelector('#boot-recovery').hidden=false;document.querySelector('#boot-recovery').textContent='Continue without music';});
      assert.equal(await page.locator('#boot-screen').getAttribute('data-motion'),null);
      for (const sel of ['#boot-retry','#boot-recovery']) assert.ok(await page.locator(sel).isVisible());
      await page.screenshot({path:fileURLToPath(new URL('recovery-landscape.jpg',out)),quality:85});
      results.lifecycle={pause:true,hiddenStopsCanvasAndLight:true,recoveryVisible:true,rotation:true};
    }
    assert.deepEqual(errors,[]);
    results.layouts.push({width,height,...layout,effects,artRequests:requests.filter(u=>/forest-|camp-wide-|camp-portrait-|fire-atlas-|cloud-/.test(u))});
    await context.close(); console.log(`layout ${width}x${height}: OK`);
  }
  for (const profile of [{name:'local',mbps:0,latency:0,cpu:1},{name:'mobile-10Mbps',mbps:10,latency:60,cpu:4},{name:'mobile-1.6Mbps',mbps:1.6,latency:150,cpu:4}]) {
    const {context,page,errors} = await pageFor(844,390), cdp = await context.newCDPSession(page);
    await cdp.send('Network.enable');
    await cdp.send('Network.setCacheDisabled',{cacheDisabled:true});
    await cdp.send('Emulation.setCPUThrottlingRate',{rate:profile.cpu});
    if (profile.mbps) await cdp.send('Network.emulateNetworkConditions',{offline:false,latency:profile.latency,downloadThroughput:profile.mbps*1e6/8,uploadThroughput:profile.mbps*1e6/8});
    await page.addInitScript(()=>{
      window.bootTiming={};
      const tick=()=>{
        const h=document.querySelector('#boot-screen'), imgs=[...document.querySelectorAll('#boot-screen picture img,#boot-forest img,.boot-fire-fallback')];
        if(!window.bootTiming.inline && imgs.length===3 && imgs.every(i=>i.complete&&i.naturalWidth))window.bootTiming.inline=performance.now();
        if(!window.bootTiming.detail && document.querySelectorAll('.boot-hi.is-ready').length===3)window.bootTiming.detail=performance.now();
        if(!window.bootTiming.fire && h?.hasAttribute('data-fire-ready'))window.bootTiming.fire=performance.now();
        if(!window.bootTiming.detail||!window.bootTiming.fire)requestAnimationFrame(tick);
      };requestAnimationFrame(tick);
    });
    await page.goto(base,{waitUntil:'domcontentloaded'});
    await page.waitForFunction(()=>window.bootTiming.detail&&window.bootTiming.fire);
    await cdp.send('Performance.enable');
    const before=(await cdp.send('Performance.getMetrics')).metrics.find(m=>m.name==='TaskDuration').value;
    const cadence=await page.evaluate(()=>new Promise(resolve=>{const gaps=[];let previous=performance.now();const start=previous;function frame(now){gaps.push(now-previous);previous=now;if(now-start<3000)requestAnimationFrame(frame);else{gaps.sort((a,b)=>a-b);resolve({p50:gaps[Math.floor(gaps.length*.5)],p95:gaps[Math.floor(gaps.length*.95)],frames:gaps.length});}}requestAnimationFrame(frame);}));
    const after=(await cdp.send('Performance.getMetrics')).metrics.find(m=>m.name==='TaskDuration').value;
    const timings=await page.evaluate(()=>({...window.bootTiming,paint:performance.getEntriesByType('paint').map(p=>({name:p.name,ms:p.startTime})),artBytes:performance.getEntriesByType('resource').filter(r=>/forest-|camp-wide-|fire-atlas-|cloud-/.test(r.name)).reduce((n,r)=>n+r.encodedBodySize,0)}));
    assert.deepEqual(errors,[]);
    results.performance.push({...profile,...timings,cadence,mainThreadTaskMsOver3s:(after-before)*1000});
    await context.close(); console.log(`performance ${profile.name}: ${JSON.stringify(timings)}`);
  }
  for (const variant of ['normal','missing-decoration','reduced-motion']) {
    const {context,page,errors,requests}=await pageFor(844,390,false,variant==='reduced-motion'?{reducedMotion:'reduce'}:{});
    if(variant==='missing-decoration')await page.route(/\/(forest|camp-wide|camp-portrait|fire-atlas|cloud)-.*\.webp$/,route=>route.abort());
    await page.goto(base+'?fresh=1',{waitUntil:'domcontentloaded'});
    await page.locator('#boot-screen').waitFor({state:'hidden',timeout:30000});
    assert.ok(await page.locator('#game canvas').isVisible());
    assert.equal(await page.locator('#app').evaluate(el=>el.inert),false);
    assert.deepEqual(errors,[]);
    if(variant==='reduced-motion') assert.equal(requests.some(u=>/fire-atlas-/.test(u)),false);
    const timing=await page.evaluate(()=>({readyMs:performance.now(),phase:document.querySelector('#boot-screen').dataset.phase}));
    results.realStartup.push({variant,...timing,errors});
    await context.close();console.log(`real startup ${variant}: OK`);
  }
  {
    const {context,page,errors}=await pageFor(844,390,false);
    let release;
    const held=new Promise(resolve=>{release=resolve;});
    await page.route('**/'+entry, async route=>{await held;await route.abort();});
    await page.goto(base,{waitUntil:'commit'});
    await page.waitForFunction(()=>[...document.querySelectorAll('#boot-screen picture img,#boot-forest img,.boot-fire-fallback')].length===3 && [...document.querySelectorAll('#boot-screen picture img,#boot-forest img,.boot-fire-fallback')].every(i=>i.complete&&i.naturalWidth));
    assert.equal(await page.locator('#boot-screen').getAttribute('data-motion'),null);
    await page.screenshot({path:fileURLToPath(new URL('first-frame-without-javascript.jpg',out)),quality:85});
    release();
    await page.locator('#boot-retry').waitFor({state:'visible'});
    assert.equal(await page.locator('#boot-screen').getAttribute('data-phase'),'error');
    results.lifecycle.staticWithoutBootstrap=true;results.lifecycle.entryFailureRetry=true;
    await context.close();
  }
  await writeFile(new URL('results.json',out),JSON.stringify(results,null,2));
} finally { await browser.close(); }
