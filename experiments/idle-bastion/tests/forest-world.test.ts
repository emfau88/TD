import assert from 'node:assert/strict';
import test from 'node:test';
import { createIdleLayout, findFootpath, getTowerApproachCells, cellsInRect } from '../src/layout';
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
  for (const pad of layout.towerPads.filter(pad => pad.cell.x < 28)) {
    assert.equal(blocked.has(key(pad.cell)), false);
    assert.ok(getTowerApproachCells(layout, pad.id).some(destination => findFootpath(layout, layout.maraStart, destination, world.blocked)), pad.id);
  }
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
