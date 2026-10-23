import { t } from './i18n';
import type { IdleBattle, DiscoveryStage } from './battle';
import type { BattleSession } from './battle-session';
const el = <T extends HTMLElement = HTMLElement>(id: string) => document.getElementById(id)! as T;
export function discoveryStep(b: IdleBattle): DiscoveryStage | undefined {
  if (!b.discoveryActive || b.discovery === 'wisp' && !b.wispUnlocked || b.discovery === 'warehouse' && !b.warehouseUnlocked) return;
  return b.discovery;
}
export function updateDiscoveryUI(live: BattleSession, contextOpen: boolean, placing: boolean, catalog: 'tower' | 'settlement'): void {
  const b = live.battle, step = discoveryStep(b), card = el('discovery-card');
  el('app').dataset.discovery = b.discovery;
  card.hidden = !step || step === 'wisp' || contextOpen || placing || live.awaitingResume || !!live.error;
  if (b.discoveryPaused) {
    el('wave-mode').textContent = t('Lernpause'); el('pause-state').textContent = t('LERNPAUSE');
    el('battle-phase').textContent = t(step === 'wisp' ? t('Wisp begrüßen · nächste Welle wartet') : t('Übertakten ansehen · Kampf wartet'));
  }
  let title = '', text = '', next = '', later = t('Später entdecken');
  switch (step) {
    case 'mara-wait':
      title = t('Jetzt zeigt Mara Übertakten');
      text = t('Ein Turm schießt 8 Sekunden lang 50 % schneller. Nach deinem Tipp wartet Mara auf Gegner und zeigt dir den Zauber.');
      next = t('Übertakten zeigen'); break;
    case 'mara-ready':
      title = b.mara.cooldownRemaining > 0 ? t("Mara · bereit in {0} s", Math.ceil(b.mara.cooldownRemaining)) : b.mara.autoCast ? t('Mara wartet auf Gegner am Ziel') : t('Mara · Zauber im Porträt auslösen');
      later = '×'; break;
    case 'mara-start':
      title = t('Dieser Turm bekommt Übertakten');
      text = t('Mara hat gerade gezaubert. Der goldene Ring zeigt ihr Ziel: 8 Sekunden lang 50 % höhere Feuerrate. Sieh dir die Wirkung in Ruhe an.');
      next = t('Verstärkung ansehen'); break;
    case 'mara-effect':
      title = t("Übertakten · {0} s", Math.ceil(b.mara.effectRemaining));
      text = t('+50 % Feuerrate · goldener Ring am Turm');
      later = '×'; break;
    case 'mara-controls':
      title = t('Mara unterstützt automatisch');
      text = t('Porträt: Automatik, Zauber und Bewegung.');
      next = t('Weiter'); later = ''; break;
    case 'cannon':
      title = t('Neu: die Steinschleuder');
      text = catalog === 'tower' ? t('Sie trifft mehrere Gegner zugleich. Wähle unten die Steinschleuder und einen Platz bei Frost. Optional · 135 Gold.')
        : t('Unter „Türme“ findest du jetzt die Steinschleuder. Sie trifft Gegnergruppen; Frost hält sie länger zusammen. Optional · 135 Gold.');
      break;
    case 'warehouse':
      title = t('Neu in der Siedlung: Vorratslager');
      text = t('Wenn du das Spiel schließt, sammelt deine sichere Verteidigung weiter. Das Lager verlängert das Sammeln von 2 auf 8 Stunden. Optional · 650 Gold.');
      break;
  }
  card.dataset.strip = String(step === 'mara-ready' || step === 'mara-effect' || step === 'mara-controls');
  el('discovery-copy').hidden = !text;
  el('discovery-title').textContent = t(title); el('discovery-copy').textContent = t(text);
  const primary = el<HTMLButtonElement>('discovery-next'), secondary = el<HTMLButtonElement>('discovery-later');
  primary.textContent = t(next); primary.hidden = !next; secondary.textContent = t(later); secondary.hidden = !later; secondary.setAttribute('aria-label', t('Erklärung schließen und später entdecken'));
  primary.disabled = secondary.disabled = live.paused || !!live.error || live.suspended;
  if (contextOpen && step === 'mara-controls') { el('lesson-note').hidden = false; el('lesson-note').textContent = t('Automatik wartet auf Gegner. Manuelles Zaubern und Bewegung sind optional. Schließe das Fenster, wenn du fertig bist.'); }
}
