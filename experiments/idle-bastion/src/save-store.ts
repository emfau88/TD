/** The B03 IndexedDB boundary. A returned write is a completed transaction, never
 * just a successful put request. CAS protects newer confirmed state; tab leases
 * and writer epochs are added by B04 rather than implied by this store.
 */
import { IdleBattle, type BattleSnapshot } from './battle';

export interface SaveEnvelope {
  schemaVersion: 1;
  revision: number;
  writtenAt: number;
  paused: boolean;
  battle: BattleSnapshot;
}
export type LoadResult =
  | { kind: 'empty' }
  | { kind: 'valid'; save: SaveEnvelope }
  | { kind: 'recoverable'; backup: SaveEnvelope; reason: string }
  | { kind: 'unsupported'; reason: string }
  | { kind: 'corrupt'; reason: string };
export interface BattleSaveStore {
  load(): Promise<LoadResult>;
  save(snapshot: BattleSnapshot, paused: boolean, expectedRevision: number): Promise<SaveEnvelope>;
  recoverBackup(): Promise<SaveEnvelope>;
  close(): void;
}

export class SaveConflictError extends Error {
  constructor(message: string) { super(message); this.name = 'SaveConflictError'; }
}
export class SaveUnsupportedError extends Error {
  constructor(message: string) { super(message); this.name = 'SaveUnsupportedError'; }
}
export class SaveValidationError extends Error {
  constructor(message: string) { super(message); this.name = 'SaveValidationError'; }
}

type Inspection = Exclude<LoadResult, { kind: 'recoverable' }>;
const STORE = 'saves';
const PRIMARY = 'default';
const BACKUP = 'backup';
const REJECTED = 'rejected-default';
const record = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);
const natural = (value: unknown): value is number => Number.isSafeInteger(value) && (value as number) >= 0;

function inspect(value: unknown, present = value !== undefined): Inspection {
  if (!present) return { kind: 'empty' };
  if (!record(value)) return { kind: 'corrupt', reason: 'The save envelope is not an object.' };
  if (natural(value.schemaVersion) && value.schemaVersion > 1) {
    return { kind: 'unsupported', reason: `Save schema ${value.schemaVersion} requires a newer game version.` };
  }
  if (value.schemaVersion !== 1) return { kind: 'corrupt', reason: 'The save envelope has no recognized schema.' };
  // A future battle format inside a known envelope is equally valuable data.
  // Never label it recoverable and silently replace it with an older backup.
  if (record(value.battle)) {
    for (const key of ['schemaVersion', 'rulesVersion', 'layoutVersion']) {
      const version = value.battle[key];
      if (natural(version) && version > 1) {
        return { kind: 'unsupported', reason: `Battle ${key} ${version} requires a newer game version.` };
      }
    }
  }
  if (!natural(value.revision) || value.revision < 1 || !natural(value.writtenAt)
    || typeof value.paused !== 'boolean') {
    return { kind: 'corrupt', reason: 'The save revision, timestamp or pause flag is invalid.' };
  }
  const restored = IdleBattle.restore(value.battle);
  if (!restored) return { kind: 'corrupt', reason: 'The saved battle state is invalid.' };
  return {
    kind: 'valid',
    save: {
      schemaVersion: 1, revision: value.revision, writtenAt: value.writtenAt,
      paused: value.paused, battle: restored.snapshot(),
    },
  };
}

function nextRevision(previous: number): number {
  if (!natural(previous) || previous === Number.MAX_SAFE_INTEGER) {
    throw new SaveValidationError('The save revision cannot be advanced safely.');
  }
  return previous + 1;
}
function timestamp(): number {
  const now = Date.now();
  if (!natural(now)) throw new SaveValidationError('The system timestamp is invalid.');
  return now;
}

/** Work queues requests synchronously and supplies the result only at oncomplete.
 * Reads and compare/write checks remain in the same native IDB transaction.
 */
function transact<T>(
  db: IDBDatabase,
  mode: IDBTransactionMode,
  work: (store: IDBObjectStore, fail: (error: unknown) => void) => () => T,
): Promise<T> {
  return new Promise((resolve, reject) => {
    let transaction: IDBTransaction;
    try { transaction = db.transaction(STORE, mode); }
    catch (error) { reject(error); return; }
    let failure: unknown;
    let result: (() => T) | undefined;
    const fail = (error: unknown): void => {
      failure = error;
      try { transaction.abort(); }
      catch { reject(error); }
    };
    transaction.onabort = () => reject(failure ?? transaction.error ?? new Error('Save transaction aborted.'));
    transaction.oncomplete = () => {
      try {
        if (!result) throw new SaveValidationError('Save transaction completed without a result.');
        resolve(result());
      } catch (error) { reject(error); }
    };
    try { result = work(transaction.objectStore(STORE), fail); }
    catch (error) { fail(error); }
  });
}

function createStore(db: IDBDatabase): BattleSaveStore {
  return {
    load() {
      return transact(db, 'readonly', store => {
        const primary = store.get(PRIMARY);
        const backup = store.get(BACKUP);
        const primaryKey = store.getKey(PRIMARY);
        return (): LoadResult => {
          const current = inspect(primary.result, primaryKey.result !== undefined);
          if (current.kind !== 'corrupt') return current;
          const previous = inspect(backup.result);
          // Automatic fallback would hide data loss. The caller must explicitly
          // request recovery, and only a recognized corrupt schema can recover.
          if (record(primary.result) && primary.result.schemaVersion === 1 && previous.kind === 'valid') {
            return { kind: 'recoverable', backup: previous.save, reason: current.reason };
          }
          return current;
        };
      });
    },
    save(snapshot, paused, expectedRevision) {
      const restored = IdleBattle.restore(snapshot);
      if (!restored || typeof paused !== 'boolean' || !natural(expectedRevision)) {
        return Promise.reject(new SaveValidationError('The proposed battle save is invalid.'));
      }
      // Detach the caller's mutable model before the first asynchronous step.
      const battle = restored.snapshot();
      return transact(db, 'readwrite', (store, fail) => {
        const primary = store.get(PRIMARY);
        const primaryKey = store.getKey(PRIMARY);
        let written: SaveEnvelope | undefined;
        primaryKey.onsuccess = () => {
          try {
            const current = inspect(primary.result, primaryKey.result !== undefined);
            if (current.kind === 'unsupported') throw new SaveUnsupportedError(current.reason);
            if (current.kind === 'corrupt') throw new SaveValidationError(current.reason);
            const revision = current.kind === 'empty' ? 0 : current.save.revision;
            if (revision !== expectedRevision) {
              throw new SaveConflictError(`Save revision changed: expected ${expectedRevision}, found ${revision}.`);
            }
            written = {
              schemaVersion: 1, revision: nextRevision(revision), writtenAt: timestamp(), paused, battle,
            };
            if (current.kind === 'valid') store.put(current.save, BACKUP);
            store.put(written, PRIMARY);
          } catch (error) { fail(error); }
        };
        return () => {
          if (!written) throw new SaveValidationError('No save was written.');
          return written;
        };
      });
    },
    recoverBackup() {
      return transact(db, 'readwrite', (store, fail) => {
        const primary = store.get(PRIMARY);
        const backup = store.get(BACKUP);
        const primaryKey = store.getKey(PRIMARY);
        let recovered: SaveEnvelope | undefined;
        primaryKey.onsuccess = (): void => {
          try {
            const current = inspect(primary.result, primaryKey.result !== undefined);
            if (current.kind === 'unsupported') throw new SaveUnsupportedError(current.reason);
            if (current.kind === 'valid') throw new SaveConflictError('The primary save is valid; recovery is no longer appropriate.');
            if (current.kind !== 'corrupt' || !record(primary.result) || primary.result.schemaVersion !== 1) {
              throw new SaveValidationError('Only a damaged save with a recognized schema can be recovered.');
            }
            const previous = inspect(backup.result);
            if (previous.kind !== 'valid') throw new SaveValidationError('There is no valid backup to recover.');
            const rawRevision = natural(primary.result.revision) ? primary.result.revision : 0;
            recovered = {
              ...previous.save, revision: nextRevision(Math.max(rawRevision, previous.save.revision)), writtenAt: timestamp(),
            };
            store.put(primary.result, REJECTED);
            store.put(recovered, PRIMARY);
          } catch (error) { fail(error); }
        };
        return () => {
          if (!recovered) throw new SaveValidationError('No backup was recovered.');
          return recovered;
        };
      });
    },
    close() { db.close(); },
  };
}

export function openBattleStore(
  factory: IDBFactory = globalThis.indexedDB,
  name = 'spire-idle-bastion',
): Promise<BattleSaveStore> {
  return new Promise((resolve, reject) => {
    if (!factory || typeof factory.open !== 'function') {
      reject(new Error('IndexedDB is unavailable. A durable game cannot be started.'));
      return;
    }
    let request: IDBOpenDBRequest;
    try { request = factory.open(name, 1); }
    catch (error) { reject(error); return; }
    let settled = false;
    const fail = (error: unknown): void => { settled = true; reject(error); };
    request.onblocked = () => fail(new Error('Opening the save database is blocked by another game tab. Close it and try again.'));
    request.onupgradeneeded = () => {
      if (settled) { request.transaction?.abort(); return; }
      if (!request.result.objectStoreNames.contains(STORE)) request.result.createObjectStore(STORE);
    };
    request.onerror = () => {
      if (request.error?.name === 'VersionError') {
        fail(new SaveUnsupportedError('This save database requires a newer game version.'));
      } else fail(request.error ?? new Error('The save database could not be opened.'));
    };
    request.onsuccess = () => {
      const db = request.result;
      if (settled) { db.close(); return; }
      if (!db.objectStoreNames.contains(STORE)) {
        db.close();
        fail(new SaveValidationError('The save database has no recognized saves store.'));
        return;
      }
      db.onversionchange = () => db.close();
      settled = true;
      resolve(createStore(db));
    };
  });
}
