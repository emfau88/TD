import { chromium } from 'file:///C:/Users/madde/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
const base = process.env.TAVERN_TEST_URL || 'http://127.0.0.1:5278/';
const out = new URL(process.env.TAVERN_REMOTE ? './published-preview/' : './preview-starter/', import.meta.url); await mkdir(out, { recursive: true });
const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true, args: ['--disable-gpu'] });
const results = [], errors = [];
async function enter(page) {
  await page.waitForFunction(() => document.querySelector('#boot-screen')?.hidden === true, null, { timeout: 60000 });
  if (await page.locator('#claim-offline').isVisible()) await page.click('#claim-offline');
  await page.waitForSelector('#tavern-dialog[open]', { timeout: 60000 });
  await page.waitForFunction(() => document.querySelector('.tv-figure canvas')?.dataset.clip === 'idle');
}
try {
  const cases = [ ['heart3','mara',1280,'de'], ['heart3','ilyra',320,'en'], ['fresh','mara',320,'de'], ['heart2-10','ilyra',1280,'de'], ['heart2-20','mara',320,'en'], ['gift58-18','mara',1280,'de'], ['gift58-30','ilyra',320,'de'], ['legacy4','mara',1280,'de'] ];
  for (const [preset,who,width,language] of cases) {
    const page = await browser.newPage({ viewport: { width, height: 844 } }); page.on('pageerror', e => errors.push(e.message));
    await page.goto(new URL('tavern-test.html', base).href);
    await page.selectOption('#preset', preset); await page.selectOption('#companion', who); await page.selectOption('#language', language);
    await page.click('#start'); await enter(page);
    assert.match(page.url(), /probe=tavern-review-[a-f0-9-]+/);
    assert.equal(await page.locator('#tavern-dialog').getAttribute('data-companion'), who);
    const points = await page.locator('#tavern-dialog progress').evaluate(p => p.value);
    assert.equal(points, preset === 'fresh' ? 0 : preset === 'heart3' ? 70 : preset === 'legacy4' ? 110 : preset.startsWith('heart2') ? 35 : 58);
    assert.equal(await page.locator('.tv-actions > button').count(), 3);
    assert.match(await page.locator('[data-text=combat]').textContent(), /Pausiert|Paused/);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth); assert.equal(overflow, false);
    if (preset === 'gift58-18') assert.match(await page.locator('[data-text=gift-hint]').textContent(), /12/);
    if (preset === 'gift58-30') {
      assert.equal(await page.locator('[data-action=gift]').isDisabled(), false);
      await page.click('[data-action=gift]'); await page.waitForFunction(() => document.querySelector('#tavern-dialog progress')?.value === 70);
    }
    if (preset === 'heart3') {
      await page.click('[data-do=touch]'); await page.click('[data-region=hand]');
      await page.waitForFunction(() => document.querySelector('.tv-figure canvas')?.dataset.clip === 'hand');
      await page.waitForFunction(who => { const a = document.querySelector(`audio[data-spire-voice="${who}"]`); return a && !a.paused && a.currentTime > .02; }, who);
      await page.click('[data-do=speak]'); await page.click('[data-action=talk]');
      await page.waitForSelector('.tv-replies:not([hidden])'); await page.click('[data-answer=second]');
      await page.waitForSelector('.tv-replies[hidden]', { state: 'attached' }); const line = await page.locator('[data-text=line]').textContent();
      const url = page.url(); await page.reload(); await enter(page);
      await page.click('[data-do=speak]'); await page.click('[data-action=talk]');
      await page.waitForSelector('.tv-story-heading:not([hidden])');
      assert.equal(await page.locator('[data-text=line]').textContent(), line);
      assert.equal(await page.locator('.tv-replies').isVisible(), false);
      assert.equal(page.url(), url);
    }
    if (preset === 'legacy4') {
      await page.click('[data-do=speak]'); await page.click('[data-gesture=tease]');
      await page.waitForFunction(() => document.querySelector('.tv-figure canvas')?.dataset.clip === 'tease');
      await page.waitForFunction(() => { const a = document.querySelector('audio[data-spire-voice=mara]'); return a && !a.paused && a.currentTime > .02; });
    }
    await page.locator('#tavern-dialog').screenshot({ path: fileURLToPath(new URL(`${preset}-${who}-${width}.png`, out)) });
    results.push({ preset, who, width, language, points, url: page.url(), overflow }); await page.close();
  }
  const page = await browser.newPage({ viewport: { width: 320, height: 844 } }); page.on('pageerror', e => errors.push(e.message));
  await page.goto(new URL('tavern-counter-check.html', base).href);
  await page.waitForFunction(() => !document.querySelector('#clip').hidden && !document.querySelector('[data-clip=hand]').disabled);
  await page.click('#enable-sound'); await page.click('[data-clip=hand]');
  await page.waitForFunction(() => { const a = document.querySelector('audio[data-spire-voice=mara]'); return a && !a.paused && a.currentTime > .02; });
  await page.waitForFunction(() => document.querySelector('#clip')?.dataset.clip === 'idle' && !document.querySelector('#clip').hidden);
  await page.click('[data-clip=talk]'); await page.waitForFunction(() => document.querySelector('#clip')?.dataset.clip === 'talk' && !document.querySelector('#clip').hidden);
  await page.screenshot({ path: fileURLToPath(new URL('counter-320.png', out)), fullPage: true });
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
  assert.deepEqual(errors, []);
  await writeFile(new URL('results.json', out), JSON.stringify({ base, cases: results, counterVoiceAndReturn: true, errors }, null, 2));
  console.log(JSON.stringify({ base, cases: results.length, heartThreeReloads: 2, counterVoiceAndReturn: true, errors }));
} finally { await browser.close(); }
