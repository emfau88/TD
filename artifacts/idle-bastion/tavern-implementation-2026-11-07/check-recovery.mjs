import { chromium } from 'file:///C:/Users/madde/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
import assert from 'node:assert/strict';
import { writeFile } from 'node:fs/promises';

const results = { checks: [], errors: [] };
const browser = await chromium.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: true, args: ['--disable-gpu'],
});

async function fixture(handleMedia) {
  const page = await browser.newPage({ viewport: { width: 640, height: 800 } });
  page.on('pageerror', error => results.errors.push(error.message));
  await page.route('**/__tavern-recovery__', route => route.fulfill({
    contentType: 'text/html', body: '<!doctype html><html><body></body></html>',
  }));
  await page.route('**/tavern-video/mara/*.mp4*', route => {
    // Vite URL-import wrappers are scripts, not the media download under test.
    if (route.request().resourceType() !== 'media') return route.continue();
    return handleMedia(route, new URL(route.request().url()).pathname);
  });
  await page.goto('http://127.0.0.1:5277/__tavern-recovery__');
  await page.evaluate(async () => {
    const { TavernVideoPlayer } = await import('/src/tavern-video.ts');
    const stage = document.createElement('div'); stage.className = 'tv-stage';
    const canvas = document.createElement('canvas'); stage.append(canvas); document.body.append(stage);
    window.recovery = { player: new TavernVideoPlayer(canvas, () => {}), canvas };
    window.recovery.player.setHearts(5);
    await window.recovery.player.start('mara');
  });
  await page.waitForFunction(() => window.recovery.player.ready && window.recovery.canvas.dataset.clip === 'idle');
  return page;
}

try {
  let rejectPreparation = true;
  const requests = { head: 0, touch: 0 };
  let page = await fixture((route, path) => {
    const key = path.endsWith('/head.mp4') ? 'head' : path.endsWith('/touch.mp4') ? 'touch' : null;
    if (key) {
      requests[key]++;
      if (rejectPreparation) return route.abort('failed');
    }
    return route.continue();
  });
  const first = await page.evaluate(() => window.recovery.player.prepareReactions());
  assert.equal(first, false, 'A failed preload must report failure.');
  assert.equal(await page.locator('canvas').getAttribute('data-reaction-error'), 'true');
  rejectPreparation = false;
  const second = await page.evaluate(() => window.recovery.player.prepareReactions());
  assert.equal(second, true, 'The next preparation must retry failed entries and succeed.');
  assert.equal(await page.locator('canvas').getAttribute('data-reaction-error'), null);
  assert.ok(requests.head >= 2 && requests.touch >= 2, JSON.stringify(requests));
  await page.evaluate(() => window.recovery.player.play('shoulder'));
  await page.waitForFunction(() => window.recovery.canvas.dataset.clip === 'touch' && Number(window.recovery.canvas.dataset.frame) >= 4);
  results.checks.push({ name: 'failed preparation retries head and touch', passed: true, first, second, requests });
  console.log('PASS: failed head/touch preparation retries both downloads.');
  await page.evaluate(() => window.recovery.player.stop()); await page.close();

  let delayedHead = false;
  page = await fixture(async (route, path) => {
    if (path.endsWith('/head.mp4')) {
      delayedHead = true;
      await new Promise(resolve => setTimeout(resolve, 5200));
      return route.abort('failed');
    }
    return route.continue();
  });
  await page.evaluate(() => window.recovery.player.gesture('giggle'));
  await page.waitForFunction(() => window.recovery.canvas.dataset.clip === 'giggle' && Number(window.recovery.canvas.dataset.frame) >= 6);
  await page.evaluate(() => window.recovery.player.act('talk'));
  await page.waitForFunction(() => window.recovery.player.current?.video.ended && window.recovery.player.pending === 'head', { timeout: 8000 });
  const holding = await page.evaluate(() => ({
    clip: window.recovery.canvas.dataset.clip,
    pending: window.recovery.player.pending,
    ended: window.recovery.player.current.video.ended,
  }));
  assert.deepEqual(holding, { clip: 'giggle', pending: 'head', ended: true });
  await page.waitForFunction(() => window.recovery.canvas.dataset.clip === 'idle' && window.recovery.canvas.dataset.reactionError === 'true', { timeout: 8000 });
  await page.waitForTimeout(150);
  const recovered = await page.evaluate(() => ({
    clip: window.recovery.canvas.dataset.clip,
    error: window.recovery.canvas.dataset.reactionError,
    pending: window.recovery.player.pending,
    loading: window.recovery.player.loadingReactions,
  }));
  assert.deepEqual(recovered, { clip: 'idle', error: 'true', pending: null, loading: false });
  assert.equal(delayedHead, true);
  results.checks.push({ name: 'ended reaction returns to idle after pending download fails', passed: true, holding, recovered });
  console.log('PASS: failed delayed request returns ended reaction to idle and preserves error.');
  await page.evaluate(() => window.recovery.player.stop()); await page.close();
  assert.deepEqual(results.errors, []);
  results.passed = true;
} catch (error) {
  results.passed = false; results.failure = error.stack || String(error);
  console.error(results.failure); process.exitCode = 1;
} finally {
  await browser.close();
  await writeFile(new URL('./recovery-results.json', import.meta.url), JSON.stringify(results, null, 2) + '\n');
}
