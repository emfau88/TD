import { ILYRA } from './ilyra';
import { IlyraView } from './ilyra-view';
import { ENEMY_SHEETS } from './enemy-art';
import { JELLY_HEAL } from './enemy-roster';
import { enemyHealFrame } from './enemy-art';
import { MARA } from './mara';
import { CombatEffects } from './combat-effects';
import { projectileDepth } from './world-depth';
import { weaponFrame } from './tower-atlas';
import { succubusFrame } from '../../../reference/src/succubus-art';
import { BOSS } from './boss';
import { BossCharmView, charmAge } from './boss-visuals';
import { wispPose } from './wisp';
import Phaser from 'phaser';
import { BASE, IdleBattle, stats, towerDefinition, visualStage, type BattleEvent, type TowerId, type Enemy, type Tower } from './battle';
import { cellCenter, settlementZone, buildingWidth, type BuildingId, type GridCell, type TowerPad } from './layout';
import { KEYS, MARA_FOOT, SCALE, enemyFrame, enemyFlip, loopFrame, maraFrame, towerArt, towerMount, preloadArt, prepareArt } from './art';
import { createForest, type ForestView } from './forest';

export interface BattleSceneHooks {
  readonly changed: () => void;
  readonly select: (padId?: string) => void;
  readonly ready: () => void;
  readonly advance?: (seconds: number) => void;
  readonly canRender?: () => boolean;
  readonly canSelect?: () => boolean;
  readonly selectWisp?: () => void;
  readonly selectMara?: () => void;
  readonly selectIlyra?: () => void;
  readonly selectWorkshop?: () => void;
  readonly selectTavern?: () => void;
  readonly selectWarehouse?: () => void;
  readonly selectClearing?: () => void;
  readonly ground?: (cell: GridCell) => void;
  readonly ilyraGround?: (point: {x:number;y:number}) => void;
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
  private ilyraView!: IlyraView;
  private ilyraMode?: 'move'|'cast';
  private mara!: Phaser.GameObjects.Image;
  private maraShadow!: Phaser.GameObjects.Ellipse;
  private wisp!: Phaser.GameObjects.Image;
  private wispArrivalAt: number | null = null;
  private wispAge = 0;
  private followingWisp = false;
  private get wispPose() {
    const b = this.sim, age = this.wispArrivalAt === b.wispArrival.at ? this.wispAge : Math.max(0, b.elapsed - (b.wispArrival.at ?? b.elapsed));
    return wispPose(b.layout, b.wispArrival.at === null ? b.elapsed : b.wispArrival.at + age, b.settlement.warehouseBuilt, b.wispArrival.at);
  }
  private wispName!: Phaser.GameObjects.Text;
  private combatEffects!: CombatEffects;
  private buildKind?: TowerId;
  private groundMode?: 'mara' | BuildingId;
  private groundCell?: GridCell;
  private ghostBase!: Phaser.GameObjects.Image;
  private ghostWeapon!: Phaser.GameObjects.Image;
  private buffText!: Phaser.GameObjects.Text;
  private maraName!: Phaser.GameObjects.Text;
  private learningMark!: Phaser.GameObjects.Graphics;
  private learningTarget?: 'starter' | 'upgrade' | 'workshop' | 'research' | 'frost' | 'cannon' | 'warehouse';
  private coreLabel!: Phaser.GameObjects.Text;
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
    this.ilyraView = new IlyraView(this);
    this.ghostBase = this.add.image(0, 0, KEYS.tower).setVisible(false).setDepth(5900);
    this.ghostWeapon = this.add.image(0, 0, KEYS.weapon).setVisible(false).setDepth(5901);
    this.buffText = this.add.text(0, 0, '', { fontFamily: 'Segoe UI', fontSize: '12px', fontStyle: 'bold',
      resolution: 2, color: '#fff0b0', stroke: '#302412', strokeThickness: 3 }).setOrigin(0.5).setDepth(5902);
    this.maraShadow = this.add.ellipse(0, 0, 22, 8, 0x18382b, 0.22).setDepth(950);
    this.mara = this.add.image(0, 0, KEYS.mara, 0).setOrigin(MARA_FOOT[0] / 64, MARA_FOOT[1] / 64).setScale(SCALE.mara);
    this.maraName = this.add.text(0, 0, 'Mara', {
      fontFamily: 'Segoe UI, sans-serif', fontSize: '11px', fontStyle: 'bold', resolution: 2, color: '#fff3cf', stroke: '#20392c', strokeThickness: 2,
    }).setOrigin(0.5).setDepth(5001);
    this.learningMark = this.add.graphics().setDepth(4999);
    this.coreLabel = this.add.text(1100, 205, 'Diesen Kern schützen', { fontFamily: 'Segoe UI', fontSize: '12px', resolution: 2, color: '#fff1b2', stroke: '#22382b', strokeThickness: 3 }).setOrigin(1, 0).setDepth(5002);
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
    if (this.wispArrivalAt !== this.sim.wispArrival.at) {
      this.wispArrivalAt = this.sim.wispArrival.at;
      this.wispAge = Math.max(0, this.sim.elapsed - (this.wispArrivalAt ?? this.sim.elapsed));
    }
    // Cosmetic arrival keeps moving during the greeting's learning pause.
    if (!this.paused && this.wispArrivalAt !== null) this.wispAge += Math.min(rawSeconds, 0.08);
    if (this.followingWisp) {
      if (this.wispPose.arriving && !this.sim.wispArrival.met) this.focusPoint(this.wispPose);
      else this.followingWisp = false;
    }
    if (this.hooks.canSelect?.() === false) this.pendingTap = undefined;
    if (this.pendingTap && (this.hooks.canRender?.() ?? true)) { const tap = this.pendingTap; this.pendingTap = undefined; this.selectAtPointer(tap); }
    if (this.hooks.canRender?.() ?? true) this.drawActors();
    this.hudElapsed += Math.min(rawSeconds, 0.08);
    if (this.hudElapsed >= 0.1) {
      this.hudElapsed %= 0.1;
      if (this.hooks.canRender?.() ?? true) this.refreshLabels();
      this.hooks.changed();
    }
  }
  acceptEvents(events: readonly BattleEvent[]): void { if (this.readyToDraw) this.combatEffects.accept(events, this.sim.elapsed + this.sim.introduction.preparationSeconds); }
  setIlyraMode(mode?: 'move'|'cast'): void { this.ilyraMode=mode; }
  setPlacement(kind?: TowerId, ground?: 'mara' | BuildingId, cell?: GridCell): void {
    if (this.buildKind !== kind || this.groundMode !== ground) this.pendingTap = undefined;
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
    this.showBase();
  }
  showBase(): void { this.focusPoint(this.sim.layout.version === 5 ? { x: 1340, y: 400 } : { x: 300, y: 460 }); }
  showDefense(): void { this.focusPoint({ x: this.portraitCamera ? 280 : 560, y: this.portraitCamera ? 220 : 320 }); }
  resetCamera(): void {
    this.relativeZoom = 1; this.overview = true; this.resizeCamera();
    this.cameras.main.centerOn(this.sim.layout.bounds.width / 2, this.sim.layout.bounds.height / 2);
    this.hooks.changed();
  }
  private resizeCamera(): void {
    const camera = this.cameras.main, { width, height } = this.sim.layout.bounds;
    const portrait = this.scale.width / this.pixelDensity <= 700 && window.innerHeight > window.innerWidth;
    const changedOrientation = portrait !== this.portraitCamera;
    const center = this.cameraFitted ? { x: camera.midPoint.x, y: camera.midPoint.y } : undefined;
    if (changedOrientation) { this.relativeZoom = 1; this.overview = false; }
    this.portraitCamera = portrait;
    // Use the visible area between HUD and dock. Keep the existing mobile sprite
    // scale; the smaller camera viewport supplies useful vertical travel instead.
    const canvas = this.game.canvas.getBoundingClientRect();
    const header = document.querySelector('.app-header')?.getBoundingClientRect();
    const dock = document.querySelector('.command-dock')?.getBoundingClientRect();
    const top = portrait ? Math.max(0, (header?.bottom ?? canvas.top) - canvas.top) * this.pixelDensity : 0;
    const bottom = portrait ? Math.max(top + 1, ((dock?.top ?? canvas.bottom) - canvas.top) * this.pixelDensity) : this.scale.height;
    const viewHeight = Math.max(1, Math.min(this.scale.height, bottom) - top);
    camera.setViewport(0, top, this.scale.width, viewHeight);
    this.baseZoom = portrait && !this.overview ? Math.max(this.scale.height / height, this.scale.width / 640)
      : Math.min(this.scale.width / (this.overview ? width : 1120), viewHeight / height);
    camera.setZoom(this.baseZoom * this.relativeZoom);
    this.fitCameraBounds();
    const initialY = portrait && !this.overview ? camera.displayHeight / 2 - 40 : height / 2;
    camera.centerOn(!center || changedOrientation ? portrait ? 280 : 560 : center.x,
      !center || changedOrientation ? initialY : center.y);
    this.cameraFitted = true; this.hooks.changed();
  }
  private fitCameraBounds(): void {
    const camera = this.cameras.main, { width, height } = this.sim.layout.bounds;
    const padX = Math.max(0, (camera.displayWidth - width) / 2);
    // One cell of headroom lets tall north-row towers clear the objective ribbon.
    const padY = Math.max(this.portraitCamera && !this.overview ? 40 : 0, (camera.displayHeight - height) / 2);
    camera.setBounds(-padX, -padY, width + padX * 2, height + padY * 2);
  }
  focusPad(padId: string): void {
    if (!this.portraitCamera && !this.sim.clearing.unlocked && this.sim.layout.version !== 5) return;
    const pad = this.sim.layout.towerPads.find(pad => pad.id === padId);
    if (pad) this.focusPoint(cellCenter(this.sim.layout, pad.cell));
  }
  followWispArrival(): void {
    this.followingWisp = !this.sim.wispArrival.met && this.wispPose.arriving;
    this.focusObject('wisp');
  }
  focusObject(kind: 'tower' | 'settlement' | 'warehouse' | 'tavern' | 'mara' | 'wisp' | 'ilyra' | 'clearing'): void {
    if (kind !== 'clearing' && (this.portraitCamera || this.sim.clearing.unlocked || this.sim.layout.version === 5)) this.focusPoint(this.objectPoint(kind));
  }
  private focusPoint(point: { x: number; y: number }): void {
    if (this.overview) { this.overview = false; this.relativeZoom = 1; this.resizeCamera(); }
    this.cameras.main.centerOn(point.x, this.portraitCamera ? point.y - 20 : this.sim.layout.bounds.height / 2);
  }
  private objectPoint(kind: 'tower' | 'settlement' | 'warehouse' | 'tavern' | 'mara' | 'wisp' | 'ilyra' | 'clearing'): { x: number; y: number } {
    if (kind === 'clearing') return this.sim.layout.version === 5 ? { x: 1340, y: 400 } : { x: 1080, y: 524 };
    if (kind === 'ilyra') return this.sim.ilyra ?? this.objectPoint('tavern');
    if (kind === 'wisp') return this.wispPose;
    if (kind === 'mara') return { x: this.sim.mara.x, y: this.sim.mara.y - 20 };
    if (kind === 'tavern') {
      const cell = this.sim.plots.tavern ?? this.sim.recommendedTavernPlot ?? { x: 6, y: 10 };
      return { x: (cell.x + 1.5) * 40, y: (cell.y + 1) * 40 - 35 };
    }
    if (kind === 'settlement' || kind === 'warehouse') {
      const plot = this.sim.layout.plots.find(plot => plot.id === (kind === 'warehouse' ? 'warehouse' : 'workshop'))!;
      return { x: (plot.footprint.x + plot.footprint.width / 2) * this.sim.layout.cellSize,
        y: (plot.blockingBody.y + plot.blockingBody.height) * this.sim.layout.cellSize - 35 };
    }
    const pad = this.selectedPad();
    return pad ? cellCenter(this.sim.layout, pad.cell) : { x: 560, y: 320 };
  }
  setLearningTarget(target?: 'starter' | 'upgrade' | 'workshop' | 'research' | 'frost' | 'cannon' | 'warehouse'): void { this.learningTarget = target; }
  private learningPoint(target: NonNullable<BattleScene['learningTarget']>): {x:number;y:number} | undefined {
    if (target === 'upgrade') { const tower = this.sim.towers.find(t => t.protected); return tower && {x:tower.x,y:tower.y-25}; }
    if (target === 'research') return this.objectPoint('settlement');
    if (target === 'workshop' || target === 'warehouse') return cellCenter(this.sim.layout, this.sim.plots[target]);
    const pad = this.sim.layout.towerPads.find(p => p.id === (target === 'starter' ? 'cell-6-6' : target === 'cannon' ? this.sim.recommendedCannonPad : this.sim.recommendedFrostPad));
    return pad && cellCenter(this.sim.layout,pad.cell);
  }
  learningAnchor(target: NonNullable<BattleScene['learningTarget']>): {x:number;y:number} | undefined {
    const point = this.learningPoint(target); if (!point) return;
    const camera = this.cameras.main, canvas = this.game.canvas.getBoundingClientRect();
    return {x:canvas.left+(camera.x+(point.x-camera.worldView.x)*camera.zoom)*canvas.width/this.scale.width,
      y:canvas.top+(camera.y+(point.y-camera.worldView.y)*camera.zoom)*canvas.height/this.scale.height};
  }
  private drawLearningMark(): void {
    this.learningMark.clear();
    if (!this.learningTarget) return;
    const point = this.learningPoint(this.learningTarget); if (!point) return;
    const pulse = .75 + Math.sin(this.time.now / 300) * .15;
    this.learningMark.fillStyle(0xffd778,.10).fillCircle(point.x,point.y,21);
    this.learningMark.lineStyle(2,0xffdf8a,pulse).strokeCircle(point.x,point.y,21);
  }
  uiAnchor(kind: 'tower' | 'settlement' | 'warehouse' | 'tavern' | 'mara' | 'wisp' | 'ilyra' | 'clearing'): { x: number; y: number } {
    const point = this.objectPoint(kind), camera = this.cameras.main;
    return { x: camera.x + (point.x - camera.worldView.x) * camera.zoom, y: camera.y + (point.y - camera.worldView.y) * camera.zoom };
  }
  setMapZoom(value: number, pointerX = this.scale.width / 2, pointerY = this.scale.height / 2): void {
    if (!this.readyToDraw || !Number.isFinite(value)) return;
    if (this.overview) { this.overview = false; this.resizeCamera(); }
    const camera = this.cameras.main, old = camera.zoom;
    this.relativeZoom = Math.round(Phaser.Math.Clamp(value, 1, 1.15) * 100) / 100;
    const zoom = this.baseZoom * this.relativeZoom;
    camera.setZoom(zoom);
    this.fitCameraBounds();
    camera.setScroll(camera.clampX(camera.scrollX + (pointerX - camera.x - camera.width / 2) * (1 / old - 1 / zoom)),
      camera.clampY(camera.scrollY + (pointerY - camera.y - camera.height / 2) * (1 / old - 1 / zoom)));
    if (old !== zoom) this.hooks.changed();
  }
  private beginPointer(pointer: Phaser.Input.Pointer): void {
    this.followingWisp = false;
    if (this.hooks.canSelect?.() === false) { this.dragOrigin = undefined; return; }
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
    // Never replay input from a purchase as a selection of its newly built tower.
    if (this.hooks.canSelect?.() === false) { this.pendingTap = undefined; return; }
    if (this.hooks.canRender?.() === false) { this.pendingTap = { x: pointer.x, y: pointer.y }; return; }
    const point = this.cameras.main.getWorldPoint(pointer.x, pointer.y), size = this.sim.layout.cellSize;
    if (this.ilyraMode) { this.hooks.ilyraGround?.(point); return; }
    if (this.groundMode) { this.hooks.ground?.({ x: Math.floor(point.x / size), y: Math.floor(point.y / size) }); return; }
    if (this.bossCharmView.contains(point)) return;
    const pad = this.sim.layout.towerPads.find(value => value.cell.x === Math.floor(point.x / size) && value.cell.y === Math.floor(point.y / size));
    if (this.buildKind) { this.setSelected(pad?.id); this.hooks.select(pad?.id); return; }
    if (this.ilyraView.contains(point)) { this.hooks.selectIlyra?.(); return; }
    const wisp = this.wispPose;
    if (this.sim.wispUnlocked && Math.hypot(point.x - wisp.x, point.y - (wisp.y - 18)) < 23) { this.hooks.selectWisp?.(); return; }
    for (const plot of [...this.sim.layout.plots].sort((a, b) => b.blockingBody.y - a.blockingBody.y)) {
      const area = plot.footprint;
      if (this.sim.settlement[`${plot.id}Built`] && point.x >= area.x * size && point.x < (area.x + area.width) * size
        && point.y >= (area.y - (plot.id === 'warehouse' ? 0.5 : 1.2)) * size && point.y < (area.y + area.height) * size) {
        if (plot.id === 'tavern') this.hooks.selectTavern?.();
        else if (plot.id === 'warehouse') this.hooks.selectWarehouse?.();
        else this.hooks.selectWorkshop?.();
        return;
      }
    }
    if (Math.hypot(point.x - this.sim.mara.x, point.y - (this.sim.mara.y - 18)) < 23) {
      this.hooks.selectMara?.(); return;
    }
    // A tower's visible body extends above its ground tile. Prefer an occupied
    // ground tile, then the frontmost visible tower, so all three rows are tappable.
    const tower = this.sim.towers.find(t => t.padId === pad?.id)
      ?? [...this.sim.towers].sort((a, b) => b.y - a.y).find(t => {
        const view = this.towerViews.get(t.uid);
        return view?.base.getBounds().contains(point.x, point.y) || view?.weapon.getBounds().contains(point.x, point.y);
      });
    this.setSelected(tower?.padId); this.hooks.select(tower?.padId);
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
    if (this.ilyraMode && this.sim.ilyra) {
      const s=this.sim.ilyra, pointer=this.input.activePointer, point=this.cameras.main.getWorldPoint(pointer.x,pointer.y);
      if(this.ilyraMode==='cast'){
        g.lineStyle(1.5,0x91d5f7,.65).strokeCircle(s.x,s.y,ILYRA.range);
        const valid=this.sim.canCastIlyra(point),color=valid?0xb8eaff:0xe59c8a;
        g.fillStyle(color,.1).fillCircle(point.x,point.y,ILYRA.radius);g.lineStyle(2,color,.85).strokeCircle(point.x,point.y,ILYRA.radius);
      }else{g.lineStyle(1.5,0x91d5f7,.55).strokeCircle(point.x,point.y,ILYRA.range);g.lineStyle(2,0xc5eaff,.9).strokeCircle(point.x,point.y,12);}
      return;
    }
    if (this.groundMode) {
      if (this.groundMode === 'mara') {
        g.lineStyle(1.5, 0xf2daa0, 0.6).strokeCircle(this.sim.mara.x, this.sim.mara.y, MARA.range);
      } else {
        const zone = settlementZone(this.sim.layout, this.groundMode);
        g.fillStyle(0xffdc8c, 0.10).fillRect(zone.x * size, zone.y * size, zone.width * size, zone.height * size);
      }
      if (this.groundCell && this.groundMode !== 'mara') {
        const id = this.groundMode, cell = this.groundCell, width = buildingWidth(id);
        const valid = this.sim.canPositionBuilding(id, cell);
        g.lineStyle(2, valid ? 0xe9ce88 : 0xeb7272, 0.9).strokeRect(cell.x * size, cell.y * size, width * size, 2 * size);
        this.ghostBase.setVisible(true).setTexture(id === 'workshop' && this.sim.settlement.workshopUpgraded ? KEYS.workshopUpgraded : KEYS[id])
          .setPosition((cell.x + width / 2) * size, (cell.y + 1) * size).setScale(1)
          .setOrigin(0.5, id === 'warehouse' ? 80/96 : 112/128).setAlpha(0.65).setTint(valid ? 0xffffff : 0xff8888);
      }
      return;
    }
    if (this.buildKind) for (const pad of this.sim.layout.towerPads) {
      if (!this.sim.isPadUnlocked(pad.id) || this.sim.preparing && !this.sim.isStarterLocation(pad.id) || this.sim.guiding && !this.sim.isLearningFrostLocation(pad.id) || this.sim.towers.some(t => t.padId === pad.id)) continue;
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
      const art = towerArt(this.buildKind), mount = towerMount(this.buildKind), valid = this.sim.canBuild(pad.id, this.buildKind);
      this.ghostBase.setVisible(true).setTexture(art.base, 0).setPosition(point.x, point.y + mount.baseY).setScale(SCALE.tower)
        .setOrigin(0.5, mount.originY).setAlpha(0.75).setTint(valid ? 0xffffff : 0xff9999);
      this.ghostWeapon.setVisible(true).setTexture(art.weapons[0], 0).setPosition(point.x, point.y + mount.weaponY)
        .setScale(SCALE.tower).setAlpha(0.75).setTint(valid ? 0xffffff : 0xff9999);
    }
    g.lineStyle(2, 0xf2daa0, 0.95).strokeEllipse(point.x, point.y + 7, 35, 18);
  }
  private selectedPad(): TowerPad | undefined { return this.sim.layout.towerPads.find(pad => pad.id === this.selectedPadId); }
  private towerView(tower: Tower): TowerView {
    let view = this.towerViews.get(tower.uid);
    if (!view) {
      const art = towerArt(tower.def.id, tower.visualStage), mount = towerMount(tower.def.id);
      view = {
        base: this.add.image(tower.x, tower.y + mount.baseY, art.base, tower.visualStage - 1).setOrigin(0.5, mount.originY).setScale(SCALE.tower).setDepth(tower.y + 1000),
        weapon: this.add.image(tower.x, tower.y + mount.weaponY, art.weapons[tower.visualStage - 1], 0).setScale(SCALE.tower).setDepth(tower.y + 1001),
      };
      this.towerViews.set(tower.uid, view);
    }
    return view;
  }
  private enemyView(enemy: Enemy): EnemyView {
    let view = this.enemyViews.get(enemy.uid);
    if (!view) {
      view = { sprite: this.add.image(enemy.x, enemy.y, ENEMY_SHEETS[enemy.def.id].key).setScale(ENEMY_SHEETS[enemy.def.id].scale),
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
    this.forest?.update(elapsed, sim.settlement.workshopBuilt, sim.settlement.builtAt, sim.settlement.warehouseBuilt, sim.settlement.warehouseBuiltAt, sim.warehouseUnlocked, sim.settlement.workshopUpgraded, sim.settlement.upgradedAt, sim.settlement.tavernBuilt, sim.settlement.tavernBuiltAt, sim.settlement.tavernLevel);
    this.effects.clear();
    const towers = new Set(sim.towers.map(tower => tower.uid));
    for (const [uid, view] of this.towerViews) if (!towers.has(uid)) { view.base.destroy(); view.weapon.destroy(); this.towerViews.delete(uid); }
    for (const tower of sim.towers) {
      const view = this.towerView(tower), stat = stats(tower);
      const charmed = sim.isCharmed(tower.uid);
      const boosted = sim.isMaraBoosted(tower.uid), firingCooldown = stat.cooldown / ((boosted ? 1.5 : 1) * (charmed ? BOSS.rateMultiplier : 1));
      const firingAge = elapsed - this.combatEffects.firedAt(tower.uid);
      const art = towerArt(tower.def.id, tower.visualStage), mount = towerMount(tower.def.id);
      const frame = weaponFrame(tower.def.id, tower.visualStage, firingAge, elapsed, firingCooldown);
      const weaponKey = art.weapons[tower.visualStage - 1];
      if (view.weapon.texture.key !== weaponKey) view.weapon.setTexture(weaponKey);
      view.base.setFrame(tower.visualStage - 1).setOrigin(0.5, mount.originY);
      const age = charmAge(sim.bossCharm), wobble = charmed ? Math.sin(age * 8) * 0.035 : 0;
      const tremble = charmed ? Math.sin(age * 31) * 0.65 : 0;
      const tint = charmed ? Phaser.Display.Color.GetColor(255, Math.round(192 + Math.sin(age * 5) * 22), Math.round(229 + Math.sin(age * 5) * 10))
        : boosted ? 0xffedbe : 0xffffff;
      view.base.setPosition(tower.x + tremble * 0.6, tower.y + mount.baseY).setRotation(wobble * 0.4).setTint(tint);
      view.weapon.setPosition(tower.x + tremble, tower.y + mount.weaponY).setFrame(Math.max(0, frame)).setRotation((tower.def.id === 2 ? 0 : tower.angle) + wobble).setTint(tint);
      if (boosted) {
        const alpha = 0.45 + Math.sin(elapsed * 7) * 0.15;
        // A warm, quiet aura distinguishes support from the boss's pink wobble.
        this.effects.fillStyle(0xffdb79, alpha * 0.15).fillEllipse(tower.x, tower.y - 18, 43, 64);
        this.effects.lineStyle(6, 0xffd46d, alpha * 0.22).strokeEllipse(tower.x, tower.y + 12, 43, 22);
        this.effects.lineStyle(2, 0xf5d58b, alpha).strokeEllipse(tower.x, tower.y + 12, 40, 19);
        const source = { x: sim.mara.x, y: sim.mara.y - 21 }, goal = { x: tower.x, y: tower.y - 32 };
        const length = Math.hypot(goal.x - source.x, goal.y - source.y);
        const point = (t: number) => ({ x: source.x + (goal.x - source.x) * t,
          y: source.y + (goal.y - source.y) * t - Math.sin(Math.PI * t) * Math.min(24, length * 0.28) });
        const link = (width: number, opacity: number) => {
          this.effects.lineStyle(width, 0xffdc83, opacity).beginPath().moveTo(source.x, source.y);
          for (let i = 1; i <= 16; i++) { const p = point(i / 16); this.effects.lineTo(p.x, p.y); }
          this.effects.strokePath();
        };
        link(5, 0.12); link(1.4, 0.7);
        const spark = point(((MARA.duration - sim.mara.effectRemaining) * 0.7) % 1);
        this.effects.fillStyle(0xfff2ba, 0.95).fillRect(spark.x - 2, spark.y - 2, 4, 4);
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
      const lift = enemy.def.flying ? 7 + Math.sin(elapsed * 5 + enemy.uid) * 1.5 : 0;
      view.sprite.setPosition(enemy.x, enemy.y - lift).setFrame(enemyFrame(enemy.def.id, enemy.direction, elapsed, enemy.flip)).setFlipX(enemyFlip(enemy.def.id, enemy.direction, enemy.flip)).setDepth(enemy.y + 1000);
      if (enemy.def.id === 'Rosenspiegel') {
        const casting = sim.bossCharm.phase === 'windup' || sim.bossCharm.phase === 'channel';
        if (casting) view.sprite.setFrame(succubusFrame('dance', 'down', charmAge(sim.bossCharm) * 1000)).setFlipX(false);
        this.effects.lineStyle(2, 0xdb80cd, 0.8).strokeEllipse(enemy.x, enemy.y + 3, 34, 13);
      }
      if (enemy.healRemaining > 0) {
        view.sprite.setFrame(enemyHealFrame(enemy.def.id, enemy.direction, JELLY_HEAL.cast - enemy.healRemaining, enemy.flip));
        const charge = 1 - enemy.healRemaining / JELLY_HEAL.cast;
        this.effects.lineStyle(2, 0x9aefb3, .7).strokeEllipse(enemy.x, enemy.y + 7, 22 + charge * 26, 10 + charge * 10);
      }
      if (enemy.healLockout > JELLY_HEAL.lockout - .6) {
        const age = JELLY_HEAL.lockout - enemy.healLockout, alpha = 1 - age / .6;
        this.effects.lineStyle(2, 0x9aefb3, alpha).strokeEllipse(enemy.x, enemy.y + 6, 24 + age * 35, 10 + age * 14);
        this.effects.fillStyle(0xbbffd2, alpha).fillRect(enemy.x - 1, enemy.y - 30 - age * 20, 3, 9).fillRect(enemy.x - 4, enemy.y - 27 - age * 20, 9, 3);
      }
      view.sprite.setTint(enemy.slowRemaining > 0 ? 0x83ddff : 0xffffff);
      if (enemy.slowRemaining > 0) this.effects.lineStyle(1.5, 0x96e8fa, 0.75).strokeEllipse(enemy.x, enemy.y + 7, 26, 10);
      view.shadow.setPosition(enemy.x, enemy.y + 9).setDepth(enemy.y + 999);
      if (enemy.hp < enemy.maxHp || enemy.def.id === 'Rosenspiegel') {
        const barY = enemy.y - lift - (enemy.def.id === 'Rosenspiegel' ? 55 : 25), fraction = Math.max(0, enemy.hp / enemy.maxHp);
        this.effects.fillStyle(0x263f33, 0.9).fillRect(enemy.x - 15, barY, 30, 5);
        this.effects.fillStyle(fraction < 0.3 ? 0xdf9573 : 0xdde69c).fillRect(enemy.x - 14, barY + 1, 28 * fraction, 3);
      }
    }
    const shots = new Set(sim.shots.map(shot => shot.uid));
    for (const [uid, view] of this.shotViews) if (!shots.has(uid)) { view.destroy(); this.shotViews.delete(uid); }
    for (const shot of sim.shots) {
      let view = this.shotViews.get(shot.uid);
      if (!view) { view = this.add.image(shot.x, shot.y, towerArt(shot.kind, visualStage(shot.level)).projectile, 0).setScale(shot.kind >= 3 ? 0.85 : shot.kind === 2 ? 0.5 : SCALE.projectile); this.shotViews.set(shot.uid, view); }
      view.setPosition(shot.x, shot.y).setFrame(loopFrame(this.combatEffects.shotAge(shot.uid, elapsed), towerArt(shot.kind, visualStage(shot.level)).shotFrames));
      const target = sim.enemies.find(enemy => enemy.uid === shot.target);
      view.setDepth(projectileDepth(shot,sim.towers.find(tower=>tower.uid===shot.towerUid),target));
      if (target) view.setRotation(Math.atan2(target.y - shot.y, target.x - shot.x) + Math.PI / 2);
    }
    this.combatEffects.update(elapsed + sim.introduction.preparationSeconds, shots, towers);
    this.drawLearningMark();
    this.coreLabel.setVisible(sim.preparing);
    const boostedTower = sim.towers.find(t => sim.isMaraBoosted(t.uid));
    this.buffText.setVisible(!!boostedTower);
    if (boostedTower) this.buffText.setPosition(boostedTower.x, boostedTower.y - 60).setText(`✦ ${Math.ceil(sim.mara.effectRemaining)} s`);
    const wisp = this.wispPose;
    this.wisp.setVisible(sim.wispUnlocked).setPosition(wisp.x, wisp.y).setFrame(wisp.frame).setFlipX(wisp.flip).setDepth(wisp.y + 1002);
    this.wispName.setVisible(sim.wispUnlocked).setPosition(wisp.x, wisp.y + 13);
    this.ilyraView.update(sim);
    const mara = sim.mara, acting = mara.effectRemaining > 0 && sim.isMaraBoosted(mara.effectTowerUid ?? -1);
    this.mara.setPosition(mara.x, mara.y).setFrame(maraFrame(mara.direction, mara.path.length > 0, acting, elapsed)).setDepth(mara.y + 1002);
    this.maraShadow.setPosition(mara.x, mara.y + 1).setDepth(mara.y + 999);
    this.maraName.setPosition(mara.x, mara.y + 13).setText(acting ? 'Mara · Übertakten' : mara.unreachable ? 'Mara · kein Zugang' : 'Mara');
    this.bossCharmView.draw(sim, this.portraitCamera);
    this.drawSelection();
  }
}
