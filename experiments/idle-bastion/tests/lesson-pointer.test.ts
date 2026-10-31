import test, { type TestContext } from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import { LessonPointer } from '../src/lesson-pointer';

function setup(t: TestContext) {
  const dom = new JSDOM('<div id="lesson-pointer" hidden><svg></svg></div><button id="next">Continue</button><button id="tower">Starter tower</button>');
  const values = { document: dom.window.document, HTMLButtonElement: dom.window.HTMLButtonElement, innerWidth: 390, innerHeight: 844 };
  const old = Object.entries(values).map(([key]) => [key, Object.getOwnPropertyDescriptor(globalThis, key)] as const);
  for (const [key, value] of Object.entries(values)) Object.defineProperty(globalThis, key, { configurable: true, value });
  t.after(() => { for (const [key, descriptor] of old) if (descriptor) Object.defineProperty(globalThis, key, descriptor); else Reflect.deleteProperty(globalThis, key); dom.window.close(); });
  dom.window.HTMLElement.prototype.scrollIntoView = () => {};
  const button = (id: string) => dom.window.document.getElementById(id) as HTMLButtonElement;
  return { pointer: new LessonPointer(), next: button('next'), tower: button('tower'), arrow: button('lesson-pointer') };
}

test('informational map cue keeps the real Continue action highlighted, including during camera travel', t => {
  const { pointer, next, arrow } = setup(t);
  pointer.show({ x: 190, y: 200 }, 'intro-core', next);
  assert.equal(arrow.hidden, false); assert.ok(next.classList.contains('lesson-click-target'));
  assert.equal(arrow.querySelector('span'), null);
  pointer.show(undefined, 'intro-spawn', next);
  assert.equal(arrow.hidden, true); assert.ok(next.classList.contains('lesson-click-target'));
  pointer.show({ x: -30, y: 200 }, 'intro-spawn', next);
  assert.equal(arrow.hidden, true); assert.ok(next.classList.contains('lesson-click-target'));
});

test('tower choice replaces the intro cue and placement clears the button cue without adding a halo', t => {
  const { pointer, next, tower, arrow } = setup(t);
  pointer.show({ x: 190, y: 200 }, 'intro-core', next);
  pointer.show(tower);
  assert.equal(arrow.hidden, true); assert.equal(next.classList.contains('lesson-click-target'), false);
  assert.ok(tower.classList.contains('lesson-click-target'));
  pointer.show({ x: 150, y: 250 }, 'starter');
  assert.equal(tower.classList.contains('lesson-click-target'), false); assert.equal(arrow.hidden, false);
  pointer.show(); assert.equal(arrow.hidden, true);
});

test('saving, disabled or hidden actions lose their click cue', t => {
  const { pointer, next, arrow } = setup(t);
  pointer.show(next); next.disabled = true; pointer.show(next);
  assert.equal(next.classList.contains('lesson-click-target'), false); assert.equal(arrow.hidden, true);
  next.disabled = false; pointer.show(next); next.hidden = true; pointer.show(undefined, '', next);
  assert.equal(next.classList.contains('lesson-click-target'), false);
});
