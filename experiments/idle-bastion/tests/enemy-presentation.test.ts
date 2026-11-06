import test from 'node:test';
import assert from 'node:assert/strict';
import { IdleBattle, type Enemy, type Shot, type BattleEvent } from '../src/battle';
import { ENEMIES, type EnemyId } from '../src/enemy-roster';
import { ENEMY_SHEETS } from '../src/enemy-art';
import { cellCenter, createIdleLayout } from '../src/layout';
import { enemyPresentation, presentedTarget, presentedShot, chainSource } from '../src/enemy-presentation';
import { CombatEffects } from '../src/combat-effects';
import { worldEffectDepth } from '../src/world-depth';

const enemy = (id: EnemyId, uid = 5): Enemy => ({uid,def:ENEMIES[id],x:140,y:220,hp:20,maxHp:50,
  distance:120,total:1800,segment:0,speed:ENEMIES[id].speed,slowRemaining:0,direction:'side',flip:false,
  healCooldown:0,healRemaining:0,healLockout:0});

test('small stable offsets stay in all shipped roads and converge smoothly before every bend', () => {
  for (const version of [1,2,3,4,5] as const) {
    const layout=createIdleLayout({version});
    for (const id of Object.keys(ENEMIES) as EnemyId[]) for (let segment=0;segment<layout.road.waypoints.length-1;segment++) {
      const a=cellCenter(layout,layout.road.waypoints[segment]),b=cellCenter(layout,layout.road.waypoints[segment+1]);
      const length=Math.hypot(b.x-a.x,b.y-a.y);
      for (const uid of [3,4,5]) for (const d of [0,.001,12,24,36,length/2,length-24,length-.001,length]) {
        const e={...enemy(id,uid),segment,x:a.x+(b.x-a.x)*d/length,y:a.y+(b.y-a.y)*d/length};
        const p=enemyPresentation(e,layout,12.3),offset=Math.hypot(p.groundX-e.x,p.groundY-e.y);
        assert.ok(offset<=3+1e-9);
        assert.ok(layout.road.cells.some(c=>Math.abs(p.groundX-(c.x+.5)*40)<=20 && Math.abs(p.groundY-(c.y+.5)*40)<=20));
        if(d<=24 || length-d<=24 || id==='Rosenspiegel' || id.startsWith('Obsidian')) assert.equal(offset,0);
        assert.deepEqual(enemyPresentation(e,layout,12.3),p,'pause/reload needs no renderer history');
      }
    }
  }
  const layout=createIdleLayout({version:5}),e=enemy('Firebug');
  assert.equal(enemyPresentation(e,layout,0).groundY,223);
  const narrow={...e,segment:3,x:620,y:300,direction:'down' as const};
  assert.equal(enemyPresentation(narrow,layout,0).groundX,narrow.x,'wide beetle gets no extra displacement on vertical road');
  assert.equal(ENEMY_SHEETS.Firebug.scale/.83,.8,'uniform 20% reduction');
});

test('flight rises by 2.8 world pixels and projectiles end at displayed targets, including sold owners and worm body hits', () => {
  const layout=createIdleLayout({version:5}),e=enemy('FloatingEye');
  for(const elapsed of [0,.2,2,50]) {
    const p=enemyPresentation(e,layout,elapsed),old=7+Math.sin(elapsed*5+e.uid)*1.5;
    assert.ok(Math.abs(p.lift-old-2.8)<1e-9);
    const target=presentedTarget(e,e,p),shot={x:e.x,y:e.y} as Shot;
    assert.deepEqual(presentedShot(shot,e,target,{x:40,y:200}),target);
    assert.deepEqual(presentedShot(shot,e,target),target);
    assert.deepEqual(presentedShot({x:40,y:200} as Shot,e,target,{x:40,y:200}),{x:40,y:200});
  }
  const worm=enemy('ObsidianWorm'),point={x:100,y:220};
  assert.deepEqual(presentedTarget(worm,point,enemyPresentation(worm,layout,5)),point);
});

test('projected hit and chain effects keep ground depth and never mutate enemies, event payloads or saved battles', () => {
  const b=IdleBattle.newGame(),e=enemy('FloatingEye'),next=enemy('FlameWisp',6);
  const present=(x:Enemy)=>enemyPresentation(x,b.layout,b.elapsed),p=present(e),q=present(next);
  const shot={uid:100,towerUid:1,target:e.uid,x:e.x,y:e.y,kind:5,level:1,chainHits:[],damage:10,speed:200} as Shot;
  const events:BattleEvent[]=[{type:'hit',enemy:e,shot,x:e.x,y:e.y},{type:'fire',enemy:next,shot:{...shot,target:next.uid,chainHits:[e.uid]},x:e.x,y:e.y}];
  const initial=structuredClone(events),save=b.snapshot(),images:any[]=[],lines:any[]=[];
  const scene={add:{image:(x:number,y:number)=>{const i={x,y,depth:0,setScale(){return this;},setOrigin(){return this;},setDepth(d:number){this.depth=d;return this;},setFrame(){return this;},destroy(){}};images.push(i);return i;},
    graphics:()=>{const g={points:[] as number[][],setDepth(){return this;},lineStyle(){return this;},beginPath(){return this;},moveTo(x:number,y:number){this.points.push([x,y]);return this;},lineTo(x:number,y:number){this.points.push([x,y]);return this;},strokePath(){return this;},destroy(){}};lines.push(g);return g;}}};
  const fx=new CombatEffects(scene as never,present);fx.accept(events,0);
  assert.deepEqual([images[0].x,images[0].y,images[0].depth],[p.x,p.y,worldEffectDepth(p.groundY)]);
  assert.deepEqual(lines[0].points[0],[p.x,p.y]);assert.deepEqual(lines[0].points.at(-1),[q.x,q.y]);
  assert.equal(chainSource(events[1],events),e);
  assert.deepEqual(events,initial);assert.deepEqual(b.snapshot(),save);fx.destroy();
});
