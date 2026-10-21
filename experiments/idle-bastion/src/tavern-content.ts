import type { TouchRegion } from './tavern-animation';
export interface TavernBeat { line: string; clip: TouchRegion }
export interface TavernMoment { heart: number; title: string; beats: readonly TavernBeat[] }
