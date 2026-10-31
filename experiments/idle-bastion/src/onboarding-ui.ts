import { t } from './i18n';
import type { BattleSession } from './battle-session';
import { INTRO_COPY, type MaraIntro } from './mara-intro';
import { tutorialProgress } from './tutorial-progress';
const el = <T extends HTMLElement = HTMLElement>(id: string) => document.getElementById(id)! as T;
export function updateOnboarding(live: BattleSession, view: { placing: boolean; contextOpen: boolean; catalogPanel: 'tower' | 'settlement'; revealing: boolean; intro?: MaraIntro; portraits?: string[] }): void {
  const { placing, contextOpen, catalogPanel, revealing } = view;
  const b = live.battle, stage = b.introduction.stage, active = stage !== 'done', complete = b.lessonComplete;
  const intro = stage === 'welcome' && view.intro?.active ? view.intro : undefined;
  const card = el('onboarding-card');
  card.classList.toggle('mara-intro', !!intro);
  el('app').classList.toggle('mara-intro-active', !!intro);
  el('app').dataset.maraIntro = intro ? String(intro.step) : '';
  const portrait = el<HTMLImageElement>('intro-portrait'), src = intro && view.portraits?.[intro.step];
  portrait.hidden = !src;
  if (src && portrait.getAttribute('src') !== src) portrait.src = src;
  card.querySelector('canvas')!.hidden = !!src;
  el<HTMLButtonElement>('intro-skip').hidden = !intro;
  el<HTMLButtonElement>('intro-skip').disabled = live.inputBusy || !!live.error || live.suspended || live.awaitingResume;
  el('intro-skip').textContent = t('Intro überspringen');
  el('app').classList.toggle('preparing', b.preparing); el('app').classList.toggle('guiding', b.guiding);
  el('app').classList.toggle('introducing', active); el('app').dataset.intro = stage;
  el('onboarding-card').hidden = !active || stage === 'observe' || stage === 'frost' && complete || placing || contextOpen || revealing || live.awaitingResume;
  el('onboarding-card').dataset.compact = String(stage !== 'welcome');
  el('onboarding-card').dataset.stage = stage;
  el('onboarding-card').dataset.complete = String(complete);
  const primary = el<HTMLButtonElement>('onboarding-primary'), secondary = el<HTMLButtonElement>('onboarding-secondary');
  primary.disabled = live.inputBusy || live.paused || !!live.error || live.suspended;
  secondary.disabled = primary.disabled; secondary.hidden = !b.guiding && stage !== 'ready';
  const waiting = b.guiding && !b.learningPaused;
  const saving = waiting && (b.lessonCost > 0 || stage === 'workshop');
  el('app').classList.toggle('saving', saving);
  el('onboarding-card').hidden ||= saving;
  el('lesson-savings').hidden = !saving || placing || contextOpen || live.awaitingResume;
  el('lesson-savings-label').textContent = t(stage === 'workshop' ? t('Erste Welle überstehen') : stage === 'research' ? t('Spare auf Frostforschung') : t('Spare auf den Frostturm'));
  el('lesson-savings-value').textContent = t(stage === 'workshop' ? t('Danach kostenlos bauen') : t("{0} / {1} G", Math.min(Math.floor(b.gold), b.lessonCost), b.lessonCost));
  const savings = el<HTMLProgressElement>('lesson-savings-progress'); savings.max = Math.max(1,b.lessonCost); savings.value = Math.min(b.gold,b.lessonCost); savings.hidden = stage === 'workshop';
  secondary.hidden ||= complete;
  const progress = tutorialProgress(b, intro);
  el('onboarding-eyebrow').textContent = progress ? t('Einführung {0}/{1}', progress.current, progress.total) : '';
  let copy: [string, string, string];
  switch (stage) {
    case 'welcome': copy = [t('Willkommen im alten Hain'), t('Ich bin Mara. Gemeinsam schützen wir diesen Wald. Ich zeige dir, wie du deinen ersten Turm baust. Bis dahin kommen keine Gegner.'), t('Los geht’s')]; break;
    case 'build': copy = [t('Wähle deinen Waldwächter'), t('Tippe unten im Menü „Türme“ auf den kostenlosen Startturm. Danach wählen wir einen Platz am Weg.'), '']; break;
    case 'ready': copy = [t('Dein Turm ist bereit'), t('Dein Waldwächter steht. Starte Welle 1, wenn du bereit bist. Danach kämpfen deine Türme automatisch.'), t('Welle 1 starten')]; break;
    case 'combat': copy = [t('Dein erstes Gefecht'), t('Jeder besiegte Käfer bringt Gold. Nach dem ersten Treffer zeige ich dir das Upgrade.'), '']; break;
    case 'upgrade': copy = complete ? [t('Level 2 genügt zunächst'), t('Überstehe die erste Welle. Danach kannst du deine Werkstatt kostenlos bauen.'), t('Weiter · Welle beenden')]
      : [t('Tippe auf deinen Waldwächter'), t('Die Welle wartet. Öffne den markierten Turm und verbessere ihn einmal für 60 Gold auf Level 2.'), '']; break;
    case 'workshop': copy = complete ? [t('Deine Werkstatt steht'), t('Öffne die Werkstatt. Dort erforschst du die Frostfassung für 60 Gold und schaltest deinen Frostkristall frei.'), t('Werkstatt öffnen')]
      : waiting ? [t('Die erste Welle läuft'), t('Nach dem Sieg kannst du deine Werkstatt kostenlos bauen.'), '']
      : catalogPanel === 'settlement' ? [t('Wähle die Werkstatt'), t('Tippe unten auf die Werkstatt. Wähle dann einen freien Platz in der Siedlung. Der erste Bau ist kostenlos.'), '']
      : [t('Baue deine Werkstatt kostenlos'), t('Öffne unten „Siedlung“. Dort findest du deine Gebäude. Die Welle wartet.'), '']; break;
    case 'research': copy = complete ? [t('Frostkristall freigeschaltet'), t('Dein erster Frostkristall ist kostenlos. Jeder weitere kostet 110 Gold.'), t('Weiter · Frostturm bauen')]
      : [t('Öffne deine Werkstatt'), t('Tippe auf das neue Gebäude auf der Karte. Dort erforschst du die Frostfassung für 60 Gold.'), '']; break;
    case 'frost': copy = catalogPanel === 'tower' ? [t('Wähle den Frostkristall'), t('Tippe unten auf den Frostkristall. Danach wählen wir einen Platz mit überlappender Reichweite.'), '']
      : [t('Zurück zu deinen Türmen'), t('Öffne unten „Türme“. Der erforschte Frostkristall ist jetzt dort verfügbar.'), '']; break;
    default: copy = ['', '', ''];
  }
  if (intro) {
    copy = [...INTRO_COPY[intro.step]];
  }
  el('onboarding-title').textContent = t(copy[0]); el('onboarding-copy').textContent = t(copy[1]); primary.textContent = t(copy[2]);
  primary.hidden = !copy[2]; primary.disabled ||= waiting || revealing;
  secondary.hidden = stage !== 'ready'; secondary.textContent = t('Standort ändern · kostenlos');
  el('skip-lessons').hidden = !b.guiding;
  el('onboarding-actions')?.classList.toggle('empty', primary.hidden && secondary.hidden);
  el('lesson-goal').hidden = true;
  el('lesson-note').hidden = !b.guiding || !contextOpen;
  el('lesson-note').textContent = t(stage === 'upgrade' ? t('Die Welle wartet. Einmal „Aufwerten“ genügt.')
    : stage === 'research' ? t('Die Welle wartet. Erforsche hier die Frostfassung.') : t('Schließe die Auswahl, um den nächsten Klick zu sehen.'));
  el('archer-price').textContent = t(b.preparing ? stage === 'ready' ? t('Kostenlos versetzen') : t('Kostenlos') : b.guiding ? t('Einmal auf Level 2') : '75');
  el('archer-title').textContent = t(b.preparing ? t('Startturm') : t('Waldwächter'));
  el('pick-archer').setAttribute('aria-label', t(b.preparing ? t('Kostenlosen Startturm platzieren oder versetzen') : b.guiding ? t('Startturm und erstes Upgrade ansehen') : t('Waldwächter platzieren · 75 Gold')));
  if (b.guiding) {
    el<HTMLButtonElement>('pick-archer').disabled = stage !== 'upgrade';
    el<HTMLButtonElement>('pick-frost').disabled = stage !== 'frost' || !b.learningPaused || complete;
    el('wave-mode').textContent = t(b.learningPaused ? t('Lernpause') : t('Lernphase'));
    el('battle-phase').textContent = t(b.learningPaused ? t('Lernpause · Die Welle wartet') : stage === 'workshop' ? t('Erste Welle · danach Werkstatt bauen') : t('Übungswellen 1–2'));
    if (stage !== 'upgrade' || complete) el<HTMLButtonElement>('upgrade').disabled = true;
    el<HTMLButtonElement>('sell').disabled = true;
    el<HTMLButtonElement>('research-frost').disabled ||= stage !== 'research';
    el<HTMLButtonElement>('build-workshop').disabled ||= stage !== 'workshop';
  } else { el<HTMLButtonElement>('pick-archer').disabled = false; el<HTMLButtonElement>('pick-frost').disabled = false; }
  if (b.learningPaused) { el('pause-state').textContent = t('LERNPAUSE'); el<HTMLButtonElement>('pause').disabled = true; }
  if (b.preparing) {
    el('wave').textContent = t('—'); el('wave-mode').textContent = t('Vorbereitung');
    el('record-wave').textContent = t('Noch kein Kampf'); el('live-income').textContent = t('Startkapital · 0 G/min');
    el('battle-phase').textContent = t('Erst bauen, dann Welle 1 starten'); el('pause-state').textContent = t('BEREIT');
    el<HTMLButtonElement>('pause').disabled = true;
  }
}
