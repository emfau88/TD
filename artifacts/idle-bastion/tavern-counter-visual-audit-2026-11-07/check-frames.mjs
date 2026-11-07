import { chromium } from 'file:///C:/Users/madde/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';
const base='http://127.0.0.1:5281/';const out=new URL('./',import.meta.url);
await mkdir(out,{recursive:true});
const fixture=JSON.parse(await readFile(new URL('../tavern-targets-2026-11-07/main-save.json',out),'utf8'));
fixture.battle.social.points={mara:110,ilyra:110};
for(const record of Object.values(fixture.battle.social.encounters.mara)){record.seen=true;record.completed=true;record.choice='warm';}
// Use the fixture's supported dialogue choice values; neutral completed records need no invented choice.
for(const record of Object.values(fixture.battle.social.encounters.mara))record.choice=null;
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,args:['--disable-gpu']});
const results=[];
const ready=page=>page.waitForFunction(()=>document.querySelector('.tv-figure canvas')?.dataset.clip==='idle'&&!document.querySelector('[data-do=speak]').disabled);
try{
 for(const [name,viewport,mobile] of [['desktop',{width:1280,height:844},false],['phone',{width:390,height:844},true]]){
  const page=await browser.newPage({viewport,isMobile:mobile,hasTouch:mobile});const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(base);const probe='counter-visual-'+crypto.randomUUID();
  await page.evaluate(async({fixture,probe})=>{
   localStorage.setItem('spire-language-v1','de');
   const db=await new Promise((resolve,reject)=>{const r=indexedDB.open('spire-idle-bastion-probe-'+probe,1);r.onupgradeneeded=()=>r.result.createObjectStore('saves');r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});
   await new Promise((resolve,reject)=>{const t=db.transaction('saves','readwrite');t.objectStore('saves').put(fixture,'default');t.oncomplete=resolve;t.onerror=()=>reject(t.error);});db.close();
  },{fixture,probe});
  await page.goto(base+'?probe='+probe);await page.waitForFunction(()=>document.querySelector('#boot-screen')?.hidden===true);
  if(await page.locator('#claim-offline').isVisible())await page.click('#claim-offline');
  await page.click('#settlement-tab');await page.click('#pick-tavern');await page.click('[data-do=mara]');await ready(page);
  await page.click('[data-do=speak]');await page.click('[data-do=switch-location]');
  await page.waitForFunction(()=>document.querySelector('.tv-stage')?.dataset.videoScene==='mara-counter');await ready(page);
  await page.evaluate(()=>{
   const canvas=document.querySelector('.tv-figure canvas'),stage=document.querySelector('.tv-stage');
   const sample=document.createElement('canvas');sample.width=96;sample.height=140;const ctx=sample.getContext('2d',{willReadFrequently:true});
   const initial=stage.getBoundingClientRect();window.frameAudit={running:true,frames:[],issues:[],clips:{},initial:{width:initial.width,height:initial.height}};
   function tick(now){
    const a=window.frameAudit;if(!a.running)return;requestAnimationFrame(tick);
    ctx.clearRect(0,0,96,140);ctx.drawImage(canvas,0,0,96,140);const d=ctx.getImageData(0,0,96,140).data;
    let transparent=0,black=0;const edges=[[],[],[],[]];
    for(let y=0;y<140;y++)for(let x=0;x<96;x++){
     const i=(y*96+x)*4;const dark=Math.max(d[i],d[i+1],d[i+2])<=8;
     if(d[i+3]<250)transparent++;if(dark)black++;
     if(x<2)edges[0].push(dark);if(x>=94)edges[1].push(dark);if(y<2)edges[2].push(dark);if(y>=138)edges[3].push(dark);
    }
    const border=edges.map(values=>values.filter(Boolean).length/values.length);
    const r=stage.getBoundingClientRect(),style=getComputedStyle(canvas),fstyle=getComputedStyle(canvas.closest('.tv-figure'));
    const row={t:Math.round(now),clip:canvas.dataset.clip,frame:Number(canvas.dataset.frame),scene:stage.dataset.videoScene,
     transparent,blackFraction:black/(96*140),border,width:r.width,height:r.height,filter:style.filter,shadow:style.boxShadow,figureShadow:fstyle.boxShadow,opacity:style.opacity};
    a.frames.push(row);a.clips[row.clip]=(a.clips[row.clip]??0)+1;
    if(transparent||row.blackFraction>.9||border.some(n=>n>.95)||row.scene!=='mara-counter'||Math.abs(r.width-initial.width)>.1||Math.abs(r.height-initial.height)>.1)a.issues.push(row);
   }requestAnimationFrame(tick);
  });
  await page.screenshot({path:fileURLToPath(new URL(`${name}-idle.png`,out))});
  const actions=[['[data-action=talk]','talk','MC02'],['[data-region=hair]','hair','MC03'],['[data-region=shoulder]','shoulder','MC04'],
   ['[data-region=hand]','hand','MC05'],['[data-gesture=giggle]','laugh','MC06'],['[data-gesture=hip]','approach','MC07'],['[data-gesture=tease]','laugh','Necken']];
  for(const [selector,clip,label]of actions){
   if(selector.includes('gesture')||selector.includes('action=talk'))await page.click('[data-do=speak]');
   await page.click(selector);await page.waitForFunction(clip=>document.querySelector('.tv-figure canvas')?.dataset.clip===clip,clip);
   if(clip==='approach'||clip==='hand'||clip==='laugh'&&label==='MC06'){
    await page.waitForFunction(({clip,frame})=>{const c=document.querySelector('.tv-figure canvas');return c?.dataset.clip===clip&&Number(c.dataset.frame)>=frame;},{clip,frame:clip==='approach'?42:25});
    await page.screenshot({path:fileURLToPath(new URL(`${name}-${label.toLowerCase()}.png`,out))});
   }
   await ready(page);
  }
  await page.waitForTimeout(180);
  const audit=await page.evaluate(()=>{window.frameAudit.running=false;return window.frameAudit;});
  await writeFile(new URL(`${name}-frames.json`,out),JSON.stringify(audit,null,2));
  assert.deepEqual(audit.issues,[],`${name}: blank frame, black border, wrong room or resized stage detected`);
  for(const clip of ['idle','talk','hair','shoulder','hand','laugh','approach'])assert.ok(audit.clips[clip]>0,clip);
  assert.deepEqual(errors,[]);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
  const cssStates=[...new Set(audit.frames.map(r=>JSON.stringify([r.filter,r.shadow,r.figureShadow,r.opacity])))];
  assert.equal(cssStates.length,1,'No changing shadow/filter/opacity around reactions');
  results.push({name,viewport,frames:audit.frames.length,clips:audit.clips,blackOrTransparentFrames:0,wrongScenes:0,stageStable:true,cssStates,errors});
  console.log(`${name}: ${audit.frames.length} displayed frames checked, all seven clips, no black borders/blank frames/size changes`);
  await page.close();
 }
 await writeFile(new URL('results.json',out),JSON.stringify({base,compiledGame:true,passed:true,results},null,2));
}finally{await browser.close();}
