import type { WorldPoint } from './layout';

/** Frame actual saved positions, including legacy starts, without moving actors. */
export function tutorialDefenseFrame(spawn: WorldPoint, starter: WorldPoint, frost?: WorldPoint) {
  const points = frost ? [spawn, starter, frost] : [spawn, starter];
  const left = Math.min(...points.map(point => point.x)) - 40;
  const right = Math.max(...points.map(point => point.x)) + 40;
  const top = Math.min(spawn.y - 40, starter.y - 110, frost ? frost.y - 110 : Infinity);
  const bottom = Math.max(...points.map(point => point.y)) + 50;
  return { left, right, top, bottom, width: right - left, height: bottom - top, x: (left + right) / 2, y: (top + bottom) / 2 };
}
export function tutorialDefenseZoom(normal: number, viewportWidth: number, viewportHeight: number, frame: { width: number; height: number }): number {
  return Math.min(normal, viewportWidth / frame.width, viewportHeight / frame.height);
}
