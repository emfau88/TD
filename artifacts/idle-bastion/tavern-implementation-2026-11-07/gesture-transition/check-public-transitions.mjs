import { chromium } from 'file:///C:/Users/madde/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
import { mkdir, writeFile } from 'node:fs/promises';
import assert from 'node:assert/strict';

const base = process.env.TAVERN_TEST_URL || 'http://127.0.0.1:5278/';
const out = new URL(process.env.TAVERN_REMOTE ? './public/' : './main-local/', import.meta.url);
await mkdir(out, { recursive: true });
const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true, args: ['--disable-gpu'] });
const results = [];
try {
  for (const who of ['mara', 'ilyra']) {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
    const errors = []; page.on('pageerror', error => errors.push(error.message));
    await page.goto(new URL('tavern-test.html', base).href);
    await page.selectOption('#companion', who); await page.selectOption('#language', 'de');
    await page.click('#start');
    await page.waitForFunction(() => document.querySelector('#boot-screen')?.hidden === true);
    if (await page.locator('#claim-offline').isVisible()) await page.click('#claim-offline');
    await page.waitForFunction(() => document.querySelector('.tv-figure canvas')?.dataset.clip === 'idle');
    const rect = () => page.locator('.tv-figure canvas').boundingBox();
    const initial = await rect();
    for (const [name, key, duration] of [['laugh-from-idle', 'giggle', 700], ['compliment-and-return', 'hip', 5400], ['compliment-interrupted-by-laugh', 'giggle', 700]]) {
      if (name.startsWith('compliment-interrupted')) {
        await page.click('[data-do=speak]'); await page.click('[data-gesture=hip]');
        await page.waitForFunction(() => document.querySelector('.tv-figure canvas')?.dataset.clip === 'hip');
      } else await page.waitForFunction(() => document.querySelector('.tv-figure canvas')?.dataset.clip === 'idle');
      await page.click('[data-do=speak]');
      await page.evaluate(duration => {
        window.transitionSamples = new Promise(resolve => {
          const frames = [], canvas = document.querySelector('.tv-figure canvas'); let started;
          const sample = now => {
            started ??= now;
            const pixels = canvas.getContext('2d').getImageData(0, 0, 480, 700).data;
            let dark = 0, black = 0, transparent = 0, total = 0;
            for (let i = 0; i < pixels.length; i += 64) {
              total++;
              if (Math.abs(pixels[i] - 20) <= 12 && Math.abs(pixels[i + 1] - 33) <= 12 && Math.abs(pixels[i + 2] - 37) <= 12) dark++;
              if (pixels[i] < 8 && pixels[i + 1] < 8 && pixels[i + 2] < 8) black++;
              if (pixels[i + 3] < 240) transparent++;
            }
            frames.push({ at: now - started, clip: canvas.dataset.clip, dark: dark / total, black: black / total, transparent: transparent / total });
            if (now - started < duration) requestAnimationFrame(sample); else resolve(frames);
          }; requestAnimationFrame(sample);
        });
      }, duration);
      await page.click(`[data-gesture=${key}]`);
      const frames = await page.evaluate(() => window.transitionSamples);
      assert.ok(frames.some(frame => frame.clip === key), `${who}/${name}: reaction must actually play`);
      for (const frame of frames) { assert.ok(frame.dark < .55 && frame.black < .55, `${who}/${name}: dark rectangle`); assert.ok(frame.transparent < .01, `${who}/${name}: blank canvas`); }
      if (duration > 5000) assert.ok(frames.some((frame, index) => frame.clip === 'idle' && frames.slice(0, index).some(previous => previous.clip === 'hip')), 'reaction must return to idle');
      assert.deepEqual(await rect(), initial);
      results.push({ who, name, samples: frames.length, maxDark: Math.max(...frames.map(frame => frame.dark)), frames });
    }
    assert.deepEqual(errors, []); await page.close();
  }
  await writeFile(new URL('results.json', out), JSON.stringify({ base, cases: results, passed: true }, null, 2));
  console.log(JSON.stringify({ base, cases: results.length, samples: results.reduce((sum, row) => sum + row.samples, 0), maxDark: Math.max(...results.map(row => row.maxDark)), passed: true }));
} finally { await browser.close(); }
