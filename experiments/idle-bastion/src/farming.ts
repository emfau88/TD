import { BALANCE, battleReward } from './balance';
/** Conservative, bounded, Phaser-free proofs. A probe never mutates the live
 * model, issues its rewards or consumes its renderer/tutorial event stream.
 */
import { LAYOUT_VERSION } from './layout';
import { clearReward } from './wave-recipes';
import { createProgress } from './progress';
import { getForestBlockedCells } from './forest-world';
import { BASE, BATTLE_RULES_VERSION, IdleBattle, isNormalFarmWave, stats, towerDefinition, waveCount, waveEnemy } from './battle';

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

export const MAX_FARM_CANDIDATES = 4;
export const MAX_FARM_PROBE_STEPS = 8000;
const STEP_MS = BASE.stepSeconds * 1000;
export const farmRewardGold = (certificate: FarmCertificate): number => certificate.rewardGold + (certificate.rewardRemainderUnits ?? 0) / 1000;
export const farmRewardUnits = (certificate: FarmCertificate): bigint => BigInt(certificate.rewardGold) * 1000n + BigInt(certificate.rewardRemainderUnits ?? 0);
const MAX_PROBE_REWARD = 2.2 * BALANCE.maxRewardFactor * (BASE.waves.maxCount * Math.max(...Object.values(BASE.enemies).map(def => def.gold)) + BASE.waves.maxReward);
// A generous upper bound for two entry clears: every reward including Wisp's
// 10%, rounded upwards, with zero combat time and only the mandatory pauses.
// This can discard an economically dominated fallback, never certify a wave.
const MAX_ENTRY_REWARD = Math.ceil(2.2 * (
  battleReward(clearReward(1, BATTLE_RULES_VERSION), 1, BATTLE_RULES_VERSION)
  + Array.from({ length: waveCount(1) }, (_, index) => battleReward(waveEnemy(1, index).gold, 1, BATTLE_RULES_VERSION))
    .reduce((sum, gold) => sum + gold, 0)));

/** Ignores transient HP, cooldowns, currency, IDs and kill statistics. Every
 * economically relevant placement/level/rule/layout change invalidates a proof.
 */
export function defenseFingerprint(battle: IdleBattle): string {
  return JSON.stringify({
    rulesVersion: BATTLE_RULES_VERSION, layoutVersion: battle.layout.version, layout: { columns: battle.layout.bounds.columns, plots: battle.plots },
    blocked: getForestBlockedCells(battle.layout), maraTarget: battle.mara.targetTowerUid, settlement: { workshopBuilt: battle.settlement.workshopBuilt, frostResearched: battle.settlement.frostResearched, stormResearched: battle.settlement.stormResearched, builtAt: battle.settlement.builtAt }, wisp: battle.wispUnlocked,
    towers: battle.towers.map(tower => [tower.padId, tower.def.id, tower.level, tower.protected] as const)
      .sort((left, right) => left[0].localeCompare(right[0])),
  });
}

function candidateWaves(battle: IdleBattle, previous?: FarmCertificate): number[] {
  const completed = battle.liveClearedWaves.filter(wave => isNormalFarmWave(wave) && wave <= battle.highestCleared)
    .sort((a, b) => b - a);
  // A changed fingerprint invalidates the old proof, not the right to test its
  // previously safe wave again. Never reuse its old rate without two new clears.
  const preferred = previous && previous.wave > 1 && completed.includes(previous.wave) ? previous.wave
    : battle.farmWave > 1 && completed.includes(battle.farmWave) ? battle.farmWave : undefined;
  // Spend one slot between the old safe choice and the frontier, rather than
  // almost exclusively trying adjacent late clears. Only actual live clears
  // qualify; prefer the lower wave when two are equally close to the midpoint.
  const target = preferred === undefined ? undefined : (preferred + completed[0]) / 2;
  const middle = target === undefined ? undefined : completed.filter(wave => wave > preferred! && wave < completed[0])
    .sort((a, b) => Math.abs(a - target) - Math.abs(b - target) || a - b)[0];
  // Without a non-entry selection, keep the existing recovery candidates.
  const recovery = !isFarmCertificateValid(previous, battle);
  const entry = completed.includes(1) ? [1] : [];
  const candidates = [...new Set([completed[0], preferred, middle, completed[1], ...(recovery ? [completed[2]] : [])])]
    .filter((wave): wave is number => wave !== undefined && wave !== 1 && completed.includes(wave));
  return [...candidates.slice(0, MAX_FARM_CANDIDATES-entry.length), ...entry];
}

function prove(battle: IdleBattle, wave: number, fingerprint: string): FarmCertificate | undefined {
  const snapshot = battle.snapshot();
  snapshot.introduction = { ...snapshot.introduction, stage: 'done', halted: false };
  snapshot.discovery = 'off';
  if (snapshot.ilyra) { snapshot.ilyra.volley=null; snapshot.ilyra.autoCast=false; }
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
  if (snapshot.settlement.tavernBuilt) snapshot.settlement.tavernBuiltAt = 0;
  if (snapshot.clearing.unlocked) snapshot.clearing.openedAt = 0;
  if (snapshot.wispArrival.at !== null) snapshot.wispArrival.at = 0;
  snapshot.gold = 0; snapshot.goldRemainderUnits = 0; snapshot.earned = 0; snapshot.kills = 0;
  snapshot.towers = snapshot.towers.map(tower => ({ ...tower, cooldown: stats({ def: towerDefinition(tower.kind), level: tower.level }).cooldown, kills: 0 }));
  const probe = IdleBattle.restore(snapshot, { maraBonus: false, ilyraAbilities: false, socialRewards: false });
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
  if (battle.preparing || ![LAYOUT_VERSION, 5].includes(battle.layout.version ?? 0)) return undefined;
  const fingerprint = defenseFingerprint(battle);
  // A newer leaky victory must not erase an older still-valid safe proof.
  let best = isFarmCertificateValid(previous, battle) ? { ...previous! } : undefined;
  for (const wave of candidateWaves(battle, previous)) {
    if (best?.wave === wave) continue;
    if (wave === 1 && best && farmRewardGold(best) * (2 * BASE.intermissionSeconds * 1000)
      >= MAX_ENTRY_REWARD * best.durationMs) continue;
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
