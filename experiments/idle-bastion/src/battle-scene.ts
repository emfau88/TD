import { MARA } from './mara';
import { CombatEffects } from './combat-effects';
import { weaponFrame } from './tower-atlas';
import { succubusFrame } from '../../../reference/src/succubus-art';
import { BOSS } from './boss';
import { BossCharmView, charmAge } from './boss-visuals';
import { wispPose } from './wisp';
import Phaser from 'phaser';
import { BASE, IdleBattle, stats, towerDefinition, visualStage, type BattleEvent, type TowerId, type Enemy, type Tower } from './battle';
import { cellCenter, SETTLEMENT_ZONE, type GridCell, type TowerPad } from './layout';
import { KEYS, MARA_FOOT, SCALE, enemyFrame, enemyFlip, loopFrame, maraFrame, towerArt, preloadArt, prepareArt } from './art';
import { createForest, type ForestView } from './forest';

export interface BattleSceneHooks {
  readonly changed: () => void;
  readonly select: (padId?: string) => void;
  readonly ready: () => void;
  readonly advance?: (seconds: number) => void;
  readonly canRender?: () => boolean;
  readonly selectWisp?: () => void;
  readonly selectMara?: () => void;
  readonly selectWorkshop?: () => void;
  readonly selectWarehouse?: () => void;
  readonly selectClearing?: () => void;
  readonly ground?: (cell: GridCell) => void;
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
  private bossCharmView!: BossCharmView;
  private mara!: Phaser.GameObjects.Image;
  private maraShadow!: Phaser.GameObjects.Ellipse;
  private wisp!: Phaser.GameObjects.Image;
  private wispName!: Phaser.GameObjects.Text;
  private combatEffects!: CombatEffects;
  private buildKind?: TowerId;
  private groundMode?: 'mara' | 'workshop' | 'warehouse';
  private groundCell?: GridCell;
  private ghostBase!: Phaser.GameObjects.Image;
  private ghostWeapon!: Phaser.GameObjects.Image;
  private buffText!: Phaser.GameObjects.Text;
  private maraName!: Phaser.GameObjects.Text;
  private readonly towerViews = new Map<number, TowerView>();
  private readonly enemyViews = new Map<number, EnemyView>();
  private readonly shotViews = new Map<number, Phaser.GameObjects.Image>();
  private readonly padLabels = new Map<string, Phaser.GameObjects.Text>();
  private readonly padMarks = new Map<string, Phaser.GameObjects.Graphics>();
  private selectedPadId?: string;
  private readyToDraw = false;
  private pendingTap?: { x: number; y: number };
  private hudElapsed = 0;
  private dragOrigin?: { x: number; y: number; dragging: boolean };
  private relativeZoom = 1;
  private baseZoom = 1;
  private overview = false;
  private portraitCamera = false;
  private cameraFitted = false;
  private renderedLayout?: IdleBattle['layout'];
  private readonly preventMiddleScroll = (event: MouseEvent) => { if (event.button === 1) event.preventDefault(); };
  private readonly preventWheel = (event: WheelEvent) => { if (!event.ctrlKey) event.preventDefault(); };
  private get sim(): IdleBattle { return this.readBattle(); }
  get mapZoom(): number { return this.relativeZoom; }

  constructor(private readonly readBattle: () => IdleBattle, private readonly hooks: BattleSceneHooks, private readonly pixelDensity = 1) { super('IdleBattle'); }
  preload(): void { preloadArt(this); }
  create(): void {
    prepareArt(this);
    const { width, height } = this.sim.layout.bounds;
    this.cameras.main.setBounds(0, 0, width, height).setScroll(0, 0);
    this.forest = createForest(this, this.sim.layout);
    this.renderedLayout = this.sim.layout;
    this.selection = this.add.graphics().setDepth(6000);
    this.effects = this.add.graphics().setDepth(5500);
    this.bossCharmView = new BossCharmView(this, this.pixelDensity);
    this.combatEffects = new CombatEffects(this);
    this.ghostBase = this.add.image(0, 0, KEYS.tower).setVisible(false).setDepth(5900);
    this.ghostWeapon = this.add.image(0, 0, KEYS.weapon).setVisible(false).setDepth(5901);
    this.buffText = this.add.text(0, 0, '', { fontFamily: 'Segoe UI', fontSize: '12px', fontStyle: 'bold',
      resolution: 2, color: '#fff0b0', stroke: '#302412', strokeThickness: 3 }).setOrigin(0.5).setDepth(5902);
    this.maraShadow = this.add.ellipse(0, 0, 22, 8, 0x18382b, 0.22).setDepth(950);
    this.mara = this.add.image(0, 0, KEYS.mara, 0).setOrigin(MARA_FOOT[0] / 64, MARA_FOOT[1] / 64).setScale(SCALE.mara);
    this.maraName = this.add.text(0, 0, 'Mara', {
      fontFamily: 'Segoe UI, sans-serif', fontSize: '11px', fontStyle: 'bold', resolution: 2, color: '#fff3cf', stroke: '#20392c', strokeThickness: 2,
    }).setOrigin(0.5).setDepth(5001);
    this.wisp = this.add.image(0, 0, KEYS.wisp, 0).setOrigin(0.5, 51 / 64).setScale(0.9);
    this.wispName = this.add.text(0, 0, 'Wisp · +10 % Gold', { fontFamily: 'Segoe UI, sans-serif', fontSize: '11px', fontStyle: 'bold', resolution: 2, color: '#ffe0a0', stroke: '#20392c', strokeThickness: 2 }).setOrigin(0.5).setDepth(5001);
    this.input.on('pointerdown', this.beginPointer, this);
    this.input.on('pointerup', this.endPointer, this);
    this.input.on('pointerupoutside', this.cancelPointer, this);
    this.input.on('pointermove', this.panAtPointer, this);
    this.input.on('wheel', this.zoomAtPointer, this);
    this.scale.on('resize', this.resizeCamera, this);
    this.game.canvas.addEventListener('wheel', this.preventWheel, { passive: false });
    this.game.canvas.addEventListener('mousedown', this.preventMiddleScroll);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.readyToDraw = false;
      this.game.canvas.removeEventListener('wheel', this.preventWheel);
      this.game.canvas.removeEventListener('mousedown', this.preventMiddleScroll);
      this.input.off('pointerdown', this.beginPointer, this);
      this.input.off('pointerup', this.endPointer, this);
      this.input.off('pointerupoutside', this.cancelPointer, this);
      this.input.off('pointermove', this.panAtPointer, this);
      this.input.off('wheel', this.zoomAtPointer, this);
      this.scale.off('resize', this.resizeCamera, this);
      this.bossCharmView.destroy(); this.combatEffects.destroy();
      this.forest?.destroy(); this.forest = undefined;
      this.padLabels.clear(); this.padMarks.clear(); this.towerViews.clear(); this.enemyViews.clear(); this.shotViews.clear();
    });
    this.readyToDraw = true;
    this.resizeCamera();
    this.refresh(); this.hooks.ready(); this.hooks.changed();
  }
  update(_time: number, delta: number): void {
    const rawSeconds = Number.isFinite(delta) ? Math.max(0, delta / 1000) : 0;
    if (!this.paused) {
      if (this.hooks.advance) this.hooks.advance(rawSeconds);
      else this.sim.update(Math.min(rawSeconds, 0.08));
    }
    if (!this.readyToDraw) return;
    if (this.pendingTap && (this.hooks.canRender?.() ?? true)) { const tap = this.pendingTap; this.pendingTap = undefined; this.selectAtPointer(tap); }
    if (this.hooks.canRender?.() ?? true) this.drawActors();
    this.hudElapsed += Math.min(rawSeconds, 0.08);
    if (this.hudElapsed >= 0.1) {
      this.hudElapsed %= 0.1;
      if (this.hooks.canRender?.() ?? true) this.refreshLabels();
      this.hooks.changed();
    }
  }
  acceptEvents(events: readonly BattleEvent[]): void { if (this.readyToDraw) this.combatEffects.accept(events, this.sim.elapsed); }
  setPlacement(kind?: TowerId, ground?: 'mara' | 'workshop' | 'warehouse', cell?: GridCell): void {
    this.buildKind = kind; this.groundMode = ground; this.groundCell = cell;
  }
  setSelected(padId?: string): void {
    this.selectedPadId = this.sim.layout.towerPads.some(pad => pad.id === padId) ? padId : undefined;
    this.refresh();
  }
  refresh(): void {
    if (!this.readyToDraw || this.hooks.canRender?.() === false) return;
    this.syncLayout(); this.refreshLabels(); this.drawSelection(); this.drawActors();
  }
  private syncLayout(): void {
    if (this.renderedLayout === this.sim.layout) return;
    const camera = this.cameras.main, scrollX = camera.scrollX, scrollY = camera.scrollY;
    this.forest?.destroy(); this.forest = createForest(this, this.sim.layout);
    this.renderedLayout = this.sim.layout;
    this.overview = false;
    this.fitCameraBounds();
    camera.setScroll(camera.clampX(scrollX), camera.clampY(scrollY));
  }
  showClearing(): void {
    if (this.sim.clearing.unlocked) this.focusPoint({ x: 1140, y: 320 });
  }
  showDefense(): void { this.focusPoint({ x: this.portraitCamera ? 280 : this.sim.layout.startBounds.width / 2, y: 320 }); }
  resetCamera(): void {
    this.relativeZoom = 1; this.overview = true; this.resizeCamera();
    this.cameras.main.centerOn(this.sim.layout.bounds.width / 2, this.sim.layout.bounds.height / 2);
    this.hooks.changed();
  }
  private resizeCamera(): void {
    const camera = this.cameras.main, { width, height } = this.sim.layout.bounds;
    const portrait = this.scale.width / this.pixelDensity <= 700 && window.innerHeight > window.innerWidth;
    const changedOrientation = portrait !== this.portraitCamera;
    const center = this.cameraFitted ? { x: camera.midPoint.x, y: camera.midPoint.y } : { x: portrait ? 280 : this.sim.layout.startBounds.width / 2, y: height / 2 };
    if (changedOrientation) { this.relativeZoom = 1; this.overview = false; }
    this.portraitCamera = portrait;
    this.baseZoom = portrait && !this.overview ? Math.max(this.scale.height / height, this.scale.width / 640)
      : Math.min(this.scale.width / (this.overview ? width : this.sim.layout.startBounds.width), this.scale.height / height);
    camera.setSize(this.scale.width, this.scale.height).setZoom(this.baseZoom * this.relativeZoom);
    this.fitCameraBounds();
    camera.centerOn(changedOrientation ? portrait ? 280 : this.sim.layout.startBounds.width / 2 : center.x, height / 2);
    this.cameraFitted = true; this.hooks.changed();
  }
  private fitCameraBounds(): void {
    const camera = this.cameras.main, { width, height } = this.sim.layout.bounds;
    // Phaser pins undersized bounds to the top left. Symmetric padding keeps
    // the overview centered while locking any axis that already fits in full.
    const padX = Math.max(0, (camera.displayWidth - width) / 2);
    const padY = Math.max(0, (camera.displayHeight - height) / 2);
    camera.setBounds(-padX, -padY, width + padX * 2, height + padY * 2);
  }
  focusPad(padId: string): void {
    if (!this.portraitCamera && !this.sim.clearing.unlocked) return;
    const pad = this.sim.layout.towerPads.find(pad => pad.id === padId);
    if (pad) this.focusPoint(cellCenter(this.sim.layout, pad.cell));
  }
  focusObject(kind: 'tower' | 'settlement' | 'warehouse' | 'mara' | 'wisp' | 'clearing'): void {
    if (kind !== 'clearing' && (this.portraitCamera || this.sim.clearing.unlocked)) this.focusPoint(this.objectPoint(kind));
  }
  private focusPoint(point: { x: number; y: number }): void {
    if (this.overview) { this.overview = false; this.relativeZoom = 1; this.resizeCamera(); }
    this.cameras.main.centerOn(point.x, this.sim.layout.bounds.height / 2);
  }
  private objectPoint(kind: 'tower' | 'settlement' | 'warehouse' | 'mara' | 'wisp' | 'clearing'): { x: number; y: number } {
    if (kind === 'clearing') return { x: 1080, y: 524 };
    if (kind === 'wisp') return wispPose(this.sim.layout, this.sim.elapsed, this.sim.settlement.warehouseBuilt, this.sim.wispArrival.at);
    if (kind === 'mara') return { x: this.sim.mara.x, y: this.sim.mara.y - 20 };
    if (kind === 'settlement' || kind === 'warehouse') {
      const plot = this.sim.layout.plots.find(plot => plot.id === (kind === 'warehouse' ? 'warehouse' : 'workshop'))!;
      return { x: (plot.footprint.x + plot.footprint.width / 2) * this.sim.layout.cellSize,
        y: (plot.blockingBody.y + plot.blockingBody.height) * this.sim.layout.cellSize - 35 };
    }
    const pad = this.selectedPad();
    return pad ? cellCenter(this.sim.layout, pad.cell) : { x: 560, y: 320 };
  }
  uiAnchor(kind: 'tower' | 'settlement' | 'warehouse' | 'mara' | 'wisp' | 'clearing'): { x: number; y: number } {
    const point = this.objectPoint(kind), camera = this.cameras.main;
    return { x: (point.x - camera.worldView.x) * camera.zoom, y: (point.y - camera.worldView.y) * camera.zoom };
  }
  setMapZoom(value: number, pointerX = this.scale.width / 2, pointerY = this.scale.height / 2): void {
    if (!this.readyToDraw || !Number.isFinite(value)) return;
    if (this.overview) { this.overview = false; this.resizeCamera(); }
    const camera = this.cameras.main, old = camera.zoom;
    this.relativeZoom = Math.round(Phaser.Math.Clamp(value, 1, 1.15) * 100) / 100;
    const zoom = this.baseZoom * this.relativeZoom;
    camera.setZoom(zoom);
    this.fitCameraBounds();
    camera.setScroll(camera.clampX(camera.scrollX + (pointerX - this.scale.width / 2) * (1 / old - 1 / zoom)),
      camera.clampY(camera.scrollY + (pointerY - this.scale.height / 2) * (1 / old - 1 / zoom)));
    if (old !== zoom) this.hooks.changed();
  }
  private beginPointer(pointer: Phaser.Input.Pointer): void {
    if (pointer.leftButtonDown()) this.dragOrigin = { x: pointer.x, y: pointer.y, dragging: false };
  }
  private cancelPointer(): void { this.dragOrigin = undefined; }
  private endPointer(pointer: Phaser.Input.Pointer): void {
    const drag = this.dragOrigin; this.dragOrigin = undefined;
    if (drag && !drag.dragging && pointer.button === 0) this.selectAtPointer(pointer);
  }
  private panAtPointer(pointer: Phaser.Input.Pointer): void {
    if (this.dragOrigin && pointer.leftButtonDown()
      && Math.hypot(pointer.x - this.dragOrigin.x, pointer.y - this.dragOrigin.y) >= 6 * this.pixelDensity) this.dragOrigin.dragging = true;
    if (!pointer.middleButtonDown() && !(pointer.leftButtonDown() && this.dragOrigin?.dragging)) return;
    const camera = this.cameras.main;
    camera.setScroll(camera.clampX(camera.scrollX - (pointer.x - pointer.prevPosition.x) / camera.zoom),
      camera.clampY(camera.scrollY - (pointer.y - pointer.prevPosition.y) / camera.zoom));
  }
  private zoomAtPointer(pointer: Phaser.Input.Pointer, _objects: unknown, _dx: number, dy: number): void {
    if ((pointer.event as WheelEvent).ctrlKey || !dy) return;
    this.setMapZoom(this.mapZoom + (dy < 0 ? 0.05 : -0.05), pointer.x, pointer.y);
  }
  private selectAtPointer(pointer: { x: number; y: number }): void {
    if (this.hooks.canRender?.() === false) { this.pendingTap = { x: pointer.x, y: pointer.y }; return; }
    const point = this.cameras.main.getWorldPoint(pointer.x, pointer.y), size = this.sim.layout.cellSize;
    if (this.groundMode) { this.hooks.ground?.({ x: Math.floor(point.x / size), y: Math.floor(point.y / size) }); return; }
    if (this.bossCharmView.contains(point)) return;
    if (!this.sim.clearing.unlocked && point.x > this.sim.layout.startBounds.width - 120 && point.y >= 505 && point.y <= 545) {
      this.hooks.selectClearing?.(); return;
    }
    const pad = this.sim.layout.towerPads.find(value => value.cell.x === Math.floor(point.x / size) && value.cell.y === Math.floor(point.y / size));
    if (this.buildKind) { this.setSelected(pad?.id); this.hooks.select(pad?.id); return; }
    const wisp = wispPose(this.sim.layout, this.sim.elapsed, this.sim.settlement.warehouseBuilt, this.sim.wispArrival.at);
    if (this.sim.wispUnlocked && Math.hypot(point.x - wisp.x, point.y - (wisp.y - 18)) < 23) { this.hooks.selectWisp?.(); return; }
    const warehouse = this.sim.layout.plots.find(plot => plot.id === 'warehouse')!.footprint;
    if (this.sim.warehouseUnlocked && point.x >= warehouse.x * size && point.x < (warehouse.x + warehouse.width) * size
      && point.y >= (warehouse.y - 0.5) * size && point.y < (warehouse.y + warehouse.height) * size) {
      this.hooks.selectWarehouse?.(); return;
    }
    const workshop = this.sim.layout.plots.find(plot => plot.id === 'workshop')!.footprint;
    if (point.x >= workshop.x * size && point.x < (workshop.x + workshop.width) * size
      && point.y >= (workshop.y - 1.2) * size && point.y < (workshop.y + workshop.height) * size) {
      this.hooks.selectWorkshop?.(); return;
    }
    if (Math.hypot(point.x - this.sim.mara.x, point.y - (this.sim.mara.y - 18)) < 23) {
      this.hooks.selectMara?.(); return;
    }
    const occupied = this.sim.towers.some(t => t.padId === pad?.id);
    this.setSelected(occupied ? pad?.id : undefined); this.hooks.select(occupied ? pad?.id : undefined);
  }
  private refreshLabels(): void {
    const present = new Set(this.sim.towers.map(t => t.padId));
    for (const [id, label] of this.padLabels) if (!present.has(id)) { label.destroy(); this.padLabels.delete(id); }
    for (const tower of this.sim.towers) {
      let label = this.padLabels.get(tower.padId);
      if (!label) { label = this.add.text(0, 0, '', { fontFamily: 'Segoe UI', fontSize: '11px', fontStyle: 'bold', resolution: 2,
        color: colors.text, stroke: '#233e2d', strokeThickness: 2 }).setOrigin(0.5).setDepth(5000); this.padLabels.set(tower.padId, label); }
      label.setPosition(tower.x, tower.y + 22).setText(`Lv. ${tower.level}`);
    }
  }
  private drawSelection(): void {
    const g = this.selection; g.clear(); this.ghostBase.setVisible(false); this.ghostWeapon.setVisible(false);
    const size = this.sim.layout.cellSize;
    if (this.groundMode) {
      if (this.groundMode === 'mara') {
        g.lineStyle(1.5, 0xf2daa0, 0.6).strokeCircle(this.sim.mara.x, this.sim.mara.y, MARA.range);
      } else {
        g.fillStyle(0xffdc8c, 0.10).fillRect(SETTLEMENT_ZONE.x * size, SETTLEMENT_ZONE.y * size, SETTLEMENT_ZONE.width * size, SETTLEMENT_ZONE.height * size);
      }
      if (this.groundCell && this.groundMode !== 'mara') {
        const id = this.groundMode, cell = this.groundCell, width = id === 'workshop' ? 3 : 2;
        const valid = this.sim.canPositionBuilding(id, cell);
        g.lineStyle(2, valid ? 0xe9ce88 : 0xeb7272, 0.9).strokeRect(cell.x * size, cell.y * size, width * size, 2 * size);
        this.ghostBase.setVisible(true).setTexture(id === 'workshop' ? KEYS.workshop : KEYS.warehouse)
          .setPosition((cell.x + width / 2) * size, (cell.y + 1) * size).setScale(1)
          .setOrigin(0.5, id === 'workshop' ? 112/128 : 80/96).setAlpha(0.65).setTint(valid ? 0xffffff : 0xff8888);
      }
      return;
    }
    if (this.buildKind) for (const pad of this.sim.layout.towerPads) {
      if (!this.sim.isPadUnlocked(pad.id) || this.sim.towers.some(t => t.padId === pad.id)) continue;
      g.fillStyle(0xf1d696, 0.12).fillRect(pad.cell.x * size + 2, pad.cell.y * size + 2, size - 4, size - 4);
      g.lineStyle(1, 0xf1d696, 0.4).strokeRect(pad.cell.x * size + 2, pad.cell.y * size + 2, size - 4, size - 4);
    }
    const pad = this.selectedPad(); if (!pad) return;
    const point = cellCenter(this.sim.layout, pad.cell), tower = this.sim.towers.find(t => t.padId === pad.id);
    const range = tower ? stats(tower).range : towerDefinition(this.buildKind ?? 1).range;
    g.fillStyle(colors.gold, 0.055).fillCircle(point.x, point.y, range);
    g.lineStyle(1.5, colors.gold, 0.6).strokeCircle(point.x, point.y, range);
    // Highlight the exact shared attack corridor, not just an abstract circle.
    for (const cell of this.sim.layout.road.cells) {
      const p = cellCenter(this.sim.layout, cell);
      if (Math.hypot(p.x - point.x, p.y - point.y) <= range) g.fillStyle(0xffe0a0, 0.2).fillRect(cell.x * size, cell.y * size, size, size);
    }
    if (!tower && this.buildKind) {
      const art = towerArt(this.buildKind), valid = this.sim.canBuild(pad.id, this.buildKind);
      this.ghostBase.setVisible(true).setTexture(art.base, 0).setPosition(point.x, point.y + 13).setScale(SCALE.tower)
        .setOrigin(0.5, this.buildKind === 2 ? 0.81 : 0.8).setAlpha(0.75).setTint(valid ? 0xffffff : 0xff9999);
      this.ghostWeapon.setVisible(true).setTexture(art.weapons[0], 0).setPosition(point.x, point.y - (this.buildKind === 2 ? 34 : 23))
        .setScale(SCALE.tower).setAlpha(0.75).setTint(valid ? 0xffffff : 0xff9999);
    }
    g.lineStyle(2, 0xf2daa0, 0.95).strokeEllipse(point.x, point.y + 7, 35, 18);
  }
  private selectedPad(): TowerPad | undefined { return this.sim.layout.towerPads.find(pad => pad.id === this.selectedPadId); }
  private towerView(tower: Tower): TowerView {
    let view = this.towerViews.get(tower.uid);
    if (!view) {
      view = {
        base: this.add.image(tower.x, tower.y + 13, towerArt(tower.def.id).base, 0).setOrigin(0.5, 0.8).setScale(SCALE.tower).setDepth(tower.y + 1000),
        weapon: this.add.image(tower.x, tower.y - 23, KEYS.weapon, 0).setScale(SCALE.tower).setDepth(tower.y + 1001),
      };
      this.towerViews.set(tower.uid, view);
    }
    return view;
  }
  private enemyView(enemy: Enemy): EnemyView {
    let view = this.enemyViews.get(enemy.uid);
    if (!view) {
      view = { sprite: this.add.image(enemy.x, enemy.y, enemy.def.id === 'Rosenspiegel' ? KEYS.boss : enemy.def.id === 'Scorpion' ? KEYS.scorpion : enemy.def.id === 'Leafbug' ? KEYS.leafbug : KEYS.firebug).setScale(SCALE.enemy),
        shadow: this.add.ellipse(enemy.x, enemy.y + 9, 23, 9, 0x263e30, 0.24) };
      if (enemy.def.id === 'Rosenspiegel') view.sprite.setOrigin(0.5, 56/64).setScale(1.15);
      this.enemyViews.set(enemy.uid, view);
    }
    return view;
  }
  private drawActors(): void {
    this.syncLayout();
    const sim = this.sim, elapsed = sim.elapsed;
    // Read the complete confirmed model. Rollback can replace its identity and
    // move time backwards; UID maps are reconciled rather than replaying events.
    this.forest?.update(elapsed, sim.settlement.workshopBuilt, sim.settlement.builtAt, sim.settlement.warehouseBuilt, sim.settlement.warehouseBuiltAt, sim.warehouseUnlocked, sim.settlement.workshopUpgraded, sim.settlement.upgradedAt);
    this.effects.clear();
    const towers = new Set(sim.towers.map(tower => tower.uid));
    for (const [uid, view] of this.towerViews) if (!towers.has(uid)) { view.base.destroy(); view.weapon.destroy(); this.towerViews.delete(uid); }
    for (const tower of sim.towers) {
      const view = this.towerView(tower), stat = stats(tower);
      const charmed = sim.isCharmed(tower.uid);
      const boosted = sim.isMaraBoosted(tower.uid), firingCooldown = stat.cooldown / ((boosted ? 1.5 : 1) * (charmed ? BOSS.rateMultiplier : 1));
      const firingAge = elapsed - this.combatEffects.firedAt(tower.uid);
      const art = towerArt(tower.def.id, tower.visualStage);
      const frame = weaponFrame(tower.def.id, tower.visualStage, firingAge, elapsed, firingCooldown);
      const weaponKey = art.weapons[tower.visualStage - 1];
      if (view.weapon.texture.key !== weaponKey) view.weapon.setTexture(weaponKey);
      view.base.setFrame(tower.visualStage - 1).setOrigin(0.5, tower.def.id === 2 ? 0.81 : 0.8);
      const age = charmAge(sim.bossCharm), wobble = charmed ? Math.sin(age * 8) * 0.035 : 0;
      const tremble = charmed ? Math.sin(age * 31) * 0.65 : 0;
      const tint = charmed ? Phaser.Display.Color.GetColor(255, Math.round(192 + Math.sin(age * 5) * 22), Math.round(229 + Math.sin(age * 5) * 10))
        : boosted ? 0xffedbe : 0xffffff;
      view.base.setPosition(tower.x + tremble * 0.6, tower.y + 13).setRotation(wobble * 0.4).setTint(tint);
      view.weapon.setPosition(tower.x + tremble, tower.y - (tower.def.id === 2 ? 34 : 23)).setFrame(Math.max(0, frame)).setRotation((tower.def.id === 2 ? 0 : tower.angle) + wobble).setTint(tint);
      if (boosted) {
        const alpha = 0.45 + Math.sin(elapsed * 7) * 0.15;
        this.effects.lineStyle(2, 0xf5d58b, alpha).strokeEllipse(tower.x, tower.y + 12, 40, 19);
        this.effects.lineStyle(3, 0xffe3a5, 0.95).beginPath().arc(tower.x, tower.y + 3, 24, -Math.PI/2, -Math.PI/2 + Math.PI * 2 * sim.mara.effectRemaining / MARA.duration, false).strokePath();
        const spellAge = MARA.duration - sim.mara.effectRemaining;
        if (spellAge < 0.4) {
          const f = spellAge / 0.4;
          this.effects.fillStyle(0xffe8a7, 1).fillCircle(sim.mara.x + (tower.x - sim.mara.x) * f, sim.mara.y - 15 + (tower.y - sim.mara.y) * f, 5);
        }
      }
    }
    const enemies = new Set(sim.enemies.map(enemy => enemy.uid));
    for (const [uid, view] of this.enemyViews) if (!enemies.has(uid)) { view.sprite.destroy(); view.shadow.destroy(); this.enemyViews.delete(uid); }
    for (const enemy of sim.enemies) {
      const view = this.enemyView(enemy);
      view.sprite.setPosition(enemy.x, enemy.y).setFrame(enemyFrame(enemy.def.id, enemy.direction, elapsed)).setFlipX(enemyFlip(enemy.def.id, enemy.direction, enemy.flip)).setDepth(enemy.y + 1000);
      if (enemy.def.id === 'Rosenspiegel') {
        const casting = sim.bossCharm.phase === 'windup' || sim.bossCharm.phase === 'channel';
        if (casting) view.sprite.setFrame(succubusFrame('dance', 'down', charmAge(sim.bossCharm) * 1000)).setFlipX(false);
        this.effects.lineStyle(2, 0xdb80cd, 0.8).strokeEllipse(enemy.x, enemy.y + 3, 34, 13);
      }
      view.sprite.setTint(enemy.slowRemaining > 0 ? 0x83ddff : 0xffffff);
      if (enemy.slowRemaining > 0) this.effects.lineStyle(1.5, 0x96e8fa, 0.75).strokeEllipse(enemy.x, enemy.y + 7, 26, 10);
      view.shadow.setPosition(enemy.x, enemy.y + 9).setDepth(enemy.y + 999);
      if (enemy.hp < enemy.maxHp || enemy.def.id === 'Rosenspiegel') {
        const barY = enemy.y - (enemy.def.id === 'Rosenspiegel' ? 55 : 25), fraction = Math.max(0, enemy.hp / enemy.maxHp);
        this.effects.fillStyle(0x263f33, 0.9).fillRect(enemy.x - 15, barY, 30, 5);
        this.effects.fillStyle(fraction < 0.3 ? 0xdf9573 : 0xdde69c).fillRect(enemy.x - 14, barY + 1, 28 * fraction, 3);
      }
    }
    const shots = new Set(sim.shots.map(shot => shot.uid));
    for (const [uid, view] of this.shotViews) if (!shots.has(uid)) { view.destroy(); this.shotViews.delete(uid); }
    for (const shot of sim.shots) {
      let view = this.shotViews.get(shot.uid);
      if (!view) { view = this.add.image(shot.x, shot.y, towerArt(shot.kind, visualStage(shot.level)).projectile, 0).setScale(shot.kind >= 3 ? 0.85 : shot.kind === 2 ? 0.5 : SCALE.projectile).setDepth(5501); this.shotViews.set(shot.uid, view); }
      view.setPosition(shot.x, shot.y).setFrame(loopFrame(this.combatEffects.shotAge(shot.uid, elapsed), towerArt(shot.kind, visualStage(shot.level)).shotFrames));
      const target = sim.enemies.find(enemy => enemy.uid === shot.target);
      if (target) view.setRotation(Math.atan2(target.y - shot.y, target.x - shot.x) + Math.PI / 2);
    }
    this.combatEffects.update(elapsed, shots, towers);
    const boostedTower = sim.towers.find(t => sim.isMaraBoosted(t.uid));
    this.buffText.setVisible(!!boostedTower);
    if (boostedTower) this.buffText.setPosition(boostedTower.x, boostedTower.y - 60).setText(`✦ ${Math.ceil(sim.mara.effectRemaining)} s`);
    const wisp = wispPose(sim.layout, elapsed, sim.settlement.warehouseBuilt, sim.wispArrival.at);
    this.wisp.setVisible(sim.wispUnlocked).setPosition(wisp.x, wisp.y).setFrame(wisp.frame).setFlipX(wisp.flip).setDepth(wisp.y + 1002);
    this.wispName.setVisible(sim.wispUnlocked).setPosition(wisp.x, wisp.y + 13);
    const mara = sim.mara, acting = mara.effectRemaining > 0 && sim.isMaraBoosted(mara.effectTowerUid ?? -1);
    this.mara.setPosition(mara.x, mara.y).setFrame(maraFrame(mara.direction, mara.path.length > 0, acting, elapsed)).setDepth(mara.y + 1002);
    this.maraShadow.setPosition(mara.x, mara.y + 1).setDepth(mara.y + 999);
    this.maraName.setPosition(mara.x, mara.y + 13).setText(acting ? 'Mara · Übertakten' : mara.unreachable ? 'Mara · kein Zugang' : 'Mara');
    this.bossCharmView.draw(sim, this.portraitCamera);
    this.drawSelection();
  }
}
