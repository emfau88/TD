import Phaser from 'phaser';
import './woodland.css';
import { TOWERS, ENEMIES, WIDTH, HEIGHT, type Priority } from './data';
import { stats, upgradeCost, sellValue, type Event } from './simulation';
import { WoodlandScene } from './woodland-scene';
import { type CompanionID } from './woodland-simulation';
import { REGIONS, getRegion, type RegionID } from './regions';
import { SAVE_KEY, decodeRegionSave } from './region-save';
import { REGION_ASSETS } from './region-assets';
import { REGION_WAVE_COUNT } from './region-waves';
import { loadAssets, assetUrl } from './assets';
import { AudioEngine } from './audio';

function readSave(){
  try{return decodeRegionSave(JSON.parse(localStorage.getItem(SAVE_KEY)??'{}'));}
  catch{return decodeRegionSave(undefined);}
}
const save=readSave(),audio=new AudioEngine();audio.enabled=save.sound;
const $=<T extends HTMLElement=HTMLElement>(id:string)=>document.getElementById(id) as T;
$('app').innerHTML=`<div class="forest-shell">
  <header class="hud"><div class="identity"><span class="crest">✦</span><div><span class="eyebrow" id="region-label">SPIRE · REGION 01</span><h1 id="region-title">Der alte Hain</h1></div></div><div class="resources"><span><b id="gold">350</b><small>Gold</small></span><span><b id="lives">20</b><small>Leben</small></span><span><b id="wave">0 / ${REGION_WAVE_COUNT}</b><small>Wellen</small></span></div><div class="hud-actions"><button id="sound" aria-label="Ton ausschalten" title="Ton">♫</button><button id="help" aria-label="Spielanleitung">?</button><button id="menu">Karten</button></div></header>
  <main><section class="battlefield" aria-label="Der alte Hain"><div id="game" aria-label="Spielfeld: Turm oder Begleiter unten wählen, dann auf die Karte klicken"></div><div class="board-top"><span id="phase">Der Wald erwacht …</span><div><button id="zoom-out" aria-label="Karte verkleinern" title="Verkleinern">−</button><button id="zoom-reset" aria-label="Zoom zurücksetzen" title="Mausrad: zoomen · mittlere Maustaste ziehen: verschieben">100 %</button><button id="zoom-in" aria-label="Karte vergrößern" title="Vergrößern">+</button><button id="pause" aria-label="Pause">Ⅱ</button><button id="speed">1×</button></div></div><div id="toast" role="status" aria-live="polite"></div><div id="pause-cover" hidden><span>Ⅱ</span><h2>Der Spire wartet.</h2><button id="resume">Weiter verteidigen</button></div><section id="tower-detail" hidden aria-label="Ausgewählter Turm"></section></section>
  <section class="command-dock" aria-label="Spielsteuerung"><div class="duo-row"><div class="duo">${(['wisp','mara'] as const).map((id,index)=>`<button class="hero-choice" id="${id}" aria-pressed="false"><img id="portrait-${id}" alt=""><span><strong>${id==='wisp'?'Wisp':'Mara'}</strong><small>${id==='wisp'?'Ablenkung':'Übertakten'}</small></span><kbd>${index?'E':'Q'}</kbd></button>`).join('')}</div><div class="hero-command"><button id="ability" disabled>Fähigkeit <kbd>M</kbd></button><span id="hero-state">Wähle einen Begleiter oder baue deine erste Verteidigung.</span></div><div class="wave-preview"><span id="next-wave">Erste Welle: 8 Blattkäfer</span><small id="save-state">Bauphasen werden automatisch gesichert.</small></div></div>
  <div class="build-row"><div class="tower-deck">${TOWERS.map(t=>`<button class="tower-choice" data-tower="${t.id}" title="${t.name} · ${t.role}: ${t.description}" aria-label="${t.name}, ${t.cost} Gold"><kbd>${t.id}</kbd><img data-tower-image="${t.id}" alt=""><span>${t.cost}<small> Gold</small></span></button>`).join('')}</div><button id="start-wave" class="primary">Erste Welle starten <span>→</span></button></div></section>
  <footer><span>Q/E Begleiter · M Fähigkeit · 1–8 Türme · Esc Auswahl lösen</span><span>Mausrad: Zoom · Mausrad ziehen: Karte bewegen</span></footer></main>
  <div id="modal" class="modal-backdrop" hidden></div><div id="loading" class="loading">Der alte Hain erwacht …</div></div>`;
let scene:WoodlandScene,loaded=false,active=false,modalKind='',detailKey='',saveTimer=0,lastSaved='',storageAvailable=true;
$('loading').textContent='Die Regionen erwachen …';
$('pause-cover').querySelector('h2')!.textContent='Der Spire wartet.';
let toastTimer:ReturnType<typeof setTimeout>;
function toast(message:string){clearTimeout(toastTimer);$('toast').textContent=message;$('toast').classList.add('visible');toastTimer=setTimeout(()=>$('toast').classList.remove('visible'),3600);}
function persist(){try{localStorage.setItem(SAVE_KEY,JSON.stringify(save));storageAvailable=true;}catch{storageAvailable=false;}$('save-state').textContent=storageAvailable?'Kartenfortschritt und Bauphasen gespeichert':'Speichern nicht verfügbar – Browser-Speicher prüfen';}
function checkpoint(){window.clearTimeout(saveTimer);saveTimer=0;if(!active||!scene)return;const snapshot=scene.sim.snapshot();if(!snapshot)return;const encoded=JSON.stringify(snapshot);if(encoded===lastSaved)return;save.maps[snapshot.map].checkpoint=snapshot;lastSaved=encoded;persist();}
function scheduleSave(){if(active&&scene.sim.phase==='build'&&!saveTimer)saveTimer=window.setTimeout(checkpoint,800);}
function showModal(html:string,kind:string){modalKind=kind;scene.menu=true;$('modal').innerHTML=`<section role="dialog" aria-modal="true" class="menu-panel">${html}</section>`;$('modal').hidden=false;$('modal').querySelector<HTMLButtonElement>('button')?.focus();update();}
function closeModal(){modalKind='';$('modal').hidden=true;scene.menu=false;update();}
function menu(){checkpoint();const region=getRegion(save.selected),progress=save.maps[region.key],cp=progress.checkpoint;
  const current=active&&scene.sim.region.key===region.key&&['build','wave'].includes(scene.sim.phase);
  showModal(`<p class="eyebrow">SPIRE · WÄHLE DEINE REGION</p><div class="region-picker" aria-label="Kartenauswahl">${REGIONS.map((r,i)=>`<button class="region-card" data-region="${r.key}" aria-pressed="${r.key===region.key}"><small>REGION 0${i+1}</small><strong>${r.map.name}</strong><span>${r.key==='old-grove'?'Wald & Lichtungen':r.key==='lantern-marsh'?'Wasser & Holzbrücken':r.key==='mirror-winter'?'Schnee & Spiegelseen':'Inseln über den Wolken'}</span></button>`).join('')}</div><h2>${region.map.name}</h2><p class="menu-intro">${region.intro}<br>${region.map.gold} Startgold · ${REGION_WAVE_COUNT} Wellen · ${region.map.difficulty}</p><div class="menu-record"><span>${'★'.repeat(progress.stars)}${'☆'.repeat(3-progress.stars)}</span><small>${progress.best?`Beste Welle ${progress.best} von ${REGION_WAVE_COUNT}`:'Eine neue Verteidigung beginnt.'}</small></div>${current?'<button class="primary wide" id="continue">Laufendes Spiel fortsetzen →</button>':''}${cp?`<button class="wide" id="load-save">Gespeicherte Bauphase laden · Welle ${cp.wave+1}</button>`:''}<button class="${cp||current?'wide':'primary wide'}" id="new-game">${cp||current?'Neue Verteidigung beginnen':`${region.map.name} spielen →`}</button><p class="menu-note">Wisp und Mara begleiten dich in allen Regionen.<br>Jede Karte behält ihren eigenen Fortschritt und ihre letzte Bauphase.</p><div class="menu-links"><button id="menu-help" class="text-button">So wird gespielt</button><a href="${window.__SPIRE_BUNDLE__?'Spire-Original.html':'./'}">Originalkarten ↗</a></div>`,'menu');
  document.querySelectorAll<HTMLButtonElement>('.region-card[data-region]').forEach(button=>button.onclick=()=>{save.selected=button.dataset.region as RegionID;persist();menu();});
  $('continue')?.addEventListener('click',()=>{audio.unlock();closeModal();});
  $('load-save')?.addEventListener('click',()=>{if(scene.restore(save.maps[save.selected].checkpoint)){active=true;detailKey='';lastSaved='';audio.unlock();closeModal();toast('Bauphase geladen. Türme und Begleiter sind wieder da.');}else toast('Der Spielstand konnte nicht geladen werden.');});
  $('new-game').onclick=newGame;$('menu-help').onclick=help;
}
function newGame(){checkpoint();window.clearTimeout(saveTimer);saveTimer=0;scene.loadMap(getRegion(save.selected).map.id);active=true;detailKey='';lastSaved='';audio.unlock();scene.paused=false;closeModal();checkpoint();toast(save.selected==='lantern-marsh'?'Sichere die Brücken. Begleiter überqueren das Wasser nur auf den Holzstegen.':'Errichte zuerst Türme an den Kurven. Wisp und Mara unterstützen dich im Kampf.');}
function help(){const wasMenu=scene.menu;
  showModal(`<p class="eyebrow">DEIN WACHTDIENST</p><h2>Beschütze den Spire.</h2><div class="instructions"><p><b>1 · Verteidigung bauen</b>Wähle einen der acht Türme und klicke auf eine freie Fläche. Ein Turmklick öffnet Aufwertung, Zielpriorität und Verkauf. Wege, Brücken, Wasser, Eis, Abgründe und große Dekoration sind keine Bauplätze.</p><p><b>2 · Gemeinsam kämpfen</b>Q wählt Wisp, E wählt Mara. Ein Bodenklick bewegt die Figur. Während einer Welle: M drücken, dann mit Wisp einen Ort oder mit Mara einen Turm anklicken. Die Aktion wirkt erst nach der Ankunft.</p><p><b>3 · Fähigkeiten nutzen</b>Wisp verlangsamt nahe Bodengegner 5 Sekunden lang um 45 % (22 Sekunden Abklingzeit). Mara erhöht die Feuerrate eines Turms 8 Sekunden lang um 50 % (30 Sekunden Abklingzeit).</p><p><b>4 · Zehn Wellen überstehen</b>Gefallene Gegner bringen Gold. Flieger benötigen Luftabwehr. Nach jeder Welle wird die Bauphase gespeichert; beim Neuladen während einer Welle setzt du vor deren Start fort.</p></div><p class="menu-note">Leertaste pausiert · F schaltet 1×/2× · N startet die Welle<br>1–8 wählt Türme · U wertet den gewählten Turm auf · Esc hebt die Auswahl auf</p><button id="help-close" class="primary wide">Verstanden</button>`,'help');
  $('help-close').onclick=()=>wasMenu?menu():closeModal();
}
function startWave(){if(!loaded||scene.paused||scene.menu)return;checkpoint();audio.unlock();if(scene.sim.startWave()){scene.clearSelection();scene.handleEvents();update();}}
function selectHero(id:CompanionID){if(loaded&&!scene.menu){audio.unlock();scene.selectHero(id);update();}}
function chooseTower(id:number){if(loaded&&!scene.menu&&!scene.paused){audio.unlock();scene.chooseBuild(id);update();}}
function togglePause(){if(!loaded||scene.menu)return;scene.paused=!scene.paused;update();}
function upgrade(){const tower=scene.sim.towers.find(t=>t.uid===scene.selected);if(!tower||scene.paused||scene.menu)return;if(scene.sim.upgrade(tower.uid)){scene.handleEvents();detailKey='';update();}}
function detail(){
  const tower=scene.sim.towers.find(t=>t.uid===scene.selected);$('tower-detail').hidden=!tower;
  if(!tower){detailKey='';return;}
  const key=`${tower.uid}/${tower.level}`;
  if(key!==detailKey){detailKey=key;const attributes=stats(tower);$('tower-detail').innerHTML=`<button id="detail-close" class="close" aria-label="Turmdetails schließen">×</button><p class="eyebrow">${tower.def.role} · STUFE ${tower.level}</p><h2>${tower.def.name}</h2><div class="tower-stats"><span>${Math.round(attributes.damage)} Schaden</span><span>${Math.round(attributes.range)} Reichweite</span></div><label>Zielpriorität<select id="priority"><option value="first">Vorderster Gegner</option><option value="strong">Stärkster Gegner</option><option value="near">Nächster Gegner</option><option value="last">Hinterster Gegner</option></select></label><button id="upgrade" class="primary wide">${tower.level===3?'Voll ausgebaut':`Aufwerten · ${upgradeCost(tower)} Gold`}</button><button id="sell" class="text-button wide">Verkaufen · +${sellValue(tower)} Gold</button>`;
    $<HTMLSelectElement>('priority').value=tower.priority;$('priority').onchange=()=>{if(!scene.paused&&!scene.menu){tower.priority=$<HTMLSelectElement>('priority').value as Priority;checkpoint();}};
    $('detail-close').onclick=()=>{scene.clearSelection();update();};$('upgrade').onclick=upgrade;
    $('sell').onclick=()=>{if(!scene.paused&&!scene.menu){scene.sim.sell(tower.uid);scene.handleEvents();update();}};
  }
  $<HTMLButtonElement>('upgrade').disabled=scene.paused||scene.menu||tower.level===3||scene.sim.gold<upgradeCost(tower);
  $<HTMLButtonElement>('sell').disabled=scene.paused||scene.menu;$<HTMLSelectElement>('priority').disabled=scene.paused||scene.menu;
}
function update(){
  if(!loaded)return;const sim=scene.sim;
  $('region-title').textContent=sim.map.name;$('region-label').textContent=`SPIRE · REGION 0${sim.map.id+1}`;
  document.querySelector('.battlefield')?.setAttribute('aria-label',sim.map.name);
  document.querySelector('.forest-shell')?.setAttribute('data-region',sim.region.key);
  $('gold').textContent=String(sim.gold);$('lives').textContent=String(sim.lives);$('wave').textContent=`${sim.wave} / ${sim.waveLimit}`;
  $('phase').textContent=scene.paused?'Pause':sim.phase==='wave'?`Welle ${sim.wave} · ${sim.remaining} Gegner`:sim.phase==='victory'?sim.region.victory:sim.phase==='defeat'?'Der Spire ist gefallen':'Bauphase';
  $('pause').textContent=scene.paused?'▶':'Ⅱ';$('pause').setAttribute('aria-label',scene.paused?'Fortsetzen':'Pause');$('pause-cover').hidden=!scene.paused||scene.menu;
  $('zoom-reset').textContent=`${Math.round(scene.mapZoom*100)} %`;$<HTMLButtonElement>('zoom-out').disabled=scene.mapZoom<=1;$<HTMLButtonElement>('zoom-in').disabled=scene.mapZoom>=1.2;
  $('speed').textContent=`${scene.speed}×`;$('sound').setAttribute('aria-label',save.sound?'Ton ausschalten':'Ton einschalten');$('sound').classList.toggle('muted',!save.sound);
  const hero=sim.heroes.find(h=>h.id===scene.selectedHero);
  for(const id of ['wisp','mara'] as const)$(id).setAttribute('aria-pressed',String(hero?.id===id));
  $('hero-state').textContent=hero?`${hero.id==='mara'?'Mara':'Wisp'} · ${scene.abilityMode?'Ziel für Fähigkeit wählen':hero.action?'führt Fähigkeit aus':hero.path.length?'unterwegs':hero.cooldown>0?`bereit in ${Math.ceil(hero.cooldown)} s`:'bereit'}`:scene.buildId?`${TOWERS[scene.buildId-1].name} · freie Fläche anklicken`:'Q/E: Begleiter wählen · Turm anklicken: verwalten';
  $('ability').innerHTML=`${hero?.id==='mara'?'Übertakten':hero?'Ablenkung':'Fähigkeit'}${hero&&hero.cooldown>0?` · ${Math.ceil(hero.cooldown)} s`:' <kbd>M</kbd>'}`;
  $<HTMLButtonElement>('ability').disabled=!hero||hero.cooldown>0||sim.phase!=='wave'||scene.paused||scene.menu;$('ability').classList.toggle('armed',scene.abilityMode);
  document.querySelectorAll<HTMLButtonElement>('[data-tower]').forEach(button=>{button.disabled=scene.paused||scene.menu||sim.phase==='victory'||sim.phase==='defeat'||sim.gold<TOWERS[Number(button.dataset.tower)-1].cost;button.classList.toggle('selected',scene.buildId===Number(button.dataset.tower));});
  const next=sim.compositionForWave(Math.min(sim.waveLimit,sim.wave+1)),counts=new Map<string,number>();for(const enemy of next)counts.set(enemy.type.id,(counts.get(enemy.type.id)??0)+1);
  $('next-wave').textContent=sim.phase==='wave'?`${sim.remaining} Gegner verbleiben · ${sim.kills} besiegt`:`Als Nächstes: ${[...counts].map(([id,count])=>`${count} ${ENEMIES.find(e=>e.id===id)!.name}`).join(' · ')}`;
  $<HTMLButtonElement>('start-wave').disabled=scene.paused||scene.menu||sim.phase!=='build';$('start-wave').innerHTML=sim.phase==='wave'?'Die Wächter kämpfen …':sim.phase==='build'?`Welle ${sim.wave+1} starten <span>→</span>`:'Verteidigung beendet';
  detail();scheduleSave();
}
function onEvent(event:Event){
  if(['build','fire','kill','wave','victory','defeat','upgrade'].includes(event.type))audio.play(event.type as Parameters<AudioEngine['play']>[0]);
  if(event.type==='clear')toast(`Welle ${scene.sim.wave} überstanden · +${event.amount} Gold`);
  if(event.type==='victory'||event.type==='defeat'){
    const sim=scene.sim,won=event.type==='victory',stars=won?(sim.lives>=18?3:sim.lives>=10?2:1):0;
    const progress=save.maps[sim.region.key];save.selected=sim.region.key;
    window.clearTimeout(saveTimer);saveTimer=0;progress.checkpoint=undefined;progress.best=Math.max(progress.best,sim.wave);progress.stars=Math.max(progress.stars,stars);persist();
    showModal(`<p class="eyebrow">${won?'DIE REGION IST GESICHERT':'EIN NEUER VERSUCH'}</p><span class="menu-emblem">${won?'✦':'❧'}</span><h2>${won?sim.region.victory:'Der Spire ist gefallen.'}</h2><p class="menu-intro">${won?'Wisp, Mara und deine Wächter haben alle zehn Wellen abgewehrt.':`Die Verteidigung endete in Welle ${sim.wave}. Baue an den Kurven und kombiniere Schaden mit Verlangsamung.`}</p>${won?`<div class="result-stars">${'★'.repeat(stars)}${'☆'.repeat(3-stars)}</div>`:''}<div class="result-stats"><span><b>${sim.wave}</b>Wellen</span><span><b>${sim.kills}</b>Gegner</span><span><b>${sim.lives}</b>Leben</span></div><button id="retry" class="primary wide">Erneut verteidigen</button><button id="result-menu" class="text-button wide">Zur Kartenauswahl</button>`,'result');
    $('retry').onclick=newGame;$('result-menu').onclick=menu;
  }
}
async function makeIcons(){
  for(const tower of TOWERS){
    const id=String(tower.id).padStart(2,'0'),baseName=`Tower ${id}`,weaponName=`Tower ${id} - Level 01 - Weapon`,base=new Image(),weapon=new Image();base.src=assetUrl(baseName);weapon.src=assetUrl(weaponName);await Promise.all([base.decode(),weapon.decode()]);
    const canvas=document.createElement('canvas');canvas.width=96;canvas.height=128;const ctx=canvas.getContext('2d')!;ctx.imageSmoothingEnabled=false;const bi=scene.assets[baseName],wi=scene.assets[weaponName];ctx.drawImage(base,0,0,bi.width!,bi.height!,16,bi.height===192?-32:0,64,bi.height!);ctx.drawImage(weapon,0,0,wi.width!,wi.height!,(96-wi.width!)/2,bi.height===192?-6:8,wi.width!,wi.height!);
    document.querySelector<HTMLImageElement>(`[data-tower-image="${tower.id}"]`)!.src=canvas.toDataURL();
  }
  for(const id of ['wisp','mara'] as const){const canvas=document.createElement('canvas');canvas.width=64;canvas.height=64;const ctx=canvas.getContext('2d')!;ctx.imageSmoothingEnabled=false;ctx.drawImage(scene.textures.get(id==='mara'?'style-mara':'Wisp - Animations').getSourceImage() as HTMLImageElement,0,0,64,64,0,0,64,64);$<HTMLImageElement>(`portrait-${id}`).src=canvas.toDataURL();}
}
try{
  const assets=await loadAssets();assets['Mara style source']={sheetWidth:1254,sheetHeight:1254};Object.assign(assets,REGION_ASSETS);
  scene=new WoodlandScene(assets,{ready(){loaded=true;$('loading').remove();void makeIcons();menu();},changed:update,event:onEvent,select:()=>{if(loaded)detail();},toast});
  new Phaser.Game({type:Phaser.AUTO,parent:'game',width:WIDTH,height:HEIGHT,backgroundColor:'#63ab3f',pixelArt:true,roundPixels:true,scene:[scene],scale:{mode:Phaser.Scale.FIT,autoCenter:Phaser.Scale.CENTER_BOTH},audio:{noAudio:true},render:{antialias:false}});
}catch(error){$('loading').textContent='Das Spiel konnte nicht geladen werden. Bitte Spire-Regionen.html neu öffnen.';console.error(error);}
$('zoom-in').onclick=()=>{if(loaded)scene.setMapZoom(scene.mapZoom+.05);};$('zoom-out').onclick=()=>{if(loaded)scene.setMapZoom(scene.mapZoom-.05);};$('zoom-reset').onclick=()=>{if(loaded)scene.setMapZoom(1);};
$('wisp').onclick=()=>selectHero('wisp');$('mara').onclick=()=>selectHero('mara');$('ability').onclick=()=>scene.prepareAbility();
document.querySelectorAll<HTMLButtonElement>('[data-tower]').forEach(button=>button.onclick=()=>chooseTower(Number(button.dataset.tower)));
$('start-wave').onclick=startWave;$('pause').onclick=togglePause;$('resume').onclick=togglePause;$('speed').onclick=()=>{if(loaded){scene.speed=scene.speed===1?2:1;update();}};
$('menu').onclick=()=>{if(loaded)menu();};$('help').onclick=()=>{if(loaded)help();};$('sound').onclick=()=>{save.sound=!save.sound;audio.enabled=save.sound;audio.unlock();persist();if(loaded)update();};
window.addEventListener('keydown',event=>{
  if(!loaded||event.repeat||(event.target as HTMLElement).matches('input,select'))return;
  if(scene.menu){if(event.key==='Escape'&&modalKind==='help')$('help-close').click();return;}
  if(event.key==='Escape')scene.clearSelection();
  if(event.code==='Space'){event.preventDefault();togglePause();}
  if(/^[1-8]$/.test(event.key))chooseTower(Number(event.key));
  if(event.code==='KeyQ')selectHero('wisp');if(event.code==='KeyE')selectHero('mara');if(event.code==='KeyM')scene.prepareAbility();
  if(event.code==='KeyN')startWave();if(event.code==='KeyU')upgrade();if(event.code==='KeyF')$('speed').click();update();
});
window.addEventListener('pagehide',checkpoint);
document.addEventListener('visibilitychange',()=>{if(document.hidden&&loaded&&active){checkpoint();if(scene.sim.phase==='wave'){scene.paused=true;update();}}});
