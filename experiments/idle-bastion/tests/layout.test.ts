import assert from 'node:assert/strict';
import test from 'node:test';
import {
  canPlaceFootprint, cellCenter, cellsInRect, createIdleLayout, findFootpath,
  getTowerApproachCells, isCellInBounds, isUnlockedCell, isWalkableCell, pathCells,
  rectContains, validateLayout, type GridCell,
} from '../src/layout';

const key = (position: GridCell): string => `${position.x},${position.y}`;

test('start fixture has unique reservations, correct budget and an in-bounds road ending at the core', () => {
  const layout = createIdleLayout();
  assert.deepEqual(validateLayout(layout), []);
  assert.deepEqual(layout.bounds, { columns: 28, rows: 16, width: 1120, height: 640 });
  assert.deepEqual(layout.maxBounds, { columns: 36, rows: 16, width: 1440, height: 640 });
  assert.equal(layout.cellSize, 40);
  assert.equal(layout.road.cells[0].x, 0);
  assert.deepEqual(layout.road.cells.at(-1), layout.core);
  assert.equal(new Set(layout.road.cells.map(key)).size, layout.road.cells.length);
  for (let i = 1; i < layout.road.cells.length; i++) {
    const previous = layout.road.cells[i - 1], current = layout.road.cells[i];
    assert.equal(Math.abs(current.x - previous.x) + Math.abs(current.y - previous.y), 1);
  }
  assert.equal(createIdleLayout({version:2}).towerPads.length, 13, 'historical fixed-pad map');
  assert.equal(layout.towerPads.length, 214);
  assert.equal(layout.towerPads.filter(pad => pad.cell.x < 28).length, 203);
  assert.equal(layout.towerPads.filter(pad => pad.availability === 'initial').length, 203);
  assert.equal(layout.towerPads.filter(pad => pad.isStarter).length, 1);
  assert.equal(new Set(layout.towerPads.map(pad => key(pad.cell))).size, 214);
  const road = new Set(layout.road.cells.map(key));
  for (const plot of layout.plots) {
    for (const position of cellsInRect(plot.footprint)) {
      assert.ok(isCellInBounds(position, layout.startBounds));
      assert.ok(!road.has(key(position)));
      assert.ok(!layout.towerPads.some(pad => key(pad.cell) === key(position)));
    }
  }
});

test('critical first-view positions and all initial pads fit inside the unscrolled start region', () => {
  const layout = createIdleLayout();
  const critical = [
    layout.core, layout.previewEnemy, layout.maraStart,
    ...layout.towerPads.filter(pad => pad.availability === 'initial').map(pad => pad.cell),
    ...cellsInRect(layout.plots.find(plot => plot.id === 'workshop')!.footprint),
  ];
  for (const position of critical) {
    const center = cellCenter(layout, position);
    assert.ok(isCellInBounds(position, layout.startBounds));
    assert.ok(center.x >= 0 && center.x < 1120 && center.y >= 0 && center.y < 640);
  }
  assert.deepEqual(cellCenter(layout, { x: 0, y: 0 }), { x: 20, y: 20 });
});

test('building bodies block navigation while their courtyard remains reachable and reserved for building', () => {
  const layout = createIdleLayout();
  const workshop = layout.plots.find(plot => plot.id === 'workshop')!;
  const warehouse = layout.plots.find(plot => plot.id === 'warehouse')!;
  assert.equal(cellsInRect(workshop.footprint).length, 6);
  assert.equal(cellsInRect(warehouse.footprint).length, 4);
  for (const plot of layout.plots) {
    for (const position of cellsInRect(plot.blockingBody)) assert.equal(isWalkableCell(layout, position), false);
    for (const position of cellsInRect(plot.courtyard)) {
      assert.equal(isWalkableCell(layout, position), true);
      assert.ok(findFootpath(layout, layout.maraStart, position));
    }
    assert.equal(canPlaceFootprint(layout, plot.footprint), false);
    assert.equal(canPlaceFootprint(layout, plot.footprint, { reservationId: plot.id }), true);
    assert.ok(rectContains(plot.courtyard, plot.entrance));
  }
  for (const position of layout.footpaths) assert.equal(isWalkableCell(layout, position), true);
});

test('Mara has continuous legal footpaths to all active tower approaches and the workshop', () => {
  const layout = createIdleLayout();
  for (const pad of layout.towerPads.filter(pad => pad.availability === 'initial')) {
    const approach = getTowerApproachCells(layout, pad.id)[0];
    const path = findFootpath(layout, layout.maraStart, approach);
    assert.ok(path);
    assert.deepEqual(path[0], layout.maraStart);
    assert.deepEqual(path.at(-1), approach);
    for (let i = 0; i < path.length; i++) {
      assert.equal(isWalkableCell(layout, path[i]), true);
      if (i > 0) assert.equal(Math.abs(path[i].x - path[i - 1].x) + Math.abs(path[i].y - path[i - 1].y), 1);
    }
  }
  assert.equal(findFootpath(layout, layout.maraStart, layout.core), undefined);
  const neighbours = [{ x: 6, y: 7 }, { x: 4, y: 7 }, { x: 5, y: 8 }];
  // Empty free-grid candidates are walkable. Only an actually built tower blocks this exit.
  assert.ok(findFootpath(layout, layout.maraStart, { x: 4, y: 12 }, neighbours));
  neighbours.push({x:5,y:6});
  assert.equal(findFootpath(layout, layout.maraStart, { x: 4, y: 12 }, neighbours), undefined);
});

test('unopened east cells reject walking and construction; expansion changes bounds but never routes enemies', () => {
  const start = createIdleLayout(), expanded = createIdleLayout({ unlockedColumns: 36 });
  assert.deepEqual(validateLayout(expanded), []);
  assert.deepEqual(start.road, expanded.road);
  assert.deepEqual(start.core, expanded.core);
  for (const pad of start.towerPads.filter(pad => pad.availability === 'east-clearing')) {
    assert.ok(pad.cell.x >= 28 && pad.cell.x <= 30);
    assert.equal(isUnlockedCell(start, pad.cell), false);
    assert.equal(getTowerApproachCells(start, pad.id).length, 0);
    assert.equal(canPlaceFootprint(start, { ...pad.cell, width: 1, height: 1 }, { reservationId: pad.id }), false);
    assert.equal(canPlaceFootprint(expanded, { ...pad.cell, width: 1, height: 1 }, { reservationId: pad.id }), true);
    const approaches = getTowerApproachCells(expanded, pad.id);
    assert.ok(approaches.some(position => findFootpath(expanded, expanded.maraStart, position)));
    const position = cellCenter(expanded, pad.cell);
    const reachableRoad = expanded.road.cells.filter(roadCell => {
      const target = cellCenter(expanded, roadCell);
      return Math.hypot(position.x - target.x, position.y - target.y) <= 126;
    });
    assert.ok(reachableRoad.length > 0, `${pad.id} must reach the existing road at the shortest base range.`);
    assert.ok(reachableRoad.some(roadCell => roadCell.x >= 25));
  }
  assert.equal(isWalkableCell(start, { x: 29, y: 8 }), false);
  assert.equal(isWalkableCell(expanded, { x: 29, y: 8 }), true);
  assert.equal(findFootpath(start, start.maraStart, { x: 29, y: 8 }), undefined);
});

test('placement rejects roads, reserved pads, bad footprints and map borders', () => {
  const layout = createIdleLayout();
  assert.equal(canPlaceFootprint(layout, { x: 0, y: 5, width: 1, height: 1 }), false);
  assert.equal(canPlaceFootprint(layout, { x: 5, y: 6, width: 1, height: 1 }), false);
  assert.equal(canPlaceFootprint(layout, { x: 5, y: 6, width: 1, height: 1 }, { reservationId: 'tower-start' }), true);
  for (const area of [
    { x: -1, y: 0, width: 1, height: 1 }, { x: 27, y: 0, width: 2, height: 1 },
    { x: 1.5, y: 0, width: 1, height: 1 }, { x: 1, y: 1, width: 0, height: 1 },
    { x: 1, y: 1, width: 1, height: Number.NaN },
  ]) assert.equal(canPlaceFootprint(layout, area), false);
  assert.equal(isCellInBounds({ x: 0.5, y: 0 }, layout.bounds), false);
  assert.equal(canPlaceFootprint(layout, { x: 1, y: 1, width: 1, height: 1 }), true);
});

test('layout instances own immutable geometry and independent bounds', () => {
  const start = createIdleLayout(), expanded = createIdleLayout({ unlockedColumns: 36 });
  assert.notEqual(start.bounds, expanded.bounds);
  assert.notEqual(start.towerPads, expanded.towerPads);
  assert.notEqual(start.road.cells, expanded.road.cells);
  assert.notEqual(start.plots[0].footprint, expanded.plots[0].footprint);
  assert.ok(Object.isFrozen(start.bounds));
  assert.ok(Object.isFrozen(start.towerPads[0].cell));
  assert.throws(() => Object.assign(start.bounds, { columns: 36 }), TypeError);
  assert.equal(start.bounds.columns, 28);
  assert.equal(expanded.bounds.columns, 36);
  for (const unlockedColumns of [27, 37, 28.5, Number.NaN]) {
    assert.throws(() => createIdleLayout({ unlockedColumns }));
  }
});

test('orthogonal road rasterization rejects diagonals and does not duplicate corners', () => {
  assert.deepEqual(pathCells([{ x: 0, y: 0 }, { x: 2, y: 0 }, { x: 2, y: 1 }]), [
    { x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }, { x: 2, y: 1 },
  ]);
  assert.throws(() => pathCells([{ x: 0, y: 0 }, { x: 1, y: 1 }]));
  assert.throws(() => pathCells([{ x: 0.5, y: 0 }]));
});
