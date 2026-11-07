export type TavernSceneId = 'mara-counter' | 'ilyra-window';
export type SceneRole = 'idle' | 'talk' | 'hair' | 'shoulder' | 'hand' | 'laugh' | 'approach';
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
  readonly clips: Readonly<Record<SceneRole, SceneClip>>;
}

// Populated only after all local roles and their media have been delivered.
export const TAVERN_SCENE_CATALOG: Readonly<Partial<Record<TavernSceneId, TavernScene>>> = Object.freeze({});
const roles: readonly SceneRole[] = ['idle', 'talk', 'hair', 'shoulder', 'hand', 'laugh', 'approach'];
const actionRoles: Readonly<Record<SceneAction, SceneRole>> = {
  idle: 'idle', talk: 'talk', gift: 'talk', hair: 'hair', shoulder: 'shoulder', hand: 'hand',
  laugh: 'laugh', compliment: 'approach', tease: 'laugh',
};
const object = (value: unknown): value is Record<string, unknown> => !!value && typeof value === 'object' && !Array.isArray(value);
const nonempty = (value: unknown): value is string => typeof value === 'string' && value.trim().length > 0;

/** A scene is usable as a whole, never as a partial set with standard fallbacks. */
export function isCompleteTavernScene(value: unknown, availableFiles: ReadonlySet<string>): value is TavernScene {
  if (!object(value)) return false;
  const who = value.id === 'mara-counter' ? 'mara' : value.id === 'ilyra-window' ? 'ilyra' : undefined;
  if (!who || value.companion !== who || !nonempty(value.basePose) || !nonempty(value.referenceId)
    || !object(value.clips) || Object.keys(value.clips).length !== roles.length) return false;
  const prefix = `${value.id}/`;
  for (const role of roles) {
    const clip = value.clips[role];
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
  return { ...value.clips[actionRoles[action]] };
}
