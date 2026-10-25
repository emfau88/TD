import test from 'node:test';
import assert from 'node:assert/strict';
import { CombatEffects } from '../src/combat-effects';
import { groundEffectDepth, projectileDepth, worldEffectDepth } from '../src/world-depth';
import type { Shot } from '../src/battle';
import type Phaser from 'phaser';
import { IlyraView } from '../src/ilyra-view';
import type { IdleBattle } from '../src/battle';

test('real impact and construction sprites sort between back/front towers, not with HUD',()=>{
  const sprites:{depth:number;destroyed?:boolean}[]=[];
  const scene={add:{image(){const sprite={depth:0,setScale(){return this;},setOrigin(){return this;},setDepth(d:number){this.depth=d;return this;},setFrame(){return this;},destroy(){Object.assign(this,{destroyed:true});}};sprites.push(sprite);return sprite;}}};
  const fx=new CombatEffects(scene as unknown as Phaser.Scene);
  for(const kind of [1,2,3,4] as const)fx.accept([{type:'hit',shot:{uid:kind,kind,level:1} as Shot,x:200,y:220}],1);
  for(const sprite of sprites){assert.ok(sprite.depth>180+1001);assert.ok(sprite.depth<260+1000);}
  fx.update(1.1,new Set(),new Set());assert.ok(sprites.every(s=>!s.destroyed));
  fx.update(2,new Set(),new Set());assert.ok(sprites.every(s=>s.destroyed));
  fx.accept([{type:'build',tower:{uid:1,x:200,y:260} as never}],3);
  assert.equal(sprites.at(-1)!.depth,worldEffectDepth(260),'dust uses tower base, not artwork offset');
  assert.ok(groundEffectDepth<1000,'ground telegraphs cannot paint over world sprites');
});
test('projectile height does not put launch behind its own tower, or hit in front of foreground row',()=>{
  const origin={x:100,y:260},target={x:200,y:220};
  const shot={x:100,y:248} as Shot;
  assert.equal(projectileDepth(shot,origin,target),worldEffectDepth(origin.y));
  Object.assign(shot,target);
  assert.equal(projectileDepth(shot,origin,target),worldEffectDepth(target.y));
  assert.ok(projectileDepth(shot,origin,target)<origin.y+1000);
  assert.equal(projectileDepth(shot,undefined,target),worldEffectDepth(target.y),'sold owner remains safe');
});

test('Ilyra separates floor, lifted flight and impact; removing her clears all spell drawing',()=>{
  const graphics:{depth:number;draws:number}[]=[],images:{depth:number;visible:boolean;key:string}[]=[];
  // Separate fluent nodes ensure depths are recorded on the actual renderer objects.
  const make=()=>{const data={depth:0,draws:0};const p=new Proxy(data,{get(t,k){if(k in t)return t[k as keyof typeof t];return (...args:unknown[])=>{if(k==='setDepth')t.depth=Number(args[0]);else if(k==='clear')t.draws=0;else if(['fillCircle','strokeCircle','lineBetween','fillRect'].includes(String(k)))t.draws++;return p;};}});return p;};
  const image=(_x:number,_y:number,key:string)=>{
    const data={depth:0,visible:true,key};
    const p=new Proxy(data,{get(t,k){if(k in t)return t[k as keyof typeof t];return (...args:unknown[])=>{
      if(k==='setDepth')t.depth=Number(args[0]);else if(k==='setVisible')t.visible=Boolean(args[0]);else if(k==='setTexture')t.key=String(args[0]);return p;
    };}});images.push(p);return p;
  };
  const scene={add:{image,ellipse:make,text:make,graphics(){const g=make();graphics.push(g);return g;}}};
  const view=new IlyraView(scene as unknown as Phaser.Scene);
  const b={elapsed:1,ilyra:{x:140,y:350,path:[],direction:'right',volley:{originX:140,originY:350,x:350,y:340,age:.42,hit:false}}} as unknown as IdleBattle;
  view.update(b);
  assert.ok(graphics.some(g=>g.draws&&g.depth===groundEffectDepth));
  const flight=images.filter(i=>i.visible&&i.key==='spell-star-projectile');
  assert.equal(flight.length,27,'nine heads with two trailing sprites each');
  assert.ok(flight.every(g=>g.depth>288+1001&&g.depth<393+1000),'sort by interpolated ground point, not lifted sprite position');
  b.ilyra!.volley!.hit=true;b.ilyra!.volley!.age=.73;view.update(b);
  assert.ok(images.some(g=>g.visible&&g.key==='spell-star-impact'&&g.depth===worldEffectDepth(340)));
  assert.ok(!images.some(g=>g.visible&&g.key==='spell-star-projectile'));
  b.ilyra=undefined as never;view.update(b);assert.ok(graphics.every(g=>g.draws===0));assert.ok(images.every(g=>!g.visible));
});
