/** Presentation-only progress. The authoritative welcome → build transition
 * stays in BattleSession; older saves never acquire a new introduction. */
export type IntroStep = 0 | 1 | 2;
export type SessionOrigin = 'new' | 'loaded' | 'recovered';
export type IntroStorage = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;
export class MaraIntro {
  step: IntroStep = 0;
  active = false;
  private readonly key: string;
  constructor(slot: string, origin: SessionOrigin, stage: string, private readonly storage?: IntroStorage) {
    this.key = `spire-ui-intro-v1:${slot}`;
    if (stage !== 'welcome' || origin === 'recovered') { this.clear(); return; }
    if (origin === 'new') { this.active = true; this.persist(); return; }
    try {
      const saved = JSON.parse(storage?.getItem(this.key) ?? 'null');
      if (saved?.version === 1 && saved.status === 'active' && [0, 1, 2].includes(saved.step)) {
        this.step = saved.step; this.active = true;
      }
    } catch { /* Missing/corrupt preferences must not change an existing game. */ }
  }
  next(): void { if (this.active && this.step < 2) { this.step = (this.step + 1) as IntroStep; this.persist(); } }
  /** Call only after the saved model has left welcome successfully. */
  complete(): void { this.active = false; this.persist(); }
  private persist(): void {
    try { this.storage?.setItem(this.key, JSON.stringify({ version: 1, step: this.step, status: this.active ? 'active' : 'complete' })); } catch { /* In-memory play remains usable. */ }
  }
  private clear(): void { try { this.storage?.removeItem(this.key); } catch { /* Optional preferences. */ } }
}
export const INTRO_COPY = [
  ['Willkommen im alten Hain', 'Ah, da bist du ja! Ich bin Mara. Willkommen im alten Hain. Den Kern dort müssen wir beschützen. Eigentlich ist es hier ziemlich friedlich. Eigentlich.', 'Weiter'],
  ['Der Weg zum Kern', 'Die Angreifer kommen von hier und folgen dem Weg zum Kern. Eine verlorene Welle? Dein Ausbau bleibt erhalten. Wir verstärken die Türme und versuchen es wieder.', 'Verstanden'],
  ['Unsere erste Verteidigung', 'Du baust die Türme, die kämpfen von allein. Und ich? Ich habe noch ein paar Zauber im Ärmel. Aber eins nach dem anderen – fangen wir mit deinem Waldwächter an!', 'Ersten Turm bauen'],
] as const;
