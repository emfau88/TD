/** Small, read-only companion to the text inventory. */
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,readdirSync} from 'node:fs';
import {join} from 'node:path';
import ts from 'typescript';
import {JSDOM} from 'jsdom';
import {english} from '../../../../experiments/idle-bastion/src/locales/en';
import {setLanguage,t} from '../../../../experiments/idle-bastion/src/i18n';
import {bindStaticTranslations} from '../../../../experiments/idle-bastion/src/i18n-dom';
import {OFFLINE,WAREHOUSE_OFFLINE,LEGACY_OFFLINE,LEGACY_WAREHOUSE_OFFLINE} from '../../../../experiments/idle-bastion/src/offline';
import {battleReward,battleRewardUnits} from '../../../../experiments/idle-bastion/src/balance';
import {BASE,FROST,CANNON,SNIPER,STORMLIGHT,SETTLEMENT} from '../../../../experiments/idle-bastion/src/battle';
const root='experiments/idle-bastion',out=process.argv[2]??'artifacts/idle-bastion/acceptance/progression-economy-2026-11-02';
const files=(dir:string):string[]=>readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?files(join(dir,e.name)):[join(dir,e.name)]);
const terms=/gold|farm|offline|wisp|lager|storehouse|warehouse|vorr[aä]t|income|reward|ertrag|belohn|abwesen|abwesend|stund|hour|collect|suppl|%|prozent|percent/iu;
const messages=new Set<string>();
for(const file of files(root+'/src').filter(p=>p.endsWith('.ts')&&!p.includes('locales'))){
  const source=readFileSync(file,'utf8'),ast=ts.createSourceFile(file,source,ts.ScriptTarget.Latest,true);
  const visit=(node:ts.Node)=>{
    if(ts.isCallExpression(node)&&node.expression.getText(ast)==='t'&&node.arguments[0]&&ts.isStringLiteralLike(node.arguments[0])&&terms.test(node.arguments[0].text))messages.add(node.arguments[0].text);
    if(ts.isVariableDeclaration(node)&&node.name.getText(ast)==='HINTS'&&node.initializer){
      const collect=(n:ts.Node)=>{if(ts.isStringLiteralLike(n)&&terms.test(n.text))messages.add(n.text);ts.forEachChild(n,collect);};collect(node.initializer);
    }
    ts.forEachChild(node,visit);
  };visit(ast);
}
const dom=new JSDOM(readFileSync(root+'/index.html','utf8'));
const walker=dom.window.document.createTreeWalker(dom.window.document.body,4);
for(let n=walker.nextNode();n;n=walker.nextNode()){
  if(n.parentElement?.closest('script,style'))continue;
  const text=n.textContent?.trim();if(text&&terms.test(text))messages.add(text);
}
const missing=[...messages].filter(s=>!Object.hasOwn(english,s));
assert.deepEqual(missing,[],'Every economic literal in direct t() calls, HINTS and index HTML has English copy');
const rendered:any[]=[];
setLanguage('de');const unbind=bindStaticTranslations(dom.window.document);
for(const lang of ['de','en'] as const){setLanguage(lang);rendered.push({lang,wisp:dom.window.document.getElementById('wisp-panel')!.textContent,
  boss:dom.window.document.querySelector('.boss-record')!.textContent,
  towerCount:dom.window.document.querySelector('.enemy-record')!.textContent});}
unbind();dom.window.close();
assert.equal(OFFLINE.efficiencyPermille,240);assert.equal(OFFLINE.limitMs,7200000);
assert.equal(WAREHOUSE_OFFLINE.efficiencyPermille,260);assert.equal(WAREHOUSE_OFFLINE.limitMs,28800000);
assert.equal(LEGACY_OFFLINE.efficiencyPermille,600);assert.equal(LEGACY_WAREHOUSE_OFFLINE.efficiencyPermille,650);
const sample={full:battleRewardUnits(100,1,17,true,false)/1000,repeat:battleRewardUnits(100,1,17,true,true)/1000};
assert.deepEqual(sample,{full:110,repeat:11});
const goldCurve=[16,20,21,25,33,40].map(wave=>({wave,base100New:battleReward(100,wave,17),base100Repeat:battleRewardUnits(100,wave,17,false,true)/1000}));
const report={translatedEconomicMessages:messages.size,missing,policies:{OFFLINE,WAREHOUSE_OFFLINE,LEGACY_OFFLINE,LEGACY_WAREHOUSE_OFFLINE},
  sample,goldCurve,prices:{towers:[BASE.tower.cost,FROST.cost,CANNON.cost,SNIPER.cost,STORMLIGHT.cost],firstUpgrade:BASE.firstUpgradeCost,...SETTLEMENT},rendered};
writeFileSync(out+'/copy-values.json',JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({translatedEconomicMessages:messages.size,missing,sample,goldCurve},null,2));
