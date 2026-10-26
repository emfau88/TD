"""Recreate the isolated editable project; never overwrite an existing project."""
from pathlib import Path
import hashlib
import json
import shutil

here = Path(__file__).resolve().parent
art = here.parents[1]
source = art / 'tavern-hearts-0-2/unity'
target = here / 'unity'
if target.exists():
    raise SystemExit('Refusing to overwrite the existing isolated Unity project.')
recorded = json.loads((here / 'source-hashes.json').read_text())
for name, expected in recorded.items():
    if hashlib.sha256((art / name).read_bytes()).hexdigest() != expected:
        raise SystemExit(f'Original source has changed: {name}')
for folder in ['Assets', 'Packages', 'ProjectSettings']:
    shutil.copytree(source / folder, target / folder)
shutil.copy2(here / 'BuildIlyraTouchElbow.cs', target / 'Assets/Editor/BuildIlyraTouchElbow.cs')
print('Prepared isolated Unity project:', target)
