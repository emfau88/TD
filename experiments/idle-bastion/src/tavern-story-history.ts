import { hearts, type Companion } from './tavern-social';

type StoragePort = Pick<Storage, 'getItem' | 'setItem'>;
type Opened = Record<Companion, number>;
const mask = (count: number) => (1 << Math.max(0, Math.min(5, count))) - 1;
const validMask = (value: unknown): value is number => Number.isInteger(value) && (value as number) >= 0 && (value as number) <= 31;

/** Optional, slot-local presentation history, like the introduction preferences.
 * Never reads/writes the battle envelope, offline clock or relationship points.
 * Missing legacy history treats already-earned hearts as seen: their past opens
 * cannot be reconstructed. Only subsequent unlocks get the new-story cue. */
export class TavernStoryHistory {
  private readonly key: string;
  private opened: Opened;
  constructor(slot: string, origin: 'new' | 'loaded' | 'recovered', points: Readonly<Record<Companion, number>>, private readonly storage?: StoragePort) {
    this.key = `spire-ui-tavern-stories-v1:${slot}`;
    this.opened = origin === 'new' ? { mara: 0, ilyra: 0 } : this.read() ?? { mara: mask(hearts(points.mara)), ilyra: mask(hearts(points.ilyra)) };
    this.persist();
  }
  private read(): Opened | undefined {
    try {
      const value: unknown = JSON.parse(this.storage?.getItem(this.key) ?? 'null');
      if (typeof value !== 'object' || !value || Array.isArray(value)) return;
      const saved = value as Record<string, unknown>;
      if (saved.version === 1 && validMask(saved.mara) && validMask(saved.ilyra)) return { mara: saved.mara, ilyra: saved.ilyra };
    } catch { /* A UI preference must never prevent a valid game from loading. */ }
  }
  isOpened(who: Companion, heart: number): boolean {
    return Number.isInteger(heart) && heart >= 1 && heart <= 5 && !!(this.opened[who] & (1 << (heart - 1)));
  }
  markOpened(who: Companion, heart: number): void {
    if (!['mara', 'ilyra'].includes(who) || !Number.isInteger(heart) || heart < 1 || heart > 5) return;
    const latest = this.read();
    if (latest) { this.opened.mara |= latest.mara; this.opened.ilyra |= latest.ilyra; }
    this.opened[who] |= 1 << (heart - 1);
    this.persist();
  }
  private persist(): void {
    try { this.storage?.setItem(this.key, JSON.stringify({ version: 1, ...this.opened })); }
    catch { /* Storage disabled/full: still remember opens for this session. */ }
  }
}
