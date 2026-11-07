"""Prepare only the explicitly requested IF04, IF05, IF06; never overwrite existing work."""
from pathlib import Path
import hashlib, json, shutil
import prepare as previous
ROOT=Path(__file__).resolve().parent
IDENTITY=previous.COMMON.split('Her own left gloved hand')[0]
FINISH=(' Start and finish in the exact supplied window stance, with her own left hand flat on the window ledge at picture-right '
 'and her own right hand beside her thigh at picture-left, open eyes and her original small closed-mouth smile. '
 'Keep natural neck length and comfortable chin-to-collarbone spacing. The head remains anatomically connected to the neck and shoulders, '
 'never sliding down or changing size. Preserve the original glove design and relaxed finger shape and thumb position. '
 'Fingers remain stable relative to the palm, without separate twitching, fluttering, tapping or curling. '
 'Exactly one woman, only her own two hands and arms. No other hand touches her. Nothing enters or leaves the frame. '
 'The camera, framing, closed window, wooden ledge, mug, candles, room and lighting remain fixed. '
 'No wind or independent cape flutter. Hair and fabric follow actual body movement gently and settle promptly. '
 'Keep the original illustrated game artwork, body proportions and clothing coverage throughout. No speech, captions, music or sound.')
CLIPS={
 'IF04':(73,'Schulter', 'A continuous 3.04-second illustrated fantasy game confident shoulder reaction. '+IDENTITY+
  'She acknowledges the unseen player with a brief friendly sideways glance and a small self-assured closed-mouth smile. '
  'Her own right hand, at picture-left, rises a short comfortable distance from beside her thigh to rest gently on her own hip. '
  'The fingers stay softly grouped as one stable shape, palm turned toward her own hip; the elbow stays close and inside the frame. '
  'At the same time she relaxes that shoulder and makes one very small sideways weight shift, angling her hips only a few degrees. '
  'Her upper body stays comfortably upright, with no deep bend, bow or exaggerated twist. Her face remains directed toward the viewer. '
  'Her own left hand at picture-right remains supported at the original window-ledge contact. '
  'Briefly hold this relaxed hand-on-hip pose, then lower her right hand smoothly to its original place by her thigh and settle into the original stance. '
  'The action is small, deliberate and readable. No repeated swaying, jumping or independent torso pulses. '+FINISH),
 'IF05':(73,'Hand','A continuous 3.04-second illustrated fantasy game gentle solo hand reaction. '+IDENTITY+
  'She makes one tiny deliberate motion with her own left white-gloved hand resting on the window ledge at picture-right. '
  'This whole relaxed hand lifts only about one centimeter above its original contact, pauses gently and returns to exactly the same resting place. '
  'Her elbow stays low and her forearm follows as one coherent unit. The original relaxed fingers and thumb remain completely still relative to the palm; '
  'the whole hand moves together as one stable shape, without opening, closing, curling, tapping or fluttering individual fingers. '
  'Her other own hand remains comfortably beside her thigh at picture-left. '
  'She briefly glances toward her own hand, then meets the viewer with a warm knowing look and a restrained closed-mouth smile. '
  'Hold the eye contact briefly before settling. Her head turns only a few degrees while head height and neck length stay stable. '
  'Her torso, shoulders, belt, long hair and cape stay calm and nearly still. '+FINISH),
 'IF06':(73,'Lachen','A continuous 3.04-second illustrated fantasy game warm laughing reaction. '+IDENTITY+
  'She reacts with a short spontaneous warm chuckle, her smile opening naturally and her eyes softening almost closed with amusement. '
  'Two small connected shoulder and upper-torso pulses accompany the brief laugh. She inclines forward only a little as one coherent unit. '
  'Her head follows the body naturally, with stable neck length and no head bob, large bow or repeated rocking. '
  'Her own left hand at picture-right remains comfortably supported on the original window-ledge contact. '
  'Her own right hand stays near her thigh and follows only the small body motion, with relaxed fingers held together. '
  'The arms stay comfortably close to the body; no raised or spreading arms. '
  'Small natural follow-through of her clothing and hair follows the connected laughing impulses with a slight delay and settles quickly with her body. '
  'There is no isolated movement while at rest. She finishes the chuckle, reopens her eyes and returns to her original small closed-mouth smile. '+FINISH),
}
def save(path,value):path.write_text(json.dumps(value,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
if __name__=='__main__':
 for code,(frames,label,prompt) in CLIPS.items():
  folder=ROOT/code;assert not folder.exists(),f'{code} already exists'
  (folder/'input').mkdir(parents=True);name=f'Ilyra_{code}_Originalreferenz.png';shutil.copy2(previous.SOURCE,folder/'input'/name)
  graph=json.loads((ROOT/'IF02/api.json').read_text(encoding='utf-8'))
  workflow=json.loads((ROOT/'IF02/Ilyra_IF02_ComfyUI_Workflow.json').read_text(encoding='utf-8'));nodes={str(n['id']):n for n in workflow['nodes']}
  seed=2611076000+int(code[-2:]);prefix=f'Ilyra_{code}_{label}_Fenster_H3_480x704_24fps'
  graph['5']['inputs']['image']=name;nodes['5']['widgets_values'][0]=name
  graph['7']['inputs'].update(prompt=prompt,length=frames);nodes['7']['widgets_values']=[prompt,480,704,frames]
  graph['10']['inputs']['noise_seed']=seed;nodes['10']['widgets_values'][0]=seed
  graph['15']['inputs']['length']=frames;nodes['15']['widgets_values']=[0,frames]
  graph['17']['inputs']['filename_prefix']=prefix;nodes['17']['widgets_values']=[prefix,'mp4','h264']
  for key in ['5','6','7','15','17','19']:
   title=f'{code} · {label} · identische freigegebene Fensterreferenz';graph[key]['_meta']={'title':title};nodes[key]['title']=title
  nodes['18']['widgets_values']=[f'{code}: Nutzerauftrag nach Freigabe IF01–IF03. Einzeln rendern, keine Spielintegration. {frames} Frames /24FPS, identisches erstes/letztes Bild.']
  s=json.loads((ROOT/'IF02/preparation.json').read_text(encoding='utf-8'))
  s.update(clip=code,label=label,frames=frames,duration_seconds=frames/24,seed=seed,first_and_last_frame=name,
   template=str(ROOT/'IF02'),quality_basis=['IF02 approved','MC04','MC05','MC06','I05'],render_submitted=False,
   duration_reason='IF04 uses 3.04 s for the newly requested hand-on-hip pose and readable return; IF05/IF06 stay near 3 seconds.')
  save(folder/'api.json',graph);save(folder/f'Ilyra_{code}_ComfyUI_Workflow.json',workflow);save(folder/'preparation.json',s)
  save(folder/'authorization.json',dict(clip=code,authorized=True,basis='User explicitly approves IF01–IF03 and requests IF04, IF05, IF06 sequentially; no game integration. Additional direction: own hand on hip and slight sideways weight shift.',scope='IF04–IF06 only'))
  (folder/'prompt.txt').write_text(prompt+'\n',encoding='utf-8');print(f'{code} prepared: {frames}/24 seconds, no render started')
