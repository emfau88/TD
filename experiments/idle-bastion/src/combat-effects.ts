import type Phaser from 'phaser';
import { visualStage, type BattleEvent } from './battle';
import { TOWER_SHEETS, towerSheet } from './tower-atlas';
import { worldEffectDepth } from './world-depth';
import { stormLinkStyle, stormLinkPoints } from './storm-visuals';
import { evolutionSkin } from './tower-evolution';
import { evolutionImpact } from './evolution-impacts';
import { chainSource, type PresentEnemy } from './enemy-presentation';

type Effect = { sprite: Phaser.GameObjects.Image; at: number; frames: readonly number[]; duration: number };
/** Cosmetic, bounded effects follow confirmed simulation time, including pause. */
export class CombatEffects {
  private effects: Effect[] = [];
  private shots = new Map<number, number>();
  private fires = new Map<number, number>();
  private links: {line: Phaser.GameObjects.Graphics; at: number; duration:number}[] = [];
  constructor(private scene: Phaser.Scene, private present?: PresentEnemy) {}
  firedAt(uid: number): number { return this.fires.get(uid) ?? -100; }
  shotAge(uid: number, elapsed: number): number {
    if (!this.shots.has(uid)) this.shots.set(uid, elapsed);
    return elapsed - this.shots.get(uid)!;
  }
  accept(events: readonly BattleEvent[], elapsed: number): void {
    const hits = new Set<string>();
    for (const e of events) {
      if (e.type === 'fire' && e.tower) this.fires.set(e.tower.uid, elapsed);
      if (e.type === 'fire' && e.shot?.kind === 5 && e.enemy) {
        if(this.links.length>=48)this.links.shift()!.line.destroy();
        const target=this.present?.(e.enemy) ?? { ...e.enemy, groundY:e.enemy.y };
        const previous=chainSource(e,events), from=previous && this.present?.(previous);
        const line=this.scene.add.graphics().setDepth(worldEffectDepth(target.groundY));
        const emitter=e.tower?evolutionSkin(5,e.shot.level):undefined;
        const x=e.x!+(from?from.x-previous!.x:0),y=e.y!+(emitter?emitter.weaponY-4:0)+(from?from.y-previous!.y:0),style=stormLinkStyle(e.shot.level);
        const points=stormLinkPoints(x,y,target.x,target.y,e.shot.level,e.shot.uid);
        for(const [width,color,alpha] of [[style.width+2,style.colors[0],.35],[style.width,style.colors[1],.9],[1,style.colors[2],1]]){
          line.lineStyle(width,color,alpha).beginPath().moveTo(points[0].x,points[0].y);
          for(const p of points.slice(1))line.lineTo(p.x,p.y);line.strokePath();
        }
        if(style.branches){const p=points[Math.floor(points.length/2)];line.lineStyle(1,style.colors[1],.7).beginPath().moveTo(p.x,p.y).lineTo(p.x+4,p.y-5).lineTo(p.x+2,p.y-8).strokePath();}
        this.links.push({line,at:elapsed,duration:style.duration});
      }
      if ((e.type === 'build' || e.type === 'upgrade') && e.tower) {
        const sheet = TOWER_SHEETS.construction;
        // The last transition contains only dust: no premature Wisp or wrong tower silhouette.
        this.add(sheet.key, e.tower.x, e.tower.y + 14, sheet.frameMap.slice(28, 33), elapsed, 0.55, 0.55, 0.8, e.tower.y);
      }
      const hitKey=e.shot?`${e.shot.uid}:${e.shot.chainHits?.length??0}`:'';
      if (e.type === 'hit' && e.shot && !hits.has(hitKey)) {
        hits.add(hitKey);
        const pose=e.enemy && this.present?.(e.enemy);
        const x=e.x!+(pose?pose.x-e.enemy!.x:0),y=e.y!+(pose?pose.y-e.enemy!.y:0);
        const groundY=e.y!+(pose?pose.groundY-e.enemy!.y:0);
        const evolved = evolutionImpact(e.shot.kind, e.shot.level);
        if (evolved) {
          this.add(evolved.key, x, y, evolved.frames, elapsed, evolved.duration, 1, .5, groundY);
          continue;
        }
        const sheet = towerSheet(e.shot.kind, e.shot.kind===2?1:visualStage(e.shot.level), 'Projectile - Impact');
        this.add(sheet.key, x, y, sheet.frameMap, elapsed,
          e.shot.kind === 5 ? 0.25 : e.shot.kind === 4 ? 0.35 : 0.5, e.shot.kind === 5 ? 30/sheet.width : e.shot.kind === 3 ? 1.6 : e.shot.kind === 2 ? 0.8 : 0.6, .5, groundY);
      }
    }
  }
  private add(key: string, x: number, y: number, frames: readonly number[], at: number, duration: number, scale: number, origin = 0.5, groundY = y): void {
    if (this.effects.length >= 96) this.effects.shift()!.sprite.destroy();
    this.effects.push({ sprite: this.scene.add.image(x, y, key, frames[0]).setScale(scale).setOrigin(0.5, origin).setDepth(worldEffectDepth(groundY)), at, frames, duration });
  }
  update(elapsed: number, shots: ReadonlySet<number>, towers: ReadonlySet<number>): void {
    this.links=this.links.filter(link=>{const age=elapsed-link.at;if(age<0||age>=link.duration){link.line.destroy();return false;}link.line.setAlpha(1-age/link.duration);return true;});
    for (const id of this.shots.keys()) if (!shots.has(id)) this.shots.delete(id);
    for (const id of this.fires.keys()) if (!towers.has(id) || this.fires.get(id)! > elapsed) this.fires.delete(id);
    this.effects = this.effects.filter(e => {
      const age = elapsed - e.at;
      if (age < 0 || age >= e.duration) { e.sprite.destroy(); return false; }
      e.sprite.setFrame(e.frames[Math.min(e.frames.length - 1, Math.floor(age / e.duration * e.frames.length))]);
      return true;
    });
  }
  destroy(): void { for (const e of this.effects) e.sprite.destroy(); for(const link of this.links)link.line.destroy(); this.links=[];this.effects = []; this.shots.clear(); this.fires.clear(); }
}
