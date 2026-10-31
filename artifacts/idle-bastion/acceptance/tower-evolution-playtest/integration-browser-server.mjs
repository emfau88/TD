/** Local-only migration smoke fixture UI. Never part of Vite/Pages inputs. */
import {build} from 'esbuild';
import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import {resolve,extname,sep} from 'node:path';
const root=process.cwd();
const output=resolve(root,'dist');
const script=await build({stdin:{resolveDir:root,loader:'ts',contents:`
import oldMain from './artifacts/idle-bastion/acceptance/wave-rework-v2/earned-balanced-late.json';
import fixtures from './experiments/idle-bastion/tests/fixtures/legacy-migrations.json';
import {IdleBattle} from './experiments/idle-bastion/src/battle';
import {beginAbsence,createOfflineState,reserveOffline} from './experiments/idle-bastion/src/offline';
const slots=['spire-idle-bastion','spire-idle-bastion-probe-integration-old','spire-idle-bastion-probe-integration-offline-valid','spire-idle-bastion-tower-evolution'];
const out=document.querySelector('pre');
async function database(name){return await new Promise((ok,fail)=>{const r=indexedDB.open(name,1);r.onupgradeneeded=()=>r.result.createObjectStore('saves');r.onsuccess=()=>ok(r.result);r.onerror=()=>fail(r.error);});}
async function read(name){const db=await database(name);return await new Promise((ok,fail)=>{const tx=db.transaction('saves','readonly'),r=tx.objectStore('saves').get('default');tx.oncomplete=()=>{db.close();ok(r.result);};tx.onerror=()=>fail(tx.error);});}
async function put(name,value){const db=await database(name);await new Promise((ok,fail)=>{const tx=db.transaction('saves','readwrite');tx.objectStore('saves').add(value,'default');tx.oncomplete=ok;tx.onerror=()=>fail(tx.error);});db.close();}
const view=s=>s?{schema:s.battle.schemaVersion,gold:s.battle.gold,wave:s.battle.wave,paused:s.paused,towers:s.battle.towers.map(t=>({kind:t.kind,level:t.level})),elapsed:s.battle.elapsed,pending:s.offline?.pendingReward?.amountUnits??0}:null;
async function inspect(){const saved=await Promise.all(slots.map(read));const expected=JSON.parse(localStorage.getItem('integration-oracles')||'null');out.textContent=JSON.stringify(saved.map((s,i)=>({database:slots[i],current:view(s),battleEqualsOriginal:expected?JSON.stringify(IdleBattle.restore(s.battle)?.snapshot())===JSON.stringify(expected[i]):null})),null,2);}
document.querySelector('#inspect').onclick=()=>inspect().catch(e=>out.textContent=String(e));
document.querySelector('#offline').onclick=async()=>{try{const now=Date.now(),basis={wave:1,fingerprint:'pre-mara-rule-one-defense',rulesVersion:1,rewardGold:200,durationMs:120000};const offline=reserveOffline(beginAbsence(createOfflineState(now-3*60*60*1000),now-3*60*60*1000,basis,false),now);await put(slots[2],{schemaVersion:2,revision:12,writtenAt:now,paused:true,battle:fixtures.store.schema2,offline});await inspect();}catch(e){out.textContent=String(e);}};
document.querySelector('#seed').onclick=async()=>{try{
 if((await Promise.all(slots.map(read))).some(Boolean))throw Error('Refusing to overwrite existing local data');
 const now=Date.now(),basis={wave:1,fingerprint:'pre-mara-rule-one-defense',rulesVersion:1,rewardGold:200,durationMs:120000};
 const offline=reserveOffline(beginAbsence(createOfflineState(now-3*60*60*1000),now-3*60*60*1000,basis,false),now);
 // A fully used two-hour historical window cannot accrue a later tail.
 const saves=[{schemaVersion:1,revision:17,writtenAt:now,paused:true,battle:oldMain},
 {schemaVersion:1,revision:17,writtenAt:now,paused:true,battle:fixtures.store.schema1},
 {schemaVersion:2,revision:12,writtenAt:now,paused:true,battle:fixtures.store.schema2,offline},
 {schemaVersion:1,revision:1,writtenAt:now,paused:true,battle:IdleBattle.newGame().snapshot()}];
 localStorage.setItem('integration-oracles',JSON.stringify(saves.map(s=>IdleBattle.restore(s.battle).snapshot())));
 for(let i=0;i<slots.length;i++)await put(slots[i],saves[i]);await inspect();
 }catch(e){out.textContent=String(e);}};
`},bundle:true,format:'esm',write:false});
const html='<!doctype html><meta charset="utf-8"><title>Local migration smoke</title><h1>Historical save smoke · local only</h1><p>Seeds frozen historical inputs in an unused localhost origin. Refuses to overwrite existing saves.</p><button id="seed">Prepare historical saves</button> <button id="offline">Prepare reserved receipt only</button> <button id="inspect">Inspect persisted saves</button><p><a href="/">Main save</a> · <a href="/?probe=integration-old">Old probe</a> · <a href="/?probe=integration-offline-valid">Reserved offline claim</a> · <a href="/?fresh=1">Fresh probe</a> · <a href="/idle-bastion/?probe=integration-old#legacy">Old path alias</a></p><pre></pre><script type="module" src="/integration-smoke.js"></script>';
const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.png':'image/png','.webp':'image/webp','.ogg':'audio/ogg','.mp3':'audio/mpeg','.svg':'image/svg+xml','.woff2':'font/woff2'};
createServer(async(req,res)=>{try{
 let path=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
 res.setHeader('Cache-Control','no-store');
 if(path==='/integration-smoke.html'){res.setHeader('Content-Type','text/html');res.end(html);return;}
 if(path==='/integration-smoke.js'){res.setHeader('Content-Type','text/javascript');res.end(script.outputFiles[0].contents);return;}
 if(path.endsWith('/'))path+='index.html';const file=resolve(output,'.'+path);
 if(!file.startsWith(output+sep))throw Error('Invalid path');
 const bytes=await readFile(file);res.setHeader('Content-Type',types[extname(file)]||'application/octet-stream');res.end(bytes);
}catch{res.statusCode=404;res.end('Not found');}}).listen(5196,'127.0.0.1',()=>console.log('Local integration smoke: http://127.0.0.1:5196/integration-smoke.html'));
