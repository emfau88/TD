/** Read-only source inventory; no game modules, saves or runtime files are modified. */
import ts from 'typescript';
import {JSDOM} from 'jsdom';
import {readFileSync,readdirSync,writeFileSync} from 'node:fs';
import {join,relative} from 'node:path';
import {createHash} from 'node:crypto';
const root='experiments/idle-bastion',out='artifacts/idle-bastion/acceptance/progression-economy-2026-11-02';
const files=(dir:string):string[]=>readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?files(join(dir,e.name)):[join(dir,e.name)]);
const sources=files(join(root,'src')).filter(p=>p.endsWith('.ts'));
const pages=readdirSync(root).filter(p=>p.endsWith('.html')).map(p=>join(root,p));
const terms=/gold|farm|offline|wisp|lager|storehouse|warehouse|vorr[aä]t|income|reward|ertrag|belohn|abwesen|abwesend|stund|hour|collect|suppl|%|prozent|percent/iu;
const rows:{file:string,line:number,kind:string,text:string}[]=[],manifest:any[]=[];
for(const file of [...sources,...pages]){
  const source=readFileSync(file,'utf8'),name=relative(root,file).replaceAll('\\','/');
  manifest.push({file:name,sha256:createHash('sha256').update(source).digest('hex')});
  if(file.endsWith('.ts')){
    const ast=ts.createSourceFile(file,source,ts.ScriptTarget.Latest,true);
    const visit=(node:ts.Node)=>{
      if(ts.isStringLiteralLike(node)||ts.isTemplateExpression(node)){
        const text=ts.isTemplateExpression(node)?node.getText(ast):node.text;
        if(terms.test(text)&&(/\s/.test(text)||text.includes('%')))
          rows.push({file:name,line:ast.getLineAndCharacterOfPosition(node.getStart(ast)).line+1,kind:'typescript',text});
      }
      ts.forEachChild(node,visit);
    };visit(ast);
  }else{
    const dom=new JSDOM(source,{includeNodeLocations:true}),doc=dom.window.document;
    const walker=doc.createTreeWalker(doc.body,dom.window.NodeFilter.SHOW_TEXT);
    for(let n=walker.nextNode();n;n=walker.nextNode()){
      if(n.parentElement?.closest('script,style'))continue;
      const text=(n.textContent??'').trim();
      if(terms.test(text))rows.push({file:name,line:dom.nodeLocation(n)?.startLine??0,kind:'html-text',text});
    }
    for(const el of doc.querySelectorAll('[title],[aria-label],[alt]'))for(const key of ['title','aria-label','alt']){
      const text=el.getAttribute(key);if(text&&terms.test(text))rows.push({file:name,line:dom.nodeLocation(el)?.startLine??0,kind:key,text});
    }
    dom.window.close();
  }
}
const suspect=rows.filter(r=>/\b(?:60|65)\s*%|sixty|sechzig|fünfundsechzig/iu.test(r.text));
const summary={typescriptFiles:sources.length,htmlFiles:pages.length,economicTextOccurrences:rows.length,
  distinctEconomicText:new Set(rows.map(r=>r.text)).size,oldOfflinePercentageOccurrences:suspect,
  note:'Inventory covers every TS file under src and every top-level HTML page. It includes translations and lab/unreachable strings; visibility and correctness require manual classification.'};
writeFileSync(`${out}/copy-inventory.json`,JSON.stringify({summary,manifest,rows},null,2)+'\n');
writeFileSync(`${out}/copy-inventory.txt`,rows.map(r=>`${r.file}:${r.line} [${r.kind}] ${r.text}`).join('\n')+'\n');
console.log(JSON.stringify(summary,null,2));
