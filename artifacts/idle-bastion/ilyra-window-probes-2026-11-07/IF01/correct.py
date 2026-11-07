"""Reuse the accepted I01 v2 video correction: preserve face, keep the idle body at rest."""
from pathlib import Path
import json, shutil, subprocess, time
import numpy as np
HERE=Path(__file__).resolve().parent; PARENT=HERE.parent
def ff(*args):subprocess.run(['ffmpeg','-v','error','-nostdin','-y','-threads','2','-filter_complex_threads','2',*map(str,args)],check=True)
def decode(path):
 raw=subprocess.check_output(['ffmpeg','-v','error','-threads','2','-i',str(path),'-f','rawvideo','-pix_fmt','rgb24','-'])
 return np.frombuffer(raw,dtype=np.uint8).reshape(-1,704,480,3)
def save(name,value):(HERE/name).write_text(json.dumps(value,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
if __name__=='__main__':
 source=PARENT/'Ilyra_IF01_Ruhe_ComfyUI.mp4';master=HERE/'Ilyra_IF01_Ruhe_Lossless.mkv';output=HERE/'Ilyra_IF01_Ruhe_ComfyUI.mp4'
 assert not output.exists();start=time.monotonic()
 s=json.loads((PARENT/'render-settings.json').read_text(encoding='utf-8'));frames=s['frames']
 (HERE/'input').mkdir(exist_ok=True);shutil.copy2(PARENT/'input'/s['first_and_last_frame'],HERE/'input'/s['first_and_last_frame'])
 s.update(revision='v2',method='Same deterministic local video composite as approved I01/v2: face/blinks retained, body/cape/hands held at rest.',source_video=str(source),animated_region='Rows 0–248 unchanged; cosine blend 248–280; rows 280–703 fixed at first native frame.',generated_new_motion=False)
 save('render-settings.json',s)
 expr='if(lte(Y,248),255,if(gte(Y,280),0,255*0.5*(1+cos(PI*(Y-248)/32))))'
 filters=('[0:v]format=gbrp,split=3[moving][base][mask];'
  '[base]trim=end_frame=1,loop=loop=-1:size=1:start=0,setpts=N/(24*TB)[still];'
  f"[mask]geq=r='{expr}':g='{expr}':b='{expr}'[alpha];[still][moving][alpha]maskedmerge[out]")
 ff('-i',source,'-filter_complex',filters,'-map','[out]','-frames:v',frames,'-c:v','ffv1','-level','3','-pix_fmt','bgr0',master)
 before,after=decode(source),decode(master)
 assert before.shape==after.shape==(90,704,480,3)
 assert np.array_equal(before[:,:249],after[:,:249]);assert np.all(after[:,280:]==after[:1,280:])
 del before,after
 ff('-i',master,'-c:v','libx264','-threads','2','-preset','slow','-crf','16','-pix_fmt','yuv420p','-movflags','+faststart',output)
 save('correction-checks.json',dict(face_and_blinks_pixel_identical_before_delivery_encoding=True,body_cape_hands_static_in_all_90_lossless_frames=True,duration_unchanged=True,source_preserved=True))
 save('result.json',dict(file=str(output),seconds=round(time.monotonic()-start,1),operation='Local video stabilization; original AI render 288.2 s.'))
 print('IF01 v2 stabilized; first 249 rows retained exactly, body and hands fixed. No new model job.')
