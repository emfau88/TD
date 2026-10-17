export type AttemptMode = 'advance' | 'farm';
export interface AttemptCounts { attempts: number; wins: number; losses: number }
export interface WaveRecord { wave: number; advance: AttemptCounts; farm: AttemptCounts }
export interface ProgressRecord {
  sinceAttempt: number;
  sinceSeconds: number;
  battleGold: number;
  totals: Record<AttemptMode, AttemptCounts>;
  waves: WaveRecord[];
  lastDefeat: { wave: number; attemptId: number } | null;
}
export const HISTORY_LIMIT = 100;
const empty = (): AttemptCounts => ({ attempts: 0, wins: 0, losses: 0 });
export const createProgress = (attemptId = 0, elapsed = 0): ProgressRecord => ({
  sinceAttempt: attemptId + 1, sinceSeconds: elapsed, battleGold: 0,
  totals: { advance: empty(), farm: empty() }, waves: [], lastDefeat: null,
});
export const cloneProgress = (record: ProgressRecord): ProgressRecord => ({
  ...record, totals: { advance: { ...record.totals.advance }, farm: { ...record.totals.farm } },
  waves: record.waves.map(row => ({ wave: row.wave, advance: { ...row.advance }, farm: { ...row.farm } })),
  lastDefeat: record.lastDefeat && { ...record.lastDefeat },
});

/** Called at model boundaries, never from transient scene events. Legacy active
 * attempts finish without invented start counts; the next real start is counted. */
export function recordAttempt(record: ProgressRecord, wave: number, mode: AttemptMode,
  attemptId: number, outcome: 'attempts' | 'wins' | 'losses'): void {
  if (outcome === 'losses') record.lastDefeat = { wave, attemptId };
  if (attemptId < record.sinceAttempt) return;
  let row = record.waves.find(item => item.wave === wave);
  if (!row) {
    row = { wave, advance: empty(), farm: empty() };
    record.waves.push(row);
    // Retain the last distinct waves encountered, including a low fallback wave.
    if (record.waves.length > HISTORY_LIMIT) record.waves.shift();
  } else if (outcome === 'attempts') {
    record.waves.splice(record.waves.indexOf(row), 1); record.waves.push(row);
  }
  row[mode][outcome]++;
  record.totals[mode][outcome]++;
}

const object = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);
const natural = (v: unknown): v is number => Number.isSafeInteger(v) && (v as number) >= 0;
function counts(v: unknown): v is AttemptCounts {
  return object(v) && natural(v.attempts) && natural(v.wins) && natural(v.losses) && v.wins + v.losses <= v.attempts;
}
export function validProgress(value: unknown, attemptId: number, elapsed: number): value is ProgressRecord {
  if (!object(value) || !natural(value.sinceAttempt) || value.sinceAttempt < 1 || value.sinceAttempt > attemptId + 1
    || typeof value.sinceSeconds !== 'number' || !Number.isFinite(value.sinceSeconds) || value.sinceSeconds < 0 || value.sinceSeconds > elapsed
    || !natural(value.battleGold) || !object(value.totals) || !counts(value.totals.advance) || !counts(value.totals.farm)
    || !Array.isArray(value.waves) || value.waves.length > HISTORY_LIMIT) return false;
  const ids = new Set<number>(), sums = { advance: empty(), farm: empty() };
  const totals = value.totals as Record<AttemptMode, AttemptCounts>;
  for (const row of value.waves) {
    if (!object(row) || !natural(row.wave) || row.wave < 1 || ids.has(row.wave) || !counts(row.advance) || !counts(row.farm)) return false;
    ids.add(row.wave);
    const entry = row as unknown as WaveRecord;
    for (const mode of ['advance', 'farm'] as const) for (const key of ['attempts', 'wins', 'losses'] as const) sums[mode][key] += entry[mode][key];
  }
  for (const mode of ['advance', 'farm'] as const) for (const key of ['attempts', 'wins', 'losses'] as const) {
    if (!natural(sums[mode][key]) || sums[mode][key] > totals[mode][key]) return false;
  }
  if (value.totals.advance.attempts + value.totals.farm.attempts > attemptId) return false;
  const defeat = value.lastDefeat;
  return defeat === null || (object(defeat) && natural(defeat.wave) && defeat.wave > 0
    && natural(defeat.attemptId) && defeat.attemptId > 0 && defeat.attemptId <= attemptId);
}

/** A view-only rolling average of normal battle rewards. Its inputs deliberately
 * exclude the spendable balance and wall time, so purchases, sales, offline
 * claims and pauses cannot masquerade as production. Reload starts a new window. */
export class IncomeWindow {
  private samples: { at: number; earned: number }[] = [];
  reset(): void { this.samples = []; }
  observe(at: number, earned: number): { perMinute: number | null; seconds: number } {
    const last = this.samples.at(-1);
    if (last && (at < last.at || earned < last.earned)) this.reset();
    if (!this.samples.length || at > this.samples.at(-1)!.at) this.samples.push({ at, earned });
    while (this.samples.length > 2 && this.samples[1].at <= at - 60) this.samples.shift();
    const first = this.samples[0], next = this.samples[1];
    const start = Math.max(first.at, at - 60);
    const base = next && start > first.at ? first.earned + (next.earned - first.earned) * (start - first.at) / (next.at - first.at) : first.earned;
    const seconds = at - start;
    return { perMinute: seconds >= 15 ? Math.max(0, (earned - base) * 60 / seconds) : null, seconds };
  }
}
