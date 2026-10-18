import { farmRewardGold } from './farming';
import { waveCount, SETTLEMENT, FROST, upgradeCost, type IdleBattle } from './battle';
import type { BattleSession } from './battle-session';
import { offlinePolicy } from './offline';
import { IncomeWindow, HISTORY_LIMIT, type AttemptMode } from './progress';
import { tutorialStep } from './hud';

export type GoalAction = 'archer' | 'upgrade' | 'workshop' | 'warehouse' | 'frost' | 'cannon' | 'sniper' | 'boss' | 'progress';
const el = <T extends HTMLElement = HTMLElement>(id: string) => document.getElementById(id)! as T;
const number = new Intl.NumberFormat('de-DE', { maximumFractionDigits: 0 });
const gold = (value: number) => number.format(value);
const padNames: Record<string, string> = { 'tower-start': 'Startturm', 'tower-02': 'Nordwest', 'tower-03': 'Nordost', 'tower-04': 'Südkurve' };
interface Goal { title: string; detail: string; action: GoalAction; cost?: number; label: string }
export function currentGoal(battle: IdleBattle): Goal {
  const need = (price: number) => battle.gold >= price ? 'Bereit' : `Noch ${gold(price - battle.gold)} Gold`;
  switch (tutorialStep(battle)) {
    case 0: case 1: return { title: 'Verstärke die Verteidigung', detail: `${need(75)} · Waldwächter bauen`, cost: 75, action: 'archer', label: 'Waldwächter auswählen' };
    case 2: {
      const tower = battle.towers.find(t => t.level < battle.maxLevel)!;
      const cost = tower ? upgradeCost(tower) : 60;
      return { title: 'Dein erstes Turmupgrade', detail: `${need(cost)} · mehr Schaden`, cost, action: 'upgrade', label: 'Turm auswählen' };
    }
    case 3: return { title: 'Die Werkstatt wieder aufbauen', detail: `${need(SETTLEMENT.workshopCost)} · eröffnet Forschung`, cost: SETTLEMENT.workshopCost, action: 'workshop', label: 'Werkstatt ansehen' };
    case 4: return { title: 'Frostfassung erforschen', detail: `${need(SETTLEMENT.researchCost)} · Frostturm & Level 4–6`, cost: SETTLEMENT.researchCost, action: 'workshop', label: 'Forschung ansehen' };
    case 5: return { title: 'Frost und Pfeile kombinieren', detail: `${need(FROST.cost)} · Frostkristall platzieren`, cost: FROST.cost, action: 'frost', label: 'Frostkristall auswählen' };
    case 6: return { title: 'Die Frosttechnik wirkt', detail: 'Ersten Frosttreffer beobachten · Gegner werden langsamer', action: 'progress', label: 'Fortschritt ansehen' };
    case 7: return { title: 'Wisp für die Werkstatt gewinnen', detail: 'Welle 5 meistern · +10 % Gold & zwei Bauplätze', action: 'upgrade', label: 'Verteidigung verbessern' };
    case 8: return { title: 'Käfergruppen gemeinsam treffen', detail: `${need(135)} · Steinschleuder neben Frost`, cost: 135, action: 'cannon', label: 'Steinschleuder auswählen' };
    case 12: return { title: 'Vorräte für deine Rückkehr', detail: `${need(SETTLEMENT.warehouseCost)} · 65 % Ertrag für 8 Stunden`, cost: SETTLEMENT.warehouseCost, action: 'warehouse', label: 'Vorratslager ansehen' };
    case 13: return { title: 'Den Weg bis Welle 8 sichern', detail: 'Vorratslager freischalten · längere Offline-Erträge', action: 'upgrade', label: 'Verteidigung verbessern' };
    case 9: return { title: 'Den Weg bis Welle 10 sichern', detail: 'Scharfschütze & zwei weitere Bauplätze freischalten', action: 'upgrade', label: 'Verteidigung verbessern' };
    case 10: return { title: 'Für Rüstung gewappnet', detail: `${need(170)} · Scharfschütze durchdringt Panzer`, cost: 170, action: 'sniper', label: 'Scharfschütze auswählen' };
    case 14: return battle.highestCleared >= 14
      ? { title: 'Rosenspiegel stellt sich dir', detail: 'Welle 15 · 750 Gold Erstprämie · Frost unterbricht', action: 'boss', label: 'Bossherausforderung ansehen' }
      : { title: 'Bereite dich auf Rosenspiegel vor', detail: 'Boss in Welle 15 · Frost, Fläche und Durchdringung', action: 'upgrade', label: 'Verteidigung verbessern' };
    default: return battle.mode === 'farm'
      ? { title: `Bereite Welle ${battle.highestCleared + 1} vor`, detail: 'Türme aufwerten · dann erneut vorstoßen', action: 'upgrade', label: 'Verteidigung ansehen' }
      : { title: `Nächster Rekord: Welle ${battle.highestCleared + 1}`, detail: 'Vier Turmrollen · bis Level 6 ausbauen', action: 'upgrade', label: 'Verteidigung ansehen' };
  }
}

export function createProgressUI(goTo: (action: GoalAction) => void, signal: AbortSignal) {
  const dialog = el<HTMLDialogElement>('chronicle');
  const income = new IncomeWindow();
  let activeMode: AttemptMode = 'advance', tableKey = '', goal: Goal | undefined;
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
    reset() { income.reset(); tableKey = ''; },
    update(live: BattleSession) {
      const b = live.battle, p = b.progress, rate = income.observe(b.elapsed, p.battleGold);
      const stopped = live.paused || live.awaitingResume || live.suspended || Boolean(live.error);
      const certificate = live.certificate;
      const safe = certificate ? farmRewardGold(certificate) * 60000 / certificate.durationMs : 0;
      const policy = offlinePolicy(b.settlement.warehouseBuilt), offline = safe * policy.efficiencyPermille / 1000;
      const rateText = stopped ? `${live.paused ? 'Pause' : 'Angehalten'} · 0 G/min` : rate.perMinute === null ? 'Ertrag wird ermittelt' : `Ø ${gold(rate.perMinute)} G/min`;
      el('live-income').textContent = rateText;
      el('gold-summary').title = `Laufender Goldzufluss aus Kampfbelohnungen. ${Math.floor(rate.seconds)} aktive Sekunden gemessen. Details öffnen.`;
      el('record-wave').textContent = `Rekord ${b.highestCleared}`;
      el('wave-mode').textContent = live.paused ? 'Pause' : b.phase === 'defeat' ? 'Rückzug' : b.mode === 'farm' ? 'Farmen' : 'Vorstoß';
      el('wave-summary').setAttribute('aria-label', `Welle ${b.wave}, ${b.mode === 'farm' ? 'Farmen' : 'Vorstoß'}. Höchste besiegte Welle ${b.highestCleared}. Chronik öffnen`);
      const total = waveCount(b.wave, b.waveRecipeVersion);
      el<HTMLProgressElement>('wave-progress').max = Math.max(1, total);
      el<HTMLProgressElement>('wave-progress').value = b.phase === 'wave' ? total - b.remaining : b.wave ? total : 0;
      el('wave-progress').setAttribute('aria-label', b.phase === 'wave' ? `${b.remaining} von ${total} Gegnern verbleiben` : 'Wellenpause');
      goal = currentGoal(b);
      el('goal-title').textContent = goal.title;
      el('goal-copy').textContent = goal.detail;
      el('goal-action').setAttribute('aria-label', goal.label);
      const meter = el<HTMLProgressElement>('goal-progress');
      meter.hidden = goal.cost === undefined;
      meter.max = goal.cost ?? 1; meter.value = Math.min(b.gold, goal.cost ?? 1);
      meter.setAttribute('aria-label', `${gold(b.gold)} von ${goal.cost ?? 0} Gold`);
      el('journal-goal-title').textContent = goal.title;
      el('journal-goal-copy').textContent = goal.detail;
      el('journal-goal-action').textContent = goal.label;
      el('journal-companions-count').textContent = `${b.wispUnlocked ? 2 : 1} verfügbar`;
      el('journal-wisp-order').textContent = b.wispUnlocked ? `Auftrag: ${b.settlement.warehouseBuilt ? 'Werkstatt und Lager' : 'Werkstatt'} versorgen · +10 % Kampf-Gold. Bereits in Live-Ertrag und Farmbasis enthalten.` : 'Kommt kostenlos nach Frostfassung und gemeisterter Welle 5.';
      const target = b.towers.find(t => t.uid === b.mara.targetTowerUid);
      const assignment = target ? padNames[target.padId] ?? target.def.name : 'Startturm';
      el('mara-brief').textContent = b.mara.path.length ? `Unterwegs · ${assignment}` : `Unterstützt ${assignment}`;
      el('journal-mara-order').textContent = b.mara.path.length ? `Unterwegs zur Unterstützung: ${assignment}` : `Auftrag: ${assignment} unterstützen`;
      el('journal-boss-status').textContent = b.bossVictories ? `${b.bossVictories} Sieg${b.bossVictories === 1 ? '' : 'e'} · Erstprämie bereits erhalten.`
        : b.bossActive ? 'Bosskampf läuft · Sieg erst nach Boss und allen Begleitern.'
        : b.highestCleared >= 15 ? 'Noch kein Bosssieg aufgezeichnet. Dein früherer Wellenrekord bleibt erhalten; fordere Rosenspiegel hier heraus.' : 'Noch unbesiegt · Herausforderung ab gemeisterter Welle 14.';
      const challenge = el<HTMLButtonElement>('challenge-boss');
      challenge.disabled = stopped || live.busy || b.highestCleared < 14 || b.bossActive || b.bossChallengeRequested;
      challenge.textContent = b.bossChallengeRequested ? 'Boss am nächsten Wellenwechsel vorgemerkt' : b.bossVictories ? 'Boss erneut herausfordern · Welle 15' : 'Boss herausfordern · Welle 15';
      el('journal-record').textContent = String(b.highestCleared);
      el('journal-current').textContent = `${b.wave || '—'} · ${b.mode === 'farm' ? 'Farmen' : 'Vorstoß'}`;
      el('journal-safe-wave').textContent = certificate ? `Welle ${certificate.wave}` : 'Wird geprüft';
      el('journal-earned').textContent = `${gold(p.battleGold)} G`;
      el('journal-live-rate').textContent = rateText;
      el('journal-rate-note').textContent = rate.perMinute === null ? 'Nach 15 aktiven Sekunden erscheint eine erste Schätzung. Nach 60 Sekunden ist das Messfenster vollständig.'
        : `Durchschnitt der letzten ${Math.floor(rate.seconds)} aktiven Sekunden. Käufe, Verkäufe und Offline-Gutschriften zählen nicht dazu. Nach Neuladen beginnt die Messung neu.`;
      el('journal-safe-rate').textContent = certificate ? `${gold(safe)} G/min` : 'Noch kein Nachweis';
      el('journal-offline-rate').textContent = live.paused ? '0 G/min · Pause aktiv' : `${gold(offline)} G/min`;
      el('journal-offline-note').textContent = `${policy.efficiencyPermille / 10} % der sicheren Farmbasis · höchstens ${policy.limitMs / 3600000} Stunden. ${certificate ? `Bei unveränderter Verteidigung etwa ${gold(live.paused ? 0 : offline * 60)} Gold in einer Stunde.` : 'Zuerst eine Welle zuverlässig besiegen.'}`;
      const defeat = p.lastDefeat;
      const fallback = b.mode === 'farm' && defeat;
      el('fallback-note').hidden = !fallback || live.awaitingResume;
      el('fallback-copy').textContent = fallback ? `Welle ${defeat.wave} nicht geschafft. Jetzt Farmen auf Welle ${b.farmWave}. Gold, Türme und Forschung bleiben erhalten.` : '';
      el('journal-last-defeat').textContent = defeat ? `Letzte Niederlage: Welle ${defeat.wave}. Gold und Ausbau blieben erhalten.` : p.sinceAttempt > 1 ? 'Vor dem Update wurde keine Niederlagenhistorie aufgezeichnet.' : 'Bisher keine Niederlage.';
      el('history-note').textContent = p.sinceAttempt > 1
        ? `Aufzeichnung ab Versuch ${p.sinceAttempt}. Frühere Versuche sind unbekannt; laufende Altversuche werden nicht nachträglich gezählt. Die letzten ${HISTORY_LIMIT} verschiedenen Wellen bleiben einzeln erhalten.`
        : `Aufzeichnung seit Spielbeginn. Ein Neuladen zählt nicht als neuer Versuch. Die letzten ${HISTORY_LIMIT} verschiedenen Wellen bleiben einzeln erhalten.`;
      const key = JSON.stringify([activeMode, p.waves, p.totals, b.wave, b.phase]);
      if (key !== tableKey) {
        tableKey = key;
        const counts = p.totals[activeMode];
        el('history-total').textContent = `${gold(counts.attempts)} Versuche · ${gold(counts.wins)} Siege · ${gold(counts.losses)} Niederlagen`;
        const rows = [...p.waves].filter(row => row[activeMode].attempts > 0).sort((a, z) => z.wave - a.wave);
        el('history-empty').hidden = rows.length > 0;
        el('history-table').hidden = rows.length === 0;
        el('history-body').replaceChildren(...rows.map(row => {
          const tr = document.createElement('tr');
          if (row.wave === b.wave) tr.className = 'current-wave';
          for (const value of [String(row.wave), gold(row[activeMode].attempts), gold(row[activeMode].wins), gold(row[activeMode].losses)]) {
            const td = document.createElement('td'); td.textContent = value; tr.append(td);
          }
          return tr;
        }));
      }
    },
  };
}
