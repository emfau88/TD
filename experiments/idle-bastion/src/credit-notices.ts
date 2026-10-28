import notices from '../docs/SOURCES_AND_LICENSES.txt?raw';
import { t } from './i18n';

/** Full bundled notices, readable locally without external navigation. */
export function populateCreditNotices(root: ParentNode): void {
  for (const node of root.querySelectorAll('[data-license-notices]')) node.textContent = notices;
  for (const node of root.querySelectorAll('[data-credit-text]')) node.textContent = t(node.textContent!);
}
