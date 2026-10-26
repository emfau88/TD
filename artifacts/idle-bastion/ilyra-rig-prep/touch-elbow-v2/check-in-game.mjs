import { chromium } from 'file:///C:/Users/madde/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
import { writeFile } from 'node:fs/promises';

const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
const results = [];
try {
  for (const width of [1280, 390]) {
    const context = await browser.newContext({ viewport: { width, height: width === 390 ? 844 : 850 } });
    const page = await context.newPage(), errors = [], failed = [];
    page.on('pageerror', e => errors.push(e.message));
    page.on('requestfailed', r => { if (r.url().includes('.webp')) failed.push(r.url()); });
    await page.goto('http://127.0.0.1:5235/tests/browser/tavern-session.html');
    await page.locator('#ilyra').click();
    await page.locator('#result a').waitFor();
    const url = new URL(await page.locator('#result a').getAttribute('href'), page.url()), slot = url.searchParams.get('probe');
    await page.evaluate(async slot => {
      const { openBattleStore } = await import('/src/save-store.ts');
      const store = await openBattleStore(undefined, `spire-idle-bastion-probe-${slot}`);
      try {
        const result = await store.load();
        if (result.kind !== 'valid') throw Error('Fixture invalid');
        result.save.battle.social.points.ilyra = 35;
        await store.save(result.save.battle, true, result.save.revision, { offline: result.save.offline });
      } finally { store.close(); }
    }, slot);
    await page.goto(url.href);
    await page.locator('#boot-screen').waitFor({ state: 'hidden', timeout: 60000 });
    if (await page.locator('#return-card').isVisible()) await page.locator('#claim-offline').click();
    await page.locator('#settlement-tab').click();
    await page.locator('#pick-tavern').click();
    await page.locator('[data-do="ilyra"]').click();
    await page.locator('[data-do="touch"]').click();
    await page.locator('[data-region="shoulder"]').click();
    await page.waitForFunction(() => {
      const c = document.querySelector('.tv-figure canvas');
      return c?.dataset.clip === 'touch' && Number(c.dataset.frame) >= 26 && Number(c.dataset.frame) <= 32;
    });
    const rendered = await page.evaluate(async () => {
      const c = document.querySelector('.tv-figure canvas'), n = Number(c.dataset.frame);
      const actual = c.getContext('2d').getImageData(0, 0, 480, 700).data;
      const image = new Image();
      image.src = `/assets/tavern-rig/ilyra/touch/${String(Math.floor(n / 8)).padStart(2, '0')}.webp`;
      await image.decode();
      const expected = document.createElement('canvas'); expected.width = 480; expected.height = 700;
      const ctx = expected.getContext('2d');
      ctx.drawImage(image, n % 4 * 480, Math.floor(n % 8 / 4) * 700, 480, 700, 0, 0, 480, 700);
      const reference = ctx.getImageData(0, 0, 480, 700).data;
      let differingChannels = 0;
      for (let i = 0; i < actual.length; i++) if (actual[i] !== reference[i]) differingChannels++;
      return { frame: n, differingChannels };
    });
    if (rendered.differingChannels) throw Error('Rendered I03 differs from approved asset');
    await page.screenshot({ path: new URL(`preview/in-game-${width}.png`, import.meta.url).pathname.replace(/^\/C:/, 'C:'), fullPage: true });
    await page.waitForFunction(() => document.querySelector('.tv-figure canvas')?.dataset.clip === 'idle');
    await page.locator('[data-region="hand"]').click();
    await page.waitForFunction(() => document.querySelector('.tv-figure canvas')?.dataset.clip === 'touch');
    await page.locator('[data-action="talk"]').click();
    await page.waitForFunction(() => document.querySelector('.tv-figure canvas')?.dataset.clip === 'head');
    results.push({ width, shoulderStartsI03: true, handStartsI03: true, returnsToIdle: true, newActionInterrupts: true, rendered, errors, failed });
    await context.close();
  }
  await writeFile(new URL('in-game-checks.json', import.meta.url), JSON.stringify(results, null, 2));
  console.log(JSON.stringify(results));
} finally { await browser.close(); }
