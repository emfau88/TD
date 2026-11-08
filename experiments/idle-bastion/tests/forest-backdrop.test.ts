import assert from 'node:assert/strict';
import test from 'node:test';
import { createIdleLayout } from '../src/layout';
import { getForestWorld } from '../src/forest-world';
import { BACKDROP_TREE, backdropTrees } from '../src/forest-backdrop';

test('full backdrop silhouettes never cover any non-tree map cell, including roads and construction ground', () => {
  for (const version of [1, 2, 3, 4, 5] as const) {
    const layout = createIdleLayout({ version }), world = getForestWorld(layout);
    const before = JSON.stringify({ layout, world });
    const solidTrees = new Set(world.trees.map(p => `${p.x},${p.y}`));
    const scenery = backdropTrees(layout, world.trees, 240, 320);
    for (const tree of scenery) {
      // Use rectangle intersection independently of the placement algorithm:
      // even transparent frame corners must not cross free map cells.
      for (let y = 0; y < layout.bounds.rows; y++) for (let x = 0; x < layout.bounds.columns; x++) {
        const overlaps = tree.x < (x + 1) * layout.cellSize && tree.x + BACKDROP_TREE.width > x * layout.cellSize
          && tree.y < (y + 1) * layout.cellSize && tree.y + BACKDROP_TREE.height > y * layout.cellSize;
        if (overlaps) assert.ok(solidTrees.has(`${x},${y}`), `v${version}: decoration covers free cell ${x},${y}`);
      }
    }
    assert.equal(JSON.stringify({ layout, world }), before, 'rendering must not mutate map or navigation');
    assert.ok(scenery.some(p => p.y < 0) && scenery.some(p => p.y >= layout.bounds.height));
    assert.ok(scenery.some(p => p.x < 0) && scenery.some(p => p.x >= layout.bounds.width));
  }
});

test('resizing extends stable scenery without moving existing trees or introducing random variants', () => {
  const layout = createIdleLayout({ version: 5 }), world = getForestWorld(layout);
  const small = backdropTrees(layout, world.trees, 40, 80);
  assert.deepEqual(backdropTrees(layout, world.trees, 40, 80), small);
  const large = backdropTrees(layout, world.trees, 240, 320);
  const positions = new Set(large.map(p => JSON.stringify(p)));
  assert.ok(small.every(p => positions.has(JSON.stringify(p))));
  assert.ok(large.length < 1500, 'desktop overscan stays bounded');
});
