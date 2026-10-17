import Phaser from 'phaser';
import { BASE, IdleBattle, stats } from './battle';
import { cellCenter, type GridRect, type TowerPad } from './layout';

export interface BattleSceneHooks {
  readonly changed: () => void;
  readonly select: (padId?: string) => void;
  readonly ready: () => void;
}

const colors = {
  ground: 0x365c3e, alternate: 0x385f40, path: 0xc8aa79, pathEdge: 0x9b835c,
  gold: 0xd9bd79, plot: 0xa997b9, mara: 0xc9877d, core: 0x9fcfc5,
  text: '#eae5ce', muted: '#91a58e', panel: '#183424',
};

/** B02's neutral battle view, using the unchanged B01 geometry.
 * State and rewards belong to IdleBattle; drawing and selecting never transact.
 * Original forest art and Mara's active support belong to B05.
 */
export class BattleScene extends Phaser.Scene {
  public paused = false;
  private terrain!: Phaser.GameObjects.Graphics;
  private actors!: Phaser.GameObjects.Graphics;
  private selection!: Phaser.GameObjects.Graphics;
  private readonly padLabels = new Map<string, Phaser.GameObjects.Text>();
  private selectedPadId?: string;
  private readyToDraw = false;
  private hudElapsed = 0;

  constructor(private readonly sim: IdleBattle, private readonly hooks: BattleSceneHooks) {
    super('IdleBattle');
  }

  create(): void {
    const { width, height } = this.sim.layout.startBounds;
    this.cameras.main.setBounds(0, 0, width, height).setScroll(0, 0);
    this.terrain = this.add.graphics().setDepth(0);
    this.selection = this.add.graphics().setDepth(1);
    this.actors = this.add.graphics().setDepth(2);
    this.drawTerrain();
    this.input.on('pointerdown', this.selectAtPointer, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.input.off('pointerdown', this.selectAtPointer, this);
      this.readyToDraw = false;
      this.padLabels.clear();
    });
    this.readyToDraw = true;
    this.refresh();
    this.hooks.ready();
    this.hooks.changed();
  }

  update(_time: number, delta: number): void {
    // A resumed/throttled frame must not fast-forward a long unattended battle.
    // Fixed substeps and the economy remain the simulation's responsibility.
    const seconds = Number.isFinite(delta) ? Math.max(0, Math.min(delta / 1000, 0.08)) : 0;
    if (!this.paused) this.sim.update(seconds);
    if (!this.readyToDraw) return;
    this.drawActors();
    this.hudElapsed += seconds;
    if (this.hudElapsed >= 0.1) {
      this.hudElapsed %= 0.1;
      this.refreshLabels();
      this.hooks.changed();
    }
  }

  setSelected(padId?: string): void {
    this.selectedPadId = this.sim.layout.towerPads.some(pad => pad.id === padId) ? padId : undefined;
    this.refresh();
  }

  /** Call after a user transaction; does not consume simulation events. */
  refresh(): void {
    if (!this.readyToDraw) return;
    this.refreshLabels();
    this.drawSelection();
    this.drawActors();
  }

  private selectAtPointer(pointer: Phaser.Input.Pointer): void {
    if (!pointer.leftButtonDown()) return;
    const point = this.cameras.main.getWorldPoint(pointer.x, pointer.y);
    const size = this.sim.layout.cellSize;
    const x = Math.floor(point.x / size), y = Math.floor(point.y / size);
    const pad = this.sim.layout.towerPads.find(value => value.cell.x === x && value.cell.y === y);
    this.setSelected(pad?.id);
    this.hooks.select(pad?.id);
  }

  private text(x: number, y: number, content: string, color = colors.text, size = 11): Phaser.GameObjects.Text {
    return this.add.text(x, y, content, {
      fontFamily: 'Segoe UI, sans-serif', fontSize: `${size}px`, color,
      align: 'center', padding: { x: 3, y: 2 }, backgroundColor: colors.panel,
    }).setOrigin(0.5).setDepth(3);
  }

  private area(area: GridRect, color: number, alpha: number): void {
    const size = this.sim.layout.cellSize;
    this.terrain.fillStyle(color, alpha).fillRect(area.x * size, area.y * size,
      area.width * size, area.height * size);
  }

  private drawTerrain(): void {
    const layout = this.sim.layout, size = layout.cellSize, g = this.terrain;
    g.fillStyle(colors.ground).fillRect(0, 0, layout.startBounds.width, layout.startBounds.height);
    for (let y = 0; y < layout.startBounds.rows; y++) {
      for (let x = 0; x < layout.startBounds.columns; x++) {
        if ((x + y) % 2 === 0) g.fillStyle(colors.alternate).fillRect(x * size, y * size, size, size);
      }
    }
    for (const position of layout.footpaths) {
      const point = cellCenter(layout, position);
      g.fillStyle(colors.mara, 0.3).fillRect(point.x - 2, point.y - 2, 4, 4);
    }
    for (const position of layout.road.cells) {
      g.fillStyle(colors.path).fillRect(position.x * size, position.y * size, size, size);
      g.lineStyle(1, colors.pathEdge, 0.35).strokeRect(position.x * size, position.y * size, size, size);
    }
    for (const plot of layout.plots) {
      this.area(plot.blockingBody, colors.plot, 0.25);
      this.area(plot.courtyard, colors.plot, 0.1);
      g.lineStyle(1, colors.plot, 0.55).strokeRect(plot.footprint.x * size + 2,
        plot.footprint.y * size + 2, plot.footprint.width * size - 4, plot.footprint.height * size - 4);
      const entrance = cellCenter(layout, plot.entrance);
      g.fillStyle(colors.mara, 0.6).fillCircle(entrance.x, entrance.y, 3);
      this.text((plot.footprint.x + plot.footprint.width / 2) * size,
        (plot.footprint.y + 0.5) * size, plot.id === 'workshop' ? 'WERKSTATT' : 'LAGER', colors.muted, 10);
    }
    for (const [index, pad] of layout.towerPads.entries()) {
      if (pad.cell.x >= layout.startBounds.columns) continue;
      const point = cellCenter(layout, pad.cell), active = pad.availability === 'initial';
      g.fillStyle(active ? 0x203d2b : 0x2b4232).fillRoundedRect(point.x - 15, point.y - 15, 30, 30, 3);
      g.lineStyle(1.5, colors.gold, active ? 0.85 : 0.25)
        .strokeRoundedRect(point.x - 15, point.y - 15, 30, 30, 3);
      this.padLabels.set(pad.id, this.text(point.x, point.y,
        active ? '+' : String(index + 1).padStart(2, '0'), active ? colors.text : colors.muted));
    }
    const core = cellCenter(layout, layout.core);
    g.fillStyle(0x264f46).fillRoundedRect(core.x - 17, core.y - 17, 34, 34, 5);
    g.lineStyle(2, colors.core, 0.8).strokeRoundedRect(core.x - 17, core.y - 17, 34, 34, 5);
    g.fillStyle(colors.core).fillTriangle(core.x, core.y - 15, core.x + 10, core.y, core.x, core.y + 15);
    g.fillStyle(0x709b96).fillTriangle(core.x, core.y - 15, core.x - 10, core.y, core.x, core.y + 15);
    this.text(core.x - 8, core.y - 32, 'KERN');
    const mara = cellCenter(layout, layout.maraStart);
    g.fillStyle(colors.mara, 0.7).fillCircle(mara.x, mara.y, 9);
    g.lineStyle(1, 0xe8b7a0, 0.65).strokeCircle(mara.x, mara.y, 13);
    this.text(mara.x, mara.y + 26, 'MARA', colors.muted);
    const entrance = cellCenter(layout, layout.road.cells[0]);
    this.text(entrance.x + 43, entrance.y - 34, 'ANMARSCH →', colors.text);
    g.lineStyle(2, colors.gold, 0.35).lineBetween(layout.startBounds.width - 1, 0,
      layout.startBounds.width - 1, layout.startBounds.height);
  }

  private refreshLabels(): void {
    for (const pad of this.sim.layout.towerPads) {
      const label = this.padLabels.get(pad.id);
      if (!label) continue;
      const tower = this.sim.towers.find(value => value.padId === pad.id);
      const point = cellCenter(this.sim.layout, pad.cell);
      const content = tower ? `${tower.protected ? 'START · ' : ''}Lv. ${tower.level}`
        : pad.availability === 'initial' ? '+' : label.text;
      if (label.text !== content) label.setText(content);
      label.setPosition(point.x, tower ? point.y - 29 : point.y);
      const color = pad.availability === 'initial' ? colors.text : colors.muted;
      if (label.style.color !== color) label.setColor(color);
    }
  }

  private drawSelection(): void {
    const g = this.selection;
    g.clear();
    const pad = this.selectedPad();
    if (!pad) return;
    const point = cellCenter(this.sim.layout, pad.cell);
    if (pad.availability === 'initial') {
      const tower = this.sim.towers.find(value => value.padId === pad.id);
      const range = tower ? stats(tower).range : BASE.tower.range;
      g.fillStyle(colors.gold, 0.055).fillCircle(point.x, point.y, range);
      g.lineStyle(1.5, colors.gold, 0.5).strokeCircle(point.x, point.y, range);
    }
    g.lineStyle(3, 0xf2daa0, 0.95).strokeRoundedRect(point.x - 17, point.y - 17, 34, 34, 4);
  }

  private selectedPad(): TowerPad | undefined {
    return this.sim.layout.towerPads.find(pad => pad.id === this.selectedPadId);
  }

  private drawActors(): void {
    const g = this.actors;
    g.clear();
    for (const tower of this.sim.towers) {
      const { x, y } = tower;
      g.fillStyle(0x162b22).fillEllipse(x, y + 12, 31, 10);
      g.fillStyle(0x8b7957).fillRect(x - 11, y - 4, 22, 19);
      g.lineStyle(2, 0x342f24).strokeRect(x - 11, y - 4, 22, 19);
      g.fillStyle(0x4d7250).fillRect(x - 13, y - 12, 26, 15);
      g.lineStyle(2, tower.def.color).strokeRect(x - 13, y - 12, 26, 15);
      g.lineStyle(4, 0x27372b).lineBetween(x, y - 3,
        x + Math.cos(tower.angle) * 16, y - 3 + Math.sin(tower.angle) * 16);
      g.fillStyle(tower.def.color).fillCircle(x, y - 3, 4);
      if (tower.protected) {
        g.fillStyle(colors.gold).fillTriangle(x - 16, y + 4, x - 8, y + 4, x - 12, y + 12);
        g.fillStyle(colors.gold).fillRect(x - 16, y + 1, 8, 4);
      }
    }
    for (const enemy of this.sim.enemies) {
      const { x, y } = enemy;
      const firebug = enemy.def.id === 'Firebug';
      g.fillStyle(0x142c23, 0.45).fillEllipse(x, y + 7, 22, 8);
      g.lineStyle(2, 0x223e2a);
      g.lineBetween(x - 7, y - 3, x - 12, y - 6);
      g.lineBetween(x + 7, y - 3, x + 12, y - 6);
      g.lineBetween(x - 7, y + 3, x - 12, y + 6);
      g.lineBetween(x + 7, y + 3, x + 12, y + 6);
      g.fillStyle(firebug ? 0xb96942 : 0x79a85d).fillCircle(x, y, 8);
      g.lineStyle(2, firebug ? 0x653b31 : 0x36563e).strokeCircle(x, y, 8);
      const facingX = enemy.direction === 'side' ? (enemy.flip ? -6 : 6) : 0;
      const facingY = enemy.direction === 'up' ? -6 : enemy.direction === 'down' ? 6 : 0;
      g.fillStyle(0x26392b).fillCircle(x + facingX, y + facingY, 4);
      const fraction = Math.max(0, Math.min(1, enemy.hp / enemy.maxHp));
      g.fillStyle(0x172a23).fillRect(x - 13, y - 19, 26, 5);
      g.fillStyle(fraction < 0.3 ? 0xc97962 : 0xa2c86b).fillRect(x - 12, y - 18, 24 * fraction, 3);
    }
    for (const shot of this.sim.shots) {
      g.fillStyle(0x283c2b).fillCircle(shot.x, shot.y, 4);
      g.fillStyle(0xf2d687).fillCircle(shot.x, shot.y, 2.5);
    }
  }
}
