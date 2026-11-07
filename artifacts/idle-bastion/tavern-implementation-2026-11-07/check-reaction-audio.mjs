import { chromium } from 'file:///C:/Users/madde/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
import assert from 'node:assert/strict';
import { writeFile } from 'node:fs/promises';

const results = [];
const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true, args: ['--disable-gpu'] });
try {
  for (const who of ['mara', 'ilyra']) for (const language of ['de', 'en']) {
    const page = await browser.newPage({ viewport: { width: 1280, height: 844 } });
    // Concurrent documentation/starter work must not reload this audio transaction test.
    await page.routeWebSocket('**/*', socket => socket.close());
    const errors = []; page.on('pageerror', e => errors.push(e.message));
    await page.goto(`http://127.0.0.1:5277/tavern-rig-check.html?hero=${who}&artwork=video&sound=1`);
    await page.waitForFunction(() => window.tavernReview && document.querySelector('.tv-figure canvas')?.dataset.clip === 'idle');
    await page.selectOption('#review-language', language);
    await page.selectOption('#review-hearts', '5');
    await page.evaluate(() => {
      window.voiceStarts = [];
      document.addEventListener('play', event => {
        const a = event.target;
        if (a instanceof HTMLAudioElement && a.dataset.spireVoice) window.voiceStarts.push({ who: a.dataset.spireVoice, src: a.currentSrc || a.src, time: performance.now() });
      }, true);
    });
    const d = page.locator('#tavern-dialog');
    const voice = `audio[data-spire-voice="${who}"]`;
    const starts = () => page.evaluate(who => window.voiceStarts.filter(e => e.who === who), who);
    async function playing() {
      await page.waitForFunction(who => { const a = document.querySelector(`audio[data-spire-voice="${who}"]`); return a && !a.paused && a.currentTime > .03; }, who, { timeout: 12000 });
      const audio = await page.locator(voice).evaluate(a => ({ src: a.currentSrc, time: a.currentTime }));
      assert.ok(audio.src.includes(`/assets/${who}-voice/`), audio.src);
      return audio;
    }
    async function gesture(key) { await d.locator('[data-do=speak]').click(); await d.locator(`[data-gesture=${key}]`).click(); }
    await gesture('giggle');
    const first = await playing();
    assert.equal((await starts()).length, 1);
    await gesture('hip');
    await page.waitForTimeout(120);
    assert.equal((await starts()).length, 1, 'A fast gesture must not overlap or restart the current voice.');
    await page.waitForFunction(who => { const a = document.querySelector(`audio[data-spire-voice="${who}"]`), s = window.voiceStarts.filter(e => e.who === who); return a?.paused && performance.now() - s.at(-1).time > 2600; }, who, { timeout: 12000 });
    await d.locator('[data-region=hand]').click();
    const second = await playing();
    assert.notEqual(second.src, first.src, 'The next random clip must not immediately repeat.');
    assert.equal((await starts()).length, 2);
    const volume = await page.evaluate(() => window.tavernReview.audio.mix.voices);
    await page.evaluate(() => window.tavernReview.audio.setMix({ voices: 0 }));
    await page.waitForFunction(() => [...document.querySelectorAll('audio[data-spire-voice]')].every(a => a.paused));
    await gesture('giggle'); await page.waitForTimeout(100);
    assert.equal((await starts()).length, 2, 'Voice slider zero must suppress new requests.');
    await page.evaluate(volume => window.tavernReview.audio.setMix({ voices: volume }), volume);
    await page.waitForFunction(who => performance.now() - window.voiceStarts.filter(e => e.who === who).at(-1).time > 2600, who);
    // Open one new playful answer without granting points or inventing a previous choice.
    await page.evaluate(who => {
      const f = window.tavernReview, s = f.session.battle.social;
      s.points[who] = 35; s.personal[who] = { clears: 20, claimed: false };
      s.encounters[who] = { first: { seen: false, choice: null, completed: false }, second: { seen: false, choice: null, completed: false } };
      if (who === 'ilyra') s.encounters[who].first = { seen: true, choice: null, completed: true };
      f.ui.update();
    }, who);
    await d.locator('[data-do=speak]').click(); await d.locator('[data-action=talk]').click();
    await d.locator('.tv-story-heading').waitFor({ state: 'visible' });
    if (who === 'ilyra') await d.locator('[data-do=story-next]').click();
    await d.locator('[data-answer=second]').waitFor({ state: 'visible' });
    assert.equal((await starts()).length, 2, 'Opening and ordinary Next must not play a random voice.');
    await page.evaluate(() => {
      const f = window.tavernReview; window.originalVoiceCommand = f.session.command;
      f.session.command = async () => false;
    });
    await d.locator('[data-answer=second]').click();
    await page.waitForFunction(() => !window.tavernReview.ui.pending);
    assert.equal((await starts()).length, 2, 'Rejected save must not emit a voice.');
    assert.equal(await page.evaluate(() => window.tavernReview.ui.encounter.phase), 'opening');
    assert.equal(await page.evaluate(who => window.tavernReview.session.battle.social.encounters[who][who === 'mara' ? 'first' : 'second'].choice, who), null);
    await page.evaluate(() => { window.tavernReview.session.command = window.originalVoiceCommand; });
    await page.evaluate(() => {
      const f = window.tavernReview; window.realCommand = f.session.command.bind(f.session);
      f.session.command = (fn, wait) => new Promise(resolve => { window.releaseVoiceSave = async () => resolve(await window.realCommand(fn, wait)); });
    });
    await d.locator('[data-answer=second]').click();
    await page.waitForTimeout(130);
    assert.equal((await starts()).length, 2, 'No voice before durable choice success.');
    await page.evaluate(async () => { await window.releaseVoiceSave(); window.tavernReview.session.command = window.realCommand; });
    const answer = await playing();
    assert.equal((await starts()).length, 3);
    const committed = await page.evaluate(who => window.tavernReview.session.battle.social.encounters[who][who === 'mara' ? 'first' : 'second'].choice, who);
    assert.equal(committed, 'second');
    await page.evaluate(() => window.tavernReview.ui.close());
    await page.waitForFunction(() => [...document.querySelectorAll('audio[data-spire-voice]')].every(a => a.paused));
    const countBeforeResume = (await starts()).length;
    await page.evaluate(who => {
      const ui = window.tavernReview.ui; ui.open(); ui.dialog.querySelector(`[data-do=${who}]`).click();
    }, who);
    await page.waitForFunction(() => document.querySelector('.tv-figure canvas')?.dataset.clip === 'idle');
    await d.locator('[data-do=speak]').click(); await d.locator('[data-action=talk]').click();
    await page.waitForFunction(() => window.tavernReview.ui.encounter?.phase === 'reply');
    assert.equal((await starts()).length, countBeforeResume, 'Resuming a saved reply must not repeat its voice.');
    await d.locator('[data-do=story-next]').click();
    assert.equal((await starts()).length, countBeforeResume, 'Ending and replaying text are not voice events.');
    if (language === 'de') {
      await page.waitForFunction(who => performance.now() - window.voiceStarts.filter(e => e.who === who).at(-1).time > 2600, who);
      await gesture('giggle'); await playing();
      const beforeMute = (await starts()).length;
      await page.evaluate(() => window.tavernReview.audio.setMix({ muted: true }));
      await page.waitForFunction(() => [...document.querySelectorAll('audio[data-spire-voice]')].every(a => a.paused));
      await gesture('hip'); await page.waitForTimeout(100);
      assert.equal((await starts()).length, beforeMute, 'Global mute must stop and suppress voices.');
      await page.evaluate(() => window.tavernReview.audio.setMix({ muted: false }));
      await page.waitForFunction(who => performance.now() - window.voiceStarts.filter(e => e.who === who).at(-1).time > 2600, who);
      await gesture('giggle'); await playing();
      const beforeSwitch = (await starts()).length;
      await d.locator('[data-do=back]').click();
      await page.waitForFunction(() => [...document.querySelectorAll('audio[data-spire-voice]')].every(a => a.paused));
      const other = who === 'mara' ? 'ilyra' : 'mara';
      await d.locator(`[data-do=${other}]`).click();
      await page.waitForTimeout(180);
      assert.equal((await starts()).length, beforeSwitch, 'Selecting another character must not replay a previous voice.');
      assert.equal(await page.locator(voice).evaluate(a => a.paused), true);
    }
    assert.deepEqual(errors, []);
    results.push({ who, language, first: first.src, nextHand: second.src, playfulAnswer: answer.src,
      randomWithoutImmediateRepeat: true, noOverlapOrRestart: true, sliderZeroStops: true,
      answerOnlyAfterSave: true, rejectedSaveSilent: true, savedAnswerDoesNotReplayVoice: true, stopsOnClose: true,
      ...(language === 'de' ? { globalMuteStops: true, characterSwitchStopsWithoutReplay: true } : {}), errors });
    console.log(`PASS ${who}/${language}: native gesture, hand, saved playful answer, random/overlap/volume/close.`);
    await page.close();
  }
} catch (error) {
  results.push({ failed: true, error: error.stack || String(error) }); process.exitCode = 1; console.error(error);
} finally {
  await browser.close();
  await writeFile(new URL('./reaction-audio-results.json', import.meta.url), JSON.stringify(results, null, 2) + '\n');
}
