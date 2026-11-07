import { chromium } from 'file:///C:/Users/madde/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
const base = process.env.TAVERN_MAIN_URL || 'http://127.0.0.1:5281/';
const out = new URL('./production/', import.meta.url);
await mkdir(out, { recursive: true });
const fixture = JSON.parse(await readFile(new URL('../tavern-targets-2026-11-07/main-save.json', import.meta.url), 'utf8'));
fixture.battle.social.points = { mara: 110, ilyra: 110 };
const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true, args: ['--disable-gpu'] });
const results = [];
try {
  for (const [language, viewport, touch] of [['de', { width: 1280, height: 844 }, false], ['en', { width: 390, height: 844 }, true]]) {
    const page = await browser.newPage({ viewport, isMobile: touch, hasTouch: touch });
    const errors = []; page.on('pageerror', e => errors.push(e.message));
    await page.goto(base);
    const probe = 'tavern-main-' + crypto.randomUUID();
    await page.evaluate(async ({ probe, fixture, language }) => {
      localStorage.setItem('spire-language-v1', language);
      const db = await new Promise((resolve, reject) => {
        const r = indexedDB.open('spire-idle-bastion-probe-' + probe, 1);
        r.onupgradeneeded = () => r.result.createObjectStore('saves');
        r.onsuccess = () => resolve(r.result); r.onerror = () => reject(r.error);
      });
      try { await new Promise((resolve, reject) => { const t = db.transaction('saves', 'readwrite'); t.objectStore('saves').put(fixture, 'default'); t.oncomplete = resolve; t.onerror = () => reject(t.error); }); }
      finally { db.close(); }
    }, { probe, fixture, language });
    const url = new URL(base); url.searchParams.set('probe', probe);
    await page.goto(url.href);
    const enter = async () => {
      await page.waitForFunction(() => document.querySelector('#boot-screen')?.hidden === true);
      if (await page.locator('#claim-offline').isVisible()) await page.click('#claim-offline');
      await page.click('#settlement-tab'); await page.click('#pick-tavern');
    };
    await enter();
    for (const who of ['mara', 'ilyra']) {
      await page.click(`[data-do=${who}]`);
      const ready = () => page.waitForFunction(() => document.querySelector('.tv-figure canvas')?.dataset.clip === 'idle' && !document.querySelector('[data-do=speak]').disabled);
      await ready();
      assert.equal(await page.locator('.tv-heart-buttons .unlocked').count(), 4);
      assert.equal(await page.locator('.tv-hotspot span').first().evaluate(e => getComputedStyle(e, '::after').fontSize), touch ? '24px' : '48px');
      await page.click('[data-region=hand]');
      await page.waitForFunction(() => document.querySelector('.tv-figure canvas')?.dataset.clip === 'hand'); await ready();
      if (who === 'mara') {
        await page.click('[data-do=speak]'); await page.click('[data-do=switch-location]');
        await page.waitForFunction(()=>document.querySelector('.tv-stage')?.dataset.videoScene==='mara-counter');await ready();
        assert.equal(await page.locator('[data-do=switch-location]').textContent(),language==='de'?'Wieder an unseren Platz':'Back to our spot');
        await page.click('[data-region=shoulder]');await page.waitForFunction(()=>document.querySelector('.tv-figure canvas').dataset.clip==='shoulder');await ready();
        await page.click('[data-do=speak]');await page.click('[data-gesture=hip]');
        await page.waitForFunction(()=>document.querySelector('.tv-figure canvas').dataset.clip==='approach');await ready();
        await page.click('[data-do=speak]');await page.click('[data-do=switch-location]');
        await page.waitForFunction(()=>!document.querySelector('.tv-stage').dataset.videoScene);await ready();
      }
      if (who === 'ilyra') {
        const initial = await page.locator('.tv-stage').boundingBox();
        await page.click('[data-do=speak]'); await page.click('[data-gesture=hip]');
        await page.waitForFunction(() => document.querySelector('.tv-figure canvas')?.dataset.clip === 'hip');
        await ready(); assert.deepEqual(await page.locator('.tv-stage').boundingBox(), initial);
      }
      await page.click('[data-do=back]');
    }
    await page.click('.tv-close'); await page.reload(); await enter();
    await page.click('[data-do=ilyra]');
    await page.waitForFunction(() => document.querySelector('.tv-figure canvas')?.dataset.clip === 'idle');
    assert.equal(await page.locator('.tv-heart-buttons .unlocked').count(), 4);
    assert.doesNotMatch(await page.title(), /Tavern test branch/);
    const databases = await page.evaluate(() => indexedDB.databases());
    assert.ok(databases.some(db => db.name === 'spire-idle-bastion-probe-' + probe));
    assert.ok(databases.every(db => !db.name.startsWith('spire-tavern-preview')));
    assert.deepEqual(errors, []);
    results.push({ language, viewport, normalMainNamespace: true, bothFigures: true, handReactions: true, complimentReturn: true, reloadPreserved: true, productionCounterScene:true, localizedRoomControl:true, errors });
    console.log(`Normal main ${language}/${viewport.width}: both figures, reactions and reload passed`);
    await page.close();
  }
  await writeFile(new URL('results.json', out), JSON.stringify({ base, passed: true, cases: results }, null, 2));
} finally { await browser.close(); }
