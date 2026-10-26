import { chromium } from 'file:///C:/Users/madde/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
import { writeFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
const results=[];
try{
  for(const [hero,width] of [['mara',1280],['ilyra',390]]){
    const context=await browser.newContext({viewport:{width,height:850}});
    await context.addInitScript(()=>{
      localStorage.setItem('spire-audio-mix-v1',JSON.stringify({music:.16,effects:.55,voices:.55,muted:false}));
      window.__voiceEvents=[];window.__routes=[];
      const create=AudioContext.prototype.createMediaElementSource;
      AudioContext.prototype.createMediaElementSource=function(a){const node=create.call(this,a),connect=node.connect;
        node.connect=function(gain){window.__routes.push({a,gain});return connect.call(this,gain)};return node;};
      document.addEventListener('play',event=>{const a=event.target;if(a.dataset?.spireVoice!=='hero-command')return;
        window.__voiceEvents.push({hero:a.dataset.hero,command:a.dataset.command,src:a.currentSrc,time:performance.now(),gain:window.__routes.find(r=>r.a===a).gain.gain.value});},true);
    });
    const page=await context.newPage(),errors=[],downloads=[];
    // Expose the existing scene only in this test response; no test globals in production.
    await page.route('**/src/battle-scene.ts*',async route=>{
      const response=await route.fetch(),body=await response.text();
      assert.match(body,/super\(["']IdleBattle["']\);/);
      await route.fulfill({response,body:body.replace(/super\(["']IdleBattle["']\);/,'super("IdleBattle"); window.__voiceScene=this;')});
    });
    await page.route('**/src/game-audio.ts*',async route=>{
      const response=await route.fetch(),body=await response.text();
      assert.match(body,/commandHero\(who, command\) \{/);
      await route.fulfill({response,body:body.replace('commandHero(who, command) {','commandHero(who, command) { (window.__commands??=[]).push({hero:who,command});')});
    });
    page.on('pageerror',e=>errors.push(e.message));
    page.on('request',r=>{if(r.resourceType()==='media'&&/assets\/(ilyra-voice|mara-command-voice)\//.test(r.url()))downloads.push(r.url());});
    await page.goto('http://127.0.0.1:5235/tests/browser/tavern-session.html');
    await page.locator('#ilyra').click();await page.locator('#result a').waitFor();
    const url=new URL(await page.locator('#result a').getAttribute('href'),page.url());
    await page.evaluate(async slot=>{
      const {openBattleStore}=await import('/src/save-store.ts'),{IdleBattle}=await import('/src/battle.ts'),{stepIlyraMotion}=await import('/src/ilyra.ts');
      const store=await openBattleStore(undefined,`spire-idle-bastion-probe-${slot}`);
      try{const result=await store.load();if(result.kind!=='valid')throw Error('Fixture invalid');
        const b=IdleBattle.restore(result.save.battle);b.mara.autoCast=false;
        if(!b.moveIlyraTo({x:3,y:5}))throw Error('Fixture move failed');
        for(let i=0;i<3000&&b.ilyra.path.length;i++)stepIlyraMotion(b.ilyra,.025);
        b.ilyra.introduction='done';b.mode='farm';b.farmWave=6;b.liveClearedWaves=[1,6];b.startAttempt();b.update(.9);
        if(!IdleBattle.restore(b.snapshot()))throw Error('Fixture not reloadable');
        await store.save(b.snapshot(),true,result.save.revision,{offline:result.save.offline});
      }finally{store.close();}
    },url.searchParams.get('probe'));
    await page.goto(url.href);await page.locator('#boot-screen').waitFor({state:'hidden',timeout:60000});
    if(await page.locator('#return-card').isVisible())await page.locator('#claim-offline').click();
    await page.waitForFunction(()=>!!window.__voiceScene);
    assert.equal(downloads.length,0,'No command voice preload on map');
    await page.evaluate(()=>{window.__commands=[];});
    await page.locator('#settlement-tab').click();await page.locator(`#pick-${hero}`).click();
    await page.waitForFunction(()=>window.__voiceEvents.length===1);
    // Switching hero immediately shares the same cooldown and cannot layer voices.
    const other=hero==='mara'?'ilyra':'mara';
    await page.locator(`#pick-${other}`).click();await page.locator(`#pick-${hero}`).click();
    assert.equal(await page.evaluate(()=>window.__voiceEvents.length),1);
    await page.locator(`#move-${hero}`).click();
    await page.waitForTimeout(7100);
    const next=await page.evaluate(async hero=>{
      const scene=window.__voiceScene,b=scene.sim,{IdleBattle}=await import('/src/battle.ts');
      const current=b[hero],cx=Math.floor(current.x/40),cy=Math.floor(current.y/40);
      for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){
        const cell={x:cx+dx,y:cy+dy},probe=IdleBattle.restore(b.snapshot());
        if((hero==='mara'?probe.moveMaraTo(cell):probe.moveIlyraTo(cell))){scene.showHeroPosition({x:cell.x*40+20,y:cell.y*40+20});return cell;}
      }throw Error('No free neighbouring cell');
    },hero);
    await page.waitForTimeout(500);
    const point=await page.evaluate(cell=>window.__voiceScene.worldAnchor({x:cell.x*40+20,y:cell.y*40+20}),next);
    await page.mouse.click(point.x,point.y);
    await page.waitForFunction(()=>window.__voiceEvents.length===2);
    assert.equal(await page.evaluate(()=>window.__voiceEvents[1].command),'move');
    const count=await page.evaluate(()=>window.__commands.length);
    await page.evaluate(()=>window.__voiceScene.hooks.heroGround({x:-1,y:0}));await page.waitForTimeout(150);
    assert.equal(await page.evaluate(()=>window.__commands.length),count,'Rejected move has no voice dispatch');
    await page.waitForTimeout(7100);await page.locator('#pause').click();
    await page.waitForFunction(hero=>window.__voiceScene.sim[hero].path.length===0,hero);
    if(hero==='mara')await page.locator('#hero-mara-cast').click();
    else{
      await page.locator('#hero-aim').click();
      const target=await page.evaluate(async()=>{const {ilyraFirstTarget}=await import('/src/hero-controls.ts');return ilyraFirstTarget(window.__voiceScene.sim)});
      assert.ok(target);await page.evaluate(p=>window.__voiceScene.showHeroPosition(p),target);await page.waitForTimeout(400);
      const point=await page.evaluate(p=>window.__voiceScene.worldAnchor(p),target);await page.mouse.click(point.x,point.y);
    }
    await page.waitForFunction(()=>window.__voiceEvents.length===3);
    assert.equal(await page.evaluate(()=>window.__voiceEvents[2].command),'cast');
    if(hero==='ilyra')assert.match(await page.evaluate(()=>window.__voiceEvents[2].src),/youremine1/);
    await page.locator('[data-audio-mute]').evaluate(input=>{input.checked=true;input.dispatchEvent(new Event('change',{bubbles:true}));});
    assert.equal(await page.locator('audio[data-spire-voice="hero-command"]').evaluate(a=>a.paused&&!a.getAttribute('src')),true);
    const events=await page.evaluate(()=>window.__voiceEvents);
    for(let i=1;i<events.length;i++)assert.ok(events[i].time-events[i-1].time>=7000);
    if(hero==='mara')for(let i=1;i<events.length;i++)assert.notEqual(events[i].src,events[i-1].src);
    assert.deepEqual(errors,[]);
    results.push({hero,width,noMapPreload:true,sharedCooldown:true,rejectedMoveSilent:true,muteStops:true,events,errors});
    await context.close();
  }
  await writeFile(new URL('browser-results.json',import.meta.url),JSON.stringify(results,null,2)+'\n');
  console.log(JSON.stringify(results));
}finally{await browser.close();}
