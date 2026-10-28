import test from 'node:test';
import assert from 'node:assert/strict';
import { TavernStoryHistory } from '../src/tavern-story-history';

function memory() {
  const records = new Map<string,string>();
  return { records, getItem: (key:string) => records.get(key) ?? null, setItem: (key:string,value:string) => { records.set(key,value); } };
}
const zero = { mara:0, ilyra:0 };
test('opened stories persist individually across reload, remain companion/slot-local, and reset with a new game', () => {
  const storage = memory();
  const first = new TavernStoryHistory('a','new',zero,storage);
  assert.equal(first.isOpened('mara',1),false);
  first.markOpened('mara',2);
  const reload = new TavernStoryHistory('a','loaded',{mara:35,ilyra:10},storage);
  assert.equal(reload.isOpened('mara',2),true);
  assert.equal(reload.isOpened('mara',1),false,'opening chapter 2 must not mark chapter 1 seen');
  assert.equal(reload.isOpened('ilyra',2),false);
  assert.equal(new TavernStoryHistory('b','new',zero,storage).isOpened('mara',2),false);
  assert.equal(new TavernStoryHistory('a','new',zero,storage).isOpened('mara',2),false);
});
test('legacy history starts quietly without changing points, then tracks later unlocks normally', () => {
  const storage = memory(), points = Object.freeze({mara:35,ilyra:70});
  const history = new TavernStoryHistory('old','loaded',points,storage);
  assert.equal(history.isOpened('mara',2),true);
  assert.equal(history.isOpened('mara',3),false);
  assert.equal(history.isOpened('ilyra',3),true);
  assert.equal(history.isOpened('ilyra',4),false);
  const reload = new TavernStoryHistory('old','recovered',{mara:70,ilyra:70},storage);
  assert.equal(reload.isOpened('mara',3),false,'a newly earned heart stays unread after reload');
  assert.deepEqual(points,{mara:35,ilyra:70});
  assert.equal(storage.records.size,1,'only the namespaced UI key is written');
});
test('malformed or unavailable UI storage never prevents play or changes game data', () => {
  for (const value of ['{','null','[]','{"version":1,"mara":-1,"ilyra":0}','{"version":1,"mara":32,"ilyra":0}','{"version":1,"mara":1.5,"ilyra":0}','{"version":2,"mara":0,"ilyra":0}']) {
    const storage=memory();storage.setItem('spire-ui-tavern-stories-v1:old',value);
    const history=new TavernStoryHistory('old','loaded',{mara:10,ilyra:0},storage);
    assert.equal(history.isOpened('mara',1),true);assert.equal(history.isOpened('mara',2),false);
  }
  const denied={getItem(){throw new Error('blocked');},setItem(){throw new Error('quota');}};
  const history=new TavernStoryHistory('temporary','new',zero,denied);
  history.markOpened('ilyra',1);assert.equal(history.isOpened('ilyra',1),true);
});
test('stale UI instances merge opened stories and reject invalid chapter numbers', () => {
  const storage=memory(), a=new TavernStoryHistory('a','new',zero,storage), b=new TavernStoryHistory('a','loaded',zero,storage);
  a.markOpened('mara',1);b.markOpened('ilyra',3);
  const reload=new TavernStoryHistory('a','loaded',zero,storage);
  assert.equal(reload.isOpened('mara',1),true);assert.equal(reload.isOpened('ilyra',3),true);
  const before=[...storage.records];
  for(const heart of [0,-1,6,1.5,NaN,Infinity]) reload.markOpened('mara',heart);
  assert.deepEqual([...storage.records],before);
});
