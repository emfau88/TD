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
  ui = new TavernUI({ session: () => session, navigate() {} });
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

  // Read-only diagnosis of the existing flicker: real coordinator + real UI.
  // Deliberately not a regression assertion requiring the bug to remain present.
  document.querySelector('[data-do="back"]').click();
  document.querySelector('[data-do="mara"]').click(); await settle();
  const snapshot = () => ({ busy: session.busy,
    talkDisabled: document.querySelector('[data-action="talk"]').disabled,
    unlockedHeartDisabled: document.querySelector('[data-moment="1"]').disabled,
    lockedHeartDisabled: document.querySelector('[data-moment="2"]').disabled });
  ui.update(); console.log('before checkpoint', JSON.stringify(snapshot()));
  for (let i = 0; i < 4; i++) { session.advance(.25); if (session.busy) break; }
  ui.update(); console.log('during checkpoint', JSON.stringify(snapshot()));
  await settle(); ui.update(); console.log('after checkpoint', JSON.stringify(snapshot()));
} finally {
  ui?.destroy(); await session?.close(); await server.close(); dom.window.close();
}
