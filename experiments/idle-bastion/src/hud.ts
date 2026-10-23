import { t } from './i18n';
import { SETTLEMENT, FROST, type IdleBattle } from './battle';

/** Objectives follow confirmed game state; help never grants money or unlocks. */
export function tutorialStep(battle: IdleBattle): number {
  // Completed expansion must not send veterans back to role-purchase tutorials.
  if (battle.settlement.workshopUpgraded) return !battle.bossVictories ? 14 : battle.secondBossVictories ? 11 : 17;
  if (!battle.kills) return 0;
  if (!battle.tutorial.builtTower) return 1;
  if (!battle.tutorial.upgradedTower) return 2;
  if (!battle.settlement.workshopBuilt) return 3;
  if (!battle.settlement.frostResearched) return 4;
  if (!battle.towers.some(tower => tower.def.id === 2) && !battle.tutorial.frostSeen) return 5;
  if (!battle.tutorial.frostSeen) return 6;
  if (!battle.wispUnlocked || !battle.wispArrival.met) return 7;
  // Keep the retired clearing-hint bit as Mara's hint; preserve existing seen flags.
  if (battle.wispArrival.met && !battle.tutorial.hidden && (battle.discoveryActive && battle.discovery.startsWith('mara-') || !(battle.tutorial.seen & (1 << 15)))) return 15;
  if (!battle.towers.some(tower => tower.def.id === 3) && !(['warehouse','done'].includes(battle.discovery) && (battle.tutorial.seen & (1 << 8)))) return 8;
  if (!battle.settlement.warehouseBuilt && !(battle.discovery === 'done' && (battle.tutorial.seen & (1 << 12)))) return battle.warehouseUnlocked ? 12 : 13;
  if (battle.highestCleared < 10) return 9;
  if (!battle.towers.some(tower => tower.def.id === 4)) return 10;
  if (!battle.bossVictories) return 14;
  if (!battle.settlement.workshopUpgraded) return 16;
  if (!battle.secondBossVictories) return 17;
  return 11;
}
const HINTS = [
  'Ich bin Mara. Unser Startturm greift automatisch an. Beobachte die ersten Käfer — für jeden besiegten Gegner erhalten wir Gold.',
  'Wähle unten den Waldwächter, dann tippe auf ein freies Feld am Weg, um direkt zu bauen. Ich empfehle die Nordostkurve; der Nordbogen daneben bleibt dann für Frost frei.',
  'Ein Upgrade erhöht den Schaden sofort. Wähle einen Waldwächter und werte ihn für 60 Gold auf. Ich unterstütze meinen zugewiesenen Turm automatisch.',
  'Baue unsere Werkstatt. Öffne Siedlung, wähle die Werkstatt und tippe auf einen freien Platz. Sie eröffnet die Frostforschung; dafür muss kein weiterer Turm gekauft werden.',
  'Die Werkstatt steht! Erforsche Frostfassung. Damit erhalten wir einen Kontrollturm und können alle Türme bis Level 6 verbessern.',
  'Setze einen Frostkristall an eine Kurve, wo auch ein Waldwächter angreift. Sind alle Plätze belegt, kannst du einen gekauften Turm für 70 % verkaufen.',
  'Die blauen Treffer bremsen Käfer zwei Sekunden lang um 45 %. Andere Türme bekommen dadurch mehr Zeit zum Angreifen.',
  'Nach gemeisterter Welle 5 kommt Wisp kostenlos zur Werkstatt. Er bringt dauerhaft 10 % mehr Kampf-Gold mit; außerdem werden Steinschleuder verfügbar.',
  'Wisp versorgt die Werkstatt. Sein Goldbonus wirkt automatisch. Setze eine Steinschleuder nahe Frost ein: Ihr Flächentreffer trifft ganze Käfergruppen.',
  'Nach Welle 10 wird der Scharfschütze verfügbar. Verbessere deine Verteidigung für diesen Meilenstein.',
  'Der Scharfschütze bevorzugt gepanzerte Gegner und ignoriert ihre Rüstung. Ab Welle 11 kommen Panzerskorpione. Frost und Flächentreffer helfen gegen ihre Begleiter.',
  'Unsere erste Kombination funktioniert: Waldwächter verursachen Schaden, Frostkristalle halten Gegner länger in Reichweite. Probiere Plätze und meine Zuweisung aus.',
  'Das Vorratslager sammelt länger: 65 % der sicheren Farmbasis für bis zu acht Stunden. Öffne Siedlung, prüfe die Vorschau und baue es für 650 Gold. Die besseren Werte gelten für die nächste Abwesenheit.',
  'Nach gemeisterter Welle 8 kannst du ein Vorratslager bauen. Verbessere deine Verteidigung und spare dann 650 Gold. Wisp versorgt später beide Gebäude.',
  'Rosenspiegel erwartet uns in Welle 15. Ihr Herzfaden kündigt an, welchen Turm sie verführt. Frost bremst ihren Vormarsch; Flächentreffer räumen Begleiter ab, Scharfschützen durchdringen ihre Rüstung. Die erste vollständige Bosswelle bringt einmalig 750 Gold.',
  'Jetzt übernimmt Wisp die Versorgung. Meine Magie heißt Übertakten: acht Sekunden lang 50 % mehr Feuerrate. Goldener Ring und Restsekunden zeigen den verstärkten Turm. Automatisch zaubere ich nur bei Gegnern; über mein Porträt kannst du auch selbst auslösen.',
  'Baue die Werkstatt für 1.200 Gold zur Stufe II aus. Der neue Arbeitsplatz ermöglicht weitere Turmlevel ab 7; die nächste Herausforderung wartet in Welle 25.',
  'Rosenspiegel kehrt in Welle 25 mit einer größeren Begleitgruppe zurück. Höhere Turmlevel und unsere vier Rollen helfen. Für den ersten Sieg gibt es einmalig 1.200 Gold.',
] as const;
export const tutorialHint = (battle: IdleBattle): string => tutorialStep(battle) === 15 && battle.mara.effectRemaining > 0
  ? t("Übertakten wirkt jetzt: +50 % Feuerrate, noch {0} Sekunden. Der goldene Ring zeigt meinen Zielturm. Über mein Porträt kannst du später auch manuell zaubern; die Automatik wartet auf Gegner.", Math.ceil(battle.mara.effectRemaining))
  : t(HINTS[tutorialStep(battle)]);
export function nextObjective(battle: IdleBattle): string {
  const remaining = (cost: number) => battle.gold >= cost ? t("{0} Gold · bereit", cost) : t("noch {0} Gold", cost - battle.gold);
  switch (tutorialStep(battle)) {
    case 0: return t('Die Verteidigung läuft. Erste Käfer bringen Gold — dein zweiter Turm ist bereits bezahlbar.');
    case 1: return t('Nächstes Ziel: eigener Waldwächter auf einem hellen Bauplatz · 75 Gold.');
    case 2: return t('Nächstes Ziel: einen Waldwächter verbessern · 60 Gold.');
    case 3: return t("Nächstes Ziel: Werkstatt bauen · {0}.", battle.workshopKitAvailable ? t('kostenloser Bausatz bereit') : remaining(battle.workshopBuildCost));
    case 4: return t("Nächstes Ziel: Frostfassung erforschen · {0}.", remaining(SETTLEMENT.researchCost));
    case 5: return t("Nächstes Ziel: Frostkristall an einem freien Platz bauen · {0}.", remaining(FROST.cost));
    case 6: return t('Nächstes Ziel: den ersten blauen Frosttreffer im Kampf beobachten.');
    case 7: return battle.wispUnlocked ? t('Wisp begrüßen · +10 % Kampf-Gold, arbeitet automatisch.') : t('Deine Kombination arbeitet. Welle 5 meistern, dann kommt Wisp.');
    case 8: return t('Wisp arbeitet: +10 % Kampf-Gold. Steinschleuder bauen · 135 Gold.');
    case 12: return t("Vorratslager bauen · {0} · 65 % Offline-Ertrag für bis zu 8 Stunden.", remaining(SETTLEMENT.warehouseCost));
    case 13: return t('Welle 8 meistern: Vorratslager freischalten.');
    case 9: return t('Welle 10 meistern: Scharfschütze.');
    case 10: return t('Scharfschütze bauen · 170 Gold · Rüstung durchdringen.');
    case 14: return battle.highestCleared < 14 ? t('Verteidigung für Rosenspiegel in Welle 15 vorbereiten.') : t('Rosenspiegel besiegen · 750 Gold Erstprämie · Frost bremst ihren Vormarsch.');
    case 15: return t('Mara kennenlernen: Übertakten verstärkt einen Turm für acht Sekunden.');
    case 16: return t("Werkstatt II ausbauen · {0} · weitere Turmlevel ab 7.", remaining(SETTLEMENT.workshopUpgradeCost));
    case 17: return t('Rosenspiegels Rückkehr in Welle 25 vorbereiten · weitere Turmlevel ab 7 verfügbar.');
    default: return battle.mode === 'farm' ? t('Verteidigung ausbauen, dann bewusst erneut vorstoßen.')
      : t('Frost und Pfeile arbeiten zusammen. Weitere Turm-Upgrades sind verfügbar.');
  }
}
