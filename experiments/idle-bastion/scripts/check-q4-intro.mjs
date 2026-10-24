// Real browser presentation; observation only, no scene/model substitutions.
import { createRequire } from 'node:module';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
const { chromium } = createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE || 'playwright');
const base = process.env.BASE_URL || 'http://127.0.0.1:5245';
const out = process.env.REPORT_DIR || 'qa/q4-mara-introduction/browser';
const captureOnly = process.env.CAPTURE_ONLY === '1';
fs.mkdirSync(out, { recursive: true });
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const checks = [], errors = [];
let page;
async function observe(page) {
  await page.route(/\/src\/main\.ts(?:\?.*)?$/, async route => {
    const response = await route.fetch(), body = await response.text();
    const url = body.match(/from\s*["']([^"']*\/battle-scene\.ts[^"']*)["']/)?.[1];
    assert.ok(url);
    await page.evaluate(async url => {
      const { BattleScene } = await import(url), original = BattleScene.prototype.create;
      BattleScene.prototype.create = function(...args) { window.__q4Scene = this; return original.apply(this, args); };
    }, new URL(url, page.url()).href);
    await route.fulfill({ response, body });
  });
}
const loaded = page => page.waitForFunction(() => document.querySelector('#boot-screen')?.hidden && window.__q4Scene?.readyToDraw);
const step = (page, n) => page.waitForFunction(n => document.querySelector('#app').dataset.maraIntro === String(n), n);
async function snapshot(page) {
  await page.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))));
  return page.evaluate(() => {
    const card = document.querySelector('#onboarding-card'), portrait = document.querySelector('#intro-portrait');
    const s = window.__q4Scene, c = s.cameras.main, b = s.readBattle(), rect = s.game.canvas.getBoundingClientRect();
    const p = point => ({ x: rect.left + (c.x + (point.x - c.worldView.x) * c.zoom) * rect.width / s.scale.width, y: rect.top + (c.y + (point.y - c.worldView.y) * c.zoom) * rect.height / s.scale.height });
    const center = cell => ({ x: (cell.x + .5) * b.layout.cellSize, y: (cell.y + .5) * b.layout.cellSize });
    const cardRect = card.getBoundingClientRect(), copy = document.querySelector('#onboarding-copy').getBoundingClientRect();
    return { step: s.introStep, stage: b.introduction.stage, text: document.querySelector('#onboarding-copy').textContent,
      card: cardRect.toJSON(), copy: copy.toJSON(), portrait: { src: portrait.currentSrc, loaded: portrait.complete && portrait.naturalWidth > 0, rect: portrait.getBoundingClientRect().toJSON() },
      core: p(center(b.layout.core)), spawn: p(center(b.layout.road.waypoints[0])), starter: p(center(b.layout.towerPads.find(pad => pad.id === b.recommendedStarterPad).cell)),
      health: { visible: s.coreHealthLabel.visible, text: s.coreHealthLabel.text, screen: p(s.coreHealthLabel), domClip: getComputedStyle(document.querySelector('.life-tile')).clipPath },
      camera: { x: c.worldView.x, y: c.worldView.y, width: c.worldView.width, height: c.worldView.height, panning: c.panEffect.isRunning },
      overflow: document.documentElement.scrollWidth > innerWidth, gold: b.gold, towers: b.towers.length, marker: s.learningTarget,
      resources: performance.getEntriesByType('resource').filter(e => /assets\/(intro|tavern-rig)/.test(e.name)).map(e => ({ name: e.name, bytes: e.transferSize, duration: e.duration })) };
  });
}
function validate(s, width, height) {
  assert.equal(s.overflow, false); assert.ok(s.card.x >= 0 && s.card.right <= width && s.card.bottom <= height);
  assert.ok(s.copy.bottom <= s.card.bottom); assert.equal(s.portrait.loaded, true);
  const points = s.step === 0 ? [s.core] : [s.spawn, s.starter];
  for (const p of points) { assert.ok(p.x >= 0 && p.x < width, `target x ${p.x}`); assert.ok(p.y > 54 && p.y < s.card.top, `target y ${p.y}, card ${s.card.top}`); }
  assert.equal(s.gold, 75); assert.equal(s.towers, 0); assert.equal(s.marker, undefined);
  assert.equal(s.health.visible, width <= 700); assert.equal(s.health.text, '♥ 20 / 20');
  if (width <= 700) {
    assert.equal(s.health.domClip, 'inset(50%)');
    assert.equal(s.health.screen.x, s.core.x); assert.ok(s.health.screen.y > s.core.y);
    if (s.step > 0) assert.ok(s.health.screen.x > width, 'health leaves the screen with the core');
  }
}
try {
  for (const mobile of [false, true]) for (const lang of ['de', 'en']) {
    const viewport = mobile ? { width: 390, height: 844 } : { width: 1280, height: 800 };
    const name = `${mobile ? 'mobile' : 'desktop'}-${lang}`;
    const context = await browser.newContext({ viewport, deviceScaleFactor: mobile ? 2 : 1, isMobile: mobile, hasTouch: mobile,
      ...(mobile && lang === 'de' ? { recordVideo: { dir: path.join(out, 'video'), size: viewport } } : {}) });
    page = await context.newPage(); page.on('pageerror', e => errors.push(String(e)));
    await page.addInitScript(lang => { if (!localStorage.getItem('spire-language-v1')) localStorage.setItem('spire-language-v1', lang); }, lang);
    await observe(page);
    await page.goto(`${base}/?fresh=1`); await loaded(page); await step(page, 0);
    for (let n = 0; n < 3; n++) {
      await step(page, n); await page.waitForFunction(() => !window.__q4Scene.cameras.main.panEffect.isRunning);
      const s = await snapshot(page); validate(s, viewport.width, viewport.height);
      await page.screenshot({ path: path.join(out, `${name}-scene-${n + 1}.png`) });
      checks.push({ name: `${name}: scene ${n + 1}`, ...s });
      // A full reload at each scene proves the persisted presentation step.
      if (!captureOnly) { await page.reload(); await loaded(page); await step(page, n); assert.equal((await snapshot(page)).text, s.text); }
      await page.locator('#onboarding-primary').click();
    }
    await page.waitForFunction(() => document.querySelector('#app').dataset.intro === 'build');
    await page.screenshot({ path: path.join(out, `${name}-build.png`) });
    assert.equal(await page.locator('#intro-skip').isVisible(), false);
    assert.equal(await page.locator('#pick-archer').isVisible(), true);
    if (!captureOnly) { await page.reload(); await loaded(page); }
    assert.equal(await page.locator('#app').getAttribute('data-intro'), 'build');
    assert.equal(await page.locator('#app').getAttribute('data-mara-intro'), '');
    checks.push({ name: `${name}: ${captureOnly ? 'visual capture and core health anchoring' : 'all scene reloads + committed build reload'}`, passed: true });
    await context.close();
  }
  assert.deepEqual(errors, []);
} catch (error) {
  if (page && !page.isClosed()) { await page.screenshot({ path: path.join(out, 'failure.png') }); checks.push({ failure: String(error.stack), state: await snapshot(page).catch(() => null) }); }
  throw error;
} finally { fs.writeFileSync(path.join(out, 'checks.json'), JSON.stringify({ checks, errors }, null, 2)); await browser.close(); }
