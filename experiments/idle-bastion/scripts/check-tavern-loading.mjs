// Compact DOM integration check. No browser save and no network image decoding.
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';
import { JSDOM } from 'jsdom';

const root = fileURLToPath(new URL('../', import.meta.url));
const dom = new JSDOM('<!doctype html><body></body>', { url: 'http://localhost/' });
const requests = [];
const paint = { clearRect() {}, drawImage() {}, imageSmoothingEnabled: false };
for (const key of ['window', 'document', 'HTMLElement', 'HTMLCanvasElement', 'AbortController']) globalThis[key] = dom.window[key];
globalThis.ResizeObserver = class { observe() {} disconnect() {} };
globalThis.requestAnimationFrame = () => 1;
globalThis.cancelAnimationFrame = () => {};
globalThis.Image = class {
  width = 170; height = 200;
  set src(value) { requests.push(value); queueMicrotask(() => this.onload?.()); }
};
dom.window.HTMLCanvasElement.prototype.getContext = () => paint;
dom.window.HTMLDialogElement.prototype.showModal = function () { this.open = true; };
dom.window.HTMLDialogElement.prototype.close = function () { this.open = false; };
const settle = () => new Promise(resolve => setImmediate(resolve));
const server = await createServer({ root, configFile: false, server: { middlewareMode: true }, appType: 'custom' });
let session, ui;
try {
  const { BattleSession } = await server.ssrLoadModule('/src/battle-session.ts');
  const { TavernUI } = await server.ssrLoadModule('/src/tavern-ui.ts');
  session = await BattleSession.open(undefined, { guidedStart: false });
  const b = session.battle;
  b.update(4); b.highestCleared = 25; b.gold = 12000; b.bossVictories = 1; b.secondBossVictories = 1;
  b.buildTavern(b.recommendedTavernPlot); b.upgradeTavern(); b.recruitIlyra();
  b.social.points.mara = 12;
  const touches=[];
  ui = new TavernUI({ session: () => session, navigate() {}, onTouch:who=>touches.push(who) });
  assert.equal(requests.length, 0, 'no portrait or animation request before opening');
  ui.open(); await settle();
  assert.equal(requests.length, 2);
  assert.ok(requests.every(url => url.endsWith('-portrait.webp')), 'overview loads only portraits');
  document.querySelector('[data-do="mara"]').click(); await settle();
  assert.deepEqual(requests.slice(2).map(url => url.split('/').pop()), ['mara-atlas.webp', 'mara-reactions.webp']);
  document.querySelector('[data-do="back"]').click();
  document.querySelector('[data-do="ilyra"]').click(); await settle();
  assert.deepEqual(requests.slice(4).map(url => url.split('/').pop()), ['ilyra-atlas.webp', 'ilyra-reactions.webp']);
  console.log('PASS: overview only two small portraits; full images only for selected companion.');
  const fill = document.querySelector('.tv-bond-fill');
  assert.equal(fill.style.transition, 'none', 'new companion opens at saved position without replay');
  b.social.points.ilyra = 12; ui.update();
  assert.equal(fill.style.transition, '', 'reward uses the stylesheet transition');
  assert.ok(Math.abs(parseFloat(fill.style.width) - 21.6) < .001, 'first heart crossed smoothly into second section');
  b.social.points.ilyra = 160; ui.update(); assert.equal(fill.style.width, '100%');
  assert.equal(document.querySelector('progress').value, 160);
  console.log('PASS: bond bar snaps on companion change, animates rewards, crosses thresholds and reaches full.');


  // Regression check: a real background checkpoint must not dim available controls.
  document.querySelector('[data-do="back"]').click();
  document.querySelector('[data-do="mara"]').click(); await settle();
  const snapshot = () => ({ busy: session.busy,
    talkDisabled: document.querySelector('[data-action="talk"]').disabled,
    unlockedHeartDisabled: document.querySelector('[data-moment="1"]').disabled,
    lockedHeartDisabled: document.querySelector('[data-moment="2"]').disabled });
  ui.update(); console.log('before checkpoint', JSON.stringify(snapshot()));
  for (let i = 0; i < 4; i++) { session.advance(.25); if (session.busy) break; }
  ui.update(); console.log('during checkpoint', JSON.stringify(snapshot()));
  assert.deepEqual(snapshot(), { busy: true, talkDisabled: false, unlockedHeartDisabled: false, lockedHeartDisabled: true });
  await settle(); ui.update(); console.log('after checkpoint', JSON.stringify(snapshot()));
  assert.deepEqual(snapshot(), { busy: false, talkDisabled: false, unlockedHeartDisabled: false, lockedHeartDisabled: true });
  document.querySelector('[data-do="touch"]').click();
  document.querySelector('[data-region="hand"]').click();await settle();await settle();
  assert.deepEqual(touches,['mara'],'successful touch triggers one voice cue');
  document.querySelector('[data-region="hand"]').click();await settle();
  assert.deepEqual(touches,['mara'],'blocked repeated tap does not trigger a voice');
} finally {
  ui?.destroy(); await session?.close(); await server.close(); dom.window.close();
}
