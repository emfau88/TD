import { center, type GridPoint, type Point } from './data';

// Same four-neighbour rule as the existing companion controller. M1 only
// exercises selection and movement; abilities/progression remain in M2.
export function previewPath(start: GridPoint, end: GridPoint, walkable: (col:number,row:number)=>boolean): Point[] | undefined {
  if(!walkable(...end))return;
  const key=([x,y]:GridPoint)=>`${x},${y}`,target=key(end),initial=key(start);
  const queue:GridPoint[]=[start],parents=new Map<string,GridPoint|undefined>([[initial,undefined]]);
  for(let index=0;index<queue.length;index++){
    const at=queue[index];
    if(key(at)===target){const path:GridPoint[]=[];let cursor=at;
      while(key(cursor)!==initial){path.push(cursor);cursor=parents.get(key(cursor))!;}
      // Rejoin the current cell centre before turning, including when an order
      // interrupts a step. Otherwise a new route can cut a blocked corner.
      return [start,...path.reverse()].map(center);
    }
    for(const next of [[at[0]-1,at[1]],[at[0]+1,at[1]],[at[0],at[1]-1],[at[0],at[1]+1]] as GridPoint[]){
      if(!parents.has(key(next))&&walkable(...next)){parents.set(key(next),at);queue.push(next);}
    }
  }
}
