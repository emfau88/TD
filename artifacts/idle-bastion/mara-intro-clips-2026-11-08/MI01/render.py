"""MI01 only. Prepare by default, --render submits one silent local portrait clip."""
import argparse
import hashlib
import importlib.util
import json
from pathlib import Path
import shutil
import subprocess
import uuid

HERE = Path(__file__).resolve().parent
REPO = HERE.parents[3]
SOURCE = REPO / 'artifacts/idle-bastion/q4-mara-portraits/welcome-v2-source.png'
RUNTIME = REPO / 'experiments/idle-bastion/assets/intro/mara/welcome.webp'
TEMPLATE = Path('C:/Users/madde/Documents/TowerDefense/artifacts/idle-bastion/tavern-comfy-series-2026-11-06/mara/M01/v2')
ENGINE = Path('C:/Users/madde/Documents/Codex/2026-11-03/v/work/bomm_h3_480/render.py')
WIDTH, HEIGHT, FRAMES, FPS, SEED = 480, 576, 73, 24, 2611081001
IMAGE = 'Mara_MI01_Begruessung_Referenz.png'
PROMPT = (
    'A calm three-second animated 2D illustrated fantasy game dialogue portrait. '
    'The adult woman Mara from <Picture 1> warmly greets the player with ONE small wave of her OWN left hand, '
    'on the RIGHT side of the image. This is a close bust portrait, with the original camera angle and framing fixed. '
    'Preserve her exact familiar face, bright green eyes, warm orange-red hairstyle, large braid on the viewer-left, '
    'loose red hair on the viewer-right, teal neck scarf, gold diamond pendant, gold and teal earring, '
    'burgundy bodice, white neckline trim, shoulder straps and original drawn body proportions. '
    'Preserve the clean outlines, warm cel shading, existing colors and illustrated game style. '
    'Begin in the exact reference pose, her hands below the bottom of the portrait. '
    'Her own left forearm rises naturally from her own left shoulder at the lower-right edge of the portrait. '
    'Her own left hand comes up beside her cheek, palm facing the viewer, never covering her face or eyes. '
    'She wears her simple brown fingerless glove, matching her adventurer outfit. '
    'Her four fingers stay naturally together and steady, thumb relaxed, five anatomically correct digits. '
    'The hand makes one very small relaxed side-to-side greeting from the wrist, then smoothly lowers out of view '
    'along the same path to the original resting position. No independent finger movements. '
    'Her closed-mouth smile warms only slightly. One soft natural blink, eyes fully open again at the end. '
    'Her head remains at its original height and angle, neck length and scarf spacing unchanged. '
    'Her shoulders, chest and torso stay quiet; no body bouncing, no pronounced breathing, no head bobbing. '
    'Her hair, braid and scarf remain still. The gesture is smooth, small and friendly, without speaking. '
    'Complete the wave and lower the hand before the final half second, then hold the original calm reference pose '
    'with both eyes open and the same gentle smile. '
    'Only Mara and the flat dark teal background are visible. The background remains uniformly still and featureless. '
    'No other person, no detached or external hands, no additional limbs, no object, no text, no scenery. '
    'No zoom, no camera movement, no change of clothing, no photorealism, no music, no sound, no lip sync.'
)

def read(path):
    return json.loads(path.read_text(encoding='utf-8'))

def store(name, value):
    (HERE / name).write_text(json.dumps(value, ensure_ascii=False, indent=2), encoding='utf-8')

def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()

def prepare():
    if (HERE / 'job.json').exists():
        raise SystemExit('MI01 already submitted; inspect this render before any further generation.')
    folder = HERE / 'input'
    folder.mkdir(exist_ok=True)
    # Technical render preparation only: proportional resize and a flat UI-colour matte.
    # The source artwork and runtime image stay untouched. No character repaint.
    subprocess.run([
        'ffmpeg', '-hide_banner', '-loglevel', 'error', '-y', '-i', str(SOURCE),
        '-filter_complex', 'color=c=0x111c20:s=480x576:r=24[bg];[0:v]scale=480:-1:flags=lanczos[fg];[bg][fg]overlay=(W-w)/2:(H-h)/2:shortest=1,format=rgb24',
        '-frames:v', '1', str(folder / IMAGE)
    ], check=True)
    graph = read(TEMPLATE / 'api.json')
    workflow = read(TEMPLATE / 'Mara_M01_ComfyUI_Workflow.json')
    nodes = {str(node['id']): node for node in workflow['nodes']}
    graph['5']['inputs']['image'] = IMAGE
    nodes['5']['widgets_values'][0] = IMAGE
    graph['6']['inputs'].update(width=WIDTH, height=HEIGHT)
    nodes['6']['widgets_values'][1:3] = [WIDTH, HEIGHT]
    graph['7']['inputs'].update(prompt=PROMPT, width=WIDTH, height=HEIGHT, length=FRAMES)
    nodes['7']['widgets_values'] = [PROMPT, WIDTH, HEIGHT, FRAMES]
    graph['10']['inputs']['noise_seed'] = SEED
    nodes['10']['widgets_values'][0] = SEED
    graph['15']['inputs']['length'] = FRAMES
    nodes['15']['widgets_values'] = [0, FRAMES]
    prefix = 'Mara_MI01_Begruessung_H3_480x576_24fps'
    graph['17']['inputs']['filename_prefix'] = prefix
    nodes['17']['widgets_values'] = [prefix, 'mp4', 'h264']
    titles = {'5':'MI01 · vorhandenes Begrüßungsporträt', '6':'Porträt 480 × 576 · proportional vorbereitet',
              '7':'MI01 · kleines eigenes Winken und ruhige Rückkehr', '10':'MI01 · fester Seed',
              '15':'73 native Frames · 3,04 Sekunden', '17':'MI01 · stumme separate Videoprobe'}
    for key, title in titles.items():
        graph[key]['_meta']['title'] = nodes[key]['title'] = title
    nodes['18']['widgets_values'] = ['MI01, 08.11.2026. Nur Begrüßungsclip autorisiert. Eigenes kleines Winken; ruhiger Kopf/Hals; Hände am Ende wieder unten. Bestehendes Porträt als Start/Ende, kein Neudesign. 73 Frames / 24 fps. Stumm. Dunkle Dialogfarbe nur als Renderhintergrund; Original-Alpha erhalten. Kein Einbau, MI02/MI03 nicht starten.']
    workflow['id'] = str(uuid.uuid4())
    assert graph['7']['inputs']['first_frame'] == graph['7']['inputs']['last_frame'] == ['6', 0]
    assert graph['16']['inputs']['fps'] == FPS and 'audio' not in graph['16']['inputs']
    for key in ['1','2','3','4','8','9','11','12','13','14','16']:
        assert graph[key] == read(TEMPLATE / 'api.json')[key]
    for key, node in graph.items():
        assert nodes[key]['type'] == node['class_type']
    store('api.json', graph)
    store('Mara_MI01_ComfyUI_Workflow.json', workflow)
    (HERE / 'prompt.txt').write_text(PROMPT, encoding='utf-8')
    store('render-settings.json', dict(clip='MI01', date='2026-11-08', width=WIDTH, height=HEIGHT,
        frames=FRAMES, fps=FPS, seconds=FRAMES/FPS, seed=SEED, steps=20, audio=False,
        source=str(SOURCE), source_sha256=sha(SOURCE), runtime_reference=str(RUNTIME),
        runtime_sha256=sha(RUNTIME), input_sha256=sha(folder / IMAGE), first_and_last_frame=IMAGE,
        preparation='Proportional resize of original high-resolution portrait; flat #111c20 preview matte; no artwork changes.',
        engine=str(ENGINE), engine_sha256=sha(ENGINE), quality_basis='Approved M01 v2 model/sampler/decoder',
        authorized='User asks to create only first portrait clip, without sound.', game_integration=False))
    print('MI01 prepared: 480x576, 73/24 seconds, no audio, identical first/last reference.', flush=True)
    return graph, workflow

if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--render', action='store_true')
    args = parser.parse_args()
    if args.render:
        spec = importlib.util.spec_from_file_location('proven_local_h3_engine', ENGINE)
        module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(module)
        module.run(prepare_job=prepare, job_dir=HERE, input_dir=HERE / 'input')
    else:
        prepare()
