import type { BattleSession } from './battle-session';
const el = <T extends HTMLElement = HTMLElement>(id: string) => document.getElementById(id)! as T;
export function updateOnboarding(live: BattleSession, placing: boolean, contextOpen: boolean): void {
  const b = live.battle, stage = b.introduction.stage, active = stage !== 'done', complete = b.lessonComplete;
  el('app').classList.toggle('preparing', b.preparing); el('app').classList.toggle('guiding', b.guiding);
  el('app').classList.toggle('introducing', active); el('app').dataset.intro = stage;
  el('onboarding-card').hidden = !active || placing || contextOpen || live.awaitingResume;
  el('onboarding-card').dataset.stage = stage;
  const primary = el<HTMLButtonElement>('onboarding-primary'), secondary = el<HTMLButtonElement>('onboarding-secondary');
  primary.disabled = live.paused || !!live.error || live.suspended;
  secondary.disabled = primary.disabled; secondary.hidden = !b.guiding && stage !== 'ready';
  const missing = Math.max(0, b.lessonCost - b.gold), waiting = b.guiding && !b.learningPaused;
  const progress = ['welcome', 'build', 'ready'].includes(stage) ? 1 : ['combat', 'upgrade'].includes(stage) ? 2 : stage === 'workshop' ? 3 : stage === 'research' ? 4 : stage === 'frost' ? 5 : 6;
  el('onboarding-eyebrow').textContent = `Mara · Schritt ${progress} von 6${b.learningPaused ? ' · Lernpause' : ''}`;
  let copy: [string, string, string];
  switch (stage) {
    case 'welcome': copy = ['Willkommen im alten Hain', 'Ich bin Mara. Gemeinsam schützen wir diesen Wald. Ich zeige dir zuerst einen guten Platz für deinen kostenlosen Waldwächter.', 'Ersten Bauplatz zeigen']; break;
    case 'build': copy = ['Dein erster Waldwächter', 'Tippe auf das goldene Feld am Weg. Der Kreis zeigt seine Reichweite. Bestätige danach den kostenlosen Bau. Die Käfer warten.', 'Bauplatz zeigen']; break;
    case 'ready': copy = ['Bereit für die ersten Käfer?', 'Sie kommen von links. Dein Turm schießt selbst; ich unterstütze ihn mit Magie. Für die nächsten Erklärungen halten wir den Kampf kurz an.', 'Verteidigung starten']; break;
    case 'combat': copy = ['Dein Turm kämpft selbst', 'Beobachte die ersten Pfeile. Jeder besiegte Käfer bringt Gold. Danach zeige ich dir in Ruhe das erste Upgrade.', 'Ersten Treffer abwarten']; break;
    case 'upgrade': copy = complete ? ['Level 2 genügt zunächst', 'Gut! Dein Waldwächter verursacht jetzt mehr Schaden. Kaufe vorerst keine weiteren Upgrades: Unser nächstes Ziel ist die Werkstatt für 400 Gold.', 'Weiter · auf Werkstatt sparen']
      : ['Einmal auf Level 2 verbessern', 'Die Welle wartet. Tippe auf den goldmarkierten Turm und dann auf „Aufwerten · 60 Gold“. Ein Upgrade genügt vorerst.', 'Turm und Upgrade zeigen']; break;
    case 'workshop': copy = complete ? ['Die Werkstatt steht', 'Hier erforschst du neue Turmarten. Als Nächstes sammeln wir 60 Gold für die Frostfassung. Sie schaltet den Frostkristall frei.', 'Weiter · Frostforschung vorbereiten']
      : waiting ? ['Jetzt auf die Werkstatt sparen', `Noch ${missing} von 400 Gold fehlen. Gib vorerst nichts anderes aus. Wir wiederholen höchstens Welle 2, bis deine erste Kombination steht.`, 'Gold sammeln lassen']
      : ['Baue jetzt die Werkstatt', 'Die Welle wartet. Wähle einen Platz in der markierten Siedlungsfläche und bestätige den Bau für 400 Gold.', 'Werkstattplatz zeigen']; break;
    case 'research': copy = complete ? ['Frostkristall freigeschaltet', 'Die Forschung ist fertig; der Turm steht noch nicht. Dafür sammeln wir jetzt 110 Gold. Er soll dicht bei deinem Waldwächter stehen.', 'Weiter · auf Frostturm sparen']
      : waiting ? ['Auf die Frostfassung sparen', `Noch ${missing} Gold fehlen für die Forschung. Sobald 60 Gold bereitliegen, halten wir an und öffnen die Werkstatt.`, 'Gold sammeln lassen']
      : ['Erforsche die Frostfassung', 'Die Welle wartet. Öffne die Werkstatt und tippe auf „Frostfassung erforschen · 60 Gold“. Erst damit wird der Frostkristall baubar.', 'Forschung in der Werkstatt zeigen']; break;
    case 'frost': copy = complete ? ['Frost und Pfeile wirken zusammen', 'Der Frostturm steht neben deinem Waldwächter. Lass uns einen Treffer ansehen: Langsame Gegner bleiben länger im Pfeilhagel.', 'Weiter · Kombination ansehen']
      : waiting ? ['Spare auf den ersten Frostturm', `Noch ${missing} von 110 Gold fehlen. Die Forschung allein bremst noch keine Gegner; dafür bauen wir gleich den Turm.`, 'Gold sammeln lassen']
      : ['Baue den Frostkristall daneben', 'Die Welle wartet. Wähle das goldmarkierte Feld beim Waldwächter. Die beiden Reichweiten sollen sich überlappen. Bestätige den Bau für 110 Gold.', 'Frost-Bauplatz zeigen']; break;
    default: copy = complete ? ['Deine erste Kombination arbeitet', 'Der blaue Treffer bremst Gegner; Pfeile verursachen Schaden. Du kannst jetzt frei bauen und aufwerten. Nach Welle 5 stellt sich Wisp vor.', 'Selbst weiterspielen']
      : ['Schau auf den ersten Frosttreffer', 'Wir bleiben noch bei den frühen Wellen. Achte auf das blaue Projektil: Es bremst Gegner und gibt dem Waldwächter mehr Zeit.', 'Frosttreffer abwarten'];
  }
  el('onboarding-title').textContent = copy[0]; el('onboarding-copy').textContent = copy[1]; primary.textContent = copy[2];
  primary.disabled ||= waiting;
  secondary.textContent = stage === 'ready' ? 'Standort ändern · kostenlos' : 'Ohne Anleitung weiterspielen';
  const meter = el<HTMLProgressElement>('lesson-goal'); meter.hidden = !waiting || !b.lessonCost;
  meter.max = Math.max(1, b.lessonCost); meter.value = Math.min(b.gold, b.lessonCost);
  el('lesson-note').hidden = !b.guiding || !contextOpen;
  el('lesson-note').textContent = `${b.learningPaused ? 'Lernpause · Die Welle wartet. ' : ''}${stage === 'upgrade' ? 'Einmal auf Level 2 verbessern, danach auf die Werkstatt sparen.' : stage === 'research' ? 'Hier Frostfassung erforschen; anschließend bauen wir den Frostturm.' : 'Schließe die Auswahl, um Maras nächsten Schritt zu sehen.'}`;
  for (const id of ['upgrade', 'research-frost']) el(id).classList.toggle('lesson-target', b.learningPaused && !complete && (id === 'upgrade' ? stage === 'upgrade' : stage === 'research'));
  el('archer-price').textContent = b.preparing ? stage === 'ready' ? 'Kostenlos versetzen' : '1 kostenloser Bausatz' : b.guiding ? 'Einmal auf Level 2' : '75';
  el('archer-title').textContent = b.preparing ? 'Startturm' : 'Waldwächter';
  el('pick-archer').setAttribute('aria-label', b.preparing ? 'Kostenlosen Startturm platzieren oder versetzen' : b.guiding ? 'Startturm und erstes Upgrade ansehen' : 'Waldwächter platzieren · 75 Gold');
  if (b.guiding) {
    el<HTMLButtonElement>('pick-archer').disabled = stage !== 'upgrade';
    el<HTMLButtonElement>('pick-frost').disabled = stage !== 'frost' || !b.learningPaused || complete;
    el('wave-mode').textContent = b.learningPaused ? 'Lernpause' : 'Lernphase';
    el('battle-phase').textContent = b.learningPaused ? 'Lernpause · Erst mit Weiter geht es weiter' : 'Übungswellen 1–2 · Gold für den nächsten Schritt';
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
