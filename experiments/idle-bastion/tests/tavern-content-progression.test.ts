import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { TOUCH_CLIPS } from '../src/tavern-content';
import { availableTouches } from '../src/tavern-social';
import { MARA_MOMENTS, maraLine, nextMaraMoment } from '../src/tavern-mara-content';
import { ILYRA_MOMENTS, ilyraLine, nextIlyraMoment } from '../src/tavern-ilyra-content';

test('each active touch uses a distinct existing clip, independent of story clips', () => {
  const manifest = JSON.parse(readFileSync(new URL('../assets/tavern-rig/manifest.json', import.meta.url), 'utf8'));
  assert.deepEqual([10, 35, 70].map(p => availableTouches(p).map(region => TOUCH_CLIPS[region])), [['touch'], ['touch', 'head'], ['touch', 'head', 'giggle']]);
  for (const who of ['mara', 'ilyra']) for (const key of Object.values(TOUCH_CLIPS)) {
    assert.ok(manifest.heroes[who][key]);
    assert.ok(manifest.heroes[who][key].pages.every((page: string) => existsSync(new URL('../assets/tavern-rig/' + page, import.meta.url))));
  }
  for (const moments of [MARA_MOMENTS, ILYRA_MOMENTS]) {
    assert.equal(moments.length, 5); assert.ok(moments.every(m => m.beats.length === 3));
    assert.ok(moments[0]!.beats.every(b => ['idle', 'head'].includes(b.clip)));
    assert.ok(moments.flatMap(m => m.beats).every(b => ['idle', 'head', 'touch'].includes(b.clip)));
  }
});
test('conversation rotation retains earlier unlocked lines without leaking future stages', () => {
  for (const line of [maraLine, ilyraLine]) {
    const heard = new Set(Array.from({ length: 8 }, (_, turn) => line(70, 'talk', 'shoulder', turn)));
    for (const points of [0, 10, 35, 70]) for (let i = 0; i < 2; i++) assert.ok(heard.has(line(points, 'talk', 'shoulder', i)));
    assert.equal(heard.size, 8); assert.equal(heard.has(line(110, 'talk', 'shoulder', 0)), false);
  }
  assert.equal(nextMaraMoment(70), undefined); assert.equal(nextIlyraMoment(70), undefined);
});
