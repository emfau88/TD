export type LessonPoint = { x: number; y: number };
export class LessonPointer {
  private button?: HTMLButtonElement;
  private readonly arrow = document.getElementById('lesson-pointer')!;
  show(target?: HTMLButtonElement | LessonPoint, key = ''): void {
    const button = target instanceof HTMLButtonElement ? target : undefined;
    if (this.button !== button) {
      this.button?.classList.remove('lesson-click-target');
      this.button = button;
      button?.classList.add('lesson-click-target');
      if (button && !button.closest('[hidden]')) button.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    }
    this.arrow.hidden = true;
    if (!target) return;
    // Confirmation cards already have a clear action; keep the outline, not an arrow over their copy.
    if (button?.closest('#wisp-arrival, #discovery-card')) return;
    let x: number, y: number;
    if (button) {
      if (button.disabled || button.closest('[hidden]') || !button.getClientRects().length) return;
      const rect = button.getBoundingClientRect();
      x = rect.left + rect.width / 2; y = rect.top + 3;
    } else { ({ x, y } = target as LessonPoint); }
    if (x < 12 || x > innerWidth - 12 || y < 56 || y > innerHeight - 12) return;
    this.arrow.dataset.mode = button ? 'button' : 'map';
    this.arrow.dataset.target = key || button?.id || '';
    this.arrow.style.left = `${x}px`; this.arrow.style.top = `${y}px`;
    this.arrow.hidden = false;
  }
}
