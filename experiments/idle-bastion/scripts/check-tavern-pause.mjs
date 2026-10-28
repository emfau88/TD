// DOM lifecycle regression: the dialog owns one temporary combat hold.
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';
import { JSDOM } from 'jsdom';
import { IDBFactory } from 'fake-indexeddb';
const dom = new JSDOM('<!doctype html><body></body>', { url: 'http://localhost/' });
for (const key of ['window', 'document', 'HTMLElement', 'HTMLCanvasElement', 'HTMLImageElement', 'AbortController']) globalThis[key] = dom.window[key];
dom.window.HTMLElement.prototype.scrollIntoView = function () {};
globalThis.ResizeObserver = class { observe() {} disconnect() {} };
globalThis.requestAnimationFrame = () => 1; globalThis.cancelAnimationFrame = () => {};
dom.window.HTMLDialogElement.prototype.showModal = function () { this.open = true; };
dom.window.HTMLDialogElement.prototype.close = function () { this.open = false; this.dispatchEvent(new dom.window.Event('close')); };
const root = fileURLToPath(new URL('../', import.meta.url));
const server = await createServer({ root, configFile: false, server: { middlewareMode: true }, appType: 'custom' });
const settle = () => new Promise(resolve => setImmediate(resolve));
let session, ui;
try {
  const { BattleSession } = await server.ssrLoadModule('/src/battle-session.ts');
  const { TavernUI } = await server.ssrLoadModule('/src/tavern-ui.ts');
  const { TavernStoryHistory } = await server.ssrLoadModule('/src/tavern-story-history.ts');
  session = await BattleSession.open(undefined, { guidedStart: false });
  const b = session.battle; b.update(4); b.highestCleared = 25; b.gold = 12000; b.bossVictories = b.secondBossVictories = 1;
  b.buildWorkshop(); b.researchFrost(); b.update(.025); b.wispArrival.met = true; b.discovery = 'off';
  b.buildTavern(b.recommendedTavernPlot); b.upgradeTavern(); b.recruitIlyra();
  b.social.points.mara = b.social.points.ilyra = 70;
  const player = { ready:true, loadingReactions:false, reactionsReady:true, reacting:false,
    start:async()=>{},stop(){},setHearts(){},prepareReactions:async()=>true,play(){},act(){},scene(){},gesture(){} };
  const presentation = {kind:'rig',create:()=>player,drawPortrait:async()=>{},portrait:()=>'',gestures:[{key:'giggle',label:'Zusammen lachen',minHearts:2,line:{mara:'Mara lacht.',ilyra:'Ilyra lacht.'}},{key:'hip',label:'Kompliment machen',minHearts:3,line:{mara:'Mara lächelt.',ilyra:'Ilyra lächelt.'}},{key:'tease',label:'Ein wenig necken',minHearts:4,companion:'mara',line:{mara:'Mara neckt.',ilyra:''}}],anchors:()=>({shoulder:{x:100,y:100},hair:{x:100,y:100},hand:{x:100,y:100}})};
  const destinations=[];
  let history=new TavernStoryHistory('dom','new',{mara:0,ilyra:0},dom.window.localStorage);
  ui = new TavernUI({storyHistory:()=>history,session:()=>session,presentation,navigate:where=>destinations.push(where)});
  const click = selector => document.querySelector(selector).click();
  for (const manual of [false,true]) {
    await session.setPaused(manual);
    for (const exit of ['header','combat','escape','building','wisp','companion','external']) {
      ui.open(); await settle(); assert.equal(session.tavernOpen,true);
      click('[data-do=mara]'); await settle(); assert.equal(session.tavernOpen,true);
      click('[data-moment="1"]'); await settle(); assert.equal(session.tavernOpen,true);
      click('[data-do=story-exit]'); click('[data-do=back]'); click('[data-do=ilyra]'); await settle();
      assert.equal(session.tavernOpen,true);
      if(exit==='header')click('.tv-header [data-do=close]');
      if(exit==='combat')click('.tv-combat [data-do=close]');
      if(exit==='escape') { ui.dialog.dispatchEvent(new dom.window.Event('cancel',{cancelable:true})); assert.equal(session.tavernOpen,true); ui.dialog.dispatchEvent(new dom.window.Event('cancel',{cancelable:true})); }
      if(exit==='building'||exit==='wisp') {click('[data-do=back]');click(`[data-do=${exit}]`);}
      if(exit==='companion')click('[data-do=mara-combat]');
      if(exit==='external')ui.dialog.close();
      await settle(); assert.equal(ui.isOpen,false,exit); assert.equal(session.tavernOpen,false,exit); assert.equal(session.paused,manual,exit);
    }
  }
  // Locked markers explain themselves; available touches never disappear during reactions.
  for (const who of ['mara','ilyra']) for (const [count,points] of [[0,0],[1,10],[2,35],[3,70]]) {
    b.social.points[who]=points; b.social.reserves[who].touch=count>=2?3:0;
    ui.open(); click(`[data-do=${who}]`); await settle(); ui.update();
    const buttons=[...document.querySelectorAll('.tv-hotspot')];
    assert.equal(buttons.length,3); assert.ok(buttons.every(button=>!button.hidden&&!button.disabled));
    assert.equal(buttons.filter(button=>button.dataset.locked==='false').length,count);
    const locked=buttons.find(button=>button.dataset.locked==='true');
    if(locked) {const before=structuredClone(b.social);locked.click();await settle();assert.deepEqual(b.social,before);assert.match(document.querySelector('[data-text=result]').textContent,/Herz|heart/);}
    player.reacting=true;ui.update();assert.ok(buttons.every(button=>!button.hidden));player.reacting=false;
    click('[data-do=touch]');assert.equal(ui.dialog.dataset.screen,'character');
    assert.equal(document.querySelector('.tv-touch-help').hidden,false);
    if(count) {click('[data-moment="1"]');await settle();assert.ok(buttons.every(button=>button.hidden));click('[data-do=story-exit]');assert.ok(buttons.every(button=>!button.hidden));}
    ui.close();
  }
  console.log('PASS: both companions at hearts 0–3, permanent markers, locked explanations, reactions, stories and one character view.');
  for(const who of ['mara','ilyra']) {
    history=new TavernStoryHistory('dom','new',{mara:0,ilyra:0},dom.window.localStorage);
    b.social.points[who]=35;ui.open();click(`[data-do=${who}]`);await settle();
    const first=document.querySelector('[data-moment="1"]'), second=document.querySelector('[data-moment="2"]');
    assert.equal(document.querySelectorAll('.tv-heart-buttons small').length,0,'no visible per-heart captions');
    assert.equal(first.dataset.unseen,'true');assert.equal(second.dataset.unseen,'true');
    assert.equal(document.querySelector('[data-moment="3"]').dataset.unseen,'false','locked hearts never pulse');
    const saved=structuredClone(b.snapshot());
    player.prepareReactions=async()=>false;click('[data-moment="1"]');await settle();
    assert.equal(history.isOpened(who,1),false,'failed load must not consume a story cue');
    player.prepareReactions=async()=>true;click('[data-moment="1"]');await settle();
    assert.equal(first.dataset.unseen,'false');assert.equal(second.dataset.unseen,'true');
    assert.ok(first.getAttribute('aria-label'));assert.equal(first.disabled,false);
    click('[data-do=story-exit]');
    history=new TavernStoryHistory('dom','loaded',b.social.points,dom.window.localStorage);ui.update();
    assert.equal(first.dataset.unseen,'false');assert.equal(second.dataset.unseen,'true');
    assert.deepEqual(b.snapshot(),saved,'story history has no battle/social/offline effect');
    ui.close();
  }
  console.log('PASS: story first-open persistence, no per-heart captions, locked quiet, failed-load retry and unchanged battle for both companions.');

  for (const who of ['mara','ilyra']) for (const [count,points] of [[0,0],[1,10],[2,35],[3,70]]) {
    b.social.points[who]=points;b.social.reserves[who]={talk:0,touch:count>=2?1:0,clears:0};b.social.personal[who]={clears:0,claimed:count>=3};
    ui.open();click(`[data-do=${who}]`);await settle();click('[data-do=speak]');await settle();
    const group=document.querySelector('.tv-gestures');assert.equal(group.hidden,false);
    assert.equal(group.parentElement.className,'tv-action-dock','conversation choices stay outside the text scroller');
    assert.equal(document.querySelector('[data-do=speak]').getAttribute('aria-pressed'),'true');
    ui.dialog.dispatchEvent(new dom.window.Event('cancel',{cancelable:true}));
    assert.equal(group.hidden,true);assert.equal(ui.dialog.dataset.screen,'character');assert.equal(session.tavernOpen,true);
    click('[data-do=speak]');
    assert.equal([...group.querySelectorAll('button')].filter(button=>!button.hidden).length,3);
    assert.equal(document.querySelector('[data-gesture=giggle]').dataset.locked,String(count<2));
    assert.equal(document.querySelector('[data-gesture=hip]').dataset.locked,String(count<3));
    const before=structuredClone(b.social);
    for (const selector of ['[data-action=talk]','[data-gesture=giggle]','[data-gesture=hip]']) {
      if(group.hidden)click('[data-do=speak]');click(selector);await settle();
      assert.equal(group.hidden,true,'choice reveals the reply and keeps the portrait unobstructed');
      assert.equal(document.querySelector('[data-do=speak]').getAttribute('aria-pressed'),'false');
    }
    assert.equal(document.querySelector('.tv-unlock').parentElement.className,'tv-bond-copy');
    assert.equal(document.querySelector('.tv-story-controls').parentElement.className,'tv-action-dock');
    for (let heart=1;heart<=5;heart++) assert.equal(document.querySelector(`[data-moment="${heart}"]`).disabled,heart>count);
    assert.deepEqual(b.social,before,'conversation repeats add no points with empty reserve');
    ui.close();
  }
  b.social.points.mara=58;b.social.reserves.mara={talk:0,touch:0,clears:0};b.social.personal.mara={clears:9,claimed:false};b.social.gifts=1;
  ui.open();click('[data-do=mara]');await settle();
  assert.match(document.querySelector('[data-text=gift-hint]').textContent,/21/);
  assert.match(document.querySelector('[data-text=gift-hint]').textContent,/bleibt erhalten|is kept/);
  assert.equal(document.querySelector('[data-action=gift]').disabled,true);click('[data-action=gift]');await settle();assert.equal(b.social.gifts,1);assert.equal(b.social.points.mara,58);
  assert.ok(document.querySelector('.tv-personal').closest('details'));
  b.social.personal.mara.clears=30;ui.update();assert.equal(document.querySelector('[data-action=gift]').disabled,false);click('[data-action=gift]');await settle();await settle();assert.equal(b.social.points.mara,70);assert.equal(b.social.gifts,1);
  ui.close();console.log('PASS: fixed speaking choices at hearts 0–3, zero-point repeats, locked explanations and personal gift preserves normal stock (21 remaining wins).');
  // Short waits remain quiet; a sustained wait and real failures remain visible.
  ui.open(); click('[data-do=mara]'); await settle();
  const cue=document.querySelector('.tv-load-status'), canvas=document.querySelector('.tv-figure canvas');
  Object.defineProperty(canvas,'clientWidth',{configurable:true,get:()=>canvas.hidden?0:240});
  Object.defineProperty(canvas,'clientHeight',{configurable:true,get:()=>canvas.hidden?0:350});
  player.ready=false;ui.update();player.ready=true;ui.update();
  assert.ok(parseFloat(document.querySelector('[data-region=shoulder]').style.left)>20,'loading completion repositions markers without a stage resize');
  const delay=ms=>new Promise(resolve=>setTimeout(resolve,ms));
  player.loadingReactions=true;ui.update();assert.equal(cue.hidden,true);
  await delay(100);player.loadingReactions=false;ui.update();await delay(480);assert.equal(cue.hidden,true,'cancelled short wait never flashes later');
  player.loadingReactions=true;ui.update();await delay(480);assert.equal(cue.hidden,false);assert.match(cue.textContent,/Moment|moment/);assert.equal(canvas.hidden,false,'retain the current pose');
  player.loadingReactions=false;canvas.dataset.reactionError='true';ui.update();assert.equal(cue.hidden,false);assert.match(cue.textContent,/erneut|again/);
  delete canvas.dataset.reactionError;ui.update();assert.equal(cue.hidden,true);
  player.loadingReactions=true;ui.update();ui.close();await delay(480);player.loadingReactions=false;
  ui.open();click('[data-do=mara]');await settle();assert.equal(cue.hidden,true,'closed character cannot leak a delayed hint');ui.close();
  console.log('PASS: 450-ms loading cue, short-wait cancellation, visible pose, immediate failure and close cleanup.');
  ui.open(); assert.equal(session.tavernOpen,true); ui.destroy(); ui=undefined; assert.equal(session.tavernOpen,false);
  assert.deepEqual(destinations,['tavern','wisp','ilyra','tavern','wisp','ilyra']);
  console.log('PASS: 14 exit/manual-pause cases, stories, both companions, internal navigation and destroy preserve the hold lifecycle.');
  // Use the real transactional store, delaying only its durable write boundary.
  await session.close(); session=undefined;
  const { openBattleStore } = await server.ssrLoadModule('/src/save-store.ts');
  for (const [before,action,heart] of [[8,'talk',1],[23,'gift',2],[58,'gift',3]]) for (const fail of [false,true]) {
    const store=await openBattleStore(new IDBFactory(),'heart-feedback',()=>1000);
    let gate=false, finish; const originalSave=store.save.bind(store);
    store.save=(...args)=>gate?new Promise((resolve,reject)=>{finish=()=>fail?reject(new Error('Controlled heart write failure')):originalSave(...args).then(resolve,reject);}):originalSave(...args);
    session=await BattleSession.open(store,{now:()=>1000,locks:null,guidedStart:false});
    await session.command(model=>{
      model.update(4);model.highestCleared=12;model.buildTavern(model.recommendedTavernPlot);
      model.social.points.mara=before;model.social.gifts=2;
      model.social.reserves.mara={talk:3,touch:before>=35?3:0,clears:0};model.social.personal.mara={clears:before>=35?30:0,claimed:false};
    },true);
    let sounds=0;const clips=[];player.scene=clip=>clips.push(clip);
    ui=new TavernUI({session:()=>session,presentation,navigate(){},onHeart:()=>sounds++});
    ui.open();click('[data-do=mara]');await session.flush();await settle();gate=true;
    if(action==='talk')click('[data-do=speak]');click(`[data-action=${action}]`);await settle();
    assert.ok(finish,'write is waiting for durable confirmation');assert.ok(session.battle.social.points.mara>before,'working state already advanced');
    ui.update();assert.equal(document.querySelector('progress').value,before,'animation redraw cannot expose an uncommitted heart');
    assert.equal(sounds,0);assert.equal(document.querySelector('[data-do=new-moment]').hidden,true);assert.equal(document.querySelector(`[data-moment="${heart}"]`).dataset.unseen,'false');
    gate=false;finish();for(let i=0;i<30;i++)await settle();ui.update();
    if(fail) {
      assert.equal(sounds,0);assert.equal(session.battle.social.points.mara,before);assert.equal(document.querySelector(`[data-moment="${heart}"]`).dataset.unseen,'false');
      assert.equal(document.querySelector('[data-do=new-moment]').hidden,true);assert.equal(document.querySelector('.tv-error').hidden,false);
    } else {
      assert.equal(sounds,1);assert.equal(document.querySelector(`[data-moment="${heart}"]`).dataset.unseen,'true');assert.deepEqual(clips,['head']);
      assert.equal(document.querySelector('[data-do=new-moment]').hidden,false);assert.match(document.querySelector('[data-text=unlock-title]').textContent,/Schulter|Haare|Hand|Shoulder|Hair/);
      assert.equal((await store.load()).save.battle.social.points.mara,session.battle.social.points.mara);
      for(let i=0;i<5;i++)ui.update();assert.equal(sounds,1,'redraw never repeats the cue');
    }
    ui.destroy();ui=undefined;await session.close().catch(error=>{if(!fail)throw error;});session=undefined;
  }
  console.log('PASS: hearts 1/2/3 stay hidden until durable acknowledgement; six delayed/success/failure cases, rollback, one sound, short reaction and unlock text.');
} finally { ui?.destroy(); await session?.close(); await server.close(); dom.window.close(); }
