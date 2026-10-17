import Phaser from 'phaser';
import './enemy-preview.css';
import './succubus-preview.css';
import { loadAssets } from './assets';
import { REGION_ASSETS } from './region-assets';
import { ENEMIES } from './data';
import { WoodlandScene } from './woodland-scene';
import { WoodlandSimulation } from './woodland-simulation';
import { stats, type Event } from './simulation';
import { ROSENSPIEGEL, SUCCUBUS_CHARM } from './succubus';
import { SUCCUBUS_ASSET, SUCCUBUS_SCALE, SUCCUBUS_STATES, SUCCUBUS_DANCE_ASSET, SUCCUBUS_DANCE_FRAME_SIZE, SUCCUBUS_DANCE_SCALE, succubusFrame, succubusFrames, succubusDanceFrame, type SuccubusDirection, type SuccubusState } from './succubus-art';
import type { Assets } from './scene';

// Independent visual and combat scenes. This page imports no save module and
// uses ordinary simulation commands for every combat demonstration.
const $=<T extends HTMLElement=HTMLElement>(id:string)=>document.getElementById(id) as T;
const seconds=(value:number)=>value.toLocaleString('de-DE');
$('app').innerHTML=`<main class="preview-shell succubus-shell">
  <header><div><p class="eyebrow">SPIRE · ROSENSPIEGEL</p><h1>Ein gefährlicher Augenblick</h1></div><a href="${window.__SPIRE_BUNDLE__?'Spire-Wald.html':'./woodland.html'}">Zum Spiel ↗</a></header>
  <p class="intro">Die pinkhaarige Succubus aus Entwurf 3: drei Gehansichten, Todesanimation und ein langsamer Verführungstanz mit dem Gesicht zum Betrachter. Ihr Herzfaden lenkt einen Turm ab.</p>
  <section class="preview-card" aria-labelledby="wind-heading"><h2 id="wind-heading">Auf den Inseln von Windbruch</h2>
    <div class="toolbar"><label for="state">Aktion <select id="state"><option value="move">Bewegen</option><option value="idle">Ruhen</option><option value="dance">Verführungstanz</option><option value="death">Tod</option></select></label><label for="direction">Ansicht <select id="direction"><option value="side">Seitlich</option><option value="down">Nach unten</option><option value="up">Nach oben</option></select></label></div>
    <div class="toolbar"><button id="toggle-play" aria-pressed="false">Ⅱ Pause</button><button id="toggle-speed">Tempo 1×</button><button id="step" disabled>Ein Bild weiter</button><button id="toggle-zoom">Ansicht 100 %</button><output id="frame-status" aria-label="Aktuelles Bild">Bild 1 / ${SUCCUBUS_STATES.move.count}</output></div>
    <div id="preview-game" class="preview-board" aria-label="Windbruch-Ausschnitt mit Rosenspiegel neben Wisp und Mara"><div id="loading" class="loading" role="status">Die Wolken ziehen auf …</div></div>
    <p class="caption">Wisp links · Rosenspiegel in der Mitte · Mara rechts. Alle drei stehen im tatsächlichen Spielmaßstab. Mausrad: 100–120 %.</p>
    <div id="dance-detail" class="dance-detail" hidden><canvas id="dance-portrait" width="176" height="160" aria-label="Verführungstanz mit feineren Pixeln wie im Tanzfenster der Kampfansicht"></canvas><div><h3>Ein genauerer Blick</h3><p class="caption">Das Tanzfenster verwendet eine eigene, feinere Animation. Die Figur auf der Karte behält ihre gut lesbare Spielgröße. Beide tanzen im gleichen Takt; Pause und Einzelbilder gelten auch hier.</p></div></div>
  </section>
  <section class="preview-card" aria-labelledby="scale-heading"><h2 id="scale-heading">Größe und Pixelkonturen</h2><div class="comparison-wrap"><canvas id="comparison" width="560" height="190" aria-label="Rosenspiegel, Mara und Original-Blattkäfer jeweils in Spielgröße und doppelt vergrößert"></canvas></div><p class="caption">Oben: 1× Spielgröße · unten: 2× für die Pixelgruppen. Der Ausschnitt skaliert bei schmalen Fenstern gemeinsam mit der Seite.</p></section>
  <section class="preview-card" aria-labelledby="frames-heading"><h2 id="frames-heading">Einzelbilder der gewählten Animation</h2><div id="frame-strip" class="frame-grid"></div><p class="caption" id="strip-caption"></p></section>
  <section class="preview-card" aria-labelledby="combat-heading"><h2 id="combat-heading">Augen nur für sie</h2><p class="caption proof-intro">Eine kurze, vorbereitete Begegnung zeigt die Fähigkeit direkt. Der Frostkristall kann erst auf 126 Entfernung schießen; Rosenspiegel beginnt ihren Tanz bereits auf ${SUCCUBUS_CHARM.range}. Nach ${seconds(SUCCUBUS_CHARM.windup)} Sekunden Vorbereitung schießt der verführte Turm ${seconds(SUCCUBUS_CHARM.channel)} Sekunden lang ${Math.round((1-SUCCUBUS_CHARM.rateMultiplier)*100)} % langsamer. Der vergrößerte Tanz zeigt sie von vorn. Ein Fernkämpfer kann den Tanz durch einen Abschuss beenden.</p>
    <div class="toolbar"><button id="proof-demo" class="primary">♥ Verführung zeigen</button><button id="proof-still">Verführung als Standbild</button><button id="proof-wave-6">Prüfwelle 6</button><button id="proof-wave-9">Prüfwelle 9</button></div>
    <div class="toolbar"><button id="proof-pause" disabled>Ⅱ Pause</button><button id="proof-speed" disabled>Tempo 1×</button><button id="proof-counter" disabled>Fernkampf-Konter hinzufügen</button><button id="proof-sell" disabled>Zielturm verkaufen</button></div>
    <div id="combat-game" class="preview-board" aria-label="Eigene Windbruch-Begegnung mit echten Türmen, Gegnern und Herzfaden"></div>
    <p id="proof-status" class="caption" role="status">„Verführung zeigen“ startet die kurze Begegnung. Jede Probe beginnt mit eigenen 1.000 Gold und verändert keine Spielstände.</p><p id="proof-event" class="caption proof-event" aria-live="polite">Eine Begegnung auswählen.</p>
  </section>
  <p class="review-note"><b>Bewegung und Fähigkeit gehören zusammen.</b> Sie bleibt beim Tanz stehen; der pinke Herzfaden markiert genau einen Turm. Nach dem Tanz oder einem Abbruch ist dieser ${seconds(SUCCUBUS_CHARM.recovery)} Sekunden gegen eine erneute Verführung geschützt. „Verführung als Standbild“ startet die echte Begegnung und pausiert beim ersten aktiven Herzfaden; „Fortsetzen“ lässt sie weiterlaufen.</p>
  <footer>Eigene Vorschau ohne gespeicherte Fortschritte. Raumtaste pausiert die Animationsprobe; die Kampfprobe hat ihre eigene Pause.</footer>
</main>`;

let ready=false,playing=true,tempo=1,frame=0,elapsed=0;
let state:SuccubusState='move',direction:SuccubusDirection='side';
let preview:SuccubusPreviewScene,proof:CombatPreviewScene;
let proofReady=false,proofStarted=false,starts=0,charms=0,interruptions=0,completed=0;
let pauseAtCharm=false;
let lastCharmStatus='Eine Begegnung auswählen.';
const comparisonContext=$<HTMLCanvasElement>('comparison').getContext('2d')!;
const danceContext=$<HTMLCanvasElement>('dance-portrait').getContext('2d')!;
const stateNames:Record<SuccubusState,string>={idle:'Ruhen',move:'Bewegen',dance:'Verführungstanz',death:'Tod'};
const directionNames:Record<SuccubusDirection,string>={side:'seitlich',down:'nach unten',up:'nach oben'};

class SuccubusPreviewScene extends WoodlandScene {
  private succubus?:Phaser.GameObjects.Sprite;
  protected override createSimulation(){
    const sim=new WoodlandSimulation('windbreak');
    sim.heroes[0].x=430;sim.heroes[0].y=220;sim.heroes[1].x=610;sim.heroes[1].y=220;
    return sim;
  }
  protected override click(){/* The visual sample issues no game orders. */}
  override create(){
    super.create();this.menu=false;this.input.off('pointermove');
    this.cameras.main.setZoom(1).centerOn(530,200);
    this.add.ellipse(520,222,23,9,0x263e30,.24).setDepth(1000);
    this.succubus=this.add.sprite(520,220,SUCCUBUS_ASSET,succubusFrame(state,direction,0)).setOrigin(.5,56/64).setScale(SUCCUBUS_SCALE).setDepth(4300);
    this.add.text(520,239,'Rosenspiegel',{fontFamily:'system-ui',fontSize:'10px',color:'#ffe0ee',stroke:'#45354b',strokeThickness:3}).setOrigin(.5).setDepth(5000);
    ready=true;$('loading').hidden=true;this.showSelection();
  }
  override setMapZoom(value:number){this.cameras.main.setZoom(Phaser.Math.Clamp(Math.round(value*100)/100,1,1.2)).centerOn(530,200);if(ready)updateUI();}
  override update(time:number,delta:number){
    super.update(time,delta);if(!ready)return;
    const config=SUCCUBUS_STATES[state];
    if(playing){
      elapsed+=Math.min(delta,80)*tempo;
      if(!config.loop&&elapsed>=config.count*config.frameMs){elapsed=config.count*config.frameMs-1;playing=false;this.paused=true;updateUI();}
    }
    const index=Math.floor(elapsed/config.frameMs)%config.count;
    if(frame!==index){frame=index;updateUI();}
    this.succubus?.setFrame(succubusFrame(state,direction,elapsed));drawComparison();
  }
  showSelection(){
    if(state==='dance')direction='down';
    $<HTMLSelectElement>('direction').value=direction;$<HTMLSelectElement>('direction').disabled=state==='dance';
    $('dance-detail').hidden=state!=='dance';
    elapsed=0;frame=0;this.succubus?.setFrame(succubusFrame(state,direction,0));drawFrameStrip();updateUI();drawComparison();
  }
  showFrame(value:number){elapsed=value*SUCCUBUS_STATES[state].frameMs;frame=value;this.succubus?.setFrame(succubusFrame(state,direction,elapsed));updateUI();drawComparison();}
}

class ProofSimulation extends WoodlandSimulation {
  constructor(private readonly shortEncounter:boolean){super('windbreak');}
  override compositionForWave(wave:number){
    return this.shortEncounter?[{type:ENEMIES[3],boss:false},{type:ROSENSPIEGEL,boss:false},{type:ENEMIES[2],boss:false}]:super.compositionForWave(wave);
  }
}

class CombatPreviewScene extends WoodlandScene {
  private shortEncounter=true;
  private counterAdded=false;
  protected override createSimulation(){return new ProofSimulation(this.shortEncounter);}
  protected override click(){/* Visible controls own this disposable encounter. */}
  override create(){super.create();this.input.off('pointermove');this.menu=false;proofReady=true;}
  startProof(wave?:number,freezeAtCharm=false){
    pauseAtCharm=freezeAtCharm;
    this.shortEncounter=wave===undefined;this.counterAdded=false;
    proofStarted=false;this.loadMap(3);this.menu=false;this.paused=false;this.sim.wave=(wave??6)-1;this.sim.gold=1000;
    this.sim.build(2,6,8);
    if(wave!==undefined){this.sim.build(4,11,5);this.sim.build(6,15,10);}
    this.handleEvents();this.sim.startWave();this.handleEvents();
    starts=0;charms=0;interruptions=0;completed=0;proofStarted=true;
    lastCharmStatus=this.shortEncounter?'Die Gruppe nähert sich dem Frostkristall.':'Gemischte Prüfwelle mit einer Rosenspiegel-Einheit.';
    this.cameras.main.setZoom(this.shortEncounter?1:.5).centerOn(this.shortEncounter?280:560,this.shortEncounter?300:320);
    updateProofUI();
  }
  addCounter(){
    if(!proofStarted||this.counterAdded||this.sim.phase!=='wave')return;
    // Ordinary ranged towers, paid for by this scene's visible proof budget.
    let built=0;for(const [col,row]of [[4,9],[5,8]])if(this.sim.build(4,col,row))built++;
    this.counterAdded=built>0;this.handleEvents();
    lastCharmStatus=built?'Fernkampf-Konter aufgebaut: Scharfschützen erreichen sie schon während des Tanzes.':'An diesen Stellen ist gerade kein Bau möglich.';updateProofUI();
  }
  sellTarget(){
    const caster=this.sim.enemies.find(enemy=>enemy.charmAction);
    if(caster?.charmAction&&this.sim.sell(caster.charmAction.targetUid))this.handleEvents();updateProofUI();
  }
  override setMapZoom(){/* Keep each combat encounter at its chosen overview. */}
}

function updateUI(){
  const config=SUCCUBUS_STATES[state],ended=!config.loop&&elapsed>=config.count*config.frameMs-1;
  $('toggle-play').textContent=playing?'Ⅱ Pause':ended?'↻ Wiederholen':'▶ Abspielen';
  $('toggle-play').setAttribute('aria-pressed',String(!playing));$('toggle-speed').textContent=`Tempo ${tempo}×`;
  $('toggle-zoom').textContent=`Ansicht ${Math.round(preview.mapZoom*100)} %`;$<HTMLButtonElement>('step').disabled=playing;
  $('frame-status').textContent=`Bild ${frame+1} / ${config.count}`;
  document.querySelectorAll<HTMLElement>('[data-frame]').forEach(card=>card.classList.toggle('active',Number(card.dataset.frame)===frame));
}
function drawFrameStrip(){
  const isDance=state==='dance',size=isDance?SUCCUBUS_DANCE_FRAME_SIZE:64;
  const source=preview.textures.get(isDance?SUCCUBUS_DANCE_ASSET:SUCCUBUS_ASSET).getSourceImage() as HTMLImageElement,config=SUCCUBUS_STATES[state];
  const frames=isDance?Array.from({length:config.count},(_,index)=>index):succubusFrames(state,direction);
  $('frame-strip').classList.toggle('dance-frames',isDance);
  $('frame-strip').innerHTML=frames.map((_,index)=>`<figure data-frame="${index}"><canvas width="${size}" height="${size}" aria-label="${stateNames[state]} ${isDance?'Tanzfenster':directionNames[direction]}, Bild ${index+1}"></canvas><figcaption>${index+1} · ${config.frameMs} ms</figcaption></figure>`).join('');
  document.querySelectorAll<HTMLCanvasElement>('[data-frame] canvas').forEach((canvas,index)=>{const ctx=canvas.getContext('2d')!;ctx.imageSmoothingEnabled=false;const atlasFrame=frames[index];ctx.drawImage(source,atlasFrame%8*size,Math.floor(atlasFrame/8)*size,size,size,0,0,size,size);});
  $('strip-caption').textContent=`${stateNames[state]} · ${isDance?'Feine Tanzfenster-Bilder, Bühnenfront zum Betrachter':directionNames[direction]} · ${seconds(config.count*config.frameMs/1000)} Sekunden${config.loop?' pro Zyklus':', einmalig'}.`;
}
function drawComparison(){
  if(!ready)return;
  const ctx=comparisonContext,source=preview.textures.get(SUCCUBUS_ASSET).getSourceImage() as HTMLImageElement,atlasFrame=succubusFrame(state,direction,elapsed);
  const mara=preview.textures.getFrame('style-mara',direction==='up'?12:direction==='side'?8:0),leaf=preview.textures.getFrame('Leafbug',0);
  ctx.imageSmoothingEnabled=false;ctx.clearRect(0,0,560,190);ctx.fillStyle='#303b43';ctx.fillRect(0,0,560,190);
  ctx.strokeStyle='#62706a';ctx.beginPath();ctx.moveTo(15,81);ctx.lineTo(545,81);ctx.stroke();ctx.font='12px system-ui';ctx.fillStyle='#e7d9dc';ctx.textAlign='center';
  for(const [x,label]of [[150,'Rosenspiegel'],[320,'Mara'],[475,'Original-Blattkäfer']] as const)ctx.fillText(label,x,18);
  ctx.textAlign='left';ctx.fillStyle='#b8b7be';ctx.fillText('1×',18,52);ctx.fillText('2×',18,139);
  for(const [multiple,foot]of [[1,71],[2,174]]){
    const size=64*SUCCUBUS_SCALE*multiple;
    ctx.drawImage(source,atlasFrame%8*64,Math.floor(atlasFrame/8)*64,64,64,150-size/2,foot-56*multiple,size,size);
    if(mara)ctx.drawImage(mara.source.image as HTMLImageElement,mara.cutX,mara.cutY,mara.cutWidth,mara.cutHeight,320-32*multiple,foot-56*multiple,64*multiple,64*multiple);
    if(leaf){const size=64*.83*multiple;ctx.drawImage(leaf.source.image as HTMLImageElement,leaf.cutX,leaf.cutY,leaf.cutWidth,leaf.cutHeight,475-size/2,foot-36*multiple,size,size);}
  }
  if(state==='dance')drawDancePreview();
}
function drawDancePreview(){
  const ctx=danceContext,size=SUCCUBUS_DANCE_FRAME_SIZE,displaySize=size*SUCCUBUS_DANCE_SCALE;
  const source=preview.textures.get(SUCCUBUS_DANCE_ASSET).getSourceImage() as HTMLImageElement;
  ctx.imageSmoothingEnabled=false;ctx.clearRect(0,0,176,160);
  ctx.fillStyle='#291b37';ctx.fillRect(0,0,176,160);
  ctx.fillStyle='#170d25';ctx.beginPath();ctx.ellipse(88,140,28,5,0,0,Math.PI*2);ctx.fill();
  ctx.drawImage(source,succubusDanceFrame(elapsed)*size,0,size,size,(176-displaySize)/2,136-112*SUCCUBUS_DANCE_SCALE,displaySize,displaySize);
}
function receiveEvent(event:Event){
  if(!proofStarted)return;
  if(event.type==='charm-start'){
    starts++;const outside=!!event.enemy&&!!event.tower&&Math.hypot(event.enemy.x-event.tower.x,event.enemy.y-event.tower.y)>stats(event.tower).range;
    lastCharmStatus=`Rosenspiegel beginnt ihren Tanz${outside?' außerhalb der Schussreichweite ihres Zielturms':''}.`;
  }else if(event.type==='charm'){
    charms++;lastCharmStatus=`♥ Verführt! Der verbundene Turm schießt ${seconds(SUCCUBUS_CHARM.channel)} Sekunden lang langsamer.`;
    if(pauseAtCharm){pauseAtCharm=false;proof.paused=true;lastCharmStatus+=' Standbild pausiert – „Fortsetzen“ lässt den Tanz weiterlaufen.';}
  }
  else if(event.type==='charm-end'){
    if(event.reason==='complete'){completed++;lastCharmStatus=`Der Tanz ist vorbei. Der Turm ist jetzt ${seconds(SUCCUBUS_CHARM.recovery)} Sekunden gegen Verführung geschützt.`;}
    else{interruptions++;const reasons={kill:'durch Abschuss',escape:'am Routenausgang',range:'wegen zu großer Entfernung',sold:'durch Verkauf des Zielturms','wave-end':'am Wellenende'};lastCharmStatus=`Verführung abgebrochen ${event.reason?reasons[event.reason]:'im Kampf'}.`;}
  }
  updateProofUI();
}
function updateProofUI(){
  if(!proofReady||!proofStarted)return;
  const running=proof.sim.phase==='wave',target=proof.sim.enemies.some(enemy=>enemy.charmAction);
  for(const id of ['proof-pause','proof-speed'])$<HTMLButtonElement>(id).disabled=!running;
  $<HTMLButtonElement>('proof-counter').disabled=!running||proof.sim.towers.some(t=>t.col===4&&t.row===9);
  $<HTMLButtonElement>('proof-sell').disabled=!running||!target;
  $('proof-pause').textContent=proof.paused?'▶ Fortsetzen':'Ⅱ Pause';$('proof-speed').textContent=`Tempo ${proof.speed}×`;
  $('proof-status').textContent=`${running?'Begegnung läuft':'Begegnung beendet'} · ${starts} Tanzbeginne · ${charms} Verführungen · ${completed} beendet · ${interruptions} Abbrüche · ${proof.sim.enemies.length} Gegner · ${proof.sim.gold} Gold.`;
  $('proof-event').textContent=lastCharmStatus;
}

$('toggle-play').onclick=()=>{if(ready){const config=SUCCUBUS_STATES[state];if(!playing&&!config.loop&&elapsed>=config.count*config.frameMs-1)preview.showSelection();playing=!playing;preview.paused=!playing;updateUI();}};
$('toggle-speed').onclick=()=>{if(ready){tempo=tempo===1?2:1;preview.speed=tempo;updateUI();}};
$('toggle-zoom').onclick=()=>{if(ready)preview.setMapZoom(preview.mapZoom>1?1:1.2);};
$('step').onclick=()=>{if(ready&&!playing)preview.showFrame((frame+1)%SUCCUBUS_STATES[state].count);};
$('state').onchange=()=>{if(ready){state=$<HTMLSelectElement>('state').value as SuccubusState;preview.showSelection();}};
$('direction').onchange=()=>{if(ready){direction=$<HTMLSelectElement>('direction').value as SuccubusDirection;preview.showSelection();}};
$('proof-demo').onclick=()=>{if(proofReady)proof.startProof();};
$('proof-still').onclick=()=>{if(proofReady)proof.startProof(undefined,true);};
$('proof-wave-6').onclick=()=>{if(proofReady)proof.startProof(6);};$('proof-wave-9').onclick=()=>{if(proofReady)proof.startProof(9);};
$('proof-counter').onclick=()=>{if(proofReady)proof.addCounter();};$('proof-sell').onclick=()=>{if(proofReady)proof.sellTarget();};
$('proof-pause').onclick=()=>{if(proofReady&&proofStarted){proof.paused=!proof.paused;updateProofUI();}};
$('proof-speed').onclick=()=>{if(proofReady&&proofStarted){proof.speed=proof.speed===1?2:1;updateProofUI();}};
window.addEventListener('keydown',event=>{if(event.code==='Space'&&!event.repeat&&!(event.target instanceof HTMLButtonElement)&&!(event.target instanceof HTMLSelectElement)){event.preventDefault();$('toggle-play').click();}});

try{
  const assets:Assets={...await loadAssets(),...REGION_ASSETS,'Mara style source':{sheetWidth:1254,sheetHeight:1254}};
  preview=new SuccubusPreviewScene(assets,{ready(){},changed(){},event(){},select(){},toast(){}});
  new Phaser.Game({type:Phaser.AUTO,parent:'preview-game',width:560,height:320,backgroundColor:'#575c82',pixelArt:true,roundPixels:true,scene:[preview],scale:{mode:Phaser.Scale.FIT,autoCenter:Phaser.Scale.CENTER_BOTH},audio:{noAudio:true},render:{antialias:false}});
  proof=new CombatPreviewScene(assets,{ready(){},changed:updateProofUI,event:receiveEvent,select(){},toast(){}});
  new Phaser.Game({type:Phaser.AUTO,parent:'combat-game',width:560,height:320,backgroundColor:'#575c82',pixelArt:true,roundPixels:true,scene:[proof],scale:{mode:Phaser.Scale.FIT,autoCenter:Phaser.Scale.CENTER_BOTH},audio:{noAudio:true},render:{antialias:false}});
}catch(error){$('loading').textContent='Die Succubus-Probe konnte nicht geladen werden. Bitte Vorschau und Bilddateien prüfen.';console.error(error);}
