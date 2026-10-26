import assert from 'node:assert/strict';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE);
const base = process.env.SPIRE_TEST_URL ?? 'http://127.0.0.1:5217';
const out = 'artifacts/idle-bastion/acceptance/runtime-fixes';
mkdirSync(out, { recursive: true });
const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
const only = process.env.SPIRE_TEST_HERO;
const report = only ? JSON.parse(readFileSync(`${out}/browser.json`, 'utf8')).filter(row => row.who !== only) : [];
try {
  for (const [who, width, lang] of [['mara', 1280, 'de'], ['ilyra', 390, 'en']]) {
    if (only && who !== only) continue;
    const context = await browser.newContext({ viewport: { width, height: 844 }, isMobile: width < 700, hasTouch: width < 700 });
    // Delay each RAF without changing its real timestamp. This exercises the
    // actual Phaser -> scene -> session path, including slow foreground frames.
    await context.addInitScript(() => {
      const raf = requestAnimationFrame.bind(window), cancel = cancelAnimationFrame.bind(window), tasks = new Map();
      let sequence = 0;
      window.__testFrameDelay = 0;
      window.requestAnimationFrame = callback => {
        const id = ++sequence, task = { timer: 0, frame: 0 }; tasks.set(id, task);
        task.timer = setTimeout(() => { task.frame = raf(time => { tasks.delete(id); callback(time); }); }, window.__testFrameDelay);
        return id;
      };
      window.cancelAnimationFrame = id => { const task = tasks.get(id); if (task) { clearTimeout(task.timer); cancel(task.frame); tasks.delete(id); } };
    });
    const page = await context.newPage(), errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(`${base}/tests/browser/tavern-session.html`);
    const slot = await page.evaluate(async ({ lang }) => {
      const { IdleBattle } = await import('/src/battle.ts');
      const { openBattleStore } = await import('/src/save-store.ts');
      const b = new IdleBattle(); b.update(4); b.gold = 12000; b.highestCleared = 25; b.bossVictories = b.secondBossVictories = 1;
      b.buildWorkshop(); b.researchFrost(); b.update(.025); b.wispArrival.met = true; b.discovery = 'off'; b.tutorial.hidden = true;
      if (!b.buildTavern(b.recommendedTavernPlot) || !b.upgradeTavern() || !b.recruitIlyra()) throw Error('Invalid tavern fixture');
      b.ilyra.introduction = 'done'; b.social.points.mara = b.social.points.ilyra = 35; b.social.gifts = 5;
      if (!IdleBattle.restore(b.snapshot())) throw Error('Invalid save');
      const slot = `runtime-fixes-${crypto.randomUUID()}`, store = await openBattleStore(undefined, `spire-idle-bastion-probe-${slot}`);
      await store.save(b.snapshot(), true, 0); store.close();
      localStorage.setItem('spire-language-v1', lang); return slot;
    }, { lang });
    const saved = () => page.evaluate(async slot => {
      const { openBattleStore } = await import('/src/save-store.ts');
      const store = await openBattleStore(undefined, `spire-idle-bastion-probe-${slot}`);
      try { const value = await store.load(); if (value.kind !== 'valid') throw Error(value.kind); return value.save; } finally { store.close(); }
    }, slot);
    await page.goto(`${base}/?probe=${slot}`);
    await page.waitForSelector('#game canvas');
    await page.locator('#claim-offline').click();
    await page.locator('#return-card').waitFor({ state: 'hidden' });
    await page.locator(width < 700 ? '#wave-summary' : '#open-progress').click();
    const bossCopy = await page.locator('.boss-record').innerText();
    assert.ok(bossCopy.includes(lang === 'de' ? 'unterbricht aber nicht den Zauber' : 'does not interrupt the spell'));
    await page.locator('#close-progress').click();
    await page.locator('#settlement-tab').click(); await page.locator('#pick-tavern').click();
    await page.locator(`[data-do="${who}"]`).click();
    const figure = page.locator('.tv-figure canvas');
    await page.waitForSelector('.tv-figure canvas[data-clip="variant"]', { timeout: 35000 });
    for (const selector of ['[data-action="talk"]', '[data-do="touch"]', '[data-action="gift"]', '[data-moment="1"]']) assert.equal(await page.locator(selector).isEnabled(), true, selector);
    const start = Date.now(); await page.locator('[data-action="talk"]').click();
    await page.waitForSelector('.tv-figure canvas[data-clip="head"]', { timeout: 2000 });
    const interruptMs = Date.now() - start;
    assert.equal((await saved()).battle.social.points[who], 43);
    await page.locator('[data-do="touch"]').click(); await page.locator('[data-region="hand"]').click();
    await page.waitForSelector('.tv-figure canvas[data-clip="touch"]', { timeout: 2000 });
    assert.equal((await saved()).battle.social.points[who], 47);
    await page.locator('.tv-back').click();
    await page.locator('[data-action="gift"]').evaluate(button => { button.click(); button.click(); });
    await page.waitForSelector('.tv-figure canvas[data-clip="joy"]', { timeout: 2000 });
    const afterGift = await saved();
    assert.equal(afterGift.battle.social.points[who], 59); assert.equal(afterGift.battle.social.gifts, 4);
    await page.locator('[data-moment="1"]').click();
    await page.locator('[data-do="story-next"]').click();
    assert.match(await page.locator('[data-text="story-step"]').innerText(), /2 \/ 3/);
    await page.screenshot({ path: `${out}/${who}-${width}.png` });
    assert.equal((await saved()).battle.social.points[who], 59);
    await page.locator('.tv-close').click();
    // Native save/reload keeps the single gift debit and both other rewards.
    await page.reload(); await page.waitForSelector('#game canvas'); await page.locator('#claim-offline').click();
    await page.locator('#return-card').waitFor({ state: 'hidden' });
    assert.equal((await saved()).battle.social.points[who], 59);
    assert.equal((await saved()).battle.social.gifts, 4);
    let timing;
    if (who === 'mara') {
      await page.evaluate(() => { window.__testFrameDelay = 480; });
      const before = await saved(), started = Date.now();
      await page.locator('#pause').click();
      await page.waitForTimeout(10000);
      await page.locator('#pause').click();
      await page.waitForFunction(async slot => {
        const { openBattleStore } = await import('/src/save-store.ts');
        const s = await openBattleStore(undefined, `spire-idle-bastion-probe-${slot}`);
        try { const result = await s.load(); return result.kind === 'valid' && result.save.paused; } finally { s.close(); }
      }, slot);
      const after = await saved(), realSeconds = (Date.now() - started) / 1000;
      timing = { realSeconds, simulationSeconds: after.battle.elapsed - before.battle.elapsed, frameDelayMs: 480 };
      assert.ok(Math.abs(timing.simulationSeconds - timing.realSeconds) < .8, JSON.stringify(timing));
      assert.equal(await page.locator('#return-card').isVisible(), false);
    }
    assert.deepEqual(errors, []);
    report.push({ who, width, lang, autoVariantInterrupted: true, interruptMs, manualReactionInterrupted: true, storySkipped: true, duplicateGiftRejected: true, reloadExact: true, timing, errors });
    console.log(JSON.stringify(report.at(-1))); await context.close();
  }
} finally { await browser.close(); writeFileSync(`${out}/browser.json`, JSON.stringify(report, null, 2)); }
