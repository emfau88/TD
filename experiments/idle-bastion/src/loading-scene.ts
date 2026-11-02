import forestMobile from '../assets/loading/scene/forest-mobile.webp';
import forestDesktop from '../assets/loading/scene/forest-desktop.webp';
import campMobile from '../assets/loading/scene/camp-wide-mobile.webp';
import campDesktop from '../assets/loading/scene/camp-wide-desktop.webp';
import campPortrait from '../assets/loading/scene/camp-portrait-mobile.webp';
import fireAtlas from '../assets/loading/scene/fire-atlas.webp';
import cloud from '../assets/loading/scene/cloud.webp';
import { startupLanguage, startupText } from './locales/startup';

/** Decorative only: never awaited by startup and never changes its progress or readiness. */
export function mountLoadingScene(): () => void {
  const host = document.getElementById('boot-screen');
  const canvas = host?.querySelector<HTMLCanvasElement>('#boot-fire');
  const button = host?.querySelector<HTMLButtonElement>('#boot-motion');
  if (!host || !canvas || !button) return () => {};
  const ctx = canvas.getContext('2d');
  const lights = host.querySelectorAll<HTMLElement>('.boot-fire-light,.boot-ground-light');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const portrait = matchMedia('(orientation: portrait)');
  const connection = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
  const economical = connection?.saveData || /^(slow-)?2g$/.test(connection?.effectiveType ?? '');
  let moving = !reduced.matches, disposed = false, raf = 0, lastFrame = -1, lastLight = 0;
  let requests = new AbortController(), atlas: HTMLImageElement | undefined;
  const pending = new Set<string>();
  const embers = Array.from({ length: 24 }, () => {
    const ember = document.createElement('i'); ember.className = 'boot-ember';
    host.querySelector('.boot-embers')?.append(ember); return ember;
  });
  const active = () => !disposed && !host.hidden && !document.hidden && host.dataset.phase !== 'error';

  function placeEmbers() {
    if (!active()) return;
    // Match the forest's object-fit/object-position in source-image coordinates.
    // The cloud's entire short path stays inside empty sky, clear of tree canopies.
    const forest = host!.querySelector<HTMLElement>('#boot-forest')!;
    const sky = host!.querySelector<HTMLElement>('.boot-sky')!;
    const scale = Math.max(forest.clientWidth / 1671, forest.clientHeight / 941);
    const width = 1671 * scale, height = 941 * scale;
    sky.style.cssText = `width:${width}px;height:${height}px;left:${(forest.clientWidth - width) * (portrait.matches ? .7 : .5)}px;top:${(forest.clientHeight - height) * (portrait.matches ? .5 : .52)}px`;
    const fire = canvas!.getBoundingClientRect(), title = host!.querySelector('.boot-copy')!.getBoundingClientRect();
    const maxRise = Math.max(35, fire.y + fire.height * .38 - title.bottom - 14);
    embers.forEach((ember, i) => {
      const f = (i * .61803398875) % 1, large = i === 7 || i === 19;
      const rise = Math.min(maxRise, fire.width * (.85 + f * .95)), drift = Math.sin(i * 2.4) * fire.width * .25;
      ember.classList.toggle('boot-ember-large', large);
      ember.style.cssText = `--start:${(f - .5) * fire.width * .18}px;--bend:${drift * .25 + Math.sin(i) * 12}px;--drift:${drift}px;--rise:${-rise}px;--mid-rise:${-rise * .5}px;--size:${large ? 4.5 : 2.1 + f * 1.2}px;--duration:${large ? 7 + f * 2 : 3.1 + f * 2.2}s;--delay:${-i * .57}s`;
    });
  }

  // Low-priority, cancellable requests. Failure leaves the complete inline scene intact.
  async function image(url: string, signal: AbortSignal): Promise<HTMLImageElement | undefined> {
    let objectUrl: string | undefined;
    try {
      const response = await fetch(url, { signal, priority: 'low' });
      if (!response.ok) return;
      objectUrl = URL.createObjectURL(await response.blob());
      const result = new Image(); result.alt = ''; result.src = objectUrl;
      await result.decode();
      if (!signal.aborted && active()) return result;
    } catch { /* Optional art must never fail or delay the real game loader. */ }
    finally { if (objectUrl) URL.revokeObjectURL(objectUrl); }
  }

  async function detail(id: string, url: string) {
    const container = host!.querySelector<HTMLElement>(id)!;
    const previous = container.querySelector<HTMLImageElement>('.boot-hi');
    if (previous?.dataset.source === url) return;
    previous?.remove(); // On rotation the inline picture already has the correct composition.
    if (pending.has(url)) return;
    pending.add(url);
    const signal = requests.signal;
    const result = await image(url, signal);
    pending.delete(url);
    if (!result || signal.aborted) return;
    result.className = 'boot-hi'; result.dataset.source = url;
    container.append(result);
    // Force the initial transparent state before fading the decoded layer in.
    result.getBoundingClientRect(); result.classList.add('is-ready');
  }

  function enhance() {
    if (!active() || economical) return;
    const small = innerWidth <= 1000 || matchMedia('(pointer: coarse)').matches;
    void detail('#boot-forest', small ? forestMobile : forestDesktop);
    void detail('#boot-camp-art', portrait.matches ? campPortrait : small ? campMobile : campDesktop);
    void detail('#boot-cloud', cloud);
    if (ctx && moving && !atlas && !pending.has(fireAtlas)) {
      pending.add(fireAtlas);
      const signal = requests.signal;
      void image(fireAtlas, signal).then(result => {
        pending.delete(fireAtlas);
        if (!result || signal.aborted) return;
        atlas = result; lastFrame = -1; draw(0);
      });
    }
  }
  function draw(frame: number) {
    if (!ctx || !atlas || lastFrame === frame) return;
    const width = atlas.naturalWidth / 4, height = atlas.naturalHeight / 2;
    ctx.clearRect(0, 0, 256, 256);
    ctx.drawImage(atlas, frame % 4 * width, Math.floor(frame / 4) * height, width, height, 0, 0, 256, 256);
    lastFrame = frame; host!.dataset.fireReady = '';
  }
  function loop(now: number) {
    raf = 0;
    if (!active() || !moving) return;
    draw(Math.floor(now / 115) % 8);
    if (now - lastLight > 33) {
      const opacity = String(.55 + .10 * Math.sin(now * .006) + .06 * Math.sin(now * .017));
      lights.forEach(light => { light.style.opacity = opacity; });
      lastLight = now;
    }
    raf = requestAnimationFrame(loop);
  }
  function sync() {
    const run = active();
    host!.toggleAttribute('data-motion', run && moving);
    button!.hidden = !run;
    button!.setAttribute('aria-pressed', String(moving));
    button!.setAttribute('aria-label', startupText(moving ? 'Animation anhalten' : 'Animation abspielen', startupLanguage()));
    cancelAnimationFrame(raf); raf = 0;
    if (!run) {
      requests.abort(); requests = new AbortController(); pending.clear();
      return;
    }
    placeEmbers();
    // Give the inline scene its first paint; optional art must not postpone it.
    raf = requestAnimationFrame(() => {
      raf = requestAnimationFrame(() => { raf = 0; enhance(); if (moving) loop(performance.now()); });
    });
  }
  const toggle = () => { moving = !moving; sync(); };
  const preference = () => { moving = !reduced.matches; sync(); };
  const rotate = () => { requests.abort(); requests = new AbortController(); pending.clear(); sync(); };
  const observer = new MutationObserver(sync);
  observer.observe(host, { attributes: true, attributeFilter: ['hidden', 'data-phase'] });
  const resize = new ResizeObserver(placeEmbers); resize.observe(canvas);
  button.addEventListener('click', toggle);
  reduced.addEventListener('change', preference);
  portrait.addEventListener('change', rotate);
  document.addEventListener('visibilitychange', sync);
  void document.fonts.ready.then(() => { if (!disposed) placeEmbers(); });
  sync();
  return () => {
    disposed = true; sync(); observer.disconnect(); resize.disconnect();
    button.removeEventListener('click', toggle); reduced.removeEventListener('change', preference);
    portrait.removeEventListener('change', rotate); document.removeEventListener('visibilitychange', sync);
    embers.forEach(ember => ember.remove());
  };
}
