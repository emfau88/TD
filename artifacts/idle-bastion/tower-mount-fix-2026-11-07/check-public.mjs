import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import { chromium } from 'file:///C:/Users/madde/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';

const base='https://emfau88.github.io/TD/';
// Entry names come from the successful CI log; compare the tower module byte for byte.
const ci=JSON.parse(await readFile(new URL('./ci-build.json',import.meta.url),'utf8'));
const entry=ci.entry;
const response=await fetch(base+'?verify=tower-4d771b86');
assert.equal(response.status,200);
const liveHtml=await response.text();
assert.ok(liveHtml.includes(entry),'live entry must match the new CI production build');
const hashes=[];
for(const asset of [ci.entry,ci.mainBundle,'./assets/ilyra-view-B_kij17b.js']){
  const remote=await fetch(new URL(asset,base));
  assert.equal(remote.status,200);
  const online=Buffer.from(await remote.arrayBuffer());
  const hash=b=>createHash('sha256').update(b).digest('hex');
  if(asset.includes('ilyra-view-')){
    const local=await readFile(new URL('../../../dist/'+asset,import.meta.url));
    assert.equal(hash(local),hash(online),'live tower module must match exact tested local bytes');
    assert.ok(online.toString().includes('85,88,92'),'new frost body targets present');
  }
  hashes.push({asset,bytes:online.length,sha256:hash(online)});
}
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,args:['--disable-gpu']});
const page=await browser.newPage({viewport:{width:1280,height:844}});
const errors=[],httpErrors=[];
page.on('pageerror',e=>errors.push(e.message));
page.on('response',r=>{if(r.status()>=400)httpErrors.push({url:r.url(),status:r.status()});});
try{
  await page.goto(base+'?verify=tower-4d771b86',{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>document.querySelector('#boot-screen')?.hidden===true,{},{timeout:60000});
  await page.locator('canvas:visible').first().waitFor({state:'visible'});
  await page.screenshot({path:new URL('./public-main.png',import.meta.url).pathname.replace(/^\//,'')});
  assert.deepEqual(errors,[]);
  assert.deepEqual(httpErrors,[]);
  const result={date:new Date().toISOString(),codeCommit:'4d771b864f8fef069bb33f9ece2fd8fb25e07c47',run:42385360962,url:base,entry,hashes,browserStarted:true,errors,httpErrors};
  await writeFile(new URL('./public-delivery.json',import.meta.url),JSON.stringify(result,null,2)+'\n');
  console.log(JSON.stringify(result));
}finally{await browser.close();}
