import { chromium } from 'file:///C:/Users/madde/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
const out = new URL('./ingame/', import.meta.url);
await mkdir(out, { recursive: true });
const fixture = JSON.parse(await readFile(new URL('../tavern-targets-2026-11-07/main-save.json', import.meta.url), 'utf8'));
const browser = await chromium.launch({ executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,args:['--disable-gpu'] });
const page = await browser.newPage({ viewport:{width:1280,height:844} });
const errors=[]; page.on('pageerror', e=>errors.push(e.message));
try {
  // Expose the actual BattleScene in this isolated browser only. No repository code changes.
  await page.route('**/src/battle-scene.ts*', async route=>{
    const response=await route.fetch();
    const body=(await response.text())+'\nconst auditCreate=BattleScene.prototype.create; BattleScene.prototype.create=function(...args){window.towerAuditScene=this;return auditCreate.apply(this,args);};\n';
    await route.fulfill({response,body});
  });
  const base='http://127.0.0.1:5278/';
  await page.goto(base);
  const probe='tower-audit-'+crypto.randomUUID();
  await page.evaluate(async ({probe,fixture})=>{
    localStorage.setItem('spire-language-v1','de');
    const db=await new Promise((resolve,reject)=>{const r=indexedDB.open('spire-tavern-preview-v1-'+probe,1);r.onupgradeneeded=()=>r.result.createObjectStore('saves');r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});
    await new Promise((resolve,reject)=>{const t=db.transaction('saves','readwrite');t.objectStore('saves').put(fixture,'default');t.oncomplete=resolve;t.onerror=()=>reject(t.error);});db.close();
  },{probe,fixture});
  await page.goto(base+'?probe='+probe);
  await page.waitForFunction(()=>document.querySelector('#boot-screen')?.hidden===true && window.towerAuditScene?.readyToDraw);
  if(await page.locator('#claim-offline').isVisible()) await page.click('#claim-offline');
  console.log(JSON.stringify(await page.evaluate(()=>({towers:window.towerAuditScene.sim.towers.map(t=>({uid:t.uid,kind:t.def.id,level:t.level,x:t.x,y:t.y})),paused:window.towerAuditScene.paused}))));
  await page.screenshot({path:new URL('actual-game.png',out).pathname.replace(/^\//,'')});
  await page.evaluate(()=>{const s=window.towerAuditScene;s.auditDraw=s.drawActors.bind(s);s.update=()=>{};s.drawActors=()=>{};s.refresh=()=>{};s.cameras.main.removeBounds();s.cameras.main.setZoom(4);});
  const records=[];
  for(const kind of [2,4]) for(const level of [1,2,3]) for(const angle of (kind===4?[0,90,180,270]:[0])) for(const age of (kind===4?[10,.12]:[10])){
    const result=await page.evaluate(({kind,level,angle,age})=>{
      const s=window.towerAuditScene,t=s.sim.towers.find(t=>t.def.id===kind);
      if(!t)throw new Error('missing tower '+kind);
      t.level=level;t.visualStage=level;t.angle=angle*Math.PI/180;s.auditDraw();
      const v=s.towerViews.get(t.uid);
      s.evolution.updateTower(t,v,age,1,1,false,s.sim.elapsed,0xffffff,0,0);
      s.cameras.main.centerOn(t.x,t.y-15);
      const info=o=>({texture:o.texture.key,frame:o.frame.name,x:o.x,y:o.y,originX:o.originX,originY:o.originY,displayOriginX:o.displayOriginX,displayOriginY:o.displayOriginY,width:o.width,height:o.height,scaleX:o.scaleX,scaleY:o.scaleY,rotation:o.rotation});
      return {kind,level,angle,age,tower:{x:t.x,y:t.y},base:info(v.base),weapon:info(v.weapon)};
    },{kind,level,angle,age});
    await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
    const point=await page.evaluate(kind=>{const s=window.towerAuditScene,t=s.sim.towers.find(t=>t.def.id===kind);return s.worldAnchor(t);},kind);
    const file=`kind${kind}-level${level}-${angle}-${age===10?'idle':'fire'}.png`;
    await page.screenshot({path:new URL(file,out).pathname.replace(/^\//,''),clip:{x:Math.max(0,point.x-120),y:Math.max(0,point.y-200),width:240,height:320}});
    const capturedFrame=await page.evaluate(kind=>{const s=window.towerAuditScene,t=s.sim.towers.find(t=>t.def.id===kind);return s.towerViews.get(t.uid).weapon.frame.name;},kind);
    if(capturedFrame!==result.weapon.frame)throw new Error(`Frame changed during capture: ${result.weapon.frame} -> ${capturedFrame}`);
    records.push({...result,file,capturedFrame});
  }
  await writeFile(new URL('results.json',out),JSON.stringify({isolatedProbe:true,actualBattleScene:true,repositoryCodeUnchanged:true,errors,records},null,2));
  console.log(`Captured ${records.length} actual-renderer states; page errors: ${errors.length}`);
} finally {await browser.close();}
