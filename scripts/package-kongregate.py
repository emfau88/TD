"""Package the standalone Vite build. Never overwrite an existing release folder."""
from pathlib import Path
import argparse, hashlib, json, shutil, subprocess, zipfile

root = Path(__file__).resolve().parents[1]
parser = argparse.ArgumentParser()
parser.add_argument('--output', required=True, type=Path)
args = parser.parse_args()
output = args.output.resolve()
build = root / 'experiments/idle-bastion/dist-kongregate'
entry = build / 'index.html'
if output.exists():
    raise SystemExit('Release folder already exists; choose a new output folder.')
if not entry.is_file() or 'id="boot-screen"' not in entry.read_text(encoding='utf8'):
    raise SystemExit('Build the current game with npm run build:kongregate first.')
files = sorted(p for p in build.rglob('*') if p.is_file())
if [p.name for p in files if p.suffix == '.html'] != ['index.html']:
    raise SystemExit('Unexpected HTML entry in standalone game build.')
if any(p.suffix in ('.map', '.ts') or p.name.startswith('.') for p in files):
    raise SystemExit('Unexpected development file in standalone build.')
notices = root / 'experiments/idle-bastion/docs/SOURCES_AND_LICENSES.txt'
game = output / '01-game'
separate = game / 'separate-upload'
separate.mkdir(parents=True)
(output / '02-media').mkdir()
(output / '03-texts').mkdir()

def archive(path, include_entry):
    with zipfile.ZipFile(path, 'w', zipfile.ZIP_DEFLATED, compresslevel=9) as z:
        for file in files:
            name = file.relative_to(build).as_posix()
            if name == 'index.html' and not include_entry:
                continue
            z.write(file, name)
        z.write(notices, 'LICENSES.txt')
    if path.stat().st_size >= 1_000_000_000:
        raise SystemExit('Archive exceeds Kongregate upload limit.')

archive(game / 'Towers-and-Tantrums.zip', True)
archive(separate / 'additional-files.zip', False)
shutil.copy2(entry, separate / 'index.html')
revision = subprocess.check_output(['git','rev-parse','HEAD'], cwd=root, text=True).strip()
manifest = {
    'sourceCommit': revision,
    'sourceWorkingTreeChanges': subprocess.check_output(['git','status','--porcelain'], cwd=root, text=True).splitlines(),
    'entry': 'index.html', 'base': './',
    'fileCountIncludingLicense': len(files) + 1,
    'uncompressedBytes': sum(p.stat().st_size for p in files) + notices.stat().st_size,
    'archives': [{'file': p.relative_to(output).as_posix(), 'bytes': p.stat().st_size, 'sha256': hashlib.sha256(p.read_bytes()).hexdigest()} for p in [game/'Towers-and-Tantrums.zip', separate/'additional-files.zip']],
    'files': [{'file':p.relative_to(build).as_posix(),'bytes':p.stat().st_size,'sha256':hashlib.sha256(p.read_bytes()).hexdigest()} for p in files]
}
(output / 'BUILD-MANIFEST.json').write_text(json.dumps(manifest, indent=2)+'\n', encoding='utf8')
print(json.dumps({'output':str(output),'fileCount':manifest['fileCountIncludingLicense'],'uncompressedBytes':manifest['uncompressedBytes'],'archives':manifest['archives']}))
