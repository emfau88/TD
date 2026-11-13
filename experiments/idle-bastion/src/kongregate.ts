import type { LeaderboardScores } from './leaderboard-scores';

/** Exact names configured in the Kongregate developer portal. All use Max. */
export const KONGREGATE_STATS = {
  highestWave: 'Highest Wave',
  bestGoldPerMinute: 'Best Gold per Minute',
  enemiesDefeated: 'Enemies Defeated',
} as const satisfies Record<keyof LeaderboardScores, string>;

export interface KongregateAPI {
  stats: { submit(name: string, value: number): void };
  services: {
    isGuest(): boolean;
    getUserId(): number;
    addEventListener(event: 'login', listener: () => void): void;
  };
}
interface KongregateLoader {
  loadAPI(ready: () => void): void;
  getAPI(): KongregateAPI;
}
type KongregateWindow = Window & { kongregateAPI?: KongregateLoader };
const SUBMIT_INTERVAL_MS = 10_000;
const RETRY_INTERVAL_MS = 30_000;
const RESUBMIT_INTERVAL_MS = 60_000;

/** Driven by committed changes and the existing heartbeat. The fire-and-forget
 * API cannot acknowledge receipt: resend on login/online, reload and each minute.
 * Max statistics make retries idempotent. */
export class KongregateLeaderboards {
  private scores?: LeaderboardScores;
  private api?: KongregateAPI;
  private connecting = false;
  private disposed = false;
  private attemptedAt = -Infinity;
  private submittedAt = -Infinity;
  private resubmittedAt = -Infinity;
  private userId?: number;
  private attemptedWave = 0;
  private sent: Partial<LeaderboardScores> = {};

  constructor(private readonly load: () => Promise<KongregateAPI>, private readonly now = Date.now) {}

  update(scores: LeaderboardScores | undefined, force = false): void {
    this.scores = scores && Object.values(scores).every(value => Number.isSafeInteger(value) && value >= 0)
      ? { ...scores } : undefined;
    if (this.disposed || !this.scores) return;
    if (this.api) { this.submit(force); return; }
    if (this.connecting || this.now() - this.attemptedAt < RETRY_INTERVAL_MS && !force) return;
    this.connecting = true;
    this.attemptedAt = this.now();
    void Promise.resolve().then(this.load).then(api => {
      if (this.disposed) return;
      this.api = api;
      api.services.addEventListener('login', () => this.submit(true));
      this.submit(true);
    }).catch(() => { this.api = undefined; })
      .finally(() => { this.connecting = false; });
  }

  private submit(force: boolean): void {
    if (this.disposed || !this.api || !this.scores) return;
    try {
      if (this.api.services.isGuest()) return;
      const userId = this.api.services.getUserId();
      if (!Number.isSafeInteger(userId) || userId <= 0) return;
      if (userId !== this.userId) {
        this.userId = userId; this.sent = {}; force = true;
      }
      const now = this.now();
      const resubmit = force || now - this.resubmittedAt >= RESUBMIT_INTERVAL_MS;
      const newWave = this.scores.highestWave > this.attemptedWave;
      if (!force && !newWave && now - this.submittedAt < SUBMIT_INTERVAL_MS) return;
      this.submittedAt = now;
      this.attemptedWave = this.scores.highestWave;
      for (const key of Object.keys(KONGREGATE_STATS) as (keyof LeaderboardScores)[]) {
        const value = this.scores[key];
        if (value > 0 && (resubmit || value !== this.sent[key])) {
          this.api.stats.submit(KONGREGATE_STATS[key], value);
          this.sent[key] = value;
        }
      }
      if (resubmit) this.resubmittedAt = now;
    } catch { /* Optional platform service; never interrupt combat or saving. */ }
  }

  dispose(): void { this.disposed = true; this.scores = undefined; }
}

/** Script failures can retry; initialize the SDK only once per page, even when
 * its callback is delayed. Called after the game is ready, so a blocked CDN
 * cannot hold up Phaser's window-load/startup boundary. */
export function kongregateLoader(win: KongregateWindow, doc: Document): () => Promise<KongregateAPI> {
  let scriptPending: Promise<KongregateLoader> | undefined;
  let initialized: Promise<KongregateAPI> | undefined;
  return async () => {
    if (!scriptPending) {
      scriptPending = win.kongregateAPI ? Promise.resolve(win.kongregateAPI) : new Promise((resolve, reject) => {
        const script = doc.createElement('script');
        script.src = 'https://cdn1.kongregate.com/javascripts/kongregate_api.js';
        script.async = true;
        const failed = () => {
          win.clearTimeout(timeout); script.remove();
          reject(new Error('Kongregate API unavailable.'));
        };
        const timeout = win.setTimeout(failed, 10_000);
        script.onerror = failed;
        script.onload = () => {
          win.clearTimeout(timeout);
          if (win.kongregateAPI) resolve(win.kongregateAPI); else failed();
        };
        doc.head.append(script);
      });
    }
    let loader: KongregateLoader;
    try { loader = await scriptPending; }
    catch (error) { scriptPending = undefined; throw error; }
    initialized ??= new Promise((resolve, reject) => {
      try {
        loader.loadAPI(() => {
          try { resolve(loader.getAPI()); } catch (error) { reject(error); }
        });
      } catch (error) { reject(error); }
    });
    return initialized;
  };
}
