import Phaser from 'phaser';
import './enemy-preview.css';
import { loadAssets } from './assets';
import { REGION_ASSETS } from './region-assets';
import { WoodlandScene } from './woodland-scene';
import { WoodlandSimulation } from './woodland-simulation';
import { JELLY_ASSET, JELLY_SCALE, JELLY_FRAME_MS, JELLY_STATES, jellyFrame, jellyFrames, type JellyDirection, type JellyState } from './jelly-art';
import type { Assets } from './scene';

// This page imports neither woodland-main nor region-save. Both scenes own
// disposable simulations; their controls never read or write checkpoints.
const $=<T extends HTMLElement=HTMLElement>(id:string)=>document.getElementById(id) as T;
$('app').innerHTML=`<main class="preview-shell">
  <header><div><p class="eyebrow">SPIRE · ANIMIERTE GEGNERPROBE</p><h1>Die Laternenqualle</h1></div><a href="${window.__SPIRE_BUNDLE__?'Spire-Wald.html':'./woodland.html'}">Zum Spiel ↗</a></header>
  <p class="intro">Die abgenommene Laternenqualle mit drei Ansichten, Bewegung, Heilaktion und Tod. Jede Animation lässt sich im Laternenmoor und neben den Originalgegnern ansehen.</p>
  <section class="preview-card" aria-labelledby="moor-heading"><h2 id="moor-heading">Im Laternenmoor</h2>
    <div class="toolbar" aria-label="Animation auswählen"><label for="state">Aktion <select id="state"><option value="move">Bewegen</option><option value="idle">Ruhen</option><option value="heal">Heilen</option><option value="death">Tod</option></select></label><label for="direction">Ansicht <select id="direction"><option value="side">Seitlich</option><option value="down">Nach unten</option><option value="up">Nach oben</option></select></label></div>
    <div class="toolbar" aria-label="Animationssteuerung"><button id="toggle-play" aria-pressed="false">Ⅱ Pause</button><button id="toggle-speed">Tempo 1×</button><button id="step" disabled>Ein Bild weiter</button><button id="toggle-zoom">Ansicht 100 %</button><output id="frame-status" aria-label="Aktuelles Bild">Bild 1 / 6</output></div>
    <div id="preview-game" class="preview-board" aria-label="Moorausschnitt mit Laternenqualle, Original-Flugheuschrecke und Original-Feuerwespe"><div id="loading" class="loading" role="status">Das Laternenmoor erwacht …</div></div>
    <p class="caption">Links: Laternenqualle · Mitte: Original-Flugheuschrecke · Rechts: Original-Feuerwespe. Bei der Heilaktion ruhen die Originalgegner zum Größenvergleich. Mausrad: 100–120 %.</p>
  </section>
  <section class="preview-card" aria-labelledby="scale-heading"><h2 id="scale-heading">Größe und Konturen vergleichen</h2><div class="comparison-wrap"><canvas id="comparison" width="560" height="190" aria-label="Laternenqualle und Original-Flugheuschrecke jeweils in Spielgröße und doppelt vergrößert"></canvas></div><p class="caption">Oben: 1× Spielgröße · unten: 2× zum Prüfen der Pixelgruppen. Bei einem schmaleren Fenster verkleinert sich die gesamte Ansicht proportional.</p></section>
  <section class="preview-card" aria-labelledby="frames-heading"><h2 id="frames-heading">Einzelbilder der gewählten Animation</h2><div id="frame-strip" class="frame-grid"></div><p class="caption" id="strip-caption"></p></section>
  <section class="preview-card" aria-labelledby="combat-heading"><h2 id="combat-heading">Heilwirkung in einer Prüfwelle</h2><p class="caption proof-intro">Eine eigene Moorwelle mit zwei vorbereiteten Türmen. Der Heilimpuls verbindet die Qualle kurz mit bis zu zwei verletzten Gegnern. Die zweite Prüfwelle zeigt die spätere Gegnergruppe.</p><div class="toolbar"><button id="proof-wave-4">Prüfwelle 4 starten</button><button id="proof-wave-7">Prüfwelle 7 starten</button><button id="proof-pause" disabled>Ⅱ Pause</button><button id="proof-speed" disabled>Tempo 1×</button></div><div id="combat-game" class="preview-board" aria-label="Unabhängige Moor-Prüfwelle"></div><p id="proof-status" class="caption" role="status">Eine Prüfwelle auswählen. Dein gespeichertes Spiel wird nicht verändert.</p></section>
  <p class="review-note"><b>48 Rahmen in drei Ansichten.</b> 45 unterschiedliche Posen; die drei Ruhebilder verwenden jeweils das erste Bewegungsbild. Je Ansicht: ein Ruhebild, sechs Bewegungsbilder, vier Heilbilder und fünf Todesbilder. Heilaktion und Tod laufen einmal; Bewegung wiederholt sich.</p>
  <footer>Diese Seite verwendet eigene Vorschauen. Sie liest und verändert keine Spielstände.</footer>
</main>`;

let ready=false,playing=true,tempo=1,frame=0,elapsed=0;
let state:JellyState='move',direction:JellyDirection='side';
let preview:EnemyPreviewScene,proof:CombatPreviewScene;
let proofReady=false,proofStarted=false,heals=0,healedAmount=0;
const comparisonContext=$<HTMLCanvasElement>('comparison').getContext('2d')!;
const stateNames:Record<JellyState,string>={idle:'Ruhen',move:'Bewegen',heal:'Heilen',death:'Tod'};
const directionNames:Record<JellyDirection,string>={side:'seitlich',down:'nach unten',up:'nach oben'};

class EnemyPreviewScene extends WoodlandScene {
  private jelly?:Phaser.GameObjects.Sprite;
  private locust?:Phaser.GameObjects.Sprite;
  private wasp?:Phaser.GameObjects.Sprite;
  protected override createSimulation(){return new WoodlandSimulation('lantern-marsh');}
  protected override click(){/* The visual proof has no game commands. */}
  override create(){
    super.create();this.menu=false;this.input.off('pointermove');
    this.cameras.main.setZoom(1).centerOn(510,265);
    for(const x of [420,510,600])this.add.ellipse(x,224,23,9,0x263e30,.24).setDepth(1000);
    this.jelly=this.add.sprite(420,204,JELLY_ASSET,jellyFrame(state,direction,0)).setScale(JELLY_SCALE).setDepth(4300);
    this.locust=this.add.sprite(510,204,'Flying Locust').setScale(JELLY_SCALE).setDepth(4300);
    this.wasp=this.add.sprite(600,204,'Firewasp').setScale(.65).setDepth(4300);
    for(const [x,label]of [[420,'Laternenqualle'],[510,'Original'],[600,'Original']] as const)this.add.text(x,242,label,{fontFamily:'system-ui',fontSize:'10px',color:'#fff2d0',stroke:'#203b30',strokeThickness:3}).setOrigin(.5).setDepth(5000);
    ready=true;$('loading').hidden=true;this.showSelection();
  }
  override setMapZoom(value:number){this.cameras.main.setZoom(Phaser.Math.Clamp(Math.round(value*100)/100,1,1.2)).centerOn(510,265);if(ready)updateUI();}
  override update(time:number,delta:number){
    super.update(time,delta);if(!ready)return;
    if(playing){
      elapsed+=Math.min(delta,80)*tempo;
      if(!JELLY_STATES[state].loop&&elapsed>=JELLY_STATES[state].count*JELLY_FRAME_MS){elapsed=JELLY_STATES[state].count*JELLY_FRAME_MS-1;playing=false;this.paused=true;updateUI();}
    }
    const index=Math.floor(elapsed/JELLY_FRAME_MS)%JELLY_STATES[state].count;
    if(frame!==index){frame=index;updateUI();}
    this.jelly?.setFrame(jellyFrame(state,direction,elapsed));
    const bob=state==='death'?0:Math.sin(elapsed*.007)*3;
    this.jelly?.setY(204+bob);this.locust?.setY(204+bob);this.wasp?.setY(204+bob);drawComparison();
  }
  showSelection(){
    elapsed=0;frame=0;this.jelly?.setFrame(jellyFrame(state,direction,0));
    const originalState=state==='heal'?'idle':state;
    for(const sprite of [this.locust,this.wasp])if(sprite){const key=`${sprite.texture.key}-${originalState}-${direction}`;if(this.anims.exists(key))sprite.play({key,repeat:JELLY_STATES[originalState].loop?-1:0});}
    drawFrameStrip();updateUI();drawComparison();
  }
  showFrame(value:number){elapsed=value*JELLY_FRAME_MS;frame=value;this.jelly?.setFrame(jellyFrame(state,direction,elapsed));updateUI();drawComparison();}
  originalFrame(){return this.locust?.frame;}
}

class CombatPreviewScene extends WoodlandScene {
  protected override createSimulation(){return new WoodlandSimulation('lantern-marsh');}
  protected override click(){/* Only the visible wave controls start this proof. */}
  override create(){super.create();this.input.off('pointermove');this.menu=false;proofReady=true;}
  startProof(wave:number){
    this.loadMap(1);this.menu=false;this.paused=false;this.sim.wave=wave-1;this.sim.gold=1000;
    const cells:Array<{col:number;row:number;distance:number}>=[];
    for(let row=3;row<=9;row++)for(let col=5;col<=15;col++)if(this.sim.canBuild(col,row))cells.push({col,row,distance:Math.hypot(col*40+20-420,row*40+20-280)});
    cells.sort((a,b)=>a.distance-b.distance);
    for(const [index,cell]of cells.slice(0,2).entries())this.sim.build(index===0?2:1,cell.col,cell.row);
    this.handleEvents();this.sim.startWave();this.handleEvents();proofStarted=true;heals=0;healedAmount=0;
    $<HTMLButtonElement>('proof-pause').disabled=false;$<HTMLButtonElement>('proof-speed').disabled=false;updateProofUI();
  }
  override setMapZoom(){/* The complete combat proof uses the original map view. */}
}

function updateUI(){
  $('toggle-play').textContent=playing?'Ⅱ Pause':(!JELLY_STATES[state].loop&&elapsed>=JELLY_STATES[state].count*JELLY_FRAME_MS-1?'↻ Wiederholen':'▶ Abspielen');
  $('toggle-play').setAttribute('aria-pressed',String(!playing));$('toggle-speed').textContent=`Tempo ${tempo}×`;
  $('toggle-zoom').textContent=`Ansicht ${Math.round(preview.mapZoom*100)} %`;$<HTMLButtonElement>('step').disabled=playing;
  $('frame-status').textContent=`Bild ${frame+1} / ${JELLY_STATES[state].count}`;
  document.querySelectorAll<HTMLElement>('[data-frame]').forEach(card=>card.classList.toggle('active',Number(card.dataset.frame)===frame));
}
function drawFrameStrip(){
  const source=preview.textures.get(JELLY_ASSET).getSourceImage() as HTMLImageElement,frames=jellyFrames(state,direction);
  $('frame-strip').innerHTML=frames.map((_,index)=>`<figure data-frame="${index}"><canvas width="64" height="64" aria-label="${stateNames[state]} ${directionNames[direction]}, Bild ${index+1}"></canvas><figcaption>${index+1} · ${JELLY_FRAME_MS} ms</figcaption></figure>`).join('');
  document.querySelectorAll<HTMLCanvasElement>('[data-frame] canvas').forEach((canvas,index)=>{const ctx=canvas.getContext('2d')!;ctx.imageSmoothingEnabled=false;const atlasFrame=frames[index];ctx.drawImage(source,atlasFrame%8*64,Math.floor(atlasFrame/8)*64,64,64,0,0,64,64);});
  $('strip-caption').textContent=`${stateNames[state]} · ${directionNames[direction]} · 64 × 64 Pixel je Rahmen · Körpermaßstab 0,83 · ${JELLY_STATES[state].count*JELLY_FRAME_MS/1000} Sekunden${JELLY_STATES[state].loop?' pro Zyklus':', einmalig'}.`;
}
function drawComparison(){
  if(!ready)return;
  const ctx=comparisonContext,source=preview.textures.get(JELLY_ASSET).getSourceImage() as HTMLImageElement,original=preview.originalFrame(),atlasFrame=jellyFrame(state,direction,elapsed);
  ctx.imageSmoothingEnabled=false;ctx.clearRect(0,0,560,190);ctx.fillStyle='#304c3b';ctx.fillRect(0,0,560,190);
  ctx.strokeStyle='#526b4f';ctx.beginPath();ctx.moveTo(15,81);ctx.lineTo(545,81);ctx.stroke();ctx.font='12px system-ui';ctx.fillStyle='#d4ddbd';ctx.textAlign='center';ctx.fillText('Laternenqualle',205,18);ctx.fillText('Original-Flugheuschrecke',405,18);
  ctx.textAlign='left';ctx.fillStyle='#adbf9d';ctx.fillText('1×',18,52);ctx.fillText('2×',18,139);
  for(const [multiple,y]of [[1,51],[2,135]]){const size=64*JELLY_SCALE*multiple;ctx.drawImage(source,atlasFrame%8*64,Math.floor(atlasFrame/8)*64,64,64,205-size/2,y-size/2,size,size);if(original)ctx.drawImage(original.source.image as HTMLImageElement,original.cutX,original.cutY,original.cutWidth,original.cutHeight,405-size/2,y-size/2,size,size);}
}
function updateProofUI(){
  if(!proofReady||!proofStarted)return;
  $('proof-pause').textContent=proof.paused?'▶ Fortsetzen':'Ⅱ Pause';$('proof-speed').textContent=`Tempo ${proof.speed}×`;
  const status=proof.sim.phase==='wave'?'läuft':proof.sim.phase==='build'?'abgeschlossen':proof.sim.phase==='defeat'?'beendet':'abgeschlossen';
  $('proof-status').textContent=`Prüfwelle ${proof.sim.wave} ${status} · ${heals} Heilimpulse · ${Math.round(healedAmount)} Lebenspunkte geheilt · ${proof.sim.enemies.length} Gegner unterwegs. Eigener Prüfstand ohne Spielstände.`;
}

$('toggle-play').onclick=()=>{if(ready){if(!playing&&!JELLY_STATES[state].loop&&elapsed>=JELLY_STATES[state].count*JELLY_FRAME_MS-1)preview.showSelection();playing=!playing;preview.paused=!playing;updateUI();}};
$('toggle-speed').onclick=()=>{if(ready){tempo=tempo===1?2:1;preview.speed=tempo;updateUI();}};
$('toggle-zoom').onclick=()=>{if(ready)preview.setMapZoom(preview.mapZoom>1?1:1.2);};
$('step').onclick=()=>{if(ready&&!playing)preview.showFrame((frame+1)%JELLY_STATES[state].count);};
$('state').onchange=()=>{if(ready){state=$<HTMLSelectElement>('state').value as JellyState;preview.showSelection();}};
$('direction').onchange=()=>{if(ready){direction=$<HTMLSelectElement>('direction').value as JellyDirection;preview.showSelection();}};
$('proof-wave-4').onclick=()=>{if(proofReady)proof.startProof(4);};$('proof-wave-7').onclick=()=>{if(proofReady)proof.startProof(7);};
$('proof-pause').onclick=()=>{if(proofReady&&proofStarted){proof.paused=!proof.paused;updateProofUI();}};
$('proof-speed').onclick=()=>{if(proofReady&&proofStarted){proof.speed=proof.speed===1?2:1;updateProofUI();}};
window.addEventListener('keydown',event=>{if(event.code==='Space'&&!event.repeat&&!(event.target instanceof HTMLButtonElement)&&!(event.target instanceof HTMLSelectElement)){event.preventDefault();$('toggle-play').click();}});

try{
  const assets:Assets={...await loadAssets(),...REGION_ASSETS,'Mara style source':{sheetWidth:1254,sheetHeight:1254}};
  preview=new EnemyPreviewScene(assets,{ready(){},changed(){},event(){},select(){},toast(){}});
  new Phaser.Game({type:Phaser.AUTO,parent:'preview-game',width:560,height:320,backgroundColor:'#274734',pixelArt:true,roundPixels:true,scene:[preview],scale:{mode:Phaser.Scale.FIT,autoCenter:Phaser.Scale.CENTER_BOTH},audio:{noAudio:true},render:{antialias:false}});
  proof=new CombatPreviewScene(assets,{ready(){},changed:updateProofUI,event(event){if(event.type==='heal'){heals++;healedAmount+=event.amount??0;}},select(){},toast(){}});
  new Phaser.Game({type:Phaser.AUTO,parent:'combat-game',width:1120,height:640,backgroundColor:'#274734',pixelArt:true,roundPixels:true,scene:[proof],scale:{mode:Phaser.Scale.FIT,autoCenter:Phaser.Scale.CENTER_BOTH},audio:{noAudio:true},render:{antialias:false}});
}catch(error){$('loading').textContent='Die Grafikprobe konnte nicht geladen werden. Bitte Vorschau und Bilddateien prüfen.';console.error(error);}
