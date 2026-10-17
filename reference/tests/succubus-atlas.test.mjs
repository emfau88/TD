import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {readPNG,pixel,blank,put} from '../../scripts/pixel-atlas.mjs';
test('readable succubus export has clean frames, deliberate reuse and visible action changes',async()=>{
  const root=new URL('../../',import.meta.url),atlas=await readPNG(new URL('public/assets/Succubus Pixel v2.png',root));
  const meta=JSON.parse(await readFile(new URL('artifacts/enemies/succubus/production-v2/metadata.json',root),'utf8'));
  assert.deepEqual([atlas.width,atlas.height],[512,576]);assert.equal(meta.palette.length,12);
  const colors=new Set(),tiles=Array.from({length:72},(_,frame)=>{
    const tile=blank(64,64);let opaque=0;
    for(let y=0;y<64;y++)for(let x=0;x<64;x++){
      const value=pixel(atlas,frame%8*64+x,Math.floor(frame/8)*64+y);assert.ok(value[3]===0||value[3]===255);
      if(value[3]){opaque++;colors.add([...value.subarray(0,3)].join(','));assert.ok(x>=2&&x<=61&&y>=2&&y<=61,'Clear border required');}
      put(tile,x,y,value);
    }
    assert.equal(opaque===0,meta.reserved.includes(frame));return tile;
  });
  assert.ok(colors.size<=12);
  for(let dir=0;dir<3;dir++){
    assert.deepEqual(tiles[dir*24].data,tiles[dir*24+1].data,'Idle reuse is deliberate');
    for(const state of ['move','dance','death']){
      const animation=meta.animations[`${state}-${['down','up','side'][dir]}`];
      const hashes=new Set(animation.frames.map(frame=>createHash('sha256').update(tiles[frame].data).digest('hex')));
      assert.equal(hashes.size,animation.frames.length,`${state}: no duplicate poses in an action`);
      assert.equal(animation.durations.length,animation.frames.length);
    }
    for(let n=0;n<8;n++)assert.deepEqual(tiles[dir*24+7+n].data,tiles[7+n].data,'Stage dance faces the audience in every route direction');
    const first=meta.frames.find(frame=>frame.index===dir*24+15),last=meta.frames.find(frame=>frame.index===dir*24+20);
    assert.ok(last.bounds[3]<first.bounds[3]/2,'Death visibly collapses');
  }
  assert.equal(meta.animations['dance-down'].durations.reduce((a,b)=>a+b,0),1520);
});
