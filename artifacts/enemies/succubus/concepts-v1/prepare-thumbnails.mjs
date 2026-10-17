// Small review thumbnails only; these are not game sprites.
import {dirname,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {readPNG,writePNG,blank,pixel,put} from '../../../../scripts/pixel-atlas.mjs';
const directory=dirname(fileURLToPath(import.meta.url));
for(const name of ['rubinfluegel','nachtbeschwoererin','rosenspiegel']){
  const source=await readPNG(resolve(directory,`${name}-source.png`));
  let x0=source.width,y0=source.height,x1=0,y1=0;
  for(let y=0;y<source.height;y++)for(let x=0;x<source.width;x++)if(pixel(source,x,y)[3]>=128){x0=Math.min(x0,x);y0=Math.min(y0,y);x1=Math.max(x1,x);y1=Math.max(y1,y);}
  const output=blank(224,320),scale=Math.min(208/(x1-x0+1),304/(y1-y0+1));
  const w=Math.round((x1-x0+1)*scale),h=Math.round((y1-y0+1)*scale),ox=Math.round((224-w)/2),oy=Math.round((320-h)/2);
  for(let y=0;y<h;y++)for(let x=0;x<w;x++)put(output,ox+x,oy+y,pixel(source,Math.min(x1,x0+Math.floor(x/scale)),Math.min(y1,y0+Math.floor(y/scale))));
  await writePNG(resolve(directory,`${name}-preview.png`),output);
}
