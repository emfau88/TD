import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {runInContext} from 'node:vm';
import {build} from 'esbuild';
import {JSDOM} from 'jsdom';

const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const manifest=JSON.parse(await readFile(resolve(root,'public/assets/manifest.json'),'utf8'));
const compiled=await build({entryPoints:[resolve(root,'src/main.ts')],bundle:true,write:false,format:'esm',target:'es2022',loader:{'.css':'empty'},plugins:[{name:'ui-contract-scene',setup(builder){
  builder.onResolve({filter:/^phaser$/},()=>({path:'phaser',namespace:'ui-double'}));
  builder.onResolve({filter:/^\.\/scene$/},()=>({path:'scene',namespace:'ui-double'}));
  builder.onLoad({filter:/.*/,namespace:'ui-double'},args=>({resolveDir:resolve(root,'src'),contents:args.path==='phaser'?`
    export default {AUTO:0,Scale:{FIT:0,CENTER_BOTH:0},Game:class{constructor(config){queueMicrotask(()=>{const scene=config.scene[0];scene.loadMap(0);scene.hooks.ready();});}}};
  `:`
    import {Simulation} from './simulation';
    export class ForestScene {
      paused=false; speed=1; menu=true; dialogueEnabled=true; abilityTargeting=false;
      constructor(assets,hooks){this.assets=assets;this.hooks=hooks;window.testScene=this;}
      loadMap(id,party){this.sim=new Simulation(id,party);this.paused=false;this.speed=1;this.selected=undefined;this.selectedHero=undefined;this.buildId=undefined;this.abilityTargeting=false;this.hooks.select();this.hooks.changed();}
      restoreRun(snapshot){const sim=Simulation.restore(snapshot);if(!sim)return false;this.sim=sim;this.selected=undefined;this.selectedHero=undefined;this.buildId=undefined;this.abilityTargeting=false;this.paused=false;this.hooks.select();this.hooks.changed();return true;}
      chooseBuild(id){this.buildId=id;this.selected=undefined;this.selectedHero=undefined;this.abilityTargeting=false;this.hooks.select();this.hooks.changed();}
      cancelBuild(){this.buildId=undefined;this.hooks.select();this.hooks.changed();}
      clearSelection(){this.selected=undefined;this.selectedHero=undefined;this.abilityTargeting=false;this.cancelBuild();}
      drawRange(){}
      selectHero(id){if(!this.sim.heroes.some(h=>h.id===id))return;this.cancelBuild();this.selectedHero=id;this.abilityTargeting=false;this.hooks.changed();}
      heroAbility(){const hero=this.sim.heroes.find(h=>h.id===this.selectedHero);if(!hero||this.paused||this.menu||this.sim.phase!=='wave'||hero.cooldown>0)return false;let accepted=true;if(hero.id==='mara'&&this.selected)accepted=this.sim.commandAction('mara','tower',this.selected);else this.abilityTargeting=true;this.handleEvents();this.hooks.changed();return accepted;}
      command(col,row){const hero=this.selectedHero;if(!hero||this.paused||this.menu)return false;const accepted=this.abilityTargeting?this.sim.commandAction(hero,'point',[col,row]):this.sim.commandHero(hero,col,row);if(accepted)this.abilityTargeting=false;this.handleEvents();this.hooks.changed();return accepted;}
      handleEvents(){for(const event of this.sim.drainEvents())this.hooks.event(event);}
      selectTower(tower){this.selected=tower.uid;this.buildId=undefined;this.selectedHero=undefined;this.hooks.select(tower);this.hooks.changed();}
      place(id,col,row){const tower=this.sim.build(id,col,row);this.handleEvents();this.hooks.changed();return tower;}
      advance(seconds){if(!this.paused&&!this.menu)this.sim.update(seconds);this.handleEvents();this.hooks.changed();}
    }
  `}));
}}]});

async function setup(saved=null){
  const dom=new JSDOM('<!doctype html><html><body><div id="app"></div></body></html>',{url:'https://spire.test/',runScripts:'outside-only',pretendToBeVisual:true});const {window}=dom;
  if(saved!==null)window.localStorage.setItem('spire-save',JSON.stringify(saved));
  window.__SPIRE_BUNDLE__={manifest,images:Object.fromEntries(Object.keys(manifest).map(name=>[name,'data:image/png;base64,AA==']))};
  let clock=0,nextTimer=1;const timers=new Map();window.setTimeout=(callback,delay=0)=>{const id=nextTimer++;timers.set(id,{callback,at:clock+delay});return id;};window.clearTimeout=id=>timers.delete(id);
  window.Image=class{async decode(){}};window.HTMLCanvasElement.prototype.getContext=()=>({drawImage(){}});window.HTMLCanvasElement.prototype.toDataURL=()=>'data:image/png;base64,AA==';
  await runInContext(`(async()=>{${compiled.outputFiles[0].text}\n})()`,dom.getInternalVMContext());await new Promise(setImmediate);
  const query=selector=>{const element=window.document.querySelector(selector);assert.ok(element,`Missing UI: ${selector}`);return element;};
  return {dom,window,query,scene:window.testScene,click:selector=>query(selector).click(),key:key=>window.dispatchEvent(new window.KeyboardEvent('keydown',{key,code:key===' '?'Space':undefined})),saved:()=>JSON.parse(window.localStorage.getItem('spire-save')),advanceClock:milliseconds=>{clock+=milliseconds;for(const [id,timer] of [...timers.entries()].filter(([,timer])=>timer.at<=clock))if(timers.delete(id))timer.callback();}};
}
const siteNear=(sim,hero=sim.heroes[0])=>Array.from({length:28*16},(_,cell)=>[cell%28,Math.floor(cell/28)]).filter(([col,row])=>sim.canBuild(col,row)).sort((a,b)=>Math.hypot(a[0]*40+20-hero.x,a[1]*40+20-hero.y)-Math.hypot(b[0]*40+20-hero.x,b[1]*40+20-hero.y))[0];
let checks=0;const record=message=>{checks++;console.log(`PASS ${message}`);};
const game=await setup();
assert.equal(game.window.document.querySelector('#loading'),null);assert.equal(game.window.document.querySelectorAll('[data-preview-map]').length,5);assert.deepEqual([...game.window.document.querySelectorAll('[data-preview-map]')].map(button=>Number(button.dataset.previewMap)),[4,7,10,16,3]);assert.equal(game.query('#begin-button').disabled,false);assert.equal(game.query('[data-party="runa"]').disabled,false);assert.equal(game.query('[data-party="ilyra"]').disabled,false);
game.click('#campaign-draft-mode');assert.equal(game.window.document.querySelectorAll('[data-chapter]').length,6);assert.equal(game.window.document.querySelectorAll('[data-map]').length,3);assert.equal(game.query('#begin-button').disabled,true);assert.ok(game.query('.campaign-menu-header').textContent.includes('Kampagnenentwurf'));game.click('#test-maps-mode');game.click('[data-preview-map="4"]');assert.equal(game.query('#begin-button').disabled,false);
record('Exactly five direct-play maps are the default; the 18-mission campaign remains a non-launchable draft');
game.click('#begin-button');assert.equal(game.scene.sim.map.id,4);assert.equal(game.scene.paused,true);game.click('#help-close');assert.equal(game.scene.paused,false);assert.equal(game.query('#modal-layer').hidden,true);assert.equal(game.saved().tutorial,true);
assert.ok(game.query('.game-dock').contains(game.query('.hero-command-bar')));assert.ok(game.query('.game-hud').contains(game.query('#wave')));assert.equal(game.window.document.querySelector('.sidebar'),null);assert.equal(game.query('#mission-overlay').open,false);assert.equal(game.query('#detail-panel').hidden,true);assert.equal(game.window.document.querySelectorAll('[data-hero]').length,2);
game.key('q');assert.equal(game.scene.selectedHero,'wisp');game.key('e');assert.equal(game.scene.selectedHero,'mara');assert.equal(game.query('[data-hero="mara"]').getAttribute('aria-pressed'),'true');game.key('Escape');assert.equal(game.scene.selectedHero,undefined);
record('Tutorial persists; integrated HUD, control dock and collapsed mission overlay expose Q/E hero selection');
const gold=game.scene.sim.gold;game.click('[data-tower="1"]');assert.equal(game.scene.buildId,1);const tower=game.scene.place(1,...siteNear(game.scene.sim));assert.ok(tower);assert.equal(Number(game.query('#gold').textContent),gold-75);game.scene.selectTower(tower);assert.equal(game.query('#detail-panel').hidden,false);game.click('#upgrade-button');assert.equal(tower.level,2);game.query('#priority').value='strong';game.query('#priority').dispatchEvent(new game.window.Event('change'));assert.equal(tower.priority,'strong');game.click('#detail-close');assert.equal(game.query('#detail-panel').hidden,true);
const checkpointSave=game.saved();assert.equal(checkpointSave.checkpoint.mapId,4);assert.equal(checkpointSave.checkpointMode,'preview');game.click('#menu-button');game.click('#continue-button');assert.equal(game.scene.sim.towers.length,1);game.scene.selectTower(tower);const beforeSell=game.scene.sim.gold;game.click('#sell-button');assert.equal(game.scene.sim.towers.length,0);assert.ok(game.scene.sim.gold>beforeSell);
record('Tower placement, upgrades, priority, sell refund and build-phase continuation work');
const reloaded=await setup(checkpointSave);reloaded.click('#checkpoint-button');assert.equal(reloaded.scene.sim.map.id,4);assert.equal(reloaded.scene.sim.phase,'build');assert.equal(reloaded.scene.sim.towers[0].level,2);assert.equal(reloaded.scene.sim.towers[0].priority,'strong');assert.equal(reloaded.query('#modal-layer').hidden,true);reloaded.dom.window.close();
record('Reload restores the last build phase with map, gold, towers and target priority');
game.click('#start-wave');assert.equal(game.scene.sim.phase,'wave');assert.equal(game.query('#start-wave').disabled,true);game.click('#speed-button');assert.equal(game.scene.speed,2);game.click('#pause-button');assert.equal(game.scene.paused,true);assert.equal(game.query('#pause-overlay').hidden,false);game.click('#resume-button');assert.equal(game.scene.paused,false);
game.key('q');game.key('m');assert.equal(game.scene.abilityTargeting,true);const wisp=game.scene.sim.heroes.find(h=>h.id==='wisp'),wispPoint=[Math.floor(wisp.x/40),Math.floor(wisp.y/40)];assert.equal(game.scene.command(...wispPoint),true);assert.equal(wisp.target.type,'point');game.scene.advance(2);assert.ok(wisp.cooldown>0);assert.match(game.query('[data-hero-cooldown="wisp"]').textContent,/s/);
record('Wave, pause, speed and Wisp ability target mode use the simulation command queue');
const station=game.scene.sim.objectives.find(objective=>objective.kind==='station');
assert.ok(station);assert.equal(game.scene.sim.commandAction('wisp','station',station.id),true);
for(let i=0;i<300&&!station.uses;i++)game.scene.advance(.1);
assert.equal(station.uses,1);assert.ok(station.activeRemaining>0);assert.ok(game.query('[data-objective="region-station"]').textContent.includes('Aktiv'));
record('Regional stations show their real active duration after a companion arrives and channels');
game.click('#menu-button');game.click('#moon-preview');assert.equal(game.scene.sim.map.id,3);assert.equal(game.query('#route-card').hidden,false);assert.ok(game.query('#wave').textContent.includes('/ 10'));assert.equal(game.scene.sim.heroes.length,2);
const mara=game.scene.sim.heroes.find(h=>h.id==='mara'),moonTower=game.scene.place(1,...siteNear(game.scene.sim,mara));assert.ok(moonTower);game.click('#start-wave');game.scene.selectTower(moonTower);game.key('e');assert.equal(game.scene.selectedHero,'mara');game.key('m');assert.equal(mara.target.type,'tower');assert.equal(game.scene.sim.isOverclocked(moonTower),false);assert.equal(mara.cooldown,0);for(let i=0;i<100&&!game.scene.sim.isOverclocked(moonTower);i++)game.scene.advance(.1);assert.equal(game.scene.sim.isOverclocked(moonTower),true);assert.ok(mara.cooldown>29);assert.equal(game.query('#hero-ability').disabled,true);
record('Moon preview is directly playable; Mara walks to the tower before the actual timed boost starts');
game.scene.sim.phase='build';game.scene.sim.wave=10;game.scene.hooks.changed();assert.equal(game.query('#start-wave').disabled,true);assert.ok(game.query('#wave-description').textContent.includes('offenen Runen'));assert.equal(game.query('#mission-overlay').open,true);
record('A cleared final wave with an unfinished required rune displays the remaining mission objective');
game.click('#menu-button');game.query('#menu-dialogue').checked=false;game.query('#menu-dialogue').dispatchEvent(new game.window.Event('change'));assert.equal(game.scene.dialogueEnabled,false);assert.equal(game.saved().dialogue,false);
for(const id of [4,7,10,16,3]){game.click(`[data-preview-map="${id}"]`);game.click('#begin-button');assert.equal(game.scene.sim.map.id,id);assert.equal(game.scene.sim.totalWaves,10);game.click('#menu-button');}
record('Dialogue preference persists and all five curated ten-wave maps start directly');
game.click('[data-preview-map="4"]');game.click('#begin-button');game.scene.sim.phase='victory';game.scene.sim.wave=game.scene.sim.totalWaves;game.scene.sim.events.push({type:'victory'});game.scene.handleEvents();game.advanceClock(500);assert.ok(game.query('.result-modal'));assert.ok(game.query('.result-stars').textContent.includes('★★★'));assert.equal(game.saved().previewStars[4],3);assert.equal(game.saved().stars[4],0);assert.equal(game.saved().completed.length,0);game.click('#result-play');assert.equal(game.query('[data-preview-map="7"]').getAttribute('aria-pressed'),'true');assert.equal(game.query('#begin-button').disabled,false);game.click('#begin-button');assert.equal(game.scene.sim.map.id,7);
record('Standalone wins store separate stars, leave campaign progression untouched and select the next curated map');
game.scene.sim.phase='defeat';game.scene.sim.events.push({type:'defeat'});game.scene.handleEvents();game.click('#menu-button');game.advanceClock(500);assert.ok(game.query('.campaign-menu'));assert.equal(game.window.document.querySelector('.result-modal'),null);game.dom.window.close();record('Opening the campaign cancels delayed result dialogs');
const roster=await setup({tutorial:true,party:['wisp','mara']});assert.equal(roster.query('[data-party="runa"]').disabled,false);assert.equal(roster.query('[data-party="ilyra"]').disabled,false);roster.click('[data-party="wisp"]');assert.equal(roster.query('#begin-button').disabled,true);roster.click('[data-party="runa"]');assert.equal(roster.query('#begin-button').disabled,false);roster.click('#begin-button');assert.deepEqual([...roster.scene.sim.heroes.map(h=>h.id)],['mara','runa']);roster.dom.window.close();record('All four heroes are available immediately; each map uses exactly the chosen two');
const corrupted=await setup({stars:[-1,'broken',100],best:[4.5,null,200],volume:'bad',tutorial:true,party:['toString','unknown'],completed:['4',null,999],checkpoint:{mapId:4,bad:true}});assert.equal(corrupted.window.document.querySelectorAll('[data-preview-map]').length,5);corrupted.click('#checkpoint-button');assert.ok(corrupted.query('.campaign-menu'));assert.equal(corrupted.window.document.querySelector('#checkpoint-button'),null);corrupted.click('#begin-button');assert.equal(corrupted.query('#modal-layer').hidden,true);assert.deepEqual([...corrupted.scene.sim.heroes.map(h=>h.id)],['wisp','mara']);corrupted.dom.window.close();record('Malformed scores, party and checkpoints recover safely');
const oldDraft=await setup({...checkpointSave,checkpoint:{...checkpointSave.checkpoint,mapId:5},checkpointMode:'campaign'});assert.equal(oldDraft.window.document.querySelector('#checkpoint-button'),null);assert.equal(oldDraft.window.document.querySelectorAll('[data-preview-map]').length,5);oldDraft.dom.window.close();record('Checkpoints outside the five curated cards cannot bypass the current playable scope');
console.log(`${checks} UI contract checks passed (simulated DOM and real simulation; no graphical browser rendering).`);
