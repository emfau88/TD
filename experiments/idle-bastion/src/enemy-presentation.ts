import type { Enemy, Shot, BattleEvent } from './battle';
import type { IdleLayout, WorldPoint } from './layout';
import type { EnemyId } from './enemy-roster';
import { ENEMY_SHEETS, slimeHop } from './enemy-art';

// Maximum opaque extent from the atlas anchor, across movement/heal poses.
// [sideways pose's Y radius, up/down pose's X radius], before sprite scaling.
// Large silhouettes get no extra sideways displacement; unknown/boss art stays centred.
const CROSS_RADIUS: Partial<Record<EnemyId, readonly [number, number]>> = {
  Leafbug: [11, 11], Firebug: [18, 32], Scorpion: [21, 24],
  MagmaCrab: [19, 21], FlyingLocust: [23, 29], Firewasp: [32, 32],
  Clampbeetle: [31, 32], Voidbutterfly: [28, 29], LanternJelly: [17, 22],
  ForestGoblin: [20, 17], BoneGuard: [21, 17], ForestCultist: [32, 12],
  MossShroom: [15, 10], WoodSpider: [24, 19], HornedBat: [25, 22],
  EmberBomb: [15, 10], CobaltSlime: [19, 19], FlameWisp: [20, 15], FloatingEye: [17, 10],
};
export interface EnemyPresentation extends WorldPoint { groundX: number; groundY: number; lift: number }
export type PresentEnemy = (enemy: Enemy) => EnemyPresentation;
const smooth = (n: number) => { const x = Math.max(0, Math.min(1, n)); return x * x * (3 - 2 * x); };

/** Pure rendering projection. No neighbours, physics, timers or save fields. */
export function enemyPresentation(enemy: Enemy, layout: IdleLayout, elapsed: number): EnemyPresentation {
  let x = enemy.x, y = enemy.y;
  const extent = CROSS_RADIUS[enemy.def.id], a = layout.road.waypoints[enemy.segment], b = layout.road.waypoints[enemy.segment + 1];
  if (extent && a && b) {
    const size = layout.cellSize, dx = Math.sign(b.x - a.x), dy = Math.sign(b.y - a.y);
    const radius = extent[dx ? 0 : 1] * ENEMY_SHEETS[enemy.def.id].scale;
    const room = Math.max(0, Math.min(3, size / 2 - 2 - radius));
    const from = Math.hypot(enemy.x - (a.x + .5) * size, enemy.y - (a.y + .5) * size);
    const to = Math.hypot(enemy.x - (b.x + .5) * size, enemy.y - (b.y + .5) * size);
    // Return gently to the centre before a turn, then ease out on the next straight.
    const offset = (enemy.uid % 3 - 1) * room * smooth((Math.min(from, to) - 24) / 24);
    x -= dy * offset; y += dx * offset;
  }
  const lift = enemy.def.id === 'CobaltSlime' ? slimeHop(elapsed)
    : enemy.def.flying ? 9.8 + Math.sin(elapsed * 5 + enemy.uid) * 1.5 : 0;
  return { x, y: y - lift, groundX: x, groundY: y, lift };
}

/** Translate an existing hit point, preserving e.g. a worm's body hit location. */
export function presentedTarget(enemy: Enemy, point: WorldPoint, pose: EnemyPresentation): WorldPoint {
  return { x: point.x + pose.x - enemy.x, y: point.y + pose.y - enemy.y };
}
/** Original ballistic progress, only the destination artwork moves. */
export function presentedShot(shot: Shot, target: WorldPoint, visual: WorldPoint, origin?: WorldPoint): WorldPoint {
  const left = Math.hypot(target.x - shot.x, target.y - shot.y);
  const moved = origin ? Math.hypot(shot.x - origin.x, shot.y - origin.y) : 0;
  const progress = origin ? (moved + left > 0 ? moved / (moved + left) : 1) : smooth(1 - left / 64);
  return { x: shot.x + (visual.x - target.x) * progress, y: shot.y + (visual.y - target.y) * progress };
}
export function chainSource(event: BattleEvent, events: readonly BattleEvent[]): Enemy | undefined {
  const uid = event.shot?.chainHits?.at(-1);
  return event.type === 'fire' && !event.tower && uid !== undefined ? events.find(e => e.enemy?.uid === uid)?.enemy : undefined;
}
