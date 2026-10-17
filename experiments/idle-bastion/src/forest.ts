/** Selective reuse of the accepted woodland's original ground/shore montage.
 * All decoration comes from the same pure world used by companion navigation.
 */
import type Phaser from 'phaser';
import { clearWaterBackdrop, waterTileSource } from '../../../reference/src/terrain';
import { KEYS, SCALE, loopFrame } from './art';
import { getForestWorld } from './forest-world';
import { cellCenter, type GridCell, type IdleLayout } from './layout';

export interface ForestView { update(elapsed: number, built: boolean, builtAt: number | null): void; destroy(): void }
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
  const road = new Set(layout.road.cells.map(cellKey));
  for (const position of layout.road.cells) {
    const [x, y] = roadSource(position, road);
    context.drawImage(source, x, y, 64, 64, position.x * size, position.y * size, size, size);
  }
  // A quiet worn clearing anticipates the workshop without a future building,
  // builder sprite or conspicuous rectangular placeholder.
  const workshop = layout.plots.find(plot => plot.id === 'workshop')!;
  context.globalAlpha = 0.24;
  for (let row = 0; row < workshop.footprint.height; row++) for (let col = 0; col < workshop.footprint.width; col++) {
    context.drawImage(source, 128, 128, 64, 64, (workshop.footprint.x + col) * size,
      (workshop.footprint.y + row) * size, size, size);
  }
  context.globalAlpha = 1;
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

  world.trees.forEach((cell, index) => {
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
  // Four small boundary stakes reserve the footprint; the courtyard stays open.
  const stakes = track(scene.add.graphics().setDepth(4));
  stakes.fillStyle(0x745445, 0.9);
  for (const x of [workshop.footprint.x * size + 5, (workshop.footprint.x + workshop.footprint.width) * size - 5]) {
    for (const y of [workshop.footprint.y * size + 7, (workshop.footprint.y + workshop.footprint.height) * size - 7]) {
      stakes.fillRect(x - 2, y - 7, 4, 9).fillStyle(0xd8ba7b, 0.8).fillRect(x - 3, y - 8, 6, 3).fillStyle(0x745445, 0.9);
    }
  }
  const workshopX = (workshop.footprint.x + workshop.footprint.width / 2) * size;
  const workshopY = (workshop.blockingBody.y + workshop.blockingBody.height) * size;
  const building = track(scene.add.image(workshopX, workshopY, KEYS.workshopDamaged)
    .setOrigin(0.5, 112/128).setDepth(workshopY + 1000));
  const dust = track(scene.add.graphics().setDepth(workshopY + 1002));
  const plotLabel = track(scene.add.text(workshopX,
    (workshop.footprint.y + workshop.footprint.height) * size - 7, 'Alte Werkstatt', {
      fontFamily: 'Segoe UI, sans-serif', fontSize: '10px', color: '#e1d0a8', stroke: '#304a32', strokeThickness: 3,
    }).setOrigin(0.5).setDepth(workshopY + 1003));
  const goal = cellCenter(layout, layout.core);
  track(scene.add.ellipse(goal.x, goal.y + 5, 37, 16, 0xffd79b, 0.13).setDepth(900));
  track(scene.add.image(goal.x, goal.y + 3, KEYS.core, 2).setScale(0.65).setOrigin(0.5, 0.78).setDepth(goal.y + 1000));
  const coreWeapon = track(scene.add.image(goal.x, goal.y - 39, KEYS.coreWeapon, 0).setScale(0.7).setDepth(goal.y + 1001));
  const entrance = cellCenter(layout, layout.road.cells[0]);
  track(scene.add.text(8, entrance.y - 15, '➜', { fontSize: '24px', color: '#35533b' }).setDepth(10));
  return {
    update(elapsed, built, builtAt) {
      pond?.setFrame(loopFrame(elapsed, 10)); coreWeapon.setFrame(loopFrame(elapsed, 10));
      const texture = built ? KEYS.workshop : KEYS.workshopDamaged;
      if (building.texture.key !== texture) building.setTexture(texture);
      plotLabel.setText(built ? 'Werkstatt I' : 'Alte Werkstatt');
      dust.clear();
      const age = builtAt === null ? 10 : elapsed - builtAt;
      if (built && age >= 0 && age < 1.2) for (let i = 0; i < 9; i++) {
        dust.fillStyle(0xe7d4a5, (1 - age/1.2) * 0.7).fillRect(workshopX - 42 + i * 11,
          workshopY - 3 - age * (9 + i % 3 * 5), 3 + i % 2, 3);
      }
    },
    destroy() { for (const object of objects) object.destroy(); for (const key of textureKeys) scene.textures.remove(key); },
  };
}
