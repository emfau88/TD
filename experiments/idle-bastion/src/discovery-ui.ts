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
    el('wave-mode').textContent = 'Lernpause'; el('pause-state').textContent = 'LERNPAUSE';
    el('battle-phase').textContent = step === 'wisp' ? 'Wisp begrüßen · nächste Welle wartet' : 'Übertakten ansehen · Kampf wartet';
  }
  let title = '', text = '', next = '', later = 'Später entdecken';
  switch (step) {
    case 'mara-wait':
      title = 'Gleich zeigt Mara ihre Magie';
      text = b.mara.autoCast ? `Deine Verteidigung läuft weiter. Beim nächsten Übertakten zeige ich dir den verstärkten Turm.${b.mara.cooldownRemaining > 0 ? ` Bereit in ${Math.ceil(b.mara.cooldownRemaining)} s.` : ' Mara wartet auf Gegner am Ziel.'}`
        : 'Die Automatik ist aus. Öffne Maras Porträt: Dort kannst du Übertakten auslösen, sobald es bereit ist, oder die Automatik einschalten.';
      break;
    case 'mara-start':
      title = 'Dieser Turm bekommt Übertakten';
      text = 'Mara hat gerade gezaubert. Der goldene Ring zeigt ihr Ziel: 8 Sekunden lang 50 % höhere Feuerrate. Sieh dir die Wirkung in Ruhe an.';
      next = 'Verstärkung ansehen'; break;
    case 'mara-effect':
      title = `Übertakten · ${Math.ceil(b.mara.effectRemaining)} s`;
      text = 'Der leuchtende Turm schießt 50 % schneller. Sein goldener Ring und die Zahl darüber zeigen die verbleibende Wirkzeit.';
      later = ''; break;
    case 'mara-controls':
      title = 'Mara unterstützt automatisch';
      text = 'Im Mara-Porträt findest du Automatik, manuelles Zaubern und Bewegung. Du kannst diese Einstellungen ansehen; nichts muss umgestellt werden.';
      next = 'Weiter zu den Türmen'; later = ''; break;
    case 'cannon':
      title = 'Neu: die Steinschleuder';
      text = catalog === 'tower' ? 'Sie trifft mehrere Gegner zugleich. Wähle unten die Steinschleuder und einen Platz bei Frost. Optional · 135 Gold.'
        : 'Unter „Türme“ findest du jetzt die Steinschleuder. Sie trifft Gegnergruppen; Frost hält sie länger zusammen. Optional · 135 Gold.';
      break;
    case 'warehouse':
      title = 'Neu in der Siedlung: Vorratslager';
      text = 'Wenn du das Spiel schließt, sammelt deine sichere Verteidigung weiter. Das Lager verlängert das Sammeln von 2 auf 8 Stunden. Optional · 650 Gold.';
      break;
  }
  el('discovery-title').textContent = title; el('discovery-copy').textContent = text;
  const primary = el<HTMLButtonElement>('discovery-next'), secondary = el<HTMLButtonElement>('discovery-later');
  primary.textContent = next; primary.hidden = !next; secondary.textContent = later; secondary.hidden = !later;
  primary.disabled = secondary.disabled = live.paused || !!live.error || live.suspended;
  if (contextOpen && step === 'mara-controls') { el('lesson-note').hidden = false; el('lesson-note').textContent = 'Automatik wartet auf Gegner. Manuelles Zaubern und Bewegung sind optional. Schließe das Fenster, wenn du fertig bist.'; }
}
