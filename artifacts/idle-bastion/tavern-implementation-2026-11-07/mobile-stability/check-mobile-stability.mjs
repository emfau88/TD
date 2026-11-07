import {chromium} from 'file:///C:/Users/madde/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
import {mkdir,writeFile,readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';

const verify=process.argv.includes('--verify');
const phase=process.env.STABILITY_PHASE||(verify?'after':'before');
const origin=process.env.STABILITY_ORIGIN||'http://127.0.0.1:5278';
const out=new URL(`./${phase}/`,import.meta.url);await mkdir(out,{recursive:true});
const viewports=[{width:390,height:844},{width:320,height:844},{width:390,height:650},{width:844,height:390}].filter(v=>!process.env.STABILITY_VIEWPORT||`${v.width}x${v.height}`===process.env.STABILITY_VIEWPORT);
const languages=process.env.STABILITY_LANGUAGE?[process.env.STABILITY_LANGUAGE]:['de','en'];
const selectors={dialog:'#tavern-dialog',character:'.tv-character',body:'.tv-character-body',stage:'.tv-stage',canvas:'.tv-figure canvas',conversation:'.tv-conversation',dock:'.tv-action-dock'};
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,args:['--disable-gpu']});
const results=[];
const sourceFiles=['tavern-ui.css','tavern-rig.css','tavern-video.css'];
async function hashes(){const result={};for(const name of sourceFiles){const text=await readFile(`C:/Users/madde/Documents/TowerDefense/.worktrees/tavern-comfy-integration/experiments/idle-bastion/src/${name}`);result[name]=createHash('sha256').update(text).digest('hex');}return result;}
const sourceHashes=await hashes();
async function ready(page){await page.waitForFunction(()=>window.tavernReview?.ui.animation.ready&&!window.tavernReview.ui.pending&&!window.tavernReview.session.inputBusy);}
async function capture(page,label,viewport,normal,language){
  await ready(page);
  const value=await page.evaluate(({selectors,label})=>{
    const f=window.tavernReview;
    const rects=Object.fromEntries(Object.entries(selectors).map(([key,selector])=>{const e=document.querySelector(selector),r=e.getBoundingClientRect(),s=getComputedStyle(e);return[key,{x:r.x,y:r.y,width:r.width,height:r.height,flex:s.flex,flexBasis:s.flexBasis,minHeight:s.minHeight,maxHeight:s.maxHeight,overflowY:s.overflowY,scrollHeight:e.scrollHeight,clientHeight:e.clientHeight}]}));
    const buttons=[...document.querySelectorAll('.tv-story-controls button,.tv-replies button,.tv-actions>button')].filter(e=>e.offsetWidth).map(e=>{const r=e.getBoundingClientRect();return{text:e.textContent.trim(),disabled:e.disabled,top:r.top,bottom:r.bottom,height:r.height,withinViewport:r.top>=0&&r.bottom<=innerHeight};});
    return{label,rects,buttons,story:f.ui.dialog.dataset.story,encounter:f.ui.encounter?{...f.ui.encounter}:null,points:f.session.battle.social.points.mara,error:f.session.error?.message??null,overflow:document.documentElement.scrollWidth>innerWidth};
  },{selectors,label});
  const delta=normal?Object.fromEntries(Object.keys(selectors).map(key=>[key,Object.fromEntries(['x','y','width','height'].map(d=>[d,Math.round((value.rects[key][d]-normal.rects[key][d])*1000)/1000]))])):null;
  const entry={viewport,language,...value,delta};
  results.push(entry);
  if(['normal','moment1:open','moment3:open','encounter:choice'].includes(label))await page.screenshot({path:fileURLToPath(new URL(`${language}-${viewport.width}x${viewport.height}-${label.replaceAll(':','-')}.png`,out))});
  if(['normal','moment1:open','encounter:choice'].includes(label))console.log(JSON.stringify({viewport:`${viewport.width}x${viewport.height}`,language,label,stageHeight:value.rects.stage.height,canvasHeight:value.rects.canvas.height,conversation:value.rects.conversation.height,dock:value.rects.dock.height,stageHeightDelta:delta?.stage.height??0}));
  assert.equal(value.error,null);assert.equal(value.overflow,false);
  return entry;
}
try{
  for(const language of languages)for(const viewport of viewports){
    const context=await browser.newContext({viewport,deviceScaleFactor:1,isMobile:true,hasTouch:true}),page=await context.newPage(),errors=[];
    page.on('pageerror',e=>errors.push(e.message));
    await page.goto(`${origin}/tavern-rig-check.html?artwork=video`,{waitUntil:'domcontentloaded'});await ready(page);
    await page.evaluate(language=>{const lang=document.querySelector('#review-language');lang.value=language;lang.dispatchEvent(new Event('change'));const select=document.querySelector('#review-hearts');select.value='3';select.dispatchEvent(new Event('change'));window.tavernReview.ui.update();},language);
    await ready(page);
    const normal=await capture(page,'normal',viewport,undefined,language);
    const record=label=>capture(page,label,viewport,normal,language);
    await page.click('[data-moment="1"]');await record('moment1:open');
    for(let i=0;i<8&&await page.locator('.tv-story-controls').isVisible();i++){
      const ending=/beenden|end moment/i.test(await page.locator('[data-do=story-next]').textContent());
      await page.click('[data-do=story-next]');await record(ending?'moment1:end':`moment1:next${i+1}`);
    }
    await page.click('[data-moment="3"]');await record('moment3:open');
    await page.click('[data-do=story-next]');await record('moment3:next');
    await page.click('[data-do=back]');await record('moment3:back');
    await page.click('[data-moment="3"]');await ready(page);
    for(let i=0;i<8&&await page.locator('.tv-story-controls').isVisible();i++)await page.click('[data-do=story-next]');
    await record('moment3:end');
    await page.click('[data-do=speak]');await record('talk:options');
    await page.click('[data-action=talk]');await ready(page);
    for(let i=0;i<4&&!await page.locator('[data-answer=first]').isVisible();i++)await page.click('[data-do=story-next]');
    const choiceState=await record('encounter:choice');
    choiceState.choiceReachability=[];
    for(const choice of ['first','second']){
      const button=page.locator(`[data-answer=${choice}]`);await button.scrollIntoViewIfNeeded();
      const reachable=await button.evaluate(e=>{const r=e.getBoundingClientRect(),parent=e.closest('.tv-conversation'),c=parent.getBoundingClientRect(),at=document.elementFromPoint(r.x+r.width/2,r.y+r.height/2);return{top:r.top,bottom:r.bottom,height:r.height,insideTextArea:r.top>=c.top-1&&r.bottom<=c.bottom+1,insideViewport:r.top>=-1&&r.bottom<=innerHeight+1,hitTarget:at===e||e.contains(at),hit:at?.outerHTML,textArea:{top:c.top,bottom:c.bottom,height:c.height,scrollTop:parent.scrollTop,scrollHeight:parent.scrollHeight,clientHeight:parent.clientHeight,overflowY:getComputedStyle(parent).overflowY},parent:e.parentElement.outerHTML};});
      choiceState.choiceReachability.push({choice,...reachable});
      if(!reachable.insideTextArea||!reachable.insideViewport||!reachable.hitTarget){
        await writeFile(new URL(`${language}-${viewport.width}x${viewport.height}-${choice}-reachability-failure.json`,out),JSON.stringify({choice,reachable,choiceState},null,2));
        await page.screenshot({path:fileURLToPath(new URL(`${language}-${viewport.width}x${viewport.height}-${choice}-reachability-failure.png`,out))});
        console.log(JSON.stringify({reachabilityFailure:true,viewport,language,choice,reachable}));
      }
      assert.equal(reachable.insideTextArea,true);assert.equal(reachable.insideViewport,true);assert.equal(reachable.hitTarget,true);assert.ok(reachable.height>=44);
      await record(`encounter:scroll-${choice}`);
    }
    await page.click('[data-answer=first]');await record('encounter:reply');
    for(let i=0;i<8&&await page.locator('.tv-story-controls').isVisible();i++){await page.click('[data-do=story-next]');await ready(page);}
    await record('encounter:end');
    await page.click('[data-do=speak]');await page.click('[data-action=talk]');await ready(page);
    await page.click('[data-do=back]');await record('encounter:back');
    assert.equal(await page.locator('.tv-actions>button:visible').count(),3);assert.deepEqual(errors,[]);
    await context.close();
  }
}finally{await browser.close();}
assert.deepEqual(await hashes(),sourceHashes,'CSS changed during the run; rerun against one stable source state');
await writeFile(new URL('measurements.json',out),JSON.stringify({origin,verify,sourceHashes,viewports,languages,results},null,2));
const changed=results.filter(entry=>entry.delta&&['dialog','stage','canvas','conversation','dock'].some(key=>['x','y','width','height'].some(d=>Math.abs(entry.delta[key][d])>1)));
const portraitChanged=changed.filter(e=>e.viewport.width<e.viewport.height);
await writeFile(new URL('summary.json',out),JSON.stringify({captures:results.length,changed:changed.map(e=>({viewport:e.viewport,language:e.language,label:e.label,delta:e.delta})),portraitChanged:portraitChanged.length,sourceHashes},null,2));
console.log(JSON.stringify({captures:results.length,changed:changed.length,portraitChanged:portraitChanged.length,verify}));
if(verify)assert.equal(portraitChanged.length,0,'portrait dialog, stage, canvas, text area and dock must retain their geometry within 1 CSS pixel');
