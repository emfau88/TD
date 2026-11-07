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
  const records=[];
  for(const kind of [2,4]) for(const level of (kind===2?[1,2,3,5,10,15,20,25]:[1,2,3,4])) for(const angle of (kind===4?[0,90,180,270]:[0])) for(const age of (kind===4?[10,.12]:[10])){
    const result=await page.evaluate(({kind,level,angle,age})=>{
      const s=window.towerAuditScene,t=s.sim.towers.find(t=>t.def.id===kind);
      if(!t)throw new Error('missing tower '+kind);
      t.level=level;t.visualStage=Math.min(3,level);t.angle=angle*Math.PI/180;s.auditDraw();
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
  const checks=await page.evaluate(()=>{
    const s=window.towerAuditScene,t=s.sim.towers.find(t=>t.def.id===4),v=s.towerViews.get(t.uid);
    let poses=0,origins=0;
    for(const level of [1,2,3,4])for(let frame=0;frame<17;frame++)for(let direction=0;direction<8;direction++){
      t.level=level;t.angle=direction*Math.PI/4;
      s.evolution.updateTower(t,v,(frame+.25)/17*.85,1,1,true,s.sim.elapsed,0xffffff,0,0);
      const roof=v.base.displayOriginY+(v.weapon.y-v.base.y)/v.base.scaleY;
      if(Math.abs(roof-65)>1e-8||v.weapon.frame.name!==frame||v.weapon.displayOriginX!==64||v.weapon.displayOriginY!==64)throw new Error('Unstable hinge/frame');
      poses++;
      s.evolution.accept([{type:'fire',tower:t,shot:{uid:900000,kind:4,level}}],s.sim.elapsed);
      const muzzle=s.evolution.origins.get(900000).muzzle;
      if(Math.abs(muzzle.x-(v.weapon.x+Math.sin(t.angle)*16))>1e-8||Math.abs(muzzle.y-(v.weapon.y-Math.cos(t.angle)*16))>1e-8)throw new Error('Projectile mount mismatch');
      origins++;
    }
    const pad=s.sim.layout.towerPads.find(p=>s.sim.canBuild(p.id,4));
    if(!pad)throw new Error('No free construction probe pad');
    s.buildKind=4;s.selectedPadId=pad.id;s.drawSelection();
    const roof=s.ghostBase.displayOriginY+(s.ghostWeapon.y-s.ghostBase.y)/s.ghostBase.scaleY;
    if(!s.ghostWeapon.visible||Math.abs(roof-65)>1e-8)throw new Error('Construction preview mount mismatch');
    s.buildKind=undefined;s.selectedPadId=undefined;s.drawSelection();
    const alphaBounds=frame=>{
      const c=document.createElement('canvas');c.width=frame.cutWidth;c.height=frame.cutHeight;
      const ctx=c.getContext('2d');ctx.drawImage(frame.source.image,frame.cutX,frame.cutY,frame.cutWidth,frame.cutHeight,0,0,c.width,c.height);
      const data=ctx.getImageData(0,0,c.width,c.height).data;let left=c.width,top=c.height,right=0,bottom=0;
      for(let y=0;y<c.height;y++)for(let x=0;x<c.width;x++)if(data[(y*c.width+x)*4+3]){left=Math.min(left,x);top=Math.min(top,y);right=Math.max(right,x+1);bottom=Math.max(bottom,y+1);}
      return {left,top,right,bottom};
    };
    const frost=[],ft=s.sim.towers.find(t=>t.def.id===2),fv=s.towerViews.get(ft.uid);
    for(const level of [1,2,3,5,10,15,20,25]){
      ft.level=level;s.evolution.updateTower(ft,fv,10,1,1,false,0,0xffffff,0,0);
      const bb=alphaBounds(fv.base.frame),cb=alphaBounds(fv.weapon.frame),bf=fv.base.y+(bb.bottom-fv.base.displayOriginY)*fv.base.scaleY;
      const bt=fv.base.y+(bb.top-fv.base.displayOriginY)*fv.base.scaleY;
      const height=box=>bf-Math.min(bt,fv.weapon.y+(box.top-fv.weapon.displayOriginY)*fv.weapon.scaleY);
      let maxHeight=0,maxCoreBottom=-Infinity;const frames=level===1?[...Array(10).keys(),...Array.from({length:16},(_,i)=>i+16)]:[...Array(30).keys()];
      for(const frame of frames){const box=alphaBounds(fv.weapon.texture.get(frame));maxHeight=Math.max(maxHeight,height(box));maxCoreBottom=Math.max(maxCoreBottom,fv.weapon.y-ft.y+(box.bottom-fv.weapon.displayOriginY)*fv.weapon.scaleY);}
      const floorOffset=bf-ft.y;
      if(Math.abs(floorOffset-(13+25.6*.63))>1e-8||fv.base.scaleX!==.63)throw new Error('Frost footing/width changed');
      frost.push({level,scale:fv.weapon.scaleY,baseHeight:(bb.bottom-bb.top)*fv.base.scaleY,coreHeight:(cb.bottom-cb.top)*fv.weapon.scaleY,restHeight:height(cb),maxAnimationHeight:maxHeight,floorOffset,maxCoreBottom,framesChecked:frames.length});
      if(level>1){
        s.evolution.updateTower(ft,fv,0,1,1,true,0,0xffffff,0,0);const glow=s.evolution.glows.get(ft.uid);
        for(const property of ['x','y','scaleX','scaleY','originY'])if(glow[property]!==fv.base[property])throw new Error('Frost glow mismatch: '+property);
      }
    }
    for(const rear of frost)for(const front of frost)if(rear.maxCoreBottom>=40+front.floorOffset-front.maxAnimationHeight)throw new Error('Frost row overlap');
    s.buildKind=2;s.selectedPadId=pad.id;s.drawSelection();
    const frostGhost=window.towerAuditSkin(2,1);
    if(Math.abs(s.ghostBase.scaleY-frostGhost.baseScaleY)>1e-8||s.ghostBase.originY!==frostGhost.originY||Math.abs(s.ghostWeapon.y-(s.ghostBase.y-13+frostGhost.weaponY))>1e-8)throw new Error('Frost construction preview mismatch');
    s.buildKind=undefined;s.selectedPadId=undefined;s.drawSelection();
    t.level=3;t.angle=Math.PI;
    s.sim.towers.push({...t,uid:900001,y:t.y-40,level:3});s.auditDraw();
    return {poses,origins,ghostRoof:roof,frostGhost:true,frostGlows:true,frostRowPairs:64,frost};
  });
  await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
  await page.screenshot({path:new URL('neighbour-row.png',out).pathname.replace(/^\//,'')});
  await page.evaluate(()=>{
    const s=window.towerAuditScene;
    s.sim.towers.splice(s.sim.towers.findIndex(t=>t.uid===900001),1);
    for(const t of s.sim.towers){t.x=260+t.def.id*80;t.y=220;t.level=1;t.visualStage=1;t.angle=Math.PI/2;}
    s.auditDraw();s.refreshLabels();s.cameras.main.setZoom(2.5);s.cameras.main.centerOn(460,200);
  });
  await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
  await page.screenshot({path:new URL('row-comparison.png',out).pathname.replace(/^\//,'')});
  await writeFile(new URL('results.json',out),JSON.stringify({isolatedProbe:true,actualBattleScene:true,appliedRoofY:65,errors,checks,records},null,2));
  console.log(`Captured ${records.length} actual-renderer states; page errors: ${errors.length}`);
} finally {await browser.close();}
