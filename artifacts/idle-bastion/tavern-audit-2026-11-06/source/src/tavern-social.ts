import { validSocial as validLegacySocial, type SocialState as LegacySocialState } from './tavern-social-legacy';

/** Saved relationship progress; independent of clocks, combat strength and offline gold. */
export type Companion = 'mara' | 'ilyra';
export type Interaction = 'talk' | 'touch' | 'gift';
export type TouchRegion = 'hand' | 'hair' | 'shoulder';
export type GiftKind = 'normal' | 'personal';
export interface InteractionChoice { region?: TouchRegion; gift?: GiftKind }
export const SOCIAL = Object.freeze({
  heartThresholds: [10, 35, 70, 110, 160] as readonly number[],
  chapterMaximum: 70, talkPoints: 8, touchPoints: 4, giftPoints: 12,
  reserveLimit: 3, clearsPerRefill: 3, clearsPerGift: 10, personalClears: 30, stockLimit: 20,
});
export const TOUCH_HEARTS: Readonly<Record<TouchRegion, number>> = { shoulder: 1, hair: 2, hand: 3 };
export const COMPANION_IDS = ['mara', 'ilyra'] as const;
export interface Reserve { talk: number; touch: number; clears: number }
export interface SocialState {
  points: Record<Companion, number>;
  gifts: number;
  claimed: { opening: boolean; boss15: boolean; boss25: boolean; ilyraWelcome: boolean };
  reserves: Record<Companion, Reserve | null>;
  personal: Record<Companion, { clears: number; claimed: boolean }>;
  clearProgress: number;
  lastClearAttempt: number;
}
export interface SocialAccess { tavernBuilt: boolean; ilyraRecruited: boolean; boss15: boolean; boss25: boolean }
export interface InteractionResult {
  accepted: boolean; points: number; gift?: GiftKind;
  reason: 'rewarded' | 'limit' | 'complete' | 'locked' | 'no-gift' | 'invalid' | 'affection' | 'gift-needed' | 'personal-needed' | 'gift-progress' | 'companionship';
}
export const createSocial = (): SocialState => ({
  points: { mara: 0, ilyra: 0 }, gifts: 0,
  claimed: { opening: false, boss15: false, boss25: false, ilyraWelcome: false },
  reserves: { mara: null, ilyra: null },
  personal: { mara: { clears: 0, claimed: false }, ilyra: { clears: 0, claimed: false } },
  clearProgress: 0, lastClearAttempt: 0,
});
export const hearts = (points: number): number => SOCIAL.heartThresholds.filter(threshold => points >= threshold).length;
export const touchAvailable = (points: number, region: TouchRegion): boolean =>
  Object.hasOwn(TOUCH_HEARTS, region) && hearts(points) >= TOUCH_HEARTS[region];
export const availableTouches = (points: number): TouchRegion[] =>
  (['shoulder', 'hair', 'hand'] as const).filter(region => touchAvailable(points, region));
export function socialAvailable(access: SocialAccess, who: Companion): boolean {
  return access.tavernBuilt && (who === 'mara' || who === 'ilyra' && access.ilyraRecruited);
}
export const personalGiftReady = (state: SocialState, who: Companion): boolean =>
  state.points[who] >= 35 && state.points[who] < 70 && state.personal[who].clears === SOCIAL.personalClears && !state.personal[who].claimed;
export function activateSocial(state: SocialState, access: SocialAccess): void {
  for (const who of COMPANION_IDS) {
    if (socialAvailable(access, who) && !state.reserves[who]) {
      state.reserves[who] = { talk: 3, touch: hearts(state.points[who]) >= 2 ? 3 : 0, clears: 0 };
    }
  }
}
/** Permanent claims; full inventory defers them. Personal gifts never occupy stock. */
export function grantMilestoneGifts(state: SocialState, access: SocialAccess): void {
  activateSocial(state, access);
  for (const [key, eligible] of [
    ['opening', access.tavernBuilt], ['boss15', access.boss15], ['boss25', access.boss25],
    ['ilyraWelcome', access.tavernBuilt && access.ilyraRecruited],
  ] as const) {
    if (eligible && !state.claimed[key] && state.gifts < SOCIAL.stockLimit) {
      state.gifts++; state.claimed[key] = true;
    }
  }
}
/** Exactly once per completed live normal-wave attempt, including safe live farming. */
export function recordSocialClear(state: SocialState, attemptId: number, access: SocialAccess): void {
  if (!access.tavernBuilt || !Number.isSafeInteger(attemptId) || attemptId <= state.lastClearAttempt) return;
  state.lastClearAttempt = attemptId;
  let progressing = false;
  for (const who of COMPANION_IDS) {
    const reserve = state.reserves[who], points = state.points[who];
    if (!socialAvailable(access, who) || !reserve || points >= SOCIAL.chapterMaximum) continue;
    progressing = true;
    if (++reserve.clears === SOCIAL.clearsPerRefill) {
      reserve.clears = 0; reserve.talk = Math.min(3, reserve.talk + 1);
      if (points >= 35) reserve.touch = Math.min(3, reserve.touch + 1);
    }
    if (points >= 35 && !state.personal[who].claimed) state.personal[who].clears = Math.min(SOCIAL.personalClears, state.personal[who].clears + 1);
  }
  if (progressing && state.gifts < SOCIAL.stockLimit && ++state.clearProgress === SOCIAL.clearsPerGift) {
    state.clearProgress = 0; state.gifts++;
  }
}
export function interactionOffer(state: SocialState, access: SocialAccess, who: Companion, action: Interaction, choice: InteractionChoice = {}): InteractionResult {
  const deny = (reason: InteractionResult['reason']): InteractionResult => ({ accepted: false, points: 0, reason });
  if (!COMPANION_IDS.includes(who) || !['talk', 'touch', 'gift'].includes(action)
    || choice.gift !== undefined && !['normal', 'personal'].includes(choice.gift)
    || choice.region !== undefined && !Object.hasOwn(TOUCH_HEARTS, choice.region)) return deny('invalid');
  if (!socialAvailable(access, who)) return deny('locked');
  if (action === 'touch' && !touchAvailable(state.points[who], choice.region ?? 'shoulder')) return deny('locked');
  const points = state.points[who];
  // Early shoulder contact is cosmetic. Keep the earned reserve economy at heart 2.
  if (action === 'touch' && points < 35) return { accepted: true, points: 0, reason: 'companionship' };
  if (points >= SOCIAL.chapterMaximum) return { accepted: action !== 'gift', points: 0, reason: 'complete' };
  if (action === 'gift') {
    const gift = choice.gift ?? (personalGiftReady(state, who) && points >= 58 ? 'personal' : 'normal');
    if (gift === 'personal') {
      if (points < 35) return deny('locked');
      if (!personalGiftReady(state, who)) return deny('gift-progress');
      if (points < 58) return deny('affection');
      return { accepted: true, points: 70 - points, reason: 'rewarded', gift };
    }
    if (points < 23) return deny('affection');
    if (points >= 58) return deny('personal-needed');
    if (!state.gifts) return deny('no-gift');
    return { accepted: true, points: Math.min(12, (points < 35 ? 35 : 58) - points), reason: 'rewarded', gift };
  }
  const ceiling = points < 35 ? 23 : 58;
  if (points >= ceiling) return { accepted: true, points: 0, reason: points < 35 ? 'gift-needed' : 'personal-needed' };
  if (!state.reserves[who]?.[action]) return { accepted: true, points: 0, reason: 'limit' };
  return { accepted: true, points: Math.min(action === 'talk' ? 8 : 4, ceiling - points), reason: 'rewarded' };
}
export function interact(state: SocialState, access: SocialAccess, who: Companion, action: Interaction, choice: InteractionChoice = {}): InteractionResult {
  const offer = interactionOffer(state, access, who, action, choice);
  if (!offer.points) return offer;
  const before = state.points[who];
  state.points[who] += offer.points;
  if (action === 'gift') {
    if (offer.gift === 'personal') state.personal[who].claimed = true;
    else state.gifts--;
    grantMilestoneGifts(state, access);
  } else state.reserves[who]![action]--;
  if (before < 35 && state.points[who] >= 35) state.reserves[who]!.touch = 3;
  return offer;
}
/** Preserve old earned values; do not invent historical wins since heart two. */
export function migrateSocial(value: unknown, access: SocialAccess, attemptId: number): SocialState | undefined {
  if (!validLegacySocial(value, access, attemptId)) return undefined;
  const old = value as LegacySocialState, state = createSocial();
  state.points = { ...old.points }; state.gifts = old.gifts;
  state.claimed = { ...old.claimed, ilyraWelcome: access.ilyraRecruited && (old.points.ilyra >= 35 || old.gifts > 0) };
  state.clearProgress = old.window.clearProgress; state.lastClearAttempt = old.lastClearAttempt;
  activateSocial(state, access);
  for (const who of COMPANION_IDS) state.personal[who].claimed = state.points[who] >= 70;
  // A recruited early Ilyra with an empty stock gets her new welcome claim once.
  if (access.ilyraRecruited && !state.claimed.ilyraWelcome) {
    state.gifts++; state.claimed.ilyraWelcome = true;
  }
  return state;
}
const object = (x: unknown): x is Record<string, unknown> => !!x && typeof x === 'object' && !Array.isArray(x);
const integer = (x: unknown, max: number): x is number => Number.isSafeInteger(x) && (x as number) >= 0 && (x as number) <= max;
export function validSocial(value: unknown, access: SocialAccess, attemptId: number): value is SocialState {
  if (!object(value) || !object(value.points) || !object(value.claimed) || !object(value.reserves) || !object(value.personal)
    || !integer(value.gifts, 20) || !integer(value.clearProgress, 9) || !integer(value.lastClearAttempt, attemptId)) return false;
  for (const who of COMPANION_IDS) {
    const reserve = value.reserves[who], personal = value.personal[who], points = value.points[who], available = socialAvailable(access, who);
    if (!integer(points, 160) || !object(personal) || !integer(personal.clears, 30) || typeof personal.claimed !== 'boolean'
      || personal.claimed && points < 70 || points < 35 && personal.clears !== 0) return false;
    if (available) {
      if (!object(reserve) || !integer(reserve.talk, 3) || !integer(reserve.touch, 3) || !integer(reserve.clears, 2)
        || points < 35 && reserve.touch !== 0) return false;
    } else if (reserve !== null || points !== 0 || personal.clears !== 0 || personal.claimed) return false;
  }
  for (const [key, eligible] of [
    ['opening', access.tavernBuilt], ['boss15', access.boss15], ['boss25', access.boss25], ['ilyraWelcome', access.tavernBuilt && access.ilyraRecruited],
  ] as const) if (typeof value.claimed[key] !== 'boolean' || value.claimed[key] && !eligible) return false;
  return access.tavernBuilt || value.clearProgress === 0 && value.lastClearAttempt === 0;
}
