// Built production assets, browser HTTP cache enabled (no interception/instrumentation).
import { createRequire } from 'node:module';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
const { chromium } = createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE || 'playwright');
const base = process.env.BASE_URL || 'http://127.0.0.1:5246';
const out = process.env.REPORT_DIR || 'qa/q4-mara-introduction/production';
fs.mkdirSync(out, { recursive: true });
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const context = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true,
  recordVideo: { dir: path.join(out, 'video'), size: { width: 390, height: 844 } } });
const results = [], errors = [];
await context.addInitScript(() => localStorage.setItem('spire-language-v1', 'de'));
async function open(label) {
  const page = await context.newPage(); page.on('pageerror', e => errors.push(String(e)));
  const start = performance.now(); await page.goto(`${base}/?probe=q4-prod-${crypto.randomUUID()}`);
  await page.waitForFunction(() => document.querySelector('#boot-screen')?.hidden && document.querySelector('#app').dataset.maraIntro === '0');
  const loadMs = performance.now() - start;
  const resources = await page.evaluate(() => performance.getEntriesByType('resource').map(e => ({ name: e.name, transfer: e.transferSize, encoded: e.encodedBodySize, duration: e.duration })));
  const portraits = resources.filter(e => /\/(welcome|focused|mischievous)-.*\.webp/.test(e.name));
  const uniquePortraits = [...new Map(portraits.map(e => [e.name, e])).values()];
  assert.equal(uniquePortraits.length, 3); assert.equal(uniquePortraits.reduce((n, e) => n + e.encoded, 0), 80672);
  // Vite flattens tavern pages such as mara/idle/00.webp to 00-HASH.webp.
  assert.ok(resources.every(e => !/\/\d{2}-[^/]+\.webp/.test(e.name)), 'no tavern animation pages at startup');
  fs.writeFileSync(path.join(out, label.startsWith('cold') ? 'cold-resources.json' : 'warm-resources.json'), JSON.stringify(resources, null, 2));
  results.push({ label, loadMs, totalTransferBytes: resources.reduce((n, e) => n + e.transfer, 0), portraits, portraitTransferBytes: portraits.reduce((n, e) => n + e.transfer, 0) });
  return page;
}
try {
  let page = await open('cold browser cache');
  await page.waitForTimeout(1400);
  await page.locator('#onboarding-primary').click();
  await page.waitForTimeout(2200);
  await page.locator('#onboarding-primary').click();
  await page.waitForTimeout(1400);
  await page.screenshot({ path: path.join(out, 'production-mobile-de-scene-3.png') });
  const video = page.video(); await page.close();
  results.push({ cameraVideo: await video.path(), note: 'Final 5 seconds contain the controlled camera pan and scene 3; real production renderer.' });
  page = await open('warm browser cache, new independent game slot');
  assert.ok(results.at(-1).portraits.every(e => e.transfer <= 300), 'warm portraits reuse cached bodies; local preview may revalidate with 300-byte header estimates');
  await page.locator('#intro-skip').click();
  await page.waitForFunction(() => document.querySelector('#app').dataset.intro === 'build');
  await page.reload(); await page.waitForFunction(() => document.querySelector('#boot-screen')?.hidden);
  assert.equal(await page.locator('#app').getAttribute('data-intro'), 'build');
  const returningPortraits = await page.evaluate(() => performance.getEntriesByType('resource').filter(e => /\/(welcome|focused|mischievous)-.*\.webp/.test(e.name)).length);
  assert.equal(returningPortraits, 0);
  results.push({ label: 'returning build save', introPortraitRequests: returningPortraits, passed: true });
  await page.setViewportSize({ width: 320, height: 568 });
  await page.goto(`${base}/?fresh=1`);
  await page.waitForFunction(() => document.querySelector('#boot-screen')?.hidden && document.querySelector('#app').dataset.maraIntro === '0');
  await page.locator('#onboarding-primary').click(); await page.locator('#onboarding-primary').click();
  const menuBox = await page.locator('#open-menu').boundingBox();
  assert.ok(menuBox.x >= 0 && menuBox.x + menuBox.width <= 320, 'menu/language remains reachable on a 320px phone');
  await page.locator('#open-menu').click(); await page.locator('#language-choice').selectOption('en'); await page.locator('#close-menu').click();
  await page.screenshot({ path: path.join(out, 'production-small-en-scene-3.png') });
  assert.equal(await page.locator('#app').getAttribute('data-mara-intro'), '2');
  results.push({ label: '320px phone menu and language switch', passed: true });
  assert.deepEqual(errors, []);
} finally { fs.writeFileSync(path.join(out, 'checks.json'), JSON.stringify({ results, errors }, null, 2)); await context.close(); await browser.close(); }
