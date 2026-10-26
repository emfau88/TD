import { chromium } from 'file:///C:/Users/madde/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
import { readFile,writeFile,mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';
const root=new URL('./',import.meta.url),preview=new URL('preview/',root);
await mkdir(preview,{recursive:true});
const fixture=JSON.parse(await readFile(new URL('../early-balance-release/selected/B-snapshots.json',root),'utf8')).channel15;
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
const results=[];
try{
  for(const width of [1280,390])for(const version of ['before','after']){
    const context=await browser.newContext({viewport:{width,height:850},recordVideo:{dir:fileURLToPath(preview),size:{width,height:850}}});
    await context.addInitScript(()=>localStorage.setItem('spire-audio-mix-v1',JSON.stringify({music:0,effects:0,voices:0,muted:true})));
    const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
    await page.route('**/src/battle-scene.ts*',async route=>{
      const response=await route.fetch();let body=await response.text();
      body=body.replace(/super\(["']IdleBattle["']\);/,'super("IdleBattle"); window.__bossReviewScene=this;');
      if(version==='before')body=body.replaceAll('enemy.def.id === "Rosenspiegel" ? 0 : 9','9').replace('strokeEllipse(enemy.x, enemy.y, 34, 13)','strokeEllipse(enemy.x, enemy.y + 3, 34, 13)');
      await route.fulfill({response,body});
    });
    if(version==='before')await page.route('**/src/boss-visuals.ts*',async route=>{
      const response=await route.fetch(),body=await response.text();
      await route.fulfill({response,body:body.replace('this.tether.setAlpha(opacity);',`this.tether.setAlpha(opacity).lineStyle(active ? 2 : 1, 0xf185c1, active ? 0.9 : 0.45);
        for (let step=0;step<30;step++){if(!active&&step%4>=2)continue;const from=curve(step/30),to=curve((step+1)/30);this.tether.lineBetween(from.x,from.y,to.x,to.y);}`)});
    });
    await page.goto('http://127.0.0.1:5235/tests/browser/tavern-session.html');
    const slot=await page.evaluate(async snapshot=>{
      const {openBattleStore}=await import('/src/save-store.ts'),{IdleBattle}=await import('/src/battle.ts');
      const battle=IdleBattle.restore(snapshot);if(!battle)throw Error('Boss fixture invalid');
      const slot=`boss-visual-${crypto.randomUUID()}`,store=await openBattleStore(undefined,`spire-idle-bastion-probe-${slot}`);
      try{await store.save(battle.snapshot(),true,0);}finally{store.close();}return slot;
    },fixture);
    await page.goto(`http://127.0.0.1:5235/?probe=${slot}`);
    await page.locator('#boot-screen').waitFor({state:'hidden',timeout:60000});
    if(await page.locator('#return-card').isVisible())await page.locator('#claim-offline').click();
    await page.waitForFunction(()=>!!window.__bossReviewScene?.sim.bossEnemy);
    await page.evaluate(()=>{const scene=window.__bossReviewScene,b=scene.sim,target=b.towers.find(t=>t.uid===b.bossCharm.targetUid);scene.showHeroPosition({x:(b.bossEnemy.x+target.x)/2,y:(b.bossEnemy.y+target.y)/2});b.bossCharm.remaining=3.3;
      // Presentation-only isolation for the comparison: escorts would cover her feet.
      for(const [uid,view] of scene.enemyViews)if(uid!==b.bossEnemy.uid){view.sprite.setVisible(false);view.shadow.setVisible(false);}
    });
    await page.waitForTimeout(500);
    const observation=await page.evaluate(()=>{
      const scene=window.__bossReviewScene,b=scene.sim,boss=b.bossEnemy,view=scene.enemyViews.get(boss.uid);
      return{shadowDelta:view.shadow.y-boss.y,frame:view.sprite.frame.name,footOrigin:view.sprite.originY,scale:view.sprite.scaleX,
        otherShadowDeltas:b.enemies.filter(e=>e!==boss).map(e=>scene.enemyViews.get(e.uid).shadow.y-e.y),
        targetUid:b.bossCharm.targetUid,remaining:b.bossCharm.remaining,phase:b.bossCharm.phase};
    });
    assert.equal(observation.shadowDelta,version==='before'?9:0);
    assert.ok(observation.otherShadowDeltas.every(d=>d===9));
    await page.screenshot({path:fileURLToPath(new URL(`${version}-${width}.png`,preview)),fullPage:true});
    await page.evaluate(()=>{const start=performance.now();window.__bossReviewTimer=setInterval(()=>{
      const b=window.__bossReviewScene.sim,age=((performance.now()-start)/1000)%5.3;
      b.bossCharm.phase=age<.8?'windup':'channel';b.bossCharm.remaining=age<.8?.8-age:5.3-age;
    },25);});
    await page.waitForTimeout(5700);await page.evaluate(()=>clearInterval(window.__bossReviewTimer));
    assert.deepEqual(errors,[]);results.push({width,version,...observation,errors});
    const video=page.video();await context.close();await video.saveAs(fileURLToPath(new URL(`${version}-${width}.webm`,preview)));
  }
  const context=await browser.newContext(),page=await context.newPage();
  await page.goto(`http://127.0.0.1:5235/?probe=music-${Date.now()}`);
  await page.locator('#boot-screen').waitFor({state:'hidden',timeout:60000});
  const beforeTap=await page.locator('audio[data-spire-music]').count();
  await page.mouse.click(12,20);
  await page.waitForFunction(()=>{const a=document.querySelector('audio[data-spire-music="field"]');return a&&!a.paused&&a.currentTime>0});
  const music=await page.locator('audio[data-spire-music="field"]').evaluate(a=>({playing:!a.paused,time:a.currentTime,slider:document.querySelector('[data-audio="music"]').value}));
  results.push({freshMusic:{beforeTap,...music}});await context.close();
  await writeFile(new URL('browser-results.json',root),JSON.stringify(results,null,2)+'\n');console.log(JSON.stringify(results));
}finally{await browser.close();}
