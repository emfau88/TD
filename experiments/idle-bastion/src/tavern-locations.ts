import media from '../assets/tavern-video/mara-counter/media.json';
import poster from '../assets/tavern-video/mara-counter/poster.png';
import background from '../assets/tavern-video/mara-counter/background.png';
import { TAVERN_SCENE_CATALOG } from './tavern-scene-catalog';
import type { TavernSceneVideoConfig } from './tavern-scene-video';
import type { TavernLocation } from './tavern-presentation';
import type { Companion } from './tavern-social';

const counter: TavernSceneVideoConfig = {
  scene: TAVERN_SCENE_CATALOG['mara-counter']!, media, poster, background,
  // Native 480 × 704 artwork, cropped by two rows in the existing stage.
  anchors: { hair: { x: 125, y: 143 }, shoulder: { x: 125, y: 249 }, hand: { x: 273, y: 459 } },
};
export function tavernLocationConfig(who: Companion, hearts: number, location: TavernLocation): TavernSceneVideoConfig | undefined {
  return who === 'mara' && hearts >= 4 && location === 'mara-counter' ? counter : undefined;
}
