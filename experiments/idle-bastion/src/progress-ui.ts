import { t, numberFormat, language } from './i18n';
import { waveRecipe, FAMILY_NAMES } from './wave-recipes';
import { ENEMY_ROSTER } from './enemy-roster';
import { bossEncounter } from './boss';
import { farmRewardGold } from './farming';
import { waveCount, waveEnemy, SETTLEMENT, FROST, upgradeCost, type IdleBattle } from './battle';
import type { BattleSession } from './battle-session';
import { offlinePolicy } from './offline';
import { IncomeWindow, HISTORY_LIMIT, type AttemptMode } from './progress';
import { tutorialStep } from './hud';

export type GoalAction = 'archer' | 'upgrade' | 'workshop' | 'warehouse' | 'frost' | 'cannon' | 'sniper' | 'boss' | 'clearing' | 'progress' | 'mara' | 'wisp';
const el = <T extends HTMLElement = HTMLElement>(id: string) => document.getElementById(id)! as T;
const number = numberFormat({ maximumFractionDigits: 0 });
const gold = (value: number) => number.format(value);
const padNames: Record<string, string> = { 'tower-start': 'Startturm', 'tower-02': 'Nordwest', 'tower-03': 'Nordost', 'tower-04': 'Südkurve', 'tower-05': 'Nordweg', 'tower-06': 'Engpass', 'tower-07': 'Südweg', 'tower-08': 'Kernwache', 'tower-09': 'Nordbogen', 'tower-10': 'Mittelpass', 'tower-11': 'Südbogen', 'tower-east-01': 'Östlicher Sporn', 'tower-east-02': 'Ostbogen' };
interface Goal { title: string; detail: string; action: GoalAction; cost?: number; label: string }
/** Keep the objective and its action focused on the same useful upgrade. */
export function recommendedUpgrade(battle: IdleBattle) {
  const area = battle.settlement.workshopUpgraded && battle.towers.find(t => t.def.id === 3 && t.level < 7);
  return area || [...battle.towers].filter(t => t.level < battle.maxLevel).sort((a,b) => upgradeCost(a)-upgradeCost(b))[0];
}
export function currentGoal(battle: IdleBattle): Goal {
  if (battle.preparing) return { title: t('Deine erste Verteidigung'), detail: t('Mara kennenlernen · kostenlosen Startturm platzieren'), action: 'archer', label: t('Startturm platzieren') };

  const need = (price: number) => battle.gold >= price ? t('Bereit') : t("Noch {0} Gold", gold(price - battle.gold));
  switch (tutorialStep(battle)) {
    case 0: case 1: return { title: t('Verstärke die Verteidigung'), detail: t("{0} · Waldwächter bauen", need(75)), cost: 75, action: 'archer', label: t('Waldwächter auswählen') };
    case 2: {
      const tower = battle.towers.find(t => t.level < battle.maxLevel)!;
      const cost = tower ? upgradeCost(tower) : 60;
      return { title: t('Dein erstes Turmupgrade'), detail: t("{0} · mehr Schaden", need(cost)), cost, action: 'upgrade', label: t('Turm auswählen') };
    }
    case 3: return { title: t('Die Werkstatt bauen'), detail: t("{0} · eröffnet Forschung", battle.workshopKitAvailable ? t('Kostenloser Bausatz') : need(battle.workshopBuildCost)), cost: battle.workshopBuildCost, action: 'workshop', label: t('Werkstatt ansehen') };
    case 4: return { title: t('Frostfassung erforschen'), detail: t("{0} · Frostturm & Level 4–6", need(SETTLEMENT.researchCost)), cost: SETTLEMENT.researchCost, action: 'workshop', label: t('Forschung ansehen') };
    case 5: return { title: t('Frost und Pfeile kombinieren'), detail: t("{0} · Frostkristall platzieren", need(FROST.cost)), cost: FROST.cost, action: 'frost', label: t('Frostkristall auswählen') };
    case 6: return { title: t('Die Frosttechnik wirkt'), detail: t('Ersten Frosttreffer beobachten · Gegner werden langsamer'), action: 'progress', label: t('Fortschritt ansehen') };
    case 7: return battle.wispUnlocked ? { title: t('Wisp ist angekommen'), detail: t('+10 % Kampf-Gold · arbeitet selbstständig'), action: 'wisp', label: t('Wisp kennenlernen') } : { title: t('Deine Kombination arbeitet'), detail: t('Welle 5 erreichen · Bauen und Upgrades sind jetzt frei'), action: 'progress', label: t('Fortschritt ansehen') };
    case 8: return { title: t('Käfergruppen gemeinsam treffen'), detail: t("{0} · Steinschleuder neben Frost", need(135)), cost: 135, action: 'cannon', label: t('Steinschleuder auswählen') };
    case 12: return { title: t('Vorräte für deine Rückkehr'), detail: t("{0} · optional: 2 → 8 Stunden sammeln", need(SETTLEMENT.warehouseCost)), cost: SETTLEMENT.warehouseCost, action: 'warehouse', label: t('Vorratslager ansehen') };
    case 13: return { title: t('Den Weg bis Welle 8 sichern'), detail: t('Vorratslager freischalten · längere Offline-Erträge'), action: 'upgrade', label: t('Verteidigung verbessern') };
    case 9: return { title: t('Den Weg bis Welle 10 sichern'), detail: t('Scharfschütze freischalten'), action: 'upgrade', label: t('Verteidigung verbessern') };
    case 10: return { title: t('Für Rüstung gewappnet'), detail: t("{0} · Scharfschütze durchdringt Panzer", need(170)), cost: 170, action: 'sniper', label: t('Scharfschütze auswählen') };
    case 14: return battle.highestCleared >= 14
      ? { title: t('Rosenspiegel stellt sich dir'), detail: t('Welle 15 · 750 Gold Erstprämie · Frost verlangsamt'), action: 'boss', label: t('Bossherausforderung ansehen') }
      : { title: t('Bereite dich auf Rosenspiegel vor'), detail: t('Boss in Welle 15 · Frost, Fläche und Durchdringung'), action: 'upgrade', label: t('Verteidigung verbessern') };
    case 15: return { title: t('Maras Übertakten kennenlernen'), detail: t('8 Sekunden · +50 % Feuerrate · Automatik wartet auf Gegner'), action: 'mara', label: t('Maras Zauber ansehen') };
    case 16: return { title: t('Werkstatt II ausbauen'), detail: t("{0} · Turmlevel ab 7", need(SETTLEMENT.workshopUpgradeCost)), cost: SETTLEMENT.workshopUpgradeCost, action: 'workshop', label: t('Werkstatt ausbauen') };
    case 17: if (battle.highestCleared >= 24 && !battle.bossActive && battle.mode !== 'farm') return { title: t('Rosenspiegels Rückkehr'), detail: t('Welle 25 · 1.200 Gold Erstprämie'), action: 'boss', label: t('Bossherausforderung ansehen') };
    default: {
      const tower = recommendedUpgrade(battle);
      if (tower) { const cost = upgradeCost(tower); return { title: t("{0} auf Level {1}", padNames[tower.padId] ?? tower.def.name, tower.level+1), detail: t("{0} · {1}", need(cost), battle.secondBossVictories ? t("nächster Vorstoß: Welle {0}", battle.nextAdvanceWave) : t('für Rosenspiegels Rückkehr · Welle 25')), cost, action: 'upgrade', label: t('Turm aufwerten') }; }
      if (battle.layout.towerPads.some(p => battle.isPadUnlocked(p.id) && !battle.towers.some(t => t.padId === p.id))) return { title: t('Freie Bauplätze verstärken'), detail: t("{0} · weitere Schussbereiche nutzen", need(75)), cost: 75, action: 'archer', label: t('Waldwächter platzieren') };
      return { title: t('Verteidigung vollständig ausgebaut'), detail: t("Sicher farmen oder Welle {0} versuchen", battle.nextAdvanceWave), action: 'progress', label: t('Fortschritt und Vorstoß ansehen') };
    }
  }
}

export function createProgressUI(goTo: (action: GoalAction) => void, signal: AbortSignal) {
  const dialog = el<HTMLDialogElement>('chronicle');
  const income = new IncomeWindow();
  let activeMode: AttemptMode = 'advance', tableKey = '', enemiesKey = '', goal: Goal | undefined;
  const open = () => { if (!dialog.open) dialog.showModal(); };
  for (const id of ['open-progress', 'gold-summary', 'wave-summary', 'goal-details']) el(id).addEventListener('click', open, { signal });
  el('close-progress').addEventListener('click', () => dialog.close(), { signal });
  for (const id of ['goal-action', 'journal-goal-action']) el(id).addEventListener('click', () => {
    if (!goal) return;
    if (goal.action === 'progress' || goal.action === 'boss') open();
    else { dialog.close(); goTo(goal.action); }
  }, { signal });
  el<HTMLSelectElement>('history-mode').addEventListener('change', () => { activeMode = el<HTMLSelectElement>('history-mode').value as AttemptMode; tableKey = ''; }, { signal });

  return {
    reset() { income.reset(); tableKey = ''; enemiesKey = ''; },
    update(live: BattleSession) {
      const b = live.battle, p = b.progress, rate = income.observe(b.elapsed, p.battleGold);
      const stopped = live.paused || live.awaitingResume || live.suspended || Boolean(live.error);
      const certificate = live.certificate;
      const safe = certificate ? farmRewardGold(certificate) * 60000 / certificate.durationMs : 0;
      const policy = offlinePolicy(b.settlement.warehouseBuilt), offline = safe * policy.efficiencyPermille / 1000;
      const rateText = stopped ? t("{0} · 0 G/min", live.paused ? 'Pause' : t('Angehalten')) : rate.perMinute === null ? t('Ertrag wird ermittelt') : t("Ø {0} G/min", gold(rate.perMinute));
      el('live-income').textContent = t(rateText);
      el('gold-summary').title = t("Laufender Goldzufluss aus Kampfbelohnungen. {0} aktive Sekunden gemessen. Details öffnen.", Math.floor(rate.seconds));
      el('record-wave').textContent = t("Rekord {0}", b.highestCleared);
      el('wave-mode').textContent = t(live.paused ? 'Pause' : b.phase === 'defeat' ? t('Rückzug') : b.mode === 'farm' ? t('Farmen') : b.wave===40 && b.waveRecipeVersion>=11 ? 'Elite' : t('Vorstoß'));
      el('wave-summary').setAttribute('aria-label', t("Welle {0}, {1}. Höchste besiegte Welle {2}. Chronik öffnen", b.wave, b.mode === 'farm' ? t('Farmen') : t('Vorstoß'), b.highestCleared));
      const total = waveCount(b.wave, b.waveRecipeVersion);
      el<HTMLProgressElement>('wave-progress').max = Math.max(1, total);
      el<HTMLProgressElement>('wave-progress').value = b.phase === 'wave' ? total - b.remaining : b.wave ? total : 0;
      el('wave-progress').setAttribute('aria-label', t(b.phase === 'wave' ? t("{0} von {1} Gegnern verbleiben", b.remaining, total) : t('Wellenpause')));
      goal = currentGoal(b);
      el('goal-title').textContent = t(goal.title);
      el('goal-copy').textContent = t(goal.detail);
      el('goal-action').setAttribute('aria-label', t(goal.label));
      const meter = el<HTMLProgressElement>('goal-progress');
      meter.hidden = goal.cost === undefined;
      meter.max = goal.cost ?? 1; meter.value = Math.min(b.gold, goal.cost ?? 1);
      meter.setAttribute('aria-label', t("{0} von {1} Gold", gold(b.gold), goal.cost ?? 0));
      el('journal-goal-title').textContent = t(goal.title);
      el('journal-goal-copy').textContent = t(goal.detail);
      el('journal-goal-action').textContent = t(goal.label);
      el('journal-companions-count').textContent = t("{0} verfügbar", 1 + Number(b.wispUnlocked) + Number(!!b.ilyra));
      el('journal-ilyra').hidden = !b.ilyra;
      el('journal-ilyra-order').textContent = t(b.ilyra ? t("Freie Bewegung · {0} · besonders wirksam gegen Flieger. Kein garantierter Offline-Bonus.", b.ilyra.autoCast ? t('Automatik') : t('manuelle Sternensalve')) : '');
      el('journal-wisp-order').textContent = t(b.wispUnlocked ? t("Auftrag: {0} versorgen · +10 % Kampf-Gold. Bereits in Live-Ertrag und Farmbasis enthalten.", b.settlement.warehouseBuilt ? t('Werkstatt und Lager') : t('Werkstatt')) : t('Kommt kostenlos nach Frostfassung und gemeisterter Welle 5.'));
      const target = b.towers.find(t => t.uid === b.mara.targetTowerUid);
      const assignment = target ? padNames[target.padId] ?? target.def.name : t('Startturm');
      el('journal-mara-order').textContent = t(b.mara.path.length ? t("Standortwechsel · Zauberziel: {0}", assignment) : t("Fernzauberziel: {0} · {1}", assignment, b.mara.autoCast ? t('Automatik') : t('Manuell')));
      const nextBoss = b.nextBossWave, encounter = bossEncounter(nextBoss), wins = b.bossWins(nextBoss);
      el('journal-boss-title').textContent = t("{0} · Welle {1}", encounter.title, nextBoss);
      el('journal-boss-status').textContent = t(t("Welle 15: {0} Siege · Welle 25: {1} Siege. ", b.bossVictories, b.secondBossVictories) + (wins ? t('Erstprämie erhalten.')
        : b.bossActive ? t('Bosskampf läuft · Sieg erst nach Boss und allen Begleitern.') : t("Noch unbesiegt · Herausforderung nach Welle {0}. Frühere Wellenrekorde ersetzen keinen Bosssieg.", nextBoss-1)));
      const challenge = el<HTMLButtonElement>('challenge-boss');
      challenge.disabled = stopped || live.busy || b.highestCleared < nextBoss-1 || b.bossActive || b.bossChallengeRequested;
      challenge.textContent = t(b.bossChallengeRequested ? t("Bosswelle {0} am Wellenwechsel vorgemerkt", b.bossChallengeWave) : t("Boss {0}herausfordern · Welle {1}", wins ? 'erneut ' : '', nextBoss));
      const replay = el<HTMLButtonElement>('replay-first-boss'); replay.hidden = nextBoss === 15;
      replay.disabled = stopped || live.busy || b.bossActive || b.bossChallengeRequested;
      el('journal-record').textContent = t(String(b.highestCleared));
      el('journal-current').textContent = t("{0} · {1}", b.wave || '—', b.mode === 'farm' ? t('Farmen') : t('Vorstoß'));
      el('journal-safe-wave').textContent = t(certificate ? t("Welle {0}", certificate.wave) : t('Wird geprüft'));
      el('journal-earned').textContent = t("{0} G", gold(p.battleGold));
      el('journal-live-rate').textContent = t(rateText);
      el('journal-rate-note').textContent = t(rate.perMinute === null ? t('Nach 15 aktiven Sekunden erscheint eine erste Schätzung. Nach 60 Sekunden ist das Messfenster vollständig.')
        : t("Durchschnitt der letzten {0} aktiven Sekunden. Käufe, Verkäufe und Offline-Gutschriften zählen nicht dazu. Nach Neuladen beginnt die Messung neu.", Math.floor(rate.seconds)));
      el('journal-safe-rate').textContent = t(certificate ? t("{0} G/min", gold(safe)) : t('Noch kein Nachweis'));
      el('journal-offline-rate').textContent = t(live.paused ? t('0 G/min · Pause aktiv') : t("{0} G/min", gold(offline)));
      el('journal-offline-note').textContent = t("{0} % der sicheren Farmbasis · höchstens {1} Stunden. {2}", policy.efficiencyPermille / 10, policy.limitMs / 3600000, certificate ? t("Bei unveränderter Verteidigung etwa {0} Gold in einer Stunde.", gold(live.paused ? 0 : offline * 60)) : t('Zuerst eine Welle zuverlässig besiegen.'));
      const defeat = p.lastDefeat;
      const fallback = b.mode === 'farm' && defeat && defeat.attemptId !== b.dismissedDefeatAttempt;
      el('fallback-note').hidden = !fallback || live.awaitingResume;
      el('fallback-copy').textContent = t(fallback ? t("Welle {0} nicht geschafft. Jetzt Farmen auf Welle {1}. Gold, Türme und Forschung bleiben erhalten.", defeat.wave, b.farmWave) : '');
      el('journal-last-defeat').textContent = t(defeat ? t("Letzte Niederlage: Welle {0}. Gold und Ausbau blieben erhalten.", defeat.wave) : p.sinceAttempt > 1 ? t('Vor dem Update wurde keine Niederlagenhistorie aufgezeichnet.') : t('Bisher keine Niederlage.'));
      el('history-note').textContent = t(p.sinceAttempt > 1
        ? t("Aufzeichnung ab Versuch {0}. Frühere Versuche sind unbekannt; laufende Altversuche werden nicht nachträglich gezählt. Die letzten {1} verschiedenen Wellen bleiben einzeln erhalten.", p.sinceAttempt, HISTORY_LIMIT)
        : t("Aufzeichnung seit Spielbeginn. Ein Neuladen zählt nicht als neuer Versuch. Die letzten {0} verschiedenen Wellen bleiben einzeln erhalten.", HISTORY_LIMIT));
      const enemyKey = `${language()}:${b.wave}:${b.highestCleared}:${b.waveRecipeVersion}`;
      if (enemyKey !== enemiesKey) {
        enemiesKey = enemyKey;
        const counts = new Map<string, number>();
        for (let i = 0; i < (b.wave ? total : 0); i++) { const name = waveEnemy(b.wave, i, b.waveRecipeVersion).name; counts.set(name, (counts.get(name) ?? 0) + 1); }
        el('journal-wave-enemies').textContent = t(b.wave ? t("Zusammenstellung Welle {0}{1}: {2}", b.wave, b.waveRecipeVersion >= 11 && b.wave >= 6 && b.wave !== 15 && b.wave !== 25 ? t(" · {0}{1}", waveRecipe(b.wave).elite ? 'Elite · ' : '', FAMILY_NAMES[waveRecipe(b.wave).family]) : '', [...counts].map(([name, n]) => t("{0} × {1}", n, name)).join(' · ')) : t('Die erste Welle besteht aus Blattkäfern.'));
        const reached = Math.max(b.wave, b.highestCleared), next = ENEMY_ROSTER.filter(e => e.id !== 'Rosenspiegel' && e.firstWave > reached).sort((a,z) => a.firstWave-z.firstWave)[0];
        el('journal-next-enemy').textContent = t(next ? t("Nächster neuer Gegnertyp: {0} ab Welle {1}.", next.name, next.firstWave) : t('Alle normalen Gegnertypen verfügbar. Weitere Wellen wechseln zwischen Schwärmen, Tempo, Panzern und Unterstützung.'));
        el('journal-enemy-roster').replaceChildren(...ENEMY_ROSTER.filter(e => e.id !== 'Rosenspiegel' && e.firstWave <= Math.max(1, reached)).map(e => {
          const item = document.createElement('li'), title = document.createElement('strong'), copy = document.createElement('p');
          title.textContent = t("{0} · ab Welle {1}", e.name, e.firstWave);
          copy.textContent = t("{0}{1}. {2}.", e.flying ? t('Flieger · ') : '', e.role, e.counter);
          item.append(title, copy); return item;
        }));
      }
      const key = JSON.stringify([language(), activeMode, p.waves, p.totals, b.wave, b.phase]);
      if (key !== tableKey) {
        tableKey = key;
        const counts = p.totals[activeMode];
        el('history-total').textContent = t("{0} Versuche · {1} Siege · {2} Niederlagen", gold(counts.attempts), gold(counts.wins), gold(counts.losses));
        const rows = [...p.waves].filter(row => row[activeMode].attempts > 0).sort((a, z) => z.wave - a.wave);
        el('history-empty').hidden = rows.length > 0;
        el('history-table').hidden = rows.length === 0;
        el('history-body').replaceChildren(...rows.map(row => {
          const tr = document.createElement('tr');
          if (row.wave === b.wave) tr.className = 'current-wave';
          for (const value of [String(row.wave), gold(row[activeMode].attempts), gold(row[activeMode].wins), gold(row[activeMode].losses)]) {
            const td = document.createElement('td'); td.textContent = t(value); tr.append(td);
          }
          return tr;
        }));
      }
    },
  };
}
