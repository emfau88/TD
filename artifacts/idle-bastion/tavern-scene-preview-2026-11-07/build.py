"""Package approved native videos in one offline HTML; never touches game assets."""
import base64, json, subprocess
from pathlib import Path
HERE=Path(__file__).resolve().parent
REPO=HERE.parents[2]
def data_uri(path, mime):
    return 'data:'+mime+';base64,'+base64.b64encode(path.read_bytes()).decode('ascii')
def clip(code,label,path,approved=True):
    duration=float(subprocess.check_output(['ffprobe','-v','error','-show_entries','format=duration','-of','csv=p=0',str(path)],text=True))
    return dict(code=code,label=label,duration=duration,approved=approved,src=data_uri(path,'video/mp4'))
mara=REPO/'experiments/idle-bastion/assets/tavern-video/mara-counter'
ilyra=HERE.parent/'ilyra-window-probes-2026-11-07'
poster=HERE/'mara-poster.jpg'
subprocess.run(['ffmpeg','-v','error','-nostdin','-y','-i',str(mara/'MC01.mp4'),'-frames:v','1','-update','1',str(poster)],check=True)
data={
    'mara':dict(name='Mara am Tresen',poster=data_uri(poster,'image/jpeg'),
        note='Vollständiges Set: jede Reaktion gehört zur gleichen Tresenszene.',
        clips=[clip(f'MC{i:02}',label,mara/f'MC{i:02}.mp4') for i,label in enumerate(['Ruhe','Sprechen','Haare','Schulter','Hand','Zusammen lachen','Annäherung'],1)]),
    'ilyra':dict(name='Ilyra am Fenster',poster=data_uri(ilyra/'IF04/frame-start.png','image/png'),
        note='IF04: eigene Hand an die Hüfte. IF05: freigegebene Handreaktion. Lachen (IF06) und Annäherung (IF07) fehlen weiterhin.',
        clips=[clip(f'IF{i:02}',label,next((ilyra/f'IF{i:02}').glob('*_ComfyUI.mp4')),True) for i,label in enumerate(['Ruhe','Sprechen','Haare','Schulter / Hüftpose','Hand'],1)])
}
source=(HERE/'source.html').read_text(encoding='utf-8')
assert source.count('__ASSETS__')==1
(HERE/'index.html').write_text(source.replace('__ASSETS__',json.dumps(data,ensure_ascii=False,separators=(',',':'))),encoding='utf-8')
print(f'Offline preview: {(HERE/"index.html").stat().st_size:,} bytes')
