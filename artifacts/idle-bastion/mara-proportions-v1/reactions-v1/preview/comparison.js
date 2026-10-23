const $=s=>document.querySelector(s), versions=['before','after'];
const names={idle:'Idle',head:'Kopfreaktion',touch:'Berührung',glance:'Blickkontakt',tease:'Necken',joy:'Aufrichten und Abfedern',hip:'Hand an die Hüfte',giggle:'Kichern'}, cache=new Map();
let manifest,selected=new URLSearchParams(location.search).get('clip')||'head',cursor=0,last=0,playing=true,drawn=-1,error='';
if(!Object.hasOwn(names,selected))selected='head';
function total(){return manifest.clips[selected].count+(selected!=='idle'&&$('#return').checked?manifest.clips.idle.count:0);}
function at(index){
 const clip=manifest.clips[selected];
 if(selected!=='idle'&&$('#return').checked&&index>=clip.count)return {key:'idle',frame:Math.min(index-clip.count,149)};
 return {key:selected,frame:Math.min(index,clip.last)};
}
function url(version,pose){return manifest.clips[pose.key].versions[version].pages[Math.floor(pose.frame/8)];}
function load(path){
 if(cache.has(path))return cache.get(path);
 const entry={image:new Image(),ready:false};cache.set(path,entry);entry.image.decoding='async';
 entry.image.onload=()=>{entry.ready=true;};entry.image.onerror=()=>{error='Ein Vorschauatlas fehlt. Bitte die lokale Exportfassung prüfen.';playing=false;$('#play').textContent='Abspielen';};entry.image.src=path;return entry;
}
function draw(index){
 const pose=at(index),paths=versions.map(v=>url(v,pose)),entries=paths.map(load);
 if(entries.some(e=>!e.ready)){$('#status').textContent=error||'Bilder werden geladen …';return false;}
 const crop=$('#detail').checked?[135,390,495,560]:[0,0,768,1024];
 versions.forEach((version,i)=>{
  const canvas=$('#'+version);if(canvas.width!==crop[2]||canvas.height!==crop[3]){canvas.width=crop[2];canvas.height=crop[3];}
  const ctx=canvas.getContext('2d');ctx.clearRect(0,0,canvas.width,canvas.height);
  ctx.drawImage(entries[i].image,(pose.frame%4)*768+crop[0],Math.floor((pose.frame%8)/4)*1024+crop[1],crop[2],crop[3],0,0,crop[2],crop[3]);
  canvas.dataset.frame=pose.frame;canvas.dataset.clip=pose.key;
 });
 $('#scrub').value=index;$('#time').textContent=(index/30).toFixed(2).replace('.',',')+' s';$('#phase').textContent=names[pose.key];$('#status').textContent=error;drawn=index;
 const keep=new Set(paths);
 for(const ahead of [1,8,16]){const next=at((index+ahead)%total());for(const v of versions){const path=url(v,next);keep.add(path);load(path);}}
 if(cache.size>12)for(const [path,entry] of cache){if(cache.size<=12)break;if(!keep.has(path)&&entry.ready){cache.delete(path);}}
 return true;
}
function configure(){
 cursor=0;drawn=-1;last=0;
 const withReturn=selected!=='idle'&&$('#return').checked;
 $('#scrub').max=withReturn?total()-1:manifest.clips[selected].last;
 $('#return').disabled=selected==='idle';
 document.querySelectorAll('button[data-clip]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.clip===selected)));
 const next=new URL(location.href);next.searchParams.set('clip',selected);history.replaceState(null,'',next);
 draw(0);
}
document.querySelectorAll('button[data-clip]').forEach(button=>button.onclick=()=>{if(!manifest?.clips[button.dataset.clip])return;selected=button.dataset.clip;configure();});
$('#play').onclick=()=>{playing=!playing;last=0;$('#play').textContent=playing?'Pause':'Abspielen';};
$('#restart').onclick=()=>{configure();};
$('#scrub').oninput=e=>{playing=false;$('#play').textContent='Abspielen';cursor=Number(e.target.value);drawn=-1;last=0;draw(cursor);};
$('#return').onchange=configure;
$('#detail').onchange=()=>{drawn=-1;draw(Math.floor(cursor));};
$('#dark').onchange=e=>document.body.classList.toggle('dark',e.target.checked);
document.addEventListener('visibilitychange',()=>{last=0;});
function tick(now){
 requestAnimationFrame(tick);const dt=last?Math.min(.1,(now-last)/1000):0;last=now;
 if(!manifest||document.hidden)return;
 if(drawn!==Math.floor(cursor)&&!draw(Math.floor(cursor)))return;
 if(!playing)return;
 const next=(cursor+dt*30*Number($('#speed').value))%total(),index=Math.floor(next);
 if(index===drawn||draw(index))cursor=next;
}
try{
 const response=await fetch('manifest.json',{cache:'no-store'});if(!response.ok)throw Error('Manifest fehlt');manifest=await response.json();if(!manifest.clips[selected])selected='head';configure();
 $('#play').disabled=false;$('#restart').disabled=false;$('#play').textContent='Pause';requestAnimationFrame(tick);
}catch(e){$('#status').textContent='Die Vergleichsdaten konnten nicht geladen werden.';console.error(e);}
