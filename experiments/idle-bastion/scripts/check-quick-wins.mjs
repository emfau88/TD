// Local acceptance against the normal game entry and isolated dev fixture slots.
// PLAYWRIGHT_MODULE may point at an existing installation; no browser dependency
// or fixture entry is added to the game's production bundle.
import { createRequire } from 'node:module';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
const { chromium } = createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE || 'playwright');
const base = process.env.BASE_URL || 'http://127.0.0.1:5242';
const out = process.env.REPORT_DIR || 'qa/quick-wins-q1-q2/browser';
fs.mkdirSync(out, { recursive: true });
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const previous = process.env.APPEND && fs.existsSync(path.join(out, 'checks.json')) ? JSON.parse(fs.readFileSync(path.join(out, 'checks.json'), 'utf8')) : { checks: [], screenshots: [] };
const checks = previous.checks, screenshots = previous.screenshots;
let activePage;
const grass = /\/assets\/Grass(?:%20| )Tileset(?:-[^/?]+)?\.png(?:\?.*)?$/;
const record = (name, details = {}) => {
  const existing = checks.findIndex(check => check.name === name);
  if (existing >= 0) checks[existing] = { name, ...details }; else checks.push({ name, ...details });
  fs.writeFileSync(path.join(out, 'checks.json'), JSON.stringify({ checks, screenshots }, null, 2));
  console.log(JSON.stringify({ name, ...details }));
};
const shot = async (page, name) => {
  await page.screenshot({ path: path.join(out, `${name}.png`) });
  if (!screenshots.includes(`${name}.png`)) screenshots.push(`${name}.png`);
};
const ready = async page => {
  await page.waitForFunction(() => document.querySelector('#boot-screen')?.hidden === true && document.querySelector('#game canvas'));
  assert.equal(await page.locator('#app').evaluate(node => node.inert), false);
};
const resumeAndPause = async page => {
  if (await page.locator('#return-card').isVisible()) {
    await page.locator('#claim-offline').click();
    await page.locator('#return-card').waitFor({ state: 'hidden' });
  }
  if (!await page.locator('#pause').evaluate(node => node.classList.contains('paused'))) {
    await page.locator('#pause').click();
    await page.waitForFunction(() => document.querySelector('#pause').classList.contains('paused'));
  }
  await page.waitForFunction(() => !document.querySelector('#save-status')?.textContent.match(/gespeichert|saved/i) || !document.querySelector('#pause').disabled);
};
const goldValue = async page => Number((await page.locator('#gold').innerText()).replace(/\D/g, ''));
async function fixture(page, kind, lang = 'en') {
  await page.goto(`${base}/tests/browser/quick-wins-session.html`);
  await page.locator('#fixture-language').selectOption(lang);
  await page.locator(`#${kind}`).click();
  await page.locator('#open-fixture').waitFor();
  const details = JSON.parse(await page.locator('#fixture-details').innerText());
  const target = new URL(await page.locator('#open-fixture').getAttribute('href'), page.url()).href;
  await page.goto(target); await ready(page);
  await page.waitForFunction(expected => Number(document.querySelector('#gold').textContent.replace(/\D/g, '')) === expected, details.gold, { timeout: 5000 });
  return details;
}
async function reloadPaused(page) {
  await page.reload(); await ready(page); await resumeAndPause(page);
}
const noNotice = async page => assert.equal(await page.locator('#quick-win-hint').isVisible(), false);
const notice = async (page, type) => {
  await page.locator(`#quick-win-hint[data-notice="${type}"]`).waitFor({ state: 'visible' });
};

try {
  for (const mobile of [false, true]) {
    const view = mobile ? 'mobile' : 'desktop';
    if (process.env.PROFILE && process.env.PROFILE !== view) continue;
    const context = await browser.newContext({ viewport: mobile ? { width: 390, height: 844 } : { width: 1280, height: 800 }, deviceScaleFactor: 1, isMobile: mobile, hasTouch: mobile });
    const page = activePage = await context.newPage(), errors = [], tavernImages = [];
    page.on('pageerror', error => errors.push(String(error)));
    page.on('request', request => {
      if (['image', 'xhr'].includes(request.resourceType()) && /\/tavern-rig\/.*\.webp(?:\?|$)/.test(request.url())) tavernImages.push(request.url());
    });
    // Keep one actual Phaser image in flight to inspect genuine, partial progress.
    let release;
    const gate = new Promise(resolve => { release = resolve; });
    await page.route(grass, async route => { await gate; await route.continue(); });
    await page.addInitScript(() => {
      window.bootTrace = [];
      const capture = () => {
        const root = document.querySelector('#boot-screen'), progress = document.querySelector('#boot-progress');
        if (root && progress) window.bootTrace.push({ phase: root.dataset.phase, value: progress.hasAttribute('value') ? progress.value : null, max: progress.max, count: document.querySelector('#boot-count')?.textContent });
      };
      new MutationObserver(capture).observe(document, { subtree: true, childList: true, attributes: true, attributeFilter: ['data-phase', 'value', 'max'] });
    });
    await page.goto(`${base}/?fresh=1`, { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => {
      const root = document.querySelector('#boot-screen'), progress = document.querySelector('#boot-progress');
      return root?.dataset.phase === 'assets' && progress?.hasAttribute('value') && progress.value > 0 && progress.value < progress.max;
    });
    const progress = await page.locator('#boot-progress').evaluate(node => ({ value: node.value, max: node.max }));
    assert.equal(await page.locator('#app').evaluate(node => node.inert), true);
    assert.ok((await page.locator('#boot-count').innerText()).trim().length > 0);
    await shot(page, `${view}-loading`);
    release(); await ready(page); await page.unroute(grass);
    const trace = await page.evaluate(() => window.bootTrace);
    const measured = trace.filter(row => row.phase === 'assets' && row.value !== null);
    assert.ok(measured.length > 1);
    assert.ok(measured.every(row => row.value >= 0 && row.value <= row.max));
    assert.ok(trace.filter(row => ['modules', 'save'].includes(row.phase)).every(row => row.value === null), 'non-resource phases must remain indeterminate');
    record(`${view}: fresh boot and real asset progress`, { heldProgress: progress, resourceSamples: measured.length });

    for (const lang of ['de', 'en']) {
      if (process.env.LANGUAGE && process.env.LANGUAGE !== lang) continue;
      await fixture(page, 'cannon-locked', lang); await resumeAndPause(page); await noNotice(page);
      assert.equal(await page.locator('#pick-cannon .quick-win-new').isVisible(), false);
      record(`${view}/${lang}: cannon stays locked before wave 5`);

      const before = await fixture(page, 'cannon', lang); await resumeAndPause(page); await notice(page, 'cannon');
      assert.equal(await page.locator('#pick-cannon .quick-win-new').innerText(), lang === 'de' ? 'NEU' : 'NEW');
      assert.match(await page.locator('#quick-win-copy').innerText(), /Frost/i);
      assert.match(await page.locator('#quick-win-copy').innerText(), /Flächen|area|group/i);
      await shot(page, `${view}-${lang}-cannon-notice`);
      await page.locator('#quick-win-dismiss').click(); await noNotice(page);
      assert.equal(await page.locator('#pick-cannon .quick-win-new').isVisible(), true, 'dismiss must retain catalogue reminder');
      await reloadPaused(page); await noNotice(page);
      assert.equal(await page.locator('#tower-tab .quick-win-new').isVisible(), true);
      await page.locator('#tower-tab').click();
      await page.locator('#pick-cannon').scrollIntoViewIfNeeded(); await page.locator('#pick-cannon').click();
      await page.locator('#pick-cannon .quick-win-new').waitFor({ state: 'hidden' });
      assert.equal(await page.locator('#pick-cannon .quick-win-new').isVisible(), false);
      assert.equal(await goldValue(page), before.gold, 'catalogue inspection must not buy a tower');
      record(`${view}/${lang}: cannon dismissal, persistent NEW and catalogue inspection`);

      await fixture(page, 'cannon', lang); await resumeAndPause(page); await notice(page, 'cannon');
      const cannonGold = await goldValue(page); await page.locator('#quick-win-open').click();
      await page.locator('#pick-cannon .quick-win-new').waitFor({ state: 'hidden' });
      assert.equal(await page.locator('#pick-cannon .quick-win-new').isVisible(), false);
      assert.equal(await goldValue(page), cannonGold);
      record(`${view}/${lang}: cannon direct catalogue action remains optional`);

      await fixture(page, 'workshop-level5', lang); await resumeAndPause(page); await noNotice(page);
      record(`${view}/${lang}: no early workshop notice at level 5`);

      await fixture(page, 'workshop-poor', lang); await resumeAndPause(page); await notice(page, 'workshop');
      assert.match(await page.locator('#quick-win-copy').innerText(), /7/);
      assert.match(await page.locator('#quick-win-cost').innerText(), /400/);
      await shot(page, `${view}-${lang}-workshop-notice`);
      await page.locator('#quick-win-open').click();
      await page.locator('#settlement-panel').waitFor({ state: 'visible' });
      assert.match(await page.locator('#workshop-upgrade-condition').innerText(), /400/);
      assert.equal(await page.locator('#upgrade-workshop').isDisabled(), true);
      assert.equal(await goldValue(page), 800);
      await shot(page, `${view}-${lang}-workshop-details`);
      await reloadPaused(page); await noNotice(page);
      record(`${view}/${lang}: level 6 workshop guidance and missing 400 Gold; read persists`);

      await fixture(page, 'workshop-ready', lang); await resumeAndPause(page); await notice(page, 'workshop');
      await page.locator('#quick-win-open').click();
      await page.locator('#settlement-panel').waitFor({ state: 'visible' });
      assert.equal(await goldValue(page), 1200, 'opening the workshop must not spend gold');
      // Existing rules disable purchases during explicit pause. Resume only now
      // to verify affordability; do not change those rules for this UI package.
      await page.locator('#close-context').click();
      await page.locator('#pause').click();
      await page.waitForFunction(() => !document.querySelector('#pause').classList.contains('paused'));
      await page.locator('#settlement-tab').click();
      await page.locator('#pick-workshop').scrollIntoViewIfNeeded(); await page.locator('#pick-workshop').click();
      await page.locator('#settlement-panel').waitFor({ state: 'visible' });
      await page.waitForFunction(() => !document.querySelector('#upgrade-workshop').disabled);
      assert.equal(await page.locator('#upgrade-workshop').isDisabled(), false);
      record(`${view}/${lang}: workshop affordable at unchanged 1200 Gold`);

      await fixture(page, 'workshop-owned', lang); await resumeAndPause(page); await noNotice(page);
      record(`${view}/${lang}: no repeated workshop hint after expansion`);
    }

    // Positive frozen absence receipt; save claims once, then remain paused.
    const offline = await fixture(page, 'offline', 'en');
    await page.locator('#return-card').waitFor({ state: 'visible' });
    const displayed = await page.locator('#return-gold').innerText();
    await resumeAndPause(page);
    const claimedGold = await goldValue(page);
    assert.ok(claimedGold >= offline.gold + Math.floor(offline.expectedMinimumRewardUnits / 1000));
    await reloadPaused(page);
    assert.equal(await goldValue(page), claimedGold, 'reload must not award the frozen receipt again');
    record(`${view}: existing offline reward claimed once`, { minimumRewardUnits: offline.expectedMinimumRewardUnits, displayed, goldAfterClaim: claimedGold });
    assert.deepEqual(tavernImages, [], 'startup must not download full tavern animation images');
    assert.deepEqual(errors, []);
    await context.close();
  }

  // Both HTTP failure and invalid image bytes must show an actionable error,
  // then finish normally on retry without an endless loading overlay.
  for (const failure of ['http', 'decode']) {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const page = activePage = await context.newPage(); let fail = true, attempts = 0;
    await page.route(grass, route => {
      attempts++;
      return fail ? route.fulfill({ status: failure === 'http' ? 500 : 200, contentType: 'image/png', body: 'invalid-test-image' }) : route.continue();
    });
    await page.goto(`${base}/?fresh=1`);
    await page.locator('#boot-screen[data-phase="error"]').waitFor({ state: 'visible', timeout: 30000 });
    assert.equal(await page.locator('#boot-retry').isVisible(), true);
    await shot(page, `mobile-loading-${failure}-error`);
    fail = false; await page.locator('#boot-retry').click(); await ready(page);
    assert.ok(attempts >= 2);
    record(`loading ${failure} failure and retry`, { attempts }); await context.close();
  }

  // An imported application module can fail before Phaser or main's listeners exist.
  for (const entry of ['main', 'bootstrap']) {
    const context = await browser.newContext(), page = activePage = await context.newPage(); let fail = true;
    await page.route(new RegExp(`/src/${entry}\\.ts(?:\\?.*)?$`), route => fail ? route.abort('failed') : route.continue());
    await page.goto(`${base}/?fresh=1`);
    await page.locator('#boot-screen[data-phase="error"]').waitFor({ state: 'visible' });
    fail = false; await page.locator('#boot-retry').click(); await ready(page);
    record(`${entry} module download failure and retry`); await context.close();
  }
  fs.rmSync(path.join(out, 'failure.txt'), { force: true });
  fs.rmSync(path.join(out, 'failure-state.json'), { force: true });
  fs.rmSync(path.join(out, 'acceptance-failure.png'), { force: true });
  record('acceptance complete', { checks: checks.length });
} catch (error) {
  fs.writeFileSync(path.join(out, 'failure.txt'), String(error?.stack || error));
  if (activePage && !activePage.isClosed()) {
    await activePage.screenshot({ path: path.join(out, 'acceptance-failure.png') }).catch(() => {});
    const state = await activePage.evaluate(() => ({ url: location.href, boot: document.querySelector('#boot-screen')?.dataset.phase, gold: document.querySelector('#gold')?.textContent, save: document.querySelector('#save-status')?.textContent, notice: document.querySelector('#quick-win-hint')?.outerHTML, workshop: document.querySelector('#settlement-panel')?.outerHTML })).catch(() => ({}));
    fs.writeFileSync(path.join(out, 'failure-state.json'), JSON.stringify(state, null, 2));
  }
  throw error;
} finally { await browser.close(); }
