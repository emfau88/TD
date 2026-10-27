import type { TouchRegion } from './tavern-social';
export type TavernSceneClip = 'idle' | 'head' | 'touch';
export const TOUCH_CLIPS: Readonly<Record<TouchRegion, 'head' | 'touch' | 'giggle'>> = {
  shoulder: 'touch', hair: 'head', hand: 'giggle',
};
export const GESTURE_HEARTS: Readonly<Record<string, number>> = { giggle: 2, hip: 3, tease: 4 };
export interface TavernBeat { line: string; clip: TavernSceneClip }
export interface TavernMoment { heart: number; title: string; beats: readonly TavernBeat[] }
