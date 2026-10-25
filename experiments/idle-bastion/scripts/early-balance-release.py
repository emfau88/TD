"""Reproduce isolated release hypotheses against the audited main commit.
No production files or player data are changed. Requires git, Python 3.12+, Node and npm ci.
Usage: python experiments/idle-bastion/scripts/early-balance-release.py baseline w10 boss15
"""
import io, json, os, shutil, subprocess, sys, tarfile
from pathlib import Path

BASE = 'c9a722c2d644a28885369a298a88fce410229510'
ROOT = Path(__file__).resolve().parents[3]
WORK = ROOT / 'qa/early-balance-release'
OUT = ROOT / 'artifacts/idle-bastion/acceptance/early-balance-release'
VARIANTS = {
    'baseline': (), 'w10': ('w10',), 'boss15': ('boss15',),
    'economy': ('economy',), 'w20': ('w20',),
    'w10-boss15': ('w10','boss15'),
    'w10-w20': ('w10','w20'),
    'w10-economy-w20': ('w10','economy','w20'),
}
def replace(path, old, new):
    s=path.read_text(encoding='utf-8')
    assert s.count(old)==1,(path,old)
    path.write_text(s.replace(old,new),encoding='utf-8')

WORK.mkdir(parents=True,exist_ok=True)
archive=subprocess.check_output(['git','archive',BASE,'experiments/idle-bastion/src'],cwd=ROOT)
with tarfile.open(fileobj=io.BytesIO(archive)) as tar:
    tar.extractall(WORK/'reference',filter='data')
for name in sys.argv[1:] or ['baseline','w10','boss15']:
    options=VARIANTS[name]
    src=WORK/name/'src'
    shutil.copytree(WORK/'reference/experiments/idle-bastion/src',src,dirs_exist_ok=True)
    wave_overrides=''
    if 'w10' in options:
        wave_overrides += """
  if (wave === 10) {
    const enemies = [...waveRecipeV13(wave).enemies, ...Array<EnemyId>(7).fill('FlyingLocust')];
    const gaps = enemies.map((_,i)=>[5,11,16].includes(i)?1.05:.30);
    return { ...waveRecipeV13(wave), enemies, gaps, clearGold:20 };
  }
"""
    if 'w20' in options:
        wave_overrides += """
  if (wave === 20) {
    const old = waveRecipeV13(wave), enemies = [...old.enemies];
    const leaves=enemies.map((id,i)=>id==='Leafbug'?i:-1).filter(i=>i>=0);
    for(const k of [0,5,10]) enemies[leaves[k]]='Clampbeetle';
    return {...old,enemies,clearGold:Math.max(20,old.clearGold-30)};
  }
"""
    if wave_overrides:
        replace(src/'wave-recipes.ts','export function waveRecipe(wave: number, version=14): WaveRecipe {',
                'export function waveRecipe(wave: number, version=14): WaveRecipe {\n'+wave_overrides)
        waves=' || '.join('wave === '+n for n in ['10','20'] if 'w'+n in options)
        replace(src/'wave-recipes.ts','export function spawnGap(wave: number, spawned: number, version: number): number {',
                'export function spawnGap(wave: number, spawned: number, version: number): number {\n  if ('+waves+') return waveRecipe(wave,version).gaps[spawned-1]??1;')
        replace(src/'wave-recipes.ts','export function clearReward(wave: number, version: number): number {',
                'export function clearReward(wave: number, version: number): number {\n  if ('+waves+') return waveRecipe(wave,version).clearGold;')
    if 'economy' in options:
        replace(src/'balance.ts','const factor = recipe < 10',
                'const factor = wave >= 16 && wave <= 19 ? [1.6,1.8,2,2.2][wave-16] : recipe < 10')
    if 'boss15' in options:
        replace(src/'battle.ts','private move(enemy: Enemy, dt: number): void {','private move(enemy: Enemy, dt: number, speedFactor = 1): void {')
        replace(src/'battle.ts','let travel = enemy.speed * (dt - slowed * (1 - enemy.def.slowFactor));',
                'let travel = enemy.speed * speedFactor * (dt - slowed * (1 - enemy.def.slowFactor));')
        replace(src/'battle.ts',"""      if (enemy.healRemaining > 0 || enemy.def.id === 'Rosenspiegel' && ['windup', 'channel'].includes(this.bossCharm.phase)) enemy.slowRemaining = Math.max(0, enemy.slowRemaining - dt);
      else this.move(enemy, dt);""","""      if (enemy.def.id === 'Rosenspiegel' && this.wave === 15 && this.bossCharm.phase === 'channel') this.move(enemy, dt, .35);
      else if (enemy.healRemaining > 0 || enemy.def.id === 'Rosenspiegel' && ['windup', 'channel'].includes(this.bossCharm.phase)) enemy.slowRemaining = Math.max(0, enemy.slowRemaining - dt);
      else this.move(enemy, dt);""")
    env={**os.environ,'SPIRE_BALANCE_SOURCE':str(src),'SPIRE_BALANCE_CAPTURE':'1' if name=='baseline' else '0'}
    print('VARIANT '+name,flush=True)
    subprocess.run(['node','node_modules/tsx/dist/cli.mjs','experiments/idle-bastion/tests/helpers/measure-early-balance.ts',str(OUT/name)],cwd=ROOT,env=env,check=True)
(OUT/'experiment.json').write_text(json.dumps({'base':BASE,'stepSeconds':.025,'variants':VARIANTS,'selected':'w10-w20','mainProfiles':['A','B','C','minimal','B-no-mara','B-freeze15','C-20s','B-poor-placement'],'extraControl':'A-direct-retry: baseline and selected only'},indent=2)+'\n',encoding='utf-8')
