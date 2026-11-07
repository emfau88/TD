import { chromium } from 'file:///C:/Users/madde/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';

const base = process.env.TAVERN_TEST_URL || 'http://127.0.0.1:5278/';
const remote = !!process.env.TAVERN_REMOTE;
const out = new URL(remote ? './public/' : './local/', import.meta.url); await mkdir(out, { recursive: true });
const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true, args: ['--disable-gpu'] });
const results = [];
async function ready(page) {
  await page.waitForFunction(() => { const d = document.querySelector('#tavern-dialog'); return d?.open && d.querySelector('.tv-figure canvas')?.dataset.clip && !d.querySelector('[data-do=speak]').disabled; });
}
async function enter(page) {
  await page.waitForFunction(() => document.querySelector('#boot-screen')?.hidden === true);
  if (await page.locator('#claim-offline').isVisible()) await page.click('#claim-offline');
  await ready(page);
}
async function overview(page) { await page.click('[data-do=back]'); await page.locator('.tv-overview').waitFor({ state: 'visible' }); }
async function card(page) {
  await page.click('.tv-close'); await page.click('#settlement-tab');
  await page.locator('#pick-tavern').scrollIntoViewIfNeeded();
}
try {
  const views = remote ? [{ width: 390, height: 650 }] : [{ width: 320, height: 650 }, { width: 390, height: 650 }, { width: 1280, height: 844 }, { width: 667, height: 375 }];
  for (const language of ['de', 'en']) for (const viewport of views) {
    const page = await browser.newPage({ viewport, isMobile: viewport.width < 1000, hasTouch: viewport.width < 1000 });
    const errors = []; page.on('pageerror', e => errors.push(e.message));
    await page.goto(new URL('tavern-test.html', base).href);
    await page.selectOption('#preset', 'heart2-20'); await page.selectOption('#language', language);
    await page.click('#start'); await enter(page);
    await card(page);
    assert.match(await page.locator('#pick-tavern').getAttribute('class'), /new-building/);
    assert.match(await page.locator('#tavern-card-price').textContent(), /Neues Gespräch|New conversation/);
    assert.match(await page.locator('#pick-tavern').getAttribute('title'), /Mara \/ Ilyra/);
    await page.locator('#pick-tavern').screenshot({ path: fileURLToPath(new URL(`${language}-${viewport.width}-notice.png`, out)) });
    await page.click('#pick-tavern');
    for (const who of ['mara', 'ilyra']) {
      assert.match(await page.locator(`[data-text=${who}-gift]`).textContent(), /Neues Gespräch|New conversation/);
      await page.click(`[data-do=${who}]`); await ready(page);
      const stage = await page.locator('.tv-stage').boundingBox();
      for (const encounter of [0, 1]) {
        await page.click('[data-do=speak]'); await page.click('[data-action=talk]'); await ready(page);
        if (encounter) await page.click('[data-do=story-next]');
        await page.locator('.tv-replies').waitFor({ state: 'visible' });
        const visibility = await page.locator('.tv-replies').evaluate(e => {
          const dock = e.closest('.tv-action-dock').getBoundingClientRect();
          return [...e.querySelectorAll('button')].map(b => { const r = b.getBoundingClientRect(), hit = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2); return { text: b.textContent, height: r.height, visible: r.top >= dock.top - 1 && r.bottom <= dock.bottom + 1 && r.top >= 0 && r.bottom <= innerHeight + 1, hit: hit === b || b.contains(hit), textFits: b.scrollHeight <= b.clientHeight + 1 }; });
        });
        assert.equal(visibility.length, 2); visibility.forEach(v => { assert.ok(v.visible && v.hit && v.textFits, JSON.stringify({ who, viewport, v })); assert.ok(v.height >= 44); });
        if (viewport.width < viewport.height) assert.deepEqual(await page.locator('.tv-stage').boundingBox(), stage);
        assert.equal(await page.locator('.tv-conversation').evaluate(e => e.scrollTop), 0, 'answers need no scroll');
        if (!encounter) await page.screenshot({ path: fileURLToPath(new URL(`${language}-${viewport.width}-${who}-answers.png`, out)) });
        if (who === 'mara' && encounter === 0) {
          await page.click('[data-do=back]'); await overview(page);
          assert.match(await page.locator('[data-text=mara-gift]').textContent(), /fortsetzen|Continue/);
          await card(page);
          assert.doesNotMatch(await page.locator('#pick-tavern').getAttribute('title'), /Mara/);
          assert.match(await page.locator('#pick-tavern').getAttribute('title'), /Ilyra/);
          await page.reload(); await enter(page);
          await page.click('[data-do=speak]'); await page.click('[data-action=talk]');
          await page.locator('.tv-replies').waitFor({ state: 'visible' });
        }
        if (encounter) await page.click('[data-do=encounter-listen]'); else await page.click('[data-answer=second]');
        await page.locator('.tv-replies').waitFor({ state: 'hidden' }); await ready(page);
        await page.click('[data-do=story-next]'); await ready(page);
        assert.equal(await page.locator('.tv-actions > button:visible').count(), 3);
        results.push({ language, viewport, who, encounter, visibility });
      }
      await overview(page);
      assert.doesNotMatch(await page.locator(`[data-text=${who}-gift]`).textContent(), /Neues Gespräch|New conversation|fortsetzen|Continue/);
    }
    await card(page);
    assert.doesNotMatch(await page.locator('#pick-tavern').getAttribute('class'), /new-building/);
    assert.doesNotMatch(await page.locator('#tavern-card-price').textContent(), /Gespräch|conversation/);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
    assert.deepEqual(errors, []); await page.close();
    console.log(JSON.stringify({ language, viewport, bothCompanions: 'passed', choicesInitiallyVisible: true, resumeAndNeutral: true }));
  }
  await writeFile(new URL('results.json', out), JSON.stringify({ base, results, passed: true }, null, 2));
} finally { await browser.close(); }
