import { chromium } from 'file:///C:/Users/madde/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';
const out = new URL('./integration/', import.meta.url); await mkdir(out, {recursive:true});
const browser = await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe', headless:true});
const results=[];
const ready = page => page.waitForFunction(() => document.querySelector('.tv-figure canvas')?.dataset.clip === 'idle' && !document.querySelector('[data-do=speak]').disabled);
async function open(page, preset='legacy4', companion='mara') {
  await page.goto('http://127.0.0.1:5278/tavern-test.html');
  await page.selectOption('#preset',preset); await page.selectOption('#companion',companion); await page.click('#start');
  await page.waitForFunction(() => document.querySelector('#boot-screen')?.hidden === true);
  if(await page.locator('#claim-offline').isVisible()) await page.click('#claim-offline');
  await ready(page);
  await page.evaluate(async()=>{
    const {TavernUI}=await import(performance.getEntriesByType('resource').find(r=>/\/src\/tavern-ui\.ts(?:\?|$)/.test(r.name)).name);
    const original=TavernUI.prototype.update;
    TavernUI.prototype.update=function(...args){window.reviewUI=this;return original.apply(this,args);};
    const {GameAudio}=await import(performance.getEntriesByType('resource').find(r=>/\/src\/game-audio\.ts(?:\?|$)/.test(r.name)).name); const voice=GameAudio.prototype.touchCompanion;
    window.reviewVoices=[]; GameAudio.prototype.touchCompanion=function(who){window.reviewVoices.push(who);return voice.call(this,who);};
  });
  await page.click('[data-do=speak]');
}
async function switchRoom(page, expected) {
  if(!await page.locator('[data-do=switch-location]').isVisible()) await page.click('[data-do=speak]');
  await page.click('[data-do=switch-location]');
  await page.waitForFunction(expected=>document.querySelector('#tavern-dialog').dataset.location===expected,expected);
  await ready(page);
}
try {
  for(const mobile of [false,true]) {
    const page=await browser.newPage({viewport:mobile?{width:390,height:844}:{width:1280,height:844},isMobile:mobile,hasTouch:mobile});
    const errors=[];page.on('pageerror',e=>errors.push(e.message));
    const counterRequests=[];page.on('request',r=>{if(r.url().includes('/mara-counter/'))counterRequests.push(r.url());});
    await open(page);
    const economy=await page.evaluate(()=>JSON.stringify(window.reviewUI.ports.session().battle.social));
    await switchRoom(page,'mara-counter');
    assert.equal(await page.locator('.tv-stage').getAttribute('data-video-scene'),'mara-counter');
    const box=await page.locator('.tv-stage').boundingBox();
    await page.screenshot({path:fileURLToPath(new URL(mobile?'phone-counter.png':'desktop-counter.png',out))});
    for(const [selector,clip,voice] of [
      ['[data-region=hair]','hair',true],['[data-region=shoulder]','shoulder',true],['[data-region=hand]','hand',true],
      ['[data-gesture=giggle]','laugh',true],['[data-gesture=hip]','approach',true],['[data-gesture=tease]','laugh',true],
    ]) {
      if(selector.includes('gesture')&&!await page.locator(selector).isVisible())await page.click('[data-do=speak]');
      const before=await page.evaluate(()=>window.reviewVoices.length);
      await page.click(selector);await page.waitForFunction(clip=>document.querySelector('.tv-figure canvas').dataset.clip===clip,clip);
      assert.equal(await page.locator('.tv-stage').getAttribute('data-video-scene'),'mara-counter');
      assert.deepEqual(await page.locator('.tv-stage').boundingBox(),box);
      assert.equal(await page.locator('[data-region=hand]').isDisabled(),true);
      assert.equal(await page.evaluate(()=>window.reviewVoices.length),before+(voice?1:0));
      await ready(page);
    }
    // Real conversations may first present an earned dialogue. Both dialogue and free talk stay local.
    await page.click('[data-do=speak]');await page.click('[data-action=talk]');
    await page.waitForFunction(()=>document.querySelector('.tv-figure canvas').dataset.clip==='talk');
    assert.equal(await page.locator('.tv-stage').getAttribute('data-video-scene'),'mara-counter');
    if(await page.locator('[data-do=story-exit]').isVisible()) await page.click('[data-do=story-exit]');
    await ready(page);
    // Personal memories use the original staging and then return to the counter.
    await page.click('[data-moment="4"]');
    await page.waitForFunction(()=>document.querySelector('#tavern-dialog').dataset.location==='standard' && !!window.reviewUI.moment);
    assert.equal(await page.locator('.tv-stage').getAttribute('data-video-scene'),null);
    await page.click('[data-do=story-exit]');
    await page.waitForFunction(()=>document.querySelector('#tavern-dialog').dataset.location==='mara-counter');await ready(page);
    assert.deepEqual(await page.locator('.tv-stage').boundingBox(),box);
    await switchRoom(page,'standard');
    assert.equal(await page.locator('.tv-stage').getAttribute('data-video-scene'),null);
    assert.ok(!(await page.locator('.tv-stage-caption').innerText()).includes('Tresen'));
    // Actions at the already completed stage must not mint points or gifts.
    const after=await page.evaluate(()=>JSON.stringify(window.reviewUI.ports.session().battle.social));
    assert.equal(JSON.parse(economy).points.mara,JSON.parse(after).points.mara);
    assert.equal(JSON.parse(economy).gifts,JSON.parse(after).gifts);
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
    for(const n of ['01','02','03','04','05','06','07'])assert.ok(counterRequests.some(u=>u.includes(`MC${n}.mp4`)),`missing MC${n}`);
    assert.deepEqual(errors,[]);results.push({mobile,allSeven:true,voices:true,storyReturn:true,stableStage:true,errors});
    console.log(`${mobile?'mobile':'desktop'}: seven local clips, voices, memories, stable stage passed`);
    await page.close();
  }
  const page=await browser.newPage(); await open(page,'heart3');
  assert.equal(await page.locator('[data-do=switch-location]').isVisible(),false);
  await open(page,'legacy4','ilyra');assert.equal(await page.locator('[data-do=switch-location]').isVisible(),false);
  await open(page);
  await page.route('**/mara-counter/MC01.mp4',r=>r.abort());
  await page.click('[data-do=switch-location]');
  await page.waitForFunction(()=>document.querySelector('[data-field=result]')?.textContent.includes('nicht geladen') || document.querySelector('.tv-result')?.textContent.includes('nicht geladen'));
  assert.equal(await page.locator('#tavern-dialog').getAttribute('data-location'),'standard');
  await ready(page);await page.unroute('**/mara-counter/MC01.mp4');await switchRoom(page,'mara-counter');
  await switchRoom(page,'standard');
  await page.route('**/mara-counter/MC01.mp4',async r=>{await new Promise(resolve=>setTimeout(resolve,1300));await r.continue().catch(()=>{});});
  await page.click('[data-do=speak]');await page.click('[data-do=switch-location]');
  await page.click('[data-do=back]');await page.click('[data-do=ilyra]');await ready(page);
  await page.waitForTimeout(1600);
  assert.equal(await page.locator('.tv-figure canvas').getAttribute('data-companion'),'ilyra');
  assert.equal(await page.locator('.tv-stage').getAttribute('data-video-scene'),null);
  results.push({gates:true,failedRoomKeepsOriginal:true,retry:true,staleSwitchCancelled:true});
  await page.close();await writeFile(new URL('results.json',out),JSON.stringify({passed:true,results},null,2));
}finally{await browser.close();}
