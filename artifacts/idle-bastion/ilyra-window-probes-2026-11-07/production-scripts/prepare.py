"""Prepare IF01–IF03 without launching ComfyUI. Existing outputs are never replaced."""
from pathlib import Path
import copy, hashlib, json, shutil, struct

ROOT = Path(__file__).resolve().parent
TEMPLATE = ROOT.parent / 'mara-counter/MC04'
IMAGE = Path('C:/Users/madde/.codex/generated_images/01a1b211-a7cf-7c61-a14b-47f20fcbfbb6/exec-7504831f-0563-44ca-b35c-71b3def8be7a.png')
SOURCE = ROOT / 'reference/Ilyra_Fenster_Originalreferenz.png'
COMMON = ('The adult illustrated woman Ilyra from <Picture 1> is alone beside the same CLOSED tavern window throughout. '
 'Preserve her exact blue eyes, tan skin, long silver-white wavy hair, gold goggles with blue lenses on her head, '
 'white and royal-blue outfit, gold diamond belt buckle, white gloves, forearm covers, gold wrist cuffs and upper-arm band. '
 'Keep the exact face, mature adult proportions, clothing coverage, crisp colored outlines and painted cel shading. '
 'Her own left gloved hand at picture-right remains resting flat at its original contact on the wooden window ledge. '
 'Her own right gloved hand at picture-left remains relaxed beside her thigh, with the original gently grouped fingers. ')
END = (' Start and finish in the exact supplied window stance, open eyes and the original small closed-mouth smile. '
 'Maintain natural neck length, original chin-to-collarbone distance, shoulder height and torso proportions. '
 'The head never slides down into the shoulders or changes size. Both hands belong to Ilyra and retain their original '
 'relaxed finger and thumb shapes throughout; fingers do not wiggle or curl one at a time. '
 'No other person or hand appears. Nothing enters or leaves the frame. Keep all props, ledge, closed window, timber, '
 'candles, camera, framing and lighting fixed. No wind, flutter, independent cloth or hair motion, repeated body pulses '
 'or exaggerated breathing. Remain a drawn 2D game character, never photorealistic or 3D. No captions, music or sound.')
CLIPS = {
 'IF01': (90, 'Ruhe', 'A quiet continuous 3.75-second idle loop. ' + COMMON +
   'She is comfortably still and attentive, with just one soft natural blink and a barely perceptible settling of her small smile. '
   'Her eyes return to the viewer. Keep her head upright and almost motionless. Shoulders, chest and arms remain essentially still; '
   'no visible breathing lift or lean. The resting hand never leaves the ledge. The hanging arm and relaxed fingers remain in place. '
   'The blue cape hangs completely still as a separate shape behind her white hair. ' + END),
 'IF02': (56, 'Gespraech', 'A short continuous 2.33-second attentive conversation reaction. ' + COMMON +
   'She briefly looks warmly at the viewer, softly blinks once and lets a small knowing closed-mouth smile grow slightly. '
   'A very small coherent head inclination of only a few degrees accompanies her attentive expression, then she returns upright. '
   'No head bob or bow; her neck and torso stay aligned and steady. This is a listening response, not lip-synced speech. '
   'Both hands remain relaxed at their original contacts, without gestures. Her shoulders and chest remain calm. ' + END),
 'IF03': (56, 'Haare', 'A short continuous 2.33-second gentle hair-contact reaction, showing ONLY her response. ' + COMMON +
   'She briefly softens her gaze and closes her eyes in one slow pleased blink, with a slight warm closed-mouth smile. '
   'Her head makes a tiny natural tilt of two or three degrees toward the viewer, without lowering her chin or shoulders. '
   'Hold the softened expression for a brief readable beat, then reopen her eyes and return to the original pose. '
   'Nobody visibly touches her. Her own hands stay in their original places; she does not reach for her hair. '
   'Hair stays in its original arranged waves, following only the tiny head tilt. Cape, chest and arms remain still. ' + END),
}
def save(path, value): path.write_text(json.dumps(value, ensure_ascii=False, indent=2)+'\n', encoding='utf-8')
def sha(path): return hashlib.sha256(path.read_bytes()).hexdigest()
def main():
 ROOT.mkdir(parents=True, exist_ok=True); SOURCE.parent.mkdir(exist_ok=True)
 if SOURCE.exists(): assert sha(SOURCE)==sha(IMAGE)
 else: shutil.copy2(IMAGE,SOURCE)
 width,height=struct.unpack('>II',SOURCE.read_bytes()[16:24]); assert (width,height)==(1036,1519)
 crop={'x':0,'y':0,'width':1036,'height':1519}
 for code,(frames,label,prompt) in CLIPS.items():
  folder=ROOT/code
  assert not folder.exists(), f'{code} already prepared; inspect instead of overwriting'
  (folder/'input').mkdir(parents=True)
  name=f'Ilyra_{code}_Originalreferenz.png'; shutil.copy2(SOURCE,folder/'input'/name)
  graph=json.loads((TEMPLATE/'api.json').read_text(encoding='utf-8'))
  workflow=json.loads((TEMPLATE/'Mara_MC04_ComfyUI_Workflow.json').read_text(encoding='utf-8'))
  nodes={str(n['id']):n for n in workflow['nodes']}
  seed=2611076000+int(code[-2:]); prefix=f'Ilyra_{code}_{label}_Fenster_H3_480x704_24fps'
  graph['5']['inputs']['image']=name; nodes['5']['widgets_values'][0]=name
  graph['19']['inputs'].update(crop); nodes['19']['widgets_values']=[1036,1519,0,0]
  graph['7']['inputs'].update(prompt=prompt,length=frames); nodes['7']['widgets_values']=[prompt,480,704,frames]
  graph['10']['inputs']['noise_seed']=seed; nodes['10']['widgets_values'][0]=seed
  graph['15']['inputs']['length']=frames; nodes['15']['widgets_values']=[0,frames]
  graph['17']['inputs']['filename_prefix']=prefix; nodes['17']['widgets_values']=[prefix,'mp4','h264']
  for key in ['5','6','7','15','17','19']:
   title=f'{code} · {label} · feste Fensterreferenz'
   graph[key]['_meta']={'title':title}; nodes[key]['title']=title
  nodes['18']['widgets_values']=[f'{code}: autorisierte einzelne Fensterprobe. Gemeinsames erstes/letztes Bild, {frames}/24 s, 20 Schritte. Nur eigene Hände, stabiler Hals, ruhiger Umhang. Keine Spielintegration ohne Nutzerfreigabe.']
  save(folder/'api.json',graph);save(folder/f'Ilyra_{code}_ComfyUI_Workflow.json',workflow)
  save(folder/'preparation.json',dict(character='ilyra',clip=code,label=label,prepared_on='2026-11-07',width=480,height=704,
   frames=frames,fps=24,duration_seconds=frames/24,seed=seed,steps=20,audio=False,game_integration=False,
   first_and_last_frame=name,original_reference=str(SOURCE),original_dimensions=[width,height],
   source_sha256=sha(SOURCE),input_sha256=sha(SOURCE),crop=crop,template=str(TEMPLATE),
   quality_basis=['ilyra/I01/v2','ilyra/I02','mara/M01/v2','mara/M03','mara-counter/MC04'],render_submitted=False))
  save(folder/'authorization.json',dict(clip=code,authorized=True,basis='Latest user: integrate approved MC04/MC06/MC07, then create the next three missing Ilyra clips sequentially and show for approval.',scope='IF01–IF03 only, no game integration before visual acceptance'))
  (folder/'prompt.txt').write_text(prompt+'\n',encoding='utf-8')
  print(f'{code}: prepared {frames} frames / {frames/24:.2f}s, no rendering started')
if __name__=='__main__': main()
