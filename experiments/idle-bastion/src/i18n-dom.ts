import { hasTranslation, language, onLanguageChange, setLanguage, t } from './i18n';

/** Bind static copy once. Dynamic UI stays explicit; no observer or per-frame DOM scan. */
export function bindStaticTranslations(root: Document | HTMLElement): () => void {
  const doc = root.nodeType === 9 ? root as Document : root.ownerDocument!;
  const bindings: (() => void)[] = [];
  const walker = doc.createTreeWalker(root, 4);
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    const source = node.textContent ?? '';
    if (!node.parentElement?.closest('script,style') && hasTranslation(source)) {
      const target = node;
      bindings.push(() => { if (root.contains(target)) target.textContent = t(source); });
    }
  }
  for (const element of root.querySelectorAll<HTMLElement>('*')) {
    for (const name of ['title', 'aria-label', 'alt', 'placeholder']) {
      const source = element.getAttribute(name);
      if (source && hasTranslation(source)) bindings.push(() => { if (root.contains(element)) element.setAttribute(name, t(source)); });
    }
  }
  const update = () => { for (const apply of bindings) apply(); };
  update();
  return onLanguageChange(update);
}
export function mountLanguageSettings(doc: Document): () => void {
  const select = doc.getElementById('language-choice') as HTMLSelectElement;
  const update = () => { doc.documentElement.lang = language(); select.value = language(); };
  const change = () => setLanguage(select.value === 'de' ? 'de' : 'en');
  select.addEventListener('change', change); update();
  const unlisten = onLanguageChange(update);
  return () => { select.removeEventListener('change', change); unlisten(); };
}
