import { chromium } from 'file:///C:/Users/madde/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
const out = new URL('./final/', import.meta.url);
await mkdir(out, { recursive: true });
const fixture = JSON.parse(await readFile(new URL('../tavern-targets-2026-11-07/main-save.json', import.meta.url), 'utf8'));
const browser = await chromium.launch({ executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,args:['--disable-gpu'] });
const page = await browser.newPage({ viewport:{width:1280,height:844} });
const errors=[]; page.on('pageerror', e=>errors.push(e.message));
try {
  // Expose the actual BattleScene in this isolated browser only. No repository code changes.
  await page.route('**/src/battle-scene.ts*', async route=>{
    const response=await route.fetch();
    const body=(await response.text())+'\nconst auditCreate=BattleScene.prototype.create; BattleScene.prototype.create=function(...args){window.towerAuditScene=this;window.towerAuditSkin=evolutionSkin;return auditCreate.apply(this,args);};\n';
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
  await page.evaluate(()=>{
    const s=window.towerAuditScene;
    for(const t of s.sim.towers){t.x=260+t.def.id*80;t.y=220;t.level=1;t.visualStage=1;t.angle=Math.PI/2;}
    s.auditDraw();s.refreshLabels();s.cameras.main.setZoom(2.5);s.cameras.main.centerOn(460,200);
  });
  await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
  await page.screenshot({path:new URL('row-comparison.png',out).pathname.replace(/^\//,'')});
  console.log('Actual renderer comparison row captured.');
} finally {await browser.close();}
