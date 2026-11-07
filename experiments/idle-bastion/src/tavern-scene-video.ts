import { isCompleteTavernScene, SCENE_ROLES, type TavernScene, type SceneAction, type SceneRole, type SceneClips } from './tavern-scene-catalog';
import type { TouchRegion } from './tavern-social';

export interface SceneVideoMetadata { readonly fps: number; readonly frames: number; readonly duration: number }
export interface TavernSceneVideoConfig {
  readonly scene: TavernScene;
  /** Media metadata keyed by the scene-relative filename, including intentional reuse. */
  readonly media: Readonly<Record<string, SceneVideoMetadata>>;
  readonly poster: string;
  readonly background: string;
  /** Coordinates in the existing logical 480 × 700 stage, after the two-pixel crop. */
  readonly anchors: Readonly<Record<TouchRegion, { readonly x: number; readonly y: number }>>;
}
export interface CompiledTavernSceneVideo {
  readonly id: TavernScene['id'];
  readonly companion: TavernScene['companion'];
  readonly clips: SceneClips<SceneVideoMetadata & { readonly file: string; readonly url: string }>;
  readonly poster: string;
  readonly background: string;
  readonly anchors: TavernSceneVideoConfig['anchors'];
}

const actionRoles: Readonly<Record<SceneAction, SceneRole>> = {
  idle: 'idle', talk: 'talk', gift: 'talk', hair: 'hair', shoulder: 'shoulder', hand: 'hand',
  laugh: 'laugh', compliment: 'approach', tease: 'laugh',
};
const object = (value: unknown): value is Record<string, unknown> => !!value && typeof value === 'object' && !Array.isArray(value);
const text = (value: unknown): value is string => typeof value === 'string' && value.trim().length > 0;
const positive = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value) && value > 0;

/** Compile only a complete scene whose files really exist in the supplied build glob. */
export function compileTavernSceneVideo(value: unknown, availableUrls: Readonly<Record<string, string>>): CompiledTavernSceneVideo | undefined {
  if (!object(value) || !object(value.media) || !text(value.poster) || !text(value.background) || !object(value.anchors)) return;
  const files = new Set(Object.keys(availableUrls).filter(file => text(availableUrls[file])));
  if (!isCompleteTavernScene(value.scene, files)) return;
  const anchors = {} as Record<TouchRegion, { x: number; y: number }>;
  for (const region of ['hair', 'shoulder', 'hand'] as const) {
    const anchor = value.anchors[region];
    if (!object(anchor) || typeof anchor.x !== 'number' || !Number.isFinite(anchor.x) || anchor.x < 0 || anchor.x > 480
      || typeof anchor.y !== 'number' || !Number.isFinite(anchor.y) || anchor.y < 0 || anchor.y > 700) return;
    anchors[region] = Object.freeze({ x: anchor.x, y: anchor.y });
  }
  const clips = {} as Record<SceneRole, SceneVideoMetadata & { file: string; url: string }>;
  for (const role of SCENE_ROLES) {
    const source = value.scene.clips[role];
    if (!source) continue;
    const file = source.file;
    const metadata = value.media[file];
    if (!object(metadata) || !positive(metadata.fps) || metadata.fps > 120
      || !positive(metadata.frames) || !Number.isSafeInteger(metadata.frames)
      || !positive(metadata.duration) || Math.abs(metadata.duration - metadata.frames / metadata.fps) > 1 / metadata.fps) return;
    clips[role] = Object.freeze({ file, url: availableUrls[file]!, fps: metadata.fps, frames: metadata.frames, duration: metadata.duration });
  }
  // Copy values so later edits to the caller's draft cannot cross scene/pose boundaries.
  return Object.freeze({ id: value.scene.id, companion: value.scene.companion, clips: Object.freeze(clips),
    poster: value.poster, background: value.background, anchors: Object.freeze(anchors) });
}

export function sceneVideoRole(scene: CompiledTavernSceneVideo, action: SceneAction): SceneRole | undefined {
  if (!Object.hasOwn(actionRoles, action) || action === 'tease' && scene.companion !== 'mara') return;
  const role = actionRoles[action];
  return scene.clips[role] ? role : undefined;
}
