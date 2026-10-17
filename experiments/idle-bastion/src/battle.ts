/** Phaser-free B02 battle model.
 * Ported selectively from reference/src/simulation.ts (targeting, movement,
 * homing shots, kill accounting, purchases) and reference/src/data.ts
 * (Waldwächter and original enemy identities). No Scene or mutable classic
 * rules are imported. Idle owns its prices, bounded stats and wave recipes.
 * Persistence/farming/characters belong to later packages.
 */
import { cellCenter, createIdleLayout, isUnlockedCell, type IdleLayout } from './layout';

export const BASE = Object.freeze({
  stepSeconds: 0.025, startGold: 75, coreLives: 20,
  firstWaveDelay: 0.25, intermissionSeconds: 2, maxLevel: 3,
  firstUpgradeCost: 60, laterUpgradePriceFactor: 1.25, refundRate: 0.7,
  maxRangeBonus: 30, maxFireRateMultiplier: 1.3, projectileSpeed: 480,
  tower: Object.freeze({
    id: 1, name: 'Waldwächter', cost: 75, damage: 14, range: 132,
    cooldown: 0.6, color: 0xe3cf87,
  }),
  enemies: Object.freeze({
    Leafbug: Object.freeze({ id: 'Leafbug' as const, name: 'Blattkäfer', hp: 24, speed: 45, gold: 8, armor: 0, lives: 1 }),
    Firebug: Object.freeze({ id: 'Firebug' as const, name: 'Feuerkäfer', hp: 34, speed: 56, gold: 11, armor: 0, lives: 1 }),
  }),
  waves: Object.freeze({
    firstCount: 6, maxCount: 28, hpGrowth: 1.16, maxHpMultiplier: 100000,
    spawnInterval: 1.2, minSpawnInterval: 0.75, firstSpawnDelay: 0.15,
    rewardBase: 20, rewardPerWave: 2, maxReward: 250,
  }),
});

export type Phase = 'intermission' | 'wave' | 'defeat';
export type TowerDef = typeof BASE.tower;
export type EnemyDef = typeof BASE.enemies[keyof typeof BASE.enemies];
export interface Tower {
  uid: number; padId: string; x: number; y: number; def: TowerDef;
  level: number; visualStage: 1; cooldown: number; spent: number;
  kills: number; angle: number; protected: boolean;
}
export interface Enemy {
  uid: number; def: EnemyDef; x: number; y: number; hp: number; maxHp: number;
  distance: number; total: number; segment: number; speed: number;
  direction: 'up' | 'down' | 'side'; flip: boolean;
}
export interface Shot {
  uid: number; towerUid: number; target: number; x: number; y: number;
  speed: number; damage: number; level: number;
}
export interface BattleEvent {
  type: 'build' | 'upgrade' | 'sell' | 'fire' | 'hit' | 'kill' | 'escape' | 'wave' | 'clear' | 'defeat';
  tower?: Tower; enemy?: Enemy; shot?: Shot; x?: number; y?: number;
  amount?: number; wave?: number;
}

const distance = (a: { x: number; y: number }, b: { x: number; y: number }): number => Math.hypot(a.x - b.x, a.y - b.y);
const DAMAGE_MULTIPLIERS = Object.freeze([1, 1.75, 2.8]);

/** Level and visual stage deliberately differ: all B02 levels use art stage I.
 * Explicit clamps prevent accidental unbounded range/fire rate in later levels.
 */
export function stats(tower: Pick<Tower, 'def' | 'level'>) {
  const level = Math.max(1, Math.min(BASE.maxLevel, Math.floor(tower.level)));
  return {
    damage: tower.def.damage * DAMAGE_MULTIPLIERS[level - 1],
    range: tower.def.range + Math.min(BASE.maxRangeBonus, (level - 1) * 15),
    cooldown: tower.def.cooldown / Math.min(BASE.maxFireRateMultiplier, Math.pow(1.13, level - 1)),
  };
}
export function upgradeCost(tower: Pick<Tower, 'def' | 'level'>): number {
  return tower.level === 1 ? BASE.firstUpgradeCost : Math.round(tower.def.cost * BASE.laterUpgradePriceFactor);
}
export function sellValue(tower: Pick<Tower, 'spent'>): number {
  return Math.round(tower.spent * BASE.refundRate);
}

export class IdleBattle {
  gold: number = BASE.startGold;
  lives: number = BASE.coreLives;
  wave = 0;
  phase: Phase = 'intermission';
  elapsed = 0;
  kills = 0;
  earned = 0;
  towers: Tower[] = [];
  enemies: Enemy[] = [];
  shots: Shot[] = [];
  events: BattleEvent[] = [];
  intermissionRemaining: number = BASE.firstWaveDelay;
  private uid = 1;
  private queue: EnemyDef[] = [];
  private spawnTimer = 0;
  private pendingTime = 0;
  private ticks = 0;
  private readonly path: readonly { x: number; y: number }[];
  private readonly pathLength: number;

  constructor(public readonly layout: IdleLayout = createIdleLayout()) {
    this.path = layout.road.waypoints.map(position => cellCenter(layout, position));
    this.pathLength = this.path.slice(1).reduce((sum, point, index) => sum + distance(this.path[index], point), 0);
    if (this.path.length < 2 || this.pathLength <= 0) throw new Error('Battle requires a non-empty enemy route.');
    const starter = layout.towerPads.find(pad => pad.isStarter);
    if (!starter || starter.availability !== 'initial' || !isUnlockedCell(layout, starter.cell)) {
      throw new Error('Battle requires an unlocked starter pad.');
    }
    this.towers.push(this.createTower(starter.id, true));
  }

  get remaining(): number { return this.enemies.length + this.queue.length; }

  canBuild(padId: string): boolean {
    const pad = this.layout.towerPads.find(candidate => candidate.id === padId);
    return this.phase !== 'defeat' && !!pad && pad.availability === 'initial'
      && isUnlockedCell(this.layout, pad.cell) && !this.towers.some(tower => tower.padId === padId)
      && this.gold >= BASE.tower.cost;
  }

  build(padId: string): Tower | undefined {
    if (!this.canBuild(padId)) return undefined;
    const tower = this.createTower(padId, false);
    this.gold -= BASE.tower.cost;
    this.towers.push(tower);
    this.events.push({ type: 'build', tower, x: tower.x, y: tower.y, amount: BASE.tower.cost });
    return tower;
  }

  upgrade(uid: number): boolean {
    const tower = this.towers.find(candidate => candidate.uid === uid);
    if (this.phase === 'defeat' || !tower || tower.level >= BASE.maxLevel) return false;
    const cost = upgradeCost(tower);
    if (this.gold < cost) return false;
    this.gold -= cost;
    tower.spent += cost;
    tower.level++;
    this.events.push({ type: 'upgrade', tower, x: tower.x, y: tower.y, amount: cost });
    return true;
  }

  sell(uid: number): boolean {
    const tower = this.towers.find(candidate => candidate.uid === uid);
    if (this.phase === 'defeat' || !tower || tower.protected) return false;
    const amount = sellValue(tower);
    this.credit(amount, false);
    this.towers = this.towers.filter(candidate => candidate.uid !== uid);
    this.events.push({ type: 'sell', tower, x: tower.x, y: tower.y, amount });
    return true;
  }

  /** Seconds at 1×; fixed 25 ms ticks make chunking independent of rendering.
   * A partial step is retained. The browser owns suspension/absence handling.
   */
  update(dt: number): void {
    if (this.phase === 'defeat' || !Number.isFinite(dt) || dt <= 0) return;
    this.pendingTime += dt;
    const count = Math.floor((this.pendingTime + 1e-9) / BASE.stepSeconds);
    this.pendingTime -= count * BASE.stepSeconds;
    if (Math.abs(this.pendingTime) < 1e-9) this.pendingTime = 0;
    for (let index = 0; index < count; index++) {
      if ((this.phase as Phase) === 'defeat') break;
      this.ticks++;
      this.elapsed = this.ticks * BASE.stepSeconds;
      this.tick(BASE.stepSeconds);
    }
  }

  drainEvents(): BattleEvent[] {
    const events = this.events;
    this.events = [];
    return events;
  }

  private createTower(padId: string, protectedStarter: boolean): Tower {
    const pad = this.layout.towerPads.find(candidate => candidate.id === padId)!;
    return {
      uid: this.uid++, padId, ...cellCenter(this.layout, pad.cell), def: BASE.tower,
      level: 1, visualStage: 1, cooldown: 0, spent: protectedStarter ? 0 : BASE.tower.cost,
      kills: 0, angle: 0, protected: protectedStarter,
    };
  }

  private credit(amount: number, reward: boolean): void {
    if (!Number.isSafeInteger(amount) || amount < 0 || !Number.isSafeInteger(this.gold + amount)
      || (reward && !Number.isSafeInteger(this.earned + amount))) throw new Error('Invalid gold transaction.');
    this.gold += amount;
    if (reward) this.earned += amount;
  }

  private startAttempt(): void {
    this.wave++;
    this.lives = BASE.coreLives;
    this.enemies = [];
    this.shots = [];
    const count = Math.min(BASE.waves.maxCount, BASE.waves.firstCount + this.wave - 1);
    this.queue = Array.from({ length: count }, (_, index) =>
      this.wave >= 4 && index % 3 === 2 ? BASE.enemies.Firebug : BASE.enemies.Leafbug);
    this.spawnTimer = BASE.waves.firstSpawnDelay;
    this.intermissionRemaining = 0;
    this.phase = 'wave';
    this.events.push({ type: 'wave', wave: this.wave });
  }

  private spawn(def: EnemyDef): void {
    const multiplier = Math.min(BASE.waves.maxHpMultiplier, Math.pow(BASE.waves.hpGrowth, this.wave - 1));
    const maxHp = def.hp * multiplier;
    this.enemies.push({
      uid: this.uid++, def, ...this.path[0], hp: maxHp, maxHp,
      distance: 0, total: this.pathLength, segment: 0, speed: def.speed,
      direction: 'side', flip: false,
    });
  }

  private move(enemy: Enemy, dt: number): void {
    let travel = enemy.speed * dt;
    while (travel > 0 && enemy.segment < this.path.length - 1) {
      const next = this.path[enemy.segment + 1];
      const gap = distance(enemy, next), step = Math.min(gap, travel);
      const dx = next.x - enemy.x, dy = next.y - enemy.y;
      enemy.direction = Math.abs(dx) > Math.abs(dy) ? 'side' : dy > 0 ? 'down' : 'up';
      enemy.flip = dx < 0;
      if (gap > 0) { enemy.x += dx / gap * step; enemy.y += dy / gap * step; }
      enemy.distance += step;
      travel -= step;
      if (gap <= step + 1e-9) enemy.segment++;
    }
    if (enemy.segment === this.path.length - 1) {
      enemy.hp = 0;
      this.lives = Math.max(0, this.lives - enemy.def.lives);
      this.events.push({ type: 'escape', enemy, x: enemy.x, y: enemy.y });
    }
  }

  private impact(shot: Shot, enemy: Enemy): void {
    if (enemy.hp <= 0) return;
    enemy.hp = Math.max(0, enemy.hp - shot.damage * (1 - enemy.def.armor));
    this.events.push({ type: 'hit', shot, enemy, x: enemy.x, y: enemy.y, amount: shot.damage });
    if (enemy.hp > 0) return;
    const owner = this.towers.find(tower => tower.uid === shot.towerUid);
    if (owner) owner.kills++;
    this.credit(enemy.def.gold, true);
    this.kills++;
    this.events.push({ type: 'kill', tower: owner, enemy, x: enemy.x, y: enemy.y, amount: enemy.def.gold });
  }

  private tick(dt: number): void {
    if (this.phase === 'intermission') {
      this.intermissionRemaining = Math.max(0, this.intermissionRemaining - dt);
      if (this.intermissionRemaining <= 1e-9) this.startAttempt();
      return;
    }
    this.spawnTimer -= dt;
    while (this.queue.length && this.spawnTimer <= 1e-9) {
      this.spawn(this.queue.shift()!);
      this.spawnTimer += Math.max(BASE.waves.minSpawnInterval, BASE.waves.spawnInterval - (this.wave - 1) * 0.025);
    }
    for (const enemy of this.enemies) if (enemy.hp > 0) this.move(enemy, dt);
    if (this.lives <= 0) {
      this.phase = 'defeat';
      this.shots = [];
      this.events.push({ type: 'defeat', wave: this.wave });
      return;
    }
    for (const tower of this.towers) {
      tower.cooldown = Math.max(0, tower.cooldown - dt);
      if (tower.cooldown > 1e-9) continue;
      const stat = stats(tower);
      const target = this.enemies.filter(enemy => enemy.hp > 0 && distance(tower, enemy) <= stat.range)
        .sort((a, b) => b.distance - a.distance || a.uid - b.uid)[0];
      if (!target) continue;
      tower.angle = Math.atan2(target.y - tower.y, target.x - tower.x) + Math.PI / 2;
      tower.cooldown = stat.cooldown;
      const shot: Shot = {
        uid: this.uid++, towerUid: tower.uid, target: target.uid,
        x: tower.x, y: tower.y - 12, speed: BASE.projectileSpeed,
        damage: stat.damage, level: tower.level,
      };
      this.shots.push(shot);
      this.events.push({ type: 'fire', tower, shot, x: tower.x, y: tower.y });
    }
    this.shots = this.shots.filter(shot => {
      const target = this.enemies.find(enemy => enemy.uid === shot.target && enemy.hp > 0);
      if (!target) return false;
      const gap = distance(shot, target), step = shot.speed * dt;
      if (gap <= step + 4) { this.impact(shot, target); return false; }
      shot.x += (target.x - shot.x) / gap * step;
      shot.y += (target.y - shot.y) / gap * step;
      return true;
    });
    this.enemies = this.enemies.filter(enemy => enemy.hp > 0);
    if (!this.queue.length && !this.enemies.length) {
      this.shots = [];
      const amount = Math.min(BASE.waves.maxReward, BASE.waves.rewardBase + this.wave * BASE.waves.rewardPerWave);
      this.credit(amount, true);
      this.events.push({ type: 'clear', wave: this.wave, amount });
      this.phase = 'intermission';
      this.intermissionRemaining = BASE.intermissionSeconds;
    }
  }
}
