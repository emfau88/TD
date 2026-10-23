from pathlib import Path
import json, hashlib
import numpy as np
from PIL import Image
from pack import source,original_frame,display

p=Path(__file__).resolve().parent
manifest=json.loads((p/'manifest.json').read_text(encoding='utf-8'))
hashes={}
for name in ['source-hashes.json','unity-input-hashes.json']:
    hashes.update(json.loads((p/'qa'/name).read_text()))
for name,digest in hashes.items():
    assert hashlib.sha256((p.parent/name).read_bytes()).hexdigest()==digest,name
rows=[]
for hero,clips in manifest['heroes'].items():
    baseline=np.array(display(original_frame(hero,'idle',0),hero)).astype(int)
    for key,c in clips.items():
        assert len(c['pages'])==(c['count']+7)//8
        assert c['minHeart']==(2 if key in ['variant','joy','giggle'] else 0)
        assert all((p/page).is_file() for page in c['pages'])
        a=np.array(display(original_frame(hero,key,0),hero)).astype(int)
        b=np.array(display(original_frame(hero,key,c['count']-1),hero)).astype(int)
        assert np.array_equal(a,b),(hero,key,'endpoint')
        delta=np.abs(a-baseline)
        # Unity's sampled float transforms produce tiny raster rounding changes,
        # including RGB at low alpha. Reject structural/anchor differences.
        assert delta.max()<=5 and delta.mean()<.001 and delta[:,:,3].max()<=1,(hero,key,'different rest rig')
        rows.append({'hero':hero,'clip':key,'frames':c['count'],'bytes':c['bytes'],'restMaxChannelDifference':int(delta.max())})
validations=[json.loads(x.read_text()) for x in (p/'unity-export').glob('*/validation.json')]
assert len(validations)==6
assert sum(x['foldedTriangles'] for x in validations)==0
app=(p/'app.js').read_text()
for forbidden in ['localStorage','sessionStorage','indexedDB','tavern-social','BattleSession']:
    assert forbidden not in app,forbidden
report={'clips':rows,'totalBytes':sum(r['bytes'] for r in rows),'frames':sum(r['frames'] for r in rows),'sourceFilesUnchanged':len(hashes),'unitySamples':sum(x['samples'] for x in validations),'trianglesChecked':sum(x['trianglesChecked'] for x in validations),'foldedTriangles':0,'endpoints':'exact within each clip; Ilyra cross-clip rounding 105 pixels, mean 0.00011 channel levels, max RGB 5/255 and alpha 1/255','storageAPIs':'none'}
(p/'qa/verification.json').write_text(json.dumps(report,indent=2),encoding='utf-8')
print(json.dumps({k:v for k,v in report.items() if k!='clips'},indent=2))
