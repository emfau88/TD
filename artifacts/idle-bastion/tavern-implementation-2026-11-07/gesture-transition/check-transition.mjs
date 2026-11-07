import { chromium } from 'file:///C:/Users/madde/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
import { mkdir, writeFile } from 'node:fs/promises';
import assert from 'node:assert/strict';

const phase = process.argv[2] || 'after';
const out = new URL(`./${phase}/`, import.meta.url); await mkdir(out, { recursive: true });
const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true, args: ['--disable-gpu'] });
const results = [];
try {
  for (const who of ['mara', 'ilyra']) {
    const page = await browser.newPage({ viewport: { width: 1280, height: 844 } });
    await page.routeWebSocket('**/*', ws => ws.close());
    const errors = []; page.on('pageerror', e => errors.push(e.message));
    await page.goto(`http://127.0.0.1:5278/tavern-rig-check.html?hero=${who}&artwork=video`);
    await page.waitForFunction(() => window.tavernReview?.ui.animation.ready);
    await page.selectOption('#review-hearts', '5');
    await page.evaluate(() => {
      const ui = window.tavernReview.ui, player = ui.animation, canvas = ui.dialog.querySelector('.tv-figure canvas');
      window.measurePixels = canvas => {
        const data = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height).data;
        let uniformDark = 0, black = 0, alpha = 0, total = 0, sum = 0;
        for (let i = 0; i < data.length; i += 64) {
          const r = data[i], g = data[i + 1], b = data[i + 2]; total++;
          if (Math.abs(r - 20) <= 12 && Math.abs(g - 33) <= 12 && Math.abs(b - 37) <= 12) uniformDark++;
          if (r < 8 && g < 8 && b < 8) black++;
          if (data[i + 3] < 240) alpha++;
          sum += (r + g + b) / 3;
        }
        return { uniformDarkRatio: uniformDark / total, blackRatio: black / total, transparentRatio: alpha / total, mean: sum / total };
      };
      window.captureTransition = async (method, arg, duration = 700) => {
        const before = player.key, frames = []; let peak, image, started;
        player[method](arg);
        await new Promise(resolve => {
          const sample = now => {
            started ??= now;
            const p = window.measurePixels(canvas);
            const current = { at: now - started, key: player.key, pending: player.pending, frame: canvas.dataset.frame,
              transition: player.transition ? { ...player.transition, image: undefined } : null,
              media: player.current ? { readyState: player.current.video.readyState, seeking: player.current.video.seeking, time: player.current.video.currentTime } : null, ...p };
            frames.push(current);
            if (!peak || p.uniformDarkRatio > peak.uniformDarkRatio) { peak = current; image = canvas.toDataURL('image/png').split(',')[1]; }
            if (now - started < duration) requestAnimationFrame(sample); else resolve();
          }; requestAnimationFrame(sample);
        });
        return { before, arg, frames, peak, image };
      };
      window.sourceFirstFrames = async () => {
        const rows = [];
        for (const key of ['idle', 'giggle', 'hip', 'joy', 'head', 'hair', 'touch']) {
          const clip = player.clips[key]; if (!clip) continue;
          const video = document.createElement('video'); video.muted = true; video.preload = 'auto';
          await new Promise((resolve, reject) => { video.onloadeddata = resolve; video.onerror = reject; video.src = `/assets/tavern-video/${clip.file}`; video.load(); });
          const frame = document.createElement('canvas'); frame.width = 480; frame.height = 700;
          frame.getContext('2d').drawImage(video, 0, 2, 480, 700, 0, 0, 480, 700);
          rows.push({ key, ...window.measurePixels(frame) }); video.removeAttribute('src'); video.load();
        }
        return rows;
      };
    });
    const sources = await page.evaluate(() => window.sourceFirstFrames());
    for (const row of sources) assert.ok(row.uniformDarkRatio < .55 && row.blackRatio < .55, `Source ${who}/${row.key} begins with a dark rectangle.`);
    for (const [name, method, arg, from] of [
      ['idle-to-giggle', 'gesture', 'giggle', 'idle'],
      ['idle-to-hip', 'gesture', 'hip', 'idle'],
      ['hip-to-giggle', 'gesture', 'giggle', 'hip'],
      ['hip-to-idle', 'scene', 'idle', 'hip'],
      ['idle-to-shoulder', 'play', 'shoulder', 'idle'],
    ]) {
      await page.evaluate(from => { const p = window.tavernReview.ui.animation; if (from === 'hip') p.gesture('hip'); else p.scene('idle'); }, from);
      await page.waitForFunction(from => window.tavernReview.ui.animation.key === from && !window.tavernReview.ui.animation.transition, from);
      const result = await page.evaluate(([method, arg]) => window.captureTransition(method, arg), [method, arg]);
      await writeFile(new URL(`${who}-${name}-peak.png`, out), Buffer.from(result.image, 'base64')); delete result.image;
      results.push({ who, name, sources, errors, ...result });
      console.log(`${who}/${name}: uniformDark=${result.peak.uniformDarkRatio.toFixed(4)}, mean=${result.peak.mean.toFixed(1)}, media=${JSON.stringify(result.peak.media)}`);
      if (phase !== 'before') assert.ok(result.frames.every(f => f.uniformDarkRatio < .55 && f.blackRatio < .55 && f.transparentRatio < .1), `${who}/${name} contains a dark/blank rectangle.`);
    }
    assert.deepEqual(errors, []); await page.close();
  }
} catch (error) {
  results.push({ failed: true, error: error.stack || String(error) }); process.exitCode = 1; console.error(error);
} finally {
  await writeFile(new URL('results.json', out), JSON.stringify(results, null, 2) + '\n'); await browser.close();
}
