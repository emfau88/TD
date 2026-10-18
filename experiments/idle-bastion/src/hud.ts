import { SETTLEMENT, FROST, type IdleBattle } from './battle';

/** Objectives follow confirmed game state; help never grants money or unlocks. */
export function tutorialStep(battle: IdleBattle): number {
  if (!battle.kills) return 0;
  if (!battle.tutorial.builtTower) return 1;
  if (!battle.tutorial.upgradedTower) return 2;
  if (!battle.settlement.workshopBuilt) return 3;
  if (!battle.settlement.frostResearched) return 4;
  if (!battle.towers.some(tower => tower.def.id === 2) && !battle.tutorial.frostSeen) return 5;
  if (!battle.tutorial.frostSeen) return 6;
  if (!battle.wispUnlocked) return 7;
  if (!battle.towers.some(tower => tower.def.id === 3)) return 8;
  if (!battle.settlement.warehouseBuilt) return battle.warehouseUnlocked ? 12 : 13;
  if (battle.highestCleared < 10) return 9;
  if (!battle.towers.some(tower => tower.def.id === 4)) return 10;
  if (!battle.bossVictories) return 14;
  return 11;
}
const HINTS = [
  'Ich bin Mara. Unser Startturm greift automatisch an. Beobachte die ersten Käfer — für jeden besiegten Gegner erhalten wir Gold.',
  'Wähle unten den Waldwächter und dann einen hellen Bauplatz. Ich empfehle die Nordostkurve; die Nordwestkurve bleibt dann für Frost frei.',
  'Ein Upgrade erhöht den Schaden sofort. Wähle einen Waldwächter und werte ihn für 60 Gold auf. Ich unterstütze meinen zugewiesenen Turm automatisch.',
  'Die alte Werkstatt kann wieder arbeiten. Öffne Siedlung und spare für ihre Reparatur. Sie eröffnet die Frostforschung; dafür muss kein weiterer Turm gekauft werden.',
  'Die Werkstatt steht! Erforsche Frostfassung. Damit erhalten wir einen Kontrollturm und können alle Türme bis Level 6 verbessern.',
  'Setze einen Frostkristall an eine Kurve, wo auch ein Waldwächter angreift. Sind alle Plätze belegt, kannst du einen gekauften Turm für 70 % verkaufen.',
  'Die blauen Treffer bremsen Käfer zwei Sekunden lang um 45 %. Andere Türme bekommen dadurch mehr Zeit zum Angreifen.',
  'Nach gemeisterter Welle 5 kommt Wisp kostenlos zur Werkstatt. Er bringt dauerhaft 10 % mehr Kampf-Gold mit; außerdem werden Steinschleuder und zwei Bauplätze verfügbar.',
  'Wisp versorgt die Werkstatt. Sein Goldbonus wirkt automatisch. Setze eine Steinschleuder nahe Frost ein: Ihr Flächentreffer trifft ganze Käfergruppen.',
  'Nach Welle 10 öffnen zwei weitere Bauplätze und der Scharfschütze. Verbessere deine Verteidigung für diesen Meilenstein.',
  'Der Scharfschütze bevorzugt gepanzerte Gegner und ignoriert ihre Rüstung. Ab Welle 11 kommen Panzerskorpione. Frost und Flächentreffer helfen gegen ihre Begleiter.',
  'Unsere erste Kombination funktioniert: Waldwächter verursachen Schaden, Frostkristalle halten Gegner länger in Reichweite. Probiere Plätze und meine Zuweisung aus.',
  'Das Vorratslager sammelt länger: 65 % der sicheren Farmbasis für bis zu acht Stunden. Öffne Siedlung, prüfe die Vorschau und baue es für 650 Gold. Die besseren Werte gelten für die nächste Abwesenheit.',
  'Nach gemeisterter Welle 8 kannst du ein Vorratslager bauen. Verbessere deine Verteidigung und spare dann 650 Gold. Wisp versorgt später beide Gebäude.',
  'Rosenspiegel erwartet uns in Welle 15. Ihr Herzfaden kündigt an, welchen Turm sie verführt. Frost unterbricht ihren Zauber; Flächentreffer räumen Begleiter ab, Scharfschützen durchdringen ihre Rüstung. Die erste vollständige Bosswelle bringt einmalig 750 Gold.',
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
    case 7: return 'Welle 5 meistern: Wisp, Steinschleuder und zwei Bauplätze.';
    case 8: return 'Wisp arbeitet: +10 % Kampf-Gold. Steinschleuder bauen · 135 Gold.';
    case 12: return `Vorratslager bauen · ${remaining(SETTLEMENT.warehouseCost)} · 65 % Offline-Ertrag für bis zu 8 Stunden.`;
    case 13: return 'Welle 8 meistern: Vorratslager freischalten.';
    case 9: return 'Welle 10 meistern: Scharfschütze und zwei weitere Bauplätze.';
    case 10: return 'Scharfschütze bauen · 170 Gold · Rüstung durchdringen.';
    case 14: return battle.highestCleared < 14 ? 'Verteidigung für Rosenspiegel in Welle 15 vorbereiten.' : 'Rosenspiegel besiegen · 750 Gold Erstprämie · Frost unterbricht ihre Verführung.';
    default: return battle.mode === 'farm' ? 'Verteidigung ausbauen, dann bewusst erneut vorstoßen.'
      : 'Frost und Pfeile arbeiten zusammen. Weitere Upgrades bis Level 6 sind verfügbar.';
  }
}
