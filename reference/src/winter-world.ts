import { COLS, pathCells, waterCells, type GridPoint, type MapDef } from './data';

export const WINTER_MAP:MapDef={id:2,name:'Spiegelwinter',subtitle:'Zwei Anmärsche um den gefrorenen Spiegel.',difficulty:'Zwei Zugänge',seed:97,gold:440,
  paths:[[[-1,3],[5,3],[5,6],[11,6],[11,3],[18,3],[18,8],[28,8]],
    [[-1,12],[6,12],[6,10],[11,10],[11,13],[18,13],[18,8],[28,8]]],
  air:[[-1,8],[8,8],[17,7],[28,8]],water:[[13,6,3,5],[8,1,2,3],[2,8,2,2],[21,2,4,3],[22,11,4,3]]};
const blocked=new Set([...WINTER_MAP.paths.flatMap(p=>[...pathCells(p)]),...waterCells(WINTER_MAP)]);
export const WINTER_TREES:GridPoint[]=[];
const add=(c:number,r:number)=>{if(!blocked.has(`${c},${r}`)&&!WINTER_TREES.some(([x,y])=>x===c&&y===r))WINTER_TREES.push([c,r]);};
for(let c=0;c<COLS;c++){if(c%4!==2)add(c,0);if(c%5!==3)add(c,15);}
for(let r=1;r<15;r++){if(![2,3,4,11,12,13].includes(r))add(0,r);if(r<7||r>9)add(27,r);}
for(const [c,r]of [[1,1],[2,1],[3,1],[6,1],[7,1],[10,1],[12,1],[14,1],[19,1],[20,1],[25,1],[26,1],
  [2,5],[3,6],[1,6],[7,7],[8,7],[8,8],[4,14],[5,14],[8,14],[9,14],[20,14],[21,14],
  [25,6],[26,5],[21,6],[23,14],[26,14],[20,10],[21,10]] as GridPoint[])add(c,r);
export const WINTER_ROCKS:GridPoint[]=[[4,1],[7,4],[1,10],[9,12],[12,5],[16,11],[20,4],[25,10]];
export const WINTER_CRYSTALS:GridPoint[]=[[12,7],[16,9],[7,2],[4,9],[20,3],[24,10],[19,12]];
