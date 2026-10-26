import { chromium } from 'file:///C:/Users/madde/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
import { writeFileSync } from 'node:fs';
import assert from 'node:assert/strict';
const root = new URL('./', import.meta.url);
const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
const cases = [];
try {
  for (const width of [1280, 390]) {
    const context = await browser.newContext({ viewport: { width, height: 850 } });
    const page = await context.newPage(), errors = []; page.on('pageerror', e => errors.push(e.message));
    await page.route('**/src/battle-scene.ts*', async route => {
      const response = await route.fetch(), body = (await response.text()).replace(/super\(["']IdleBattle["']\);/, 'super("IdleBattle");window.__shadowScene=this;');
      await route.fulfill({ response, body });
    });
    await page.goto(`http://127.0.0.1:5235/?probe=shadow-${crypto.randomUUID()}`);
    await page.locator('#boot-screen').waitFor({ state: 'hidden', timeout: 60000 });
    const result = await page.evaluate(async () => {
      const { ENEMY_SHEETS, enemyFrame, enemyHealFrame, enemyShadowOffset } = await import('/src/enemy-art.ts');
      const { ENEMIES } = await import('/src/enemy-roster.ts');
      const { KEYS } = await import('/src/art.ts');
      const scene = window.__shadowScene, b = scene.sim, originalEnemies = b.enemies, before = JSON.stringify(b.snapshot());
      const board = document.createElement('canvas'); board.width = 1100; board.height = 17 * 108 + 70;
      const ctx = board.getContext('2d'); ctx.imageSmoothingEnabled = false;
      ctx.fillStyle = '#354c31'; ctx.fillRect(0, 0, board.width, board.height); ctx.font = '16px sans-serif';
      ctx.fillStyle = 'white'; ctx.fillText('Before / After · actual frames and anchors · 2× scale', 15, 25);
      const observations = [];
      const paint = (view, x, y, offset, flying, elapsed, uid) => {
        const frame = view.sprite.frame, s = view.sprite.scaleX * 2, lift = flying ? 7 + Math.sin(elapsed * 5 + uid) * 1.5 : 0;
        ctx.fillStyle = '#20341f'; ctx.beginPath(); ctx.ellipse(x, y + offset * 2, 23, 9, 0, 0, Math.PI * 2); ctx.fill();
        ctx.drawImage(frame.source.image, frame.cutX, frame.cutY, frame.cutWidth, frame.cutHeight,
          x - view.sprite.displayOriginX * s, y - (view.sprite.displayOriginY + lift / view.sprite.scaleX) * s,
          frame.cutWidth * s, frame.cutHeight * s);
      };
      try {
        let row = 0;
        for (const [id, def] of Object.entries(ENEMIES)) {
          const enemy = { uid: 900 + row, def, x: 500, y: 300, direction: 'side', flip: false, hp: 100, maxHp: 100, slowRemaining: 0, healRemaining: 0, healLockout: 0 };
          b.enemies = [enemy]; scene.drawActors();
          const view = scene.enemyViews.get(enemy.uid), offset = view.shadow.y - enemy.y;
          observations.push({ id, flying: def.flying, shadowOffset: offset, expected: enemyShadowOffset(id), correctTexture: view.sprite.texture.key === ENEMY_SHEETS[id].key, spriteLift: enemy.y - view.sprite.y });
          ctx.fillStyle = 'white'; ctx.fillText(`${id}${def.flying ? ' (air)' : ''}`, 15, 58 + row * 108);
          for (const [col, direction] of ['down', 'up', 'side'].entries()) {
            view.sprite.setFrame(enemyFrame(id, direction, 1.2));
            paint(view, 310 + col * 270, 100 + row * 108, id === 'Rosenspiegel' ? 0 : 9, def.flying, b.elapsed, enemy.uid);
            paint(view, 410 + col * 270, 100 + row * 108, offset, def.flying, b.elapsed, enemy.uid);
          }
          row++;
        }
      } finally { b.enemies = originalEnemies; scene.drawActors(); }
      const actorFoot = (key, count, origin, scale, shadowOffset) => {
        const texture = scene.textures.get(key), canvas = document.createElement('canvas'); canvas.width = canvas.height = 64;
        const c = canvas.getContext('2d'), offsets = [];
        for (let index = 0; index < count; index++) {
          const f = texture.get(index); c.clearRect(0, 0, 64, 64); c.drawImage(f.source.image, f.cutX, f.cutY, 64, 64, 0, 0, 64, 64);
          const pixels = c.getImageData(0, 0, 64, 64).data; let bottom = 0;
          for (let y = 0; y < 64; y++) for (let x = 0; x < 64; x++) if (pixels[(y * 64 + x) * 4 + 3] >= 128) bottom = y + 1;
          offsets.push((bottom - origin) * scale);
        }
        return { minFootOffset: Math.min(...offsets), maxFootOffset: Math.max(...offsets), shadowOffset };
      };
      return { observations, actors: { mara: actorFoot(KEYS.mara, 16, 56, 1, 1), ilyra: actorFoot(KEYS.ilyra, 32, 56, 1, 1), wisp: actorFoot(KEYS.wisp, 36, 51, .9, null) },
        modelUnchanged: before === JSON.stringify(b.snapshot()), image: board.toDataURL('image/png') };
    });
    assert.equal(result.modelUnchanged, true); assert.ok(result.observations.every(v => v.shadowOffset === v.expected));
    assert.ok(result.observations.every(v => v.correctTexture));
    assert.ok(result.observations.filter(v => v.flying).every(v => v.spriteLift >= 5.5 && v.spriteLift <= 8.5 && v.shadowOffset > 9));
    assert.deepEqual(errors, []);
    if (width === 1280) writeFileSync(new URL('comparison.png', root), Buffer.from(result.image.split(',')[1], 'base64'));
    delete result.image; cases.push({ width, ...result, errors }); await context.close();
  }
  writeFileSync(new URL('browser-results.json', root), JSON.stringify(cases, null, 2) + '\n'); console.log(JSON.stringify(cases));
} finally { await browser.close(); }
