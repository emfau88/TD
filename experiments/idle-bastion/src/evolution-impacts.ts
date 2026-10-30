import type Phaser from 'phaser';
import { drawImpact, profile, IMPACT_FRAME_SIZE, IMPACT_FRAME_COUNT } from '../../../prototypes/tower-impact-study/effects.js';
import { SKIN_LEVELS, skinLevel } from './tower-evolution';
import { towerSheet } from './tower-atlas';

const FRAMES: readonly number[] = Object.freeze(Array.from({ length: IMPACT_FRAME_COUNT }, (_, i) => i));
const BASE_SCALE = [0, 0.6, 0.8, 1.6, 0.6];
export interface EvolutionImpact { key:string; frames:readonly number[]; duration:number; level:number }
/** Cosmetic selection uses the fired payload, including after upgrades, sale or reload. */
export function evolutionImpact(kind:number, level:number):EvolutionImpact | undefined {
  if (!Number.isInteger(kind) || kind < 1 || kind > 5) return undefined;
  const tier = skinLevel(level);
  return { key:`evolution-impact-r5-${kind}-${tier}`, frames:FRAMES, duration:profile(kind,tier).life/1000, level:tier };
}

/** Same ten poses and original stage-one source as the approved comparison. */
export function paintImpactAtlas(context:CanvasRenderingContext2D, kind:number, level:number, source:HTMLImageElement | HTMLCanvasElement):void {
  const sheet = towerSheet(kind, kind===5?Math.min(3,skinLevel(level)):1, 'Projectile - Impact');
  const columns = source.width / sheet.width, scale = kind===5?30/sheet.width:BASE_SCALE[kind], life = profile(kind,level).life;
  context.imageSmoothingEnabled = false;
  const base = (c:CanvasRenderingContext2D, progress:number) => {
    const f = sheet.frameMap[Math.min(sheet.frameMap.length-1, Math.floor(progress*sheet.frameMap.length))];
    c.drawImage(source, f%columns*sheet.width, Math.floor(f/columns)*sheet.height, sheet.width, sheet.height,
      -sheet.width*scale/2, -sheet.height*scale/2, sheet.width*scale, sheet.height*scale);
  };
  for (let frame=0; frame<IMPACT_FRAME_COUNT; frame++) {
    context.save(); context.translate(frame*IMPACT_FRAME_SIZE+IMPACT_FRAME_SIZE/2, IMPACT_FRAME_SIZE/2);
    drawImpact(context,kind,level,(frame+.5)/IMPACT_FRAME_COUNT*life,base);
    context.restore();
  }
}

/** One upload per profile while loading, never per hit. 40 fixed 960x96 textures, ~14.06 MiB raw pixels. */
export function prepareEvolutionImpacts(scene:Phaser.Scene):void {
  for (const kind of [1,2,3,4,5]) for (const level of SKIN_LEVELS) {
    const impact=evolutionImpact(kind,level)!;
    if (scene.textures.exists(impact.key)) continue;
    const original=towerSheet(kind,kind===5?Math.min(3,skinLevel(level)):1,'Projectile - Impact');
    if (!scene.textures.exists(original.key)) throw new Error(`Missing original impact: ${original.key}`);
    const source=scene.textures.get(original.key).getSourceImage() as HTMLImageElement;
    const canvas=document.createElement('canvas');
    canvas.width=IMPACT_FRAME_SIZE*IMPACT_FRAME_COUNT; canvas.height=IMPACT_FRAME_SIZE;
    const context=canvas.getContext('2d');
    if (!context) throw new Error('Cannot prepare tower impacts');
    paintImpactAtlas(context,kind,level,source);
    const texture=scene.textures.addCanvas(impact.key,canvas);
    if (!texture) throw new Error(`Cannot register tower impact: ${impact.key}`);
    for (const frame of FRAMES) texture.add(frame,0,frame*IMPACT_FRAME_SIZE,0,IMPACT_FRAME_SIZE,IMPACT_FRAME_SIZE);
    texture.setFilter(1); // Phaser NEAREST: preserve the approved pixel edges.
  }
}
