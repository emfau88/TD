import Phaser from 'phaser';
import './style.css';
import {
  cellCenter, createIdleLayout, rectContains, validateLayout,
  type GridCell, type GridRect, type TowerPad,
} from './layout';

const element = <T extends HTMLElement = HTMLElement>(id: string): T => {
  const value = document.getElementById(id);
  if (!value) throw new Error(`Missing layout element: ${id}`);
  return value as T;
};
const lifetime = new AbortController();
const homeButton = element<HTMLButtonElement>('home-view');
const planButton = element<HTMLButtonElement>('plan-view');
const gridToggle = element<HTMLInputElement>('grid-toggle');
const rangesToggle = element<HTMLInputElement>('ranges-toggle');
const status = element('layout-status');
const description = element('selection-description');
const controls = [homeButton, planButton, gridToggle, rangesToggle];
controls.forEach(control => { control.disabled = true; });

function showError(message: string): void {
  const target = element('app-error');
  target.hidden = false;
  target.textContent = `Die Kartenprobe konnte nicht geladen werden: ${message}`;
  status.textContent = 'Start fehlgeschlagen.';
}
window.addEventListener('error', event => showError(event.message), { signal: lifetime.signal });

const layout = createIdleLayout();
const issues = validateLayout(layout);
if (issues.length) {
  showError(issues.join(' '));
  throw new Error(issues.join(' '));
}

const colors = {
  ground: 0x365c3e, alternate: 0x385f40, grid: 0x77916b,
  path: 0xc8aa79, pathEdge: 0x9b835c, gold: 0xd9bd79,
  plot: 0xa997b9, mara: 0xc9877d, core: 0x9fcfc5,
  locked: 0x203d2e, text: '#eae5ce', muted: '#b9c8ab',
};
const availabilityText = (pad: TowerPad): string => ({
  initial: 'im Einstieg verfügbar', 'wave-5': 'später nach Welle 5',
  'wave-10': 'später nach Welle 10', 'east-clearing': 'in der späteren Lichtung',
})[pad.availability];

class LayoutScene extends Phaser.Scene {
  private drawing!: Phaser.GameObjects.Graphics;
  private labels: Phaser.GameObjects.Text[] = [];
  private planning = false;
  private ready = false;
  private selected?: TowerPad;

  constructor() { super('IdleLayout'); }

  create(): void {
    this.drawing = this.add.graphics();
    this.cameras.main.setBounds(0, 0, layout.startBounds.width, layout.startBounds.height);
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (!pointer.leftButtonDown()) return;
      const point = this.cameras.main.getWorldPoint(pointer.x, pointer.y);
      this.inspect({ x: Math.floor(point.x / layout.cellSize), y: Math.floor(point.y / layout.cellSize) });
    });
    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      if (!this.planning || !pointer.middleButtonDown()) return;
      const camera = this.cameras.main;
      camera.setScroll(camera.scrollX - (pointer.x - pointer.prevPosition.x), 0);
    });
    this.ready = true;
    controls.forEach(control => { control.disabled = false; });
    this.setView(false);
    element('game').dataset.ready = 'true';
  }

  setView(planning: boolean): void {
    if (!this.ready) return;
    this.planning = planning;
    const camera = this.cameras.main;
    camera.setBounds(0, 0, planning ? layout.maxBounds.width : layout.startBounds.width, layout.startBounds.height);
    camera.setScroll(planning ? layout.maxBounds.width - layout.startBounds.width : 0, 0);
    homeButton.setAttribute('aria-pressed', String(!planning));
    planButton.setAttribute('aria-pressed', String(planning));
    status.textContent = planning
      ? 'Planungsansicht: gesperrte Ostfläche, zwei vorgesehene Plätze. Mittlere Maustaste zum Verschieben.'
      : 'Startansicht: alle Einstiegsorte im Blick. 4 Plätze verfügbar, davon einer für den Startturm.';
    this.drawLayout();
  }

  refresh(): void { if (this.ready) this.drawLayout(); }

  private label(x: number, y: number, text: string, color = colors.text, size = 12): void {
    this.labels.push(this.add.text(x, y, text, {
      fontFamily: 'Segoe UI, sans-serif', fontSize: `${size}px`, color,
      align: 'center', padding: { x: 3, y: 2 }, backgroundColor: '#183424',
    }).setOrigin(0.5, 0.5));
  }

  private area(area: GridRect, color: number, alpha: number): void {
    const size = layout.cellSize;
    this.drawing.fillStyle(color, alpha).fillRect(area.x * size, area.y * size, area.width * size, area.height * size);
  }

  private drawLayout(): void {
    this.labels.forEach(label => label.destroy());
    this.labels = [];
    const g = this.drawing, size = layout.cellSize;
    g.clear();
    g.fillStyle(colors.ground).fillRect(0, 0, layout.maxBounds.width, layout.maxBounds.height);
    for (let y = 0; y < layout.maxBounds.rows; y++) {
      for (let x = 0; x < layout.maxBounds.columns; x++) {
        if ((x + y) % 2 === 0) g.fillStyle(colors.alternate).fillRect(x * size, y * size, size, size);
      }
    }
    this.area(layout.eastRegion, colors.locked, 0.94);
    for (const point of layout.footpaths) {
      const center = cellCenter(layout, point);
      g.fillStyle(colors.mara, 0.5).fillRect(center.x - 2, center.y - 2, 4, 4);
    }
    for (const point of layout.road.cells) {
      g.fillStyle(colors.path).fillRect(point.x * size, point.y * size, size, size);
      g.lineStyle(1, colors.pathEdge, 0.35).strokeRect(point.x * size, point.y * size, size, size);
    }
    if (gridToggle.checked) {
      g.lineStyle(1, colors.grid, 0.15);
      for (let x = 0; x <= layout.maxBounds.width; x += size) g.lineBetween(x, 0, x, layout.maxBounds.height);
      for (let y = 0; y <= layout.maxBounds.height; y += size) g.lineBetween(0, y, layout.maxBounds.width, y);
    }
    for (const plot of layout.plots) {
      this.area(plot.blockingBody, colors.plot, 0.38);
      this.area(plot.courtyard, colors.plot, 0.12);
      g.lineStyle(2, colors.plot, 0.8).strokeRect(plot.footprint.x * size + 2, plot.footprint.y * size + 2,
        plot.footprint.width * size - 4, plot.footprint.height * size - 4);
      const entrance = cellCenter(layout, plot.entrance);
      g.fillStyle(colors.mara).fillCircle(entrance.x, entrance.y, 4);
      this.label((plot.footprint.x + plot.footprint.width / 2) * size,
        (plot.footprint.y + 0.5) * size, plot.id === 'workshop' ? 'WERKSTATT' : 'LAGER · SPÄTER', colors.text, 11);
    }
    for (const [index, pad] of layout.towerPads.entries()) {
      const point = cellCenter(layout, pad.cell);
      const active = pad.availability === 'initial';
      if (rangesToggle.checked && (active || this.planning && pad.availability === 'east-clearing')) {
        const range = pad.availability === 'east-clearing' ? 126 : 132;
        g.fillStyle(colors.gold, 0.025).fillCircle(point.x, point.y, range);
        g.lineStyle(1, colors.gold, 0.3).strokeCircle(point.x, point.y, range);
      }
      g.fillStyle(active ? 0x203d2b : 0x2b4232).fillRoundedRect(point.x - 15, point.y - 15, 30, 30, 3);
      g.lineStyle(this.selected?.id === pad.id ? 3 : 1.5, colors.gold, active ? 0.95 : 0.4)
        .strokeRoundedRect(point.x - 15, point.y - 15, 30, 30, 3);
      if (pad.isStarter) {
        g.fillStyle(colors.gold).fillRect(point.x - 8, point.y - 10, 16, 18);
        g.fillStyle(0x283d2d).fillRect(point.x - 4, point.y - 6, 8, 6);
        this.label(point.x, point.y + 30, 'STARTTURM', colors.text, 11);
      } else {
        this.label(point.x, point.y, String(index + 1).padStart(2, '0'), active ? colors.text : colors.muted, 11);
      }
    }
    const core = cellCenter(layout, layout.core);
    g.fillStyle(colors.core).fillTriangle(core.x, core.y - 17, core.x + 11, core.y, core.x, core.y + 17);
    g.fillStyle(0x709b96).fillTriangle(core.x, core.y - 17, core.x - 11, core.y, core.x, core.y + 17);
    this.label(core.x - 12, core.y - 35, 'KERN');
    const mara = cellCenter(layout, layout.maraStart);
    g.fillStyle(colors.mara).fillCircle(mara.x, mara.y, 9);
    g.lineStyle(2, 0xe8b7a0).strokeCircle(mara.x, mara.y, 13);
    this.label(mara.x, mara.y + 26, 'MARA', colors.text, 11);
    const enemy = cellCenter(layout, layout.previewEnemy);
    g.fillStyle(0x8a513c).fillCircle(enemy.x, enemy.y, 7);
    this.label(enemy.x + 20, enemy.y - 36, 'ANMARSCH', colors.text, 11);
    g.lineStyle(2, colors.gold, 0.55).lineBetween(layout.startBounds.width - 1, 0,
      layout.startBounds.width - 1, layout.startBounds.height);
    this.label(layout.startBounds.width + 146, 38, 'ÖSTLICHE LICHTUNG', colors.muted, 14);
    this.label(layout.startBounds.width + 146, 66, 'Planungsfläche · noch gesperrt', colors.muted, 11);
  }

  private inspect(cell: GridCell): void {
    const pad = layout.towerPads.find(value => value.cell.x === cell.x && value.cell.y === cell.y);
    this.selected = pad;
    if (pad) {
      description.textContent = `${pad.isStarter ? 'Geschützter Startturm' : 'Turmplatz ' + pad.id.replace('tower-', '')}: ${availabilityText(pad)}. Nachbarfelder bleiben für Maras Zugang frei.`;
    } else {
      const plot = layout.plots.find(value => rectContains(value.footprint, cell));
      if (plot) {
        description.textContent = `${plot.id === 'workshop' ? 'Werkstatt' : 'Späteres Lager'}: reservierte Fläche ${plot.footprint.width} × ${plot.footprint.height} Zellen. Hintere Reihe für das Gebäude, vordere Reihe als begehbarer Vorplatz.`;
      } else if (cell.x >= layout.startBounds.columns) {
        description.textContent = 'Gesperrte Planungsfläche. Die spätere Erweiterung öffnet zwei Plätze am vorhandenen Weg; hier wird noch keine Freischaltung ausgeführt.';
      } else if (cell.x === layout.core.x && cell.y === layout.core.y) {
        description.textContent = 'Spire-Kern: Der Gegnerweg endet genau an diesem Feld. Die spätere Erweiterung verschiebt ihn nicht.';
      } else {
        description.textContent = 'Freier Boden beziehungsweise Zugang. Die Punkte markieren reservierte Laufwege zwischen Mara, Turmplätzen und Grundstücken.';
      }
    }
    this.drawLayout();
  }
}

const scene = new LayoutScene();
const game = new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'game',
  width: layout.startBounds.width,
  height: layout.startBounds.height,
  backgroundColor: '#183424',
  pixelArt: true,
  roundPixels: true,
  render: { antialias: false },
  audio: { noAudio: true },
  scene: [scene],
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
});
homeButton.addEventListener('click', () => scene.setView(false), { signal: lifetime.signal });
planButton.addEventListener('click', () => scene.setView(true), { signal: lifetime.signal });
gridToggle.addEventListener('change', () => scene.refresh(), { signal: lifetime.signal });
rangesToggle.addEventListener('change', () => scene.refresh(), { signal: lifetime.signal });
if (import.meta.hot) import.meta.hot.dispose(() => {
  lifetime.abort();
  game.destroy(true);
});
