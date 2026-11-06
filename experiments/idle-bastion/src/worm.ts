import type { EnemyDef } from './enemy-roster';

export type WormId = 'ObsidianWormYoung' | 'ObsidianWorm';
export const isWorm = (id: string): id is WormId => id === 'ObsidianWormYoung' || id === 'ObsidianWorm';
export const wormEncounter = (wave: number, recipe = 20): WormId | undefined => recipe < 20 ? undefined
  : wave === 36 ? 'ObsidianWormYoung' : wave === 45 ? 'ObsidianWorm' : undefined;
export const WORM = Object.freeze({ scale: .83, spacing: 13.5, headSpacing: 12.5 });
export const wormSegments = (id: WormId): number => id === 'ObsidianWormYoung' ? 15 : 30;
export interface Point { x: number; y: number }
interface Body { def: EnemyDef; hp: number; maxHp: number; distance: number; x: number; y: number }
export interface WormNode extends Point { index: number; angle: number; kind: 'head' | 'body' | 'tail' }
const paths = new WeakMap<readonly Point[], readonly number[]>();
function cumulative(path: readonly Point[]): readonly number[] {
  let result=paths.get(path);if(result)return result;
  const lengths=[0];for(let i=1;i<path.length;i++)lengths.push(lengths[i-1]+Math.hypot(path[i].x-path[i-1].x,path[i].y-path[i-1].y));
  paths.set(path,lengths);return lengths;
}
function pointAt(path: readonly Point[], lengths: readonly number[], distance: number): Point {
  const d=Math.max(0,Math.min(lengths.at(-1)!,distance));
  let i=1;while(i<path.length-1&&lengths[i]<d)i++;
  const t=(d-lengths[i-1])/(lengths[i]-lengths[i-1]);
  return{x:path[i-1].x+(path[i].x-path[i-1].x)*t,y:path[i-1].y+(path[i].y-path[i-1].y)*t};
}
/** Derived from saved head distance/HP, never a second set of enemy entities.
 * Parts still outside the entrance are absent, not stacked at the first point. */
export function wormNodes(enemy: Body, path: readonly Point[]): WormNode[] {
  if(!isWorm(enemy.def.id)||enemy.hp<=0)return [];
  const count=Math.ceil(wormSegments(enemy.def.id)*Math.min(1,enemy.hp/enemy.maxHp)),lengths=cumulative(path),nodes:WormNode[]=[];
  for(let index=0;index<=count+1;index++){
    const d=enemy.distance-(index===0?0:WORM.headSpacing+(index-1)*WORM.spacing);
    if(d<0)continue;
    const p=pointAt(path,lengths,d),a=pointAt(path,lengths,d-5),b=pointAt(path,lengths,d+5);
    nodes.push({...p,index,angle:Math.atan2(b.y-a.y,b.x-a.x),kind:index===0?'head':index===count+1?'tail':'body'});
  }
  return nodes;
}
/** Ordinary enemies retain their exact point targeting. Each worm is hit once. */
export function enemyContact(enemy: Body, from: Point, path: readonly Point[]): Point {
  if(!isWorm(enemy.def.id))return enemy;
  let nearest:Point=enemy,best=Infinity;
  for(const node of wormNodes(enemy,path)){const d=(node.x-from.x)**2+(node.y-from.y)**2;if(d<best){nearest=node;best=d;}}
  return nearest;
}
