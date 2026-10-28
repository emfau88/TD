import { legacyFixtures, restoreHistorical, assertHistoricalFields } from './legacy-fixtures';
import assert from 'node:assert/strict';
import test from 'node:test';
import { BASE, IdleBattle, SETTLEMENT, waveCount } from '../src/battle';
import { BOSS } from '../src/boss';
import { certifyFarm } from '../src/farming';
import { createOfflineState, beginAbsence, reserveOffline } from '../src/offline';

import { playOpening } from './helpers/earned-opening';
let earnedOpening: ReturnType<typeof playOpening> | undefined;
function opening() { return earnedOpening ??= playOpening(); }

test('earned boss clear rewards once, records the milestone, and stays outside safe/offline production', () => {
  const b = opening().b;
  assert.ok(IdleBattle.restore(b.snapshot()));
  assert.equal(b.liveClearedWaves.includes(15), false); assert.equal(b.setFarmWave(15), false);
  const proof = certifyFarm(b); assert.ok(proof); assert.notEqual(proof.wave, 15);
  const before = b.snapshot(), state = reserveOffline(beginAbsence(createOfflineState(0),0,proof,false),3600000);
  assert.ok(state.pendingReward!.amountUnits > 0); assert.deepEqual(b.snapshot(),before);
  assert.equal(waveCount(15), 9); assert.equal(waveCount(15,4),20);
});

test('reloaded boss keeps health, skill and deterministic combat; no premature victory', () => {
  assert.ok(opening().duringCharm, 'A visible charm channel must occur');
  const a = IdleBattle.restore(opening().duringCharm)!; assert.ok(a);
  const b = IdleBattle.restore(JSON.parse(JSON.stringify(a.snapshot())))!;
  assert.deepEqual(a.snapshot(), b.snapshot()); assert.equal(b.bossVictories,0);
  for(let i=0;i<800;i++){a.update(BASE.stepSeconds);b.update(BASE.stepSeconds);a.drainEvents();b.drainEvents();}
  assert.deepEqual(a.snapshot(), b.snapshot());
  assert.equal(opening().interrupts,0,'Frost must not interrupt the dance');
});

test('boss escaping forces farming without a first victory; retry is explicit and saveable', () => {
  assert.ok(opening().duringOwnedCharm);
  const b = IdleBattle.restore(opening().duringOwnedCharm)!;
  for(const t of [...b.towers]) if(!t.protected)b.sell(t.uid);
  assert.equal(b.bossCharm.targetUid,null,'Selling the affected tower cancels the link');
  for(let i=0;i<12000 && b.phase!=='defeat';i++){b.update(BASE.stepSeconds);b.drainEvents();}
  assert.equal(b.phase,'defeat'); assert.equal(b.bossVictories,0);
  assert.ok(IdleBattle.restore(b.snapshot())); b.update(BASE.stepSeconds);
  assert.equal(b.mode,'farm'); assert.equal(b.advanceRequested,false);
  assert.equal(b.requestBossChallenge(),true); assert.equal(b.requestBossChallenge(),false);
  const restored=IdleBattle.restore(b.snapshot())!;
  assert.ok(restored); assert.equal(restored.bossChallengeRequested,true);
});

test('old wave-15 record is never a boss victory; an explicit repeat pays no second first reward',() => {
  const old=legacyFixtures().critical.preBoss7;
  const migrated=restoreHistorical(old,{liveClearedWaves:[],farmWave:1});
  assert.equal(migrated.highestCleared,15);assert.equal(migrated.bossVictories,0);
  assert.deepEqual(migrated.liveClearedWaves,[]);assert.equal(migrated.requestBossChallenge(),true);
  const repeat=IdleBattle.restore(opening().b.snapshot())!;assert.equal(repeat.requestBossChallenge(),true);
  let bonus=-1;
  for(let i=0;i<16000&&repeat.bossVictories<2;i++){
    repeat.update(BASE.stepSeconds);for(const e of repeat.drainEvents())if(e.type==='boss-victory')bonus=e.amount!;
  }
  assert.equal(repeat.bossVictories,2);assert.equal(bonus,0);assert.ok(IdleBattle.restore(repeat.snapshot()));
  const bad=repeat.snapshot();bad.bossCharm={phase:'channel',targetUid:99999,remaining:4,cooldown:8};
  assert.equal(IdleBattle.restore(bad),undefined);
});


test('earned boss follow-up can open the clearing early, pays once and retains farming', () => {
  const b=IdleBattle.restore(opening().b.snapshot())!;
  for(let i=0;i<4000 && b.gold<900;i++){b.update(BASE.stepSeconds);b.drainEvents();}
  const wallet=b.gold, victoryAt=opening().b.elapsed;
  assert.equal(b.unlockClearing(),true);assert.equal(b.gold,wallet-SETTLEMENT.clearingCost);
  assert.equal(b.unlockClearing(),false);assert.equal(b.gold,wallet-SETTLEMENT.clearingCost);
  // B13 accepted earlier clears; only the original upper bound remains a deadline.
  assert.ok(b.elapsed>=victoryAt && b.elapsed<=11*60);
  assert.ok(certifyFarm(b),'Expanded snapshot must still support conservative farming proofs');
  console.log('B11 earned clearing:',{openedAt:b.elapsed,goldAfter:b.gold,columns:b.layout.bounds.columns});
});


test('B11 migrates schema-eight saves during the active boss dance without resetting combat',() => {
  const old=legacyFixtures().critical.bossDance8;
  const migrated=restoreHistorical(old,{liveClearedWaves:[],farmWave:1});
  assert.equal(migrated.bossCharm.phase,'channel');assert.deepEqual(migrated.bossCharm,old.bossCharm);
  assert.equal(migrated.waveRecipeVersion,5);
  assert.deepEqual(migrated.drainEvents(),[]);
});

test('earned boss timing honors the B13 no-minimum policy and retains the active-play deadline', () => {
  const seconds=opening().b.elapsed;
  // 15min/REPORT.md accepts 5:46 for guided placement and explicitly rejects artificial time gates.
  assert.ok(seconds>0&&seconds<=10*60,'Active-play first-boss deadline; actual '+seconds+'s');
  assert.ok(opening().duringCharm);assert.ok(seconds>opening().duringCharm!.elapsed);
  assert.equal(opening().b.bossVictories,1);
});
