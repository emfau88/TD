import test from 'node:test';
import assert from 'node:assert/strict';
import { IDBFactory } from 'fake-indexeddb';
import { MaraIntro, type IntroStorage } from '../src/mara-intro';
import { BattleSession, type SessionStore } from '../src/battle-session';
import { openBattleStore } from '../src/save-store';
import { IdleBattle } from '../src/battle';
import { english } from '../src/locales/en';
import { INTRO_COPY } from '../src/mara-intro';
function memory(): IntroStorage {
  const map = new Map<string, string>();
  return { getItem: k => map.get(k) ?? null, setItem: (k, v) => { map.set(k, v); }, removeItem: k => { map.delete(k); } };
}
test('new intro resumes each scene without changing the authoritative welcome phase', () => {
  const storage = memory(), battle = IdleBattle.newGame();
  let intro = new MaraIntro('a', 'new', battle.introduction.stage, storage);
  for (const step of [0, 1, 2]) {
    assert.equal(intro.step, step); assert.equal(intro.active, true);
    intro = new MaraIntro('a', 'loaded', battle.introduction.stage, storage);
    assert.equal(intro.step, step); assert.equal(intro.active, true); intro.next();
  }
  assert.equal(battle.introduction.stage, 'welcome'); assert.equal(battle.gold, 75);
  assert.equal(battle.towers.length, 0);
});
test('legacy saves, recovery, stale and corrupt preferences never start a new intro', () => {
  const storage = memory();
  for (const stage of ['welcome', 'build', 'ready', 'combat', 'done']) assert.equal(new MaraIntro('old', 'loaded', stage, storage).active, false);
  for (const stage of ['build', 'ready', 'combat', 'done']) {
    new MaraIntro('a', 'new', 'welcome', storage);
    assert.equal(new MaraIntro('a', 'loaded', stage, storage).active, false);
    assert.equal(new MaraIntro('a', 'loaded', 'welcome', storage).active, false);
  }
  new MaraIntro('a', 'new', 'welcome', storage);
  assert.equal(new MaraIntro('a', 'recovered', 'welcome', storage).active, false);
  for (const value of ['{', '{"version":1,"step":99,"status":"active"}', '{"version":2,"step":1,"status":"active"}']) {
    storage.setItem('spire-ui-intro-v1:a', value); assert.equal(new MaraIntro('a', 'loaded', 'welcome', storage).active, false);
  }
});
test('intro completion is slot-local and a new game overwrites stale completion', () => {
  const storage = memory(), a = new MaraIntro('a', 'new', 'welcome', storage);
  const b = new MaraIntro('b', 'new', 'welcome', storage); b.next(); a.complete();
  assert.equal(new MaraIntro('a', 'loaded', 'welcome', storage).active, false);
  assert.equal(new MaraIntro('b', 'loaded', 'welcome', storage).step, 1);
  assert.equal(new MaraIntro('a', 'new', 'welcome', storage).step, 0);
});
test('blocked preferences retain in-memory interaction and protect existing saves on reload', () => {
  const denied = () => { throw Error('storage blocked'); };
  const storage = { getItem: denied, setItem: denied, removeItem: denied };
  const intro = new MaraIntro('a', 'new', 'welcome', storage); intro.next(); intro.next();
  assert.equal(intro.step, 2); intro.complete(); assert.equal(intro.active, false);
  assert.equal(new MaraIntro('a', 'loaded', 'welcome', storage).active, false);
});
test('session provenance stays runtime-only and intro skip persists build without skipping lessons or gifting towers', async () => {
  const factory = new IDBFactory();
  let store = await openBattleStore(factory, 'q4-session');
  let session = await BattleSession.open(store, { locks: null });
  assert.equal(session.origin, 'new');
  const storage = memory(), intro = new MaraIntro('a', session.origin, 'welcome', storage);
  assert.equal(await session.command(b => b.beginIntroduction()), true); intro.complete();
  assert.equal(await session.command(b => b.beginIntroduction()), false);
  assert.equal(session.battle.introduction.stage, 'build'); assert.equal(session.battle.gold, 75); assert.equal(session.battle.towers.length, 0);
  const saved = await store.load(); assert.equal(saved.kind, 'valid');
  if (saved.kind === 'valid') assert.equal('origin' in saved.save.battle, false);
  await session.close();
  store = await openBattleStore(factory, 'q4-session');
  session = await BattleSession.open(store, { locks: null });
  assert.equal(session.origin, 'loaded'); assert.equal(session.battle.introduction.stage, 'build');
  assert.equal(new MaraIntro('a', session.origin, 'build', storage).active, false);
  await session.close(); store.close();
});
test('failed welcome transition keeps the current intro resumable and does not grant anything', async () => {
  const store = await openBattleStore(new IDBFactory(), 'q4-failed');
  const broken: SessionStore = { load: () => store.load(), save: (...args) => store.save(...args), recoverBackup: (...args) => store.recoverBackup(...args),
    close: () => store.close(), acquireWriter: (...args) => store.acquireWriter(...args), renewWriter: (...args) => store.renewWriter(...args), releaseWriter: (...args) => store.releaseWriter(...args) };
  const session = await BattleSession.open(broken, { locks: null });
  const storage = memory(), intro = new MaraIntro('a', 'new', 'welcome', storage); intro.next();
  broken.save = async () => { throw Error('disk full'); };
  assert.equal(await session.command(b => b.beginIntroduction()), false);
  assert.ok(session.error); assert.equal(session.battle.introduction.stage, 'welcome'); assert.equal(session.battle.gold, 75);
  assert.equal(new MaraIntro('a', 'loaded', 'welcome', storage).step, 1);
  await session.close().catch(() => undefined); store.close();
});
test('all intro copy and actions have English translations', () => {
  for (const row of INTRO_COPY) for (const text of row) assert.ok(english[text], text);
  assert.ok(english['Intro überspringen']); assert.ok(english['Mara · {0} von 3']);
});
