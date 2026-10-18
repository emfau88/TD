import { preloadTowerSheets, towerSheet } from './tower-atlas';
/** Only the original PNGs needed by B05 are bundled. Source measurements and
 * frame maps come from public/assets/manifest.json and reference/STYLE_GUIDE.md.
 * These helpers never import classic simulation rules or start an animation clock.
 */
import { succubusFrame } from '../../../reference/src/succubus-art';
import type Phaser from 'phaser';
import { MARA_FRAMES, MARA_FOOT, MARA_SCALE } from '../../../reference/src/style-assets';
import { TREE_FRAMES } from '../../../reference/src/terrain';
export { MARA_FOOT };

export const ART = Object.freeze({
  sniperWeapon3: new URL('../../../public/assets/Tower 04 - Level 03 - Weapon.png', import.meta.url).href,
  cannonWeapon3: new URL('../../../public/assets/Tower 03 - Level 03 - Weapon.png', import.meta.url).href,
  frostWeapon3: new URL('../../../public/assets/Tower 02 - Level 03 - Weapon.png', import.meta.url).href,
  weapon3: new URL('../../../public/assets/Tower 01 - Level 03 - Weapon.png', import.meta.url).href,
  bossDance: new URL('../../../public/assets/Succubus Dance HD v1.png', import.meta.url).href,
  boss: new URL('../../../public/assets/Succubus Pixel v2.png', import.meta.url).href,
  wisp: new URL('../../../public/assets/Wisp - Animations.png', import.meta.url).href,
  scorpion: new URL('../../../public/assets/Scorpion.png', import.meta.url).href,
  cannonTower: new URL('../../../public/assets/Tower 03.png', import.meta.url).href,
  cannonWeapon: new URL('../../../public/assets/Tower 03 - Level 01 - Weapon.png', import.meta.url).href,
  cannonWeapon2: new URL('../../../public/assets/Tower 03 - Level 02 - Weapon.png', import.meta.url).href,
  cannonProjectile: new URL('../../../public/assets/Tower 03 - Level 01 - Projectile.png', import.meta.url).href,
  sniperTower: new URL('../../../public/assets/Tower 04.png', import.meta.url).href,
  sniperWeapon: new URL('../../../public/assets/Tower 04 - Level 01 - Weapon.png', import.meta.url).href,
  sniperWeapon2: new URL('../../../public/assets/Tower 04 - Level 02 - Weapon.png', import.meta.url).href,
  sniperProjectile: new URL('../../../public/assets/Tower 04 - Level 01 - Projectile.png', import.meta.url).href,
  grass: new URL('../../../public/assets/Grass Tileset.png', import.meta.url).href,
  water: new URL('../../../public/assets/Animated water tiles.png', import.meta.url).href,
  tower: new URL('../../../public/assets/Tower 01.png', import.meta.url).href,
  weapon: new URL('../../../public/assets/Tower 01 - Level 01 - Weapon.png', import.meta.url).href,
  projectile: new URL('../../../public/assets/Tower 01 - Level 01 - Projectile.png', import.meta.url).href,
  leafbug: new URL('../../../public/assets/Leafbug.png', import.meta.url).href,
  firebug: new URL('../../../public/assets/Firebug.png', import.meta.url).href,
  core: new URL('../../../public/assets/Tower 08.png', import.meta.url).href,
  coreWeapon: new URL('../../../public/assets/Tower 08 - Level 03 - Weapon.png', import.meta.url).href,
  maraSource: new URL('../../../public/assets/Hero Mara.png', import.meta.url).href,
  weapon2: new URL('../../../public/assets/Tower 01 - Level 02 - Weapon.png', import.meta.url).href,
  frostTower: new URL('../../../public/assets/Tower 02.png', import.meta.url).href,
  frostWeapon: new URL('../../../public/assets/Tower 02 - Level 01 - Weapon.png', import.meta.url).href,
  frostWeapon2: new URL('../../../public/assets/Tower 02 - Level 02 - Weapon.png', import.meta.url).href,
  frostProjectile: new URL('../../../public/assets/Tower 02 - Level 01 - Projectile.png', import.meta.url).href,
  warehouse: new URL('../assets/warehouse/warehouse-i.png', import.meta.url).href,
  workshop: new URL('../assets/workshop/workshop-i.png', import.meta.url).href,
  workshopDamaged: new URL('../assets/workshop/workshop-damaged.png', import.meta.url).href,
});
export const KEYS = Object.freeze({
  sniperWeapon3: 'idle-sniperWeapon3',
  cannonWeapon3: 'idle-cannonWeapon3',
  frostWeapon3: 'idle-frostWeapon3',
  weapon3: 'idle-weapon3',
  bossDance: 'idle-rosenspiegel-dance', boss: 'idle-rosenspiegel', wisp: 'idle-wisp',
  scorpion: 'idle-scorpion',
  cannonTower: 'idle-cannonTower',
  cannonWeapon: 'idle-cannonWeapon',
  cannonWeapon2: 'idle-cannonWeapon2',
  cannonProjectile: 'idle-cannonProjectile',
  sniperTower: 'idle-sniperTower',
  sniperWeapon: 'idle-sniperWeapon',
  sniperWeapon2: 'idle-sniperWeapon2',
  sniperProjectile: 'idle-sniperProjectile',
  grass: 'idle-grass', water: 'idle-water-source', tower: 'idle-tower', weapon: 'idle-weapon',
  projectile: 'idle-projectile', leafbug: 'idle-leafbug', firebug: 'idle-firebug',
  core: 'idle-core', coreWeapon: 'idle-core-weapon', maraSource: 'idle-mara-source', mara: 'idle-mara',
  weapon2: 'idle-weapon-2', frostTower: 'idle-frost-tower', frostWeapon: 'idle-frost-weapon',
  frostWeapon2: 'idle-frost-weapon-2', frostProjectile: 'idle-frost-projectile',
  warehouse: 'idle-warehouse', workshop: 'idle-workshop', workshopDamaged: 'idle-workshop-damaged',
});
export const SCALE = Object.freeze({ tile: 0.625, tree: 0.8, tower: 0.63, enemy: 0.83, mara: 1, projectile: 0.45 });
export const LEAF_FRAMES = Object.freeze([0,1,2,3,4,5,8,9,10,11,12,13,16,17,18,19,20,21,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,56,57,58,59,60,61,62,64,65,66,67,68,69,70]);
export const FIRE_FRAMES = Object.freeze([0,1,2,3,4,5,11,12,13,14,15,16,22,23,24,25,26,27,33,34,35,36,37,38,39,40,44,45,46,47,48,49,50,51,55,56,57,58,59,60,61,62,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,91,92,93,94,95,96,97,98]);
export type EnemyDirection = 'up' | 'down' | 'side';
export type MaraDirection = 'up' | 'down' | 'left' | 'right';

/** Directional Move tags point into the logical manifest frame map. */
export function enemyFrame(kind: 'Leafbug' | 'Firebug' | 'Scorpion' | 'Rosenspiegel', direction: EnemyDirection, elapsed: number): number {
  if (kind === 'Rosenspiegel') return succubusFrame('move', direction, elapsed * 1000);
  if (kind === 'Scorpion') return (direction === 'down' ? 24 : direction === 'up' ? 32 : 40) + Math.floor(Math.max(0, elapsed) * 10) % 8;
  const logicalStart = direction === 'down' ? 18 : direction === 'up' ? 26 : 34;
  const frames = kind === 'Leafbug' ? LEAF_FRAMES : FIRE_FRAMES;
  return frames[logicalStart + Math.floor(Math.max(0, elapsed) * 10) % 8];
}
/** Scorpion's side frames face left; the other sheets face right. */
export function enemyFlip(kind: string, direction: EnemyDirection, movingLeft: boolean): boolean {
  return direction === 'side' && (kind === 'Scorpion' ? !movingLeft : movingLeft);
}
export function maraFrame(direction: MaraDirection, moving: boolean, acting: boolean, elapsed: number): number {
  const row = ['down', 'left', 'right', 'up'].indexOf(direction) * 4;
  return row + (acting ? 3 : moving ? 1 + Math.floor(Math.max(0, elapsed) * 6) % 2 : 0);
}
export function loopFrame(elapsed: number, count: number, fps = 10): number {
  return Math.floor(Math.max(0, elapsed) * fps) % count;
}
export function maraDestination(index: number) {
  const frame = MARA_FRAMES[index], [left, top, right, bottom] = frame.box, [fx, fy] = frame.foot;
  return {
    source: [left, top, right - left, bottom - top] as const,
    destination: [index % 4 * 64 + Math.round(MARA_FOOT[0] + (left - fx) * MARA_SCALE),
      Math.floor(index / 4) * 64 + Math.round(MARA_FOOT[1] + (top - fy) * MARA_SCALE),
      Math.round((right - left) * MARA_SCALE), Math.round((bottom - top) * MARA_SCALE)] as const,
  };
}
export function preloadArt(scene: Phaser.Scene): void {
  preloadTowerSheets(scene);
  scene.load.image(KEYS.grass, ART.grass);
  scene.load.image(KEYS.water, ART.water);
  scene.load.image(KEYS.maraSource, ART.maraSource);
  scene.load.image(KEYS.workshop, ART.workshop);
  scene.load.image(KEYS.warehouse, ART.warehouse);
  scene.load.image(KEYS.workshopDamaged, ART.workshopDamaged);
  for (const [key, url, width, height] of [
    [KEYS.weapon3, ART.weapon3, 96, 96], [KEYS.frostWeapon3, ART.frostWeapon3, 64, 64], [KEYS.cannonWeapon3, ART.cannonWeapon3, 96, 96], [KEYS.sniperWeapon3, ART.sniperWeapon3, 128, 128], [KEYS.bossDance, ART.bossDance, 128, 128], [KEYS.boss, ART.boss, 64, 64], [KEYS.wisp, ART.wisp, 64, 64], [KEYS.scorpion, ART.scorpion, 64, 64],
    [KEYS.cannonTower, ART.cannonTower, 64, 128], [KEYS.cannonWeapon, ART.cannonWeapon, 96, 96], [KEYS.cannonWeapon2, ART.cannonWeapon2, 96, 96], [KEYS.cannonProjectile, ART.cannonProjectile, 10, 10],
    [KEYS.sniperTower, ART.sniperTower, 64, 128], [KEYS.sniperWeapon, ART.sniperWeapon, 128, 128], [KEYS.sniperWeapon2, ART.sniperWeapon2, 128, 128], [KEYS.sniperProjectile, ART.sniperProjectile, 8, 8],
    [KEYS.tower, ART.tower, 64, 128], [KEYS.weapon, ART.weapon, 96, 96],
    [KEYS.projectile, ART.projectile, 8, 40],
    [KEYS.leafbug, ART.leafbug, 64, 64], [KEYS.firebug, ART.firebug, 128, 64],
    [KEYS.core, ART.core, 64, 192], [KEYS.coreWeapon, ART.coreWeapon, 64, 64],
    [KEYS.weapon2, ART.weapon2, 96, 96],
    [KEYS.frostTower, ART.frostTower, 64, 192],
    [KEYS.frostWeapon, ART.frostWeapon, 48, 48], [KEYS.frostWeapon2, ART.frostWeapon2, 64, 64],
    [KEYS.frostProjectile, ART.frostProjectile, 32, 32],
  ] as const) scene.load.spritesheet(key, url, { frameWidth: width, frameHeight: height });
}
export function prepareArt(scene: Phaser.Scene): void {
  const grass = scene.textures.get(KEYS.grass);
  for (const [name, [x, y, width, height]] of Object.entries({
    grass: [128,64,64,64], rock: [832,768,64,64], flowers: [704,576,64,64], ...TREE_FRAMES,
  })) if (!grass.has(name)) grass.add(name, 0, x, y, width, height);
  if (!scene.textures.exists(KEYS.mara)) {
    const texture = scene.textures.createCanvas(KEYS.mara, 256, 256)!;
    const context = texture.context;
    context.imageSmoothingEnabled = false;
    const source = scene.textures.get(KEYS.maraSource).getSourceImage() as HTMLImageElement;
    for (let index = 0; index < MARA_FRAMES.length; index++) {
      const frame = maraDestination(index);
      context.drawImage(source, ...frame.source, ...frame.destination);
      texture.add(index, 0, index % 4 * 64, Math.floor(index / 4) * 64, 64, 64);
    }
    const pixels = context.getImageData(0, 0, 256, 256);
    for (let pixel = 3; pixel < pixels.data.length; pixel += 4) pixels.data[pixel] = pixels.data[pixel] >= 128 ? 255 : 0;
    context.putImageData(pixels, 0, 0);
    texture.refresh();
  }
}


export function towerArt(kind: number, stage = 1) {
  const shot = towerSheet(kind, stage, 'Projectile');
  return { base: kind === 4 ? KEYS.sniperTower : kind === 3 ? KEYS.cannonTower : kind === 2 ? KEYS.frostTower : KEYS.tower,
    weapons: [1, 2, 3].map(s => towerSheet(kind, s, 'Weapon').key),
    projectile: shot.key, frames: towerSheet(kind, stage, 'Weapon').frameMap.length, shotFrames: shot.frameMap.length };
}
