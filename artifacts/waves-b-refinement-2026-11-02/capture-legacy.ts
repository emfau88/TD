import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,existsSync} from 'node:fs';
import {IdleBattle} from '../waves-26-50-study-2026-11-02/control/engine/battle';
import {certifyFarm} from '../waves-26-50-study-2026-11-02/control/engine/farming';
import {beginAbsence,createOfflineState,WAREHOUSE_OFFLINE} from '../waves-26-50-study-2026-11-02/control/engine/offline';
const output='experiments/idle-bastion/tests/fixtures/wave-progression-v17.json';
assert.ok(!existsSync(output));
const earned=JSON.parse(readFileSync(new URL('../waves-26-50-study-2026-11-02/control/runs/mixed-fresh60.json',import.meta.url),'utf8')).snapshots.clear30;
const b=IdleBattle.restore(earned)!;assert.ok(b);
const proof=certifyFarm(b)!;assert.ok(proof);
for(let i=0;i<200;i++)b.update(.025);
assert.equal(b.wave,31);assert.equal(b.phase,'wave');
const before=b.snapshot();
for(let i=0;i<160;i++)b.update(.025);
assert.equal(b.wave,31);assert.equal(b.phase,'wave');
writeFileSync(output,JSON.stringify({source:'d412048 / rules 17; earned mixed clear30, 200 steps then 160 steps',before,after:b.snapshot(),proof,
  offline:beginAbsence(createOfflineState(1000),1000,proof,false,WAREHOUSE_OFFLINE)},null,2)+'\n');
console.log('Captured real rule-17 in-flight W31 fixture and departure entitlement.');
