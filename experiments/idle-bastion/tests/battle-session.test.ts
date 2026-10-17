import assert from 'node:assert/strict';
import test from 'node:test';
import { IDBFactory } from 'fake-indexeddb';
import { IdleBattle, type BattleSnapshot } from '../src/battle';
import { BattleSession, SessionLoadError, type SessionStore } from '../src/battle-session';
import { openBattleStore, type LoadResult, type SaveEnvelope } from '../src/save-store';

const copy = <T>(value: T): T => structuredClone(value);
const tick = async (): Promise<void> => { await new Promise<void>(resolve => setImmediate(resolve)); };

class ControlledStore implements SessionStore {
  current?: SaveEnvelope;
  loaded?: LoadResult;
  gate = false;
  writes: { battle: BattleSnapshot; paused: boolean; expected: number }[] = [];
  pending?: { confirm: () => void; reject: (error: Error) => void };
  recovered = 0;
  closed = false;
  load(): Promise<LoadResult> {
    return Promise.resolve(this.loaded ?? (this.current ? { kind: 'valid', save: copy(this.current) } : { kind: 'empty' }));
  }
  save(battle: BattleSnapshot, paused: boolean, expected: number): Promise<SaveEnvelope> {
    this.writes.push({ battle: copy(battle), paused, expected });
    return new Promise((resolve, reject) => {
      const confirm = () => {
        if ((this.current?.revision ?? 0) !== expected) { reject(new Error('Revision conflict')); return; }
        this.current = { schemaVersion: 1, revision: expected + 1, writtenAt: Date.now(), battle: copy(battle), paused };
        resolve(copy(this.current));
      };
      if (this.gate) this.pending = { confirm, reject };
      else confirm();
    });
  }
  async recoverBackup(): Promise<SaveEnvelope> {
    if (this.loaded?.kind !== 'recoverable') throw new Error('No backup');
    this.recovered++;
    this.current = copy(this.loaded.backup);
    this.loaded = undefined;
    return copy(this.current);
  }
  close(): void { this.closed = true; }
}

async function advance(session: BattleSession, seconds: number): Promise<void> {
  for (let remaining = seconds; remaining > 1e-9; remaining -= 0.25) {
    session.advance(Math.min(0.25, remaining));
    if (session.busy) await session.flush();
  }
}

test('fresh persistent session commits before exposure, whereas temporary play is explicitly marked', async () => {
  const store = new ControlledStore();
  const session = await BattleSession.open(store);
  assert.equal(session.temporary, false);
  assert.equal(session.revision, 1);
  assert.equal(store.writes.length, 1);
  assert.equal(store.current?.battle.gold, 75);
  const temporary = await BattleSession.open();
  assert.equal(temporary.temporary, true);
  assert.equal(temporary.revision, 0);
  assert.equal(await temporary.command(battle => battle.build('tower-02')), true);
  assert.equal(temporary.battle.gold, 0);
  assert.equal(temporary.revision, 0);
});

test('purchase is acknowledged only after commit and a concurrent click is rejected', async () => {
  const store = new ControlledStore();
  const session = await BattleSession.open(store);
  store.gate = true;
  let acknowledged = false, changes = 0;
  session.onChange = () => { changes++; };
  const command = session.command(battle => battle.build('tower-02')).then(result => { acknowledged = result; return result; });
  assert.equal(session.busy, true);
  await tick();
  assert.equal(acknowledged, false);
  assert.equal(changes, 0);
  assert.equal(store.current?.battle.gold, 75);
  assert.equal(await session.command(battle => battle.build('tower-03')), false);
  assert.equal(store.writes.length, 2);
  store.pending!.confirm();
  assert.equal(await command, true);
  assert.equal(acknowledged, true);
  assert.equal(changes, 1);
  assert.equal(session.revision, 2);
  assert.equal(store.current?.battle.gold, 0);
});

test('failed write rolls back the complete battle, stops simulation and never acknowledges the purchase', async () => {
  const store = new ControlledStore();
  const session = await BattleSession.open(store);
  const before = session.battle.snapshot();
  store.gate = true;
  let error: Error | undefined;
  session.onError = value => { error = value; };
  const command = session.command(battle => battle.build('tower-02'));
  await tick();
  store.pending!.reject(new Error('Storage quota exceeded'));
  assert.equal(await command, false);
  assert.match(error!.message, /quota/);
  assert.deepEqual(session.battle.snapshot(), before);
  assert.equal(session.busy, false);
  session.advance(0.25);
  assert.deepEqual(session.battle.snapshot(), before);
  assert.equal(await session.command(battle => battle.upgrade(battle.towers[0].uid)), false);
  await assert.rejects(session.flush(), /quota/);
});

test('revision checks reject stale writers and the session never emits a successful confirmation', async () => {
  const store = new ControlledStore();
  const first = await BattleSession.open(store);
  const stale = await BattleSession.open(store);
  assert.equal(await first.command(battle => battle.upgrade(battle.towers[0].uid)), true);
  assert.equal(await stale.command(battle => battle.build('tower-02')), false);
  assert.match(stale.error!.message, /Revision conflict/);
  assert.equal(stale.revision, 1);
  assert.equal(stale.battle.gold, 75);
  assert.equal(store.current?.revision, 2);
  assert.equal(store.current?.battle.gold, 15);
  assert.deepEqual(store.writes.map(write => write.expected), [0, 1, 1]);
});

test('wave changes commit immediately, pure combat checkpoints after one second and flush saves the remainder', async () => {
  const store = new ControlledStore();
  const session = await BattleSession.open(store);
  session.advance(0.25);
  assert.equal(session.busy, true);
  await session.flush();
  assert.equal(store.current?.battle.wave, 1);
  const waveRevision = session.revision;
  await advance(session, 0.75);
  assert.equal(session.revision, waveRevision);
  session.advance(0.25);
  assert.equal(session.busy, true);
  await session.flush();
  assert.equal(session.revision, waveRevision + 1);
  const last = session.revision;
  session.advance(0.1);
  assert.equal(session.revision, last);
  await session.flush();
  assert.equal(session.revision, last + 1);
  assert.deepEqual(store.current?.battle, session.battle.snapshot());
});

test('pause persists exactly and does not accrue simulation time across load', async () => {
  const store = new ControlledStore();
  const session = await BattleSession.open(store);
  await advance(session, 1);
  assert.equal(await session.setPaused(true), true);
  const paused = session.battle.snapshot();
  session.advance(0.25);
  assert.deepEqual(session.battle.snapshot(), paused);
  const reloaded = await BattleSession.open(store);
  assert.equal(reloaded.paused, true);
  assert.deepEqual(reloaded.battle.snapshot(), paused);
  reloaded.advance(100000);
  assert.deepEqual(reloaded.battle.snapshot(), paused);
  assert.equal(await reloaded.setPaused(false), true);
  reloaded.advance(0.025);
  assert.ok(reloaded.battle.elapsed > session.battle.elapsed);
});

test('load protects unsupported/corrupt states and recovery requires an explicit request', async () => {
  for (const kind of ['unsupported', 'corrupt'] as const) {
    const store = new ControlledStore();
    store.loaded = { kind, reason: 'Protected raw state' };
    await assert.rejects(BattleSession.open(store), error => error instanceof SessionLoadError && !error.canRecover);
    assert.equal(store.writes.length, 0);
    assert.equal(store.recovered, 0);
  }
  const store = new ControlledStore();
  const backup: SaveEnvelope = { schemaVersion: 1, revision: 7, writtenAt: 1, paused: true, battle: new IdleBattle().snapshot() };
  store.loaded = { kind: 'recoverable', backup, reason: 'Main state damaged' };
  await assert.rejects(BattleSession.open(store), error => error instanceof SessionLoadError && error.canRecover);
  assert.equal(store.writes.length, 0);
  assert.equal(store.recovered, 0);
  const recovered = await BattleSession.open(store, { recover: true });
  assert.equal(store.recovered, 1);
  assert.equal(recovered.paused, true);
  assert.equal(recovered.revision, 7);
});

test('pending writes retain only bounded active time and do not accumulate a background gap', async () => {
  const store = new ControlledStore();
  const session = await BattleSession.open(store);
  store.gate = true;
  session.advance(0.25); // wave start waits for storage
  await tick();
  session.advance(500);
  session.advance(500);
  assert.equal(session.battle.elapsed, 0.25);
  store.gate = false;
  store.pending!.confirm();
  await tick();
  assert.equal(session.battle.elapsed, 0.5);
  await session.flush();
});

test('kills and wave completion are durable before notification and reload never replays those events', async () => {
  const factory = new IDBFactory();
  const store = await openBattleStore(factory, 'session-confirmed-rewards');
  const session = await BattleSession.open(store);
  let killsSeen = 0, clearsSeen = 0;
  session.onChange = () => {
    for (const event of session.battle.drainEvents()) {
      if (event.type === 'kill') killsSeen++;
      if (event.type === 'clear') clearsSeen++;
    }
  };
  for (let i = 0; i < 1000 && !clearsSeen; i++) {
    session.advance(0.1);
    if (session.busy) await session.flush();
  }
  assert.equal(killsSeen, 6);
  assert.equal(clearsSeen, 1);
  const before = session.battle.snapshot();
  const loaded = await store.load();
  assert.equal(loaded.kind, 'valid');
  if (loaded.kind !== 'valid') throw new Error('Expected saved battle');
  assert.deepEqual(loaded.save.battle, before);
  const reloaded = await BattleSession.open(store);
  assert.deepEqual(reloaded.battle.snapshot(), before);
  assert.deepEqual(reloaded.battle.drainEvents(), []);
  const gold = reloaded.battle.gold;
  reloaded.advance(0.025);
  await reloaded.flush();
  assert.equal(reloaded.battle.gold, gold);
  await reloaded.close();
});

test('close flushes pending combat before releasing the store', async () => {
  const store = new ControlledStore();
  const session = await BattleSession.open(store);
  session.advance(0.025);
  const before = session.battle.snapshot();
  await session.close();
  assert.equal(store.closed, true);
  assert.deepEqual(store.current?.battle, before);
  session.advance(0.25);
  assert.deepEqual(session.battle.snapshot(), before);
});


test('kill and clear notifications wait for durable acknowledgement with the entire reward state', async () => {
  for (const transition of ['kill', 'clear'] as const) {
    const fixture = new IdleBattle();
    let before = fixture.snapshot(), found = false;
    for (let step = 0; step < 10000; step++) {
      before = fixture.snapshot();
      fixture.update(0.025);
      if (fixture.drainEvents().some(event => event.type === transition)) { found = true; break; }
    }
    assert.equal(found, true);
    const after = fixture.snapshot();
    const store = new ControlledStore();
    store.current = { schemaVersion: 1, revision: 4, writtenAt: 1, paused: false, battle: before };
    const session = await BattleSession.open(store);
    store.gate = true;
    let notifications = 0;
    session.onChange = () => {
      notifications++;
      assert.deepEqual(store.current?.battle, session.battle.snapshot());
    };
    session.advance(0.025);
    await tick();
    assert.equal(session.busy, true);
    assert.equal(notifications, 0);
    assert.deepEqual(store.current.battle, before);
    assert.deepEqual(session.battle.snapshot(), after);
    store.pending!.confirm();
    await session.flush();
    assert.equal(notifications, 1);
    assert.deepEqual(store.current.battle, after);
    const reloaded = await BattleSession.open(store);
    assert.deepEqual(reloaded.battle.snapshot(), after);
    assert.deepEqual(reloaded.battle.drainEvents(), []);
  }
});
