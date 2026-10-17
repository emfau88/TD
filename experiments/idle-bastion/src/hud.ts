import { SETTLEMENT, FROST, type IdleBattle } from './battle';

/** Objectives follow confirmed game state; help never grants money or unlocks. */
export function tutorialStep(battle: IdleBattle): number {
  if (!battle.kills) return 0;
  if (!battle.tutorial.builtTower) return 1;
  if (!battle.tutorial.upgradedTower) return 2;
  if (!battle.settlement.workshopBuilt) return 3;
  if (!battle.settlement.frostResearched) return 4;
  if (!battle.towers.some(tower => tower.def.id === 2) && !battle.tutorial.frostSeen) return 5;
  return battle.tutorial.frostSeen ? 7 : 6;
}
const HINTS = [
  'Ich bin Mara. Unser Startturm greift automatisch an. Beobachte die ersten Käfer — für jeden besiegten Gegner erhalten wir Gold.',
  'Verstärken wir den Weg: Baue einen Waldwächter an der ausgewählten Nordostkurve. So bleibt die Nordwestkurve für Frost frei. Andere freie Plätze zählen ebenfalls.',
  'Ein Upgrade erhöht den Schaden sofort. Wähle einen Waldwächter und werte ihn für 60 Gold auf. Ich unterstütze meinen zugewiesenen Turm automatisch.',
  'Die alte Werkstatt kann wieder arbeiten. Öffne Siedlung und spare für ihre Reparatur. Sie eröffnet die Frostforschung; dafür muss kein weiterer Turm gekauft werden.',
  'Die Werkstatt steht! Erforsche Frostfassung. Damit erhalten wir einen Kontrollturm und können alle Türme bis Level 6 verbessern.',
  'Setze einen Frostkristall an eine Kurve, wo auch ein Waldwächter angreift. Sind alle Plätze belegt, kannst du einen gekauften Turm für 70 % verkaufen.',
  'Die blauen Treffer bremsen Käfer zwei Sekunden lang um 45 %. Andere Türme bekommen dadurch mehr Zeit zum Angreifen.',
  'Unsere erste Kombination funktioniert: Waldwächter verursachen Schaden, Frostkristalle halten Gegner länger in Reichweite. Probiere Plätze und meine Zuweisung aus.',
] as const;
export const tutorialHint = (battle: IdleBattle): string => HINTS[tutorialStep(battle)];
export function nextObjective(battle: IdleBattle): string {
  const remaining = (cost: number) => battle.gold >= cost ? `${cost} Gold · bereit` : `noch ${cost - battle.gold} Gold`;
  switch (tutorialStep(battle)) {
    case 0: return 'Die Verteidigung läuft. Erste Käfer bringen Gold — dein zweiter Turm ist bereits bezahlbar.';
    case 1: return 'Nächstes Ziel: eigener Waldwächter auf einem hellen Bauplatz · 75 Gold.';
    case 2: return 'Nächstes Ziel: einen Waldwächter verbessern · 60 Gold.';
    case 3: return `Nächstes Ziel: Werkstatt reparieren · ${remaining(SETTLEMENT.workshopCost)}.`;
    case 4: return `Nächstes Ziel: Frostfassung erforschen · ${remaining(SETTLEMENT.researchCost)}.`;
    case 5: return `Nächstes Ziel: Frostkristall an einem freien Platz bauen · ${remaining(FROST.cost)}.`;
    case 6: return 'Nächstes Ziel: den ersten blauen Frosttreffer im Kampf beobachten.';
    default: return battle.mode === 'farm' ? 'Verteidigung ausbauen, dann bewusst erneut vorstoßen.'
      : 'Frost und Pfeile arbeiten zusammen. Weitere Upgrades bis Level 6 sind verfügbar.';
  }
}
