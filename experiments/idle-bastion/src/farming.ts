/** Conservative, bounded, Phaser-free proofs. A probe never mutates the live
 * model, issues its rewards or consumes its renderer/tutorial event stream.
 */
import { LAYOUT_VERSION } from './layout';
import { createProgress } from './progress';
import { getForestBlockedCells } from './forest-world';
import { BASE, BATTLE_RULES_VERSION, IdleBattle, isNormalFarmWave, stats, towerDefinition } from './battle';

export interface FarmCertificate {
  wave: number;
  fingerprint: string;
  rulesVersion: number;
  /** Sum of ordinary enemy/clear gold from two complete repetitions. */
  rewardGold: number;
  rewardRemainderUnits?: number;
  /** Sum of both repetitions including a 2s pause each; exact integer ms. */
  durationMs: number;
}

export const MAX_FARM_CANDIDATES = 3;
export const MAX_FARM_PROBE_STEPS = 8000;
const STEP_MS = BASE.stepSeconds * 1000;
export const farmRewardGold = (certificate: FarmCertificate): number => certificate.rewardGold + (certificate.rewardRemainderUnits ?? 0) / 1000;
export const farmRewardUnits = (certificate: FarmCertificate): bigint => BigInt(certificate.rewardGold) * 1000n + BigInt(certificate.rewardRemainderUnits ?? 0);
const MAX_PROBE_REWARD = 2.2 * (BASE.waves.maxCount * Math.max(...Object.values(BASE.enemies).map(def => def.gold)) + BASE.waves.maxReward);

/** Ignores transient HP, cooldowns, currency, IDs and kill statistics. Every
 * economically relevant placement/level/rule/layout change invalidates a proof.
 */
export function defenseFingerprint(battle: IdleBattle): string {
  return JSON.stringify({
    rulesVersion: BATTLE_RULES_VERSION, layoutVersion: LAYOUT_VERSION, layout: { columns: battle.layout.bounds.columns, plots: battle.plots },
    blocked: getForestBlockedCells(battle.layout), maraTarget: battle.mara.targetTowerUid, settlement: { workshopBuilt: battle.settlement.workshopBuilt, frostResearched: battle.settlement.frostResearched, builtAt: battle.settlement.builtAt }, wisp: battle.wispUnlocked,
    towers: battle.towers.map(tower => [tower.padId, tower.def.id, tower.level, tower.protected] as const)
      .sort((left, right) => left[0].localeCompare(right[0])),
  });
}

function candidateWaves(battle: IdleBattle, previous?: FarmCertificate): number[] {
  const completed = battle.liveClearedWaves.filter(wave => isNormalFarmWave(wave) && wave <= battle.highestCleared)
    .sort((a, b) => b - a);
  const preferred = previous?.wave ?? completed[1];
  return [...new Set([completed[0], preferred, completed.includes(1) ? 1 : undefined])]
    .filter((wave): wave is number => wave !== undefined).slice(0, MAX_FARM_CANDIDATES);
}

function prove(battle: IdleBattle, wave: number, fingerprint: string): FarmCertificate | undefined {
  const snapshot = battle.snapshot();
  snapshot.mode = 'farm'; snapshot.farmWave = wave; snapshot.advanceRequested = false;
  snapshot.wave = wave; snapshot.phase = 'intermission'; snapshot.lives = BASE.coreLives;
  snapshot.enemies = []; snapshot.shots = []; snapshot.queue = [];
  snapshot.bossChallengeRequested = false; snapshot.bossChallengeWave = 15; snapshot.bossCharm = { phase: 'idle', targetUid: null, remaining: 0, cooldown: 0 };
  snapshot.spawnTimer = 0; snapshot.intermissionRemaining = BASE.intermissionSeconds;
  snapshot.pendingTime = 0; snapshot.ticks = 0; snapshot.elapsed = 0;
  if (snapshot.settlement.workshopBuilt) snapshot.settlement.builtAt = 0;
  snapshot.progress = createProgress(snapshot.attemptId, 0); snapshot.rewardRemainderUnits = 0;
  if (snapshot.settlement.workshopUpgraded) snapshot.settlement.upgradedAt = 0;
  if (snapshot.settlement.warehouseBuilt) snapshot.settlement.warehouseBuiltAt = 0;
  if (snapshot.clearing.unlocked) snapshot.clearing.openedAt = 0;
  if (snapshot.wispArrival.at !== null) snapshot.wispArrival.at = 0;
  snapshot.gold = 0; snapshot.goldRemainderUnits = 0; snapshot.earned = 0; snapshot.kills = 0;
  snapshot.towers = snapshot.towers.map(tower => ({ ...tower, cooldown: stats({ def: towerDefinition(tower.kind), level: tower.level }).cooldown, kills: 0 }));
  const probe = IdleBattle.restore(snapshot, { maraBonus: false });
  if (!probe) return undefined;
  let clears = 0;
  for (let step = 1; step <= MAX_FARM_PROBE_STEPS; step++) {
    probe.update(BASE.stepSeconds);
    // Even a successful but leaky attempt is not a safe production proof.
    if (probe.lives !== BASE.coreLives || probe.phase === 'defeat') return undefined;
    for (const event of probe.drainEvents()) {
      if (event.type !== 'clear') continue;
      if (event.wave !== wave) return undefined;
      clears++;
      if (clears === 2) return {
        wave, fingerprint, rulesVersion: BATTLE_RULES_VERSION,
        rewardGold: probe.earned, rewardRemainderUnits: probe.rewardRemainderUnits, durationMs: step * STEP_MS,
      };
      // Both complete cycles begin with the pessimistic normal cooldown.
      for (const tower of probe.towers) tower.cooldown = stats(tower).cooldown;
    }
  }
  return undefined;
}

export function certifyFarm(battle: IdleBattle, previous?: FarmCertificate): FarmCertificate | undefined {
  const fingerprint = defenseFingerprint(battle);
  // A newer leaky victory must not erase an older still-valid safe proof.
  let best = isFarmCertificateValid(previous, battle) ? { ...previous! } : undefined;
  for (const wave of candidateWaves(battle, best)) {
    if (best?.wave === wave) continue;
    const proof = prove(battle, wave, fingerprint);
    if (proof && (!best || farmRewardGold(proof) * best.durationMs > farmRewardGold(best) * proof.durationMs)) best = proof;
  }
  return best;
}

/** Structural and defense validity is cheap; obtaining a new proof explicitly
 * reruns certifyFarm. Serialized proofs never open previously uncleared waves.
 */
export function isFarmCertificateValid(certificate: FarmCertificate | undefined, battle: IdleBattle): boolean {
  if (!certificate || typeof certificate !== 'object' || certificate.rulesVersion !== BATTLE_RULES_VERSION
    || certificate.fingerprint !== defenseFingerprint(battle)
    || !isNormalFarmWave(certificate.wave) || !battle.liveClearedWaves.includes(certificate.wave)
    || !Number.isSafeInteger(certificate.rewardGold) || certificate.rewardGold <= 0 || certificate.rewardGold > MAX_PROBE_REWARD
    || !Number.isSafeInteger(certificate.rewardRemainderUnits ?? 0) || (certificate.rewardRemainderUnits ?? 0) < 0 || (certificate.rewardRemainderUnits ?? 0) > 999
    || !Number.isSafeInteger(certificate.durationMs) || certificate.durationMs < 2 * BASE.intermissionSeconds * 1000
    || certificate.durationMs > MAX_FARM_PROBE_STEPS * STEP_MS || certificate.durationMs % STEP_MS !== 0) return false;
  return true;
}
