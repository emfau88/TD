import type Phaser from 'phaser';
import { KEYS } from './art';

/** The dock shows the same original frames as the world; no new asset set. */
export function drawDockArt(scene: Phaser.Scene): void {
  for (const canvas of Array.from(document.querySelectorAll<HTMLCanvasElement>('canvas[data-icon]'))) {
    const context = canvas.getContext('2d');
    if (!context) continue;
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.imageSmoothingEnabled = false;
    const draw = (key: string, x: number, y: number, width: number, height: number) => {
      const frame = scene.textures.get(key).get(0);
      context.drawImage(frame.source.image as CanvasImageSource, frame.cutX, frame.cutY,
        frame.cutWidth, frame.cutHeight, x, y, width, height);
    };
    if (canvas.dataset.icon === 'mara') draw(KEYS.mara, -8, 0, 80, 80);
    else if (canvas.dataset.icon === 'wisp') draw(KEYS.wisp, -8, 0, 80, 80);
    else if (canvas.dataset.icon === 'cannon' || canvas.dataset.icon === 'sniper') {
      const cannon = canvas.dataset.icon === 'cannon';
      draw(cannon ? KEYS.cannonTower : KEYS.sniperTower, 12, 0, 40, 80);
      draw(cannon ? KEYS.cannonWeapon : KEYS.sniperWeapon, cannon ? 2 : -8, cannon ? -5 : -15, cannon ? 60 : 80, cannon ? 60 : 80);
    } else if (canvas.dataset.icon === 'frost') {
      draw(KEYS.frostTower, 16, -16, 32, 96);
      draw(KEYS.frostWeapon, 8, -3, 48, 48);
    } else {
      draw(KEYS.tower, 12, 0, 40, 80);
      draw(KEYS.weapon, 2, -5, 60, 60);
    }
  }
}
