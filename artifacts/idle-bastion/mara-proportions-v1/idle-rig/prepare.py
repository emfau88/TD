from pathlib import Path
import shutil,hashlib,json
here=Path(__file__).resolve().parent
src=here.parents[1]/'mara-rig-v2/unity'
dst=here/'unity'
if dst.exists():raise SystemExit('Existing experiment preserved; refusing overwrite.')
hashes={}
def copy(f):
 target=dst/f.relative_to(src);target.parent.mkdir(parents=True,exist_ok=True)
 shutil.copy2(f,target);hashes[str(f.relative_to(src))]=hashlib.sha256(f.read_bytes()).hexdigest()
for folder in ['Packages','ProjectSettings','Assets/Art','Assets/Clips']:
 for f in (src/folder).rglob('*'):
  if f.is_file():copy(f)
for name in ['Art.meta','Clips.meta','BodyOrganicComparison.unity','BodyOrganicComparison.unity.meta','BodyOrganicExport.cs','BodyOrganicExport.cs.meta','MaraV2.controller','MaraV2.controller.meta','MaraRigGizmos.cs','MaraRigGizmos.cs.meta']:
 copy(src/'Assets'/name)
(dst/'Assets/Editor').mkdir()
(here/'source-hashes.json').write_text(json.dumps(hashes,indent=2))
print('Copied',len(hashes),'source files to',dst)
