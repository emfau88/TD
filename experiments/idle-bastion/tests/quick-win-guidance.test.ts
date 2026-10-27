import test from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import { QuickWinGuidance, quickWinNotice, cannonIsNew, workshopGoldMissing, type QuickWinSnapshot, type QuickWinPreferences } from '../src/quick-win-guidance';
import { setLanguage } from '../src/i18n';

const state = (overrides: Partial<QuickWinSnapshot> = {}): QuickWinSnapshot => ({ cannonUnlocked: true, cannonBuilt: false, workshopAvailable: true, levelSix: false, gold: 800, tutorialSeen: 0, ...overrides });
const preferences = (overrides: Partial<QuickWinPreferences> = {}): QuickWinPreferences => ({ cannonDismissed: false, cannonInspected: false, workshopDismissed: false, ...overrides });

test('quick-win notices follow real unlock and level-six state without changing either condition', () => {
  assert.equal(quickWinNotice(state({ cannonUnlocked: false }), preferences()), undefined);
  assert.equal(quickWinNotice(state(), preferences()), 'cannon');
  assert.equal(quickWinNotice(state({ levelSix: true }), preferences()), 'workshop');
  assert.equal(quickWinNotice(state({ levelSix: true, workshopAvailable: false }), preferences({ cannonInspected: true })), undefined);
  assert.equal(quickWinNotice(state({ levelSix: true, tutorialSeen: 1 << 16 }), preferences({ cannonInspected: true })), undefined, 'already-read old workshop hint remains acknowledged');
  assert.equal(workshopGoldMissing(800), 400); assert.equal(workshopGoldMissing(1199.9), 1);
  assert.equal(workshopGoldMissing(1200), 0); assert.equal(workshopGoldMissing(1500), 0);
});

test('dismissing cannon explanation retains NEW until inspection or an existing cannon', () => {
  const dismissed = preferences({ cannonDismissed: true });
  assert.equal(quickWinNotice(state(), dismissed), undefined);
  assert.equal(cannonIsNew(state(), dismissed), true);
  assert.equal(cannonIsNew(state({ tutorialSeen: 1 << 8 }), preferences()), true, 'old dismissal does not hide the new catalogue entry');
  assert.equal(cannonIsNew(state(), preferences({ cannonInspected: true })), false);
  assert.equal(cannonIsNew(state({ cannonBuilt: true }), preferences()), false);
});

test('UI dismissals persist per slot, keep catalogue reminder and translate live content', () => {
  const dom = new JSDOM('<div id="app"></div><button id="pick-cannon"></button><button id="tower-tab"></button><p id="action-hint"></p>', { url: 'https://example.test' });
  const documentDescriptor = Object.getOwnPropertyDescriptor(globalThis, 'document'), storageDescriptor = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
  Object.defineProperty(globalThis, 'document', { configurable: true, value: dom.window.document });
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: dom.window.localStorage });
  const abort = new dom.window.AbortController(), actions: string[] = [], dismissed: string[] = [];
  try {
    setLanguage('en');
    const ui = new QuickWinGuidance('slot-a', { action: action => actions.push(action), dismissed: action => dismissed.push(action) }, abort.signal);
    const view = { suppressed: false, towerAtCap: false };
    assert.equal(ui.update(state(), view), true);
    assert.match(dom.window.document.getElementById('quick-win-copy')!.textContent!, /Area damage.*Frost/);
    (dom.window.document.getElementById('quick-win-dismiss') as HTMLButtonElement).click();
    assert.deepEqual(dismissed, ['cannon']);
    ui.update(state(), view);
    assert.equal(ui.element.hidden, true);
    assert.equal(dom.window.document.querySelector<HTMLElement>('#pick-cannon .quick-win-new')!.hidden, false);
    const saved = dom.window.localStorage.getItem('spire-ui-quick-wins-v1:slot-a');
    assert.equal(JSON.parse(saved!).cannonDismissed, true);
    assert.equal(dom.window.localStorage.getItem('spire-ui-quick-wins-v1:slot-b'), null);
    ui.update(state({ levelSix: true }), view);
    assert.equal(ui.element.hidden, false);
    assert.match(dom.window.document.getElementById('quick-win-cost')!.textContent!, /1,200.*400/);
    setLanguage('de'); ui.update(state({ levelSix: true }), view);
    assert.match(dom.window.document.getElementById('quick-win-copy')!.textContent!, /Turmlevel ab 7/);
    assert.match(dom.window.document.getElementById('quick-win-cost')!.textContent!, /1\.200.*400/);
    (dom.window.document.getElementById('quick-win-open') as HTMLButtonElement).click();
    assert.deepEqual(actions, ['workshop']);
    assert.equal(JSON.parse(dom.window.localStorage.getItem('spire-ui-quick-wins-v1:slot-a')!).workshopDismissed, true);
    assert.equal(ui.update(state({ levelSix: true }), view), false);
    assert.equal(ui.update(state({ levelSix: true }), { suppressed: false, towerAtCap: true }), false);
    assert.equal(dom.window.document.getElementById('tower-workshop-link')!.hidden, false, 'tower still offers the workshop after dismissing its one-time notice');
    ui.inspectCannon(); ui.update(state(), view);
    assert.equal(dom.window.document.querySelector<HTMLElement>('#pick-cannon .quick-win-new')!.hidden, true);
    assert.equal(ui.update(state({ levelSix: true }), { suppressed: true, towerAtCap: false }), false);
  } finally {
    abort.abort(); setLanguage('en'); dom.window.close();
    if (documentDescriptor) Object.defineProperty(globalThis, 'document', documentDescriptor); else Reflect.deleteProperty(globalThis, 'document');
    if (storageDescriptor) Object.defineProperty(globalThis, 'localStorage', storageDescriptor); else Reflect.deleteProperty(globalThis, 'localStorage');
  }
});

test('blocked UI preference storage keeps dismissals in memory without affecting the game', () => {
  const dom = new JSDOM('<div id="app"></div><button id="pick-cannon"></button><button id="tower-tab"></button><p id="action-hint"></p>');
  const documentDescriptor = Object.getOwnPropertyDescriptor(globalThis, 'document'), storageDescriptor = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
  Object.defineProperty(globalThis, 'document', { configurable: true, value: dom.window.document });
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, get() { throw Error('blocked'); } });
  const abort = new dom.window.AbortController();
  try {
    const ui = new QuickWinGuidance('temporary', { action() {}, dismissed() {} }, abort.signal);
    const value = state(), before = structuredClone(value), view = { suppressed: false, towerAtCap: false };
    ui.update(value, view); (dom.window.document.getElementById('quick-win-dismiss') as HTMLButtonElement).click();
    assert.equal(ui.update(value, view), false); assert.deepEqual(value, before);
    ui.inspectCannon(); ui.update(value, view);
    assert.equal(dom.window.document.querySelector<HTMLElement>('#pick-cannon .quick-win-new')!.hidden, true);
  } finally {
    abort.abort(); dom.window.close();
    if (documentDescriptor) Object.defineProperty(globalThis, 'document', documentDescriptor); else Reflect.deleteProperty(globalThis, 'document');
    if (storageDescriptor) Object.defineProperty(globalThis, 'localStorage', storageDescriptor); else Reflect.deleteProperty(globalThis, 'localStorage');
  }
});


test('optional workshop notice waits for tutorial completion without consuming its preference', () => {
  const value = state({ workshopAvailable:true, levelSix:true, cannonUnlocked:true, cannonBuilt:false });
  const preferences = { cannonDismissed:false, cannonInspected:false, workshopDismissed:false };
  const before = structuredClone(preferences);
  assert.equal(quickWinNotice(value, preferences, false), 'cannon');
  assert.deepEqual(preferences, before);
  assert.equal(quickWinNotice(value, preferences), 'workshop');
});
