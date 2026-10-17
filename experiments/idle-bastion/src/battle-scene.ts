import Phaser from 'phaser';
import { BASE, IdleBattle, stats, type Enemy, type Tower } from './battle';
import { cellCenter, type TowerPad } from './layout';
import { KEYS, MARA_FOOT, SCALE, enemyFrame, loopFrame, maraFrame, preloadArt, prepareArt } from './art';
import { createForest, type ForestView } from './forest';

export interface BattleSceneHooks {
  readonly changed: () => void;
  readonly select: (padId?: string) => void;
  readonly ready: () => void;
  readonly advance?: (seconds: number) => void;
  readonly canRender?: () => boolean;
  readonly selectMara?: () => void;
}
const colors = { gold: 0xd9bd79, text: '#eae5ce', muted: '#91a58e', panel: '#183424' };
type TowerView = { base: Phaser.GameObjects.Image; weapon: Phaser.GameObjects.Image };
type EnemyView = { sprite: Phaser.GameObjects.Image; shadow: Phaser.GameObjects.Ellipse };

/** B05 uses original measured artwork. Simulation time selects every frame;
 * Phaser animations, tweens and drawing never change combat or grant rewards.
 */
export class BattleScene extends Phaser.Scene {
  public paused = false;
  private forest?: ForestView;
  private selection!: Phaser.GameObjects.Graphics;
  private effects!: Phaser.GameObjects.Graphics;
  private mara!: Phaser.GameObjects.Image;
  private maraShadow!: Phaser.GameObjects.Ellipse;
  private maraName!: Phaser.GameObjects.Text;
  private readonly towerViews = new Map<number, TowerView>();
  private readonly enemyViews = new Map<number, EnemyView>();
  private readonly shotViews = new Map<number, Phaser.GameObjects.Image>();
  private readonly padLabels = new Map<string, Phaser.GameObjects.Text>();
  private readonly padMarks = new Map<string, Phaser.GameObjects.Graphics>();
  private selectedPadId?: string;
  private readyToDraw = false;
  private hudElapsed = 0;
  private readonly preventMiddleScroll = (event: MouseEvent) => { if (event.button === 1) event.preventDefault(); };
  private readonly preventWheel = (event: WheelEvent) => { if (!event.ctrlKey) event.preventDefault(); };
  private get sim(): IdleBattle { return this.readBattle(); }
  get mapZoom(): number { return this.cameras.main.zoom; }

  constructor(private readonly readBattle: () => IdleBattle, private readonly hooks: BattleSceneHooks) { super('IdleBattle'); }
  preload(): void { preloadArt(this); }
  create(): void {
    prepareArt(this);
    const { width, height } = this.sim.layout.bounds;
    this.cameras.main.setBounds(0, 0, width, height).setScroll(0, 0);
    this.forest = createForest(this, this.sim.layout);
    this.selection = this.add.graphics().setDepth(6000);
    this.effects = this.add.graphics().setDepth(5500);
    for (const pad of this.sim.layout.towerPads) {
      if (pad.cell.x >= this.sim.layout.bounds.columns) continue;
      const point = cellCenter(this.sim.layout, pad.cell);
      this.padMarks.set(pad.id, this.add.graphics().setDepth(20));
      this.padLabels.set(pad.id, this.add.text(point.x, point.y, '', {
        fontFamily: 'Segoe UI, sans-serif', fontSize: '10px', color: colors.text,
        stroke: '#233e2d', strokeThickness: 3, align: 'center',
      }).setOrigin(0.5).setDepth(5000));
    }
    this.maraShadow = this.add.ellipse(0, 0, 22, 8, 0x18382b, 0.22).setDepth(950);
    this.mara = this.add.image(0, 0, KEYS.mara, 0).setOrigin(MARA_FOOT[0] / 64, MARA_FOOT[1] / 64).setScale(SCALE.mara);
    this.maraName = this.add.text(0, 0, 'Mara', {
      fontFamily: 'Segoe UI, sans-serif', fontSize: '10px', color: '#fff3cf', stroke: '#20392c', strokeThickness: 3,
    }).setOrigin(0.5).setDepth(5001);
    this.input.on('pointerdown', this.selectAtPointer, this);
    this.input.on('pointermove', this.panAtPointer, this);
    this.input.on('wheel', this.zoomAtPointer, this);
    this.game.canvas.addEventListener('wheel', this.preventWheel, { passive: false });
    this.game.canvas.addEventListener('mousedown', this.preventMiddleScroll);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.readyToDraw = false;
      this.game.canvas.removeEventListener('wheel', this.preventWheel);
      this.game.canvas.removeEventListener('mousedown', this.preventMiddleScroll);
      this.input.off('pointerdown', this.selectAtPointer, this);
      this.input.off('pointermove', this.panAtPointer, this);
      this.input.off('wheel', this.zoomAtPointer, this);
      this.forest?.destroy(); this.forest = undefined;
      this.padLabels.clear(); this.padMarks.clear(); this.towerViews.clear(); this.enemyViews.clear(); this.shotViews.clear();
    });
    this.readyToDraw = true;
    this.refresh(); this.hooks.ready(); this.hooks.changed();
  }
  update(_time: number, delta: number): void {
    const rawSeconds = Number.isFinite(delta) ? Math.max(0, delta / 1000) : 0;
    if (!this.paused) {
      if (this.hooks.advance) this.hooks.advance(rawSeconds);
      else this.sim.update(Math.min(rawSeconds, 0.08));
    }
    if (!this.readyToDraw) return;
    if (this.hooks.canRender?.() ?? true) this.drawActors();
    this.hudElapsed += Math.min(rawSeconds, 0.08);
    if (this.hudElapsed >= 0.1) {
      this.hudElapsed %= 0.1;
      if (this.hooks.canRender?.() ?? true) this.refreshLabels();
      this.hooks.changed();
    }
  }
  setSelected(padId?: string): void {
    this.selectedPadId = this.sim.layout.towerPads.some(pad => pad.id === padId) ? padId : undefined;
    this.refresh();
  }
  refresh(): void {
    if (!this.readyToDraw || this.hooks.canRender?.() === false) return;
    this.refreshLabels(); this.drawSelection(); this.drawActors();
  }
  resetCamera(): void {
    this.cameras.main.setZoom(1).setScroll(0, 0); this.hooks.changed();
  }
  setMapZoom(value: number, pointerX = this.scale.width / 2, pointerY = this.scale.height / 2): void {
    if (!this.readyToDraw || !Number.isFinite(value)) return;
    const camera = this.cameras.main, old = camera.zoom;
    const zoom = Math.round(Phaser.Math.Clamp(value, 1, 1.15) * 100) / 100;
    camera.setZoom(zoom);
    camera.setScroll(camera.clampX(camera.scrollX + (pointerX - this.scale.width / 2) * (1 / old - 1 / zoom)),
      camera.clampY(camera.scrollY + (pointerY - this.scale.height / 2) * (1 / old - 1 / zoom)));
    if (old !== zoom) this.hooks.changed();
  }
  private panAtPointer(pointer: Phaser.Input.Pointer): void {
    if (!pointer.middleButtonDown() || this.mapZoom <= 1) return;
    const camera = this.cameras.main;
    camera.setScroll(camera.clampX(camera.scrollX - (pointer.x - pointer.prevPosition.x) / camera.zoom),
      camera.clampY(camera.scrollY - (pointer.y - pointer.prevPosition.y) / camera.zoom));
  }
  private zoomAtPointer(pointer: Phaser.Input.Pointer, _objects: unknown, _dx: number, dy: number): void {
    if ((pointer.event as WheelEvent).ctrlKey || !dy) return;
    this.setMapZoom(this.mapZoom + (dy < 0 ? 0.05 : -0.05), pointer.x, pointer.y);
  }
  private selectAtPointer(pointer: Phaser.Input.Pointer): void {
    if (!pointer.leftButtonDown() || this.hooks.canRender?.() === false) return;
    const point = this.cameras.main.getWorldPoint(pointer.x, pointer.y), size = this.sim.layout.cellSize;
    const pad = this.sim.layout.towerPads.find(value => value.cell.x === Math.floor(point.x / size) && value.cell.y === Math.floor(point.y / size));
    if (!pad && Math.hypot(point.x - this.sim.mara.x, point.y - (this.sim.mara.y - 18)) < 23) {
      this.hooks.selectMara?.(); return;
    }
    this.setSelected(pad?.id); this.hooks.select(pad?.id);
  }
  private refreshLabels(): void {
    for (const pad of this.sim.layout.towerPads) {
      const label = this.padLabels.get(pad.id), mark = this.padMarks.get(pad.id);
      if (!label || !mark) continue;
      const tower = this.sim.towers.find(value => value.padId === pad.id), point = cellCenter(this.sim.layout, pad.cell);
      mark.clear();
      if (!tower) {
        const available = pad.availability === 'initial';
        mark.fillStyle(0x243d29, available ? 0.20 : 0.08).fillEllipse(point.x, point.y + 3, 30, 16);
        mark.lineStyle(1.2, colors.gold, available ? 0.65 : 0.2).strokeEllipse(point.x, point.y + 3, 30, 16);
      }
      const content = tower ? `Lv. ${tower.level}` : pad.availability === 'initial' ? '+' : '';
      if (label.text !== content) label.setText(content);
      label.setPosition(point.x, tower ? point.y + 22 : point.y - 1);
      label.setColor(tower && this.sim.isMaraBoosted(tower.uid) ? '#ffe3a0' : pad.availability === 'initial' ? colors.text : colors.muted);
    }
  }
  private drawSelection(): void {
    const g = this.selection; g.clear();
    const pad = this.selectedPad(); if (!pad) return;
    const point = cellCenter(this.sim.layout, pad.cell);
    if (pad.availability === 'initial') {
      const tower = this.sim.towers.find(value => value.padId === pad.id), range = tower ? stats(tower).range : BASE.tower.range;
      g.fillStyle(colors.gold, 0.055).fillCircle(point.x, point.y, range);
      g.lineStyle(1.5, colors.gold, 0.45).strokeCircle(point.x, point.y, range);
    }
    g.lineStyle(2, 0xf2daa0, 0.95).strokeEllipse(point.x, point.y + 7, 35, 18);
  }
  private selectedPad(): TowerPad | undefined { return this.sim.layout.towerPads.find(pad => pad.id === this.selectedPadId); }
  private towerView(tower: Tower): TowerView {
    let view = this.towerViews.get(tower.uid);
    if (!view) {
      view = {
        base: this.add.image(tower.x, tower.y + 13, KEYS.tower, 0).setOrigin(0.5, 0.8).setScale(SCALE.tower).setDepth(tower.y + 1000),
        weapon: this.add.image(tower.x, tower.y - 23, KEYS.weapon, 0).setScale(SCALE.tower).setDepth(tower.y + 1001),
      };
      this.towerViews.set(tower.uid, view);
    }
    return view;
  }
  private enemyView(enemy: Enemy): EnemyView {
    let view = this.enemyViews.get(enemy.uid);
    if (!view) {
      view = { sprite: this.add.image(enemy.x, enemy.y, enemy.def.id === 'Leafbug' ? KEYS.leafbug : KEYS.firebug).setScale(SCALE.enemy),
        shadow: this.add.ellipse(enemy.x, enemy.y + 9, 23, 9, 0x263e30, 0.24) };
      this.enemyViews.set(enemy.uid, view);
    }
    return view;
  }
  private drawActors(): void {
    const sim = this.sim, elapsed = sim.elapsed;
    // Read the complete confirmed model. Rollback can replace its identity and
    // move time backwards; UID maps are reconciled rather than replaying events.
    this.forest?.update(elapsed);
    this.effects.clear();
    const towers = new Set(sim.towers.map(tower => tower.uid));
    for (const [uid, view] of this.towerViews) if (!towers.has(uid)) { view.base.destroy(); view.weapon.destroy(); this.towerViews.delete(uid); }
    for (const tower of sim.towers) {
      const view = this.towerView(tower), stat = stats(tower);
      const boosted = sim.isMaraBoosted(tower.uid), firingCooldown = stat.cooldown / (boosted ? 1.5 : 1);
      const firingAge = firingCooldown - tower.cooldown;
      const frame = tower.cooldown > 0 && firingAge < firingCooldown * 0.85 ? Math.min(5, Math.floor(firingAge / (firingCooldown * 0.85) * 6)) : 0;
      view.base.setFrame(tower.visualStage - 1);
      view.weapon.setFrame(Math.max(0, frame)).setRotation(tower.angle);
      view.base.setTint(boosted ? 0xffedbe : 0xffffff); view.weapon.setTint(boosted ? 0xffedbe : 0xffffff);
      if (boosted) {
        const alpha = 0.45 + Math.sin(elapsed * 7) * 0.15;
        this.effects.lineStyle(2, 0xf5d58b, alpha).strokeEllipse(tower.x, tower.y + 12, 40, 19);
        this.effects.lineStyle(1.5, 0xffe3a5, alpha * 0.7).lineBetween(sim.mara.x, sim.mara.y - 15, tower.x, tower.y - 15);
      }
    }
    const enemies = new Set(sim.enemies.map(enemy => enemy.uid));
    for (const [uid, view] of this.enemyViews) if (!enemies.has(uid)) { view.sprite.destroy(); view.shadow.destroy(); this.enemyViews.delete(uid); }
    for (const enemy of sim.enemies) {
      const view = this.enemyView(enemy);
      view.sprite.setPosition(enemy.x, enemy.y).setFrame(enemyFrame(enemy.def.id, enemy.direction, elapsed)).setFlipX(enemy.flip).setDepth(enemy.y + 1000);
      view.shadow.setPosition(enemy.x, enemy.y + 9).setDepth(enemy.y + 999);
      if (enemy.hp < enemy.maxHp) {
        const barY = enemy.y - 25, fraction = Math.max(0, enemy.hp / enemy.maxHp);
        this.effects.fillStyle(0x263f33, 0.9).fillRect(enemy.x - 15, barY, 30, 5);
        this.effects.fillStyle(fraction < 0.3 ? 0xdf9573 : 0xdde69c).fillRect(enemy.x - 14, barY + 1, 28 * fraction, 3);
      }
    }
    const shots = new Set(sim.shots.map(shot => shot.uid));
    for (const [uid, view] of this.shotViews) if (!shots.has(uid)) { view.destroy(); this.shotViews.delete(uid); }
    for (const shot of sim.shots) {
      let view = this.shotViews.get(shot.uid);
      if (!view) { view = this.add.image(shot.x, shot.y, KEYS.projectile, 0).setScale(SCALE.projectile).setDepth(5501); this.shotViews.set(shot.uid, view); }
      view.setPosition(shot.x, shot.y).setFrame(loopFrame(elapsed, 3));
      const target = sim.enemies.find(enemy => enemy.uid === shot.target);
      if (target) view.setRotation(Math.atan2(target.y - shot.y, target.x - shot.x) + Math.PI / 2);
    }
    const mara = sim.mara, acting = mara.effectRemaining > 0 && sim.isMaraBoosted(mara.targetTowerUid);
    this.mara.setPosition(mara.x, mara.y).setFrame(maraFrame(mara.direction, mara.path.length > 0, acting, elapsed)).setDepth(mara.y + 1002);
    this.maraShadow.setPosition(mara.x, mara.y + 1).setDepth(mara.y + 999);
    this.maraName.setPosition(mara.x, mara.y + 13).setText(acting ? 'Mara · Übertakten' : mara.unreachable ? 'Mara · kein Zugang' : 'Mara');
    this.drawSelection();
  }
}
