"""Validate and optionally render ONE authorized Ilyra window clip using the proven local engine."""
from pathlib import Path
import argparse, hashlib, importlib.util, json, struct
ROOT=Path(__file__).resolve().parent
ENGINE=Path('C:/Users/madde/Documents/Codex/2026-11-03/v/work/bomm_h3_480/render.py')
def read(path): return json.loads(path.read_text(encoding='utf-8'))
def sha(path): return hashlib.sha256(path.read_bytes()).hexdigest()
def validate(code):
 folder=ROOT/code
 assert code in ['IF01','IF02','IF03'] and not any((folder/f).exists() for f in ['job.json','result.json','history.json'])
 graph=read(folder/'api.json');workflow=read(folder/f'Ilyra_{code}_ComfyUI_Workflow.json');s=read(folder/'preparation.json')
 nodes={str(n['id']):n for n in workflow['nodes']};links={l[0]:l for l in workflow['links']}
 assert set(graph)==set(nodes)-{'18'} and len(links)==len(workflow['links'])
 for key,node in graph.items():
  assert nodes[key]['type']==node['class_type']
  for name,value in node['inputs'].items():
   if isinstance(value,list):
    slot,socket=next((i,v) for i,v in enumerate(nodes[key]['inputs']) if v['name']==name)
    link=links[socket['link']];assert link[1:5]==[int(value[0]),value[1],int(key),slot]
    assert link[0] in nodes[value[0]]['outputs'][value[1]]['links']
 template=read(ROOT.parent/'mara-counter/MC04/api.json')
 for key in ['1','2','3','4','8','9','11','12','13','14','16']: assert graph[key]==template[key],f'Model/sampler/decoder changed: {key}'
 source=Path(s['original_reference']);assert source.resolve()==(ROOT/'reference/Ilyra_Fenster_Originalreferenz.png').resolve()
 assert sha(source)==s['source_sha256']==s['input_sha256']==sha(folder/'input'/s['first_and_last_frame'])
 assert struct.unpack('>II',source.read_bytes()[16:24])==(1036,1519)
 assert graph['19']['inputs']=={'image':['5',0],'width':1036,'height':1519,'x':0,'y':0}
 assert nodes['19']['widgets_values']==[1036,1519,0,0]
 assert graph['6']['inputs']==template['6']['inputs']
 assert graph['5']['inputs']['image']==nodes['5']['widgets_values'][0]==s['first_and_last_frame']
 assert graph['7']['inputs']['first_frame']==graph['7']['inputs']['last_frame']==['6',0]
 frames={'IF01':90,'IF02':56,'IF03':56}[code]
 assert graph['7']['inputs']['length']==graph['15']['inputs']['length']==s['frames']==frames
 assert nodes['7']['widgets_values']==[graph['7']['inputs']['prompt'],480,704,frames]
 assert (folder/'prompt.txt').read_text(encoding='utf-8').strip()==graph['7']['inputs']['prompt']
 assert graph['10']['inputs']['noise_seed']==nodes['10']['widgets_values'][0]==s['seed']
 assert graph['16']['inputs']['fps']==24 and 'audio' not in graph['16']['inputs']
 assert nodes['17']['widgets_values']==[graph['17']['inputs']['filename_prefix'],'mp4','h264']
 assert graph['17']['inputs']['filename_prefix'].startswith(f'Ilyra_{code}_')
 assert read(folder/'authorization.json')['authorized'] is True
 return folder,graph,workflow,s
if __name__=='__main__':
 parser=argparse.ArgumentParser();parser.add_argument('code',choices=['IF01','IF02','IF03']);parser.add_argument('--render',action='store_true');args=parser.parse_args()
 folder,graph,workflow,s=validate(args.code)
 print(f'{args.code} preflight passed: reference, API/UI wiring, original model/20-step sampler/decoder, {s["frames"]}/24 seconds.',flush=True)
 if args.render:
  def prepare():
   s.update(render_requested=True,render_submitted='See job.json',engine_sha256=sha(ENGINE),authorization=read(folder/'authorization.json'))
   (folder/'render-settings.json').write_text(json.dumps(s,ensure_ascii=False,indent=2),encoding='utf-8')
   return graph,workflow
  spec=importlib.util.spec_from_file_location('proven_local_h3_engine',ENGINE);engine=importlib.util.module_from_spec(spec);spec.loader.exec_module(engine)
  engine.run(prepare_job=prepare,job_dir=folder,input_dir=folder/'input')
