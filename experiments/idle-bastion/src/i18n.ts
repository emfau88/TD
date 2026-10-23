import { english } from './locales/en';

export type Language = 'en' | 'de';
export const LANGUAGE_KEY = 'spire-language-v1';
export const DEFAULT_LANGUAGE: Language = 'en';
const listeners = new Set<() => void>();
export function readLanguage(value: unknown): Language { return value === 'de' ? 'de' : DEFAULT_LANGUAGE; }
function savedLanguage(): Language {
  try { return readLanguage(globalThis.localStorage?.getItem(LANGUAGE_KEY)); }
  catch { return DEFAULT_LANGUAGE; }
}
let current: Language = savedLanguage();
export function language(): Language { return current; }
export function locale(): string { return current === 'de' ? 'de-DE' : 'en-US'; }
/** UI preference only: no save-store, battle, certificate or clock access. */
export function setLanguage(value: Language): void {
  if (value !== 'en' && value !== 'de') return;
  try { globalThis.localStorage?.setItem(LANGUAGE_KEY, value); } catch { /* Session-only preference when storage is unavailable. */ }
  if (current === value) return;
  current = value;
  for (const update of [...listeners]) update();
}
export function onLanguageChange(update: () => void): () => void {
  listeners.add(update); return () => listeners.delete(update);
}
export function hasTranslation(source: string): boolean { return Object.hasOwn(english, source.trim()); }
/** Positional placeholders keep complete sentences together, including word order. */
export function t(source: string | number | null | undefined, ...values: unknown[]): string {
  const raw = source == null ? '' : String(source);
  const key = raw.trim();
  if (!key) return raw;
  const translated = current === 'en' ? english[key] ?? key : key;
  const text = raw.slice(0, raw.length - raw.trimStart().length) + translated + raw.slice(raw.trimEnd().length);
  return values.length ? text.replace(/\{(\d+)\}/g, (placeholder, index: string) =>
    Number(index) < values.length ? typeof values[Number(index)] === 'string' ? t(values[Number(index)] as string) : String(values[Number(index)] ?? '') : placeholder) : text;
}
/** Existing formatters remain reusable after a language change. */
export function numberFormat(options: Intl.NumberFormatOptions = {}) {
  const formats = { en: new Intl.NumberFormat('en-US', options), de: new Intl.NumberFormat('de-DE', options) };
  return { format: (value: number) => formats[current].format(value) };
}
