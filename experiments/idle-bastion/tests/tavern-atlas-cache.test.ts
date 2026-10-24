import test, { type TestContext } from 'node:test';
import assert from 'node:assert/strict';
import { TavernAtlasCache } from '../src/tavern-atlas-cache';

function images(t: TestContext, behavior: (image: FakeImage, url: string) => void) {
  const previous = globalThis.Image;
  class Image extends FakeImage { set src(url: string) { this.url = url; behavior(this, url); } }
  globalThis.Image = Image as unknown as typeof globalThis.Image;
  t.after(() => { globalThis.Image = previous; });
}
class FakeImage {
  url = ''; onload: (() => void) | null = null; onerror: (() => void) | null = null;
  decode = async () => {};
  removeAttribute() { this.url = ''; }
}

test('atlas failure retries once, releases rejected entry and permits a later request', async t => {
  let attempts = 0, failing = true;
  images(t, image => { attempts++; queueMicrotask(() => failing ? image.onerror?.() : image.onload?.()); });
  const cache = new TavernAtlasCache(4, 50, 1);
  assert.equal(await cache.request('touch.webp').promise, false);
  assert.equal(attempts, 2); assert.equal(cache.size, 0);
  failing = false;
  assert.equal(await cache.request('touch.webp').promise, true);
  assert.equal(attempts, 3); assert.equal(cache.size, 1); cache.clear();
});

test('atlas timeout and decode rejection are bounded and do not poison the cache', async t => {
  let mode = 'timeout', attempts = 0;
  images(t, image => {
    attempts++;
    if (mode === 'decode') { image.decode = async () => { throw Error('decode'); }; queueMicrotask(() => image.onload?.()); }
    if (mode === 'ok') queueMicrotask(() => image.onload?.());
  });
  const cache = new TavernAtlasCache(4, 10, 1);
  assert.equal(await cache.request('head.webp').promise, false); assert.equal(attempts, 2);
  mode = 'decode'; assert.equal(await cache.request('head.webp').promise, false); assert.equal(attempts, 4);
  mode = 'ok'; assert.equal(await cache.request('head.webp').promise, true); cache.clear();
});

test('atlas cache bounds queued and decoded entries, protects pinned pages and cancels on stop', async t => {
  const pending: FakeImage[] = [];
  images(t, image => { pending.push(image); });
  const cache = new TavernAtlasCache(5, 100, 1);
  cache.pin(['idle.webp']);
  const idle = cache.request('idle.webp');
  const entries = Array.from({ length: 12 }, (_, n) => cache.request(`${n}.webp`));
  assert.ok(cache.size <= 5); assert.equal(cache.peek('idle.webp'), idle);
  assert.equal([...entries, idle].filter(entry => entry.state === 'loading').length, 2);
  cache.clear();
  assert.ok((await Promise.all([...entries, idle].map(entry => entry.promise))).every(ready => !ready));
  assert.equal(cache.size, 0);
  const again = cache.request('again.webp'); pending.at(-1)!.onload?.();
  assert.equal(await again.promise, true); cache.clear();
});

test('atlas remains unavailable until image decoding completes', async t => {
  let decoded!: () => void;
  images(t, image => { image.decode = () => new Promise<void>(resolve => { decoded = resolve; }); queueMicrotask(() => image.onload?.()); });
  const cache = new TavernAtlasCache(4, 100, 1), entry = cache.request('joy.webp');
  await new Promise(resolve => setImmediate(resolve)); assert.equal(entry.state, 'loading');
  decoded(); assert.equal(await entry.promise, true); assert.equal(entry.state, 'ready'); cache.clear();
});

test('foreground action cancels obsolete warm-up work without reporting download failure', async t => {
  const pending: FakeImage[] = [];
  images(t, image => pending.push(image));
  const cache = new TavernAtlasCache(5, 100, 1);
  const idle = cache.request('idle.webp'), stale = cache.request('distant-idle.webp'), warm = cache.request('joy.webp');
  cache.retainLoads(['idle.webp', 'touch.webp']);
  assert.equal(await stale.promise, false); assert.equal(stale.state, 'cancelled');
  assert.equal(await warm.promise, false); assert.equal(warm.state, 'cancelled');
  const touch = cache.request('touch.webp', 4); assert.equal(touch.state, 'loading');
  pending.at(-1)!.onload?.(); assert.equal(await touch.promise, true);
  cache.clear(); assert.equal(await idle.promise, false);
});
