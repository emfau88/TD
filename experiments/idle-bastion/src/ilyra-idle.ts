import clip from '../assets/ilyra/idle-spear/clip.json';
import type { IlyraState } from './ilyra';

export const ILYRA_IDLE = { waitMs: 8000, periodMs: 24000, turnMs: 240 } as const;
type IdlePose = { dance: boolean; frame: number };

/** Renderer-only clock. Never changes direction, movement, abilities or saves. */
export class IlyraIdle {
  private since = 0;
  private lastTime = -Infinity;
  private x = NaN;
  private y = NaN;
  private direction?: IlyraState['direction'];

  pose(state: IlyraState | null | undefined, elapsed: number, reducedMotion = false): IdlePose | undefined {
    const now = Math.round(elapsed * 1000);
    const reset = !state || reducedMotion || state.introduction !== 'done' || state.path.length > 0 || !!state.volley
      || now < this.lastTime || state.x !== this.x || state.y !== this.y || state.direction !== this.direction;
    this.lastTime = now;
    this.x = state?.x ?? NaN; this.y = state?.y ?? NaN; this.direction = state?.direction;
    if (reset) { this.since = now; return; }
    const age = now - this.since - ILYRA_IDLE.waitMs;
    if (age < 0) return;
    const phase = age % ILYRA_IDLE.periodMs;
    // The approved clip faces forward. A short visual turn uses existing stand
    // frames, without rewriting the direction used by the battle simulation.
    const turn = ILYRA_IDLE.turnMs;
    if (phase < turn) return { dance: false, frame: state.direction === 'up' && phase < turn / 2 ? 8 : 0 };
    let cursor = phase - turn;
    if (cursor < clip.durationMs) {
      for (let frame = 0; frame < clip.durationsMs.length; frame++) {
        if (cursor < clip.durationsMs[frame]) return { dance: true, frame };
        cursor -= clip.durationsMs[frame];
      }
    }
    const returning = phase - turn - clip.durationMs;
    if (returning < turn) return { dance: false, frame: state.direction === 'up' && returning >= turn / 2 ? 8 : 0 };
  }
}
