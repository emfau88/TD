/** Frozen schema 24–31 rules, used only to validate and migrate historical saves. */
/** T03: pure social economy. No wall clock, combat bonuses, rendering or storage. */
export type Companion = 'mara' | 'ilyra';
export type Interaction = 'talk' | 'touch' | 'gift';
export const SOCIAL = Object.freeze({
  heartThresholds: [10, 35, 70, 110, 160] as readonly number[],
  windowTicks: 20 * 60 * 40, // 25ms live simulation steps; no offline catch-up.
  talkPoints: 8, touchPoints: 4, giftPoints: 12,
  talkLimit: 2, touchLimit: 3, giftLimit: 2,
  clearsPerGift: 10, giftsPerWindow: 2, stockLimit: 20,
});
interface Allowance { talk: number; touch: number; gift: number }
export interface SocialState {
  points: Record<Companion, number>;
  gifts: number;
  claimed: { opening: boolean; boss15: boolean; boss25: boolean };
  window: { ticks: number; used: Record<Companion, Allowance>; earnedGifts: number; clearProgress: number };
  lastClearAttempt: number;
}
export interface SocialAccess { tavernBuilt: boolean; ilyraRecruited: boolean; boss15: boolean; boss25: boolean }
export interface InteractionResult {
  accepted: boolean; points: number;
  reason: 'rewarded' | 'limit' | 'complete' | 'locked' | 'no-gift' | 'invalid';
}
const allowance = (): Allowance => ({ talk: 0, touch: 0, gift: 0 });
const newWindow = (): SocialState['window'] => ({ ticks: 0, used: { mara: allowance(), ilyra: allowance() }, earnedGifts: 0, clearProgress: 0 });
export const createSocial = (): SocialState => ({ points: { mara: 0, ilyra: 0 }, gifts: 0,
  claimed: { opening: false, boss15: false, boss25: false }, window: newWindow(), lastClearAttempt: 0 });
export const hearts = (points: number): number => SOCIAL.heartThresholds.filter(threshold => points >= threshold).length;
const maximum = SOCIAL.heartThresholds.at(-1)!;
const limits = { talk: SOCIAL.talkLimit, touch: SOCIAL.touchLimit, gift: SOCIAL.giftLimit };
const rewards = { talk: SOCIAL.talkPoints, touch: SOCIAL.touchPoints, gift: SOCIAL.giftPoints };
const companions: readonly string[] = ['mara', 'ilyra'];
const interactions: readonly string[] = ['talk', 'touch', 'gift'];
export function socialAvailable(access: SocialAccess, who: Companion): boolean {
  return access.tavernBuilt && (who === 'mara' || who === 'ilyra' && access.ilyraRecruited);
}
/** Claims are permanent, including migrated victories; a full stock defers rather than loses a gift. */
export function grantMilestoneGifts(state: SocialState, access: SocialAccess): void {
  for (const [key, eligible] of [['opening', access.tavernBuilt], ['boss15', access.boss15], ['boss25', access.boss25]] as const) {
    if (eligible && !state.claimed[key] && state.gifts < SOCIAL.stockLimit) {
      state.gifts++; state.claimed[key] = true;
    }
  }
}
/** Called only for live ticks after building the tavern. Paused/hidden/offline time never calls it. */
export function stepSocial(state: SocialState): void {
  state.window.ticks++;
  if (state.window.ticks >= SOCIAL.windowTicks) state.window = newWindow();
}
/** Once per completed live normal-wave attempt, including safe live farming. */
export function recordSocialClear(state: SocialState, attemptId: number): void {
  if (!Number.isSafeInteger(attemptId) || attemptId <= state.lastClearAttempt) return;
  state.lastClearAttempt = attemptId;
  if (state.window.earnedGifts >= SOCIAL.giftsPerWindow || state.gifts >= SOCIAL.stockLimit) return;
  state.window.clearProgress++;
  if (state.window.clearProgress === SOCIAL.clearsPerGift) {
    state.window.clearProgress = 0; state.window.earnedGifts++; state.gifts++;
  }
}
/** Preview the exact action; UI may replay unrewarded talk/touch without spending anything. */
export function interactionOffer(state: SocialState, access: SocialAccess, who: Companion, action: Interaction): InteractionResult {
  if (!companions.includes(who) || !interactions.includes(action)) return { accepted: false, points: 0, reason: 'invalid' };
  if (!socialAvailable(access, who)) return { accepted: false, points: 0, reason: 'locked' };
  if (state.points[who] >= maximum) return { accepted: action !== 'gift', points: 0, reason: 'complete' };
  if (state.window.used[who][action] >= limits[action]) return { accepted: action !== 'gift', points: 0, reason: 'limit' };
  if (action === 'gift' && !state.gifts) return { accepted: false, points: 0, reason: 'no-gift' };
  return { accepted: true, points: Math.min(rewards[action], maximum - state.points[who]), reason: 'rewarded' };
}
export function interact(state: SocialState, access: SocialAccess, who: Companion, action: Interaction): InteractionResult {
  const offer = interactionOffer(state, access, who, action);
  if (!offer.points) return offer;
  state.points[who] += offer.points; state.window.used[who][action]++;
  if (action === 'gift') { state.gifts--; grantMilestoneGifts(state, access); }
  return offer;
}
const object = (x: unknown): x is Record<string, unknown> => !!x && typeof x === 'object' && !Array.isArray(x);
const integer = (x: unknown, max: number): x is number => Number.isSafeInteger(x) && (x as number) >= 0 && (x as number) <= max;
export function validSocial(value: unknown, access: SocialAccess, attemptId: number): value is SocialState {
  if (!object(value) || !object(value.points) || !object(value.claimed) || !object(value.window)
    || !object(value.window.used) || !integer(value.gifts, SOCIAL.stockLimit)
    || !integer(value.lastClearAttempt, attemptId) || !integer(value.window.ticks, SOCIAL.windowTicks - 1)
    || !integer(value.window.earnedGifts, SOCIAL.giftsPerWindow)
    || !integer(value.window.clearProgress, SOCIAL.clearsPerGift - 1)) return false;
  for (const who of ['mara', 'ilyra'] as const) {
    const used = value.window.used[who];
    if (!integer(value.points[who], maximum) || !object(used)) return false;
    for (const action of ['talk', 'touch', 'gift'] as const) {
      if (!integer(used[action], limits[action]) || !socialAvailable(access, who) && used[action] !== 0) return false;
    }
    if (!socialAvailable(access, who) && value.points[who] !== 0) return false;
  }
  for (const [key, eligible] of [['opening', access.tavernBuilt], ['boss15', access.boss15], ['boss25', access.boss25]] as const) {
    if (typeof value.claimed[key] !== 'boolean' || value.claimed[key] && !eligible) return false;
  }
  if (!access.tavernBuilt && (value.window.ticks !== 0 || value.window.earnedGifts !== 0
    || value.window.clearProgress !== 0 || value.lastClearAttempt !== 0)) return false;
  return true;
}
