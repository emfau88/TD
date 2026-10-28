import { assignMaraTarget, createMara, MARA } from '../src/mara';
import { IdleBattle } from '../src/battle';
import assert from 'node:assert/strict';
import test from 'node:test';
import { createIdleLayout, findFootpath, getTowerApproachCells, cellsInRect, cellCenter } from '../src/layout';
import { getForestWorld } from '../src/forest-world';
const key = (point: {x:number;y:number}) => `${point.x},${point.y}`;

test('solid forest leaves the route, plots, every start pad and its approach accessible', () => {
  const layout = createIdleLayout(), world = getForestWorld(layout);
  const blocked = new Set(world.blocked.map(key));
  assert.equal(blocked.size, world.blocked.length);
  assert.ok(world.trees.length > 70);
  assert.equal(world.water.length, 9);
  for (const point of [...layout.road.cells, layout.core, layout.maraStart, ...layout.plots.flatMap(plot => cellsInRect(plot.footprint))]) {
    assert.equal(blocked.has(key(point)), false, `reserved ground ${key(point)}`);
  }
  const b = new IdleBattle(layout); b.gold = 100000;
  let excluded = 0, reachable = 0;
  for (const pad of layout.towerPads.filter(pad => pad.cell.x < 28)) {
    if (blocked.has(key(pad.cell))) {
      assert.equal(b.canBuild(pad.id), false, 'solid forest excludes candidate ' + pad.id); excluded++; continue;
    }
    reachable++;
    if (pad.id.startsWith('tower-')) assert.ok(getTowerApproachCells(layout, pad.id).some(destination => findFootpath(layout, layout.maraStart, destination, world.blocked)), pad.id);
    // Free-grid towers need a reachable spell position, not physical adjacency.
    const mara=createMara(layout,1), target={uid:2,padId:pad.id,...cellCenter(layout,pad.cell)};
    assignMaraTarget(mara,target,layout,[...world.blocked,pad.cell]);
    assert.equal(mara.unreachable,false,pad.id);
    const end=mara.path.at(-1)??mara;assert.ok(Math.hypot(end.x-target.x,end.y-target.y)<=MARA.range,pad.id);
  }
  assert.ok(excluded > 0 && reachable > 100, 'both excluded terrain and free grid are exercised');
  for (const plot of layout.plots) assert.ok(findFootpath(layout, layout.maraStart, plot.entrance, world.blocked), plot.id);
});

test('rendering and routing share deterministic immutable forest without opening eastern terrain', () => {
  const a = createIdleLayout(), b = createIdleLayout();
  const world = getForestWorld(a);
  assert.equal(getForestWorld(a), world);
  assert.deepEqual(getForestWorld(b), world);
  assert.ok(Object.isFrozen(world) && Object.isFrozen(world.blocked) && world.blocked.every(Object.isFrozen));
  assert.ok(world.blocked.every(point => point.x < 28 && point.y < 16));
  for (const point of world.flowers) assert.ok(!world.blocked.some(solid => key(solid) === key(point)));
});
