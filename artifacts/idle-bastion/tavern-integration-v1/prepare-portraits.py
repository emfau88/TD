"""Small lossless overview portraits from the approved idle; no new artwork."""
from pathlib import Path
import json
import shutil
from PIL import Image

P=Path(__file__).resolve().parent
source=P.parent/'tavern-hearts-0-2'
manifest=json.loads((source/'manifest.json').read_text())
for hero in ('mara','ilyra'):
    page=source/manifest['heroes'][hero]['idle']['pages'][0]
    with Image.open(page) as image:
        image.crop((90,50,390,403)).resize((272,320),Image.Resampling.LANCZOS).save(P/f'{hero}-portrait.webp',lossless=True,exact=True)
    target=P.parents[2]/'experiments/idle-bastion/assets/tavern-rig'
    target.mkdir(parents=True,exist_ok=True)
    shutil.copyfile(P/f'{hero}-portrait.webp',target/f'{hero}-portrait.webp')
