"""Prepare isolated engine copies. Never write to the production source tree."""
from pathlib import Path
import hashlib,json,shutil,subprocess
ROOT=Path.cwd()
OUT=ROOT/'artifacts/waves-26-50-study-2026-11-02'
SRC=ROOT/'experiments/idle-bastion/src'
BASE='d4120482796fa1bc20d653b148ffc3873a610036'
assert subprocess.run(['git','merge-base','--is-ancestor',BASE,'HEAD'],check=False).returncode==0
assert not subprocess.check_output(['git','diff','--name-only',BASE,'--','experiments/idle-bastion/src'],text=True).strip()
manifest={str(p.relative_to(SRC)).replace('\\','/'):hashlib.sha256(p.read_bytes()).hexdigest() for p in SRC.rglob('*.ts')}
source=(ROOT/'artifacts/idle-bastion/acceptance/progression-economy-2026-11-02/simulate.ts').read_text(encoding='utf-8')
source=source.replace("'../../../../experiments/idle-bastion/src/","'./engine/")
source=source.replace('if([20,30].includes(b.wave)', 'if([20,25,30].includes(b.wave)')
source=source.replace("losses++;if(!firstLoss)","if(b.wave>=26&&!snapshots.firstPost25Loss)snapshots.firstPost25Loss=b.snapshot();\n          losses++;if(!firstLoss)")
source=source.replace('const elapsed=b.elapsed-t0;',"if(tick===71999)snapshots.at30=b.snapshot();\n    const elapsed=b.elapsed-t0;")
for variant in ['control','A','B']:
    folder=OUT/variant
    assert not list((folder/'runs').glob('*.json')),f'Keep frozen measured variant: {folder}'
    shutil.copytree(SRC,folder/'engine',dirs_exist_ok=True)
    (folder/'simulate.ts').write_text(source,encoding='utf-8')
    if variant=='control':continue
    p=folder/'engine/balance.ts';s=p.read_text(encoding='utf-8')
    s=s.replace('return (recipe >= 12 ?', 'return studyHpFactor(wave, recipe, boss) * (recipe >= 12 ?',1)
    if variant=='A':
        s+='\nfunction studyHpFactor(wave:number,recipe:number,boss:boolean):number {\n  return recipe>=17 && wave>25 && !boss ? 1 + .06 * Math.min(wave-25,10) : 1;\n}\n'
    else:
        s="import { waveRecipe, studyOriginalRecipe, enemyPressure } from './wave-recipes';\n"+s
        s+='''
let studyAnchor:number|undefined;
function studyHpFactor(wave:number,recipe:number,boss:boolean):number {
  if(recipe<17||wave<=25||boss)return 1;
  studyAnchor ??= Math.exp([26,27,28,29,30].reduce((sum,w)=>sum+Math.log(studyOriginalRecipe(w,17).enemies.reduce((s,id)=>s+enemyPressure(id),0)),0)/5);
  const weight=waveRecipe(wave,recipe).enemies.reduce((sum,id)=>sum+enemyPressure(id),0);
  return studyAnchor/weight*(1+.06*Math.min(wave-25,10));
}
'''
    p.write_text(s,encoding='utf-8')
    if variant!='B':continue
    p=folder/'engine/wave-recipes.ts';s=p.read_text(encoding='utf-8')
    s="import { enemyPressure } from './wave-recipes-v11';\n"+s
    s=s.replace('export function waveRecipe(wave:', 'export function studyOriginalRecipe(wave:',1)
    s=s.replace('export function clearReward(wave: number, version: number): number {','export function clearReward(wave: number, version: number): number {\n  if(version>=17 && wave>=26 && wave<=50)return waveRecipe(wave,version).clearGold;',1)
    s+='''
const studyRecipes = new Map<number,WaveRecipe>();
export function waveRecipe(wave:number,version=16):WaveRecipe {
  const old=studyOriginalRecipe(wave,version);
  if(version<17||wave<=25||wave>50||old.elite)return old;
  const cached=studyRecipes.get(wave);if(cached)return cached;
  const special=introducedEnemy(wave,17)?.id??introducedEnemy(wave-1,17)?.id;
  const types=[...new Set(old.enemies)].filter(id=>!isHealer(ENEMIES[id])&&id!==special);
  const counts=(id:EnemyId)=>old.enemies.filter(x=>x===id).length;
  const light=types.filter(id=>ENEMIES[id].armor===0).sort((a,b)=>counts(b)-counts(a))[0];
  const armored=types.filter(id=>ENEMIES[id].armor>0).sort((a,b)=>enemyPressure(b)-enemyPressure(a))[0];
  const fast=[...types].sort((a,b)=>ENEMIES[b].speed-ENEMIES[a].speed)[0];
  let from:EnemyId|undefined,to:EnemyId|undefined,n=0;
  if(old.family==='armor'||old.family==='support'){from=light;to=armored;n=2;}
  else{from=[...types].sort((a,b)=>counts(b)-counts(a))[0];to=fast;n=old.family==='swarm'?4:3;}
  const enemies=[...old.enemies];let clearGold=old.clearGold;
  if(from&&to&&from!==to){
    const available=enemies.map((id,i)=>id===from?i:-1).filter(i=>i>=0);
    for(let k=0;k<Math.min(n,available.length);k++){
      const index=available[Math.floor(k*available.length/Math.min(n,available.length))];
      const cost=ENEMIES[to].gold-ENEMIES[from].gold;
      if(clearGold-cost<20)break;
      enemies[index]=to;clearGold-=cost;
    }
  }
  const result=Object.freeze({...old,enemies:Object.freeze(enemies),clearGold});studyRecipes.set(wave,result);return result;
}
'''
    p.write_text(s,encoding='utf-8')
plan=OUT/'PLAN_PRE_RUN.md'
frozen={'baseCommit':BASE,'sourceManifest':manifest,'planSha256':hashlib.sha256(plan.read_bytes()).hexdigest(),'variants':{}}
for variant in ['control','A','B']:
    folder=OUT/variant
    current={str(p.relative_to(folder/'engine')).replace('\\','/'):hashlib.sha256(p.read_bytes()).hexdigest() for p in (folder/'engine').rglob('*.ts')}
    frozen['variants'][variant]={'changedFiles':[p for p,h in current.items() if manifest[p]!=h], 'files':current,'controllerSha256':hashlib.sha256((folder/'simulate.ts').read_bytes()).hexdigest()}
assert frozen['variants']['control']['changedFiles']==[]
assert frozen['variants']['A']['changedFiles']==['balance.ts']
assert sorted(frozen['variants']['B']['changedFiles'])==['balance.ts','wave-recipes.ts']
(OUT/'frozen.json').write_text(json.dumps(frozen,indent=2)+'\n',encoding='utf-8')
print(json.dumps({v:frozen['variants'][v]['changedFiles'] for v in frozen['variants']}))
