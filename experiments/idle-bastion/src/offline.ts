/** B04 absence accounting. All timestamps are calendar milliseconds; combat
 * time never enters this module. A reserved interval is consumed immediately,
 * while gold is credited only by an explicit, atomically saved claim.
 */
import type { FarmCertificate } from './farming';

export const OFFLINE = Object.freeze({ unitsPerGold: 1000, efficiencyPermille: 600, limitMs: 2 * 60 * 60 * 1000 });
export interface Fraction { numerator: string; denominator: string }
export interface OfflineBaseline {
  at: number; paused: boolean; certificate: FarmCertificate | null; efficiencyPermille: number; limitMs: number;
}
export interface AbsenceWindow extends OfflineBaseline {
  id: string; from: number; cursorHighWater: number; usedMs: number; sequence: number;
}
export interface OfflineReward {
  id: string; amountUnits: number; from: number; to: number;
  elapsedMs: number; creditedMs: number; efficiencyPermille: number; limitMs: number;
}
export interface OfflineState {
  schemaVersion: 1; nextWindowId: number; baseline: OfflineBaseline;
  window: AbsenceWindow | null; pendingReward: OfflineReward | null;
  /** Exact fractional currency units, carried across claims and future windows. */
  roundingRemainder: Fraction;
}
const object = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null && !Array.isArray(value);
const natural = (value: unknown): value is number => Number.isSafeInteger(value) && (value as number) >= 0;
const positive = (value: unknown): value is number => natural(value) && value > 0;
function time(value: number): number {
  if (!natural(value)) throw new RangeError('Offline time must be a non-negative safe integer.');
  return value;
}
function certificate(value: unknown): FarmCertificate | null | undefined {
  if (value === null) return null;
  // Historical departure proofs retain the rule set that earned them. New
  // active proofs are validated separately by farming.ts against current rules.
  if (!object(value) || !positive(value.wave) || (value.rulesVersion !== 1 && value.rulesVersion !== 2) || !positive(value.rewardGold)
    || !positive(value.durationMs) || typeof value.fingerprint !== 'string' || value.fingerprint.length < 1
    || value.fingerprint.length > 20_000) return undefined;
  return {
    wave: value.wave, fingerprint: value.fingerprint, rulesVersion: value.rulesVersion,
    rewardGold: value.rewardGold, durationMs: value.durationMs,
  };
}
function baseline(value: unknown): OfflineBaseline | undefined {
  if (!object(value) || !natural(value.at) || typeof value.paused !== 'boolean') return undefined;
  // The first B04 schema-1 build implied exactly 60% / 2h. Migrate only absent
  // policy fields; an explicitly stored contradictory value stays invalid.
  const efficiencyPermille = Object.hasOwn(value, 'efficiencyPermille') ? value.efficiencyPermille : OFFLINE.efficiencyPermille;
  const limitMs = Object.hasOwn(value, 'limitMs') ? value.limitMs : OFFLINE.limitMs;
  if (efficiencyPermille !== OFFLINE.efficiencyPermille || limitMs !== OFFLINE.limitMs) return undefined;
  const basis = certificate(value.certificate);
  return basis === undefined ? undefined : { at: value.at, paused: value.paused, certificate: basis, efficiencyPermille, limitMs };
}
function fraction(value: unknown): Fraction | undefined {
  if (!object(value) || typeof value.numerator !== 'string' || typeof value.denominator !== 'string'
    || value.numerator.length > 4096 || value.denominator.length > 4096
    || !/^(0|[1-9][0-9]*)$/.test(value.numerator) || !/^[1-9][0-9]*$/.test(value.denominator)) return undefined;
  const numerator = BigInt(value.numerator), denominator = BigInt(value.denominator);
  return numerator < denominator ? { numerator: numerator.toString(), denominator: denominator.toString() } : undefined;
}
function sameCertificate(a: FarmCertificate | null, b: FarmCertificate | null): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}
/** Validate persisted fields without inventing a certificate or production rate. */
export function restoreOffline(value: unknown): OfflineState | undefined {
  if (!object(value) || value.schemaVersion !== 1 || !positive(value.nextWindowId)) return undefined;
  const active = baseline(value.baseline), remainder = fraction(value.roundingRemainder);
  if (!active || !remainder) return undefined;
  let window: AbsenceWindow | null = null;
  let pendingReward: OfflineReward | null = null;
  if (value.window !== null) {
    const raw = value.window, basis = baseline(raw);
    if (!object(raw) || !basis || typeof raw.id !== 'string' || raw.id.length > 128
      || raw.id !== `absence-${value.nextWindowId - 1}-${raw.from}` || value.nextWindowId < 2
      || !natural(raw.from) || raw.from !== basis.at || raw.from !== active.at
      || !natural(raw.cursorHighWater) || raw.cursorHighWater < raw.from
      || !natural(raw.usedMs) || raw.usedMs > basis.limitMs || raw.usedMs > raw.cursorHighWater - raw.from
      || !natural(raw.sequence) || basis.paused !== active.paused || basis.efficiencyPermille !== active.efficiencyPermille
      || basis.limitMs !== active.limitMs || !sameCertificate(basis.certificate, active.certificate)) return undefined;
    if ((basis.paused || !basis.certificate) && raw.usedMs !== 0) return undefined;
    window = { ...basis, id: raw.id, from: raw.from, cursorHighWater: raw.cursorHighWater, usedMs: raw.usedMs, sequence: raw.sequence };
  }
  if (value.pendingReward !== null) {
    const reward = value.pendingReward;
    if (!window || !object(reward) || reward.id !== `${window.id}:${window.sequence}` || window.sequence < 1
      || !natural(reward.amountUnits) || !natural(reward.from) || reward.from < window.from
      || !natural(reward.to) || reward.to !== window.cursorHighWater || reward.to < reward.from
      || !natural(reward.elapsedMs) || reward.elapsedMs !== reward.to - reward.from
      || !natural(reward.creditedMs) || reward.creditedMs > reward.elapsedMs || reward.creditedMs > window.usedMs
      || reward.efficiencyPermille !== window.efficiencyPermille || reward.limitMs !== window.limitMs) return undefined;
    if (window.paused || !window.certificate) {
      if (reward.amountUnits !== 0 || reward.creditedMs !== 0) return undefined;
    } else {
      const maximumNumerator = BigInt(window.certificate.rewardGold) * BigInt(window.efficiencyPermille) * BigInt(reward.creditedMs);
      const denominator = BigInt(window.certificate.durationMs);
      if (BigInt(reward.amountUnits) > (maximumNumerator + denominator - 1n) / denominator) return undefined;
    }
    pendingReward = {
      id: reward.id as string, amountUnits: reward.amountUnits, from: reward.from, to: reward.to,
      elapsedMs: reward.elapsedMs, creditedMs: reward.creditedMs,
      efficiencyPermille: reward.efficiencyPermille, limitMs: reward.limitMs,
    };
  }
  return { schemaVersion: 1, nextWindowId: value.nextWindowId, baseline: active, window, pendingReward, roundingRemainder: remainder };
}
function copy(value: OfflineState): OfflineState {
  const state = restoreOffline(value);
  if (!state) throw new RangeError('Invalid offline state.');
  return state;
}
function frozenBasis(value: FarmCertificate | null): FarmCertificate | null {
  const result = certificate(value);
  if (result === undefined) throw new RangeError('Invalid farm certificate.');
  return result;
}
export function createOfflineState(now: number): OfflineState {
  return {
    schemaVersion: 1, nextWindowId: 1, baseline: { at: time(now), paused: false, certificate: null, efficiencyPermille: OFFLINE.efficiencyPermille, limitMs: OFFLINE.limitMs },
    window: null, pendingReward: null, roundingRemainder: { numerator: '0', denominator: '1' },
  };
}

/** Every confirmed active checkpoint advances the one shared active/offline
 * boundary. An abrupt close can therefore reserve only time after that commit.
 */
export function checkpointActive(state: OfflineState, now: number, basis: FarmCertificate | null, paused: boolean): OfflineState {
  const next = copy(state);
  if (next.window || next.pendingReward) throw new RangeError('Resume the absence window before advancing active time.');
  if (typeof paused !== 'boolean') throw new RangeError('Invalid explicit pause flag.');
  next.baseline = {
    at: Math.max(time(now), next.baseline.at), paused, certificate: frozenBasis(basis),
    efficiencyPermille: OFFLINE.efficiencyPermille, limitMs: OFFLINE.limitMs,
  };
  return next;
}
function openWindow(state: OfflineState): OfflineState {
  if (state.window) return state;
  if (state.nextWindowId === Number.MAX_SAFE_INTEGER) throw new RangeError('Absence window counter exhausted.');
  const from = state.baseline.at;
  state.window = {
    ...state.baseline, id: `absence-${state.nextWindowId++}-${from}`,
    from, cursorHighWater: from, usedMs: 0, sequence: 0,
  };
  return state;
}
export function beginAbsence(state: OfflineState, now: number, basis: FarmCertificate | null, paused: boolean): OfflineState {
  const next = copy(state);
  if (next.window) return next; // Unclaimed return dialogs never refresh the cap.
  return openWindow(checkpointActive(next, now, basis, paused));
}
function gcd(a: bigint, b: bigint): bigint {
  while (b !== 0n) { const remainder = a % b; a = b; b = remainder; }
  return a;
}
function addProduction(remainder: Fraction, basis: FarmCertificate, durationMs: number, efficiencyPermille: number): { units: number; remainder: Fraction } {
  const oldDenominator = BigInt(remainder.denominator);
  const denominator = oldDenominator * BigInt(basis.durationMs);
  const numerator = BigInt(remainder.numerator) * BigInt(basis.durationMs)
    + BigInt(basis.rewardGold) * BigInt(efficiencyPermille) * BigInt(durationMs) * oldDenominator;
  const units = numerator / denominator;
  if (units > BigInt(Number.MAX_SAFE_INTEGER)) throw new RangeError('Offline reward exceeds the safe currency range.');
  const rest = numerator % denominator;
  const factor = gcd(rest, denominator);
  return { units: Number(units), remainder: { numerator: (rest / factor).toString(), denominator: (denominator / factor).toString() } };
}

/** Reserve before displaying a receipt. Repeated loads only consume additional
 * high-water time and the remaining portion of the same original two-hour cap.
 */
export function reserveOffline(state: OfflineState, now: number): OfflineState {
  const next = openWindow(copy(state));
  const window = next.window!;
  const to = Math.max(time(now), window.cursorHighWater);
  const elapsedMs = to - window.cursorHighWater;
  if (elapsedMs === 0) return next;
  const creditedMs = !window.paused && window.certificate ? Math.min(elapsedMs, window.limitMs - window.usedMs) : 0;
  let amountUnits = 0;
  if (creditedMs > 0 && window.certificate) {
    const production = addProduction(next.roundingRemainder, window.certificate, creditedMs, window.efficiencyPermille);
    amountUnits = production.units;
    next.roundingRemainder = production.remainder;
  }
  const previous = next.pendingReward;
  if (previous && !Number.isSafeInteger(previous.amountUnits + amountUnits)) throw new RangeError('Pending reward exceeds the safe currency range.');
  const from = previous?.from ?? window.cursorHighWater;
  next.pendingReward = {
    id: previous?.id ?? `${window.id}:${++window.sequence}`,
    amountUnits: (previous?.amountUnits ?? 0) + amountUnits,
    from, to, elapsedMs: to - from, creditedMs: (previous?.creditedMs ?? 0) + creditedMs,
    efficiencyPermille: window.efficiencyPermille, limitMs: window.limitMs,
  };
  window.cursorHighWater = to;
  window.usedMs += creditedMs;
  return next;
}

/** Idempotent claim: the caller credits these units and commits both model and
 * cleared receipt together. Claim alone does not start a fresh absence window.
 */
export function claimOffline(state: OfflineState, rewardId: string): { state: OfflineState; amountUnits: number } {
  const next = copy(state);
  if (!next.pendingReward || next.pendingReward.id !== rewardId) return { state: next, amountUnits: 0 };
  const amountUnits = next.pendingReward.amountUnits;
  next.pendingReward = null;
  return { state: next, amountUnits };
}
export function activateOffline(state: OfflineState, now: number, basis: FarmCertificate | null, paused: boolean): OfflineState {
  const next = copy(state);
  if (next.pendingReward) throw new RangeError('Claim the pending offline receipt before resuming active play.');
  const boundary = Math.max(time(now), next.window?.cursorHighWater ?? next.baseline.at);
  next.window = null;
  next.baseline = {
    at: boundary, paused, certificate: frozenBasis(basis),
    efficiencyPermille: OFFLINE.efficiencyPermille, limitMs: OFFLINE.limitMs,
  };
  return checkpointActive(next, boundary, basis, paused);
}

