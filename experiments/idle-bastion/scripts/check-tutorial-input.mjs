// Exercise the actual scene's input methods without booting a renderer.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import ts from 'typescript';
import { JSDOM } from 'jsdom';
function moduleAt(path, require = () => ({})) {
  const source = readFileSync(new URL(path, import.meta.url),'utf8');
  const js = ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText;
  const exports={};new Function('require','exports',js)(require,exports);return exports;
}
const {BattleScene}=moduleAt('../src/battle-scene.ts',name=>name==='phaser'?{Scene:class{}}:{});
const scene=Object.create(BattleScene.prototype);
let selecting=true,rendering=false,selected=0;
scene.hooks={canSelect:()=>selecting,canRender:()=>rendering,select:()=>selected++};
scene.readBattle=()=>({layout:{cellSize:40,towerPads:[{id:'test',cell:{x:1,y:1}}]}});
scene.cameras={main:{getWorldPoint:(x,y)=>({x,y})}};
scene.bossCharmView={contains:()=>false};scene.setSelected=()=>{};
selecting=false;scene.selectAtPointer({x:40,y:40});assert.equal(scene.pendingTap,undefined,'a tap during a purchase must not be queued');
selecting=true;scene.selectAtPointer({x:40,y:40});assert.ok(scene.pendingTap,'background-save input can still wait');
scene.setPlacement(2);assert.equal(scene.pendingTap,undefined,'changing interaction mode invalidates an old coordinate');
rendering=true;scene.selectAtPointer({x:40,y:40});assert.equal(selected,1,'a fresh deliberate tap still works');

const dom=new JSDOM('<div id="lesson-pointer" hidden><svg></svg></div><button id="settlement-tab">Siedlung</button>');
for(const key of ['document','HTMLElement','HTMLButtonElement'])globalThis[key]=dom.window[key];
globalThis.innerWidth=430;globalThis.innerHeight=840;
let reduced=false,animations=0;
globalThis.matchMedia=()=>({matches:reduced});
dom.window.HTMLElement.prototype.getAnimations=()=>[];
dom.window.HTMLElement.prototype.animate=()=>{animations++;return {cancel(){}};};
dom.window.HTMLElement.prototype.scrollIntoView=()=>{};
const button=document.querySelector('button');button.getClientRects=()=>[{}];
button.getBoundingClientRect=()=>({left:80,top:700,width:100,height:45});
const {LessonPointer}=moduleAt('../src/lesson-pointer.ts');const pointer=new LessonPointer();
pointer.show(button);assert.equal(animations,1);assert.equal(document.querySelector('#lesson-pointer').hidden,false);
for(let i=0;i<20;i++)pointer.show(button);assert.equal(animations,1,'UI refresh must not restart the entrance pulse');
pointer.remindAt=0;pointer.show(button);pointer.show(button);assert.equal(animations,2,'one quiet reminder, not a repeating loop');
pointer.show();reduced=true;pointer.show(button);assert.equal(animations,2,'reduced motion uses the static cue');
console.log('PASS: purchase taps discarded, background tap retained, mode change invalidation, fresh selection, finite cue and reduced motion.');
dom.window.close();
