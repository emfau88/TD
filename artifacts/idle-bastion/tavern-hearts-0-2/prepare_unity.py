"""Copy the existing corrected Ilyra rig into this experiment, without touching it."""
from pathlib import Path
import shutil
import json
import hashlib

here=Path(__file__).resolve().parent
src=here.parent/'ilyra-rig-prep/hip-v1/unity'
dst=here/'unity'
if dst.exists():
    raise SystemExit('Refusing to overwrite an existing project.')
hashes={}
def copy(a,b):
    b.parent.mkdir(parents=True,exist_ok=True)
    shutil.copy2(a,b)
    hashes[a.relative_to(here.parent).as_posix()]=hashlib.sha256(a.read_bytes()).hexdigest()
for folder in ['Packages','ProjectSettings','Assets/Art','Assets/Clips']:
    for f in (src/folder).rglob('*'):
        if f.is_file():copy(f,dst/f.relative_to(src))
for name in ['IlyraGiggle.unity','IlyraGiggle.unity.meta','IlyraHeadExport.cs','IlyraHeadExport.cs.meta','IlyraSecondaryMotion.cs','IlyraSecondaryMotion.cs.meta','Art.meta','Clips.meta']:
    copy(src/'Assets'/name,dst/'Assets'/name)
# The existing export/mesh validator is reused on the copied rig, in one batch.
p=dst/'Assets/IlyraHeadExport.cs';s=p.read_text()
s=s.replace('public string outputBase=', 'public AnimationClip[] testClips; public string[] testNames; public string outputBase=')
s=s.replace('int frameCount=Mathf.RoundToInt(clip.length*30);', '''string baseOutput=outputBase;
  var positions=bones.Select(b=>b.localPosition).ToArray();var scales=bones.Select(b=>b.localScale).ToArray();
  for(int ci=0;ci<testClips.Length;ci++){
  for(int b=0;b<bones.Length;b++){bones[b].localPosition=positions[b];bones[b].localRotation=rotations[b];bones[b].localScale=scales[b];}
  clip=testClips[ci];outputBase=baseOutput+"/"+testNames[ci];output=outputBase+"/frames";Directory.CreateDirectory(output);ev=new Evidence();
  int frameCount=Mathf.RoundToInt(clip.length*30);''')
s=s.replace('captureCamera.targetTexture=null;rt.Release();Debug.Log', 'Debug.Log')
s=s.replace('UnityEditor.EditorApplication.Exit(ev.foldedTriangles==0?0:1);', '''if(ev.foldedTriangles!=0){UnityEditor.EditorApplication.Exit(1);yield break;}
  }
  captureCamera.targetTexture=null;rt.Release();UnityEditor.EditorApplication.Exit(0);''')
p.write_text(s)
(dst/'Assets/Editor').mkdir()
(here/'qa/unity-input-hashes.json').write_text(json.dumps(hashes,indent=2))
print('Prepared isolated Unity project:',dst)
