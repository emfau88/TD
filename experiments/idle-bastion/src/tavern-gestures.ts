import { GESTURE_HEARTS } from './tavern-content';
import type { TavernPresentation } from './tavern-presentation';

/** Artwork-independent invitations and logical positions in the 480 × 700 stage. */
export const TAVERN_ANCHORS: TavernPresentation['anchors'] = who => who === 'mara'
  ? { hair: { x: 143, y: 262 }, shoulder: { x: 350, y: 305 }, hand: { x: 370, y: 593 } }
  : { hair: { x: 174, y: 256 }, shoulder: { x: 342, y: 303 }, hand: { x: 384, y: 570 } };

export const TAVERN_GESTURES: TavernPresentation['gestures'] = [
  { key: 'giggle', label: 'Zusammen lachen', minHearts: GESTURE_HEARTS.giggle!, line: { mara: 'Gut, der war nicht schlecht. Erzähl ihn bloß nicht Wisp – sonst muss ich ihn morgen wieder hören.', ilyra: 'Damit habe ich nicht gerechnet. Du weißt, wie du mich zum Lachen bringst.' } },
  { key: 'hip', label: 'Kompliment machen', minHearts: GESTURE_HEARTS.hip!, line: { mara: 'Na, wenn du mich so ansiehst, muss ja etwas dran sein.', ilyra: 'Du machst es mir nicht gerade leicht, ernst zu bleiben.' } },
  { key: 'tease', label: 'Ein wenig necken', minHearts: GESTURE_HEARTS.tease!, companion: 'mara', line: { mara: 'Pass nur auf. Den nächsten frechen Spruch habe ich schon bereit.', ilyra: '' } },
];
