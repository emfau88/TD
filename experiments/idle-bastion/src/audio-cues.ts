import type { BattleEvent, IdleBattle } from './battle';
import { stats } from './battle';

export const CUES = {
  click: { file:'click.wav', gain:.22, gap:80, combat:false },
  craft: { file:'craft.wav', gain:.4, gap:450, combat:false },
  gift: { file:'gift.wav', gain:.9, gap:600, combat:false },
  alarm: { file:'alarm.wav', gain:.7, gap:1200, combat:false },
  mara: { file:'mara-spell.wav', gain:.65, gap:1500, combat:true },
  ilyra: { file:'ilyra-spell.wav', gain:.35, gap:1500, combat:true },
  draw1: { file:'bow-1-draw.wav', gain:.15, gap:450, combat:true },
  draw2: { file:'bow-2-draw.wav', gain:.18, gap:450, combat:true },
  shoot1: { file:'bow-1-shoot.wav', gain:.2, gap:160, combat:true },
  shoot2: { file:'bow-2-shoot.wav', gain:.23, gap:200, combat:true },
  hit1: { file:'bow-1-hit.wav', gain:.12, gap:200, combat:true },
  hit2: { file:'bow-2-hit.wav', gain:.18, gap:250, combat:true },
  iceLaunch: { file:'ice-launch.wav', gain:.25, gap:350, combat:true },
  iceHit: { file:'ice-hit.wav', gain:.2, gap:350, combat:true },
  stone: { file:'stone-hit.wav', gain:.22, gap:350, combat:true },
} as const;
export type Cue = keyof typeof CUES;
export type AudioMix = { music:number; effects:number; voices:number; muted:boolean };
export const DEFAULT_MIX: AudioMix = { music:.16, effects:.55, voices:.55, muted:false };
export function readMix(value: unknown): AudioMix {
  const obj = value && typeof value === 'object' ? value as Partial<AudioMix> : {};
  const level = (key:'music'|'effects'|'voices') => typeof obj[key] === 'number' && Number.isFinite(obj[key]) ? Math.max(0,Math.min(1,obj[key]!)) : DEFAULT_MIX[key];
  return { music:level('music'), effects:level('effects'), voices:level('voices'), muted:obj.muted === true };
}

/** Presentation only: consume the live event batch, never simulate or mutate a save. */
export function battleCues(events: readonly BattleEvent[]): Cue[] {
  const cues: Cue[] = [], hits = new Set<number>();
  for (const e of events) {
    if (e.type === 'escape') cues.push('alarm');
    else if (['build','upgrade','workshop','warehouse','tavern','research','workshop-upgrade','tavern-upgrade'].includes(e.type)) cues.push('craft');
    else if (e.type === 'fire' && e.shot) {
      if (e.shot.kind === 1) cues.push('shoot1');
      else if (e.shot.kind === 4) cues.push('shoot2');
      else if (e.shot.kind === 2) cues.push('iceLaunch');
    } else if (e.type === 'hit' && e.shot && !hits.has(e.shot.uid)) {
      hits.add(e.shot.uid); // A stone's area damage makes many hit events, but one impact sound.
      cues.push(({1:'hit1',2:'iceHit',3:'stone',4:'hit2'} as const)[e.shot.kind]);
    }
  }
  return cues;
}

/** State edges catch manual AND automatic spells without replaying loaded effects. */
export class AudioObserver {
  private previous?: { battle:IdleBattle; mara:number; ilyra:number; gifts:number };
  private drawing = new Set<number>();
  update(b: IdleBattle, running: boolean): Cue[] {
    const next = { battle:b, mara:b.mara.cooldownRemaining, ilyra:b.ilyra?.cooldown ?? 0, gifts:b.social.gifts };
    const before = this.previous; this.previous = next;
    if (!before || before.battle !== b) { this.drawing.clear(); return []; }
    const cues: Cue[] = [];
    if (next.gifts > before.gifts) cues.push('gift');
    if (!running) { this.drawing.clear(); return cues; }
    if (next.mara > before.mara + .1 && b.mara.effectRemaining > 0) cues.push('mara');
    if (next.ilyra > before.ilyra + .1 && b.ilyra?.volley) cues.push('ilyra');
    const drawing = new Set<number>();
    for (const tower of b.towers) {
      if (tower.def.id !== 1 && tower.def.id !== 4 || tower.cooldown <= 0 || tower.cooldown > .24 || b.isCharmed(tower.uid)) continue;
      if (!b.enemies.some(e => e.hp > 0 && Math.hypot(e.x-tower.x,e.y-tower.y) <= stats(tower).range)) continue;
      drawing.add(tower.uid);
      if (!this.drawing.has(tower.uid)) cues.push(tower.def.id === 1 ? 'draw1' : 'draw2');
    }
    this.drawing = drawing;
    return cues;
  }
}

export class CueLimiter {
  private last = new Map<Cue,number>();
  private combatStarts: number[] = [];
  allow(cue: Cue, now: number, combatActive: number): boolean {
    const spec = CUES[cue];
    if (now - (this.last.get(cue) ?? -Infinity) < spec.gap) return false;
    this.combatStarts = this.combatStarts.filter(time => now-time < 1000);
    if (spec.combat && (combatActive >= 3 || this.combatStarts.length >= 8)) return false;
    this.last.set(cue,now); if(spec.combat) this.combatStarts.push(now);
    return true;
  }
  reset(): void { this.last.clear(); this.combatStarts = []; }
}
