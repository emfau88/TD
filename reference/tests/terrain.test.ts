import assert from 'node:assert/strict';
import test from 'node:test';
import { clearWaterBackdrop } from '../src/terrain';

test('water backdrop cleanup preserves enclosed green details and treats animation frames separately', () => {
  const width = 10, height = 5, data = new Uint8ClampedArray(width * height * 4);
  const put = (x: number, y: number, color: number) => data.set([color >> 16, (color >> 8) & 255, color & 255, 255], (y * width + x) * 4);
  for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) put(x, y, 0x63ab3f);
  // Closed shore around a green detail in frame one, water in frame two.
  for (let y = 1; y < 4; y++) for (let x = 1; x < 4; x++) {
    put(x, y, x === 2 && y === 2 ? 0x3b7d4f : 0xffae70);
    put(x + 5, y, 0x92e8c0);
  }
  clearWaterBackdrop(data, width, 5, height);
  for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
    const inside = x % 5 >= 1 && x % 5 <= 3 && y >= 1 && y <= 3;
    assert.equal(data[(y * width + x) * 4 + 3], inside ? 255 : 0);
  }
  assert.deepEqual([...data.slice((2 * width + 2) * 4, (2 * width + 2) * 4 + 4)], [59, 125, 79, 255]);
});
