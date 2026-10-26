import { chromium } from 'file:///C:/Users/madde/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';
import { IdleBattle } from '../../../../experiments/idle-bastion/src/battle.ts';
const root = new URL('./', import.meta.url), fixtures = {};
const fresh = IdleBattle.newGame(); fresh.beginIntroduction(); fixtures.build = fresh.snapshot();
fresh.build(fresh.recommendedStarterPad); fresh.startDefense();
for (let i = 0; i < 4000 && !fresh.mara.path.length; i++) {
  fresh.update(.025);
  if (fresh.learningPaused) {
    if (fresh.introduction.stage === 'upgrade') fresh.upgrade(1);
    if (fresh.introduction.stage === 'workshop') fresh.buildWorkshop();
    if (fresh.introduction.stage === 'research') fresh.researchFrost();
    fresh.continueLesson();
  }
}
assert.ok(fresh.mara.path.length); fixtures.walking = fresh.snapshot();
const b = IdleBattle.restore(JSON.parse(readFileSync('artifacts/idle-bastion/acceptance/onboarding/menu-guide/browser.json', 'utf8')).final.battle);
for (let i = 0; i < 12000 && !b.discoveryPaused; i++) b.update(.025);
b.meetWisp(); b.continueDiscovery();
const manual = IdleBattle.restore(b.snapshot()); manual.mara.autoCast = false; fixtures.manual = manual.snapshot();
for (let i = 0; i < 12000 && b.discovery !== 'mara-effect'; i++) b.update(.025);
assert.equal(b.discovery, 'mara-effect'); b.update(7.8); fixtures.effect = b.snapshot();
for (const f of Object.values(fixtures)) assert.ok(IdleBattle.restore(f));
const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
const results = [];
try {
  for (const [width, lang] of [[1280, 'de'], [390, 'en']]) {
    const context = await browser.newContext({ viewport: { width, height: 850 } });
    await context.addInitScript(lang => {
      localStorage.setItem('spire-language-v1', lang);
      localStorage.setItem('spire-audio-mix-v1', JSON.stringify({ music: 0, effects: 0, voices: .55, muted: false }));
      window.__voiceEvents = [];
      document.addEventListener('play', e => { if (e.target.dataset?.spireVoice === 'hero-command') window.__voiceEvents.push(e.target.currentSrc); }, true);
    }, lang);
    const page = await context.newPage(), errors = []; page.on('pageerror', e => errors.push(e.message));
    await page.route('**/src/battle-scene.ts*', async route => {
      const response = await route.fetch(), body = (await response.text()).replace(/super\(["']IdleBattle["']\);/, 'super("IdleBattle");window.__maraScene=this;');
      await route.fulfill({ response, body });
    });
    for (const [stage, snapshot] of Object.entries(fixtures)) {
      console.log(`Checking ${width}/${lang}/${stage}`);
      await page.goto('http://127.0.0.1:5235/tests/browser/tavern-session.html');
      const slot = await page.evaluate(async snapshot => {
        const { openBattleStore } = await import('/src/save-store.ts');
        const slot = `mara-early-${crypto.randomUUID()}`, store = await openBattleStore(undefined, `spire-idle-bastion-probe-${slot}`);
        try { await store.save(snapshot, true, 0); } finally { store.close(); } return slot;
      }, snapshot);
      await page.goto(`http://127.0.0.1:5235/?probe=${slot}`);
      await page.locator('#boot-screen').waitFor({ state: 'hidden', timeout: 60000 });
      if (await page.locator('#return-card').isVisible()) await page.locator('#claim-offline').click();
      const openMara = async () => {
        if (await page.locator('#settlement-tab').isVisible()) {
          await page.locator('#settlement-tab').click(); await page.locator('#pick-mara').click();
        } else {
          await page.evaluate(() => window.__maraScene.showHeroPosition(window.__maraScene.sim.mara));
          await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
          const point = await page.evaluate(() => { const s = window.__maraScene; return s.worldAnchor({ x: s.sim.mara.x, y: s.sim.mara.y - 18 }); });
          await page.mouse.click(point.x, point.y);
        }
      };
      await openMara();
      await page.locator('#mara-panel').waitFor({ state: 'visible' });
      await page.waitForFunction(() => window.__voiceEvents.length === 1);
      assert.equal(await page.locator('#mara-details').isVisible(), false);
      assert.equal(await page.locator('#move-mara').isVisible(), false);
      assert.equal(await page.locator('#mara-auto').isVisible(), false);
      assert.equal(await page.locator('#cast-mara').isVisible(), stage === 'manual');
      await openMara(); assert.equal(await page.evaluate(() => window.__voiceEvents.length), 1);
      const box = await page.locator('#context-panel').boundingBox(); assert.ok(box.height < 280);
      assert.ok(box.x >= 0 && box.x + box.width <= width + 1);
      const text = await page.locator('#mara-panel').innerText();
      if (stage === 'walking') {
        await page.screenshot({ path: fileURLToPath(new URL(`waiting-${width}.png`, root)) });
        const before = await page.evaluate(() => JSON.stringify(window.__maraScene.sim.mara));
        await page.reload(); await page.locator('#boot-screen').waitFor({ state: 'hidden', timeout: 60000 });
        if (await page.locator('#return-card').isVisible()) await page.locator('#claim-offline').click();
        assert.equal(await page.evaluate(() => JSON.stringify(window.__maraScene.sim.mara)), before);
        // Actual map hit, including a saved partly walked segment.
        await page.evaluate(() => window.__maraScene.showHeroPosition(window.__maraScene.sim.mara));
        await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
        const point = await page.evaluate(() => { const s = window.__maraScene; return s.worldAnchor({ x: s.sim.mara.x, y: s.sim.mara.y - 18 }); });
        await page.mouse.click(point.x, point.y); await page.locator('#mara-panel').waitFor({ state: 'visible' });
        await page.waitForFunction(() => window.__voiceEvents.length === 1);
      }
      if (stage === 'effect') {
        // The ordinary mobile context sheet covers the pause button.
        if (width < 700) await page.locator('#close-context').click();
        await page.locator('#pause').click();
        await page.waitForFunction(() => document.querySelector('#mara-panel').dataset.stage === 'ready');
        if (width < 700) await openMara();
        assert.equal(await page.locator('#move-mara').isVisible(), true);
        assert.equal(await page.locator('#move-mara').isEnabled(), true);
        assert.equal(await page.locator('#mara-details').evaluate(d => d.open), false);
        await page.locator('#mara-details summary').click(); assert.equal(await page.locator('#mara-details').evaluate(d => d.open), true);
        await page.locator('#mara-details summary').click();
        await page.screenshot({ path: fileURLToPath(new URL(`controls-${width}.png`, root)) });
        await page.locator('#move-mara').click();
        const target = await page.evaluate(() => { const s = window.__maraScene, cell = s.sim.layout.maraStart; return s.worldAnchor({ x: cell.x * 40 + 20, y: (cell.y + 1) * 40 + 20 }); });
        await page.mouse.click(target.x, target.y);
        await page.waitForFunction(() => window.__maraScene.sim.mara.path.length > 0 || window.__maraScene.sim.mara.y > 320);
      }
      results.push({ width, lang, stage, panelHeight: box.height, text, errors: [...errors] });
    }
    assert.deepEqual(errors, []); await context.close();
  }
  writeFileSync(new URL('browser-results.json', root), JSON.stringify(results, null, 2) + '\n');
  console.log(JSON.stringify(results));
} finally { await browser.close(); }
