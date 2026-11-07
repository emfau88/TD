import {chromium} from 'file:///C:/Users/madde/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
import {mkdir,writeFile,readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';

const origin=(process.env.STABILITY_ORIGIN||'http://127.0.0.1:5278').replace(/\/+$/,'');
const local=/^http:\/\/(?:127\.0\.0\.1|localhost)(?::\d+)?$/.test(origin);
const phase=process.env.STABILITY_PHASE||(local?'main-after':'main-public');
const verify=process.argv.includes('--verify');
const viewports=[{width:390,height:844},{width:320,height:844},{width:390,height:650},{width:844,height:390},{width:667,height:375}].filter(v=>!process.env.STABILITY_VIEWPORT||`${v.width}x${v.height}`===process.env.STABILITY_VIEWPORT);
const companions=['mara','ilyra'].filter(who=>!process.env.STABILITY_COMPANION||who===process.env.STABILITY_COMPANION);
assert.ok(viewports.length&&companions.length,'Unknown viewport/companion filter');
const out=new URL(`./${phase}/`,import.meta.url);await mkdir(out,{recursive:true});
const sourceFiles=['tavern-ui.css','tavern-rig.css','landscape.css'];
async function hashes(){const result={};for(const name of sourceFiles){const text=await readFile(`C:/Users/madde/Documents/TowerDefense/.worktrees/tavern-comfy-integration/experiments/idle-bastion/src/${name}`);result[name]=createHash('sha256').update(text).digest('hex');}return result;}
const sourceHashes=local?await hashes():null,results=[];
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,args:['--disable-gpu']});
const rectSelectors={dialog:'#tavern-dialog',body:'.tv-character-body',stage:'.tv-stage',canvas:'.tv-figure canvas',conversation:'.tv-conversation',dock:'.tv-action-dock',bond:'.tv-bond'};
async function ready(page){await page.waitForFunction(()=>{const d=document.querySelector('#tavern-dialog'),c=d?.querySelector('.tv-figure canvas'),talk=d?.querySelector('[data-do=speak]');return d?.open&&c?.dataset.renderer==='video'&&c.dataset.clip&&!talk.disabled;},{timeout:60000});}
async function record(page,label,caseInfo,normal){
  await ready(page);
  const state=await page.evaluate(({rectSelectors,label})=>{
    const d=document.querySelector('#tavern-dialog');
    const rects=Object.fromEntries(Object.entries(rectSelectors).map(([key,selector])=>{const e=document.querySelector(selector),r=e.getBoundingClientRect(),s=getComputedStyle(e);return[key,{x:r.x,y:r.y,width:r.width,height:r.height,overflowY:s.overflowY,clientHeight:e.clientHeight,scrollHeight:e.scrollHeight}]}));
    const unlock=d.querySelector('[data-do=new-moment]'),p=d.querySelector('progress');
    const error=d.querySelector('.tv-error');
    return{label,rects,points:p.value,story:d.dataset.story,encounter:d.dataset.encounter,unlockVisible:!!unlock.offsetWidth,unlockText:unlock.textContent.trim(),error:error.offsetWidth?error.textContent.trim():'',overflow:document.documentElement.scrollWidth>innerWidth,coarse:matchMedia('(pointer:coarse)').matches,compactLandscape:matchMedia('(max-height:500px) and (orientation:landscape) and (pointer:coarse)').matches,loadedStyles:[...document.styleSheets].map(sheet=>sheet.href).filter(Boolean)};
  },{rectSelectors,label});
  const delta=normal?Object.fromEntries(Object.keys(rectSelectors).map(key=>[key,Object.fromEntries(['x','y','width','height'].map(d=>[d,Math.round((state.rects[key][d]-normal.rects[key][d])*1000)/1000]))])):null;
  const entry={...caseInfo,...state,delta};results.push(entry);
  assert.equal(state.coarse,true);assert.equal(state.error,'');assert.equal(state.overflow,false);
  if(caseInfo.viewport.width>caseInfo.viewport.height)assert.equal(state.compactLandscape,true,'real Main must activate touch landscape.css');
  if(['normal58','earnedHeart3','normal70help','moment3:open','encounter:choice'].includes(label))await page.screenshot({path:fileURLToPath(new URL(`${caseInfo.who}-${caseInfo.language}-${caseInfo.viewport.width}x${caseInfo.viewport.height}-${label.replaceAll(':','-')}.png`,out))});
  if(['normal58','earnedHeart3','normal70help','encounter:choice'].includes(label))console.log(JSON.stringify({who:caseInfo.who,viewport:caseInfo.viewport,language:caseInfo.language,label,stageHeight:state.rects.stage.height,stageDelta:delta?.stage.height??0,dock:state.rects.dock.height,landscape:state.compactLandscape}));
  return entry;
}
try{
  for(const who of companions)for(const viewport of viewports){
    const language=process.env.STABILITY_LANGUAGE||(who==='mara'?'de':'en');
    const caseInfo={who,viewport,language};
    const context=await browser.newContext({viewport,deviceScaleFactor:1,isMobile:true,hasTouch:true}),page=await context.newPage(),errors=[];
    page.on('pageerror',e=>errors.push(e.message));
    await page.addInitScript(()=>localStorage.setItem('spire-audio-mix-v1',JSON.stringify({music:0,effects:0,voices:0,muted:true})));
    await page.goto(`${origin}/tavern-test.html`,{waitUntil:'domcontentloaded'});
    await page.selectOption('#preset','gift58-30');await page.selectOption('#companion',who);await page.selectOption('#language',language);
    await page.click('#start');await page.waitForURL(url=>url.pathname.endsWith('/index.html')&&url.searchParams.has('probe'),{timeout:60000});
    await page.waitForFunction(()=>document.querySelector('#boot-screen')?.hidden===true,{timeout:60000});
    if(await page.locator('#claim-offline').isVisible())await page.click('#claim-offline');
    await page.locator('#return-card').waitFor({state:'hidden'});await ready(page);
    assert.equal(await page.locator('#tv-title').textContent(),who==='mara'?'Mara':'Ilyra');
    caseInfo.url=page.url();
    const normal=await record(page,'normal58',caseInfo);
    const capture=label=>record(page,label,caseInfo,normal);
    await page.click('[data-action=gift]');const earned=await capture('earnedHeart3');assert.equal(earned.points,70);assert.equal(earned.unlockVisible,true);
    await page.click('[data-moment="1"]');await capture('moment1:open');
    for(let i=0;i<8&&await page.locator('.tv-story-controls').isVisible();i++){await page.click('[data-do=story-next]');await capture(`moment1:next${i+1}`);}
    await capture('moment1:end');
    await page.click('[data-moment="3"]');await capture('moment3:open');await page.click('[data-do=story-next]');await capture('moment3:next');
    await page.click('[data-do=back]');const help=await capture('normal70help');assert.equal(help.unlockVisible,false);
    await page.click('[data-moment="3"]');await ready(page);
    for(let i=0;i<8&&await page.locator('.tv-story-controls').isVisible();i++){await page.click('[data-do=story-next]');await ready(page);}
    await capture('moment3:end');
    await page.click('[data-do=speak]');await capture('talk:options');await page.click('[data-action=talk]');await ready(page);
    for(let i=0;i<4&&!await page.locator('[data-answer=first]').isVisible();i++)await page.click('[data-do=story-next]');
    const choice=await capture('encounter:choice');choice.reachability=[];
    for(const answer of ['first','second']){
      const button=page.locator(`[data-answer=${answer}]`);await button.scrollIntoViewIfNeeded();
      const reach=await button.evaluate(e=>{const r=e.getBoundingClientRect(),c=e.closest('.tv-conversation').getBoundingClientRect(),at=document.elementFromPoint(r.x+r.width/2,r.y+r.height/2);return{height:r.height,insideTextArea:r.top>=c.top-1&&r.bottom<=c.bottom+1,insideViewport:r.top>=-1&&r.bottom<=innerHeight+1,hitTarget:at===e||e.contains(at),rect:{top:r.top,bottom:r.bottom},textArea:{top:c.top,bottom:c.bottom}};});
      choice.reachability.push({answer,...reach});assert.ok(reach.height>=44);assert.equal(reach.insideTextArea,true);assert.equal(reach.insideViewport,true);assert.equal(reach.hitTarget,true);
      await capture(`encounter:scroll-${answer}`);
    }
    await page.click('[data-answer=first]');await capture('encounter:reply');
    for(let i=0;i<8&&await page.locator('.tv-story-controls').isVisible();i++){await page.click('[data-do=story-next]');await ready(page);}
    await capture('encounter:end');assert.equal(await page.locator('.tv-actions>button:visible').count(),3);
    await page.click('[data-do=speak]');await page.click('[data-action=talk]');await ready(page);await page.click('[data-do=back]');await capture('encounter:back');
    assert.deepEqual(errors,[]);await context.close();
  }
}catch(error){await writeFile(new URL('failure.json',out),JSON.stringify({origin,message:error.message,stack:error.stack,sourceHashes,results},null,2));throw error;}finally{await browser.close();}
if(local)assert.deepEqual(await hashes(),sourceHashes,'CSS changed during the run');
const changed=results.filter(e=>e.delta&&Object.keys(rectSelectors).some(key=>['x','y','width','height'].some(d=>Math.abs(e.delta[key][d])>1)));
const portraitChanged=changed.filter(e=>e.viewport.width<e.viewport.height);
await writeFile(new URL('measurements.json',out),JSON.stringify({origin,sourceHashes,viewports,verify,results},null,2));
await writeFile(new URL('summary.json',out),JSON.stringify({cases:results.filter(e=>e.label==='normal58').length,captures:results.length,portraitChanged:portraitChanged.length,changed:changed.map(e=>({who:e.who,language:e.language,viewport:e.viewport,label:e.label,delta:e.delta})),sourceHashes},null,2));
console.log(JSON.stringify({actualMain:true,cases:results.filter(e=>e.label==='normal58').length,captures:results.length,portraitChanged:portraitChanged.length,totalChanged:changed.length}));
if(verify)assert.equal(portraitChanged.length,0,'real Main portrait geometry must remain stable, including earned-heart unlock versus help');
