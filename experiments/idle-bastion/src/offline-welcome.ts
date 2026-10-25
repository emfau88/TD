import { t } from './i18n';

export const MARA_OFFLINE_WELCOME = 'Da bist du ja! Ich habe auf dein Gold aufgepasst. Nachgezählt habe ich es nur dreimal. Na gut, viermal.';

/** Presentation only; the session owns the persisted once-per-save decision. */
export function updateOfflineWelcome(container: HTMLElement, visible: boolean, portrait: string): void {
  container.hidden = !visible;
  if (!visible) return;
  const image = container.querySelector<HTMLImageElement>('img')!;
  if (image.getAttribute('src') !== portrait) image.src = portrait;
  container.querySelector<HTMLElement>('[data-mara-welcome-copy]')!.textContent = t(MARA_OFFLINE_WELCOME);
}
