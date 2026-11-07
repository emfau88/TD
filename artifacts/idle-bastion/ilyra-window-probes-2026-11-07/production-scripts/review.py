"""CPU-only decoded-frame checks and contact sheets. Never submits a render."""
from pathlib import Path
from fractions import Fraction
import argparse, hashlib, json, shutil, subprocess
ROOT=Path(__file__).resolve().parent
def read(path):return json.loads(path.read_text(encoding='utf-8'))
def sha(path):return hashlib.sha256(path.read_bytes()).hexdigest()
def ff(*args):subprocess.run(['ffmpeg','-v','error','-nostdin','-y','-threads','2','-filter_threads','2',*map(str,args)],check=True)
def main(code, revision=None):
 folder=ROOT/code
 if revision: folder=folder/revision
 s=read(folder/'render-settings.json');r=read(folder/'result.json');source=Path(r['file']);frames=s['frames']
 original=Path(s['original_reference']);assert sha(original)==s['source_sha256']==sha(folder/'input'/s['first_and_last_frame'])
 video=folder/f'Ilyra_{code}_{s["label"]}_ComfyUI.mp4'
 if video.exists():assert sha(video)==sha(source)
 else:shutil.copy2(source,video)
 probe=json.loads(subprocess.check_output(['ffprobe','-v','error','-count_frames','-show_entries','stream=codec_type,codec_name,width,height,r_frame_rate,avg_frame_rate,nb_read_frames,duration:format=duration,size','-of','json',str(video)],text=True))
 assert len(probe['streams'])==1
 v=probe['streams'][0];assert v['codec_type']=='video' and v['codec_name']=='h264'
 assert (v['width'],v['height'])==(480,704) and Fraction(v['r_frame_rate'])==Fraction(v['avg_frame_rate'])==24
 assert int(v['nb_read_frames'])==frames and abs(float(probe['format']['duration'])-frames/24)<1/24
 ff('-i',video,'-f','null','-')
 for i in range((frames+31)//32):
  selection=f"select='between(n,{32*i},{min(frames-1,32*i+31)})'"
  for name,transform in [('all','scale=160:235'),('hands','crop=420:250:50:420,scale=210:125')]:
   ff('-i',video,'-vf',f'{selection},{transform},tile=8x4','-frames:v',1,'-update',1,folder/f'review-{name}-{i+1}.jpg')
 indices=[round(i*(frames-1)/11) for i in range(12)]
 select='+'.join(f'eq(n,{i})' for i in indices)
 ff('-i',video,'-vf',f"select='{select}',crop=250:260:95:65,scale=250:260,tile=4x3",'-frames:v',1,'-update',1,folder/'review-face.jpg')
 for i,name in [(0,'start'),(frames//2,'middle'),(frames-1,'end')]:
  ff('-i',video,'-vf',f"select='eq(n,{i})'",'-frames:v',1,'-update',1,folder/f'frame-{name}.png')
 verification=dict(clip=code,video=str(video),native_copy_unchanged=sha(source)==sha(video),video_sha256=sha(video),
  decode_passed=True,probe=probe,source_reference_sha256=sha(original),render_seconds=r['seconds'],
  visual_review='Pending contact-sheet inspection',user_approved=False,game_integration=False)
 (folder/'verification.json').write_text(json.dumps(verification,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
 print(json.dumps(dict(clip=code,seconds=frames/24,bytes=video.stat().st_size,render_seconds=r['seconds'],video=str(video))))
if __name__=='__main__':
 p=argparse.ArgumentParser();p.add_argument('code',choices=['IF01','IF02','IF03']);p.add_argument('--revision');args=p.parse_args();main(args.code,args.revision)
