const data=await fetch('assets/animation-manifest.json').then(r=>r.json());
const load=src=>new Promise((resolve,reject)=>{const im=new Image();im.onload=()=>resolve(im);im.onerror=reject;im.src=src;});
const [grass,road,leaf,...sprites]=await Promise.all(['assets/grass.png','assets/road.png',data.reference.url,...data.creatures.map(x=>x.animation.url)].map(load));
const sideSprites=await Promise.all(data.creatures.map(c=>load((c.sideAnimation||c.animation).url)));
const cards=document.querySelector('#cards'),pause=document.querySelector('#pause'),speed=document.querySelector('#speed'),detail=document.querySelector('#detail');
const travelLabel=document.createElement('label');travelLabel.innerHTML='Ansicht <select id="travel"><option value="front">Von vorn</option><option value="path">Auf dem Weg</option></select>';detail.parentElement.before(travelLabel);const travel=document.querySelector('#travel');
const descriptions=['Federt ein und hüpft weiter','Flackert beim Schweben','Schwebt mit bewegten Tentakeln'];
data.creatures.forEach((c,i)=>{
 const widths=c.animation.frames.map(f=>Math.round(f.bounds.width*data.scale)),heights=c.animation.frames.map(f=>Math.round(f.bounds.height*data.scale));
 const el=document.createElement('article');
 el.innerHTML=`<h2>${c.name}</h2><p class="label">${descriptions[i]}</p><canvas class="small" aria-label="${c.name}, animiert in kleiner Spielgröße"></canvas><p class="size-label">Spielmaßstab · ${Math.min(...widths)}–${Math.max(...widths)} × ${Math.min(...heights)}–${Math.max(...heights)} px</p><div class="detail" hidden><canvas class="large" aria-label="${c.name}, Animation vierfach vergrößert"></canvas><p class="zoom">Dieselbe Bewegung, 4× vergrößert</p></div>`;
 cards.append(el);
});
const small=[...document.querySelectorAll('.small')],large=[...document.querySelectorAll('.large')],reference=document.querySelector('#reference');
const surfaces=new Map();
function surface(canvas){
 const w=canvas.clientWidth,h=canvas.clientHeight,dpr=devicePixelRatio||1;
 let s=surfaces.get(canvas);
 if(!s||s.w!==w||s.h!==h||s.dpr!==dpr){canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);const ctx=canvas.getContext('2d');ctx.scale(dpr,dpr);ctx.imageSmoothingEnabled=false;s={ctx,w,h,dpr};surfaces.set(canvas,s);}
 return s;
}
function clip(c){return travel.value==='path'&&c.sideAnimation?c.sideAnimation:c.animation;}
function pose(c,time){const a=clip(c);let local=time%a.cycle,index=0;while(local>=a.frames[index].duration){local-=a.frames[index++].duration;}return index;}
function hop(time){
 const t=time%data.creatures[0].animation.cycle,keys=[[0,0],[250,0],[350,6],[420,7],[530,0],[760,0]];
 for(let i=1;i<keys.length;i++)if(t<keys[i][0]){const [a,y]=keys[i-1],[b,z]=keys[i],u=(t-a)/(b-a);return y+(z-y)*(1-Math.cos(u*Math.PI))/2;}
 return 0;
}
function sprite(ctx,img,c,index,x,y,multiplier=1){const s=data.scale*multiplier;ctx.drawImage(img,index*64,0,64,64,Math.round(x-c.pivot.x*s),Math.round(y-c.pivot.y*s),64*s,64*s);}
const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)');
let playing=!reducedMotion.matches,time=0,last=null,rate=1;
function sync(){pause.textContent=playing?'Pause':'Abspielen';pause.setAttribute('aria-pressed',String(!playing));}
function draw(){
 data.creatures.forEach((c,i)=>{
  const {ctx,w,h}=surface(small[i]),frame=pose(c,time),rise=i===0?hop(time):0;
  for(let y=0;y<h;y+=40)for(let x=0;x<w;x+=40)ctx.drawImage(grass,x,y,40,40);
  for(let x=0;x<w;x+=40)ctx.drawImage(road,x,40,40,40);
  // Equal illustrative speed, not proposed gameplay values. Wrap only outside the canvas.
  const walking=travel.value==='path',img=(walking?sideSprites:sprites)[i];
  const x=walking?(w*.30+26+time*.03)%(w+52)-26:w/2,y=67;
  ctx.fillStyle='#263e3055';ctx.beginPath();ctx.ellipse(x,y+1,10-rise*.25,3,0,0,Math.PI*2);ctx.fill();
  sprite(ctx,img,c,frame,x,y-rise);
  small[i].dataset.frame=String(frame);small[i].dataset.x=String(x);
  if(detail.checked){const big=surface(large[i]);big.ctx.clearRect(0,0,big.w,big.h);big.ctx.fillStyle='#213332';big.ctx.fillRect(12,8,big.w-24,big.h-16);sprite(big.ctx,img,c,frame,big.w/2,big.h-12-rise*4,4);}
 });
 const ref=surface(reference);ref.ctx.clearRect(0,0,ref.w,ref.h);sprite(ref.ctx,leaf,data.reference,0,ref.w/2,25);
}
pause.addEventListener('click',()=>{playing=!playing;last=null;sync();});
speed.addEventListener('change',()=>{rate=Number(speed.value);last=null;});
detail.addEventListener('change',()=>{document.querySelectorAll('.detail').forEach(el=>el.hidden=!detail.checked);draw();});
travel.addEventListener('change',()=>{data.creatures.forEach((c,i)=>{const frames=clip(c).frames,widths=frames.map(f=>Math.round(f.bounds.width*data.scale)),heights=frames.map(f=>Math.round(f.bounds.height*data.scale));cards.children[i].querySelector('.size-label').textContent=`Spielmaßstab · ${Math.min(...widths)}–${Math.max(...widths)} × ${Math.min(...heights)}–${Math.max(...heights)} px`;});draw();});
document.addEventListener('visibilitychange',()=>{last=null;});
reducedMotion.addEventListener('change',e=>{if(e.matches){playing=false;last=null;sync();}});
function tick(now){if(playing&&!document.hidden&&last!==null)time+=Math.min(now-last,80)*rate;last=now;draw();requestAnimationFrame(tick);}
// Read-only probe for the isolated preview check. No connection to game modules or saves.
window.creepPreview={snapshot:()=>({time,playing,rate,frames:data.creatures.map(c=>pose(c,time)),x:small.map(c=>Number(c.dataset.x)),scale:data.scale})};
await document.fonts.ready;sync();draw();new ResizeObserver(draw).observe(cards);window.previewReady=true;requestAnimationFrame(tick);
