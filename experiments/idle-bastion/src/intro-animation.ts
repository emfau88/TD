export interface IntroAnimation {
  frames: number; fps: number; width: number; height: number;
  columns: number; perPage: number; pages: string[];
}

/** Silent transparent portraits: play once, then retain the final canvas pixels.
 * Loading and playback never gate the intro buttons or touch saved progress. */
export class IntroPortraitPlayer {
  private step: number | undefined;
  private generation = 0;
  private request = 0;
  private paused = false;
  private previous: number | undefined;
  private elapsed = 0;
  private pages: HTMLImageElement[] = [];
  private clip: IntroAnimation | undefined;
  private context: CanvasRenderingContext2D | null;

  constructor(private canvas: HTMLCanvasElement, private poster: HTMLImageElement,
    private clips: readonly IntroAnimation[], private load = loadPage) {
    this.context = canvas.getContext('2d');
  }

  show(step?: number): void {
    if (this.step === step) return;
    this.stop();
    this.step = step;
    const clip = step === undefined ? undefined : this.clips[step];
    if (!clip || !this.context || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const generation = this.generation;
    this.canvas.dataset.state = 'loading';
    void Promise.all(clip.pages.map(this.load)).then(pages => {
      if (generation !== this.generation) return;
      if (pages.some(page => !page || page.naturalWidth < clip.columns * clip.width || page.naturalHeight < Math.ceil(clip.perPage / clip.columns) * clip.height)) {
        this.canvas.dataset.state = 'fallback'; return;
      }
      this.pages = pages as HTMLImageElement[];
      this.clip = clip;
      this.canvas.width = clip.width; this.canvas.height = clip.height;
      this.draw(0);
      this.poster.hidden = true; this.canvas.hidden = false;
      this.canvas.dataset.state = 'playing';
      this.request = requestAnimationFrame(this.tick);
    }).catch(() => { if (generation === this.generation) this.canvas.dataset.state = 'fallback'; });
  }

  setPaused(paused: boolean): void {
    if (this.paused !== paused) this.previous = undefined;
    this.paused = paused;
  }

  stop(): void {
    ++this.generation;
    cancelAnimationFrame(this.request); this.request = 0;
    this.step = undefined; this.clip = undefined; this.pages = [];
    this.previous = undefined; this.elapsed = 0;
    this.canvas.hidden = true; this.poster.hidden = false;
    this.canvas.dataset.state = 'static'; delete this.canvas.dataset.frame;
  }

  private tick = (now: number): void => {
    const clip = this.clip;
    if (!clip) return;
    if (!this.paused) {
      if (this.previous !== undefined) this.elapsed += Math.max(0, now - this.previous);
      this.previous = now;
      this.draw(Math.min(clip.frames - 1, Math.floor(this.elapsed * clip.fps / 1000)));
      if (this.elapsed >= clip.frames / clip.fps * 1000) {
        this.canvas.dataset.state = 'held';
        this.pages = []; this.clip = undefined; this.request = 0;
        return;
      }
    }
    this.request = requestAnimationFrame(this.tick);
  };

  private draw(frame: number): void {
    if (this.canvas.dataset.frame === String(frame)) return;
    const clip = this.clip!, local = frame % clip.perPage;
    this.context!.clearRect(0, 0, clip.width, clip.height);
    this.context!.drawImage(this.pages[Math.floor(frame / clip.perPage)],
      local % clip.columns * clip.width, Math.floor(local / clip.columns) * clip.height,
      clip.width, clip.height, 0, 0, clip.width, clip.height);
    this.canvas.dataset.frame = String(frame);
  }
}

function loadPage(url: string): Promise<HTMLImageElement | null> {
  return new Promise(resolve => {
    const image = new Image();
    let settled = false;
    const done = (ok: boolean) => {
      if (settled) return;
      settled = true; clearTimeout(timer); image.onload = image.onerror = null;
      resolve(ok ? image : null);
    };
    const timer = window.setTimeout(() => done(false), 5000);
    image.onload = () => { void image.decode().then(() => done(true), () => done(false)); };
    image.onerror = () => done(false);
    image.src = url;
  });
}
