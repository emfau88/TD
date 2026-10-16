import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { runInContext } from 'node:vm';
import { build } from 'esbuild';
import { JSDOM } from 'jsdom';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const existingGameSave = JSON.stringify({ marker: 'M0-existing-game-must-remain-unchanged', stars: [1, 2, 3] });
const manifest = JSON.parse(await readFile(resolve(root, 'public/assets/manifest.json'), 'utf8'));
const compiled = await build({
  entryPoints: [resolve(root, 'src/main.ts')],
  bundle: true, write: false, format: 'esm', target: 'es2022', loader: { '.css': 'empty' },
  plugins: [{
    name: 'ui-contract-scene',
    setup(builder) {
      builder.onResolve({ filter: /^phaser$/ }, () => ({ path: 'phaser', namespace: 'ui-double' }));
      builder.onResolve({ filter: /^\.\/scene$/ }, () => ({ path: 'scene', namespace: 'ui-double' }));
      builder.onLoad({ filter: /.*/, namespace: 'ui-double' }, args => ({
        resolveDir: resolve(root, 'src'),
        contents: args.path === 'phaser' ? `
          export default {
            AUTO: 0, Scale: { FIT: 0, CENTER_BOTH: 0 },
            Game: class {
              constructor(configuration) {
                queueMicrotask(() => {
                  const scene = configuration.scene[0];
                  scene.loadMap(0);
                  scene.hooks.ready();
                });
              }
            }
          };` : `
          import { Simulation } from './simulation';
          export class ForestScene {
            paused = false; speed = 1; menu = true;
            constructor(assets, hooks) { this.assets = assets; this.hooks = hooks; window.testScene = this; }
            loadMap(id) { this.sim = new Simulation(id); this.paused = false; this.speed = 1; this.selected = undefined; this.buildId = undefined; this.hooks.select(); this.hooks.changed(); }
            chooseBuild(id) { this.buildId = id; this.selected = undefined; this.hooks.select(); }
            cancelBuild() { this.buildId = undefined; this.hooks.select(); }
            clearSelection() { this.selected = undefined; this.cancelBuild(); }
            drawRange() {}
            handleEvents() { for (const event of this.sim.drainEvents()) this.hooks.event(event); }
            selectTower(tower) { this.selected = tower.uid; this.buildId = undefined; this.hooks.select(tower); }
            place(id, col, row) { const tower = this.sim.build(id, col, row); this.handleEvents(); this.hooks.changed(); return tower; }
            advance(seconds) { this.sim.update(seconds); this.handleEvents(); this.hooks.changed(); }
          }`,
      }));
    },
  }],
});

async function setup(saved = null) {
  const dom = new JSDOM('<!doctype html><html><body><div id="app"></div></body></html>', {
    url: 'https://spire.test/', runScripts: 'outside-only', pretendToBeVisual: true,
  });
  const { window } = dom;
  window.localStorage.setItem('spire-save', existingGameSave);
  if (saved !== null) window.localStorage.setItem('spire-reference-save-v1', JSON.stringify(saved));
  window.__SPIRE_BUNDLE__ = { manifest, images: Object.fromEntries(Object.keys(manifest).map(name => [name, 'data:image/png;base64,AA=='])) };
  let clock = 0, nextTimer = 1;
  const timers = new Map();
  window.setTimeout = (callback, delay = 0) => { const id = nextTimer++; timers.set(id, { callback, at: clock + delay }); return id; };
  window.clearTimeout = id => timers.delete(id);
  window.Image = class { async decode() {} };
  window.HTMLCanvasElement.prototype.getContext = () => ({ drawImage() {} });
  window.HTMLCanvasElement.prototype.toDataURL = () => 'data:image/png;base64,AA==';
  await runInContext(`(async () => { ${compiled.outputFiles[0].text}\n })()`, dom.getInternalVMContext());
  await new Promise(setImmediate);
  const query = selector => { const element = window.document.querySelector(selector); assert.ok(element, `Missing UI: ${selector}`); return element; };
  const click = selector => query(selector).click();
  const advanceClock = milliseconds => {
    clock += milliseconds;
    const due = [...timers.entries()].filter(([, timer]) => timer.at <= clock);
    for (const [id, timer] of due) { if (timers.delete(id)) timer.callback(); }
  };
  return { dom, window, query, click, advanceClock, scene: window.testScene };
}

let checks = 0;
const record = message => { checks++; console.log(`PASS ${message}`); };

const game = await setup();
assert.equal(game.window.document.querySelector('#loading'), null);
assert.equal(game.window.document.querySelectorAll('[data-map]').length, 3);
record('Loading finishes and all three maps appear');

game.click('#begin-button');
assert.ok(game.query('.help-modal'));
assert.equal(game.scene.paused, true);
game.click('#help-close');
assert.equal(game.scene.paused, false);
assert.equal(game.query('#modal-layer').hidden, true);
assert.equal(JSON.parse(game.window.localStorage.getItem('spire-reference-save-v1')).tutorial, true);
record('First-run tutorial pauses, closes, and persists');

game.click('[data-tower="1"]');
assert.equal(game.scene.buildId, 1);
assert.ok(game.query('#detail-panel').textContent.includes('Waldwächter'));
const tower = game.scene.place(1, 3, 6);
assert.ok(tower);
assert.equal(game.query('#gold').textContent, '275');
game.scene.selectTower(tower);
game.click('#upgrade-button');
assert.equal(tower.level, 2);
assert.equal(game.query('#gold').textContent, '211');
game.query('#priority').value = 'strong';
game.query('#priority').dispatchEvent(new game.window.Event('change'));
assert.equal(tower.priority, 'strong');
record('Build, gold, upgrades, and target priority update');

game.click('#menu-button');
assert.ok(game.query('#continue-button'));
game.click('#continue-button');
assert.equal(game.scene.sim.towers.length, 1);
assert.equal(game.scene.menu, false);
game.scene.selectTower(tower);
game.click('#sell-button');
assert.equal(game.scene.sim.towers.length, 0);
assert.equal(game.query('#gold').textContent, '308');
record('Build-phase menu preserves placed towers; selling refunds gold');

game.click('#help-button');
assert.equal(game.scene.paused, true);
game.click('#help-close');
game.click('#start-wave');
assert.equal(game.scene.sim.wave, 1);
assert.equal(game.scene.sim.phase, 'wave');
assert.equal(game.query('#start-wave').disabled, true);
game.click('#speed-button');
assert.equal(game.scene.speed, 2);
game.click('#pause-button');
assert.equal(game.scene.paused, true);
assert.equal(game.query('#pause-overlay').hidden, false);
game.click('#resume-button');
assert.equal(game.scene.paused, false);
record('Wave start, pause/resume, help, and 2x controls work');

game.click('#menu-button');
game.click('[data-map="2"]');
game.click('#begin-button');
assert.equal(game.scene.sim.map.id, 2);
assert.equal(game.scene.sim.wave, 0);
assert.equal(game.scene.sim.towers.length, 0);
assert.equal(game.query('#gold').textContent, '440');
assert.equal(game.query('#map-title').textContent, 'Die letzte Lichtung');
record('Map restart resets simulation and UI');

game.scene.sim.phase = 'victory';
game.scene.sim.wave = 20;
game.scene.sim.kills = 376;
game.scene.sim.events.push({ type: 'victory' });
game.scene.handleEvents();
game.advanceClock(500);
assert.ok(game.query('.result-modal'));
assert.ok(game.query('.result-stars').textContent.includes('★★★'));
assert.equal(JSON.parse(game.window.localStorage.getItem('spire-reference-save-v1')).stars[2], 3);
game.click('#result-play');
assert.equal(game.scene.sim.map.id, 2);
assert.equal(game.scene.sim.phase, 'build');
record('Victory, stars, progress storage, and replay work');

game.scene.sim.phase = 'defeat';
game.scene.sim.wave = 4;
game.scene.sim.lives = 0;
game.scene.sim.events.push({ type: 'defeat' });
game.scene.handleEvents();
game.click('#menu-button');
game.advanceClock(500);
assert.ok(game.query('.menu-modal'));
assert.equal(game.window.document.querySelector('.result-modal'), null);
record('Menu cancels delayed result dialog');
assert.equal(game.window.localStorage.getItem('spire-save'), existingGameSave);
const persistedReferenceSave = JSON.parse(game.window.localStorage.getItem('spire-reference-save-v1'));
record('Reference gameplay leaves the existing game save unchanged');
game.dom.window.close();

const reloaded = await setup(persistedReferenceSave);
assert.equal(reloaded.query('[data-map="2"] .map-stars').textContent, '★★★');
reloaded.click('#begin-button');
assert.equal(reloaded.query('#modal-layer').hidden, true);
assert.equal(reloaded.window.localStorage.getItem('spire-save'), existingGameSave);
record('Stored stars and tutorial preference survive a fresh application load');
reloaded.dom.window.close();

const corrupted = await setup({ stars: [-1, 'broken', 100], best: [4.5, null, 200], volume: 'bad', tutorial: true });
assert.equal(corrupted.window.document.querySelectorAll('[data-map]').length, 3);
assert.equal(corrupted.query('[data-map="2"] .map-stars').textContent, '★★★');
corrupted.click('#begin-button');
assert.equal(corrupted.query('#modal-layer').hidden, true);
record('Malformed stored scores do not break the menu');
corrupted.dom.window.close();

console.log(`${checks} UI contract checks passed (DOM and controls; no graphical browser rendering).`);
