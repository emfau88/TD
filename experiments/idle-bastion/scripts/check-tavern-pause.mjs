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
    start:async()=>{},stop(){},setHearts(){},prepareReactions:async()=>{},play(){},act(){},scene(){},gesture(){} };
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
  ui.open(); assert.equal(session.tavernOpen,true); ui.destroy(); ui=undefined; assert.equal(session.tavernOpen,false);
  assert.deepEqual(destinations,['tavern','wisp','ilyra','tavern','wisp','ilyra']);
  console.log('PASS: 14 exit/manual-pause cases, stories, both companions, internal navigation and destroy preserve the hold lifecycle.');
} finally { ui?.destroy(); await session?.close(); await server.close(); dom.window.close(); }
