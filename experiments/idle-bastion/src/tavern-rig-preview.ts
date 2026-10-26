import type { Companion, Interaction } from './tavern-social';
import type { TouchRegion } from './tavern-animation';
import type { TavernPlayer, TavernPresentation } from './tavern-presentation';
import { TavernAtlasCache, type AtlasEntry } from './tavern-atlas-cache';
import './tavern-rig.css';

const packageUrl = new URL('../assets/tavern-rig/manifest.json', import.meta.url).href;
const pageUrls = import.meta.glob<string>('../assets/tavern-rig/**/*.webp', { eager: true, query: '?url', import: 'default' });
const portraits = {
  mara: new URL('../assets/tavern-rig/mara-portrait.webp', import.meta.url).href,
  ilyra: new URL('../assets/tavern-rig/ilyra-portrait.webp', import.meta.url).href,
};
type Clip = { count: number; fps: number; pages: string[]; restFrames: number[]; width: number; height: number; placement: [number, number, number, number] };
type Clips = Record<string, Clip>;
async function clipsFor(who: Companion, signal: AbortSignal): Promise<Clips> {
  if (import.meta.env.DEV && new URLSearchParams(location.search).get('quality') === 'source') {
    return (await import('./tavern-rig-source-preview')).sourceClips(who);
  }
  if (import.meta.env.DEV && new URLSearchParams(location.search).get('quality') === '90') {
    return (await import('./tavern-rig-source-preview')).quality90Clips(who);
  }
  const response = await fetch(packageUrl, { signal: AbortSignal.any([signal, AbortSignal.timeout(5000)]) });
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
  private cache = new TavernAtlasCache();
  private failed = new Set<string>();
  private idleStill = false;
  private pendingReady = false;
  private preparing?: Promise<boolean>;
  private warmTimer?: ReturnType<typeof setTimeout>;
  private manifestAbort?: AbortController;
  private intent = 0;
  private blendFrom?: HTMLCanvasElement;
  private blendSeconds = 0;
  get reacting() { return this.key !== 'idle' || this.pending !== null; }
  get reactionsReady() { return this.ready; }
  constructor(private canvas: HTMLCanvasElement, private changed: () => void) { canvas.width = 480; canvas.height = 700; }
  setHearts(count: number) { const previous = this.count; this.count = count; if (previous < 2 && count >= 2 && this.ready) this.prime(); }
  async start(who: Companion = 'mara') {
    this.stop(); const generation = this.generation; this.active = true;
    this.manifestAbort = new AbortController();
    const signal = this.manifestAbort.signal;
    this.canvas.dataset.companion = who;
    delete this.canvas.dataset.error; delete this.canvas.dataset.reactionError;
    this.canvas.getContext('2d')?.clearRect(0, 0, 480, 700);
    try {
      let clips: Clips;
      try { clips = await clipsFor(who, signal); }
      catch { if (signal.aborted) return; clips = await clipsFor(who, signal); }
      if (!this.active || generation !== this.generation) return;
      this.clips = clips;
      if (!await this.buffer('idle', 2)) {
        if (!this.active || generation !== this.generation) return;
        // A portrait remains usable even when the first idle atlas is unavailable.
        this.idleStill = true; this.canvas.dataset.error = 'true';
      }
      if (!this.active || generation !== this.generation) return;
      this.ready = true; this.draw(); this.changed(); this.request = requestAnimationFrame(this.tick);
      this.warmTimer = setTimeout(() => { if (this.active && generation === this.generation) this.prime(); }, 200);
    } catch { if (generation === this.generation) { this.canvas.dataset.error = 'true'; this.changed(); } }
  }
  stop() {
    this.active = false; this.generation++; cancelAnimationFrame(this.request);
    this.manifestAbort?.abort(); clearTimeout(this.warmTimer); this.intent++;
    this.ready = false; this.loadingReactions = false; this.key = 'idle'; this.frame = 0; this.pending = null;
    this.returnFrames = []; this.loops = 0; this.last = 0; this.elapsed = 0; this.cache.clear();
    this.failed.clear(); this.clips = {}; this.idleStill = false; this.pendingReady = false; this.preparing = undefined;
    this.blendFrom = undefined; this.blendSeconds = 0;
    // stop() is synchronous: no old character can survive until the next fetch/RAF.
    this.canvas.getContext('2d')?.clearRect(0, 0, this.canvas.width, this.canvas.height);
    for (const key of ['clip', 'frame', 'companion', 'cachedPages', 'error', 'reactionError']) delete this.canvas.dataset[key];
  }
  prepareReactions(): Promise<boolean> {
    if (!this.ready) return Promise.resolve(false);
    if (this.preparing) return this.preparing;
    const generation = this.generation;
    this.failed.delete('head'); this.failed.delete('touch'); delete this.canvas.dataset.reactionError;
    this.loadingReactions = true; this.changed();
    this.preparing = Promise.all([this.buffer('head', 3), this.buffer('touch', 3)]).then(result => generation === this.generation && result.every(Boolean)).finally(() => {
      if (generation === this.generation) { this.preparing = undefined; this.loadingReactions = !!this.pending; this.changed(); }
    });
    return this.preparing;
  }
  play(region: TouchRegion) { this.enqueue(region === 'hair' ? 'head' : 'touch'); }
  act(action: Interaction) { this.enqueue(action === 'talk' ? 'head' : this.count >= 2 ? 'joy' : 'touch'); }
  gesture(key: string) { if (this.count >= 2) this.enqueue(key); }
  private enqueue(key: string) {
    if (!this.ready || !this.clips[key]) return;
    this.failed.delete(key); delete this.canvas.dataset.reactionError;
    this.pending = key; this.pendingReady = false; this.returnFrames = []; this.loadingReactions = true;
    const generation = this.generation, intent = ++this.intent;
    // Stale idle look-ahead must not occupy the download slots after a tap.
    this.cache.retainLoads([...this.urls(key, 0, this.startPages(key)), ...this.urls(this.key, this.frame, this.key === 'idle' ? 2 : 4), this.clips.idle!.pages[0]!]);
    this.prime(); this.changed();
    void this.buffer(key, this.startPages(key)).then(ready => {
      if (!ready || generation !== this.generation || intent !== this.intent || this.pending !== key) return;
      this.pendingReady = true;
      if (this.key === 'idle' && !this.idleStill) {
        const neutral = this.clips.idle!.restFrames.reduce((a, b) => Math.abs(b - this.frame) < Math.abs(a - this.frame) ? b : a);
        const from = this.frame, steps = Math.min(8, Math.abs(neutral - from));
        for (let i = 1; i <= steps; i++) { const t = i / steps; this.returnFrames.push(Math.round(from + (neutral - from) * t * t * (3 - 2 * t))); }
      }
      this.elapsed = 0; this.prime(); this.changed();
    });
  }
  private startPages(_key: string) { return 4; }
  private urls(key: string, start: number, pages: number) { return this.clips[key]!.pages.slice(Math.floor(start / 8), Math.floor(start / 8) + pages); }
  private workingSet() {
    const urls = new Set([this.clips.idle!.pages[0]!]);
    const current = this.returnFrames.length ? [this.clips.idle!.pages[Math.floor(this.frame / 8)]!, ...this.returnFrames.map(frame => this.clips.idle!.pages[Math.floor(frame / 8)]!)] : this.urls(this.key, this.frame, this.key === 'idle' ? this.pending ? 2 : 3 : 4);
    for (const url of current) urls.add(url);
    if (this.pending) for (const url of this.urls(this.pending, 0, this.startPages(this.pending))) urls.add(url);
    return urls;
  }
  private buffer(key: string, pages: number) {
    const urls = this.urls(key, 0, pages), keep = this.workingSet();
    for (const url of urls) keep.add(url);
    this.cache.pin(keep);
    return Promise.all(urls.map(url => this.load(key, url, 2).promise)).then(results => results.every(Boolean));
  }
  private load(key: string, url: string, priority = 1): AtlasEntry {
    const entry = this.cache.request(url, priority), generation = this.generation;
    void entry.promise.then(ready => {
      if (!ready && entry.state === 'failed' && this.active && generation === this.generation) this.fail(key);
    });
    return entry;
  }
  private fail(key: string) {
    this.failed.add(key);
    if (key === 'idle') this.idleStill = true;
    // Background warm-up failures stay quiet until the corresponding action.
    if (key !== this.key && key !== this.pending) return;
    this.canvas.dataset.reactionError = 'true';
    this.pending = null; this.pendingReady = false; this.returnFrames = []; this.loadingReactions = false;
    this.key = 'idle'; this.frame = 0; this.elapsed = 0;
    if (this.cache.peek(this.clips.idle!.pages[0]!)?.state !== 'ready') this.canvas.dataset.error = 'true';
    this.draw(); this.changed();
  }
  private prime() {
    if (!this.active || !this.clips.idle) return;
    const keep = this.workingSet();
    const common = !this.pending ? ['head', 'touch', ...(this.count >= 2 ? ['joy'] : [])].filter(key => key !== this.key && !this.failed.has(key)) : [];
    const warmPages = (key: string) => this.key === 'idle' ? key === 'head' ? 4 : 2 : ['head', 'touch', 'joy'].includes(this.key) ? 4 : 3;
    for (const key of common) for (const url of this.urls(key, 0, warmPages(key))) keep.add(url);
    this.cache.pin(keep);
    if (this.pending) for (const url of this.urls(this.pending, 0, this.startPages(this.pending))) this.load(this.pending, url, 4);
    if (!this.failed.has(this.key)) {
      const offsets = this.key === 'idle' ? this.pending ? [0, 8] : [0, 8, 16] : [0, 8, 16, 24];
      const frames = this.returnFrames.length ? this.returnFrames : offsets.map(offset => this.frame + offset).filter(frame => frame < this.clips[this.key]!.count);
      for (const [index, frame] of frames.entries()) this.load(this.key, this.clips[this.key]!.pages[Math.floor(frame / 8)]!, this.returnFrames.length || this.key !== 'idle' ? 3 : index < 2 ? 2 : 0);
    }
    for (const key of common) for (const url of this.urls(key, 0, warmPages(key))) this.load(key, url, key === 'joy' ? 0 : 1);
    this.canvas.dataset.cachedPages = String(this.cache.size);
  }
  private beginPending() {
    if (!this.pending || !this.pendingReady) return false;
    if (this.key !== 'idle') {
      // A new action may replace any reaction, including the automatic variant.
      // Blend the currently visible pose instead of snapping or waiting seconds.
      this.blendFrom = document.createElement('canvas');
      this.blendFrom.width = this.canvas.width; this.blendFrom.height = this.canvas.height;
      this.blendFrom.getContext('2d')?.drawImage(this.canvas, 0, 0);
      this.blendSeconds = 0;
    }
    this.key = this.pending; this.pending = null; this.pendingReady = false; this.loadingReactions = false;
    this.frame = 0; this.elapsed = 0; this.returnFrames = []; this.loops = 0; this.changed(); return true;
  }
  private tick = (now: number) => {
    this.request = requestAnimationFrame(this.tick);
    const dt = this.last ? Math.min(.1, (now - this.last) / 1000) : 0; this.last = document.hidden ? 0 : now;
    if (!this.active || !this.ready || document.hidden) return;
    if (this.blendFrom) {
      this.blendSeconds += dt;
      if (this.blendSeconds >= .16) this.blendFrom = undefined;
    }
    this.elapsed += dt;
    if (this.pendingReady && this.key !== 'idle') { if (this.beginPending()) this.draw(); return; }
    if (this.pendingReady && this.key === 'idle' && !this.returnFrames.length) { if (this.beginPending()) this.draw(); return; }
    if (this.idleStill && this.key === 'idle' && !this.returnFrames.length) return;
    if (this.elapsed < 1 / this.clips[this.key]!.fps) return;
    if (this.pendingReady && this.key === 'idle' && this.returnFrames.length) {
      if (this.cache.peek(this.clips.idle!.pages[Math.floor(this.returnFrames[0]! / 8)]!)?.state !== 'ready') { this.elapsed = 0; return; }
      this.frame = this.returnFrames.shift()!;
    } else if (this.frame + 1 < this.clips[this.key]!.count) {
      if (this.cache.peek(this.clips[this.key]!.pages[Math.floor((this.frame + 1) / 8)]!)?.state !== 'ready') { this.elapsed = 0; return; }
      this.frame++;
    } else if (this.pendingReady) {
      this.beginPending();
    } else {
      this.loops = this.key === 'idle' ? this.loops + 1 : 0; this.key = 'idle'; this.frame = 0; this.changed();
      if (this.count >= 2 && this.loops >= 3 && !this.pending && !this.failed.has('variant')) this.enqueue('variant');
    }
    this.elapsed = Math.max(0, this.elapsed - 1 / this.clips[this.key]!.fps); this.draw();
  };
  private draw() {
    this.prime();
    const clip = this.clips[this.key]!, entry = this.cache.peek(clip.pages[Math.floor(this.frame / 8)]!), ctx = this.canvas.getContext('2d');
    if (entry?.state !== 'ready' || !ctx) {
      if (this.key === 'idle' && this.idleStill && !this.canvas.dataset.error) {
        this.canvas.dataset.error = 'true'; this.canvas.dataset.clip = 'idle'; this.canvas.dataset.frame = '0';
        ctx?.clearRect(0, 0, 480, 700); this.changed();
      }
      return;
    }
    ctx.clearRect(0, 0, 480, 700); ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(entry.image, this.frame % 4 * clip.width, Math.floor(this.frame % 8 / 4) * clip.height, clip.width, clip.height, ...clip.placement);
    if (this.blendFrom) {
      ctx.save(); ctx.globalAlpha = Math.max(0, 1 - this.blendSeconds / .16);
      ctx.drawImage(this.blendFrom, 0, 0); ctx.restore();
    }
    this.canvas.dataset.clip = this.key; this.canvas.dataset.frame = String(this.frame);
    delete this.canvas.dataset.error;
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
