import { pathToFileURL } from 'node:url';
import { CELL, COLS, ROWS, MAPS, TOWERS, center, pathCells, pathPoints, type Point, type TowerDef } from '../src/data';
import { Simulation, stats, upgradeCost, type Tower } from '../src/simulation';

type RouteSample = Point & { flying: boolean };
export type CampaignResult = {
  map: string; phase: string; wave: number; lives: number; kills: number;
  towers: number; towerTypes: number[]; gold: number; seconds: number;
};

function routeSamples(sim: Simulation): RouteSample[] {
  const samples: RouteSample[] = [];
  for (const [routeIndex, nodes] of [...sim.map.paths, sim.map.air].entries()) {
    const path = pathPoints(nodes);
    for (let segment = 1; segment < path.length; segment++) {
      const start = path[segment - 1];
      const end = path[segment];
      const length = Math.hypot(end.x - start.x, end.y - start.y);
      const count = Math.ceil(length / 20);
      for (let sample = 0; sample < count; sample++) {
        const fraction = sample / count;
        samples.push({ x: start.x + (end.x - start.x) * fraction, y: start.y + (end.y - start.y) * fraction, flying: routeIndex === sim.map.paths.length });
      }
    }
  }
  return samples;
}

function coverageScore(point: Point, definition: TowerDef, range: number, samples: RouteSample[], existing: Tower[], wave: number): number {
  let score = 0;
  for (const sample of samples) {
    if ((sample.flying && definition.targets === 'ground') || Math.hypot(point.x - sample.x, point.y - sample.y) > range) continue;
    const defenders = existing.filter(tower => (!sample.flying || tower.def.targets === 'all') && Math.hypot(tower.x - sample.x, tower.y - sample.y) <= stats(tower).range).length;
    const weight = sample.flying ? (wave < 4 ? .2 : 2.3) : 1 / Math.sqrt(existing.length + 1);
    score += weight / (1 + defenders * .4);
  }
  return score;
}

function bestCell(sim: Simulation, definition: TowerDef, samples: RouteSample[]) {
  const paths = new Set(sim.map.paths.flatMap(nodes => [...pathCells(nodes)]));
  let best: { col: number; row: number; score: number } | undefined;
  for (let row = 1; row < ROWS - 1; row++) for (let col = 1; col < COLS - 1; col++) {
    if (!sim.canBuild(col, row)) continue;
    const adjacent = [[col - 1, row], [col + 1, row], [col, row - 1], [col, row + 1]].some(([nearCol, nearRow]) => paths.has(`${nearCol},${nearRow}`));
    if (!adjacent) continue;
    const point = center([col, row]);
    if (sim.towers.some(tower => Math.hypot(tower.x - point.x, tower.y - point.y) < CELL * 1.5)) continue;
    const score = coverageScore(point, definition, definition.range, samples, sim.towers, sim.wave);
    if (!best || score > best.score) best = { col, row, score };
  }
  return best;
}

function invest(sim: Simulation, samples: RouteSample[]) {
  const order = [1, 1, 1, 2, 6, 4, 5, 3, 8, 7, 6, 4, 8, 5, 1, 6, 4, 8];
  let decisions = 0;
  while (decisions++ < 80) {
    const definitionId = order[Math.min(sim.towers.length, order.length - 1)];
    const wanted = TOWERS.find(tower => tower.id === definitionId);
    if (!wanted) throw new Error('Missing tower definition');
    const location = bestCell(sim, wanted, samples);
    const upgrade = sim.towers.filter(tower => tower.level < 3 && upgradeCost(tower) <= sim.gold)
      .sort((first, second) => {
        const value = (tower: Tower) => coverageScore(tower, tower.def, stats(tower).range, samples, [], sim.wave) * stats(tower).damage / stats(tower).cooldown / upgradeCost(tower);
        return value(second) - value(first);
      })[0];
    const preferUpgrade = sim.wave >= 4 && sim.towers.length >= Math.min(4 + Math.floor(sim.wave / 2), 13);
    if (upgrade && (preferUpgrade || !location || wanted.cost > sim.gold)) {
      sim.upgrade(upgrade.uid);
      continue;
    }
    if (location && wanted.cost <= sim.gold) {
      sim.build(wanted.id, location.col, location.row);
      continue;
    }
    break;
  }
}

export function runCampaign(mapId: number, sim: Simulation = new Simulation(mapId)): CampaignResult {
  const samples = routeSamples(sim);
  let elapsed = 0;
  while (sim.phase !== 'victory' && sim.phase !== 'defeat') {
    invest(sim, samples);
    if (!sim.startWave()) break;
    let waveSeconds = 0;
    while (sim.phase === 'wave' && waveSeconds < 180) {
      sim.update(.1);
      sim.drainEvents();
      waveSeconds += .1;
    }
    if (waveSeconds >= 180) throw new Error(`${sim.map.name}: Welle ${sim.wave} endet nicht.`);
    elapsed += waveSeconds;
  }
  return { map: sim.map.name, phase: sim.phase, wave: sim.wave, lives: sim.lives, kills: sim.kills, towers: sim.towers.length, towerTypes: [...new Set(sim.towers.map(tower => tower.def.id))].sort(), gold: sim.gold, seconds: Math.round(elapsed) };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const results = MAPS.map(map => runCampaign(map.id));
  console.table(results.map(result => ({ ...result, towerTypes: result.towerTypes.join(', ') })));
  if (results.some(result => result.phase !== 'victory')) process.exitCode = 1;
}
