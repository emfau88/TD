// Actual scene, real model commands and isolated earned fixtures. No user save access.
import {createRequire} from 'node:module';
import {mkdirSync,readFileSync,writeFileSync} from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
const {chromium}=createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE||'playwright');
const base=process.env.BASE_URL||'http://127.0.0.1:24750',out=process.env.REPORT_DIR||'qa/spell-art-integration/effects';mkdirSync(out,{recursive:true});
const earned=JSON.parse(readFileSync('artifacts/idle-bastion/acceptance/wave-rework-v2/earned-balanced-late.json','utf8'));
const browser=await chromium.launch({channel:'chrome',headless:true}),results=[];
const record=(name,data={})=>{results.push({name,...data});writeFileSync(path.join(out,'checks.json'),JSON.stringify(results,null,2));console.log(name);};
async function observe(page){
 await page.route(/\/src\/main\.ts(?:\?.*)?$/,async route=>{
  const response=await route.fetch(),body=await response.text(),url=body.match(/from\s*["']([^"']*\/battle-scene\.ts[^"']*)["']/)?.[1];assert.ok(url);
  await page.evaluate(async url=>{const {BattleScene}=await import(url),create=BattleScene.prototype.create;
   BattleScene.prototype.create=function(...args){window.__spellScene=this;return create.apply(this,args);};
  },new URL(url,page.url()).href);await route.fulfill({response,body});
 });
}
async function ready(page){await page.waitForFunction(()=>window.__spellScene?.readyToDraw&&document.querySelector('#app')?.inert===false,{},{timeout:50000});if(await page.locator('#claim-offline').isVisible())await page.locator('#claim-offline').click();}
async function seed(page,kind,language){
 await page.goto(base+'/tests/browser/q3-session.html');
 const slot=await page.evaluate(async({earned,kind,language})=>{
  const {createFeatureProbe}=await import('/src/feature-probes.ts'),{ilyraFirstTarget}=await import('/src/hero-controls.ts'),{openBattleStore}=await import('/src/save-store.ts');
  let b=createFeatureProbe('heroes',earned);b.mara.autoCast=false;b.setIlyraAuto(false);
  if(kind.startsWith('mara')){
   const target=b.towers.find(t=>!t.protected);if(!target)throw Error('Missing paid target');b.assignMara(target.uid);
   let cast=false,before;for(let i=0;i<6000&&!cast;i++){b.update(.025);before=b.snapshot();cast=b.castMaraNow();}if(!cast)throw Error('No earned Mara cast');
   if(kind==='mara-ready'){const {IdleBattle}=await import('/src/battle.ts');b=IdleBattle.restore(before);}else b.update(.12);
  }else{
   let aim;for(let i=0;i<6000&&!(aim=ilyraFirstTarget(b));i++)b.update(.025);
   if(!aim||!b.castIlyraAt(aim))throw Error('No earned Ilyra cast');b.update(.56);
  }
  const slot='spell-'+crypto.randomUUID(),store=await openBattleStore(undefined,'spire-idle-bastion-probe-'+slot);
  await store.save(b.snapshot(),true,0);store.close();localStorage.setItem('spire-language-v1',language);return slot;
 },{earned,kind,language});
 await page.goto(base+'/?probe='+slot);await ready(page);return slot;
}
const lightState=page=>page.evaluate(()=>{
 const s=window.__spellScene,b=s.readBattle();return {snapshot:b.snapshot(),last:s.maraSpell.last,
  light:s.maraSpell.sprites.images.filter(i=>i.visible).map(i=>[i.texture.key,i.frame.name,i.x,i.y,i.alpha,i.rotation,i.displayWidth,i.displayHeight])};
});
async function frameBuff(page){await page.evaluate(()=>{const s=window.__spellScene,b=s.readBattle(),target=b.towers.find(t=>t.uid===b.mara.effectTowerUid);if(target)s.showHeroPosition({x:(target.x+b.mara.x)/2,y:(target.y+b.mara.y)/2});});await page.waitForTimeout(60);}
try{
 for(const mobile of [false,true]){
  const name=mobile?'mobile-en':'desktop-de',ctx=await browser.newContext({viewport:mobile?{width:390,height:844}:{width:1280,height:800},isMobile:mobile,hasTouch:mobile});
  const page=await ctx.newPage(),errors=[],bad=[];page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)bad.push([r.status(),r.url()]);});await observe(page);
  await seed(page,'mara',mobile?'en':'de');await page.locator('#pick-mara').click();await page.locator('#move-mara').click();
  await frameBuff(page);
  const before=await lightState(page);assert.ok(before.light.length>=37);assert.equal(before.last.uid,before.snapshot.mara.effectTowerUid);
  await page.waitForTimeout(500);assert.deepEqual(await lightState(page),before,'Pause freezes spell frames and timers');
  const readOnly=await page.evaluate(()=>{const s=window.__spellScene,b=s.readBattle(),before=JSON.stringify(b.snapshot());for(let i=0;i<120;i++)s.drawActors();return {unchanged:JSON.stringify(b.snapshot())===before,count:s.maraSpell.sprites.images.length};});
  assert.ok(readOnly.unchanged);assert.ok(readOnly.count<=64);
  await page.screenshot({path:path.join(out,name+'-mara-buff.png')});record(name+': actual Mara buff / pause / read-only bounded renderer',readOnly);
  await page.reload();await ready(page);assert.deepEqual((await lightState(page)).snapshot.mara,before.snapshot.mara);assert.ok((await lightState(page)).light.length>=37);
  const boundaries=await page.evaluate(async()=>{
   const {IdleBattle}=await import('/src/battle.ts'),s=window.__spellScene,read=s.readBattle,source=read(),snapshot=JSON.stringify(source.snapshot()),old=source.mara.effectTowerUid;
   const clone=IdleBattle.restore(source.snapshot()),other=clone.towers.find(t=>t.uid!==old);clone.assignMara(other.uid);s.readBattle=()=>clone;s.drawActors();const retained=s.maraSpell.last?.uid===old;
   const charm=clone.isCharmed;clone.isCharmed=uid=>uid===old;s.drawActors();const charmClearsGlow=s.maraSpell.sprites.images.every(i=>!i.visible);clone.isCharmed=charm;
   const sold=clone.sell(old);s.drawActors();const hidden=s.maraSpell.sprites.images.every(i=>!i.visible);
   s.readBattle=read;s.drawActors();return {retained,sold,hidden,charmClearsGlow,originalUnchanged:JSON.stringify(source.snapshot())===snapshot};
  });assert.deepEqual(boundaries,{retained:true,sold:true,hidden:true,charmClearsGlow:true,originalUnchanged:true});record(name+': saved buff reload / retarget keeps original tower / sale and charm clear glow',boundaries);
  await frameBuff(page);
  await page.locator('#pause').click();await page.waitForFunction(()=>{const b=window.__spellScene.readBattle();return b.mara.effectRemaining<7.4&&b.mara.effectRemaining>6.9;});await page.locator('#pause').click();
  await page.screenshot({path:path.join(out,name+'-mara-impact.png')});await page.locator('#pause').click();
  await page.waitForFunction(()=>window.__spellScene.readBattle().mara.effectRemaining===0,{},{timeout:15000});await page.waitForTimeout(600);
  assert.equal((await lightState(page)).light.length,0);record(name+': natural expiration removes all glow and pulse objects');

  await seed(page,'ilyra',mobile?'en':'de');await page.locator('#pick-ilyra').click();assert.equal(await page.locator('#move-ilyra').isDisabled(),true);
  // Movement is correctly disabled during the volley; expose selection through actual map tap.
  if(await page.locator('#context-panel').isVisible())await page.locator('#close-context').click();
  const p=await page.evaluate(()=>{const s=window.__spellScene,a=s.readBattle().ilyra;return s.worldAnchor({x:a.x,y:a.y-18});});
  if(mobile)await page.touchscreen.tap(p.x,p.y);else await page.mouse.click(p.x,p.y);
  const volley=await page.evaluate(()=>{const s=window.__spellScene,b=s.readBattle(),before=JSON.stringify(b.snapshot());for(let i=0;i<120;i++)s.drawActors();const images=s.ilyraView.spell.sprites.images;return {snapshot:b.snapshot(),heads:images.filter(i=>i.visible&&i.texture.key==='spell-star-projectile'&&i.displayWidth>18).length,count:images.length,unchanged:before===JSON.stringify(b.snapshot())};});
  assert.equal(volley.heads,9);assert.ok(volley.unchanged);assert.ok(volley.count<=64);assert.equal(await page.locator('#hero-aim').isDisabled(),true);
  await page.screenshot({path:path.join(out,name+'-ilyra-flight.png')});
  await page.reload();await ready(page);assert.deepEqual(await page.evaluate(()=>window.__spellScene.readBattle().ilyra.volley),volley.snapshot.ilyra.volley);
  record(name+': nine real volley projectiles / paused save reload / renderer changes no model data',{heads:volley.heads,count:volley.count});
  await page.locator('#pause').click();await page.waitForFunction(()=>window.__spellScene.readBattle().ilyra.volley?.hit);await page.locator('#pause').click();
  await page.screenshot({path:path.join(out,name+'-ilyra-impact.png')});await page.locator('#pause').click();await page.waitForFunction(()=>!window.__spellScene.readBattle().ilyra.volley);
  assert.ok(await page.evaluate(()=>window.__spellScene.ilyraView.spell.sprites.images.every(i=>!i.visible)));record(name+': actual impact timing and volley cleanup');
  if(mobile){await page.setViewportSize({width:320,height:568});await page.locator('#pick-ilyra').click();await page.screenshot({path:path.join(out,'small-mobile-ilyra-menu.png')});}
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  if(mobile)await page.setViewportSize({width:390,height:844});
  await seed(page,'mara-ready',mobile?'en':'de');await page.locator('#pick-mara').click();await page.locator('#move-mara').click();
  assert.ok(await page.locator('#hero-mara-cast').isDisabled());await page.locator('#pause').click();await page.locator('#hero-mara-cast').click();
  await page.waitForFunction(()=>window.__spellScene.readBattle().mara.effectRemaining>0);await page.locator('#pause').click();
  const manual=await page.evaluate(()=>{const b=window.__spellScene.readBattle();return {auto:b.mara.autoCast,owner:b.mara.effectTowerUid,target:b.mara.targetTowerUid,remaining:b.mara.effectRemaining};});
  assert.equal(manual.auto,false);assert.equal(manual.owner,manual.target);assert.ok(manual.remaining>7);assert.ok(await page.locator('#hero-mara-cast').isDisabled());
  await frameBuff(page);await page.screenshot({path:path.join(out,name+'-manual-mara.png')});record(name+': actual map button casts once and stays selected through cooldown',manual);
  assert.deepEqual(errors,[]);assert.deepEqual(bad,[]);record(name+': no browser/resource errors or overflow',{errors,bad});await ctx.close();
 }
}finally{await browser.close();}
