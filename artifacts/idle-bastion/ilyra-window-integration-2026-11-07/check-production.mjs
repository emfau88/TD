import { chromium } from 'file:///C:/Users/madde/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
import { readFile,writeFile,mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';
const base=process.env.AUDIT_BASE||'http://127.0.0.1:5281/';
const out=new URL(process.env.AUDIT_PUBLIC?'./public/':'./production/',import.meta.url);await mkdir(out,{recursive:true});
const fixture=JSON.parse(await readFile(new URL('../tavern-targets-2026-11-07/main-save.json',import.meta.url),'utf8'));
fixture.battle.social.points={mara:110,ilyra:110};
for(const who of ['mara','ilyra'])for(const r of Object.values(fixture.battle.social.encounters[who])){r.seen=true;r.completed=true;r.choice=null;}
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});const results=[];
const ready=p=>p.waitForFunction(()=>document.querySelector('.tv-figure canvas')?.dataset.clip==='idle'&&!document.querySelector('[data-do=speak]').disabled);
try{
 for(const [who,width,lang] of [['ilyra',1280,'de'],['ilyra',390,'en'],['mara',1280,'en'],['mara',390,'de']]){
  const name=`${who}-${width}`,place=who==='mara'?'mara-counter':'ilyra-window';
  const p=await browser.newPage({viewport:{width,height:844},isMobile:width===390,hasTouch:width===390});const errors=[],badRequests=[];
  p.on('pageerror',e=>errors.push(e.message));p.on('response',r=>{if(r.status()>=400)badRequests.push([r.status(),r.url()]);});
  await p.addInitScript(()=>{
    window.reviewVideos=new Set();const play=HTMLMediaElement.prototype.play;
    HTMLMediaElement.prototype.play=function(...args){if(this instanceof HTMLVideoElement)window.reviewVideos.add(this);return play.apply(this,args);};
  });
  await p.goto(base);const probe='window-integration-'+crypto.randomUUID();
  await p.evaluate(async({fixture,probe,lang})=>{
    localStorage.setItem('spire-language-v1',lang);
    const db=await new Promise((resolve,reject)=>{const r=indexedDB.open('spire-idle-bastion-probe-'+probe,1);r.onupgradeneeded=()=>r.result.createObjectStore('saves');r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});
    await new Promise((resolve,reject)=>{const t=db.transaction('saves','readwrite');t.objectStore('saves').put(fixture,'default');t.oncomplete=resolve;t.onerror=()=>reject(t.error);});db.close();
  },{fixture,probe,lang});
  await p.goto(base+'?probe='+probe);await p.waitForFunction(()=>document.querySelector('#boot-screen')?.hidden===true);
  if(await p.locator('#claim-offline').isVisible())await p.click('#claim-offline');
  await p.click('#settlement-tab');await p.click('#pick-tavern');await p.click(`[data-do=${who}]`);await ready(p);
  await p.click('[data-do=speak]');await p.click('[data-do=switch-location]');
  await p.waitForFunction(place=>document.querySelector('.tv-stage')?.dataset.videoScene===place,place);await ready(p);
  await p.evaluate(place=>{
    const c=document.querySelector('.tv-figure canvas'),s=document.querySelector('.tv-stage'),sample=document.createElement('canvas');sample.width=96;sample.height=140;const ctx=sample.getContext('2d',{willReadFrequently:true});
    const initial=s.getBoundingClientRect();window.audit={running:true,frames:0,clips:{},issues:[],css:new Set(),frameSteps:[],last:null};
    function tick(now){const a=window.audit;if(!a.running)return;requestAnimationFrame(tick);ctx.clearRect(0,0,96,140);ctx.drawImage(c,0,0,96,140);const d=ctx.getImageData(0,0,96,140).data;
      let alpha=0,black=0;const darkEdges=[0,0,0,0];for(let y=0;y<140;y++)for(let x=0;x<96;x++){const i=(y*96+x)*4,dark=Math.max(d[i],d[i+1],d[i+2])<=8;if(d[i+3]<250)alpha++;if(dark){black++;if(x<2)darkEdges[0]++;if(x>=94)darkEdges[1]++;if(y<2)darkEdges[2]++;if(y>=138)darkEdges[3]++;}}
      const r=s.getBoundingClientRect(),style=getComputedStyle(c);const clip=c.dataset.clip,frame=Number(c.dataset.frame);a.frames++;a.clips[clip]=(a.clips[clip]||0)+1;a.css.add([style.filter,style.boxShadow,style.opacity].join('|'));
      if(alpha||black>96*140*.9||darkEdges.some((n,i)=>n/(i<2?280:192)>.95)||s.dataset.videoScene!==place||Math.abs(r.width-initial.width)>.1||Math.abs(r.height-initial.height)>.1)a.issues.push({now,clip,alpha,black,scene:s.dataset.videoScene});
      if(a.last?.clip===clip&&frame>a.last.frame)a.frameSteps.push({clip,delta:frame-a.last.frame,ms:now-a.last.now});
      if(a.last?.frame!==frame||a.last?.clip!==clip)a.last={clip,frame,now};
    }requestAnimationFrame(tick);
  },place);
  await p.screenshot({path:fileURLToPath(new URL(`${name}-idle.png`,out))});
  const actions=[['[data-action=talk]','talk'],['[data-region=hair]','hair'],['[data-region=shoulder]','shoulder'],['[data-region=hand]','hand']];
  if(who==='mara')actions.push(['[data-gesture=giggle]','laugh'],['[data-gesture=hip]','approach']);
  for(const [selector,clip]of actions){
    if(selector.includes('gesture')||clip==='talk')await p.click('[data-do=speak]');
    await p.click(selector);await p.waitForFunction(clip=>document.querySelector('.tv-figure canvas').dataset.clip===clip,clip);
    if(clip==='shoulder'||clip==='hand'){await p.waitForFunction(clip=>{const c=document.querySelector('.tv-figure canvas');return c.dataset.clip===clip&&+c.dataset.frame>=25;},clip);await p.screenshot({path:fileURLToPath(new URL(`${name}-${clip}.png`,out))});}
    await ready(p);
  }
  const audit=await p.evaluate(()=>{window.audit.running=false;const a=window.audit;return {...a,css:[...a.css]};});assert.deepEqual(audit.issues,[]);assert.equal(audit.css.length,1);
  await p.click('[data-do=speak]');
  for(const key of ['giggle','hip'])assert.equal(await p.locator(`[data-gesture=${key}]`).isVisible(),who==='mara');
  // Historic heart memories intentionally use their original room, then restore the chosen place.
  await p.click('[data-moment="4"]');await p.waitForFunction(()=>document.querySelector('#tavern-dialog').dataset.location==='standard');
  await p.waitForFunction(()=>document.querySelector('[data-do=story-exit]')?.offsetParent!==null);await p.click('[data-do=story-exit]');
  await p.waitForFunction(place=>document.querySelector('#tavern-dialog').dataset.location===place,place);await ready(p);
  await p.click('[data-do=speak]');await p.click('[data-do=switch-location]');await p.waitForFunction(()=>document.querySelector('#tavern-dialog').dataset.location==='standard');await ready(p);
  await p.click('[data-do=speak]');for(const key of ['giggle','hip'])assert.equal(await p.locator(`[data-gesture=${key}]`).isVisible(),true);
  const quality=await p.evaluate(()=>[...window.reviewVideos].map(v=>({source:v.currentSrc||v.src,width:v.videoWidth,height:v.videoHeight,total:v.getVideoPlaybackQuality().totalVideoFrames,dropped:v.getVideoPlaybackQuality().droppedVideoFrames})).filter(v=>v.width));
  assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);assert.deepEqual(errors,[]);assert.deepEqual(badRequests,[]);
  await p.reload();await p.waitForFunction(()=>document.querySelector('#boot-screen')?.hidden===true);if(await p.locator('#claim-offline').isVisible())await p.click('#claim-offline');
  results.push({who,width,lang,frames:audit.frames,clips:audit.clips,blackOrTransparentFrames:0,wrongScenes:0,stableStage:true,storyReturn:true,standardGesturesPreserved:true,reload:true,quality,errors});
  await writeFile(new URL(`${name}-audit.json`,out),JSON.stringify(audit,null,2));console.log(`${name}: ${audit.frames} frames, local reactions/return/size/memories passed`);await p.close();
 }
 await writeFile(new URL('results.json',out),JSON.stringify({base,compiledGame:true,passed:true,results},null,2)+'\n');
}finally{await browser.close();}
