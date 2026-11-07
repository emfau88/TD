import assert from 'node:assert/strict';
import test from 'node:test';
import { compileTavernSceneVideo, sceneVideoRole, type TavernSceneVideoConfig } from '../src/tavern-scene-video';
import type { TavernSceneId, SceneRole, SceneAction } from '../src/tavern-scene-catalog';

function fixture(id: TavernSceneId = 'mara-counter') {
  const basePose = `${id}:rest`, referenceId = `${id}:original`;
  const roles = ['idle', 'talk', 'hair', 'shoulder', 'hand', 'laugh', 'approach'] as const;
  const clips = Object.fromEntries(roles.map(role => [role, {
    file: `${id}/${role}.mp4`, startPose: basePose, endPose: basePose, referenceId,
  }])) as TavernSceneVideoConfig['scene']['clips'];
  const config: TavernSceneVideoConfig = {
    scene: { id, companion: id === 'mara-counter' ? 'mara' : 'ilyra', basePose, referenceId, clips },
    media: Object.fromEntries(Object.values(clips).map(clip => [clip.file, { fps: 24, frames: 90, duration: 3.75 }])),
    poster: `/assets/${id}/idle.webp`, background: `/assets/${id}/room.webp`,
    anchors: { hair: { x: 180, y: 150 }, shoulder: { x: 320, y: 240 }, hand: { x: 270, y: 450 } },
  };
  const urls = Object.fromEntries(Object.values(clips).map(clip => [clip.file, `/assets/${clip.file}`]));
  return { config, urls };
}

test('both complete scenes map existing actions only to local roles and metadata', () => {
  const actions: [SceneAction, SceneRole][] = [
    ['idle', 'idle'], ['talk', 'talk'], ['gift', 'talk'], ['hair', 'hair'],
    ['shoulder', 'shoulder'], ['hand', 'hand'], ['laugh', 'laugh'], ['compliment', 'approach'],
  ];
  for (const id of ['mara-counter', 'ilyra-window'] as const) {
    const { config, urls } = fixture(id), scene = compileTavernSceneVideo(config, urls)!;
    assert.ok(scene); assert.equal(scene.id, id);
    assert.deepEqual(scene.anchors, config.anchors);
    assert.equal(scene.poster, config.poster); assert.equal(scene.background, config.background);
    for (const [action, role] of actions) {
      assert.equal(sceneVideoRole(scene, action), role);
      const clip = scene.clips[role]!;
      assert.equal(clip.file, config.scene.clips[role]!.file);
      assert.equal(clip.url, urls[clip.file]);
      assert.equal(clip.frames / clip.fps, clip.duration);
      assert.ok(clip.file.startsWith(`${id}/`));
    }
    assert.equal(sceneVideoRole(scene, 'tease'), id === 'mara-counter' ? 'laugh' : undefined);
    for (const key of ['head', 'touch', 'joy', 'hip', 'variant', 'unknown']) {
      assert.equal(sceneVideoRole(scene, key as SceneAction), undefined, 'No implicit standard-role fallback.');
    }
  }
});

test('every advertised file or metadata record is required; optional gestures may be omitted', () => {
  for (const missing of ['idle', 'talk', 'hair', 'shoulder', 'hand', 'laugh', 'approach'] as const) {
    const { config, urls } = fixture();
    const absentFile = { ...urls }; delete absentFile[config.scene.clips[missing]!.file];
    absentFile[`mara/${missing}.mp4`] = `/assets/mara/${missing}.mp4`;
    assert.equal(compileTavernSceneVideo(config, absentFile), undefined, 'A standard file cannot fill the missing scene role.');
    const absentRole = structuredClone(config) as any; delete absentRole.scene.clips[missing];
    const withoutRole = compileTavernSceneVideo(absentRole, urls);
    if (missing === 'laugh' || missing === 'approach') {
      assert.ok(withoutRole);
      assert.equal(sceneVideoRole(withoutRole, missing === 'laugh' ? 'laugh' : 'compliment'), undefined);
    } else assert.equal(withoutRole, undefined);
    const absentMetadata = structuredClone(config) as any; delete absentMetadata.media[config.scene.clips[missing]!.file];
    assert.equal(compileTavernSceneVideo(absentMetadata, urls), undefined);
    const blankUrl = { ...urls, [config.scene.clips[missing]!.file]: '' };
    assert.equal(compileTavernSceneVideo(config, blankUrl), undefined);
  }
});

test('native 30 FPS and intentional compatible reuse are preserved', () => {
  const { config, urls } = fixture();
  const reused = structuredClone(config) as any;
  reused.scene.clips.hair = { ...reused.scene.clips.talk };
  delete reused.media['mara-counter/hair.mp4']; delete urls['mara-counter/hair.mp4'];
  reused.media['mara-counter/approach.mp4'] = { fps: 30, frames: 126, duration: 4.2 };
  const scene = compileTavernSceneVideo(reused, urls)!;
  assert.ok(scene);
  assert.equal(scene.clips.hair.url, scene.clips.talk.url);
  assert.deepEqual([scene.clips.approach!.fps, scene.clips.approach!.frames, scene.clips.approach!.duration], [30, 126, 4.2]);
});

test('crossed poses/references and malformed timing or display anchors are rejected', () => {
  for (const corrupt of [
    (c: any) => { c.scene.clips.hand.endPose = 'different-lean'; },
    (c: any) => { c.scene.clips.talk.referenceId = 'different-person'; },
    (c: any) => { c.media['mara-counter/talk.mp4'].fps = 0; },
    (c: any) => { c.media['mara-counter/talk.mp4'].frames = 90.5; },
    (c: any) => { c.media['mara-counter/talk.mp4'].duration = 12; },
    (c: any) => { c.media['mara-counter/talk.mp4'].duration = Number.NaN; },
    (c: any) => { c.poster = ''; }, (c: any) => { c.background = ''; },
    (c: any) => { c.anchors.hand.x = 900; }, (c: any) => { c.anchors.hand.y = Number.NaN; },
  ]) {
    const { config, urls } = fixture(), broken = structuredClone(config); corrupt(broken);
    assert.equal(compileTavernSceneVideo(broken, urls), undefined);
  }
});

test('compiled scene snapshots cannot be changed by later draft edits', () => {
  const { config, urls } = fixture();
  const scene = compileTavernSceneVideo(config, urls)!;
  const draft = config as any;
  draft.anchors.hand.x = 1;
  draft.scene.clips.hand.file = 'mara/hand.mp4';
  draft.media['mara-counter/hand.mp4'].fps = 60;
  assert.equal(scene.anchors.hand.x, 270);
  assert.equal(scene.clips.hand.file, 'mara-counter/hand.mp4');
  assert.equal(scene.clips.hand.fps, 24);
});
