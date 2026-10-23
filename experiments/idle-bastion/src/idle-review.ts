import './idle-review.css';
import maraBase from '../assets/runtime/mara-idle.webp';
import ilyraBase from '../assets/runtime/ilyra-idle.webp';
import maraShoulder from '../assets/runtime/mara-shoulder.webp';
import ilyraShoulder from '../assets/runtime/ilyra-shoulder.webp';
import maraExtra from '../assets/runtime/mara-reactions.webp';
import ilyraExtra from '../assets/runtime/ilyra-reactions.webp';
import maraMetadata from '../assets/mara-tavern/mara-atlas.json';
import ilyraMetadata from '../assets/ilyra-tavern/ilyra-atlas.json';
import maraReactions from '../assets/tavern-ui/mara-reactions.json';
import ilyraReactions from '../assets/ilyra-tavern/ilyra-reactions.json';
import maraCandidate from '../assets/mara-tavern/idle-study/candidate.webp';
import ilyraCandidate from '../assets/ilyra-tavern/idle-study/candidate.webp';
import maraStudy from '../assets/mara-tavern/idle-study/candidate.json';
import ilyraStudy from '../assets/ilyra-tavern/idle-study/candidate.json';

type Who = 'mara' | 'ilyra';
type Reaction = 'shoulder' | 'hand' | 'hair';
type Clip = number[][];
const assets = {
  mara: { base: maraBase, shoulder: maraShoulder, extra: maraExtra, meta: maraMetadata, reactions: maraReactions, candidate: maraCandidate, study: maraStudy, scale: 1, extraScale: 1, target: 192 },
  ilyra: { base: ilyraBase, shoulder: ilyraShoulder, extra: ilyraExtra, meta: ilyraMetadata, reactions: ilyraReactions, candidate: ilyraCandidate, study: ilyraStudy, scale: 1.1, extraScale: 1.17, target: 240 },
};
const el = <T extends HTMLElement>(id:string) => document.getElementById(id) as T;
const before = el<HTMLCanvasElement>('before'), after = el<HTMLCanvasElement>('after');
const time = el<HTMLInputElement>('time'), pause = el<HTMLButtonElement>('pause');
const touch = el<HTMLButtonElement>('touch'), note = el<HTMLParagraphElement>('note');
const cache = new Map<string, Promise<HTMLImageElement>>();
function load(url: string) {
  if (!cache.has(url)) cache.set(url, new Promise<HTMLImageElement>((resolve,reject) => {
    const image = new Image(); image.onload = () => resolve(image); image.onerror = () => { cache.delete(url); reject(new Error('Bild nicht geladen.')); }; image.src = url;
  }));
  return cache.get(url)!;
}
export const total = (clip:Clip) => clip.reduce((sum,[,ms]) => sum + ms!, 0);
export function frameAt(clip:Clip, elapsed:number):number {
  let remaining = ((elapsed % total(clip)) + total(clip)) % total(clip);
  for(const [frame,ms] of clip) { if(remaining<ms!)return frame!; remaining-=ms!; }
  return clip[0]![0]!;
}
let who:Who='mara', generation=0, ready=false, paused=false, elapsed=0, last=0, speed=1;
let base:HTMLImageElement, candidate:HTMLImageElement, shoulder:HTMLImageElement|undefined, extra:HTMLImageElement|undefined;
let reaction:Reaction|undefined, request=0;
const messages = {
  mara: 'Revision 2 · Stabile dunkle Haarkontur, drei kleine gezeichnete Atemschritte und ein Lidschlag nur mit den Augen. Kopf, Haare, Hände und Gürtel bleiben ruhig. Loopdauer: 4,64 Sekunden.',
  ilyra: 'Kleine Atemschritte und ein beidseitiger Lidschlag; Nase und Mund deutlicher. Der Speer stammt unverändert aus dem Original. 4,63 Sekunden je Loop.',
};
function spear(ctx:CanvasRenderingContext2D) {
  if(who!=='ilyra')return;
  const f=ilyraMetadata.frames[0]!;
  ctx.drawImage(base,0,0,100,f.height,240-f.anchorX*1.1,360-f.anchorY*1.1,110,f.height*1.1);
}
function draw(canvas:HTMLCanvasElement,index:number,isCandidate:boolean,activeReaction?:Reaction) {
  const frameKey=`${who}:${activeReaction??'idle'}:${index}`;
  // Holding a pose and crossing the seam must not clear/redraw its canvas.
  if(canvas.dataset.frame===frameKey)return;
  const ctx=canvas.getContext('2d')!;ctx.clearRect(0,0,384,512);ctx.imageSmoothingEnabled=false;
  const art=assets[who];spear(ctx);
  if(isCandidate&&!activeReaction) {
    // Review sheets are registered at belt (192/360) for Mara, (240/360) for Ilyra.
    const anchor=who==='mara'?192:240;
    ctx.drawImage(candidate,index*384,0,384,512,art.target-anchor*art.scale,360-360*art.scale,384*art.scale,512*art.scale);
  } else {
    const useExtra=activeReaction==='hand'||activeReaction==='hair';
    const f=(useExtra?art.reactions:art.meta).frames[index]!;
    const scale=useExtra?art.extraScale:art.scale,inset=who==='ilyra'?100:0;
    const useShoulder=!useExtra&&f.y>0;
    ctx.drawImage((useExtra?extra:useShoulder?shoulder:base)!, f.x+inset,f.y-(useShoulder?art.meta.frames[0]!.height:0),f.width-inset,f.height,
      art.target+(inset-f.anchorX)*scale,360-f.anchorY*scale,(f.width-inset)*scale,f.height*scale);
  }
  canvas.dataset.frame=frameKey;
}
function currentReaction():Clip {
  const art=assets[who];return reaction==='shoulder'?art.meta.touch:art.reactions[reaction as 'hand'|'hair'];
}
function render() {
  if(!ready)return;
  const art=assets[who], old=art.meta.idle, next=art.study.idle;
  const oldFrame=frameAt(reaction?currentReaction():old,elapsed), nextFrame=frameAt(reaction?currentReaction():next,elapsed);
  draw(before,oldFrame,false,reaction);draw(after,nextFrame,true,reaction);
  el<HTMLOutputElement>('before-state').value=`${reaction??'Idle'} · Bild ${oldFrame+1} · ${total(reaction?currentReaction():old)/1000} s`;
  el<HTMLOutputElement>('after-state').value=reaction?`Unveränderte ${reaction} · Bild ${nextFrame+1}`:`${art.study.labels[nextFrame]} · ${total(next)/1000} s`;
  const duration=total(reaction?currentReaction():next);
  time.value=String(Math.round((elapsed%duration)/duration*1000));
  el<HTMLOutputElement>('time-state').value=`${((elapsed%duration)/1000).toFixed(2)} s`;
  touch.disabled=!!reaction;
}
function renderFrames() {
  const strip=el<HTMLDivElement>('filmstrip');strip.replaceChildren();
  if(!ready||strip.hidden)return;
  assets[who].study.labels.forEach((label,i)=>{
    const figure=document.createElement('figure'),canvas=document.createElement('canvas'),caption=document.createElement('figcaption');
    canvas.width=384;canvas.height=512;canvas.setAttribute('role','img');canvas.setAttribute('aria-label',label);
    caption.textContent=`${i+1} · ${label}`;draw(canvas,i,true);figure.append(canvas,caption);strip.append(figure);
  });
}
async function select(next:Who) {
  const token=++generation;who=next;ready=false;reaction=undefined;elapsed=last=0;shoulder=extra=undefined;touch.disabled=true;
  el('filmstrip').replaceChildren();
  note.textContent='Bilder werden geladen …';
  before.getContext('2d')!.clearRect(0,0,384,512);after.getContext('2d')!.clearRect(0,0,384,512);
  delete before.dataset.frame;delete after.dataset.frame;
  el('revision').textContent=next==='mara'?'Revision 2':'Entwurf 1';
  document.querySelectorAll<HTMLButtonElement>('[data-hero]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.hero===who)));
  try {
    const art=assets[next], images=await Promise.all([load(art.base),load(art.candidate)]);
    if(token!==generation)return;
    [base,candidate]=images;ready=true;note.textContent=messages[next];touch.disabled=false;render();renderFrames();
  }catch{if(token===generation)note.textContent='Bilder konnten nicht geladen werden. Bitte die Figur erneut auswählen.';}
}
document.querySelectorAll<HTMLButtonElement>('[data-hero]').forEach(button=>button.addEventListener('click',()=>void select(button.dataset.hero as Who)));
pause.addEventListener('click',()=>{paused=!paused;last=0;pause.textContent=paused?'Fortsetzen':'Pausieren';pause.setAttribute('aria-pressed',String(paused));});
el('restart').addEventListener('click',()=>{reaction=undefined;elapsed=last=0;note.textContent=messages[who];render();});
function inspectMoment(position:number) {
  if(!ready)return;
  reaction=undefined;elapsed=position;last=0;paused=false;
  pause.textContent='Pausieren';pause.setAttribute('aria-pressed','false');note.textContent=messages[who];render();
}
el('blink-preview').addEventListener('click',()=>inspectMoment(who==='mara'?2900:3220));
el('seam-preview').addEventListener('click',()=>inspectMoment(total(assets[who].study.idle)-350));
el<HTMLSelectElement>('speed').addEventListener('change',event=>{speed=Number((event.target as HTMLSelectElement).value);last=0;});
el('portrait').addEventListener('click',()=>{const enabled=document.body.classList.toggle('portrait');el('portrait').setAttribute('aria-pressed',String(enabled));});
el<HTMLSelectElement>('background').addEventListener('change',event=>{const value=(event.target as HTMLSelectElement).value;document.body.classList.toggle('light',value==='light');document.body.classList.toggle('dark',value==='dark');});
time.addEventListener('input',()=>{paused=true;pause.textContent='Fortsetzen';pause.setAttribute('aria-pressed','true');elapsed=Number(time.value)/1000*(total(reaction?currentReaction():assets[who].study.idle)-1);last=0;render();});
el('frames').addEventListener('click',()=>{const strip=el('filmstrip');strip.hidden=!strip.hidden;el('frames').setAttribute('aria-expanded',String(!strip.hidden));renderFrames();});
touch.addEventListener('click',async()=>{
  if(!ready||reaction||touch.disabled)return;
  const token=generation,art=assets[who];touch.disabled=true;note.textContent='Gewählte Reaktion wird geladen …';
  try {
    const selected=el<HTMLSelectElement>('reaction').value as Reaction;
    const image=await load(selected==='shoulder'?art.shoulder:art.extra);
    if(token!==generation)return;
    if(selected==='shoulder')shoulder=image;else extra=image;
    reaction=selected;elapsed=last=0;paused=false;pause.textContent='Pausieren';pause.setAttribute('aria-pressed','false');note.textContent='Bestehende Reaktion auf beiden Seiten, anschließend Rückkehr zur jeweiligen Ruhepose.';render();
  }catch{if(token===generation){touch.disabled=false;note.textContent='Reaktion konnte nicht geladen werden. Erneut versuchen.';}}
});
function tick(now:number) {
  if(!document.hidden&&ready&&!paused) {
    if(last)elapsed+=Math.min(80,now-last)*speed;
    if(reaction&&elapsed>=total(currentReaction())){reaction=undefined;elapsed=0;note.textContent=messages[who];}
    render();
  }
  last=document.hidden||paused?0:now;request=requestAnimationFrame(tick);
}
document.addEventListener('visibilitychange',()=>{last=0;});
request=requestAnimationFrame(tick);
const requested=new URLSearchParams(location.search).get('hero');
void select(requested==='ilyra'?'ilyra':'mara');
if(import.meta.hot)import.meta.hot.dispose(()=>{generation++;cancelAnimationFrame(request);});
