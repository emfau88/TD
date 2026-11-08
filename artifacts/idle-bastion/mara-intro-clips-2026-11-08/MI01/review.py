"""Decode the one completed MI01 render, preserve it and prepare visual checks."""
from pathlib import Path
import hashlib
import json
import shutil
import subprocess

HERE = Path(__file__).resolve().parent

def ff(*args):
    subprocess.run(['ffmpeg', '-v', 'error', '-nostdin', '-y', '-threads', '2', '-filter_threads', '2', *map(str, args)], check=True)

def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()

result = json.loads((HERE/'result.json').read_text(encoding='utf-8'))
settings = json.loads((HERE/'render-settings.json').read_text(encoding='utf-8'))
source = Path(result['file'])
video = HERE/'Mara_MI01_Begruessung_ComfyUI.mp4'
if video.exists():
    assert sha(video) == sha(source)
else:
    shutil.copy2(source, video)
probe = json.loads(subprocess.check_output(['ffprobe', '-v', 'error', '-count_frames', '-show_entries',
    'stream=codec_type,codec_name,width,height,r_frame_rate,nb_read_frames:format=duration,size', '-of', 'json', str(video)], text=True))
assert len(probe['streams']) == 1
v = probe['streams'][0]
assert v['codec_type'] == 'video' and v['codec_name'] == 'h264'
assert (v['width'], v['height'], v['r_frame_rate'], int(v['nb_read_frames'])) == (480,576,'24/1',73)
assert abs(float(probe['format']['duration']) - 73/24) < 1/24
ff('-i', video, '-f', 'null', '-')
indices = [round(i*72/11) for i in range(12)]
select = '+'.join(f'eq(n,{i})' for i in indices)
ff('-i', video, '-vf', f"select='{select}',scale=240:288,tile=4x3", '-frames:v', 1, '-update', 1, HERE/'review-overview.jpg')
ff('-i', video, '-vf', f"select='{select}',crop=260:406:220:170,tile=4x3", '-frames:v', 1, '-update', 1, HERE/'review-hand.jpg')
for page in range(3):
    ff('-i', video, '-vf', f"select='between(n,{page*32},{min(72,page*32+31)})',scale=160:192,tile=8x4", '-frames:v', 1, '-update', 1, HERE/f'review-all-{page+1}.jpg')
for index, name in [(0,'start'),(30,'gesture'),(72,'end')]:
    ff('-i', video, '-vf', f"select='eq(n,{index})'", '-frames:v', 1, '-update', 1, HERE/f'frame-{name}.png')
verification = dict(video=str(video), native_copy_unchanged=sha(source)==sha(video), video_sha256=sha(video),
    decode_passed=True, probe=probe, render_seconds=result['seconds'], source_unchanged=sha(Path(settings['source']))==settings['source_sha256'],
    game_portrait_unchanged=sha(Path(settings['runtime_reference']))==settings['runtime_sha256'],
    visual_review='Pending contact-sheet inspection', user_approved=False, game_integration=False)
(HERE/'verification.json').write_text(json.dumps(verification, ensure_ascii=False, indent=2), encoding='utf-8')
print(json.dumps(dict(seconds=73/24, bytes=video.stat().st_size, render_seconds=result['seconds'], video=str(video))))
