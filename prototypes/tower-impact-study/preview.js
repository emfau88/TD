import {LEVELS,NAMES,profile,drawImpact,drawTrail} from './effects.js?v=4';
const $=id=>document.getElementById(id),images=new Map(),visible=new Set(),effectCache=new Map();
const FX_SIZE=96,FX_FRAMES=10;
const kinds=[
 {id:1,name:'Waldwächter',color:'#e3d6a5',note:'Holz und Stahl → Silberfächer → Goldspaltung → Smaragdsalven.',scale:.6,duration:500},
 {id:2,name:'Frostkristall',color:'#ace7ec',note:'Eisbruch → Kristallkrone → Prismenkreuz → Aurorabruch.',scale:.8,duration:500},
 {id:3,name:'Steinschleuder',color:'#dec093',note:'Steinbruch → Glutstoß → Feuerstoß → Meteorsplitter.',scale:1.6,duration:500},
 {id:4,name:'Scharfschütze',color:'#c7e791',note:'Fokusblitz → Jadeschnitt → Doppellanze → Sternlanze.',scale:.6,duration:350}
];
let baseline,shotFrames,views=[],ready=false,last=null;
const motion=matchMedia('(prefers-reduced-motion: reduce)');
let time=motion.matches?620:0,playing=!motion.matches;
const observer=new IntersectionObserver(entries=>{for(const e of entries){if(e.isIntersecting){visible.add(e.target);if(ready){const v=views.find(v=>v.canvas===e.target);if(v)draw(v)}}else visible.delete(e.target)}},{rootMargin:'80px'});
function makeRows(){
 for(const v of views)observer.unobserve(v.canvas);views=[];visible.clear();$('rows').replaceChildren();
 const all=$('levels').value==='all';document.body.classList.toggle('all-levels',all);
 $('comparison-description').innerHTML='Links: <strong>Level 1–3 aus dem aktuellen Hauptspiel</strong>. Daneben die Entwürfe für <strong>'+(all?'alle acht Skins von Level 1 bis 25':'Level 10, 15 und 20')+'</strong> – jeder neue Skin bekommt einen eigenen Angriffscharakter.';
 const columns=[{level:0,label:'Level 1–3',note:'Original · Hauptspiel'},...(all?LEVELS:[10,15,20]).map(level=>({level,label:'Level '+level,note:level===1?'Entwurf · Basis −15 %':'Neuer Entwurf'}))];
 for(const k of kinds){
  const row=document.createElement('section');row.className='row';row.style.setProperty('--accent',k.color);
  row.innerHTML='<div class="row-head"><h2>'+k.name+'</h2><p>'+k.note+'</p></div><div class="grid"></div>';
  for(const entry of columns){
   const column={...entry,note:entry.level===0?entry.note:NAMES[k.id][LEVELS.indexOf(entry.level)]};
   const fig=document.createElement('figure');fig.className='cell';fig.innerHTML='<figcaption>'+column.label+'<small>'+column.note+'</small></figcaption><canvas role="img" aria-label="'+k.name+' '+column.label+' '+column.note+': animierter Treffervergleich"></canvas>';
   row.querySelector('.grid').append(fig);const canvas=fig.querySelector('canvas');views.push({canvas,k,column});observer.observe(canvas);
  }$('rows').append(row);
 }render(true);
}
function load(name){return new Promise((resolve,reject)=>{const im=new Image();im.onload=()=>{images.set(name,im);resolve()};im.onerror=()=>reject(Error('Grafik fehlt: '+name));im.src='./assets/'+name+'.png'})}
function zoom(){const w=innerWidth,h=innerHeight;return (w<=700&&h>w?Math.max(h/640,w/640):Math.min(w/1120,h/640))*Number($('zoom').value)}
function pixel(c,x,y,w,h,color){c.fillStyle=color;c.fillRect(Math.round(x),Math.round(y),w,h)}
function enemy(c,x,y,clock){
 c.fillStyle='#2b3c2890';c.beginPath();c.ellipse(x,y+9,11.5,4.5,0,0,Math.PI*2);c.fill();
 const im=images.get('enemy'),cols=im.width/64,f=40+Math.floor(clock/100)%8,s=.83;
 c.drawImage(im,f%cols*64,Math.floor(f/cols)*64,64,64,Math.round(x-32*s),Math.round(y-32*s),64*s,64*s);
 pixel(c,x-12,y-19,24,3,'#23322d');pixel(c,x-11,y-18,22,1,'#a9d37c');
}
function base(c,k,progress){
 if(progress<0||progress>=1)return;
 const m=baseline.sources.find(r=>r.kind===k.id).impact,im=images.get('low-impact-'+k.id),cols=im.width/m.width;
 const f=m.frameMap[Math.min(m.frameMap.length-1,Math.floor(progress*m.frameMap.length))],s=k.scale;
 c.drawImage(im,f%cols*m.width,Math.floor(f/cols)*m.height,m.width,m.height,-m.width*s/2,-m.height*s/2,m.width*s,m.height*s);
}
function atlasFor(k,level){
 const key=k.id+'-'+level;if(effectCache.has(key))return effectCache.get(key);
 const atlas=document.createElement('canvas');atlas.width=FX_SIZE*FX_FRAMES;atlas.height=FX_SIZE;
 const ctx=atlas.getContext('2d');ctx.imageSmoothingEnabled=false;const life=profile(k.id,level).life;
 for(let frame=0;frame<FX_FRAMES;frame++){
  ctx.save();ctx.translate(frame*FX_SIZE+FX_SIZE/2,FX_SIZE/2);
  drawImpact(ctx,k.id,level,(frame+.5)/FX_FRAMES*life,(cc,t)=>base(cc,k,t));
  ctx.restore();
 }
 effectCache.set(key,atlas);return atlas;
}
function impact(c,k,level,x,y,age){
 if(level===0){c.save();c.translate(Math.round(x),Math.round(y));base(c,k,age/k.duration);c.restore();return}
 const life=profile(k.id,level).life;if(age<0||age>=life)return;
 const atlas=atlasFor(k,level),frame=Math.min(FX_FRAMES-1,Math.floor(age/life*FX_FRAMES));
 c.drawImage(atlas,frame*FX_SIZE,0,FX_SIZE,FX_SIZE,Math.round(x-FX_SIZE/2),Math.round(y-FX_SIZE/2),FX_SIZE,FX_SIZE);
}
function shot(c,k,level,x,y,age){
 const im=images.get(level===0?'low-shot-'+k.id:'shot-'+k.id+'-'+level),s=k.id===1?.45:k.id===2?.5:.85;
 if(level>0)drawTrail(c,k.id,level,x,y,.96,-.28);
 c.save();c.translate(Math.round(x),Math.round(y));c.rotate(Math.PI/2-.28);
 const m=level===0?baseline.sources.find(r=>r.kind===k.id).shot:shotFrames[k.id+'-'+level];
 if(m){const cols=im.width/m.width,f=level===0?m.frameMap[Math.floor(age/100)%m.frameMap.length]:Math.floor(age/100)%m.frames;
  c.drawImage(im,f%cols*m.width,Math.floor(f/cols)*m.height,m.width,m.height,-m.width*s/2,-m.height*s/2,m.width*s,m.height*s);
 }else c.drawImage(im,-im.width*s/2,-im.height*s/2,im.width*s,im.height*s);
 c.restore();
}
function draw(v){
 const {canvas,k,column}=v,w=canvas.clientWidth,h=canvas.clientHeight,d=Math.min(devicePixelRatio||1,2);
 if(canvas.width!==Math.round(w*d)||canvas.height!==Math.round(h*d)){canvas.width=Math.round(w*d);canvas.height=Math.round(h*d)}
 const c=canvas.getContext('2d');c.setTransform(d,0,0,d,0,0);c.imageSmoothingEnabled=false;
 const z=zoom();c.scale(z,z);const ww=w/z,hh=h/z,cy=hh/2+2;
 for(let y=0;y<hh;y+=40)for(let x=0;x<ww;x+=40)c.drawImage(images.get('terrain'),128,64,64,64,x,y,40,40);
 for(let x=0;x<ww;x+=40)c.drawImage(images.get('terrain'),384,64,64,64,x,cy-20,40,40);
 const dense=$('dense').checked,targets=dense?[[-22,-7,0],[0,6,110],[23,-4,220]]:[[0,0,0]];
 if(dense)for(const [x,y] of [[-42,9],[39,12],[4,-13]])enemy(c,ww/2+x,cy+y,time);
 for(const [dx,dy,delay] of targets){
  const x=ww/2+dx,y=cy+dy,age=time-500-delay;enemy(c,x,y,time);
  if(age<0&&age>=-240){const p=1+age/240;shot(c,k,column.level,x-38*(1-p),y+11*(1-p),age+240)}
  impact(c,k,column.level,x,y,age);
 }
}
function render(force=false){
 if(!ready)return;for(const v of views)if(force||visible.has(v.canvas))draw(v);
 $('time').value=String(Math.round(time));const phase=time<500?'Anflug':time<1100?'Treffer':'Ausklang';
 if($('phase').textContent!==phase)$('phase').textContent=phase;
 $('play').textContent=playing?'Pause':'Abspielen';
 const status='Spielmaßstab: '+(zoom()/Number($('zoom').value)).toFixed(2)+' Bildschirmpixel pro Kartenpixel · '+($('zoom').value==='2'?'Detailansicht 2×':'Originalgröße für dieses Fenster')+' · '+($('dense').checked?'3 Treffer je Vergleichsfeld':'1 Treffer je Vergleichsfeld');
 if($('status').textContent!==status)$('status').textContent=status;
}
function loop(now){if(playing&&!document.hidden){if(last!==null)time=(time+Math.min(50,now-last)*Number($('speed').value))%1700;render()}last=now;requestAnimationFrame(loop)}
$('play').onclick=()=>{playing=!playing;last=null;render(true)};
$('peak').onclick=()=>{playing=false;time=$('dense').checked?840:620;render(true)};
$('time').oninput=()=>{playing=false;time=Number($('time').value);render(true)};
$('zoom').onchange=()=>{document.body.classList.toggle('detail',$('zoom').value==='2');render(true)};
$('dense').onchange=()=>{document.body.classList.toggle('dense-view',$('dense').checked);render(true)};
$('levels').onchange=makeRows;
addEventListener('resize',()=>render(true));document.addEventListener('visibilitychange',()=>{last=null});
motion.addEventListener('change',e=>{if(e.matches){playing=false;time=620;render(true)}});
$('benchmark').onclick=async()=>{
 if(!ready)return;const wasPlaying=playing;playing=false;render();
 const button=$('benchmark');button.disabled=true;$('benchmark-result').textContent='Prüfe 96 gleichzeitige Treffer …';
 const canvas=document.createElement('canvas');canvas.width=600;canvas.height=400;const c=canvas.getContext('2d');c.imageSmoothingEnabled=false;const result=[];
 try{
  for(const level of [1,10,25]){
   const samples=[];
   for(let frame=0;frame<40;frame++){
    if(frame%8===0)await new Promise(requestAnimationFrame);
    const start=performance.now();c.clearRect(0,0,600,400);
    for(let n=0;n<96;n++){const k=kinds[n%4];impact(c,k,level,25+(n%12)*50,25+Math.floor(n/12)*48,(n*17+frame*11)%profile(k.id,level).life)}
    if(frame>=8)samples.push(performance.now()-start);
   }
   samples.sort((a,b)=>a-b);result.push('L'+level+': Ø '+(samples.reduce((a,b)=>a+b)/samples.length).toFixed(2)+' ms · P95 '+samples[Math.ceil(samples.length*.95)-1].toFixed(2)+' ms');
  }
  $('benchmark-result').textContent='96 Treffer / Bild · CPU-Zeichenzeit — '+result.join(' | ')+'. Effekte als vorberechnete Sprites; ohne GPU-Gesamtkosten, Spielsimulation oder Smartphone-Messung.';
 }catch(e){$('benchmark-result').textContent='Messung fehlgeschlagen: '+e.message}
 finally{button.disabled=false;playing=wasPlaying;last=null;render()}
};
makeRows();
Promise.all([
 fetch('./baseline-main.json').then(r=>{if(!r.ok)throw Error('Originaldaten fehlen');return r.json()}).then(data=>{baseline=data}),
 fetch('./shot-frames.json').then(r=>{if(!r.ok)throw Error('Projektilframes fehlen');return r.json()}).then(data=>{shotFrames=data}),
 ...['terrain','enemy',...kinds.flatMap(k=>['low-impact-'+k.id,'low-shot-'+k.id,...LEVELS.map(level=>'shot-'+k.id+'-'+level)])].map(load)
]).then(()=>{ready=true;render(true);requestAnimationFrame(loop)}).catch(e=>{$('status').textContent=e.message+' – bitte Seite neu laden.';console.error(e)});
