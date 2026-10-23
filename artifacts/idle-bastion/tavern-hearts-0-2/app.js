import { Playback } from './playback.js?v=input2';
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const canvas=$('#figure'),ctx=canvas.getContext('2d');
const cache=new Map();
let manifest,content,hero='mara',heart=0,player,epoch=0,paused=false,error='',talkTurn=0,giftTurn=0,moment=null,touch=false,last=0;
const anchors={mara:{hair:[143,310],shoulder:[350,353],hand:[370,641]},ilyra:{hair:[174,286],shoulder:[342,333],hand:[384,600]}};
const title=h=>h==='mara'?'Mara':'Ilyra';
const stage=()=>content[hero].stages[heart];
const pageFor=(key,frame)=>manifest.heroes[hero][key].pages[Math.floor(frame/8)];
function fail(message){error=message;$('#loading').textContent=message;$('#retry').hidden=false;renderControls();}
function load(url){
  if(cache.has(url)){const entry=cache.get(url);entry.used=performance.now();return entry;}
  const e={image:new Image(),ok:false,used:performance.now(),error:false};cache.set(url,e);
  e.image.onload=()=>{e.ok=true;prune();};
  e.image.onerror=()=>{e.error=true;};
  e.image.src=url;return e;
}
function ready(key,frame){
  const e=load(pageFor(key,frame));
  if(e.error)fail('Ein Animationsbild konnte nicht geladen werden.');
  return e.ok;
}
function prune(){
  if(!player)return;
  const c=manifest.heroes[hero][player.key],p=Math.floor(player.frame/8);
  const keep=new Set([c.pages[p],c.pages[p+1],pageFor('idle',0)]);
  if(player.pending)keep.add(pageFor(player.pending.key,0));
  for(const frame of player.returnFrames)keep.add(pageFor('idle',frame));
  const removable=[...cache.entries()].filter(([u,e])=>e.ok&&!keep.has(u)).sort((a,b)=>a[1].used-b[1].used);
  while(cache.size>8&&removable.length){const [url,e]=removable.shift();e.image.src='';cache.delete(url);}
}
function draw(){
  const e=load(pageFor(player.key,player.frame));if(!e.ok)return false;
  const n=player.frame%8;ctx.clearRect(0,0,480,800);ctx.drawImage(e.image,n%4*480,Math.floor(n/4)*800,480,800,0,0,480,800);
  $('#clip-label').textContent=manifest.heroes[hero][player.key].label;
  canvas.dataset.clip=player.key;canvas.dataset.frame=player.frame;
  // Only the current clip and its imminent next page are fetched.
  const clip=manifest.heroes[hero][player.key],p=Math.floor(player.frame/8);
  if(clip.pages[p+1])load(clip.pages[p+1]);
  if(player.key!=='idle'&&player.frame>clip.count-16)load(pageFor('idle',0));
  prune();return true;
}
function renderControls(){
  const busy=!player||!!error;
  $$('#actions button[data-action],#touch-options button,#hotspots button,#variant,#next-beat,#moments button').forEach(b=>b.disabled=busy||Number(b.dataset.required||0)>heart);
  $('#joke').hidden=heart<2;$('#variant').hidden=heart<2;
  const pending=player?.pending, label=pending?.payload?.label||manifest?.heroes[hero][pending?.key]?.label;
  if(!error)$('#feedback').textContent=(paused?'Animation pausiert. ':'')+(pending?
    (player.key==='idle'?`${label} startet gleich.`:`Als Nächstes: ${label}. Weitere Auswahl ersetzt diese Aktion.`):
    player?.key!=='idle'?(paused?'Du kannst die nächste Aktion auswählen.':'Reaktion läuft. Du kannst die nächste Aktion auswählen.'):'');
  $('#cancel-next').hidden=!pending;
  $('#next-beat').disabled=busy||!!pending?.payload?.momentTitle;
  $('#hotspots').hidden=!touch||!!moment;$('#touch-options').hidden=!touch||!!moment;
  $('#actions').hidden=!!moment;$('#moment-controls').hidden=!moment;$('#moment-progress').hidden=!moment;
  $('#touch-mode').setAttribute('aria-pressed',String(touch));
}
function begin(key,line,meta={}){
  if(!player.request(key,{line,...meta}))return false;
  load(pageFor(key,0));for(const frame of player.returnFrames)load(pageFor('idle',frame));renderControls();return true;
}
function choose(){
  epoch++;error='';paused=false;last=0;talkTurn=0;giftTurn=0;moment=null;touch=false;
  player=new Playback(manifest.heroes[hero],heart);
  ctx.clearRect(0,0,480,800);$('#loading').textContent=title(hero)+' kommt ans Feuer …';$('#retry').hidden=true;
  $('#pause').textContent='Pause';$('#pause').setAttribute('aria-pressed','false');$('#pause').setAttribute('aria-label','Animation pausieren');
  canvas.setAttribute('aria-label',title(hero)+' in der Taverne');
  $$('[data-hero]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.hero===hero)));
  $$('[data-heart]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.heart)===heart)));
  $('#hero-name').textContent=title(hero);$('#stage-name').textContent=stage().name;$('#line').textContent=stage().greeting;
  $('#stage-note').textContent=['Ein ruhiger Anfang am Feuer.','Ein vertrauter Platz – und die erste persönliche Geschichte.','Mehr Vertrautheit, kleine Gesten und ein gemeinsames Lachen.'][heart];
  for(const [region,xy] of Object.entries(anchors[hero])){const b=$(`[data-region="${region}"]`);b.style.left=xy[0]/480*100+'%';b.style.top=xy[1]/800*100+'%';}
  const list=$('#moments');list.replaceChildren();
  for(const m of content[hero].moments){const b=document.createElement('button');b.dataset.required=m.heart;b.disabled=m.heart>heart;
    const name=document.createElement('strong');name.textContent=m.title;const info=document.createElement('small');info.textContent=m.heart>heart?`Ab ${m.heart} ♥`:`${m.heart} ♥ · Ansehen`;
    b.append(name,info);b.onclick=()=>startMoment(m);list.append(b);}
  $('#mapping').textContent='Sprechen und Haare → Kopfreaktion. Hand und Schulter → Berührungsreaktion. Schenken → Berührung; ab 2 Herzen abwechselnd Freude und Berührung. Scherzen → Kichern (ab 2). Persönliche Momente nutzen die ruhigen Kopf- und Berührungsreaktionen.';
  const u=new URL(location.href);u.searchParams.set('hero',hero);u.searchParams.set('hearts',heart);history.replaceState(null,'',u);
  load(pageFor('idle',0));renderControls();
}
function startMoment(m){
  if(m.heart>heart)return;
  const beat=m.beats[0];if(begin(beat.clip==='hair'?'head':'touch',beat.line,{momentTitle:m.title,beat:0,label:m.title})){moment={data:m,index:-1};$('#moment-progress').textContent=m.title+' · startet gleich';renderControls();}
}
function showMomentProgress(){
  if(moment){$('#moment-progress').textContent=moment.data.title+' · '+(moment.index+1)+' / 3';$('#next-beat').textContent=moment.index===2?'Moment abschließen':'Weiter';}
}
function endMoment(){moment=null;$('#line').textContent=stage().greeting;renderControls();}
function touchAt(region){begin(region==='hair'?'head':'touch',stage()[region],{label:({hair:'Haare berühren',shoulder:'Schulter berühren',hand:'Hand berühren'})[region]});}
$$('[data-hero]').forEach(b=>b.onclick=()=>{hero=b.dataset.hero;choose();});
$$('[data-heart]').forEach(b=>b.onclick=()=>{heart=Number(b.dataset.heart);choose();});
$$('[data-action]').forEach(b=>b.onclick=()=>{
  const act=b.dataset.action;
  if(act==='talk')begin('head',stage().talk[talkTurn%2],{action:act,label:'Sprechen'});
  if(act==='gift')begin(heart>=2&&giftTurn%2===0?'joy':'touch',stage().gift,{action:act,label:'Schenken'});
  if(act==='joke'&&heart>=2)begin('giggle',content[hero].joke,{label:'Scherzen'});
});
$('#touch-mode').onclick=()=>{touch=!touch;renderControls();};
$$('[data-touch],[data-region]').forEach(b=>b.onclick=()=>touchAt(b.dataset.touch||b.dataset.region));
$('#variant').onclick=()=>begin('variant',null);
$('#next-beat').onclick=()=>{
  if(!moment||player.pending?.payload?.momentTitle)return;
  if(moment.index===2){endMoment();return;}
  const i=moment.index+1,beat=moment.data.beats[i];
  begin(beat.clip==='hair'?'head':'touch',beat.line,{momentTitle:moment.data.title,beat:i,label:moment.data.title});
};
$('#end-moment').onclick=()=>{player.cancel();endMoment();};
$('#cancel-next').onclick=()=>{player.cancel();if(moment?.index===-1)endMoment();renderControls();};
$('#pause').onclick=()=>{paused=!paused;$('#pause').textContent=paused?'Weiter':'Pause';$('#pause').setAttribute('aria-pressed',String(paused));$('#pause').setAttribute('aria-label',paused?'Animation fortsetzen':'Animation pausieren');renderControls();};
$('#retry').onclick=()=>{for(const [u,e] of cache)if(e.error)cache.delete(u);choose();};
document.addEventListener('visibilitychange',()=>{last=0;});
function tick(now){
  requestAnimationFrame(tick);const dt=last?Math.min((now-last)/1000,.1):0;last=now;
  if(!player||document.hidden||paused||error)return;
  if(!ready(player.key,player.frame)){if(!error)$('#loading').textContent='Animation wird geladen …';return;}
  const oldKey=player.key,hadPending=!!player.pending;
  const changed=player.step(dt,ready);
  if(changed||!canvas.dataset.painted||canvas.dataset.epoch!==String(epoch)){
    draw();canvas.dataset.painted='true';canvas.dataset.epoch=String(epoch);
  }
  if(player.started){
    const p=player.started.payload;if(p?.line)$('#line').textContent=p.line;
    if(p?.action==='talk')talkTurn++;
    if(p?.action==='gift')giftTurn++;
    if(p?.momentTitle&&moment?.data.title===p.momentTitle){moment.index=p.beat;showMomentProgress();}
  }
  if(player.pending)load(pageFor(player.pending.key,0));
  if(!error)$('#loading').textContent=player.waiting?'Animationsbilder werden geladen …':'';
  if(player.started||oldKey!==player.key||hadPending!==!!player.pending)renderControls();
}
try{
  [manifest,content]=await Promise.all(['manifest.json','content.json'].map(async u=>{const r=await fetch(u);if(!r.ok)throw Error(u);return r.json();}));
  const q=new URLSearchParams(location.search);hero=q.get('hero')==='ilyra'?'ilyra':'mara';heart=Math.max(0,Math.min(2,Number(q.get('hearts'))||0));heart=Math.floor(heart);
  choose();requestAnimationFrame(tick);
}catch(e){fail('Die Vorschau konnte nicht geladen werden. Bitte die Seite neu laden.');$('#retry').onclick=()=>location.reload();console.error(e);}
