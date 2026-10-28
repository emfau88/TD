import { COMPANION_IDS, personalGiftReady } from './tavern-social';
/** B03/B04 transaction coordinator. Only the lease owner simulates or credits
 * gold. Complete combat, pause and offline state share one durable boundary.
 */
import { IdleBattle, type BattleSnapshot } from './battle';
import { certifyFarm, defenseFingerprint, type FarmCertificate } from './farming';
import {
  offlinePolicy, activateOffline, beginAbsence, checkpointActive, claimOffline as claimReward,
  createOfflineState, reserveOffline, type OfflineReward, type OfflineState,
} from './offline';
import type { BattleSaveStore, SaveEnvelope, WriterLease } from './save-store';

export type SessionStore = Pick<BattleSaveStore,
  'load' | 'save' | 'recoverBackup' | 'close' | 'acquireWriter' | 'renewWriter' | 'releaseWriter'>;
export interface SessionOptions {
  /** Non-interactive combat fixtures can opt out; browser sessions always guide new players. */
  guidedStart?: boolean;
  recover?: boolean;
  now?: () => number;
  ownerId?: string;
  locks?: Pick<LockManager, 'request'> | null;
}
export class SessionLoadError extends Error {
  constructor(message: string, public readonly canRecover: boolean) {
    super(message); this.name = 'SessionLoadError';
  }
}
export class SessionOwnershipError extends Error {
  constructor(message = 'Spiel bereits in einem anderen Tab aktiv.') {
    super(message); this.name = 'SessionOwnershipError';
  }
}
const LIVE_BATCH_SECONDS = 0.25;
const CHECKPOINT_SECONDS = 1;
const GAP_SECONDS = 2;
const same = (a: unknown, b: unknown): boolean => JSON.stringify(a) === JSON.stringify(b);
const clone = <T>(value: T): T => structuredClone(value);
const asError = (value: unknown): Error => value instanceof Error ? value : new Error(String(value));

/** Web Locks serialize a short acquisition gate when available. An unavailable
 * browser lock never blocks expired-IDB-lease takeover; epochs fence old tabs.
 */
async function webWriterLock(manager?: Pick<LockManager, 'request'> | null): Promise<(() => void) | undefined> {
  if (!manager) return undefined;
  return new Promise((resolve, reject) => {
    void manager.request('spire-idle-bastion-writer', { ifAvailable: true, mode: 'exclusive' }, async lock => {
      if (!lock) { resolve(undefined); return; }
      let release!: () => void;
      const held = new Promise<void>(done => { release = done; });
      resolve(release);
      await held;
    }).catch(reject);
  });
}

export class BattleSession {
  /** Runtime provenance only; never added to the combat save. */
  origin: 'new' | 'loaded' | 'recovered' = 'new';
  onChange?: () => void;
  onError?: (error: Error) => void;
  private currentBattle: IdleBattle;
  private committedSnapshot: BattleSnapshot;
  private committedPaused: boolean;
  private currentPaused: boolean;
  /** Presentation hold, independent of the saved manual pause. */
  private currentTavernOpen = false;
  private currentRevision: number;
  private currentError?: Error;
  private pendingWrite?: Promise<void>;
  private pendingSeconds = 0;
  private checkpointSeconds = 0;
  private closing = false;
  private closed = false;
  private currentOffline: OfflineState;
  private committedOffline: OfflineState;
  private currentCertificate: FarmCertificate | null = null;
  private farmKey = '';
  private currentWriter?: WriterLease;
  private currentSuspended = false;
  private waitingForResume = false;
  private renewal?: Promise<void>;
  private suspension?: Promise<void>;
  private transitioning = false;
  private actionPending = false;
  private maraOfflineWelcomeSeen = false;
  private committedMaraOfflineWelcomeSeen = false;
  private showingMaraOfflineWelcome = false;

  private constructor(
    battle: IdleBattle, private readonly store: SessionStore | undefined,
    private readonly now: () => number, writer?: WriterLease,
    private releaseWebLock?: () => void, save?: SaveEnvelope,
  ) {
    this.currentBattle = battle;
    this.committedSnapshot = battle.snapshot();
    this.committedPaused = this.currentPaused = save?.paused ?? false;
    this.currentRevision = save?.revision ?? 0;
    this.committedMaraOfflineWelcomeSeen = this.maraOfflineWelcomeSeen = save?.maraOfflineWelcomeSeen === true;
    this.currentOffline = clone(save?.offline ?? createOfflineState(now()));
    this.committedOffline = clone(this.currentOffline);
    this.currentWriter = writer;
    this.currentCertificate = clone(save?.offline.baseline.certificate ?? null);
    this.refreshFarm();
  }

  /** A fresh persistent balance is committed before exposure. A rejected save
   * is never overwritten. No store explicitly means temporary play.
   */
  static async open(store?: SessionStore, options: SessionOptions = {}): Promise<BattleSession> {
    const now = options.now ?? Date.now;
    const fresh = () => options.guidedStart === false ? new IdleBattle() : IdleBattle.newGame();
    if (!store) return new BattleSession(fresh(), undefined, now);
    const manager = options.locks === undefined
      ? (typeof navigator === 'undefined' ? undefined : navigator.locks) : options.locks;
    const releaseWeb = await webWriterLock(manager);
    let writer: WriterLease | undefined;
    try {
      const ownerId = options.ownerId ?? globalThis.crypto.randomUUID();
      writer = await store.acquireWriter(ownerId);
      releaseWeb?.();
      if (!writer) throw new SessionOwnershipError();
      let loaded = await store.load();
      if (loaded.kind === 'recoverable' && options.recover) {
        await store.recoverBackup(writer);
        loaded = await store.load();
      }
      if (loaded.kind === 'recoverable') throw new SessionLoadError(loaded.reason, true);
      if (loaded.kind === 'corrupt' || loaded.kind === 'unsupported') throw new SessionLoadError(loaded.reason, false);
      if (loaded.kind === 'valid') {
        const battle = IdleBattle.restore(loaded.save.battle);
        if (!battle) throw new SessionLoadError('Der gespeicherte Kampf ist ungültig.', false);
        const session = new BattleSession(battle, store, now, writer, undefined, loaded.save);
        session.origin = options.recover ? 'recovered' : 'loaded';
        session.currentOffline = (battle.preparing || battle.learningPaused) ? createOfflineState(now()) : reserveOffline(session.currentOffline, now());
        session.waitingForResume = !!session.currentOffline.window;
        await session.commit();
        return session;
      }
      const session = new BattleSession(fresh(), store, now, writer, undefined);
      // Initial commit is mandatory even if the model equals its constructor.
      await session.commit(true);
      return session;
    } catch (error) {
      if (writer) await store.releaseWriter(writer).catch(() => undefined);
      releaseWeb?.();
      throw error;
    }
  }

  get battle(): IdleBattle { return this.currentBattle; }
  get paused(): boolean { return this.currentPaused; }
  get tavernOpen(): boolean { return this.currentTavernOpen; }

  /** Freeze new frames immediately. Complete accepted writes/time and persist
   * the active boundary without changing manual pause or the offline policy. */
  setTavernOpen(open: boolean): void {
    if (this.currentTavernOpen === open) return;
    this.currentTavernOpen = open;
    void this.flush().catch(() => undefined);
    this.onChange?.();
  }
  get busy(): boolean { return !!this.pendingWrite || this.transitioning; }
  /** Background checkpoints do not make controls unavailable. */
  get inputBusy(): boolean { return this.actionPending || this.transitioning; }
  get error(): Error | undefined { return this.currentError; }
  get revision(): number { return this.currentRevision; }
  get temporary(): boolean { return !this.store; }
  get certificate(): FarmCertificate | null { return this.currentCertificate && clone(this.currentCertificate); }
  get offline(): OfflineState { return clone(this.currentOffline); }
  get pendingReward(): OfflineReward | null { return this.currentOffline.pendingReward && clone(this.currentOffline.pendingReward); }
  get writer(): WriterLease | undefined { return this.currentWriter && { ...this.currentWriter }; }
  get suspended(): boolean { return this.currentSuspended; }
  get awaitingResume(): boolean { return this.waitingForResume; }
  get showMaraOfflineWelcome(): boolean { return this.showingMaraOfflineWelcome && this.waitingForResume && !this.currentError; }

  advance(dtSeconds: number): void {
    if (this.closed || this.closing || this.currentError || this.transitioning
      || (!!this.store && !this.currentWriter) || this.currentPaused || this.currentTavernOpen || this.currentSuspended || this.waitingForResume
      || !Number.isFinite(dtSeconds) || dtSeconds <= 0) return;
    if (dtSeconds > GAP_SECONDS && (this.currentBattle.preparing || this.currentBattle.learningPaused)) return;
    if (dtSeconds > GAP_SECONDS) {
      // Temporary play has no offline economy. Discard the unattended gap.
      if (this.temporary) return;
      this.waitingForResume = true;
      this.transitioning = true;
      void this.handleGap(dtSeconds).catch(() => undefined);
      return;
    }
    this.pendingSeconds += dtSeconds;
    this.drainActiveTime();
  }

  /** Keep every observed active second, including time received during a write.
   * Batches stop at a durable boundary; queued live time is never an offline gap.
   * Suspension/close block NEW frames but still finish this already earned time.
   */
  private drainActiveTime(): void {
    while (this.pendingSeconds > 1e-9 && !this.pendingWrite && !this.currentError) {
      const seconds = Math.min(LIVE_BATCH_SECONDS, this.pendingSeconds);
      this.pendingSeconds = Math.max(0, this.pendingSeconds - seconds);
      const before = this.economicState();
      this.currentBattle.update(seconds);
      this.checkpointSeconds += seconds;
      this.refreshFarm();
      if (before !== this.economicState() || (!this.currentBattle.preparing && !this.currentBattle.learningPaused && this.checkpointSeconds >= CHECKPOINT_SECONDS)) {
        void this.commit().catch(() => undefined);
      }
    }
  }

  /** After any background write, callbacks mutate synchronously; acknowledgement follows commit.
   * Concurrent clicks and purchases in the return dialog are rejected.
   */
  async command(fn: (battle: IdleBattle) => unknown, waitForSave = true): Promise<boolean> {
    return this.runAction(async () => {
      if (this.unavailable()) return false;
      const before = this.currentBattle.snapshot();
      const oldEvents = this.currentBattle.events.slice();
      try {
        const result = fn(this.currentBattle);
        if (result && typeof (result as { then?: unknown }).then === 'function') throw new Error('Spielbefehle müssen synchron sein.');
        this.refreshFarm();
        if (same(before, this.currentBattle.snapshot())) return false;
        await this.commit();
        return true;
      } catch (value) {
        if (!this.currentError) {
          this.currentBattle = IdleBattle.restore(before)!;
          this.currentBattle.events = oldEvents;
          this.refreshFarm();
          this.fail(asError(value), false);
        }
        return false;
      }
    }, waitForSave);
  }

  async relocateSettlement(): Promise<boolean> {
    if (!this.currentPaused) return false;
    return this.command(battle => battle.relocateSettlement(), true);
  }

  async setPaused(paused: boolean): Promise<boolean> {
    return this.runAction(async () => {
      if (this.unavailable() || this.currentPaused === paused) return false;
      this.currentPaused = paused;
      this.pendingSeconds = 0;
      try { await this.commit(); return true; } catch { return false; }
    });
  }

  /** Claim reserves any additional elapsed part of the SAME window and credits
   * it with the pending amount atomically. Claim alone never starts a new cap.
   */
  async claimOffline(): Promise<boolean> {
    return this.runAction(async () => {
      if (this.closed || this.closing || this.currentError || this.currentSuspended || this.busy || !this.waitingForResume) return false;
      try {
        this.currentOffline = reserveOffline(this.currentOffline, this.now());
        const reward = this.currentOffline.pendingReward;
        if (!reward) return false;
        const claimed = claimReward(this.currentOffline, reward.id);
        this.currentOffline = claimed.state;
        this.currentBattle.creditOfflineUnits(claimed.amountUnits);
        await this.commit();
        return true;
      } catch (error) { this.fail(asError(error), true); return false; }
    });
  }

  /** Actual continuation ends the window. A pending dialog reward must first
   * be claimed; any small tail since that claim is reserved+credited together
   * with activation, avoiding an endless chain of tiny return dialogs.
   */
  async resumeActive(): Promise<boolean> {
    return this.runAction(async () => {
      if (this.closed || this.closing || this.currentError || this.currentSuspended || this.busy
        || !this.waitingForResume || this.currentOffline.pendingReward) return false;
      try {
        let next = reserveOffline(this.currentOffline, this.now());
        if (next.pendingReward) {
          const claimed = claimReward(next, next.pendingReward.id);
          this.currentBattle.creditOfflineUnits(claimed.amountUnits);
          next = claimed.state;
        }
        this.currentOffline = activateOffline(next, this.now(), this.currentCertificate, this.currentPaused || this.currentBattle.learningPaused, offlinePolicy(this.currentBattle.settlement.warehouseBuilt));
        this.waitingForResume = false;
        this.showingMaraOfflineWelcome = false;
        await this.commit();
        return true;
      } catch (error) { this.fail(asError(error), true); return false; }
    });
  }

  /** Browser calls about once per second. Renewal never grants a new epoch to
   * an expired or displaced writer, so a waking old tab freezes explicitly.
   */
  heartbeat(): Promise<void> {
    if (!this.store || !this.currentWriter || this.currentSuspended || this.closed || this.closing || this.currentError) return Promise.resolve();
    if (this.renewal) return this.renewal;
    this.renewal = this.store.renewWriter(this.currentWriter).then(async writer => {
      this.currentWriter = writer;
      // A visible tavern is active play, not an offline earnings window. Keep
      // the durable time boundary moving even though no combat frames run.
      if (this.currentTavernOpen && !this.waitingForResume && !this.transitioning) await this.flush();
    }).catch(error => {
      this.fail(asError(error), true);
      throw error;
    }).finally(() => { this.renewal = undefined; });
    return this.renewal;
  }

  async flush(): Promise<void> {
    while (this.pendingWrite) await this.pendingWrite;
    if (this.currentError) throw this.currentError;
    if (this.closed || this.currentSuspended) return;
    await this.commit();
  }

  /** Hide commits the exact active boundary, then releases IDB and Web Locks.
   * Return must reopen under a fresh lease and reload the latest state.
   */
  suspend(): Promise<void> {
    if (this.suspension) return this.suspension;
    if (this.closed) return Promise.resolve();
    this.currentSuspended = true;
    this.suspension = (async () => {
      try {
        while (this.pendingWrite) await this.pendingWrite;
        if (this.currentError) throw this.currentError;
        if (!this.waitingForResume) this.currentOffline = beginAbsence(this.currentOffline, this.now(), this.currentCertificate, this.currentPaused || this.currentBattle.learningPaused, offlinePolicy(this.currentBattle.settlement.warehouseBuilt));
        await this.commit();
      } finally {
        await this.releaseOwnership();
        this.onChange?.();
      }
    })();
    return this.suspension;
  }

  async close(): Promise<void> {
    if (this.closed) return;
    this.closing = true;
    try { await this.suspend(); }
    finally { this.closed = true; this.store?.close(); }
  }

  /** Reserve exactly one user action before awaiting a background write.
   * Validation stays inside the operation and runs against the committed state.
   * Other taps cannot join the queue and duplicate a purchase or reward.
   */
  private async runAction(action: () => Promise<boolean>, waitForSave = true): Promise<boolean> {
    if (this.inputBusy) return false;
    this.actionPending = true;
    try {
      if (waitForSave) {
        while (this.pendingWrite) {
          try { await this.pendingWrite; } catch { return false; }
        }
      }
      return await action();
    } finally {
      this.actionPending = false;
      this.onChange?.();
    }
  }
  private unavailable(): boolean {
    return this.closed || this.closing || this.busy || !!this.currentError || this.currentSuspended
      || this.waitingForResume || (!!this.store && !this.currentWriter);
  }
  private economicState(): string {
    const b = this.currentBattle;
    return `${b.introduction.stage}/${b.discovery}/${b.learningPaused}/${b.gold}/${b.goldRemainderUnits}/${b.earned}/${b.kills}/${b.lives}/${b.wave}/${b.phase}/${b.mode}/${b.attemptId}/${b.tutorial.frostSeen}`;
  }
  private refreshFarm(): void {
    const key = `${defenseFingerprint(this.currentBattle)}/${this.currentBattle.liveClearedWaves.join(',')}`;
    if (key === this.farmKey) return;
    this.farmKey = key;
    this.currentCertificate = certifyFarm(this.currentBattle, this.currentCertificate ?? undefined) ?? null;
    this.currentBattle.setFarmWave(this.currentCertificate?.wave ?? 0);
  }
  private async handleGap(seconds: number): Promise<void> {
    try {
      while (this.pendingWrite) await this.pendingWrite;
      await this.heartbeat();
      const end = this.now();
      const start = Math.max(this.currentOffline.baseline.at, end - Math.floor(seconds * 1000));
      this.currentOffline = beginAbsence(this.currentOffline, start, this.currentCertificate, this.currentPaused || this.currentBattle.learningPaused, offlinePolicy(this.currentBattle.settlement.warehouseBuilt));
      this.currentOffline = reserveOffline(this.currentOffline, end);
      await this.commit();
    } catch (error) { this.fail(asError(error), true); throw error; }
    finally { this.transitioning = false; this.onChange?.(); }
  }
  private commit(force = false): Promise<void> {
    if (this.pendingWrite) return this.pendingWrite;
    if (this.currentError) return Promise.reject(this.currentError);
    // Persist alongside the reserved receipt before exposing the return dialog.
    // Reloading an unclaimed receipt must not replay the greeting.
    if (this.waitingForResume && !this.maraOfflineWelcomeSeen && (this.currentOffline.pendingReward?.amountUnits ?? 0) > 0) {
      this.maraOfflineWelcomeSeen = true;
      this.showingMaraOfflineWelcome = true;
    }
    const maraOfflineWelcomeSeen = this.maraOfflineWelcomeSeen;
    const snapshot = this.currentBattle.snapshot(), paused = this.currentPaused;
    if (!this.waitingForResume && !this.currentSuspended) {
      this.currentOffline = checkpointActive(this.currentOffline, this.now(), this.currentCertificate, paused || this.currentBattle.learningPaused, offlinePolicy(this.currentBattle.settlement.warehouseBuilt));
    }
    const offline = clone(this.currentOffline);
    if (!force && same(snapshot, this.committedSnapshot) && paused === this.committedPaused && same(offline, this.committedOffline) && maraOfflineWelcomeSeen === this.committedMaraOfflineWelcomeSeen) return Promise.resolve();
    const task = Promise.resolve().then(async () => {
      try {
        if (this.store) {
          if (!this.currentWriter) throw new SessionOwnershipError('Dieser Tab besitzt keine Schreibberechtigung mehr.');
          const save = await this.store.save(snapshot, paused, this.currentRevision, { writer: this.currentWriter, offline, maraOfflineWelcomeSeen });
          this.currentRevision = save.revision;
        }
        // Publish gift notices only after the complete snapshot is durable.
        const priorSocial = this.committedSnapshot.social;
        if (snapshot.social.gifts > priorSocial.gifts) {
          this.currentBattle.events.push({ type: 'gift-found', amount: snapshot.social.gifts - priorSocial.gifts });
        }
        for (const companion of COMPANION_IDS) {
          if (personalGiftReady(snapshot.social, companion) && !personalGiftReady(priorSocial, companion)) {
            this.currentBattle.events.push({ type: 'personal-gift', companion });
          }
        }
        this.committedSnapshot = snapshot;
        this.committedPaused = paused;
        this.committedOffline = clone(offline);
        this.committedMaraOfflineWelcomeSeen = maraOfflineWelcomeSeen;
        this.checkpointSeconds = 0;
      } catch (value) { this.fail(asError(value), true); throw this.currentError; }
    }).then(() => {
      this.pendingWrite = undefined;
      if (!this.actionPending) this.onChange?.();
      this.drainActiveTime();
    }, error => {
      this.pendingWrite = undefined;
      if (!this.actionPending) this.onChange?.();
      throw error;
    });
    this.pendingWrite = task;
    return task;
  }
  private fail(error: Error, rollback: boolean): void {
    if (rollback) {
      this.currentBattle = IdleBattle.restore(this.committedSnapshot)!;
      this.currentPaused = this.committedPaused;
      this.currentOffline = clone(this.committedOffline);
      this.maraOfflineWelcomeSeen = this.committedMaraOfflineWelcomeSeen;
      this.showingMaraOfflineWelcome = false;
      this.farmKey = '';
      this.refreshFarm();
      this.waitingForResume = !!this.currentOffline.window;
    }
    this.currentError = error;
    this.pendingSeconds = 0;
    this.onError?.(error);
  }
  private async releaseOwnership(): Promise<void> {
    const writer = this.currentWriter;
    this.currentWriter = undefined;
    if (writer && this.store) await this.store.releaseWriter(writer).catch(() => undefined);
    this.releaseWebLock?.();
    this.releaseWebLock = undefined;
  }
}
