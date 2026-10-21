import atlasUrl from '../assets/mara-tavern/mara-atlas.png';
import metadata from '../assets/mara-tavern/mara-atlas.json';
import reactions from '../assets/tavern-ui/mara-reactions.json';
import reactionsUrl from '../assets/tavern-ui/mara-reactions.png';

export type TouchRegion = 'hand' | 'hair' | 'shoulder';
export const MARA_REACTIONS = {
  hand: { minHearts: 0, x: 137, y: 381, label: 'Hand', line: 'Du kannst meine Hand nehmen. Aber meine Werkzeuge bleiben bei mir.' },
  hair: { minHearts: 0, x: 117, y: 220, label: 'Haare', line: 'Vorsichtig mit dem Zopf … den habe ich heute ausnahmsweise ordentlich geflochten.' },
  shoulder: { minHearts: 0, x: 270, y: 242, label: 'Schulter', line: 'He … du hättest auch einfach meinen Namen sagen können.' },
} as const;
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
  ready = false;
  get reacting(): boolean { return this.clip !== 'idle'; }
  constructor(private readonly canvas: HTMLCanvasElement, private readonly changed: () => void) {}
  async start(): Promise<void> {
    const generation = ++this.generation;
    this.active = true; this.clip = 'idle'; this.elapsed = 0; this.last = 0;
    try {
      const [base, extra] = await Promise.all([load(atlasUrl), load(reactionsUrl)]);
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
      const clip = this.clip === 'idle' ? metadata.idle : this.clip === 'shoulder' ? metadata.touch
        : reactions[this.clip];
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
    let frame: Frame = metadata.frames[index]!;
    if (extra) frame = reactions.frames[index]!;
    const ctx = this.canvas.getContext('2d'); if (!ctx) return;
    ctx.clearRect(0, 0, 384, 512); ctx.imageSmoothingEnabled = false;
    ctx.drawImage((extra ? this.extra : this.base)!, frame.x, frame.y, frame.width, frame.height,
      192 - frame.anchorX, 360 - frame.anchorY, frame.width, frame.height);
    this.canvas.dataset.frame = key;
  }
}
export async function drawMaraPortrait(canvas: HTMLCanvasElement): Promise<void> {
  const image = await load(atlasUrl);
  const ctx = canvas.getContext('2d'); if (!ctx) return;
  ctx.imageSmoothingEnabled = false; ctx.drawImage(image, 82, 0, 170, 200, 0, 0, canvas.width, canvas.height);
}
