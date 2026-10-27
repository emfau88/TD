import test, { type TestContext } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import ts from 'typescript';
import { tutorialDefenseFrame, tutorialDefenseZoom } from '../src/tutorial-camera';

const spawn = Object.freeze({ x: 20, y: 220 });
const warden = Object.freeze({ x: 420, y: 220 });
const frost = Object.freeze({ x: 340, y: 220 });
const near = (actual: number, expected: number) => assert.ok(Math.abs(actual - expected) < 1e-9, `${actual} differs from ${expected}`);

test('Variant B portrait framing includes the entrance and both complete tower bodies', () => {
  const frame = tutorialDefenseFrame(spawn, warden, frost);
  const zoom = tutorialDefenseZoom(1.03, 390, 658, frame);
  assert.equal(frame.width, 480); assert.equal(frame.x, 220);
  for (const tower of [warden, frost]) {
    assert.ok((tower.x - 35 - frame.left) * zoom >= 0);
    assert.ok((tower.x + 35 - frame.left) * zoom <= 390);
    assert.ok(tower.y - 100 >= frame.top); assert.ok(tower.y + 45 <= frame.bottom);
  }
  assert.ok((spawn.x - 30 - frame.left) * zoom >= 0, 'spawned enemies have visible room before the road');
  assert.ok((spawn.x + 30 - frame.left) * zoom < 390);
  near(zoom, 0.8125);
});

test('legacy saved tower coordinates determine the frame without shifting actors to Variant B', () => {
  const oldWarden = Object.freeze({ x: 260, y: 260 });
  const oldFrost = Object.freeze({ x: 180, y: 260 });
  const frame = tutorialDefenseFrame(spawn, oldWarden, oldFrost);
  assert.equal(frame.right, 300); assert.equal(frame.x, 140);
  assert.equal(frame.bottom, 310); assert.equal(frame.width, 320);
  assert.notEqual(frame.x, tutorialDefenseFrame(spawn, warden, frost).x);
  assert.deepEqual(oldWarden, { x: 260, y: 260 });
  assert.deepEqual(oldFrost, { x: 180, y: 260 });
  assert.equal(tutorialDefenseZoom(1, 390, 658, frame), 1, 'the smaller saved defense keeps its normal scale');
});

test('an actual Frost tower on another allowed row expands the frame instead of using a fixed position', () => {
  const withoutFrost = tutorialDefenseFrame(spawn, warden);
  const alternateFrost = Object.freeze({ x: 380, y: 300 });
  const frame = tutorialDefenseFrame(spawn, warden, alternateFrost);
  assert.ok(frame.bottom >= alternateFrost.y + 50);
  assert.ok(frame.height > withoutFrost.height);
  assert.ok(frame.top <= warden.y - 110);
  assert.equal(frame.right, withoutFrost.right);
});

test('pixel densities one and two preserve identical CSS framing and sprite scale', () => {
  const frame = tutorialDefenseFrame(spawn, warden, frost);
  const positions: number[][] = [];
  for (const density of [1, 2]) {
    const zoom = tutorialDefenseZoom(1.03 * density, 390 * density, 658 * density, frame);
    near(zoom / density, 0.8125);
    positions.push([spawn, frost, warden].map(point => (point.x - frame.left) * zoom / density));
    near(40 * zoom / density, 32.5);
  }
  assert.deepEqual(positions[0], positions[1]);
});

test('guided framing may zoom out to fit either axis but never zooms in beyond the normal view', () => {
  const frame = tutorialDefenseFrame(spawn, warden, frost);
  assert.equal(tutorialDefenseZoom(0.6, 390, 658, frame), 0.6);
  const desktopZoom = 1280 / 1120;
  assert.equal(tutorialDefenseZoom(desktopZoom, 1280, 800, frame), desktopZoom);
  const shortViewportZoom = tutorialDefenseZoom(1, 390, 80, frame);
  near(shortViewportZoom, 0.5);
  assert.ok(frame.width * shortViewportZoom <= 390);
  assert.ok(frame.height * shortViewportZoom <= 80);
});

// Exercise real scene methods without booting Phaser's renderer, as in the
// existing check-tutorial-input harness. The camera mock records only geometry.
function cameraScene(t: TestContext) {
  const globals = new Map(['window', 'document'].map(key => [key, Object.getOwnPropertyDescriptor(globalThis, key)]));
  Object.defineProperty(globalThis, 'window', { configurable: true, value: { innerWidth: 390, innerHeight: 844 } });
  Object.defineProperty(globalThis, 'document', { configurable: true, value: { querySelector: () => undefined } });
  t.after(() => { for (const [key, descriptor] of globals) if (descriptor) Object.defineProperty(globalThis, key, descriptor); else Reflect.deleteProperty(globalThis, key); });
  const source = readFileSync(new URL('../src/battle-scene.ts', import.meta.url), 'utf8');
  const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true } }).outputText;
  const exports: Record<string, any> = {};
  new Function('require', 'exports', code)((name: string) => name === 'phaser' ? { Scene: class {}, Math: { Clamp: (value: number, min: number, max: number) => Math.max(min, Math.min(max, value)) } }
    : name === './tutorial-camera' ? { tutorialDefenseFrame, tutorialDefenseZoom }
      : name === './layout' ? { cellCenter: (_layout: unknown, cell: { x: number; y: number }) => ({ x: (cell.x + 0.5) * 40, y: (cell.y + 0.5) * 40 }) } : {}, exports);
  const model: any = { preparing: true, guiding: false, recommendedStarterPad: 'recommended', towers: [],
    layout: { bounds: { width: 1600, height: 640 }, road: { waypoints: [{ x: 0, y: 5 }] },
      towerPads: [{ id: 'recommended', cell: { x: 10, y: 5 } }, { id: 'alternate', cell: { x: 11, y: 6 } }] } };
  const scene = new exports.BattleScene(() => model, { changed() {} });
  const camera: any = { width: 390, height: 658, zoom: 1, x: 0, y: 0, scrollX: 0, scrollY: 0, midPoint: { x: 280, y: 320 },
    get displayWidth() { return this.width / this.zoom; }, get displayHeight() { return this.height / this.zoom; },
    setViewport(x: number, y: number, width: number, height: number) { Object.assign(this, { x, y, width, height }); },
    setZoom(zoom: number) { this.zoom = zoom; }, setBounds() {}, clampX(value: number) { return value; }, clampY(value: number) { return value; },
    centerOn(x: number, y: number) { this.midPoint = { x, y }; this.scrollX = x - this.displayWidth / 2; this.scrollY = y - this.displayHeight / 2; },
    setScroll(x: number, y: number) { this.scrollX = x; this.scrollY = y; this.midPoint = { x: x + this.displayWidth / 2, y: y + this.displayHeight / 2 }; } };
  scene.cameras = { main: camera }; scene.scale = { width: 390, height: 658 };
  scene.game = { canvas: { getBoundingClientRect: () => ({ top: 0, bottom: 658 }) } }; scene.readyToDraw = true;
  for (const method of ['syncLayout', 'refreshLabels', 'drawSelection', 'drawActors']) scene[method] = () => {};
  return { scene, model, camera };
}

test('scene retains an explicit construction candidate when resizing and rotating into portrait', t => {
  const { scene, camera } = cameraScene(t);
  scene.focusGuidedDefense('alternate');
  near(camera.zoom, 390 / 520); near(camera.midPoint.x, 240);
  scene.resizeCamera(); near(camera.zoom, 390 / 520);
  scene.portraitCamera = false; camera.midPoint = { x: 900, y: 400 };
  scene.resizeCamera(); near(camera.midPoint.x, 240);
  assert.ok(camera.scrollX <= 20 && camera.scrollX + camera.displayWidth >= 500);
});

test('player pan survives tutorial completion and ordinary same-orientation resize', t => {
  const { scene, model, camera } = cameraScene(t);
  model.towers = [{ ...warden, protected: true, def: { id: 1 } }, { ...frost, def: { id: 2 } }];
  scene.focusGuidedDefense();
  scene.panAtPointer({ x: 30, y: 60, prevPosition: { x: 90, y: 60 }, middleButtonDown: () => true, leftButtonDown: () => false });
  const panned = { ...camera.midPoint }, zoom = camera.zoom;
  assert.notEqual(panned.x, 220);
  model.preparing = false; model.guiding = false;
  scene.refresh(); scene.resizeCamera();
  near(camera.zoom, zoom); assert.deepEqual(camera.midPoint, panned);
});

test('deliberate map focus and zoom leave tutorial framing and restore normal scale', t => {
  const { scene, camera } = cameraScene(t);
  scene.focusGuidedDefense(); const wideZoom = camera.zoom;
  scene.focusPoint({ x: 1340, y: 400 });
  assert.equal(scene.guidedDefenseFrame, false); near(camera.midPoint.x, 1340);
  near(camera.zoom, 658 / 640); assert.ok(camera.zoom > wideZoom);
  scene.focusGuidedDefense(); scene.setMapZoom(1.15);
  assert.equal(scene.guidedDefenseFrame, false); near(camera.zoom, 658 / 640 * 1.15);
});

test('tutorial and overview camera viewports end at the real map on desktop and portrait', t => {
  const { scene, camera, model } = cameraScene(t);
  camera.setBounds = (x: number, y: number, width: number, height: number) => { camera.bounds = { x, y, width, height }; };
  for (const [width, height] of [[390, 900], [320, 700], [1440, 900], [2560, 1080]]) {
    Object.assign(globalThis.window, { innerWidth: width, innerHeight: height });
    scene.scale = { width, height };
    scene.game.canvas.getBoundingClientRect = () => ({ top: 0, bottom: height });
    for (const overview of [false, true]) {
      scene.overview = overview; scene.guidedDefenseFrame = !overview;
      scene.resizeCamera();
      assert.deepEqual(camera.bounds, { x: 0, y: 0, ...model.layout.bounds });
      assert.ok(camera.displayWidth <= model.layout.bounds.width);
      assert.ok(camera.displayHeight <= model.layout.bounds.height);
      assert.ok(camera.x >= 0 && camera.y >= 0);
      assert.ok(camera.x + camera.width <= width && camera.y + camera.height <= height);
      if (overview) {
        assert.ok(Math.abs(camera.width - model.layout.bounds.width * camera.zoom) < 1);
        assert.ok(Math.abs(camera.height - model.layout.bounds.height * camera.zoom) < 1);
      }
    }
  }
});

test('zooming out and back uses the full available viewport without accumulating an outside margin', t => {
  const { scene, camera } = cameraScene(t);
  scene.focusGuidedDefense();
  scene.setMapZoom(1);
  const normal = { x: camera.x, y: camera.y, width: camera.width, height: camera.height };
  for (let i = 0; i < 3; i++) { scene.setMapZoom(1.15); scene.setMapZoom(1); }
  assert.deepEqual({ x: camera.x, y: camera.y, width: camera.width, height: camera.height }, normal);
  assert.equal(scene.mapViewport.width, 390); assert.equal(scene.mapViewport.height, 658);
});
