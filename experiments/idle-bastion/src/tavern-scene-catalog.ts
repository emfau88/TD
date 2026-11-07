export type TavernSceneId = 'mara-counter' | 'ilyra-window';
export type SceneRole = 'idle' | 'talk' | 'hair' | 'shoulder' | 'hand' | 'laugh' | 'approach';
export const CORE_SCENE_ROLES = ['idle', 'talk', 'hair', 'shoulder', 'hand'] as const;
export const SCENE_ROLES = [...CORE_SCENE_ROLES, 'laugh', 'approach'] as const;
export type SceneClips<T> = Readonly<Record<typeof CORE_SCENE_ROLES[number], T> & Partial<Record<'laugh' | 'approach', T>>>;
export type SceneAction = 'idle' | 'talk' | 'gift' | 'hair' | 'shoulder' | 'hand' | 'laugh' | 'compliment' | 'tease';
export interface SceneClip {
  readonly file: string;
  readonly startPose: string;
  readonly endPose: string;
  readonly referenceId: string;
}
export interface TavernScene {
  readonly id: TavernSceneId;
  readonly companion: 'mara' | 'ilyra';
  readonly basePose: string;
  readonly referenceId: string;
  readonly clips: SceneClips<SceneClip>;
}

const counterPose = 'mara-counter:upright', counterReference = 'mara-counter-93d84c667a74';
const counterClip = (id: string): SceneClip => Object.freeze({ file: `mara-counter/${id}.mp4`,
  startPose: counterPose, endPose: counterPose, referenceId: counterReference });
const windowPose = 'ilyra-window:rest', windowReference = 'ilyra-window-1a5a73fb8c69';
const windowClip = (id: string): SceneClip => Object.freeze({ file: `ilyra-window/${id}.mp4`,
  startPose: windowPose, endPose: windowPose, referenceId: windowReference });
// Every scene needs its approved basic interactions. Unproduced extra gestures stay absent.
export const TAVERN_SCENE_CATALOG: Readonly<Partial<Record<TavernSceneId, TavernScene>>> = Object.freeze({
  'mara-counter': Object.freeze({ id: 'mara-counter', companion: 'mara', basePose: counterPose, referenceId: counterReference,
    clips: Object.freeze({ idle: counterClip('MC01'), talk: counterClip('MC02'), hair: counterClip('MC03'),
      shoulder: counterClip('MC04'), hand: counterClip('MC05'), laugh: counterClip('MC06'), approach: counterClip('MC07') }) }),
  'ilyra-window': Object.freeze({ id: 'ilyra-window', companion: 'ilyra', basePose: windowPose, referenceId: windowReference,
    clips: Object.freeze({ idle: windowClip('IF01'), talk: windowClip('IF02'), hair: windowClip('IF03'),
      shoulder: windowClip('IF04'), hand: windowClip('IF05') }) }),
});
const actionRoles: Readonly<Record<SceneAction, SceneRole>> = {
  idle: 'idle', talk: 'talk', gift: 'talk', hair: 'hair', shoulder: 'shoulder', hand: 'hand',
  laugh: 'laugh', compliment: 'approach', tease: 'laugh',
};
const object = (value: unknown): value is Record<string, unknown> => !!value && typeof value === 'object' && !Array.isArray(value);
const nonempty = (value: unknown): value is string => typeof value === 'string' && value.trim().length > 0;

/** All basic interactions and every advertised extra must exist; never use standard fallbacks. */
export function isCompleteTavernScene(value: unknown, availableFiles: ReadonlySet<string>): value is TavernScene {
  if (!object(value)) return false;
  const who = value.id === 'mara-counter' ? 'mara' : value.id === 'ilyra-window' ? 'ilyra' : undefined;
  if (!who || value.companion !== who || !nonempty(value.basePose) || !nonempty(value.referenceId)
    || !object(value.clips) || CORE_SCENE_ROLES.some(role => !Object.hasOwn(value.clips as object, role))
    || Object.keys(value.clips).some(role => !(SCENE_ROLES as readonly string[]).includes(role))) return false;
  const prefix = `${value.id}/`;
  for (const clip of Object.values(value.clips)) {
    if (!object(clip) || typeof clip.file !== 'string' || !clip.file.startsWith(prefix)
      || !/^[A-Za-z0-9_-]+\.mp4$/.test(clip.file.slice(prefix.length))
      || !availableFiles.has(clip.file)
      || clip.startPose !== value.basePose || clip.endPose !== value.basePose
      || clip.referenceId !== value.referenceId) return false;
  }
  return true;
}

/** Scene and pose are inferred internally from the active visit, not extra menus. */
export function resolveSceneClip(value: unknown, action: SceneAction, availableFiles: ReadonlySet<string>): Readonly<SceneClip> | undefined {
  if (!Object.hasOwn(actionRoles, action) || !isCompleteTavernScene(value, availableFiles)
    || action === 'tease' && value.companion !== 'mara') return undefined;
  const clip = value.clips[actionRoles[action]];
  return clip ? { ...clip } : undefined;
}
