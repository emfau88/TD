import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { JSDOM } from 'jsdom';
import { IDBFactory } from 'fake-indexeddb';
import { BattleSession } from '../src/battle-session';
import { openBattleStore } from '../src/save-store';
import { beginAbsence, createOfflineState, reserveOffline, WAREHOUSE_OFFLINE } from '../src/offline';
import { MARA_OFFLINE_WELCOME, updateOfflineWelcome } from '../src/offline-welcome';
import { setLanguage } from '../src/i18n';

const { snapshot, proof } = JSON.parse(readFileSync(new URL('../../../artifacts/idle-bastion/acceptance/early-balance-release/baseline/legacy-fixtures.json', import.meta.url), 'utf8')).departure;
const units = (b: { gold: number; goldRemainderUnits: number }) => b.gold * 1000 + b.goldRemainderUnits;
async function fixture(positive: boolean, paused = false, elapsed = 30000) {
  const factory = new IDBFactory(); let now = 1000 + elapsed;
  const offline = reserveOffline(beginAbsence(createOfflineState(1000), 1000, positive ? proof : null, paused, WAREHOUSE_OFFLINE), now);
  let store = await openBattleStore(factory, 'welcome', () => now);
  await store.save(snapshot, paused, 0, { offline });
  const open = async () => {
    store = await openBattleStore(factory, 'welcome', () => now);
    return BattleSession.open(store, { now: () => now, locks: null });
  };
  return { factory, offline, open, store, advanceClock: (ms: number) => { now += ms; }, clock: () => now };
}

test('first positive return persists the greeting before claim; unclaimed reload never repeats or changes its gold', async () => {
  const f = await fixture(true), first = await f.open();
  assert.equal(first.showMaraOfflineWelcome, true);
  assert.equal(first.inputBusy, false);
  assert.equal(units(first.battle), units(snapshot));
  assert.deepEqual(first.offline, f.offline);
  const saved = await f.store.load(); assert.equal(saved.kind, 'valid');
  if (saved.kind === 'valid') assert.equal(saved.save.maraOfflineWelcomeSeen, true);
  await first.close();
  const reloaded = await f.open();
  assert.equal(reloaded.showMaraOfflineWelcome, false);
  assert.deepEqual(reloaded.pendingReward, f.offline.pendingReward);
  assert.equal(await reloaded.claimOffline(), true);
  assert.equal(units(reloaded.battle), units(snapshot) + f.offline.pendingReward!.amountUnits);
  assert.equal(await reloaded.claimOffline(), false);
  await reloaded.resumeActive(); await reloaded.close();
  f.advanceClock(30000);
  const later = await f.open();
  assert.ok(later.pendingReward!.amountUnits > 0);
  assert.equal(later.showMaraOfflineWelcome, false);
  await later.close(); f.store.close();
});

test('zero, paused and sub-gold returns: zero does not consume it; even a positive fraction qualifies', async () => {
  for (const [positive, paused, elapsed] of [[false, false, 30000], [true, true, 30000], [true, false, 1]] as const) {
    const f = await fixture(positive, paused, elapsed), session = await f.open();
    const eligible = session.pendingReward!.amountUnits > 0;
    assert.equal(session.showMaraOfflineWelcome, eligible);
    if (elapsed === 1) assert.ok(session.pendingReward!.amountUnits > 0 && session.pendingReward!.amountUnits < 1000);
    await session.claimOffline(); await session.resumeActive(); await session.close();
    const stored = await f.store.load(); assert.equal(stored.kind, 'valid');
    if (stored.kind === 'valid') {
      assert.equal(stored.save.maraOfflineWelcomeSeen === true, eligible);
      // A subsequent positive return in this SAME save is still eligible after zero.
      const offline = reserveOffline(beginAbsence(createOfflineState(1000), 1000, proof, false, WAREHOUSE_OFFLINE), f.clock());
      const writer = await f.store.acquireWriter('test-positive-return'); assert.ok(writer);
      await f.store.save(stored.save.battle, false, stored.save.revision, { offline, writer });
      await f.store.releaseWriter(writer);
      const next = await f.open(); assert.equal(next.showMaraOfflineWelcome, !eligible); await next.close();
    }
    f.store.close();
  }
});

test('a second absence within the same session cannot reuse the first visible greeting', async () => {
  const f = await fixture(true), session = await f.open();
  assert.equal(session.showMaraOfflineWelcome, true);
  await session.claimOffline(); await session.resumeActive();
  assert.equal(session.showMaraOfflineWelcome, false);
  f.advanceClock(3000); session.advance(3);
  for (let i = 0; i < 10 && session.busy; i++) await new Promise(resolve => setImmediate(resolve));
  await session.flush();
  assert.equal(session.awaitingResume, true); assert.ok(session.pendingReward!.amountUnits > 0);
  assert.equal(session.showMaraOfflineWelcome, false);
  await session.close(); f.store.close();
});

test('failed greeting persistence leaves the old receipt and eligibility intact', async () => {
  const f = await fixture(true);
  const before = await f.store.load();
  const failing = { ...f.store, save: async () => { throw new Error('write rejected'); } };
  await assert.rejects(BattleSession.open(failing, { now: f.clock, locks: null }), /write rejected/);
  assert.deepEqual(await f.store.load(), before);
  const retry = await f.open(); assert.equal(retry.showMaraOfflineWelcome, true);
  await retry.close(); f.store.close();
});

test('return greeting uses DE/EN, hides for ineligible saves, and adds no interaction gate', () => {
  const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
  const dom = new JSDOM(html), container = dom.window.document.getElementById('return-mara')!;
  const claim = dom.window.document.getElementById('claim-offline') as HTMLButtonElement;
  try {
    updateOfflineWelcome(container, false, 'existing-portrait.webp');
    assert.equal(container.hidden, true); assert.equal(container.querySelector('img')!.hasAttribute('src'), false);
    setLanguage('de'); updateOfflineWelcome(container, true, 'existing-portrait.webp');
    assert.equal(container.querySelector('p')!.textContent, MARA_OFFLINE_WELCOME);
    setLanguage('en'); updateOfflineWelcome(container, true, 'existing-portrait.webp');
    assert.equal(container.querySelector('p')!.textContent, "There you are! I've been guarding your gold. I only counted it three times. All right, four.");
    assert.equal(container.querySelectorAll('button').length, 0); assert.equal(claim.disabled, false);
    assert.equal(container.querySelector('img')!.getAttribute('src'), 'existing-portrait.webp');
    updateOfflineWelcome(container, false, 'existing-portrait.webp'); assert.equal(container.hidden, true);
    const icon = dom.window.document.querySelector<HTMLLinkElement>('link[rel="icon"]')!;
    assert.equal(icon.getAttribute('href'), '../../public/ui/spire-emblem.png');
    assert.ok(readFileSync(new URL('../../../public/ui/spire-emblem.png', import.meta.url)).length > 0);
  } finally { setLanguage('en'); dom.window.close(); }
});
