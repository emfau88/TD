import type { Companion } from './tavern-social';

/** Only the explicitly built Tavern preview may request automatic navigation. */
export function tavernTestCompanion(featurePreview: boolean, tavernPreview: boolean, query: URLSearchParams): Companion | undefined {
  const who = query.get('tavernTest'), probe = query.get('probe');
  return featurePreview && tavernPreview && /^tavern-review-[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}$/.test(probe ?? '')
    && (who === 'mara' || who === 'ilyra') ? who : undefined;
}
