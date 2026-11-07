import { chromium } from 'file:///C:/Users/madde/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';
const base = process.env.TAVERN_TEST_URL || 'http://127.0.0.1:5278/';
const out = new URL(process.env.TAVERN_REMOTE ? './public/' : './local/', import.meta.url);
await mkdir(out, { recursive: true });
const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true, args: ['--disable-gpu'] });
const results = [];
try {
  for (const [who, language, paused, viewport] of [
    ['mara', 'de', true, { width: 1280, height: 844 }],
    ['ilyra', 'en', false, { width: 390, height: 844 }],
  ]) {
    const page = await browser.newPage({ viewport, isMobile: !paused, hasTouch: !paused });
    const errors = []; page.on('pageerror', e => errors.push(e.message));
    await page.goto(new URL('tavern-test.html', base).href);
    await page.selectOption('#preset', 'heart3'); await page.selectOption('#companion', who);
    await page.selectOption('#language', language); await page.click('#start');
    await page.waitForFunction(() => document.querySelector('#boot-screen')?.hidden === true);
    if (await page.locator('#claim-offline').isVisible()) await page.click('#claim-offline');
    const ready = () => page.waitForFunction(() => document.querySelector('#tavern-dialog')?.open && !document.querySelector('[data-do=speak]').disabled);
    await ready();
    if (!paused) {
      await page.click('.tv-close'); await page.click('#pause'); await page.click('#settlement-tab');
      await page.click('#pick-tavern'); await page.click(`[data-do=${who}]`); await ready();
    }
    await page.click('[data-moment="2"]'); await page.click('[data-do=story-next]');
    const line = await page.locator('[data-text=line]').textContent();
    await page.evaluate(() => {
      window.readSave = async (key = 'default') => {
        const name = 'spire-tavern-preview-v1-' + new URL(location.href).searchParams.get('probe');
        const db = await new Promise((resolve, reject) => { const r = indexedDB.open(name); r.onsuccess = () => resolve(r.result); r.onerror = () => reject(r.error); });
        try { return await new Promise((resolve, reject) => { const r = db.transaction('saves').objectStore('saves').get(key); r.onsuccess = () => resolve(r.result); r.onerror = () => reject(r.error); }); }
        finally { db.close(); }
      };
      // Exercise the real visibility lifecycle and save/reopen path without
      // minimizing the user's own window. This is lifecycle emulation.
      Object.defineProperty(document, 'hidden', { configurable: true, value: true });
      Object.defineProperty(document, 'visibilityState', { configurable: true, value: 'hidden' });
      document.dispatchEvent(new Event('visibilitychange'));
    });
    await page.waitForFunction(async () => !(await window.readSave('writer')));
    const before = await page.evaluate(() => window.readSave());
    assert.equal(before.paused, paused);
    await page.evaluate(() => {
      const returnedAt = Date.now() + 60000; Date.now = () => returnedAt;
      delete document.hidden; delete document.visibilityState;
      document.dispatchEvent(new Event('visibilitychange'));
    });
    await page.locator('[data-do=resume-visit]').waitFor({ state: 'visible' });
    await page.waitForFunction(() => document.querySelector('#boot-screen')?.hidden === true);
    assert.equal(await page.locator('[data-text=line]').textContent(), line);
    assert.equal(await page.locator('.tv-figure canvas').getAttribute('data-reaction-error'), null, 'normal hide/play cancellation is not a media error');
    const waiting = await page.evaluate(() => window.readSave());
    const reward = waiting.offline.pendingReward?.amountUnits ?? 0;
    if (!paused) assert.ok(reward > 0, 'unpaused absence must exercise actual gold credit');
    await page.screenshot({ path: fileURLToPath(new URL(`${who}-resume.png`, out)) });
    await page.evaluate(() => { const b = document.querySelector('[data-do=resume-visit]'); b.click(); b.click(); });
    await page.locator('.tv-error').waitFor({ state: 'hidden' });
    const after = await page.evaluate(() => window.readSave());
    const units = save => save.battle.gold * 1000 + (save.battle.goldRemainderUnits ?? 0);
    assert.equal(units(after) - units(before), reward, 'credit exactly once');
    assert.equal(after.battle.earned - before.battle.earned, after.battle.gold - before.battle.gold, 'earned total includes the same credited gold');
    assert.equal(after.paused, paused);
    assert.equal(after.offline.pendingReward, null);
    // Reopening already recertifies the NEXT farm target in BattleSession.
    // That existing policy may change farmWave; actual combat must not advance.
    const combat = save => { const copy = structuredClone(save.battle); delete copy.gold; delete copy.goldRemainderUnits; delete copy.earned; delete copy.farmWave; return copy; };
    assert.deepEqual(combat(after), combat(before), 'no combat advance or relationship changes while returning');
    assert.equal(await page.locator('[data-text=line]').textContent(), line);
    await page.click('[data-do=story-exit]'); await ready();
    await page.click('[data-region=shoulder]');
    await page.waitForFunction(() => document.querySelector('.tv-figure canvas')?.dataset.clip === 'touch');
    assert.deepEqual(errors, []);
    results.push({ who, language, viewport, paused, rewardUnits: reward, resumeWithoutLeaving: true, momentPreserved: true, combatFrozen: true, doubleClickCreditsOnce: true, interactionAfterReturn: true });
    console.log(`${who}/${language}: visit resume, story, pause and ${reward} gold units passed`);
    await page.close();
  }
  await writeFile(new URL('resume-results.json', out), JSON.stringify({ base, lifecycleEmulated: true, passed: true, cases: results }, null, 2));
} finally { await browser.close(); }
