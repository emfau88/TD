import manifest from '../assets/tavern-video/manifest.json';
import maraPoster from '../assets/tavern-video/mara/idle.webp';
import ilyraPoster from '../assets/tavern-video/ilyra/idle.webp';
import maraPortrait from '../assets/tavern-rig/mara-portrait.webp';
import ilyraPortrait from '../assets/tavern-rig/ilyra-portrait.webp';
import { GESTURE_HEARTS, TOUCH_CLIPS, type TavernSceneClip } from './tavern-content';
import { TOUCH_HEARTS, type Companion, type Interaction, type TouchRegion } from './tavern-social';
import { TAVERN_ANCHORS, TAVERN_GESTURES } from './tavern-gestures';
import type { TavernPlayer, TavernPresentation } from './tavern-presentation';
import { compileTavernSceneVideo, sceneVideoRole, type TavernSceneVideoConfig, type CompiledTavernSceneVideo } from './tavern-scene-video';
import type { SceneAction } from './tavern-scene-catalog';
import { TavernVisitPlayer } from './tavern-visit-player';
import './tavern-rig.css';
import './tavern-video.css';

const urls = import.meta.glob<string>('../assets/tavern-video/**/*.mp4', { eager: true, query: '?url', import: 'default' });
const sceneUrls = Object.fromEntries(Object.entries(urls).map(([file, url]) => [file.replace('../assets/tavern-video/', ''), url]));
type Clip = { file: string; frames: number; fps: number; duration: number };
type Entry = { video: HTMLVideoElement; loaded: Promise<boolean>; cancel: () => void; failed: boolean };
const posters = { mara: maraPoster, ilyra: ilyraPoster };
const portraits = { mara: maraPortrait, ilyra: ilyraPortrait };

/** Muted media only draws the artwork. Rewards and voices remain UI transactions. */
export class TavernVideoPlayer implements TavernPlayer {
  ready = false;
  loadingReactions = false;
  get reactionsReady() { return this.ready; }
  get reacting() { return this.key !== 'idle' || this.pending !== null; }
  private active = false;
  private generation = 0;
  private intent = 0;
  private frameRequest = 0;
  private who: Companion = 'mara';
  private count = 0;
  private key = 'idle';
  private pending: string | null = null;
  private entries = new Map<string, Entry>();
  private current?: Entry;
  private lifetime?: AbortController;
  private preparing?: Promise<boolean>;
  private last = 0;
  private idleSeconds = 0;
  private drawn = '';
  private transition?: { image: HTMLCanvasElement; elapsed: number };
  private readonly localScene?: CompiledTavernSceneVideo;
  private restoreStage?: () => void;
  constructor(private canvas: HTMLCanvasElement, private changed: () => void, sceneConfig?: TavernSceneVideoConfig) {
    this.localScene = sceneConfig ? compileTavernSceneVideo(sceneConfig, sceneUrls) : undefined;
    if (sceneConfig && !this.localScene) throw new Error('Incomplete tavern scene media.');
    canvas.width = 480; canvas.height = 700;
  }
  private get clips(): Readonly<Partial<Record<string, Clip>>> { return this.localScene?.clips ?? manifest.heroes[this.who]; }
  private get warmKeys(): readonly string[] { return this.localScene ? ['talk', 'shoulder'] : ['head', 'touch']; }
  /** A staged scene is attached only after its idle frame has decoded. */
  attachCanvas(canvas: HTMLCanvasElement): void {
    this.canvas = canvas; canvas.width = 480; canvas.height = 700;
    canvas.dataset.companion = this.who; canvas.dataset.renderer = 'video';
    canvas.closest<HTMLElement>('.tv-stage')?.setAttribute('data-video', 'true');
    if (this.localScene) this.applySceneBackground(this.localScene);
    this.drawn = ''; this.draw();
  }
  setHearts(count: number) { this.count = count; }
  async start(who: Companion = this.localScene?.companion ?? 'mara'): Promise<void> {
    this.stop(); this.active = true; this.who = who;
    if (this.localScene && who !== this.localScene.companion) {
      this.active = false; this.canvas.dataset.error = 'true'; this.changed(); return;
    }
    const generation = this.generation;
    this.canvas.dataset.companion = who; this.canvas.dataset.renderer = 'video';
    this.canvas.closest<HTMLElement>('.tv-stage')?.setAttribute('data-video', 'true');
    if (this.localScene) this.applySceneBackground(this.localScene);
    this.lifetime = new AbortController();
    document.addEventListener('visibilitychange', () => {
      this.last = 0;
      if (document.hidden) this.current?.video.pause();
      else if (this.current) this.resume(this.current);
    }, { signal: this.lifetime.signal });
    this.changed();
    const entry = this.entry('idle');
    if (!await entry.loaded || !this.active || generation !== this.generation) {
      if (this.active && generation === this.generation) { this.canvas.dataset.error = 'true'; this.changed(); }
      return;
    }
    this.current = entry; this.ready = true; entry.video.loop = true;
    this.draw(); this.resume(entry); this.changed();
    this.frameRequest = requestAnimationFrame(this.tick);
  }
  stop(): void {
    this.active = false; this.generation++; this.intent++;
    cancelAnimationFrame(this.frameRequest); this.lifetime?.abort();
    this.restoreStage?.(); this.restoreStage = undefined;
    for (const entry of this.entries.values()) this.release(entry);
    this.entries.clear(); this.current = undefined; this.preparing = undefined;
    this.ready = false; this.loadingReactions = false; this.key = 'idle'; this.pending = null;
    this.last = 0; this.idleSeconds = 0; this.drawn = ''; this.transition = undefined;
    this.canvas.getContext('2d')?.clearRect(0, 0, 480, 700);
    for (const key of ['clip', 'frame', 'companion', 'error', 'reactionError', 'cachedVideos']) delete this.canvas.dataset[key];
  }
  prepareReactions(): Promise<boolean> {
    if (!this.active || !this.ready) return Promise.resolve(false);
    if (this.preparing) return this.preparing;
    const generation = this.generation;
    this.loadingReactions = true; delete this.canvas.dataset.reactionError; this.changed();
    this.preparing = Promise.all(this.warmKeys.map(key => this.entry(key).loaded)).then(results => {
      const ok = results.every(Boolean) && this.active && generation === this.generation;
      if (!ok && this.active && generation === this.generation) this.canvas.dataset.reactionError = 'true';
      return ok;
    }).finally(() => {
      if (generation === this.generation) { this.preparing = undefined; this.loadingReactions = this.pending !== null; this.changed(); }
    });
    return this.preparing;
  }
  play(region: TouchRegion): void {
    if (Object.hasOwn(TOUCH_HEARTS, region) && this.count >= TOUCH_HEARTS[region]) {
      if (this.localScene) this.enqueueScene(region);
      else this.enqueue(region === 'hand' && this.clips.hand ? 'hand' : TOUCH_CLIPS[region]);
    }
  }
  scene(clip: TavernSceneClip): void {
    if (this.localScene) {
      if (clip === 'head') this.enqueueScene('talk');
      else if (clip === 'touch') this.enqueueScene('shoulder');
      else if (clip === 'idle') this.enqueueScene('idle');
    } else this.enqueue(clip);
  }
  act(action: Interaction): void {
    if (this.localScene) {
      if (action === 'touch') this.enqueueScene('shoulder');
      else if (action === 'talk' || action === 'gift') this.enqueueScene(action);
    } else this.enqueue(action === 'talk' ? 'head' : this.count >= 2 ? 'joy' : 'touch');
  }
  canGesture(key: string): boolean {
    if (!Object.hasOwn(GESTURE_HEARTS, key)) return false;
    if (!this.localScene) return !!this.clips[key];
    const action = key === 'giggle' ? 'laugh' : key === 'hip' ? 'compliment' : key === 'tease' ? 'tease' : undefined;
    return !!action && !!sceneVideoRole(this.localScene, action);
  }
  gesture(key: string): void {
    if (this.canGesture(key) && this.count >= GESTURE_HEARTS[key]!) {
      if (this.localScene) {
        if (key === 'giggle') this.enqueueScene('laugh');
        else if (key === 'hip') this.enqueueScene('compliment');
        else if (key === 'tease') this.enqueueScene('tease');
      } else this.enqueue(key);
    }
  }
  private enqueueScene(action: SceneAction): void {
    const key = this.localScene && sceneVideoRole(this.localScene, action);
    if (key) this.enqueue(key);
  }
  private applySceneBackground(scene: CompiledTavernSceneVideo): void {
    const stage = this.canvas.closest<HTMLElement>('.tv-stage'); if (!stage) return;
    const previous = ['background-image', 'background-size', 'background-position'].map(name => ({
      name, value: stage.style.getPropertyValue(name), priority: stage.style.getPropertyPriority(name),
    }));
    stage.dataset.videoScene = scene.id;
    stage.style.backgroundImage = `url(${JSON.stringify(scene.background)})`;
    stage.style.backgroundSize = 'cover'; stage.style.backgroundPosition = 'center';
    this.restoreStage = () => {
      if (stage.dataset.videoScene !== scene.id) return;
      for (const { name, value, priority } of previous) {
        if (value) stage.style.setProperty(name, value, priority); else stage.style.removeProperty(name);
      }
      delete stage.dataset.videoScene;
    };
  }
  private entry(key: string): Entry {
    const cached = this.entries.get(key);
    if (cached && !cached.failed && !cached.video.error) return cached;
    if (cached) { this.release(cached); this.entries.delete(key); }
    const clip = this.clips[key]!;
    const video = document.createElement('video');
    video.muted = true; video.defaultMuted = true; video.playsInline = true;
    video.preload = 'auto'; video.disableRemotePlayback = true;
    let cancel = () => {};
    const loaded = new Promise<boolean>(resolve => {
      let settled = false;
      const finish = (ok: boolean) => {
        if (settled) return; settled = true; clearTimeout(timeout);
        video.removeEventListener('loadeddata', available); video.removeEventListener('error', failed);
        resolve(ok);
      };
      const available = () => finish(video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA);
      const failed = () => finish(false);
      const timeout = setTimeout(failed, 15000);
      cancel = () => finish(false);
      video.addEventListener('loadeddata', available); video.addEventListener('error', failed);
    });
    const entry: Entry = { video, loaded, cancel, failed: false };
    void loaded.then(ok => { entry.failed = !ok; });
    video.addEventListener('ended', () => {
      if (this.active && this.current === entry && !this.pending && this.key !== 'idle') this.enqueue('idle');
    });
    video.addEventListener('error', () => {
      if (this.active && this.current === entry) { this.canvas.dataset.reactionError = 'true'; this.changed(); }
    });
    this.entries.set(key, entry);
    video.src = this.localScene ? this.localScene.clips[key as keyof typeof this.localScene.clips]!.url
      : urls[`../assets/tavern-video/${clip.file}`]!;
    video.load();
    this.prune(); return entry;
  }
  private release(entry: Entry): void {
    entry.cancel(); entry.video.pause(); entry.video.removeAttribute('src'); entry.video.load();
  }
  private prune(): void {
    const keep = new Set(['idle', ...this.warmKeys, this.key, this.pending]);
    for (const [key, entry] of this.entries) if (!keep.has(key)) { this.release(entry); this.entries.delete(key); }
    this.canvas.dataset.cachedVideos = String(this.entries.size);
  }
  private resume(entry: Entry): void {
    if (document.hidden) return;
    const generation = this.generation;
    void entry.video.play().catch(error => {
      // Hiding the tab or replacing a reaction pauses an in-flight play().
      // That normal cancellation is not a failed media load.
      if (error instanceof DOMException && error.name === 'AbortError') return;
      if (this.active && generation === this.generation && this.current === entry) {
        this.canvas.dataset.reactionError = 'true'; this.changed();
      }
    });
  }
  private enqueue(key: string): void {
    if (!this.active || !this.ready || !this.clips[key]) return;
    this.pending = key; this.idleSeconds = 0; const intent = ++this.intent, generation = this.generation;
    this.loadingReactions = true; delete this.canvas.dataset.reactionError; this.changed();
    const entry = this.entry(key);
    void entry.loaded.then(ok => {
      if (!this.active || generation !== this.generation || intent !== this.intent) return;
      this.pending = null; this.loadingReactions = false;
      if (!ok) {
        // A finished reaction may have held its final frame while this file loaded.
        if (this.current?.video.ended && this.key !== 'idle') this.enqueue('idle');
        this.canvas.dataset.reactionError = 'true'; this.prune(); this.changed(); return;
      }
      const image = document.createElement('canvas'); image.width = 480; image.height = 700;
      image.getContext('2d')?.drawImage(this.canvas, 0, 0);
      this.transition = matchMedia('(prefers-reduced-motion: reduce)').matches ? undefined : { image, elapsed: 0 };
      this.current?.video.pause(); this.current = entry; this.key = key;
      entry.video.loop = key === 'idle'; entry.video.currentTime = 0;
      this.drawn = ''; this.idleSeconds = 0; this.draw(); this.resume(entry);
      this.prune(); this.changed();
    });
  }
  private tick = (now: number): void => {
    this.frameRequest = requestAnimationFrame(this.tick);
    const dt = this.last ? Math.min(.1, (now - this.last) / 1000) : 0; this.last = document.hidden ? 0 : now;
    if (!this.active || !this.ready || document.hidden) return;
    if (this.transition) {
      this.transition.elapsed += dt;
      if (this.transition.elapsed >= .12) this.transition = undefined;
    }
    if (this.key === 'idle' && !this.pending && !this.current?.video.paused) {
      this.idleSeconds += dt;
      if (!this.localScene && this.count >= 2 && this.idleSeconds >= (this.who === 'mara' ? 15 : 18)) this.enqueue('variant');
    }
    this.draw();
  };
  private draw(): void {
    const entry = this.current, clip = this.clips[this.key];
    if (!entry || !clip || entry.video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) return;
    const stage = this.canvas.closest<HTMLElement>('.tv-stage');
    if (stage) stage.style.setProperty('--video-room-shift', `${(stage.clientWidth - this.canvas.clientWidth) * .1}px`);
    const frame = Math.min(clip.frames - 1, Math.floor(entry.video.currentTime * clip.fps));
    const stamp = `${this.key}:${frame}`;
    if (stamp === this.drawn && !this.transition) return;
    const ctx = this.canvas.getContext('2d'); if (!ctx) return;
    ctx.clearRect(0, 0, 480, 700); ctx.imageSmoothingEnabled = true;
    ctx.drawImage(entry.video, 0, 2, 480, 700, 0, 0, 480, 700);
    if (this.transition) {
      const { image, elapsed } = this.transition;
      ctx.save();
      ctx.globalAlpha = Math.max(0, 1 - elapsed / .12); ctx.drawImage(image, 0, 0);
      ctx.restore();
    }
    this.drawn = stamp; this.canvas.dataset.clip = this.key; this.canvas.dataset.frame = String(frame);
  }
}

export const videoPresentation: TavernPresentation = {
  kind: 'rigged',
  create: (canvas, changed) => new TavernVisitPlayer(canvas, changed),
  portrait: who => posters[who],
  async drawPortrait(canvas, who) {
    const image = new Image(); image.src = portraits[who]; await image.decode();
    canvas.getContext('2d')?.drawImage(image, 0, 0, canvas.width, canvas.height);
  },
  // M09/I08 react with the image-left hand; coordinates include the two-pixel crop.
  anchors: who => Object.hasOwn(manifest.heroes[who], 'hand')
    ? { ...TAVERN_ANCHORS(who), hand: who === 'mara' ? { x: 117, y: 590 } : { x: 102, y: 568 } }
    : TAVERN_ANCHORS(who),
  gestures: TAVERN_GESTURES,
};

/** Opt-in preview factory. Undelivered sets stay unavailable; main keeps videoPresentation. */
export function createSceneVideoPresentation(config: TavernSceneVideoConfig): TavernPresentation | undefined {
  const scene = compileTavernSceneVideo(config, sceneUrls); if (!scene) return;
  return {
    kind: 'rigged',
    create: (canvas, changed) => new TavernVideoPlayer(canvas, changed, config),
    portrait: who => who === scene.companion ? scene.poster : '',
    async drawPortrait(canvas, who) {
      if (who !== scene.companion) return;
      const image = new Image(); image.src = scene.poster; await image.decode();
      canvas.getContext('2d')?.drawImage(image, 0, 0, canvas.width, canvas.height);
    },
    anchors: () => scene.anchors,
    gestures: TAVERN_GESTURES,
  };
}
