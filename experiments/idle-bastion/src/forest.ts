/** Selective reuse of the accepted woodland's original ground/shore montage.
 * All decoration comes from the same pure world used by companion navigation.
 */
import type Phaser from 'phaser';
import { clearWaterBackdrop, waterTileSource } from '../../../reference/src/terrain';
import { KEYS, SCALE, loopFrame } from './art';
import { getForestWorld } from './forest-world';
import { cellCenter, createIdleLayout, type GridCell, type IdleLayout } from './layout';

export interface ForestView { update(elapsed: number, built: boolean, builtAt: number | null, warehouseBuilt: boolean, warehouseBuiltAt: number | null, warehouseUnlocked: boolean, workshopUpgraded?: boolean, upgradedAt?: number | null, tavernBuilt?: boolean, tavernBuiltAt?: number | null): void; destroy(): void }
const cellKey = ({ x, y }: GridCell) => `${x},${y}`;
/** Source quadrants are chosen from occupied N/E/S/W neighbours. */
export function roadSource(position: GridCell, road: ReadonlySet<string>): readonly [number, number] {
  const { x, y } = position;
  const north = road.has(`${x},${y - 1}`), south = road.has(`${x},${y + 1}`);
  const east = road.has(`${x + 1},${y}`), west = road.has(`${x - 1},${y}`);
  return north && east ? [320,192] : north && west ? [448,192]
    : south && east ? [320,64] : south && west ? [448,64] : north || south ? [320,128] : [384,64];
}

export function createForest(scene: Phaser.Scene, layout: IdleLayout): ForestView {
  const world = getForestWorld(layout), size = layout.cellSize;
  const objects: Phaser.GameObjects.GameObject[] = [];
  const textureKeys: string[] = [];
  const track = <T extends Phaser.GameObjects.GameObject>(object: T): T => { objects.push(object); return object; };
  const canvas = (key: string, width: number, height: number) => {
    if (scene.textures.exists(key)) scene.textures.remove(key);
    textureKeys.push(key);
    return scene.textures.createCanvas(key, width, height)!;
  };
  const ground = canvas('idle-forest-ground', layout.bounds.width, layout.bounds.height);
  const context = ground.context, source = scene.textures.get(KEYS.grass).getSourceImage() as HTMLImageElement;
  context.imageSmoothingEnabled = false;
  for (let y = 0; y < layout.bounds.rows; y++) for (let x = 0; x < layout.bounds.columns; x++) {
    context.drawImage(source, 128, 64, 64, 64, x * size, y * size, size, size);
  }
  // Cosmetic one-cell camera margin; these pixels never become buildable land.
  for (let x = 0; x < layout.bounds.columns; x++) for (const y of [-1, layout.bounds.rows]) {
    track(scene.add.image(x * size, y * size, KEYS.grass, 'grass').setOrigin(0).setScale(SCALE.tile).setTint(0xc9d7c7).setDepth(0));
  }
  const road = new Set(layout.road.cells.map(cellKey));
  for (const position of layout.road.cells) {
    const [x, y] = roadSource(position, road);
    context.drawImage(source, x, y, 64, 64, position.x * size, position.y * size, size, size);
  }
  const workshop = layout.plots.find(plot => plot.id === 'workshop')!;
  ground.refresh();
  track(scene.add.image(0, 0, ground.key).setOrigin(0).setDepth(0));

  let pond: Phaser.GameObjects.Image | undefined;
  if (world.water.length) {
    const minX = Math.min(...world.water.map(cell => cell.x)), maxX = Math.max(...world.water.map(cell => cell.x));
    const minY = Math.min(...world.water.map(cell => cell.y)), maxY = Math.max(...world.water.map(cell => cell.y));
    const columns = (maxX - minX + 1) * 2, rows = (maxY - minY + 1) * 2;
    const width = columns * size / 2, height = rows * size / 2;
    const clean = canvas('idle-clean-water', 4480, 448);
    clean.context.drawImage(scene.textures.get(KEYS.water).getSourceImage() as HTMLImageElement, 0, 0);
    const pixels = clean.context.getImageData(0, 0, 4480, 448);
    clearWaterBackdrop(pixels.data, 4480, 448, 448);
    clean.context.putImageData(pixels, 0, 0); clean.refresh();
    const sheet = canvas('idle-pond', width * 10, height);
    sheet.context.imageSmoothingEnabled = false;
    for (let frame = 0; frame < 10; frame++) {
      for (let row = 0; row < rows; row++) for (let col = 0; col < columns; col++) {
        const [sx, sy] = waterTileSource(col, row, columns, rows);
        sheet.context.drawImage(clean.canvas, frame * 448 + sx, sy, 32, 32,
          frame * width + col * size / 2, row * size / 2, size / 2, size / 2);
      }
      sheet.add(frame, 0, frame * width, 0, width, height);
    }
    sheet.refresh();
    pond = track(scene.add.image(minX * size, minY * size, sheet.key, 0).setOrigin(0).setDepth(1));
  }
  const shade = canvas('idle-forest-light', layout.bounds.width, layout.bounds.height);
  const gradient = shade.context.createLinearGradient(0, 0, 0, layout.bounds.height);
  gradient.addColorStop(0, 'rgba(20,56,36,.17)'); gradient.addColorStop(0.45, 'rgba(20,56,36,.025)'); gradient.addColorStop(1, 'rgba(20,56,36,.16)');
  shade.context.fillStyle = gradient; shade.context.fillRect(0, 0, layout.bounds.width, layout.bounds.height); shade.refresh();
  track(scene.add.image(0, 0, shade.key).setOrigin(0).setDepth(2));

  if (layout.bounds.columns > layout.startBounds.columns) {
    track(scene.add.text(1195, 184, 'Östliche Lichtung', { fontFamily: 'Segoe UI, sans-serif', fontSize: '12px',
      fontStyle: 'bold', resolution: 2, color: '#f1dfaf', stroke: '#233e2d', strokeThickness: 3 }).setOrigin(0.5).setDepth(5000));
  } else {
    track(scene.add.text(layout.startBounds.width - 16, 524, 'Lichtung →', { fontFamily: 'Segoe UI, sans-serif', fontSize: '12px',
      fontStyle: 'bold', resolution: 2, color: '#f1dfaf', backgroundColor: '#243d29', padding: { x: 7, y: 5 },
      stroke: '#233e2d', strokeThickness: 2 }).setOrigin(1, 0.5).setDepth(5000));
  }
  // Keep existing tree variants/offsets when removing the old eastern border.
  const originalTrees = getForestWorld(createIdleLayout()).trees;
  const originalTreeIndices = new Map(originalTrees.map((cell, index) => [cellKey(cell), index]));
  world.trees.forEach((cell, order) => {
    const index = originalTreeIndices.get(cellKey(cell)) ?? originalTrees.length + order;
    const point = cellCenter(layout, cell), autumn = (cell.x < 5 && cell.y > 9) || index % 13 === 0;
    track(scene.add.image(point.x + index * 7 % 9 - 4, point.y + 12, KEYS.grass, `${autumn ? 'autumn' : 'tree'}-${index % 4}`)
      .setOrigin(0.5, 1).setScale(SCALE.tree).setDepth(point.y + 1000));
  });
  world.rocks.forEach(cell => {
    const point = cellCenter(layout, cell);
    track(scene.add.image(point.x, point.y + 10, KEYS.grass, 'rock').setOrigin(0.5, 1).setScale(0.65).setDepth(point.y + 1000));
  });
  world.flowers.forEach(cell => {
    const point = cellCenter(layout, cell);
    track(scene.add.image(point.x, point.y, KEYS.grass, 'flowers').setScale(0.65).setDepth(3));
  });
  const workshopX = (workshop.footprint.x + workshop.footprint.width / 2) * size;
  const workshopY = (workshop.blockingBody.y + workshop.blockingBody.height) * size;
  const building = track(scene.add.image(workshopX, workshopY, KEYS.workshop)
    .setOrigin(0.5, 112/128).setDepth(workshopY + 1000));
  const dust = track(scene.add.graphics().setDepth(workshopY + 1002));
  const warehouse = layout.plots.find(plot => plot.id === 'warehouse')!;
  const warehouseX = (warehouse.footprint.x + warehouse.footprint.width / 2) * size;
  const warehouseY = (warehouse.blockingBody.y + warehouse.blockingBody.height) * size;
  const warehouseBuilding = track(scene.add.image(warehouseX, warehouseY, KEYS.warehouse)
    .setOrigin(0.5, 80/96).setDepth(warehouseY + 1000));
  const warehouseDust = track(scene.add.graphics().setDepth(warehouseY + 1002));
  const tavern = layout.plots.find(plot => plot.id === 'tavern');
  const tavernX = tavern ? (tavern.footprint.x + 1.5) * size : 0;
  const tavernY = tavern ? (tavern.blockingBody.y + 1) * size : 0;
  const tavernBuilding = tavern ? track(scene.add.image(tavernX, tavernY, KEYS.tavern)
    .setOrigin(0.5, 112/128).setDepth(tavernY + 1000)) : undefined;
  const tavernDust = tavern ? track(scene.add.graphics().setDepth(tavernY + 1002)) : undefined;
  const buildingLabel = (x: number, y: number, name: string) => track(scene.add.text(x, y + 11, name, {
    fontFamily: 'Segoe UI, sans-serif', fontSize: '11px', fontStyle: 'bold', resolution: 2,
    color: '#fff0cb', stroke: '#27231d', strokeThickness: 3,
  }).setOrigin(0.5).setDepth(5000).setVisible(false));
  const workshopLabel = buildingLabel(workshopX, workshopY, 'Werkstatt I');
  const warehouseLabel = buildingLabel(warehouseX, warehouseY, 'Lager I');
  const tavernLabel = tavern ? buildingLabel(tavernX, tavernY, 'Taverne') : undefined;
  const goal = cellCenter(layout, layout.core);
  track(scene.add.ellipse(goal.x, goal.y + 5, 37, 16, 0xffd79b, 0.13).setDepth(900));
  track(scene.add.image(goal.x, goal.y + 3, KEYS.core, 2).setScale(0.65).setOrigin(0.5, 0.78).setDepth(goal.y + 1000));
  const coreWeapon = track(scene.add.image(goal.x, goal.y - 39, KEYS.coreWeapon, 0).setScale(0.7).setDepth(goal.y + 1001));
  const entrance = cellCenter(layout, layout.road.cells[0]);
  track(scene.add.text(8, entrance.y - 15, '➜', { fontSize: '24px', color: '#35533b' }).setDepth(10));
  let lastVisualTime = scene.time.now, workshopAge = Infinity, warehouseAge = Infinity, tavernAge = Infinity;
  let shownWorkshopBuild: number | null | undefined, shownWarehouseBuild: number | null | undefined, shownTavernBuild: number | null | undefined;
  return {
    update(elapsed, built, builtAt, warehouseBuilt, warehouseBuiltAt, _warehouseUnlocked, workshopUpgraded = false, upgradedAt = null, tavernBuilt = false, tavernBuiltAt = null) {
      const workshopTexture = workshopUpgraded ? KEYS.workshopUpgraded : KEYS.workshop;
      if (building.texture.key !== workshopTexture) building.setTexture(workshopTexture);
      workshopLabel.setText(workshopUpgraded ? 'Werkstatt II' : 'Werkstatt I');
      pond?.setFrame(loopFrame(elapsed, 10)); coreWeapon.setFrame(loopFrame(elapsed, 10));
      building.setVisible(built);
      warehouseBuilding.setVisible(warehouseBuilt);
      tavernBuilding?.setVisible(tavernBuilt);
      // Construction is presentation: learning pauses freeze combat, not the dust.
      const visualDelta = Math.max(0, (scene.time.now - lastVisualTime) / 1000); lastVisualTime = scene.time.now;
      const lastBuild = workshopUpgraded ? upgradedAt : builtAt;
      workshopAge = shownWorkshopBuild === lastBuild ? workshopAge + visualDelta : lastBuild === null ? Infinity : elapsed - lastBuild;
      warehouseAge = shownWarehouseBuild === warehouseBuiltAt ? warehouseAge + visualDelta : warehouseBuiltAt === null ? Infinity : elapsed - warehouseBuiltAt;
      tavernAge = shownTavernBuild === tavernBuiltAt ? tavernAge + visualDelta : tavernBuiltAt === null ? Infinity : elapsed - tavernBuiltAt;
      shownTavernBuild = tavernBuiltAt;
      shownWorkshopBuild = lastBuild; shownWarehouseBuild = warehouseBuiltAt;
      const construct = (g: Phaser.GameObjects.Graphics, image: Phaser.GameObjects.Image, x: number, y: number, width: number, age: number, exists: boolean) => {
        g.clear(); image.setAlpha(1);
        if (!exists || age < 0 || age > 1.6) return;
        const progress = Math.min(1, age / 1.2);
        image.setAlpha(0.25 + progress * 0.75);
        if (age < 0.8) {
          g.lineStyle(3, 0xa47a48, 1 - age / 0.8).strokeRect(x - width / 2, y - 52, width, 58);
          g.lineBetween(x - width / 2, y + 6, x + width / 2, y - 52);
          g.lineBetween(x + width / 2, y + 6, x - width / 2, y - 52);
        }
        for (let i = 0; i < 16; i++) {
          const spread = age * (8 + i % 4 * 5), px = x + (i - 7.5) / 16 * width + (i % 2 ? spread : -spread);
          const py = y + 7 - age * (13 + i % 3 * 9), size = 7 + i % 3 * 3;
          g.fillStyle(i % 2 ? 0xd8c299 : 0xf0dfb5, Math.max(0, 1 - age / 1.6) * 0.8).fillRect(Math.round(px), Math.round(py), size, size);
        }
      };
      construct(warehouseDust, warehouseBuilding, warehouseX, warehouseY, 64,
        warehouseAge, warehouseBuilt);
      if (tavernDust && tavernBuilding) construct(tavernDust, tavernBuilding, tavernX, tavernY, 100, tavernAge, tavernBuilt);
      construct(dust, building, workshopX, workshopY, 95, workshopAge, built);
      // Names appear after construction; no permanent panels or empty-site labels.
      workshopLabel.setVisible(built && workshopAge > 1.6);
      warehouseLabel.setVisible(warehouseBuilt && warehouseAge > 1.6);
      tavernLabel?.setVisible(tavernBuilt && tavernAge > 1.6);
    },
    destroy() { for (const object of objects) object.destroy(); for (const key of textureKeys) scene.textures.remove(key); },
  };
}
