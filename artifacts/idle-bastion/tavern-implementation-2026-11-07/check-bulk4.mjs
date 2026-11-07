import { chromium } from 'file:///C:/Users/madde/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
const out = new URL('./bulk4-ui/', import.meta.url); await mkdir(out, { recursive: true });
const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true, args: ['--disable-gpu'] });
const results = [];
const ready = page => page.waitForFunction(() => window.tavernReview?.ui.animation.ready && !window.tavernReview.ui.pending && !window.tavernReview.session.inputBusy);
const speak = async page => { await page.click('[data-do=speak]'); await page.click('[data-action=talk]'); await ready(page); };
const record = page => page.evaluate(() => {
  const f = window.tavernReview, s = f.session.battle.social, who = f.ui.selected;
  return { records: structuredClone(s.encounters[who]), points: s.points[who], gifts: s.gifts, personal: structuredClone(s.personal[who]), reserves: structuredClone(s.reserves[who]), topic: f.ui.encounter?.id, phase: f.ui.encounter?.phase };
});
try {
  for (const width of [1280, 320]) for (const language of ['de', 'en']) for (const who of ['mara', 'ilyra']) {
    const page = await browser.newPage({ viewport: { width, height: 844 } }), errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.goto(`http://127.0.0.1:5277/tavern-rig-check.html?artwork=video&hero=${who}`);
    await ready(page); await page.selectOption('#review-language', language);
    await page.evaluate(async ({ who }) => {
      const { createEncounterState } = await import('/src/tavern-encounter-state.ts');
      const f = window.tavernReview, s = f.session.battle.social;
      s.encounters = createEncounterState(); s.points[who] = 47;
      s.personal[who] = { clears: 9, claimed: false }; s.reserves[who] = { talk: 3, touch: 3, clears: 0 }; f.ui.update();
    }, { who });
    assert.equal(await page.locator('[data-do=speak]').getAttribute('data-new'), 'false');
    await page.evaluate(({ who }) => { const f = window.tavernReview; f.session.battle.social.personal[who].clears = 10; f.ui.update(); }, { who });
    assert.equal(await page.locator('[data-do=speak]').getAttribute('data-new'), 'true');
    const before = await record(page);
    await speak(page);
    assert.equal(await page.locator('.tv-replies').isVisible(), true);
    assert.equal(await page.locator('[data-answer]').count(), 2);
    const bounds = await page.evaluate(() => {
      const r = document.querySelector('.tv-stage').getBoundingClientRect();
      const c = document.querySelector('.tv-conversation').getBoundingClientRect();
      return { horizontalOverflow: document.documentElement.scrollWidth > innerWidth, stageHeight: r.height, threeActions: document.querySelectorAll('.tv-actions > button').length,
        answersVisible: [...document.querySelectorAll('[data-answer]')].every(b => { const a = b.getBoundingClientRect(); return a.top >= c.top && a.bottom <= c.bottom; }) };
    });
    assert.equal(bounds.horizontalOverflow, false); assert.equal(bounds.threeActions, 3); assert.ok(bounds.stageHeight >= 210);
    assert.equal(bounds.answersVisible, true, `${who}/${language}/${width}: both answers visible`);
    await page.locator('#tavern-dialog').screenshot({ path: fileURLToPath(new URL(`${who}-${language}-${width}-choice.png`, out)) });
    // Save rejection must not show or remember an uncommitted answer.
    if (width === 1280 && language === 'de') {
      await page.evaluate(() => { const f = window.tavernReview; window.realEncounterCommand = f.session.command; f.session.command = async () => false; });
      await page.click('[data-answer=first]'); await ready(page);
      assert.equal((await record(page)).records.first.choice, null); assert.equal((await record(page)).phase, 'opening');
      await page.evaluate(() => { window.tavernReview.session.command = window.realEncounterCommand; });
    }
    const choice = width === 320 ? null : language === 'de' ? 'first' : 'second';
    if (choice) {
      // Two immediate taps must save one immutable answer.
      await page.evaluate(choice => { const b = document.querySelector(`[data-answer=${choice}]`); b.click(); b.click(); }, choice);
    } else await page.click('[data-do=story-next]');
    await page.waitForFunction(() => window.tavernReview.ui.encounter?.phase === 'reply'); await ready(page);
    assert.equal((await record(page)).records.first.choice, choice);
    if (choice) {
      await page.evaluate(({ who }) => { const f = window.tavernReview; f.ui.close(); f.ui.open(); f.ui.dialog.querySelector(`[data-do=${who}]`).click(); }, { who });
      await ready(page); await speak(page);
      assert.equal((await record(page)).phase, 'reply'); assert.equal(await page.locator('.tv-replies').isVisible(), false);
    }
    await page.click('[data-do=story-next]'); await ready(page);
    assert.equal((await record(page)).records.first.completed, true);
    assert.equal((await record(page)).topic, undefined);
    // Advancing straight to 30 wins preserves the second topic and does not gate the gift.
    await page.evaluate(({ who }) => { const f = window.tavernReview; f.session.battle.social.personal[who].clears = 30; f.ui.update(); }, { who });
    await speak(page);
    assert.equal((await record(page)).topic, 'second');
    const recollection = await page.locator('[data-text=line]').textContent();
    if (who === 'ilyra' && choice === 'first') assert.match(recollection, /Abendlicht|Evening Light/);
    if (choice === null) assert.doesNotMatch(recollection, /Du hast gefragt|hast du gesagt|Deinen Namen|You asked|you said|your name for/);
    assert.equal(await page.locator('.tv-replies').isVisible(), false);
    await page.click('[data-do=story-next]'); assert.equal(await page.locator('.tv-replies').isVisible(), true);
    // Language can change at the choice without restarting or losing the branch.
    await page.selectOption('#review-language', language === 'de' ? 'en' : 'de');
    assert.equal((await record(page)).records.first.choice, choice);
    await page.selectOption('#review-language', language);
    await page.click('[data-answer=second]'); await ready(page);
    await page.click('[data-do=story-next]'); await ready(page);
    const after = await record(page);
    assert.equal(after.records.second.choice, 'second'); assert.equal(after.records.second.completed, true);
    assert.equal(after.points, before.points); assert.equal(after.gifts, before.gifts); assert.deepEqual(after.reserves, before.reserves);
    assert.equal(await page.locator('.tv-actions').isVisible(), true);
    assert.equal(await page.locator('[data-do=speak]').getAttribute('data-new'), 'false');
    // The personal gift retains its original rules and has a concrete character line.
    await page.evaluate(({ who }) => { const f = window.tavernReview; f.session.battle.social.points[who] = 58; f.ui.update(); }, { who });
    await page.click('[data-action=gift]'); await ready(page);
    assert.equal((await record(page)).points, 70); assert.equal((await record(page)).gifts, before.gifts);
    const giftLine = await page.locator('[data-text=line]').textContent();
    assert.match(giftLine, who === 'mara' ? /Messingzahnrad|brass cog/ : /Sternanhänger|star pendant/);
    assert.deepEqual(errors, []);
    results.push({ who, language, width, firstChoice: choice, before, after, bounds, recollection, giftLine, errors }); await page.close();
  }
  // All topics may remain unread when the player takes the earned third heart.
  const page = await browser.newPage(); await page.goto('http://127.0.0.1:5277/tavern-rig-check.html?artwork=video'); await ready(page);
  await page.evaluate(async () => {
    const { createEncounterState } = await import('/src/tavern-encounter-state.ts');
    const f = window.tavernReview, s = f.session.battle.social; s.encounters = createEncounterState(); s.points.mara = 58; s.personal.mara = { clears: 30, claimed: false }; f.ui.update();
  });
  await page.click('[data-action=gift]'); await ready(page);
  const skipped = await record(page); assert.equal(skipped.points, 70); assert.equal(skipped.records.first.seen, false); assert.equal(skipped.records.second.seen, false);
  await speak(page); assert.equal((await record(page)).topic, 'first'); await page.close();
  await writeFile(new URL('results.json', out), JSON.stringify({ cases: results, skippedAllStillEarnedHeartThree: true }, null, 2));
  console.log(JSON.stringify({ cases: results.length, saveRejection: 2, doubleTapAndResume: 4, neutralBranch: 4, errors: 0 }));
} finally { await browser.close(); }
