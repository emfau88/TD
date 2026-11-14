/** One quiet explanation per save slot, using optional UI preferences only. */
export class LeakGuidance {
  private seen = false;
  private pending = false;
  private readonly key: string;
  constructor(slot: string, private readonly storage?: Pick<Storage, 'getItem' | 'setItem'>) {
    this.key = `spire-ui-first-leak-v1:${slot}`;
    try { this.seen = storage?.getItem(this.key) === 'seen'; } catch { /* Session-only fallback. */ }
  }
  observe(lives: number): void {
    if (lives <= 0) this.pending = false;
    else if (!this.seen && lives < 20) this.pending = true;
  }
  take(suppressed: boolean): boolean {
    if (suppressed || this.seen || !this.pending) return false;
    this.seen = true; this.pending = false;
    try { this.storage?.setItem(this.key, 'seen'); } catch { /* Still shown only once this session. */ }
    return true;
  }
}
