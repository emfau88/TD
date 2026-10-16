import assert from 'node:assert/strict';
import test from 'node:test';
import { previewPath } from '../src/style-navigation';
import { CELL, center, type GridPoint } from '../src/data';
import { MARA_FRAMES, MARA_FOOT, MARA_SCALE } from '../src/style-assets';

test('companion routes avoid water/props and never cross diagonally',()=>{
  const obstacles=new Set(['2,1','2,2','2,3']);
  const walkable=(x:number,y:number)=>x>=0&&x<5&&y>=0&&y<5&&!obstacles.has(`${x},${y}`);
  const route=previewPath([1,2],[3,2],walkable)!;
  assert.deepEqual(route[0],center([1,2]));
  assert.deepEqual(route.at(-1),center([3,2]));
  assert.equal(route.length,7);
  for(let i=0;i<route.length;i++){
    assert.ok(walkable(Math.floor(route[i].x/CELL),Math.floor(route[i].y/CELL)));
    if(i)assert.equal(Math.abs(route[i].x-route[i-1].x)+Math.abs(route[i].y-route[i-1].y),CELL);
  }
});

test('blocked targets and diagonally isolated ground reject movement',()=>{
  const walkable=(x:number,y:number)=>x>=0&&x<3&&y>=0&&y<3&&!(x===1&&y===0)&&!(x===0&&y===1);
  assert.equal(previewPath([0,0],[1,0],walkable),undefined);
  assert.equal(previewPath([0,0],[1,1],walkable),undefined);
  assert.deepEqual(previewPath([0,0],[0,0],walkable),[center([0,0])]);
});

test('a changed obstacle recalculates a traversable route from the current cell',()=>{
  const blocked=new Set<string>();
  const walkable=(x:number,y:number)=>x>=0&&x<5&&y>=0&&y<3&&!blocked.has(`${x},${y}`);
  const start:GridPoint=[0,1],end:GridPoint=[4,1];
  assert.equal(previewPath(start,end,walkable)!.length,5);
  blocked.add('2,1');
  const detour=previewPath(start,end,walkable)!;
  assert.equal(detour.length,7);
  assert.ok(detour.every(point=>walkable(Math.floor(point.x/CELL),Math.floor(point.y/CELL))));
});

test('all measured Mara crops fit the shared output frame without clipping effects',()=>{
  assert.equal(MARA_FRAMES.length,16);
  for(const {box:[left,top,right,bottom],foot:[fx,fy]} of MARA_FRAMES){
    assert.ok(left>=0&&top>=0&&right<=1254&&bottom<=1254&&right>left&&bottom>top);
    const x=Math.round(MARA_FOOT[0]+(left-fx)*MARA_SCALE);
    const y=Math.round(MARA_FOOT[1]+(top-fy)*MARA_SCALE);
    assert.ok(x>=0&&y>=0&&x+Math.round((right-left)*MARA_SCALE)<=64&&y+Math.round((bottom-top)*MARA_SCALE)<=64);
  }
  assert.ok(MARA_FRAMES[7].box[0]<3*1254/4,'Left action must include the effect spilling outside its nominal cell');
});
