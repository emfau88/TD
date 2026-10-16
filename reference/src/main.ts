import Phaser from 'phaser';
import './style.css';
import './ui-skin.css';
import { MAPS,TOWERS,ENEMIES,WIDTH,HEIGHT,waveComposition,type Priority } from './data';
import { stats,upgradeCost,sellValue,type Event,type Tower } from './simulation';
import { ForestScene,type Assets } from './scene';
import { AudioEngine } from './audio';
import { assetUrl, uiAssetUrl, loadAssets } from './assets';

type Save={stars:number[];best:number[];tutorial:boolean;volume:number;sound:boolean;};
function readSave():Save{
  try{
    const raw=JSON.parse(localStorage.getItem('spire-reference-save-v1')??'{}');
    const scores=(values:unknown,maximum:number)=>Array.from({length:3},(_,index)=>{
      const value=Array.isArray(values)?values[index]:0;
      return typeof value==='number'&&Number.isFinite(value)?Math.max(0,Math.min(maximum,Math.floor(value))):0;
    });
    return{stars:scores(raw.stars,3),best:scores(raw.best,20),tutorial:!!raw.tutorial,volume:typeof raw.volume==='number'&&Number.isFinite(raw.volume)?Math.max(0,Math.min(1,raw.volume)):.28,sound:raw.sound!==false};
  }catch{return{stars:[0,0,0],best:[0,0,0],tutorial:false,volume:.28,sound:true};}
}
const save=readSave();while(save.stars.length<3)save.stars.push(0);while(save.best.length<3)save.best.push(0);
const persist=()=>{try{localStorage.setItem('spire-reference-save-v1',JSON.stringify(save));}catch{}};
const audio=new AudioEngine();audio.volume=save.volume;audio.enabled=save.sound;
const assets:Assets=await loadAssets().catch(error=>{
  const message=document.createElement('div');
  message.className='loading';
  const title=document.createElement('h2');title.textContent='Der Wald konnte nicht geladen werden.';
  const description=document.createElement('p');description.textContent='Öffne Spire-Original.html oder starte das Spiel über SPIEL STARTEN.cmd.';
  message.append(title,description);document.getElementById('app')!.append(message);
  throw error;
});
const $=<T extends HTMLElement=HTMLElement>(selector:string)=>document.querySelector<T>(selector)!;
const app=$('#app');
const uiArt:Record<string,string>={frame:'panel-frame.png',button:'button-states.png',backdrop:'menu-backdrop.png',emblem:'spire-emblem.png',hud:'hud-icons.png',slots:'tower-slots.png',maps:'map-covers.png'};
for(const [key,filename]of Object.entries(uiArt))document.documentElement.style.setProperty(`--ui-${key}`,`url("${uiAssetUrl(filename)}")`);
const uiIcon=(name:string)=>`<span class="ui-icon ui-icon--${name}" aria-hidden="true"></span>`;
app.innerHTML=`
  <header class="topbar">
    <a class="brand" href="#" aria-label="Spire Hauptmenü"><span class="brand-mark">✦</span><span>SPIRE<small>HÜTER DES WALDES</small></span></a>
    <nav class="header-context"><span class="tiny-label">DEINE MISSION</span><span id="map-label">Der alte Hain</span></nav>
    <div class="header-actions"><button class="icon-button" id="help-button" title="Spielanleitung" aria-label="Spielanleitung">?</button><button class="icon-button" id="sound-button" title="Ton umschalten" aria-label="Ton umschalten">♫</button><button class="outline-button" id="menu-button">☷ <span>Karten</span></button></div>
  </header>
  <main class="layout">
    <section class="battle-panel">
      <div class="battle-toolbar"><div class="map-heading"><span class="eyebrow">DIE VERTEIDIGUNG BEGINNT HIER</span><h1 id="map-title">Der alte Hain</h1></div><div class="resources"><div class="resource"><span class="gold-symbol">◆</span><div><b id="gold">350</b><small>Gold</small></div></div><div class="resource"><span class="heart-symbol">♥</span><div><b id="lives">20</b><small>Spire-Leben</small></div></div><div class="resource"><span class="wave-symbol">≋</span><div><b id="wave">0 <em>/ 20</em></b><small>Welle</small></div></div></div></div>
      <div class="board-wrap"><div id="game" aria-label="Spielfeld. Turm unten auswählen und auf einer freien Wiese platzieren."></div><div class="board-corner"><span class="status-dot"></span><span id="board-status">Bauphase</span></div><div class="board-controls"><button id="pause-button" class="board-button" title="Pause (Leertaste)" aria-label="Pause">Ⅱ</button><button id="speed-button" class="board-button" title="Spielgeschwindigkeit">1×</button></div><div id="toast" role="status"></div><div id="pause-overlay" hidden><span>Ⅱ</span><h2>Eine kleine Atempause.</h2><button id="resume-button" class="primary-button">Weiter verteidigen</button></div></div>
      <div class="deck-heading"><span><b>Deine Wächter</b><small>Wähle einen Turm und platziere ihn auf der Wiese.</small></span><span class="keyboard-hint">1–8 wählen <i>·</i> ESC abbrechen</span></div>
      <div class="tower-deck">${TOWERS.map(t=>`<button class="tower-card" data-tower="${t.id}" aria-label="${t.name}, ${t.cost} Gold" title="${t.description}"><span class="tower-preview"><span class="tower-shortcut">${t.id}</span><img class="tower-art" data-icon="${t.id}" alt=""></span><strong>${t.name}</strong><span class="tower-role">${t.role}</span><span class="tower-cost">◆ ${t.cost}</span></button>`).join('')}</div>
    </section>
    <aside class="sidebar">
      <section class="wave-card"><span class="eyebrow" id="wave-kicker">BEREIT, WENN DU ES BIST</span><h2 id="wave-heading">Die Ruhe vor<br>dem Sturm.</h2><p id="wave-description">Errichte deine ersten Wächter entlang des Weges. Der Wald zählt auf dich.</p><div class="next-enemies" id="next-enemies"></div><div class="wave-progress"><span id="wave-progress-label">Nächste Welle: 1</span><span id="remaining-label">8 Gegner</span><div class="progress-track"><i id="wave-progress-bar"></i></div></div><button id="start-wave" class="primary-button">Erste Welle starten <span>➜</span></button><label class="auto-toggle"><input id="auto-waves" type="checkbox"><span>Wellen automatisch starten</span></label></section>
      <section id="detail-panel" class="detail-card"></section>
      <section class="tip-card"><span>❧</span><div><b>Ein guter Platz ist die halbe Miete.</b><p>Kurven und lange Wegabschnitte geben deinen Türmen mehr Zeit zum Angreifen.</p></div></section>
      <div class="sidebar-footer"><span>✦</span><small>Ein Wald. Acht Wächter.<br>Deine Strategie.</small></div>
    </aside>
  </main>
  <div id="modal-layer" class="modal-layer" hidden></div>
  <footer class="footer"><span>SPIRE <i>·</i> Pixelart von Foozle & Baldur</span><span>Beschütze, was bleibt. <span>❧</span></span></footer>
  <div id="loading" class="loading"><span class="brand-mark">✦</span><h2>Der Wald erwacht …</h2><p>Wächter und Landschaft werden geladen.</p></div>`;

$('.gold-symbol').innerHTML=uiIcon('gold');$('.heart-symbol').innerHTML=uiIcon('heart');$('.wave-symbol').innerHTML=uiIcon('wave');
$('#pause-overlay > span').innerHTML=uiIcon('pause');
$('#sound-button').innerHTML=uiIcon('sound');
document.querySelectorAll<HTMLElement>('.brand-mark').forEach(mark=>{mark.textContent='';mark.setAttribute('aria-hidden','true');});

let selectedMap=0,loaded=false,detailKey='',autoTimer=0,autoWave=0,resultTimer=0,toastTimer:ReturnType<typeof setTimeout>,modalKind='';
const scene=new ForestScene(assets,{ready(){loaded=true;$('#loading').remove();updateUI();showMenu();},changed:updateUI,event:onEvent,select:renderDetail,toast});
new Phaser.Game({type:Phaser.AUTO,parent:'game',width:WIDTH,height:HEIGHT,backgroundColor:'#6a993e',pixelArt:true,roundPixels:true,scene:[scene],scale:{mode:Phaser.Scale.FIT,autoCenter:Phaser.Scale.CENTER_BOTH},audio:{noAudio:true},render:{antialias:false}});

async function makeIcons(){
  for(const tower of TOWERS){const id=String(tower.id).padStart(2,'0'),baseName=`Tower ${id}`,weaponName=`Tower ${id} - Level 01 - Weapon`,base=new Image(),weapon=new Image();base.src=assetUrl(baseName);weapon.src=assetUrl(weaponName);await Promise.all([base.decode(),weapon.decode()]);const canvas=document.createElement('canvas');canvas.width=96;canvas.height=128;const ctx=canvas.getContext('2d')!;ctx.imageSmoothingEnabled=false;const bi=assets[baseName],wi=assets[weaponName];ctx.drawImage(base,0,0,bi.width!,bi.height!,16,bi.height===192?-32:0,64,bi.height!);ctx.drawImage(weapon,0,0,wi.width!,wi.height!,(96-wi.width!)/2,bi.height===192?-6:8,wi.width!,wi.height!);document.querySelectorAll<HTMLImageElement>(`[data-icon="${tower.id}"]`).forEach(image=>image.src=canvas.toDataURL());}
}
void makeIcons().catch(()=>toast('Einige Turmvorschauen konnten nicht geladen werden.'));
function toast(message:string){clearTimeout(toastTimer);$('#toast').textContent=message;$('#toast').classList.add('visible');toastTimer=setTimeout(()=>$('#toast').classList.remove('visible'),2500);}
function setModal(html:string,kind:string){modalKind=kind;$('#modal-layer').dataset.kind=kind;$('#modal-layer').innerHTML=html;$('#modal-layer').hidden=false;document.querySelectorAll<HTMLElement>('.menu-symbol,.result-symbol').forEach(mark=>{mark.textContent='';mark.setAttribute('aria-hidden','true');});}
function closeModal(){modalKind='';$('#modal-layer').hidden=true;$('#modal-layer').innerHTML='';}
function showMenu(){
  if(!loaded)return;clearAuto();window.clearTimeout(resultTimer);resultTimer=0;scene.menu=true;scene.cancelBuild();scene.selected=undefined;detailKey='';
  const canContinue=(scene.sim.wave>0||scene.sim.towers.length>0)&&scene.sim.phase!=='defeat'&&scene.sim.phase!=='victory';
  setModal(`<section class="menu-modal"><div class="menu-intro"><div class="menu-symbol">✦</div><span class="eyebrow">EIN KLEINER WALD. EINE GROSSE AUFGABE.</span><h1>Werde sein<br><em>letzter Wächter.</em></h1><p>Die Schwärme kommen. Errichte Türme, entfessle ihre Kräfte und verteidige den Spire.</p><div class="menu-features"><span>8 Wächter</span><i>·</i><span>3 Karten</span><i>·</i><span>20 Wellen</span></div><button id="begin-button" class="primary-button">${canContinue?'Neue Verteidigung starten':'Den Wald verteidigen'} <span>➜</span></button>${canContinue?'<button id="continue-button" class="text-button">Laufendes Spiel fortsetzen</button>':''}<button class="text-button" id="menu-help">So wird gespielt ↗</button></div><div class="map-selection"><span class="eyebrow">WÄHLE DEIN SCHLACHTFELD</span>${MAPS.map(m=>`<button class="map-option ${selectedMap===m.id?'active':''}" data-map="${m.id}"><span class="map-number">0${m.id+1}</span><span><b>${m.name}</b><small>${m.subtitle}</small><em>${m.difficulty}${save.best[m.id]?` · Beste Welle ${save.best[m.id]}`:''}</em></span><span class="map-stars">${save.stars[m.id]?'★'.repeat(save.stars[m.id])+'☆'.repeat(3-save.stars[m.id]):'☆☆☆'}</span><span class="map-select-icon">${selectedMap===m.id?'✓':'→'}</span></button>`).join('')}<div class="map-note"><span>❧</span><p>Jeder Hain hat seinen eigenen Weg.<br>Deine Siege werden automatisch gespeichert.</p></div><label class="volume-label">Lautstärke <input id="volume" type="range" min="0" max="100" value="${Math.round(save.volume*100)}"></label></div></section>`,'menu');
  document.querySelectorAll<HTMLButtonElement>('[data-map]').forEach(button=>{const thumbnail=document.createElement('span');thumbnail.className=`map-cover map-cover--${button.dataset.map}`;thumbnail.setAttribute('aria-hidden','true');button.prepend(thumbnail);button.onclick=()=>{selectedMap=Number(button.dataset.map);showMenu();};});
  $('#begin-button').onclick=()=>beginMap(selectedMap);const continuation=document.querySelector<HTMLElement>('#continue-button');if(continuation)continuation.onclick=()=>{closeModal();scene.menu=false;updateUI();};
  $('#menu-help').onclick=()=>showHelp(true);$('#volume').oninput=()=>{save.volume=Number(($<HTMLInputElement>('#volume')).value)/100;audio.volume=save.volume;persist();};
}
function beginMap(id:number){audio.unlock();window.clearTimeout(resultTimer);resultTimer=0;selectedMap=id;closeModal();clearAuto();scene.loadMap(id);scene.menu=false;detailKey='';renderDetail();updateUI();if(!save.tutorial)showHelp();}
function showHelp(fromMenu=false){
  if(!loaded)return;const previousPause=scene.paused;scene.paused=true;
  setModal(`<section class="help-modal"><span class="eyebrow">DEIN ERSTER WACHTDIENST</span><h2>Der Wald braucht einen Plan.</h2><div class="help-steps"><div><b>01</b><h3>Wächter errichten</h3><p>Wähle unten einen Turm. Klicke auf eine freie Wiese neben dem Weg. Wege, Wasser und Bäume bleiben frei.</p></div><div><b>02</b><h3>Wellen abwehren</h3><p>Starte die Welle rechts. Deine Türme greifen automatisch an. Besiegte Gegner bringen Gold für neue Wächter.</p></div><div><b>03</b><h3>Deine Strategie ausbauen</h3><p>Klicke auf einen Turm, um ihn aufzuwerten oder seine Zielpriorität zu ändern. Flieger brauchen Türme mit Luftabwehr.</p></div></div><div class="help-shortcuts"><span><kbd>1–8</kbd> Turm wählen</span><span><kbd>ESC</kbd> Auswahl aufheben</span><span><kbd>Leertaste</kbd> Pause</span><span><kbd>N</kbd> Nächste Welle</span><span><kbd>U</kbd> Aufwerten</span><span><kbd>F</kbd> 1× / 2×</span></div><p class="help-goal">Überstehe alle 20 Wellen. Wenn Gegner den Spire erreichen, verliert er Leben. Bei 0 Leben endet die Verteidigung.</p><button id="help-close" class="primary-button">Verstanden. Für den Wald! <span>➜</span></button></section>`,'help');
  $('#help-close').onclick=()=>{save.tutorial=true;persist();scene.paused=previousPause;if(fromMenu)showMenu();else{closeModal();scene.menu=false;updateUI();}};
}
function renderDetail(tower?:Tower){
  tower??=scene.sim?.towers.find(t=>t.uid===scene.selected);
  const build=scene.buildId?TOWERS[scene.buildId-1]:undefined;
  const key=tower?`${tower.uid}-${tower.level}`:build?`build-${build.id}`:'empty';
  if(key!==detailKey){detailKey=key;
    if(tower){const def=tower.def,stat=stats(tower);$('#detail-panel').innerHTML=`<span class="eyebrow">DEIN AUSGEWÄHLTER WÄCHTER</span><div class="detail-title"><h2>${def.name}</h2><span class="level-badge">STUFE ${tower.level}</span></div><p>${def.description}</p><div class="detail-stats"><div><small>Schaden</small><b>${Math.round(stat.damage)}</b></div><div><small>Reichweite</small><b>${Math.round(stat.range)}</b></div><div><small>Abschüsse</small><b id="tower-kills">${tower.kills}</b></div></div><label class="priority-label">Zielpriorität<select id="priority"><option value="first">Am weitesten vorgedrungen</option><option value="strong">Stärkster Gegner</option><option value="near">Nächster Gegner</option><option value="last">Letzter Gegner</option></select></label><button id="upgrade-button" class="upgrade-button">${tower.level===3?'Maximale Stufe erreicht':`Auf Stufe ${tower.level+1} aufwerten <span>◆ ${upgradeCost(tower)}</span>`}</button><button id="sell-button" class="text-button sell-button">Verkaufen <span>+${sellValue(tower)} Gold</span></button>`;
      $<HTMLSelectElement>('#priority').value=tower.priority;$<HTMLSelectElement>('#priority').onchange=()=>{tower!.priority=$<HTMLSelectElement>('#priority').value as Priority;};$('#upgrade-button').onclick=upgradeSelected;$('#sell-button').onclick=()=>{if(scene.sim.sell(tower!.uid)){scene.selected=undefined;scene.drawRange();detailKey='';renderDetail();scene.handleEvents();updateUI();}};
    }else if(build){$('#detail-panel').innerHTML=`<span class="eyebrow">BEREIT ZUM BAUEN</span><div class="detail-title"><h2>${build.name}</h2><span class="level-badge">◆ ${build.cost}</span></div><p>${build.description}</p><div class="detail-stats"><div><small>Schaden</small><b>${build.damage}</b></div><div><small>Reichweite</small><b>${build.range}</b></div><div><small>Ziele</small><b class="small-stat">${build.targets==='all'?'Alle':'Boden'}</b></div></div><div class="placement-note">Klicke auf eine freie Wiese.<br>Halte den Weg zum Spire frei.</div><button id="cancel-build" class="text-button">Auswahl abbrechen <span>ESC</span></button>`;$('#cancel-build').onclick=()=>{scene.cancelBuild();detailKey='';renderDetail();updateUI();};
    }else{$('#detail-panel').innerHTML=`<span class="eyebrow">DEINE STRATEGIE</span><h2>Jeder Wächter zählt.</h2><p>Kombiniere Schaden und Verlangsamung. Klicke auf einen gebauten Turm für Aufwertungen und Zielprioritäten.</p><div class="strategy-line"><span class="strategy-icon">↗</span><span><b>Stärker zusammen</b><small>Alle Türme haben drei Ausbaustufen.</small></span></div><div class="strategy-line"><span class="strategy-icon">ϟ</span><span><b>Auch den Himmel im Blick</b><small>Steinschleuder und Glutwerfer treffen nur Bodengegner.</small></span></div>`;}
  }
  if(tower){const upgrade=document.querySelector<HTMLButtonElement>('#upgrade-button');if(upgrade)upgrade.disabled=tower.level>=3||scene.sim.gold<upgradeCost(tower)||scene.sim.phase==='victory'||scene.sim.phase==='defeat';const kills=document.querySelector('#tower-kills');if(kills)kills.textContent=String(tower.kills);}
}
function chooseTower(id:number){if(!loaded||!$('#modal-layer').hidden||scene.sim.phase==='victory'||scene.sim.phase==='defeat')return;audio.unlock();if(scene.buildId===id){scene.cancelBuild();detailKey='';renderDetail();}else{scene.chooseBuild(id);detailKey='';renderDetail();}updateUI();}
function upgradeSelected(){if(scene.selected&&scene.sim.upgrade(scene.selected)){scene.handleEvents();detailKey='';renderDetail();scene.drawRange();updateUI();}else toast('Für diese Aufwertung fehlt noch Gold.');}
function updateUI(){
  if(!loaded||!scene.sim)return;const sim=scene.sim;
  $('#map-label').textContent=sim.map.name;$('#map-title').textContent=sim.map.name;$('#gold').textContent=String(sim.gold);$('#lives').textContent=String(sim.lives);$('#wave').innerHTML=`${sim.wave} <em>/ 20</em>`;
  const active=sim.phase==='wave';$('#board-status').textContent=scene.paused?'Pausiert':active?`Welle ${sim.wave} läuft`:'Bauphase';$('#pause-overlay').hidden=!scene.paused||scene.menu||!$('#modal-layer').hidden;$('#pause-button').innerHTML=uiIcon(scene.paused?'play':'pause');$('#pause-button').setAttribute('aria-label',scene.paused?'Fortsetzen':'Pause');$('#speed-button').innerHTML=`${uiIcon('fast')}<span>${scene.speed}×</span>`;
  $<HTMLButtonElement>('#start-wave').disabled=active||scene.paused||sim.phase==='victory'||sim.phase==='defeat';$('#start-wave').innerHTML=active?'Die Wächter kämpfen …':`${sim.wave===0?'Erste Welle starten':`Welle ${sim.wave+1} starten`} <span>➜</span>`;
  $('#wave-kicker').textContent=active?'DIE SCHWÄRME SIND DA':'BEREIT, WENN DU ES BIST';$('#wave-heading').innerHTML=active?`Haltet den<br>Spire am Leben.`:sim.wave>0?'Ein Moment<br>zum Aufrüsten.':'Die Ruhe vor<br>dem Sturm.';
  $('#wave-description').textContent=active?'Deine Wächter kämpfen. Verstärke die Verteidigung auch während der Welle.':sim.wave>0?`Welle ${sim.wave} überstanden. Nutze dein Gold für neue Türme und stärkere Ausbaustufen.`:'Errichte deine ersten Wächter entlang des Weges. Der Wald zählt auf dich.';
  const next=waveComposition(Math.min(20,sim.wave+(active?0:1))),unique=[...new Set(next.map(e=>e.type.id))];const compositionKey=unique.join('|');
  if($('#next-enemies').dataset.key!==compositionKey){$('#next-enemies').dataset.key=compositionKey;$('#next-enemies').innerHTML=unique.map(id=>{const enemy=ENEMIES.find(e=>e.id===id)!,info=assets[id];return`<span class="enemy-preview" title="${enemy.name}${enemy.flying?' · Fliegend':''}" style="background-image:url('${assetUrl(id)}');background-size:${info.sheetWidth*.5}px ${info.sheetHeight*.5}px;width:${info.width!*.5}px;height:${info.height!*.5}px"></span>`;}).join('');}
  $('#wave-progress-label').textContent=active?`Welle ${sim.wave} / 20`:`Nächste Welle: ${Math.min(20,sim.wave+1)}`;$('#remaining-label').textContent=`${active?sim.remaining:next.length} Gegner`;$('#wave-progress-bar').style.width=`${active?100*(1-sim.remaining/next.length):0}%`;
  document.querySelectorAll<HTMLButtonElement>('[data-tower]').forEach(button=>{const def=TOWERS[Number(button.dataset.tower)-1];button.classList.toggle('selected',scene.buildId===def.id);button.classList.toggle('unaffordable',sim.gold<def.cost);});renderDetail();
  if($<HTMLInputElement>('#auto-waves').checked&&sim.phase==='build'&&sim.wave>0&&sim.wave<20&&!scene.paused&&!scene.menu&&autoWave!==sim.wave){autoWave=sim.wave;autoTimer=window.setTimeout(()=>{autoTimer=0;if(scene.sim===sim&&sim.phase==='build'&&!scene.paused&&!scene.menu&&$<HTMLInputElement>('#auto-waves').checked)startWave();else autoWave=0;},4500);}
}
function clearAuto(){window.clearTimeout(autoTimer);autoTimer=0;autoWave=0;}
function startWave(){if(scene.paused||scene.menu)return;audio.unlock();if(scene.sim.startWave()){clearAuto();scene.cancelBuild();detailKey='';renderDetail();scene.handleEvents();updateUI();}}
function togglePause(){if(!loaded||scene.menu||!$('#modal-layer').hidden)return;scene.paused=!scene.paused;if(scene.paused)clearAuto();updateUI();}
function onEvent(event:Event){
  if(['build','fire','kill','wave','victory','defeat','upgrade'].includes(event.type))audio.play(event.type as Parameters<AudioEngine['play']>[0]);
  if(event.type==='clear')toast(`Welle ${scene.sim.wave} geschafft · +${event.amount} Gold`);
  if(event.type==='victory'||event.type==='defeat'){
    clearAuto();scene.cancelBuild();const sim=scene.sim,won=event.type==='victory',stars=won?(sim.lives>=18?3:sim.lives>=10?2:1):0;save.stars[sim.map.id]=Math.max(save.stars[sim.map.id],stars);save.best[sim.map.id]=Math.max(save.best[sim.map.id],sim.wave);persist();
    resultTimer=window.setTimeout(()=>{resultTimer=0;if(scene.sim!==sim||scene.menu)return;setModal(`<section class="result-modal"><span class="result-symbol">${won?'✦':'❧'}</span><span class="eyebrow">${won?'DER WALD ATMET AUF':'DER WALD WIRD DICH WIEDER BRAUCHEN'}</span><h1>${won?'Der Spire steht.':'Ein neuer Versuch.<br>Eine neue Strategie.'}</h1><p>${won?`Du hast ${sim.map.name} durch alle 20 Wellen verteidigt.`:`Die Schwärme haben den Spire in Welle ${sim.wave} erreicht.`}</p>${won?`<div class="result-stars">${'★'.repeat(stars)}${'☆'.repeat(3-stars)}</div>`:''}<div class="result-stats"><div><b>${sim.wave}</b><small>Wellen</small></div><div><b>${sim.kills}</b><small>Besiegte Gegner</small></div><div><b>${sim.lives}</b><small>Verbleibende Leben</small></div></div><button id="result-play" class="primary-button">${won&&sim.map.id<2?'Nächsten Hain verteidigen':'Erneut verteidigen'} <span>➜</span></button><button id="result-menu" class="text-button">Zur Kartenauswahl</button></section>`,'result');$('#result-play').onclick=()=>beginMap(won?Math.min(2,sim.map.id+1):sim.map.id);$('#result-menu').onclick=showMenu;},500);
  }
}
document.querySelectorAll<HTMLButtonElement>('[data-tower]').forEach(button=>button.onclick=()=>chooseTower(Number(button.dataset.tower)));
$('#start-wave').onclick=startWave;$('#pause-button').onclick=togglePause;$('#resume-button').onclick=togglePause;$('#speed-button').onclick=()=>{scene.speed=scene.speed===1?2:1;updateUI();};$('#menu-button').onclick=showMenu;$('.brand').onclick=e=>{e.preventDefault();showMenu();};$('#help-button').onclick=()=>showHelp(scene.menu);
$('#sound-button').onclick=()=>{save.sound=!save.sound;audio.enabled=save.sound;audio.unlock();$('#sound-button').innerHTML=uiIcon('sound');$('#sound-button').classList.toggle('muted',!save.sound);$('#sound-button').setAttribute('aria-label',save.sound?'Ton ausschalten':'Ton einschalten');persist();};
$('#sound-button').classList.toggle('muted',!save.sound);$('#auto-waves').onchange=()=>{clearAuto();updateUI();};
window.addEventListener('keydown',event=>{if((event.target as HTMLElement).matches('input,select')||!loaded)return;if(event.key==='Escape'){if(modalKind==='help')$('#help-close').click();else if($('#modal-layer').hidden){scene.clearSelection();detailKey='';renderDetail();updateUI();}return;}if(!$('#modal-layer').hidden)return;if(/^[1-8]$/.test(event.key))chooseTower(Number(event.key));if(event.code==='Space'){event.preventDefault();togglePause();}if(event.key.toLowerCase()==='n')startWave();if(event.key.toLowerCase()==='u')upgradeSelected();if(event.key.toLowerCase()==='f')$('#speed-button').click();});
document.addEventListener('visibilitychange',()=>{if(document.hidden&&loaded&&!scene.menu&&scene.sim.phase==='wave'){scene.paused=true;clearAuto();updateUI();}});
