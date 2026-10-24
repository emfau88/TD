import { createRequire } from 'node:module';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
const { chromium } = createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE || 'playwright');
const base = process.env.BASE_URL || 'http://127.0.0.1:5245';
const out = process.env.REPORT_DIR || 'qa/q4-mara-introduction/behavior';
fs.mkdirSync(out, { recursive: true });
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const checks = []; let page;
const record = (name, detail = {}) => { checks.push({ name, ...detail }); console.log(name); };
async function setup(options = {}) {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, ...options });
  const p = page = await context.newPage();
  await p.addInitScript(() => { if (!localStorage.getItem('spire-language-v1')) localStorage.setItem('spire-language-v1', 'de'); });
  await p.route(/\/src\/main\.ts(?:\?.*)?$/, async route => {
    const response = await route.fetch(), body = await response.text();
    const url = body.match(/from\s*["']([^"']*\/battle-scene\.ts[^"']*)["']/)?.[1]; assert.ok(url);
    await p.evaluate(async url => {
      const { BattleScene } = await import(url), original = BattleScene.prototype.create;
      BattleScene.prototype.create = function(...args) { window.__q4Scene = this; return original.apply(this, args); };
    }, new URL(url, p.url()).href);
    await route.fulfill({ response, body });
  });
  return { context, p };
}
const loaded = p => p.waitForFunction(() => document.querySelector('#boot-screen')?.hidden && window.__q4Scene?.readyToDraw);
const state = p => p.evaluate(() => {
  const s = window.__q4Scene, c = s.cameras.main, b = s.readBattle(), card = document.querySelector('#onboarding-card').getBoundingClientRect();
  const header = document.querySelector('.app-header').getBoundingClientRect(), canvas = s.game.canvas.getBoundingClientRect();
  const point = (x, y) => c.getWorldPoint((x - canvas.left) * s.scale.width / canvas.width, (y - canvas.top) * s.scale.height / canvas.height);
  const a = point(1, header.bottom + 9), z = point(innerWidth - 1, card.top - 13);
  return { step: s.introStep, stage: b.introduction.stage, panning: c.panEffect.isRunning, camera: { x: c.scrollX, y: c.scrollY, zoom: c.zoom }, gold: b.gold, towers: b.towers.length,
    card: card.toJSON(), header: header.toJSON(), freeWorld: { left: a.x, top: a.y, right: z.x, bottom: z.y }, viewport: { width: innerWidth, height: innerHeight } };
});
async function fresh(p) { await p.goto(`${base}/?fresh=1`); await loaded(p); }
async function build(p) { await p.waitForFunction(() => document.querySelector('#app').dataset.intro === 'build'); assert.equal(await p.locator('#app').getAttribute('data-mara-intro'), ''); }
try {
  for (const skipAt of [0, 1, 2]) {
    const { context, p } = await setup(); await fresh(p);
    for (let i = 0; i < skipAt; i++) await p.locator('#onboarding-primary').click();
    await p.locator('#intro-skip').click(); await build(p);
    const result = await state(p); assert.equal(result.gold, 75); assert.equal(result.towers, 0); assert.equal(result.panning, false);
    await p.waitForTimeout(1300); assert.deepEqual((await state(p)).camera, result.camera);
    await p.reload(); await loaded(p); await build(p);
    record(`skip scene ${skipAt + 1}, no deferred camera or tutorial skip, reload`, result);
    await context.close();
  }
  {
    const { context, p } = await setup(); await fresh(p);
    await p.locator('#onboarding-primary').click();
    assert.equal((await state(p)).panning, true);
    await p.locator('#onboarding-primary').click();
    assert.equal((await state(p)).step, 2); assert.equal((await state(p)).panning, false);
    await p.locator('#open-menu').click(); await p.locator('#language-choice').selectOption('en'); await p.locator('#close-menu').click();
    assert.match(await p.locator('#onboarding-copy').innerText(), /spells up my sleeve/); assert.equal((await state(p)).step, 2);
    for (const viewport of [{ width: 844, height: 390 }, { width: 320, height: 568 }, { width: 390, height: 844 }]) {
      await p.setViewportSize(viewport);
      await p.waitForTimeout(250);
      const s = await state(p); assert.equal(s.step, 2); assert.equal(s.panning, false);
      assert.ok(s.card.top >= s.header.bottom && s.card.bottom <= viewport.height && s.card.left >= 0 && s.card.right <= viewport.width);
      const overflow = await p.locator('#onboarding-card').evaluate(e => e.scrollWidth > e.clientWidth || e.scrollHeight > e.clientHeight);
      assert.equal(overflow, false);
      await p.screenshot({ path: path.join(out, `rotation-${viewport.width}x${viewport.height}.png`) }); record('responsive scene 3', s);
    }
    await p.locator('#onboarding-primary').click(); await build(p);
    record('rapid next aborts pan; language switch retains step; rotation and small phone'); await context.close();
  }
  {
    const { context, p } = await setup({ reducedMotion: 'reduce' }); await fresh(p);
    await p.locator('#onboarding-primary').focus(); await p.keyboard.press('Enter');
    const s = await state(p); assert.equal(s.step, 1); assert.equal(s.panning, false);
    await p.keyboard.press('Tab'); assert.equal(await p.evaluate(() => document.activeElement.id), 'intro-skip');
    await p.keyboard.press('Enter'); await build(p); record('reduced motion, keyboard next and skip'); await context.close();
  }
  for (const all of [false, true]) {
    const { context, p } = await setup();
    await p.route(/\/assets\/intro\/mara\//, route => route.request().resourceType() === 'image' ? route.abort() : route.continue());
    if (all) await p.route(/\/assets\/tavern-rig\/mara-portrait\.webp/, route => route.request().resourceType() === 'image' ? route.abort() : route.continue());
    const start = performance.now(); await fresh(p);
    if (all) { assert.equal(await p.locator('#intro-portrait').isVisible(), false); assert.equal(await p.locator('#onboarding-card canvas').isVisible(), true); }
    else assert.match(await p.locator('#intro-portrait').getAttribute('src'), /tavern-rig/);
    await p.locator('#intro-skip').click(); await build(p);
    record(all ? 'all portrait downloads fail: existing Mara canvas, usable UI' : 'new portrait downloads fail: existing portrait, usable UI', { elapsedMs: Math.round(performance.now() - start) });
    await context.close();
  }
  {
    const { context, p } = await setup();
    await p.addInitScript(() => {
      for (const method of ['getItem', 'setItem', 'removeItem']) {
        const original = Storage.prototype[method]; Storage.prototype[method] = function(key, ...args) {
          if (String(key).startsWith('spire-ui-intro-v1:')) throw new DOMException('blocked', 'SecurityError');
          return original.call(this, key, ...args);
        };
      }
    });
    await fresh(p); await p.locator('#onboarding-primary').click(); assert.equal((await state(p)).step, 1);
    await p.reload(); await loaded(p); assert.equal((await state(p)).step, null); assert.equal((await state(p)).stage, 'welcome');
    await p.locator('#onboarding-primary').click(); await build(p);
    record('blocked UI storage: in-memory intro, reload uses safe legacy welcome'); await context.close();
  }
  for (const old of ['welcome', 'build', 'ready', 'combat', 'done']) {
    const { context, p } = await setup(); await p.goto(`${base}/tests/browser/q3-session.html`);
    const slot = await p.evaluate(async old => {
      const { IdleBattle } = await import('/src/battle.ts'), { openBattleStore } = await import('/src/save-store.ts');
      const b = old === 'done' ? new IdleBattle() : IdleBattle.newGame();
      if (['build', 'ready', 'combat'].includes(old)) b.beginIntroduction();
      if (['ready', 'combat'].includes(old)) b.build('cell-6-6');
      if (old === 'combat') b.startDefense();
      const slot = `q4-legacy-${crypto.randomUUID()}`, store = await openBattleStore(undefined, `spire-idle-bastion-probe-${slot}`);
      await store.save(b.snapshot(), false, 0); store.close(); return slot;
    }, old);
    await p.goto(`${base}/?probe=${slot}`); await loaded(p);
    assert.equal((await state(p)).step, null); assert.equal((await state(p)).stage, old);
    assert.equal(await p.locator('#intro-skip').isVisible(), false);
    record(`legacy ${old}: no new introduction`); await context.close();
  }
} catch (error) {
  if (page && !page.isClosed()) { await page.screenshot({ path: path.join(out, 'failure.png') }); checks.push({ failure: String(error.stack), state: await state(page).catch(() => null) }); }
  throw error;
} finally { fs.writeFileSync(path.join(out, 'checks.json'), JSON.stringify(checks, null, 2)); await browser.close(); }
