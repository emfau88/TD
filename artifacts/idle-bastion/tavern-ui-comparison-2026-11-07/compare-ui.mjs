import { chromium } from 'file:///C:/Users/madde/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
import { readFile, writeFile, mkdir, copyFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';

const root = 'C:/Users/madde/Documents/TowerDefense';
const worktree = `${root}/.worktrees/tavern-comfy-integration`;
const baseline = `${root}/.worktrees/progression-economy`;
const relative = 'artifacts/idle-bastion/tavern-ui-comparison-2026-11-07';
const out = `${worktree}/${relative}`, mirror = `${root}/${relative}`;
await mkdir(out, { recursive: true }); await mkdir(mirror, { recursive: true });
const recordedText = await readFile(`${worktree}/artifacts/idle-bastion/acceptance/early-balance-release/selected/B-snapshots.json`, 'utf8');
const foundation = JSON.parse(recordedText).clear25;
const sha = text => createHash('sha256').update(text).digest('hex');
const commit = cwd => execFileSync('git', ['rev-parse', 'HEAD'], { cwd, encoding: 'utf8' }).trim();
const sources = [
  { id: 'before', title: 'Vorher', origin: 'http://127.0.0.1:5279', root: baseline, commit: commit(baseline) },
  { id: 'after', title: 'Nachher', origin: 'http://127.0.0.1:5278', root: worktree, commit: commit(worktree) },
];
assert.match(sources[0].commit, /^daf39fb/);
const cases = [
  { id: '01-progress', points: 58, clears: 18, title: 'Bis zum persönlichen Geschenk',
    caption: 'Gleicher Ausgangsstand: 58 Zuneigung, 18 persönliche Siege. Beide Fassungen nennen die noch fehlenden 12 Siege. Rechts wird zusätzlich klar: Gewonnene normale Wellen zählen, auch beim Farmen. Geschenkdetails bleiben zugeklappt.' },
  { id: '02-conversation', points: 35, clears: 10, title: 'Ein Gespräch im bestehenden Dialog',
    caption: 'Gleicher Ausgangsstand: Herz 2 und 10 persönliche Siege. Links folgt die normale Antwort; rechts eine neue optionale Begegnung mit zwei Antworten. Danach kehren die drei gewohnten Hauptaktionen zurück.' },
  { id: '03-unlock', points: 58, clears: 30, title: 'Das dritte Herz und eine neue Berührung',
    caption: 'Gleicher Ausgangsstand: 58 Zuneigung und das persönliche Geschenk bereit. Links führt der Knopf zur persönlichen Geschichte, rechts direkt zum Ausprobieren der neuen Handberührung. Das verdiente Herz leuchtet rechts kurz auf.' },
];

function fixture(source, item) {
  return `<!doctype html><html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body><script type="module">
import '/src/battle.css'; import '/src/premium.css';
import { IdleBattle } from '/src/battle.ts';
import { BattleSession } from '/src/battle-session.ts';
import { openBattleStore } from '/src/save-store.ts';
import { setLanguage } from '/src/i18n.ts';
import { TavernUI } from '/src/tavern-ui.ts';
import { ${source.id === 'before' ? 'rigPreviewPresentation' : 'videoPresentation'} as presentation } from '/src/${source.id === 'before' ? 'tavern-rig-preview' : 'tavern-video'}.ts';
setLanguage('de');
const b = IdleBattle.restore(${JSON.stringify(foundation)});
if (!b || !b.buildTavern(b.recommendedTavernPlot) || !b.upgradeTavern() || !b.recruitIlyra()) throw Error('Invalid recorded comparison foundation');
b.ilyra.introduction='done'; b.tutorial.hidden=true; b.discovery='off'; b.settlement.tavernSeen=true;
b.social.gifts=4;
for(const who of ['mara','ilyra']){ b.social.points[who]=${item.points};b.social.personal[who]={clears:${item.clears},claimed:false};b.social.reserves[who]={talk:3,touch:3,clears:0}; }
if(!IdleBattle.restore(b.snapshot()))throw Error('Comparison snapshot failed restore');
const before=b.snapshot();
const key='tavern-ui-comparison-${source.id}-${item.id}-'+crypto.randomUUID();
const store=await openBattleStore(undefined,key);
const successfulSaves=[]; const save=store.save.bind(store);
store.save=async(...args)=>{const result=await save(...args);successfulSaves.push({revision:result.revision,at:performance.now(),social:structuredClone(result.battle.social)});return result;};
await store.save(before,true,0);
const session=await BattleSession.open(store,{locks:null});
setInterval(()=>{void session.heartbeat();},1000);
if(session.pendingReward)await session.claimOffline();
if(session.awaitingResume)await session.resumeActive();
if(session.awaitingResume||session.error)throw Error('Comparison return receipt was not completed');
const ui=new TavernUI({session:()=>session,presentation,navigate:()=>{}});
session.onChange=()=>ui.update();
window.compare={session,ui,store,key,before,successfulSaves};
ui.open(); ui.dialog.querySelector('[data-do=mara]').click();
</script></body></html>`;
}
const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true, args: ['--disable-gpu'] });
const metadata = { baselineCommit: sources[0].commit, branchCommitAtCapture: sources[1].commit, viewport: { width: 390, height: 900, deviceScaleFactor: 1 },
  foundationFile: 'artifacts/idle-bastion/acceptance/early-balance-release/selected/B-snapshots.json#clear25', foundationSHA256: sha(recordedText),
  notes: ['Real TavernUI and BattleSession from each source tree; source files untouched.', 'Each capture uses a separate browser context and unique comparison IndexedDB key, never user save namespaces.',
    'Real shipped old rig/new video presentation; genuine idle canvas is frozen for a neutral still. For the gift, artwork is frozen before the action; all UI/save/celebration code runs normally. No game text, UI element or rewards are replaced.',
    'For the third-heart shot, the real committed 200ms CSS animation state is paused for capture.'], cases: [] };
const only = process.argv[2];
if(only)metadata.cases=JSON.parse(await readFile(`${out}/metadata.json`,'utf8')).cases.filter(item=>item.id!==only);
const ready = page => page.waitForFunction(() => window.compare?.ui.animation.ready && !window.compare.ui.pending && !window.compare.session.inputBusy && !window.compare.session.awaitingResume && !window.compare.session.error, { timeout: 45000 });
async function freezeIdle(page) {
  await page.waitForFunction(() => document.querySelector('.tv-figure canvas')?.dataset.clip === 'idle', { timeout: 45000 });
  await page.evaluate(() => {
    const a=window.compare.ui.animation;
    cancelAnimationFrame(a.frameRequest ?? a.request); a.active=false;
    window.compare.frozenArtwork='genuine idle frame';
  });
}
async function measure(page) {
  return page.evaluate(() => {
    const c=window.compare,s=c.session.battle.social;
    const visible=selector=>{const e=document.querySelector(selector),r=e.getBoundingClientRect(),box=e.closest('.tv-conversation')?.getBoundingClientRect();return {text:e.textContent.trim(),visible:!!(r.width&&r.height)&&r.top>=0&&r.bottom<=innerHeight&&(!box||r.top>=box.top&&r.bottom<=box.bottom),top:r.top,bottom:r.bottom};};
    return { key:c.key, before:c.before, current:c.session.battle.snapshot(), commonInitial:{points:c.before.social.points,gifts:c.before.social.gifts,personal:c.before.social.personal,reserves:c.before.social.reserves},
      points:s.points.mara,clears:s.personal.mara.clears,paused:c.session.paused,revision:c.session.revision,sessionError:c.session.error?.message??null,
      hint:visible('[data-text=gift-hint]'),unlock:visible('[data-do=new-moment]'),line:visible('[data-text=line]'),
      giftDetailsOpen:document.querySelector('.tv-gifts details').open,
      actions:[...document.querySelectorAll('.tv-actions>button')].map(b=>({text:b.textContent.trim(),visible:!!b.offsetWidth})),
      answers:[...document.querySelectorAll('[data-answer]')].map(b=>({text:b.textContent.trim(),visible:!!b.offsetWidth})),
      story:document.querySelector('#tavern-dialog').dataset.story,
      overflow:document.documentElement.scrollWidth>innerWidth,artwork:c.frozenArtwork,captureDelayMs:c.captureDelayMs??null,
      saves:c.successfulSaves,cssHeart:document.querySelector('[data-moment="3"] svg')?{transform:getComputedStyle(document.querySelector('[data-moment="3"] svg')).transform,filter:getComputedStyle(document.querySelector('[data-moment="3"] svg')).filter}:null };
  });
}
try {
  for(const item of cases.filter(item=>!only||item.id===only)){
    const pair={...item,captures:[]};
    for(const source of sources){
      const context=await browser.newContext({viewport:metadata.viewport,deviceScaleFactor:1});
      const page=await context.newPage(),errors=[]; page.on('pageerror',e=>errors.push(e.message));
      await page.route('**/__tavern_ui_comparison__',route=>route.fulfill({contentType:'text/html',body:fixture(source,item)}));
      await page.goto(`${source.origin}/__tavern_ui_comparison__`,{waitUntil:'domcontentloaded'});await ready(page);
      await page.locator('.tv-gifts details').evaluate(e=>e.open=false);
      if(item.id==='01-progress'){
        await freezeIdle(page);
        await page.locator('.tv-conversation').evaluate(e=>e.scrollTop=e.scrollHeight);
        assert.match(await page.locator('[data-text=gift-hint]').textContent(),/12/);
      }else if(item.id==='02-conversation'){
        await page.click('[data-do=speak]');await page.click('[data-action=talk]');await ready(page);
        if(source.id==='after'){
          await page.waitForSelector('.tv-replies:not([hidden])');
          assert.equal(await page.locator('[data-answer]:visible').count(),2);
        }
        await freezeIdle(page);
        await page.locator('.tv-conversation').evaluate(e=>e.scrollTop=0);
      }else{
        // Freeze the real idle artwork before the gift; UI/save/celebration still run normally.
        await freezeIdle(page);
        const initialRevision=await page.evaluate(()=>window.compare.session.revision);
        await page.click('[data-action=gift]');await ready(page);
        await page.waitForFunction(rev=>window.compare.session.revision>rev,initialRevision);
        await page.waitForFunction(()=>{const c=window.compare,last=c.successfulSaves.at(-1);return performance.now()-last.at>=200;});
        if(source.id==='after')await page.evaluate(()=>{
          const svg=document.querySelector('[data-moment="3"] svg');
          const animation=svg.getAnimations().find(a=>a.animationName==='tv-heart-earned');
          if(!animation)throw Error('Committed heart celebration missing');
          animation.currentTime=200;animation.pause();
          window.compare.captureDelayMs=performance.now()-window.compare.successfulSaves.at(-1).at;
        });
        await page.locator('.tv-conversation').evaluate(e=>e.scrollTop=0);
      }
      const result=await measure(page);
      assert.equal(result.overflow,false);assert.equal(result.paused,true);assert.equal(result.sessionError,null);assert.deepEqual(errors,[]);
      if(item.id==='01-progress')assert.equal(result.hint.visible,true,'complete gift hint must be visible');
      if(item.id==='03-unlock'){assert.equal(result.points,70);assert.equal(result.unlock.visible,true);assert.equal(result.line.visible,true);}
      const original=`${item.id}-${source.id}.png`;
      await page.screenshot({path:`${out}/${original}`,animations:'allow'});
      // Demonstrate that the extra answer controls are only the open conversation.
      if(item.id==='02-conversation'&&source.id==='after'){
        await page.click('[data-answer=first]');await ready(page);
        for(let i=0;i<6&&await page.locator('.tv-story-controls').isVisible();i++){await page.click('[data-do=story-next]');await ready(page);}
        result.afterConversation={threeMainActionsVisible:await page.locator('.tv-actions>button:visible').count(),answerButtonsVisible:await page.locator('[data-answer]:visible').count()};
        assert.equal(result.afterConversation.threeMainActionsVisible,3);assert.equal(result.afterConversation.answerButtonsVisible,0);
      }
      result.commonInitialSHA256=sha(JSON.stringify(result.commonInitial));result.initialSnapshotSHA256=sha(JSON.stringify(result.before));result.currentSnapshotSHA256=sha(JSON.stringify(result.current));
      await writeFile(`${out}/${item.id}-${source.id}-initial.json`,JSON.stringify(result.before,null,2));
      await writeFile(`${out}/${item.id}-${source.id}-captured.json`,JSON.stringify(result.current,null,2));
      delete result.before;delete result.current;
      pair.captures.push({source:source.id,commit:source.commit,original,errors,...result});
      await context.close();
    }
    assert.equal(pair.captures[0].commonInitialSHA256,pair.captures[1].commonInitialSHA256);
    const imgs=await Promise.all(pair.captures.map(async capture=>`data:image/png;base64,${(await readFile(`${out}/${capture.original}`)).toString('base64')}`));
    const html=`<!doctype html><html lang="de"><head><meta charset="utf-8"><style>*{box-sizing:border-box}body{margin:0;width:828px;background:#10201e;color:#eee5d1;font-family:Arial,sans-serif}main{padding:18px 16px}h1{font:600 22px/1.2 Arial;margin:0 0 8px}p{font:14px/1.45 Arial;margin:0 0 14px;color:#d8d1bc}.pair{display:grid;grid-template-columns:390px 390px;gap:16px}.label{height:32px;font-size:16px;font-weight:bold;color:#f2d8a1}img{display:block;width:390px;height:900px;border:1px solid #7f6a48}footer{font:12px/1.5 Arial;color:#babcae;padding-top:12px}footer strong{color:#e5d7b8}</style></head><body><main><h1>${item.title}</h1><p>${item.caption}</p><div class="pair"><section><div class="label">Vorher · veröffentlichte Basis</div><img src="${imgs[0]}" alt="Echte alte Tavernenoberfläche"></section><section><div class="label">Nachher · Tavernen-Testbranch</div><img src="${imgs[1]}" alt="Echte neue Tavernenoberfläche"></section></div><footer><strong>UI-Vergleich:</strong> 390 × 900 px je Seite · Mara · Deutsch · gleicher Ausgangsstand · neutrale Ruhepose für das Standbild. Keine Clipbewertung.</footer></main></body></html>`;
    await writeFile(`${out}/${item.id}-pair.html`,html.replace(imgs[0],pair.captures[0].original).replace(imgs[1],pair.captures[1].original));
    const compose=await browser.newPage({viewport:{width:828,height:1120},deviceScaleFactor:1});await compose.setContent(html);await compose.locator('img').evaluateAll(images=>Promise.all(images.map(i=>i.decode())));
    await compose.screenshot({path:`${out}/${item.id}-pair.png`,fullPage:true});await compose.close();metadata.cases.push(pair);metadata.cases.sort((a,b)=>a.id.localeCompare(b.id));
    console.log(JSON.stringify({case:item.id,finished:true,hints:pair.captures.map(c=>c.hint.text),lines:pair.captures.map(c=>c.line.text)}));
    await writeFile(`${out}/metadata.json`,JSON.stringify(metadata,null,2));
  }
}finally{await browser.close();}
const files=(await import('node:fs/promises')).readdir;
for(const file of await files(out)){if(file.endsWith('.png')||file.endsWith('.json')||file.endsWith('.html')||file.endsWith('.mjs'))await copyFile(`${out}/${file}`,`${mirror}/${file}`);}
console.log(JSON.stringify({done:true,output:out,mirror}));
