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
  for (const kind of ['Leafbug','Firebug','Rosenspiegel']) {
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

test('layout-one live save migrates combat intact and reroutes Mara away from a newly reserved pad without resetting cooldown', () => {
  const oldLayout=createIdleLayout({version:1}), b=new IdleBattle(), tower=b.build('tower-03')!;
  b.update(4); const snapshot=b.snapshot();
  snapshot.mara={...snapshot.mara,...cellCenter(oldLayout,{x:11,y:4}),cooldownRemaining:7,effectRemaining:0};
  assignMaraTarget(snapshot.mara,tower,oldLayout,getForestBlockedCells(oldLayout));
  assert.ok(validMara(snapshot.mara,b.towers,oldLayout,getForestBlockedCells(oldLayout)));
  const old={...snapshot,schemaVersion:8,layoutVersion:1}, restored=IdleBattle.restore(old)!;
  assert.ok(restored);const modern=restored.snapshot();
  assert.equal(modern.layoutVersion,2);assert.equal(modern.mara.cooldownRemaining,7);
  assert.ok(validMara(modern.mara,restored.towers,restored.layout,getForestBlockedCells(restored.layout)));
  assert.notDeepEqual(modern.mara.path,snapshot.mara.path);
  assert.deepEqual({...modern,mara:snapshot.mara,schemaVersion:8,layoutVersion:1},old);
  assert.deepEqual(IdleBattle.restore(modern)!.snapshot(),modern);
});

test('all eleven unlocked slots can hold towers and round-trip without moving the original eight', () => {
  const b=new IdleBattle();b.update(4);b.highestCleared=10;b.gold=100000;
  for(const pad of b.layout.towerPads.filter(p=>b.isPadUnlocked(p.id)&&!p.isStarter)) assert.ok(b.build(pad.id));
  assert.equal(b.towers.length,11);assert.deepEqual(IdleBattle.restore(b.snapshot())!.snapshot(),b.snapshot());
  for(const old of createIdleLayout({version:1}).towerPads) assert.deepEqual(b.layout.towerPads.find(p=>p.id===old.id),old);
});
