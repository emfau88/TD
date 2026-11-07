import { towerPreviewDatabase } from './tower-evolution';

/** Preserve the published main/probe identities. Preview saves never migrate into main. */
export function gameDatabase(preview: boolean, probe?: string | null, tavernPreview = false): string {
  if (preview && tavernPreview) return probe && /^[a-z0-9-]{1,60}$/.test(probe)
    ? `spire-tavern-preview-v1-${probe}` : 'spire-tavern-preview-v1';
  if (preview) return towerPreviewDatabase(probe);
  return probe && /^[a-z0-9-]{1,60}$/.test(probe)
    ? `spire-idle-bastion-probe-${probe}` : 'spire-idle-bastion';
}
