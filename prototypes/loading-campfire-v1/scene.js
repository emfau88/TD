(() => {
 'use strict';
 const $=id=>document.getElementById(id),scene=$('scene'),canvas=$('fire'),ctx=canvas.getContext('2d');
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 let moving=!reduced.matches,lang='de',elapsed=0,previous=0,lastDraw=-1,finished=false,lastPercent=-1,lastPaint=0;
 const copy={de:{location:'Der alte Hain',draft:'VISUELLER ENTWURF',status:['Das Lager erwacht …','Die Türme werden vorbereitet …','Deine Gefährten warten …','Bereit für das nächste Abenteuer.'],quip:'Wir erklären den Monstern, wie Anstehen funktioniert.',replay:'Vorschau erneut abspielen',pause:'Animation anhalten',play:'Animation abspielen'},en:{location:'The Old Grove',draft:'VISUAL CONCEPT',status:['Waking up the camp…','Preparing the towers…','Your companions are waiting…','Ready for the next adventure.'],quip:'Convincing the monsters to queue politely.',replay:'Replay preview',pause:'Pause animation',play:'Play animation'}};
 const frames=new Image();frames.src='assets/fire-atlas.webp';
 // The canvas plays actual generated flame frames. No image stretching or particle substitute.
 function drawFire(frame){if(!frames.complete||!frames.naturalWidth)return;const w=frames.naturalWidth/4,h=frames.naturalHeight/2;ctx.clearRect(0,0,320,320);ctx.imageSmoothingEnabled=true;ctx.drawImage(frames,(frame%4)*w,Math.floor(frame/4)*h,w,h,0,0,320,320);}
 function translate(){const t=copy[lang];document.documentElement.lang=lang;$('location').textContent=t.location;$('draft').textContent=t.draft;$('quip').textContent=t.quip;$('replay').innerHTML=t.replay+' <span aria-hidden="true">↻</span>';$('lang').textContent=lang==='de'?'EN':'DE';$('lang').setAttribute('aria-label',lang==='de'?'Switch to English':'Auf Deutsch wechseln');motionLabel();lastPercent=-1;progress();}
 function motionLabel(){const label=copy[lang][moving?'pause':'play'];$('motion').setAttribute('aria-label',label);$('motion').title=label;$('motion').setAttribute('aria-pressed',String(moving));scene.classList.toggle('still',!moving);}
 function progress(){const p=Math.min(100,Math.round(elapsed/165));if(p===lastPercent)return;lastPercent=p;const stage=p>=100?3:p<34?0:p<73?1:2;$('status').textContent=copy[lang].status[stage];$('percentage').textContent=p+'%';$('fill').style.width=p+'%';document.querySelector('.track').setAttribute('aria-valuenow',String(p));if(p===100&&!finished){finished=true;document.querySelector('.loading').classList.add('complete');$('replay').hidden=false;}}
 const embers=[];
 for(let i=0;i<24;i++){const e=document.createElement('i');e.className='ember';document.querySelector('.embers').append(e);embers.push(e);}
 // Emit in the upper flame, then rise beyond its silhouette at every screen size.
 function placeEmbers(){const forest=document.querySelector('.world'),sky=document.querySelector('.sky'),portrait=matchMedia('(orientation:portrait)').matches,scale=Math.max(forest.clientWidth/1671,forest.clientHeight/941),w=1671*scale,h=941*scale;
  sky.style.cssText=`width:${w}px;height:${h}px;left:${(forest.clientWidth-w)*(portrait?.7:.5)}px;top:${(forest.clientHeight-h)*(portrait?.5:.52)}px`;
  const fire=canvas.getBoundingClientRect(),title=document.querySelector('.title-block').getBoundingClientRect(),maxRise=Math.max(35,fire.y+fire.height*.38-title.bottom-14);
  embers.forEach((e,i)=>{const f=(i*.61803398875)%1,large=i===7||i===19,rise=Math.min(maxRise,fire.width*(.85+f*.95)),drift=Math.sin(i*2.4)*fire.width*.25;e.classList.toggle('ember-large',large);e.style.cssText=`--start:${(f-.5)*fire.width*.18}px;--bend:${drift*.25+Math.sin(i)*12}px;--drift:${drift}px;--rise:${-rise}px;--mid-rise:${-rise*.5}px;--size:${large?4.5:2.1+f*1.2}px;--duration:${large?7+f*2:3.1+f*2.2}s;--delay:${-i*.57}s`;});}
 new ResizeObserver(placeEmbers).observe(canvas);placeEmbers();document.fonts.ready.then(placeEmbers);
 for(let i=0;i<14;i++){const e=document.createElement('i');e.className='star';e.style.cssText=`left:${9+(i*17.37)%82}%;top:${3+(i*9.51)%26}%;--duration:${2.4+(i%5)}s;--delay:${-i*.67}s`;document.querySelector('.stars').append(e);}
 function loop(now){const delta=previous?Math.min(now-previous,100):0;previous=now;if(!document.hidden){elapsed+=delta;progress();const frame=moving?Math.floor(now/115)%8:0;if(frame!==lastDraw){drawFire(frame);lastDraw=frame;}if(moving&&now-lastPaint>33){scene.style.setProperty('--light',String(.55+.10*Math.sin(now*.006)+.06*Math.sin(now*.017)));lastPaint=now;}}requestAnimationFrame(loop);}
 frames.onload=()=>{lastDraw=-1;drawFire(0);};
 $('motion').addEventListener('click',()=>{moving=!moving;motionLabel();lastDraw=-1;});
 reduced.addEventListener('change',()=>{moving=!reduced.matches;motionLabel();});
 $('lang').addEventListener('click',()=>{lang=lang==='de'?'en':'de';translate();});
 $('replay').addEventListener('click',()=>{elapsed=0;finished=false;$('replay').hidden=true;document.querySelector('.loading').classList.remove('complete');progress();});
 $('fullscreen').addEventListener('click',async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await scene.requestFullscreen();}catch{}});
 if(!document.fullscreenEnabled)$('fullscreen').hidden=true;
 document.addEventListener('visibilitychange',()=>{previous=0;});
 translate();requestAnimationFrame(loop);
})();
