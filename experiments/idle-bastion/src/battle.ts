/** Phaser-free B02 battle model.
 * Ported selectively from reference/src/simulation.ts (targeting, movement,
 * homing shots, kill accounting, purchases) and reference/src/data.ts
 * (Waldwächter and original enemy identities). No Scene or mutable classic
 * rules are imported. Idle owns its prices, bounded stats and wave recipes.
 * B03 adds exact persistence; B04 owns advance/farm attempts and fractional offline credit.
 */
import { cellCenter, createIdleLayout, isUnlockedCell, type IdleLayout } from './layout';
import { getForestBlockedCells } from './forest-world';
import { MARA, createMara, cloneMara, assignMaraTarget, stepMara, validMara, type MaraState } from './mara';

export const BASE = Object.freeze({
  stepSeconds: 0.025, startGold: 75, coreLives: 20,
  firstWaveDelay: 0.25, intermissionSeconds: 2, maxLevel: 6,
  firstUpgradeCost: 60, laterUpgradePriceFactor: 1.25, refundRate: 0.7,
  maxRangeBonus: 30, maxFireRateMultiplier: 1.3, projectileSpeed: 480,
  tower: Object.freeze({
    id: 1 as const, name: 'Waldwächter', cost: 75, damage: 14, range: 132,
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

/** Prices are ordinary gold purchases; B07 measures the whole opening economy. */
export const SETTLEMENT = Object.freeze({ workshopCost: 400, researchCost: 60, slowFactor: 0.55, slowSeconds: 2 });
export const FROST = Object.freeze({ id: 2 as const, name: 'Frostkristall', cost: 110,
  damage: 7, range: 126, cooldown: 0.9, color: 0x8ce1ef });
export const BATTLE_RULES_VERSION = 3 as const;
export const LIVE_CANDIDATE_LIMIT = 32;
/** Reserved boss milestones never contribute repeatable offline production. */
export const isNormalFarmWave = (wave: number): boolean => Number.isSafeInteger(wave) && wave >= 1 && wave !== 15 && wave !== 25;
export type BattleMode = 'advance' | 'farm';
export type Phase = 'intermission' | 'wave' | 'defeat';
export type TowerId = 1 | 2;
export type TowerDef = typeof BASE.tower | typeof FROST;
export const towerDefinition = (id: TowerId): TowerDef => id === 2 ? FROST : BASE.tower;
export type EnemyDef = typeof BASE.enemies[keyof typeof BASE.enemies];
export interface Tower {
  uid: number; padId: string; x: number; y: number; def: TowerDef;
  level: number; visualStage: 1 | 2; cooldown: number; spent: number;
  kills: number; angle: number; protected: boolean;
}
export interface Enemy {
  uid: number; def: EnemyDef; x: number; y: number; hp: number; maxHp: number;
  distance: number; total: number; segment: number; speed: number; slowRemaining: number;
  direction: 'up' | 'down' | 'side'; flip: boolean;
}
export interface Shot {
  uid: number; towerUid: number; target: number; x: number; y: number;
  speed: number; damage: number; level: number; kind: TowerId;
}
export interface BattleEvent {
  type: 'build' | 'upgrade' | 'sell' | 'fire' | 'hit' | 'kill' | 'escape' | 'wave' | 'clear' | 'defeat' | 'workshop' | 'research';
  tower?: Tower; enemy?: Enemy; shot?: Shot; x?: number; y?: number;
  amount?: number; wave?: number;
}

/** Only scalar IDs and fired payloads cross the save boundary. UI events are transient. */
export interface BattleSnapshot {
  schemaVersion: 4; rulesVersion: 3; layoutVersion: 1; layoutId: 'start28';
  goldRemainderUnits: number; mode: BattleMode; highestCleared: number; attemptId: number;
  liveClearedWaves: number[]; farmWave: number; advanceRequested: boolean;
  gold: number; lives: number; wave: number; phase: Phase; elapsed: number;
  ticks: number; pendingTime: number; uid: number; intermissionRemaining: number;
  kills: number; earned: number; queue: EnemyDef['id'][]; spawnTimer: number;
  towers: (Pick<Tower, 'uid' | 'padId' | 'level' | 'cooldown' | 'spent' | 'kills' | 'angle' | 'protected'> & { kind: TowerId })[];
  enemies: (Omit<Enemy, 'def'> & { defId: EnemyDef['id'] })[];
  shots: Shot[];
  mara: MaraState;
  settlement: { workshopBuilt: boolean; frostResearched: boolean; builtAt: number | null };
  tutorial: { hidden: boolean; seen: number; builtTower: boolean; upgradedTower: boolean; frostSeen: boolean };
}

const distance = (a: { x: number; y: number }, b: { x: number; y: number }): number => Math.hypot(a.x - b.x, a.y - b.y);
const DAMAGE_MULTIPLIERS = Object.freeze([1, 1.75, 2.8, 4.1, 5.7, 7.5]);
// Immutable layout geometry is shared by restored models; never rerun footpath search per frame.
const SNAPSHOT_LAYOUT = createIdleLayout();
const SNAPSHOT_LAYOUT_JSON = JSON.stringify(SNAPSHOT_LAYOUT);

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
  return tower.level === 1 ? BASE.firstUpgradeCost
    : Math.round(tower.def.cost * BASE.laterUpgradePriceFactor * Math.pow(1.8, tower.level - 2));
}
export function sellValue(tower: Pick<Tower, 'spent'>): number {
  return Math.round(tower.spent * BASE.refundRate);
}

export class IdleBattle {
  gold: number = BASE.startGold;
  goldRemainderUnits = 0;
  mode: BattleMode = 'advance';
  highestCleared = 0;
  attemptId = 0;
  liveClearedWaves: number[] = [];
  farmWave = 1;
  advanceRequested = false;
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
  settlement = { workshopBuilt: false, frostResearched: false, builtAt: null as number | null };
  tutorial = { hidden: false, seen: 0, builtTower: false, upgradedTower: false, frostSeen: false };
  intermissionRemaining: number = BASE.firstWaveDelay;
  private uid = 1;
  private queue: EnemyDef[] = [];
  private spawnTimer = 0;
  private pendingTime = 0;
  private ticks = 0;
  private readonly path: readonly { x: number; y: number }[];
  private readonly pathLength: number;
  readonly mara: MaraState;
  private readonly maraBonus: boolean;

  constructor(public readonly layout: IdleLayout = createIdleLayout(), options: { maraBonus?: boolean } = {}) {
    this.maraBonus = options.maraBonus !== false;
    this.path = layout.road.waypoints.map(position => cellCenter(layout, position));
    this.pathLength = this.path.slice(1).reduce((sum, point, index) => sum + distance(this.path[index], point), 0);
    if (this.path.length < 2 || this.pathLength <= 0) throw new Error('Battle requires a non-empty enemy route.');
    const starter = layout.towerPads.find(pad => pad.isStarter);
    if (!starter || starter.availability !== 'initial' || !isUnlockedCell(layout, starter.cell)) {
      throw new Error('Battle requires an unlocked starter pad.');
    }
    this.towers.push(this.createTower(starter.id, true));
    this.mara = createMara(layout, this.towers[0].uid);
  }

  /** The B03 codec deliberately supports only the shipped starting layout.
   * A changed route/unlock layout needs a new version before it can be saved.
   */
  snapshot(): BattleSnapshot {
    if (JSON.stringify(this.layout) !== SNAPSHOT_LAYOUT_JSON) {
      throw new Error('Unsupported battle layout for snapshot version 4.');
    }
    return {
      schemaVersion: 4, rulesVersion: BATTLE_RULES_VERSION, layoutVersion: 1, layoutId: 'start28',
      goldRemainderUnits: this.goldRemainderUnits, mode: this.mode, highestCleared: this.highestCleared,
      attemptId: this.attemptId, liveClearedWaves: [...this.liveClearedWaves],
      farmWave: this.farmWave, advanceRequested: this.advanceRequested,
      gold: this.gold, lives: this.lives, wave: this.wave, phase: this.phase,
      elapsed: this.elapsed, ticks: this.ticks, pendingTime: this.pendingTime,
      uid: this.uid, intermissionRemaining: this.intermissionRemaining,
      kills: this.kills, earned: this.earned, queue: this.queue.map(def => def.id),
      spawnTimer: this.spawnTimer,
      towers: this.towers.map(tower => ({
        uid: tower.uid, padId: tower.padId, kind: tower.def.id, level: tower.level, cooldown: tower.cooldown,
        spent: tower.spent, kills: tower.kills, angle: tower.angle, protected: tower.protected,
      })),
      enemies: this.enemies.map(({ def, ...enemy }) => ({ ...enemy, defId: def.id })),
      shots: this.shots.map(shot => ({ ...shot })),
      mara: cloneMara(this.mara),
      settlement: { ...this.settlement }, tutorial: { ...this.tutorial },
    };
  }

  /** Reject malformed/newer snapshots before exposing a model. Rebuilding refs
   * never fires commands, combat ticks, purchases or reward/UI events.
   */
  static restore(value: unknown, options: { maraBonus?: boolean } = {}): IdleBattle | undefined {
    // v1 carried no reliable live-clear evidence. Preserve its exact combat and
    // progress estimate, but never invent farm certificates from old wave numbers.
    if (isRecord(value) && value.schemaVersion === 1 && value.rulesVersion === 1) {
      value = {
        ...value, schemaVersion: 2, goldRemainderUnits: 0, mode: 'advance',
        highestCleared: integerIn(value.wave) ? Math.max(0, value.wave - (value.phase === 'intermission' ? 0 : 1)) : -1,
        attemptId: value.wave, liveClearedWaves: [], farmWave: 1, advanceRequested: false,
      };
    }
    const model = new IdleBattle(SNAPSHOT_LAYOUT, options);
    if (isRecord(value) && ((value.schemaVersion === 2 && value.rulesVersion === 1)
      || (value.schemaVersion === 3 && value.rulesVersion === 2))) {
      // Validate the original rules before migrating. A rule change invalidates
      // old live-clear evidence, never confirmed money or historical absence.
      const legacySchema = value.schemaVersion as 2 | 3;
      if (!validSnapshot(value, model.layout, model.path, model.pathLength, legacySchema)) return undefined;
      value = { ...value, schemaVersion: 4, rulesVersion: BATTLE_RULES_VERSION,
        liveClearedWaves: [], farmWave: 1, mara: legacySchema === 3 ? value.mara : cloneMara(model.mara),
        towers: value.towers.map(tower => ({ ...tower, kind: 1 })),
        enemies: value.enemies.map(enemy => ({ ...enemy, slowRemaining: 0 })),
        shots: value.shots.map(shot => ({ ...shot, kind: 1 })),
        settlement: { ...model.settlement }, tutorial: { ...model.tutorial,
          builtTower: value.towers.some(tower => !tower.protected),
          upgradedTower: value.towers.some(tower => tower.level > 1) } };
    }
    if (!validSnapshot(value, model.layout, model.path, model.pathLength)) return undefined;
    model.gold = value.gold;
    model.goldRemainderUnits = value.goldRemainderUnits;
    model.mode = value.mode;
    model.highestCleared = value.highestCleared;
    model.attemptId = value.attemptId;
    model.liveClearedWaves = [...value.liveClearedWaves];
    model.farmWave = value.farmWave;
    model.advanceRequested = value.advanceRequested;
    model.lives = value.lives;
    model.wave = value.wave;
    model.phase = value.phase;
    model.elapsed = value.elapsed;
    model.ticks = value.ticks;
    model.pendingTime = value.pendingTime;
    model.uid = value.uid;
    model.intermissionRemaining = value.intermissionRemaining;
    model.kills = value.kills;
    model.earned = value.earned;
    model.queue = value.queue.map(id => BASE.enemies[id]);
    model.spawnTimer = value.spawnTimer;
    model.towers = value.towers.map(({ kind, ...tower }) => ({
      ...tower, ...cellCenter(model.layout, model.layout.towerPads.find(pad => pad.id === tower.padId)!.cell),
      def: towerDefinition(kind), visualStage: tower.level >= 4 ? 2 : 1,
    }));
    model.enemies = value.enemies.map(({ defId, ...enemy }) => ({ ...enemy, def: BASE.enemies[defId] }));
    model.shots = value.shots.map(shot => ({ ...shot }));
    Object.assign(model.mara, cloneMara(value.mara));
    model.settlement = { ...value.settlement }; model.tutorial = { ...value.tutorial };
    model.events = [];
    return model;
  }

  get remaining(): number { return this.enemies.length + this.queue.length; }
  get maxLevel(): number { return this.settlement.frostResearched ? 6 : 3; }

  buildWorkshop(): boolean {
    if (this.phase === 'defeat' || this.settlement.workshopBuilt || this.gold < SETTLEMENT.workshopCost) return false;
    this.gold -= SETTLEMENT.workshopCost;
    this.settlement.workshopBuilt = true; this.settlement.builtAt = this.elapsed;
    this.events.push({ type: 'workshop', amount: SETTLEMENT.workshopCost });
    return true;
  }
  researchFrost(): boolean {
    if (this.phase === 'defeat' || !this.settlement.workshopBuilt || this.settlement.frostResearched || this.gold < SETTLEMENT.researchCost) return false;
    this.gold -= SETTLEMENT.researchCost; this.settlement.frostResearched = true;
    this.events.push({ type: 'research', amount: SETTLEMENT.researchCost });
    return true;
  }

  assignMara(uid: number): boolean {
    const tower = this.towers.find(tower => tower.uid === uid);
    if (!tower || (uid === this.mara.targetTowerUid && !this.mara.unreachable)) return false;
    assignMaraTarget(this.mara, tower, this.layout, getForestBlockedCells(this.layout));
    return true;
  }

  isMaraBoosted(uid: number): boolean {
    return this.maraBonus && this.phase === 'wave' && this.mara.targetTowerUid === uid
      && !this.mara.unreachable && this.mara.path.length === 0 && this.mara.effectRemaining > 1e-9;
  }

  /** A certified target affects the next attempt, never the running queue.
   * Zero means no certificate yet: replay live entry wave one to earn evidence.
   */
  setFarmWave(wave: number): boolean {
    const target = wave === 0 ? 1 : wave;
    if (!isNormalFarmWave(target) || (target !== 1 && (target > this.highestCleared || !this.liveClearedWaves.includes(target)))) return false;
    this.farmWave = target;
    return true;
  }

  requestAdvance(): boolean {
    if (this.mode !== 'farm' || this.advanceRequested) return false;
    this.advanceRequested = true;
    return true;
  }

  /** Offline is credited in thousandths. Spending whole gold preserves change.
   * The session commits this mutation together with its one-time claim record.
   */
  creditOfflineUnits(amountUnits: number): void {
    if (!Number.isSafeInteger(amountUnits) || amountUnits < 0
      || !Number.isSafeInteger(amountUnits + this.goldRemainderUnits)) throw new Error('Invalid offline gold transaction.');
    const total = amountUnits + this.goldRemainderUnits;
    this.credit(Math.floor(total / 1000), true);
    this.goldRemainderUnits = total % 1000;
  }

  canBuild(padId: string, kind: TowerId = 1): boolean {
    const pad = this.layout.towerPads.find(candidate => candidate.id === padId);
    return this.phase !== 'defeat' && !!pad && pad.availability === 'initial'
      && isUnlockedCell(this.layout, pad.cell) && !this.towers.some(tower => tower.padId === padId)
      && (kind === 1 || (kind === 2 && this.settlement.frostResearched))
      && this.gold >= towerDefinition(kind).cost;
  }

  build(padId: string, kind: TowerId = 1): Tower | undefined {
    if (!this.canBuild(padId, kind)) return undefined;
    const tower = this.createTower(padId, false, kind);
    this.gold -= tower.def.cost;
    this.towers.push(tower);
    this.tutorial.builtTower = true;
    this.events.push({ type: 'build', tower, x: tower.x, y: tower.y, amount: tower.def.cost });
    return tower;
  }

  upgrade(uid: number): boolean {
    const tower = this.towers.find(candidate => candidate.uid === uid);
    if (this.phase === 'defeat' || !tower || tower.level >= this.maxLevel) return false;
    const cost = upgradeCost(tower);
    if (this.gold < cost) return false;
    this.gold -= cost;
    tower.spent += cost;
    tower.level++;
    tower.visualStage = tower.level >= 4 ? 2 : 1;
    this.tutorial.upgradedTower = true;
    this.events.push({ type: 'upgrade', tower, x: tower.x, y: tower.y, amount: cost });
    return true;
  }

  sell(uid: number): boolean {
    const tower = this.towers.find(candidate => candidate.uid === uid);
    if (this.phase === 'defeat' || !tower || tower.protected) return false;
    const amount = sellValue(tower);
    this.credit(amount, false);
    this.towers = this.towers.filter(candidate => candidate.uid !== uid);
    if (this.mara.targetTowerUid === uid) this.assignMara(this.towers.find(tower => tower.protected)!.uid);
    this.events.push({ type: 'sell', tower, x: tower.x, y: tower.y, amount });
    return true;
  }

  /** Seconds at 1×; fixed 25 ms ticks make chunking independent of rendering.
   * A partial step is retained. The browser owns suspension/absence handling.
   */
  update(dt: number): void {
    if (!Number.isFinite(dt) || dt <= 0) return;
    this.pendingTime += dt;
    const count = Math.floor((this.pendingTime + 1e-9) / BASE.stepSeconds);
    this.pendingTime -= count * BASE.stepSeconds;
    if (Math.abs(this.pendingTime) < 1e-9) this.pendingTime = 0;
    for (let index = 0; index < count; index++) {
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

  private createTower(padId: string, protectedStarter: boolean, kind: TowerId = 1): Tower {
    const pad = this.layout.towerPads.find(candidate => candidate.id === padId)!;
    const def = towerDefinition(kind);
    return {
      uid: this.uid++, padId, ...cellCenter(this.layout, pad.cell), def,
      level: 1, visualStage: 1, cooldown: 0, spent: protectedStarter ? 0 : def.cost,
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
    if (this.advanceRequested) {
      this.mode = 'advance';
      this.advanceRequested = false;
    }
    this.wave = this.mode === 'advance' ? this.highestCleared + 1 : this.farmWave;
    this.attemptId++;
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
      distance: 0, total: this.pathLength, segment: 0, speed: def.speed, slowRemaining: 0,
      direction: 'side', flip: false,
    });
  }

  private move(enemy: Enemy, dt: number): void {
    const slowed = Math.min(dt, enemy.slowRemaining);
    let travel = enemy.speed * (dt - slowed * (1 - SETTLEMENT.slowFactor));
    enemy.slowRemaining = Math.max(0, enemy.slowRemaining - dt);
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
    if (shot.kind === 2 && enemy.hp > 0) {
      enemy.slowRemaining = SETTLEMENT.slowSeconds; this.tutorial.frostSeen = true;
    }
    this.events.push({ type: 'hit', shot, enemy, x: enemy.x, y: enemy.y, amount: shot.damage });
    if (enemy.hp > 0) return;
    const owner = this.towers.find(tower => tower.uid === shot.towerUid);
    if (owner) owner.kills++;
    this.credit(enemy.def.gold, true);
    this.kills++;
    this.events.push({ type: 'kill', tower: owner, enemy, x: enemy.x, y: enemy.y, amount: enemy.def.gold });
  }

  private tick(dt: number): void {
    let maraTarget = this.towers.find(tower => tower.uid === this.mara.targetTowerUid);
    if (!maraTarget) {
      maraTarget = this.towers.find(tower => tower.protected)!;
      assignMaraTarget(this.mara, maraTarget, this.layout, getForestBlockedCells(this.layout));
    }
    const boostedSeconds = stepMara(this.mara, maraTarget, this.layout, getForestBlockedCells(this.layout),
      dt, this.phase === 'wave', this.maraBonus);
    if (this.phase === 'defeat') {
      this.mode = 'farm';
      this.lives = BASE.coreLives;
      this.enemies = [];
      this.shots = [];
      this.queue = [];
      this.spawnTimer = 0;
      this.phase = 'intermission';
      this.intermissionRemaining = BASE.intermissionSeconds;
      return;
    }
    if (this.phase === 'intermission') {
      this.intermissionRemaining = Math.max(0, this.intermissionRemaining - dt);
      if (this.intermissionRemaining <= 1e-9) this.startAttempt();
      return;
    }
    if (this.queue.length) this.spawnTimer -= dt;
    while (this.queue.length && this.spawnTimer <= 1e-9) {
      this.spawn(this.queue.shift()!);
      this.spawnTimer += Math.max(BASE.waves.minSpawnInterval, BASE.waves.spawnInterval - (this.wave - 1) * 0.025);
    }
    // This timer only schedules queued spawns. Letting it run negative after
    // the last spawn rejects valid saves when Frost prolongs a live wave.
    if (!this.queue.length) this.spawnTimer = 0;
    for (const enemy of this.enemies) if (enemy.hp > 0) this.move(enemy, dt);
    if (this.lives <= 0) {
      if (this.mode === 'farm') this.farmWave = 1;
      this.mode = 'farm';
      this.advanceRequested = false;
      this.phase = 'defeat';
      this.shots = [];
      this.events.push({ type: 'defeat', wave: this.wave });
      return;
    }
    for (const tower of this.towers) {
      const support = tower.uid === this.mara.targetTowerUid ? boostedSeconds * (MARA.fireRate - 1) : 0;
      tower.cooldown = Math.max(0, tower.cooldown - dt - support);
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
        damage: stat.damage, level: tower.level, kind: tower.def.id,
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
      this.highestCleared = Math.max(this.highestCleared, this.wave);
      if (isNormalFarmWave(this.wave) && !this.liveClearedWaves.includes(this.wave)) {
        const completed = [...this.liveClearedWaves, this.wave].sort((a, b) => a - b);
        const retained = completed.slice(-LIVE_CANDIDATE_LIMIT);
        // Pin the actual entry evidence and current certified target so an old
        // still-valid proof cannot disappear merely because history is bounded.
        for (const pinned of [1, this.farmWave]) {
          if (!completed.includes(pinned) || retained.includes(pinned)) continue;
          const replace = retained.findIndex(candidate => candidate !== 1 && candidate !== this.farmWave);
          retained.splice(replace, 1, pinned);
        }
        this.liveClearedWaves = retained.sort((a, b) => a - b);
      }
      this.events.push({ type: 'clear', wave: this.wave, amount });
      this.phase = 'intermission';
      this.intermissionRemaining = BASE.intermissionSeconds;
    }
  }
}


const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);
const numberIn = (value: unknown, min: number, max: number): value is number =>
  typeof value === 'number' && Number.isFinite(value) && value >= min && value <= max;
const integerIn = (value: unknown, min = 0, max = Number.MAX_SAFE_INTEGER): value is number =>
  typeof value === 'number' && Number.isSafeInteger(value) && value >= min && value <= max;
const enemyId = (value: unknown): value is EnemyDef['id'] => value === 'Leafbug' || value === 'Firebug';
const near = (left: number, right: number): boolean => Math.abs(left - right) <= 1e-6;

/** Limits follow the finite shipped rules, rather than trusting serialized stats.
 * Dead escaped enemies can still be present at defeat: tick exits before cleanup.
 * Likewise an earlier in-flight shot may have lost its target to a later shot
 * in the same tick; it is discarded normally on the following tick.
 */
function validSnapshot(
  value: unknown, layout: IdleLayout, path: readonly { x: number; y: number }[], pathLength: number, legacy: 0 | 2 | 3 = 0,
): value is BattleSnapshot {
  if (!isRecord(value) || value.schemaVersion !== (legacy || 4) || value.rulesVersion !== (legacy === 2 ? 1 : legacy === 3 ? 2 : BATTLE_RULES_VERSION)
    || value.layoutVersion !== 1 || value.layoutId !== 'start28') return false;
  if (!legacy) {
    if (!isRecord(value.settlement) || typeof value.settlement.workshopBuilt !== 'boolean'
      || typeof value.settlement.frostResearched !== 'boolean'
      || (value.settlement.frostResearched && !value.settlement.workshopBuilt)
      || (value.settlement.workshopBuilt ? !numberIn(value.settlement.builtAt, 0, value.elapsed as number) : value.settlement.builtAt !== null)
      || !isRecord(value.tutorial) || typeof value.tutorial.hidden !== 'boolean'
      || !integerIn(value.tutorial.seen, 0, 255) || typeof value.tutorial.builtTower !== 'boolean'
      || typeof value.tutorial.upgradedTower !== 'boolean' || typeof value.tutorial.frostSeen !== 'boolean') return false;
  }
  const levelLimit = !legacy && (value.settlement as BattleSnapshot['settlement']).frostResearched ? 6 : 3;
  if (!integerIn(value.goldRemainderUnits, 0, 999) || (value.mode !== 'advance' && value.mode !== 'farm')
    || !integerIn(value.highestCleared, 0, Number.MAX_SAFE_INTEGER - 1) || !integerIn(value.attemptId)
    || !integerIn(value.farmWave, 1) || !isNormalFarmWave(value.farmWave)
    || typeof value.advanceRequested !== 'boolean' || (value.advanceRequested && value.mode !== 'farm')
    || !Array.isArray(value.liveClearedWaves) || value.liveClearedWaves.length > LIVE_CANDIDATE_LIMIT) return false;
  let previousWave = 0;
  for (const wave of value.liveClearedWaves) {
    if (!integerIn(wave, 1, value.highestCleared) || !isNormalFarmWave(wave) || wave <= previousWave) return false;
    previousWave = wave;
  }
  if (value.farmWave !== 1 && !value.liveClearedWaves.includes(value.farmWave)) return false;
  if (!integerIn(value.gold) || !integerIn(value.earned) || !integerIn(value.kills)
    || !integerIn(value.wave) || !integerIn(value.uid, 2)
    || !integerIn(value.ticks) || !numberIn(value.elapsed, 0, Number.MAX_SAFE_INTEGER)
    || value.elapsed !== value.ticks * BASE.stepSeconds
    || !numberIn(value.pendingTime, 0, BASE.stepSeconds) || value.pendingTime >= BASE.stepSeconds
    || !integerIn(value.lives, 0, BASE.coreLives)
    || !numberIn(value.intermissionRemaining, 0, BASE.intermissionSeconds)
    || !numberIn(value.spawnTimer, -pathLength / Math.min(...Object.values(BASE.enemies).map(def => def.speed)) - BASE.stepSeconds,
      BASE.waves.spawnInterval)) return false;
  if (value.phase !== 'wave' && value.phase !== 'intermission' && value.phase !== 'defeat') return false;
  if ((value.phase === 'defeat') !== (value.lives === 0)) return false;
  if ((value.phase === 'wave' || value.phase === 'defeat') && value.wave === 0) return false;
  if (value.phase !== 'intermission' && value.intermissionRemaining !== 0) return false;
  if (!Array.isArray(value.towers) || value.towers.length < 1 || value.towers.length > 4
    || !Array.isArray(value.enemies) || value.enemies.length > BASE.waves.maxCount
    || !Array.isArray(value.shots) || value.shots.length > 1024
    || !Array.isArray(value.queue) || value.queue.length > BASE.waves.maxCount) return false;
  if (value.phase === 'intermission' && (value.queue.length || value.enemies.length || value.shots.length)) return false;
  if (value.phase === 'wave' && value.queue.length + value.enemies.length === 0) return false;
  if (value.phase === 'defeat' && value.shots.length) return false;
  if (value.wave === 0 && (value.elapsed >= BASE.firstWaveDelay || value.kills !== 0 || value.highestCleared !== 0
    || value.attemptId !== 0 || value.mode !== 'advance' || value.liveClearedWaves.length > 0)) return false;
  if (value.wave > 0 && (value.attemptId < 1 || value.wave > value.highestCleared + 1)) return false;

  const waveCount = value.wave === 0 ? 0 : Math.min(BASE.waves.maxCount, BASE.waves.firstCount + value.wave - 1);
  if (value.queue.length + value.enemies.length > waveCount) return false;
  for (let index = 0; index < value.queue.length; index++) {
    const recipeIndex = waveCount - value.queue.length + index;
    const expected = value.wave >= 4 && recipeIndex % 3 === 2 ? 'Firebug' : 'Leafbug';
    if (value.queue[index] !== expected) return false;
  }
  const ids = new Set<number>(), pads = new Set<string>(), towerIds = new Set<number>(), enemyIds = new Set<number>();
  const takeId = (id: unknown): id is number => {
    if (!integerIn(id, 1, value.uid as number - 1) || ids.has(id)) return false;
    ids.add(id);
    return true;
  };
  let protectedCount = 0, towerKills = 0;
  for (const tower of value.towers) {
    if (!isRecord(tower) || (!legacy && tower.kind !== 1 && tower.kind !== 2)) return false;
    const def = towerDefinition(legacy ? 1 : tower.kind as TowerId);
    if (!legacy && def.id === 2 && !(value.settlement as BattleSnapshot['settlement']).frostResearched) return false;
    if (!isRecord(tower) || !takeId(tower.uid) || typeof tower.padId !== 'string' || pads.has(tower.padId)
      || !integerIn(tower.level, 1, levelLimit) || typeof tower.protected !== 'boolean'
      || !numberIn(tower.cooldown, 0, def.cooldown) || !numberIn(tower.angle, -2 * Math.PI, 2 * Math.PI)
      || !integerIn(tower.kills, 0, value.kills)) return false;
    const pad = layout.towerPads.find(candidate => candidate.id === tower.padId);
    if (!pad || pad.availability !== 'initial' || !isUnlockedCell(layout, pad.cell)) return false;
    if (tower.protected !== pad.isStarter || (tower.protected && (tower.uid !== 1 || def.id !== 1))) return false;
    if (tower.protected) protectedCount++;
    let expectedSpent = tower.protected ? 0 : def.cost;
    for (let level = 1; level < tower.level; level++) expectedSpent += upgradeCost({ def, level });
    if (tower.spent !== expectedSpent) return false;
    pads.add(tower.padId);
    towerIds.add(tower.uid);
    towerKills += tower.kills;
  }
  if (protectedCount !== 1 || towerKills > value.kills) return false;
  if (legacy !== 2 && !validMara(value.mara, value.towers.map(tower => ({ ...tower,
    ...cellCenter(layout, layout.towerPads.find(pad => pad.id === tower.padId)!.cell) })), layout, getForestBlockedCells(layout))) return false;
  const cumulative = [0];
  for (let index = 1; index < path.length; index++) cumulative.push(cumulative[index - 1] + distance(path[index - 1], path[index]));
  for (const enemy of value.enemies) {
    if (!isRecord(enemy) || !takeId(enemy.uid) || !enemyId(enemy.defId)
      || !numberIn(enemy.x, 0, layout.bounds.width) || !numberIn(enemy.y, 0, layout.bounds.height)
      || !numberIn(enemy.maxHp, 1, Math.max(...Object.values(BASE.enemies).map(def => def.hp)) * BASE.waves.maxHpMultiplier)
      || !numberIn(enemy.hp, 0, enemy.maxHp) || !numberIn(enemy.distance, 0, pathLength + 1e-6)
      || enemy.total !== pathLength || !integerIn(enemy.segment, 0, path.length - 1)
      || enemy.speed !== BASE.enemies[enemy.defId].speed || typeof enemy.flip !== 'boolean'
      || (!legacy && !numberIn(enemy.slowRemaining, 0, SETTLEMENT.slowSeconds))
      || (enemy.direction !== 'up' && enemy.direction !== 'down' && enemy.direction !== 'side')) return false;
    const def = BASE.enemies[enemy.defId];
    const expectedHp = def.hp * Math.min(BASE.waves.maxHpMultiplier, Math.pow(BASE.waves.hpGrowth, value.wave - 1));
    if (enemy.maxHp !== expectedHp || (value.wave < 4 && enemy.defId !== 'Leafbug')) return false;
    if (enemy.hp === 0 && (value.phase !== 'defeat' || enemy.segment !== path.length - 1)) return false;
    if (enemy.segment === path.length - 1) {
      if (value.phase !== 'defeat' || enemy.hp !== 0 || !near(enemy.distance, pathLength)
        || !near(enemy.x, path.at(-1)!.x) || !near(enemy.y, path.at(-1)!.y)) return false;
    } else {
      const start = path[enemy.segment], end = path[enemy.segment + 1];
      const length = distance(start, end), travelled = enemy.distance - cumulative[enemy.segment];
      if (travelled < -1e-6 || travelled > length + 1e-6
        || !near(enemy.x, start.x + (end.x - start.x) * travelled / length)
        || !near(enemy.y, start.y + (end.y - start.y) * travelled / length)) return false;
    }
    enemyIds.add(enemy.uid);
  }
  for (const shot of value.shots) {
    if (!isRecord(shot) || (!legacy && shot.kind !== 1 && shot.kind !== 2)) return false;
    const def = towerDefinition(legacy ? 1 : shot.kind as TowerId);
    if (!legacy && def.id === 2 && !(value.settlement as BattleSnapshot['settlement']).frostResearched) return false;
    if (!isRecord(shot) || !takeId(shot.uid) || !integerIn(shot.towerUid, 1, shot.uid - 1)
      || !integerIn(shot.target, 2, shot.uid - 1) || towerIds.has(shot.target) || enemyIds.has(shot.towerUid)
      || !numberIn(shot.x, 0, layout.bounds.width) || !numberIn(shot.y, 0, layout.bounds.height)
      || !integerIn(shot.level, 1, levelLimit) || shot.speed !== BASE.projectileSpeed
      || shot.damage !== def.damage * DAMAGE_MULTIPLIERS[shot.level - 1]) return false;
  }
  // References may point at removed source/target entities, but never at a projectile.
  const shotIds = new Set(value.shots.map(shot => shot.uid));
  return value.shots.every(shot => !shotIds.has(shot.towerUid) && !shotIds.has(shot.target));
}
