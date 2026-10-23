const $=id=>document.getElementById(id);
const manifest=await fetch('manifest.json').then(r=>r.json());
const cache=new Map();let current='TouchReaction',pages={},playing=false,t=0,last=0,request=0;
function load(name,side){const key=name+side;if(!cache.has(key))cache.set(key,Promise.all(manifest.comparisons[name][side].pages.map(src=>new Promise((resolve,reject)=>{const im=new Image();im.onload=()=>resolve(im);im.onerror=reject;im.src=src;}))));return cache.get(key);}
function state(){$('play').textContent=playing?'Pause':'Abspielen';}
function draw(){const pair=manifest.comparisons[current];for(const side of ['before','after']){const c=pair[side],f=c.frames[Math.min(c.frames.length-1,Math.floor(t*30+1e-6))],ctx=$(side).getContext('2d');ctx.clearRect(0,0,768,1024);ctx.drawImage(pages[side][f[0]],f[1],f[2],f[3],f[4],c.crop[0],c.crop[1],f[3],f[4]);}$('time').textContent=t.toFixed(2).replace('.',',')+' s';$('scrub').value=Math.round(t*30);}
async function choose(name){const token=++request;playing=false;$('play').disabled=true;$('restart').disabled=true;$('scrub').disabled=true;$('status').textContent='Vergleich wird geladen …';
 try{const [before,after]=await Promise.all([load(name,'before'),load(name,'after')]);if(token!==request)return;current=name;pages={before,after};t=0;const pair=manifest.comparisons[name];
 $('before-note').textContent=pair.before.duration.toFixed(1).replace('.',',')+' Sekunden · unverändert';$('after-note').textContent=pair.after.duration.toFixed(1).replace('.',',')+' Sekunden · '+(name==='Idle'?'Blickkontakt':'Körpergeste');
 $('changes').textContent=name==='Idle'?'Kleine gehaltene Kopfneigung, Lächeln und langsames Blinzeln. Als gelegentliche Abwechslung zwischen normalen Idle-Loops vorgesehen.':'Gewichtsverlagerung, Ellbogen nach außen und Hand Richtung Hüfte. Der Oberkörper neigt sich seitlich und leicht abwärts; Haare und Kleidung folgen.';
 $('scrub').max=Math.round(pair.cycle*30);$('play').disabled=false;$('restart').disabled=false;$('scrub').disabled=false;$('status').textContent=name==='Idle'?'Die Einzelproben wiederholen sich hier zur Beurteilung; dies ist kein Dauerverhalten für das Spiel.':'Beide Gesten starten gemeinsam. Nach der Rückkehr halten sie die Ruhepose bis zum nächsten Durchlauf.';
 $('gif').href=name==='Idle'?'Mara-Blickkontakt.gif':'Mara-Necken-Koerper-Vergleich.gif';
 document.querySelectorAll('[data-clip]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.clip===name)));playing=true;state();draw();
 }catch(e){$('status').textContent='Laden fehlgeschlagen. Bitte die Seite neu laden.';console.error(e);}}
document.querySelectorAll('[data-clip]').forEach(b=>b.onclick=()=>choose(b.dataset.clip));
$('play').onclick=()=>{playing=!playing;state();};$('restart').onclick=()=>{t=0;playing=true;state();draw();};$('scrub').oninput=()=>{playing=false;t=Number($('scrub').value)/30;state();draw();};$('dark').onchange=()=>document.body.classList.toggle('dark',$('dark').checked);$('zoom').onchange=()=>document.body.classList.toggle('zoom',$('zoom').checked);
function tick(now){const dt=last?Math.min((now-last)/1000,.1):0;last=now;if(playing){t=(t+dt*Number($('speed').value))%manifest.comparisons[current].cycle;draw();}requestAnimationFrame(tick);}
await choose('TouchReaction');requestAnimationFrame(tick);


