/** Native IndexedDB save/ownership boundary. Every acknowledged economic write
 * has completed its transaction and checked CAS revision plus writer epoch in
 * that same transaction. Database version stays 1; envelopes migrate explicitly.
 */
import { IdleBattle, type BattleSnapshot } from './battle';
import { checkpointActive, createOfflineState, restoreOffline, type OfflineState } from './offline';

export interface SaveEnvelope {
  schemaVersion: 2; revision: number; writtenAt: number; paused: boolean;
  battle: BattleSnapshot; offline: OfflineState;
}
export type LoadResult =
  | { kind: 'empty' }
  | { kind: 'valid'; save: SaveEnvelope }
  | { kind: 'recoverable'; backup: SaveEnvelope; reason: string }
  | { kind: 'unsupported'; reason: string }
  | { kind: 'corrupt'; reason: string };
export interface WriterLease { ownerId: string; epoch: number; expiresAt: number }
export interface SaveOptions { writer?: WriterLease; offline?: OfflineState }
export interface BattleSaveStore {
  load(): Promise<LoadResult>;
  save(snapshot: BattleSnapshot, paused: boolean, expectedRevision: number, options?: SaveOptions): Promise<SaveEnvelope>;
  recoverBackup(writer?: WriterLease): Promise<SaveEnvelope>;
  acquireWriter(ownerId: string): Promise<WriterLease | undefined>;
  renewWriter(lease: WriterLease): Promise<WriterLease>;
  releaseWriter(lease: WriterLease): Promise<void>;
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
export const WRITER_LEASE_MS = 5000;
type Inspection = Exclude<LoadResult, { kind: 'recoverable' }>;
interface WriterRecord { schemaVersion: 1; ownerId: string | null; epoch: number; expiresAt: number }
const STORE = 'saves', PRIMARY = 'default', BACKUP = 'backup', REJECTED = 'rejected-default', WRITER = 'writer';
const record = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null && !Array.isArray(value);
const natural = (value: unknown): value is number => Number.isSafeInteger(value) && (value as number) >= 0;
const owner = (value: unknown): value is string => typeof value === 'string' && value.trim().length > 0 && value.length <= 200;
const knownSchema = (value: unknown): value is Record<string, unknown> => record(value) && (value.schemaVersion === 1 || value.schemaVersion === 2);

/** Loading is read-only. Envelope 1 becomes an in-memory envelope 2 with the
 * same revision, an explicitly migrated battle, and no invented offline rate.
 */
function inspect(value: unknown, present = value !== undefined): Inspection {
  if (!present) return { kind: 'empty' };
  if (!record(value)) return { kind: 'corrupt', reason: 'The save envelope is not an object.' };
  if (natural(value.schemaVersion) && value.schemaVersion > 2) {
    return { kind: 'unsupported', reason: `Save schema ${value.schemaVersion} requires a newer game version.` };
  }
  if (!knownSchema(value)) return { kind: 'corrupt', reason: 'The save envelope has no recognized schema.' };
  if (record(value.battle)) {
    for (const [key, maximum] of [['schemaVersion', 18], ['rulesVersion', 10], ['layoutVersion', 4]] as const) {
      const version = value.battle[key];
      if (natural(version) && version > maximum) return { kind: 'unsupported', reason: `Battle ${key} ${version} requires a newer game version.` };
    }
  }
  if (record(value.offline)) {
    if (natural(value.offline.schemaVersion) && value.offline.schemaVersion > 1) {
      return { kind: 'unsupported', reason: 'The offline state requires a newer game version.' };
    }
    for (const origin of [value.offline.baseline, value.offline.window]) {
      if (record(origin) && record(origin.certificate) && natural(origin.certificate.rulesVersion)
        && origin.certificate.rulesVersion > 10) {
        return { kind: 'unsupported', reason: 'The offline production proof requires a newer game version.' };
      }
    }
  }
  if (!natural(value.revision) || value.revision < 1 || !natural(value.writtenAt) || typeof value.paused !== 'boolean') {
    return { kind: 'corrupt', reason: 'The save revision, timestamp or pause flag is invalid.' };
  }
  const restored = IdleBattle.restore(value.battle);
  if (!restored) return { kind: 'corrupt', reason: 'The saved battle state is invalid.' };
  const offline = value.schemaVersion === 1
    ? checkpointActive(createOfflineState(value.writtenAt), value.writtenAt, null, value.paused)
    : restoreOffline(value.offline);
  if (!offline) return { kind: 'corrupt', reason: 'The saved offline state is invalid.' };
  return {
    kind: 'valid', save: {
      schemaVersion: 2, revision: value.revision, writtenAt: value.writtenAt,
      paused: value.paused, battle: restored.snapshot(), offline,
    },
  };
}
function nextRevision(previous: number): number {
  if (!natural(previous) || previous === Number.MAX_SAFE_INTEGER) throw new SaveValidationError('The save revision cannot be advanced safely.');
  return previous + 1;
}
function timestamp(clock: () => number): number {
  const now = clock();
  if (!natural(now)) throw new SaveValidationError('The system timestamp is invalid.');
  return now;
}
function expiry(now: number): number {
  if (!natural(now + WRITER_LEASE_MS)) throw new SaveValidationError('The writer lease expiry exceeds the safe timestamp range.');
  return now + WRITER_LEASE_MS;
}
function writerRecord(value: unknown, present: boolean): WriterRecord | undefined {
  if (!present) return undefined;
  if (record(value) && natural(value.schemaVersion) && value.schemaVersion > 1) throw new SaveUnsupportedError('The writer lease format requires a newer game version.');
  if (!record(value) || value.schemaVersion !== 1 || !natural(value.epoch) || value.epoch < 1 || !natural(value.expiresAt)
    || !(owner(value.ownerId) || (value.ownerId === null && value.expiresAt === 0))) throw new SaveValidationError('The stored writer lease is invalid.');
  return { schemaVersion: 1, epoch: value.epoch, ownerId: value.ownerId, expiresAt: value.expiresAt };
}
function validLease(value: WriterLease | undefined): value is WriterLease {
  return !!value && owner(value.ownerId) && natural(value.epoch) && value.epoch > 0 && natural(value.expiresAt);
}
function matchingWriter(current: WriterRecord | undefined, supplied: WriterLease | undefined, now: number, allowExpired = false): void {
  if (!current) {
    if (supplied) throw new SaveConflictError('The supplied writer lease no longer exists.');
    return; // Compatibility only until a writer record has ever existed.
  }
  if (!validLease(supplied) || current.ownerId !== supplied.ownerId || current.epoch !== supplied.epoch
    || (!allowExpired && current.expiresAt <= now)) throw new SaveConflictError('Another tab owns this save or the writer lease has expired.');
}
function readWriter(store: IDBObjectStore) {
  return { value: store.get(WRITER), key: store.getKey(WRITER) };
}
function leaseOf(value: WriterRecord): WriterLease {
  return { ownerId: value.ownerId!, epoch: value.epoch, expiresAt: value.expiresAt };
}

/** A successful request is insufficient: resolve only at native oncomplete. */
function transact<T>(db: IDBDatabase, mode: IDBTransactionMode,
  work: (store: IDBObjectStore, fail: (error: unknown) => void) => () => T): Promise<T> {
  return new Promise((resolve, reject) => {
    let transaction: IDBTransaction;
    try { transaction = db.transaction(STORE, mode); } catch (error) { reject(error); return; }
    let failure: unknown, result: (() => T) | undefined;
    const fail = (error: unknown): void => { failure = error; try { transaction.abort(); } catch { reject(error); } };
    transaction.onabort = () => reject(failure ?? transaction.error ?? new Error('Save transaction aborted.'));
    transaction.oncomplete = () => {
      try {
        if (!result) throw new SaveValidationError('Save transaction completed without a result.');
        resolve(result());
      } catch (error) { reject(error); }
    };
    try { result = work(transaction.objectStore(STORE), fail); } catch (error) { fail(error); }
  });
}
function createStore(db: IDBDatabase, clock: () => number): BattleSaveStore {
  return {
    load() {
      return transact(db, 'readonly', store => {
        const primary = store.get(PRIMARY), backup = store.get(BACKUP), primaryKey = store.getKey(PRIMARY);
        return (): LoadResult => {
          const current = inspect(primary.result, primaryKey.result !== undefined);
          if (current.kind !== 'corrupt') return current;
          const previous = inspect(backup.result);
          if (knownSchema(primary.result) && previous.kind === 'valid') return { kind: 'recoverable', backup: previous.save, reason: current.reason };
          return current;
        };
      });
    },
    save(snapshot, paused, expectedRevision, options = {}) {
      const restored = IdleBattle.restore(snapshot);
      const proposedOffline = options.offline === undefined ? undefined : restoreOffline(options.offline);
      const writer = options.writer && { ...options.writer };
      if (!restored || typeof paused !== 'boolean' || !natural(expectedRevision) || (options.offline !== undefined && !proposedOffline)) {
        return Promise.reject(new SaveValidationError('The proposed battle save is invalid.'));
      }
      const battle = restored.snapshot();
      return transact(db, 'readwrite', (store, fail) => {
        const primary = store.get(PRIMARY), primaryKey = store.getKey(PRIMARY), ownership = readWriter(store);
        let written: SaveEnvelope | undefined;
        ownership.key.onsuccess = () => {
          try {
            const current = inspect(primary.result, primaryKey.result !== undefined);
            if (current.kind === 'unsupported') throw new SaveUnsupportedError(current.reason);
            if (current.kind === 'corrupt') throw new SaveValidationError(current.reason);
            const now = timestamp(clock);
            matchingWriter(writerRecord(ownership.value.result, ownership.key.result !== undefined), writer, now);
            const revision = current.kind === 'empty' ? 0 : current.save.revision;
            if (revision !== expectedRevision) throw new SaveConflictError(`Save revision changed: expected ${expectedRevision}, found ${revision}.`);
            const offline = proposedOffline ?? (current.kind === 'valid' ? current.save.offline
              : checkpointActive(createOfflineState(now), now, null, paused));
            written = { schemaVersion: 2, revision: nextRevision(revision), writtenAt: now, paused, battle, offline };
            if (current.kind === 'valid') store.put(current.save, BACKUP);
            store.put(written, PRIMARY);
          } catch (error) { fail(error); }
        };
        return () => { if (!written) throw new SaveValidationError('No save was written.'); return written; };
      });
    },
    recoverBackup(writer) {
      return transact(db, 'readwrite', (store, fail) => {
        const primary = store.get(PRIMARY), backup = store.get(BACKUP), primaryKey = store.getKey(PRIMARY), ownership = readWriter(store);
        let recovered: SaveEnvelope | undefined;
        ownership.key.onsuccess = () => {
          try {
            const current = inspect(primary.result, primaryKey.result !== undefined);
            if (current.kind === 'unsupported') throw new SaveUnsupportedError(current.reason);
            if (current.kind === 'valid') throw new SaveConflictError('The primary save is valid; recovery is no longer appropriate.');
            if (current.kind !== 'corrupt' || !knownSchema(primary.result)) throw new SaveValidationError('Only a damaged save with a recognized schema can be recovered.');
            const previous = inspect(backup.result);
            if (previous.kind !== 'valid') throw new SaveValidationError('There is no valid backup to recover.');
            const now = timestamp(clock);
            matchingWriter(writerRecord(ownership.value.result, ownership.key.result !== undefined), writer, now);
            const rawRevision = natural(primary.result.revision) ? primary.result.revision : 0;
            recovered = { ...previous.save, revision: nextRevision(Math.max(rawRevision, previous.save.revision)), writtenAt: now };
            store.put(primary.result, REJECTED); store.put(recovered, PRIMARY);
          } catch (error) { fail(error); }
        };
        return () => { if (!recovered) throw new SaveValidationError('No backup was recovered.'); return recovered; };
      });
    },
    acquireWriter(ownerId) {
      if (!owner(ownerId)) return Promise.reject(new SaveValidationError('A writer requires a non-empty owner ID.'));
      return transact(db, 'readwrite', (store, fail) => {
        const ownership = readWriter(store);
        let acquired: WriterLease | undefined;
        ownership.key.onsuccess = () => {
          try {
            const current = writerRecord(ownership.value.result, ownership.key.result !== undefined), now = timestamp(clock);
            if (current && current.ownerId !== null && current.expiresAt > now) {
              if (current.ownerId === ownerId) acquired = leaseOf(current);
              return;
            }
            const next: WriterRecord = { schemaVersion: 1, ownerId, epoch: nextRevision(current?.epoch ?? 0), expiresAt: expiry(now) };
            store.put(next, WRITER); acquired = leaseOf(next);
          } catch (error) { fail(error); }
        };
        return () => acquired;
      });
    },
    renewWriter(lease) {
      if (!validLease(lease)) return Promise.reject(new SaveValidationError('Invalid writer lease.'));
      const supplied = { ...lease };
      return transact(db, 'readwrite', (store, fail) => {
        const ownership = readWriter(store);
        let renewed: WriterLease | undefined;
        ownership.key.onsuccess = () => {
          try {
            const current = writerRecord(ownership.value.result, ownership.key.result !== undefined), now = timestamp(clock);
            if (!current) throw new SaveConflictError('The writer lease no longer exists.');
            matchingWriter(current, supplied, now);
            const next = { ...current, expiresAt: Math.max(current.expiresAt, expiry(now)) };
            store.put(next, WRITER); renewed = leaseOf(next);
          } catch (error) { fail(error); }
        };
        return () => { if (!renewed) throw new SaveConflictError('Writer lease was not renewed.'); return renewed; };
      });
    },
    releaseWriter(lease) {
      if (!validLease(lease)) return Promise.reject(new SaveValidationError('Invalid writer lease.'));
      const supplied = { ...lease };
      return transact(db, 'readwrite', (store, fail) => {
        const ownership = readWriter(store);
        ownership.key.onsuccess = () => {
          try {
            const current = writerRecord(ownership.value.result, ownership.key.result !== undefined);
            if (!current) throw new SaveConflictError('The writer lease no longer exists.');
            matchingWriter(current, supplied, timestamp(clock), true);
            // Keep the epoch tombstone forever: releasing ownership must never
            // let an old epoch or a legacy unleased writer become valid again.
            store.put({ schemaVersion: 1, ownerId: null, epoch: current.epoch, expiresAt: 0 }, WRITER);
          } catch (error) { fail(error); }
        };
        return () => undefined;
      });
    },
    close() { db.close(); },
  };
}
export function openBattleStore(factory: IDBFactory = globalThis.indexedDB,
  name = 'spire-idle-bastion', clock: () => number = Date.now): Promise<BattleSaveStore> {
  return new Promise((resolve, reject) => {
    if (!factory || typeof factory.open !== 'function') { reject(new Error('IndexedDB is unavailable. A durable game cannot be started.')); return; }
    let request: IDBOpenDBRequest;
    try { request = factory.open(name, 1); } catch (error) { reject(error); return; }
    let settled = false;
    const fail = (error: unknown): void => { settled = true; reject(error); };
    request.onblocked = () => fail(new Error('Opening the save database is blocked by another game tab. Close it and try again.'));
    request.onupgradeneeded = () => {
      if (settled) { request.transaction?.abort(); return; }
      if (!request.result.objectStoreNames.contains(STORE)) request.result.createObjectStore(STORE);
    };
    request.onerror = () => fail(request.error?.name === 'VersionError'
      ? new SaveUnsupportedError('This save database requires a newer game version.')
      : request.error ?? new Error('The save database could not be opened.'));
    request.onsuccess = () => {
      const db = request.result;
      if (settled) { db.close(); return; }
      if (!db.objectStoreNames.contains(STORE)) { db.close(); fail(new SaveValidationError('The save database has no recognized saves store.')); return; }
      db.onversionchange = () => db.close(); settled = true; resolve(createStore(db, clock));
    };
  });
}

