import type Phaser from 'phaser';

export const MARSH_SOURCE='Laternenmoor Props v1';
// Measured alpha bounds, not the nominal 2x2 grid (the output is 1254px).
// One shared raw-to-runtime scale; feet align at (32,56) in each 64px cell.
export const MARSH_FRAMES=[
  {name:'lantern',box:[217,168,252,459],foot:[300,625]},
  {name:'reeds',box:[765,255,351,382],foot:[940,635]},
  {name:'stump',box:[139,808,460,328],foot:[369,1134]},
  {name:'moss',box:[717,950,439,195],foot:[937,1143]},
];
export function prepareMarshAssets(scene:Phaser.Scene){
  if(scene.textures.exists('marsh-props'))return;
  const texture=scene.textures.createCanvas('marsh-props',256,64)!,ctx=texture.context;
  const source=scene.textures.get(MARSH_SOURCE).getSourceImage() as HTMLImageElement;
  ctx.imageSmoothingEnabled=false;
  MARSH_FRAMES.forEach(({name,box:[x,y,w,h],foot:[fx,fy]},index)=>{
    ctx.drawImage(source,x,y,w,h,index*64+Math.round(32+(x-fx)*.09),Math.round(56+(y-fy)*.09),Math.round(w*.09),Math.round(h*.09));
    texture.add(name,0,index*64,0,64,64);
  });
  const pixels=ctx.getImageData(0,0,256,64);
  for(let i=3;i<pixels.data.length;i+=4)pixels.data[i]=pixels.data[i]>=128?255:0;
  ctx.putImageData(pixels,0,0);texture.refresh();
}
