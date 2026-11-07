import media from '../assets/tavern-video/mara-counter/media.json';
import poster from '../assets/tavern-video/mara-counter/poster.png';
import background from '../assets/tavern-video/mara-counter/background.png';
import windowMedia from '../assets/tavern-video/ilyra-window/media.json';
import windowPoster from '../assets/tavern-video/ilyra-window/poster.png';
import windowBackground from '../assets/tavern-video/ilyra-window/background.png';
import { TAVERN_SCENE_CATALOG } from './tavern-scene-catalog';
import type { TavernSceneVideoConfig } from './tavern-scene-video';
import type { TavernLocation } from './tavern-presentation';
import type { Companion } from './tavern-social';

const counter: TavernSceneVideoConfig = {
  scene: TAVERN_SCENE_CATALOG['mara-counter']!, media, poster, background,
  // Native 480 × 704 artwork, cropped by two rows in the existing stage.
  anchors: { hair: { x: 125, y: 143 }, shoulder: { x: 125, y: 249 }, hand: { x: 273, y: 459 } },
};
const windowPlace: TavernSceneVideoConfig = {
  scene: TAVERN_SCENE_CATALOG['ilyra-window']!, media: windowMedia, poster: windowPoster, background: windowBackground,
  anchors: { hair: { x: 140, y: 198 }, shoulder: { x: 128, y: 288 }, hand: { x: 393, y: 480 } },
};
export function tavernLocationConfig(who: Companion, hearts: number, location: TavernLocation): TavernSceneVideoConfig | undefined {
  if (hearts < 4) return;
  if (who === 'mara' && location === 'mara-counter') return counter;
  if (who === 'ilyra' && location === 'ilyra-window') return windowPlace;
}
