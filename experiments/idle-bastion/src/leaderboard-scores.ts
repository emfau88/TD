import { farmRewardUnits, type FarmCertificate } from './farming';

export interface LeaderboardScores {
  highestWave: number;
  bestGoldPerMinute: number;
  enemiesDefeated: number;
}

/** Only a certificate produced by the normal two-round farm proof belongs here.
 * Whole gold/minute, rounded down; exact milligold arithmetic avoids rounding up. */
export function certifiedGoldPerMinute(certificate: FarmCertificate | null): number {
  if (!certificate) return 0;
  const rate = farmRewardUnits(certificate) * 60n / BigInt(certificate.durationMs);
  return Number(rate > BigInt(Number.MAX_SAFE_INTEGER) ? BigInt(Number.MAX_SAFE_INTEGER) : rate);
}

export function leaderboardEligible(kongregateBuild: boolean, featurePreview: boolean,
  databaseName: string, parameters: URLSearchParams): boolean {
  return kongregateBuild && !featurePreview && databaseName === 'spire-idle-bastion'
    && !parameters.has('fresh') && !parameters.has('probe');
}
