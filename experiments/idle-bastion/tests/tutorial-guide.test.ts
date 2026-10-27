import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { JSDOM } from 'jsdom';
import { IdleBattle } from '../src/battle';
import { TutorialGuide, tutorialNext } from '../src/tutorial-guide';
import { setLanguage } from '../src/i18n';
const view = { contextOpen:false, placing:false, blocked:false, paused:false };
function setup() {
  const doc = new JSDOM(readFileSync('experiments/idle-bastion/index.html','utf8')).window.document;
  const quick=doc.createElement('section'); quick.id='quick-win-hint'; quick.innerHTML='<button id="quick-win-open">Build</button>';doc.getElementById('app')!.append(quick);
  const guide = new TutorialGuide(doc);
  const paint=(...ids:string[])=>{
    for(const selector of ['#onboarding-card','#wisp-arrival','#discovery-card','#boss-banner','#fallback-note','#quick-win-hint','#combat-message','#lesson-savings','.goal-ribbon'])
      (doc.querySelector(selector) as HTMLElement).hidden=!ids.includes(selector);
  };
  const b=IdleBattle.restore(JSON.parse(readFileSync('artifacts/idle-bastion/acceptance/onboarding/menu-guide/browser.json','utf8')).final.battle)!;
  assert.ok(b); b.introduction.stage='done';b.discovery='wisp';b.tutorial.hidden=false;
  return {doc,guide,paint,b};
}
test('Frost tip and wave objective share one slot, keeping the real counter and model intact',()=>{
  setLanguage('en'); const {doc,guide,paint,b}=setup();b.highestCleared=3;
  const before=b.snapshot();paint('.goal-ribbon','#combat-message');
  doc.getElementById('combat-message')!.textContent='Frost keeps enemies in arrow range.';
  guide.update(b,view);
  assert.equal(guide.element.dataset.source,'combat-message');
  assert.match(guide.element.textContent!,/10\/14/);assert.match(guide.element.textContent!,/3\/5 cleared/);
  assert.equal((doc.querySelector('.goal-ribbon') as HTMLElement).hidden,true);
  assert.deepEqual(b.snapshot(),before);
  paint('.goal-ribbon');guide.update(b,view);
  assert.equal(guide.element.dataset.source,'goal');assert.match(guide.element.textContent!,/Frost and arrows/);
  assert.equal(doc.getElementById('combat-message')!.parentElement!.id,'app');
});
test('moving the existing Wisp card preserves its button and event listener',()=>{
  const {doc,guide,paint,b}=setup();b.highestCleared=5;
  const button=doc.getElementById('meet-wisp')!;let clicks=0;button.addEventListener('click',()=>clicks++);
  paint('#wisp-arrival','.goal-ribbon','#combat-message');guide.update(b,view);
  assert.equal(guide.element.dataset.source,'wisp-arrival');(button as HTMLButtonElement).click();assert.equal(clicks,1);
  assert.equal(doc.querySelectorAll('#meet-wisp').length,1);
  b.discovery='done';paint('.goal-ribbon');guide.update(b,view);
  assert.equal(guide.element.hidden,true);assert.equal(button.closest('#wisp-arrival')!.parentElement!.id,'app');
});
test('step 14 waits on the cleared wave, not the current attempt, and survives restoration',()=>{
  const {b}=setup();
  for(let i=0;i<12000&&!b.discoveryPaused;i++)b.update(.025);
  assert.equal(b.highestCleared,5);assert.ok(b.meetWisp());assert.ok(b.dismissDiscovery());assert.ok(b.dismissDiscovery());
  assert.match(tutorialNext(b),/8.*Storehouse.*5\/8/);
  const restored=IdleBattle.restore(b.snapshot());assert.ok(restored);assert.equal(tutorialNext(restored),tutorialNext(b));
  b.highestCleared=8;assert.match(tutorialNext(b),/Optional:/);
});
test('an active lesson beats toasts, and a defeat notice beats optional discovery tips',()=>{
  const {guide,paint,b}=setup();b.discovery='mara-wait';
  paint('#discovery-card','#combat-message','.goal-ribbon');guide.update(b,view);
  assert.equal(guide.element.dataset.source,'discovery-card');
  b.discovery='warehouse';paint('#fallback-note','#quick-win-hint','.goal-ribbon');guide.update(b,view);
  assert.equal(guide.element.dataset.source,'fallback-note');
});
test('menus and placement carry the counter without a second tutorial card',()=>{
  const {doc,guide,paint,b}=setup();
  paint('.goal-ribbon');doc.getElementById('lesson-note')!.hidden=true;
  guide.update(b,{...view,contextOpen:true});assert.equal(guide.element.hidden,true);
  assert.equal((doc.querySelector('#context-panel .guide-inline') as HTMLElement).hidden,false);
  assert.match(doc.querySelector('.guide-context-next')!.textContent!,/wave 5/);
  paint('.goal-ribbon');guide.update(b,{...view,placing:true});
  assert.equal(guide.element.hidden,true);
  assert.equal((doc.querySelector('#placement-help .guide-inline') as HTMLElement).hidden,false);
});
test('modal suppression and ending or skipping the tutorial restore the ordinary HUD',()=>{
  const {doc,guide,paint,b}=setup();paint('.goal-ribbon');guide.update(b,view);
  paint('.goal-ribbon');guide.update(b,{...view,blocked:true});assert.equal(guide.element.hidden,true);
  assert.equal((doc.querySelector('.goal-ribbon') as HTMLElement).hidden,true);
  b.discovery='off';paint('.goal-ribbon');guide.update(b,view);
  assert.equal((doc.querySelector('.goal-ribbon') as HTMLElement).hidden,false);
  assert.equal(doc.querySelector('.goal-ribbon')!.parentElement!.id,'app');
});
test('saving stages and temporarily absent presenters still show progress and an actionable next step',()=>{
  setLanguage('de');const {guide,paint,b}=setup();b.introduction.stage='research';b.settlement.frostResearched=false;b.gold=12;
  paint('#lesson-savings');guide.update(b,view);assert.match(guide.element.textContent!,/8\/14/);
  paint();guide.update(b,view);assert.equal(guide.element.hidden,false);assert.match(guide.element.textContent!,/Spare 60 Gold/);
  setLanguage('en');
});
