import { chromium } from 'file:///C:/Users/madde/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';

const base = process.env.TAVERN_TEST_URL || 'http://127.0.0.1:5278/';
const remote = !!process.env.TAVERN_REMOTE;
const out = new URL(remote ? './public/' : './local/', import.meta.url);
await mkdir(out, { recursive: true });
const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true, args: ['--disable-gpu'] });
const results = [];
const views = [
  { name: 'desktop', viewport: { width: 1280, height: 844 }, isMobile: false, hasTouch: false },
  { name: 'phone', viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true },
  ...remote ? [] : [
    { name: 'touch-desktop-size', viewport: { width: 1280, height: 844 }, isMobile: true, hasTouch: true },
    { name: 'phone-landscape', viewport: { width: 844, height: 390 }, isMobile: true, hasTouch: true },
  ],
];
try {
  for (const view of views) for (const who of ['mara', 'ilyra']) {
    const { name, ...options } = view;
    const page = await browser.newPage(options);
    const errors = []; page.on('pageerror', e => errors.push(e.message));
    await page.goto(new URL('tavern-test.html', base).href);
    await page.selectOption('#preset', 'heart3');
    await page.selectOption('#companion', who); await page.selectOption('#language', 'de');
    await page.click('#start');
    await page.waitForFunction(() => document.querySelector('#boot-screen')?.hidden === true);
    if (await page.locator('#claim-offline').isVisible()) await page.click('#claim-offline');
    const ready = () => page.waitForFunction(() => document.querySelector('.tv-figure canvas')?.dataset.clip === 'idle' && !document.querySelector('[data-do=speak]').disabled);
    await ready();
    const initial = await page.locator('.tv-stage').boundingBox();
    await page.click('[data-do=touch]');
    const targets = await page.locator('.tv-hotspot:visible').evaluateAll(buttons => buttons.map(b => {
      const r = b.getBoundingClientRect(), span = b.querySelector('span'), hit = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2);
      const stage = b.closest('.tv-stage').getBoundingClientRect();
      return { region: b.dataset.region, width: r.width, height: r.height, heart: getComputedStyle(span, '::after').fontSize,
        centered: Math.abs(r.x + r.width / 2 - (b.parentElement.getBoundingClientRect().x + parseFloat(b.style.left))) < 1,
        hit: hit === b || b.contains(hit), inside: r.top >= stage.top && r.bottom <= stage.bottom && r.left >= stage.left && r.right <= stage.right };
    }));
    assert.equal(targets.length, 3);
    for (const t of targets) {
      assert.equal(t.heart, options.hasTouch ? '24px' : '48px');
      assert.equal(t.width, options.hasTouch ? 44 : 64);
      assert.ok(t.centered && t.hit && t.inside, JSON.stringify({ name, who, t }));
    }
    if (name === 'desktop' || name === 'phone') await page.screenshot({ path: fileURLToPath(new URL(`${name}-${who}-hearts.png`, out)) });
    // Exercise each real hotspot and retain its original reaction mapping.
    for (const [region, clip] of [['hair', 'head'], ['shoulder', 'touch'], ['hand', 'hand']]) {
      await page.click(`[data-region=${region}]`);
      await page.waitForFunction(clip => document.querySelector('.tv-figure canvas')?.dataset.clip === clip, clip);
      await ready();
    }
    if (who === 'ilyra') {
      const canvas = page.locator('.tv-figure canvas');
      if (name === 'desktop') await canvas.screenshot({ path: fileURLToPath(new URL('ilyra-idle.png', out)) });
      await page.click('[data-do=speak]'); await page.click('[data-gesture=hip]');
      await page.waitForFunction(() => { const c = document.querySelector('.tv-figure canvas'); return c?.dataset.clip === 'hip' && Number(c.dataset.frame) >= 12; });
      assert.deepEqual(await page.locator('.tv-stage').boundingBox(), initial);
      if (name === 'desktop' || name === 'phone') await canvas.screenshot({ path: fileURLToPath(new URL(`${name}-ilyra-compliment.png`, out)) });
      await ready();
      assert.deepEqual(await page.locator('.tv-stage').boundingBox(), initial);
      if (name === 'desktop') await canvas.screenshot({ path: fileURLToPath(new URL('ilyra-return.png', out)) });
    }
    assert.deepEqual(errors, []);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
    results.push({ name, who, targets, reactionMapping: 'passed', complimentReturn: who === 'ilyra' ? 'passed' : 'not changed', errors });
    console.log(`${name}/${who}: targets and reactions passed`);
    await page.close();
  }
  await writeFile(new URL('results.json', out), JSON.stringify({ base, passed: true, cases: results }, null, 2));
} finally { await browser.close(); }
