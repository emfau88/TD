import { chromium } from 'file:///C:/Users/madde/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';
const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
const results = [];
try {
  for (const variant of ['reduced-motion', 'resize-during-pan', 'skip-welcome']) {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: variant === 'reduced-motion' ? 'reduce' : 'no-preference' });
    await context.addInitScript(() => localStorage.setItem('spire-audio-mix-v1', JSON.stringify({ music: 0, effects: 0, voices: 0, muted: true })));
    const page = await context.newPage(), errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.route('**/src/battle-scene.ts*', async route => {
      const response = await route.fetch(), body = (await response.text()).replace(/super\(["']IdleBattle["']\);/, 'super("IdleBattle");window.__introScene=this;');
      await route.fulfill({ response, body });
    });
    await page.goto(`http://127.0.0.1:5235/?probe=intro-transition-${crypto.randomUUID()}`);
    await page.locator('#boot-screen').waitFor({ state: 'hidden', timeout: 60000 });
    await page.waitForFunction(() => window.__introScene.introStep === 0 && !document.querySelector('#lesson-pointer').hidden);
    const pointerStyle = () => page.locator('#lesson-pointer').evaluate(el => {
      const style = getComputedStyle(el), svg = getComputedStyle(el.querySelector('svg'));
      return { width: style.width, height: style.height, shadow: style.filter, animation: svg.animationName, opacity: svg.opacity };
    });
    const openingPointer = await pointerStyle();
    if (variant === 'reduced-motion') {
      assert.equal(await page.locator('#lesson-pointer svg').evaluate(el => getComputedStyle(el).animationName), 'none');
      await page.locator('#onboarding-primary').click();
      await page.waitForFunction(() => window.__introScene.introStep === 1);
      assert.equal(await page.evaluate(() => window.__introScene.cameras.main.panEffect.isRunning), false);
    } else if (variant === 'resize-during-pan') {
      await page.locator('#onboarding-primary').click();
      await page.waitForFunction(() => window.__introScene.cameras.main.panEffect.isRunning);
      await page.setViewportSize({ width: 844, height: 390 });
      await page.waitForFunction(() => window.__introScene.introStep === 1 && !window.__introScene.cameras.main.panEffect.isRunning && !document.querySelector('#lesson-pointer').hidden);
    }
    await page.locator('#intro-skip').click();
    await page.waitForFunction(() => window.__introScene.introStep === null && document.querySelector('#record-wave').textContent.endsWith('4/14'));
    await page.waitForFunction(() => document.querySelector('#lesson-pointer').dataset.mode === 'button' && !document.querySelector('#lesson-pointer').hidden);
    const menuPointer = await pointerStyle();
    assert.deepEqual(menuPointer, openingPointer, 'Opening and existing menu pointers share their size, shadow and motion');
    if (variant === 'skip-welcome') await page.screenshot({ path: fileURLToPath(new URL('390-844-menu-pointer.png', import.meta.url)) });
    const state = await page.evaluate(() => {
      const s = window.__introScene;
      return { x: s.mara.x, y: s.mara.y, alpha: s.mara.alpha, count: s.children.list.filter(o => o.texture?.key === 'idle-mara').length,
        model: { x: s.sim.mara.x, y: s.sim.mara.y, elapsed: s.sim.elapsed, gold: s.sim.gold, stage: s.sim.introduction.stage },
        progress: document.querySelector('#record-wave').textContent };
    });
    assert.deepEqual({ x: state.x, y: state.y, alpha: state.alpha, count: state.count }, { x: 220, y: 300, alpha: 1, count: 1 });
    assert.deepEqual(state.model, { x: 220, y: 300, elapsed: 0, gold: 75, stage: 'build' });
    assert.deepEqual(errors, []);
    results.push({ variant, ...state, openingPointer, menuPointer, errors }); await context.close();
  }
  writeFileSync(new URL('transition-results.json', import.meta.url), JSON.stringify(results, null, 2) + '\n');
  console.log('Passed reduced motion, orientation change during pan and skip from welcome.');
} finally { await browser.close(); }
