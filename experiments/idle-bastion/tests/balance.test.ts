import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { IdleBattle } from '../src/battle';
import { BALANCE, battleReward, healthMultiplier } from '../src/balance';
import { certifyFarm, isFarmCertificateValid } from '../src/farming';
import { recommendedUpgrade, currentGoal } from '../src/progress-ui';
import { runBalance } from './helpers/balance-run';

test('B13 keeps entry recipes/rewards intact, softens later HP and bounds income', () => {
  for(let wave=1;wave<=14;wave++){
    assert.equal(healthMultiplier(wave,10,false),healthMultiplier(wave,9,false));
    assert.equal(battleReward(17,wave,10),17);
  }
  assert.equal(healthMultiplier(15,10,true),healthMultiplier(15,9,true)*1.2);
  assert.equal(healthMultiplier(15,10,false),healthMultiplier(15,9,false));
  assert.ok(healthMultiplier(25,10,true)<healthMultiplier(25,9,true));
  assert.equal(battleReward(17,16,10),34);assert.equal(battleReward(17,16,9),17);
  assert.equal(battleReward(17,1000,10),17*BALANCE.maxRewardFactor);
  assert.equal(healthMultiplier(1000,10,false),100000);
});

test('v13 active boss/queue/HP and money survive migration without a mid-wave balance switch', () => {
  const old=JSON.parse(readFileSync(new URL('./fixtures/balance-v13.json',import.meta.url),'utf8'));
  const b=IdleBattle.restore(old)!;assert.ok(b);
  const saved=b.snapshot();assert.equal(saved.schemaVersion,16);assert.equal(saved.rulesVersion,10);
  assert.equal(saved.waveRecipeVersion,9);assert.equal(saved.gold,old.gold);
  for(const field of ['enemies','shots','queue','bossCharm','towers'] as const)assert.deepEqual(saved[field],old[field]);
  assert.deepEqual(saved.liveClearedWaves,[]);assert.equal(saved.farmWave,1);
  b.update(.1);assert.ok(IdleBattle.restore(b.snapshot()));
  const attempt=b.attemptId;
  for(let s=0;s<300&&b.attemptId===attempt;s++)b.update(1);
  assert.ok(b.attemptId>attempt);assert.equal(b.waveRecipeVersion,10);assert.ok(IdleBattle.restore(b.snapshot()));
});

test('an upgrade reproves the formerly safe wave even when the latest two clears are unsafe', () => {
  const {b,proof}=runBalance('guided',120);assert.ok(proof&&proof.wave>1);
  // Structural fixture: later leaky victories must not hide a known older safe candidate.
  b.highestCleared=100;b.liveClearedWaves=[1,proof.wave,99,100];b.gold=1000;
  assert.ok(b.upgrade(b.towers[1].uid));assert.equal(isFarmCertificateValid(proof,b),false);
  const before=b.snapshot(),next=certifyFarm(b,proof)!;
  assert.ok(next&&next.wave>1);assert.ok(isFarmCertificateValid(next,b));
  assert.deepEqual(b.snapshot(),before);
  for(const t of [...b.towers])if(!t.protected)b.sell(t.uid);
  assert.equal(isFarmCertificateValid(next,b),false);
});

test('workshop II objective and its action select the same useful area-damage investment', () => {
  const {b}=runBalance('guided',180);b.settlement.workshopUpgraded=true;b.settlement.upgradedAt=b.elapsed;b.bossVictories=1;
  const tower=recommendedUpgrade(b)!;assert.equal(tower.def.id,3);
  assert.match(currentGoal(b).title,new RegExp(`Level ${tower.level+1}`));
});
