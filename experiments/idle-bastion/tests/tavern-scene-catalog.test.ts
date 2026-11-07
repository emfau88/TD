import assert from 'node:assert/strict';
import test from 'node:test';
import { isCompleteTavernScene, resolveSceneClip, TAVERN_SCENE_CATALOG, type TavernScene, type TavernSceneId, type SceneRole, type SceneAction } from '../src/tavern-scene-catalog';

function fixture(id: TavernSceneId = 'mara-counter') {
  const basePose = `${id}:rest`, referenceId = `test-reference:${id}`;
  const roles: SceneRole[] = ['idle', 'talk', 'hair', 'shoulder', 'hand', 'laugh', 'approach'];
  const clips = Object.fromEntries(roles.map(role => [role, {
    file: `${id}/test-${role}.mp4`, startPose: basePose, endPose: basePose, referenceId,
  }])) as Record<SceneRole, TavernScene['clips'][SceneRole]>;
  const scene: TavernScene = { id, companion: id === 'mara-counter' ? 'mara' : 'ilyra', basePose, referenceId, clips };
  return { scene, files: new Set(Object.values(clips).map(clip => clip.file)) };
}

test('complete local sets map existing actions to scene-specific clips and the shared resting pose', () => {
  for (const id of ['mara-counter', 'ilyra-window'] as TavernSceneId[]) {
    const { scene, files } = fixture(id); assert.ok(isCompleteTavernScene(scene, files));
    const expected: [SceneAction, SceneRole][] = [
      ['idle', 'idle'], ['talk', 'talk'], ['gift', 'talk'], ['hair', 'hair'], ['shoulder', 'shoulder'],
      ['hand', 'hand'], ['laugh', 'laugh'], ['compliment', 'approach'],
    ];
    for (const [action, role] of expected) {
      const clip = resolveSceneClip(scene, action, files)!;
      assert.deepEqual(clip, scene.clips[role]); assert.notEqual(clip, scene.clips[role]);
      assert.equal(clip.startPose, scene.basePose); assert.equal(clip.endPose, scene.basePose);
    }
  }
});

test('missing roles or missing actual media make the whole scene unavailable', () => {
  const { scene, files } = fixture();
  const partial = structuredClone(scene) as any; delete partial.clips.hand;
  assert.equal(isCompleteTavernScene(partial, files), false);
  assert.equal(resolveSceneClip(partial, 'talk', files), undefined, 'no apparently usable partial scene');
  files.delete(scene.clips.hand.file);
  assert.equal(resolveSceneClip(scene, 'hand', files), undefined);
  assert.equal(resolveSceneClip(scene, 'idle', files), undefined);
});

test('crossed companion, standard clip, pose and reference are rejected', () => {
  for (const corrupt of [
    (s: any) => { s.companion = 'ilyra'; },
    (s: any) => { s.id = 'standard'; },
    (s: any) => { s.clips.hand.file = 'mara/hand.mp4'; },
    (s: any) => { s.clips.hand.file = 'ilyra-window/test-hand.mp4'; },
    (s: any) => { s.clips.hand.file = 'mara-counter/../standard.mp4'; },
    (s: any) => { s.clips.hand.startPose = 'standard-rest'; },
    (s: any) => { s.clips.hand.endPose = 'counter-deep-lean'; },
    (s: any) => { s.clips.hand.referenceId = 'other-pose'; },
  ]) {
    const { scene, files } = fixture(); const broken = structuredClone(scene); corrupt(broken);
    for (const clip of Object.values(broken.clips)) files.add(clip.file);
    assert.equal(isCompleteTavernScene(broken, files), false);
    assert.equal(resolveSceneClip(broken, 'hand', files), undefined);
  }
});

test('compatible roles may intentionally reuse one existing local clip', () => {
  const { scene, files } = fixture();
  const reused = structuredClone(scene) as any;
  files.delete(reused.clips.hair.file);
  reused.clips.hair = { ...reused.clips.talk };
  assert.ok(isCompleteTavernScene(reused, files));
  assert.deepEqual(resolveSceneClip(reused, 'talk', files), reused.clips.talk);
  assert.deepEqual(resolveSceneClip(reused, 'hair', files), reused.clips.talk);
});

test('only Mara receives teasing; unknown actions and absent scenes never fall back', () => {
  const mara = fixture(), ilyra = fixture('ilyra-window');
  assert.deepEqual(resolveSceneClip(mara.scene, 'tease', mara.files), mara.scene.clips.laugh);
  assert.equal(resolveSceneClip(ilyra.scene, 'tease', ilyra.files), undefined);
  assert.equal(resolveSceneClip(mara.scene, 'unknown' as SceneAction, mara.files), undefined);
  assert.equal(resolveSceneClip(undefined, 'hand', mara.files), undefined);
  assert.equal(resolveSceneClip({ clips: {} }, 'idle', mara.files), undefined);
  assert.deepEqual(TAVERN_SCENE_CATALOG, {}, 'no undelivered or unapproved scene registered');
});
