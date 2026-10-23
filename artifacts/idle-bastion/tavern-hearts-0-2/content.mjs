// Copy only authored stage/moment literals. Never import the game or its save code.
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
const dir=path.dirname(fileURLToPath(import.meta.url));
const source=path.resolve(dir,'../../../experiments/idle-bastion/src');
const result={};
for(const hero of ['mara','ilyra']){
  const text=fs.readFileSync(path.join(source,`tavern-${hero}-content.ts`),'utf8');
  const stages=text.match(/const stages = (\[[\s\S]*?\]) as const;/)[1];
  const moments=text.match(/export const \w+_MOMENTS:[^=]+ = (\[[\s\S]*?\n\]);/)[1];
  result[hero]={stages:vm.runInNewContext(`(${stages})`,{},{timeout:1000}).slice(0,3),moments:vm.runInNewContext(`(${moments})`,{},{timeout:1000}).slice(0,2)};
}
// The prepared tavern Ilyra has no spear; keep that scene's text consistent.
result.ilyra.stages[1].greeting='Heute darf die Wache warten. Ich habe mir diesen Platz ausgesucht.';
result.ilyra.moments[0].beats[0].line='Eine alte Gewohnheit: Ich behalte die Tür immer im Blick. Hier kann ich versuchen, die Wache einmal abzugeben.';
result.mara.joke='Gut, der war nicht schlecht. Erzähl ihn bloß nicht Wisp – sonst muss ich ihn morgen wieder hören.';
result.ilyra.joke='Damit habe ich nicht gerechnet. Du bringst mich noch dazu, meine ernste Miene ganz zu vergessen.';
fs.writeFileSync(path.join(dir,'content.json'),JSON.stringify(result,null,2)+'\n');
console.log('Copied three stages and two moments per character; no game imports.');
