/** B13: real wall-clock/UI playthrough. No combat clock, currency or unlock injection.
 * PLAYWRIGHT_MODULE may point at an installed Playwright ESM module. */
const playwrightModule=process.env.PLAYWRIGHT_MODULE ?? 'playwright';
const { chromium }=await import(playwrightModule);
import { writeFileSync } from 'node:fs';
import { IdleBattle } from '../../src/battle';
import { nextPurchase, type Purchase } from '../helpers/balance-run';
const output='artifacts/idle-bastion/acceptance/15min';
const slot=`b13-live-${Date.now()}`, database=`spire-idle-bastion-probe-${slot}`;
const browser=await chromium.launch({headless:true,args:['--disable-background-timer-throttling']});
const context=await browser.newContext({viewport:{width:1600,height:1000}}),page=await context.newPage();
page.setDefaultTimeout(8000);
const report:any={slot,viewport:'1600x1000',speed:1,started:new Date().toISOString(),times:{},actions:[],minutes:[],errors:[]};
page.on('pageerror',(e:Error)=>report.errors.push(e.message));page.on('response',(r:any)=>{if(r.status()>=400)report.errors.push(`${r.status()} ${r.url()}`);});
const flush=()=>writeFileSync(`${output}/b13-browser.json`,JSON.stringify(report,null,2));
async function save(){return page.evaluate(async (name:string)=>{const db:IDBDatabase=await new Promise((resolve,reject)=>{const q=indexedDB.open(name);q.onsuccess=()=>resolve(q.result);q.onerror=()=>reject(q.error);});const s=await new Promise<any>((resolve,reject)=>{const q=db.transaction('saves').objectStore('saves').get('default');q.onsuccess=()=>resolve(q.result);q.onerror=()=>reject(q.error);});db.close();return s;},database);}
async function close(){if(await page.locator('#close-context').isVisible())await page.locator('#close-context').click();}
async function mapClick(b:IdleBattle,x:number,y:number,reset=true){if(reset)await page.locator('#camera-reset').click();const box=(await page.locator('#game canvas').boundingBox())!;const zoom=Math.min(box.width/b.layout.bounds.width,box.height/b.layout.bounds.height);await page.mouse.click(box.x+box.width/2+(x-b.layout.bounds.width/2)*zoom,box.y+box.height/2+(y-b.layout.bounds.height/2)*zoom);}
async function act(b:IdleBattle,a:Purchase){
 await close();
 if(a.type==='build'){
  await page.locator('#tower-tab').click();await page.locator('#camera-reset').click();await page.locator(`#pick-${['','archer','frost','cannon','sniper'][a.kind]}`).click();
  const cell=b.layout.towerPads.find(p=>p.id===a.pad)!.cell;await mapClick(b,(cell.x+.5)*40,(cell.y+.5)*40,false);await page.locator('#confirm-placement').click();
 }else if(a.type==='upgrade'){
  const t=b.towers.find(t=>t.uid===a.uid)!,cell=b.layout.towerPads.find(p=>p.id===t.padId)!.cell;
  await mapClick(b,(cell.x+.5)*40,(cell.y+.5)*40-12);await page.locator('#upgrade').click();await close();
 }else if(a.type==='advance'){await page.locator('#advance').click();}
 else{
  await page.locator('#settlement-tab').click();await page.locator(`#pick-${a.type==='warehouse'?'warehouse':a.type==='clearing'?'clearing':'workshop'}`).click();
  if(a.type==='workshop'||a.type==='warehouse'){await page.locator(`#build-${a.type}`).click();await page.locator('#confirm-placement').click();}
  else{await page.locator(a.type==='research'?'#research-frost':a.type==='workshop2'?'#upgrade-workshop':'#unlock-clearing').click();await close();}
 }
 await page.waitForTimeout(250);
 const after=await save();report.actions.push({at:b.elapsed,...a,goldBefore:b.gold,goldAfter:after.battle.gold});flush();
}
try{
 const loading=Date.now();await page.goto(`http://127.0.0.1:5191/?probe=${slot}`);
 await page.locator('#game canvas').waitFor();await page.waitForFunction(()=>!(document.querySelector('#pause') as HTMLButtonElement).disabled);
 report.loadMs=Date.now()-loading;report.activeStart=Date.now();
 if(await page.locator('#hint-skip').isVisible())await page.locator('#hint-skip').click();
 let minute=-1,lastInvestment=-1,retriedInvestment=-1;const shots=new Set<string>();
 while(true){
  if(await page.locator('#meet-wisp').isVisible())await page.locator('#meet-wisp').click();
  const s=await save(),b=IdleBattle.restore(s?.battle);if(!b)throw Error('Saved browser battle failed validation');
  const milestones:any={workshop:b.settlement.workshopBuilt,research:b.settlement.frostResearched,wisp:b.wispUnlocked,warehouse:b.settlement.warehouseBuilt,boss:b.bossVictories,clearing:b.clearing.unlocked,workshop2:b.settlement.workshopUpgraded,secondBoss:b.secondBossVictories};
  for(const [key,v]of Object.entries(milestones))if(v&&report.times[key]===undefined){report.times[key]=b.elapsed;console.log(JSON.stringify({milestone:key,at:b.elapsed}));if(['workshop','boss','clearing'].includes(key))await page.screenshot({path:`${output}/b13-${key}.png`});}
  const m=Math.floor(b.elapsed/60);if(m!==minute){minute=m;const state={elapsed:b.elapsed,wallSeconds:(Date.now()-report.activeStart)/1000,wave:b.wave,record:b.highestCleared,gold:b.gold,farm:b.farmWave,mode:b.mode};report.minutes.push(state);console.log(JSON.stringify(state));flush();}
  if(b.elapsed>=60&&!shots.has('minute1')){shots.add('minute1');await page.screenshot({path:`${output}/b13-minute1.png`});}
  if(b.elapsed>=900){report.final={elapsed:b.elapsed,record:b.highestCleared,wave:b.wave,farm:b.farmWave,mode:b.mode,gold:b.gold,levels:b.towers.map(t=>({kind:t.def.id,pad:t.padId,level:t.level})),wallSeconds:(Date.now()-report.activeStart)/1000};await page.screenshot({path:`${output}/b13-minute15.png`});writeFileSync(`${output}/b13-browser-save.json`,JSON.stringify(s,null,2));break;}
  const a=nextPurchase(b);if(a){await act(b,a);lastInvestment=b.elapsed;}
  else if(b.mode==='farm'&&lastInvestment>retriedInvestment){await act(b,{type:'advance'});retriedInvestment=lastInvestment;}
  if(report.errors.length)throw Error(report.errors.join('; '));
  await page.waitForTimeout(850);
 }
 report.finished=new Date().toISOString();flush();console.log(JSON.stringify(report.final));
}catch(e){report.failure=String(e);flush();await page.screenshot({path:`${output}/b13-failure.png`});throw e;}
finally{await context.close();await browser.close();}
