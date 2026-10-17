import { upgradeCost, type IdleBattle } from './battle';

/** B05 shows one legal next action. The later live tutorial is B07. */
export function nextObjective(battle: IdleBattle): string {
  if (!battle.towers.some(tower => !tower.protected)) return 'Nächstes Ziel: Baue deinen zweiten Waldwächter · 75 Gold.';
  const candidate = battle.towers.find(tower => tower.level < 3);
  if (candidate) {
    const cost = upgradeCost(candidate);
    return battle.gold >= cost ? `Nächstes Ziel: Verbessere einen Waldwächter · ab ${cost} Gold.`
      : `Nächstes Ziel: Spare ${cost - battle.gold} Gold für ein Turmupgrade.`;
  }
  if (battle.towers.length < 4) return 'Nächstes Ziel: Besetze einen weiteren hell markierten Bauplatz · 75 Gold.';
  return battle.mode === 'farm' ? 'Deine Verteidigung ist ausgebaut. Starte einen neuen Vorstoß, sobald du bereit bist.'
    : 'Deine Verteidigung ist ausgebaut. Beobachte, wie weit die Türme gemeinsam kommen.';
}
