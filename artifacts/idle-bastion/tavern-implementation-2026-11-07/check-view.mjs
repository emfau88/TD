import { chromium } from 'file:///C:/Users/madde/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const phase = process.argv[2] || 'before';
const folder = new URL(`./${phase}/`, import.meta.url);
await mkdir(folder, { recursive: true });
const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
const results = [];
try {
  for (const width of [1280, 390]) for (const who of ['mara', 'ilyra']) {
    const page = await browser.newPage({ viewport: { width, height: 844 } });
    const errors = [], media = [];
    page.on('pageerror', e => errors.push(e.message));
    page.on('request', r => { if (/\.(?:webp|mp4)(?:\?|$)/.test(r.url())) media.push(r.url()); });
    await page.goto(`http://127.0.0.1:5277/tavern-rig-check.html?hero=${who}${phase === 'before' ? '' : '&artwork=video'}`, { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => document.querySelector('.tv-figure canvas')?.dataset.clip === 'idle', { timeout: 45000 });
    await page.locator('#tavern-dialog').screenshot({ path: fileURLToPath(new URL(`${who}-${width}.png`, folder)) });
    results.push({ who, width, errors, media, layout: await page.evaluate(() => {
      const rect = selector => { const r = document.querySelector(selector).getBoundingClientRect(); return { x: r.x, y: r.y, width: r.width, height: r.height }; };
      return { dialog: rect('#tavern-dialog'), canvas: rect('.tv-figure canvas'), stage: rect('.tv-stage'), actions: [...document.querySelectorAll('.tv-actions > button > span')].map(e => e.textContent), clip: document.querySelector('.tv-figure canvas').dataset.clip, overflow: document.documentElement.scrollWidth > innerWidth };
    }) });
    await page.close();
  }
  await writeFile(new URL('results.json', folder), JSON.stringify(results, null, 2));
  console.log(JSON.stringify(results.map(({ who, width, errors, layout }) => ({ who, width, errors, layout })), null, 2));
} finally { await browser.close(); }
