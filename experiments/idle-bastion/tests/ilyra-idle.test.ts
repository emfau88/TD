import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import type Phaser from 'phaser';
import { IlyraIdle, ILYRA_IDLE } from '../src/ilyra-idle';
import { IlyraView } from '../src/ilyra-view';
import { ilyraFrame, type IlyraState } from '../src/ilyra';
import type { IdleBattle } from '../src/battle';
import { KEYS } from '../src/art';
import clip from '../assets/ilyra/idle-spear/clip.json';

const actor = (): IlyraState => ({x:140,y:350,path:[],direction:'down',cooldown:0,autoCast:false,introduction:'done',volley:null});

test('approved 33-frame spear clip retains its atlas, timing and shared foot anchor', () => {
  const png = readFileSync(new URL('../assets/ilyra/idle-spear/atlas.png', import.meta.url));
  assert.equal(createHash('sha256').update(png).digest('hex'), clip.atlasSha256);
  assert.deepEqual([png.readUInt32BE(16), png.readUInt32BE(20)], [512,320]);
  assert.deepEqual(clip.foot,[32,56]); assert.deepEqual(clip.frameSize,[64,64]);
  assert.equal(clip.durationsMs.length,33);
  assert.equal(clip.durationsMs.reduce((a,b)=>a+b,0),3920);
  const idle = new IlyraIdle(), s=actor(); idle.pose(s,0);
  let cursor=ILYRA_IDLE.waitMs+ILYRA_IDLE.turnMs;
  for (const [frame,duration] of clip.durationsMs.entries()) {
    assert.deepEqual(idle.pose(s,(cursor+duration/2)/1000),{dance:true,frame});
    cursor+=duration;
  }
  assert.equal(idle.pose(s,(cursor+ILYRA_IDLE.turnMs)/1000),undefined);
});

test('idle waits, rests between performances, freezes with battle time and does not mutate any facing', () => {
  for (const direction of ['down','right','up','left'] as const) {
    const idle=new IlyraIdle(),s={...actor(),direction},before=structuredClone(s);
    assert.equal(idle.pose(s,100),undefined);
    assert.equal(idle.pose(s,107.999),undefined);
    const pose=idle.pose(s,109.4); assert.equal(pose?.dance,true);
    for(let n=0;n<90;n++)assert.deepEqual(idle.pose(s,109.4),pose,'pause cannot advance on render frames');
    assert.equal(idle.pose(s,113),undefined);
    assert.equal(idle.pose(s,131.999),undefined);
    assert.equal(idle.pose(s,133.4)?.dance,true);
    assert.deepEqual(s,before);
  }
});

test('movement, cast, reduced motion, introduction, removal and clock rollback interrupt immediately', () => {
  for (const change of ['move','cast','reduce','intro','remove','rollback'] as const) {
    const s=actor(),idle=new IlyraIdle();idle.pose(s,0);assert.equal(idle.pose(s,9.4)?.dance,true);
    if(change==='move')s.path=[{x:180,y:350}];
    if(change==='cast')s.volley={x:180,y:350,originX:s.x,originY:s.y,age:0,damage:1,sourceKind:1,sourceLevel:1,hit:false};
    if(change==='intro')s.introduction='move';
    assert.equal(idle.pose(change==='remove'?undefined:s,change==='rollback'?1:9.5,change==='reduce'),undefined);
    s.path=[];s.volley=null;s.introduction='done';
    assert.equal(idle.pose(s,change==='rollback'?2:10),undefined,'a fresh quiet interval is required');
  }
  const fresh=new IlyraIdle();assert.equal(fresh.pose(actor(),12345),undefined,'reload never resumes an old visual cycle');
});

test('real renderer swaps to the spear atlas and restores walking immediately without moving the actor', () => {
  const nodes: any[]=[];
  const make=(key='')=>{
    const data:any={texture:{key},frame:0,x:0,y:0,visible:true};
    const node=new Proxy(data,{get(t,k){if(k in t)return t[k];return (...args:any[])=>{
      if(k==='setTexture')t.texture={key:args[0]};
      if(k==='setFrame')t.frame=args[0];
      if(k==='setPosition'){t.x=args[0];t.y=args[1];}
      if(k==='setVisible')t.visible=args[0];
      return node;
    };}});nodes.push(node);return node;
  };
  const scene={add:{image:(_x:number,_y:number,key:string)=>make(key),ellipse:()=>make(),text:()=>make(),graphics:()=>make()}};
  const view=new IlyraView(scene as unknown as Phaser.Scene),s=actor();
  const b={elapsed:0,ilyra:s} as IdleBattle;view.update(b);
  b.elapsed=9.4;view.update(b);const sprite=nodes[0];
  assert.equal(sprite.texture.key,KEYS.ilyraIdle);assert.ok(sprite.frame>0);
  assert.deepEqual([sprite.x,sprite.y],[s.x,s.y]);
  const frame=sprite.frame;view.update(b);assert.equal(sprite.frame,frame);
  s.path=[{x:180,y:350}];s.direction='right';view.update(b);
  assert.equal(sprite.texture.key,KEYS.ilyra);assert.equal(sprite.frame,ilyraFrame(s,b.elapsed));
  b.ilyra=null;view.update(b);assert.equal(sprite.visible,false);view.destroy();
});
