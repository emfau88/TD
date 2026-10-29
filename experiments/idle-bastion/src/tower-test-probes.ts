import { IdleBattle, visualStage } from './battle';
import { SKIN_LEVELS, towerPreviewDatabase, type SkinLevel } from './tower-evolution';
import { openBattleStore } from './save-store';

export type TowerScenario = 'mixed' | 'warden' | 'frost';
export function isTowerScenario(value: unknown): value is TowerScenario {
  return value === 'mixed' || value === 'warden' || value === 'frost';
}
/** Explicitly synthetic VISUAL test setup, never a balance/progression benchmark.
 * Recorded wave-40 world, replaced defensive lineup, added setup gold.
 * Purchases/upgrades and subsequent combat still use the unchanged game commands.
 */
export function createTowerProbe(scenario: TowerScenario, earnedLate: unknown, level: SkinLevel | 'all' = 'all'): IdleBattle {
  if (!isTowerScenario(scenario) || level !== 'all' && !SKIN_LEVELS.includes(level)) throw new Error('Unknown tower test');
  const b = IdleBattle.restore(earnedLate);
  if (!b || b.phase !== 'intermission' || b.enemies.length || b.shots.length) throw new Error('Invalid recorded test foundation');
  for (const t of [...b.towers]) if (!t.protected && !b.sell(t.uid)) throw new Error('Cannot prepare lineup');
  const starter = b.towers.find(t => t.protected)!;
  Object.assign(starter, { level: 1, visualStage: visualStage(1), spent: 0, kills: 0, cooldown: 0, angle: 0 });
  b.gold += 10_000_000; b.earned += 10_000_000;
  b.tutorial.hidden = true;
  const levels = level === 'all' ? [...SKIN_LEVELS] : [level, level, level, level];
  for (const [i, targetLevel] of levels.entries()) {
    const kind = scenario === 'warden' ? 1 : scenario === 'frost' ? 2 : i % 2 === 0 ? 1 : 2;
    const pad = b.layout.towerPads.filter(p => b.canBuild(p.id, kind)).sort((a,c) => {
      const distance = (p: typeof a) => Math.hypot(p.cell.x*40+20-starter.x,p.cell.y*40+20-starter.y);
      return distance(a)-distance(c) || a.id.localeCompare(c.id);
    })[0];
    const tower = i === 0 && kind === 1 ? starter : pad && b.build(pad.id, kind);
    if (!tower) throw new Error('Not enough valid pads for test lineup');
    while (tower.level < targetLevel) if (!b.upgrade(tower.uid)) throw new Error('Cannot prepare tower level');
  }
  b.gold = 100_000; // Readable test wallet after purchases; enough for ordinary inspection upgrades.
  b.drainEvents();
  if (!IdleBattle.restore(b.snapshot())) throw new Error('Test setup failed save validation');
  return b;
}
export async function saveTowerProbe(battle: IdleBattle, factory: IDBFactory = globalThis.indexedDB): Promise<string> {
  const probe = `tower-${crypto.randomUUID()}`;
  const store = await openBattleStore(factory, towerPreviewDatabase(probe));
  try {
    if ((await store.load()).kind !== 'empty') throw new Error('Preview slot already occupied');
    await store.save(battle.snapshot(), true, 0); // Start paused so the player can inspect first.
    return probe;
  } finally { store.close(); }
}
