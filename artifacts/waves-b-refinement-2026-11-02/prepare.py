"""Small B follow-up: keep the measured baseline immutable and reuse its controller."""
from pathlib import Path
import hashlib, json, shutil, sys

ROOT = Path.cwd()
OLD = ROOT / 'artifacts/waves-26-50-study-2026-11-02'
OUT = ROOT / 'artifacts/waves-b-refinement-2026-11-02'
variant = sys.argv[1] if len(sys.argv)>1 else 'B2'
assert variant in ['B2','B3']
folder = OUT / variant
assert not list((folder / 'runs').glob('*.json')), 'Never overwrite measured runs'
shutil.copytree(OLD / 'B/engine', folder / 'engine', dirs_exist_ok=True)
shutil.copyfile(OLD / 'B/simulate.ts', folder / 'simulate.ts')
p = folder / 'engine/wave-recipes.ts'
s = p.read_text(encoding='utf-8')
needle = '  const result=Object.freeze({...old,enemies:Object.freeze(enemies),clearGold});'
assert s.count(needle) == 1
s = s.replace(needle, '''  // A small frost-resistant escort in four established groups. Preserve the
  // two introductory waves, healers, total count, clocks and full-clear gold.
  if ([31,34,35,38].includes(wave)) {
    const escort = enemies.map((id,i)=>id===light?i:-1).filter(i=>i>=0);
    for (const i of [escort[1], escort[Math.floor(escort.length/2)]]) {
      if (i===undefined) continue;
      const cost=ENEMIES.Voidbutterfly.gold-ENEMIES[enemies[i]].gold;
      if(clearGold-cost<20)continue;
      enemies[i]='Voidbutterfly';clearGold-=cost;
    }
  }
''' + needle)
if variant == 'B3':
    s = s.replace('[31,34,35,38].includes(wave)', '[35,38].includes(wave)')
p.write_text(s, encoding='utf-8')
manifest = {str(p.relative_to(folder)).replace('\\','/'):hashlib.sha256(p.read_bytes()).hexdigest()
            for p in folder.rglob('*.ts')}
(OUT/('frozen.json' if variant=='B2' else 'B3-frozen.json')).write_text(json.dumps(manifest,indent=2)+'\n',encoding='utf-8')
print(f'Prepared {variant}: B curve + two known Voidbutterflies; unchanged controller.')
