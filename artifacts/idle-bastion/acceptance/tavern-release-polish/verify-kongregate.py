"""Verify the exported bytes, static build URLs and optional loopback HTTP delivery."""
from pathlib import Path, PurePosixPath
from concurrent.futures import ThreadPoolExecutor
from urllib.request import Request, urlopen
from urllib.parse import unquote, urlsplit
import argparse, zipfile, json, hashlib, re, posixpath
parser=argparse.ArgumentParser();parser.add_argument('package',type=Path);parser.add_argument('--url');args=parser.parse_args()
root=args.package; m=json.loads((root/'BUILD-MANIFEST.json').read_text(encoding='utf-8'));assert not m['sourceWorkingTreeChanges']
with zipfile.ZipFile(root/'01-game/Towers-and-Tantrums.zip') as z:
 assert z.testzip() is None;names=z.namelist();assert 'index.html' in names and 'LICENSES.txt' in names
 assert len(names)==m['fileCountIncludingLicense'];assert not any(n.startswith('/') or '..' in PurePosixPath(n).parts for n in names)
 for f in m['files']:assert hashlib.sha256(z.read(f['file'])).hexdigest()==f['sha256'],f['file']
 assert [n for n in names if n.endswith('.html')]==['index.html'];refs=set()
 for n in names:
  if not n.endswith(('.html','.css','.js')):continue
  text=z.read(n).decode('utf-8')
  urls=re.findall(r'new URL\(\s*["\']([^"\']+)["\'],\s*import.meta.url',text) if n.endswith('.js') else []
  if n.endswith('.js'):urls+=re.findall(r'(?:\bfrom\s*|\bimport\s*\(?)["\']((?:\./|\.\./)[^"\']+\.(?:js|json))["\']',text)
  if n.endswith('.html'):urls+=re.findall(r'(?:src|href)=["\']([^"\']+)["\']',text)
  if n.endswith('.css'):urls+=re.findall(r'url\(["\']?([^"\')]+)',text)
  for url in urls:
   if url.startswith(('data:','#')):continue
   split=urlsplit(url);assert not split.scheme and not split.netloc,('external build dependency',n,url)
   path=unquote(split.path);assert not path.startswith('/'),('non-relative URL',n,url)
   resolved=posixpath.normpath(posixpath.join(posixpath.dirname(n),path));assert resolved in names,(n,url,resolved);refs.add(resolved)
 with zipfile.ZipFile(root/'01-game/separate-upload/additional-files.zip') as other:
  assert other.testzip() is None;assert set(other.namelist())==set(names)-{'index.html'}
  for n in other.namelist():assert other.read(n)==z.read(n)
 assert (root/'01-game/separate-upload/index.html').read_bytes()==z.read('index.html')
statuses=[]
if args.url:
 def head(f):
  from urllib.parse import quote
  with urlopen(Request(args.url.rstrip('/')+'/'+quote(f['file']),method='HEAD'),timeout=10) as r:assert r.status==200;assert int(r.headers['Content-Length'])==f['bytes'];return r.status
 with ThreadPoolExecutor(max_workers=8) as pool:statuses=list(pool.map(head,m['files']))
report={'sourceCommit':m['sourceCommit'],'cleanSource':True,'zipCRC':'passed','manifestHashes':'all matched','standaloneEntries':len(names),'staticUrlReferences':len(refs),'missingStaticUrls':[],'httpFiles200':len(statuses),'separateUploadEquivalent':True,'archives':m['archives'],'browserLimit':'Complete click-through and host-specific save/audio verification remain blocked by browser input timeouts. No Kongregate upload or submission.'}
print(json.dumps(report,ensure_ascii=False,indent=2))
