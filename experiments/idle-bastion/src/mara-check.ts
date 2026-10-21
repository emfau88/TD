import './mara-check.css';
import atlasUrl from '../assets/runtime/mara-atlas.webp';
import metadata from '../assets/mara-tavern/mara-atlas.json';
import metadataUrl from '../assets/mara-tavern/mara-atlas.json?url';

const get = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;
const canvas = get<HTMLCanvasElement>('mara');
const ctx = canvas.getContext('2d')!;
const stage = get<HTMLDivElement>('stage');
const touch = get<HTMLButtonElement>('touch');
const shoulder = get<HTMLButtonElement>('shoulder');
const pause = get<HTMLButtonElement>('pause');
const slider = get<HTMLInputElement>('frame');
const line = get<HTMLParagraphElement>('line');
const status = get<HTMLSpanElement>('state');
const hint = get<HTMLSpanElement>('hint');
const image = new Image();
get<HTMLAnchorElement>('atlas-link').href = atlasUrl;
get<HTMLAnchorElement>('metadata-link').href = metadataUrl;
let ready = false;
let paused = false;
let mode: 'idle' | 'touch' = 'idle';
let elapsed = 0;
let last = 0;
let displayed = -1;
let request = 0;
const clips = { idle: metadata.idle, touch: metadata.touch };
const duration = (clip: number[][]) => clip.reduce((sum, entry) => sum + entry[1]!, 0);

function draw(index: number) {
  if (index === displayed) return;
  const frame = metadata.frames[index]!;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.imageSmoothingEnabled = false;
  // Registration only: every frame keeps its original scale and drawn anatomy.
  ctx.drawImage(image, frame.x, frame.y, frame.width, frame.height,
    metadata.canvas.anchorX - frame.anchorX, metadata.canvas.anchorY - frame.anchorY,
    frame.width, frame.height);
  displayed = index;
  canvas.dataset.frame = String(index);
  slider.value = String(index);
  get<HTMLOutputElement>('frame-number').value = `${index + 1} / ${metadata.frames.length}`;
}
function sync() {
  touch.disabled = !ready || mode === 'touch';
  shoulder.disabled = !ready || mode === 'touch';
  pause.disabled = !ready;
  slider.disabled = !ready;
  pause.textContent = paused ? 'Animation fortsetzen' : 'Animation pausieren';
  pause.setAttribute('aria-pressed', String(paused));
  status.textContent = paused ? 'Pausiert' : mode === 'touch' ? 'Berührung' : 'Ruhe';
  hint.textContent = mode === 'touch' ? 'Mara reagiert auf deine Berührung' : 'Tippe auf die markierte Schulter';
}
function trigger() {
  if (!ready || mode === 'touch') return;
  mode = 'touch'; elapsed = 0; paused = false; last = 0;
  line.textContent = 'He … du hättest auch einfach meinen Namen sagen können.';
  draw(0); sync();
}
function tick(now: number) {
  request = 0;
  if (document.hidden) { last = 0; return; }
  if (!paused && ready) {
    if (last) elapsed += Math.min(now - last, 80);
    const total = duration(clips[mode]);
    if (elapsed >= total) {
      if (mode === 'touch') { mode = 'idle'; elapsed = 0; line.textContent = 'Na gut. Für dich mache ich eine kleine Pause.'; sync(); }
      else elapsed %= total;
    }
    let remaining = elapsed;
    for (const [index, ms] of clips[mode]) {
      if (remaining < ms!) { draw(index!); break; }
      remaining -= ms!;
    }
  }
  last = now;
  request = requestAnimationFrame(tick);
}
function positionHotspot() {
  const bounds = canvas.getBoundingClientRect();
  const parent = stage.getBoundingClientRect();
  shoulder.style.left = `${bounds.left - parent.left + bounds.width * 258 / 384}px`;
  shoulder.style.top = `${bounds.top - parent.top + bounds.height * 232 / 512}px`;
}
touch.addEventListener('click', trigger);
shoulder.addEventListener('click', trigger);
pause.addEventListener('click', () => { paused = !paused; last = 0; sync(); });
slider.addEventListener('input', () => {
  paused = true; mode = 'idle'; elapsed = 0; last = 0;
  draw(Number(slider.value)); sync();
});
new ResizeObserver(positionHotspot).observe(stage);
document.addEventListener('visibilitychange', () => {
  last = 0;
  if (document.hidden) { cancelAnimationFrame(request); request = 0; }
  else if (ready && !request) request = requestAnimationFrame(tick);
});
image.onload = () => {
  if (image.naturalWidth !== metadata.width || image.naturalHeight !== metadata.height) { fail(); return; }
  ready = true; draw(0); sync(); positionHotspot();
  if (!document.hidden) request = requestAnimationFrame(tick);
};
function fail() {
  const error = get<HTMLParagraphElement>('error');
  error.hidden = false;
  error.textContent = 'Die Animation konnte nicht geladen werden. Bitte lade die Vorschau erneut.';
  status.textContent = 'Ladefehler';
}
image.onerror = fail;
image.src = atlasUrl;
