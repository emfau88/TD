"""Copy approved masters and verify a recoverable archive. Never removes old assets."""
import argparse
import hashlib
import json
from pathlib import Path
import shutil
import subprocess
import tempfile

ROOT = Path(__file__).resolve().parents[3]
GAME = ROOT / 'experiments/idle-bastion'
ARCHIVE = ROOT / 'archive/tavern-animations/pre-comfy-2026-11-06'
DEST = GAME / 'assets/tavern-video'

def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()

def archive():
    sources = list((GAME / 'assets/tavern-rig').rglob('*'))
    sources += [GAME / p for p in [
        'src/tavern-rig-preview.ts', 'src/tavern-rig-source-preview.ts',
        'src/tavern-atlas-cache.ts', 'src/tavern-presentation.ts',
        'src/tavern-content.ts', 'src/tavern-rig.css', 'src/tavern-ui.css',
        'src/tavern-ui.ts', 'src/tavern-rig-check.ts', 'src/main.ts',
        'scripts/pack-tavern-rig.py', 'tavern-rig-check.html',
    ]]
    records = []
    for source in sorted(p for p in sources if p.is_file()):
        relative = source.relative_to(ROOT)
        target = ARCHIVE / 'files' / relative
        target.parent.mkdir(parents=True, exist_ok=True)
        if target.exists() and digest(target) != digest(source):
            raise RuntimeError(f'Archive would change: {relative}')
        if not target.exists(): shutil.copy2(source, target)
        records.append({'path': relative.as_posix(), 'bytes': source.stat().st_size, 'sha256': digest(source)})
    data = {'source_commit': subprocess.check_output(['git', 'rev-parse', 'HEAD'], cwd=ROOT, text=True).strip(), 'files': records}
    (ARCHIVE / 'inventory.json').write_text(json.dumps(data, indent=2)+'\n', encoding='utf-8')
    return verify_archive()

def verify_archive():
    data = json.loads((ARCHIVE / 'inventory.json').read_text(encoding='utf-8'))
    # Prove recovery into a separate disposable directory, never over a live file.
    restore_root = ROOT / 'artifacts/idle-bastion/tavern-implementation-2026-11-07/restore-checks'
    restore_root.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory(prefix='tavern-restore-', dir=restore_root) as tmp:
        assert Path(tmp).resolve().is_relative_to(restore_root.resolve())
        for record in data['files']:
            source = ARCHIVE / 'files' / record['path']
            assert digest(source) == record['sha256'], record['path']
            restored = Path(tmp) / record['path']
            restored.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(source, restored)
            assert digest(restored) == record['sha256'], record['path']
    return {'files': len(data['files']), 'bytes': sum(r['bytes'] for r in data['files']), 'restored_and_verified': True}

def videos(plan_path):
    plan = json.loads(plan_path.read_text(encoding='utf-8'))
    clips, provenance = {}, []
    for item in plan['clips']:
        assert item['user_approved']
        source = Path(item['video'])
        assert digest(source) == item['sha256'], item['code']
        target = DEST / item['character'] / (item['role'] + '.mp4')
        target.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(source, target)
        assert digest(target) == item['sha256']
        clips.setdefault(item['character'], {})[item['role']] = {
            'file': target.relative_to(DEST).as_posix(), 'code': item['code'],
            'fps': 24, 'frames': round(item['new_seconds'] * 24),
            'duration': item['new_seconds'], 'sha256': item['sha256'],
        }
        provenance.append({k: item[k] for k in ['character', 'code', 'role', 'selected_revision', 'sha256', 'new_bytes', 'new_seconds']})
        if item['role'] == 'idle':
            subprocess.run(['ffmpeg', '-hide_banner', '-loglevel', 'error', '-y', '-i', str(target), '-frames:v', '1', '-c:v', 'libwebp', '-lossless', '1', str(target.with_suffix('.webp'))], check=True)
    manifest = {'width': 480, 'height': 704, 'crop': [0, 2, 480, 700], 'audio': False, 'heroes': clips}
    (DEST / 'manifest.json').write_text(json.dumps(manifest, indent=2)+'\n', encoding='utf-8')
    (DEST / 'provenance.json').write_text(json.dumps({'source_commit': plan['source_commit'], 'approved_clips': provenance}, indent=2)+'\n', encoding='utf-8')
    return {'clips': len(provenance), 'bytes': sum(r['new_bytes'] for r in provenance)}

if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--plan', type=Path)
    parser.add_argument('--verify-archive', action='store_true')
    args = parser.parse_args()
    if args.verify_archive:
        print(json.dumps(verify_archive()))
    elif args.plan:
        print(json.dumps({'archive': archive(), 'videos': videos(args.plan)}))
    else:
        parser.error('Use --plan PATH or --verify-archive')
