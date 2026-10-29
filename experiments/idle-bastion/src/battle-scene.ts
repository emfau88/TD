import {preloadEvolution,prepareEvolution,evolutionGhost,EvolutionView} from './evolution-view';
import {evolutionSkin} from './tower-evolution';
import { t } from './i18n';
import { ILYRA } from './ilyra';
import type { ControlledHero } from './hero-controls';
import { IlyraView } from './ilyra-view';
import { preloadSpellArt } from './spell-art';
import { HeroMarks } from './hero-marks';
import { MaraSpellView } from './mara-spell-view';
import { ENEMY_SHEETS, enemyShadowOffset } from './enemy-art';
import { JELLY_HEAL } from './enemy-roster';
import { enemyHealFrame } from './enemy-art';
import { MARA } from './mara';
import { CombatEffects } from './combat-effects';
import { projectileDepth } from './world-depth';
import { weaponFrame, towerSheet } from './tower-atlas';
import { succubusFrame } from '../../../reference/src/succubus-art';
import { BOSS } from './boss';
import { BossCharmView, charmAge } from './boss-visuals';
import { wispPose } from './wisp';
import Phaser from 'phaser';
import { BASE, IdleBattle, stats, towerDefinition, visualStage, type BattleEvent, type TowerId, type Enemy, type Tower } from './battle';
import { cellCenter, settlementZone, buildingWidth, centeredBuildingCell, type BuildingId, type GridCell, type TowerPad } from './layout';
import { KEYS, MARA_FOOT, SCALE, enemyFrame, enemyFlip, loopFrame, maraFrame, towerArt, towerMount, preloadArt, prepareArt } from './art';
import { createForest, type ForestView } from './forest';
import { tutorialDefenseFrame, tutorialDefenseZoom } from './tutorial-camera';
import type { IntroStep } from './mara-intro';

export interface BattleSceneHooks {
  readonly changed: () => void;
  readonly select: (padId?: string) => void;
  readonly ready: () => void;
  readonly loadProgress?: (completed: number, total: number) => void;
  readonly preparing?: () => void;
  readonly loadError?: () => void;
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
  readonly heroGround?: (cell: GridCell) => void;
  readonly canControlHero?: () => boolean;
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
  private heroMarks!: HeroMarks;
  private maraSpell!: MaraSpellView;
  private ilyraMode?: 'move'|'cast';
  private selectedHero?: ControlledHero;
  private heroSuggestion?: { x: number; y: number };
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
  private evolution!: EvolutionView;
  private towerTestFrame = false;
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
  private coreHealthLabel!: Phaser.GameObjects.Text;
  private readonly towerViews = new Map<number, TowerView>();
  private readonly enemyViews = new Map<number, EnemyView>();
  private readonly shotViews = new Map<number, Phaser.GameObjects.Image>();
  private readonly padLabels = new Map<string, Phaser.GameObjects.Text>();
  private readonly padMarks = new Map<string, Phaser.GameObjects.Graphics>();
  private selectedPadId?: string;
  private readyToDraw = false;
  private requiredTextures: string[] = [];
  private loadingFailed = false;
  private pendingTap?: { x: number; y: number; secondary: boolean };
  private hudElapsed = 0;
  private dragOrigin?: { x: number; y: number; dragging: boolean; button: number };
  private relativeZoom = 1;
  private baseZoom = 1;
  private overview = false;
  private portraitCamera = false;
  private cameraFitted = false;
  private mapViewport?: { x: number; y: number; width: number; height: number };
  private guidedDefenseFrame = false;
  private guidedDefensePad?: string;
  private introStep: IntroStep | null = null;
  private introMaraTransition = false;
  private introRect?: DOMRect;
  private introFrameKey = '';
  private renderedLayout?: IdleBattle['layout'];
  private readonly preventMiddleScroll = (event: MouseEvent) => { if (event.button === 1) event.preventDefault(); };
  private readonly preventWheel = (event: WheelEvent) => { if (!event.ctrlKey) event.preventDefault(); };
  private readonly preventHeroContextMenu = (event: MouseEvent) => {
    if (this.selectedHero && !this.buildKind && !this.groundMode && !this.ilyraMode
      && this.hooks.canSelect?.() !== false && this.hooks.canControlHero?.() !== false) event.preventDefault();
  };
  private get sim(): IdleBattle { return this.readBattle(); }
  get mapZoom(): number { return this.relativeZoom; }

  constructor(private readonly readBattle: () => IdleBattle, private readonly hooks: BattleSceneHooks, private readonly pixelDensity = 1) { super('IdleBattle'); }
  preload(): void {
    let completed = 0;
    this.load.on(Phaser.Loader.Events.FILE_COMPLETE, () => { this.hooks.loadProgress?.(++completed, this.requiredTextures.length); });
    this.load.on(Phaser.Loader.Events.FILE_LOAD_ERROR, () => this.failLoading());
    preloadArt(this);
    preloadEvolution(this);
    preloadSpellArt(this);
    this.requiredTextures = [...this.load.list].map(file => file.key);
    this.hooks.loadProgress?.(0, this.requiredTextures.length);
  }
  private failLoading(): void {
    this.paused = true; this.readyToDraw = false;
    if (!this.loadingFailed) { this.loadingFailed = true; this.hooks.loadError?.(); }
  }
  refreshLanguage(): void {
    this.coreLabel?.setText(t('Diesen Kern schützen'));
    this.wispName?.setText(t('Wisp · +10 % Gold'));
  }

  create(): void {
    // COMPLETE may follow a failed download or a 200 response with invalid pixels.
    if (this.loadingFailed || this.requiredTextures.some(key => !this.textures.exists(key))) { this.failLoading(); return; }
    this.hooks.preparing?.();
    prepareArt(this);
    prepareEvolution(this);
    const { width, height } = this.sim.layout.bounds;
    this.cameras.main.setBounds(0, 0, width, height).setScroll(0, 0);
    this.forest = createForest(this, this.sim.layout);
    this.renderedLayout = this.sim.layout;
    this.selection = this.add.graphics().setDepth(6000);
    this.effects = this.add.graphics().setDepth(5500);
    this.bossCharmView = new BossCharmView(this, this.pixelDensity);
    this.combatEffects = new CombatEffects(this);
    this.evolution = new EvolutionView(this);
    this.ilyraView = new IlyraView(this);
    this.heroMarks = new HeroMarks(this);
    this.maraSpell = new MaraSpellView(this);
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
    this.coreLabel = this.add.text(1100, 205, t('Diesen Kern schützen'), { fontFamily: 'Segoe UI', fontSize: '12px', resolution: 2, color: '#fff1b2', stroke: '#22382b', strokeThickness: 3 }).setOrigin(1, 0).setDepth(5002);
    this.coreHealthLabel = this.add.text(0, 0, '', { fontFamily: 'Segoe UI, sans-serif', fontSize: '14px', fontStyle: 'bold',
      resolution: 2, color: '#f2e7cc', backgroundColor: '#142b27', padding: { x: 6, y: 4 } }).setOrigin(.5, 0).setDepth(5003);
    this.wisp = this.add.image(0, 0, KEYS.wisp, 0).setOrigin(0.5, 51 / 64).setScale(0.9);
    this.wispName = this.add.text(0, 0, t('Wisp · +10 % Gold'), { fontFamily: 'Segoe UI, sans-serif', fontSize: '11px', fontStyle: 'bold', resolution: 2, color: '#ffe0a0', stroke: '#20392c', strokeThickness: 2 }).setOrigin(0.5).setDepth(5001);
    this.input.on('pointerdown', this.beginPointer, this);
    this.input.on('pointerup', this.endPointer, this);
    this.input.on('pointerupoutside', this.cancelPointer, this);
    this.input.on('pointermove', this.panAtPointer, this);
    this.input.on('wheel', this.zoomAtPointer, this);
    this.scale.on('resize', this.resizeCamera, this);
    this.game.canvas.addEventListener('wheel', this.preventWheel, { passive: false });
    this.game.canvas.addEventListener('mousedown', this.preventMiddleScroll);
    this.game.canvas.addEventListener('contextmenu', this.preventHeroContextMenu);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.readyToDraw = false;
      this.game.canvas.removeEventListener('wheel', this.preventWheel);
      this.game.canvas.removeEventListener('mousedown', this.preventMiddleScroll);
      this.game.canvas.removeEventListener('contextmenu', this.preventHeroContextMenu);
      this.input.off('pointerdown', this.beginPointer, this);
      this.input.off('pointerup', this.endPointer, this);
      this.input.off('pointerupoutside', this.cancelPointer, this);
      this.input.off('pointermove', this.panAtPointer, this);
      this.input.off('wheel', this.zoomAtPointer, this);
      this.scale.off('resize', this.resizeCamera, this);
      this.bossCharmView.destroy(); this.combatEffects.destroy(); this.evolution.destroy();
      this.heroMarks.destroy(); this.maraSpell.destroy(); this.ilyraView.destroy();
      this.forest?.destroy(); this.forest = undefined;
      this.padLabels.clear(); this.padMarks.clear(); this.towerViews.clear(); this.enemyViews.clear(); this.shotViews.clear();
    });
    this.readyToDraw = true;
    this.resizeCamera();
    this.refresh(); this.hooks.ready(); this.hooks.changed();
  }
  update(_time: number, delta: number): void {
    if (!this.readyToDraw) return;
    const rawSeconds = Number.isFinite(delta) ? Math.max(0, delta / 1000) : 0;
    if (!this.paused) {
      if (this.hooks.advance) this.hooks.advance(rawSeconds);
      else this.sim.update(Math.min(rawSeconds, 0.08));
    }
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
    if (this.pendingTap && (this.hooks.canRender?.() ?? true)) { const tap = this.pendingTap; this.pendingTap = undefined; this.selectAtPointer(tap, tap.secondary); }
    if (this.hooks.canRender?.() ?? true) this.drawActors();
    this.hudElapsed += Math.min(rawSeconds, 0.08);
    if (this.hudElapsed >= 0.1) {
      this.hudElapsed %= 0.1;
      if (this.hooks.canRender?.() ?? true) this.refreshLabels();
      this.hooks.changed();
    }
  }
  acceptEvents(events: readonly BattleEvent[]): void { if (this.readyToDraw) { const time=this.sim.elapsed+this.sim.introduction.preparationSeconds; this.combatEffects.accept(events,time); this.evolution.accept(events,time); } }
  invalidatePointer(): void { this.pendingTap = undefined; this.dragOrigin = undefined; }
  setIlyraMode(mode?: 'move'|'cast'): void { if (this.ilyraMode !== mode) this.invalidatePointer(); this.ilyraMode=mode; }
  setHeroSelection(hero?: ControlledHero, suggestion?: { x: number; y: number }): void {
    if (this.selectedHero !== hero) this.invalidatePointer();
    this.selectedHero = hero; this.heroSuggestion = suggestion;
  }
  showHeroPosition(point: { x: number; y: number }): void { this.invalidatePointer(); this.focusPoint(point); }
  worldAnchor(point: { x: number; y: number }): { x: number; y: number } {
    const camera = this.cameras.main, canvas = this.game.canvas.getBoundingClientRect();
    return { x: canvas.left + (camera.x + (point.x - camera.worldView.x) * camera.zoom) * canvas.width / this.scale.width,
      y: canvas.top + (camera.y + (point.y - camera.worldView.y) * camera.zoom) * canvas.height / this.scale.height };
  }
  setPlacement(kind?: TowerId, ground?: 'mara' | BuildingId, cell?: GridCell): void {
    if (this.buildKind !== kind || this.groundMode !== ground) this.invalidatePointer();
    this.buildKind = kind; this.groundMode = ground; this.groundCell = cell;
  }
  setSelected(padId?: string): void {
    this.selectedPadId = this.sim.layout.towerPads.some(pad => pad.id === padId) ? padId : undefined;
    this.refresh();
  }
  refresh(): void {
    if (!this.readyToDraw || this.hooks.canRender?.() === false) return;
    // Keep the entrance visible after the lesson. Deliberate focus, overview or
    // zoom actions restore the normal camera; completing a step must not jump it.
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
  showDefense(): void {
    if (this.sim.preparing || this.sim.guiding) this.focusGuidedDefense();
    else this.focusPoint({ x: this.portraitCamera ? 280 : 560, y: this.portraitCamera ? 220 : 320 });
  }
  private defenseFrame(padId?: string) {
    const pad = this.sim.layout.towerPads.find(pad => pad.id === (padId ?? this.sim.recommendedStarterPad));
    const starter = this.sim.towers.find(tower => tower.protected) ?? (pad && cellCenter(this.sim.layout, pad.cell));
    if (!starter) return undefined;
    const frostPad = this.sim.layout.towerPads.find(pad => pad.id === this.sim.recommendedFrostPad);
    const frost = this.sim.towers.find(tower => tower.def.id === 2) ?? (frostPad && cellCenter(this.sim.layout, frostPad.cell));
    return tutorialDefenseFrame(cellCenter(this.sim.layout, this.sim.layout.road.waypoints[0]!), starter, frost);
  }
  focusGuidedDefense(padId?: string): void {
    if (!this.readyToDraw || !this.sim.preparing && !this.sim.guiding) return;
    const frame = this.defenseFrame(padId); if (!frame) return;
    this.guidedDefenseFrame = true; this.guidedDefensePad = padId; this.overview = false; this.relativeZoom = 1;
    this.resizeCamera();
    this.cameras.main.centerOn(frame.x, this.portraitCamera ? frame.y : this.sim.layout.bounds.height / 2);
  }
  frameTowerTest(): void {
    this.towerTestFrame = true; this.overview = false; this.relativeZoom = 1; this.resizeCamera();
  }
  resetCamera(): void {
    this.towerTestFrame = false;
    this.guidedDefenseFrame = false;
    this.relativeZoom = 1; this.overview = true; this.resizeCamera();
    this.cameras.main.centerOn(this.sim.layout.bounds.width / 2, this.sim.layout.bounds.height / 2);
    this.hooks.changed();
  }
  private resizeCamera(): void {
    this.invalidatePointer();
    if (this.introStep !== null) { this.frameIntro(false); return; }
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
    this.mapViewport = { x: 0, y: top, width: this.scale.width, height: viewHeight };
    camera.setViewport(0, top, this.scale.width, viewHeight);
    this.baseZoom = portrait && !this.overview ? Math.max(this.scale.height / height, this.scale.width / 640)
      : Math.min(this.scale.width / (this.overview ? width : 1120), viewHeight / height);
    if(this.towerTestFrame) this.baseZoom = Math.min(this.scale.width/520,viewHeight/400);
    const defense = this.guidedDefenseFrame && portrait ? this.defenseFrame(this.guidedDefensePad) : undefined;
    if (defense) this.baseZoom = tutorialDefenseZoom(this.baseZoom, this.scale.width, viewHeight, defense);
    camera.setZoom(this.baseZoom * this.relativeZoom);
    this.fitCameraBounds();
    const initialY = portrait && !this.overview ? camera.displayHeight / 2 - 40 : height / 2;
    camera.centerOn(!center || changedOrientation ? defense?.x ?? (portrait ? 280 : 560) : center.x,
      !center || changedOrientation ? defense?.y ?? initialY : center.y);
    if(this.towerTestFrame)camera.centerOn(440,210);
    this.cameraFitted = true; this.hooks.changed();
  }
  private fitCameraBounds(): void {
    const camera = this.cameras.main, { width, height } = this.sim.layout.bounds;
    const view = this.mapViewport ?? { x: 0, y: 0, width: this.scale.width, height: this.scale.height };
    // Keep the rendered viewport inside the actual map even when zoomed out.
    // Spare screen space belongs to the UI backdrop, never to walkable terrain.
    const shownWidth = Math.min(view.width, Math.floor(width * camera.zoom));
    const shownHeight = Math.min(view.height, Math.floor(height * camera.zoom));
    camera.setViewport(Math.round(view.x + (view.width - shownWidth) / 2),
      Math.round(view.y + (view.height - shownHeight) / 2), shownWidth, shownHeight);
    camera.setBounds(0, 0, width, height);
  }
  focusPad(padId: string): void {
    if ((this.sim.preparing || this.sim.guiding) && (this.sim.isPreferredStarterLocation(padId)
      || this.sim.isLearningFrostLocation(padId) || this.sim.towers.some(tower => tower.padId === padId && (tower.protected || tower.def.id === 2)))) {
      this.focusGuidedDefense(padId); return;
    }
    if (!this.portraitCamera && !this.sim.clearing.unlocked && this.sim.layout.version !== 5) return;
    const pad = this.sim.layout.towerPads.find(pad => pad.id === padId);
    if (pad) this.focusPoint(cellCenter(this.sim.layout, pad.cell));
  }
  followWispArrival(): void {
    this.followingWisp = !this.sim.wispArrival.met && this.wispPose.arriving;
    this.focusObject('wisp');
  }
  focusObject(kind: 'tower' | 'settlement' | 'warehouse' | 'tavern' | 'mara' | 'wisp' | 'ilyra' | 'clearing'): void {
    if (kind === 'tower' && (this.sim.preparing || this.sim.guiding)) { this.focusGuidedDefense(); return; }
    if (kind !== 'clearing' && (this.portraitCamera || this.sim.clearing.unlocked || this.sim.layout.version === 5)) this.focusPoint(this.objectPoint(kind));
  }
  focusMaraIntroduction(): void { this.focusPoint(this.objectPoint('mara'), true); }
  private focusPoint(point: { x: number; y: number }, smooth = false): void {
    this.invalidatePointer();
    if (this.guidedDefenseFrame) { this.guidedDefenseFrame = false; this.resizeCamera(); }
    if (this.overview) { this.overview = false; this.relativeZoom = 1; this.resizeCamera(); }
    const y = this.portraitCamera ? point.y - 20 : this.sim.layout.bounds.height / 2;
    if (smooth && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) this.cameras.main.pan(point.x, y, 450, 'Sine.easeInOut');
    else this.cameras.main.centerOn(point.x, y);
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
    if (target === 'upgrade') { const tower = this.sim.towers.find(t => t.protected); return tower && {x:tower.x,y:tower.y}; }
    if (target === 'research') return this.objectPoint('settlement');
    if (target === 'workshop' || target === 'warehouse') {
      const cell = this.sim.plots[target], size = this.sim.layout.cellSize;
      return { x:(cell.x + buildingWidth(target) / 2) * size, y:(cell.y + 1) * size };
    }
    const pad = this.sim.layout.towerPads.find(p => p.id === (target === 'starter' ? this.sim.recommendedStarterPad : target === 'cannon' ? this.sim.recommendedCannonPad : this.sim.recommendedFrostPad));
    return pad && cellCenter(this.sim.layout,pad.cell);
  }
  learningAnchor(target: NonNullable<BattleScene['learningTarget']>): {x:number;y:number} | undefined {
    const point = this.learningPoint(target); if (!point) return;
    const camera = this.cameras.main, canvas = this.game.canvas.getBoundingClientRect();
    return {x:canvas.left+(camera.x+(point.x-camera.worldView.x)*camera.zoom)*canvas.width/this.scale.width,
      y:canvas.top+(camera.y+(point.y-camera.worldView.y)*camera.zoom)*canvas.height/this.scale.height};
  }
  /** The DOM supplies its measured rectangle; render pixels and CSS pixels are
   * deliberately converted in one place. Resizing cancels, never queues a pan. */
  presentIntro(step: IntroStep | null, rect: DOMRect): void {
    if (!this.readyToDraw) return;
    const previous = this.introStep;
    this.introStep = step; this.introRect = rect;
    if (step !== 1) this.introMaraTransition = false;
    if (step === null) {
      if (previous !== null) {
        this.cameras.main.panEffect.reset(); this.introFrameKey = '';
        this.learningMark.clear(); this.resizeCamera(); this.focusGuidedDefense();
      }
      return;
    }
    const key = [step, rect.left, rect.top, rect.width, rect.height, this.scale.width, this.scale.height,
      window.matchMedia('(prefers-reduced-motion: reduce)').matches].join(':');
    if (key === this.introFrameKey) return;
    this.introFrameKey = key;
    this.frameIntro(previous === 0 && step === 1);
  }
  private frameIntro(animate: boolean): void {
    if (this.introStep === null || !this.introRect) return;
    const camera = this.cameras.main, canvas = this.game.canvas.getBoundingClientRect(), dialog = this.introRect;
    const header = document.querySelector('.app-header')!.getBoundingClientRect();
    const top = Math.max(0, header.bottom - canvas.top + 8) * this.pixelDensity;
    const side = window.innerHeight <= 500 && window.innerWidth > window.innerHeight;
    const width = Math.max(1, side ? (dialog.left - canvas.left - 8) * this.pixelDensity : this.scale.width);
    const height = Math.max(1, (side ? canvas.bottom - 8 : dialog.top - 12) * this.pixelDensity - canvas.top * this.pixelDensity - top);
    // Render behind the card too. Only the target framing uses the unoccluded
    // rectangle, avoiding a hard cut in the world along the dialog's top edge.
    camera.panEffect.reset(); camera.setViewport(0, 0, this.scale.width, this.scale.height);
    const bounds = this.sim.layout.bounds;
    const zoom = Math.max(width / bounds.width, height / bounds.height,
      Math.min(width / (window.innerWidth <= 700 || side ? 520 : 1050), height / 400));
    camera.setZoom(zoom);
    // Only the parts covered by the HUD/dialog may extend beyond the map.
    // Generic tutorial headroom here exposed the green renderer background.
    camera.setBounds(0, -top / zoom, bounds.width + (this.scale.width - width) / zoom,
      bounds.height + (this.scale.height - height) / zoom);
    const core = cellCenter(this.sim.layout, this.sim.layout.core);
    const defense = this.defenseFrame();
    const target = this.introStep === 0 ? { x: core.x, y: core.y - 20 }
      : { x: defense?.x ?? core.x, y: (defense?.y ?? core.y) + 20 };
    target.x += (this.scale.width - width) / (2 * zoom);
    target.y += (this.scale.height / 2 - top - height / 2) / zoom;
    this.introMaraTransition = animate && !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (this.introMaraTransition) camera.pan(target.x, target.y, 1200, 'Sine.easeInOut', true);
    else camera.centerOn(target.x, target.y);
    this.cameraFitted = true;
  }
  introAnchor(): { x: number; y: number } | undefined {
    if (this.introStep === null || this.cameras.main.panEffect.isRunning) return;
    const layout = this.sim.layout;
    if (this.introStep === 0) {
      const core = cellCenter(layout, layout.core);
      return this.worldAnchor({ x: core.x, y: core.y - 66 });
    }
    if (this.introStep === 1) return this.worldAnchor(cellCenter(layout, layout.road.cells[0]));
    const pad = layout.towerPads.find(p => p.id === this.sim.recommendedStarterPad);
    return pad && this.worldAnchor(cellCenter(layout, pad.cell));
  }
  private introMaraPose(): { x: number; y: number; alpha: number } {
    const pan = this.cameras.main.panEffect;
    const transitioning = this.introStep === 1 && this.introMaraTransition && pan.isRunning;
    const atCore = this.introStep === 0 || transitioning && pan.progress < .5;
    const position = atCore ? cellCenter(this.sim.layout, { x: this.sim.layout.core.x - 2, y: this.sim.layout.core.y }) : this.sim.mara;
    // One sprite: fade out, relocate during the pan, then fade in. No save
    // mutation, duplicate figure or accelerated world-spanning walking route.
    const alpha = !transitioning ? 1 : pan.progress < .5 ? Math.max(0, 1 - pan.progress / .2) : Math.max(0, (pan.progress - .8) / .2);
    return { x: position.x, y: position.y, alpha };
  }
  private drawIntroMark(): void {
    const graphics = this.learningMark, layout = this.sim.layout;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const alpha = reduced ? .85 : .75 + Math.sin(this.time.now / 600) * .12;
    if (this.introStep === 0) return;
    const points = layout.road.waypoints.map(cell => cellCenter(layout, cell));
    if (this.introStep === 1) {
      let offset = reduced ? 16 : (this.time.now / 60) % 48;
      for (let i = 1; i < points.length; i++) {
        const a = points[i - 1]!, b = points[i]!, length = Math.hypot(b.x - a.x, b.y - a.y);
        for (; offset < length; offset += 48) graphics.fillStyle(0xffe0a0, .6).fillCircle(a.x + (b.x - a.x) * offset / length, a.y + (b.y - a.y) * offset / length, 3);
        offset -= length;
      }
    } else {
      const pad = layout.towerPads.find(pad => pad.id === this.sim.recommendedStarterPad);
      if (pad) {
        const { x, y } = pad.cell, size = layout.cellSize;
        graphics.fillStyle(0xffd778, .08).fillRect(x * size, y * size, size, size);
        graphics.lineStyle(2, 0xffdf8a, alpha).strokeRect(x * size, y * size, size, size);
      }
    }
  }
  private drawLearningMark(): void {
    this.learningMark.clear();
    if (this.introStep !== null) { this.drawIntroMark(); return; }
    if (!this.learningTarget) return;
    const point = this.learningPoint(this.learningTarget); if (!point) return;
    const pulse = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? .85 : .75 + Math.sin(this.time.now / 300) * .15;
    if (this.learningTarget === 'starter' || this.learningTarget === 'upgrade') {
      const size = this.sim.layout.cellSize;
      this.learningMark.fillStyle(0xffd778,.10).fillRect(point.x-size/2,point.y-size/2,size,size);
      this.learningMark.lineStyle(2,0xffdf8a,pulse).strokeRect(point.x-size/2,point.y-size/2,size,size);
    } else {
      this.learningMark.fillStyle(0xffd778,.10).fillCircle(point.x,point.y,21);
      this.learningMark.lineStyle(2,0xffdf8a,pulse).strokeCircle(point.x,point.y,21);
    }
  }
  uiAnchor(kind: 'tower' | 'settlement' | 'warehouse' | 'tavern' | 'mara' | 'wisp' | 'ilyra' | 'clearing'): { x: number; y: number } {
    const point = this.objectPoint(kind), camera = this.cameras.main;
    return { x: camera.x + (point.x - camera.worldView.x) * camera.zoom, y: camera.y + (point.y - camera.worldView.y) * camera.zoom };
  }
  setMapZoom(value: number, pointerX = this.scale.width / 2, pointerY = this.scale.height / 2): void {
    if (this.introStep !== null) return;
    if (!this.readyToDraw || !Number.isFinite(value)) return;
    this.invalidatePointer();
    if (this.guidedDefenseFrame) { this.guidedDefenseFrame = false; this.resizeCamera(); }
    if (this.overview) { this.overview = false; this.resizeCamera(); }
    const camera = this.cameras.main, old = camera.zoom;
    const oldWidth = camera.width, oldHeight = camera.height;
    this.relativeZoom = Math.round(Phaser.Math.Clamp(value, 1, 1.15) * 100) / 100;
    const zoom = this.baseZoom * this.relativeZoom;
    camera.setZoom(zoom);
    this.fitCameraBounds();
    camera.setScroll(camera.clampX(camera.scrollX + (oldWidth - camera.width) / 2 + (pointerX - camera.x - camera.width / 2) * (1 / old - 1 / zoom)),
      camera.clampY(camera.scrollY + (oldHeight - camera.height) / 2 + (pointerY - camera.y - camera.height / 2) * (1 / old - 1 / zoom)));
    if (old !== zoom) this.hooks.changed();
  }
  private beginPointer(pointer: Phaser.Input.Pointer): void {
    this.followingWisp = false;
    if (this.hooks.canSelect?.() === false) { this.dragOrigin = undefined; return; }
    this.pendingTap = undefined;
    if (pointer.leftButtonDown() || pointer.rightButtonDown()) this.dragOrigin = { x: pointer.x, y: pointer.y, dragging: false, button: pointer.button };
  }
  private cancelPointer(): void { this.dragOrigin = undefined; }
  private endPointer(pointer: Phaser.Input.Pointer): void {
    const drag = this.dragOrigin; this.dragOrigin = undefined;
    if (drag && !drag.dragging && pointer.button === drag.button) this.selectAtPointer(pointer, pointer.button === 2);
  }
  private panAtPointer(pointer: Phaser.Input.Pointer): void {
    if (this.introStep !== null) return;
    if (this.dragOrigin && Math.hypot(pointer.x - this.dragOrigin.x, pointer.y - this.dragOrigin.y) >= 6 * this.pixelDensity) {
      this.dragOrigin.dragging = true; this.pendingTap = undefined;
    }
    if (!pointer.middleButtonDown() && !(pointer.leftButtonDown() && this.dragOrigin?.dragging)) return;
    this.pendingTap = undefined;
    const camera = this.cameras.main;
    camera.setScroll(camera.clampX(camera.scrollX - (pointer.x - pointer.prevPosition.x) / camera.zoom),
      camera.clampY(camera.scrollY - (pointer.y - pointer.prevPosition.y) / camera.zoom));
  }
  private zoomAtPointer(pointer: Phaser.Input.Pointer, _objects: unknown, _dx: number, dy: number): void {
    if ((pointer.event as WheelEvent).ctrlKey || !dy) return;
    this.setMapZoom(this.mapZoom + (dy < 0 ? 0.05 : -0.05), pointer.x, pointer.y);
  }
  private selectAtPointer(pointer: { x: number; y: number }, secondary = false): void {
    // Never replay input from a purchase as a selection of its newly built tower.
    if (this.hooks.canSelect?.() === false) { this.pendingTap = undefined; return; }
    if (secondary && (!this.selectedHero || this.buildKind || this.groundMode || this.ilyraMode || this.hooks.canControlHero?.() === false)) return;
    if (this.hooks.canRender?.() === false) { this.pendingTap = { x: pointer.x, y: pointer.y, secondary }; return; }
    const point = this.cameras.main.getWorldPoint(pointer.x, pointer.y), size = this.sim.layout.cellSize;
    if (this.ilyraMode) { this.hooks.ilyraGround?.(point); return; }
    if (this.groundMode) {
      this.hooks.ground?.(this.groundMode === 'mara' ? { x: Math.floor(point.x / size), y: Math.floor(point.y / size) }
        : centeredBuildingCell(this.groundMode, point, size)); return;
    }
    if (this.bossCharmView.contains(point)) return;
    const pad = this.sim.layout.towerPads.find(value => value.cell.x === Math.floor(point.x / size) && value.cell.y === Math.floor(point.y / size));
    if (this.buildKind) { this.setSelected(pad?.id); this.hooks.select(pad?.id); return; }
    if (this.ilyraView.contains(point)) { if (!secondary) this.hooks.selectIlyra?.(); return; }
    const wisp = this.wispPose;
    if (this.sim.wispUnlocked && Math.hypot(point.x - wisp.x, point.y - (wisp.y - 18)) < 23) { if (!secondary) this.hooks.selectWisp?.(); return; }
    for (const plot of [...this.sim.layout.plots].sort((a, b) => b.blockingBody.y - a.blockingBody.y)) {
      const area = plot.footprint;
      if (this.sim.settlement[`${plot.id}Built`] && point.x >= area.x * size && point.x < (area.x + area.width) * size
        && point.y >= (area.y - (plot.id === 'warehouse' ? 0.5 : 1.2)) * size && point.y < (area.y + area.height) * size) {
        if (secondary) return;
        if (plot.id === 'tavern') this.hooks.selectTavern?.();
        else if (plot.id === 'warehouse') this.hooks.selectWarehouse?.();
        else this.hooks.selectWorkshop?.();
        return;
      }
    }
    if (Math.hypot(point.x - this.sim.mara.x, point.y - (this.sim.mara.y - 18)) < 23) {
      if (!secondary) this.hooks.selectMara?.(); return;
    }
    // A tower's visible body extends above its ground tile. Prefer an occupied
    // ground tile, then the frontmost visible tower, so all three rows are tappable.
    const tower = this.sim.towers.find(t => t.padId === pad?.id)
      ?? [...this.sim.towers].sort((a, b) => b.y - a.y).find(t => {
        const view = this.towerViews.get(t.uid);
        return view?.base.getBounds().contains(point.x, point.y) || view?.weapon.getBounds().contains(point.x, point.y);
      });
    if (tower) { if (!secondary) { this.setSelected(tower.padId); this.hooks.select(tower.padId); } return; }
    if (this.selectedHero && this.hooks.canControlHero?.() !== false) {
      this.hooks.heroGround?.({ x: Math.floor(point.x / size), y: Math.floor(point.y / size) }); return;
    }
    if (!secondary) { this.setSelected(); this.hooks.select(); }
  }
  private refreshLabels(): void {
    const present = new Set(this.sim.towers.map(t => t.padId));
    for (const [id, label] of this.padLabels) if (!present.has(id)) { label.destroy(); this.padLabels.delete(id); }
    for (const tower of this.sim.towers) {
      let label = this.padLabels.get(tower.padId);
      if (!label) { label = this.add.text(0, 0, '', { fontFamily: 'Segoe UI', fontSize: '11px', fontStyle: 'bold', resolution: 2,
        color: colors.text, stroke: '#233e2d', strokeThickness: 2 }).setOrigin(0.5).setDepth(5000); this.padLabels.set(tower.padId, label); }
      label.setPosition(tower.x, tower.y + 22).setText(t("Lv. {0}", tower.level));
    }
  }
  private drawSelection(): void {
    const g = this.selection; g.clear(); this.ghostBase.setVisible(false); this.ghostWeapon.setVisible(false);
    this.heroMarks.update(this.sim, this.selectedHero);
    const size = this.sim.layout.cellSize;
    if (this.selectedHero) {
      const actor = this.selectedHero === 'mara' ? this.sim.mara : this.sim.ilyra;
      if (actor) {
        const color = this.selectedHero === 'mara' ? 0xffdd83 : 0x91d5f7;
        g.lineStyle(1, color, .4).strokeCircle(actor.x, actor.y, this.selectedHero === 'mara' ? MARA.range : ILYRA.range);
        if (this.selectedHero === 'ilyra' && this.heroSuggestion && !actor.path.length && this.sim.ilyra?.introduction !== 'done' && !this.ilyraMode) {
          const p = this.heroSuggestion;
          g.lineStyle(2, 0xffdd83, .9).strokeRect(p.x - size / 2 + 2, p.y - size / 2 + 2, size - 4, size - 4);
          g.lineStyle(1, 0x91d5f7, .3).strokeCircle(p.x, p.y, ILYRA.range);
          for (const cell of this.sim.layout.road.cells) {
            const at = cellCenter(this.sim.layout, cell);
            if (Math.hypot(at.x - p.x, at.y - p.y) <= ILYRA.range) g.fillStyle(0x91d5f7, .15).fillRect(cell.x * size, cell.y * size, size, size);
          }
        }
      }
    }
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
      if (!this.sim.isPadUnlocked(pad.id) || this.sim.preparing && !this.sim.isPreferredStarterLocation(pad.id) || this.sim.guiding && !this.sim.isLearningFrostLocation(pad.id) || this.sim.towers.some(t => t.padId === pad.id)) continue;
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
      const original = towerArt(this.buildKind), compact=evolutionGhost(this.buildKind);
      const art=compact?{base:compact.base,weapons:[compact.weapon]}:original,mount=compact?{baseY:13,originY:compact.originY,weaponY:compact.weaponY}:towerMount(this.buildKind), valid = this.sim.canBuild(pad.id, this.buildKind);
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
        shadow: this.add.ellipse(enemy.x, enemy.y + enemyShadowOffset(enemy.def.id), 23, 9, 0x263e30, 0.24) };
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
    this.forest?.update(elapsed, sim.settlement.workshopBuilt, sim.settlement.builtAt, sim.settlement.warehouseBuilt, sim.settlement.warehouseBuiltAt, sim.warehouseUnlocked, sim.settlement.workshopUpgraded, sim.settlement.upgradedAt, sim.settlement.tavernBuilt, sim.settlement.tavernBuiltAt, sim.settlement.tavernLevel, elapsed + sim.introduction.preparationSeconds);
    this.effects.clear();
    const towers = new Set(sim.towers.map(tower => tower.uid));
    for (const [uid, view] of this.towerViews) if (!towers.has(uid)) { view.base.destroy(); view.weapon.destroy(); this.towerViews.delete(uid); }
    for (const tower of sim.towers) {
      const view = this.towerView(tower), stat = stats(tower);
      const charmed = sim.isCharmed(tower.uid);
      const boosted = sim.isMaraBoosted(tower.uid), firingCooldown = stat.cooldown / ((boosted ? 1.5 : 1) * (charmed ? BOSS.rateMultiplier : 1));
      const age = charmAge(sim.bossCharm), wobble = charmed ? Math.sin(age * 8) * 0.035 : 0;
      const tremble = charmed ? Math.sin(age * 31) * 0.65 : 0;
      const tint = charmed ? Phaser.Display.Color.GetColor(255, Math.round(192 + Math.sin(age * 5) * 22), Math.round(229 + Math.sin(age * 5) * 10))
        : 0xffffff;
      if(evolutionSkin(tower.def.id,tower.level)){
        const visualTime=elapsed+sim.introduction.preparationSeconds;
        const hasTarget=sim.enemies.some(e=>e.hp>0&&Math.hypot(e.x-tower.x,e.y-tower.y)<=stat.range);
        this.evolution.updateTower(tower,view,visualTime-this.combatEffects.firedAt(tower.uid),firingCooldown,tower.cooldown/((boosted?1.5:1)*(charmed?BOSS.rateMultiplier:1)),hasTarget,visualTime,tint,tremble,wobble);
        continue;
      }
      const firingAge = elapsed - this.combatEffects.firedAt(tower.uid);
      const art = towerArt(tower.def.id, tower.visualStage), mount = towerMount(tower.def.id);
      const frame = weaponFrame(tower.def.id, tower.visualStage, firingAge, elapsed, firingCooldown);
      const weaponKey = art.weapons[tower.visualStage - 1];
      if (view.weapon.texture.key !== weaponKey) view.weapon.setTexture(weaponKey);
      view.base.setFrame(tower.visualStage - 1).setOrigin(0.5, mount.originY);
      view.base.setPosition(tower.x + tremble * 0.6, tower.y + mount.baseY).setRotation(wobble * 0.4).setTint(tint);
      view.weapon.setPosition(tower.x + tremble, tower.y + mount.weaponY).setFrame(Math.max(0, frame)).setRotation((tower.def.id === 2 ? 0 : tower.angle) + wobble).setTint(tint);
    }
    this.maraSpell.update(sim, this.towerViews);
    const enemies = new Set(sim.enemies.map(enemy => enemy.uid));
    for (const [uid, view] of this.enemyViews) if (!enemies.has(uid)) { view.sprite.destroy(); view.shadow.destroy(); this.enemyViews.delete(uid); }
    for (const enemy of sim.enemies) {
      const view = this.enemyView(enemy);
      const lift = enemy.def.flying ? 7 + Math.sin(elapsed * 5 + enemy.uid) * 1.5 : 0;
      view.sprite.setPosition(enemy.x, enemy.y - lift).setFrame(enemyFrame(enemy.def.id, enemy.direction, elapsed, enemy.flip, enemy.uid)).setFlipX(enemyFlip(enemy.def.id, enemy.direction, enemy.flip)).setDepth(enemy.y + 1000);
      if (enemy.def.id === 'Rosenspiegel') {
        const casting = sim.bossCharm.phase === 'windup' || sim.bossCharm.phase === 'channel';
        if (casting) view.sprite.setFrame(succubusFrame('dance', 'down', charmAge(sim.bossCharm) * 1000)).setFlipX(false);
        this.effects.lineStyle(2, 0xdb80cd, 0.8).strokeEllipse(enemy.x, enemy.y, 34, 13);
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
      view.shadow.setPosition(enemy.x, enemy.y + enemyShadowOffset(enemy.def.id)).setDepth(enemy.y + 999);
      if (enemy.hp < enemy.maxHp || enemy.def.id === 'Rosenspiegel') {
        const barY = enemy.y - lift - (enemy.def.id === 'Rosenspiegel' ? 55 : 25), fraction = Math.max(0, enemy.hp / enemy.maxHp);
        this.effects.fillStyle(0x263f33, 0.9).fillRect(enemy.x - 15, barY, 30, 5);
        this.effects.fillStyle(fraction < 0.3 ? 0xdf9573 : 0xdde69c).fillRect(enemy.x - 14, barY + 1, 28 * fraction, 3);
      }
    }
    const shots = new Set(sim.shots.map(shot => shot.uid));
    for (const [uid, view] of this.shotViews) if (!shots.has(uid)) { view.destroy(); this.shotViews.delete(uid); }
    this.evolution.sync(sim,elapsed+sim.introduction.preparationSeconds);
    for (const shot of sim.shots) {
      if(evolutionSkin(shot.kind,shot.level))continue;
      let view = this.shotViews.get(shot.uid);
      if (!view) { view = this.add.image(shot.x, shot.y, towerArt(shot.kind, visualStage(shot.level)).projectile, 0).setScale(shot.kind === 5 ? 24 / towerSheet(5,visualStage(shot.level),'Projectile').width : shot.kind >= 3 ? 0.85 : shot.kind === 2 ? 0.5 : SCALE.projectile); this.shotViews.set(shot.uid, view); }
      view.setPosition(shot.x, shot.y).setFrame(loopFrame(this.combatEffects.shotAge(shot.uid, elapsed), towerArt(shot.kind, visualStage(shot.level)).shotFrames));
      const target = sim.enemies.find(enemy => enemy.uid === shot.target);
      view.setDepth(projectileDepth(shot,sim.towers.find(tower=>tower.uid===shot.towerUid),target));
      if (target) view.setRotation(Math.atan2(target.y - shot.y, target.x - shot.x) + Math.PI / 2);
    }
    this.combatEffects.update(elapsed + sim.introduction.preparationSeconds, shots, towers);
    this.drawLearningMark();
    this.coreLabel.setVisible(sim.preparing);
    // On phones health belongs to the core, not to a floating screen badge.
    // Keep its type readable at any map zoom; the world camera clips it naturally.
    const core = cellCenter(sim.layout, sim.layout.core);
    this.coreHealthLabel.setVisible(this.scale.width / this.pixelDensity <= 700)
      .setPosition(core.x, core.y + 48).setScale(this.pixelDensity / this.cameras.main.zoom)
      .setText(`♥ ${sim.lives} / ${BASE.coreLives}`);
    const boostedTower = sim.towers.find(t => sim.isMaraBoosted(t.uid));
    this.buffText.setVisible(!!boostedTower);
    if (boostedTower) this.buffText.setPosition(boostedTower.x, boostedTower.y - 60).setText(t("✦ {0} s", Math.ceil(sim.mara.effectRemaining)));
    const wisp = this.wispPose;
    this.wisp.setVisible(sim.wispUnlocked).setPosition(wisp.x, wisp.y).setFrame(wisp.frame).setFlipX(wisp.flip).setDepth(wisp.y + 1002);
    this.wispName.setVisible(sim.wispUnlocked).setPosition(wisp.x, wisp.y + 13);
    this.ilyraView.update(sim);
    const mara = sim.mara, acting = mara.effectRemaining > 0 && sim.isMaraBoosted(mara.effectTowerUid ?? -1);
    const facing = sim.preparing && sim.maraIntroductionPending ? 'down' : mara.direction;
    const pose = this.introMaraPose();
    this.mara.setPosition(pose.x, pose.y).setAlpha(pose.alpha).setFrame(maraFrame(this.maraSpell.castDirection ?? facing, mara.path.length > 0, !!this.maraSpell.castDirection, elapsed)).setDepth(pose.y + 1002);
    this.maraShadow.setPosition(pose.x, pose.y + 1).setAlpha(pose.alpha).setDepth(pose.y + 999);
    this.maraName.setPosition(pose.x, pose.y + 13).setAlpha(pose.alpha).setText(t(acting ? t('Mara · Übertakten') : mara.unreachable ? t('Mara · kein Zugang') : 'Mara'));
    this.bossCharmView.draw(sim, this.portraitCamera);
    this.drawSelection();
  }
}
