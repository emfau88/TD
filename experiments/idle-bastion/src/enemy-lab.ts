import { ENEMIES, ENEMY_ROSTER, type EnemyId } from './enemy-roster';
import { ENEMY_SHEETS, enemyFrame, enemyFlip } from './enemy-art';
type Direction='down'|'up'|'side'|'left';
interface Cell{x:number;y:number;w:number;h:number;ms:number;pivot?:{x:number;y:number}}
type Clips=Record<string,Partial<Record<Direction,Cell[]>>>;
interface Candidate{id:string;variants?:{name:string;url:string}[];clips?:Clips;scale:number;pivot?:{x:number;y:number};versions?:Record<string,{url:string;clips:Clips}>}
interface Card{candidate:Candidate;group:string;canvas:HTMLCanvasElement;note:HTMLElement;select?:HTMLSelectElement;image?:HTMLImageElement;url?:string}
const select=(id:string)=>document.querySelector<HTMLSelectElement>('#'+id)!;
const images=new Map<string,HTMLImageElement>();
function load(url:string){if(!images.has(url)){const im=new Image();im.src=url;images.set(url,im);}return images.get(url)!;}
let age=0,paused=false,steps=0,zoom=1,last=performance.now();
const cards:Card[]=[];
document.querySelector<HTMLButtonElement>('#pause')!.onclick=e=>{paused=!paused;steps=0;(e.currentTarget as HTMLButtonElement).textContent=paused?'Weiter':'Pause';};
document.querySelector<HTMLButtonElement>('#step')!.onclick=()=>{paused=true;steps++;document.querySelector('#pause')!.textContent='Weiter';};
document.querySelector<HTMLButtonElement>('#zoom')!.onclick=e=>{zoom=zoom===1?2:1;(e.currentTarget as HTMLButtonElement).textContent=`Ansicht ${zoom}×`;};
function card(candidate:Candidate,group:string){
 const article=document.createElement('article');article.dataset.group=group;article.dataset.license=group==='shrooms'?'local':'public';
 const title=document.createElement('h2');title.textContent=group==='existing'?ENEMIES[candidate.id as EnemyId].name:candidate.id;article.append(title);
 let choice:HTMLSelectElement|undefined;
 if(candidate.variants){choice=document.createElement('select');choice.ariaLabel=candidate.id+' Farbvariante';
  const curated:Record<string,string[]>={dotcap:['dottedlime','ladybird','dalmatian','chocolatechip'],gillcap:['redherring','bluegill','ghostcarp','firefish'],mushmanflat:['greenaroundthegills','redberet','blancslate','blueberryberet'],mushmanpointy:['olivemylife','berrybadidea','mossappeal','creamofthecrop'],mushmanskullshroom:['deathcap','decomposting','badtothebone','deadlynightcap']};
  const preferred=curated[candidate.id]??[];
  for(const recommended of [true,false]){const group=document.createElement('optgroup');group.label=recommended?'Gut unterscheidbare Auswahl':'Weitere Originalpaletten';
   for(const v of candidate.variants.filter(v=>preferred.includes(v.name)===recommended).sort((a,z)=>recommended?preferred.indexOf(a.name)-preferred.indexOf(z.name):0))group.append(new Option(v.name,v.url));choice.append(group);}
  article.append(choice);
 }
 if(candidate.id==='MossShroom') {choice=document.createElement('select');choice.ariaLabel='Moospilz Farbvariante';choice.add(new Option('Rote Kappe','0'));choice.add(new Option('Moosgrüne Kappe','1'));article.append(choice);}
 const canvas=document.createElement('canvas'),note=document.createElement('small');article.append(canvas,note);document.querySelector('#grid')!.append(article);cards.push({candidate,group,canvas,note,select:choice});
}
for(const e of ENEMY_ROSTER.filter(e=>e.id!=='Rosenspiegel'))card({id:e.id,scale:ENEMY_SHEETS[e.id].scale},'existing');
try{
 if(!import.meta.env.DEV)throw Error('Private comparisons require a local development server');
 const response=await fetch('./.local-assets/gallery.json');if(!response.ok)throw Error('missing');
 const gallery=await response.json() as {shrooms:Candidate[];frak:Candidate[];spores:{url:string;name:string}[]};
 gallery.shrooms.forEach(c=>card(c,'shrooms'));gallery.frak.forEach(c=>card(c,'frak'));
 const footer=document.createElement('p');footer.textContent=`${gallery.shrooms.reduce((n,c)=>n+(c.variants?.length??0),0)} eindeutige Pilzfarbvarianten · Sporen: ${gallery.spores.length} lokale Effektvarianten; kein neuer Kampfzweck, daher nicht integriert.`;document.querySelector('header')!.append(footer);
}catch{for(const option of select('group').options)if(['shrooms','frak'].includes(option.value))option.disabled=true;select('group').value='new';document.querySelector('#status')!.textContent='Private Vergleichsdaten fehlen. Lokal scripts/import-local-enemies.py ausführen und die Vite-Vorschau öffnen; öffentliche Builds enthalten keine Shroom-Men-Sprites.';}
function spriteFrame(id:EnemyId,dir:Direction,skin=0){
 const s=ENEMY_SHEETS[id],direction=dir==='left'?'side':dir;
 const clip=dir==='left'&&s.move.left?s.move.left:s.move[direction];
 if(!clip.frames.length)return enemyFrame(id,direction,age+steps*.1,dir==='left');
 const first=enemyFrame(id,direction,age,dir==='left'),index=clip.frames.indexOf(first);
 return clip.frames[(Math.max(0,index)+steps)%clip.frames.length]+skin*32;
}
function index(cells:Cell[]){let ms=(age*1000)%cells.reduce((sum,f)=>sum+f.ms,0),i=0;for(;i<cells.length-1&&ms>=cells[i].ms;i++)ms-=cells[i].ms;return (i+steps)%cells.length;}
function render(time:number){
 if(!paused)age+=Math.min(.1,(time-last)/1000);last=time;
 const mode=select('group').value,dir:Direction=select('direction').value==='route'?(['side','down','left','up'] as const)[Math.floor(age/2)%4]:select('direction').value as Direction;
 const action=select('action').value,game=select('scale').value==='game';
 for(const c of cards){
  c.canvas.parentElement!.hidden=mode==='new'?!(c.group==='existing'&&ENEMIES[c.candidate.id as EnemyId].firstWave>40):mode!=='all'&&mode!==c.group;if(c.canvas.parentElement!.hidden)continue;
  const width=c.canvas.clientWidth,height=c.canvas.clientHeight,dpr=devicePixelRatio||1;
  if(c.canvas.width!==Math.round(width*dpr)||c.canvas.height!==Math.round(height*dpr)){c.canvas.width=Math.round(width*dpr);c.canvas.height=Math.round(height*dpr);}
  const ctx=c.canvas.getContext('2d')!;ctx.setTransform(dpr,0,0,dpr,0,0);ctx.imageSmoothingEnabled=false;ctx.clearRect(0,0,width,height);
  const ground=height*.67;
  function draw(im:HTMLImageElement,q:Cell,x:number,scale:number,pivot:{x:number;y:number},flip=false,lift=0){
   ctx.fillStyle='#253e3060';ctx.beginPath();ctx.ellipse(x,ground+9*zoom,11.5*zoom,4.5*zoom,0,0,Math.PI*2);ctx.fill();
   if(!im.complete||!im.naturalWidth)return;
   ctx.save();ctx.translate(x,ground+9*zoom-lift);ctx.scale(flip?-scale:scale,scale);ctx.drawImage(im,q.x,q.y,q.w,q.h,-pivot.x,-pivot.y,q.w,q.h);ctx.restore();
  }
  const ref=ENEMY_SHEETS.ForestGoblin,refim=load(ref.url),reference=spriteFrame('ForestGoblin',dir),refcols=refim.naturalWidth/ref.width||8;
  draw(refim,{x:reference%refcols*64,y:Math.floor(reference/refcols)*64,w:64,h:64,ms:100},width*.24,(game?ref.scale:1)*zoom,{x:32,y:43});
  let im:HTMLImageElement,q:Cell,pivot={x:32,y:43},scale=c.candidate.scale,flip=false,description='',frame=0;
  if(c.group==='existing'){
   const id=c.candidate.id as EnemyId,s=ENEMY_SHEETS[id];im=load(s.url);frame=spriteFrame(id,dir,Number(c.select?.value??0));const cols=im.naturalWidth/s.width||8;
   q={x:frame%cols*s.width,y:Math.floor(frame/cols)*s.height,w:s.width,h:s.height,ms:100};flip=enemyFlip(id,dir==='left'?'side':dir,dir==='left');pivot={x:s.width/2,y:s.height/2+9/s.scale};description=ENEMIES[id].firstWave>40?'SPIRE · neu ab Welle '+ENEMIES[id].firstWave:'SPIRE · vorhandene Bewegung';
  }else{
   let clips=c.candidate.clips!,url=c.select?.value;
   if(c.group==='frak'){const version=c.candidate.versions![select('resolution').value+'-'+select('outline').value];clips=version.clips;url=version.url;}
   const chosen=clips[action]?action:action==='Hurt'&&clips.Damaged?'Damaged':clips.Walk?'Walk':'Idle',cells=clips[chosen][dir]!;frame=index(cells);q=cells[frame];im=load(url!);pivot=q.pivot??c.candidate.pivot!;
   description=`${chosen} · Bild ${frame+1}/${cells.length}`;
   if(c.group==='frak'&&!clips.Walk)description+=['biter-plant-red','cobra-green','sandworm-pink'].includes(c.candidate.id)?' · stationär, ungeeignet für laufende Wellen':' · Flugbewegung';
   if(c.group==='shrooms')description+=' · nur lokal';
  }
  const flying=c.group==='existing'?ENEMIES[c.candidate.id as EnemyId].flying:c.group==='frak'&&['horned-bat-purple','dragon-whelp-green','floating-eye-purple','flame-wisp-orange'].includes(c.candidate.id);
  draw(im,q,width*.72,(game?scale:1)*zoom,pivot,flip,flying?(7+Math.sin(age*4)*2.5)*zoom:0);c.canvas.dataset.frame=String(frame);c.note.textContent=description;
  ctx.fillStyle='#203526';ctx.font='11px system-ui';ctx.textAlign='center';ctx.fillText('Waldgoblin',width*.24,height-5);ctx.fillText(game?'Spielgröße':'Original 1:1',width*.72,height-5);
 }
 if(cards.some(c=>c.group==='shrooms'))document.querySelector('#status')!.textContent=`${paused?'Angehalten':'Läuft'} · ${dir} · ${game?'Spielgröße':'Originalgröße'} · ${zoom}× · ${age.toFixed(1)} s`;
 requestAnimationFrame(render);
}
requestAnimationFrame(render);
