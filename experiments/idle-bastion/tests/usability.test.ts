import { legacyFixtures, restoreHistorical, assertHistoricalFields } from './legacy-fixtures';
import assert from 'node:assert/strict';
import test from 'node:test';
import { enemyFlip } from '../src/art';
import { BASE, FROST, IdleBattle } from '../src/battle';
import { cellCenter, createIdleLayout } from '../src/layout';
import { getForestBlockedCells } from '../src/forest-world';
import { assignMaraTarget, validMara } from '../src/mara';

test('side-facing Scorpion artwork follows travel; vertical and other sheets retain their orientation', () => {
  assert.equal(enemyFlip('Scorpion','side',false),true);
  assert.equal(enemyFlip('Scorpion','side',true),false);
  for (const kind of ['Leafbug','Firebug','Rosenspiegel'] as const) {
    assert.equal(enemyFlip(kind,'side',false),false);
    assert.equal(enemyFlip(kind,'side',true),true);
  }
  for (const direction of ['up','down'] as const) assert.equal(enemyFlip('Scorpion',direction,false),false);
});

test('each added Frost position shares at least 60 road pixels with two existing level-one damage positions', () => {
  const layout=createIdleLayout();
  for(const [added,neighbors] of [['tower-09',['tower-02','tower-03']],['tower-10',['tower-03','tower-06']],['tower-11',['tower-07','tower-08']]] as const) {
    const frost=cellCenter(layout,layout.towerPads.find(p=>p.id===added)!.cell);
    for(const id of neighbors) {
      const damage=cellCenter(layout,layout.towerPads.find(p=>p.id===id)!.cell);
      let shared=0;
      for(let i=1;i<layout.road.waypoints.length;i++) {
        const a=cellCenter(layout,layout.road.waypoints[i-1]),z=cellCenter(layout,layout.road.waypoints[i]);
        const length=Math.hypot(z.x-a.x,z.y-a.y);
        for(let d=2.5;d<length;d+=5){const x=a.x+(z.x-a.x)*d/length,y=a.y+(z.y-a.y)*d/length;
          if(Math.hypot(x-frost.x,y-frost.y)<=FROST.range && Math.hypot(x-damage.x,y-damage.y)<=BASE.tower.range)shared+=5;
        }
      }
      assert.ok(shared>=60,`${added} / ${id}: ${shared}px shared road`);
    }
  }
});

test('layout-one live save migrates combat intact and reroutes Mara away from a newly reserved pad without resetting cooldown',() => {
  const fixtures=legacyFixtures().critical,old=fixtures.layoutOne8;
  const expectedMara={...fixtures.layoutOne8ExpectedMara,autoCast:true,effectTowerUid:null};
  const restored=restoreHistorical(old,{mara:expectedMara,liveClearedWaves:[],farmWave:1});
  const modern=restored.snapshot();assert.equal(modern.layoutVersion,3);
  assert.equal(modern.mara.cooldownRemaining,7);
  assert.ok(validMara(modern.mara,restored.towers,restored.layout,getForestBlockedCells(restored.layout)));
  assert.notDeepEqual(modern.mara.path,old.mara.path);
  assert.deepEqual(modern.mara,expectedMara);
});

test('all eleven historical slots survive the free-grid migration without moving the original eight', () => {
  const b=IdleBattle.restore(legacyFixtures().critical.layoutOne8)!;assert.ok(b);b.highestCleared=10;b.gold=100000;
  for(const pad of b.layout.towerPads.filter(p=>p.id.startsWith('tower-')&&b.isPadUnlocked(p.id)&&!b.towers.some(t=>t.padId===p.id))) assert.ok(b.build(pad.id));
  assert.equal(b.towers.length,11);assert.deepEqual(IdleBattle.restore(b.snapshot())!.snapshot(),b.snapshot());
  for(const old of createIdleLayout({version:1}).towerPads) {
    const current=b.layout.towerPads.find(p=>p.id===old.id)!;assert.ok(current);
    assert.deepEqual(current,{...old,availability:old.availability==='east-clearing'?'east-clearing':'initial'});
  }
});
