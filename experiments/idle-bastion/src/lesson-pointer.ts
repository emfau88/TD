export type LessonPoint = { x: number; y: number };
export class LessonPointer {
  private button?: HTMLButtonElement;
  private readonly arrow = document.getElementById('lesson-pointer')!;
  private cueKey = '';
  private remindAt = 0;
  private readonly halo = this.arrow.appendChild(document.createElement('span'));
  show(target?: HTMLButtonElement | LessonPoint, key = ''): void {
    const button = target instanceof HTMLButtonElement ? target : undefined;
    if (this.button !== button) {
      this.button?.classList.remove('lesson-click-target', 'lesson-inline-target');
      this.button = button;
      button?.classList.add('lesson-click-target');
      if (button && !button.closest('[hidden]')) button.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    }
    if (!target) { this.arrow.hidden = true; this.cueKey = ''; return; }
    // A single inward cue settles into a gentle outline pulse; the control itself stays still.
    // Only positions in the world need a directional pointer.
    if (button) { this.arrow.hidden = true; this.cueKey = ''; return; }
    const { x, y } = target as LessonPoint;
    if (x < 0 || x > innerWidth || y < 56 || y > innerHeight - 12) { this.arrow.hidden = true; return; }
    this.arrow.dataset.mode = x < 24 ? 'map-right' : x > innerWidth - 24 ? 'map-left' : 'map';
    this.arrow.dataset.target = key;
    this.arrow.style.left = `${x}px`; this.arrow.style.top = `${y}px`;
    this.arrow.hidden = false;
    const overlapsCopy = () => {
      const a = this.arrow.getBoundingClientRect();
      return Array.from(document.querySelectorAll<HTMLElement>('.app-header, #tutorial-guide, .onboarding-card, .wisp-arrival, .context-panel, .combat-toast, .placement-help, .fallback-note'))
        .filter(e => !e.hidden && e.getClientRects().length)
        .some(e => { const r = e.getBoundingClientRect(); return a.left < r.right && a.right > r.left && a.top < r.bottom && a.bottom > r.top; });
    };
    if (overlapsCopy()) {
      this.arrow.dataset.mode = 'map-below';
      if (overlapsCopy()) this.arrow.hidden = true;
    }
    if (this.arrow.hidden) return;
    const cueKey = this.arrow.dataset.target!, changed = cueKey !== this.cueKey, now = performance.now();
    if (changed || now >= this.remindAt) {
      this.halo.getAnimations().forEach(animation => animation.cancel());
      if (!matchMedia('(prefers-reduced-motion: reduce)').matches) this.halo.animate([
        { transform:'translate(-50%,50%) scale(1.9)', opacity:0 },
        { offset:.2, opacity:.65 },
        { transform:'translate(-50%,50%) scale(.65)', opacity:0 },
      ], { duration:850, iterations:changed ? 2 : 1 });
      this.cueKey = cueKey; this.remindAt = changed ? now + 10000 : Infinity;
    }
  }
}
