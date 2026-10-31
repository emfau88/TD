import test from 'node:test';
import assert from 'node:assert/strict';
import { IDBFactory } from 'fake-indexeddb';
import { gameDatabase } from '../src/save-namespace';
import { openBattleStore } from '../src/save-store';
import { IdleBattle } from '../src/battle';
import { legacyFixtures } from './legacy-fixtures';

test('production preserves original main and probe names; preview remains isolated', () => {
  for (const probe of [undefined, null, '', '../bad', 'UPPER', 'a'.repeat(61)]) {
    assert.equal(gameDatabase(false, probe), 'spire-idle-bastion');
    assert.equal(gameDatabase(true, probe), 'spire-idle-bastion-tower-evolution');
  }
  for (const probe of ['a', 'a'.repeat(60), 'old-2026-10-21', 'tower-arena-old']) {
    assert.equal(gameDatabase(false, probe), `spire-idle-bastion-probe-${probe}`);
    assert.equal(gameDatabase(true, probe), `spire-idle-bastion-tower-evolution-${probe}`);
  }
});

test('existing historical main/probe saves survive boot selection and a persisted reload without crossing namespaces', async () => {
  const factory = new IDBFactory(), fixtures = legacyFixtures();
  for (const [probe, old] of [[undefined, fixtures.store.schema1], ['old-bookmark', fixtures.store.schema2]] as const) {
    const originalName = probe ? `spire-idle-bastion-probe-${probe}` : 'spire-idle-bastion';
    const db = await new Promise<IDBDatabase>((resolve, reject) => {
      const req = factory.open(originalName, 1);
      req.onupgradeneeded = () => req.result.createObjectStore('saves');
      req.onsuccess = () => resolve(req.result); req.onerror = () => reject(req.error);
    });
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction('saves', 'readwrite');
      tx.objectStore('saves').put({schemaVersion: 1, revision: 17, writtenAt: 10_000, paused: true, battle: old}, 'default');
      tx.oncomplete = () => resolve(); tx.onerror = () => reject(tx.error);
    }); db.close();
    const store = await openBattleStore(factory, gameDatabase(false, probe));
    const loaded = await store.load(); assert.equal(loaded.kind, 'valid');
    if (loaded.kind !== 'valid') assert.fail('Historical save must remain reachable');
    assert.deepEqual(loaded.save.battle, IdleBattle.restore(old)!.snapshot());
    const saved = await store.save(loaded.save.battle, loaded.save.paused, loaded.save.revision, {offline: loaded.save.offline});
    store.close();
    const reloaded = await openBattleStore(factory, gameDatabase(false, probe));
    assert.deepEqual(await reloaded.load(), {kind: 'valid', save: saved}); reloaded.close();
    const preview = await openBattleStore(factory, gameDatabase(true, probe));
    assert.deepEqual(await preview.load(), {kind: 'empty'});
    await preview.save(IdleBattle.newGame().snapshot(), true, 0); preview.close();
    const unchanged = await openBattleStore(factory, originalName);
    assert.deepEqual(await unchanged.load(), {kind: 'valid', save: saved}); unchanged.close();
  }
});
