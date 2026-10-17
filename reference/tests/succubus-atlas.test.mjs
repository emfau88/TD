import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {readPNG,pixel,blank,put} from '../../scripts/pixel-atlas.mjs';
test('readable succubus export has clean frames, deliberate reuse and visible action changes',async()=>{
  const root=new URL('../../',import.meta.url),atlas=await readPNG(new URL('public/assets/Succubus Pixel v2.png',root));
  const meta=JSON.parse(await readFile(new URL('artifacts/enemies/succubus/production-v3/metadata.json',root),'utf8'));
  const previous=await readPNG(new URL('artifacts/enemies/succubus/production-v2/runtime-atlas.png',root));
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
  for(let frame=0;frame<72;frame++){
    if(frame<5||frame>=24&&frame<29)continue;
    for(let y=0;y<64;y++)for(let x=0;x<64;x++)assert.deepEqual(pixel(atlas,frame%8*64+x,Math.floor(frame/8)*64+y),pixel(previous,frame%8*64+x,Math.floor(frame/8)*64+y),'Existing side walk, body dance and death must remain unchanged');
  }
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

test('dance portrait uses eight clean, distinct 128px frames with genuinely finer detail',async()=>{
  const root=new URL('../../',import.meta.url);
  const atlas=await readPNG(new URL('public/assets/Succubus Dance HD v1.png',root));
  const body=await readPNG(new URL('public/assets/Succubus Pixel v2.png',root));
  const meta=JSON.parse(await readFile(new URL('artifacts/enemies/succubus/production-v3/dance-hd-metadata.json',root),'utf8'));
  assert.deepEqual([atlas.width,atlas.height],[1024,128]);
  assert.deepEqual(meta.cell,[128,128]);assert.deepEqual(meta.foot,[64,112]);
  assert.equal(meta.frames.length,8);assert.equal(meta.palette.length,33);
  assert.equal(meta.frameMs,190);assert.equal(meta.cycleMs,1520);
  assert.equal(meta.frameMs*meta.frames.length,meta.cycleMs);
  const allowed=new Set(meta.palette.map(hex=>hex.slice(1).match(/../g).map(value=>parseInt(value,16)).join(',')));
  const colors=new Set(),hashes=new Set();
  for(let frame=0;frame<8;frame++){
    const tile=blank(128,128);let left=128,top=128,right=-1,bottom=-1;
    for(let y=0;y<128;y++)for(let x=0;x<128;x++){
      const value=pixel(atlas,frame*128+x,y);
      assert.ok(value[3]===0||value[3]===255,'Portrait alpha must stay crisp');
      if(value[3]){
        const color=[...value.subarray(0,3)].join(',');
        colors.add(color);assert.ok(allowed.has(color),'Portrait uses only its declared palette');
        assert.ok(x>=4&&x<=123&&y>=4&&y<=123,'Each portrait pose needs a clear border');
        left=Math.min(left,x);top=Math.min(top,y);right=Math.max(right,x);bottom=Math.max(bottom,y);
      }
      put(tile,x,y,value);
    }
    assert.deepEqual(meta.frames[frame],{index:frame,bounds:[left,top,right-left+1,bottom-top+1]});
    assert.ok(bottom-top+1>85,'Portrait must contain more source pixels, not merely enlarge the world body');
    hashes.add(createHash('sha256').update(tile.data).digest('hex'));
    let bodyTop=64,bodyBottom=-1;
    for(let y=0;y<64;y++)for(let x=0;x<64;x++)if(pixel(body,(frame+7)%8*64+x,Math.floor((frame+7)/8)*64+y)[3]){
      bodyTop=Math.min(bodyTop,y);bodyBottom=Math.max(bodyBottom,y);
    }
    assert.ok(bodyBottom-bodyTop+1<50,'The world body retains its compact, readable pixel scale');
  }
  assert.equal(hashes.size,8,'Every portrait frame must show a different pose');
  assert.ok(colors.size>12&&colors.size<=33,'The portrait has richer detail than the twelve-color world body');
});
