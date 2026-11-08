"""MI02 only: prepare by default; --render submits this one silent portrait clip."""
import argparse
import hashlib
import importlib.util
import json
from pathlib import Path
import subprocess
import uuid

HERE = Path(__file__).resolve().parent
REPO = HERE.parents[3]
TEMPLATE = HERE.parent / 'MI01'
SOURCE = REPO / 'artifacts/idle-bastion/q4-mara-portraits/focused-v2-source.png'
RUNTIME = REPO / 'experiments/idle-bastion/assets/intro/mara/focused.webp'
ENGINE = Path('C:/Users/madde/Documents/Codex/2026-11-03/v/work/bomm_h3_480/render.py')
WIDTH, HEIGHT, FRAMES, FPS, SEED = 480, 576, 56, 24, 2611081002
IMAGE = 'Mara_MI02_Erklaerung_Referenz.png'
PROMPT = (
    'A quiet two-second animated 2D illustrated fantasy game dialogue portrait. '
    'The adult woman Mara from <Picture 1> is calmly explaining the way to the core to the player. '
    'This is a fixed close bust portrait. Preserve her exact original camera angle, head size and framing. '
    'Preserve her familiar face, green eyes, warm orange-red hair, large braid on the viewer-left, loose red hair '
    'on the viewer-right, teal scarf, gold diamond pendant, gold and teal earring, burgundy bodice, white neckline '
    'trim, shoulder straps, original proportions, clean outlines and warm illustrated cel shading. '
    'Begin in the exact reference pose with the original attentive, reassuring closed-mouth smile. '
    'Her eyes briefly glance a little toward the viewer-left, as if indicating the route beside the portrait. '
    'Only her gaze moves sideways; the face remains comfortably facing the player, no large head turn. '
    'She returns her gaze to the player and gives ONE very small, slow acknowledging nod. '
    'The nod is a shallow rotation of only a few degrees at the head-neck joint, then a smooth return to the '
    'original angle; no downward sliding of the whole head and no chin sinking into the scarf. '
    'The natural neck length and space between jaw, scarf and collarbones stay consistent. '
    'Her shoulders, upper chest and torso remain level and still. No body sway, bouncing or pronounced breathing. '
    'The hair, braid, scarf and pendant remain quietly at rest without wind. '
    'Her mouth remains closed with the same small smile. She may blink gently once while returning her gaze. '
    'The movement is restrained, smooth and human, not theatrical. '
    'Both hands remain below the portrait and invisible throughout. Only this one woman is visible. '
    'Finish the small nod before the last quarter second and hold the exact original reference pose '
    'with eyes fully open, looking toward the player and the calm reassuring smile. '
    'The flat dark teal background stays uniformly still and featureless. '
    'No hands, no other person, no new limbs, no props, no text, no scenery. '
    'No zoom, camera motion, outfit change, photorealism, speaking, lip sync, music or sound.'
)

def read(path): return json.loads(path.read_text(encoding='utf-8'))
def sha(path): return hashlib.sha256(path.read_bytes()).hexdigest()
def store(name, value): (HERE/name).write_text(json.dumps(value, ensure_ascii=False, indent=2), encoding='utf-8')

def prepare():
    if (HERE/'job.json').exists():
        raise SystemExit('MI02 already submitted; inspect the existing result before further generation.')
    (HERE/'input').mkdir(exist_ok=True)
    subprocess.run(['ffmpeg','-hide_banner','-loglevel','error','-y','-i',str(SOURCE),
        '-filter_complex','color=c=0x111c20:s=480x576:r=24[bg];[0:v]scale=480:-1:flags=lanczos[fg];[bg][fg]overlay=(W-w)/2:(H-h)/2:shortest=1,format=rgb24',
        '-frames:v','1',str(HERE/'input'/IMAGE)], check=True)
    graph = read(TEMPLATE/'api.json')
    workflow = read(TEMPLATE/'Mara_MI01_ComfyUI_Workflow.json')
    nodes = {str(n['id']): n for n in workflow['nodes']}
    graph['5']['inputs']['image'] = nodes['5']['widgets_values'][0] = IMAGE
    graph['7']['inputs'].update(prompt=PROMPT, length=FRAMES)
    nodes['7']['widgets_values'] = [PROMPT, WIDTH, HEIGHT, FRAMES]
    graph['10']['inputs']['noise_seed'] = nodes['10']['widgets_values'][0] = SEED
    graph['15']['inputs']['length'] = FRAMES
    nodes['15']['widgets_values'] = [0, FRAMES]
    prefix = 'Mara_MI02_Erklaerung_H3_480x576_24fps'
    graph['17']['inputs']['filename_prefix'] = prefix
    nodes['17']['widgets_values'] = [prefix, 'mp4', 'h264']
    for key, title in {'5':'MI02 · vorhandenes konzentriertes Porträt', '7':'MI02 · kurzer Blick, dezentes Nicken',
            '10':'MI02 · fester Seed', '15':'56 native Frames · 2,33 Sekunden', '17':'MI02 · stumme separate Videoprobe'}.items():
        graph[key]['_meta']['title'] = nodes[key]['title'] = title
    nodes['18']['widgets_values'] = ['MI02, 08.11.2026. Nutzer hat MI01 freigegeben und den nächsten Clip beauftragt. Vorhandenes focused-v2-Porträt als Start/Ende. Kurzer Blick zur Seite, zurück und ein sehr kleines Nicken; stabile Halslänge, ruhiger Körper, Hände unsichtbar. 56 native Frames / 24 FPS = 2,33 Sekunden. Stumm. Kein Einbau, MI03 nicht starten.']
    workflow['id'] = str(uuid.uuid4())
    for key in ['1','2','3','4','6','8','9','11','12','13','14','16']:
        assert graph[key] == read(TEMPLATE/'api.json')[key]
    assert graph['7']['inputs']['first_frame'] == graph['7']['inputs']['last_frame'] == ['6',0]
    assert graph['16']['inputs']['fps'] == FPS and 'audio' not in graph['16']['inputs']
    store('api.json', graph)
    store('Mara_MI02_ComfyUI_Workflow.json', workflow)
    (HERE/'prompt.txt').write_text(PROMPT, encoding='utf-8')
    store('render-settings.json', dict(clip='MI02', date='2026-11-08', width=WIDTH, height=HEIGHT,
        frames=FRAMES, fps=FPS, seconds=FRAMES/FPS, seed=SEED, steps=20, audio=False,
        duration_reason='Nearest established native H3 frame grid above two seconds; no slowdown or frame interpolation.',
        source=str(SOURCE), source_sha256=sha(SOURCE), runtime_reference=str(RUNTIME), runtime_sha256=sha(RUNTIME),
        input_sha256=sha(HERE/'input'/IMAGE), first_and_last_frame=IMAGE,
        preparation='Proportional resize of original high-resolution focused portrait; same flat #111c20 preview matte as MI01.',
        engine=str(ENGINE), engine_sha256=sha(ENGINE), quality_basis='Approved MI01 and M01-v2 model/sampler/decoder',
        authorized='User approves MI01 and requests the next planned clip. Only MI02.', game_integration=False))
    print('MI02 prepared: 480x576, 56/24 seconds, no audio, identical first/last reference.', flush=True)
    return graph, workflow

if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--render', action='store_true')
    args = parser.parse_args()
    if args.render:
        spec = importlib.util.spec_from_file_location('proven_local_h3_engine', ENGINE)
        module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(module)
        module.run(prepare_job=prepare, job_dir=HERE, input_dir=HERE/'input')
    else:
        prepare()
