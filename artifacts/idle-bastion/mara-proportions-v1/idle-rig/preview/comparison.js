const $=s=>document.querySelector(s),versions=['before','after'],cache=new Map();
let manifest,frame=0,elapsed=0,last=0,playing=true;
const page=(v,f)=>manifest.clips[v].pages[Math.floor(f/8)];
function load(url){
 if(cache.has(url))return cache.get(url);
 const e={image:new Image(),ready:false};cache.set(url,e);
 e.image.onload=()=>{e.ready=true;};e.image.onerror=()=>{$('#status').textContent='Ein Bild fehlt. Bitte die Vorschau neu laden.';playing=false;$('#play').textContent='Abspielen';};e.image.src=url;return e;
}
function draw(f){
 const entries=versions.map(v=>load(page(v,f)));if(entries.some(e=>!e.ready))return false;
 versions.forEach((v,i)=>{const c=$('#'+v),ctx=c.getContext('2d');ctx.clearRect(0,0,768,1024);ctx.drawImage(entries[i].image,f%4*768,Math.floor(f%8/4)*1024,768,1024,0,0,768,1024);c.dataset.frame=f;});
 $('#scrub').value=f;$('#time').textContent=(f/30).toFixed(2).replace('.',',')+' s';$('#status').textContent='';
 const keep=new Set();for(const v of versions){keep.add(page(v,f));keep.add(page(v,(Math.floor(f/8)*8+8)%150));load(page(v,(Math.floor(f/8)*8+8)%150));}
 if(cache.size>8)for(const [u,e] of cache){if(cache.size<=8)break;if(!keep.has(u)&&e.ready){cache.delete(u);e.image.src='';}}
 return true;
}
$('#play').onclick=()=>{playing=!playing;last=0;$('#play').textContent=playing?'Pause':'Abspielen';};
$('#restart').onclick=()=>{frame=0;elapsed=0;last=0;draw(frame);};
$('#scrub').oninput=e=>{playing=false;$('#play').textContent='Abspielen';frame=Number(e.target.value);elapsed=0;last=0;draw(frame);};
$('#dark').onchange=e=>document.body.classList.toggle('dark',e.target.checked);
$('#zoom').onchange=e=>document.body.classList.toggle('zoom',e.target.checked);
document.addEventListener('visibilitychange',()=>{last=0;});
function tick(now){requestAnimationFrame(tick);const dt=last?Math.min(.1,(now-last)/1000):0;last=now;if(document.hidden||!manifest)return;
 if(!draw(frame)){$('#status').textContent='Bilder werden geladen …';return;}
 if(!playing)return;elapsed+=dt*Number($('#speed').value);if(elapsed<1/30)return;
 const next=(frame+1)%150;if(versions.every(v=>load(page(v,next)).ready)){frame=next;elapsed-=1/30;}else elapsed=0;
}
try{const r=await fetch('manifest.json');if(!r.ok)throw Error('manifest');manifest=await r.json();$('#play').disabled=false;$('#restart').disabled=false;$('#play').textContent='Pause';requestAnimationFrame(tick);}catch(e){$('#status').textContent='Die Vergleichsdaten fehlen noch.';console.error(e);}
