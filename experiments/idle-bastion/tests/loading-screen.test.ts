import test, { type TestContext } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { JSDOM } from 'jsdom';
import { LoadingScreen } from '../src/loading-screen';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
function fixture(t: TestContext, options: { timeoutMs?: number; onTimeout?: () => void } = {}) {
  const dom = new JSDOM(html, { pretendToBeVisual: true, url: 'http://localhost/' });
  const host = dom.window.document.getElementById('boot-screen')!;
  const app = dom.window.document.getElementById('app')!;
  const screen = new LoadingScreen(host, app, options);
  const get = <T extends HTMLElement = HTMLElement>(id: string) => host.querySelector<T>(`#${id}`)!;
  t.after(() => { screen.destroy(); dom.window.close(); });
  return { dom, host, app, screen, get, progress: get<HTMLProgressElement>('boot-progress') };
}

test('startup shows actual resource counts and leaves non-resource phases indeterminate', t => {
  const { screen, host, app, get, progress } = fixture(t);
  screen.begin('modules', 'en');
  assert.equal(screen.visible, true); assert.equal(app.inert, true);
  assert.equal(progress.hasAttribute('value'), false);
  assert.equal(host.getAttribute('aria-busy'), 'true');
  screen.begin('assets'); screen.progress(3, 10);
  assert.equal(progress.value / progress.max, 0.3);
  assert.match(get('boot-count').textContent!, /3\s*\/\s*10/);
  assert.match(progress.getAttribute('aria-valuetext')!, /3\s*\/\s*10/);
  for (const phase of ['save', 'render'] as const) {
    screen.begin(phase);
    assert.equal(progress.hasAttribute('value'), false, `${phase} has no invented percentage`);
    assert.equal(get('boot-count').textContent, '');
  }
});

test('unknown resource totals and non-finite counts never become fictitious progress', t => {
  const { screen, progress } = fixture(t);
  screen.begin('assets'); screen.progress(0, 0);
  assert.equal(progress.hasAttribute('value'), false);
  screen.progress(3, 10);
  for (const [completed, total] of [[NaN, 10], [Infinity, 10], [3, NaN], [3, Infinity]]) {
    screen.progress(completed!, total!);
    assert.equal(progress.value, 3); assert.equal(progress.max, 10);
  }
  screen.progress(20, 10); assert.equal(progress.value, 10);
});

test('startup failure exposes retry and saved-game recovery without activating either automatically', t => {
  const { screen, host, get, progress } = fixture(t);
  let retries = 0, recoveries = 0;
  screen.begin('assets', 'de'); screen.progress(4, 10);
  screen.fail('Grafik fehlt.', () => { retries++; screen.begin('save'); }, () => { recoveries++; screen.dismiss(); });
  assert.equal(screen.visible, true); assert.equal(host.dataset.phase, 'error');
  assert.equal(host.getAttribute('aria-busy'), 'false');
  assert.equal(get('boot-error').hidden, false); assert.equal(get('boot-error').textContent, 'Grafik fehlt.');
  assert.equal(get('boot-retry').hidden, false); assert.equal(get('boot-recovery').hidden, false);
  assert.equal(progress.hasAttribute('value'), false);
  assert.equal(retries, 0); assert.equal(recoveries, 0);
  get<HTMLButtonElement>('boot-retry').click(); assert.equal(retries, 1);
  assert.equal(host.dataset.phase, 'save'); assert.equal(get('boot-error').hidden, true);
  screen.fail('Speicher prüfen.', () => {}, () => { recoveries++; screen.dismiss(); });
  get<HTMLButtonElement>('boot-recovery').click();
  assert.equal(recoveries, 1); assert.equal(screen.visible, false);
});

test('ready, dismissal and destruction release input and cancel startup timeouts', t => {
  t.mock.timers.enable({ apis: ['setTimeout'] });
  let timeouts = 0, retries = 0;
  const { screen, app, host, get } = fixture(t, { timeoutMs: 50, onTimeout: () => timeouts++ });
  screen.begin('render'); screen.complete(); t.mock.timers.tick(100);
  assert.equal(screen.visible, false); assert.equal(app.inert, false);
  assert.equal(host.dataset.phase, 'ready'); assert.equal(timeouts, 0);
  screen.begin('save'); screen.dismiss(); t.mock.timers.tick(100);
  assert.equal(app.inert, false); assert.equal(timeouts, 0);
  screen.begin('assets'); screen.fail('Fehler.', () => retries++);
  screen.destroy(); get<HTMLButtonElement>('boot-retry').click(); t.mock.timers.tick(100);
  assert.equal(screen.visible, false); assert.equal(app.inert, false);
  assert.equal(retries, 0); assert.equal(timeouts, 0);
});

test('watchdog follows real activity, fails once, and defers while the document is hidden', t => {
  t.mock.timers.enable({ apis: ['setTimeout'] });
  let timeouts = 0, hidden = false;
  const { screen, host, get, dom } = fixture(t, { timeoutMs: 50, onTimeout: () => timeouts++ });
  Object.defineProperty(dom.window.document, 'hidden', { configurable: true, get: () => hidden });
  screen.begin('assets'); t.mock.timers.tick(40); screen.progress(1, 10);
  t.mock.timers.tick(40); assert.equal(timeouts, 0);
  t.mock.timers.tick(10); assert.equal(timeouts, 1);
  assert.equal(host.dataset.phase, 'error'); assert.equal(get('boot-retry').hidden, false);
  t.mock.timers.tick(500); assert.equal(timeouts, 1);
  screen.begin('save'); hidden = true; t.mock.timers.tick(50);
  assert.equal(timeouts, 1); assert.equal(host.dataset.phase, 'save');
  hidden = false; t.mock.timers.tick(50); assert.equal(timeouts, 2);
});

test('startup phase, resource count and recovery controls use the selected English or German copy', t => {
  const { screen, get } = fixture(t);
  screen.begin('assets', 'de'); screen.progress(2, 5);
  assert.equal(get('boot-phase').textContent, 'Verteidigung wird vorbereitet …');
  assert.equal(get('boot-count').textContent, '2 / 5 Spielgrafiken geladen');
  assert.equal(get('boot-retry').textContent, 'Erneut versuchen');
  assert.equal(get('boot-recovery').textContent, 'Spielstand prüfen');
  screen.begin('assets', 'en'); screen.progress(2, 5);
  assert.equal(get('boot-phase').textContent, 'Preparing your defenses…');
  assert.equal(get('boot-count').textContent, '2 / 5 artwork files loaded');
  assert.equal(get('boot-retry').textContent, 'Try again');
  assert.equal(get('boot-recovery').textContent, 'Check saved game');
});

test('one loading joke persists through progress, translates, and gives errors the floor', t => {
  t.mock.method(Math, 'random', () => .4);
  const { screen, get } = fixture(t);
  screen.begin('modules', 'en');
  const joke = get('boot-quip').textContent;
  assert.equal(joke, "Mara says it's a feature. Ilyra disagrees.");
  screen.begin('save'); screen.progress(1, 10); screen.progress(9, 10);
  assert.equal(get('boot-quip').textContent, joke);
  screen.begin('render', 'de');
  assert.equal(get('boot-quip').textContent, 'Mara nennt es ein Feature. Ilyra sieht das anders.');
  screen.fail('Verbindung unterbrochen.');
  assert.equal(get('boot-quip').hidden, true);
  screen.begin('modules');
  assert.equal(get('boot-quip').hidden, false);
});
