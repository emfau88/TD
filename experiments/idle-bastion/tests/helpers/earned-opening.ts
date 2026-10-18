import assert from 'node:assert/strict';
import { BASE, IdleBattle } from '../../src/battle';
import { BOSS } from '../../src/boss';
import { certifyFarm } from '../../src/farming';

// All money, unlocks and placements below are earned through regular actions.
export function playOpening() {
  const b = new IdleBattle(), archer = b.build('tower-03')!; b.assignMara(archer.uid);
  let bossStarted = 0, interrupts = 0, warehouseAt = 0;
  let duringOwnedCharm: ReturnType<IdleBattle['snapshot']> | undefined;
  let duringCharm: ReturnType<IdleBattle['snapshot']> | undefined;
  for (let frame = 0; frame < 32000 && !b.bossVictories; frame++) {
    if (archer.level === 1) b.upgrade(archer.uid);
    if (!b.settlement.workshopBuilt) b.buildWorkshop();
    if (!b.settlement.frostResearched) b.researchFrost();
    b.build('tower-02', 2); b.build('tower-06', 3);
    if (b.highestCleared >= 5) for (const tower of b.towers) if (tower.level < 3) b.upgrade(tower.uid);
    if (!b.settlement.warehouseBuilt && b.buildWarehouse()) warehouseAt = b.elapsed;
    if (b.settlement.warehouseBuilt) {
      const sniper = b.towers.find(t => t.def.id === 4) ?? b.build('tower-07', 4);
      if (sniper) {
        if (sniper.level < 3) b.upgrade(sniper.uid);
        else { b.build('tower-05'); for (const tower of [...b.towers].sort((a,z) => z.def.id-a.def.id)) if (tower.level < 4) b.upgrade(tower.uid); }
      }
    }
    if (b.mode === 'farm' && frame % 40 === 0) { b.setFarmWave(certifyFarm(b)?.wave ?? 1); if (b.towers.some(t => t.def.id === 4 && t.level >= 3)) b.requestAdvance(); }
    if (b.bossActive && !bossStarted) bossStarted = b.elapsed;
    if (b.bossCharm.phase === 'channel' && !duringCharm) duringCharm = b.snapshot();
    if (b.bossCharm.phase === 'channel' && b.bossCharm.targetUid !== 1 && !duringOwnedCharm) duringOwnedCharm = b.snapshot();
    const wallet = b.gold * 1000 + b.goldRemainderUnits;
    b.update(BASE.stepSeconds);
    const events = b.drainEvents();
    if (events.some(e => e.type === 'boss-victory')) {
      const ordinary = events.filter(e => e.type === 'kill' || e.type === 'clear').reduce((sum,e) => sum + (e.amount ?? 0),0);
      assert.equal(b.gold * 1000 + b.goldRemainderUnits - wallet, Math.round((ordinary + BOSS.firstReward) * 1000));
    }
    for (const e of events) { if (e.type === 'boss-interrupt') interrupts++; }
  }
  console.log('B10 legal run:', { warehouseAt, bossStarted, victoryAt: b.elapsed, wins:b.bossVictories, gold:b.gold, bossAttempts:b.progress.waves.find(row=>row.wave===15)?.advance, interrupts, towers:b.towers.map(t=>[t.padId,t.def.id,t.level]) });
  assert.equal(b.bossVictories, 1, 'First boss must be beatable through earned purchases');
  assert.ok(b.elapsed >= 7*60 && b.elapsed <= 10*60, 'First victory should land in the 7–10 minute target');
  return { b, duringCharm, duringOwnedCharm, interrupts };
}
