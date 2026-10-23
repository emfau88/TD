import type Phaser from 'phaser';
import { jellyFrame } from '../../../reference/src/jelly-art';
import { succubusFrame } from '../../../reference/src/succubus-art';
import type { EnemyId } from './enemy-roster';
import { LOCAL_ENEMY_FRAMES } from './local-enemy-frames';
import { LUCIFER_FRAMES } from './lucifer-frames';
export type EnemyDirection = 'up' | 'down' | 'side';
interface Clip { frames: readonly number[]; durations: readonly number[] }
interface EnemySheet { key: string; url: string; width: number; height: number; scale: number; facesLeft: boolean; skins?: number; move: Record<EnemyDirection, Clip> & {left?: Clip}; heal?: Record<EnemyDirection, Clip> & {left?: Clip} }
/** Extracted from public/assets/manifest.json. Logical tags resolve through frameMap.
 * Voidbutterfly's second Idle group is the source pack's directional movement.
 * Side artwork was visually checked; left-facing sheets invert horizontal mirroring.
 */
export const ENEMY_SHEETS: Record<EnemyId, EnemySheet> = {
  MossShroom: { ...LOCAL_ENEMY_FRAMES.MossShroom, url:new URL('../assets/local-monsters/MossShroom.png',import.meta.url).href },
  WoodSpider: { ...LOCAL_ENEMY_FRAMES.WoodSpider, url:new URL('../assets/local-monsters/WoodSpider.png',import.meta.url).href },
  HornedBat: { ...LOCAL_ENEMY_FRAMES.HornedBat, url:new URL('../assets/local-monsters/HornedBat.png',import.meta.url).href },
  EmberBomb: { ...LOCAL_ENEMY_FRAMES.EmberBomb, url:new URL('../assets/local-monsters/EmberBomb.png',import.meta.url).href },

  ForestGoblin: { ...LUCIFER_FRAMES.ForestGoblin, key:'idle-enemy-ForestGoblin', url:new URL('../assets/lucifer/ForestGoblin.png',import.meta.url).href },
  BoneGuard: { ...LUCIFER_FRAMES.BoneGuard, key:'idle-enemy-BoneGuard', url:new URL('../assets/lucifer/BoneGuard.png',import.meta.url).href },
  ForestCultist: { ...LUCIFER_FRAMES.ForestCultist, key:'idle-enemy-ForestCultist', url:new URL('../assets/lucifer/ForestCultist.png',import.meta.url).href },
  Leafbug: { ...{"key": "idle-enemy-Leafbug", "width": 64, "height": 64, "scale": 0.83, "facesLeft": false, "move": {"down": {"frames": [24, 25, 26, 27, 28, 29, 30, 31], "durations": [100, 100, 100, 100, 100, 100, 100, 100]}, "up": {"frames": [32, 33, 34, 35, 36, 37, 38, 39], "durations": [100, 100, 100, 100, 100, 100, 100, 100]}, "side": {"frames": [40, 41, 42, 43, 44, 45, 46, 47], "durations": [100, 100, 100, 100, 100, 100, 100, 100]}}}, url: new URL('../../../public/assets/Leafbug.png', import.meta.url).href },
  Firebug: { ...{"key": "idle-enemy-Firebug", "width": 128, "height": 64, "scale": 0.83, "facesLeft": false, "move": {"down": {"frames": [33, 34, 35, 36, 37, 38, 39, 40], "durations": [100, 100, 100, 100, 100, 100, 100, 100]}, "up": {"frames": [44, 45, 46, 47, 48, 49, 50, 51], "durations": [100, 100, 100, 100, 100, 100, 100, 100]}, "side": {"frames": [55, 56, 57, 58, 59, 60, 61, 62], "durations": [100, 100, 100, 100, 100, 100, 100, 100]}}}, url: new URL('../../../public/assets/Firebug.png', import.meta.url).href },
  Scorpion: { ...{"key": "idle-enemy-Scorpion", "width": 64, "height": 64, "scale": 0.83, "facesLeft": true, "move": {"down": {"frames": [24, 25, 26, 27, 28, 29, 30, 31], "durations": [100, 100, 100, 100, 100, 100, 100, 100]}, "up": {"frames": [32, 33, 34, 35, 36, 37, 38, 39], "durations": [100, 100, 100, 100, 100, 100, 100, 100]}, "side": {"frames": [40, 41, 42, 43, 44, 45, 46, 47], "durations": [100, 100, 100, 100, 100, 100, 100, 100]}}}, url: new URL('../../../public/assets/Scorpion.png', import.meta.url).href },
  FlyingLocust: { ...{"key": "idle-enemy-FlyingLocust", "width": 64, "height": 64, "scale": 0.83, "facesLeft": false, "move": {"down": {"frames": [42, 43, 44, 45, 46, 47, 48, 49], "durations": [100, 100, 100, 100, 100, 100, 100, 100]}, "up": {"frames": [56, 57, 58, 59, 60, 61, 62, 63], "durations": [100, 100, 100, 100, 100, 100, 100, 100]}, "side": {"frames": [70, 71, 72, 73, 74, 75, 76, 77], "durations": [100, 100, 100, 100, 100, 100, 100, 100]}}}, url: new URL('../../../public/assets/Flying Locust.png', import.meta.url).href },
  Firewasp: { ...{"key": "idle-enemy-Firewasp", "width": 96, "height": 96, "scale": 0.65, "facesLeft": false, "move": {"down": {"frames": [36, 37, 38, 39, 40, 41, 42, 43], "durations": [100, 100, 100, 100, 100, 100, 100, 100]}, "up": {"frames": [48, 49, 50, 51, 52, 53, 54, 55], "durations": [100, 100, 100, 100, 100, 100, 100, 100]}, "side": {"frames": [60, 61, 62, 63, 64, 65, 66, 67], "durations": [100, 100, 100, 100, 100, 100, 100, 100]}}}, url: new URL('../../../public/assets/Firewasp.png', import.meta.url).href },
  MagmaCrab: { ...{"key": "idle-enemy-MagmaCrab", "width": 64, "height": 64, "scale": 0.83, "facesLeft": true, "move": {"down": {"frames": [30, 31, 32, 33, 34, 35, 36, 37], "durations": [100, 100, 100, 100, 100, 100, 100, 100]}, "up": {"frames": [40, 41, 42, 43, 44, 45, 46, 47], "durations": [100, 100, 100, 100, 100, 100, 100, 100]}, "side": {"frames": [50, 51, 52, 53, 54, 55, 56, 57], "durations": [100, 100, 100, 100, 100, 100, 100, 100]}}}, url: new URL('../../../public/assets/Magma Crab.png', import.meta.url).href },
  Clampbeetle: { ...{"key": "idle-enemy-Clampbeetle", "width": 64, "height": 64, "scale": 0.83, "facesLeft": true, "move": {"down": {"frames": [39, 40, 41, 42, 43, 44, 45, 46], "durations": [100, 100, 100, 100, 100, 100, 100, 100]}, "up": {"frames": [52, 53, 54, 55, 56, 57, 58, 59], "durations": [100, 100, 100, 100, 100, 100, 100, 100]}, "side": {"frames": [65, 66, 67, 68, 69, 70, 71, 72], "durations": [100, 100, 100, 100, 100, 100, 100, 100]}}}, url: new URL('../../../public/assets/Clampbeetle.png', import.meta.url).href },
  Voidbutterfly: { ...{"key": "idle-enemy-Voidbutterfly", "width": 64, "height": 64, "scale": 0.83, "facesLeft": false, "move": {"down": {"frames": [39, 40, 41, 42], "durations": [100, 100, 100, 100]}, "up": {"frames": [52, 53, 54, 55], "durations": [100, 100, 100, 100]}, "side": {"frames": [65, 66, 67, 68], "durations": [100, 100, 100, 100]}}}, url: new URL('../../../public/assets/Voidbutterfly.png', import.meta.url).href },
  LanternJelly: { key: 'idle-enemy-LanternJelly', width: 64, height: 64, scale: 0.83, facesLeft: false, move: { down: {frames: [], durations: []}, up: {frames: [], durations: []}, side: {frames: [], durations: []} }, url: new URL('../../../public/assets/Lantern Jelly Pixel v1.png', import.meta.url).href },
  Rosenspiegel: { key: 'idle-enemy-Rosenspiegel', width: 64, height: 64, scale: 1.15, facesLeft: false, move: { down: {frames: [], durations: []}, up: {frames: [], durations: []}, side: {frames: [], durations: []} }, url: new URL('../../../public/assets/Succubus Pixel v2.png', import.meta.url).href },
};
export function preloadEnemySheets(scene: Phaser.Scene): void {
  for (const s of Object.values(ENEMY_SHEETS)) scene.load.spritesheet(s.key, s.url, { frameWidth: s.width, frameHeight: s.height });
}
export function enemyFrame(kind: EnemyId, direction: EnemyDirection, elapsed: number, movingLeft = false, identity = 0): number {
  if (kind === 'Rosenspiegel') return succubusFrame('move', direction, elapsed * 1000);
  if (kind === 'LanternJelly') return jellyFrame('move', direction, elapsed * 1000);
  const clips = ENEMY_SHEETS[kind].move;
  return clipFrame(direction === 'side' && movingLeft && clips.left ? clips.left : clips[direction],elapsed*1000) + (identity % (ENEMY_SHEETS[kind].skins ?? 1)) * 32;
}
function clipFrame({frames,durations}: Clip, elapsed: number): number {
  let time = Math.max(0, elapsed) % durations.reduce((sum, ms) => sum + ms, 0);
  for (let i = 0; i < frames.length; i++) { if (time < durations[i]) return frames[i]; time -= durations[i]; }
  return frames[0];
}
export function enemyHealFrame(kind: EnemyId, direction: EnemyDirection, elapsed: number, movingLeft = false): number {
  if (kind === 'LanternJelly') return jellyFrame('heal',direction,elapsed*1000);
  const clips=ENEMY_SHEETS[kind].heal;
  return clips ? clipFrame(direction==='side' && movingLeft && clips.left ? clips.left : clips[direction],elapsed*1000) : enemyFrame(kind,direction,elapsed,movingLeft);
}
export function enemyFlip(kind: EnemyId, direction: EnemyDirection, movingLeft: boolean): boolean {
  if (ENEMY_SHEETS[kind].move.left) return false;
  return direction === 'side' && (ENEMY_SHEETS[kind].facesLeft ? !movingLeft : movingLeft);
}
