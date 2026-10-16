import Phaser from 'phaser';
import './style-preview.css';
import { loadAssets } from './assets';
import { StyleScene, STYLE_WIDTH, STYLE_HEIGHT } from './style-scene';
import { upgradeCost } from './simulation';

const app=document.querySelector<HTMLDivElement>('#app')!;
app.innerHTML=`<main class="preview-shell">
  <header class="preview-header"><div><p class="eyebrow">SPIRE · GRAFIKPROBE M1</p><h1>Die Waldlichtung</h1><p>Ein gemeinsamer Maßstab für Gelände, Wächter und Begleiter.</p></div><a id="original-link" class="quiet-link" href="./">Originalkarten ↗</a></header>
  <div class="preview-layout"><section class="field-section" aria-label="Spielbare Grafikprobe">
    <div class="field-bar"><span id="phase">Die Szene wird geladen …</span><div><span><b id="gold">—</b> Gold</span><span><b id="lives">20</b> Leben</span><span>Welle <b id="wave">0</b></span></div></div>
    <div id="game" aria-label="Waldlichtung: Figur wählen und auf freien Boden klicken"></div>
    <div class="field-controls"><button id="pause" disabled>Ⅱ Pause</button><button id="speed" disabled>1× Tempo</button><button id="reset" class="text-button" disabled>Szene zurücksetzen</button><span id="scale-note">40 Einheiten pro Feld</span></div>
    <p id="toast" class="feedback" role="status" aria-live="polite">Wähle Wisp oder Mara und klicke auf einen freien Platz.</p>
  </section>
  <aside class="preview-sidebar"><section class="control-card"><p class="eyebrow">DEIN DUO</p><h2>Zwei Gefährten.</h2><div class="hero-choices"><button id="wisp" aria-pressed="false" disabled><kbd>Q</kbd><span><strong>Wisp</strong><small>Originalfigur</small></span></button><button id="mara" aria-pressed="true" disabled><kbd>E</kbd><span><strong>Mara</strong><small>Vorhandenes Design</small></span></button></div><p id="hero-state" class="muted">Mara ist ausgewählt.</p><button id="movement" class="wide" disabled>Bewegung zeigen</button><button id="action" class="wide subtle" disabled>Aktionspose zeigen</button></section>
  <section class="control-card"><p class="eyebrow">DIE WÄCHTER</p><h2>Auch im Gefecht.</h2><p>Der Waldwächter steht bereit. Starte die Welle und prüfe Figuren, Wege und Effekte gemeinsam.</p><button id="wave-start" class="wide primary" disabled>Testwelle starten →</button><div class="tower-actions"><button id="build" disabled>Turm bauen <small>75 Gold</small></button><button id="upgrade" disabled>Aufwerten <small>64 Gold</small></button></div><p class="combat-note"><span id="shots">0</span> Schüsse · <span id="kills">0</span> besiegte Gegner</p></section></aside></div>
  <footer class="preview-footer"><span>Originaltiles · einzelne Bäume · animiertes Ufer</span><span>Q/E wählen · Klick bewegen · Leertaste pausieren</span></footer>
  <details class="review-notes"><summary>Was wir hier beurteilen</summary><p>Größe, Perspektive, Konturen und Lesbarkeit im laufenden Spiel. Mara verwendet vier getrennte Richtungen und pro Richtung zwei vorhandene Gehposen; die kurze Schleife ist noch keine vollständig ausgearbeitete Laufanimation. Aktionsposen zeigen die vorhandenen Frames, noch keine fertigen Begleiterfähigkeiten.</p><p>Diese Probe speichert keinen Kampagnenfortschritt. Die drei Originalkarten bleiben separat erreichbar.</p></details>
</main>`;
const element=<T extends HTMLElement=HTMLElement>(id:string)=>document.getElementById(id) as T;
if(window.__SPIRE_BUNDLE__)element<HTMLAnchorElement>('original-link').href='Spire-Original.html';
let scene:StyleScene,ready=false,shots=0,toastTimer:ReturnType<typeof setTimeout>;
function toast(message:string){clearTimeout(toastTimer);element('toast').textContent=message;toastTimer=setTimeout(()=>{element('toast').textContent='Wähle Wisp oder Mara und klicke auf einen freien Platz.';},4000);}
function update(){
  if(!ready||!scene.sim)return;
  const sim=scene.sim;
  element('gold').textContent=String(sim.gold);element('lives').textContent=String(sim.lives);element('wave').textContent=String(sim.wave);
  element('phase').textContent=scene.paused?'Die Lichtung ruht.':sim.phase==='wave'?'Die Schwärme kommen.':sim.phase==='defeat'?'Die Probe ist beendet.':sim.wave?'Welle überstanden.':'Zeit für einen ersten Blick.';
  element('pause').textContent=scene.paused?'▶ Weiter':'Ⅱ Pause';element('speed').textContent=`${scene.speed}× Tempo`;
  element('movement').textContent=scene.movementDemo?'Bewegung anhalten':'Bewegung zeigen';
  for(const id of ['wisp','mara'] as const)element(id).setAttribute('aria-pressed',String(scene.selectedHero===id));
  const hero=scene.actors.find(a=>a.id===scene.selectedHero),direction={left:'links',right:'rechts',up:'oben',down:'unten'};
  element('hero-state').textContent=hero?`${hero.id==='mara'?'Mara':'Wisp'} · ${scene.paused?'pausiert':hero.action?'Aktionspose':hero.path.length?`läuft nach ${direction[hero.direction]}`:'wartet auf dein Ziel'}`:scene.buildId?'Waldwächter · Bauplatz wählen':'Figur oder Turm auswählen';
  element<HTMLButtonElement>('action').disabled=!hero||scene.paused;
  element<HTMLButtonElement>('movement').disabled=scene.paused;
  element<HTMLButtonElement>('wave-start').disabled=scene.paused||sim.phase!=='build';
  element('wave-start').textContent=sim.phase==='wave'?'Die Wächter kämpfen …':sim.wave?'Nächste Testwelle →':'Testwelle starten →';
  const tower=sim.towers[0],cost=tower?upgradeCost(tower):0;
  element<HTMLButtonElement>('upgrade').disabled=!tower||tower.level>=3||sim.gold<cost||scene.paused;
  element('upgrade').innerHTML=tower&&tower.level<3?`Aufwerten <small>${cost} Gold</small>`:'Ausgebaut';
  element<HTMLButtonElement>('build').disabled=sim.gold<75||scene.paused;
  element('shots').textContent=String(shots);element('kills').textContent=String(sim.kills);
}
try{
  const assets=await loadAssets();assets['Mara style source']={sheetWidth:1254,sheetHeight:1254};
  scene=new StyleScene(assets,{ready(){ready=true;scene.menu=false;document.querySelectorAll<HTMLButtonElement>('button').forEach(button=>button.disabled=false);update();},changed:update,select:update,event(event){if(event.type==='fire')shots++;},toast});
  new Phaser.Game({type:Phaser.AUTO,parent:'game',width:STYLE_WIDTH,height:STYLE_HEIGHT,backgroundColor:'#63ab3f',pixelArt:true,roundPixels:true,scene:[scene],scale:{mode:Phaser.Scale.FIT,autoCenter:Phaser.Scale.CENTER_BOTH},audio:{noAudio:true},render:{antialias:false}});
  const on=(id:string,action:()=>void)=>element(id).addEventListener('click',()=>{if(ready){action();update();}});
  on('wisp',()=>scene.selectHero('wisp'));on('mara',()=>scene.selectHero('mara'));
  on('movement',()=>scene.toggleMovement());on('action',()=>scene.showAction());
  on('pause',()=>{scene.paused=!scene.paused;});on('speed',()=>{scene.speed=scene.speed===1?2:1;});
  on('reset',()=>{shots=0;scene.loadMap(0);scene.menu=false;});
  on('wave-start',()=>{scene.sim.startWave();scene.handleEvents();});
  on('build',()=>{scene.chooseBuild(1);toast('Klicke auf eine freie Wiese, um den Waldwächter zu bauen.');});
  on('upgrade',()=>{const tower=scene.sim.towers[0];if(tower){scene.sim.upgrade(tower.uid);scene.handleEvents();}});
  window.addEventListener('keydown',event=>{
    if(!ready||event.repeat)return;
    if(event.code==='Space'){event.preventDefault();scene.paused=!scene.paused;}
    if(event.code==='KeyQ')scene.selectHero('wisp');if(event.code==='KeyE')scene.selectHero('mara');
    if(event.code==='Escape'){scene.selectedHero=undefined;scene.clearSelection();}
    update();
  });
  new ResizeObserver(()=>{const width=element('game').getBoundingClientRect().width;element('scale-note').textContent=width>=STYLE_WIDTH-1?'Spielmaßstab 1:1':`Ansicht ${Math.round(width/STYLE_WIDTH*100)} %`;}).observe(element('game'));
}catch(error){element('phase').textContent='Die Grafikprobe konnte nicht geladen werden.';toast(error instanceof Error?error.message:String(error));console.error(error);}
