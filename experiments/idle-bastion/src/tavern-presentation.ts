import type { TavernSceneClip } from './tavern-content';
import type { Companion, Interaction } from './tavern-social';
import type { TouchRegion } from './tavern-animation';

// The same tavern UI can review new artwork without switching the published game.
export interface TavernPlayer {
  readonly ready: boolean;
  readonly reacting: boolean;
  readonly reactionsReady: boolean;
  readonly loadingReactions: boolean;
  start(who?: Companion): Promise<void>;
  stop(): void;
  prepareReactions(): Promise<boolean>;
  play(region: TouchRegion): void;
  scene(clip: TavernSceneClip): void;
  setHearts?(count: number): void;
  act?(action: Interaction): void;
  gesture?(key: string): void;
}
export interface TavernPresentation {
  kind: string;
  create(canvas: HTMLCanvasElement, changed: () => void): TavernPlayer;
  portrait(who: Companion): string;
  drawPortrait(canvas: HTMLCanvasElement, who: Companion): Promise<void>;
  anchors(who: Companion): Record<TouchRegion, { x: number; y: number }>;
  gestures: { key: string; label: string; minHearts: number; companion?: Companion; line: Record<Companion, string> }[];
}
