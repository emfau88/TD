// Decoded images are much larger than WebP downloads. Bound ready AND queued
// entries; two download slots bound contention on mobile connections.
export type AtlasEntry = {
  image: HTMLImageElement;
  state: 'queued' | 'loading' | 'ready' | 'failed' | 'cancelled';
  promise: Promise<boolean>;
  priority: number;
  resolve: (ready: boolean) => void;
  cancel?: () => void;
};

export class TavernAtlasCache {
  private entries = new Map<string, AtlasEntry>();
  private pinned = new Set<string>();
  private running = 0;
  private clearing = false;
  constructor(readonly limit = 14, private timeoutMs = 5000, private retryMs = 250) {}
  get size() { return this.entries.size; }
  peek(url: string) { return this.entries.get(url); }
  pin(urls: Iterable<string>) { this.pinned = new Set(urls); }
  retainLoads(urls: Iterable<string>) {
    const keep = new Set(urls);
    this.clearing = true;
    for (const [url, entry] of this.entries) if (!keep.has(url) && (entry.state === 'queued' || entry.state === 'loading')) this.remove(url, entry);
    this.clearing = false; this.pump();
  }
  request(url: string, priority = 0): AtlasEntry {
    const cached = this.entries.get(url);
    if (cached) {
      cached.priority = Math.max(cached.priority, priority);
      this.entries.delete(url); this.entries.set(url, cached);
      this.pump(); return cached;
    }
    while (this.entries.size >= this.limit) {
      const victim = [...this.entries].find(([key]) => !this.pinned.has(key));
      if (!victim) throw Error('Atlas working set exceeds cache budget');
      this.remove(...victim);
    }
    let resolve!: (ready: boolean) => void;
    const entry: AtlasEntry = { image: new Image(), state: 'queued', priority, promise: new Promise(done => { resolve = done; }), resolve: ready => resolve(ready) };
    this.entries.set(url, entry); this.pump(); return entry;
  }
  clear() { this.clearing = true; for (const [url, entry] of this.entries) this.remove(url, entry); this.pinned.clear(); this.clearing = false; }
  private remove(url: string, entry: AtlasEntry) {
    this.entries.delete(url);
    if (entry.state === 'loading') entry.cancel?.();
    else if (entry.state === 'queued') { entry.state = 'cancelled'; entry.resolve(false); }
  }
  private pump() {
    if (this.clearing) return;
    while (this.running < 2) {
      const next = [...this.entries].filter(([, entry]) => entry.state === 'queued').sort((a, b) => b[1].priority - a[1].priority)[0];
      if (!next) return;
      this.load(...next);
    }
  }
  private load(url: string, entry: AtlasEntry) {
    this.running++; entry.state = 'loading';
    let attempt = 0, timer: ReturnType<typeof setTimeout>, settled = false;
    const clean = () => { clearTimeout(timer); entry.image.onload = entry.image.onerror = null; };
    const finish = (state: AtlasEntry['state']) => {
      if (settled) return;
      settled = true; clean(); entry.state = state; this.running--;
      // Never retain a rejected promise as a permanent negative cache entry.
      if (state !== 'ready' && this.entries.get(url) === entry) this.entries.delete(url);
      entry.resolve(state === 'ready'); this.pump();
    };
    entry.cancel = () => { clean(); entry.image.removeAttribute('src'); finish('cancelled'); };
    const start = () => {
      attempt++;
      const image = entry.image = new Image();
      let ended = false;
      const fail = () => {
        if (settled || ended) return;
        ended = true; clean(); image.removeAttribute('src');
        if (attempt < 2) timer = setTimeout(start, this.retryMs);
        else finish('failed');
      };
      image.decoding = 'async'; image.fetchPriority = entry.priority > 0 ? 'high' : 'low';
      image.onload = async () => {
        try { await image.decode(); } catch { fail(); return; }
        if (settled || ended) return;
        ended = true; finish('ready');
      };
      image.onerror = fail;
      timer = setTimeout(fail, this.timeoutMs); image.src = url;
    };
    start();
  }
}
