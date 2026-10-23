import type { Companion } from './tavern-social';

// Original local exports for the optional compression A/B comparison only.
const packageUrl = new URL('../../../artifacts/idle-bastion/tavern-hearts-0-2/manifest.json', import.meta.url).href;
const maraUrl = new URL('../../../artifacts/idle-bastion/mara-proportions-v1/reactions-v1/preview/manifest.json', import.meta.url).href;
const hipUrl = new URL('../../../artifacts/idle-bastion/ilyra-rig-prep/hip-base-v2/hip-hand-v2/preview/manifest.json', import.meta.url).href;
type Clip = { count: number; fps: number; pages: string[]; restFrames: number[]; width: number; height: number; placement: [number, number, number, number] };
type Clips = Record<string, Clip>;
type Entry = { image: HTMLImageElement; ready: boolean; failed: boolean; promise: Promise<boolean> };
async function json(url: string) { const response = await fetch(url, { cache: 'no-store' }); if (!response.ok) throw Error('Animationsdaten fehlen'); return response.json(); }
export async function sourceClips(who: Companion): Promise<Clips> {
  const manifest = await json(packageUrl), clips: Clips = {};
  for (const [key, value] of Object.entries(manifest.heroes[who]) as [string, Clip][]) {
    clips[key] = { ...value, pages: value.pages.map(page => new URL(page, packageUrl).href), width: 480, height: 800, placement: [0, 0, 480, 800] };
  }
  if (who === 'mara') {
    const extra = await json(maraUrl);
    for (const key of ['hip', 'tease']) {
      const clip = extra.clips[key];
      clips[key] = { count: clip.count, fps: 30, restFrames: [0], pages: clip.versions.after.pages.map((page: string) => new URL(page, maraUrl).href), width: 768, height: 1024, placement: [-48, 16, 576, 768] };
    }
  } else {
    const hip = await json(hipUrl);
    // Align the separate drawing by its belt centre; never stretch individual body parts.
    clips.hip = { count: hip.frames, fps: hip.fps, restFrames: [0], pages: hip.sheets.map((page: string) => new URL(page, hipUrl).href), width: 768, height: 1280, placement: [-7, -5, 480, 800] };
  }
  // Keep the same offset throughout each character's clips. The smallest painted
  // leg endings are y=758 (Mara) and y=740 (Ilyra), leaving 10 px below the canvas.
  for (const clip of Object.values(clips)) clip.placement[1] -= who === 'mara' ? 48 : 30;
  return clips;
}
