import {chromium} from 'file:///C:/Users/madde/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
import {createRequire} from 'node:module';
import {mkdir,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
const sharp=createRequire(import.meta.url)('C:/Users/madde/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');
const label=process.argv[2]||'revised',out=new URL('./checks/effects/',import.meta.url);await mkdir(out,{recursive:true});
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'}),results=[];
try{for(const [width,height]of [[1440,900],[844,390],[390,844]]){
 const context=await browser.newContext({viewport:{width,height},hasTouch:width<1000}),p=await context.newPage();
 await p.goto('http://127.0.0.1:5207');await p.evaluate(async()=>{await document.fonts.ready;await Promise.all([...document.images].map(i=>i.decode()));});
 await p.waitForTimeout(250);await p.evaluate(()=>{window.requestAnimationFrame=()=>0;document.getAnimations().forEach(a=>a.pause());});await p.waitForTimeout(50);
 const samples=[];for(let time=0;time<7200;time+=600){samples.push(await p.evaluate(time=>{
   document.getAnimations().forEach(a=>a.currentTime=time);
   const fire=document.querySelector('#fire').getBoundingClientRect(),visible=[...document.querySelectorAll('.ember')].filter(e=>{const r=e.getBoundingClientRect();return Number(getComputedStyle(e).opacity)>.25&&r.bottom<fire.top+fire.height*.2;});
   return visible.length;
 },time));}
 await p.evaluate(()=>document.getAnimations().forEach(a=>a.currentTime=4200));
 const withFog=await p.screenshot({path:fileURLToPath(new URL(`${label}-${width}.png`,out))});
 await p.evaluate(()=>document.querySelectorAll('.mist').forEach(e=>e.style.visibility='hidden'));const withoutFog=await p.screenshot();
 const a=await sharp(withFog).removeAlpha().raw().toBuffer(),b=await sharp(withoutFog).removeAlpha().raw().toBuffer();let affected=0,total=0;
 for(let i=0;i<a.length;i+=3){const d=Math.max(Math.abs(a[i]-b[i]),Math.abs(a[i+1]-b[i+1]),Math.abs(a[i+2]-b[i+2]));if(d>=6)affected++;total+=d;}
 results.push({width,height,visibleEmbersAboveFlame:{samples,mean:samples.reduce((a,b)=>a+b,0)/samples.length},fog:{pixelsAtLeast6Levels:affected,percentage:100*affected/(width*height),meanChannelDifference:total/(width*height)}});
 await context.close();
}await writeFile(new URL(`${label}.json`,out),JSON.stringify(results,null,2));console.log(JSON.stringify(results,null,2));}finally{await browser.close();}
