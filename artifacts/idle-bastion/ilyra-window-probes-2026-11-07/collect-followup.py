"""Archive IF04/IF05 and explicit approvals; does not run or integrate clips."""
from pathlib import Path
import hashlib, json, shutil
DEST=Path(__file__).resolve().parent
ROOT=Path('C:/Users/madde/Documents/TowerDefense')
PROD=ROOT/'artifacts/idle-bastion/tavern-comfy-series-2026-11-06/ilyra-window'
def read(p):return json.loads(p.read_text(encoding='utf-8'))
def save(p,v):p.write_text(json.dumps(v,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
v=read(PROD/'IF04/verification.json');v['user_approved']=True;v['approval_basis']='User: ja if04 ist freigegeben (07.11.2026).';save(PROD/'IF04/verification.json',v)
v=read(PROD/'IF05/verification.json');v['visual_review']='All 73 decoded frames, both hands in every frame and enlarged face sequence inspected. Own hand gently turns/lifts from the ledge and returns; glance toward hand then viewer. No observed foreign hand, isolated finger twitch, neck collapse or outfit change. Native output retained; user approval pending.';save(PROD/'IF05/verification.json',v)
result=read(DEST/'results.json')
for code in ['IF04','IF05']:
    src=PROD/code;dst=DEST/code;dst.mkdir(exist_ok=True)
    for f in src.iterdir():
        if f.is_file() and (f.suffix in ['.png','.jpg','.mp4','.json','.txt']) and f.name not in ['job.json','history.json']:
            shutil.copy2(f,dst/f.name)
    video=next(dst.glob('*_ComfyUI.mp4'));v=read(dst/'verification.json')
    item=dict(clip=code,relative_file=f'{code}/{video.name}',duration=float(v['probe']['format']['duration']),bytes=video.stat().st_size,sha256=hashlib.sha256(video.read_bytes()).hexdigest(),user_approved=v['user_approved'],integrated=False,original_h3_render_seconds=v['render_seconds'],stabilized=False)
    result['clips']=[c for c in result['clips'] if c['clip']!=code]+[item]
result['sequence']=['IF01','IF02','IF03','IF04','IF05'];result['rendering_stopped']=True;result['deferred']=['IF06','IF07'];save(DEST/'results.json',result)
for name in ['prepare_next.py','render_one.py','review.py']:
    shutil.copy2(PROD/name,DEST/'production-scripts'/name)
prep=DEST/'prepared-only/IF06';prep.mkdir(parents=True,exist_ok=True)
assert not (PROD/'IF06/job.json').exists()
for f in (PROD/'IF06').iterdir():
    if f.is_file():shutil.copy2(f,prep/f.name)
mirror=ROOT/'artifacts/idle-bastion/ilyra-window-probes-2026-11-07'
for code in ['IF04','IF05']:
    shutil.copytree(DEST/code,mirror/code,dirs_exist_ok=True)
shutil.copy2(DEST/'results.json',mirror/'results.json')
print('Archived IF04 approved and IF05 pending; IF06 has no job and remains disabled.')
