import assert from 'node:assert/strict';
import test from 'node:test';
import { IDBFactory } from 'fake-indexeddb';
import { IdleBattle } from '../src/battle';
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

test('isolated native IndexedDB starts empty and restores a committed battle and explicit pause', async () => {
  const factory = new IDBFactory();
  const store = await openBattleStore(factory, DB_NAME);
  assert.deepEqual(await store.load(), { kind: 'empty' });
  const battle = fixture();
  const before = Date.now();
  const saved = await store.save(battle.snapshot(), true, 0);
  assert.equal(saved.schemaVersion, 1);
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
  const future = { schemaVersion: 2, revision: 400, preciousFutureState: ['preserve me'] };
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
  const future = { ...first, revision: 7, battle: { ...first.battle, rulesVersion: 2 } };
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
