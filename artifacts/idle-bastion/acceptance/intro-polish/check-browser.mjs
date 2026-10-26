import { chromium } from 'file:///C:/Users/madde/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';
const root = new URL('./', import.meta.url), results = [];
const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
try {
  for (const [width, height] of [[1280, 850], [390, 844], [320, 568], [844, 390]]) for (const lang of ['de', 'en']) {
    const context = await browser.newContext({ viewport: { width, height } });
    await context.addInitScript(lang => { localStorage.setItem('spire-language-v1', lang); localStorage.setItem('spire-audio-mix-v1', JSON.stringify({ music: 0, effects: 0, voices: 0, muted: true })); }, lang);
    const page = await context.newPage(), errors = []; page.on('pageerror', e => errors.push(e.message));
    await page.route('**/src/battle-scene.ts*', async route => {
      const response = await route.fetch(), body = (await response.text()).replace(/super\(["']IdleBattle["']\);/, 'super("IdleBattle");window.__introScene=this;');
      await route.fulfill({ response, body });
    });
    await page.goto(`http://127.0.0.1:5235/?probe=intro-polish-${crypto.randomUUID()}`);
    await page.locator('#boot-screen').waitFor({ state: 'hidden', timeout: 60000 });
    console.log(`Checking ${width}x${height}/${lang}`);
    const frames = new Set();
    for (let n = 0; n < 5; n++) {
      frames.add(await page.evaluate(() => window.__introScene.children.list.find(o => o.texture?.key === 'idle-core-weapon').frame.name));
      await page.waitForTimeout(130);
    }
    assert.ok(frames.size >= 3, 'Core animates before combat');
    for (let step = 0; step < 3; step++) {
      await page.waitForFunction(step => window.__introScene.introStep === step && !window.__introScene.cameras.main.panEffect.isRunning && !document.querySelector('#lesson-pointer').hidden, step);
      const state = await page.evaluate(() => {
        const s = window.__introScene, b = s.sim, camera = s.cameras.main;
        const rect = id => document.querySelector(id).getBoundingClientRect().toJSON();
        const mara = s.mara.getBounds(), point = s.worldAnchor({ x: mara.x, y: mara.y });
        return { step: s.introStep, sprite: { x: point.x, y: point.y, width: mara.width * camera.zoom, height: mara.height * camera.zoom, alpha: s.mara.alpha },
          name: s.worldAnchor(s.maraName), coreHealth: s.worldAnchor(s.coreHealthLabel),
          model: { x: b.mara.x, y: b.mara.y, path: b.mara.path.length, elapsed: b.elapsed, gold: b.gold, towers: b.towers.length },
          maraSprites: s.children.list.filter(o => o.texture?.key === 'idle-mara').length,
          progress: document.querySelector('#record-wave').textContent, eyebrow: document.querySelector('#onboarding-eyebrow').textContent,
          arrow: rect('#lesson-pointer'), card: rect('#onboarding-card'), header: rect('.app-header'), button: rect('#onboarding-primary'), mode: document.querySelector('#lesson-pointer').dataset.mode };
      });
      assert.equal(state.maraSprites, 1); assert.equal(state.sprite.alpha, 1);
      assert.deepEqual(state.model, { x: 220, y: 300, path: 0, elapsed: 0, gold: 75, towers: 0 });
      assert.match(state.progress, new RegExp(`${step + 1}/14$`)); assert.equal(state.eyebrow, state.progress);
      assert.ok(state.arrow.left >= -1 && state.arrow.right <= width + 1, 'Arrow inside horizontal viewport');
      assert.ok(state.arrow.top >= state.header.bottom - 1, 'Arrow clears header');
      const overlap = (a, b) => a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
      assert.equal(overlap(state.arrow, state.card), false, 'Arrow clears dialogue');
      assert.ok(state.button.bottom <= height && state.button.left >= 0 && state.button.right <= width);
      assert.ok(state.sprite.x >= 0 && state.sprite.x + state.sprite.width <= width + 1 && state.sprite.y >= state.header.bottom - 1);
      assert.ok(state.sprite.y + state.sprite.height < state.card.top || state.sprite.x + state.sprite.width < state.card.left, 'Mara visible outside dialogue');
      await page.screenshot({ path: fileURLToPath(new URL(`${width}-${height}-${lang}-${step + 1}.png`, root)) });
      results.push({ width, height, lang, ...state });
      if (step === 0) {
        await page.locator('#onboarding-primary').click();
        // Observe the real pan: a single sprite fades, moves once, and returns.
        const transition = [];
        for (let n = 0; n < 9; n++) { transition.push(await page.evaluate(() => ({ alpha: window.__introScene.mara.alpha, count: window.__introScene.children.list.filter(o => o.texture?.key === 'idle-mara').length }))); await page.waitForTimeout(130); }
        assert.ok(transition.every(s => s.count === 1)); assert.ok(transition.some(s => s.alpha < .05));
      } else if (step === 1) {
        await page.reload(); await page.locator('#boot-screen').waitFor({ state: 'hidden', timeout: 60000 });
        if (await page.locator('#return-card').isVisible()) await page.locator('#claim-offline').click();
        await page.waitForFunction(() => window.__introScene.introStep === 1);
        assert.equal(await page.evaluate(() => window.__introScene.mara.x), 220);
        await page.locator('#onboarding-primary').click();
      }
    }
    await page.locator('#onboarding-primary').click();
    await page.waitForFunction(() => window.__introScene.introStep === null && document.querySelector('#record-wave').textContent.endsWith('4/14'));
    assert.deepEqual(errors, []); await context.close();
  }
  writeFileSync(new URL('browser-results.json', root), JSON.stringify(results, null, 2) + '\n');
  console.log(`Passed ${results.length} scenes with native reload and tutorial continuation.`);
} finally { await browser.close(); }
