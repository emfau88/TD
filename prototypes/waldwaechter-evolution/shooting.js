import {LEVELS,SALVOS,CYCLE,sampleShot,geometry,tick,IMPACT_DURATION} from './shot-model.js?v=3';

export async function initShooting({manifest,terrain,sprites,drawPart,cameraZoom,loadImage}){
 const $=id=>document.getElementById(id),canvas=$('shot'),ctx=canvas.getContext('2d');
 const ammo=await Promise.all([1,2,3].map(n=>loadImage('./assets/shooting/original-'+n+'-projectile.png')));
 const originalWeapons=await Promise.all([1,2,3].map(n=>loadImage('./assets/shooting/original-'+n+'-weapon.png')));
 const steel=await Promise.all(['steel-arrow.png','arrow-15.png','arrow-20.png','arrow-25.png'].map(p=>loadImage('./assets/shooting/'+p)));
 const impact=await loadImage('./assets/shooting/impact.png');
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 let level=25,clock={time:0,last:null},playing=!reduced.matches,inView=false,width=0,height=0,raf=0;
 function active(){return playing&&inView&&!document.hidden;}
 function setPlay(value){
  playing=value;clock.last=null;$('shot-play').textContent=playing?'Pause':'Abspielen';
  $('shot-play').setAttribute('aria-pressed',String(playing));schedule();
 }
 function selectLevel(value){
  level=value;clock={time:0,last:null};
  document.querySelectorAll('[data-shot-level]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.shotLevel)===level)));
  $('shot-pattern').textContent='Level '+level+' · '+SALVOS[level].join(' + ')+(level===1?' Pfeil':' Pfeile')+(SALVOS[level].length>1?' in '+SALVOS[level].length+' Salven':' gleichzeitig');
  render();schedule();
 }
 function resize(){
  width=canvas.clientWidth;height=canvas.clientHeight;
  const dpr=Math.min(devicePixelRatio||1,2);canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);
  ctx.setTransform(dpr,0,0,dpr,0,0);ctx.imageSmoothingEnabled=false;render();
 }
 function render(){
  if(!width)return;
  const r=manifest.levels.find(r=>r.level===level),g=geometry(r.weaponY,Number($('shot-direction').value));
  const state=sampleShot(level,clock.time),zoom=cameraZoom();
  // Center the entire trajectory and building without changing the game's camera scale.
  const minX=Math.min(-32,g.end.x-24),maxX=Math.max(32,g.end.x+24);
  const minY=Math.min(-58,g.end.y-24),maxY=Math.max(30,g.end.y+24);
  const ox=width/2-(minX+maxX)/2*zoom,oy=height/2-(minY+maxY)/2*zoom;
  const px=x=>ox+x*zoom,py=y=>oy+y*zoom;
  for(let y=Math.floor(-oy/zoom/40)*40;y<(height-oy)/zoom;y+=40)
   for(let x=Math.floor(-ox/zoom/40)*40;x<(width-ox)/zoom;x+=40){
    ctx.drawImage(terrain,...manifest.terrain.grass,px(x),py(y),40*zoom+.1,40*zoom+.1);
   }
  // Subtle target marker is preview UI, not a new game asset.
  ctx.save();ctx.translate(px(g.end.x),py(g.end.y));ctx.strokeStyle='#f0d895';ctx.lineWidth=1.5;
  ctx.beginPath();ctx.arc(0,0,9*zoom,0,Math.PI*2);ctx.stroke();
  ctx.beginPath();ctx.moveTo(-13*zoom,0);ctx.lineTo(13*zoom,0);ctx.moveTo(0,-13*zoom);ctx.lineTo(0,13*zoom);ctx.stroke();ctx.restore();
  drawPart(ctx,level,'base',px(0),py(0),zoom);
  const s=manifest.scale*zoom;
  ctx.save();ctx.translate(px(-g.dx*state.recoil),py(r.weaponY-g.dy*state.recoil));ctx.rotate(g.angle);
  if(level<=3)ctx.drawImage(originalWeapons[level-1],state.originalFrame*96,0,96,96,-48*s,-48*s,96*s,96*s);
  else ctx.drawImage(sprites.get(level).compact.weapon,-48*s,-48*s,96*s,96*s);
  ctx.restore();
  for(const group of state.groups){
   if(group.flying){
    const x=g.start.x+g.dx*110*group.progress,y=g.start.y+g.dy*110*group.progress;
    const ps=.45*zoom;
    ctx.save();ctx.translate(px(x),py(y));ctx.rotate(g.angle);
    if(level<10){
     const img=ammo[group.count-1],fw=img.width/3,frame=Math.floor(group.age/.09)%3;
     ctx.drawImage(img,frame*fw,0,fw,40,-fw/2*ps,-20*ps,fw*ps,40*ps);
    }else{
     for(let i=0;i<group.count;i++)ctx.drawImage(steel[[10,15,20,25].indexOf(level)],((i-(group.count-1)/2)*8-4)*ps,-20*ps,8*ps,40*ps);
    }
    ctx.restore();
   }
  }
  // One shared bounded impact sprite; later cosmetic waves restart it, never stack flashes.
  const hit=[...state.groups].reverse().find(group=>group.impact);
  if(hit){
   const frame=Math.min(5,Math.floor(hit.impactAge/IMPACT_DURATION*6)),is=.6*zoom;
   ctx.drawImage(impact,frame*64,0,64,64,px(g.end.x)-32*is,py(g.end.y)-32*is,64*is,64*is);
  }
  $('shot-time').value=String(Math.round(clock.time*1000));
  $('shot-phase').textContent=state.phase+' · '+clock.time.toFixed(2)+' s';
  canvas.dataset.level=String(level);canvas.dataset.phase=state.phase;canvas.dataset.time=clock.time.toFixed(4);
  canvas.dataset.salvos=SALVOS[level].join('+');canvas.dataset.playing=String(playing);canvas.dataset.zoom=zoom.toFixed(6);
 }
 function frame(now){raf=0;clock=tick(clock,now,active(),Number($('shot-speed').value));render();schedule();}
 function schedule(){if(active()&&!raf)raf=requestAnimationFrame(frame);}
 function seek(time){setPlay(false);clock={time,last:null};render();}
 LEVELS.forEach(n=>{
  const b=document.createElement('button');b.type='button';b.textContent='Lv. '+n;b.dataset.shotLevel=String(n);
  b.addEventListener('click',()=>selectLevel(n));$('shot-levels').append(b);
 });
 $('shot-play').addEventListener('click',()=>setPlay(!playing));
 $('shot-restart').addEventListener('click',()=>{clock={time:0,last:null};setPlay(true);render();});
 $('shot-time').max=String(CYCLE*1000);$('shot-time').addEventListener('input',e=>seek(Number(e.target.value)/1000));
 $('shot-flight').addEventListener('click',()=>seek(.37));
 $('shot-impact').addEventListener('click',()=>seek(sampleShot(level,0).groups.at(-1).arrival+.18));
 $('shot-direction').addEventListener('change',render);
 $('shot-speed').addEventListener('change',()=>{clock.last=null;});
 document.addEventListener('visibilitychange',()=>{clock.last=null;schedule();});
 reduced.addEventListener('change',e=>{if(e.matches)setPlay(false);});
 new IntersectionObserver(([entry])=>{inView=entry.isIntersecting;clock.last=null;schedule();}).observe(canvas);
 new ResizeObserver(resize).observe(canvas);
 window.addEventListener('resize',resize);
 setPlay(playing);selectLevel(level);resize();
}
