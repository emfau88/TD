import {chromium} from 'file:///C:/Users/madde/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
import assert from 'node:assert/strict';import {mkdir,writeFile} from 'node:fs/promises';
const out='artifacts/idle-bastion/acceptance/map-edge-fix-2026-10-27';await mkdir(out,{recursive:true});
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true}),results=[];
try{for(const width of [1440,390,320]){
 const mobile=width<700;const page=await browser.newPage({viewport:{width,height:900},isMobile:mobile,hasTouch:mobile});const errors=[];page.on('pageerror',e=>{errors.push(e.message);console.log('pageerror',e.message)});page.on('console',m=>{if(m.type()==='error')console.log('console',m.text().slice(0,300));});
 await page.route('**/src/battle-scene.ts',async route=>{const response=await route.fetch();const body=await response.text();assert.ok(body.includes('create() {'));await route.fulfill({response,body:body.replace('create() {','create() { globalThis.__cameraScene = this;')});});
 await page.addInitScript(()=>localStorage.setItem('spire-language-v1','de'));
 await page.goto('http://127.0.0.1:5252/?fresh=1');await page.waitForFunction(()=>document.querySelector('#boot-screen')?.hidden||document.querySelector('#boot-screen')?.dataset.phase==='error',{},{timeout:60000});if(await page.locator('#boot-screen').isVisible()){console.log(await page.locator('#boot-screen').innerText());throw Error('boot failed');}
 await page.locator('#onboarding-primary').click();await page.waitForFunction(()=>document.querySelector('#app')?.dataset.maraIntro==='1');
 await page.waitForTimeout(1400);await page.screenshot({path:out+'/intro-'+width+'.png'});
 await page.locator('#onboarding-primary').click();await page.locator('#onboarding-primary').click();await page.waitForFunction(()=>document.querySelector('#app')?.dataset.intro==='build');
 async function check(label){
  await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
  const data=await page.evaluate(()=>{const s=globalThis.__cameraScene,c=s.cameras.main,r=c.worldView;return{view:{x:r.x,y:r.y,width:r.width,height:r.height},map:s.sim.layout.bounds,viewport:{x:c.x,y:c.y,width:c.width,height:c.height},zoom:c.zoom,scale:{width:s.scale.width,height:s.scale.height}};});
  assert.ok(data.view.x>=-.02&&data.view.y>=-.02,JSON.stringify({label,...data}));
  assert.ok(data.view.x+data.view.width<=data.map.width+.02&&data.view.y+data.view.height<=data.map.height+.02,JSON.stringify({label,...data}));
  results.push({screen:width,label,...data});return data;
 }
 await check('after-intro');await page.screenshot({path:out+'/after-intro-'+width+'.png'});
 const client=await page.context().newCDPSession(page);
 async function drag(dx,dy){
  const data=await check('before-drag'),v=data.viewport,k=width/data.scale.width;
  const x=v.x*k+v.width*k/2,y=v.y*k+v.height*k/2;
  const sx=Math.max(30,Math.min(width-30,x-dx/2)),sy=Math.max(170,Math.min(690,y-dy/2));
  const ex=Math.max(15,Math.min(width-15,x+dx/2)),ey=Math.max(175,Math.min(720,y+dy/2));
  if(mobile){
   await client.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:sx,y:sy}]});
   for(let i=1;i<=18;i++)await client.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:sx+(ex-sx)*i/18,y:sy+(ey-sy)*i/18}]});
   await client.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
  }else{await page.mouse.move(sx,sy);await page.mouse.down({button:'middle'});await page.mouse.move(ex,ey,{steps:18});await page.mouse.up({button:'middle'});}
 }
 for(const [label,dx,dy] of [['left',width-60,0],['right',60-width,0],['top',0,500],['bottom',0,-500]]){
  for(let n=0;n<4;n++)await drag(dx,dy);await check(label);
 }
 for(let n=0;n<4;n++)await drag(width-60,0);await check('left-final');
 await page.screenshot({path:out+'/spawn-left-'+width+'.png'});
 if(width>700)await page.screenshot({path:out+'/spawn-left-'+width+'-detail.png',clip:{x:0,y:70,width:650,height:650}});
 await page.locator('#camera-zoom').click();await check('zoom');
 await page.locator('#camera-reset').click();await check('overview');await drag(width-60,500);await check('overview-drag');
 await page.screenshot({path:out+'/overview-'+width+'.png'});
 if(mobile){await page.setViewportSize({width:900,height:width});await check('landscape');await page.setViewportSize({width,height:900});await check('portrait-again');}
 assert.deepEqual(errors,[]);results.push({screen:width,errors,nativeTouch:mobile});console.log('passed',width);await page.close();
}await writeFile(out+'/browser-results.json',JSON.stringify(results,null,2));}finally{await browser.close();}
