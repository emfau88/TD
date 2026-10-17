/** Persistence boundary for B03. Scene code submits commands and renders only
 * confirmed economic state. Combat may move between periodic checkpoints;
 * economic transitions freeze until their complete snapshot commits.
 */
import { IdleBattle, type BattleSnapshot } from './battle';
import type { BattleSaveStore, SaveEnvelope } from './save-store';

export type SessionStore = Pick<BattleSaveStore, 'load' | 'save' | 'recoverBackup' | 'close'>;

export class SessionLoadError extends Error {
  constructor(message: string, public readonly canRecover: boolean) {
    super(message);
    this.name = 'SessionLoadError';
  }
}

const MAX_FRAME_SECONDS = 0.25;
const CHECKPOINT_SECONDS = 1;
const sameSnapshot = (a: BattleSnapshot, b: BattleSnapshot): boolean => JSON.stringify(a) === JSON.stringify(b);
const asError = (value: unknown): Error => value instanceof Error ? value : new Error(String(value));

export class BattleSession {
  onChange?: () => void;
  onError?: (error: Error) => void;
  private currentBattle: IdleBattle;
  private committedSnapshot: BattleSnapshot;
  private committedPaused: boolean;
  private currentPaused: boolean;
  private currentRevision: number;
  private currentError?: Error;
  private pendingWrite?: Promise<void>;
  private pendingSeconds = 0;
  private checkpointSeconds = 0;
  private closing = false;
  private closed = false;

  private constructor(battle: IdleBattle, private readonly store: SessionStore | undefined, save?: SaveEnvelope) {
    this.currentBattle = battle;
    this.committedSnapshot = battle.snapshot();
    this.committedPaused = this.currentPaused = save?.paused ?? false;
    this.currentRevision = save?.revision ?? 0;
  }

  /** No store means explicitly temporary play. Loading never catches damaged or
   * future saves and silently replaces them with a fresh auto-saving game.
   */
  static async open(store?: SessionStore, options: { recover?: boolean } = {}): Promise<BattleSession> {
    if (!store) return new BattleSession(new IdleBattle(), undefined);
    let loaded = await store.load();
    if (loaded.kind === 'recoverable' && options.recover) {
      await store.recoverBackup();
      loaded = await store.load();
    }
    if (loaded.kind === 'recoverable') throw new SessionLoadError(loaded.reason, true);
    if (loaded.kind === 'corrupt' || loaded.kind === 'unsupported') throw new SessionLoadError(loaded.reason, false);
    if (loaded.kind === 'valid') {
      const battle = IdleBattle.restore(loaded.save.battle);
      if (!battle) throw new SessionLoadError('Der gespeicherte Kampf ist ungültig.', false);
      return new BattleSession(battle, store, loaded.save);
    }
    const battle = new IdleBattle();
    // The very first protected tower, balance and counters exist durably before
    // a persistent session is exposed to the UI.
    const save = await store.save(battle.snapshot(), false, 0);
    return new BattleSession(battle, store, save);
  }

  get battle(): IdleBattle { return this.currentBattle; }
  get paused(): boolean { return this.currentPaused; }
  get busy(): boolean { return !!this.pendingWrite; }
  get error(): Error | undefined { return this.currentError; }
  get revision(): number { return this.currentRevision; }
  get temporary(): boolean { return !this.store; }

  /** Never catch up a background gap as one long combat update. At most one
   * frame of bounded active time is retained while storage is committing.
   * Offline time and single-writer leases are B04 responsibilities.
   */
  advance(dtSeconds: number): void {
    if (this.closed || this.closing || this.currentError || this.currentPaused
      || !Number.isFinite(dtSeconds) || dtSeconds <= 0) return;
    const seconds = Math.min(MAX_FRAME_SECONDS, dtSeconds);
    if (this.pendingWrite) {
      this.pendingSeconds = Math.min(MAX_FRAME_SECONDS, this.pendingSeconds + seconds);
      return;
    }
    const before = this.economicState();
    this.currentBattle.update(seconds);
    this.checkpointSeconds += seconds;
    if (before !== this.economicState() || this.checkpointSeconds >= CHECKPOINT_SECONDS) {
      // advance is synchronous for the render loop; commit owns its rejection
      // and exposes failure through error/onError instead of an unhandled promise.
      void this.commit().catch(() => undefined);
    }
  }

  /** Commands are synchronous mutations with asynchronous acknowledgement.
   * Reject a second click while a command is pending instead of queuing it.
   */
  async command(fn: (battle: IdleBattle) => unknown): Promise<boolean> {
    if (this.unavailable()) return false;
    const before = this.currentBattle.snapshot();
    const oldEvents = this.currentBattle.events.slice();
    try {
      const result = fn(this.currentBattle);
      if (result && typeof (result as { then?: unknown }).then === 'function') {
        throw new Error('Spielbefehle müssen synchron sein.');
      }
      if (sameSnapshot(before, this.currentBattle.snapshot())) return false;
      await this.commit();
      return true;
    } catch (value) {
      // A callback exception has not reached storage. Revert just that command,
      // preserving previously visible combat and its unconsumed effects.
      if (!this.currentError) {
        this.currentBattle = IdleBattle.restore(before)!;
        this.currentBattle.events = oldEvents;
        this.fail(asError(value), false);
      }
      return false;
    }
  }

  async setPaused(paused: boolean): Promise<boolean> {
    if (this.unavailable() || this.currentPaused === paused) return false;
    this.currentPaused = paused;
    this.pendingSeconds = 0;
    try {
      await this.commit();
      return true;
    } catch {
      return false;
    }
  }

  /** Used on a controlled visibility transition. Does not advance elapsed wall
   * time and does not drain renderer events. Errors stay explicit to the caller.
   */
  async flush(): Promise<void> {
    this.pendingSeconds = 0;
    if (this.pendingWrite) await this.pendingWrite;
    if (this.currentError) throw this.currentError;
    if (this.closed) return;
    await this.commit();
  }

  async close(): Promise<void> {
    if (this.closed) return;
    this.closing = true;
    try {
      await this.flush();
    } finally {
      this.closed = true;
      this.store?.close();
    }
  }

  private unavailable(): boolean {
    return this.closed || this.closing || this.busy || !!this.currentError;
  }

  private economicState(): string {
    const battle = this.currentBattle;
    return `${battle.gold}/${battle.earned}/${battle.kills}/${battle.lives}/${battle.wave}/${battle.phase}`;
  }

  private commit(): Promise<void> {
    if (this.pendingWrite) return this.pendingWrite;
    if (this.currentError) return Promise.reject(this.currentError);
    const snapshot = this.currentBattle.snapshot();
    const paused = this.currentPaused;
    if (sameSnapshot(snapshot, this.committedSnapshot) && paused === this.committedPaused) return Promise.resolve();
    // Always go through a microtask so pendingWrite is set before success or
    // failure callbacks run, including in explicitly temporary sessions.
    const task = Promise.resolve().then(async () => {
      try {
        if (this.store) {
          const save = await this.store.save(snapshot, paused, this.currentRevision);
          this.currentRevision = save.revision;
        }
        this.committedSnapshot = snapshot;
        this.committedPaused = paused;
        this.checkpointSeconds = 0;
      } catch (value) {
        this.fail(asError(value), true);
        throw this.currentError;
      }
    }).then(() => {
      this.pendingWrite = undefined;
      this.onChange?.();
      const seconds = this.pendingSeconds;
      this.pendingSeconds = 0;
      if (seconds > 0 && !this.closing) this.advance(seconds);
    }, error => {
      this.pendingWrite = undefined;
      this.onChange?.();
      throw error;
    });
    this.pendingWrite = task;
    return task;
  }

  private fail(error: Error, rollback: boolean): void {
    if (rollback) {
      this.currentBattle = IdleBattle.restore(this.committedSnapshot)!;
      this.currentPaused = this.committedPaused;
    }
    this.currentError = error;
    this.pendingSeconds = 0;
    this.onError?.(error);
  }
}
