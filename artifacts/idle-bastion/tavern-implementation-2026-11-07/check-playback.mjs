import { chromium } from 'file:///C:/Users/madde/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const folder = new URL('./playback/', import.meta.url); await mkdir(folder, { recursive: true });
const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true, args: ['--disable-gpu'] });
const results = [];
try {
  for (const who of ['mara', 'ilyra']) {
    const page = await browser.newPage({ viewport: { width: 1280, height: 844 } });
    const errors = [], requests = [];
    page.on('pageerror', e => errors.push(e.message));
    page.on('request', r => requests.push({ url: r.url(), type: r.resourceType() }));
    await page.goto(`http://127.0.0.1:5277/tavern-rig-check.html?hero=${who}&artwork=video&sound=1`, { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => window.tavernReview && document.querySelector('.tv-figure canvas')?.dataset.clip === 'idle');
    await page.evaluate(() => { const f = window.tavernReview; f.session.battle.social.points.mara = 160; f.session.battle.social.points.ilyra = 160; f.ui.update(); });
    const canvas = page.locator('.tv-figure canvas'), dialog = page.locator('#tavern-dialog');
    const seen = [];
    async function clip(key, action) {
      if (action) await action();
      await page.waitForFunction(key => {
        const c = document.querySelector('.tv-figure canvas'); return c?.dataset.clip === key && Number(c.dataset.frame) >= 8;
      }, key, { timeout: 20000 });
      assert.equal(await canvas.getAttribute('data-reaction-error'), null);
      seen.push(key);
      await dialog.screenshot({ path: fileURLToPath(new URL(`${who}-${key}.png`, folder)) });
      console.log(`${who}: ${key}`);
    }
    await clip('idle');
    await clip('variant'); // Actual automatic 15/18-second cadence.
    await clip('head', async () => { await dialog.locator('[data-do=speak]').click(); await dialog.locator('[data-action=talk]').click(); });
    await clip('touch', () => dialog.locator('[data-region=shoulder]').click());
    await page.waitForFunction(who => { const a = document.querySelector(`audio[data-spire-voice="${who}"]`); return a && !a.paused && a.currentTime > .02; }, who);
    await clip('giggle', () => dialog.locator('[data-region=hand]').click());
    await clip('hip', async () => { await dialog.locator('[data-do=speak]').click(); await dialog.locator('[data-gesture=hip]').click(); });
    if (who === 'mara') await clip('tease', async () => { await dialog.locator('[data-do=speak]').click(); await dialog.locator('[data-gesture=tease]').click(); });
    // A normal gift at heart two must use joy and leave stock/points correct.
    await page.evaluate(who => { const f = window.tavernReview; f.session.battle.social.points[who] = 35; f.ui.update(); }, who);
    await clip('joy', () => dialog.locator('[data-action=gift]').click());
    const gift = await page.evaluate(who => ({ points: window.tavernReview.session.battle.social.points[who], gifts: window.tavernReview.session.battle.social.gifts, events: window.tavernReview.events }), who);
    assert.equal(gift.points, 47); assert.equal(gift.gifts, 19);
    assert.equal(gift.events.filter(e => e.type === 'gift').length, 1);
    await page.waitForFunction(() => document.querySelector('.tv-figure canvas')?.dataset.clip === 'idle', { timeout: 12000 });
    // Return at rest and unload all videos on close. Voices must stop as before.
    await dialog.locator('[data-do=close]').first().click();
    await page.waitForFunction(() => [...document.querySelectorAll('audio[data-spire-voice]')].every(a => a.paused));
    assert.deepEqual(errors, []);
    assert.equal(requests.some(r => r.type === 'image' && /tavern-rig\/.*\/\d+\.webp/.test(r.url)), false);
    results.push({ who, seen, gift, errors, nativeVideo: true, noOldAtlasDownloads: true, stoppedVoiceOnClose: true });
    await page.close();
  }
  // Delayed/failed media cannot replace a later action, block input, or crash close.
  const page = await browser.newPage();
  let delayed = false, failHip = true;
  await page.route('**/tavern-video/mara/head.mp4', async route => { delayed = true; await new Promise(r => setTimeout(r, 1100)); await route.continue(); });
  await page.route('**/tavern-video/mara/hip.mp4', route => failHip ? route.abort() : route.continue());
  await page.goto('http://127.0.0.1:5277/tavern-rig-check.html?artwork=video');
  await page.waitForFunction(() => window.tavernReview && document.querySelector('.tv-figure canvas')?.dataset.clip === 'idle');
  await page.evaluate(() => { const f = window.tavernReview; f.session.battle.social.points.mara = 160; f.ui.update(); const p = f.ui.animation; p.act('talk'); p.gesture('giggle'); });
  await page.waitForFunction(() => document.querySelector('.tv-figure canvas')?.dataset.clip === 'giggle');
  await page.waitForTimeout(1300);
  assert.equal(await page.locator('.tv-figure canvas').getAttribute('data-clip'), 'giggle');
  await page.evaluate(() => window.tavernReview.ui.animation.gesture('hip'));
  await page.waitForFunction(() => document.querySelector('.tv-figure canvas')?.dataset.reactionError === 'true');
  failHip = false;
  await page.evaluate(() => window.tavernReview.ui.animation.gesture('hip'));
  await page.waitForFunction(() => document.querySelector('.tv-figure canvas')?.dataset.clip === 'hip');
  await page.evaluate(() => window.tavernReview.ui.close());
  assert.equal(await page.locator('.tv-figure canvas').getAttribute('data-clip'), null);
  results.push({ delayedHead: delayed, latestActionWins: true, failedReactionRetry: true, closeClearsOldCharacter: true });
  await page.close();
  await writeFile(new URL('results.json', folder), JSON.stringify(results, null, 2));
  console.log('Playback, routing, native voice and recovery passed.');
} finally { await browser.close(); }
