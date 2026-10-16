import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readPNG,writePNG,blank,pixel,put,copyTile,normalizedProps,materialTile,connectedTile } from './pixel-atlas.mjs';
const root=fileURLToPath(new URL('../',import.meta.url)),assets=resolve(root,'public/assets');
const source=await readPNG(resolve(assets,'Windbruch Materials v1.png'));
const ground=materialTile(source,0,[0x729f91,0xa1bba1,0x567c79]),trail=materialTile(source,2,[0xccbfa2,0xb0a68f,0xe4d5b2]);
const cliff=materialTile(source,1,[0x49566e,0x657386,0x354156]),sky=materialTile(source,3,[0x83a6b9,0xa8c7ce,0x66879f]);
const atlas=blank(512,448),transparent=blank(64,64);[ground,trail,cliff,sky].forEach((tile,i)=>copyTile(atlas,tile,i));
for(let mask=0;mask<16;mask++){
  copyTile(atlas,connectedTile(transparent,ground,mask,31,[161,187,161,255]),4+mask);
  copyTile(atlas,connectedTile(ground,trail,mask,28,[176,166,143,255]),20+mask);
  copyTile(atlas,connectedTile(transparent,cliff,mask,31,[53,65,86,255]),36+mask);
}
await writePNG(resolve(assets,'Windbruch Tiles v1.png'),atlas);
await writePNG(resolve(assets,'Windbruch Sprites v1.png'),normalizedProps(await readPNG(resolve(assets,'Windbruch Props v1.png')),[
  {box:[234,138,246,519],foot:[354,655]}, {box:[726,233,342,402],foot:[897,633]},
  {box:[80,881,577,245],foot:[369,1124]}, {box:[716,714,420,451],foot:[926,1163]},
],1/11));
// Measured bridge decks, excluding the generated island end caps. Each orientation
// keeps a uniform scale; deck endpoints span the existing three-cell crossing.
const detailSource=await readPNG(resolve(assets,'Windbruch Bridges and Rims v1.png')),details=blank(384,192);
for(const {box:[sx,sy,w,h],anchor:[ax,ay],target:[tx,ty],scale} of [
  {box:[170,219,550,190],anchor:[447,323],target:[80,32],scale:.25},
  {box:[1021,92,156,400],anchor:[1100,295],target:[192,80],scale:.37},
  {box:[133,660,572,480],anchor:[420,700],target:[256,8],scale:.1},
  {box:[844,698,348,420],anchor:[1018,728],target:[320,8],scale:.12},
]){
  const dw=Math.round(w*scale),dh=Math.round(h*scale),ox=Math.round(tx+(sx-ax)*scale),oy=Math.round(ty+(sy-ay)*scale);
  for(let y=0;y<dh;y++)for(let x=0;x<dw;x++){
    const value=Buffer.from(pixel(detailSource,sx+Math.floor(x*w/dw),sy+Math.floor(y*h/dh)));value[3]=value[3]>=128?255:0;put(details,ox+x,oy+y,value);
  }
}
await writePNG(resolve(assets,'Windbruch Details v1.png'),details);
console.log('Wind atlas: 512x448, 64px cells; 16 island, 16 road and 16 cliff connections. Props: crystal, floating islet, cloud, wind arch.');
