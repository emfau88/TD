import type Phaser from 'phaser';

export const MARA_SCALE = 1 / 7;
export const MARA_FOOT = [32, 56] as const;
// Measured object bounds and boot centres from the existing 1254px source.
// In particular, the left-facing action extends across the former grid split.
export const MARA_FRAMES = [
  {box:[85,27,276,296],foot:[167,293]}, {box:[395,27,583,305],foot:[486,302]},
  {box:[698,24,884,302],foot:[789,299]}, {box:[995,20,1235,300],foot:[1075.5,293]},
  {box:[81,331,251,610],foot:[165.5,607]}, {box:[407,329,569,605],foot:[467.5,602]},
  {box:[717,331,874,599],foot:[788.5,596]}, {box:[927,330,1210,611],foot:[1106.5,602]},
  {box:[89,644,257,926],foot:[177,923]}, {box:[397,640,551,918],foot:[486.5,915]},
  {box:[696,642,865,914],foot:[789,911]}, {box:[978,638,1250,930],foot:[1070,920]},
  {box:[71,952,253,1223],foot:[175.5,1220]}, {box:[405,957,567,1230],foot:[494.5,1227]},
  {box:[715,956,862,1224],foot:[782.5,1221]}, {box:[1005,938,1220,1232],foot:[1081,1227]},
];

export function prepareStyleAssets(scene: Phaser.Scene) {
  if (!scene.textures.exists('style-mara')) {
    const texture = scene.textures.createCanvas('style-mara',256,256)!;
    const ctx=texture.context,source=scene.textures.get('Mara style source').getSourceImage() as HTMLImageElement;
    ctx.imageSmoothingEnabled=false;
    MARA_FRAMES.forEach(({box:[left,top,right,bottom],foot:[fx,fy]},index)=>{
      const col=index%4,row=Math.floor(index/4);
      ctx.drawImage(source,left,top,right-left,bottom-top,
        col*64+Math.round(MARA_FOOT[0]+(left-fx)*MARA_SCALE),
        row*64+Math.round(MARA_FOOT[1]+(top-fy)*MARA_SCALE),
        Math.round((right-left)*MARA_SCALE),Math.round((bottom-top)*MARA_SCALE));
      texture.add(index,0,col*64,row*64,64,64);
    });
    // Generated semi-transparent fringes become a clear pixel silhouette.
    const pixels=ctx.getImageData(0,0,256,256);
    for(let i=3;i<pixels.data.length;i+=4)pixels.data[i]=pixels.data[i]>=128?255:0;
    ctx.putImageData(pixels,0,0);texture.refresh();
  }
  for(const [row,direction] of ['down','left','right','up'].entries()) {
    for(const [action,frames,rate] of [
      ['idle',[row*4],1], ['walk',[row*4+1,row*4,row*4+2,row*4],7], ['action',[row*4+3],1],
    ] as const){
      const key=`style-mara-${direction}-${action}`;
      if(!scene.anims.exists(key))scene.anims.create({key,frames:frames.map(frame=>({key:'style-mara',frame})),frameRate:rate,repeat:-1});
    }
  }
  for(const [row,direction] of ['down','side','up'].entries()){
    const key=`style-wisp-${direction}`;
    if(!scene.anims.exists(key))scene.anims.create({key,frames:Array.from({length:9},(_,i)=>({key:'Wisp - Animations',frame:row*9+i})),frameRate:10,repeat:-1});
    const action=`style-wisp-${direction}-action`;
    if(!scene.anims.exists(action))scene.anims.create({key:action,frames:Array.from({length:9},(_,i)=>({key:'Wisp - Animations',frame:(row+3)*9+i})),frameRate:10,repeat:-1});
  }
}
