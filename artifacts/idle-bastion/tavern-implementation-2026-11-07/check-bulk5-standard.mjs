import { chromium } from 'file:///C:/Users/madde/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const folder = new URL('./bulk5-standard-regression/', import.meta.url);
await mkdir(folder, { recursive: true });
const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true, args: ['--disable-gpu'] });
const results = [];
try {
  for (const who of ['ilyra', 'mara']) {
    const page = await browser.newPage({ viewport: { width: 1280, height: 844 } });
    const errors = [], requests = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('request', request => requests.push(request.url()));
    await page.goto(`http://127.0.0.1:5277/tavern-rig-check.html?hero=${who}&artwork=video&sound=1`, { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => window.tavernReview && document.querySelector('.tv-figure canvas')?.dataset.clip === 'idle');
    await page.selectOption('#review-hearts', '3');
    await page.evaluate(() => { const b = window.tavernReview.session.battle; for (const who of ['mara','ilyra']) for (const id of ['first','second']) { b.beginCompanionEncounter(who,id); b.finishCompanionEncounter(who,id); } window.tavernReview.ui.update(); });
    const canvas = page.locator('.tv-figure canvas'), dialog = page.locator('#tavern-dialog');
    const before = await page.evaluate(() => ({ points: { ...window.tavernReview.session.battle.social.points }, gifts: window.tavernReview.session.battle.social.gifts }));
    const seen = [];
    async function clip(key, action) {
      await action();
      await page.waitForFunction(key => {
        const c = document.querySelector('.tv-figure canvas');
        return c?.dataset.clip === key && Number(c.dataset.frame) >= 8;
      }, key, { timeout: 20000 });
      assert.equal(await canvas.getAttribute('data-reaction-error'), null);
      seen.push(key);
    }
    async function idle() {
      await page.waitForFunction(() => document.querySelector('.tv-figure canvas')?.dataset.clip === 'idle', null, { timeout: 12000 });
    }
    const anchors = await page.evaluate(() => {
      const c = document.querySelector('.tv-figure canvas');
      return Object.fromEntries(['hair', 'shoulder', 'hand'].map(key => {
        const b = document.querySelector(`[data-region="${key}"]`);
        return [key, { x: (parseFloat(b.style.left) - c.offsetLeft) * c.width / c.clientWidth, y: (parseFloat(b.style.top) - c.offsetTop) * c.height / c.clientHeight }];
      }));
    });
    const expectedAnchors = who === 'ilyra'
      ? { hair: { x: 174, y: 256 }, shoulder: { x: 342, y: 303 }, hand: { x: 102, y: 568 } }
      : { hair: { x: 143, y: 262 }, shoulder: { x: 350, y: 305 }, hand: { x: 117, y: 590 } };
    for (const [key, expected] of Object.entries(expectedAnchors)) {
      assert.ok(Math.abs(anchors[key].x - expected.x) < .01 && Math.abs(anchors[key].y - expected.y) < .01, `${who} ${key} anchor`);
    }
    await dialog.locator('[data-do=touch]').click();
    await clip('hand', () => dialog.locator('[data-region=hand]').click());
    await page.waitForFunction(who => {
      const voice = document.querySelector(`audio[data-spire-voice="${who}"]`);
      return voice && !voice.paused && voice.currentTime > .02;
    }, who);
    const voice = await page.evaluate(who => {
      const a = document.querySelector(`audio[data-spire-voice="${who}"]`);
      return { playing: !a.paused, time: a.currentTime, source: a.currentSrc };
    }, who);
    await dialog.screenshot({ path: fileURLToPath(new URL(`${who}-hand-1280.png`, folder)) });
    await idle();
    assert.equal((await page.evaluate(() => window.tavernReview.events)).filter(event => event.type === 'touch' && event.who === who).length, 1);
    await clip('giggle', async () => { await dialog.locator('[data-do=speak]').click(); await dialog.locator('[data-gesture=giggle]').click(); });
    await idle();
    await clip('head', async () => { await dialog.locator('[data-do=speak]').click(); await dialog.locator('[data-action=talk]').click(); });
    await idle();
    await clip('head', () => dialog.locator('[data-region=hair]').click());
    await idle();
    await clip('touch', () => dialog.locator('[data-region=shoulder]').click());
    await idle();
    const after = await page.evaluate(() => ({ points: { ...window.tavernReview.session.battle.social.points }, gifts: window.tavernReview.session.battle.social.gifts }));
    assert.deepEqual(after, before);
    assert.ok(requests.some(url => url.endsWith(`/tavern-video/${who}/hand.mp4`)));
    await page.setViewportSize({ width: 390, height: 844 });
    await dialog.locator('[data-do=touch]').click();
    await page.waitForFunction(expected => {
      const c = document.querySelector('.tv-figure canvas'), h = document.querySelector('[data-region=hand]');
      return Math.abs((parseFloat(h.style.left) - c.offsetLeft) * c.width / c.clientWidth - expected) < .01;
    }, who === 'mara' ? 117 : 102);
    await dialog.screenshot({ path: fileURLToPath(new URL(`${who}-hand-anchor-390.png`, folder)) });
    await dialog.locator('[data-do=close]').first().click();
    await page.waitForFunction(() => [...document.querySelectorAll('audio[data-spire-voice]')].every(a => a.paused));
    assert.deepEqual(errors, []);
    results.push({ who, seen, anchors, voice, noAffectionOrGiftChangeAtHeart3: true, stoppedVoicesOnClose: true, errors });
    console.log(`${who}: hand routing, distinct laugh, preserved talk/hair/shoulder, voice and anchors passed`);
    await page.close();
  }
  await writeFile(new URL('results.json', folder), JSON.stringify(results, null, 2) + '\n');
} finally { await browser.close(); }
