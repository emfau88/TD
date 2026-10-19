import type { BattleSession } from './battle-session';
const el = <T extends HTMLElement = HTMLElement>(id: string) => document.getElementById(id)! as T;
export function updateOnboarding(live: BattleSession, view: { placing: boolean; contextOpen: boolean; catalogPanel: 'tower' | 'settlement'; revealing: boolean }): void {
  const { placing, contextOpen, catalogPanel, revealing } = view;
  const b = live.battle, stage = b.introduction.stage, active = stage !== 'done', complete = b.lessonComplete;
  el('app').classList.toggle('preparing', b.preparing); el('app').classList.toggle('guiding', b.guiding);
  el('app').classList.toggle('introducing', active); el('app').dataset.intro = stage;
  el('onboarding-card').hidden = !active || placing || contextOpen || revealing || live.awaitingResume;
  el('onboarding-card').dataset.compact = String(stage !== 'welcome');
  el('onboarding-card').dataset.stage = stage;
  el('onboarding-card').dataset.complete = String(complete);
  const primary = el<HTMLButtonElement>('onboarding-primary'), secondary = el<HTMLButtonElement>('onboarding-secondary');
  primary.disabled = live.paused || !!live.error || live.suspended;
  secondary.disabled = primary.disabled; secondary.hidden = !b.guiding && stage !== 'ready';
  const waiting = b.guiding && !b.learningPaused;
  const saving = waiting && (b.lessonCost > 0 || stage === 'workshop');
  el('app').classList.toggle('saving', saving);
  el('onboarding-card').hidden ||= saving;
  el('lesson-savings').hidden = !saving || placing || contextOpen || live.awaitingResume;
  el('lesson-savings-label').textContent = stage === 'workshop' ? 'Erste Welle überstehen' : stage === 'research' ? 'Spare auf Frostforschung' : 'Spare auf den Frostturm';
  el('lesson-savings-value').textContent = stage === 'workshop' ? 'Bausatz danach' : `${Math.min(Math.floor(b.gold), b.lessonCost)} / ${b.lessonCost} G`;
  const savings = el<HTMLProgressElement>('lesson-savings-progress'); savings.max = Math.max(1,b.lessonCost); savings.value = Math.min(b.gold,b.lessonCost); savings.hidden = stage === 'workshop';
  secondary.hidden ||= complete;
  const progress = ['welcome', 'build', 'ready'].includes(stage) ? 1 : ['combat', 'upgrade'].includes(stage) ? 2 : stage === 'workshop' ? 3 : stage === 'research' ? 4 : stage === 'frost' ? 5 : 6;
  el('onboarding-eyebrow').textContent = `Mara · Schritt ${progress} von 6${b.learningPaused ? ' · Lernpause' : ''}`;
  let copy: [string, string, string];
  switch (stage) {
    case 'welcome': copy = ['Willkommen im alten Hain', 'Ich bin Mara. Gemeinsam schützen wir diesen Wald. Ich zeige dir, wie du deinen ersten Turm baust. Bis dahin kommen keine Gegner.', 'Los geht’s']; break;
    case 'build': copy = ['Wähle deinen Waldwächter', 'Tippe unten im Menü „Türme“ auf den kostenlosen Startturm. Danach wählen wir einen Platz am Weg.', '']; break;
    case 'ready': copy = ['Dein Turm ist bereit', 'Er schießt selbst. Ich unterstütze ihn mit Magie und halte für Erklärungen den Kampf an.', 'Verteidigung starten']; break;
    case 'combat': copy = ['Dein Turm kämpft selbst', 'Jeder besiegte Käfer bringt Gold. Nach dem ersten Treffer zeige ich dir das Upgrade.', '']; break;
    case 'upgrade': copy = complete ? ['Level 2 genügt zunächst', 'Jetzt überstehen wir die erste Welle. Danach habe ich einen kostenlosen Werkstatt-Bausatz für dich.', 'Weiter · Welle beenden']
      : ['Tippe auf deinen Waldwächter', 'Die Welle wartet. Öffne den markierten Turm und verbessere ihn einmal für 60 Gold auf Level 2.', '']; break;
    case 'workshop': copy = complete ? ['Deine Werkstatt steht', 'Hier erforschst du neue Turmtypen. Dein gespartes Gold verwenden wir für Frosttechnik.', 'Weiter · Frosttechnik entdecken']
      : waiting ? ['Die erste Welle läuft', 'Nach dem Sieg steht dein kostenloser Werkstatt-Bausatz bereit.', '']
      : catalogPanel === 'settlement' ? ['Wähle die Werkstatt', 'Tippe unten auf die Werkstatt-Karte. Anschließend setzt du den kostenlosen Bausatz auf die Wiese.', '']
      : ['Dein Werkstatt-Bausatz ist bereit', 'Öffne unten „Siedlung“. Dort findest du deine Gebäude. Die Welle wartet.', '']; break;
    case 'research': copy = complete ? ['Frostkristall freigeschaltet', 'Jetzt bauen wir den neuen Turm neben deinen Waldwächter. Er kostet 110 Gold.', 'Weiter · Frostturm bauen']
      : ['Öffne deine Werkstatt', 'Tippe auf das neue Gebäude auf der Karte. Dort erforschst du die Frostfassung für 60 Gold.', '']; break;
    case 'frost': copy = complete ? ['Frost und Pfeile wirken zusammen', 'Lass uns einen Treffer ansehen: Langsame Gegner bleiben länger im Pfeilhagel.', 'Weiter · Kombination ansehen']
      : catalogPanel === 'tower' ? ['Wähle den Frostkristall', 'Tippe unten auf den Frostkristall. Danach wählen wir einen Platz mit überlappender Reichweite.', '']
      : ['Zurück zu deinen Türmen', 'Öffne unten „Türme“. Der erforschte Frostkristall ist jetzt dort verfügbar.', '']; break;
    default: copy = complete ? ['Deine erste Kombination arbeitet', 'Frost bremst, Pfeile verursachen Schaden. Du kannst jetzt frei bauen und aufwerten. Nach Welle 5 stellt sich Wisp vor.', 'Selbst weiterspielen']
      : ['Achte auf den blauen Treffer', 'Frost bremst die Gegner und gibt dem Waldwächter mehr Zeit.', ''];
  }
  el('onboarding-title').textContent = copy[0]; el('onboarding-copy').textContent = copy[1]; primary.textContent = copy[2];
  primary.hidden = !copy[2]; primary.disabled ||= waiting || revealing;
  secondary.hidden = stage !== 'ready'; secondary.textContent = 'Standort ändern · kostenlos';
  el('skip-lessons').hidden = !b.guiding;
  el('onboarding-actions')?.classList.toggle('empty', primary.hidden && secondary.hidden);
  el('lesson-goal').hidden = true;
  el('lesson-note').hidden = !b.guiding || !contextOpen;
  el('lesson-note').textContent = stage === 'upgrade' ? 'Die Welle wartet. Einmal „Aufwerten“ genügt.'
    : stage === 'research' ? 'Die Welle wartet. Erforsche hier die Frostfassung.' : 'Schließe die Auswahl, um den nächsten Klick zu sehen.';
  el('archer-price').textContent = b.preparing ? stage === 'ready' ? 'Kostenlos versetzen' : '1 kostenloser Bausatz' : b.guiding ? 'Einmal auf Level 2' : '75';
  el('archer-title').textContent = b.preparing ? 'Startturm' : 'Waldwächter';
  el('pick-archer').setAttribute('aria-label', b.preparing ? 'Kostenlosen Startturm platzieren oder versetzen' : b.guiding ? 'Startturm und erstes Upgrade ansehen' : 'Waldwächter platzieren · 75 Gold');
  if (b.guiding) {
    el<HTMLButtonElement>('pick-archer').disabled = stage !== 'upgrade';
    el<HTMLButtonElement>('pick-frost').disabled = stage !== 'frost' || !b.learningPaused || complete;
    el('wave-mode').textContent = b.learningPaused ? 'Lernpause' : 'Lernphase';
    el('battle-phase').textContent = b.learningPaused ? 'Lernpause · Die Welle wartet' : stage === 'workshop' ? 'Erste Welle · danach Werkstatt bauen' : 'Übungswellen 1–2';
    if (stage !== 'upgrade' || complete) el<HTMLButtonElement>('upgrade').disabled = true;
    el<HTMLButtonElement>('sell').disabled = true;
    el<HTMLButtonElement>('research-frost').disabled ||= stage !== 'research';
    el<HTMLButtonElement>('build-workshop').disabled ||= stage !== 'workshop';
  } else { el<HTMLButtonElement>('pick-archer').disabled = false; el<HTMLButtonElement>('pick-frost').disabled = false; }
  if (b.learningPaused) { el('pause-state').textContent = 'LERNPAUSE'; el<HTMLButtonElement>('pause').disabled = true; }
  if (b.preparing) {
    el('wave').textContent = '—'; el('wave-mode').textContent = 'Vorbereitung';
    el('record-wave').textContent = 'Noch kein Kampf'; el('live-income').textContent = 'Startkapital · 0 G/min';
    el('battle-phase').textContent = 'Erst bauen, dann Verteidigung starten'; el('pause-state').textContent = 'BEREIT';
    el<HTMLButtonElement>('pause').disabled = true;
  }
}
