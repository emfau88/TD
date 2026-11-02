import http from 'node:http';
import {readFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.dirname(fileURLToPath(import.meta.url));
const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.webp':'image/webp','.png':'image/png','.ttf':'font/ttf','.json':'application/json'};
http.createServer(async(req,res)=>{
 try{const url=new URL(req.url,'http://127.0.0.1'),name=decodeURIComponent(url.pathname==='/'?'/index.html':url.pathname),file=path.resolve(root,'.'+name);
 if(!file.startsWith(root+path.sep)){res.writeHead(403);res.end();return;}
 const body=await readFile(file);res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream','Cache-Control':'no-store'});res.end(body);
 }catch{res.writeHead(404);res.end('Not found');}
}).listen(5207,'127.0.0.1',()=>console.log('Loading scene preview: http://127.0.0.1:5207'));
