/** Deterministic legal-action comparison, NOT a real-time browser playtest. */
import { writeFile } from 'node:fs/promises';
import { IdleBattle, BASE, SETTLEMENT } from '../experiments/idle-bastion/src/battle';
const runs = [];
for (const strategy of ['tutorial', 'alternative', 'watch-three-minutes'] as const) {
  const battle = new IdleBattle(), events: { event: string; seconds: number; gold: number; wave: number }[] = [];
  const record = (event: string) => events.push({event, seconds: Number(battle.elapsed.toFixed(3)), gold: battle.gold, wave: battle.wave});
  let firstGold = false, extra = false, frost = false;
  const firstPad = strategy === 'alternative' ? 'tower-04' : 'tower-03';
  for (let step = 0; step < 360 / BASE.stepSeconds; step++) {
    battle.update(BASE.stepSeconds);
    if (battle.kills && !firstGold) { record('first-gold'); firstGold = true; }
    if (strategy === 'watch-three-minutes' && battle.elapsed < 180) { battle.drainEvents(); continue; }
    if (battle.kills && !battle.tutorial.builtTower && battle.build(firstPad)) record('own-tower');
    // The player may upgrade earlier; 30s is the measured comparison's chosen action time.
    if (battle.elapsed >= 30 && battle.tutorial.builtTower && !battle.tutorial.upgradedTower
      && battle.upgrade(battle.towers.find(tower => !tower.protected)!.uid)) record('first-upgrade');
    if (strategy === 'alternative' && battle.tutorial.upgradedTower && !extra && battle.build('tower-02')) {
      extra = true; record('additional-tower');
    }
    if (battle.tutorial.upgradedTower && !battle.settlement.workshopBuilt
      && (strategy !== 'alternative' || extra) && battle.buildWorkshop()) record('workshop');
    if (battle.settlement.workshopBuilt && !battle.settlement.frostResearched && battle.researchFrost()) record('research');
    if (battle.settlement.frostResearched && !frost) {
      const pad = battle.layout.towerPads.find(pad => pad.availability === 'initial' && !battle.towers.some(tower => tower.padId === pad.id));
      if (pad && battle.build(pad.id, 2)) { frost = true; record('frost-tower'); }
    }
    battle.drainEvents();
    if (battle.tutorial.frostSeen) { record('first-slow'); break; }
  }
  runs.push({strategy, workshopCost:SETTLEMENT.workshopCost, events, stateValid:!!IdleBattle.restore(battle.snapshot()),
    gold:battle.gold, highestCleared:battle.highestCleared, mode:battle.mode, reachedFrost:battle.tutorial.frostSeen});
}
const result = {method:'Deterministic model only; regular prices, no grants, 25ms steps at model time. Browser timings are reported separately.', runs};
await writeFile(new URL('../artifacts/idle-bastion/acceptance/90s/model-comparison.json', import.meta.url), `${JSON.stringify(result,null,2)}\n`);
console.log(JSON.stringify(result,null,2));
