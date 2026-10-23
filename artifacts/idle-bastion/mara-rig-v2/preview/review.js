const $=s=>document.querySelector(s),canvas=$('#canvas'),ctx=canvas.getContext('2d');
const manifest=await fetch('manifest.json').then(r=>r.json()),rigData=await fetch('rig-poses.json').then(r=>r.json());
const cache=new Map();let current='Idle',frame=0,playing=true,elapsed=0,last=0,request=0;
const labels={Idle:'Idle',HeadReaction:'Kopfreaktion',TouchReaction:'Berührung'};
function loadImage(src){return new Promise((resolve,reject)=>{const im=new Image();im.onload=()=>resolve(im);im.onerror=reject;im.src=src+'?v=continuous-shoulders-final';});}
function loadClip(name){if(!cache.has(name))cache.set(name,Promise.all(manifest.clips[name].pages.map(loadImage)));return cache.get(name);}
let pages=[];
async function choose(name,play=true){const token=++request;$('#loading').hidden=false;$('#loading').textContent=`${labels[name]} wird geladen …`;
 try{const ready=await loadClip(name);if(token!==request)return;current=name;pages=ready;frame=0;elapsed=0;playing=play;$('#scrub').max=manifest.clips[name].count-1;document.querySelectorAll('[data-clip]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.clip===name)));$('#loading').hidden=true;$('#status').textContent=labels[name]+' · aus Unity gerendert';updatePlay();draw();}
 catch(e){$('#loading').textContent='Die Bilder konnten nicht geladen werden. Bitte den lokalen Vorschau-Server prüfen.';console.error(e);}}
function updatePlay(){$('#play').textContent=playing?'Pause':'Abspielen';}
function draw(){if(!pages.length)return;const c=manifest.clips[current],f=c.frames[frame];ctx.clearRect(0,0,768,1024);ctx.drawImage(pages[f[0]],f[1],f[2],f[3],f[4],c.crop[0],c.crop[1],f[3],f[4]);
 if($('#rig').checked){const poses=rigData.poses.filter(p=>p.clip.replaceAll(' ','')===current),t=frame/30;let a=poses[0],b=poses.at(-1);for(let i=1;i<poses.length;i++)if(poses[i].time>=t){a=poses[i-1];b=poses[i];break;}const u=b.time>a.time?(t-a.time)/(b.time-a.time):0;const js=a.joints.map((j,i)=>({...j,x:j.x+(b.joints[i].x-j.x)*u,y:j.y+(b.joints[i].y-j.y)*u}));ctx.strokeStyle='#60ffcf';ctx.fillStyle='#173a42';ctx.lineWidth=2;for(const j of js){if(j.parent>=0){ctx.beginPath();ctx.moveTo(js[j.parent].x,js[j.parent].y);ctx.lineTo(j.x,j.y);ctx.stroke();}ctx.beginPath();ctx.arc(j.x,j.y,4,0,Math.PI*2);ctx.fill();ctx.stroke();}}
 $('#scrub').value=frame;$('#time').textContent=`${(frame/30).toFixed(2).replace('.',',')} s · Bild ${frame+1}/${c.count}`;$('#original').href=`../unity/Export/${current}/frame-${String(frame).padStart(3,'0')}.png`;}
function tick(now){const delta=last?Math.min((now-last)/1000,.1):0;last=now;if(playing&&$('#loading').hidden){elapsed+=delta*Number($('#speed').value);const c=manifest.clips[current];if(elapsed>=c.duration){if(current!=='Idle'&&!$('#repeat').checked){playing=false;choose('Idle');}else elapsed%=c.duration;}const next=Math.min(c.count-1,Math.floor(elapsed*30));if(next!==frame){frame=next;draw();}}requestAnimationFrame(tick);}
document.querySelectorAll('[data-clip]').forEach(b=>b.addEventListener('click',()=>choose(b.dataset.clip)));
$('#play').onclick=()=>{playing=!playing;updatePlay();};$('#restart').onclick=()=>{frame=0;elapsed=0;playing=true;updatePlay();draw();};$('#rest').onclick=()=>choose('Idle',false);
$('#scrub').addEventListener('input',()=>{playing=false;frame=Number($('#scrub').value);elapsed=frame/30;updatePlay();draw();});
$('#background').onchange=()=>{$('#stage').classList.remove('dark','checker');if($('#background').value!=='light')$('#stage').classList.add($('#background').value);};$('#zoom').onchange=()=>$('#stage').classList.toggle('zoom',$('#zoom').checked);$('#rig').onchange=draw;
canvas.addEventListener('click',e=>{const rect=canvas.getBoundingClientRect();choose((e.clientY-rect.top)/rect.height<.4?'HeadReaction':'TouchReaction');});
const joints=rigData.poses[0].joints;$('#hierarchy').textContent=joints.map((j,i)=>{let depth=0,p=j.parent;while(p>=0){depth++;p=joints[p].parent;}return '  '.repeat(depth)+(depth?'└ ':'')+j.name;}).join('\n');
await choose('Idle');requestAnimationFrame(tick);




