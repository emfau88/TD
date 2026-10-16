import assert from 'node:assert/strict';
import test from 'node:test';
import { readPNG,pixel } from '../../scripts/pixel-atlas.mjs';
const at=(image,frame,x,y)=>pixel(image,frame%8*64+x,Math.floor(frame/8)*64+y);
test('new terrain atlases have exact matching road, shore, island and cliff connections',async()=>{
  for(const [name,offsets]of [['Spiegelwinter',[4,20]],['Windbruch',[4,20,36]]]){
    const image=await readPNG(new URL(`../../public/assets/${name} Tiles v1.png`,import.meta.url));
    for(const offset of offsets)for(let a=0;a<16;a++)for(let b=0;b<16;b++)for(let p=0;p<64;p++){
      if((a&2)&&(b&8))assert.deepEqual(at(image,offset+a,63,p),at(image,offset+b,0,p),`${name} horizontal join`);
      if((a&4)&&(b&1))assert.deepEqual(at(image,offset+a,p,63),at(image,offset+b,p,0),`${name} vertical join`);
    }
    const props=await readPNG(new URL(`../../public/assets/${name} Sprites v1.png`,import.meta.url));
    assert.equal(props.width,256);assert.equal(props.height,64);
    for(let f=0;f<4;f++){
      let visible=0;for(let y=0;y<64;y++)for(let x=0;x<64;x++){
        const alpha=pixel(props,f*64+x,y)[3];assert.ok(alpha===0||alpha===255);
        if(x===0||x===63||y===0||y===63)assert.equal(alpha,0,'Sprite bleeds into neighboring frame');visible+=alpha?1:0;
      }assert.ok(visible>100,'Empty sprite frame');
    }
  }
  const details=await readPNG(new URL('../../public/assets/Windbruch Details v1.png',import.meta.url));
  assert.equal(details.width,384);assert.equal(details.height,192);
  for(const [sx,sy,w,h]of [[0,0,160,64],[160,0,64,160],[224,0,64,64],[288,0,64,64]]){
    let visible=0;
    for(let y=0;y<h;y++)for(let x=0;x<w;x++){
      const alpha=pixel(details,sx+x,sy+y)[3];assert.ok(alpha===0||alpha===255);
      if(x===0||y===0||x===w-1||y===h-1)assert.equal(alpha,0,'Bridge/rim leaks into another frame');
      visible+=alpha?1:0;
    }assert.ok(visible>100,'Empty bridge/rim frame');
  }
});
