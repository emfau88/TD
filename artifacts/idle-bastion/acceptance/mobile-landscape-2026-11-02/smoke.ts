import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';
import {chromium} from 'file:///C:/Users/madde/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
import {createOfflineState} from '../../../../experiments/idle-bastion/src/offline';
const origin=process.argv[2]??'http://127.0.0.1:5199',out=process.argv[3]??'artifacts/idle-bastion/acceptance/mobile-landscape-2026-11-02/smoke';mkdirSync(out,{recursive:true});
const battle=JSON.parse(gunzipSync(readFileSync('artifacts/glutwerfer-2026-11-02/evidence.json.gz')).toString()).candidates.final['mixed-return-control'].final;
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'}),results=[];
try{for(const [width,height,touch] of [[720,320,true],[844,390,true],[932,430,true],[390,844,true],[1440,900,false],[844,390,false]] as const){
 const ctx=await browser.newContext({viewport:{width,height},isMobile:touch,hasTouch:touch}),p=await ctx.newPage(),errors:string[]=[];
 p.on('pageerror',e=>errors.push(e.message));p.on('response',r=>{if(r.status()>=400)errors.push(`${r.status()} ${r.url()}`)});
 await p.addInitScript(()=>{localStorage.setItem('spire-language-v1','en');localStorage.setItem('spire-audio-mix-v1',JSON.stringify({muted:true,music:0,effects:0,voices:0}));});
 await p.goto(origin+'/?fresh=1');await p.locator('#boot-screen').waitFor({state:'hidden',timeout:60000});
 const compact=touch&&width>height;
 assert.equal(await p.evaluate(()=>getComputedStyle(document.documentElement).getPropertyValue('--compact-landscape').trim()),compact?'1':'');
 if(compact){const intro=await p.locator('#onboarding-card').boundingBox();assert.ok(intro!.height<height*.55);const menu=await p.locator('#open-menu').boundingBox();assert.ok(menu!.x+menu!.width<=width);}
 await p.goto(origin+'/audio-credits.html');const now=Date.now(),off=createOfflineState(now);off.baseline.paused=true;const slot=`landscape-smoke-${Date.now()}`,name='spire-idle-bastion-probe-'+slot;
 await p.evaluate(async({name,battle,off,now})=>new Promise<void>((resolve,reject)=>{const q=indexedDB.open(name,1);q.onupgradeneeded=()=>q.result.createObjectStore('saves');q.onerror=()=>reject(q.error);q.onsuccess=()=>{const db=q.result,tx=db.transaction('saves','readwrite');tx.objectStore('saves').put({schemaVersion:2,revision:1,writtenAt:now,paused:true,battle,offline:off,maraOfflineWelcomeSeen:true},'default');tx.oncomplete=()=>{db.close();resolve()};tx.onerror=()=>reject(tx.error);};}),{name,battle,off,now});
 await p.goto(origin+'/?probe='+slot);await p.locator('#boot-screen').waitFor({state:'hidden',timeout:60000});if(await p.locator('#claim-offline').isVisible())await p.locator('#claim-offline').click();
 // Exercise asymmetric safe-area layout, not a claim of physical notch testing.
 if(width===720)await p.evaluate(()=>document.documentElement.style.setProperty('--landscape-left','44px'));
 const hud=await p.locator('.app-header').boundingBox(),dock=await p.locator('.command-dock').boundingBox();
 if(compact){assert.equal(hud!.height,48);assert.equal(dock!.height,64);const life=await p.locator('.life-tile').boundingBox();assert.ok(life!.y>=0&&life!.y+life!.height<=48);}
 await p.locator('#open-menu').isVisible().then(async visible=>{if(visible){await p.locator('#open-menu').click();const r=await p.locator('#game-menu').boundingBox();assert.ok(r!.y>=0&&r!.y+r!.height<=height);await p.locator('#close-menu').click();}});
 await p.locator('#settlement-tab').click();await p.locator('#pick-tavern').click();await p.locator('[data-do=mara]').click();await p.locator('.tv-figure canvas').waitFor({state:'visible',timeout:60000});
 const dialog=await p.locator('#tavern-dialog').boundingBox(),stage=await p.locator('.tv-stage').boundingBox();
 if(compact){assert.ok(stage!.height>=200);assert.ok(dialog!.y>=0&&dialog!.y+dialog!.height<=height);if(width===720)assert.ok(dialog!.x>=44);}
 await p.screenshot({path:`${out}/${width}-${height}-${touch?'touch':'mouse'}-tavern.png`});assert.deepEqual(errors,[]);
 results.push({width,height,touch,compact,asymmetricInset:width===720,hud,dock,dialog,stage,errors});writeFileSync(out+'/results.json',JSON.stringify(results,null,2));console.log(`${width}x${height} ${touch?'touch':'mouse'} OK`);
 await ctx.close();
}}finally{await browser.close();}
