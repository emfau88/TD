import Phaser from 'phaser';
import { succubusDanceFrame, SUCCUBUS_DANCE_SCALE } from '../../../reference/src/succubus-art';
import { KEYS } from './art';
import { BOSS, type BossCharm } from './boss';
import type { IdleBattle } from './battle';

// Presentation adapted from reference/src/scene.ts. Both atlases, the target's
// wobble and every heart use the saved spell timer, never a wall-clock tween.
export function charmAge(charm: BossCharm): number {
  return charm.phase === 'windup' ? Math.max(0, BOSS.windup - charm.remaining)
    : charm.phase === 'channel' ? BOSS.windup + Math.max(0, BOSS.channel - charm.remaining) : 0;
}
function pixelHeart(g: Phaser.GameObjects.Graphics, x: number, y: number, size: number, alpha: number): void {
  const p = size / 8;
  g.fillStyle(0xffa4d6, alpha);
  g.fillRect(x-3*p,y-3*p,2*p,2*p).fillRect(x+p,y-3*p,2*p,2*p);
  g.fillRect(x-4*p,y-p,8*p,2*p).fillRect(x-3*p,y+p,6*p,2*p).fillRect(x-p,y+3*p,2*p,p);
}

export class BossCharmView {
  private readonly panel: Phaser.GameObjects.Container;
  private readonly backing: Phaser.GameObjects.Graphics;
  private readonly clip: Phaser.GameObjects.Image;
  private readonly caption: Phaser.GameObjects.Text;
  private readonly tether: Phaser.GameObjects.Graphics;
  private bounds = new Phaser.Geom.Rectangle();

  constructor(private readonly scene: Phaser.Scene, private readonly density: number) {
    this.backing = scene.add.graphics();
    this.clip = scene.add.image(0, 42, KEYS.bossDance).setOrigin(0.5, 0.875).setScale(SUCCUBUS_DANCE_SCALE);
    this.caption = scene.add.text(0, 61, '', { fontFamily: 'Segoe UI, sans-serif', fontSize: '11px', fontStyle: 'bold',
      color: '#ffe2ef', resolution: 2, align: 'center' }).setOrigin(0.5, 0);
    this.panel = scene.add.container(0, 0, [this.backing, this.clip, this.caption]).setDepth(6200).setVisible(false);
    this.tether = scene.add.graphics().setDepth(6199);
  }
  contains(point: { x: number; y: number }): boolean { return this.panel.visible && this.bounds.contains(point.x, point.y); }
  destroy(): void { this.panel.destroy(true); this.tether.destroy(); }

  draw(sim: IdleBattle, portrait: boolean): void {
    const charm = sim.bossCharm, boss = sim.bossEnemy;
    const active = charm.phase === 'channel', casting = active || charm.phase === 'windup';
    const target = casting && sim.towers.find(t => t.uid === charm.targetUid);
    this.tether.clear();
    this.panel.setVisible(Boolean(boss && target));
    if (!boss || !target) return;
    const age = charmAge(charm), opacity = Math.min(1, age / 0.18);
    const camera = this.scene.cameras.main, unit = this.density / camera.zoom;
    // Keep the portrait readable at every map zoom, inside the visible map and
    // clear of the boss banner, dock and mobile pause control.
    const topLeft = camera.getWorldPoint(8 * this.density, (portrait ? 122 : 188) * this.density);
    const bottomRight = camera.getWorldPoint(this.scene.scale.width - 8 * this.density,
      this.scene.scale.height - (portrait ? 62 : 156) * this.density);
    const halfW = 68 * unit, halfH = 82 * unit;
    const clamp = (x: number, y: number) => ({
      x: Phaser.Math.Clamp(x, topLeft.x + halfW, Math.max(topLeft.x + halfW, bottomRight.x - halfW)),
      y: Phaser.Math.Clamp(y, topLeft.y + halfH, Math.max(topLeft.y + halfH, bottomRight.y - halfH)),
    });
    const candidates = [clamp(boss.x, boss.y - 150 * unit), clamp(boss.x, boss.y + 125 * unit),
      clamp(boss.x - 115 * unit, boss.y), clamp(boss.x + 115 * unit, boss.y)];
    const obstruction = (p: {x:number;y:number}) => [boss, target].reduce((score, actor) =>
      score + (Math.abs(p.x - actor.x) < halfW + 30 && Math.abs(p.y - (actor.y - 24)) < halfH + 35 ? 1 : 0), 0);
    // Stable order breaks ties: above, below, left, right. Avoid hiding either
    // the source or its target where the current camera gives us enough room.
    const position = candidates.sort((a,b) => obstruction(a) - obstruction(b))[0];
    this.panel.setPosition(position.x, position.y).setScale(unit).setAlpha(opacity);
    this.bounds.setTo(position.x - halfW, position.y - halfH, halfW * 2, halfH * 2);
    this.backing.clear().fillStyle(0x291b37, 0.95).fillRoundedRect(-68, -82, 136, 164, 5);
    this.backing.lineStyle(2, 0xb58b65, 1).strokeRoundedRect(-68, -82, 136, 164, 5);
    this.backing.lineStyle(1, active ? 0xffa3d1 : 0xa86b9a, 0.85).strokeRoundedRect(-64, -78, 128, 156, 3);
    this.backing.fillStyle(0x170d25, 0.75).fillEllipse(0, 44, 56, 10);
    pixelHeart(this.backing, -49, -65, 8, active ? 1 : 0.45);
    pixelHeart(this.backing, 49, -65, 8, active ? 1 : 0.45);
    this.clip.setFrame(succubusDanceFrame(age * 1000));
    this.caption.setText(`${active ? 'Verführt' : 'Wirkt Zauber'} · ${charm.remaining.toFixed(1)} s`);
    this.backing.fillStyle(0x170d25, 1).fillRect(-51, 55, 102, 3);
    this.backing.fillStyle(0xf598d6, 0.95).fillRect(-51, 55, 102 * charm.remaining / (active ? BOSS.channel : BOSS.windup), 3);

    const start = { x: boss.x, y: boss.y - 26 }, end = { x: target.x, y: target.y - 34 };
    const curve = (t: number) => ({ x: Phaser.Math.Linear(start.x, end.x, t),
      y: Phaser.Math.Linear(start.y, end.y, t) - Math.sin(t * Math.PI) * 26 });
    this.tether.setAlpha(opacity).lineStyle(active ? 2 : 1, 0xf185c1, active ? 0.9 : 0.45);
    for (let step = 0; step < 30; step++) {
      if (!active && step % 4 >= 2) continue;
      const from = curve(step / 30), to = curve((step + 1) / 30);
      this.tether.lineBetween(from.x, from.y, to.x, to.y);
    }
    if (active) for (let index = 0; index < 3; index++) {
      const point = curve((age * 0.7 + index / 3) % 1);
      pixelHeart(this.tether, point.x, point.y, 7, 0.95);
    }
    for (let index = 0; index < 5; index++) {
      const progress = (age / 1.65 + index / 5) % 1;
      const x = end.x + (index % 3 - 1) * 10 + Math.sin(progress * Math.PI * 2 + index * 1.7) * 4;
      const y = end.y - 5 - progress * (38 + index % 2 * 8);
      const alpha = Math.min(1, progress / 0.16, (1 - progress) / 0.3) * (active ? 0.95 : 0.35);
      pixelHeart(this.tether, x, y, (index % 2 ? 7 : 10) * (1 - progress * 0.25), alpha);
    }
    if (active) {
      const pulse = (Math.sin(age * 5) + 1) / 2;
      this.tether.fillStyle(0xf185c1, 0.06 + pulse * 0.07).fillEllipse(target.x, target.y - 23, 42 + pulse * 6, 48 + pulse * 6);
      this.tether.lineStyle(1, 0xffb9de, 0.25 + pulse * 0.2).strokeEllipse(target.x, target.y - 23, 38 + pulse * 5, 44 + pulse * 5);
    }
  }
}
