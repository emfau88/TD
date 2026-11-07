"""Import the five approved native clips; no rendering, re-encoding or old-asset removal."""
from pathlib import Path
import hashlib,json,shutil,subprocess
HERE=Path(__file__).resolve().parent;REPO=HERE.parents[2]
SOURCE=HERE.parent/'ilyra-window-probes-2026-11-07'
DEST=REPO/'experiments/idle-bastion/assets/tavern-video/ilyra-window';DEST.mkdir(parents=True,exist_ok=True)
ROOT=Path('C:/Users/madde/Documents/TowerDefense')
metadata={};copied=[]
for i in range(1,6):
    code=f'IF{i:02}';folder=SOURCE/code;verification=folder/'verification.json';v=json.loads(verification.read_text(encoding='utf-8'))
    if i==5:
        v['user_approved']=True;v['approval_basis']='User approved IF05 and requested integration of IF01–IF05 plus commit/push to main, 07.11.2026.'
    assert v['user_approved']
    src=next(folder.glob('*_ComfyUI.mp4'));dst=DEST/f'{code}.mp4';shutil.copy2(src,dst)
    digest=hashlib.sha256(dst.read_bytes()).hexdigest();assert digest==v['video_sha256']
    probe=json.loads(subprocess.check_output(['ffprobe','-v','error','-count_frames','-show_entries','stream=codec_type,width,height,r_frame_rate,nb_read_frames','-of','json',str(dst)],text=True))
    stream=probe['streams'][0];assert len(probe['streams'])==1 and stream['r_frame_rate']=='24/1' and (stream['width'],stream['height'])==(480,704)
    frames=int(stream['nb_read_frames']);metadata[f'ilyra-window/{code}.mp4']=dict(fps=24,frames=frames,duration=frames/24)
    v['game_integration']=True;verification.write_text(json.dumps(v,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    copied.append(dict(clip=code,bytes=dst.stat().st_size,sha256=digest))
    if i==5:
        for other in [ROOT/'artifacts/idle-bastion/ilyra-window-probes-2026-11-07/IF05/verification.json',ROOT/'artifacts/idle-bastion/tavern-comfy-series-2026-11-06/ilyra-window/IF05/verification.json']:
            ov=json.loads(other.read_text(encoding='utf-8'));ov['user_approved']=True;ov['approval_basis']=v['approval_basis'];other.write_text(json.dumps(ov,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
(DEST/'media.json').write_text(json.dumps(metadata,indent=2)+'\n',encoding='utf-8')
subprocess.run(['ffmpeg','-v','error','-nostdin','-y','-i',str(DEST/'IF01.mp4'),'-frames:v','1','-update','1',str(DEST/'poster.png')],check=True)
# Room-only edge columns from the approved scene; no second figure in the wide-stage surround.
subprocess.run(['ffmpeg','-v','error','-nostdin','-y','-i',str(DEST/'poster.png'),'-filter_complex','[0:v]split[l][r];[l]crop=24:704:0:0,scale=240:704[left];[r]crop=24:704:456:0,scale=240:704[right];[left][right]hstack','-frames:v','1','-update','1',str(DEST/'background.png')],check=True)
result=json.loads((SOURCE/'results.json').read_text(encoding='utf-8'))
for c in result['clips']:c['user_approved']=True;c['integrated']=True
(SOURCE/'results.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
(HERE/'import.json').write_text(json.dumps(dict(nativeUnchanged=True,clips=copied,renderedNewClips=False),indent=2)+'\n',encoding='utf-8')
print(f'Imported {len(copied)} unchanged clips ({sum(c["bytes"] for c in copied):,} bytes).')
