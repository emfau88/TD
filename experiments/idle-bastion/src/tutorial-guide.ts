import { t } from './i18n';
import type { IdleBattle } from './battle';
import type { MaraIntro } from './mara-intro';
import { tutorialProgress } from './tutorial-progress';

type GuideView = { intro?: Pick<MaraIntro, 'active' | 'step'>; contextOpen: boolean; placing: boolean; blocked: boolean; paused: boolean };
/** Describe confirmed progress, never time estimates or extra unlock requirements. */
export function tutorialNext(b: IdleBattle): string {
  if (b.introduction.stage === 'done') {
    if (b.discovery === 'wisp') return b.wispUnlocked ? t('Begrüße Wisp.')
      : t('Welle {0} meistern → {1} · {2}/{0} geschafft', 5, 'Wisp', Math.min(5, b.highestCleared));
    if (b.discovery === 'warehouse' && !b.warehouseUnlocked)
      return t('Welle {0} meistern → {1} · {2}/{0} geschafft', 8, t('Vorratslager'), Math.min(8, b.highestCleared));
    if (b.discovery === 'warehouse') return t('Optional: Siedlung → Lager bauen oder „Später“.');
    if (b.discovery === 'cannon') return t('Optional: Steinschleuder bauen oder „Später“.');
    if (b.discovery === 'mara-wait') return t('Tippe auf „Übertakten zeigen“.');
    if (b.discovery === 'mara-controls') return t('Tippe auf „Weiter“, um die nächste Entdeckung zu sehen.');
    return t('Beobachte Maras Verstärkung.');
  }
  switch (b.introduction.stage) {
    case 'build': return t('Waldwächter wählen und am markierten Feld bauen.');
    case 'ready': return t('Tippe auf „Verteidigung starten“.');
    case 'combat': return t('Nach dem ersten Abschuss folgt das Turmupgrade.');
    case 'upgrade': return t('Startturm öffnen und einmal auf Level 2 aufwerten.');
    case 'workshop': return b.lessonComplete ? t('Weiter zur Frostforschung.')
      : b.workshopKitAvailable ? t('Siedlung → Werkstatt wählen und platzieren.')
      : t('Welle 1 meistern → kostenloser Werkstatt-Bausatz.');
    case 'research': return b.lessonComplete ? t('Weiter: kostenlosen Frostkristall platzieren.')
      : b.gold < b.lessonCost ? t('Spare {0} Gold für die Frostforschung.', b.lessonCost)
      : t('Werkstatt öffnen → Frostfassung erforschen.');
    case 'frost': case 'observe': return t('Frostkristall nahe dem Waldwächter platzieren.');
    default: return t('Lerne Mara und deine erste Verteidigung kennen.');
  }
}

const sources = ['#onboarding-card', '#wisp-arrival', '#boss-banner', '#fallback-note', '#discovery-card',
  '#quick-win-hint', '#combat-message', '#lesson-savings', '.goal-ribbon'];

/** One visual slot, using the original live buttons and listeners.
 * Existing presenters supply content each tick; this final pass owns visibility. */
export class TutorialGuide {
  readonly element: HTMLElement;
  private readonly content: HTMLElement;
  private readonly heading: HTMLElement;
  private readonly next: HTMLElement;
  private readonly idle: HTMLElement;
  private active?: HTMLElement;
  private readonly homes = new Map<HTMLElement, Comment>();
  private readonly contextLabel: HTMLElement;
  private readonly contextNext: HTMLElement;
  private readonly placementLabel: HTMLElement;
  constructor(private readonly doc: Document = document) {
    this.element = doc.createElement('section');
    this.element.id = 'tutorial-guide'; this.element.hidden = true;
    this.element.setAttribute('aria-labelledby', 'tutorial-guide-heading');
    this.element.innerHTML = '<span id="tutorial-guide-heading" class="tutorial-step"></span><div class="guide-content"></div><p class="guide-next" hidden></p>';
    this.heading = this.element.querySelector('#tutorial-guide-heading')!;
    this.content = this.element.querySelector('.guide-content')!;
    this.next = this.element.querySelector('.guide-next')!;
    this.idle = doc.createElement('p'); this.idle.className = 'guide-idle';
    doc.getElementById('app')!.append(this.element);
    this.contextLabel = doc.createElement('span'); this.contextLabel.className = 'tutorial-step guide-inline';
    this.contextLabel.hidden = true; doc.getElementById('context-panel')!.prepend(this.contextLabel);
    this.contextNext = doc.createElement('p'); this.contextNext.className = 'guide-context-next'; this.contextNext.hidden = true;
    doc.getElementById('lesson-note')!.after(this.contextNext);
    this.placementLabel = doc.createElement('span'); this.placementLabel.className = 'tutorial-step guide-inline';
    this.placementLabel.hidden = true; doc.getElementById('placement-help')!.prepend(this.placementLabel);
  }
  private restore(): void {
    if (this.active) this.homes.get(this.active)!.after(this.active);
    this.active = undefined; this.idle.remove();
  }
  update(b: IdleBattle, view: GuideView): void {
    const progress = tutorialProgress(b, view.intro);
    const app = this.doc.getElementById('app')!;
    this.contextLabel.hidden = this.contextNext.hidden = this.placementLabel.hidden = true;
    app.classList.toggle('unified-tutorial', !!progress && !view.intro?.active);
    this.element.hidden = true;
    if (!progress) { this.restore(); return; }
    const candidates = sources.map(selector => this.doc.querySelector<HTMLElement>(selector)!).filter(Boolean);
    const hideAll = (except?: HTMLElement) => { for (const host of candidates) if (host !== except) host.hidden = true; };
    const label = t('Einführung {0}/{1}', progress.current, progress.total);
    this.heading.textContent = this.contextLabel.textContent = this.placementLabel.textContent = label;
    if (view.intro?.active) {
      this.restore(); hideAll(this.doc.getElementById('onboarding-card')!); return;
    }
    // No competing help over a modal, return receipt or error.
    if (view.blocked) { this.restore(); hideAll(); return; }
    this.doc.getElementById('tutorial-card')!.hidden = true;
    this.doc.getElementById('mobile-hint')!.hidden = true;
    const next = view.paused ? t('Setze den Kampf fort, um weiterzumachen.') : tutorialNext(b);
    if (view.contextOpen || view.placing) {
      this.restore(); hideAll();
      if (view.contextOpen) {
        this.contextLabel.hidden = false;
        this.contextNext.textContent = next;
        this.contextNext.hidden = !this.doc.getElementById('lesson-note')!.hidden;
      } else this.placementLabel.hidden = false;
      return;
    }
    // Availability is computed by the original presenters. First entry wins.
    const chosen = candidates.find(host => !host.hidden);
    hideAll(chosen);
    if (chosen !== this.active) {
      this.restore();
      if (chosen) {
        if (!this.homes.has(chosen)) {
          const marker = this.doc.createComment('tutorial guide home');
          chosen.before(marker); this.homes.set(chosen, marker);
        }
        this.content.append(chosen); this.active = chosen;
      }
    }
    if (!chosen) { this.idle.textContent = next; this.content.append(this.idle); }
    this.element.dataset.source = chosen?.id || (chosen ? 'goal' : 'next');
    const waiting = b.introduction.stage === 'done'
      && (b.discovery === 'wisp' && !b.wispUnlocked || b.discovery === 'warehouse' && !b.warehouseUnlocked);
    this.next.hidden = !chosen || !waiting;
    this.next.textContent = next;
    if (chosen?.classList.contains('goal-ribbon') && waiting) {
      this.doc.getElementById('goal-progress')!.hidden = true;
      this.doc.getElementById('goal-title')!.textContent = b.discovery === 'wisp' ? t('Frost und Pfeile') : t('Türme verstärken');
      this.doc.getElementById('goal-copy')!.textContent = b.discovery === 'wisp'
        ? t('Frost hält Gegner länger in Reichweite deiner Pfeile.')
        : t('Baue Türme oder werte sie auf.');
    }
    this.element.hidden = false;
  }
}
