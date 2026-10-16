import type { Assets } from './scene';

declare global {
  interface Window {
    __SPIRE_BUNDLE__?: { manifest: Assets; images: Record<string, string>; uiImages?: Record<string, string> };
  }
}

export function assetUrl(name: string): string {
  return window.__SPIRE_BUNDLE__?.images[name] ?? new URL(`assets/${encodeURIComponent(name)}.png`, document.baseURI).href;
}

export function uiAssetUrl(filename: string): string {
  return window.__SPIRE_BUNDLE__?.uiImages?.[filename] ?? new URL(`ui/${encodeURIComponent(filename)}`, document.baseURI).href;
}

export async function loadAssets(): Promise<Assets> {
  if (window.__SPIRE_BUNDLE__) return window.__SPIRE_BUNDLE__.manifest;
  const response = await fetch(new URL('assets/manifest.json', document.baseURI));
  if (!response.ok) throw new Error('Die Spieldateien konnten nicht geladen werden.');
  return response.json();
}
