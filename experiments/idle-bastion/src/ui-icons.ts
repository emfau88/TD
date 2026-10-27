/** Small, consistent SVG controls; raster material art lives in assets/ui. */
const shapes: Record<string, string> = {
  grove: '<path fill="#a78655" d="M8 13h4v8H8z"/><path fill="#70955d" d="M8 1h4v2h3v3h3v4h-2v4H4v-4H2V6h3V3h3z"/><path fill="#c0c78c" d="M8 2h4v2H8zM5 5h3v3H5z"/><path fill="#d8bd7b" d="M14 15h3v-2l3 4-3 4v-2h-3z"/>',
  tower: '<path fill="#c6ad75" d="M3 2h3v4h3V2h3v4h3V2h3v7h-2v8h2v3H3v-3h2V9H3z"/><path fill="#fff0b8" d="M3 2h3v2H3zm6 0h3v2H9zm6 0h3v2h-3z"/><path fill="#243238" d="M9 13h3v7H9zM8 8h5v3H8z"/>',
  house: '<path fill="#9e7d48" d="M1 9 10 1l9 8v3h-3v8H4v-8H1z"/><path fill="#efce8b" d="m2 9 8-7 8 7v2l-8-7-8 7zM5 11h10v8H5z"/><path fill="#243238" d="M8 13h4v7H8z"/>',
  damage: '<path fill="#809da5" d="M13 2h5v5l-7 7-5-5z"/><path fill="#e2e9d8" d="M15 3h2v3l-7 7-2-2z"/><path fill="#d8b16f" d="m4 8 8 8-2 2-8-8z"/><path fill="#a86f4d" d="m5 13 3 3-4 4-3-3z"/><path fill="#efce8b" d="m2 17 3 3-2 2-3-3z"/>',
  cooldown: '<path fill="#c6ad75" d="M3 2h14v3H3zm0 16h14v3H3z"/><path fill="#7eacb4" d="M5 5h10v3l-4 3v1l4 3v3H5v-3l4-3v-1L5 8z"/><path fill="#efce8b" d="M7 6h6v1l-3 3-3-3zm3 7 3 3v1H7v-1z"/>',
  heart: '<path fill="#7a3036" d="M1 3h7l2 2 2-2h7v10l-9 8-9-8z"/><path fill="#dd635e" d="M2 3h6l2 3 2-3h6v8l-8 8-8-8z"/><path fill="#ffc8a0" d="M3 4h4v2H5v3H3z"/>',
  skull: '<path fill="#d9d4b9" d="M5 1h10v2h3v11h-3v5h-3v-2H8v2H5v-5H2V3h3z"/><path fill="#fff0cd" d="M5 1h10v2H5z"/><path fill="#283137" d="M4 7h5v5H4zm8 0h4v5h-4zm-3 6h3v3H9z"/>',
  book: '<path fill="#8c7249" d="M1 2h7l2 2 2-2h7v16h-7l-2 2-2-2H1z"/><path fill="#e3c792" d="M2 3h6l1 2v12l-1-1H2zm10 0h6v13h-6l-1 1V5z"/><path fill="#7a6446" d="M4 6h3v1H4zm0 3h3v1H4zm9-3h3v1h-3zm0 3h3v1h-3z"/>',
  fullscreen: '<path fill="currentColor" d="M2 2h6v2H4v4H2zm10 0h6v6h-2V4h-4zM2 12h2v4h4v2H2zm14 0h2v6h-6v-2h4z"/>',
  menu: '<path fill="currentColor" d="M3 4h14v2H3zm0 5h14v2H3zm0 5h14v2H3z"/>',
  target: '<path fill="currentColor" d="M9 1h2v3h4v2h2v3h3v2h-3v4h-2v2h-4v3H9v-3H5v-2H3v-4H0V9h3V6h2V4h4zM5 6v8h4v-3H7V9h2V6zm6 0v3h2v2h-2v3h4V6z"/>',
  zoom: '<path class="zoom-plus" fill="currentColor" d="M9 3h2v6h6v2h-6v6H9v-6H3V9h6z"/><path class="zoom-minus" fill="currentColor" d="M3 9h14v2H3z"/>',
  close: '<path fill="currentColor" d="m4 3 6 6 6-6 1 1-6 6 6 6-1 1-6-6-6 6-1-1 6-6-6-6z"/>',
};
/** Decorative markup shared by static controls and refreshed tower values. */
export function uiIcon(name: string): string {
  const shape = shapes[name];
  return shape ? `<svg viewBox="0 0 20 22" aria-hidden="true" focusable="false" shape-rendering="crispEdges">${shape}</svg>` : '';
}
export function mountUIIcons(): void {
  for (const host of Array.from(document.querySelectorAll<HTMLElement>('[data-ui-icon]'))) {
    const icon = uiIcon(host.dataset.uiIcon ?? '');
    if (icon) host.innerHTML = icon;
  }
}