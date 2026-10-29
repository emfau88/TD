// Standalone study. No game imports, save access or combat changes.
const $=id=>document.getElementById(id);
const kinds=[
 {id:1,name:'Waldwächter',color:'#e3d6a5',note:'Pfeilkontakt → gerichtete Splitter, keine Explosion.',frames:6,scale:.6,duration:500,life:[280,330]},
 {id:2,name:'Frostkristall',color:'#ace7ec',note:'Kalter Bruch → Eisfacetten. Kein zusätzlicher Frostkreis.',frames:5,scale:.8,duration:500,life:[320,380]},
 {id:3,name:'Steinschleuder',color:'#dec093',note:'Staub und Steinsplitter → schwerer Kontakt, begrenzte Fläche.',frames:6,scale:1.6,duration:500,life:[360,420]},
 {id:4,name:'Scharfschütze',color:'#c7e791',note:'Grüner Durchschlag → kurzer, gerichteter Präzisionstreffer.',frames:9,scale:.6,duration:350,life:[240,290]}
];
const images=new Map(),views=[],visible=new Set(),motion=matchMedia('(prefers-reduced-motion: reduce)');
let time=motion.matches?620:0,playing=!motion.matches,last=null,ready=false;
function load(name){return new Promise((resolve,reject)=>{const im=new Image();im.onload=()=>{images.set(name,im);resolve()};im.onerror=()=>reject(Error('Grafik fehlt: '+name));im.src='./assets/'+name+'.png'})}
for(const k of kinds){
 const row=document.createElement('section');row.className='row';row.style.setProperty('--accent',k.color);
 row.innerHTML='<div class="row-head"><h2>'+k.name+'</h2><p>'+k.note+'</p></div><div class="grid"></div>';
 for(let tier=0;tier<3;tier++){
  const figure=document.createElement('figure');figure.className='cell';const label=['Heute','Level 10','Level 20'][tier];
  figure.innerHTML='<figcaption>'+label+'<small>'+['Original · hoher Turm','Vorschlag · auch 15','Vorschlag · auch 25'][tier]+'</small></figcaption><canvas role="img" aria-label="'+k.name+' '+label+': animierter Treffervergleich"></canvas>';
  row.querySelector('.grid').append(figure);views.push({canvas:figure.querySelector('canvas'),k,tier});
 } $('rows').append(row);
}
const observer=new IntersectionObserver(entries=>{for(const e of entries){if(e.isIntersecting){visible.add(e.target);if(ready)draw(views.find(v=>v.canvas===e.target))}else visible.delete(e.target)}},{rootMargin:'80px'});
views.forEach(v=>observer.observe(v.canvas));
function zoom(){const w=innerWidth,h=innerHeight;return (w<=700&&h>w?Math.max(h/640,w/640):Math.min(w/1120,h/640))*Number($('zoom').value)}
function pixel(c,x,y,w,h,color){c.fillStyle=color;c.fillRect(Math.round(x),Math.round(y),Math.max(1,Math.round(w)),Math.max(1,Math.round(h)))}
function line(c,x,y,xx,yy,color,width=1){const d=Math.ceil(Math.max(Math.abs(xx-x),Math.abs(yy-y)));for(let n=0;n<=d;n++)pixel(c,x+(xx-x)*n/Math.max(1,d),y+(yy-y)*n/Math.max(1,d),width,width,color)}
function shard(c,x,y,size,color){pixel(c,x,y-size,1,size*2+1,color);pixel(c,x-size,y,size*2+1,1,color)}
function enemy(c,x,y,clock){
 c.fillStyle='#2b3c2890';c.beginPath();c.ellipse(x,y+9,11.5,4.5,0,0,Math.PI*2);c.fill();
 const im=images.get('enemy'),cols=im.width/64,f=40+Math.floor(clock/100)%8,s=.83;
 c.drawImage(im,f%cols*64,Math.floor(f/cols)*64,64,64,Math.round(x-32*s),Math.round(y-32*s),64*s,64*s);
 pixel(c,x-12,y-19,24,3,'#23322d');pixel(c,x-11,y-18,22,1,'#a9d37c');
}
function original(c,k,x,y,age){
 if(age<0||age>=k.duration)return;
 const im=images.get('impact-'+k.id),f=Math.min(k.frames-1,Math.floor(age/k.duration*k.frames)),s=k.scale;
 c.drawImage(im,f*64,0,64,64,x-32*s,y-32*s,64*s,64*s);
}
function proposed(c,k,tier,x,y,age){
 const life=k.life[tier-1];if(age<0||age>=life)return;
 const t=age/life,elite=tier===2;
 c.save();c.translate(Math.round(x),Math.round(y));
 // Preserve the familiar contact language, then add a bounded material accent.
 if(k.id===1||k.id===2)original(c,k,0,0,age*1.5);
 if(k.id===4){c.save();c.scale(elite?.85:.65,elite?.85:.65);original(c,k,0,0,age*1.3);c.restore()}
 if(k.id===3&&t<.72){
  const w=(elite?19:14)*(0.8+Math.sin(t*Math.PI)*.2);
  c.globalAlpha=(1-t/.9)*.8;
  pixel(c,-w,2,w*2,8,'#706552');pixel(c,-w+4,-1,w*2-8,13,'#706552');
  pixel(c,-w+2,3,w*2-4,5,'#b5a17b');pixel(c,-w+5,1,w*2-10,9,elite?'#d1b68a':'#c4b18e');
 }
 c.globalAlpha=Math.min(1,(1-t)*2);
 if(age<90){const n=elite?4:3;pixel(c,-n,-n,n*2,n*2,'#f7f1d6')}
 if(age<170){pixel(c,-2,-2,4,4,elite?'#fff4ce':'#dde9dc')}
 if(k.id===1){
  const radius=3+Math.sqrt(t)*(elite?10:7),angles=elite?[-2.9,-2.3,-.9,-.25]:[-2.7,-.55,-1.6];
  for(const a of angles){const xx=Math.cos(a)*radius,yy=Math.sin(a)*radius;line(c,xx,yy,xx+Math.cos(a)*3,yy+Math.sin(a)*3,elite?'#aa8b53':'#778d7c',elite?3:2);line(c,xx,yy,xx+Math.cos(a)*2,yy+Math.sin(a)*2,elite?'#fff1cc':'#edf6e5',1)}
  if(t<.55)line(c,-6+t*8,3,3+t*8,-3,'#f4e9bf',elite?2:1);
 }else if(k.id===2){
  const radius=3+Math.sqrt(t)*(elite?13:9),angles=elite?[-2.9,-2.1,-1.15,-.3,1.1]:[-2.5,-1.2,.2,1.7];
  for(const a of angles){const xx=Math.cos(a)*radius,yy=Math.sin(a)*radius;line(c,xx,yy,xx+Math.cos(a)*3,yy+Math.sin(a)*4,'#6aaebf',2);pixel(c,xx,yy,elite?2:1,3,'#e4fcf6')}
  if(t<.42){line(c,-5,3,1,-3,'#d5f6f2');line(c,1,-3,6,2,'#99d9df')}
 }else if(k.id===3){
  // Low dust: no expanding damage-radius ring.
  const radius=5+t*(elite?18:14),count=elite?8:6;c.globalAlpha=(1-t)*.45;
  for(let i=0;i<3;i++)pixel(c,-radius+i*radius*.8,5+i%2*3,radius*.9,elite?6:4,'#bca57a');
  c.globalAlpha=Math.min(.95,(1-t)*1.6);
  for(let i=0;i<count;i++){const a=-Math.PI+(i/(count-1))*Math.PI,xx=Math.cos(a)*radius,yy=Math.sin(a)*radius*.65+t*t*15,n=i%3===0?4:3;pixel(c,xx,yy,n,n,'#746e5d');pixel(c,xx,yy,n,1,elite?'#f5d9a2':'#d8c8a4')}
  if(t<.4)pixel(c,-4,2,8,2,'#dfc89c');
 }else{
  // Visual direction does not add piercing or area damage.
  const radius=4+Math.sqrt(t)*(elite?12:9);
  if(t<.65){line(c,-radius,3,radius,-3,'#a8c87a',elite?2:1);line(c,-radius*.6,1,radius*.6,-2,'#f5ffda')}
  for(const a of (elite?[-2.5,-.7,.7,2.5]:[-2.5,-.7,1.2]))shard(c,Math.cos(a)*radius*.8,Math.sin(a)*radius*.65,elite?2:1,'#c7e68d');
 } c.restore();
}
function draw(v){
 const {canvas,k,tier}=v,w=canvas.clientWidth,h=canvas.clientHeight,d=Math.min(devicePixelRatio||1,2);
 if(canvas.width!==Math.round(w*d)||canvas.height!==Math.round(h*d)){canvas.width=Math.round(w*d);canvas.height=Math.round(h*d)}
 const c=canvas.getContext('2d');c.setTransform(d,0,0,d,0,0);c.imageSmoothingEnabled=false;const z=zoom();c.scale(z,z);const ww=w/z,hh=h/z,cy=hh/2+2;
 for(let y=0;y<hh;y+=40)for(let x=0;x<ww;x+=40)c.drawImage(images.get('terrain'),128,64,64,64,x,y,40,40);
 for(let x=0;x<ww;x+=40)c.drawImage(images.get('terrain'),384,64,64,64,x,cy-20,40,40);
 const dense=$('dense').checked,targets=dense?[[-22,-7,0],[0,6,110],[23,-4,220]]:[[0,0,0]];
 if(dense)for(const [x,y] of [[-42,9],[39,12],[4,-13]])enemy(c,ww/2+x,cy+y,time);
 for(const [dx,dy,delay] of targets){
  const x=ww/2+dx,y=cy+dy,age=time-500-delay;enemy(c,x,y,time);
  if(age<0&&age>=-240){
   const p=1+age/240,im=images.get('shot-'+k.id+'-'+(tier===1?10:20));
   c.save();c.translate(Math.round(x-38*(1-p)),Math.round(y+11*(1-p)));c.rotate(Math.PI/2-.28);
   const s=k.id===1?.45:k.id===2?.5:.85;c.drawImage(im,-im.width*s/2,-im.height*s/2,im.width*s,im.height*s);c.restore();
  }
  if(tier===0)original(c,k,x,y,age);else proposed(c,k,tier,x,y,age);
 }
}
function render(force=false){
 if(!ready)return;for(const v of views)if(force||visible.has(v.canvas))draw(v);
 $('time').value=String(Math.round(time));$('phase').textContent=time<500?'Anflug':time<1000?'Treffer':'Ausklang';$('play').textContent=playing?'Pause':'Abspielen';
 const status='Spielmaßstab: '+(zoom()/Number($('zoom').value)).toFixed(2)+' Bildschirmpixel pro Kartenpixel · '+($('zoom').value==='2'?'Detailansicht 2×':'Originalgröße für dieses Fenster')+' · '+($('dense').checked?'3 Treffer je Vergleichsfeld':'1 Treffer je Vergleichsfeld');if($('status').textContent!==status)$('status').textContent=status;
}
function loop(now){if(playing&&!document.hidden){if(last!==null)time=(time+Math.min(50,now-last)*Number($('speed').value))%1700;render()}last=now;requestAnimationFrame(loop)}
$('play').onclick=()=>{playing=!playing;last=null;render(true)};
$('peak').onclick=()=>{playing=false;time=620;render(true)};
$('time').oninput=()=>{playing=false;time=Number($('time').value);render(true)};
$('zoom').onchange=()=>{document.body.classList.toggle('detail',$('zoom').value==='2');render(true)};
$('dense').onchange=()=>{document.body.classList.toggle('dense-view',$('dense').checked);render(true)};addEventListener('resize',()=>render(true));document.addEventListener('visibilitychange',()=>{last=null});
motion.addEventListener('change',e=>{if(e.matches){playing=false;time=620;render(true)}});
Promise.all(['terrain','enemy',...kinds.flatMap(k=>['impact-'+k.id,'shot-'+k.id+'-10','shot-'+k.id+'-20'])].map(load)).then(()=>{ready=true;render(true);requestAnimationFrame(loop)}).catch(e=>{$('status').textContent=e.message+' – bitte Seite neu laden.';console.error(e)});
