import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFile} from 'node:fs/promises';
import {readPNG,pixel,blank,put} from '../../scripts/pixel-atlas.mjs';

test('jelly export has clean frames, distinct action poses and preserves the approved side loop',async()=>{
  const base=new URL('../../',import.meta.url),atlas=await readPNG(new URL('public/assets/Lantern Jelly Pixel v1.png',base));
  const approved=await readPNG(new URL('public/assets/Lantern Jelly Pixel Preview v1.png',base));
  const metadata=JSON.parse(await readFile(new URL('artifacts/enemies/lantern-jelly/v1/complete-metadata.json',base),'utf8'));
  assert.deepEqual([atlas.width,atlas.height],[512,384]);
  const images=Array.from({length:48},(_,index)=>{const tile=blank(64,64),ox=index%8*64,oy=Math.floor(index/8)*64;
    for(let y=0;y<64;y++)for(let x=0;x<64;x++){
      const value=pixel(atlas,ox+x,oy+y);assert.ok(value[3]===0||value[3]===255,'Alpha must be binary');
      if(x<2||y<2||x>61||y>61)assert.equal(value[3],0,'Clear gutter around every frame');
      put(tile,x,y,value);
    }return tile;
  });
  for(let dir=0;dir<3;dir++){
    assert.deepEqual(images[dir*16].data,images[dir*16+1].data,'Idle reuses the approved movement pose');
    for(const [start,count]of [[1,6],[7,4],[11,5]]){
      const hashes=new Set(images.slice(dir*16+start,dir*16+start+count).map(tile=>createHash('sha256').update(tile.data).digest('hex')));
      assert.equal(hashes.size,count,'Each action contains different body poses');
    }
    assert.ok(metadata.frames[dir*16+15].bounds[3]<metadata.frames[dir*16+11].bounds[3]/2,'Death visibly collapses');
  }
  for(let frame=0;frame<6;frame++)for(let y=0;y<64;y++)for(let x=0;x<64;x++)assert.deepEqual(pixel(images[33+frame],x,y),pixel(approved,frame*64+x,y),'Approved side animation changes unexpectedly');
  assert.equal(Object.keys(metadata.animations).length,12);
  for(const animation of Object.values(metadata.animations))for(const frame of animation.frames)assert.ok(Number.isInteger(frame)&&frame>=0&&frame<48);
});
