import { MARA_FRAMES, MARA_FOOT, MARA_SCALE } from '../../../reference/src/style-assets';

type Direction = 'down' | 'right' | 'up' | 'left';
type Action = 'idle' | 'walk' | 'cast';
type Mode = Action | 'sequence';
type Clip = {frames:number[];durationsMs:number[];loop:boolean;releaseAtMs?:number};
type Atlas = {columns:number;frameSize:number[];foot:number[];directions:Record<Direction,Record<Action,Clip>>};
const urls = {
  atlas:new URL('../assets/ilyra/ilyra-atlas.png',import.meta.url).href,
  clips:new URL('../assets/ilyra/animations.json',import.meta.url).href,
  mara:new URL('../../../public/assets/Hero Mara.png',import.meta.url).href,
  grass:new URL('../../../public/assets/Grass Tileset.png',import.meta.url).href,
};
const get = <T extends HTMLElement>(id:string) => document.getElementById(id) as T;
const world=get<HTMLCanvasElement>('world'),detail=get<HTMLCanvasElement>('detail');
const directionInput=get<HTMLSelectElement>('direction');
let direction:Direction='right',mode:Mode='sequence',paused=false,time=0,last=performance.now();
let worldWidth=0,detailWidth=0,detailScale=4;
const pauseButton=get<HTMLButtonElement>('pause');
function setPaused(value:boolean){paused=value;pauseButton.textContent=paused?'Weiter':'Pause';pauseButton.setAttribute('aria-pressed',String(value));}
for(const button of Array.from(document.querySelectorAll<HTMLButtonElement>('[data-mode]')))button.onclick=()=>{
  mode=button.dataset.mode as Mode;time=0;setPaused(false);
  for(const item of Array.from(document.querySelectorAll('[data-mode]')))item.setAttribute('aria-pressed',String(item===button));
};
directionInput.onchange=()=>{direction=directionInput.value as Direction;time=0;};
pauseButton.onclick=()=>setPaused(!paused);
const anchors=get<HTMLInputElement>('anchors');

async function loadImage(url:string){const image=new Image();image.src=url;await image.decode();return image;}
function context(canvas:HTMLCanvasElement){const ctx=canvas.getContext('2d');if(!ctx)throw new Error('Canvas ist nicht verfügbar.');return ctx;}
function size(canvas:HTMLCanvasElement,width:number,height:number){
  // Integer physical pixels preserve the same logical 64px frame on dense screens.
  const density=Math.max(1,Math.min(3,Math.round(window.devicePixelRatio||1)));
  canvas.width=width*density;canvas.height=height*density;
  canvas.style.width=width+'px';canvas.style.height=height+'px';
  const ctx=context(canvas);ctx.setTransform(density,0,0,density,0,0);ctx.imageSmoothingEnabled=false;
}
function resize(){
  worldWidth=Math.floor(world.parentElement!.clientWidth-parseFloat(getComputedStyle(world.parentElement!).paddingLeft)*2);
  detailWidth=Math.floor(detail.parentElement!.clientWidth-parseFloat(getComputedStyle(detail.parentElement!).paddingLeft)*2);
  detailScale=detailWidth<450?3:4;
  size(world,worldWidth,174);size(detail,detailWidth,64*detailScale+32);
  get('detail-title').textContent=`Bewegung im Detail · ${detailScale}×`;
}
function at(clip:Clip,elapsed:number){
  const total=clip.durationsMs.reduce((a,b)=>a+b,0);
  let cursor=clip.loop?elapsed%total:Math.min(elapsed,total-0.001);
  for(let i=0;i<clip.frames.length;i++){if(cursor<clip.durationsMs[i])return clip.frames[i];cursor-=clip.durationsMs[i];}
  return clip.frames[clip.frames.length-1];
}
async function start(){
  const [atlas,maraSource,grass,response]=await Promise.all([loadImage(urls.atlas),loadImage(urls.mara),loadImage(urls.grass),fetch(urls.clips)]);
  if(!response.ok)throw new Error('Animationsdaten konnten nicht geladen werden.');
  const data=await response.json() as Atlas;
  const mara=document.createElement('canvas');mara.width=mara.height=256;
  const mc=context(mara);mc.imageSmoothingEnabled=false;
  MARA_FRAMES.forEach(({box:[left,top,right,bottom],foot:[fx,fy]},index)=>{
    mc.drawImage(maraSource,left,top,right-left,bottom-top,(index%4)*64+Math.round(MARA_FOOT[0]+(left-fx)*MARA_SCALE),Math.floor(index/4)*64+Math.round(MARA_FOOT[1]+(top-fy)*MARA_SCALE),Math.round((right-left)*MARA_SCALE),Math.round((bottom-top)*MARA_SCALE));
  });
  const pixels=mc.getImageData(0,0,256,256);
  for(let i=3;i<pixels.data.length;i+=4)pixels.data[i]=pixels.data[i]>=128?255:0;
  mc.putImageData(pixels,0,0);
  const duration=(action:Action)=>data.directions[direction][action].durationsMs.reduce((a,b)=>a+b,0);
  function current():{action:Action;elapsed:number}{
    const castDuration=duration('cast');
    if(mode==='sequence'){
      const phase=time%(2000+castDuration+900);
      if(phase<2000)return {action:'walk',elapsed:phase};
      if(phase<2300)return {action:'idle',elapsed:phase-2000};
      if(phase<2300+castDuration)return {action:'cast',elapsed:phase-2300};
      return {action:'idle',elapsed:phase-2300-castDuration};
    }
    if(mode==='cast'&&time>=castDuration)return {action:'idle',elapsed:time-castDuration};
    return {action:mode,elapsed:time};
  }
  get<HTMLButtonElement>('step').onclick=()=>{
    setPaused(true);
    if(mode==='sequence')time+=125;
    else {
      const clip=data.directions[direction][mode];
      const total=duration(mode);const elapsed=time%total;
      let boundary=0;
      for(const ms of clip.durationsMs){boundary+=ms;if(boundary>elapsed+0.001)break;}
      time=boundary>=total?0:boundary;
    }
  };
  function sprite(ctx:CanvasRenderingContext2D,image:CanvasImageSource,frame:number,columns:number,x:number,y:number,scale:number){
    ctx.drawImage(image,(frame%columns)*64,Math.floor(frame/columns)*64,64,64,Math.round(x-32*scale),Math.round(y-56*scale),64*scale,64*scale);
    if(anchors.checked){ctx.strokeStyle='#ffe6a2';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(x-5,y+.5);ctx.lineTo(x+5,y+.5);ctx.moveTo(x+.5,y-5);ctx.lineTo(x+.5,y+5);ctx.stroke();}
  }
  function label(ctx:CanvasRenderingContext2D,text:string,x:number,y:number){ctx.font='13px system-ui';ctx.textAlign='center';ctx.fillStyle='#f1ead6';ctx.fillText(text,x,y);}
  function draw(now:number){
    if(!paused)time+=Math.min(50,Math.max(0,now-last));last=now;
    const {action,elapsed}=current();
    const frame=at(data.directions[direction][action],elapsed);
    const maraBase=['down','left','right','up'].indexOf(direction)*4;
    const maraFrame=maraBase+(action==='cast'?3:action==='walk'?[1,0,2,0][Math.floor(elapsed/1000*7)%4]:0);
    const wc=context(world);wc.clearRect(0,0,worldWidth,174);
    for(let y=0;y<140;y+=40)for(let x=0;x<worldWidth;x+=40)wc.drawImage(grass,128,64,64,64,x,y,40,40);
    wc.fillStyle='#17291f';wc.fillRect(0,140,worldWidth,34);
    const wx1=Math.round(worldWidth*.33),wx2=Math.round(worldWidth*.67);
    sprite(wc,mara,maraFrame,4,wx1,109,1);sprite(wc,atlas,frame,data.columns,wx2,109,1);
    label(wc,'Mara',wx1,161);label(wc,'Ilyra',wx2,161);
    const dc=context(detail),height=64*detailScale+32;
    dc.fillStyle='#202b38';dc.fillRect(0,0,detailWidth,height);
    const baseline=56*detailScale+4,dx1=Math.round(detailWidth*.26),dx2=Math.round(detailWidth*.74);
    dc.fillStyle='#344353';dc.fillRect(0,baseline+1,detailWidth,1);
    sprite(dc,mara,maraFrame,4,dx1,baseline,detailScale);sprite(dc,atlas,frame,data.columns,dx2,baseline,detailScale);
    label(dc,'Mara',dx1,height-10);label(dc,'Ilyra',dx2,height-10);
    world.dataset.frame=String(frame);world.dataset.action=action;world.dataset.direction=direction;
    get('phase').textContent=action==='walk'?'Laufen · 8 Bilder/s':action==='cast'?(elapsed<180?'Zauber vorbereiten':elapsed<320?'Zauber auslösen':'Zauber ausklingen lassen'):'Stand';
    requestAnimationFrame(draw);
  }
  resize();window.addEventListener('resize',resize);
  document.documentElement.dataset.ready='true';requestAnimationFrame(draw);
}
start().catch(error=>{const element=get('error');element.hidden=false;element.textContent=String(error);});
