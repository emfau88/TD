import audioCredits from '../audio-credits.html?raw';
import enemyCredits from '../enemy-credits.html?raw';
import { t } from './i18n';
import './credits-ui.css';

/** Render the same bundled credits as the standalone pages, without leaving the game. */
export function mountCredits(signal: AbortSignal): void {
  const dialog = document.createElement('dialog');
  dialog.id = 'credits-dialog';
  dialog.setAttribute('aria-labelledby', 'credits-title');
  dialog.innerHTML = '<header class="context-header"><h2 id="credits-title"></h2><button type="button" class="icon-button" autofocus>×</button></header><div class="credits-content" lang="de" tabindex="0"></div>';
  document.body.append(dialog);
  const title = dialog.querySelector('h2')!;
  const close = dialog.querySelector('button')!;
  const content = dialog.querySelector<HTMLElement>('.credits-content')!;
  close.addEventListener('click', () => dialog.close(), { signal });
  for (const button of document.querySelectorAll<HTMLButtonElement>('[data-credits]')) {
    button.addEventListener('click', () => {
      const audio = button.dataset.credits === 'audio';
      title.textContent = t(audio ? 'Audioquellen & Lizenzen' : 'Gegnergrafiken & Lizenzen');
      close.setAttribute('aria-label', t('Credits schließen'));
      const page = new DOMParser().parseFromString(audio ? audioCredits : enemyCredits, 'text/html');
      // Only the authored credit content is included, never standalone page navigation.
      content.replaceChildren(...page.querySelector('[data-credit-content]')!.childNodes);
      for (const link of content.querySelectorAll('a')) {
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
      }
      dialog.showModal();
      content.scrollTop = 0;
    }, { signal });
  }
  signal.addEventListener('abort', () => dialog.remove(), { once: true });
}
