import assert from 'node:assert/strict';
import test from 'node:test';
import { IDBFactory } from 'fake-indexeddb';
import { IdleBattle } from '../src/battle';
import { beginAbsence, claimOffline, createOfflineState, reserveOffline } from '../src/offline';
import { BattleSession } from '../src/battle-session';
import {
  openBattleStore, SaveConflictError, SaveUnsupportedError, SaveValidationError,
  type SaveEnvelope,
} from '../src/save-store';

const DB_NAME = 'spire-idle-store-test';

function rawDatabase(factory: globalThis.IDBFactory, name = DB_NAME, version = 1): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = factory.open(name, version);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains('saves')) request.result.createObjectStore('saves');
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}
async function rawRead(factory: globalThis.IDBFactory, key: string, name = DB_NAME): Promise<unknown> {
  const db = await rawDatabase(factory, name);
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('saves', 'readonly');
    const request = transaction.objectStore('saves').get(key);
    transaction.oncomplete = () => { db.close(); resolve(request.result); };
    transaction.onabort = () => { db.close(); reject(transaction.error); };
  });
}
async function rawWrite(factory: globalThis.IDBFactory, key: string, value: unknown, name = DB_NAME): Promise<void> {
  const db = await rawDatabase(factory, name);
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('saves', 'readwrite');
    transaction.objectStore('saves').put(value, key);
    transaction.oncomplete = () => { db.close(); resolve(); };
    transaction.onabort = () => { db.close(); reject(transaction.error); };
  });
}
function fixture(): IdleBattle {
  const battle = new IdleBattle();
  battle.build('tower-02');
  battle.update(0.4);
  return battle;
}
function preMaraSnapshot(battle: IdleBattle, schemaVersion: 1 | 2): Record<string, unknown> {
  return {
    ...Object.fromEntries(Object.entries(battle.snapshot()).filter(([key]) => key !== 'mara')),
    schemaVersion, layoutVersion: 1, rulesVersion: 1,
  };
}

test('isolated native IndexedDB starts empty and restores a committed battle and explicit pause', async () => {
  const factory = new IDBFactory();
  const store = await openBattleStore(factory, DB_NAME);
  assert.deepEqual(await store.load(), { kind: 'empty' });
  const battle = fixture();
  const before = Date.now();
  const saved = await store.save(battle.snapshot(), true, 0);
  assert.equal(saved.schemaVersion, 2);
  assert.equal(saved.revision, 1);
  assert.equal(saved.paused, true);
  assert.ok(saved.writtenAt >= before && saved.writtenAt <= Date.now());
  store.close();
  const reopened = await openBattleStore(factory, DB_NAME);
  const result = await reopened.load();
  assert.equal(result.kind, 'valid');
  if (result.kind !== 'valid') assert.fail('Committed save must load.');
  assert.deepEqual(result.save, saved);
  const restored = IdleBattle.restore(result.save.battle);
  assert.ok(restored);
  assert.deepEqual(restored.snapshot(), battle.snapshot());
  assert.deepEqual(restored.drainEvents(), []);
  assert.equal(await rawRead(factory, 'backup'), undefined);
  reopened.close();
});

test('each commit retains the last valid predecessor and advances revision monotonically', async () => {
  const factory = new IDBFactory();
  const store = await openBattleStore(factory, DB_NAME);
  const battle = fixture();
  const first = await store.save(battle.snapshot(), false, 0);
  battle.update(1);
  const second = await store.save(battle.snapshot(), true, first.revision);
  assert.deepEqual(await rawRead(factory, 'backup'), first);
  battle.update(1);
  const third = await store.save(battle.snapshot(), false, second.revision);
  assert.equal(third.revision, 3);
  assert.deepEqual(await rawRead(factory, 'backup'), second);
  assert.deepEqual(await rawRead(factory, 'default'), third);
  const detached = battle.snapshot();
  const pending = store.save(detached, false, third.revision);
  detached.gold = -1;
  const fourth = await pending;
  assert.notEqual(fourth.battle.gold, -1, 'The asynchronously written snapshot is detached from its caller.');
  store.close();
});

test('two connections racing the same revision have exactly one atomic CAS winner', async () => {
  const factory = new IDBFactory();
  const a = await openBattleStore(factory, DB_NAME);
  const b = await openBattleStore(factory, DB_NAME);
  const snapshot = fixture().snapshot();
  const first = await a.save(snapshot, false, 0);
  const results = await Promise.allSettled([
    a.save(snapshot, false, first.revision), b.save(snapshot, true, first.revision),
  ]);
  const wins = results.filter(result => result.status === 'fulfilled');
  const losses = results.filter(result => result.status === 'rejected');
  assert.equal(wins.length, 1);
  assert.equal(losses.length, 1);
  assert.ok(losses[0].status === 'rejected' && losses[0].reason instanceof SaveConflictError);
  assert.deepEqual(await rawRead(factory, 'backup'), first);
  const current = await a.load();
  assert.equal(current.kind, 'valid');
  if (current.kind !== 'valid') assert.fail('Winner must remain valid.');
  assert.equal(current.save.revision, 2);
  await assert.rejects(a.save(snapshot, false, 0), SaveConflictError);
  assert.equal((await rawRead(factory, 'default') as SaveEnvelope).revision, 2);
  a.close(); b.close();
});

test('invalid new snapshots, pause values and revisions leave primary and backup untouched', async () => {
  const factory = new IDBFactory();
  const store = await openBattleStore(factory, DB_NAME);
  const snapshot = fixture().snapshot();
  const first = await store.save(snapshot, false, 0);
  const invalid = structuredClone(snapshot);
  invalid.gold = -1;
  await assert.rejects(store.save(invalid, false, 1), SaveValidationError);
  await assert.rejects(store.save(snapshot, 'yes' as unknown as boolean, 1), SaveValidationError);
  await assert.rejects(store.save(snapshot, false, -1), SaveValidationError);
  await assert.rejects(store.save(snapshot, false, 1.5), SaveValidationError);
  assert.deepEqual(await rawRead(factory, 'default'), first);
  assert.equal(await rawRead(factory, 'backup'), undefined);
  store.close();
});

test('newer primary schemas never fall back to backup or permit overwrite or recovery', async () => {
  const factory = new IDBFactory();
  const store = await openBattleStore(factory, DB_NAME);
  const snapshot = fixture().snapshot();
  const first = await store.save(snapshot, false, 0);
  await store.save(snapshot, false, 1);
  const future = { schemaVersion: 3, revision: 400, preciousFutureState: ['preserve me'] };
  await rawWrite(factory, 'default', future);
  const result = await store.load();
  assert.equal(result.kind, 'unsupported');
  await assert.rejects(store.save(snapshot, false, 400), SaveUnsupportedError);
  await assert.rejects(store.recoverBackup(), SaveUnsupportedError);
  assert.deepEqual(await rawRead(factory, 'default'), future);
  assert.deepEqual(await rawRead(factory, 'backup'), first);
  assert.equal(await rawRead(factory, 'rejected-default'), undefined);
  store.close();
});

test('a future battle rules version inside schema one is protected as unsupported', async () => {
  const factory = new IDBFactory();
  const store = await openBattleStore(factory, DB_NAME);
  const first = await store.save(fixture().snapshot(), false, 0);
  await store.save(first.battle, false, 1);
  const future = { ...first, revision: 7, battle: { ...first.battle, rulesVersion: 7 } };
  await rawWrite(factory, 'default', future);
  assert.equal((await store.load()).kind, 'unsupported');
  await assert.rejects(store.recoverBackup(), SaveUnsupportedError);
  assert.deepEqual(await rawRead(factory, 'default'), future);
  store.close();
});

test('load never writes: corrupt known primary offers explicit recovery and preserves its raw evidence', async () => {
  const factory = new IDBFactory();
  const store = await openBattleStore(factory, DB_NAME);
  const snapshot = fixture().snapshot();
  const first = await store.save(snapshot, true, 0);
  await store.save(snapshot, false, 1);
  const damaged = { schemaVersion: 1, revision: 9, writtenAt: Date.now(), paused: false, battle: { gold: -8 } };
  await rawWrite(factory, 'default', damaged);
  const result = await store.load();
  assert.equal(result.kind, 'recoverable');
  if (result.kind !== 'recoverable') assert.fail('Valid backup should be offered.');
  assert.deepEqual(result.backup, first);
  assert.ok(result.reason.length > 0);
  assert.deepEqual(await rawRead(factory, 'default'), damaged);
  assert.equal(await rawRead(factory, 'rejected-default'), undefined);
  await assert.rejects(store.save(snapshot, false, 9), SaveValidationError);
  const recovered = await store.recoverBackup();
  assert.equal(recovered.revision, 10, 'Recovery must exceed both backup and any usable raw primary revision.');
  assert.equal(recovered.paused, true);
  assert.deepEqual(recovered.battle, first.battle);
  assert.deepEqual(await rawRead(factory, 'rejected-default'), damaged);
  assert.deepEqual(await rawRead(factory, 'backup'), first);
  assert.deepEqual(await store.load(), { kind: 'valid', save: recovered });
  await assert.rejects(store.recoverBackup(), SaveConflictError);
  store.close();
});

test('recovery rechecks current primary atomically and refuses a newer valid save', async () => {
  const factory = new IDBFactory();
  const a = await openBattleStore(factory, DB_NAME);
  const b = await openBattleStore(factory, DB_NAME);
  const first = await a.save(fixture().snapshot(), false, 0);
  await a.save(first.battle, false, 1);
  await rawWrite(factory, 'default', { schemaVersion: 1, revision: 'broken' });
  assert.equal((await a.load()).kind, 'recoverable');
  const recoveredElsewhere = await b.recoverBackup();
  await assert.rejects(a.recoverBackup(), SaveConflictError);
  assert.deepEqual(await rawRead(factory, 'default'), recoveredElsewhere);
  a.close(); b.close();
});

test('unrecognized corruption or a bad backup is reported and cannot be silently replaced', async () => {
  const factory = new IDBFactory();
  const store = await openBattleStore(factory, DB_NAME);
  const snapshot = fixture().snapshot();
  const first = await store.save(snapshot, false, 0);
  await store.save(snapshot, false, 1);
  await rawWrite(factory, 'default', { arbitrary: 'unrecognized raw value' });
  assert.equal((await store.load()).kind, 'corrupt');
  await assert.rejects(store.save(snapshot, false, 0), SaveValidationError);
  await assert.rejects(store.recoverBackup(), SaveValidationError);
  await rawWrite(factory, 'default', { schemaVersion: 1, revision: -1 });
  await rawWrite(factory, 'backup', { ...first, battle: null });
  assert.equal((await store.load()).kind, 'corrupt');
  await assert.rejects(store.recoverBackup(), SaveValidationError);
  store.close();
});

test('a save aborted after successful put request is never acknowledged and leaves prior data intact', async () => {
  const factory = new IDBFactory();
  let abortAfterPut = false;
  // Instrument this database connection only; do not replace globals or native
  // prototypes. The requests and the eventual abort are real IDB operations.
  const instrumentedFactory = {
    open(name: string, version?: number) {
      const request = factory.open(name, version);
      request.addEventListener('success', () => {
        const db = request.result;
        const nativeTransaction = db.transaction.bind(db);
        db.transaction = ((names: string | string[], mode?: IDBTransactionMode, options?: IDBTransactionOptions) => {
          const transaction = nativeTransaction(names, mode, options);
          if (mode === 'readwrite' && abortAfterPut) {
            const nativeStore = transaction.objectStore.bind(transaction);
            transaction.objectStore = (name: string) => {
              const objectStore = nativeStore(name);
              const nativePut = objectStore.put.bind(objectStore);
              objectStore.put = (value: unknown, key?: IDBValidKey) => {
                const write = nativePut(value, key);
                write.addEventListener('success', () => transaction.abort());
                return write;
              };
              return objectStore;
            };
          }
          return transaction;
        }) as IDBDatabase['transaction'];
      });
      return request;
    },
  } as globalThis.IDBFactory;
  const store = await openBattleStore(instrumentedFactory, DB_NAME);
  const first = await store.save(fixture().snapshot(), false, 0);
  abortAfterPut = true;
  await assert.rejects(store.save(first.battle, true, 1), /abort/i);
  assert.deepEqual(await rawRead(factory, 'default'), first);
  assert.equal(await rawRead(factory, 'backup'), undefined, 'The backup write must roll back with the primary.');
  store.close();
});

test('unavailable storage, future database version and blocked opens reject clearly', async () => {
  await assert.rejects(openBattleStore(undefined), /IndexedDB is unavailable/);
  const factory = new IDBFactory();
  const future = await rawDatabase(factory, DB_NAME, 2);
  future.close();
  await assert.rejects(openBattleStore(factory, DB_NAME), SaveUnsupportedError);
  const blockedName = 'blocked-idle-test';
  const blocker = await rawDatabase(factory, blockedName);
  // Force a genuine blocked version upgrade while retaining the production
  // callback handling. The existing blocker deliberately remains open.
  const upgrading = { open: (name: string) => factory.open(name, 2) } as globalThis.IDBFactory;
  await assert.rejects(openBattleStore(upgrading, blockedName), /blocked by another game tab/);
  blocker.close();
  // Drain the previously blocked request; an aborted late upgrade must not
  // remain as a connection that would block a subsequent raw open.
  const drained = await rawDatabase(factory, blockedName);
  assert.equal(drained.version, 1);
  drained.close();
});

test('an explicitly stored undefined value is corruption rather than an absent primary', async () => {
  const factory = new IDBFactory();
  const store = await openBattleStore(factory, DB_NAME);
  await rawWrite(factory, 'default', undefined);
  assert.equal((await store.load()).kind, 'corrupt');
  await assert.rejects(store.save(fixture().snapshot(), false, 0), SaveValidationError);
  await assert.rejects(store.recoverBackup(), SaveValidationError);
  store.close();
});
test('writer acquisition is atomic, exclusive and requires a lease for all subsequent production writes', async () => {
  const factory = new IDBFactory();
  let now = 10_000;
  const a = await openBattleStore(factory, DB_NAME, () => now);
  const b = await openBattleStore(factory, DB_NAME, () => now);
  const [left, right] = await Promise.all([a.acquireWriter('tab-a'), b.acquireWriter('tab-b')]);
  assert.equal([left, right].filter(Boolean).length, 1);
  const winner = left ?? right!;
  assert.equal(winner.epoch, 1);
  assert.equal(winner.expiresAt, now + 5000);
  const writerStore = left ? a : b;
  assert.deepEqual(await writerStore.acquireWriter(winner.ownerId), winner);
  const snapshot = fixture().snapshot();
  await assert.rejects(writerStore.save(snapshot, false, 0), SaveConflictError);
  const first = await writerStore.save(snapshot, false, 0, { writer: winner });
  await writerStore.releaseWriter(winner);
  await assert.rejects(writerStore.save(snapshot, false, first.revision), SaveConflictError);
  const next = await b.acquireWriter('tab-c');
  assert.equal(next?.epoch, 2, 'Released epochs remain as a durable tombstone.');
  assert.deepEqual(await rawRead(factory, 'default'), first);
  a.close(); b.close();
});

test('expired writer takeover rejects the waking old tab even when its save revision still matches', async () => {
  const factory = new IDBFactory();
  let now = 20_000;
  const a = await openBattleStore(factory, DB_NAME, () => now);
  const b = await openBattleStore(factory, DB_NAME, () => now);
  const oldLease = (await a.acquireWriter('old-tab'))!;
  const snapshot = fixture().snapshot();
  const first = await a.save(snapshot, false, 0, { writer: oldLease });
  now = oldLease.expiresAt - 1;
  assert.equal(await b.acquireWriter('new-tab'), undefined);
  now++;
  const newLease = (await b.acquireWriter('new-tab'))!;
  assert.equal(newLease.epoch, oldLease.epoch + 1);
  await assert.rejects(a.save(snapshot, false, first.revision, { writer: oldLease }), SaveConflictError);
  await assert.rejects(a.renewWriter(oldLease), SaveConflictError);
  await assert.rejects(a.releaseWriter(oldLease), SaveConflictError);
  assert.deepEqual(await rawRead(factory, 'default'), first);
  const second = await b.save(snapshot, false, first.revision, { writer: newLease });
  assert.equal(second.revision, 2);
  assert.equal((await rawRead(factory, 'writer') as { ownerId: string }).ownerId, 'new-tab');
  a.close(); b.close();
});

test('renewal extends the same epoch; expired writers cannot renew or save themselves back into ownership', async () => {
  const factory = new IDBFactory();
  let now = 30_000;
  const store = await openBattleStore(factory, DB_NAME, () => now);
  const first = (await store.acquireWriter('renewing-tab'))!;
  now += 2000;
  const renewed = await store.renewWriter(first);
  assert.equal(renewed.epoch, first.epoch);
  assert.equal(renewed.expiresAt, now + 5000);
  assert.ok(renewed.expiresAt > first.expiresAt);
  now = renewed.expiresAt;
  await assert.rejects(store.renewWriter(renewed), SaveConflictError);
  await assert.rejects(store.save(fixture().snapshot(), false, 0, { writer: renewed }), SaveConflictError);
  const acquiredAgain = (await store.acquireWriter('renewing-tab'))!;
  assert.equal(acquiredAgain.epoch, first.epoch + 1);
  store.close();
});

test('lease epoch and release tombstone survive reopening the database', async () => {
  const factory = new IDBFactory();
  let now = 40_000;
  const firstStore = await openBattleStore(factory, DB_NAME, () => now);
  const first = (await firstStore.acquireWriter('first-tab'))!;
  await firstStore.releaseWriter(first);
  firstStore.close();
  const reopened = await openBattleStore(factory, DB_NAME, () => now);
  const second = (await reopened.acquireWriter('second-tab'))!;
  assert.equal(second.epoch, 2);
  await assert.rejects(reopened.save(fixture().snapshot(), false, 0, { writer: first }), SaveConflictError);
  await reopened.releaseWriter(second);
  await assert.rejects(reopened.save(fixture().snapshot(), false, 0), SaveConflictError);
  reopened.close();
});

test('backup recovery checks the writer epoch in the same transaction as replacement', async () => {
  const factory = new IDBFactory();
  let now = 50_000;
  const store = await openBattleStore(factory, DB_NAME, () => now);
  const firstLease = (await store.acquireWriter('old-tab'))!;
  const snapshot = fixture().snapshot();
  const first = await store.save(snapshot, false, 0, { writer: firstLease });
  await store.save(snapshot, false, first.revision, { writer: firstLease });
  const broken = { schemaVersion: 2, revision: 4, battle: 'damaged' };
  await rawWrite(factory, 'default', broken);
  now = firstLease.expiresAt;
  const secondLease = (await store.acquireWriter('new-tab'))!;
  await assert.rejects(store.recoverBackup(firstLease), SaveConflictError);
  await assert.rejects(store.recoverBackup(), SaveConflictError);
  assert.deepEqual(await rawRead(factory, 'default'), broken);
  assert.equal(await rawRead(factory, 'rejected-default'), undefined);
  const recovered = await store.recoverBackup(secondLease);
  assert.equal(recovered.revision, 5);
  assert.deepEqual(await rawRead(factory, 'rejected-default'), broken);
  store.close();
});

test('malformed or future writer records are protected instead of being overwritten by acquisition', async () => {
  const factory = new IDBFactory();
  const store = await openBattleStore(factory, DB_NAME, () => 60_000);
  const invalid = { schemaVersion: 1, epoch: -1, ownerId: 'broken', expiresAt: 0 };
  await rawWrite(factory, 'writer', invalid);
  await assert.rejects(store.acquireWriter('new-tab'), SaveValidationError);
  assert.deepEqual(await rawRead(factory, 'writer'), invalid);
  const future = { schemaVersion: 2, epoch: 8, futureOwner: 'valuable' };
  await rawWrite(factory, 'writer', future);
  await assert.rejects(store.acquireWriter('new-tab'), SaveUnsupportedError);
  assert.deepEqual(await rawRead(factory, 'writer'), future);
  store.close();
});

test('envelope one migrates read-only without production evidence and retains CAS revision protection', async () => {
  const factory = new IDBFactory();
  const snapshot = preMaraSnapshot(fixture(), 1);
  const legacy = { schemaVersion: 1, revision: 17, writtenAt: 10_000, paused: true, battle: snapshot };
  await rawWrite(factory, 'default', legacy);
  const store = await openBattleStore(factory, DB_NAME, () => 70_000);
  const result = await store.load();
  assert.equal(result.kind, 'valid');
  if (result.kind !== 'valid') assert.fail('Known schema one must migrate.');
  assert.equal(result.save.schemaVersion, 2);
  assert.equal(result.save.revision, 17);
  assert.equal(result.save.battle.schemaVersion, 10);
  assert.deepEqual(result.save.battle.liveClearedWaves, []);
  assert.equal(result.save.offline.baseline.certificate, null);
  assert.equal(result.save.offline.baseline.paused, true);
  assert.equal(reserveOffline(result.save.offline, 7_000_000).pendingReward?.amountUnits, 0);
  assert.deepEqual(await rawRead(factory, 'default'), legacy, 'Loading must never persist a migration implicitly.');
  await assert.rejects(store.save(result.save.battle, true, 0), SaveConflictError);
  const next = await store.save(result.save.battle, true, 17, { offline: result.save.offline });
  assert.equal(next.revision, 18);
  assert.equal(next.schemaVersion, 2);
  store.close();
});

test('pending offline receipt and cleared claim persist atomically with actual gold across reloads', async () => {
  const factory = new IDBFactory();
  let now = 80_000;
  const store = await openBattleStore(factory, DB_NAME, () => now);
  const writer = (await store.acquireWriter('departure'))!;
  const basis = { wave: 1, fingerprint: 'proved-defense', rulesVersion: 1, rewardGold: 200, durationMs: 120_000 };
  const absent = beginAbsence(createOfflineState(now), now, basis, false);
  now += 30_000;
  // Simulated restart after the old lease expires.
  const returningWriter = (await store.acquireWriter('return'))!;
  const pending = reserveOffline(absent, now);
  const first = await store.save(fixture().snapshot(), false, 0, { writer: returningWriter, offline: pending });
  await store.releaseWriter(returningWriter); store.close();
  const reopened = await openBattleStore(factory, DB_NAME, () => now);
  const nextWriter = (await reopened.acquireWriter('claim'))!;
  const loaded = await reopened.load();
  assert.equal(loaded.kind, 'valid');
  if (loaded.kind !== 'valid') assert.fail('Pending receipt must survive a real database reopen.');
  assert.deepEqual(loaded.save.offline, first.offline);
  const claimed = claimOffline(loaded.save.offline, loaded.save.offline.pendingReward!.id);
  const battle = IdleBattle.restore(loaded.save.battle)!;
  battle.creditOfflineUnits(claimed.amountUnits);
  const second = await reopened.save(battle.snapshot(), false, loaded.save.revision, { writer: nextWriter, offline: claimed.state });
  assert.equal(second.battle.gold, first.battle.gold + 30);
  assert.equal(second.offline.pendingReward, null);
  assert.ok(second.offline.window, 'Persisting a claim still must not end the original window.');
  assert.equal(claimOffline(second.offline, loaded.save.offline.pendingReward!.id).amountUnits, 0);
  await assert.rejects(store.save(first.battle, false, first.revision, { writer }), /./);
  reopened.close();
});

test('a future offline schema is protected even with a valid predecessor', async () => {
  const factory = new IDBFactory();
  const store = await openBattleStore(factory, DB_NAME);
  const first = await store.save(fixture().snapshot(), false, 0);
  await store.save(first.battle, false, 1);
  const future = { ...first, revision: 99, offline: { schemaVersion: 2, valuable: true } };
  await rawWrite(factory, 'default', future);
  assert.equal((await store.load()).kind, 'unsupported');
  await assert.rejects(store.recoverBackup(), SaveUnsupportedError);
  assert.deepEqual(await rawRead(factory, 'default'), future);
  store.close();
});


test('battle schema two migrates without rewriting the historical absence proof or pending receipt', async () => {
  const factory = new IDBFactory();
  const battle = fixture();
  const oldBattle = preMaraSnapshot(battle, 2);
  const basis = { wave: 1, fingerprint: 'pre-mara-rule-one-defense', rulesVersion: 1, rewardGold: 200, durationMs: 120_000 };
  const offline = reserveOffline(beginAbsence(createOfflineState(1000), 1000, basis, false), 31_000);
  const legacy = { schemaVersion: 2, revision: 12, writtenAt: 31_000, paused: false, battle: oldBattle, offline };
  await rawWrite(factory, 'default', legacy);
  const store = await openBattleStore(factory, DB_NAME, () => 61_000);
  const loaded = await store.load();
  assert.equal(loaded.kind, 'valid');
  if (loaded.kind !== 'valid') assert.fail('Known schema two must migrate.');
  assert.equal(loaded.save.battle.schemaVersion, 10);
  assert.equal(loaded.save.battle.rulesVersion, 6);
  assert.deepEqual(loaded.save.battle.liveClearedWaves, []);
  assert.equal(loaded.save.battle.gold, battle.gold);
  assert.equal(loaded.save.battle.elapsed, battle.elapsed);
  assert.deepEqual(loaded.save.offline, offline, 'A Mara update must not recalculate an older departure rate.');
  assert.deepEqual(await rawRead(factory, 'default'), legacy, 'The migration must remain read-only until confirmed save.');
  const next = await store.save(loaded.save.battle, false, 12, { offline: loaded.save.offline });
  assert.equal(next.revision, 13);
  assert.deepEqual(next.offline, offline);
  store.close();
});

test('session return across the Mara rule update pays the historical rate once and starts with no invented current proof', async () => {
  const factory = new IDBFactory();
  let now = 61_000;
  const battle = fixture();
  const oldBattle = preMaraSnapshot(battle, 2);
  const basis = { wave: 1, fingerprint: 'pre-mara-rule-one-defense', rulesVersion: 1, rewardGold: 200, durationMs: 120_000 };
  const offline = reserveOffline(beginAbsence(createOfflineState(1000), 1000, basis, false), 31_000);
  await rawWrite(factory, 'default', { schemaVersion: 2, revision: 12, writtenAt: 31_000, paused: false, battle: oldBattle, offline });
  const store = await openBattleStore(factory, DB_NAME, () => now);
  const returned = await BattleSession.open(store, { now: () => now, ownerId: 'rules-update-tab', locks: null });
  assert.equal(returned.battle.snapshot().schemaVersion, 10);
  assert.equal(returned.certificate, null, 'The migrated defense needs new live evidence under current rules.');
  assert.equal(returned.offline.window?.certificate?.rulesVersion, 1);
  assert.equal(returned.offline.window?.certificate?.fingerprint, basis.fingerprint);
  assert.equal(returned.pendingReward?.amountUnits, 60_000);
  const before = returned.battle.gold;
  assert.equal(await returned.claimOffline(), true);
  assert.equal(returned.battle.gold, before + 60);
  assert.equal(await returned.claimOffline(), false);
  assert.equal(await returned.resumeActive(), true);
  assert.equal(returned.offline.window, null);
  assert.equal(returned.offline.baseline.certificate, null);
  await returned.suspend();
  now += 1000;
  const reloaded = await BattleSession.open(store, { now: () => now, ownerId: 'rules-update-reload', locks: null });
  assert.equal(reloaded.pendingReward?.amountUnits ?? 0, 0, 'Old rules cannot create future windows after actual active continuation.');
  assert.equal(reloaded.battle.gold, before + 60);
  await reloaded.close();
});

test('future battle schema eleven and future historical proof rules seven remain protected', async () => {
  for (const kind of ['battle-schema', 'offline-proof'] as const) {
    const factory = new IDBFactory();
    const store = await openBattleStore(factory, DB_NAME);
    const first = await store.save(fixture().snapshot(), false, 0);
    await store.save(first.battle, false, 1);
    const future = structuredClone(first);
    if (kind === 'battle-schema') {
      (future.battle as { schemaVersion: number }).schemaVersion = 11;
    } else {
      const basis = { wave: 1, fingerprint: 'future-proof', rulesVersion: 2, rewardGold: 200, durationMs: 120_000 };
      future.offline = beginAbsence(createOfflineState(1000), 1000, basis, false);
      future.offline.baseline.certificate!.rulesVersion = 7;
      future.offline.window!.certificate!.rulesVersion = 7;
    }
    await rawWrite(factory, 'default', future);
    assert.equal((await store.load()).kind, 'unsupported');
    await assert.rejects(store.save(first.battle, false, first.revision), SaveUnsupportedError);
    await assert.rejects(store.recoverBackup(), SaveUnsupportedError);
    assert.deepEqual(await rawRead(factory, 'default'), future);
    store.close();
  }
});

