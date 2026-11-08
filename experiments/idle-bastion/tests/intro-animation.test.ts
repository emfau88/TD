import test, { type TestContext } from 'node:test';
import assert from 'node:assert/strict';
import { IntroPortraitPlayer, type IntroAnimation } from '../src/intro-animation';

const clip: IntroAnimation = { frames: 5, fps: 2, width: 10, height: 12, columns: 2, perPage: 4, pages: ['a', 'b'] };
const page = { naturalWidth: 20, naturalHeight: 24 } as HTMLImageElement;
const settle = async () => { await Promise.resolve(); await Promise.resolve(); await Promise.resolve(); };

function fixture(t: TestContext, reduced = false,
  load = async (_url: string): Promise<HTMLImageElement | null> => page) {
  const callbacks = new Map<number, FrameRequestCallback>(); let serial = 0;
  const originals = ['window', 'requestAnimationFrame', 'cancelAnimationFrame'].map(key => [key, Object.getOwnPropertyDescriptor(globalThis, key)] as const);
  Object.assign(globalThis, { window: { matchMedia: () => ({ matches: reduced }) },
    requestAnimationFrame: (cb: FrameRequestCallback) => { callbacks.set(++serial, cb); return serial; },
    cancelAnimationFrame: (id: number) => callbacks.delete(id),
  });
  t.after(() => { for (const [key, descriptor] of originals) { if (descriptor) Object.defineProperty(globalThis, key, descriptor); else Reflect.deleteProperty(globalThis, key); } });
  const draws: unknown[][] = [];
  const context = { clearRect: () => {}, drawImage: (...args: unknown[]) => draws.push(args) };
  const canvas = { hidden: true, dataset: {} as Record<string, string>, getContext: () => context } as unknown as HTMLCanvasElement;
  const poster = { hidden: false } as HTMLImageElement;
  const player = new IntroPortraitPlayer(canvas, poster, [clip, clip], load);
  return { player, canvas, poster, draws, callbacks,
    frame: (time: number) => { const pending = [...callbacks.values()]; callbacks.clear(); pending.forEach(cb => cb(time)); } };
}

test('plays once across atlas pages, holds last frame and does not restart during UI refresh', async t => {
  const f = fixture(t); f.player.show(0); await settle();
  assert.equal(f.poster.hidden, true); assert.equal(f.canvas.hidden, false);
  f.frame(0); f.frame(1500); f.frame(2500);
  assert.equal(f.canvas.dataset.frame, '4'); assert.equal(f.canvas.dataset.state, 'held');
  assert.equal(f.callbacks.size, 0); assert.equal(f.draws.at(-1)?.[1], 0);
  f.player.show(0); await settle();
  assert.equal(f.canvas.dataset.state, 'held'); assert.equal(f.callbacks.size, 0);
  f.player.show(2);
  assert.equal(f.poster.hidden, false); assert.equal(f.canvas.hidden, true);
});

test('continue or skip during loading cannot revive the previous portrait', async t => {
  const pending: ((image: HTMLImageElement) => void)[] = [];
  const f = fixture(t, false, () => new Promise(resolve => pending.push(resolve)));
  f.player.show(0); f.player.show(1);
  pending.slice(0, 2).forEach(resolve => resolve(page)); await settle();
  assert.equal(f.canvas.hidden, true);
  f.player.show(undefined);
  pending.slice(2).forEach(resolve => resolve(page)); await settle();
  assert.equal(f.canvas.hidden, true); assert.equal(f.poster.hidden, false); assert.equal(f.callbacks.size, 0);
});

test('failed atlas keeps the static portrait and never schedules playback', async t => {
  const f = fixture(t, false, async () => null);
  f.player.show(0); await settle();
  assert.equal(f.canvas.dataset.state, 'fallback'); assert.equal(f.poster.hidden, false);
  assert.equal(f.canvas.hidden, true); assert.equal(f.callbacks.size, 0);
});

test('reduced motion and the third scene remain static without downloading animation pages', async t => {
  let loads = 0;
  const f = fixture(t, true, async () => { loads++; return page; });
  f.player.show(0); f.player.show(1); f.player.show(2); await settle();
  assert.equal(loads, 0); assert.equal(f.canvas.hidden, true); assert.equal(f.poster.hidden, false);
});

test('hidden time does not advance the animation, and stopping releases its frame callback', async t => {
  const f = fixture(t); f.player.show(0); await settle();
  f.frame(0); f.frame(500); assert.equal(f.canvas.dataset.frame, '1');
  f.player.setPaused(true); f.frame(10000); f.player.setPaused(false); f.frame(15000);
  assert.equal(f.canvas.dataset.frame, '1'); f.frame(15500); assert.equal(f.canvas.dataset.frame, '2');
  f.player.stop(); assert.equal(f.callbacks.size, 0); assert.equal(f.poster.hidden, false);
});
