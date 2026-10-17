import Phaser from 'phaser';
import './enemy-preview.css';
import { loadAssets } from './assets';
import { REGION_ASSETS } from './region-assets';
import { WoodlandScene } from './woodland-scene';
import { WoodlandSimulation } from './woodland-simulation';
import type { Assets } from './scene';

// This page deliberately imports neither woodland-main nor region-save. The
// proof has its own simulation, no waves and no access to player checkpoints.
const JELLY='Lantern Jelly Pixel Preview v1';
const FRAME_MS=100;
const SCALE=.83;
const $=<T extends HTMLElement=HTMLElement>(id:string)=>document.getElementById(id) as T;
$('app').innerHTML=`<main class="preview-shell">
  <header><div><p class="eyebrow">SPIRE · ERSTE GEGNERPROBE</p><h1>Die Laternenqualle</h1></div><a href="${window.__SPIRE_BUNDLE__?'Spire-Wald.html':'./woodland.html'}">Zum Spiel ↗</a></header>
  <p class="intro">Ein schwebender Moorheiler im Stil der vorhandenen Gegner. Diese Grafikprobe zeigt zunächst eine seitliche Bewegung mit sechs Bildern im echten Laternenmoor.</p>
  <section class="preview-card" aria-labelledby="moor-heading"><h2 id="moor-heading">Im Laternenmoor</h2>
    <div class="toolbar" aria-label="Animationssteuerung"><button id="toggle-play" aria-pressed="false">Ⅱ Pause</button><button id="toggle-speed">Tempo 1×</button><button id="step" disabled>Ein Bild weiter</button><button id="toggle-zoom">Ansicht 100 %</button><output id="frame-status" aria-label="Aktuelles Bild">Bild 1 / 6</output></div>
    <div id="preview-game" class="preview-board" aria-label="Moorausschnitt mit Laternenqualle, Original-Flugheuschrecke und Original-Feuerwespe"><div id="loading" class="loading" role="status">Das Laternenmoor erwacht …</div></div>
    <p class="caption">Links: neuer Entwurf · Mitte: Original-Flugheuschrecke · Rechts: Original-Feuerwespe. Ausschnitt der bestehenden Karte mit ihrem Licht, Wasser und ihren Dekorationen. Mausrad: 100–120 %.</p>
  </section>
  <section class="preview-card" aria-labelledby="scale-heading"><h2 id="scale-heading">Größe und Konturen vergleichen</h2><div class="comparison-wrap"><canvas id="comparison" width="560" height="190" aria-label="Animierte Laternenqualle und Original-Flugheuschrecke jeweils in Spielgröße und doppelt vergrößert"></canvas></div><p class="caption">Oben: 1× Spielgröße · unten: 2× zum Prüfen der Pixelgruppen. Bei einem schmaleren Fenster verkleinert sich die gesamte Ansicht proportional.</p></section>
  <section class="preview-card" aria-labelledby="frames-heading"><h2 id="frames-heading">Die sechs Bewegungsbilder</h2><div class="frame-grid">${Array.from({length:6},(_,i)=>`<figure data-frame="${i}"><canvas width="64" height="64" aria-label="Bewegungsbild ${i+1}"></canvas><figcaption>${i+1} · ${FRAME_MS} ms</figcaption></figure>`).join('')}</div><p class="caption">64 × 64 Pixel je Rahmen · Körpermaßstab 0,83 · ein kompletter Zyklus dauert 0,6 Sekunden. Die Rahmen sind hier zur Prüfung vergrößert.</p></section>
  <p class="review-note"><b>Grafikprobe zur Beurteilung.</b> Zu prüfen sind Stil, Größe und ein ruhiger, zusammenhängender Bewegungszyklus. Weitere Ansichten, Heilaktion und Tod folgen nach der visuellen Abnahme.</p>
  <footer>Diese Seite verwendet eine eigene Vorschau. Sie liest und verändert keine Spielstände.</footer>
</main>`;

let ready=false;
let playing=true;
let tempo=1;
let frame=0;
let elapsed=0;
let preview:EnemyPreviewScene;
let comparisonContext=$<HTMLCanvasElement>('comparison').getContext('2d')!;

class EnemyPreviewScene extends WoodlandScene {
  private jelly?:Phaser.GameObjects.Sprite;
  private locust?:Phaser.GameObjects.Sprite;
  private wasp?:Phaser.GameObjects.Sprite;
  protected override createSimulation(){return new WoodlandSimulation('lantern-marsh');}
  protected override click(){/* A visual proof has no game commands. */}
  override create(){
    super.create();
    this.menu=false;
    this.input.off('pointermove');
    this.cameras.main.setZoom(1).centerOn(510,265);
    this.add.ellipse(420,224,23,9,0x263e30,.24).setDepth(1000);
    this.add.ellipse(510,224,23,9,0x263e30,.24).setDepth(1000);
    this.add.ellipse(600,224,23,9,0x263e30,.24).setDepth(1000);
    this.jelly=this.add.sprite(420,204,JELLY,0).setScale(SCALE).setDepth(4300);
    this.locust=this.add.sprite(510,204,'Flying Locust').setScale(SCALE).setDepth(4300).play('Flying Locust-move-side');
    this.wasp=this.add.sprite(600,204,'Firewasp').setScale(.65).setDepth(4300).play('Firewasp-move-side');
    for(const [x,label]of [[420,'Laternenqualle'],[510,'Original'],[600,'Original']] as const)this.add.text(x,242,label,{fontFamily:'system-ui',fontSize:'10px',color:'#fff2d0',stroke:'#203b30',strokeThickness:3}).setOrigin(.5).setDepth(5000);
    drawFrameStrip(this.textures.get(JELLY).getSourceImage() as HTMLImageElement);
    ready=true;
    $('loading').hidden=true;
    updateUI();
    drawComparison();
  }
  override setMapZoom(value:number){
    this.cameras.main.setZoom(Phaser.Math.Clamp(Math.round(value*100)/100,1,1.2)).centerOn(510,265);
    if(ready)updateUI();
  }
  override update(time:number,delta:number){
    super.update(time,delta);
    if(!ready)return;
    if(playing)elapsed+=Math.min(delta,80)*tempo;
    const next=Math.floor(elapsed/FRAME_MS)%6;
    if(frame!==next){frame=next;this.jelly?.setFrame(frame);updateUI();}
    const bob=Math.sin(elapsed*.007)*3;
    this.jelly?.setY(204+bob);
    this.locust?.setY(204+bob);
    this.wasp?.setY(204+bob);
    drawComparison();
  }
  showFrame(value:number){elapsed=value*FRAME_MS;frame=value;this.jelly?.setFrame(frame);updateUI();drawComparison();}
  originalFrame(){return this.locust?.frame;}
}

function updateUI(){
  $('toggle-play').textContent=playing?'Ⅱ Pause':'▶ Abspielen';
  $('toggle-play').setAttribute('aria-pressed',String(!playing));
  $('toggle-speed').textContent=`Tempo ${tempo}×`;
  $('toggle-zoom').textContent=`Ansicht ${Math.round(preview.mapZoom*100)} %`;
  $<HTMLButtonElement>('step').disabled=playing;
  $('frame-status').textContent=`Bild ${frame+1} / 6`;
  document.querySelectorAll<HTMLElement>('[data-frame]').forEach(card=>card.classList.toggle('active',Number(card.dataset.frame)===frame));
}
function drawFrameStrip(source:HTMLImageElement){
  document.querySelectorAll<HTMLCanvasElement>('[data-frame] canvas').forEach((canvas,index)=>{
    const ctx=canvas.getContext('2d')!;ctx.imageSmoothingEnabled=false;
    ctx.drawImage(source,index*64,0,64,64,0,0,64,64);
  });
}
function drawComparison(){
  if(!ready)return;
  const ctx=comparisonContext,source=preview.textures.get(JELLY).getSourceImage() as HTMLImageElement,original=preview.originalFrame();
  ctx.imageSmoothingEnabled=false;ctx.clearRect(0,0,560,190);
  ctx.fillStyle='#304c3b';ctx.fillRect(0,0,560,190);
  ctx.strokeStyle='#526b4f';ctx.beginPath();ctx.moveTo(15,81);ctx.lineTo(545,81);ctx.stroke();
  ctx.font='12px system-ui';ctx.fillStyle='#d4ddbd';ctx.textAlign='center';ctx.fillText('Laternenqualle',205,18);ctx.fillText('Original-Flugheuschrecke',405,18);
  ctx.textAlign='left';ctx.fillStyle='#adbf9d';ctx.fillText('1×',18,52);ctx.fillText('2×',18,139);
  for(const [multiple,y]of [[1,51],[2,135]]){
    const size=64*SCALE*multiple;
    ctx.drawImage(source,frame*64,0,64,64,205-size/2,y-size/2,size,size);
    if(original)ctx.drawImage(original.source.image as HTMLImageElement,original.cutX,original.cutY,original.cutWidth,original.cutHeight,405-size/2,y-size/2,size,size);
  }
}

$('toggle-play').onclick=()=>{if(ready){playing=!playing;preview.paused=!playing;updateUI();}};
$('toggle-speed').onclick=()=>{if(ready){tempo=tempo===1?2:1;preview.speed=tempo;updateUI();}};
$('toggle-zoom').onclick=()=>{if(ready)preview.setMapZoom(preview.mapZoom>1?1:1.2);};
$('step').onclick=()=>{if(ready&&!playing)preview.showFrame((frame+1)%6);};
window.addEventListener('keydown',event=>{
  if(event.code==='Space'&&!event.repeat&&!(event.target instanceof HTMLButtonElement)){event.preventDefault();$('toggle-play').click();}
});

try{
  const assets:Assets={...await loadAssets(),...REGION_ASSETS,'Mara style source':{sheetWidth:1254,sheetHeight:1254},[JELLY]:{sheetWidth:384,sheetHeight:64,width:64,height:64,cols:6,rows:1}};
  preview=new EnemyPreviewScene(assets,{ready(){},changed(){},event(){},select(){},toast(){}});
  new Phaser.Game({type:Phaser.AUTO,parent:'preview-game',width:560,height:320,backgroundColor:'#274734',pixelArt:true,roundPixels:true,scene:[preview],scale:{mode:Phaser.Scale.FIT,autoCenter:Phaser.Scale.CENTER_BOTH},audio:{noAudio:true},render:{antialias:false}});
}catch(error){$('loading').textContent='Die Grafikprobe konnte nicht geladen werden. Bitte Vorschau und Bilddateien prüfen.';console.error(error);}
