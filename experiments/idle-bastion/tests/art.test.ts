import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
import { ART, FIRE_FRAMES, LEAF_FRAMES, MARA_FOOT, SCALE, enemyFrame, loopFrame, maraDestination, maraFrame } from '../src/art';
import { roadSource } from '../src/forest';
import { createIdleLayout } from '../src/layout';

test('bundled runtime atlases retain original dimensions and logical enemy frame maps', async () => {
  const manifest = JSON.parse(await readFile(new URL('../../../public/assets/manifest.json', import.meta.url), 'utf8'));
  assert.deepEqual([...LEAF_FRAMES], manifest.Leafbug.frameMap);
  assert.deepEqual([...FIRE_FRAMES], manifest.Firebug.frameMap);
  const expected: Partial<Record<keyof typeof ART, readonly [number, number]>> = {
    grass: [1024, 1024], water: [4480, 448], tower: [192, 128], weapon: [576, 96],
    projectile: [24, 40], leafbug: [512, 576], firebug: [1408, 576], core: [192, 192], maraSource: [1254, 1254], wisp: [576, 384],
  };
  for (const [key, dimensions] of Object.entries(expected)) {
    const bytes = await readFile(new URL(ART[key as keyof typeof ART]));
    if (key === 'maraSource') {
      assert.ok(ART.maraSource.endsWith('.webp'));
      assert.equal(bytes.toString('ascii', 0, 4), 'RIFF');
      assert.equal(bytes.readUInt32LE(4) + 8, bytes.length, 'complete WebP container');
      assert.equal(bytes.toString('ascii', 8, 16), 'WEBPVP8L', 'lossless Mara runtime atlas');
      assert.equal(bytes[20], 0x2f);
      const bits = bytes.readUInt32LE(21);
      assert.deepEqual([(bits & 0x3fff) + 1, ((bits >>> 14) & 0x3fff) + 1], dimensions, key);
    } else {
      assert.deepEqual(bytes.subarray(0, 8), Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
      assert.deepEqual([bytes.readUInt32BE(16), bytes.readUInt32BE(20)], dimensions, key);
    }
  }
  assert.ok(ART.wisp.endsWith('Wisp%20-%20Animations.png'), 'the introduced Wisp is intentionally bundled');
  assert.equal(SCALE.tile * 64, 40);
  assert.equal(SCALE.tree * 62, 49.6);
  assert.equal(SCALE.tower, 0.63);
  assert.equal(SCALE.enemy, 0.83);
});

test('every measured Mara crop fits its own runtime cell and preserves the documented shared foot anchor', () => {
  assert.deepEqual(MARA_FOOT, [32, 56]);
  for (let index = 0; index < 16; index++) {
    const { source: [sx, sy, sw, sh], destination: [dx, dy, dw, dh] } = maraDestination(index);
    assert.ok(sx >= 0 && sy >= 0 && sx + sw <= 1254 && sy + sh <= 1254);
    const localX = dx - index % 4 * 64, localY = dy - Math.floor(index / 4) * 64;
    assert.ok(localX >= 0 && localY >= 0 && localX + dw <= 64 && localY + dh <= 64, `Mara frame ${index}`);
    assert.ok(dh >= 37 && dh <= 43, `Mara frame ${index} must keep the measured silhouette height`);
  }
});

test('animation frames depend only on simulation time, retain directions and repeat within the original frame maps', () => {
  assert.equal(enemyFrame('Leafbug', 'down', 0), LEAF_FRAMES[18]);
  assert.equal(enemyFrame('Leafbug', 'up', 0), LEAF_FRAMES[26]);
  assert.equal(enemyFrame('Firebug', 'side', 0), FIRE_FRAMES[34]);
  for (const direction of ['up', 'down', 'side'] as const) {
    for (const kind of ['Leafbug', 'Firebug'] as const) {
      assert.equal(enemyFrame(kind, direction, 0.25), enemyFrame(kind, direction, 1.05));
    }
  }
  assert.equal(maraFrame('left', false, false, 100), 4);
  assert.equal(maraFrame('right', false, false, 100), 8);
  assert.equal(maraFrame('up', true, false, 0), 13);
  assert.equal(maraFrame('up', true, false, 1 / 6), 14);
  assert.equal(maraFrame('up', false, true, 20), 15);
  assert.equal(loopFrame(0.9, 10), 9);
  assert.equal(loopFrame(1, 10), 0);
});

test('the real idle route uses the accepted connecting source quadrants for each turn and straight segment', () => {
  // All shipped routes remain loadable; their north bends intentionally differ.
  for (const [version, north] of [[3, 2], [4, 4], [5, 4]] as const) {
    const layout = createIdleLayout({ version });
    const road = new Set(layout.road.cells.map(cell => cell.x + ',' + cell.y));
    const cases: readonly [number, number, readonly [number, number]][] = [
      [1, 5, [384, 64]], [7, 5, [448, 192]], [7, north, [320, 64]],
      [15, north, [448, 64]], [15, 8, [320, 128]], [15, 10, [320, 192]],
      [25, 10, [448, 192]], [25, 6, [320, 64]],
    ];
    for (const [x, y, source] of cases) {
      assert.ok(road.has(x + ',' + y), 'layout ' + version + ': real road at ' + x + ',' + y);
      assert.deepEqual(roadSource({ x, y }, road), source, 'layout ' + version + ': ' + x + ',' + y);
    }
  }
});
