// Actual renderer and DOM inputs in isolated probe saves; no live model edits.
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
const { chromium } = createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE || 'playwright');
const base = process.env.BASE_URL || 'http://127.0.0.1:24750';
const out = process.env.REPORT_DIR || 'qa/hero-controls/browser'; fs.mkdirSync(out, { recursive: true });
const seed = JSON.parse(fs.readFileSync('artifacts/idle-bastion/acceptance/wave-rework-v2/earned-balanced-late.json', 'utf8'));
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const checks = [], errors = []; let page;
const record = (name, detail) => { checks.push({ name, detail }); fs.writeFileSync(path.join(out, 'checks.json'), JSON.stringify({ checks, errors }, null, 2)); console.log(name); };
const shot = name => page.screenshot({ path: path.join(out, `${name}.png`) });
const ready = () => page.waitForFunction(() => document.querySelector('#boot-screen')?.hidden && window.__heroScene?.readyToDraw);
async function resumeReturn() { if (await page.locator('#return-card').isVisible()) { await page.locator('#claim-offline').click(); await page.locator('#return-card').waitFor({ state: 'hidden' }); } }
const state = () => page.evaluate(() => {
  const s = window.__heroScene, b = s.readBattle(), c = s.cameras.main;
  return { hero: s.selectedHero, mode: s.ilyraMode, context: !document.querySelector('#context-panel').hidden, gold: b.gold, elapsed: b.elapsed,
    mara: structuredClone(b.mara), ilyra: b.ilyra && structuredClone(b.ilyra), suggestion: s.heroSuggestion,
    camera: { x: c.scrollX, y: c.scrollY, zoom: c.zoom }, text: document.querySelector('#placement-text').textContent,
    viewport: { width: innerWidth, height: innerHeight }, overflow: document.documentElement.scrollWidth > innerWidth };
});
async function observe(p) {
  await p.route(/\/src\/main\.ts(?:\?.*)?$/, async route => {
    const response = await route.fetch(), body = await response.text();
    const url = body.match(/from\s*["']([^"']*\/battle-scene\.ts[^"']*)["']/)?.[1]; assert.ok(url);
    const sessionURL = body.match(/from\s*["']([^"']*\/battle-session\.ts[^"']*)["']/)?.[1]; assert.ok(sessionURL);
    await p.evaluate(async ({url, sessionURL}) => { const { BattleScene } = await import(url), original = BattleScene.prototype.create;
      BattleScene.prototype.create = function(...args) { window.__heroScene = this; return original.apply(this, args); };
      const { BattleSession } = await import(sessionURL), command = BattleSession.prototype.command;
      BattleSession.prototype.command = async function(...args) {
        if (window.__holdHeroCommand) { window.__holdHeroCommand = false; await new Promise(resolve => { window.__releaseHeroCommand = resolve; }); }
        return command.apply(this, args);
      };
    }, { url: new URL(url, p.url()).href, sessionURL: new URL(sessionURL, p.url()).href });
    await route.fulfill({ response, body });
  });
}
async function tap(point, mobile, button = 'left') {
  assert.ok(point && point.x >= 0 && point.x < (await page.viewportSize()).width && point.y > 55, 'point must be visible');
  const hit = await page.evaluate(p => document.elementFromPoint(p.x, p.y)?.tagName, point); assert.equal(hit, 'CANVAS', JSON.stringify(point));
  if (mobile && button === 'left') await page.touchscreen.tap(point.x, point.y); else await page.mouse.click(point.x, point.y, { button });
}
const actorPoint = hero => page.evaluate(hero => { const s = window.__heroScene, a = s.readBattle()[hero]; return s.worldAnchor({ x: a.x, y: a.y - 18 }); }, hero);
const worldPoint = point => page.evaluate(p => window.__heroScene.worldAnchor(p), point);
async function ground(hero, skip = [], blocked = false) {
  return page.evaluate(async ({ hero, skip, blocked }) => {
    const s = window.__heroScene, b = s.readBattle(), actor = b[hero];
    const { findFootpath, cellCenter } = await import('/src/layout.ts');
    const candidates = [];
    for (let y = 0; y < b.layout.bounds.rows; y++) for (let x = 0; x < b.layout.bounds.columns; x++) {
      if (skip.some(c => c.x === x && c.y === y)) continue;
      const point = cellCenter(b.layout, { x, y }), screen = s.worldAnchor(point);
      if (screen.x < 25 || screen.x > innerWidth - 25 || screen.y < 170 || screen.y > document.querySelector('#placement-help').getBoundingClientRect().top - 20) continue;
      if (document.elementFromPoint(screen.x, screen.y) !== s.game.canvas) continue;
      if (b.layout.plots.some(p => point.x >= p.footprint.x * 40 && point.x < (p.footprint.x + p.footprint.width) * 40 && point.y >= (p.footprint.y - 1.2) * 40 && point.y < (p.footprint.y + p.footprint.height) * 40)) continue;
      if ([b.mara, b.ilyra].filter(Boolean).some(a => Math.hypot(point.x - a.x, point.y - (a.y - 18)) < 40)) continue;
      if ([...s.towerViews.values()].some(v => v.base.getBounds().contains(point.x, point.y) || v.weapon.getBounds().contains(point.x, point.y))) continue;
      const route = findFootpath(b.layout, { x: Math.floor(actor.x / 40), y: Math.floor(actor.y / 40) }, { x, y }, b.movementBlocked());
      if (!!route === blocked) continue;
      candidates.push({ cell: { x, y }, point, screen, distance: Math.hypot(point.x - actor.x, point.y - actor.y) });
    }
    candidates.sort((a, b) => a.distance - b.distance); return candidates[0];
  }, { hero, skip, blocked });
}
try {
  for (const mobile of [false, true]) {
    const name = mobile ? 'mobile-en' : 'desktop-de'; if (process.env.PROFILE && process.env.PROFILE !== name) continue;
    const context = await browser.newContext({ viewport: mobile ? { width: 390, height: 844 } : { width: 1280, height: 800 }, isMobile: mobile, hasTouch: mobile, deviceScaleFactor: 1 });
    page = await context.newPage(); page.on('pageerror', e => errors.push(String(e))); await observe(page);
    await page.goto(`${base}/tests/browser/q3-session.html`);
    const slot = await page.evaluate(async ({ seed, mobile }) => {
      const { IdleBattle } = await import('/src/battle.ts'), { openBattleStore } = await import('/src/save-store.ts');
      const b = IdleBattle.restore(seed); if (!b) throw Error('Invalid earned seed');
      if (!b.buildTavern(b.recommendedTavernPlot) || !b.upgradeTavern()) throw Error('Earned tavern purchases failed');
      const slot = `a2-${crypto.randomUUID()}`, store = await openBattleStore(undefined, `spire-idle-bastion-probe-${slot}`);
      await store.save(b.snapshot(), true, 0); store.close(); localStorage.setItem('spire-language-v1', mobile ? 'en' : 'de'); return slot;
    }, { seed, mobile });
    await page.goto(`${base}/?probe=${slot}`); await ready(); await resumeReturn();
    await page.locator('#pick-mara').click(); await page.locator('#move-mara').click();
    await page.waitForFunction(() => window.__heroScene.selectedHero === 'mara');
    await page.locator('#cancel-placement').click();
    const camera = (await state()).camera; await tap(await actorPoint('mara'), mobile);
    await page.waitForFunction(() => window.__heroScene.selectedHero === 'mara');
    assert.equal((await state()).context, false); assert.deepEqual((await state()).camera, camera);
    await tap(await actorPoint('mara'), mobile); await page.locator('#context-panel').waitFor({ state: 'visible' });
    assert.deepEqual((await state()).camera, camera); await page.locator('#move-mara').click();
    const original = await state(), one = await ground('mara'); assert.ok(one); await tap(one.screen, mobile);
    await page.waitForFunction(p => window.__heroScene.readBattle().mara.path.at(-1)?.x === p.x && window.__heroScene.readBattle().mara.path.at(-1)?.y === p.y, one.point);
    const two = await ground('mara', [one.cell]); await tap(two.screen, mobile);
    await page.waitForFunction(p => window.__heroScene.readBattle().mara.path.at(-1)?.x === p.x && window.__heroScene.readBattle().mara.path.at(-1)?.y === p.y, two.point);
    let after = await state(); assert.equal(after.hero, 'mara'); assert.deepEqual([after.mara.x, after.mara.y, after.elapsed, after.mara.targetTowerUid, after.mara.cooldownRemaining], [original.mara.x, original.mara.y, original.elapsed, original.mara.targetTowerUid, original.mara.cooldownRemaining]);
    if (!mobile) {
      await tap(one.screen, false, 'right'); await page.waitForFunction(p => window.__heroScene.readBattle().mara.path.at(-1)?.x === p.x && window.__heroScene.readBattle().mara.path.at(-1)?.y === p.y, one.point);
      const prevented = await page.evaluate(() => { const e = new MouseEvent('contextmenu', { bubbles: true, cancelable: true }); window.__heroScene.game.canvas.dispatchEvent(e); return e.defaultPrevented; }); assert.equal(prevented, true);
    }
    const invalid = await ground('mara', [], true); assert.ok(invalid); const pathBefore = (await state()).mara.path;
    await tap(invalid.screen, mobile); await page.waitForFunction(() => /Kein freier Weg|No clear path/.test(document.querySelector('#placement-text').textContent));
    assert.deepEqual((await state()).mara.path, pathBefore); await shot(`${name}-mara-selection`);
    record(`${name}: select / second tap / two routes / pause / invalid / right click`, await state());

    if (process.env.RACES_ONLY) {
      await page.evaluate(() => { window.__holdHeroCommand = true; }); await tap(two.screen, mobile);
      await page.waitForFunction(() => !!window.__releaseHeroCommand);
      await page.locator('#pick-archer').click();
      await page.evaluate(() => { window.__releaseHeroCommand(); window.__releaseHeroCommand = undefined; });
      await page.waitForTimeout(250); assert.deepEqual((await state()).mara.path, pathBefore);
      await page.locator('#cancel-placement').click(); await tap(await actorPoint('mara'), mobile);
      await page.evaluate(() => { const s = window.__heroScene; window.__originalHeroRender = s.hooks.canRender; s.hooks.canRender = () => false; });
      await tap(one.screen, mobile); await page.waitForFunction(() => !!window.__heroScene.pendingTap);
      await page.locator('#pick-archer').click();
      await page.evaluate(() => { window.__heroScene.hooks.canRender = window.__originalHeroRender; });
      await page.waitForTimeout(250); assert.deepEqual((await state()).mara.path, pathBefore);
      assert.equal(await page.evaluate(() => window.__heroScene.pendingTap), undefined);
      record(`${name}: delayed command and deferred pointer cannot survive a build-mode switch`, await state());
      await context.close(); continue;
    }

    // A real drag must pan without replacing the queued destination.
    const dragStart = two.screen, dragEnd = { x: Math.min(dragStart.x + 70, (await page.viewportSize()).width - 20), y: dragStart.y + 30 };
    if (mobile) { const cdp = await context.newCDPSession(page); await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [dragStart] }); await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [dragEnd] }); await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); await cdp.detach(); }
    else { await page.mouse.move(dragStart.x, dragStart.y); await page.mouse.down(); await page.mouse.move(dragEnd.x, dragEnd.y, { steps: 6 }); await page.mouse.up(); }
    assert.deepEqual((await state()).mara.path, pathBefore); record(`${name}: dragging does not move hero`, await state());
    await page.locator('#pick-mara').click(); assert.equal((await state()).hero, undefined); await page.locator('#close-context').click();
    await tap(await actorPoint('mara'), mobile); await page.locator('#pick-archer').click();
    assert.equal((await state()).hero, undefined); await page.locator('#cancel-placement').click();
    await page.locator('#pick-mara').click(); await page.locator('#move-mara').click(); await page.locator('#open-menu').click();
    await page.waitForFunction(() => !window.__heroScene.selectedHero); await page.keyboard.press('Escape');
    record(`${name}: HUD, build and dialog end movement selection`, await state());

    // Recruit through the existing UI. Only the saved earned fixture was prepared.
    await page.locator('#settlement-tab').click(); await page.locator('#pick-tavern').click();
    await page.locator('#tavern-dialog').waitFor({ state: 'visible' });
    await page.locator('#tavern-dialog [data-do="ilyra"]').click(); await page.locator('#recruit-ilyra').click();
    await page.waitForFunction(() => window.__heroScene.selectedHero === 'ilyra' && !!window.__heroScene.readBattle().ilyra);
    const recruited = await state(); assert.equal(recruited.ilyra.introduction, 'move'); assert.equal(recruited.ilyra.autoCast, false); assert.equal(recruited.context, false); assert.ok(recruited.suggestion);
    await shot(`${name}-ilyra-position`); await tap(await worldPoint(recruited.suggestion), mobile);
    await page.waitForFunction(() => window.__heroScene.readBattle().ilyra.path.length > 0);
    assert.equal(await page.locator('#hero-aim').isDisabled(), true);
    await page.locator('#pause').click(); await page.waitForFunction(() => !document.querySelector('#pause').classList.contains('paused'));
    await page.waitForFunction(start => { const s = window.__heroScene.readBattle().ilyra; return s.path.length > 0 && Math.hypot(s.x - start.x, s.y - start.y) > 40; }, recruited.ilyra);
    await page.reload(); await ready(); await resumeReturn();
    await page.waitForFunction(() => window.__heroScene.selectedHero === 'ilyra');
    const walking = await state(); assert.ok(walking.ilyra.path.length); assert.equal(await page.locator('#hero-aim').isDisabled(), true);
    record(`${name}: real recruitment, paid tavern, walking reload and disabled premature cast`, walking);
    await page.waitForFunction(() => !window.__heroScene.readBattle().ilyra.path.length, null, { timeout: 60000 });
    await page.waitForFunction(() => !document.querySelector('#hero-aim').disabled, null, { timeout: 90000 });
    const arrived = await state(); assert.equal(arrived.ilyra.volley, null); assert.equal(arrived.ilyra.introduction, 'cast');
    await shot(`${name}-ilyra-ready`); await page.locator('#hero-aim').click();
    await page.waitForFunction(() => window.__heroScene.ilyraMode === 'cast');
    const target = await page.evaluate(async () => { const s = window.__heroScene, { ilyraFirstTarget } = await import('/src/hero-controls.ts'); const p = ilyraFirstTarget(s.readBattle()); return p && s.worldAnchor(p); });
    await tap(target, mobile);
    await page.waitForFunction(() => !!window.__heroScene.readBattle().ilyra.volley || window.__heroScene.readBattle().ilyra.introduction === 'done');
    await page.waitForFunction(() => window.__heroScene.readBattle().ilyra.introduction === 'done');
    assert.equal((await state()).hero, 'ilyra'); assert.equal((await state()).ilyra.autoCast, false);
    await page.locator('#pause').click(); await shot(`${name}-ilyra-first-volley`);
    record(`${name}: arrival and explicit first volley complete without menu detour`, await state());
    const volleyPath = (await state()).ilyra.path, noWalk = await ground('ilyra');
    if (noWalk) { await tap(noWalk.screen, mobile); assert.deepEqual((await state()).ilyra.path, volleyPath); }
    await page.locator('#pick-mara').click(); await page.locator('#move-mara').click();
    const switchingCamera = (await state()).camera;
    await tap(await actorPoint('ilyra'), mobile); await page.waitForFunction(() => window.__heroScene.selectedHero === 'ilyra');
    await tap(await actorPoint('mara'), mobile); await page.waitForFunction(() => window.__heroScene.selectedHero === 'mara');
    assert.equal((await state()).context, false); assert.deepEqual((await state()).camera, switchingCamera);
    const towerPoint = await page.evaluate(() => { const s = window.__heroScene, t = s.readBattle().towers.find(t => t.protected); return s.worldAnchor({ x: t.x, y: t.y - 35 }); });
    const maraRoute = (await state()).mara.path; await tap(towerPoint, mobile);
    await page.locator('#context-panel').waitFor({ state: 'visible' }); assert.equal((await state()).hero, undefined); assert.deepEqual((await state()).mara.path, maraRoute);
    await page.locator('#close-context').click(); await tap(await actorPoint('mara'), mobile);
    await page.keyboard.press('Escape'); await page.waitForFunction(() => !window.__heroScene.selectedHero);
    assert.equal(await page.evaluate(() => { const e = new MouseEvent('contextmenu', { bubbles: true, cancelable: true }); window.__heroScene.game.canvas.dispatchEvent(e); return e.defaultPrevented; }), false);
    record(`${name}: hero switching, tower priority, volley movement lock, Escape and context menu scope`, await state());
    assert.equal((await state()).overflow, false); await context.close();
  }
  assert.deepEqual(errors, []); record('Hero control acceptance complete', { errors });
  for (const name of ['failure.txt', 'failure-state.json', 'failure.png']) fs.rmSync(path.join(out, name), { force: true });
} catch (error) {
  fs.writeFileSync(path.join(out, 'failure.txt'), String(error.stack || error));
  if (page && !page.isClosed()) { await shot('failure').catch(() => {}); fs.writeFileSync(path.join(out, 'failure-state.json'), JSON.stringify(await state().catch(() => ({})), null, 2)); }
  throw error;
} finally { await browser.close(); }
