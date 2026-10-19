import type { BattleSession } from './battle-session';
const el = <T extends HTMLElement = HTMLElement>(id: string) => document.getElementById(id)! as T;
export function updateOnboarding(live: BattleSession, placing: boolean, contextOpen: boolean): void {
  const b = live.battle, stage = b.introduction.stage;
  const active = stage !== 'done';
  el('app').classList.toggle('preparing', b.preparing);
  el('app').classList.toggle('introducing', active);
  el('onboarding-card').hidden = !active || placing || contextOpen || live.awaitingResume;
  el('onboarding-card').dataset.stage = stage;
  const primary = el<HTMLButtonElement>('onboarding-primary'), secondary = el<HTMLButtonElement>('onboarding-secondary');
  primary.disabled = live.paused || !!live.error || live.suspended;
  secondary.disabled = primary.disabled;
  secondary.hidden = !['ready', 'practice', 'auto'].includes(stage);
  const copy = stage === 'welcome' ? ['Willkommen im alten Hain', 'Ich bin Mara. Ich unterstütze deine Türme mit Magie. Hilf mir, den Hain zu verteidigen.', 'Erste Verteidigung bauen']
    : stage === 'build' ? ['Dein erster Waldwächter', 'Ein Bausatz ist kostenlos. Wähle ein helles Feld am Weg und prüfe die Reichweite. Die Käfer warten, bis du bereit bist.', 'Startturm platzieren']
    : stage === 'ready' ? ['Bereit, wenn du es bist', 'Die Käfer kommen links vom Waldweg. Schütze den leuchtenden Kern am Ende! Dein Turm greift selbstständig an. Du behältst deine 75 Gold.', 'Verteidigung starten']
    : stage === 'practice' ? [b.kills ? 'Jeder besiegte Käfer bringt Gold' : 'Unsere erste Verteidigung', b.canPracticeSpell ? 'Jetzt sind Gegner in Reichweite! Verstärke deinen Startturm mit meinem Fernzauber: 8 Sekunden lang feuert er 50 % schneller.' : 'Dein Turm kämpft automatisch. Sobald Gegner in seiner Reichweite sind, zeige ich dir meinen Fernzauber. Du darfst währenddessen weiterbauen.', 'Startturm mit Magie verstärken']
    : ['So wirkt Übertakten', `${b.mara.effectRemaining > 0 ? `Noch ${Math.ceil(b.mara.effectRemaining)} Sekunden: ` : ''}Der Ring am Turm zeigt die Wirkzeit. Ich kann künftig selbst zaubern, sobald Gegner am Ziel sind. Du kannst mich unabhängig davon bewegen.`, 'Automatik einschalten'];
  el('onboarding-title').textContent = copy[0]; el('onboarding-copy').textContent = copy[1]; primary.textContent = copy[2];
  if (stage === 'practice') primary.disabled ||= !b.canPracticeSpell;
  secondary.textContent = stage === 'ready' ? 'Standort ändern · kostenlos' : stage === 'auto' ? 'Manuell weiterspielen' : 'Direkt mit Automatik weiter';
  el('archer-price').textContent = b.preparing ? stage === 'ready' ? 'Kostenlos versetzen' : '1 kostenloser Bausatz' : '75';
  el('pick-archer').setAttribute('aria-label', b.preparing ? 'Kostenlosen Startturm platzieren oder versetzen' : 'Waldwächter platzieren · 75 Gold');
  el('archer-title').textContent = b.preparing ? 'Startturm' : 'Waldwächter';
  if (b.preparing) {
    el('wave').textContent = '—'; el('wave-mode').textContent = 'Vorbereitung';
    el('record-wave').textContent = 'Noch kein Kampf'; el('live-income').textContent = 'Startkapital · 0 G/min';
    el('battle-phase').textContent = 'Erst bauen, dann Verteidigung starten'; el('pause-state').textContent = 'BEREIT';
    el<HTMLButtonElement>('pause').disabled = true;
  }
}
