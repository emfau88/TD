import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {JSDOM} from 'jsdom';
import {createFeatureProbe} from '../src/feature-probes';
import {maraAction,syncMaraAction} from '../src/mara-action';
import {setLanguage} from '../src/i18n';
const seed=JSON.parse(readFileSync(new URL('../../../artifacts/idle-bastion/acceptance/wave-rework-v2/earned-balanced-late.json',import.meta.url),'utf8'));

test('Mara button describes actual buff and cast restrictions without modifying the save',()=>{
 setLanguage('de');const b=createFeatureProbe('heroes',seed);b.mara.autoCast=false;
 for(let i=0;i<5000&&(b.mara.cooldownRemaining>0||b.phase!=='wave');i++)b.update(.025);
 const target=b.towers.find(t=>t.uid===b.mara.targetTowerUid)!;
 assert.ok(Math.hypot(target.x-b.mara.x,target.y-b.mara.y)<=240);
 const before=b.snapshot();assert.equal(maraAction(b,false,false).state,'ready');assert.deepEqual(b.snapshot(),before);
 assert.equal(maraAction(b,false,true).disabled,true);assert.equal(maraAction(b,true,false).disabled,true);
 assert.ok(b.castMaraNow());assert.equal(maraAction(b,false,false).state,'casting');assert.equal(maraAction(b,false,false).disabled,true);
 assert.match(maraAction(b,false,false).status,/8 s/);assert.equal(b.castMaraNow(),false);
 b.update(.5);const action=maraAction(b,false,false);assert.ok(action.progress>0);assert.ok(action.progress<1);
});

test('Mara map/menu share radial state and preserve stable status nodes across language and cooldown ticks',()=>{
 const dom=new JSDOM(readFileSync(new URL('../index.html',import.meta.url),'utf8'));
 const b=createFeatureProbe('heroes',seed),buttons=['hero-mara-cast','cast-mara'].map(id=>dom.window.document.getElementById(id) as unknown as HTMLButtonElement);
 for(const lang of ['de','en'] as const){
  setLanguage(lang);buttons.forEach(button=>syncMaraAction(button,b,false,false));
  assert.equal(buttons[0].getAttribute('aria-label'),buttons[1].getAttribute('aria-label'));
  assert.equal(buttons[0].style.getPropertyValue('--reveal'),buttons[1].style.getPropertyValue('--reveal'));
  assert.ok(buttons[0].querySelector('img')!.src.endsWith('mara-spell.webp'));
 }
 const label=buttons[0].querySelector('.spell-status');syncMaraAction(buttons[0],b,false,true);
 assert.equal(buttons[0].querySelector('.spell-status'),label);assert.equal(buttons[0].disabled,true);
 assert.equal(buttons[0].querySelector('[aria-live]'),null);dom.window.close();
});
