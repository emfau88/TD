import type { Companion, Interaction } from './tavern-social';
import type { TouchRegion } from './tavern-animation';
import type { TavernPlayer, TavernPresentation } from './tavern-presentation';
import './tavern-rig.css';

const packageUrl = new URL('../assets/tavern-rig/manifest.json', import.meta.url).href;
const pageUrls = import.meta.glob<string>('../assets/tavern-rig/**/*.webp', { eager: true, query: '?url', import: 'default' });
const portraits = {
  mara: new URL('../assets/tavern-rig/mara-portrait.webp', import.meta.url).href,
  ilyra: new URL('../assets/tavern-rig/ilyra-portrait.webp', import.meta.url).href,
};
type Clip = { count: number; fps: number; pages: string[]; restFrames: number[]; width: number; height: number; placement: [number, number, number, number] };
type Clips = Record<string, Clip>;
type Entry = { image: HTMLImageElement; ready: boolean; failed: boolean; promise: Promise<boolean> };
async function clipsFor(who: Companion): Promise<Clips> {
  if (import.meta.env.DEV && new URLSearchParams(location.search).get('quality') === 'source') {
    return (await import('./tavern-rig-source-preview')).sourceClips(who);
  }
  const response = await fetch(packageUrl);
  if (!response.ok) throw Error('Animationsdaten fehlen');
  const manifest = await response.json(), clips: Clips = {};
  for (const [key, clip] of Object.entries(manifest.heroes[who]) as [string, Clip][]) {
    clips[key] = { ...clip, width: 480, height: 700, placement: [0, 0, 480, 700], pages: clip.pages.map(page => {
      const url = pageUrls[`../assets/tavern-rig/${page}`];
      if (!url) throw Error(`Animationsbild fehlt: ${page}`);
      return url;
    }) };
  }
  return clips;
}

export class RigPreviewPlayer implements TavernPlayer {
  ready = false;
  loadingReactions = false;
  private active = false;
  private generation = 0;
  private request = 0;
  private last = 0;
  private elapsed = 0;
  private key = 'idle';
  private frame = 0;
  private pending: string | null = null;
  private returnFrames: number[] = [];
  private loops = 0;
  private count = 0;
  private clips: Clips = {};
  private cache = new Map<string, Entry>();
  get reacting() { return this.key !== 'idle'; }
  get reactionsReady() { return this.ready; }
  constructor(private canvas: HTMLCanvasElement, private changed: () => void) { canvas.width = 480; canvas.height = 700; }
  setHearts(count: number) { this.count = count; }
  async start(who: Companion = 'mara') {
    this.stop(); const generation = this.generation; this.active = true;
    delete this.canvas.dataset.error; delete this.canvas.dataset.reactionError;
    this.canvas.getContext('2d')?.clearRect(0, 0, 480, 700);
    try {
      const clips = await clipsFor(who);
      if (!this.active || generation !== this.generation) return;
      this.clips = clips;
      if (!await this.page('idle', 0).promise) throw Error('Idle fehlt');
      if (!this.active || generation !== this.generation) return;
      this.ready = true; this.draw(); this.changed(); this.request = requestAnimationFrame(this.tick);
    } catch { if (generation === this.generation) { this.canvas.dataset.error = 'true'; this.changed(); } }
  }
  stop() {
    this.active = false; this.generation++; cancelAnimationFrame(this.request);
    this.ready = false; this.loadingReactions = false; this.key = 'idle'; this.frame = 0; this.pending = null;
    this.returnFrames = []; this.loops = 0; this.last = 0; this.elapsed = 0; this.cache.clear();
  }
  async prepareReactions() {
    if (!this.ready) return false;
    const generation = this.generation; this.loadingReactions = true; this.changed();
    const result = await Promise.all([this.page('head', 0).promise, this.page('touch', 0).promise]);
    if (generation !== this.generation) return false;
    this.loadingReactions = false; this.changed(); return result.every(Boolean);
  }
  play(region: TouchRegion) { this.enqueue(region === 'hair' ? 'head' : 'touch'); }
  act(action: Interaction) { this.enqueue(action === 'talk' ? 'head' : this.count >= 2 ? 'joy' : 'touch'); }
  gesture(key: string) { if (this.count >= 2) this.enqueue(key); }
  private enqueue(key: string) {
    if (!this.ready || !this.clips[key]) return;
    this.pending = key; this.page(key, 0);
    if (this.key === 'idle' && !this.returnFrames.length) {
      const neutral = this.clips.idle!.restFrames.reduce((a, b) => Math.abs(b - this.frame) < Math.abs(a - this.frame) ? b : a);
      const from = this.frame, steps = Math.min(8, Math.abs(neutral - from));
      for (let i = 1; i <= steps; i++) { const t = i / steps; this.returnFrames.push(Math.round(from + (neutral - from) * t * t * (3 - 2 * t))); }
      for (const frame of this.returnFrames) this.page('idle', frame);
      this.elapsed = 0;
    }
    this.changed();
  }
  private page(key: string, frame: number): Entry {
    const url = this.clips[key]!.pages[Math.floor(frame / 8)]!;
    const cached = this.cache.get(url); if (cached) return cached;
    const image = new Image(), generation = this.generation;
    const entry: Entry = { image, ready: false, failed: false, promise: Promise.resolve(false) };
    entry.promise = new Promise(resolve => {
      image.onload = () => { entry.ready = true; resolve(true); };
      image.onerror = () => { entry.failed = true; if (generation === this.generation) { this.canvas.dataset.reactionError = 'true'; this.changed(); } resolve(false); };
    });
    image.decoding = 'async'; image.src = url; this.cache.set(url, entry); return entry;
  }
  private beginPending() {
    if (!this.pending || !this.page(this.pending, 0).ready) return false;
    this.key = this.pending; this.pending = null; this.frame = 0; this.elapsed = 0; this.returnFrames = []; this.loops = 0; this.changed(); return true;
  }
  private tick = (now: number) => {
    this.request = requestAnimationFrame(this.tick);
    const dt = this.last ? Math.min(.1, (now - this.last) / 1000) : 0; this.last = document.hidden ? 0 : now;
    if (!this.active || !this.ready || document.hidden) return;
    this.elapsed += dt;
    if (this.pending && this.key === 'idle' && !this.returnFrames.length) { if (this.beginPending()) this.draw(); return; }
    if (this.elapsed < 1 / this.clips[this.key]!.fps) return;
    if (this.pending && this.key === 'idle' && this.returnFrames.length) {
      if (!this.page(this.pending, 0).ready || !this.page('idle', this.returnFrames[0]!).ready) { this.elapsed = 0; return; }
      this.frame = this.returnFrames.shift()!;
    } else if (this.frame + 1 < this.clips[this.key]!.count) {
      if (!this.page(this.key, this.frame + 1).ready) { this.elapsed = 0; return; }
      this.frame++;
    } else if (this.pending) {
      if (!this.beginPending()) { this.elapsed = 0; return; }
    } else {
      if (!this.page('idle', 0).ready) { this.elapsed = 0; return; }
      this.loops = this.key === 'idle' ? this.loops + 1 : 0; this.key = 'idle'; this.frame = 0; this.changed();
      if (this.count >= 2 && this.loops >= 3) this.enqueue('variant');
    }
    this.elapsed = Math.max(0, this.elapsed - 1 / this.clips[this.key]!.fps); this.draw();
  };
  private draw() {
    const clip = this.clips[this.key]!, entry = this.page(this.key, this.frame), ctx = this.canvas.getContext('2d');
    if (!entry.ready || !ctx) return;
    ctx.clearRect(0, 0, 480, 700); ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(entry.image, this.frame % 4 * clip.width, Math.floor(this.frame % 8 / 4) * clip.height, clip.width, clip.height, ...clip.placement);
    this.canvas.dataset.clip = this.key; this.canvas.dataset.frame = String(this.frame);
    const page = Math.floor(this.frame / 8), keep = new Set([clip.pages[page], clip.pages[page + 1], this.clips.idle!.pages[0]]);
    if (clip.pages[page + 1]) this.page(this.key, (page + 1) * 8);
    if (this.pending) keep.add(this.clips[this.pending]!.pages[0]);
    for (const frame of this.returnFrames) keep.add(this.clips.idle!.pages[Math.floor(frame / 8)]);
    for (const [url, cached] of this.cache) { if (this.cache.size <= 8) break; if (!keep.has(url) && cached.ready) this.cache.delete(url); }
  }
}

export const rigPreviewPresentation: TavernPresentation = {
  kind: 'rigged',
  create: (canvas, changed) => new RigPreviewPlayer(canvas, changed),
  portrait: who => portraits[who],
  async drawPortrait(canvas, who) {
    const image = new Image(); image.src = portraits[who]; await image.decode();
    canvas.getContext('2d')?.drawImage(image, 0, 0, canvas.width, canvas.height);
  },
  anchors: who => who === 'mara' ? { hair: { x: 143, y: 262 }, shoulder: { x: 350, y: 305 }, hand: { x: 370, y: 593 } } : { hair: { x: 174, y: 256 }, shoulder: { x: 342, y: 303 }, hand: { x: 384, y: 570 } },
  gestures: [
    { key: 'giggle', label: 'Zusammen lachen', minHearts: 2, line: { mara: 'Gut, der war nicht schlecht. Erzähl ihn bloß nicht Wisp – sonst muss ich ihn morgen wieder hören.', ilyra: 'Damit habe ich nicht gerechnet. Du weißt, wie du mich zum Lachen bringst.' } },
    { key: 'hip', label: 'Ein Kompliment machen', minHearts: 2, line: { mara: 'Na, wenn du mich so ansiehst, muss ja etwas dran sein.', ilyra: 'Du machst es mir nicht gerade leicht, ernst zu bleiben.' } },
    { key: 'tease', label: 'Ein wenig necken', minHearts: 2, companion: 'mara', line: { mara: 'Pass nur auf. Den nächsten frechen Spruch habe ich schon bereit.', ilyra: '' } },
  ],
};
