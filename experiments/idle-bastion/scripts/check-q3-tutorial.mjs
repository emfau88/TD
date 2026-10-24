// Real guided normal-game flow, no model clock acceleration or fake placements.
// Test-only scene observation retains the actual renderer/camera for assertions.
import { createRequire } from 'node:module';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
const { chromium } = createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE || 'playwright');
const base = process.env.BASE_URL || 'http://127.0.0.1:5244';
const out = process.env.REPORT_DIR || 'qa/tutorial-tower-positions/browser';
fs.mkdirSync(out, { recursive: true });
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const previous = process.env.APPEND && fs.existsSync(path.join(out, 'checks.json')) ? JSON.parse(fs.readFileSync(path.join(out, 'checks.json'), 'utf8')) : { checks: [], screenshots: [] };
const checks = previous.checks, screenshots = previous.screenshots;
let activePage;
const record = (name, details = {}) => { const index = checks.findIndex(row => row.name === name); if (index >= 0) checks[index] = { name, ...details }; else checks.push({ name, ...details }); fs.writeFileSync(path.join(out, 'checks.json'), JSON.stringify({ checks, screenshots }, null, 2)); console.log(JSON.stringify({ name, ...details })); };
const shot = async (page, name) => { await page.screenshot({ path: path.join(out, `${name}.png`) }); if (!screenshots.includes(`${name}.png`)) screenshots.push(`${name}.png`); };
const ready = page => page.waitForFunction(() => document.querySelector('#boot-screen')?.hidden && window.__q3Scene?.readBattle);
const stage = (page, value, timeout = 90000) => page.waitForFunction(value => document.querySelector('#app')?.dataset.intro === value, value, { timeout });
const summary = page => page.evaluate(async () => {
  await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  const scene = window.__q3Scene, battle = scene.readBattle(), camera = scene.cameras.main, canvas = scene.game.canvas.getBoundingClientRect();
  const point = (x, y) => ({ x: canvas.left + (camera.x + (x - camera.worldView.x) * camera.zoom) * canvas.width / scene.scale.width, y: canvas.top + (camera.y + (y - camera.worldView.y) * camera.zoom) * canvas.height / scene.scale.height });
  const top = document.querySelector('.app-header').getBoundingClientRect().bottom, bottom = document.querySelector('.command-dock').getBoundingClientRect().top;
  const towerInfo = t => {
    const parts = scene.towerViews.get(t.uid), boxes = parts ? [parts.base, parts.weapon].filter(image => image.visible).map(image => image.getBounds()) : [];
    const a = point(Math.min(...boxes.map(b => b.left)), Math.min(...boxes.map(b => b.top))), b = point(Math.max(...boxes.map(b => b.right)), Math.max(...boxes.map(b => b.bottom)));
    return { pad: t.padId, kind: t.def.id, level: t.level, protected: t.protected, spent: t.spent, world: { x: t.x, y: t.y }, screen: point(t.x, t.y), body: { left: a.x, top: a.y, right: b.x, bottom: b.y }, visible: a.x >= 0 && b.x <= innerWidth && a.y >= top && b.y <= bottom };
  };
  return { stage: battle.introduction.stage, gold: battle.gold, elapsed: battle.elapsed, lives: battle.lives, kills: battle.kills, shots: battle.shots.length, highestCleared: battle.highestCleared,
    starter: battle.recommendedStarterPad, frost: battle.recommendedFrostPad,
    towers: battle.towers.map(towerInfo),
    enemies: battle.enemies.map(enemy => ({ world: { x: enemy.x, y: enemy.y }, screen: point(enemy.x, enemy.y) })),
    view: { x: camera.worldView.x, y: camera.worldView.y, width: camera.worldView.width, height: camera.worldView.height, top, bottom, guided: scene.guidedDefenseFrame, zoom: scene.mapZoom },
    visibleApproachWorldPixels: Math.max(0, Math.min(268, camera.worldView.right) - Math.max(0, camera.worldView.left)) };
});
async function clickMapHint(page, target) {
  await page.waitForFunction(target => { const cue = document.querySelector('#lesson-pointer'); return cue && !cue.hidden && cue.dataset.target === target && ['map', 'map-below'].includes(cue.dataset.mode); }, target);
  const point = await page.locator('#lesson-pointer').evaluate(node => ({ x: parseFloat(node.style.left), y: parseFloat(node.style.top) }));
  const hit = await page.evaluate(p => document.elementFromPoint(p.x, p.y)?.tagName, point);
  assert.equal(hit, 'CANVAS', `${target} must point at an accessible map target`);
  const diagnosis = await page.evaluate(p => {
    const scene = window.__q3Scene, c = scene.cameras.main, box = scene.game.canvas.getBoundingClientRect();
    const local = { x: (p.x - box.left) * scene.scale.width / box.width, y: (p.y - box.top) * scene.scale.height / box.height };
    const world = c.getWorldPoint(local.x, local.y);
    return { point: p, local, inverseWorld: { x: world.x, y: world.y }, selectedBefore: scene.selectedPadId, canvas: { x: box.x, y: box.y, width: box.width, height: box.height }, camera: { x: c.x, y: c.y, width: c.width, height: c.height, zoom: c.zoom, scrollX: c.scrollX, scrollY: c.scrollY, worldView: { x: c.worldView.x, y: c.worldView.y, width: c.worldView.width, height: c.worldView.height } }, touch: matchMedia('(pointer:coarse)').matches };
  }, point);
  fs.writeFileSync(path.join(out, 'last-map-click.json'), JSON.stringify({ target, ...diagnosis }, null, 2));
  if (diagnosis.touch) await page.touchscreen.tap(point.x, point.y); else await page.mouse.click(point.x, point.y);
}
async function continueCard(page) {
  await page.locator('#onboarding-primary').waitFor({ state: 'visible' });
  await page.waitForFunction(() => !document.querySelector('#onboarding-primary').disabled);
  await page.locator('#onboarding-primary').click();
}
async function inspectSceneBeforeMain(page) {
  await page.route(/\/src\/main\.ts(?:\?.*)?$/, async route => {
    const response = await route.fetch(), body = await response.text();
    // Vite may add an HMR timestamp. Observe the exact module used by main,
    // rather than a second class instance imported under an unversioned URL.
    const sceneURL = body.match(/from\s*["']([^"']*\/battle-scene\.ts[^"']*)["']/)?.[1];
    assert.ok(sceneURL, 'main must import the actual scene module');
    await page.evaluate(async url => {
      const { BattleScene } = await import(url);
      const prototype = BattleScene.prototype;
      if (prototype.__q3Observed) return;
      const create = prototype.create;
      prototype.create = function (...args) { window.__q3Scene = this; return create.apply(this, args); };
      prototype.__q3Observed = true;
    }, new URL(sceneURL, page.url()).href);
    await route.fulfill({ response, body });
  });
}
try {
  for (const { mobile, lang } of [{ mobile: false, lang: 'de' }, { mobile: true, lang: 'en' }]) {
    const view = mobile ? 'mobile' : 'desktop';
    if (process.env.PROFILE && process.env.PROFILE !== view) continue;
    const context = await browser.newContext({ viewport: mobile ? { width: 390, height: 844 } : { width: 1280, height: 800 }, deviceScaleFactor: 1, isMobile: mobile, hasTouch: mobile });
    const page = activePage = await context.newPage(), errors = [];
    page.on('pageerror', error => errors.push(String(error)));
    await page.addInitScript(lang => localStorage.setItem('spire-language-v1', lang), lang);
    await inspectSceneBeforeMain(page);
    await page.goto(`${base}/?fresh=1`); await ready(page); await stage(page, 'welcome');
    // Q4 extends welcome with three presentation steps; legacy welcomes still
    // advance once. Do not bypass the actual intro or mutate the battle model.
    while (await page.locator('#app').getAttribute('data-intro') === 'welcome') {
      const before = await page.locator('#app').getAttribute('data-mara-intro');
      await continueCard(page);
      await page.waitForFunction(before => document.querySelector('#app').dataset.intro !== 'welcome'
        || document.querySelector('#app').dataset.maraIntro !== before, before);
    }
    await stage(page, 'build');
    await page.locator('#pick-archer').click(); await clickMapHint(page, 'starter'); await stage(page, 'ready');
    const built = await summary(page);
    assert.equal(built.towers[0].pad, 'cell-10-5'); assert.equal(built.towers[0].protected, true); assert.equal(built.towers[0].spent, 0); assert.equal(built.gold, 75);
    await page.reload(); await ready(page); await stage(page, 'ready');
    const resumed = await summary(page); assert.deepEqual(resumed.towers.map(t => [t.pad, t.level, t.spent]), built.towers.map(t => [t.pad, t.level, t.spent])); assert.equal(resumed.gold, 75);
    assert.ok(resumed.towers.every(tower => tower.visible), 'ready reload must include the full tower sprite');
    assert.ok(resumed.visibleApproachWorldPixels >= 160);
    await shot(page, `${view}-${lang}-new-ready`);
    await continueCard(page); await stage(page, 'combat');
    await page.waitForFunction(() => { const b = window.__q3Scene.readBattle(); return b.elapsed >= 1.7 && b.enemies.length > 0 && b.kills === 0; });
    const approach = await summary(page); assert.equal(approach.shots, 0); assert.ok(approach.visibleApproachWorldPixels >= 160);
    await shot(page, `${view}-${lang}-enemy-approach`);
    record(`${view}/${lang}: real starter, ready reload and visible approach`, { built, approach });
    await page.reload(); await ready(page); await stage(page, 'combat');
    if (await page.locator('#return-card').isVisible()) { await page.locator('#claim-offline').click(); await page.locator('#return-card').waitFor({ state: 'hidden' }); }
    const combatReload = await summary(page); assert.ok(combatReload.towers.every(tower => tower.visible)); assert.ok(combatReload.visibleApproachWorldPixels >= 160);
    await shot(page, `${view}-${lang}-combat-reload`); record(`${view}/${lang}: active combat reload retains full defense framing`, combatReload);

    await stage(page, 'upgrade'); await clickMapHint(page, 'upgrade');
    await page.locator('#upgrade').click(); await continueCard(page); await stage(page, 'workshop');
    await page.waitForFunction(() => window.__q3Scene.readBattle().workshopKitAvailable, null, { timeout: 90000 });
    await page.locator('#settlement-tab').click(); await page.locator('#pick-workshop').click();
    await clickMapHint(page, 'workshop');
    await page.waitForFunction(() => window.__q3Scene.readBattle().settlement.workshopBuilt);
    await continueCard(page); await stage(page, 'research');
    await page.waitForFunction(() => window.__q3Scene.readBattle().learningPaused);
    await clickMapHint(page, 'research'); await page.locator('#research-frost').click();
    await continueCard(page); await stage(page, 'frost');
    await page.waitForFunction(() => window.__q3Scene.readBattle().learningPaused);
    await page.locator('#tower-tab').click(); await page.locator('#pick-frost').click();
    await clickMapHint(page, 'frost');
    await page.waitForFunction(() => window.__q3Scene.readBattle().towers.some(tower => tower.def.id === 2));
    await stage(page, 'done');
    if (!await page.locator('#pause').evaluate(node => node.classList.contains('paused'))) await page.locator('#pause').click();
    await page.waitForFunction(() => document.querySelector('#pause').classList.contains('paused'));
    const pair = await summary(page);
    assert.deepEqual(pair.towers.map(t => [t.pad, t.kind, t.level, t.spent]), [['cell-10-5', 1, 2, 60], ['tower-02', 2, 1, 110]]);
    assert.ok(pair.towers.every(tower => tower.visible), 'both actual guided towers must be in the visible map');
    assert.ok(pair.visibleApproachWorldPixels >= 160, 'mobile/desktop must retain a meaningful approach');
    await shot(page, `${view}-${lang}-guided-pair`);
    record(`${view}/${lang}: real guided upgrade, free workshop, Frost research and final pair`, pair);
    if (mobile) {
      await page.setViewportSize({ width: 844, height: 390 }); const landscape = await summary(page);
      assert.ok(landscape.towers.every(tower => tower.visible));
      await page.setViewportSize({ width: 390, height: 844 }); const portrait = await summary(page);
      assert.ok(portrait.towers.every(tower => tower.visible)); assert.ok(portrait.visibleApproachWorldPixels >= 160);
      record(`${view}/${lang}: orientation roundtrip retains the actual pair and approach`, { landscape, portrait });
      await page.locator('#camera-zoom').click(); const manual = await summary(page);
      assert.equal(manual.view.guided, false); assert.ok(manual.view.zoom > 1);
      await page.waitForTimeout(200); assert.equal((await summary(page)).view.guided, false);
      record(`${view}/${lang}: explicit zoom releases passive tutorial framing`, manual.view);
    }

    for (const old of ['ready', 'build']) {
      await page.goto(`${base}/tests/browser/q3-session.html`);
      await page.locator('#q3-language').selectOption(lang); await page.locator(`#old-${old}`).click(); await page.locator('#open-q3-fixture').waitFor();
      const url = new URL(await page.locator('#open-q3-fixture').getAttribute('href'), page.url()).href;
      await page.goto(url); await ready(page); await stage(page, old);
      const saved = await summary(page);
      assert.equal(saved.gold, 75);
      if (old === 'ready') { assert.equal(saved.towers[0].pad, 'cell-6-6'); assert.equal(saved.starter, 'cell-6-6'); assert.equal(saved.frost, 'cell-4-6'); }
      else { assert.equal(saved.towers.length, 0); assert.equal(saved.starter, 'cell-10-5'); }
      await page.reload(); await ready(page); await stage(page, old);
      assert.deepEqual((await summary(page)).towers.map(t => [t.pad, t.level, t.spent]), saved.towers.map(t => [t.pad, t.level, t.spent]));
      record(`${view}/${lang}: old ${old} preparation retained`, saved);
    }
    assert.deepEqual(errors, []); await context.close();
  }
  fs.rmSync(path.join(out, 'failure.txt'), { force: true });
  fs.rmSync(path.join(out, 'failure-state.json'), { force: true }); fs.rmSync(path.join(out, 'failure.png'), { force: true });
  record('Q3 tutorial acceptance complete');
} catch (error) {
  fs.writeFileSync(path.join(out, 'failure.txt'), String(error?.stack || error));
  if (activePage && !activePage.isClosed()) { await activePage.screenshot({ path: path.join(out, 'failure.png') }).catch(() => {}); fs.writeFileSync(path.join(out, 'failure-state.json'), JSON.stringify(await summary(activePage).catch(() => ({})), null, 2)); }
  throw error;
} finally { await browser.close(); }
