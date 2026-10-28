// DOM lifecycle regression: the dialog owns one temporary combat hold.
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';
import { JSDOM } from 'jsdom';
const dom = new JSDOM('<!doctype html><body></body>', { url: 'http://localhost/' });
for (const key of ['window', 'document', 'HTMLElement', 'HTMLCanvasElement', 'HTMLImageElement', 'AbortController']) globalThis[key] = dom.window[key];
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
  session = await BattleSession.open(undefined, { guidedStart: false });
  const b = session.battle; b.update(4); b.highestCleared = 25; b.gold = 12000; b.bossVictories = b.secondBossVictories = 1;
  b.buildWorkshop(); b.researchFrost(); b.update(.025); b.wispArrival.met = true; b.discovery = 'off';
  b.buildTavern(b.recommendedTavernPlot); b.upgradeTavern(); b.recruitIlyra();
  b.social.points.mara = b.social.points.ilyra = 70;
  const player = { ready:true, loadingReactions:false, reactionsReady:true, reacting:false,
    start:async()=>{},stop(){},setHearts(){},prepareReactions:async()=>true,play(){},act(){},scene(){},gesture(){} };
  const presentation = {kind:'rig',create:()=>player,drawPortrait:async()=>{},portrait:()=>'',gestures:[],anchors:()=>({shoulder:{x:100,y:100},hair:{x:100,y:100},hand:{x:100,y:100}})};
  const destinations=[];
  ui = new TavernUI({session:()=>session,presentation,navigate:where=>destinations.push(where)});
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
} finally { ui?.destroy(); await session?.close(); await server.close(); dom.window.close(); }
