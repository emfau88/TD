import type Phaser from 'phaser';
import { visualStage, type BattleEvent } from './battle';
import { TOWER_SHEETS, towerSheet } from './tower-atlas';
import { worldEffectDepth } from './world-depth';

type Effect = { sprite: Phaser.GameObjects.Image; at: number; frames: readonly number[]; duration: number };
/** Cosmetic, bounded effects follow confirmed simulation time, including pause. */
export class CombatEffects {
  private effects: Effect[] = [];
  private shots = new Map<number, number>();
  private fires = new Map<number, number>();
  constructor(private scene: Phaser.Scene) {}
  firedAt(uid: number): number { return this.fires.get(uid) ?? -100; }
  shotAge(uid: number, elapsed: number): number {
    if (!this.shots.has(uid)) this.shots.set(uid, elapsed);
    return elapsed - this.shots.get(uid)!;
  }
  accept(events: readonly BattleEvent[], elapsed: number): void {
    const hits = new Set<number>();
    for (const e of events) {
      if (e.type === 'fire' && e.tower) this.fires.set(e.tower.uid, elapsed);
      if ((e.type === 'build' || e.type === 'upgrade') && e.tower) {
        const sheet = TOWER_SHEETS.construction;
        // The last transition contains only dust: no premature Wisp or wrong tower silhouette.
        this.add(sheet.key, e.tower.x, e.tower.y + 14, sheet.frameMap.slice(28, 33), elapsed, 0.55, 0.55, 0.8, e.tower.y);
      }
      if (e.type === 'hit' && e.shot && !hits.has(e.shot.uid)) {
        hits.add(e.shot.uid);
        const sheet = towerSheet(e.shot.kind, visualStage(e.shot.level), 'Projectile - Impact');
        this.add(sheet.key, e.x!, e.y!, sheet.frameMap, elapsed,
          e.shot.kind === 4 ? 0.35 : 0.5, e.shot.kind === 3 ? 1.6 : e.shot.kind === 2 ? 0.8 : 0.6);
      }
    }
  }
  private add(key: string, x: number, y: number, frames: readonly number[], at: number, duration: number, scale: number, origin = 0.5, groundY = y): void {
    if (this.effects.length >= 96) this.effects.shift()!.sprite.destroy();
    this.effects.push({ sprite: this.scene.add.image(x, y, key, frames[0]).setScale(scale).setOrigin(0.5, origin).setDepth(worldEffectDepth(groundY)), at, frames, duration });
  }
  update(elapsed: number, shots: ReadonlySet<number>, towers: ReadonlySet<number>): void {
    for (const id of this.shots.keys()) if (!shots.has(id)) this.shots.delete(id);
    for (const id of this.fires.keys()) if (!towers.has(id) || this.fires.get(id)! > elapsed) this.fires.delete(id);
    this.effects = this.effects.filter(e => {
      const age = elapsed - e.at;
      if (age < 0 || age >= e.duration) { e.sprite.destroy(); return false; }
      e.sprite.setFrame(e.frames[Math.min(e.frames.length - 1, Math.floor(age / e.duration * e.frames.length))]);
      return true;
    });
  }
  destroy(): void { for (const e of this.effects) e.sprite.destroy(); this.effects = []; this.shots.clear(); this.fires.clear(); }
}
