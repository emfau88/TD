import { createSocial as createLegacySocial } from '../src/tavern-social-legacy';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { IDBFactory } from 'fake-indexeddb';
import { IdleBattle, type BattleSnapshot } from '../src/battle';
import { TavernInteractions } from '../src/tavern-interactions';
import { guidedFrost } from './helpers/guided-frost';
import { BattleSession, SessionLoadError, SessionOwnershipError, type SessionOptions, type SessionStore } from '../src/battle-session';
import { createOfflineState, type OfflineState } from '../src/offline';
import { openBattleStore, type LoadResult, type SaveEnvelope, type WriterLease } from '../src/save-store';

const copy = <T>(value: T): T => structuredClone(value);
const tick = async (): Promise<void> => { await new Promise<void>(resolve => setImmediate(resolve)); };
class ControlledStore implements SessionStore {
  clock = 1000;
  current?: SaveEnvelope;
  loaded?: LoadResult;
  gate = false;
  writes: { battle: BattleSnapshot; paused: boolean; expected: number }[] = [];
  pending?: { confirm: () => void; reject: (error: Error) => void };
  recovered = 0;
  closed = false;
  lease?: WriterLease;
  epoch = 0;
  load(): Promise<LoadResult> {
    return Promise.resolve(this.loaded ?? (this.current ? { kind: 'valid', save: copy(this.current) } : { kind: 'empty' }));
  }
  async acquireWriter(ownerId: string): Promise<WriterLease | undefined> {
    if (this.lease && this.lease.expiresAt > this.clock) return undefined;
    this.lease = { ownerId, epoch: ++this.epoch, expiresAt: this.clock + 5000 };
    return copy(this.lease);
  }
  async renewWriter(writer: WriterLease): Promise<WriterLease> {
    this.validateWriter(writer);
    this.lease!.expiresAt = this.clock + 5000;
    return copy(this.lease!);
  }
  async releaseWriter(writer: WriterLease): Promise<void> {
    if (this.lease?.ownerId === writer.ownerId && this.lease.epoch === writer.epoch) this.lease = undefined;
  }
  private validateWriter(writer?: WriterLease): void {
    if (!writer || !this.lease || this.lease.ownerId !== writer.ownerId || this.lease.epoch !== writer.epoch
      || this.lease.expiresAt <= this.clock) throw new SessionOwnershipError('Writer epoch expired or displaced');
  }
  save(battle: BattleSnapshot, paused: boolean, expected: number, options?: { writer?: WriterLease; offline?: OfflineState }): Promise<SaveEnvelope> {
    this.writes.push({ battle: copy(battle), paused, expected });
    return new Promise((resolve, reject) => {
      const confirm = () => {
        try {
          this.validateWriter(options?.writer);
          if ((this.current?.revision ?? 0) !== expected) throw new Error('Revision conflict');
          this.current = {
            schemaVersion: 2, revision: expected + 1, writtenAt: this.clock, battle: copy(battle), paused,
            offline: copy(options?.offline ?? createOfflineState(this.clock)),
          };
          resolve(copy(this.current));
        } catch (error) { reject(error); }
      };
      if (this.gate) this.pending = { confirm, reject };
      else confirm();
    });
  }
  async recoverBackup(writer?: WriterLease): Promise<SaveEnvelope> {
    this.validateWriter(writer);
    if (this.loaded?.kind !== 'recoverable') throw new Error('No backup');
    this.recovered++;
    this.current = copy(this.loaded.backup);
    this.loaded = undefined;
    return copy(this.current);
  }
  close(): void { this.closed = true; }
}
const open = (store: SessionStore, options: SessionOptions = {}) => BattleSession.open(store, {
  now: () => store instanceof ControlledStore ? store.clock : 1000, locks: null, guidedStart: false, ...options,
});
const fixture = (battle: IdleBattle, revision = 1, paused = false): SaveEnvelope => ({
  schemaVersion: 2, revision, writtenAt: 1000, paused, battle: battle.snapshot(), offline: createOfflineState(1000),
});
test('free Frost commit includes consumption and tutorial exit; duplicate and failed writes cannot duplicate the kit', async () => {
  for (const fail of [false, true]) {
    const store = new ControlledStore(); store.current = fixture(guidedFrost());
    const session = await open(store); await resume(session);
    const before = session.battle.snapshot(); store.gate = true;
    const pending = session.command(b => b.build(b.recommendedFrostPad!, 2), true);
    await tick(); assert.equal(await session.command(b => b.build(b.recommendedFrostPad!, 2), true), false);
    assert.equal(store.current!.battle.tutorialFrostUid, null);
    if (fail) store.pending!.reject(new Error('Controlled Frost write failure')); else store.pending!.confirm();
    assert.equal(await pending, !fail);
    if (fail) { assert.deepEqual(session.battle.snapshot(), before); assert.equal(store.current!.battle.tutorialFrostUid, null); }
    else {
      const saved = IdleBattle.restore(store.current!.battle)!; assert.ok(saved);
      assert.equal(saved.gold, before.gold); assert.equal(saved.introduction.stage, 'done');
      assert.equal(saved.towers.filter(t => t.def.id === 2).length, 1);
      assert.equal(saved.tutorialFrostUid, saved.towers.at(-1)!.uid);
    }
  }
});
async function resume(session: BattleSession): Promise<void> {
  if (session.pendingReward) assert.equal(await session.claimOffline(), true);
  if (session.awaitingResume) assert.equal(await session.resumeActive(), true);
}
async function advance(session: BattleSession, seconds: number): Promise<void> {
  for (let remaining = seconds; remaining > 1e-9; remaining -= 0.25) {
    session.advance(Math.min(0.25, remaining));
    if (session.busy) await session.flush();
  }
}
async function firstClear(session: BattleSession): Promise<void> {
  for (let i = 0; i < 1000 && !session.battle.liveClearedWaves.includes(1); i++) await advance(session, 0.1);
  assert.ok(session.battle.liveClearedWaves.includes(1));
}

test('fresh persistent session commits before exposure and temporary play is explicit', async () => {
  const store = new ControlledStore(), session = await open(store);
  assert.equal(session.temporary, false);
  assert.equal(session.revision, 1);
  assert.equal(store.writes.length, 1);
  assert.ok(session.writer);
  const temporary = await BattleSession.open(undefined, { now: () => 1000, guidedStart: false });
  assert.equal(temporary.temporary, true);
  assert.equal(temporary.writer, undefined);
  assert.equal(await temporary.command(battle => battle.build('tower-02')), true);
  assert.equal(temporary.battle.gold, 0);
  assert.equal(temporary.revision, 0);
});

test('purchase acknowledgement waits for commit and a concurrent click is rejected', async () => {
  const store = new ControlledStore(), session = await open(store);
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
  assert.equal(changes, 1);
  assert.equal(session.revision, 2);
  assert.equal(store.current?.battle.gold, 0);
});

test('write rejection rolls back the complete battle and freezes further economic actions', async () => {
  const store = new ControlledStore(), session = await open(store), before = session.battle.snapshot();
  store.gate = true;
  const command = session.command(battle => battle.build('tower-02'));
  await tick();
  store.pending!.reject(new Error('Storage quota exceeded'));
  assert.equal(await command, false);
  assert.match(session.error!.message, /quota/);
  assert.deepEqual(session.battle.snapshot(), before);
  session.advance(0.25);
  assert.deepEqual(session.battle.snapshot(), before);
  assert.equal(await session.command(battle => battle.upgrade(battle.towers[0].uid)), false);
  await assert.rejects(session.flush(), /quota/);
});

test('a second tab cannot simulate, load rewards or replace the active writer', async () => {
  const store = new ControlledStore(), first = await open(store);
  const revision = first.revision;
  await assert.rejects(open(store), SessionOwnershipError);
  assert.equal(store.current!.revision, revision);
  assert.equal(store.writes.length, 1);
  assert.equal(await first.command(battle => battle.upgrade(battle.towers[0].uid)), true);
});

test('expired epoch is taken over and the waking old tab cannot renew or overwrite newer gold', async () => {
  const store = new ControlledStore(), old = await open(store);
  const oldEpoch = old.writer!.epoch;
  store.clock += 6000;
  const current = await open(store);
  await resume(current);
  assert.ok(current.writer!.epoch > oldEpoch);
  assert.equal(await current.command(battle => battle.build('tower-02')), true);
  await assert.rejects(old.heartbeat(), /epoch/);
  assert.equal(await old.command(battle => battle.upgrade(battle.towers[0].uid)), false);
  assert.equal(store.current!.battle.gold, 0);
  assert.ok(old.error);
});

test('wave boundaries commit immediately; pure combat checkpoints at one second and flush stores the remainder', async () => {
  const store = new ControlledStore(), session = await open(store);
  session.advance(0.25);
  assert.equal(session.busy, true);
  await session.flush();
  const waveRevision = session.revision;
  assert.equal(store.current?.battle.wave, 1);
  await advance(session, 0.75);
  assert.equal(session.revision, waveRevision);
  session.advance(0.25);
  await session.flush();
  assert.equal(session.revision, waveRevision + 1);
  const last = session.revision;
  session.advance(0.1);
  await session.flush();
  assert.equal(session.revision, last + 1);
  assert.deepEqual(store.current?.battle, session.battle.snapshot());
});

test('pause persists and a closed paused game receives no offline production', async () => {
  const store = new ControlledStore(), session = await open(store);
  await firstClear(session);
  assert.ok(session.certificate);
  assert.equal(await session.setPaused(true), true);
  const before = session.battle.snapshot();
  await session.suspend();
  store.clock += 60 * 60 * 1000;
  const reloaded = await open(store);
  assert.equal(reloaded.paused, true);
  assert.equal(reloaded.pendingReward?.amountUnits ?? 0, 0);
  await resume(reloaded);
  reloaded.advance(1);
  assert.deepEqual(reloaded.battle.snapshot(), before);
  assert.equal(await reloaded.setPaused(false), true);
  reloaded.advance(0.025);
  assert.ok(reloaded.battle.elapsed > session.battle.elapsed);
});

test('corrupt/newer saves remain protected and backup recovery is explicit', async () => {
  for (const kind of ['unsupported', 'corrupt'] as const) {
    const store = new ControlledStore();
    store.loaded = { kind, reason: 'Protected raw state' };
    await assert.rejects(open(store), error => error instanceof SessionLoadError && !error.canRecover);
    assert.equal(store.writes.length, 0);
    assert.equal(store.lease, undefined);
  }
  const store = new ControlledStore();
  store.loaded = { kind: 'recoverable', backup: fixture(new IdleBattle(), 7, true), reason: 'Damaged primary' };
  await assert.rejects(open(store), error => error instanceof SessionLoadError && error.canRecover);
  assert.equal(store.recovered, 0);
  const recovered = await open(store, { recover: true });
  assert.equal(recovered.origin, 'recovered');
  assert.equal(store.recovered, 1);
  assert.equal(recovered.paused, true);
});

test('pending commits preserve all active time in bounded batches, without creating offline time', async () => {
  const store = new ControlledStore(), session = await open(store);
  store.gate = true;
  session.advance(0.25);
  await tick();
  for (let i = 0; i < 40; i++) session.advance(0.25);
  assert.equal(session.battle.elapsed, 0.25);
  store.gate = false;
  store.pending!.confirm();
  await tick();
  assert.equal(session.battle.elapsed, 10.25);
  assert.equal(session.awaitingResume, false);
  assert.equal(session.pendingReward, null);
  await session.flush();
  assert.deepEqual(store.current!.battle, session.battle.snapshot());
});

test('60, 10 and 2 FPS produce the same saved combat and victory-based social progress', async () => {
  const snapshots: BattleSnapshot[] = [];
  for (const fps of [60, 10, 2]) {
    const store = new ControlledStore(), b = new IdleBattle();
    b.update(4); b.highestCleared = 12;
    assert.ok(b.buildTavern(b.recommendedTavernPlot!));
    store.current = fixture(b);
    const session = await open(store); await resume(session);
    const before = session.battle.elapsed;
    for (let frame = 0; frame < fps * 10; frame++) {
      session.advance(1 / fps); await tick();
    }
    await session.flush();
    assert.equal(session.battle.elapsed - before, 10);
    assert.ok(session.battle.social.reserves.mara, 'the active companion retains her saved reserve');
    assert.deepEqual(store.current!.battle, session.battle.snapshot());
    snapshots.push(session.battle.snapshot());
    await session.close();
  }
  assert.deepEqual(snapshots[1], snapshots[0]);
  assert.deepEqual(snapshots[2], snapshots[0]);
});

test('flush, pause, hide and close finish queued active time before their boundary', async () => {
  for (const boundary of ['flush', 'pause', 'hide', 'close'] as const) {
    const store = new ControlledStore(), session = await open(store);
    store.gate = true; session.advance(.25); await tick();
    for (let frame = 0; frame < 4; frame++) session.advance(.25);
    const finish = boundary === 'pause' ? session.setPaused(true)
      : boundary === 'hide' ? session.suspend() : boundary === 'close' ? session.close() : session.flush();
    store.gate = false; store.pending!.confirm(); await finish;
    assert.equal(session.battle.elapsed, 1.25, boundary);
    assert.deepEqual(store.current!.battle, session.battle.snapshot(), boundary);
    assert.equal(session.pendingReward, null);
    if (boundary === 'pause') {
      session.advance(1); assert.equal(session.battle.elapsed, 1.25);
      assert.equal(store.current!.paused, true);
    }
  }
});

test('a real absence follows queued active time without crediting either interval twice', async () => {
  const store = new ControlledStore(), session = await open(store);
  store.gate = true; session.advance(.25); await tick();
  for (let frame = 0; frame < 3; frame++) { store.clock += 250; session.advance(.25); }
  store.clock += 3000; session.advance(3);
  store.gate = false; store.pending!.confirm(); await tick();
  assert.equal(session.battle.elapsed, 1);
  assert.equal(session.awaitingResume, true);
  assert.equal(session.offline.window!.from, store.clock - 3000);
  assert.equal(session.offline.window!.cursorHighWater, store.clock);
  assert.equal(session.pendingReward?.amountUnits ?? 0, 0);
  await resume(session); session.advance(.5); await session.flush();
  assert.equal(session.battle.elapsed, 1.5);
});

test('failed checkpoint discards unconfirmed queued time and restores the saved combat', async () => {
  const store = new ControlledStore(), session = await open(store), before = session.battle.snapshot();
  store.gate = true; session.advance(.25); await tick();
  session.advance(.5); session.advance(.5);
  store.pending!.reject(new Error('Queued-time checkpoint failed')); await tick();
  assert.deepEqual(session.battle.snapshot(), before);
  session.advance(.5); assert.deepEqual(session.battle.snapshot(), before);
  await assert.rejects(session.flush(), /checkpoint failed/);
});

test('kill/clear notifications wait for the complete reward commit and restore never replays them', async () => {
  for (const transition of ['kill', 'clear'] as const) {
    const model = new IdleBattle();
    let before = model.snapshot(), found = false;
    for (let step = 0; step < 10000; step++) {
      before = model.snapshot(); model.update(0.025);
      if (model.drainEvents().some(event => event.type === transition)) { found = true; break; }
    }
    assert.equal(found, true);
    const store = new ControlledStore();
    store.current = { ...fixture(model, 4), battle: before };
    const session = await open(store);
    await resume(session);
    store.gate = true;
    let notifications = 0;
    session.onChange = () => { notifications++; assert.deepEqual(store.current!.battle, session.battle.snapshot()); };
    session.advance(0.025); await tick();
    assert.equal(session.busy, true);
    assert.equal(notifications, 0);
    const tentative = session.battle.snapshot();
    store.pending!.confirm(); await session.flush();
    assert.equal(notifications, 1);
    assert.deepEqual(store.current!.battle, tentative);
    session.onChange = undefined;
    store.gate = false;
    await session.suspend();
    const reloaded = await open(store);
    assert.deepEqual(reloaded.battle.snapshot(), tentative);
    assert.deepEqual(reloaded.battle.drainEvents(), []);
  }
});

test('farm certificate appears only after live clear, revalidates on upgrade and survives reload without rewards', async () => {
  const store = new ControlledStore(), session = await open(store);
  assert.equal(Boolean(session.certificate), false);
  await firstClear(session);
  const certificate = session.certificate;
  assert.ok(certificate);
  const gold = session.battle.gold;
  assert.equal(await session.command(b => b.upgrade(b.towers[0].uid)), true);
  assert.notEqual(session.certificate!.fingerprint, certificate.fingerprint);
  assert.equal(session.battle.gold, gold - 60);
  await session.suspend();
  const reloaded = await open(store);
  assert.deepEqual(reloaded.certificate, session.certificate);
  assert.equal(reloaded.battle.gold, session.battle.gold);
});

test('suspend releases ownership, reserves 60% offline income and blocks combat until claim plus actual continuation', async () => {
  const store = new ControlledStore(), session = await open(store);
  await firstClear(session);
  const certificate = session.certificate!, before = session.battle.snapshot();
  await session.suspend();
  assert.equal(session.writer, undefined);
  assert.equal(store.lease, undefined);
  store.clock += 60 * 60 * 1000;
  const returned = await open(store);
  assert.equal(returned.awaitingResume, true);
  const reward = returned.pendingReward!;
  const expected = Number(BigInt(certificate.rewardGold) * 600n * 3600000n / BigInt(certificate.durationMs));
  assert.equal(reward.amountUnits, expected);
  returned.advance(0.25);
  assert.deepEqual(returned.battle.snapshot(), before);
  assert.equal(await returned.command(b => b.build('tower-02')), false);
  assert.equal(await returned.resumeActive(), false);
  const claims = await Promise.all([returned.claimOffline(), returned.claimOffline()]);
  assert.deepEqual(claims, [true, false]);
  const afterClaim = returned.battle.gold * 1000 + returned.battle.goldRemainderUnits;
  assert.equal(afterClaim, before.gold * 1000 + before.goldRemainderUnits + expected);
  assert.ok(returned.offline.window);
  assert.equal(returned.pendingReward, null);
  assert.equal(returned.awaitingResume, true);
  assert.equal(await returned.resumeActive(), true);
  assert.equal(returned.offline.window, null);
  assert.equal(returned.awaitingResume, false);
});

test('reload/claim without active continuation preserves the same two-hour budget', async () => {
  const store = new ControlledStore(), session = await open(store);
  await firstClear(session); await session.suspend();
  store.clock += 3 * 60 * 60 * 1000;
  let returned = await open(store);
  const windowId = returned.offline.window!.id;
  const first = returned.pendingReward!.amountUnits;
  assert.equal(await returned.claimOffline(), true);
  const balance = returned.battle.gold * 1000 + returned.battle.goldRemainderUnits;
  await returned.suspend();
  store.clock += 3 * 60 * 60 * 1000;
  returned = await open(store);
  assert.equal(returned.offline.window!.id, windowId);
  assert.equal(returned.offline.window!.usedMs, 2 * 60 * 60 * 1000);
  assert.equal(returned.pendingReward?.amountUnits ?? 0, 0);
  assert.equal(returned.battle.gold * 1000 + returned.battle.goldRemainderUnits, balance);
  assert.ok(first > 0);
});

test('schema 29 migration preserves an already reserved offline reward exactly once', async () => {
  const store = new ControlledStore(), session = await open(store);
  await firstClear(session); await session.suspend(); store.clock += 60000;
  const reserved = await open(store), reward = copy(reserved.pendingReward!); await reserved.suspend();
  const old = store.current!.battle as any; old.schemaVersion = 29; old.social = createLegacySocial(); old.rulesVersion = 15; old.waveRecipeVersion = 15; delete old.tutorialFrostUid;
  const before = old.gold * 1000 + old.goldRemainderUnits;
  const returned = await open(store); assert.deepEqual(returned.pendingReward, reward);
  assert.equal(returned.battle.tutorialFrostUid, null);
  assert.equal(await returned.claimOffline(), true); assert.equal(await returned.claimOffline(), false);
  assert.equal(returned.battle.gold * 1000 + returned.battle.goldRemainderUnits, before + reward.amountUnits);
});

test('failed offline claim rolls both gold and pending reward back for a safe later retry', async () => {
  const store = new ControlledStore(), session = await open(store);
  await firstClear(session); await session.suspend();
  store.clock += 60000;
  const returned = await open(store), before = returned.battle.snapshot(), reward = returned.pendingReward;
  store.gate = true;
  const claim = returned.claimOffline(); await tick();
  store.pending!.reject(new Error('Disk full'));
  assert.equal(await claim, false);
  assert.deepEqual(returned.battle.snapshot(), before);
  assert.deepEqual(returned.pendingReward, reward);
  assert.ok(returned.error);
});

test('large frame gaps become absence and never fast-forward the live wave', async () => {
  const store = new ControlledStore(), session = await open(store);
  await firstClear(session);
  const before = session.battle.snapshot();
  store.clock += 3000;
  session.advance(3);
  await tick();
  if (session.busy) await session.flush();
  assert.equal(session.awaitingResume, true);
  assert.deepEqual(session.battle.snapshot(), before);
  assert.equal(session.pendingReward!.elapsedMs, 3000);
  assert.ok(session.pendingReward!.amountUnits > 0);
});

test('actual IndexedDB integration rejects a second tab and preserves exact confirmed rewards across return', async () => {
  const factory = new IDBFactory();
  const store = await openBattleStore(factory, 'session-confirmed-rewards-b04', () => 1000);
  const session = await open(store);
  await assert.rejects(open(store), SessionOwnershipError);
  await firstClear(session);
  const before = session.battle.snapshot();
  await session.suspend();
  const reloaded = await open(store);
  assert.deepEqual(reloaded.battle.snapshot(), before);
  assert.deepEqual(reloaded.battle.drainEvents(), []);
  await resume(reloaded);
  await reloaded.close();
});

test('close is idempotent, stores the final combat state and releases the writer', async () => {
  const store = new ControlledStore(), session = await open(store);
  session.advance(0.025);
  const before = session.battle.snapshot();
  await Promise.all([session.close(), session.close()]);
  assert.equal(store.closed, true);
  assert.equal(store.lease, undefined);
  assert.deepEqual(store.current?.battle, before);
  session.advance(0.25);
  assert.deepEqual(session.battle.snapshot(), before);
});


test('Web Locks use a short gate, and an unavailable browser lock still permits valid IDB takeover', async () => {
  const store = new ControlledStore();
  let released = false;
  const locks = {
    request: async (_name: string, _options: unknown, callback: (lock: unknown) => Promise<void>) => {
      await callback({ name: 'spire-idle-bastion-writer', mode: 'exclusive' });
      released = true;
    },
  } as unknown as Pick<LockManager, 'request'>;
  const first = await open(store, { locks });
  await tick();
  assert.equal(released, true);
  assert.ok(first.writer);
  store.clock += 6000;
  const unavailable = {
    request: async (_name: string, _options: unknown, callback: (lock: null) => Promise<void>) => callback(null),
  } as unknown as Pick<LockManager, 'request'>;
  const takeover = await open(store, { locks: unavailable });
  assert.ok(takeover.writer!.epoch > first.writer!.epoch);
  await assert.rejects(first.heartbeat());
});

test('claims preserve the fixed absence window and continuation includes a later tail exactly once', async () => {
  const store = new ControlledStore(), session = await open(store);
  await firstClear(session); await session.suspend();
  store.clock += 60000;
  const returned = await open(store), certificate = session.certificate!;
  const before = returned.battle.gold * 1000 + returned.battle.goldRemainderUnits;
  assert.equal(await returned.claimOffline(), true);
  store.clock += 3000;
  await returned.heartbeat(); // Owns the dialog while the user decides to continue.
  assert.equal(await returned.resumeActive(), true);
  const expected = Number(BigInt(certificate.rewardGold) * 600n * 63000n / BigInt(certificate.durationMs));
  assert.equal(returned.battle.gold * 1000 + returned.battle.goldRemainderUnits, before + expected);
  assert.equal(await returned.resumeActive(), false);
  assert.equal(returned.battle.gold * 1000 + returned.battle.goldRemainderUnits, before + expected);
});

test('a backwards clock cannot replay reserved offline time or move its cursor backwards', async () => {
  const store = new ControlledStore(), session = await open(store);
  await firstClear(session); await session.suspend();
  store.clock += 60000;
  let returned = await open(store);
  const reward = returned.pendingReward!, cursor = returned.offline.window!.cursorHighWater;
  await returned.suspend();
  store.clock -= 30000;
  returned = await open(store);
  assert.equal(returned.offline.window!.cursorHighWater, cursor);
  assert.deepEqual(returned.pendingReward, reward);
  assert.equal(await returned.claimOffline(), true);
  const balance = returned.battle.gold * 1000 + returned.battle.goldRemainderUnits;
  await returned.suspend();
  store.clock += 20000; // Still below the original consumed high water.
  returned = await open(store);
  assert.equal(returned.pendingReward, null);
  assert.equal(returned.battle.gold * 1000 + returned.battle.goldRemainderUnits, balance);
});

test('temporary play discards a large frame gap without offline gold or a return dialog', async () => {
  let now = 1000;
  const session = await BattleSession.open(undefined, { now: () => now, guidedStart: false });
  await firstClear(session);
  assert.ok(session.certificate);
  const before = session.battle.snapshot(), offline = session.offline;
  now += 60 * 60 * 1000;
  session.advance(3600);
  await tick();
  assert.equal(session.awaitingResume, false);
  assert.equal(session.pendingReward, null);
  assert.equal(session.offline.window, null);
  assert.deepEqual(session.offline, offline);
  assert.deepEqual(session.battle.snapshot(), before);
  assert.equal(await session.claimOffline(), false);
  session.advance(0.025);
  assert.ok(session.battle.elapsed > before.elapsed);
});

async function holdCheckpoint(session: BattleSession, store: ControlledStore): Promise<void> {
  store.gate = true;
  for (let i = 0; i < 4 && !session.busy; i++) session.advance(.25);
  await tick();
  assert.equal(session.busy, true);
  assert.equal(session.inputBusy, false);
  assert.ok(store.pending);
}

test('background checkpoint accepts exactly one queued purchase and validates it after saving', async () => {
  const store = new ControlledStore(), session = await open(store);
  await holdCheckpoint(session, store);
  let calls = 0;
  const purchase = session.command(b => { calls++; b.build('tower-02'); });
  assert.equal(session.inputBusy, true); assert.equal(calls, 0);
  assert.equal(await session.command(b => b.build('tower-03')), false);
  store.gate = false; store.pending!.confirm();
  assert.equal(await purchase, true); assert.equal(calls, 1);
  assert.equal(store.current!.battle.gold, 0); assert.equal(session.inputBusy, false);
  await session.close();
});

test('failed background write rejects the queued action without invoking its mutation', async () => {
  const store = new ControlledStore(), session = await open(store);
  await holdCheckpoint(session, store);
  let calls = 0;
  const purchase = session.command(() => { calls++; });
  store.pending!.reject(new Error('checkpoint failed'));
  assert.equal(await purchase, false); assert.equal(calls, 0);
  assert.equal(session.inputBusy, false); assert.ok(session.error);
  assert.equal(session.battle.gold, 75);
  await assert.rejects(session.close(), /checkpoint failed/);
});

test('pause click during a checkpoint persists exactly once', async () => {
  const store = new ControlledStore(), session = await open(store);
  await holdCheckpoint(session, store);
  const pause = session.setPaused(true);
  assert.equal(await session.setPaused(false), false);
  store.gate = false; store.pending!.confirm();
  assert.equal(await pause, true); assert.equal(session.paused, true);
  assert.equal(store.current!.paused, true); assert.equal(session.inputBusy, false);
  await session.close();
});

test('gift click during autosave remains responsive without duplicate gifts or points', async () => {
  const b = new IdleBattle(); b.update(4); b.highestCleared = 12;
  b.buildTavern(b.recommendedTavernPlot!);
  for (let i = 0; i < 3; i++) b.interactCompanion('mara', 'talk');
  const store = new ControlledStore(); store.current = fixture(b);
  const session = await open(store); await resume(session);
  const ui = new TavernInteractions();
  await holdCheckpoint(session, store);
  const gift = ui.run(session, 'gift');
  assert.equal(await ui.run(session, 'gift'), null);
  store.gate = false; store.pending!.confirm();
  assert.equal((await gift)?.points, 12);
  assert.equal(session.battle.social.points.mara, 35); assert.equal(session.battle.social.gifts, 0);
  assert.equal(store.current!.battle.social.points.mara, 35);
  await session.close();
});

test('new gift notices wait for a durable save and do not replay on restore', async () => {
  const b = new IdleBattle(); b.update(4); b.highestCleared = 12; b.buildTavern(b.recommendedTavernPlot!);
  const store = new ControlledStore(); store.current = fixture(b);
  const session = await open(store); await resume(session); session.battle.drainEvents();
  store.gate = true;
  const command = session.command(battle => { battle.social.gifts++; }); await tick();
  assert.equal(session.battle.drainEvents().some(e => e.type === 'gift-found'), false);
  store.gate = false; store.pending!.confirm(); assert.equal(await command, true);
  assert.deepEqual(session.battle.drainEvents().filter(e => e.type === 'gift-found'), [{ type: 'gift-found', amount: 1 }]);
  assert.equal(IdleBattle.restore(store.current!.battle)!.drainEvents().length, 0);
  store.gate = true;
  const failed = session.command(battle => { battle.social.gifts++; }); await tick();
  store.pending!.reject(new Error('gift save rejected')); assert.equal(await failed, false);
  assert.equal(session.battle.drainEvents().some(e => e.type === 'gift-found'), false);
});


test('tavern hold freezes every combat field in normal and boss fights at different frame rates', async () => {
  const saved = JSON.parse(readFileSync(new URL('../../../artifacts/idle-bastion/acceptance/early-balance-release/selected/B-snapshots.json', import.meta.url), 'utf8'));
  for (const key of ['active10', 'channel15', 'channel25']) {
    const battle = IdleBattle.restore(saved[key]); assert.ok(battle, key);
    const store = new ControlledStore(); store.current = fixture(battle);
    const session = await open(store); await resume(session);
    session.setTavernOpen(true); await session.flush();
    const before = session.battle.snapshot();
    for (const fps of [60, 10, 2]) for (let i = 0; i < fps * 3; i++) session.advance(1 / fps);
    session.advance(90); // A stalled foreground tavern must not become an offline gap.
    await session.flush();
    assert.deepEqual(session.battle.snapshot(), before, key);
    assert.equal(session.awaitingResume, false); assert.equal(session.offline.window, null);
    assert.equal(store.current!.paused, false);
    session.setTavernOpen(false); await session.flush(); await advance(session, .25);
    assert.ok(session.battle.elapsed > before.elapsed);
    await session.close();
  }
});

test('tavern interactions commit while combat is held, without changing manual pause', async () => {
  for (const paused of [false, true]) {
    const b = new IdleBattle(); b.update(4); b.highestCleared = 12; b.buildTavern(b.recommendedTavernPlot!);
    const store = new ControlledStore(); store.current = fixture(b, 1, paused);
    const session = await open(store); await resume(session);
    const elapsed = session.battle.elapsed;
    session.setTavernOpen(true); await session.flush();
    assert.equal((await new TavernInteractions().run(session, 'talk'))?.points, 8);
    assert.equal(store.current!.battle.social.points.mara, 8);
    for (let i = 0; i < 4; i++) {
      session.setTavernOpen(true); session.advance(1); // internal views/repeated opening
      assert.equal(session.battle.elapsed, elapsed);
      session.setTavernOpen(false); await session.flush();
      assert.equal(session.paused, paused); assert.equal(store.current!.paused, paused);
      session.setTavernOpen(true);
    }
    await session.close();
    const loaded = await open(store); await resume(loaded);
    assert.equal(loaded.tavernOpen, false); assert.equal(loaded.paused, paused);
    await advance(loaded, .25);
    assert.equal(loaded.battle.elapsed > elapsed, !paused);
    await loaded.close();
  }
});

test('tavern heartbeat checkpoints exclude visit time; real departure retains existing offline policy', async () => {
  for (const paused of [false, true]) {
    const store = new ControlledStore(), session = await open(store);
    await firstClear(session); const certificate = session.certificate!;
    if (paused) await session.setPaused(true);
    session.setTavernOpen(true); await session.flush();
    const before = session.battle.snapshot();
    for (let i = 0; i < 30; i++) {
      store.clock += 1000; session.advance(1); await session.heartbeat();
    }
    assert.deepEqual(session.battle.snapshot(), before);
    assert.equal(store.current!.offline.baseline.at, store.clock);
    assert.equal(store.current!.offline.window, null);
    await session.suspend(); const departedAt = store.clock;
    store.clock += 60000;
    const returned = await open(store);
    assert.equal(returned.offline.window!.from, departedAt);
    assert.equal(returned.pendingReward!.elapsedMs, 60000);
    const expected = paused ? 0 : Number(BigInt(certificate.rewardGold) * 600n * 60000n / BigInt(certificate.durationMs));
    assert.equal(returned.pendingReward!.amountUnits, expected);
    returned.setTavernOpen(true); await resume(returned); // same open dialog after background return
    const resumed = returned.battle.snapshot(); returned.advance(.5);
    assert.deepEqual(returned.battle.snapshot(), resumed);
    returned.setTavernOpen(false); await returned.flush();
    assert.equal(returned.paused, paused);
    await returned.close();
  }
});

test('opening tavern during a pending write retains only previously accepted combat time', async () => {
  const store = new ControlledStore(), session = await open(store);
  await holdCheckpoint(session, store);
  session.advance(.5);
  const before = session.battle.elapsed;
  session.setTavernOpen(true); session.advance(1); session.advance(120);
  store.gate = false; store.pending!.confirm(); await session.flush();
  assert.ok(Math.abs(session.battle.elapsed - before - .5) < 1e-8);
  const held = session.battle.snapshot(); session.advance(1); await session.flush();
  assert.deepEqual(session.battle.snapshot(), held);
  assert.equal(session.offline.window, null);
  await session.close();
});
