import { chromium } from 'file:///C:/Users/madde/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
import { readFile,writeFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
const levels=JSON.parse(await readFile(new URL('../../../../experiments/idle-bastion/assets/ilyra-voice/levels.json',import.meta.url),'utf8'));
const runs=JSON.parse(await readFile(new URL('browser-results.json',import.meta.url),'utf8'));
for(const run of runs)for(const event of run.events){
  const file=new URL(event.src).pathname.split('/').pop();
  const clip=(event.hero==='mara'?levels.maraCommands:levels.commands).find(c=>c.file===file);
  assert.ok(Math.abs(event.gain-.55*.5*clip.gain)<1e-6,'Actual GainNode matches quieter calibrated level');
}
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
try{
  const page=await browser.newPage();await page.goto('http://127.0.0.1:5235/tests/browser/tavern-session.html');
  const result=await page.evaluate(async()=>{
    const {GameAudio}=await import('/src/game-audio.ts');
    const {ILYRA_COMMAND_VOICE_GAINS,MARA_COMMAND_VOICE_GAINS}=await import('/src/ilyra-voice-levels.ts');
    const context=new AudioContext(),decoded=[];
    for(const [folder,files] of [['ilyra-voice',ILYRA_COMMAND_VOICE_GAINS],['mara-command-voice',MARA_COMMAND_VOICE_GAINS]]){
      for(const file of Object.keys(files)){
        const response=await fetch(`/assets/${folder}/${file}`);if(!response.ok)throw Error(file);
        const data=await context.decodeAudioData(await response.arrayBuffer());decoded.push({file,duration:data.duration});
      }
    }await context.close();
    const audio=new GameAudio({combat:false});window.__audioLifecycle=audio;
    audio.setMix({music:0,effects:0,voices:.55,muted:false});audio.setState(true,true);
    return{decoded};
  });
  await page.mouse.click(5,5);
  await page.waitForFunction(()=>window.__audioLifecycle.context?.state==='running');
  await page.evaluate(()=>window.__audioLifecycle.commandHero('mara','select'));
  await page.waitForFunction(()=>{const a=document.querySelector('audio[data-spire-voice="hero-command"]');return a&&!a.paused&&a.currentTime>0});
  await page.evaluate(()=>window.__audioLifecycle.setTavern(true));
  assert.equal(await page.locator('audio[data-spire-voice="hero-command"]').evaluate(a=>a.paused&&!a.getAttribute('src')),true);
  await page.evaluate(()=>window.__audioLifecycle.commandHero('ilyra','cast'));
  assert.equal(await page.locator('audio[data-spire-voice="hero-command"]').evaluate(a=>!a.getAttribute('src')),true);
  await page.evaluate(()=>{const a=window.__audioLifecycle;a.setTavern(false);a.setMix({voices:0});a.commandHero('mara','move');});
  assert.equal(await page.locator('audio[data-spire-voice="hero-command"]').evaluate(a=>!a.getAttribute('src')),true);
  await page.evaluate(()=>{const a=window.__audioLifecycle;a.setMix({voices:.55});a.setState(false,false);a.commandHero('ilyra','select');});
  assert.equal(await page.locator('audio[data-spire-voice="hero-command"]').evaluate(a=>!a.getAttribute('src')),true);
  await page.evaluate(()=>window.__audioLifecycle.destroy());
  assert.equal(await page.locator('audio[data-spire-voice="hero-command"]').count(),0);
  Object.assign(result,{actualGameGainsMatch:true,tavernStopsAndBlocks:true,zeroVolumeBlocks:true,inactiveSessionBlocks:true,destroyRemovesPlayer:true});
  await writeFile(new URL('media-results.json',import.meta.url),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result));
}finally{await browser.close();}
