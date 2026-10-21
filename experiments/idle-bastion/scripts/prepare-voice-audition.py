"""Split the two user-supplied CC0 recordings at pauses; do not choose game voices."""
import argparse, hashlib, json, pathlib, re, subprocess

p = argparse.ArgumentParser()
p.add_argument('--source', required=True)
p.add_argument('--ffmpeg', required=True)
args = p.parse_args()
out = pathlib.Path(__file__).resolve().parents[1] / 'assets' / 'voice-audition'
out.mkdir(parents=True, exist_ok=True)
manifest = []
for group, name, sound in [('A', '170767__esperar__hmms-various-1.wav', '170767'), ('B', '170766__esperar__hmms-various-2.wav', '170766')]:
    src = pathlib.Path(args.source) / 'succubus' / name
    probe = subprocess.run([str(pathlib.Path(args.ffmpeg).with_name('ffprobe.exe')), '-v', 'error', '-show_entries', 'format=duration', '-of', 'json', str(src)], capture_output=True, text=True, check=True)
    duration = float(json.loads(probe.stdout)['format']['duration'])
    scan = subprocess.run([args.ffmpeg, '-hide_banner', '-i', str(src), '-af', 'silencedetect=noise=-38dB:d=0.22', '-f', 'null', '-'], capture_output=True, text=True, check=True)
    intervals, start = [], 0.0
    for kind, stamp in re.findall(r'silence_(start|end): ([\d.]+)', scan.stderr):
        stamp = float(stamp)
        if kind == 'start' and stamp > start:
            intervals.append([start, stamp])
        elif kind == 'end':
            start = stamp
    if start < duration and not scan.stderr.rsplit('silence_', 1)[-1].startswith('start'):
        intervals.append([start, duration])
    # Ignore isolated clicks, but retain the two syllables of mm-hmm together.
    merged = []
    for begin, end in intervals:
        if end - begin < .14:
            continue
        if merged and begin - merged[-1][1] < .5:
            merged[-1][1] = end
        else:
            merged.append([begin, end])
    for index, (begin, end) in enumerate(merged, 1):
        begin, end = max(0, begin-.08), min(duration, end+.15)
        length = end-begin
        clip_id = f'{group}{index:02}'
        filename = f'{clip_id.lower()}.wav'
        subprocess.run([args.ffmpeg, '-y', '-v', 'error', '-ss', str(begin), '-i', str(src), '-t', str(length), '-af', f'afade=t=in:d=0.005,afade=t=out:st={length-.012}:d=0.012', '-c:a', 'pcm_s16le', str(out / filename)], check=True)
        manifest.append(dict(id=clip_id, file=filename, source=name, url=f'https://freesound.org/people/esperar/sounds/{sound}/', license='CC0', start=round(begin, 4), end=round(end, 4), duration=round(length, 3), sourceSha256=hashlib.sha256(src.read_bytes()).hexdigest()))
(out / 'manifest.json').write_text(json.dumps(manifest, indent=2)+'\n', encoding='utf-8')
print(json.dumps({'clips':len(manifest), 'A':sum(c['id'].startswith('A') for c in manifest), 'B':sum(c['id'].startswith('B') for c in manifest), 'bytes':sum((out/c['file']).stat().st_size for c in manifest)}))
