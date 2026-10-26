import { chromium } from 'file:///C:/Users/madde/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
import { writeFile } from 'node:fs/promises';
import assert from 'node:assert/strict';

const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
const results=[];
try {
  for(const width of [1280,390]){
    const context=await browser.newContext({viewport:{width,height:850}});
    await context.addInitScript(()=>{
      localStorage.setItem('spire-audio-mix-v1',JSON.stringify({music:0,effects:0,voices:.55,muted:false}));
      window.__voiceEvents=[];window.__voiceRoutes=[];
      const create=AudioContext.prototype.createMediaElementSource;
      AudioContext.prototype.createMediaElementSource=function(element){
        const source=create.call(this,element),connect=source.connect;
        source.connect=function(gain){window.__voiceRoutes.push({element,gain});return connect.call(this,gain);};
        return source;
      };
      document.addEventListener('play',event=>{
        const a=event.target;if(!a.dataset?.spireVoice)return;
        const route=window.__voiceRoutes.find(r=>r.element===a);
        window.__voiceEvents.push({who:a.dataset.spireVoice,src:a.currentSrc,gain:route.gain.gain.value,time:performance.now()});
      },true);
    });
    const page=await context.newPage(),errors=[],requests=[];
    page.on('pageerror',e=>errors.push(e.message));
    page.on('request',r=>{if(r.resourceType()==='media'&&/assets\/(ilyra|mara)-voice\/.*\.(mp3|wav)/.test(r.url()))requests.push(r.url());});
    await page.goto('http://127.0.0.1:5235/tests/browser/tavern-session.html');
    await page.locator('#ilyra').click();await page.locator('#result a').waitFor();
    const url=new URL(await page.locator('#result a').getAttribute('href'),page.url());
    await page.evaluate(async slot=>{
      const {openBattleStore}=await import('/src/save-store.ts');
      const store=await openBattleStore(undefined,`spire-idle-bastion-probe-${slot}`);
      try{const result=await store.load();if(result.kind!=='valid')throw Error('Fixture invalid');
        result.save.battle.social.points.ilyra=35;result.save.battle.social.points.mara=35;
        await store.save(result.save.battle,true,result.save.revision,{offline:result.save.offline});
      }finally{store.close();}
    },url.searchParams.get('probe'));
    await page.goto(url.href);await page.locator('#boot-screen').waitFor({state:'hidden',timeout:60000});
    if(await page.locator('#return-card').isVisible())await page.locator('#claim-offline').click();
    assert.equal(requests.length,0,'No companion voice download on map');
    await page.locator('#settlement-tab').click();await page.locator('#pick-tavern').click();
    await page.locator('[data-do="ilyra"]').click();await page.locator('[data-do="touch"]').click();
    await page.waitForFunction(()=>document.querySelector('audio[data-spire-voice="ilyra"]')?.readyState>=2);
    assert.equal(new Set(requests).size,1,'Only next Ilyra clip preloads');
    const regions=['hair','hand','shoulder'];
    for(let i=0;i<regions.length;i++){
      if(i)await page.waitForTimeout(2600);
      await page.locator(`[data-region="${regions[i]}"]`).click();
      await page.waitForFunction(count=>window.__voiceEvents.length===count,i+1);
      if(i===0){await page.locator('[data-region="shoulder"]').click({force:true});await page.waitForTimeout(100);
        assert.equal(await page.evaluate(()=>window.__voiceEvents.length),1,'Rapid touches do not overlap voices');}
    }
    await page.locator('[data-do="back"]').click();await page.locator('[data-do="back"]').click();await page.locator('[data-do="mara"]').click();
    assert.equal(await page.locator('audio[data-spire-voice="ilyra"]').evaluate(a=>a.paused&&!a.getAttribute('src')),true);
    await page.locator('[data-do="touch"]').click();await page.locator('[data-region="hair"]').click();
    await page.waitForFunction(()=>window.__voiceEvents.some(e=>e.who==='mara'));
    // Exercise the same bound settings inputs while the tavern is open.
    await page.locator('[data-audio-mute]').evaluate(input=>{input.checked=true;input.dispatchEvent(new Event('change',{bubbles:true}));});
    assert.equal(await page.locator('audio[data-spire-voice="mara"]').evaluate(a=>a.paused&&!a.getAttribute('src')),true);
    await page.locator('[data-audio-mute]').evaluate(input=>{input.checked=false;input.dispatchEvent(new Event('change',{bubbles:true}));});
    await page.locator('[data-do="back"]').click();await page.locator('[data-do="back"]').click();await page.locator('[data-do="ilyra"]').click();await page.locator('[data-do="touch"]').click();
    await page.waitForTimeout(2600);await page.locator('[data-region="hand"]').click();
    await page.waitForFunction(()=>window.__voiceEvents.filter(e=>e.who==='ilyra').length===4);
    await page.locator('[data-audio="voices"]').evaluate(input=>{input.value='0';input.dispatchEvent(new Event('input',{bubbles:true}));});
    assert.equal(await page.locator('audio[data-spire-voice="ilyra"]').evaluate(a=>a.paused&&!a.getAttribute('src')),true);
    await page.locator('[data-audio="voices"]').evaluate(input=>{input.value='55';input.dispatchEvent(new Event('input',{bubbles:true}));});
    await page.waitForTimeout(2600);await page.locator('[data-region="shoulder"]').click();
    await page.waitForFunction(()=>window.__voiceEvents.filter(e=>e.who==='ilyra').length===5);
    await page.locator('[data-do="close"]').first().click();
    assert.equal(await page.locator('audio[data-spire-voice="ilyra"]').evaluate(a=>a.paused&&!a.getAttribute('src')),true);
    const verification=await page.evaluate(async()=>{
      const {ILYRA_VOICE_GAINS}=await import('/src/ilyra-voice-levels.ts');
      const events=window.__voiceEvents;
      for(const event of events){const file=new URL(event.src).pathname.split('/').pop();
        const expected=.55*.7*(event.who==='mara'?1:ILYRA_VOICE_GAINS[file]);
        if(Math.abs(event.gain-expected)>1e-6)throw Error(`Incorrect gain: ${file}`);}
      const ilyra=events.filter(e=>e.who==='ilyra');
      for(let i=1;i<ilyra.length;i++)if(ilyra[i].src===ilyra[i-1].src)throw Error('Repeated voice');
      const ctx=new AudioContext(),decoded=[];
      for(const file of Object.keys(ILYRA_VOICE_GAINS)){
        const response=await fetch(`/assets/ilyra-voice/${file}`);if(!response.ok)throw Error(file);
        const buffer=await ctx.decodeAudioData(await response.arrayBuffer());decoded.push({file,duration:buffer.duration});
      }await ctx.close();return{events,decoded};
    });
    assert.deepEqual(errors,[]);
    results.push({width,regions,noMapPreload:true,oneNextClip:true,noOverlap:true,switchStops:true,muteStops:true,zeroVolumeStops:true,closeStops:true,...verification,errors});
    await context.close();
  }
  await writeFile(new URL('browser-results.json',import.meta.url),JSON.stringify(results,null,2)+'\n');
  console.log(JSON.stringify(results.map(({width,events,decoded,errors,...checks})=>({...checks,width,played:events.length,decoded:decoded.length,errors}))));
}finally{await browser.close();}
