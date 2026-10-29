import { IdleBattle, visualStage } from './battle';
import { SKIN_LEVELS, towerPreviewDatabase, type SkinLevel } from './tower-evolution';
import { openBattleStore } from './save-store';

export type TowerScenario = 'mixed' | 'warden' | 'frost' | 'slinger' | 'sniper';
export function isTowerScenario(value: unknown): value is TowerScenario {
  return value === 'mixed' || value === 'warden' || value === 'frost' || value === 'slinger' || value === 'sniper';
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
  // Move the synthetic defense to the middle stretch; never attack at the spawn.
  const reviewPads = [[11,3],[12,3],[13,3],[14,3],[11,5],[12,5],[13,5],[14,5]];
  const parked = b.layout.towerPads.find(p=>p.cell.x>=22&&b.canBuild(p.id,1));
  if (!parked) throw new Error('Missing safe starter parking pad');
  Object.assign(starter,{padId:parked.id,x:parked.cell.x*40+20,y:parked.cell.y*40+20});
  const levels = level === 'all' ? [...SKIN_LEVELS] : scenario === 'mixed' ? [level,level,level,level] : [level];
  for (const [i, targetLevel] of levels.entries()) {
    const kind = scenario === 'warden' ? 1 : scenario === 'frost' ? 2 : scenario === 'slinger' ? 3 : scenario === 'sniper' ? 4 : (i % 4 + 1) as 1|2|3|4;
    const [x,y] = reviewPads[i];
    const pad = b.layout.towerPads.find(p=>p.cell.x===x&&p.cell.y===y);
    if (!pad) throw new Error('Missing review pad');
    const tower = i===0&&kind===1 ? Object.assign(starter,{padId:pad.id,x:x*40+20,y:y*40+20}) : b.build(pad.id,kind);
    if (!tower) throw new Error('Not enough valid pads for test lineup');
    while (tower.level < targetLevel) if (!b.upgrade(tower.uid)) throw new Error('Cannot prepare tower level');
  }
  // Prepare a real wave until the first enemy enters the review area. No HP,
  // damage, speed, range, cooldown or projectile rules are overridden.
  for(let i=0;i<3000&&!b.enemies.some(e=>e.x>=220);i++) b.update(.025);
  if(!b.enemies.some(e=>e.x>=220))throw new Error('No visible approach prepared');
  b.gold = 100_000; // Readable test wallet after purchases; enough for ordinary inspection upgrades.
  b.drainEvents();
  if (!IdleBattle.restore(b.snapshot())) throw new Error('Test setup failed save validation');
  return b;
}
export async function saveTowerProbe(battle: IdleBattle, factory: IDBFactory = globalThis.indexedDB): Promise<string> {
  const probe = `tower-arena-${crypto.randomUUID()}`;
  const store = await openBattleStore(factory, towerPreviewDatabase(probe));
  try {
    if ((await store.load()).kind !== 'empty') throw new Error('Preview slot already occupied');
    await store.save(battle.snapshot(), true, 0); // Start paused so the player can inspect first.
    return probe;
  } finally { store.close(); }
}
