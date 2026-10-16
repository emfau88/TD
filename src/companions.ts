import { CELL,COLS,ROWS,center,type GridPoint,type HeroID,type MapDef,type Point } from './data';
export type { HeroID } from './data';
export type HeroTarget = {type:'move';col:number;row:number}|{type:'point';col:number;row:number}|{type:'tower';id:number}|{type:'cache';id:string}|{type:'rune';id:string}|{type:'station';id:string};
export type Hero = Point & {
  id:HeroID; state:'idle'|'move'|'action'|'celebrate'; direction:'up'|'down'|'side'; flip:boolean;
  path:Point[]; target:HeroTarget|null; cooldown:number; actionRemaining:number; actionDuration:number;
};
export type Objective = Point & { id:string;kind:'cache'|'rune'|'station';col:number;row:number;completed:boolean;required:boolean;reward:number;label:string;cooldown:number;activeRemaining:number;uses:number };
export const HERO_DEFS:Record<HeroID,{name:string;role:string;ability:string;description:string;cooldown:number;color:number}>={
  wisp:{name:'Wisp',role:'Baumeister',ability:'Panikmanöver',description:'Am Ziel: Gegner im Umkreis 5 Sekunden ablenken. Sammelt Kisten und aktiviert Runen besonders schnell.',cooldown:22,color:0xbce889},
  mara:{name:'Mara',role:'Tüftlerin',ability:'Übertakten',description:'Läuft zum gewählten Turm und erhöht seine Feuerrate für 8 Sekunden um 50 %.',cooldown:30,color:0xffb77d},
  runa:{name:'Runa',role:'Moorhexe',ability:'Nebelschleier',description:'Läuft zum Ziel und verlangsamt Gegner in einem großen Umkreis 6 Sekunden lang.',cooldown:25,color:0xa6dddc},
  ilyra:{name:'Ilyra',role:'Himmelsritterin',ability:'Sternensalve',description:'Läuft zum Ziel und trifft alle nahen Gegner; Fluggegner erleiden doppelten Schaden.',cooldown:28,color:0xd6d3ff},
};
const cell=(point:Point):GridPoint=>[Math.floor(point.x/CELL),Math.floor(point.y/CELL)];
const key=([col,row]:GridPoint)=>`${col},${row}`;

/** Four-neighbour navigation avoids diagonal corner-cutting across water and void. */
export function findHeroPath(start:GridPoint,destination:GridPoint,walkable:(col:number,row:number)=>boolean):GridPoint[]|undefined{
  if(!destination.every(Number.isInteger)||!walkable(...destination))return;
  const startKey=key(start),endKey=key(destination);
  if(startKey===endKey)return [];
  const queue:GridPoint[]=[start],parents=new Map<string,string|null>([[startKey,null]]);
  for(let index=0;index<queue.length;index++){
    const [col,row]=queue[index];
    for(const next of [[col+1,row],[col,row+1],[col-1,row],[col,row-1]] as GridPoint[]){
      const nextKey=key(next);if(parents.has(nextKey)||!walkable(...next))continue;
      parents.set(nextKey,`${col},${row}`);
      if(nextKey===endKey){const route:GridPoint[]=[];let cursor:string|null=nextKey;while(cursor&&cursor!==startKey){route.push(cursor.split(',').map(Number) as GridPoint);cursor=parents.get(cursor)??null;}return route.reverse();}
      queue.push(next);
    }
  }
}

export interface CompanionHost {
  map:MapDef; phase:string; heroes:Hero[];objectives:Objective[];
  towers:{uid:number;col:number;row:number;x:number;y:number}[];
  canWalk(col:number,row:number):boolean;
  performHeroAction(hero:Hero,target:Exclude<HeroTarget,{type:'move'|'point'}>|{type:'point';col:number;row:number}):boolean;
  heroEvent(type:'hero-command'|'hero-action',hero:Hero):void;
}

export function createHeroes(map:MapDef,ids:HeroID[],walkable:(col:number,row:number)=>boolean):Hero[]{
  const goal=map.goal??[25,8];
  const candidates:GridPoint[]=[];
  for(let row=1;row<ROWS-1;row++)for(let col=1;col<COLS-1;col++)if(walkable(col,row)&&Math.hypot(col-goal[0],row-goal[1])>=1.8&&!map.objectives?.some(objective=>objective.at[0]===col&&objective.at[1]===row))candidates.push([col,row]);
  const chosen:GridPoint[]=[];
  return ids.map((id,index)=>{
    const preferred:GridPoint=index===1&&goal[0]+2>COLS-2?[goal[0]-1,goal[1]+2]:[goal[0]+(index===0?-2:2),goal[1]];
    candidates.sort((a,b)=>Math.hypot(a[0]-preferred[0],a[1]-preferred[1])-Math.hypot(b[0]-preferred[0],b[1]-preferred[1]));
    const destination=candidates.find(candidate=>chosen.every(other=>Math.hypot(candidate[0]-other[0],candidate[1]-other[1])>=1.5))??candidates[index]??[25,8];chosen.push(destination);
    return {...center(destination),id,state:'idle',direction:'down',flip:false,path:[],target:null,cooldown:0,actionRemaining:0,actionDuration:0};
  });
}

function targetPoint(host:CompanionHost,target:HeroTarget):GridPoint|undefined{
  if(target.type==='move'||target.type==='point')return [target.col,target.row];
  if(target.type==='tower'){const tower=host.towers.find(tower=>tower.uid===target.id);return tower&&[tower.col,tower.row];}
  const objective=host.objectives.find(objective=>objective.id===target.id&&!objective.completed&&objective.kind===target.type);
  return objective&&[objective.col,objective.row];
}

function approach(host:CompanionHost,hero:Hero,target:HeroTarget):GridPoint[]|undefined{
  const location=targetPoint(host,target);if(!location)return;
  const exact=target.type==='move'||target.type==='point';
  const candidates:GridPoint[]=exact?[location]:[[location[0]-1,location[1]],[location[0]+1,location[1]],[location[0],location[1]-1],[location[0],location[1]+1]];
  const routes=candidates.map(destination=>findHeroPath(cell(hero),destination,(col,row)=>host.canWalk(col,row))).filter((route):route is GridPoint[]=>route!==undefined);
  return routes.sort((a,b)=>a.length-b.length)[0];
}

export function commandCompanion(host:CompanionHost,id:HeroID,target:HeroTarget):boolean{
  if(host.phase==='victory'||host.phase==='defeat')return false;
  const hero=host.heroes.find(hero=>hero.id===id);if(!hero)return false;
  if((target.type==='tower'||target.type==='point')&&(host.phase!=='wave'||hero.cooldown>0))return false;
  if(target.type==='tower'&&id!=='mara')return false;
  if(target.type==='point'&&id==='mara')return false;
  if(target.type==='station'&&(host.phase!=='wave'||!host.objectives.some(objective=>objective.id===target.id&&objective.kind==='station'&&objective.cooldown===0)))return false;
  const route=approach(host,hero,target);if(!route)return false;
  hero.path=route.map(center);hero.target=target;hero.state=hero.path.length?'move':'action';hero.actionRemaining=0;hero.actionDuration=0;
  host.heroEvent('hero-command',hero);return true;
}

export function updateCompanions(host:CompanionHost,dt:number){
  for(const hero of host.heroes){
    if(host.phase==='victory'||host.phase==='defeat')break;
    hero.cooldown=Math.max(0,hero.cooldown-dt);
    if(!hero.target){hero.state='idle';continue;}
    if((hero.target.type==='tower'||hero.target.type==='point'||hero.target.type==='station')&&host.phase!=='wave'){hero.target=null;hero.path=[];hero.state='idle';continue;}
    const location=targetPoint(host,hero.target);
    if(!location){hero.target=null;hero.path=[];hero.state='idle';continue;}
    if(hero.path.length){
      if(!host.canWalk(...cell(hero.path[0]))){const replacement=approach(host,hero,hero.target);if(!replacement){hero.target=null;hero.path=[];hero.state='idle';continue;}hero.path=replacement.map(center);}
      let movement=dt*(hero.id==='wisp'?126:hero.id==='ilyra'?120:112);
      while(movement>0&&hero.path.length){
        const next=hero.path[0],dx=next.x-hero.x,dy=next.y-hero.y,distance=Math.hypot(dx,dy),step=Math.min(movement,distance);
        hero.direction=Math.abs(dx)>Math.abs(dy)?'side':dy>=0?'down':'up';hero.flip=dx<0;
        if(distance>0){hero.x+=dx/distance*step;hero.y+=dy/distance*step;}
        movement-=step;if(distance<=step+.001)hero.path.shift();
      }
      hero.state=hero.path.length?'move':'action';
      if(hero.path.length)continue;
    }
    if(hero.target.type==='move'){hero.target=null;hero.state='idle';continue;}
    hero.state='action';
    if(!hero.actionDuration){hero.actionDuration=hero.target.type==='rune'?(hero.id==='wisp'?1.5:2.5):hero.target.type==='station'?1.2:hero.target.type==='cache'?.65:.45;hero.actionRemaining=hero.actionDuration;}
    hero.actionRemaining=Math.max(0,hero.actionRemaining-dt);
    if(hero.actionRemaining>0)continue;
    const target=hero.target;
    host.performHeroAction(hero,target);
    hero.target=null;hero.path=[];hero.state=host.phase==='victory'?'celebrate':'idle';hero.actionDuration=0;
  }
}
