import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { JSDOM } from 'jsdom';
import { createFeatureProbe } from '../src/feature-probes';
import { ilyraFirstTarget, recommendIlyraPosition } from '../src/hero-controls';
import { ILYRA, ilyraCell } from '../src/ilyra';
import { setLanguage } from '../src/i18n';
import { syncVolleyAction, volleyAction } from '../src/volley-action';

const earned = JSON.parse(readFileSync(new URL('../../../artifacts/idle-bastion/acceptance/wave-rework-v2/earned-balanced-late.json', import.meta.url), 'utf8'));
test('countdown describes the actual cooldown without changing battle or accepting another cast', () => {
  setLanguage('de');
  const b = createFeatureProbe('heroes', earned), before = b.snapshot();
  const action = volleyAction(b, false, false);
  assert.equal(action.state, 'cooldown'); assert.equal(action.disabled, true);
  assert.equal(action.status, `Bereit in ${Math.ceil(b.ilyra!.cooldown)} s`);
  assert.equal(action.progress, 1 - b.ilyra!.cooldown / ILYRA.cooldown);
  assert.equal(ilyraFirstTarget(b), undefined); assert.deepEqual(b.snapshot(), before);
  b.update(.5); assert.ok(volleyAction(b, false, false).progress > action.progress);
  const paused = volleyAction(b, false, true);
  assert.equal(paused.state, 'paused'); assert.match(paused.status, /^Pause · noch/); assert.equal(paused.disabled, true);
});
test('position, walking, ready and casting labels follow the real first-volley flow', () => {
  const b = createFeatureProbe('ilyra', earned);
  assert.equal(volleyAction(b, false, false).state, 'position');
  assert.ok(b.moveIlyraTo(ilyraCell(recommendIlyraPosition(b)!)));
  assert.equal(volleyAction(b, false, false).state, 'moving');
  for (let i = 0; i < 4000 && !ilyraFirstTarget(b); i++) b.update(.025);
  const target = ilyraFirstTarget(b); assert.ok(target);
  assert.equal(volleyAction(b, false, false).state, 'ready');
  assert.equal(volleyAction(b, false, false).disabled, false);
  assert.ok(b.castIlyraAt(target));
  assert.equal(volleyAction(b, false, false).state, 'casting');
  assert.equal(volleyAction(b, false, false).disabled, true);
});
test('zero cooldown alone cannot enable aiming without a valid target or while paused', () => {
  setLanguage('en');
  const b = createFeatureProbe('heroes', earned);
  // Explicit UI boundary fixture: ready timer, but the enemies are out of range.
  b.ilyra!.cooldown = 0;
  for (const enemy of b.enemies) { enemy.x = b.layout.bounds.width - 1; enemy.y = b.layout.bounds.height - 1; }
  assert.equal(volleyAction(b, false, false).state, 'waiting');
  assert.equal(volleyAction(b, false, false).status, 'No enemies in range');
  assert.equal(volleyAction(b, false, false).disabled, true);
  b.enemies.length = 0;
  assert.equal(volleyAction(b, false, false).status, 'Waiting for enemies');
  assert.equal(volleyAction(b, false, true).status, 'Paused · resume battle');
  assert.equal(volleyAction(b, true, false).state, 'locked');
});
test('map and menu keep identical readable status, native disabled semantics and stable DOM in both languages', () => {
  const dom = new JSDOM(readFileSync(new URL('../index.html', import.meta.url), 'utf8'));
  const b = createFeatureProbe('heroes', earned);
  const buttons = ['hero-aim', 'aim-ilyra'].map(id => dom.window.document.getElementById(id) as unknown as HTMLButtonElement);
  for (const button of buttons) syncVolleyAction(button, b, false, false);
  const labels = buttons.map(button => button.querySelector('.volley-status'));
  for (const language of ['de', 'en'] as const) {
    setLanguage(language);
    for (const button of buttons) syncVolleyAction(button, b, false, false);
    assert.equal(buttons[0].getAttribute('aria-label'), buttons[1].getAttribute('aria-label'));
    assert.match(buttons[0].getAttribute('aria-label')!, language === 'de' ? /Bereit in \d+ s/ : /Ready in \d+ s/);
    assert.equal(buttons[0].disabled, true); assert.equal(buttons[1].disabled, true);
    assert.equal(buttons[0].querySelector('[aria-live]'), null);
    assert.equal(buttons[0].querySelector('.spell-number')!.textContent,String(Math.ceil(b.ilyra!.cooldown)));
    assert.equal(buttons[0].querySelector('.volley-meter'),null);
  }
  for (let i = 0; i < 6000 && !ilyraFirstTarget(b); i++) b.update(.025);
  assert.ok(ilyraFirstTarget(b));
  buttons.forEach((button, i) => {
    syncVolleyAction(button, b, false, false);
    assert.equal(button.disabled, false); assert.equal(button.dataset.state, 'ready');
    assert.equal(button.querySelector('.volley-status'), labels[i]);
    assert.match(button.getAttribute('aria-label')!, /Ready · choose a target/);
  });
  dom.window.close();
});
