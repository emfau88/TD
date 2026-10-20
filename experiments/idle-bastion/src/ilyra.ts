/** Idle-owned movement and saved volley timing. No rendering or reward logic. */
import { cellCenter, findFootpath, isWalkableCell, type GridCell, type IdleLayout, type WorldPoint } from './layout';
export const ILYRA = Object.freeze({ speed: 110, range: 210, radius: 72, cooldown: 28, windup: .18, impact: .6, duration: .95, volleyPace: 1.35 as const, airMultiplier: 1.5 });
/** age uses the original animation clock; pace stretches real time. Legacy volleys omit it. */
export interface IlyraVolley { x:number; y:number; originX:number; originY:number; age:number; pace?:1.35; damage:number; sourceKind:1|2|3|4; sourceLevel:number; hit:boolean }
export interface IlyraState extends WorldPoint {
 x:number; y:number; path:WorldPoint[]; direction:'down'|'right'|'up'|'left';
 cooldown:number; autoCast:boolean; introduction:'move'|'cast'|'done'; volley:IlyraVolley|null;
}
export const cloneIlyra = (state:IlyraState):IlyraState => structuredClone(state);
export const ilyraCell = (p:WorldPoint):GridCell => ({x:Math.floor(p.x/40),y:Math.floor(p.y/40)});
const key=(p:GridCell)=>`${p.x},${p.y}`;
export function createIlyra(layout:IdleLayout):IlyraState {
 const entrance=layout.plots.find(p=>p.id==='tavern')!.entrance;
 return {...cellCenter(layout,entrance),path:[],direction:'down',cooldown:0,autoCast:false,introduction:'move',volley:null};
}
export function moveIlyra(state:IlyraState,to:GridCell,layout:IdleLayout,blocked:readonly GridCell[]):boolean {
 if(state.volley)return false;
 const route=findFootpath(layout,ilyraCell(state),to,blocked);if(!route)return false;
 state.path=route.map(c=>cellCenter(layout,c));
 if(Math.hypot(state.path[0].x-state.x,state.path[0].y-state.y)<1e-6)state.path.shift();
 if(state.introduction==='move')state.introduction='cast';return true;
}
export function stepIlyraMotion(state:IlyraState,dt:number):void {
 state.cooldown=Math.max(0,state.cooldown-dt);if(state.volley)return;
 let travel=dt*ILYRA.speed;
 while(state.path.length&&travel>0){
  const p=state.path[0],dx=p.x-state.x,dy=p.y-state.y,gap=Math.hypot(dx,dy),step=Math.min(travel,gap);
  if(gap>1e-9){state.direction=Math.abs(dx)>Math.abs(dy)?dx<0?'left':'right':dy<0?'up':'down';state.x+=dx/gap*step;state.y+=dy/gap*step;}
  travel-=step;if(gap<=step+1e-9)state.path.shift();
 }
}
export function ilyraFrame(state:IlyraState,time:number):number {
 const row=['down','right','up','left'].indexOf(state.direction)*8,age=state.volley?.age;
 if(age!==undefined&&age<.52)return row+(age<.18?5:age<.32?6:7);
 return row+(state.path.length?1+Math.floor(time*8)%4:0);
}
const number=(v:unknown,min:number,max:number):v is number=>typeof v==='number'&&Number.isFinite(v)&&v>=min&&v<=max;
export function validIlyra(value:unknown,layout:IdleLayout,blocked:readonly GridCell[],damageFor:(kind:1|2|3|4,level:number)=>number):boolean {
 if(!value||typeof value!=='object'||Array.isArray(value))return false;
 const s=value as IlyraState;
 if(!number(s.x,0,layout.bounds.width-1)||!number(s.y,0,layout.bounds.height-1)||!Array.isArray(s.path)||s.path.length>640
  ||!['down','right','up','left'].includes(s.direction)||!number(s.cooldown,0,ILYRA.cooldown)||typeof s.autoCast!=='boolean'
  ||!['move','cast','done'].includes(s.introduction)||s.autoCast&&s.introduction!=='done')return false;
 const solids=new Set(blocked.map(key)),walk=(p:WorldPoint)=>isWalkableCell(layout,ilyraCell(p))&&!solids.has(key(ilyraCell(p)));
 if(!walk(s))return false;const centre=cellCenter(layout,ilyraCell(s));
 if(Math.abs(s.x-centre.x)>1e-6&&Math.abs(s.y-centre.y)>1e-6)return false;
 let previous:WorldPoint=s;const visited=new Set<string>();
 for(const p of s.path){
  if(!p||!number(p.x,0,layout.bounds.width-1)||!number(p.y,0,layout.bounds.height-1)||!walk(p))return false;
  const c=cellCenter(layout,ilyraCell(p)),dx=Math.abs(p.x-previous.x),dy=Math.abs(p.y-previous.y),k=key(ilyraCell(p));
  if(Math.hypot(p.x-c.x,p.y-c.y)>1e-6||visited.has(k)||(dx>1e-6&&dy>1e-6)||dx+dy>40+1e-6)return false;
  visited.add(k);previous=p;
 }
 if(s.volley!==null){
  const v=s.volley;if(!v||typeof v!=='object'||!number(v.x,0,layout.bounds.width-1)||!number(v.y,0,layout.bounds.height-1)
   ||!number(v.originX,0,layout.bounds.width-1)||!number(v.originY,0,layout.bounds.height-1)||!number(v.age,0,ILYRA.duration)
   ||(v.pace!==undefined&&v.pace!==ILYRA.volleyPace)||![1,2,3,4].includes(v.sourceKind)||!Number.isInteger(v.sourceLevel)||v.sourceLevel<1||v.sourceLevel>20
   ||v.damage!==damageFor(v.sourceKind,v.sourceLevel)||typeof v.hit!=='boolean'||v.hit!==(v.age>=ILYRA.impact)
   ||Math.hypot(v.x-v.originX,v.y-v.originY)>ILYRA.range+1e-6||Math.hypot(v.originX-s.x,v.originY-s.y)>1e-6
   ||s.introduction==='move'||s.cooldown<ILYRA.cooldown-v.age*(v.pace??1)-1e-5)return false;
 }
 return true;
}
