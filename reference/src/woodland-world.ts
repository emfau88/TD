import { MAPS, COLS, ROWS, pathCells, waterCells, type GridPoint } from './data';

// Preserve the original route, water geometry, starting budget and twenty waves.
export const WOODLAND_MAP=MAPS[0];
export const WOODLAND_TREES:GridPoint[]=[];
const occupied=new Set<string>(),route=pathCells(WOODLAND_MAP.paths[0]),water=waterCells(WOODLAND_MAP);
function tree(col:number,row:number){
  const key=`${col},${row}`;
  if(occupied.has(key)||route.has(key)||water.has(key)||col<0||col>=COLS||row<0||row>=ROWS)return;
  occupied.add(key);WOODLAND_TREES.push([col,row]);
}
// A wooded boundary with openings at the entrance and the Spire.
for(let col=0;col<COLS;col++){tree(col,0);tree(col,15);if(col%5!==3)tree(col,14);}
for(let row=1;row<15;row++){if(row<6||row>8)tree(0,row);if(row<7||row>9)tree(27,row);}
// Deliberate groves, with the valuable inner bends kept open for towers.
for(const [col,row] of [[1,1],[2,1],[1,2],[2,2],[3,1],[8,1],[9,1],[10,1],[11,1],
  [18,1],[19,1],[18,2],[19,2],[20,1],[24,1],[25,1],[26,1],[25,2],[26,2],
  [6,5],[7,5],[6,6],[7,6],[6,7],[2,10],[2,11],[3,11],[1,12],[2,12],[3,12],
  [5,13],[6,13],[7,13],[8,13],[12,7],[13,7],[12,8],[13,8],
  [19,8],[20,8],[20,9],[21,9],[25,12],[26,12],[26,13],[18,13]] as GridPoint[])tree(col,row);
export const WOODLAND_FLOWERS:GridPoint[]=[[2,4],[7,1],[12,2],[18,4],[22,2],[25,4],[8,8],[14,6],[15,9],[22,7],[25,10],[5,10],[8,12],[12,13],[18,10],[24,13]];
export const WOODLAND_ROCKS:GridPoint[]=[[11,1],[18,3],[25,13],[2,13]];
export const WOODLAND_OBSTACLES=new Set([...WOODLAND_TREES,...WOODLAND_ROCKS,[27,8]].map(([x,y])=>`${x},${y}`));
