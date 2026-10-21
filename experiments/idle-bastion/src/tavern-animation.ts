import type { Companion } from './tavern-social';
import maraPortrait from '../assets/runtime/mara-portrait.webp';
import ilyraPortrait from '../assets/runtime/ilyra-portrait.webp';
import ilyraAtlas from '../assets/runtime/ilyra-atlas.webp';
import ilyraMetadata from '../assets/ilyra-tavern/ilyra-atlas.json';
import ilyraReactions from '../assets/ilyra-tavern/ilyra-reactions.json';
import ilyraExtra from '../assets/runtime/ilyra-reactions.webp';
import atlasUrl from '../assets/runtime/mara-atlas.webp';
import metadata from '../assets/mara-tavern/mara-atlas.json';
import reactions from '../assets/tavern-ui/mara-reactions.json';
import reactionsUrl from '../assets/runtime/mara-reactions.webp';

export type TouchRegion = 'hand' | 'hair' | 'shoulder';
export const MARA_REACTIONS = {
  hand: { minHearts: 0, x: 137, y: 381, label: 'Hand' },
  hair: { minHearts: 0, x: 117, y: 220, label: 'Haare' },
  shoulder: { minHearts: 0, x: 270, y: 242, label: 'Schulter' },
} as const;
export const ILYRA_REACTIONS = {
  hand: { minHearts: 0, x: 330, y: 423, label: 'Hand' },
  hair: { minHearts: 0, x: 139, y: 171, label: 'Haare' },
  shoulder: { minHearts: 0, x: 181, y: 258, label: 'Schulter' },
} as const;
const atlases = {
  mara: { base: atlasUrl, extra: reactionsUrl, metadata, reactions, scale: 1, extraScale: 1, targetX: 192 },
  ilyra: { base: ilyraAtlas, extra: ilyraExtra, metadata: ilyraMetadata, reactions: ilyraReactions, scale: 1.1, extraScale: 1.17, targetX: 240 },
};
type Frame = { x: number; y: number; width: number; height: number; anchorX: number; anchorY: number };
const load = (src: string) => new Promise<HTMLImageElement>((resolve, reject) => {
  const image = new Image(); image.onload = () => resolve(image); image.onerror = () => reject(new Error('Charaktergrafik konnte nicht geladen werden.')); image.src = src;
});
export class TavernAnimation {
  private base?: HTMLImageElement;
  private extra?: HTMLImageElement;
  private request = 0;
  private last = 0;
  private elapsed = 0;
  private active = false;
  private clip: 'idle' | TouchRegion = 'idle';
  private displayed = '';
  private generation = 0;
  private who: Companion = 'mara';
  ready = false;
  get reacting(): boolean { return this.clip !== 'idle'; }
  constructor(private readonly canvas: HTMLCanvasElement, private readonly changed: () => void) {}
  async start(who: Companion = 'mara'): Promise<void> {
    this.stop(); this.who = who;
    this.canvas.getContext('2d')?.clearRect(0, 0, 384, 512);
    const art = atlases[who];
    const generation = ++this.generation;
    this.active = true; this.clip = 'idle'; this.elapsed = 0; this.last = 0;
    try {
      const [base, extra] = await Promise.all([load(art.base), load(art.extra)]);
      if (generation !== this.generation || !this.active) return;
      this.base = base; this.extra = extra;
      this.ready = true; delete this.canvas.dataset.error; this.displayed = ''; this.changed(); this.request = requestAnimationFrame(this.tick);
    } catch { if (generation === this.generation) { this.ready = false; this.canvas.dataset.error = 'true'; this.changed(); } }
  }
  play(region: TouchRegion): void { if (this.ready && !this.reacting) { this.clip = region; this.elapsed = 0; this.changed(); } }
  stop(): void { this.active = false; this.generation++; cancelAnimationFrame(this.request); this.request = 0; this.ready = false; this.clip = 'idle'; this.base = undefined; this.extra = undefined; }
  private tick = (now: number): void => {
    if (!this.active) return;
    if (!document.hidden) {
      if (this.last) this.elapsed += Math.min(80, now - this.last);
      const art = atlases[this.who];
      const clip = this.clip === 'idle' ? art.metadata.idle : this.clip === 'shoulder' ? art.metadata.touch
        : art.reactions[this.clip];
      const total = clip.reduce((sum, pair) => sum + pair[1]!, 0);
      if (this.elapsed >= total) { this.elapsed = 0; this.clip = 'idle'; this.changed(); }
      else {
        let time = this.elapsed;
        for (const [frame, ms] of clip) { if (time < ms!) { this.draw(frame!); break; } time -= ms!; }
      }
    }
    this.last = document.hidden ? 0 : now;
    this.request = requestAnimationFrame(this.tick);
  };
  private draw(index: number): void {
    const key = `${this.clip}:${index}`;
    if (key === this.displayed) return;
    this.displayed = key;
    const extra = this.clip === 'hand' || this.clip === 'hair';
    const art = atlases[this.who], scale = extra ? art.extraScale : art.scale;
    const frame: Frame = (extra ? art.reactions : art.metadata).frames[index]!;
    const ctx = this.canvas.getContext('2d'); if (!ctx) return;
    ctx.clearRect(0, 0, 384, 512); ctx.imageSmoothingEnabled = false;
    if (this.who === 'ilyra') {
      // The set-down spear is a static prop, not part of her gesture or breathing.
      const resting = ilyraMetadata.frames[0]!;
      ctx.drawImage(this.base!, 0, 0, 100, resting.height,
        art.targetX - resting.anchorX * art.scale, 360 - resting.anchorY * art.scale, 100 * art.scale, resting.height * art.scale);
    }
    const inset = this.who === 'ilyra' ? 100 : 0;
    ctx.drawImage((extra ? this.extra : this.base)!, frame.x + inset, frame.y, frame.width - inset, frame.height,
      art.targetX + (inset - frame.anchorX) * scale, 360 - frame.anchorY * scale, (frame.width - inset) * scale, frame.height * scale);
    this.canvas.dataset.frame = `${this.who}:${key}`;
  }
}
export async function drawCompanionPortrait(canvas: HTMLCanvasElement, who: Companion): Promise<void> {
  // Overview portraits must not fetch either full animation atlas.
  const image = await load(who === 'mara' ? maraPortrait : ilyraPortrait);
  const ctx = canvas.getContext('2d'); if (!ctx) return;
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(image, 0, 0, image.width, image.height, 0, 0, canvas.width, canvas.height);
}
